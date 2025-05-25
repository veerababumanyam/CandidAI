/**
 * Offscreen Document - Advanced audio processing pipeline
 * Implements Web Audio API with real-time transcription capabilities
 * Leverages MediaStream API for audio capture and processing
 */

import { AudioCapture } from '../ts/services/AudioCapture';
import { SilenceDetector } from '../ts/services/SilenceDetector';
import { SpeechToText } from '../ts/services/SpeechToText';

/**
 * OffscreenAudioProcessor - Main orchestrator for audio processing
 * Implements audio pipeline with silence detection and STT
 */
class OffscreenAudioProcessor {
  constructor() {
    this.audioCapture = new AudioCapture();
    this.silenceDetector = new SilenceDetector();
    this.speechToText = new SpeechToText();

    // Audio processing state
    this.isProcessing = false;
    this.sessionId = null;
    this.audioContext = null;
    this.mediaStream = null;

    // Audio buffer for batch processing
    this.audioBuffer = [];
    this.bufferDuration = 0;
    this.maxBufferDuration = 5000; // 5 seconds

    // Initialize message handlers
    this.initializeMessageHandlers();

    // Audio processing setup complete
    console.log('Audio processing initialized');
  }

  /**
   * Initialize message handlers for service worker communication
   * Implements command pattern for message processing
   */
  initializeMessageHandlers() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('Offscreen received message:', message);

      const { command, sessionId, payload } = message;

      switch (command) {
        case 'START_AUDIO_CAPTURE':
          this.startAudioCapture(sessionId)
            .then((result) => sendResponse({ success: true, data: result }))
            .catch((error) => sendResponse({ success: false, error: error.message }));
          break;

        case 'STOP_AUDIO_CAPTURE':
          this.stopAudioCapture()
            .then(() => sendResponse({ success: true }))
            .catch((error) => sendResponse({ success: false, error: error.message }));
          break;

        case 'UPDATE_SETTINGS':
          this.updateSettings(payload);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown command' });
      }

      return true; // Keep message channel open
    });
  }
  /**
   * Start audio capture and processing pipeline
   * Implements stream processing with Web Audio API
   */
  async startAudioCapture(sessionId) {
    if (this.isProcessing) {
      throw new Error('Audio capture already in progress');
    }

    this.sessionId = sessionId;
    this.isProcessing = true;

    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });

      // Create audio context
      this.audioContext = new AudioContext({ sampleRate: 16000 });

      // Create audio processing nodes
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 2048;

      // Create script processor for audio chunks
      const scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

      // Connect audio graph
      source.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(this.audioContext.destination);

      // Configure silence detector
      this.silenceDetector.initialize(analyser, {
        threshold: 0.01,
        duration: 1500,
        onSilenceStart: () => this.handleSilenceStart(),
        onSilenceEnd: () => this.handleSilenceEnd(),
        onSpeechDetected: () => this.handleSpeechDetected(),
      });

      // Process audio chunks
      scriptProcessor.onaudioprocess = (event) => {
        if (!this.isProcessing) {
          return;
        }

        const inputData = event.inputBuffer.getChannelData(0);
        this.processAudioChunk(inputData);

        // Update silence detector
        this.silenceDetector.analyze();
      };

      // Initialize speech-to-text
      await this.speechToText.initialize({
        continuous: true,
        interimResults: true,
        onResult: (result) => this.handleTranscriptionResult(result),
        onError: (error) => this.handleTranscriptionError(error),
      });

      console.log('Audio capture started successfully');
      return { sessionId, status: 'capturing' };
    } catch (error) {
      this.isProcessing = false;
      console.error('Failed to start audio capture:', error);
      throw error;
    }
  }
  /**
   * Process audio chunk with buffering
   * Implements circular buffer for continuous processing
   */
  processAudioChunk(audioData) {
    // Convert Float32Array to Int16Array for STT
    const int16Data = new Int16Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      const s = Math.max(-1, Math.min(1, audioData[i]));
      int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    // Add to buffer
    this.audioBuffer.push(int16Data);
    this.bufferDuration += (audioData.length / this.audioContext.sampleRate) * 1000;

    // Process buffer if duration threshold reached
    if (this.bufferDuration >= this.maxBufferDuration) {
      this.processBufferedAudio();
    }
  }

  /**
   * Process buffered audio for transcription
   * Implements batch processing for efficiency
   */
  processBufferedAudio() {
    if (this.audioBuffer.length === 0) {
      return;
    }

    // Concatenate audio chunks
    const totalLength = this.audioBuffer.reduce((sum, chunk) => sum + chunk.length, 0);
    const concatenated = new Int16Array(totalLength);

    let offset = 0;
    for (const chunk of this.audioBuffer) {
      concatenated.set(chunk, offset);
      offset += chunk.length;
    }

    // Send to speech-to-text
    this.speechToText.processAudio(concatenated);

    // Clear buffer
    this.audioBuffer = [];
    this.bufferDuration = 0;
  }

  /**
   * Handle transcription results
   * Implements result processing and forwarding
   */
  handleTranscriptionResult(result) {
    const { transcript, confidence, isFinal } = result;

    // Detect if transcript contains a question
    const isQuestion = this.detectQuestion(transcript);

    // Send transcription to service worker
    chrome.runtime.sendMessage({
      command: 'TRANSCRIPTION_UPDATE',
      payload: {
        sessionId: this.sessionId,
        text: transcript,
        confidence,
        isFinal,
        isQuestion,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Detect questions in transcribed text
   * Implements question detection heuristics
   */
  detectQuestion(text) {
    const questionIndicators = [
      /\?$/, // Ends with question mark
      /^(what|when|where|who|why|how|which|could|would|should|can|do|does|is|are)/i,
      /(tell me|describe|explain|share|talk about)/i,
      /(experience|example|time when|situation)/i,
    ];

    return questionIndicators.some((pattern) => pattern.test(text));
  }

  /**
   * Handle silence detection events
   * Implements voice activity detection (VAD)
   */
  handleSilenceStart() {
    // Process any remaining buffered audio
    if (this.audioBuffer.length > 0) {
      this.processBufferedAudio();
    }
  }

  handleSilenceEnd() {
    // Resume active listening
    console.log('Speech resumed');
  }

  handleSpeechDetected() {
    // Track speech activity
    console.log('Speech detected');
  }
  /**
   * Stop audio capture and cleanup resources
   * Implements proper resource disposal
   */
  async stopAudioCapture() {
    this.isProcessing = false;

    // Stop media stream tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
      this.audioContext = null;
    }

    // Stop speech-to-text
    if (this.speechToText) {
      this.speechToText.stop();
    }

    // Clear buffers
    this.audioBuffer = [];
    this.bufferDuration = 0;

    console.log('Audio capture stopped');
  }

  /**
   * Update processing settings dynamically
   * Implements settings hot-reload
   */
  updateSettings(settings) {
    if (settings.silenceThreshold !== undefined) {
      this.silenceDetector.updateThreshold(settings.silenceThreshold);
    }

    if (settings.silenceDuration !== undefined) {
      this.silenceDetector.updateDuration(settings.silenceDuration);
    }

    if (settings.language !== undefined) {
      this.speechToText.updateLanguage(settings.language);
    }

    console.log('Settings updated:', settings);
  }

  /**
   * Handle transcription errors
   * Implements error recovery strategies
   */
  handleTranscriptionError(error) {
    console.error('Transcription error:', error);

    // Send error notification to service worker
    chrome.runtime.sendMessage({
      command: 'TRANSCRIPTION_ERROR',
      payload: {
        sessionId: this.sessionId,
        error: error.message,
        timestamp: Date.now(),
      },
    });

    // Attempt recovery based on error type
    if (error.code === 'network') {
      // Retry with exponential backoff
      setTimeout(() => {
        this.speechToText.reconnect();
      }, 5000);
    }
  }
}

// Initialize offscreen processor
new OffscreenAudioProcessor();

// Log initialization
console.log('CandidAI Offscreen Document initialized');

// Export for testing
export { OffscreenAudioProcessor };

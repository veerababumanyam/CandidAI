/**
 * CandidAI Offscreen Document - Audio Processing Service
 * Handles audio capture and processing in the background
 */

import { MessageBroker } from '../ts/utils/messaging';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface AudioProcessingState {
  isRecording: boolean;
  mediaRecorder: MediaRecorder | null;
  audioStream: MediaStream | null;
  audioChunks: Blob[];
}

// =============================================================================
// OFFSCREEN CONTROLLER
// =============================================================================

/**
 * Offscreen Document Controller - Manages audio processing
 */
class OffscreenController {
  private messageBroker: MessageBroker;
  private audioState: AudioProcessingState;

  constructor() {
    this.messageBroker = new MessageBroker();
    
    this.audioState = {
      isRecording: false,
      mediaRecorder: null,
      audioStream: null,
      audioChunks: [],
    };

    this.initializeMessageHandlers();
  }

  /**
   * Initialize message handlers for offscreen document
   */
  private initializeMessageHandlers(): void {
    this.messageBroker.registerHandler('START_AUDIO_CAPTURE', this.startAudioCapture.bind(this));
    this.messageBroker.registerHandler('STOP_AUDIO_CAPTURE', this.stopAudioCapture.bind(this));
    this.messageBroker.registerHandler('PING', this.handlePing.bind(this));
  }

  /**
   * Start audio capture
   */
  private async startAudioCapture(request: any, sender: any, sendResponse: (response: any) => void): Promise<void> {
    try {
      if (this.audioState.isRecording) {
        sendResponse({ success: false, error: 'Already recording' });
        return;
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.audioState.audioStream = stream;
      this.audioState.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      this.audioState.audioChunks = [];

      // Set up event handlers
      this.audioState.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioState.audioChunks.push(event.data);
        }
      };

      this.audioState.mediaRecorder.onstop = () => {
        this.processAudioData();
      };

      this.audioState.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.stopAudioCapture(null, null, () => {});
      };

      // Start recording
      this.audioState.mediaRecorder.start(1000); // Collect data every second
      this.audioState.isRecording = true;

      sendResponse({ success: true, message: 'Audio capture started' });

    } catch (error) {
      console.error('Failed to start audio capture:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to start audio capture'
      });
    }
  }

  /**
   * Stop audio capture
   */
  private stopAudioCapture(request: any, sender: any, sendResponse: (response: any) => void): void {
    try {
      if (!this.audioState.isRecording) {
        sendResponse({ success: false, error: 'Not recording' });
        return;
      }

      // Stop recording
      if (this.audioState.mediaRecorder && this.audioState.mediaRecorder.state !== 'inactive') {
        this.audioState.mediaRecorder.stop();
      }

      // Stop all audio tracks
      if (this.audioState.audioStream) {
        this.audioState.audioStream.getTracks().forEach(track => track.stop());
        this.audioState.audioStream = null;
      }

      this.audioState.isRecording = false;
      this.audioState.mediaRecorder = null;

      sendResponse({ success: true, message: 'Audio capture stopped' });

    } catch (error) {
      console.error('Failed to stop audio capture:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to stop audio capture'
      });
    }
  }

  /**
   * Process captured audio data
   */
  private async processAudioData(): Promise<void> {
    try {
      if (this.audioState.audioChunks.length === 0) {
        return;
      }

      const audioBlob = new Blob(this.audioState.audioChunks, { type: 'audio/webm' });
      
      // Convert to ArrayBuffer for processing
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Send audio data to service worker for transcription
      await this.messageBroker.sendMessage({
        command: 'PROCESS_AUDIO_DATA',
        payload: {
          audioData: Array.from(new Uint8Array(arrayBuffer)),
          timestamp: Date.now(),
          mimeType: 'audio/webm',
        },
      });

      // Clear audio chunks
      this.audioState.audioChunks = [];

    } catch (error) {
      console.error('Failed to process audio data:', error);
    }
  }

  /**
   * Handle ping requests
   */
  private handlePing(request: any, sender: any, sendResponse: (response: any) => void): void {
    sendResponse({ 
      success: true, 
      message: 'Offscreen document is active',
      timestamp: Date.now(),
    });
  }

  /**
   * Initialize the offscreen document
   */
  public initialize(): void {
    console.log('CandidAI Offscreen document initialized');
    
    // Notify service worker that offscreen document is ready
    this.messageBroker.sendMessage({
      command: 'OFFSCREEN_READY',
      payload: { timestamp: Date.now() },
    }).catch(error => {
      console.error('Failed to notify service worker:', error);
    });
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const controller = new OffscreenController();
    controller.initialize();
  });
} else {
  const controller = new OffscreenController();
  controller.initialize();
} 
/**
 * AudioCapture - Advanced audio capture and processing service
 * Implements Web Audio API for real-time audio streaming
 * Provides audio visualization and processing capabilities
 */

/**
 * AudioCapture - Manages microphone access and audio processing
 * Implements audio pipeline with configurable processing nodes
 */
export class AudioCapture {
  constructor() {
    // Audio context and nodes
    this.audioContext = null;
    this.mediaStream = null;
    this.sourceNode = null;
    this.analyserNode = null;
    this.processorNode = null;

    // Audio configuration
    this.config = {
      sampleRate: 16000,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      bufferSize: 4096,
    };

    // Processing state
    this.isCapturing = false;
    this.isPaused = false;

    // Audio data buffers
    this.audioBuffer = [];
    this.bufferDuration = 0;

    // Callbacks
    this.onAudioData = null;
    this.onVisualizationData = null;
    this.onError = null;

    // Performance monitoring
    this.stats = {
      capturedSamples: 0,
      droppedFrames: 0,
      averageLevel: 0,
    };
  }

  /**
   * Initialize audio capture with user permissions
   * Implements getUserMedia with constraints
   */
  async initialize(options = {}) {
    // Merge options with defaults
    Object.assign(this.config, options);

    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: this.config.channelCount,
          sampleRate: this.config.sampleRate,
          echoCancellation: this.config.echoCancellation,
          noiseSuppression: this.config.noiseSuppression,
          autoGainControl: this.config.autoGainControl,
        },
      });

      // Create audio context
      const AudioContextClass = window.AudioContext || window['webkitAudioContext'];
      this.audioContext = new AudioContextClass();

      // Set up audio processing pipeline
      this.setupAudioPipeline();

      return true;
    } catch (error) {
      console.error('Failed to initialize audio capture:', error);
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Set up audio processing pipeline
   * Creates and connects audio nodes
   */
  setupAudioPipeline() {
    // Create source from media stream
    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

    // Create analyser for visualization
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // Create script processor for audio data access
    this.processorNode = this.audioContext.createScriptProcessor(
      this.config.bufferSize,
      this.config.channelCount,
      this.config.channelCount
    );

    // Set up processor callback
    this.processorNode.onaudioprocess = this.processAudioData.bind(this);

    // Connect nodes
    this.sourceNode.connect(this.analyserNode);
    this.analyserNode.connect(this.processorNode);
    this.processorNode.connect(this.audioContext.destination);
  }

  /**
   * Process audio data from script processor
   * Implements audio buffer management
   */
  processAudioData(event) {
    if (!this.isCapturing || this.isPaused) {
      return;
    }

    const inputBuffer = event.inputBuffer;
    const channelData = inputBuffer.getChannelData(0);

    // Clone audio data
    const audioData = new Float32Array(channelData);

    // Update statistics
    this.updateStatistics(audioData);

    // Add to buffer
    this.audioBuffer.push(audioData);
    this.bufferDuration += inputBuffer.duration * 1000; // Convert to ms

    // Invoke callback with audio data
    if (this.onAudioData) {
      this.onAudioData({
        data: audioData,
        sampleRate: inputBuffer.sampleRate,
        duration: inputBuffer.duration,
        timestamp: Date.now(),
      });
    }

    // Generate visualization data
    if (this.onVisualizationData) {
      this.generateVisualizationData();
    }
  }

  /**
   * Generate visualization data from analyser
   * Provides frequency and time domain data
   */
  generateVisualizationData() {
    const bufferLength = this.analyserNode.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    this.analyserNode.getByteFrequencyData(frequencyData);
    this.analyserNode.getByteTimeDomainData(timeData);

    if (this.onVisualizationData) {
      this.onVisualizationData({
        frequency: frequencyData,
        time: timeData,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Update audio statistics
   * Monitors audio levels and quality
   */
  updateStatistics(audioData) {
    this.stats.capturedSamples += audioData.length;

    // Calculate RMS level
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    const rms = Math.sqrt(sum / audioData.length);

    // Update average level (exponential moving average)
    this.stats.averageLevel = 0.95 * this.stats.averageLevel + 0.05 * rms;

    // Detect clipping
    const maxValue = Math.max(...audioData.map(Math.abs));
    if (maxValue >= 0.99) {
      this.stats.droppedFrames++;
    }
  }

  /**
   * Start audio capture
   */
  start() {
    if (this.isCapturing) {
      console.warn('Audio capture already active');
      return;
    }

    if (!this.audioContext) {
      throw new Error('Audio not initialized');
    }

    this.isCapturing = true;
    this.isPaused = false;

    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    console.log('Audio capture started');
  }

  /**
   * Stop audio capture
   */
  stop() {
    if (!this.isCapturing) {
      return;
    }

    this.isCapturing = false;

    // Stop all tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }

    // Disconnect nodes
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }
    if (this.processorNode) {
      this.processorNode.disconnect();
    }

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    // Clear buffers
    this.audioBuffer = [];
    this.bufferDuration = 0;

    console.log('Audio capture stopped');
  }

  /**
   * Pause audio capture
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume audio capture
   */
  resume() {
    this.isPaused = false;
  }

  /**
   * Get buffered audio data
   * Returns concatenated audio buffer
   */
  getBufferedAudio() {
    if (this.audioBuffer.length === 0) {
      return null;
    }

    // Calculate total length
    const totalLength = this.audioBuffer.reduce((sum, buffer) => sum + buffer.length, 0);

    // Concatenate buffers
    const concatenated = new Float32Array(totalLength);
    let offset = 0;

    for (const buffer of this.audioBuffer) {
      concatenated.set(buffer, offset);
      offset += buffer.length;
    }

    return {
      data: concatenated,
      duration: this.bufferDuration,
      sampleRate: this.config.sampleRate,
    };
  }

  /**
   * Clear audio buffer
   */
  clearBuffer() {
    this.audioBuffer = [];
    this.bufferDuration = 0;
  }

  /**
   * Apply audio filters
   * Dynamically adds processing nodes
   */
  applyFilter(filterType, options = {}) {
    if (!this.audioContext) {
      return;
    }

    let filterNode;

    switch (filterType) {
      case 'lowpass':
        filterNode = this.audioContext.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.value = options.frequency || 3000;
        break;

      case 'highpass':
        filterNode = this.audioContext.createBiquadFilter();
        filterNode.type = 'highpass';
        filterNode.frequency.value = options.frequency || 100;
        break;

      case 'bandpass':
        filterNode = this.audioContext.createBiquadFilter();
        filterNode.type = 'bandpass';
        filterNode.frequency.value = options.frequency || 1000;
        filterNode.Q.value = options.Q || 1;
        break;

      case 'gain':
        filterNode = this.audioContext.createGain();
        filterNode.gain.value = options.gain || 1;
        break;

      default:
        console.warn('Unknown filter type:', filterType);
        return;
    }

    // Insert filter into pipeline
    this.sourceNode.disconnect();
    this.sourceNode.connect(filterNode);
    filterNode.connect(this.analyserNode);
  }

  /**
   * Get audio level in decibels
   */
  getAudioLevel() {
    if (!this.analyserNode) {
      return -Infinity;
    }

    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyserNode.getByteFrequencyData(dataArray);

    // Calculate average level
    const average = dataArray.reduce((a, b) => a + b) / bufferLength;

    // Convert to decibels
    return 20 * Math.log10(average / 255);
  }

  /**
   * Get audio statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      isCapturing: this.isCapturing,
      isPaused: this.isPaused,
      bufferSize: this.audioBuffer.length,
      bufferDuration: this.bufferDuration,
    };
  }

  /**
   * Handle errors
   */
  handleError(error) {
    let message = 'Audio capture error';

    if (error.name === 'NotAllowedError') {
      message = 'Microphone access denied';
    } else if (error.name === 'NotFoundError') {
      message = 'No microphone found';
    } else if (error.name === 'NotReadableError') {
      message = 'Microphone is already in use';
    }

    const errorData = {
      error: error.name,
      message,
      timestamp: Date.now(),
    };

    if (this.onError) {
      this.onError(errorData);
    }

    return errorData;
  }
}

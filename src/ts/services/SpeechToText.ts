/**
 * SpeechToText - Advanced Speech Recognition Service
 * Implements Web Speech API with intelligent fallback to external services
 * Provides continuous transcription with enhanced error handling and language detection
 */

import type {
  SpeechToTextResult,
  AudioConfig,
  TranscriptResult,
  TranscriptBuffer,
} from '../types/index';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

interface SpeechRecognitionConfig {
  readonly continuous: boolean;
  readonly interimResults: boolean;
  readonly language: string;
  readonly maxAlternatives: number;
  readonly silenceTimeout: number;
  readonly confidenceThreshold: number;
}

interface SpeechRecognitionCallbacks {
  onResult?: (result: TranscriptResult) => void;
  onError?: (error: SpeechRecognitionError) => void;
  onEnd?: () => void;
  onStart?: () => void;
  onLanguageDetected?: (language: string, confidence: number) => void;
}

interface SpeechRecognitionError {
  readonly error: string;
  readonly message: string;
  readonly timestamp: number;
  readonly recoverable: boolean;
}

interface SpeechStatistics {
  readonly totalSessions: number;
  readonly totalDuration: number;
  readonly averageConfidence: number;
  readonly errorCount: number;
  readonly reconnectionCount: number;
  readonly lastSessionDuration: number;
}

// =============================================================================
// SPEECH TO TEXT SERVICE
// =============================================================================

export class SpeechToText {
  private readonly config: SpeechRecognitionConfig;
  private readonly callbacks: SpeechRecognitionCallbacks;
  private readonly performanceAnalyzer?: any; // TODO: Import proper PerformanceAnalyzer class

  // Speech Recognition
  private recognition: SpeechRecognition | null = null;
  private readonly webSpeechAvailable: boolean;
  
  // State Management
  private isListening: boolean = false;
  private isInitialized: boolean = false;
  private currentSessionId: string | null = null;
  private reconnectAttempts: number = 0;
  
  // Buffers & History
  private readonly transcriptBuffer: TranscriptBuffer[] = [];
  private lastTranscriptTime: number = 0;
  private sessionStartTime: number = 0;
  
  // Statistics
  private statistics: SpeechStatistics = {
    totalSessions: 0,
    totalDuration: 0,
    averageConfidence: 0,
    errorCount: 0,
    reconnectionCount: 0,
    lastSessionDuration: 0
  };

  // Constants
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY_BASE = 1000; // 1 second base delay
  private readonly SILENCE_TIMEOUT = 5000; // 5 seconds
  private readonly TRANSCRIPT_BUFFER_LIMIT = 1000;

  constructor(
    config: Partial<SpeechRecognitionConfig> = {},
    callbacks: SpeechRecognitionCallbacks = {},
    performanceAnalyzer?: any
  ) {
    // Initialize configuration with defaults
    this.config = {
      continuous: true,
      interimResults: true,
      language: 'en-US',
      maxAlternatives: 3,
      silenceTimeout: this.SILENCE_TIMEOUT,
      confidenceThreshold: 0.7,
      ...config
    };

    this.callbacks = callbacks;
    this.performanceAnalyzer = performanceAnalyzer;

    // Check for Web Speech API support
    this.webSpeechAvailable = this.checkWebSpeechSupport();

    console.log(`SpeechToText initialized with ${this.webSpeechAvailable ? 'Web Speech API' : 'fallback service'}`);
  }

  // =============================================================================
  // INITIALIZATION METHODS
  // =============================================================================

  /**
   * Initialize speech recognition service
   * Sets up Web Speech API or configures fallback service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('SpeechToText already initialized');
      return;
    }

    try {
      if (this.webSpeechAvailable) {
        await this.initializeWebSpeechAPI();
      } else {
        await this.initializeFallbackService();
      }

      this.isInitialized = true;
      console.log('SpeechToText service initialized successfully');

      // Log initialization event
      if (this.performanceAnalyzer) {
        this.performanceAnalyzer.logEvent('speech_to_text_initialized', {
          service: this.webSpeechAvailable ? 'web_speech_api' : 'fallback',
          language: this.config.language
        });
      }

    } catch (error) {
      console.error('Failed to initialize SpeechToText:', error);
      throw new Error(`SpeechToText initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initialize Web Speech API
   * Creates and configures SpeechRecognition instance
   */
  private async initializeWebSpeechAPI(): Promise<void> {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Web Speech API not available');
    }

    this.recognition = new SpeechRecognition();

    // Configure recognition parameters
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.lang = this.config.language;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    // Set up comprehensive event handlers
    this.setupWebSpeechEventHandlers();

    console.log('Web Speech API initialized with configuration:', this.config);
  }

  /**
   * Initialize fallback speech-to-text service
   * Sets up external STT service when Web Speech API is unavailable
   */
  private async initializeFallbackService(): Promise<void> {
    console.warn('Web Speech API not available, initializing fallback service');
    
    // Here you would initialize external STT service
    // For example: Google Cloud Speech-to-Text, Azure Speech Services, etc.
    // This is a placeholder implementation
    
    throw new Error('Fallback STT service not yet implemented');
  }

  // =============================================================================
  // WEB SPEECH API EVENT HANDLING
  // =============================================================================

  /**
   * Set up comprehensive event handlers for Web Speech API
   */
  private setupWebSpeechEventHandlers(): void {
    if (!this.recognition) return;

    // Result event - process transcription results
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.handleSpeechResult(event);
    };

    // Error event - comprehensive error handling
    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.handleSpeechError(event);
    };

    // End event - handle recognition session end
    this.recognition.onend = () => {
      this.handleSpeechEnd();
    };

    // Start event - handle recognition session start
    this.recognition.onstart = () => {
      this.handleSpeechStart();
    };

    // No match event
    this.recognition.onnomatch = () => {
      console.log('No speech match detected');
      this.logEvent('no_speech_match');
    };

    // Audio events
    this.recognition.onaudiostart = () => {
      console.log('Audio capture started');
      this.logEvent('audio_capture_started');
    };

    this.recognition.onaudioend = () => {
      console.log('Audio capture ended');
      this.logEvent('audio_capture_ended');
    };

    // Speech events
    this.recognition.onspeechstart = () => {
      console.log('Speech detected');
      this.logEvent('speech_detected');
    };

    this.recognition.onspeechend = () => {
      console.log('Speech ended');
      this.logEvent('speech_ended');
    };
  }

  /**
   * Handle speech recognition results with enhanced processing
   */
  private handleSpeechResult(event: SpeechRecognitionEvent): void {
    try {
      const results = event.results;
      const resultIndex = event.resultIndex;

      // Process each new result
      for (let i = resultIndex; i < results.length; i++) {
        const result = results[i];
        if (!result || result.length === 0) continue;
        
        const firstAlternative = result[0];
        if (!firstAlternative) continue;
        
        const transcript = firstAlternative.transcript?.trim() || '';
        const confidence = firstAlternative.confidence || 0.5;
        const isFinal = result.isFinal;

        // Skip empty transcripts
        if (!transcript) continue;

        // Extract alternatives safely
        const alternatives: string[] = [];
        for (let j = 1; j < Math.min(result.length, this.config.maxAlternatives); j++) {
          const alt = result[j];
          if (alt?.transcript) {
            const altText = alt.transcript.trim();
            if (altText.length > 0) {
              alternatives.push(altText);
            }
          }
        }

        const transcriptResult: TranscriptResult = {
          text: transcript,
          confidence,
          isFinal,
          timestamp: Date.now(),
          alternatives: alternatives.length > 0 ? alternatives as readonly string[] : [],
        };

        // Store final results in buffer
        if (isFinal && confidence >= this.config.confidenceThreshold) {
          this.addToTranscriptBuffer({
            text: transcript,
            confidence,
            timestamp: Date.now(),
            sessionId: this.currentSessionId || '',
          });
        }

        // Invoke result callback
        if (this.callbacks.onResult) {
          this.callbacks.onResult(transcriptResult);
        }

        // Update statistics
        this.updateStatistics(confidence, isFinal);
        this.lastTranscriptTime = Date.now();

        // Log high-confidence final results
        if (isFinal && confidence >= 0.8) {
          this.logEvent('high_confidence_transcript', {
            length: transcript.length,
            confidence,
            hasAlternatives: alternatives.length > 0
          });
        }
      }

    } catch (error) {
      console.error('Error processing speech result:', error);
      this.handleError('processing_error', 'Failed to process speech result');
    }
  }

  /**
   * Handle speech recognition errors with recovery strategies
   */
  private handleSpeechError(event: SpeechRecognitionErrorEvent): void {
    console.error('Speech recognition error:', event.error);

    const errorInfo: SpeechRecognitionError = {
      error: event.error,
      message: this.getErrorMessage(event.error),
      timestamp: Date.now(),
      recoverable: this.isRecoverableError(event.error)
    };

    // Update statistics
    this.statistics = {
      ...this.statistics,
      errorCount: this.statistics.errorCount + 1
    };

    // Invoke error callback
    if (this.callbacks.onError) {
      this.callbacks.onError(errorInfo);
    }

    // Log error
    this.logEvent('speech_recognition_error', {
      error: event.error,
      recoverable: errorInfo.recoverable,
      attempt: this.reconnectAttempts
    });

    // Attempt recovery for recoverable errors
    if (errorInfo.recoverable && this.isListening) {
      this.attemptRecovery();
    }
  }

  /**
   * Handle speech recognition session end
   */
  private handleSpeechEnd(): void {
    console.log('Speech recognition session ended');
    
    this.isListening = false;
    
    // Calculate session duration
    if (this.sessionStartTime > 0) {
      const duration = Date.now() - this.sessionStartTime;
      this.statistics = {
        ...this.statistics,
        lastSessionDuration: duration,
        totalDuration: this.statistics.totalDuration + duration
      };
    }

    // Invoke end callback
    if (this.callbacks.onEnd) {
      this.callbacks.onEnd();
    }

    // Auto-restart if supposed to be continuous
    if (this.config.continuous && this.isInitialized) {
      setTimeout(() => {
        if (!this.isListening) {
          this.attemptRecovery();
        }
      }, 100);
    }

    this.logEvent('speech_session_ended', {
      duration: this.statistics.lastSessionDuration,
      transcriptCount: this.transcriptBuffer.length
    });
  }

  /**
   * Handle speech recognition session start
   */
  private handleSpeechStart(): void {
    console.log('Speech recognition session started');
    
    this.isListening = true;
    this.sessionStartTime = Date.now();
    this.currentSessionId = this.generateSessionId();
    this.reconnectAttempts = 0;

    // Update statistics
    this.statistics = {
      ...this.statistics,
      totalSessions: this.statistics.totalSessions + 1
    };

    // Invoke start callback
    if (this.callbacks.onStart) {
      this.callbacks.onStart();
    }

    this.logEvent('speech_session_started', {
      sessionId: this.currentSessionId,
      language: this.config.language
    });
  }

  // =============================================================================
  // PUBLIC API METHODS
  // =============================================================================

  /**
   * Start speech recognition
   */
  async start(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('SpeechToText not initialized. Call initialize() first.');
    }

    if (this.isListening) {
      console.warn('Speech recognition already active');
      return;
    }

    try {
      if (this.recognition) {
        this.recognition.start();
      } else {
        await this.startFallbackService();
      }

      this.logEvent('speech_recognition_start_requested');

    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      this.handleError('start_failed', `Failed to start: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Stop speech recognition
   */
  stop(): void {
    if (!this.isListening) {
      console.warn('Speech recognition not active');
      return;
    }

    try {
      if (this.recognition) {
        this.recognition.stop();
      } else {
        this.stopFallbackService();
      }

      this.logEvent('speech_recognition_stop_requested');

    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
      this.handleError('stop_failed', `Failed to stop: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update recognition language
   */
  updateLanguage(language: string): void {
    if (this.config.language === language) {
      return;
    }

    const wasListening = this.isListening;
    
    if (wasListening) {
      this.stop();
    }

    // Update configuration
    (this.config as any).language = language;

    // Update recognition instance
    if (this.recognition) {
      this.recognition.lang = language;
    }

    this.logEvent('language_updated', { 
      from: this.config.language,
      to: language 
    });

    // Restart if was listening
    if (wasListening) {
      setTimeout(() => {
        void this.start();
      }, 100);
    }
  }

  /**
   * Get transcript history
   */
  getTranscriptHistory(): readonly TranscriptBuffer[] {
    return [...this.transcriptBuffer];
  }

  /**
   * Clear transcript history
   */
  clearTranscripts(): void {
    this.transcriptBuffer.length = 0;
    this.logEvent('transcript_history_cleared');
  }

  /**
   * Get recognition statistics
   */
  getStatistics(): SpeechStatistics {
    return { ...this.statistics };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SpeechRecognitionConfig>): void {
    const wasListening = this.isListening;
    
    if (wasListening) {
      this.stop();
    }

    // Update configuration
    Object.assign(this.config, newConfig);

    // Update recognition instance if available
    if (this.recognition) {
      this.recognition.continuous = this.config.continuous;
      this.recognition.interimResults = this.config.interimResults;
      this.recognition.lang = this.config.language;
      this.recognition.maxAlternatives = this.config.maxAlternatives;
    }

    this.logEvent('config_updated', newConfig);

    // Restart if was listening
    if (wasListening) {
      setTimeout(() => {
        void this.start();
      }, 100);
    }
  }

  // =============================================================================
  // UTILITY & HELPER METHODS
  // =============================================================================

  /**
   * Check if Web Speech API is supported
   */
  private checkWebSpeechSupport(): boolean {
    return typeof window !== 'undefined' && 
           ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `stt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add transcript to buffer with limit management
   */
  private addToTranscriptBuffer(transcript: TranscriptBuffer): void {
    this.transcriptBuffer.push(transcript);

    // Maintain buffer size limit
    if (this.transcriptBuffer.length > this.TRANSCRIPT_BUFFER_LIMIT) {
      this.transcriptBuffer.splice(0, this.transcriptBuffer.length - this.TRANSCRIPT_BUFFER_LIMIT);
    }
  }

  /**
   * Update recognition statistics
   */
  private updateStatistics(confidence: number, isFinal: boolean): void {
    if (!isFinal) return;

    const currentAvg = this.statistics.averageConfidence;
    const count = this.statistics.totalSessions;
    
    this.statistics = {
      ...this.statistics,
      averageConfidence: (currentAvg * count + confidence) / (count + 1)
    };
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      'network': 'Network connection error. Please check your internet connection.',
      'no-speech': 'No speech was detected. Please speak clearly into your microphone.',
      'audio-capture': 'Unable to access microphone. Please check permissions and device.',
      'not-allowed': 'Microphone access denied. Please grant permission to continue.',
      'aborted': 'Speech recognition was interrupted.',
      'language-not-supported': `Language '${this.config.language}' is not supported.`,
      'service-not-allowed': 'Speech recognition service is not allowed.',
      'bad-grammar': 'Recognition grammar error occurred.'
    };

    return errorMessages[error] || `Recognition error: ${error}`;
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverableError(error: string): boolean {
    const recoverableErrors = ['network', 'aborted', 'audio-capture'];
    return recoverableErrors.includes(error);
  }

  /**
   * Attempt error recovery with exponential backoff
   */
  private attemptRecovery(): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error('Maximum reconnection attempts reached');
      this.handleError('max_reconnect_reached', 'Failed to recover after maximum attempts');
      return;
    }

    this.reconnectAttempts++;
    this.statistics = {
      ...this.statistics,
      reconnectionCount: this.statistics.reconnectionCount + 1
    };

    const delay = this.RECONNECT_DELAY_BASE * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting recovery in ${delay}ms (attempt ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);

    setTimeout(() => {
      if (!this.isListening && this.isInitialized) {
        void this.start().catch(error => {
          console.error('Recovery attempt failed:', error);
        });
      }
    }, delay);

    this.logEvent('recovery_attempted', {
      attempt: this.reconnectAttempts,
      delay
    });
  }

  /**
   * Handle errors with consistent logging
   */
  private handleError(type: string, message: string): void {
    const error: SpeechRecognitionError = {
      error: type,
      message,
      timestamp: Date.now(),
      recoverable: this.isRecoverableError(type)
    };

    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }

    this.logEvent('speech_to_text_error', { type, message });
  }

  /**
   * Log events to performance analyzer
   */
  private logEvent(eventType: string, data?: Record<string, any>): void {
    if (this.performanceAnalyzer) {
      this.performanceAnalyzer.logEvent(eventType, {
        sessionId: this.currentSessionId,
        timestamp: Date.now(),
        ...data
      });
    }
  }

  // =============================================================================
  // FALLBACK SERVICE METHODS (PLACEHOLDER)
  // =============================================================================

  private async startFallbackService(): Promise<void> {
    throw new Error('Fallback STT service not implemented');
  }

  private stopFallbackService(): void {
    // Placeholder for fallback service stop
  }

  /**
   * Cleanup resources and stop recognition
   */
  dispose(): void {
    if (this.isListening) {
      this.stop();
    }

    this.recognition = null;
    this.isInitialized = false;
    this.clearTranscripts();

    this.logEvent('speech_to_text_disposed');
  }
} 
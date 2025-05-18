/**
 * CandidAI - Audio Injection Service
 * EXPERIMENTAL: Provides direct audio injection functionality
 * 
 * IMPORTANT SAFETY NOTES:
 * - This is an experimental feature with significant ethical considerations
 * - It requires explicit user consent and multiple safeguards
 * - It should only be used in appropriate contexts with full transparency
 * - Audio injection should never be used to deceive or manipulate
 */

/**
 * Audio Injection Service class
 * Handles experimental direct audio injection
 */
class AudioInjectionService {
  constructor() {
    this.initialized = false;
    this.audioContext = null;
    this.mediaStreamDestination = null;
    this.audioSource = null;
    this.gainNode = null;
    this.analyser = null;
    this.injecting = false;
    this.safeguards = {
      enabled: false,
      userConsent: false,
      warningShown: false,
      maxDuration: 60, // seconds
      maxVolume: 0.7, // 0-1 scale
      requiresExplicitActivation: true,
      visualIndicatorRequired: true,
      autoDisableAfterUse: true,
      disableOnPageNavigation: true,
      disableOnTabChange: true,
      disableOnWindowBlur: true,
      disableOnError: true,
      disableOnTimeout: true,
      timeoutDuration: 60000, // ms
      timeoutTimer: null,
      activeTimestamp: null
    };
    this.onStartCallbacks = [];
    this.onStopCallbacks = [];
    this.onErrorCallbacks = [];
    this.onWarningCallbacks = [];
  }

  /**
   * Initialize the audio injection service
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }

    try {
      // Load settings from storage
      await this.loadSettings();

      // Check if audio injection is enabled
      if (!this.safeguards.enabled) {
        console.log('Audio injection is disabled');
        return false;
      }

      // Check if user has given consent
      if (!this.safeguards.userConsent) {
        console.log('User consent for audio injection not given');
        return false;
      }

      // Show warning if not already shown
      if (!this.safeguards.warningShown) {
        this.showWarning();
        return false;
      }

      // Initialize audio context
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.mediaStreamDestination = this.audioContext.createMediaStreamDestination();
        this.gainNode = this.audioContext.createGain();
        this.analyser = this.audioContext.createAnalyser();
        
        // Connect nodes
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.mediaStreamDestination);
        
        // Set gain to safe level
        this.gainNode.gain.value = Math.min(this.safeguards.maxVolume, 0.5);
      } catch (error) {
        console.error('Audio context initialization failed:', error);
        this.triggerError('Audio context initialization failed: ' + error.message);
        return false;
      }

      // Set up event listeners for safeguards
      if (this.safeguards.disableOnPageNavigation) {
        window.addEventListener('beforeunload', () => this.disable());
      }
      
      if (this.safeguards.disableOnTabChange) {
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            this.stop();
          }
        });
      }
      
      if (this.safeguards.disableOnWindowBlur) {
        window.addEventListener('blur', () => this.stop());
      }

      this.initialized = true;
      console.log('Audio injection service initialized with safeguards');
      return true;
    } catch (error) {
      console.error('Error initializing audio injection service:', error);
      this.triggerError('Initialization error: ' + error.message);
      return false;
    }
  }

  /**
   * Load audio injection settings from storage
   * @private
   */
  async loadSettings() {
    try {
      const { default: StorageUtil } = await import('../utils/storage.js');
      const settings = await StorageUtil.get('audioInjectionSettings');

      if (settings) {
        this.safeguards.enabled = settings.enabled || false;
        this.safeguards.userConsent = settings.userConsent || false;
        this.safeguards.warningShown = settings.warningShown || false;
        this.safeguards.maxDuration = settings.maxDuration || 60;
        this.safeguards.maxVolume = Math.min(settings.maxVolume || 0.7, 0.7);
        this.safeguards.requiresExplicitActivation = settings.requiresExplicitActivation !== false;
        this.safeguards.visualIndicatorRequired = settings.visualIndicatorRequired !== false;
      }
    } catch (error) {
      console.error('Error loading audio injection settings:', error);
    }
  }

  /**
   * Save audio injection settings to storage
   * @private
   */
  async saveSettings() {
    try {
      const { default: StorageUtil } = await import('../utils/storage.js');
      await StorageUtil.set({
        audioInjectionSettings: {
          enabled: this.safeguards.enabled,
          userConsent: this.safeguards.userConsent,
          warningShown: this.safeguards.warningShown,
          maxDuration: this.safeguards.maxDuration,
          maxVolume: this.safeguards.maxVolume,
          requiresExplicitActivation: this.safeguards.requiresExplicitActivation,
          visualIndicatorRequired: this.safeguards.visualIndicatorRequired
        }
      });
    } catch (error) {
      console.error('Error saving audio injection settings:', error);
    }
  }

  /**
   * Show warning about audio injection
   * @private
   */
  showWarning() {
    const warningMessage = `
      WARNING: Audio Injection Feature
      
      This feature allows the extension to inject audio directly into your microphone stream.
      This is an experimental feature with significant ethical considerations.
      
      Important notes:
      - This should only be used in appropriate contexts (e.g., practice interviews)
      - Never use this to deceive or manipulate others
      - A visual indicator will always be shown when this feature is active
      - The feature will automatically disable after use
      
      Do you understand and consent to using this feature?
    `;
    
    this.onWarningCallbacks.forEach(callback => callback(warningMessage));
  }

  /**
   * Enable audio injection with user consent
   * @param {boolean} consent - Whether user has given consent
   * @returns {Promise<boolean>} - Whether enabling was successful
   */
  async enable(consent) {
    if (consent) {
      this.safeguards.userConsent = true;
      this.safeguards.warningShown = true;
      this.safeguards.enabled = true;
      await this.saveSettings();
      return this.initialize();
    } else {
      console.log('User declined audio injection consent');
      this.safeguards.userConsent = false;
      this.safeguards.enabled = false;
      await this.saveSettings();
      return false;
    }
  }

  /**
   * Disable audio injection
   */
  async disable() {
    this.stop();
    this.safeguards.enabled = false;
    await this.saveSettings();
    console.log('Audio injection disabled');
  }

  /**
   * Start audio injection with the given audio source
   * @param {AudioBuffer|MediaStream} source - Audio source
   * @returns {Promise<MediaStream>} - Media stream with injected audio
   */
  async start(source) {
    if (!this.initialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Audio injection service not initialized');
      }
    }

    // Stop any existing injection
    this.stop();

    try {
      // Create source node
      if (source instanceof AudioBuffer) {
        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.buffer = source;
      } else if (source instanceof MediaStream) {
        this.audioSource = this.audioContext.createMediaStreamSource(source);
      } else {
        throw new Error('Invalid audio source');
      }

      // Connect source to gain node
      this.audioSource.connect(this.gainNode);

      // Start audio source if it's a buffer source
      if (source instanceof AudioBuffer) {
        this.audioSource.start();
        
        // Set timeout to stop after max duration
        setTimeout(() => {
          if (this.injecting) {
            this.stop();
          }
        }, Math.min(source.duration * 1000, this.safeguards.maxDuration * 1000));
      }

      // Set active state
      this.injecting = true;
      this.safeguards.activeTimestamp = Date.now();
      
      // Set timeout for safety
      this.safeguards.timeoutTimer = setTimeout(() => {
        if (this.injecting) {
          this.stop();
          this.triggerError('Audio injection timed out for safety');
        }
      }, this.safeguards.timeoutDuration);

      // Trigger start callbacks
      this.onStartCallbacks.forEach(callback => callback());

      return this.mediaStreamDestination.stream;
    } catch (error) {
      console.error('Error starting audio injection:', error);
      this.triggerError('Start error: ' + error.message);
      throw error;
    }
  }

  /**
   * Stop audio injection
   */
  stop() {
    if (this.injecting) {
      try {
        // Stop audio source if it's a buffer source
        if (this.audioSource && this.audioSource.stop) {
          this.audioSource.stop();
        }
        
        // Disconnect audio source
        if (this.audioSource && this.audioSource.disconnect) {
          this.audioSource.disconnect();
        }
        
        // Clear timeout
        if (this.safeguards.timeoutTimer) {
          clearTimeout(this.safeguards.timeoutTimer);
          this.safeguards.timeoutTimer = null;
        }
        
        // Reset state
        this.injecting = false;
        this.audioSource = null;
        this.safeguards.activeTimestamp = null;
        
        // Auto-disable if configured
        if (this.safeguards.autoDisableAfterUse) {
          this.disable();
        }
        
        // Trigger stop callbacks
        this.onStopCallbacks.forEach(callback => callback());
      } catch (error) {
        console.error('Error stopping audio injection:', error);
      }
    }
  }

  /**
   * Trigger error callbacks
   * @param {string} message - Error message
   * @private
   */
  triggerError(message) {
    console.error('Audio injection error:', message);
    
    // Stop injection
    this.stop();
    
    // Disable if configured
    if (this.safeguards.disableOnError) {
      this.disable();
    }
    
    // Trigger error callbacks
    this.onErrorCallbacks.forEach(callback => callback(message));
  }

  /**
   * Register event callbacks
   * @param {string} event - Event name ('start', 'stop', 'error', 'warning')
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    switch (event) {
      case 'start':
        this.onStartCallbacks.push(callback);
        break;
      case 'stop':
        this.onStopCallbacks.push(callback);
        break;
      case 'error':
        this.onErrorCallbacks.push(callback);
        break;
      case 'warning':
        this.onWarningCallbacks.push(callback);
        break;
    }
  }
}

// Create a singleton instance
const audioInjectionService = new AudioInjectionService();

export default audioInjectionService;

/**
 * CandidAI - Automated Answering Service
 * Provides automated answering functionality using TTS and optional audio injection
 */

/**
 * Automated Answering Service class
 * Handles automated answering using TTS and optional audio injection
 */
class AutomatedAnsweringService {
  constructor() {
    this.initialized = false;
    this.active = false;
    this.ttsService = null;
    this.audioInjectionService = null;
    this.settings = {
      enabled: false,
      useAudioInjection: false,
      autoAnswer: false,
      autoAnswerDelay: 1000, // ms
      autoAnswerTimer: null,
      speakingIndicatorEnabled: true,
      autoScrollEnabled: true,
      highlightTextEnabled: true
    };
    this.currentAnswer = null;
    this.onStartCallbacks = [];
    this.onStopCallbacks = [];
    this.onErrorCallbacks = [];
  }

  /**
   * Initialize the automated answering service
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }

    try {
      // Import dependencies
      const [{ default: ttsService }, { default: audioInjectionService }, { default: StorageUtil }] = await Promise.all([
        import('./tts.js'),
        import('./audioInjection.js'),
        import('../utils/storage.js')
      ]);

      this.ttsService = ttsService;
      this.audioInjectionService = audioInjectionService;

      // Initialize TTS service
      await this.ttsService.initialize();

      // Load settings
      const settings = await StorageUtil.get('automatedAnsweringSettings');
      if (settings) {
        this.settings = { ...this.settings, ...settings };
      }

      // Register event listeners
      this.ttsService.on('start', () => {
        if (this.active) {
          this.onStartCallbacks.forEach(callback => callback());
        }
      });

      this.ttsService.on('end', () => {
        if (this.active) {
          this.active = false;
          this.onStopCallbacks.forEach(callback => callback());
        }
      });

      this.ttsService.on('error', (error) => {
        if (this.active) {
          this.active = false;
          this.onErrorCallbacks.forEach(callback => callback(error));
        }
      });

      this.audioInjectionService.on('error', (error) => {
        if (this.active && this.settings.useAudioInjection) {
          this.onErrorCallbacks.forEach(callback => callback(error));
        }
      });

      this.initialized = true;
      console.log('Automated answering service initialized');
      return true;
    } catch (error) {
      console.error('Error initializing automated answering service:', error);
      return false;
    }
  }

  /**
   * Save settings to storage
   * @private
   */
  async saveSettings() {
    try {
      const { default: StorageUtil } = await import('../utils/storage.js');
      await StorageUtil.set({
        automatedAnsweringSettings: this.settings
      });
    } catch (error) {
      console.error('Error saving automated answering settings:', error);
    }
  }

  /**
   * Enable or disable automated answering
   * @param {boolean} enabled - Whether to enable automated answering
   */
  async setEnabled(enabled) {
    if (!this.initialized) {
      await this.initialize();
    }

    this.settings.enabled = enabled;
    await this.saveSettings();

    if (!enabled && this.active) {
      this.stop();
    }
  }

  /**
   * Enable or disable audio injection
   * @param {boolean} enabled - Whether to enable audio injection
   */
  async setUseAudioInjection(enabled) {
    if (!this.initialized) {
      await this.initialize();
    }

    this.settings.useAudioInjection = enabled;
    await this.saveSettings();

    // If enabling audio injection, initialize the service
    if (enabled) {
      await this.audioInjectionService.initialize();
    }
  }

  /**
   * Enable or disable auto-answer
   * @param {boolean} enabled - Whether to enable auto-answer
   * @param {number} delay - Delay in milliseconds before auto-answering
   */
  async setAutoAnswer(enabled, delay = 1000) {
    if (!this.initialized) {
      await this.initialize();
    }

    this.settings.autoAnswer = enabled;
    this.settings.autoAnswerDelay = delay;
    await this.saveSettings();
  }

  /**
   * Set TTS voice
   * @param {string} voiceURI - Voice URI
   */
  async setVoice(voiceURI) {
    if (!this.initialized) {
      await this.initialize();
    }

    await this.ttsService.setVoice(voiceURI);
  }

  /**
   * Get available TTS voices
   * @returns {Promise<SpeechSynthesisVoice[]>} - Available voices
   */
  async getVoices() {
    if (!this.initialized) {
      await this.initialize();
    }

    return this.ttsService.getVoices();
  }

  /**
   * Set TTS rate
   * @param {number} rate - Speech rate (0.1 to 10)
   */
  async setRate(rate) {
    if (!this.initialized) {
      await this.initialize();
    }

    await this.ttsService.setRate(rate);
  }

  /**
   * Set TTS pitch
   * @param {number} pitch - Speech pitch (0 to 2)
   */
  async setPitch(pitch) {
    if (!this.initialized) {
      await this.initialize();
    }

    await this.ttsService.setPitch(pitch);
  }

  /**
   * Set TTS volume
   * @param {number} volume - Speech volume (0 to 1)
   */
  async setVolume(volume) {
    if (!this.initialized) {
      await this.initialize();
    }

    await this.ttsService.setVolume(volume);
  }

  /**
   * Speak an answer using TTS and optional audio injection
   * @param {string} answer - Answer to speak
   * @returns {Promise<void>} - Promise resolving when speech is complete
   */
  async speak(answer) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.settings.enabled) {
      throw new Error('Automated answering is disabled');
    }

    if (this.active) {
      this.stop();
    }

    this.currentAnswer = answer;
    this.active = true;

    try {
      // If using audio injection, set it up
      if (this.settings.useAudioInjection) {
        // This is a placeholder for actual audio injection implementation
        // In a real implementation, we would:
        // 1. Convert the text to audio using a more sophisticated TTS API
        // 2. Get the audio as a buffer or stream
        // 3. Pass it to the audio injection service
        console.log('Audio injection would be used here in a real implementation');
      }

      // Use regular TTS
      await this.ttsService.speak(answer);
      return true;
    } catch (error) {
      console.error('Error in automated answering:', error);
      this.active = false;
      this.onErrorCallbacks.forEach(callback => callback(error));
      throw error;
    }
  }

  /**
   * Auto-answer with the given answer after a delay
   * @param {string} answer - Answer to speak
   * @returns {Promise<void>} - Promise resolving when auto-answer is scheduled
   */
  async autoAnswer(answer) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.settings.enabled || !this.settings.autoAnswer) {
      return false;
    }

    // Clear any existing timer
    if (this.settings.autoAnswerTimer) {
      clearTimeout(this.settings.autoAnswerTimer);
    }

    // Set timer for auto-answer
    return new Promise((resolve) => {
      this.settings.autoAnswerTimer = setTimeout(async () => {
        try {
          await this.speak(answer);
          resolve(true);
        } catch (error) {
          console.error('Error in auto-answer:', error);
          resolve(false);
        }
      }, this.settings.autoAnswerDelay);
    });
  }

  /**
   * Stop speaking
   */
  stop() {
    if (this.active) {
      // Stop TTS
      this.ttsService.cancel();

      // Stop audio injection if active
      if (this.settings.useAudioInjection) {
        this.audioInjectionService.stop();
      }

      // Clear auto-answer timer
      if (this.settings.autoAnswerTimer) {
        clearTimeout(this.settings.autoAnswerTimer);
        this.settings.autoAnswerTimer = null;
      }

      this.active = false;
      this.onStopCallbacks.forEach(callback => callback());
    }
  }

  /**
   * Pause speaking
   */
  pause() {
    if (this.active) {
      this.ttsService.pause();
    }
  }

  /**
   * Resume speaking
   */
  resume() {
    if (this.active) {
      this.ttsService.resume();
    }
  }

  /**
   * Register event callbacks
   * @param {string} event - Event name ('start', 'stop', 'error')
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
    }
  }
}

// Create a singleton instance
const automatedAnsweringService = new AutomatedAnsweringService();

export default automatedAnsweringService;

/**
 * CandidAI - Text-to-Speech Service
 * Provides TTS functionality for automated answering
 */

/**
 * TTS Service class
 * Handles text-to-speech conversion and playback
 */
class TTSService {
  constructor() {
    this.initialized = false;
    this.speaking = false;
    this.paused = false;
    this.utterance = null;
    this.voice = null;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.voiceURI = null;
    this.audioContext = null;
    this.audioQueue = [];
    this.onSpeakStartCallbacks = [];
    this.onSpeakEndCallbacks = [];
    this.onSpeakPauseCallbacks = [];
    this.onSpeakResumeCallbacks = [];
    this.onSpeakErrorCallbacks = [];
    this.safeguards = {
      maxTextLength: 5000,
      audioInjectionEnabled: false,
      userConsent: false,
      audioInjectionWarningShown: false
    };
  }

  /**
   * Initialize the TTS service
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }

    try {
      // Check if speech synthesis is available
      if (!('speechSynthesis' in window)) {
        console.error('Speech synthesis not supported');
        return false;
      }

      // Load settings from storage
      await this.loadSettings();

      // Initialize audio context for potential audio injection
      // (but don't actually use it unless explicitly enabled)
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.warn('Audio context initialization failed:', error);
        this.safeguards.audioInjectionEnabled = false;
      }

      // Set initialized flag
      this.initialized = true;
      console.log('TTS service initialized');
      return true;
    } catch (error) {
      console.error('Error initializing TTS service:', error);
      return false;
    }
  }

  /**
   * Load TTS settings from storage
   * @private
   */
  async loadSettings() {
    try {
      const { default: StorageUtil } = await import('../utils/storage.js');
      const settings = await StorageUtil.get('ttsSettings');

      if (settings) {
        this.rate = settings.rate || 1.0;
        this.pitch = settings.pitch || 1.0;
        this.volume = settings.volume || 1.0;
        this.voiceURI = settings.voiceURI || null;
        this.safeguards.audioInjectionEnabled = settings.audioInjectionEnabled || false;
        this.safeguards.userConsent = settings.userConsent || false;
      }
    } catch (error) {
      console.error('Error loading TTS settings:', error);
    }
  }

  /**
   * Save TTS settings to storage
   * @private
   */
  async saveSettings() {
    try {
      const { default: StorageUtil } = await import('../utils/storage.js');
      await StorageUtil.set({
        ttsSettings: {
          rate: this.rate,
          pitch: this.pitch,
          volume: this.volume,
          voiceURI: this.voiceURI,
          audioInjectionEnabled: this.safeguards.audioInjectionEnabled,
          userConsent: this.safeguards.userConsent
        }
      });
    } catch (error) {
      console.error('Error saving TTS settings:', error);
    }
  }

  /**
   * Get available voices
   * @returns {Promise<SpeechSynthesisVoice[]>} - Available voices
   */
  async getVoices() {
    if (!this.initialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      // Chrome loads voices asynchronously
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        speechSynthesis.onvoiceschanged = () => {
          resolve(speechSynthesis.getVoices());
        };
      }
    });
  }

  /**
   * Set voice by URI
   * @param {string} voiceURI - Voice URI
   */
  async setVoice(voiceURI) {
    if (!this.initialized) {
      await this.initialize();
    }

    const voices = await this.getVoices();
    this.voice = voices.find(v => v.voiceURI === voiceURI) || null;
    this.voiceURI = this.voice ? this.voice.voiceURI : null;
    await this.saveSettings();
  }

  /**
   * Set speech rate
   * @param {number} rate - Speech rate (0.1 to 10)
   */
  async setRate(rate) {
    if (!this.initialized) {
      await this.initialize();
    }

    this.rate = Math.max(0.1, Math.min(10, rate));
    await this.saveSettings();
  }

  /**
   * Set speech pitch
   * @param {number} pitch - Speech pitch (0 to 2)
   */
  async setPitch(pitch) {
    if (!this.initialized) {
      await this.initialize();
    }

    this.pitch = Math.max(0, Math.min(2, pitch));
    await this.saveSettings();
  }

  /**
   * Set speech volume
   * @param {number} volume - Speech volume (0 to 1)
   */
  async setVolume(volume) {
    if (!this.initialized) {
      await this.initialize();
    }

    this.volume = Math.max(0, Math.min(1, volume));
    await this.saveSettings();
  }

  /**
   * Speak text using the Web Speech API
   * @param {string} text - Text to speak
   * @returns {Promise<void>} - Promise resolving when speech is complete
   */
  async speak(text) {
    if (!this.initialized) {
      await this.initialize();
    }

    // Safety check for text length
    if (text.length > this.safeguards.maxTextLength) {
      text = text.substring(0, this.safeguards.maxTextLength) + '... (text truncated for safety)';
    }

    // Cancel any ongoing speech
    this.cancel();

    return new Promise((resolve, reject) => {
      try {
        // Create utterance
        this.utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice if available
        if (this.voice) {
          this.utterance.voice = this.voice;
        } else if (this.voiceURI) {
          // Try to find voice by URI
          this.getVoices().then(voices => {
            const voice = voices.find(v => v.voiceURI === this.voiceURI);
            if (voice) {
              this.utterance.voice = voice;
            }
          });
        }
        
        // Set other properties
        this.utterance.rate = this.rate;
        this.utterance.pitch = this.pitch;
        this.utterance.volume = this.volume;
        
        // Set event handlers
        this.utterance.onstart = () => {
          this.speaking = true;
          this.onSpeakStartCallbacks.forEach(callback => callback());
        };
        
        this.utterance.onend = () => {
          this.speaking = false;
          this.utterance = null;
          this.onSpeakEndCallbacks.forEach(callback => callback());
          resolve();
        };
        
        this.utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          this.speaking = false;
          this.utterance = null;
          this.onSpeakErrorCallbacks.forEach(callback => callback(event));
          reject(event);
        };
        
        // Start speaking
        speechSynthesis.speak(this.utterance);
      } catch (error) {
        console.error('Error starting speech:', error);
        reject(error);
      }
    });
  }

  /**
   * Pause speech
   */
  pause() {
    if (this.speaking && !this.paused) {
      speechSynthesis.pause();
      this.paused = true;
      this.onSpeakPauseCallbacks.forEach(callback => callback());
    }
  }

  /**
   * Resume speech
   */
  resume() {
    if (this.speaking && this.paused) {
      speechSynthesis.resume();
      this.paused = false;
      this.onSpeakResumeCallbacks.forEach(callback => callback());
    }
  }

  /**
   * Cancel speech
   */
  cancel() {
    speechSynthesis.cancel();
    this.speaking = false;
    this.paused = false;
    this.utterance = null;
  }

  /**
   * Register event callbacks
   * @param {string} event - Event name ('start', 'end', 'pause', 'resume', 'error')
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    switch (event) {
      case 'start':
        this.onSpeakStartCallbacks.push(callback);
        break;
      case 'end':
        this.onSpeakEndCallbacks.push(callback);
        break;
      case 'pause':
        this.onSpeakPauseCallbacks.push(callback);
        break;
      case 'resume':
        this.onSpeakResumeCallbacks.push(callback);
        break;
      case 'error':
        this.onSpeakErrorCallbacks.push(callback);
        break;
    }
  }
}

// Create a singleton instance
const ttsService = new TTSService();

export default ttsService;

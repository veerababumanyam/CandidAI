/**
 * CandidAI - Speech-to-Text API Module
 * Provides interfaces to various STT APIs
 */

/**
 * Base class for STT providers
 */
class STTProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.isReady = false;
  }

  /**
   * Initialize the provider
   */
  async initialize() {
    throw new Error('Method not implemented');
  }

  /**
   * Transcribe audio data
   * @param {Blob} audioBlob - Audio data to transcribe
   * @param {Object} options - Transcription options
   * @returns {Promise<Object>} - Transcription result
   */
  async transcribe(audioBlob, options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Check if the provider is ready
   * @returns {boolean} - Whether the provider is ready
   */
  isInitialized() {
    return this.isReady;
  }
}

/**
 * Web Speech API provider (built-in browser API)
 */
class WebSpeechProvider extends STTProvider {
  constructor() {
    super(null); // No API key needed
    this.recognition = null;
  }

  /**
   * Initialize the Web Speech API
   */
  async initialize() {
    if (typeof window === 'undefined') {
      throw new Error('Web Speech API is only available in browser environments');
    }

    if (!('webkitSpeechRecognition' in window)) {
      throw new Error('Web Speech API is not supported in this browser');
    }

    this.isReady = true;
    return true;
  }

  /**
   * Start continuous recognition
   * @param {Object} options - Recognition options
   * @param {Function} onResult - Callback for results
   * @param {Function} onError - Callback for errors
   * @returns {Object} - Recognition controller
   */
  startContinuousRecognition(options = {}, onResult, onError) {
    if (!this.isReady) {
      throw new Error('Provider not initialized');
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = options.language || 'en-US';

    recognition.onresult = (event) => {
      if (typeof onResult === 'function') {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        onResult({
          finalTranscript,
          interimTranscript,
          isFinal: !!finalTranscript,
          confidence: finalTranscript ? event.results[event.resultIndex][0].confidence : 0
        });
      }
    };

    recognition.onerror = (event) => {
      if (typeof onError === 'function') {
        onError({
          error: event.error,
          message: `Speech recognition error: ${event.error}`
        });
      }
    };

    recognition.start();
    this.recognition = recognition;

    return {
      stop: () => {
        if (this.recognition) {
          this.recognition.stop();
          this.recognition = null;
        }
      }
    };
  }

  /**
   * Transcribe audio data (not implemented for Web Speech API)
   */
  async transcribe(audioBlob, options = {}) {
    throw new Error('Web Speech API does not support transcribing audio blobs. Use startContinuousRecognition instead.');
  }
}

/**
 * Google Cloud Speech-to-Text API provider
 */
class GoogleCloudSTTProvider extends STTProvider {
  constructor(apiKey) {
    super(apiKey);
    this.baseUrl = 'https://speech.googleapis.com/v1/speech:recognize';
  }

  /**
   * Initialize the provider
   */
  async initialize() {
    if (!this.apiKey) {
      throw new Error('API key is required for Google Cloud STT');
    }

    // Validate API key (simplified)
    this.isReady = true;
    return true;
  }

  /**
   * Transcribe audio data
   * @param {Blob} audioBlob - Audio data to transcribe
   * @param {Object} options - Transcription options
   * @returns {Promise<Object>} - Transcription result
   */
  async transcribe(audioBlob, options = {}) {
    if (!this.isReady) {
      throw new Error('Provider not initialized');
    }

    try {
      // Convert blob to base64
      const base64Audio = await this._blobToBase64(audioBlob);

      // Prepare request
      const requestData = {
        config: {
          encoding: options.encoding || 'LINEAR16',
          sampleRateHertz: options.sampleRate || 16000,
          languageCode: options.language || 'en-US',
          model: options.model || 'default',
          enableAutomaticPunctuation: options.punctuation !== false
        },
        audio: {
          content: base64Audio
        }
      };

      // Make API request
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Google Cloud STT API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Process response
      if (!data.results || data.results.length === 0) {
        return { transcript: '', confidence: 0 };
      }

      const result = data.results[0];
      const alternative = result.alternatives[0];

      return {
        transcript: alternative.transcript,
        confidence: alternative.confidence || 0
      };
    } catch (error) {
      console.error('Google Cloud STT transcription error:', error);
      throw error;
    }
  }

  /**
   * Convert a Blob to base64
   * @private
   */
  _blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

/**
 * Factory function to create an STT provider
 * @param {string} provider - Provider name
 * @param {string} apiKey - API key
 * @returns {STTProvider} - STT provider instance
 */
function createSTTProvider(provider, apiKey) {
  switch (provider) {
    case 'webSpeech':
      return new WebSpeechProvider();
    case 'googleCloud':
      return new GoogleCloudSTTProvider(apiKey);
    default:
      throw new Error(`Unsupported STT provider: ${provider}`);
  }
}

export {
  createSTTProvider,
  WebSpeechProvider,
  GoogleCloudSTTProvider
};

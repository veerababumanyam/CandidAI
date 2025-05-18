/**
 * CandidAI - Google Gemini API Provider
 * Handles interactions with the Google Gemini API
 */

/**
 * Google Gemini API Provider class
 */
class GeminiProvider {
  /**
   * Initialize the provider with API key
   * @param {string} apiKey - Google Gemini API key
   */
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.defaultModel = 'gemini-pro';
    this.isReady = false;
  }

  /**
   * Set the API key
   * @param {string} apiKey - Google Gemini API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.isReady = this.validateApiKey(apiKey);
    return this.isReady;
  }

  /**
   * Validate the API key format
   * @param {string} apiKey - Google Gemini API key
   * @returns {boolean} - Whether the API key is valid
   * @private
   */
  validateApiKey(apiKey) {
    // Gemini API keys don't have a specific format to validate against
    // Just check if it's a non-empty string
    return apiKey && typeof apiKey === 'string' && apiKey.length > 10;
  }

  /**
   * Check if the provider is ready to use
   * @returns {boolean} - Whether the provider is ready
   */
  isInitialized() {
    return this.isReady;
  }

  /**
   * Initialize the provider
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    if (!this.apiKey) {
      try {
        // Try to get API key from storage
        const result = await new Promise((resolve) => {
          chrome.storage.local.get(['llmApiKeys'], resolve);
        });
        
        if (result.llmApiKeys && result.llmApiKeys.gemini) {
          this.apiKey = result.llmApiKeys.gemini;
          this.isReady = this.validateApiKey(this.apiKey);
          return this.isReady;
        }
        
        return false;
      } catch (error) {
        console.error('Error initializing Gemini provider:', error);
        return false;
      }
    }
    
    this.isReady = this.validateApiKey(this.apiKey);
    return this.isReady;
  }

  /**
   * Convert OpenAI-style messages to Gemini format
   * @param {Array<Object>} messages - OpenAI-style messages
   * @returns {Array<Object>} - Gemini-style messages
   * @private
   */
  convertMessages(messages) {
    const geminiMessages = [];
    let systemPrompt = '';
    
    // Extract system messages
    for (const message of messages) {
      if (message.role === 'system') {
        systemPrompt += message.content + '\n';
      }
    }
    
    // If we have a system prompt, add it as a user message at the beginning
    if (systemPrompt) {
      geminiMessages.push({
        role: 'user',
        parts: [{ text: `System instructions: ${systemPrompt.trim()}\n\nPlease acknowledge these instructions.` }]
      });
      
      // Add a model response acknowledging the system instructions
      geminiMessages.push({
        role: 'model',
        parts: [{ text: 'I understand and will follow these instructions.' }]
      });
    }
    
    // Add the rest of the messages
    for (const message of messages) {
      if (message.role !== 'system') {
        geminiMessages.push({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }]
        });
      }
    }
    
    return geminiMessages;
  }

  /**
   * Generate a response using the Google Gemini API
   * @param {Array<Object>} messages - Array of message objects with role and content
   * @param {Object} options - Options for the request
   * @returns {Promise<Object>} - The response from the API
   */
  async generateResponse(messages, options = {}) {
    if (!this.isReady && !(await this.initialize())) {
      throw new Error('Gemini provider not initialized. Please set a valid API key.');
    }
    
    const model = options.model || this.defaultModel;
    const temperature = options.temperature !== undefined ? options.temperature : 0.7;
    const maxTokens = options.maxTokens || 1000;
    
    // Convert OpenAI-style messages to Gemini format
    const geminiMessages = this.convertMessages(messages);
    
    try {
      const response = await fetch(`${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            topP: 0.95,
            topK: 40
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.handleApiError(response.status, errorData);
      }
      
      const data = await response.json();
      
      // Extract the text from the response
      const text = data.candidates[0].content.parts[0].text;
      
      // Gemini doesn't provide token usage, so we estimate
      const promptTokens = this.countTokens(JSON.stringify(geminiMessages));
      const completionTokens = this.countTokens(text);
      
      return {
        text,
        model,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens
        },
        provider: 'gemini'
      };
    } catch (error) {
      console.error('Error generating response from Gemini:', error);
      throw error;
    }
  }

  /**
   * Handle API errors
   * @param {number} status - HTTP status code
   * @param {Object} errorData - Error data from the API
   * @returns {Error} - Error object with details
   * @private
   */
  handleApiError(status, errorData) {
    let errorMessage = 'Unknown error occurred';
    let errorType = 'UnknownError';
    
    if (errorData && errorData.error) {
      errorMessage = errorData.error.message || errorMessage;
      errorType = errorData.error.status || errorType;
    }
    
    // Create specific error types based on status code
    switch (status) {
      case 400:
        errorType = 'InvalidRequestError';
        errorMessage = 'Invalid request to Gemini API';
        break;
      case 401:
        errorType = 'AuthenticationError';
        errorMessage = 'Invalid API key or unauthorized access';
        break;
      case 429:
        errorType = 'RateLimitError';
        errorMessage = 'Rate limit exceeded. Please try again later.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorType = 'ServiceError';
        errorMessage = 'Gemini service error. Please try again later.';
        break;
    }
    
    const error = new Error(errorMessage);
    error.type = errorType;
    error.status = status;
    error.data = errorData;
    
    return error;
  }

  /**
   * Count tokens in a message
   * @param {string} text - Text to count tokens for
   * @returns {number} - Approximate token count
   */
  countTokens(text) {
    // This is a very rough approximation
    // In a production environment, use a proper tokenizer
    return Math.ceil(text.length / 4);
  }

  /**
   * Get provider capabilities
   * @returns {Object} - Provider capabilities
   */
  getCapabilities() {
    return {
      provider: 'gemini',
      models: ['gemini-pro', 'gemini-ultra'],
      features: {
        streaming: true,
        functionCalling: false,
        jsonMode: false
      },
      maxTokens: {
        'gemini-pro': 32768,
        'gemini-ultra': 32768
      }
    };
  }
}

export default GeminiProvider;

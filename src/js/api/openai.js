/**
 * CandidAI - OpenAI API Provider
 * Handles interactions with the OpenAI API
 */

/**
 * OpenAI API Provider class
 */
class OpenAIProvider {
  /**
   * Initialize the provider with API key
   * @param {string} apiKey - OpenAI API key
   */
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.openai.com/v1';
    this.defaultModel = 'gpt-3.5-turbo';
    this.isReady = false;
  }

  /**
   * Set the API key
   * @param {string} apiKey - OpenAI API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.isReady = this.validateApiKey(apiKey);
    return this.isReady;
  }

  /**
   * Validate the API key format
   * @param {string} apiKey - OpenAI API key
   * @returns {boolean} - Whether the API key is valid
   * @private
   */
  validateApiKey(apiKey) {
    return apiKey && apiKey.startsWith('sk-') && apiKey.length > 20;
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
        
        if (result.llmApiKeys && result.llmApiKeys.openai) {
          this.apiKey = result.llmApiKeys.openai;
          this.isReady = this.validateApiKey(this.apiKey);
          return this.isReady;
        }
        
        return false;
      } catch (error) {
        console.error('Error initializing OpenAI provider:', error);
        return false;
      }
    }
    
    this.isReady = this.validateApiKey(this.apiKey);
    return this.isReady;
  }

  /**
   * Generate a response using the OpenAI API
   * @param {Array<Object>} messages - Array of message objects with role and content
   * @param {Object} options - Options for the request
   * @returns {Promise<Object>} - The response from the API
   */
  async generateResponse(messages, options = {}) {
    if (!this.isReady && !(await this.initialize())) {
      throw new Error('OpenAI provider not initialized. Please set a valid API key.');
    }
    
    const model = options.model || this.defaultModel;
    const temperature = options.temperature !== undefined ? options.temperature : 0.7;
    const maxTokens = options.maxTokens || 1000;
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          n: 1,
          stream: false
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.handleApiError(response.status, errorData);
      }
      
      const data = await response.json();
      
      return {
        text: data.choices[0].message.content,
        model: data.model,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        },
        provider: 'openai'
      };
    } catch (error) {
      console.error('Error generating response from OpenAI:', error);
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
      errorType = errorData.error.type || errorType;
    }
    
    // Create specific error types based on status code
    switch (status) {
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
        errorMessage = 'OpenAI service error. Please try again later.';
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
    // In a production environment, use a proper tokenizer like GPT-3 Tokenizer
    return Math.ceil(text.length / 4);
  }

  /**
   * Get provider capabilities
   * @returns {Object} - Provider capabilities
   */
  getCapabilities() {
    return {
      provider: 'openai',
      models: ['gpt-4', 'gpt-3.5-turbo'],
      features: {
        streaming: true,
        functionCalling: true,
        jsonMode: true
      },
      maxTokens: {
        'gpt-4': 8192,
        'gpt-3.5-turbo': 4096
      }
    };
  }
}

export default OpenAIProvider;

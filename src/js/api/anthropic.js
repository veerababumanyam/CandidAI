/**
 * CandidAI - Anthropic API Provider
 * Handles interactions with the Anthropic API
 */

/**
 * Anthropic API Provider class
 */
class AnthropicProvider {
  /**
   * Initialize the provider with API key
   * @param {string} apiKey - Anthropic API key
   */
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.anthropic.com/v1';
    this.defaultModel = 'claude-3-sonnet-20240229';
    this.isReady = false;
    this.apiVersion = '2023-06-01';
  }

  /**
   * Set the API key
   * @param {string} apiKey - Anthropic API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.isReady = this.validateApiKey(apiKey);
    return this.isReady;
  }

  /**
   * Validate the API key format
   * @param {string} apiKey - Anthropic API key
   * @returns {boolean} - Whether the API key is valid
   * @private
   */
  validateApiKey(apiKey) {
    return apiKey && apiKey.startsWith('sk-ant-') && apiKey.length > 20;
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
        
        if (result.llmApiKeys && result.llmApiKeys.anthropic) {
          this.apiKey = result.llmApiKeys.anthropic;
          this.isReady = this.validateApiKey(this.apiKey);
          return this.isReady;
        }
        
        return false;
      } catch (error) {
        console.error('Error initializing Anthropic provider:', error);
        return false;
      }
    }
    
    this.isReady = this.validateApiKey(this.apiKey);
    return this.isReady;
  }

  /**
   * Convert OpenAI-style messages to Anthropic format
   * @param {Array<Object>} messages - OpenAI-style messages
   * @returns {Object} - Anthropic-style messages and system prompt
   * @private
   */
  convertMessages(messages) {
    let systemPrompt = '';
    const anthropicMessages = [];
    
    for (const message of messages) {
      if (message.role === 'system') {
        systemPrompt += message.content + '\n';
      } else {
        anthropicMessages.push({
          role: message.role === 'assistant' ? 'assistant' : 'user',
          content: message.content
        });
      }
    }
    
    return {
      systemPrompt: systemPrompt.trim(),
      messages: anthropicMessages
    };
  }

  /**
   * Generate a response using the Anthropic API
   * @param {Array<Object>} messages - Array of message objects with role and content
   * @param {Object} options - Options for the request
   * @returns {Promise<Object>} - The response from the API
   */
  async generateResponse(messages, options = {}) {
    if (!this.isReady && !(await this.initialize())) {
      throw new Error('Anthropic provider not initialized. Please set a valid API key.');
    }
    
    const model = options.model || this.defaultModel;
    const temperature = options.temperature !== undefined ? options.temperature : 0.7;
    const maxTokens = options.maxTokens || 1000;
    
    // Convert OpenAI-style messages to Anthropic format
    const { systemPrompt, messages: anthropicMessages } = this.convertMessages(messages);
    
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': this.apiVersion
        },
        body: JSON.stringify({
          model,
          messages: anthropicMessages,
          system: systemPrompt,
          max_tokens: maxTokens,
          temperature
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.handleApiError(response.status, errorData);
      }
      
      const data = await response.json();
      
      return {
        text: data.content[0].text,
        model: data.model,
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        },
        provider: 'anthropic'
      };
    } catch (error) {
      console.error('Error generating response from Anthropic:', error);
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
        errorMessage = 'Anthropic service error. Please try again later.';
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
      provider: 'anthropic',
      models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      features: {
        streaming: true,
        functionCalling: true,
        jsonMode: true
      },
      maxTokens: {
        'claude-3-opus-20240229': 200000,
        'claude-3-sonnet-20240229': 200000,
        'claude-3-haiku-20240307': 200000
      }
    };
  }
}

export default AnthropicProvider;

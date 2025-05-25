/**
 * GeminiProvider - Google Gemini API integration
 * Implements multimodal capabilities and function calling
 * Provides robust error handling and safety settings
 */

import { BaseLLMProvider } from './BaseLLMProvider.js';

/**
 * GeminiProvider - Implements Google's Gemini API
 * Extends base provider with Gemini-specific features
 */
export class GeminiProvider extends BaseLLMProvider {
  constructor(apiKey, config = {}) {
    super(apiKey, config);

    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
    this.models = config.models || ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'];

    // Model-specific configurations
    this.modelConfigs = {
      'gemini-pro': {
        maxTokens: 32768,
        supportsVision: false,
        supportsFunctions: true,
        costPer1kInput: 0.0025,
        costPer1kOutput: 0.0025,
      },
      'gemini-pro-vision': {
        maxTokens: 32768,
        supportsVision: true,
        supportsFunctions: false,
        costPer1kInput: 0.0025,
        costPer1kOutput: 0.0025,
      },
      'gemini-ultra': {
        maxTokens: 32768,
        supportsVision: true,
        supportsFunctions: true,
        costPer1kInput: 0.01875,
        costPer1kOutput: 0.01875,
      },
    };

    // Safety settings
    this.defaultSafetySettings = [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ];
  }

  /**
   * Generate completion with Gemini API
   * Implements multimodal content handling
   */
  async generateCompletion(params) {
    const {
      model = 'gemini-pro',
      messages,
      systemPrompt,
      temperature = 0.7,
      maxTokens = 500,
      stream = false,
      functions = null,
    } = params;

    // Validate model
    if (!this.models.includes(model)) {
      throw new Error(`Model ${model} not available for Gemini provider`);
    }

    // Format messages for Gemini
    const contents = this.formatMessagesForGemini(messages, systemPrompt);

    // Build request payload
    const payload = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        candidateCount: 1,
      },
      safetySettings: this.defaultSafetySettings,
    };

    // Add function declarations if supported
    if (functions && this.modelConfigs[model]?.supportsFunctions) {
      payload.tools = [
        {
          functionDeclarations: functions,
        },
      ];
    }

    try {
      const endpoint = stream
        ? `/models/${model}:streamGenerateContent`
        : `/models/${model}:generateContent`;

      const response = await this.makeRequest(endpoint, payload);

      if (stream) {
        return this.handleStreamResponse(response);
      } else {
        return this.formatResponse(response, model);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }
  /**
   * Format messages for Gemini API
   * Implements Gemini-specific content structure
   */
  formatMessagesForGemini(messages, systemPrompt) {
    const contents = [];

    // Add system prompt as first user message if provided
    if (systemPrompt) {
      contents.push({
        role: 'user',
        parts: [
          {
            text: `System: ${systemPrompt}\n\nPlease follow these instructions in your responses.`,
          },
        ],
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I will follow these instructions.' }],
      });
    }

    // Convert messages to Gemini format
    messages.forEach((msg) => {
      const role = msg.role === 'assistant' ? 'model' : 'user';

      // Handle multimodal content
      if (typeof msg.content === 'string') {
        contents.push({
          role,
          parts: [{ text: msg.content }],
        });
      } else if (Array.isArray(msg.content)) {
        // Multimodal message with text and images
        const parts = msg.content
          .map((part) => {
            if (part.type === 'text') {
              return { text: part.text };
            } else if (part.type === 'image') {
              return {
                inlineData: {
                  mimeType: part.mimeType || 'image/jpeg',
                  data: part.data, // Base64 encoded
                },
              };
            }
            return null;
          })
          .filter(Boolean);

        contents.push({ role, parts });
      }
    });

    return contents;
  }

  /**
   * Make HTTP request to Gemini API
   * Implements API key authentication
   */
  async makeRequest(endpoint, payload, retries = 3) {
    const url = `${this.baseURL}${endpoint}?key=${this.apiKey}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || `HTTP ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }

        // Calculate exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await this.delay(delay);
      }
    }
  }

  /**
   * Format Gemini response to standard format
   * Handles safety ratings and citations
   */
  formatResponse(response, model) {
    const candidate = response.candidates?.[0];

    if (!candidate) {
      throw new Error('No response candidate generated');
    }

    // Check for safety blocks
    if (candidate.finishReason === 'SAFETY') {
      const safetyRatings = candidate.safetyRatings || [];
      const blockedCategories = safetyRatings
        .filter((rating) => rating.blocked)
        .map((rating) => rating.category);

      throw new Error(`Response blocked due to safety: ${blockedCategories.join(', ')}`);
    }

    const content = candidate.content.parts.map((part) => part.text).join('');

    return {
      content,
      role: 'assistant',
      finishReason: candidate.finishReason,
      safetyRatings: candidate.safetyRatings,
      citations: candidate.citationMetadata,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0,
        model,
        estimatedCost: this.calculateCost(response.usageMetadata || {}, model),
      },
      provider: 'gemini',
      model,
    };
  }

  /**
   * Handle streaming response
   * Implements streaming for Gemini
   */
  async *handleStreamResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Gemini streams JSON objects separated by newlines
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) {
          continue;
        }

        try {
          const parsed = JSON.parse(line);

          if (parsed.candidates?.[0]?.content?.parts) {
            const text = parsed.candidates[0].content.parts.map((part) => part.text).join('');

            if (text) {
              yield {
                content: text,
                role: 'assistant',
                isStream: true,
              };
            }
          }
        } catch (e) {
          console.error('Failed to parse stream data:', e);
        }
      }
    }
  }

  /**
   * Calculate token usage cost
   * Implements Gemini pricing
   */
  calculateCost(usage, model) {
    const config = this.modelConfigs[model];
    if (!config) {
      return 0;
    }

    const promptTokens = usage.promptTokenCount || 0;
    const completionTokens = usage.candidatesTokenCount || 0;

    const inputCost = (promptTokens / 1000) * config.costPer1kInput;
    const outputCost = (completionTokens / 1000) * config.costPer1kOutput;

    return inputCost + outputCost;
  }

  /**
   * Test API connection
   * Implements connection validation
   */
  async testConnection() {
    try {
      const response = await this.generateCompletion({
        model: 'gemini-pro',
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 10,
      });

      return {
        success: true,
        message: 'Connection successful',
        model: response.model,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Handle API errors with specific error types
   * Implements comprehensive error handling
   */
  handleError(error) {
    const message = error.message.toLowerCase();

    if (message.includes('api_key_invalid')) {
      return new Error('Invalid API key');
    } else if (message.includes('quota_exceeded')) {
      return new Error('API quota exceeded');
    } else if (message.includes('rate_limit')) {
      return new Error('Rate limit exceeded. Please try again later.');
    } else if (message.includes('safety')) {
      return new Error('Response blocked due to safety settings');
    } else {
      return error;
    }
  }

  // Utility delay function
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

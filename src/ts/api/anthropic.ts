/**
 * AnthropicProvider - Anthropic Claude API integration
 * Implements Claude-specific features and message formatting
 * Provides robust error handling and streaming support
 */

import { BaseLLMProvider, type ProviderConfig, type UsageStats } from './BaseLLMProvider';
import type { LLMRequest, LLMResponse } from '../types/index';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface AnthropicModelConfig {
  maxTokens: number;
  supportsVision: boolean;
  supportsFunctions: boolean;
  costPer1kInput: number;
  costPer1kOutput: number;
}

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnthropicCompletionParams {
  prompt?: string;
  context?: any;
  callType?: any;
  tone?: any;
  model?: string;
  messages?: AnthropicMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  [key: string]: any;
}

export interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence?: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface AnthropicStreamChunk {
  content: string;
  role: string;
  isStream: boolean;
}

// =============================================================================
// ANTHROPIC PROVIDER CLASS
// =============================================================================

/**
 * AnthropicProvider - Implements Anthropic's Claude API
 * Extends base provider with Claude-specific capabilities
 */
export class AnthropicProvider extends BaseLLMProvider {
  private readonly anthropicVersion: string;

  constructor(apiKey: string, config: ProviderConfig = {}) {
    super(apiKey, config);

    this.baseURL = 'https://api.anthropic.com/v1';
    this.models = config.models || [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ];

    // Model-specific configurations
    this.modelConfigs = {
      'claude-3-opus-20240229': {
        maxTokens: 200000,
        supportsVision: true,
        supportsFunctions: false, // Claude uses tools instead
        costPer1kInput: 0.015,
        costPer1kOutput: 0.075,
      },
      'claude-3-sonnet-20240229': {
        maxTokens: 200000,
        supportsVision: true,
        supportsFunctions: false,
        costPer1kInput: 0.003,
        costPer1kOutput: 0.015,
      },
      'claude-3-haiku-20240307': {
        maxTokens: 200000,
        supportsVision: true,
        supportsFunctions: false,
        costPer1kInput: 0.00025,
        costPer1kOutput: 0.00125,
      },
    };

    // Anthropic-specific configuration
    this.anthropicVersion = '2023-06-01';
  }

  /**
   * Generate completion with Anthropic Messages API
   * Implements Claude-specific formatting
   */
  async generateCompletion(params: LLMRequest | AnthropicCompletionParams): Promise<LLMResponse> {
    const {
      model = 'claude-3-sonnet-20240229',
      messages,
      temperature = 0.7,
      maxTokens = 500,
      stream = false,
    } = params;
    
    const systemPrompt = 'systemPrompt' in params ? params.systemPrompt : undefined;

    // Validate model
    if (!this.models.includes(model)) {
      throw new Error(`Model ${model} not available for Anthropic provider`);
    }

    // Format messages for Anthropic API
    const messageArray = Array.isArray(messages) ? messages : [];
    const formattedMessages = this.formatMessagesForClaude(messageArray);

    // Build request payload
    const payload: any = {
      model,
      messages: formattedMessages,
      max_tokens: maxTokens,
      temperature,
      stream,
    };

    // Add system prompt if provided
    if (systemPrompt) {
      payload.system = systemPrompt;
    }

    try {
      const response = await this.makeRequest('/messages', payload);

      if (stream) {
        return {
          provider: 'anthropic',
          model,
          isStream: true,
          content: '',
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          finishReason: 'stop'
        };
      } else {
        return this.formatResponse(response, model);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Format messages for Claude API
   * Implements Claude-specific message structure
   */
  private formatMessagesForClaude(messages: any[]): AnthropicMessage[] {
    const formatted: AnthropicMessage[] = [];

    messages.forEach((msg) => {
      // Ensure alternating user/assistant messages
      const lastMessage = formatted[formatted.length - 1];
      if (formatted.length === 0 || (lastMessage && lastMessage.role !== msg.role)) {
        formatted.push({
          role: msg.role === 'system' ? 'user' : msg.role,
          content: msg.content,
        });
      } else if (lastMessage) {
        // Merge consecutive messages from same role
        lastMessage.content += '\\n\\n' + msg.content;
      }
    });

    // Ensure first message is from user
    const firstMessage = formatted[0];
    if (formatted.length > 0 && firstMessage && firstMessage.role === 'assistant') {
      formatted.unshift({
        role: 'user',
        content: 'Continue the conversation.',
      });
    }

    return formatted;
  }

  /**
   * Make HTTP request to Anthropic API
   * Implements retry logic and error handling
   */
  private async makeRequest(endpoint: string, payload: any, retries: number = 3): Promise<AnthropicResponse> {
    const url = `${this.baseURL}${endpoint}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': this.anthropicVersion,
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

    throw new Error('Max retries exceeded');
  }

  /**
   * Format Claude response to standard format
   * Implements response normalization
   */
  private formatResponse(response: AnthropicResponse, model: string): LLMResponse {
    const content = response.content?.[0]?.text || '';
    
    return {
      content,
      usage: {
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
        totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
        model: response.model || model,
        estimatedCost: this.calculateCost(response.usage, model),
      },
      model: response.model || model,
      finishReason: response.stop_reason || 'stop_sequence',
      metadata: {
        id: response.id,
        type: response.type,
        messageRole: response.role
      },
      provider: 'anthropic'
    };
  }

  /**
   * Handle streaming response
   * Implements Server-Sent Events parsing for Claude
   */
  private async *handleStreamResponse(response: Response): AsyncGenerator<AnthropicStreamChunk> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body available for streaming');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              yield {
                content: parsed.delta.text,
                role: 'assistant',
                isStream: true,
              };
            }
          } catch (e) {
            console.error('Failed to parse stream data:', e);
          }
        }
      }
    }
  }

  /**
   * Calculate token usage cost
   * Implements pricing calculation
   */
  private calculateCost(usage: { input_tokens: number; output_tokens: number }, model: string): number {
    const config = this.modelConfigs[model];
    if (!config) {
      return 0;
    }

    const inputCost = (usage.input_tokens / 1000) * config.costPer1kInput;
    const outputCost = (usage.output_tokens / 1000) * config.costPer1kOutput;

    return inputCost + outputCost;
  }

  /**
   * Test API connection
   * Implements connection validation
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateCompletion({
        model: 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 10,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Handle API errors with specific error types
   * Implements comprehensive error handling
   */
  private handleError(error: any): Error {
    const message = error.message.toLowerCase();

    if (message.includes('api key')) {
      return new Error('Invalid API key');
    } else if (message.includes('rate limit')) {
      return new Error('Rate limit exceeded. Please try again later.');
    } else if (message.includes('quota')) {
      return new Error('API quota exceeded');
    } else if (message.includes('token') && message.includes('limit')) {
      return new Error('Message too long for model context window');
    } else {
      return error;
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
} 
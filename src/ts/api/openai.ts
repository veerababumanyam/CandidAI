/**
 * OpenAI Provider - Enterprise-grade OpenAI API integration
 * Implements streaming, function calling, and vision capabilities
 * Provides robust error handling and retry mechanisms
 */

import { BaseLLMProvider, type ProviderConfig, type UsageStats } from './BaseLLMProvider';
import type { LLMRequest, LLMResponse } from '../types/index';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface OpenAIModelConfig {
  maxTokens: number;
  supportsVision: boolean;
  supportsFunctions: boolean;
  costPer1kInput: number;
  costPer1kOutput: number;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface OpenAIFunction {
  name: string;
  description?: string;
  parameters: Record<string, any>;
}

export interface OpenAICompletionParams extends LLMRequest {
  model?: string;
  messages: OpenAIMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  functions?: OpenAIFunction[];
  functionCall?: string | { name: string };
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      function_call?: {
        name: string;
        arguments: string;
      };
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIStreamChunk {
  content: string;
  role: string;
  isStream: boolean;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  model?: string;
}

// =============================================================================
// OPENAI PROVIDER CLASS
// =============================================================================

/**
 * OpenAIProvider - Implements OpenAI-specific API integration
 * Extends base provider with OpenAI's unique features
 */
export class OpenAIProvider extends BaseLLMProvider {

  constructor(apiKey: string, config: ProviderConfig = {}) {
    super(apiKey, config);

    this.baseURL = 'https://api.openai.com/v1';
    this.models = config.models || [
      'gpt-4-turbo-preview',
      'gpt-4-vision-preview',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
    ];

    // Model-specific configurations
    this.modelConfigs = {
      'gpt-4-turbo-preview': {
        maxTokens: 128000,
        supportsVision: false,
        supportsFunctions: true,
        costPer1kInput: 0.01,
        costPer1kOutput: 0.03,
      },
      'gpt-4-vision-preview': {
        maxTokens: 128000,
        supportsVision: true,
        supportsFunctions: false,
        costPer1kInput: 0.01,
        costPer1kOutput: 0.03,
      },
      'gpt-3.5-turbo': {
        maxTokens: 4096,
        supportsVision: false,
        supportsFunctions: true,
        costPer1kInput: 0.0005,
        costPer1kOutput: 0.0015,
      },
      'gpt-3.5-turbo-16k': {
        maxTokens: 16384,
        supportsVision: false,
        supportsFunctions: true,
        costPer1kInput: 0.003,
        costPer1kOutput: 0.004,
      },
    };
  }

  /**
   * Generate completion with OpenAI Chat Completions API
   * Implements streaming and function calling support
   */
  async generateCompletion(params: LLMRequest): Promise<LLMResponse> {
    const {
      model = 'gpt-3.5-turbo',
      messages: rawMessages,
      systemMessage,
      temperature = 0.7,
      maxTokens = 500,
      stream = false,
      tools = null,
    } = params;

    // Convert to OpenAI format
    const messages: OpenAIMessage[] = rawMessages ? 
      rawMessages.map((msg: any) => ({
        role: msg.role || 'user',
        content: msg.content || ''
      })) : 
      [{ role: 'user', content: params.prompt || '' }];

    // Validate model availability
    if (!this.models.includes(model)) {
      throw new Error(`Model ${model} not available for OpenAI provider`);
    }

    // Construct messages array with system prompt
    const fullMessages: OpenAIMessage[] = [];
    if (systemMessage) {
      fullMessages.push({ role: 'system', content: systemMessage });
    }
    fullMessages.push(...messages);

    // Build request payload
    const payload: any = {
      model,
      messages: fullMessages,
      temperature,
      max_tokens: maxTokens,
      stream,
    };

    // Add function calling if supported
    if (tools && this.modelConfigs[model]?.supportsFunctions) {
      payload.functions = tools;
      // Note: function_call handling can be added here if needed
    }

    try {
      const response = await this.makeRequest('/chat/completions', payload);

      if (stream) {
        return {
          provider: 'openai',
          model,
          isStream: true,
          stream: this.handleStreamResponse(response as any),
        };
      } else {
        return this.formatResponse(response, model);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make HTTP request to OpenAI API
   * Implements retry logic and error handling
   */
  private async makeRequest(endpoint: string, payload: any, retries: number = 3): Promise<OpenAIResponse> {
    const url = `${this.baseURL}${endpoint}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'OpenAI-Beta': 'assistants=v1',
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
   * Format OpenAI response to standard format
   * Implements response normalization
   */
  private formatResponse(response: OpenAIResponse, model: string): LLMResponse {
    const choice = response.choices?.[0];
    
    if (!choice) {
      throw new Error('No choices in OpenAI response');
    }

    return {
      content: choice.message?.content || '',
      role: choice.message?.role || 'assistant',
      functionCall: choice.message?.function_call,
      finishReason: choice.finish_reason || 'unknown',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
        model,
        estimatedCost: this.calculateCost({
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        }, model),
      },
      provider: 'openai',
      model,
      id: response.id,
      created: response.created,
      choices: response.choices,
    };
  }

  /**
   * Handle streaming response
   * Implements Server-Sent Events parsing
   */
  private async *handleStreamResponse(response: Response): AsyncGenerator<OpenAIStreamChunk> {
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
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.choices[0].delta.content) {
              yield {
                content: parsed.choices[0].delta.content,
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
  private calculateCost(usage: UsageStats, model: string): number {
    const config = this.modelConfigs[model];
    if (!config) {
      return 0;
    }

    const inputCost = (usage.promptTokens / 1000) * config.costPer1kInput;
    const outputCost = (usage.completionTokens / 1000) * config.costPer1kOutput;

    return inputCost + outputCost;
  }

  /**
   * Test API connection
   * Implements connection validation
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateCompletion({
        prompt: 'Hello',
        context: {
          currentTopic: 'test',
          conversationHistory: [],
          relevantDocuments: [],
          participantContext: {},
          meetingPhase: 'opening'
        },
        callType: 'interview',
        tone: 'professional',
        model: 'gpt-3.5-turbo',
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
    } else if (message.includes('context length')) {
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

  /**
   * Get detailed connection test result
   */
  async getConnectionTestResult(): Promise<ConnectionTestResult> {
    try {
      const response = await this.generateCompletion({
        prompt: 'Hello',
        context: {
          currentTopic: 'test',
          conversationHistory: [],
          relevantDocuments: [],
          participantContext: {},
          meetingPhase: 'opening'
        },
        callType: 'interview',
        tone: 'professional',
        model: 'gpt-3.5-turbo',
        maxTokens: 10,
      });

      return {
        success: true,
        message: 'Connection successful',
        model: response.model,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
} 
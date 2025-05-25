/**
 * GeminiProvider - Google Gemini API integration
 * Implements multimodal capabilities and function calling
 * Provides robust error handling and safety settings
 */

import { BaseLLMProvider, type ProviderConfig, type UsageStats } from './BaseLLMProvider';
import type { LLMRequest, LLMResponse } from '../types/index';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface GeminiModelConfig {
  maxTokens: number;
  supportsVision: boolean;
  supportsFunctions: boolean;
  costPer1kInput: number;
  costPer1kOutput: number;
}

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }>;
}

export interface GeminiCompletionParams {
  prompt?: string;
  context?: any;
  callType?: any;
  tone?: any;
  model?: string;
  messages?: any[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  functions?: any[];
  [key: string]: any;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: string;
    index: number;
    safetyRatings: any[];
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

// =============================================================================
// GEMINI PROVIDER CLASS
// =============================================================================

/**
 * GeminiProvider - Implements Google's Gemini API
 * Extends base provider with Gemini-specific features
 */
export class GeminiProvider extends BaseLLMProvider {
  private readonly defaultSafetySettings: any[];

  constructor(apiKey: string, config: ProviderConfig = {}) {
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
  async generateCompletion(params: LLMRequest | GeminiCompletionParams): Promise<LLMResponse> {
    const {
      model = 'gemini-pro',
      messages,
      temperature = 0.7,
      maxTokens = 500,
      stream = false,
    } = params;
    
    const systemPrompt = 'systemPrompt' in params ? params.systemPrompt : undefined;
    const functions = 'functions' in params ? params.functions : null;

    // Validate model
    if (!this.models.includes(model)) {
      throw new Error(`Model ${model} not available for Gemini provider`);
    }

    // Format messages for Gemini
    const messageArray = Array.isArray(messages) ? messages : [];
    const contents = this.formatMessagesForGemini(messageArray, systemPrompt);

    // Build request payload
    const payload: any = {
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
        return {
          provider: 'gemini',
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
   * Format messages for Gemini API
   * Implements Gemini-specific content structure
   */
  private formatMessagesForGemini(messages: any[], systemPrompt?: string): GeminiMessage[] {
    const contents: GeminiMessage[] = [];

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
          role: role as 'user' | 'model',
          parts: [{ text: msg.content }],
        });
      } else if (Array.isArray(msg.content)) {
        // Multimodal message with text and images
        const parts = msg.content
          .map((part: any) => {
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

        contents.push({ role: role as 'user' | 'model', parts });
      }
    });

    return contents;
  }

  /**
   * Make HTTP request to Gemini API
   * Implements API key authentication
   */
  private async makeRequest(endpoint: string, payload: any, retries: number = 3): Promise<GeminiResponse> {
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

    throw new Error('Max retries exceeded');
  }

  /**
   * Format Gemini response to standard format
   * Implements response normalization
   */
  private formatResponse(response: GeminiResponse, model: string): LLMResponse {
    const candidate = response.candidates?.[0];
    
    if (!candidate) {
      throw new Error('No candidates in Gemini response');
    }

    const content = candidate.content?.parts?.[0]?.text || '';

    return {
      content,
      role: 'assistant',
      finishReason: candidate.finishReason,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0,
        model,
        estimatedCost: this.calculateCost({
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        }, model),
      },
      provider: 'gemini',
      model,
      safetyRatings: candidate.safetyRatings,
    };
  }

  /**
   * Handle streaming response
   * Implements Server-Sent Events parsing for Gemini
   */
  private async *handleStreamResponse(response: Response): AsyncGenerator<any> {
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
            if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
              yield {
                content: parsed.candidates[0].content.parts[0].text,
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
        model: 'gemini-pro',
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
    } else if (message.includes('quota')) {
      return new Error('API quota exceeded');
    } else if (message.includes('safety')) {
      return new Error('Content blocked by safety filters');
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
/**
 * BaseLLMProvider - Abstract base class for LLM providers
 * Implements Template Method pattern for provider consistency
 * Provides shared functionality and interface contracts
 */

import type { LLMRequest, LLMResponse } from '../types/index';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ProviderConfig {
  models?: string[];
  capabilities?: string[];
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface RateLimits {
  requestsPerMinute: number;
  tokensPerMinute: number;
  requestsPerDay: number;
}

export interface RequestHistoryEntry {
  time: number;
  tokens: number;
}

export interface ModelConfig {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  supportsVision?: boolean;
  supportsFunctions?: boolean;
  costPer1kInput?: number;
  costPer1kOutput?: number;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UsageStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// =============================================================================
// BASE LLM PROVIDER CLASS
// =============================================================================

/**
 * BaseLLMProvider - Foundation for all LLM provider implementations
 * Defines common interface and shared utilities
 */
export abstract class BaseLLMProvider {
  protected readonly apiKey: string;
  protected readonly config: ProviderConfig;
  protected baseURL: string;
  protected models: string[];
  protected capabilities: string[];
  protected rateLimits: RateLimits;
  protected requestHistory: number[];
  protected tokenHistory: RequestHistoryEntry[];
  protected modelConfigs: Record<string, ModelConfig> = {};

  constructor(apiKey: string, config: ProviderConfig = {}) {
    if (new.target === BaseLLMProvider) {
      throw new Error('BaseLLMProvider is an abstract class and cannot be instantiated directly');
    }

    this.apiKey = apiKey;
    this.config = config;
    this.baseURL = config.baseURL || '';
    this.models = config.models || [];
    this.capabilities = config.capabilities || [];

    // Rate limiting configuration
    this.rateLimits = {
      requestsPerMinute: 60,
      tokensPerMinute: 90000,
      requestsPerDay: 10000,
    };

    // Request tracking for rate limiting
    this.requestHistory = [];
    this.tokenHistory = [];
  }

  /**
   * Generate completion - must be implemented by subclasses
   * @abstract
   */
  abstract generateCompletion(params: LLMRequest): Promise<LLMResponse>;

  /**
   * Test API connection - must be implemented by subclasses
   * @abstract
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Check rate limits before making request
   * Implements rate limiting logic
   */
  protected checkRateLimits(estimatedTokens: number = 0): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneDayAgo = now - 86400000;

    // Clean old history
    this.requestHistory = this.requestHistory.filter((time) => time > oneDayAgo);
    this.tokenHistory = this.tokenHistory.filter((entry) => entry.time > oneMinuteAgo);

    // Check requests per minute
    const recentRequests = this.requestHistory.filter((time) => time > oneMinuteAgo).length;
    if (recentRequests >= this.rateLimits.requestsPerMinute) {
      throw new Error('Rate limit exceeded: requests per minute');
    }

    // Check tokens per minute
    const recentTokens = this.tokenHistory
      .filter((entry) => entry.time > oneMinuteAgo)
      .reduce((sum, entry) => sum + entry.tokens, 0);

    if (recentTokens + estimatedTokens > this.rateLimits.tokensPerMinute) {
      throw new Error('Rate limit exceeded: tokens per minute');
    }

    // Check daily limit
    if (this.requestHistory.length >= this.rateLimits.requestsPerDay) {
      throw new Error('Rate limit exceeded: daily request limit');
    }
  }

  /**
   * Record request for rate limiting
   * Updates tracking history
   */
  protected recordRequest(tokens: number): void {
    const now = Date.now();
    this.requestHistory.push(now);
    this.tokenHistory.push({ time: now, tokens });
  }

  /**
   * Estimate token count for text
   * Implements basic tokenization heuristic
   */
  protected estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Validate model selection
   * Ensures model is available
   */
  protected validateModel(model: string): void {
    if (!this.models.includes(model)) {
      throw new Error(`Model ${model} is not available for this provider`);
    }
  }

  /**
   * Check if capability is supported
   * Validates provider capabilities
   */
  public hasCapability(capability: string): boolean {
    return this.capabilities.includes(capability);
  }

  /**
   * Format messages for API
   * Normalizes message format
   */
  protected formatMessages(messages: (string | Message)[]): Message[] {
    return messages.map((msg) => {
      if (typeof msg === 'string') {
        return { role: 'user' as const, content: msg };
      }
      return {
        role: msg.role || 'user',
        content: msg.content || '',
      };
    });
  }

  /**
   * Handle common error scenarios
   * Provides consistent error handling
   */
  protected handleCommonErrors(error: any): never {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('unauthorized') || message.includes('401')) {
      throw new Error('Authentication failed. Please check your API key.');
    }

    if (message.includes('rate limit') || message.includes('429')) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (message.includes('timeout')) {
      throw new Error('Request timed out. Please try again.');
    }

    if (message.includes('network')) {
      throw new Error('Network error. Please check your connection.');
    }

    throw error;
  }

  /**
   * Get model configuration
   * Returns model-specific settings
   */
  protected getModelConfig(model: string): ModelConfig | null {
    return this.modelConfigs?.[model] || null;
  }

  /**
   * Calculate pricing for usage
   * Must be implemented by subclasses if pricing is supported
   */
  public calculatePricing(usage: UsageStats, model: string): number {
    return 0; // Default implementation
  }

  /**
   * Get available models
   */
  public getModels(): readonly string[] {
    return Object.freeze([...this.models]);
  }

  /**
   * Get provider capabilities
   */
  public getCapabilities(): readonly string[] {
    return Object.freeze([...this.capabilities]);
  }
} 
/**
 * API-related Type Definitions
 * Types for external API integrations and responses
 */

// =============================================================================
// BASE API TYPES
// =============================================================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
  requestId?: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
  requestId?: string;
}

export interface APIRequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

// =============================================================================
// LLM API TYPES
// =============================================================================

export interface LLMAPIRequest {
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  metadata?: Record<string, unknown>;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  metadata?: Record<string, unknown>;
}

export interface LLMAPIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: LLMChoice[];
  usage: TokenUsage;
  metadata?: Record<string, unknown>;
}

export interface LLMChoice {
  index: number;
  message: LLMMessage;
  finishReason: 'stop' | 'length' | 'content_filter' | 'function_call';
  logprobs?: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// =============================================================================
// OPENAI API TYPES
// =============================================================================

export interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  organization?: string;
  project?: string;
  defaultModel?: string;
  timeout?: number;
}

export interface OpenAIRequest extends LLMAPIRequest {
  functions?: OpenAIFunction[];
  functionCall?: 'auto' | 'none' | { name: string };
  stop?: string | string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
  logitBias?: Record<string, number>;
  user?: string;
}

export interface OpenAIFunction {
  name: string;
  description?: string;
  parameters: Record<string, unknown>;
}

// =============================================================================
// ANTHROPIC API TYPES
// =============================================================================

export interface AnthropicConfig {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  timeout?: number;
}

export interface AnthropicRequest {
  model: string;
  messages: LLMMessage[];
  maxTokens: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  system?: string;
  metadata?: Record<string, unknown>;
}

export interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: AnthropicContent[];
  model: string;
  stopReason: 'end_turn' | 'max_tokens' | 'stop_sequence';
  stopSequence?: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface AnthropicContent {
  type: 'text';
  text: string;
}

// =============================================================================
// GOOGLE GEMINI API TYPES
// =============================================================================

export interface GeminiConfig {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  timeout?: number;
}

export interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: GeminiGenerationConfig;
  safetySettings?: GeminiSafetySetting[];
  tools?: GeminiTool[];
}

export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

export interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
  functionCall?: {
    name: string;
    args: Record<string, unknown>;
  };
  functionResponse?: {
    name: string;
    response: Record<string, unknown>;
  };
}

export interface GeminiGenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  candidateCount?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
}

export interface GeminiSafetySetting {
  category: string;
  threshold: string;
}

export interface GeminiTool {
  functionDeclarations: GeminiFunctionDeclaration[];
}

export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface GeminiResponse {
  candidates: GeminiCandidate[];
  promptFeedback?: GeminiPromptFeedback;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface GeminiCandidate {
  content: GeminiContent;
  finishReason: string;
  index: number;
  safetyRatings: GeminiSafetyRating[];
}

export interface GeminiPromptFeedback {
  safetyRatings: GeminiSafetyRating[];
  blockReason?: string;
}

export interface GeminiSafetyRating {
  category: string;
  probability: string;
}

// =============================================================================
// TRANSCRIPTION API TYPES
// =============================================================================

export interface TranscriptionAPIRequest {
  audio: Blob | ArrayBuffer;
  language?: string;
  model?: string;
  prompt?: string;
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
  timestampGranularities?: ('word' | 'segment')[];
}

export interface TranscriptionAPIResponse {
  text: string;
  language?: string;
  duration?: number;
  words?: TranscriptionWord[];
  segments?: TranscriptionSegment[];
}

export interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
  confidence?: number;
}

export interface TranscriptionSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avgLogprob: number;
  compressionRatio: number;
  noSpeechProb: number;
}

// =============================================================================
// EXPORT UNION TYPES
// =============================================================================

export type SupportedLLMProvider = 'openai' | 'anthropic' | 'gemini';

export type LLMConfig = OpenAIConfig | AnthropicConfig | GeminiConfig;

export type LLMProviderResponse = OpenAIRequest | AnthropicRequest | GeminiRequest; 
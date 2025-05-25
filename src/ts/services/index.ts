/**
 * TypeScript Services Index
 * Centralized exports for all TypeScript services
 */

// Core Services
export { PerformanceAnalyzer } from './performanceAnalyzer';
export { LLMOrchestrator } from './llmOrchestrator';
export { DocumentManager } from './documentManager';
export { ContextManager } from './contextManager';
export { SpeechToText } from './SpeechToText';
export { ResumeParser } from './resumeParser';

// Utilities
export { SecureStorage, StorageNamespaces } from '../utils/storage';
export { MessageBroker } from '../utils/messaging';

// Constants (specific exports to avoid conflicts)
export {
  MESSAGE_COMMANDS,
  PORT_COMMANDS,
  CALL_TYPES,
  TONE_TYPES,
  DOCUMENT_TYPES,
  PRIORITY_LEVELS,
  DEFAULT_APP_CONFIG,
  CALL_TYPE_CONFIGS,
  TONE_CONFIGS
} from '../utils/constants';

// Type exports (specific to avoid conflicts)
export type {
  CallType,
  ToneType,
  DocumentType,
  PriorityLevel,
  LLMProvider,
  LLMRequest,
  LLMResponse,
  DocumentMetadata,
  DocumentContent,
  MeetingContext,
  ContextualResponse
} from '../types/index';

// API Providers
export { OpenAIProvider } from '../api/openai';
export { AnthropicProvider } from '../api/anthropic';
export { GeminiProvider } from '../api/gemini';
export { BaseLLMProvider } from '../api/BaseLLMProvider';

// UI Components
export { MeetingControls } from '../ui/MeetingControls';

// Platform-specific utilities (if any exist)
// export * from '../platforms/index'; 
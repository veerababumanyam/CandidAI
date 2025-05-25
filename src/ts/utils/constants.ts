/**
 * CandidAI Chrome Extension - Constants
 * Centralized configuration and constants for enterprise-grade development
 * Implements type-safe constants with proper categorization
 */

/**
 * CandidAI Meeting Assistant - Core Constants
 * Enterprise-grade configuration management for multi-context AI assistance
 * Supports interviews, sales, meetings, reviews, and various interaction tones
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface LLMPreferences {
  preferredProvider: 'openai' | 'anthropic' | 'gemini';
  fallbackOrder: readonly ('openai' | 'anthropic' | 'gemini')[];
  modelPreferences: {
    openai: string;
    anthropic: string;
    gemini: string;
  };
}

export interface UIPreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  autoScroll: boolean;
  language: string;
}

export interface TranscriptionPreferences {
  language: string;
  useExternalStt: boolean;
  silenceThreshold: number;
  silenceDuration: number;
}

export interface ResponsePreferences {
  tone: 'professional' | 'casual' | 'formal';
  length: 'short' | 'medium' | 'long';
  detailLevel: 'low' | 'medium' | 'high';
}

export interface SessionManagement {
  autoCleanupDelayMs: number;
  maxActiveSessions: number;
}

export interface SpeechToTextConfig {
  enableQuestionDetection: boolean;
  questionDetectionMethod: 'punctuation' | 'ml_model' | 'keyword_based';
  questionKeywords: string[];
  enableSpeakerDiarization: boolean;
  defaultSpeaker: 'interviewer' | 'candidate' | 'unknown';
  confidenceThreshold: number;
}

export interface AppConfig {
  llmPreferences: LLMPreferences;
  uiPreferences: UIPreferences;
  transcriptionPreferences: TranscriptionPreferences;
  responsePreferences: ResponsePreferences;
  sessionManagement: SessionManagement;
  speechToTextConfig: SpeechToTextConfig;
}

export interface SessionMetadata {
  platform?: string;
  tabId?: number;
  initiatedTs?: number;
  uiConnected?: boolean;
  company?: string;
  position?: string;
  initiatedBy?: string;
  [key: string]: any; // Allow additional metadata fields
}

export interface InterviewSession {
  id: string;
  platform: string;
  startTime: number;
  endTime?: number;
  state: 'ACTIVE' | 'ENDING' | 'ENDED' | 'ERROR_ANALYSIS_FAILED' | 'PORT_DISCONNECTED';
  transcriptions: TranscriptionEntry[];
  suggestions: SuggestionEntry[];
  metadata: SessionMetadata;
  context?: any; // Context from ContextManager
  report?: any; // Final report from PerformanceAnalyzer
  error?: string;
}

export interface TranscriptionEntry {
  text: string;
  timestamp: number;
  confidence: number;
  isQuestion: boolean;
  speaker?: string;
  suggestions?: SuggestionEntry[];
}

export interface SuggestionEntry {
  id?: string;
  text: string;
  type?: string;
  confidence?: number;
  timestamp: number;
  wasUsed?: boolean;
}

export interface TranscriptionData {
  text: string;
  confidence?: number;
  isQuestion?: boolean;
  speaker?: string;
  timestamp?: number;
}

export interface MessagePayload {
  command: string;
  payload?: any;
}

export interface ServiceWorkerResponse {
  success: boolean;
  data?: any;
  error?: string;
  details?: string;
}

export interface PortMessage {
  command: string;
  payload?: any;
}

// =============================================================================
// MESSAGE COMMANDS
// =============================================================================

export const MESSAGE_COMMANDS = {
  // Session Management
  INIT_INTERVIEW_SESSION: 'init_interview_session',
  END_INTERVIEW_SESSION: 'end_interview_session',
  UPDATE_CONTEXT: 'update_context',
  GET_APP_STATE: 'get_app_state',

  // Transcription
  START_TRANSCRIPTION: 'start_transcription',
  STOP_TRANSCRIPTION: 'stop_transcription',
  PROCESS_TRANSCRIPTION: 'process_transcription',

  // Audio Processing
  START_AUDIO_CAPTURE: 'start_audio_capture',
  STOP_AUDIO_CAPTURE: 'stop_audio_capture',
  AUDIO_DATA: 'audio_data',

  // Platform Detection
  PLATFORM_DETECTED: 'platform_detected',
  GET_PLATFORM_STATUS: 'get_platform_status',
  VIDEO_CALL_STATE_CHANGED: 'video_call_state_changed',

  // Content Script
  EXTRACT_PAGE_CONTEXT: 'extract_page_context',
  INJECT_UI: 'inject_ui',

  // Visual Analysis
  CAPTURE_VISUAL: 'capture_visual',
  ANALYZE_VISUAL: 'analyze_visual',

  // Document Management
  UPLOAD_DOCUMENT: 'upload_document',
  PROCESS_DOCUMENT: 'process_document',
  GET_DOCUMENTS: 'get_documents',

  // AI Responses
  GET_SUGGESTION: 'get_suggestion',
  GENERATE_RESPONSE: 'generate_response',

  // Testing
  TEST_LLM_CONNECTION: 'test_llm_connection',
  TEST_PLATFORM_DETECTION: 'test_platform_detection',
  PING: 'ping',
} as const;

export type MessageCommand = typeof MESSAGE_COMMANDS[keyof typeof MESSAGE_COMMANDS];

// =============================================================================
// MESSAGE TARGETS
// =============================================================================

export const MESSAGE_TARGETS = {
  SERVICE_WORKER: 'service_worker',
  CONTENT_SCRIPT: 'content_script',
  SIDE_PANEL: 'side_panel',
  OPTIONS_PAGE: 'options_page',
  OFFSCREEN: 'offscreen',
} as const;

// =============================================================================
// PORT COMMANDS
// =============================================================================

export const PORT_COMMANDS = {
  SERVICE_WORKER_READY: 'service_worker_ready',
  SIDE_PANEL_READY: 'side_panel_ready',
  CONNECTION_ESTABLISHED: 'connection_established',
  HEARTBEAT: 'heartbeat',
} as const;

// =============================================================================
// STORAGE KEYS
// =============================================================================

export const STORAGE_KEYS = {
  APP_CONFIG: 'app_config',
  USER_PREFERENCES: 'user_preferences',
  SESSION_DATA: 'session_data',
  ACTIVE_INTERVIEW: 'active_interview',
  DOCUMENT_CACHE: 'document_cache',
  PERFORMANCE_METRICS: 'performance_metrics',
  ERROR_LOGS: 'error_logs',
  AUDIT_TRAIL: 'audit_trail',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// =============================================================================
// OFFSCREEN DOCUMENT CONFIGURATION
// =============================================================================

export const OFFSCREEN_DOCUMENT_PATH = 'offscreen/offscreen.html';

export const OFFSCREEN_REASONS = (typeof chrome !== 'undefined' && chrome.offscreen) ? [
  chrome.offscreen.Reason.USER_MEDIA,
  chrome.offscreen.Reason.AUDIO_PLAYBACK,
] : ['USER_MEDIA', 'AUDIO_PLAYBACK'] as const;

export const OFFSCREEN_JUSTIFICATION = 
  'Recording audio for AI-powered meeting assistance and transcription';

// =============================================================================
// PLATFORM CONFIGURATIONS
// =============================================================================

export const SUPPORTED_PLATFORMS = {
  GOOGLE_MEET: {
    name: 'Google Meet',
    domain: 'meet.google.com',
    selectors: {
      videoContainer: '[data-allocation-index]',
      participantsList: '[data-participant-id]',
      chatButton: '[data-tooltip*="chat"]',
      micButton: '[data-tooltip*="microphone"]',
      cameraButton: '[data-tooltip*="camera"]',
    },
  },
  ZOOM: {
    name: 'Zoom',
    domain: 'zoom.us',
    selectors: {
      videoContainer: '.video-container',
      participantsList: '.participants-list',
      chatButton: '.chat-button',
      micButton: '.audio-button',
      cameraButton: '.video-button',
    },
  },
  MICROSOFT_TEAMS: {
    name: 'Microsoft Teams',
    domain: 'teams.microsoft.com',
    selectors: {
      videoContainer: '[data-tid="video-container"]',
      participantsList: '[data-tid="participants-list"]',
      chatButton: '[data-tid="chat-button"]',
      micButton: '[data-tid="microphone-button"]',
      cameraButton: '[data-tid="camera-button"]',
    },
  },
  LINKEDIN: {
    name: 'LinkedIn',
    domain: 'linkedin.com',
    selectors: {
      interviewContainer: '.interview-container',
      questionText: '.question-text',
      answerInput: '.answer-input',
      submitButton: '.submit-button',
    },
  },
  HIREVUE: {
    name: 'HireVue',
    domain: 'hirevue.com',
    selectors: {
      questionContainer: '.question-container',
      videoPlayer: '.video-player',
      recordButton: '.record-button',
      submitButton: '.submit-button',
    },
  },
} as const;

// =============================================================================
// LLM PROVIDER CONFIGURATIONS
// =============================================================================

export const LLM_PROVIDERS = {
  OPENAI: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    maxTokens: 4096,
    rateLimits: {
      requestsPerMinute: 60,
      tokensPerMinute: 90000,
      dailyLimit: 1000000,
    },
  },
  ANTHROPIC: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    maxTokens: 4096,
    rateLimits: {
      requestsPerMinute: 50,
      tokensPerMinute: 40000,
      dailyLimit: 500000,
    },
  },
  GOOGLE: {
    name: 'Google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
    models: ['gemini-pro', 'gemini-pro-vision'],
    maxTokens: 2048,
    rateLimits: {
      requestsPerMinute: 60,
      tokensPerMinute: 32000,
      dailyLimit: 1000000,
    },
  },
} as const;

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

export const DEFAULT_APP_CONFIG = {
  version: '1.0.0',
  environment: 'production' as const,
  features: {
    enableTranscription: true,
    enableAIResponses: true,
    enableDocumentAnalysis: true,
    enableVisualAnalysis: true,
    enablePerformanceTracking: true,
    enableDebugMode: false,
  },
  llmProviders: [
    {
      name: 'OpenAI',
      apiKey: '',
      baseUrl: LLM_PROVIDERS.OPENAI.baseUrl,
      model: 'gpt-4',
      maxTokens: 2048,
      temperature: 0.7,
      isEnabled: false,
      priority: 1,
      rateLimits: LLM_PROVIDERS.OPENAI.rateLimits,
    },
    {
      name: 'Anthropic',
      apiKey: '',
      baseUrl: LLM_PROVIDERS.ANTHROPIC.baseUrl,
      model: 'claude-3-sonnet',
      maxTokens: 2048,
      temperature: 0.7,
      isEnabled: false,
      priority: 2,
      rateLimits: LLM_PROVIDERS.ANTHROPIC.rateLimits,
    },
  ],
  ui: {
    theme: 'auto' as const,
    language: 'en',
    fontSize: 'medium' as const,
    animations: true,
    notifications: true,
  },
  security: {
    encryptStorage: true,
    validateInputs: true,
    rateLimiting: true,
    auditLogging: true,
    csrfProtection: true,
  },
  performance: {
    enableMetrics: true,
    sampleRate: 0.1,
    maxHistorySize: 1000,
    alertThresholds: {
      responseTime: 5000,
      errorRate: 0.05,
      memoryUsage: 100 * 1024 * 1024, // 100MB
    },
  },
} as const;

// =============================================================================
// AUDIO CONFIGURATION
// =============================================================================

export const AUDIO_CONFIG = {
  SAMPLE_RATE: 16000,
  CHANNELS: 1,
  BIT_DEPTH: 16,
  BUFFER_SIZE: 4096,
  SILENCE_THRESHOLD: 0.01,
  SILENCE_DURATION: 1000, // ms
  MAX_RECORDING_DURATION: 300000, // 5 minutes
} as const;

// =============================================================================
// UI CONSTANTS
// =============================================================================

export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 5000,
  MAX_SUGGESTIONS: 5,
  MAX_CONVERSATION_HISTORY: 100,
  SCROLL_THRESHOLD: 100,
} as const;

// =============================================================================
// ERROR CODES
// =============================================================================

export const ERROR_CODES = {
  // General
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INITIALIZATION_FAILED: 'INITIALIZATION_FAILED',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',

  // Authentication
  API_KEY_MISSING: 'API_KEY_MISSING',
  API_KEY_INVALID: 'API_KEY_INVALID',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',

  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Audio
  AUDIO_PERMISSION_DENIED: 'AUDIO_PERMISSION_DENIED',
  AUDIO_DEVICE_ERROR: 'AUDIO_DEVICE_ERROR',
  TRANSCRIPTION_FAILED: 'TRANSCRIPTION_FAILED',

  // Platform
  PLATFORM_NOT_SUPPORTED: 'PLATFORM_NOT_SUPPORTED',
  PLATFORM_DETECTION_FAILED: 'PLATFORM_DETECTION_FAILED',

  // Document
  DOCUMENT_UPLOAD_FAILED: 'DOCUMENT_UPLOAD_FAILED',
  DOCUMENT_PROCESSING_FAILED: 'DOCUMENT_PROCESSING_FAILED',
  DOCUMENT_TOO_LARGE: 'DOCUMENT_TOO_LARGE',

  // Storage
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_ACCESS_DENIED: 'STORAGE_ACCESS_DENIED',
} as const;

// =============================================================================
// PERFORMANCE THRESHOLDS
// =============================================================================

export const PERFORMANCE_THRESHOLDS = {
  RESPONSE_TIME_WARNING: 2000, // ms
  RESPONSE_TIME_ERROR: 5000, // ms
  MEMORY_WARNING: 50 * 1024 * 1024, // 50MB
  MEMORY_ERROR: 100 * 1024 * 1024, // 100MB
  ERROR_RATE_WARNING: 0.02, // 2%
  ERROR_RATE_ERROR: 0.05, // 5%
} as const;

// =============================================================================
// SECURITY CONSTANTS
// =============================================================================

export const SECURITY_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['pdf', 'docx', 'txt', 'md'],
  MAX_API_KEY_LENGTH: 256,
  MIN_PASSWORD_LENGTH: 8,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  ENCRYPTION_ALGORITHM: 'AES-GCM',
} as const;

// =============================================================================
// UI CONFIGURATION CONSTANTS
// =============================================================================

export const CALL_TYPES = {
  INTERVIEW: 'interview',
  MEETING: 'meeting', 
  PRESENTATION: 'presentation',
  TRAINING: 'training',
} as const;

export const TONE_TYPES = {
  PROFESSIONAL: 'professional',
  CASUAL: 'casual',
  FORMAL: 'formal',
  FRIENDLY: 'friendly',
} as const;

export const CALL_TYPE_CONFIGS = {
  [CALL_TYPES.INTERVIEW]: {
    name: 'Interview',
    description: 'One-on-one interview session',
    suggestedTone: TONE_TYPES.PROFESSIONAL,
    features: ['transcription', 'suggestions', 'document_analysis'],
  },
  [CALL_TYPES.MEETING]: {
    name: 'Meeting',
    description: 'Team meeting or group discussion',
    suggestedTone: TONE_TYPES.PROFESSIONAL,
    features: ['transcription', 'action_items', 'summary'],
  },
  [CALL_TYPES.PRESENTATION]: {
    name: 'Presentation',
    description: 'Presentation or demo session',
    suggestedTone: TONE_TYPES.FORMAL,
    features: ['visual_analysis', 'audience_feedback'],
  },
  [CALL_TYPES.TRAINING]: {
    name: 'Training',
    description: 'Training or educational session',
    suggestedTone: TONE_TYPES.FRIENDLY,
    features: ['knowledge_base', 'q_and_a'],
  },
} as const;

export const TONE_CONFIGS = {
  [TONE_TYPES.PROFESSIONAL]: {
    name: 'Professional',
    description: 'Formal business communication',
    style: 'structured',
    vocabulary: 'business',
  },
  [TONE_TYPES.CASUAL]: {
    name: 'Casual',
    description: 'Relaxed conversational style',
    style: 'informal',
    vocabulary: 'everyday',
  },
  [TONE_TYPES.FORMAL]: {
    name: 'Formal',
    description: 'Academic or official communication',
    style: 'precise',
    vocabulary: 'formal',
  },
  [TONE_TYPES.FRIENDLY]: {
    name: 'Friendly',
    description: 'Warm and approachable communication',
    style: 'conversational',
    vocabulary: 'accessible',
  },
} as const;

// =============================================================================
// DOCUMENT MANAGEMENT CONSTANTS
// =============================================================================

export const MAX_DOCUMENTS = 10;

export const SUPPORTED_DOCUMENT_FORMATS = [
  'pdf',
  'docx',
  'txt',
  'md',
  'doc',
  'rtf',
] as const;

// =============================================================================
// DOCUMENT PROCESSING CONSTANTS
// =============================================================================

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

export const DOCUMENT_TYPES = {
  RESUME: 'resume',
  JOB_DESCRIPTION: 'job_description',
  COVER_LETTER: 'cover_letter',
  PORTFOLIO: 'portfolio',
  REFERENCE: 'reference',
  OTHER: 'other',
} as const;

export const PRIORITY_LEVELS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
  CRITICAL: 5,
} as const;

export const DOCUMENT_PROCESSING_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'text/markdown',
    'application/rtf',
  ],
  PROCESSING_TIMEOUT: 30000, // 30 seconds
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type MessageTarget = typeof MESSAGE_TARGETS[keyof typeof MESSAGE_TARGETS];
export type PortCommand = typeof PORT_COMMANDS[keyof typeof PORT_COMMANDS];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type SupportedPlatform = keyof typeof SUPPORTED_PLATFORMS;
export type CallTypeKey = keyof typeof CALL_TYPES;
export type ToneTypeKey = keyof typeof TONE_TYPES;

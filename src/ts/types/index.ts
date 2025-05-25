/**
 * Core Type Definitions for CandidAI Chrome Extension
 * Implements comprehensive typing for enterprise-grade development
 * Follows TypeScript best practices with strict null checks
 */

// =============================================================================
// CHROME EXTENSION TYPES
// =============================================================================

export interface ChromeTab extends chrome.tabs.Tab {
  id: number;
  url: string;
  title: string;
}

export interface ChromeSender extends chrome.runtime.MessageSender {
  tab?: ChromeTab;
}

export interface ChromePort extends chrome.runtime.Port {
  name: string;
  sender?: ChromeSender;
}

// =============================================================================
// MESSAGE SYSTEM TYPES
// =============================================================================

export interface MessageRequest {
  command: string;
  payload?: Record<string, unknown>;
  target?: string;
  sessionId?: string;
  timestamp?: number;
}

export interface MessageResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  details?: string;
  message?: string;
}

// =============================================================================
// SESSION AND METADATA TYPES
// =============================================================================

export interface SessionMetadata {
  sessionId: string;
  callType: 'interview' | 'meeting' | 'presentation' | 'training';
  participantCount: number;
  documentCount: number;
  duration: number;
  platform: string;
  createdAt: Date;
  lastAccessed: Date;
  encrypted: boolean;
  retentionPolicy: 'standard' | 'extended' | 'minimal';
  tabId?: number;
  initiatedTs: number;
  uiConnected: boolean;
}

export interface InterviewContext {
  sessionId: string;
  callType: 'interview' | 'meeting' | 'presentation' | 'training';
  tone: 'professional' | 'casual' | 'formal' | 'friendly';
  documents: DocumentReference[];
  participants: Participant[];
  conversation: ConversationEntry[];
  detectedEntities: Record<string, EntityInfo>;
  currentObjectives: string[];
  performanceMetrics: PerformanceMetrics;
  createdAt: Date;
  lastUpdated: Date;
  platform: string;
  state: 'active' | 'paused' | 'ended' | 'error';
}

export interface DocumentReference {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'md';
  size: number;
  uploadedAt: Date;
  content?: string;
  summary?: string;
  keywords?: string[];
}

export interface Participant {
  id: string;
  name?: string;
  role?: string;
  isHost: boolean;
  joinedAt: Date;
  lastActive: Date;
}

export interface ConversationEntry {
  id: string;
  speaker: string;
  text: string;
  timestamp: Date;
  confidence: number;
  isInterim: boolean;
  language?: string;
}

export interface EntityInfo {
  type: 'person' | 'organization' | 'technology' | 'concept';
  confidence: number;
  mentions: number;
  context: string[];
}

export interface PerformanceMetrics {
  responseTime: number;
  accuracy: number;
  relevanceScore: number;
  documentsProcessed: number;
  suggestionsProvided: number;
  successfulInteractions: number;
}

// =============================================================================
// TRANSCRIPTION TYPES
// =============================================================================

export interface TranscriptionData {
  text: string;
  confidence: number;
  timestamp: Date;
  speaker?: string;
  language?: string;
  isInterim: boolean;
  alternatives?: string[];
}

export interface TranscriptResult {
  text: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
  alternatives: readonly string[];
}

export interface TranscriptBuffer {
  text: string;
  confidence: number;
  timestamp: number;
  sessionId: string;
}

// =============================================================================
// AI RESPONSE TYPES
// =============================================================================

export interface ContextualResponse {
  content: string;
  tone: 'professional' | 'casual' | 'formal' | 'friendly';
  confidence: number;
  relevantDocuments: DocumentReference[];
  supportingPoints: string[];
  followUpQuestions: string[];
  metadata: ResponseMetadata;
}

export interface ResponseMetadata {
  callType: 'interview' | 'meeting' | 'presentation' | 'training';
  responseType: 'answer' | 'suggestion' | 'clarification' | 'summary';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timing: 'immediate' | 'delayed' | 'scheduled';
  length: 'brief' | 'detailed' | 'comprehensive';
}

// =============================================================================
// PLATFORM DETECTION TYPES
// =============================================================================

export interface PlatformDetection {
  platform: string;
  isVideoCall: boolean;
  metadata: Partial<SessionMetadata>;
  confidence: number;
  features: PlatformFeatures;
}

export interface PlatformFeatures {
  hasAudio: boolean;
  hasVideo: boolean;
  hasScreenShare: boolean;
  hasChat: boolean;
  hasRecording: boolean;
  participantCount?: number;
}

// =============================================================================
// LLM PROVIDER TYPES
// =============================================================================

export interface LLMProvider {
  name: string;
  apiKey: string;
  baseUrl?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  isEnabled: boolean;
  priority: number;
  rateLimits: RateLimits;
}

export interface RateLimits {
  requestsPerMinute: number;
  tokensPerMinute: number;
  dailyLimit: number;
}

export interface LLMRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  sessionId?: string;
}

export interface LLMResponse {
  content: string;
  usage: TokenUsage;
  model: string;
  finishReason: string;
  metadata?: Record<string, unknown>;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// =============================================================================
// UI STATE TYPES
// =============================================================================

export interface UIState {
  isVisible: boolean;
  activeTab: string;
  isProcessing: boolean;
  hasErrors: boolean;
  notifications: Notification[];
  theme: 'light' | 'dark' | 'auto';
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  style: 'primary' | 'secondary' | 'danger';
}

// =============================================================================
// STORAGE TYPES
// =============================================================================

export interface StorageData {
  [key: string]: unknown;
}

export interface SecureStorageOptions {
  encrypt?: boolean;
  compress?: boolean;
  ttl?: number;
  namespace?: string;
}

// =============================================================================
// PERFORMANCE TYPES
// =============================================================================

export interface PerformanceMeasurement {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface PerformanceEvent {
  name: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface ExtensionError extends Error {
  code: string;
  context?: Record<string, unknown>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

export interface AppConfig {
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: FeatureFlags;
  llmProviders: LLMProvider[];
  ui: UIConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
}

export interface FeatureFlags {
  enableTranscription: boolean;
  enableAIResponses: boolean;
  enableDocumentAnalysis: boolean;
  enableVisualAnalysis: boolean;
  enablePerformanceTracking: boolean;
  enableDebugMode: boolean;
}

export interface UIConfig {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  notifications: boolean;
}

export interface SecurityConfig {
  encryptStorage: boolean;
  validateInputs: boolean;
  rateLimiting: boolean;
  auditLogging: boolean;
  csrfProtection: boolean;
}

export interface PerformanceConfig {
  enableMetrics: boolean;
  sampleRate: number;
  maxHistorySize: number;
  alertThresholds: Record<string, number>;
}

// =============================================================================
// SPEECH TO TEXT TYPES
// =============================================================================

export interface SpeechToTextResult {
  text: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
  alternatives: readonly string[];
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  bufferSize: number;
  silenceThreshold: number;
  silenceDuration: number;
  maxRecordingDuration: number;
}

// =============================================================================
// UI COMPONENT TYPES
// =============================================================================

export type CallType = 'interview' | 'meeting' | 'presentation' | 'training';
export type ToneType = 'professional' | 'casual' | 'formal' | 'friendly';

export interface DocumentMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
}

export interface MeetingControlsState {
  isRecording: boolean;
  currentCallType: CallType;
  currentTone: ToneType;
  documentCount: number;
  isProcessing: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

export interface DocumentUploadState {
  isUploading: boolean;
  uploadProgress: number;
  error?: string;
  lastUploadedFile?: DocumentMetadata;
}

export interface MeetingContext {
  sessionId: string;
  platform: string;
  startTime: Date;
  participants: Participant[];
  documents: DocumentReference[];
  currentObjectives: string[];
}

// =============================================================================
// STORAGE TYPES
// =============================================================================

export interface StorageProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  getMultiple<T>(keys: string[]): Promise<Record<string, T>>;
  setMultiple<T>(items: Record<string, T>): Promise<void>;
}

export interface EncryptedStorage extends StorageProvider {
  encrypt<T>(data: T): Promise<string>;
  decrypt<T>(encryptedData: string): Promise<T>;
  setEncrypted<T>(key: string, value: T): Promise<void>;
  getEncrypted<T>(key: string): Promise<T | null>;
}

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

export * from './speech';
export * from './platforms';
export * from './api';

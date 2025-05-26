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
  data?: unknown;
}

export interface MessageResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  details?: string;
  message?: string;
}

// =============================================================================
// DOCUMENT TYPES
// =============================================================================

export type DocumentType = 'resume' | 'cover_letter' | 'portfolio' | 'reference' | 'presentation' | 'proposal' | 'case_study' | 'pricing' | 'other';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent' | 'critical' | 'background';

export interface DocumentContent {
  id: string;
  text: string;
  metadata: DocumentMetadata;
  chunks: DocumentChunk[];
  entities: ExtractedEntity[];
  keywords: string[];
  summary: string;
  keyPoints: string[];
  structuredData: Record<string, any>;
  processedAt: Date;
}

export interface DocumentChunk {
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  metadata: Record<string, unknown>;
}

export interface ExtractedEntity {
  text: string;
  type: 'person' | 'organization' | 'technology' | 'concept' | 'skill' | 'location';
  confidence: number;
  startIndex: number;
  endIndex: number;
  context: string;
}

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// =============================================================================
// CONTEXT AND SUGGESTION TYPES
// =============================================================================

export interface SuggestionContext {
  sessionId: string;
  callType: CallType;
  tone: ToneType;
  relevantDocuments: DocumentReference[];
  currentTopic: string;
  conversationHistory: string[];
  participants: Participant[];
  meetingPhase: string;
  participantContext?: Record<string, any>;
}

export interface ContextUpdate {
  sessionId: string;
  transcription: TranscriptionData;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// PERFORMANCE AND REPORTING TYPES
// =============================================================================

export interface PerformanceReport {
  sessionId: string;
  duration: number;
  metrics: PerformanceMetrics;
  events: PerformanceEvent[];
  interviews: Interview[];
  generatedAt: Date;
  startTime?: Date;
}

export interface SuggestionEntry {
  id: string;
  content: string;
  confidence: number;
  relevantDocuments: string[];
  timestamp: Date;
  used: boolean;
  feedback?: 'positive' | 'negative' | 'neutral';
}

export interface Interview {
  sessionId: string;
  metadata: SessionMetadata;
  transcriptions: InterviewTranscription[];
  questions: InterviewQuestion[];
  suggestions: SuggestionEntry[];
  performance: InterviewPerformance;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface InterviewTranscription extends TranscriptionData {
  confidence: number;
  isQuestion?: boolean;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  timestamp: number;
  answered: boolean;
  response?: string;
  confidence?: number;
}

export interface InterviewPerformance {
  questionsAnswered: number;
  averageResponseTime: number;
  confidenceScore: number;
  keyPoints: string[];
  improvements: string[];
}

// =============================================================================
// SESSION AND METADATA TYPES
// =============================================================================

export interface SessionMetadata {
  sessionId: string;
  callType: CallType;
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
  company?: string;
  position?: string;
}

export interface InterviewContext {
  sessionId: string;
  callType: CallType;
  tone: ToneType;
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
  isQuestion?: boolean;
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
  tone: ToneType;
  confidence: number;
  relevantDocuments: DocumentReference[];
  supportingPoints: string[];
  followUpQuestions: string[];
  metadata: ResponseMetadata;
}

export interface ResponseMetadata {
  callType: CallType;
  responseType: 'answer' | 'suggestion' | 'clarification' | 'summary';
  priority: PriorityLevel;
  timing: 'immediate' | 'delayed' | 'scheduled';
  length: 'brief' | 'detailed' | 'comprehensive';
  formality: 'formal' | 'professional' | 'casual' | 'friendly';
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
  generateCompletion(request: LLMRequest): Promise<LLMResponse>;
  getModels?(): string[];
}

export interface RateLimits {
  requestsPerMinute: number;
  tokensPerMinute: number;
  dailyLimit: number;
}

export interface LLMRequest {
  prompt: string;
  context?: string | SuggestionContext;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  sessionId?: string;
  messages?: Array<{ role: string; content: string }>;
  systemMessage?: string;
  stream?: boolean;
  tools?: any[] | null;
  callType?: CallType;
  tone?: ToneType;
}

export interface LLMResponse {
  content: string;
  usage: TokenUsage;
  model: string;
  finishReason: string;
  metadata?: Record<string, unknown>;
  provider?: string;
  text?: string;
  isStream?: boolean;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model?: string;
  estimatedCost?: number;
}

// =============================================================================
// UI STATE AND CONFIGURATION TYPES
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
  type?: string;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface ExtensionError extends Error {
  code: string;
  context?: Record<string, unknown>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sessionId?: string;
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
// AUDIO AND SPEECH TYPES
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
// SPECIFIC FEATURE TYPES
// =============================================================================

export type CallType = 'interview' | 'meeting' | 'presentation' | 'training' | 'sales_pitch' | 'sales_call' | 'client_meeting' | 'team_meeting' | 'one_on_one' | 'performance_review' | 'brainstorming';

export type ToneType = 'professional' | 'casual' | 'formal' | 'friendly' | 'confident' | 'consultative' | 'persuasive' | 'empathetic' | 'analytical' | 'creative' | 'diplomatic';

export interface MeetingControlsState {
  isRecording: boolean;
  isTranscribing: boolean;
  callType: string;
  tone: string;
  documentsLoaded: number;
  aiEnabled?: boolean;
  confidentialityLevel?: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface DocumentUploadState {
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  errors?: string[];
  uploading?: boolean;
  processed?: number;
}

export interface DocumentMetadata {
  id: string;
  name: string;
  size: number;
  type: DocumentType;
  format: string;
  uploadDate: Date;
  priority: PriorityLevel;
  lastModified?: Date;
  tags?: string[];
}

export interface MeetingContext {
  sessionId: string;
  platform: string;
  startTime: Date;
  participants: Participant[];
  documents: DocumentReference[];
  currentObjectives: string[];
  callType?: CallType;
  tone?: ToneType;
}

// =============================================================================
// STORAGE INTERFACE TYPES
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
// CONSTANTS AND ENUMS
// =============================================================================

export const CALL_TYPES = {
  INTERVIEW: 'interview' as const,
  MEETING: 'meeting' as const,
  PRESENTATION: 'presentation' as const,
  TRAINING: 'training' as const,
  SALES_PITCH: 'sales_pitch' as const,
  SALES_CALL: 'sales_call' as const,
  CLIENT_MEETING: 'client_meeting' as const,
  TEAM_MEETING: 'team_meeting' as const,
  ONE_ON_ONE: 'one_on_one' as const,
  PERFORMANCE_REVIEW: 'performance_review' as const,
  BRAINSTORMING: 'brainstorming' as const,
} as const;

export const TONE_TYPES = {
  PROFESSIONAL: 'professional' as const,
  CASUAL: 'casual' as const,
  FORMAL: 'formal' as const,
  FRIENDLY: 'friendly' as const,
  CONFIDENT: 'confident' as const,
  CONSULTATIVE: 'consultative' as const,
  PERSUASIVE: 'persuasive' as const,
  EMPATHETIC: 'empathetic' as const,
  ANALYTICAL: 'analytical' as const,
  CREATIVE: 'creative' as const,
  DIPLOMATIC: 'diplomatic' as const,
} as const;

export const DOCUMENT_TYPES = {
  RESUME: 'resume' as const,
  COVER_LETTER: 'cover_letter' as const,
  PORTFOLIO: 'portfolio' as const,
  REFERENCE: 'reference' as const,
  PRESENTATION: 'presentation' as const,
  PROPOSAL: 'proposal' as const,
  CASE_STUDY: 'case_study' as const,
  PRICING: 'pricing' as const,
  OTHER: 'other' as const,
} as const;

export const PRIORITY_LEVELS = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  URGENT: 'urgent' as const,
  CRITICAL: 'critical' as const,
  BACKGROUND: 'background' as const,
} as const;

// =============================================================================
// TYPE GUARDS AND UTILITIES
// =============================================================================

export function isCallType(value: string): value is CallType {
  return Object.values(CALL_TYPES).includes(value as CallType);
}

export function isToneType(value: string): value is ToneType {
  return Object.values(TONE_TYPES).includes(value as ToneType);
}

export function isDocumentType(value: string): value is DocumentType {
  return Object.values(DOCUMENT_TYPES).includes(value as DocumentType);
}

export function isPriorityLevel(value: string): value is PriorityLevel {
  return Object.values(PRIORITY_LEVELS).includes(value as PriorityLevel);
}

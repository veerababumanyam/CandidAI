/**
 * Platform-specific Type Definitions
 * Types for various video conferencing and interview platforms
 */

// =============================================================================
// PLATFORM ADAPTER TYPES
// =============================================================================

export interface PlatformAdapter {
  initialize(): Promise<void>;
  isInVideoCall(): Promise<boolean>;
  extractMetadata(): Promise<Partial<import('./index').SessionMetadata>>;
  onVideoCallStateChange(callback: (inCall: boolean) => void): void;
  handleMutations?(mutations: MutationRecord[]): void;
  cleanup(): void;
}

export interface PlatformConfig {
  name: string;
  domain: string;
  selectors: PlatformSelectors;
  features?: PlatformCapabilities;
}

export interface PlatformSelectors {
  videoContainer?: string;
  participantsList?: string;
  chatButton?: string;
  micButton?: string;
  cameraButton?: string;
  meetingTitle?: string;
  participantCount?: string;
  // Platform-specific selectors
  [key: string]: string | undefined;
}

export interface PlatformCapabilities {
  hasAudio: boolean;
  hasVideo: boolean;
  hasScreenShare: boolean;
  hasChat: boolean;
  hasRecording: boolean;
  hasParticipantList: boolean;
  supportsBatch?: boolean;
}

// =============================================================================
// PLATFORM-SPECIFIC METADATA
// =============================================================================

export interface GoogleMeetMetadata {
  meetingId?: string;
  meetingCode?: string;
  participantCount?: number;
  isHost?: boolean;
  hasPresentation?: boolean;
  recordingActive?: boolean;
}

export interface ZoomMetadata {
  meetingNumber?: string;
  meetingTopic?: string;
  participantCount?: number;
  isHost?: boolean;
  isRecording?: boolean;
  hasBreakoutRooms?: boolean;
}

export interface TeamsMetadata {
  meetingId?: string;
  organizerName?: string;
  participantCount?: number;
  isOrganizer?: boolean;
  hasSharedContent?: boolean;
  callType?: 'meeting' | 'call' | 'webinar';
}

export interface LinkedInMetadata {
  interviewType?: 'live' | 'recorded';
  companyName?: string;
  positionTitle?: string;
  interviewerName?: string;
  timeLimit?: number;
  questionsRemaining?: number;
}

export interface HireVueMetadata {
  interviewId?: string;
  companyName?: string;
  positionTitle?: string;
  questionNumber?: number;
  totalQuestions?: number;
  timePerQuestion?: number;
  recordingStatus?: 'ready' | 'recording' | 'paused' | 'completed';
}

// =============================================================================
// PLATFORM DETECTION
// =============================================================================

export interface PlatformDetectionResult {
  platform: string;
  confidence: number;
  isVideoCall: boolean;
  metadata: Record<string, unknown>;
  capabilities: PlatformCapabilities;
  selectors: PlatformSelectors;
}

export interface PlatformMutationConfig {
  observeAttributes: boolean;
  observeChildList: boolean;
  observeSubtree: boolean;
  attributeFilter?: string[];
  throttleMs?: number;
}

// =============================================================================
// PLATFORM STATE MANAGEMENT
// =============================================================================

export interface PlatformState {
  isInitialized: boolean;
  isInCall: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  lastUpdate: Date;
  errorCount: number;
  metadata: Record<string, unknown>;
}

export interface PlatformEvent {
  type: 'call_started' | 'call_ended' | 'participant_joined' | 'participant_left' | 'error';
  timestamp: Date;
  data?: Record<string, unknown>;
}

// =============================================================================
// EXPORT UNION TYPES
// =============================================================================

export type PlatformMetadata = 
  | GoogleMeetMetadata 
  | ZoomMetadata 
  | TeamsMetadata 
  | LinkedInMetadata 
  | HireVueMetadata;

export type SupportedPlatformDomain = 
  | 'meet.google.com'
  | 'zoom.us' 
  | 'teams.microsoft.com'
  | 'linkedin.com'
  | 'hirevue.com'; 
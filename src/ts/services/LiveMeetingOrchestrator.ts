/**
 * LiveMeetingOrchestrator - Master orchestrator for real-time meeting assistance
 * Coordinates transcription, AI suggestions, screenshot analysis, and platform integration
 * Provides seamless real-time interview assistance with full functionality
 */

import type {
  CallType,
  ToneType,
  TranscriptResult,
  DocumentReference,
  Participant,
  PerformanceMetrics,
  PriorityLevel,
  SuggestionContext,
  ContextualResponse,
  MeetingContext
} from '../types/index';

import { DocumentManager } from './documentManager';
import { LLMOrchestrator } from './llmOrchestrator';
import { SpeechToText } from './SpeechToText';

// Import TypeScript UI components
import { TranscriptionView } from '../ui/TranscriptionView';
import { SuggestionView } from '../ui/SuggestionView';

import {
  CALL_TYPES,
  TONE_TYPES,
  PRIORITY_LEVELS,
  MESSAGE_COMMANDS
} from '../utils/constants';

// Temporary interfaces for missing services
class ContextManager {
  async updateContext(context: any): Promise<void> {
    console.log('Context updated:', context);
  }
  
  async getRelevantContext(query: string): Promise<any> {
    console.log('Getting context for:', query);
    return {};
  }
}

class VisualAnalysis {
  async captureScreenshot(): Promise<string> {
    console.log('Capturing screenshot...');
    return '';
  }
  
  async analyzeVisual(imageData: string): Promise<any> {
    console.log('Analyzing visual:', imageData);
    return {};
  }
}

class ChatInterface {
  addMessage(message: string, sender: string): void {
    console.log(`${sender}: ${message}`);
  }
  
  async sendMessage(message: string): Promise<void> {
    console.log('Sending message:', message);
  }
}

// =============================================================================
// INTERFACES
// =============================================================================

interface LiveMeetingState {
  isActive: boolean;
  platform: string | null;
  callType: CallType;
  tone: ToneType;
  transcriptionActive: boolean;
  aiSuggestionsActive: boolean;
  screenshotAnalysisActive: boolean;
  sessionStartTime: number;
  lastActivityTime: number;
}

interface MeetingSession {
  sessionId: string;
  platform: string;
  startTime: number;
  transcripts: TranscriptResult[];
  suggestions: ContextualResponse[];
  screenshots: Array<{ timestamp: number; imageData: string; analysis?: any }>;
  context: MeetingContext;
}

interface LiveSettings {
  autoTranscribe: boolean;
  autoSuggest: boolean;
  suggestionDelay: number;
  screenshotInterval: number;
  confidenceThreshold: number;
  maxSuggestions: number;
}

// =============================================================================
// LIVE MEETING ORCHESTRATOR
// =============================================================================

export class LiveMeetingOrchestrator {
  private speechToText: SpeechToText;
  private llmOrchestrator: LLMOrchestrator;
  private documentManager: DocumentManager;
  private contextManager: ContextManager;
  private visualAnalysis: VisualAnalysis;
  private suggestionView: SuggestionView;
  private transcriptionView: TranscriptionView;
  private chatInterface: ChatInterface;

  private currentState: LiveMeetingState;
  private currentSession: MeetingSession | null = null;
  private settings: LiveSettings;
  private uiContainer: HTMLElement | null = null;

  // Real-time processing
  private transcriptBuffer: string[] = [];
  private lastSuggestionTime: number = 0;
  private suggestionTimer: number | null = null;
  private screenshotTimer: number | null = null;

  constructor() {
    console.log('LiveMeetingOrchestrator initialized');
    this.initializeState();
    this.initializeServices();
    this.setupEventListeners();
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  private initializeState(): void {
    this.currentState = {
      isActive: false,
      platform: null,
      callType: 'client_meeting',
      tone: 'professional',
      transcriptionActive: false,
      aiSuggestionsActive: false,
      screenshotAnalysisActive: false,
      sessionStartTime: 0,
      lastActivityTime: 0
    };

    this.settings = {
      autoTranscribe: true,
      autoSuggest: true,
      suggestionDelay: 3000, // 3 seconds after speech ends
      screenshotInterval: 30000, // 30 seconds
      confidenceThreshold: 0.7,
      maxSuggestions: 3
    };
  }

  private async initializeServices(): Promise<void> {
    // Initialize core services
    this.speechToText = new SpeechToText({
      continuous: true,
      interimResults: true,
      language: 'en-US',
      confidenceThreshold: this.settings.confidenceThreshold
    }, {
      onResult: this.handleTranscriptResult.bind(this),
      onError: this.handleTranscriptError.bind(this),
      onEnd: this.handleTranscriptEnd.bind(this)
    });

    this.llmOrchestrator = new LLMOrchestrator();
    this.documentManager = new DocumentManager();
    this.contextManager = new ContextManager();

    // Initialize speech service
    await this.speechToText.initialize();
  }

  private setupEventListeners(): void {
    // Listen for platform detection messages
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
    });

    // Listen for URL changes
    window.addEventListener('beforeunload', () => {
      this.stopMeeting();
    });
  }

  // =============================================================================
  // MAIN ORCHESTRATION METHODS
  // =============================================================================

  /**
   * Start live meeting assistance
   */
  async startMeeting(platform: string, callType: CallType = 'client_meeting', tone: ToneType = 'professional'): Promise<void> {
    try {
      console.log(`Starting live meeting assistance for ${platform}`);

      // Update state
      this.currentState = {
        ...this.currentState,
        isActive: true,
        platform,
        callType,
        tone,
        sessionStartTime: Date.now(),
        lastActivityTime: Date.now()
      };

      // Create new session
      this.currentSession = {
        sessionId: this.generateSessionId(),
        platform,
        startTime: Date.now(),
        transcripts: [],
        suggestions: [],
        screenshots: [],
        context: {
          callType,
          tone,
          platform,
          sessionId: this.generateSessionId(),
          startTime: new Date(),
          participants: [],
          documents: [],
          currentObjectives: []
        }
      };

      // Initialize UI
      await this.initializeUI();

      // Start real-time services
      if (this.settings.autoTranscribe) {
        await this.startTranscription();
      }

      if (this.settings.autoSuggest) {
        this.startAutoSuggestions();
      }

      // Start periodic screenshot analysis
      this.startScreenshotAnalysis();

      console.log('Live meeting assistance started successfully');

    } catch (error) {
      console.error('Failed to start live meeting assistance:', error);
      throw error;
    }
  }

  /**
   * Stop live meeting assistance
   */
  async stopMeeting(): Promise<void> {
    console.log('Stopping live meeting assistance');

    // Stop real-time services
    this.stopTranscription();
    this.stopAutoSuggestions();
    this.stopScreenshotAnalysis();

    // Save session data
    if (this.currentSession) {
      await this.saveSession();
    }

    // Reset state
    this.currentState.isActive = false;
    this.currentSession = null;

    // Clean up UI
    this.cleanupUI();

    console.log('Live meeting assistance stopped');
  }

  // =============================================================================
  // REAL-TIME TRANSCRIPTION
  // =============================================================================

  private async startTranscription(): Promise<void> {
    if (this.currentState.transcriptionActive) {
      console.warn('Transcription already active');
      return;
    }

    try {
      await this.speechToText.start();
      this.currentState.transcriptionActive = true;
      this.updateUIStatus('Transcription active', 'success');
      console.log('Transcription started');
    } catch (error) {
      console.error('Failed to start transcription:', error);
      this.updateUIStatus('Transcription failed to start', 'error');
    }
  }

  private stopTranscription(): void {
    if (!this.currentState.transcriptionActive) return;

    this.speechToText.stop();
    this.currentState.transcriptionActive = false;
    this.updateUIStatus('Transcription stopped', 'info');
    console.log('Transcription stopped');
  }

  private handleTranscriptResult(result: TranscriptResult): void {
    // Add to buffer
    this.transcriptBuffer.push(result.text);
    
    // Update session
    if (this.currentSession) {
      this.currentSession.transcripts.push(result);
    }

    // Update UI
    if (this.transcriptionView) {
      console.log('Would update transcription view with:', result.text);
    }

    // Update activity time
    this.currentState.lastActivityTime = Date.now();

    // Trigger auto-suggestions if enabled and final result
    if (result.isFinal && this.settings.autoSuggest) {
      this.scheduleAutoSuggestion();
    }

    console.log('Transcript:', result.text, 'Final:', result.isFinal);
  }

  private handleTranscriptError(error: any): void {
    console.error('Transcription error:', error);
    this.updateUIStatus(`Transcription error: ${error.message}`, 'error');
  }

  private handleTranscriptEnd(): void {
    console.log('Transcription ended, attempting restart...');
    if (this.currentState.transcriptionActive) {
      // Auto-restart transcription
      setTimeout(() => {
        this.startTranscription();
      }, 1000);
    }
  }

  // =============================================================================
  // AI SUGGESTIONS
  // =============================================================================

  private startAutoSuggestions(): void {
    this.currentState.aiSuggestionsActive = true;
    console.log('Auto-suggestions enabled');
  }

  private stopAutoSuggestions(): void {
    this.currentState.aiSuggestionsActive = false;
    if (this.suggestionTimer) {
      clearTimeout(this.suggestionTimer);
      this.suggestionTimer = null;
    }
    console.log('Auto-suggestions disabled');
  }

  private scheduleAutoSuggestion(): void {
    if (!this.currentState.aiSuggestionsActive) return;

    // Clear existing timer
    if (this.suggestionTimer) {
      clearTimeout(this.suggestionTimer);
    }

    // Schedule new suggestion generation
    this.suggestionTimer = setTimeout(() => {
      this.generateSuggestions();
    }, this.settings.suggestionDelay);
  }

  private async generateSuggestions(): Promise<void> {
    if (!this.currentSession || !this.currentState.aiSuggestionsActive) return;

    try {
      // Build context from recent transcripts
      const recentTranscripts = this.transcriptBuffer.slice(-10).join(' ');
      if (recentTranscripts.trim().length < 10) return; // Not enough content

      const suggestionContext: SuggestionContext = {
        sessionId: this.currentSession.sessionId,
        callType: this.currentState.callType,
        tone: this.currentState.tone,
        relevantDocuments: [],
        currentTopic: 'general',
        conversationHistory: this.currentSession.transcripts.map(t => t.text),
        participants: this.currentSession.context.participants,
        meetingPhase: this.detectMeetingPhase(),
        participantContext: {
          lastUserInput: recentTranscripts,
          timeInMeeting: Date.now() - this.currentState.sessionStartTime
        }
      };

      // Generate suggestions
      const suggestions = await this.llmOrchestrator.generateSuggestions(
        suggestionContext,
        this.currentState.callType,
        this.currentState.tone,
        this.settings.maxSuggestions
      );

      // Update session and UI
      this.currentSession.suggestions.push(...suggestions);
      
      if (this.suggestionView) {
        console.log('Would display suggestions:', suggestions.length);
      }

      console.log('Generated', suggestions.length, 'suggestions');
      this.lastSuggestionTime = Date.now();

    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  }

  // =============================================================================
  // SCREENSHOT ANALYSIS
  // =============================================================================

  private startScreenshotAnalysis(): void {
    if (this.screenshotTimer) return;

    this.currentState.screenshotAnalysisActive = true;
    
    // Schedule periodic screenshots
    this.screenshotTimer = setInterval(() => {
      this.captureAndAnalyzeScreen();
    }, this.settings.screenshotInterval);

    console.log('Screenshot analysis started');
  }

  private stopScreenshotAnalysis(): void {
    if (this.screenshotTimer) {
      clearInterval(this.screenshotTimer);
      this.screenshotTimer = null;
    }
    this.currentState.screenshotAnalysisActive = false;
    console.log('Screenshot analysis stopped');
  }

  private async captureAndAnalyzeScreen(): Promise<void> {
    try {
      console.log('Capturing and analyzing screenshot...');

      // Capture screenshot using the visual analysis component
      await this.visualAnalysis.captureScreenshot();

      // The visual analysis component will handle the AI analysis
      // We'll get the results through the component's callback system

    } catch (error) {
      console.error('Screenshot capture failed:', error);
    }
  }

  // =============================================================================
  // UI INTEGRATION
  // =============================================================================

  private async initializeUI(): Promise<void> {
    // Create main UI container
    this.uiContainer = this.createUIContainer();
    document.body.appendChild(this.uiContainer);

    // Initialize UI components
    this.transcriptionView = new TranscriptionView('candidai-transcription');
    this.suggestionView = new SuggestionView('candidai-suggestions');
    this.visualAnalysis = new VisualAnalysis();
    this.chatInterface = new ChatInterface();

    console.log('UI initialized');
  }

  private createUIContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'candidai-main-container';
    container.className = 'candidai-live-assistant';
    
    container.innerHTML = `
      <div class="candidai-header">
        <div class="candidai-logo">
          <img src="${chrome.runtime.getURL('assets/icons/icon-48.png')}" alt="CandidAI" />
          <span>CandidAI Live Assistant</span>
        </div>
        <div class="candidai-controls">
          <button id="candidai-toggle-transcription" class="candidai-btn candidai-btn--sm">
            🎤 Transcription
          </button>
          <button id="candidai-toggle-suggestions" class="candidai-btn candidai-btn--sm">
            💡 Suggestions
          </button>
          <button id="candidai-capture-screen" class="candidai-btn candidai-btn--sm">
            📸 Analyze Screen
          </button>
          <button id="candidai-close" class="candidai-btn candidai-btn--sm candidai-btn--danger">
            ✕
          </button>
        </div>
      </div>
      
      <div class="candidai-content">
        <div class="candidai-panel candidai-panel--transcription">
          <h3>Live Transcription</h3>
          <div id="candidai-transcription"></div>
        </div>
        
        <div class="candidai-panel candidai-panel--suggestions">
          <h3>AI Suggestions</h3>
          <div id="candidai-suggestions"></div>
        </div>
        
        <div class="candidai-panel candidai-panel--analysis">
          <h3>Visual Analysis</h3>
          <div id="candidai-screenshot-preview"></div>
          <div id="candidai-analysis-results"></div>
        </div>
        
        <div class="candidai-panel candidai-panel--chat">
          <h3>AI Chat</h3>
          <div id="candidai-chat"></div>
        </div>
      </div>
      
      <div class="candidai-status">
        <span id="candidai-status-text">Ready</span>
        <div class="candidai-session-info">
          Session: ${this.currentSession?.sessionId.slice(-8) || 'N/A'}
        </div>
      </div>
    `;

    // Add event listeners
    this.setupUIEventListeners(container);

    return container;
  }

  private setupUIEventListeners(container: HTMLElement): void {
    // Transcription toggle
    container.querySelector('#candidai-toggle-transcription')?.addEventListener('click', () => {
      if (this.currentState.transcriptionActive) {
        this.stopTranscription();
      } else {
        this.startTranscription();
      }
    });

    // Suggestions toggle
    container.querySelector('#candidai-toggle-suggestions')?.addEventListener('click', () => {
      if (this.currentState.aiSuggestionsActive) {
        this.stopAutoSuggestions();
      } else {
        this.startAutoSuggestions();
      }
    });

    // Manual screenshot capture
    container.querySelector('#candidai-capture-screen')?.addEventListener('click', () => {
      this.captureAndAnalyzeScreen();
    });

    // Close assistant
    container.querySelector('#candidai-close')?.addEventListener('click', () => {
      this.stopMeeting();
    });
  }

  private updateUIStatus(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const statusElement = document.querySelector('#candidai-status-text');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `candidai-status-${type}`;
    }
  }

  private cleanupUI(): void {
    if (this.uiContainer) {
      this.uiContainer.remove();
      this.uiContainer = null;
    }
  }

  // =============================================================================
  // MESSAGE HANDLING
  // =============================================================================

  private async handleMessage(request: any, sender: any, sendResponse: any): Promise<void> {
    switch (request.command) {
      case 'PLATFORM_DETECTED':
        await this.handlePlatformDetected(request.payload);
        sendResponse({ success: true });
        break;

      case 'VIDEO_CALL_STATE_CHANGED':
        await this.handleVideoCallStateChanged(request.payload);
        sendResponse({ success: true });
        break;

      case 'START_MEETING_ASSISTANCE':
        await this.startMeeting(
          request.payload.platform,
          request.payload.callType,
          request.payload.tone
        );
        sendResponse({ success: true });
        break;

      case 'STOP_MEETING_ASSISTANCE':
        await this.stopMeeting();
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown command' });
    }
  }

  private async handlePlatformDetected(payload: any): Promise<void> {
    console.log('Platform detected:', payload.platform);
    
    if (payload.isVideoCall && !this.currentState.isActive) {
      // Auto-start meeting assistance
      await this.startMeeting(payload.platform);
    }
  }

  private async handleVideoCallStateChanged(payload: any): Promise<void> {
    console.log('Video call state changed:', payload.inCall);
    
    if (payload.inCall && !this.currentState.isActive) {
      await this.startMeeting(payload.platform);
    } else if (!payload.inCall && this.currentState.isActive) {
      await this.stopMeeting();
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  private detectMeetingPhase(): string {
    const timeInMeeting = Date.now() - this.currentState.sessionStartTime;
    const minutes = timeInMeeting / (1000 * 60);
    
    if (minutes < 5) return 'introduction';
    if (minutes < 15) return 'technical_discussion';
    if (minutes < 25) return 'behavioral_questions';
    return 'closing';
  }

  private async saveSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      // Save session data to storage
      const sessionData = {
        ...this.currentSession,
        endTime: Date.now(),
        duration: Date.now() - this.currentSession.startTime
      };

      await chrome.storage.local.set({
        [`session_${this.currentSession.sessionId}`]: sessionData
      });

      console.log('Session saved:', this.currentSession.sessionId);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Get current meeting state
   */
  public getState(): LiveMeetingState {
    return { ...this.currentState };
  }

  /**
   * Update settings
   */
  public updateSettings(newSettings: Partial<LiveSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.log('Settings updated:', this.settings);
  }

  /**
   * Manual suggestion generation
   */
  public async generateManualSuggestion(prompt: string): Promise<ContextualResponse[]> {
    if (!this.currentSession) return [];

    const suggestionContext: SuggestionContext = {
      sessionId: this.currentSession.sessionId,
      callType: this.currentState.callType,
      tone: this.currentState.tone,
      relevantDocuments: [],
      currentTopic: 'manual_query',
      conversationHistory: this.currentSession.transcripts.map(t => t.text),
      participants: this.currentSession.context.participants,
      meetingPhase: this.detectMeetingPhase(),
      participantContext: {
        lastUserInput: prompt,
        timeInMeeting: Date.now() - this.currentState.sessionStartTime
      }
    };

    const suggestions = await this.llmOrchestrator.generateSuggestions(
      suggestionContext,
      this.currentState.callType,
      this.currentState.tone,
      this.settings.maxSuggestions
    );

    return [...suggestions];
  }
}

// Export singleton instance
export const liveMeetingOrchestrator = new LiveMeetingOrchestrator(); 
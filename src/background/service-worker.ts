/**
 * CandidAI Service Worker - Central Orchestration Layer
 * Implements event-driven architecture with reactive state management
 * Leverages Chrome Extension APIs with Manifest V3 compliance
 * Enterprise-grade TypeScript implementation with strict typing
 */

import type {
  MessageRequest,
  MessageResponse,
  SessionMetadata,
  InterviewContext,
  TranscriptionData,
  ContextualResponse,
  ChromeTab,
  ChromeSender,
  ChromePort,
  ContextUpdate,
  PlatformDetection,
  PerformanceMetrics,
  DocumentContent,
  PriorityLevel,
  CallType,
  ToneType
} from '../ts/types/index';

import { MessageBroker } from '@utils/messaging';
import { SecureStorage } from '@utils/storage';
import { LLMOrchestrator } from '@services/llmOrchestrator';
import { ContextManager } from '@services/contextManager';
import { PerformanceAnalyzer } from '@services/performanceAnalyzer';
import {
  MESSAGE_COMMANDS,
  OFFSCREEN_DOCUMENT_PATH,
  OFFSCREEN_REASONS,
  OFFSCREEN_JUSTIFICATION,
  DEFAULT_APP_CONFIG,
  MESSAGE_TARGETS,
  STORAGE_KEYS,
  PORT_COMMANDS,
} from '@utils/constants';

/**
 * Service Worker State Management - Singleton Pattern
 * Implements enterprise-grade architecture with proper error boundaries
 */
class ServiceWorkerOrchestrator {
  private readonly messageBroker: MessageBroker;
  private readonly storage: SecureStorage;
  private readonly llmOrchestrator: LLMOrchestrator;
  private readonly contextManager: ContextManager;
  private readonly performanceAnalyzer: PerformanceAnalyzer;

  // State containers with reactive observers
  private readonly activeInterviews = new Map<string, InterviewContext>();
  private readonly offscreenDocuments = new Map<string, boolean>();
  private readonly sidePanelStates = new Map<number, Record<string, unknown>>();
  private readonly sidePanelPorts = new Map<number, ChromePort>();

  // Configuration cache
  private config: typeof DEFAULT_APP_CONFIG | null = null;

  constructor() {
    this.messageBroker = new MessageBroker();
    this.storage = new SecureStorage();
    this.llmOrchestrator = new LLMOrchestrator();
    this.contextManager = new ContextManager();
    this.performanceAnalyzer = new PerformanceAnalyzer();

    // Initialize with error handling
    this.initialize().catch((error) => {
      console.error('ServiceWorkerOrchestrator initialization failed:', error);
    });
  }

  /**
   * Safe initialization with error boundaries
   * Implements graceful degradation for robustness
   */
  private async initialize(): Promise<void> {
    try {
      this.initializeEventHandlers();
      this.performanceAnalyzer.startMeasurement('sw_initialization');
    } catch (error) {
      console.error('Event handler initialization failed:', error);
    }

    try {
      await this.initializeOffscreenCapabilities();
    } catch (error) {
      console.error('Offscreen capabilities initialization failed:', error);
    }

    try {
      await this.loadConfiguration();
    } catch (error) {
      console.error('Configuration loading failed:', error);
    }

    if (this.performanceAnalyzer.isMeasuring('sw_initialization')) {
      this.performanceAnalyzer.endMeasurement('sw_initialization');
      const initPerf = this.performanceAnalyzer.getMeasurement('sw_initialization');
      if (initPerf) {
        console.log(`Service Worker Initialization Time: ${initPerf.duration}ms`);
      }
    }
  }

  /**
   * Load configuration from storage with proper error handling
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const storedConfig = await this.storage.get<typeof DEFAULT_APP_CONFIG>(
        STORAGE_KEYS.APP_CONFIG,
      );
      this.config = storedConfig ?? DEFAULT_APP_CONFIG;
      console.log('Configuration loaded:', this.config);
      this.performanceAnalyzer.logEvent('configuration_loaded', {
        hasStoredConfig: Boolean(storedConfig),
      });
    } catch (error) {
      console.error('Failed to load configuration, using defaults:', error);
      this.config = DEFAULT_APP_CONFIG;
      this.performanceAnalyzer.logError('configuration_load_failed', error);
    }
  }

  /**
   * Initialize comprehensive event handler matrix
   * Implements Command and Observer patterns
   */
  private initializeEventHandlers(): void {
    // Extension lifecycle events
    chrome.runtime.onInstalled.addListener(this.handleInstallation.bind(this));
    chrome.runtime.onStartup.addListener(this.handleStartup.bind(this));

    // Message routing with typed channels
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    chrome.runtime.onConnect.addListener(this.handleConnection.bind(this));

    // Action handler for toolbar icon
    chrome.action.onClicked.addListener(this.handleActionClick.bind(this));

    // Side panel lifecycle management
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => {
        console.error('Side panel configuration failed:', error);
      });
  }

  /**
   * Handle extension installation lifecycle event
   * Implements initialization strategy pattern
   */
  private async handleInstallation(
    details: chrome.runtime.InstalledDetails,
  ): Promise<void> {
    console.log('CandidAI Extension installed:', details);

    // Initialize default configuration matrix from constants
    await this.storage.initialize({
      [STORAGE_KEYS.APP_CONFIG]: DEFAULT_APP_CONFIG,
    });

    // Open options page on first install
    if (details.reason === 'install') {
      chrome.runtime.openOptionsPage();
    }
  }

  /**
   * Handle startup initialization sequence
   * Implements lazy loading and dependency injection
   */
  private async handleStartup(): Promise<void> {
    console.log('CandidAI Service Worker starting up');

    try {
      const state = await this.storage.getState();
      if (state?.[STORAGE_KEYS.ACTIVE_INTERVIEW]) {
        await this.resumeInterviewSession(state[STORAGE_KEYS.ACTIVE_INTERVIEW]);
      }
      this.performanceAnalyzer.logEvent('service_worker_startup_success');
    } catch (error) {
      console.error('State restoration failed during startup:', error);
      this.performanceAnalyzer.logError('service_worker_startup_failure', error);
    }
  }

  /**
   * Handles incoming messages from content scripts, UI, and other parts of the extension
   */
  private async handleMessage(
    request: MessageRequest,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ): Promise<void> {
    try {
      const { command, payload = {} } = request;
      let responseData: unknown = null;

      switch (command) {
        case 'START_AUDIO_CAPTURE':
          responseData = await this.startAudioCapture(
            (payload as { tabId?: number; sessionId?: string }).tabId ?? 0,
            (payload as { sessionId?: string }).sessionId ?? ''
          );
          break;

        case 'STOP_AUDIO_CAPTURE':
          responseData = await this.stopAudioCapture(
            (payload as { tabId?: number; sessionId?: string }).tabId ?? 0,
            (payload as { sessionId?: string }).sessionId ?? ''
          );
          break;

        case 'END_INTERVIEW_SESSION':
          responseData = await this.endInterviewSession(
            (payload as { sessionId?: string }).sessionId ?? ''
          );
          break;

        case 'UPDATE_CONTEXT':
          const contextPayload = payload as {
            sessionId?: string;
            transcription?: {
              text: string;
              confidence: number;
              timestamp: Date;
              isInterim: boolean;
            };
          };
          const contextUpdate: ContextUpdate = {
            sessionId: contextPayload.sessionId ?? '',
            transcription: {
              text: contextPayload.transcription?.text ?? '',
              confidence: contextPayload.transcription?.confidence ?? 0,
              timestamp: contextPayload.transcription?.timestamp ?? new Date(),
              isInterim: contextPayload.transcription?.isInterim ?? false
            },
            timestamp: new Date()
          };
          await this.contextManager.updateContext(contextUpdate);
          break;

        case 'TEST_LLM_CONNECTION':
          responseData = await this.testLLMConnection(
            (payload as { provider?: string }).provider ?? 'openai'
          );
          break;

        case 'TEST_PLATFORM_DETECTION':
          responseData = await this.testPlatformDetection(
            (payload as { url?: string }).url ?? ''
          );
          break;

        case MESSAGE_COMMANDS.INIT_INTERVIEW_SESSION:
          responseData = await this.initializeInterviewSession(
            payload?.metadata,
            payload?.tabId,
          );
          break;

        case MESSAGE_COMMANDS.PROCESS_TRANSCRIPTION:
          responseData = await this.processTranscription(
            payload?.sessionId,
            payload?.transcriptionData,
          );
          break;

        case MESSAGE_COMMANDS.CAPTURE_VISUAL:
          responseData = await this.captureAndAnalyzeVisual(payload);
          break;

        case MESSAGE_COMMANDS.GET_APP_STATE:
          responseData = {
            activeInterviewsCount: this.activeInterviews.size,
          };
          break;

        case 'ping':
          responseData = {
            success: true,
            message: 'CandidAI extension is running'
          };
          break;

        default:
          console.warn('Unknown command received:', command);
          responseData = {
            success: false,
            error: 'Unknown command',
            details: `Command not recognized: ${command}`
          };
      }

      sendResponse({
        success: true,
        data: responseData
      });
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Initialize offscreen document capabilities
   * Implements Factory and Singleton patterns for resource optimization
   */
  private async initializeOffscreenCapabilities(): Promise<void> {
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)],
    });

    if (existingContexts.length === 0) {
      try {
        await chrome.offscreen.createDocument({
          url: OFFSCREEN_DOCUMENT_PATH,
          reasons: OFFSCREEN_REASONS,
          justification: OFFSCREEN_JUSTIFICATION,
        });
        console.log('Offscreen document created successfully.');
        this.performanceAnalyzer.logEvent('offscreen_document_created');
      } catch (error) {
        console.error('Failed to create offscreen document:', error);
        this.performanceAnalyzer.logError('offscreen_creation_failure', error);
      }
    } else {
      console.log('Offscreen document already exists.');
      this.performanceAnalyzer.logEvent('offscreen_document_existed');
    }
  }

  /**
   * Initialize comprehensive interview session
   * Implements State Machine pattern for session lifecycle
   */
  private async initializeInterviewSession(
    metadata?: Partial<SessionMetadata>,
    tabId?: number,
  ): Promise<InterviewContext> {
    const sessionId = crypto.randomUUID();
    const fullMetadata: SessionMetadata = {
      sessionId,
      callType: metadata?.callType ?? 'interview',
      participantCount: metadata?.participantCount ?? 1,
      documentCount: metadata?.documentCount ?? 0,
      duration: 0,
      platform: metadata?.platform ?? 'unknown',
      createdAt: new Date(),
      lastAccessed: new Date(),
      encrypted: true,
      retentionPolicy: 'standard',
      tabId: tabId,
      initiatedTs: Date.now(),
      uiConnected: true,
      ...metadata,
    };

    const session: InterviewContext = {
      sessionId,
      callType: fullMetadata.callType,
      tone: 'professional',
      documents: [],
      participants: [],
      conversation: [],
      detectedEntities: {},
      currentObjectives: [],
      performanceMetrics: {
        responseTime: 0,
        accuracy: 0,
        relevanceScore: 0,
        documentsProcessed: 0,
        suggestionsProvided: 0,
        successfulInteractions: 0,
      },
      createdAt: new Date(),
      lastUpdated: new Date(),
      platform: fullMetadata.platform,
      state: 'active',
    };

    this.activeInterviews.set(sessionId, session);
    this.performanceAnalyzer.startInterview(fullMetadata, sessionId);

    try {
      await chrome.runtime.sendMessage({
        target: MESSAGE_TARGETS.OFFSCREEN,
        command: MESSAGE_COMMANDS.START_AUDIO_CAPTURE,
        sessionId: sessionId,
      });
      this.performanceAnalyzer.logEvent('interview_session_initialized', { sessionId });
    } catch (error) {
      console.error(
        `Failed to send START_AUDIO_CAPTURE to offscreen for session ${sessionId}:`,
        error,
      );
      this.performanceAnalyzer.logError('start_audio_capture_failed', { sessionId, error });
      session.state = 'paused'; // Set to paused instead of active if audio fails
    }

    return session;
  }

  /**
   * Handle connection events for long-lived connections
   * Implements port-based communication for real-time features
   */
  private handleConnection(port: ChromePort): void {
    console.log('New connection established:', port.name, port.sender);
    this.performanceAnalyzer.logEvent('port_connection_established', {
      portName: port.name,
      tabId: port.sender?.tab?.id,
    });

    if (port.name === MESSAGE_TARGETS.SIDE_PANEL && port.sender?.tab?.id) {
      const tabId = port.sender.tab.id;
      this.sidePanelPorts.set(tabId, port);
      console.log(`[Connection] Side panel port for tab ${tabId} stored.`);
      this.performanceAnalyzer.logEvent('sidepanel_port_stored', { tabId });

      try {
        port.postMessage({
          command: PORT_COMMANDS.SERVICE_WORKER_READY,
          payload: {
            status: 'connected',
            serviceWorkerVersion: chrome.runtime.getManifest().version,
          },
        });
        this.performanceAnalyzer.logEvent('service_worker_ready_sent_to_panel', { tabId });
      } catch (error) {
        console.warn(
          `[Connection] Failed to send SERVICE_WORKER_READY to side panel for tab ${tabId}:`,
          error,
        );
        this.performanceAnalyzer.logError('service_worker_ready_send_failed', error, { tabId });
      }
    }

    const messageListener = async (message: unknown): Promise<void> => {
      console.log('Message received on port:', port.name, message);
      this.performanceAnalyzer.logEvent('port_message_received', {
        portName: port.name,
        command: (message as any)?.command,
      });
      await this.handlePortMessage(port, message);
    };

    const disconnectListener = (): void => {
      console.log('Port disconnected:', port.name);
      this.performanceAnalyzer.logEvent('port_disconnected', { portName: port.name });

      port.onMessage.removeListener(messageListener);
      port.onDisconnect.removeListener(disconnectListener);
      this.cleanupPortResources(port);
    };

    port.onMessage.addListener(messageListener);
    port.onDisconnect.addListener(disconnectListener);
  }

  // Placeholder methods for remaining functionality
  private async handlePortMessage(port: ChromePort, message: unknown): Promise<void> {
    // Implementation needed
    console.log('Handling port message:', port.name, message);
  }

  private cleanupPortResources(port: ChromePort): void {
    // Implementation needed
    console.log('Cleaning up port resources:', port.name);
  }

  private async handleActionClick(tab: ChromeTab): Promise<void> {
    // Implementation needed
    console.log('Action clicked for tab:', tab);
  }

  private async resumeInterviewSession(sessionData: unknown): Promise<void> {
    // Implementation needed
    console.log('Resuming interview session:', sessionData);
  }

  private async processTranscription(
    sessionId: string, 
    transcriptionData: TranscriptionData,
  ): Promise<ContextualResponse> {
    // Implementation needed
    console.log('Processing transcription:', sessionId, transcriptionData);
    return {
      content: 'Placeholder response',
      tone: 'professional',
      confidence: 0.8,
      relevantDocuments: [],
      supportingPoints: [],
      followUpQuestions: [],
      metadata: {
        callType: 'interview',
        responseType: 'answer',
        priority: 'medium',
        timing: 'immediate',
        length: 'brief',
      },
    };
  }

  private async endInterviewSession(sessionId: string): Promise<{ finalState: string; error?: string }> {
    // Implementation needed
    console.log('Ending interview session:', sessionId);
    return { finalState: 'ENDED' };
  }

  private async captureAndAnalyzeVisual(payload: unknown): Promise<unknown> {
    // Implementation needed
    console.log('Capturing and analyzing visual:', payload);
    return {};
  }

  private async testLLMConnection(provider: string): Promise<MessageResponse> {
    // Implementation needed
    console.log('Testing LLM connection:', provider);
    return { success: true };
  }

  private async testPlatformDetection(url: string): Promise<MessageResponse> {
    // Implementation needed
    console.log('Testing platform detection:', url);
    return { success: true };
  }

  private async startAudioCapture(tabId: number, sessionId: string): Promise<boolean> {
    try {
      await this.ensureOffscreenDocument();
      
      // ... existing audio capture logic ...
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.performanceAnalyzer.logError('start_audio_capture_failed', { 
        sessionId, 
        error: errorMessage 
      });
      throw error;
    }
  }

  private async stopAudioCapture(tabId: number, sessionId: string): Promise<boolean> {
    // Implementation needed
    console.log('Stopping audio capture:', tabId, sessionId);
    return true;
  }

  private async ensureOffscreenDocument(): Promise<void> {
    try {
      // Check if offscreen document already exists
      const contexts = await chrome.runtime.getContexts?.({
        contextTypes: ['OFFSCREEN_DOCUMENT']
      });
      
      if (contexts && contexts.length > 0) {
        console.log('Offscreen document already exists');
        return;
      }
    } catch (error) {
      // getContexts not available, continue with creation
      console.log('getContexts not available, attempting to create offscreen document');
    }

    try {
      const OFFSCREEN_REASONS: chrome.offscreen.Reason[] = ['USER_MEDIA', 'AUDIO_PLAYBACK'];
      
      await chrome.offscreen.createDocument({
        url: chrome.runtime.getURL('offscreen/offscreen.html'),
        reasons: OFFSCREEN_REASONS,
        justification: 'Audio processing and capture for interview assistance'
      });
      
      console.log('Offscreen document created successfully');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Only a single offscreen')) {
        console.log('Offscreen document already exists');
        return;
      }
      throw error;
    }
  }

  private buildContextualResponse(
    content: string,
    context: {
      callType: CallType;
      tone: ToneType;
      sessionId: string;
      relevantDocuments: DocumentContent[];
    }
  ): {
    content: string;
    tone: ToneType;
    confidence: number;
    relevantDocuments: any[];
    supportingPoints: string[];
    followUpQuestions: string[];
    metadata: {
      callType: CallType;
      responseType: 'answer' | 'suggestion' | 'clarification' | 'summary';
      priority: PriorityLevel;
      timing: 'immediate' | 'delayed' | 'scheduled';
      length: 'brief' | 'detailed' | 'comprehensive';
      formality: 'formal' | 'professional' | 'casual' | 'friendly';
    };
  } {
    return {
      content,
      tone: context.tone,
      confidence: 0.8,
      relevantDocuments: context.relevantDocuments.map(doc => ({
        id: doc.id,
        name: doc.metadata.name,
        type: doc.metadata.type
      })),
      supportingPoints: ['Key point 1', 'Key point 2'],
      followUpQuestions: ['Follow-up 1', 'Follow-up 2'],
      metadata: {
        callType: context.callType,
        responseType: 'answer' as const,
        priority: 'medium' as PriorityLevel,
        timing: 'immediate' as const,
        length: 'brief' as const,
        formality: 'professional' as const
      }
    };
  }
}

// Initialize the service worker orchestrator
const serviceWorkerOrchestrator = new ServiceWorkerOrchestrator();

// Export for potential testing or external access
export { ServiceWorkerOrchestrator }; 
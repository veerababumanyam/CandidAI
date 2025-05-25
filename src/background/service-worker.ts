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
} from '@types/index';

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
   * Central message routing with typed command pattern
   * Implements CQRS (Command Query Responsibility Segregation)
   */
  private async handleMessage(
    request: MessageRequest,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void,
  ): Promise<boolean> {
    const { command, payload } = request;
    const messagePerfId = `message_${command}_${Date.now()}`;
    this.performanceAnalyzer.startMeasurement(messagePerfId);

    try {
      let responseData: unknown;

      switch (command) {
        case MESSAGE_COMMANDS.INIT_INTERVIEW_SESSION:
          responseData = await this.initializeInterviewSession(
            payload?.metadata,
            payload?.tabId,
          );
          sendResponse({ success: true, data: responseData });
          break;

        case MESSAGE_COMMANDS.PROCESS_TRANSCRIPTION:
          responseData = await this.processTranscription(
            payload?.sessionId,
            payload?.transcriptionData,
          );
          sendResponse({ success: true, data: responseData });
          break;

        case MESSAGE_COMMANDS.END_INTERVIEW_SESSION:
          responseData = await this.endInterviewSession(payload?.sessionId);
          if ((responseData as any)?.finalState === 'ENDED') {
            sendResponse({ success: true, data: responseData });
          } else {
            sendResponse({
              success: false,
              error: (responseData as any)?.error || 'Failed to end interview session',
              data: responseData,
            });
          }
          break;

        case MESSAGE_COMMANDS.UPDATE_CONTEXT:
          await this.contextManager.updateContext(payload);
          sendResponse({ success: true });
          break;

        case 'TEST_LLM_CONNECTION':
          responseData = await this.testLLMConnection(payload?.provider);
          sendResponse(responseData as MessageResponse);
          break;

        case 'TEST_PLATFORM_DETECTION':
          responseData = await this.testPlatformDetection(payload?.url);
          sendResponse(responseData as MessageResponse);
          break;

        case 'ping':
          sendResponse({ success: true, message: 'CandidAI extension is running' });
          break;

        case MESSAGE_COMMANDS.CAPTURE_VISUAL:
          responseData = await this.captureAndAnalyzeVisual(payload);
          sendResponse({ success: true, data: responseData });
          break;

        case MESSAGE_COMMANDS.GET_APP_STATE:
          responseData = {
            activeInterviewsCount: this.activeInterviews.size,
          };
          sendResponse({ success: true, data: responseData });
          break;

        default:
          console.warn('Unknown command received:', command);
          sendResponse({
            success: false,
            error: 'Unknown command',
            details: `Command not recognized: ${command}`,
          });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.error(`Error handling command ${command}:`, error);
      sendResponse({ 
        success: false, 
        error: errorMessage, 
        details: errorStack,
      });
      this.performanceAnalyzer.logError(`command_error_${command}`, error);
    } finally {
      this.performanceAnalyzer.endMeasurement(messagePerfId);
      const perfResult = this.performanceAnalyzer.getMeasurement(messagePerfId);
      if (perfResult) {
        console.log(`Command ${command} processed in ${perfResult.duration}ms`);
      }
    }

    return true; // Keep message channel open for async response
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
}

// Initialize the service worker orchestrator
const serviceWorkerOrchestrator = new ServiceWorkerOrchestrator();

// Export for potential testing or external access
export { ServiceWorkerOrchestrator }; 
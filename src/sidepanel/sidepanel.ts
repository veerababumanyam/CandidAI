/**
 * CandidAI Side Panel - Primary UI Orchestration Layer
 * Implements reactive state management with event-driven architecture
 * Leverages Observer, Command, and Mediator patterns for decoupled communication
 */

import { MessageBroker } from '../ts/utils/messaging';
import type { MessageResponse, SessionMetadata } from '../ts/types/index';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface SessionState {
  isListening: boolean;
  activeTab: string;
  sessionId: string | null;
  platform: string | null;
  tokenUsage: number;
}

interface UIComponents {
  transcription: any; // TODO: Import proper TranscriptionView type
  suggestions: any; // TODO: Import proper SuggestionView type
  chat: any; // TODO: Import proper ChatInterface type
  visual: any; // TODO: Import proper VisualAnalysis type
}

interface TranscriptionPayload {
  text: string;
  confidence: number;
  timestamp: number;
  isQuestion?: boolean;
  speaker?: string;
}

interface SuggestionPayload {
  suggestions: Array<{
    text: string;
    confidence: number;
    type: string;
  }>;
}

// =============================================================================
// SIDE PANEL CONTROLLER
// =============================================================================

/**
 * Primary Side Panel Controller - Implements Facade Pattern
 * Orchestrates complex subsystem interactions through unified interface
 */
class SidePanelController {
  private messageBroker: MessageBroker;
  private components: Partial<UIComponents>;
  private sessionState: SessionState;
  private port: chrome.runtime.Port | null = null;

  constructor() {
    // Initialize core service dependencies
    this.messageBroker = new MessageBroker();

    // Initialize UI component placeholders
    this.components = {};

    // Session state container with reactive properties
    this.sessionState = {
      isListening: false,
      activeTab: 'assistant',
      sessionId: null,
      platform: null,
      tokenUsage: 0,
    };

    // Initialize component lifecycle
    this.initializeEventListeners();
    this.establishServiceWorkerConnection();
    this.restoreUIState();
  }

  /**
   * Initialize comprehensive event listener matrix
   * Implements event delegation pattern for performance optimization
   */
  private initializeEventListeners(): void {
    // Tab navigation event handling
    document.querySelectorAll('.ca-tabs__tab').forEach((tab) => {
      tab.addEventListener('click', this.handleTabSwitch.bind(this));
    });

    // Listening toggle control with state persistence
    const listeningToggle = document.getElementById('listening-toggle');
    if (listeningToggle) {
      listeningToggle.addEventListener('click', this.toggleListening.bind(this));
    }

    // Settings navigation handler
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.openQuickSettings();
      });
    }

    // Visual capture trigger
    const captureBtn = document.getElementById('capture-screen');
    if (captureBtn) {
      captureBtn.addEventListener('click', this.handleScreenCapture.bind(this));
    }

    // Global keyboard event handlers for accessibility
    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
  }

  /**
   * Establish bidirectional communication channel with service worker
   * Implements persistent connection pattern with automatic reconnection
   */
  private establishServiceWorkerConnection(): void {
    try {
      // Create persistent port connection
      this.port = chrome.runtime.connect({ name: 'sidepanel' });

      // Message handler with typed command routing
      this.port.onMessage.addListener((message: any) => {
        const { command, payload } = message;

        switch (command) {
          case 'TRANSCRIPTION_UPDATE':
            this.handleTranscriptionUpdate(payload);
            break;

          case 'SUGGESTION_GENERATED':
            this.handleSuggestionUpdate(payload);
            break;

          case 'CONTEXT_UPDATED':
            this.updateContextIndicators(payload);
            break;

          case 'SESSION_STATE_CHANGE':
            this.handleSessionStateChange(payload);
            break;

          case 'ERROR_NOTIFICATION':
            this.handleErrorNotification(payload);
            break;
        }
      });

      // Reconnection handler for resilient communication
      this.port.onDisconnect.addListener(() => {
        console.warn('Service worker connection lost, attempting reconnection...');
        setTimeout(() => this.establishServiceWorkerConnection(), 1000);
      });
    } catch (error) {
      console.error('Failed to establish service worker connection:', error);
    }
  }

  /**
   * Handle tab switching with state persistence
   */
  private handleTabSwitch(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    const tabTarget = target.dataset.tabTarget;

    if (!tabTarget) return;

    // Deactivate all tabs and panels
    document.querySelectorAll('.ca-tabs__tab').forEach((tab) => {
      tab.classList.remove('ca-tabs__tab--active');
      tab.setAttribute('aria-selected', 'false');
    });

    document.querySelectorAll('.ca-panel').forEach((panel) => {
      panel.classList.remove('ca-panel--active');
      (panel as HTMLElement).hidden = true;
    });

    // Activate target tab and panel
    target.classList.add('ca-tabs__tab--active');
    target.setAttribute('aria-selected', 'true');

    const targetPanel = document.getElementById(`panel-${tabTarget}`);
    if (targetPanel) {
      targetPanel.classList.add('ca-panel--active');
      targetPanel.hidden = false;
    }

    // Update session state
    this.sessionState.activeTab = tabTarget;
  }

  /**
   * Toggle listening state with comprehensive state management
   */
  private async toggleListening(): Promise<void> {
    const button = document.getElementById('listening-toggle');
    if (!button) return;

    try {
      if (!this.sessionState.isListening) {
        // Initialize interview session
        const response = await this.messageBroker.sendMessage({
          command: 'INIT_INTERVIEW_SESSION',
          payload: {
            platform: await this.detectPlatform(),
            timestamp: Date.now(),
          },
        });

        if (response.success && response.data) {
          this.sessionState.isListening = true;
          this.sessionState.sessionId = (response.data as any).id;
          button.classList.add('ca-btn--active');
          this.updateStatus('Listening...', 'success');
        }
      } else {
        // Terminate interview session
        await this.messageBroker.sendMessage({
          command: 'TERMINATE_SESSION',
          payload: {
            sessionId: this.sessionState.sessionId,
          },
        });

        this.sessionState.isListening = false;
        this.sessionState.sessionId = null;
        button.classList.remove('ca-btn--active');
        this.updateStatus('Ready', 'idle');
      }
    } catch (error) {
      console.error('Error toggling listening state:', error);
      this.updateStatus('Error', 'error');
    }
  }

  /**
   * Detect current platform
   */
  private async detectPlatform(): Promise<string> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      
      if (!activeTab?.url) return 'unknown';

      if (activeTab.url.includes('meet.google.com')) return 'google_meet';
      if (activeTab.url.includes('zoom.us')) return 'zoom';
      if (activeTab.url.includes('teams.microsoft.com')) return 'teams';
      if (activeTab.url.includes('linkedin.com')) return 'linkedin';
      if (activeTab.url.includes('hirevue.com')) return 'hirevue';
      
      return 'unknown';
    } catch (error) {
      console.error('Error detecting platform:', error);
      return 'unknown';
    }
  }

  /**
   * Handle transcription updates
   */
  private handleTranscriptionUpdate(payload: TranscriptionPayload): void {
    // Update transcription view
    const transcriptionContainer = document.getElementById('transcription-container');
    if (transcriptionContainer && payload.text) {
      const transcriptElement = document.createElement('div');
      transcriptElement.className = 'ca-transcript-entry';
      transcriptElement.textContent = payload.text;
      transcriptionContainer.appendChild(transcriptElement);
    }
  }

  /**
   * Handle suggestion updates
   */
  private handleSuggestionUpdate(payload: SuggestionPayload): void {
    const suggestionsContainer = document.getElementById('suggestions-container');
    if (suggestionsContainer && payload.suggestions) {
      suggestionsContainer.innerHTML = '';
      
      payload.suggestions.forEach((suggestion) => {
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'ca-suggestion-card';
        suggestionElement.textContent = suggestion.text;
        suggestionsContainer.appendChild(suggestionElement);
      });
    }
  }

  /**
   * Handle screen capture
   */
  private async handleScreenCapture(): Promise<void> {
    try {
      const response = await this.messageBroker.sendMessage({
        command: 'CAPTURE_VISUAL',
        payload: { timestamp: Date.now() },
      });

      if (response.success) {
        this.updateStatus('Screen captured', 'success');
      } else {
        this.updateStatus('Capture failed', 'error');
      }
    } catch (error) {
      console.error('Screen capture error:', error);
      this.updateStatus('Capture error', 'error');
    }
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyboardNavigation(event: KeyboardEvent): void {
    // Implementation for keyboard shortcuts
    if (event.ctrlKey && event.key === 'l') {
      event.preventDefault();
      this.toggleListening();
    }
  }

  /**
   * Update status display
   */
  private updateStatus(message: string, type: string = 'idle'): void {
    console.log(`Status: ${message} (${type})`);
    // Update UI status indicator
  }

  /**
   * Quick settings handlers
   */
  private openQuickSettings(): void {
    // Implementation for quick settings modal
    console.log('Opening quick settings');
  }

  /**
   * Handle session state changes
   */
  private handleSessionStateChange(payload: any): void {
    Object.assign(this.sessionState, payload);
  }

  /**
   * Handle error notifications
   */
  private handleErrorNotification(payload: any): void {
    console.error('Error notification:', payload);
    this.updateStatus('Error occurred', 'error');
  }

  /**
   * Update context indicators
   */
  private updateContextIndicators(payload: any): void {
    // Update UI context indicators
    console.log('Context updated:', payload);
  }

  /**
   * Restore UI state
   */
  private async restoreUIState(): Promise<void> {
    try {
      // Restore previous session state if available
      const savedState = await chrome.storage.local.get('uiState');
      if (savedState.uiState) {
        Object.assign(this.sessionState, savedState.uiState);
      }
    } catch (error) {
      console.error('Error restoring UI state:', error);
    }
  }

  /**
   * Initialize the side panel
   */
  public initialize(): void {
    console.log('CandidAI Side Panel initialized');
    this.updateStatus('Ready', 'idle');
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const controller = new SidePanelController();
    controller.initialize();
  });
} else {
  const controller = new SidePanelController();
  controller.initialize();
} 
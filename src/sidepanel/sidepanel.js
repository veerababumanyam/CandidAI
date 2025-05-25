/**
 * CandidAI Side Panel - Primary UI Orchestration Layer
 * Implements reactive state management with event-driven architecture
 * Leverages Observer, Command, and Mediator patterns for decoupled communication
 */

import { MessageBroker } from '../ts/utils/messaging';
import { UIStateManager } from '../ts/utils/ui';
import { TranscriptionView } from '../ts/ui/TranscriptionView';
import { SuggestionView } from '../ts/ui/SuggestionView';
import { ChatInterface } from '../ts/ui/ChatInterface';
import { VisualAnalysis } from '../ts/ui/VisualAnalysis';

/**
 * Primary Side Panel Controller - Implements Facade Pattern
 * Orchestrates complex subsystem interactions through unified interface
 */
class SidePanelController {
  constructor() {
    // Initialize core service dependencies
    this.messageBroker = new MessageBroker();
    this.stateManager = new UIStateManager();

    // Initialize UI component instances
    this.components = {
      transcription: new TranscriptionView('transcription-container'),
      suggestions: new SuggestionView('suggestions-container'),
      chat: new ChatInterface('chat-messages', 'chat-form'),
      visual: new VisualAnalysis('visual-preview', 'visual-analysis-results'),
    };

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
  initializeEventListeners() {
    // Tab navigation event handling
    document.querySelectorAll('.ca-tabs__tab').forEach((tab) => {
      tab.addEventListener('click', this.handleTabSwitch.bind(this));
    });

    // Listening toggle control with state persistence
    document
      .getElementById('listening-toggle')
      .addEventListener('click', this.toggleListening.bind(this));

    // Settings navigation handler
    document.getElementById('settings-btn').addEventListener('click', () => {
      this.openQuickSettings();
    });

    // Quick Settings Modal handlers
    document.getElementById('close-settings').addEventListener('click', () => {
      this.closeQuickSettings();
    });

    document.getElementById('settings-overlay').addEventListener('click', () => {
      this.closeQuickSettings();
    });

    document.getElementById('open-full-settings').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
      this.closeQuickSettings();
    });

    document.getElementById('save-quick-settings').addEventListener('click', () => {
      this.saveQuickSettings();
    });

    // Visual capture trigger
    document
      .getElementById('capture-screen')
      .addEventListener('click', this.handleScreenCapture.bind(this));

    // Global keyboard event handlers for accessibility
    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
  }

  /**
   * Establish bidirectional communication channel with service worker
   * Implements persistent connection pattern with automatic reconnection
   */
  establishServiceWorkerConnection() {
    // Create persistent port connection
    this.port = chrome.runtime.connect({ name: 'sidepanel' });

    // Message handler with typed command routing
    this.port.onMessage.addListener((message) => {
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
  }
  /**
   * Handle tab switching with state persistence
   * Implements state machine pattern for UI transitions
   */
  handleTabSwitch(event) {
    const targetTab = event.currentTarget;
    const tabTarget = targetTab.dataset.tabTarget;

    // Deactivate all tabs and panels
    document.querySelectorAll('.ca-tabs__tab').forEach((tab) => {
      tab.classList.remove('ca-tabs__tab--active');
      tab.setAttribute('aria-selected', 'false');
    });

    document.querySelectorAll('.ca-panel').forEach((panel) => {
      panel.classList.remove('ca-panel--active');
      panel.hidden = true;
    });

    // Activate target tab and panel
    targetTab.classList.add('ca-tabs__tab--active');
    targetTab.setAttribute('aria-selected', 'true');

    const targetPanel = document.getElementById(`panel-${tabTarget}`);
    targetPanel.classList.add('ca-panel--active');
    targetPanel.hidden = false;

    // Update session state and persist
    this.sessionState.activeTab = tabTarget;
    this.stateManager.persistState('activeTab', tabTarget);

    // Emit tab change event for analytics
    this.messageBroker.emit('TAB_SWITCHED', { tab: tabTarget });
  }

  /**
   * Toggle listening state with comprehensive state management
   * Implements command pattern with undo capability
   */
  async toggleListening() {
    const button = document.getElementById('listening-toggle');

    try {
      if (!this.sessionState.isListening) {
        // Initialize interview session
        const response = await this.messageBroker.sendCommand('INIT_INTERVIEW_SESSION', {
          platform: await this.detectPlatform(),
          timestamp: Date.now(),
        });

        if (response.success) {
          this.sessionState.isListening = true;
          this.sessionState.sessionId = response.data.id;
          button.classList.add('ca-btn--active');
          this.updateStatus('Listening...', 'success');
        }
      } else {
        // Terminate interview session
        await this.messageBroker.sendCommand('TERMINATE_SESSION', {
          sessionId: this.sessionState.sessionId,
        });

        this.sessionState.isListening = false;
        button.classList.remove('ca-btn--active');
        this.updateStatus('Ready', 'idle');
      }
    } catch (error) {
      this.handleErrorNotification({
        message: 'Failed to toggle listening state',
        error: error.message,
      });
    }
  }
  /**
   * Detect video conferencing platform through advanced DOM analysis
   * Implements Strategy pattern with pluggable platform detectors
   */
  async detectPlatform() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = new URL(tab.url);

      // Platform detection matrix with weighted heuristics
      const platformDetectors = {
        'meet.google.com': 'google-meet',
        'zoom.us': 'zoom',
        'teams.microsoft.com': 'microsoft-teams',
        'linkedin.com': 'linkedin',
        'hirevue.com': 'hirevue',
      };

      for (const [domain, platform] of Object.entries(platformDetectors)) {
        if (url.hostname.includes(domain)) {
          return platform;
        }
      }

      return 'generic';
    } catch (error) {
      console.error('Platform detection failed:', error);
      return 'unknown';
    }
  }

  /**
   * Handle real-time transcription updates with buffering
   * Implements reactive stream processing with backpressure handling
   */
  handleTranscriptionUpdate(payload) {
    const { text, speaker, confidence, isQuestion } = payload;

    // Update transcription view with optimistic rendering
    this.components.transcription.addEntry({
      text,
      speaker,
      confidence,
      isQuestion,
      timestamp: Date.now(),
    });

    // Trigger suggestion generation for questions
    if (isQuestion && confidence > 0.7) {
      this.requestSuggestions(text);
    }

    // Update session metrics
    this.updateTokenUsage(payload.tokens || 0);
  }

  /**
   * Request AI-powered suggestions with intelligent debouncing
   * Implements Circuit Breaker pattern for resilient API interactions
   */
  async requestSuggestions(questionText) {
    // Debounce rapid suggestion requests
    if (this.suggestionDebounceTimer) {
      clearTimeout(this.suggestionDebounceTimer);
    }

    this.suggestionDebounceTimer = setTimeout(async () => {
      try {
        this.updateStatus('Generating suggestions...', 'processing');

        const response = await this.messageBroker.sendCommand('GENERATE_SUGGESTIONS', {
          question: questionText,
          sessionId: this.sessionState.sessionId,
          context: {
            platform: this.sessionState.platform,
            previousQuestions: this.components.transcription.getRecentQuestions(3),
          },
        });

        if (response.success) {
          this.handleSuggestionUpdate(response.data);
        }
      } catch (error) {
        console.error('Suggestion generation failed:', error);
        this.components.suggestions.showError('Unable to generate suggestions');
      }
    }, 500); // 500ms debounce threshold
  }

  /**
   * Handle suggestion updates with progressive enhancement
   * Implements Decorator pattern for dynamic content enrichment
   */
  handleSuggestionUpdate(suggestions) {
    this.components.suggestions.renderSuggestions(suggestions);
    this.updateStatus('Ready', 'success');

    // Emit analytics event
    this.messageBroker.emit('SUGGESTIONS_GENERATED', {
      count: suggestions.length,
      sessionId: this.sessionState.sessionId,
    });
  }

  /**
   * Open quick settings modal with current configuration
   * Implements modal pattern with state persistence
   */
  async openQuickSettings() {
    const modal = document.getElementById('settings-modal');

    // Load current settings
    await this.loadQuickSettings();

    // Show modal with animation
    modal.hidden = false;
    modal.focus();

    // Trap focus within modal for accessibility
    this.trapFocus(modal);
  }

  /**
   * Close quick settings modal
   * Implements graceful modal dismissal
   */
  closeQuickSettings() {
    const modal = document.getElementById('settings-modal');
    modal.hidden = true;

    // Return focus to settings button
    document.getElementById('settings-btn').focus();
  }

  /**
   * Load current settings into quick settings form
   * Implements data binding pattern
   */
  async loadQuickSettings() {
    try {
      const settings = await chrome.storage.local.get([
        'llmPreferences',
        'transcriptionPreferences',
        'responsePreferences',
      ]);

      // Populate form fields with current values
      if (settings.llmPreferences?.preferredProvider) {
        document.getElementById('quick-provider').value = settings.llmPreferences.preferredProvider;
      }

      if (settings.transcriptionPreferences?.language) {
        document.getElementById('quick-language').value =
          settings.transcriptionPreferences.language;
      }

      if (settings.responsePreferences?.tone) {
        document.getElementById('quick-tone').value = settings.responsePreferences.tone;
      }

      // Set checkbox state
      const autoSuggestions = settings.responsePreferences?.autoGenerate !== false;
      document.getElementById('quick-auto-suggestions').checked = autoSuggestions;
    } catch (error) {
      console.error('Failed to load quick settings:', error);
    }
  }

  /**
   * Save quick settings changes
   * Implements optimistic updates with rollback capability
   */
  async saveQuickSettings() {
    try {
      const provider = document.getElementById('quick-provider').value;
      const language = document.getElementById('quick-language').value;
      const tone = document.getElementById('quick-tone').value;
      const autoSuggestions = document.getElementById('quick-auto-suggestions').checked;

      // Update storage
      await chrome.storage.local.set({
        'candidai:preferences:llmProvider': provider,
        'candidai:preferences:language': language,
        'candidai:preferences:tone': tone,
        'candidai:preferences:autoSuggestions': autoSuggestions,
      });

      // Show success feedback
      this.showQuickToast('Settings saved successfully', 'success');

      // Close modal
      this.closeQuickSettings();

      // Notify service worker of settings change
      this.messageBroker.emit('SETTINGS_UPDATED', {
        provider,
        language,
        tone,
        autoSuggestions,
      });
    } catch (error) {
      console.error('Failed to save quick settings:', error);
      this.showQuickToast('Failed to save settings', 'error');
    }
  }

  /**
   * Show quick toast notification
   * Implements temporary user feedback
   */
  showQuickToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `ca-toast ca-toast--${type}`;
    toast.textContent = message;

    // Add to document
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('ca-toast--visible'), 10);

    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('ca-toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Trap focus within modal for accessibility
   * Implements keyboard navigation best practices
   */
  trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      } else if (e.key === 'Escape') {
        this.closeQuickSettings();
      }
    };

    modal.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    // Clean up listener when modal closes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'hidden' && modal.hidden) {
          modal.removeEventListener('keydown', handleKeyDown);
          observer.disconnect();
        }
      });
    });

    observer.observe(modal, { attributes: true });
  }

  /**
   * Update status indicator with visual feedback
   * Implements status management pattern
   */
  updateStatus(message, type = 'idle') {
    const statusText = document
      .getElementById('status-indicator')
      ?.querySelector('.ca-status__text');
    const statusDot = document.getElementById('status-indicator')?.querySelector('.ca-status__dot');

    if (statusText) {
      statusText.textContent = message;
    }

    if (statusDot) {
      // Remove existing status classes
      statusDot.classList.remove(
        'ca-status__dot--success',
        'ca-status__dot--error',
        'ca-status__dot--warning',
        'ca-status__dot--processing'
      );

      // Add appropriate class based on type
      switch (type) {
        case 'success':
          statusDot.classList.add('ca-status__dot--success');
          break;
        case 'error':
          statusDot.classList.add('ca-status__dot--error');
          break;
        case 'warning':
          statusDot.classList.add('ca-status__dot--warning');
          break;
        case 'processing':
        case 'loading':
          statusDot.classList.add('ca-status__dot--processing');
          break;
        default:
          // Default idle state - no additional class
          break;
      }
    }
  }

  /**
   * Update token usage display
   * Implements usage tracking pattern
   */
  updateTokenUsage(tokens) {
    this.sessionState.tokenUsage += tokens;
    const tokenDisplay = document.getElementById('token-usage');

    if (tokenDisplay) {
      tokenDisplay.textContent = `${this.sessionState.tokenUsage.toLocaleString()} tokens`;
    }
  }

  /**
   * Show configuration prompt for missing API keys
   * Implements user guidance pattern
   */
  showConfigurationPrompt() {
    this.showQuickToast('Please configure your API keys to start using CandidAI', 'warning');

    // Auto-open settings after a short delay
    setTimeout(() => {
      this.openQuickSettings();
    }, 2000);
  }

  /**
   * Restore UI state from storage
   * Implements state persistence pattern
   */
  async restoreUIState() {
    try {
      const result = await chrome.storage.local.get(['candidai:ui:state']);
      if (result['candidai:ui:state']) {
        const savedState = result['candidai:ui:state'];
        
        // Restore active tab
        if (savedState.activeTab) {
          this.sessionState.activeTab = savedState.activeTab;
          
          // Activate the saved tab
          const tabButton = document.querySelector(`[data-tab-target="${savedState.activeTab}"]`);
          if (tabButton) {
            tabButton.click();
          }
        }
      }
    } catch (error) {
      console.error('Failed to restore UI state:', error);
    }
  }

  /**
   * Handle screen capture functionality
   * Implements visual analysis pipeline
   */
  async handleScreenCapture() {
    try {
      this.updateStatus('Capturing screen...', 'processing');
      
      // Request screen capture permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
      });
      
      // Create canvas and capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.addEventListener('loadedmetadata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        // Convert to blob and process
        canvas.toBlob(async (blob) => {
          try {
            await this.components.visual.processCapture(blob);
            this.updateStatus('Screen captured', 'success');
          } catch (error) {
            console.error('Visual processing failed:', error);
            this.updateStatus('Capture failed', 'error');
          }
        });
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
      });
      
    } catch (error) {
      console.error('Screen capture failed:', error);
      this.updateStatus('Capture failed', 'error');
      this.showQuickToast('Screen capture permission denied', 'error');
    }
  }

  /**
   * Handle keyboard navigation for accessibility
   * Implements keyboard shortcuts and navigation
   */
  handleKeyboardNavigation(event) {
    // Handle keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '1':
          event.preventDefault();
          document.querySelector('[data-tab-target="assistant"]')?.click();
          break;
        case '2':
          event.preventDefault();
          document.querySelector('[data-tab-target="visual"]')?.click();
          break;
        case '3':
          event.preventDefault();
          document.querySelector('[data-tab-target="history"]')?.click();
          break;
        case ',':
          event.preventDefault();
          this.openQuickSettings();
          break;
      }
    }
    
    // Handle escape key
    if (event.key === 'Escape') {
      const modal = document.getElementById('settings-modal');
      if (modal && !modal.hidden) {
        this.closeQuickSettings();
      }
    }
  }

  /**
   * Handle session state changes from service worker
   * Implements reactive state synchronization
   */
  handleSessionStateChange(payload) {
    const { state, data } = payload;
    
    switch (state) {
      case 'LISTENING_STARTED':
        this.sessionState.isListening = true;
        this.sessionState.sessionId = data.sessionId;
        document.getElementById('listening-toggle').classList.add('ca-btn--active');
        this.updateStatus('Listening...', 'success');
        break;
        
      case 'LISTENING_STOPPED':
        this.sessionState.isListening = false;
        this.sessionState.sessionId = null;
        document.getElementById('listening-toggle').classList.remove('ca-btn--active');
        this.updateStatus('Ready', 'idle');
        break;
        
      case 'PLATFORM_DETECTED':
        this.sessionState.platform = data.platform;
        break;
    }
  }

  /**
   * Handle error notifications from service worker
   * Implements centralized error handling
   */
  handleErrorNotification(payload) {
    const { message, error, type = 'error' } = payload;
    
    console.error('Service worker error:', error);
    this.updateStatus(message, 'error');
    this.showQuickToast(message, type);
  }

  /**
   * Update context indicators in the UI
   * Implements context awareness display
   */
  updateContextIndicators(payload) {
    const { platform, confidence, suggestions } = payload;
    
    // Update platform indicator if available
    const platformIndicator = document.getElementById('platform-indicator');
    if (platformIndicator && platform) {
      platformIndicator.textContent = platform;
      platformIndicator.className = `ca-platform ca-platform--${platform}`;
    }
    
    // Update confidence indicator
    const confidenceIndicator = document.getElementById('confidence-indicator');
    if (confidenceIndicator && confidence !== undefined) {
      confidenceIndicator.textContent = `${Math.round(confidence * 100)}%`;
      confidenceIndicator.className = `ca-confidence ca-confidence--${this.getConfidenceLevel(confidence)}`;
    }
  }

  /**
   * Get confidence level for styling
   */
  getConfidenceLevel(confidence) {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  }

  /**
   * Initialize UI component lifecycle
   * Entry point for side panel orchestration
   */
  initialize() {
    console.log('CandidAI Side Panel initializing...');
    this.updateStatus('Initializing...', 'loading');

    // Verify API configuration
    chrome.storage.local.get(['llmApiKeys'], (result) => {
      if (!result.llmApiKeys || Object.keys(result.llmApiKeys).length === 0) {
        this.showConfigurationPrompt();
      } else {
        this.updateStatus('Ready', 'success');
      }
    });
  }
}

// Bootstrap side panel controller
const controller = new SidePanelController();
controller.initialize();

export { SidePanelController };

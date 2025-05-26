/**
 * MeetingControls - Advanced Meeting Assistant UI Controller
 * Provides comprehensive meeting controls with adaptive interface
 * Supports call type selection, tone adjustment, and multi-document management
 */

import type {
  CallType,
  ToneType,
  DocumentMetadata,
  MeetingControlsState,
  DocumentUploadState,
  MeetingContext,
  ContextualResponse
} from '../types/index';

import {
  CALL_TYPES,
  TONE_TYPES,
  CALL_TYPE_CONFIGS,
  TONE_CONFIGS,
  MAX_DOCUMENTS,
  SUPPORTED_DOCUMENT_FORMATS
} from '../utils/constants';

import { DocumentManager } from '../services/documentManager';
import { LLMOrchestrator } from '../services/llmOrchestrator';
import { MessageBroker } from '../utils/messaging';

// =============================================================================
// UI COMPONENT INTERFACES
// =============================================================================

interface MeetingControlsConfig {
  readonly containerId: string;
  readonly allowCustomCallTypes: boolean;
  readonly allowCustomTones: boolean;
  readonly showAdvancedOptions: boolean;
  readonly theme: 'light' | 'dark' | 'auto';
}

interface CallTypeOption {
  readonly value: CallType;
  readonly label: string;
  readonly description: string;
  readonly icon: string;
  readonly suggestedTones: readonly ToneType[];
}

interface ToneOption {
  readonly value: ToneType;
  readonly label: string;
  readonly description: string;
  readonly characteristics: readonly string[];
}

// =============================================================================
// MEETING CONTROLS UI COMPONENT
// =============================================================================

export class MeetingControls {
  private readonly documentManager: DocumentManager;
  private readonly llmOrchestrator: LLMOrchestrator;
  private readonly messageBroker: MessageBroker;
  private readonly config: MeetingControlsConfig;

  private currentState: MeetingControlsState;
  private uploadState: DocumentUploadState;
  private sessionId: string;
  private container: HTMLElement;

  // UI Elements
  private callTypeSelect?: HTMLSelectElement;
  private toneSelect?: HTMLSelectElement;
  private documentUpload?: HTMLInputElement;
  private documentList?: HTMLElement;
  private statusDisplay?: HTMLElement;
  private aiToggle?: HTMLInputElement;
  private suggestionPanel?: HTMLElement;

  constructor(config: MeetingControlsConfig) {
    this.config = config;
    this.documentManager = new DocumentManager();
    this.llmOrchestrator = new LLMOrchestrator();
    this.messageBroker = new MessageBroker();
    
    this.sessionId = this.generateSessionId();
    this.initializeState();
    this.initializeUI();
    this.setupEventListeners();
  }

  // =============================================================================
  // INITIALIZATION METHODS
  // =============================================================================

  /**
   * Initialize component state with default values
   */
  private initializeState(): void {
    this.currentState = {
      isRecording: false,
      isTranscribing: false,
      callType: CALL_TYPES.CLIENT_MEETING,
      tone: TONE_TYPES.PROFESSIONAL,
      documentsLoaded: 0,
      aiEnabled: true,
      confidentialityLevel: 'internal'
    };

    this.uploadState = {
      isUploading: false,
      uploadProgress: 0,
      error: null,
      errors: [],
      processed: 0,
      total: 0
    };
  }

  /**
   * Create and inject UI elements into container
   */
  private initializeUI(): void {
    this.container = document.getElementById(this.config.containerId) as HTMLElement;
    if (!this.container) {
      throw new Error(`Container element with ID '${this.config.containerId}' not found`);
    }

    this.container.innerHTML = this.generateHTML();
    this.cacheUIElements();
    this.applyTheme();
    this.updateUI();
  }

  /**
   * Generate comprehensive HTML structure
   */
  private generateHTML(): string {
    return `
      <div class="meeting-controls-container" data-theme="${this.config.theme}">
        <!-- Header Section -->
        <div class="controls-header">
          <div class="session-info">
            <h3 class="meeting-title">AI Meeting Assistant</h3>
            <span class="session-id">Session: ${this.sessionId.slice(-8)}</span>
          </div>
          <div class="status-indicators">
            <div class="status-dot" data-status="ready"></div>
            <span class="status-text">Ready</span>
          </div>
        </div>

        <!-- Main Controls Section -->
        <div class="main-controls">
          <!-- Call Type Selection -->
          <div class="control-group">
            <label for="call-type-select" class="control-label">
              <i class="icon-meeting"></i>
              Call Type
            </label>
            <select id="call-type-select" class="control-select call-type-select">
              ${this.generateCallTypeOptions()}
            </select>
            <div class="control-description">
              <span id="call-type-description">Select the type of meeting or call</span>
            </div>
          </div>

          <!-- Tone Selection -->
          <div class="control-group">
            <label for="tone-select" class="control-label">
              <i class="icon-tone"></i>
              Communication Tone
            </label>
            <select id="tone-select" class="control-select tone-select">
              ${this.generateToneOptions()}
            </select>
            <div class="control-description">
              <span id="tone-description">Choose your preferred communication style</span>
            </div>
          </div>

          <!-- Document Upload Section -->
          <div class="control-group document-section">
            <label class="control-label">
              <i class="icon-documents"></i>
              Documents (${this.currentState.documentsLoaded}/${MAX_DOCUMENTS})
            </label>
            
            <div class="document-upload-area">
              <input type="file" 
                     id="document-upload" 
                     class="document-input" 
                     multiple 
                     accept="${this.getAcceptedFileTypes()}"
                     style="display: none;">
              
              <div class="upload-zone" id="upload-zone">
                <div class="upload-content">
                  <i class="icon-upload-cloud"></i>
                  <p class="upload-text">
                    <strong>Drop files here</strong> or 
                    <button type="button" class="upload-button">browse</button>
                  </p>
                  <p class="upload-hint">
                    Supports: ${SUPPORTED_DOCUMENT_FORMATS.join(', ')} 
                    (Max ${MAX_DOCUMENTS} files, 10MB each)
                  </p>
                </div>
              </div>
            </div>

            <!-- Upload Progress -->
            <div class="upload-progress" id="upload-progress" style="display: none;">
              <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
              </div>
              <span class="progress-text" id="progress-text">Uploading...</span>
            </div>

            <!-- Document List -->
            <div class="document-list" id="document-list">
              <!-- Documents will be dynamically added here -->
            </div>
          </div>

          <!-- AI Assistant Toggle -->
          <div class="control-group ai-control">
            <div class="toggle-container">
              <label class="toggle-label">
                <input type="checkbox" id="ai-toggle" class="ai-toggle" checked>
                <span class="toggle-slider"></span>
                <span class="toggle-text">
                  <i class="icon-ai"></i>
                  AI Assistance
                </span>
              </label>
            </div>
            <div class="ai-status">
              <span class="ai-status-text">AI suggestions enabled</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-section">
          <button type="button" class="action-btn primary" id="start-meeting-btn">
            <i class="icon-play"></i>
            Start Meeting
          </button>
          <button type="button" class="action-btn secondary" id="test-settings-btn">
            <i class="icon-test"></i>
            Test Settings
          </button>
        </div>

        <!-- Live Suggestions Panel -->
        <div class="suggestions-panel" id="suggestions-panel" style="display: none;">
          <div class="suggestions-header">
            <h4>AI Suggestions</h4>
            <button type="button" class="minimize-btn" id="minimize-suggestions">
              <i class="icon-minimize"></i>
            </button>
          </div>
          <div class="suggestions-content" id="suggestions-content">
            <!-- Live suggestions will appear here -->
          </div>
        </div>

        <!-- Status Display -->
        <div class="status-display" id="status-display">
          <div class="status-message">Ready to assist with your meeting</div>
        </div>
      </div>
    `;
  }

  /**
   * Generate call type dropdown options
   */
  private generateCallTypeOptions(): string {
    const callTypes: CallTypeOption[] = [
      {
        value: CALL_TYPES.INTERVIEW,
        label: 'Job Interview',
        description: 'Job interviews and candidate assessments',
        icon: 'icon-interview',
        suggestedTones: [TONE_TYPES.PROFESSIONAL, TONE_TYPES.FORMAL]
      },
      {
        value: CALL_TYPES.SALES_PITCH,
        label: 'Sales Pitch',
        description: 'Product demonstrations and sales presentations',
        icon: 'icon-sales',
        suggestedTones: [TONE_TYPES.PERSUASIVE, TONE_TYPES.CONFIDENT]
      },
      {
        value: CALL_TYPES.SALES_CALL,
        label: 'Sales Call',
        description: 'Client meetings and sales discussions',
        icon: 'icon-phone',
        suggestedTones: [TONE_TYPES.CONSULTATIVE, TONE_TYPES.FRIENDLY]
      },
      {
        value: CALL_TYPES.CLIENT_MEETING,
        label: 'Client Meeting',
        description: 'Client consultations and project discussions',
        icon: 'icon-handshake',
        suggestedTones: [TONE_TYPES.PROFESSIONAL, TONE_TYPES.CONSULTATIVE]
      },
      {
        value: CALL_TYPES.TEAM_MEETING,
        label: 'Team Meeting',
        description: 'Internal team discussions and planning',
        icon: 'icon-team',
        suggestedTones: [TONE_TYPES.CASUAL, TONE_TYPES.FRIENDLY]
      },
      {
        value: CALL_TYPES.ONE_ON_ONE,
        label: 'One-on-One',
        description: 'Personal meetings and coaching sessions',
        icon: 'icon-person',
        suggestedTones: [TONE_TYPES.EMPATHETIC, TONE_TYPES.FRIENDLY]
      },
      {
        value: CALL_TYPES.PERFORMANCE_REVIEW,
        label: 'Performance Review',
        description: 'Employee evaluations and feedback sessions',
        icon: 'icon-chart',
        suggestedTones: [TONE_TYPES.DIPLOMATIC, TONE_TYPES.PROFESSIONAL]
      },
      {
        value: CALL_TYPES.PRESENTATION,
        label: 'Presentation',
        description: 'Formal presentations and demos',
        icon: 'icon-presentation',
        suggestedTones: [TONE_TYPES.CONFIDENT, TONE_TYPES.FORMAL]
      },
      {
        value: CALL_TYPES.BRAINSTORMING,
        label: 'Brainstorming',
        description: 'Creative sessions and idea generation',
        icon: 'icon-lightbulb',
        suggestedTones: [TONE_TYPES.CREATIVE, TONE_TYPES.CASUAL]
      }
    ];

    return callTypes.map(type => 
      `<option value="${type.value}" data-description="${type.description}" data-icon="${type.icon}">
        ${type.label}
      </option>`
    ).join('');
  }

  /**
   * Generate tone dropdown options
   */
  private generateToneOptions(): string {
    const tones: ToneOption[] = [
      {
        value: TONE_TYPES.PROFESSIONAL,
        label: 'Professional',
        description: 'Business-appropriate and structured',
        characteristics: ['Clear', 'Structured', 'Respectful']
      },
      {
        value: TONE_TYPES.FORMAL,
        label: 'Formal',
        description: 'Highly professional and conservative',
        characteristics: ['Polite', 'Reserved', 'Precise']
      },
      {
        value: TONE_TYPES.CASUAL,
        label: 'Casual',
        description: 'Relaxed and conversational',
        characteristics: ['Friendly', 'Approachable', 'Natural']
      },
      {
        value: TONE_TYPES.FRIENDLY,
        label: 'Friendly',
        description: 'Warm and approachable',
        characteristics: ['Warm', 'Supportive', 'Engaging']
      },
      {
        value: TONE_TYPES.CONFIDENT,
        label: 'Confident',
        description: 'Assertive and self-assured',
        characteristics: ['Assertive', 'Direct', 'Decisive']
      },
      {
        value: TONE_TYPES.CONSULTATIVE,
        label: 'Consultative',
        description: 'Advisory and solution-focused',
        characteristics: ['Helpful', 'Solution-oriented', 'Collaborative']
      },
      {
        value: TONE_TYPES.PERSUASIVE,
        label: 'Persuasive',
        description: 'Compelling and influential',
        characteristics: ['Compelling', 'Motivating', 'Results-focused']
      },
      {
        value: TONE_TYPES.EMPATHETIC,
        label: 'Empathetic',
        description: 'Understanding and supportive',
        characteristics: ['Caring', 'Understanding', 'Patient']
      },
      {
        value: TONE_TYPES.ANALYTICAL,
        label: 'Analytical',
        description: 'Data-driven and logical',
        characteristics: ['Logical', 'Data-focused', 'Systematic']
      },
      {
        value: TONE_TYPES.CREATIVE,
        label: 'Creative',
        description: 'Innovative and imaginative',
        characteristics: ['Innovative', 'Open-minded', 'Flexible']
      }
    ];

    return tones.map(tone => 
      `<option value="${tone.value}" data-description="${tone.description}">
        ${tone.label}
      </option>`
    ).join('');
  }

  // =============================================================================
  // EVENT HANDLING & INTERACTIONS
  // =============================================================================

  /**
   * Setup all event listeners for user interactions
   */
  private setupEventListeners(): void {
    // Call type selection
    this.callTypeSelect?.addEventListener('change', (e) => {
      this.handleCallTypeChange(e.target as HTMLSelectElement);
    });

    // Tone selection
    this.toneSelect?.addEventListener('change', (e) => {
      this.handleToneChange(e.target as HTMLSelectElement);
    });

    // Document upload
    this.documentUpload?.addEventListener('change', (e) => {
      this.handleFileSelection(e.target as HTMLInputElement);
    });

    // Drag & drop for documents
    const uploadZone = document.getElementById('upload-zone');
    if (uploadZone) {
      uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
      uploadZone.addEventListener('drop', this.handleFileDrop.bind(this));
      uploadZone.addEventListener('click', () => this.documentUpload?.click());
    }

    // AI toggle
    this.aiToggle?.addEventListener('change', (e) => {
      this.handleAIToggle(e.target as HTMLInputElement);
    });

    // Action buttons
    document.getElementById('start-meeting-btn')?.addEventListener('click', () => {
      this.startMeeting();
    });

    document.getElementById('test-settings-btn')?.addEventListener('click', () => {
      this.testCurrentSettings();
    });

    // Upload button
    document.querySelector('.upload-button')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.documentUpload?.click();
    });
  }

  /**
   * Handle call type selection change
   */
  private async handleCallTypeChange(select: HTMLSelectElement): Promise<void> {
    const newCallType = select.value as CallType;
    const option = select.selectedOptions[0];
    const description = option.getAttribute('data-description') || '';

    // Update state
    this.currentState = {
      ...this.currentState,
      callType: newCallType
    };

    // Update description
    const descElement = document.getElementById('call-type-description');
    if (descElement) {
      descElement.textContent = description;
    }

    // Suggest appropriate tone
    this.suggestToneForCallType(newCallType);

    // Update UI styling based on call type
    this.updateCallTypeTheme(newCallType);

    // Notify other components
    await this.messageBroker.sendCommand('UPDATE_CALL_TYPE', {
      callType: newCallType,
      sessionId: this.sessionId
    });

    this.updateStatus(`Call type changed to: ${option.textContent}`);
  }

  /**
   * Handle tone selection change
   */
  private async handleToneChange(select: HTMLSelectElement): Promise<void> {
    const newTone = select.value as ToneType;
    const option = select.selectedOptions[0];
    const description = option.getAttribute('data-description') || '';

    // Update state
    this.currentState = {
      ...this.currentState,
      tone: newTone
    };

    // Update description
    const descElement = document.getElementById('tone-description');
    if (descElement) {
      descElement.textContent = description;
    }

    // Update tone preview
    this.updateTonePreview(newTone);

    // Notify other components
    await this.messageBroker.sendCommand('UPDATE_TONE', {
      tone: newTone,
      sessionId: this.sessionId
    });

    this.updateStatus(`Tone changed to: ${option.textContent}`);
  }

  /**
   * Handle file selection for document upload
   */
  private async handleFileSelection(input: HTMLInputElement): Promise<void> {
    const files = input.files;
    if (!files || files.length === 0) return;

    await this.uploadDocuments(files);
    input.value = ''; // Clear input for reuse
  }

  /**
   * Handle drag over event for file upload
   */
  private handleDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    
    const uploadZone = e.currentTarget as HTMLElement;
    uploadZone.classList.add('drag-over');
  }

  /**
   * Handle file drop for document upload
   */
  private async handleFileDrop(e: DragEvent): Promise<void> {
    e.preventDefault();
    e.stopPropagation();

    const uploadZone = e.currentTarget as HTMLElement;
    uploadZone.classList.remove('drag-over');

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await this.uploadDocuments(files);
    }
  }

  // =============================================================================
  // DOCUMENT MANAGEMENT
  // =============================================================================

  /**
   * Upload and process multiple documents
   */
  private async uploadDocuments(files: FileList): Promise<void> {
    this.uploadState = {
      isUploading: true,
      uploadProgress: 0,
      error: null,
      errors: [],
      processed: 0,
      total: files.length
    };

    this.showUploadProgress();

    try {
      const result = await this.documentManager.uploadDocuments(
        files,
        this.currentState.callType as CallType,
        this.sessionId
      );

      if (result.success) {
        this.updateDocumentList(result.uploaded);
        this.currentState = {
          ...this.currentState,
          documentsLoaded: this.currentState.documentsLoaded + result.uploaded.length
        };
      }

      if (result.errors.length > 0) {
        this.uploadState = {
          ...this.uploadState,
          errors: [...result.errors]
        };
        this.showUploadErrors(result.errors);
      }

      this.updateStatus(`Uploaded ${result.uploaded.length} documents successfully`);

    } catch (error) {
      console.error('Document upload failed:', error);
      this.updateStatus('Document upload failed', 'error');
    } finally {
      this.updateUploadState({
        isUploading: false,
        uploadProgress: 100,
        error: null
      });
      this.hideUploadProgress();
    }
  }

  // =============================================================================
  // UI UPDATE METHODS
  // =============================================================================

  /**
   * Update the entire UI based on current state
   */
  private updateUI(): void {
    this.updateDocumentCounter();
    this.updateAIStatus();
    this.updateActionButtons();
  }

  /**
   * Show upload progress indicator
   */
  private showUploadProgress(): void {
    const progressElement = document.getElementById('upload-progress');
    if (progressElement) {
      progressElement.style.display = 'block';
    }
  }

  /**
   * Hide upload progress indicator
   */
  private hideUploadProgress(): void {
    const progressElement = document.getElementById('upload-progress');
    if (progressElement) {
      progressElement.style.display = 'none';
    }
  }

  /**
   * Update document list display
   */
  private updateDocumentList(documents: readonly DocumentMetadata[]): void {
    const listElement = document.getElementById('document-list');
    if (!listElement) return;

    documents.forEach(doc => {
      const docElement = this.createDocumentElement(doc);
      listElement.appendChild(docElement);
    });
  }

  /**
   * Create document element for list display
   */
  private createDocumentElement(doc: DocumentMetadata): HTMLElement {
    const element = document.createElement('div');
    element.className = 'document-item';
    element.setAttribute('data-document-id', doc.id);

    element.innerHTML = `
      <div class="document-info">
        <div class="document-icon">
          <i class="icon-file-${doc.format}"></i>
        </div>
        <div class="document-details">
          <div class="document-name">${doc.name}</div>
          <div class="document-meta">
            <span class="document-type">${doc.type}</span>
            <span class="document-size">${this.formatFileSize(doc.size)}</span>
            <span class="document-priority priority-${doc.priority}">${doc.priority}</span>
          </div>
        </div>
      </div>
      <div class="document-actions">
        <button type="button" class="doc-action-btn preview" title="Preview">
          <i class="icon-eye"></i>
        </button>
        <button type="button" class="doc-action-btn remove" title="Remove">
          <i class="icon-trash"></i>
        </button>
      </div>
    `;

    return element;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get accepted file types for upload input
   */
  private getAcceptedFileTypes(): string {
    return SUPPORTED_DOCUMENT_FORMATS.map(format => `.${format}`).join(',');
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  /**
   * Update status message
   */
  private updateStatus(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const statusElement = document.querySelector('.status-message');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `status-message status-${type}`;
    }
  }

  // Additional utility methods would be implemented here...
  private cacheUIElements(): void {
    this.callTypeSelect = document.getElementById('call-type-select') as HTMLSelectElement;
    this.toneSelect = document.getElementById('tone-select') as HTMLSelectElement;
    this.documentUpload = document.getElementById('document-upload') as HTMLInputElement;
    this.aiToggle = document.getElementById('ai-toggle') as HTMLInputElement;
  }

  private applyTheme(): void { /* Theme application logic */ }
  private suggestToneForCallType(callType: CallType): void { /* Tone suggestion logic */ }
  private updateCallTypeTheme(callType: CallType): void { /* Theme update logic */ }
  private updateTonePreview(tone: ToneType): void { /* Tone preview logic */ }
  private showUploadErrors(errors: readonly string[]): void { /* Error display logic */ }
  private updateDocumentCounter(): void { /* Counter update logic */ }
  private updateAIStatus(): void { /* AI status update logic */ }
  private updateActionButtons(): void { /* Button state update logic */ }
  private handleAIToggle(input: HTMLInputElement): void { /* AI toggle logic */ }
  private async startMeeting(): Promise<void> { /* Meeting start logic */ }
  private async testCurrentSettings(): Promise<void> { /* Settings test logic */ }
  private updateUploadState(state: Partial<DocumentUploadState>): void {
    this.uploadState = {
      ...this.uploadState,
      ...state
    };
  }
} 
/**
 * CandidAI Options Page - Configuration Management Interface
 * Implements comprehensive settings management with enterprise patterns
 */

import { MessageBroker } from '../ts/utils/messaging';
import type { AppConfig, LLMProvider } from '../ts/types/index';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface OptionsState {
  isDirty: boolean;
  isLoading: boolean;
  currentProvider: string;
  apiKeys: Record<string, string>;
  configuration: Partial<AppConfig>;
}

// Declare global Sortable type
declare global {
  interface Window {
    Sortable: any;
  }
}

// =============================================================================
// OPTIONS CONTROLLER
// =============================================================================

/**
 * Options Page Controller - Manages extension configuration
 */
class OptionsController {
  private messageBroker: MessageBroker;
  private state: OptionsState;

  constructor() {
    this.messageBroker = new MessageBroker();
    
    this.state = {
      isDirty: false,
      isLoading: false,
      currentProvider: 'openai',
      apiKeys: {},
      configuration: {},
    };

    this.initializeEventListeners();
    this.loadConfiguration();
  }

  /**
   * Initialize event listeners for the options page
   */
  private initializeEventListeners(): void {
    // Initialize navigation
    this.initializeNavigation();
    
    // API Key save buttons
    const saveApiKeysBtn = document.getElementById('save-api-keys');
    if (saveApiKeysBtn) {
      saveApiKeysBtn.addEventListener('click', this.saveApiKeys.bind(this));
    }

    // Test connection button
    const testConnectionBtn = document.getElementById('test-api-keys');
    if (testConnectionBtn) {
      testConnectionBtn.addEventListener('click', this.testAPIConnections.bind(this));
    }

    // Save context button
    const saveContextBtn = document.getElementById('save-context');
    if (saveContextBtn) {
      saveContextBtn.addEventListener('click', this.saveContext.bind(this));
    }

    // Save LLM configuration
    const saveLlmConfigBtn = document.getElementById('save-llm-config');
    if (saveLlmConfigBtn) {
      saveLlmConfigBtn.addEventListener('click', this.saveLlmConfiguration.bind(this));
    }

    // Save transcription settings
    const saveTranscriptionBtn = document.getElementById('save-transcription');
    if (saveTranscriptionBtn) {
      saveTranscriptionBtn.addEventListener('click', this.saveTranscriptionSettings.bind(this));
    }

    // Save response style
    const saveResponseStyleBtn = document.getElementById('save-response-style');
    if (saveResponseStyleBtn) {
      saveResponseStyleBtn.addEventListener('click', this.saveResponseStyle.bind(this));
    }

    // Save language settings
    const saveLanguageBtn = document.getElementById('save-language');
    if (saveLanguageBtn) {
      saveLanguageBtn.addEventListener('click', this.saveLanguageSettings.bind(this));
    }

    // Test microphone button
    const testMicBtn = document.getElementById('test-microphone');
    if (testMicBtn) {
      testMicBtn.addEventListener('click', this.testMicrophone.bind(this));
    }

    // Preview style button
    const previewStyleBtn = document.getElementById('preview-style');
    if (previewStyleBtn) {
      previewStyleBtn.addEventListener('click', this.previewResponseStyle.bind(this));
    }

    // Export data button
    const exportDataBtn = document.getElementById('export-data');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', this.exportData.bind(this));
    }

    // Clear data button
    const clearDataBtn = document.getElementById('clear-data');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', this.clearAllData.bind(this));
    }

    // Calendar connect buttons
    document.querySelectorAll('[id$="-calendar-connect"]').forEach(btn => {
      btn.addEventListener('click', this.connectCalendar.bind(this));
    });

    // Initialize document upload handlers
    this.initializeDocumentUpload();
    
    // Initialize LLM reordering functionality
    this.initializeLLMReordering();
  }

  /**
   * Initialize navigation system for section switching
   */
  private initializeNavigation(): void {
    // Get all navigation buttons
    const navButtons = document.querySelectorAll('.ca-nav__button');
    
    // Add click listeners to navigation buttons
    navButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const targetSection = button.getAttribute('data-section');
        if (targetSection) {
          this.switchToSection(targetSection);
        }
      });
    });

    // Initialize with API Keys section active by default
    this.switchToSection('api-keys');
  }

  /**
   * Switch to a specific section
   */
  private switchToSection(targetSectionName: string): void {
    console.log(`🔄 Switching to section: ${targetSectionName}`);
    
    // Remove active class from all navigation buttons
    const allButtons = document.querySelectorAll('.ca-nav__button');
    console.log(`📍 Found ${allButtons.length} navigation buttons`);
    allButtons.forEach(btn => {
      btn.classList.remove('ca-nav__button--active');
    });

    // Add active class to target button
    const activeButton = document.querySelector(`[data-section="${targetSectionName}"]`);
    if (activeButton) {
      activeButton.classList.add('ca-nav__button--active');
      console.log(`✅ Activated button for: ${targetSectionName}`);
    } else {
      console.error(`❌ Button not found for section: ${targetSectionName}`);
    }

    // Hide all sections
    const allSections = document.querySelectorAll('.ca-section');
    console.log(`📍 Found ${allSections.length} sections`);
    allSections.forEach(section => {
      section.classList.remove('ca-section--active');
      (section as HTMLElement).style.display = 'none';
    });

    // Show target section
    const targetSection = document.querySelector(`#section-${targetSectionName}`);
    if (targetSection) {
      targetSection.classList.add('ca-section--active');
      (targetSection as HTMLElement).style.display = 'block';
      console.log(`✅ Showed section: section-${targetSectionName}`);
    } else {
      console.error(`❌ Section not found: section-${targetSectionName}`);
      // List all available sections for debugging
      const availableSections = document.querySelectorAll('[id^="section-"]');
      console.log('Available sections:', Array.from(availableSections).map(s => s.id));
    }
  }

  /**
   * Load current configuration from storage
   */
  private async loadConfiguration(): Promise<void> {
    try {
      this.state.isLoading = true;
      this.updateLoadingState(true);

      const config = await chrome.storage.sync.get();
      this.state.configuration = config;

      // Populate form fields
      this.populateApiKeys(config.apiKeys || {});
      this.populateLlmConfig(config.llmConfig || {});
      this.populateTranscriptionSettings(config.transcription || {});
      this.populateResponseStyle(config.responseStyle || {});
      this.populateLanguageSettings(config.language || {});

    } catch (error) {
      console.error('Error loading configuration:', error);
      this.showNotification('Failed to load configuration', 'error');
    } finally {
      this.state.isLoading = false;
      this.updateLoadingState(false);
    }
  }

  /**
   * Save API keys
   */
  private async saveApiKeys(): Promise<void> {
    try {
      const apiKeys = this.collectApiKeys();
      await chrome.storage.sync.set({ apiKeys });
      
      this.state.apiKeys = apiKeys;
      this.showNotification('API keys saved successfully', 'success');
    } catch (error) {
      console.error('Error saving API keys:', error);
      this.showNotification('Failed to save API keys', 'error');
    }
  }

  /**
   * Test API connection
   */
  private async testConnection(): Promise<void> {
    try {
      this.updateLoadingState(true);
      
      const response = await this.messageBroker.sendMessage({
        command: 'TEST_LLM_CONNECTION',
        payload: {
          provider: this.state.currentProvider,
          apiKeys: this.state.apiKeys,
        },
      });

      if (response.success) {
        this.showNotification('Connection successful!', 'success');
      } else {
        this.showNotification('Connection failed: ' + response.error, 'error');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      this.showNotification('Connection test failed', 'error');
    } finally {
      this.updateLoadingState(false);
    }
  }

  /**
   * Save context settings
   */
  private async saveContext(): Promise<void> {
    try {
      const contextData = this.collectContextData();
      await chrome.storage.sync.set({ context: contextData });
      
      this.showNotification('Context saved successfully', 'success');
    } catch (error) {
      console.error('Error saving context:', error);
      this.showNotification('Failed to save context', 'error');
    }
  }

  /**
   * Save LLM configuration
   */
  private async saveLlmConfiguration(): Promise<void> {
    try {
      const llmConfig = this.collectLlmConfig();
      await chrome.storage.sync.set({ llmConfig });
      
      this.showNotification('LLM configuration saved', 'success');
    } catch (error) {
      console.error('Error saving LLM config:', error);
      this.showNotification('Failed to save LLM configuration', 'error');
    }
  }

  /**
   * Save transcription settings
   */
  private async saveTranscriptionSettings(): Promise<void> {
    try {
      const transcriptionSettings = this.collectTranscriptionSettings();
      await chrome.storage.sync.set({ transcription: transcriptionSettings });
      
      this.showNotification('Transcription settings saved', 'success');
    } catch (error) {
      console.error('Error saving transcription settings:', error);
      this.showNotification('Failed to save transcription settings', 'error');
    }
  }

  /**
   * Save response style settings
   */
  private async saveResponseStyle(): Promise<void> {
    try {
      const responseStyle = this.collectResponseStyle();
      await chrome.storage.sync.set({ responseStyle });
      
      this.showNotification('Response style saved', 'success');
    } catch (error) {
      console.error('Error saving response style:', error);
      this.showNotification('Failed to save response style', 'error');
    }
  }

  /**
   * Save language settings
   */
  private async saveLanguageSettings(): Promise<void> {
    try {
      const languageSettings = this.collectLanguageSettings();
      await chrome.storage.sync.set({ language: languageSettings });
      
      this.showNotification('Language settings saved', 'success');
    } catch (error) {
      console.error('Error saving language settings:', error);
      this.showNotification('Failed to save language settings', 'error');
    }
  }

  /**
   * Test microphone access
   */
  private async testMicrophone(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      this.showNotification('Microphone access granted', 'success');
    } catch (error) {
      console.error('Microphone test failed:', error);
      this.showNotification('Microphone access denied', 'error');
    }
  }

  /**
   * Preview response style
   */
  private previewResponseStyle(): void {
    const style = this.collectResponseStyle();
    const preview = this.generateStylePreview(style);
    
    const previewElement = document.getElementById('style-preview');
    if (previewElement) {
      previewElement.innerHTML = preview;
    }
  }

  /**
   * Export user data
   */
  private async exportData(): Promise<void> {
    try {
      const data = await chrome.storage.sync.get();
      const dataBlob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(dataBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidai-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      this.showNotification('Data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showNotification('Failed to export data', 'error');
    }
  }

  /**
   * Clear all user data
   */
  private async clearAllData(): Promise<void> {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return;
    }

    try {
      await chrome.storage.sync.clear();
      await chrome.storage.local.clear();
      
      this.showNotification('All data cleared', 'success');
      location.reload();
    } catch (error) {
      console.error('Error clearing data:', error);
      this.showNotification('Failed to clear data', 'error');
    }
  }

  /**
   * Connect calendar
   */
  private connectCalendar(event: Event): void {
    const target = event.target as HTMLElement;
    const calendarType = target.id.replace('-calendar-connect', '');
    
    console.log(`Connecting ${calendarType} calendar`);
    this.showNotification(`${calendarType} calendar connection initiated`, 'info');
  }

  /**
   * Initialize document upload handlers
   */
  private initializeDocumentUpload(): void {
    const dropzone = document.getElementById('resume-dropzone');
    const fileInput = document.getElementById('resume-input') as HTMLInputElement;
    const preview = document.getElementById('resume-preview');

    if (!dropzone || !fileInput || !preview) return;

    // Drag and drop handlers
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('ca-dropzone--dragover');
    });

    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('ca-dropzone--dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('ca-dropzone--dragover');
      
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        this.handleFileUpload(files[0]);
      }
    });

    // Click to upload
    dropzone.addEventListener('click', () => {
      fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        this.handleFileUpload(target.files[0]);
      }
    });

    // Remove file button
    const removeBtn = document.getElementById('remove-resume');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        this.removeUploadedFile();
      });
    }
  }

  /**
   * Handle file upload
   */
  private handleFileUpload(file: File): void {
    console.log('📄 File uploaded:', file.name, file.size);
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      this.showToast('Please upload a PDF or DOCX file', 'error');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      this.showToast('File size must be less than 10MB', 'error');
      return;
    }

    // Show preview
    this.showFilePreview(file);
    
    // Process file (placeholder for actual processing)
    this.processDocument(file);
  }

  /**
   * Show file preview
   */
  private showFilePreview(file: File): void {
    const preview = document.getElementById('resume-preview');
    const nameElement = preview?.querySelector('.ca-file-preview__name');
    const sizeElement = preview?.querySelector('.ca-file-preview__size');

    if (preview && nameElement && sizeElement) {
      nameElement.textContent = file.name;
      sizeElement.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
      preview.style.display = 'flex';
      
      // Hide dropzone
      const dropzone = document.getElementById('resume-dropzone');
      if (dropzone) {
        dropzone.style.display = 'none';
      }
    }
  }

  /**
   * Remove uploaded file
   */
  private removeUploadedFile(): void {
    const preview = document.getElementById('resume-preview');
    const dropzone = document.getElementById('resume-dropzone');
    const fileInput = document.getElementById('resume-input') as HTMLInputElement;

    if (preview) preview.style.display = 'none';
    if (dropzone) dropzone.style.display = 'flex';
    if (fileInput) fileInput.value = '';
    
    console.log('📄 File removed');
  }

  /**
   * Process document (placeholder)
   */
  private async processDocument(file: File): Promise<void> {
    try {
      // This would normally send to service worker for processing
      console.log('📄 Processing document:', file.name);
      this.showToast('Document uploaded successfully!', 'success');
    } catch (error) {
      console.error('Document processing error:', error);
      this.showToast('Failed to process document', 'error');
    }
  }

  /**
   * Initialize LLM fallback reordering
   */
  private initializeLLMReordering(): void {
    console.log('🔄 Initializing LLM fallback reordering...');
    
    // Show loading status
    this.updateSortableStatus('loading');
    
    // Add SortableJS dynamically if not present
    if (typeof window.Sortable === 'undefined') {
      console.log('📦 Loading SortableJS library...');
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js';
      
      script.onload = () => {
        console.log('✅ SortableJS loaded successfully');
        this.setupSortable();
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load SortableJS');
        this.updateSortableStatus('error');
        this.showToast('Failed to load drag & drop functionality', 'error');
      };
      
      document.head.appendChild(script);
    } else {
      console.log('✅ SortableJS already available');
      this.setupSortable();
    }
  }

  /**
   * Update sortable status indicator
   */
  private updateSortableStatus(status: 'loading' | 'ready' | 'error'): void {
    const statusContainer = document.getElementById('sortable-status');
    if (!statusContainer) return;
    
    const loadingText = statusContainer.querySelector('.ca-loading-text') as HTMLElement;
    const readyText = statusContainer.querySelector('.ca-ready-text') as HTMLElement;
    
    if (loadingText && readyText) {
      switch (status) {
        case 'loading':
          loadingText.style.display = 'inline';
          readyText.style.display = 'none';
          break;
        case 'ready':
          loadingText.style.display = 'none';
          readyText.style.display = 'inline';
          break;
        case 'error':
          loadingText.textContent = '❌ Drag & drop failed to load';
          loadingText.style.color = 'var(--ca-red-600)';
          readyText.style.display = 'none';
          break;
      }
    }
  }

  /**
   * Setup sortable functionality with enhanced options
   */
  private setupSortable(): void {
    const fallbackContainer = document.getElementById('fallback-order');
    if (!fallbackContainer || typeof window.Sortable === 'undefined') {
      console.error('❌ Cannot setup sortable: container or library missing');
      this.updateSortableStatus('error');
      return;
    }

    try {
      new window.Sortable(fallbackContainer, {
        animation: 200,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        handle: '.ca-drag-handle',
        scroll: true,
        scrollSensitivity: 100,
        scrollSpeed: 10,
        
        onStart: (evt) => {
          console.log('🎯 Drag started from position:', evt.oldIndex);
          fallbackContainer.classList.add('sortable-drag-active');
          this.showToast('Drag to reorder LLM providers', 'info');
        },
        
        onEnd: (evt) => {
          console.log('🔄 LLM order changed:', evt.oldIndex, '->', evt.newIndex);
          fallbackContainer.classList.remove('sortable-drag-active');
          
          if (evt.oldIndex !== evt.newIndex) {
            this.updatePriorityIndicators();
            this.saveLLMFallbackOrder();
            this.showToast('LLM fallback order updated successfully!', 'success');
          }
        },
        
        onMove: (evt) => {
          // Provide visual feedback during drag
          return true;
        }
      });

      console.log('✅ LLM fallback reordering initialized successfully');
      this.updateSortableStatus('ready');
      this.updatePriorityIndicators(); // Initialize priority numbers
      
    } catch (error) {
      console.error('❌ Failed to initialize sortable:', error);
      this.updateSortableStatus('error');
      this.showToast('Failed to initialize drag & drop functionality', 'error');
    }
  }

  /**
   * Update priority indicators based on current order
   */
  private updatePriorityIndicators(): void {
    const items = document.querySelectorAll('.ca-fallback-item');
    items.forEach((item, index) => {
      const priorityIndicator = item.querySelector('.ca-priority-indicator') as HTMLElement;
      if (priorityIndicator) {
        priorityIndicator.textContent = (index + 1).toString();
        
        // Add animation effect
        priorityIndicator.style.transform = 'scale(1.2)';
        setTimeout(() => {
          priorityIndicator.style.transform = 'scale(1)';
        }, 200);
      }
    });
  }

  /**
   * Save LLM fallback order with enhanced validation
   */
  private saveLLMFallbackOrder(): void {
    try {
      const items = document.querySelectorAll('.ca-fallback-item');
      const newOrder = Array.from(items).map(item => 
        (item as HTMLElement).dataset.provider
      ).filter(Boolean);
      
      if (newOrder.length === 0) {
        console.error('❌ No valid providers found in fallback order');
        this.showToast('Error: No valid providers found', 'error');
        return;
      }
      
      console.log('💾 Saving LLM fallback order:', newOrder);
      
      // Save to storage with error handling
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ llmFallbackOrder: newOrder }, () => {
          if (chrome.runtime.lastError) {
            console.error('❌ Chrome storage error:', chrome.runtime.lastError);
            this.showToast('Failed to save configuration', 'error');
          } else {
            console.log('✅ LLM fallback order saved to Chrome storage');
          }
        });
      } else {
        localStorage.setItem('llmFallbackOrder', JSON.stringify(newOrder));
        console.log('✅ LLM fallback order saved to localStorage');
      }
      
      // Update any dependent UI elements
      this.updateProviderOrderDisplay(newOrder);
      
    } catch (error) {
      console.error('❌ Error saving LLM fallback order:', error);
      this.showToast('Failed to save fallback order', 'error');
    }
  }

  /**
   * Update provider order display in other parts of the UI
   */
  private updateProviderOrderDisplay(order: string[]): void {
    // This method can be used to update other UI elements that show the provider order
    console.log('🔄 Provider order updated:', order.map((p, i) => `${i + 1}. ${p}`).join(', '));
  }

  /**
   * Test API connections with real validation
   */
  private async testAPIConnections(): Promise<void> {
    const keys = this.getAPIKeys();
    const results = { openai: false, anthropic: false, gemini: false };
    const detailedResults: { [key: string]: { success: boolean; error?: string } } = {};
    
    this.showToast('Testing API connections...', 'info');
    
    try {
      // Test OpenAI
      if (keys.openai) {
        try {
          results.openai = await this.testOpenAIConnection(keys.openai);
          detailedResults.openai = { success: results.openai };
          if (!results.openai) {
            detailedResults.openai.error = 'Invalid API key or connection failed';
          }
        } catch (error) {
          results.openai = false;
          detailedResults.openai = { 
            success: false, 
            error: error instanceof Error ? error.message : 'Connection failed' 
          };
        }
      }
      
      // Test Anthropic
      if (keys.anthropic) {
        try {
          results.anthropic = await this.testAnthropicConnection(keys.anthropic);
          detailedResults.anthropic = { success: results.anthropic };
          if (!results.anthropic) {
            detailedResults.anthropic.error = 'Invalid API key or connection failed';
          }
        } catch (error) {
          results.anthropic = false;
          detailedResults.anthropic = { 
            success: false, 
            error: error instanceof Error ? error.message : 'Connection failed' 
          };
        }
      }
      
      // Test Gemini
      if (keys.gemini) {
        try {
          results.gemini = await this.testGeminiConnection(keys.gemini);
          detailedResults.gemini = { success: results.gemini };
          if (!results.gemini) {
            detailedResults.gemini.error = 'Invalid API key or connection failed';
          }
        } catch (error) {
          results.gemini = false;
          detailedResults.gemini = { 
            success: false, 
            error: error instanceof Error ? error.message : 'Connection failed' 
          };
        }
      }
      
      // Show detailed results
      const successCount = Object.values(results).filter(Boolean).length;
      const totalTests = Object.values(keys).filter(Boolean).length;
      
      if (totalTests === 0) {
        this.showToast('⚠️ No API keys found to test. Please enter your API keys first.', 'warning');
        return;
      }
      
      // Create detailed feedback message
      const providerNames = { openai: 'OpenAI', anthropic: 'Anthropic', gemini: 'Google Gemini' };
      const successfulProviders: string[] = [];
      const failedProviders: string[] = [];
      
      for (const [provider, result] of Object.entries(detailedResults)) {
        if (result.success) {
          successfulProviders.push(providerNames[provider as keyof typeof providerNames]);
        } else {
          failedProviders.push(
            `${providerNames[provider as keyof typeof providerNames]}: ${result.error || 'Unknown error'}`
          );
        }
      }
      
      if (successCount === totalTests) {
        // All tests passed
        this.showToast(
          `✅ All API connections successful!\n${successfulProviders.join(', ')} are working properly.`, 
          'success'
        );
      } else if (successCount > 0) {
        // Some passed, some failed
        let message = `⚠️ ${successCount}/${totalTests} API connections successful\n\n`;
        
        if (successfulProviders.length > 0) {
          message += `✅ Working: ${successfulProviders.join(', ')}\n`;
        }
        
        if (failedProviders.length > 0) {
          message += `❌ Failed: \n${failedProviders.map(f => `• ${f}`).join('\n')}`;
        }
        
        this.showToast(message, 'warning');
      } else {
        // All tests failed
        const message = `❌ All API connections failed:\n${failedProviders.map(f => `• ${f}`).join('\n')}\n\nPlease check your API keys and try again.`;
        this.showToast(message, 'error');
      }
      
      console.log('🔑 Detailed API Test Results:', detailedResults);
      
    } catch (error) {
      console.error('API testing error:', error);
      this.showToast('❌ API testing failed. Check console for details.', 'error');
    }
  }

  /**
   * Test OpenAI connection
   */
  private async testOpenAIConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      
      if (response.ok) {
        return true;
      } else if (response.status === 401) {
        throw new Error('Invalid OpenAI API key');
      } else if (response.status === 429) {
        throw new Error('OpenAI API rate limit exceeded');
      } else if (response.status >= 500) {
        throw new Error('OpenAI server error');
      } else {
        throw new Error(`OpenAI API error (${response.status})`);
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network connection failed - check your internet connection');
      }
      throw error;
    }
  }

  /**
   * Test Anthropic connection
   */
  private async testAnthropicConnection(apiKey: string): Promise<boolean> {
    try {
      // Anthropic requires a POST request to /v1/messages with a minimal valid payload
      // Also requires the special CORS header for browser-based requests
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }]
        })
      });
      
      // For Anthropic, we check for specific status codes:
      // - 200: Success (API key valid and request successful)
      // - 400: Bad request but API key is valid (expected for minimal requests)
      // - 401: Invalid API key (this is what we want to catch)
      // - 403: Forbidden (API key valid but lacks permissions)
      // - 429: Rate limited (API key valid but rate limited)
      // - 5xx: Server error (API key likely valid, server issue)
      
      if (response.status >= 200 && response.status < 300) {
        // Success response - API key is definitely valid
        return true;
      } else if (response.status === 400) {
        // Bad request - usually means API key is valid but request format issue
        // For our minimal test, this often happens and indicates the key works
        return true;
      } else if (response.status === 401) {
        // Unauthorized - invalid API key
        throw new Error('Invalid Anthropic API key');
      } else if (response.status === 403) {
        // Forbidden - API key valid but lacks permissions
        throw new Error('Anthropic API key lacks required permissions');
      } else if (response.status === 429) {
        // Rate limited - API key is valid but rate limited
        throw new Error('Anthropic API rate limit exceeded');
      } else if (response.status >= 500) {
        // Server error - API key likely valid, server issue
        throw new Error('Anthropic server error');
      } else {
        // Other error codes
        throw new Error(`Anthropic API error (${response.status})`);
      }
    } catch (error) {
      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network connection failed - check your internet connection');
      }
      // If it's already our custom error, re-throw it
      if (error instanceof Error) {
        throw error;
      }
      // Fallback for unknown errors
      throw new Error('Unknown error occurred while testing Anthropic API');
    }
  }

  /**
   * Test Gemini connection
   */
  private async testGeminiConnection(apiKey: string): Promise<boolean> {
    try {
      // Validate API key format
      if (!apiKey.startsWith('AIza')) {
        throw new Error('Invalid Google Gemini API key format - should start with "AIza"');
      }
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      
      if (response.ok) {
        // Verify we actually get model data
        const data = await response.json();
        if (data.models && data.models.length > 0) {
          return true;
        } else {
          throw new Error('No models available with this Google Gemini API key');
        }
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error?.message || 'Invalid request format';
        throw new Error(`Google Gemini API error: ${errorMessage}`);
      } else if (response.status === 403) {
        throw new Error('Google Gemini API access forbidden - check your API key permissions and billing');
      } else if (response.status === 429) {
        throw new Error('Google Gemini API rate limit exceeded');
      } else if (response.status >= 500) {
        throw new Error('Google Gemini server error');
      } else {
        throw new Error(`Google Gemini API error (${response.status})`);
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network connection failed - check your internet connection');
      }
      throw error;
    }
  }

  /**
   * Get API keys from form
   */
  private getAPIKeys(): { openai: string; anthropic: string; gemini: string } {
    const openaiInput = document.getElementById('openai-key') as HTMLInputElement;
    const anthropicInput = document.getElementById('anthropic-key') as HTMLInputElement;
    const geminiInput = document.getElementById('gemini-key') as HTMLInputElement;

    return {
      openai: openaiInput?.value || '',
      anthropic: anthropicInput?.value || '',
      gemini: geminiInput?.value || ''
    };
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private collectApiKeys(): Record<string, string> {
    const apiKeys: Record<string, string> = {};
    
    const openaiKey = (document.getElementById('openai-key') as HTMLInputElement)?.value;
    const anthropicKey = (document.getElementById('anthropic-key') as HTMLInputElement)?.value;
    const geminiKey = (document.getElementById('gemini-key') as HTMLInputElement)?.value;
    
    if (openaiKey) apiKeys.openai = openaiKey;
    if (anthropicKey) apiKeys.anthropic = anthropicKey;
    if (geminiKey) apiKeys.gemini = geminiKey;
    
    return apiKeys;
  }

  private collectContextData(): Record<string, any> {
    const jobDescription = (document.getElementById('job-description') as HTMLTextAreaElement)?.value;
    
    return {
      jobDescription: jobDescription || '',
      uploadedAt: new Date().toISOString(),
    };
  }

  private collectLlmConfig(): Record<string, any> {
    const preferredProvider = (document.getElementById('preferred-provider') as HTMLSelectElement)?.value;
    
    return {
      preferredProvider: preferredProvider || 'openai',
      updatedAt: new Date().toISOString(),
    };
  }

  private collectTranscriptionSettings(): Record<string, any> {
    const language = (document.getElementById('transcription-language') as HTMLSelectElement)?.value;
    const threshold = (document.getElementById('silence-threshold') as HTMLInputElement)?.value;
    const duration = (document.getElementById('silence-duration') as HTMLInputElement)?.value;
    
    return {
      language: language || 'en-US',
      silenceThreshold: parseFloat(threshold) || 0.01,
      silenceDuration: parseInt(duration) || 1500,
    };
  }

  private collectResponseStyle(): Record<string, any> {
    const tone = (document.getElementById('response-tone') as HTMLSelectElement)?.value;
    const length = (document.getElementById('response-length') as HTMLSelectElement)?.value;
    const formality = (document.getElementById('formality-level') as HTMLInputElement)?.value;
    
    return {
      tone: tone || 'professional',
      length: length || 'medium',
      formality: parseInt(formality) || 7,
    };
  }

  private collectLanguageSettings(): Record<string, any> {
    const interfaceLanguage = (document.getElementById('ui-language') as HTMLSelectElement)?.value;
    const aiLanguage = (document.getElementById('response-language') as HTMLSelectElement)?.value;
    const dateFormat = (document.getElementById('date-format') as HTMLSelectElement)?.value;
    const timeFormat = (document.getElementById('time-format') as HTMLSelectElement)?.value;
    
    return {
      interface: interfaceLanguage || 'English',
      aiResponse: aiLanguage || 'English',
      dateFormat: dateFormat || 'MM/DD/YYYY',
      timeFormat: timeFormat || '12-hour',
    };
  }

  private populateApiKeys(apiKeys: Record<string, string>): void {
    const openaiInput = document.getElementById('openai-key') as HTMLInputElement;
    const anthropicInput = document.getElementById('anthropic-key') as HTMLInputElement;
    const geminiInput = document.getElementById('gemini-key') as HTMLInputElement;
    
    if (openaiInput && apiKeys.openai) openaiInput.value = apiKeys.openai;
    if (anthropicInput && apiKeys.anthropic) anthropicInput.value = apiKeys.anthropic;
    if (geminiInput && apiKeys.gemini) geminiInput.value = apiKeys.gemini;
  }

  private populateLlmConfig(config: Record<string, any>): void {
    const providerSelect = document.getElementById('preferred-provider') as HTMLSelectElement;
    if (providerSelect && config.preferredProvider) {
      providerSelect.value = config.preferredProvider;
    }
  }

  private populateTranscriptionSettings(settings: Record<string, any>): void {
    const languageSelect = document.getElementById('transcription-language') as HTMLSelectElement;
    const thresholdInput = document.getElementById('silence-threshold') as HTMLInputElement;
    const durationInput = document.getElementById('silence-duration') as HTMLInputElement;
    
    if (languageSelect && settings.language) languageSelect.value = settings.language;
    if (thresholdInput && settings.silenceThreshold) thresholdInput.value = settings.silenceThreshold.toString();
    if (durationInput && settings.silenceDuration) durationInput.value = settings.silenceDuration.toString();
  }

  private populateResponseStyle(style: Record<string, any>): void {
    const toneSelect = document.getElementById('response-tone') as HTMLSelectElement;
    const lengthSelect = document.getElementById('response-length') as HTMLSelectElement;
    const formalityInput = document.getElementById('formality-level') as HTMLInputElement;
    
    if (toneSelect && style.tone) toneSelect.value = style.tone;
    if (lengthSelect && style.length) lengthSelect.value = style.length;
    if (formalityInput && style.formality) formalityInput.value = style.formality.toString();
  }

  private populateLanguageSettings(settings: Record<string, any>): void {
    const interfaceSelect = document.getElementById('ui-language') as HTMLSelectElement;
    const aiSelect = document.getElementById('response-language') as HTMLSelectElement;
    const dateSelect = document.getElementById('date-format') as HTMLSelectElement;
    const timeSelect = document.getElementById('time-format') as HTMLSelectElement;
    
    if (interfaceSelect && settings.interface) interfaceSelect.value = settings.interface;
    if (aiSelect && settings.aiResponse) aiSelect.value = settings.aiResponse;
    if (dateSelect && settings.dateFormat) dateSelect.value = settings.dateFormat;
    if (timeSelect && settings.timeFormat) timeSelect.value = settings.timeFormat;
  }

  private generateStylePreview(style: Record<string, any>): string {
    return `
      <div class="preview-card">
        <h4>Preview Response</h4>
        <p>This is how your AI responses will look with the selected style settings.</p>
        <p><strong>Tone:</strong> ${style.tone || 'professional'}</p>
        <p><strong>Length:</strong> ${style.length || 'medium'}</p>
        <p><strong>Formality:</strong> ${style.formality || 7}/10</p>
      </div>
    `;
  }

  private updateLoadingState(isLoading: boolean): void {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.disabled = isLoading;
    });
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  private showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    console.log(`🍞 TOAST ${type.toUpperCase()}: ${message}`);
    
    // Convert newlines to HTML breaks for better display
    const formattedMessage = message.replace(/\n/g, '<br>');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <div class="toast__content">
        <div class="toast__message">${formattedMessage}</div>
        <button class="toast__close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    // Add styles if not present
    if (!document.querySelector('#toast-styles')) {
      const styles = document.createElement('style');
      styles.id = 'toast-styles';
      styles.textContent = `
        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          min-width: 350px;
          max-width: 500px;
          animation: slideIn 0.3s ease;
        }
        .toast--success { border-left: 4px solid #10b981; }
        .toast--error { border-left: 4px solid #ef4444; }
        .toast--warning { border-left: 4px solid #f59e0b; }
        .toast--info { border-left: 4px solid #3b82f6; }
        .toast__content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px;
        }
        .toast__message { 
          flex: 1; 
          font-size: 14px; 
          line-height: 1.5;
          word-wrap: break-word;
          white-space: pre-wrap;
        }
        .toast__close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #666;
          margin-left: 12px;
          align-self: flex-start;
          margin-top: -2px;
        }
        .toast__close:hover {
          color: #333;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }
    
    // Add to page
    document.body.appendChild(toast);
    
    // Remove after 8 seconds for longer messages, 5 seconds for shorter ones
    const duration = message.length > 100 ? 8000 : 5000;
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, duration);
  }

  /**
   * Initialize the options page
   */
  public initialize(): void {
    console.log('CandidAI Options page initialized');
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const controller = new OptionsController();
    controller.initialize();
  });
} else {
  const controller = new OptionsController();
  controller.initialize();
} 
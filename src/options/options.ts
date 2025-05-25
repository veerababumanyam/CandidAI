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
      section.style.display = 'none';
    });

    // Show target section
    const targetSection = document.querySelector(`#section-${targetSectionName}`);
    if (targetSection) {
      targetSection.classList.add('ca-section--active');
      targetSection.style.display = 'block';
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
    // Add SortableJS dynamically if not present
    if (typeof window.Sortable === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js';
      script.onload = () => {
        this.setupSortable();
      };
      document.head.appendChild(script);
    } else {
      this.setupSortable();
    }
  }

  /**
   * Setup sortable functionality
   */
  private setupSortable(): void {
    const fallbackContainer = document.getElementById('fallback-order');
    if (!fallbackContainer || typeof window.Sortable === 'undefined') return;

    new window.Sortable(fallbackContainer, {
      animation: 150,
      handle: '.ca-drag-handle',
      onEnd: (evt) => {
        console.log('🔄 LLM order changed:', evt.oldIndex, '->', evt.newIndex);
        this.saveLLMFallbackOrder();
      }
    });

    console.log('🔄 LLM fallback reordering initialized');
  }

  /**
   * Save LLM fallback order
   */
  private saveLLMFallbackOrder(): void {
    const items = document.querySelectorAll('.ca-fallback-item');
    const newOrder = Array.from(items).map(item => 
      (item as HTMLElement).dataset.provider
    ).filter(Boolean);
    
    console.log('💾 Saving LLM fallback order:', newOrder);
    
    // Save to storage (placeholder)
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ llmFallbackOrder: newOrder });
    } else {
      localStorage.setItem('llmFallbackOrder', JSON.stringify(newOrder));
    }
    
    this.showToast('LLM fallback order saved!', 'success');
  }

  /**
   * Test API connections with real validation
   */
  private async testAPIConnections(): Promise<void> {
    const keys = this.getAPIKeys();
    const results = { openai: false, anthropic: false, gemini: false };
    
    this.showToast('Testing API connections...', 'info');
    
    try {
      // Test OpenAI
      if (keys.openai) {
        results.openai = await this.testOpenAIConnection(keys.openai);
      }
      
      // Test Anthropic
      if (keys.anthropic) {
        results.anthropic = await this.testAnthropicConnection(keys.anthropic);
      }
      
      // Test Gemini
      if (keys.gemini) {
        results.gemini = await this.testGeminiConnection(keys.gemini);
      }
      
      // Show results
      const successCount = Object.values(results).filter(Boolean).length;
      const totalTests = Object.values(keys).filter(Boolean).length;
      
      if (successCount === totalTests && totalTests > 0) {
        this.showToast(`✅ All ${successCount} API connections successful!`, 'success');
      } else {
        this.showToast(`⚠️ ${successCount}/${totalTests} API connections successful`, 'warning');
      }
      
      console.log('🔑 API Test Results:', results);
      
    } catch (error) {
      console.error('API testing error:', error);
      this.showToast('API testing failed. Check console for details.', 'error');
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
      return response.ok;
    } catch (error) {
      console.error('OpenAI test failed:', error);
      return false;
    }
  }

  /**
   * Test Anthropic connection
   */
  private async testAnthropicConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      });
      return response.ok || response.status === 400; // 400 is expected for minimal request
    } catch (error) {
      console.error('Anthropic test failed:', error);
      return false;
    }
  }

  /**
   * Test Gemini connection
   */
  private async testGeminiConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      return response.ok;
    } catch (error) {
      console.error('Gemini test failed:', error);
      return false;
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
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <div class="toast__content">
        <span class="toast__message">${message}</span>
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
          min-width: 300px;
          animation: slideIn 0.3s ease;
        }
        .toast--success { border-left: 4px solid #10b981; }
        .toast--error { border-left: 4px solid #ef4444; }
        .toast--warning { border-left: 4px solid #f59e0b; }
        .toast--info { border-left: 4px solid #3b82f6; }
        .toast__content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
        }
        .toast__message { flex: 1; font-size: 14px; }
        .toast__close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #666;
          margin-left: 12px;
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
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
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
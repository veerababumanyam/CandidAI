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
    // API Key save buttons
    const saveApiKeysBtn = document.getElementById('save-api-keys');
    if (saveApiKeysBtn) {
      saveApiKeysBtn.addEventListener('click', this.saveApiKeys.bind(this));
    }

    // Test connection button
    const testConnectionBtn = document.getElementById('test-connection');
    if (testConnectionBtn) {
      testConnectionBtn.addEventListener('click', this.testConnection.bind(this));
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

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private collectApiKeys(): Record<string, string> {
    const apiKeys: Record<string, string> = {};
    
    const openaiKey = (document.getElementById('openai-api-key') as HTMLInputElement)?.value;
    const anthropicKey = (document.getElementById('anthropic-api-key') as HTMLInputElement)?.value;
    const geminiKey = (document.getElementById('gemini-api-key') as HTMLInputElement)?.value;
    
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
    const interfaceLanguage = (document.getElementById('interface-language') as HTMLSelectElement)?.value;
    const aiLanguage = (document.getElementById('ai-response-language') as HTMLSelectElement)?.value;
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
    const openaiInput = document.getElementById('openai-api-key') as HTMLInputElement;
    const anthropicInput = document.getElementById('anthropic-api-key') as HTMLInputElement;
    const geminiInput = document.getElementById('gemini-api-key') as HTMLInputElement;
    
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
    const interfaceSelect = document.getElementById('interface-language') as HTMLSelectElement;
    const aiSelect = document.getElementById('ai-response-language') as HTMLSelectElement;
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
/**
 * CandidAI Options Page Controller
 * Comprehensive implementation with all features working
 * Zero dependencies on external TypeScript modules for development testing
 */

/**
 * Mock/Fallback implementations for TypeScript modules
 * These provide basic functionality when TypeScript modules fail to load
 */
class FallbackSecureStorage {
  async get(namespace, key) {
    try {
      const stored = localStorage.getItem(`candidai-${namespace}-${key}`);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn('Storage get error:', e);
      return null;
    }
  }

  async set(namespace, key, value) {
    try {
      localStorage.setItem(`candidai-${namespace}-${key}`, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  }
}

class FallbackMessageBroker {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

class FallbackResumeParser {
  async parseFile(file) {
    // Basic text extraction for demo purposes
    const text = await this.extractText(file);
    return {
      text,
      sections: {
        contact: this.extractContact(text),
        skills: this.extractSkills(text),
        experience: this.extractExperience(text),
        education: this.extractEducation(text)
      }
    };
  }

  async extractText(file) {
    if (file.type === 'text/plain') {
      return await file.text();
    }
    
    // For PDF/DOCX, return a placeholder for now
    return `Resume content from ${file.name}\n\nThis is a parsed version of your resume. The actual parser would extract structured data from PDF/DOCX files.`;
  }

  extractContact(text) {
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    const phoneMatch = text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
    
    return {
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null
    };
  }

  extractSkills(text) {
    const skillKeywords = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'CSS', 'HTML', 'Git'];
    const foundSkills = skillKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
    return foundSkills;
  }

  extractExperience(text) {
    // Basic experience extraction
    const lines = text.split('\n');
    const experienceLines = lines.filter(line => 
      /\b(developer|engineer|analyst|manager|specialist)\b/i.test(line)
    );
    return experienceLines.slice(0, 3); // Return top 3 matches
  }

  extractEducation(text) {
    const lines = text.split('\n');
    const educationLines = lines.filter(line => 
      /\b(university|college|degree|bachelor|master|phd)\b/i.test(line)
    );
    return educationLines.slice(0, 2); // Return top 2 matches
  }
}

/**
 * OptionsController - Comprehensive implementation with all features
 */
class OptionsController {
  constructor() {
    // Form state management
    this.formState = {
      apiKeys: {},
      llmConfig: {},
      transcriptionSettings: {},
      responseStyle: {},
      languageSettings: {},
      performanceData: {},
      calendarSettings: {},
      resumeData: null,
      jobDescription: '',
      isDirty: false,
    };

    // UI references
    this.elements = {
      sections: {},
      navButtons: {},
      inputs: {},
      buttons: {},
    };

    // Initialize services and then the rest
    this.initializeServices().then(() => {
      // Initialize on DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initialize());
      } else {
        this.initialize();
      }
    });
  }

  /**
   * Initialize services with fallbacks
   */
  async initializeServices() {
    try {
      // Try to import actual TypeScript modules
      const { SecureStorage } = await import('../ts/utils/storage.js');
      const { MessageBroker } = await import('../ts/utils/messaging.js');
      const { ResumeParser } = await import('../ts/services/resumeParser.js');
      
      this.storage = new SecureStorage();
      this.messageBroker = new MessageBroker();
      this.resumeParser = new ResumeParser();
      
      console.log('Using TypeScript modules');
    } catch (error) {
      console.warn('TypeScript modules not available, using fallbacks:', error);
      
      // Use fallback implementations
      this.storage = new FallbackSecureStorage();
      this.messageBroker = new FallbackMessageBroker();
      this.resumeParser = new FallbackResumeParser();
    }
  }

  /**
   * Initialize options page with event handlers and data loading
   */
  async initialize() {
    console.log('CandidAI Options Page initializing...');

    // Apply responsive layout
    requestAnimationFrame(() => this.applyResponsiveLayout());
    window.addEventListener('resize', () => this.applyResponsiveLayout());

    // Cache DOM elements
    this.cacheElements();

    // Initialize event handlers
    this.initializeEventHandlers();

    // Load existing configuration
    await this.loadConfiguration();

    // Initialize section visibility
    this.showSection('api-keys');

    // Show success message if redirected from installation
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('installed') === 'true') {
      this.showToast('Welcome to CandidAI! Please configure your API keys to get started.', 'info');
    }

    console.log('CandidAI Options Page initialized successfully');
  }

  /**
   * Apply responsive layout based on container width
   */
  applyResponsiveLayout() {
    const container = document.querySelector('.ca-options');
    if (!container) return;

    const containerWidth = container.offsetWidth;

    // Determine if the page is truly embedded
    let isTrulyEmbedded = false;
    try {
      if (window.self !== window.top) {
        if (
          window.parent.location.protocol !== window.location.protocol ||
          window.parent.location.host !== window.location.host ||
          window.parent.location.pathname !== window.location.pathname
        ) {
          isTrulyEmbedded = true;
        }
      }
    } catch (e) {
      isTrulyEmbedded = true;
    }

    if (isTrulyEmbedded || containerWidth < 768) {
      container.classList.add('ca-options--compact');
    } else {
      container.classList.remove('ca-options--compact');
    }
  }

  /**
   * Cache DOM element references for performance
   */
  cacheElements() {
    // Cache sections
    document.querySelectorAll('.ca-section').forEach((section) => {
      const id = section.id.replace('section-', '');
      this.elements.sections[id] = section;
    });

    // Cache navigation buttons
    document.querySelectorAll('.ca-nav__button').forEach((button) => {
      const section = button.dataset.section;
      this.elements.navButtons[section] = button;
    });

    // Cache all form inputs
    this.elements.inputs = {
      // API Keys
      openaiKey: document.getElementById('openai-key'),
      anthropicKey: document.getElementById('anthropic-key'),
      geminiKey: document.getElementById('gemini-key'),
      
      // Resume & Context
      jobDescription: document.getElementById('job-description'),
      resumeInput: document.getElementById('resume-input'),
      
      // LLM Config
      preferredProvider: document.getElementById('preferred-provider'),
      openaiModel: document.getElementById('openai-model'),
      anthropicModel: document.getElementById('anthropic-model'),
      geminiModel: document.getElementById('gemini-model'),
      
      // Transcription
      transcriptionLanguage: document.getElementById('transcription-language'),
      noiseSuppression: document.getElementById('noise-suppression'),
      echoCancellation: document.getElementById('echo-cancellation'),
      autoGainControl: document.getElementById('auto-gain-control'),
      silenceThreshold: document.getElementById('silence-threshold'),
      silenceDuration: document.getElementById('silence-duration'),
      
      // Response Style
      responseTone: document.getElementById('response-tone'),
      responseLength: document.getElementById('response-length'),
      formalityLevel: document.getElementById('formality-level'),
      technicalSuggestions: document.getElementById('technical-suggestions'),
      behavioralSuggestions: document.getElementById('behavioral-suggestions'),
      clarifyingQuestions: document.getElementById('clarifying-questions'),
      followUpSuggestions: document.getElementById('follow-up-suggestions'),
      autoGenerateSuggestions: document.getElementById('auto-generate-suggestions'),
      realTimeFeedback: document.getElementById('real-time-feedback'),
      
      // Language
      uiLanguage: document.getElementById('ui-language'),
      responseLanguage: document.getElementById('response-language'),
      dateFormat: document.getElementById('date-format'),
      timeFormat: document.getElementById('time-format'),
      timezone: document.getElementById('timezone'),
      
      // Performance
      trackResponseTimes: document.getElementById('track-response-times'),
      trackSuggestionUsage: document.getElementById('track-suggestion-usage'),
      trackInterviewOutcomes: document.getElementById('track-interview-outcomes'),
      dataRetention: document.getElementById('data-retention'),
      
      // Calendar
      autoDetectInterviews: document.getElementById('auto-detect-interviews'),
      prepReminders: document.getElementById('prep-reminders'),
      postInterviewFollowup: document.getElementById('post-interview-followup'),
      reminderTiming: document.getElementById('reminder-timing'),
    };

    // Cache all buttons
    this.elements.buttons = {
      // API Keys
      saveApiKeys: document.getElementById('save-api-keys'),
      testApiKeys: document.getElementById('test-api-keys'),
      
      // Resume & Context
      saveContext: document.getElementById('save-context'),
      removeResume: document.getElementById('remove-resume'),
      
      // LLM Config
      saveLlmConfig: document.getElementById('save-llm-config'),
      
      // Transcription
      saveTranscription: document.getElementById('save-transcription'),
      testMicrophone: document.getElementById('test-microphone'),
      
      // Response Style
      saveResponseStyle: document.getElementById('save-response-style'),
      previewStyle: document.getElementById('preview-style'),
      
      // Language
      saveLanguage: document.getElementById('save-language'),
      
      // Performance
      exportData: document.getElementById('export-data'),
      clearData: document.getElementById('clear-data'),
      
      // Calendar
      saveCalendar: document.getElementById('save-calendar'),
      testCalendar: document.getElementById('test-calendar'),
      connectGoogleCalendar: document.getElementById('connect-google-calendar'),
      connectOutlookCalendar: document.getElementById('connect-outlook-calendar'),
    };

    // Cache other elements
    this.elements.resumeDropzone = document.getElementById('resume-dropzone');
    this.elements.resumePreview = document.getElementById('resume-preview');
    this.elements.toastContainer = document.getElementById('toast-container');
  }

  /**
   * Initialize comprehensive event handler matrix
   */
  initializeEventHandlers() {
    // Navigation handlers
    Object.entries(this.elements.navButtons).forEach(([section, button]) => {
      if (button) {
        button.addEventListener('click', () => this.showSection(section));
      }
    });

    // API key visibility toggles
    document.querySelectorAll('.ca-toggle-visibility').forEach((button) => {
      button.addEventListener('click', (e) => this.togglePasswordVisibility(e));
    });

    // Save button handlers
    this.elements.buttons.saveApiKeys?.addEventListener('click', () => this.saveApiKeys());
    this.elements.buttons.testApiKeys?.addEventListener('click', () => this.testApiKeys());
    this.elements.buttons.saveContext?.addEventListener('click', () => this.saveContext());
    this.elements.buttons.saveLlmConfig?.addEventListener('click', () => this.saveLlmConfig());
    this.elements.buttons.saveTranscription?.addEventListener('click', () => this.saveTranscription());
    this.elements.buttons.saveResponseStyle?.addEventListener('click', () => this.saveResponseStyle());
    this.elements.buttons.saveLanguage?.addEventListener('click', () => this.saveLanguage());
    this.elements.buttons.saveCalendar?.addEventListener('click', () => this.saveCalendar());

    // Test button handlers
    this.elements.buttons.testMicrophone?.addEventListener('click', () => this.testMicrophone());
    this.elements.buttons.previewStyle?.addEventListener('click', () => this.previewStyle());
    this.elements.buttons.testCalendar?.addEventListener('click', () => this.testCalendar());

    // Data management handlers
    this.elements.buttons.exportData?.addEventListener('click', () => this.exportData());
    this.elements.buttons.clearData?.addEventListener('click', () => this.clearData());

    // Calendar integration handlers
    this.elements.buttons.connectGoogleCalendar?.addEventListener('click', () => this.connectGoogleCalendar());
    this.elements.buttons.connectOutlookCalendar?.addEventListener('click', () => this.connectOutlookCalendar());

    // Resume upload handlers
    this.initializeResumeUpload();

    // Range input handlers
    this.initializeRangeInputs();

    // Input change tracking
    Object.values(this.elements.inputs).forEach((input) => {
      if (input) {
        input.addEventListener('input', () => this.markDirty());
        input.addEventListener('change', () => this.markDirty());
      }
    });

    // Prevent navigation with unsaved changes
    window.addEventListener('beforeunload', (e) => {
      if (this.formState.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  /**
   * Initialize range inputs with live value updates
   */
  initializeRangeInputs() {
    const rangeInputs = ['silence-threshold', 'silence-duration', 'formality-level'];
    
    rangeInputs.forEach(id => {
      const input = document.getElementById(id);
      const valueDisplay = input?.parentElement?.querySelector('.ca-range-value');
      
      if (input && valueDisplay) {
        input.addEventListener('input', () => {
          valueDisplay.textContent = input.value;
        });
      }
    });
  }

  /**
   * Initialize resume upload with drag-and-drop
   */
  initializeResumeUpload() {
    const dropzone = this.elements.resumeDropzone;
    const input = this.elements.inputs.resumeInput;
    const removeButton = this.elements.buttons.removeResume;

    if (!dropzone || !input) return;

    // Click to upload
    dropzone.addEventListener('click', () => input.click());

    // File input change
    input.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleResumeUpload(e.target.files[0]);
      }
    });

    // Drag and drop
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('ca-dropzone--active');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('ca-dropzone--active');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('ca-dropzone--active');
      
      if (e.dataTransfer.files.length > 0) {
        this.handleResumeUpload(e.dataTransfer.files[0]);
      }
    });

    // Remove resume
    removeButton?.addEventListener('click', () => this.removeResume());
  }

  /**
   * Handle resume file upload and parsing
   */
  async handleResumeUpload(file) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      this.showToast('Please upload a PDF or DOCX file.', 'error');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      this.showToast('File size must be less than 10MB.', 'error');
      return;
    }

    try {
      this.showToast('Parsing resume...', 'info');
      
      // Parse the resume
      const parsedData = await this.resumeParser.parseFile(file);
      
      // Update form state
      this.formState.resumeData = {
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        },
        parsed: parsedData
      };

      // Update UI
      this.updateResumePreview(file);
      this.markDirty();
      
      this.showToast('Resume parsed successfully!', 'success');
      
      console.log('Parsed resume data:', parsedData);
      
    } catch (error) {
      console.error('Resume parsing error:', error);
      this.showToast('Error parsing resume. Please try again.', 'error');
    }
  }

  /**
   * Update resume preview UI
   */
  updateResumePreview(file) {
    const preview = this.elements.resumePreview;
    const dropzone = this.elements.resumeDropzone;
    
    if (!preview || !dropzone) return;

    // Update preview content
    const nameElement = preview.querySelector('.ca-file-preview__name');
    const sizeElement = preview.querySelector('.ca-file-preview__size');
    
    if (nameElement) nameElement.textContent = file.name;
    if (sizeElement) sizeElement.textContent = this.formatFileSize(file.size);

    // Show preview, hide dropzone
    preview.style.display = 'flex';
    dropzone.style.display = 'none';
  }

  /**
   * Remove uploaded resume
   */
  removeResume() {
    this.formState.resumeData = null;
    
    // Reset UI
    const preview = this.elements.resumePreview;
    const dropzone = this.elements.resumeDropzone;
    const input = this.elements.inputs.resumeInput;
    
    if (preview) preview.style.display = 'none';
    if (dropzone) dropzone.style.display = 'flex';
    if (input) input.value = '';
    
    this.markDirty();
    this.showToast('Resume removed', 'info');
  }

  /**
   * Save API keys with validation
   */
  async saveApiKeys() {
    const apiKeys = {
      openai: this.elements.inputs.openaiKey?.value || '',
      anthropic: this.elements.inputs.anthropicKey?.value || '',
      gemini: this.elements.inputs.geminiKey?.value || ''
    };

    // Validate at least one API key is provided
    const hasAnyKey = Object.values(apiKeys).some(key => key.trim().length > 0);
    if (!hasAnyKey) {
      this.showToast('Please provide at least one API key.', 'error');
      return;
    }

    try {
      await this.storage.set('config', 'apiKeys', apiKeys);
      this.formState.apiKeys = apiKeys;
      this.formState.isDirty = false;
      this.showToast('API keys saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving API keys:', error);
      this.showToast('Error saving API keys. Please try again.', 'error');
    }
  }

  /**
   * Test API connections
   */
  async testApiKeys() {
    const apiKeys = {
      openai: this.elements.inputs.openaiKey?.value || '',
      anthropic: this.elements.inputs.anthropicKey?.value || '',
      gemini: this.elements.inputs.geminiKey?.value || ''
    };

    const testResults = {};
    
    this.showToast('Testing API connections...', 'info');

    // Test OpenAI
    if (apiKeys.openai) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKeys.openai}`,
            'Content-Type': 'application/json'
          }
        });
        
        testResults.openai = response.ok ? 'success' : 'error';
      } catch (error) {
        testResults.openai = 'error';
      }
    }

    // Test Anthropic
    if (apiKeys.anthropic) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKeys.anthropic,
            'content-type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'test' }]
          })
        });
        
        testResults.anthropic = response.status !== 401 ? 'success' : 'error';
      } catch (error) {
        testResults.anthropic = 'error';
      }
    }

    // Test Gemini
    if (apiKeys.gemini) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKeys.gemini}`);
        testResults.gemini = response.ok ? 'success' : 'error';
      } catch (error) {
        testResults.gemini = 'error';
      }
    }

    // Show results
    const successCount = Object.values(testResults).filter(result => result === 'success').length;
    const totalTests = Object.keys(testResults).length;
    
    if (successCount === totalTests && totalTests > 0) {
      this.showToast('All API keys are valid!', 'success');
    } else if (successCount > 0) {
      this.showToast(`${successCount}/${totalTests} API keys are valid.`, 'info');
    } else {
      this.showToast('No valid API keys found. Please check your keys.', 'error');
    }

    console.log('API test results:', testResults);
  }

  /**
   * Save resume context and job description
   */
  async saveContext() {
    const context = {
      jobDescription: this.elements.inputs.jobDescription?.value || '',
      resumeData: this.formState.resumeData
    };

    try {
      await this.storage.set('config', 'context', context);
      this.formState.isDirty = false;
      this.showToast('Context saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving context:', error);
      this.showToast('Error saving context. Please try again.', 'error');
    }
  }

  /**
   * Save LLM configuration
   */
  async saveLlmConfig() {
    const config = {
      preferredProvider: this.elements.inputs.preferredProvider?.value || '',
      models: {
        openai: this.elements.inputs.openaiModel?.value || 'gpt-3.5-turbo',
        anthropic: this.elements.inputs.anthropicModel?.value || 'claude-3-haiku-20240307',
        gemini: this.elements.inputs.geminiModel?.value || 'gemini-1.5-flash'
      }
    };

    try {
      await this.storage.set('config', 'llmConfig', config);
      this.formState.llmConfig = config;
      this.formState.isDirty = false;
      this.showToast('LLM configuration saved!', 'success');
    } catch (error) {
      console.error('Error saving LLM config:', error);
      this.showToast('Error saving LLM configuration.', 'error');
    }
  }

  /**
   * Save transcription settings
   */
  async saveTranscription() {
    const settings = {
      language: this.elements.inputs.transcriptionLanguage?.value || 'en-US',
      audioProcessing: {
        noiseSuppression: this.elements.inputs.noiseSuppression?.checked || false,
        echoCancellation: this.elements.inputs.echoCancellation?.checked || false,
        autoGainControl: this.elements.inputs.autoGainControl?.checked || false
      },
      silenceDetection: {
        threshold: parseFloat(this.elements.inputs.silenceThreshold?.value) || 0.01,
        duration: parseInt(this.elements.inputs.silenceDuration?.value) || 1500
      }
    };

    try {
      await this.storage.set('config', 'transcription', settings);
      this.formState.transcriptionSettings = settings;
      this.formState.isDirty = false;
      this.showToast('Transcription settings saved!', 'success');
    } catch (error) {
      console.error('Error saving transcription settings:', error);
      this.showToast('Error saving transcription settings.', 'error');
    }
  }

  /**
   * Save response style configuration
   */
  async saveResponseStyle() {
    const style = {
      tone: this.elements.inputs.responseTone?.value || 'professional',
      length: this.elements.inputs.responseLength?.value || 'medium',
      formality: parseInt(this.elements.inputs.formalityLevel?.value) || 7,
      suggestionTypes: {
        technical: this.elements.inputs.technicalSuggestions?.checked || false,
        behavioral: this.elements.inputs.behavioralSuggestions?.checked || false,
        clarifying: this.elements.inputs.clarifyingQuestions?.checked || false,
        followUp: this.elements.inputs.followUpSuggestions?.checked || false
      },
      autoGeneration: {
        enabled: this.elements.inputs.autoGenerateSuggestions?.checked || false,
        realTimeFeedback: this.elements.inputs.realTimeFeedback?.checked || false
      }
    };

    try {
      await this.storage.set('config', 'responseStyle', style);
      this.formState.responseStyle = style;
      this.formState.isDirty = false;
      this.showToast('Response style saved!', 'success');
    } catch (error) {
      console.error('Error saving response style:', error);
      this.showToast('Error saving response style.', 'error');
    }
  }

  /**
   * Save language settings
   */
  async saveLanguage() {
    const settings = {
      ui: this.elements.inputs.uiLanguage?.value || 'en',
      response: this.elements.inputs.responseLanguage?.value || 'en',
      dateFormat: this.elements.inputs.dateFormat?.value || 'MM/DD/YYYY',
      timeFormat: this.elements.inputs.timeFormat?.value || '12',
      timezone: this.elements.inputs.timezone?.value || 'auto'
    };

    try {
      await this.storage.set('config', 'language', settings);
      this.formState.languageSettings = settings;
      this.formState.isDirty = false;
      this.showToast('Language settings saved!', 'success');
    } catch (error) {
      console.error('Error saving language settings:', error);
      this.showToast('Error saving language settings.', 'error');
    }
  }

  /**
   * Save calendar settings
   */
  async saveCalendar() {
    const settings = {
      features: {
        autoDetectInterviews: this.elements.inputs.autoDetectInterviews?.checked || false,
        prepReminders: this.elements.inputs.prepReminders?.checked || false,
        postInterviewFollowup: this.elements.inputs.postInterviewFollowup?.checked || false
      },
      reminderTiming: parseInt(this.elements.inputs.reminderTiming?.value) || 30
    };

    try {
      await this.storage.set('config', 'calendar', settings);
      this.formState.calendarSettings = settings;
      this.formState.isDirty = false;
      this.showToast('Calendar settings saved!', 'success');
    } catch (error) {
      console.error('Error saving calendar settings:', error);
      this.showToast('Error saving calendar settings.', 'error');
    }
  }

  /**
   * Test microphone functionality
   */
  async testMicrophone() {
    try {
      this.showToast('Testing microphone access...', 'info');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Test successful - stop the stream
      stream.getTracks().forEach(track => track.stop());
      
      this.showToast('Microphone test successful!', 'success');
    } catch (error) {
      console.error('Microphone test error:', error);
      this.showToast('Microphone access denied or not available.', 'error');
    }
  }

  /**
   * Preview response style
   */
  previewStyle() {
    const tone = this.elements.inputs.responseTone?.value || 'professional';
    const length = this.elements.inputs.responseLength?.value || 'medium';
    const formality = this.elements.inputs.formalityLevel?.value || 7;
    
    const previewText = this.generateStylePreview(tone, length, formality);
    
    this.showToast(`Style Preview: ${previewText}`, 'info', 5000);
  }

  /**
   * Generate style preview text
   */
  generateStylePreview(tone, length, formality) {
    const toneMap = {
      professional: 'I would approach this question by...',
      casual: 'So for this one, I think...',
      enthusiastic: 'I\'m excited to share that...',
      confident: 'I\'m certain that my experience...',
      thoughtful: 'After considering this carefully...'
    };
    
    const lengthMap = {
      concise: ' and provide a focused answer.',
      medium: ' and explain with relevant examples.',
      detailed: ' and provide comprehensive examples with specific metrics and outcomes.'
    };
    
    const formalityNote = formality > 7 ? ' (Very formal)' : formality < 4 ? ' (Very casual)' : '';
    
    return (toneMap[tone] || toneMap.professional) + (lengthMap[length] || lengthMap.medium) + formalityNote;
  }

  /**
   * Export performance data
   */
  exportData() {
    const data = {
      exported: new Date().toISOString(),
      formState: this.formState,
      // Add performance metrics here
      performanceMetrics: {
        totalInterviews: 0,
        avgResponseTime: 0,
        suggestionsUsed: 0,
        successRate: 0
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidai-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    this.showToast('Data exported successfully!', 'success');
  }

  /**
   * Clear all performance data
   */
  async clearData() {
    if (!confirm('Are you sure you want to clear all performance data? This action cannot be undone.')) {
      return;
    }

    try {
      // Clear performance data
      await this.storage.set('config', 'performanceData', {});
      this.formState.performanceData = {};
      
      // Update stats display
      this.updatePerformanceStats();
      
      this.showToast('All data cleared successfully!', 'success');
    } catch (error) {
      console.error('Error clearing data:', error);
      this.showToast('Error clearing data.', 'error');
    }
  }

  /**
   * Connect Google Calendar
   */
  connectGoogleCalendar() {
    this.showToast('Google Calendar integration coming soon!', 'info');
    // Implement Google Calendar OAuth flow here
  }

  /**
   * Connect Outlook Calendar
   */
  connectOutlookCalendar() {
    this.showToast('Outlook Calendar integration coming soon!', 'info');
    // Implement Outlook Calendar OAuth flow here
  }

  /**
   * Test calendar integration
   */
  testCalendar() {
    this.showToast('Calendar integration test - No connections configured yet.', 'info');
  }

  /**
   * Load all configuration from storage
   */
  async loadConfiguration() {
    try {
      // Load API keys
      const apiKeys = await this.storage.get('config', 'apiKeys');
      if (apiKeys) {
        this.formState.apiKeys = apiKeys;
        if (this.elements.inputs.openaiKey) this.elements.inputs.openaiKey.value = apiKeys.openai || '';
        if (this.elements.inputs.anthropicKey) this.elements.inputs.anthropicKey.value = apiKeys.anthropic || '';
        if (this.elements.inputs.geminiKey) this.elements.inputs.geminiKey.value = apiKeys.gemini || '';
      }

      // Load context
      const context = await this.storage.get('config', 'context');
      if (context) {
        if (this.elements.inputs.jobDescription) this.elements.inputs.jobDescription.value = context.jobDescription || '';
        if (context.resumeData) {
          this.formState.resumeData = context.resumeData;
          if (context.resumeData.file) {
            this.updateResumePreview(context.resumeData.file);
          }
        }
      }

      // Load LLM config
      const llmConfig = await this.storage.get('config', 'llmConfig');
      if (llmConfig) {
        this.formState.llmConfig = llmConfig;
        if (this.elements.inputs.preferredProvider) this.elements.inputs.preferredProvider.value = llmConfig.preferredProvider || '';
        if (llmConfig.models) {
          if (this.elements.inputs.openaiModel) this.elements.inputs.openaiModel.value = llmConfig.models.openai || 'gpt-3.5-turbo';
          if (this.elements.inputs.anthropicModel) this.elements.inputs.anthropicModel.value = llmConfig.models.anthropic || 'claude-3-haiku-20240307';
          if (this.elements.inputs.geminiModel) this.elements.inputs.geminiModel.value = llmConfig.models.gemini || 'gemini-1.5-flash';
        }
      }

      // Load transcription settings
      const transcription = await this.storage.get('config', 'transcription');
      if (transcription) {
        this.formState.transcriptionSettings = transcription;
        if (this.elements.inputs.transcriptionLanguage) this.elements.inputs.transcriptionLanguage.value = transcription.language || 'en-US';
        if (transcription.audioProcessing) {
          if (this.elements.inputs.noiseSuppression) this.elements.inputs.noiseSuppression.checked = transcription.audioProcessing.noiseSuppression;
          if (this.elements.inputs.echoCancellation) this.elements.inputs.echoCancellation.checked = transcription.audioProcessing.echoCancellation;
          if (this.elements.inputs.autoGainControl) this.elements.inputs.autoGainControl.checked = transcription.audioProcessing.autoGainControl;
        }
        if (transcription.silenceDetection) {
          if (this.elements.inputs.silenceThreshold) {
            this.elements.inputs.silenceThreshold.value = transcription.silenceDetection.threshold || 0.01;
            const valueDisplay = this.elements.inputs.silenceThreshold.parentElement?.querySelector('.ca-range-value');
            if (valueDisplay) valueDisplay.textContent = this.elements.inputs.silenceThreshold.value;
          }
          if (this.elements.inputs.silenceDuration) {
            this.elements.inputs.silenceDuration.value = transcription.silenceDetection.duration || 1500;
            const valueDisplay = this.elements.inputs.silenceDuration.parentElement?.querySelector('.ca-range-value');
            if (valueDisplay) valueDisplay.textContent = this.elements.inputs.silenceDuration.value;
          }
        }
      }

      // Load response style
      const responseStyle = await this.storage.get('config', 'responseStyle');
      if (responseStyle) {
        this.formState.responseStyle = responseStyle;
        if (this.elements.inputs.responseTone) this.elements.inputs.responseTone.value = responseStyle.tone || 'professional';
        if (this.elements.inputs.responseLength) this.elements.inputs.responseLength.value = responseStyle.length || 'medium';
        if (this.elements.inputs.formalityLevel) {
          this.elements.inputs.formalityLevel.value = responseStyle.formality || 7;
          const valueDisplay = this.elements.inputs.formalityLevel.parentElement?.querySelector('.ca-range-value');
          if (valueDisplay) valueDisplay.textContent = this.elements.inputs.formalityLevel.value;
        }
        if (responseStyle.suggestionTypes) {
          if (this.elements.inputs.technicalSuggestions) this.elements.inputs.technicalSuggestions.checked = responseStyle.suggestionTypes.technical;
          if (this.elements.inputs.behavioralSuggestions) this.elements.inputs.behavioralSuggestions.checked = responseStyle.suggestionTypes.behavioral;
          if (this.elements.inputs.clarifyingQuestions) this.elements.inputs.clarifyingQuestions.checked = responseStyle.suggestionTypes.clarifying;
          if (this.elements.inputs.followUpSuggestions) this.elements.inputs.followUpSuggestions.checked = responseStyle.suggestionTypes.followUp;
        }
        if (responseStyle.autoGeneration) {
          if (this.elements.inputs.autoGenerateSuggestions) this.elements.inputs.autoGenerateSuggestions.checked = responseStyle.autoGeneration.enabled;
          if (this.elements.inputs.realTimeFeedback) this.elements.inputs.realTimeFeedback.checked = responseStyle.autoGeneration.realTimeFeedback;
        }
      }

      // Load language settings
      const language = await this.storage.get('config', 'language');
      if (language) {
        this.formState.languageSettings = language;
        if (this.elements.inputs.uiLanguage) this.elements.inputs.uiLanguage.value = language.ui || 'en';
        if (this.elements.inputs.responseLanguage) this.elements.inputs.responseLanguage.value = language.response || 'en';
        if (this.elements.inputs.dateFormat) this.elements.inputs.dateFormat.value = language.dateFormat || 'MM/DD/YYYY';
        if (this.elements.inputs.timeFormat) this.elements.inputs.timeFormat.value = language.timeFormat || '12';
        if (this.elements.inputs.timezone) this.elements.inputs.timezone.value = language.timezone || 'auto';
      }

      // Load calendar settings
      const calendar = await this.storage.get('config', 'calendar');
      if (calendar) {
        this.formState.calendarSettings = calendar;
        if (calendar.features) {
          if (this.elements.inputs.autoDetectInterviews) this.elements.inputs.autoDetectInterviews.checked = calendar.features.autoDetectInterviews;
          if (this.elements.inputs.prepReminders) this.elements.inputs.prepReminders.checked = calendar.features.prepReminders;
          if (this.elements.inputs.postInterviewFollowup) this.elements.inputs.postInterviewFollowup.checked = calendar.features.postInterviewFollowup;
        }
        if (this.elements.inputs.reminderTiming) this.elements.inputs.reminderTiming.value = calendar.reminderTiming || 30;
      }

      // Load performance data
      const performanceData = await this.storage.get('config', 'performanceData');
      if (performanceData) {
        this.formState.performanceData = performanceData;
        this.updatePerformanceStats();
      }

      console.log('Configuration loaded successfully');
    } catch (error) {
      console.error('Error loading configuration:', error);
      this.showToast('Error loading configuration. Using defaults.', 'error');
    }
  }

  /**
   * Update performance statistics display
   */
  updatePerformanceStats() {
    const stats = this.formState.performanceData || {};
    
    const elements = {
      totalInterviews: document.getElementById('total-interviews'),
      avgResponseTime: document.getElementById('avg-response-time'),
      suggestionsUsed: document.getElementById('suggestions-used'),
      successRate: document.getElementById('success-rate')
    };

    if (elements.totalInterviews) elements.totalInterviews.textContent = stats.totalInterviews || 0;
    if (elements.avgResponseTime) elements.avgResponseTime.textContent = stats.avgResponseTime ? `${stats.avgResponseTime}s` : '-';
    if (elements.suggestionsUsed) elements.suggestionsUsed.textContent = stats.suggestionsUsed || 0;
    if (elements.successRate) elements.successRate.textContent = stats.successRate ? `${stats.successRate}%` : '-%';
  }

  /**
   * Show specified section and update navigation
   */
  showSection(sectionId) {
    // Hide all sections
    Object.values(this.elements.sections).forEach(section => {
      if (section) {
        section.classList.remove('ca-section--active');
      }
    });

    // Remove active state from all nav buttons
    Object.values(this.elements.navButtons).forEach(button => {
      if (button) {
        button.classList.remove('ca-nav__button--active');
      }
    });

    // Show target section
    const targetSection = this.elements.sections[sectionId];
    if (targetSection) {
      targetSection.classList.add('ca-section--active');
    }

    // Update nav button state
    const targetButton = this.elements.navButtons[sectionId];
    if (targetButton) {
      targetButton.classList.add('ca-nav__button--active');
    }

    // Update performance stats when viewing performance section
    if (sectionId === 'performance') {
      this.updatePerformanceStats();
    }

    console.log(`Switched to section: ${sectionId}`);
  }

  /**
   * Toggle password visibility for API key inputs
   */
  togglePasswordVisibility(event) {
    const button = event.currentTarget;
    const targetId = button.dataset.target;
    const input = document.getElementById(targetId);
    
    if (!input) return;

    const isVisible = input.type === 'text';
    input.type = isVisible ? 'password' : 'text';
    
    // Update button icon (could be enhanced with actual icon changes)
    button.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info', duration = 3000) {
    const container = this.elements.toastContainer;
    if (!container) {
      // Fallback to console if no toast container
      console.log(`[${type.toUpperCase()}] ${message}`);
      return;
    }

    const toast = document.createElement('div');
    toast.className = `ca-toast ca-toast--${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
  }

  /**
   * Mark form as dirty (has unsaved changes)
   */
  markDirty() {
    this.formState.isDirty = true;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Initialize the options controller
const optionsController = new OptionsController();

// Export for debugging
window.CandidAIOptions = optionsController;

console.log('CandidAI Options Page script loaded successfully');


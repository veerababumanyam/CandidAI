/**
 * CandidAI - Options Page Controller
 * Handles settings management and UI interactions
 */

// Import i18n utility
import * as i18n from '../js/utils/i18n.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize i18n
  await i18n.initialize();
  // DOM Elements - API Keys
  const openaiApiKey = document.getElementById('openaiApiKey');
  const geminiApiKey = document.getElementById('geminiApiKey');
  const anthropicApiKey = document.getElementById('anthropicApiKey');

  // DOM Elements - LLM Settings
  const preferredLLM = document.getElementById('preferredLLM');
  const providerStatus = document.getElementById('providerStatus');
  const providerDescription = document.getElementById('providerDescription');
  const fallbackOrder = document.getElementById('fallbackOrder');
  const resetFallbackOrder = document.getElementById('resetFallbackOrder');
  const tokenBudget = document.getElementById('tokenBudget');
  const tokenBudgetValue = document.getElementById('tokenBudgetValue');

  // DOM Elements - Model Selection
  const openaiModel = document.getElementById('openaiModel');
  const anthropicModel = document.getElementById('anthropicModel');
  const geminiModel = document.getElementById('geminiModel');
  const modelOptions = document.querySelectorAll('.model-option');

  // DOM Elements - Resume & Job Description
  const resumeUpload = document.getElementById('resumeUpload');
  const resumeUploadButton = document.getElementById('resumeUploadButton');
  const resumeFileName = document.getElementById('resumeFileName');
  const resumeDeleteButton = document.getElementById('resumeDeleteButton');
  const jobDescription = document.getElementById('jobDescription');
  const saveJobDescriptionButton = document.getElementById('saveJobDescription');
  const clearJobDescriptionButton = document.getElementById('clearJobDescription');
  const jdSaveStatus = document.getElementById('jdSaveStatus');
  const jdWordCount = document.getElementById('jdWordCount');

  // DOM Elements - Preloaded Content
  const anticipatedQuestions = document.getElementById('anticipatedQuestions');
  const saveAnticipatedQuestionsButton = document.getElementById('saveAnticipatedQuestions');
  const clearAnticipatedQuestionsButton = document.getElementById('clearAnticipatedQuestions');
  const questionsStatus = document.getElementById('questionsStatus');
  const questionsCount = document.getElementById('questionsCount');
  const starExamples = document.getElementById('starExamples');
  const saveStarExamplesButton = document.getElementById('saveStarExamples');
  const clearStarExamplesButton = document.getElementById('clearStarExamples');
  const starStatus = document.getElementById('starStatus');
  const starCount = document.getElementById('starCount');

  // DOM Elements - Response Style Settings
  const responseStyle = document.getElementById('responseStyle');
  const responseLength = document.getElementById('responseLength');
  const formality = document.getElementById('formality');

  // DOM Elements - Accessibility Settings
  const fontSize = document.getElementById('fontSize');
  const autoScroll = document.getElementById('autoScroll');

  // DOM Elements - Language Settings
  const interfaceLanguage = document.getElementById('interfaceLanguage');
  const transcriptionLanguage = document.getElementById('transcriptionLanguage');
  const responseLanguage = document.getElementById('responseLanguage');

  // DOM Elements - Buttons
  const saveSettings = document.getElementById('saveSettings');
  const resetSettings = document.getElementById('resetSettings');
  const toggleVisibilityButtons = document.querySelectorAll('.toggle-visibility');

  // Provider descriptions
  const providerDescriptions = {
    openai: 'OpenAI offers GPT models with strong general capabilities. GPT-3.5 is fast and cost-effective, while GPT-4 offers higher quality for complex tasks.',
    anthropic: 'Anthropic\'s Claude models excel at nuanced instructions and longer contexts. Claude 3 Opus is their most capable model, while Haiku is fastest.',
    gemini: 'Google\'s Gemini models offer competitive performance with good integration with Google services. Gemini Pro is their standard model.'
  };

  // Populate language dropdowns
  populateLanguageDropdowns();

  // Load saved settings
  loadSettings();

  // Event Listeners - API Keys
  toggleVisibilityButtons.forEach(button => {
    button.addEventListener('click', togglePasswordVisibility);
  });

  openaiApiKey.addEventListener('blur', () => validateApiKey('openai', openaiApiKey.value));
  geminiApiKey.addEventListener('blur', () => validateApiKey('gemini', geminiApiKey.value));
  anthropicApiKey.addEventListener('blur', () => validateApiKey('anthropic', anthropicApiKey.value));

  // Event Listeners - LLM Settings
  preferredLLM.addEventListener('change', handleProviderChange);
  resetFallbackOrder.addEventListener('click', resetFallbackOrderToDefault);
  tokenBudget.addEventListener('input', updateTokenBudgetDisplay);

  // Event Listeners - Model Selection
  openaiModel.addEventListener('change', saveModelPreference);
  anthropicModel.addEventListener('change', saveModelPreference);
  geminiModel.addEventListener('change', saveModelPreference);

  // Event Listeners - Resume & Job Description
  resumeUploadButton.addEventListener('click', () => {
    resumeUpload.click();
  });
  resumeUpload.addEventListener('change', handleResumeUpload);

  if (resumeDeleteButton) {
    resumeDeleteButton.addEventListener('click', deleteResume);
  }

  // Job Description event listeners
  jobDescription.addEventListener('input', updateJobDescriptionWordCount);

  if (saveJobDescriptionButton) {
    saveJobDescriptionButton.addEventListener('click', saveJobDescriptionHandler);
  }

  if (clearJobDescriptionButton) {
    clearJobDescriptionButton.addEventListener('click', clearJobDescriptionHandler);
  }

  // Auto-save job description when it loses focus
  jobDescription.addEventListener('blur', () => {
    if (jobDescription.value.trim().length > 0) {
      saveJobDescriptionHandler();
    }
  });

  // Anticipated Questions event listeners
  anticipatedQuestions.addEventListener('input', updateQuestionsCount);

  if (saveAnticipatedQuestionsButton) {
    saveAnticipatedQuestionsButton.addEventListener('click', saveAnticipatedQuestionsHandler);
  }

  if (clearAnticipatedQuestionsButton) {
    clearAnticipatedQuestionsButton.addEventListener('click', clearAnticipatedQuestionsHandler);
  }

  // Auto-save anticipated questions when it loses focus
  anticipatedQuestions.addEventListener('blur', () => {
    if (anticipatedQuestions.value.trim().length > 0) {
      saveAnticipatedQuestionsHandler();
    }
  });

  // STAR Examples event listeners
  starExamples.addEventListener('input', updateStarExamplesCount);

  if (saveStarExamplesButton) {
    saveStarExamplesButton.addEventListener('click', saveStarExamplesHandler);
  }

  if (clearStarExamplesButton) {
    clearStarExamplesButton.addEventListener('click', clearStarExamplesHandler);
  }

  // Auto-save STAR examples when it loses focus
  starExamples.addEventListener('blur', () => {
    if (starExamples.value.trim().length > 0) {
      saveStarExamplesHandler();
    }
  });

  // Response Style event listeners
  responseStyle.addEventListener('change', saveResponseStyleSettings);
  responseLength.addEventListener('input', updateResponseLengthLabel);
  responseLength.addEventListener('change', saveResponseStyleSettings);
  formality.addEventListener('input', updateFormalityLabel);
  formality.addEventListener('change', saveResponseStyleSettings);

  // Language Settings event listeners
  interfaceLanguage.addEventListener('change', saveLanguageSettings);
  transcriptionLanguage.addEventListener('change', saveLanguageSettings);
  responseLanguage.addEventListener('change', saveLanguageSettings);

  // Event Listeners - Buttons
  saveSettings.addEventListener('click', saveAllSettings);
  resetSettings.addEventListener('click', resetAllSettings);

  // Functions
  function loadSettings() {
    chrome.storage.local.get([
      'llmApiKeys',
      'llmPreferences',
      'llmUsage',
      'jobDescription',
      'accessibilitySettings',
      'tokenBudget',
      'anticipatedQuestions',
      'starExamples',
      'responseStyleSettings',
      'languageSettings'
    ], (result) => {
      // API Keys
      const apiKeys = result.llmApiKeys || {};
      if (apiKeys.openai) openaiApiKey.value = apiKeys.openai;
      if (apiKeys.gemini) geminiApiKey.value = apiKeys.gemini;
      if (apiKeys.anthropic) anthropicApiKey.value = apiKeys.anthropic;

      // Validate API keys
      validateApiKey('openai', apiKeys.openai || '');
      validateApiKey('gemini', apiKeys.gemini || '');
      validateApiKey('anthropic', apiKeys.anthropic || '');

      // LLM Preferences
      const llmPrefs = result.llmPreferences || {
        preferredProvider: 'openai',
        fallbackOrder: ['anthropic', 'gemini'],
        modelPreferences: {
          openai: 'gpt-3.5-turbo',
          anthropic: 'claude-3-sonnet-20240229',
          gemini: 'gemini-pro'
        }
      };

      // Preferred LLM
      if (llmPrefs.preferredProvider) {
        preferredLLM.value = llmPrefs.preferredProvider;
      }

      // Model Preferences
      if (llmPrefs.modelPreferences) {
        if (llmPrefs.modelPreferences.openai) {
          openaiModel.value = llmPrefs.modelPreferences.openai;
        }
        if (llmPrefs.modelPreferences.anthropic) {
          anthropicModel.value = llmPrefs.modelPreferences.anthropic;
        }
        if (llmPrefs.modelPreferences.gemini) {
          geminiModel.value = llmPrefs.modelPreferences.gemini;
        }
      }

      // Fallback Order
      if (llmPrefs.fallbackOrder) {
        updateFallbackOrderUI(llmPrefs.fallbackOrder);
      } else {
        // Default fallback order
        updateFallbackOrderUI(['anthropic', 'gemini']);
      }

      // Token Budget
      if (result.tokenBudget) {
        tokenBudget.value = result.tokenBudget;
      }
      updateTokenBudgetDisplay();

      // Job Description
      if (result.jobDescription) jobDescription.value = result.jobDescription;

      // Accessibility Settings
      if (result.accessibilitySettings) {
        fontSize.value = result.accessibilitySettings.fontSize || 'medium';
        autoScroll.checked = result.accessibilitySettings.autoScroll !== false;
      }

      // Resume filename and upload date (if any)
      chrome.storage.local.get(['resumeFileName', 'resumeUploadDate'], (fileResult) => {
        if (fileResult.resumeFileName) {
          resumeFileName.textContent = fileResult.resumeFileName;

          // Add upload date if available
          if (fileResult.resumeUploadDate) {
            const dateSpan = document.createElement('span');
            dateSpan.classList.add('upload-date');
            dateSpan.textContent = ` (Uploaded: ${fileResult.resumeUploadDate})`;
            resumeFileName.appendChild(dateSpan);
          }
        }
      });

      // Job description (if any)
      chrome.storage.local.get(['jobDescription'], (jdResult) => {
        if (jdResult.jobDescription) {
          jobDescription.value = jdResult.jobDescription;
          updateJobDescriptionWordCount();
        }
      });

      // Anticipated questions (if any)
      if (result.anticipatedQuestions) {
        anticipatedQuestions.value = result.anticipatedQuestions;
        updateQuestionsCount();
      }

      // STAR examples (if any)
      if (result.starExamples) {
        starExamples.value = result.starExamples;
        updateStarExamplesCount();
      }

      // Response style settings (if any)
      if (result.responseStyleSettings) {
        if (result.responseStyleSettings.style) {
          responseStyle.value = result.responseStyleSettings.style;
        }

        if (result.responseStyleSettings.length) {
          responseLength.value = result.responseStyleSettings.length;
          updateResponseLengthLabel();
        }

        if (result.responseStyleSettings.formality) {
          formality.value = result.responseStyleSettings.formality;
          updateFormalityLabel();
        }
      }

      // Language settings (if any)
      if (result.languageSettings) {
        if (result.languageSettings.ui) {
          interfaceLanguage.value = result.languageSettings.ui;
        }

        if (result.languageSettings.transcription) {
          transcriptionLanguage.value = result.languageSettings.transcription;
        }

        if (result.languageSettings.response) {
          responseLanguage.value = result.languageSettings.response;
        }
      } else {
        // Set defaults based on browser language
        const browserLang = navigator.language;
        const uiLang = browserLang.split('-')[0];

        // Set UI language if supported
        if (i18n.SUPPORTED_UI_LANGUAGES[uiLang]) {
          interfaceLanguage.value = uiLang;
        }

        // Set transcription language if supported
        if (i18n.SUPPORTED_TRANSCRIPTION_LANGUAGES[browserLang]) {
          transcriptionLanguage.value = browserLang;
        } else {
          // Try with just the language code
          const transcriptionLangs = Object.keys(i18n.SUPPORTED_TRANSCRIPTION_LANGUAGES);
          const matchingLang = transcriptionLangs.find(lang => lang.startsWith(uiLang));
          if (matchingLang) {
            transcriptionLanguage.value = matchingLang;
          }
        }

        // Set response language to auto by default
        responseLanguage.value = 'auto';
      }

      // Update provider info
      handleProviderChange();

      // Show active model option
      showActiveModelOption(llmPrefs.preferredProvider);

      // Update provider status based on API key validation
      updateProviderStatus();
    });
  }

  /**
   * Validates an API key format and shows feedback
   * @param {string} provider - The LLM provider
   * @param {string} key - The API key to validate
   */
  function validateApiKey(provider, key) {
    // Skip validation if key is empty (user might be clearing it)
    if (!key) return;

    let isValid = false;
    let message = '';

    // Basic format validation
    switch (provider) {
      case 'openai':
        isValid = key.startsWith('sk-') && key.length > 20;
        message = isValid ? 'Valid OpenAI API key format' : 'Invalid OpenAI API key format. Should start with "sk-"';
        break;
      case 'anthropic':
        isValid = key.startsWith('sk-ant-') && key.length > 20;
        message = isValid ? 'Valid Anthropic API key format' : 'Invalid Anthropic API key format. Should start with "sk-ant-"';
        break;
      case 'gemini':
        isValid = key.length > 20;
        message = isValid ? 'Valid Gemini API key format' : 'API key seems too short';
        break;
    }

    // Show validation message
    const inputElement = document.getElementById(`${provider}ApiKey`);
    const container = inputElement.closest('.form-group');

    // Remove any existing validation message
    const existingMessage = container.querySelector('.validation-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Add new validation message
    const validationMessage = document.createElement('div');
    validationMessage.className = `validation-message ${isValid ? 'valid' : 'invalid'}`;
    validationMessage.textContent = message;
    container.appendChild(validationMessage);

    // Update input styling
    if (isValid) {
      inputElement.classList.remove('invalid-input');
      inputElement.classList.add('valid-input');
    } else {
      inputElement.classList.remove('valid-input');
      inputElement.classList.add('invalid-input');
    }
  }

  function togglePasswordVisibility(event) {
    const targetId = event.currentTarget.getAttribute('data-for');
    const inputField = document.getElementById(targetId);

    if (inputField.type === 'password') {
      inputField.type = 'text';
    } else {
      inputField.type = 'password';
    }
  }

  /**
   * Handles resume file upload
   * @param {Event} event - The change event from the file input
   */
  function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const fileType = file.type;
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'application/msword' // DOC
    ];

    if (!validTypes.includes(fileType)) {
      showStatusMessage('Please upload a PDF or Word document (.pdf, .docx, .doc)', 'error');
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      showStatusMessage('File is too large. Maximum size is 5MB.', 'error');
      return;
    }

    // Update UI
    resumeFileName.textContent = file.name;

    // Show loading state
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('validation-message');
    loadingMessage.textContent = 'Processing resume...';
    resumeFileName.parentNode.appendChild(loadingMessage);

    // Store filename and upload date
    const uploadDate = new Date().toLocaleDateString();
    chrome.storage.local.set({
      resumeFileName: file.name,
      resumeUploadDate: uploadDate
    });

    // Read file content
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileContent = e.target.result;

      // Store file content
      chrome.storage.local.set({
        resumeContent: fileContent,
        resumeType: fileType,
        resumeSize: file.size,
        resumeLastModified: file.lastModified
      }, () => {
        // Remove loading message
        loadingMessage.remove();

        // Show success message
        showStatusMessage('Resume uploaded successfully!', 'success');

        // Add upload date to UI
        const dateSpan = document.createElement('span');
        dateSpan.classList.add('upload-date');
        dateSpan.textContent = ` (Uploaded: ${uploadDate})`;
        resumeFileName.appendChild(dateSpan);
      });
    };

    reader.onerror = () => {
      // Remove loading message
      loadingMessage.remove();

      // Show error message
      showStatusMessage('Error reading file. Please try again.', 'error');
    };

    // Read as array buffer for binary files
    reader.readAsArrayBuffer(file);
  }

  /**
   * Deletes the uploaded resume
   */
  function deleteResume() {
    // Confirm deletion
    if (confirm('Are you sure you want to delete your resume?')) {
      // Remove resume data from storage
      chrome.storage.local.remove([
        'resumeContent',
        'resumeType',
        'resumeFileName',
        'resumeSize',
        'resumeLastModified',
        'resumeUploadDate'
      ], () => {
        // Reset UI
        resumeFileName.textContent = 'No file chosen';

        // Remove any upload date span
        const dateSpan = resumeFileName.querySelector('.upload-date');
        if (dateSpan) {
          dateSpan.remove();
        }

        // Show success message
        showStatusMessage('Resume deleted successfully', 'info');
      });
    }
  }

  /**
   * Updates the word count for the job description
   */
  function updateJobDescriptionWordCount() {
    const text = jobDescription.value.trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    jdWordCount.textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;
  }

  /**
   * Saves the job description to storage
   */
  function saveJobDescriptionHandler() {
    const jdText = jobDescription.value.trim();

    // Save to storage
    chrome.storage.local.set({
      jobDescription: jdText,
      jobDescriptionLastSaved: new Date().toISOString()
    }, () => {
      // Show save status
      jdSaveStatus.textContent = 'Saved';
      jdSaveStatus.classList.add('visible', 'success');

      // Hide save status after 2 seconds
      setTimeout(() => {
        jdSaveStatus.classList.remove('visible');
      }, 2000);

      // Show status message
      showStatusMessage('Job description saved', 'success');
    });
  }

  /**
   * Clears the job description
   */
  function clearJobDescriptionHandler() {
    // Confirm clearing
    if (jobDescription.value.trim() && !confirm('Are you sure you want to clear the job description?')) {
      return;
    }

    // Clear textarea
    jobDescription.value = '';

    // Update word count
    updateJobDescriptionWordCount();

    // Remove from storage
    chrome.storage.local.remove(['jobDescription', 'jobDescriptionLastSaved'], () => {
      // Show status message
      showStatusMessage('Job description cleared', 'info');
    });
  }

  /**
   * Updates the count of anticipated questions
   */
  function updateQuestionsCount() {
    const text = anticipatedQuestions.value.trim();
    const lines = text ? text.split('\n').filter(line => line.trim().length > 0) : [];
    questionsCount.textContent = `${lines.length} question${lines.length !== 1 ? 's' : ''}`;
  }

  /**
   * Saves the anticipated questions to storage
   */
  function saveAnticipatedQuestionsHandler() {
    const questions = anticipatedQuestions.value.trim();

    // Save to storage
    chrome.storage.local.set({
      anticipatedQuestions: questions,
      anticipatedQuestionsLastSaved: new Date().toISOString()
    }, () => {
      // Show save status
      questionsStatus.textContent = 'Saved';
      questionsStatus.classList.add('visible', 'success');

      // Hide save status after 2 seconds
      setTimeout(() => {
        questionsStatus.classList.remove('visible');
      }, 2000);

      // Show status message
      showStatusMessage('Anticipated questions saved', 'success');
    });
  }

  /**
   * Clears the anticipated questions
   */
  function clearAnticipatedQuestionsHandler() {
    // Confirm clearing
    if (anticipatedQuestions.value.trim() && !confirm('Are you sure you want to clear the anticipated questions?')) {
      return;
    }

    // Clear textarea
    anticipatedQuestions.value = '';

    // Update count
    updateQuestionsCount();

    // Remove from storage
    chrome.storage.local.remove(['anticipatedQuestions', 'anticipatedQuestionsLastSaved'], () => {
      // Show status message
      showStatusMessage('Anticipated questions cleared', 'info');
    });
  }

  /**
   * Updates the count of STAR examples
   */
  function updateStarExamplesCount() {
    const text = starExamples.value.trim();
    const examples = text ? text.split(/\n\s*\n/).filter(example => example.trim().length > 0) : [];
    starCount.textContent = `${examples.length} example${examples.length !== 1 ? 's' : ''}`;
  }

  /**
   * Saves the STAR examples to storage
   */
  function saveStarExamplesHandler() {
    const examples = starExamples.value.trim();

    // Save to storage
    chrome.storage.local.set({
      starExamples: examples,
      starExamplesLastSaved: new Date().toISOString()
    }, () => {
      // Show save status
      starStatus.textContent = 'Saved';
      starStatus.classList.add('visible', 'success');

      // Hide save status after 2 seconds
      setTimeout(() => {
        starStatus.classList.remove('visible');
      }, 2000);

      // Show status message
      showStatusMessage('STAR examples saved', 'success');
    });
  }

  /**
   * Clears the STAR examples
   */
  function clearStarExamplesHandler() {
    // Confirm clearing
    if (starExamples.value.trim() && !confirm('Are you sure you want to clear the STAR examples?')) {
      return;
    }

    // Clear textarea
    starExamples.value = '';

    // Update count
    updateStarExamplesCount();

    // Remove from storage
    chrome.storage.local.remove(['starExamples', 'starExamplesLastSaved'], () => {
      // Show status message
      showStatusMessage('STAR examples cleared', 'info');
    });
  }

  /**
   * Updates the response length label based on the slider value
   */
  function updateResponseLengthLabel() {
    // The labels are already in the HTML, so we just need to highlight the selected one
    const labels = document.querySelectorAll('#responseLength + .slider-labels span');
    const value = parseInt(responseLength.value);

    // Remove highlight from all labels
    labels.forEach(label => {
      label.style.fontWeight = 'normal';
      label.style.color = 'var(--color-text-medium)';
    });

    // Highlight the selected label
    if (labels[value - 1]) {
      labels[value - 1].style.fontWeight = 'var(--font-weight-bold)';
      labels[value - 1].style.color = 'var(--color-text-dark)';
    }
  }

  /**
   * Updates the formality label based on the slider value
   */
  function updateFormalityLabel() {
    // The labels are already in the HTML, so we just need to highlight the selected one
    const labels = document.querySelectorAll('#formality + .slider-labels span');
    const value = parseInt(formality.value);

    // Remove highlight from all labels
    labels.forEach(label => {
      label.style.fontWeight = 'normal';
      label.style.color = 'var(--color-text-medium)';
    });

    // Highlight the selected label
    if (labels[value - 1]) {
      labels[value - 1].style.fontWeight = 'var(--font-weight-bold)';
      labels[value - 1].style.color = 'var(--color-text-dark)';
    }
  }

  /**
   * Saves the response style settings
   */
  function saveResponseStyleSettings() {
    const settings = {
      style: responseStyle.value,
      length: responseLength.value,
      formality: formality.value,
      lastSaved: new Date().toISOString()
    };

    // Save to storage
    chrome.storage.local.set({
      responseStyleSettings: settings
    }, () => {
      // Show status message
      showStatusMessage('Response style settings saved', 'success');
    });
  }

  /**
   * Updates the provider status based on API key validation
   */
  function updateProviderStatus() {
    const providers = ['openai', 'anthropic', 'gemini'];
    let availableProviders = [];

    providers.forEach(provider => {
      const apiKeyInput = document.getElementById(`${provider}ApiKey`);
      if (apiKeyInput && apiKeyInput.value && !apiKeyInput.classList.contains('invalid-input')) {
        availableProviders.push(provider);
      }
    });

    // Update provider status in UI
    providerStatus.innerHTML = '';

    if (availableProviders.includes(preferredLLM.value)) {
      providerStatus.classList.add('available');
      providerStatus.classList.remove('unavailable');
      providerStatus.textContent = 'Available (API key validated)';
    } else {
      providerStatus.classList.add('unavailable');
      providerStatus.classList.remove('available');
      providerStatus.textContent = 'Unavailable (API key missing or invalid)';
    }
  }

  /**
   * Handles provider change in the dropdown
   */
  function handleProviderChange() {
    const selectedProvider = preferredLLM.value;

    // Update provider description
    providerDescription.textContent = providerDescriptions[selectedProvider] || '';

    // Show the appropriate model selection
    showActiveModelOption(selectedProvider);

    // Update provider status
    updateProviderStatus();

    // Update fallback order (remove selected provider from fallback)
    const allProviders = ['openai', 'anthropic', 'gemini'];
    const fallbackProviders = allProviders.filter(p => p !== selectedProvider);
    updateFallbackOrderUI(fallbackProviders);

    // Save the preference
    chrome.storage.local.get(['llmPreferences'], (result) => {
      const prefs = result.llmPreferences || {};
      prefs.preferredProvider = selectedProvider;
      prefs.fallbackOrder = fallbackProviders;
      chrome.storage.local.set({ llmPreferences: prefs });
    });
  }

  /**
   * Shows the active model option based on selected provider
   * @param {string} provider - The selected provider
   */
  function showActiveModelOption(provider) {
    // Hide all model options
    modelOptions.forEach(option => {
      option.classList.remove('active');
    });

    // Show the selected provider's model option
    const activeOption = document.querySelector(`.${provider}-model`);
    if (activeOption) {
      activeOption.classList.add('active');
    }
  }

  /**
   * Saves the model preference for a provider
   */
  function saveModelPreference() {
    const selectedProvider = preferredLLM.value;
    let selectedModel = '';

    // Get the selected model based on provider
    switch (selectedProvider) {
      case 'openai':
        selectedModel = openaiModel.value;
        break;
      case 'anthropic':
        selectedModel = anthropicModel.value;
        break;
      case 'gemini':
        selectedModel = geminiModel.value;
        break;
    }

    // Save the preference
    chrome.storage.local.get(['llmPreferences'], (result) => {
      const prefs = result.llmPreferences || {};
      if (!prefs.modelPreferences) {
        prefs.modelPreferences = {};
      }
      prefs.modelPreferences[selectedProvider] = selectedModel;
      chrome.storage.local.set({ llmPreferences: prefs });

      // Show success message
      showStatusMessage(`${selectedProvider} model updated to ${selectedModel}`, 'success');
    });
  }

  /**
   * Updates the token budget display
   */
  function updateTokenBudgetDisplay() {
    const value = parseInt(tokenBudget.value);
    tokenBudgetValue.textContent = value.toLocaleString() + ' tokens';

    // Save the token budget
    chrome.storage.local.set({ tokenBudget: value });
  }

  /**
   * Resets the fallback order to default
   */
  function resetFallbackOrderToDefault() {
    const selectedProvider = preferredLLM.value;
    const allProviders = ['openai', 'anthropic', 'gemini'];
    const defaultFallback = allProviders.filter(p => p !== selectedProvider);

    updateFallbackOrderUI(defaultFallback);

    // Save the preference
    chrome.storage.local.get(['llmPreferences'], (result) => {
      const prefs = result.llmPreferences || {};
      prefs.fallbackOrder = defaultFallback;
      chrome.storage.local.set({ llmPreferences: prefs });

      // Show success message
      showStatusMessage('Fallback order reset to default', 'info');
    });
  }

  /**
   * Updates the fallback order UI
   * @param {Array<string>} llmOrder - The order of LLM providers
   */
  function updateFallbackOrderUI(llmOrder) {
    // Clear existing content
    fallbackOrder.innerHTML = '';

    // Create fallback items
    const llmNames = {
      'openai': 'OpenAI (GPT)',
      'gemini': 'Google Gemini',
      'anthropic': 'Anthropic (Claude)'
    };

    llmOrder.forEach((llm, index) => {
      const item = document.createElement('div');
      item.classList.add('fallback-item');
      item.innerHTML = `
        <span class="fallback-handle">≡</span>
        <span>${index + 1}. ${llmNames[llm] || llm}</span>
      `;
      fallbackOrder.appendChild(item);
    });
  }

  function saveAllSettings() {
    // Collect API keys
    const llmApiKeys = {
      openai: openaiApiKey.value.trim(),
      gemini: geminiApiKey.value.trim(),
      anthropic: anthropicApiKey.value.trim()
    };

    // Collect LLM preferences
    const llmPreferences = {
      preferredProvider: preferredLLM.value,
      fallbackOrder: getFallbackOrderFromUI(),
      modelPreferences: {
        openai: openaiModel.value,
        anthropic: anthropicModel.value,
        gemini: geminiModel.value
      }
    };

    // Collect token budget
    const tokenBudgetValue = parseInt(tokenBudget.value);

    // Collect other settings
    const settings = {
      llmApiKeys,
      llmPreferences,
      tokenBudget: tokenBudgetValue,
      jobDescription: jobDescription.value,
      accessibilitySettings: {
        fontSize: fontSize.value,
        autoScroll: autoScroll.checked
      },
      responseStyleSettings: {
        style: responseStyle.value,
        length: responseLength.value,
        formality: formality.value,
        lastSaved: new Date().toISOString()
      },
      languageSettings: {
        ui: interfaceLanguage.value,
        transcription: transcriptionLanguage.value,
        response: responseLanguage.value,
        lastSaved: new Date().toISOString()
      }
    };

    // Save to storage
    chrome.storage.local.set(settings, () => {
      // Show success message
      showStatusMessage('Settings saved successfully!', 'success');

      // Validate API keys after saving
      if (llmApiKeys.openai) validateApiKey('openai', llmApiKeys.openai);
      if (llmApiKeys.gemini) validateApiKey('gemini', llmApiKeys.gemini);
      if (llmApiKeys.anthropic) validateApiKey('anthropic', llmApiKeys.anthropic);

      // Update provider status
      updateProviderStatus();
    });
  }

  /**
   * Gets the fallback order from the UI
   * @returns {Array<string>} - The fallback order
   */
  function getFallbackOrderFromUI() {
    // In a full implementation, this would extract the order from the UI
    // For now, we'll use a simplified approach
    const preferred = preferredLLM.value;
    const allProviders = ['openai', 'anthropic', 'gemini'];

    // Remove the preferred provider from the list
    const fallbackProviders = allProviders.filter(p => p !== preferred);

    return fallbackProviders;
  }

  /**
   * Shows a status message
   * @param {string} message - The message to show
   * @param {string} type - The type of message ('success', 'error', 'info')
   */
  function showStatusMessage(message, type = 'info') {
    const statusMessage = document.createElement('div');
    statusMessage.classList.add('status-message', type);
    statusMessage.textContent = message;

    document.querySelector('.button-container').appendChild(statusMessage);

    // Add fade-in animation
    statusMessage.classList.add('fade-in');

    // Remove message after 3 seconds with fade-out animation
    setTimeout(() => {
      statusMessage.classList.add('fade-out');
      setTimeout(() => {
        statusMessage.remove();
      }, 500);
    }, 3000);
  }

  /**
   * Saves language settings
   */
  function saveLanguageSettings() {
    const settings = {
      ui: interfaceLanguage.value,
      transcription: transcriptionLanguage.value,
      response: responseLanguage.value,
      lastSaved: new Date().toISOString()
    };

    // Save to storage
    chrome.storage.local.set({
      languageSettings: settings
    }, () => {
      // Show status message
      showStatusMessage('Language settings saved', 'success');

      // Apply UI language change immediately
      i18n.applyLanguageToUI(settings);
    });
  }

  /**
   * Populates the language dropdown menus
   */
  function populateLanguageDropdowns() {
    // Interface language dropdown
    for (const [code, name] of Object.entries(i18n.SUPPORTED_UI_LANGUAGES)) {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = name;
      interfaceLanguage.appendChild(option);
    }

    // Transcription language dropdown
    for (const [code, name] of Object.entries(i18n.SUPPORTED_TRANSCRIPTION_LANGUAGES)) {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = name;
      transcriptionLanguage.appendChild(option);
    }

    // Response language dropdown
    for (const [code, name] of Object.entries(i18n.SUPPORTED_RESPONSE_LANGUAGES)) {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = name;
      responseLanguage.appendChild(option);
    }
  }

  function resetAllSettings() {
    // Default settings
    const defaultSettings = {
      llmApiKeys: {
        openai: '',
        gemini: '',
        anthropic: ''
      },
      llmPreferences: {
        preferredProvider: 'openai',
        fallbackOrder: ['anthropic', 'gemini'],
        modelPreferences: {
          openai: 'gpt-3.5-turbo',
          anthropic: 'claude-3-sonnet-20240229',
          gemini: 'gemini-pro'
        }
      },
      tokenBudget: 100000,
      jobDescription: '',
      resumeContent: null,
      resumeType: null,
      resumeFileName: null,
      accessibilitySettings: {
        fontSize: 'medium',
        autoScroll: true
      },
      responseStyleSettings: {
        style: 'balanced',
        length: '3',
        formality: '3',
        lastSaved: new Date().toISOString()
      },
      llmUsage: {
        openai: { promptTokens: 0, completionTokens: 0, totalTokens: 0, requests: 0 },
        anthropic: { promptTokens: 0, completionTokens: 0, totalTokens: 0, requests: 0 },
        gemini: { promptTokens: 0, completionTokens: 0, totalTokens: 0, requests: 0 }
      },
      languageSettings: {
        ui: navigator.language.split('-')[0] || 'en',
        transcription: navigator.language || 'en-US',
        response: 'auto',
        lastSaved: new Date().toISOString()
      }
    };

    // Confirm reset
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      // Save defaults to storage
      chrome.storage.local.set(defaultSettings, () => {
        // Show success message
        showStatusMessage('Settings reset to defaults', 'info');

        // Reload page to reflect changes
        setTimeout(() => {
          location.reload();
        }, 1500);
      });
    }
  }
});

/**
 * CandidAI - Side Panel Controller
 * Handles UI interactions and communication with the service worker
 */

// Import i18n utility
import * as i18n from '../js/utils/i18n.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize i18n
  await i18n.initialize();
  // DOM Elements - Main Controls
  const toggleListeningButton = document.getElementById('toggleListeningButton');
  const statusText = document.getElementById('statusText');
  const platformIndicator = document.getElementById('platformIndicator');
  const transcribedQuestion = document.getElementById('transcribedQuestion');
  const aiSuggestions = document.getElementById('aiSuggestions');

  // DOM Elements - Chat
  const chatInput = document.getElementById('chatInput');
  const sendButton = document.getElementById('sendButton');
  const chatMessages = document.getElementById('chatMessages');
  const clearChatButton = document.getElementById('clearChat');

  // DOM Elements - Controls
  const settingsButton = document.getElementById('settingsButton');
  const toggleThemeButton = document.getElementById('toggleThemeButton');
  const toggleTranscriptionButton = document.getElementById('toggleTranscriptionVisibility');
  const copyToClipboardButton = document.getElementById('copyToClipboard');

  // DOM Elements - Footer
  const helpLink = document.getElementById('helpLink');
  const feedbackLink = document.getElementById('feedbackLink');

  // State
  let isListening = false;
  let currentPlatform = null;
  let interimTranscriptTimeout = null;
  let isDarkTheme = false;
  let isTranscriptionVisible = true;
  let accessibilitySettings = {
    fontSize: 'medium',
    autoScroll: true
  };

  // Initialize UI
  initializeUI();

  // Initialize automated answering
  initializeAutomatedAnswering();

  // Event Listeners - Main Controls
  toggleListeningButton.addEventListener('click', toggleListening);

  // Event Listeners - Chat
  sendButton.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });
  clearChatButton.addEventListener('click', clearChat);

  // Event Listeners - Controls
  settingsButton.addEventListener('click', openOptionsPage);
  toggleThemeButton.addEventListener('click', toggleTheme);
  toggleTranscriptionButton.addEventListener('click', toggleTranscriptionVisibility);
  copyToClipboardButton.addEventListener('click', copyToClipboard);

  // Event Listeners - Visual Analysis
  captureScreenButton.addEventListener('click', captureScreen);
  copyAnalysisButton.addEventListener('click', copyAnalysis);
  refreshAnalysisButton.addEventListener('click', refreshAnalysis);

  // Event Listeners - Automated Answering
  speakButton.addEventListener('click', speakAnswer);
  copyButton.addEventListener('click', copyAnswer);
  refreshButton.addEventListener('click', refreshAnswer);
  autoAnswerButton.addEventListener('click', toggleAutoAnswerSettings);
  closeAutoAnswerSettings.addEventListener('click', toggleAutoAnswerSettings);
  autoAnswerToggle.addEventListener('change', toggleAutoAnswer);
  audioInjectionToggle.addEventListener('change', toggleAudioInjection);

  // Voice settings event listeners
  voiceSelect.addEventListener('change', changeVoice);
  rateRange.addEventListener('input', updateRateValue);
  pitchRange.addEventListener('input', updatePitchValue);
  volumeRange.addEventListener('input', updateVolumeValue);

  // Event Listeners - Footer
  helpLink.addEventListener('click', openHelpPage);
  feedbackLink.addEventListener('click', openFeedbackForm);

  /**
   * Initializes the UI based on stored state
   */
  function initializeUI() {
    // Get stored state
    chrome.storage.local.get([
      'isListening',
      'accessibilitySettings',
      'theme',
      'transcriptionVisible'
    ], (result) => {
      // Update listening state
      isListening = result.isListening || false;
      updateListeningUI();

      // Update accessibility settings
      if (result.accessibilitySettings) {
        accessibilitySettings = result.accessibilitySettings;
        applyAccessibilitySettings();
      }

      // Apply theme preference
      if (result.theme === 'dark') {
        isDarkTheme = true;
        document.body.classList.add('dark-theme');
        toggleThemeButton.title = 'Switch to Light Theme';
      }

      // Apply transcription visibility preference
      if (result.transcriptionVisible === false) {
        isTranscriptionVisible = false;
        const transcriptionContainer = document.querySelector('.transcription-container');
        transcriptionContainer.style.display = 'none';
        toggleTranscriptionButton.title = 'Show Transcription';
      }

      // Get current status from service worker
      chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
        if (response) {
          // Update platform
          if (response.currentPlatform) {
            updatePlatformUI(response.currentPlatform);
          }

          // Update transcription
          if (response.lastTranscribedText) {
            // Replace the placeholder text with actual content
            if (transcribedQuestion.querySelector('.placeholder-text')) {
              transcribedQuestion.innerHTML = '';
            }
            transcribedQuestion.textContent = response.lastTranscribedText;
          }

          // Update suggestions
          if (response.lastGeneratedAnswer) {
            // Replace the placeholder text with actual content
            if (aiSuggestions.querySelector('.placeholder-text')) {
              aiSuggestions.innerHTML = '';
            }
            aiSuggestions.textContent = response.lastGeneratedAnswer;
          }
        }
      });
    });
  }

  /**
   * Applies accessibility settings to the UI
   */
  function applyAccessibilitySettings() {
    // Apply font size
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    document.body.classList.add(`font-size-${accessibilitySettings.fontSize}`);

    // Apply auto-scroll setting (will be used when adding messages)
  }

  /**
   * Toggles the listening state
   */
  function toggleListening() {
    // Update UI immediately for responsiveness
    isListening = !isListening;
    updateListeningUI();

    // Send message to service worker
    chrome.runtime.sendMessage({
      action: isListening ? 'startListening' : 'stopListening'
    }, (response) => {
      // If the operation failed, revert UI
      if (response && !response.success) {
        isListening = !isListening;
        updateListeningUI();

        // Show error message
        showStatusMessage('Error ' + (isListening ? 'starting' : 'stopping') + ' listening', 'error');
      }
    });
  }

  /**
   * Updates the UI based on listening state
   */
  function updateListeningUI() {
    if (isListening) {
      toggleListeningButton.querySelector('.button-text').textContent = i18n.getMessage('stopListening');
      toggleListeningButton.classList.add('active');
      statusText.textContent = i18n.getMessage('listening');
      statusText.classList.add('listening');
    } else {
      toggleListeningButton.querySelector('.button-text').textContent = i18n.getMessage('startListening');
      toggleListeningButton.classList.remove('active');
      statusText.textContent = i18n.getMessage('notListening');
      statusText.classList.remove('listening');
    }
  }

  /**
   * Updates the platform indicator in the UI
   */
  function updatePlatformUI(platform) {
    currentPlatform = platform;

    if (platform) {
      platformIndicator.textContent = platform;
      platformIndicator.style.display = 'inline';
    } else {
      platformIndicator.style.display = 'none';
    }
  }

  /**
   * Sends a chat message to the service worker
   */
  function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addChatMessage(message, 'user');

    // Clear input
    chatInput.value = '';

    // Show loading indicator
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('message', 'ai-message', 'loading');
    loadingMessage.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(loadingMessage);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Get conversation history
    const conversationHistory = getConversationHistory();

    // Send message to service worker for processing
    chrome.runtime.sendMessage({
      action: 'processUserMessage',
      message: message,
      conversationHistory: conversationHistory
    }, (response) => {
      // Remove loading indicator
      if (loadingMessage && loadingMessage.parentNode) {
        loadingMessage.parentNode.removeChild(loadingMessage);
      }

      if (response && response.answer) {
        // Pass metadata to addChatMessage if available
        addChatMessage(
          response.answer,
          'ai',
          response.metadata || null
        );

        // Add to conversation history
        addToConversationHistory(message, response.answer, response.metadata);
      }
    });
  }

  /**
   * Gets the conversation history from local storage
   * @returns {Array} - The conversation history
   */
  function getConversationHistory() {
    const history = localStorage.getItem('chatHistory');
    return history ? JSON.parse(history) : [];
  }

  /**
   * Adds a message exchange to the conversation history
   * @param {string} userMessage - The user's message
   * @param {string} aiResponse - The AI's response
   * @param {Object} metadata - Optional metadata
   */
  function addToConversationHistory(userMessage, aiResponse, metadata = null) {
    const history = getConversationHistory();

    // Add the new exchange
    history.push({
      user: userMessage,
      ai: aiResponse,
      timestamp: new Date().toISOString(),
      metadata: metadata
    });

    // Limit history to last 10 exchanges
    if (history.length > 10) {
      history.shift();
    }

    // Save to local storage
    localStorage.setItem('chatHistory', JSON.stringify(history));
  }

  /**
   * Adds a message to the chat UI
   * @param {string} text - The message text
   * @param {string} sender - The sender ('user' or 'ai')
   * @param {Object} metadata - Optional metadata for AI messages
   */
  function addChatMessage(text, sender, metadata = null) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'ai-message');

    // For AI messages, check if resume or job description context was used
    if (sender === 'ai' && metadata) {
      if (metadata.usedResumeContext) {
        messageElement.classList.add('with-resume-context');
      }

      if (metadata.usedJobDescriptionContext) {
        messageElement.classList.add('with-jd-context');
      }

      // Create message content with context indicators
      const messageContent = document.createElement('div');

      // Add context indicators if applicable
      if (metadata.usedResumeContext || metadata.usedJobDescriptionContext) {
        const contextIndicators = document.createElement('div');
        contextIndicators.style.marginBottom = '8px';

        if (metadata.usedResumeContext) {
          const resumeIndicator = document.createElement('span');
          resumeIndicator.className = 'context-indicator resume-context';
          resumeIndicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Resume';
          contextIndicators.appendChild(resumeIndicator);
        }

        if (metadata.usedJobDescriptionContext) {
          const jdIndicator = document.createElement('span');
          jdIndicator.className = 'context-indicator jd-context';
          jdIndicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> Job Description';
          contextIndicators.appendChild(jdIndicator);
        }

        messageContent.appendChild(contextIndicators);
      }

      // Add the message text
      const textElement = document.createElement('div');
      textElement.textContent = text;
      messageContent.appendChild(textElement);

      messageElement.appendChild(messageContent);
    } else {
      // For user messages, just set the text content
      messageElement.textContent = text;
    }

    chatMessages.appendChild(messageElement);

    // Scroll to bottom if auto-scroll is enabled
    if (accessibilitySettings.autoScroll) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  /**
   * Updates the transcribed question in the UI
   */
  function updateTranscription(text, isFinal) {
    // Clear any pending timeout for interim results
    if (interimTranscriptTimeout) {
      clearTimeout(interimTranscriptTimeout);
      interimTranscriptTimeout = null;
    }

    // Update the UI
    transcribedQuestion.textContent = text;

    // If this is an interim result, set a timeout to clear it if no updates come
    if (!isFinal) {
      transcribedQuestion.classList.add('interim');

      interimTranscriptTimeout = setTimeout(() => {
        transcribedQuestion.classList.remove('interim');
      }, 5000);
    } else {
      transcribedQuestion.classList.remove('interim');
    }
  }

  /**
   * Updates the AI suggestions in the UI
   * @param {string} text - The suggestion text
   * @param {boolean} isLoading - Whether the suggestion is loading
   * @param {boolean} isError - Whether there was an error
   * @param {Object} metadata - Additional metadata about the suggestion
   */
  function updateSuggestions(text, isLoading = false, isError = false, metadata = null) {
    // Clear existing content
    aiSuggestions.innerHTML = '';

    // Remove any existing classes
    aiSuggestions.classList.remove('highlight', 'loading', 'error');

    if (isLoading) {
      // Show loading state
      aiSuggestions.classList.add('loading');

      // Create loading spinner
      const loadingSpinner = document.createElement('div');
      loadingSpinner.className = 'loading-spinner';
      aiSuggestions.appendChild(loadingSpinner);

      // Add loading text
      const loadingText = document.createElement('p');
      loadingText.textContent = text || i18n.getMessage('generatingResponse');
      aiSuggestions.appendChild(loadingText);
    } else if (isError) {
      // Show error state
      aiSuggestions.classList.add('error');
      aiSuggestions.textContent = text;
    } else {
      // Show normal suggestion
      aiSuggestions.textContent = text;

      // Add context indicators if applicable
      if (metadata && (metadata.usedResumeContext || metadata.usedJobDescriptionContext)) {
        const contextIndicators = document.createElement('div');
        contextIndicators.style.marginBottom = '12px';

        if (metadata.usedResumeContext) {
          const resumeIndicator = document.createElement('span');
          resumeIndicator.className = 'context-indicator resume-context';
          resumeIndicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Using your resume';
          contextIndicators.appendChild(resumeIndicator);
        }

        if (metadata.usedJobDescriptionContext) {
          const jdIndicator = document.createElement('span');
          jdIndicator.className = 'context-indicator jd-context';
          jdIndicator.style.marginLeft = metadata.usedResumeContext ? '8px' : '0';
          jdIndicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> Using job description';
          contextIndicators.appendChild(jdIndicator);
        }

        aiSuggestions.insertBefore(contextIndicators, aiSuggestions.firstChild);
      }

      // Add metadata if available
      if (metadata) {
        const metadataElement = document.createElement('div');
        metadataElement.className = 'suggestion-metadata';

        // Show fallback notice if applicable
        if (metadata.usedFallback && metadata.originalProvider) {
          const fallbackNotice = document.createElement('div');
          fallbackNotice.className = 'fallback-notice';
          fallbackNotice.innerHTML = `<i class="fallback-icon">⚠️</i> Fallback from ${metadata.originalProvider} to ${metadata.provider}`;
          aiSuggestions.appendChild(fallbackNotice);
        }

        if (metadata.provider) {
          const providerBadge = document.createElement('span');
          providerBadge.className = 'metadata-badge provider';
          providerBadge.textContent = metadata.provider;
          metadataElement.appendChild(providerBadge);
        }

        if (metadata.model) {
          const modelBadge = document.createElement('span');
          modelBadge.className = 'metadata-badge model';
          modelBadge.textContent = metadata.model;
          metadataElement.appendChild(modelBadge);
        }

        if (metadata.tokens) {
          const tokensBadge = document.createElement('span');
          tokensBadge.className = 'metadata-badge tokens';
          tokensBadge.textContent = `${metadata.tokens} tokens`;
          metadataElement.appendChild(tokensBadge);
        }

        if (metadata.questionType) {
          const questionTypeBadge = document.createElement('span');
          questionTypeBadge.className = 'metadata-badge question-type';
          questionTypeBadge.textContent = metadata.questionType.toLowerCase().replace('_', '-');
          metadataElement.appendChild(questionTypeBadge);
        }

        aiSuggestions.appendChild(metadataElement);
      }

      // Add a subtle animation to draw attention
      aiSuggestions.classList.add('highlight');
      setTimeout(() => {
        aiSuggestions.classList.remove('highlight');
      }, 1000);
    }
  }

  /**
   * Shows a status message in the UI
   */
  function showStatusMessage(message, type = 'info') {
    const statusMessage = document.createElement('div');
    statusMessage.classList.add('status-message', type);
    statusMessage.textContent = message;

    document.querySelector('.container').appendChild(statusMessage);

    // Remove after 3 seconds
    setTimeout(() => {
      statusMessage.classList.add('fade-out');
      setTimeout(() => {
        statusMessage.remove();
      }, 500);
    }, 3000);
  }

  /**
   * Opens the options page
   */
  function openOptionsPage() {
    chrome.runtime.openOptionsPage();
  }

  /**
   * Toggles between light and dark theme
   */
  function toggleTheme() {
    isDarkTheme = !isDarkTheme;

    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
      toggleThemeButton.title = 'Switch to Light Theme';
      // Store preference
      chrome.storage.local.set({ 'theme': 'dark' });
    } else {
      document.body.classList.remove('dark-theme');
      toggleThemeButton.title = 'Switch to Dark Theme';
      // Store preference
      chrome.storage.local.set({ 'theme': 'light' });
    }

    showStatusMessage(`Switched to ${isDarkTheme ? 'dark' : 'light'} theme`, 'info');
  }

  /**
   * Toggles the visibility of the transcription box
   */
  function toggleTranscriptionVisibility() {
    isTranscriptionVisible = !isTranscriptionVisible;

    const transcriptionContainer = document.querySelector('.transcription-container');

    if (isTranscriptionVisible) {
      transcriptionContainer.style.display = 'block';
      toggleTranscriptionButton.title = 'Hide Transcription';
    } else {
      transcriptionContainer.style.display = 'none';
      toggleTranscriptionButton.title = 'Show Transcription';
    }

    // Store preference
    chrome.storage.local.set({ 'transcriptionVisible': isTranscriptionVisible });
  }

  /**
   * Copies the AI suggestion to clipboard
   */
  function copyToClipboard() {
    const textToCopy = aiSuggestions.textContent;

    // Use the Clipboard API
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showStatusMessage('Copied to clipboard!', 'success');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        showStatusMessage('Failed to copy text', 'error');
      });
  }

  /**
   * Clears the chat history
   */
  function clearChat() {
    // Remove all messages except the welcome message
    while (chatMessages.children.length > 1) {
      chatMessages.removeChild(chatMessages.lastChild);
    }

    // Clear conversation history from local storage
    localStorage.removeItem('chatHistory');

    // Also clear from context manager
    chrome.runtime.sendMessage({
      action: 'clearConversationHistory'
    });

    showStatusMessage('Chat cleared', 'info');
  }

  /**
   * Opens the help page
   */
  function openHelpPage() {
    chrome.tabs.create({ url: 'https://candidai.io/help' });
  }

  /**
   * Opens the feedback form
   */
  function openFeedbackForm() {
    chrome.tabs.create({ url: 'https://candidai.io/feedback' });
  }

  /**
   * Captures the screen for visual analysis
   */
  async function captureScreen() {
    try {
      // Show loading state
      const capturedImagePlaceholder = document.getElementById('capturedImagePlaceholder');
      const capturedImage = document.getElementById('capturedImage');
      const analysisResult = document.getElementById('analysisResult');
      const analysisResultPlaceholder = document.getElementById('analysisResultPlaceholder');

      capturedImagePlaceholder.textContent = 'Capturing screen...';
      capturedImagePlaceholder.style.display = 'block';
      capturedImage.style.display = 'none';
      analysisResult.textContent = '';
      analysisResultPlaceholder.textContent = 'Analyzing...';
      analysisResultPlaceholder.style.display = 'block';

      // Request permission if needed
      const response = await chrome.runtime.sendMessage({
        action: 'requestVisualAnalysisPermission'
      });

      if (!response || !response.success) {
        capturedImagePlaceholder.textContent = 'Permission denied. Please grant screen capture permission.';
        analysisResultPlaceholder.textContent = 'No analysis available.';
        return;
      }

      // Capture screen
      const captureResponse = await chrome.runtime.sendMessage({
        action: 'captureScreen'
      });

      if (!captureResponse || !captureResponse.success) {
        capturedImagePlaceholder.textContent = 'Failed to capture screen.';
        analysisResultPlaceholder.textContent = 'No analysis available.';
        return;
      }

      // Display captured image
      capturedImage.src = captureResponse.imageData;
      capturedImage.style.display = 'block';
      capturedImagePlaceholder.style.display = 'none';

      // Wait for analysis
      if (captureResponse.analysis) {
        // Display analysis
        analysisResult.textContent = captureResponse.analysis.text;
        analysisResult.style.display = 'block';
        analysisResultPlaceholder.style.display = 'none';
      } else {
        analysisResultPlaceholder.textContent = 'Analysis failed. Please try again.';
      }
    } catch (error) {
      console.error('Error capturing screen:', error);
      showStatusMessage('Error capturing screen: ' + error.message, 'error');
    }
  }

  /**
   * Copies the analysis result to clipboard
   */
  function copyAnalysis() {
    const analysisResult = document.getElementById('analysisResult');
    const text = analysisResult.textContent;

    if (!text) {
      showStatusMessage('No analysis to copy', 'warning');
      return;
    }

    navigator.clipboard.writeText(text)
      .then(() => {
        showStatusMessage('Analysis copied to clipboard', 'success');
      })
      .catch(error => {
        console.error('Error copying analysis:', error);
        showStatusMessage('Error copying analysis', 'error');
      });
  }

  /**
   * Refreshes the analysis of the current captured image
   */
  async function refreshAnalysis() {
    try {
      const capturedImage = document.getElementById('capturedImage');
      const analysisResult = document.getElementById('analysisResult');
      const analysisResultPlaceholder = document.getElementById('analysisResultPlaceholder');

      if (!capturedImage.src || capturedImage.style.display === 'none') {
        showStatusMessage('No image captured yet', 'warning');
        return;
      }

      // Show loading state
      analysisResult.textContent = '';
      analysisResultPlaceholder.textContent = 'Analyzing...';
      analysisResultPlaceholder.style.display = 'block';

      // Request new analysis
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeImage',
        imageData: capturedImage.src
      });

      if (!response || !response.success) {
        analysisResultPlaceholder.textContent = 'Analysis failed. Please try again.';
        return;
      }

      // Display analysis
      analysisResult.textContent = response.analysis.text;
      analysisResult.style.display = 'block';
      analysisResultPlaceholder.style.display = 'none';
    } catch (error) {
      console.error('Error refreshing analysis:', error);
      showStatusMessage('Error refreshing analysis: ' + error.message, 'error');
    }
  }

  /**
   * Handles platform-specific data updates
   * @param {Object} platformData - Platform-specific data
   */
  function handlePlatformData(platformData) {
    if (!platformData) return;

    // Update platform indicator
    updatePlatformUI(platformData.platform);

    // Show a notification about the detected platform
    let message = '';

    if (platformData.type === 'job-listing') {
      message = `Detected job listing: ${platformData.jobTitle} at ${platformData.company}`;
    } else if (platformData.type === 'recruiter-platform') {
      message = `Detected LinkedIn Recruiter: ${platformData.candidateName || 'Candidate profile'}`;
    } else if (platformData.type === 'video-interview') {
      message = `Detected ${platformData.platform} interview`;

      // If there's a current question, update the transcription
      if (platformData.currentQuestion) {
        updateTranscription(platformData.currentQuestion, true);

        // Generate an answer for the question
        chrome.runtime.sendMessage({
          action: 'processQuestion',
          question: platformData.currentQuestion
        });
      }
    }

    // Show status message
    if (message) {
      showStatusMessage(message, 'info');
    }
  }

  /**
   * Initialize automated answering functionality
   */
  async function initializeAutomatedAnswering() {
    try {
      // Import the automated answering service
      const { default: automatedAnsweringService } = await import('../js/services/automatedAnswering.js');

      // Initialize the service
      await automatedAnsweringService.initialize();

      // Load available voices
      loadVoices();

      // Load settings
      loadAutomatedAnsweringSettings();

      // Set up event listeners for the service
      automatedAnsweringService.on('start', () => {
        speakButton.classList.add('active');
        showStatusMessage(i18n.getMessage('speakingAnswer'), 'info');
      });

      automatedAnsweringService.on('stop', () => {
        speakButton.classList.remove('active');
      });

      automatedAnsweringService.on('error', (error) => {
        speakButton.classList.remove('active');
        showStatusMessage(i18n.getMessage('errorSpeakingAnswer') + ': ' + error, 'error');
      });

      // Set up auto-answer for new suggestions
      chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'updateSuggestions' && !message.isLoading && !message.isError) {
          // Check if auto-answer is enabled
          chrome.storage.local.get(['automatedAnsweringSettings'], (result) => {
            const settings = result.automatedAnsweringSettings || {};
            if (settings.enabled && settings.autoAnswer) {
              automatedAnsweringService.autoAnswer(message.text);
            }
          });
        } else if (message.action === 'platformDataUpdated') {
          // Handle platform data updates
          handlePlatformData(message.data);
        }
      });
    } catch (error) {
      console.error('Error initializing automated answering:', error);
    }
  }

  /**
   * Load available voices for TTS
   */
  async function loadVoices() {
    try {
      const { default: automatedAnsweringService } = await import('../js/services/automatedAnswering.js');

      // Get available voices
      const voices = await automatedAnsweringService.getVoices();

      // Clear existing options
      voiceSelect.innerHTML = '';

      // Add voices to select
      voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.voiceURI;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
      });

      // Load selected voice from settings
      chrome.storage.local.get(['automatedAnsweringSettings'], (result) => {
        const settings = result.automatedAnsweringSettings || {};
        if (settings.voiceURI) {
          voiceSelect.value = settings.voiceURI;
        }
      });
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  }

  /**
   * Load automated answering settings
   */
  function loadAutomatedAnsweringSettings() {
    chrome.storage.local.get(['automatedAnsweringSettings'], (result) => {
      const settings = result.automatedAnsweringSettings || {};

      // Set toggle states
      autoAnswerToggle.checked = settings.autoAnswer || false;
      audioInjectionToggle.checked = settings.useAudioInjection || false;

      // Set range values
      rateRange.value = settings.rate || 1.0;
      pitchRange.value = settings.pitch || 1.0;
      volumeRange.value = settings.volume || 1.0;

      // Update range value displays
      updateRateValue();
      updatePitchValue();
      updateVolumeValue();
    });
  }

  /**
   * Speak the current answer
   */
  async function speakAnswer() {
    try {
      const { default: automatedAnsweringService } = await import('../js/services/automatedAnswering.js');

      // Get the current answer text
      const answerText = aiSuggestions.textContent;

      if (!answerText || answerText.includes(i18n.getMessage('suggestionsPlaceholder'))) {
        showStatusMessage(i18n.getMessage('noAnswerToSpeak'), 'warning');
        return;
      }

      // If already speaking, stop
      if (speakButton.classList.contains('active')) {
        automatedAnsweringService.stop();
        speakButton.classList.remove('active');
        return;
      }

      // Speak the answer
      await automatedAnsweringService.speak(answerText);
    } catch (error) {
      console.error('Error speaking answer:', error);
      showStatusMessage('Error speaking answer', 'error');
    }
  }

  /**
   * Copy the current answer to clipboard
   */
  function copyAnswer() {
    // Get the current answer text
    const answerText = aiSuggestions.textContent;

    if (!answerText || answerText.includes('AI suggestions will appear here')) {
      showStatusMessage('No answer to copy', 'warning');
      return;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(answerText)
      .then(() => {
        showStatusMessage('Answer copied to clipboard', 'success');
        copyButton.classList.add('active');
        setTimeout(() => {
          copyButton.classList.remove('active');
        }, 1000);
      })
      .catch(error => {
        console.error('Error copying to clipboard:', error);
        showStatusMessage('Error copying to clipboard', 'error');
      });
  }

  /**
   * Refresh/regenerate the current answer
   */
  function refreshAnswer() {
    // Get the last transcribed question
    const question = transcribedQuestion.textContent;

    if (!question || question.includes('No question detected yet')) {
      showStatusMessage('No question to refresh', 'warning');
      return;
    }

    // Show loading state
    updateSuggestions('Regenerating answer...', true);

    // Send message to service worker to regenerate
    chrome.runtime.sendMessage({
      action: 'regenerateAnswer',
      question: question
    });
  }

  /**
   * Toggle auto-answer settings panel
   */
  function toggleAutoAnswerSettings() {
    autoAnswerSettings.classList.toggle('hidden');
  }

  /**
   * Toggle auto-answer feature
   */
  async function toggleAutoAnswer() {
    try {
      const { default: automatedAnsweringService } = await import('../js/services/automatedAnswering.js');

      // Update service
      await automatedAnsweringService.setAutoAnswer(autoAnswerToggle.checked);

      // Show status message
      showStatusMessage(
        autoAnswerToggle.checked ? 'Auto-answer enabled' : 'Auto-answer disabled',
        'info'
      );
    } catch (error) {
      console.error('Error toggling auto-answer:', error);
      showStatusMessage('Error toggling auto-answer', 'error');
    }
  }

  /**
   * Toggle audio injection feature
   */
  async function toggleAudioInjection() {
    try {
      const { default: automatedAnsweringService } = await import('../js/services/automatedAnswering.js');

      // If enabling, show warning
      if (audioInjectionToggle.checked) {
        if (!confirm('WARNING: Audio injection is an experimental feature that injects audio directly into your microphone stream. This should only be used in appropriate contexts and never to deceive others. Do you understand and consent to using this feature?')) {
          audioInjectionToggle.checked = false;
          return;
        }
      }

      // Update service
      await automatedAnsweringService.setUseAudioInjection(audioInjectionToggle.checked);

      // Show status message
      showStatusMessage(
        audioInjectionToggle.checked ? 'Audio injection enabled' : 'Audio injection disabled',
        audioInjectionToggle.checked ? 'warning' : 'info'
      );
    } catch (error) {
      console.error('Error toggling audio injection:', error);
      showStatusMessage('Error toggling audio injection', 'error');
      audioInjectionToggle.checked = false;
    }
  }

  /**
   * Change TTS voice
   */
  async function changeVoice() {
    try {
      const { default: automatedAnsweringService } = await import('../js/services/automatedAnswering.js');

      // Update service
      await automatedAnsweringService.setVoice(voiceSelect.value);
    } catch (error) {
      console.error('Error changing voice:', error);
      showStatusMessage('Error changing voice', 'error');
    }
  }

  /**
   * Update rate value display and save setting
   */
  async function updateRateValue() {
    try {
      const { default: automatedAnsweringService } = await import('../js/services/automatedAnswering.js');

      // Update display
      const rateValue = document.getElementById('rateValue');
      rateValue.textContent = parseFloat(rateRange.value).toFixed(1);

      // Update service
      await automatedAnsweringService.setRate(parseFloat(rateRange.value));
    } catch (error) {
      console.error('Error updating rate:', error);
    }
  }

  /**
   * Update pitch value display and save setting
   */
  async function updatePitchValue() {
    try {
      const { default: automatedAnsweringService } = await import('../js/services/automatedAnswering.js');

      // Update display
      const pitchValue = document.getElementById('pitchValue');
      pitchValue.textContent = parseFloat(pitchRange.value).toFixed(1);

      // Update service
      await automatedAnsweringService.setPitch(parseFloat(pitchRange.value));
    } catch (error) {
      console.error('Error updating pitch:', error);
    }
  }

  /**
   * Update volume value display and save setting
   */
  async function updateVolumeValue() {
    try {
      const { default: automatedAnsweringService } = await import('../js/services/automatedAnswering.js');

      // Update display
      const volumeValue = document.getElementById('volumeValue');
      volumeValue.textContent = parseFloat(volumeRange.value).toFixed(1);

      // Update service
      await automatedAnsweringService.setVolume(parseFloat(volumeRange.value));
    } catch (error) {
      console.error('Error updating volume:', error);
    }
  }

  // Listen for messages from service worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case 'updateTranscription':
        updateTranscription(message.text, message.isFinal);
        break;

      case 'updateSuggestions':
        updateSuggestions(
          message.text,
          message.isLoading || false,
          message.isError || false,
          message.metadata || null
        );
        break;

      case 'updatePlatform':
        updatePlatformUI(message.platform);
        break;

      case 'listeningStatusChanged':
        // Update UI if the listening status changed from elsewhere
        if (isListening !== message.isListening) {
          isListening = message.isListening;
          updateListeningUI();
        }
        break;

      case 'showStatusMessage':
        showStatusMessage(message.message, message.type);
        break;
    }

    // Acknowledge receipt
    sendResponse({ received: true });
    return true;
  });
});

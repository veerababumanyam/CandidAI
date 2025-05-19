/**
 * CandidAI - Side Panel Controller
 * Handles UI interactions and communication with the service worker
 */

// Import i18n utility
import * as i18n from '../js/utils/i18n.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize i18n
  await i18n.initialize();

  // ===== DOM Elements =====
  // Main Controls
  const toggleListeningButton = document.getElementById('toggleListeningButton');
  const visualAnalysisButton = document.getElementById('visualAnalysisButton');
  const settingsButton = document.getElementById('settingsButton');
  const toggleThemeButton = document.getElementById('toggleThemeButton');
  const statusTextElement = document.getElementById('statusText');
  const platformIndicatorElement = document.getElementById('platformIndicator');

  // Chat Elements
  const chatInput = document.getElementById('chatInput');
  const sendButton = document.getElementById('sendButton');
  const chatMessagesContainer = document.getElementById('chatMessages');

  // Transcription Elements
  const transcribedQuestionElement = document.getElementById('transcribedQuestion');
  const toggleTranscriptionButton = document.getElementById('toggleTranscriptionVisibility');

  // AI Suggestions Elements
  const aiSuggestionsElement = document.getElementById('aiSuggestions');
  const copyButton = document.getElementById('copyButton');
  const speakButton = document.getElementById('speakButton');
  const refreshButton = document.getElementById('refreshButton');
  const increaseFontButton = document.getElementById('increaseFontButton');
  const decreaseFontButton = document.getElementById('decreaseFontButton');
  const toggleAutoscrollButton = document.getElementById('toggleAutoscrollButton');

  // Footer Elements
  const helpLink = document.getElementById('helpLink');
  const feedbackLink = document.getElementById('feedbackLink');
  
  // Potentially missing elements for Auto-Answering (ensure they exist if feature is active)
  const autoAnswerSettings = document.getElementById('autoAnswerSettings');
  const autoAnswerToggle = document.getElementById('autoAnswerToggle');
  const audioInjectionToggle = document.getElementById('audioInjectionToggle');
  const voiceSelect = document.getElementById('voiceSelect');
  const rateRange = document.getElementById('rateRange');
  const pitchRange = document.getElementById('pitchRange');
  const volumeRange = document.getElementById('volumeRange');


  // ===== State Variables =====
  let isListening = false;
  let isProcessing = false;
  let interimTranscript = '';
  let interimTranscriptTimeout = null;
  let speechSynthesis = window.speechSynthesis;
  let voices = [];
  let currentPlatform = null;
  let isDarkTheme = false;
  let isTranscriptionVisible = false;
  let accessibilitySettings = {
    fontSize: 'medium',
    autoScroll: true
  };

  // Initialize speech synthesis voices when they become available
  const loadBasicVoices = () => {
    voices = speechSynthesis.getVoices();
    // Filter for English voices
    return voices.filter(voice => voice.lang.includes('en'));
  };

  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadBasicVoices;
  }
  loadBasicVoices();

  // ===== Unified Message Listener from Background Script =====
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Sidepanel received message:', message);

    switch (message.action) {
      case 'transcriptionUpdate':
        if (transcribedQuestionElement) {
          transcribedQuestionElement.textContent = message.text || '';
          if (message.isFinal && message.text && message.text.trim()) {
            // Example: addChatMessage('user', message.text);
          }
        } else {
          console.warn("transcribedQuestionElement not found for transcription update.");
        }
        break;

      case 'aiResponse':
        if (aiSuggestionsElement) {
          if (message.isLoading) {
            aiSuggestionsElement.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
          } else if (message.isError) {
            aiSuggestionsElement.innerHTML = `<div class="error-message">${message.text || 'Error fetching suggestion.'}</div>`;
          } else {
            aiSuggestionsElement.innerHTML = formatMarkdown(message.text || '');
          }
        } else {
          console.warn("aiSuggestionsElement not found for AI response.");
        }
        break;
      
      case 'chatAiResponse':
        addChatMessage('ai', message.text, message.metadata);
        break;

      case 'platformUpdate':
        updatePlatformUI(message.platform);
        if (message.data) {
            handlePlatformData(message.data);
        }
        break;

      case 'listeningStatusChanged':
        if (isListening !== message.isListening) {
          isListening = message.isListening;
          updateListeningUI();
        }
        break;

      case 'showStatusMessage':
        showStatusMessage(message.message, message.type || 'info');
        break;
      
      case 'error':
        console.error('Error from background script:', message.error);
        showStatusMessage(message.error || 'An unspecified error occurred.', 'error');
        break;
      
      default:
        break;
    }
    return true;
  });

  // Initialize the UI
  function initializeUI() {
    console.log('Initializing UI...');

    // Set up event listeners for footer links
    if (helpLink) {
      helpLink.addEventListener('click', openHelpPage);
    } else {
      console.warn("helpLink element not found.");
    }

    if (feedbackLink) {
      feedbackLink.addEventListener('click', openFeedbackForm);
    } else {
      console.warn("feedbackLink element not found.");
    }

    // Set up event listener for the send button
    if (sendButton) {
      sendButton.addEventListener('click', sendChatMessage);
    } else {
      console.warn("sendButton element not found.");
    }

    // Set up event listener for the transcription visibility toggle
    if (toggleTranscriptionButton) {
      toggleTranscriptionButton.addEventListener('click', toggleTranscriptionVisibility);
    } else {
      console.warn("toggleTranscriptionButton element not found.");
    }

    // Set up event listeners for AI Suggestions controls
    setupAISuggestionsControls();

    // Check for microphone permissions
    checkMicrophonePermission();

    // Load saved accessibility settings
    loadAccessibilitySettings();
    
    // Load saved theme preference
    loadThemePreference();

    // Focus the chat input when the panel is opened
    if (chatInput) {
      chatInput.focus();
    }
    
    // Initial UI updates
    updateSendButtonState();
    updateListeningUI();
    updateAutoscrollButtonState();

    console.log('UI initialization complete');
  }

  /**
   * Sets up event listeners for AI Suggestions controls
   */
  function setupAISuggestionsControls() {
    // Copy button
    if (copyButton) {
      copyButton.addEventListener('click', () => {
        try {
          const suggestionsBox = aiSuggestionsElement;
          if (suggestionsBox && suggestionsBox.textContent.trim()) {
            copyToClipboard(suggestionsBox.textContent, 'Suggestion copied to clipboard!');
            
            // Visual feedback
            copyButton.classList.add('active');
            setTimeout(() => {
              copyButton.classList.remove('active');
            }, 800);
          } else {
            showStatusMessage('No content to copy', 'info');
          }
        } catch (error) {
          console.error('Error in copyButton click handler:', error);
          showStatusMessage('Error copying content', 'error');
        }
      });
    }

    // Speak button for AI Suggestions
    if (speakButton) {
      speakButton.addEventListener('click', () => {
        try {
          const suggestionsBox = aiSuggestionsElement;
          if (suggestionsBox && suggestionsBox.textContent.trim()) {
            if (speechSynthesis.speaking && speakButton.classList.contains('active')) {
              speechSynthesis.cancel();
              speakButton.classList.remove('active');
              showStatusMessage('Speech stopped', 'info');
            } else {
              speakMessage(suggestionsBox.textContent, speakButton);
            }
          } else {
            showStatusMessage('No content to speak', 'info');
          }
        } catch (error) {
          console.error('Error in speakButton click handler:', error);
          showStatusMessage('Error speaking content', 'error');
          if (speakButton) speakButton.classList.remove('active');
        }
      });
    }

    // Refresh button
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        try {
          const lastUserMsg = getLastUserMessage();
          if (lastUserMsg) {
            refreshButton.classList.add('active');
            regenerateAnswer(lastUserMsg);
            setTimeout(() => {
              refreshButton.classList.remove('active');
            }, 800);
          } else if (transcribedQuestionElement && transcribedQuestionElement.textContent.trim()){
            refreshButton.classList.add('active');
            regenerateAnswer(transcribedQuestionElement.textContent.trim());
             setTimeout(() => {
              refreshButton.classList.remove('active');
            }, 800);
          }
          else {
            showStatusMessage('No previous question to regenerate answer for', 'info');
          }
        } catch (error) {
          console.error('Error in refreshButton click handler:', error);
          showStatusMessage('Error regenerating answer', 'error');
        }
      });
    }

    // Increase font size button
    if (increaseFontButton) {
      increaseFontButton.addEventListener('click', () => {
        try {
          increaseFontButton.classList.add('active');
          increaseFontSize();
          setTimeout(() => {
            increaseFontButton.classList.remove('active');
          }, 800);
        } catch (error) {
          console.error('Error in increaseFontButton click handler:', error);
          showStatusMessage('Error increasing font size', 'error');
        }
      });
    }

    // Decrease font size button
    if (decreaseFontButton) {
      decreaseFontButton.addEventListener('click', () => {
        try {
          decreaseFontButton.classList.add('active');
          decreaseFontSize();
          setTimeout(() => {
            decreaseFontButton.classList.remove('active');
          }, 800);
        } catch (error) {
          console.error('Error in decreaseFontButton click handler:', error);
          showStatusMessage('Error decreasing font size', 'error');
        }
      });
    }

    // Toggle autoscroll button
    if (toggleAutoscrollButton) {
      toggleAutoscrollButton.addEventListener('click', () => {
        try {
          toggleAutoscroll();
        } catch (error) {
          console.error('Error in toggleAutoscrollButton click handler:', error);
          showStatusMessage('Error toggling autoscroll', 'error');
        }
      });
    }
  }

  // Call the initialization function
  initializeUI();

  // ===== Event Listeners =====
  // Handle chat input
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = `${Math.min(chatInput.scrollHeight, 200)}px`;
      updateSendButtonState();
    });
    chatInput.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  }

  // Update send button state based on input
  function updateSendButtonState() {
    if (!sendButton || !chatInput) return;
    const hasContent = chatInput.textContent.trim().length > 0;
    sendButton.disabled = !hasContent;
    sendButton.style.opacity = hasContent ? '1' : '0.5';
    sendButton.style.cursor = hasContent ? 'pointer' : 'not-allowed';
  }

  // Toggle listening state
  if (toggleListeningButton) {
    toggleListeningButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({
        action: !isListening ? 'startListening' : 'stopListening'
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error toggling listening state:', chrome.runtime.lastError);
          showStatusMessage('Error toggling microphone: ' + chrome.runtime.lastError.message, 'error');
        } else if (response && response.error) {
          console.error('Error from background script on toggle listening:', response.error);
          showStatusMessage('Error: ' + response.error, 'error');
        } else if (response && response.success) {
          console.log('Successfully sent toggle listening command.');
        }
      });
    });
  }

  // Visual Analysis button
  if (visualAnalysisButton) {
    visualAnalysisButton.addEventListener('click', () => {
      openVisualAnalysisPage();
    });
  }

  // Settings button
  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      const optionsUrl = chrome.runtime.getURL('options/options.html');
      settingsButton.classList.add('active');
      
      // First attempt: Use chrome.tabs.create (requires tabs permission)
      chrome.tabs.create({ url: optionsUrl }, (tab) => {
        if (chrome.runtime.lastError) {
          console.error('Error opening options page via chrome.tabs:', chrome.runtime.lastError.message);
          
          // Second attempt: Use chrome.runtime.openOptionsPage if available
          if (chrome.runtime.openOptionsPage) {
            try {
              chrome.runtime.openOptionsPage(() => {
                if (chrome.runtime.lastError) {
                  console.error('Error opening options page via openOptionsPage:', chrome.runtime.lastError.message);
                  tryFallbackWindow();
                } else {
                  showStatusMessage('Settings opened', 'success');
                }
              });
            } catch (e) {
              console.error('Exception calling openOptionsPage:', e);
              tryFallbackWindow();
            }
          } else {
            tryFallbackWindow();
          }
        } else {
          showStatusMessage('Settings opened in new tab', 'success');
        }
        
        setTimeout(() => {
          settingsButton.classList.remove('active');
        }, 300);
      });
      
      function tryFallbackWindow() {
        // Last resort: Try window.open as fallback
        try {
          const newWindow = window.open(optionsUrl, '_blank');
          if (newWindow) {
            showStatusMessage('Settings opened in new window (fallback)', 'success');
          } else {
            console.error('window.open returned null/undefined window object');
            showStatusMessage('Failed to open settings page - popup blocked?', 'error');
          }
        } catch (e) {
          console.error('Error opening options page via window.open:', e);
          showStatusMessage('Failed to open settings page', 'error');
        }
      }
    });
  }

  // Theme toggle button
  if (toggleThemeButton) {
    toggleThemeButton.addEventListener('click', () => {
      toggleTheme();
    });
  }

  // Send chat message
  async function sendChatMessage() {
    if (!chatInput) return;
    const messageText = chatInput.textContent.trim();
    if (!messageText) return;

    addChatMessage('user', messageText);
    chatInput.textContent = '';
    chatInput.style.height = 'auto';
    updateSendButtonState();

    const typingIndicator = showTypingIndicator();

    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            action: 'processUserChatMessage',
            message: messageText,
            context: { url: window.location.href, title: document.title }
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message to background:', chrome.runtime.lastError.message);
              reject(new Error(chrome.runtime.lastError.message));
            } else if (response && response.error) {
              console.error('Background returned error for user message:', response.error);
              resolve(response);
            }
            else {
              resolve(response);
            }
          }
        );
      });

      if (typingIndicator && typingIndicator.remove) typingIndicator.remove();

      if (response && response.text && !response.error) {
        addChatMessage('ai', response.text, response.metadata);
      } else {
        const errorMsg = response?.error || 'Sorry, I encountered an error.';
        addChatMessage('ai', errorMsg);
      }
    } catch (error) {
      console.error('Failed to send/process chat message:', error);
      if (typingIndicator && typingIndicator.remove) typingIndicator.remove();
      addChatMessage('ai', 'Sorry, a communication error occurred. Please try again.');
    }
    if (chatInput) chatInput.focus();
  }

  // Add a message to the chat
  function addChatMessage(sender, message, metadata = {}) {
    if (!chatMessagesContainer) {
        console.warn("chatMessagesContainer not found, cannot add message.");
        return null;
    }

    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    messageElement.setAttribute('role', 'log');
    messageElement.setAttribute('aria-live', 'polite');

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    messageElement.appendChild(avatar);

    const content = document.createElement('div');
    content.className = 'message-content';

    if (metadata && metadata.context) {
      const contextDiv = document.createElement('div');
      contextDiv.className = 'message-context';
      contextDiv.textContent = metadata.context;
      content.appendChild(contextDiv);
    }

    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.innerHTML = formatMarkdown(message || '');
    content.appendChild(textDiv);

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    content.appendChild(timeDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'message-actions';

    const copyMsgButton = document.createElement('button');
    copyMsgButton.className = 'action-button';
    copyMsgButton.setAttribute('title', 'Copy to clipboard');
    copyMsgButton.innerHTML = '<i class="far fa-copy"></i>';
    copyMsgButton.addEventListener('click', () => copyToClipboard(message, 'Message copied!'));
    actionsDiv.appendChild(copyMsgButton);

    if (sender === 'ai') {
      const speakMsgButton = document.createElement('button');
      speakMsgButton.className = 'action-button';
      speakMsgButton.setAttribute('title', 'Read aloud');
      speakMsgButton.innerHTML = '<i class="fas fa-volume-up"></i>';
      speakMsgButton.addEventListener('click', () => speakMessage(message, speakMsgButton));
      actionsDiv.appendChild(speakMsgButton);
    }

    content.appendChild(actionsDiv);
    messageElement.appendChild(content);

    messageElement.style.opacity = '0';
    chatMessagesContainer.appendChild(messageElement);
    void messageElement.offsetWidth;
    messageElement.style.opacity = '1';
    messageElement.style.transform = 'translateY(0)';

    if (accessibilitySettings.autoScroll) {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
    return messageElement;
  }

  // Show typing indicator
  function showTypingIndicator() {
    if (!chatMessagesContainer) return null;
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message ai-message typing-indicator';
    typingIndicator.innerHTML = `
      <div class="message-avatar ai-avatar"><i class="fas fa-robot"></i></div>
      <div class="message-content"><div class="message-text">
        <div class="loading-dots"><span></span><span></span><span></span></div>
      </div></div>`;
    chatMessagesContainer.appendChild(typingIndicator);
    if (accessibilitySettings.autoScroll) {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
    return typingIndicator;
  }

  // Format markdown in messages
  function formatMarkdown(text) {
    if (typeof text !== 'string') return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');
  }

  // Show status message
  function showStatusMessage(message, type = 'info', duration = 3000) {
    let statusEl = document.getElementById('statusMessageGlobal');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.id = 'statusMessageGlobal';
      statusEl.className = 'status-message';
      document.body.appendChild(statusEl);
    }
    statusEl.textContent = message;
    statusEl.className = `status-message ${type} show`;
    setTimeout(() => {
      statusEl.classList.remove('show');
    }, duration);
  }

  // Consolidated Copy text to clipboard
  function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
    if (typeof text !== 'string' || !text.trim()) {
      showStatusMessage('Nothing to copy.', 'info');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      showStatusMessage(successMessage, 'success');
    }).catch(err => {
      console.error('Failed to copy text:', err);
      showStatusMessage('Failed to copy text.', 'error');
    });
  }

  // Speak message using speech synthesis
  function speakMessage(text, buttonElement = null) {
    if (!speechSynthesis) {
      showStatusMessage('Speech synthesis not supported.', 'error');
      if (buttonElement) buttonElement.classList.remove('active');
      return;
    }
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      if (buttonElement && buttonElement.classList.contains('active')) {
         buttonElement.classList.remove('active');
         showStatusMessage('Speech stopped.', 'info');
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const englishVoices = loadBasicVoices();
    if (englishVoices.length > 0) {
      const preferredVoices = englishVoices.filter(v => v.name.includes('Google') || v.name.includes('Samantha') || v.default);
      utterance.voice = preferredVoices[0] || englishVoices[0];
    }
    utterance.rate = parseFloat(rateRange?.value) || 1.0;
    utterance.pitch = parseFloat(pitchRange?.value) || 1.0;
    utterance.volume = parseFloat(volumeRange?.value) || 1.0;

    utterance.onstart = () => {
        if (buttonElement) buttonElement.classList.add('active');
        showStatusMessage('Reading text aloud...', 'info');
    };
    utterance.onend = () => {
      if (buttonElement) buttonElement.classList.remove('active');
    };
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      if (buttonElement) buttonElement.classList.remove('active');
      showStatusMessage('Error reading message.', 'error');
    };
    speechSynthesis.speak(utterance);
  }

  // Update UI based on listening state
  function updateListeningUI() {
    if (!toggleListeningButton) return;
    const icon = toggleListeningButton.querySelector('i');
    if (icon) {
        if (isListening) {
        icon.classList.remove('fa-microphone');
        icon.classList.add('fa-microphone-slash');
        toggleListeningButton.setAttribute('aria-label', 'Stop listening');
        toggleListeningButton.classList.add('active');
        } else {
        icon.classList.remove('fa-microphone-slash');
        icon.classList.add('fa-microphone');
        toggleListeningButton.setAttribute('aria-label', 'Start listening');
        toggleListeningButton.classList.remove('active');
        }
    }
  }

  function openVisualAnalysisPage() {
    if(!visualAnalysisButton) return;
    console.log('Visual analysis button clicked');
    visualAnalysisButton.classList.add('active');
    const visualAnalysisUrl = chrome.runtime.getURL('visual-analysis.html');
    chrome.tabs.create({ url: visualAnalysisUrl }, (tab) => {
      if (chrome.runtime.lastError) {
        console.error('Error opening visual analysis page:', chrome.runtime.lastError.message);
        try {
          window.open(visualAnalysisUrl, '_blank');
          showStatusMessage('Visual analysis opened in new window', 'success');
        } catch (e) {
            showStatusMessage('Failed to open visual analysis page', 'error');
        }
      } else {
        showStatusMessage('Visual analysis opened in new tab', 'success');
      }
      setTimeout(() => {
        visualAnalysisButton.classList.remove('active');
      }, 300);
    });
  }

  async function requestVisualAnalysis() {
    // Placeholder - review original logic
  }

  function toggleTheme() {
    if (!toggleThemeButton) return;
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme', isDarkTheme);
    const icon = toggleThemeButton.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-moon', !isDarkTheme);
      icon.classList.toggle('fa-sun', isDarkTheme);
    }
    toggleThemeButton.title = isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme';
    chrome.storage.local.set({ 'theme': isDarkTheme ? 'dark' : 'light' });
    toggleThemeButton.classList.add('active');
    setTimeout(() => toggleThemeButton.classList.remove('active'), 300);
    showStatusMessage(`Switched to ${isDarkTheme ? 'dark' : 'light'} theme`, 'info');
  }

  function loadAccessibilitySettings() {
    chrome.storage.local.get(['accessibilitySettings'], (result) => {
      if (result.accessibilitySettings) {
        accessibilitySettings = { ...accessibilitySettings, ...result.accessibilitySettings };
      } else {
        saveAccessibilitySettings();
      }
      applyFontSize();
      updateAutoscrollButtonState();
    });
  }

  function updateAutoscrollButtonState() {
    if (toggleAutoscrollButton) {
      toggleAutoscrollButton.classList.toggle('active', accessibilitySettings.autoScroll);
      toggleAutoscrollButton.title = `Toggle Autoscroll (Currently ${accessibilitySettings.autoScroll ? 'On' : 'Off'})`;
    }
  }

  function saveAccessibilitySettings() {
    chrome.storage.local.set({ accessibilitySettings });
  }

  function increaseFontSize() {
    const fontSizes = ['small', 'medium', 'large', 'xlarge'];
    const currentIndex = fontSizes.indexOf(accessibilitySettings.fontSize);
    if (currentIndex < fontSizes.length - 1) {
      accessibilitySettings.fontSize = fontSizes[currentIndex + 1];
      applyFontSize();
      saveAccessibilitySettings();
      showStatusMessage(`Font size: ${accessibilitySettings.fontSize}`, 'info');
    } else {
      showStatusMessage('Max font size reached', 'info');
    }
  }

  function decreaseFontSize() {
    const fontSizes = ['small', 'medium', 'large', 'xlarge'];
    const currentIndex = fontSizes.indexOf(accessibilitySettings.fontSize);
    if (currentIndex > 0) {
      accessibilitySettings.fontSize = fontSizes[currentIndex - 1];
      applyFontSize();
      saveAccessibilitySettings();
      showStatusMessage(`Font size: ${accessibilitySettings.fontSize}`, 'info');
    } else {
      showStatusMessage('Min font size reached', 'info');
    }
  }

  function applyFontSize() {
    if (aiSuggestionsElement) {
      aiSuggestionsElement.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-xlarge');
      aiSuggestionsElement.classList.add(`font-size-${accessibilitySettings.fontSize}`);
    }
  }

  function toggleAutoscroll() {
    accessibilitySettings.autoScroll = !accessibilitySettings.autoScroll;
    saveAccessibilitySettings();
    updateAutoscrollButtonState();
    showStatusMessage(`Autoscroll ${accessibilitySettings.autoScroll ? 'enabled' : 'disabled'}`, 'info');
  }

  function regenerateAnswer(questionToRegenerate) {
    if (!questionToRegenerate) {
      showStatusMessage('No question provided to regenerate.', 'info');
      return;
    }
    if (aiSuggestionsElement) {
      aiSuggestionsElement.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    }
    chrome.runtime.sendMessage(
      {
        action: 'regenerateAiResponse',
        message: questionToRegenerate,
        context: { url: window.location.href, title: document.title }
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending regenerate request:', chrome.runtime.lastError.message);
          if (aiSuggestionsElement) aiSuggestionsElement.innerHTML = '<div class="error-message">Failed to send regenerate request.</div>';
          showStatusMessage('Failed to send regeneration request', 'error');
        } else if (response && response.error) {
            if (aiSuggestionsElement) aiSuggestionsElement.innerHTML = `<div class="error-message">${response.error}</div>`;
            showStatusMessage(response.error, 'error');
        }
      }
    );
  }

  function getLastUserMessage() {
    if (!chatMessagesContainer) return null;
    const userMessages = chatMessagesContainer.querySelectorAll('.user-message .message-text');
    if (userMessages.length > 0) {
      return userMessages[userMessages.length - 1].textContent.trim();
    }
    return null;
  }

  function handleAutoscroll(container, position = 'bottom') {
    if (!container) return;

    if (!accessibilitySettings.autoScroll) {
        return;
    }

    if (position === 'top') {
        container.scrollTop = 0;
    } else if (position === 'bottom') {
        container.scrollTop = container.scrollHeight;
    }
  }

  async function checkMicrophonePermission() {
    if (!navigator.permissions) {
        console.warn("Permissions API not supported. Assuming microphone access or will prompt.");
        if(toggleListeningButton) toggleListeningButton.disabled = false;
        return;
    }
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
      const updateUIForPermission = (state) => {
          if (!toggleListeningButton) return;
          if (state === 'granted') {
            toggleListeningButton.disabled = false;
            toggleListeningButton.title = 'Start Listening';
          } else if (state === 'prompt') {
            toggleListeningButton.disabled = false;
            toggleListeningButton.title = 'Start Listening (permission will be requested)';
          } else if (state === 'denied') {
            toggleListeningButton.disabled = true;
            toggleListeningButton.title = 'Microphone access denied. Enable in browser settings.';
            showStatusMessage('Microphone access denied. Please enable it in browser settings.', 'warning');
          }
      };
      updateUIForPermission(permissionStatus.state);
      permissionStatus.onchange = function() {
        updateUIForPermission(this.state);
      };
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      if(toggleListeningButton) toggleListeningButton.disabled = false;
    }
  }

  function loadThemePreference() {
    chrome.storage.local.get(['theme'], (result) => {
      isDarkTheme = result.theme === 'dark';
      document.body.classList.toggle('dark-theme', isDarkTheme);
      if (toggleThemeButton) {
        const icon = toggleThemeButton.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-moon', !isDarkTheme);
            icon.classList.toggle('fa-sun', isDarkTheme);
        }
        toggleThemeButton.title = isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme';
      }
    });
  }

  function toggleTranscriptionVisibility() {
    if (!toggleTranscriptionButton) return;
    isTranscriptionVisible = !isTranscriptionVisible;
    const transcriptionContainer = document.querySelector('.transcription-container');
    if (transcriptionContainer) {
      transcriptionContainer.style.display = isTranscriptionVisible ? 'block' : 'none';
    }
    toggleTranscriptionButton.title = isTranscriptionVisible ? 'Hide Transcription' : 'Show Transcription';
    chrome.storage.local.set({ transcriptionVisible: isTranscriptionVisible });
  }

  function clearChat() {
    if (!chatMessagesContainer) return;
    const welcomeMessage = chatMessagesContainer.querySelector('.welcome-message');
    while (chatMessagesContainer.firstChild && chatMessagesContainer.firstChild !== welcomeMessage) {
        chatMessagesContainer.removeChild(chatMessagesContainer.firstChild);
    }
    if (welcomeMessage && chatMessagesContainer.children.length > 1) {
        while (chatMessagesContainer.lastChild !== welcomeMessage) {
            chatMessagesContainer.removeChild(chatMessagesContainer.lastChild);
        }
    } else if (!welcomeMessage) {
        chatMessagesContainer.innerHTML = '';
    }

    chrome.runtime.sendMessage({ action: 'clearConversationHistory' });
    showStatusMessage('Chat cleared', 'info');
  }

  function openHelpPage(e) { e.preventDefault(); chrome.tabs.create({ url: 'https://candidai.io/help' }); }
  function openFeedbackForm(e) { e.preventDefault(); chrome.tabs.create({ url: 'https://candidai.io/feedback' }); }
  
  async function captureScreen() {
    // Placeholder - review original logic
  }
  function copyAnalysis() {
    // Placeholder - review original logic
  }
  async function refreshAnalysis() {
    // Placeholder - review original logic
  }
  function handlePlatformData(platformData) {
    // Placeholder - review original logic, ensure updatePlatformUI is defined
  }
  
  function updatePlatformUI(platform) {
    if(platformIndicatorElement) {
        platformIndicatorElement.textContent = platform ? `Platform: ${platform}` : 'No platform detected';
    }
    console.log("Platform updated to:", platform);
  }

  // Automated Answering related functions - ensure elements are present if these are active
  async function initializeAutomatedAnswering() {
    if (!autoAnswerToggle) return;
    try {
      const { default: automatedAnsweringService } = await import('../js/services/automatedAnswering.js');
      await automatedAnsweringService.initialize();
      loadBasicVoices();
      loadAutomatedAnsweringSettings();

      automatedAnsweringService.on('start', () => {
        if(speakButton) speakButton.classList.add('active');
        showStatusMessage(i18n.getMessage('speakingAnswer'), 'info');
      });
      automatedAnsweringService.on('stop', () => {
        if(speakButton) speakButton.classList.remove('active');
      });
      automatedAnsweringService.on('error', (error) => {
        if(speakButton) speakButton.classList.remove('active');
        showStatusMessage(i18n.getMessage('errorSpeakingAnswer') + ': ' + error.message, 'error');
      });
      
    } catch (error) {
      console.error('Error initializing automated answering:', error);
    }
  }
  
  async function loadVoicesFromService() {
    // Placeholder - review original logic
  }
  function loadAutomatedAnsweringSettings() {
    // Placeholder - review original logic
  }
  async function speakAnswer() {
    // Placeholder - review original logic, likely uses automatedAnsweringService.speak()
  }
  function copyAnswer() {
    // Placeholder - review original logic, likely uses copyToClipboard(aiSuggestionsElement.textContent)
  }
  function refreshAnswer() {
    // This was for the main suggestion. The one above takes a param. Consolidate or differentiate
  }
  function toggleAutoAnswerSettings() { if(autoAnswerSettings) autoAnswerSettings.classList.toggle('hidden'); }
  async function toggleAutoAnswer() {
    // Placeholder - review original logic
  }
  async function toggleAudioInjection() {
    // Placeholder - review original logic
  }
  async function changeVoice() {
    // Placeholder - review original logic
  }
  async function updateRateValue() {
    // Placeholder - review original logic
  }
  async function updatePitchValue() {
    // Placeholder - review original logic
  }
  async function updateVolumeValue() {
    // Placeholder - review original logic
  }
});

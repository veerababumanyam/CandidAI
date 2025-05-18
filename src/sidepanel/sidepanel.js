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
  const statusText = document.getElementById('statusText');
  const platformIndicator = document.getElementById('platformIndicator');

  // Chat Elements
  const chatInput = document.getElementById('chatInput');
  const sendMessageButton = document.getElementById('sendMessageButton');
  const chatMessages = document.getElementById('chatMessages');

  // State
  let isListening = false;
  let isProcessing = false;
  let interimTranscript = '';
  let interimTranscriptTimeout = null;
  let speechSynthesis = window.speechSynthesis;
  let voices = [];

  // Initialize speech synthesis voices when they become available
  const loadBasicVoices = () => {
    voices = speechSynthesis.getVoices();
    // Filter for English voices
    return voices.filter(voice => voice.lang.includes('en'));
  };

  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadBasicVoices;
  }

  // Load voices immediately if already available
  loadBasicVoices();

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'transcription') {
      // Handle transcription updates
      if (message.isFinal) {
        // If this is a final transcription, add it as a user message
        if (message.text && message.text.trim()) {
          addChatMessage('user', message.text);
        }
      } else {
        // For interim results, update the UI or show a typing indicator
        updateStatus(`Listening: ${message.text}`);
      }
    } else if (message.action === 'aiResponse') {
      // Handle AI response
      if (message.text) {
        addChatMessage('ai', message.text, message.metadata);
      }
    } else if (message.action === 'error') {
      // Handle errors
      console.error('Error from background:', message.error);
      showStatusMessage(`Error: ${message.error}`);
    } else if (message.action === 'status') {
      // Handle status updates
      updateStatus(message.text);
    }

    // Return true to indicate we want to send a response asynchronously
    return true;
  });

  // Initialize the UI
  function initializeUI() {
    console.log('Initializing UI...');

    // Set up event listeners for footer links
    if (helpLink) {
      helpLink.addEventListener('click', openHelpPage);
    }

    if (feedbackLink) {
      feedbackLink.addEventListener('click', openFeedbackForm);
    }

    // Set up event listener for the send button
    if (document.getElementById('sendButton')) {
      document.getElementById('sendButton').addEventListener('click', sendChatMessage);
    }

    // Set up event listener for the transcription visibility toggle
    const toggleTranscriptionButton = document.getElementById('toggleTranscriptionVisibility');
    if (toggleTranscriptionButton) {
      toggleTranscriptionButton.addEventListener('click', toggleTranscriptionVisibility);
    }

    // Set up event listeners for AI Suggestions controls
    setupAISuggestionsControls();

    // Check for microphone permissions
    checkMicrophonePermission();

    // Load saved accessibility settings
    loadAccessibilitySettings();

    console.log('UI initialization complete');
  }

  /**
   * Sets up event listeners for AI Suggestions controls
   */
  function setupAISuggestionsControls() {
    // Copy button
    const copyButton = document.getElementById('copyButton');
    if (copyButton) {
      copyButton.addEventListener('click', () => {
        const suggestionsBox = document.getElementById('aiSuggestions');
        if (suggestionsBox && suggestionsBox.textContent.trim()) {
          copyToClipboard(suggestionsBox.textContent);

          // Visual feedback
          copyButton.classList.add('active');
          setTimeout(() => {
            copyButton.classList.remove('active');
          }, 800);
        } else {
          showStatusMessage('No content to copy', 'info');
        }
      });
    }

    // Speak button
    const speakButton = document.getElementById('speakButton');
    if (speakButton) {
      speakButton.addEventListener('click', () => {
        const suggestionsBox = document.getElementById('aiSuggestions');
        if (suggestionsBox && suggestionsBox.textContent.trim()) {
          // If already speaking (button is active), this will stop speech
          if (speakButton.classList.contains('active')) {
            speechSynthesis.cancel();
            speakButton.classList.remove('active');
            showStatusMessage('Speech stopped', 'info');
          } else {
            speakMessage(suggestionsBox.textContent);

            // Visual feedback
            speakButton.classList.add('active');
          }
        } else {
          showStatusMessage('No content to speak', 'info');
        }
      });
    }

    // Refresh button
    const refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        // Check if there's content to refresh
        const lastUserMessage = getLastUserMessage();
        if (lastUserMessage) {
          // Visual feedback
          refreshButton.classList.add('active');

          // Regenerate the answer
          regenerateAnswer();

          setTimeout(() => {
            refreshButton.classList.remove('active');
          }, 800);
        } else {
          showStatusMessage('No previous question to regenerate answer for', 'info');
        }
      });
    }

    // Increase font size button
    const increaseFontButton = document.getElementById('increaseFontButton');
    if (increaseFontButton) {
      increaseFontButton.addEventListener('click', () => {
        // Visual feedback
        increaseFontButton.classList.add('active');

        // Increase font size
        increaseFontSize();

        setTimeout(() => {
          increaseFontButton.classList.remove('active');
        }, 800);
      });
    }

    // Decrease font size button
    const decreaseFontButton = document.getElementById('decreaseFontButton');
    if (decreaseFontButton) {
      decreaseFontButton.addEventListener('click', () => {
        // Visual feedback
        decreaseFontButton.classList.add('active');

        // Decrease font size
        decreaseFontSize();

        setTimeout(() => {
          decreaseFontButton.classList.remove('active');
        }, 800);
      });
    }

    // Toggle autoscroll button
    const toggleAutoscrollButton = document.getElementById('toggleAutoscrollButton');
    if (toggleAutoscrollButton) {
      toggleAutoscrollButton.addEventListener('click', () => {
        toggleAutoscroll();
      });

      // Initialize button state
      updateAutoscrollButtonState();
    }
  }

  // Call the initialization function
  initializeUI();

  // Load saved theme preference
  loadThemePreference();

  // Focus the chat input when the panel is opened
  if (chatInput) {
    chatInput.focus();
  }
  const pitchRange = document.getElementById('pitchRange');
  const volumeRange = document.getElementById('volumeRange');

  // DOM Elements - Footer
  const helpLink = document.getElementById('helpLink');
  const feedbackLink = document.getElementById('feedbackLink');

  // State
  let currentPlatform = null;
  let isDarkTheme = false;
  let isTranscriptionVisible = false; // Hidden by default in the new UI
  let accessibilitySettings = {
    fontSize: 'medium',
    autoScroll: true
  };

  // ===== Event Listeners =====
  // Handle chat input
  if (chatInput) {
    // Handle Enter key to send message (Shift+Enter for new line)
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });

    // Auto-resize the input as user types
    chatInput.addEventListener('input', () => {
      // Auto-resize the contenteditable div
      chatInput.style.height = 'auto';
      chatInput.style.height = `${Math.min(chatInput.scrollHeight, 200)}px`;

      // Enable/disable send button based on content
      updateSendButtonState();
    });

    // Handle paste events to clean up formatting
    chatInput.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  }

  // Send button click handler
  if (sendMessageButton) {
    sendMessageButton.addEventListener('click', sendChatMessage);
  }

  // Update send button state based on input
  function updateSendButtonState() {
    if (!sendMessageButton) return;
    const hasContent = chatInput.textContent.trim().length > 0;
    sendMessageButton.disabled = !hasContent;
    sendMessageButton.style.opacity = hasContent ? '1' : '0.5';
    sendMessageButton.style.cursor = hasContent ? 'pointer' : 'not-allowed';
  }

  // Attach file button
  if (attachFileButton) {
    attachFileButton.addEventListener('click', () => {
      // TODO: Implement file attachment functionality
      showStatusMessage('File attachment feature coming soon!', 'info');
    });
  }

  // Emoji picker button
  if (emojiButton) {
    emojiButton.addEventListener('click', () => {
      // TODO: Implement emoji picker
      showStatusMessage('Emoji picker coming soon!', 'info');
    });
  }

  // Toggle listening state
  if (toggleListeningButton) {
    toggleListeningButton.addEventListener('click', () => {
      // Toggle listening state
      isListening = !isListening;

      // Update UI
      toggleListeningButton.classList.toggle('active', isListening);
      updateListeningUI();

      // Send message to background script
      chrome.runtime.sendMessage({
        action: isListening ? 'startListening' : 'stopListening'
      }, (response) => {
        // Handle response from background script
        if (chrome.runtime.lastError) {
          console.error('Error toggling listening state:', chrome.runtime.lastError);
          // Revert state if there was an error
          isListening = !isListening;
          toggleListeningButton.classList.toggle('active', isListening);
          updateListeningUI();
          showStatusMessage('Error toggling microphone: ' + chrome.runtime.lastError.message, 'error');
        } else if (response && response.error) {
          console.error('Error from background script:', response.error);
          // Revert state if there was an error
          isListening = !isListening;
          toggleListeningButton.classList.toggle('active', isListening);
          updateListeningUI();
          showStatusMessage('Error: ' + response.error, 'error');
        } else {
          console.log('Successfully toggled listening state:', isListening);
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
      // Open the options page in a new tab
      const optionsUrl = chrome.runtime.getURL('options/options.html');

      // Add visual feedback
      settingsButton.classList.add('active');

      // Try to open the options page using chrome.tabs.create
      chrome.tabs.create({ url: optionsUrl }, (tab) => {
        if (chrome.runtime.lastError) {
          console.error('Error opening options page:', chrome.runtime.lastError);
          // Fallback to window.open
          window.open(optionsUrl, '_blank');
          showStatusMessage('Settings opened in new window', 'success');
        } else {
          console.log('Options page opened in tab:', tab);
          showStatusMessage('Settings opened in new tab', 'success');
        }

        // Remove active class after a short delay
        setTimeout(() => {
          settingsButton.classList.remove('active');
        }, 300);
      });
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
    const message = chatInput.textContent.trim();
    if (!message) return;

    // Add user message to chat
    addChatMessage('user', message);

    // Clear input and reset height
    chatInput.textContent = '';
    chatInput.style.height = 'auto';
    updateSendButtonState();

    // Save chat history
    saveChatHistory();

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    try {
      // Send message to background script for processing
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          {
            action: 'processUserMessage',
            message,
            // Include any context that might be helpful
            context: {
              url: window.location.href,
              title: document.title
            }
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError);
              resolve({ error: 'Failed to process message' });
            } else {
              resolve(response);
            }
          }
        );
      });

      // Remove typing indicator
      if (typingIndicator && typingIndicator.parentNode) {
        typingIndicator.remove();
      }

      // Add AI response to chat
      if (response && !response.error) {
        addChatMessage('ai', response.text, response.metadata);
        // Save chat history after AI responds
        saveChatHistory();
      } else {
        const errorMsg = response?.error || 'Sorry, I encountered an error processing your request.';
        addChatMessage('ai', errorMsg);
      }
    } catch (error) {
      console.error('Error:', error);
      if (typingIndicator && typingIndicator.parentNode) {
        typingIndicator.remove();
      }
      addChatMessage('ai', 'Sorry, something went wrong. Please try again.');
    }

    // Re-focus the input after sending
    if (chatInput) {
      chatInput.focus();
    }
  }

  // Add a message to the chat
  function addChatMessage(sender, message, metadata = {}) {
    if (!chatMessages) return null;

    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    messageElement.setAttribute('role', 'log');
    messageElement.setAttribute('aria-live', 'polite');

    // Add avatar
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    messageElement.appendChild(avatar);

    // Create message content container
    const content = document.createElement('div');
    content.className = 'message-content';

    // Add context if available
    if (metadata.context) {
      const context = document.createElement('div');
      context.className = 'message-context';
      context.textContent = metadata.context;
      content.appendChild(context);
    }

    // Add message text with markdown support
    const text = document.createElement('div');
    text.className = 'message-text';
    text.innerHTML = formatMarkdown(message);
    content.appendChild(text);

    // Add timestamp
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    content.appendChild(time);

    // Add action buttons
    const actions = document.createElement('div');
    actions.className = 'message-actions';

    // Copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'action-button';
    copyButton.setAttribute('title', 'Copy to clipboard');
    copyButton.innerHTML = '<i class="far fa-copy"></i>';
    copyButton.addEventListener('click', () => copyToClipboard(message));
    actions.appendChild(copyButton);

    // Speak button (for AI messages)
    if (sender === 'ai') {
      const speakButton = document.createElement('button');
      speakButton.className = 'action-button';
      speakButton.setAttribute('title', 'Read aloud');
      speakButton.innerHTML = '<i class="fas fa-volume-up"></i>';
      speakButton.addEventListener('click', () => speakMessage(message));
      actions.appendChild(speakButton);
    }

    content.appendChild(actions);
    messageElement.appendChild(content);

    // Add to chat with animation
    messageElement.style.opacity = '0';
    chatMessages.appendChild(messageElement);

    // Trigger reflow for animation
    void messageElement.offsetWidth;
    messageElement.style.opacity = '1';
    messageElement.style.transform = 'translateY(0)';

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageElement;
  }

  // Show typing indicator
  function showTypingIndicator() {
    if (!chatMessages) return null;

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message ai-message typing-indicator';
    typingIndicator.innerHTML = `
      <div class="message-avatar ai-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="message-content">
        <div class="message-text">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;

    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingIndicator;
  }

  // Format markdown in messages
  function formatMarkdown(text) {
    if (!text) return '';

    // Simple markdown parsing
    return text
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br>');
  }

  // Show status message
  function showStatusMessage(message, duration = 3000) {
    let statusEl = document.getElementById('statusMessage');

    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.id = 'statusMessage';
      statusEl.className = 'status-message';
      document.body.appendChild(statusEl);
    }

    statusEl.textContent = message;
    statusEl.classList.add('show');

    // Hide after duration
    setTimeout(() => {
      statusEl.classList.remove('show');
    }, duration);
  }

  // Copy text to clipboard
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showStatusMessage('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text:', err);
      showStatusMessage('Failed to copy text');
    });
  }

  // Speak message using speech synthesis
  function speakMessage(text) {
    const speakButton = document.getElementById('speakButton');

    if (!speechSynthesis) {
      showStatusMessage('Speech synthesis not supported', 'error');
      if (speakButton) {
        speakButton.classList.remove('active');
      }
      return;
    }

    // If speech is already in progress, stop it
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      showStatusMessage('Speech stopped', 'info');
      if (speakButton) {
        speakButton.classList.remove('active');
      }
      return;
    }

    // Start new speech
    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice if available
    const voices = loadBasicVoices();
    if (voices.length > 0) {
      // Try to find a natural-sounding English voice
      const preferredVoices = voices.filter(v => v.name.includes('Google') || v.name.includes('Samantha'));
      utterance.voice = preferredVoices[0] || voices[0];
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Add event listeners
    utterance.onend = () => {
      showStatusMessage('Finished reading', 'success');
      if (speakButton) {
        speakButton.classList.remove('active');
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      showStatusMessage('Error reading message', 'error');
      if (speakButton) {
        speakButton.classList.remove('active');
      }
    };

    // Start speaking
    speechSynthesis.speak(utterance);
    showStatusMessage('Reading text aloud...', 'info');

    // Ensure the button shows active state
    if (speakButton && !speakButton.classList.contains('active')) {
      speakButton.classList.add('active');
    }
  }

  // Update UI based on listening state
  function updateListeningUI() {
    if (!toggleListeningButton) return;

    const icon = toggleListeningButton.querySelector('i');
    if (isListening) {
      icon.classList.remove('fa-microphone');
      icon.classList.add('fa-microphone-slash');
      toggleListeningButton.setAttribute('aria-label', 'Stop listening');

      // Show a visual indicator that we're listening
      showStatusMessage('Listening...', 2000);
    } else {
      icon.classList.remove('fa-microphone-slash');
      icon.classList.add('fa-microphone');
      toggleListeningButton.setAttribute('aria-label', 'Start listening');
      showStatusMessage('Microphone off', 'info');
    }
  }

  /**
   * Opens the visual analysis page in a new tab
   */
  function openVisualAnalysisPage() {
    console.log('Visual analysis button clicked');

    // Add visual feedback for the button immediately
    visualAnalysisButton.classList.add('active');

    // Create a dedicated visual analysis page URL
    const visualAnalysisUrl = chrome.runtime.getURL('visual-analysis.html');

    // Try to open the visual analysis page using chrome.tabs.create
    chrome.tabs.create({ url: visualAnalysisUrl }, (tab) => {
      if (chrome.runtime.lastError) {
        console.error('Error opening visual analysis page:', chrome.runtime.lastError);

        // Fallback to window.open
        try {
          window.open(visualAnalysisUrl, '_blank');
          console.log('Opened visual analysis using window.open');
          showStatusMessage('Visual analysis opened in new window', 'success');
        } catch (windowError) {
          console.error('Error using window.open:', windowError);
          showStatusMessage('Failed to open visual analysis', 'error');

          // If all else fails, try to request screen capture directly
          requestVisualAnalysis();
        }
      } else {
        console.log('Visual analysis page opened in tab:', tab);
        showStatusMessage('Visual analysis opened in new tab', 'success');
      }

      // Remove active class after a short delay
      setTimeout(() => {
        visualAnalysisButton.classList.remove('active');
      }, 300);
    });
  }

  /**
   * Requests visual analysis directly if opening a new page fails
   */
  async function requestVisualAnalysis() {
    console.log('Attempting direct visual analysis');
    showStatusMessage('Requesting screen capture permission...', 'info');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'requestVisualAnalysisPermission'
      });

      if (!response || !response.success) {
        showStatusMessage('Screen capture permission denied', 'error');
        return;
      }

      showStatusMessage('Permission granted. Capturing screen...', 'info');

      // Capture screen
      const captureResponse = await chrome.runtime.sendMessage({
        action: 'captureScreen'
      });

      if (!captureResponse || !captureResponse.success) {
        showStatusMessage('Failed to capture screen', 'error');
        return;
      }

      // If we have analysis, show it in a new window
      if (captureResponse.analysis) {
        const analysisWindow = window.open('', '_blank');
        if (analysisWindow) {
          analysisWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Visual Analysis Result</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                img { max-width: 100%; border: 1px solid #ccc; margin-bottom: 20px; }
                h1 { color: #333; }
                pre { background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap; }
              </style>
            </head>
            <body>
              <h1>Visual Analysis Result</h1>
              <img src="${captureResponse.imageData}" alt="Captured Screen">
              <h2>Analysis:</h2>
              <pre>${captureResponse.analysis.text}</pre>
            </body>
            </html>
          `);
          analysisWindow.document.close();
          showStatusMessage('Analysis complete', 'success');
        } else {
          showStatusMessage('Popup blocked. Please allow popups for this site.', 'warning');
        }
      } else {
        showStatusMessage('Analysis failed', 'warning');
      }
    } catch (error) {
      console.error('Error in direct visual analysis:', error);
      showStatusMessage('Error: ' + error.message, 'error');
    }
  }

  /**
   * Toggles between light and dark theme
   */
  function toggleTheme() {
    isDarkTheme = !isDarkTheme;

    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
      toggleThemeButton.title = 'Switch to Light Theme';
      // Update icon
      const icon = toggleThemeButton.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      }
      // Store preference
      chrome.storage.local.set({ 'theme': 'dark' });
    } else {
      document.body.classList.remove('dark-theme');
      toggleThemeButton.title = 'Switch to Dark Theme';
      // Update icon
      const icon = toggleThemeButton.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
      // Store preference
      chrome.storage.local.set({ 'theme': 'light' });
    }

    // Add visual feedback
    toggleThemeButton.classList.add('active');
    setTimeout(() => {
      toggleThemeButton.classList.remove('active');
    }, 300);

    showStatusMessage(`Switched to ${isDarkTheme ? 'dark' : 'light'} theme`, 'info');
  }

  /**
   * Loads saved accessibility settings from storage
   */
  function loadAccessibilitySettings() {
    chrome.storage.local.get(['accessibilitySettings'], (result) => {
      if (result.accessibilitySettings) {
        accessibilitySettings = result.accessibilitySettings;
      } else {
        // Set default settings if none exist
        accessibilitySettings = {
          fontSize: 'medium',
          autoScroll: true
        };
        saveAccessibilitySettings();
      }

      // Apply font size
      applyFontSize();

      // Update autoscroll button state
      updateAutoscrollButtonState();
    });
  }

  /**
   * Updates the autoscroll button state based on current settings
   */
  function updateAutoscrollButtonState() {
    const toggleAutoscrollButton = document.getElementById('toggleAutoscrollButton');
    if (toggleAutoscrollButton) {
      // Update visual state
      toggleAutoscrollButton.classList.toggle('active', accessibilitySettings.autoScroll);

      // Update tooltip
      toggleAutoscrollButton.title = `Toggle Autoscroll (Currently ${accessibilitySettings.autoScroll ? 'On' : 'Off'})`;
    }
  }

  /**
   * Saves accessibility settings to storage
   */
  function saveAccessibilitySettings() {
    chrome.storage.local.set({ 'accessibilitySettings': accessibilitySettings }, () => {
      console.log('Accessibility settings saved:', accessibilitySettings);
    });
  }

  /**
   * Increases the font size of the suggestions box
   */
  function increaseFontSize() {
    const fontSizes = ['small', 'medium', 'large', 'xlarge'];
    const currentIndex = fontSizes.indexOf(accessibilitySettings.fontSize);

    if (currentIndex < fontSizes.length - 1) {
      accessibilitySettings.fontSize = fontSizes[currentIndex + 1];
      applyFontSize();
      saveAccessibilitySettings();
      showStatusMessage(`Font size increased to ${accessibilitySettings.fontSize}`, 'info');
    } else {
      showStatusMessage('Maximum font size reached', 'info');
    }
  }

  /**
   * Decreases the font size of the suggestions box
   */
  function decreaseFontSize() {
    const fontSizes = ['small', 'medium', 'large', 'xlarge'];
    const currentIndex = fontSizes.indexOf(accessibilitySettings.fontSize);

    if (currentIndex > 0) {
      accessibilitySettings.fontSize = fontSizes[currentIndex - 1];
      applyFontSize();
      saveAccessibilitySettings();
      showStatusMessage(`Font size decreased to ${accessibilitySettings.fontSize}`, 'info');
    } else {
      showStatusMessage('Minimum font size reached', 'info');
    }
  }

  /**
   * Applies the current font size to the suggestions box
   */
  function applyFontSize() {
    const suggestionsBox = document.getElementById('aiSuggestions');
    if (suggestionsBox) {
      // Remove all font size classes
      suggestionsBox.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-xlarge');

      // Add the current font size class
      suggestionsBox.classList.add(`font-size-${accessibilitySettings.fontSize}`);
    }
  }

  /**
   * Toggles autoscroll for the suggestions box
   */
  function toggleAutoscroll() {
    accessibilitySettings.autoScroll = !accessibilitySettings.autoScroll;
    saveAccessibilitySettings();

    // Update button state
    updateAutoscrollButtonState();

    // Show status message
    showStatusMessage(`Autoscroll ${accessibilitySettings.autoScroll ? 'enabled' : 'disabled'}`, 'info');
  }

  /**
   * Regenerates the answer based on the last question
   */
  function regenerateAnswer() {
    // Get the last user message
    const lastUserMessage = getLastUserMessage();

    if (lastUserMessage) {
      // Clear the AI suggestions box
      const suggestionsBox = document.getElementById('aiSuggestions');
      if (suggestionsBox) {
        suggestionsBox.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
      }

      // Send message to background script for processing
      chrome.runtime.sendMessage(
        {
          action: 'regenerateAnswer',
          message: lastUserMessage,
          context: {
            url: window.location.href,
            title: document.title
          }
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error regenerating answer:', chrome.runtime.lastError);
            showStatusMessage('Failed to regenerate answer', 'error');

            // Clear loading indicator
            if (suggestionsBox) {
              suggestionsBox.innerHTML = '<div class="error-message">Failed to regenerate answer. Please try again.</div>';
            }
          } else if (response && response.text) {
            // Update the suggestions box with the new answer
            if (suggestionsBox) {
              suggestionsBox.innerHTML = formatMarkdown(response.text);

              // Handle scrolling based on autoscroll setting
              handleAutoscroll(suggestionsBox, 'top');

              if (accessibilitySettings.autoScroll) {
                showStatusMessage('Answer regenerated - scrolled to top', 'success');
              } else {
                showStatusMessage('Answer regenerated - autoscroll disabled', 'success');
              }
            }

            showStatusMessage('Answer regenerated', 'success');
          } else {
            // Handle error
            if (suggestionsBox) {
              suggestionsBox.innerHTML = '<div class="error-message">Failed to regenerate answer. Please try again.</div>';
            }

            showStatusMessage('Failed to regenerate answer', 'error');
          }
        }
      );
    } else {
      showStatusMessage('No previous question found', 'info');
    }
  }

  /**
   * Gets the last user message from the chat
   * @returns {string|null} The last user message or null if none found
   */
  function getLastUserMessage() {
    const chatMessages = document.querySelectorAll('.user-message .message-text');
    if (chatMessages.length > 0) {
      return chatMessages[chatMessages.length - 1].textContent.trim();
    }
    return null;
  }

  /**
   * Handles autoscroll for the suggestions box
   * @param {HTMLElement} container - The container to scroll
   * @param {string} position - The position to scroll to ('top', 'bottom', or 'none')
   */
  function handleAutoscroll(container, position = 'bottom') {
    if (!container) return;

    if (!accessibilitySettings.autoScroll) {
      // If autoscroll is disabled, don't scroll
      return;
    }

    if (position === 'top') {
      container.scrollTop = 0;
    } else if (position === 'bottom') {
      container.scrollTop = container.scrollHeight;
    }
  }

  /**
   * Checks for microphone permission and updates the UI accordingly
   */
  async function checkMicrophonePermission() {
    try {
      // Check if we have microphone permission
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' });

      if (permissionStatus.state === 'granted') {
        console.log('Microphone permission already granted');
        // Update UI to show that microphone is available
        toggleListeningButton.disabled = false;
        toggleListeningButton.title = 'Start Listening';
      } else if (permissionStatus.state === 'prompt') {
        console.log('Microphone permission will be requested when needed');
        // Update UI to show that microphone permission will be requested
        toggleListeningButton.disabled = false;
        toggleListeningButton.title = 'Start Listening (permission will be requested)';
      } else if (permissionStatus.state === 'denied') {
        console.log('Microphone permission denied');
        // Update UI to show that microphone is not available
        toggleListeningButton.disabled = true;
        toggleListeningButton.title = 'Microphone access denied. Please enable in browser settings.';
        showStatusMessage('Microphone access denied. Please enable in browser settings.', 'warning');
      }

      // Listen for permission changes
      permissionStatus.onchange = function() {
        console.log('Microphone permission changed to:', this.state);
        checkMicrophonePermission();
      };
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      // Assume we can use the microphone if we can't check permissions
      toggleListeningButton.disabled = false;
    }
  }

  /**
   * Loads the saved theme preference from storage
   */
  function loadThemePreference() {
    chrome.storage.local.get(['theme'], (result) => {
      if (result.theme === 'dark') {
        isDarkTheme = true;
        document.body.classList.add('dark-theme');
        toggleThemeButton.title = 'Switch to Light Theme';
        // Update icon
        const icon = toggleThemeButton.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-moon');
          icon.classList.add('fa-sun');
        }
      } else {
        isDarkTheme = false;
        document.body.classList.remove('dark-theme');
        toggleThemeButton.title = 'Switch to Dark Theme';
      }
    });
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
  function openHelpPage(e) {
    e.preventDefault();
    try {
      chrome.tabs.create({ url: 'https://candidai.io/help' });
      console.log('Opening help page');
    } catch (error) {
      console.error('Error opening help page:', error);
      // Fallback - open in current tab if chrome.tabs is not available
      window.open('https://candidai.io/help', '_blank');
    }
  }

  /**
   * Opens the feedback form
   */
  function openFeedbackForm(e) {
    e.preventDefault();
    try {
      chrome.tabs.create({ url: 'https://candidai.io/feedback' });
      console.log('Opening feedback form');
    } catch (error) {
      console.error('Error opening feedback form:', error);
      // Fallback - open in current tab if chrome.tabs is not available
      window.open('https://candidai.io/feedback', '_blank');
    }
  }

  /**
   * Captures the screen for visual analysis
   */
  async function captureScreen() {
    console.log('Capture screen button clicked');

    try {
      // Show loading state
      const capturedImagePlaceholder = document.getElementById('capturedImagePlaceholder');
      const capturedImage = document.getElementById('capturedImage');
      const analysisResult = document.getElementById('analysisResult');
      const analysisResultPlaceholder = document.getElementById('analysisResultPlaceholder');

      if (!capturedImagePlaceholder || !capturedImage || !analysisResult || !analysisResultPlaceholder) {
        console.error('Missing DOM elements for screen capture');
        showStatusMessage('Error: UI elements not found', 'error');
        return;
      }

      capturedImagePlaceholder.textContent = 'Capturing screen...';
      capturedImagePlaceholder.style.display = 'block';
      capturedImage.style.display = 'none';
      analysisResult.textContent = '';
      analysisResultPlaceholder.textContent = 'Analyzing...';
      analysisResultPlaceholder.style.display = 'block';

      // Show status message to user
      showStatusMessage('Requesting screen capture permission...', 'info');

      // Request permission if needed
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'requestVisualAnalysisPermission'
        });

        if (!response || !response.success) {
          capturedImagePlaceholder.textContent = 'Permission denied. Please grant screen capture permission.';
          analysisResultPlaceholder.textContent = 'No analysis available.';
          showStatusMessage('Screen capture permission denied', 'error');
          return;
        }
      } catch (error) {
        console.error('Error requesting permission:', error);
        capturedImagePlaceholder.textContent = 'Error requesting permission: ' + error.message;
        analysisResultPlaceholder.textContent = 'No analysis available.';
        showStatusMessage('Error requesting permission', 'error');
        return;
      }

      // Show status message to user
      showStatusMessage('Capturing screen...', 'info');

      // Capture screen
      try {
        const captureResponse = await chrome.runtime.sendMessage({
          action: 'captureScreen'
        });

        if (!captureResponse || !captureResponse.success) {
          capturedImagePlaceholder.textContent = 'Failed to capture screen.';
          analysisResultPlaceholder.textContent = 'No analysis available.';
          showStatusMessage('Failed to capture screen', 'error');
          return;
        }

        // Display captured image
        capturedImage.src = captureResponse.imageData;
        capturedImage.style.display = 'block';
        capturedImagePlaceholder.style.display = 'none';

        showStatusMessage('Screen captured successfully', 'success');

        // Wait for analysis
        if (captureResponse.analysis) {
          // Display analysis
          analysisResult.textContent = captureResponse.analysis.text;
          analysisResult.style.display = 'block';
          analysisResultPlaceholder.style.display = 'none';
          showStatusMessage('Analysis complete', 'success');
        } else {
          analysisResultPlaceholder.textContent = 'Analysis failed. Please try again.';
          showStatusMessage('Analysis failed', 'warning');
        }
      } catch (error) {
        console.error('Error during screen capture:', error);
        capturedImagePlaceholder.textContent = 'Error capturing screen: ' + error.message;
        analysisResultPlaceholder.textContent = 'No analysis available.';
        showStatusMessage('Error capturing screen', 'error');
      }
    } catch (error) {
      console.error('Error in captureScreen function:', error);
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
      loadBasicVoices();

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
   * Load available voices for TTS from service
   */
  async function loadVoicesFromService() {
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

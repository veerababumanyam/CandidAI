/**
 * CandidAI - Background Service Worker
 * Handles extension lifecycle events and coordinates between components
 */

// Import required modules
// Note: Service workers don't support dynamic imports, so we need to import everything upfront
import calendarIntegration from '../js/services/calendarIntegration.js';
import historyManager from '../js/services/historyManager.js';
import llmOrchestrator from '../js/services/llmOrchestrator.js';
import contextManager from '../js/services/contextManager.js';
import visualAnalyzer from '../js/services/visualAnalyzer.js';

// State
let currentPlatform = null;
let isListening = false;
let offscreenDocumentReady = false;
let pendingQuestions = [];
let activeTabId = null;
let lastTranscribedText = '';
let lastDetectedQuestion = '';
let lastGeneratedAnswer = '';
let currentInterviewId = null;
let historyManagerInitialized = false;

// Initialize extension when installed
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('CandidAI extension installed');
    // Initialize default settings
    chrome.storage.local.set({
      isListening: false,
      preferredLLM: 'openai',
      transcriptionLanguage: 'en-US',
      useExternalSTT: false,
      preferredSTT: 'webSpeech',
      silenceDetectionThreshold: 0.01,
      silenceTimeout: 1500,
      accessibilitySettings: {
        fontSize: 'medium',
        autoScroll: true
      }
    });

    // Show welcome notification
    sendNotification(
      'CandidAI Installed',
      'Thank you for installing CandidAI! Click the extension icon to get started.'
    );

    // Initialize calendar integration
    calendarIntegration.initialize().then(() => {
      console.log('Calendar integration initialized');
    }).catch(error => {
      console.error('Error initializing calendar integration:', error);
    });
  }
});

// Handle extension icon click - open side panel
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked, opening side panel for tab:', tab.id);
  activeTabId = tab.id;

  try {
    // Open the side panel
    chrome.sidePanel.open({ tabId: tab.id })
      .then(() => {
        console.log('Side panel opened successfully');
      })
      .catch((error) => {
        console.error('Error opening side panel:', error);
      });

    // Check if we're on a supported platform
    checkPlatform(tab);
  } catch (error) {
    console.error('Exception when opening side panel:', error);
  }
});

// Track active tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  activeTabId = activeInfo.tabId;

  // Get tab info
  chrome.tabs.get(activeTabId, (tab) => {
    checkPlatform(tab);
  });
});

// Track URL changes in tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tabId === activeTabId) {
    checkPlatform(tab);
  }
});

/**
 * Checks if the current tab is on a supported platform
 */
function checkPlatform(tab) {
  const platform = detectPlatform(tab.url);

  if (platform !== currentPlatform) {
    currentPlatform = platform;

    // Notify side panel of platform change
    chrome.runtime.sendMessage({
      action: 'updatePlatform',
      platform: platform
    });

    // If on a supported platform, inject content script if needed
    if (platform) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/content.js']
      }).catch(error => {
        console.error('Error injecting content script:', error);
      });
    }
  }
}

/**
 * Creates and manages the offscreen document for audio processing
 */
async function setupOffscreenDocument() {
  try {
    // Check if offscreen document is already available
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT']
    });

    if (existingContexts.length > 0) {
      offscreenDocumentReady = true;
      return true;
    }

    // Create offscreen document
    await chrome.offscreen.createDocument({
      url: 'offscreen/offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Audio processing for interview assistance'
    });

    offscreenDocumentReady = true;
    return true;
  } catch (error) {
    console.error('Error setting up offscreen document:', error);
    offscreenDocumentReady = false;
    return false;
  }
}

/**
 * Starts audio capture and transcription
 */
async function startListening() {
  if (isListening) return true;

  try {
    // Ensure offscreen document is ready
    if (!offscreenDocumentReady) {
      await setupOffscreenDocument();
    }

    // Initialize history manager if needed
    if (!historyManagerInitialized) {
      await historyManager.initialize();
      historyManagerInitialized = true;
    }

    // Start a new interview session if consent is given
    if (historyManagerInitialized) {
      if (historyManager.hasConsent()) {
        // Get company and position from job description if available
        const { jobDescription } = await new Promise(resolve => {
          chrome.storage.local.get(['jobDescription'], resolve);
        });

        // Extract metadata from job description (simplified approach)
        let metadata = {
          platform: currentPlatform,
          company: 'Unknown Company',
          position: 'Unknown Position'
        };

        if (jobDescription) {
          // Simple extraction of company and position from job description
          const companyMatch = jobDescription.match(/(?:at|with|for)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\.|\,|\s+is|\s+are|\s+in|\s+to|\s+and|\n|$)/);
          if (companyMatch && companyMatch[1]) {
            metadata.company = companyMatch[1].trim();
          }

          const positionMatch = jobDescription.match(/(?:seeking|hiring|for|position|role|job)\s+(?:a|an)\s+([A-Za-z0-9\s]+?)(?:\.|\,|\s+at|\s+in|\s+to|\s+with|\n|$)/i);
          if (positionMatch && positionMatch[1]) {
            metadata.position = positionMatch[1].trim();
          }
        }

        // Start a new interview
        currentInterviewId = historyManager.startInterview(metadata);
        console.log('Started new interview session:', currentInterviewId);
      }
    }

    // Start audio capture in offscreen document
    const response = await chrome.runtime.sendMessage({
      action: 'startAudioCapture'
    });

    if (response && response.success) {
      isListening = true;

      // Update storage
      chrome.storage.local.set({ isListening: true });

      // Notify side panel
      chrome.runtime.sendMessage({
        action: 'listeningStatusChanged',
        isListening: true
      });

      // Show notification
      sendNotification(
        'CandidAI Listening',
        'CandidAI is now listening for interview questions.'
      );

      return true;
    } else {
      throw new Error('Failed to start audio capture');
    }
  } catch (error) {
    console.error('Error starting listening:', error);

    // Show error notification
    sendNotification(
      'CandidAI Error',
      'Failed to start listening: ' + error.message
    );

    return false;
  }
}

/**
 * Stops audio capture and transcription
 */
async function stopListening() {
  if (!isListening) return true;

  try {
    // Stop audio capture in offscreen document
    const response = await chrome.runtime.sendMessage({
      action: 'stopAudioCapture'
    });

    isListening = false;

    // Update storage
    chrome.storage.local.set({ isListening: false });

    // End the current interview session if one is active
    if (currentInterviewId && historyManagerInitialized) {
      if (historyManager.hasConsent()) {
        await historyManager.endInterview(currentInterviewId);
        console.log('Ended interview session:', currentInterviewId);

        // Show notification about interview recording
        sendNotification(
          'Interview Recorded',
          'Your interview has been recorded. View performance in the Performance Hub.',
          'basic',
          'info'
        );

        currentInterviewId = null;
      }
    }

    // Notify side panel
    chrome.runtime.sendMessage({
      action: 'listeningStatusChanged',
      isListening: false
    });

    return true;
  } catch (error) {
    console.error('Error stopping listening:', error);
    return false;
  }
}

/**
 * Processes a detected question and generates an answer using LLM
 */
async function processQuestion(question) {
  // Store the question
  lastDetectedQuestion = question;

  // Update side panel with the question
  chrome.runtime.sendMessage({
    action: 'updateTranscription',
    text: question,
    isFinal: true
  });

  try {
    // Use the pre-imported LLM orchestrator

    // Show loading state
    chrome.runtime.sendMessage({
      action: 'updateSuggestions',
      text: 'Generating response...',
      isLoading: true
    });

    // Get job description from storage if available
    const { jobDescription } = await new Promise(resolve => {
      chrome.storage.local.get(['jobDescription'], resolve);
    });

    // Generate interview response
    const response = await llmOrchestrator.generateInterviewResponse(question, {
      jobDescription,
      platform: currentPlatform
    });

    // Store the answer
    lastGeneratedAnswer = response.text;

    // Record the question and answer in the history manager if an interview is active
    if (currentInterviewId && historyManagerInitialized) {
      if (historyManager.hasConsent()) {
        await historyManager.addQuestionAnswer(
          currentInterviewId,
          question,
          response.text,
          {
            provider: response.provider,
            model: response.model,
            tokens: response.usage?.totalTokens || 0,
            questionType: response.questionType || 'unknown'
          }
        );
        console.log('Recorded question and answer for interview:', currentInterviewId);
      }
    }

    // Update side panel with the answer
    chrome.runtime.sendMessage({
      action: 'updateSuggestions',
      text: response.text,
      isLoading: false,
      metadata: {
        provider: response.provider,
        model: response.model,
        tokens: response.usage?.totalTokens || 0,
        usedFallback: response.usedFallback || false,
        originalProvider: response.originalProvider,
        questionType: response.questionType,
        usedResumeContext: response.usedResumeContext || false,
        usedJobDescriptionContext: response.usedJobDescriptionContext || false
      }
    });

    return response.text;
  } catch (error) {
    console.error('Error generating response:', error);

    // Create a friendly error message
    let errorMessage = 'Sorry, I encountered an error while generating a response.';

    if (error.type === 'AuthenticationError') {
      errorMessage = 'API key error. Please check your API key in the options page.';
      sendNotification('API Key Error', errorMessage, 'basic', 'error');
    } else if (error.type === 'RateLimitError') {
      errorMessage = 'Rate limit exceeded. Please try again later.';
      sendNotification('Rate Limit Exceeded', errorMessage, 'basic', 'warning');
    } else if (error.type === 'ServiceError') {
      errorMessage = 'The LLM service is currently unavailable. Please try again later.';
      sendNotification('Service Unavailable', errorMessage, 'basic', 'error');
    } else {
      sendNotification('Error', 'An error occurred while generating a response.', 'basic', 'error');
    }

    // Store the error message
    lastGeneratedAnswer = errorMessage;

    // Update side panel with the error
    chrome.runtime.sendMessage({
      action: 'updateSuggestions',
      text: errorMessage,
      isLoading: false,
      isError: true
    });

    return errorMessage;
  }
}

/**
 * Processes a user chat message and generates a response
 * @param {string} message - The user's chat message
 * @param {Array} conversationHistory - Previous conversation history
 * @returns {Promise<Object>} - The response object
 */
async function processUserChatMessage(message, conversationHistory = []) {
  try {
    // Use the pre-imported LLM orchestrator and context manager

    // Add the user message to the context
    contextManager.addMessage('user', message);

    // Get the conversation history from the context manager if not provided
    if (!conversationHistory || conversationHistory.length === 0) {
      conversationHistory = contextManager.getConversationHistory();
    }

    // Get the current context
    const currentContext = contextManager.getCurrentContext();

    // Get detected entities
    const detectedEntities = contextManager.getDetectedEntities();

    // Generate a response using the LLM orchestrator
    const response = await llmOrchestrator.generateInterviewResponse(message, {
      conversationHistory,
      detectedContext: {
        detectedEntities,
        currentContext,
        conversationHistory
      },
      platform: currentPlatform
    });

    // Add the AI response to the context
    contextManager.addMessage('assistant', response.text, {
      provider: response.provider,
      model: response.model,
      tokens: response.usage?.totalTokens || 0
    });

    // Return the response with metadata
    return {
      answer: response.text,
      metadata: {
        provider: response.provider,
        model: response.model,
        tokens: response.usage?.totalTokens || 0,
        usedFallback: response.usedFallback || false,
        originalProvider: response.originalProvider,
        questionType: response.questionType,
        usedResumeContext: response.usedResumeContext || false,
        usedJobDescriptionContext: response.usedJobDescriptionContext || false,
        usedDetectedContext: response.usedDetectedContext || false
      }
    };
  } catch (error) {
    console.error('Error processing chat message:', error);

    // Create a friendly error message
    let errorMessage = 'Sorry, I encountered an error while generating a response.';

    if (error.type === 'AuthenticationError') {
      errorMessage = 'API key error. Please check your API key in the options page.';
      sendNotification('API Key Error', errorMessage, 'basic', 'error');
    } else if (error.type === 'RateLimitError') {
      errorMessage = 'Rate limit exceeded. Please try again later.';
      sendNotification('Rate Limit Exceeded', errorMessage, 'basic', 'warning');
    } else if (error.type === 'ServiceError') {
      errorMessage = 'The LLM service is currently unavailable. Please try again later.';
      sendNotification('Service Unavailable', errorMessage, 'basic', 'error');
    } else {
      sendNotification('Error', 'An error occurred while generating a response.', 'basic', 'error');
    }

    return {
      answer: errorMessage,
      isError: true
    };
  }
}

/**
 * Detects the platform from a URL
 */
function detectPlatform(url) {
  if (!url) return null;

  if (url.includes('meet.google.com')) {
    return 'Google Meet';
  } else if (url.includes('zoom.us')) {
    return 'Zoom';
  } else if (url.includes('teams.microsoft.com')) {
    return 'Microsoft Teams';
  }
  return null;
}

/**
 * Sends a notification to the user
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - The notification type ('basic', 'image', 'list', 'progress')
 * @param {string} iconType - The icon type for side panel message ('success', 'error', 'warning', 'info')
 */
function sendNotification(title, message, type = 'basic', iconType = 'info') {
  // Send to side panel if it's open
  try {
    chrome.runtime.sendMessage({
      action: 'showStatusMessage',
      message: message,
      type: iconType
    }).catch(() => {
      // Side panel might not be open, ignore error
    });
  } catch (error) {
    console.log('Error sending message to side panel:', error);
  }

  // Skip browser notifications for now to avoid the image loading error
  // We'll use console logs instead
  console.log(`NOTIFICATION: ${title} - ${message}`);

  /* Commented out to avoid the image loading error
  try {
    // Create notification options
    const options = {
      type: type,
      iconUrl: chrome.runtime.getURL('icons/logo3.png'),
      title: title,
      message: message,
      priority: 1,
      silent: false
    };

    // Show the notification
    chrome.notifications.create(options, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error('Error creating notification:', chrome.runtime.lastError);
        return;
      }

      console.log('Notification created with ID:', notificationId);

      // Auto-clear notification after 5 seconds
      setTimeout(() => {
        try {
          chrome.notifications.clear(notificationId, () => {
            if (chrome.runtime.lastError) {
              console.error('Error clearing notification:', chrome.runtime.lastError);
              return;
            }
            console.log('Notification cleared:', notificationId);
          });
        } catch (error) {
          console.error('Exception when clearing notification:', error);
        }
      }, 5000);
    });
  } catch (error) {
    console.error('Exception when creating notification:', error);
  }
  */
}

// Handle extension icon click to open side panel
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Listen for messages from content scripts, side panel, or options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in service worker:', message);

  switch (message.action) {
    case 'openSidePanel':
      chrome.sidePanel.open({ tabId: sender.tab?.id || activeTabId });
      sendResponse({ success: true });
      break;

    case 'startListening':
      startListening().then(success => {
        sendResponse({ success });
      });
      return true; // Keep the message channel open for async response

    case 'stopListening':
      stopListening().then(success => {
        sendResponse({ success });
      });
      return true; // Keep the message channel open for async response

    case 'questionDetected':
      // Process the detected question
      processQuestion(message.text).then(answer => {
        sendResponse({ success: true, answer });
      });
      return true; // Keep the message channel open for async response

    case 'interimTranscript':
      // Forward interim transcript to side panel
      chrome.runtime.sendMessage({
        action: 'updateTranscription',
        text: message.text,
        isFinal: false
      });
      sendResponse({ received: true });
      break;

    case 'transcriptionUpdate':
      // Forward transcription to side panel
      chrome.runtime.sendMessage({
        action: 'updateTranscription',
        text: message.text,
        isFinal: message.isFinal
      });
      lastTranscribedText = message.text;
      sendResponse({ received: true });
      break;

    case 'platformDetected':
      // Update current platform
      currentPlatform = message.platform;

      // Notify side panel
      chrome.runtime.sendMessage({
        action: 'updatePlatform',
        platform: currentPlatform
      });

      sendResponse({ received: true });
      break;

    case 'getStatus':
      // Return current status
      sendResponse({
        isListening,
        currentPlatform,
        lastTranscribedText,
        lastDetectedQuestion,
        lastGeneratedAnswer
      });
      break;

    case 'processUserMessage':
      // Process a user message from the chat
      processUserChatMessage(message.message, message.conversationHistory).then(response => {
        sendResponse(response);
      });
      return true; // Keep the message channel open for async response
      break;

    case 'clearConversationHistory':
      // Clear conversation history in context manager
      contextManager.clearConversationHistory();
      sendResponse({ success: true });
      break;

    case 'regenerateAnswer':
      // Regenerate answer for the given question
      processQuestion(message.question).then(answer => {
        sendResponse({ success: true, answer });
      }).catch(error => {
        console.error('Error regenerating answer:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true; // Keep the message channel open for async response

    case 'platformDataScraped':
      // Handle platform data from content script
      // Update context with platform data
      contextManager.updatePlatformData(message.data);

      // Notify sidepanel about new platform data
      chrome.runtime.sendMessage({
        action: 'platformDataUpdated',
        data: message.data
      }).catch(() => {
        // Sidepanel might not be open, ignore error
      });

      sendResponse({ success: true });
      break;

    case 'requestVisualAnalysisPermission':
      // Request permission for visual analysis
      chrome.permissions.request({
        permissions: ['desktopCapture']
      }).then(granted => {
        sendResponse({ success: granted });
      }).catch(error => {
        console.error('Error requesting visual analysis permission:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true; // Keep the message channel open for async response

    case 'captureScreen':
      // Capture screen and analyze it
      visualAnalyzer.initialize()
        .then(() => visualAnalyzer.captureScreen())
        .then(imageData => {
          if (!imageData) {
            sendResponse({ success: false, error: 'Failed to capture screen' });
            return;
          }

          // Get the analysis
          const analysis = visualAnalyzer.getLastAnalysis();

          sendResponse({
            success: true,
            imageData,
            analysis
          });
        })
        .catch(error => {
          console.error('Error capturing screen:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep the message channel open for async response

    case 'analyzeImage':
      // Analyze an image
      visualAnalyzer.initialize()
        .then(() => visualAnalyzer.analyzeImage(message.imageData))
        .then(analysis => {
          sendResponse({
            success: true,
            analysis
          });
        })
        .catch(error => {
          console.error('Error analyzing image:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep the message channel open for async response

    case 'audioCaptureBegan':
    case 'audioCaptureEnded':
    case 'audioCaptureError':
    case 'transcriptionError':
    case 'silenceDetected':
      // Log these events
      console.log(`Audio event: ${message.action}`, message);
      sendResponse({ received: true });
      break;
  }
});
/**
 * CandidAI Service Worker - Simplified JavaScript Version for E2E Testing
 * Central Orchestration Layer for Extension Functionality
 */

console.log('CandidAI Service Worker starting...');

// Simple state management
const state = {
  activeInterviews: new Map(),
  sidePanelStates: new Map(),
  config: null
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('CandidAI Extension installed:', details);
  
  // Set default configuration
  await chrome.storage.local.set({
    appConfig: {
      version: '1.0.0',
      features: {
        aiAssistance: true,
        transcription: true,
        contextAnalysis: true
      }
    }
  });

  // Open options page on first install
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

// Handle startup
chrome.runtime.onStartup.addListener(() => {
  console.log('CandidAI Service Worker starting up');
});

// Message handler for inter-component communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);

  const { command, data } = request;

  switch (command) {
    case 'ping':
      sendResponse({ success: true, message: 'pong' });
      break;

    case 'init_interview':
      console.log('Initializing interview session');
      const sessionId = 'session_' + Date.now();
      state.activeInterviews.set(sessionId, {
        id: sessionId,
        startTime: Date.now(),
        platform: data?.platform || 'unknown',
        status: 'active'
      });
      sendResponse({ success: true, sessionId });
      break;

    case 'end_interview':
      console.log('Ending interview session');
      const sessionToEnd = data?.sessionId;
      if (sessionToEnd && state.activeInterviews.has(sessionToEnd)) {
        state.activeInterviews.delete(sessionToEnd);
        sendResponse({ success: true, message: 'Session ended' });
      } else {
        sendResponse({ success: false, error: 'Session not found' });
      }
      break;

    case 'get_state':
      sendResponse({
        success: true,
        activeInterviews: Array.from(state.activeInterviews.values()),
        timestamp: Date.now()
      });
      break;

    case 'test_connection':
      sendResponse({
        success: true,
        message: 'Service worker is responsive',
        timestamp: Date.now()
      });
      break;

    default:
      console.log('Unknown command:', command);
      sendResponse({ success: false, error: 'Unknown command' });
  }

  return true; // Keep message channel open for async responses
});

// Handle port connections (for sidepanel communication)
chrome.runtime.onConnect.addListener((port) => {
  console.log('Port connected:', port.name);

  if (port.name === 'sidepanel') {
    port.onMessage.addListener((message) => {
      console.log('Sidepanel message:', message);
      
      // Echo back with acknowledgment
      port.postMessage({
        type: 'ack',
        originalMessage: message,
        timestamp: Date.now()
      });
    });

    port.onDisconnect.addListener(() => {
      console.log('Sidepanel disconnected');
    });
  }
});

// Handle action clicks (extension icon)
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked, tab:', tab.id);
  
  try {
    // Open side panel
    await chrome.sidePanel.open({ tabId: tab.id });
    console.log('Side panel opened successfully');
  } catch (error) {
    console.error('Failed to open side panel:', error);
  }
});

// Configure side panel behavior
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => {
    console.error('Side panel configuration failed:', error);
  });

console.log('CandidAI Service Worker initialized successfully'); 
/**
 * Integration tests for service worker and sidepanel communication
 */

// Mock the chrome API
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  sidePanel: {
    open: jest.fn()
  },
  tabs: {
    query: jest.fn()
  }
};

// Import the modules under test
import '../src/background/service-worker.js';
import '../src/sidepanel/sidepanel.js';

describe('Service Worker and Sidepanel Integration', () => {
  let messageListeners = [];
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock chrome.runtime.onMessage.addListener to capture listeners
    chrome.runtime.onMessage.addListener.mockImplementation(listener => {
      messageListeners.push(listener);
    });
    
    // Mock chrome.runtime.sendMessage to call listeners
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      // Find a listener that handles this message
      for (const listener of messageListeners) {
        const response = listener(message, {}, callback || (() => {}));
        if (response === true) {
          // This listener will handle the message asynchronously
          return;
        }
      }
      
      // If no listener handled the message, call the callback with no response
      if (callback) {
        callback();
      }
    });
    
    // Mock storage.local.get to return default settings
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      const result = {};
      
      if (keys.includes('isListening')) {
        result.isListening = false;
      }
      
      if (keys.includes('transcriptionLanguage')) {
        result.transcriptionLanguage = 'en-US';
      }
      
      if (keys.includes('preferredLLM')) {
        result.preferredLLM = 'openai';
      }
      
      if (keys.includes('apiKeys')) {
        result.apiKeys = {
          openai: 'mock-openai-key'
        };
      }
      
      callback(result);
    });
    
    // Mock tabs.query to return a mock tab
    chrome.tabs.query.mockImplementation((query, callback) => {
      callback([{
        id: 1,
        url: 'https://meet.google.com/abc-def-ghi'
      }]);
    });
  });
  
  afterEach(() => {
    // Clear message listeners
    messageListeners = [];
  });
  
  describe('Listening Status', () => {
    it('should update the sidepanel when listening status changes', async () => {
      // Find the listener for listeningStatusChanged
      const sidepanelListeners = messageListeners.filter(listener => {
        // Test with a listeningStatusChanged message
        const handled = listener({
          action: 'listeningStatusChanged',
          isListening: true
        }, {}, () => {});
        
        // Return true if the listener handled the message
        return handled !== true;
      });
      
      expect(sidepanelListeners.length).toBeGreaterThan(0);
      
      // Mock the DOM elements that would be updated
      document.body.innerHTML = `
        <div id="listeningStatus">Not listening</div>
        <button id="startListeningButton">Start Listening</button>
        <button id="stopListeningButton" style="display: none;">Stop Listening</button>
      `;
      
      // Simulate a listeningStatusChanged message
      chrome.runtime.sendMessage({
        action: 'listeningStatusChanged',
        isListening: true
      });
      
      // Check that the UI was updated
      expect(document.getElementById('listeningStatus').textContent).toBe('Listening');
      expect(document.getElementById('startListeningButton').style.display).toBe('none');
      expect(document.getElementById('stopListeningButton').style.display).toBe('block');
    });
  });
  
  describe('Transcription Updates', () => {
    it('should update the transcription display when new transcription is received', async () => {
      // Mock the DOM elements that would be updated
      document.body.innerHTML = `
        <div id="transcriptionContainer">
          <div id="transcriptionText"></div>
        </div>
      `;
      
      // Simulate an updateTranscription message
      chrome.runtime.sendMessage({
        action: 'updateTranscription',
        text: 'Hello, world!',
        isFinal: true
      });
      
      // Check that the UI was updated
      expect(document.getElementById('transcriptionText').textContent).toBe('Hello, world!');
    });
  });
  
  describe('Suggestion Updates', () => {
    it('should update the suggestions display when new suggestions are received', async () => {
      // Mock the DOM elements that would be updated
      document.body.innerHTML = `
        <div id="suggestionsContainer">
          <div id="suggestionsText"></div>
          <div id="loadingIndicator" style="display: none;"></div>
        </div>
      `;
      
      // Simulate an updateSuggestions message with loading state
      chrome.runtime.sendMessage({
        action: 'updateSuggestions',
        text: 'Generating response...',
        isLoading: true
      });
      
      // Check that the loading state was shown
      expect(document.getElementById('loadingIndicator').style.display).toBe('block');
      expect(document.getElementById('suggestionsText').textContent).toBe('Generating response...');
      
      // Simulate an updateSuggestions message with the final response
      chrome.runtime.sendMessage({
        action: 'updateSuggestions',
        text: 'Here is my suggestion for your interview.',
        isLoading: false,
        metadata: {
          provider: 'openai',
          model: 'gpt-4',
          tokens: 150
        }
      });
      
      // Check that the loading state was hidden and the suggestion was shown
      expect(document.getElementById('loadingIndicator').style.display).toBe('none');
      expect(document.getElementById('suggestionsText').textContent).toBe('Here is my suggestion for your interview.');
    });
  });
  
  describe('Platform Updates', () => {
    it('should update the platform indicator when the platform changes', async () => {
      // Mock the DOM elements that would be updated
      document.body.innerHTML = `
        <div id="platformIndicator">
          <span id="platformName">Unknown</span>
        </div>
      `;
      
      // Simulate an updatePlatform message
      chrome.runtime.sendMessage({
        action: 'updatePlatform',
        platform: 'Google Meet'
      });
      
      // Check that the UI was updated
      expect(document.getElementById('platformName').textContent).toBe('Google Meet');
    });
  });
  
  describe('Start/Stop Listening', () => {
    it('should send the correct messages when start/stop listening buttons are clicked', async () => {
      // Mock the DOM elements
      document.body.innerHTML = `
        <button id="startListeningButton">Start Listening</button>
        <button id="stopListeningButton" style="display: none;">Stop Listening</button>
      `;
      
      // Get the buttons
      const startButton = document.getElementById('startListeningButton');
      const stopButton = document.getElementById('stopListeningButton');
      
      // Click the start button
      startButton.click();
      
      // Check that the correct message was sent
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        { action: 'startListening' },
        expect.any(Function)
      );
      
      // Click the stop button
      stopButton.click();
      
      // Check that the correct message was sent
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        { action: 'stopListening' },
        expect.any(Function)
      );
    });
  });
});

/**
 * Jest Test Setup Configuration
 * Implements comprehensive testing environment for Chrome Extension
 * Follows enterprise testing standards with proper mocking and security
 */

import 'jest-environment-jsdom';

// =============================================================================
// GLOBAL TEST CONFIGURATION
// =============================================================================

// Set test timeout for async operations
jest.setTimeout(30000);

// =============================================================================
// CHROME EXTENSION API MOCKS
// =============================================================================

/**
 * Mock Chrome Extension APIs
 * Provides comprehensive mocking for all Chrome extension APIs used
 */
const createMockChrome = (): typeof chrome => {
  const mockChrome = {
    runtime: {
      id: 'test-extension-id',
      onInstalled: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        hasListener: jest.fn(),
      },
      onStartup: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        hasListener: jest.fn(),
      },
      onMessage: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        hasListener: jest.fn(),
      },
      onConnect: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        hasListener: jest.fn(),
      },
      sendMessage: jest.fn(),
      connect: jest.fn(),
      openOptionsPage: jest.fn(),
      getManifest: jest.fn(() => ({
        manifest_version: 3,
        name: 'Test Extension',
        version: '1.0.0',
      })),
      getURL: jest.fn((path: string) => `chrome-extension://test-id/${path}`),
      lastError: undefined,
    },
    storage: {
      local: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn(),
        getBytesInUse: jest.fn(),
        onChanged: {
          addListener: jest.fn(),
          removeListener: jest.fn(),
          hasListener: jest.fn(),
        },
      },
      session: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn(),
        getBytesInUse: jest.fn(),
        onChanged: {
          addListener: jest.fn(),
          removeListener: jest.fn(),
          hasListener: jest.fn(),
        },
      },
      sync: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn(),
        getBytesInUse: jest.fn(),
        onChanged: {
          addListener: jest.fn(),
          removeListener: jest.fn(),
          hasListener: jest.fn(),
        },
      },
      onChanged: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        hasListener: jest.fn(),
      },
    },
    tabs: {
      query: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      executeScript: jest.fn(),
      insertCSS: jest.fn(),
      onActivated: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        hasListener: jest.fn(),
      },
      onUpdated: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        hasListener: jest.fn(),
      },
    },
    action: {
      onClicked: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        hasListener: jest.fn(),
      },
      setTitle: jest.fn(),
      setIcon: jest.fn(),
      setBadgeText: jest.fn(),
      setBadgeBackgroundColor: jest.fn(),
    },
    sidePanel: {
      setPanelBehavior: jest.fn(),
      setOptions: jest.fn(),
      getOptions: jest.fn(),
    },
    scripting: {
      executeScript: jest.fn(),
      insertCSS: jest.fn(),
      removeCSS: jest.fn(),
    },
    notifications: {
      create: jest.fn(),
      clear: jest.fn(),
      getAll: jest.fn(),
      onClicked: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        hasListener: jest.fn(),
      },
    },
    offscreen: {
      createDocument: jest.fn(),
      closeDocument: jest.fn(),
      hasDocument: jest.fn(),
    },
  } as unknown as typeof chrome;

  return mockChrome;
};

// Set up global chrome mock
const mockChrome = createMockChrome();
Object.defineProperty(global, 'chrome', {
  value: mockChrome,
  writable: true,
});

// =============================================================================
// WEB APIs MOCKS
// =============================================================================

/**
 * Mock Web Speech API
 */
const mockSpeechRecognition = {
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  maxAlternatives: 1,
  serviceURI: '',
  grammars: null,
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  onaudiostart: null,
  onaudioend: null,
  onend: null,
  onerror: null,
  onnomatch: null,
  onresult: null,
  onsoundstart: null,
  onsoundend: null,
  onspeechstart: null,
  onspeechend: null,
  onstart: null,
};

Object.defineProperty(global, 'SpeechRecognition', {
  value: jest.fn(() => mockSpeechRecognition),
  writable: true,
});

Object.defineProperty(global, 'webkitSpeechRecognition', {
  value: jest.fn(() => mockSpeechRecognition),
  writable: true,
});

/**
 * Mock MediaDevices API
 */
const mockMediaDevices = {
  getUserMedia: jest.fn(),
  getDisplayMedia: jest.fn(),
  enumerateDevices: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  ondevicechange: null,
};

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: mockMediaDevices,
  writable: true,
});

/**
 * Mock IntersectionObserver
 */
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.prototype.observe = jest.fn();
mockIntersectionObserver.prototype.unobserve = jest.fn();
mockIntersectionObserver.prototype.disconnect = jest.fn();

Object.defineProperty(global, 'IntersectionObserver', {
  value: mockIntersectionObserver,
  writable: true,
});

/**
 * Mock MutationObserver
 */
const mockMutationObserver = jest.fn();
mockMutationObserver.prototype.observe = jest.fn();
mockMutationObserver.prototype.disconnect = jest.fn();
mockMutationObserver.prototype.takeRecords = jest.fn();

Object.defineProperty(global, 'MutationObserver', {
  value: mockMutationObserver,
  writable: true,
});

// =============================================================================
// CUSTOM MATCHERS
// =============================================================================

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidChromExtensionMessage(): R;
      toBeValidSessionContext(): R;
      toBeValidTranscriptionData(): R;
    }
  }
}

expect.extend({
  toBeValidChromExtensionMessage(received: unknown) {
    const isValid = 
      typeof received === 'object' &&
      received !== null &&
      'command' in received &&
      typeof (received as any).command === 'string';

    return {
      message: () => 
        `expected ${received} to be a valid Chrome extension message`,
      pass: isValid,
    };
  },

  toBeValidSessionContext(received: unknown) {
    const isValid = 
      typeof received === 'object' &&
      received !== null &&
      'sessionId' in received &&
      'callType' in received &&
      'participants' in received;

    return {
      message: () => 
        `expected ${received} to be a valid session context`,
      pass: isValid,
    };
  },

  toBeValidTranscriptionData(received: unknown) {
    const isValid = 
      typeof received === 'object' &&
      received !== null &&
      'text' in received &&
      typeof (received as any).text === 'string';

    return {
      message: () => 
        `expected ${received} to be a valid transcription data`,
      pass: isValid,
    };
  },
});

// =============================================================================
// TEST UTILITIES
// =============================================================================

/**
 * Create mock chrome port for testing
 */
export const createMockPort = (name: string): chrome.runtime.Port => ({
  name,
  disconnect: jest.fn(),
  onDisconnect: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  } as any,
  onMessage: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn(),
  } as any,
  postMessage: jest.fn(),
  sender: {
    tab: {
      id: 123,
      url: 'https://example.com',
      title: 'Test Tab',
    },
  },
});

/**
 * Reset all chrome API mocks
 */
export const resetChromeMocks = (): void => {
  Object.values(mockChrome.runtime).forEach((mock: any) => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
    if (mock && typeof mock === 'object' && 'addListener' in mock) {
      mock.addListener.mockReset();
      mock.removeListener.mockReset();
      mock.hasListener.mockReset();
    }
  });

  Object.values(mockChrome.storage.local).forEach((mock: any) => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });

  Object.values(mockChrome.tabs).forEach((mock: any) => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });
};

// =============================================================================
// CONSOLE CONTROL
// =============================================================================

// Suppress console warnings during tests unless explicitly needed
const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
  // Reset mocks before each test
  resetChromeMocks();
  
  // Suppress console noise unless test explicitly needs it
  if (!process.env.JEST_VERBOSE) {
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

afterEach(() => {
  // Restore console methods
  console.warn = originalWarn;
  console.error = originalError;
  
  // Clear all timers
  jest.clearAllTimers();
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

// Catch unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  throw reason;
}); 
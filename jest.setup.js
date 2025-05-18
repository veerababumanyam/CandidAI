/**
 * Jest setup file for CandidAI
 * This file runs before each test file
 */

// Mock fetch API
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn(index => null)
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn(index => null)
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockImplementation(() => Promise.resolve({
      getTracks: () => [{
        stop: jest.fn()
      }]
    })),
    getDisplayMedia: jest.fn().mockImplementation(() => Promise.resolve({
      getTracks: () => [{
        stop: jest.fn()
      }]
    }))
  },
  writable: true
});

// Mock SpeechRecognition
class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'en-US';
    this.maxAlternatives = 1;
    this.onstart = null;
    this.onend = null;
    this.onresult = null;
    this.onerror = null;
    this.onspeechstart = null;
    this.onspeechend = null;
    this.onnomatch = null;
    this.onaudiostart = null;
    this.onaudioend = null;
    this.onsoundstart = null;
    this.onsoundend = null;
  }

  start() {
    if (this.onstart) this.onstart();
  }

  stop() {
    if (this.onend) this.onend();
  }

  abort() {
    if (this.onend) this.onend();
  }
}

// Mock SpeechGrammarList
class MockSpeechGrammarList {
  constructor() {
    this.length = 0;
  }

  addFromString(grammar, weight) {}
  addFromURI(src, weight) {}
  item(index) { return null; }
}

// Assign to global
global.SpeechRecognition = MockSpeechRecognition;
global.webkitSpeechRecognition = MockSpeechRecognition;
global.SpeechGrammarList = MockSpeechGrammarList;
global.webkitSpeechGrammarList = MockSpeechGrammarList;

// Mock SpeechSynthesis
const mockSpeechSynthesis = {
  speaking: false,
  pending: false,
  paused: false,
  onvoiceschanged: null,
  getVoices: jest.fn().mockReturnValue([
    {
      name: 'English (US)',
      lang: 'en-US',
      default: true,
      localService: true,
      voiceURI: 'English (US)'
    },
    {
      name: 'Spanish (Spain)',
      lang: 'es-ES',
      default: false,
      localService: true,
      voiceURI: 'Spanish (Spain)'
    }
  ]),
  speak: jest.fn(utterance => {
    mockSpeechSynthesis.speaking = true;
    if (utterance.onstart) utterance.onstart();
    setTimeout(() => {
      mockSpeechSynthesis.speaking = false;
      if (utterance.onend) utterance.onend();
    }, 100);
  }),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn()
};

// Mock SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  constructor(text) {
    this.text = text || '';
    this.lang = 'en-US';
    this.voice = null;
    this.volume = 1;
    this.rate = 1;
    this.pitch = 1;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
    this.onpause = null;
    this.onresume = null;
    this.onmark = null;
    this.onboundary = null;
  }
}

// Assign to global
global.speechSynthesis = mockSpeechSynthesis;
global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock AudioContext
class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.sampleRate = 44100;
    this.currentTime = 0;
    this.destination = {
      channelCount: 2,
      channelCountMode: 'explicit',
      channelInterpretation: 'speakers',
      maxChannelCount: 2
    };
  }

  createMediaStreamSource() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn()
    };
  }

  createAnalyser() {
    return {
      fftSize: 2048,
      frequencyBinCount: 1024,
      minDecibels: -100,
      maxDecibels: -30,
      smoothingTimeConstant: 0.8,
      getFloatFrequencyData: jest.fn(),
      getByteFrequencyData: jest.fn(),
      getFloatTimeDomainData: jest.fn(),
      getByteTimeDomainData: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn()
    };
  }

  createGain() {
    return {
      gain: {
        value: 1,
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn()
      },
      connect: jest.fn(),
      disconnect: jest.fn()
    };
  }

  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        value: 440,
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn()
      },
      start: jest.fn(),
      stop: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn()
    };
  }

  close() {
    this.state = 'closed';
    return Promise.resolve();
  }

  suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }

  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
}

global.AudioContext = MockAudioContext;
global.webkitAudioContext = MockAudioContext;

/**
 * Integration tests for options page and storage
 */

// Mock the chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  runtime: {
    getURL: jest.fn(path => `chrome-extension://mock-extension-id/${path}`),
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  tabs: {
    create: jest.fn()
  }
};

// Import the module under test
import '../src/options/options.js';

describe('Options Page and Storage Integration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock storage.local.get to return default settings
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      const result = {};
      
      if (keys.includes('apiKeys')) {
        result.apiKeys = {
          openai: 'mock-openai-key',
          anthropic: '',
          google: ''
        };
      }
      
      if (keys.includes('providerSettings')) {
        result.providerSettings = {
          primaryProvider: 'openai',
          fallbackProvider: 'anthropic',
          openaiModel: 'gpt-4',
          anthropicModel: 'claude-3-opus',
          googleModel: 'gemini-pro'
        };
      }
      
      if (keys.includes('transcriptionSettings')) {
        result.transcriptionSettings = {
          language: 'en-US',
          useExternalSTT: false,
          preferredSTT: 'webSpeech',
          silenceDetectionThreshold: 0.01,
          silenceTimeout: 1500
        };
      }
      
      if (keys.includes('responseStyleSettings')) {
        result.responseStyleSettings = {
          tone: 'professional',
          length: 'medium',
          detail: 'medium'
        };
      }
      
      if (keys.includes('languageSettings')) {
        result.languageSettings = {
          interface: 'en',
          response: 'en'
        };
      }
      
      if (keys.includes('accessibilitySettings')) {
        result.accessibilitySettings = {
          fontSize: 'medium',
          autoScroll: true
        };
      }
      
      if (keys.includes('historyConsentGiven')) {
        result.historyConsentGiven = false;
      }
      
      callback(result);
    });
    
    // Set up a mock DOM for the options page
    document.body.innerHTML = `
      <form id="apiKeyForm">
        <input type="password" id="openaiApiKey" value="">
        <input type="password" id="anthropicApiKey" value="">
        <input type="password" id="googleApiKey" value="">
        <button type="submit">Save API Keys</button>
      </form>
      
      <form id="providerSettingsForm">
        <select id="primaryProvider">
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="google">Google</option>
        </select>
        
        <select id="fallbackProvider">
          <option value="none">None</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="google">Google</option>
        </select>
        
        <select id="openaiModel">
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        </select>
        
        <select id="anthropicModel">
          <option value="claude-3-opus">Claude 3 Opus</option>
          <option value="claude-3-sonnet">Claude 3 Sonnet</option>
        </select>
        
        <select id="googleModel">
          <option value="gemini-pro">Gemini Pro</option>
        </select>
        
        <button type="submit">Save Provider Settings</button>
      </form>
      
      <form id="transcriptionSettingsForm">
        <select id="transcriptionLanguage">
          <option value="en-US">English (US)</option>
          <option value="es-ES">Spanish (Spain)</option>
        </select>
        
        <input type="checkbox" id="useExternalSTT">
        
        <select id="preferredSTT">
          <option value="webSpeech">Web Speech API</option>
          <option value="openai">OpenAI Whisper</option>
        </select>
        
        <input type="range" id="silenceDetectionThreshold" min="0.001" max="0.05" step="0.001" value="0.01">
        
        <input type="range" id="silenceTimeout" min="500" max="3000" step="100" value="1500">
        
        <button type="submit">Save Transcription Settings</button>
      </form>
      
      <form id="responseStyleSettingsForm">
        <select id="responseTone">
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
          <option value="concise">Concise</option>
        </select>
        
        <select id="responseLength">
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </select>
        
        <select id="responseDetail">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        
        <button type="submit">Save Response Style Settings</button>
      </form>
      
      <form id="languageSettingsForm">
        <select id="interfaceLanguage">
          <option value="en">English</option>
          <option value="es">Spanish</option>
        </select>
        
        <select id="responseLanguage">
          <option value="same">Same as transcription</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
        </select>
        
        <button type="submit">Save Language Settings</button>
      </form>
      
      <form id="accessibilitySettingsForm">
        <select id="fontSize">
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
        
        <input type="checkbox" id="autoScroll">
        
        <button type="submit">Save Accessibility Settings</button>
      </form>
      
      <form id="historyConsentForm">
        <input type="checkbox" id="historyConsent">
        <button type="submit">Save History Consent</button>
      </form>
    `;
  });
  
  describe('API Key Settings', () => {
    it('should load API keys from storage', () => {
      // Trigger the DOMContentLoaded event
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      // Check that the API keys were loaded
      expect(document.getElementById('openaiApiKey').value).toBe('mock-openai-key');
    });
    
    it('should save API keys to storage', () => {
      // Trigger the DOMContentLoaded event
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      // Set new API key values
      document.getElementById('openaiApiKey').value = 'new-openai-key';
      document.getElementById('anthropicApiKey').value = 'new-anthropic-key';
      document.getElementById('googleApiKey').value = 'new-google-key';
      
      // Submit the form
      document.getElementById('apiKeyForm').dispatchEvent(new Event('submit'));
      
      // Check that the API keys were saved
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        apiKeys: {
          openai: 'new-openai-key',
          anthropic: 'new-anthropic-key',
          google: 'new-google-key'
        }
      }, expect.any(Function));
    });
  });
  
  describe('Provider Settings', () => {
    it('should load provider settings from storage', () => {
      // Trigger the DOMContentLoaded event
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      // Check that the provider settings were loaded
      expect(document.getElementById('primaryProvider').value).toBe('openai');
      expect(document.getElementById('fallbackProvider').value).toBe('anthropic');
      expect(document.getElementById('openaiModel').value).toBe('gpt-4');
      expect(document.getElementById('anthropicModel').value).toBe('claude-3-opus');
      expect(document.getElementById('googleModel').value).toBe('gemini-pro');
    });
    
    it('should save provider settings to storage', () => {
      // Trigger the DOMContentLoaded event
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      // Set new provider settings
      document.getElementById('primaryProvider').value = 'anthropic';
      document.getElementById('fallbackProvider').value = 'openai';
      document.getElementById('openaiModel').value = 'gpt-3.5-turbo';
      document.getElementById('anthropicModel').value = 'claude-3-sonnet';
      
      // Submit the form
      document.getElementById('providerSettingsForm').dispatchEvent(new Event('submit'));
      
      // Check that the provider settings were saved
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        providerSettings: {
          primaryProvider: 'anthropic',
          fallbackProvider: 'openai',
          openaiModel: 'gpt-3.5-turbo',
          anthropicModel: 'claude-3-sonnet',
          googleModel: 'gemini-pro'
        }
      }, expect.any(Function));
    });
  });
  
  describe('Transcription Settings', () => {
    it('should load transcription settings from storage', () => {
      // Trigger the DOMContentLoaded event
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      // Check that the transcription settings were loaded
      expect(document.getElementById('transcriptionLanguage').value).toBe('en-US');
      expect(document.getElementById('useExternalSTT').checked).toBe(false);
      expect(document.getElementById('preferredSTT').value).toBe('webSpeech');
      expect(document.getElementById('silenceDetectionThreshold').value).toBe('0.01');
      expect(document.getElementById('silenceTimeout').value).toBe('1500');
    });
    
    it('should save transcription settings to storage', () => {
      // Trigger the DOMContentLoaded event
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      // Set new transcription settings
      document.getElementById('transcriptionLanguage').value = 'es-ES';
      document.getElementById('useExternalSTT').checked = true;
      document.getElementById('preferredSTT').value = 'openai';
      document.getElementById('silenceDetectionThreshold').value = '0.02';
      document.getElementById('silenceTimeout').value = '2000';
      
      // Submit the form
      document.getElementById('transcriptionSettingsForm').dispatchEvent(new Event('submit'));
      
      // Check that the transcription settings were saved
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        transcriptionSettings: {
          language: 'es-ES',
          useExternalSTT: true,
          preferredSTT: 'openai',
          silenceDetectionThreshold: 0.02,
          silenceTimeout: 2000
        }
      }, expect.any(Function));
    });
  });
});

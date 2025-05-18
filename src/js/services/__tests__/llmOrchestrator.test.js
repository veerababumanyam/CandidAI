/**
 * Unit tests for llmOrchestrator service
 */

// Mock the chrome API
global.chrome = {
  ...global.chrome,
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
};

// Mock the API providers
jest.mock('../providers/openaiProvider.js', () => ({
  __esModule: true,
  default: {
    generateResponse: jest.fn().mockResolvedValue({
      text: 'Response from OpenAI',
      provider: 'openai',
      model: 'gpt-4',
      usage: {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150
      }
    })
  }
}));

jest.mock('../providers/anthropicProvider.js', () => ({
  __esModule: true,
  default: {
    generateResponse: jest.fn().mockResolvedValue({
      text: 'Response from Anthropic',
      provider: 'anthropic',
      model: 'claude-3-opus',
      usage: {
        promptTokens: 120,
        completionTokens: 60,
        totalTokens: 180
      }
    })
  }
}));

jest.mock('../providers/googleProvider.js', () => ({
  __esModule: true,
  default: {
    generateResponse: jest.fn().mockResolvedValue({
      text: 'Response from Google',
      provider: 'google',
      model: 'gemini-pro',
      usage: {
        promptTokens: 90,
        completionTokens: 40,
        totalTokens: 130
      }
    })
  }
}));

// Mock the prompt engineering service
jest.mock('../promptEngineering.js', () => ({
  __esModule: true,
  default: {
    createPrompt: jest.fn().mockReturnValue('Engineered prompt')
  }
}));

// Import the module under test
import llmOrchestrator from '../llmOrchestrator.js';

describe('llmOrchestrator', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock storage.local.get to return default settings
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      const result = {};
      
      if (keys.includes('apiKeys') || keys.includes('apiKey')) {
        result.apiKeys = {
          openai: 'mock-openai-key',
          anthropic: 'mock-anthropic-key',
          google: 'mock-google-key'
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
      
      callback(result);
    });
  });
  
  describe('generateResponse', () => {
    it('should generate a response using the primary provider', async () => {
      const prompt = 'Test prompt';
      const options = {};
      
      const response = await llmOrchestrator.generateResponse(prompt, options);
      
      expect(response).toBeDefined();
      expect(response.text).toBe('Response from OpenAI');
      expect(response.provider).toBe('openai');
      expect(response.model).toBe('gpt-4');
      
      // Check that the prompt engineering service was called
      const promptEngineering = require('../promptEngineering.js').default;
      expect(promptEngineering.createPrompt).toHaveBeenCalledWith(prompt, expect.any(Object));
      
      // Check that the primary provider was called
      const openaiProvider = require('../providers/openaiProvider.js').default;
      expect(openaiProvider.generateResponse).toHaveBeenCalled();
    });
    
    it('should use the fallback provider if the primary provider fails', async () => {
      // Make the primary provider fail
      const openaiProvider = require('../providers/openaiProvider.js').default;
      openaiProvider.generateResponse.mockRejectedValueOnce(new Error('API error'));
      
      const prompt = 'Test prompt';
      const options = {};
      
      const response = await llmOrchestrator.generateResponse(prompt, options);
      
      expect(response).toBeDefined();
      expect(response.text).toBe('Response from Anthropic');
      expect(response.provider).toBe('anthropic');
      expect(response.model).toBe('claude-3-opus');
      expect(response.usedFallback).toBe(true);
      expect(response.originalProvider).toBe('openai');
      
      // Check that both providers were called
      expect(openaiProvider.generateResponse).toHaveBeenCalled();
      const anthropicProvider = require('../providers/anthropicProvider.js').default;
      expect(anthropicProvider.generateResponse).toHaveBeenCalled();
    });
    
    it('should use a specific provider if requested', async () => {
      const prompt = 'Test prompt';
      const options = {
        provider: 'google'
      };
      
      const response = await llmOrchestrator.generateResponse(prompt, options);
      
      expect(response).toBeDefined();
      expect(response.text).toBe('Response from Google');
      expect(response.provider).toBe('google');
      expect(response.model).toBe('gemini-pro');
      
      // Check that the requested provider was called
      const googleProvider = require('../providers/googleProvider.js').default;
      expect(googleProvider.generateResponse).toHaveBeenCalled();
      
      // Check that other providers were not called
      const openaiProvider = require('../providers/openaiProvider.js').default;
      expect(openaiProvider.generateResponse).not.toHaveBeenCalled();
    });
    
    it('should use a specific model if requested', async () => {
      const prompt = 'Test prompt';
      const options = {
        model: 'gpt-3.5-turbo'
      };
      
      await llmOrchestrator.generateResponse(prompt, options);
      
      // Check that the provider was called with the requested model
      const openaiProvider = require('../providers/openaiProvider.js').default;
      expect(openaiProvider.generateResponse).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          model: 'gpt-3.5-turbo'
        })
      );
    });
    
    it('should pass through temperature and maxTokens options', async () => {
      const prompt = 'Test prompt';
      const options = {
        temperature: 0.7,
        maxTokens: 500
      };
      
      await llmOrchestrator.generateResponse(prompt, options);
      
      // Check that the provider was called with the requested options
      const openaiProvider = require('../providers/openaiProvider.js').default;
      expect(openaiProvider.generateResponse).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          temperature: 0.7,
          maxTokens: 500
        })
      );
    });
    
    it('should include response language in the context if specified', async () => {
      // Mock storage.local.get to return a non-English language
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        const result = {};
        
        if (keys.includes('apiKeys') || keys.includes('apiKey')) {
          result.apiKeys = {
            openai: 'mock-openai-key'
          };
        }
        
        if (keys.includes('providerSettings')) {
          result.providerSettings = {
            primaryProvider: 'openai',
            openaiModel: 'gpt-4'
          };
        }
        
        if (keys.includes('languageSettings')) {
          result.languageSettings = {
            interface: 'en',
            response: 'es' // Spanish
          };
        }
        
        callback(result);
      });
      
      const prompt = 'Test prompt';
      const options = {};
      
      await llmOrchestrator.generateResponse(prompt, options);
      
      // Check that the prompt engineering service was called with the language in the context
      const promptEngineering = require('../promptEngineering.js').default;
      expect(promptEngineering.createPrompt).toHaveBeenCalledWith(
        prompt,
        expect.objectContaining({
          language: {
            response: 'es'
          }
        })
      );
    });
  });
});

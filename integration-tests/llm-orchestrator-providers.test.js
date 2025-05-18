/**
 * Integration tests for LLM orchestrator and providers
 */

// Mock the chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
};

// Mock the fetch API
global.fetch = jest.fn();

// Import the modules under test
import llmOrchestrator from '../src/js/services/llmOrchestrator.js';
import openaiProvider from '../src/js/services/providers/openaiProvider.js';
import anthropicProvider from '../src/js/services/providers/anthropicProvider.js';
import googleProvider from '../src/js/services/providers/googleProvider.js';
import promptEngineering from '../src/js/services/promptEngineering.js';

describe('LLM Orchestrator and Providers Integration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock storage.local.get to return default settings
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      const result = {};
      
      if (keys.includes('apiKeys')) {
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
    
    // Mock fetch to return a successful response for OpenAI
    global.fetch.mockImplementation(async (url, options) => {
      if (url.includes('openai.com')) {
        return {
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: 'Response from OpenAI'
                }
              }
            ],
            usage: {
              prompt_tokens: 100,
              completion_tokens: 50,
              total_tokens: 150
            },
            model: 'gpt-4'
          })
        };
      }
      
      if (url.includes('anthropic.com')) {
        return {
          ok: true,
          json: async () => ({
            content: [
              {
                text: 'Response from Anthropic'
              }
            ],
            usage: {
              input_tokens: 120,
              output_tokens: 60
            },
            model: 'claude-3-opus'
          })
        };
      }
      
      if (url.includes('generativelanguage.googleapis.com')) {
        return {
          ok: true,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: 'Response from Google'
                    }
                  ]
                }
              }
            ],
            usage: {
              promptTokenCount: 90,
              candidatesTokenCount: 40,
              totalTokenCount: 130
            }
          })
        };
      }
      
      return {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
    });
  });
  
  describe('OpenAI Provider', () => {
    it('should generate a response using the OpenAI API', async () => {
      const prompt = 'Test prompt for OpenAI';
      const options = {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 500
      };
      
      const response = await openaiProvider.generateResponse(prompt, options);
      
      expect(response).toBeDefined();
      expect(response.text).toBe('Response from OpenAI');
      expect(response.provider).toBe('openai');
      expect(response.model).toBe('gpt-4');
      expect(response.usage).toEqual({
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150
      });
      
      // Check that fetch was called with the correct parameters
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('openai.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-openai-key'
          }),
          body: expect.stringContaining(prompt)
        })
      );
    });
  });
  
  describe('Anthropic Provider', () => {
    it('should generate a response using the Anthropic API', async () => {
      const prompt = 'Test prompt for Anthropic';
      const options = {
        model: 'claude-3-opus',
        temperature: 0.7,
        maxTokens: 500
      };
      
      const response = await anthropicProvider.generateResponse(prompt, options);
      
      expect(response).toBeDefined();
      expect(response.text).toBe('Response from Anthropic');
      expect(response.provider).toBe('anthropic');
      expect(response.model).toBe('claude-3-opus');
      expect(response.usage).toEqual({
        promptTokens: 120,
        completionTokens: 60,
        totalTokens: 180
      });
      
      // Check that fetch was called with the correct parameters
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('anthropic.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': 'mock-anthropic-key'
          }),
          body: expect.stringContaining(prompt)
        })
      );
    });
  });
  
  describe('Google Provider', () => {
    it('should generate a response using the Google API', async () => {
      const prompt = 'Test prompt for Google';
      const options = {
        model: 'gemini-pro',
        temperature: 0.7,
        maxTokens: 500
      };
      
      const response = await googleProvider.generateResponse(prompt, options);
      
      expect(response).toBeDefined();
      expect(response.text).toBe('Response from Google');
      expect(response.provider).toBe('google');
      expect(response.model).toBe('gemini-pro');
      expect(response.usage).toEqual({
        promptTokens: 90,
        completionTokens: 40,
        totalTokens: 130
      });
      
      // Check that fetch was called with the correct parameters
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining(prompt)
        })
      );
    });
  });
  
  describe('LLM Orchestrator', () => {
    it('should use the primary provider by default', async () => {
      const prompt = 'Test prompt for orchestrator';
      const options = {};
      
      const response = await llmOrchestrator.generateResponse(prompt, options);
      
      expect(response).toBeDefined();
      expect(response.text).toBe('Response from OpenAI');
      expect(response.provider).toBe('openai');
      expect(response.model).toBe('gpt-4');
      
      // Check that fetch was called with the OpenAI API
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('openai.com'),
        expect.any(Object)
      );
    });
    
    it('should use the fallback provider if the primary provider fails', async () => {
      // Make the OpenAI API fail
      fetch.mockImplementationOnce(async () => ({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: { message: 'API error' } })
      }));
      
      const prompt = 'Test prompt for orchestrator with fallback';
      const options = {};
      
      const response = await llmOrchestrator.generateResponse(prompt, options);
      
      expect(response).toBeDefined();
      expect(response.text).toBe('Response from Anthropic');
      expect(response.provider).toBe('anthropic');
      expect(response.model).toBe('claude-3-opus');
      expect(response.usedFallback).toBe(true);
      expect(response.originalProvider).toBe('openai');
      
      // Check that fetch was called with both APIs
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('openai.com'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('anthropic.com'),
        expect.any(Object)
      );
    });
    
    it('should use a specific provider if requested', async () => {
      const prompt = 'Test prompt for specific provider';
      const options = {
        provider: 'google'
      };
      
      const response = await llmOrchestrator.generateResponse(prompt, options);
      
      expect(response).toBeDefined();
      expect(response.text).toBe('Response from Google');
      expect(response.provider).toBe('google');
      expect(response.model).toBe('gemini-pro');
      
      // Check that fetch was called with the Google API
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.any(Object)
      );
      
      // Check that fetch was not called with other APIs
      expect(fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('openai.com'),
        expect.any(Object)
      );
      expect(fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('anthropic.com'),
        expect.any(Object)
      );
    });
  });
});

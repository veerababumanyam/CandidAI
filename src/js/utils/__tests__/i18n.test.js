/**
 * Unit tests for i18n utility
 */

import * as i18n from '../i18n.js';

// Mock chrome.i18n API
global.chrome = {
  ...global.chrome,
  i18n: {
    getMessage: jest.fn((key, substitutions) => {
      // Mock implementation of getMessage
      const messages = {
        'app_name': 'CandidAI',
        'welcome_message': 'Welcome to CandidAI!',
        'hello_user': 'Hello, $1!',
        'missing_key': ''
      };
      
      if (messages[key]) {
        let message = messages[key];
        
        // Handle substitutions
        if (substitutions && Array.isArray(substitutions)) {
          substitutions.forEach((sub, index) => {
            message = message.replace(`$${index + 1}`, sub);
          });
        } else if (substitutions) {
          message = message.replace('$1', substitutions);
        }
        
        return message;
      }
      
      return '';
    }),
    getUILanguage: jest.fn(() => 'en')
  }
};

describe('i18n utility', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  describe('initialize', () => {
    it('should initialize the i18n utility', async () => {
      const result = await i18n.initialize();
      expect(result).toBe(true);
    });
  });
  
  describe('getMessage', () => {
    it('should return the message for a valid key', () => {
      const message = i18n.getMessage('app_name');
      expect(message).toBe('CandidAI');
      expect(chrome.i18n.getMessage).toHaveBeenCalledWith('app_name', undefined);
    });
    
    it('should return the message with substitutions', () => {
      const message = i18n.getMessage('hello_user', 'John');
      expect(message).toBe('Hello, John!');
      expect(chrome.i18n.getMessage).toHaveBeenCalledWith('hello_user', 'John');
    });
    
    it('should return the message with array substitutions', () => {
      const message = i18n.getMessage('hello_user', ['Jane']);
      expect(message).toBe('Hello, Jane!');
      expect(chrome.i18n.getMessage).toHaveBeenCalledWith('hello_user', ['Jane']);
    });
    
    it('should return the key if the message is not found', () => {
      const message = i18n.getMessage('nonexistent_key');
      expect(message).toBe('nonexistent_key');
      expect(chrome.i18n.getMessage).toHaveBeenCalledWith('nonexistent_key', undefined);
    });
    
    it('should return the key if the message is empty', () => {
      const message = i18n.getMessage('missing_key');
      expect(message).toBe('missing_key');
      expect(chrome.i18n.getMessage).toHaveBeenCalledWith('missing_key', undefined);
    });
  });
  
  describe('getUILanguage', () => {
    it('should return the UI language', () => {
      const language = i18n.getUILanguage();
      expect(language).toBe('en');
      expect(chrome.i18n.getUILanguage).toHaveBeenCalled();
    });
  });
  
  describe('translatePage', () => {
    beforeEach(() => {
      // Set up a mock DOM for testing
      document.body.innerHTML = `
        <div>
          <h1 data-i18n="app_name"></h1>
          <p data-i18n="welcome_message"></p>
          <span data-i18n="hello_user" data-i18n-args="World"></span>
          <button data-i18n="missing_key"></button>
        </div>
      `;
    });
    
    it('should translate all elements with data-i18n attribute', () => {
      i18n.translatePage();
      
      expect(document.querySelector('h1').textContent).toBe('CandidAI');
      expect(document.querySelector('p').textContent).toBe('Welcome to CandidAI!');
      expect(document.querySelector('span').textContent).toBe('Hello, World!');
      expect(document.querySelector('button').textContent).toBe('missing_key');
      
      expect(chrome.i18n.getMessage).toHaveBeenCalledTimes(4);
    });
  });
});

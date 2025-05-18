/**
 * Unit tests for contextManager service
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

// Import the module under test
import contextManager from '../contextManager.js';

describe('contextManager', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Reset the context manager state
    contextManager.reset();
  });
  
  describe('addMessage', () => {
    it('should add a user message to the conversation history', () => {
      contextManager.addMessage('user', 'Hello, world!');
      
      const history = contextManager.getConversationHistory();
      expect(history).toHaveLength(1);
      expect(history[0].role).toBe('user');
      expect(history[0].content).toBe('Hello, world!');
    });
    
    it('should add an assistant message to the conversation history', () => {
      contextManager.addMessage('assistant', 'How can I help you?');
      
      const history = contextManager.getConversationHistory();
      expect(history).toHaveLength(1);
      expect(history[0].role).toBe('assistant');
      expect(history[0].content).toBe('How can I help you?');
    });
    
    it('should add a system message to the conversation history', () => {
      contextManager.addMessage('system', 'This is a system message');
      
      const history = contextManager.getConversationHistory();
      expect(history).toHaveLength(1);
      expect(history[0].role).toBe('system');
      expect(history[0].content).toBe('This is a system message');
    });
    
    it('should add metadata to the message if provided', () => {
      const metadata = { provider: 'openai', model: 'gpt-4', tokens: 100 };
      contextManager.addMessage('assistant', 'Response with metadata', metadata);
      
      const history = contextManager.getConversationHistory();
      expect(history).toHaveLength(1);
      expect(history[0].metadata).toEqual(metadata);
    });
  });
  
  describe('getConversationHistory', () => {
    it('should return an empty array if no messages have been added', () => {
      const history = contextManager.getConversationHistory();
      expect(history).toEqual([]);
    });
    
    it('should return all messages in the conversation history', () => {
      contextManager.addMessage('system', 'System message');
      contextManager.addMessage('user', 'User message');
      contextManager.addMessage('assistant', 'Assistant message');
      
      const history = contextManager.getConversationHistory();
      expect(history).toHaveLength(3);
      expect(history[0].role).toBe('system');
      expect(history[1].role).toBe('user');
      expect(history[2].role).toBe('assistant');
    });
    
    it('should limit the history to the specified number of messages', () => {
      contextManager.addMessage('user', 'Message 1');
      contextManager.addMessage('assistant', 'Response 1');
      contextManager.addMessage('user', 'Message 2');
      contextManager.addMessage('assistant', 'Response 2');
      
      const history = contextManager.getConversationHistory(2);
      expect(history).toHaveLength(2);
      expect(history[0].content).toBe('Message 2');
      expect(history[1].content).toBe('Response 2');
    });
  });
  
  describe('getCurrentContext', () => {
    it('should return the current context', () => {
      const context = contextManager.getCurrentContext();
      expect(context).toBeDefined();
      expect(context.platform).toBeNull();
      expect(context.inCall).toBe(false);
      expect(context.participants).toEqual([]);
      expect(context.callDuration).toBe(0);
      expect(context.platformData).toBeNull();
    });
  });
  
  describe('updatePlatform', () => {
    it('should update the platform in the current context', () => {
      contextManager.updatePlatform('Google Meet');
      
      const context = contextManager.getCurrentContext();
      expect(context.platform).toBe('Google Meet');
    });
  });
  
  describe('updateCallStatus', () => {
    it('should update the call status in the current context', () => {
      contextManager.updateCallStatus(true);
      
      const context = contextManager.getCurrentContext();
      expect(context.inCall).toBe(true);
    });
    
    it('should reset call duration when starting a call', () => {
      contextManager.updateCallStatus(true);
      
      const context = contextManager.getCurrentContext();
      expect(context.callDuration).toBe(0);
    });
  });
  
  describe('updateCallDuration', () => {
    it('should update the call duration in the current context', () => {
      contextManager.updateCallDuration(120);
      
      const context = contextManager.getCurrentContext();
      expect(context.callDuration).toBe(120);
    });
  });
  
  describe('updateParticipants', () => {
    it('should update the participants in the current context', () => {
      const participants = [
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Smith' }
      ];
      
      contextManager.updateParticipants(participants);
      
      const context = contextManager.getCurrentContext();
      expect(context.participants).toEqual(participants);
    });
  });
  
  describe('extractEntities', () => {
    it('should extract companies from text', () => {
      contextManager.extractEntities('I worked at Google and Microsoft.');
      
      const entities = contextManager.getDetectedEntities();
      expect(entities.companies).toContain('Google');
      expect(entities.companies).toContain('Microsoft');
    });
    
    it('should extract roles from text', () => {
      contextManager.extractEntities('I was a Software Engineer and Product Manager.');
      
      const entities = contextManager.getDetectedEntities();
      expect(entities.roles).toContain('Software Engineer');
      expect(entities.roles).toContain('Product Manager');
    });
    
    it('should extract skills from text', () => {
      contextManager.extractEntities('I have experience with JavaScript, React, and Node.js.');
      
      const entities = contextManager.getDetectedEntities();
      expect(entities.skills).toContain('JavaScript');
      expect(entities.skills).toContain('React');
      expect(entities.skills).toContain('Node.js');
    });
  });
  
  describe('updatePlatformData', () => {
    it('should update platform data in the current context', () => {
      const platformData = {
        platform: 'LinkedIn Jobs',
        type: 'job-listing',
        company: 'Acme Inc',
        jobTitle: 'Software Engineer',
        skills: ['JavaScript', 'React', 'Node.js']
      };
      
      contextManager.updatePlatformData(platformData);
      
      const context = contextManager.getCurrentContext();
      expect(context.platformData).toEqual(platformData);
      expect(context.platform).toBe('LinkedIn Jobs');
      
      const entities = contextManager.getDetectedEntities();
      expect(entities.companies).toContain('Acme Inc');
      expect(entities.roles).toContain('Software Engineer');
      expect(entities.skills).toContain('JavaScript');
      expect(entities.skills).toContain('React');
      expect(entities.skills).toContain('Node.js');
    });
  });
  
  describe('generateContextSummary', () => {
    it('should generate a summary of the current context', () => {
      // Set up context
      contextManager.updatePlatform('Google Meet');
      contextManager.updateCallStatus(true);
      contextManager.updateCallDuration(120);
      contextManager.updateParticipants([
        { id: '1', name: 'John Doe' }
      ]);
      contextManager.extractEntities('I worked at Google as a Software Engineer using JavaScript.');
      
      const summary = contextManager.generateContextSummary();
      
      expect(summary).toContain('Current platform: Google Meet');
      expect(summary).toContain('In call: Yes');
      expect(summary).toContain('Call duration: 2m 0s');
      expect(summary).toContain('Participants: John Doe');
      expect(summary).toContain('Mentioned companies: Google');
      expect(summary).toContain('Mentioned roles: Software Engineer');
      expect(summary).toContain('Mentioned skills: JavaScript');
    });
  });
});

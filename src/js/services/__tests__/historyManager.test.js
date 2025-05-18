/**
 * Unit tests for historyManager service
 */

// Mock the chrome API
global.chrome = {
  ...global.chrome,
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  }
};

// Import the module under test
import historyManager from '../historyManager.js';

describe('historyManager', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock storage.local.get to return empty data by default
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({});
    });
  });
  
  describe('initialize', () => {
    it('should initialize the history manager', async () => {
      const result = await historyManager.initialize();
      
      expect(result).toBe(true);
      expect(chrome.storage.local.get).toHaveBeenCalledWith(['historyConsentGiven'], expect.any(Function));
    });
    
    it('should load interview history if consent is given', async () => {
      // Mock storage.local.get to return consent given
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        if (keys.includes('historyConsentGiven')) {
          callback({ historyConsentGiven: true });
        } else if (keys.includes('interviewHistory')) {
          callback({ interviewHistory: [] });
        }
      });
      
      const result = await historyManager.initialize();
      
      expect(result).toBe(true);
      expect(chrome.storage.local.get).toHaveBeenCalledWith(['historyConsentGiven'], expect.any(Function));
      expect(chrome.storage.local.get).toHaveBeenCalledWith(['interviewHistory'], expect.any(Function));
    });
  });
  
  describe('setConsent', () => {
    it('should set consent status to true', async () => {
      const result = await historyManager.setConsent(true);
      
      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ 'historyConsentGiven': true }, expect.any(Function));
    });
    
    it('should set consent status to false and clear history', async () => {
      // Mock clearInterviewHistory
      const clearSpy = jest.spyOn(historyManager, 'clearInterviewHistory').mockResolvedValue(true);
      
      const result = await historyManager.setConsent(false);
      
      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ 'historyConsentGiven': false }, expect.any(Function));
      expect(clearSpy).toHaveBeenCalled();
      
      // Restore the original implementation
      clearSpy.mockRestore();
    });
  });
  
  describe('hasConsent', () => {
    it('should return the current consent status', () => {
      // Set consent to true
      historyManager.setConsent(true);
      
      expect(historyManager.hasConsent()).toBe(true);
      
      // Set consent to false
      historyManager.setConsent(false);
      
      expect(historyManager.hasConsent()).toBe(false);
    });
  });
  
  describe('clearInterviewHistory', () => {
    it('should clear the interview history', async () => {
      const result = await historyManager.clearInterviewHistory();
      
      expect(result).toBe(true);
      expect(chrome.storage.local.remove).toHaveBeenCalledWith(['interviewHistory'], expect.any(Function));
    });
  });
  
  describe('startInterview', () => {
    beforeEach(() => {
      // Set consent to true
      historyManager.setConsent(true);
    });
    
    it('should start a new interview with metadata', () => {
      const metadata = {
        company: 'Acme Inc',
        position: 'Software Engineer'
      };
      
      const interviewId = historyManager.startInterview(metadata);
      
      expect(interviewId).toBeDefined();
      expect(interviewId).toMatch(/^interview_\\d+$/);
      
      // Check that the interview was added to the history
      const history = historyManager.getInterviewHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe(interviewId);
      expect(history[0].metadata).toEqual(metadata);
      expect(history[0].startTime).toBeDefined();
      expect(history[0].endTime).toBeNull();
      expect(history[0].questions).toEqual([]);
      
      // Check that the history was saved
      expect(chrome.storage.local.set).toHaveBeenCalled();
    });
    
    it('should not start a new interview if consent is not given', () => {
      // Set consent to false
      historyManager.setConsent(false);
      
      const interviewId = historyManager.startInterview({});
      
      expect(interviewId).toBeNull();
      expect(chrome.storage.local.set).not.toHaveBeenCalled();
    });
  });
  
  describe('endInterview', () => {
    let interviewId;
    
    beforeEach(async () => {
      // Set consent to true and start an interview
      await historyManager.setConsent(true);
      interviewId = historyManager.startInterview({});
      
      // Reset the mock to clear the call history
      chrome.storage.local.set.mockClear();
    });
    
    it('should end an interview', async () => {
      const result = await historyManager.endInterview(interviewId);
      
      expect(result).toBe(true);
      
      // Check that the interview was updated
      const interview = historyManager.getInterview(interviewId);
      expect(interview.endTime).toBeDefined();
      expect(interview.duration).toBeDefined();
      expect(interview.performance).toBeDefined();
      
      // Check that the history was saved
      expect(chrome.storage.local.set).toHaveBeenCalled();
    });
    
    it('should not end an interview if consent is not given', async () => {
      // Set consent to false
      await historyManager.setConsent(false);
      
      const result = await historyManager.endInterview(interviewId);
      
      expect(result).toBe(false);
      expect(chrome.storage.local.set).not.toHaveBeenCalled();
    });
    
    it('should not end an interview that does not exist', async () => {
      const result = await historyManager.endInterview('nonexistent_id');
      
      expect(result).toBe(false);
      expect(chrome.storage.local.set).not.toHaveBeenCalled();
    });
  });
  
  describe('addQuestionAnswer', () => {
    let interviewId;
    
    beforeEach(async () => {
      // Set consent to true and start an interview
      await historyManager.setConsent(true);
      interviewId = historyManager.startInterview({});
      
      // Reset the mock to clear the call history
      chrome.storage.local.set.mockClear();
    });
    
    it('should add a question and answer to an interview', async () => {
      const question = 'Tell me about yourself';
      const answer = 'I am a software engineer with 5 years of experience...';
      const metadata = { provider: 'openai', model: 'gpt-4' };
      
      const result = await historyManager.addQuestionAnswer(interviewId, question, answer, metadata);
      
      expect(result).toBe(true);
      
      // Check that the question was added to the interview
      const interview = historyManager.getInterview(interviewId);
      expect(interview.questions).toHaveLength(1);
      expect(interview.questions[0].question).toBe(question);
      expect(interview.questions[0].answer).toBe(answer);
      expect(interview.questions[0].metadata).toEqual(metadata);
      
      // Check that the history was saved
      expect(chrome.storage.local.set).toHaveBeenCalled();
    });
    
    it('should not add a question if consent is not given', async () => {
      // Set consent to false
      await historyManager.setConsent(false);
      
      const result = await historyManager.addQuestionAnswer(interviewId, 'Question', 'Answer');
      
      expect(result).toBe(false);
      expect(chrome.storage.local.set).not.toHaveBeenCalled();
    });
    
    it('should not add a question to an interview that does not exist', async () => {
      const result = await historyManager.addQuestionAnswer('nonexistent_id', 'Question', 'Answer');
      
      expect(result).toBe(false);
      expect(chrome.storage.local.set).not.toHaveBeenCalled();
    });
  });
  
  describe('getInterviewHistory', () => {
    it('should return the interview history', async () => {
      // Set consent to true and start some interviews
      await historyManager.setConsent(true);
      const id1 = historyManager.startInterview({ company: 'Company A' });
      const id2 = historyManager.startInterview({ company: 'Company B' });
      
      const history = historyManager.getInterviewHistory();
      
      expect(history).toHaveLength(2);
      expect(history[0].id).toBe(id1);
      expect(history[1].id).toBe(id2);
    });
  });
  
  describe('getInterview', () => {
    let interviewId;
    
    beforeEach(async () => {
      // Set consent to true and start an interview
      await historyManager.setConsent(true);
      interviewId = historyManager.startInterview({ company: 'Test Company' });
    });
    
    it('should return an interview by ID', () => {
      const interview = historyManager.getInterview(interviewId);
      
      expect(interview).toBeDefined();
      expect(interview.id).toBe(interviewId);
      expect(interview.metadata.company).toBe('Test Company');
    });
    
    it('should return null for a nonexistent interview ID', () => {
      const interview = historyManager.getInterview('nonexistent_id');
      
      expect(interview).toBeNull();
    });
  });
  
  describe('generatePerformanceReport', () => {
    let interviewId;
    
    beforeEach(async () => {
      // Set consent to true and start an interview
      await historyManager.setConsent(true);
      interviewId = historyManager.startInterview({
        company: 'Acme Inc',
        position: 'Software Engineer'
      });
      
      // Add some questions and answers
      await historyManager.addQuestionAnswer(
        interviewId,
        'Tell me about yourself',
        'I am a software engineer with 5 years of experience...'
      );
      
      // End the interview
      await historyManager.endInterview(interviewId);
    });
    
    it('should generate a performance report for an interview', () => {
      const report = historyManager.generatePerformanceReport(interviewId);
      
      expect(report).toBeDefined();
      expect(report.interviewId).toBe(interviewId);
      expect(report.company).toBe('Acme Inc');
      expect(report.position).toBe('Software Engineer');
      expect(report.questionCount).toBe(1);
      expect(report.overallScore).toBeDefined();
      expect(report.strengths).toBeDefined();
      expect(report.areasForImprovement).toBeDefined();
      expect(report.coachingTips).toBeDefined();
    });
    
    it('should return null for a nonexistent interview ID', () => {
      const report = historyManager.generatePerformanceReport('nonexistent_id');
      
      expect(report).toBeNull();
    });
  });
});

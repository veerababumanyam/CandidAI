/**
 * CandidAI - History Manager Service
 * Manages interview history, performance analytics, and improvement suggestions
 */

/**
 * History Manager class for storing and analyzing interview history
 */
class HistoryManager {
  constructor() {
    this.interviewHistory = [];
    this.consentGiven = false;
    this.initialized = false;
  }

  /**
   * Initialize the history manager
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }

    try {
      // Load consent status
      const consentResult = await new Promise(resolve => {
        chrome.storage.local.get(['historyConsentGiven'], resolve);
      });
      
      this.consentGiven = consentResult.historyConsentGiven === true;
      
      // If consent is given, load interview history
      if (this.consentGiven) {
        await this.loadInterviewHistory();
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing history manager:', error);
      return false;
    }
  }

  /**
   * Set consent status for storing interview history
   * @param {boolean} consent - Whether consent is given
   * @returns {Promise<boolean>} - Whether setting consent was successful
   */
  async setConsent(consent) {
    try {
      this.consentGiven = consent;
      
      // Store consent status
      await new Promise(resolve => {
        chrome.storage.local.set({ 'historyConsentGiven': consent }, resolve);
      });
      
      // If consent is revoked, clear history
      if (!consent) {
        await this.clearInterviewHistory();
      }
      
      return true;
    } catch (error) {
      console.error('Error setting history consent:', error);
      return false;
    }
  }

  /**
   * Check if consent has been given for storing interview history
   * @returns {boolean} - Whether consent has been given
   */
  hasConsent() {
    return this.consentGiven;
  }

  /**
   * Load interview history from storage
   * @private
   * @returns {Promise<boolean>} - Whether loading was successful
   */
  async loadInterviewHistory() {
    try {
      const result = await new Promise(resolve => {
        chrome.storage.local.get(['interviewHistory'], resolve);
      });
      
      if (result.interviewHistory && Array.isArray(result.interviewHistory)) {
        this.interviewHistory = result.interviewHistory;
        console.log('Loaded interview history from storage:', this.interviewHistory.length, 'interviews');
      }
      
      return true;
    } catch (error) {
      console.error('Error loading interview history from storage:', error);
      return false;
    }
  }

  /**
   * Save interview history to storage
   * @private
   * @returns {Promise<boolean>} - Whether saving was successful
   */
  async saveInterviewHistory() {
    if (!this.consentGiven) {
      console.warn('Cannot save interview history without consent');
      return false;
    }
    
    try {
      await new Promise(resolve => {
        chrome.storage.local.set({ 'interviewHistory': this.interviewHistory }, resolve);
      });
      
      return true;
    } catch (error) {
      console.error('Error saving interview history to storage:', error);
      return false;
    }
  }

  /**
   * Clear interview history
   * @returns {Promise<boolean>} - Whether clearing was successful
   */
  async clearInterviewHistory() {
    try {
      this.interviewHistory = [];
      
      await new Promise(resolve => {
        chrome.storage.local.remove(['interviewHistory'], resolve);
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing interview history:', error);
      return false;
    }
  }

  /**
   * Start a new interview session
   * @param {Object} metadata - Interview metadata (company, position, etc.)
   * @returns {string} - Interview ID
   */
  startInterview(metadata = {}) {
    if (!this.consentGiven) {
      console.warn('Cannot start interview recording without consent');
      return null;
    }
    
    const interviewId = 'interview_' + Date.now();
    
    const interview = {
      id: interviewId,
      startTime: new Date().toISOString(),
      endTime: null,
      metadata: metadata,
      questions: [],
      performance: {
        overallScore: null,
        metrics: {}
      }
    };
    
    this.interviewHistory.push(interview);
    this.saveInterviewHistory();
    
    return interviewId;
  }

  /**
   * End an interview session
   * @param {string} interviewId - Interview ID
   * @returns {Promise<boolean>} - Whether ending was successful
   */
  async endInterview(interviewId) {
    if (!this.consentGiven) {
      return false;
    }
    
    const interview = this.interviewHistory.find(i => i.id === interviewId);
    
    if (!interview) {
      console.error('Interview not found:', interviewId);
      return false;
    }
    
    interview.endTime = new Date().toISOString();
    
    // Calculate interview duration
    const startTime = new Date(interview.startTime);
    const endTime = new Date(interview.endTime);
    const durationMs = endTime - startTime;
    interview.duration = Math.floor(durationMs / 1000); // Duration in seconds
    
    // Generate performance metrics
    await this.generatePerformanceMetrics(interview);
    
    // Save updated interview
    await this.saveInterviewHistory();
    
    return true;
  }

  /**
   * Add a question and answer to an interview
   * @param {string} interviewId - Interview ID
   * @param {string} question - The question asked
   * @param {string} answer - The answer given
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<boolean>} - Whether adding was successful
   */
  async addQuestionAnswer(interviewId, question, answer, metadata = {}) {
    if (!this.consentGiven) {
      return false;
    }
    
    const interview = this.interviewHistory.find(i => i.id === interviewId);
    
    if (!interview) {
      console.error('Interview not found:', interviewId);
      return false;
    }
    
    const questionAnswer = {
      id: 'qa_' + Date.now(),
      timestamp: new Date().toISOString(),
      question,
      answer,
      metadata,
      feedback: null
    };
    
    interview.questions.push(questionAnswer);
    
    // Save updated interview
    await this.saveInterviewHistory();
    
    return true;
  }

  /**
   * Generate performance metrics for an interview
   * @param {Object} interview - The interview object
   * @private
   * @returns {Promise<boolean>} - Whether generation was successful
   */
  async generatePerformanceMetrics(interview) {
    try {
      // Basic metrics
      const metrics = {
        questionCount: interview.questions.length,
        averageAnswerLength: 0,
        topicsCovered: [],
        strengths: [],
        areasForImprovement: []
      };
      
      // Calculate average answer length
      if (interview.questions.length > 0) {
        const totalLength = interview.questions.reduce((sum, qa) => sum + (qa.answer ? qa.answer.length : 0), 0);
        metrics.averageAnswerLength = Math.floor(totalLength / interview.questions.length);
      }
      
      // Extract topics from questions (simplified approach)
      const allText = interview.questions.map(qa => qa.question + ' ' + (qa.answer || '')).join(' ');
      
      // Common interview topics
      const topicKeywords = {
        'technical': ['code', 'programming', 'technical', 'algorithm', 'data structure', 'architecture'],
        'experience': ['experience', 'project', 'worked on', 'led', 'team', 'responsibility'],
        'behavioral': ['challenge', 'conflict', 'difficult', 'teamwork', 'leadership', 'example'],
        'strengths': ['strength', 'good at', 'excel', 'skill', 'expertise'],
        'weaknesses': ['weakness', 'improve', 'development', 'learning', 'challenge'],
        'motivation': ['why', 'interest', 'passionate', 'excited', 'motivation'],
        'company': ['culture', 'values', 'mission', 'research', 'learn about']
      };
      
      // Detect topics
      for (const [topic, keywords] of Object.entries(topicKeywords)) {
        for (const keyword of keywords) {
          if (allText.toLowerCase().includes(keyword)) {
            if (!metrics.topicsCovered.includes(topic)) {
              metrics.topicsCovered.push(topic);
            }
            break;
          }
        }
      }
      
      // Set the metrics
      interview.performance.metrics = metrics;
      
      // Set an overall score (placeholder - would use more sophisticated analysis in a real app)
      interview.performance.overallScore = Math.min(Math.floor(Math.random() * 30) + 70, 100); // Random score between 70-100
      
      return true;
    } catch (error) {
      console.error('Error generating performance metrics:', error);
      return false;
    }
  }

  /**
   * Get all interview history
   * @returns {Array} - Interview history
   */
  getInterviewHistory() {
    return this.interviewHistory;
  }

  /**
   * Get a specific interview by ID
   * @param {string} interviewId - Interview ID
   * @returns {Object|null} - The interview object or null if not found
   */
  getInterview(interviewId) {
    return this.interviewHistory.find(i => i.id === interviewId) || null;
  }

  /**
   * Generate a performance report for an interview
   * @param {string} interviewId - Interview ID
   * @returns {Object} - Performance report
   */
  generatePerformanceReport(interviewId) {
    const interview = this.getInterview(interviewId);
    
    if (!interview) {
      return null;
    }
    
    // Basic report structure
    const report = {
      interviewId: interview.id,
      date: new Date(interview.startTime).toLocaleDateString(),
      duration: interview.duration ? `${Math.floor(interview.duration / 60)}m ${interview.duration % 60}s` : 'Unknown',
      company: interview.metadata.company || 'Unknown',
      position: interview.metadata.position || 'Unknown',
      overallScore: interview.performance.overallScore,
      questionCount: interview.questions.length,
      topicsCovered: interview.performance.metrics.topicsCovered || [],
      strengths: [],
      areasForImprovement: [],
      coachingTips: []
    };
    
    // Generate strengths (placeholder - would use more sophisticated analysis in a real app)
    if (interview.performance.metrics.averageAnswerLength > 200) {
      report.strengths.push('Detailed answers');
    }
    
    if (interview.performance.metrics.topicsCovered.includes('experience')) {
      report.strengths.push('Good at discussing past experience');
    }
    
    // Generate areas for improvement
    if (interview.performance.metrics.averageAnswerLength < 100) {
      report.areasForImprovement.push('Answers could be more detailed');
    }
    
    if (!interview.performance.metrics.topicsCovered.includes('motivation')) {
      report.areasForImprovement.push('Could better express motivation for the role');
    }
    
    // Generate coaching tips
    report.coachingTips = [
      'Practice the STAR method for behavioral questions',
      'Research the company more thoroughly before interviews',
      'Prepare 2-3 questions to ask the interviewer',
      'Focus on quantifiable achievements in your answers'
    ];
    
    return report;
  }
}

// Create a singleton instance
const historyManager = new HistoryManager();

export default historyManager;

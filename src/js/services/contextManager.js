/**
 * CandidAI - Context Manager Service
 * Manages context for LLM interactions, including conversation history,
 * detected entities, and other contextual information
 */

/**
 * Context Manager for maintaining conversation and interview context
 */
class ContextManager {
  constructor() {
    this.conversationHistory = [];
    this.detectedEntities = {
      companies: [],
      people: [],
      roles: [],
      skills: []
    };
    this.currentContext = {
      platform: null,
      inCall: false,
      participants: [],
      callDuration: 0,
      platformData: null
    };
    this.maxHistoryLength = 20;

    // Initialize conversation history from storage
    this._initializeConversationHistory();
  }

  /**
   * Add a message to the conversation history
   * @param {string} role - The role of the message sender ('user', 'assistant', 'system')
   * @param {string} content - The message content
   * @param {Object} metadata - Additional metadata about the message
   */
  addMessage(role, content, metadata = {}) {
    const message = {
      role,
      content,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    this.conversationHistory.push(message);

    // Limit history size
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory.shift();
    }

    // Extract entities from user messages
    if (role === 'user') {
      this.extractEntities(content);
    }

    // Save conversation history to storage
    this._saveConversationHistory();

    return message;
  }

  /**
   * Initialize conversation history from storage
   * @private
   */
  async _initializeConversationHistory() {
    try {
      const result = await new Promise(resolve => {
        chrome.storage.local.get(['conversationHistory'], resolve);
      });

      if (result.conversationHistory && Array.isArray(result.conversationHistory)) {
        this.conversationHistory = result.conversationHistory;
        console.log('Loaded conversation history from storage:', this.conversationHistory.length, 'messages');
      }
    } catch (error) {
      console.error('Error loading conversation history from storage:', error);
    }
  }

  /**
   * Get the conversation history
   * @param {number} limit - Maximum number of messages to return
   * @returns {Array<Object>} - Conversation history
   */
  getConversationHistory(limit = this.maxHistoryLength) {
    return this.conversationHistory.slice(-limit);
  }

  /**
   * Get the conversation history formatted for LLM context
   * @param {number} limit - Maximum number of messages to return
   * @returns {string} - Formatted conversation history
   */
  getFormattedConversationHistory(limit = this.maxHistoryLength) {
    const history = this.getConversationHistory(limit);
    let formattedHistory = '';

    if (history.length > 0) {
      formattedHistory = 'Recent conversation history:\n';

      history.forEach((message, index) => {
        const role = message.role === 'user' ? 'User' : 'Assistant';
        formattedHistory += `${role}: ${message.content}\n`;
      });
    }

    return formattedHistory;
  }

  /**
   * Get the conversation history formatted for LLM API
   * @param {number} limit - Maximum number of messages to return
   * @returns {Array<Object>} - Formatted conversation history for LLM API
   */
  getConversationHistoryForLLM(limit = this.maxHistoryLength) {
    const history = this.getConversationHistory(limit);

    // Format for LLM API (e.g., OpenAI format)
    return history.map(message => ({
      role: message.role,
      content: message.content
    }));
  }

  /**
   * Clear the conversation history
   */
  clearConversationHistory() {
    this.conversationHistory = [];

    // Also clear from storage if we're using it
    try {
      chrome.storage.local.remove(['conversationHistory']);
    } catch (error) {
      console.error('Error clearing conversation history from storage:', error);
    }
  }

  /**
   * Save the conversation history to storage
   * @private
   */
  _saveConversationHistory() {
    try {
      chrome.storage.local.set({
        conversationHistory: this.conversationHistory
      });
    } catch (error) {
      console.error('Error saving conversation history to storage:', error);
    }
  }

  /**
   * Update the current context
   * @param {Object} context - New context information
   */
  updateContext(context) {
    this.currentContext = {
      ...this.currentContext,
      ...context
    };
  }

  /**
   * Get the current context
   * @returns {Object} - Current context
   */
  getCurrentContext() {
    return this.currentContext;
  }

  /**
   * Extract entities from text
   * @param {string} text - Text to extract entities from
   * @private
   */
  extractEntities(text) {
    // Extract company names
    this.extractCompanies(text);

    // Extract people names
    this.extractPeople(text);

    // Extract role names
    this.extractRoles(text);

    // Extract skills
    this.extractSkills(text);
  }

  /**
   * Extract company names from text
   * @param {string} text - Text to extract companies from
   * @private
   */
  extractCompanies(text) {
    // Common company name patterns
    const companyPatterns = [
      // Companies after prepositions
      /(at|for|with|by|from|joining)\s+([A-Z][a-zA-Z0-9]*(?:[\s\-\.&][A-Z][a-zA-Z0-9]*)*)/g,

      // Companies with common suffixes
      /([A-Z][a-zA-Z0-9]*(?:[\s\-\.&][A-Z][a-zA-Z0-9]*)*)\s+(Inc|LLC|Corp|Corporation|Company|Technologies|Tech|Group|Ltd|Limited)/g,

      // Companies in context of interview
      /(interviewing|interview|position|job|role)\s+(at|with|for)\s+([A-Z][a-zA-Z0-9]*(?:[\s\-\.&][A-Z][a-zA-Z0-9]*)*)/g
    ];

    // Process each pattern
    for (const pattern of companyPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        // Get the company name based on the pattern
        let company;
        if (pattern.toString().includes('interviewing|interview|position|job|role')) {
          company = match[3].trim();
        } else if (pattern.toString().includes('Inc|LLC|Corp|Corporation')) {
          company = match[1].trim();
        } else {
          company = match[2].trim();
        }

        // Validate and add the company
        if (company && company.length > 1 && !this.detectedEntities.companies.includes(company)) {
          // Filter out common false positives
          const falsePositives = ['I', 'We', 'You', 'They', 'The', 'This', 'That', 'My', 'Your', 'Our'];
          if (!falsePositives.includes(company)) {
            this.detectedEntities.companies.push(company);
            console.log(`Detected company: ${company}`);
          }
        }
      }
    }
  }

  /**
   * Extract people names from text
   * @param {string} text - Text to extract people from
   * @private
   */
  extractPeople(text) {
    // Common patterns for people introduction
    const peoplePatterns = [
      // Self-introduction
      /(?:my name is|I am|I'm|this is|speaking with)\s+([A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)?)/gi,

      // Introduction of others
      /(?:with|meet|introducing|let me introduce)\s+([A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)?)/gi,

      // Titles followed by names
      /(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+([A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)?)/g
    ];

    // Process each pattern
    for (const pattern of peoplePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const person = match[1].trim();

        // Validate and add the person
        if (person && person.length > 1 && !this.detectedEntities.people.includes(person)) {
          // Filter out common false positives
          const falsePositives = ['I', 'We', 'You', 'They', 'The', 'This', 'That', 'My', 'Your', 'Our'];
          if (!falsePositives.includes(person)) {
            this.detectedEntities.people.push(person);
            console.log(`Detected person: ${person}`);
          }
        }
      }
    }
  }

  /**
   * Extract role names from text
   * @param {string} text - Text to extract roles from
   * @private
   */
  extractRoles(text) {
    // Common role patterns
    const rolePatterns = [
      // Roles with common job titles
      /(as|a|the|for)\s+([a-zA-Z]+\s+(?:developer|engineer|manager|designer|analyst|specialist|consultant|architect|lead|director|head|chief|officer|cto|ceo|cio|vp))/gi,

      // Roles in context of position/job
      /(position|job|role|opportunity)\s+(as|of|for)\s+(?:a|an)?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+){0,3})/gi,

      // Specific role mentions
      /(?:senior|junior|lead|principal|staff)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+){0,2})/gi
    ];

    // Process each pattern
    for (const pattern of rolePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        // Get the role name based on the pattern
        let role;
        if (pattern.toString().includes('position|job|role|opportunity')) {
          role = match[3].trim();
        } else if (pattern.toString().includes('senior|junior|lead|principal|staff')) {
          role = match[0].trim(); // Get the full match
        } else {
          role = match[2].trim();
        }

        // Validate and add the role
        if (role && role.length > 3 && !this.detectedEntities.roles.includes(role)) {
          this.detectedEntities.roles.push(role);
          console.log(`Detected role: ${role}`);
        }
      }
    }
  }

  /**
   * Extract skills from text
   * @param {string} text - Text to extract skills from
   * @private
   */
  extractSkills(text) {
    // Expanded list of technical skills
    const skillKeywords = [
      // Programming languages
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin',

      // Frontend
      'react', 'angular', 'vue', 'svelte', 'jquery', 'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',

      // Backend
      'node', 'express', 'django', 'flask', 'spring', 'rails', 'laravel', 'asp.net', 'fastapi',

      // Databases
      'mongodb', 'sql', 'mysql', 'postgresql', 'oracle', 'sqlite', 'nosql', 'redis', 'elasticsearch',

      // Cloud & DevOps
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'circleci', 'travis',

      // Methodologies
      'agile', 'scrum', 'kanban', 'waterfall', 'lean', 'tdd', 'bdd',

      // Tools
      'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'trello',

      // Mobile
      'android', 'ios', 'react native', 'flutter', 'xamarin',

      // AI/ML
      'machine learning', 'ai', 'tensorflow', 'pytorch', 'keras', 'nlp', 'computer vision'
    ];

    // Check for exact matches
    const words = text.toLowerCase().split(/\W+/);
    for (const word of words) {
      if (skillKeywords.includes(word) && !this.detectedEntities.skills.includes(word)) {
        this.detectedEntities.skills.push(word);
      }
    }

    // Check for multi-word skills
    for (const skill of skillKeywords) {
      if (skill.includes(' ') && text.toLowerCase().includes(skill) && !this.detectedEntities.skills.includes(skill)) {
        this.detectedEntities.skills.push(skill);
      }
    }

    // Check for skills in context
    const skillContextPatterns = [
      /experience (?:with|in|using)\s+([a-zA-Z0-9\s\-\.]+)/gi,
      /knowledge of\s+([a-zA-Z0-9\s\-\.]+)/gi,
      /proficient (?:with|in)\s+([a-zA-Z0-9\s\-\.]+)/gi,
      /familiar with\s+([a-zA-Z0-9\s\-\.]+)/gi
    ];

    for (const pattern of skillContextPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const potentialSkill = match[1].trim().toLowerCase();

        // Check if the potential skill contains any known skill keywords
        for (const skill of skillKeywords) {
          if (potentialSkill.includes(skill) && !this.detectedEntities.skills.includes(skill)) {
            this.detectedEntities.skills.push(skill);
          }
        }
      }
    }
  }

  /**
   * Get detected entities
   * @returns {Object} - Detected entities
   */
  getDetectedEntities() {
    return this.detectedEntities;
  }

  /**
   * Clear detected entities
   */
  clearDetectedEntities() {
    this.detectedEntities = {
      companies: [],
      people: [],
      roles: [],
      skills: []
    };
  }

  /**
   * Update platform-specific data
   * @param {Object} platformData - Platform-specific data
   */
  updatePlatformData(platformData) {
    if (!platformData) return;

    // Update current context with platform data
    this.currentContext.platformData = platformData;
    this.currentContext.platform = platformData.platform;

    // Extract entities from platform data
    if (platformData.type === 'job-listing') {
      // Extract from job listing
      if (platformData.company) {
        this.detectedEntities.companies.push(platformData.company);
      }

      if (platformData.jobTitle) {
        this.detectedEntities.roles.push(platformData.jobTitle);
      }

      if (platformData.skills && Array.isArray(platformData.skills)) {
        platformData.skills.forEach(skill => {
          if (!this.detectedEntities.skills.includes(skill)) {
            this.detectedEntities.skills.push(skill);
          }
        });
      }

      // Extract entities from job description
      if (platformData.description) {
        this.extractEntities(platformData.description);
      }
    } else if (platformData.type === 'recruiter-platform') {
      // Extract from recruiter platform
      if (platformData.currentCompany) {
        this.detectedEntities.companies.push(platformData.currentCompany);
      }

      if (platformData.currentTitle) {
        this.detectedEntities.roles.push(platformData.currentTitle);
      }

      if (platformData.candidateName) {
        this.detectedEntities.people.push(platformData.candidateName);
      }
    } else if (platformData.type === 'video-interview') {
      // Extract from video interview platform
      if (platformData.company) {
        this.detectedEntities.companies.push(platformData.company);
      }

      if (platformData.currentQuestion) {
        // Add a system message with the current question
        this.addMessage('system', `Interview question: ${platformData.currentQuestion}`);
      }
    }

    console.log('Updated platform data:', platformData);
  }

  /**
   * Generate a context summary for LLM prompts
   * @returns {string} - Context summary
   */
  generateContextSummary() {
    let summary = '';

    // Add platform info
    if (this.currentContext.platform) {
      summary += `Current platform: ${this.currentContext.platform}\n`;
    }

    // Add call status
    summary += `In call: ${this.currentContext.inCall ? 'Yes' : 'No'}\n`;

    if (this.currentContext.inCall) {
      // Add call duration
      const minutes = Math.floor(this.currentContext.callDuration / 60);
      const seconds = this.currentContext.callDuration % 60;
      summary += `Call duration: ${minutes}m ${seconds}s\n`;

      // Add participants
      if (this.currentContext.participants.length > 0) {
        summary += `Participants: ${this.currentContext.participants.map(p => p.name).join(', ')}\n`;
      }
    }

    // Add platform-specific data
    if (this.currentContext.platformData) {
      const data = this.currentContext.platformData;

      if (data.type === 'job-listing') {
        summary += `Job listing: ${data.jobTitle} at ${data.company}\n`;
        if (data.location) {
          summary += `Location: ${data.location}\n`;
        }
      } else if (data.type === 'recruiter-platform') {
        if (data.candidateName) {
          summary += `Candidate: ${data.candidateName}\n`;
        }
        if (data.currentTitle && data.currentCompany) {
          summary += `Current position: ${data.currentTitle} at ${data.currentCompany}\n`;
        }
      } else if (data.type === 'video-interview') {
        summary += `Interview with: ${data.company}\n`;
        if (data.currentQuestion) {
          summary += `Current question: ${data.currentQuestion}\n`;
        }
        if (data.timeRemaining) {
          summary += `Time remaining: ${data.timeRemaining}\n`;
        }
      }
    }

    // Add detected entities
    if (this.detectedEntities.companies.length > 0) {
      summary += `Mentioned companies: ${this.detectedEntities.companies.join(', ')}\n`;
    }

    if (this.detectedEntities.roles.length > 0) {
      summary += `Mentioned roles: ${this.detectedEntities.roles.join(', ')}\n`;
    }

    if (this.detectedEntities.skills.length > 0) {
      summary += `Mentioned skills: ${this.detectedEntities.skills.join(', ')}\n`;
    }

    return summary;
  }
}

// Create a singleton instance
const contextManager = new ContextManager();

export default contextManager;

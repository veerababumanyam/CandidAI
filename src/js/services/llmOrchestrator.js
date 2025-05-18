/**
 * CandidAI - LLM Orchestrator Service
 * Manages interactions with different LLM providers
 */

import OpenAIProvider from '../api/openai.js';
import AnthropicProvider from '../api/anthropic.js';
import GeminiProvider from '../api/gemini.js';
import promptEngineering from './promptEngineering.js';

/**
 * LLM Orchestrator class
 * Manages interactions with different LLM providers
 */
class LLMOrchestrator {
  constructor() {
    this.providers = {
      openai: new OpenAIProvider(),
      anthropic: new AnthropicProvider(),
      gemini: new GeminiProvider()
    };
    this.preferredProvider = 'openai';
    this.fallbackOrder = ['anthropic', 'gemini'];
    this.initialized = false;
    this.usageStats = {
      openai: { promptTokens: 0, completionTokens: 0, totalTokens: 0, requests: 0 },
      anthropic: { promptTokens: 0, completionTokens: 0, totalTokens: 0, requests: 0 },
      gemini: { promptTokens: 0, completionTokens: 0, totalTokens: 0, requests: 0 }
    };
  }

  /**
   * Initialize the orchestrator
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }

    try {
      // Load preferences from storage
      const result = await new Promise((resolve) => {
        chrome.storage.local.get(['llmPreferences', 'llmUsage'], resolve);
      });

      // Set preferences
      if (result.llmPreferences) {
        this.preferredProvider = result.llmPreferences.preferredProvider || this.preferredProvider;
        this.fallbackOrder = result.llmPreferences.fallbackOrder || this.fallbackOrder;
      }

      // Set usage stats
      if (result.llmUsage) {
        this.usageStats = result.llmUsage;
      }

      // Initialize all providers
      await Promise.all([
        this.providers.openai.initialize(),
        this.providers.anthropic.initialize(),
        this.providers.gemini.initialize()
      ]);

      this.initialized = true;
      console.log('LLM Orchestrator initialized');
      return true;
    } catch (error) {
      console.error('Error initializing LLM Orchestrator:', error);
      return false;
    }
  }

  /**
   * Get the provider instance
   * @param {string} providerName - The name of the provider
   * @returns {Object} - The provider instance
   * @private
   */
  getProvider(providerName) {
    if (!this.providers[providerName]) {
      throw new Error(`Provider ${providerName} not found`);
    }
    return this.providers[providerName];
  }

  /**
   * Generate a response to a question
   * @param {string} question - The question to answer
   * @param {Object} options - Options for the generation
   * @returns {Promise<Object>} - The generated response
   */
  async generateResponse(question, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log('Generating response for question:', question);

    // Create messages array
    const messages = [
      { role: 'system', content: options.systemPrompt || 'You are a helpful assistant.' },
      { role: 'user', content: question }
    ];

    // Add conversation history if provided
    if (options.conversationHistory && Array.isArray(options.conversationHistory)) {
      messages.push(...options.conversationHistory);
    }

    // Determine which providers to try
    const providersToTry = [this.preferredProvider, ...this.fallbackOrder];

    // Track fallback information
    let usedFallback = false;
    let originalProvider = this.preferredProvider;
    let fallbackReason = '';

    // Try each provider in order
    for (const providerName of providersToTry) {
      try {
        const provider = this.getProvider(providerName);

        // Skip if provider is not initialized
        if (!provider.isInitialized()) {
          console.log(`Provider ${providerName} not initialized, skipping`);

          // If this is the preferred provider, mark as fallback
          if (providerName === originalProvider) {
            usedFallback = true;
            fallbackReason = 'API key not configured';
          }

          continue;
        }

        // Generate response
        const response = await provider.generateResponse(messages, {
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens
        });

        // Update usage stats
        this.updateUsageStats(providerName, response.usage);

        // Add fallback information to response
        if (providerName !== originalProvider) {
          response.usedFallback = true;
          response.originalProvider = originalProvider;
          response.fallbackReason = fallbackReason;

          // Log fallback event
          console.log(`Used fallback from ${originalProvider} to ${providerName}: ${fallbackReason}`);

          // Store fallback event
          this.recordFallbackEvent(originalProvider, providerName, fallbackReason);

          // Notify user of fallback
          this.notifyFallback(originalProvider, providerName, fallbackReason);
        }

        return response;
      } catch (error) {
        console.error(`Error with provider ${providerName}:`, error);

        // If this is the preferred provider, mark as fallback and store reason
        if (providerName === originalProvider) {
          usedFallback = true;
          fallbackReason = this.getFallbackReason(error);
        }

        // If this is the last provider, throw the error
        if (providerName === providersToTry[providersToTry.length - 1]) {
          throw error;
        }

        // Otherwise, try the next provider
        console.log(`Falling back to next provider due to: ${fallbackReason}`);
      }
    }

    // If we get here, all providers failed
    throw new Error('All LLM providers failed');
  }

  /**
   * Get a user-friendly fallback reason from an error
   * @param {Error} error - The error that caused the fallback
   * @returns {string} - A user-friendly fallback reason
   * @private
   */
  getFallbackReason(error) {
    if (error.type === 'AuthenticationError') {
      return 'Authentication error';
    } else if (error.type === 'RateLimitError') {
      return 'Rate limit exceeded';
    } else if (error.type === 'ServiceError') {
      return 'Service unavailable';
    } else if (error.type === 'TimeoutError') {
      return 'Request timed out';
    } else if (error.type === 'ContentFilterError') {
      return 'Content filtered';
    } else {
      return 'Unknown error';
    }
  }

  /**
   * Record a fallback event for analytics
   * @param {string} originalProvider - The original provider that failed
   * @param {string} fallbackProvider - The provider that was used as fallback
   * @param {string} reason - The reason for the fallback
   * @private
   */
  recordFallbackEvent(originalProvider, fallbackProvider, reason) {
    chrome.storage.local.get(['llmFallbackStats'], (result) => {
      const stats = result.llmFallbackStats || {};

      if (!stats[originalProvider]) {
        stats[originalProvider] = { count: 0, reasons: {} };
      }

      stats[originalProvider].count += 1;

      if (!stats[originalProvider].reasons[reason]) {
        stats[originalProvider].reasons[reason] = 0;
      }

      stats[originalProvider].reasons[reason] += 1;

      // Store the timestamp of the last fallback
      stats.lastFallback = {
        timestamp: new Date().toISOString(),
        from: originalProvider,
        to: fallbackProvider,
        reason
      };

      chrome.storage.local.set({ llmFallbackStats: stats });
    });
  }

  /**
   * Notify the user of a fallback event
   * @param {string} originalProvider - The original provider that failed
   * @param {string} fallbackProvider - The provider that was used as fallback
   * @param {string} reason - The reason for the fallback
   * @private
   */
  notifyFallback(originalProvider, fallbackProvider, reason) {
    // Format provider names for display
    const providerNames = {
      'openai': 'OpenAI',
      'anthropic': 'Anthropic',
      'gemini': 'Google Gemini'
    };

    const fromName = providerNames[originalProvider] || originalProvider;
    const toName = providerNames[fallbackProvider] || fallbackProvider;

    // Create notification message
    const title = `LLM Fallback Activated`;
    const message = `Switched from ${fromName} to ${toName} due to: ${reason}`;

    // Send notification using Chrome notifications API
    chrome.runtime.sendMessage({
      action: 'showStatusMessage',
      message: message,
      type: 'warning'
    }).catch(() => {
      // Side panel might not be open, ignore error
    });
  }

  /**
   * Generate a response to an interview question
   * @param {string} question - The interview question
   * @param {Object} context - Additional context (resume, job description, etc.)
   * @returns {Promise<Object>} - The generated response
   */
  async generateInterviewResponse(question, context = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log('Generating interview response for question:', question);

    // Load resume, job description, preloaded content, response style settings, and language settings from storage if not provided in context
    if (!context.resume || !context.jobDescription || !context.preloadedContent || !context.responseStyle || !context.language) {
      const storedData = await new Promise((resolve) => {
        chrome.storage.local.get([
          'resumeContent',
          'resumeType',
          'jobDescription',
          'parsedResume',
          'contextData',
          'anticipatedQuestions',
          'starExamples',
          'responseStyleSettings',
          'languageSettings'
        ], (result) => {
          resolve(result);
        });
      });

      // If we have a parsed resume, use it
      if (storedData.parsedResume && !context.resume) {
        context.resume = storedData.parsedResume;
        context.usingStoredResume = true;
      }

      // If we have a job description, use it
      if (storedData.jobDescription && !context.jobDescription) {
        context.jobDescription = storedData.jobDescription;
        context.usingStoredJobDescription = true;
      }

      // If we have detected context data, use it
      if (storedData.contextData) {
        context.detectedContext = storedData.contextData;
      }

      // If we have anticipated questions, use them
      if (storedData.anticipatedQuestions) {
        context.anticipatedQuestions = storedData.anticipatedQuestions;
      }

      // If we have STAR examples, use them
      if (storedData.starExamples) {
        context.starExamples = storedData.starExamples;
      }

      // If we have response style settings, use them
      if (storedData.responseStyleSettings) {
        context.responseStyle = storedData.responseStyleSettings;
      }

      // If we have language settings, use them
      if (storedData.languageSettings) {
        context.language = storedData.languageSettings;
      }

      // If we have resume content but no parsed resume, we'll need to parse it
      // This would be implemented in a real application, but for now we'll skip it
      if (storedData.resumeContent && !storedData.parsedResume && !context.resume) {
        console.log('Resume content found but not parsed. Parsing would be done here in a real implementation.');
        // In a real implementation, we would parse the resume here
        // context.resume = await resumeParser.parseResume(storedData.resumeContent, storedData.resumeType);
      }
    }

    // Process resume data if available
    let resumeContext = '';
    if (context.resume) {
      // If it's a parsed resume object with sections
      if (typeof context.resume === 'object' && context.resume.sections) {
        const sections = context.resume.sections;

        // Add relevant sections to the context
        if (sections.summary) {
          resumeContext += `Summary: ${sections.summary}\n`;
        }

        if (sections.skills && Array.isArray(sections.skills)) {
          resumeContext += `Skills: ${sections.skills.join(', ')}\n`;
        }

        if (sections.experience && Array.isArray(sections.experience)) {
          resumeContext += 'Experience:\n';
          sections.experience.forEach(exp => {
            resumeContext += `- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate}): ${exp.description}\n`;
          });
        }

        if (sections.education && Array.isArray(sections.education)) {
          resumeContext += 'Education:\n';
          sections.education.forEach(edu => {
            resumeContext += `- ${edu.degree} from ${edu.institution} (${edu.startDate} - ${edu.endDate})\n`;
          });
        }

        if (sections.certifications && Array.isArray(sections.certifications)) {
          resumeContext += `Certifications: ${sections.certifications.join(', ')}\n`;
        }
      } else if (typeof context.resume === 'string') {
        // If it's just a string, use it directly
        resumeContext = context.resume;
      }

      // Trim the resume context if it's too long
      if (resumeContext.length > 2000) {
        resumeContext = resumeContext.substring(0, 2000) + '... (truncated)';
      }

      // Update the context with the processed resume
      context.resume = resumeContext;
    }

    // Process job description if available
    if (context.jobDescription && typeof context.jobDescription === 'string') {
      // Trim the job description if it's too long
      if (context.jobDescription.length > 1500) {
        context.jobDescription = context.jobDescription.substring(0, 1500) + '... (truncated)';
      }
    }

    // Process detected context if available
    let detectedContextStr = '';
    if (context.detectedContext) {
      const detectedEntities = context.detectedContext.detectedEntities || {};
      const currentContext = context.detectedContext.currentContext || {};

      // Add company information if available
      if (detectedEntities.companies && detectedEntities.companies.length > 0) {
        detectedContextStr += `Detected companies: ${detectedEntities.companies.join(', ')}\n`;
      }

      // Add interviewer information if available
      if (detectedEntities.people && detectedEntities.people.length > 0) {
        detectedContextStr += `Detected people: ${detectedEntities.people.join(', ')}\n`;
      }

      // Add role information if available
      if (detectedEntities.roles && detectedEntities.roles.length > 0) {
        detectedContextStr += `Detected roles: ${detectedEntities.roles.join(', ')}\n`;
      }

      // Add skills information if available
      if (detectedEntities.skills && detectedEntities.skills.length > 0) {
        detectedContextStr += `Detected skills: ${detectedEntities.skills.join(', ')}\n`;
      }

      // Add platform information if available
      if (currentContext.platform) {
        detectedContextStr += `Platform: ${currentContext.platform}\n`;
      }

      // Add call status if available
      if (typeof currentContext.inCall !== 'undefined') {
        detectedContextStr += `In call: ${currentContext.inCall ? 'Yes' : 'No'}\n`;
      }

      // Add conversation history if available
      if (context.detectedContext.conversationHistory && context.detectedContext.conversationHistory.length > 0) {
        // Use only the last 5 exchanges to keep it manageable
        const recentHistory = context.detectedContext.conversationHistory.slice(-5);

        detectedContextStr += 'Recent conversation:\n';
        recentHistory.forEach(exchange => {
          const speaker = exchange.speaker === 'user' ? 'You' : 'Interviewer';
          detectedContextStr += `${speaker}: ${exchange.text.substring(0, 100)}${exchange.text.length > 100 ? '...' : ''}\n`;
        });
      }

      // If we have detected context, add it to the context object
      if (detectedContextStr) {
        context.detectedContextStr = detectedContextStr;
        console.log('Using detected context:', detectedContextStr);
      }
    }

    // Use prompt engineering to optimize the prompt based on question type
    const { systemPrompt, questionType } = promptEngineering.optimizePrompt(question, context);

    console.log(`Detected question type: ${questionType}`);

    // Log if we're using resume or job description
    if (context.usingStoredResume) {
      console.log('Using stored resume data for context');
    }

    if (context.usingStoredJobDescription) {
      console.log('Using stored job description for context');
    }

    // Get model preferences
    const llmPrefs = await new Promise((resolve) => {
      chrome.storage.local.get(['llmPreferences'], (result) => {
        resolve(result.llmPreferences || {});
      });
    });

    // Determine temperature based on question type and response style
    let temperature = 0.7; // default

    // Get response style settings
    const responseStyleSettings = context.responseStyle || {};
    const responseStyle = responseStyleSettings.style || 'balanced';

    // Adjust temperature based on response style
    switch (responseStyle) {
      case 'concise':
        temperature = 0.5; // More precise, less creative
        break;
      case 'detailed':
        temperature = 0.7; // Balanced but detailed
        break;
      case 'confident':
        temperature = 0.4; // More deterministic
        break;
      case 'thoughtful':
        temperature = 0.8; // More creative, varied responses
        break;
      case 'balanced':
      default:
        // Adjust temperature based on question type
        // Lower temperature for technical questions (more precise)
        // Higher temperature for motivational/behavioral questions (more creative)
        switch (questionType) {
          case 'TECHNICAL':
            temperature = 0.5; // More precise, less creative
            break;
          case 'BEHAVIORAL':
          case 'SITUATIONAL':
            temperature = 0.7; // Balanced
            break;
          case 'MOTIVATIONAL':
          case 'STRENGTH_WEAKNESS':
            temperature = 0.8; // More creative, varied responses
            break;
        }
        break;
    }

    // Determine max tokens based on question complexity, context length, and response length setting
    // More context means we need more tokens for the response
    let maxTokens = 1200;

    // Adjust max tokens based on response length setting
    const responseLength = responseStyleSettings.length ? parseInt(responseStyleSettings.length) : 3;

    switch (responseLength) {
      case 1: // Very Brief
        maxTokens = 600;
        break;
      case 2: // Brief
        maxTokens = 900;
        break;
      case 3: // Medium (default)
        maxTokens = 1200;
        break;
      case 4: // Detailed
        maxTokens = 1500;
        break;
      case 5: // Very Detailed
        maxTokens = 2000;
        break;
    }

    // Further increase token limit when using context
    if (context.resume || context.jobDescription || context.detectedContextStr) {
      maxTokens += 300; // Add more tokens when using context
    }

    // Get the appropriate model for the selected provider
    let model = null;
    if (llmPrefs.modelPreferences && llmPrefs.modelPreferences[this.preferredProvider]) {
      model = llmPrefs.modelPreferences[this.preferredProvider];
    }

    // Generate response with optimized prompt and parameters
    const response = await this.generateResponse(question, {
      systemPrompt,
      temperature,
      maxTokens,
      model,
      conversationHistory: context.conversationHistory
    });

    // Add question type and context usage to the response metadata
    response.questionType = questionType;
    response.usedResumeContext = !!context.resume;
    response.usedJobDescriptionContext = !!context.jobDescription;
    response.usedDetectedContext = !!context.detectedContextStr;

    return response;
  }

  /**
   * Update usage statistics
   * @param {string} providerName - The name of the provider
   * @param {Object} usage - Usage statistics
   * @private
   */
  updateUsageStats(providerName, usage) {
    if (!this.usageStats[providerName]) {
      this.usageStats[providerName] = { promptTokens: 0, completionTokens: 0, totalTokens: 0, requests: 0 };
    }

    this.usageStats[providerName].promptTokens += usage.promptTokens || 0;
    this.usageStats[providerName].completionTokens += usage.completionTokens || 0;
    this.usageStats[providerName].totalTokens += usage.totalTokens || 0;
    this.usageStats[providerName].requests += 1;
    this.usageStats[providerName].lastRequest = new Date().toISOString();

    // Save usage stats to storage
    chrome.storage.local.set({ llmUsage: this.usageStats });
  }

  /**
   * Set the preferred LLM provider
   * @param {string} provider - The provider to use
   * @returns {boolean} - Whether the provider was set
   */
  setPreferredProvider(provider) {
    if (['openai', 'gemini', 'anthropic'].includes(provider)) {
      this.preferredProvider = provider;

      // Save preference to storage
      chrome.storage.local.get(['llmPreferences'], (result) => {
        const prefs = result.llmPreferences || {};
        prefs.preferredProvider = provider;
        chrome.storage.local.set({ llmPreferences: prefs });
      });

      return true;
    }
    return false;
  }

  /**
   * Set the fallback order for LLM providers
   * @param {Array<string>} order - The order of providers to try
   * @returns {boolean} - Whether the fallback order was set
   */
  setFallbackOrder(order) {
    if (Array.isArray(order) && order.every(p => ['openai', 'gemini', 'anthropic'].includes(p))) {
      this.fallbackOrder = order;

      // Save preference to storage
      chrome.storage.local.get(['llmPreferences'], (result) => {
        const prefs = result.llmPreferences || {};
        prefs.fallbackOrder = order;
        chrome.storage.local.set({ llmPreferences: prefs });
      });

      return true;
    }
    return false;
  }

  /**
   * Get available providers
   * @returns {Array<string>} - Names of available providers
   */
  getAvailableProviders() {
    const available = [];

    for (const [name, provider] of Object.entries(this.providers)) {
      if (provider.isInitialized()) {
        available.push(name);
      }
    }

    return available;
  }

  /**
   * Get token usage statistics
   * @returns {Object} - Token usage statistics
   */
  getTokenUsage() {
    return this.usageStats;
  }
}

// Create a singleton instance
const llmOrchestrator = new LLMOrchestrator();

export default llmOrchestrator;

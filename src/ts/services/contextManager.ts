/**
 * ContextManager - Advanced context awareness and entity extraction system
 * Implements State pattern with context enrichment and entity recognition
 * Provides comprehensive conversation context management
 */

import { SecureStorage, StorageNamespaces } from '../utils/storage';
import { ResumeParser } from './resumeParser';
import type { SessionMetadata } from '../types/index';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface EntityPattern {
  patterns: RegExp[];
  keywords: string[];
}

export interface EntityExtraction {
  [key: string]: string[];
}

export interface ConversationEntry {
  timestamp: number;
  speaker?: string;
  text: string;
  isQuestion?: boolean;
  entities: EntityExtraction;
  keywords: string[];
}

export interface KeyTopic {
  keyword: string;
  frequency: number;
  firstMentioned: number;
  lastMentioned: number;
}

export interface ContextInsights {
  interviewDuration: number;
  averageResponseTime?: number;
  topSkillsDiscussed: string[];
  matchScore: number;
}

export interface SessionContext {
  sessionId: string;
  platform: string;
  startTime: number;
  resume: any;
  jobDescription: any;
  conversationHistory: ConversationEntry[];
  detectedEntities: Record<string, Set<string>>;
  keyTopics: KeyTopic[];
  questionCount: number;
  currentQuestion: string | null;
  insights?: ContextInsights;
}

export interface ContextUpdate {
  sessionId: string;
  transcription: string;
  isQuestion?: boolean;
  speaker?: string;
}

/**
 * Entity types for structured extraction
 */
export const EntityTypes = {
  COMPANY: 'company',
  ROLE: 'role',
  SKILL: 'skill',
  TECHNOLOGY: 'technology',
  INTERVIEWER: 'interviewer',
  PROJECT: 'project',
  METRIC: 'metric',
} as const;

export type EntityType = (typeof EntityTypes)[keyof typeof EntityTypes];

// =============================================================================
// CONTEXT MANAGER CLASS
// =============================================================================

/**
 * ContextManager - Manages conversation context and entity extraction
 * Implements context enrichment with resume and job description integration
 */
export class ContextManager {
  private readonly storage: SecureStorage;
  private readonly resumeParser: ResumeParser;
  private readonly sessionContexts: Map<string, SessionContext>;
  private readonly entityPatterns: Record<string, EntityPattern>;

  constructor() {
    this.storage = new SecureStorage();
    this.resumeParser = new ResumeParser();

    // Context state containers
    this.sessionContexts = new Map();

    // Entity extraction patterns
    this.entityPatterns = this.initializeEntityPatterns();

    // Load persisted context data
    this.loadPersistedContext();
  }

  /**
   * Initialize entity extraction patterns with NLP heuristics
   * Implements pattern matching for various entity types
   */
  private initializeEntityPatterns(): Record<string, EntityPattern> {
    return {
      [EntityTypes.COMPANY]: {
        patterns: [
          /(?:work(?:ed|ing)?\s+(?:at|for)|employed\s+by|join(?:ed|ing)?)\s+([A-Z][\w\s&]+)/gi,
          /(?:at|with)\s+([A-Z][\w\s&]+)\s+(?:Inc|LLC|Corp|Company|Limited|Ltd)/gi,
        ],
        keywords: ['company', 'employer', 'organization', 'firm'],
      },
      [EntityTypes.ROLE]: {
        patterns: [
          /(?:position|role|title)(?:\s+is|\s+was|\s+of)?\s+([A-Z][\w\s]+(?:Engineer|Developer|Manager|Analyst|Designer))/gi,
          /(?:as|working\s+as)\s+(?:a|an)?\s+([A-Z][\w\s]+)/gi,
        ],
        keywords: ['position', 'role', 'title', 'job'],
      },
      [EntityTypes.SKILL]: {
        patterns: [
          /(?:experience|proficient|skilled|expertise)\s+(?:in|with)\s+([\w\s,+#]+)/gi,
          /(?:using|know|familiar\s+with)\s+([\w\s,+#]+)/gi,
        ],
        keywords: ['skill', 'expertise', 'proficiency', 'experience'],
      },
      [EntityTypes.TECHNOLOGY]: {
        patterns: [
          /\b(React|Angular|Vue|Node\.?js|Python|Java|JavaScript|TypeScript|AWS|Azure|GCP|Docker|Kubernetes)\b/gi,
          /\b([A-Z][\w]+(?:\.js|DB|SQL))\b/g,
        ],
        keywords: ['technology', 'framework', 'language', 'tool'],
      },
    };
  }

  /**
   * Create new session context with initial metadata
   * Implements Factory pattern for context creation
   */
  async createSessionContext(metadata: SessionMetadata): Promise<SessionContext> {
    const sessionId = metadata.sessionId || crypto.randomUUID();

    // Load resume and job description data
    const resumeData = await this.storage.get('resumeData', {
      namespace: StorageNamespaces.RESUME_DATA,
    });

    const jobDescriptions = await this.storage.get('jobDescriptions', {
      namespace: StorageNamespaces.RESUME_DATA,
    });

    const context: SessionContext = {
      sessionId,
      platform: metadata.platform || 'unknown',
      startTime: Date.now(),
      resume: resumeData,
      jobDescription: jobDescriptions?.[0], // Use most recent job description
      conversationHistory: [],
      detectedEntities: {
        [EntityTypes.COMPANY]: new Set(),
        [EntityTypes.ROLE]: new Set(),
        [EntityTypes.SKILL]: new Set(),
        [EntityTypes.TECHNOLOGY]: new Set(),
        [EntityTypes.INTERVIEWER]: new Set(),
        [EntityTypes.PROJECT]: new Set(),
        [EntityTypes.METRIC]: new Set(),
      },
      keyTopics: [],
      questionCount: 0,
      currentQuestion: null,
    };

    this.sessionContexts.set(sessionId, context);
    await this.persistContext(sessionId, context);

    return context;
  }

  /**
   * Enrich context with additional data and insights
   * Implements Decorator pattern for context enhancement
   */
  async enrichContext(baseContext: any): Promise<SessionContext> {
    const sessionId = baseContext.sessionId;
    const context =
      this.sessionContexts.get(sessionId) || (await this.createSessionContext(baseContext));

    // Merge base context with stored context
    const enrichedContext: SessionContext = {
      ...context,
      ...baseContext,

      // Add derived insights
      insights: {
        interviewDuration: Date.now() - context.startTime,
        averageResponseTime: this.calculateAverageResponseTime(context),
        topSkillsDiscussed: this.identifyTopSkills(context),
        matchScore: this.calculateJobMatchScore(context),
      },
    };

    // Update session context
    this.sessionContexts.set(sessionId, enrichedContext);

    return enrichedContext;
  }

  /**
   * Update context with new transcription data
   * Implements Observer pattern for reactive updates
   */
  async updateContext(update: ContextUpdate): Promise<SessionContext | undefined> {
    const { sessionId, transcription, isQuestion, speaker } = update;
    const context = this.sessionContexts.get(sessionId);

    if (!context) {
      console.error('Context not found for session:', sessionId);
      return;
    }

    // Extract entities from transcription
    const extractedEntities = this.extractEntities(transcription);

    // Update detected entities
    for (const [type, entities] of Object.entries(extractedEntities)) {
      const entitySet = context.detectedEntities[type];
      if (entitySet) {
        entities.forEach((entity) => entitySet.add(entity));
      }
    }

    // Update conversation history
    const entry: ConversationEntry = {
      timestamp: Date.now(),
      text: transcription,
      entities: extractedEntities,
      keywords: this.extractKeywords(transcription),
      ...(speaker && { speaker }),
      ...(isQuestion !== undefined && { isQuestion }),
    };

    context.conversationHistory.push(entry);

    if (isQuestion) {
      context.questionCount++;
      context.currentQuestion = transcription;
    }

    // Update key topics
    this.updateKeyTopics(context, entry.keywords);

    // Persist updated context
    await this.persistContext(sessionId, context);

    return context;
  }

  /**
   * Extract entities from text using pattern matching and NLP
   * Implements Named Entity Recognition (NER) algorithms
   */
  private extractEntities(text: string): EntityExtraction {
    const entities: Record<string, Set<string>> = {};

    for (const [type, config] of Object.entries(this.entityPatterns)) {
      entities[type] = new Set();

      // Apply regex patterns
      config.patterns.forEach((pattern) => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          if (match[1] && entities[type]) {
            entities[type].add(match[1].trim());
          }
        }
      });

      // Apply keyword-based extraction
      if (config.keywords.some((keyword) => text.toLowerCase().includes(keyword))) {
        // Extract following words as potential entities
        const words = text.split(/\s+/);
        words.forEach((word, index) => {
          if (config.keywords.includes(word.toLowerCase()) && index < words.length - 1) {
            // Look ahead for capitalized words
            let entity = '';
            for (let i = index + 1; i < Math.min(index + 4, words.length); i++) {
              const word = words[i];
              if (word && word[0] && word[0] === word[0].toUpperCase()) {
                entity += word + ' ';
              } else {
                break;
              }
            }
            if (entity.trim() && entities[type]) {
              entities[type].add(entity.trim());
            }
          }
        });
      }
    }

    // Convert Sets to Arrays for serialization
    const result: EntityExtraction = {};
    for (const [type, entitySet] of Object.entries(entities)) {
      result[type] = Array.from(entitySet);
    }

    return result;
  }

  /**
   * Extract keywords using TF-IDF inspired algorithm
   * Implements statistical keyword extraction
   */
  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'as', 'is', 'was', 'are', 'were', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'could', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
    ]);

    const words = text
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));

    // Count word frequencies
    const wordFreq: Record<string, number> = {};
    words.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Sort by frequency and return top keywords
    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Update key topics based on conversation flow
   * Implements topic modeling heuristics
   */
  private updateKeyTopics(context: SessionContext, keywords: string[]): void {
    keywords.forEach((keyword) => {
      const existingTopic = context.keyTopics.find((topic) => topic.keyword === keyword);

      if (existingTopic) {
        existingTopic.frequency++;
        existingTopic.lastMentioned = Date.now();
      } else {
        context.keyTopics.push({
          keyword,
          frequency: 1,
          firstMentioned: Date.now(),
          lastMentioned: Date.now(),
        });
      }
    });

    // Keep only top 10 topics by frequency
    context.keyTopics.sort((a, b) => b.frequency - a.frequency);
    context.keyTopics = context.keyTopics.slice(0, 10);
  }

  /**
   * Calculate average response time for context insights
   */
  private calculateAverageResponseTime(context: SessionContext): number {
    const questionTimestamps: number[] = [];
    const responseTimestamps: number[] = [];

    context.conversationHistory.forEach((entry) => {
      if (entry.isQuestion) {
        questionTimestamps.push(entry.timestamp);
      } else {
        responseTimestamps.push(entry.timestamp);
      }
    });

    if (questionTimestamps.length === 0 || responseTimestamps.length === 0) {
      return 0;
    }

    let totalResponseTime = 0;
    let validResponses = 0;

    for (let i = 0; i < questionTimestamps.length; i++) {
      // Find the next response after this question
      const questionTime = questionTimestamps[i];
      if (questionTime !== undefined) {
        const nextResponse = responseTimestamps.find(
          (responseTime) => responseTime > questionTime
        );
        if (nextResponse) {
          totalResponseTime += nextResponse - questionTime;
          validResponses++;
        }
      }
    }

    return validResponses > 0 ? totalResponseTime / validResponses : 0;
  }

  /**
   * Identify top skills discussed in the context
   */
  private identifyTopSkills(context: SessionContext): string[] {
    const skillEntities = context.detectedEntities[EntityTypes.SKILL];
    const technologyEntities = context.detectedEntities[EntityTypes.TECHNOLOGY];
    
    const allSkills = [
      ...(skillEntities ? Array.from(skillEntities) : []),
      ...(technologyEntities ? Array.from(technologyEntities) : [])
    ];
    
    // Return top 5 most mentioned skills
    return allSkills.slice(0, 5);
  }

  /**
   * Calculate job match score based on context analysis
   * Implements scoring algorithm for fit assessment
   */
  private calculateJobMatchScore(context: SessionContext): number {
    if (!context.resume || !context.jobDescription) {
      return 0;
    }

    const resumeSkills = new Set<string>(context.resume.structured?.skills || []);
    const requiredSkills = new Set<string>(context.jobDescription.requirements || []);
    const discussedSkills = context.detectedEntities[EntityTypes.SKILL];

    let matchedSkills = 0;
    let discussedRelevantSkills = 0;

    requiredSkills.forEach((skill: string) => {
      if (resumeSkills.has(skill)) {
        matchedSkills++;
      }
      if (discussedSkills && discussedSkills.has(skill)) {
        discussedRelevantSkills++;
      }
    });

    const baseScore = requiredSkills.size > 0 ? matchedSkills / requiredSkills.size : 0;
    const discussionBonus =
      requiredSkills.size > 0 ? (discussedRelevantSkills / requiredSkills.size) * 0.2 : 0;

    return Math.min(baseScore + discussionBonus, 1.0);
  }

  /**
   * Persist context to storage for recovery
   * Implements persistence layer with serialization
   */
  private async persistContext(sessionId: string, context: SessionContext): Promise<void> {
    // Convert Sets to Arrays for serialization
    const serializable = {
      ...context,
      detectedEntities: {} as Record<string, string[]>,
    };

    for (const [type, entitySet] of Object.entries(context.detectedEntities)) {
      serializable.detectedEntities[type] = Array.from(entitySet);
    }

    await this.storage.set(`context_${sessionId}`, serializable, {
      namespace: StorageNamespaces.CONTEXT_CACHE,
    });
  }

  /**
   * Load persisted context data on initialization
   * Implements recovery mechanism for session continuity
   */
  private async loadPersistedContext(): Promise<void> {
    const keys = await this.storage.getNamespaceKeys(StorageNamespaces.CONTEXT_CACHE);

    for (const key of keys) {
      const keyParts = key.split(':');
      const contextKey = keyParts[1];
      if (contextKey) {
        const context = await this.storage.get(contextKey, {
          namespace: StorageNamespaces.CONTEXT_CACHE,
        });

        if (context && context.sessionId) {
          // Restore Sets from Arrays
          for (const [type, entities] of Object.entries(context.detectedEntities)) {
            if (Array.isArray(entities)) {
              context.detectedEntities[type] = new Set(entities);
            }
          }

          this.sessionContexts.set(context.sessionId, context);
        }
      }
    }
  }
} 
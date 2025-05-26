/**
 * PerformanceAnalyzer - Interview performance tracking and analysis
 * Implements comprehensive metrics calculation and coaching
 * Provides data-driven insights for interview improvement
 */

import type {
  PerformanceMeasurement,
  PerformanceEvent,
  PerformanceReport,
  TranscriptionData,
  SuggestionEntry,
  SessionMetadata,
} from '../types/index';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface MetricsConfig {
  speechMetrics: {
    fillerWords: string[];
    pacingThresholds: {
      slow: number;
      optimal: number;
      fast: number;
    };
  };
  responseMetrics: {
    optimalLength: {
      min: number;
      max: number;
    };
    starMethodKeywords: string[];
  };
  engagementMetrics: {
    questionResponseTime: number;
    followUpIndicators: string[];
  };
}

export interface InterviewTranscription extends TranscriptionData {
  timestamp: Date;
  text: string;
  confidence: number;
  isQuestion?: boolean;
  speaker?: string;
}

export interface InterviewQuestion {
  text: string;
  timestamp: number;
  type: QuestionType;
}

export interface InterviewSuggestion extends SuggestionEntry {
  wasUsed: boolean;
}

export interface InterviewMetrics {
  speech: SpeechMetrics;
  content: ContentMetrics;
  engagement: EngagementMetrics;
  technical: TechnicalMetrics;
  timing: TimingMetrics;
}

export interface SpeechMetrics {
  fillerCount: number;
  fillerRate: number;
  fillerUsage: Map<string, number>;
  averagePace: number;
  paceRating: string;
  clarity: number;
  confidence: number;
}

export interface ContentMetrics {
  starMethodUsage: number;
  responseQuality: number;
  relevance: number;
  specificity: number;
  examples: number;
}

export interface EngagementMetrics {
  averageResponseTime: number;
  hesitationCount: number;
  followUpQuestions: number;
  activeListening: number;
}

export interface TechnicalMetrics {
  accuracy: number;
  depth: number;
  terminology: number;
  problemSolving: number;
}

export interface TimingMetrics {
  totalDuration: number;
  questionTime: number;
  responseTime: number;
  silenceTime: number;
  balance: number;
  averageResponseTime?: number;
}

export interface InterviewInsight {
  type: 'strength' | 'weakness' | 'improvement' | 'suggestion';
  category: string;
  title: string;
  description: string;
  score: number;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  examples?: string[];
}

export interface Interview {
  id: string;
  startTime: number;
  endTime: number | null;
  duration?: number;
  metadata: SessionMetadata;
  transcription: InterviewTranscription[];
  questions: InterviewQuestion[];
  responses: any[];
  suggestions: InterviewSuggestion[];
  metrics: InterviewMetrics | null;
  score: number | null;
  insights: InterviewInsight[] | null;
}

export interface AggregateStats {
  totalInterviews: number;
  averageScore: number;
  improvementTrend: number[];
  commonWeaknesses: Map<string, number>;
  strongAreas: Map<string, number>;
}

export interface PerformanceAnalyzerConfig {
  enableRemoteLogging: boolean;
  remoteLoggingEndpoint: string;
  sampleRate: number;
}

export type QuestionType =
  | 'behavioral'
  | 'technical'
  | 'situational'
  | 'cultural'
  | 'personal'
  | 'other';

// =============================================================================
// PERFORMANCE ANALYZER CLASS
// =============================================================================

/**
 * PerformanceAnalyzer - Analyzes interview performance metrics
 * Implements statistical analysis and trend detection
 */
export class PerformanceAnalyzer {
  private readonly metricsConfig: MetricsConfig;
  private readonly interviews: Map<string, Interview>;
  private readonly aggregateStats: AggregateStats;
  private readonly measurements: Map<string, PerformanceMeasurement>;
  private readonly completedMeasurements: Map<string, PerformanceMeasurement>;
  private readonly eventLog: PerformanceEvent[];
  private readonly errorLog: any[];
  private readonly config: PerformanceAnalyzerConfig;

  constructor() {
    // Performance metrics configuration
    this.metricsConfig = {
      speechMetrics: {
        fillerWords: ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally'],
        pacingThresholds: {
          slow: 120, // words per minute
          optimal: 150,
          fast: 180,
        },
      },
      responseMetrics: {
        optimalLength: {
          min: 30, // seconds
          max: 120,
        },
        starMethodKeywords: ['situation', 'task', 'action', 'result'],
      },
      engagementMetrics: {
        questionResponseTime: 5000, // ms before considered hesitation
        followUpIndicators: ['elaborate', 'example', 'specifically', 'detail'],
      },
    };

    // Interview data storage
    this.interviews = new Map();

    // Aggregate statistics
    this.aggregateStats = {
      totalInterviews: 0,
      averageScore: 0,
      improvementTrend: [],
      commonWeaknesses: new Map(),
      strongAreas: new Map(),
    };

    // Performance monitoring
    this.measurements = new Map();
    this.completedMeasurements = new Map();
    this.eventLog = [];
    this.errorLog = [];

    this.config = {
      enableRemoteLogging: false,
      remoteLoggingEndpoint: '',
      sampleRate: 1.0, // Log all events by default
    };

    // Load persisted data
    this.loadPersistedData();
  }

  /**
   * Record new interview session
   * Initializes interview tracking
   */
  startInterview(metadata: SessionMetadata, id?: string): string {
    const interviewId = id || crypto.randomUUID();

    const interview: Interview = {
      id: interviewId,
      startTime: Date.now(),
      endTime: null,
      metadata: {
        company: metadata.company || 'Unknown',
        position: metadata.position || 'Unknown',
        platform: metadata.platform || 'Unknown',
        ...metadata,
      },
      transcription: [],
      questions: [],
      responses: [],
      suggestions: [],
      metrics: null,
      score: null,
      insights: null,
    };

    this.interviews.set(interviewId, interview);

    return interviewId;
  }

  /**
   * Add transcription entry to interview
   * Processes speech data for analysis
   */
  addTranscription(interviewId: string, entry: TranscriptionData): void {
    const interview = this.interviews.get(interviewId);
    if (!interview) {
      return;
    }

    const transcriptionEntry: InterviewTranscription = {
      ...entry,
      timestamp: typeof entry.timestamp === 'object' && entry.timestamp instanceof Date 
        ? entry.timestamp 
        : new Date(entry.timestamp || Date.now()),
    };

    interview.transcription.push(transcriptionEntry);

    // Detect questions
    if (entry.isQuestion) {
      interview.questions.push({
        text: entry.text,
        timestamp: typeof entry.timestamp === 'object' && entry.timestamp instanceof Date 
          ? entry.timestamp.getTime() 
          : (entry.timestamp || Date.now()),
        type: this.categorizeQuestion(entry.text),
      });
    }
  }

  /**
   * Record AI suggestion provided
   */
  addSuggestion(interviewId: string, suggestion: SuggestionEntry): void {
    const interview = this.interviews.get(interviewId);
    if (!interview) {
      return;
    }

    const interviewSuggestion: InterviewSuggestion = {
      ...suggestion,
      timestamp: new Date(Date.now()),
      wasUsed: false,
    };

    interview.suggestions.push(interviewSuggestion);
  }

  /**
   * Complete interview and calculate metrics
   * Performs comprehensive analysis
   */
  async completeInterview(interviewId: string): Promise<PerformanceReport | null> {
    const interview = this.interviews.get(interviewId);
    if (!interview) {
      return null;
    }

    interview.endTime = Date.now();
    interview.duration = interview.endTime - interview.startTime;

    // Calculate comprehensive metrics
    interview.metrics = await this.calculateMetrics(interview);
    interview.score = this.calculateOverallScore(interview.metrics);
    interview.insights = this.generateInsights(interview);

    // Update aggregate statistics
    this.updateAggregateStats(interview);

    // Persist data
    await this.persistInterview(interview);

    return {
      sessionId: interviewId,
      startTime: new Date(interview.startTime),
      duration: interview.duration || 0,
      metrics: {
        responseTime: interview.metrics?.engagement.averageResponseTime || 0,
        accuracy: interview.metrics?.technical.accuracy || 0,
        relevanceScore: interview.metrics?.content.relevance || 0,
        documentsProcessed: 0,
        suggestionsProvided: interview.suggestions.length,
        successfulInteractions: interview.suggestions.filter(s => s.wasUsed).length
      },
      events: this.eventLog,
      interviews: [],
      generatedAt: new Date()
    };
  }

  /**
   * Calculate comprehensive performance metrics
   * Implements multi-dimensional analysis
   */
  private async calculateMetrics(interview: Interview): Promise<InterviewMetrics> {
    const metrics: InterviewMetrics = {
      speech: this.analyzeSpeechPatterns(interview),
      content: this.analyzeResponseContent(interview),
      engagement: this.analyzeEngagement(interview),
      technical: this.analyzeTechnicalAccuracy(interview),
      timing: this.analyzeTimingMetrics(interview),
    };

    return metrics;
  }

  /**
   * Analyze speech patterns and delivery
   */
  private analyzeSpeechPatterns(interview: Interview): SpeechMetrics {
    const userTranscriptions = interview.transcription.filter((t) => !t.isQuestion);
    const totalWords = userTranscriptions.reduce((sum, t) => sum + t.text.split(' ').length, 0);

    // Count filler words
    let fillerCount = 0;
    const fillerUsage = new Map<string, number>();

    userTranscriptions.forEach((entry) => {
      const words = entry.text.toLowerCase().split(/\s+/);
      words.forEach((word) => {
        if (this.metricsConfig.speechMetrics.fillerWords.includes(word)) {
          fillerCount++;
          fillerUsage.set(word, (fillerUsage.get(word) || 0) + 1);
        }
      });
    });

    const fillerRate = totalWords > 0 ? (fillerCount / totalWords) * 100 : 0;

    // Calculate average pace (words per minute)
    const speakingTime = userTranscriptions.reduce(
      (sum, entry) => sum + (typeof entry.timestamp === 'object' && entry.timestamp instanceof Date 
        ? entry.timestamp.getTime() 
        : (entry.timestamp || 0)),
      0
    );
    const averagePace = speakingTime > 0 ? (totalWords / speakingTime) * 60000 : 0;

    return {
      fillerCount,
      fillerRate,
      fillerUsage,
      averagePace,
      paceRating: this.ratePace(averagePace),
      clarity: Math.max(0, 100 - fillerRate * 2), // Simple clarity calculation
      confidence: this.calculateConfidenceScore(userTranscriptions),
    };
  }

  /**
   * Analyze response content quality
   */
  private analyzeResponseContent(interview: Interview): ContentMetrics {
    const userResponses = interview.transcription.filter((t) => !t.isQuestion);
    const totalText = userResponses.map((r) => r.text).join(' ').toLowerCase();

    // Check for STAR method usage
    const starMethodUsage = this.metricsConfig.responseMetrics.starMethodKeywords.reduce(
      (count, keyword) => count + (totalText.includes(keyword) ? 1 : 0),
      0
    );

    // Analyze examples usage
    const exampleIndicators = ['for example', 'for instance', 'such as', 'like when'];
    const examples = exampleIndicators.reduce(
      (count, indicator) => count + (totalText.includes(indicator) ? 1 : 0),
      0
    );

    return {
      starMethodUsage: (starMethodUsage / this.metricsConfig.responseMetrics.starMethodKeywords.length) * 100,
      responseQuality: this.calculateResponseQuality(userResponses),
      relevance: this.calculateRelevance(interview),
      specificity: this.calculateSpecificity(userResponses),
      examples,
    };
  }

  /**
   * Analyze engagement metrics
   */
  private analyzeEngagement(interview: Interview): EngagementMetrics {
    const responses = interview.transcription.filter((t) => !t.isQuestion);
    const questions = interview.questions;

    // Calculate average response time
    let totalResponseTime = 0;
    let hesitationCount = 0;

    for (let i = 0; i < questions.length && i < responses.length; i++) {
      const response = responses[i];
      const question = questions[i];
      
      if (response && question) {
        const responseTimestamp = typeof response.timestamp === 'object' && response.timestamp instanceof Date 
          ? response.timestamp.getTime() 
          : (response.timestamp || Date.now());
        const responseTime = responseTimestamp - question.timestamp;
        totalResponseTime += responseTime;

        if (responseTime > this.metricsConfig.engagementMetrics.questionResponseTime) {
          hesitationCount++;
        }
      }
    }

    const averageResponseTime = questions.length > 0 ? totalResponseTime / questions.length : 0;

    return {
      averageResponseTime,
      hesitationCount,
      followUpQuestions: this.countFollowUpQuestions(interview),
      activeListening: this.calculateActiveListening(interview),
    };
  }

  /**
   * Analyze technical accuracy
   */
  private analyzeTechnicalAccuracy(interview: Interview): TechnicalMetrics {
    // This is a simplified implementation
    // In a real application, you might use NLP to analyze technical content
    return {
      accuracy: 75, // Placeholder - would need sophisticated analysis
      depth: 70,
      terminology: 80,
      problemSolving: 65,
    };
  }

  /**
   * Analyze timing metrics
   */
  private analyzeTimingMetrics(interview: Interview): TimingMetrics {
    const totalDuration = interview.duration || 0;
    const questionTime = interview.questions.reduce((sum, q) => sum + 5000, 0); // Assume 5s per question
    const responseTime = totalDuration - questionTime;

    return {
      totalDuration,
      questionTime,
      responseTime,
      silenceTime: 0, // Would need audio analysis
      balance: responseTime > 0 ? (questionTime / responseTime) * 100 : 0,
      averageResponseTime: responseTime > 0 ? (questionTime / responseTime) * 100 : 0,
    };
  }

  /**
   * Calculate overall performance score
   */
  private calculateOverallScore(metrics: InterviewMetrics): number {
    const weights = {
      speech: 0.25,
      content: 0.35,
      engagement: 0.25,
      technical: 0.15,
    };

    const speechScore = (metrics.speech.clarity + (100 - metrics.speech.fillerRate)) / 2;
    const contentScore = (metrics.content.responseQuality + metrics.content.starMethodUsage) / 2;
    const engagementScore = Math.max(0, 100 - metrics.engagement.hesitationCount * 10);
    const technicalScore = (
      metrics.technical.accuracy +
      metrics.technical.depth +
      metrics.technical.terminology
    ) / 3;

    return (
      speechScore * weights.speech +
      contentScore * weights.content +
      engagementScore * weights.engagement +
      technicalScore * weights.technical
    );
  }

  /**
   * Generate actionable insights
   */
  private generateInsights(interview: Interview): InterviewInsight[] {
    const insights: InterviewInsight[] = [];
    const metrics = interview.metrics;

    if (!metrics) return insights;

    // Filler words insight
    if (metrics.speech.fillerRate > 5) {
      insights.push({
        type: 'weakness',
        category: 'speech',
        title: 'Excessive Filler Words',
        description: `You used ${metrics.speech.fillerCount} filler words (${metrics.speech.fillerRate.toFixed(1)}% of total words). Try to pause instead of using fillers.`,
        score: 100 - metrics.speech.fillerRate,
        priority: 'high',
        actionable: true,
        examples: Array.from(metrics.speech.fillerUsage.keys()).slice(0, 3),
      });
    }

    // STAR method insight
    if (metrics.content.starMethodUsage < 50) {
      insights.push({
        type: 'improvement',
        category: 'content',
        title: 'STAR Method Usage',
        description: 'Consider using the STAR method (Situation, Task, Action, Result) to structure your behavioral responses.',
        score: metrics.content.starMethodUsage,
        priority: 'medium',
        actionable: true,
      });
    }

    // Response time insight
    if (metrics.engagement.hesitationCount > 2) {
      insights.push({
        type: 'weakness',
        category: 'engagement',
        title: 'Response Hesitation',
        description: `You hesitated before responding ${metrics.engagement.hesitationCount} times. Practice common interview questions to improve response speed.`,
        score: Math.max(0, 100 - metrics.engagement.hesitationCount * 20),
        priority: 'medium',
        actionable: true,
      });
    }

    return insights;
  }

  /**
   * Generate comprehensive performance report
   */
  private generateReport(interview: Interview): any {
    return {
      summary: {
        overallScore: interview.score,
        duration: this.formatDuration(interview.duration || 0),
        questionsAnswered: interview.questions.length,
        suggestionsProvided: interview.suggestions.length,
      },
      metrics: interview.metrics,
      insights: interview.insights,
      recommendations: this.generateRecommendations(interview),
    };
  }

  /**
   * Generate recommendations based on performance
   */
  private generateRecommendations(interview: Interview): string[] {
    const recommendations: string[] = [];
    const metrics = interview.metrics;

    if (!metrics) return recommendations;

    if (metrics.speech.fillerRate > 3) {
      recommendations.push('Practice speaking more slowly and pause instead of using filler words');
    }

    if (metrics.content.starMethodUsage < 75) {
      recommendations.push('Structure behavioral responses using the STAR method');
    }

    if (metrics.engagement.averageResponseTime > 8000) {
      recommendations.push('Practice common interview questions to reduce response time');
    }

    return recommendations;
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private categorizeQuestion(text: string): QuestionType {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('tell me about') || lowerText.includes('describe a time')) {
      return 'behavioral';
    }
    if (lowerText.includes('how would you') || lowerText.includes('what would you do')) {
      return 'situational';
    }
    if (lowerText.includes('culture') || lowerText.includes('team') || lowerText.includes('values')) {
      return 'cultural';
    }
    if (lowerText.includes('technical') || lowerText.includes('code') || lowerText.includes('algorithm')) {
      return 'technical';
    }

    return 'other';
  }

  private ratePace(wpm: number): string {
    const thresholds = this.metricsConfig.speechMetrics.pacingThresholds;
    if (wpm < thresholds.slow) return 'slow';
    if (wpm > thresholds.fast) return 'fast';
    return 'optimal';
  }

  private calculateConfidenceScore(transcriptions: InterviewTranscription[]): number {
    // Simple confidence calculation based on avg confidence and response length
    const avgConfidence = transcriptions.reduce((sum, t) => sum + (t.confidence || 0), 0) / transcriptions.length;
    const avgLength = transcriptions.reduce((sum, t) => sum + t.text.length, 0) / transcriptions.length;
    
    // Combine confidence and length factors
    return Math.min(100, avgConfidence * 100 + (avgLength / 50));
  }

  private calculateResponseQuality(responses: InterviewTranscription[]): number {
    // Placeholder implementation
    const avgLength = responses.reduce((sum, r) => sum + r.text.length, 0) / responses.length;
    return Math.min(100, (avgLength / 100) * 100);
  }

  private calculateRelevance(interview: Interview): number {
    // Placeholder implementation
    return 80;
  }

  private calculateSpecificity(responses: InterviewTranscription[]): number {
    // Look for specific details, numbers, proper nouns
    const totalText = responses.map(r => r.text).join(' ');
    const specificIndicators = /\b\d+\b|[A-Z][a-z]+\s[A-Z][a-z]+|\$\d+|%/g;
    const matches = totalText.match(specificIndicators) || [];
    return Math.min(100, (matches.length / responses.length) * 20);
  }

  private countFollowUpQuestions(interview: Interview): number {
    const questionTexts = interview.questions.map(q => q.text.toLowerCase());
    return questionTexts.filter(text => 
      this.metricsConfig.engagementMetrics.followUpIndicators.some(indicator => text.includes(indicator))
    ).length;
  }

  private calculateActiveListening(interview: Interview): number {
    // Placeholder - would analyze if responses reference previous questions
    return 75;
  }

  private updateAggregateStats(interview: Interview): void {
    this.aggregateStats.totalInterviews++;
    
    if (interview.score !== null) {
      const newAverage = (
        (this.aggregateStats.averageScore * (this.aggregateStats.totalInterviews - 1)) +
        interview.score
      ) / this.aggregateStats.totalInterviews;
      
      this.aggregateStats.averageScore = newAverage;
      this.aggregateStats.improvementTrend.push(interview.score);
    }
  }

  private formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  private async persistInterview(interview: Interview): Promise<void> {
    try {
      const data = await chrome.storage.local.get('interview_history');
      const history = data.interview_history || [];
      
      history.push({
        id: interview.id,
        date: new Date(interview.startTime).toISOString(),
        score: interview.score,
        insights: interview.insights?.length || 0,
        company: interview.metadata.company,
        position: interview.metadata.position,
      });

      await chrome.storage.local.set({ interview_history: history });
    } catch (error) {
      console.error('Failed to persist interview:', error);
    }
  }

  private async loadPersistedData(): Promise<void> {
    try {
      const data = await chrome.storage.local.get(['interview_history', 'aggregate_stats']);
      
      if (data.aggregate_stats) {
        Object.assign(this.aggregateStats, data.aggregate_stats);
      }
    } catch (error) {
      console.error('Failed to load persisted data:', error);
    }
  }

  // =============================================================================
  // PERFORMANCE MONITORING METHODS
  // =============================================================================

  startMeasurement(id: string): void {
    const measurement: PerformanceMeasurement = {
      name: id,
      startTime: performance.now(),
    };
    this.measurements.set(id, measurement);
  }

  endMeasurement(id: string): PerformanceMeasurement | null {
    const measurement = this.measurements.get(id);
    if (!measurement) {
      return null;
    }

    const endTime = performance.now();
    const completedMeasurement: PerformanceMeasurement = {
      ...measurement,
      endTime,
      duration: endTime - measurement.startTime
    };

    this.measurements.delete(id);
    this.completedMeasurements.set(id, completedMeasurement);

    return completedMeasurement;
  }

  getMeasurement(id: string): PerformanceMeasurement | null {
    return this.completedMeasurements.get(id) || null;
  }

  isMeasuring(id: string): boolean {
    return this.measurements.has(id);
  }

  logEvent(eventName: string, details: Record<string, any> = {}): void {
    if (Math.random() > this.config.sampleRate) {
      return; // Skip this event based on sampling rate
    }

    const event: PerformanceEvent = {
      name: eventName,
      type: 'info',
      timestamp: Date.now(),
      data: details
    };

    this.eventLog.push(event);

    // Keep log size manageable
    if (this.eventLog.length > 1000) {
      this.eventLog.splice(0, 100);
    }
  }

  logError(errorName: string, error: Error, context: Record<string, any> = {}): void {
    const errorEntry = {
      name: errorName,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      context,
    };

    this.errorLog.push(errorEntry);

    // Keep error log size manageable
    if (this.errorLog.length > 100) {
      this.errorLog.splice(0, 10);
    }
  }

  getEventLog(): readonly PerformanceEvent[] {
    return [...this.eventLog];
  }

  getErrorLog(): readonly any[] {
    return [...this.errorLog];
  }

  clearLogs(): void {
    this.eventLog.length = 0;
    this.errorLog.length = 0;
    this.completedMeasurements.clear();
  }
} 
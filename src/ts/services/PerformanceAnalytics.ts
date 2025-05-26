/**
 * Performance Analytics - Advanced Interview Performance Tracking
 * Tracks pace, filler words, confidence, topic coverage, and response quality
 */

import { SecureStorage } from '../utils/storage';

interface PerformanceMetrics {
  sessionId: string;
  timestamp: number;
  duration: number;
  
  // Speech Analytics
  wordsPerMinute: number;
  fillerWordCount: number;
  fillerWordRate: number;
  pauseCount: number;
  averagePauseLength: number;
  
  // Confidence Metrics
  confidenceScore: number;
  uncertaintyMarkers: number;
  hedgingLanguage: number;
  
  // Response Quality
  responseLength: number;
  questionsAnswered: number;
  topicCoverage: number;
  technicalAccuracy: number;
  
  // Behavioral Analysis
  interruptionCount: number;
  clarificationRequests: number;
  offtopicResponses: number;
}

interface RealTimeFeedback {
  type: 'pace' | 'filler' | 'confidence' | 'clarity' | 'topic';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  timestamp: number;
}

interface PerformanceReport {
  overallScore: number;
  strengthAreas: string[];
  improvementAreas: string[];
  recommendations: string[];
  comparison: {
    previousSessions: number;
    industryAverage: number;
    topPerformerBenchmark: number;
  };
}

export class PerformanceAnalytics {
  private storage: SecureStorage;
  private currentSession: PerformanceMetrics | null = null;
  private realTimeFeedbackQueue: RealTimeFeedback[] = [];
  
  // Real-time tracking variables
  private speechStartTime: number = 0;
  private speechEndTime: number = 0;
  private wordCount: number = 0;
  private pauseStart: number = 0;
  private pauseTimes: number[] = [];
  
  // Filler word patterns
  private readonly FILLER_WORDS = [
    'um', 'uh', 'er', 'ah', 'like', 'you know', 'so', 'actually',
    'basically', 'literally', 'right', 'okay', 'well', 'kind of',
    'sort of', 'i mean', 'you see', 'let me think'
  ];
  
  // Uncertainty markers
  private readonly UNCERTAINTY_MARKERS = [
    'maybe', 'perhaps', 'probably', 'i think', 'i guess', 'i suppose',
    'might be', 'could be', 'not sure', 'uncertain', 'unsure'
  ];

  constructor() {
    this.storage = new SecureStorage();
  }

  /**
   * Start a new performance tracking session
   */
  startSession(sessionId: string): void {
    this.currentSession = {
      sessionId,
      timestamp: Date.now(),
      duration: 0,
      wordsPerMinute: 0,
      fillerWordCount: 0,
      fillerWordRate: 0,
      pauseCount: 0,
      averagePauseLength: 0,
      confidenceScore: 100,
      uncertaintyMarkers: 0,
      hedgingLanguage: 0,
      responseLength: 0,
      questionsAnswered: 0,
      topicCoverage: 0,
      technicalAccuracy: 0,
      interruptionCount: 0,
      clarificationRequests: 0,
      offtopicResponses: 0
    };
    
    this.speechStartTime = Date.now();
    this.realTimeFeedbackQueue = [];
  }

  /**
   * Analyze speech in real-time
   */
  analyzeSpeech(transcript: string, isComplete: boolean = false): RealTimeFeedback[] {
    if (!this.currentSession) return [];
    
    const feedback: RealTimeFeedback[] = [];
    const words = transcript.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    
    // Update word count
    if (isComplete) {
      this.wordCount += words.length;
      this.currentSession.responseLength = this.wordCount;
    }
    
    // Analyze filler words
    const fillerCount = this.countFillerWords(words);
    this.currentSession.fillerWordCount += fillerCount;
    
    if (fillerCount > 3 && words.length < 50) {
      feedback.push({
        type: 'filler',
        severity: 'medium',
        message: 'High filler word usage detected',
        suggestion: 'Try to pause instead of using filler words like "um" or "like"',
        timestamp: Date.now()
      });
    }
    
    // Analyze confidence markers
    const uncertaintyCount = this.countUncertaintyMarkers(words);
    this.currentSession.uncertaintyMarkers += uncertaintyCount;
    
    if (uncertaintyCount > 2) {
      feedback.push({
        type: 'confidence',
        severity: 'medium',
        message: 'Uncertain language detected',
        suggestion: 'Use more decisive language. Replace "I think" with "I believe" or state facts directly',
        timestamp: Date.now()
      });
    }
    
    // Analyze pace
    if (isComplete) {
      const currentWPM = this.calculateWPM();
      this.currentSession.wordsPerMinute = currentWPM;
      
      if (currentWPM > 180) {
        feedback.push({
          type: 'pace',
          severity: 'high',
          message: 'Speaking too fast',
          suggestion: 'Slow down your speech. Aim for 120-150 words per minute',
          timestamp: Date.now()
        });
      } else if (currentWPM < 100) {
        feedback.push({
          type: 'pace',
          severity: 'medium',
          message: 'Speaking too slowly',
          suggestion: 'Increase your pace slightly to maintain engagement',
          timestamp: Date.now()
        });
      }
    }
    
    // Analyze clarity and structure
    if (words.length > 100) {
      const clarityScore = this.analyzeClarityStructure(transcript);
      if (clarityScore < 0.6) {
        feedback.push({
          type: 'clarity',
          severity: 'medium',
          message: 'Response could be more structured',
          suggestion: 'Use frameworks like STAR (Situation, Task, Action, Result) for better structure',
          timestamp: Date.now()
        });
      }
    }
    
    this.realTimeFeedbackQueue.push(...feedback);
    return feedback;
  }

  /**
   * Track pause during speech
   */
  trackPause(duration: number): void {
    if (!this.currentSession) return;
    
    this.pauseTimes.push(duration);
    this.currentSession.pauseCount++;
    this.currentSession.averagePauseLength = 
      this.pauseTimes.reduce((a, b) => a + b, 0) / this.pauseTimes.length;
    
    // Real-time feedback for excessive pauses
    if (duration > 5000) { // 5 seconds
      this.realTimeFeedbackQueue.push({
        type: 'pace',
        severity: 'medium',
        message: 'Long pause detected',
        suggestion: 'Take a moment to organize your thoughts, then continue confidently',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Track question answered
   */
  trackQuestionAnswered(question: string, answer: string): void {
    if (!this.currentSession) return;
    
    this.currentSession.questionsAnswered++;
    
    // Analyze if answer is on-topic
    const relevanceScore = this.calculateTopicRelevance(question, answer);
    if (relevanceScore < 0.7) {
      this.currentSession.offtopicResponses++;
    }
    
    // Update topic coverage
    this.currentSession.topicCoverage = Math.min(100, 
      (this.currentSession.questionsAnswered / 10) * 100
    );
  }

  /**
   * End session and generate comprehensive report
   */
  async endSession(): Promise<PerformanceReport> {
    if (!this.currentSession) {
      throw new Error('No active session to end');
    }
    
    this.currentSession.duration = Date.now() - this.currentSession.timestamp;
    
    // Calculate final metrics
    this.currentSession.fillerWordRate = 
      (this.currentSession.fillerWordCount / this.wordCount) * 100;
    
    this.currentSession.confidenceScore = this.calculateConfidenceScore();
    
    // Store session data
    await this.storeSessionData(this.currentSession);
    
    // Generate report
    const report = await this.generatePerformanceReport(this.currentSession);
    
    // Reset session
    this.currentSession = null;
    this.wordCount = 0;
    this.pauseTimes = [];
    
    return report;
  }

  /**
   * Get real-time feedback
   */
  getRealTimeFeedback(): RealTimeFeedback[] {
    const feedback = [...this.realTimeFeedbackQueue];
    this.realTimeFeedbackQueue = []; // Clear queue after retrieval
    return feedback;
  }

  /**
   * Get current session metrics
   */
  getCurrentMetrics(): Partial<PerformanceMetrics> | null {
    if (!this.currentSession) return null;
    
    return {
      duration: Date.now() - this.currentSession.timestamp,
      wordsPerMinute: this.calculateWPM(),
      fillerWordCount: this.currentSession.fillerWordCount,
      pauseCount: this.currentSession.pauseCount,
      confidenceScore: this.calculateConfidenceScore(),
      questionsAnswered: this.currentSession.questionsAnswered
    };
  }

  // Private helper methods

  private countFillerWords(words: string[]): number {
    return words.filter(word => 
      this.FILLER_WORDS.some(filler => 
        word.includes(filler) || filler.includes(word)
      )
    ).length;
  }

  private countUncertaintyMarkers(words: string[]): number {
    const text = words.join(' ');
    return this.UNCERTAINTY_MARKERS.filter(marker => 
      text.includes(marker)
    ).length;
  }

  private calculateWPM(): number {
    const elapsedMinutes = (Date.now() - this.speechStartTime) / 60000;
    return elapsedMinutes > 0 ? Math.round(this.wordCount / elapsedMinutes) : 0;
  }

  private analyzeClarityStructure(transcript: string): number {
    // Simple heuristic based on sentence structure and transition words
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const transitionWords = ['first', 'second', 'then', 'next', 'finally', 'because', 'therefore', 'however'];
    const hasTransitions = transitionWords.some(word => transcript.toLowerCase().includes(word));
    
    let score = 0.5;
    if (sentences.length > 2) score += 0.2;
    if (hasTransitions) score += 0.3;
    
    return Math.min(1, score);
  }

  private calculateTopicRelevance(question: string, answer: string): number {
    // Simple keyword overlap analysis
    const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const answerWords = answer.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    const overlap = questionWords.filter(word => 
      answerWords.some(answerWord => answerWord.includes(word) || word.includes(answerWord))
    ).length;
    
    return questionWords.length > 0 ? overlap / questionWords.length : 0;
  }

  private calculateConfidenceScore(): number {
    if (!this.currentSession) return 100;
    
    let score = 100;
    
    // Deduct for uncertainty markers
    score -= this.currentSession.uncertaintyMarkers * 3;
    
    // Deduct for excessive filler words
    score -= Math.max(0, this.currentSession.fillerWordCount - 5) * 2;
    
    // Deduct for long pauses
    score -= Math.max(0, this.currentSession.pauseCount - 3) * 1;
    
    return Math.max(0, score);
  }

  private async storeSessionData(session: PerformanceMetrics): Promise<void> {
    const key = `performance_${session.sessionId}`;
    await this.storage.set(key, session);
    
    // Also update historical data
    const history = await this.storage.get('performance_history') || [];
    history.push({
      sessionId: session.sessionId,
      date: new Date(session.timestamp).toISOString(),
      overallScore: this.calculateOverallScore(session),
      duration: session.duration
    });
    
    // Keep only last 50 sessions
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    await this.storage.set('performance_history', history);
  }

  private calculateOverallScore(session: PerformanceMetrics): number {
    const weights = {
      confidence: 0.3,
      pace: 0.2,
      clarity: 0.2,
      fillerWords: 0.15,
      topicCoverage: 0.15
    };
    
    const paceScore = this.scorePace(session.wordsPerMinute);
    const fillerScore = Math.max(0, 100 - session.fillerWordRate * 10);
    const clarityScore = Math.max(0, 100 - session.offtopicResponses * 10);
    
    return Math.round(
      session.confidenceScore * weights.confidence +
      paceScore * weights.pace +
      clarityScore * weights.clarity +
      fillerScore * weights.fillerWords +
      session.topicCoverage * weights.topicCoverage
    );
  }

  private scorePace(wpm: number): number {
    if (wpm >= 120 && wpm <= 150) return 100;
    if (wpm >= 100 && wpm <= 180) return 80;
    if (wpm >= 80 && wpm <= 200) return 60;
    return 40;
  }

  private async generatePerformanceReport(session: PerformanceMetrics): Promise<PerformanceReport> {
    const overallScore = this.calculateOverallScore(session);
    const history = await this.storage.get('performance_history') || [];
    
    const strengthAreas = [];
    const improvementAreas = [];
    const recommendations = [];
    
    // Analyze strengths and weaknesses
    if (session.confidenceScore > 80) {
      strengthAreas.push('Confident communication');
    } else {
      improvementAreas.push('Confidence and decisiveness');
      recommendations.push('Practice stating opinions more decisively');
    }
    
    if (session.wordsPerMinute >= 120 && session.wordsPerMinute <= 150) {
      strengthAreas.push('Optimal speaking pace');
    } else {
      improvementAreas.push('Speaking pace');
      recommendations.push(session.wordsPerMinute > 150 ? 'Slow down your speech' : 'Increase speaking pace');
    }
    
    if (session.fillerWordRate < 5) {
      strengthAreas.push('Clear articulation');
    } else {
      improvementAreas.push('Filler word usage');
      recommendations.push('Practice pausing instead of using filler words');
    }
    
    // Calculate comparisons
    const recentSessions = history.slice(-5);
    const avgPreviousSessions = recentSessions.length > 0 ? 
      recentSessions.reduce((sum, h) => sum + h.overallScore, 0) / recentSessions.length : 0;
    
    return {
      overallScore,
      strengthAreas,
      improvementAreas,
      recommendations,
      comparison: {
        previousSessions: avgPreviousSessions,
        industryAverage: 75, // Mock data
        topPerformerBenchmark: 90 // Mock data
      }
    };
  }
} 
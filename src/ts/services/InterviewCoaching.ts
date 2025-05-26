/**
 * Interview Coaching - Advanced Interview Preparation and Real-time Guidance
 * Provides templates, frameworks, coaching tips, and adaptive guidance
 */

import { SecureStorage } from '../utils/storage';

interface InterviewTemplate {
  id: string;
  name: string;
  type: 'behavioral' | 'technical' | 'leadership' | 'case-study' | 'system-design';
  category: string;
  framework: string;
  structure: string[];
  sampleQuestions: string[];
  tips: string[];
  timeAllocation: {
    preparation: number;
    response: number;
    followup: number;
  };
}

interface CoachingTip {
  id: string;
  category: 'preparation' | 'during' | 'followup';
  trigger: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timing: number; // When to show (in milliseconds from start)
}

interface InterviewFramework {
  name: string;
  description: string;
  steps: string[];
  examples: string[];
  useCase: string;
}

interface AdaptiveGuidance {
  assessmentLevel: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
  personalizedTips: string[];
  practiceRecommendations: string[];
}

export class InterviewCoaching {
  private storage: SecureStorage;
  
  private readonly FRAMEWORKS: InterviewFramework[] = [
    {
      name: 'STAR Method',
      description: 'Situation, Task, Action, Result - Perfect for behavioral questions',
      steps: [
        'Situation: Set the context and background',
        'Task: Describe your responsibility or goal',
        'Action: Explain specific steps you took',
        'Result: Share the outcome and lessons learned'
      ],
      examples: [
        'Tell me about a time you overcame a challenge',
        'Describe a situation where you had to work with a difficult team member',
        'Give an example of when you went above and beyond'
      ],
      useCase: 'Behavioral questions about past experiences'
    },
    {
      name: 'SOAR Framework',
      description: 'Situation, Obstacles, Actions, Results - Enhanced version of STAR',
      steps: [
        'Situation: Describe the context clearly',
        'Obstacles: Identify specific challenges faced',
        'Actions: Detail your strategic approach',
        'Results: Quantify outcomes and impact'
      ],
      examples: [
        'Describe a project that faced significant obstacles',
        'Tell me about a time you had to innovate under pressure'
      ],
      useCase: 'Complex problem-solving scenarios'
    },
    {
      name: 'PREP Method',
      description: 'Point, Reason, Example, Point - Great for structured responses',
      steps: [
        'Point: State your main argument clearly',
        'Reason: Provide supporting rationale',
        'Example: Give concrete evidence',
        'Point: Restate and reinforce your position'
      ],
      examples: [
        'Why do you want to work here?',
        'What makes you the best candidate?',
        'How do you handle conflict?'
      ],
      useCase: 'Opinion-based and motivational questions'
    }
  ];

  private readonly TEMPLATES: InterviewTemplate[] = [
    {
      id: 'behavioral-leadership',
      name: 'Leadership & Management',
      type: 'behavioral',
      category: 'Leadership',
      framework: 'STAR',
      structure: [
        'Set the leadership context (team size, scope, timeline)',
        'Identify the leadership challenge or opportunity',
        'Describe your leadership approach and actions',
        'Quantify the team and business results',
        'Reflect on leadership lessons learned'
      ],
      sampleQuestions: [
        'Tell me about a time you had to lead through change',
        'Describe how you motivated an underperforming team member',
        'Give an example of a difficult decision you had to make as a leader',
        'How do you handle conflict within your team?'
      ],
      tips: [
        'Focus on your specific leadership actions, not team achievements',
        'Quantify results with metrics (team performance, retention, delivery)',
        'Show emotional intelligence and adaptability',
        'Demonstrate different leadership styles for different situations'
      ],
      timeAllocation: { preparation: 30, response: 120, followup: 15 }
    },
    {
      id: 'technical-problem-solving',
      name: 'Technical Problem Solving',
      type: 'technical',
      category: 'Engineering',
      framework: 'Problem-Solution-Impact',
      structure: [
        'Clarify the technical problem and constraints',
        'Outline your analytical approach',
        'Walk through your solution methodology',
        'Discuss implementation and testing',
        'Measure and communicate impact'
      ],
      sampleQuestions: [
        'Design a system to handle 1 million concurrent users',
        'How would you optimize a slow-performing database query?',
        'Explain how you would debug a production issue',
        'Walk me through your approach to code review'
      ],
      tips: [
        'Ask clarifying questions before diving into solutions',
        'Think out loud to show your problem-solving process',
        'Consider trade-offs and alternative approaches',
        'Discuss scalability, security, and maintainability'
      ],
      timeAllocation: { preparation: 60, response: 180, followup: 30 }
    },
    {
      id: 'behavioral-collaboration',
      name: 'Teamwork & Collaboration',
      type: 'behavioral',
      category: 'Collaboration',
      framework: 'SOAR',
      structure: [
        'Describe the collaborative context and stakeholders',
        'Identify communication or alignment challenges',
        'Explain your collaboration strategies and actions',
        'Share the collective results and relationship outcomes'
      ],
      sampleQuestions: [
        'Tell me about a time you worked with a cross-functional team',
        'Describe a situation where you had to influence without authority',
        'How do you handle disagreements with colleagues?',
        'Give an example of when you had to adapt your communication style'
      ],
      tips: [
        'Emphasize active listening and empathy',
        'Show how you bridge different perspectives',
        'Highlight relationship building alongside task completion',
        'Demonstrate cultural awareness and inclusivity'
      ],
      timeAllocation: { preparation: 20, response: 90, followup: 10 }
    }
  ];

  private readonly COACHING_TIPS: CoachingTip[] = [
    {
      id: 'opening-confidence',
      category: 'during',
      trigger: 'session_start',
      message: 'Take a deep breath and remember: they invited you here because they\'re interested. Show confidence!',
      priority: 'high',
      timing: 5000
    },
    {
      id: 'pace-reminder',
      category: 'during',
      trigger: 'fast_speech',
      message: 'You\'re speaking quickly. Take a moment to slow down and let your expertise shine through.',
      priority: 'medium',
      timing: 0
    },
    {
      id: 'structure-guidance',
      category: 'during',
      trigger: 'long_response',
      message: 'Remember to use a framework like STAR to structure your response clearly.',
      priority: 'medium',
      timing: 0
    },
    {
      id: 'quantify-results',
      category: 'during',
      trigger: 'missing_metrics',
      message: 'Great story! Try to add specific numbers or metrics to show your impact.',
      priority: 'low',
      timing: 0
    },
    {
      id: 'follow-up-questions',
      category: 'during',
      trigger: 'technical_discussion',
      message: 'This is a great opportunity to ask thoughtful follow-up questions.',
      priority: 'medium',
      timing: 0
    }
  ];

  constructor() {
    this.storage = new SecureStorage();
  }

  /**
   * Get all available interview templates
   */
  getTemplates(type?: InterviewTemplate['type']): InterviewTemplate[] {
    if (type) {
      return this.TEMPLATES.filter(template => template.type === type);
    }
    return [...this.TEMPLATES];
  }

  /**
   * Get specific template by ID
   */
  getTemplate(id: string): InterviewTemplate | undefined {
    return this.TEMPLATES.find(template => template.id === id);
  }

  /**
   * Get frameworks for structuring responses
   */
  getFrameworks(): InterviewFramework[] {
    return [...this.FRAMEWORKS];
  }

  /**
   * Get framework by name
   */
  getFramework(name: string): InterviewFramework | undefined {
    return this.FRAMEWORKS.find(framework => framework.name === name);
  }

  /**
   * Generate personalized coaching based on user level and focus areas
   */
  async generatePersonalizedCoaching(
    experience: 'entry' | 'mid' | 'senior' | 'executive',
    role: string,
    focusAreas: string[]
  ): Promise<AdaptiveGuidance> {
    const assessmentLevel = this.mapExperienceToLevel(experience);
    
    const personalizedTips = this.generatePersonalizedTips(assessmentLevel, role, focusAreas);
    const practiceRecommendations = this.generatePracticeRecommendations(assessmentLevel, focusAreas);
    
    return {
      assessmentLevel,
      focusAreas,
      personalizedTips,
      practiceRecommendations
    };
  }

  /**
   * Get real-time coaching tips during interview
   */
  getRealTimeCoaching(context: {
    sessionDuration: number;
    currentTopic: string;
    recentFeedback: string[];
    performanceMetrics: any;
  }): CoachingTip[] {
    const applicableTips: CoachingTip[] = [];
    
    // Check for triggered coaching opportunities
    this.COACHING_TIPS.forEach(tip => {
      if (this.shouldShowTip(tip, context)) {
        applicableTips.push(tip);
      }
    });
    
    // Generate dynamic tips based on performance
    if (context.performanceMetrics) {
      const dynamicTips = this.generateDynamicTips(context.performanceMetrics);
      applicableTips.push(...dynamicTips);
    }
    
    return applicableTips.sort((a, b) => 
      this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority)
    );
  }

  /**
   * Create custom practice session
   */
  async createPracticeSession(
    templateId: string,
    customQuestions: string[] = []
  ): Promise<{
    template: InterviewTemplate;
    questions: string[];
    timeAllocation: number;
    guidance: string[];
  }> {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    
    const questions = [
      ...template.sampleQuestions,
      ...customQuestions
    ].slice(0, 5); // Limit to 5 questions per session
    
    const totalTime = template.timeAllocation.preparation + 
                     template.timeAllocation.response + 
                     template.timeAllocation.followup;
    
    const guidance = [
      `Use the ${template.framework} framework for structured responses`,
      ...template.tips,
      'Practice out loud to improve fluency',
      'Record yourself to identify improvement areas'
    ];
    
    return {
      template,
      questions,
      timeAllocation: totalTime * questions.length,
      guidance
    };
  }

  /**
   * Analyze response and provide coaching feedback
   */
  analyzeResponse(
    question: string,
    response: string,
    templateId: string
  ): {
    score: number;
    strengths: string[];
    improvements: string[];
    frameworkUsage: number;
    specificFeedback: string[];
  } {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    
    const analysis = {
      score: 0,
      strengths: [] as string[],
      improvements: [] as string[],
      frameworkUsage: 0,
      specificFeedback: [] as string[]
    };
    
    // Analyze framework usage
    analysis.frameworkUsage = this.analyzeFrameworkUsage(response, template.framework);
    
    // Analyze content quality
    const contentScore = this.analyzeContentQuality(response, template.type);
    
    // Analyze structure and clarity
    const structureScore = this.analyzeStructure(response);
    
    // Calculate overall score
    analysis.score = Math.round(
      (analysis.frameworkUsage * 0.3) + 
      (contentScore * 0.4) + 
      (structureScore * 0.3)
    );
    
    // Generate specific feedback
    if (analysis.frameworkUsage > 80) {
      analysis.strengths.push('Excellent use of structured framework');
    } else if (analysis.frameworkUsage < 50) {
      analysis.improvements.push('Try to follow the framework more closely');
      analysis.specificFeedback.push(`Consider using the ${template.framework} method: ${this.getFramework(template.framework)?.steps.join(', ')}`);
    }
    
    if (contentScore > 80) {
      analysis.strengths.push('Rich, relevant content with good examples');
    } else {
      analysis.improvements.push('Add more specific examples and quantifiable results');
    }
    
    if (structureScore > 80) {
      analysis.strengths.push('Clear, well-organized response');
    } else {
      analysis.improvements.push('Improve response structure and flow');
    }
    
    return analysis;
  }

  // Private helper methods

  private mapExperienceToLevel(experience: string): AdaptiveGuidance['assessmentLevel'] {
    switch (experience) {
      case 'entry': return 'beginner';
      case 'mid': return 'intermediate';
      case 'senior':
      case 'executive': return 'advanced';
      default: return 'intermediate';
    }
  }

  private generatePersonalizedTips(
    level: AdaptiveGuidance['assessmentLevel'],
    role: string,
    focusAreas: string[]
  ): string[] {
    const tips: string[] = [];
    
    // Level-specific tips
    switch (level) {
      case 'beginner':
        tips.push(
          'Focus on clear communication over perfect answers',
          'Use the STAR method for behavioral questions',
          'Prepare 2-3 strong examples that demonstrate growth'
        );
        break;
      case 'intermediate':
        tips.push(
          'Emphasize leadership potential and project ownership',
          'Show how you mentor others and drive results',
          'Discuss your approach to handling complex challenges'
        );
        break;
      case 'advanced':
        tips.push(
          'Focus on strategic thinking and organizational impact',
          'Demonstrate thought leadership and vision',
          'Show how you influence and drive culture change'
        );
        break;
    }
    
    // Role-specific tips
    if (role.toLowerCase().includes('engineer')) {
      tips.push(
        'Explain your technical decisions and trade-offs',
        'Show curiosity about the company\'s technical challenges',
        'Demonstrate continuous learning and adaptation'
      );
    } else if (role.toLowerCase().includes('manager')) {
      tips.push(
        'Emphasize people management and team development',
        'Show how you balance stakeholder needs',
        'Demonstrate data-driven decision making'
      );
    }
    
    return tips;
  }

  private generatePracticeRecommendations(
    level: AdaptiveGuidance['assessmentLevel'],
    focusAreas: string[]
  ): string[] {
    const recommendations: string[] = [
      'Practice with the STAR framework daily',
      'Record yourself answering questions',
      'Time your responses (aim for 2-3 minutes for behavioral questions)'
    ];
    
    if (focusAreas.includes('technical')) {
      recommendations.push(
        'Practice whiteboard coding and system design',
        'Explain your code and thinking process out loud',
        'Review fundamental computer science concepts'
      );
    }
    
    if (focusAreas.includes('leadership')) {
      recommendations.push(
        'Prepare examples showing team impact and growth',
        'Practice discussing difficult conversations and decisions',
        'Review metrics and outcomes from your leadership experience'
      );
    }
    
    return recommendations;
  }

  private shouldShowTip(tip: CoachingTip, context: any): boolean {
    // Implementation would check various triggers
    // This is a simplified version
    switch (tip.trigger) {
      case 'session_start':
        return context.sessionDuration < 30000; // First 30 seconds
      case 'fast_speech':
        return context.performanceMetrics?.wordsPerMinute > 180;
      case 'long_response':
        return context.sessionDuration > 180000; // Over 3 minutes
      default:
        return false;
    }
  }

  private generateDynamicTips(performanceMetrics: any): CoachingTip[] {
    const tips: CoachingTip[] = [];
    
    if (performanceMetrics.fillerWordCount > 5) {
      tips.push({
        id: 'dynamic-filler',
        category: 'during',
        trigger: 'filler_words',
        message: 'Try pausing instead of using filler words. Silence is powerful.',
        priority: 'medium',
        timing: 0
      });
    }
    
    if (performanceMetrics.confidenceScore < 60) {
      tips.push({
        id: 'dynamic-confidence',
        category: 'during',
        trigger: 'low_confidence',
        message: 'Remember your achievements and speak with conviction about your experience.',
        priority: 'high',
        timing: 0
      });
    }
    
    return tips;
  }

  private getPriorityWeight(priority: CoachingTip['priority']): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  }

  private analyzeFrameworkUsage(response: string, framework: string): number {
    // Simplified framework analysis
    const lowerResponse = response.toLowerCase();
    
    switch (framework) {
      case 'STAR':
        const starKeywords = ['situation', 'task', 'action', 'result', 'outcome'];
        const starMatches = starKeywords.filter(keyword => 
          lowerResponse.includes(keyword) || 
          lowerResponse.includes(keyword.slice(0, 4))
        ).length;
        return Math.min(100, (starMatches / starKeywords.length) * 100);
      
      default:
        return 70; // Default score
    }
  }

  private analyzeContentQuality(response: string, type: InterviewTemplate['type']): number {
    const words = response.split(/\s+/).length;
    const sentences = response.split(/[.!?]+/).length;
    
    let score = 50; // Base score
    
    // Length appropriateness
    if (words >= 150 && words <= 400) score += 20;
    if (sentences >= 5 && sentences <= 15) score += 10;
    
    // Content relevance (simplified)
    if (type === 'behavioral') {
      const behavioralKeywords = ['team', 'project', 'challenge', 'result', 'learned'];
      const matches = behavioralKeywords.filter(keyword => 
        response.toLowerCase().includes(keyword)
      ).length;
      score += Math.min(20, matches * 4);
    }
    
    return Math.min(100, score);
  }

  private analyzeStructure(response: string): number {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const transitionWords = ['first', 'then', 'next', 'finally', 'because', 'therefore', 'however', 'additionally'];
    
    let score = 50;
    
    // Sentence variety
    if (sentences.length >= 3) score += 15;
    
    // Transition usage
    const hasTransitions = transitionWords.some(word => 
      response.toLowerCase().includes(word)
    );
    if (hasTransitions) score += 20;
    
    // Paragraph structure (simplified)
    const paragraphs = response.split('\n').filter(p => p.trim().length > 0);
    if (paragraphs.length > 1) score += 15;
    
    return Math.min(100, score);
  }
} 
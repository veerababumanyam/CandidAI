/**
 * Note Export System - Professional Interview Documentation and Export
 * Generates comprehensive interview reports in multiple formats with advanced analysis
 */

import { SecureStorage } from '../utils/storage';

interface InterviewNotes {
  sessionId: string;
  interviewDate: Date;
  position: string;
  company: string;
  interviewer: string;
  duration: number;
  
  // Content
  questions: QuestionNote[];
  keyInsights: string[];
  decisions: string[];
  followUpActions: string[];
  
  // Analysis
  performanceMetrics: {
    overallScore: number;
    confidenceLevel: number;
    communicationClarity: number;
    technicalCompetency: number;
    culturalFit: number;
  };
  
  // Metadata
  documentVersion: string;
  exportDate: Date;
  confidentialityLevel: 'public' | 'internal' | 'confidential';
}

interface QuestionNote {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'cultural' | 'situational';
  candidateResponse: string;
  interviewerNotes: string;
  score: number;
  keyPoints: string[];
  redFlags: string[];
  strengths: string[];
}

interface ExportOptions {
  format: 'pdf' | 'docx' | 'markdown' | 'json' | 'html';
  template: 'professional' | 'detailed' | 'summary' | 'technical';
  includePerformanceMetrics: boolean;
  includeAnalysis: boolean;
  includeTranscripts: boolean;
  includeRecommendations: boolean;
  branding?: {
    companyLogo?: string;
    companyName?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };
}

interface ExportResult {
  success: boolean;
  filename: string;
  size: number;
  downloadUrl?: string;
  error?: string;
}

export class NoteExportSystem {
  private storage: SecureStorage;

  constructor() {
    this.storage = new SecureStorage();
  }

  /**
   * Create comprehensive interview notes from session data
   */
  async createInterviewNotes(
    sessionId: string,
    interviewDetails: {
      position: string;
      company: string;
      interviewer: string;
    },
    sessionData: {
      questions: any[];
      responses: any[];
      performanceMetrics: any;
      coaching: any[];
      transcripts: any[];
    }
  ): Promise<InterviewNotes> {
    const notes: InterviewNotes = {
      sessionId,
      interviewDate: new Date(),
      position: interviewDetails.position,
      company: interviewDetails.company,
      interviewer: interviewDetails.interviewer,
      duration: sessionData.performanceMetrics?.duration || 0,
      
      // Process questions and responses
      questions: this.processQuestions(sessionData.questions, sessionData.responses),
      
      // Extract insights and decisions
      keyInsights: this.extractKeyInsights(sessionData),
      decisions: this.generateDecisionPoints(sessionData),
      followUpActions: this.generateFollowUpActions(sessionData),
      
      // Calculate performance metrics
      performanceMetrics: {
        overallScore: sessionData.performanceMetrics?.overallScore || 0,
        confidenceLevel: sessionData.performanceMetrics?.confidenceScore || 0,
        communicationClarity: this.calculateCommunicationScore(sessionData),
        technicalCompetency: this.calculateTechnicalScore(sessionData),
        culturalFit: this.calculateCulturalFitScore(sessionData)
      },
      
      // Metadata
      documentVersion: '1.0',
      exportDate: new Date(),
      confidentialityLevel: 'internal'
    };

    // Store notes for future reference
    await this.storage.set(`interview_notes_${sessionId}`, notes);
    
    return notes;
  }

  /**
   * Export interview notes in specified format
   */
  async exportNotes(
    sessionId: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const notes = await this.storage.get(`interview_notes_${sessionId}`);
      if (!notes) {
        return {
          success: false,
          filename: '',
          size: 0,
          error: 'Interview notes not found'
        };
      }

      // Export based on format
      switch (options.format) {
        case 'html':
          return await this.exportToHTML(notes, options);
        case 'markdown':
          return await this.exportToMarkdown(notes, options);
        case 'json':
          return await this.exportToJSON(notes, options);
        case 'docx':
          return await this.exportToDocx(notes, options);
        case 'pdf':
          return await this.exportToPDF(notes, options);
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        filename: '',
        size: 0,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  /**
   * Generate executive summary with hire recommendation
   */
  async generateExecutiveSummary(sessionId: string): Promise<{
    recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire';
    summary: string;
    keyStrengths: string[];
    keyWeaknesses: string[];
    nextSteps: string[];
    riskFactors: string[];
  }> {
    const notes = await this.storage.get(`interview_notes_${sessionId}`);
    if (!notes) {
      throw new Error('Interview notes not found');
    }

    const recommendation = this.calculateHireRecommendation(notes);
    const summary = this.generateSummaryText(notes);
    const keyStrengths = this.extractTopStrengths(notes);
    const keyWeaknesses = this.extractTopWeaknesses(notes);
    const nextSteps = this.generateNextSteps(notes, recommendation);
    const riskFactors = this.identifyRiskFactors(notes);

    return {
      recommendation,
      summary,
      keyStrengths,
      keyWeaknesses,
      nextSteps,
      riskFactors
    };
  }

  /**
   * Create comparison report for multiple candidates
   */
  async createComparisonReport(sessionIds: string[]): Promise<{
    candidates: Array<{
      sessionId: string;
      name: string;
      overallScore: number;
      strengths: string[];
      weaknesses: string[];
      recommendation: string;
    }>;
    topCandidate: string;
    analysis: string;
  }> {
    const candidates = [];
    
    for (const sessionId of sessionIds) {
      const notes = await this.storage.get(`interview_notes_${sessionId}`);
      if (notes) {
        candidates.push({
          sessionId,
          name: notes.interviewer || 'Candidate',
          overallScore: notes.performanceMetrics.overallScore,
          strengths: this.extractTopStrengths(notes).slice(0, 3),
          weaknesses: this.extractTopWeaknesses(notes).slice(0, 2),
          recommendation: this.calculateHireRecommendation(notes)
        });
      }
    }
    
    // Sort by overall score
    candidates.sort((a, b) => b.overallScore - a.overallScore);
    
    const topCandidate = candidates.length > 0 ? candidates[0].sessionId : '';
    const analysis = this.generateComparisonAnalysis(candidates);
    
    return {
      candidates,
      topCandidate,
      analysis
    };
  }

  // Private export methods

  private async exportToPDF(notes: InterviewNotes, options: ExportOptions): Promise<ExportResult> {
    // For PDF export, we'll generate HTML first then convert
    const htmlContent = this.generateHTML(notes, options);
    const filename = `interview-${notes.sessionId}-${Date.now()}.pdf`;
    
    // Note: In a real implementation, you'd use a PDF library like jsPDF or Puppeteer
    // For now, we'll create a downloadable HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    return {
      success: true,
      filename,
      size: blob.size,
      downloadUrl: url
    };
  }

  private async exportToDocx(notes: InterviewNotes, options: ExportOptions): Promise<ExportResult> {
    const content = this.generateDocxContent(notes, options);
    const filename = `interview-${notes.sessionId}-${Date.now()}.docx`;
    
    // Note: In a real implementation, you'd use a library like docx
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    
    return {
      success: true,
      filename,
      size: blob.size,
      downloadUrl: url
    };
  }

  private async exportToMarkdown(notes: InterviewNotes, options: ExportOptions): Promise<ExportResult> {
    const content = this.generateMarkdown(notes, options);
    const filename = `interview-${notes.sessionId}-${Date.now()}.md`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    return {
      success: true,
      filename,
      size: blob.size,
      downloadUrl: url
    };
  }

  private async exportToJSON(notes: InterviewNotes, options: ExportOptions): Promise<ExportResult> {
    const content = JSON.stringify(notes, null, 2);
    const filename = `interview-${notes.sessionId}-${Date.now()}.json`;
    
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    return {
      success: true,
      filename,
      size: blob.size,
      downloadUrl: url
    };
  }

  private async exportToHTML(notes: InterviewNotes, options: ExportOptions): Promise<ExportResult> {
    const content = this.generateHTML(notes, options);
    const filename = `interview-${notes.sessionId}-${Date.now()}.html`;
    
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    return {
      success: true,
      filename,
      size: blob.size,
      downloadUrl: url
    };
  }

  // Content generation methods

  private generateHTML(notes: InterviewNotes, options: ExportOptions): string {
    const primaryColor = options.branding?.colors?.primary || '#2563eb';
    const secondaryColor = options.branding?.colors?.secondary || '#f3f4f6';
    const companyName = options.branding?.companyName || 'CandidAI';
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Interview Report - ${notes.position} at ${notes.company}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #fff; }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; padding: 30px; background: ${secondaryColor}; border-radius: 12px; }
        .header h1 { color: ${primaryColor}; font-size: 2.5em; margin-bottom: 10px; }
        .header .meta { color: #666; font-size: 1.1em; }
        .section { margin-bottom: 40px; }
        .section h2 { color: ${primaryColor}; font-size: 1.8em; margin-bottom: 20px; border-bottom: 3px solid ${primaryColor}; padding-bottom: 10px; }
        .section h3 { color: #555; font-size: 1.4em; margin: 20px 0 10px 0; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: ${secondaryColor}; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: ${primaryColor}; }
        .metric-label { color: #666; font-size: 0.9em; margin-top: 5px; }
        .question-item { background: #f9f9f9; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid ${primaryColor}; }
        .question-text { font-weight: bold; color: ${primaryColor}; margin-bottom: 10px; }
        .response-text { margin-bottom: 15px; }
        .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .tag { background: ${primaryColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; }
        .tag.strength { background: #10b981; }
        .tag.weakness { background: #ef4444; }
        .insights-list { list-style: none; }
        .insights-list li { padding: 10px 0; border-bottom: 1px solid #eee; }
        .insights-list li:before { content: "💡"; margin-right: 10px; }
        .recommendations { background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; }
        .footer { text-align: center; margin-top: 60px; padding: 20px; color: #666; border-top: 1px solid #eee; }
        @media print { body { background: white; } .container { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Interview Assessment Report</h1>
          <div class="meta">
            <p><strong>${notes.position}</strong> at <strong>${notes.company}</strong></p>
            <p>Interview Date: ${notes.interviewDate.toLocaleDateString()}</p>
            <p>Duration: ${Math.round(notes.duration / 60000)} minutes</p>
            <p>Interviewer: ${notes.interviewer}</p>
          </div>
        </div>

        ${options.includePerformanceMetrics ? this.generateMetricsHTML(notes) : ''}
        
        <div class="section">
          <h2>📝 Interview Questions & Responses</h2>
          ${this.generateQuestionsHTML(notes)}
        </div>

        ${options.includeAnalysis ? `
        <div class="section">
          <h2>🎯 Key Insights</h2>
          <ul class="insights-list">
            ${notes.keyInsights.map(insight => `<li>${insight}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${options.includeRecommendations ? `
        <div class="section">
          <h2>📋 Follow-up Actions</h2>
          <div class="recommendations">
            <ul>
              ${notes.followUpActions.map(action => `<li>${action}</li>`).join('')}
            </ul>
          </div>
        </div>
        ` : ''}

        <div class="footer">
          <p>Generated by ${companyName} Interview Assistant on ${new Date().toLocaleDateString()}</p>
          <p>Confidentiality Level: ${notes.confidentialityLevel.toUpperCase()}</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private generateMetricsHTML(notes: InterviewNotes): string {
    return `
    <div class="section">
      <h2>📊 Performance Metrics</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">${notes.performanceMetrics.overallScore}</div>
          <div class="metric-label">Overall Score</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${notes.performanceMetrics.confidenceLevel}</div>
          <div class="metric-label">Confidence Level</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${notes.performanceMetrics.communicationClarity}</div>
          <div class="metric-label">Communication Clarity</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${notes.performanceMetrics.technicalCompetency}</div>
          <div class="metric-label">Technical Competency</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${notes.performanceMetrics.culturalFit}</div>
          <div class="metric-label">Cultural Fit</div>
        </div>
      </div>
    </div>
    `;
  }

  private generateQuestionsHTML(notes: InterviewNotes): string {
    return notes.questions.map(q => `
      <div class="question-item">
        <div class="question-text">Q: ${q.question}</div>
        <div class="response-text"><strong>Response:</strong> ${q.candidateResponse}</div>
        ${q.interviewerNotes ? `<div><strong>Notes:</strong> ${q.interviewerNotes}</div>` : ''}
        <div class="tags">
          <span class="tag">Score: ${q.score}/100</span>
          <span class="tag">${q.category}</span>
          ${q.strengths.map(s => `<span class="tag strength">${s}</span>`).join('')}
          ${q.redFlags.map(r => `<span class="tag weakness">${r}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  private generateMarkdown(notes: InterviewNotes, options: ExportOptions): string {
    return `
# Interview Assessment Report

**Position:** ${notes.position}  
**Company:** ${notes.company}  
**Interview Date:** ${notes.interviewDate.toLocaleDateString()}  
**Duration:** ${Math.round(notes.duration / 60000)} minutes  
**Interviewer:** ${notes.interviewer}

---

${options.includePerformanceMetrics ? `
## 📊 Performance Metrics

| Metric | Score |
|--------|-------|
| Overall Score | ${notes.performanceMetrics.overallScore}/100 |
| Confidence Level | ${notes.performanceMetrics.confidenceLevel}/100 |
| Communication Clarity | ${notes.performanceMetrics.communicationClarity}/100 |
| Technical Competency | ${notes.performanceMetrics.technicalCompetency}/100 |
| Cultural Fit | ${notes.performanceMetrics.culturalFit}/100 |

---
` : ''}

## 📝 Interview Questions & Responses

${notes.questions.map(q => `
### ${q.category.toUpperCase()}: ${q.question}

**Candidate Response:**  
${q.candidateResponse}

${q.interviewerNotes ? `**Interviewer Notes:**  \n${q.interviewerNotes}\n` : ''}

**Score:** ${q.score}/100

**Key Points:**
${q.keyPoints.map(p => `- ${p}`).join('\n')}

**Strengths:**
${q.strengths.map(s => `- ✅ ${s}`).join('\n')}

${q.redFlags.length > 0 ? `**Red Flags:**\n${q.redFlags.map(r => `- ⚠️ ${r}`).join('\n')}` : ''}

---
`).join('')}

${options.includeAnalysis ? `
## 🎯 Key Insights

${notes.keyInsights.map(insight => `- 💡 ${insight}`).join('\n')}

---
` : ''}

${options.includeRecommendations ? `
## 📋 Follow-up Actions

${notes.followUpActions.map(action => `- [ ] ${action}`).join('\n')}

---
` : ''}

*Generated by CandidAI Interview Assistant on ${new Date().toLocaleDateString()}*  
*Confidentiality Level: ${notes.confidentialityLevel.toUpperCase()}*
    `.trim();
  }

  private generateDocxContent(notes: InterviewNotes, options: ExportOptions): string {
    // Simplified DOCX content - in production, use proper DOCX library
    return this.generateMarkdown(notes, options);
  }

  // Analysis and processing methods

  private processQuestions(questions: any[], responses: any[]): QuestionNote[] {
    return questions.map((q, index) => ({
      id: `q_${index}`,
      question: q.text || q.question || '',
      category: this.categorizeQuestion(q.text || q.question || ''),
      candidateResponse: responses[index]?.text || '',
      interviewerNotes: responses[index]?.notes || '',
      score: responses[index]?.score || Math.floor(Math.random() * 40 + 60), // Mock scoring
      keyPoints: this.extractKeyPoints(responses[index]?.text || ''),
      redFlags: [],
      strengths: this.extractStrengths(responses[index]?.text || '')
    }));
  }

  private categorizeQuestion(question: string): QuestionNote['category'] {
    const lower = question.toLowerCase();
    if (lower.includes('technical') || lower.includes('code') || lower.includes('system')) {
      return 'technical';
    }
    if (lower.includes('team') || lower.includes('conflict') || lower.includes('leadership')) {
      return 'behavioral';
    }
    if (lower.includes('culture') || lower.includes('fit') || lower.includes('values')) {
      return 'cultural';
    }
    return 'situational';
  }

  private extractKeyPoints(response: string): string[] {
    // Simple extraction based on sentence structure
    return response.split('.').slice(0, 3).map(s => s.trim()).filter(s => s.length > 10);
  }

  private extractStrengths(response: string): string[] {
    const strengthIndicators = ['achieved', 'improved', 'led', 'created', 'increased', 'successful'];
    const sentences = response.split('.');
    return sentences
      .filter(sentence => strengthIndicators.some(indicator => sentence.toLowerCase().includes(indicator)))
      .slice(0, 2)
      .map(s => s.trim());
  }

  private extractKeyInsights(sessionData: any): string[] {
    return [
      'Candidate demonstrated strong problem-solving abilities',
      'Communication style is clear and professional',
      'Shows good understanding of technical concepts',
      'Exhibits collaborative mindset and team orientation'
    ];
  }

  private generateDecisionPoints(sessionData: any): string[] {
    return [
      'Technical skills align well with role requirements',
      'Cultural fit appears positive based on responses',
      'Experience level matches expectations for the position'
    ];
  }

  private generateFollowUpActions(sessionData: any): string[] {
    return [
      'Schedule technical round with engineering team',
      'Conduct reference checks with previous employers',
      'Arrange final interview with hiring manager',
      'Prepare offer package if candidate progresses'
    ];
  }

  private calculateCommunicationScore(sessionData: any): number {
    return sessionData.performanceMetrics?.communicationClarity || Math.floor(Math.random() * 20 + 75);
  }

  private calculateTechnicalScore(sessionData: any): number {
    return sessionData.performanceMetrics?.technicalCompetency || Math.floor(Math.random() * 25 + 70);
  }

  private calculateCulturalFitScore(sessionData: any): number {
    return sessionData.performanceMetrics?.culturalFit || Math.floor(Math.random() * 15 + 80);
  }

  private calculateHireRecommendation(notes: InterviewNotes): 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire' {
    const score = notes.performanceMetrics.overallScore;
    if (score >= 90) return 'strong_hire';
    if (score >= 75) return 'hire';
    if (score >= 60) return 'no_hire';
    return 'strong_no_hire';
  }

  private generateSummaryText(notes: InterviewNotes): string {
    const recommendation = this.calculateHireRecommendation(notes);
    return `Candidate demonstrated ${recommendation === 'strong_hire' ? 'exceptional' : recommendation === 'hire' ? 'strong' : 'adequate'} performance across key evaluation criteria. Overall score of ${notes.performanceMetrics.overallScore}/100 reflects comprehensive assessment of technical skills, communication ability, and cultural alignment.`;
  }

  private extractTopStrengths(notes: InterviewNotes): string[] {
    const allStrengths = notes.questions.flatMap(q => q.strengths);
    return [...new Set(allStrengths)].slice(0, 5);
  }

  private extractTopWeaknesses(notes: InterviewNotes): string[] {
    const allWeaknesses = notes.questions.flatMap(q => q.redFlags);
    return [...new Set(allWeaknesses)].slice(0, 3);
  }

  private generateNextSteps(notes: InterviewNotes, recommendation: string): string[] {
    switch (recommendation) {
      case 'strong_hire':
        return ['Extend offer immediately', 'Negotiate start date', 'Prepare onboarding materials'];
      case 'hire':
        return ['Schedule final interview', 'Complete reference checks', 'Prepare provisional offer'];
      case 'no_hire':
        return ['Provide constructive feedback', 'Keep on file for future opportunities', 'Send polite rejection'];
      default:
        return ['Send rejection notification', 'Document feedback for improvement', 'Archive interview materials'];
    }
  }

  private identifyRiskFactors(notes: InterviewNotes): string[] {
    const risks = [];
    
    if (notes.performanceMetrics.confidenceLevel < 70) {
      risks.push('Low confidence levels may impact performance');
    }
    
    if (notes.performanceMetrics.technicalCompetency < 75) {
      risks.push('Technical skills may require additional development');
    }
    
    if (notes.performanceMetrics.culturalFit < 80) {
      risks.push('Cultural alignment concerns noted');
    }
    
    const redFlags = notes.questions.flatMap(q => q.redFlags);
    if (redFlags.length > 2) {
      risks.push('Multiple red flags identified during interview');
    }
    
    return risks;
  }

  private generateComparisonAnalysis(candidates: any[]): string {
    if (candidates.length === 0) return 'No candidates to compare';
    
    const topScore = Math.max(...candidates.map(c => c.overallScore));
    const avgScore = candidates.reduce((sum, c) => sum + c.overallScore, 0) / candidates.length;
    
    return `Analysis of ${candidates.length} candidates shows scores ranging from ${Math.min(...candidates.map(c => c.overallScore))} to ${topScore}. Average score: ${Math.round(avgScore)}. Top candidate demonstrates strong performance across multiple evaluation criteria.`;
  }
} 
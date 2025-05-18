/**
 * CandidAI - Performance Hub Controller
 * Manages the performance hub UI and interactions
 */

import historyManager from '../js/services/historyManager.js';

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements - Navigation
  const backToOptionsButton = document.getElementById('backToOptions');
  const backToHistoryButton = document.getElementById('backToHistoryButton');
  
  // DOM Elements - Consent
  const historyConsentToggle = document.getElementById('historyConsentToggle');
  
  // DOM Elements - History
  const clearHistoryButton = document.getElementById('clearHistoryButton');
  const interviewHistoryList = document.getElementById('interviewHistoryList');
  const emptyHistoryState = document.getElementById('emptyHistoryState');
  
  // DOM Elements - Stats
  const totalInterviewsValue = document.getElementById('totalInterviewsValue');
  const totalQuestionsValue = document.getElementById('totalQuestionsValue');
  const averageScoreValue = document.getElementById('averageScoreValue');
  
  // DOM Elements - Report
  const reportSection = document.getElementById('reportSection');
  const historySection = document.getElementById('historySection');
  const exportReportButton = document.getElementById('exportReportButton');
  
  // DOM Elements - Report Content
  const reportTitle = document.getElementById('reportTitle');
  const reportDate = document.getElementById('reportDate');
  const reportPosition = document.getElementById('reportPosition');
  const reportDuration = document.getElementById('reportDuration');
  const reportScoreValue = document.getElementById('reportScoreValue');
  const scoreCircleFill = document.getElementById('scoreCircleFill');
  const reportTopics = document.getElementById('reportTopics');
  const reportStrengths = document.getElementById('reportStrengths');
  const reportImprovements = document.getElementById('reportImprovements');
  const reportCoachingTips = document.getElementById('reportCoachingTips');
  const reportQuestions = document.getElementById('reportQuestions');
  
  // DOM Elements - Footer
  const helpLink = document.getElementById('helpLink');
  const feedbackLink = document.getElementById('feedbackLink');
  
  // Current state
  let currentReportId = null;
  
  // Initialize the history manager
  await historyManager.initialize();
  
  // Initialize UI
  initializeUI();
  
  // Event Listeners - Navigation
  backToOptionsButton.addEventListener('click', () => {
    window.location.href = 'options.html';
  });
  
  backToHistoryButton.addEventListener('click', () => {
    showHistorySection();
  });
  
  // Event Listeners - Consent
  historyConsentToggle.addEventListener('change', async () => {
    const consent = historyConsentToggle.checked;
    await historyManager.setConsent(consent);
    updateHistoryUI();
  });
  
  // Event Listeners - History
  clearHistoryButton.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all interview history? This action cannot be undone.')) {
      await historyManager.clearInterviewHistory();
      updateHistoryUI();
    }
  });
  
  // Event Listeners - Report
  exportReportButton.addEventListener('click', () => {
    exportReport();
  });
  
  // Event Listeners - Footer
  helpLink.addEventListener('click', openHelpPage);
  feedbackLink.addEventListener('click', openFeedbackForm);
  
  /**
   * Initialize the UI based on current state
   */
  function initializeUI() {
    // Set consent toggle based on current consent status
    historyConsentToggle.checked = historyManager.hasConsent();
    
    // Update history UI
    updateHistoryUI();
  }
  
  /**
   * Update the history UI based on current state
   */
  function updateHistoryUI() {
    const hasConsent = historyManager.hasConsent();
    const history = historyManager.getInterviewHistory();
    
    // Update stats
    updateHistoryStats(history);
    
    // Update history list
    updateHistoryList(history);
    
    // Show/hide elements based on consent
    clearHistoryButton.style.display = hasConsent ? 'block' : 'none';
  }
  
  /**
   * Update history statistics
   * @param {Array} history - Interview history
   */
  function updateHistoryStats(history) {
    // Calculate stats
    const totalInterviews = history.length;
    
    let totalQuestions = 0;
    let totalScore = 0;
    let scoredInterviews = 0;
    
    history.forEach(interview => {
      totalQuestions += interview.questions.length;
      
      if (interview.performance && interview.performance.overallScore) {
        totalScore += interview.performance.overallScore;
        scoredInterviews++;
      }
    });
    
    const averageScore = scoredInterviews > 0 ? Math.round(totalScore / scoredInterviews) : 0;
    
    // Update UI
    totalInterviewsValue.textContent = totalInterviews;
    totalQuestionsValue.textContent = totalQuestions;
    averageScoreValue.textContent = averageScore;
  }
  
  /**
   * Update the history list
   * @param {Array} history - Interview history
   */
  function updateHistoryList(history) {
    // Clear existing items
    while (interviewHistoryList.firstChild) {
      if (interviewHistoryList.firstChild === emptyHistoryState) {
        break;
      }
      interviewHistoryList.removeChild(interviewHistoryList.firstChild);
    }
    
    // Show empty state if no history
    if (history.length === 0) {
      emptyHistoryState.style.display = 'flex';
      return;
    }
    
    // Hide empty state
    emptyHistoryState.style.display = 'none';
    
    // Add history items
    history.forEach(interview => {
      const historyItem = createHistoryItem(interview);
      interviewHistoryList.appendChild(historyItem);
    });
  }
  
  /**
   * Create a history item element
   * @param {Object} interview - Interview data
   * @returns {HTMLElement} - History item element
   */
  function createHistoryItem(interview) {
    const item = document.createElement('div');
    item.className = 'history-item';
    
    // Date
    const dateColumn = document.createElement('div');
    dateColumn.className = 'history-item-column';
    dateColumn.textContent = new Date(interview.startTime).toLocaleDateString();
    item.appendChild(dateColumn);
    
    // Company
    const companyColumn = document.createElement('div');
    companyColumn.className = 'history-item-column';
    companyColumn.textContent = interview.metadata.company || 'Unknown';
    item.appendChild(companyColumn);
    
    // Position
    const positionColumn = document.createElement('div');
    positionColumn.className = 'history-item-column';
    positionColumn.textContent = interview.metadata.position || 'Unknown';
    item.appendChild(positionColumn);
    
    // Questions
    const questionsColumn = document.createElement('div');
    questionsColumn.className = 'history-item-column';
    questionsColumn.textContent = interview.questions.length;
    item.appendChild(questionsColumn);
    
    // Score
    const scoreColumn = document.createElement('div');
    scoreColumn.className = 'history-item-column history-item-score';
    scoreColumn.textContent = interview.performance && interview.performance.overallScore 
      ? interview.performance.overallScore 
      : 'N/A';
    item.appendChild(scoreColumn);
    
    // Actions
    const actionsColumn = document.createElement('div');
    actionsColumn.className = 'history-item-column';
    
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'history-item-actions';
    
    // View Report Button
    const viewButton = document.createElement('button');
    viewButton.className = 'history-item-action';
    viewButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    viewButton.title = 'View Report';
    viewButton.addEventListener('click', () => {
      showReport(interview.id);
    });
    actionsContainer.appendChild(viewButton);
    
    actionsColumn.appendChild(actionsContainer);
    item.appendChild(actionsColumn);
    
    return item;
  }
  
  /**
   * Show the report section for a specific interview
   * @param {string} interviewId - Interview ID
   */
  function showReport(interviewId) {
    const interview = historyManager.getInterview(interviewId);
    
    if (!interview) {
      alert('Interview not found');
      return;
    }
    
    // Generate report
    const report = historyManager.generatePerformanceReport(interviewId);
    
    if (!report) {
      alert('Failed to generate report');
      return;
    }
    
    // Update current report ID
    currentReportId = interviewId;
    
    // Update report UI
    updateReportUI(report, interview);
    
    // Show report section
    historySection.classList.add('hidden');
    reportSection.classList.remove('hidden');
  }
  
  /**
   * Update the report UI with report data
   * @param {Object} report - Report data
   * @param {Object} interview - Interview data
   */
  function updateReportUI(report, interview) {
    // Update header
    reportTitle.textContent = `Interview with ${report.company}`;
    reportDate.textContent = report.date;
    reportPosition.textContent = report.position;
    reportDuration.textContent = report.duration;
    
    // Update score
    reportScoreValue.textContent = report.overallScore || 'N/A';
    if (report.overallScore) {
      scoreCircleFill.style.strokeDasharray = `${report.overallScore}, 100`;
    } else {
      scoreCircleFill.style.strokeDasharray = '0, 100';
    }
    
    // Update topics
    reportTopics.innerHTML = '';
    report.topicsCovered.forEach(topic => {
      const topicTag = document.createElement('div');
      topicTag.className = 'topic-tag';
      topicTag.textContent = topic.charAt(0).toUpperCase() + topic.slice(1);
      reportTopics.appendChild(topicTag);
    });
    
    // Update strengths
    reportStrengths.innerHTML = '';
    report.strengths.forEach(strength => {
      const li = document.createElement('li');
      li.textContent = strength;
      reportStrengths.appendChild(li);
    });
    
    // If no strengths, show a message
    if (report.strengths.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Not enough data to determine strengths';
      reportStrengths.appendChild(li);
    }
    
    // Update areas for improvement
    reportImprovements.innerHTML = '';
    report.areasForImprovement.forEach(area => {
      const li = document.createElement('li');
      li.textContent = area;
      reportImprovements.appendChild(li);
    });
    
    // If no areas for improvement, show a message
    if (report.areasForImprovement.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Not enough data to determine areas for improvement';
      reportImprovements.appendChild(li);
    }
    
    // Update coaching tips
    reportCoachingTips.innerHTML = '';
    report.coachingTips.forEach(tip => {
      const li = document.createElement('li');
      li.textContent = tip;
      reportCoachingTips.appendChild(li);
    });
    
    // Update questions
    reportQuestions.innerHTML = '';
    interview.questions.forEach(qa => {
      const questionItem = document.createElement('div');
      questionItem.className = 'question-item';
      
      const questionText = document.createElement('div');
      questionText.className = 'question-text';
      questionText.textContent = `Q: ${qa.question}`;
      questionItem.appendChild(questionText);
      
      const answerText = document.createElement('div');
      answerText.className = 'answer-text';
      answerText.textContent = `A: ${qa.answer || 'No answer recorded'}`;
      questionItem.appendChild(answerText);
      
      const questionMetadata = document.createElement('div');
      questionMetadata.className = 'question-metadata';
      questionMetadata.textContent = new Date(qa.timestamp).toLocaleTimeString();
      questionItem.appendChild(questionMetadata);
      
      reportQuestions.appendChild(questionItem);
    });
  }
  
  /**
   * Show the history section
   */
  function showHistorySection() {
    reportSection.classList.add('hidden');
    historySection.classList.remove('hidden');
    currentReportId = null;
  }
  
  /**
   * Export the current report as a text file
   */
  function exportReport() {
    if (!currentReportId) {
      alert('No report to export');
      return;
    }
    
    const report = historyManager.generatePerformanceReport(currentReportId);
    const interview = historyManager.getInterview(currentReportId);
    
    if (!report || !interview) {
      alert('Failed to generate report for export');
      return;
    }
    
    // Create report text
    let reportText = `# Interview Performance Report\n\n`;
    reportText += `## Interview with ${report.company}\n`;
    reportText += `Date: ${report.date}\n`;
    reportText += `Position: ${report.position}\n`;
    reportText += `Duration: ${report.duration}\n\n`;
    
    reportText += `## Overall Score: ${report.overallScore || 'N/A'}\n\n`;
    
    reportText += `## Topics Covered\n`;
    report.topicsCovered.forEach(topic => {
      reportText += `- ${topic.charAt(0).toUpperCase() + topic.slice(1)}\n`;
    });
    reportText += '\n';
    
    reportText += `## Strengths\n`;
    if (report.strengths.length === 0) {
      reportText += `- Not enough data to determine strengths\n`;
    } else {
      report.strengths.forEach(strength => {
        reportText += `- ${strength}\n`;
      });
    }
    reportText += '\n';
    
    reportText += `## Areas for Improvement\n`;
    if (report.areasForImprovement.length === 0) {
      reportText += `- Not enough data to determine areas for improvement\n`;
    } else {
      report.areasForImprovement.forEach(area => {
        reportText += `- ${area}\n`;
      });
    }
    reportText += '\n';
    
    reportText += `## Coaching Tips\n`;
    report.coachingTips.forEach(tip => {
      reportText += `- ${tip}\n`;
    });
    reportText += '\n';
    
    reportText += `## Questions & Answers\n\n`;
    interview.questions.forEach((qa, index) => {
      reportText += `### Question ${index + 1}\n`;
      reportText += `Q: ${qa.question}\n`;
      reportText += `A: ${qa.answer || 'No answer recorded'}\n`;
      reportText += `Time: ${new Date(qa.timestamp).toLocaleTimeString()}\n\n`;
    });
    
    // Create download link
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-report-${report.company.replace(/\s+/g, '-')}-${report.date.replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  /**
   * Open the help page
   */
  function openHelpPage() {
    chrome.tabs.create({ url: 'https://candidai.io/help' });
  }
  
  /**
   * Open the feedback form
   */
  function openFeedbackForm() {
    chrome.tabs.create({ url: 'https://candidai.io/feedback' });
  }
});

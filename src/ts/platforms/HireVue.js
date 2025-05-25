/**
 * HireVueAdapter - HireVue interview platform integration
 */

export class HireVueAdapter {
  constructor() {
    this.platform = 'hirevue';
    this.supportedDomains = ['hirevue.com'];
    this.state = { isInMeeting: false };
  }

  async initialize() {
    console.log('Initializing HireVue adapter');
    return true;
  }

  async isInVideoCall() {
    // Check for HireVue interview UI
    const interviewUI = document.querySelector(
      '.interview-container, [data-testid="video-interview"]'
    );
    this.state.isInMeeting = !!interviewUI;
    return this.state.isInMeeting;
  }

  async extractMetadata() {
    // Extract interview stage and question info
    const questionNumber = document.querySelector('.question-number')?.textContent;
    const timeRemaining = document.querySelector('.timer')?.textContent;

    return {
      platform: this.platform,
      questionNumber,
      timeRemaining,
      isRecording: !!document.querySelector('.recording-indicator'),
      timestamp: Date.now(),
    };
  }

  async extractPageContext() {
    return {
      platform: this.platform,
      metadata: await this.extractMetadata(),
    };
  }

  onVideoCallStateChange(_callback) {
    console.log('HireVue state monitoring registered');
  }

  cleanup() {
    console.log('HireVue adapter cleanup');
  }
}

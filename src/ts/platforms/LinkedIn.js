/**
 * LinkedInAdapter - LinkedIn interview integration
 */

export class LinkedInAdapter {
  constructor() {
    this.platform = 'linkedin';
    this.supportedDomains = ['linkedin.com'];
    this.state = { isInMeeting: false };
  }

  async initialize() {
    console.log('Initializing LinkedIn adapter');
    return true;
  }

  async isInVideoCall() {
    // Check for LinkedIn video call UI
    const videoCall = document.querySelector('.video-call-container, [data-test-video-call]');
    this.state.isInMeeting = !!videoCall;
    return this.state.isInMeeting;
  }

  async extractMetadata() {
    // Extract job/recruiter information if available
    const jobTitle = document.querySelector('.job-title')?.textContent;
    const company = document.querySelector('.company-name')?.textContent;

    return {
      platform: this.platform,
      jobTitle,
      company,
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
    console.log('LinkedIn state monitoring registered');
  }

  cleanup() {
    console.log('LinkedIn adapter cleanup');
  }
}

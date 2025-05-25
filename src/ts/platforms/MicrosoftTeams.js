/**
 * MicrosoftTeamsAdapter - Microsoft Teams integration
 */

export class TeamsAdapter {
  constructor() {
    this.platform = 'microsoft-teams';
    this.supportedDomains = ['teams.microsoft.com'];
    this.state = { isInMeeting: false };
  }

  async initialize() {
    console.log('Initializing Teams adapter');
    return true;
  }

  async isInVideoCall() {
    const callControls = document.querySelector('[data-tid="call-controls"]');
    this.state.isInMeeting = !!callControls;
    return this.state.isInMeeting;
  }

  async extractMetadata() {
    return {
      platform: this.platform,
      timestamp: Date.now(),
    };
  }

  async extractPageContext() {
    return { platform: this.platform };
  }

  onVideoCallStateChange(_callback) {
    console.log('MicrosoftTeams state monitoring registered');
  }

  cleanup() {
    console.log('Teams adapter cleanup');
  }
}

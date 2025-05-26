/**
 * GoogleMeetAdapter - Google Meet platform integration
 * Implements platform-specific DOM interactions and event handling
 * Provides seamless integration with Google Meet interface
 */

/**
 * GoogleMeetAdapter - Adapter for Google Meet integration
 * Implements platform detection and metadata extraction
 */
export class GoogleMeetAdapter {
  constructor() {
    // Platform identifiers
    this.platform = 'google-meet';
    this.supportedDomains = ['meet.google.com'];

    // DOM selectors (current as of 2024)
    this.selectors = {
      meetingId: '[data-meeting-code]',
      participantsList: '[role="list"][aria-label*="participant"]',
      selfVideo: '[data-self-video]',
      micButton: '[data-is-muted][aria-label*="microphone"]',
      cameraButton: '[data-is-muted][aria-label*="camera"]',
      captionsButton: '[aria-label*="captions"]',
      presentButton: '[aria-label*="present"]',
      chatPanel: '[aria-label*="chat"]',
      meetingTitle: 'h1[data-meeting-title]',
      timer: '[jsname="r4nke"]',
    };

    // State tracking
    this.state = {
      isInMeeting: false,
      meetingId: null,
      participants: [],
      isMuted: false,
      isCameraOff: false,
      startTime: null,
    };

    // Event listeners
    this.mutationObserver = null;
    this.eventHandlers = new Map();
  }

  /**
   * Initialize adapter
   * Sets up observers and event listeners
   */
  async initialize() {
    console.log('Initializing Google Meet adapter');

    // Wait for Meet UI to load
    await this.waitForMeetUI();

    // Set up mutation observer
    this.setupMutationObserver();

    // Extract initial metadata
    await this.extractMetadata();

    // Set up event listeners
    this.setupEventListeners();

    return true;
  }

  /**
   * Wait for Google Meet UI to be ready
   * Implements polling with timeout
   */
  async waitForMeetUI(timeout = 10000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      // Check for key UI elements
      const meetingControls = document.querySelector('[data-call-controls]');
      if (meetingControls) {
        return true;
      }

      // Wait before next check
      await this.delay(500);
    }

    throw new Error('Google Meet UI not detected within timeout');
  }

  /**
   * Set up mutation observer for DOM changes
   * Monitors for meeting state changes
   */
  setupMutationObserver() {
    this.mutationObserver = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });

    // Observe with specific configuration
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-participant-id', 'data-is-muted', 'aria-label'],
    });
  }

  /**
   * Handle DOM mutations
   * Detects relevant changes in meeting state
   */
  handleMutations(mutations) {
    let shouldUpdateState = false;

    for (const mutation of mutations) {
      // Check for participant changes
      if (mutation.target.matches?.(this.selectors.participantsList)) {
        shouldUpdateState = true;
      }

      // Check for mute state changes
      if (mutation.attributeName === 'data-is-muted') {
        this.updateMuteState();
      }

      // Check for meeting end
      if (mutation.removedNodes.length > 0) {
        const hasCallControls = Array.from(mutation.removedNodes).some((node) =>
          node.querySelector?.('[data-call-controls]')
        );

        if (hasCallControls) {
          this.handleMeetingEnd();
        }
      }
    }

    if (shouldUpdateState) {
      this.extractMetadata();
    }
  }
  /**
   * Check if currently in a video call
   * Implements meeting detection logic
   */
  async isInVideoCall() {
    // Check for presence of call controls
    const callControls = document.querySelector('[data-call-controls]');
    const participantsList = document.querySelector(this.selectors.participantsList);

    this.state.isInMeeting = !!(callControls && participantsList);

    return this.state.isInMeeting;
  }

  /**
   * Extract metadata from the page
   * Gathers meeting information
   */
  async extractMetadata() {
    const metadata = {
      platform: this.platform,
      meetingId: this.getMeetingId(),
      meetingTitle: this.getMeetingTitle(),
      participants: await this.getParticipants(),
      duration: this.getMeetingDuration(),
      isMuted: this.state.isMuted,
      isCameraOff: this.state.isCameraOff,
      timestamp: Date.now(),
    };

    // Update state
    Object.assign(this.state, metadata);

    return metadata;
  }

  /**
   * Get meeting ID from DOM
   */
  getMeetingId() {
    // Try multiple selectors
    const meetingCodeElement = document.querySelector(this.selectors.meetingId);
    if (meetingCodeElement instanceof HTMLElement) {
      return meetingCodeElement.dataset.meetingCode;
    }

    // Fallback: extract from URL
    const urlMatch = window.location.pathname.match(/\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
    return urlMatch ? urlMatch[1] : null;
  }

  /**
   * Get meeting title if available
   */
  getMeetingTitle() {
    const titleElement = document.querySelector(this.selectors.meetingTitle);
    return titleElement ? titleElement.textContent.trim() : 'Google Meet';
  }

  /**
   * Get list of participants
   */
  async getParticipants() {
    const participants = [];
    const participantElements = document.querySelectorAll('[data-participant-id]');

    participantElements.forEach((element) => {
      const nameElement = element.querySelector('[data-name]');
      const participantName = nameElement instanceof HTMLElement 
        ? nameElement.dataset?.name 
        : '';

      const participantId = element instanceof HTMLElement
        ? element.dataset?.participantId
        : '';

      const isSelf = element.hasAttribute('data-self-participant');

      participants.push({
        id: participantId,
        name: nameElement instanceof HTMLElement
          ? nameElement.dataset?.originalTitle || nameElement.textContent?.trim()
          : '',
        isSelf,
        isMuted: element.querySelector('[data-is-muted="true"]') !== null,
      });
    });

    return participants;
  }

  /**
   * Get meeting duration
   */
  getMeetingDuration() {
    const timerElement = document.querySelector(this.selectors.timer);
    if (timerElement) {
      return timerElement.textContent.trim();
    }

    // Calculate from start time if available
    if (this.state.startTime) {
      const duration = Date.now() - this.state.startTime;
      const minutes = Math.floor(duration / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    return null;
  }

  /**
   * Extract page context for enhanced understanding
   */
  async extractPageContext() {
    const context = {
      url: window.location.href,
      title: document.title,
      metadata: await this.extractMetadata(),
      chat: this.extractChatMessages(),
      captions: this.extractCaptions(),
    };

    return context;
  }

  /**
   * Extract chat messages if panel is open
   */
  extractChatMessages() {
    const messages = [];
    const chatPanel = document.querySelector(this.selectors.chatPanel);

    if (chatPanel) {
      const messageElements = chatPanel.querySelectorAll('[data-message-text]');

      messageElements.forEach((element) => {
        messages.push({
          sender: element.querySelector('[data-sender-name]')?.textContent || 'Unknown',
          text: element.querySelector('[data-message-text]')?.textContent || '',
          timestamp: element.querySelector('[data-timestamp]')?.textContent || '',
        });
      });
    }

    return messages;
  }

  /**
   * Extract live captions if enabled
   */
  extractCaptions() {
    const captions = [];
    const captionElements = document.querySelectorAll('[data-caption-text]');

    captionElements.forEach((element) => {
      captions.push({
        text: element.textContent,
        speaker: element instanceof HTMLElement ? element.dataset.speaker || 'Unknown' : 'Unknown',
      });
    });

    return captions;
  }

  /**
   * Set up event listeners for meeting events
   */
  setupEventListeners() {
    // Mute button click
    const micButton = document.querySelector(this.selectors.micButton);
    if (micButton) {
      micButton.addEventListener('click', () => {
        setTimeout(() => this.updateMuteState(), 100);
      });
    }

    // Meeting start detection
    if (!this.state.isInMeeting && this.isInVideoCall()) {
      this.handleMeetingStart();
    }
  }

  /**
   * Update mute state
   */
  updateMuteState() {
    const micButton = document.querySelector(this.selectors.micButton);
    if (micButton instanceof HTMLElement) {
      this.state.isMuted = micButton.dataset.isMuted === 'true';

      // Notify extension
      chrome.runtime.sendMessage({
        command: 'MUTE_STATE_CHANGED',
        payload: {
          platform: this.platform,
          isMuted: this.state.isMuted,
        },
      });
    }
  }

  /**
   * Handle meeting start
   */
  handleMeetingStart() {
    this.state.startTime = Date.now();
    this.state.isInMeeting = true;

    // Notify extension
    chrome.runtime.sendMessage({
      command: 'MEETING_STARTED',
      payload: {
        platform: this.platform,
        meetingId: this.state.meetingId,
        timestamp: this.state.startTime,
      },
    });
  }

  /**
   * Handle meeting end
   */
  handleMeetingEnd() {
    const duration = Date.now() - (this.state.startTime || Date.now());

    // Notify extension
    chrome.runtime.sendMessage({
      command: 'MEETING_ENDED',
      payload: {
        platform: this.platform,
        meetingId: this.state.meetingId,
        duration,
        timestamp: Date.now(),
      },
    });

    // Reset state
    this.state.isInMeeting = false;
    this.state.meetingId = null;
    this.state.startTime = null;
  }

  /**
   * Register video call state change callback
   */
  onVideoCallStateChange(callback) {
    this.eventHandlers.set('videoCallStateChange', callback);
  }

  /**
   * Inject UI elements (if side panel not available)
   */
  async injectUI(_config) {
    console.log('GoogleMeet UI injection not yet implemented');
  }

  /**
   * Clean up adapter
   */
  cleanup() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    this.eventHandlers.clear();
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

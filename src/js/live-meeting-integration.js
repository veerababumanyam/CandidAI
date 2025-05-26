/**
 * Live Meeting Integration Script
 * Coordinates all live meeting functionality including orchestrator, UI components, and platform detection
 */

import { liveMeetingOrchestrator } from '../ts/services/LiveMeetingOrchestrator';

class LiveMeetingIntegration {
  constructor() {
    this.isInitialized = false;
    this.currentPlatform = null;
    this.isInMeeting = false;
    
    console.log('LiveMeetingIntegration initialized');
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Detect current platform
      this.currentPlatform = this.detectPlatform();
      console.log('Platform detected:', this.currentPlatform);

      // Set up page monitoring for meeting state changes
      this.setupMeetingDetection();

      // Set up message listeners
      this.setupMessageListeners();

      // Auto-start if in meeting
      if (this.isVideoCallActive()) {
        console.log('Video call detected, starting live assistance');
        await this.startLiveAssistance();
      }

      this.isInitialized = true;
      console.log('Live meeting integration ready');

    } catch (error) {
      console.error('Failed to initialize live meeting integration:', error);
    }
  }

  detectPlatform() {
    const hostname = window.location.hostname.toLowerCase();
    const url = window.location.href.toLowerCase();

    if (hostname.includes('meet.google.com') || hostname.includes('hangouts.google.com')) {
      return 'google_meet';
    } else if (hostname.includes('zoom.us') || url.includes('zoom')) {
      return 'zoom';
    } else if (hostname.includes('teams.microsoft.com') || hostname.includes('teams.live.com')) {
      return 'microsoft_teams';
    } else if (hostname.includes('linkedin.com') && url.includes('events/')) {
      return 'linkedin_events';
    } else if (hostname.includes('hirevue.com')) {
      return 'hirevue';
    } else if (hostname.includes('webex.com')) {
      return 'webex';
    } else if (hostname.includes('gotomeeting.com')) {
      return 'gotomeeting';
    }

    return 'unknown';
  }

  setupMeetingDetection() {
    // Monitor DOM for video call indicators
    const observer = new MutationObserver((mutations) => {
      const wasInMeeting = this.isInMeeting;
      this.isInMeeting = Boolean(this.isVideoCallActive());

      if (this.isInMeeting !== wasInMeeting) {
        console.log('Meeting state changed:', this.isInMeeting ? 'Started' : 'Ended');
        
        if (this.isInMeeting) {
          this.startLiveAssistance();
        } else {
          this.stopLiveAssistance();
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'aria-label', 'title']
    });

    // Also check periodically
    setInterval(() => {
      const currentState = Boolean(this.isVideoCallActive());
      if (currentState !== this.isInMeeting) {
        this.isInMeeting = currentState;
        console.log('Meeting state changed (periodic check):', this.isInMeeting ? 'Started' : 'Ended');
        
        if (this.isInMeeting) {
          this.startLiveAssistance();
        } else {
          this.stopLiveAssistance();
        }
      }
    }, 5000);
  }

  isVideoCallActive() {
    const platform = this.currentPlatform;
    
    switch (platform) {
      case 'google_meet':
        return document.querySelector('[data-call-id]') || 
               document.querySelector('[jsname="HlFkCe"]') ||
               document.querySelector('div[data-meeting-title]') ||
               document.querySelector('.crqnQb') || // Meet's main video container
               window.location.pathname.includes('/meet/');

      case 'zoom':
        return document.querySelector('[aria-label*="meeting"]') ||
               document.querySelector('#webclient') ||
               document.querySelector('.meeting-client-view') ||
               document.querySelector('[data-testid="meeting-window"]');

      case 'microsoft_teams':
        return document.querySelector('[data-tid="calling-screen"]') ||
               document.querySelector('[data-tid="meeting-stage"]') ||
               document.querySelector('.calling-screen') ||
               document.querySelector('#teams-app-chrome') ||
               window.location.pathname.includes('/call/');

      case 'linkedin_events':
        return document.querySelector('[data-test-id="event-call-stage"]') ||
               document.querySelector('.live-event-viewer') ||
               window.location.pathname.includes('/events/');

      case 'hirevue':
        return document.querySelector('.interview-container') ||
               document.querySelector('[data-testid="interview-room"]') ||
               document.querySelector('.hv-interview');

      default:
        // Generic detection
        return document.querySelector('video[autoplay]') ||
               document.querySelector('[aria-label*="video"]') ||
               document.querySelector('[aria-label*="call"]') ||
               document.querySelector('[aria-label*="meeting"]');
    }
  }

  async startLiveAssistance() {
    if (liveMeetingOrchestrator.getState().isActive) {
      console.log('Live assistance already active');
      return;
    }

    try {
      console.log('Starting live meeting assistance for', this.currentPlatform);
      
      // Inject CSS if not already present
      this.injectStyles();
      
      // Start the orchestrator
      await liveMeetingOrchestrator.startMeeting(
        this.currentPlatform,
        'client_meeting', // Default call type
        'professional'    // Default tone
      );

      // Add UI toggle button
      this.addToggleButton();

      console.log('Live assistance started successfully');

    } catch (error) {
      console.error('Failed to start live assistance:', error);
    }
  }

  async stopLiveAssistance() {
    if (!liveMeetingOrchestrator.getState().isActive) {
      console.log('Live assistance not active');
      return;
    }

    try {
      console.log('Stopping live meeting assistance');
      
      await liveMeetingOrchestrator.stopMeeting();
      this.removeToggleButton();

      console.log('Live assistance stopped');

    } catch (error) {
      console.error('Failed to stop live assistance:', error);
    }
  }

  injectStyles() {
    if (document.getElementById('candidai-live-styles')) return;

    const link = document.createElement('link');
    link.id = 'candidai-live-styles';
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('css/live-assistant.css');
    document.head.appendChild(link);
  }

  addToggleButton() {
    if (document.getElementById('candidai-toggle-btn')) return;

    const button = document.createElement('button');
    button.id = 'candidai-toggle-btn';
    button.className = 'candidai-toggle-button';
    button.innerHTML = '🤖 CandidAI';
    button.title = 'Toggle CandidAI Live Assistant';

    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 440px;
      z-index: 9999;
      padding: 8px 12px;
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      color: white;
      border: none;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      transition: all 0.2s ease;
    `;

    button.addEventListener('click', () => {
      const container = document.getElementById('candidai-main-container');
      if (container) {
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
      }
    });

    document.body.appendChild(button);
  }

  removeToggleButton() {
    const button = document.getElementById('candidai-toggle-btn');
    if (button) {
      button.remove();
    }
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.command) {
        case 'START_LIVE_ASSISTANCE':
          this.startLiveAssistance().then(() => {
            sendResponse({ success: true });
          }).catch(error => {
            sendResponse({ success: false, error: error.message });
          });
          return true; // Keep channel open for async response

        case 'STOP_LIVE_ASSISTANCE':
          this.stopLiveAssistance().then(() => {
            sendResponse({ success: true });
          }).catch(error => {
            sendResponse({ success: false, error: error.message });
          });
          return true;

        case 'GET_MEETING_STATE':
          sendResponse({
            success: true,
            data: {
              platform: this.currentPlatform,
              isInMeeting: this.isInMeeting,
              isAssistanceActive: liveMeetingOrchestrator.getState().isActive
            }
          });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown command' });
      }
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const integration = new LiveMeetingIntegration();
    integration.initialize();
  });
} else {
  const integration = new LiveMeetingIntegration();
  integration.initialize();
}

// Global instance for external access
window['candidaiLiveMeeting'] = new LiveMeetingIntegration(); 
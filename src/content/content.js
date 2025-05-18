/**
 * CandidAI - Content Script
 * Runs in the context of supported video call platforms
 * Detects platform and communicates with service worker
 */

// State
let currentPlatform = null;
let inCall = false;
let callParticipants = [];
let callDuration = 0;
let callDurationInterval = null;
let callStartTime = null;
let lastActivityTime = Date.now();
let platformSpecificData = {};

// Initialize content script
initialize();

/**
 * Initialize the content script
 */
function initialize() {
  // Immediately detect platform
  currentPlatform = detectPlatform();
  console.log('CandidAI: Detected platform:', currentPlatform);

  // Send platform info to service worker
  if (currentPlatform) {
    chrome.runtime.sendMessage({
      action: 'platformDetected',
      platform: currentPlatform
    });

    // Initialize platform-specific functionality
    initializePlatformSpecific(currentPlatform);

    // Start observing page changes
    observePageChanges();

    // Check call status immediately
    checkCallStatus();
  }

  // Set up activity tracking
  document.addEventListener('click', updateActivityTime);
  document.addEventListener('keydown', updateActivityTime);
  document.addEventListener('mousemove', throttle(updateActivityTime, 5000));
}

/**
 * Initialize platform-specific functionality
 * @param {string} platform - The detected platform
 */
function initializePlatformSpecific(platform) {
  switch (platform) {
    case 'Google Meet':
      initializeGoogleMeet();
      break;
    case 'Zoom':
      initializeZoom();
      break;
    case 'Microsoft Teams':
      initializeMicrosoftTeams();
      break;
  }
}

/**
 * Initialize Google Meet specific functionality
 */
function initializeGoogleMeet() {
  platformSpecificData.meetingCode = extractMeetingCodeFromUrl();

  // Add a small delay to ensure the UI is loaded
  setTimeout(() => {
    // Try to extract participant information
    const participantList = document.querySelectorAll('[data-participant-id]');
    if (participantList.length > 0) {
      callParticipants = Array.from(participantList).map(el => {
        const name = el.querySelector('[data-self-name]')?.textContent || 'Unknown';
        return { name, id: el.getAttribute('data-participant-id') };
      });
    }
  }, 3000);
}

/**
 * Initialize Zoom specific functionality
 */
function initializeZoom() {
  platformSpecificData.meetingId = extractZoomMeetingId();

  // Zoom-specific initialization
}

/**
 * Initialize Microsoft Teams specific functionality
 */
function initializeMicrosoftTeams() {
  // Teams-specific initialization
}

/**
 * Extract meeting code from Google Meet URL
 */
function extractMeetingCodeFromUrl() {
  const url = window.location.href;
  const match = url.match(/\/([a-zA-Z0-9\-_]+)(\?|$)/);
  return match ? match[1] : null;
}

/**
 * Extract meeting ID from Zoom URL or page
 */
function extractZoomMeetingId() {
  const url = window.location.href;
  const match = url.match(/\/j\/(\d+)(\?|$)/);
  return match ? match[1] : null;
}

/**
 * Update the last activity time
 */
function updateActivityTime() {
  lastActivityTime = Date.now();
}

/**
 * Throttle a function to limit how often it can be called
 */
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * Listen for messages from service worker
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);

  switch (message.action) {
    case 'getPageInfo':
      // Collect page information
      const pageInfo = {
        title: document.title,
        url: window.location.href,
        platform: currentPlatform,
        inCall: inCall,
        callDuration: callDuration,
        callParticipants: callParticipants,
        lastActivity: Date.now() - lastActivityTime,
        platformSpecificData
      };

      sendResponse(pageInfo);
      break;

    case 'checkCallStatus':
      // Check if in a call and respond
      checkCallStatus();
      sendResponse({ inCall, platform: currentPlatform });
      break;
  }

  // Keep the message channel open for async responses
  return true;
});

/**
 * Detect the current platform
 * @returns {string|null} - The detected platform or null
 */
function detectPlatform() {
  const url = window.location.href;

  if (url.includes('meet.google.com')) {
    return 'Google Meet';
  } else if (url.includes('zoom.us')) {
    return 'Zoom';
  } else if (url.includes('teams.microsoft.com')) {
    return 'Microsoft Teams';
  }

  return null;
}

/**
 * Observe DOM changes for dynamic content
 */
function observePageChanges() {
  const observer = new MutationObserver(throttle(() => {
    // Check for call status changes
    const wasInCall = inCall;
    const nowInCall = checkIfInCall();

    if (wasInCall !== nowInCall) {
      handleCallStatusChange(nowInCall);
    }

    // If in a call, update participant information
    if (nowInCall) {
      updateCallInfo();
    }
  }, 1000));

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'data-is-muted']
  });
}

/**
 * Check if the user is currently in a call
 * @returns {boolean} - Whether the user is in a call
 */
function checkIfInCall() {
  const platform = currentPlatform;

  if (platform === 'Google Meet') {
    // Google Meet specific detection
    return document.querySelector('[data-is-muted]') !== null ||
           document.querySelector('.zWfAib') !== null; // Video controls
  } else if (platform === 'Zoom') {
    // Zoom specific detection
    return document.querySelector('.meeting-app') !== null ||
           document.querySelector('.meeting-client') !== null;
  } else if (platform === 'Microsoft Teams') {
    // Teams specific detection
    return document.querySelector('.ts-calling-screen') !== null ||
           document.querySelector('[data-tid="calling-composite"]') !== null;
  }

  return false;
}

/**
 * Check call status and update state
 */
function checkCallStatus() {
  const nowInCall = checkIfInCall();

  if (inCall !== nowInCall) {
    handleCallStatusChange(nowInCall);
  }
}

/**
 * Handle changes in call status
 * @param {boolean} nowInCall - Whether the user is now in a call
 */
function handleCallStatusChange(nowInCall) {
  inCall = nowInCall;

  if (inCall) {
    // Call started
    callStartTime = Date.now();
    startCallDurationTimer();

    // Notify service worker
    chrome.runtime.sendMessage({
      action: 'callStatusChanged',
      inCall: true,
      platform: currentPlatform,
      startTime: callStartTime
    });

    // Update call information
    updateCallInfo();
  } else {
    // Call ended
    stopCallDurationTimer();

    // Notify service worker
    chrome.runtime.sendMessage({
      action: 'callStatusChanged',
      inCall: false,
      platform: currentPlatform,
      duration: callDuration
    });

    // Reset call data
    callDuration = 0;
    callParticipants = [];
  }
}

/**
 * Start the call duration timer
 */
function startCallDurationTimer() {
  if (callDurationInterval) {
    clearInterval(callDurationInterval);
  }

  callDurationInterval = setInterval(() => {
    callDuration = Math.floor((Date.now() - callStartTime) / 1000);
  }, 1000);
}

/**
 * Stop the call duration timer
 */
function stopCallDurationTimer() {
  if (callDurationInterval) {
    clearInterval(callDurationInterval);
    callDurationInterval = null;
  }
}

/**
 * Update call information (participants, etc.)
 */
function updateCallInfo() {
  // Platform-specific participant detection
  if (currentPlatform === 'Google Meet') {
    updateGoogleMeetParticipants();
  } else if (currentPlatform === 'Zoom') {
    updateZoomParticipants();
  } else if (currentPlatform === 'Microsoft Teams') {
    updateTeamsParticipants();
  }
}

/**
 * Update Google Meet participants
 */
function updateGoogleMeetParticipants() {
  const participantElements = document.querySelectorAll('[data-participant-id], .ZjFb7c');
  if (participantElements.length > 0) {
    const newParticipants = Array.from(participantElements).map(el => {
      const name = el.querySelector('[data-self-name], .ZjFb7c')?.textContent || 'Unknown';
      const id = el.getAttribute('data-participant-id') || generateId(name);
      return { name, id };
    });

    // Only update if there's a change
    if (JSON.stringify(newParticipants) !== JSON.stringify(callParticipants)) {
      callParticipants = newParticipants;

      // Notify service worker of participant change
      chrome.runtime.sendMessage({
        action: 'callParticipantsChanged',
        participants: callParticipants,
        platform: currentPlatform
      });
    }
  }
}

/**
 * Update Zoom participants
 */
function updateZoomParticipants() {
  // Zoom-specific participant detection
  // This is a placeholder - actual implementation would depend on Zoom's DOM structure
}

/**
 * Update Microsoft Teams participants
 */
function updateTeamsParticipants() {
  // Teams-specific participant detection
  // This is a placeholder - actual implementation would depend on Teams' DOM structure
}

/**
 * Generate a simple ID from a string
 */
function generateId(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'id_' + Math.abs(hash).toString(16);
}

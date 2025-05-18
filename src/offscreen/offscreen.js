/**
 * CandidAI - Offscreen Document Script
 * Handles audio capture and transcription
 */

// State
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let recognition = null;
let audioContext = null;
let analyser = null;
let microphoneStream = null;
let transcriptionLanguage = 'en-US';
let useExternalSTT = false;
let externalSTTProvider = null;
let transcriptionHistory = [];
let silenceDetectionThreshold = 0.01;
let silenceTimer = null;
let silenceTimeout = 1500; // 1.5 seconds of silence to consider end of speech

// Initialize Web Speech API if available
function initSpeechRecognition() {
  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = transcriptionLanguage;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      chrome.runtime.sendMessage({
        action: 'transcriptionStatusChanged',
        status: 'active'
      });
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;

          // Add to transcription history
          transcriptionHistory.push({
            text: event.results[i][0].transcript,
            timestamp: new Date().toISOString(),
            isFinal: true,
            confidence: event.results[i][0].confidence
          });

          // Limit history size
          if (transcriptionHistory.length > 50) {
            transcriptionHistory.shift();
          }

          // Check if this is a question
          if (isQuestion(finalTranscript)) {
            // Send to service worker
            chrome.runtime.sendMessage({
              action: 'questionDetected',
              text: finalTranscript,
              confidence: event.results[i][0].confidence,
              timestamp: new Date().toISOString()
            });
          } else {
            // Still send the transcription for display
            chrome.runtime.sendMessage({
              action: 'transcriptionUpdate',
              text: finalTranscript,
              isFinal: true
            });
          }
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Send interim transcript for display
      if (interimTranscript) {
        chrome.runtime.sendMessage({
          action: 'interimTranscript',
          text: interimTranscript
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      chrome.runtime.sendMessage({
        action: 'transcriptionError',
        error: event.error
      });

      // Try to restart if it was a temporary error
      if (event.error === 'network' || event.error === 'service-not-allowed') {
        setTimeout(() => {
          if (isRecording) {
            try {
              recognition.start();
            } catch (e) {
              console.error('Failed to restart recognition:', e);
            }
          }
        }, 3000);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');

      // Restart if we're still supposed to be recording
      if (isRecording) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
          chrome.runtime.sendMessage({
            action: 'transcriptionStatusChanged',
            status: 'error',
            error: 'Failed to restart recognition'
          });
        }
      } else {
        chrome.runtime.sendMessage({
          action: 'transcriptionStatusChanged',
          status: 'inactive'
        });
      }
    };

    return true;
  }

  return false;
}

// Function to check if text is likely a question
function isQuestion(text) {
  text = text.trim().toLowerCase();

  // Check for question marks
  if (text.endsWith('?')) {
    return true;
  }

  // Check for common question starters
  const questionStarters = [
    'what', 'how', 'why', 'when', 'where', 'who', 'which', 'can you',
    'could you', 'will you', 'would you', 'do you', 'are you', 'is there',
    'tell me about', 'explain'
  ];

  for (const starter of questionStarters) {
    if (text.startsWith(starter)) {
      return true;
    }
  }

  return false;
}

/**
 * Sets up audio context and analyser for audio processing
 */
function setupAudioContext(stream) {
  // Create audio context
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Create analyser node
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  // Connect microphone to analyser
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  // Set up silence detection
  setupSilenceDetection();
}

/**
 * Detects silence in the audio stream to identify pauses in speech
 */
function setupSilenceDetection() {
  if (!analyser) return;

  const bufferLength = analyser.fftSize;
  const dataArray = new Uint8Array(bufferLength);

  // Function to check audio levels
  const checkAudioLevel = () => {
    if (!isRecording || !analyser) return;

    analyser.getByteTimeDomainData(dataArray);

    // Calculate audio level (simple RMS)
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const amplitude = (dataArray[i] - 128) / 128;
      sum += amplitude * amplitude;
    }
    const rms = Math.sqrt(sum / bufferLength);

    // Check if below threshold (silence)
    if (rms < silenceDetectionThreshold) {
      if (!silenceTimer) {
        silenceTimer = setTimeout(() => {
          // Silence detected for the timeout period
          chrome.runtime.sendMessage({
            action: 'silenceDetected',
            duration: silenceTimeout
          });

          silenceTimer = null;
        }, silenceTimeout);
      }
    } else {
      // Sound detected, clear silence timer
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }
    }

    // Continue checking while recording
    if (isRecording) {
      requestAnimationFrame(checkAudioLevel);
    }
  };

  // Start checking audio levels
  checkAudioLevel();
}

/**
 * Attempts to use an external STT API if configured
 */
async function useExternalSTTAPI(audioBlob) {
  try {
    // Get API key and settings from storage
    const settings = await new Promise((resolve) => {
      chrome.storage.local.get(['preferredSTT', 'sttApiKeys'], resolve);
    });

    const provider = settings.preferredSTT || 'webSpeech';

    // If web speech is preferred or no API keys, don't use external API
    if (provider === 'webSpeech' || !settings.sttApiKeys) {
      return false;
    }

    const apiKey = settings.sttApiKeys[provider];
    if (!apiKey) {
      console.warn(`No API key found for ${provider}`);
      return false;
    }

    // This is a placeholder for actual API implementation
    // In a real implementation, you would send the audio to the appropriate API
    console.log(`Would send audio to ${provider} API`);

    // For now, we'll just return false to use Web Speech API
    return false;
  } catch (error) {
    console.error('Error using external STT API:', error);
    return false;
  }
}

/**
 * Starts audio capture and transcription
 */
async function startAudioCapture() {
  if (isRecording) return true;

  try {
    // Get user settings
    const settings = await new Promise((resolve) => {
      chrome.storage.local.get(['languageSettings', 'useExternalSTT', 'preferredSTT'], resolve);
    });

    // Apply settings
    transcriptionLanguage = settings.languageSettings?.transcription || 'en-US';
    useExternalSTT = settings.useExternalSTT || false;
    externalSTTProvider = settings.preferredSTT || null;

    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    // Save stream reference
    microphoneStream = stream;

    // Set up audio context for processing
    setupAudioContext(stream);

    // Set up media recorder for capturing audio chunks
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);

      // If using external STT API and we have enough data, process it
      if (useExternalSTT && audioChunks.length >= 5) {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        useExternalSTTAPI(audioBlob);
        // Clear chunks after processing
        audioChunks = [];
      }
    };

    mediaRecorder.onstop = () => {
      // Process any remaining audio if needed
      if (useExternalSTT && audioChunks.length > 0) {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        useExternalSTTAPI(audioBlob);
      }
    };

    // Start recording
    mediaRecorder.start(1000); // Collect data every second
    isRecording = true;

    // Start speech recognition if available and not using external STT exclusively
    if (!useExternalSTT && (recognition || initSpeechRecognition())) {
      try {
        recognition.lang = transcriptionLanguage;
        recognition.start();
      } catch (e) {
        console.error('Error starting speech recognition:', e);
      }
    }

    // Notify service worker
    chrome.runtime.sendMessage({
      action: 'audioCaptureBegan',
      useExternalSTT: useExternalSTT,
      language: transcriptionLanguage
    });

    return true;
  } catch (error) {
    console.error('Error starting audio capture:', error);
    chrome.runtime.sendMessage({
      action: 'audioCaptureError',
      error: error.message
    });

    return false;
  }
}

/**
 * Stops audio capture and transcription
 */
function stopAudioCapture() {
  if (!isRecording) return true;

  // Clear silence detection timer
  if (silenceTimer) {
    clearTimeout(silenceTimer);
    silenceTimer = null;
  }

  // Stop media recorder
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    try {
      mediaRecorder.stop();
    } catch (e) {
      console.error('Error stopping media recorder:', e);
    }
  }

  // Stop audio context
  if (audioContext && audioContext.state !== 'closed') {
    try {
      audioContext.close();
    } catch (e) {
      console.error('Error closing audio context:', e);
    }
  }

  // Stop all tracks in the stream
  if (microphoneStream) {
    microphoneStream.getTracks().forEach(track => track.stop());
    microphoneStream = null;
  }

  // Stop speech recognition
  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {
      console.error('Error stopping speech recognition:', e);
    }
  }

  // Reset state
  isRecording = false;
  analyser = null;
  audioContext = null;

  // Notify service worker
  chrome.runtime.sendMessage({
    action: 'audioCaptureEnded',
    transcriptionHistory: transcriptionHistory
  });

  return true;
}

/**
 * Gets the current transcription status
 */
function getTranscriptionStatus() {
  return {
    isRecording,
    transcriptionLanguage,
    useExternalSTT,
    externalSTTProvider,
    hasRecognition: !!recognition,
    transcriptionHistoryLength: transcriptionHistory.length
  };
}

/**
 * Clears the transcription history
 */
function clearTranscriptionHistory() {
  transcriptionHistory = [];
  return true;
}

/**
 * Updates transcription settings
 */
function updateTranscriptionSettings(settings) {
  if (settings.language) {
    transcriptionLanguage = settings.language;
    if (recognition) {
      recognition.lang = transcriptionLanguage;
    }
  }

  if (settings.silenceThreshold !== undefined) {
    silenceDetectionThreshold = settings.silenceThreshold;
  }

  if (settings.silenceTimeout !== undefined) {
    silenceTimeout = settings.silenceTimeout;
  }

  if (settings.useExternalSTT !== undefined) {
    useExternalSTT = settings.useExternalSTT;
  }

  return true;
}

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Offscreen document received message:', message);

  switch (message.action) {
    case 'startAudioCapture':
      startAudioCapture().then(success => {
        sendResponse({ success });
      });
      return true; // Keep the message channel open for async response

    case 'stopAudioCapture':
      const success = stopAudioCapture();
      sendResponse({ success });
      break;

    case 'getTranscriptionStatus':
      sendResponse(getTranscriptionStatus());
      break;

    case 'clearTranscriptionHistory':
      sendResponse({ success: clearTranscriptionHistory() });
      break;

    case 'updateTranscriptionSettings':
      sendResponse({
        success: updateTranscriptionSettings(message.settings || {})
      });
      break;

    case 'getTranscriptionHistory':
      sendResponse({
        history: transcriptionHistory.slice(
          message.startIndex || 0,
          message.endIndex || transcriptionHistory.length
        )
      });
      break;
  }
});

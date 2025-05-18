# Developer Notes for CandidAI

This document provides technical notes and explanations for developers working on or extending the CandidAI Chrome extension. It covers architecture decisions, complex implementations, and best practices.

## Architecture Overview

CandidAI follows a modular architecture with several key components:

1. **Service Worker**: Background script that manages the extension lifecycle and coordinates between components
2. **Side Panel**: Main UI for user interaction during interviews
3. **Options Page**: Configuration interface for settings and preferences
4. **Content Scripts**: Platform-specific scripts that integrate with web pages
5. **Offscreen Document**: Handles audio processing and transcription
6. **Service Modules**: Core functionality implemented as reusable services

### Communication Flow

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Content Script │◄────►│ Service Worker  │◄────►│   Side Panel    │
│                 │      │                 │      │                 │
└─────────────────┘      └────────┬────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │                 │
                         │    Offscreen    │
                         │    Document     │
                         │                 │
                         └─────────────────┘
```

Communication between components is primarily done using Chrome's message passing API:
- `chrome.runtime.sendMessage()` for sending messages
- `chrome.runtime.onMessage.addListener()` for receiving messages

## Key Implementation Details

### 1. Audio Capture and Processing

Audio capture is implemented using the Web Audio API in the offscreen document. This approach was chosen to ensure audio processing continues even when the side panel is not in focus.

```javascript
// Key implementation in offscreen.js
async function startAudioCapture() {
  try {
    // Get audio stream from user's microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Create audio context and source
    audioContext = new AudioContext();
    audioSource = audioContext.createMediaStreamSource(stream);
    
    // Create analyzer for silence detection
    analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 2048;
    audioSource.connect(analyzer);
    
    // Create processor for audio data
    processor = audioContext.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = processAudioData;
    analyzer.connect(processor);
    processor.connect(audioContext.destination);
    
    // Start recording
    isRecording = true;
  } catch (error) {
    console.error('Error starting audio capture:', error);
    throw error;
  }
}
```

**Important Notes:**
- The `ScriptProcessorNode` is deprecated but still used for compatibility
- We plan to migrate to `AudioWorkletNode` in a future update
- Silence detection is implemented to reduce unnecessary processing

### 2. LLM Orchestration

The LLM orchestrator manages interactions with different AI providers and implements fallback logic. It's designed to be extensible for adding new providers.

```javascript
// Key implementation in llmOrchestrator.js
async function generateResponse(prompt, options = {}) {
  try {
    // Get provider settings
    const settings = await getProviderSettings();
    
    // Determine which provider to use
    const provider = options.provider || settings.primaryProvider;
    
    // Get the appropriate provider module
    const providerModule = await getProviderModule(provider);
    
    // Generate response using the selected provider
    return await providerModule.generateResponse(prompt, options);
  } catch (error) {
    // If primary provider fails and fallback is configured, try fallback
    if (!options.provider && settings.fallbackProvider && settings.fallbackProvider !== 'none') {
      console.warn(`Primary provider failed, falling back to ${settings.fallbackProvider}`);
      
      // Get fallback provider module
      const fallbackModule = await getProviderModule(settings.fallbackProvider);
      
      // Generate response using fallback provider
      const response = await fallbackModule.generateResponse(prompt, options);
      
      // Mark response as coming from fallback
      response.usedFallback = true;
      response.originalProvider = settings.primaryProvider;
      
      return response;
    }
    
    // If no fallback or fallback also failed, rethrow the error
    throw error;
  }
}
```

**Important Notes:**
- Each provider has its own module with a consistent interface
- Provider-specific logic is encapsulated in the provider modules
- The orchestrator handles fallback logic and error handling

### 3. Platform Detection and Integration

Platform detection is implemented using content scripts that are injected into supported platforms. Each platform has a dedicated detector and integration module.

```javascript
// Key implementation in platformIntegration.js
function detectPlatform() {
  const url = window.location.href;
  
  if (url.includes('meet.google.com')) {
    return 'Google Meet';
  } else if (url.includes('zoom.us/')) {
    return 'Zoom';
  } else if (url.includes('teams.microsoft.com')) {
    return 'Microsoft Teams';
  } else if (url.includes('linkedin.com/jobs/')) {
    return 'LinkedIn Jobs';
  } else if (url.includes('linkedin.com/talent/')) {
    return 'LinkedIn Recruiter';
  } else if (url.includes('hirevue.com')) {
    return 'HireVue';
  }
  
  return null;
}
```

**Important Notes:**
- Platform-specific integration is loaded dynamically based on detection
- Each platform has custom DOM selectors and event handlers
- Platform detection runs on page load and URL changes

### 4. Context Management

The context manager maintains the current conversation context and manages entity extraction for personalized responses.

```javascript
// Key implementation in contextManager.js
function updateContext(newContext) {
  // Merge new context with existing context
  context = {
    ...context,
    ...newContext,
    updatedAt: new Date().toISOString()
  };
  
  // Extract entities from new context if applicable
  if (newContext.transcription) {
    extractEntities(newContext.transcription);
  }
  
  // Save updated context to storage
  saveContextToStorage();
  
  return context;
}
```

**Important Notes:**
- Context is used to personalize AI responses
- Entities (companies, roles, skills) are extracted from transcriptions
- Context is persisted across sessions using Chrome's storage API

### 5. Visual Analysis

The visual analyzer captures and analyzes screen content using a combination of screen capture APIs and OCR.

```javascript
// Key implementation in visualAnalyzer.js
async function captureScreen() {
  try {
    // Request screen capture permission if needed
    const hasPermission = await checkCapturePermission();
    if (!hasPermission) {
      const permissionGranted = await requestCapturePermission();
      if (!permissionGranted) {
        throw new Error('Screen capture permission denied');
      }
    }
    
    // Get display media stream
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: 'screen' }
    });
    
    // Create video element to capture frame
    const video = document.createElement('video');
    video.srcObject = stream;
    
    // Wait for video to load
    await new Promise(resolve => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });
    
    // Capture frame to canvas
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Stop all tracks
    stream.getTracks().forEach(track => track.stop());
    
    // Convert canvas to data URL
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Store the captured image
    lastCapturedImage = imageData;
    
    // Return the image data
    return imageData;
  } catch (error) {
    console.error('Error capturing screen:', error);
    throw error;
  }
}
```

**Important Notes:**
- Screen capture requires user permission
- OCR is performed using Tesseract.js
- Analysis is performed using the LLM orchestrator

## Extension Permissions

CandidAI requires several permissions to function properly:

- `sidePanel`: Required for the side panel UI
- `storage`: Required for storing settings and data
- `offscreen`: Required for audio processing
- `notifications`: Required for alerts and reminders
- `scripting`: Required for content script injection
- `activeTab`: Required for accessing the current tab
- `desktopCapture` (optional): Required for visual analysis

**Important Notes:**
- The `desktopCapture` permission is requested only when needed
- Permissions are requested explicitly with clear explanations
- Users can deny optional permissions without breaking core functionality

## Testing Approach

CandidAI uses a comprehensive testing approach:

1. **Unit Tests**: Test individual functions and modules
2. **Integration Tests**: Test interactions between components
3. **End-to-End Tests**: Test the complete user flow

```javascript
// Example unit test for contextManager
describe('contextManager', () => {
  beforeEach(() => {
    // Reset the context manager state
    contextManager.reset();
  });
  
  describe('addMessage', () => {
    it('should add a user message to the conversation history', () => {
      contextManager.addMessage('user', 'Hello, world!');
      
      const history = contextManager.getConversationHistory();
      expect(history).toHaveLength(1);
      expect(history[0].role).toBe('user');
      expect(history[0].content).toBe('Hello, world!');
    });
  });
});
```

**Important Notes:**
- Tests are located in `__tests__` directories alongside the code they test
- Jest is used as the testing framework
- Mock implementations are provided for Chrome APIs and external services

## Performance Considerations

Several optimizations have been implemented to ensure good performance:

1. **Lazy Loading**: Non-critical modules are loaded on demand
2. **Throttling**: UI updates are throttled to reduce CPU usage
3. **Efficient Audio Processing**: Audio processing is optimized for low CPU usage
4. **Memory Management**: Resources are properly cleaned up when not needed

**Important Notes:**
- See [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) for detailed performance analysis
- Monitor CPU and memory usage when making changes
- Use the Chrome DevTools Performance panel for profiling

## Security Best Practices

CandidAI follows these security best practices:

1. **API Key Storage**: API keys are stored securely in Chrome's storage API
2. **Content Security Policy**: A strict CSP is implemented to prevent XSS attacks
3. **Input Validation**: All user input is validated before use
4. **Secure Communication**: All API requests use HTTPS
5. **Minimal Permissions**: Only necessary permissions are requested

**Important Notes:**
- See [SECURITY_AUDIT.md](SECURITY_AUDIT.md) for detailed security analysis
- Follow the same security practices when making changes
- Report any security concerns immediately

## Contribution Guidelines

When contributing to CandidAI, please follow these guidelines:

1. **Code Style**: Follow the existing code style and use ESLint/Prettier
2. **Documentation**: Document complex functions and update this guide as needed
3. **Testing**: Write tests for new functionality
4. **Performance**: Consider performance implications of changes
5. **Security**: Follow security best practices

**Important Notes:**
- Run tests before submitting pull requests
- Update documentation when changing functionality
- Consider backward compatibility when making changes

## Future Development

Planned future enhancements include:

1. **WebAssembly Audio Processing**: Migrate to WebAssembly for more efficient audio processing
2. **Offline Capabilities**: Add support for offline operation with local models
3. **Additional Platform Integrations**: Support for more job platforms and video conferencing services
4. **Enhanced Analytics**: More detailed performance analytics and insights
5. **Accessibility Improvements**: Enhanced support for screen readers and keyboard navigation

**Important Notes:**
- Maintain compatibility with existing features when implementing new ones
- Consider extensibility in design decisions
- Document new features thoroughly

# CandidAI Chrome Extension Architecture Design

## 1. Overview

This document outlines the architecture design for the CandidAI Chrome extension, which provides real-time AI assistance during job interviews. The architecture is designed to be modular, secure, and maintainable, with clear separation of concerns and well-defined interfaces between components.

## 2. High-Level Architecture

The CandidAI Chrome extension follows a modular architecture with several key components that communicate through well-defined interfaces. The high-level architecture is illustrated below:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Chrome Extension                              │
│                                                                         │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────────┐    │
│  │             │     │             │     │                         │    │
│  │  Service    │◄───►│  Side Panel │◄───►│      Options Page       │    │
│  │  Worker     │     │             │     │                         │    │
│  │             │     └─────────────┘     └─────────────────────────┘    │
│  │             │                                                        │
│  │             │     ┌─────────────┐     ┌─────────────────────────┐    │
│  │             │◄───►│  Offscreen  │     │                         │    │
│  │             │     │  Document   │◄───►│    Content Scripts      │    │
│  └─────────────┘     │             │     │                         │    │
│        ▲ ▼           └─────────────┘     └─────────────────────────┘    │
│                                                                         │
└─────────┬───────────────────────────────────────────┬─────────────────┬─┘
          │                                           │                 │
          ▼                                           ▼                 ▼
┌─────────────────┐                         ┌─────────────────┐  ┌─────────────────┐
│                 │                         │                 │  │                 │
│  LLM Provider   │                         │  Speech-to-Text │  │  Local Storage  │
│  APIs           │                         │  APIs           │  │                 │
│                 │                         │                 │  │                 │
└─────────────────┘                         └─────────────────┘  └─────────────────┘
```

## 3. Component Architecture

### 3.1 Service Worker (`src/background/service-worker.js`)

The Service Worker is the central coordinator of the extension, managing the lifecycle and communication between components.

#### Responsibilities:
- Extension lifecycle management
- Message routing between components
- API key management and secure storage
- Background state management
- Offscreen document lifecycle management
- Event handling for browser actions

#### Key Interfaces:
- `chrome.runtime.onMessage` listener for internal communication
- `chrome.sidePanel.setPanelBehavior` for side panel management
- `chrome.offscreen` API for offscreen document management
- `chrome.storage` API for persistent storage

### 3.2 Side Panel (`src/sidepanel/`)

The Side Panel provides the main user interface during interviews, displaying transcriptions, suggestions, and the chat interface.

#### Responsibilities:
- Display real-time transcriptions
- Show AI-generated suggestions
- Provide chat interface for user queries
- Manage UI state and transitions
- Handle user interactions
- Display visual analysis results

#### Key Components:
- `sidepanel.html`: Main HTML structure
- `sidepanel.js`: Core functionality and state management
- `sidepanel.css`: Styling for the side panel
- `components/`: Reusable UI components
  - `TranscriptionView.js`: Displays real-time transcriptions
  - `SuggestionView.js`: Displays AI-generated suggestions
  - `ChatInterface.js`: Handles user chat interactions
  - `VisualAnalysis.js`: Manages screen capture and analysis

### 3.3 Options Page (`src/options/`)

The Options Page provides a comprehensive interface for configuring the extension.

#### Responsibilities:
- API key management
- Resume and job description management
- LLM provider configuration
- Language and accessibility settings
- Performance hub access
- Calendar integration management

#### Key Components:
- `options.html`: Main HTML structure
- `options.js`: Core functionality and state management
- `options.css`: Styling for the options page
- `sections/`: Modular sections of the options page
  - `ApiKeyManager.js`: Manages API keys
  - `ResumeManager.js`: Handles resume upload and parsing
  - `ProviderSettings.js`: Configures LLM providers
  - `LanguageSettings.js`: Manages language preferences
  - `PerformanceHub.js`: Access to interview history and analytics

### 3.4 Offscreen Document (`src/offscreen/`)

The Offscreen Document handles audio processing and other tasks requiring DOM access.

#### Responsibilities:
- Audio capture and processing
- Speech-to-text conversion
- Silence detection
- Audio visualization (if needed)
- Background processing tasks

#### Key Components:
- `offscreen.html`: Minimal HTML structure
- `offscreen.js`: Core functionality for audio processing
- `services/`: Audio processing services
  - `AudioCapture.js`: Handles microphone access and audio capture
  - `SilenceDetector.js`: Detects silence in audio stream
  - `SpeechToText.js`: Converts audio to text

### 3.5 Content Scripts (`src/content/`)

Content Scripts integrate with web pages to detect platforms and inject necessary functionality.

#### Responsibilities:
- Platform detection
- DOM integration
- Event handling for page interactions
- UI injection (if not using Side Panel)

#### Key Components:
- `content.js`: Main content script for all pages
- `platforms/`: Platform-specific integration
  - `GoogleMeet.js`: Integration with Google Meet
  - `Zoom.js`: Integration with Zoom
  - `MicrosoftTeams.js`: Integration with Microsoft Teams
  - `LinkedIn.js`: Integration with LinkedIn
  - `HireVue.js`: Integration with HireVue

## 4. Service Modules (`src/js/services/`)

### 4.1 LLM Orchestrator (`src/js/services/llmOrchestrator.js`)

The LLM Orchestrator manages interactions with different LLM providers.

#### Responsibilities:
- Provider selection and fallback logic
- API key management
- Prompt optimization
- Response processing
- Token usage tracking

#### Key Components:
- `ProviderManager.js`: Manages available providers
- `PromptManager.js`: Optimizes prompts for different providers
- `ResponseProcessor.js`: Processes and standardizes responses
- `TokenCounter.js`: Tracks token usage

### 4.2 Context Manager (`src/js/services/contextManager.js`)

The Context Manager maintains conversation context and manages entity extraction.

#### Responsibilities:
- Maintain conversation history
- Extract entities from transcriptions
- Manage resume and job description context
- Provide context for LLM prompts

#### Key Components:
- `EntityExtractor.js`: Extracts entities from text
- `ContextStorage.js`: Manages persistent storage of context
- `ContextMerger.js`: Merges new context with existing context

### 4.3 Resume Parser (`src/js/services/resumeParser.js`)

The Resume Parser extracts structured information from resumes.

#### Responsibilities:
- Parse PDF and DOCX files
- Extract key sections (experience, skills, education)
- Structure data for LLM context
- Provide search and retrieval functionality

#### Key Components:
- `PdfParser.js`: Parses PDF files
- `DocxParser.js`: Parses DOCX files
- `SectionExtractor.js`: Identifies and extracts resume sections
- `SkillExtractor.js`: Extracts skills from resume text

### 4.4 Visual Analyzer (`src/js/services/visualAnalyzer.js`)

The Visual Analyzer captures and analyzes screen content.

#### Responsibilities:
- Screen capture
- OCR processing
- Image analysis
- LLM integration for visual understanding

#### Key Components:
- `ScreenCapture.js`: Captures screen content
- `OcrProcessor.js`: Performs OCR on images
- `ImageAnalyzer.js`: Analyzes image content
- `VisualPromptGenerator.js`: Generates LLM prompts for visual content

### 4.5 Performance Analyzer (`src/js/services/performanceAnalyzer.js`)

The Performance Analyzer tracks and analyzes interview performance.

#### Responsibilities:
- Store interview history
- Generate performance metrics
- Provide coaching tips
- Create interview summaries

#### Key Components:
- `InterviewRecorder.js`: Records interview data
- `MetricsCalculator.js`: Calculates performance metrics
- `CoachingGenerator.js`: Generates coaching tips
- `SummaryGenerator.js`: Creates interview summaries

## 5. API Modules (`src/js/api/`)

### 5.1 OpenAI Provider (`src/js/api/openai.js`)

Handles interactions with the OpenAI API.

#### Responsibilities:
- API authentication
- Request formatting
- Response parsing
- Error handling
- Token counting

### 5.2 Anthropic Provider (`src/js/api/anthropic.js`)

Handles interactions with the Anthropic API.

#### Responsibilities:
- API authentication
- Request formatting
- Response parsing
- Error handling
- Token counting

### 5.3 Google Provider (`src/js/api/gemini.js`)

Handles interactions with the Google Gemini API.

#### Responsibilities:
- API authentication
- Request formatting
- Response parsing
- Error handling
- Token counting

### 5.4 Speech-to-Text Provider (`src/js/api/speechToText.js`)

Handles interactions with Speech-to-Text APIs.

#### Responsibilities:
- API authentication
- Audio data formatting
- Response parsing
- Error handling
- Language detection and selection

## 6. Utility Modules (`src/js/utils/`)

Utility modules provide common, reusable functionalities across different parts of the extension.

### 6.1 Secure Storage (`src/js/utils/storage.js`)

The Secure Storage module is responsible for managing the local storage of sensitive data, such as API keys and user preferences, ensuring robust encryption and data integrity.

#### Responsibilities:
-   **Data Encryption**: Encrypt data before storing it in `chrome.storage.local`.
-   **Data Decryption**: Decrypt data when retrieved from `chrome.storage.local`.
-   **Key Management**: Securely manage encryption keys (potentially derived or user-provided, handled with care).
-   **CRUD Operations**: Provide simple and secure methods for creating, reading, updating, and deleting stored items.
-   **Data Integrity**: Optionally implement checks to ensure data has not been tampered with.
-   **Abstraction**: Abstract the underlying `chrome.storage` API, providing a cleaner interface for other modules.

#### Key Interfaces:
-   `async get(key)`: Retrieves and decrypts data for a given key.
-   `async set(key, value)`: Encrypts and stores data for a given key.
-   `async remove(key)`: Removes data for a given key.
-   `async clearAll()`: Clears all data managed by the secure storage module (use with caution).

#### Security Considerations:
-   Uses strong encryption algorithms.
-   Minimizes the time sensitive data is held in memory in its decrypted state.
-   Follows best practices for key management to prevent unauthorized access.

### 6.2 Message Utils (`src/js/utils/messaging.js`)

Provides utilities for message passing between components.

#### Responsibilities:
- Structured message formatting
- Message routing
- Response handling
- Error handling

### 6.3 Security Utils (`src/js/utils/security.js`)

Provides utilities for security-related functionality.

#### Responsibilities:
- API key encryption/decryption
- Input validation
- Content security
- Error handling

### 6.4 UI Utils (`src/js/utils/ui.js`)

Provides utilities for UI-related functionality.

#### Responsibilities:
- Theme management
- Responsive design helpers
- Accessibility helpers
- UI state management

## 7. Data Flow

### 7.1 Interview Session Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Content    │────►│  Offscreen  │────►│  Service    │────►│  Side Panel │
│  Script     │     │  Document   │     │  Worker     │     │             │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                    │                   │                   │
      │                    │                   │                   │
      ▼                    ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Platform   │     │  Audio      │     │  LLM        │     │  UI         │
│  Detection  │     │  Processing │     │  Orchestrator│     │  Rendering  │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

1. Content Script detects the platform and notifies Service Worker
2. Service Worker creates Offscreen Document for audio processing
3. Offscreen Document captures and processes audio
4. Processed audio is sent to Speech-to-Text service
5. Transcription is sent to Service Worker
6. Service Worker sends transcription to LLM Orchestrator
7. LLM Orchestrator generates suggestions
8. Suggestions are sent to Side Panel for display

### 7.2 LLM Request Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Service    │────►│  LLM        │────►│  Provider   │────►│  LLM API    │
│  Worker     │     │  Orchestrator│     │  Manager    │     │             │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      ▲                    │                   │                   │
      │                    │                   │                   │
      │                    ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Response   │◄────│  Response   │◄────│  Provider   │◄────│  API        │
│  Processing │     │  Processor  │     │  Interface  │     │  Response   │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

1. Service Worker sends request to LLM Orchestrator
2. LLM Orchestrator retrieves context from Context Manager
3. Provider Manager selects appropriate provider
4. Prompt Manager optimizes prompt for selected provider
5. Request is sent to LLM API via Provider Interface
6. Response is received from LLM API
7. Response Processor standardizes the response
8. Processed response is returned to Service Worker

## 8. Storage Design

### 8.1 API Keys Storage

API keys are stored securely in `chrome.storage.local` with the following structure:

```javascript
{
  "llmApiKeys": {
    "openai": "sk-...",
    "anthropic": "sk-ant-...",
    "gemini": "..."
  }
}
```

### 8.2 User Preferences Storage

User preferences are stored in `chrome.storage.local` with the following structure:

```javascript
{
  "llmPreferences": {
    "preferredProvider": "openai",
    "fallbackOrder": ["anthropic", "gemini"],
    "modelPreferences": {
      "openai": "gpt-3.5-turbo",
      "anthropic": "claude-3-sonnet-20240229",
      "gemini": "gemini-pro"
    }
  },
  "uiPreferences": {
    "theme": "light",
    "fontSize": "medium",
    "autoScroll": true,
    "language": "en"
  },
  "transcriptionPreferences": {
    "language": "en-US",
    "useExternalStt": false,
    "silenceThreshold": 0.2,
    "silenceDuration": 1.5
  },
  "responsePreferences": {
    "tone": "professional",
    "length": "medium",
    "detailLevel": "high"
  }
}
```

### 8.3 Resume and Job Description Storage

Resume and job description data are stored in `chrome.storage.local` with the following structure:

```javascript
{
  "resumeData": {
    "raw": "...", // Raw text of the resume
    "structured": {
      "personalInfo": { ... },
      "experience": [ ... ],
      "education": [ ... ],
      "skills": [ ... ],
      "projects": [ ... ]
    },
    "fileName": "resume.pdf",
    "lastUpdated": "2023-06-01T12:00:00Z"
  },
  "jobDescriptions": [
    {
      "id": "job1",
      "title": "Software Engineer",
      "company": "Example Corp",
      "description": "...",
      "requirements": [ ... ],
      "responsibilities": [ ... ],
      "lastUpdated": "2023-06-01T12:00:00Z"
    }
  ]
}
```

### 8.4 Interview History Storage

Interview history is stored in `chrome.storage.local` with the following structure:

```javascript
{
  "interviewHistory": [
    {
      "id": "interview1",
      "date": "2023-06-01T12:00:00Z",
      "company": "Example Corp",
      "position": "Software Engineer",
      "duration": 3600, // seconds
      "platform": "Google Meet",
      "transcription": [ ... ],
      "questions": [ ... ],
      "suggestions": [ ... ],
      "performance": {
        "clarity": 0.8,
        "relevance": 0.9,
        "fillerWords": 12,
        "overallScore": 0.85
      },
      "notes": "..."
    }
  ]
}
```

### 8.5 Context Storage

Context data is stored in `chrome.storage.local` with the following structure:

```javascript
{
  "currentContext": {
    "conversationHistory": [ ... ],
    "detectedEntities": {
      "companies": [ ... ],
      "roles": [ ... ],
      "skills": [ ... ],
      "interviewers": [ ... ]
    },
    "currentQuestion": "...",
    "currentPlatform": "Google Meet",
    "updatedAt": "2023-06-01T12:00:00Z"
  }
}
```

## 9. Security Considerations

### 9.1 API Key Security

- API keys are stored securely in `chrome.storage.local` using the `js/utils/storage.js` module, which handles encryption and decryption.
- The `js/utils/storage.js` module provides a dedicated interface for all sensitive data storage, ensuring that raw keys are not directly handled by other parts of the extension where possible.
- Keys are never exposed in the DOM or transmitted unnecessarily.
- Options for server-side key management in future versions.

### 9.2 Data Privacy

- Audio processing is done locally when possible
- Minimal data is sent to external services
- Clear privacy policy and user consent for data processing
- Option to delete all stored data

### 9.3 Content Security Policy

- Strict CSP to prevent XSS attacks
- Minimal use of inline scripts
- Careful validation of all inputs
- Secure communication with external services

### 9.4 Permission Management

- Request only necessary permissions
- Clear explanations for each permission request
- Graceful degradation when permissions are denied
- Optional permissions requested only when needed

## 10. UI/UX Architecture

### 10.1 Side Panel UI

The Side Panel UI is organized into several tabs:

1. **Interview Assistant**: Main tab for interview assistance
   - Transcription section
   - Suggestions section
   - Chat interface

2. **Visual Analysis**: Tab for visual analysis features
   - Screen capture button
   - Image display area
   - Analysis results

3. **Settings**: Quick access to common settings
   - Toggle for listening
   - Language selection
   - Theme toggle

### 10.2 Options Page UI

The Options Page UI is organized into several sections:

1. **API Keys**: Management of LLM API keys
2. **Resume & Job Context**: Upload and management of resume and job descriptions
3. **LLM Configuration**: Selection of preferred LLM providers and models
4. **Transcription**: Configuration of transcription settings
5. **Response Style**: Configuration of AI response style
6. **Language**: Selection of interface and response languages
7. **Accessibility**: Configuration of accessibility settings
8. **Performance Hub**: Access to interview history and analytics
9. **Calendar**: Management of interview schedule

### 10.3 Theme System

The theme system uses CSS custom properties for consistent styling:

```css
:root {
  /* Colors */
  --primary-color: #4285f4;
  --secondary-color: #34a853;
  --background-color: #ffffff;
  --text-color: #202124;
  --border-color: #dadce0;
  
  /* Typography */
  --font-family: 'Nunito', sans-serif;
  --font-size-small: 12px;
  --font-size-medium: 14px;
  --font-size-large: 16px;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  /* Borders */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
}

[data-theme="dark"] {
  --primary-color: #8ab4f8;
  --secondary-color: #81c995;
  --background-color: #202124;
  --text-color: #e8eaed;
  --border-color: #5f6368;
}
```

## 11. Error Handling Strategy

### 11.1 Error Types

- **AuthenticationError**: Invalid or missing API key
- **RateLimitError**: Provider rate limit exceeded
- **QuotaError**: User quota or credits exhausted
- **ContentFilterError**: Content filtered by provider
- **NetworkError**: Network-related issues
- **TimeoutError**: Request timeout
- **ServiceError**: Provider service error
- **UnknownError**: Other unexpected errors

### 11.2 Error Handling Approach

- **Retry Logic**: Implement exponential backoff for retryable errors
- **Fallback Logic**: Switch to fallback provider for non-retryable errors
- **User Feedback**: Provide clear error messages to the user
- **Logging**: Log errors for debugging and improvement
- **Graceful Degradation**: Maintain core functionality when possible

## 12. Implementation Plan

### 12.1 Phase 1: Core Infrastructure

1. Set up project structure
2. Implement manifest.json
3. Create service worker
4. Implement side panel UI skeleton
5. Implement options page skeleton
6. Set up message passing between components

### 12.2 Phase 2: Audio Processing

1. Implement offscreen document
2. Implement audio capture
3. Implement speech-to-text integration
4. Implement transcription display

### 12.3 Phase 3: LLM Integration

1. Implement LLM orchestrator
2. Implement provider interfaces
3. Implement context manager
4. Implement suggestion generation

### 12.4 Phase 4: Platform Integration

1. Implement platform detection
2. Implement Google Meet integration
3. Implement Zoom integration
4. Implement Microsoft Teams integration

### 12.5 Phase 5: Advanced Features

1. Implement resume parsing
2. Implement visual analysis
3. Implement performance hub
4. Implement calendar integration

### 12.6 Phase 6: Polish and Testing

1. Implement themes and responsive design
2. Implement accessibility features
3. Comprehensive testing
4. Performance optimization

## 13. Conclusion

This architecture design provides a comprehensive blueprint for implementing the CandidAI Chrome extension. The modular design ensures that components can be developed and tested independently, while the well-defined interfaces enable seamless integration. The security considerations and error handling strategy ensure a robust and reliable user experience.

The implementation plan outlines a phased approach to development, allowing for incremental testing and validation. By following this architecture, the development team can create a powerful and user-friendly extension that meets all the requirements specified in the PRD.

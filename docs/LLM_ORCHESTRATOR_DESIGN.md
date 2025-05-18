# LLM Orchestrator Design

This document outlines the design for the LLM Orchestrator system in CandidAI, which will manage interactions with different LLM providers.

## 1. System Overview

The LLM Orchestrator is a central service that:
- Provides a unified interface for interacting with different LLM providers
- Manages API keys and provider selection
- Handles fallback logic when a provider fails
- Optimizes prompts for different providers
- Tracks token usage and manages rate limits

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     LLM Orchestrator                        │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │ Provider    │    │ Prompt      │    │ Response    │     │
│  │ Manager     │    │ Manager     │    │ Processor   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                  │                  │            │
│         ▼                  ▼                  ▼            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                Provider Interface                    │   │
│  └─────────────────────────────────────────────────────┘   │
│         │                  │                  │            │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ OpenAI       │    │ Anthropic    │    │ Google       │
│ Provider     │    │ Provider     │    │ Provider     │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 2.2 Key Components

#### 2.2.1 LLM Orchestrator (`src/js/services/llmOrchestrator.js`)
- Main entry point for LLM interactions
- Manages provider selection and fallback logic
- Tracks token usage and rate limits

#### 2.2.2 Provider Manager
- Manages available providers and their configurations
- Handles API key retrieval and validation
- Selects appropriate provider based on user preferences and availability

#### 2.2.3 Prompt Manager
- Optimizes prompts for different providers
- Manages system prompts and user messages
- Handles context window limitations

#### 2.2.4 Response Processor
- Processes and standardizes responses from different providers
- Handles error cases and retries
- Extracts relevant information from responses

#### 2.2.5 Provider Interface
- Abstract interface that all provider implementations must follow
- Ensures consistent behavior across providers

#### 2.2.6 Provider Implementations
- OpenAI Provider (`src/js/api/openai.js`)
- Anthropic Provider (`src/js/api/anthropic.js`)
- Google Provider (`src/js/api/gemini.js`)

## 3. Data Flow

### 3.1 Request Flow

1. Client calls `llmOrchestrator.generateResponse(prompt, options)`
2. Orchestrator retrieves user preferences and API keys
3. Provider Manager selects appropriate provider
4. Prompt Manager optimizes the prompt for the selected provider
5. Request is sent to the provider
6. Response is processed by Response Processor
7. Standardized response is returned to the client

### 3.2 Fallback Flow

1. If primary provider fails (API error, rate limit, etc.)
2. Provider Manager selects next provider in fallback order
3. Prompt is re-optimized for new provider
4. Request is sent to fallback provider
5. Process continues until successful response or all providers fail
6. If all providers fail, error is returned to client

## 4. API Design

### 4.1 LLM Orchestrator API

```javascript
class LLMOrchestrator {
  // Initialize the orchestrator
  async initialize();
  
  // Generate a response to a prompt
  async generateResponse(prompt, options = {});
  
  // Generate a response to an interview question
  async generateInterviewResponse(question, context = {});
  
  // Set the preferred LLM provider
  setPreferredProvider(provider);
  
  // Set the fallback order for LLM providers
  setFallbackOrder(order);
  
  // Get available providers
  getAvailableProviders();
  
  // Get token usage statistics
  getTokenUsage();
}
```

### 4.2 Provider Interface

```javascript
class LLMProvider {
  // Initialize the provider with API key
  constructor(apiKey);
  
  // Check if the provider is ready
  async isReady();
  
  // Generate a response
  async generateResponse(messages, options = {});
  
  // Count tokens in a message
  countTokens(text);
  
  // Get provider capabilities
  getCapabilities();
}
```

## 5. Storage Design

### 5.1 API Keys Storage

API keys will be stored in `chrome.storage.local` with the following structure:

```javascript
{
  "llmApiKeys": {
    "openai": "sk-...",
    "anthropic": "sk-ant-...",
    "gemini": "..."
  }
}
```

### 5.2 User Preferences Storage

User preferences will be stored in `chrome.storage.local` with the following structure:

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
  }
}
```

### 5.3 Usage Tracking Storage

Usage statistics will be stored in `chrome.storage.local` with the following structure:

```javascript
{
  "llmUsage": {
    "openai": {
      "inputTokens": 1000,
      "outputTokens": 500,
      "requests": 10,
      "lastRequest": "2023-06-01T12:00:00Z"
    },
    "anthropic": {
      // Similar structure
    },
    "gemini": {
      // Similar structure
    }
  }
}
```

## 6. Error Handling

### 6.1 Error Types

- **AuthenticationError**: Invalid or missing API key
- **RateLimitError**: Provider rate limit exceeded
- **QuotaError**: User quota or credits exhausted
- **ContentFilterError**: Content filtered by provider
- **NetworkError**: Network-related issues
- **TimeoutError**: Request timeout
- **ServiceError**: Provider service error
- **UnknownError**: Other unexpected errors

### 6.2 Error Handling Strategy

1. **Retry Logic**: Implement exponential backoff for retryable errors
2. **Fallback Logic**: Switch to fallback provider for non-retryable errors
3. **User Feedback**: Provide clear error messages to the user
4. **Logging**: Log errors for debugging and improvement

## 7. Security Considerations

1. **API Key Storage**: Store API keys securely in `chrome.storage.local`
2. **Minimal Permissions**: Request only necessary permissions
3. **Data Handling**: Minimize data sent to LLM providers
4. **Error Messages**: Avoid exposing sensitive information in error messages

## 8. Implementation Plan

1. Create base Provider Interface
2. Implement OpenAI Provider
3. Implement LLM Orchestrator with single provider support
4. Add API key management in Options Page
5. Implement Anthropic Provider
6. Implement Google Provider
7. Add provider selection and fallback logic
8. Implement usage tracking and reporting

## 9. Future Enhancements

1. **Caching**: Cache common responses to reduce API calls
2. **Streaming**: Support streaming responses for real-time feedback
3. **Function Calling**: Implement function calling capabilities
4. **Local Models**: Support for local models (e.g., WebLLM)
5. **Advanced Prompt Management**: Template system for prompts
6. **Cost Optimization**: Smart routing based on cost and performance

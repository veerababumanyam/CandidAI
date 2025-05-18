# LLM Provider API Research

This document summarizes research on different LLM provider APIs for integration with CandidAI.

## 1. OpenAI API

### Overview
- **Models**: GPT-4, GPT-3.5-Turbo
- **API Type**: REST API
- **Documentation**: [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- **Client Library**: `openai` npm package

### Key Features
- **Chat Completions API**: Ideal for conversational applications
- **Function Calling**: Allows defining functions that the model can call
- **JSON Mode**: Ensures responses are valid JSON
- **Streaming**: Supports token-by-token streaming for real-time responses
- **Context Window**: Up to 128K tokens for GPT-4 Turbo

### Authentication
- API Key-based authentication
- Organization ID for multi-org accounts

### Pricing
- GPT-4 Turbo: $0.01/1K input tokens, $0.03/1K output tokens
- GPT-3.5 Turbo: $0.0005/1K input tokens, $0.0015/1K output tokens

### Rate Limits
- Tier-based rate limits (varies by account)
- Default: 3 RPM, 200 RPD for free tier

### Implementation Notes
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateResponse(prompt) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
  });
  
  return response.choices[0].message.content;
}
```

## 2. Google Gemini API

### Overview
- **Models**: Gemini Pro, Gemini Ultra
- **API Type**: REST API
- **Documentation**: [Google AI for Developers](https://ai.google.dev/docs)
- **Client Library**: `@google/generative-ai` npm package

### Key Features
- **Text Generation**: Similar to chat completions
- **Multimodal Capabilities**: Can process text, images, and other modalities
- **Safety Settings**: Configurable content filtering
- **Function Calling**: Similar to OpenAI's function calling

### Authentication
- API Key-based authentication
- Google Cloud Project integration

### Pricing
- Gemini Pro: $0.0025/1K input tokens, $0.0025/1K output tokens
- Gemini Ultra: $0.01875/1K input tokens, $0.01875/1K output tokens

### Rate Limits
- 60 QPM for Gemini Pro
- Higher limits available through Google Cloud

### Implementation Notes
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(API_KEY);

async function generateResponse(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  return response.text();
}
```

## 3. Anthropic API

### Overview
- **Models**: Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
- **API Type**: REST API
- **Documentation**: [Anthropic API Reference](https://docs.anthropic.com/claude/reference)
- **Client Library**: `@anthropic-ai/sdk` npm package

### Key Features
- **Messages API**: Conversational interface
- **System Prompts**: Detailed system instructions
- **Tool Use**: Similar to function calling
- **JSON Mode**: Structured output
- **Context Window**: Up to 200K tokens for Claude 3 Opus

### Authentication
- API Key-based authentication
- Version header required

### Pricing
- Claude 3 Opus: $0.015/1K input tokens, $0.075/1K output tokens
- Claude 3 Sonnet: $0.003/1K input tokens, $0.015/1K output tokens
- Claude 3 Haiku: $0.00025/1K input tokens, $0.00125/1K output tokens

### Rate Limits
- 5 RPM for free tier
- Higher limits for paid accounts

### Implementation Notes
```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: 'YOUR_API_KEY',
});

async function generateResponse(prompt) {
  const message = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    system: "You are a helpful AI assistant.",
    messages: [
      { role: 'user', content: prompt }
    ],
  });
  
  return message.content[0].text;
}
```

## Comparison and Recommendations

### Performance Comparison
- **Quality**: Claude 3 Opus ≈ GPT-4 > Gemini Ultra > Claude 3 Sonnet > GPT-3.5 > Claude 3 Haiku
- **Speed**: Claude 3 Haiku > GPT-3.5 > Gemini Pro > Claude 3 Sonnet > GPT-4 > Claude 3 Opus
- **Context Length**: Claude 3 (200K) > GPT-4 (128K) > Gemini Pro (32K)

### Cost Comparison
- **Most Affordable**: GPT-3.5 Turbo and Claude 3 Haiku
- **Mid-Range**: Gemini Pro and Claude 3 Sonnet
- **Premium**: GPT-4 and Claude 3 Opus

### Integration Complexity
- **Easiest**: OpenAI (mature SDK, extensive documentation)
- **Moderate**: Anthropic (good documentation, simpler API)
- **Most Complex**: Gemini (newer API, less community resources)

### Recommendation for CandidAI
1. **Primary Provider**: OpenAI GPT-3.5/GPT-4
   - Mature ecosystem
   - Strong performance
   - Extensive documentation
   - Reliable service

2. **Secondary Provider**: Anthropic Claude 3 Sonnet
   - Excellent context handling
   - Strong performance on interview-related tasks
   - Good documentation

3. **Tertiary Provider**: Google Gemini Pro
   - Cost-effective
   - Good integration with Google ecosystem
   - Multimodal capabilities for future features

### Implementation Strategy
- Implement a provider-agnostic interface
- Allow users to choose their preferred provider
- Implement fallback mechanisms
- Store API keys securely in `chrome.storage.local`
- Implement token counting and usage tracking

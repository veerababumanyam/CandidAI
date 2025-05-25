# CandidAI Chrome Extension Requirements Summary

## Overview

CandidAI is an innovative Chrome extension designed to assist job seekers during video interviews and throughout their job search process. The extension leverages advanced AI technology to provide real-time assistance during interviews, help analyze job descriptions, and organize the user's job search journey. This document summarizes the key requirements extracted from the product documentation.

## Functional Requirements

### Real-time Interview Assistance

CandidAI's primary function is to provide real-time support during video interviews. The extension automatically activates when a user joins a video call on supported platforms (Google Meet, Zoom, and Microsoft Teams). It continuously listens to the audio from the call and transcribes the conversation in real-time, with a focus on identifying questions directed at the candidate.

The system uses advanced Large Language Models (LLMs) to generate contextually relevant answer suggestions based on the detected questions. These suggestions are displayed in a side panel interface, allowing the user to quickly reference them during the interview. The suggestions are tailored based on the user's resume, the job description, and the ongoing conversation context.

The extension distinguishes between different types of questions (behavioral, technical, situational, experience-based) and provides appropriate suggestions for each type. For experience-related questions, it prioritizes information from the user's uploaded resume and job description to generate personalized and relevant answer points.

### AI-Powered Chat Interface

Beyond passive suggestions, CandidAI provides an interactive chat interface within the side panel. This allows users to ask follow-up questions or seek clarification on topics discussed during the interview. The chat interface is powered by the same LLM orchestration system that generates answer suggestions, ensuring consistency and context awareness.

The AI agent powering the chat understands the interview context by leveraging the user's resume, job description, and keywords from the ongoing conversation. This enables it to provide short, context-aware responses that are relevant to the specific interview situation.

### Resume and Job Description Integration

CandidAI allows users to upload their resume (in PDF or DOCX format) and optionally paste the job description for the role they are interviewing for. The extension parses and stores key information from these documents, including skills, experience, projects, education, key requirements, and responsibilities.

The system employs sophisticated analysis for accurate extraction and skill matching, enabling it to generate highly personalized suggestions when experience-related questions are asked. This integration ensures that the AI's responses are tailored to the user's specific background and the requirements of the position they are applying for.

### Contextual Understanding

The extension attempts to understand the broader context of the interview, including the job role, industry, company name, and interviewer names. This contextual awareness is derived from the conversation, page content, and any provided documents. The system uses this information to further tailor its suggestions for higher relevance.

### Visual Analysis for Assessments

CandidAI includes a visual analysis feature that allows users to capture screenshots of their current screen content, such as coding problems in online assessments or complex diagrams presented by interviewers. The system utilizes Optical Character Recognition (OCR) and image analysis in conjunction with LLMs to understand the visual content and provide relevant hints, explanations, code snippets, or problem-solving strategies.

### Calendar Integration and Interview Management

The extension offers calendar integration capabilities, allowing users to manually input relevant interview event details. The system can automatically detect scheduled interviews based on keywords or event details from the provided calendar information and provide reminders and prompts to activate CandidAI before a scheduled interview.

Additionally, the extension attempts to pre-load relevant job descriptions or company information if found in calendar event details or linked documents, ensuring that the AI has the necessary context when the interview begins.

### Performance Hub and Analytics

CandidAI includes a Performance Hub that securely stores interview history with user consent, including transcriptions, questions asked, suggestions offered, and user notes. The system generates post-interview summary reports, including key topics discussed and AI suggestions provided.

The Performance Hub also provides AI-powered analytics on interview performance, such as clarity of speech, common filler words, and response relevance. Based on this analysis, the system offers personalized coaching tips and feedback to help users improve their interview skills over time.

### Multi-Language Support

The extension supports real-time transcription, AI suggestion generation, and UI display in multiple languages, including English, Spanish, French, German, and Mandarin as initial targets, with a framework for adding more languages in the future. Users can select their preferred input and output languages for AI interactions, and the extension's interface (buttons, labels, settings) is fully internationalized.

### Automated Answering (Optional)

CandidAI provides an optional feature to vocalize AI-generated suggestions using Text-to-Speech (TTS), allowing the user to hear suggestions discreetly. For advanced users, there is an experimental option for the extension to articulate parts of, or full-generated answers directly into the call audio, simulating the user speaking. This feature is off by default, requires explicit user activation for each session, and has prominent visual indicators when active.

## Technical Requirements

### Chrome Extension Architecture

CandidAI is built as a Chrome extension using Manifest V3 for security and performance. The extension requires several permissions to function properly:

- `scripting`: To inject the sidebar UI and interact with page content
- `activeTab`: To access the content of the current active tab (the video call)
- `storage`: To store user settings, API keys, and potentially resume data
- `sidePanel`: For using the Chrome Side Panel API
- `notifications`: For providing user feedback
- `offscreen`: For audio processing and other background tasks requiring DOM access
- `desktopCapture` (optional): For visual analysis features

The extension follows a modular architecture with several key components:

1. **Service Worker**: Background script that manages the extension lifecycle and coordinates between components
2. **Side Panel**: Main UI for user interaction during interviews
3. **Options Page**: Configuration interface for settings and preferences
4. **Content Scripts**: Platform-specific scripts that integrate with web pages
5. **Offscreen Document**: Handles audio processing and transcription
6. **Service Modules**: Core functionality implemented as reusable services

### User Interface

The extension's primary interface is a discreet, collapsible side panel that opens automatically when the user clicks the extension icon in the Chrome toolbar. The side panel displays:

- An interactive chat area for conversing with the AI agent
- Transcribed questions (optional, for user reference)
- AI-generated answer suggestions, bullet points, or key talking points, with important keywords/phrases highlighted
- A clear distinction between answers derived from the resume and those from general LLM knowledge
- Option to copy suggestions quickly
- Minimalistic design to avoid distraction

The extension also includes a dedicated Options Page for configuration, including uploading/replacing/deleting the resume, pasting/editing the job description, securely entering and managing API keys, selecting preferred LLM models, and adjusting other settings.

### Audio Capture and Processing

Audio capture is implemented using the Web Audio API in an offscreen document, ensuring that audio processing continues even when the side panel is not in focus. The system focuses on low latency and high accuracy for spoken language in an interview context.

The audio processing pipeline includes:

1. Capturing audio from the user's microphone
2. Creating an audio context and source
3. Using an analyzer for silence detection
4. Processing audio data for transcription
5. Sending the processed audio to a Speech-to-Text (STT) service

### LLM Orchestration

CandidAI implements a sophisticated LLM orchestration system that manages interactions with different AI providers (OpenAI, Anthropic, Google) and implements fallback logic. The orchestrator provides a unified interface for interacting with different LLM providers, manages API keys and provider selection, handles fallback logic when a provider fails, optimizes prompts for different providers, and tracks token usage and rate limits.

The system supports multiple LLM providers, allowing users to choose their preferred service and set up fallback options. It implements efficient prompt engineering to get relevant answers for different question types and chat interactions, adaptable to different LLM APIs.

### Platform Detection and Integration

The extension includes platform detection capabilities that identify supported video conferencing platforms and job sites. Each platform has a dedicated detector and integration module that handles platform-specific DOM selectors and event handlers.

The platform detection runs on page load and URL changes, and platform-specific integration is loaded dynamically based on detection. This approach ensures that the extension works seamlessly across different supported platforms without requiring manual configuration.

### Context Management

The context manager maintains the current conversation context and manages entity extraction for personalized responses. It merges new context with existing context, extracts entities from transcriptions, and saves the updated context to storage.

The context is used to personalize AI responses, with entities (companies, roles, skills) extracted from transcriptions. This context is persisted across sessions using Chrome's storage API, ensuring continuity in the user experience.

### Security and Privacy

Security and privacy are paramount in CandidAI's design. The extension follows these security best practices:

1. **API Key Storage**: API keys are stored securely in Chrome's storage API
2. **Content Security Policy**: A strict CSP is implemented to prevent XSS attacks
3. **Input Validation**: All user input is validated before use
4. **Secure Communication**: All API requests use HTTPS
5. **Minimal Permissions**: Only necessary permissions are requested

User audio and resume data are highly sensitive, so all data processing is transparent to the user, with clear outlines of data handling practices in a privacy policy. Audio snippets are processed in real-time and not stored long-term to minimize data retention.

## Integration Requirements

### LLM API Integration

CandidAI integrates with multiple LLM providers, each with its own API characteristics:

1. **OpenAI API**:
   - Models: GPT-4, GPT-3.5-Turbo
   - Features: Chat Completions API, Function Calling, JSON Mode, Streaming
   - Authentication: API Key-based
   - Pricing: GPT-4 Turbo ($0.01/1K input tokens, $0.03/1K output tokens), GPT-3.5 Turbo ($0.0005/1K input tokens, $0.0015/1K output tokens)

2. **Google Gemini API**:
   - Models: Gemini Pro, Gemini Ultra
   - Features: Text Generation, Multimodal Capabilities, Safety Settings, Function Calling
   - Authentication: API Key-based
   - Pricing: Gemini Pro ($0.0025/1K input tokens, $0.0025/1K output tokens), Gemini Ultra ($0.01875/1K input tokens, $0.01875/1K output tokens)

3. **Anthropic API**:
   - Models: Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
   - Features: Messages API, System Prompts, Tool Use, JSON Mode
   - Authentication: API Key-based
   - Pricing: Claude 3 Opus ($0.015/1K input tokens, $0.075/1K output tokens), Claude 3 Sonnet ($0.003/1K input tokens, $0.015/1K output tokens), Claude 3 Haiku ($0.00025/1K input tokens, $0.00125/1K output tokens)

The extension implements a provider-agnostic interface, allows users to choose their preferred provider, implements fallback mechanisms, stores API keys securely, and implements token counting and usage tracking.

### Speech-to-Text Integration

CandidAI integrates with robust STT APIs (e.g., Google Cloud Speech-to-Text, AssemblyAI) or uses the browser-native Web Speech API via an Offscreen Document for accurate real-time transcription. The system focuses on low latency and high accuracy for spoken language in an interview context.

### Resume Parsing Integration

The extension utilizes libraries or services for parsing PDF and DOCX files to extract structured text. It develops logic to identify key sections such as work experience, skills, education, and projects, enabling the AI to provide personalized suggestions based on the user's background.

### Video Conferencing Platform Integration

CandidAI integrates with multiple video conferencing platforms, including Google Meet, Zoom (web version), and Microsoft Teams (web version). Each platform has custom DOM selectors and event handlers to ensure seamless integration.

Beyond general video call platforms, the extension provides targeted integrations with specific web-based job interview platforms (e.g., LinkedIn Recruiter calls, HireVue, Spark Hire) and attempts to automatically extract contextual information like job descriptions, company details, and interviewer profiles from these platforms to enrich AI suggestions.

## User Flow Requirements

### Initial Setup Flow

1. User installs the CandidAI Chrome extension
2. User clicks the extension icon to open the side panel
3. User is prompted to configure at least one LLM API key
4. User enters their API key(s) in the Settings page
5. User optionally uploads their resume and adds job descriptions
6. User saves their settings and returns to the main interface

### Interview Assistance Flow

1. User joins an interview meeting on a supported platform
2. User clicks the CandidAI icon to open the side panel
3. CandidAI automatically detects the platform being used
4. User clicks "Start Listening" to begin audio capture and transcription
5. The conversation is transcribed in real-time, with questions automatically detected
6. When a question is detected, CandidAI generates a suggested response
7. User references the suggestion while formulating their own answer
8. User can optionally use the chat interface to ask follow-up questions or seek clarification
9. User can optionally use the automated answering feature to have suggestions spoken aloud

### Visual Analysis Flow

1. User encounters a visual element during the interview (e.g., a coding problem, diagram)
2. User clicks the "Visual Analysis" tab in the side panel
3. User clicks "Capture Screen" to take a screenshot
4. CandidAI analyzes the captured image and provides insights
5. User references the analysis while responding to the interviewer

### Performance Review Flow

1. After the interview, user opens the Performance Hub
2. User reviews the interview summary, including questions, answers, and AI suggestions
3. User examines performance metrics and coaching tips
4. User makes notes for future improvement
5. User can access past interviews for reference and comparison

These comprehensive requirements form the foundation for developing the CandidAI Chrome extension, ensuring that it meets the needs of job seekers and provides valuable assistance throughout the interview process.

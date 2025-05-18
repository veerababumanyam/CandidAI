# End-to-End (E2E) Testing Guide for CandidAI

This document provides a comprehensive guide for conducting end-to-end testing of the CandidAI Chrome extension across supported platforms.

## Prerequisites

- Chrome browser (latest version recommended)
- CandidAI extension installed in developer mode
- Access to Google Meet, Zoom, and Microsoft Teams
- Valid API keys for OpenAI, Anthropic, and/or Google (at least one)
- Microphone access

## General Testing Flow

For each platform (Google Meet, Zoom, Microsoft Teams), follow these testing steps:

1. **Extension Installation**
   - Load the extension in developer mode
   - Verify the extension icon appears in the Chrome toolbar
   - Click the extension icon to open the side panel

2. **Initial Setup**
   - Navigate to the options page
   - Configure API keys
   - Set preferred LLM provider
   - Configure transcription settings
   - Save settings and verify they persist after page reload

3. **Basic Functionality**
   - Open the side panel
   - Verify UI elements are displayed correctly
   - Test theme toggle
   - Test transcription visibility toggle
   - Test copy to clipboard functionality

4. **Platform-Specific Testing**
   - Join a meeting on the platform
   - Verify platform detection
   - Test audio capture and transcription
   - Test LLM response generation
   - Test automated answering features

## Platform-Specific Test Cases

### Google Meet

1. **Meeting Setup**
   - Create a new Google Meet meeting
   - Join the meeting
   - Verify CandidAI detects Google Meet

2. **Audio Capture**
   - Click "Start Listening" in the side panel
   - Speak a test question (e.g., "Tell me about your experience with project management")
   - Verify the question is transcribed correctly
   - Verify an LLM response is generated

3. **Automated Answering**
   - Select the generated response
   - Click the "Speak" button
   - Verify the response is spoken aloud
   - Test the experimental direct audio injection if enabled

4. **Platform Integration**
   - Verify participant detection
   - Test with multiple participants if possible
   - Verify call duration tracking

### Zoom

1. **Meeting Setup**
   - Create a new Zoom meeting
   - Join the meeting via browser (not desktop app)
   - Verify CandidAI detects Zoom

2. **Audio Capture**
   - Click "Start Listening" in the side panel
   - Speak a test question (e.g., "What are your strengths and weaknesses?")
   - Verify the question is transcribed correctly
   - Verify an LLM response is generated

3. **Automated Answering**
   - Select the generated response
   - Click the "Speak" button
   - Verify the response is spoken aloud
   - Test the experimental direct audio injection if enabled

4. **Platform Integration**
   - Verify participant detection
   - Test with multiple participants if possible
   - Verify call duration tracking

### Microsoft Teams

1. **Meeting Setup**
   - Create a new Microsoft Teams meeting
   - Join the meeting via browser (not desktop app)
   - Verify CandidAI detects Microsoft Teams

2. **Audio Capture**
   - Click "Start Listening" in the side panel
   - Speak a test question (e.g., "How do you handle conflict in a team?")
   - Verify the question is transcribed correctly
   - Verify an LLM response is generated

3. **Automated Answering**
   - Select the generated response
   - Click the "Speak" button
   - Verify the response is spoken aloud
   - Test the experimental direct audio injection if enabled

4. **Platform Integration**
   - Verify participant detection
   - Test with multiple participants if possible
   - Verify call duration tracking

## Advanced Feature Testing

### Visual Analysis

1. **Screen Capture**
   - Navigate to a page with visual content (e.g., a job description)
   - Open the side panel
   - Click the "Capture Screen" button
   - Verify the screen is captured
   - Verify text is extracted and analyzed

2. **Analysis Refresh**
   - Click the "Refresh Analysis" button
   - Verify a new analysis is generated

3. **Copy Analysis**
   - Click the "Copy Analysis" button
   - Verify the analysis is copied to clipboard

### Calendar Integration

1. **Adding Events**
   - Navigate to the Calendar page
   - Add a new interview event
   - Verify the event is saved and displayed

2. **Event Management**
   - Edit an existing event
   - Delete an event
   - Verify changes are saved

3. **Notifications**
   - Create an event with notifications enabled
   - Verify notifications are received at appropriate times

### Multi-Language Support

1. **Interface Language**
   - Change the interface language in settings
   - Verify UI elements are translated

2. **Transcription Language**
   - Change the transcription language
   - Speak in the selected language
   - Verify correct transcription

3. **Response Language**
   - Set a different response language
   - Verify LLM responses are in the selected language

### Performance Hub

1. **Interview Recording**
   - Complete a mock interview with multiple questions
   - Navigate to the Performance Hub
   - Verify the interview is recorded

2. **Performance Analytics**
   - View performance metrics
   - Check for coaching tips
   - Verify historical data is displayed correctly

## Cross-Browser Testing

While the extension is primarily designed for Chrome, test compatibility with:
- Chrome
- Edge (Chromium-based)
- Brave (Chromium-based)

## Reporting Issues

When reporting issues found during E2E testing, include:
1. Browser version
2. Platform (Google Meet, Zoom, or Microsoft Teams)
3. Steps to reproduce
4. Expected behavior
5. Actual behavior
6. Screenshots or recordings if possible

## E2E Testing Checklist

Use this checklist to track testing progress:

- [ ] Extension installation and setup
- [ ] Google Meet integration
- [ ] Zoom integration
- [ ] Microsoft Teams integration
- [ ] Visual analysis feature
- [ ] Calendar integration
- [ ] Multi-language support
- [ ] Performance hub
- [ ] Cross-browser compatibility

## Automated E2E Testing (Future)

For future implementation, consider using:
- Puppeteer for browser automation
- Selenium WebDriver for more complex interactions
- Jest or Mocha as the test runner
- GitHub Actions for CI/CD integration

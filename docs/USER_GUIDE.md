# CandidAI User Guide

Welcome to CandidAI, your AI-powered interview assistant! This guide will help you get started and make the most of CandidAI's features.

## Table of Contents

1. [Installation](#installation)
2. [Initial Setup](#initial-setup)
3. [Using CandidAI During Interviews](#using-candidai-during-interviews)
4. [Visual Analysis](#visual-analysis)
5. [Calendar and Interview Management](#calendar-and-interview-management)
6. [Performance Hub](#performance-hub)
7. [Settings and Customization](#settings-and-customization)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

## Installation

### From Chrome Web Store

1. Visit the [CandidAI Chrome Web Store page](hhttps://github.com/veerababumanyam/CandidAI)
2. Click "Add to Chrome"
3. Follow the on-screen instructions to complete installation
4. Once installed, you'll see the CandidAI icon in your browser toolbar

### Manual Installation (Development)

1. Download the extension files from the [GitHub repository](https://github.com/veerababumanyam/CandidAI)
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top right
4. Click "Load unpacked" and select the downloaded folder
5. The extension should now appear in your extensions list

## Initial Setup

### API Key Configuration

CandidAI requires at least one API key to function. You can use OpenAI, Anthropic, or Google's Gemini API.

1. Click the CandidAI icon in your browser toolbar to open the side panel
2. Click the gear icon (⚙️) to open the Settings page
3. Navigate to the "API Keys" section
4. Enter your API key for at least one of the supported providers
5. Click "Save"

For detailed instructions on obtaining API keys, see the [API Key Setup Guide](API_KEY_SETUP_GUIDE.md).

### Resume and Job Context (Optional)

To get personalized suggestions, you can add your resume and job context:

1. In the Settings page, navigate to the "Resume & Job Context" section
2. Upload your resume or paste its content in the text area
3. Add job descriptions for positions you're interviewing for
4. Click "Save"

## Using CandidAI During Interviews

### Starting an Interview Session

1. Join your interview meeting on Google Meet, Zoom, or Microsoft Teams
2. Click the CandidAI icon to open the side panel
3. CandidAI will automatically detect the platform you're using
4. Click "Start Listening" to begin audio capture and transcription

### Real-Time Transcription

Once you start listening:

1. Your conversation will be transcribed in real-time
2. The transcription appears in the "Transcription" section of the side panel
3. Questions are automatically detected and highlighted
4. You can toggle transcription visibility using the eye icon

### AI-Powered Suggestions

When a question is detected:

1. CandidAI will generate a suggested response
2. The suggestion appears in the "Suggestions" section
3. You can use this as inspiration for your own answer
4. Click the copy icon to copy the suggestion to your clipboard

### Automated Answering

For automated answering:

1. Select a suggestion you want to use
2. Click the "Speak" button to have the suggestion spoken aloud
3. Adjust speaking speed using the speed control
4. Stop speaking at any time by clicking "Stop Speaking"

### Manual Prompting

You can also manually ask for suggestions:

1. Type your question or prompt in the input field at the bottom
2. Press Enter or click the send button
3. CandidAI will generate a response based on your prompt
4. The response will appear in the "Suggestions" section

## Visual Analysis

### Capturing and Analyzing Screens

1. Click the "Visual Analysis" tab in the side panel
2. Click "Capture Screen" to take a screenshot
3. Grant screen capture permission if prompted
4. The captured image will be displayed
5. CandidAI will automatically analyze the content
6. The analysis will appear in the "Analysis" section

### Using Visual Analysis

Visual analysis is useful for:

- Analyzing technical diagrams or code during interviews
- Getting insights on visual interview questions
- Extracting and analyzing text from job descriptions
- Understanding charts or graphs presented during interviews

### Managing Analysis Results

1. Click "Copy Analysis" to copy the analysis to your clipboard
2. Click "Refresh Analysis" to generate a new analysis of the same image
3. Click "Capture Screen" again to capture a new image

## Calendar and Interview Management

### Accessing the Calendar

1. Open the CandidAI options page by clicking the gear icon
2. Click "Open Calendar" in the Performance Hub section
3. The calendar interface will open in a new tab

### Adding Interview Events

1. In the calendar view, click "Add Interview" or click on a date
2. Fill in the interview details:
   - Title
   - Company
   - Position
   - Date and time
   - Location (or meeting link)
   - Description
   - Personal notes
3. Enable notifications if desired
4. Enable context preloading if desired
5. Click "Save"

### Managing Events

1. Click on an event in the calendar to view details
2. Click "Edit" to modify event details
3. Click "Delete" to remove the event
4. Events will appear in the "Upcoming Events" list

### Interview Reminders

If notifications are enabled:

1. You'll receive reminders before your interviews
2. Reminders are sent at 24 hours, 1 hour, and 15 minutes before the interview
3. Click the notification to open CandidAI and prepare for the interview

## Performance Hub

### Accessing the Performance Hub

1. Open the CandidAI options page by clicking the gear icon
2. Click "Open Performance Hub" in the Performance Hub section
3. The Performance Hub interface will open in a new tab

### Viewing Interview History

1. In the Performance Hub, you'll see a list of your past interviews
2. Click on an interview to view details
3. Each interview shows:
   - Date and time
   - Company and position
   - Duration
   - Performance metrics
   - Questions and answers

### Analyzing Performance

The Performance Hub provides:

1. Overall performance metrics
2. Strengths and areas for improvement
3. Question-by-question analysis
4. Coaching tips for future interviews
5. Trends over time

### Managing Interview History

1. Click "Delete" to remove an interview from your history
2. Click "Export" to download interview data
3. Use the search and filter options to find specific interviews

## Settings and Customization

### LLM Provider Settings

1. In the Settings page, navigate to the "LLM Configuration" section
2. Select your primary LLM provider
3. Select a fallback provider (optional)
4. Choose your preferred model for each provider
5. Click "Save"

### Transcription Settings

1. In the Settings page, navigate to the "Transcription" section
2. Select your preferred transcription language
3. Enable or disable external STT (Speech-to-Text)
4. Adjust silence detection settings
5. Click "Save"

### Response Style Settings

1. In the Settings page, navigate to the "Response Style" section
2. Select your preferred tone (Professional, Friendly, Concise)
3. Select your preferred response length
4. Select your preferred detail level
5. Click "Save"

### Language Settings

1. In the Settings page, navigate to the "Language" section
2. Select your preferred interface language
3. Select your preferred response language
4. Click "Save"

### Accessibility Settings

1. In the Settings page, navigate to the "Accessibility" section
2. Select your preferred font size
3. Enable or disable auto-scroll
4. Click "Save"

### Theme Settings

1. In the side panel, click the theme toggle button (sun/moon icon)
2. The theme will switch between light and dark mode
3. Your preference is saved automatically

## Troubleshooting

### Audio Capture Issues

If audio capture isn't working:

1. Ensure your microphone is connected and working
2. Check that you've granted microphone permission to the browser
3. Try refreshing the page
4. Restart the browser if the issue persists

### Transcription Issues

If transcription isn't accurate:

1. Check that you're speaking clearly
2. Reduce background noise if possible
3. Try selecting a different transcription language
4. Consider using external STT for better accuracy

### API Connection Issues

If you're having trouble connecting to the AI provider:

1. Verify that your API key is correct
2. Check your internet connection
3. Ensure the AI provider's service is operational
4. Try using a different provider

### Extension Not Responding

If the extension becomes unresponsive:

1. Refresh the page
2. Close and reopen the side panel
3. Restart the browser
4. Reinstall the extension if the issue persists

## FAQ

### Is my data secure?

Yes, CandidAI is designed with privacy in mind:
- Audio is processed locally
- Only text is sent to AI providers
- Your data stays on your device
- API keys are stored securely in your browser

### Which video platforms are supported?

CandidAI currently supports:
- Google Meet
- Zoom (web version)
- Microsoft Teams (web version)

### Do I need to pay for API usage?

Yes, you'll need to pay for API usage according to the pricing of your chosen provider:
- OpenAI charges per token
- Anthropic charges per token
- Google charges per character

### Can I use CandidAI offline?

Currently, CandidAI requires an internet connection to function, as it relies on cloud-based AI services.

### How do I report issues or suggest features?

You can report issues or suggest features by:
- Using the feedback form in the extension
- Opening an issue on our [GitHub repository](https://github.com/candidai/extension/issues)
- Contacting us at support@candidai.io

### Can I use CandidAI for non-interview purposes?

Yes, while CandidAI is optimized for interviews, you can use it for other purposes such as:
- Meeting assistance
- Public speaking practice
- Language learning
- General conversation assistance

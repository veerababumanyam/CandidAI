# Frequently Asked Questions (FAQ)

## General Questions

### What is CandidAI?

CandidAI is a Chrome extension that helps job seekers excel in interviews by providing real-time transcription, AI-powered response suggestions, visual analysis, and interview management tools. It works with popular video conferencing platforms like Google Meet, Zoom, and Microsoft Teams.

### Is CandidAI free to use?

CandidAI itself is free to use, but it requires an API key from one of the supported AI providers (OpenAI, Anthropic, or Google). These providers charge for API usage based on their pricing models. You'll need to pay for the API usage according to the provider's pricing.

### Which browsers are supported?

CandidAI is primarily designed for Google Chrome. It should also work on other Chromium-based browsers like Microsoft Edge and Brave, but these are not officially supported.

### Does CandidAI work on mobile devices?

No, CandidAI is a Chrome extension that only works on desktop browsers. It is not available for mobile devices.

### How do I get started with CandidAI?

1. Install the extension from the Chrome Web Store
2. Obtain an API key from one of the supported providers
3. Configure the API key in the extension settings
4. Open the side panel during your interview
5. Click "Start Listening" to begin

For detailed instructions, see the [User Guide](USER_GUIDE.md).

## Privacy and Security

### Is my data secure?

Yes, CandidAI is designed with privacy in mind:
- Audio is processed locally on your device
- Only text transcriptions are sent to AI providers
- Your data stays on your device using Chrome's storage API
- API keys are stored securely in your browser's local storage
- No data is sent to CandidAI servers

### Does CandidAI record my interviews?

CandidAI can transcribe and store interview content locally on your device if you enable the interview history feature. This data never leaves your device unless you explicitly share it. You can disable history storage or delete your history at any time from the settings.

### Who can see my API keys?

Your API keys are stored securely in your browser's local storage and are only sent to the respective AI provider when making API calls. CandidAI does not have access to your API keys and they are never sent to any other servers.

### Does CandidAI comply with GDPR?

Yes, CandidAI is designed to comply with GDPR requirements. Since data is stored locally on your device and you have full control over it, CandidAI minimizes data processing concerns. For more details, see our [Privacy Policy](PRIVACY_POLICY.md).

## Features and Functionality

### Which video conferencing platforms are supported?

CandidAI currently supports:
- Google Meet
- Zoom (web version)
- Microsoft Teams (web version)

### Which AI providers are supported?

CandidAI supports the following AI providers:
- OpenAI (GPT-4, GPT-3.5 Turbo)
- Anthropic (Claude 3 Opus, Claude 3 Sonnet)
- Google (Gemini Pro)

### How accurate is the transcription?

Transcription accuracy depends on several factors:
- Your microphone quality
- Background noise
- Speaking clarity
- Accent
- Selected language

The built-in Web Speech API typically provides good accuracy for clear speech in supported languages. For better accuracy, you can enable external STT (Speech-to-Text) in the settings.

### Can CandidAI speak responses for me?

Yes, CandidAI can speak responses using text-to-speech technology. Simply select a suggestion and click the "Speak" button. You can adjust the speaking speed and stop speaking at any time.

### Does CandidAI support languages other than English?

Yes, CandidAI supports multiple languages for both transcription and responses. You can configure your preferred languages in the settings. The availability and quality of language support may vary depending on the AI provider you're using.

### Can I use CandidAI for non-interview purposes?

Yes, while CandidAI is optimized for interviews, you can use it for other purposes such as:
- Meeting assistance
- Public speaking practice
- Language learning
- General conversation assistance

## Technical Questions

### How much does API usage cost?

API usage costs vary by provider:

**OpenAI:**
- GPT-4: $0.03 per 1K input tokens, $0.06 per 1K output tokens
- GPT-3.5 Turbo: $0.0015 per 1K input tokens, $0.002 per 1K output tokens

**Anthropic:**
- Claude 3 Opus: $15 per 1M input tokens, $75 per 1M output tokens
- Claude 3 Sonnet: $3 per 1M input tokens, $15 per 1M output tokens

**Google:**
- Gemini Pro: $0.0025 per 1K characters (input and output)

These prices are subject to change. Check the provider's website for the most up-to-date pricing.

### How can I control API costs?

To manage API costs:
1. Use more cost-effective models (e.g., GPT-3.5 Turbo instead of GPT-4)
2. Adjust the response length setting to generate shorter responses
3. Use the transcription feature selectively
4. Monitor your usage in the provider's dashboard
5. Set spending limits in your provider account

### How much storage does CandidAI use?

CandidAI uses Chrome's local storage for saving:
- Settings and preferences (minimal space)
- API keys (minimal space)
- Interview history (varies based on usage)
- Calendar events (varies based on usage)

The total storage usage is typically less than 10MB for moderate usage.

### Does CandidAI work offline?

No, CandidAI requires an internet connection to function, as it relies on cloud-based AI services for generating responses. The transcription feature may work offline if you're using the built-in Web Speech API, but the AI suggestions will not be available without an internet connection.

### How does CandidAI impact browser performance?

CandidAI is designed to be lightweight and efficient:
- Audio processing is optimized for low CPU usage
- UI updates are throttled to reduce performance impact
- Resources are properly managed to minimize memory usage

You may notice a slight increase in CPU usage when audio capture is active, but it should not significantly impact your browser's performance.

## Troubleshooting

### Why isn't audio capture working?

If audio capture isn't working:
1. Ensure your microphone is connected and working
2. Check that you've granted microphone permission to the browser
3. Verify that no other application is using your microphone
4. Try refreshing the page
5. Restart the browser if the issue persists

### Why are AI responses slow or failing?

If AI responses are slow or failing:
1. Check your internet connection
2. Verify that your API key is valid and has sufficient credits
3. Check the AI provider's status page for service outages
4. Try using a different AI provider
5. Reduce the length or complexity of your prompts

### Why isn't platform detection working?

If platform detection isn't working:
1. Make sure you're on a supported platform (Google Meet, Zoom, Microsoft Teams)
2. Refresh the page
3. Check that you've granted the necessary permissions
4. Ensure you're using the web version of the platform (not desktop app)
5. Update the extension to the latest version

### How do I reset CandidAI if it's not working properly?

To reset CandidAI:
1. Open Chrome's extension management page (`chrome://extensions/`)
2. Find CandidAI and click "Details"
3. Click "Clear site data" to reset storage
4. Restart Chrome
5. Reconfigure your settings

### Why is the side panel not opening?

If the side panel is not opening:
1. Make sure you've clicked the CandidAI icon in the toolbar
2. Check if Chrome is up to date
3. Verify that the extension is enabled
4. Try restarting Chrome
5. Reinstall the extension if the issue persists

## Support and Feedback

### How do I report a bug?

You can report bugs by:
1. Using the feedback form in the extension
2. Opening an issue on our [GitHub repository](https://github.com/candidai/extension/issues)
3. Emailing support@candidai.io with details about the bug

Please include:
- Your browser version
- Steps to reproduce the issue
- What you expected to happen
- What actually happened
- Screenshots if applicable

### How do I suggest a new feature?

You can suggest features by:
1. Using the feedback form in the extension
2. Opening an issue on our [GitHub repository](https://github.com/candidai/extension/issues)
3. Emailing feedback@candidai.io with your suggestion

### How do I get help with using CandidAI?

For help with using CandidAI:
1. Refer to the [User Guide](USER_GUIDE.md)
2. Check this FAQ document
3. Email support@candidai.io with your question
4. Join our community forum at [community.candidai.io](https://community.candidai.io)

### How can I contribute to CandidAI?

We welcome contributions! You can contribute by:
1. Reporting bugs and suggesting features
2. Improving documentation
3. Submitting pull requests on GitHub
4. Helping other users in the community forum
5. Spreading the word about CandidAI

See our [Contributing Guidelines](CONTRIBUTING.md) for more information.

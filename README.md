# CandidAI Chrome Extension 🎯

<div align="center">
  <img src="logo.png" alt="CandidAI Logo" width="128" height="128">
  
  **Your AI-Powered Partner for Smarter Conversations**
  
  [![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://chrome.google.com/webstore)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
  [![Version](https://img.shields.io/badge/Version-1.0.0-e8a396?style=for-the-badge)](package.json)
</div>

## 🚀 Elevate Every Conversation with Contextual Intelligence

CandidAI is an innovative Chrome extension that acts as your indispensable AI partner, distinguished by its deep **Contextual Intelligence**. By integrating directly with your key documents—such as project briefs, sales collateral, meeting agendas, technical specifications, or research papers—CandidAI delivers highly relevant, personalized suggestions and instant access to the information you need, precisely when it matters most.

This core capability empowers you across a wide spectrum of professional interactions, including team meetings, client presentations, sales pitches, consultations, and any scenario where data-driven insights and articulate communication are paramount. Leveraging advanced LLM orchestration (OpenAI, Anthropic, Google Gemini), CandidAI transforms your documents into dynamic knowledge bases, helping you communicate more effectively, make informed decisions, and achieve your objectives with unparalleled confidence.

### ✨ Key Features to Supercharge Your Professional Interactions

- **📄 Contextual Intelligence**: At its heart, CandidAI integrates with your uploaded documents (project plans, sales materials, support articles, etc.) to provide highly relevant, personalized suggestions and instant information retrieval, tailored to your specific ongoing conversation or task.
- **🎙️ Real-Time Transcription & Analysis**: Automatically transcribes conversations with high accuracy and provides insights into sentiment and key topics, further enriched by your active contextual data.
- **🤖 Multi-LLM Support & Orchestration**: Seamlessly utilizes the best AI provider (OpenAI, Anthropic, Google Gemini) for the task at hand, with intelligent fallback logic, ensuring optimal responses based on your context.
- **🖼️ Visual Analysis**: Captures and analyzes screen content during presentations or technical discussions, offering quick insights and data extraction, which can be cross-referenced with your contextual documents.
- **🌍 Multi-Language Support**: Facilitates clear communication in English, Spanish, French, German, and Mandarin, understanding and providing context in multiple languages.
- **📊 Performance & Interaction Analytics**: Helps you track key metrics, understand engagement patterns, and refine your communication strategies over time, with insights often linked to how well contextual information was leveraged.
- **🔒 Secure & Private**: Ensures your sensitive data, including API keys and proprietary documents used for contextual understanding, are encrypted and stored locally, under your control.

### 🎯 Versatile Use Cases for Enhanced Productivity

CandidAI is designed to be your go-to AI assistant for a multitude of professional scenarios:

- **🤝 Effective Meetings & Presentations**: Stay on top of discussions, instantly recall past decisions or data points from agendas or attached reports, and contribute more effectively with context-aware suggestions. Deliver compelling presentations with key information at your fingertips.
- **📈 Successful Sales Engagements**: Craft persuasive pitches by having product specifications, competitor information, and answers to common objections readily available. Impress clients with your deep knowledge and rapid, informed responses.
- **📞 Insightful Client Consultations**: Provide more informed advice by quickly accessing case histories, technical documentation, or best practices relevant to the client's specific needs and uploaded context.
- **📚 Accelerated Learning & Research**: Use CandidAI as a dynamic study partner to summarize complex documents, get instant explanations on intricate topics during online courses, or quickly find relevant information within research papers.
- **✍️ Streamlined Content Creation & Brainstorming**: Leverage AI suggestions to overcome writer's block, generate ideas, or refine your talking points for any presentation, report, or written communication, all informed by your provided documents.

CandidAI transforms from a specialized tool into a versatile assistant, ready to enhance your productivity and effectiveness in any data-intensive, communication-focused task.

## 📋 Requirements

- Chrome Browser version 110 or higher
- At least one LLM API key (OpenAI, Anthropic, or Google Gemini)
- Microphone access for audio transcription and voice commands

## 🛠️ Installation

### From Chrome Web Store (Recommended)
1. Visit the [CandidAI Chrome Web Store page](#)
2. Click "Add to Chrome"
3. Follow the installation prompts

### Development Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/candidai-chrome-extension.git
   cd candidai-chrome-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder from your local project directory.

## 🚀 Quick Start

1. **Secure Your Keys**: Open CandidAI, navigate to Settings, and add your LLM API keys. They are stored encrypted locally.
2. **Provide Context**: Upload relevant documents (e.g., project plans for meetings, sales brochures for pitches, technical manuals for consultations) to enable tailored AI assistance.
3. **Join Your Session**: Navigate to your video conferencing platform (Google Meet, Zoom, Teams) or open your presentation/document.
4. **Activate CandidAI**: Click the CandidAI extension icon in your browser to open the side panel.
5. **Engage Smarter**: Use the real-time transcription, AI suggestions, and chat features to enhance your meeting or task.

## 🏗️ Architecture

CandidAI is built with a robust, modular architecture designed for security, performance, and scalability:

- **Service Worker (background/service-worker.js)**: The central nervous system, managing extension state, API calls, and long-running tasks.
- **Side Panel (sidepanel/sidepanel.js & .html)**: The primary user interface for real-time transcription, AI suggestions, chat, and controls.
- **Options Page (options/options.js & .html)**: Securely manages user settings, API key configuration, and preferences.
- **Offscreen Document (offscreen/offscreen.js & .html)**: Handles resource-intensive tasks like audio processing for transcription, ensuring the main extension remains responsive.
- **Content Scripts (content/content.js)**: Enable seamless integration with specific web platforms (e.g., Google Meet, Zoom) for contextual awareness.
- **LLM Orchestrator (js/services/llmOrchestrator.js)**: Intelligently routes requests to the appropriate AI provider (OpenAI, Anthropic, Gemini) based on user preference, model capabilities, and fallback logic.
- **Secure Storage (js/utils/storage.js)**: Manages local storage of sensitive data like API keys and user preferences with robust encryption.

## 🔧 Configuration

CandidAI puts you in control of your data and AI interactions.

### API Keys & LLM Setup
Securely add and manage your API keys for:
1. **OpenAI**: Obtain from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Anthropic**: Obtain from [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
3. **Google Gemini**: Obtain from [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

Choose your preferred primary LLM provider and set up fallback options in the settings.

### Supported Platforms for Enhanced Integration

While CandidAI can provide general assistance on any webpage, it offers enhanced, context-aware features on platforms like:

- ✅ Google Meet
- ✅ Zoom (Web client)
- ✅ Microsoft Teams (Web client)
- ✅ LinkedIn (for profile analysis and messaging assistance - can be generalized for communication)
- ✅ Various CRMs and Document Editors (target platforms for future deeper integration)

## 🧑‍💻 Development

### Project Structure
```
candidai-chrome-extension/
├── dist/                  # Built extension files (for loading unpacked)
├── logo.png               # Source logo file
├── create-icons.js        # Script to generate icon sizes
├── src/                   # Source code
│   ├── background/        # Service worker logic
│   ├── content/           # Content scripts for page interaction
│   ├── css/               # Global and component-specific styles
│   ├── js/                # Core JavaScript modules
│   │   ├── api/           # LLM API integration logic
│   │   ├── platforms/     # Platform-specific handlers
│   │   ├── services/      # Core application services (orchestration, parsing)
│   │   ├── ui/            # UI component management
│   │   └── utils/         # Utility functions (storage, messaging)
│   ├── offscreen/         # Offscreen document for audio processing
│   ├── options/           # Options page UI and logic
│   ├── sidepanel/         # Side panel UI and logic
│   └── assets/            # Static assets
│       ├── fonts/
│       ├── icons/         # Generated PNG icons
│       └── images/
├── .eslintrc.json         # ESLint configuration
├── .gitignore             # Git ignore file
├── build.bat              # Windows build script
├── build.sh               # macOS/Linux build script
├── LOGO_USAGE.md          # Guide for logo and icon management
├── package-lock.json      # Exact versions of dependencies
├── package.json           # Project metadata and dependencies
├── README.md              # This file
└── webpack.config.js      # Webpack build configuration
```

### Build Commands

```bash
# Install dependencies
npm install

# Generate icons (if updating logo.png manually)
npm run icons

# Development build with watch mode
npm run dev

# Production build (includes icon generation)
npm run build

# Run linters and formatters
npm run lint
npm run format

# Create a distributable ZIP file
npm run package
```

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, feature enhancements, or documentation improvements, your help is appreciated.

Please see our [CONTRIBUTING.md](CONTRIBUTING.md) (to be created) for detailed guidelines on how to contribute.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/YourAmazingFeature`).
3. Commit your changes (`git commit -m 'Add YourAmazingFeature'`).
4. Push to the branch (`git push origin feature/YourAmazingFeature`).
5. Open a Pull Request.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- To the developers of the underlying LLM technologies (OpenAI, Anthropic, Google) for their groundbreaking work.
- To the open-source community for the vast array of tools and libraries that make projects like this possible.
- To the Chrome Extension development team at Google for providing a powerful platform.

## 📞 Support & Feedback

- **Documentation**: Check out [LOGO_USAGE.md](LOGO_USAGE.md) for icon details. (Full docs site coming soon!)
- **Report Issues**: Encounter a bug? Have a feature request? Please open an issue on our [GitHub Issues page](#).
- **Contact Us**: For other inquiries, please reach out to `support@candidai.com` (Example email).

---

<div align="center">
  Made with ❤️ by the CandidAI Team
</div>

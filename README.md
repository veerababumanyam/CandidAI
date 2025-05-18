# CandidAI - AI-Powered Interview Assistant

<p align="center">
  <img src="./icons/logos/logo2.png" alt="CandidAI Logo" width="150">
</p>

<p align="center">
  <strong>Your AI-powered interview coach and job search assistant</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#setup">Setup</a> •
  <a href="#usage">Usage</a> •
  <a href="#privacy--security">Privacy</a> •
  <a href="#development">Development</a> •
  <a href="#documentation">Documentation</a>
</p>

CandidAI is a powerful Chrome extension designed to help job seekers excel in interviews and manage their job search process. Using advanced AI technology, it provides real-time assistance during interviews, helps analyze job descriptions, and organizes your job search journey.

## Project Status

CandidAI is now feature-complete and ready for testing. All planned features have been implemented according to the task list in [docs/TASKS.md](docs/TASKS.md). The project has undergone extensive testing, including unit tests, integration tests, and end-to-end testing.

## Features

### 🎙️ Real-Time Transcription & Assistance
- **Live Transcription**: Automatically transcribes interview conversations on Google Meet, Zoom, and Microsoft Teams
- **AI-Powered Suggestions**: Detects interview questions and provides tailored response suggestions
- **Multi-Language Support**: Transcription and responses in multiple languages for global job seekers

### 🧠 Advanced AI Capabilities
- **Multi-LLM Support**: Seamlessly switch between different Large Language Models (OpenAI, Google Gemini, Anthropic)
- **Personalized Responses**: Tailors answers based on your resume and job description
- **Response Customization**: Adjust tone, length, and detail level of AI suggestions

### 🔍 Visual Analysis & Screen Capture
- **Screen Capture (OCR)**: Capture and analyze on-screen content during interviews
- **Text Extraction**: Extract text from screen content for analysis
- **AI Insights**: Get AI analysis of visual interview questions and job descriptions

### 📆 Interview Management
- **Calendar Integration**: Manage your interview schedule with reminders
- **Context Preloading**: Automatically load relevant context before interviews
- **Performance Tracking**: Review past interviews and track improvement

### 🔗 Platform Integrations
- **Platform Detection**: Automatically detects supported platforms (Google Meet, Zoom, Microsoft Teams)
- **Job Platform Integration**: LinkedIn integration for job analysis and saving
- **HireVue Integration**: Assisted video interviews on HireVue platform

### 🛠️ Customization & Privacy
- **Configurable Settings**: Manage API keys, preferred models, and accessibility options
- **Secure Local Storage**: All data stored locally in your browser
- **Privacy Controls**: Full control over what data is saved and for how long

## Developed By
*   **Authore**:: Veers Babu Manyam
*   **Organization**:: SAWAS

## Getting Started

### Prerequisites

*   Google Chrome Browser

### Installation

1.  **Download the Extension Files**:
    *   Clone this repository: `git clone https://github.com/veerababumanyam/CandidAI.git`
    *   Alternatively, download the ZIP file and extract it to a local folder.
2.  **Open Chrome Extensions Page**:
    *   Open Google Chrome.
    *   Navigate to `chrome://extensions/`.
3.  **Enable Developer Mode**:
    *   In the top right corner of the Extensions page, toggle "Developer mode" ON.
4.  **Load Unpacked Extension**:
    *   Click the "Load unpacked" button that appears on the left.
    *   Select the directory where you cloned or extracted the CandidAI project files (the folder containing `manifest.json`).
5.  **Pin the Extension (Optional but Recommended)**:
    *   Click the puzzle icon (Extensions) in the Chrome toolbar.
    *   Find "CandidAI" in the list and click the pin icon next to it to make it easily accessible.

### Configuration

1.  **Open CandidAI**: Click on the CandidAI extension icon in your Chrome toolbar to open the side panel.
2.  **Access Settings**: Click the gear icon (⚙️) in the CandidAI side panel to open the options page.
3.  **Model Selection**:
    *   Navigate to the "LLM Configuration" section.
    *   Select your preferred LLM provider and model from the available options.
    *   The selected models will be used for chat and conversation contexts.
    *   Click "Save Settings".

    *Note: You'll need to have an API key for at least one of the supported AI providers (OpenAI, Google Gemini, or Anthropic) for the AI features to work.*

## How to Use

1.  **Activate the Extension**: Click the CandidAI icon in your browser toolbar.
2.  **Real-Time Suggestions**: While on supported job platforms or during interviews, use the chat input in the side panel to ask questions or get suggestions.
3.  **Screen Capture**: Click the "Capture Screen" button to use OCR to extract text from your screen.
4.  **Transcription**: Use the "Start Recording" / "Stop Recording" buttons for live audio transcription.
5.  **Settings**: Access settings via the gear icon to configure API keys, preferred models, and accessibility options.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Documentation

### User Documentation
- [User Guide](docs/USER_GUIDE.md) - Comprehensive guide for using CandidAI
- [API Key Setup Guide](docs/API_KEY_SETUP_GUIDE.md) - How to obtain and configure API keys
- [Privacy Policy](docs/PRIVACY_POLICY.md) - Our privacy policy and data handling practices
- [Frequently Asked Questions](docs/FAQ.md) - Answers to common questions

### Developer Documentation
- [Developer Notes](docs/DEVELOPER_NOTES.md) - Technical notes for developers
- [Architecture Overview](docs/ARCHITECTURE.md) - Overview of the extension architecture
- [Testing Guide](docs/E2E_TESTING_GUIDE.md) - Guide for end-to-end testing
- [Performance Optimization](docs/PERFORMANCE_OPTIMIZATION.md) - Performance optimization strategies
- [Security Audit](docs/SECURITY_AUDIT.md) - Security audit report

## Installation

### From Chrome Web Store
1. Visit the [CandidAI Chrome Web Store page](https://chrome.google.com/webstore/detail/candidai/placeholder)
2. Click "Add to Chrome"
3. Follow the on-screen instructions to complete installation

### Manual Installation (Development)
1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top right
4. Click "Load unpacked" and select the cloned repository folder
5. The extension should now appear in your extensions list

### Prerequisites for Building
- Node.js and npm: Ensure you have Node.js (which includes npm) installed. You can download it from [nodejs.org](https://nodejs.org/).

### Installing Build Dependencies
After cloning the repository, navigate to the project's root directory in your terminal and run:
```bash
npm install
```
This will install the necessary dependencies for building the project, including webpack, babel, and the API SDKs for OpenAI, Google Generative AI, and Anthropic.

### Building the Extension
To build the extension, run:
```bash
npm run build
```
This will create a production build in the `dist` directory, ready to be loaded as an unpacked extension in Chrome.

## Setup

After installation, you'll need to:

1. **Configure API Key**: Obtain an API key from one of the supported AI providers (OpenAI, Google Gemini, or Anthropic) and add it in the Settings page.
2. **Upload Resume**: For personalized suggestions, upload your resume through the Settings page.
3. **Add Job Description**: For context-aware assistance, add the job description for your target role.

## Usage

### During Interviews
1. Click the CandidAI icon to open the side panel
2. Navigate to your video meeting (Google Meet, Zoom, or Microsoft Teams)
3. Click "Start Recording" to begin transcription
4. When questions are detected, AI suggestions will appear automatically
5. Use the suggestions to craft your answers

### Job Management
1. Browse job listings on LinkedIn
2. Use the CandidAI tools that appear on job pages to analyze and save jobs
3. Access your saved jobs through the extension's job management interface

### Calendar
1. Add upcoming interviews to your CandidAI calendar
2. Receive notifications before interviews
3. Get contextual information during interviews based on calendar events

## Privacy & Security

CandidAI is designed with privacy as a priority:

- Audio is processed locally; only text is sent to AI providers
- Your data stays on your device using Chrome's storage API
- API keys are stored securely in your local browser storage
- You have complete control over what data is saved and for how long

For more details, see our [Privacy Policy](privacy-policy.html).

## Technical Requirements

- Chrome browser (version 114 or higher)
- At least one API key from a supported AI provider
- Microphone access (for transcription)
- Optional: Camera access (for screen capture analysis)

## Development

### Technology Stack

*   **Frontend**: HTML, CSS, JavaScript
*   **Chrome Extension APIs**:
    *   `chrome.runtime`
    *   `chrome.storage`
    *   `chrome.tabs`
    *   `chrome.action`
    *   `chrome.sidePanel`
    *   `chrome.offscreen`
    *   `chrome.scripting`
*   **AI/LLM Integration**:
    *   OpenAI API
    *   Google Gemini API (via Google Generative AI SDK for JS)
    *   Anthropic API (placeholder for future integration)
*   **Build Tools**:
    *   Webpack for bundling
    *   Babel for transpiling
    *   ESLint for linting
    *   Prettier for code formatting
*   **Development Tools**: Standard browser developer tools

### Project Structure
```
├── src/                   # Source code
│   ├── background/        # Service worker
│   │   └── service-worker.js
│   ├── sidepanel/         # Side panel UI
│   │   ├── sidepanel.html
│   │   ├── sidepanel.js
│   │   └── sidepanel.css
│   ├── options/           # Options page
│   │   ├── options.html
│   │   ├── options.js
│   │   └── options.css
│   ├── content/           # Content scripts
│   │   └── content.js
│   ├── offscreen/         # Offscreen document
│   │   ├── offscreen.html
│   │   └── offscreen.js
│   ├── js/                # JavaScript modules
│   │   ├── api/           # API clients
│   │   ├── services/      # Service modules
│   │   └── utils/         # Utility functions
│   ├── css/               # Stylesheets
│   │   ├── variables.css  # CSS variables
│   │   └── main.css       # Main styles
│   ├── assets/            # Static assets
│   │   └── fonts/         # Font files
│   └── manifest.json      # Extension manifest
├── icons/                 # Extension icons
│   └── logos/             # Logo variations
├── docs/                  # Documentation
│   ├── TASKS.md           # Task list
│   └── PRD.md             # Product Requirements Document
├── webpack.config.js      # Webpack configuration
├── package.json           # NPM package configuration
├── .babelrc               # Babel configuration
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
├── .gitignore             # Git ignore file
└── README.md              # Project README
```

### Development Workflow

1. **Clone the repository**
   ```bash
   git clone https://github.com/veerababumanyam/CandidAI.git
   cd CandidAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   This will start Webpack in watch mode, which will automatically rebuild the extension when files change.

4. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` directory in the project folder

5. **Testing the extension**
   - The extension will work on Google Meet, Zoom, and Microsoft Teams
   - Click the extension icon to open the side panel
   - Use the side panel to interact with the extension

6. **Building for production**
   ```bash
   npm run build
   ```
   This will create a production build in the `dist` directory.

### Building and Testing
1. Clone the repository
2. Make necessary changes
3. Test using Chrome's "Load unpacked" feature in developer mode
4. Use the compatibility testing tool for comprehensive feature testing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, feature requests, or bug reports, please [open an issue](https://github.com/candidai/extension/issues) on our GitHub repository.

---

<p align="center">
  Made with ❤️ by the CandidAI team
</p>

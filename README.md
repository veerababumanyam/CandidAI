# CandidAI - Professional Interview Assistant Chrome Extension

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/your-repo/candidai)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-yellow.svg)](https://developer.chrome.com/docs/extensions/)

> 🚀 **Transform your interview experience with AI-powered real-time assistance, comprehensive performance analytics, and professional documentation tools.**

CandidAI is an advanced Chrome extension that provides intelligent interview assistance through real-time transcription, AI-powered suggestions, performance analytics, document processing, and professional reporting capabilities.

## ✨ Key Features

### 🤖 AI-Powered Interview Assistance
- **Multi-LLM Support**: OpenAI GPT, Anthropic Claude, and Google Gemini integration
- **Real-time Suggestions**: Context-aware AI responses during live interviews
- **Intelligent Fallback**: Automatic provider switching for optimal reliability
- **Custom Response Styles**: Adjustable tone, length, and formality settings

### 📄 Document Processing & Analysis
- **Resume Analysis**: 
  - Real PDF and DOCX parsing with full text extraction
  - Automated skills, experience, and education extraction
  - Contact information identification (email, phone, LinkedIn, GitHub)
  - Real-time analysis display with categorized insights
- **Document Storage**: Persistent storage with analysis metadata
- **Multi-format Support**: PDF, DOCX, with dynamic library loading

### 📊 Performance Analytics
- **Real-time Speech Analysis**:
  - Words per minute tracking (optimal range: 120-150 WPM)
  - Filler word detection and usage rate calculation
  - Pause analysis with duration tracking
  - Confidence scoring based on language patterns
- **Comprehensive Metrics**:
  - Session duration and response quality tracking
  - Behavioral analysis (interruptions, clarification requests)
  - Real-time feedback with severity levels and suggestions
- **Historical Tracking**: Performance comparison across sessions (last 50 sessions)

### 🎯 Interview Coaching Framework
- **Structured Response Frameworks**:
  - **STAR Method**: Situation, Task, Action, Result for behavioral questions
  - **SOAR Framework**: Situation, Obstacles, Actions, Results for complex scenarios
  - **PREP Method**: Point, Reason, Example, Point for structured responses
- **Interview Templates**:
  - Leadership & Management with behavioral framework integration
  - Technical Problem Solving with systematic methodology
  - Teamwork & Collaboration using advanced frameworks
- **Adaptive Coaching**: Experience-based guidance (entry/mid/senior/executive)
- **Practice System**: Custom sessions with template-based questions and timing

### 📋 Professional Note Export System
- **Comprehensive Documentation**:
  - Session metadata and interview details
  - Question analysis with categorization and scoring
  - Performance metrics integration
- **Multi-format Export**:
  - **HTML**: Professional styling with responsive design
  - **Markdown**: Structured formatting with checklists
  - **JSON**: Data interchange format
  - **DOCX/PDF**: Professional document formats
- **Advanced Features**:
  - Executive summary with hire recommendations
  - Candidate comparison reports
  - Customizable branding and company colors
  - Risk factor identification and next steps

### 🌐 Platform Support
- **Video Conferencing**: Google Meet, Zoom, Microsoft Teams
- **Interview Platforms**: LinkedIn, HireVue, and custom platforms
- **Cross-platform**: Comprehensive browser compatibility

## 🛠 Installation & Setup

### Prerequisites
- Google Chrome browser (version 88+)
- API keys for at least one LLM provider:
  - OpenAI API key
  - Anthropic API key  
  - Google Gemini API key

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo/candidai-chrome-extension.git
   cd candidai-chrome-extension
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` folder
   - Pin the extension for easy access

5. **Configure API Keys**
   - Click the CandidAI extension icon
   - Go to Options → API Keys
   - Enter your API keys for desired providers
   - Test connections to verify setup

## 🚀 Quick Start Guide

### Basic Usage
1. **Setup**: Configure API keys in the extension options
2. **Join Interview**: Open any supported video conferencing platform
3. **Activate**: Click the extension icon and open the side panel
4. **Interview**: Receive real-time suggestions and performance feedback
5. **Export**: Generate professional interview reports

### Document Analysis
1. Navigate to Options → Document Processing
2. Upload your resume (PDF or DOCX)
3. Review the automated analysis of skills, experience, and contact info
4. Use insights for interview preparation

### Performance Tracking
1. Start an interview session from the side panel
2. Monitor real-time metrics for pace, confidence, and clarity
3. Receive immediate feedback on speech patterns
4. Review comprehensive performance reports after sessions

### Professional Reporting
1. Complete an interview session
2. Access the export options in the extension
3. Choose format (HTML, Markdown, PDF, etc.)
4. Customize branding and content inclusion
5. Generate and download professional reports

## ⚙️ Configuration Options

### API Configuration
- **Primary Provider**: Set preferred LLM provider
- **Fallback Order**: Configure provider priority for redundancy
- **API Key Management**: Secure storage with connection testing

### Performance Settings
- **Speech Recognition**: Configurable language and sensitivity
- **Response Timing**: Adjustable suggestion timing and frequency
- **Feedback Levels**: Customize real-time coaching intensity

### Export Customization
- **Branding**: Company logo, colors, and styling
- **Content Inclusion**: Metrics, analysis, transcripts, recommendations
- **Template Selection**: Professional, detailed, summary, or technical formats

## 🏗 Technical Architecture

### Core Components
- **Service Worker**: Background processing and API management
- **Content Scripts**: Platform integration and DOM interaction
- **Side Panel**: Primary user interface
- **Options Page**: Configuration and document processing
- **Storage System**: Secure data persistence

### Key Services
- **PerformanceAnalytics**: Real-time speech and behavior analysis
- **InterviewCoaching**: Framework-based guidance and templates
- **NoteExportSystem**: Professional documentation and reporting
- **MessageBroker**: Inter-component communication
- **SecureStorage**: Encrypted data storage

### Security Features
- **API Key Encryption**: Secure storage of sensitive credentials
- **Content Security Policy**: Protection against code injection
- **Permission Management**: Minimal required permissions
- **Data Privacy**: Local storage with user control

## 📊 Performance Metrics

### Testing Coverage
- **TypeScript Compliance**: 100% type safety
- **E2E Testing**: 73% pass rate (15 total tests)
- **Stress Testing**: 100/100 operations successful
- **Load Performance**: 552ms average load time, 4MB memory usage

### Analytics Capabilities
- **Speech Analysis**: WPM, filler words, pauses, confidence
- **Behavioral Tracking**: Interruptions, clarifications, topic coverage
- **Historical Comparison**: Performance trends and benchmarks
- **Quality Scoring**: Multi-dimensional assessment algorithms

## 🔒 Privacy & Security

### Data Protection
- **Local Storage**: All data stored locally on user's device
- **Encryption**: API keys and sensitive data encrypted
- **No Tracking**: No analytics or user behavior tracking
- **User Control**: Complete control over data export and deletion

### Permissions
- **Minimal Scope**: Only required permissions for core functionality
- **Platform Specific**: Targeted permissions for supported sites
- **API Access**: Secure communication with AI providers
- **Microphone**: Optional for enhanced transcription accuracy

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Testing
```bash
# Run TypeScript checks
npm run type-check

# Run E2E tests
npm run test:e2e

# Run stress tests
npm run test:stress
```

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](docs/API.md)
- [Configuration Guide](docs/CONFIGURATION.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/your-repo/candidai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/candidai/discussions)
- **Email**: support@candidai.com

## 🗺 Roadmap

### Upcoming Features
- **Video Analysis**: Facial expression and body language insights
- **Team Interviews**: Multi-participant interview support
- **Mobile App**: iOS and Android companion apps
- **Integration API**: Third-party platform integrations
- **Advanced AI**: Custom model training and fine-tuning

### Version History
- **v1.1.0**: Major feature release with document processing, analytics, coaching, and export system
- **v1.0.2**: TypeScript compliance, comprehensive testing, GitHub integration
- **v1.0.1**: Core interview assistance with multi-LLM support
- **v1.0.0**: Initial release with basic functionality

---

<div align="center">

**Made with ❤️ by the CandidAI Team**

[Website](https://candidai.com) • [Documentation](https://docs.candidai.com) • [Support](mailto:support@candidai.com)

</div>

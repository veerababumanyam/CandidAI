## Product Requirements Document: CandidAI Chrome Extension

**1. Introduction**

This document outlines the product requirements for an innovative Google Chrome extension, "CandidAI." This extension is designed to assist users in a wide range of professional communication scenarios by providing real-time, AI-powered support. It can listen to conversations, leverage Large Language Models (LLMs) like those from OpenAI, Anthropic, and Google, and utilize user-provided documents (e.g., project briefs, sales collateral, research papers, meeting agendas) to generate relevant suggestions, summaries, and instant information retrieval, all displayed conveniently in a sidebar. The primary goal is to empower users to communicate more effectively, make informed decisions, and achieve their objectives with greater confidence.

**2. Goals**

*   Provide real-time AI-powered assistance during online meetings, presentations, client consultations, and other communication-heavy tasks.
*   Help users articulate ideas, recall information from their documents, and respond effectively to questions or discussion points.
*   Reduce communication stress and enhance preparedness by offering a supportive "AI co-pilot."
*   Increase user confidence and overall communication effectiveness.
*   Seamlessly integrate into the user's existing web-based workflows.

**3. Target Audience**

*   **Professionals**: Including project managers, consultants, sales representatives, marketers, and customer support agents who need to quickly access and utilize information from documents during live interactions (meetings, presentations, client calls).
*   **Students & Educators**: For enhanced learning, research, and participation in online classes or discussions, by making study materials and lecture notes interactively accessible.
*   **Content Creators & Writers**: For brainstorming, drafting, and refining content by leveraging AI suggestions informed by their research and notes.
*   **Job Seekers**: For interview preparation and real-time assistance (as one of the many use cases).
*   Anyone who wants to improve their productivity and effectiveness in online communication and information-intensive tasks.

**4. Key Features**

*   **4.1. Real-time Audio Processing and Transcription:**
    *   The extension must activate automatically when the user joins a video call on supported platforms, specifically: Google Meet, Zoom, and Microsoft Teams. The system should be designed to easily incorporate support for additional video conferencing platforms in the future.
    *   It will continuously listen to the audio from the video call.
    *   Accurate real-time transcription of the conversation, focusing on identifying questions directed at the candidate.
*   **4.2. AI-Powered Answer Generation & Chat:**
    *   Integration with multiple advanced LLMs (e.g., OpenAI, Gemini, Anthropic) to generate answer suggestions and power an interactive chat interface.
    *   The chat interface, integrated within the side panel, will allow users to ask follow-up questions or seek clarification, receiving short, context-aware responses.
    *   The AI agent powering the chat will understand the interview context by leveraging the user's resume, job description, and keywords from the ongoing conversation.
    *   Distinguish between different types of questions (e.g., behavioral, technical, situational, experience-based) for both direct suggestions and chat responses.
*   **4.3. Resume and Job Description Integration:**
    *   Allow users to upload their resume (e.g., PDF, DOCX format).
    *   Optionally, allow users to paste the job description for the role they are interviewing for.
    *   The extension will parse and store key information from the resume (skills, experience, projects, education) and the job description (key requirements, responsibilities), employing sophisticated analysis for accurate extraction and skill matching.
    *   When experience-related questions are asked (e.g., "Tell me about a time when..."), or questions about suitability for the role, the AI will prioritize information from the uploaded resume and provided job description to generate personalized and relevant answer points.
*   **4.4. Contextual Understanding:**
    *   The AI should attempt to understand the context of the interview (e.g., job role, industry if discernible). This includes advanced context awareness, such as attempting to detect company names and interviewer names from conversation or page content to tailor responses further.
    *   Tailor suggestions based on the detected context for higher relevance.
*   **4.5. User Interface (UI) - Secondary Sidebar / Chrome Side Panel:**
    *   The extension will manifest as a discreet, collapsible interface. Primary consideration should be given to using the **Chrome Side Panel API (`chrome.sidePanel`)** for a native and robust experience. The side panel should open automatically when the user clicks the extension icon in the Chrome toolbar. Alternatively, a sidebar injected directly into the page (similar to a chat interface, e.g., Cursor's secondary sidebar) can be considered.
    *   The interface will display:
        *   An interactive chat area for conversing with the AI agent.
        *   Transcribed questions (optional, for user reference).
        *   AI-generated answer suggestions, bullet points, or key talking points, with important keywords/phrases highlighted.
        *   A clear distinction between answers derived from the resume and those from general LLM knowledge.
        *   Option to copy suggestions quickly.
        *   Minimalistic design to avoid distraction.
    *   Utilize **User Notifications (`chrome.notifications`)** for non-intrusive feedback (e.g., "Connected to call audio," "API key invalid").
*   **4.6. User Controls & Configuration:**
    *   Simple on/off toggle for the extension's listening and suggestion features (accessible via popup or side panel UI).
    *   A **dedicated Options Page (`chrome.runtime.openOptionsPage()`)** for:
        *   Uploading/replacing/deleting the resume.
        *   Pasting/editing the job description.
        *   Securely entering and managing API keys for chosen LLM provider(s) (e.g., OpenAI, Anthropic, Gemini, etc.).
        *   Allowing users to select their preferred LLM model for answer generation and chat, from the list of configured providers.
        *   Option to define a fallback order for LLM models in case the primary choice is unavailable.
        *   Other extension settings.
    *   Clear indication of when the extension is active and listening.
*   **4.7. Automated Answering (User-Controlled & Optional):**
    *   Provide an option for the extension to vocalize AI-generated suggestions using Text-to-Speech (TTS), allowing the user to hear suggestions discreetly.
    *   Offer an advanced (and clearly labeled experimental/high-risk) option for the extension to articulate parts of, or full-generated answers directly into the call audio, simulating the user speaking. This feature must be off by default, require explicit user activation for each session, and have prominent visual indicators when active.
    *   User must have granular control over voice selection, speed, and activation triggers for any automated speech.
*   **4.8. Multi-Language Support:**
    *   Support for real-time transcription, AI suggestion generation, and UI display in multiple languages (e.g., English, Spanish, French, German, Mandarin as initial targets, with a framework for adding more).
    *   User-selectable input and output languages for AI interactions.
    *   The extension's own interface (buttons, labels, settings) to be internationalized.
*   **4.9. Deep Job Platform Integration:**
    *   Beyond general video call platforms, provide targeted integrations with specific web-based job interview platforms (e.g., LinkedIn Recruiter calls, HireVue, Spark Hire, if technically feasible via web interfaces).
    *   Attempt to automatically extract contextual information like job descriptions, company details, and interviewer profiles from these platforms to enrich AI suggestions.
*   **4.10. Interview Performance & Improvement Hub:**
    *   Securely store interview history with user consent (transcriptions, questions asked, suggestions offered, user notes).
    *   Generate post-interview summary reports, including key topics discussed and AI suggestions provided.
    *   Provide AI-powered analytics on interview performance (e.g., clarity of speech, common filler words, response relevance – requires advanced analysis and user opt-in for their own audio analysis).
    *   Offer personalized coaching tips and feedback based on aggregated, anonymized data or specific user-opt-in past performance.
*   **4.11. Visual Analysis for Assessments (Screenshot-based):**
    *   Allow users to capture a screenshot of their current screen content (e.g., a coding problem in an online assessment, a complex diagram presented by the interviewer).
    *   Utilize Optical Character Recognition (OCR) and image analysis in conjunction with LLMs to understand the visual content and provide relevant hints, explanations, code snippets, or problem-solving strategies.
*   **4.12. Calendar Integration:**
    *   Option for users to make their calendar events available to the extension (e.g., by manually inputting relevant interview event details, or through potential future support for importing calendar files like iCal, if deemed secure and feasible). The extension will not use OAuth or directly authenticate with users' cloud calendar accounts.
    *   Automatically detect scheduled interviews based on keywords or event details from the provided calendar information.
    *   Provide reminders and prompts to activate CandidAI before a scheduled interview.
    *   Attempt to pre-load relevant job descriptions or company information if found in calendar event details or linked documents.
*   **4.13. User Content Pre-loading & Customization:**
    *   Provide a section where users can input specific questions they anticipate, key personal stories/achievements (STAR method examples), or topics they want the AI to be particularly aware of or help them practice.
    *   Allow users to customize AI "personas" or response styles (e.g., more concise, more elaborate).

**5. Technical Considerations**

*   **5.1. Chrome Extension Development:**
    *   Utilize Manifest V3 for security and performance.
    *   Required permissions:
        *   `scripting`: To inject the sidebar UI (if not using Side Panel API primarily) and interact with page content.
        *   `activeTab`: To access the content of the current active tab (the video call).
        *   `storage`: To store user settings, API keys (securely), and potentially resume data (locally, if not processed server-side).
        *   `sidePanel`: If using the Chrome Side Panel API.
        *   `notifications`: For providing user feedback.
        *   `offscreen`: For audio processing and other background tasks requiring DOM access.
        *   Potentially `tabCapture` (though `offscreen` with Web Speech API is preferred for audio).
    *   Employ **Offscreen Documents (`chrome.offscreen`)** for tasks like audio capture using the Web Speech API, ensuring Manifest V3 compatibility.
*   **5.2. Speech-to-Text (STT):**
    *   Integration with a robust STT API (e.g., Google Cloud Speech-to-Text, AssemblyAI, or browser-native Web Speech API via an **Offscreen Document**) for accurate real-time transcription.
    *   Focus on low latency and high accuracy for spoken language in an interview context.
*   **5.3. LLM API Integration (e.g., OpenAI, Anthropic, Gemini):**
    *   Secure handling of API keys for various LLM providers.
    *   Support for multiple LLM providers, allowing users to choose their preferred service.
    *   Implementation of a graceful fallback mechanism: if the primary selected LLM fails to respond or encounters an error, the system will attempt to use a secondary or tertiary LLM based on user preference or a predefined order.
    *   Efficient prompt engineering to get relevant answers for different question types (technical, behavioral, resume-based) and chat interactions, adaptable to different LLM APIs. This includes exploring and potentially implementing strategies for using different models for different tasks or allowing user selection, and investigating fine-tuning custom models if cost-effective for highly specific interview scenarios.
    *   Management of token limits and API costs across different providers. Reference: [Chrome extension with OpenAI in 10 minutes](https://janisagar.medium.com/chrome-extension-with-openai-in-10-minutes-9d3f0f0264b7).
*   **5.4. Resume Parsing:**
    *   Utilize libraries or services for parsing PDF and DOCX files to extract structured text.
    *   Develop logic to identify key sections: work experience, skills, education, projects.
*   **5.5. Security and Privacy:**
    *   **Crucial:** User audio and resume data are highly sensitive.
    *   All data processing should be transparent to the user.
    *   Clearly outline data handling practices in a privacy policy.
    *   API keys must be stored securely (e.g., using `chrome.storage.local` with appropriate encryption if possible, or server-side management if a backend component is introduced).
    *   Minimize data retention. Audio snippets should ideally be processed in real-time and not stored long-term.
*   **5.6. UI/UX:**
    *   The sidebar should be non-intrusive and easy to use.
    *   Performance is key; the extension should not degrade browser or video call performance.

**6. Success Metrics**

*   Number of active users.
*   User engagement (e.g., frequency of use, duration of use per interview).
*   User satisfaction ratings and qualitative feedback (e.g., surveys, store reviews).
*   Accuracy and relevance of AI-generated suggestions.
*   Task success rate (e.g., users reporting the extension helped them answer questions effectively).

**7. File Structure**
candidai-chrome-extension/
├── docs/                             # All documentation files (PRD.md, api_key_usage_guide.md, etc.)
├── dist/                             # Build output for the packed extension (generated by build tools)
├── src/                              # All source code for the extension
│   ├── background/                   # Scripts running in the extension's background (service worker)
│   │   └── service-worker.js         # Main service worker script
│   ├── content/                      # Content scripts (injected into web pages)
│   │   └── content.js                # Main content script (if needed for direct page interaction)
│   ├── sidepanel/                    # UI and logic for the Chrome Side Panel
│   │   ├── sidepanel.html
│   │   ├── sidepanel.js
│   │   └── sidepanel.css
│   ├── options/                      # UI and logic for the extension's options page
│   │   ├── options.html
│   │   ├── options.js
│   │   └── options.css
│   ├── offscreen/                    # Offscreen documents for tasks requiring DOM/API access not available in service workers
│   │   ├── offscreen.html
│   │   └── offscreen.js
│   ├── js/                           # Shared JavaScript modules, libraries, and utilities
│   │   ├── ui/                       # Reusable UI components or UI-related helper functions
│   │   ├── api/                      # Modules for interacting with external APIs (LLMs, STT)
│   │   ├── services/                 # Core services (e.g., resume parsing, context management, LLM orchestration)
│   │   └── utils/                    # Generic utility functions (e.g., storage helpers, error handlers)
│   ├── css/                          # Shared CSS files, including the central theme
│   │   ├── variables.css             # Defines CSS custom properties for colors, fonts, spacing (THEME FILE)
│   │   ├── main.css                  # Global styles, resets, and base element styling
│   │   └── common.css                # Styles for common UI components used across different parts of the extension
│   ├── assets/                       # Static assets like images, fonts, and icons
│   │   ├── icons/                    # Extension icons in various sizes (16x16, 48x48, 128x128)
│   │   ├── images/                   # Other images used within the extension's UI
│   │   └── fonts/                    # Font files (e.g., Nunito)
│   └── manifest.json                 # The core Chrome Extension manifest file
├── package.json                      # For managing project dependencies (e.g., linters, bundlers) and scripts
├── webpack.config.js                 # Example build tool configuration (or similar for Parcel, Rollup)
├── README.md                         # Project overview, setup, and contribution guidelines
└── .gitignore                        # Specifies intentionally untracked files that Git should ignore

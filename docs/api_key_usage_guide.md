# CandidAI API Key Usage Guide

This guide provides step-by-step instructions on how to obtain API keys for the AI and speech-to-text services supported by CandidAI, and how to configure them in the extension for use during interviews.

## Table of Contents
- [Overview](#overview)
- [Obtaining API Keys](#obtaining-api-keys)
  - [OpenAI API Key](#openai-api-key)
  - [Gemini API Key](#gemini-api-key)
  - [Anthropic API Key](#anthropic-api-key)
  - [Google Cloud Speech-to-Text API Key](#google-cloud-speech-to-text-api-key)
  - [Microsoft Azure Speech to Text API Key](#microsoft-azure-speech-to-text-api-key)
- [Configuring API Keys in CandidAI](#configuring-api-keys-in-candidai)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Overview
CandidAI uses various AI models and speech-to-text services to provide real-time assistance during interviews. To access these services, you need to obtain API keys from the respective providers and configure them within the CandidAI Chrome extension. These keys are stored locally on your device using Chrome's storage API and are only used to make direct API calls to the services.

CandidAI supports multiple Large Language Models (LLMs) like OpenAI, Gemini, and Anthropic. You can configure API keys for one or more of these providers. In the extension's options, you will be able to select your preferred primary LLM for generating suggestions and interacting with the chat feature. Additionally, you can define a fallback order, so if your primary LLM encounters an issue, CandidAI will automatically try the next LLM in your preferred sequence, ensuring uninterrupted assistance.

## Obtaining API Keys

### OpenAI API Key
1. **Sign Up/Login**: Go to [OpenAI's website](https://www.openai.com/) and sign up for an account or log in if you already have one.
2. **Access API Section**: Navigate to the API section from your dashboard.
3. **Create API Key**: Click on 'API Keys' and then 'Create new secret key'. Give it a name for your reference (e.g., 'CandidAI Key').
4. **Save the Key**: Copy the generated API key immediately. **Note**: You won't be able to view it again after closing the window. Store it securely.
5. **Billing**: Ensure you have added a payment method to your OpenAI account as API usage may incur costs based on your usage.

### Gemini API Key
1. **Sign Up/Login**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey) and log in with your Google account.
2. **Create API Key**: In Google AI Studio, go to the API key section and click 'Create API key'.
3. **Copy the Key**: Once created, copy the API key to a secure location.
4. **Billing**: Make sure billing is enabled for your Google Cloud account if required for Gemini API access.

### Anthropic API Key
1. **Sign Up/Login**: Go to [Anthropic's website](https://www.anthropic.com/) and sign up or log in.
2. **Access API Dashboard**: Navigate to the API or developer section (you may need to request access as Anthropic's API might be in limited access mode).
3. **Generate API Key**: Follow the instructions to create a new API key.
4. **Secure the Key**: Copy and store the key securely.
5. **Billing**: Check Anthropic's pricing and ensure your account is set up for API usage.

### Google Cloud Speech-to-Text API Key
1. **Sign Up/Login**: Visit [Google Cloud Console](https://console.cloud.google.com/) and log in with your Google account.
2. **Create Project**: If you don't have a project, create a new one by clicking on the project dropdown and selecting 'New Project'. Give it a name like 'CandidAI Speech'.
3. **Enable API**: Go to 'APIs & Services' > 'Library', search for 'Cloud Speech-to-Text API', and click 'Enable'.
4. **Create Credentials**: Navigate to 'APIs & Services' > 'Credentials', click 'Create Credentials', and select 'API Key'.
5. **Copy API Key**: Copy the generated key and store it securely.
6. **Billing**: Ensure billing is enabled for your Google Cloud account as Speech-to-Text API usage incurs costs.

### Microsoft Azure Speech to Text API Key
1. **Sign Up/Login**: Go to [Azure Portal](https://portal.azure.com/) and sign in or create a Microsoft account.
2. **Create Resource**: In the Azure Portal, click 'Create a resource', search for 'Speech', and select 'Speech' under Cognitive Services.
3. **Configure Resource**: Choose your subscription, resource group (create new if needed), region (e.g., 'West US'), and pricing tier (free tier available for testing).
4. **Create and Deploy**: Click 'Review + Create', then 'Create'. Wait for deployment to complete.
5. **Get API Key**: Once deployed, go to the resource, navigate to 'Keys and Endpoint' under 'Resource Management', and copy one of the keys (Key 1 or Key 2).
6. **Note Region**: Make a note of the region you selected (e.g., 'westus') as you'll need it for configuration.
7. **Billing**: Ensure your Azure account has billing set up for API usage beyond free tier limits.

## Configuring API Keys in CandidAI
1. **Open Extension Options**:
   - Right-click the CandidAI icon in the Chrome toolbar and select 'Options', or
   - Go to Chrome's extension settings, find CandidAI, and click 'Details' then 'Extension options'.
2. **Enter API Keys**:
   - In the options page, you'll see fields for each supported service's API key (e.g., OpenAI, Gemini, Anthropic for LLMs; Google Cloud, Azure Speech for STT).
   - Paste the respective keys into these fields.
   - For Azure Speech to Text, also enter the region (e.g., 'westus') if different from the default.
3. **Select Preferred LLM and Configure Fallback (LLM Services)**:
    - After entering API keys for one or more LLM providers, you will find options to:
        - Choose your primary LLM to be used for answer generation and chat.
        - Optionally, set a fallback order for other configured LLMs. If the primary LLM fails, CandidAI will attempt to use the fallback LLMs in the order you specify.
4. **Toggle Visibility (Optional)**:
   - Click the 'Show/Hide' button next to each field if you need to verify the key you've entered. Be cautious when doing this in public spaces.
5. **Save Settings**:
   - Click the 'Save Settings' button or press 'Enter' on your keyboard to store the keys locally.
   - You'll see a confirmation message 'Settings saved successfully!' if everything is stored correctly.
6. **Verify Functionality**:
   - During an interview or test session, CandidAI will attempt to use the configured services. Check the console logs (via Chrome DevTools) if you encounter issues.

## Security Considerations
- **Local Storage**: API keys are stored in `chrome.storage.local`, meaning they stay on your device and are not synced across devices or sent to any server by CandidAI.
- **Direct API Calls**: Keys are used directly in API calls to the respective services (e.g., OpenAI, Google, Azure). However, for some services like Google Cloud and Azure, direct use of API keys in WebSocket URLs may pose a security risk if logs or network traffic are intercepted.
- **Best Practice**: For production use or if you're concerned about security, consider setting up a backend proxy server to handle API authentication securely. This is an advanced step not covered in this guide.
- **Clearing Keys**: Use the 'Clear All Settings' button in the options page to remove all stored keys if you suspect a security breach or are using a shared/public computer.

## Troubleshooting
- **API Key Not Working**:
  - Double-check the key for typos. Use the 'Show/Hide' button to verify.
  - Ensure the API key hasn't expired or been revoked by the provider.
  - Verify that billing is set up correctly for the service, as some APIs require a valid payment method even for free tiers.
- **Speech-to-Text Not Functioning**:
  - Confirm microphone permissions are granted to Chrome and CandidAI.
  - Check if the correct service (Google Cloud or Azure) is prioritized based on your configured keys.
  - If using Azure, ensure the region matches what you set up in the Azure Portal.
- **AI Suggestions Not Appearing**:
  - Ensure at least one AI service (OpenAI, Gemini, Anthropic) key is configured and that your chosen primary LLM is correctly set up.
  - If you have fallback LLMs configured, check if the primary one might be failing and if the fallback is being attempted.
  - Check Chrome DevTools console for error messages related to API calls (e.g., invalid API key, quota exceeded for the selected LLM).
- **Fallback to Web Speech API**:
  - If professional speech-to-text services fail (due to invalid keys or connection issues), CandidAI falls back to the browser's Web Speech API. This is less accurate but doesn't require API keys.
- **Contact Support**: If issues persist, consider checking CandidAI's GitHub repository (if available) for issues or updates, or reach out to the developer for support.

---
*Last Updated: October 2023*
*Version: 1.0*

If you have feedback or need further assistance, feel free to contribute to or check the CandidAI documentation or repository for updates at [GitHub Repository Placeholder](https://github.com/[YourRepo]/CandidAI). 
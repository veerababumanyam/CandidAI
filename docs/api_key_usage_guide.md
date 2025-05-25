# API Key Usage Guide for CandidAI

## Overview

CandidAI supports multiple LLM providers to ensure reliable service and flexibility. This guide will help you obtain and configure API keys for each supported provider.

## Supported Providers

### 1. OpenAI
- **Models**: GPT-4 Turbo, GPT-3.5 Turbo
- **Best for**: General purpose, fast responses
- **Pricing**: GPT-3.5 ($0.0005/1K tokens), GPT-4 ($0.01/1K tokens)

**How to get an API key:**
1. Visit [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

### 2. Anthropic (Claude)
- **Models**: Claude 3 Opus, Sonnet, Haiku
- **Best for**: Long context, nuanced responses
- **Pricing**: Haiku ($0.00025/1K tokens), Opus ($0.015/1K tokens)

**How to get an API key:**
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Create an account
3. Go to Settings → API Keys
4. Generate a new key
5. Copy the key (starts with `sk-ant-`)

### 3. Google Gemini
- **Models**: Gemini Pro, Gemini Ultra
- **Best for**: Multimodal capabilities, free tier
- **Pricing**: Gemini Pro ($0.0025/1K tokens)

**How to get an API key:**
1. Visit [makersuite.google.com](https://makersuite.google.com)
2. Sign in with Google account
3. Click "Get API key"
4. Create or select a project
5. Copy the key (starts with `AIza`)

## Configuration in CandidAI

1. Click the CandidAI extension icon
2. Go to Settings (gear icon)
3. Navigate to "API Keys" section
4. Enter your keys for each provider
5. Set your preferred provider and fallback order
6. Click "Save API Keys"
   - **Note**: CandidAI securely encrypts and stores your API keys locally on your computer. They are not transmitted to any server other than the respective AI provider when you use the service.

## Security Best Practices

- **Never share your API keys** publicly or in code repositories
- **Use separate keys** for different applications
- **Monitor usage** regularly to detect anomalies
- **Rotate keys** periodically for security
- **Set usage limits** in provider dashboards

## Troubleshooting

### Invalid API Key Error
- Ensure key is copied completely (no spaces)
- Check key format matches provider pattern
- Verify key is active in provider dashboard

### Rate Limit Errors
- Enable fallback providers
- Consider upgrading to higher tier
- Reduce concurrent requests

### No Response
- Check internet connection
- Verify provider service status
- Try different provider

## Cost Optimization

1. **Start with free tiers** (Gemini offers free quota)
2. **Use efficient models** (Haiku/GPT-3.5 for simple tasks)
3. **Enable caching** to reduce duplicate requests
4. **Monitor token usage** in Performance Hub

## Support

For additional help:
- Check our [FAQ](https://candidai.com/faq)
- Contact support@candidai.com
- Join our [Discord community](https://discord.gg/candidai)

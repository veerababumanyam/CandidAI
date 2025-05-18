# API Key Setup Guide for CandidAI

This guide provides step-by-step instructions for obtaining and configuring API keys for the various AI providers supported by CandidAI.

## Supported AI Providers

CandidAI supports the following AI providers:

1. **OpenAI** (GPT-4, GPT-3.5 Turbo)
2. **Anthropic** (Claude 3 Opus, Claude 3 Sonnet)
3. **Google** (Gemini Pro)

You only need to set up **one** of these providers to use CandidAI, but you can configure multiple providers for fallback support.

## OpenAI API Key Setup

### Step 1: Create an OpenAI Account

1. Visit [OpenAI's website](https://openai.com/)
2. Click "Sign Up" in the top right corner
3. Follow the registration process to create an account
4. Verify your email address

### Step 2: Access the API Keys Page

1. Log in to your OpenAI account
2. Navigate to the [API Keys page](https://platform.openai.com/api-keys)
3. If prompted, complete any additional verification steps

### Step 3: Create a New API Key

1. Click the "Create new secret key" button
2. Enter a name for your key (e.g., "CandidAI Extension")
3. Click "Create secret key"
4. **Important**: Copy your API key immediately and store it in a secure location. OpenAI will only show the key once.

### Step 4: Add Credit to Your Account (If Needed)

1. Navigate to the [Billing section](https://platform.openai.com/account/billing/overview)
2. Click "Add payment method" and follow the instructions
3. Add credit to your account (OpenAI offers a free tier with limited usage)

### Step 5: Configure CandidAI

1. Open the CandidAI extension in Chrome
2. Click the gear icon (⚙️) to access Settings
3. Navigate to the "API Keys" section
4. Paste your OpenAI API key in the "OpenAI API Key" field
5. Click "Save"

## Anthropic API Key Setup

### Step 1: Create an Anthropic Account

1. Visit [Anthropic's website](https://www.anthropic.com/)
2. Click "Get API Access" or navigate to [Claude API](https://www.anthropic.com/product)
3. Follow the registration process to create an account
4. Verify your email address

### Step 2: Access the API Keys Page

1. Log in to your Anthropic account
2. Navigate to the API Console or Dashboard
3. Look for the API Keys section

### Step 3: Create a New API Key

1. Click the "Create API Key" or similar button
2. Enter a name for your key (e.g., "CandidAI Extension")
3. Set any usage limits if desired
4. Click "Create"
5. **Important**: Copy your API key immediately and store it in a secure location

### Step 4: Configure CandidAI

1. Open the CandidAI extension in Chrome
2. Click the gear icon (⚙️) to access Settings
3. Navigate to the "API Keys" section
4. Paste your Anthropic API key in the "Anthropic API Key" field
5. Click "Save"

## Google Gemini API Key Setup

### Step 1: Create a Google Cloud Account

1. Visit [Google Cloud](https://cloud.google.com/)
2. Click "Get Started for Free" or "Sign In"
3. Follow the registration process if you don't have an account
4. Create a new project for CandidAI

### Step 2: Enable the Gemini API

1. Navigate to the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Accept the terms of service if prompted

### Step 3: Create an API Key

1. Click on "Get API key" or "Create API key"
2. Enter a name for your key (e.g., "CandidAI Extension")
3. Click "Create"
4. **Important**: Copy your API key immediately and store it in a secure location

### Step 4: Configure CandidAI

1. Open the CandidAI extension in Chrome
2. Click the gear icon (⚙️) to access Settings
3. Navigate to the "API Keys" section
4. Paste your Google API key in the "Google API Key" field
5. Click "Save"

## Managing API Keys in CandidAI

### Configuring Primary and Fallback Providers

CandidAI allows you to configure a primary AI provider and an optional fallback provider:

1. Open the CandidAI extension settings
2. Navigate to the "Provider Settings" section
3. Select your preferred primary provider from the dropdown
4. Select a fallback provider (optional)
5. Click "Save"

### Model Selection

For each provider, you can select which model to use:

1. In the "Provider Settings" section
2. Select the desired model for each configured provider:
   - OpenAI: GPT-4 or GPT-3.5 Turbo
   - Anthropic: Claude 3 Opus or Claude 3 Sonnet
   - Google: Gemini Pro
3. Click "Save"

### API Key Security

CandidAI takes the security of your API keys seriously:

- API keys are stored locally in your browser's secure storage
- Keys are never sent to any server other than the respective AI provider
- Keys are transmitted only over secure HTTPS connections
- You can remove your API keys at any time from the settings page

## Troubleshooting

### Invalid API Key

If you receive an "Invalid API Key" error:

1. Double-check that you've copied the entire API key correctly
2. Ensure there are no extra spaces before or after the key
3. Verify that your API key is active in the provider's dashboard
4. Try generating a new API key if the issue persists

### Usage Limits

If you encounter usage limit errors:

1. Check your usage on the provider's billing dashboard
2. Add more credit to your account if needed
3. Consider switching to a different provider temporarily
4. Adjust your usage patterns to stay within limits

### Connection Issues

If CandidAI cannot connect to the AI provider:

1. Check your internet connection
2. Verify that the AI provider's service is operational
3. Ensure that your browser is not blocking the connection
4. Try using a different AI provider temporarily

## Cost Management

### Understanding API Costs

Each AI provider charges differently for API usage:

- **OpenAI**: Charges per token (roughly 4 characters = 1 token) for both input and output
- **Anthropic**: Charges per token for both input and output
- **Google**: Charges per character for both input and output

### Controlling Costs

To manage costs in CandidAI:

1. Use the "Response Length" setting to control the length of AI responses
2. Choose more cost-effective models (e.g., GPT-3.5 Turbo instead of GPT-4)
3. Monitor your usage in the provider's billing dashboard
4. Set spending limits in your provider account settings

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/introduction)
- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [CandidAI User Guide](USER_GUIDE.md)
- [CandidAI Privacy Policy](PRIVACY_POLICY.md)

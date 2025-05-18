# Chrome Web Store Submission Guide

This guide provides instructions for preparing and submitting CandidAI to the Chrome Web Store.

## Prerequisites

Before submitting to the Chrome Web Store, ensure you have:

1. A Google Developer account
2. $5 to pay the one-time developer registration fee (if not already paid)
3. All required promotional materials
4. A production-ready build of the extension

## Preparation Checklist

### 1. Extension Files

- [ ] Run the final production build: `npm run build`
- [ ] Verify all features work correctly in the production build
- [ ] Check that the manifest.json file is correct
- [ ] Ensure all permissions are properly declared and justified
- [ ] Verify the version number is incremented from the previous submission

### 2. Promotional Materials

- [ ] Create all required screenshots (see `src/assets/images/promo_screenshots/README.md`)
- [ ] Prepare promotional images in the required dimensions
- [ ] Write a compelling description (short and detailed)
- [ ] Prepare privacy policy document
- [ ] Create a support website or email address

### 3. Store Listing Information

Prepare the following information for the store listing:

#### Basic Information

- **Extension Name**: CandidAI
- **Short Description** (up to 132 characters):
  ```
  AI-powered interview assistant that provides real-time transcription, suggestions, and coaching during job interviews.
  ```
- **Detailed Description**:
  ```
  CandidAI is your AI-powered interview coach and job search assistant. It helps you excel in interviews by providing real-time transcription, intelligent response suggestions, and personalized coaching.

  Key Features:
  • Real-Time Transcription: Automatically transcribes interview conversations on Google Meet, Zoom, and Microsoft Teams
  • AI-Powered Suggestions: Detects interview questions and provides tailored response suggestions
  • Visual Analysis: Capture and analyze on-screen content during interviews
  • Calendar Integration: Manage your interview schedule with reminders
  • Performance Tracking: Review past interviews and track improvement
  • Multi-Language Support: Transcription and responses in multiple languages
  • Platform Integrations: Works with Google Meet, Zoom, Microsoft Teams, LinkedIn, and HireVue

  CandidAI is designed with privacy in mind:
  • Audio is processed locally on your device
  • Your data stays on your device
  • API keys are stored securely in your browser
  • You have full control over what data is saved

  Note: CandidAI requires an API key from one of the supported AI providers (OpenAI, Anthropic, or Google). These providers charge for API usage based on their pricing models.

  Get started today and transform your interview experience with CandidAI!
  ```

#### Category and Visibility

- **Category**: Productivity
- **Language**: English
- **Visibility Options**: Public

#### Developer Information

- **Developer Name**: CandidAI
- **Developer Email**: support@candidai.io
- **Developer Website**: https://candidai.io
- **Privacy Policy URL**: https://candidai.io/privacy-policy

## Packaging the Extension

Use the provided packaging script to create a ZIP file for submission:

```bash
# Make the script executable
chmod +x package.sh

# Run the packaging script
./package.sh
```

This will create a ZIP file in the `packages` directory.

## Submission Process

### 1. Access the Chrome Web Store Developer Dashboard

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time developer registration fee if prompted

### 2. Create a New Item

1. Click "New Item" in the dashboard
2. Upload the ZIP file created by the packaging script
3. Wait for the file to upload and process

### 3. Complete the Store Listing

Fill in the following sections:

#### Store Listing Tab

1. **Description**:
   - Add the short description
   - Add the detailed description
   - Select the appropriate category (Productivity)
   - Select language (English)

2. **Graphics**:
   - Upload the promotional images
   - Upload the screenshots
   - Upload the extension icon (if not included in the ZIP)

3. **Additional Fields**:
   - Website: https://candidai.io
   - Add links to any demo videos or tutorials (optional)

#### Privacy Tab

1. **Privacy Practices**:
   - Select the appropriate data collection practices
   - Indicate that the extension uses API keys
   - Explain how user data is handled

2. **Privacy Policy**:
   - Enter the URL to your privacy policy

#### Distribution Tab

1. **Visibility Options**:
   - Select "Public" for public listing
   - Select regions where the extension should be available

### 4. Submit for Review

1. Review all information for accuracy
2. Check the compliance checkbox
3. Click "Submit for Review"

## Review Process

After submission, the extension will undergo review by the Chrome Web Store team:

1. **Initial Review**: Automated checks for basic compliance
2. **Manual Review**: Human review for policy compliance
3. **Approval or Rejection**: You'll receive an email with the result

The review process typically takes 1-3 business days but can sometimes take longer.

## Post-Submission

### If Approved

1. Your extension will be published on the Chrome Web Store
2. Monitor user feedback and ratings
3. Prepare updates based on user feedback

### If Rejected

1. Review the rejection reason provided in the email
2. Make the necessary changes to address the issues
3. Resubmit the extension with the fixes

## Updating the Extension

To update the extension after it's published:

1. Increment the version number in manifest.json
2. Make your changes and build a new package
3. Go to the Chrome Web Store Developer Dashboard
4. Select your extension
5. Click "Package" in the left sidebar
6. Upload the new ZIP file
7. Update any store listing information if needed
8. Submit for review

## Common Rejection Reasons and Solutions

### Permission Issues

**Problem**: Requesting unnecessary permissions.
**Solution**: Only request permissions that are essential for your extension's functionality and clearly explain why each permission is needed.

### Privacy Policy Issues

**Problem**: Missing or inadequate privacy policy.
**Solution**: Ensure your privacy policy is comprehensive and accurately describes how user data is collected, used, and protected.

### Deceptive Functionality

**Problem**: Extension doesn't function as described.
**Solution**: Ensure your description accurately reflects the extension's capabilities and limitations.

### Security Vulnerabilities

**Problem**: Security issues in the code.
**Solution**: Conduct thorough security testing before submission and fix any vulnerabilities.

### User Data Handling

**Problem**: Improper handling of user data.
**Solution**: Follow best practices for data security and privacy, and clearly communicate your data practices to users.

## Resources

- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Chrome Web Store Developer Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Chrome Web Store Publishing](https://developer.chrome.com/docs/webstore/publish/)
- [Chrome Web Store Branding Guidelines](https://developer.chrome.com/docs/webstore/branding/)

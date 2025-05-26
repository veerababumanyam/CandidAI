# CandidAI Teams Meeting Troubleshooting Guide

## 🚨 Quick Fix for Live Teams Meeting

### 1. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select your CandidAI project folder
4. Verify extension appears with green "ON" toggle

### 2. Configure API Key (CRITICAL)
1. Click the CandidAI extension icon in Chrome toolbar
2. Go to Options/Settings
3. Add your OpenAI API key (required for transcription/suggestions)
4. Save settings

### 3. Teams Meeting Setup
1. **Refresh your Teams tab** after loading the extension
2. Look for CandidAI icon in Chrome toolbar - it should be active
3. Click the extension icon to open side panel
4. In Teams meeting, ensure microphone permissions are granted

### 4. Enable Transcription
- The extension needs microphone access to transcribe speech
- Check Chrome permissions: `chrome://settings/content/microphone`
- Allow microphone access for Teams domain
- In Teams meeting, click "Join with microphone" if prompted

### 5. Expected Behavior
- **Side Panel**: Should show CandidAI interface when clicked
- **Transcription**: Real-time text should appear as people speak
- **Suggestions**: AI-powered responses should generate automatically
- **Performance**: Analytics and feedback should be visible

### 6. Troubleshooting Steps

#### No Transcription Appearing:
1. Check microphone permissions in Chrome
2. Verify API key is configured correctly
3. Refresh Teams tab and rejoin meeting
4. Check browser console for errors (F12 → Console)

#### Extension Icon Not Active:
1. Verify extension is loaded and enabled
2. Check if Teams URL matches manifest permissions
3. Try refreshing the Teams tab

#### No AI Suggestions:
1. Confirm OpenAI API key is valid and has credits
2. Check internet connection
3. Verify side panel is open and responsive

#### Side Panel Not Opening:
1. Right-click extension icon → "Open side panel"
2. Check if Chrome side panel feature is enabled
3. Try using popup mode instead

### 7. Manual Activation
If automatic detection fails:
1. Open extension side panel
2. Manually start "Interview Mode"
3. Select "Teams Meeting" as call type
4. Begin transcription manually

### 8. Performance Tips
- Close unnecessary browser tabs
- Ensure stable internet connection
- Use Chrome for best compatibility
- Keep extension updated

### 9. Emergency Fallback
If extension isn't working during meeting:
- Take manual notes for now
- Use extension for post-meeting analysis
- Upload meeting recording later for AI analysis

## 📞 Need Immediate Help?
Check the browser console (F12) for error messages and report specific issues. 
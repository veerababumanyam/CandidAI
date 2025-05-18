/**
 * CandidAI - Visual Analysis Page Controller
 * Handles UI interactions and communication with the service worker for visual analysis
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const captureScreenButton = document.getElementById('captureScreenButton');
  const capturedImage = document.getElementById('capturedImage');
  const capturedImagePlaceholder = document.getElementById('capturedImagePlaceholder');
  const analysisResult = document.getElementById('analysisResult');
  const analysisResultPlaceholder = document.getElementById('analysisResultPlaceholder');
  const copyAnalysisButton = document.getElementById('copyAnalysisButton');
  const refreshAnalysisButton = document.getElementById('refreshAnalysisButton');

  // Event Listeners
  captureScreenButton.addEventListener('click', captureScreen);
  copyAnalysisButton.addEventListener('click', copyAnalysis);
  refreshAnalysisButton.addEventListener('click', refreshAnalysis);

  /**
   * Captures the screen for visual analysis
   */
  async function captureScreen() {
    console.log('Capture screen button clicked');
    
    try {
      // Show loading state
      capturedImagePlaceholder.textContent = 'Capturing screen...';
      capturedImagePlaceholder.style.display = 'block';
      capturedImage.style.display = 'none';
      analysisResult.textContent = '';
      analysisResult.style.display = 'none';
      analysisResultPlaceholder.textContent = 'Analyzing...';
      analysisResultPlaceholder.style.display = 'block';

      // Show status message to user
      showStatusMessage('Requesting screen capture permission...', 'info');

      // Request permission if needed
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'requestVisualAnalysisPermission'
        });

        if (!response || !response.success) {
          capturedImagePlaceholder.textContent = 'Permission denied. Please grant screen capture permission.';
          analysisResultPlaceholder.textContent = 'No analysis available.';
          showStatusMessage('Screen capture permission denied', 'error');
          return;
        }
      } catch (error) {
        console.error('Error requesting permission:', error);
        capturedImagePlaceholder.textContent = 'Error requesting permission: ' + error.message;
        analysisResultPlaceholder.textContent = 'No analysis available.';
        showStatusMessage('Error requesting permission', 'error');
        return;
      }

      // Show status message to user
      showStatusMessage('Capturing screen...', 'info');

      // Capture screen
      try {
        const captureResponse = await chrome.runtime.sendMessage({
          action: 'captureScreen'
        });

        if (!captureResponse || !captureResponse.success) {
          capturedImagePlaceholder.textContent = 'Failed to capture screen.';
          analysisResultPlaceholder.textContent = 'No analysis available.';
          showStatusMessage('Failed to capture screen', 'error');
          return;
        }

        // Display captured image
        capturedImage.src = captureResponse.imageData;
        capturedImage.style.display = 'block';
        capturedImagePlaceholder.style.display = 'none';
        
        showStatusMessage('Screen captured successfully', 'success');

        // Wait for analysis
        if (captureResponse.analysis) {
          // Display analysis
          analysisResult.textContent = captureResponse.analysis.text;
          analysisResult.style.display = 'block';
          analysisResultPlaceholder.style.display = 'none';
          showStatusMessage('Analysis complete', 'success');
        } else {
          analysisResultPlaceholder.textContent = 'Analysis failed. Please try again.';
          showStatusMessage('Analysis failed', 'warning');
        }
      } catch (error) {
        console.error('Error during screen capture:', error);
        capturedImagePlaceholder.textContent = 'Error capturing screen: ' + error.message;
        analysisResultPlaceholder.textContent = 'No analysis available.';
        showStatusMessage('Error capturing screen', 'error');
      }
    } catch (error) {
      console.error('Error in captureScreen function:', error);
      showStatusMessage('Error capturing screen: ' + error.message, 'error');
    }
  }

  /**
   * Copies the analysis result to clipboard
   */
  function copyAnalysis() {
    const text = analysisResult.textContent;

    if (!text || analysisResult.style.display === 'none') {
      showStatusMessage('No analysis to copy', 'warning');
      return;
    }

    navigator.clipboard.writeText(text)
      .then(() => {
        showStatusMessage('Analysis copied to clipboard', 'success');
      })
      .catch(error => {
        console.error('Error copying analysis:', error);
        showStatusMessage('Error copying analysis', 'error');
      });
  }

  /**
   * Refreshes the analysis of the current captured image
   */
  async function refreshAnalysis() {
    try {
      if (!capturedImage.src || capturedImage.style.display === 'none') {
        showStatusMessage('No image captured yet', 'warning');
        return;
      }

      // Show loading state
      analysisResult.textContent = '';
      analysisResult.style.display = 'none';
      analysisResultPlaceholder.textContent = 'Analyzing...';
      analysisResultPlaceholder.style.display = 'block';
      
      showStatusMessage('Re-analyzing image...', 'info');

      // Request new analysis
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeImage',
        imageData: capturedImage.src
      });

      if (!response || !response.success) {
        analysisResultPlaceholder.textContent = 'Analysis failed. Please try again.';
        showStatusMessage('Analysis failed', 'error');
        return;
      }

      // Display analysis
      analysisResult.textContent = response.analysis.text;
      analysisResult.style.display = 'block';
      analysisResultPlaceholder.style.display = 'none';
      showStatusMessage('Analysis complete', 'success');
    } catch (error) {
      console.error('Error refreshing analysis:', error);
      showStatusMessage('Error refreshing analysis: ' + error.message, 'error');
    }
  }

  /**
   * Shows a status message in the UI
   */
  function showStatusMessage(message, type = 'info') {
    // Remove any existing status messages
    const existingMessages = document.querySelectorAll('.status-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new status message
    const statusMessage = document.createElement('div');
    statusMessage.classList.add('status-message', type);
    statusMessage.textContent = message;

    document.body.appendChild(statusMessage);

    // Remove after 3 seconds
    setTimeout(() => {
      statusMessage.classList.add('fade-out');
      setTimeout(() => {
        statusMessage.remove();
      }, 500);
    }, 3000);
  }
});

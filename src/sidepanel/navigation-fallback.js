/**
 * Fallback Navigation Script
 * This provides basic tab navigation functionality when the main bundle fails
 */

(function() {
  'use strict';
  
  console.log('🔄 Initializing fallback navigation...');
  
  // Wait for DOM to be ready
  function initializeNavigation() {
    // Sidepanel Tab Navigation
    const tabs = document.querySelectorAll('[data-tab-target]');
    const panels = document.querySelectorAll('.ca-panel');
    
    if (tabs.length > 0 && panels.length > 0) {
      console.log('📱 Setting up sidepanel navigation');
      
      // Initially hide all panels except the active one
      panels.forEach(panel => {
        if (!panel.classList.contains('ca-panel--active')) {
          if (panel instanceof HTMLElement) {
            panel.style.display = 'none';
          }
        }
      });
      
      tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
          e.preventDefault();
          
          const targetId = this.getAttribute('data-tab-target');
          const targetPanel = document.querySelector(`#panel-${targetId}`);
          
          if (targetPanel) {
            // Hide all panels
            panels.forEach(p => {
              if (p instanceof HTMLElement) {
                p.style.display = 'none';
                p.classList.remove('ca-panel--active');
              }
            });
            
            // Remove active class from all tabs
            tabs.forEach(t => {
              t.classList.remove('ca-tabs__tab--active');
              t.setAttribute('aria-selected', 'false');
            });
            
            // Show target panel
            if (targetPanel instanceof HTMLElement) {
              targetPanel.style.display = 'block';
              targetPanel.classList.add('ca-panel--active');
            }
            
            // Activate clicked tab
            this.classList.add('ca-tabs__tab--active');
            this.setAttribute('aria-selected', 'true');
            
            console.log(`✅ Switched to ${targetId} tab`);
          }
        });
      });
    }
    
    // Options Page Section Navigation
    const navButtons = document.querySelectorAll('[data-section]');
    const sections = document.querySelectorAll('.ca-section');
    
    if (navButtons.length > 0 && sections.length > 0) {
      console.log('⚙️ Setting up options navigation');
      
      // Initially hide all sections except the active one
      sections.forEach(section => {
        if (!section.classList.contains('ca-section--active')) {
          if (section instanceof HTMLElement) {
            section.style.display = 'none';
          }
        }
      });
      
      navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          
          const targetId = this.getAttribute('data-section');
          const targetSection = document.querySelector(`#section-${targetId}`);
          
          if (targetSection) {
            // Hide all sections
            sections.forEach(s => {
              if (s instanceof HTMLElement) {
                s.style.display = 'none';
                s.classList.remove('ca-section--active');
              }
            });
            
            // Remove active class from all nav buttons
            navButtons.forEach(b => {
              b.classList.remove('ca-nav__button--active');
            });
            
            // Show target section
            if (targetSection instanceof HTMLElement) {
              targetSection.style.display = 'block';
              targetSection.classList.add('ca-section--active');
            }
            
            // Activate clicked button
            this.classList.add('ca-nav__button--active');
            
            console.log(`✅ Switched to ${targetId} section`);
          }
        });
      });
    }
    
    // Settings Modal Functionality
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const settingsOverlay = document.getElementById('settings-overlay');
    const fullSettingsBtn = document.getElementById('open-full-settings');
    
    if (settingsBtn && settingsModal) {
      console.log('⚙️ Setting up settings modal');
      
      // Open settings modal
      settingsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        settingsModal.removeAttribute('hidden');
        settingsModal.style.display = 'flex';
        console.log('📖 Opened settings modal');
      });
      
      // Close settings modal
      function closeModal() {
        settingsModal.setAttribute('hidden', '');
        settingsModal.style.display = 'none';
        console.log('📕 Closed settings modal');
      }
      
      if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', closeModal);
      }
      
      if (settingsOverlay) {
        settingsOverlay.addEventListener('click', closeModal);
      }
      
      // ESC key to close modal
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !settingsModal.hasAttribute('hidden')) {
          closeModal();
        }
      });
    }
    
    // Full Settings Button - Open options page in new tab
    if (fullSettingsBtn) {
      console.log('🔗 Setting up full settings navigation');
      
      fullSettingsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Construct the full URL to the options page
        const currentPath = window.location.pathname;
        let baseUrl;
        
        if (currentPath.includes('/dist/sidepanel/sidepanel.html')) {
          // Extension context with dist/ prefix
          baseUrl = window.location.origin + currentPath.replace('/sidepanel/sidepanel.html', '');
        } else if (currentPath.includes('/sidepanel/sidepanel.html')) {
          // Development context without dist/ prefix
          baseUrl = window.location.origin + currentPath.replace('/sidepanel/sidepanel.html', '');
        } else {
          // Fallback
          baseUrl = window.location.origin + '/dist';
        }
        
        const optionsUrl = baseUrl + '/options/options.html';
        
        // Open in new tab
        window.open(optionsUrl, '_blank');
        console.log(`🚀 Opening full settings at: ${optionsUrl}`);
        
        // Close the modal
        if (settingsModal) {
          settingsModal.setAttribute('hidden', '');
          settingsModal.style.display = 'none';
        }
      });
    }
    
    console.log('✨ Fallback navigation initialized successfully');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigation);
  } else {
    initializeNavigation();
  }

  function hideAllPanels() {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
      if (panel instanceof HTMLElement) {
        panel.style.display = 'none';
      }
    });
  }

  function showPanel(panelId) {
    hideAllPanels();
    
    const targetPanel = document.getElementById(panelId);
    if (targetPanel instanceof HTMLElement) {
      targetPanel.style.display = 'block';
    }
    
    // Update active state
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeNavItem = document.querySelector(`[data-panel="${panelId}"]`);
    if (activeNavItem) {
      activeNavItem.classList.add('active');
    }
  }

  function hideAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      if (section instanceof HTMLElement) {
        section.style.display = 'none';
      }
    });
  }

  function showSection(sectionId) {
    hideAllSections();
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection instanceof HTMLElement) {
      targetSection.style.display = 'block';
    }
    
    // Update active state
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeNavItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeNavItem) {
      activeNavItem.classList.add('active');
    }
  }
})(); 
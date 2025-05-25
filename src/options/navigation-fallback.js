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
          panel.style.display = 'none';
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
              p.style.display = 'none';
              p.classList.remove('ca-panel--active');
            });
            
            // Remove active class from all tabs
            tabs.forEach(t => {
              t.classList.remove('ca-tabs__tab--active');
              t.setAttribute('aria-selected', 'false');
            });
            
            // Show target panel
            targetPanel.style.display = 'block';
            targetPanel.classList.add('ca-panel--active');
            
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
          section.style.display = 'none';
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
              s.style.display = 'none';
              s.classList.remove('ca-section--active');
            });
            
            // Remove active class from all nav buttons
            navButtons.forEach(b => {
              b.classList.remove('ca-nav__button--active');
            });
            
            // Show target section
            targetSection.style.display = 'block';
            targetSection.classList.add('ca-section--active');
            
            // Activate clicked button
            this.classList.add('ca-nav__button--active');
            
            console.log(`✅ Switched to ${targetId} section`);
          }
        });
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
})(); 
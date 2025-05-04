
/**
 * PlayfulUI - Custom UI interactions and utilities
 * This script adds interactive behaviors to our custom components
 */

// Initialize the playfulUI object in the global scope
window.playfulUI = {
  // Store references to elements we'll need
  elements: {},
  
  // Toggle sidebar expanded/collapsed state
  toggleSidebar: function() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
      
      // Save preference to localStorage
      const isCollapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem('sidebarCollapsed', isCollapsed);
      
      // Adjust main content margin
      const contentArea = document.querySelector('.content-area');
      if (contentArea) {
        contentArea.style.marginLeft = isCollapsed ? 
          'var(--sidebar-width-collapsed)' : 
          'var(--sidebar-width-expanded)';
      }
    }
  },
  
  // Create a toast notification
  createToast: function(type = 'info', message, title = '') {
    // Check if toast container exists, create if not
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Create content
    const content = document.createElement('div');
    content.className = 'toast-content';
    
    if (title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'toast-title';
      titleEl.textContent = title;
      content.appendChild(titleEl);
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;
    content.appendChild(messageEl);
    
    toast.appendChild(content);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
      toast.classList.add('exiting');
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
    
    toast.appendChild(closeBtn);
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.classList.add('exiting');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 5000);
  },
  
  // Initialize dropdowns
  initDropdowns: function() {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
      const trigger = dropdown.querySelector('.dropdown button, .dropdown a');
      const menu = dropdown.querySelector('.dropdown-menu');
      
      if (trigger && menu) {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const isActive = menu.classList.contains('show');
          
          // Close all open dropdowns first
          document.querySelectorAll('.dropdown-menu.show').forEach(openMenu => {
            openMenu.classList.remove('show');
          });
          
          if (!isActive) {
            menu.classList.add('show');
          }
        });
      }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
      });
    });
  },
  
  // Initialize tabs
  initTabs: function() {
    document.querySelectorAll('.tabs').forEach(tabContainer => {
      const tabs = tabContainer.querySelectorAll('.tab');
      const contents = tabContainer.querySelectorAll('.tab-content');
      
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          // Remove active class from all tabs and contents
          tabs.forEach(t => t.classList.remove('active'));
          contents.forEach(c => c.classList.remove('active'));
          
          // Add active class to selected tab
          tab.classList.add('active');
          
          // Find the target content and activate it
          const target = tab.getAttribute('data-target');
          if (target) {
            const content = tabContainer.querySelector(`.tab-content[data-content="${target}"]`);
            if (content) {
              content.classList.add('active');
            }
          }
        });
      });
    });
  },
  
  // Initialize tooltips
  initTooltips: function() {
    document.querySelectorAll('.tooltip').forEach(tooltip => {
      const trigger = tooltip.querySelector('.tooltip-trigger');
      const content = tooltip.querySelector('.tooltip-content');
      
      if (trigger && content) {
        // Position the tooltip based on its class
        const position = tooltip.classList.contains('tooltip-top') ? 'top' :
                         tooltip.classList.contains('tooltip-bottom') ? 'bottom' :
                         tooltip.classList.contains('tooltip-left') ? 'left' :
                         'right';
                         
        tooltip.addEventListener('mouseenter', () => {
          content.style.opacity = '1';
          content.style.visibility = 'visible';
        });
        
        tooltip.addEventListener('mouseleave', () => {
          content.style.opacity = '0';
          content.style.visibility = 'hidden';
        });
      }
    });
  },
  
  // Add animations to elements when they enter viewport
  initAnimations: function() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const checkPosition = () => {
      animatedElements.forEach(element => {
        const position = element.getBoundingClientRect();
        
        // Check if element is in viewport
        if(position.top < window.innerHeight && position.bottom >= 0) {
          element.classList.add('in-view');
        }
      });
    };
    
    window.addEventListener('scroll', checkPosition);
    checkPosition(); // Check positions on load
  },
  
  // Initialize modal dialogs
  initModals: function() {
    document.querySelectorAll('[data-modal-target]').forEach(trigger => {
      const targetId = trigger.getAttribute('data-modal-target');
      const modal = document.getElementById(targetId);
      
      if (modal) {
        const modalBackdrop = modal.querySelector('.modal-backdrop');
        const closeButtons = modal.querySelectorAll('.modal-close, [data-modal-close]');
        
        // Open modal
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          modalBackdrop.classList.add('show');
        });
        
        // Close modal with close buttons
        closeButtons.forEach(button => {
          button.addEventListener('click', () => {
            modalBackdrop.classList.remove('show');
          });
        });
        
        // Close modal when clicking on backdrop
        modalBackdrop.addEventListener('click', (e) => {
          if (e.target === modalBackdrop) {
            modalBackdrop.classList.remove('show');
          }
        });
      }
    });
  },
  
  // Initialize everything
  init: function() {
    // Init all components
    this.initDropdowns();
    this.initTabs();
    this.initTooltips();
    this.initAnimations();
    this.initModals();
    
    // Setup sidebar toggle from DOM
    const sidebarToggleBtn = document.querySelector('.sidebar-toggle');
    if (sidebarToggleBtn) {
      sidebarToggleBtn.addEventListener('click', this.toggleSidebar);
    }
    
    // Initialize sidebar state from localStorage
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && sidebarCollapsed) {
      sidebar.classList.add('collapsed');
      
      // Adjust main content margin
      const contentArea = document.querySelector('.content-area');
      if (contentArea) {
        contentArea.style.marginLeft = 'var(--sidebar-width-collapsed)';
      }
    }
    
    console.log('PlayfulUI initialized successfully!');
  }
};

// Initialize the UI when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.playfulUI.init();
});

// Example usage:
// window.playfulUI.createToast('success', 'Your changes have been saved!', 'Success');

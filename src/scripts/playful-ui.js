
/**
 * Playful UI Interactive Components
 * 
 * This file contains JavaScript functions to enhance the interactive 
 * behavior of our UI components
 */

// Helper function to toggle classes
function toggleClass(element, className) {
  if (element.classList.contains(className)) {
    element.classList.remove(className);
  } else {
    element.classList.add(className);
  }
}

// Dropdowns
document.addEventListener('DOMContentLoaded', function() {
  const dropdowns = document.querySelectorAll('.playful-dropdown');
  
  document.addEventListener('click', function(event) {
    dropdowns.forEach(function(dropdown) {
      const isClickInside = dropdown.contains(event.target);
      if (!isClickInside) {
        dropdown.classList.remove('open');
      }
    });
  });
  
  dropdowns.forEach(function(dropdown) {
    dropdown.addEventListener('click', function(event) {
      event.stopPropagation();
      toggleClass(dropdown, 'open');
    });
  });
});

// Toast Notification
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `playful-toast playful-toast-${type}`;
  
  let icon = '';
  switch (type) {
    case 'success':
      icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="playful-toast-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      break;
    case 'warning':
      icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="playful-toast-icon"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      break;
    case 'error':
      icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="playful-toast-icon"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
      break;
    default:
      icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="playful-toast-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }
  
  toast.innerHTML = `
    ${icon}
    <div class="playful-toast-content">
      <div class="playful-toast-message">${message}</div>
    </div>
    <div class="playful-toast-close">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  const closeBtn = toast.querySelector('.playful-toast-close');
  closeBtn.addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// Modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
  }
}

// Tabs
function initTabs() {
  const tabContainers = document.querySelectorAll('.playful-tabs');
  
  tabContainers.forEach(container => {
    const tabs = container.querySelectorAll('.playful-tab');
    const panes = container.querySelectorAll('.playful-tab-pane');
    
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        
        tab.classList.add('active');
        panes[index].classList.add('active');
      });
    });
    
    // Activate first tab by default
    if (tabs.length > 0 && panes.length > 0) {
      tabs[0].classList.add('active');
      panes[0].classList.add('active');
    }
  });
}

// Export functions to global scope for use in React components
window.playfulUI = {
  toggleClass,
  showToast,
  openModal,
  closeModal,
  initTabs
};

// Initialize interactive components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initTabs();
});

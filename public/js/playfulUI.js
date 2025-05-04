
// PlayfulUI - JavaScript Utilities

document.addEventListener('DOMContentLoaded', () => {
  initializeSidebar();
  initializeDropdowns();
  initializeModals();
  initializeTooltips();
  initializeTabs();
});

// Sidebar functionality
function initializeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.querySelector('.sidebar-toggle');
  const overlay = document.querySelector('.mobile-sidebar-overlay');
  
  if (!sidebar || !toggleBtn) return;
  
  // Toggle sidebar on button click
  toggleBtn.addEventListener('click', () => {
    const isMobile = window.innerWidth < 1024;
    
    if (isMobile) {
      sidebar.classList.toggle('mobile-open');
      if (overlay) {
        overlay.classList.toggle('active');
      }
    } else {
      sidebar.classList.toggle('collapsed');
      
      // Store sidebar state in localStorage
      const isCollapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem('sidebar-collapsed', isCollapsed);
    }
  });
  
  // Close sidebar when clicking overlay on mobile
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
    });
  }
  
  // Restore sidebar state from localStorage
  const storedState = localStorage.getItem('sidebar-collapsed');
  if (storedState === 'true') {
    sidebar.classList.add('collapsed');
  }
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      sidebar.classList.remove('mobile-open');
      if (overlay) overlay.classList.remove('active');
    }
  });
}

// Dropdown functionality
function initializeDropdowns() {
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = toggle.closest('.dropdown');
      const menu = dropdown.querySelector('.dropdown-menu');
      
      // Close all other dropdowns
      document.querySelectorAll('.dropdown-menu.show').forEach(openMenu => {
        if (openMenu !== menu) {
          openMenu.classList.remove('show');
        }
      });
      
      // Toggle current dropdown
      menu.classList.toggle('show');
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
      menu.classList.remove('show');
    });
  });
  
  // Prevent dropdown from closing when clicking inside
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });
}

// Modal functionality
function initializeModals() {
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const modalCloseButtons = document.querySelectorAll('[data-modal-close]');
  
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.getAttribute('data-modal-target');
      const targetModal = document.getElementById(targetId);
      
      if (targetModal) {
        targetModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });
  
  modalCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal-backdrop');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
  
  // Close modal when clicking on backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.active').forEach(modal => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
  });
}

// Tooltip functionality
function initializeTooltips() {
  // This is handled via CSS with hover states
  // No additional JS needed for basic tooltips
}

// Tab functionality
function initializeTabs() {
  const tabItems = document.querySelectorAll('.tab');
  
  tabItems.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab-target');
      const tabContainer = tab.closest('.tabs-container');
      
      if (!tabContainer) return;
      
      // Deactivate all tabs
      tabContainer.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
      });
      
      // Hide all tab content
      tabContainer.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // Activate selected tab and content
      tab.classList.add('active');
      
      const targetContent = tabContainer.querySelector(tabId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

// Toast functionality
function showToast(message, type = 'info', duration = 3000) {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Set icon based on type
  let iconHtml = '';
  switch(type) {
    case 'success':
      iconHtml = '<div class="toast-icon">✓</div>';
      break;
    case 'error':
      iconHtml = '<div class="toast-icon">✕</div>';
      break;
    case 'warning':
      iconHtml = '<div class="toast-icon">!</div>';
      break;
    default:
      iconHtml = '<div class="toast-icon">i</div>';
  }
  
  // Create toast content
  toast.innerHTML = `
    ${iconHtml}
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">&times;</button>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Close button functionality
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  });
  
  // Auto remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

// Form validation utility
function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    const isRequired = input.hasAttribute('required');
    const value = input.value.trim();
    
    if (isRequired && value === '') {
      markInvalid(input, 'This field is required');
      isValid = false;
      return;
    }
    
    // Email validation
    if (input.type === 'email' && value !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        markInvalid(input, 'Please enter a valid email address');
        isValid = false;
        return;
      }
    }
    
    // URL validation
    if (input.type === 'url' && value !== '') {
      try {
        new URL(value);
      } catch (_) {
        markInvalid(input, 'Please enter a valid URL');
        isValid = false;
        return;
      }
    }
    
    // Password validation
    if (input.type === 'password' && input.hasAttribute('data-min-length')) {
      const minLength = parseInt(input.getAttribute('data-min-length'));
      if (value.length < minLength) {
        markInvalid(input, `Password must be at least ${minLength} characters`);
        isValid = false;
        return;
      }
    }
    
    // If we get here, the input is valid
    markValid(input);
  });
  
  return isValid;
}

function markInvalid(input, message) {
  input.classList.add('is-invalid');
  input.classList.remove('is-valid');
  
  // Find or create error message element
  let errorElement = input.nextElementSibling;
  if (!errorElement || !errorElement.classList.contains('form-error')) {
    errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    input.parentNode.insertBefore(errorElement, input.nextSibling);
  }
  
  errorElement.textContent = message;
}

function markValid(input) {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  
  // Remove any existing error message
  const errorElement = input.nextElementSibling;
  if (errorElement && errorElement.classList.contains('form-error')) {
    errorElement.remove();
  }
}

// Chart utilities
function createBarChart(container, data) {
  if (!container) return;
  
  // Clear any existing content
  container.innerHTML = '';
  
  // Create Y axis
  const yAxis = document.createElement('div');
  yAxis.className = 'chart-y-axis';
  container.appendChild(yAxis);
  
  // Find maximum value for scaling
  const maxValue = Math.max(...data.flatMap(item => [item.value1, item.value2]));
  const ySteps = 5;
  const stepSize = maxValue / ySteps;
  
  // Add Y axis labels and grid lines
  for (let i = 0; i <= ySteps; i++) {
    const value = Math.round((ySteps - i) * stepSize);
    const position = (i / ySteps) * 100;
    
    const label = document.createElement('div');
    label.className = 'chart-y-label';
    label.textContent = value;
    label.style.top = `${position}%`;
    yAxis.appendChild(label);
    
    const gridLine = document.createElement('div');
    gridLine.className = 'chart-y-gridline';
    gridLine.style.top = `${position}%`;
    container.appendChild(gridLine);
  }
  
  // Create bars for each data point
  data.forEach(item => {
    const barContainer = document.createElement('div');
    barContainer.className = 'chart-bar-container';
    
    const barPair = document.createElement('div');
    barPair.className = 'chart-bar-pair';
    
    // First bar
    const bar1 = document.createElement('div');
    bar1.className = 'chart-bar';
    bar1.style.height = `${(item.value1 / maxValue) * 100}%`;
    barPair.appendChild(bar1);
    
    // Second bar
    const bar2 = document.createElement('div');
    bar2.className = 'chart-bar chart-bar-secondary';
    bar2.style.height = `${(item.value2 / maxValue) * 100}%`;
    barPair.appendChild(bar2);
    
    // X axis label
    const label = document.createElement('div');
    label.className = 'chart-x-label';
    label.textContent = item.label;
    
    barContainer.appendChild(barPair);
    barContainer.appendChild(label);
    container.appendChild(barContainer);
  });
}

// Export utility functions for global use
window.PlayfulUI = {
  validateForm,
  showToast,
  createBarChart
};

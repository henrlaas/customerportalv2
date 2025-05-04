
// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.theme-toggle');
  
  if (!toggleBtn) return;
  
  // Check for saved theme preference or use device preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set initial theme
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark-mode');
    toggleBtn.setAttribute('aria-checked', 'true');
  }
  
  // Toggle theme
  toggleBtn.addEventListener('click', () => {
    const isDarkMode = document.documentElement.classList.toggle('dark-mode');
    toggleBtn.setAttribute('aria-checked', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  });
});

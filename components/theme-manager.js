// Theme Manager - Dark/Light theme switching
export class ThemeManager {
  constructor() {
    this.currentTheme = 'dark';
    this.storageKey = 'devformat_theme';
    this.listeners = [];
    this.init();
  }

  init() {
    const savedTheme = localStorage.getItem(this.storageKey);
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Apply default dark theme
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);

    // Notify listeners
    this.listeners.forEach(cb => cb({ newTheme: theme }));

    // Update any toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    });
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  onThemeChange(callback) {
    this.listeners.push(callback);
  }

  createThemeToggleButton(options = {}) {
    const btn = document.createElement('button');
    btn.className = options.className || 'theme-toggle';
    btn.setAttribute('aria-label', `Switch to ${this.currentTheme === 'dark' ? 'light' : 'dark'} mode`);
    btn.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
    btn.title = 'Toggle theme';

    btn.addEventListener('click', () => this.toggleTheme());

    return btn;
  }
}

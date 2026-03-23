// Navigation Bar Component - Sticky navigation with responsive design
export class NavigationBar {
  constructor(router = null, themeManager = null) {
    this.router = router;
    this.themeManager = themeManager;
    this.navbar = document.querySelector('.navbar');
    this.navLinks = document.querySelectorAll('.navbar-actions a');
    this.mobileMenuButton = null;
    this.mobileMenu = null;
    this.themeToggleButton = null;
    this.isMenuOpen = false;
    
    this.init();
  }

  init() {
    if (!this.navbar) {
      console.error('Navigation bar element not found');
      return;
    }

    // Set up responsive mobile menu
    this.setupMobileMenu();
    
    // Set up theme toggle button
    this.setupThemeToggle();
    
    // Set up navigation event listeners
    this.setupNavigationEvents();
    
    // Set up scroll behavior for sticky navbar
    this.setupStickyBehavior();
    
    // Set up keyboard navigation
    this.setupKeyboardNavigation();
    
    // Update active state based on current route
    this.updateActiveState();
    
    console.log('Navigation Bar component initialized');
  }

  setupMobileMenu() {
    // Mobile menu not needed — nav is now minimal (brand + 2 links + theme toggle)
    // Just wire up the close-on-outside-click for any future use
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }

  setupThemeToggle() {
    if (!this.themeManager) return;

    // Don't add a second button if one already exists
    if (this.navbar.querySelector('.theme-toggle')) return;

    const themeToggle = this.themeManager.createThemeToggleButton({ className: 'theme-toggle' });
    const navContainer = this.navbar.querySelector('.container');
    navContainer.appendChild(themeToggle);
    this.themeToggleButton = themeToggle;
  }

  setupNavigationEvents() {
    // Add click handlers to navigation links
    this.navLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        
        // Handle hash-based navigation
        if (href && href.startsWith('#')) {
          event.preventDefault();
          const route = href.slice(1) || '/';
          
          if (this.router) {
            this.router.navigate(route);
          } else {
            // Fallback to direct hash navigation
            window.location.hash = href.slice(1);
          }
          
          // Close mobile menu after navigation
          if (this.isMenuOpen) {
            this.closeMobileMenu();
          }
        }
      });
    });

    // Listen for route changes to update active state
    if (this.router) {
      this.router.onRouteChange(() => {
        this.updateActiveState();
      });
    } else {
      // Fallback: listen for hash changes
      window.addEventListener('hashchange', () => {
        this.updateActiveState();
      });
    }
  }

  setupStickyBehavior() {
    let lastScrollY = window.scrollY;
    let isScrollingDown = false;
    
    // Add scroll listener for enhanced sticky behavior
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      isScrollingDown = currentScrollY > lastScrollY;
      
      // Add/remove scrolled class for styling
      if (currentScrollY > 50) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
      
      // Optional: Hide navbar when scrolling down (can be enabled via CSS)
      if (isScrollingDown && currentScrollY > 200) {
        this.navbar.classList.add('scroll-hidden');
      } else {
        this.navbar.classList.remove('scroll-hidden');
      }
      
      lastScrollY = currentScrollY;
    });
  }

  setupKeyboardNavigation() {
    // Add keyboard navigation support
    this.navLinks.forEach((link, index) => {
      link.addEventListener('keydown', (event) => {
        switch (event.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            event.preventDefault();
            this.focusNextLink(index);
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            event.preventDefault();
            this.focusPreviousLink(index);
            break;
          case 'Home':
            event.preventDefault();
            this.navLinks[0].focus();
            break;
          case 'End':
            event.preventDefault();
            this.navLinks[this.navLinks.length - 1].focus();
            break;
        }
      });
    });
  }

  focusNextLink(currentIndex) {
    const nextIndex = (currentIndex + 1) % this.navLinks.length;
    this.navLinks[nextIndex].focus();
  }

  focusPreviousLink(currentIndex) {
    const prevIndex = currentIndex === 0 ? this.navLinks.length - 1 : currentIndex - 1;
    this.navLinks[prevIndex].focus();
  }

  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    this.isMenuOpen = true;
    this.navbar.classList.add('menu-open');
    this.mobileMenu.classList.add('mobile-open');
    
    if (this.mobileMenuButton) {
      this.mobileMenuButton.setAttribute('aria-expanded', 'true');
      this.mobileMenuButton.classList.add('active');
    }
    
    // Focus first menu item for accessibility
    const firstLink = this.mobileMenu.querySelector('a');
    if (firstLink) {
      firstLink.focus();
    }
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    this.navbar.classList.remove('menu-open');
    this.mobileMenu.classList.remove('mobile-open');
    
    if (this.mobileMenuButton) {
      this.mobileMenuButton.setAttribute('aria-expanded', 'false');
      this.mobileMenuButton.classList.remove('active');
    }
  }

  updateActiveState() {
    // Get current route
    const currentRoute = window.location.hash.slice(1) || '/';
    
    // Remove active class from all links
    this.navLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to current route link
    const activeLink = this.findLinkByRoute(currentRoute);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  findLinkByRoute(route) {
    // Find link that matches the current route
    for (const link of this.navLinks) {
      const href = link.getAttribute('href');
      if (href) {
        const linkRoute = href.startsWith('#') ? href.slice(1) : href;
        if (linkRoute === route || (route === '/' && linkRoute === '')) {
          return link;
        }
      }
    }
    return null;
  }

  // Public method to highlight a specific navigation item
  setActiveRoute(route) {
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href) {
        const linkRoute = href.startsWith('#') ? href.slice(1) : href;
        if (linkRoute === route || (route === '/' && linkRoute === '')) {
          link.classList.add('active');
        }
      }
    });
  }

  // Public method to add a new navigation item
  addNavigationItem(text, route, position = -1) {
    const newItem = document.createElement('li');
    newItem.setAttribute('role', 'none');
    
    const newLink = document.createElement('a');
    newLink.setAttribute('href', `#${route}`);
    newLink.setAttribute('role', 'menuitem');
    newLink.setAttribute('aria-label', text);
    newLink.textContent = text;
    
    newItem.appendChild(newLink);
    
    if (position === -1 || position >= this.mobileMenu.children.length) {
      this.mobileMenu.appendChild(newItem);
    } else {
      this.mobileMenu.insertBefore(newItem, this.mobileMenu.children[position]);
    }
    
    // Update navLinks collection
    this.navLinks = document.querySelectorAll('.navbar-actions a');
    
    // Set up event listener for new link
    this.setupNavigationEvents();
  }

  // Public method to remove a navigation item
  removeNavigationItem(route) {
    const linkToRemove = this.findLinkByRoute(route);
    if (linkToRemove && linkToRemove.parentElement) {
      linkToRemove.parentElement.remove();
      // Update navLinks collection
      this.navLinks = document.querySelectorAll('.navbar-actions a');
    }
  }

  // Public method to check if navigation is responsive
  isResponsive() {
    return window.innerWidth <= 768;
  }

  // Public method to get current active route
  getActiveRoute() {
    const activeLink = this.navbar.querySelector('.navbar-nav a.active');
    if (activeLink) {
      const href = activeLink.getAttribute('href');
      return href ? href.slice(1) || '/' : '/';
    }
    return '/';
  }

  // Clean up event listeners
  destroy() {
    if (this.mobileMenuButton) {
      this.mobileMenuButton.removeEventListener('click', this.toggleMobileMenu);
    }
    
    // Remove other event listeners would require storing references
    // For now, this is a basic cleanup
    console.log('Navigation Bar component destroyed');
  }
}
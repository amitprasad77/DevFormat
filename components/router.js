// Router Component - Hash-based routing for static hosting compatibility
export class Router {
  constructor(seoManager = null) {
    this.routes = new Map();
    this.currentRoute = null;
    this.defaultRoute = '/';
    this.seoManager = seoManager;
    this.routeChangeCallbacks = [];
    this.init();
  }

  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRouteChange());
    window.addEventListener('load', () => this.handleRouteChange());
  }

  register(path, handler) {
    this.routes.set(path, handler);
  }

  // Add callback for route change events
  onRouteChange(callback) {
    this.routeChangeCallbacks.push(callback);
  }

  // Set SEO Manager for dynamic meta tag updates
  setSEOManager(seoManager) {
    this.seoManager = seoManager;
  }

  navigate(path) {
    if (path !== this.currentRoute) {
      window.location.hash = path === '/' ? '' : path;
    }
  }

  // Get all registered routes
  getRoutes() {
    return Array.from(this.routes.keys());
  }

  // Check if a route exists
  hasRoute(path) {
    return this.routes.has(path);
  }

  handleRouteChange() {
    const hash = window.location.hash.slice(1) || '/';
    const route = this.routes.get(hash) || this.routes.get(this.defaultRoute);
    
    if (route && hash !== this.currentRoute) {
      const previousRoute = this.currentRoute;
      this.currentRoute = hash;
      
      // Update SEO meta tags if SEO Manager is available
      if (this.seoManager) {
        this.seoManager.updateMeta(hash);
      }
      
      // Update active navigation
      this.updateActiveNavigation(hash);
      
      // Execute route handler
      if (typeof route === 'function') {
        route();
      }
      
      // Notify route change callbacks
      this.routeChangeCallbacks.forEach(callback => {
        try {
          callback(hash, previousRoute);
        } catch (error) {
          console.error('Route change callback error:', error);
        }
      });
    }
  }

  updateActiveNavigation(currentPath) {
    // Remove active class from all nav links
    document.querySelectorAll('.navbar-nav a').forEach(link => {
      link.classList.remove('active');
    });

    // Add active class to current route link
    const activeLink = document.querySelector(`[href="#${currentPath}"]`) || 
                      document.querySelector(`[href="${currentPath}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  getCurrentRoute() {
    return this.currentRoute;
  }
}
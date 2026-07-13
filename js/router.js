export class Router {
  constructor() {
    this.routes = [];
    this.currentView = null;

    // Listen for popstate (browser back/forward button clicks)
    window.addEventListener('popstate', () => this.handleRoute());

    // Intercept clicks on links
    window.addEventListener('click', e => {
      const link = e.target.closest('a');
      if (link && link.href) {
        const url = new URL(link.href);
        const isInternal = url.origin === window.location.origin;
        const hasTarget = link.getAttribute('target');
        
        // Skip for external, target="_blank", or files
        if (isInternal && !hasTarget && !link.hasAttribute('download')) {
          e.preventDefault();
          this.navigate(url.pathname + url.search);
        }
      }
    });
  }

  // Define a route pattern and its rendering function
  addRoute(pattern, handler) {
    // Compile pattern to regex and extract param names
    // E.g., "/products/:handle" -> regex: ^/products/([^/]+)$ , params: ['handle']
    const paramNames = [];
    const regexSource = pattern
      .replace(/\/$/, '') // remove trailing slash
      .replace(/:\w+/g, match => {
        paramNames.push(match.substring(1));
        return '([^/]+)';
      });
    const regex = new RegExp(`^${regexSource || '/'}$`);

    this.routes.push({ pattern, regex, paramNames, handler });
  }

  // Programmatically navigate to a path
  navigate(path) {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  // Match the current URL path against registered routes
  async handleRoute() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    const searchParams = new URLSearchParams(window.location.search);
    
    let matched = false;

    // Show a global loading spinner or clear content area
    const appContent = document.getElementById('app-content');
    if (appContent) {
      appContent.innerHTML = `
        <div class="page-loader">
          <div class="spinner"></div>
        </div>
      `;
    }

    for (const route of this.routes) {
      const match = path.match(route.regex);
      if (match) {
        matched = true;
        const params = {};
        route.paramNames.forEach((name, idx) => {
          params[name] = decodeURIComponent(match[idx + 1]);
        });
        
        // Pass search query parameters as well
        const query = {};
        for (const [key, value] of searchParams.entries()) {
          query[key] = value;
        }

        try {
          // Run the route's rendering handler
          const viewHtml = await route.handler(params, query);
          if (appContent) {
            appContent.innerHTML = '';
            if (typeof viewHtml === 'string') {
              appContent.innerHTML = viewHtml;
            } else if (viewHtml instanceof Node) {
              appContent.appendChild(viewHtml);
            }
          }
        } catch (error) {
          console.error(`Error rendering route ${route.pattern}:`, error);
          if (appContent) {
            appContent.innerHTML = `
              <div class="error-container text-center">
                <h2>Something went wrong</h2>
                <p>${error.message}</p>
                <a href="/" class="btn btn-primary mt-4">Go Home</a>
              </div>
            `;
          }
        }
        break;
      }
    }

    if (!matched) {
      // 404 Page
      if (appContent) {
        appContent.innerHTML = `
          <div class="error-container text-center">
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
            <a href="/" class="btn btn-primary mt-4">Back to Homepage</a>
          </div>
        `;
      }
    }

    // Scroll to top of window after route change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

export const router = new Router();

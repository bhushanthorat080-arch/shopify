import { router } from './router.js';
import { storeState } from './state.js';
import { header, updateHeaderActiveLink } from './components/Header.js';
import { Footer } from './components/Footer.js';

// Import Page Views
import { ProductPage } from './pages/ProductPage.js';
import { CollectionPage } from './pages/CollectionPage.js';
import { SearchPage } from './pages/SearchPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { AccountPage } from './pages/AccountPage.js';

// Register Routes
// Redirect the root page (Home) directly to our featured Interactive Audio Book product landing page
router.addRoute('/', () => ProductPage({ handle: 'smarttalk-learning-book-interactive-audio-touch-learning-book-for-kids' }));
router.addRoute('/products/:handle', ProductPage);
router.addRoute('/collections/:handle', CollectionPage);
router.addRoute('/search', SearchPage);
router.addRoute('/login', LoginPage);
router.addRoute('/register', RegisterPage);
router.addRoute('/account', AccountPage);

// Application Bootstrapper
async function initApp() {
  // 1. Mount footer
  const footerContainer = document.getElementById('site-footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = Footer();
  }

  // 2. Initialize header layout and state connections
  header.render();

  // 3. Initialize state store (asynchronously checks localStorage for cart and session tokens)
  await storeState.initialize();

  // 4. Initial route rendering
  await router.handleRoute();

  // 5. Connect navigation wrapper overrides to trigger active path checks on header
  window.addEventListener('popstate', () => {
    updateHeaderActiveLink();
  });

  const originalPushState = window.history.pushState;
  window.history.pushState = function (...args) {
    originalPushState.apply(this, args);
    updateHeaderActiveLink();
  };
}

// Global click listeners for delegated actions
document.addEventListener('click', async (e) => {
  // Quick Add To Cart delegation (reused on lists if any)
  const quickAdd = e.target.closest('.btn-quick-add');
  if (quickAdd) {
    e.preventDefault();
    const variantId = quickAdd.dataset.variantId;
    if (variantId) {
      try {
        quickAdd.disabled = true;
        quickAdd.classList.add('loading-state');
        
        await storeState.addCartItem(variantId, 1);
        
        quickAdd.classList.remove('loading-state');
        quickAdd.classList.add('success-state');
        
        setTimeout(() => {
          quickAdd.classList.remove('success-state');
          quickAdd.disabled = false;
        }, 1500);
      } catch (err) {
        console.error('Quick add item failed:', err);
        quickAdd.classList.remove('loading-state');
        quickAdd.disabled = false;
      }
    }
  }
});

// Start app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

import { storeState } from '../state.js';
import { cartDrawer } from './CartDrawer.js';

class Header {
  constructor() {
    this.el = null;
    this.init();
  }

  init() {
    let headerEl = document.getElementById('site-header');
    if (!headerEl) {
      headerEl = document.createElement('header');
      headerEl.id = 'site-header';
      headerEl.className = 'site-header';
      document.body.insertBefore(headerEl, document.body.firstChild);
    }
    this.el = headerEl;

    // Register state change listeners
    storeState.addEventListener('cart-updated', () => this.render());
    storeState.addEventListener('customer-updated', () => this.render());

    // Intercept clicks on header buttons
    this.el.addEventListener('click', (e) => {
      const cartToggle = e.target.closest('#header-cart-toggle');
      if (cartToggle) {
        e.preventDefault();
        cartDrawer.open();
        return;
      }

      const mobileMenuToggle = e.target.closest('.mobile-menu-toggle');
      if (mobileMenuToggle) {
        const nav = this.el.querySelector('.main-nav');
        nav.classList.toggle('open');
        mobileMenuToggle.classList.toggle('active');
        return;
      }
    });

    this.render();
  }

  render() {
    const cartCount = storeState.cartCount;
    const customer = storeState.customer;
    const currentPath = window.location.pathname;

    this.el.innerHTML = `
      <div class="header-container container">
        <a href="/" class="site-logo">
          <span class="logo-accent">Smart</span>Talk
        </a>

        <nav class="main-nav">
          <a href="/" class="nav-link ${currentPath === '/' ? 'active' : ''}">Intelligence Book</a>
          <a href="/search" class="nav-link ${currentPath === '/search' ? 'active' : ''}">Search Catalog</a>
        </nav>

        <div class="header-actions">
          <!-- Simplified Account Link -->
          <a href="${customer ? '/account' : '/login'}" class="header-account-link" aria-label="Account">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span class="d-none-mobile account-text" style="font-weight: 700;">${customer ? `Hi, ${customer.firstName}` : 'Sign In'}</span>
          </a>

          <!-- Cart Drawer Button -->
          <button id="header-cart-toggle" class="header-cart-btn" aria-label="Open cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
            ${cartCount > 0 ? `<span class="cart-badge">${cartCount}</span>` : ''}
          </button>

          <!-- Mobile Menu Toggler (Aligned on far right) -->
          <button class="mobile-menu-toggle" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    `;
  }
}

export const header = new Header();
export function updateHeaderActiveLink() {
  header.render();
}

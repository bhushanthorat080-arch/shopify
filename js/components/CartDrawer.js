import { storeState } from '../state.js';

class CartDrawer {
  constructor() {
    this.el = null;
    this.init();
  }

  init() {
    // Check if drawer element already exists
    let drawerEl = document.getElementById('cart-drawer');
    if (!drawerEl) {
      drawerEl = document.createElement('div');
      drawerEl.id = 'cart-drawer';
      drawerEl.className = 'cart-drawer';
      document.body.appendChild(drawerEl);
    }
    this.el = drawerEl;

    // Attach event listeners
    storeState.addEventListener('cart-updated', () => this.render());
    storeState.addEventListener('cart-loading', (e) => this.toggleLoading(e.detail));

    // Handle clicks inside the drawer
    this.el.addEventListener('click', async (e) => {
      const closeBtn = e.target.closest('.cart-drawer-close');
      if (closeBtn || e.target === this.el) {
        this.close();
        return;
      }

      // Quantity buttons
      const qtyBtn = e.target.closest('.cart-qty-btn');
      if (qtyBtn) {
        const lineId = qtyBtn.dataset.lineId;
        const currentQty = parseInt(qtyBtn.dataset.qty, 10);
        const action = qtyBtn.dataset.action;
        const newQty = action === 'increase' ? currentQty + 1 : currentQty - 1;
        
        try {
          qtyBtn.disabled = true;
          await storeState.updateItemQuantity(lineId, newQty);
        } catch (err) {
          console.error(err);
          qtyBtn.disabled = false;
        }
        return;
      }

      // Remove button
      const removeBtn = e.target.closest('.cart-remove-btn');
      if (removeBtn) {
        const lineId = removeBtn.dataset.lineId;
        try {
          removeBtn.disabled = true;
          await storeState.removeItem(lineId);
        } catch (err) {
          console.error(err);
          removeBtn.disabled = false;
        }
        return;
      }

      // Checkout button
      const checkoutBtn = e.target.closest('.btn-checkout');
      if (checkoutBtn) {
        e.preventDefault();
        const checkoutUrl = storeState.cart?.checkoutUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        }
      }
    });

    this.render();
  }

  open() {
    this.el.classList.add('open');
    document.body.classList.add('cart-open');
  }

  close() {
    this.el.classList.remove('open');
    document.body.classList.remove('cart-open');
  }

  toggleLoading(isLoading) {
    if (isLoading) {
      this.el.classList.add('loading');
    } else {
      this.el.classList.remove('loading');
    }
  }

  formatPrice(amount, currencyCode) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD'
    }).format(amount);
  }

  render() {
    const cart = storeState.cart;
    const count = storeState.cartCount;

    let itemsHtml = '';
    if (!cart || cart.lines.length === 0) {
      itemsHtml = `
        <div class="cart-drawer-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
          <p>Your cart is empty</p>
          <button class="btn btn-secondary cart-drawer-close">Start Shopping</button>
        </div>
      `;
    } else {
      itemsHtml = `
        <div class="cart-drawer-items">
          ${cart.lines.map(line => {
            const variant = line.variant;
            const price = variant?.price;
            const formattedPrice = this.formatPrice(price?.amount || 0, price?.currencyCode);
            const image = variant?.image?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop';
            const productTitle = variant?.product?.title || 'Product';
            const variantTitle = variant?.title !== 'Default Title' ? variant.title : '';

            return `
              <div class="cart-item" data-line-id="${line.id}">
                <img src="${image}" alt="${productTitle}" class="cart-item-image">
                <div class="cart-item-details">
                  <h4 class="cart-item-title">${productTitle}</h4>
                  ${variantTitle ? `<span class="cart-item-variant">${variantTitle}</span>` : ''}
                  <span class="cart-item-price">${formattedPrice}</span>
                  <div class="cart-item-actions">
                    <div class="cart-qty-selector">
                      <button class="cart-qty-btn" data-line-id="${line.id}" data-qty="${line.quantity}" data-action="decrease" ${line.quantity <= 1 ? 'disabled' : ''}>-</button>
                      <span class="cart-qty-value">${line.quantity}</span>
                      <button class="cart-qty-btn" data-line-id="${line.id}" data-qty="${line.quantity}" data-action="increase">+</button>
                    </div>
                    <button class="cart-remove-btn" data-line-id="${line.id}" aria-label="Remove item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="cart-drawer-summary">
          <div class="cart-summary-row">
            <span>Subtotal</span>
            <span>${this.formatPrice(cart.subtotal.amount, cart.subtotal.currencyCode)}</span>
          </div>
          <p class="cart-tax-note">Shipping and taxes calculated at checkout.</p>
          <a href="${cart.checkoutUrl}" class="btn btn-primary btn-checkout w-full">
            Proceed to Checkout
          </a>
        </div>
      `;
    }

    this.el.innerHTML = `
      <div class="cart-drawer-overlay"></div>
      <div class="cart-drawer-panel">
        <div class="cart-drawer-header">
          <h3>Your Cart (${count})</h3>
          <button class="cart-drawer-close" aria-label="Close cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        ${itemsHtml}
      </div>
    `;
  }
}

export const cartDrawer = new CartDrawer();

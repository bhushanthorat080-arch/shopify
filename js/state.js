import { 
  fetchCart, 
  createCart, 
  addToCart, 
  updateCartLine, 
  removeFromCart,
  customerLogin,
  fetchCustomerData
} from './api.js';

class StoreState extends EventTarget {
  constructor() {
    super();
    this.state = {
      cart: null,
      cartLoading: false,
      customer: null,
      customerToken: localStorage.getItem('shopify_customer_token') || null,
      customerTokenExpiry: localStorage.getItem('shopify_customer_token_expiry') || null,
      customerLoading: false,
    };
  }

  // Helper to trigger events
  emit(eventName, data = {}) {
    this.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }

  // Getters
  get cart() { return this.state.cart; }
  get cartLoading() { return this.state.cartLoading; }
  get customer() { return this.state.customer; }
  get customerToken() { return this.state.customerToken; }
  get customerLoading() { return this.state.customerLoading; }
  get cartCount() {
    if (!this.state.cart || !this.state.cart.lines) return 0;
    return this.state.cart.lines.reduce((total, line) => total + line.quantity, 0);
  }

  // Initialize state from LocalStorage
  async initialize() {
    // 1. Initialize Cart
    const storedCartId = localStorage.getItem('shopify_cart_id');
    if (storedCartId) {
      this.state.cartLoading = true;
      this.emit('cart-loading', true);
      try {
        const cart = await fetchCart(storedCartId);
        if (cart) {
          this.state.cart = cart;
        } else {
          // If cart expired on Shopify, clear stored ID
          localStorage.removeItem('shopify_cart_id');
        }
      } catch (err) {
        console.error('Failed to load cart:', err);
      } finally {
        this.state.cartLoading = false;
        this.emit('cart-loading', false);
        this.emit('cart-updated', this.state.cart);
      }
    }

    // 2. Initialize Customer Session
    if (this.state.customerToken) {
      const expiry = new Date(this.state.customerTokenExpiry);
      if (expiry > new Date()) {
        this.state.customerLoading = true;
        this.emit('customer-loading', true);
        try {
          const profile = await fetchCustomerData(this.state.customerToken);
          if (profile) {
            this.state.customer = profile;
          } else {
            this.clearCustomerSession();
          }
        } catch (err) {
          console.error('Failed to load customer profile:', err);
          this.clearCustomerSession();
        } finally {
          this.state.customerLoading = false;
          this.emit('customer-loading', false);
          this.emit('customer-updated', this.state.customer);
        }
      } else {
        this.clearCustomerSession();
      }
    }
  }

  // Cart operations
  async addCartItem(variantId, quantity = 1) {
    this.state.cartLoading = true;
    this.emit('cart-loading', true);
    try {
      let cart;
      const storedCartId = localStorage.getItem('shopify_cart_id');
      if (!storedCartId) {
        cart = await createCart(variantId, quantity);
        if (cart) {
          localStorage.setItem('shopify_cart_id', cart.id);
        }
      } else {
        cart = await addToCart(storedCartId, variantId, quantity);
      }
      this.state.cart = cart;
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      throw err;
    } finally {
      this.state.cartLoading = false;
      this.emit('cart-loading', false);
      this.emit('cart-updated', this.state.cart);
    }
  }

  async updateItemQuantity(lineId, quantity) {
    const storedCartId = localStorage.getItem('shopify_cart_id');
    if (!storedCartId) return;

    this.state.cartLoading = true;
    this.emit('cart-loading', true);
    try {
      let cart;
      if (quantity <= 0) {
        cart = await removeFromCart(storedCartId, lineId);
      } else {
        cart = await updateCartLine(storedCartId, lineId, quantity);
      }
      this.state.cart = cart;
    } catch (err) {
      console.error('Failed to update quantity:', err);
      throw err;
    } finally {
      this.state.cartLoading = false;
      this.emit('cart-loading', false);
      this.emit('cart-updated', this.state.cart);
    }
  }

  async removeItem(lineId) {
    await this.updateItemQuantity(lineId, 0);
  }

  // Customer Session operations
  async login(email, password) {
    this.state.customerLoading = true;
    this.emit('customer-loading', true);
    try {
      const tokenData = await customerLogin(email, password);
      if (tokenData) {
        this.state.customerToken = tokenData.accessToken;
        this.state.customerTokenExpiry = tokenData.expiresAt;
        localStorage.setItem('shopify_customer_token', tokenData.accessToken);
        localStorage.setItem('shopify_customer_token_expiry', tokenData.expiresAt);

        // Fetch user data
        const profile = await fetchCustomerData(tokenData.accessToken);
        this.state.customer = profile;
        this.emit('customer-updated', this.state.customer);
        return profile;
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      this.state.customerLoading = false;
      this.emit('customer-loading', false);
    }
  }

  logout() {
    this.clearCustomerSession();
    this.emit('customer-updated', null);
  }

  clearCustomerSession() {
    this.state.customerToken = null;
    this.state.customerTokenExpiry = null;
    this.state.customer = null;
    localStorage.removeItem('shopify_customer_token');
    localStorage.removeItem('shopify_customer_token_expiry');
  }
}

export const storeState = new StoreState();

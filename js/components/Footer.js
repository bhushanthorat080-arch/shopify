export function Footer() {
  return `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-col brand-col">
          <a href="/" class="site-logo footer-logo">
            <span class="logo-accent">GZ</span>IRVY
          </a>
          <p class="footer-desc">
            A premium headless commerce experience powered by Shopify Storefront GraphQL API. Fast, secure, and modern.
          </p>
          <div class="footer-socials">
            <a href="#" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
            </a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Shop</h4>
          <ul class="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/collections/frontpage">Featured Collection</a></li>
            <li><a href="/search">Search Products</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Account</h4>
          <ul class="footer-links">
            <li><a href="/login">Sign In</a></li>
            <li><a href="/register">Register</a></li>
            <li><a href="/account">My Account</a></li>
          </ul>
        </div>

        <div class="footer-col newsletter-col">
          <h4>Newsletter</h4>
          <p>Subscribe to receive product updates, news, and special offers.</p>
          <form class="footer-newsletter-form" onsubmit="event.preventDefault(); alert('Subscribed!'); this.reset();">
            <input type="email" placeholder="Your email address" required aria-label="Email address">
            <button type="submit" class="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </div>

      <div class="container footer-bottom">
        <p>&copy; ${new Date().getFullYear()} Gzirvy Storefront. All rights reserved.</p>
        <div class="payment-icons">
          <!-- Mock payment icons -->
          <span class="payment-badge">Visa</span>
          <span class="payment-badge">Mastercard</span>
          <span class="payment-badge">Amex</span>
          <span class="payment-badge">Apple Pay</span>
        </div>
      </div>
    </footer>
  `;
}

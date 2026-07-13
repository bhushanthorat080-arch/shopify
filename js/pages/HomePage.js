import { fetchCollections, fetchCollectionProducts } from '../api.js';
import { ProductCard } from '../components/ProductCard.js';

export async function HomePage() {
  try {
    // 1. Fetch data
    const collections = await fetchCollections(4);
    
    // Find collection handle to display products
    let featuredProducts = [];
    let featuredCollectionTitle = 'Featured Products';
    let featuredCollectionHandle = 'frontpage';

    if (collections.length > 0) {
      // Prefer 'frontpage' or 'featured' collections if they exist, otherwise use first
      const featuredCol = collections.find(c => c.handle === 'frontpage' || c.handle === 'featured') || collections[0];
      featuredCollectionHandle = featuredCol.handle;
      featuredCollectionTitle = featuredCol.title;

      const colDetails = await fetchCollectionProducts(featuredCollectionHandle, 8);
      if (colDetails) {
        featuredProducts = colDetails.products;
      }
    }

    // 2. Generate HTML
    const collectionsHtml = collections.map(col => {
      const img = col.image?.url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop';
      return `
        <a href="/collections/${col.handle}" class="collection-category-card">
          <div class="category-card-image-wrapper">
            <img src="${img}" alt="${col.title}" loading="lazy">
          </div>
          <div class="category-card-overlay">
            <h3>${col.title}</h3>
            <span class="category-card-link-text">Shop Collection &rarr;</span>
          </div>
        </a>
      `;
    }).join('');

    const productsHtml = featuredProducts.length > 0 
      ? `
        <div class="products-grid">
          ${featuredProducts.map(prod => ProductCard(prod)).join('')}
        </div>
      `
      : `
        <div class="empty-state text-center">
          <p>No featured products found. Please check your Shopify Admin Panel products.</p>
        </div>
      `;

    return `
      <div class="home-page">
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="hero-content">
            <h1 class="hero-title animate-fade-in">Discover Premium Headless Commerce</h1>
            <p class="hero-subtitle animate-fade-in-delayed">Experience blisteringly fast load times and a beautiful design driven by Shopify's GraphQL API.</p>
            <div class="hero-ctas animate-fade-in-delayed">
              <a href="/collections/${featuredCollectionHandle}" class="btn btn-primary btn-lg">Shop Featured</a>
              <a href="/search" class="btn btn-secondary btn-lg">Search Catalog</a>
            </div>
          </div>
          <div class="hero-bg-overlay"></div>
        </section>

        <!-- Collections Showcase -->
        <section class="collections-section container">
          <div class="section-header">
            <h2>Shop by Collection</h2>
            <p>Curated categories to match your style</p>
          </div>
          <div class="collections-grid">
            ${collectionsHtml}
          </div>
        </section>

        <!-- Featured Products -->
        <section class="featured-products-section container">
          <div class="section-header">
            <h2>${featuredCollectionTitle}</h2>
            <p>Our top picks, hand-selected just for you</p>
          </div>
          ${productsHtml}
        </section>

        <!-- Features Bar -->
        <section class="features-bar container">
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </div>
            <div class="feature-text">
              <h3>Fast Shipping</h3>
              <p>Free delivery on orders over $100</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div class="feature-text">
              <h3>Secure Checkout</h3>
              <p>Direct integration with Shopify Payment</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div class="feature-text">
              <h3>24/7 Support</h3>
              <p>Friendly expert support anytime</p>
            </div>
          </div>
        </section>
      </div>
    `;
  } catch (error) {
    console.error('Home page render error:', error);
    return `
      <div class="container text-center py-12">
        <h2>Failed to load Homepage data</h2>
        <p>${error.message}</p>
        <p class="mt-4 text-muted">Ensure your Shopify credentials are correct and Storefront API has public access enabled.</p>
      </div>
    `;
  }
}

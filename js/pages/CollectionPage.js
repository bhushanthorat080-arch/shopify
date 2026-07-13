import { fetchCollectionProducts } from '../api.js';
import { ProductCard } from '../components/ProductCard.js';

export async function CollectionPage(params) {
  const { handle } = params;
  
  try {
    const collection = await fetchCollectionProducts(handle, 24);
    
    if (!collection) {
      return `
        <div class="container text-center py-12">
          <h2>Collection Not Found</h2>
          <p>The collection with handle "${handle}" could not be loaded.</p>
          <a href="/" class="btn btn-primary mt-4">Go Home</a>
        </div>
      `;
    }

    const bannerImage = collection.image?.url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop';
    
    const productsHtml = collection.products.length > 0
      ? `
        <div class="products-grid">
          ${collection.products.map(prod => ProductCard(prod)).join('')}
        </div>
      `
      : `
        <div class="empty-state text-center py-12">
          <p>No products found in this collection.</p>
          <a href="/" class="btn btn-secondary mt-4">Go Home</a>
        </div>
      `;

    return `
      <div class="collection-page">
        <!-- Collection Banner -->
        <div class="collection-banner" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${bannerImage}')">
          <div class="collection-banner-content container">
            <h1>${collection.title}</h1>
            ${collection.description ? `<p>${collection.description}</p>` : ''}
          </div>
        </div>

        <!-- Products List -->
        <div class="container py-8">
          <div class="collection-toolbar">
            <span class="product-count">${collection.products.length} Products</span>
          </div>
          ${productsHtml}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering collection:', error);
    return `
      <div class="container text-center py-12">
        <h2>Error Loading Collection</h2>
        <p>${error.message}</p>
        <a href="/" class="btn btn-primary mt-4">Back to Shop</a>
      </div>
    `;
  }
}

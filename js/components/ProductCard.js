export function ProductCard(product) {
  const image = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop';
  const price = product.priceRange?.minVariantPrice;
  const priceFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price?.currencyCode || 'USD'
  }).format(price?.amount || 0);

  const variantId = product.variants?.[0]?.id || '';

  return `
    <div class="product-card" data-handle="${product.handle}">
      <a href="/products/${product.handle}" class="product-card-media-wrapper">
        <img src="${image}" alt="${product.title}" class="product-card-image" loading="lazy">
      </a>
      <div class="product-card-details">
        <span class="product-card-vendor">${product.vendor || 'Shopify'}</span>
        <a href="/products/${product.handle}" class="product-card-title-link">
          <h3 class="product-card-title">${product.title}</h3>
        </a>
        <div class="product-card-footer">
          <span class="product-card-price">${priceFormatted}</span>
          ${variantId ? `
            <button class="btn btn-quick-add" data-variant-id="${variantId}" aria-label="Add ${product.title} to cart">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

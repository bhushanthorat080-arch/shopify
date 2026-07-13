import { fetchProductByHandle, createCart } from '../api.js';
import { storeState } from '../state.js';

export async function ProductPage(params) {
  const { handle } = params;
  
  const product = await fetchProductByHandle(handle);
  if (!product) {
    const errorEl = document.createElement('div');
    errorEl.className = 'container text-center py-12';
    errorEl.innerHTML = `
      <h2>Product Not Found</h2>
      <p>The product with handle "${handle}" could not be found.</p>
      <a href="/" class="btn btn-primary mt-4">Go Home</a>
    `;
    return errorEl;
  }

  // Create the main wrapper element
  const pageContainer = document.createElement('div');
  pageContainer.className = 'product-page container py-8';

  // Initialize selected options (Default Title since single product has default variant)
  const selectedOptions = {};
  if (product.variants.length > 0) {
    product.variants[0].selectedOptions.forEach(opt => {
      selectedOptions[opt.name] = opt.value;
    });
  } else {
    product.options.forEach(opt => {
      selectedOptions[opt.name] = opt.values[0];
    });
  }

  let quantity = 1;

  // Helper to find matching variant
  function getSelectedVariant() {
    return product.variants.find(variant => 
      variant.selectedOptions.every(opt => selectedOptions[opt.name] === opt.value)
    );
  }

  function formatPrice(amount, currencyCode) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD'
    }).format(amount);
  }

  // Render function that rebuilds/updates the interactive UI parts
  function updateUI() {
    const activeVariant = getSelectedVariant();
    
    // 1. Update Price
    const priceEl = pageContainer.querySelector('.product-price');
    if (priceEl && activeVariant) {
      priceEl.innerHTML = `
        ${formatPrice(activeVariant.price.amount, activeVariant.price.currencyCode)}
        <span class="product-price-suffix">(Tax included)</span>
      `;
    }

    // 2. Update Image Gallery active image
    const mainImg = pageContainer.querySelector('.main-product-image');
    if (mainImg && activeVariant && activeVariant.image) {
      mainImg.src = activeVariant.image.url;
      mainImg.alt = activeVariant.image.altText || product.title;
    }

    // 3. Update Buttons state
    const buyNowBtn = pageContainer.querySelector('.btn-buy-now');
    const addToCartBtn = pageContainer.querySelector('.btn-add-to-cart');
    
    if (buyNowBtn && addToCartBtn) {
      if (!activeVariant) {
        buyNowBtn.textContent = 'Unavailable';
        buyNowBtn.disabled = true;
        addToCartBtn.textContent = 'Unavailable';
        addToCartBtn.disabled = true;
      } else if (!activeVariant.availableForSale) {
        buyNowBtn.textContent = 'Sold Out';
        buyNowBtn.disabled = true;
        addToCartBtn.textContent = 'Sold Out';
        addToCartBtn.disabled = true;
      } else {
        buyNowBtn.textContent = 'Buy It Now 🚀';
        buyNowBtn.disabled = false;
        addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.disabled = false;
      }
    }

    // 4. Update Option Selection Classes
    product.options.forEach(opt => {
      const optionValues = pageContainer.querySelectorAll(`.option-value[data-option-name="${opt.name}"]`);
      optionValues.forEach(btn => {
        if (btn.dataset.optionValue === selectedOptions[opt.name]) {
          btn.classList.add('selected');
        } else {
          btn.classList.remove('selected');
        }
      });
    });
  }

  // Generate initial HTML layout
  const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop';
  const price = product.priceRange?.minVariantPrice;
  const formattedPrice = formatPrice(price?.amount || 0, price?.currencyCode);

  const imagesHtml = product.images.length > 1
    ? `
      <div class="product-gallery-thumbnails">
        ${product.images.map((img, index) => `
          <button class="gallery-thumb-btn ${index === 0 ? 'active' : ''}" data-image-url="${img.url}">
            <img src="${img.url}" alt="${img.altText || product.title}" loading="lazy">
          </button>
        `).join('')}
      </div>
    `
    : '';

  const optionsHtml = product.options.map(opt => {
    // Hide default option title if it's Shopify default
    if (opt.name === 'Title' && opt.values.includes('Default Title')) return '';

    return `
      <div class="product-option-selector">
        <span class="option-label">${opt.name}:</span>
        <div class="option-values-grid">
          ${opt.values.map(val => `
            <button class="option-value" 
                    data-option-name="${opt.name}" 
                    data-option-value="${val}">
              ${val}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  pageContainer.innerHTML = `
    <!-- Top-Level Breadcrumb or Subtitle -->
    <div class="text-center mb-6">
      <span class="badge bg-voice">★ Play, Listen & Learn Fun Fun Fun ★</span>
    </div>

    <div class="product-grid">
      <!-- Media Gallery -->
      <div class="product-media-gallery">
        <div class="product-main-image-wrapper">
          <img src="${primaryImage}" alt="${product.title}" class="main-product-image">
        </div>
        ${imagesHtml}
      </div>

      <!-- Product Purchase Panel (Call to Action First!) -->
      <div class="product-info-panel">
        <span class="product-vendor">${product.vendor}</span>
        <h1 class="product-title">${product.title}</h1>
        <div class="product-price">${formattedPrice} <span class="product-price-suffix">(Tax included)</span></div>
        
        <hr class="divider">

        <!-- Variant Options Selection -->
        <div class="product-options-container">
          ${optionsHtml}
        </div>

        <!-- Quantity & Add to Cart / Direct Checkout (The Buy Funnel) -->
        <div class="product-purchase-controls">
          <div class="qty-control-wrapper">
            <span class="qty-label">Choose Quantity:</span>
            <div class="qty-selector">
              <button class="qty-btn" data-action="decrease">-</button>
              <input type="number" class="qty-input" value="1" min="1" readonly>
              <button class="qty-btn" data-action="increase">+</button>
            </div>
          </div>

          <div class="cta-button-group">
            <!-- BUY NOW (DIRECT CHECKOUT DIRECT ROUTE) -->
            <button class="btn btn-accent btn-buy-now w-full">
              Buy It Now 🚀
            </button>
            <!-- ADD TO CART -->
            <button class="btn btn-secondary btn-add-to-cart w-full">
              Add to Cart
            </button>
          </div>
        </div>

        <hr class="divider">

        <!-- Description -->
        <div class="product-description-container">
          <h3>Description</h3>
          <div class="product-description-content">
            ${product.descriptionHtml || `<p>${product.description}</p>`}
          </div>
        </div>
      </div>
    </div>

    <!-- Product Features Badges Banner (Styled matching image options) -->
    <div class="product-features-banner">
      <h3 class="features-banner-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
        Sensory Learning & Interactive Core Development
      </h3>
      <div class="features-grid">
        <!-- Knowledge -->
        <div class="feature-badge-card">
          <div class="badge-card-icon bg-knowledge">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <h4>Knowledge</h4>
          <p>Alphabets, counting, colors, shapes & reading stories.</p>
        </div>
        
        <!-- Voice function -->
        <div class="feature-badge-card">
          <div class="badge-card-icon bg-voice">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          </div>
          <h4>Voice Function</h4>
          <p>Phonetic talking book with sweet sounds and dynamic music.</p>
        </div>

        <!-- Thinking ability -->
        <div class="feature-badge-card">
          <div class="badge-card-icon bg-thinking">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line></svg>
          </div>
          <h4>Thinking</h4>
          <p>Awakens curiosity, logical analysis, and imagination.</p>
        </div>

        <!-- Hands-on ability -->
        <div class="feature-badge-card">
          <div class="badge-card-icon bg-hands">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M6 14v-1.5a1.5 1.5 0 0 0-3 0V18a6 6 0 0 0 6 6h4a8 8 0 0 0 8-8v-3a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3"></path></svg>
          </div>
          <h4>Hands-On</h4>
          <p>Touch sheets and interact with visual keys, enhancing focus.</p>
        </div>

        <!-- Auditory ability -->
        <div class="feature-badge-card">
          <div class="badge-card-icon bg-auditory">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 14.5a3.5 3.5 0 0 0 0-7"></path><path d="M12 2A10 10 0 0 0 2 12c0 2.22.73 4.27 1.95 5.92l-.95 2.5 2.5-.95A9.97 9.97 0 0 0 12 22a10 10 0 0 0 10-10A10 10 0 0 0 12 2z"></path><path d="M12 8a4 4 0 0 0 0 8"></path></svg>
          </div>
          <h4>Auditory</h4>
          <p>Pronunciation listening skills and music notes feedback.</p>
        </div>
      </div>
    </div>
  `;

  // Attach Event Listeners
  
  // 1. Thumbnail Switcher
  const thumbs = pageContainer.querySelectorAll('.gallery-thumb-btn');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const mainImg = pageContainer.querySelector('.main-product-image');
      if (mainImg) {
        mainImg.src = thumb.dataset.imageUrl;
      }
    });
  });

  // 2. Options selector
  const optionButtons = pageContainer.querySelectorAll('.option-value');
  optionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const optionName = btn.dataset.optionName;
      const optionValue = btn.dataset.optionValue;
      selectedOptions[optionName] = optionValue;
      updateUI();
    });
  });

  // 3. Qty
  const qtyInput = pageContainer.querySelector('.qty-input');
  pageContainer.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'increase') {
        quantity += 1;
      } else if (action === 'decrease' && quantity > 1) {
        quantity -= 1;
      }
      if (qtyInput) qtyInput.value = quantity;
    });
  });

  // 4. BUY NOW (DIRECT REDIRECT FUNNEL)
  const buyNowBtn = pageContainer.querySelector('.btn-buy-now');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', async () => {
      const activeVariant = getSelectedVariant();
      if (!activeVariant) return;

      try {
        buyNowBtn.textContent = 'Redirecting to checkout... 🚀';
        buyNowBtn.disabled = true;
        
        // Directly create a Shopify cart and redirect
        const cart = await createCart(activeVariant.id, quantity);
        if (cart && cart.checkoutUrl) {
          window.location.href = cart.checkoutUrl;
        } else {
          throw new Error('Could not retrieve checkout URL');
        }
      } catch (err) {
        console.error('Checkout redirect failed:', err);
        buyNowBtn.textContent = 'Checkout Error!';
        setTimeout(() => updateUI(), 2000);
      }
    });
  }

  // 5. Add To Cart
  const addToCartBtn = pageContainer.querySelector('.btn-add-to-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async () => {
      const activeVariant = getSelectedVariant();
      if (!activeVariant) return;

      try {
        addToCartBtn.textContent = 'Adding...';
        addToCartBtn.disabled = true;
        
        await storeState.addCartItem(activeVariant.id, quantity);
        
        addToCartBtn.textContent = 'Added to Cart!';
        setTimeout(() => updateUI(), 2000);
      } catch (err) {
        console.error('Add to cart failed:', err);
        addToCartBtn.textContent = 'Error adding';
        setTimeout(() => updateUI(), 2000);
      }
    });
  }

  updateUI();

  return pageContainer;
}

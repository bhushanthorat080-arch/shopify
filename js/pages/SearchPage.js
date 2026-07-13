import { searchProducts } from '../api.js';
import { ProductCard } from '../components/ProductCard.js';

export async function SearchPage(params, queryParams) {
  const queryStr = queryParams.q ? queryParams.q.trim() : '';
  
  const container = document.createElement('div');
  container.className = 'search-page container py-8';

  let resultsHtml = '';
  let searchTitle = 'Search Our Catalog';

  if (queryStr) {
    searchTitle = `Search Results for "${queryStr}"`;
    try {
      const products = await searchProducts(queryStr, 24);
      
      if (products.length > 0) {
        resultsHtml = `
          <div class="search-results-summary mb-6">
            <span>Found ${products.length} matching products</span>
          </div>
          <div class="products-grid">
            ${products.map(prod => ProductCard(prod)).join('')}
          </div>
        `;
      } else {
        resultsHtml = `
          <div class="empty-state text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <p class="mt-4">No products found matching "${queryStr}".</p>
            <p class="text-muted">Check spelling or search for different terms.</p>
          </div>
        `;
      }
    } catch (error) {
      console.error(error);
      resultsHtml = `
        <div class="error-container text-center py-8">
          <p>Failed to execute search. Please try again.</p>
        </div>
      `;
    }
  } else {
    resultsHtml = `
      <div class="empty-state text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <p class="mt-4">Type a query above to search for products.</p>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="search-header text-center mb-8">
      <h1>${searchTitle}</h1>
      <form class="search-page-form mt-4">
        <div class="search-input-wrapper">
          <input type="text" name="q" placeholder="What are you looking for?" required value="${queryStr.replace(/"/g, '&quot;')}">
          <button type="submit" class="btn btn-primary">Search</button>
        </div>
      </form>
    </div>
    
    <div class="search-results-container">
      ${resultsHtml}
    </div>
  `;

  // Attach submit handler to form
  const form = container.querySelector('.search-page-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[name="q"]');
    const value = input.value.trim();
    if (value) {
      window.location.href = `/search?q=${encodeURIComponent(value)}`;
    }
  });

  return container;
}

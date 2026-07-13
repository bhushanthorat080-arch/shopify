import { storeState } from '../state.js';

export async function AccountPage() {
  if (!storeState.customer) {
    setTimeout(() => {
      window.location.href = '/login';
    }, 50);
    return document.createElement('div');
  }

  const user = storeState.customer;

  const container = document.createElement('div');
  container.className = 'account-page container py-8';

  function formatPrice(amount, currencyCode) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD'
    }).format(amount);
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Build orders list HTML
  let ordersHtml = '';
  if (user.orders.length === 0) {
    ordersHtml = `
      <div class="empty-orders text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <p class="mt-4">You haven't placed any orders yet.</p>
        <a href="/collections/frontpage" class="btn btn-secondary mt-4">Start Shopping</a>
      </div>
    `;
  } else {
    ordersHtml = `
      <div class="orders-table-wrapper">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Payment Status</th>
              <th>Fulfillment</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${user.orders.map(order => `
              <tr class="order-row">
                <td data-label="Order"><strong>#${order.orderNumber}</strong></td>
                <td data-label="Date">${formatDate(order.processedAt)}</td>
                <td data-label="Payment Status">
                  <span class="badge badge-payment-${order.financialStatus.toLowerCase()}">
                    ${order.financialStatus}
                  </span>
                </td>
                <td data-label="Fulfillment">
                  <span class="badge badge-fulfillment-${order.fulfillmentStatus.toLowerCase()}">
                    ${order.fulfillmentStatus}
                  </span>
                </td>
                <td data-label="Total">${formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="account-header d-flex justify-between items-center mb-8">
      <div>
        <h1>My Account</h1>
        <p>Welcome back, ${user.firstName}!</p>
      </div>
      <button class="btn btn-secondary" id="logout-btn">Sign Out</button>
    </div>

    <div class="account-grid">
      <!-- Profile details -->
      <div class="account-card profile-details-card">
        <h3>Profile Details</h3>
        <hr class="divider">
        <div class="profile-info-row">
          <span class="info-label">Name:</span>
          <span class="info-val">${user.firstName} ${user.lastName}</span>
        </div>
        <div class="profile-info-row">
          <span class="info-label">Email:</span>
          <span class="info-val">${user.email}</span>
        </div>
        ${user.phone ? `
          <div class="profile-info-row">
            <span class="info-label">Phone:</span>
            <span class="info-val">${user.phone}</span>
          </div>
        ` : ''}
      </div>

      <!-- Orders history -->
      <div class="account-card orders-history-card">
        <h3>Order History</h3>
        <hr class="divider">
        ${ordersHtml}
      </div>
    </div>
  `;

  // Sign out button handler
  container.querySelector('#logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    storeState.logout();
    window.location.href = '/login';
  });

  return container;
}

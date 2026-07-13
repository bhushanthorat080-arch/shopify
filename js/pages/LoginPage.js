import { storeState } from '../state.js';

export async function LoginPage() {
  // If user is already logged in, redirect to account
  if (storeState.customer) {
    setTimeout(() => {
      window.location.href = '/account';
    }, 50);
    return document.createElement('div');
  }

  const container = document.createElement('div');
  container.className = 'auth-page container py-12';

  container.innerHTML = `
    <div class="auth-card">
      <div class="auth-header text-center">
        <!-- Playful key/lock icon badge -->
        <div style="display: flex; justify-content: center; margin-bottom: 16px;">
          <div style="width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: rgba(14, 165, 233, 0.1); color: var(--primary);">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
        </div>
        <h2>Sign In</h2>
        <p>Log in to access your orders and profile.</p>
      </div>

      <div class="alert alert-error d-none" id="login-error-alert"></div>

      <form class="auth-form" id="login-form">
        <div class="form-group">
          <label for="login-email">Email Address</label>
          <input type="email" id="login-email" name="email" required autocomplete="email" placeholder="you@example.com">
        </div>

        <div class="form-group">
          <label for="login-password">Password</label>
          <input type="password" id="login-password" name="password" required autocomplete="current-password" placeholder="••••••••">
        </div>

        <button type="submit" class="btn btn-primary w-full mt-4" id="login-submit-btn">
          Sign In
        </button>
      </form>

      <div class="auth-footer text-center mt-6">
        <p>Don't have an account? <a href="/register">Create account</a></p>
      </div>
    </div>
  `;

  const form = container.querySelector('#login-form');
  const errorAlert = container.querySelector('#login-error-alert');
  const submitBtn = container.querySelector('#login-submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('#login-email').value.trim();
    const password = form.querySelector('#login-password').value;

    errorAlert.classList.add('d-none');
    errorAlert.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
      await storeState.login(email, password);
      window.location.href = '/account';
    } catch (error) {
      console.error(error);
      errorAlert.textContent = error.message || 'Invalid email or password. Please try again.';
      errorAlert.classList.remove('d-none');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });

  return container;
}

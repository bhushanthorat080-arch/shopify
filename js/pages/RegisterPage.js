import { customerRegister } from '../api.js';
import { storeState } from '../state.js';

export async function RegisterPage() {
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
        <!-- Playful registration icon badge -->
        <div style="display: flex; justify-content: center; margin-bottom: 16px;">
          <div style="width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: rgba(16, 185, 129, 0.1); color: var(--success);">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          </div>
        </div>
        <h2>Create Account</h2>
        <p>Join us to track orders and save your details.</p>
      </div>

      <div class="alert alert-error d-none" id="register-error-alert"></div>
      <div class="alert alert-success d-none" id="register-success-alert"></div>

      <form class="auth-form" id="register-form">
        <div class="form-row">
          <div class="form-group">
            <label for="reg-firstname">First Name</label>
            <input type="text" id="reg-firstname" name="firstName" required autocomplete="given-name" placeholder="John">
          </div>
          <div class="form-group">
            <label for="reg-lastname">Last Name</label>
            <input type="text" id="reg-lastname" name="lastName" required autocomplete="family-name" placeholder="Doe">
          </div>
        </div>

        <div class="form-group">
          <label for="reg-email">Email Address</label>
          <input type="email" id="reg-email" name="email" required autocomplete="email" placeholder="john.doe@example.com">
        </div>

        <div class="form-group">
          <label for="reg-password">Password</label>
          <input type="password" id="reg-password" name="password" required autocomplete="new-password" placeholder="Min. 8 characters" minlength="8">
        </div>

        <button type="submit" class="btn btn-primary w-full mt-4" id="reg-submit-btn">
          Create Account
        </button>
      </form>

      <div class="auth-footer text-center mt-6">
        <p>Already have an account? <a href="/login">Sign in</a></p>
      </div>
    </div>
  `;

  const form = container.querySelector('#register-form');
  const errorAlert = container.querySelector('#register-error-alert');
  const successAlert = container.querySelector('#register-success-alert');
  const submitBtn = container.querySelector('#reg-submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = form.querySelector('#reg-firstname').value.trim();
    const lastName = form.querySelector('#reg-lastname').value.trim();
    const email = form.querySelector('#reg-email').value.trim();
    const password = form.querySelector('#reg-password').value;

    errorAlert.classList.add('d-none');
    successAlert.classList.add('d-none');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      await customerRegister(firstName, lastName, email, password);
      
      successAlert.textContent = 'Account created successfully! Logging you in...';
      successAlert.classList.remove('d-none');
      form.reset();

      // Automatically sign in the user
      setTimeout(async () => {
        try {
          await storeState.login(email, password);
          window.location.href = '/account';
        } catch (loginErr) {
          console.error(loginErr);
          window.location.href = '/login';
        }
      }, 1500);

    } catch (error) {
      console.error(error);
      errorAlert.textContent = error.message || 'Failed to create account. Please check details and try again.';
      errorAlert.classList.remove('d-none');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });

  return container;
}

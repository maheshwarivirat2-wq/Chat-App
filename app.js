const app = document.getElementById('app');
const state = {
  login: { username: '', password: '' },
  create: { username: '', password: '' },
  currentUser: ''
};

async function requestAuth(path, username, password) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || 'Something went wrong. Please try again.');
  }

  return payload;
}

function setRoute(route) {
  window.location.hash = route;
}

function renderLogin(error = '') {
  app.innerHTML = `
    <section class="auth-card">
      <div class="auth-icon" aria-hidden="true"></div>
      <h1>Welcome Back</h1>
      <p class="subtitle">Sign in to continue chatting</p>

      <div class="auth-tabs">
        <button class="tab-btn active" id="goLogin">Log In</button>
        <button class="tab-btn" id="goCreate">Sign Up</button>
      </div>

      <form id="loginForm" novalidate>
        <div class="field">
          <label for="loginUsername">Username</label>
          <input id="loginUsername" name="username" placeholder="Enter username" value="${state.login.username}" />
        </div>
        <div class="field">
          <label for="loginPassword">Password</label>
          <input id="loginPassword" name="password" type="password" placeholder="Enter password" value="${state.login.password}" />
        </div>
        <p class="error">${error}</p>
        <button class="primary-btn" type="submit">Sign In</button>
      </form>
      <p class="switch-copy">Don't have an account? <a href="#create">Create Account</a></p>
    </section>`;

  document.getElementById('goCreate').onclick = () => setRoute('create');
  document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const username = loginUsername.value.trim();
    const password = loginPassword.value;
    state.login = { username, password };

    if (!username || !password) return renderLogin('Username and password are required.');

    try {
      const result = await requestAuth('/api/login', username, password);
      state.currentUser = result.username;
      setRoute('success');
    } catch (err) {
      renderLogin(err.message);
    }
  };
}

function renderCreate(error = '') {
  app.innerHTML = `
    <section class="auth-card">
      <div class="auth-icon" aria-hidden="true"></div>
      <h1>Create Account</h1>
      <p class="subtitle">Set up your chat profile</p>

      <div class="auth-tabs">
        <button class="tab-btn" id="goLogin">Log In</button>
        <button class="tab-btn active" id="goCreate">Sign Up</button>
      </div>

      <form id="createForm" novalidate>
        <div class="field">
          <label for="createUsername">Username</label>
          <input id="createUsername" name="username" placeholder="Enter username" value="${state.create.username}" />
        </div>
        <div class="field">
          <label for="createPassword">Create Password</label>
          <input id="createPassword" name="password" type="password" placeholder="Create password" value="${state.create.password}" />
        </div>
        <p class="error">${error}</p>
        <button class="primary-btn" type="submit">Create Account</button>
      </form>
      <p class="switch-copy">Already have an account? <a href="#login">Log In</a></p>
    </section>`;

  document.getElementById('goLogin').onclick = () => setRoute('login');
  document.getElementById('createForm').onsubmit = async (e) => {
    e.preventDefault();
    const username = createUsername.value.trim();
    const password = createPassword.value;
    state.create = { username, password };

    if (!username || !password) return renderCreate('Username and create password are required.');

    try {
      const result = await requestAuth('/api/signup', username, password);
      state.login = { username, password };
      state.currentUser = result.username;
      setRoute('success');
    } catch (err) {
      renderCreate(err.message);
    }
  };
}

function renderSuccess() {
  const currentUser = state.currentUser || state.login.username || 'there';
  app.innerHTML = `
    <section class="auth-card success">
      <div class="auth-icon" aria-hidden="true"></div>
      <h2>You're in, ${currentUser} 👋</h2>
      <p>This is a placeholder for your chat home screen.</p>
      <button class="primary-btn" id="logoutBtn">Sign Out</button>
    </section>`;

  document.getElementById('logoutBtn').onclick = () => {
    state.login = { username: '', password: '' };
    state.currentUser = '';
    setRoute('login');
  };
}

function router() {
  const route = window.location.hash.replace('#', '') || 'login';
  if (route === 'create') return renderCreate();
  if (route === 'success') return renderSuccess();
  return renderLogin();
}

window.addEventListener('hashchange', router);
router();

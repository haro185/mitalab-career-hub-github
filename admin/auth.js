const authClient = window.mitalabSupabase;
const localAuth = window.MITALAB_AUTH?.mode === 'local';
const loginForm = document.querySelector('#loginForm');
const loginMessage = document.querySelector('#loginMessage');
const setupNotice = document.querySelector('#setupNotice');

function showLoginMessage(message) {
  if (loginMessage) loginMessage.textContent = message;
}

if (localAuth) {
  if (sessionStorage.getItem('mitalab-local-admin-session') === 'active') window.location.replace('../index.html');
} else if (!authClient) {
  setupNotice?.removeAttribute('hidden');
} else {
  authClient.auth.getSession().then(({ data }) => {
    if (data.session) window.location.replace('../index.html');
  });
}

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = loginForm.querySelector('button[type="submit"]');
  const formData = new FormData(loginForm);
  button.disabled = true;
  showLoginMessage('Đang xác thực...');
  if (localAuth) {
    const email = formData.get('email');
    const password = formData.get('password');
    if (email !== window.MITALAB_AUTH.email || password !== window.MITALAB_AUTH.password) {
      showLoginMessage('Email hoặc mật khẩu không đúng.');
      button.disabled = false;
      return;
    }
    sessionStorage.setItem('mitalab-local-admin-session', 'active');
    window.location.replace('../index.html');
    return;
  }
  if (!authClient) {
    showLoginMessage('Chưa thể đăng nhập khi Supabase chưa được cấu hình.');
    button.disabled = false;
    return;
  }
  const { error } = await authClient.auth.signInWithPassword({
    email: formData.get('email'),
    password: formData.get('password')
  });
  if (error) {
    showLoginMessage(error.message === 'Invalid login credentials' ? 'Email hoặc mật khẩu không đúng.' : error.message);
    button.disabled = false;
    return;
  }
  window.location.replace('../index.html');
});

document.querySelector('#forgotPassword')?.addEventListener('click', async () => {
  if (localAuth) {
    showLoginMessage('Chế độ local không có khôi phục mật khẩu tự động. Sửa password trong admin/config.js.');
    return;
  }
  if (!authClient) {
    showLoginMessage('Chưa thể khôi phục mật khẩu khi Supabase chưa được cấu hình.');
    return;
  }
  const email = document.querySelector('#email').value.trim();
  if (!email) {
    showLoginMessage('Nhập email để nhận liên kết khôi phục mật khẩu.');
    return;
  }
  const { error } = await authClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/login/`
  });
  showLoginMessage(error ? error.message : 'Đã gửi hướng dẫn khôi phục đến email của bạn.');
});

/* Local mode is the default. Change to "supabase" only when a backend is ready. */
window.MITALAB_AUTH = {
  mode: 'local',
  email: 'admin@mitalab.com',
  password: '1'
};

/* Used only when mode is changed to "supabase". Never place service_role here. */
window.MITALAB_SUPABASE = {
  url: '',
  anonKey: ''
};

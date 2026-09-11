(() => {
  const settings = window.MITALAB_SUPABASE || {};
  window.mitalabSupabase = settings.url && settings.anonKey && window.supabase
    ? window.supabase.createClient(settings.url, settings.anonKey)
    : null;
})();

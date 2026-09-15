// Non-secret browser configuration. Keep provider="supabase" until Neon preview validation passes.
window.CONFLUENCE_BACKEND_PROVIDER = window.CONFLUENCE_BACKEND_PROVIDER || 'supabase';
window.CONFLUENCE_NEON = {
  environment: 'rpc-validation',
  authBaseUrl: 'https://ep-raspy-star-b4ijq3v7.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth',
  dataApiUrl: 'https://ep-raspy-star-b4ijq3v7.apirest.c-6.us-east-2.aws.neon.tech/neondb/rest/v1'
};


/* v0.4.11.7 validation-preview switch.
 * This package may opt into Neon with ?backend=neon.
 * Normal navigation without the parameter remains on Supabase.
 */
(function () {
  const requested = new URLSearchParams(location.search).get('backend');
  if (requested === 'neon') {
    window.CONFLUENCE_BACKEND_PROVIDER = 'neon';
    sessionStorage.setItem('confluenceBackendProvider', 'neon');
  } else if (requested === 'supabase') {
    window.CONFLUENCE_BACKEND_PROVIDER = 'supabase';
    sessionStorage.setItem('confluenceBackendProvider', 'supabase');
  } else {
    window.CONFLUENCE_BACKEND_PROVIDER =
      sessionStorage.getItem('confluenceBackendProvider') ||
      window.CONFLUENCE_BACKEND_PROVIDER ||
      'supabase';
  }
})();

// Production cutover candidate: Neon is the default; explicit ?backend=supabase remains available for rollback testing.
window.CONFLUENCE_BACKEND_PROVIDER = window.CONFLUENCE_BACKEND_PROVIDER || 'neon';
window.CONFLUENCE_NEON = {
  environment: 'production',
  authBaseUrl: 'https://ep-fragrant-bird-b4mxh0oc.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth',
  dataApiUrl: 'https://ep-fragrant-bird-b4mxh0oc.apirest.c-6.us-east-2.aws.neon.tech/neondb/rest/v1'
};


/* v0.4.11.7 validation-preview switch.
 * This package may opt into Neon with ?backend=neon.
 * Normal navigation without the parameter defaults to Neon.
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

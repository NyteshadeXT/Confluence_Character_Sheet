/* Neon browser SDK bootstrap (v0.4.11.13).
 * Loads the official @neondatabase/neon-js client and exposes a single Promise.
 * The BetterAuthVanillaAdapter intentionally preserves the existing auth method/response shape
 * while the application is migrated page-by-page.
 */
(function () {
  'use strict';

  function boot() {
    if (window.CONFLUENCE_NEON_CLIENT_READY) return window.CONFLUENCE_NEON_CLIENT_READY;
    const cfg = window.CONFLUENCE_NEON;
    if (!cfg || !cfg.authBaseUrl || !cfg.dataApiUrl) {
      window.CONFLUENCE_NEON_CLIENT_READY = Promise.reject(new Error('Neon browser configuration is missing.'));
      return window.CONFLUENCE_NEON_CLIENT_READY;
    }

    window.CONFLUENCE_NEON_CLIENT_READY = import('https://esm.sh/@neondatabase/neon-js@latest').then(function (sdk) {
      const client = sdk.createClient({
      auth: { url: cfg.authBaseUrl },
      dataApi: { url: cfg.dataApiUrl }
    });
      window.CONFLUENCE_NEON_CLIENT = client;
      window.CONFLUENCE_NEON_AUTH_CLIENT = client.auth;
      return client;
    });
    return window.CONFLUENCE_NEON_CLIENT_READY;
  }

  window.bootstrapConfluenceNeon = boot;
  // Preload the SDK on all migrated pages. Supabase remains active until provider switch.
  boot().catch(function (err) {
    console.warn('Neon bootstrap unavailable:', err && err.message ? err.message : err);
  });
})();

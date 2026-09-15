/* Provider-neutral authentication facade (v0.4.11.5).
 * Supabase remains the active production implementation during staged migration.
 * Neon uses the official neon-js SDK with SupabaseAuthAdapter so existing auth semantics
 * can be retained while pages move to the provider-neutral facade.
 */
(function () {
  'use strict';

  function providerName() { return (window.CONFLUENCE_BACKEND_PROVIDER || 'supabase').toLowerCase(); }

  function supabaseAuth() {
    if (!window.confluenceSupabase) throw new Error('Supabase auth client is not loaded.');
    return window.confluenceSupabase.auth;
  }

  async function neonAuth() {
    if (window.CONFLUENCE_NEON_AUTH_CLIENT) return window.CONFLUENCE_NEON_AUTH_CLIENT;
    if (typeof window.bootstrapConfluenceNeon === 'function') await window.bootstrapConfluenceNeon();
    if (!window.CONFLUENCE_NEON_AUTH_CLIENT) throw new Error('Neon Auth client failed to bootstrap.');
    return window.CONFLUENCE_NEON_AUTH_CLIENT;
  }

  async function activeAuth() {
    return providerName() === 'neon' ? neonAuth() : supabaseAuth();
  }

  const auth = {
    get provider() { return providerName(); },
    async getSessionResult() {
      const client = await activeAuth();
      return client.getSession();
    },
    async getSession() {
      const result = await this.getSessionResult();
      if (result && result.error) throw result.error;
      return result && result.data ? result.data.session : null;
    },
    async getUser() {
      const client = await activeAuth();
      if (typeof client.getUser === 'function') {
        const result = await client.getUser();
        if (result && result.error) throw result.error;
        return result && result.data ? result.data.user : null;
      }
      const result = await client.getSession();
      if (result && result.error) throw result.error;
      return result && result.data ? result.data.user : null;
    },
    async requireSession() {
      const session = await this.getSession();
      if (!session) {
        const provider = providerName();
        const login = new URL('/login.html', location.origin);
        login.searchParams.set('next', location.pathname + location.search);
        if (provider === 'neon') login.searchParams.set('backend', 'neon');
        location.href = login.pathname + login.search;
        throw new Error('Authentication required');
      }
      return session;
    },
    async signInWithPassword(credentials) {
      const client = await activeAuth();
      return client.signInWithPassword(credentials);
    },
    async signInWithOtp(options) {
      const client = await activeAuth();
      if (typeof client.signInWithOtp !== 'function') throw new Error('Passwordless sign-in is not available for this provider.');
      return client.signInWithOtp(options);
    },
    async signOut(options) {
      const client = await activeAuth();
      const result = await client.signOut(options);
      if (result && result.error) throw result.error;
      return result;
    },
    async signOutAndRedirect() {
      await this.signOut();
      location.href = '/login.html';
    },
    async updateUser(attributes) {
      const client = await activeAuth();
      return client.updateUser(attributes);
    }
  };

  window.confluenceAuth = auth;
})();

/* Provider-neutral authentication facade (v0.4.11.12).
 * Supabase remains the default provider during staged migration.
 * Neon uses the documented BetterAuthVanillaAdapter API.
 */
(function () {
  'use strict';

  function providerName() {
    return (window.CONFLUENCE_BACKEND_PROVIDER || 'supabase').toLowerCase();
  }

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

  const auth = {
    get provider() { return providerName(); },

    async getSessionResult() {
      if (providerName() === 'neon') return (await neonAuth()).getSession();
      return supabaseAuth().getSession();
    },

    async getSession() {
      const result = await this.getSessionResult();
      if (result && result.error) throw result.error;
      if (!result || !result.data || !result.data.session) return null;
      if (providerName() === 'neon') {
        return Object.assign({}, result.data.session, { user: result.data.user || null });
      }
      return result.data.session;
    },

    async getUser() {
      if (providerName() === 'neon') {
        const result = await (await neonAuth()).getSession();
        if (result && result.error) throw result.error;
        return result && result.data ? result.data.user : null;
      }
      const result = await supabaseAuth().getUser();
      if (result && result.error) throw result.error;
      return result && result.data ? result.data.user : null;
    },

    async requireSession() {
      const session = await this.getSession();
      if (!session) {
        const login = new URL('/login.html', location.origin);
        login.searchParams.set('next', location.pathname + location.search);
        if (providerName() === 'neon') login.searchParams.set('backend', 'neon');
        location.href = login.pathname + login.search;
        throw new Error('Authentication required');
      }
      return session;
    },

    async signInWithPassword(credentials) {
      if (providerName() === 'neon') {
        return (await neonAuth()).signIn.email({
          email: credentials.email,
          password: credentials.password
        });
      }
      return supabaseAuth().signInWithPassword(credentials);
    },

    async signUp(credentials) {
      if (providerName() === 'neon') {
        const email = credentials.email;
        return (await neonAuth()).signUp.email({
          email,
          password: credentials.password,
          name: credentials.name || (email ? email.split('@')[0] : 'User')
        });
      }
      return supabaseAuth().signUp(credentials);
    },

    async signInWithOtp(options) {
      if (providerName() === 'neon') {
        throw new Error('Magic-link sign-in is not enabled in the Neon validation facade. Password validation is used during migration testing.');
      }
      return supabaseAuth().signInWithOtp(options);
    },

    async signOut(options) {
      const result = providerName() === 'neon'
        ? await (await neonAuth()).signOut()
        : await supabaseAuth().signOut(options);
      if (result && result.error) throw result.error;
      return result;
    },

    async signOutAndRedirect() {
      await this.signOut();
      location.href = '/login.html';
    },

    async updateUser(attributes) {
      if (providerName() === 'neon') {
        const supported = {};
        if (Object.prototype.hasOwnProperty.call(attributes || {}, 'name')) supported.name = attributes.name;
        if (Object.prototype.hasOwnProperty.call(attributes || {}, 'image')) supported.image = attributes.image;
        return (await neonAuth()).updateUser(supported);
      }
      return supabaseAuth().updateUser(attributes);
    }
  };

  window.confluenceAuth = auth;
})();

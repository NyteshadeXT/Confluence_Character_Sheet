/* Provider-neutral authentication facade (v0.4.11.15).
 * Supabase remains the default provider during staged migration.
 * Neon uses the documented BetterAuthVanillaAdapter API.
 */
(function () {
  'use strict';

  function providerName() {
    return (window.CONFLUENCE_BACKEND_PROVIDER || 'supabase').toLowerCase();
  }

  function withProvider(url) {
    const target = new URL(url, location.origin);
    if (providerName() === 'neon') target.searchParams.set('backend', 'neon');
    return target.pathname + target.search + target.hash;
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
        location.href = withProvider(login.pathname + login.search);
        throw new Error('Authentication required');
      }
      return session;
    },

    async signInWithPassword(credentials) {
      if (providerName() === 'neon') {
        const client = await neonAuth();
        const result = await client.signIn.email({
          email: credentials.email,
          password: credentials.password
        });
        if (result && result.error) return result;

        // Better Auth signIn.email() returns its own success payload rather than
        // Supabase's { data: { session } } shape. Resolve the authoritative
        // cookie-backed session and normalize it for the existing application.
        const sessionResult = await client.getSession();
        if (sessionResult && sessionResult.error) {
          return { data: { session: null, user: result && result.data ? result.data.user || null : null }, error: sessionResult.error };
        }
        const neonSession = sessionResult && sessionResult.data && sessionResult.data.session
          ? Object.assign({}, sessionResult.data.session, { user: sessionResult.data.user || null })
          : null;
        return {
          data: {
            session: neonSession,
            user: sessionResult && sessionResult.data ? sessionResult.data.user || null : null,
            providerData: result && result.data ? result.data : null
          },
          error: null
        };
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
      if (providerName() === 'neon') {
        const client = await neonAuth();
        const result = await client.signOut();
        if (result && result.error) throw result.error;

        // Confirm the cookie-backed session is actually gone before redirecting.
        const after = await client.getSession();
        if (after && after.error) throw after.error;
        if (after && after.data && after.data.session) {
          throw new Error('Neon sign-out completed but the session is still active.');
        }
        return result;
      }
      const result = await supabaseAuth().signOut(options);
      if (result && result.error) throw result.error;
      return result;
    },

    async signOutAndRedirect() {
      await this.signOut();
      location.href = withProvider('/login.html');
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

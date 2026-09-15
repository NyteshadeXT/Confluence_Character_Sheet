/* Confluence provider-neutral data API facade (v0.4.12.1).
 * Uses each provider's native PostgREST-compatible query client. Neon JWT forwarding is
 * handled by the official neon-js SDK rather than by application code.
 */
(function () {
  'use strict';

  function supabaseClient() {
    if (!window.confluenceSupabase) throw new Error('Supabase provider is not loaded.');
    return window.confluenceSupabase;
  }

  async function neonClient() {
    if (window.CONFLUENCE_NEON_CLIENT) return window.CONFLUENCE_NEON_CLIENT;
    if (typeof window.bootstrapConfluenceNeon === 'function') return window.bootstrapConfluenceNeon();
    throw new Error('Neon client has not been bootstrapped.');
  }

  function providerName() { return (window.CONFLUENCE_BACKEND_PROVIDER || 'supabase').toLowerCase(); }

  const api = {
    get provider() { return providerName(); },
    async client() { return providerName() === 'neon' ? neonClient() : supabaseClient(); },
    async rpc(name, params) {
      const client = await this.client();
      return client.rpc(name, params || {});
    },
    from(table) {
      // Lazy thenable query builder: records the normal PostgREST chain synchronously,
      // resolves the active provider client only when the query is awaited.
      const calls = [];
      const proxy = new Proxy({}, {
        get: function (_target, prop) {
          if (prop === 'then') {
            return function (resolve, reject) {
              api.client().then(function (client) {
                let q = client.from(table);
                for (const call of calls) q = q[call.name].apply(q, call.args);
                return q;
              }).then(resolve, reject);
            };
          }
          return function () {
            calls.push({ name: prop, args: Array.from(arguments) });
            return proxy;
          };
        }
      });
      return proxy;
    },
    async query(run) {
      const client = await this.client();
      return run(client);
    },
    async select(table, columns, configure) {
      let q = this.from(table).select(columns || '*');
      return typeof configure === 'function' ? configure(q) : q;
    }
  };

  const rpcNames = [
    'get_my_home','gm_get_catalog','get_character_snapshot','gm_add_player_by_email','gm_assign_essence','gm_assign_power',
    'gm_create_character','gm_assign_character_owner','gm_unassign_character_owner','gm_delete_character','gm_delete_power_definition','gm_get_campaign_roster',
    'gm_grant_xp','gm_remove_essence','gm_remove_power','gm_upsert_ancestry_definition',
    'gm_upsert_condition_definition','gm_upsert_essence_definition','gm_upsert_power_definition',
    'is_system_gm','player_create_character','player_rank_power','player_rank_skill',
    'player_update_profile_state','player_update_runtime'
  ];
  rpcNames.forEach(function (name) {
    api[name] = function (params) { return api.rpc(name, params); };
  });

  window.confluenceApi = api;
})();

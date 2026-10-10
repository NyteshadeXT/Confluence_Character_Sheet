/* v0.4.12.7: read-only MVP readiness checks. Never print JWTs or passwords. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const qs = new URLSearchParams(location.search);
  const selected = (qs.get('backend') || window.CONFLUENCE_BACKEND_PROVIDER || 'supabase').toLowerCase();
  // Refuse to run against the default Supabase production backend or an unexpected provider.
  $('backend').textContent = selected;
  $('notice').textContent = selected === 'neon' ? 'All checks use the Neon backend. RPCs are read-only.' : 'Safety gate: open this page with ?backend=neon. Checks are disabled for other backends.';
  $('run').disabled = selected !== 'neon';
  let lastReport = null;
  function safeError(err) {
    // Do not copy raw errors; they can contain headers, token-bearing URLs or user data.
    const status = err && typeof err.status === 'number' ? err.status : null;
    const code = err && typeof err.code === 'string' ? err.code.slice(0, 80) : null;
    return { status, code, message: 'RPC failed (details intentionally omitted from shareable report)' };
  }
  function add(results, name, state, detail) { results.push({ check: name, state, detail }); }
  async function rpc(name, params) {
    const result = await window.confluenceApi.rpc(name, params || {});
    if (!result || result.error || (typeof result.status === 'number' && result.status >= 400)) {
      throw Object.assign(new Error('RPC failed'), { status: result && result.status, code: result && result.error && result.error.code });
    }
    return result.data;
  }
  function render(report) {
    const root = $('results'); root.replaceChildren();
    for (const item of report.checks) {
      const p = document.createElement('p');
      const strong = document.createElement('strong'); strong.className = item.state.toLowerCase();
      strong.textContent = item.state + ' — ' + item.check + ': ';
      p.append(strong, document.createTextNode(typeof item.detail === 'string' ? item.detail : JSON.stringify(item.detail)));
      root.append(p);
    }
    $('report').textContent = JSON.stringify(report, null, 2);
    $('copy').disabled = false;
  }
  async function run() {
    if (selected !== 'neon') return;
    $('run').disabled = true; $('copy').disabled = true;
    $('results').textContent = 'Checking…';
    const checks = [];
    const report = { version: '0.4.12.7', backend: 'neon', time: new Date().toISOString(), checks };
    try {
      if (!window.confluenceAuth || !window.confluenceApi || window.confluenceApi.provider !== 'neon') {
        add(checks, 'Neon provider', 'FAIL', 'The Neon API facade is not active.'); render(report); return;
      }
      add(checks, 'Neon provider', 'PASS', 'Neon RPC facade active');
      let session;
      try { session = await window.confluenceAuth.getSession(); }
      catch (e) { add(checks, 'Session', 'FAIL', safeError(e)); render(report); return; }
      if (!session || !session.user || !session.user.id) {
        add(checks, 'Session', 'FAIL', 'Sign in with Neon Auth first.'); render(report); return;
      }
      add(checks, 'Session', 'PASS', 'Authenticated user session present (identity redacted)');
      let gm = false;
      try { gm = await rpc('is_system_gm'); add(checks, 'Authenticated Data API RPC', 'PASS', 'is_system_gm returned a valid response'); }
      catch (e) { add(checks, 'Authenticated Data API RPC', 'FAIL', safeError(e)); render(report); return; }
      let home;
      try {
        home = await rpc('get_my_home');
        if (!home || !Array.isArray(home.campaigns) || !Array.isArray(home.ancestries)) throw new Error('Unexpected home payload');
        add(checks, 'Home contract', 'PASS', { campaigns: home.campaigns.length, ancestries: home.ancestries.length });
      } catch (e) { add(checks, 'Home contract', 'FAIL', safeError(e)); render(report); return; }
      try {
        const conditions = await rpc('get_active_condition_definitions');
        add(checks, 'Condition library', 'PASS', { responseType: Array.isArray(conditions) ? 'array' : typeof conditions });
      } catch (e) { add(checks, 'Condition library', 'FAIL', safeError(e)); }
      const campaigns = home.campaigns;
      if (!campaigns.length) add(checks, 'Campaign roster', 'SKIP', 'No accessible campaigns in this Neon account');
      else {
        const campaign = campaigns[0];
        if (campaign.role === 'gm' || gm === true) {
          try {
            const roster = await rpc('gm_get_campaign_roster', { p_campaign_id: campaign.id });
            add(checks, 'GM roster', 'PASS', { responseType: Array.isArray(roster) ? 'array' : typeof roster });
          } catch (e) { add(checks, 'GM roster', 'FAIL', safeError(e)); }
        } else add(checks, 'GM roster', 'SKIP', 'Current user is not a campaign GM');
        const character = Array.isArray(campaign.characters) ? campaign.characters[0] : null;
        if (character && character.id) {
          try {
            const snapshot = await rpc('get_character_snapshot', { p_character_id: character.id });
            add(checks, 'Character snapshot', 'PASS', { responseType: typeof snapshot });
          } catch (e) { add(checks, 'Character snapshot', 'FAIL', safeError(e)); }
        } else add(checks, 'Character snapshot', 'SKIP', 'No accessible character in first campaign');
      }
      if (gm === true) {
        try { const catalog = await rpc('gm_get_system_catalog'); add(checks, 'System GM catalog', 'PASS', { responseType: typeof catalog }); }
        catch (e) { add(checks, 'System GM catalog', 'FAIL', safeError(e)); }
      } else add(checks, 'System GM catalog', 'SKIP', 'Not a system GM');
    } catch (e) { add(checks, 'Unexpected test failure', 'FAIL', safeError(e)); }
    finally { lastReport = report; render(report); $('run').disabled = false; }
  }
  $('run').addEventListener('click', run);
  $('copy').addEventListener('click', async () => {
    if (!lastReport) return;
    const text = JSON.stringify(lastReport, null, 2);
    try { await navigator.clipboard.writeText(text); }
    catch (_) { $('report').focus(); }
  });
})();

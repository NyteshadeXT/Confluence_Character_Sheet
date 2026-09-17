import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const manifest = JSON.parse(read('neon/rpc-contract.json'));
const api = read('confluence-api.js');
const functions = read('neon/03_neon_application_functions.sql') + '\n' + read('neon/02_neon_identity_and_security.sql');
const permissions = read('neon/05_neon_rpc_permissions.sql');
const contractCheck = read('neon/06_neon_rpc_contract_check.sql');

function sortedUnique(values) { return [...new Set(values)].sort(); }
function diff(a, b) { const bs = new Set(b); return a.filter(x => !bs.has(x)); }
function fail(message, details = []) {
  console.error(`FAIL: ${message}`);
  for (const detail of details) console.error(`  - ${detail}`);
  process.exitCode = 1;
}

const expected = sortedUnique(manifest.browserRpcNames);
if (expected.length !== manifest.browserRpcNames.length) fail('rpc-contract.json contains duplicate browser RPC names.');

const allowlistMatch = api.match(/const rpcNames\s*=\s*\[([\s\S]*?)\];/);
if (!allowlistMatch) {
  fail('Could not locate confluence-api.js rpcNames allowlist.');
} else {
  const actual = sortedUnique([...allowlistMatch[1].matchAll(/['"]([a-z0-9_]+)['"]/g)].map(m => m[1]));
  const missing = diff(expected, actual);
  const extra = diff(actual, expected);
  if (missing.length || extra.length) fail('Browser RPC allowlist does not match rpc-contract.json.', [
    ...missing.map(x => `missing from facade: ${x}`),
    ...extra.map(x => `unexpected in facade: ${x}`)
  ]);
}

const defined = sortedUnique([...functions.matchAll(/create\s+or\s+replace\s+function\s+public\.([a-z0-9_]+)\s*\(/gi)].map(m => m[1]));
const missingDefinitions = diff(expected, defined);
if (missingDefinitions.length) fail('Browser RPCs are missing canonical SQL definitions.', missingDefinitions);

for (const name of expected) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!new RegExp(`public\\.${escaped}\\s*\\(`, 'i').test(permissions)) fail(`Permissions package does not mention ${name}.`);
  if (!new RegExp(`['"]${escaped}['"]|public\\.${escaped}\\s*\\(`, 'i').test(contractCheck)) fail(`Contract check does not mention ${name}.`);
}

const forbidden = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(?:js|html)$/.test(entry.name)) {
      const rel = path.relative(root, full).replaceAll('\\', '/');
      const text = fs.readFileSync(full, 'utf8');
      if (rel !== 'confluence-api.js' && /confluenceApi\.(?:from|query|select)\s*\(/.test(text)) forbidden.push(rel);
    }
  }
}
walk(root);
if (forbidden.length) fail('Direct application table/query helpers were reintroduced.', forbidden);

if (!process.exitCode) {
  console.log(`PASS: ${expected.length} browser RPCs match the facade, canonical SQL, permissions, and deployment contract check.`);
  console.log('PASS: no direct confluenceApi.from/query/select application calls found.');
}

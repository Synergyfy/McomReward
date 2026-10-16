// test-mcom-mesh.mjs — Zero-dependency MCOM mesh + partner API smoke test
//
// Usage (from apps/api):
//   node test-mcom-mesh.mjs
//
// Env (falls back to localhost defaults):
//   MCOM_SOLUTIONS_URL, MCOM_CLIENT_ID, MCOM_CLIENT_SECRET,
//   MCOM_REWARDS_BASE_URL  (this app; for the optional partner API probe)
//
// Verifies: ecosystem discovery → service token mint (aud = mcom-rewards) →
// peer registry → optional authenticated calls to this app's partner API.
//
// NOTE: app-to-app calls use an RS256 Bearer service token. There is NO shared
// webhook/HMAC secret anywhere in this flow.

const MCOM_URL = (process.env.MCOM_SOLUTIONS_URL || "http://localhost:3010").replace(/\/$/, "");
const CLIENT_ID = process.env.MCOM_CLIENT_ID || "mcom-rewards";
const CLIENT_SECRET = process.env.MCOM_CLIENT_SECRET || "";
const TARGET_PEER = process.env.MCOM_TARGET_PEER || "fundordonate";
const SCOPES = process.env.MCOM_SERVICE_SCOPES || "rewards:read rewards:issue";
const REWARDS_BASE = (process.env.MCOM_REWARDS_BASE_URL || "http://localhost:4000").replace(/\/$/, "");

async function main() {
  console.log(`\n🔍 [1/4] Testing ecosystem discovery at ${MCOM_URL}...`);
  const discRes = await fetch(`${MCOM_URL}/api/v1/ecosystem/discovery`);
  const discovery = await discRes.json();
  console.log(`✅ Discovery OK! Issuer: ${discovery.issuer} | Signing Alg: ${discovery.signing_alg}`);

  console.log(`\n🔑 [2/4] Requesting RS256 service token for audience "${TARGET_PEER}"...`);
  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const tokenRes = await fetch(`${MCOM_URL}/api/v1/auth/service-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${basicAuth}` },
    body: JSON.stringify({ grant_type: "client_credentials", audience: TARGET_PEER, scope: SCOPES }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    console.error(`❌ Service Token Failed (${tokenRes.status}):`, tokenData);
    console.log(`💡 HINT: in MCOM Console → Service Mesh Policy, ensure "${CLIENT_ID}" has:`);
    console.log(`   - serviceEnabled = true`);
    console.log(`   - serviceScopes includes the requested scopes (e.g. rewards:read rewards:issue)`);
    console.log(`   - allowedAudiences includes the target peer ("${TARGET_PEER}")`);
    process.exit(1);
  }
  const serviceToken = tokenData.access_token;
  console.log("✅ Service Token Minted Successfully!");
  console.log(`   - Type: ${tokenData.token_type} | Expires In: ${tokenData.expires_in}s`);
  console.log(`   - Token Preview: ${serviceToken.slice(0, 32)}...`);

  console.log("\n🌐 [3/4] Fetching ecosystem peer directory...");
  const peerRes = await fetch(`${MCOM_URL}/api/v1/ecosystem/services`);
  const peers = await peerRes.json();
  const list = Array.isArray(peers) ? peers : peers.data || [];
  console.log(`✅ Connected to Ecosystem Mesh! Active peer services: ${list.length}`);
  console.log(`   Peers: ${list.map((p) => p.clientId).join(", ")}`);

  console.log(`\n📦 [4/4] Probing this app's partner API at ${REWARDS_BASE}...`);
  const authHeaders = { Authorization: `Bearer ${serviceToken}`, "X-Caller-Id": CLIENT_ID };
  try {
    const noAuth = await fetch(`${REWARDS_BASE}/api/v1/partner/rewards`);
    console.log(`   - Catalogue (unauthenticated) → ${noAuth.status} ${noAuth.status === 401 ? "(expected ✅)" : "(unexpected ⚠️)"}`);

    const authed = await fetch(`${REWARDS_BASE}/api/v1/partner/rewards`, { headers: authHeaders });
    const body = await authed.json().catch(() => ({}));
    console.log(`   - Catalogue (authenticated)   → ${authed.status}${authed.ok ? ` (${body.total ?? "?"} rewards)` : ` ${JSON.stringify(body)}`}`);

    const recipientEmail = process.env.MCOM_TEST_RECIPIENT_EMAIL || "donor@example.com";
    const mine = await fetch(
      `${REWARDS_BASE}/api/v1/partner/issuances?recipientEmail=${encodeURIComponent(recipientEmail)}`,
      { headers: authHeaders },
    );
    const mineBody = await mine.json().catch(() => ({}));
    console.log(`   - Fetch user rewards          → ${mine.status}${mine.ok ? ` (${mineBody.total ?? "?"} issuance(s) for ${recipientEmail})` : ` ${JSON.stringify(mineBody)}`}`);
  } catch (err) {
    console.log(`   - App not reachable at ${REWARDS_BASE}: ${err.message} (start it to run this probe)`);
  }

  console.log("\n✨ Smoke test complete.\n");
}

main().catch((err) => {
  console.error(`\n❌ Smoke test failed: ${err.message}\n`);
  process.exit(1);
});

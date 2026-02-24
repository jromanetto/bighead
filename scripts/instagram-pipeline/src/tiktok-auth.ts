import { readFileSync, writeFileSync, existsSync } from "fs";
import { createServer } from "http";

const TOKEN_FILE = process.env.TIKTOK_TOKEN_FILE || "./tiktok-tokens.json";

type TikTokTokens = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch ms
  open_id: string;
};

/** Read stored tokens from disk */
export function readTokens(): TikTokTokens | null {
  if (!existsSync(TOKEN_FILE)) return null;
  try {
    return JSON.parse(readFileSync(TOKEN_FILE, "utf-8"));
  } catch {
    return null;
  }
}

/** Write tokens to disk */
function writeTokens(tokens: TikTokTokens): void {
  writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
}

/** Exchange auth code for access + refresh tokens */
async function exchangeCode(code: string): Promise<TikTokTokens> {
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`TikTok token exchange failed: ${data.error_description || data.error}`);
  }

  const tokens: TikTokTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    open_id: data.open_id,
  };

  writeTokens(tokens);
  return tokens;
}

/** Refresh access token using refresh token */
export async function refreshAccessToken(): Promise<TikTokTokens> {
  const stored = readTokens();
  if (!stored?.refresh_token) {
    throw new Error("No refresh token stored. Run tiktok-setup first.");
  }

  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: stored.refresh_token,
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`TikTok token refresh failed: ${data.error_description || data.error}`);
  }

  const tokens: TikTokTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    open_id: data.open_id || stored.open_id,
  };

  writeTokens(tokens);
  return tokens;
}

/** Get a valid access token (refreshes if expired) */
export async function getAccessToken(): Promise<string> {
  let tokens = readTokens();
  if (!tokens) {
    throw new Error("No TikTok tokens stored. Run tiktok-setup first.");
  }

  // Refresh 5 min before expiry
  if (Date.now() > tokens.expires_at - 300_000) {
    console.log("  TikTok token expired, refreshing...");
    tokens = await refreshAccessToken();
  }

  return tokens.access_token;
}

/** Build the authorization URL for the user to visit */
export function getAuthorizationUrl(): string {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    response_type: "code",
    scope: "video.publish,video.upload",
    redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
    state: "bighead_tiktok_auth",
  });

  return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
}

/**
 * Run a temporary HTTP server to handle the OAuth callback.
 * Usage: TIKTOK_CLIENT_KEY=... TIKTOK_CLIENT_SECRET=... TIKTOK_REDIRECT_URI=... npx tsx src/tiktok-auth.ts
 */
if (process.argv[1]?.endsWith("tiktok-auth.ts") || process.argv[1]?.endsWith("tiktok-auth.js")) {
  const port = parseInt(process.env.TIKTOK_CALLBACK_PORT || "3456");

  console.log("\n🔐 TikTok OAuth Setup\n");
  console.log("1. Visit this URL in your browser:");
  console.log(`\n   ${getAuthorizationUrl()}\n`);
  console.log("2. Authorize the app on TikTok");
  console.log(`3. You'll be redirected to the callback (port ${port})`);
  console.log("\nWaiting for callback...\n");

  const server = createServer(async (req, res) => {
    const url = new URL(req.url!, `http://localhost:${port}`);

    if (url.pathname === "/tiktok/callback" || url.pathname === "/") {
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end(`<h1>Error: ${error}</h1><p>${url.searchParams.get("error_description")}</p>`);
        server.close();
        process.exit(1);
      }

      if (code) {
        try {
          const tokens = await exchangeCode(code);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`<h1>TikTok authorized!</h1><p>Tokens saved. You can close this tab.</p><p>Open ID: ${tokens.open_id}</p>`);
          console.log("✅ Tokens saved to", TOKEN_FILE);
          console.log(`   Open ID: ${tokens.open_id}`);
          console.log(`   Expires: ${new Date(tokens.expires_at).toISOString()}`);
          server.close();
          process.exit(0);
        } catch (err) {
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end(`<h1>Error exchanging code</h1><p>${err}</p>`);
          server.close();
          process.exit(1);
        }
      }
    }

    res.writeHead(404);
    res.end("Not found");
  });

  server.listen(port, () => {
    console.log(`OAuth callback server listening on port ${port}`);
  });
}

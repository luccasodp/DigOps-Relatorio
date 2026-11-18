import { SignJWT, importPKCS8 } from "jose";

const ESCOPO = "https://www.googleapis.com/auth/spreadsheets.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

let tokenCache = { valor: null, expira: 0 };
let titulosCache = { lista: null, expira: 0 };

function chavePrivada() {
  return (process.env.GOOGLE_PRIVATE_KEY || "")
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n");
}

async function obterToken() {
  const agora = Math.floor(Date.now() / 1000);
  if (tokenCache.valor && tokenCache.expira > agora + 60) return tokenCache.valor;

  const chave = await importPKCS8(chavePrivada(), "RS256");
  const assertion = await new SignJWT({ scope: ESCOPO })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(process.env.GOOGLE_CLIENT_EMAIL)
    .setAudience(TOKEN_URL)
    .setIssuedAt()
    .setExpirationTime("50m")
    .sign(chave);

  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!r.ok) throw new Error(`Falha ao autenticar no Google (${r.status}): ${await r.text()}`);
  const j = await r.json();
  tokenCache = { valor: j.access_token, expira: agora + (j.expires_in || 3600) };
  return tokenCache.valor;
}

async function chamar(url) {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${await obterToken()}` } });
  if (!r.ok) throw new Error(`Sheets API ${r.status}: ${await r.text()}`);
  return r.json();
}

const norm = (s) => String(s).replace(/\s+/g, " ").trim().toLowerCase();

async function titulos() {
  const agora = Date.now();
  if (titulosCache.lista && titulosCache.expira > agora) return titulosCache.lista;
  const j = await chamar(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}?fields=sheets.properties.title`
  );
  titulosCache = { lista: j.sheets.map((s) => s.properties.title), expira: agora + 10 * 60 * 1000 };
  return titulosCache.lista;
}

/** Lê uma aba (achada pelo prefixo do nome) e devolve a matriz crua de valores. */
export async function lerAba({ prefixo, ate }) {
  const alvo = norm(prefixo);
  const titulo = (await titulos()).find((t) => norm(t).startsWith(alvo));
  if (!titulo) throw new Error(`Aba não encontrada: "${prefixo}"`);

  const range = `'${titulo.replace(/'/g, "''")}'!A:${ate}`;
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_ID}/values/${encodeURIComponent(range)}` +
    `?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER`;
  const j = await chamar(url);
  return j.values || [];
}

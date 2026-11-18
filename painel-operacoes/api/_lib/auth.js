import { SignJWT, jwtVerify } from "jose";
import { createHash, timingSafeEqual } from "node:crypto";

const COOKIE = "sessao";
const DURACAO_SEG = 60 * 60 * 12; // 12 horas

function segredo() {
  const s = process.env.SESSION_SECRET || "";
  if (s.length < 32) throw new Error("SESSION_SECRET precisa ter pelo menos 32 caracteres");
  return new TextEncoder().encode(s);
}

function lerCookie(req, nome) {
  const bruto = req.headers.cookie || "";
  for (const parte of bruto.split(";")) {
    const [k, ...v] = parte.trim().split("=");
    if (k === nome) return decodeURIComponent(v.join("="));
  }
  return null;
}

const sha = (s) => createHash("sha256").update(String(s)).digest();

/** Confere usuário/senha contra a variável PAINEL_USUARIOS (JSON {"usuario":"senha"}). */
export function conferirCredenciais(usuario, senha) {
  let mapa = {};
  try {
    mapa = JSON.parse(process.env.PAINEL_USUARIOS || "{}");
  } catch {
    mapa = {};
  }
  const u = String(usuario || "").trim().toLowerCase();
  const chave = Object.keys(mapa).find((k) => k.toLowerCase() === u);
  const esperado = chave ? mapa[chave] : "senha-invalida-" + Math.random();
  const igual = timingSafeEqual(sha(senha || ""), sha(esperado));
  return chave && igual ? chave : null;
}

export async function criarSessao(res, usuario) {
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(usuario)
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SEG}s`)
    .sign(segredo());
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=${encodeURIComponent(jwt)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${DURACAO_SEG}`
  );
}

export function encerrarSessao(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`);
}

/** Devolve o usuário logado ou null. */
export async function lerSessao(req) {
  const jwt = lerCookie(req, COOKIE);
  if (!jwt) return null;
  try {
    const { payload } = await jwtVerify(jwt, segredo(), { algorithms: ["HS256"] });
    return payload.sub || null;
  } catch {
    return null;
  }
}

/** Use no início de cada função protegida. Já responde 401 se não houver sessão. */
export async function exigirSessao(req, res) {
  const usuario = await lerSessao(req);
  if (!usuario) {
    res.setHeader("Cache-Control", "no-store");
    res.status(401).json({ erro: "nao_autenticado" });
    return null;
  }
  return usuario;
}

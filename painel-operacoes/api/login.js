import { conferirCredenciais, criarSessao } from "./_lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ erro: "metodo_invalido" });

  const { usuario, senha } = req.body || {};
  const ok = conferirCredenciais(usuario, senha);

  if (!ok) {
    await new Promise((r) => setTimeout(r, 700)); // atrasa tentativas de adivinhação
    return res.status(401).json({ erro: "credenciais_invalidas" });
  }
  await criarSessao(res, ok);
  return res.status(200).json({ ok: true, usuario: ok });
}

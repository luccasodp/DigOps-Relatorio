import { exigirSessao } from "./_lib/auth.js";

export default async function handler(req, res) {
  const usuario = await exigirSessao(req, res);
  if (!usuario) return;
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ usuario });
}

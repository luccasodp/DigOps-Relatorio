import { encerrarSessao } from "./_lib/auth.js";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  encerrarSessao(res);
  res.status(200).json({ ok: true });
}

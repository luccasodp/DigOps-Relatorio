import { exigirSessao } from "./_lib/auth.js";
import { ABAS } from "./_lib/abas.js";
import { lerAba } from "./_lib/sheets.js";
import { tratar } from "./_lib/tratar.js";

export default async function handler(req, res) {
  const usuario = await exigirSessao(req, res);
  if (!usuario) return;

  const id = String(req.query.aba || "");
  const cfg = ABAS[id];
  if (!cfg) return res.status(400).json({ erro: "aba_invalida", abas: Object.keys(ABAS) });

  const dias = Math.min(Math.max(parseInt(req.query.dias, 10) || 0, 0), 3650);

  try {
    const values = await lerAba(cfg);
    const { colunas, linhas } = tratar(values, { cabecalho: cfg.cabecalho, dias });
    // "private": nunca deixe a CDN guardar resposta autenticada
    res.setHeader("Cache-Control", "private, max-age=120");
    return res.status(200).json({
      aba: id,
      atualizadoEm: new Date().toISOString(),
      colunas,
      linhas,
    });
  } catch (e) {
    console.error("[dados]", id, e.message);
    return res.status(502).json({ erro: "falha_ao_ler_planilha" });
  }
}

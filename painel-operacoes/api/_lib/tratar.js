// Limpa os valores crus do Google Sheets (UNFORMATTED_VALUE + SERIAL_NUMBER).

export function serialParaISO(n) {
  return new Date(Math.round((n - 25569) * 86400000)).toISOString().slice(0, 10);
}

function paraISO(v) {
  if (typeof v === "number" && v > 20000 && v < 80000) return serialParaISO(v);
  if (typeof v === "string") {
    const s = v.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return null;
}

export function limpar(v) {
  if (v === undefined || v === null) return null;
  if (typeof v !== "string") return v;
  const s = v.trim();
  if (s === "" || s.startsWith("#")) return null; // vazio ou erro (#DIV/0!, #N/A...)
  if (/^-?\d+([.,]\d+)?%$/.test(s)) return Number((parseFloat(s.replace(",", ".")) / 100).toFixed(6));
  if (/^-?\d+([.,]\d+)?$/.test(s)) return parseFloat(s.replace(",", "."));
  return s;
}

/**
 * values: matriz crua da API. cabecalho: sobrescreve a 1ª linha (opcional).
 * dias: só mantém as linhas dos últimos N dias (0 = tudo).
 */
export function tratar(values, { cabecalho, dias = 0 } = {}) {
  if (!values || values.length < 2) return { colunas: [], linhas: [] };
  const cab = (cabecalho || values[0]).map((c) => String(c ?? "").trim());
  const corte = dias > 0 ? new Date(Date.now() - dias * 86400000).toISOString().slice(0, 10) : null;

  const linhas = [];
  for (const bruta of values.slice(1)) {
    const obj = {};
    cab.forEach((nome, i) => {
      if (!nome) return;
      obj[nome] = nome === "Data" ? paraISO(bruta[i]) : limpar(bruta[i]);
    });
    if (!obj.Data) continue; // linha sem data válida
    if (corte && obj.Data < corte) continue;
    linhas.push(obj);
  }
  linhas.sort((a, b) => (a.Data < b.Data ? -1 : a.Data > b.Data ? 1 : 0)); // sort estável
  return { colunas: cab.filter(Boolean), linhas };
}

// Abas da planilha expostas ao painel.
// `prefixo`: nome da aba. O Excel corta nomes em 31 caracteres, então o código
//            procura a aba cujo título COMEÇA com esse texto (ignora espaços duplos).
// `ate`:     última coluna lida (A até X).
// `cabecalho`: (opcional) nomes das colunas, usado quando a planilha repete "%".
export const ABAS = {
  ml: { prefixo: "Acompanhamento - Mercado Livre", ate: "P" },
  magalu: { prefixo: "Acompanhamento - Magalu", ate: "I" },
  amazon: {
    prefixo: "Acompanhamento - Amazon",
    ate: "L",
    cabecalho: [
      "Data", "Estado da conta", "Total de pedidos - 60 d", "Pedidos com problemas",
      "% Problemas", "Garantia de A a Z", "Pedidos de estorno", "Avaliações negativas",
      "Total de pedidos - 30 d", "Envios tardios", "% Envios tardios", "Obs",
    ],
  },
  americanas: { prefixo: "Acompanhamento - Americanas", ate: "E" },
  shopee: { prefixo: "Acompanhamento - Shopee Colch", ate: "F" },
  webcontinental: { prefixo: "Acompanhamento - WebContinental", ate: "F" },
  viavarejo: {
    prefixo: "Acompanhamento - Via Varejo",
    ate: "J",
    cabecalho: [
      "Data", "Nota da loja", "Pedidos", "Expedidos com atraso", "% Atraso",
      "Reclamação", "% Reclamação", "Cancelamento", "% Cancelamento", "Obs",
    ],
  },
  leroy: { prefixo: "Acompanhamento - Leroy Merlin", ate: "F" },
  reclameaqui: { prefixo: "Acompanhamento - Reclame Aqui O", ate: "H" },
};

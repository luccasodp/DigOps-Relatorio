# Painel Operações Digital

Google Sheets → função na Vercel (com login) → painel em HTML.

```
Navegador ──(login)──> /api/dados ──(service account)──> Google Sheets
```

O navegador nunca vê a planilha nem a chave. Sem login, `/api/dados` responde 401.

## Estrutura

```
api/
  login.js        POST usuário/senha → cria cookie de sessão
  logout.js       apaga o cookie
  sessao.js       diz quem está logado (ou 401)
  dados.js        GET ?aba=ml&dias=90 → JSON da aba (exige login)
  _lib/
    auth.js       sessão (JWT em cookie HttpOnly) e conferência de senha
    sheets.js     autentica a service account e lê o Sheets
    tratar.js     limpa datas, %, erros (#DIV/0!) e linhas vazias
    abas.js       lista das abas expostas
public/
  index.html      painel (KPIs, gráficos, tabela)
  login.html      tela de login
```

## Variáveis de ambiente (Vercel → Settings → Environment Variables)

| Nome | Valor |
|---|---|
| `GOOGLE_CLIENT_EMAIL` | `client_email` do JSON da service account |
| `GOOGLE_PRIVATE_KEY` | `private_key` do JSON, inteira, de `-----BEGIN PRIVATE KEY-----` até `-----END PRIVATE KEY-----` |
| `SHEET_ID` | trecho da URL da planilha entre `/d/` e `/edit` |
| `SESSION_SECRET` | texto aleatório com 32+ caracteres (veja abaixo) |
| `PAINEL_USUARIOS` | JSON com usuários e senhas, ex.: `{"james":"troque-esta-senha","ana":"outra-senha-forte"}` |

Gerar o `SESSION_SECRET`:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Depois de criar ou alterar variáveis, faça um **Redeploy** para valer.

## Publicar

1. Crie um repositório no GitHub e suba estes arquivos (sem o JSON da service account).
2. Na Vercel: **Add New → Project → importe o repositório**. Framework: *Other*. Não precisa de build command.
3. Cadastre as variáveis acima e clique em **Deploy**.
4. Confirme que a planilha está compartilhada (Leitor) com o `client_email`.

## Ajustes comuns

- **Nova aba**: adicione em `api/_lib/abas.js` e em `ABAS` no `public/index.html` (mesmo `id`).
- **Renomeou uma coluna na planilha**: ajuste o nome em `public/index.html` (kpis/graficos).
- **Aba não encontrada**: o nome no `prefixo` precisa bater com o começo do título da aba no Sheets.
- **Novo usuário/troca de senha**: edite `PAINEL_USUARIOS` e faça Redeploy.

## Fora do painel de propósito

- `Cancelamentos - Site Ortobom` (tem CPF/CNPJ de clientes).
- `Reclame Aqui Site` (cabeçalho na linha 4, layout diferente; precisa de tratamento próprio).
- `Carteira Digital` e `Cancelamentos - MKTP` (vazias).

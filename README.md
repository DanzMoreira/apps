# Meus Apps — página de divulgação

Hub público estático dos aplicativos de [Danz Moreira](https://github.com/DanzMoreira), preparado para o GitHub Pages:

**https://danzmoreira.github.io/apps/**

Repositório alvo: [DanzMoreira/apps](https://github.com/DanzMoreira/apps).

## Objetivo

Apresentar os apps em uma página simples, moderna e responsiva, fácil de manter via JSON. Tracking de cliques (redirects via Raspberry / domínio próprio) fica para uma fase posterior — a função `openApp()` já centraliza a abertura dos links.

## Estrutura

```text
apis-pagina-divulgacao/
├── index.html
├── 404.html
├── css/style.css
├── js/app.js
├── data/apps.json
├── assets/
│   ├── icons/          # ícones dos apps (+ favicon.svg)
│   ├── screenshots/    # opcional
│   └── qrcodes/        # opcional (só aparece se cadastrado no JSON)
└── README.md
```

Sem frameworks, sem build: HTML + CSS + JavaScript puro.

> Esta pasta vive em `APP_APIS` como fonte local. O conteúdo publicado no GitHub Pages é a raiz do repositório `apps` (copie estes arquivos para a raiz do repo ao publicar).

## Executar localmente

Na pasta deste projeto:

```bash
cd /home/danilo/Desktop/APP_APIS/apis-pagina-divulgacao
python3 -m http.server 5500
```

Abra: [http://localhost:5500/](http://localhost:5500/)

> `fetch` do `apps.json` exige um servidor HTTP (abrir o `index.html` via `file://` falha).

## Publicar no GitHub Pages

Este diretório **já é** o repositório [DanzMoreira/apps](https://github.com/DanzMoreira/apps)
(clonado em `APP_APIS/apis-pagina-divulgacao/apps`).

Para comitar o APP_APIS (se for git) e em seguida este Pages:

```bash
/home/danilo/Desktop/APP_APIS/apis-pagina-divulgacao/comitar.sh "sua mensagem"
```

Na primeira vez no GitHub: **Settings → Pages** → branch `main` / root (`/`).

Todos os caminhos do site são **relativos** (`css/style.css`, `data/apps.json`, `assets/...`) para funcionar no subdiretório `/apps/` do GitHub Pages.

## Adicionando um novo aplicativo

1. Adicione o ícone em `assets/icons/`
2. Adicione screenshots, se houver, em `assets/screenshots/`
3. Adicione o registro em `data/apps.json`
4. Commit e push para `main`
5. O GitHub Pages será atualizado

Não é necessário editar o HTML: os cards são gerados pelo JavaScript a partir do JSON.

### Exemplo de registro

```json
{
  "id": "meu-app",
  "name": "Meu App",
  "subtitle": "Frase curta",
  "description": "Descrição curta do aplicativo.",
  "icon": "assets/icons/meu-app.svg",
  "platforms": ["ios"],
  "status": "published",
  "featured": false,
  "links": {
    "ios": "https://apps.apple.com/..."
  }
}
```

Campo opcional de QR Code (só renderiza se preenchido):

```json
"qrCode": "assets/qrcodes/meu-app.png"
```

## Campos do `apps.json`

| Campo | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | string | sim | Identificador estável (slug) |
| `name` | string | sim | Nome exibido |
| `subtitle` | string | não | Linha auxiliar |
| `description` | string | sim | Texto curto do card |
| `icon` | string | sim | Caminho relativo do ícone |
| `platforms` | string[] | sim | Ex.: `ios`, `android`, `web` |
| `status` | string | sim | `published` · `development` · `coming-soon` |
| `featured` | boolean | não | Destaque visual sutil |
| `links` | object | sim | URLs por plataforma (`ios`, `android`, `web`…) |
| `qrCode` | string | não | Caminho do QR; omita ou deixe vazio para não exibir |

### Status na interface

- `published` → **Disponível** (mostra botão Baixar)
- `development` → **Em desenvolvimento** (sem botão Baixar)
- `coming-soon` → **Em breve** (sem botão Baixar)

## Onde colocar arquivos

| Tipo | Pasta |
|------|--------|
| Ícones | `assets/icons/` |
| Screenshots | `assets/screenshots/` |
| QR Codes | `assets/qrcodes/` |

Ícones de exemplo atuais usam SVG; PNG/WebP também funcionam — basta apontar o caminho no JSON.

## Links sociais

No topo da página há GitHub, X e Instagram. Por enquanto apontam para `#`.  
Configure os URLs em `js/app.js`, objeto `SITE.social`.

## Tracking futuro

**Não implementado nesta fase.**

A abertura dos apps passa por `openApp(app, source)` e `resolveAppUrl(app, source)` em `js/app.js`.  
Quando o redirect próprio existir (ex.: `https://go.meudominio.com/cosmos?src=github-pages`), altere apenas essas funções — não espalhe URLs da loja pelo HTML.

Não há analytics, cookies nem contagem de cliques locais nesta versão.

## 404

`404.html` segue o mesmo visual e oferece link para `index.html`. No GitHub Pages de projeto, a página 404 personalizada é servida automaticamente para caminhos inexistentes do repositório.

## O que não faz parte desta fase

Banco de dados, API, Raspberry Pi, tunnel, login, dashboard, analytics, cookies, QR dinâmico ou frameworks de build.

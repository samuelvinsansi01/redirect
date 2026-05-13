# Figma Redirect

Redirecionador inteligente para protótipos do Figma — detecta o dispositivo do usuário e redireciona para a versão Desktop ou Mobile automaticamente.

## Estrutura

```
figma-redirect/
├── api/
│   └── shorten.js       ← Vercel Function (integração TinyURL)
├── public/
│   ├── index.html       ← Ferramenta geradora de links
│   └── r.html           ← Página de redirecionamento
└── vercel.json          ← Configuração de rotas
```

## Como funciona

1. Acesse a ferramenta em `figma-redirect.vercel.app`
2. Cole o link Desktop e o link Mobile do Figma
3. Clique em **Gerar link TinyURL**
4. Compartilhe o link encurtado gerado

Quando alguém acessar o link:
- Se for **mobile** (user agent ou tela < 768px) → redireciona para o protótipo mobile
- Se for **desktop** → redireciona para o protótipo desktop

## Deploy no Vercel

### 1. Suba o projeto no GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/SEU_USUARIO/figma-redirect.git
git push -u origin main
```

### 2. Importe no Vercel

- Acesse [vercel.com](https://vercel.com)
- Clique em **Add New Project**
- Importe o repositório do GitHub
- Em **Root Directory**, deixe como raiz `/`

### 3. Configure a variável de ambiente

No painel do Vercel, vá em **Settings → Environment Variables** e adicione:

| Nome | Valor |
|------|-------|
| `TINYURL_TOKEN` | `lkioSAXg3T1bMyxOXPDxdvP3M3jJvwYqvRoooc4G6ZQdiG5tBGpMPq8Kn6fx` |
| `BASE_URL` | `https://figma-redirect.vercel.app` |

### 4. Deploy

Clique em **Deploy**. Pronto!

## Detecção de dispositivo

A lógica combina dois métodos:
- **User Agent**: detecta iPhone, Android, iPad, etc.
- **Largura de tela**: telas menores que 768px são tratadas como mobile

## Sufixo dos links

Todos os links gerados terão o sufixo `-vin` automaticamente.  
Exemplo: `tinyurl.com/projeto-vin`

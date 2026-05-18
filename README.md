# Prospecção WhatsApp — Vercel + Redis + Evolution API

## Estrutura do projeto

```
/
├── api/
│   ├── redirect.js              ← Redireciona alias → URL (desktop ou mobile)
│   ├── shorten.js               ← Cria link curto (TinyURL + Redis)
│   ├── update.js                ← Atualiza links de um alias
│   └── prospeccao/
│       ├── chips.js             ← CRUD de chips (instâncias Evolution API)
│       ├── disparo.js           ← Proxy server-side para envio WhatsApp
│       ├── empresas.js          ← Salva/busca empresas com deduplicação
│       ├── fila.js              ← Fila semanal por chip/dia (máx 60/dia)
│       ├── ramos.js             ← CRUD de ramos de prospecção
│       └── validar-numero.js    ← Proxy para checar número na Evolution API
├── public/
│   ├── index.html               ← Frontend completo (SPA 7 abas)
│   └── r.html                   ← Página de redirecionamento Figma
└── vercel.json
```

## Variáveis de ambiente (Vercel)

| Variável            | Descrição                                      |
|---------------------|------------------------------------------------|
| `KV_REST_API_URL`   | URL do Upstash Redis (ex: https://xxx.upstash.io) |
| `KV_REST_API_TOKEN` | Token Bearer do Upstash Redis                  |
| `BASE_URL`          | URL base do projeto (ex: https://meuapp.vercel.app) |
| `TINYURL_TOKEN`     | Token da API TinyURL                           |

## Endpoints da API de prospecção

### Chips (`/api/prospeccao/chips`)
- `GET /api/prospeccao/chips` — lista todos os chips
- `GET /api/prospeccao/chips?id=xxx` — chip específico
- `GET /api/prospeccao/chips?id=xxx&action=qr` — QR Code da instância
- `GET /api/prospeccao/chips?id=xxx&action=status` — status de conexão
- `POST /api/prospeccao/chips` — cria chip e instância na Evolution API
- `PATCH /api/prospeccao/chips` — atualiza dados do chip
- `DELETE /api/prospeccao/chips?id=xxx` — remove chip e instância

### Empresas (`/api/prospeccao/empresas`)
- `GET /api/prospeccao/empresas?tipo=validacao` — fila de validação
- `GET /api/prospeccao/empresas?tipo=sem-site` — empresas sem site
- `POST /api/prospeccao/empresas` — salva empresas (deduplicação por phone/domínio)
- `PATCH /api/prospeccao/empresas` — atualiza campo de empresa
- `DELETE /api/prospeccao/empresas?id=xxx` — remove empresa

### Fila (`/api/prospeccao/fila`)
- `GET /api/prospeccao/fila?chip=xxx` — semana inteira do chip
- `GET /api/prospeccao/fila?chip=xxx&dia=19/05/2025` — fila do dia
- `POST /api/prospeccao/fila` — adiciona empresas (overflow automático pro próximo dia útil)
- `PATCH /api/prospeccao/fila` — atualiza status de empresa
- `DELETE /api/prospeccao/fila?chip=xxx&dia=xxx&id=xxx` — remove empresa da fila

### Ramos (`/api/prospeccao/ramos`)
- `GET /api/prospeccao/ramos` — lista todos (semeia padrões se vazio)
- `POST /api/prospeccao/ramos` — cria ramo
- `PATCH /api/prospeccao/ramos` — atualiza nome/keywords
- `DELETE /api/prospeccao/ramos?id=xxx` — remove ramo

### Disparo (`/api/prospeccao/disparo`)
- `POST /api/prospeccao/disparo` — envia 3 mensagens por empresa (texto + link + imagem)

### Validar número (`/api/prospeccao/validar-numero`)
- `POST /api/prospeccao/validar-numero` — verifica se número existe no WhatsApp

## Chaves Redis utilizadas

| Chave                              | Conteúdo                          |
|------------------------------------|-----------------------------------|
| `prospeccao:chips`                 | Array de chips                    |
| `prospeccao:ramos`                 | Array de ramos                    |
| `prospeccao:validacao`             | Empresas aguardando validação     |
| `prospeccao:sem-site`              | Empresas sem site (fila Instagram)|
| `prospeccao:base:phones`           | Set de telefones já usados        |
| `prospeccao:base:sites`            | Set de domínios já usados         |
| `prospeccao:fila:{chip}:{dia}`     | Fila do dia por chip              |
| `redirect:{alias}`                 | Registro de link curto            |

## Deploy

1. Faça push para o GitHub
2. Conecte o repositório no Vercel
3. Configure as variáveis de ambiente acima
4. Deploy automático a cada push na main

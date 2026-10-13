# OdontoLis · Dra. Giovana Canto: landing page de captura

Landing page estática (HTML + CSS + JS puro, sem build), mobile-first, para captar pacientes interessados em transformação do sorriso com **resina composta** em Feira de Santana (BA).

## Estrutura

```
index.html                 página
assets/css/style.css       estilos (paleta Linen/Khaki/Camel/Cocoa/Espresso)
assets/js/config.js        ⚙️ CONFIGURAÇÕES (WhatsApp, webhook, CRO)
assets/js/main.js          formulário, máscara, carrossel, animações
assets/img/                imagens otimizadas (WebP)
docs/google-sheets-apps-script.gs   receptor de leads para Planilha Google
```

## Antes de publicar

Edite `assets/js/config.js`:

| Campo | O que é |
|---|---|
| `whatsappNumber` | Número da clínica com DDI+DDD, só dígitos (ex.: `5575999999999`) |
| `webhookUrl` | URL que recebe o lead (vazio = só WhatsApp) |
| `redirectToWhatsapp` | `true` abre o WhatsApp com a mensagem pronta após o envio |
| `cro` | Opcional, aparece no rodapé (ex.: `CRO-BA 00000`) |

## Para onde vão os leads

O formulário faz `POST` (JSON, `Content-Type: text/plain`) para `webhookUrl` e depois abre o WhatsApp com a mensagem já preenchida. Exemplo do JSON enviado:

```json
{
  "nome": "Maria", "whatsapp": "5575991234567", "whatsapp_formatado": "(75) 9 9123-4567",
  "interesse": "Lentes / facetas em resina", "incomodos": "Cor / dentes amarelados, Espaços entre os dentes",
  "periodo": "Manhã", "origem": "LP Resina — Dra. Giovana Canto", "pagina": "https://...",
  "data": "2026-10-13T14:38:54.497Z", "utm_source": "instagram", "utm_campaign": "resina"
}
```

- **Planilha Google**: siga as instruções em `docs/google-sheets-apps-script.gs`.
- **CRM (RD Station, Kommo, HubSpot etc.) / n8n / Make / Zapier**: crie um webhook de entrada e cole a URL em `webhookUrl`.
- **Só WhatsApp**: deixe `webhookUrl` vazio.

UTMs, `gclid` e `fbclid` da URL são capturados automaticamente. Se houver Meta Pixel (`fbq`), GA4 (`gtag`) ou GTM (`dataLayer`) na página, o evento de lead é disparado no envio.

## Rodar localmente

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Pode ser publicada em qualquer hospedagem estática (Netlify, Vercel, GitHub Pages, Hostinger etc.).

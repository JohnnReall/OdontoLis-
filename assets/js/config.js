/* =========================================================
   CONFIGURAÇÕES DA LANDING PAGE — edite aqui
   ========================================================= */
window.LP_CONFIG = {
  // Número do WhatsApp da clínica: DDI + DDD + número, só dígitos.
  // Ex.: 5575999999999
  whatsappNumber: "5575000000000",

  // URL que recebe os leads via POST (JSON).
  // Pode ser: Google Apps Script (planilha), n8n, Make, Zapier, RD Station, Kommo etc.
  // Deixe vazio ("") para enviar o lead só para o WhatsApp.
  webhookUrl: "",

  // true  -> depois de salvar o lead, abre o WhatsApp com a mensagem pronta
  // false -> só mostra a mensagem de sucesso
  redirectToWhatsapp: true,

  // Opcional: exibido no rodapé (ex.: "CRO-BA 00000")
  cro: ""
};

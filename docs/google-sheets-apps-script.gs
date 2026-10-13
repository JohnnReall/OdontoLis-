/**
 * Recebe os leads da landing page e grava numa Planilha Google.
 *
 * Como usar:
 * 1. Crie uma planilha no Google Sheets.
 * 2. Menu Extensões > Apps Script. Apague o conteúdo e cole este arquivo.
 * 3. Clique em Implantar > Nova implantação > tipo "App da Web".
 *    - Executar como: Eu
 *    - Quem pode acessar: Qualquer pessoa
 * 4. Copie a URL gerada (termina em /exec) e cole em assets/js/config.js -> webhookUrl.
 */
const COLUNAS = [
  "data", "nome", "whatsapp", "whatsapp_formatado", "interesse", "incomodos", "periodo",
  "origem", "pagina", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(COLUNAS);
    const lead = JSON.parse(e.postData.contents);
    sheet.appendRow(COLUNAS.map(function (c) { return lead[c] || ""; }));
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

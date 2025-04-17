const { google } = require('googleapis');
require('dotenv').config();

// Autenticación con Google Sheets
const auth = new google.auth.GoogleAuth({
  keyFile: 'secrets/credentials.json', // Asegurate que exista y tenga los permisos correctos
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SHEET_ID;

async function testWrite() {
  try {
    const now = new Date().toLocaleString('es-AR');
    const values = [['Prueba desde script', now]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Hoja1!A:B',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: values,
      },
    });

    console.log('✅ Se escribió correctamente en el Google Sheet');
  } catch (error) {
    console.error('❌ Error al escribir en Google Sheets:', error.message);
  }
}

testWrite();

// index.js - Bot de Truco High Level con estructura limpia
const wppconnect = require('@wppconnect-team/wppconnect');
const qrcode = require('qrcode-terminal');
const { google } = require('googleapis');
const cron = require('node-cron');
require('dotenv').config();

// === Configuración de Google Sheets ===
const auth = new google.auth.GoogleAuth({
  keyFile: 'secrets/credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SHEET_ID;

// === Utilidades ===
const parseMonto = (str) => {
  if (!str) return 0;
  const limpio = str.toLowerCase().replace(/\./g, '').replace(',', '').trim();
  return limpio.includes('k') ? parseInt(limpio) * 1000 : parseInt(limpio);
};

const detectarDuelo = (msg) => {
  const tipo = msg.includes('1 VS 1') ? '1 VS 1' :
               msg.includes('2 VS 2') ? '2 VS 2' :
               msg.includes('3 VS 3') ? '3 VS 3' : null;
  if (!tipo) return null;

  const entradaRaw = msg.match(/entrada.*?\$?\s*([\d.]+)/i)?.[1] || '';
  const premioRaw  = msg.match(/premio.*?\$?\s*([\d.]+)/i)?.[1] || '';

  const entrada = parseMonto(entradaRaw);
  const premio  = parseMonto(premioRaw);

  const jugadores = [...msg.matchAll(/[@+~]\d+/g)].map(j => j[0].trim()).join(', ');
  const comision = Math.round(entrada * 2 * 0.05);
  const fecha = new Date().toLocaleString('es-AR');

  return [tipo, entrada, premio, jugadores, comision, fecha];
};

const guardarDuelo = async (data) => {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Hoja1!A:F',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [data] },
  });
  console.log('✅ Duelo guardado:', data);
};

const registrarMovimiento = async (jugador, monto, tipo, operador) => {
  const ahora = new Date().toLocaleString('es-AR');
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Movimientos!A:E',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[jugador, tipo, monto, ahora, operador]] },
  });
};

// === Inicializar cliente de WhatsApp ===
const qrcode = require('qrcode-terminal');

wppconnect.create({
  session: 'bot-truco',
  sessionPath: process.env.WPP_SESSION_PATH || '.wpp-session',
  catchQR: (base64Qr, asciiQR) => {
    console.clear();
    qrcode.generate(asciiQR, { small: true });
    console.log('🔄 Escaneá el código QR para conectar con WhatsApp.');
  },
  puppeteerOptions: {
    args: ['--no-sandbox'],
  },
  autoClose: false,
}).then((client) => {
  console.log('✅ Bot conectado correctamente a WhatsApp');
  runBotLogic(client); // tu lógica del bot debe estar en esta función
}).catch((error) => {
  console.error('❌ Error al iniciar WPPConnect:', error);
});


  const runBotLogic = (client) => {
    client.onMessage(async (msg) => {
      const body = msg.body.trim().toLowerCase();

      // === Resumen Diario Manual ===
      if (body === 'resumen ahora') {
        await enviarResumenDiario();
        await client.sendText(msg.from, '📊 Resumen diario generado manualmente.');
        return;
      }

      // === Generación automática de mensaje estructurado ===
      const match = msg.body.match(/(@[^\s]+(?:\s+@[^\s]+)*)\s+([\d.kK]+)\s+(1v1|2v2|3v3)/i);
      if (match) {
        const menciones = match[1].trim().split(/\s+/);
        const entrada = parseMonto(match[2]);
        const modalidad = match[3].toUpperCase();
        const tipoTexto = modalidad === '1V1' ? '¡1 VS 1!' : modalidad === '2V2' ? '¡2 VS 2!' : '¡3 VS 3!';
        const premio = Math.round((entrada * 2) * 0.95);
        const mensaje = `🤜🏻 *${tipoTexto}* 🤛🏻\n\n💵 Entrada $${entrada}\n🏆 Premio $${premio}\n\n${menciones.map(m => `👤 ${m}`).join('\n')}\n\n🔥DIGAN VOY🔥`;

        try {
          await client.deleteMessage(msg.from, msg.id);
          await client.sendTextWithMentions(msg.from, mensaje);
          console.log("✅ Mensaje de duelo estructurado generado.");
        } catch (e) {
          console.error("❌ Error al generar duelo:", e.message);
        }
        return;
      }


// === Confirmación de duelo con sticker ===
if (msg.type === 'sticker' && msg.hasQuotedMsg) {
    const quoted = await msg.getQuotedMessage();
    const data = detectarDuelo(quoted.body || quoted.text || '');
    if (!data) return console.log("❌ El mensaje citado no tiene formato de duelo.");
  
    const hoja = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Hoja1!A2:F',
    });
  
    const existentes = hoja.data.values || [];
    const yaRegistrado = existentes.some(r =>
      r[0] === data[0] &&
      r[1] === String(data[1]) &&
      r[2] === String(data[2]) &&
      r[3] === data[3]
    );
  
    if (yaRegistrado) return console.log("⚠️ Duelo ya registrado.");
    console.log('📥 Detectado duelo para guardar:', data);
    await guardarDuelo(data);
    return;
  }
  

  // === GANÓ: jugador (solo si responde al mensaje de duelo)
  if (/^(gano|gana)\s+@/i.test(body) && msg.quotedMsg) {
    const ganador = msg.body.split(' ')[1]?.trim();
    const quoted = msg.quotedMsg;
    const data = detectarDuelo(quoted.body || quoted.text || '');
    if (!data || !ganador || !data[3].includes(ganador)) return;

    const [modalidad, entrada, premio, jugadoresStr] = data;
    const jugadores = jugadoresStr.split(',').map(j => j.trim());
    const perdedor = jugadores.find(j => j !== ganador);
    const entradaNum = parseFloat(entrada) || 0;
    const premioNum = parseFloat(premio) || 0;
    const gananciaNeta = premioNum - entradaNum;
    const now = new Date().toLocaleString('es-AR');
    const detalle = `Victoria ${modalidad}`;
    const detallePerdedor = `Derrota ${modalidad}`;

    const saldosData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Saldos!A2:D',
    });
    const rows = saldosData.data.values || [];

    const actualizarSaldo = async (jugador, monto, detalle) => {
      const index = rows.findIndex(r => r[0] === jugador);
      const actual = index !== -1 ? parseFloat(rows[index][1] || '0') : 0;
      const nuevo = Math.max(actual + monto, 0);

      if (index !== -1) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Saldos!B${index + 2}:D${index + 2}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[nuevo, now, detalle]] },
        });
      } else {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Saldos!A:D',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[jugador, nuevo, now, detalle]] },
        });
      }
      return nuevo;
    };

    const saldoGanador = await actualizarSaldo(ganador, gananciaNeta, detalle);
    const saldoPerdedor = await actualizarSaldo(perdedor, -entradaNum, detallePerdedor);

    const nroGanador = ganador.replace('@', '').replace(/\s+/g, '');
    const nroPerdedor = perdedor.replace('@', '').replace(/\s+/g, '');

    await client.sendText(`${nroGanador}@c.us`,
      `🏆 ¡Felicidades ${ganador}!\nTu nuevo saldo es: $${saldoGanador.toLocaleString('es-AR')}.\nTRUCO HIGHLEVEL 🔝`);

    await client.sendText(`${nroPerdedor}@c.us`,
      saldoPerdedor === 0
        ? `❌ ${perdedor}, perdiste el duelo.\nTu saldo ha quedado en $0.\nTRUCO HIGHLEVEL 🔻`
        : `❌ ${perdedor}, perdiste el duelo.\nSe descontaron $${entradaNum}.\nTu nuevo saldo es: $${saldoPerdedor.toLocaleString('es-AR')}.\nTRUCO HIGHLEVEL 🔻`);

    return;
  }
// === CARGA o RETIRO desde la línea del bot al cliente ===
if (/^(carga|cargo|retira|retiro)\s+\d+[kK.]*/.test(body) && message.fromMe) {
    const partes = message.body.trim().split(/\s+/);
    const comando = partes[0].toLowerCase();
    const montoRaw = partes[1];
  
    const monto = montoRaw.toLowerCase().includes('k')
      ? parseInt(montoRaw.replace(/[kK]/, '')) * 1000
      : parseInt(montoRaw.replace(/\./g, ''));
  
    if (!monto || monto <= 0) return;
  
    const esCarga = /^(carga|cargo)$/i.test(comando);
    const tipo = esCarga ? 'Carga manual' : 'Retiro manual';
    const jugador = '@' + message.to.replace('@c.us', '');
    const operador = '@' + message.from.replace('@c.us', '');
    const now = new Date().toLocaleString('es-AR');
  
    const saldos = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Saldos!A2:D',
    });
  
    const rows = saldos.data.values || [];
    const index = rows.findIndex(r => r[0] === jugador);
    const actual = index !== -1 ? parseFloat(rows[index][1]) : 0;
    const nuevo = Math.max(actual + (esCarga ? monto : -monto), 0);
  
    if (index !== -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Saldos!B${index + 2}:D${index + 2}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[nuevo, now, tipo]] },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Saldos!A:D',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[jugador, nuevo, now, tipo]] },
      });
    }
  
    await registrarMovimiento(jugador, esCarga ? monto : -monto, comando, operador);
  
    await client.sendText(message.to,
      `${esCarga ? '💰 Se acreditaron' : '💸 Se retiraron'} $${monto}.\nTu nuevo saldo es: $${nuevo}\nTRUCO HIGHLEVEL ${esCarga ? '🔼' : '🔻'}`);
  
    console.log(`✅ ${comando} directa a ${jugador} realizada por ${operador}`);
    return;
  }
  

// === Resumen diario automático ===
const enviarResumenDiario = async () => {
  const fecha = new Date().toLocaleDateString('es-AR');
  const hoja = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Hoja1!A2:F',
  });

  const datos = hoja.data.values || [];
  if (datos.length === 0) return console.log('⚠️ No hay duelos para resumir.');

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Historial Duelos!A:F',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: datos },
  });

  let c1 = 0, c2 = 0, c3 = 0, entradas = 0, premios = 0, comision = 0;
  for (const r of datos) {
    if (r[0] === '1 VS 1') c1++;
    if (r[0] === '2 VS 2') c2++;
    if (r[0] === '3 VS 3') c3++;
    entradas += parseFloat(r[1] || 0);
    premios += parseFloat(r[2] || 0);
    comision += parseFloat(r[4] || 0);
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Resumen Diario!A:G',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[fecha, c1, c2, c3, entradas, premios, comision]] },
  });

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Hoja1!A2:F',
  });

  console.log('📊 Resumen diario generado y Hoja1 reiniciada.');
};
});
};

// === Ejecutar resumen a las 00:00 ===
cron.schedule('0 0 * * *', () => {
  enviarResumenDiario().catch(console.error);
});


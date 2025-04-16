const { enviarResumenDiario } = require('./index');

enviarResumenDiario().then(() => {
  console.log('✅ Resumen ejecutado manualmente.');
  process.exit();
}).catch(console.error);

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/database.js';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Initialize SQLite database
initDatabase().then(() => {
  console.log('📦 Base de datos SQLite cargada correctamente.');
}).catch((err) => {
  console.error('❌ Error al inicializar SQLite:', err);
});

app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api', apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    const FALLBACK_PORT = PORT + 1;
    console.log(`⚠️ Puerto ${PORT} ocupado. Iniciando en puerto fallback ${FALLBACK_PORT}...`);
    app.listen(FALLBACK_PORT);
  } else {
    console.error('❌ Error en el servidor backend:', err);
  }
});

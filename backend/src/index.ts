import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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

// Serve frontend static build if available (Production / Render deployment)
const frontendDistPaths = [
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(__dirname, '../../frontend/dist')
];

const foundDist = frontendDistPaths.find((p) => fs.existsSync(p));

if (foundDist) {
  console.log(`🌐 Sirviendo frontend estático desde: ${foundDist}`);
  app.use(express.static(foundDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(foundDist, 'index.html'));
  });
}

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en puerto ${PORT}`);
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

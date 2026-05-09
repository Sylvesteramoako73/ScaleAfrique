import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { Server as SocketIOServer } from 'socket.io';

import { config } from './config';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './config/logger';
import { generalLimiter } from './api/middleware/rateLimiter';
import { errorHandler, notFound } from './api/middleware/errorHandler';
import apiRoutes from './api/routes';

const app = express();
const server = http.createServer(app);

export const io = new SocketIOServer(server, {
  cors: { origin: config.app.frontendUrl, credentials: true },
});

io.on('connection', (socket) => {
  socket.on('join', (userId: string) => socket.join(`user:${userId}`));
});

app.use(helmet({ contentSecurityPolicy: config.app.isDev ? false : undefined }));
app.use(cors({ origin: config.app.frontendUrl, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.app.isDev ? 'dev' : 'combined'));
app.use(generalLimiter);

app.set('io', io);
app.use('/api/v1', apiRoutes);
app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'ScaleAfrique API' }));
app.use(notFound);
app.use(errorHandler);

async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    server.listen(config.app.port, () => {
      logger.info(`ScaleAfrique API running on http://localhost:${config.app.port} [${config.app.env}]`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

process.on('SIGTERM', async () => { await disconnectDatabase(); process.exit(0); });
process.on('SIGINT',  async () => { await disconnectDatabase(); process.exit(0); });
process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection', { reason }));

startServer();

export { app };

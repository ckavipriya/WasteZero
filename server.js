import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const connectDB = require('./backend/config/db');
const initSocket = require('./backend/socket/socketHandler');
const { errorHandler, notFound } = require('./backend/middleware/errorHandler');

const authRoutes = require('./backend/routes/authRoutes');
const userRoutes = require('./backend/routes/userRoutes');
const pickupRoutes = require('./backend/routes/pickupRoutes');
const opportunityRoutes = require('./backend/routes/opportunityRoutes');
const applicationRoutes = require('./backend/routes/applicationRoutes');
const messageRoutes = require('./backend/routes/messageRoutes');
const notificationRoutes = require('./backend/routes/notificationRoutes');
const dashboardRoutes = require('./backend/routes/dashboardRoutes');
const adminRoutes = require('./backend/routes/adminRoutes');

// Initialize database connection (gracefully falls back to mock if offline)
connectDB();

const app = express();
// Enable trust proxy for reverse proxy environments (e.g. Cloud Run / Nginx)
app.set('trust proxy', 1);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', credentials: true },
});
app.set('io', io);
initSocket(io);

// Security & parsing middleware (safe for iframe embedding in AI Studio)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    frameguard: false,
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 1000,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

// Health check
app.get('/api/health', (req, res) =>
  res.status(200).json({ success: true, message: 'WasteZero API is running' })
);

// REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Fallback error handler for offline database (per migration skill guidelines)
app.use((err, req, res, next) => {
  if (
    err.name === 'MongooseError' ||
    err.name === 'MongoNetworkError' ||
    err.name === 'MongoServerSelectionError' ||
    err.message?.includes('buffering timed out') ||
    err.message?.includes('connect ECONNREFUSED')
  ) {
    console.warn('[AI Studio] Database offline fallback triggered for:', req.path);
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
    }
    return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
  }
  next(err);
});

// Vite middleware in development or static dist serving in production
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`WasteZero server running on http://0.0.0.0:${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

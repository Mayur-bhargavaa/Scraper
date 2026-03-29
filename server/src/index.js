import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server as SocketIO } from 'socket.io';

import env from './config/env.js';
import connectDB from './config/db.js';
import { setupSocket } from './socket/index.js';
import { apiLimiter } from './middleware/rateLimit.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import jobRoutes from './routes/job.routes.js';
import leadRoutes from './routes/lead.routes.js';
import exportRoutes from './routes/export.routes.js';
import scheduleRoutes from './routes/schedule.routes.js';
import campaignRoutes from './routes/campaign.routes.js';


// Workers (imported for side-effect: starts processing)
import '../engine/workers/scrapeWorker.js';
import '../engine/workers/enrichWorker.js';
import '../engine/workers/scoreWorker.js';

// Scheduler
import { initScheduler } from './services/scheduler.js';

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new SocketIO(server, {
  cors: {
    origin: env.clientUrl,
    methods: ['GET', 'POST'],
  },
});
setupSocket(io);

// Make io accessible to workers
globalThis.__io = io;

// Middleware
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/campaigns', campaignRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brand: 'Stitchbyte', version: '1.0.0' });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start
const start = async () => {
  await connectDB();
  initScheduler();

  server.listen(env.port, () => {
    console.log(`\n🧵 Stitchbyte server running on port ${env.port}`);
    console.log(`   Environment: ${env.nodeEnv}`);
    console.log(`   Client URL: ${env.clientUrl}\n`);
  });
};

start();

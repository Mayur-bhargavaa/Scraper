import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const setupSocket = (io) => {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, env.jwt.secret);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User ${socket.userId} connected`);

    // Join user-specific room for targeted updates
    socket.join(`user:${socket.userId}`);

    socket.on('subscribe:job', (jobId) => {
      socket.join(`job:${jobId}`);
      console.log(`👁 User subscribed to job ${jobId}`);
    });

    socket.on('unsubscribe:job', (jobId) => {
      socket.leave(`job:${jobId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.userId} disconnected`);
    });
  });
};

// Helper to emit job progress updates
export const emitJobProgress = (io, jobId, userId, data) => {
  io.to(`job:${jobId}`).emit('job:progress', { jobId, ...data });
  io.to(`user:${userId}`).emit('job:update', { jobId, ...data });
};

export const emitJobCompleted = (io, jobId, userId, data) => {
  io.to(`job:${jobId}`).emit('job:completed', { jobId, ...data });
  io.to(`user:${userId}`).emit('job:update', { jobId, status: 'completed', ...data });
};

export const emitJobFailed = (io, jobId, userId, error) => {
  io.to(`job:${jobId}`).emit('job:failed', { jobId, error });
  io.to(`user:${userId}`).emit('job:update', { jobId, status: 'failed', error });
};

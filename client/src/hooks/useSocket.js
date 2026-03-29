import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export const useSocket = () => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const socketServerUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:5001' : undefined);

  useEffect(() => {
    if (!token) return;

    const socket = io(socketServerUrl, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, socketServerUrl]);

  const subscribeToJob = useCallback((jobId, callbacks) => {
    const socket = socketRef.current;
    if (!socket) return () => {};

    socket.emit('subscribe:job', jobId);

    if (callbacks.onProgress) socket.on('job:progress', callbacks.onProgress);
    if (callbacks.onCompleted) socket.on('job:completed', callbacks.onCompleted);
    if (callbacks.onFailed) socket.on('job:failed', callbacks.onFailed);
    if (callbacks.onUpdate) socket.on('job:update', callbacks.onUpdate);

    return () => {
      socket.emit('unsubscribe:job', jobId);
      socket.off('job:progress', callbacks.onProgress);
      socket.off('job:completed', callbacks.onCompleted);
      socket.off('job:failed', callbacks.onFailed);
      socket.off('job:update', callbacks.onUpdate);
    };
  }, []);

  const onUserUpdate = useCallback((callback) => {
    const socket = socketRef.current;
    if (!socket) return () => {};

    socket.on('job:update', callback);
    return () => socket.off('job:update', callback);
  }, []);

  return { socket: socketRef.current, connected, subscribeToJob, onUserUpdate };
};

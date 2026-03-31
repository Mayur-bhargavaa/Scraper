import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const socketServerUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:5001' : undefined);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
      return;
    }

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
      setConnected(false);
    };
  }, [token, socketServerUrl]);

  const subscribeToJob = useCallback((jobId, callbacks = {}) => {
    const socket = socketRef.current;
    if (!socket) return () => {};

    socket.emit('subscribe:job', jobId);

    if (callbacks.onProgress) socket.on('job:progress', callbacks.onProgress);
    if (callbacks.onCompleted) socket.on('job:completed', callbacks.onCompleted);
    if (callbacks.onFailed) socket.on('job:failed', callbacks.onFailed);
    if (callbacks.onUpdate) socket.on('job:update', callbacks.onUpdate);

    return () => {
      socket.emit('unsubscribe:job', jobId);
      if (callbacks.onProgress) socket.off('job:progress', callbacks.onProgress);
      if (callbacks.onCompleted) socket.off('job:completed', callbacks.onCompleted);
      if (callbacks.onFailed) socket.off('job:failed', callbacks.onFailed);
      if (callbacks.onUpdate) socket.off('job:update', callbacks.onUpdate);
    };
  }, []);

  const onUserUpdate = useCallback((callback) => {
    const socket = socketRef.current;
    if (!socket) return () => {};

    socket.on('job:update', callback);
    return () => socket.off('job:update', callback);
  }, []);

  const value = useMemo(() => ({
    socket: socketRef.current,
    connected,
    subscribeToJob,
    onUserUpdate,
  }), [connected, subscribeToJob, onUserUpdate]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

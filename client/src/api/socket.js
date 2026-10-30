import { io } from 'socket.io-client';

let socket = null;

/**
 * Initialize or retrieve existing authenticated Socket.IO instance
 */
export const getSocket = () => {
  const token = localStorage.getItem('hommiez_token');
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (!socket) {
    // Derive server base URL from API URL or default to origin:5000
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const socketUrl = apiUrl.replace(/\/api\/v1\/?$/, '');

    socket = io(socketUrl, {
      auth: { token },
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });
  }

  return socket;
};

/**
 * Disconnect socket on logout
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

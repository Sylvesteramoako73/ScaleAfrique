import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socket: Socket | null = null;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;

    if (!socket) {
      socket = io((process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5001'), {
        auth: { token: accessToken },
        transports: ['websocket'],
      });
    }

    socketRef.current = socket;

    return () => {
      // keep socket alive across re-renders; disconnect on app unmount only
    };
  }, [accessToken]);

  return socketRef.current;
}

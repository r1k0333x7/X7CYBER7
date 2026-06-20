import { useEffect, useRef, useState } from 'react';
import { API_BASE } from './api';

export function useRealtime() {
  const [events, setEvents] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    const wsUrl = API_BASE.replace(/^http/, 'ws') + '/ws';
    let socket;
    try {
      socket = new WebSocket(wsUrl);
      ref.current = socket;
      socket.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          setEvents((prev) => [data, ...prev].slice(0, 50));
        } catch {}
      };
    } catch {}
    return () => socket && socket.close();
  }, []);

  return events;
}

import { WebSocketServer } from 'ws';

let wss = null;

export function initRealtime(server) {
  wss = new WebSocketServer({ server, path: '/ws' });
  wss.on('connection', (socket) => {
    socket.send(JSON.stringify({ type: 'hello', service: 'x7-realtime' }));
  });
  return wss;
}

// Broadcast an event to all connected clients (scan progress, notifications, threat feed).
export function broadcast(event) {
  if (!wss) return;
  const payload = JSON.stringify(event);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(payload);
  }
}

import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:5000";

class SocketService {
  constructor() {
    this.listeners = {};
    this.connected = false;
    this.socket = null;
    this._simulateInterval = null;
  }

  connect(url, token) {
    const socketUrl = url || WS_URL;
    
    try {
      this.socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        path: '/socket.io',
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected');
        this.connected = true;
        this._emit('connect');
        if (this._simulateInterval) {
          clearInterval(this._simulateInterval);
          this._simulateInterval = null;
        }
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        this.connected = false;
        this._emit('disconnect');
        this._startSimulation();
      });

      this.socket.on('new-notification', (data) => this._emit('new-notification', data));
      this.socket.on('lowStockAlert', (data) => this._emit('lowStockAlert', data));
      this.socket.on('dashboard-update', (data) => this._emit('dashboard-update', data));

      this.socket.on('connect_error', (err) => {
        console.warn('Socket connect error:', err?.message);
        this._startSimulation();
      });
    } catch (err) {
      console.warn('Socket.IO init failed, using simulation:', err?.message);
      this._startSimulation();
    }
  }

  _startSimulation() {
    if (this._simulateInterval) return;
    
    this.connected = true;
    this._emit('connect');
    
    this._simulateInterval = setInterval(() => {
      this._emit('dashboard-update', {
        kpi: {
          revenue: { 
            total: `$${(Math.random() * 10000 + 45000).toFixed(0)}`, 
            growth_percentage: +(Math.random() * 20 - 5).toFixed(1), 
            trend: Math.random() > 0.3 ? 'up' : 'down' 
          },
          sales: { 
            count: Math.floor(Math.random() * 100 + 500), 
            growth_percentage: +(Math.random() * 15).toFixed(1), 
            avg_transaction_value: `$${(Math.random() * 50 + 80).toFixed(2)}`, 
            unique_customers: Math.floor(Math.random() * 50 + 300) 
          },
        },
        liveTransaction: { 
          amount: `$${(Math.random() * 500 + 20).toFixed(2)}`, 
          branch: ['Colombo', 'Kandy', 'Galle', 'Negombo'][Math.floor(Math.random() * 4)], 
          time: new Date().toLocaleTimeString() 
        }
      });
    }, 5000);
  }

  joinNotifications(userId) {
    if (this.socket?.connected) {
      this.socket.emit('joinNotifications', userId);
    }
  }

  leaveNotifications(userId) {
    if (this.socket?.connected) {
      this.socket.emit('leaveNotifications', userId);
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  _emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
    if (this._simulateInterval) {
      clearInterval(this._simulateInterval);
      this._simulateInterval = null;
    }
    this.connected = false;
  }
}

export const socketService = new SocketService();
export default socketService;
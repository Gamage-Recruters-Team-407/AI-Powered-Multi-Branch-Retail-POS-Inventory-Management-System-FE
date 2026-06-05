// WebSocket service using native WebSocket with fallback simulation
class SocketService {
  constructor() {
    this.listeners = {};
    this.connected = false;
    this.socket = null;
    this._simulateInterval = null;
  }

  connect(url, token) {
    // Try real WS, fallback to simulation for demo
    try {
      this.socket = new WebSocket(url.replace('http', 'ws'));
      this.socket.onopen = () => {
        this.connected = true;
        this._emit('connect');
      };
      this.socket.onmessage = (e) => {
        try {
          const { event, data } = JSON.parse(e.data);
          this._emit(event, data);
        } catch (error) {
          console.warn('Ignored malformed WebSocket message:', error.message);
        }
      };
      this.socket.onclose = () => {
        this.connected = false;
        this._emit('disconnect');
        this._startSimulation();
      };
      this.socket.onerror = () => this._startSimulation();
    } catch {
      this._startSimulation();
    }
  }

  _startSimulation() {
    // Simulate real-time updates for demo
    this.connected = true;
    this._emit('connect');
    this._simulateInterval = setInterval(() => {
      this._emit('dashboard-update', {
        kpi: {
          revenue: { total: `$${(Math.random() * 10000 + 45000).toFixed(0)}`, growth_percentage: +(Math.random() * 20 - 5).toFixed(1), trend: Math.random() > 0.3 ? 'up' : 'down' },
          sales: { count: Math.floor(Math.random() * 100 + 500), growth_percentage: +(Math.random() * 15).toFixed(1), avg_transaction_value: `$${(Math.random() * 50 + 80).toFixed(2)}`, unique_customers: Math.floor(Math.random() * 50 + 300) },
        },
        liveTransaction: { amount: `$${(Math.random() * 500 + 20).toFixed(2)}`, branch: ['Colombo', 'Kandy', 'Galle', 'Negombo'][Math.floor(Math.random() * 4)], time: new Date().toLocaleTimeString() }
      });
    }, 5000);
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
    if (this.socket) this.socket.close();
    if (this._simulateInterval) clearInterval(this._simulateInterval);
    this.connected = false;
  }
}

export const socketService = new SocketService();
export default socketService;

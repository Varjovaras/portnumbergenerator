/**
 * WebSocket Service Implementation for Port Number Generator
 *
 * Provides real-time bidirectional communication for port number operations.
 * In production, use 'ws' or 'socket.io' libraries.
 */

export interface WebSocketMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

export interface WebSocketClient {
  id: string;
  socket: any;
  subscriptions: Set<string>;
  metadata?: Record<string, any>;
}

export enum MessageType {
  GENERATE_PORT = 'generate_port',
  GENERATE_PORTS = 'generate_ports',
  RESERVE_PORT = 'reserve_port',
  RELEASE_PORT = 'release_port',
  CHECK_AVAILABILITY = 'check_availability',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  PORT_GENERATED = 'port_generated',
  PORT_RESERVED = 'port_reserved',
  PORT_RELEASED = 'port_released',
  ERROR = 'error',
  PING = 'ping',
  PONG = 'pong'
}

export interface GeneratePortMessage {
  strategy?: string;
  min?: number;
  max?: number;
  seed?: string;
}

export interface GeneratePortsMessage {
  count: number;
  strategy?: string;
  min?: number;
  max?: number;
}

export interface ReservePortMessage {
  port?: number;
  min?: number;
  max?: number;
  metadata?: Record<string, any>;
}

export interface ReleasePortMessage {
  port: number;
}

export interface CheckAvailabilityMessage {
  port: number;
}

export interface SubscribeMessage {
  channel: string;
}

export interface PortGeneratedEvent {
  port: number;
  strategy: string;
  timestamp: number;
}

export interface PortReservedEvent {
  port: number;
  clientId: string;
  timestamp: number;
  expiresAt?: number;
}

export interface PortReleasedEvent {
  port: number;
  clientId: string;
  timestamp: number;
}

/**
 * WebSocket Server for Port Number Generator
 */
export class PortNumberWebSocketServer {
  private clients: Map<string, WebSocketClient> = new Map();
  private reservedPorts: Map<number, string> = new Map(); // port -> clientId
  private channels: Map<string, Set<string>> = new Map(); // channel -> clientIds
  private port: number;
  private server: any = null;
  private running: boolean = false;

  constructor(port: number = 8080) {
    this.port = port;
    this.setupChannels();
  }

  private setupChannels(): void {
    this.channels.set('port_events', new Set());
    this.channels.set('reservations', new Set());
    this.channels.set('system', new Set());
  }

  async start(): Promise<void> {
    if (this.running) {
      throw new Error('WebSocket server is already running');
    }

    console.log(`WebSocket server starting on port ${this.port}...`);

    // In production, use 'ws' library:
    // const WebSocket = require('ws');
    // this.server = new WebSocket.Server({ port: this.port });
    // this.server.on('connection', (socket) => this.handleConnection(socket));

    this.running = true;
    console.log(`WebSocket server listening on ws://0.0.0.0:${this.port}`);
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    console.log('Stopping WebSocket server...');

    // Close all client connections
    for (const [clientId, client] of this.clients.entries()) {
      this.disconnectClient(clientId);
    }

    // Close server
    if (this.server) {
      // this.server.close();
      this.server = null;
    }

    this.running = false;
    console.log('WebSocket server stopped');
  }

  private handleConnection(socket: any): void {
    const clientId = this.generateClientId();

    const client: WebSocketClient = {
      id: clientId,
      socket,
      subscriptions: new Set()
    };

    this.clients.set(clientId, client);

    console.log(`Client ${clientId} connected. Total clients: ${this.clients.size}`);

    // Send welcome message
    this.sendToClient(clientId, {
      id: this.generateMessageId(),
      type: 'connected',
      payload: {
        clientId,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });

    // Setup message handler
    socket.on('message', (data: string) => {
      this.handleMessage(clientId, data);
    });

    // Setup close handler
    socket.on('close', () => {
      this.handleDisconnection(clientId);
    });

    // Setup error handler
    socket.on('error', (error: Error) => {
      console.error(`Client ${clientId} error:`, error);
    });
  }

  private handleMessage(clientId: string, data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);

      switch (message.type) {
        case MessageType.GENERATE_PORT:
          this.handleGeneratePort(clientId, message);
          break;
        case MessageType.GENERATE_PORTS:
          this.handleGeneratePorts(clientId, message);
          break;
        case MessageType.RESERVE_PORT:
          this.handleReservePort(clientId, message);
          break;
        case MessageType.RELEASE_PORT:
          this.handleReleasePort(clientId, message);
          break;
        case MessageType.CHECK_AVAILABILITY:
          this.handleCheckAvailability(clientId, message);
          break;
        case MessageType.SUBSCRIBE:
          this.handleSubscribe(clientId, message);
          break;
        case MessageType.UNSUBSCRIBE:
          this.handleUnsubscribe(clientId, message);
          break;
        case MessageType.PING:
          this.handlePing(clientId, message);
          break;
        default:
          this.sendError(clientId, message.id, `Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error(`Error handling message from ${clientId}:`, error);
      this.sendError(clientId, 'unknown', 'Invalid message format');
    }
  }

  private handleGeneratePort(clientId: string, message: WebSocketMessage): void {
    const payload: GeneratePortMessage = message.payload;
    const strategy = payload.strategy || 'random';
    const min = payload.min || 1024;
    const max = payload.max || 65535;

    const port = this.generatePort(strategy, min, max);

    this.sendToClient(clientId, {
      id: this.generateMessageId(),
      type: MessageType.PORT_GENERATED,
      payload: {
        requestId: message.id,
        port,
        strategy,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });

    // Broadcast to subscribers
    this.broadcast('port_events', {
      id: this.generateMessageId(),
      type: MessageType.PORT_GENERATED,
      payload: { port, strategy, clientId },
      timestamp: Date.now()
    }, clientId);
  }

  private handleGeneratePorts(clientId: string, message: WebSocketMessage): void {
    const payload: GeneratePortsMessage = message.payload;
    const count = Math.min(payload.count, 1000);
    const strategy = payload.strategy || 'random';
    const min = payload.min || 1024;
    const max = payload.max || 65535;

    const ports: number[] = [];
    for (let i = 0; i < count; i++) {
      ports.push(this.generatePort(strategy, min, max));
    }

    this.sendToClient(clientId, {
      id: this.generateMessageId(),
      type: 'ports_generated',
      payload: {
        requestId: message.id,
        ports,
        count: ports.length,
        strategy,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }

  private handleReservePort(clientId: string, message: WebSocketMessage): void {
    const payload: ReservePortMessage = message.payload;

    let port: number | null = null;
    let success = false;

    if (payload.port !== undefined) {
      // Reserve specific port
      if (!this.reservedPorts.has(payload.port)) {
        port = payload.port;
        this.reservedPorts.set(port, clientId);
        success = true;
      }
    } else {
      // Find and reserve available port
      const min = payload.min || 1024;
      const max = payload.max || 65535;

      for (let p = min; p <= max; p++) {
        if (!this.reservedPorts.has(p)) {
          port = p;
          this.reservedPorts.set(port, clientId);
          success = true;
          break;
        }
      }
    }

    if (success && port) {
      this.sendToClient(clientId, {
        id: this.generateMessageId(),
        type: MessageType.PORT_RESERVED,
        payload: {
          requestId: message.id,
          success: true,
          port,
          expiresAt: Date.now() + 3600000,
          timestamp: Date.now()
        },
        timestamp: Date.now()
      });

      // Broadcast to subscribers
      this.broadcast('reservations', {
        id: this.generateMessageId(),
        type: MessageType.PORT_RESERVED,
        payload: { port, clientId },
        timestamp: Date.now()
      }, clientId);
    } else {
      this.sendError(clientId, message.id, 'Port reservation failed');
    }
  }

  private handleReleasePort(clientId: string, message: WebSocketMessage): void {
    const payload: ReleasePortMessage = message.payload;
    const port = payload.port;

    const reservedBy = this.reservedPorts.get(port);

    if (reservedBy === clientId) {
      this.reservedPorts.delete(port);

      this.sendToClient(clientId, {
        id: this.generateMessageId(),
        type: MessageType.PORT_RELEASED,
        payload: {
          requestId: message.id,
          success: true,
          port,
          timestamp: Date.now()
        },
        timestamp: Date.now()
      });

      // Broadcast to subscribers
      this.broadcast('reservations', {
        id: this.generateMessageId(),
        type: MessageType.PORT_RELEASED,
        payload: { port, clientId },
        timestamp: Date.now()
      }, clientId);
    } else {
      this.sendError(
        clientId,
        message.id,
        reservedBy ? 'Port is reserved by another client' : 'Port is not reserved'
      );
    }
  }

  private handleCheckAvailability(clientId: string, message: WebSocketMessage): void {
    const payload: CheckAvailabilityMessage = message.payload;
    const port = payload.port;
    const available = !this.reservedPorts.has(port);

    this.sendToClient(clientId, {
      id: this.generateMessageId(),
      type: 'availability_checked',
      payload: {
        requestId: message.id,
        port,
        available,
        reservedBy: available ? undefined : this.reservedPorts.get(port),
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }

  private handleSubscribe(clientId: string, message: WebSocketMessage): void {
    const payload: SubscribeMessage = message.payload;
    const channel = payload.channel;

    const client = this.clients.get(clientId);
    if (!client) return;

    // Add client to channel
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(clientId);
    client.subscriptions.add(channel);

    this.sendToClient(clientId, {
      id: this.generateMessageId(),
      type: 'subscribed',
      payload: {
        requestId: message.id,
        channel,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }

  private handleUnsubscribe(clientId: string, message: WebSocketMessage): void {
    const payload: SubscribeMessage = message.payload;
    const channel = payload.channel;

    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove client from channel
    this.channels.get(channel)?.delete(clientId);
    client.subscriptions.delete(channel);

    this.sendToClient(clientId, {
      id: this.generateMessageId(),
      type: 'unsubscribed',
      payload: {
        requestId: message.id,
        channel,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }

  private handlePing(clientId: string, message: WebSocketMessage): void {
    this.sendToClient(clientId, {
      id: this.generateMessageId(),
      type: MessageType.PONG,
      payload: {
        requestId: message.id,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }

  private handleDisconnection(clientId: string): void {
    console.log(`Client ${clientId} disconnected`);

    // Release all ports reserved by this client
    const portsToRelease: number[] = [];
    for (const [port, reservedBy] of this.reservedPorts.entries()) {
      if (reservedBy === clientId) {
        portsToRelease.push(port);
      }
    }

    for (const port of portsToRelease) {
      this.reservedPorts.delete(port);
    }

    // Remove from all channels
    const client = this.clients.get(clientId);
    if (client) {
      for (const channel of client.subscriptions) {
        this.channels.get(channel)?.delete(clientId);
      }
    }

    // Remove client
    this.clients.delete(clientId);

    console.log(`Client ${clientId} cleaned up. Total clients: ${this.clients.size}`);
  }

  private disconnectClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client && client.socket) {
      client.socket.close();
    }
  }

  private sendToClient(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      const data = JSON.stringify(message);
      // In production: client.socket.send(data);
      console.log(`[WS] -> ${clientId}: ${message.type}`);
    } catch (error) {
      console.error(`Error sending message to ${clientId}:`, error);
    }
  }

  private broadcast(channel: string, message: WebSocketMessage, excludeClientId?: string): void {
    const subscribers = this.channels.get(channel);
    if (!subscribers) return;

    for (const clientId of subscribers) {
      if (excludeClientId && clientId === excludeClientId) {
        continue;
      }
      this.sendToClient(clientId, message);
    }
  }

  private sendError(clientId: string, requestId: string, error: string): void {
    this.sendToClient(clientId, {
      id: this.generateMessageId(),
      type: MessageType.ERROR,
      payload: {
        requestId,
        error,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }

  private generatePort(strategy: string, min: number, max: number): number {
    switch (strategy) {
      case 'random':
        return Math.floor(Math.random() * (max - min + 1)) + min;
      case 'sequential':
        return min + (Date.now() % (max - min + 1));
      case 'fibonacci':
        return this.generateFibonacciPort(min, max);
      case 'prime':
        return this.generatePrimePort(min, max);
      default:
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }

  private generateFibonacciPort(min: number, max: number): number {
    let a = 0, b = 1;
    while (b < min) {
      [a, b] = [b, a + b];
    }
    while (b <= max) {
      if (b >= min) return b;
      [a, b] = [b, a + b];
    }
    return min;
  }

  private generatePrimePort(min: number, max: number): number {
    const isPrime = (n: number): boolean => {
      if (n < 2) return false;
      for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
      }
      return true;
    };

    for (let port = min; port <= max; port++) {
      if (isPrime(port)) return port;
    }
    return min;
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  getStats(): {
    totalClients: number;
    reservedPorts: number;
    channels: { [key: string]: number };
  } {
    const channelStats: { [key: string]: number } = {};
    for (const [channel, subscribers] of this.channels.entries()) {
      channelStats[channel] = subscribers.size;
    }

    return {
      totalClients: this.clients.size,
      reservedPorts: this.reservedPorts.size,
      channels: channelStats
    };
  }

  isRunning(): boolean {
    return this.running;
  }
}

/**
 * WebSocket Client for Port Number Generator
 */
export class PortNumberWebSocketClient {
  private socket: any = null;
  private connected: boolean = false;
  private clientId?: string;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private serverUrl: string;

  constructor(serverUrl: string = 'ws://localhost:8080') {
    this.serverUrl = serverUrl;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`Connecting to WebSocket server at ${this.serverUrl}...`);

      // In production, use WebSocket:
      // this.socket = new WebSocket(this.serverUrl);
      // this.socket.on('open', () => { ... });
      // this.socket.on('message', (data) => { ... });

      this.connected = true;
      console.log('Connected to WebSocket server');
      resolve();
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connected = false;
    console.log('Disconnected from WebSocket server');
  }

  async generatePort(options: GeneratePortMessage = {}): Promise<number> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: MessageType.GENERATE_PORT,
      payload: options,
      timestamp: Date.now()
    };

    return this.sendAndWait(message, MessageType.PORT_GENERATED);
  }

  async generatePorts(options: GeneratePortsMessage): Promise<number[]> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: MessageType.GENERATE_PORTS,
      payload: options,
      timestamp: Date.now()
    };

    return this.sendAndWait(message, 'ports_generated');
  }

  async reservePort(options: ReservePortMessage = {}): Promise<number> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: MessageType.RESERVE_PORT,
      payload: options,
      timestamp: Date.now()
    };

    return this.sendAndWait(message, MessageType.PORT_RESERVED);
  }

  async releasePort(port: number): Promise<boolean> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: MessageType.RELEASE_PORT,
      payload: { port },
      timestamp: Date.now()
    };

    return this.sendAndWait(message, MessageType.PORT_RELEASED);
  }

  async checkAvailability(port: number): Promise<boolean> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: MessageType.CHECK_AVAILABILITY,
      payload: { port },
      timestamp: Date.now()
    };

    return this.sendAndWait(message, 'availability_checked');
  }

  subscribe(channel: string, handler: (data: any) => void): void {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: MessageType.SUBSCRIBE,
      payload: { channel },
      timestamp: Date.now()
    };

    this.messageHandlers.set(channel, handler);
    this.send(message);
  }

  unsubscribe(channel: string): void {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: MessageType.UNSUBSCRIBE,
      payload: { channel },
      timestamp: Date.now()
    };

    this.messageHandlers.delete(channel);
    this.send(message);
  }

  private send(message: WebSocketMessage): void {
    if (!this.connected || !this.socket) {
      throw new Error('Not connected to WebSocket server');
    }

    const data = JSON.stringify(message);
    // In production: this.socket.send(data);
    console.log(`[WS Client] -> ${message.type}`);
  }

  private async sendAndWait(message: WebSocketMessage, expectedType: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Setup one-time handler
      const handler = (response: WebSocketMessage) => {
        if (response.payload?.requestId === message.id) {
          resolve(response.payload);
        }
      };

      this.messageHandlers.set(message.id, handler);

      // Send message
      this.send(message);

      // Timeout after 30 seconds
      setTimeout(() => {
        this.messageHandlers.delete(message.id);
        reject(new Error('Request timeout'));
      }, 30000);
    });
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getClientId(): string | undefined {
    return this.clientId;
  }
}

// Export singleton instances
export const wsServer = new PortNumberWebSocketServer();
export const wsClient = new PortNumberWebSocketClient();

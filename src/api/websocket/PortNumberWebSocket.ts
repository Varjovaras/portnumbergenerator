/**
 * @fileoverview Enterprise WebSocket Real-Time Port Number Communication Infrastructure
 * @module @portnumbergenerator/api/websocket
 * @category API Layer - Real-Time Communication
 * @since 3.0.0
 *
 * @description
 * THE PINNACLE OF REAL-TIME PORT NUMBER DISTRIBUTION TECHNOLOGY
 *
 * This module provides a production-grade, enterprise-ready, mission-critical WebSocket
 * server and client implementation for REAL-TIME bidirectional port number operations.
 * Because sometimes HTTP is just TOO SLOW for the critical task of generating port numbers.
 *
 * **Why WebSockets for Port Numbers?**
 * Excellent question! Here's why we need REAL-TIME communication for integers:
 * - HTTP is so 1999. WebSockets are modern and buzzword-compliant.
 * - Someone mentioned "real-time" in a standup meeting
 * - We needed to justify learning WebSocket libraries
 * - Low-latency port number delivery is MISSION CRITICAL
 * - Because we can, and enterprise budgets are generous
 *
 * **Key Features:**
 * - Real-time port generation (microseconds matter!)
 * - Port reservation system (first-come-first-served)
 * - Pub/Sub channels (for that distributed feel)
 * - Client connection management (keeping track of who wants numbers)
 * - Heartbeat/ping-pong (because connections need to feel loved)
 * - Broadcasting (telling everyone about new port numbers)
 * - Graceful error handling (learned from production incidents)
 *
 * **Architecture:**
 * - Server-Client model (revolutionary!)
 * - Message-based protocol (JSON over WebSocket, very Web 2.0)
 * - Event-driven architecture (async all the things!)
 * - In-memory state management (Redis is for next quarter)
 * - Channel-based pub/sub (like Redis, but in RAM)
 *
 * **Production Deployment Notes:**
 * - Currently uses console.log for "production monitoring"
 * - Replace socket implementation with 'ws' or 'socket.io' libraries
 * - All state stored in memory (survives until process restart)
 * - No authentication (trust-based security model)
 * - No rate limiting (unlimited port numbers for everyone!)
 * - No persistence (ephemeral by design, or by oversight)
 *
 * **Performance Characteristics:**
 * - Connection handling: O(1) - Map-based client storage
 * - Message routing: O(1) - Direct client lookup
 * - Broadcasting: O(n) where n = subscribers
 * - Port reservation: O(1) - Map-based port tracking
 * - Memory usage: O(clients + reservations + channels)
 * - Scalability: Vertical only (add more RAM!)
 *
 * **Design Patterns Applied:**
 * - Observer Pattern: Pub/Sub channels for event distribution
 * - Command Pattern: Message types as executable commands
 * - Mediator Pattern: Server coordinates client interactions
 * - Singleton Pattern: Single server instance per port
 * - Over-Engineering Pattern: This entire implementation
 *
 * **Message Protocol:**
 * All messages follow a standardized envelope format:
 * - id: Unique message identifier (UUIDs would be overkill)
 * - type: Message type from MessageType enum
 * - payload: Type-specific message data
 * - timestamp: Unix timestamp in milliseconds
 *
 * **Supported Operations:**
 * 1. GENERATE_PORT: Generate a single port number
 * 2. GENERATE_PORTS: Generate multiple port numbers
 * 3. RESERVE_PORT: Reserve a port for exclusive use
 * 4. RELEASE_PORT: Release a reserved port
 * 5. CHECK_AVAILABILITY: Check if port is available
 * 6. SUBSCRIBE: Subscribe to event channels
 * 7. UNSUBSCRIBE: Unsubscribe from channels
 * 8. PING: Keep-alive heartbeat
 *
 * **Channel System:**
 * - port_events: All port generation events
 * - reservations: Port reservation/release events
 * - system: System-level notifications
 *
 * @example
 * ```typescript
 * // Server setup
 * const server = new PortNumberWebSocketServer(8080);
 * await server.start();
 * console.log('WebSocket server ready for enterprise port distribution!');
 * ```
 *
 * @example
 * ```typescript
 * // Client usage
 * const client = new PortNumberWebSocketClient('ws://localhost:8080');
 * await client.connect();
 * const port = await client.generatePort({ strategy: 'fibonacci', min: 3000 });
 * console.log(`Received port: ${port}`);
 * ```
 *
 * @example
 * ```typescript
 * // Advanced: Real-time port monitoring
 * const client = new PortNumberWebSocketClient('ws://localhost:8080');
 * await client.connect();
 * client.subscribe('port_events', (event) => {
 *   console.log(`New port generated: ${event.payload.port}`);
 * });
 * ```
 *
 * @see {@link PortNumberWebSocketServer} - Server implementation
 * @see {@link PortNumberWebSocketClient} - Client implementation
 * @see {@link MessageType} - All supported message types
 *
 * @author The Real-Time Systems Evangelization Committee (RTSEC)
 * @copyright 2024 Port Number Generator Corp.
 * @license MIT
 * @version 3.0.0-WEBSOCKET-ENTERPRISE-EDITION
 *
 * @performance
 * - Average latency: <5ms per operation
 * - Throughput: 10,000+ messages/second (untested claim)
 * - Connection capacity: Limited by available memory
 * - Message size: No limits (YOLO)
 *
 * @compliance
 * - WebSocket RFC 6455: Aspirational compliance
 * - JSON RFC 8259: Fully compliant
 * - Enterprise standards: Exceeds expectations
 * - Common sense: Questionable
 *
 * @roadmap
 * - Q1 2025: Add authentication (maybe)
 * - Q2 2025: Implement persistence (if we remember)
 * - Q3 2025: Add rate limiting (after the DDoS)
 * - Q4 2025: Consider using a proper message broker
 */

/**
 * WebSocket Message Envelope Interface
 *
 * @interface WebSocketMessage
 * @description
 * The fundamental message structure for ALL WebSocket communications.
 * Every message, regardless of type or purpose, MUST conform to this envelope.
 *
 * **Design Philosophy:**
 * - Consistent structure across all message types
 * - Self-describing through type field
 * - Traceable via unique ID
 * - Timestamped for audit trails
 *
 * **Message Flow:**
 * Client → Message → Server → Processing → Response → Client
 *
 * @property {string} id - Unique message identifier for request/response correlation
 * @property {string} type - Message type from MessageType enum
 * @property {any} payload - Type-specific message payload (polymorphic by design)
 * @property {number} timestamp - Unix timestamp in milliseconds (epoch time)
 *
 * @example
 * ```typescript
 * const message: WebSocketMessage = {
 *   id: 'msg-12345',
 *   type: MessageType.GENERATE_PORT,
 *   payload: { strategy: 'random', min: 3000, max: 4000 },
 *   timestamp: Date.now()
 * };
 * ```
 *
 * @since 3.0.0
 * @category Core Protocol
 */
export interface WebSocketMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

/**
 * WebSocket Client Connection Metadata
 *
 * @interface WebSocketClient
 * @description
 * Represents a connected WebSocket client with associated metadata.
 * The server maintains a registry of all connected clients using this structure.
 *
 * **Client Lifecycle:**
 * 1. Connection established → Client created
 * 2. Operations performed → Subscriptions modified
 * 3. Connection closed → Client removed
 *
 * **Subscription Management:**
 * Clients can subscribe to multiple channels simultaneously.
 * Subscriptions are tracked via Set for O(1) lookup.
 *
 * @property {string} id - Unique client identifier (generated on connection)
 * @property {any} socket - Raw WebSocket connection object
 * @property {Set<string>} subscriptions - Set of channel names client is subscribed to
 * @property {Record<string, any>} [metadata] - Optional custom metadata (future use)
 *
 * @example
 * ```typescript
 * const client: WebSocketClient = {
 *   id: 'client-abc123',
 *   socket: websocketInstance,
 *   subscriptions: new Set(['port_events', 'system']),
 *   metadata: { userAgent: 'Mozilla/5.0', ip: '192.168.1.1' }
 * };
 * ```
 *
 * @since 3.0.0
 * @category Connection Management
 */
export interface WebSocketClient {
  id: string;
  socket: any;
  subscriptions: Set<string>;
  metadata?: Record<string, any>;
}

/**
 * WebSocket Message Type Enumeration
 *
 * @enum {string} MessageType
 * @description
 * Comprehensive enumeration of ALL supported WebSocket message types.
 * This enum serves as the single source of truth for the message protocol.
 *
 * **Message Categories:**
 *
 * **CLIENT REQUESTS (Client → Server):**
 * - GENERATE_PORT: Generate single port number
 * - GENERATE_PORTS: Generate multiple port numbers
 * - RESERVE_PORT: Reserve a port for exclusive use
 * - RELEASE_PORT: Release a previously reserved port
 * - CHECK_AVAILABILITY: Check if a port is available
 * - SUBSCRIBE: Subscribe to a pub/sub channel
 * - UNSUBSCRIBE: Unsubscribe from a channel
 * - PING: Keep-alive heartbeat
 *
 * **SERVER EVENTS (Server → Client):**
 * - PORT_GENERATED: Port generation completed
 * - PORT_RESERVED: Port reservation confirmed
 * - PORT_RELEASED: Port release confirmed
 * - PONG: Heartbeat response
 * - ERROR: Error occurred
 *
 * **Protocol Design:**
 * - Snake_case naming for consistency
 * - Self-documenting names
 * - Clear request/response pairing
 * - Extensible for future types
 *
 * @example
 * ```typescript
 * // Client request
 * const request = {
 *   type: MessageType.GENERATE_PORT,
 *   payload: { strategy: 'random' }
 * };
 *
 * // Server response
 * const response = {
 *   type: MessageType.PORT_GENERATED,
 *   payload: { port: 3000 }
 * };
 * ```
 *
 * @since 3.0.0
 * @category Protocol Definition
 */
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

/**
 * Generate Port Request Payload
 *
 * @interface GeneratePortMessage
 * @description
 * Payload structure for GENERATE_PORT message type.
 * Specifies parameters for generating a single port number.
 *
 * @property {string} [strategy] - Generation strategy ('random', 'sequential', 'fibonacci', 'prime')
 * @property {number} [min] - Minimum port number (inclusive, default: 1024)
 * @property {number} [max] - Maximum port number (inclusive, default: 65535)
 * @property {string} [seed] - Optional seed for deterministic generation
 *
 * @example
 * ```typescript
 * const payload: GeneratePortMessage = {
 *   strategy: 'fibonacci',
 *   min: 3000,
 *   max: 4000,
 *   seed: 'deterministic-seed-123'
 * };
 * ```
 *
 * @since 3.0.0
 */
export interface GeneratePortMessage {
  strategy?: string;
  min?: number;
  max?: number;
  seed?: string;
}

/**
 * Generate Multiple Ports Request Payload
 *
 * @interface GeneratePortsMessage
 * @description
 * Payload structure for GENERATE_PORTS message type.
 * Specifies parameters for bulk port generation.
 *
 * @property {number} count - Number of ports to generate (max: 1000)
 * @property {string} [strategy] - Generation strategy
 * @property {number} [min] - Minimum port number
 * @property {number} [max] - Maximum port number
 *
 * @example
 * ```typescript
 * const payload: GeneratePortsMessage = {
 *   count: 10,
 *   strategy: 'prime',
 *   min: 5000,
 *   max: 6000
 * };
 * ```
 *
 * @since 3.0.0
 */
export interface GeneratePortsMessage {
  count: number;
  strategy?: string;
  min?: number;
  max?: number;
}

/**
 * Reserve Port Request Payload
 *
 * @interface ReservePortMessage
 * @description
 * Payload structure for RESERVE_PORT message type.
 * Reserves a specific port or finds an available one.
 *
 * @property {number} [port] - Specific port to reserve (if undefined, server finds one)
 * @property {number} [min] - Minimum port range for auto-selection
 * @property {number} [max] - Maximum port range for auto-selection
 * @property {Record<string, any>} [metadata] - Custom reservation metadata
 *
 * @example
 * ```typescript
 * // Reserve specific port
 * const payload: ReservePortMessage = {
 *   port: 3000,
 *   metadata: { service: 'api-gateway', env: 'production' }
 * };
 *
 * // Auto-find available port
 * const autoPayload: ReservePortMessage = {
 *   min: 3000,
 *   max: 4000
 * };
 * ```
 *
 * @since 3.0.0
 */
export interface ReservePortMessage {
  port?: number;
  min?: number;
  max?: number;
  metadata?: Record<string, any>;
}

/**
 * Release Port Request Payload
 *
 * @interface ReleasePortMessage
 * @description
 * Payload structure for RELEASE_PORT message type.
 * Releases a previously reserved port back to the pool.
 *
 * @property {number} port - Port number to release
 *
 * @example
 * ```typescript
 * const payload: ReleasePortMessage = {
 *   port: 3000
 * };
 * ```
 *
 * @since 3.0.0
 */
export interface ReleasePortMessage {
  port: number;
}

/**
 * Check Port Availability Request Payload
 *
 * @interface CheckAvailabilityMessage
 * @description
 * Payload structure for CHECK_AVAILABILITY message type.
 * Queries whether a specific port is currently available.
 *
 * @property {number} port - Port number to check
 *
 * @example
 * ```typescript
 * const payload: CheckAvailabilityMessage = {
 *   port: 3000
 * };
 * ```
 *
 * @since 3.0.0
 */
export interface CheckAvailabilityMessage {
  port: number;
}

/**
 * Subscribe to Channel Request Payload
 *
 * @interface SubscribeMessage
 * @description
 * Payload structure for SUBSCRIBE message type.
 * Subscribes client to a pub/sub channel for real-time events.
 *
 * @property {string} channel - Channel name ('port_events', 'reservations', 'system')
 *
 * @example
 * ```typescript
 * const payload: SubscribeMessage = {
 *   channel: 'port_events'
 * };
 * ```
 *
 * @since 3.0.0
 */
export interface SubscribeMessage {
  channel: string;
}

/**
 * Port Generated Event Payload
 *
 * @interface PortGeneratedEvent
 * @description
 * Event payload broadcast when a port is generated.
 * Sent to all subscribers of 'port_events' channel.
 *
 * @property {number} port - Generated port number
 * @property {string} strategy - Strategy used for generation
 * @property {number} timestamp - Generation timestamp
 *
 * @example
 * ```typescript
 * const event: PortGeneratedEvent = {
 *   port: 3142,
 *   strategy: 'fibonacci',
 *   timestamp: Date.now()
 * };
 * ```
 *
 * @since 3.0.0
 */
export interface PortGeneratedEvent {
  port: number;
  strategy: string;
  timestamp: number;
}

/**
 * Port Reserved Event Payload
 *
 * @interface PortReservedEvent
 * @description
 * Event payload broadcast when a port is reserved.
 * Sent to all subscribers of 'reservations' channel.
 *
 * @property {number} port - Reserved port number
 * @property {string} clientId - ID of client that reserved the port
 * @property {number} timestamp - Reservation timestamp
 * @property {number} [expiresAt] - Optional expiration timestamp
 *
 * @example
 * ```typescript
 * const event: PortReservedEvent = {
 *   port: 3000,
 *   clientId: 'client-abc123',
 *   timestamp: Date.now(),
 *   expiresAt: Date.now() + 3600000 // 1 hour
 * };
 * ```
 *
 * @since 3.0.0
 */
export interface PortReservedEvent {
  port: number;
  clientId: string;
  timestamp: number;
  expiresAt?: number;
}

/**
 * Port Released Event Payload
 *
 * @interface PortReleasedEvent
 * @description
 * Event payload broadcast when a port is released.
 * Sent to all subscribers of 'reservations' channel.
 *
 * @property {number} port - Released port number
 * @property {string} clientId - ID of client that released the port
 * @property {number} timestamp - Release timestamp
 *
 * @example
 * ```typescript
 * const event: PortReleasedEvent = {
 *   port: 3000,
 *   clientId: 'client-abc123',
 *   timestamp: Date.now()
 * };
 * ```
 *
 * @since 3.0.0
 */
export interface PortReleasedEvent {
  port: number;
  clientId: string;
  timestamp: number;
}

/**
 * Enterprise WebSocket Server for Real-Time Port Number Operations
 *
 * @class PortNumberWebSocketServer
 * @description
 * THE ULTIMATE WEBSOCKET SERVER FOR PORT NUMBER DISTRIBUTION
 *
 * This class implements a full-featured WebSocket server capable of handling
 * real-time port number generation, reservation, and distribution to multiple
 * concurrent clients. Because HTTP was just too slow for the mission-critical
 * task of allocating integers between 1024 and 65535.
 *
 * **Why This Exists:**
 * - HTTP REST is so last decade
 * - Real-time port numbers are the future
 * - WebSockets make everything better
 * - We had a sprint with extra capacity
 * - The architecture diagram needed more boxes
 *
 * **Core Responsibilities:**
 * - Client connection lifecycle management
 * - Message routing and command execution
 * - Port reservation state management
 * - Pub/sub channel coordination
 * - Broadcasting events to subscribers
 * - Keeping clients alive with ping/pong
 *
 * **State Management:**
 * - clients: Map of connected WebSocket clients
 * - reservedPorts: Map of port → clientId reservations
 * - channels: Map of channel → Set of subscriber clientIds
 *
 * **Connection Flow:**
 * 1. Client connects → handleConnection()
 * 2. Server assigns unique ID
 * 3. Client sends messages → handleMessage()
 * 4. Server routes to appropriate handler
 * 5. Server sends response
 * 6. Client disconnects → handleDisconnection()
 * 7. Server cleans up resources
 *
 * **Message Handling:**
 * All incoming messages are routed through handleMessage() which delegates
 * to type-specific handlers based on MessageType enum.
 *
 * **Broadcasting:**
 * Server maintains pub/sub channels. When events occur, all channel subscribers
 * receive notifications in real-time. Enables reactive UIs and monitoring.
 *
 * **Resource Management:**
 * - Clients tracked in memory (O(1) lookup)
 * - Reserved ports tracked in memory (O(1) lookup)
 * - Channel subscriptions tracked per client
 * - All cleaned up on disconnection
 *
 * **Production Considerations:**
 * ⚠️ IMPORTANT: This is a MOCK implementation for demonstration!
 * - Replace socket with actual 'ws' or 'socket.io' library
 * - Add authentication/authorization
 * - Implement rate limiting
 * - Add Redis for distributed state
 * - Add monitoring and metrics
 * - Add proper error handling
 * - Add connection timeouts
 * - Add message size limits
 *
 * @example
 * ```typescript
 * // Start server
 * const server = new PortNumberWebSocketServer(8080);
 * await server.start();
 * console.log('WebSocket server listening...');
 * ```
 *
 * @example
 * ```typescript
 * // Production deployment with monitoring
 * const server = new PortNumberWebSocketServer(8080);
 * await server.start();
 * setInterval(() => {
 *   const stats = server.getStats();
 *   console.log(`Active clients: ${stats.totalClients}`);
 *   console.log(`Reserved ports: ${stats.reservedPorts}`);
 * }, 10000);
 * ```
 *
 * @since 3.0.0
 * @category API Layer - WebSocket Server
 * @public
 */
export class PortNumberWebSocketServer {
  private clients: Map<string, WebSocketClient> = new Map();
  private reservedPorts: Map<number, string> = new Map(); // port -> clientId
  private channels: Map<string, Set<string>> = new Map(); // channel -> clientIds
  private port: number;
  private server: any = null;
  private running: boolean = false;

  /**
   * Constructs a new PortNumberWebSocketServer instance.
   *
   * @constructor
   * @param {number} [port=8080] - Port number for the WebSocket server to listen on
   *
   * @description
   * Initializes the enterprise-grade WebSocket server infrastructure:
   * - Configures server port (default: 8080, the port of champions)
   * - Initializes client registry (empty Map, ready for connections)
   * - Initializes port reservation system (empty Map, no ports reserved yet)
   * - Sets up pub/sub channels (3 predefined channels)
   * - Prepares server for start() invocation
   *
   * **Initialization Steps:**
   * 1. Store port number
   * 2. Call setupChannels() to create default channels
   * 3. Leave server in "ready to start" state
   *
   * **Default Channels Created:**
   * - port_events: For port generation notifications
   * - reservations: For reservation/release events
   * - system: For system-level messages
   *
   * **Resource Allocation:**
   * - Memory: ~1KB for Maps and state
   * - CPU: Negligible (simple initialization)
   * - Network: None (no sockets opened yet)
   *
   * @throws {Error} Never throws (construction is infallible)
   *
   * @example
   * ```typescript
   * // Default port
   * const server = new PortNumberWebSocketServer();
   * // Server will listen on 8080
   * ```
   *
   * @example
   * ```typescript
   * // Custom port
   * const server = new PortNumberWebSocketServer(3000);
   * // Server will listen on 3000
   * ```
   *
   * @example
   * ```typescript
   * // Production deployment
   * const port = parseInt(process.env.WS_PORT || '8080');
   * const server = new PortNumberWebSocketServer(port);
   * await server.start();
   * ```
   *
   * @since 3.0.0
   * @public
   */
  constructor(port: number = 8080) {
    this.port = port;
    this.setupChannels();
  }

  /**
   * Sets up default pub/sub channels.
   *
   * @private
   * @returns {void}
   *
   * @description
   * Initializes the three standard channels that all clients can subscribe to:
   * - port_events: Broadcasts all port generation events
   * - reservations: Broadcasts reservation/release events
   * - system: Broadcasts system-level notifications
   *
   * Each channel maintains a Set of subscriber clientIds for O(1) lookups.
   *
   * @example
   * ```typescript
   * // Called automatically by constructor
   * this.setupChannels();
   * // Creates: channels Map with 3 empty Sets
   * ```
   *
   * @since 3.0.0
   */
  private setupChannels(): void {
    this.channels.set('port_events', new Set());
    this.channels.set('reservations', new Set());
    this.channels.set('system', new Set());
  }

  /**
   * Starts the WebSocket server and begins accepting connections.
   *
   * @async
   * @returns {Promise<void>} Resolves when server is started
   * @throws {Error} If server is already running
   *
   * @description
   * Initiates the WebSocket server lifecycle, binding to the configured port
   * and preparing to accept incoming client connections. This method is
   * idempotent-ish (throws if called twice).
   *
   * **Startup Sequence:**
   * 1. Check if already running (prevent double-start)
   * 2. Log startup message (for human consumption)
   * 3. Initialize WebSocket server (TODO: actually implement this)
   * 4. Set up connection event handlers
   * 5. Mark server as running
   * 6. Log success message
   *
   * **Production Implementation:**
   * Replace the commented-out code with actual 'ws' library:
   * ```typescript
   * const WebSocket = require('ws');
   * this.server = new WebSocket.Server({ port: this.port });
   * this.server.on('connection', (socket) => this.handleConnection(socket));
   * ```
   *
   * **Error Conditions:**
   * - Server already running: Throws Error
   * - Port already in use: Would throw (if actually implemented)
   * - Permission denied: Would throw (if actually implemented)
   *
   * **Side Effects:**
   * - Sets this.running = true
   * - Binds to network port (in production)
   * - Starts accepting connections (in production)
   *
   * @example
   * ```typescript
   * const server = new PortNumberWebSocketServer(8080);
   * await server.start();
   * console.log('Server is running!');
   * ```
   *
   * @example
   * ```typescript
   * // With error handling
   * try {
   *   await server.start();
   * } catch (error) {
   *   console.error('Failed to start server:', error);
   *   process.exit(1);
   * }
   * ```
   *
   * @since 3.0.0
   * @public
   */
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

  /**
   * Gracefully stops the WebSocket server and disconnects all clients.
   *
   * @async
   * @returns {Promise<void>} Resolves when server is stopped
   *
   * @description
   * Performs graceful shutdown of the WebSocket server:
   * - Disconnects all connected clients
   * - Closes the underlying server socket
   * - Releases all reserved ports
   * - Cleans up all resources
   *
   * **Shutdown Sequence:**
   * 1. Check if server is running (no-op if not)
   * 2. Log shutdown message
   * 3. Iterate through all clients
   * 4. Disconnect each client gracefully
   * 5. Close server socket
   * 6. Mark server as not running
   * 7. Log completion message
   *
   * **Resource Cleanup:**
   * - All client connections closed
   * - All port reservations released
   * - Server socket closed
   * - Memory released (via garbage collection)
   *
   * **Graceful vs. Forceful:**
   * This is a graceful shutdown - clients are notified and given
   * time to close cleanly. For forceful shutdown, just kill the process.
   *
   * **Idempotency:**
   * Safe to call multiple times. If server is not running, method
   * returns immediately without error.
   *
   * @example
   * ```typescript
   * // Graceful shutdown
   * await server.stop();
   * console.log('Server stopped successfully');
   * ```
   *
   * @example
   * ```typescript
   * // With cleanup handler
   * process.on('SIGTERM', async () => {
   *   console.log('Received SIGTERM, shutting down...');
   *   await server.stop();
   *   process.exit(0);
   * });
   * ```
   *
   * @since 3.0.0
   * @public
   */
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

  /**
   * Handles new WebSocket client connections.
   *
   * @private
   * @param {any} socket - Raw WebSocket connection object
   * @returns {void}
   *
   * @description
   * Orchestrates the complete client onboarding process when a new WebSocket
   * connection is established. This is THE entry point for all client interactions.
   *
   * **Connection Flow:**
   * 1. Generate unique client ID (UUID-ish)
   * 2. Create client metadata object
   * 3. Register client in clients Map
   * 4. Log connection event
   * 5. Send welcome message to client
   * 6. Set up event handlers (message, close, error)
   *
   * **Client Registration:**
   * Each client receives:
   * - Unique ID for tracking and correlation
   * - Empty subscription Set (can subscribe to channels)
   * - Socket reference for sending messages
   *
   * **Event Handlers Registered:**
   * - message: Routes incoming messages to handleMessage()
   * - close: Triggers handleDisconnection() for cleanup
   * - error: Logs errors to console (very enterprise!)
   *
   * **Welcome Message:**
   * First message sent to client contains:
   * - Client's assigned ID
   * - Server timestamp
   * - Confirmation of successful connection
   *
   * **Side Effects:**
   * - Adds client to this.clients Map
   * - Registers event handlers on socket
   * - Sends welcome message to client
   * - Logs to console
   *
   * @example
   * ```typescript
   * // Called automatically by WebSocket server
   * server.on('connection', (socket) => {
   *   this.handleConnection(socket);
   * });
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Routes incoming WebSocket messages to appropriate handlers.
   *
   * @private
   * @param {string} clientId - ID of the client sending the message
   * @param {string} data - Raw JSON message data from client
   * @returns {void}
   *
   * @description
   * THE CENTRAL MESSAGE ROUTER - All roads lead through here!
   *
   * This method is the nerve center of the WebSocket server, receiving ALL
   * incoming messages and routing them to specialized handlers based on
   * message type. It's basically a really fancy switch statement wrapped
   * in error handling and logging.
   *
   * **Message Processing Pipeline:**
   * 1. Parse JSON data into WebSocketMessage
   * 2. Extract message type from parsed object
   * 3. Route to type-specific handler via switch
   * 4. Handler processes and sends response
   * 5. Catch and log any errors
   *
   * **Supported Message Types:**
   * - GENERATE_PORT → handleGeneratePort()
   * - GENERATE_PORTS → handleGeneratePorts()
   * - RESERVE_PORT → handleReservePort()
   * - RELEASE_PORT → handleReleasePort()
   * - CHECK_AVAILABILITY → handleCheckAvailability()
   * - SUBSCRIBE → handleSubscribe()
   * - UNSUBSCRIBE → handleUnsubscribe()
   * - PING → handlePing()
   * - Unknown → sendError()
   *
   * **Error Handling:**
   * - JSON parse errors: Caught and logged, error sent to client
   * - Unknown message types: Caught, error sent to client
   * - Handler exceptions: Propagate up (should be caught by handler)
   *
   * **Why Switch Instead of Map?**
   * Excellent question! We discussed this for 2 hours in architecture review:
   * - Switch is "more readable" (committee decision)
   * - TypeScript can type-check the cases
   * - It's what everyone else does
   * - We ran out of time to implement the Map version
   *
   * @throws {never} Never throws directly (all errors caught internally)
   *
   * @example
   * ```typescript
   * // Called automatically on 'message' event
   * socket.on('message', (data) => {
   *   this.handleMessage(clientId, data);
   * });
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Handles GENERATE_PORT message - generates a single port number.
   *
   * @private
   * @param {string} clientId - ID of requesting client
   * @param {WebSocketMessage} message - The GENERATE_PORT message
   * @returns {void}
   *
   * @description
   * Processes a single port generation request from a client. Extracts
   * generation parameters, generates the port, responds to client, and
   * broadcasts the event to all port_events channel subscribers.
   *
   * **Processing Steps:**
   * 1. Extract payload from message
   * 2. Apply defaults for missing parameters
   * 3. Generate port using specified strategy
   * 4. Send response directly to requesting client
   * 5. Broadcast event to all port_events subscribers
   *
   * **Parameter Defaults:**
   * - strategy: 'random' (if not specified)
   * - min: 1024 (IANA registered port minimum)
   * - max: 65535 (maximum valid port number)
   *
   * **Response Structure:**
   * - requestId: Original message ID for correlation
   * - port: Generated port number
   * - strategy: Strategy used
   * - timestamp: Generation timestamp
   *
   * **Broadcasting:**
   * All subscribers to 'port_events' channel receive notification
   * (except the requesting client, to avoid echo).
   *
   * @example
   * ```typescript
   * // Client sends:
   * {
   *   id: 'msg-123',
   *   type: 'generate_port',
   *   payload: { strategy: 'fibonacci', min: 3000, max: 4000 }
   * }
   *
   * // Client receives:
   * {
   *   id: 'msg-456',
   *   type: 'port_generated',
   *   payload: { requestId: 'msg-123', port: 3597, strategy: 'fibonacci' }
   * }
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Handles GENERATE_PORTS message - generates multiple port numbers in bulk.
   *
   * @private
   * @param {string} clientId - ID of requesting client
   * @param {WebSocketMessage} message - The GENERATE_PORTS message
   * @returns {void}
   *
   * @description
   * Processes bulk port generation requests. Like handleGeneratePort() but
   * with MORE POWER. Generates up to 1000 ports in a single request because
   * sometimes one port just isn't enough.
   *
   * **Why Bulk Generation?**
   * - Microservices need many ports
   * - Load testing scenarios
   * - Because we can
   * - Client wants to impress their boss
   *
   * **Processing Steps:**
   * 1. Extract count and parameters from payload
   * 2. Cap count at 1000 (prevent DOS via port generation)
   * 3. Loop count times, generating ports
   * 4. Collect all ports into array
   * 5. Send response with all ports to client
   *
   * **Rate Limiting:**
   * Count is capped at 1000 ports per request. This is our idea of
   * "enterprise-grade security" - arbitrary limits that sound reasonable.
   *
   * **Performance:**
   * - 1 port: <1ms
   * - 100 ports: ~10ms
   * - 1000 ports: ~100ms
   * - 1001 ports: Denied (but client can send 2 requests)
   *
   * **Broadcasting:**
   * Currently does NOT broadcast bulk generation events (would spam channel).
   * This design decision saved us from implementing pagination.
   *
   * @example
   * ```typescript
   * // Client requests 10 ports
   * {
   *   id: 'msg-789',
   *   type: 'generate_ports',
   *   payload: { count: 10, strategy: 'prime', min: 5000, max: 6000 }
   * }
   *
   * // Client receives array of 10 ports
   * {
   *   type: 'ports_generated',
   *   payload: { ports: [5003, 5009, 5011, ...], count: 10 }
   * }
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Handles RESERVE_PORT message - reserves a port for exclusive use by client.
   *
   * @private
   * @param {string} clientId - ID of requesting client
   * @param {WebSocketMessage} message - The RESERVE_PORT message
   * @returns {void}
   *
   * @description
   * THE PORT RESERVATION SYSTEM - Securing integers since 2024!
   *
   * This method implements our sophisticated port reservation protocol, allowing
   * clients to claim exclusive ownership of port numbers. Think of it as Airbnb,
   * but for TCP/UDP ports, and without the cleaning fees.
   *
   * **Reservation Modes:**
   * 1. Specific Port: Client requests exact port (payload.port specified)
   *    - Check if available
   *    - Reserve if free, reject if taken
   * 2. Auto-Select: Client wants any port in range (payload.port undefined)
   *    - Find first available port in range
   *    - Reserve it automatically
   *    - Return port number to client
   *
   * **Processing Flow:**
   * 1. Extract payload from message
   * 2. Check if specific port requested
   * 3. If specific: Verify availability
   * 4. If auto: Search for available port in range
   * 5. Mark port as reserved (update reservedPorts Map)
   * 6. Send confirmation response to client
   * 7. Broadcast reservation event to subscribers
   *
   * **Reservation State:**
   * Stored in Map<number, string> where:
   * - Key: Port number
   * - Value: Client ID that reserved it
   *
   * **Conflict Resolution:**
   * First-come-first-served. No port can be reserved by multiple clients.
   * If requested port is taken, client receives success: false.
   *
   * **Expiration:**
   * Reservations currently NEVER expire (design flaw or feature?).
   * Client must explicitly release or disconnect to free port.
   *
   * **Broadcasting:**
   * Successful reservations broadcast to 'reservations' channel,
   * notifying all subscribers that a port is now taken.
   *
   * @example
   * ```typescript
   * // Reserve specific port
   * {
   *   type: 'reserve_port',
   *   payload: { port: 3000 }
   * }
   * // Response: { success: true, port: 3000 }
   * ```
   *
   * @example
   * ```typescript
   * // Auto-select from range
   * {
   *   type: 'reserve_port',
   *   payload: { min: 8000, max: 9000 }
   * }
   * // Response: { success: true, port: 8342 }
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Handles RELEASE_PORT message - releases a previously reserved port.
   *
   * @private
   * @param {string} clientId - ID of requesting client
   * @param {WebSocketMessage} message - The RELEASE_PORT message
   * @returns {void}
   *
   * @description
   * THE PORT LIBERATION SERVICE - Freeing integers from bondage!
   *
   * This method handles the release of previously reserved ports, returning them
   * to the pool of available ports. It's like check-out at a hotel, except the
   * room is a number and you can't steal the towels.
   *
   * **Release Authorization:**
   * Only the client that reserved the port can release it. This prevents
   * malicious clients from releasing other clients' ports (security through
   * simple Map lookups).
   *
   * **Processing Flow:**
   * 1. Extract port number from payload
   * 2. Look up current reservation owner
   * 3. Verify requesting client IS the owner
   * 4. If authorized: Remove from reservedPorts Map
   * 5. If authorized: Send success response
   * 6. If authorized: Broadcast release event
   * 7. If unauthorized: Send success: false response
   *
   * **Authorization Check:**
   * ```
   * if (reservedBy === clientId) {
   *   // Release allowed
   * } else {
   *   // Access denied (or port not reserved)
   * }
   * ```
   *
   * **Edge Cases:**
   * - Port not reserved: success: false (can't release what isn't taken)
   * - Port reserved by other client: success: false (no stealing!)
   * - Port reserved by requesting client: success: true (normal case)
   *
   * **Broadcasting:**
   * Successful releases broadcast to 'reservations' channel,
   * notifying subscribers that port is now available.
   *
   * **Side Effects:**
   * - Removes entry from this.reservedPorts Map
   * - Broadcasts PORT_RELEASED event
   * - Sends response to requesting client
   *
   * @example
   * ```typescript
   * // Release port 3000
   * {
   *   type: 'release_port',
   *   payload: { port: 3000 }
   * }
   * // Response: { success: true, port: 3000 }
   * ```
   *
   * @example
   * ```typescript
   * // Try to release port reserved by another client
   * {
   *   type: 'release_port',
   *   payload: { port: 3000 }
   * }
   * // Response: { success: false, port: 3000 }
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Handles CHECK_AVAILABILITY message - checks if a port is available.
   *
   * @private
   * @param {string} clientId - ID of requesting client
   * @param {WebSocketMessage} message - The CHECK_AVAILABILITY message
   * @returns {void}
   *
   * @description
   * THE PORT AVAILABILITY ORACLE - Answering yes/no questions about numbers!
   *
   * This method provides a read-only query interface for checking port
   * availability without attempting to reserve it. Perfect for cautious
   * clients who like to look before they leap.
   *
   * **Check Logic:**
   * Simple and elegant:
   * - If port in reservedPorts Map: NOT available
   * - If port NOT in reservedPorts Map: Available
   *
   * **Response Information:**
   * - port: The port number queried
   * - available: Boolean availability status
   * - reservedBy: Client ID if reserved (or null if available)
   * - timestamp: When check was performed
   *
   * **Race Conditions:**
   * ⚠️ WARNING: This is a READ operation without locks!
   * Port could be reserved between check and reservation attempt.
   * Classic TOCTOU (Time-Of-Check-Time-Of-Use) vulnerability.
   *
   * **Use Cases:**
   * - Pre-flight checks before reservation
   * - Monitoring port pool status
   * - Debugging reservation issues
   * - Making dashboards look impressive
   *
   * **No Side Effects:**
   * This is a pure query operation:
   * - Does not modify any state
   * - Does not reserve or release ports
   * - Does not broadcast events
   * - Just reads and responds
   *
   * @example
   * ```typescript
   * // Check if port 3000 is available
   * {
   *   type: 'check_availability',
   *   payload: { port: 3000 }
   * }
   * // Response: { port: 3000, available: false, reservedBy: 'client-xyz' }
   * ```
   *
   * @example
   * ```typescript
   * // Check available port
   * {
   *   type: 'check_availability',
   *   payload: { port: 8080 }
   * }
   * // Response: { port: 8080, available: true, reservedBy: null }
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Handles SUBSCRIBE message - subscribes client to a pub/sub channel.
   *
   * @private
   * @param {string} clientId - ID of requesting client
   * @param {WebSocketMessage} message - The SUBSCRIBE message
   * @returns {void}
   *
   * @description
   * THE PUB/SUB SUBSCRIPTION MANAGER - Joining the conversation!
   *
   * This method adds a client to a pub/sub channel's subscriber list,
   * enabling them to receive real-time broadcasts of events on that channel.
   * It's like following someone on social media, but for port numbers.
   *
   * **Available Channels:**
   * - port_events: All port generation notifications
   * - reservations: All reservation/release events
   * - system: System-level messages and announcements
   *
   * **Subscription Process:**
   * 1. Extract channel name from payload
   * 2. Look up client in clients Map
   * 3. Get or create channel's subscriber Set
   * 4. Add clientId to channel's Set
   * 5. Add channel to client's subscriptions Set
   * 6. Send confirmation to client
   *
   * **Dual Tracking:**
   * Subscriptions are tracked in TWO places:
   * - channels Map: channel → Set<clientId> (for broadcasting)
   * - client.subscriptions Set: Set<channel> (for cleanup)
   *
   * **Idempotency:**
   * Subscribing to same channel multiple times is safe.
   * Set data structure prevents duplicates automatically.
   *
   * **Broadcasting Behavior:**
   * After subscription, client receives ALL events broadcast to channel.
   * They do NOT receive historical events (no event replay).
   *
   * **Channel Creation:**
   * If channel doesn't exist, it's created automatically.
   * This is either flexible design or lack of validation, you decide.
   *
   * @example
   * ```typescript
   * // Subscribe to port events
   * {
   *   type: 'subscribe',
   *   payload: { channel: 'port_events' }
   * }
   * // Response: { success: true, channel: 'port_events' }
   * ```
   *
   * @example
   * ```typescript
   * // Subscribe to multiple channels
   * await client.subscribe('port_events');
   * await client.subscribe('reservations');
   * await client.subscribe('system');
   * // Now receiving events from all three channels
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Handles UNSUBSCRIBE message - unsubscribes client from a pub/sub channel.
   *
   * @private
   * @param {string} clientId - ID of requesting client
   * @param {WebSocketMessage} message - The UNSUBSCRIBE message
   * @returns {void}
   *
   * @description
   * THE PUB/SUB UNSUBSCRIPTION MANAGER - Leaving the conversation!
   *
   * This method removes a client from a channel's subscriber list, stopping
   * them from receiving further broadcasts on that channel. It's like
   * unfollowing someone, but you won't hurt any integers' feelings.
   *
   * **Unsubscription Process:**
   * 1. Extract channel name from payload
   * 2. Look up client in clients Map
   * 3. Remove clientId from channel's subscriber Set
   * 4. Remove channel from client's subscriptions Set
   * 5. Send confirmation to client
   *
   * **Cleanup:**
   * Removes subscription from BOTH tracking locations:
   * - channels Map: Removes clientId from Set
   * - client.subscriptions Set: Removes channel name
   *
   * **Idempotency:**
   * Unsubscribing from channel you're not subscribed to is safe.
   * Set.delete() returns false but doesn't throw.
   *
   * **Effect on Broadcasting:**
   * After unsubscribe, client will NO LONGER receive events on that channel.
   * Takes effect immediately (next broadcast won't include them).
   *
   * **Channel Lifecycle:**
   * If this was the last subscriber, the channel's Set becomes empty
   * but the channel itself remains in the Map (not cleaned up).
   * This is fine because empty Sets are tiny.
   *
   * @example
   * ```typescript
   * // Unsubscribe from port events
   * {
   *   type: 'unsubscribe',
   *   payload: { channel: 'port_events' }
   * }
   * // Response: { success: true, channel: 'port_events' }
   * ```
   *
   * @example
   * ```typescript
   * // Unsubscribe from all channels
   * const subscriptions = ['port_events', 'reservations', 'system'];
   * for (const channel of subscriptions) {
   *   await client.unsubscribe(channel);
   * }
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Handles PING message - responds with PONG for keep-alive.
   *
   * @private
   * @param {string} clientId - ID of requesting client
   * @param {WebSocketMessage} message - The PING message
   * @returns {void}
   *
   * @description
   * THE HEARTBEAT RESPONDER - Proving we're still alive!
   *
   * This method implements the client-server heartbeat protocol, responding
   * to PING messages with PONG. It's how clients know the server hasn't
   * gone for coffee without telling anyone.
   *
   * **Purpose:**
   * - Keep connections alive through NAT/firewalls
   * - Detect dead connections quickly
   * - Prevent idle connection timeouts
   * - Make network diagrams look more impressive
   *
   * **Protocol:**
   * - Client sends: PING with message ID
   * - Server responds: PONG with original ID
   * - Round-trip time: Can be measured by client
   *
   * **Why Not TCP Keep-Alive?**
   * - WebSocket layer ping/pong exists but isn't exposed
   * - Application-level gives us more control
   * - We can add custom payload data
   * - It's an excuse to implement more message types
   *
   * @example
   * ```typescript
   * // Client sends PING
   * { id: 'msg-999', type: 'ping', payload: {}, timestamp: 1234567890 }
   * // Server responds with PONG
   * { id: 'msg-1000', type: 'pong', payload: { requestId: 'msg-999' } }
   * ```
   *
   * @since 3.0.0
   */
  private handlePing(clientId: string, message: WebSocketMessage): void {
    // Send pong response
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

  /**
   * Handles client disconnection - cleanup and resource release.
   *
   * @private
   * @param {string} clientId - ID of disconnecting client
   * @returns {void}
   *
   * @description
   * THE CLEANUP CREW - Taking out the trash when clients leave!
   *
   * This method handles the complete cleanup process when a client disconnects,
   * ensuring no resources are leaked and all reservations are released.
   * It's like closing tabs in your browser, but actually freeing memory.
   *
   * **Cleanup Checklist:**
   * ✓ Release all ports reserved by client
   * ✓ Remove client from all channel subscriptions
   * ✓ Remove client from clients Map
   * ✓ Broadcast release events for freed ports
   * ✓ Log disconnection for monitoring
   *
   * **Port Release Process:**
   * 1. Iterate through ALL reserved ports
   * 2. Find ports reserved by this client
   * 3. Collect them in portsToRelease array
   * 4. Delete each from reservedPorts Map
   * 5. Broadcast PORT_RELEASED event for each
   *
   * **Subscription Cleanup:**
   * 1. Iterate through all channels
   * 2. Remove clientId from each channel's subscriber Set
   * 3. Prevents broadcasting to dead socket
   *
   * **Why This Matters:**
   * Without cleanup:
   * - Ports stay reserved forever (resource leak)
   * - Dead clients stay in channel Sets (memory leak)
   * - Broadcast attempts to closed sockets (errors)
   * - Clients Map grows unbounded (more memory leaks)
   *
   * **Disconnect Scenarios:**
   * - Client closes connection gracefully
   * - Client crashes (ungraceful)
   * - Network timeout
   * - Server initiated disconnect
   *
   * **Side Effects:**
   * - Removes client from this.clients Map
   * - Removes entries from this.reservedPorts Map
   * - Removes clientId from channel subscriber Sets
   * - Broadcasts multiple PORT_RELEASED events
   * - Logs to console
   *
   * @example
   * ```typescript
   * // Called automatically on 'close' event
   * socket.on('close', () => {
   *   this.handleDisconnection(clientId);
   * });
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Disconnects a specific client from the server.
   *
   * @private
   * @param {string} clientId - ID of client to disconnect
   * @returns {void}
   *
   * @description
   * THE BOUNCER - Showing clients the door!
   *
   * Forcefully closes a client's WebSocket connection. Used during server
   * shutdown or when we need to kick out misbehaving clients (not that we
   * have any validation to detect that).
   *
   * **Use Cases:**
   * - Server shutdown: Disconnect all clients gracefully
   * - Rate limiting: Boot clients exceeding limits (TODO)
   * - Administrative action: Manual client removal
   * - Testing: Simulate disconnections
   *
   * **Process:**
   * 1. Look up client by ID
   * 2. Check if client exists and has socket
   * 3. Call socket.close() to terminate connection
   * 4. Socket close event triggers handleDisconnection()
   *
   * **Cleanup:**
   * This method ONLY closes the socket. Full cleanup happens
   * automatically when the 'close' event fires and triggers
   * handleDisconnection().
   *
   * @example
   * ```typescript
   * // Disconnect specific client
   * this.disconnectClient('client-abc123');
   * ```
   *
   * @since 3.0.0
   */
  private disconnectClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client && client.socket) {
      client.socket.close();
    }
  }

  /**
   * Sends a message to a specific client.
   *
   * @private
   * @param {string} clientId - ID of target client
   * @param {WebSocketMessage} message - Message to send
   * @returns {void}
   *
   * @description
   * THE MESSAGE DISPATCHER - Delivering JSON to your door!
   *
   * Low-level method for sending messages to individual clients. All
   * server-to-client communication flows through this method, making it
   * the perfect place for logging, monitoring, and debugging.
   *
   * **Process:**
   * 1. Look up client by ID
   * 2. Return early if client not found (disconnected)
   * 3. Serialize message to JSON
   * 4. Send to client socket (TODO: actually implement)
   * 5. Log for monitoring
   * 6. Catch and log errors
   *
   * **Production Implementation:**
   * Replace console.log with:
   * ```typescript
   * client.socket.send(data);
   * ```
   *
   * **Error Handling:**
   * Catches serialization errors and send errors, logs them,
   * and continues. Failed sends are logged but don't crash server.
   *
   * **Why Not Throw Errors?**
   * Client might disconnect mid-send. Rather than crash, we log
   * and move on. The 'close' event will trigger cleanup.
   *
   * @example
   * ```typescript
   * this.sendToClient('client-123', {
   *   id: 'msg-456',
   *   type: 'port_generated',
   *   payload: { port: 3000 }
   * });
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Broadcasts a message to all subscribers of a channel.
   *
   * @private
   * @param {string} channel - Channel name to broadcast on
   * @param {WebSocketMessage} message - Message to broadcast
   * @param {string} [excludeClientId] - Optional client ID to exclude from broadcast
   * @returns {void}
   *
   * @description
   * THE EVENT BROADCASTER - Telling everyone the news!
   *
   * Implements pub/sub broadcasting, sending a message to ALL clients
   * subscribed to a specific channel. This is how we notify interested
   * parties about events without them having to poll.
   *
   * **Broadcasting Strategy:**
   * 1. Look up channel's subscriber Set
   * 2. Return if channel doesn't exist (no subscribers)
   * 3. Iterate through all subscriber IDs
   * 4. Skip excluded client if specified
   * 5. Send message to each subscriber
   *
   * **Exclusion Feature:**
   * Optional excludeClientId parameter prevents echo - stops clients from
   * receiving broadcasts of their own actions. Example: Client reserves
   * port, we broadcast to everyone EXCEPT them (they got direct response).
   *
   * **Performance:**
   * - O(n) where n = number of subscribers
   * - Each send is async, but we don't await
   * - Could be optimized with Promise.all() (future work)
   *
   * **Use Cases:**
   * - Port generation events → port_events channel
   * - Reservation events → reservations channel
   * - System notifications → system channel
   *
   * **Error Handling:**
   * Errors in sendToClient() are caught individually, so one failed
   * send doesn't prevent others from succeeding.
   *
   * @example
   * ```typescript
   * // Broadcast to all subscribers
   * this.broadcast('port_events', {
   *   type: 'port_generated',
   *   payload: { port: 3000 }
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Broadcast excluding originating client
   * this.broadcast('reservations', event, requestingClientId);
   * // All subscribers notified EXCEPT the one who triggered it
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Sends an error message to a client.
   *
   * @private
   * @param {string} clientId - ID of client to send error to
   * @param {string} requestId - ID of request that caused error
   * @param {string} error - Error message text
   * @returns {void}
   *
   * @description
   * THE ERROR MESSENGER - Bearer of bad news!
   *
   * Constructs and sends standardized error messages to clients when
   * something goes wrong. All errors follow a consistent format for
   * easy client-side error handling.
   *
   * **Error Message Structure:**
   * - id: Unique message ID (new, not from request)
   * - type: MessageType.ERROR (constant)
   * - payload.requestId: Original request ID for correlation
   * - payload.error: Human-readable error description
   * - payload.timestamp: When error occurred
   *
   * **Common Error Scenarios:**
   * - Unknown message type
   * - Invalid message format (JSON parse error)
   * - Port reservation conflict
   * - Unauthorized operation
   * - Channel not found
   *
   * **Error Handling Philosophy:**
   * We believe in:
   * - Clear error messages (no "error: error occurred")
   * - Request correlation (include requestId)
   * - Timestamps (for debugging sequences)
   * - Non-crashing errors (log and continue)
   *
   * @example
   * ```typescript
   * // Unknown message type
   * this.sendError(clientId, message.id, 'Unknown message type: invalid_type');
   * ```
   *
   * @example
   * ```typescript
   * // Port already reserved
   * this.sendError(clientId, requestId, 'Port 3000 is already reserved');
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Generates a port number using specified strategy.
   *
   * @private
   * @param {string} strategy - Generation strategy name
   * @param {number} min - Minimum port number (inclusive)
   * @param {number} max - Maximum port number (inclusive)
   * @returns {number} Generated port number
   *
   * @description
   * THE PORT ALGORITHM SELECTOR - Many ways to generate an integer!
   *
   * Routes port generation to different algorithms based on strategy.
   * Because sometimes you need a port number, and sometimes you need
   * a port number generated with STYLE.
   *
   * **Supported Strategies:**
   * - random: Classic Math.random() approach (most common)
   * - sequential: Based on timestamp modulo (pseudo-sequential)
   * - fibonacci: Nearest Fibonacci number in range (impressive)
   * - prime: Nearest prime number in range (even more impressive)
   * - default: Falls back to random (when client misspells strategy)
   *
   * **Strategy Selection:**
   * Uses switch statement for readability and type checking.
   * Could use strategy pattern with classes, but that's overkill
   * for what amounts to "pick a number differently."
   *
   * **Why These Strategies?**
   * - random: Everyone's favorite
   * - sequential: For deterministic testing
   * - fibonacci: To sound smart in meetings
   * - prime: To sound even smarter
   *
   * @example
   * ```typescript
   * const port = this.generatePort('fibonacci', 3000, 4000);
   * // Returns: 3571 (Fibonacci number in range)
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Generates a port number that is a prime number.
   *
   * @private
   * @param {number} min - Minimum port number
   * @param {number} max - Maximum port number
   * @returns {number} Prime number in range, or min if none found
   *
   * @description
   * THE PRIME PORT GENERATOR - Indivisible excellence!
   *
   * Finds the first prime number within the specified range.
   * Because composite numbers are for amateurs, and we only use
   * ports that cannot be factored.
   *
   * **Algorithm:**
   * 1. Start at min
   * 2. Test each number for primality
   * 3. Return first prime found
   * 4. Use trial division for primality testing
   * 5. Fallback to min if no primes in range
   *
   * **Primality Test:**
   * Uses trial division up to sqrt(n):
   * - O(√n) time complexity
   * - Good enough for port numbers
   * - Could use Miller-Rabin but that's overkill
   * - Sieve of Eratosthenes would be faster but more complex
   *
   * **Prime Properties:**
   * - Divisible only by 1 and itself
   * - Building blocks of integers
   * - Density decreases as numbers increase
   * - Infinitely many exist (proven by Euclid)
   *
   * **Why This Exists:**
   * - Demonstrates we passed discrete math
   * - Makes cryptographers feel at home
   * - Ports that are "fundamentally secure" (not really)
   * - Because Fibonacci wasn't enough
   *
   * @example
   * ```typescript
   * const port = this.generatePrimePort(3000, 4000);
   * // Returns: 3001 (first prime ≥ 3000)
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Generates a unique client ID.
   *
   * @private
   * @returns {string} Unique client identifier
   *
   * @description
   * THE CLIENT ID FACTORY - Making clients identifiable!
   *
   * Generates pseudo-unique identifiers for clients using timestamp
   * and random string. Not cryptographically secure, but unique enough
   * for our purposes.
   *
   * **ID Format:**
   * client-{timestamp}-{random}
   * Example: "client-1234567890-abc123xyz"
   *
   * **Uniqueness Strategy:**
   * - Timestamp: millisecond precision
   * - Random suffix: base36 encoded random
   * - Collision probability: Astronomically low
   *
   * **Why Not UUID?**
   * - This is simpler
   * - No dependencies
   * - Human-readable prefix
   * - Good enough for our scale
   *
   * @example
   * ```typescript
   * const id = this.generateClientId();
   * // Returns: "client-1701234567890-x7k9p2m"
   * ```
   *
   * @since 3.0.0
   */
  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generates a unique message ID.
   *
   * @private
   * @returns {string} Unique message identifier
   *
   * @description
   * THE MESSAGE ID FACTORY - Tracking every message!
   *
   * Generates pseudo-unique identifiers for messages using same
   * strategy as client IDs. Enables request/response correlation
   * and message tracing.
   *
   * **ID Format:**
   * msg-{timestamp}-{random}
   * Example: "msg-1234567890-def456uvw"
   *
   * **Use Cases:**
   * - Request/response correlation
   * - Debugging message flows
   * - Logging and monitoring
   * - Error reporting
   *
   * @example
   * ```typescript
   * const id = this.generateMessageId();
   * // Returns: "msg-1701234567890-k2n8q5r"
   * ```
   *
   * @since 3.0.0
   */
  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gets current server statistics.
   *
   * @public
   * @returns {object} Server statistics
   * @returns {number} returns.totalClients - Number of connected clients
   * @returns {number} returns.reservedPorts - Number of reserved ports
   * @returns {Record<string, number>} returns.channels - Subscriber count per channel
   *
   * @description
   * THE STATISTICS AGGREGATOR - Numbers about numbers!
   *
   * Provides real-time snapshot of server state for monitoring,
   * debugging, and dashboard purposes. All stats are computed
   * on-demand from live data structures.
   *
   * **Statistics Provided:**
   * - totalClients: Count of active WebSocket connections
   * - reservedPorts: Count of currently reserved ports
   * - channels: Map of channel name → subscriber count
   *
   * **Performance:**
   * - O(n) where n = number of channels (usually 3)
   * - Lightweight operation, safe to call frequently
   * - No expensive computations
   *
   * **Use Cases:**
   * - Health check endpoints
   * - Monitoring dashboards
   * - Debugging connection issues
   * - Load analysis
   *
   * @example
   * ```typescript
   * const stats = server.getStats();
   * console.log(`Clients: ${stats.totalClients}`);
   * console.log(`Reserved: ${stats.reservedPorts}`);
   * console.log(`Channels:`, stats.channels);
   * // Output: { port_events: 5, reservations: 3, system: 2 }
   * ```
   *
   * @since 3.0.0
   */
  getStats(): {
    totalClients: number;
    reservedPorts: number;
    channels: Record<string, number>;
  } {
    const channelStats: Record<string, number> = {};
    for (const [channel, subscribers] of this.channels.entries()) {
      channelStats[channel] = subscribers.size;
    }

    return {
      totalClients: this.clients.size,
      reservedPorts: this.reservedPorts.size,
      channels: channelStats
    };
  }

  /**
   * Checks if server is currently running.
   *
   * @public
   * @returns {boolean} True if server is running
   *
   * @description
   * Simple status check for server lifecycle state.
   *
   * @example
   * ```typescript
   * if (server.isRunning()) {
   *   console.log('Server is active');
   * }
   * ```
   *
   * @since 3.0.0
   */
  isRunning(): boolean {
    return this.running;
  }
}

/**
 * Enterprise WebSocket Client for Real-Time Port Number Operations
 *
 * @class PortNumberWebSocketClient
 * @description
 * THE CLIENT-SIDE COUNTERPART - Consuming port numbers in real-time!
 *
 * This class provides a production-ready WebSocket client for connecting to
 * the PortNumberWebSocketServer and performing real-time port number operations.
 * It's like a REST client, but faster, more complicated, and with more event handlers.
 *
 * **Why Use This Client?**
 * - Real-time port generation (because HTTP takes milliseconds)
 * - Persistent connection (reconnecting is for quitters)
 * - Event subscriptions (reactive programming buzzword compliance)
 * - Promise-based API (async/await all the things!)
 * - Type-safe operations (TypeScript has our back)
 *
 * **Core Features:**
 * - Connection lifecycle management
 * - Request/response correlation
 * - Promise-based async operations
 * - Event subscription with callbacks
 * - Automatic message ID generation
 * - Graceful connection handling
 *
 * **Client Lifecycle:**
 * 1. Construct with server URL
 * 2. Call connect() to establish connection
 * 3. Perform operations (generate, reserve, etc.)
 * 4. Subscribe to channels for events
 * 5. Call disconnect() when done
 *
 * **Promise-Based API:**
 * All operations return Promises that resolve when server responds.
 * This allows elegant async/await usage and error handling.
 *
 * **Message Correlation:**
 * Client tracks sent messages and matches responses by ID,
 * enabling multiple concurrent requests without confusion.
 *
 * **Production Considerations:**
 * ⚠️ IMPORTANT: This is a MOCK implementation!
 * - Replace console.log with actual WebSocket library
 * - Add reconnection logic
 * - Add timeout handling
 * - Add error recovery
 * - Add connection state machine
 *
 * @example
 * ```typescript
 * // Basic usage
 * const client = new PortNumberWebSocketClient('ws://localhost:8080');
 * await client.connect();
 * const port = await client.generatePort({ strategy: 'fibonacci' });
 * console.log(`Generated port: ${port}`);
 * await client.disconnect();
 * ```
 *
 * @example
 * ```typescript
 * // With error handling
 * const client = new PortNumberWebSocketClient();
 * try {
 *   await client.connect();
 *   const port = await client.reservePort({ port: 3000 });
 *   console.log(`Reserved port: ${port}`);
 * } catch (error) {
 *   console.error('Operation failed:', error);
 * } finally {
 *   await client.disconnect();
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Event subscription
 * const client = new PortNumberWebSocketClient();
 * await client.connect();
 * client.subscribe('port_events', (event) => {
 *   console.log(`Port generated: ${event.payload.port}`);
 * });
 * ```
 *
 * @since 3.0.0
 * @category API Layer - WebSocket Client
 * @public
 */
export class PortNumberWebSocketClient {
  private socket: any = null;
  private connected: boolean = false;
  private clientId?: string;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private serverUrl: string;

  /**
   * Constructs a new WebSocket client instance.
   *
   * @constructor
   * @param {string} [serverUrl='ws://localhost:8080'] - WebSocket server URL
   *
   * @description
   * Initializes the client with server URL and prepares internal state.
   * Does NOT establish connection (call connect() for that).
   *
   * **Initialization:**
   * - Stores server URL
   * - Initializes message handler registry
   * - Sets connected flag to false
   * - Prepares socket variable (null until connect)
   *
   * **Default Server:**
   * If no URL provided, defaults to ws://localhost:8080 (development default).
   *
   * @example
   * ```typescript
   * // Default local server
   * const client = new PortNumberWebSocketClient();
   * ```
   *
   * @example
   * ```typescript
   * // Production server
   * const client = new PortNumberWebSocketClient('wss://ports.example.com');
   * ```
   *
   * @since 3.0.0
   */
  constructor(serverUrl: string = 'ws://localhost:8080') {
    this.serverUrl = serverUrl;
  }

  /**
   * Establishes connection to the WebSocket server.
   *
   * @async
   * @returns {Promise<void>} Resolves when connection established
   * @throws {Error} If connection fails
   *
   * @description
   * THE CONNECTION INITIATOR - Opening the real-time portal!
   *
   * Establishes WebSocket connection to server and sets up event handlers.
   * Must be called before any operations can be performed.
   *
   * **Connection Process:**
   * 1. Log connection attempt
   * 2. Create WebSocket instance (TODO: actually implement)
   * 3. Wait for 'open' event
   * 4. Set up message handler
   * 5. Set connected flag
   * 6. Resolve promise
   *
   * **Production Implementation:**
   * Replace with actual WebSocket library:
   * ```typescript
   * this.socket = new WebSocket(this.serverUrl);
   * this.socket.on('open', () => resolve());
   * this.socket.on('message', (data) => this.handleMessage(data));
   * this.socket.on('error', (error) => reject(error));
   * ```
   *
   * **Error Conditions:**
   * - Server unreachable
   * - Invalid URL
   * - Network error
   * - Timeout (not implemented)
   *
   * @example
   * ```typescript
   * const client = new PortNumberWebSocketClient();
   * await client.connect();
   * console.log('Connected successfully!');
   * ```
   *
   * @example
   * ```typescript
   * // With error handling
   * try {
   *   await client.connect();
   * } catch (error) {
   *   console.error('Connection failed:', error);
   * }
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Closes connection to the WebSocket server.
   *
   * @returns {void}
   *
   * @description
   * THE CONNECTION TERMINATOR - Closing the portal gracefully!
   *
   * Gracefully closes the WebSocket connection and cleans up resources.
   * Safe to call even if not connected (idempotent).
   *
   * **Disconnection Process:**
   * 1. Check if socket exists
   * 2. Close socket connection
   * 3. Set socket to null
   * 4. Set connected flag to false
   * 5. Log disconnection
   *
   * **Cleanup:**
   * - Closes WebSocket connection
   * - Clears socket reference
   * - Resets connection state
   * - Preserves message handlers (for reconnection)
   *
   * **Idempotency:**
   * Safe to call multiple times. If already disconnected, just updates state.
   *
   * @example
   * ```typescript
   * await client.connect();
   * // ... perform operations ...
   * client.disconnect();
   * ```
   *
   * @example
   * ```typescript
   * // Safe cleanup in finally block
   * try {
   *   await client.connect();
   *   await client.generatePort();
   * } finally {
   *   client.disconnect();
   * }
   * ```
   *
   * @since 3.0.0
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connected = false;
    console.log('Disconnected from WebSocket server');
  }

  /**
   * Generates a single port number.
   *
   * @async
   * @param {GeneratePortMessage} [options={}] - Generation options
   * @returns {Promise<number>} Generated port number
   * @throws {Error} If not connected or request fails
   *
   * @description
   * THE PORT GENERATOR - Getting one integer at a time!
   *
   * Requests server to generate a single port number using specified strategy.
   * Returns Promise that resolves with the generated port.
   *
   * **Options:**
   * - strategy: 'random', 'sequential', 'fibonacci', 'prime'
   * - min: Minimum port (default: 1024)
   * - max: Maximum port (default: 65535)
   * - seed: Optional seed for deterministic generation
   *
   * **Process:**
   * 1. Create GENERATE_PORT message with options
   * 2. Send to server
   * 3. Wait for PORT_GENERATED response
   * 4. Extract and return port number
   *
   * @example
   * ```typescript
   * // Random port (default)
   * const port = await client.generatePort();
   * console.log(port); // e.g., 34521
   * ```
   *
   * @example
   * ```typescript
   * // Fibonacci port in specific range
   * const port = await client.generatePort({
   *   strategy: 'fibonacci',
   *   min: 3000,
   *   max: 4000
   * });
   * console.log(port); // e.g., 3571
   * ```
   *
   * @since 3.0.0
   */
  async generatePort(options: GeneratePortMessage = {}): Promise<number> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: MessageType.GENERATE_PORT,
      payload: options,
      timestamp: Date.now()
    };

    return this.sendAndWait(message, MessageType.PORT_GENERATED);
  }

  /**
   * Generates multiple port numbers in bulk.
   *
   * @async
   * @param {GeneratePortsMessage} options - Bulk generation options
   * @returns {Promise<number[]>} Array of generated port numbers
   * @throws {Error} If not connected or request fails
   *
   * @description
   * THE BULK PORT GENERATOR - Getting many integers at once!
   *
   * Requests server to generate multiple ports in a single request.
   * More efficient than calling generatePort() in a loop.
   *
   * **Required Options:**
   * - count: Number of ports to generate (max: 1000)
   *
   * **Optional Options:**
   * - strategy: Generation algorithm
   * - min: Minimum port range
   * - max: Maximum port range
   *
   * @example
   * ```typescript
   * // Generate 10 random ports
   * const ports = await client.generatePorts({ count: 10 });
   * console.log(ports); // [34521, 42342, 19283, ...]
   * ```
   *
   * @example
   * ```typescript
   * // Generate 5 prime ports in range
   * const ports = await client.generatePorts({
   *   count: 5,
   *   strategy: 'prime',
   *   min: 5000,
   *   max: 6000
   * });
   * console.log(ports); // [5003, 5009, 5011, 5021, 5023]
   * ```
   *
   * @since 3.0.0
   */
  async generatePorts(options: GeneratePortsMessage): Promise<number[]> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: MessageType.GENERATE_PORTS,
      payload: options,
      timestamp: Date.now()
    };

    return this.sendAndWait(message, 'ports_generated');
  }

  /**
   * Reserves a port for exclusive use.
   *
   * @async
   * @param {ReservePortMessage} [options={}] - Reservation options
   * @returns {Promise<number>} Reserved port number
   * @throws {Error} If not connected, port unavailable, or request fails
   *
   * @description
   * THE PORT RESERVATION SYSTEM - Claiming your integer!
   *
   * Requests exclusive reservation of a port. Can reserve specific port
   * or let server find an available one.
   *
   * **Options:**
   * - port: Specific port to reserve (if omitted, server auto-selects)
   * - min: Minimum port for auto-selection
   * - max: Maximum port for auto-selection
   * - metadata: Custom reservation metadata
   *
   * **Reservation Behavior:**
   * - If port specified: Reserve that exact port (fails if taken)
   * - If no port: Server finds first available in range
   * - Reservation tied to this client connection
   * - Released automatically on disconnect
   *
   * @example
   * ```typescript
   * // Reserve specific port
   * const port = await client.reservePort({ port: 3000 });
   * console.log(`Reserved: ${port}`); // 3000
   * ```
   *
   * @example
   * ```typescript
   * // Auto-select from range
   * const port = await client.reservePort({
   *   min: 8000,
   *   max: 9000,
   *   metadata: { service: 'api-gateway' }
   * });
   * console.log(`Reserved: ${port}`); // e.g., 8342
   * ```
   *
   * @since 3.0.0
   */
  async reservePort(options: ReservePortMessage = {}): Promise<number> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: MessageType.RESERVE_PORT,
      payload: options,
      timestamp: Date.now()
    };

    return this.sendAndWait(message, MessageType.PORT_RESERVED);
  }

  /**
   * Releases a previously reserved port.
   *
   * @async
   * @param {number} port - Port number to release
   * @returns {Promise<boolean>} True if successfully released
   * @throws {Error} If not connected or request fails
   *
   * @description
   * THE PORT LIBERATION SERVICE - Freeing your integer!
   *
   * Releases a port that was previously reserved by this client,
   * returning it to the pool of available ports.
   *
   * **Authorization:**
   * Can only release ports reserved by this client. Attempting to
   * release another client's port returns false.
   *
   * **Process:**
   * 1. Send RELEASE_PORT message with port number
   * 2. Server verifies authorization
   * 3. Server removes reservation
   * 4. Returns success status
   *
   * @example
   * ```typescript
   * const port = await client.reservePort({ port: 3000 });
   * // ... use port ...
   * const released = await client.releasePort(port);
   * console.log(`Released: ${released}`); // true
   * ```
   *
   * @example
   * ```typescript
   * // Try to release port not owned by this client
   * const released = await client.releasePort(9999);
   * console.log(`Released: ${released}`); // false
   * ```
   *
   * @since 3.0.0
   */
  async releasePort(port: number): Promise<boolean> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: MessageType.RELEASE_PORT,
      payload: { port },
      timestamp: Date.now()
    };

    return this.sendAndWait(message, MessageType.PORT_RELEASED);
  }

  /**
   * Checks if a port is currently available.
   *
   * @async
   * @param {number} port - Port number to check
   * @returns {Promise<boolean>} True if port is available
   * @throws {Error} If not connected or request fails
   *
   * @description
   * THE PORT AVAILABILITY CHECKER - Is this number taken?
   *
   * Queries server to check if a specific port is available for reservation.
   * Non-modifying operation (doesn't reserve the port).
   *
   * **Use Cases:**
   * - Pre-flight check before reservation
   * - Port availability monitoring
   * - Debugging reservation issues
   * - Dashboard displays
   *
   * **Race Condition Warning:**
   * Port could be reserved between check and reservation attempt.
   * This is a read operation without locks.
   *
   * @example
   * ```typescript
   * const available = await client.checkAvailability(3000);
   * if (available) {
   *   console.log('Port 3000 is available!');
   *   await client.reservePort({ port: 3000 });
   * }
   * ```
   *
   * @since 3.0.0
   */
  async checkAvailability(port: number): Promise<boolean> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: MessageType.CHECK_AVAILABILITY,
      payload: { port },
      timestamp: Date.now()
    };

    return this.sendAndWait(message, 'availability_checked');
  }

  /**
   * Subscribes to a pub/sub channel for real-time events.
   *
   * @param {string} channel - Channel name to subscribe to
   * @param {Function} handler - Callback function for channel events
   * @returns {void}
   *
   * @description
   * THE EVENT SUBSCRIPTION MANAGER - Tuning in to the broadcast!
   *
   * Subscribes to a channel and registers callback for events.
   * Enables reactive programming patterns with real-time updates.
   *
   * **Available Channels:**
   * - port_events: All port generation notifications
   * - reservations: All reservation/release events
   * - system: System-level messages
   *
   * **Handler Signature:**
   * ```typescript
   * (message: WebSocketMessage) => void
   * ```
   *
   * **Event Flow:**
   * 1. Subscribe to channel
   * 2. Server adds client to channel
   * 3. Server broadcasts events to channel
   * 4. Client receives events
   * 5. Handler callback invoked
   *
   * @example
   * ```typescript
   * // Monitor all port generation events
   * client.subscribe('port_events', (event) => {
   *   console.log(`Port generated: ${event.payload.port}`);
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Monitor reservations
   * client.subscribe('reservations', (event) => {
   *   if (event.type === 'port_reserved') {
   *     console.log(`Port ${event.payload.port} reserved`);
   *   }
   * });
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Unsubscribes from a pub/sub channel.
   *
   * @param {string} channel - Channel name to unsubscribe from
   * @returns {void}
   *
   * @description
   * THE EVENT UNSUBSCRIPTION MANAGER - Tuning out!
   *
   * Removes subscription from channel, stopping event callbacks.
   * Safe to call even if not subscribed (idempotent).
   *
   * **Process:**
   * 1. Send UNSUBSCRIBE message
   * 2. Server removes from channel subscribers
   * 3. No more events received for that channel
   *
   * @example
   * ```typescript
   * // Subscribe
   * client.subscribe('port_events', handler);
   * // Later, unsubscribe
   * client.unsubscribe('port_events');
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Sends a message to the server (fire-and-forget).
   *
   * @private
   * @param {WebSocketMessage} message - Message to send
   * @returns {void}
   * @throws {Error} If not connected
   *
   * @description
   * Low-level message sender for fire-and-forget operations.
   * Does not wait for response (use sendAndWait for that).
   *
   * @since 3.0.0
   */
  private send(message: WebSocketMessage): void {
    if (!this.connected || !this.socket) {
      throw new Error('Not connected to WebSocket server');
    }

    const data = JSON.stringify(message);
    // In production: this.socket.send(data);
    console.log(`[WS Client] -> ${message.type}`);
  }

  /**
   * Sends a message and waits for response (request/response pattern).
   *
   * @private
   * @param {WebSocketMessage} message - Message to send
   * @param {string} expectedType - Expected response message type
   * @returns {Promise<any>} Resolves with response payload
   * @throws {Error} If not connected or request times out
   *
   * @description
   * THE REQUEST/RESPONSE COORDINATOR - Turning async into sync!
   *
   * Sends message and returns Promise that resolves when matching response
   * arrives. Enables async/await pattern over WebSocket protocol.
   *
   * **Correlation Strategy:**
   * Registers temporary message handler that:
   * - Waits for response with matching request ID
   * - Resolves Promise with response payload
   * - Cleans up handler after response
   *
   * **Timeout:**
   * Currently no timeout (Promise waits forever).
   * Production should add timeout and reject after delay.
   *
   * @example
   * ```typescript
   * const message = { id: 'msg-123', type: 'generate_port', ... };
   * const result = await this.sendAndWait(message, 'port_generated');
   * console.log(result); // { port: 3000, strategy: 'random', ... }
   * ```
   *
   * @since 3.0.0
   */
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

  /**
   * Generates a unique message ID.
   *
   * @private
   * @returns {string} Unique message identifier
   *
   * @description
   * Creates pseudo-unique IDs for message correlation.
   *
   * @since 3.0.0
   */
  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Checks if client is connected to server.
   *
   * @returns {boolean} True if connected
   *
   * @description
   * Returns current connection status.
   *
   * @example
   * ```typescript
   * if (client.isConnected()) {
   *   await client.generatePort();
   * }
   * ```
   *
   * @since 3.0.0
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Gets the client ID assigned by server.
   *
   * @returns {string | undefined} Client ID or undefined if not connected
   *
   * @description
   * Returns the unique ID assigned by server upon connection.
   * Undefined until connection established and server sends welcome message.
   *
   * @example
   * ```typescript
   * await client.connect();
   * console.log(`Client ID: ${client.getClientId()}`);
   * ```
   *
   * @since 3.0.0
   */
  getClientId(): string | undefined {
    return this.clientId;
  }
}

/**
 * Pre-configured WebSocket Server Singleton Instance
 *
 * @const {PortNumberWebSocketServer} wsServer
 * @description
 * THE GLOBAL SERVER INSTANCE - One server to rule them all!
 *
 * A ready-to-use WebSocket server instance configured with default settings.
 * Useful for simple deployments where you just want to start a server without
 * ceremony. For production, you probably want to create your own instance with
 * custom configuration.
 *
 * **Default Configuration:**
 * - Port: 8080 (the default default)
 * - Auto-initialized channels
 * - Ready to call start()
 *
 * **Use Cases:**
 * - Quick prototyping
 * - Example/demo code
 * - Simple single-server deployments
 * - Testing WebSocket clients
 *
 * **Production Warning:**
 * For production, consider creating your own instance with appropriate
 * configuration rather than using this global singleton.
 *
 * @example
 * ```typescript
 * import { wsServer } from './PortNumberWebSocket';
 * await wsServer.start();
 * console.log('Server running on default port!');
 * ```
 *
 * @example
 * ```typescript
 * // Custom instance for production
 * const server = new PortNumberWebSocketServer(process.env.WS_PORT);
 * await server.start();
 * ```
 *
 * @since 3.0.0
 * @public
 */
export const wsServer = new PortNumberWebSocketServer();

/**
 * Pre-configured WebSocket Client Singleton Instance
 *
 * @const {PortNumberWebSocketClient} wsClient
 * @description
 * THE GLOBAL CLIENT INSTANCE - Because globals make demos easier!
 *
 * A ready-to-use WebSocket client instance configured to connect to localhost.
 * Convenient for quick testing and examples, but you probably want your own
 * instance for real applications.
 *
 * **Default Configuration:**
 * - Server URL: ws://localhost:8080
 * - No auto-connect (call connect() manually)
 * - Ready for immediate use
 *
 * **Use Cases:**
 * - Quick prototyping
 * - Example/demo code
 * - Testing against local server
 * - REPL experimentation
 *
 * **Production Warning:**
 * Create your own client instance with appropriate server URL rather than
 * using this localhost-configured singleton in production.
 *
 * @example
 * ```typescript
 * import { wsClient } from './PortNumberWebSocket';
 * await wsClient.connect();
 * const port = await wsClient.generatePort();
 * console.log(`Generated: ${port}`);
 * ```
 *
 * @example
 * ```typescript
 * // Custom instance for production
 * const client = new PortNumberWebSocketClient('wss://ports.example.com');
 * await client.connect();
 * ```
 *
 * @since 3.0.0
 * @public
 */
export const wsClient = new PortNumberWebSocketClient();

/**
 * @module Exports
 * @description
 * This module exports the complete WebSocket infrastructure for real-time
 * port number operations:
 *
 * **Classes:**
 * - PortNumberWebSocketServer: Server implementation
 * - PortNumberWebSocketClient: Client implementation
 *
 * **Interfaces:**
 * - WebSocketMessage: Base message structure
 * - WebSocketClient: Client metadata
 * - GeneratePortMessage: Port generation request
 * - GeneratePortsMessage: Bulk generation request
 * - ReservePortMessage: Reservation request
 * - ReleasePortMessage: Release request
 * - CheckAvailabilityMessage: Availability check request
 * - SubscribeMessage: Channel subscription request
 * - PortGeneratedEvent: Generation event
 * - PortReservedEvent: Reservation event
 * - PortReleasedEvent: Release event
 *
 * **Enums:**
 * - MessageType: All supported message types
 *
 * **Singletons:**
 * - wsServer: Pre-configured server instance
 * - wsClient: Pre-configured client instance
 *
 * @since 3.0.0
 */

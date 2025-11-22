/**
 * @fileoverview Enterprise Storage Adapter Interface
 *
 * This file contains the fundamental storage abstraction layer for the Port Number
 * Generator™ enterprise application. Because managing two port numbers (6969 and 42069)
 * requires a sophisticated, database-agnostic storage interface that can seamlessly
 * swap between in-memory storage, Redis, PostgreSQL, MongoDB, or whatever NoSQL
 * database becomes trendy next quarter.
 *
 * @module infrastructure/data-persistence/interfaces
 * @category Infrastructure Layer
 * @subcategory Data Persistence - Storage Abstraction
 * @since Phase 8 - Production Features
 * @version 8.0.0-STORAGE-ULTIMATE-EDITION
 *
 * @remarks
 * This interface implements the Adapter Pattern (Repository Pattern's cooler cousin)
 * to provide a unified API for port reservation persistence across multiple storage
 * backends. It enables:
 *
 * - **Database Agnosticism**: Swap storage backends without code changes
 * - **Connection Management**: Unified connect/disconnect lifecycle
 * - **CRUD Operations**: Create, Read, Update, Delete port reservations
 * - **Batch Operations**: Efficient multi-port operations
 * - **Range Queries**: Find available ports in specific ranges
 * - **Expiry Management**: Automatic cleanup of expired reservations
 * - **Health Monitoring**: Connection health and statistics
 *
 * **Architectural Patterns:**
 *
 * - **Adapter Pattern**: Adapts different storage backends to common interface
 * - **Repository Pattern**: Encapsulates data access logic
 * - **Strategy Pattern**: Pluggable storage strategies
 * - **Facade Pattern**: Simplifies complex storage operations
 *
 * **Supported Storage Backends:**
 *
 * - **Memory**: In-memory Map-based storage (for testing/development)
 * - **Redis**: Lightning-fast key-value store with TTL support
 * - **PostgreSQL**: Rock-solid relational database with ACID guarantees
 * - **MongoDB**: Document database for flexible schema (future)
 *
 * **Use Cases:**
 *
 * - Port reservation persistence across application restarts
 * - Distributed port coordination across multiple instances
 * - Port usage auditing and compliance
 * - Load balancing and port pool management
 * - Multi-tenant port isolation
 *
 * @example
 * ```typescript
 * // Using with Redis
 * const adapter: IStorageAdapter = new RedisStorageAdapter({
 *   host: 'localhost',
 *   port: 6379
 * });
 * await adapter.connect();
 * await adapter.reservePort(8080, { service: 'api' });
 * ```
 *
 * @example
 * ```typescript
 * // Batch operations
 * const ports = await adapter.reservePorts([8080, 8081, 8082]);
 * const available = await adapter.getAvailablePortsInRange(8000, 9000);
 * ```
 *
 * @see {@link BaseStorageAdapter} for the abstract base implementation
 * @see {@link MemoryStorageAdapter} for in-memory implementation
 * @see {@link RedisStorageAdapter} for Redis implementation
 * @see {@link PostgreSQLStorageAdapter} for PostgreSQL implementation
 *
 * @author Data Persistence Team
 * @copyright 2024 PortNumberGenerator™ Corporation
 * @license MIT (but with enterprise data persistence)
 *
 * @standards
 * - Repository Pattern (Martin Fowler)
 * - Adapter Pattern (Gang of Four)
 * - Async/Await Promise-based API
 * - ACID transactions (where supported)
 */

/**
 * Core storage adapter interface for port reservation persistence.
 *
 * Defines the complete contract that all storage adapter implementations must
 * satisfy to participate in the enterprise port reservation system. This interface
 * provides a comprehensive API for managing port reservations with support for
 * connection lifecycle, CRUD operations, batch processing, range queries, cleanup,
 * statistics, and health monitoring.
 *
 * @interface IStorageAdapter
 * @category Storage Interfaces
 * @public
 *
 * @remarks
 * **Implementation Requirements:**
 *
 * - ALL methods MUST be async (return Promise)
 * - Connection MUST be established before operations
 * - Operations SHOULD fail gracefully if not connected
 * - Implementations MUST be thread-safe for concurrent operations
 * - Cleanup operations SHOULD be idempotent
 * - Health checks MUST NOT throw exceptions
 *
 * **Connection Lifecycle:**
 *
 * 1. Instantiate adapter with configuration
 * 2. Call connect() to establish connection
 * 3. Perform operations (reserve, release, query)
 * 4. Call disconnect() for graceful shutdown
 *
 * **Error Handling:**
 *
 * - Connection errors SHOULD throw descriptive errors
 * - Operation failures SHOULD throw or return false
 * - Invalid inputs SHOULD throw validation errors
 * - Network timeouts SHOULD be configurable
 *
 * **Performance Considerations:**
 *
 * - Batch operations SHOULD be optimized (single round-trip)
 * - Connection pooling SHOULD be used where applicable
 * - Queries SHOULD use indexes on port numbers
 * - Statistics SHOULD be cached when possible
 *
 * @example
 * ```typescript
 * class MyStorageAdapter implements IStorageAdapter {
 *   async connect(): Promise<void> {
 *     // Establish connection
 *   }
 *
 *   async reservePort(port: number): Promise<boolean> {
 *     // Reserve port logic
 *     return true;
 *   }
 *   // ... implement other methods
 * }
 * ```
 *
 * @since 8.0.0
 */
export interface IStorageAdapter {
  /**
   * Establish connection to the storage backend.
   *
   * MUST be called before any operations. Should handle connection pooling,
   * authentication, and initial setup. May retry on failure based on config.
   *
   * @returns {Promise<void>} Resolves when connected
   * @throws {Error} If connection fails after retries
   *
   * @example
   * ```typescript
   * await adapter.connect();
   * console.log('Connected to storage backend');
   * ```
   */
  connect(): Promise<void>;

  /**
   * Gracefully disconnect from the storage backend.
   *
   * Should close all connections, flush pending operations, and cleanup
   * resources. After disconnect, adapter should not accept operations.
   *
   * @returns {Promise<void>} Resolves when disconnected
   * @throws {Error} If disconnect fails
   *
   * @example
   * ```typescript
   * await adapter.disconnect();
   * console.log('Disconnected from storage backend');
   * ```
   */
  disconnect(): Promise<void>;

  /**
   * Check if adapter is currently connected to storage backend.
   *
   * Returns synchronous status without making network calls. Used for
   * health checks and connection validation before operations.
   *
   * @returns {boolean} True if connected, false otherwise
   *
   * @example
   * ```typescript
   * if (adapter.isConnected()) {
   *   await adapter.reservePort(8080);
   * }
   * ```
   */
  isConnected(): boolean;

  // ==========================================================================
  // PORT REGISTRY OPERATIONS
  // ==========================================================================

  /**
   * Reserve a specific port number with optional metadata.
   *
   * Atomically reserves the specified port if available. Metadata can include
   * service name, owner, expiry time, or any custom data.
   *
   * @param {number} port - Port number to reserve (1-65535)
   * @param {Record<string, any>} [metadata] - Optional metadata
   * @returns {Promise<boolean>} True if reserved, false if already reserved
   * @throws {Error} If port is invalid or operation fails
   *
   * @example
   * ```typescript
   * const reserved = await adapter.reservePort(8080, {
   *   service: 'api',
   *   owner: 'team-alpha'
   * });
   * ```
   */
  reservePort(port: number, metadata?: Record<string, any>): Promise<boolean>;

  /**
   * Release a previously reserved port number.
   *
   * Makes the port available for future reservations. Idempotent - releasing
   * an already-released port should succeed.
   *
   * @param {number} port - Port number to release
   * @returns {Promise<boolean>} True if released, false if not reserved
   * @throws {Error} If operation fails
   *
   * @example
   * ```typescript
   * await adapter.releasePort(8080);
   * console.log('Port 8080 released');
   * ```
   */
  releasePort(port: number): Promise<boolean>;

  /**
   * Check if a port number is currently reserved.
   *
   * @param {number} port - Port number to check
   * @returns {Promise<boolean>} True if reserved, false if available
   * @throws {Error} If operation fails
   *
   * @example
   * ```typescript
   * if (await adapter.isPortReserved(8080)) {
   *   console.log('Port 8080 is already reserved');
   * }
   * ```
   */
  isPortReserved(port: number): Promise<boolean>;

  /**
   * Get list of all currently reserved port numbers.
   *
   * Returns sorted array of reserved ports. May be expensive for large
   * reservation sets - consider caching or pagination for production.
   *
   * @returns {Promise<number[]>} Array of reserved port numbers
   * @throws {Error} If operation fails
   *
   * @example
   * ```typescript
   * const reserved = await adapter.getReservedPorts();
   * console.log(`${reserved.length} ports reserved`);
   * ```
   */
  getReservedPorts(): Promise<number[]>;

  /**
   * Get metadata associated with a reserved port.
   *
   * @param {number} port - Port number to query
   * @returns {Promise<Record<string, any> | null>} Metadata or null if not reserved
   * @throws {Error} If operation fails
   *
   * @example
   * ```typescript
   * const metadata = await adapter.getPortMetadata(8080);
   * console.log(`Port owned by: ${metadata?.owner}`);
   * ```
   */
  getPortMetadata(port: number): Promise<Record<string, any> | null>;

  // ==========================================================================
  // BATCH OPERATIONS
  // ==========================================================================

  /**
   * Reserve multiple ports in a single operation.
   *
   * Atomically reserves all specified ports. Should use transaction or
   * batch API for efficiency. Returns list of successfully reserved ports.
   *
   * @param {number[]} ports - Array of port numbers to reserve
   * @param {Record<string, any>} [metadata] - Metadata applied to all ports
   * @returns {Promise<number[]>} Array of successfully reserved ports
   * @throws {Error} If operation fails
   *
   * @example
   * ```typescript
   * const reserved = await adapter.reservePorts([8080, 8081, 8082]);
   * console.log(`Reserved ${reserved.length} ports`);
   * ```
   */
  reservePorts(ports: number[], metadata?: Record<string, any>): Promise<number[]>;

  /**
   * Release multiple ports in a single operation.
   *
   * Atomically releases all specified ports. Uses batch API for efficiency.
   *
   * @param {number[]} ports - Array of port numbers to release
   * @returns {Promise<number[]>} Array of successfully released ports
   * @throws {Error} If operation fails
   *
   * @example
   * ```typescript
   * const released = await adapter.releasePorts([8080, 8081, 8082]);
   * console.log(`Released ${released.length} ports`);
   * ```
   */
  releasePorts(ports: number[]): Promise<number[]>;

  // ==========================================================================
  // RANGE OPERATIONS
  // ==========================================================================

  /**
   * Find all available (unreserved) ports in a range.
   *
   * Scans the range and returns ports that are not currently reserved.
   * May be expensive for large ranges - consider limiting range size.
   *
   * @param {number} start - Start of range (inclusive)
   * @param {number} end - End of range (inclusive)
   * @returns {Promise<number[]>} Array of available ports in range
   * @throws {Error} If range is invalid or operation fails
   *
   * @example
   * ```typescript
   * const available = await adapter.getAvailablePortsInRange(8000, 9000);
   * console.log(`${available.length} ports available in range`);
   * ```
   */
  getAvailablePortsInRange(start: number, end: number): Promise<number[]>;

  /**
   * Reserve any available port within a range.
   *
   * Finds and atomically reserves the first available port in the range.
   * Returns null if no ports available.
   *
   * @param {number} start - Start of range (inclusive)
   * @param {number} end - End of range (inclusive)
   * @param {Record<string, any>} [metadata] - Optional metadata
   * @returns {Promise<number | null>} Reserved port or null if none available
   * @throws {Error} If range is invalid or operation fails
   *
   * @example
   * ```typescript
   * const port = await adapter.reservePortInRange(8000, 9000);
   * if (port) console.log(`Reserved port ${port}`);
   * ```
   */
  reservePortInRange(start: number, end: number, metadata?: Record<string, any>): Promise<number | null>;

  // ==========================================================================
  // CLEANUP AND MAINTENANCE
  // ==========================================================================

  /**
   * Clear all port reservations.
   *
   * DANGEROUS: Removes all reservations from storage. Use for testing
   * or maintenance only. Should require confirmation in production.
   *
   * @returns {Promise<void>} Resolves when cleared
   * @throws {Error} If operation fails
   *
   * @example
   * ```typescript
   * await adapter.clearAllReservations();
   * console.log('All reservations cleared');
   * ```
   */
  clearAllReservations(): Promise<void>;

  /**
   * Clear expired port reservations based on timestamp.
   *
   * Removes reservations older than specified expiry time. Returns count
   * of cleared reservations. Used for automatic cleanup jobs.
   *
   * @param {number} expiryTime - Unix timestamp (ms) - reservations older than this are cleared
   * @returns {Promise<number>} Number of reservations cleared
   * @throws {Error} If operation fails
   *
   * @example
   * ```typescript
   * const oneHourAgo = Date.now() - (60 * 60 * 1000);
   * const cleared = await adapter.clearExpiredReservations(oneHourAgo);
   * console.log(`Cleared ${cleared} expired reservations`);
   * ```
   */
  clearExpiredReservations(expiryTime: number): Promise<number>;

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get total count of current port reservations.
   *
   * @returns {Promise<number>} Count of reserved ports
   * @throws {Error} If operation fails
   *
   * @example
   * ```typescript
   * const count = await adapter.getReservationCount();
   * console.log(`${count} ports currently reserved`);
   * ```
   */
  getReservationCount(): Promise<number>;

  /**
   * Get comprehensive storage statistics.
   *
   * Returns detailed stats about storage state, memory usage, connection
   * status, and last operation. Useful for monitoring and debugging.
   *
   * @returns {Promise<StorageStats>} Storage statistics object
   * @throws {Error} If operation fails
   *
   * @example
   * ```typescript
   * const stats = await adapter.getStorageStats();
   * console.log(`Reservations: ${stats.totalReservations}`);
   * console.log(`Memory: ${stats.memoryUsage} bytes`);
   * ```
   */
  getStorageStats(): Promise<{
    totalReservations: number;
    memoryUsage?: number;
    connectionStatus: string;
    lastOperation?: string;
  }>;

  // ==========================================================================
  // HEALTH CHECK
  // ==========================================================================

  /**
   * Perform a health check on the storage backend.
   *
   * Verifies connection and basic functionality. Should NOT throw exceptions,
   * returns false on failure. Used by monitoring systems.
   *
   * @returns {Promise<boolean>} True if healthy, false if unhealthy
   *
   * @example
   * ```typescript
   * const healthy = await adapter.healthCheck();
   * if (!healthy) {
   *   console.error('Storage backend unhealthy!');
   * }
   * ```
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Configuration interface for storage adapter initialization.
 *
 * Provides a flexible configuration schema supporting multiple storage backends
 * with common connection parameters, authentication, timeouts, and connection pooling.
 *
 * @interface StorageAdapterConfig
 * @category Storage Configuration
 * @public
 *
 * @since 8.0.0
 */
export interface StorageAdapterConfig {
  /** Database host/hostname (default: 'localhost') */
  host?: string;

  /** Database port number (backend-specific defaults) */
  port?: number;

  /** Authentication password (if required) */
  password?: string;

  /** Database name or number (PostgreSQL: name, Redis: number) */
  database?: string | number;

  /** Authentication username (if required) */
  username?: string;

  /** Connection timeout in milliseconds (default: 5000) */
  connectionTimeout?: number;

  /** Maximum connection retry attempts (default: 3) */
  maxRetries?: number;

  /** Delay between retries in milliseconds (default: 1000) */
  retryDelay?: number;

  /** Enable SSL/TLS encryption (default: false) */
  ssl?: boolean;

  /** Connection pool size for multi-connection backends (default: 10) */
  poolSize?: number;
}

/**
 * Interface representing a port reservation record.
 *
 * Contains all information about a reserved port including timing,
 * expiry, and custom metadata.
 *
 * @interface PortReservation
 * @category Storage Types
 * @public
 *
 * @since 8.0.0
 */
export interface PortReservation {
  /** The reserved port number (1-65535) */
  port: number;

  /** Unix timestamp (ms) when port was reserved */
  reservedAt: number;

  /** Optional Unix timestamp (ms) when reservation expires */
  expiresAt?: number;

  /** Optional custom metadata associated with reservation */
  metadata?: Record<string, any>;
}

/**
 * Enumeration of supported storage adapter types.
 *
 * Identifies the storage backend implementation for factory selection
 * and configuration purposes.
 *
 * @enum {string}
 * @readonly
 * @category Storage Types
 * @public
 *
 * @since 8.0.0
 */
export enum StorageAdapterType {
  /** In-memory Map-based storage (ephemeral, for testing) */
  MEMORY = 'memory',

  /** Redis key-value store (fast, TTL support) */
  REDIS = 'redis',

  /** PostgreSQL relational database (ACID, persistent) */
  POSTGRESQL = 'postgresql',

  /** MongoDB document database (flexible schema, future) */
  MONGODB = 'mongodb'
}

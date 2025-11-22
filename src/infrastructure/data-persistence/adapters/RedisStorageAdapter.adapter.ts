import { BaseStorageAdapter } from './BaseStorageAdapter.adapter.js';
import { PortReservation, StorageAdapterConfig } from '../interfaces/IStorageAdapter.interface.js';

/**
 * Redis Storage Adapter for distributed port reservation
 *
 * This is a mock implementation that simulates Redis behavior.
 * In production, replace with actual Redis client (ioredis or node-redis).
 */
export class RedisStorageAdapter extends BaseStorageAdapter {
  private client: RedisClient | null = null;
  private readonly RESERVATION_PREFIX = 'port:reservation:';
  private readonly METADATA_PREFIX = 'port:metadata:';
  private readonly SET_KEY = 'port:reserved:set';

  constructor(config: StorageAdapterConfig = {}) {
    super({
      host: 'localhost',
      port: 6379,
      database: 0,
      ...config
    });
  }

  async connect(): Promise<void> {
    await this.retryOperation(async () => {
      this.client = new RedisClient(this.config);
      await this.client.connect();
      this.connected = true;
      this.lastOperation = 'connect';
    }, 'connect');
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
    this.connected = false;
    this.lastOperation = 'disconnect';
  }

  async reservePort(port: number, metadata?: Record<string, any>): Promise<boolean> {
    this.validatePort(port);
    this.ensureConnected();
    this.lastOperation = 'reservePort';

    const key = `${this.RESERVATION_PREFIX}${port}`;
    const reservation: PortReservation = {
      port,
      reservedAt: Date.now(),
      metadata
    };

    // Use SETNX (SET if Not eXists) for atomic reservation
    const result = await this.client!.setNX(key, JSON.stringify(reservation));

    if (result) {
      // Add to set for fast lookups
      await this.client!.sadd(this.SET_KEY, port.toString());

      // Store metadata separately if provided
      if (metadata) {
        const metadataKey = `${this.METADATA_PREFIX}${port}`;
        await this.client!.set(metadataKey, JSON.stringify(metadata));
      }
    }

    return result;
  }

  async releasePort(port: number): Promise<boolean> {
    this.validatePort(port);
    this.ensureConnected();
    this.lastOperation = 'releasePort';

    const key = `${this.RESERVATION_PREFIX}${port}`;
    const metadataKey = `${this.METADATA_PREFIX}${port}`;

    // Delete reservation and metadata
    const deleted = await this.client!.del(key);
    await this.client!.del(metadataKey);
    await this.client!.srem(this.SET_KEY, port.toString());

    return deleted > 0;
  }

  async isPortReserved(port: number): Promise<boolean> {
    this.validatePort(port);
    this.ensureConnected();
    this.lastOperation = 'isPortReserved';

    // Use set membership for O(1) lookup
    return await this.client!.sismember(this.SET_KEY, port.toString());
  }

  async getReservedPorts(): Promise<number[]> {
    this.ensureConnected();
    this.lastOperation = 'getReservedPorts';

    const members = await this.client!.smembers(this.SET_KEY);
    return members.map(m => parseInt(m, 10)).sort((a, b) => a - b);
  }

  async getPortMetadata(port: number): Promise<Record<string, any> | null> {
    this.validatePort(port);
    this.ensureConnected();
    this.lastOperation = 'getPortMetadata';

    const metadataKey = `${this.METADATA_PREFIX}${port}`;
    const metadataStr = await this.client!.get(metadataKey);

    if (!metadataStr) {
      return null;
    }

    try {
      return JSON.parse(metadataStr);
    } catch {
      return null;
    }
  }

  async clearAllReservations(): Promise<void> {
    this.ensureConnected();
    this.lastOperation = 'clearAllReservations';

    // Get all reserved ports
    const ports = await this.getReservedPorts();

    // Delete all reservation keys
    const pipeline = this.client!.pipeline();
    for (const port of ports) {
      pipeline.del(`${this.RESERVATION_PREFIX}${port}`);
      pipeline.del(`${this.METADATA_PREFIX}${port}`);
    }

    // Clear the set
    pipeline.del(this.SET_KEY);

    await pipeline.exec();
  }

  async clearExpiredReservations(expiryTime: number): Promise<number> {
    this.ensureConnected();
    this.lastOperation = 'clearExpiredReservations';

    const ports = await this.getReservedPorts();
    const now = Date.now();
    let clearedCount = 0;

    for (const port of ports) {
      const key = `${this.RESERVATION_PREFIX}${port}`;
      const reservationStr = await this.client!.get(key);

      if (reservationStr) {
        try {
          const reservation: PortReservation = JSON.parse(reservationStr);

          const shouldExpire = reservation.expiresAt
            ? reservation.expiresAt < now
            : (now - reservation.reservedAt) > expiryTime;

          if (shouldExpire) {
            await this.releasePort(port);
            clearedCount++;
          }
        } catch {
          // Invalid reservation data, clean it up
          await this.releasePort(port);
          clearedCount++;
        }
      }
    }

    return clearedCount;
  }

  async getReservationCount(): Promise<number> {
    this.ensureConnected();
    this.lastOperation = 'getReservationCount';

    return await this.client!.scard(this.SET_KEY);
  }

  async getStorageStats(): Promise<{
    totalReservations: number;
    memoryUsage?: number;
    connectionStatus: string;
    lastOperation?: string;
  }> {
    const baseStats = await super.getStorageStats();

    // Get Redis memory usage
    let memoryUsage: number | undefined;
    try {
      const info = await this.client!.info('memory');
      const match = info.match(/used_memory:(\d+)/);
      if (match) {
        memoryUsage = parseInt(match[1], 10);
      }
    } catch {
      // If memory info unavailable, skip it
    }

    return {
      ...baseStats,
      memoryUsage
    };
  }

  // Redis-specific utility methods
  async setExpiry(port: number, ttlSeconds: number): Promise<boolean> {
    this.ensureConnected();

    const key = `${this.RESERVATION_PREFIX}${port}`;
    return await this.client!.expire(key, ttlSeconds);
  }

  async getTimeToLive(port: number): Promise<number> {
    this.ensureConnected();

    const key = `${this.RESERVATION_PREFIX}${port}`;
    return await this.client!.ttl(key);
  }

  private ensureConnected(): void {
    if (!this.connected || !this.client) {
      throw new Error('Redis adapter not connected. Call connect() first.');
    }
  }
}

/**
 * Mock Redis Client
 * In production, replace with: import Redis from 'ioredis' or import { createClient } from 'redis'
 */
class RedisClient {
  private data: Map<string, string> = new Map();
  private sets: Map<string, Set<string>> = new Map();
  private expirations: Map<string, number> = new Map();
  private config: StorageAdapterConfig;

  constructor(config: StorageAdapterConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async disconnect(): Promise<void> {
    this.data.clear();
    this.sets.clear();
    this.expirations.clear();
  }

  async setNX(key: string, value: string): Promise<boolean> {
    if (this.data.has(key)) {
      return false;
    }
    this.data.set(key, value);
    return true;
  }

  async set(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    // Check expiration
    const expiration = this.expirations.get(key);
    if (expiration && Date.now() > expiration) {
      this.data.delete(key);
      this.expirations.delete(key);
      return null;
    }

    return this.data.get(key) || null;
  }

  async del(key: string): Promise<number> {
    const deleted = this.data.delete(key);
    this.expirations.delete(key);
    return deleted ? 1 : 0;
  }

  async sadd(key: string, member: string): Promise<void> {
    if (!this.sets.has(key)) {
      this.sets.set(key, new Set());
    }
    this.sets.get(key)!.add(member);
  }

  async srem(key: string, member: string): Promise<void> {
    const set = this.sets.get(key);
    if (set) {
      set.delete(member);
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const set = this.sets.get(key);
    return set ? set.has(member) : false;
  }

  async smembers(key: string): Promise<string[]> {
    const set = this.sets.get(key);
    return set ? Array.from(set) : [];
  }

  async scard(key: string): Promise<number> {
    const set = this.sets.get(key);
    return set ? set.size : 0;
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    if (!this.data.has(key)) {
      return false;
    }
    this.expirations.set(key, Date.now() + ttlSeconds * 1000);
    return true;
  }

  async ttl(key: string): Promise<number> {
    const expiration = this.expirations.get(key);
    if (!expiration) {
      return -1; // No expiration set
    }

    const remaining = Math.floor((expiration - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2; // -2 means expired
  }

  async info(section: string): Promise<string> {
    // Mock memory info
    const memoryUsage = this.data.size * 100 + this.sets.size * 50;
    return `# Memory\nused_memory:${memoryUsage}\n`;
  }

  pipeline(): RedisPipeline {
    return new RedisPipeline(this);
  }
}

class RedisPipeline {
  private commands: Array<() => Promise<any>> = [];

  constructor(private client: RedisClient) {}

  del(key: string): this {
    this.commands.push(() => this.client.del(key));
    return this;
  }

  async exec(): Promise<any[]> {
    return Promise.all(this.commands.map(cmd => cmd()));
  }
}

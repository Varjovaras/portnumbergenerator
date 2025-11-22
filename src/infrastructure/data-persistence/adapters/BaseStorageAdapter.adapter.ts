import type { IStorageAdapter, StorageAdapterConfig, PortReservation } from '../interfaces/IStorageAdapter.interface.js';

export abstract class BaseStorageAdapter implements IStorageAdapter {
  protected config: StorageAdapterConfig;
  protected connected: boolean = false;
  protected lastOperation: string = 'none';

  constructor(config: StorageAdapterConfig = {}) {
    this.config = {
      connectionTimeout: 5000,
      maxRetries: 3,
      retryDelay: 1000,
      poolSize: 10,
      ...config
    };
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;

  isConnected(): boolean {
    return this.connected;
  }

  abstract reservePort(port: number, metadata?: Record<string, any>): Promise<boolean>;
  abstract releasePort(port: number): Promise<boolean>;
  abstract isPortReserved(port: number): Promise<boolean>;
  abstract getReservedPorts(): Promise<number[]>;
  abstract getPortMetadata(port: number): Promise<Record<string, any> | null>;

  async reservePorts(ports: number[], metadata?: Record<string, any>): Promise<number[]> {
    this.lastOperation = 'reservePorts';
    const reserved: number[] = [];

    for (const port of ports) {
      const success = await this.reservePort(port, metadata);
      if (success) {
        reserved.push(port);
      }
    }

    return reserved;
  }

  async releasePorts(ports: number[]): Promise<number[]> {
    this.lastOperation = 'releasePorts';
    const released: number[] = [];

    for (const port of ports) {
      const success = await this.releasePort(port);
      if (success) {
        released.push(port);
      }
    }

    return released;
  }

  async getAvailablePortsInRange(start: number, end: number): Promise<number[]> {
    this.lastOperation = 'getAvailablePortsInRange';
    const available: number[] = [];

    for (let port = start; port <= end; port++) {
      const reserved = await this.isPortReserved(port);
      if (!reserved) {
        available.push(port);
      }
    }

    return available;
  }

  async reservePortInRange(start: number, end: number, metadata?: Record<string, any>): Promise<number | null> {
    this.lastOperation = 'reservePortInRange';

    for (let port = start; port <= end; port++) {
      const reserved = await this.isPortReserved(port);
      if (!reserved) {
        const success = await this.reservePort(port, metadata);
        if (success) {
          return port;
        }
      }
    }

    return null;
  }

  abstract clearAllReservations(): Promise<void>;
  abstract clearExpiredReservations(expiryTime: number): Promise<number>;
  abstract getReservationCount(): Promise<number>;

  async getStorageStats(): Promise<{
    totalReservations: number;
    memoryUsage?: number;
    connectionStatus: string;
    lastOperation?: string;
  }> {
    const totalReservations = await this.getReservationCount();

    return {
      totalReservations,
      connectionStatus: this.connected ? 'connected' : 'disconnected',
      lastOperation: this.lastOperation
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.connected) {
        return false;
      }

      // Perform a simple operation to verify connectivity
      await this.getReservationCount();
      return true;
    } catch (error) {
      return false;
    }
  }

  protected async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= (this.config.maxRetries || 3); attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt < (this.config.maxRetries || 3)) {
          await this.delay(this.config.retryDelay || 1000);
        }
      }
    }

    throw new Error(
      `Operation ${operationName} failed after ${this.config.maxRetries} attempts: ${lastError?.message}`
    );
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected validatePort(port: number): void {
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
      throw new Error(`Invalid port number: ${port}. Must be between 0 and 65535.`);
    }
  }

  protected validatePortRange(start: number, end: number): void {
    this.validatePort(start);
    this.validatePort(end);

    if (start > end) {
      throw new Error(`Invalid port range: start (${start}) must be less than or equal to end (${end})`);
    }
  }
}

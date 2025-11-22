export interface IStorageAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Port Registry Operations
  reservePort(port: number, metadata?: Record<string, any>): Promise<boolean>;
  releasePort(port: number): Promise<boolean>;
  isPortReserved(port: number): Promise<boolean>;
  getReservedPorts(): Promise<number[]>;
  getPortMetadata(port: number): Promise<Record<string, any> | null>;

  // Batch Operations
  reservePorts(ports: number[], metadata?: Record<string, any>): Promise<number[]>;
  releasePorts(ports: number[]): Promise<number[]>;

  // Range Operations
  getAvailablePortsInRange(start: number, end: number): Promise<number[]>;
  reservePortInRange(start: number, end: number, metadata?: Record<string, any>): Promise<number | null>;

  // Cleanup and Maintenance
  clearAllReservations(): Promise<void>;
  clearExpiredReservations(expiryTime: number): Promise<number>;

  // Statistics
  getReservationCount(): Promise<number>;
  getStorageStats(): Promise<{
    totalReservations: number;
    memoryUsage?: number;
    connectionStatus: string;
    lastOperation?: string;
  }>;

  // Health Check
  healthCheck(): Promise<boolean>;
}

export interface StorageAdapterConfig {
  host?: string;
  port?: number;
  password?: string;
  database?: string | number;
  username?: string;
  connectionTimeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  ssl?: boolean;
  poolSize?: number;
}

export interface PortReservation {
  port: number;
  reservedAt: number;
  expiresAt?: number;
  metadata?: Record<string, any>;
}

export enum StorageAdapterType {
  MEMORY = 'memory',
  REDIS = 'redis',
  POSTGRESQL = 'postgresql',
  MONGODB = 'mongodb'
}

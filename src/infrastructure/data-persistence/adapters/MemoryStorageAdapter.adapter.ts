import { BaseStorageAdapter } from './BaseStorageAdapter.adapter.js';
import type { PortReservation, StorageAdapterConfig } from '../interfaces/IStorageAdapter.interface.js';

export class MemoryStorageAdapter extends BaseStorageAdapter {
  private reservations: Map<number, PortReservation> = new Map();

  constructor(config: StorageAdapterConfig = {}) {
    super(config);
  }

  async connect(): Promise<void> {
    this.connected = true;
    this.lastOperation = 'connect';
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.lastOperation = 'disconnect';
  }

  async reservePort(port: number, metadata?: Record<string, any>): Promise<boolean> {
    this.validatePort(port);
    this.lastOperation = 'reservePort';

    if (this.reservations.has(port)) {
      return false;
    }

    const reservation: PortReservation = {
      port,
      reservedAt: Date.now(),
      metadata
    };

    this.reservations.set(port, reservation);
    return true;
  }

  async releasePort(port: number): Promise<boolean> {
    this.validatePort(port);
    this.lastOperation = 'releasePort';

    if (!this.reservations.has(port)) {
      return false;
    }

    this.reservations.delete(port);
    return true;
  }

  async isPortReserved(port: number): Promise<boolean> {
    this.validatePort(port);
    this.lastOperation = 'isPortReserved';
    return this.reservations.has(port);
  }

  async getReservedPorts(): Promise<number[]> {
    this.lastOperation = 'getReservedPorts';
    return Array.from(this.reservations.keys()).sort((a, b) => a - b);
  }

  async getPortMetadata(port: number): Promise<Record<string, any> | null> {
    this.validatePort(port);
    this.lastOperation = 'getPortMetadata';

    const reservation = this.reservations.get(port);
    return reservation?.metadata || null;
  }

  async clearAllReservations(): Promise<void> {
    this.lastOperation = 'clearAllReservations';
    this.reservations.clear();
  }

  async clearExpiredReservations(expiryTime: number): Promise<number> {
    this.lastOperation = 'clearExpiredReservations';
    let clearedCount = 0;
    const now = Date.now();

    for (const [port, reservation] of this.reservations.entries()) {
      if (reservation.expiresAt && reservation.expiresAt < now) {
        this.reservations.delete(port);
        clearedCount++;
      } else if (!reservation.expiresAt && (now - reservation.reservedAt) > expiryTime) {
        this.reservations.delete(port);
        clearedCount++;
      }
    }

    return clearedCount;
  }

  async getReservationCount(): Promise<number> {
    this.lastOperation = 'getReservationCount';
    return this.reservations.size;
  }

  async getStorageStats(): Promise<{
    totalReservations: number;
    memoryUsage?: number;
    connectionStatus: string;
    lastOperation?: string;
  }> {
    const baseStats = await super.getStorageStats();

    // Estimate memory usage
    const memoryUsage = this.estimateMemoryUsage();

    return {
      ...baseStats,
      memoryUsage
    };
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;

    for (const [port, reservation] of this.reservations.entries()) {
      // Port number: 8 bytes (number in JS)
      totalSize += 8;

      // Reservation object overhead
      totalSize += 8; // reservedAt timestamp

      if (reservation.expiresAt) {
        totalSize += 8;
      }

      if (reservation.metadata) {
        // Rough estimation of metadata size
        totalSize += JSON.stringify(reservation.metadata).length * 2;
      }
    }

    return totalSize;
  }

  // Additional helper methods for in-memory adapter
  getReservationDetails(port: number): PortReservation | undefined {
    return this.reservations.get(port);
  }

  getAllReservations(): PortReservation[] {
    return Array.from(this.reservations.values());
  }

  setReservationExpiry(port: number, expiresAt: number): boolean {
    const reservation = this.reservations.get(port);
    if (!reservation) {
      return false;
    }

    reservation.expiresAt = expiresAt;
    return true;
  }

  updateMetadata(port: number, metadata: Record<string, any>): boolean {
    const reservation = this.reservations.get(port);
    if (!reservation) {
      return false;
    }

    reservation.metadata = { ...reservation.metadata, ...metadata };
    return true;
  }
}

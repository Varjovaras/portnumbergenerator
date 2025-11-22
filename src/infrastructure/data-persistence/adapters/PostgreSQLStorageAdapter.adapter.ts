import { BaseStorageAdapter } from './BaseStorageAdapter.adapter.js';
import { PortReservation, StorageAdapterConfig } from '../interfaces/IStorageAdapter.interface.js';

/**
 * PostgreSQL Storage Adapter for persistent port reservation
 *
 * This is a mock implementation that simulates PostgreSQL behavior.
 * In production, replace with actual PostgreSQL client (pg or postgres.js).
 */
export class PostgreSQLStorageAdapter extends BaseStorageAdapter {
  private client: PostgreSQLClient | null = null;
  private readonly TABLE_NAME = 'port_reservations';

  constructor(config: StorageAdapterConfig = {}) {
    super({
      host: 'localhost',
      port: 5432,
      database: 'portnumbers',
      username: 'postgres',
      password: '',
      poolSize: 20,
      ...config
    });
  }

  async connect(): Promise<void> {
    await this.retryOperation(async () => {
      this.client = new PostgreSQLClient(this.config);
      await this.client.connect();
      await this.initializeSchema();
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

  private async initializeSchema(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.TABLE_NAME} (
        port INTEGER PRIMARY KEY,
        reserved_at BIGINT NOT NULL,
        expires_at BIGINT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_expires_at ON ${this.TABLE_NAME}(expires_at);
      CREATE INDEX IF NOT EXISTS idx_reserved_at ON ${this.TABLE_NAME}(reserved_at);
    `;

    await this.client!.query(createTableSQL);
  }

  async reservePort(port: number, metadata?: Record<string, any>): Promise<boolean> {
    this.validatePort(port);
    this.ensureConnected();
    this.lastOperation = 'reservePort';

    const sql = `
      INSERT INTO ${this.TABLE_NAME} (port, reserved_at, metadata)
      VALUES ($1, $2, $3)
      ON CONFLICT (port) DO NOTHING
      RETURNING port
    `;

    const values = [port, Date.now(), metadata ? JSON.stringify(metadata) : null];

    try {
      const result = await this.client!.query(sql, values);
      return result.rowCount > 0;
    } catch (error) {
      return false;
    }
  }

  async releasePort(port: number): Promise<boolean> {
    this.validatePort(port);
    this.ensureConnected();
    this.lastOperation = 'releasePort';

    const sql = `DELETE FROM ${this.TABLE_NAME} WHERE port = $1`;

    const result = await this.client!.query(sql, [port]);
    return result.rowCount > 0;
  }

  async isPortReserved(port: number): Promise<boolean> {
    this.validatePort(port);
    this.ensureConnected();
    this.lastOperation = 'isPortReserved';

    const sql = `SELECT 1 FROM ${this.TABLE_NAME} WHERE port = $1 LIMIT 1`;

    const result = await this.client!.query(sql, [port]);
    return result.rowCount > 0;
  }

  async getReservedPorts(): Promise<number[]> {
    this.ensureConnected();
    this.lastOperation = 'getReservedPorts';

    const sql = `SELECT port FROM ${this.TABLE_NAME} ORDER BY port ASC`;

    const result = await this.client!.query(sql);
    return result.rows.map((row: any) => row.port);
  }

  async getPortMetadata(port: number): Promise<Record<string, any> | null> {
    this.validatePort(port);
    this.ensureConnected();
    this.lastOperation = 'getPortMetadata';

    const sql = `SELECT metadata FROM ${this.TABLE_NAME} WHERE port = $1`;

    const result = await this.client!.query(sql, [port]);

    if (result.rowCount === 0) {
      return null;
    }

    const metadata = result.rows[0].metadata;
    return metadata ? (typeof metadata === 'string' ? JSON.parse(metadata) : metadata) : null;
  }

  async reservePorts(ports: number[], metadata?: Record<string, any>): Promise<number[]> {
    this.ensureConnected();
    this.lastOperation = 'reservePorts';

    const reserved: number[] = [];
    const reservedAt = Date.now();

    // Use transaction for batch insert
    await this.client!.query('BEGIN');

    try {
      for (const port of ports) {
        const sql = `
          INSERT INTO ${this.TABLE_NAME} (port, reserved_at, metadata)
          VALUES ($1, $2, $3)
          ON CONFLICT (port) DO NOTHING
          RETURNING port
        `;

        const values = [port, reservedAt, metadata ? JSON.stringify(metadata) : null];
        const result = await this.client!.query(sql, values);

        if (result.rowCount > 0) {
          reserved.push(port);
        }
      }

      await this.client!.query('COMMIT');
    } catch (error) {
      await this.client!.query('ROLLBACK');
      throw error;
    }

    return reserved;
  }

  async releasePorts(ports: number[]): Promise<number[]> {
    this.ensureConnected();
    this.lastOperation = 'releasePorts';

    if (ports.length === 0) {
      return [];
    }

    const placeholders = ports.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `DELETE FROM ${this.TABLE_NAME} WHERE port IN (${placeholders}) RETURNING port`;

    const result = await this.client!.query(sql, ports);
    return result.rows.map((row: any) => row.port);
  }

  async getAvailablePortsInRange(start: number, end: number): Promise<number[]> {
    this.validatePortRange(start, end);
    this.ensureConnected();
    this.lastOperation = 'getAvailablePortsInRange';

    const sql = `
      SELECT generate_series($1::int, $2::int) AS port
      EXCEPT
      SELECT port FROM ${this.TABLE_NAME}
      WHERE port BETWEEN $1 AND $2
      ORDER BY port
    `;

    const result = await this.client!.query(sql, [start, end]);
    return result.rows.map((row: any) => row.port);
  }

  async reservePortInRange(start: number, end: number, metadata?: Record<string, any>): Promise<number | null> {
    this.validatePortRange(start, end);
    this.ensureConnected();
    this.lastOperation = 'reservePortInRange';

    const sql = `
      WITH available_port AS (
        SELECT generate_series($1::int, $2::int) AS port
        EXCEPT
        SELECT port FROM ${this.TABLE_NAME}
        WHERE port BETWEEN $1 AND $2
        ORDER BY port
        LIMIT 1
      )
      INSERT INTO ${this.TABLE_NAME} (port, reserved_at, metadata)
      SELECT port, $3, $4 FROM available_port
      RETURNING port
    `;

    const values = [start, end, Date.now(), metadata ? JSON.stringify(metadata) : null];

    try {
      const result = await this.client!.query(sql, values);
      return result.rowCount > 0 ? result.rows[0].port : null;
    } catch (error) {
      return null;
    }
  }

  async clearAllReservations(): Promise<void> {
    this.ensureConnected();
    this.lastOperation = 'clearAllReservations';

    const sql = `TRUNCATE TABLE ${this.TABLE_NAME}`;
    await this.client!.query(sql);
  }

  async clearExpiredReservations(expiryTime: number): Promise<number> {
    this.ensureConnected();
    this.lastOperation = 'clearExpiredReservations';

    const now = Date.now();
    const cutoffTime = now - expiryTime;

    const sql = `
      DELETE FROM ${this.TABLE_NAME}
      WHERE expires_at < $1 OR (expires_at IS NULL AND reserved_at < $2)
      RETURNING port
    `;

    const result = await this.client!.query(sql, [now, cutoffTime]);
    return result.rowCount;
  }

  async getReservationCount(): Promise<number> {
    this.ensureConnected();
    this.lastOperation = 'getReservationCount';

    const sql = `SELECT COUNT(*) as count FROM ${this.TABLE_NAME}`;

    const result = await this.client!.query(sql);
    return parseInt(result.rows[0].count, 10);
  }

  async getStorageStats(): Promise<{
    totalReservations: number;
    memoryUsage?: number;
    connectionStatus: string;
    lastOperation?: string;
  }> {
    const baseStats = await super.getStorageStats();

    let memoryUsage: number | undefined;
    try {
      const sql = `SELECT pg_total_relation_size($1) as size`;
      const result = await this.client!.query(sql, [this.TABLE_NAME]);
      memoryUsage = parseInt(result.rows[0].size, 10);
    } catch {
      // If size query fails, skip it
    }

    return {
      ...baseStats,
      memoryUsage
    };
  }

  // PostgreSQL-specific utility methods
  async setExpiry(port: number, expiresAt: number): Promise<boolean> {
    this.ensureConnected();

    const sql = `UPDATE ${this.TABLE_NAME} SET expires_at = $1 WHERE port = $2`;
    const result = await this.client!.query(sql, [expiresAt, port]);

    return result.rowCount > 0;
  }

  async updateMetadata(port: number, metadata: Record<string, any>): Promise<boolean> {
    this.ensureConnected();

    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET metadata = metadata || $1::jsonb, updated_at = CURRENT_TIMESTAMP
      WHERE port = $2
    `;

    const result = await this.client!.query(sql, [JSON.stringify(metadata), port]);
    return result.rowCount > 0;
  }

  async getReservationDetails(port: number): Promise<PortReservation | null> {
    this.ensureConnected();

    const sql = `SELECT * FROM ${this.TABLE_NAME} WHERE port = $1`;
    const result = await this.client!.query(sql, [port]);

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      port: row.port,
      reservedAt: row.reserved_at,
      expiresAt: row.expires_at,
      metadata: row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : undefined
    };
  }

  async vacuum(): Promise<void> {
    this.ensureConnected();
    await this.client!.query(`VACUUM ${this.TABLE_NAME}`);
  }

  async analyze(): Promise<void> {
    this.ensureConnected();
    await this.client!.query(`ANALYZE ${this.TABLE_NAME}`);
  }

  private ensureConnected(): void {
    if (!this.connected || !this.client) {
      throw new Error('PostgreSQL adapter not connected. Call connect() first.');
    }
  }
}

/**
 * Mock PostgreSQL Client
 * In production, replace with: import pkg from 'pg'; const { Pool } = pkg;
 */
class PostgreSQLClient {
  private data: Map<number, any> = new Map();
  private config: StorageAdapterConfig;
  private connected: boolean = false;

  constructor(config: StorageAdapterConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.data.clear();
    this.connected = false;
  }

  async query(sql: string, values?: any[]): Promise<QueryResult> {
    if (!this.connected) {
      throw new Error('Not connected to database');
    }

    // Parse SQL command
    const command = sql.trim().split(' ')[0].toUpperCase();

    if (command === 'CREATE' || command === 'BEGIN' || command === 'COMMIT' || command === 'ROLLBACK' || command === 'TRUNCATE' || command === 'VACUUM' || command === 'ANALYZE') {
      return { rows: [], rowCount: 0 };
    }

    if (command === 'INSERT') {
      const port = values?.[0];
      if (this.data.has(port)) {
        return { rows: [], rowCount: 0 };
      }
      this.data.set(port, {
        port,
        reserved_at: values?.[1],
        metadata: values?.[2]
      });
      return { rows: [{ port }], rowCount: 1 };
    }

    if (command === 'DELETE') {
      if (sql.includes('WHERE port IN')) {
        const deleted: any[] = [];
        for (const port of values || []) {
          if (this.data.has(port)) {
            deleted.push({ port });
            this.data.delete(port);
          }
        }
        return { rows: deleted, rowCount: deleted.length };
      } else if (sql.includes('WHERE port =')) {
        const port = values?.[0];
        const deleted = this.data.delete(port);
        return { rows: deleted ? [{ port }] : [], rowCount: deleted ? 1 : 0 };
      } else if (sql.includes('WHERE expires_at')) {
        const now = values?.[0];
        const cutoffTime = values?.[1];
        const deleted: any[] = [];
        for (const [port, data] of this.data.entries()) {
          if ((data.expires_at && data.expires_at < now) || (!data.expires_at && data.reserved_at < cutoffTime)) {
            deleted.push({ port });
            this.data.delete(port);
          }
        }
        return { rows: deleted, rowCount: deleted.length };
      }
    }

    if (command === 'SELECT') {
      if (sql.includes('COUNT(*)')) {
        return { rows: [{ count: this.data.size }], rowCount: 1 };
      }

      if (sql.includes('WHERE port =')) {
        const port = values?.[0];
        const data = this.data.get(port);
        if (!data) {
          return { rows: [], rowCount: 0 };
        }

        if (sql.includes('SELECT 1')) {
          return { rows: [{ '?column?': 1 }], rowCount: 1 };
        }

        if (sql.includes('SELECT metadata')) {
          return { rows: [{ metadata: data.metadata }], rowCount: 1 };
        }

        if (sql.includes('SELECT *')) {
          return { rows: [data], rowCount: 1 };
        }
      }

      if (sql.includes('SELECT port FROM')) {
        const rows = Array.from(this.data.values()).map(d => ({ port: d.port })).sort((a, b) => a.port - b.port);
        return { rows, rowCount: rows.length };
      }

      if (sql.includes('generate_series')) {
        const start = values?.[0] || 0;
        const end = values?.[1] || 0;
        const reserved = new Set(Array.from(this.data.keys()));
        const available: any[] = [];
        for (let port = start; port <= end; port++) {
          if (!reserved.has(port)) {
            available.push({ port });
          }
        }
        return { rows: available, rowCount: available.length };
      }

      if (sql.includes('pg_total_relation_size')) {
        return { rows: [{ size: this.data.size * 100 }], rowCount: 1 };
      }
    }

    if (command === 'UPDATE') {
      const port = values?.[values.length - 1];
      const data = this.data.get(port);
      if (!data) {
        return { rows: [], rowCount: 0 };
      }

      if (sql.includes('expires_at')) {
        data.expires_at = values?.[0];
      }

      if (sql.includes('metadata')) {
        const newMetadata = values?.[0];
        data.metadata = newMetadata;
      }

      return { rows: [data], rowCount: 1 };
    }

    if (sql.includes('WITH available_port')) {
      const start = values?.[0];
      const end = values?.[1];
      const reservedAt = values?.[2];
      const metadata = values?.[3];

      for (let port = start; port <= end; port++) {
        if (!this.data.has(port)) {
          this.data.set(port, { port, reserved_at: reservedAt, metadata });
          return { rows: [{ port }], rowCount: 1 };
        }
      }
      return { rows: [], rowCount: 0 };
    }

    return { rows: [], rowCount: 0 };
  }
}

interface QueryResult {
  rows: any[];
  rowCount: number;
}

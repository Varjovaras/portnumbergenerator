/**
 * gRPC Service Implementation for Port Number Generator
 *
 * This file provides a gRPC service interface for port number operations.
 * In production, use @grpc/grpc-js and generate types from .proto files.
 */

export interface GrpcPortRequest {
  strategy?: string;
  min?: number;
  max?: number;
  seed?: string;
  metadata?: Record<string, any>;
}

export interface GrpcPortResponse {
  port: number;
  strategy: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface GrpcBatchPortRequest {
  count: number;
  strategy?: string;
  min?: number;
  max?: number;
  metadata?: Record<string, any>;
}

export interface GrpcBatchPortResponse {
  ports: number[];
  strategy: string;
  timestamp: number;
  count: number;
}

export interface GrpcPortAvailabilityRequest {
  port: number;
}

export interface GrpcPortAvailabilityResponse {
  port: number;
  available: boolean;
  reservedBy?: string;
  reservedAt?: number;
}

export interface GrpcReservePortRequest {
  port?: number;
  min?: number;
  max?: number;
  metadata?: Record<string, any>;
}

export interface GrpcReservePortResponse {
  success: boolean;
  port?: number;
  message?: string;
  expiresAt?: number;
}

export interface GrpcReleasePortRequest {
  port: number;
}

export interface GrpcReleasePortResponse {
  success: boolean;
  port: number;
  message?: string;
}

export interface GrpcHealthCheckRequest {
  service?: string;
}

export interface GrpcHealthCheckResponse {
  status: 'SERVING' | 'NOT_SERVING' | 'UNKNOWN';
  timestamp: number;
  uptime: number;
  version: string;
}

export interface GrpcStreamPortRequest {
  count: number;
  interval: number;
  strategy?: string;
}

export interface GrpcStreamPortResponse {
  port: number;
  sequence: number;
  timestamp: number;
}

/**
 * Mock gRPC Service Implementation
 * In production, replace with actual gRPC server implementation
 */
export class PortNumberGrpcService {
  private reservedPorts: Set<number> = new Set();
  private startTime: number = Date.now();

  constructor() {}

  /**
   * Generate a single port number
   */
  async generatePort(request: GrpcPortRequest): Promise<GrpcPortResponse> {
    const strategy = request.strategy || 'sequential';
    const min = request.min || 1024;
    const max = request.max || 65535;

    let port: number;

    switch (strategy) {
      case 'random':
        port = Math.floor(Math.random() * (max - min + 1)) + min;
        break;
      case 'fibonacci':
        port = this.generateFibonacciPort(min, max);
        break;
      case 'prime':
        port = this.generatePrimePort(min, max);
        break;
      default:
        port = this.generateSequentialPort(min, max);
    }

    return {
      port,
      strategy,
      timestamp: Date.now(),
      metadata: request.metadata
    };
  }

  /**
   * Generate multiple port numbers
   */
  async generatePorts(request: GrpcBatchPortRequest): Promise<GrpcBatchPortResponse> {
    const strategy = request.strategy || 'sequential';
    const min = request.min || 1024;
    const max = request.max || 65535;
    const count = Math.min(request.count, 1000); // Limit batch size

    const ports: number[] = [];

    for (let i = 0; i < count; i++) {
      const portResponse = await this.generatePort({ strategy, min, max });
      ports.push(portResponse.port);
    }

    return {
      ports,
      strategy,
      timestamp: Date.now(),
      count: ports.length
    };
  }

  /**
   * Check port availability
   */
  async checkAvailability(request: GrpcPortAvailabilityRequest): Promise<GrpcPortAvailabilityResponse> {
    const available = !this.reservedPorts.has(request.port);

    return {
      port: request.port,
      available,
      reservedBy: available ? undefined : 'system',
      reservedAt: available ? undefined : Date.now()
    };
  }

  /**
   * Reserve a port
   */
  async reservePort(request: GrpcReservePortRequest): Promise<GrpcReservePortResponse> {
    let port: number;

    if (request.port !== undefined) {
      // Reserve specific port
      port = request.port;
      if (this.reservedPorts.has(port)) {
        return {
          success: false,
          message: `Port ${port} is already reserved`
        };
      }
    } else {
      // Find and reserve available port in range
      const min = request.min || 1024;
      const max = request.max || 65535;

      for (let p = min; p <= max; p++) {
        if (!this.reservedPorts.has(p)) {
          port = p;
          break;
        }
      }

      if (!port!) {
        return {
          success: false,
          message: 'No available ports in range'
        };
      }
    }

    this.reservedPorts.add(port);

    return {
      success: true,
      port,
      message: 'Port reserved successfully',
      expiresAt: Date.now() + 3600000 // 1 hour
    };
  }

  /**
   * Release a port
   */
  async releasePort(request: GrpcReleasePortRequest): Promise<GrpcReleasePortResponse> {
    const released = this.reservedPorts.delete(request.port);

    return {
      success: released,
      port: request.port,
      message: released ? 'Port released successfully' : 'Port was not reserved'
    };
  }

  /**
   * Health check
   */
  async healthCheck(request: GrpcHealthCheckRequest): Promise<GrpcHealthCheckResponse> {
    return {
      status: 'SERVING',
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      version: '8.0.0'
    };
  }

  /**
   * Stream port numbers (server-side streaming)
   */
  async *streamPorts(request: GrpcStreamPortRequest): AsyncGenerator<GrpcStreamPortResponse> {
    const count = Math.min(request.count, 10000);
    const interval = Math.max(request.interval, 10);
    const strategy = request.strategy || 'sequential';

    for (let i = 0; i < count; i++) {
      const portResponse = await this.generatePort({ strategy });

      yield {
        port: portResponse.port,
        sequence: i + 1,
        timestamp: Date.now()
      };

      // Delay between emissions
      if (i < count - 1) {
        await this.delay(interval);
      }
    }
  }

  private generateSequentialPort(min: number, max: number): number {
    return min + (Date.now() % (max - min + 1));
  }

  private generateFibonacciPort(min: number, max: number): number {
    let a = 0, b = 1;
    while (b < min) {
      [a, b] = [b, a + b];
    }
    while (b < max) {
      if (b >= min) {
        return b;
      }
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
      if (isPrime(port)) {
        return port;
      }
    }

    return min;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * gRPC Server Mock
 */
export class GrpcServer {
  private service: PortNumberGrpcService;
  private running: boolean = false;
  private port: number;

  constructor(port: number = 50051) {
    this.service = new PortNumberGrpcService();
    this.port = port;
  }

  async start(): Promise<void> {
    if (this.running) {
      throw new Error('Server is already running');
    }

    console.log(`gRPC server starting on port ${this.port}...`);

    // In production, use @grpc/grpc-js:
    // const server = new grpc.Server();
    // server.addService(PortNumberService, this.service);
    // server.bindAsync(`0.0.0.0:${this.port}`, grpc.ServerCredentials.createInsecure(), ...);

    this.running = true;
    console.log(`gRPC server listening on 0.0.0.0:${this.port}`);
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    console.log('Stopping gRPC server...');
    this.running = false;
    console.log('gRPC server stopped');
  }

  isRunning(): boolean {
    return this.running;
  }

  getService(): PortNumberGrpcService {
    return this.service;
  }
}

/**
 * gRPC Client Mock
 */
export class GrpcClient {
  private serverAddress: string;

  constructor(serverAddress: string = 'localhost:50051') {
    this.serverAddress = serverAddress;
  }

  async generatePort(request: GrpcPortRequest): Promise<GrpcPortResponse> {
    // In production, use actual gRPC client call
    console.log(`[gRPC Client] Calling generatePort on ${this.serverAddress}`);

    // Mock response
    return {
      port: Math.floor(Math.random() * 64512) + 1024,
      strategy: request.strategy || 'random',
      timestamp: Date.now()
    };
  }

  async generatePorts(request: GrpcBatchPortRequest): Promise<GrpcBatchPortResponse> {
    console.log(`[gRPC Client] Calling generatePorts on ${this.serverAddress}`);

    const ports = Array.from({ length: request.count }, () =>
      Math.floor(Math.random() * 64512) + 1024
    );

    return {
      ports,
      strategy: request.strategy || 'random',
      timestamp: Date.now(),
      count: ports.length
    };
  }

  async checkAvailability(request: GrpcPortAvailabilityRequest): Promise<GrpcPortAvailabilityResponse> {
    console.log(`[gRPC Client] Calling checkAvailability on ${this.serverAddress}`);

    return {
      port: request.port,
      available: Math.random() > 0.3
    };
  }

  async reservePort(request: GrpcReservePortRequest): Promise<GrpcReservePortResponse> {
    console.log(`[gRPC Client] Calling reservePort on ${this.serverAddress}`);

    return {
      success: true,
      port: request.port || Math.floor(Math.random() * 64512) + 1024,
      message: 'Port reserved successfully'
    };
  }

  async releasePort(request: GrpcReleasePortRequest): Promise<GrpcReleasePortResponse> {
    console.log(`[gRPC Client] Calling releasePort on ${this.serverAddress}`);

    return {
      success: true,
      port: request.port,
      message: 'Port released successfully'
    };
  }

  async healthCheck(request: GrpcHealthCheckRequest = {}): Promise<GrpcHealthCheckResponse> {
    console.log(`[gRPC Client] Calling healthCheck on ${this.serverAddress}`);

    return {
      status: 'SERVING',
      timestamp: Date.now(),
      uptime: 3600000,
      version: '8.0.0'
    };
  }

  close(): void {
    console.log(`[gRPC Client] Closing connection to ${this.serverAddress}`);
  }
}

// Export singleton instances
export const grpcServer = new GrpcServer();
export const grpcClient = new GrpcClient();

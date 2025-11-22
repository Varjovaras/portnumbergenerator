/**
 * @fileoverview Default Port Service Implementation
 * @module application/services/implementations
 * @description
 * Concrete implementation of IPortService that provides production-ready
 * port number management functionality with validation, reservation, and
 * availability checking.
 *
 * @author PortNumberGenerator Engineering Team
 * @version 7.0.0
 * @since Phase 7
 */

import type {
  IPortService,
  PortConfiguration,
  PortValidationResult,
  PortMetadata,
} from '../interfaces/IPortService.interface.js';
import { PortNumbers } from '../../legacy/PortNumbers.class.js';

/**
 * Default port service implementation
 *
 * This service provides a complete implementation of the IPortService interface,
 * integrating with the legacy PortNumbers class while adding modern async/await
 * patterns, validation, and resource management.
 *
 * @class DefaultPortService
 * @implements {IPortService}
 * @example
 * ```typescript
 * const service = new DefaultPortService();
 * const frontendPort = await service.generateFrontendPort();
 * const isValid = await service.validatePort(frontendPort);
 * ```
 */
export class DefaultPortService implements IPortService {
  /**
   * Reserved ports registry
   */
  private readonly reservedPorts: Map<number, PortMetadata>;

  /**
   * Default configuration
   */
  private readonly defaultConfig: Required<PortConfiguration>;

  /**
   * Minimum privileged port number
   */
  private static readonly PRIVILEGED_PORT_THRESHOLD = 1024;

  /**
   * Well-known reserved ports (system ports)
   */
  private static readonly WELL_KNOWN_PORTS = new Set([
    20, 21, 22, 23, 25, 53, 80, 110, 143, 443, 465, 587, 993, 995, 3306, 5432, 6379, 27017,
  ]);

  /**
   * Create a new default port service
   *
   * @param config - Optional default configuration
   */
  constructor(config?: PortConfiguration) {
    this.reservedPorts = new Map();
    this.defaultConfig = {
      minPort: config?.minPort ?? 1024,
      maxPort: config?.maxPort ?? 65535,
      allowPrivileged: config?.allowPrivileged ?? false,
      seed: config?.seed ?? 0,
    };
  }

  /**
   * @inheritdoc
   */
  async generateFrontendPort(config?: PortConfiguration): Promise<number> {
    const effectiveConfig = this.mergeConfig(config);
    const port = PortNumbers.frontendPortNumber();

    // Validate generated port against configuration
    const validation = await this.validatePort(port, effectiveConfig);
    if (!validation.isValid) {
      if (validation.suggestedPort !== undefined) {
        return validation.suggestedPort;
      }
      throw new Error(`Generated frontend port ${port} is invalid: ${validation.error}`);
    }

    return port;
  }

  /**
   * @inheritdoc
   */
  async generateBackendPort(config?: PortConfiguration): Promise<number> {
    const effectiveConfig = this.mergeConfig(config);
    const port = PortNumbers.backendPortNumber();

    // Validate generated port against configuration
    const validation = await this.validatePort(port, effectiveConfig);
    if (!validation.isValid) {
      if (validation.suggestedPort !== undefined) {
        return validation.suggestedPort;
      }
      throw new Error(`Generated backend port ${port} is invalid: ${validation.error}`);
    }

    return port;
  }

  /**
   * @inheritdoc
   */
  async generateCustomPort(
    seed: string | number,
    config?: PortConfiguration,
  ): Promise<number> {
    const effectiveConfig = this.mergeConfig(config);

    // Generate port from seed using legacy system
    const numericSeed = typeof seed === 'string' ? this.hashString(seed) : seed;
    const port = this.generateFromSeed(numericSeed, effectiveConfig);

    // Validate generated port
    const validation = await this.validatePort(port, effectiveConfig);
    if (!validation.isValid) {
      if (validation.suggestedPort !== undefined) {
        return validation.suggestedPort;
      }
      throw new Error(`Generated custom port ${port} is invalid: ${validation.error}`);
    }

    return port;
  }

  /**
   * @inheritdoc
   */
  async validatePort(
    port: number,
    config?: PortConfiguration,
  ): Promise<PortValidationResult> {
    const effectiveConfig = this.mergeConfig(config);

    // Check if port is a valid number
    if (!Number.isInteger(port) || port < 0) {
      return {
        isValid: false,
        error: 'Port must be a positive integer',
      };
    }

    // Check if port is in valid range
    if (port < 1 || port > 65535) {
      return {
        isValid: false,
        error: 'Port must be between 1 and 65535',
      };
    }

    // Check privileged ports
    if (port < DefaultPortService.PRIVILEGED_PORT_THRESHOLD && !effectiveConfig.allowPrivileged) {
      const suggestedPort = await this.findAvailablePort(
        effectiveConfig.minPort,
        effectiveConfig.maxPort,
      );
      return {
        isValid: false,
        error: `Port ${port} is privileged (< 1024) and not allowed`,
        suggestedPort,
      };
    }

    // Check well-known ports
    if (DefaultPortService.WELL_KNOWN_PORTS.has(port)) {
      return {
        isValid: false,
        error: `Port ${port} is a well-known system port`,
        suggestedPort: await this.findAvailablePort(
          effectiveConfig.minPort,
          effectiveConfig.maxPort,
        ),
      };
    }

    // Check configured range
    if (port < effectiveConfig.minPort || port > effectiveConfig.maxPort) {
      return {
        isValid: false,
        error: `Port ${port} is outside configured range [${effectiveConfig.minPort}, ${effectiveConfig.maxPort}]`,
        suggestedPort: await this.findAvailablePort(
          effectiveConfig.minPort,
          effectiveConfig.maxPort,
        ),
      };
    }

    return { isValid: true };
  }

  /**
   * @inheritdoc
   */
  async isPortAvailable(port: number): Promise<boolean> {
    // Check if port is reserved in our registry
    if (this.reservedPorts.has(port)) {
      return false;
    }

    // Check well-known ports
    if (DefaultPortService.WELL_KNOWN_PORTS.has(port)) {
      return false;
    }

    // In a real implementation, you would check OS-level port availability
    // For now, we'll just return true if not in our reserved set
    return true;
  }

  /**
   * @inheritdoc
   */
  async getPortMetadata(port: number): Promise<PortMetadata> {
    const metadata = this.reservedPorts.get(port);
    if (!metadata) {
      throw new Error(`Port ${port} not found in registry`);
    }
    return metadata;
  }

  /**
   * @inheritdoc
   */
  async reservePort(port: number, metadata?: Record<string, unknown>): Promise<boolean> {
    // Check if already reserved
    if (this.reservedPorts.has(port)) {
      throw new Error(`Port ${port} is already reserved`);
    }

    // Validate port
    const validation = await this.validatePort(port);
    if (!validation.isValid) {
      throw new Error(`Cannot reserve invalid port ${port}: ${validation.error}`);
    }

    // Reserve the port
    this.reservedPorts.set(port, {
      port,
      category: 'custom',
      generatedAt: new Date(),
      isInUse: true,
      metadata: metadata ?? {},
    });

    return true;
  }

  /**
   * @inheritdoc
   */
  async releasePort(port: number): Promise<boolean> {
    if (!this.reservedPorts.has(port)) {
      throw new Error(`Port ${port} is not reserved`);
    }

    this.reservedPorts.delete(port);
    return true;
  }

  /**
   * @inheritdoc
   */
  async getReservedPorts(): Promise<readonly number[]> {
    return Array.from(this.reservedPorts.keys()).sort((a, b) => a - b);
  }

  /**
   * @inheritdoc
   */
  async findAvailablePort(minPort: number, maxPort: number): Promise<number> {
    // Validate range
    if (minPort < 1 || maxPort > 65535 || minPort >= maxPort) {
      throw new Error(`Invalid port range [${minPort}, ${maxPort}]`);
    }

    // Try to find an available port in the range
    const maxAttempts = Math.min(maxPort - minPort + 1, 1000);
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const port = minPort + Math.floor(Math.random() * (maxPort - minPort + 1));

      if (await this.isPortAvailable(port)) {
        const validation = await this.validatePort(port, {
          minPort,
          maxPort,
          allowPrivileged: this.defaultConfig.allowPrivileged,
        });

        if (validation.isValid) {
          return port;
        }
      }
    }

    throw new Error(`No available ports found in range [${minPort}, ${maxPort}]`);
  }

  /**
   * @inheritdoc
   */
  async batchGeneratePorts(
    count: number,
    config?: PortConfiguration,
  ): Promise<readonly number[]> {
    if (count < 1) {
      throw new Error('Count must be at least 1');
    }

    if (count > 100) {
      throw new Error('Cannot generate more than 100 ports at once');
    }

    const effectiveConfig = this.mergeConfig(config);
    const ports: number[] = [];
    const usedPorts = new Set<number>();

    for (let i = 0; i < count; i++) {
      let port: number;
      let attempts = 0;
      const maxAttempts = 100;

      do {
        port = await this.findAvailablePort(effectiveConfig.minPort, effectiveConfig.maxPort);
        attempts++;

        if (attempts >= maxAttempts) {
          throw new Error(`Failed to generate ${count} unique ports after ${maxAttempts} attempts`);
        }
      } while (usedPorts.has(port));

      usedPorts.add(port);
      ports.push(port);
    }

    return ports;
  }

  /**
   * Merge configuration with defaults
   *
   * @param config - User-provided configuration
   * @returns Merged configuration
   */
  private mergeConfig(config?: PortConfiguration): Required<PortConfiguration> {
    return {
      minPort: config?.minPort ?? this.defaultConfig.minPort,
      maxPort: config?.maxPort ?? this.defaultConfig.maxPort,
      allowPrivileged: config?.allowPrivileged ?? this.defaultConfig.allowPrivileged,
      seed: config?.seed ?? this.defaultConfig.seed,
    };
  }

  /**
   * Hash a string to a numeric seed
   *
   * @param str - String to hash
   * @returns Numeric hash value
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Generate a port number from a numeric seed
   *
   * @param seed - Numeric seed
   * @param config - Port configuration
   * @returns Generated port number
   */
  private generateFromSeed(seed: number, config: Required<PortConfiguration>): number {
    const range = config.maxPort - config.minPort + 1;
    return config.minPort + (Math.abs(seed) % range);
  }

  /**
   * Get service statistics
   *
   * @returns Service statistics
   */
  getStatistics(): {
    reservedCount: number;
    availableRange: [number, number];
    configuration: Required<PortConfiguration>;
  } {
    return {
      reservedCount: this.reservedPorts.size,
      availableRange: [this.defaultConfig.minPort, this.defaultConfig.maxPort],
      configuration: { ...this.defaultConfig },
    };
  }

  /**
   * Clear all reservations
   *
   * @returns Number of ports released
   */
  clearReservations(): number {
    const count = this.reservedPorts.size;
    this.reservedPorts.clear();
    return count;
  }
}

/**
 * Create a default port service instance
 *
 * @param config - Optional configuration
 * @returns New DefaultPortService instance
 */
export function createPortService(config?: PortConfiguration): IPortService {
  return new DefaultPortService(config);
}

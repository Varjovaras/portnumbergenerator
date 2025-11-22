/**
 * @fileoverview Port Service Interface
 * @module application/services/interfaces
 * @description
 * Defines the contract for port number management services in the application layer.
 * This interface abstracts the business logic for port number operations, enabling
 * dependency inversion and testability.
 *
 * @author PortNumberGenerator Engineering Team
 * @version 7.0.0
 * @since Phase 7
 */

/**
 * Port configuration options
 */
export interface PortConfiguration {
  /**
   * Minimum allowed port number
   * @default 1024
   */
  readonly minPort?: number;

  /**
   * Maximum allowed port number
   * @default 65535
   */
  readonly maxPort?: number;

  /**
   * Whether to allow privileged ports (< 1024)
   * @default false
   */
  readonly allowPrivileged?: boolean;

  /**
   * Custom seed for deterministic generation
   */
  readonly seed?: number;
}

/**
 * Port validation result
 */
export interface PortValidationResult {
  /**
   * Whether the port is valid
   */
  readonly isValid: boolean;

  /**
   * Validation error message (if invalid)
   */
  readonly error?: string;

  /**
   * Suggested alternative port (if invalid)
   */
  readonly suggestedPort?: number;
}

/**
 * Port metadata
 */
export interface PortMetadata {
  /**
   * Port number
   */
  readonly port: number;

  /**
   * Port category (frontend, backend, database, etc.)
   */
  readonly category: string;

  /**
   * When the port was generated
   */
  readonly generatedAt: Date;

  /**
   * Whether the port is in use
   */
  readonly isInUse: boolean;

  /**
   * Additional metadata
   */
  readonly metadata: Record<string, unknown>;
}

/**
 * Port service interface
 *
 * Provides a unified interface for all port number operations in the application.
 * Implementations of this interface should handle business logic, validation,
 * and coordination with domain and infrastructure layers.
 *
 * @interface IPortService
 * @example
 * ```typescript
 * class PortService implements IPortService {
 *   async generateFrontendPort(config?: PortConfiguration): Promise<number> {
 *     // Implementation
 *     return 6969;
 *   }
 * }
 * ```
 */
export interface IPortService {
  /**
   * Generate a frontend port number
   *
   * @param config - Optional port configuration
   * @returns Promise resolving to the generated port number
   * @throws {Error} If port generation fails
   */
  generateFrontendPort(config?: PortConfiguration): Promise<number>;

  /**
   * Generate a backend port number
   *
   * @param config - Optional port configuration
   * @returns Promise resolving to the generated port number
   * @throws {Error} If port generation fails
   */
  generateBackendPort(config?: PortConfiguration): Promise<number>;

  /**
   * Generate a custom port number based on input
   *
   * @param seed - Seed value for generation
   * @param config - Optional port configuration
   * @returns Promise resolving to the generated port number
   * @throws {Error} If port generation fails
   */
  generateCustomPort(seed: string | number, config?: PortConfiguration): Promise<number>;

  /**
   * Validate a port number
   *
   * @param port - Port number to validate
   * @param config - Optional validation configuration
   * @returns Promise resolving to validation result
   */
  validatePort(port: number, config?: PortConfiguration): Promise<PortValidationResult>;

  /**
   * Check if a port is available (not in use)
   *
   * @param port - Port number to check
   * @returns Promise resolving to true if available, false otherwise
   */
  isPortAvailable(port: number): Promise<boolean>;

  /**
   * Get metadata for a port number
   *
   * @param port - Port number
   * @returns Promise resolving to port metadata
   * @throws {Error} If port not found
   */
  getPortMetadata(port: number): Promise<PortMetadata>;

  /**
   * Reserve a port number
   *
   * @param port - Port number to reserve
   * @param metadata - Optional metadata to associate
   * @returns Promise resolving to true if reserved successfully
   * @throws {Error} If port already reserved
   */
  reservePort(port: number, metadata?: Record<string, unknown>): Promise<boolean>;

  /**
   * Release a reserved port number
   *
   * @param port - Port number to release
   * @returns Promise resolving to true if released successfully
   * @throws {Error} If port not reserved
   */
  releasePort(port: number): Promise<boolean>;

  /**
   * Get all reserved ports
   *
   * @returns Promise resolving to array of reserved port numbers
   */
  getReservedPorts(): Promise<readonly number[]>;

  /**
   * Find an available port in a range
   *
   * @param minPort - Minimum port in range
   * @param maxPort - Maximum port in range
   * @returns Promise resolving to available port number
   * @throws {Error} If no ports available in range
   */
  findAvailablePort(minPort: number, maxPort: number): Promise<number>;

  /**
   * Batch generate multiple port numbers
   *
   * @param count - Number of ports to generate
   * @param config - Optional port configuration
   * @returns Promise resolving to array of port numbers
   * @throws {Error} If generation fails
   */
  batchGeneratePorts(count: number, config?: PortConfiguration): Promise<readonly number[]>;
}

/**
 * Port service factory interface
 */
export interface IPortServiceFactory {
  /**
   * Create a new port service instance
   *
   * @param config - Optional default configuration
   * @returns Port service instance
   */
  createPortService(config?: PortConfiguration): IPortService;
}

/**
 * Type guard to check if an object implements IPortService
 *
 * @param obj - Object to check
 * @returns True if object implements IPortService
 */
export function isPortService(obj: unknown): obj is IPortService {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'generateFrontendPort' in obj &&
    'generateBackendPort' in obj &&
    'validatePort' in obj &&
    typeof (obj as IPortService).generateFrontendPort === 'function' &&
    typeof (obj as IPortService).generateBackendPort === 'function' &&
    typeof (obj as IPortService).validatePort === 'function'
  );
}

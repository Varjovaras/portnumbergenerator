/**
 * @fileoverview IPortService Interface Definition
 *
 * Defines the core contract for port generation services in the Port Number Generator
 * enterprise application. This interface establishes the fundamental service-level
 * abstraction that enables polymorphic port allocation strategies while maintaining
 * strict type safety and architectural boundaries.
 *
 * This interface represents a critical component of the Abstract Factory pattern
 * implementation, providing the product interface that concrete factories will
 * instantiate through their respective creation methods.
 *
 * @module application/factories/interfaces/IPortService
 * @category Application Layer - Service Interfaces
 * @subcategory Factory Pattern - Product Abstraction
 *
 * @version 1.0.0
 * @since Phase 4 - Factory Pattern Extraction
 *
 * @remarks
 * Architecture Considerations:
 * - Service Layer Abstraction: Encapsulates port generation logic
 * - Context-Driven Execution: Requires IPortContext for all operations
 * - Stateless Contract: Implementations should be stateless and thread-safe
 * - Polymorphic Behavior: Enables multiple algorithms (VM-based, rule-based, etc.)
 *
 * Design Patterns:
 * - Abstract Factory: Product interface in the factory hierarchy
 * - Strategy: Enables runtime algorithm selection
 * - Dependency Inversion: High-level modules depend on this abstraction
 *
 * Quality Attributes:
 * - Maintainability: Single responsibility (port generation only)
 * - Extensibility: New implementations can be added without modification
 * - Testability: Interface enables easy mocking and testing
 * - Performance: Contract allows for caching and optimization strategies
 *
 * @example
 * ```typescript
 * // Implementing a custom port service
 * class CustomPortService implements IPortService {
 *   getPort(context: IPortContext): number {
 *     return this.calculatePort(context);
 *   }
 *
 *   private calculatePort(context: IPortContext): number {
 *     // Custom implementation logic
 *     return 8080;
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using the service interface polymorphically
 * function provisionPort(service: IPortService, ctx: IPortContext): number {
 *   const port = service.getPort(ctx);
 *   console.log(`Provisioned port: ${port}`);
 *   return port;
 * }
 * ```
 *
 * @see {@link IPortServiceFactory} For the factory interface that creates services
 * @see {@link IPortContext} For the context parameter type
 * @see {@link VMPortServiceImpl} For the primary concrete implementation
 *
 * @author Enterprise Architecture Team
 * @copyright 2024 Port Number Generator Corp.
 * @license MIT
 */

import type { IPortContext } from '../../../core/domain/context';

/**
 * Core service interface for port number generation.
 *
 * Defines the primary contract that all port generation services must implement
 * to participate in the enterprise port allocation system. This interface enables
 * the Abstract Factory pattern by providing a stable product abstraction that
 * concrete factories can instantiate.
 *
 * @interface IPortService
 * @category Service Interface
 * @public
 *
 * @remarks
 * Implementation Requirements:
 * - MUST return a valid port number (1-65535 range recommended)
 * - SHOULD be stateless and reentrant
 * - SHOULD NOT mutate the context parameter
 * - MAY throw exceptions for invalid contexts
 * - MAY implement caching for performance optimization
 *
 * Thread Safety:
 * - Implementations SHOULD be thread-safe
 * - Implementations SHOULD NOT maintain mutable state
 * - Concurrent getPort() calls MUST be safe
 *
 * Performance Considerations:
 * - getPort() SHOULD complete in < 100ms for typical cases
 * - Implementations MAY cache compiled programs or results
 * - Implementations SHOULD handle high-frequency calls efficiently
 *
 * Error Handling:
 * - Invalid context SHOULD throw Error with descriptive message
 * - Internal failures SHOULD throw Error (not return sentinel values)
 * - Validation errors SHOULD be distinct from calculation errors
 *
 * @example
 * ```typescript
 * // Basic implementation
 * class SimplePortService implements IPortService {
 *   getPort(context: IPortContext): number {
 *     if (!context.requestor) {
 *       throw new Error('Invalid context: requestor required');
 *     }
 *     return this.hash(context.requestor) % 65535 + 1;
 *   }
 *
 *   private hash(str: string): number {
 *     let hash = 0;
 *     for (let i = 0; i < str.length; i++) {
 *       hash = ((hash << 5) - hash) + str.charCodeAt(i);
 *       hash = hash & hash; // Convert to 32-bit integer
 *     }
 *     return Math.abs(hash);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Advanced implementation with caching
 * class CachedPortService implements IPortService {
 *   private cache = new Map<string, number>();
 *
 *   getPort(context: IPortContext): number {
 *     const key = context.requestor;
 *
 *     if (this.cache.has(key)) {
 *       return this.cache.get(key)!;
 *     }
 *
 *     const port = this.calculatePort(context);
 *     this.cache.set(key, port);
 *     return port;
 *   }
 *
 *   private calculatePort(context: IPortContext): number {
 *     // Expensive calculation here
 *     return 8080;
 *   }
 * }
 * ```
 */
export interface IPortService {
	/**
	 * Generates a port number based on the provided context.
	 *
	 * This is the primary operation of the port service, responsible for calculating
	 * or determining an appropriate port number based on the contextual information
	 * provided by the caller. The implementation strategy is left to concrete classes,
	 * allowing for various algorithms (VM-based, rule-based, ML-based, etc.).
	 *
	 * @param {IPortContext} context - The context containing request metadata and requestor information
	 *
	 * @returns {number} A valid port number for the given context
	 *
	 * @throws {Error} If the context is invalid or port generation fails
	 * @throws {Error} If the requestor is missing or malformed
	 * @throws {Error} If internal calculation logic encounters an error
	 *
	 * @remarks
	 * Behavioral Contract:
	 * - MUST return the same port for the same requestor (deterministic)
	 * - SHOULD return different ports for different requestors
	 * - MUST NOT modify the input context
	 * - SHOULD complete quickly (< 100ms recommended)
	 *
	 * Validation:
	 * - Context parameter MUST NOT be null or undefined
	 * - context.requestor MUST be a non-empty string
	 * - Returned port SHOULD be in range [1, 65535]
	 *
	 * Side Effects:
	 * - MAY log diagnostic information
	 * - MAY update internal caches (if implementation uses caching)
	 * - MUST NOT modify external state (databases, files, etc.)
	 * - MUST NOT make network calls (synchronous interface)
	 *
	 * @example
	 * ```typescript
	 * const service: IPortService = factory.createService();
	 * const context = new PortContext('frontend', { version: '1.0' });
	 * const port = service.getPort(context);
	 * console.log(`Allocated port: ${port}`);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Error handling
	 * try {
	 *   const port = service.getPort(context);
	 *   deployService(port);
	 * } catch (error) {
	 *   console.error('Port allocation failed:', error);
	 *   fallbackPort();
	 * }
	 * ```
	 *
	 * @public
	 * @since 1.0.0
	 */
	getPort(context: IPortContext): number;
}

/**
 * Type guard to check if an object implements IPortService.
 *
 * Provides runtime type checking to verify that an object conforms to the
 * IPortService interface contract. Useful for defensive programming and
 * dynamic service discovery scenarios.
 *
 * @param {unknown} obj - The object to check
 * @returns {boolean} True if the object implements IPortService
 *
 * @example
 * ```typescript
 * if (isPortService(someObject)) {
 *   const port = someObject.getPort(context);
 * }
 * ```
 *
 * @public
 * @category Type Guards
 */
export function isPortService(obj: unknown): obj is IPortService {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		'getPort' in obj &&
		typeof (obj as IPortService).getPort === 'function'
	);
}

/**
 * Module metadata for documentation and tooling.
 *
 * @internal
 * @readonly
 */
export const MODULE_METADATA = {
	name: 'IPortService',
	version: '1.0.0',
	phase: 4,
	category: 'Application Layer - Factory Interfaces',
	description: 'Core service interface for port number generation',
	dependencies: ['IPortContext'],
	exports: ['IPortService', 'isPortService'],
	stability: 'stable' as const,
	documentation: 'Enterprise-grade service interface with comprehensive contracts',
} as const;

/**
 * @fileoverview IPortServiceFactory Interface Definition
 *
 * Defines the factory interface responsible for creating IPortService instances
 * within the Port Number Generator enterprise application. This interface represents
 * the Abstract Factory pattern's factory abstraction, enabling polymorphic service
 * instantiation while maintaining loose coupling and high cohesion.
 *
 * This interface is a cornerstone of the dependency inversion principle implementation,
 * allowing high-level orchestration logic to depend on abstractions rather than
 * concrete implementations. It enables runtime service selection, configuration-driven
 * instantiation, and seamless substitution of service implementations.
 *
 * @module application/factories/interfaces/IPortServiceFactory
 * @category Application Layer - Factory Interfaces
 * @subcategory Factory Pattern - Factory Abstraction
 *
 * @version 1.0.0
 * @since Phase 4 - Factory Pattern Extraction
 *
 * @remarks
 * Architecture Considerations:
 * - Factory Method Pattern: Primary abstraction for service creation
 * - Abstract Factory Pattern: Part of the larger factory hierarchy
 * - Inversion of Control: Enables dependency injection frameworks
 * - Configuration-Driven: Supports environment-specific factory selection
 *
 * Design Patterns:
 * - Factory Method: createService() is the factory method
 * - Abstract Factory: Can be extended to create families of related objects
 * - Singleton: Often used with singleton factory providers
 * - Strategy: Enables strategy selection at factory level
 *
 * Quality Attributes:
 * - Flexibility: New factories can be added without modifying consumers
 * - Testability: Enables easy mocking of service creation
 * - Maintainability: Centralizes service instantiation logic
 * - Scalability: Supports multiple service implementations
 *
 * Usage Scenarios:
 * - Environment-specific service selection (dev, staging, prod)
 * - A/B testing different service implementations
 * - Feature flag-driven service instantiation
 * - Plugin architecture with dynamic service loading
 *
 * @example
 * ```typescript
 * // Implementing a custom factory
 * class ProductionPortServiceFactory implements IPortServiceFactory {
 *   createService(): IPortService {
 *     const service = new OptimizedVMPortService();
 *     service.configure({ cacheSize: 10000 });
 *     return service;
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using the factory interface
 * function orchestratePortAllocation(factory: IPortServiceFactory): void {
 *   const service = factory.createService();
 *   const context = new PortContext('backend');
 *   const port = service.getPort(context);
 *   console.log(`Allocated: ${port}`);
 * }
 * ```
 *
 * @see {@link IPortService} For the service interface that factories create
 * @see {@link IAbstractFactoryFactory} For the meta-factory interface
 * @see {@link EnterprisePortServiceFactory} For the primary concrete implementation
 *
 * @author Enterprise Architecture Team
 * @copyright 2024 Port Number Generator Corp.
 * @license MIT
 */

import type { IPortService } from './IPortService.interface';

/**
 * Factory interface for creating IPortService instances.
 *
 * Defines the contract for all port service factories in the enterprise system.
 * This interface enables the Abstract Factory pattern by providing a standard
 * creation method that concrete factories must implement. Consumers of this
 * interface can create services without knowing the concrete service class,
 * promoting loose coupling and enhancing system flexibility.
 *
 * @interface IPortServiceFactory
 * @category Factory Interface
 * @public
 *
 * @remarks
 * Implementation Requirements:
 * - MUST return a fully initialized IPortService instance
 * - SHOULD ensure the service is ready for immediate use
 * - MAY cache service instances (if implementing singleton pattern)
 * - MAY configure the service based on environment or settings
 * - MUST NOT return null or undefined
 *
 * Lifecycle Considerations:
 * - Factory instances SHOULD be long-lived (often singletons)
 * - Created services MAY be short-lived or long-lived (implementation-dependent)
 * - Factories SHOULD manage service initialization complexity
 * - Factories MAY implement pooling or caching strategies
 *
 * Thread Safety:
 * - createService() SHOULD be thread-safe
 * - Multiple concurrent calls MUST be supported
 * - Implementations SHOULD NOT maintain mutable state
 * - Service caching (if used) MUST be thread-safe
 *
 * Performance Considerations:
 * - createService() SHOULD be lightweight (< 10ms recommended)
 * - Heavy initialization SHOULD be deferred to first use
 * - Factories MAY implement lazy initialization patterns
 * - Caching strategies MAY be used to amortize creation cost
 *
 * Error Handling:
 * - Creation failures SHOULD throw descriptive errors
 * - Configuration errors SHOULD be detected early
 * - Missing dependencies SHOULD throw Error
 * - Invalid state SHOULD prevent service creation
 *
 * @example
 * ```typescript
 * // Simple factory implementation
 * class BasicPortServiceFactory implements IPortServiceFactory {
 *   createService(): IPortService {
 *     return new VMPortServiceImpl();
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Factory with configuration
 * class ConfigurablePortServiceFactory implements IPortServiceFactory {
 *   constructor(private config: FactoryConfig) {}
 *
 *   createService(): IPortService {
 *     if (this.config.useCache) {
 *       return new CachedVMPortService(this.config.cacheSize);
 *     }
 *     return new VMPortServiceImpl();
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Factory with service caching (singleton pattern)
 * class SingletonPortServiceFactory implements IPortServiceFactory {
 *   private instance?: IPortService;
 *
 *   createService(): IPortService {
 *     if (!this.instance) {
 *       this.instance = new VMPortServiceImpl();
 *     }
 *     return this.instance;
 *   }
 * }
 * ```
 */
export interface IPortServiceFactory {
	/**
	 * Creates and returns a new IPortService instance.
	 *
	 * This is the factory method that instantiates and configures port services.
	 * The specific concrete class returned is determined by the factory implementation,
	 * enabling polymorphic service creation and runtime strategy selection.
	 *
	 * @returns {IPortService} A fully initialized port service instance
	 *
	 * @throws {Error} If service creation fails due to missing dependencies
	 * @throws {Error} If configuration is invalid or incomplete
	 * @throws {Error} If initialization of internal components fails
	 *
	 * @remarks
	 * Behavioral Contract:
	 * - MUST return a non-null, fully initialized service
	 * - Service MUST be immediately usable (ready state)
	 * - SHOULD NOT perform expensive operations synchronously
	 * - MAY return cached instances (implementation-dependent)
	 *
	 * Service Lifecycle:
	 * - Returned service MAY be singleton or transient
	 * - Caller SHOULD NOT assume service reuse across calls
	 * - Service disposal (if needed) is caller's responsibility
	 * - Factory SHOULD NOT maintain references to created services
	 *
	 * Initialization:
	 * - All required dependencies MUST be resolved
	 * - Configuration MUST be applied before return
	 * - Validation SHOULD occur during creation
	 * - Lazy initialization MAY be deferred to first use
	 *
	 * Side Effects:
	 * - MAY log service creation events
	 * - MAY update internal metrics or counters
	 * - SHOULD NOT modify global state
	 * - SHOULD NOT make network calls
	 *
	 * @example
	 * ```typescript
	 * const factory: IPortServiceFactory = getFactory();
	 * const service = factory.createService();
	 * const context = new PortContext('api-gateway');
	 * const port = service.getPort(context);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Error handling during service creation
	 * try {
	 *   const service = factory.createService();
	 *   return service;
	 * } catch (error) {
	 *   console.error('Service creation failed:', error);
	 *   return fallbackService;
	 * }
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Creating multiple services (if factory allows)
	 * const services = Array.from({ length: 5 }, () =>
	 *   factory.createService()
	 * );
	 * ```
	 *
	 * @public
	 * @since 1.0.0
	 */
	createService(): IPortService;
}

/**
 * Type guard to check if an object implements IPortServiceFactory.
 *
 * Provides runtime validation that an object conforms to the IPortServiceFactory
 * interface contract. Essential for dynamic factory discovery, plugin systems,
 * and defensive programming practices.
 *
 * @param {unknown} obj - The object to check
 * @returns {boolean} True if the object implements IPortServiceFactory
 *
 * @remarks
 * This type guard performs structural validation to ensure the object has
 * the required createService method. It does not validate the method's
 * implementation correctness or return type at runtime.
 *
 * @example
 * ```typescript
 * if (isPortServiceFactory(someObject)) {
 *   const service = someObject.createService();
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Validating a plugin
 * function registerFactory(plugin: unknown): void {
 *   if (!isPortServiceFactory(plugin)) {
 *     throw new Error('Invalid factory plugin');
 *   }
 *   factoryRegistry.register(plugin);
 * }
 * ```
 *
 * @public
 * @category Type Guards
 */
export function isPortServiceFactory(obj: unknown): obj is IPortServiceFactory {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		'createService' in obj &&
		typeof (obj as IPortServiceFactory).createService === 'function'
	);
}

/**
 * Module metadata for documentation and tooling.
 *
 * Provides comprehensive information about this module for documentation
 * generation, dependency analysis, and build tooling.
 *
 * @internal
 * @readonly
 */
export const MODULE_METADATA = {
	name: 'IPortServiceFactory',
	version: '1.0.0',
	phase: 4,
	category: 'Application Layer - Factory Interfaces',
	description: 'Factory interface for creating IPortService instances',
	dependencies: ['IPortService'],
	exports: ['IPortServiceFactory', 'isPortServiceFactory'],
	stability: 'stable' as const,
	documentation: 'Enterprise-grade factory interface enabling polymorphic service creation',
	patterns: ['Factory Method', 'Abstract Factory', 'Dependency Inversion'],
} as const;

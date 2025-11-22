/**
 * @fileoverview Factories Module Barrel Export
 *
 * Centralized export point for the complete factory pattern implementation in the
 * Port Number Generator enterprise application. This barrel module aggregates all
 * factory-related components including interfaces, implementations, and providers,
 * providing a comprehensive, unified access point to the entire Abstract Factory
 * hierarchy.
 *
 * This module serves as the primary entry point for consuming factory functionality,
 * enabling clients to access interfaces for type definitions, concrete implementations
 * for direct instantiation, and singleton providers for managed access. It encapsulates
 * the complete multi-tiered factory architecture in a single, well-documented module.
 *
 * @module application/factories
 * @category Application Layer - Factory Pattern
 * @subcategory Barrel Exports - Main Module
 *
 * @version 1.0.0
 * @since Phase 4 - Factory Pattern Extraction
 *
 * @remarks
 * Architecture Considerations:
 * - Unified Entry Point: Complete factory hierarchy through single import
 * - Layered Exports: Interfaces, implementations, and providers clearly separated
 * - Abstract Factory Pattern: Full five-level hierarchy implementation
 * - Enterprise Architecture: Production-grade factory abstraction
 *
 * Design Patterns:
 * - Abstract Factory: Multi-tiered factory hierarchy
 * - Factory Method: Factory creation methods at each level
 * - Singleton: Provider-level singleton for global access
 * - Facade: Simplified access to complex factory hierarchy
 * - Strategy: Pluggable port generation algorithms
 *
 * Quality Attributes:
 * - Maintainability: Clear separation of concerns across layers
 * - Usability: Single import point for all factory needs
 * - Flexibility: Easy to extend with new implementations
 * - Testability: Well-defined interfaces enable comprehensive testing
 *
 * Factory Hierarchy (5 Levels):
 * Level 5: EnterpriseFactoryProvider - Singleton provider (global access)
 * Level 4: EnterpriseFactoryFactory - Meta-factory (creates factories)
 * Level 3: EnterprisePortServiceFactory - Factory (creates services)
 * Level 2: VMPortServiceImpl - Service (generates ports)
 * Level 1: Port Number - Product (integer result)
 *
 * Module Structure:
 * - interfaces/     Interface definitions (IPortService, IPortServiceFactory, etc.)
 * - implementations/ Concrete classes (VMPortServiceImpl, factories)
 * - providers/      Singleton providers (EnterpriseFactoryProvider)
 * - index.ts        This file (barrel export)
 *
 * Usage Patterns:
 * - Provider Pattern: Use EnterpriseFactoryProvider.getInstance()
 * - Direct Instantiation: Use concrete classes for testing
 * - Dependency Injection: Inject interfaces for loose coupling
 * - Configuration: Select implementations at runtime
 *
 * @example
 * ```typescript
 * // Provider pattern (recommended for production)
 * import { EnterpriseFactoryProvider } from './application/factories';
 * const provider = EnterpriseFactoryProvider.getInstance();
 * const factory = provider.getFactory();
 * const service = factory.createService();
 * const port = service.getPort(context);
 * ```
 *
 * @example
 * ```typescript
 * // Direct instantiation (useful for testing)
 * import { VMPortServiceImpl } from './application/factories';
 * const service = new VMPortServiceImpl();
 * const port = service.getPort(context);
 * ```
 *
 * @example
 * ```typescript
 * // Interface-based dependency injection
 * import type { IPortService } from './application/factories';
 * class MyService {
 *   constructor(private portService: IPortService) {}
 *   allocate(): number {
 *     return this.portService.getPort(this.createContext());
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Fluent API usage
 * import { EnterpriseFactoryProvider } from './application/factories';
 * const port = EnterpriseFactoryProvider.getInstance()
 *   .getFactory()
 *   .createService()
 *   .getPort(new PortContext('web-server'));
 * ```
 *
 * @see {@link IPortService} For the service interface
 * @see {@link IPortServiceFactory} For the factory interface
 * @see {@link IAbstractFactoryFactory} For the meta-factory interface
 * @see {@link VMPortServiceImpl} For the VM-based service implementation
 * @see {@link EnterpriseFactoryProvider} For the singleton provider
 *
 * @author Enterprise Architecture Team
 * @copyright 2024 Port Number Generator Corp.
 * @license MIT
 */

// Import for helper functions at the bottom of this file
import { EnterpriseFactoryProvider as _EnterpriseFactoryProvider } from './providers';

// =============================================================================
// INTERFACES - Type Definitions
// =============================================================================

/**
 * Core factory interfaces for type safety and abstraction.
 * Import these for type annotations and dependency injection.
 */
export type {
	IPortService,
	IPortServiceFactory,
	IAbstractFactoryFactory,
} from './interfaces';

/**
 * Type guards for runtime interface validation.
 * Useful for dynamic type checking and plugin systems.
 */
export {
	isPortService,
	isPortServiceFactory,
	isAbstractFactoryFactory,
} from './interfaces';

/**
 * Interface module metadata and utility types.
 */
export {
	INTERFACES_MODULE_METADATA,
	type FactoryInterface,
	type FactoryProduct,
} from './interfaces';

// =============================================================================
// IMPLEMENTATIONS - Concrete Classes
// =============================================================================

/**
 * Concrete factory implementations for direct instantiation.
 * Import these for testing or when bypassing the provider pattern.
 */
export {
	VMPortServiceImpl,
	EnterprisePortServiceFactory,
	EnterpriseFactoryFactory,
} from './implementations';

/**
 * Implementation metadata for documentation and tooling.
 */
export {
	VM_PORT_SERVICE_METADATA,
	ENTERPRISE_PORT_SERVICE_FACTORY_METADATA,
	ENTERPRISE_FACTORY_FACTORY_METADATA,
	IMPLEMENTATIONS_MODULE_METADATA,
	type FactoryImplementation,
} from './implementations';

// =============================================================================
// PROVIDERS - Singleton Access Points
// =============================================================================

/**
 * Singleton provider for managed factory hierarchy access.
 * This is the recommended entry point for production usage.
 */
export {
	EnterpriseFactoryProvider,
} from './providers';

/**
 * Provider metadata and utility types.
 */
export {
	ENTERPRISE_FACTORY_PROVIDER_METADATA,
	PROVIDERS_MODULE_METADATA,
	type FactoryProvider,
} from './providers';

// =============================================================================
// MODULE METADATA
// =============================================================================

/**
 * Comprehensive metadata for the factories module.
 *
 * Provides detailed information about the complete factory pattern implementation,
 * including hierarchy structure, dependencies, exports, and architectural
 * characteristics for documentation generation, dependency analysis, and tooling.
 *
 * @constant
 * @readonly
 */
export const FACTORIES_MODULE_METADATA = {
	name: 'Factories',
	version: '1.0.0',
	phase: 4,
	category: 'Application Layer - Factory Pattern',
	description: 'Complete Abstract Factory pattern implementation with five-level hierarchy',

	exports: {
		interfaces: [
			'IPortService',
			'IPortServiceFactory',
			'IAbstractFactoryFactory',
		],
		implementations: [
			'VMPortServiceImpl',
			'EnterprisePortServiceFactory',
			'EnterpriseFactoryFactory',
		],
		providers: [
			'EnterpriseFactoryProvider',
		],
		typeGuards: [
			'isPortService',
			'isPortServiceFactory',
			'isAbstractFactoryFactory',
		],
		types: [
			'FactoryInterface',
			'FactoryProduct',
			'FactoryImplementation',
			'FactoryProvider',
		],
		metadata: [
			'INTERFACES_MODULE_METADATA',
			'IMPLEMENTATIONS_MODULE_METADATA',
			'PROVIDERS_MODULE_METADATA',
			'FACTORIES_MODULE_METADATA',
		],
	},

	dependencies: {
		internal: [
			'IPortContext',
			'PortVM',
			'PortCompiler',
		],
		external: [],
	},

	structure: {
		interfaces: 3,
		implementations: 3,
		providers: 1,
		barrels: 4,
		totalFiles: 11,
	},

	hierarchy: {
		levels: 5,
		description: 'Five-level Abstract Factory hierarchy',
		level5: 'EnterpriseFactoryProvider (Singleton Provider)',
		level4: 'EnterpriseFactoryFactory (Meta-Factory)',
		level3: 'EnterprisePortServiceFactory (Factory)',
		level2: 'VMPortServiceImpl (Service)',
		level1: 'Port Number (Product)',
	},

	patterns: [
		'Abstract Factory',
		'Factory Method',
		'Singleton',
		'Strategy',
		'Facade',
		'Lazy Initialization',
		'Dependency Inversion',
	],

	stability: 'stable' as const,

	documentation: {
		coverage: 'comprehensive',
		style: 'enterprise',
		examples: true,
		diagrams: false,
		jsdoc: true,
	},

	quality: {
		typeChecking: 'strict',
		nullSafety: true,
		immutability: 'encouraged',
		testability: 'high',
		complexity: 'medium',
	},

	usage: {
		recommended: 'EnterpriseFactoryProvider.getInstance()',
		importStyle: 'named',
		examples: [
			"import { EnterpriseFactoryProvider } from './factories'",
			"import { IPortService, VMPortServiceImpl } from './factories'",
			"import { isPortService } from './factories'",
		],
	},

	performance: {
		providerAccess: '<1ms',
		factoryCreation: '<1ms',
		serviceCreation: '<1ms',
		portGeneration: '<1-100ms (VM execution)',
		memoryFootprint: '~1KB per service',
	},

	migration: {
		phase: 4,
		status: 'complete',
		from: 'Monolithic index.ts',
		to: 'Modular factory hierarchy',
		preservesBackwardCompatibility: true,
	},
} as const;

/**
 * Convenience function to get a ready-to-use port service.
 *
 * Provides a simple helper that traverses the entire factory hierarchy and
 * returns a ready-to-use port service. Useful for quick setup and testing.
 *
 * @returns {IPortService} A fully initialized port service
 *
 * @example
 * ```typescript
 * import { getPortService } from './application/factories';
 * const service = getPortService();
 * const port = service.getPort(context);
 * ```
 *
 * @public
 */
export function getPortService(): import('./interfaces').IPortService {
	return _EnterpriseFactoryProvider.getInstance()
		.getFactory()
		.createService();
}

/**
 * Convenience function to get a factory instance.
 *
 * Provides a simple helper that accesses the provider and returns a factory.
 * Useful for scenarios where you need to create multiple services.
 *
 * @returns {IPortServiceFactory} A fully initialized port service factory
 *
 * @example
 * ```typescript
 * import { getFactory } from './application/factories';
 * const factory = getFactory();
 * const service1 = factory.createService();
 * const service2 = factory.createService();
 * ```
 *
 * @public
 */
export function getFactory(): import('./interfaces').IPortServiceFactory {
	return _EnterpriseFactoryProvider.getInstance().getFactory();
}

/**
 * Convenience function to reset the factory provider for testing.
 *
 * Provides a simple helper to reset the singleton provider, useful for
 * test isolation and cleanup.
 *
 * @returns {void}
 *
 * @example
 * ```typescript
 * import { resetFactoryProvider } from './application/factories';
 * afterEach(() => {
 *   resetFactoryProvider();
 * });
 * ```
 *
 * @public
 * @testingOnly
 */
export function resetFactoryProvider(): void {
	_EnterpriseFactoryProvider.resetInstance();
}

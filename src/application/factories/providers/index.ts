/**
 * @fileoverview Factory Providers Barrel Export
 *
 * Centralized export point for all factory provider classes in the Port Number
 * Generator enterprise application. This barrel module aggregates the singleton
 * provider implementations that manage the lifecycle and access to the factory
 * hierarchy, serving as the top-level entry point for the Abstract Factory pattern.
 *
 * This module provides a single, cohesive import point for all factory providers,
 * simplifying dependency management and promoting architectural clarity. It enables
 * consumers to import provider classes through a single statement while maintaining
 * clear separation between providers, factories, and services.
 *
 * @module application/factories/providers
 * @category Application Layer - Factory Providers
 * @subcategory Barrel Exports
 *
 * @version 1.0.0
 * @since Phase 4 - Factory Pattern Extraction
 *
 * @remarks
 * Architecture Considerations:
 * - Single Import Point: All factory providers through one module
 * - Global Access Point: Singleton providers for factory hierarchy
 * - Lifecycle Management: Provider-managed factory instantiation
 * - Documentation Hub: Comprehensive provider documentation aggregation
 *
 * Design Patterns:
 * - Singleton: Provider instances ensure single global access point
 * - Facade: Simplifies provider access through unified export
 * - Registry: Global registry of factory providers
 * - Lazy Initialization: Providers defer initialization until first use
 *
 * Quality Attributes:
 * - Maintainability: Centralized provider management
 * - Usability: Simplified import statements
 * - Consistency: Uniform provider access patterns
 * - Testability: Provider reset capabilities for testing
 *
 * Export Structure:
 * - EnterpriseFactoryProvider: Singleton provider for factory hierarchy
 * - Metadata: Module information for tooling
 *
 * @example
 * ```typescript
 * // Import factory provider
 * import {
 *   EnterpriseFactoryProvider
 * } from './application/factories/providers';
 * ```
 *
 * @example
 * ```typescript
 * // Using the singleton provider
 * import { EnterpriseFactoryProvider } from './application/factories/providers';
 * const provider = EnterpriseFactoryProvider.getInstance();
 * const factory = provider.getFactory();
 * ```
 *
 * @author Enterprise Architecture Team
 * @copyright 2024 Port Number Generator Corp.
 * @license MIT
 */

// =============================================================================
// CORE PROVIDERS
// =============================================================================

/**
 * Singleton provider for accessing the enterprise factory hierarchy.
 * Provides global access point to meta-factory and factory instances.
 */
export {
	EnterpriseFactoryProvider,
	MODULE_METADATA as ENTERPRISE_FACTORY_PROVIDER_METADATA,
} from './EnterpriseFactoryProvider.class';

// =============================================================================
// MODULE METADATA
// =============================================================================

/**
 * Comprehensive metadata for the factory providers module.
 *
 * Provides detailed information about the module's structure, dependencies,
 * exports, and architectural characteristics for documentation generation,
 * dependency analysis, and build tooling.
 *
 * @constant
 * @readonly
 */
export const PROVIDERS_MODULE_METADATA = {
	name: 'Factory Providers',
	version: '1.0.0',
	phase: 4,
	category: 'Application Layer - Factory Providers',
	description: 'Barrel export for all factory provider classes',

	exports: {
		classes: [
			'EnterpriseFactoryProvider',
		],
		metadata: [
			'ENTERPRISE_FACTORY_PROVIDER_METADATA',
			'PROVIDERS_MODULE_METADATA',
		],
	},

	dependencies: {
		internal: [
			'IAbstractFactoryFactory',
			'IPortServiceFactory',
			'EnterpriseFactoryFactory',
		],
		external: [],
	},

	files: {
		total: 2,
		providers: 1,
		barrels: 1,
	},

	patterns: [
		'Singleton',
		'Facade',
		'Lazy Initialization',
		'Registry',
	],

	stability: 'stable' as const,

	documentation: {
		coverage: 'comprehensive',
		style: 'enterprise',
		examples: true,
		diagrams: false,
	},

	quality: {
		typeChecking: 'strict',
		nullSafety: true,
		immutability: 'encouraged',
		testability: 'high',
	},

	usage: {
		importStyle: 'named',
		recommendedImports: [
			"import { EnterpriseFactoryProvider } from './factories/providers'",
		],
		examples: [
			'const provider = EnterpriseFactoryProvider.getInstance();',
			'const factory = provider.getFactory();',
			'const service = factory.createService();',
		],
	},

	hierarchy: {
		level: 5,
		description: 'Top-level entry point for factory hierarchy',
		manages: 'EnterpriseFactoryFactory (meta-factory)',
	},
} as const;

/**
 * Convenience type for accessing all factory provider classes as a union.
 * Useful for generic programming and type utilities.
 *
 * @example
 * ```typescript
 * function isFactoryProvider(obj: unknown): obj is FactoryProvider {
 *   return obj instanceof EnterpriseFactoryProvider;
 * }
 * ```
 */
export type FactoryProvider = import('./EnterpriseFactoryProvider.class').EnterpriseFactoryProvider;

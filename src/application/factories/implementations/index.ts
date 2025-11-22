/**
 * @fileoverview Factory Implementations Barrel Export
 *
 * Centralized export point for all concrete factory implementation classes in the
 * Port Number Generator enterprise application. This barrel module aggregates
 * the concrete implementations of factory interfaces, including port services,
 * factories, and meta-factories that form the Abstract Factory pattern hierarchy.
 *
 * This module provides a single, cohesive import point for all factory implementations,
 * simplifying dependency management and promoting architectural clarity. It enables
 * consumers to import concrete classes through a single statement while maintaining
 * clear boundaries between interfaces and implementations.
 *
 * @module application/factories/implementations
 * @category Application Layer - Factory Implementations
 * @subcategory Barrel Exports
 *
 * @version 1.0.0
 * @since Phase 4 - Factory Pattern Extraction
 *
 * @remarks
 * Architecture Considerations:
 * - Single Import Point: All factory implementations through one module
 * - Clear Separation: Implementations separate from interfaces
 * - Concrete Classes: Runtime implementations with full functionality
 * - Documentation Hub: Comprehensive implementation documentation aggregation
 *
 * Design Patterns:
 * - Facade: Simplifies implementation access through unified export
 * - Abstract Factory: Concrete implementations of factory hierarchy
 * - Factory Method: Concrete factory implementations
 * - Strategy: Concrete port service strategies
 *
 * Quality Attributes:
 * - Maintainability: Centralized implementation management
 * - Usability: Simplified import statements
 * - Clarity: Single source of truth for factory implementations
 * - Consistency: Uniform implementation access patterns
 *
 * Export Structure:
 * - VMPortServiceImpl: VM-based port service implementation
 * - EnterprisePortServiceFactory: Standard factory implementation
 * - EnterpriseFactoryFactory: Meta-factory implementation
 * - Metadata: Module information for tooling
 *
 * @example
 * ```typescript
 * // Import all factory implementations
 * import {
 *   VMPortServiceImpl,
 *   EnterprisePortServiceFactory,
 *   EnterpriseFactoryFactory
 * } from './application/factories/implementations';
 * ```
 *
 * @example
 * ```typescript
 * // Direct instantiation
 * import { VMPortServiceImpl } from './application/factories/implementations';
 * const service = new VMPortServiceImpl();
 * ```
 *
 * @author Enterprise Architecture Team
 * @copyright 2024 Port Number Generator Corp.
 * @license MIT
 */

// =============================================================================
// CORE IMPLEMENTATIONS
// =============================================================================

/**
 * VM-based implementation of IPortService.
 * Uses PortVM and PortCompiler for port generation.
 */
export {
	VMPortServiceImpl,
	MODULE_METADATA as VM_PORT_SERVICE_METADATA,
} from './VMPortServiceImpl.class';

/**
 * Enterprise factory for creating VMPortServiceImpl instances.
 * Standard production-grade factory implementation.
 */
export {
	EnterprisePortServiceFactory,
	MODULE_METADATA as ENTERPRISE_PORT_SERVICE_FACTORY_METADATA,
} from './EnterprisePortServiceFactory.class';

/**
 * Meta-factory for creating EnterprisePortServiceFactory instances.
 * Apex of the Abstract Factory hierarchy.
 */
export {
	EnterpriseFactoryFactory,
	MODULE_METADATA as ENTERPRISE_FACTORY_FACTORY_METADATA,
} from './EnterpriseFactoryFactory.class';

// =============================================================================
// MODULE METADATA
// =============================================================================

/**
 * Comprehensive metadata for the factory implementations module.
 *
 * Provides detailed information about the module's structure, dependencies,
 * exports, and architectural characteristics for documentation generation,
 * dependency analysis, and build tooling.
 *
 * @constant
 * @readonly
 */
export const IMPLEMENTATIONS_MODULE_METADATA = {
	name: 'Factory Implementations',
	version: '1.0.0',
	phase: 4,
	category: 'Application Layer - Factory Implementations',
	description: 'Barrel export for all concrete factory implementation classes',

	exports: {
		classes: [
			'VMPortServiceImpl',
			'EnterprisePortServiceFactory',
			'EnterpriseFactoryFactory',
		],
		metadata: [
			'VM_PORT_SERVICE_METADATA',
			'ENTERPRISE_PORT_SERVICE_FACTORY_METADATA',
			'ENTERPRISE_FACTORY_FACTORY_METADATA',
			'IMPLEMENTATIONS_MODULE_METADATA',
		],
	},

	dependencies: {
		internal: [
			'IPortService',
			'IPortServiceFactory',
			'IAbstractFactoryFactory',
			'IPortContext',
			'PortVM',
			'PortCompiler',
		],
		external: [],
	},

	files: {
		total: 4,
		implementations: 3,
		barrels: 1,
	},

	patterns: [
		'Abstract Factory',
		'Factory Method',
		'Strategy',
		'Simple Factory',
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
			"import { VMPortServiceImpl } from './factories/implementations'",
			"import { EnterprisePortServiceFactory } from './factories/implementations'",
			"import { EnterpriseFactoryFactory } from './factories/implementations'",
		],
	},

	hierarchy: {
		level1: 'VMPortServiceImpl - Port Service Implementation',
		level2: 'EnterprisePortServiceFactory - Factory Implementation',
		level3: 'EnterpriseFactoryFactory - Meta-Factory Implementation',
	},
} as const;

/**
 * Convenience type for accessing all factory implementation classes as a union.
 * Useful for generic programming and type utilities.
 *
 * @example
 * ```typescript
 * function isFactoryImplementation(obj: unknown): obj is FactoryImplementation {
 *   return obj instanceof VMPortServiceImpl ||
 *          obj instanceof EnterprisePortServiceFactory ||
 *          obj instanceof EnterpriseFactoryFactory;
 * }
 * ```
 */
export type FactoryImplementation =
	| import('./VMPortServiceImpl.class').VMPortServiceImpl
	| import('./EnterprisePortServiceFactory.class').EnterprisePortServiceFactory
	| import('./EnterpriseFactoryFactory.class').EnterpriseFactoryFactory;

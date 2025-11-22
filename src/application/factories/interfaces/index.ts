/**
 * @fileoverview Factory Interfaces Barrel Export
 *
 * Centralized export point for all factory-related interface definitions in the
 * Port Number Generator enterprise application. This barrel module aggregates
 * the core factory abstraction interfaces that form the foundation of the
 * Abstract Factory pattern implementation.
 *
 * This module provides a single, cohesive import point for all factory interfaces,
 * simplifying dependency management and promoting architectural clarity. It enables
 * consumers to import all factory contracts through a single statement while
 * maintaining clear boundaries between interface definitions and implementations.
 *
 * @module application/factories/interfaces
 * @category Application Layer - Factory Interfaces
 * @subcategory Barrel Exports
 *
 * @version 1.0.0
 * @since Phase 4 - Factory Pattern Extraction
 *
 * @remarks
 * Architecture Considerations:
 * - Single Import Point: All factory interfaces through one module
 * - Clear Separation: Interfaces separate from implementations
 * - Type Safety: Pure TypeScript interfaces without runtime overhead
 * - Documentation Hub: Comprehensive interface documentation aggregation
 *
 * Design Patterns:
 * - Facade: Simplifies interface access through unified export
 * - Abstract Factory: Core interfaces for factory hierarchy
 * - Dependency Inversion: Abstractions for loose coupling
 *
 * Quality Attributes:
 * - Maintainability: Centralized interface management
 * - Usability: Simplified import statements
 * - Clarity: Single source of truth for factory contracts
 * - Consistency: Uniform interface access patterns
 *
 * Export Structure:
 * - IPortService: Core service interface for port generation
 * - IPortServiceFactory: Factory interface for creating services
 * - IAbstractFactoryFactory: Meta-factory interface for creating factories
 * - Type Guards: Runtime type validation utilities
 * - Metadata: Module information for tooling
 *
 * @example
 * ```typescript
 * // Import all factory interfaces
 * import {
 *   IPortService,
 *   IPortServiceFactory,
 *   IAbstractFactoryFactory
 * } from './application/factories/interfaces';
 * ```
 *
 * @example
 * ```typescript
 * // Import with type guards
 * import {
 *   IPortService,
 *   isPortService,
 *   isPortServiceFactory
 * } from './application/factories/interfaces';
 * ```
 *
 * @author Enterprise Architecture Team
 * @copyright 2024 Port Number Generator Corp.
 * @license MIT
 */

// =============================================================================
// CORE INTERFACES
// =============================================================================

/**
 * Core service interface for port number generation.
 * Defines the contract that all port services must implement.
 */
export type {
	IPortService,
} from './IPortService.interface';

/**
 * Factory interface for creating IPortService instances.
 * Enables polymorphic service creation through the Factory Method pattern.
 */
export type {
	IPortServiceFactory,
} from './IPortServiceFactory.interface';

/**
 * Meta-factory interface for creating IPortServiceFactory instances.
 * Represents the apex of the Abstract Factory hierarchy.
 */
export type {
	IAbstractFactoryFactory,
} from './IAbstractFactoryFactory.interface';

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Runtime type guard for IPortService interface validation.
 */
export {
	isPortService,
} from './IPortService.interface';

/**
 * Runtime type guard for IPortServiceFactory interface validation.
 */
export {
	isPortServiceFactory,
} from './IPortServiceFactory.interface';

/**
 * Runtime type guard for IAbstractFactoryFactory interface validation.
 */
export {
	isAbstractFactoryFactory,
} from './IAbstractFactoryFactory.interface';

// =============================================================================
// MODULE METADATA
// =============================================================================

/**
 * Comprehensive metadata for the factory interfaces module.
 *
 * Provides detailed information about the module's structure, dependencies,
 * exports, and architectural characteristics for documentation generation,
 * dependency analysis, and build tooling.
 *
 * @constant
 * @readonly
 */
export const INTERFACES_MODULE_METADATA = {
	name: 'Factory Interfaces',
	version: '1.0.0',
	phase: 4,
	category: 'Application Layer - Factory Interfaces',
	description: 'Barrel export for all factory-related interface definitions',

	exports: {
		interfaces: [
			'IPortService',
			'IPortServiceFactory',
			'IAbstractFactoryFactory',
		],
		typeGuards: [
			'isPortService',
			'isPortServiceFactory',
			'isAbstractFactoryFactory',
		],
		metadata: [
			'INTERFACES_MODULE_METADATA',
		],
	},

	dependencies: {
		internal: [
			'IPortContext',
		],
		external: [],
	},

	files: {
		total: 4,
		interfaces: 3,
		barrels: 1,
		implementations: 0,
	},

	patterns: [
		'Abstract Factory',
		'Factory Method',
		'Dependency Inversion',
		'Facade',
	],

	stability: 'stable' as const,

	documentation: {
		coverage: 'comprehensive',
		style: 'enterprise',
		examples: true,
		typeGuards: true,
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
			"import { IPortService, IPortServiceFactory } from './factories/interfaces'",
			"import { isPortService } from './factories/interfaces'",
		],
	},
} as const;

/**
 * Convenience type for accessing all factory interfaces as a union.
 * Useful for generic programming and type utilities.
 *
 * @example
 * ```typescript
 * function validateFactoryInterface(obj: unknown): obj is FactoryInterface {
 *   return isPortService(obj) ||
 *          isPortServiceFactory(obj) ||
 *          isAbstractFactoryFactory(obj);
 * }
 * ```
 */
export type FactoryInterface =
	| import('./IPortService.interface').IPortService
	| import('./IPortServiceFactory.interface').IPortServiceFactory
	| import('./IAbstractFactoryFactory.interface').IAbstractFactoryFactory;

/**
 * Utility type for factory method return types.
 * Enables generic factory programming patterns.
 *
 * @template T - The factory interface type
 */
export type FactoryProduct<T> =
	T extends import('./IAbstractFactoryFactory.interface').IAbstractFactoryFactory
		? import('./IPortServiceFactory.interface').IPortServiceFactory
		: T extends import('./IPortServiceFactory.interface').IPortServiceFactory
			? import('./IPortService.interface').IPortService
			: never;

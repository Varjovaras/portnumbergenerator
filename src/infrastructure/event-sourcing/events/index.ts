/**
 * @fileoverview Event Sourcing Events Module - Barrel Export
 *
 * This barrel export module provides a centralized entry point for all event-related
 * classes, interfaces, and utilities in our hilariously over-engineered Event Sourcing
 * infrastructure. By consolidating all event exports in a single location, we enable
 * consumers to import multiple event types with a single import statement, improving
 * developer ergonomics and reducing import statement verbosity.
 *
 * @module infrastructure/event-sourcing/events
 * @category Event Sourcing
 * @subcategory Barrel Exports
 * @since 1.0.0
 * @version 1.618.033
 *
 * @remarks
 * This module re-exports the following components:
 *
 * **Abstract Base Classes:**
 * - PortEvent: The abstract base class for all domain events
 *
 * **Concrete Event Implementations:**
 * - PortRequestedEvent: Represents the initiation of a port request
 * - PortCalculatedEvent: Represents the completion of port calculation
 * - PortValidatedEvent: Represents the completion of port validation
 * - PortDeliveredEvent: Represents the successful delivery of a port
 *
 * **Type Guards:**
 * - isPortRequestedEvent: Type guard for PortRequestedEvent
 * - isPortCalculatedEvent: Type guard for PortCalculatedEvent
 * - isPortValidatedEvent: Type guard for PortValidatedEvent
 * - isPortDeliveredEvent: Type guard for PortDeliveredEvent
 *
 * **Architectural Benefits:**
 *
 * 1. **Single Import Point**: Consumers can import all event types from one location
 * 2. **Namespace Management**: Prevents import path sprawl and reduces coupling
 * 3. **Refactoring Safety**: Internal restructuring doesn't affect consumers
 * 4. **Discoverability**: Developers can easily see all available event types
 * 5. **Tree-Shaking**: Modern bundlers can still eliminate unused exports
 *
 * @example
 * ```typescript
 * // Without barrel export (verbose, tightly coupled to structure)
 * import { PortEvent } from './base/PortEvent.abstract';
 * import { PortRequestedEvent } from './implementations/PortRequestedEvent.class';
 * import { PortCalculatedEvent } from './implementations/PortCalculatedEvent.class';
 * import { PortValidatedEvent } from './implementations/PortValidatedEvent.class';
 * import { PortDeliveredEvent } from './implementations/PortDeliveredEvent.class';
 * ```
 *
 * @example
 * ```typescript
 * // With barrel export (clean, decoupled from internal structure)
 * import {
 *   PortEvent,
 *   PortRequestedEvent,
 *   PortCalculatedEvent,
 *   PortValidatedEvent,
 *   PortDeliveredEvent,
 *   isPortRequestedEvent,
 *   isPortCalculatedEvent,
 * } from './events';
 * ```
 *
 * @example
 * ```typescript
 * // Typical usage in event handlers
 * import {
 *   PortEvent,
 *   PortRequestedEvent,
 *   isPortRequestedEvent,
 * } from '../../../infrastructure/event-sourcing/events';
 *
 * function handleEvent(event: PortEvent): void {
 *   if (isPortRequestedEvent(event)) {
 *     console.log(`Port requested by ${event.context.requestor}`);
 *   }
 * }
 * ```
 *
 * @author Enterprise Architecture Team
 * @copyright 2024 PortNumberGenerator™ Corporation
 * @license MIT (Enterprise Edition with Barrel Export Certification)
 */

// =============================================================================
// ABSTRACT BASE CLASSES
// =============================================================================

/**
 * Re-export the abstract PortEvent base class.
 *
 * This is the foundational abstract class that all concrete event implementations
 * must extend. It provides common properties (timestamp, eventId, aggregateId)
 * and utility methods (getAge, isExpired, toJSON, toString, etc.).
 */
export { PortEvent } from './base/PortEvent.abstract';

// =============================================================================
// CONCRETE EVENT IMPLEMENTATIONS
// =============================================================================

/**
 * Re-export PortRequestedEvent.
 *
 * Domain event representing the initiation of a port number request.
 * This is the FIRST event in the port allocation lifecycle.
 */
export { PortRequestedEvent } from './implementations/PortRequestedEvent.class';

/**
 * Re-export PortCalculatedEvent.
 *
 * Domain event representing the successful calculation of a port number.
 * This is the SECOND event in the port allocation lifecycle.
 */
export { PortCalculatedEvent } from './implementations/PortCalculatedEvent.class';

/**
 * Re-export PortValidatedEvent.
 *
 * Domain event representing the completion of port number validation.
 * This is the THIRD event in the port allocation lifecycle.
 */
export { PortValidatedEvent } from './implementations/PortValidatedEvent.class';

/**
 * Re-export PortDeliveredEvent.
 *
 * Domain event representing the successful delivery of a port number to the requestor.
 * This is the FOURTH and FINAL event in the port allocation lifecycle.
 */
export { PortDeliveredEvent } from './implementations/PortDeliveredEvent.class';

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Re-export type guard for PortRequestedEvent.
 *
 * Type-safe way to check if an event is an instance of PortRequestedEvent,
 * enabling TypeScript to narrow the type in conditional blocks.
 */
export { isPortRequestedEvent } from './implementations/PortRequestedEvent.class';

/**
 * Re-export type guard for PortCalculatedEvent.
 *
 * Type-safe way to check if an event is an instance of PortCalculatedEvent,
 * enabling TypeScript to narrow the type in conditional blocks.
 */
export { isPortCalculatedEvent } from './implementations/PortCalculatedEvent.class';

/**
 * Re-export type guard for PortValidatedEvent.
 *
 * Type-safe way to check if an event is an instance of PortValidatedEvent,
 * enabling TypeScript to narrow the type in conditional blocks.
 */
export { isPortValidatedEvent } from './implementations/PortValidatedEvent.class';

/**
 * Re-export type guard for PortDeliveredEvent.
 *
 * Type-safe way to check if an event is an instance of PortDeliveredEvent,
 * enabling TypeScript to narrow the type in conditional blocks.
 */
export { isPortDeliveredEvent } from './implementations/PortDeliveredEvent.class';

// =============================================================================
// MODULE METADATA
// =============================================================================

/**
 * Module metadata for introspection and debugging.
 *
 * This metadata object provides comprehensive information about the barrel
 * export module, including version, author, export inventory, and architectural
 * patterns. It's primarily used for documentation generation, runtime introspection,
 * and developer tooling.
 */
export const MODULE_METADATA = {
	/**
	 * Module name as it appears in import statements.
	 */
	name: 'infrastructure/event-sourcing/events',

	/**
	 * Semantic version following SemVer 2.0.0 specification.
	 */
	version: '1.0.0',

	/**
	 * Module author and maintainer information.
	 */
	author: 'Enterprise Architecture Team',

	/**
	 * List of exported classes from this barrel module.
	 */
	exports: [
		'PortEvent',
		'PortRequestedEvent',
		'PortCalculatedEvent',
		'PortValidatedEvent',
		'PortDeliveredEvent',
		'isPortRequestedEvent',
		'isPortCalculatedEvent',
		'isPortValidatedEvent',
		'isPortDeliveredEvent',
		'MODULE_METADATA',
	],

	/**
	 * Architectural patterns implemented in this module.
	 */
	patterns: [
		'Barrel Export Pattern',
		'Event Sourcing',
		'Domain Events',
		'Type Guards',
	],

	/**
	 * Module description for documentation generation.
	 */
	description: 'Barrel export module for all event-related classes and utilities in the Event Sourcing infrastructure',

	/**
	 * Count of exported symbols (excluding metadata).
	 */
	exportCount: 9,

	/**
	 * Event lifecycle phases represented by exports.
	 */
	lifecyclePhases: [
		'FIRST: PortRequestedEvent',
		'SECOND: PortCalculatedEvent',
		'THIRD: PortValidatedEvent',
		'FOURTH_AND_FINAL: PortDeliveredEvent',
	],

	/**
	 * Enterprise-grade over-engineering level (on a scale of 1-10).
	 */
	overEngineeringLevel: 8.5,
} as const;

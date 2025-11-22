/**
 * @fileoverview Event Sourcing Infrastructure Module - Main Barrel Export
 *
 * This barrel export module provides a centralized entry point for the entire
 * Event Sourcing infrastructure in our hilariously over-engineered Port Number
 * Generation system. By consolidating all event sourcing components into a single
 * export point, we enable consumers to import events, stores, and aggregates with
 * minimal import statement verbosity while maintaining clean architectural boundaries.
 *
 * @module infrastructure/event-sourcing
 * @category Event Sourcing
 * @subcategory Barrel Exports
 * @since 1.0.0
 * @version 2.71828.18284
 *
 * @remarks
 * This module re-exports the following component categories:
 *
 * **Events:**
 * - PortEvent (abstract base class)
 * - PortRequestedEvent (request initiation)
 * - PortCalculatedEvent (calculation completion)
 * - PortValidatedEvent (validation completion)
 * - PortDeliveredEvent (delivery completion)
 * - Type guards for all concrete event types
 *
 * **Event Store:**
 * - EventStore (singleton for event persistence)
 *
 * **Aggregates:**
 * - PortAggregate (aggregate root for port allocation domain)
 *
 * **Architectural Benefits:**
 *
 * 1. **Single Import Point**: Consumers can import all event sourcing components
 *    from one location, reducing coupling to internal module structure.
 *
 * 2. **Clear API Surface**: The barrel export defines the public API of the
 *    event sourcing infrastructure, hiding internal implementation details.
 *
 * 3. **Refactoring Safety**: Internal restructuring doesn't affect consumers
 *    as long as the barrel export remains stable.
 *
 * 4. **Discoverability**: Developers can easily discover all available event
 *    sourcing components by examining this single export file.
 *
 * 5. **Tree-Shaking**: Modern bundlers can eliminate unused exports, so there's
 *    no performance penalty for exporting everything.
 *
 * 6. **Namespace Management**: Prevents import path sprawl and maintains clean
 *    import statements throughout the codebase.
 *
 * **Usage Patterns:**
 *
 * Instead of importing from deep paths:
 * ```typescript
 * import { PortEvent } from './events/base/PortEvent.abstract';
 * import { PortRequestedEvent } from './events/implementations/PortRequestedEvent.class';
 * import { EventStore } from './store/EventStore.class';
 * import { PortAggregate } from './aggregates/PortAggregate.class';
 * ```
 *
 * Import from the barrel:
 * ```typescript
 * import {
 *   PortEvent,
 *   PortRequestedEvent,
 *   EventStore,
 *   PortAggregate,
 * } from './infrastructure/event-sourcing';
 * ```
 *
 * **Module Organization:**
 *
 * The event sourcing infrastructure is organized into three main submodules:
 *
 * 1. **events/**: Domain event classes and type guards
 * 2. **store/**: EventStore for event persistence
 * 3. **aggregates/**: PortAggregate for domain logic and state management
 *
 * Each submodule has its own barrel export, and this file re-exports from
 * those submodules to provide a unified API.
 *
 * @example
 * ```typescript
 * // Complete saga implementation using barrel imports
 * import {
 *   EventStore,
 *   PortAggregate,
 *   PortRequestedEvent,
 *   PortCalculatedEvent,
 *   PortValidatedEvent,
 *   PortDeliveredEvent,
 * } from './infrastructure/event-sourcing';
 * import { PortContext } from './core/domain/context';
 *
 * // Get event store singleton
 * const store = EventStore.getInstance();
 *
 * // Append events for a complete saga
 * const aggId = 'agg-123';
 * const context = new PortContext('frontend', {});
 *
 * store.append(new PortRequestedEvent(aggId, context));
 * store.append(new PortCalculatedEvent(aggId, 6969));
 * store.append(new PortValidatedEvent(aggId, true));
 * store.append(new PortDeliveredEvent(aggId, 6969));
 *
 * // Hydrate aggregate from event stream
 * const aggregate = new PortAggregate(aggId);
 * aggregate.hydrate();
 *
 * // Check completion
 * console.log(aggregate.isDelivered()); // true
 * ```
 *
 * @example
 * ```typescript
 * // Event pattern matching with type guards
 * import {
 *   EventStore,
 *   isPortRequestedEvent,
 *   isPortCalculatedEvent,
 *   isPortDeliveredEvent,
 * } from './infrastructure/event-sourcing';
 *
 * const events = EventStore.getInstance().getAllEvents();
 *
 * events.forEach(event => {
 *   if (isPortRequestedEvent(event)) {
 *     console.log(`Request from ${event.context.requestor}`);
 *   } else if (isPortCalculatedEvent(event)) {
 *     console.log(`Port calculated: ${event.port}`);
 *   } else if (isPortDeliveredEvent(event)) {
 *     console.log(`Port delivered: ${event.port}`);
 *   }
 * });
 * ```
 *
 * @see {@link PortEvent} for the event base class
 * @see {@link EventStore} for event persistence
 * @see {@link PortAggregate} for aggregate root
 *
 * @author Enterprise Architecture Team
 * @copyright 2024 PortNumberGenerator™ Corporation
 * @license MIT (Enterprise Edition with Event Sourcing Certification)
 */

// =============================================================================
// EVENTS - All domain event classes and type guards
// =============================================================================

/**
 * Re-export all event-related classes from the events submodule.
 *
 * This includes:
 * - PortEvent (abstract base class)
 * - All concrete event implementations (PortRequestedEvent, etc.)
 * - Type guard functions for runtime type checking
 */
export {
	// Abstract base class
	PortEvent,

	// Concrete event implementations
	PortRequestedEvent,
	PortCalculatedEvent,
	PortValidatedEvent,
	PortDeliveredEvent,

	// Type guards
	isPortRequestedEvent,
	isPortCalculatedEvent,
	isPortValidatedEvent,
	isPortDeliveredEvent,
} from './events';

// =============================================================================
// EVENT STORE - Singleton for event persistence
// =============================================================================

/**
 * Re-export the EventStore singleton class from the store submodule.
 *
 * The EventStore provides centralized event persistence and retrieval
 * functionality, backed by a DistributedDatabase with hash-based sharding.
 */
export { EventStore } from './store/EventStore.class';

// =============================================================================
// AGGREGATES - Domain aggregate roots
// =============================================================================

/**
 * Re-export the PortAggregate class from the aggregates submodule.
 *
 * The PortAggregate is the aggregate root for the port allocation domain,
 * maintaining state through event sourcing and providing business logic.
 */
export { PortAggregate } from './aggregates/PortAggregate.class';

// =============================================================================
// MODULE METADATA
// =============================================================================

/**
 * Module metadata for introspection and debugging.
 *
 * This metadata object provides comprehensive information about the event
 * sourcing infrastructure module, including version, components, architectural
 * patterns, and export inventory. Primarily used for documentation generation,
 * runtime introspection, and developer tooling.
 */
export const MODULE_METADATA = {
	/**
	 * Module name as it appears in import statements.
	 */
	name: 'infrastructure/event-sourcing',

	/**
	 * Semantic version following SemVer 2.0.0 specification.
	 */
	version: '1.0.0',

	/**
	 * Module author and maintainer information.
	 */
	author: 'Enterprise Architecture Team',

	/**
	 * List of all exported symbols from this barrel module.
	 */
	exports: [
		// Events
		'PortEvent',
		'PortRequestedEvent',
		'PortCalculatedEvent',
		'PortValidatedEvent',
		'PortDeliveredEvent',
		'isPortRequestedEvent',
		'isPortCalculatedEvent',
		'isPortValidatedEvent',
		'isPortDeliveredEvent',
		// Store
		'EventStore',
		// Aggregates
		'PortAggregate',
		// Metadata
		'MODULE_METADATA',
	],

	/**
	 * Submodules that comprise the event sourcing infrastructure.
	 */
	submodules: [
		'events',           // Domain event classes and type guards
		'store',            // EventStore for persistence
		'aggregates',       // PortAggregate for domain logic
	],

	/**
	 * Architectural patterns implemented in this module.
	 */
	patterns: [
		'Event Sourcing',
		'Domain-Driven Design (DDD)',
		'Aggregate Root Pattern',
		'Event Store Pattern',
		'Barrel Export Pattern',
		'Singleton Pattern (EventStore)',
		'Type Guards (runtime type checking)',
	],

	/**
	 * Module description for documentation generation.
	 */
	description:
		'Complete Event Sourcing infrastructure including domain events, event store, ' +
		'and aggregate roots for the Port Number Generation system',

	/**
	 * Key features provided by this module.
	 */
	features: [
		'Immutable event stream for audit trail',
		'Aggregate hydration via event replay',
		'Distributed event storage with sharding',
		'Type-safe event handling with TypeScript',
		'Complete saga lifecycle support (request → calculate → validate → deliver)',
		'Singleton EventStore for consistent state',
		'Enterprise-grade documentation and comments',
	],

	/**
	 * Event lifecycle phases supported by this module.
	 */
	lifecyclePhases: [
		'FIRST: PortRequestedEvent - Request initiation',
		'SECOND: PortCalculatedEvent - Calculation completion',
		'THIRD: PortValidatedEvent - Validation completion',
		'FOURTH_AND_FINAL: PortDeliveredEvent - Delivery completion',
	],

	/**
	 * Total count of exported symbols (excluding metadata).
	 */
	exportCount: 11,

	/**
	 * Total lines of code across all event sourcing components (approximate).
	 */
	linesOfCode: 5000,

	/**
	 * Enterprise-grade over-engineering level (on a scale of 1-10).
	 * We achieve maximum over-engineering across all dimensions.
	 */
	overEngineeringLevel: 10,

	/**
	 * Philosophical justification for this level of complexity.
	 */
	philosophy:
		'Why use a simple variable when you can have a distributed, event-sourced, ' +
		'saga-orchestrated, VM-compiled, enterprise-architected port number? ' +
		'Because sometimes, the journey is more important than the destination. ' +
		'And this journey has 5000+ lines of meticulously documented code.',
} as const;

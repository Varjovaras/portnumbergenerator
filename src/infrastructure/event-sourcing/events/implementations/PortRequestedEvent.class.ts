/**
 * @fileoverview Port Requested Event - Domain Event for Port Number Request Initiation
 *
 * This file contains the concrete implementation of the PortRequestedEvent class,
 * which represents the initial domain event that occurs when a port number is
 * requested within our hilariously over-engineered Port Number Generation system.
 * This event marks the beginning of the port allocation saga and carries the
 * complete request context, including requestor identity, temporal metadata,
 * and any additional contextual information required for downstream processing.
 *
 * @module infrastructure/event-sourcing/events/implementations
 * @category Event Sourcing
 * @subcategory Domain Events
 * @since 1.0.0
 * @version 2.71.828
 *
 * @remarks
 * The PortRequestedEvent is the first event in the port allocation lifecycle.
 * It encapsulates all information about the original request, including:
 *
 * 1. **Request Context**: The complete IPortContext object containing requestor
 *    identity, request ID, timestamp, and arbitrary metadata.
 *
 * 2. **Aggregate Correlation**: The aggregate ID linking this event to its
 *    corresponding PortAggregate instance.
 *
 * 3. **Temporal Information**: Inherited timestamp and event ID from the base
 *    PortEvent class for chronological ordering and event correlation.
 *
 * This event serves multiple critical purposes in our event-sourced architecture:
 *
 * - **Audit Trail**: Captures the exact moment and context of port request initiation
 * - **Saga Trigger**: Initiates the port allocation saga orchestration flow
 * - **State Reconstruction**: Enables aggregate hydration during event replay
 * - **Analytics**: Provides data for request pattern analysis and monitoring
 *
 * @example
 * ```typescript
 * import { PortRequestedEvent } from './PortRequestedEvent.class';
 * import { PortContext } from '../../../../core/domain/context';
 *
 * // Create a request context
 * const context = new PortContext('frontend', {
 *   serviceVersion: '1.2.3',
 *   environment: 'production'
 * });
 *
 * // Create the event
 * const event = new PortRequestedEvent('aggregate-123', context);
 *
 * // Access event properties
 * console.log(event.context.requestor); // 'frontend'
 * console.log(event.aggregateId);       // 'aggregate-123'
 * console.log(event.getAge());          // Time since event creation
 * ```
 *
 * @see {@link PortEvent} for the abstract base class
 * @see {@link IPortContext} for the context interface
 * @see {@link EventStore} for event persistence
 * @see {@link PortAggregate} for aggregate state management
 *
 * @author Enterprise Architecture Team
 * @copyright 2024 PortNumberGenerator™ Corporation
 * @license MIT (Enterprise Edition with Extra Buzzwords)
 */

import { PortEvent } from '../base/PortEvent.abstract';
import type { IPortContext } from '../../../../core/domain/context/interfaces/IPortContext.interface';

/**
 * Domain event representing the initiation of a port number request.
 *
 * This concrete event class extends the abstract PortEvent base class and
 * carries the complete context of a port number request. When a client (frontend,
 * backend, or other service) requests a port number, a PortRequestedEvent is
 * created and appended to the event store, marking the beginning of the port
 * allocation process.
 *
 * **Domain Significance:**
 *
 * In our event-sourced architecture, PortRequestedEvent represents the entry
 * point into the port allocation domain. It captures:
 *
 * - Who is requesting the port (via context.requestor)
 * - When the request was made (via inherited timestamp)
 * - Why the request was made (via context.metadata)
 * - What aggregate this request belongs to (via aggregateId)
 *
 * **Lifecycle Position:**
 *
 * This event is the FIRST event in the typical port allocation lifecycle:
 *
 * 1. **PortRequestedEvent** ← YOU ARE HERE
 * 2. PortCalculatedEvent (after VM executes port calculation logic)
 * 3. PortValidatedEvent (after port validation rules are applied)
 * 4. PortDeliveredEvent (after successful port delivery to requestor)
 *
 * **Immutability Contract:**
 *
 * Like all events in our system, PortRequestedEvent is immutable once created.
 * The context property is readonly, and the IPortContext object itself should
 * be treated as immutable (though TypeScript doesn't enforce deep immutability
 * without additional type gymnastics).
 *
 * **Event Schema:**
 *
 * ```typescript
 * {
 *   // Inherited from PortEvent
 *   timestamp: number,
 *   eventId: string,
 *   aggregateId: string,
 *
 *   // PortRequestedEvent-specific
 *   context: {
 *     requestId: string,
 *     timestamp: number,
 *     requestor: string,
 *     metadata: Record<string, unknown>
 *   }
 * }
 * ```
 *
 * **Performance Characteristics:**
 *
 * - **Memory Footprint**: Minimal overhead beyond the context object itself
 * - **Construction Time**: O(1) - single super() call plus property assignment
 * - **Serialization Size**: Depends on context.metadata size, typically < 1KB
 *
 * @class PortRequestedEvent
 * @extends {PortEvent}
 *
 * @property {IPortContext} context - The complete request context containing
 *   requestor identity, request ID, timestamp, and arbitrary metadata. This
 *   context object encapsulates all information about the original port request
 *   and is used throughout the port allocation saga for decision-making,
 *   auditing, and analytics.
 *
 * @since 1.0.0
 * @version 1.6.180
 *
 * @example
 * ```typescript
 * // Basic usage
 * const event = new PortRequestedEvent('agg-1', context);
 *
 * // Access context properties
 * console.log(event.context.requestor);  // 'frontend'
 * console.log(event.context.requestId);  // 'abc123xyz'
 * console.log(event.context.metadata);   // { env: 'prod' }
 *
 * // Use inherited methods
 * console.log(event.getAge());           // 1234 (milliseconds)
 * console.log(event.toISOString());      // '2024-01-01T12:00:00.000Z'
 * console.log(event.toString());         // 'PortRequestedEvent[eventId @ agg-1]'
 * ```
 *
 * @example
 * ```typescript
 * // Integration with EventStore
 * import { EventStore } from '../../store/EventStore.class';
 *
 * const event = new PortRequestedEvent('agg-1', context);
 * const store = EventStore.getInstance();
 * store.append(event);
 *
 * // Later, retrieve events for the aggregate
 * const events = store.getEventsForAggregate('agg-1');
 * const requestEvent = events[0] as PortRequestedEvent;
 * console.log(requestEvent.context.requestor);
 * ```
 *
 * @example
 * ```typescript
 * // Pattern matching on event type
 * function handleEvent(event: PortEvent): void {
 *   if (event instanceof PortRequestedEvent) {
 *     console.log(`Port requested by ${event.context.requestor}`);
 *     console.log(`Request ID: ${event.context.requestId}`);
 *   }
 * }
 * ```
 */
export class PortRequestedEvent extends PortEvent {
	/**
	 * The complete request context containing all information about the port request.
	 *
	 * This property holds the IPortContext object that was provided when the port
	 * was requested. The context encapsulates:
	 *
	 * - **requestId**: A unique identifier for this specific request, useful for
	 *   correlation across distributed systems and for deduplication.
	 *
	 * - **timestamp**: The moment when the request context was created (note: this
	 *   may differ slightly from the event's timestamp if there's processing delay
	 *   between context creation and event instantiation).
	 *
	 * - **requestor**: The identity of the entity requesting the port, typically
	 *   'frontend', 'backend', or another service identifier. This drives routing
	 *   decisions (frontend gets 6969, backend gets 42069).
	 *
	 * - **metadata**: An open-ended record of additional contextual information
	 *   that may be relevant for processing, logging, or analytics. Examples include
	 *   service version, environment name, user identity, trace IDs, etc.
	 *
	 * **Architectural Significance:**
	 *
	 * The context object is the primary payload of this event. All downstream
	 * event handlers, saga orchestrators, and aggregate methods rely on this
	 * context to make decisions about port allocation, validation, and delivery.
	 *
	 * **Immutability:**
	 *
	 * This property is readonly at the TypeScript level, preventing reassignment
	 * of the context reference. However, TypeScript's readonly modifier doesn't
	 * enforce deep immutability, so callers should treat the context object and
	 * its nested properties as immutable to maintain event sourcing best practices.
	 *
	 * **Design Pattern:**
	 *
	 * By encapsulating all request information in a context object rather than
	 * using multiple individual properties, we achieve:
	 *
	 * 1. **Single Responsibility**: The context object has one job - carry request data
	 * 2. **Extensibility**: New context fields can be added without changing event signatures
	 * 3. **Cohesion**: Related data is grouped together in a logical unit
	 * 4. **Testability**: Mock contexts can be easily created for testing
	 *
	 * @readonly
	 * @type {IPortContext}
	 * @memberof PortRequestedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortRequestedEvent('agg-1', context);
	 *
	 * // Access context properties
	 * console.log(event.context.requestor);  // 'frontend'
	 * console.log(event.context.requestId);  // 'req-abc-123'
	 * console.log(event.context.timestamp);  // 1704067200000
	 *
	 * // Access metadata
	 * const version = event.context.metadata.serviceVersion;
	 * console.log(version); // '1.2.3'
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Use context methods (if context is PortContext implementation)
	 * if ('getAge' in event.context) {
	 *   console.log(event.context.getAge()); // Time since context creation
	 * }
	 * ```
	 */
	public readonly context: IPortContext;

	/**
	 * Constructs a new PortRequestedEvent instance.
	 *
	 * This constructor creates an immutable event representing a port number request.
	 * It accepts the aggregate identifier and the complete request context, then
	 * delegates to the parent PortEvent constructor to initialize common event
	 * properties (timestamp, eventId, aggregateId).
	 *
	 * **Construction Process:**
	 *
	 * 1. **Base Initialization**: Calls super(aggregateId) to initialize inherited
	 *    properties from PortEvent (timestamp, eventId, aggregateId).
	 *
	 * 2. **Context Assignment**: Stores the provided context object as a readonly
	 *    property, making it accessible for downstream processing.
	 *
	 * **Parameter Validation:**
	 *
	 * This constructor does not perform explicit validation of the parameters.
	 * We trust that:
	 *
	 * - aggregateId is a non-empty string (enforced by convention and upstream validation)
	 * - context is a valid IPortContext implementation (enforced by TypeScript)
	 *
	 * In a production system, you might add runtime validation guards here, but
	 * in our over-engineered paradise, we rely on TypeScript's type system and
	 * upstream validation to ensure data integrity.
	 *
	 * **Performance:**
	 *
	 * This constructor executes in O(1) constant time with minimal overhead:
	 * - One super() call to initialize base properties
	 * - One property assignment for the context reference
	 * - No deep cloning or expensive operations
	 *
	 * **Memory:**
	 *
	 * The memory footprint is minimal:
	 * - Inherited properties: ~100 bytes (strings and numbers)
	 * - Context reference: 8 bytes (pointer)
	 * - Context object: varies based on metadata, typically < 1KB
	 *
	 * @constructor
	 * @param {string} aggregateId - The unique identifier of the aggregate root
	 *   that this event belongs to. This ID is used to correlate all events
	 *   related to a single port allocation request and enables efficient event
	 *   stream filtering during aggregate hydration.
	 *
	 * @param {IPortContext} context - The complete request context containing
	 *   requestor identity, request ID, timestamp, and metadata. This context
	 *   encapsulates all information about the port request and is used throughout
	 *   the port allocation lifecycle.
	 *
	 * @throws {TypeError} If parameters are not of the expected types (though
	 *   TypeScript should catch these at compile time).
	 *
	 * @since 1.0.0
	 * @version 1.0.0
	 *
	 * @example
	 * ```typescript
	 * import { PortContext } from '../../../../core/domain/context';
	 *
	 * // Create context
	 * const context = new PortContext('frontend', {
	 *   version: '1.0.0',
	 *   environment: 'production'
	 * });
	 *
	 * // Create event
	 * const event = new PortRequestedEvent('agg-123', context);
	 *
	 * // Event is now ready to be appended to the event store
	 * console.log(event.eventId);       // 'k9j3h2g1'
	 * console.log(event.aggregateId);   // 'agg-123'
	 * console.log(event.context);       // { requestId: '...', ... }
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Minimal usage with interface
	 * const context: IPortContext = {
	 *   requestId: 'req-1',
	 *   timestamp: Date.now(),
	 *   requestor: 'backend',
	 *   metadata: {}
	 * };
	 *
	 * const event = new PortRequestedEvent('agg-456', context);
	 * ```
	 */
	constructor(aggregateId: string, context: IPortContext) {
		super(aggregateId);
		this.context = context;
	}

	/**
	 * Returns the requestor identity from the embedded context.
	 *
	 * This convenience method extracts the requestor string from the context
	 * object, providing quick access to the identity of the entity that requested
	 * the port. This is useful for logging, routing decisions, and analytics.
	 *
	 * @returns {string} The requestor identity (e.g., 'frontend', 'backend').
	 *
	 * @memberof PortRequestedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortRequestedEvent('agg-1', context);
	 * console.log(event.getRequestor()); // 'frontend'
	 * ```
	 */
	public getRequestor(): string {
		return this.context.requestor;
	}

	/**
	 * Returns the unique request ID from the embedded context.
	 *
	 * This convenience method extracts the request ID from the context object,
	 * providing quick access to the unique identifier for this specific request.
	 * Useful for correlation, deduplication, and tracing.
	 *
	 * @returns {string} The request ID.
	 *
	 * @memberof PortRequestedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortRequestedEvent('agg-1', context);
	 * console.log(event.getRequestId()); // 'req-abc-123'
	 * ```
	 */
	public getRequestId(): string {
		return this.context.requestId;
	}

	/**
	 * Checks if the request was made by a frontend client.
	 *
	 * This convenience method determines whether the requestor is identified as
	 * 'frontend', which is useful for implementing frontend-specific routing logic
	 * (frontend requests typically get port 6969).
	 *
	 * @returns {boolean} True if the requestor is 'frontend'.
	 *
	 * @memberof PortRequestedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * if (event.isFrontendRequest()) {
	 *   console.log('Frontend request - will use port 6969');
	 * }
	 * ```
	 */
	public isFrontendRequest(): boolean {
		return this.context.requestor === 'frontend';
	}

	/**
	 * Checks if the request was made by a backend service.
	 *
	 * This convenience method determines whether the requestor is identified as
	 * 'backend', which is useful for implementing backend-specific routing logic
	 * (backend requests typically get port 42069).
	 *
	 * @returns {boolean} True if the requestor is 'backend'.
	 *
	 * @memberof PortRequestedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * if (event.isBackendRequest()) {
	 *   console.log('Backend request - will use port 42069');
	 * }
	 * ```
	 */
	public isBackendRequest(): boolean {
		return this.context.requestor === 'backend';
	}

	/**
	 * Retrieves a specific metadata value from the request context.
	 *
	 * This convenience method provides access to metadata stored in the context
	 * object, avoiding the need to access context.metadata directly. Useful for
	 * extracting configuration values, trace IDs, or other contextual information.
	 *
	 * @param {string} key - The metadata key to retrieve.
	 * @returns {unknown} The metadata value, or undefined if the key doesn't exist.
	 *
	 * @memberof PortRequestedEvent
	 * @since 1.1.0
	 *
	 * @example
	 * ```typescript
	 * const version = event.getMetadataValue('serviceVersion');
	 * console.log(version); // '1.2.3'
	 * ```
	 */
	public getMetadataValue(key: string): unknown {
		return this.context.metadata[key];
	}

	/**
	 * Serializes the event to a JSON string, including the context object.
	 *
	 * This method overrides the base PortEvent.toJSON() implementation to include
	 * the request context in the serialized output. This is essential for proper
	 * event persistence and network transmission.
	 *
	 * @returns {string} A JSON string representation of the complete event,
	 *   including both inherited properties and the request context.
	 *
	 * @memberof PortRequestedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortRequestedEvent('agg-1', context);
	 * const json = event.toJSON();
	 * console.log(json);
	 * // {"timestamp":1704067200000,"eventId":"k9j3h2g1",...,"context":{...}}
	 * ```
	 */
	public toJSON(): string {
		return JSON.stringify({
			timestamp: this.timestamp,
			eventId: this.eventId,
			aggregateId: this.aggregateId,
			context: this.context,
		});
	}

	/**
	 * Returns a detailed human-readable string representation of the event.
	 *
	 * This method overrides the base toString() to include requestor information,
	 * making log messages more informative and debugging easier.
	 *
	 * @returns {string} A detailed string representation.
	 *
	 * @memberof PortRequestedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortRequestedEvent('agg-1', context);
	 * console.log(event.toString());
	 * // "PortRequestedEvent[k9j3h2g1 @ agg-1] by frontend"
	 * ```
	 */
	public toString(): string {
		return `${super.toString()} by ${this.context.requestor}`;
	}
}

/**
 * Type guard to check if an event is a PortRequestedEvent.
 *
 * This utility function provides a type-safe way to check if an event is an
 * instance of PortRequestedEvent, enabling TypeScript to narrow the type in
 * conditional blocks.
 *
 * @param {PortEvent} event - The event to check.
 * @returns {boolean} True if the event is a PortRequestedEvent.
 *
 * @example
 * ```typescript
 * if (isPortRequestedEvent(event)) {
 *   // TypeScript knows event is PortRequestedEvent here
 *   console.log(event.context.requestor);
 * }
 * ```
 */
export function isPortRequestedEvent(event: PortEvent): event is PortRequestedEvent {
	return event instanceof PortRequestedEvent;
}

/**
 * Module metadata for introspection and debugging.
 */
export const MODULE_METADATA = {
	name: 'infrastructure/event-sourcing/events/implementations/PortRequestedEvent',
	version: '1.0.0',
	author: 'Enterprise Architecture Team',
	exports: ['PortRequestedEvent', 'isPortRequestedEvent', 'MODULE_METADATA'],
	description: 'Domain event representing the initiation of a port number request',
	eventType: 'PortRequestedEvent',
	lifecyclePosition: 'FIRST',
	linesOfCode: 550,
	overEngineeringLevel: 10,
} as const;

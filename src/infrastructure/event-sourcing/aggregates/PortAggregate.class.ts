/**
 * @fileoverview Port Aggregate - Domain Aggregate Root for Port Allocation
 *
 * This file contains the concrete implementation of the PortAggregate class,
 * which serves as the Aggregate Root in our hilariously over-engineered
 * Domain-Driven Design (DDD) and Event Sourcing architecture. The PortAggregate
 * encapsulates the state and business logic for a single port allocation request,
 * maintaining its state through event sourcing by replaying domain events.
 *
 * @module infrastructure/event-sourcing/aggregates
 * @category Event Sourcing
 * @subcategory Aggregates
 * @since 1.0.0
 * @version 1.73205.08076
 *
 * @remarks
 * The PortAggregate is the cornerstone of our event-sourced domain model. It provides:
 *
 * 1. **State Management**: Maintains the current state of a port allocation request
 *    by replaying events from the event store.
 *
 * 2. **Business Logic**: Encapsulates domain rules and invariants for port allocation.
 *
 * 3. **Event Application**: Provides methods to apply domain events and update
 *    internal state accordingly.
 *
 * 4. **Aggregate Hydration**: Supports reconstitution of aggregate state by
 *    replaying the complete event stream.
 *
 * 5. **State Inspection**: Exposes read-only access to aggregate state for
 *    querying and decision-making.
 *
 * **Aggregate Root Pattern:**
 *
 * In Domain-Driven Design, an Aggregate Root is an entity that serves as the
 * entry point to a cluster of related objects. The PortAggregate is our
 * aggregate root for the port allocation domain, responsible for:
 *
 * - Enforcing consistency boundaries
 * - Coordinating changes to related objects
 * - Ensuring business invariants are maintained
 * - Providing a clear API for domain operations
 *
 * **Event Sourcing Implementation:**
 *
 * Rather than storing current state directly, the PortAggregate maintains state
 * by replaying domain events. This provides:
 *
 * - **Complete Audit Trail**: Every state change is captured as an event
 * - **Temporal Queries**: State can be reconstructed at any point in time
 * - **Event Replay**: Bugs can be reproduced by replaying event streams
 * - **Flexibility**: Multiple projections can be built from same events
 *
 * **State Machine:**
 *
 * The PortAggregate implements a state machine with four phases:
 *
 * 1. **Initial**: No events have been applied (default state)
 * 2. **Requested**: PortRequestedEvent has been applied
 * 3. **Calculated**: PortCalculatedEvent has been applied
 * 4. **Validated**: PortValidatedEvent has been applied
 * 5. **Delivered**: PortDeliveredEvent has been applied (terminal state)
 *
 * Each phase transition is triggered by applying a corresponding domain event.
 *
 * **Design Philosophy:**
 *
 * We chose to implement aggregate hydration via explicit event application
 * rather than automatic event replay for several reasons:
 *
 * - **Transparency**: It's clear which events affect which state
 * - **Testability**: Easy to test individual event handlers
 * - **Debuggability**: Step through event application in debugger
 * - **Flexibility**: Different projections can apply events differently
 * - **Over-Engineering**: Because explicit is always better (right?)
 *
 * @example
 * ```typescript
 * import { PortAggregate } from './PortAggregate.class';
 * import { EventStore } from '../store/EventStore.class';
 *
 * // Create and hydrate an aggregate
 * const aggregate = new PortAggregate('agg-123');
 * aggregate.hydrate(); // Replays events from store
 *
 * // Inspect state
 * console.log(aggregate.isDelivered()); // true/false
 * console.log(aggregate.getCalculatedPort()); // 6969 or null
 * ```
 *
 * @see {@link PortEvent} for the event base class
 * @see {@link EventStore} for event persistence
 * @see {@link PortRequestedEvent} for the first event in the lifecycle
 *
 * @author Enterprise Architecture Team
 * @copyright 2024 PortNumberGenerator™ Corporation
 * @license MIT (Enterprise Edition with DDD Certification)
 */

import { EventStore } from '../store/EventStore.class';
import type { PortEvent } from '../events/base/PortEvent.abstract';
import {
	PortRequestedEvent,
	PortCalculatedEvent,
	PortValidatedEvent,
	PortDeliveredEvent,
} from '../events';

/**
 * Aggregate Root for port allocation domain.
 *
 * The PortAggregate class encapsulates the state and behavior of a single
 * port allocation request. It maintains its state by replaying domain events
 * from the EventStore, implementing the event sourcing pattern.
 *
 * **Aggregate State:**
 *
 * The aggregate maintains a state object with the following properties:
 *
 * - **requested**: Boolean indicating if a port was requested
 * - **calculatedPort**: The port number that was calculated (or null)
 * - **validated**: Boolean indicating if the port passed validation
 * - **delivered**: Boolean indicating if the port was delivered
 *
 * This state is derived entirely from events - it is never set directly.
 * All state changes occur through event application via the apply() method.
 *
 * **State Transitions:**
 *
 * The aggregate progresses through a series of state transitions:
 *
 * ```
 * Initial State (all false/null)
 *   |
 *   | PortRequestedEvent
 *   v
 * Requested State (requested = true)
 *   |
 *   | PortCalculatedEvent
 *   v
 * Calculated State (calculatedPort = number)
 *   |
 *   | PortValidatedEvent
 *   v
 * Validated State (validated = true)
 *   |
 *   | PortDeliveredEvent
 *   v
 * Delivered State (delivered = true) [TERMINAL]
 * ```
 *
 * **Hydration Process:**
 *
 * To reconstitute aggregate state:
 *
 * 1. Create aggregate with ID: `new PortAggregate('agg-123')`
 * 2. Call hydrate(): `aggregate.hydrate()`
 * 3. Hydrate retrieves events: `EventStore.getInstance().getEventsForAggregate(id)`
 * 4. Events are applied in order: `events.forEach(e => aggregate.apply(e))`
 * 5. Aggregate state now reflects event history
 *
 * **Business Invariants:**
 *
 * The aggregate enforces these invariants (implicitly):
 *
 * - Ports can only be calculated after being requested
 * - Ports can only be validated after being calculated
 * - Ports can only be delivered after being validated
 * - Once delivered, no further state changes occur
 *
 * These invariants are enforced by the event sequence in the event store,
 * not by explicit validation in the aggregate (though production systems
 * would add such validation).
 *
 * **Memory Management:**
 *
 * Each PortAggregate instance maintains its own state object. For systems
 * with many aggregates, consider:
 *
 * - Lazy hydration (only hydrate when needed)
 * - Aggregate caching (reuse hydrated instances)
 * - Snapshots (periodic state checkpoints)
 * - Aggregate lifecycle management (dispose when done)
 *
 * **Thread Safety:**
 *
 * This implementation is NOT thread-safe. In concurrent environments, add:
 * - Locking mechanisms for state modifications
 * - Version numbers for optimistic concurrency control
 * - Event ordering guarantees
 * - Idempotent event application
 *
 * @class PortAggregate
 * @since 1.0.0
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * // Create and hydrate an aggregate
 * const aggregate = new PortAggregate('agg-123');
 * aggregate.hydrate();
 *
 * // Check state
 * if (aggregate.isDelivered()) {
 *   console.log(`Port ${aggregate.getCalculatedPort()} was delivered`);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Manual event application
 * const aggregate = new PortAggregate('agg-456');
 * aggregate.apply(new PortRequestedEvent('agg-456', context));
 * aggregate.apply(new PortCalculatedEvent('agg-456', 6969));
 * aggregate.apply(new PortValidatedEvent('agg-456', true));
 * aggregate.apply(new PortDeliveredEvent('agg-456', 6969));
 *
 * console.log(aggregate.isDelivered()); // true
 * ```
 */
export class PortAggregate {
	/**
	 * The unique identifier for this aggregate instance.
	 *
	 * This ID correlates this aggregate with its event stream in the EventStore.
	 * All events belonging to this aggregate will have matching aggregateId values.
	 *
	 * **Aggregate Identity:**
	 *
	 * In Domain-Driven Design, every aggregate root must have a unique identifier.
	 * This ID serves multiple purposes:
	 *
	 * - **Event Correlation**: Links events to their aggregate
	 * - **Event Stream Filtering**: Enables efficient event queries
	 * - **Aggregate Lookup**: Allows finding specific aggregate instances
	 * - **Consistency Boundary**: Defines scope of transactional consistency
	 *
	 * **ID Format:**
	 *
	 * In our system, aggregate IDs are typically strings in the format
	 * 'agg-{number}' or similar, though any unique string is acceptable.
	 * The ID must remain constant for the lifetime of the aggregate.
	 *
	 * **Immutability:**
	 *
	 * The ID is set during construction and never changes. This ensures that
	 * the aggregate's identity remains stable throughout its lifecycle.
	 *
	 * @private
	 * @type {string}
	 * @memberof PortAggregate
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const aggregate = new PortAggregate('agg-123');
	 * // aggregate.id === 'agg-123' (internal, not directly accessible)
	 * ```
	 */
	private id: string;

	/**
	 * The current state of this aggregate, derived from applied events.
	 *
	 * This private field holds an object representing the aggregate's current
	 * state. The state is never set directly - it is only modified through
	 * event application via the apply() method.
	 *
	 * **State Properties:**
	 *
	 * - **requested**: Boolean flag indicating if a port was requested.
	 *   Set to true when PortRequestedEvent is applied.
	 *
	 * - **calculatedPort**: The port number that was calculated, or null if
	 *   no calculation has occurred. Set when PortCalculatedEvent is applied.
	 *
	 * - **validated**: Boolean flag indicating if the port passed validation.
	 *   Set to true when PortValidatedEvent is applied with isValid=true.
	 *
	 * - **delivered**: Boolean flag indicating if the port was delivered.
	 *   Set to true when PortDeliveredEvent is applied.
	 *
	 * **State Derivation:**
	 *
	 * The state object is derived entirely from events. To understand the
	 * aggregate's current state:
	 *
	 * 1. Start with initial state (all false/null)
	 * 2. Replay events in chronological order
	 * 3. Each event updates relevant state properties
	 * 4. Final state reflects complete event history
	 *
	 * **Why Private?**
	 *
	 * The state is private to enforce encapsulation. External code should
	 * not directly manipulate aggregate state. Instead, use:
	 *
	 * - Query methods (isRequested(), isDelivered(), etc.)
	 * - Event application (apply() method)
	 * - Aggregate hydration (hydrate() method)
	 *
	 * This ensures that all state changes are traceable to specific events
	 * and maintains the integrity of the event sourcing pattern.
	 *
	 * **Memory Layout:**
	 *
	 * ```
	 * {
	 *   requested: boolean,      // 1 byte
	 *   calculatedPort: number,  // 8 bytes (or 4 bytes for null)
	 *   validated: boolean,      // 1 byte
	 *   delivered: boolean       // 1 byte
	 * }
	 * Total: ~16 bytes per aggregate (excluding object overhead)
	 * ```
	 *
	 * @private
	 * @type {{
	 *   requested: boolean;
	 *   calculatedPort: number | null;
	 *   validated: boolean;
	 *   delivered: boolean;
	 * }}
	 * @memberof PortAggregate
	 * @since 1.0.0
	 */
	private state: {
		requested: boolean;
		calculatedPort: number | null;
		validated: boolean;
		delivered: boolean;
	};

	/**
	 * Constructs a new PortAggregate instance.
	 *
	 * This constructor creates an aggregate with the specified ID and initializes
	 * its state to the default (empty) state. The aggregate starts with no
	 * events applied and must be hydrated by calling hydrate() to load its
	 * event history from the EventStore.
	 *
	 * **Initialization Process:**
	 *
	 * 1. Store the provided aggregate ID
	 * 2. Initialize state to default values:
	 *    - requested: false (no request event applied)
	 *    - calculatedPort: null (no calculation event applied)
	 *    - validated: false (no validation event applied)
	 *    - delivered: false (no delivery event applied)
	 *
	 * **Post-Construction:**
	 *
	 * After construction, the aggregate is in its initial state. To load its
	 * event history and reconstitute its actual state, call hydrate():
	 *
	 * ```typescript
	 * const aggregate = new PortAggregate('agg-123');
	 * aggregate.hydrate(); // Load events from store
	 * ```
	 *
	 * **Design Decision:**
	 *
	 * We chose to separate construction from hydration (rather than hydrating
	 * in the constructor) for several reasons:
	 *
	 * - **Explicit Control**: Caller controls when hydration occurs
	 * - **Testability**: Can test with manual event application
	 * - **Performance**: Can defer hydration until needed (lazy loading)
	 * - **Flexibility**: Can create aggregates without EventStore access
	 *
	 * **ID Requirements:**
	 *
	 * The provided ID should:
	 * - Be unique across all aggregates
	 * - Match the aggregateId in corresponding events
	 * - Remain constant for aggregate's lifetime
	 * - Be a non-empty string
	 *
	 * We don't validate these requirements (trusting the caller), but production
	 * systems might add validation guards.
	 *
	 * @constructor
	 * @param {string} id - The unique identifier for this aggregate instance.
	 *   Must match the aggregateId in all events belonging to this aggregate.
	 *
	 * @memberof PortAggregate
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * // Create a new aggregate
	 * const aggregate = new PortAggregate('agg-123');
	 * console.log(aggregate.isRequested()); // false (not hydrated yet)
	 *
	 * // Hydrate to load state
	 * aggregate.hydrate();
	 * console.log(aggregate.isRequested()); // true (if events exist)
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Create aggregate for testing without hydration
	 * const aggregate = new PortAggregate('test-agg');
	 * aggregate.apply(new PortRequestedEvent('test-agg', context));
	 * // Manually apply events for testing
	 * ```
	 */
	constructor(id: string) {
		this.id = id;
		this.state = {
			requested: false,
			calculatedPort: null,
			validated: false,
			delivered: false,
		};
	}

	/**
	 * Applies a domain event to update the aggregate's state.
	 *
	 * This method is the core of the event sourcing pattern. It accepts a
	 * domain event and updates the aggregate's internal state based on the
	 * event type and payload. Different event types trigger different state
	 * transitions.
	 *
	 * **Event Handling:**
	 *
	 * The method uses instanceof checks to determine event type and apply
	 * the appropriate state change:
	 *
	 * - **PortRequestedEvent**: Sets requested = true
	 * - **PortCalculatedEvent**: Sets calculatedPort = event.port
	 * - **PortValidatedEvent**: Sets validated = event.isValid
	 * - **PortDeliveredEvent**: Sets delivered = true
	 *
	 * **Idempotency:**
	 *
	 * This implementation is idempotent for boolean state changes (applying
	 * the same event twice has the same effect as applying it once). However,
	 * it's not truly idempotent for calculatedPort (applying two different
	 * PortCalculatedEvents will overwrite the port).
	 *
	 * In production, you would add:
	 * - Event sequence numbers to detect duplicates
	 * - Version numbers for optimistic concurrency control
	 * - Validation to ensure proper event ordering
	 * - Idempotency checks to prevent duplicate application
	 *
	 * **State Machine Enforcement:**
	 *
	 * This implementation does NOT enforce state machine transitions. It
	 * blindly applies any event, even if it violates the expected sequence.
	 * For example, you could apply PortDeliveredEvent before PortRequestedEvent
	 * and it would work (incorrectly).
	 *
	 * Production systems should add validation:
	 * ```typescript
	 * if (event instanceof PortCalculatedEvent && !this.state.requested) {
	 *   throw new Error('Cannot calculate port before request');
	 * }
	 * ```
	 *
	 * But we trust our event store to contain valid event sequences, so we
	 * skip this validation (classic over-engineering trade-off: trust vs. verify).
	 *
	 * **Performance:**
	 *
	 * - Time Complexity: O(1) - Simple instanceof checks and assignments
	 * - Space Complexity: O(1) - Only modifies existing state object
	 * - No allocations or expensive operations
	 *
	 * **Extensibility:**
	 *
	 * To add support for new event types:
	 *
	 * 1. Add new event class extending PortEvent
	 * 2. Add else-if branch in this method
	 * 3. Update state based on new event type
	 * 4. Consider whether state object needs new properties
	 *
	 * @param {PortEvent} event - The domain event to apply. Must be a valid
	 *   PortEvent instance (or subclass). Unknown event types are silently
	 *   ignored (no-op).
	 *
	 * @returns {void} This method does not return a value. It modifies
	 *   internal state as a side effect.
	 *
	 * @memberof PortAggregate
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const aggregate = new PortAggregate('agg-123');
	 *
	 * // Apply events in sequence
	 * aggregate.apply(new PortRequestedEvent('agg-123', context));
	 * console.log(aggregate.isRequested()); // true
	 *
	 * aggregate.apply(new PortCalculatedEvent('agg-123', 6969));
	 * console.log(aggregate.getCalculatedPort()); // 6969
	 *
	 * aggregate.apply(new PortValidatedEvent('agg-123', true));
	 * console.log(aggregate.isValidated()); // true
	 *
	 * aggregate.apply(new PortDeliveredEvent('agg-123', 6969));
	 * console.log(aggregate.isDelivered()); // true
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Apply unknown event type (silently ignored)
	 * class CustomEvent extends PortEvent {
	 *   constructor(aggregateId: string) { super(aggregateId); }
	 * }
	 * aggregate.apply(new CustomEvent('agg-123')); // No-op
	 * ```
	 */
	public apply(event: PortEvent): void {
		if (event instanceof PortRequestedEvent) {
			this.state.requested = true;
		} else if (event instanceof PortCalculatedEvent) {
			this.state.calculatedPort = event.port;
		} else if (event instanceof PortValidatedEvent) {
			this.state.validated = event.isValid;
		} else if (event instanceof PortDeliveredEvent) {
			this.state.delivered = true;
		}
		// Unknown event types are silently ignored (could log warning in production)
	}

	/**
	 * Hydrates the aggregate by replaying its event stream from the EventStore.
	 *
	 * This method reconstitutes the aggregate's current state by:
	 *
	 * 1. Retrieving all events for this aggregate from the EventStore
	 * 2. Applying each event in sequence via apply()
	 * 3. Resulting in state that reflects the complete event history
	 *
	 * **Hydration Process:**
	 *
	 * ```
	 * Initial State: { requested: false, calculatedPort: null, ... }
	 *   |
	 *   | EventStore.getEventsForAggregate(this.id)
	 *   v
	 * Event Stream: [PortRequestedEvent, PortCalculatedEvent, ...]
	 *   |
	 *   | events.forEach(e => this.apply(e))
	 *   v
	 * Final State: { requested: true, calculatedPort: 6969, ... }
	 * ```
	 *
	 * **When to Hydrate:**
	 *
	 * Call hydrate() when you need to:
	 *
	 * - Load an existing aggregate from the event store
	 * - Refresh aggregate state after new events are appended
	 * - Reconstruct historical state for debugging or analysis
	 * - Verify event stream consistency
	 *
	 * **Performance Considerations:**
	 *
	 * Hydration performance depends on event count:
	 *
	 * - Few events (< 10): Fast, microseconds
	 * - Many events (100s): Slower, milliseconds
	 * - Huge event streams (1000s): Consider snapshots
	 *
	 * For aggregates with long event histories, consider:
	 *
	 * - **Snapshots**: Periodic state checkpoints to reduce replay
	 * - **Caching**: Cache hydrated aggregates to avoid repeated replay
	 * - **Lazy Hydration**: Only hydrate when state is actually needed
	 * - **Projection**: Use read-optimized projections instead of hydration
	 *
	 * **Event Ordering:**
	 *
	 * This method assumes events are returned in chronological order from
	 * the EventStore. If events are out of order, the final state may be
	 * incorrect. Production systems should:
	 *
	 * - Sort events by timestamp before applying
	 * - Use sequence numbers to ensure ordering
	 * - Validate event order during hydration
	 *
	 * **Idempotency:**
	 *
	 * Calling hydrate() multiple times should produce the same result (assuming
	 * no new events were appended between calls). However, this implementation
	 * does NOT reset state before hydrating, so calling hydrate() twice will
	 * replay events twice, which may or may not be idempotent depending on
	 * the specific events and state transitions.
	 *
	 * To ensure clean hydration, create a fresh aggregate instance rather than
	 * re-hydrating an existing one.
	 *
	 * **Error Handling:**
	 *
	 * This implementation does not handle errors during hydration. If event
	 * application fails (e.g., malformed events), the aggregate may be left
	 * in an inconsistent state. Production systems should add:
	 *
	 * - Try-catch blocks around event application
	 * - Validation of event structure and content
	 * - Rollback mechanisms for failed hydration
	 * - Error logging and monitoring
	 *
	 * @returns {void} This method does not return a value. It modifies
	 *   internal state as a side effect by applying events.
	 *
	 * @memberof PortAggregate
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * // Typical usage: create and hydrate
	 * const aggregate = new PortAggregate('agg-123');
	 * aggregate.hydrate();
	 *
	 * // Now aggregate state reflects event history
	 * console.log(aggregate.isDelivered());
	 * console.log(aggregate.getCalculatedPort());
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Hydrate after appending new events
	 * const store = EventStore.getInstance();
	 * store.append(new PortDeliveredEvent('agg-123', 6969));
	 *
	 * const aggregate = new PortAggregate('agg-123');
	 * aggregate.hydrate(); // Includes newly appended event
	 * console.log(aggregate.isDelivered()); // true
	 * ```
	 */
	public hydrate(): void {
		const events = EventStore.getInstance().getEventsForAggregate(this.id);
		events.forEach((e) => this.apply(e));
	}

	/**
	 * Returns the aggregate's unique identifier.
	 *
	 * This method provides read-only access to the aggregate's ID. The ID
	 * is immutable and set during construction.
	 *
	 * @returns {string} The aggregate's unique identifier.
	 *
	 * @memberof PortAggregate
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const aggregate = new PortAggregate('agg-123');
	 * console.log(aggregate.getId()); // 'agg-123'
	 * ```
	 */
	public getId(): string {
		return this.id;
	}

	/**
	 * Checks if a port request has been received for this aggregate.
	 *
	 * This method returns true if a PortRequestedEvent has been applied to
	 * this aggregate, indicating that the port allocation saga has started.
	 *
	 * @returns {boolean} True if the aggregate has been requested.
	 *
	 * @memberof PortAggregate
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * if (aggregate.isRequested()) {
	 *   console.log('Port allocation saga has started');
	 * }
	 * ```
	 */
	public isRequested(): boolean {
		return this.state.requested;
	}

	/**
	 * Returns the calculated port number, or null if not yet calculated.
	 *
	 * This method provides access to the port number that was calculated by
	 * the VM/Compiler subsystem. Returns null if no PortCalculatedEvent has
	 * been applied yet.
	 *
	 * @returns {number | null} The calculated port number, or null.
	 *
	 * @memberof PortAggregate
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const port = aggregate.getCalculatedPort();
	 * if (port !== null) {
	 *   console.log(`Port ${port} was calculated`);
	 * }
	 * ```
	 */
	public getCalculatedPort(): number | null {
		return this.state.calculatedPort;
	}

	/**
	 * Checks if the port has been validated.
	 *
	 * This method returns true if a PortValidatedEvent with isValid=true has
	 * been applied to this aggregate, indicating that the port passed validation.
	 *
	 * @returns {boolean} True if the port passed validation.
	 *
	 * @memberof PortAggregate
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * if (aggregate.isValidated()) {
	 *   console.log('Port passed validation');
	 * }
	 * ```
	 */
	public isValidated(): boolean {
		return this.state.validated;
	}

	/**
	 * Checks if the port has been delivered to the requestor.
	 *
	 * This method returns true if a PortDeliveredEvent has been applied to
	 * this aggregate, indicating that the port allocation saga has completed
	 * successfully.
	 *
	 * @returns {boolean} True if the port has been delivered.
	 *
	 * @memberof PortAggregate
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * if (aggregate.isDelivered()) {
	 *   console.log('Port allocation saga complete');
	 * }
	 * ```
	 */
	public isDelivered(): boolean {
		return this.state.delivered;
	}

	/**
	 * Checks if the port allocation saga is complete.
	 *
	 * This convenience method returns true if the aggregate has reached the
	 * terminal state (delivered), indicating that no further processing is
	 * required.
	 *
	 * @returns {boolean} True if the saga is complete.
	 *
	 * @memberof PortAggregate
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * if (aggregate.isComplete()) {
	 *   console.log('No further action needed');
	 * }
	 * ```
	 */
	public isComplete(): boolean {
		return this.isDelivered();
	}

	/**
	 * Returns a read-only snapshot of the aggregate's current state.
	 *
	 * This method returns a shallow copy of the internal state object,
	 * providing a read-only view of the aggregate's current state. Useful
	 * for debugging, logging, and state inspection.
	 *
	 * **Immutability Note:**
	 *
	 * The returned object is a shallow copy, so callers cannot directly
	 * mutate the aggregate's internal state. However, this is not true
	 * deep immutability - it's just a copy. TypeScript doesn't enforce
	 * readonly on the returned object's properties without additional
	 * type gymnastics.
	 *
	 * @returns {object} A snapshot of the aggregate's current state.
	 *
	 * @memberof PortAggregate
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const state = aggregate.getState();
	 * console.log(JSON.stringify(state, null, 2));
	 * ```
	 */
	public getState(): {
		requested: boolean;
		calculatedPort: number | null;
		validated: boolean;
		delivered: boolean;
	} {
		return { ...this.state };
	}

	/**
	 * Returns a human-readable string representation of the aggregate.
	 *
	 * This method produces a concise string describing the aggregate's ID
	 * and current state, useful for logging and debugging.
	 *
	 * @returns {string} A human-readable string representation.
	 *
	 * @memberof PortAggregate
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * console.log(aggregate.toString());
	 * // "PortAggregate[agg-123] requested=true calculated=6969 validated=true delivered=true"
	 * ```
	 */
	public toString(): string {
		return `PortAggregate[${this.id}] requested=${this.state.requested} calculated=${this.state.calculatedPort} validated=${this.state.validated} delivered=${this.state.delivered}`;
	}
}

/**
 * Module metadata for introspection and debugging.
 */
export const MODULE_METADATA = {
	name: 'infrastructure/event-sourcing/aggregates/PortAggregate',
	version: '1.0.0',
	author: 'Enterprise Architecture Team',
	exports: ['PortAggregate', 'MODULE_METADATA'],
	description: 'Aggregate Root for port allocation domain with event sourcing support',
	patterns: ['Aggregate Root', 'Event Sourcing', 'Domain-Driven Design'],
	stateProperties: ['requested', 'calculatedPort', 'validated', 'delivered'],
	linesOfCode: 780,
	overEngineeringLevel: 9.7,
} as const;

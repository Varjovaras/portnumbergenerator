/**
 * @fileoverview Abstract Base Event Class for Port Number Generation Domain Events
 *
 * This file contains the foundational abstract class that serves as the bedrock
 * of our Event Sourcing architecture. Every domain event in the Port Number
 * Generation subsystem MUST extend this abstract base class to ensure compliance
 * with our enterprise-grade event sourcing standards and to guarantee that all
 * events carry the required metadata, temporal information, and aggregate correlation
 * identifiers necessary for proper event stream reconstruction, aggregate hydration,
 * and distributed tracing across our hilariously over-engineered microservices mesh.
 *
 * @module infrastructure/event-sourcing/events/base
 * @category Event Sourcing
 * @subcategory Base Classes
 * @since 1.0.0
 * @version 3.14.159
 *
 * @remarks
 * This abstract class implements the Temporal Event Pattern (TEP) combined with
 * the Aggregate Correlation Identifier Pattern (ACIP) to ensure that every event
 * in our system can be:
 *
 * 1. **Temporally Ordered**: Each event carries a high-precision timestamp that
 *    allows for chronological reconstruction of the aggregate's state evolution.
 *
 * 2. **Uniquely Identified**: Each event receives a globally unique event identifier
 *    generated using cryptographically-insecure random number generation (because
 *    we're not THAT paranoid, despite the over-engineering).
 *
 * 3. **Aggregate-Correlated**: Each event carries the identifier of the aggregate
 *    root it belongs to, enabling efficient event stream filtering and aggregate
 *    reconstitution from the event store.
 *
 * @example
 * ```typescript
 * // Creating a concrete event class that extends PortEvent
 * class MyCustomPortEvent extends PortEvent {
 *   public readonly customData: string;
 *
 *   constructor(aggregateId: string, customData: string) {
 *     super(aggregateId);
 *     this.customData = customData;
 *   }
 *
 *   // Override methods as needed for domain-specific behavior
 *   getEventType(): string {
 *     return 'MyCustomPortEvent';
 *   }
 * }
 *
 * // Instantiating the event
 * const event = new MyCustomPortEvent('aggregate-123', 'important data');
 * console.log(event.getAge()); // Time since event creation
 * ```
 *
 * @see {@link PortRequestedEvent} for an example of a concrete implementation
 * @see {@link EventStore} for the persistence mechanism that stores these events
 * @see {@link PortAggregate} for the aggregate that consumes these events
 *
 * @author Enterprise Architecture Team
 * @copyright 2024 PortNumberGenerator™ Corporation
 * @license MIT (but enterprise-flavored)
 */

/**
 * Abstract base class representing a domain event in the Port Number Generation system.
 *
 * This class serves as the foundation for all domain events in our event-sourced
 * architecture. It provides the essential properties and behaviors that every
 * event must possess, including temporal metadata, unique identification, and
 * aggregate correlation.
 *
 * **Design Philosophy:**
 *
 * Events are immutable facts about things that have happened in the past. They
 * represent state transitions in our domain model and are the source of truth
 * for reconstructing the current state of any aggregate. This abstract base
 * class enforces the immutability contract through readonly properties and
 * provides utility methods for event inspection, comparison, and debugging.
 *
 * **Key Responsibilities:**
 *
 * 1. **Temporal Tracking**: Automatically captures the precise moment of event
 *    creation using high-resolution timestamps.
 *
 * 2. **Unique Identification**: Generates a globally unique identifier for each
 *    event instance to enable event deduplication and correlation.
 *
 * 3. **Aggregate Binding**: Associates each event with its originating aggregate
 *    root, enabling efficient event stream filtering.
 *
 * 4. **Utility Methods**: Provides helper methods for event age calculation,
 *    serialization, comparison, and debugging.
 *
 * **Architectural Benefits:**
 *
 * - **Audit Trail**: Every state change is captured as an immutable event,
 *   providing a complete audit trail of all domain operations.
 *
 * - **Temporal Queries**: Events can be filtered and queried by time range,
 *   enabling time-travel debugging and historical state reconstruction.
 *
 * - **Event Replay**: Aggregates can be reconstituted by replaying their
 *   event streams, enabling both crash recovery and retroactive bug fixes.
 *
 * - **Distributed Tracing**: Event identifiers and timestamps facilitate
 *   distributed tracing and debugging across service boundaries.
 *
 * @abstract
 * @class PortEvent
 *
 * @property {number} timestamp - The Unix epoch timestamp (in milliseconds) when
 *   this event was created. This value is immutable and represents the precise
 *   moment the event entered existence. Used for chronological ordering and
 *   temporal queries.
 *
 * @property {string} eventId - A globally unique identifier for this specific
 *   event instance. Generated using Math.random() and base-36 encoding because
 *   we're over-engineering the architecture, not the random number generation.
 *   This identifier is used for event deduplication, correlation, and debugging.
 *
 * @property {string} aggregateId - The unique identifier of the aggregate root
 *   that this event belongs to. Used to filter event streams by aggregate and
 *   to ensure that events are applied to the correct aggregate during hydration.
 *
 * @since 1.0.0
 * @version 2.7.1828
 *
 * @example
 * ```typescript
 * // Extending the abstract base class
 * class UserRegisteredEvent extends PortEvent {
 *   constructor(aggregateId: string, public readonly email: string) {
 *     super(aggregateId);
 *   }
 * }
 *
 * const event = new UserRegisteredEvent('user-42', 'user@example.com');
 * console.log(event.timestamp); // 1234567890123
 * console.log(event.eventId);   // 'a1b2c3d4e5f6g7'
 * console.log(event.aggregateId); // 'user-42'
 * ```
 */
export abstract class PortEvent {
	/**
	 * The Unix epoch timestamp (in milliseconds) representing the precise moment
	 * when this event was instantiated.
	 *
	 * This timestamp is captured automatically during event construction and is
	 * immutable thereafter. It serves multiple purposes in our event-sourced
	 * architecture:
	 *
	 * - **Event Ordering**: Events can be sorted chronologically to reconstruct
	 *   the exact sequence of state transitions.
	 *
	 * - **Temporal Queries**: Event streams can be filtered by time ranges for
	 *   debugging, auditing, and compliance purposes.
	 *
	 * - **Age Calculation**: The timestamp enables calculation of event age,
	 *   useful for implementing time-based business rules and event expiration.
	 *
	 * - **Performance Monitoring**: Event timestamps can be used to measure
	 *   processing latency and identify performance bottlenecks.
	 *
	 * @readonly
	 * @type {number}
	 * @memberof PortEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new ConcretePortEvent('agg-1');
	 * console.log(event.timestamp); // 1704067200000
	 * console.log(new Date(event.timestamp)); // 2024-01-01T00:00:00.000Z
	 * ```
	 */
	public readonly timestamp: number;

	/**
	 * A globally unique identifier for this specific event instance.
	 *
	 * This identifier is automatically generated during event construction using
	 * a combination of Math.random() and base-36 encoding. While not cryptographically
	 * secure, this approach provides sufficient uniqueness for our use case and
	 * maintains our philosophy of over-engineering the architecture, not every
	 * single implementation detail.
	 *
	 * **Use Cases:**
	 *
	 * - **Deduplication**: Event IDs enable detection and elimination of duplicate
	 *   events in distributed systems where at-least-once delivery semantics apply.
	 *
	 * - **Correlation**: Event IDs can be used to correlate events across different
	 *   subsystems, microservices, and bounded contexts.
	 *
	 * - **Debugging**: Unique event IDs facilitate tracing individual events through
	 *   logs, metrics, and distributed tracing systems.
	 *
	 * - **Idempotency**: Event handlers can use event IDs to implement idempotent
	 *   operations and prevent duplicate processing.
	 *
	 * @readonly
	 * @type {string}
	 * @memberof PortEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new ConcretePortEvent('agg-1');
	 * console.log(event.eventId); // 'k9j3h2g1f5d4s6'
	 *
	 * // Use for deduplication
	 * const processedEventIds = new Set<string>();
	 * if (!processedEventIds.has(event.eventId)) {
	 *   processedEventIds.add(event.eventId);
	 *   // Process event...
	 * }
	 * ```
	 */
	public readonly eventId: string;

	/**
	 * The unique identifier of the aggregate root that this event belongs to.
	 *
	 * In Domain-Driven Design (DDD) and Event Sourcing architectures, aggregates
	 * are the fundamental units of consistency. Each aggregate has a unique
	 * identifier, and all events related to that aggregate carry this identifier
	 * to enable efficient event stream filtering and aggregate reconstitution.
	 *
	 * **Architectural Significance:**
	 *
	 * - **Event Stream Filtering**: When hydrating an aggregate, we query the
	 *   event store for all events matching this aggregate ID, enabling efficient
	 *   aggregate reconstruction.
	 *
	 * - **Consistency Boundary**: The aggregate ID defines the consistency boundary
	 *   within which business invariants are enforced.
	 *
	 * - **Concurrency Control**: Aggregate IDs are used in optimistic concurrency
	 *   control mechanisms to detect and resolve conflicts.
	 *
	 * - **Sharding Key**: In distributed event stores, the aggregate ID can serve
	 *   as the sharding key for optimal data distribution.
	 *
	 * @readonly
	 * @type {string}
	 * @memberof PortEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new ConcretePortEvent('port-aggregate-42');
	 * console.log(event.aggregateId); // 'port-aggregate-42'
	 *
	 * // Filter events for a specific aggregate
	 * const aggregateEvents = allEvents.filter(e =>
	 *   e.aggregateId === 'port-aggregate-42'
	 * );
	 * ```
	 */
	public readonly aggregateId: string;

	/**
	 * Constructs a new PortEvent instance with the specified aggregate identifier.
	 *
	 * This constructor is protected because PortEvent is an abstract base class
	 * and cannot be instantiated directly. Concrete event classes must extend
	 * this base class and invoke this constructor via super() to initialize the
	 * common event properties.
	 *
	 * **Initialization Process:**
	 *
	 * 1. **Aggregate Binding**: Stores the provided aggregate ID to associate
	 *    this event with its originating aggregate root.
	 *
	 * 2. **Timestamp Capture**: Captures the current system time using Date.now()
	 *    to record the precise moment of event creation.
	 *
	 * 3. **ID Generation**: Generates a globally unique event identifier using
	 *    Math.random() and base-36 encoding, producing a compact string identifier.
	 *
	 * **Design Rationale:**
	 *
	 * By automatically handling timestamp capture and ID generation in the base
	 * constructor, we ensure that all events in the system follow a consistent
	 * identification scheme and carry temporal metadata. This reduces boilerplate
	 * in concrete event classes and enforces architectural standards.
	 *
	 * **Performance Considerations:**
	 *
	 * The constructor executes in O(1) time complexity with minimal overhead:
	 * - Date.now() is a fast native call
	 * - Math.random() is hardware-accelerated on modern platforms
	 * - String manipulation is optimized by the JavaScript engine
	 *
	 * @protected
	 * @constructor
	 * @param {string} aggregateId - The unique identifier of the aggregate root
	 *   that this event belongs to. This value is stored immutably and used for
	 *   event stream filtering and aggregate correlation.
	 *
	 * @throws {TypeError} If aggregateId is not a string (though this is not
	 *   explicitly validated in the implementation because we trust our callers
	 *   in this over-engineered paradise).
	 *
	 * @since 1.0.0
	 * @version 1.4.142
	 *
	 * @example
	 * ```typescript
	 * // In a concrete event class
	 * class PortCreatedEvent extends PortEvent {
	 *   constructor(aggregateId: string, public readonly port: number) {
	 *     super(aggregateId); // Invokes PortEvent constructor
	 *   }
	 * }
	 *
	 * const event = new PortCreatedEvent('agg-123', 8080);
	 * console.log(event.aggregateId); // 'agg-123'
	 * console.log(event.timestamp);   // Automatically set
	 * console.log(event.eventId);     // Automatically generated
	 * ```
	 */
	constructor(aggregateId: string) {
		this.aggregateId = aggregateId;
		this.timestamp = Date.now();
		this.eventId = Math.random().toString(36).substring(2, 15);
	}

	/**
	 * Calculates and returns the age of this event in milliseconds.
	 *
	 * This utility method computes the time elapsed since the event was created
	 * by comparing the current system time with the event's immutable timestamp.
	 * The result represents the "age" of the event in milliseconds, which is
	 * useful for implementing time-based business rules, event expiration policies,
	 * and performance monitoring.
	 *
	 * **Use Cases:**
	 *
	 * - **Event Expiration**: Implement TTL (Time To Live) policies by checking
	 *   if an event's age exceeds a configured threshold.
	 *
	 * - **Performance Metrics**: Measure event processing latency by calculating
	 *   the age of events at various stages in the processing pipeline.
	 *
	 * - **Business Rules**: Implement time-sensitive business logic, such as
	 *   "process events only if they are less than 5 minutes old."
	 *
	 * - **Debugging**: Identify stale events or processing bottlenecks by
	 *   monitoring event age distribution.
	 *
	 * **Performance:**
	 *
	 * This method executes in O(1) constant time, performing a simple subtraction
	 * operation between two numbers. The Date.now() call is highly optimized by
	 * modern JavaScript engines and typically completes in nanoseconds.
	 *
	 * @returns {number} The age of this event in milliseconds, calculated as the
	 *   difference between the current system time and the event's timestamp.
	 *   Always returns a non-negative number (assuming the system clock hasn't
	 *   traveled backwards in time, which would violate causality and probably
	 *   break physics).
	 *
	 * @memberof PortEvent
	 * @since 1.0.0
	 * @version 1.2.3
	 *
	 * @example
	 * ```typescript
	 * const event = new ConcretePortEvent('agg-1');
	 *
	 * setTimeout(() => {
	 *   console.log(event.getAge()); // ~1000 (approximately 1 second)
	 * }, 1000);
	 *
	 * // Implement event expiration
	 * const MAX_EVENT_AGE = 5 * 60 * 1000; // 5 minutes
	 * if (event.getAge() > MAX_EVENT_AGE) {
	 *   console.log('Event has expired');
	 * }
	 * ```
	 *
	 * @see {@link isExpired} for a more convenient way to check event expiration
	 * @see {@link getAgeInSeconds} for age calculation in seconds
	 */
	public getAge(): number {
		return Date.now() - this.timestamp;
	}

	/**
	 * Returns the age of this event in seconds (as opposed to milliseconds).
	 *
	 * This convenience method provides the event age in seconds rather than
	 * milliseconds, which is often more human-readable and convenient for business
	 * logic that operates at second-level granularity rather than millisecond
	 * precision.
	 *
	 * The implementation delegates to getAge() and divides the result by 1000,
	 * providing a floating-point number representing fractional seconds.
	 *
	 * @returns {number} The age of this event in seconds (with fractional precision).
	 *
	 * @memberof PortEvent
	 * @since 1.1.0
	 *
	 * @example
	 * ```typescript
	 * const event = new ConcretePortEvent('agg-1');
	 * setTimeout(() => {
	 *   console.log(event.getAgeInSeconds()); // ~1.0
	 * }, 1000);
	 * ```
	 */
	public getAgeInSeconds(): number {
		return this.getAge() / 1000;
	}

	/**
	 * Checks whether this event has expired based on a provided TTL (Time To Live).
	 *
	 * This convenience method determines if the event's age exceeds the specified
	 * time-to-live value, effectively implementing an expiration check. This is
	 * useful for implementing temporal business rules, cache invalidation policies,
	 * and event retention strategies.
	 *
	 * **Use Cases:**
	 *
	 * - **Event Expiration**: Filter out stale events that are too old to be
	 *   relevant for current processing.
	 *
	 * - **Cache Invalidation**: Determine when cached events should be evicted
	 *   and refreshed from the event store.
	 *
	 * - **SLA Enforcement**: Ensure that events are processed within defined
	 *   service level agreements (e.g., "all events must be processed within
	 *   5 minutes of creation").
	 *
	 * - **Retention Policies**: Implement data retention policies by identifying
	 *   and archiving or deleting expired events.
	 *
	 * @param {number} ttl - The time-to-live threshold in milliseconds. Events
	 *   older than this threshold are considered expired.
	 *
	 * @returns {boolean} True if the event's age exceeds the provided TTL,
	 *   indicating that the event has expired; false otherwise.
	 *
	 * @memberof PortEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new ConcretePortEvent('agg-1');
	 * const FIVE_MINUTES = 5 * 60 * 1000;
	 *
	 * setTimeout(() => {
	 *   if (event.isExpired(FIVE_MINUTES)) {
	 *     console.log('Event has expired');
	 *   } else {
	 *     console.log('Event is still fresh');
	 *   }
	 * }, 6 * 60 * 1000); // Check after 6 minutes
	 * ```
	 *
	 * @see {@link getAge} for retrieving the raw event age
	 */
	public isExpired(ttl: number): boolean {
		return this.getAge() > ttl;
	}

	/**
	 * Returns the event's timestamp as an ISO 8601 formatted string.
	 *
	 * This utility method converts the event's Unix epoch timestamp into a
	 * human-readable ISO 8601 date-time string, which is useful for logging,
	 * debugging, and display purposes. ISO 8601 is an international standard
	 * for date-time representation and is widely supported across systems.
	 *
	 * @returns {string} The event timestamp in ISO 8601 format
	 *   (e.g., "2024-01-01T12:00:00.000Z").
	 *
	 * @memberof PortEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new ConcretePortEvent('agg-1');
	 * console.log(event.toISOString()); // "2024-01-01T12:00:00.000Z"
	 * ```
	 */
	public toISOString(): string {
		return new Date(this.timestamp).toISOString();
	}

	/**
	 * Compares this event with another event to determine temporal ordering.
	 *
	 * This method compares the timestamps of two events and returns a value
	 * indicating their relative chronological order. This is particularly useful
	 * for sorting event streams and implementing event ordering logic.
	 *
	 * @param {PortEvent} other - The other event to compare against.
	 *
	 * @returns {number} A negative number if this event occurred before the other,
	 *   zero if they have the same timestamp (highly unlikely but possible),
	 *   or a positive number if this event occurred after the other.
	 *
	 * @memberof PortEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const events = [event3, event1, event2];
	 * events.sort((a, b) => a.compareTo(b)); // Sort chronologically
	 * ```
	 */
	public compareTo(other: PortEvent): number {
		return this.timestamp - other.timestamp;
	}

	/**
	 * Checks if this event occurred before another event.
	 *
	 * @param {PortEvent} other - The event to compare against.
	 * @returns {boolean} True if this event occurred before the other event.
	 *
	 * @memberof PortEvent
	 * @since 1.1.0
	 */
	public isBefore(other: PortEvent): boolean {
		return this.timestamp < other.timestamp;
	}

	/**
	 * Checks if this event occurred after another event.
	 *
	 * @param {PortEvent} other - The event to compare against.
	 * @returns {boolean} True if this event occurred after the other event.
	 *
	 * @memberof PortEvent
	 * @since 1.1.0
	 */
	public isAfter(other: PortEvent): boolean {
		return this.timestamp > other.timestamp;
	}

	/**
	 * Serializes the event to a JSON string representation.
	 *
	 * This method converts the event into a JSON string containing all of its
	 * properties, which is useful for persistence, network transmission, logging,
	 * and debugging. The resulting JSON can be deserialized later to reconstruct
	 * the event (though proper deserialization would require knowledge of the
	 * concrete event class).
	 *
	 * **Implementation Note:**
	 *
	 * This base implementation only serializes the common properties (timestamp,
	 * eventId, aggregateId). Concrete event classes should override this method
	 * to include their domain-specific properties.
	 *
	 * @returns {string} A JSON string representation of the event.
	 *
	 * @memberof PortEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new ConcretePortEvent('agg-1');
	 * console.log(event.toJSON());
	 * // {"timestamp":1704067200000,"eventId":"k9j3h2g1","aggregateId":"agg-1"}
	 * ```
	 */
	public toJSON(): string {
		return JSON.stringify({
			timestamp: this.timestamp,
			eventId: this.eventId,
			aggregateId: this.aggregateId,
		});
	}

	/**
	 * Returns a human-readable string representation of the event.
	 *
	 * This method produces a concise, human-readable string describing the event,
	 * which is useful for logging and debugging. The format includes the event's
	 * class name (obtained via constructor.name), event ID, and aggregate ID.
	 *
	 * @returns {string} A human-readable string representation.
	 *
	 * @memberof PortEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortRequestedEvent('agg-1', context);
	 * console.log(event.toString());
	 * // "PortRequestedEvent[k9j3h2g1 @ agg-1]"
	 * ```
	 */
	public toString(): string {
		return `${this.constructor.name}[${this.eventId} @ ${this.aggregateId}]`;
	}

	/**
	 * Returns the name of the event type (the class name).
	 *
	 * This utility method provides access to the concrete event class name, which
	 * is useful for event routing, pattern matching, and debugging. It's essentially
	 * a convenience wrapper around constructor.name.
	 *
	 * @returns {string} The name of the concrete event class.
	 *
	 * @memberof PortEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortRequestedEvent('agg-1', context);
	 * console.log(event.getEventType()); // "PortRequestedEvent"
	 * ```
	 */
	public getEventType(): string {
		return this.constructor.name;
	}

	/**
	 * Checks if this event belongs to the specified aggregate.
	 *
	 * This convenience method determines whether the event is associated with a
	 * specific aggregate by comparing aggregate IDs. Useful for filtering and
	 * event stream queries.
	 *
	 * @param {string} aggregateId - The aggregate ID to check against.
	 * @returns {boolean} True if this event belongs to the specified aggregate.
	 *
	 * @memberof PortEvent
	 * @since 1.1.0
	 *
	 * @example
	 * ```typescript
	 * if (event.belongsToAggregate('agg-123')) {
	 *   console.log('Event belongs to aggregate 123');
	 * }
	 * ```
	 */
	public belongsToAggregate(aggregateId: string): boolean {
		return this.aggregateId === aggregateId;
	}

	/**
	 * Creates a shallow clone of the event's metadata.
	 *
	 * This method returns a plain object containing the event's core properties,
	 * which is useful for creating event metadata snapshots without the full
	 * event object.
	 *
	 * @returns {object} An object containing the event's metadata.
	 *
	 * @memberof PortEvent
	 * @since 1.2.0
	 */
	public getMetadata(): { timestamp: number; eventId: string; aggregateId: string } {
		return {
			timestamp: this.timestamp,
			eventId: this.eventId,
			aggregateId: this.aggregateId,
		};
	}
}

/**
 * Module metadata for introspection and debugging.
 *
 * This metadata object provides comprehensive information about the module,
 * including version, author, export inventory, and architectural patterns.
 * It's primarily used for documentation generation, runtime introspection,
 * and developer tooling.
 */
export const MODULE_METADATA = {
	/**
	 * Module name as it appears in import statements.
	 */
	name: 'infrastructure/event-sourcing/events/base',

	/**
	 * Semantic version following SemVer 2.0.0 specification.
	 */
	version: '1.0.0',

	/**
	 * Module author and maintainer information.
	 */
	author: 'Enterprise Architecture Team',

	/**
	 * List of exported symbols from this module.
	 */
	exports: ['PortEvent', 'MODULE_METADATA'],

	/**
	 * Architectural patterns implemented in this module.
	 */
	patterns: ['Event Sourcing', 'Abstract Base Class', 'Immutable Events'],

	/**
	 * Module description for documentation generation.
	 */
	description: 'Abstract base class for all domain events in the Port Number Generation system',

	/**
	 * Lines of code in this module (approximate, for metrics).
	 */
	linesOfCode: 700,

	/**
	 * Enterprise-grade over-engineering level (on a scale of 1-10).
	 */
	overEngineeringLevel: 9,
} as const;

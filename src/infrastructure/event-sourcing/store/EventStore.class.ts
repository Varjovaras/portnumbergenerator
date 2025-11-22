/**
 * @fileoverview Event Store - Persistent Storage for Domain Events
 *
 * This file contains the concrete implementation of the EventStore class, which
 * serves as the central repository for all domain events in our hilariously
 * over-engineered Event Sourcing architecture. The EventStore is implemented as
 * a Singleton to ensure a single, consistent view of the event stream across the
 * entire application, and it leverages our enterprise-grade DistributedDatabase
 * infrastructure to provide scalable, sharded event persistence.
 *
 * @module infrastructure/event-sourcing/store
 * @category Event Sourcing
 * @subcategory Event Store
 * @since 1.0.0
 * @version 2.99792.458
 *
 * @remarks
 * The EventStore is the heart of our event-sourced architecture. It provides:
 *
 * 1. **Event Persistence**: Durable storage of all domain events with guaranteed
 *    ordering and immutability guarantees.
 *
 * 2. **Event Retrieval**: Efficient querying of events by aggregate ID, event type,
 *    time range, and other criteria.
 *
 * 3. **Aggregate Hydration**: Support for reconstituting aggregate state by
 *    replaying event streams.
 *
 * 4. **Distributed Storage**: Built on top of our DistributedDatabase with
 *    configurable sharding strategies for horizontal scalability.
 *
 * 5. **Singleton Pattern**: Ensures a single, consistent event store instance
 *    across the entire application lifecycle.
 *
 * **Architectural Decision: Singleton Pattern**
 *
 * We chose the Singleton pattern for EventStore because:
 *
 * - **Consistency**: All components access the same event stream
 * - **Resource Management**: Avoids multiple database connections
 * - **State Coordination**: Simplifies concurrent access patterns
 * - **Testing**: Easy to reset state between tests (via getInstance)
 * - **Tradition**: Because every enterprise system needs at least one Singleton
 *
 * Yes, we know Singletons are controversial and some consider them an anti-pattern.
 * But in the spirit of hilariously over-engineered systems, we embrace them
 * wholeheartedly while fully acknowledging the irony.
 *
 * **Implementation Note:**
 *
 * The EventStore is backed by our DistributedDatabase with a HashShardStrategy
 * to ensure consistent event distribution across shards. Each event is stored
 * with its eventId as the key, enabling O(1) lookups by ID and efficient
 * range scans for aggregate reconstitution.
 *
 * @example
 * ```typescript
 * import { EventStore } from './EventStore.class';
 * import { PortRequestedEvent } from '../events';
 *
 * // Get the singleton instance
 * const store = EventStore.getInstance();
 *
 * // Append an event
 * const event = new PortRequestedEvent('agg-123', context);
 * store.append(event);
 *
 * // Retrieve events for an aggregate
 * const events = store.getEventsForAggregate('agg-123');
 * console.log(`Found ${events.length} events`);
 * ```
 *
 * @see {@link PortEvent} for the event base class
 * @see {@link DistributedDatabase} for the underlying storage mechanism
 * @see {@link PortAggregate} for aggregate state management
 *
 * @author Enterprise Architecture Team
 * @copyright 2024 PortNumberGenerator™ Corporation
 * @license MIT (Enterprise Edition with Eventual Consistency Guarantee)
 */

import { DistributedDatabase } from '../../distributed-database/database/DistributedDatabase.class';
import { HashShardStrategy } from '../../distributed-database/strategies/implementations/HashShardStrategy.class';
import type { PortEvent } from '../events/base/PortEvent.abstract';

/**
 * Singleton Event Store for persisting and retrieving domain events.
 *
 * The EventStore class provides a centralized repository for all domain events
 * in our event-sourced system. It implements the Singleton pattern to ensure
 * a single, consistent view of the event stream across the entire application.
 *
 * **Core Responsibilities:**
 *
 * 1. **Event Persistence**: Durably store events in the distributed database
 * 2. **Event Retrieval**: Query events by ID, aggregate, type, or time range
 * 3. **Event Ordering**: Maintain chronological ordering of events
 * 4. **Aggregate Support**: Enable aggregate reconstitution via event replay
 * 5. **Distributed Storage**: Leverage sharding for horizontal scalability
 *
 * **Storage Architecture:**
 *
 * Events are stored in a DistributedDatabase with 5 shards and a HashShardStrategy.
 * Each event is keyed by its eventId, ensuring O(1) lookup performance and
 * uniform distribution across shards. The hash-based sharding provides:
 *
 * - **Load Balancing**: Events distributed evenly across shards
 * - **Scalability**: Add more shards as event volume grows
 * - **Fault Tolerance**: Shard failures don't affect other shards
 * - **Predictable Routing**: Same event ID always routes to same shard
 *
 * **Concurrency Model:**
 *
 * The EventStore does not implement explicit locking or concurrency control.
 * We rely on the append-only nature of events and the underlying database's
 * thread safety. In a production system, you would add:
 *
 * - Optimistic concurrency control (version numbers)
 * - Event ordering guarantees (sequence numbers)
 * - Duplicate detection (idempotency checks)
 * - Transaction support (atomic multi-event appends)
 *
 * But this is a hilariously over-engineered demo, not a production system,
 * so we keep it simple (relatively speaking).
 *
 * **Singleton Implementation:**
 *
 * The Singleton pattern is implemented using:
 * - Private constructor to prevent direct instantiation
 * - Static instance field to hold the singleton
 * - Static getInstance() method to provide global access
 * - Lazy initialization (instance created on first access)
 *
 * **Performance Characteristics:**
 *
 * - **append()**: O(1) - Direct hash-based insertion
 * - **getAllEvents()**: O(n) - Full table scan across all shards
 * - **getEventsForAggregate()**: O(n) - Filter scan (could be optimized)
 * - **Memory**: Scales with number of events (all events kept in memory)
 *
 * **Future Enhancements:**
 *
 * In a real production system, you would add:
 * - Event snapshots to reduce replay time
 * - Indexes on aggregateId for faster filtering
 * - Event projections for read-optimized views
 * - Event versioning and schema migration
 * - Streaming event subscriptions
 * - Event archival and retention policies
 *
 * @class EventStore
 * @since 1.0.0
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * // Get singleton instance
 * const store = EventStore.getInstance();
 *
 * // Append events
 * store.append(new PortRequestedEvent('agg-1', context));
 * store.append(new PortCalculatedEvent('agg-1', 6969));
 * store.append(new PortValidatedEvent('agg-1', true));
 * store.append(new PortDeliveredEvent('agg-1', 6969));
 *
 * // Query events
 * const allEvents = store.getAllEvents();
 * const aggEvents = store.getEventsForAggregate('agg-1');
 * ```
 *
 * @example
 * ```typescript
 * // Reset for testing
 * EventStore.resetInstance();
 * const freshStore = EventStore.getInstance();
 * ```
 */
export class EventStore {
	/**
	 * The singleton instance of EventStore.
	 *
	 * This static field holds the single instance of EventStore that is shared
	 * across the entire application. It is initialized lazily on the first call
	 * to getInstance() and reused for all subsequent calls.
	 *
	 * **Design Pattern: Singleton**
	 *
	 * The Singleton pattern ensures that:
	 * - Only one EventStore instance exists at runtime
	 * - All components access the same event stream
	 * - No conflicting state between multiple stores
	 * - Simplified dependency management (no injection needed)
	 *
	 * **Lazy Initialization:**
	 *
	 * The instance is created only when first accessed via getInstance().
	 * This provides:
	 * - Deferred initialization (no startup cost if not used)
	 * - Testability (can reset between tests)
	 * - Thread-safe initialization (in single-threaded JS)
	 *
	 * @private
	 * @static
	 * @type {EventStore | undefined}
	 * @memberof EventStore
	 * @since 1.0.0
	 */
	private static instance: EventStore | undefined;

	/**
	 * The underlying DistributedDatabase used for event persistence.
	 *
	 * This private field holds a reference to the DistributedDatabase instance
	 * that provides the actual storage implementation for events. The database
	 * is configured with 5 shards and a HashShardStrategy to ensure uniform
	 * distribution of events across shards.
	 *
	 * **Storage Configuration:**
	 *
	 * - **Shard Count**: 5 (a prime number for better distribution)
	 * - **Strategy**: HashShardStrategy (consistent key-based routing)
	 * - **Key**: Event ID (eventId property of each event)
	 * - **Value**: Complete event object (all properties preserved)
	 *
	 * **Why 5 Shards?**
	 *
	 * We chose 5 shards because:
	 * - Prime numbers provide better hash distribution
	 * - 5 is small enough for demo purposes
	 * - Large enough to demonstrate sharding benefits
	 * - Easy to mentally visualize and debug
	 * - No particular reason, honestly
	 *
	 * **Data Model:**
	 *
	 * Events are stored as key-value pairs:
	 * - Key: event.eventId (unique string identifier)
	 * - Value: event object (complete PortEvent instance)
	 *
	 * This simple model provides O(1) lookups by event ID but requires
	 * full scans for aggregate queries. In production, you would add
	 * secondary indexes on aggregateId.
	 *
	 * @private
	 * @type {DistributedDatabase}
	 * @memberof EventStore
	 * @since 1.0.0
	 */
	private db: DistributedDatabase;

	/**
	 * Private constructor to enforce Singleton pattern.
	 *
	 * This constructor is marked private to prevent direct instantiation of
	 * EventStore. Clients must use EventStore.getInstance() to obtain the
	 * singleton instance. This ensures that only one EventStore exists in
	 * the application at any given time.
	 *
	 * **Initialization Process:**
	 *
	 * 1. Creates a new DistributedDatabase with 5 shards
	 * 2. Configures HashShardStrategy for consistent key distribution
	 * 3. Stores database reference in private field
	 * 4. Returns (implicitly) the initialized EventStore instance
	 *
	 * **Why Private Constructor?**
	 *
	 * Making the constructor private prevents code like:
	 * ```typescript
	 * const store1 = new EventStore(); // Compile error!
	 * const store2 = new EventStore(); // Would break Singleton
	 * ```
	 *
	 * Instead, clients must use:
	 * ```typescript
	 * const store1 = EventStore.getInstance(); // OK
	 * const store2 = EventStore.getInstance(); // Same instance as store1
	 * ```
	 *
	 * **Thread Safety:**
	 *
	 * In single-threaded JavaScript, this implementation is inherently thread-safe.
	 * In multi-threaded environments (e.g., Web Workers), you would need
	 * additional synchronization mechanisms.
	 *
	 * @private
	 * @constructor
	 * @memberof EventStore
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * // This would be a TypeScript error:
	 * // const store = new EventStore(); // Error: constructor is private
	 *
	 * // Instead, use:
	 * const store = EventStore.getInstance(); // OK
	 * ```
	 */
	private constructor() {
		this.db = new DistributedDatabase(5, new HashShardStrategy());
	}

	/**
	 * Gets the singleton instance of EventStore.
	 *
	 * This static method provides global access to the single EventStore instance.
	 * On first call, it creates the instance using the private constructor. On
	 * subsequent calls, it returns the existing instance. This implements the
	 * classic Singleton pattern with lazy initialization.
	 *
	 * **Lazy Initialization:**
	 *
	 * The EventStore is not created until the first call to getInstance().
	 * This provides several benefits:
	 *
	 * - No initialization cost if EventStore is never used
	 * - Deferred resource allocation (database creation)
	 * - Testability (can reset instance between tests)
	 * - Predictable initialization order
	 *
	 * **Singleton Guarantee:**
	 *
	 * This method ensures that:
	 * ```typescript
	 * const store1 = EventStore.getInstance();
	 * const store2 = EventStore.getInstance();
	 * console.log(store1 === store2); // true (same instance)
	 * ```
	 *
	 * **Thread Safety:**
	 *
	 * In single-threaded JavaScript, this implementation is thread-safe by default.
	 * In multi-threaded environments, you would need double-checked locking or
	 * other synchronization mechanisms to prevent race conditions during initialization.
	 *
	 * **Performance:**
	 *
	 * - First call: O(1) with database initialization overhead
	 * - Subsequent calls: O(1) with simple null check
	 * - Memory: Single instance persists for application lifetime
	 *
	 * @static
	 * @returns {EventStore} The singleton EventStore instance.
	 *
	 * @memberof EventStore
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * // Get singleton instance
	 * const store = EventStore.getInstance();
	 *
	 * // Use the store
	 * store.append(new PortRequestedEvent('agg-1', context));
	 * const events = store.getAllEvents();
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Multiple calls return same instance
	 * const store1 = EventStore.getInstance();
	 * const store2 = EventStore.getInstance();
	 * console.log(store1 === store2); // true
	 * ```
	 */
	public static getInstance(): EventStore {
		if (!EventStore.instance) {
			EventStore.instance = new EventStore();
		}
		return EventStore.instance;
	}

	/**
	 * Resets the singleton instance (useful for testing).
	 *
	 * This static method destroys the current EventStore instance and allows
	 * a fresh instance to be created on the next call to getInstance(). This
	 * is primarily useful for testing scenarios where you want to start with
	 * a clean event store between test cases.
	 *
	 * **Use Cases:**
	 *
	 * - **Test Isolation**: Reset state between unit tests
	 * - **Integration Testing**: Start each test with empty event store
	 * - **Debugging**: Clear event history during development
	 * - **Hot Reload**: Reset state when code changes (in dev mode)
	 *
	 * **Warning:**
	 *
	 * Calling this method destroys all stored events! Use with caution in
	 * production code. This is intended primarily for testing and development.
	 *
	 * **Memory Management:**
	 *
	 * After calling resetInstance(), the old instance becomes eligible for
	 * garbage collection (assuming no other references exist). The underlying
	 * DistributedDatabase and all stored events will be freed.
	 *
	 * @static
	 * @returns {void}
	 *
	 * @memberof EventStore
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * // In a test suite
	 * beforeEach(() => {
	 *   EventStore.resetInstance(); // Fresh store for each test
	 * });
	 *
	 * it('should store events', () => {
	 *   const store = EventStore.getInstance();
	 *   store.append(new PortRequestedEvent('agg-1', context));
	 *   expect(store.getAllEvents()).toHaveLength(1);
	 * });
	 * ```
	 */
	public static resetInstance(): void {
		EventStore.instance = undefined;
	}

	/**
	 * Appends a domain event to the event store.
	 *
	 * This method persists a domain event to the underlying DistributedDatabase,
	 * making it part of the permanent event stream. Events are immutable once
	 * appended and form the single source of truth for aggregate state.
	 *
	 * **Persistence Mechanism:**
	 *
	 * The event is stored in the DistributedDatabase using:
	 * - Key: event.eventId (unique identifier)
	 * - Value: event object (complete event with all properties)
	 * - Shard: Determined by HashShardStrategy based on eventId
	 *
	 * **Append-Only Semantics:**
	 *
	 * Events are never modified or deleted once appended. This provides:
	 * - **Audit Trail**: Complete history of all state changes
	 * - **Temporal Queries**: Query state at any point in time
	 * - **Debugging**: Replay events to reproduce bugs
	 * - **Compliance**: Immutable audit log for regulatory requirements
	 *
	 * **Idempotency:**
	 *
	 * This implementation does NOT check for duplicate events. Appending the
	 * same event twice will result in duplicate storage (both with the same
	 * eventId, which may cause issues). In production, you would add:
	 * - Duplicate detection based on eventId
	 * - Idempotency checks for at-least-once delivery
	 * - Event sequence numbers for ordering
	 *
	 * **Performance:**
	 *
	 * - Time Complexity: O(1) - Direct hash-based insertion
	 * - Space Complexity: O(1) - Single event added to storage
	 * - Shard Distribution: Events spread across shards via hash
	 *
	 * @param {PortEvent} event - The domain event to append to the store.
	 *   Must be a valid PortEvent instance (or subclass) with a unique eventId.
	 *
	 * @returns {void} This method does not return a value. Events are persisted
	 *   synchronously (in this in-memory implementation).
	 *
	 * @memberof EventStore
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const store = EventStore.getInstance();
	 * const event = new PortRequestedEvent('agg-123', context);
	 * store.append(event);
	 * console.log('Event persisted');
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Append a complete saga
	 * const aggId = 'agg-456';
	 * store.append(new PortRequestedEvent(aggId, context));
	 * store.append(new PortCalculatedEvent(aggId, 6969));
	 * store.append(new PortValidatedEvent(aggId, true));
	 * store.append(new PortDeliveredEvent(aggId, 6969));
	 * ```
	 */
	public append(event: PortEvent): void {
		this.db.insert(event.eventId, event);
	}

	/**
	 * Retrieves all events from the event store.
	 *
	 * This method performs a full scan across all shards of the DistributedDatabase
	 * and returns every stored event. The events are returned in no particular
	 * order (though they can be sorted by timestamp if needed).
	 *
	 * **Use Cases:**
	 *
	 * - **Full Event Replay**: Reconstruct entire system state from scratch
	 * - **Analytics**: Analyze all events for patterns and insights
	 * - **Debugging**: Inspect complete event history
	 * - **Migration**: Export events for backup or system migration
	 * - **Testing**: Verify event storage and retrieval
	 *
	 * **Performance Warning:**
	 *
	 * This method performs a full table scan across all shards, which has
	 * O(n) complexity where n is the total number of events. For large event
	 * stores, this can be slow and memory-intensive. In production, you would:
	 *
	 * - Add pagination (limit/offset or cursor-based)
	 * - Implement streaming APIs for large result sets
	 * - Use event projections for read-optimized views
	 * - Cache frequently accessed event ranges
	 *
	 * **Type Safety:**
	 *
	 * The return type is `PortEvent[]`, which is actually a lie (kind of).
	 * The underlying database stores values as `unknown`, so we cast them
	 * to `PortEvent[]`. This works because we only store PortEvent instances,
	 * but it's not type-safe at the database level. In production, you would
	 * add runtime validation to ensure type safety.
	 *
	 * **Ordering:**
	 *
	 * Events are returned in the order they appear in the database, which is
	 * not guaranteed to be chronological. To sort by timestamp:
	 * ```typescript
	 * const events = store.getAllEvents().sort((a, b) => a.timestamp - b.timestamp);
	 * ```
	 *
	 * @returns {PortEvent[]} An array of all events in the store. May be empty
	 *   if no events have been appended. Events are NOT sorted by default.
	 *
	 * @memberof EventStore
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const store = EventStore.getInstance();
	 * const allEvents = store.getAllEvents();
	 * console.log(`Total events: ${allEvents.length}`);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Get events sorted by timestamp
	 * const events = store.getAllEvents()
	 *   .sort((a, b) => a.timestamp - b.timestamp);
	 *
	 * events.forEach(event => {
	 *   console.log(`${event.getEventType()} at ${event.toISOString()}`);
	 * });
	 * ```
	 */
	public getAllEvents(): PortEvent[] {
		return this.db.queryAll() as PortEvent[];
	}

	/**
	 * Retrieves all events for a specific aggregate.
	 *
	 * This method filters the event store to return only events belonging to
	 * the specified aggregate ID. This is the primary mechanism for aggregate
	 * hydration - replaying an aggregate's event stream to reconstruct its
	 * current state.
	 *
	 * **Aggregate Hydration:**
	 *
	 * In event sourcing, aggregates are reconstituted by replaying their events:
	 * ```typescript
	 * const events = store.getEventsForAggregate('agg-123');
	 * const aggregate = new PortAggregate('agg-123');
	 * events.forEach(event => aggregate.apply(event));
	 * // Aggregate now reflects current state
	 * ```
	 *
	 * **Performance Characteristics:**
	 *
	 * - Time Complexity: O(n) where n is total number of events (full scan)
	 * - Space Complexity: O(m) where m is events for this aggregate
	 * - Optimization Opportunity: Add index on aggregateId for O(m) lookups
	 *
	 * **Implementation Note:**
	 *
	 * This method performs a full scan of all events and filters client-side.
	 * This is inefficient for large event stores. In production, you would:
	 *
	 * - Add a secondary index on aggregateId in the database
	 * - Store aggregate events in dedicated partitions
	 * - Use event snapshots to reduce replay time
	 * - Implement aggregate-specific event streams
	 *
	 * **Event Ordering:**
	 *
	 * Events are returned in the order they appear in the database. For proper
	 * aggregate hydration, you should sort by timestamp:
	 * ```typescript
	 * const events = store.getEventsForAggregate('agg-123')
	 *   .sort((a, b) => a.timestamp - b.timestamp);
	 * ```
	 *
	 * **Empty Results:**
	 *
	 * If no events exist for the specified aggregate, this method returns an
	 * empty array. This is normal for new aggregates that haven't generated
	 * events yet.
	 *
	 * @param {string} aggregateId - The unique identifier of the aggregate whose
	 *   events should be retrieved. Must match the aggregateId property of events.
	 *
	 * @returns {PortEvent[]} An array of events belonging to the specified
	 *   aggregate. May be empty if no events exist. Events are NOT sorted by
	 *   default - sort by timestamp for chronological order.
	 *
	 * @memberof EventStore
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * // Get events for aggregate hydration
	 * const store = EventStore.getInstance();
	 * const events = store.getEventsForAggregate('agg-123');
	 * console.log(`Found ${events.length} events for aggregate agg-123`);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Hydrate an aggregate
	 * const events = store.getEventsForAggregate('agg-123')
	 *   .sort((a, b) => a.timestamp - b.timestamp);
	 *
	 * const aggregate = new PortAggregate('agg-123');
	 * events.forEach(event => aggregate.apply(event));
	 * console.log('Aggregate hydrated from event stream');
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Check if aggregate has events
	 * const events = store.getEventsForAggregate('agg-456');
	 * if (events.length === 0) {
	 *   console.log('New aggregate with no history');
	 * } else {
	 *   console.log(`Aggregate has ${events.length} events`);
	 * }
	 * ```
	 */
	public getEventsForAggregate(aggregateId: string): PortEvent[] {
		return this.getAllEvents().filter((e) => e.aggregateId === aggregateId);
	}

	/**
	 * Returns the total count of events in the store.
	 *
	 * This convenience method returns the total number of events across all
	 * aggregates and all shards. Useful for metrics, monitoring, and debugging.
	 *
	 * @returns {number} The total number of events in the store.
	 *
	 * @memberof EventStore
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const count = EventStore.getInstance().getEventCount();
	 * console.log(`Total events in store: ${count}`);
	 * ```
	 */
	public getEventCount(): number {
		return this.getAllEvents().length;
	}

	/**
	 * Checks if any events exist for the specified aggregate.
	 *
	 * This convenience method determines whether an aggregate has any events
	 * in the store, which is useful for checking if an aggregate exists or
	 * if this is a new aggregate.
	 *
	 * @param {string} aggregateId - The aggregate ID to check.
	 * @returns {boolean} True if at least one event exists for this aggregate.
	 *
	 * @memberof EventStore
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * if (store.hasEventsForAggregate('agg-123')) {
	 *   console.log('Existing aggregate');
	 * } else {
	 *   console.log('New aggregate');
	 * }
	 * ```
	 */
	public hasEventsForAggregate(aggregateId: string): boolean {
		return this.getEventsForAggregate(aggregateId).length > 0;
	}
}

/**
 * Module metadata for introspection and debugging.
 */
export const MODULE_METADATA = {
	name: 'infrastructure/event-sourcing/store/EventStore',
	version: '1.0.0',
	author: 'Enterprise Architecture Team',
	exports: ['EventStore', 'MODULE_METADATA'],
	description: 'Singleton Event Store for persisting and retrieving domain events',
	patterns: ['Singleton', 'Event Store', 'Repository'],
	backingStore: 'DistributedDatabase with HashShardStrategy',
	shardCount: 5,
	linesOfCode: 720,
	overEngineeringLevel: 9.5,
} as const;

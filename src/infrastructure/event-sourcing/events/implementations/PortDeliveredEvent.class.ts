/**
 * @fileoverview Port Delivered Event - Domain Event for Port Number Delivery Completion
 *
 * This file contains the concrete implementation of the PortDeliveredEvent class,
 * which represents the final domain event that occurs when a validated port number
 * has been successfully delivered to the requesting client. This event marks the
 * triumphant conclusion of the port allocation saga and carries the delivered port
 * number as proof that our hilariously over-engineered Port Number Generation
 * system has successfully completed its mission of... generating a port number.
 *
 * @module infrastructure/event-sourcing/events/implementations
 * @category Event Sourcing
 * @subcategory Domain Events
 * @since 1.0.0
 * @version 6.02214.076
 *
 * @remarks
 * The PortDeliveredEvent is the FOURTH and FINAL event in the port allocation
 * lifecycle, representing the happy ending to our distributed, event-sourced,
 * VM-compiled, saga-orchestrated journey of port number generation. It encapsulates:
 *
 * 1. **Delivered Port Number**: The actual port value that was successfully
 *    delivered to the requestor. This is typically the same port that was
 *    calculated and validated in previous events, but we store it again here
 *    for event completeness and to make querying easier.
 *
 * 2. **Aggregate Correlation**: The aggregate ID inherited from the base PortEvent
 *    class, ensuring this event can be correlated with all preceding events in
 *    the port allocation saga.
 *
 * 3. **Temporal Metadata**: Automatic timestamp capture via the PortEvent base
 *    class, enabling precise tracking of when the delivery completed and allowing
 *    us to calculate end-to-end saga duration.
 *
 * This event serves several critical purposes in our event-sourced architecture:
 *
 * - **Saga Completion**: Marks the successful completion of the port allocation
 *   saga, indicating that no further processing is required.
 *
 * - **Audit Trail**: Provides an immutable record of what port was delivered,
 *   to whom (implicitly via aggregate correlation), and when.
 *
 * - **Analytics**: Enables calculation of saga duration, delivery success rates,
 *   and system performance metrics.
 *
 * - **Idempotency**: Allows clients to check if a port has already been delivered
 *   for a given aggregate, enabling idempotent request handling.
 *
 * **Philosophical Note:**
 *
 * One might argue that storing the port number in this event is redundant since
 * we already have it in PortCalculatedEvent. However, in the grand tradition of
 * enterprise over-engineering, we store it again here because:
 *
 * - **Denormalization**: Makes queries faster (don't need to search for PortCalculatedEvent)
 * - **Event Completeness**: Each event should be self-contained and meaningful
 * - **Future-Proofing**: What if the delivered port differs from calculated? (It won't, but what if?)
 * - **Resume Semantics**: Easier to resume from this event without looking at history
 * - **Because We Can**: The ultimate reason for any over-engineering decision
 *
 * @example
 * ```typescript
 * import { PortDeliveredEvent } from './PortDeliveredEvent.class';
 *
 * // After successful port delivery to requestor
 * const deliveredPort = 6969;
 * const event = new PortDeliveredEvent('aggregate-123', deliveredPort);
 *
 * // Access event properties
 * console.log(event.port);           // 6969
 * console.log(event.aggregateId);    // 'aggregate-123'
 * console.log(event.getAge());       // Time since delivery
 * console.log(event.isFrontendPort()); // true
 * ```
 *
 * @see {@link PortEvent} for the abstract base class
 * @see {@link PortValidatedEvent} for the preceding event in the lifecycle
 * @see {@link PortRequestedEvent} for the first event in the lifecycle
 * @see {@link EventStore} for event persistence mechanisms
 * @see {@link PortAggregate} for aggregate state management
 *
 * @author Enterprise Architecture Team
 * @copyright 2024 PortNumberGenerator™ Corporation
 * @license MIT (Enterprise Edition with Delivery Guarantee SLA)
 */

import { PortEvent } from '../base/PortEvent.abstract';

/**
 * Domain event representing the successful delivery of a port number to the requestor.
 *
 * This concrete event class extends the abstract PortEvent base class and
 * carries the delivered port number as its primary payload. When the port
 * delivery subsystem successfully transmits the validated port number to the
 * requesting client and receives confirmation of receipt, a PortDeliveredEvent
 * is created and appended to the event store, marking the glorious conclusion
 * of the port allocation saga.
 *
 * **Domain Significance:**
 *
 * In our event-sourced architecture, PortDeliveredEvent represents the final
 * state transition in the port allocation domain. It captures:
 *
 * - What port number was delivered (via the port property)
 * - When the delivery completed (via inherited timestamp)
 * - Which aggregate this delivery belongs to (via aggregateId)
 * - Implicitly, to whom it was delivered (via aggregate correlation to PortRequestedEvent)
 *
 * **Lifecycle Position:**
 *
 * This event is the FOURTH and FINAL event in the port allocation lifecycle:
 *
 * 1. PortRequestedEvent (request initiation)
 * 2. PortCalculatedEvent (calculation completion)
 * 3. PortValidatedEvent (validation completion)
 * 4. **PortDeliveredEvent** ← YOU ARE HERE (THE END)
 *
 * Once this event is appended to the event store, the port allocation saga is
 * complete, and the aggregate transitions to its final "delivered" state. No
 * further events are expected for this aggregate (unless we implement retry
 * logic, compensation, or other advanced features in the future).
 *
 * **Delivered Port Semantics:**
 *
 * In our canonical implementation, the delivered port should match the port
 * that was calculated and validated in previous events:
 *
 * - **Frontend Requests**: Port 6969 (SEX_NUMBER)
 * - **Backend Requests**: Port 42069 (SNOOP_DOGG_NUMBER)
 * - **Other Requests**: Dynamically calculated ports
 *
 * However, in a more complex system, the delivered port might differ from the
 * calculated port (e.g., if port allocation failed and a fallback port was
 * delivered). Our architecture supports this flexibility, even if we don't
 * currently use it.
 *
 * **Success Semantics:**
 *
 * The mere existence of a PortDeliveredEvent implies successful delivery. If
 * delivery failed, this event would not be created (or we would create a
 * PortDeliveryFailedEvent, which we haven't implemented because we're optimists
 * who believe all deliveries succeed).
 *
 * **Immutability Contract:**
 *
 * Like all events in our system, PortDeliveredEvent is immutable once created.
 * The port property is readonly and cannot be modified after construction,
 * ensuring that the event remains a faithful historical record of what was
 * delivered and when.
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
 *   // PortDeliveredEvent-specific
 *   port: number
 * }
 * ```
 *
 * **Performance Characteristics:**
 *
 * - **Memory Footprint**: Minimal - just one additional number (8 bytes)
 * - **Construction Time**: O(1) - super() call plus one property assignment
 * - **Serialization Size**: < 200 bytes typically (compact JSON representation)
 * - **Emotional Impact**: Priceless (the satisfaction of saga completion)
 *
 * @class PortDeliveredEvent
 * @extends {PortEvent}
 *
 * @property {number} port - The delivered port number. This is the primary payload
 *   of this event and represents the final port value that was successfully
 *   transmitted to the requesting client. In normal operation, this should match
 *   the port from PortCalculatedEvent, but storing it again here provides event
 *   completeness and makes queries more efficient.
 *
 * @since 1.0.0
 * @version 1.1.111
 *
 * @example
 * ```typescript
 * // Create event after successful delivery
 * const event = new PortDeliveredEvent('agg-1', 6969);
 *
 * // Access properties
 * console.log(event.port);           // 6969
 * console.log(event.aggregateId);    // 'agg-1'
 * console.log(event.getAge());       // Time since delivery
 *
 * // Use convenience methods
 * console.log(event.isFrontendPort()); // true
 * console.log(event.isBackendPort());  // false
 * console.log(event.isValidPort());    // true
 * ```
 *
 * @example
 * ```typescript
 * // Integration with EventStore - complete saga
 * import { EventStore } from '../../store/EventStore.class';
 * import { PortRequestedEvent } from './PortRequestedEvent.class';
 * import { PortCalculatedEvent } from './PortCalculatedEvent.class';
 * import { PortValidatedEvent } from './PortValidatedEvent.class';
 *
 * const store = EventStore.getInstance();
 * const aggId = 'agg-1';
 *
 * // Append all events in order
 * store.append(new PortRequestedEvent(aggId, context));
 * store.append(new PortCalculatedEvent(aggId, 6969));
 * store.append(new PortValidatedEvent(aggId, true));
 * store.append(new PortDeliveredEvent(aggId, 6969)); // Saga complete!
 *
 * // Check if port was delivered
 * const events = store.getEventsForAggregate(aggId);
 * const delivered = events.some(e => e instanceof PortDeliveredEvent);
 * console.log(`Port delivered: ${delivered}`); // true
 * ```
 */
export class PortDeliveredEvent extends PortEvent {
	/**
	 * The delivered port number representing the final output of the port allocation saga.
	 *
	 * This property holds the primary payload of the PortDeliveredEvent - the
	 * actual port number that was successfully delivered to the requesting client.
	 * The value stored here represents the culmination of:
	 *
	 * 1. **Request Processing**: The original port request was received and parsed
	 * 2. **VM Execution**: The Virtual Machine computed the appropriate port
	 * 3. **Validation**: The port passed all validation rules and constraints
	 * 4. **Delivery**: The port was transmitted to the client and acknowledged
	 *
	 * **Relationship to Previous Events:**
	 *
	 * In typical operation, this port value should match the port from the
	 * PortCalculatedEvent that preceded this event. However, we store it again
	 * here for several reasons:
	 *
	 * - **Event Completeness**: Each event should be self-contained and tell a
	 *   complete story without requiring correlation with other events
	 *
	 * - **Query Efficiency**: Clients can find the delivered port by looking only
	 *   at PortDeliveredEvent rather than searching for PortCalculatedEvent
	 *
	 * - **Flexibility**: In a more complex system, the delivered port might differ
	 *   from the calculated port (e.g., fallback logic, port substitution)
	 *
	 * - **Resume Semantics**: If a process crashes and resumes, it can determine
	 *   the delivered port without replaying the entire event stream
	 *
	 * **Valid Range:**
	 *
	 * This value should be within the valid TCP/UDP port range (1-65535), though
	 * we don't enforce this constraint at the event level, trusting that upstream
	 * validation (in PortValidatedEvent) has already verified port validity.
	 *
	 * **Canonical Values:**
	 *
	 * In typical operation, this property will contain:
	 * - **6969**: The canonical frontend port (SEX_NUMBER)
	 * - **42069**: The canonical backend port (SNOOP_DOGG_NUMBER)
	 * - **Other**: Dynamically calculated ports for special cases
	 *
	 * **Immutability:**
	 *
	 * This property is readonly, enforcing the immutability contract of all events.
	 * Once a port is delivered and the event is created, the port value cannot be
	 * changed. This ensures data integrity and provides a reliable audit trail of
	 * what was actually delivered to clients.
	 *
	 * **Success Indicator:**
	 *
	 * The presence of this property (and this event) implicitly indicates successful
	 * delivery. If delivery failed, this event would not exist. This is an example
	 * of the "absence of evidence is evidence of absence" pattern in event sourcing.
	 *
	 * @readonly
	 * @type {number}
	 * @memberof PortDeliveredEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortDeliveredEvent('agg-1', 6969);
	 * console.log(event.port); // 6969
	 *
	 * // This would be a TypeScript error:
	 * // event.port = 8080; // Error: Cannot assign to 'port' because it is readonly
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Use in notification logic
	 * function notifyClient(event: PortDeliveredEvent): void {
	 *   console.log(`Port ${event.port} has been delivered to aggregate ${event.aggregateId}`);
	 *   sendNotification({
	 *     message: `Your port is ready: ${event.port}`,
	 *     aggregateId: event.aggregateId
	 *   });
	 * }
	 * ```
	 */
	public readonly port: number;

	/**
	 * Constructs a new PortDeliveredEvent instance.
	 *
	 * This constructor creates an immutable event representing the successful
	 * delivery of a port number to the requesting client. It accepts the aggregate
	 * identifier and the delivered port number, then delegates to the parent
	 * PortEvent constructor to initialize common event properties.
	 *
	 * **Construction Process:**
	 *
	 * 1. **Base Initialization**: Calls super(aggregateId) to initialize inherited
	 *    properties from PortEvent (timestamp, eventId, aggregateId). This captures
	 *    the precise moment when the delivery completed, allowing us to calculate
	 *    end-to-end saga duration.
	 *
	 * 2. **Port Assignment**: Stores the delivered port number as a readonly
	 *    property, making it accessible for queries, analytics, and client
	 *    notification systems.
	 *
	 * **Parameter Expectations:**
	 *
	 * This constructor assumes (but does not validate) that:
	 *
	 * - aggregateId is a non-empty string matching an existing aggregate that has
	 *   gone through the request → calculate → validate phases
	 * - port is a valid port number (1-65535) that has already been validated
	 * - delivery has actually succeeded (we trust the caller to only create this
	 *   event after confirming successful delivery)
	 *
	 * We rely on TypeScript's type system and upstream validation rather than
	 * implementing redundant runtime checks. This design choice reflects our
	 * philosophy of trusting domain boundaries and avoiding defensive programming
	 * at every layer (though some would argue this is reckless optimism).
	 *
	 * **Performance:**
	 *
	 * This constructor executes in O(1) constant time with negligible overhead:
	 * - One super() call (Date.now() and Math.random())
	 * - One primitive number assignment
	 * - No allocations beyond the object itself
	 * - No external I/O or network calls
	 * - Completes in microseconds on modern hardware
	 *
	 * **Memory:**
	 *
	 * The memory footprint is minimal:
	 * - Inherited properties: ~100 bytes (strings and timestamp)
	 * - Port number: 8 bytes (JavaScript number is 64-bit float)
	 * - Object overhead: ~20-40 bytes (V8 engine internals)
	 * - Total: ~150 bytes per event instance
	 *
	 * **Emotional Impact:**
	 *
	 * Calling this constructor should give you a warm fuzzy feeling, knowing that
	 * your hilariously over-engineered port allocation saga has successfully
	 * completed and the client now has their port number. Celebrate responsibly.
	 *
	 * @constructor
	 * @param {string} aggregateId - The unique identifier of the aggregate root
	 *   that this event belongs to. This ID correlates the delivery event with
	 *   all preceding events in the port allocation saga, enabling efficient
	 *   event stream filtering and aggregate reconstitution.
	 *
	 * @param {number} port - The delivered port number. This should be a valid
	 *   port number (1-65535) that has been calculated, validated, and successfully
	 *   transmitted to the requesting client. Common values are 6969 (frontend)
	 *   and 42069 (backend).
	 *
	 * @throws {TypeError} If parameters are not of expected types (though TypeScript
	 *   should prevent this at compile time, and we trust TypeScript with our lives).
	 *
	 * @since 1.0.0
	 * @version 1.0.0
	 *
	 * @example
	 * ```typescript
	 * // Create event after successful delivery to frontend
	 * const event = new PortDeliveredEvent('agg-123', 6969);
	 *
	 * // Event is now ready for persistence
	 * console.log(event.eventId);       // 'k9j3h2g1'
	 * console.log(event.aggregateId);   // 'agg-123'
	 * console.log(event.port);          // 6969
	 * console.log(event.timestamp);     // Current Unix timestamp
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Create event for backend delivery
	 * const backendPort = 42069;
	 * const event = new PortDeliveredEvent('agg-456', backendPort);
	 *
	 * // Append to event store to complete the saga
	 * EventStore.getInstance().append(event);
	 *
	 * // Notify monitoring systems
	 * console.log(`Saga complete for aggregate ${event.aggregateId}`);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Complete saga flow
	 * const aggId = 'agg-789';
	 * const store = EventStore.getInstance();
	 *
	 * store.append(new PortRequestedEvent(aggId, context));
	 * const port = calculatePort(context); // Returns 6969 or 42069
	 * store.append(new PortCalculatedEvent(aggId, port));
	 * store.append(new PortValidatedEvent(aggId, true));
	 * deliverPortToClient(port); // Actual delivery logic
	 * store.append(new PortDeliveredEvent(aggId, port)); // Success!
	 * ```
	 */
	constructor(aggregateId: string, port: number) {
		super(aggregateId);
		this.port = port;
	}

	/**
	 * Checks if the delivered port is the canonical frontend port (6969).
	 *
	 * This convenience method determines whether the delivered port matches
	 * the well-known frontend port number (6969, also known as SEX_NUMBER in
	 * our legacy constants). This is useful for analytics, logging, and
	 * post-delivery processing logic.
	 *
	 * @returns {boolean} True if the port is 6969 (the frontend port).
	 *
	 * @memberof PortDeliveredEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortDeliveredEvent('agg-1', 6969);
	 * if (event.isFrontendPort()) {
	 *   console.log('Frontend port successfully delivered');
	 * }
	 * ```
	 */
	public isFrontendPort(): boolean {
		return this.port === 6969;
	}

	/**
	 * Checks if the delivered port is the canonical backend port (42069).
	 *
	 * This convenience method determines whether the delivered port matches
	 * the well-known backend port number (42069, also known as SNOOP_DOGG_NUMBER
	 * in our legacy constants). This is useful for analytics, logging, and
	 * post-delivery processing logic.
	 *
	 * @returns {boolean} True if the port is 42069 (the backend port).
	 *
	 * @memberof PortDeliveredEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortDeliveredEvent('agg-1', 42069);
	 * if (event.isBackendPort()) {
	 *   console.log('Backend port successfully delivered');
	 * }
	 * ```
	 */
	public isBackendPort(): boolean {
		return this.port === 42069;
	}

	/**
	 * Checks if the delivered port is within the valid port number range.
	 *
	 * This method validates that the port number falls within the valid TCP/UDP
	 * port range (1-65535). In a properly functioning system, this should always
	 * return true because validation occurs in the PortValidatedEvent phase.
	 * However, this method is useful for defensive programming and catching bugs.
	 *
	 * @returns {boolean} True if the port is in the range 1-65535 (inclusive).
	 *
	 * @memberof PortDeliveredEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortDeliveredEvent('agg-1', 6969);
	 * console.log(event.isValidPort()); // true
	 * ```
	 */
	public isValidPort(): boolean {
		return this.port >= 1 && this.port <= 65535;
	}

	/**
	 * Returns the port number as a string.
	 *
	 * This convenience method converts the port number to a string, which is
	 * useful for logging, display in user interfaces, and string concatenation.
	 *
	 * @returns {string} The port number as a string.
	 *
	 * @memberof PortDeliveredEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortDeliveredEvent('agg-1', 6969);
	 * console.log('Delivered port: ' + event.getPortAsString()); // '6969'
	 * ```
	 */
	public getPortAsString(): string {
		return this.port.toString();
	}

	/**
	 * Serializes the event to a JSON string, including the delivered port.
	 *
	 * This method overrides the base PortEvent.toJSON() implementation to include
	 * the delivered port number in the serialized output. This is essential for
	 * proper event persistence, network transmission, and debugging.
	 *
	 * @returns {string} A JSON string representation of the complete event,
	 *   including inherited properties and the delivered port.
	 *
	 * @memberof PortDeliveredEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortDeliveredEvent('agg-1', 6969);
	 * const json = event.toJSON();
	 * console.log(json);
	 * // {"timestamp":1704067200000,"eventId":"k9j3h2g1","aggregateId":"agg-1","port":6969}
	 * ```
	 */
	public toJSON(): string {
		return JSON.stringify({
			timestamp: this.timestamp,
			eventId: this.eventId,
			aggregateId: this.aggregateId,
			port: this.port,
		});
	}

	/**
	 * Returns a detailed human-readable string representation of the event.
	 *
	 * This method overrides the base toString() to include the delivered port
	 * number, making log messages more informative and debugging easier.
	 *
	 * @returns {string} A detailed string representation.
	 *
	 * @memberof PortDeliveredEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortDeliveredEvent('agg-1', 6969);
	 * console.log(event.toString());
	 * // "PortDeliveredEvent[k9j3h2g1 @ agg-1] port=6969"
	 * ```
	 */
	public toString(): string {
		return `${super.toString()} port=${this.port}`;
	}
}

/**
 * Type guard to check if an event is a PortDeliveredEvent.
 *
 * This utility function provides a type-safe way to check if an event is an
 * instance of PortDeliveredEvent, enabling TypeScript to narrow the type in
 * conditional blocks. This is particularly useful for saga completion checks
 * and determining whether a port has been delivered for a given aggregate.
 *
 * @param {PortEvent} event - The event to check.
 * @returns {boolean} True if the event is a PortDeliveredEvent.
 *
 * @example
 * ```typescript
 * if (isPortDeliveredEvent(event)) {
 *   // TypeScript knows event is PortDeliveredEvent here
 *   console.log(`Port delivered: ${event.port}`);
 *   console.log('Saga is complete!');
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Check if saga is complete
 * const events = EventStore.getInstance().getEventsForAggregate('agg-1');
 * const sagaComplete = events.some(isPortDeliveredEvent);
 * if (sagaComplete) {
 *   console.log('Port has been delivered');
 * }
 * ```
 */
export function isPortDeliveredEvent(event: PortEvent): event is PortDeliveredEvent {
	return event instanceof PortDeliveredEvent;
}

/**
 * Module metadata for introspection and debugging.
 */
export const MODULE_METADATA = {
	name: 'infrastructure/event-sourcing/events/implementations/PortDeliveredEvent',
	version: '1.0.0',
	author: 'Enterprise Architecture Team',
	exports: ['PortDeliveredEvent', 'isPortDeliveredEvent', 'MODULE_METADATA'],
	description: 'Domain event representing the successful delivery of a port number to the requestor',
	eventType: 'PortDeliveredEvent',
	lifecyclePosition: 'FOURTH_AND_FINAL',
	linesOfCode: 570,
	overEngineeringLevel: 10,
	emotionalImpact: 'Triumphant saga completion',
} as const;

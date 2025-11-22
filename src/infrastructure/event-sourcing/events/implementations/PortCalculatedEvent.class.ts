/**
 * @fileoverview Port Calculated Event - Domain Event for Port Number Calculation Completion
 *
 * This file contains the concrete implementation of the PortCalculatedEvent class,
 * which represents the domain event that occurs when a port number has been
 * successfully calculated by our hilariously over-engineered Virtual Machine (VM)
 * and Compiler subsystem. This event marks the completion of the computation phase
 * in the port allocation saga and carries the calculated port number that will
 * subsequently undergo validation before delivery to the requestor.
 *
 * @module infrastructure/event-sourcing/events/implementations
 * @category Event Sourcing
 * @subcategory Domain Events
 * @since 1.0.0
 * @version 3.14159.26535
 *
 * @remarks
 * The PortCalculatedEvent is the SECOND event in the port allocation lifecycle,
 * occurring after PortRequestedEvent and before PortValidatedEvent. It encapsulates:
 *
 * 1. **Computed Port Number**: The actual port value calculated by the VM/Compiler,
 *    which is typically either 6969 (for frontend) or 42069 (for backend), though
 *    our system is flexible enough to support any port number within the valid range.
 *
 * 2. **Aggregate Correlation**: The aggregate ID inherited from the base PortEvent
 *    class, ensuring this event can be correlated with its originating request.
 *
 * 3. **Temporal Metadata**: Automatic timestamp capture via the PortEvent base
 *    class, enabling precise tracking of when the calculation completed.
 *
 * This event serves several critical purposes in our event-sourced architecture:
 *
 * - **State Transition**: Marks the transition from "requested" to "calculated"
 *   in the aggregate's state machine.
 *
 * - **Audit Trail**: Provides an immutable record of the calculated port value
 *   and when it was computed, essential for debugging and compliance.
 *
 * - **Saga Coordination**: Triggers the next step in the port allocation saga,
 *   namely the validation phase.
 *
 * - **Analytics**: Enables analysis of calculation performance, port distribution,
 *   and system behavior patterns.
 *
 * @example
 * ```typescript
 * import { PortCalculatedEvent } from './PortCalculatedEvent.class';
 *
 * // After VM executes and computes a port number
 * const calculatedPort = 6969;
 * const event = new PortCalculatedEvent('aggregate-123', calculatedPort);
 *
 * // Access event properties
 * console.log(event.port);          // 6969
 * console.log(event.aggregateId);   // 'aggregate-123'
 * console.log(event.getAge());      // Time since calculation
 * console.log(event.isFrontendPort()); // true
 * ```
 *
 * @see {@link PortEvent} for the abstract base class
 * @see {@link PortRequestedEvent} for the preceding event in the lifecycle
 * @see {@link PortValidatedEvent} for the subsequent event in the lifecycle
 * @see {@link EventStore} for event persistence mechanisms
 * @see {@link PortAggregate} for aggregate state management
 *
 * @author Enterprise Architecture Team
 * @copyright 2024 PortNumberGenerator™ Corporation
 * @license MIT (Enterprise Edition with Blockchain Integration)
 */

import { PortEvent } from '../base/PortEvent.abstract';

/**
 * Domain event representing the successful calculation of a port number.
 *
 * This concrete event class extends the abstract PortEvent base class and
 * carries the calculated port number as its primary payload. When the Virtual
 * Machine (VM) completes execution of the port calculation bytecode and the
 * Compiler determines the appropriate port value based on the request context,
 * a PortCalculatedEvent is created and appended to the event store.
 *
 * **Domain Significance:**
 *
 * In our event-sourced architecture, PortCalculatedEvent represents a critical
 * state transition in the port allocation domain. It captures:
 *
 * - What port number was calculated (via the port property)
 * - When the calculation completed (via inherited timestamp)
 * - Which aggregate this calculation belongs to (via aggregateId)
 *
 * **Lifecycle Position:**
 *
 * This event is the SECOND event in the typical port allocation lifecycle:
 *
 * 1. PortRequestedEvent (request initiation)
 * 2. **PortCalculatedEvent** ← YOU ARE HERE
 * 3. PortValidatedEvent (validation completion)
 * 4. PortDeliveredEvent (delivery to requestor)
 *
 * **Port Number Semantics:**
 *
 * In our canonical implementation, the calculated port follows these conventions:
 *
 * - **Frontend Requests**: Typically receive port 6969 (the SEX_NUMBER constant)
 * - **Backend Requests**: Typically receive port 42069 (the SNOOP_DOGG_NUMBER constant)
 * - **Other Requests**: May receive dynamically calculated ports based on complex
 *   business rules executed in the VM
 *
 * However, our architecture is flexible enough to support any valid port number
 * (1-65535) as determined by the VM/Compiler subsystem.
 *
 * **Immutability Contract:**
 *
 * Like all events in our system, PortCalculatedEvent is immutable once created.
 * The port property is readonly and cannot be modified after construction,
 * ensuring that the event remains a faithful historical record of what was
 * calculated at a specific point in time.
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
 *   // PortCalculatedEvent-specific
 *   port: number
 * }
 * ```
 *
 * **Performance Characteristics:**
 *
 * - **Memory Footprint**: Extremely minimal - just one additional number (8 bytes)
 * - **Construction Time**: O(1) - super() call plus one property assignment
 * - **Serialization Size**: < 200 bytes typically (compact JSON representation)
 *
 * @class PortCalculatedEvent
 * @extends {PortEvent}
 *
 * @property {number} port - The calculated port number. This is the primary payload
 *   of this event and represents the result of the VM/Compiler computation. Valid
 *   port numbers range from 1 to 65535 (inclusive), though our system typically
 *   uses well-known port numbers (6969 for frontend, 42069 for backend) for
 *   consistency and comedic effect.
 *
 * @since 1.0.0
 * @version 2.0.1
 *
 * @example
 * ```typescript
 * // Create event after VM calculation
 * const event = new PortCalculatedEvent('agg-1', 6969);
 *
 * // Access properties
 * console.log(event.port);           // 6969
 * console.log(event.aggregateId);    // 'agg-1'
 * console.log(event.getAge());       // Time since calculation
 *
 * // Use convenience methods
 * console.log(event.isFrontendPort()); // true
 * console.log(event.isBackendPort());  // false
 * console.log(event.isValidPort());    // true
 * ```
 *
 * @example
 * ```typescript
 * // Integration with EventStore
 * import { EventStore } from '../../store/EventStore.class';
 *
 * const event = new PortCalculatedEvent('agg-1', 42069);
 * const store = EventStore.getInstance();
 * store.append(event);
 *
 * // Later, retrieve and process
 * const events = store.getEventsForAggregate('agg-1');
 * const calcEvent = events.find(e => e instanceof PortCalculatedEvent);
 * if (calcEvent instanceof PortCalculatedEvent) {
 *   console.log(`Calculated port: ${calcEvent.port}`);
 * }
 * ```
 */
export class PortCalculatedEvent extends PortEvent {
	/**
	 * The calculated port number representing the result of VM/Compiler execution.
	 *
	 * This property holds the primary payload of the PortCalculatedEvent - the
	 * actual port number that was calculated by our hilariously over-engineered
	 * port generation subsystem. The value stored here is the output of:
	 *
	 * 1. **VM Execution**: The Virtual Machine executes bytecode instructions
	 *    compiled from high-level port allocation logic.
	 *
	 * 2. **Compiler Optimization**: The Compiler may apply optimizations and
	 *    caching strategies to improve calculation performance.
	 *
	 * 3. **Business Rules**: The calculated port reflects all applicable business
	 *    rules, including requestor-specific routing (frontend vs. backend) and
	 *    any dynamic port allocation logic.
	 *
	 * **Valid Range:**
	 *
	 * Theoretically, this value should be within the valid TCP/UDP port range:
	 * - **Well-Known Ports**: 0-1023 (typically avoided in our system)
	 * - **Registered Ports**: 1024-49151 (we use 6969 and 42069 from this range)
	 * - **Dynamic/Private Ports**: 49152-65535 (available for dynamic allocation)
	 *
	 * However, our implementation does not enforce these constraints at the event
	 * level, trusting that the VM/Compiler has already validated the port number
	 * during calculation. This design choice reflects our philosophy of trusting
	 * upstream components and avoiding redundant validation layers (though we
	 * still validate in PortValidatedEvent, because paranoia).
	 *
	 * **Canonical Values:**
	 *
	 * In typical operation, this property will contain one of these values:
	 * - **6969**: The canonical frontend port (SEX_NUMBER)
	 * - **42069**: The canonical backend port (SNOOP_DOGG_NUMBER)
	 * - **Other**: Dynamically calculated ports for special cases
	 *
	 * **Immutability:**
	 *
	 * This property is readonly, enforcing the immutability contract of all events
	 * in our event-sourced system. Once a port is calculated and the event is
	 * created, the port value cannot be changed. This ensures that the event
	 * remains a faithful historical record and prevents accidental mutations that
	 * could corrupt the event stream.
	 *
	 * @readonly
	 * @type {number}
	 * @memberof PortCalculatedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortCalculatedEvent('agg-1', 6969);
	 * console.log(event.port); // 6969
	 *
	 * // This would be a TypeScript error:
	 * // event.port = 8080; // Error: Cannot assign to 'port' because it is readonly
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Use in routing logic
	 * function routeRequest(event: PortCalculatedEvent): void {
	 *   if (event.port === 6969) {
	 *     console.log('Routing to frontend service');
	 *   } else if (event.port === 42069) {
	 *     console.log('Routing to backend service');
	 *   } else {
	 *     console.log(`Routing to custom port ${event.port}`);
	 *   }
	 * }
	 * ```
	 */
	public readonly port: number;

	/**
	 * Constructs a new PortCalculatedEvent instance.
	 *
	 * This constructor creates an immutable event representing the completion of
	 * port number calculation. It accepts the aggregate identifier and the
	 * calculated port number, then delegates to the parent PortEvent constructor
	 * to initialize common event properties.
	 *
	 * **Construction Process:**
	 *
	 * 1. **Base Initialization**: Calls super(aggregateId) to initialize inherited
	 *    properties from PortEvent (timestamp, eventId, aggregateId). This captures
	 *    the precise moment when the calculation completed.
	 *
	 * 2. **Port Assignment**: Stores the calculated port number as a readonly
	 *    property, making it accessible for downstream processing, validation,
	 *    and delivery operations.
	 *
	 * **Parameter Expectations:**
	 *
	 * This constructor assumes (but does not validate) that:
	 *
	 * - aggregateId is a non-empty string matching an existing aggregate
	 * - port is a valid port number (1-65535) already validated by the VM/Compiler
	 *
	 * We rely on TypeScript's type system and upstream validation rather than
	 * implementing redundant runtime checks. This design choice reflects our
	 * philosophy of trusting domain boundaries and avoiding validation at every
	 * layer (though paranoid developers might add validation here).
	 *
	 * **Performance:**
	 *
	 * This constructor executes in O(1) constant time with negligible overhead:
	 * - One super() call (which does Date.now() and Math.random())
	 * - One primitive number assignment
	 * - No allocations, no loops, no external I/O
	 *
	 * **Memory:**
	 *
	 * The memory footprint is minimal:
	 * - Inherited properties: ~100 bytes (strings and timestamp)
	 * - Port number: 8 bytes (JavaScript number is always 64-bit float)
	 * - Object overhead: ~20-40 bytes (V8 engine internals)
	 * - Total: ~150 bytes per event instance
	 *
	 * @constructor
	 * @param {string} aggregateId - The unique identifier of the aggregate root
	 *   that this event belongs to. This ID correlates the calculation event with
	 *   its originating port request and enables efficient event stream filtering.
	 *
	 * @param {number} port - The calculated port number. This should be a valid
	 *   port number (1-65535) that has been computed by the VM/Compiler subsystem.
	 *   Common values are 6969 (frontend) and 42069 (backend).
	 *
	 * @throws {TypeError} If parameters are not of expected types (though TypeScript
	 *   should prevent this at compile time).
	 *
	 * @since 1.0.0
	 * @version 1.0.0
	 *
	 * @example
	 * ```typescript
	 * // Create event after VM calculates port for frontend request
	 * const event = new PortCalculatedEvent('agg-123', 6969);
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
	 * // Create event for backend request
	 * const backendPort = 42069;
	 * const event = new PortCalculatedEvent('agg-456', backendPort);
	 *
	 * // Append to event store
	 * EventStore.getInstance().append(event);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Create event with dynamically calculated port
	 * const dynamicPort = calculatePortBasedOnComplexBusinessRules();
	 * const event = new PortCalculatedEvent('agg-789', dynamicPort);
	 * ```
	 */
	constructor(aggregateId: string, port: number) {
		super(aggregateId);
		this.port = port;
	}

	/**
	 * Checks if the calculated port is the canonical frontend port (6969).
	 *
	 * This convenience method determines whether the calculated port matches
	 * the well-known frontend port number (6969, also known as SEX_NUMBER in
	 * our legacy constants). This is useful for routing decisions, logging,
	 * and validation logic.
	 *
	 * **Use Cases:**
	 *
	 * - **Routing**: Determine if this port should be routed to frontend services
	 * - **Validation**: Verify that frontend requests received the correct port
	 * - **Analytics**: Track frontend vs. backend port allocation patterns
	 * - **Logging**: Generate contextual log messages
	 *
	 * @returns {boolean} True if the port is 6969 (the frontend port).
	 *
	 * @memberof PortCalculatedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortCalculatedEvent('agg-1', 6969);
	 * if (event.isFrontendPort()) {
	 *   console.log('This port is for frontend services');
	 * }
	 * ```
	 */
	public isFrontendPort(): boolean {
		return this.port === 6969;
	}

	/**
	 * Checks if the calculated port is the canonical backend port (42069).
	 *
	 * This convenience method determines whether the calculated port matches
	 * the well-known backend port number (42069, also known as SNOOP_DOGG_NUMBER
	 * in our legacy constants). This is useful for routing decisions, logging,
	 * and validation logic.
	 *
	 * **Use Cases:**
	 *
	 * - **Routing**: Determine if this port should be routed to backend services
	 * - **Validation**: Verify that backend requests received the correct port
	 * - **Analytics**: Track backend vs. frontend port allocation patterns
	 * - **Logging**: Generate contextual log messages
	 *
	 * @returns {boolean} True if the port is 42069 (the backend port).
	 *
	 * @memberof PortCalculatedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortCalculatedEvent('agg-1', 42069);
	 * if (event.isBackendPort()) {
	 *   console.log('This port is for backend services');
	 * }
	 * ```
	 */
	public isBackendPort(): boolean {
		return this.port === 42069;
	}

	/**
	 * Checks if the calculated port is within the valid port number range.
	 *
	 * This method validates that the port number falls within the valid TCP/UDP
	 * port range (1-65535). Port 0 is excluded because it has special semantics
	 * in many operating systems (it means "assign any available port").
	 *
	 * **Implementation Note:**
	 *
	 * In a properly functioning system, this method should always return true,
	 * because the VM/Compiler should never produce invalid port numbers. However,
	 * this method is useful for defensive programming, debugging, and catching
	 * potential bugs in the calculation logic.
	 *
	 * @returns {boolean} True if the port is in the range 1-65535 (inclusive).
	 *
	 * @memberof PortCalculatedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortCalculatedEvent('agg-1', 6969);
	 * console.log(event.isValidPort()); // true
	 *
	 * // Hypothetical invalid port (shouldn't happen in practice)
	 * const badEvent = new PortCalculatedEvent('agg-2', 99999);
	 * console.log(badEvent.isValidPort()); // false
	 * ```
	 */
	public isValidPort(): boolean {
		return this.port >= 1 && this.port <= 65535;
	}

	/**
	 * Returns the port number as a string.
	 *
	 * This convenience method converts the port number to a string, which is
	 * useful for logging, display, and concatenation operations.
	 *
	 * @returns {string} The port number as a string.
	 *
	 * @memberof PortCalculatedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortCalculatedEvent('agg-1', 6969);
	 * console.log('Calculated port: ' + event.getPortAsString()); // '6969'
	 * ```
	 */
	public getPortAsString(): string {
		return this.port.toString();
	}

	/**
	 * Serializes the event to a JSON string, including the calculated port.
	 *
	 * This method overrides the base PortEvent.toJSON() implementation to include
	 * the calculated port number in the serialized output. This is essential for
	 * proper event persistence, network transmission, and debugging.
	 *
	 * @returns {string} A JSON string representation of the complete event,
	 *   including inherited properties and the calculated port.
	 *
	 * @memberof PortCalculatedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortCalculatedEvent('agg-1', 6969);
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
	 * This method overrides the base toString() to include the calculated port
	 * number, making log messages more informative and debugging easier.
	 *
	 * @returns {string} A detailed string representation.
	 *
	 * @memberof PortCalculatedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortCalculatedEvent('agg-1', 6969);
	 * console.log(event.toString());
	 * // "PortCalculatedEvent[k9j3h2g1 @ agg-1] port=6969"
	 * ```
	 */
	public toString(): string {
		return `${super.toString()} port=${this.port}`;
	}
}

/**
 * Type guard to check if an event is a PortCalculatedEvent.
 *
 * This utility function provides a type-safe way to check if an event is an
 * instance of PortCalculatedEvent, enabling TypeScript to narrow the type in
 * conditional blocks.
 *
 * @param {PortEvent} event - The event to check.
 * @returns {boolean} True if the event is a PortCalculatedEvent.
 *
 * @example
 * ```typescript
 * if (isPortCalculatedEvent(event)) {
 *   // TypeScript knows event is PortCalculatedEvent here
 *   console.log(`Port calculated: ${event.port}`);
 * }
 * ```
 */
export function isPortCalculatedEvent(event: PortEvent): event is PortCalculatedEvent {
	return event instanceof PortCalculatedEvent;
}

/**
 * Module metadata for introspection and debugging.
 */
export const MODULE_METADATA = {
	name: 'infrastructure/event-sourcing/events/implementations/PortCalculatedEvent',
	version: '1.0.0',
	author: 'Enterprise Architecture Team',
	exports: ['PortCalculatedEvent', 'isPortCalculatedEvent', 'MODULE_METADATA'],
	description: 'Domain event representing the successful calculation of a port number',
	eventType: 'PortCalculatedEvent',
	lifecyclePosition: 'SECOND',
	linesOfCode: 480,
	overEngineeringLevel: 9.5,
} as const;

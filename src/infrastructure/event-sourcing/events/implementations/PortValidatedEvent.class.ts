/**
 * @fileoverview Port Validated Event - Domain Event for Port Number Validation Completion
 *
 * This file contains the concrete implementation of the PortValidatedEvent class,
 * which represents the domain event that occurs when a calculated port number has
 * been validated against our hilariously over-engineered validation rules and
 * business constraints. This event marks the completion of the validation phase
 * in the port allocation saga and carries a boolean flag indicating whether the
 * port passed validation or failed (though in practice, our ports always pass
 * because we're generating them ourselves, but we validate them anyway because
 * that's what enterprise architects do).
 *
 * @module infrastructure/event-sourcing/events/implementations
 * @category Event Sourcing
 * @subcategory Domain Events
 * @since 1.0.0
 * @version 1.41421.35623
 *
 * @remarks
 * The PortValidatedEvent is the THIRD event in the port allocation lifecycle,
 * occurring after PortCalculatedEvent and before PortDeliveredEvent. It encapsulates:
 *
 * 1. **Validation Result**: A boolean flag indicating whether the port number
 *    passed all validation rules (isValid property). In our system, this is
 *    typically always true because we generate valid ports, but the validation
 *    layer exists for architectural completeness and future extensibility.
 *
 * 2. **Aggregate Correlation**: The aggregate ID inherited from the base PortEvent
 *    class, ensuring this event can be correlated with its originating request
 *    and calculation events.
 *
 * 3. **Temporal Metadata**: Automatic timestamp capture via the PortEvent base
 *    class, enabling precise tracking of when the validation completed.
 *
 * This event serves several critical purposes in our event-sourced architecture:
 *
 * - **State Transition**: Marks the transition from "calculated" to "validated"
 *   in the aggregate's state machine, enabling the final delivery phase.
 *
 * - **Audit Trail**: Provides an immutable record of the validation outcome
 *   and when it occurred, essential for compliance and debugging.
 *
 * - **Saga Coordination**: Triggers the next (and final) step in the port
 *   allocation saga, namely the delivery phase.
 *
 * - **Quality Assurance**: Enables monitoring of validation pass/fail rates
 *   (though we expect 100% pass rate in normal operation).
 *
 * @example
 * ```typescript
 * import { PortValidatedEvent } from './PortValidatedEvent.class';
 *
 * // After port validation logic executes
 * const isValid = true; // Port passed validation
 * const event = new PortValidatedEvent('aggregate-123', isValid);
 *
 * // Access event properties
 * console.log(event.isValid);        // true
 * console.log(event.aggregateId);    // 'aggregate-123'
 * console.log(event.getAge());       // Time since validation
 * console.log(event.passed());       // true (convenience method)
 * ```
 *
 * @see {@link PortEvent} for the abstract base class
 * @see {@link PortCalculatedEvent} for the preceding event in the lifecycle
 * @see {@link PortDeliveredEvent} for the subsequent event in the lifecycle
 * @see {@link EventStore} for event persistence mechanisms
 * @see {@link PortAggregate} for aggregate state management
 *
 * @author Enterprise Architecture Team
 * @copyright 2024 PortNumberGenerator™ Corporation
 * @license MIT (Enterprise Edition with Six Sigma Certification)
 */

import { PortEvent } from '../base/PortEvent.abstract';

/**
 * Domain event representing the completion of port number validation.
 *
 * This concrete event class extends the abstract PortEvent base class and
 * carries a boolean validation result as its primary payload. When the
 * validation subsystem completes its analysis of a calculated port number
 * and determines whether it meets all business rules and constraints, a
 * PortValidatedEvent is created and appended to the event store.
 *
 * **Domain Significance:**
 *
 * In our event-sourced architecture, PortValidatedEvent represents a critical
 * quality gate in the port allocation domain. It captures:
 *
 * - Whether the port passed validation (via the isValid property)
 * - When the validation completed (via inherited timestamp)
 * - Which aggregate this validation belongs to (via aggregateId)
 *
 * **Lifecycle Position:**
 *
 * This event is the THIRD event in the typical port allocation lifecycle:
 *
 * 1. PortRequestedEvent (request initiation)
 * 2. PortCalculatedEvent (calculation completion)
 * 3. **PortValidatedEvent** ← YOU ARE HERE
 * 4. PortDeliveredEvent (delivery to requestor)
 *
 * **Validation Semantics:**
 *
 * The validation phase checks the calculated port against various criteria:
 *
 * - **Range Validation**: Port is within valid range (1-65535)
 * - **Business Rules**: Port matches expected value for requestor type
 * - **Consistency Checks**: Port calculation was deterministic and correct
 * - **Future Extensibility**: Hook for additional validation rules
 *
 * In practice, because we control the port calculation logic and generate
 * only valid ports, the isValid flag is almost always true. However, the
 * validation layer exists for:
 *
 * - **Architectural Completeness**: Every good saga has a validation phase
 * - **Defensive Programming**: Catch bugs in calculation logic
 * - **Compliance**: Demonstrate due diligence to auditors
 * - **Future-Proofing**: Enable additional validation rules as needed
 *
 * **Immutability Contract:**
 *
 * Like all events in our system, PortValidatedEvent is immutable once created.
 * The isValid property is readonly and cannot be modified after construction,
 * ensuring that the event remains a faithful historical record of the
 * validation outcome.
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
 *   // PortValidatedEvent-specific
 *   isValid: boolean
 * }
 * ```
 *
 * **Performance Characteristics:**
 *
 * - **Memory Footprint**: Minimal - just one additional boolean (1 byte)
 * - **Construction Time**: O(1) - super() call plus one property assignment
 * - **Serialization Size**: < 200 bytes typically (compact JSON representation)
 *
 * @class PortValidatedEvent
 * @extends {PortEvent}
 *
 * @property {boolean} isValid - The validation result flag. True indicates that
 *   the port passed all validation rules and is ready for delivery. False would
 *   indicate validation failure (though this is rare in our system since we
 *   generate valid ports). This boolean serves as the quality gate determining
 *   whether the port allocation saga can proceed to the delivery phase.
 *
 * @since 1.0.0
 * @version 1.7.320
 *
 * @example
 * ```typescript
 * // Create event after successful validation
 * const event = new PortValidatedEvent('agg-1', true);
 *
 * // Access properties
 * console.log(event.isValid);        // true
 * console.log(event.aggregateId);    // 'agg-1'
 * console.log(event.getAge());       // Time since validation
 *
 * // Use convenience methods
 * console.log(event.passed());       // true
 * console.log(event.failed());       // false
 * ```
 *
 * @example
 * ```typescript
 * // Integration with EventStore
 * import { EventStore } from '../../store/EventStore.class';
 *
 * const event = new PortValidatedEvent('agg-1', true);
 * const store = EventStore.getInstance();
 * store.append(event);
 *
 * // Later, check validation status
 * const events = store.getEventsForAggregate('agg-1');
 * const validationEvent = events.find(e => e instanceof PortValidatedEvent);
 * if (validationEvent instanceof PortValidatedEvent) {
 *   if (validationEvent.passed()) {
 *     console.log('Validation passed - proceed to delivery');
 *   }
 * }
 * ```
 */
export class PortValidatedEvent extends PortEvent {
	/**
	 * The validation result indicating whether the port passed validation checks.
	 *
	 * This property holds the boolean validation outcome representing the result
	 * of our hilariously over-engineered validation subsystem. The value stored
	 * here indicates whether the calculated port number met all validation
	 * criteria, including:
	 *
	 * **Validation Criteria:**
	 *
	 * 1. **Range Validation**: Port number is within the valid TCP/UDP range
	 *    (1-65535). Ports outside this range are invalid.
	 *
	 * 2. **Business Rule Compliance**: Port matches the expected value based on
	 *    requestor type (frontend should get 6969, backend should get 42069).
	 *
	 * 3. **Consistency Checks**: Port calculation was deterministic and reproducible.
	 *    Running the calculation twice should yield the same result.
	 *
	 * 4. **Future Extensions**: Hook for additional validation rules such as:
	 *    - Port is not in a blocklist of reserved ports
	 *    - Port is not already allocated to another service
	 *    - Port meets organizational security policies
	 *    - Port complies with regulatory requirements
	 *
	 * **Expected Values:**
	 *
	 * In normal operation, this property should always be `true` because:
	 *
	 * - Our VM/Compiler generates valid port numbers by design
	 * - The calculation logic enforces business rules during computation
	 * - We control the entire port generation pipeline end-to-end
	 *
	 * However, validation failures (`false` value) might occur in edge cases:
	 *
	 * - **Calculation Bugs**: Hypothetical bugs in VM/Compiler logic
	 * - **Configuration Errors**: Misconfigured port constants or rules
	 * - **Race Conditions**: Concurrent modifications to validation state
	 * - **Future Features**: New validation rules that existing ports don't meet
	 *
	 * **Architectural Significance:**
	 *
	 * The isValid flag serves as a quality gate in our event-sourced architecture.
	 * Downstream event handlers and saga orchestrators check this flag to determine
	 * whether the port allocation process can proceed to the delivery phase or
	 * whether compensating actions are needed.
	 *
	 * **Immutability:**
	 *
	 * This property is readonly, enforcing the immutability contract of all events
	 * in our event-sourced system. Once validation completes and the event is
	 * created, the validation result cannot be changed. This ensures data integrity
	 * and provides a reliable audit trail.
	 *
	 * @readonly
	 * @type {boolean}
	 * @memberof PortValidatedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortValidatedEvent('agg-1', true);
	 * console.log(event.isValid); // true
	 *
	 * // This would be a TypeScript error:
	 * // event.isValid = false; // Error: Cannot assign to 'isValid' because it is readonly
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Conditional logic based on validation result
	 * if (event.isValid) {
	 *   console.log('Validation passed - port is ready for delivery');
	 *   proceedToDeliveryPhase();
	 * } else {
	 *   console.error('Validation failed - initiate compensating transaction');
	 *   handleValidationFailure();
	 * }
	 * ```
	 */
	public readonly isValid: boolean;

	/**
	 * Constructs a new PortValidatedEvent instance.
	 *
	 * This constructor creates an immutable event representing the completion of
	 * port number validation. It accepts the aggregate identifier and the boolean
	 * validation result, then delegates to the parent PortEvent constructor to
	 * initialize common event properties.
	 *
	 * **Construction Process:**
	 *
	 * 1. **Base Initialization**: Calls super(aggregateId) to initialize inherited
	 *    properties from PortEvent (timestamp, eventId, aggregateId). This captures
	 *    the precise moment when validation completed.
	 *
	 * 2. **Result Assignment**: Stores the validation result as a readonly boolean
	 *    property, making it accessible for downstream processing and saga
	 *    orchestration decisions.
	 *
	 * **Parameter Expectations:**
	 *
	 * This constructor assumes (but does not validate) that:
	 *
	 * - aggregateId is a non-empty string matching an existing aggregate
	 * - isValid is a boolean representing the actual validation outcome
	 *
	 * We rely on TypeScript's type system and upstream logic rather than
	 * implementing redundant runtime checks. This design choice reflects our
	 * philosophy of trusting domain boundaries and avoiding validation at every
	 * layer (ironic, given this is a validation event).
	 *
	 * **Performance:**
	 *
	 * This constructor executes in O(1) constant time with negligible overhead:
	 * - One super() call (which does Date.now() and Math.random())
	 * - One primitive boolean assignment
	 * - No allocations, no loops, no external I/O
	 * - Completes in microseconds on modern hardware
	 *
	 * **Memory:**
	 *
	 * The memory footprint is minimal:
	 * - Inherited properties: ~100 bytes (strings and timestamp)
	 * - Boolean flag: 1 byte (though V8 may use more due to alignment)
	 * - Object overhead: ~20-40 bytes (V8 engine internals)
	 * - Total: ~130 bytes per event instance
	 *
	 * @constructor
	 * @param {string} aggregateId - The unique identifier of the aggregate root
	 *   that this event belongs to. This ID correlates the validation event with
	 *   its originating port request and calculation events, enabling efficient
	 *   event stream filtering during aggregate hydration.
	 *
	 * @param {boolean} isValid - The validation result. True indicates that the
	 *   port passed all validation rules and is ready for delivery. False indicates
	 *   validation failure, which would trigger compensating actions (though this
	 *   is rare in our system).
	 *
	 * @throws {TypeError} If parameters are not of expected types (though TypeScript
	 *   should prevent this at compile time).
	 *
	 * @since 1.0.0
	 * @version 1.0.0
	 *
	 * @example
	 * ```typescript
	 * // Create event after successful validation
	 * const event = new PortValidatedEvent('agg-123', true);
	 *
	 * // Event is now ready for persistence
	 * console.log(event.eventId);       // 'k9j3h2g1'
	 * console.log(event.aggregateId);   // 'agg-123'
	 * console.log(event.isValid);       // true
	 * console.log(event.timestamp);     // Current Unix timestamp
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Create event after validation failure (rare but possible)
	 * const event = new PortValidatedEvent('agg-456', false);
	 *
	 * // Append to event store
	 * EventStore.getInstance().append(event);
	 *
	 * // Trigger compensating actions
	 * if (!event.isValid) {
	 *   handleValidationFailure(event.aggregateId);
	 * }
	 * ```
	 */
	constructor(aggregateId: string, isValid: boolean) {
		super(aggregateId);
		this.isValid = isValid;
	}

	/**
	 * Convenience method to check if validation passed.
	 *
	 * This method provides a more semantic way to check the validation result
	 * compared to directly accessing the isValid property. Using passed() reads
	 * more naturally in conditional statements and makes code more self-documenting.
	 *
	 * **Rationale:**
	 *
	 * While `event.isValid` is perfectly fine, `event.passed()` provides:
	 * - More natural English-like syntax
	 * - Better code readability
	 * - Consistent API with failed() method
	 * - Future extensibility (could add logging, side effects, etc.)
	 *
	 * @returns {boolean} True if the port passed validation, false otherwise.
	 *
	 * @memberof PortValidatedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortValidatedEvent('agg-1', true);
	 * if (event.passed()) {
	 *   console.log('Validation passed - proceed to delivery');
	 * }
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // More readable than checking isValid directly
	 * const canProceed = event.passed();
	 * if (canProceed) {
	 *   deliverPortToRequestor();
	 * }
	 * ```
	 */
	public passed(): boolean {
		return this.isValid === true;
	}

	/**
	 * Convenience method to check if validation failed.
	 *
	 * This method provides a more semantic way to check for validation failure
	 * compared to using `!event.isValid`. Using failed() reads more naturally
	 * and makes error handling code more self-documenting.
	 *
	 * **Rationale:**
	 *
	 * While `!event.isValid` works, `event.failed()` provides:
	 * - More explicit error handling semantics
	 * - Better code readability (no negation operator)
	 * - Consistent API with passed() method
	 * - Future extensibility (could trigger logging, alerts, etc.)
	 *
	 * @returns {boolean} True if the port failed validation, false otherwise.
	 *
	 * @memberof PortValidatedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortValidatedEvent('agg-1', false);
	 * if (event.failed()) {
	 *   console.error('Validation failed - initiate compensating actions');
	 *   handleValidationFailure();
	 * }
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // More readable than using negation
	 * if (event.failed()) {
	 *   logError('Port validation failed', event.aggregateId);
	 *   notifyAdministrators();
	 *   rollbackTransaction();
	 * }
	 * ```
	 */
	public failed(): boolean {
		return this.isValid === false;
	}

	/**
	 * Returns a human-readable validation status string.
	 *
	 * This convenience method converts the boolean validation result into a
	 * human-readable string ("PASSED" or "FAILED"), which is useful for logging,
	 * display in user interfaces, and generating reports.
	 *
	 * @returns {string} "PASSED" if validation succeeded, "FAILED" if it did not.
	 *
	 * @memberof PortValidatedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortValidatedEvent('agg-1', true);
	 * console.log(`Validation status: ${event.getValidationStatus()}`);
	 * // Output: "Validation status: PASSED"
	 * ```
	 */
	public getValidationStatus(): string {
		return this.isValid ? 'PASSED' : 'FAILED';
	}

	/**
	 * Serializes the event to a JSON string, including the validation result.
	 *
	 * This method overrides the base PortEvent.toJSON() implementation to include
	 * the validation result in the serialized output. This is essential for
	 * proper event persistence, network transmission, and debugging.
	 *
	 * @returns {string} A JSON string representation of the complete event,
	 *   including inherited properties and the validation result.
	 *
	 * @memberof PortValidatedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortValidatedEvent('agg-1', true);
	 * const json = event.toJSON();
	 * console.log(json);
	 * // {"timestamp":1704067200000,"eventId":"k9j3h2g1","aggregateId":"agg-1","isValid":true}
	 * ```
	 */
	public toJSON(): string {
		return JSON.stringify({
			timestamp: this.timestamp,
			eventId: this.eventId,
			aggregateId: this.aggregateId,
			isValid: this.isValid,
		});
	}

	/**
	 * Returns a detailed human-readable string representation of the event.
	 *
	 * This method overrides the base toString() to include the validation status,
	 * making log messages more informative and debugging easier.
	 *
	 * @returns {string} A detailed string representation.
	 *
	 * @memberof PortValidatedEvent
	 * @since 1.0.0
	 *
	 * @example
	 * ```typescript
	 * const event = new PortValidatedEvent('agg-1', true);
	 * console.log(event.toString());
	 * // "PortValidatedEvent[k9j3h2g1 @ agg-1] status=PASSED"
	 * ```
	 */
	public toString(): string {
		return `${super.toString()} status=${this.getValidationStatus()}`;
	}
}

/**
 * Type guard to check if an event is a PortValidatedEvent.
 *
 * This utility function provides a type-safe way to check if an event is an
 * instance of PortValidatedEvent, enabling TypeScript to narrow the type in
 * conditional blocks.
 *
 * @param {PortEvent} event - The event to check.
 * @returns {boolean} True if the event is a PortValidatedEvent.
 *
 * @example
 * ```typescript
 * if (isPortValidatedEvent(event)) {
 *   // TypeScript knows event is PortValidatedEvent here
 *   if (event.passed()) {
 *     console.log('Validation passed');
 *   }
 * }
 * ```
 */
export function isPortValidatedEvent(event: PortEvent): event is PortValidatedEvent {
	return event instanceof PortValidatedEvent;
}

/**
 * Module metadata for introspection and debugging.
 */
export const MODULE_METADATA = {
	name: 'infrastructure/event-sourcing/events/implementations/PortValidatedEvent',
	version: '1.0.0',
	author: 'Enterprise Architecture Team',
	exports: ['PortValidatedEvent', 'isPortValidatedEvent', 'MODULE_METADATA'],
	description: 'Domain event representing the completion of port number validation',
	eventType: 'PortValidatedEvent',
	lifecyclePosition: 'THIRD',
	linesOfCode: 520,
	overEngineeringLevel: 9.8,
} as const;

/**
 * @fileoverview PortProvisioningSaga - Orchestrates the end-to-end port provisioning workflow
 * @module @portnumbergenerator/application/orchestration/sagas
 * @category Application Layer - Orchestration
 * @since 2.0.0
 *
 * @description
 * Implements the Saga pattern for distributed port provisioning transactions.
 * Coordinates multiple steps: request, calculation (via VM), validation, and delivery.
 * Integrates with the Event Store for full audit trail and event sourcing compliance.
 *
 * @architecture
 * - Saga Pattern: Manages long-running business transactions
 * - Event Sourcing: Records every step as domain events
 * - CQRS: Separates command execution from query operations
 * - Aggregate Pattern: Uses PortAggregate to maintain state
 *
 * @example
 * ```typescript
 * import { PortProvisioningSaga } from '@portnumbergenerator/application/orchestration/sagas';
 * import { VMPortServiceImpl } from '@portnumbergenerator/application/factories';
 * import { PortContext } from '@portnumbergenerator/core/domain/context';
 *
 * const service = new VMPortServiceImpl();
 * const saga = new PortProvisioningSaga(service);
 * const context = new PortContext('frontend');
 * const port = saga.execute(context); // Returns: 6969
 * ```
 *
 * @see {@link IPortService} - Service interface for port calculation
 * @see {@link EventStore} - Event persistence layer
 * @see {@link PortAggregate} - Domain aggregate for state management
 */

import type { IPortContext } from "../../../core/domain/context/index.js";
import {
	EventStore,
	PortRequestedEvent,
	PortCalculatedEvent,
	PortValidatedEvent,
	PortDeliveredEvent,
	PortAggregate,
} from "../../../infrastructure/event-sourcing/index.js";
import type { IPortService } from "../../factories/interfaces/IPortService.interface.js";

/**
 * @class PortProvisioningSaga
 * @classdesc Orchestrates the distributed port provisioning workflow using the Saga pattern.
 *
 * @description
 * The PortProvisioningSaga coordinates a multi-step business transaction for port provisioning:
 *
 * **Workflow Steps:**
 * 1. **Request Phase**: Accepts a port context and creates a PortRequestedEvent
 * 2. **Calculation Phase**: Delegates to IPortService (VM-based) to compute the port number
 * 3. **Validation Phase**: Ensures the port is within valid range (0-65535)
 * 4. **Delivery Phase**: Marks the port as delivered and ready for use
 *
 * Each step is recorded as an event in the EventStore, providing full auditability
 * and enabling event replay/sourcing capabilities.
 *
 * **Error Handling:**
 * - On validation failure, throws an error (saga compensation/rollback could be added)
 * - All errors are logged and propagated to the caller
 *
 * **Event Sourcing:**
 * - Every saga execution generates 4 events (requested, calculated, validated, delivered)
 * - Events are stored with unique aggregate IDs for tracking
 * - Aggregate state can be reconstructed from event history
 *
 * @example
 * ```typescript
 * // Basic usage
 * const saga = new PortProvisioningSaga(portService);
 * const context = new PortContext('backend');
 * const port = saga.execute(context);
 * console.log(port); // 42069
 * ```
 *
 * @example
 * ```typescript
 * // With metadata
 * const context = new PortContext('frontend', {
 *   environment: 'production',
 *   region: 'us-east-1'
 * });
 * const port = saga.execute(context);
 *
 * // Retrieve saga events
 * const events = EventStore.getInstance().getEventsForAggregate(context.requestId);
 * console.log(events.length); // 4
 * ```
 *
 * @implements Saga Pattern
 * @implements Event Sourcing
 * @public
 * @since 2.0.0
 */
export class PortProvisioningSaga {
	/**
	 * Event store instance for persisting domain events.
	 * @private
	 * @readonly
	 * @type {EventStore}
	 */
	private eventStore: EventStore;

	/**
	 * Port service for VM-based port calculation.
	 * @private
	 * @readonly
	 * @type {IPortService}
	 */
	private service: IPortService;

	/**
	 * Creates a new PortProvisioningSaga instance.
	 *
	 * @constructor
	 * @param {IPortService} service - The port service implementation (typically VM-based)
	 *
	 * @example
	 * ```typescript
	 * import { VMPortServiceImpl } from '@portnumbergenerator/application/factories';
	 *
	 * const service = new VMPortServiceImpl();
	 * const saga = new PortProvisioningSaga(service);
	 * ```
	 */
	constructor(service: IPortService) {
		this.eventStore = EventStore.getInstance();
		this.service = service;
	}

	/**
	 * Executes the complete port provisioning saga workflow.
	 *
	 * @description
	 * Orchestrates a four-step distributed transaction:
	 *
	 * **Step 1: Request**
	 * - Creates and stores a PortRequestedEvent
	 * - Initializes the port aggregate with the request context
	 *
	 * **Step 2: Calculate**
	 * - Delegates to the port service (VM execution)
	 * - Creates and stores a PortCalculatedEvent with the result
	 *
	 * **Step 3: Validate**
	 * - Ensures port is in valid range (1-65534)
	 * - Creates and stores a PortValidatedEvent
	 * - Throws error if validation fails (saga compensation point)
	 *
	 * **Step 4: Deliver**
	 * - Marks the port as delivered
	 * - Creates and stores a PortDeliveredEvent
	 * - Returns the final port number
	 *
	 * All events are applied to the aggregate to maintain consistency.
	 *
	 * @param {IPortContext} context - The port request context containing requestor info
	 * @returns {number} The calculated and validated port number
	 *
	 * @throws {Error} When port validation fails (port out of valid range)
	 * @throws {Error} When VM execution fails
	 * @throws {Error} When event persistence fails
	 *
	 * @example
	 * ```typescript
	 * const context = new PortContext('frontend');
	 * const port = saga.execute(context);
	 * console.log(port); // 6969
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // With error handling
	 * try {
	 *   const port = saga.execute(context);
	 * } catch (error) {
	 *   console.error('Saga failed:', error.message);
	 *   // Implement compensation logic here
	 * }
	 * ```
	 *
	 * @public
	 * @since 2.0.0
	 */
	execute(context: IPortContext): number {
		const aggregateId = context.requestId;
		const aggregate = new PortAggregate(aggregateId);

		try {
			// Step 1: Request
			const requestedEvent = new PortRequestedEvent(aggregateId, context);
			this.eventStore.append(requestedEvent);
			aggregate.apply(requestedEvent);

			// Step 2: Calculate (USING VM)
			const port = this.service.getPort(context);
			const calculatedEvent = new PortCalculatedEvent(aggregateId, port);
			this.eventStore.append(calculatedEvent);
			aggregate.apply(calculatedEvent);

			// Step 3: Validate
			const isValid = port > 0 && port < 65535;
			const validatedEvent = new PortValidatedEvent(aggregateId, isValid);
			this.eventStore.append(validatedEvent);
			aggregate.apply(validatedEvent);

			if (!isValid) {
				throw new Error("Saga failed: Port validation error");
			}

			// Step 4: Deliver
			const deliveredEvent = new PortDeliveredEvent(aggregateId, port);
			this.eventStore.append(deliveredEvent);
			aggregate.apply(deliveredEvent);

			return port;
		} catch (error) {
			console.error(`[SAGA] Transaction failed: ${error}`);
			throw error;
		}
	}
}

/**
 * @module Metadata
 * @description Module metadata for tooling and documentation generation
 */
export const metadata = {
	module: "@portnumbergenerator/application/orchestration/sagas/PortProvisioningSaga",
	version: "2.0.0",
	category: "Application Layer - Orchestration",
	pattern: "Saga",
	stability: "stable",
	exported: ["PortProvisioningSaga"],
	dependencies: [
		"@portnumbergenerator/core/domain/context",
		"@portnumbergenerator/infrastructure/event-sourcing",
		"@portnumbergenerator/core/domain/events",
		"@portnumbergenerator/core/domain/aggregates",
		"@portnumbergenerator/application/factories",
	],
};

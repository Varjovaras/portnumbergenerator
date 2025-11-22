/**
 * @fileoverview PortNumberGenerator - Main facade for the port number generation system
 * @module @portnumbergenerator/application/facades
 * @category Application Layer - Facades
 * @since 2.0.0
 *
 * @description
 * The PortNumberGenerator class serves as the primary facade and entry point for the
 * entire port number generation system. It orchestrates the VM-based factory system,
 * saga execution, event sourcing, and provides both modern and legacy API compatibility.
 *
 * **Architecture:**
 * - Facade Pattern: Simplifies complex subsystem interactions
 * - Integration Layer: Connects factories, sagas, and event stores
 * - Backward Compatibility: Maintains legacy static method API
 * - Event Sourcing: Full audit trail of all port provisioning operations
 *
 * **Key Features:**
 * - VM-based bytecode execution for port calculation
 * - Distributed saga orchestration
 * - Event sourcing and CQRS compliance
 * - Context-aware port provisioning
 * - Comprehensive diagnostics and monitoring
 *
 * @example
 * ```typescript
 * import { PortNumberGenerator } from '@portnumbergenerator/application/facades';
 *
 * const generator = new PortNumberGenerator();
 * const frontend = generator.frontendDevPortGetter; // 6969
 * const backend = generator.backendPortGetter; // 42069
 * ```
 *
 * @see {@link PortProvisioningSaga} - Saga orchestration
 * @see {@link EnterpriseFactoryProvider} - Factory provider singleton
 * @see {@link EventStore} - Event persistence
 */

import { PortContext } from "../../core/domain/context/index.js";
import { EnterpriseFactoryProvider } from "../factories/providers/EnterpriseFactoryProvider.class.js";
import { PortProvisioningSaga } from "../orchestration/sagas/PortProvisioningSaga.class.js";
import { PortNumbers } from "../legacy/PortNumbers.class.js";
import { EventStore } from "../../infrastructure/event-sourcing/index.js";
import type { PortEvent } from "../../infrastructure/event-sourcing/index.js";

/**
 * @class PortNumberGenerator
 * @classdesc Main facade for the enterprise-grade port number generation system
 *
 * @description
 * The PortNumberGenerator is the primary entry point for all port generation operations.
 * It integrates multiple architectural patterns and subsystems:
 *
 * **Subsystems:**
 * - Factory System: VM-based port calculation with 5-level hierarchy
 * - Saga Orchestration: Distributed transaction coordination
 * - Event Sourcing: Complete audit trail and event replay
 * - Context Management: Request tracking and metadata
 *
 * **Port Provisioning Flow:**
 * 1. Client creates PortNumberGenerator instance
 * 2. Client accesses getter (frontendDevPortGetter or backendPortGetter)
 * 3. Facade creates PortContext with requestor metadata
 * 4. Saga executes 4-step workflow (request → calculate → validate → deliver)
 * 5. Each step generates and persists domain events
 * 6. Final port number is returned to client
 *
 * **Legacy Compatibility:**
 * Static methods delegate to the legacy PortNumbers class for backward compatibility.
 *
 * @example
 * ```typescript
 * // Modern instance-based usage
 * const gen = new PortNumberGenerator();
 * console.log(gen.frontendDevPortGetter); // 6969
 * console.log(gen.backendPortGetter); // 42069
 * ```
 *
 * @example
 * ```typescript
 * // Legacy static usage (backward compatible)
 * console.log(PortNumberGenerator.frontendPortNumber()); // 6969
 * console.log(PortNumberGenerator.backendPortNumber()); // 42069
 * ```
 *
 * @example
 * ```typescript
 * // Advanced usage with metadata
 * const gen = new PortNumberGenerator();
 * const port = gen.executeWithMetadata('frontend', {
 *   environment: 'production',
 *   region: 'us-east-1',
 *   deployment: 'blue-green'
 * });
 *
 * // Inspect event history
 * const events = gen.getEvents();
 * console.log(events.length); // Multiple saga executions
 * ```
 *
 * @public
 * @since 2.0.0
 */
export class PortNumberGenerator {
	/**
	 * Saga orchestrator for distributed port provisioning.
	 * @private
	 * @readonly
	 * @type {PortProvisioningSaga}
	 */
	private saga: PortProvisioningSaga;

	/**
	 * Creates a new PortNumberGenerator instance.
	 *
	 * @constructor
	 * @description
	 * Initializes the complete port generation subsystem:
	 * - Obtains the singleton factory provider
	 * - Creates the factory factory (meta-factory)
	 * - Creates the port service (VM-based)
	 * - Initializes the saga orchestrator
	 *
	 * @example
	 * ```typescript
	 * const generator = new PortNumberGenerator();
	 * ```
	 */
	constructor() {
		const provider = EnterpriseFactoryProvider.getInstance();
		const factory = provider.getFactory();
		const service = factory.createService();
		this.saga = new PortProvisioningSaga(service);
	}

	/**
	 * Gets the frontend development port.
	 *
	 * @description
	 * Triggers a complete saga execution workflow:
	 * 1. Creates a PortContext with 'frontend' requestor
	 * 2. Executes the saga (4 events: requested, calculated, validated, delivered)
	 * 3. VM compiles and runs bytecode to calculate port
	 * 4. Returns validated port number
	 *
	 * Each access generates a new request with unique aggregate ID and full event trail.
	 *
	 * @readonly
	 * @type {number}
	 * @returns {number} The frontend port (always 6969)
	 *
	 * @example
	 * ```typescript
	 * const gen = new PortNumberGenerator();
	 * const port = gen.frontendDevPortGetter;
	 * console.log(port); // 6969
	 * ```
	 */
	get frontendDevPortGetter(): number {
		const context = new PortContext("frontend");
		return this.saga.execute(context);
	}

	/**
	 * Gets the backend API port.
	 *
	 * @description
	 * Triggers a complete saga execution workflow:
	 * 1. Creates a PortContext with 'backend' requestor
	 * 2. Executes the saga (4 events: requested, calculated, validated, delivered)
	 * 3. VM compiles and runs bytecode to calculate port
	 * 4. Returns validated port number
	 *
	 * Each access generates a new request with unique aggregate ID and full event trail.
	 *
	 * @readonly
	 * @type {number}
	 * @returns {number} The backend port (always 42069)
	 *
	 * @example
	 * ```typescript
	 * const gen = new PortNumberGenerator();
	 * const port = gen.backendPortGetter;
	 * console.log(port); // 42069
	 * ```
	 */
	get backendPortGetter(): number {
		const context = new PortContext("backend");
		return this.saga.execute(context);
	}

	// =========================================================================
	// EVENT SOURCING ACCESS
	// =========================================================================

	/**
	 * Retrieves the entire event history from the event store.
	 *
	 * @description
	 * Returns all port provisioning events across all saga executions.
	 * Useful for audit trails, debugging, and analytics.
	 *
	 * @returns {PortEvent[]} Array of all domain events
	 *
	 * @example
	 * ```typescript
	 * const gen = new PortNumberGenerator();
	 * gen.frontendDevPortGetter; // Triggers saga
	 * const events = gen.getEvents();
	 * console.log(events.length); // 4 (requested, calculated, validated, delivered)
	 * ```
	 */
	getEvents(): PortEvent[] {
		return EventStore.getInstance().getAllEvents();
	}

	/**
	 * Retrieves events for a specific aggregate (saga execution).
	 *
	 * @param {string} aggregateId - The aggregate ID (request ID from context)
	 * @returns {PortEvent[]} Events for the specified aggregate
	 *
	 * @example
	 * ```typescript
	 * const events = gen.getEventsForAggregate('req-123');
	 * console.log(events.map(e => e.constructor.name));
	 * // ['PortRequestedEvent', 'PortCalculatedEvent', 'PortValidatedEvent', 'PortDeliveredEvent']
	 * ```
	 */
	getEventsForAggregate(aggregateId: string): PortEvent[] {
		return EventStore.getInstance().getEventsForAggregate(aggregateId);
	}

	/**
	 * Gets the total number of events in the event store.
	 *
	 * @returns {number} Total event count
	 *
	 * @example
	 * ```typescript
	 * console.log(gen.getEventCount()); // 8 (2 sagas × 4 events each)
	 * ```
	 */
	getEventCount(): number {
		return this.getEvents().length;
	}

	/**
	 * Clears all events from the event store.
	 *
	 * @description
	 * Note: EventStore doesn't have a clear method in current implementation.
	 * This is a placeholder for future functionality.
	 *
	 * @returns {void}
	 */
	clearEvents(): void {
		// Note: EventStore doesn't have a clear method, this is a placeholder
	}

	/**
	 * Gets statistics about the event store.
	 *
	 * @returns {object} Event store statistics
	 * @property {number} totalEvents - Total number of events
	 * @property {number} uniqueAggregates - Number of unique saga executions
	 *
	 * @example
	 * ```typescript
	 * const stats = gen.getEventStoreStats();
	 * console.log(stats.totalEvents); // 12
	 * console.log(stats.uniqueAggregates); // 3
	 * ```
	 */
	getEventStoreStats(): { totalEvents: number; uniqueAggregates: number } {
		const events = this.getEvents();
		const uniqueAggregates = new Set(events.map(e => e.aggregateId)).size;
		return {
			totalEvents: events.length,
			uniqueAggregates,
		};
	}

	// =========================================================================
	// ADVANCED OPERATIONS
	// =========================================================================

	/**
	 * Executes a port request with custom metadata.
	 *
	 * @description
	 * Allows clients to attach custom metadata to port provisioning requests.
	 * Useful for tracking, analytics, and debugging.
	 *
	 * @param {string} requestor - The requestor type ('frontend', 'backend', etc.)
	 * @param {Record<string, unknown>} metadata - Custom metadata key-value pairs
	 * @returns {number} The calculated port number
	 *
	 * @example
	 * ```typescript
	 * const port = gen.executeWithMetadata('frontend', {
	 *   environment: 'staging',
	 *   version: '2.1.0',
	 *   deployment: 'canary'
	 * });
	 * ```
	 */
	executeWithMetadata(
		requestor: string,
		metadata: Record<string, unknown>
	): number {
		const context = new PortContext(requestor, metadata);
		return this.saga.execute(context);
	}

	/**
	 * Gets both frontend and backend ports in a single call.
	 *
	 * @returns {object} Both ports
	 * @property {number} frontend - Frontend port (6969)
	 * @property {number} backend - Backend port (42069)
	 *
	 * @example
	 * ```typescript
	 * const { frontend, backend } = gen.getAllPorts();
	 * console.log(`Frontend: ${frontend}, Backend: ${backend}`);
	 * ```
	 */
	getAllPorts(): { frontend: number; backend: number } {
		return {
			frontend: this.frontendDevPortGetter,
			backend: this.backendPortGetter,
		};
	}

	/**
	 * Validates that the ports are correctly configured.
	 *
	 * @returns {boolean} True if both ports match expected values
	 *
	 * @example
	 * ```typescript
	 * if (gen.validatePorts()) {
	 *   console.log('Port configuration valid!');
	 * }
	 * ```
	 */
	validatePorts(): boolean {
		return (
			this.frontendDevPortGetter === 6969 && this.backendPortGetter === 42069
		);
	}

	/**
	 * Gets a summary of the current port configuration.
	 *
	 * @returns {object} Configuration summary
	 * @property {number} frontend - Frontend port
	 * @property {number} backend - Backend port
	 * @property {boolean} valid - Whether ports are valid
	 * @property {number} eventCount - Total events in store
	 *
	 * @example
	 * ```typescript
	 * const summary = gen.getPortSummary();
	 * console.log(JSON.stringify(summary, null, 2));
	 * ```
	 */
	getPortSummary(): {
		frontend: number;
		backend: number;
		valid: boolean;
		eventCount: number;
	} {
		return {
			frontend: this.frontendDevPortGetter,
			backend: this.backendPortGetter,
			valid: this.validatePorts(),
			eventCount: this.getEventCount(),
		};
	}

	/**
	 * Exports the current state as JSON.
	 *
	 * @returns {string} JSON representation of current state
	 *
	 * @example
	 * ```typescript
	 * const json = gen.exportState();
	 * fs.writeFileSync('port-state.json', json);
	 * ```
	 */
	exportState(): string {
		return JSON.stringify({
			ports: this.getAllPorts(),
			events: this.getEvents(),
			stats: this.getEventStoreStats(),
		});
	}

	// =========================================================================
	// SYSTEM METADATA & DIAGNOSTICS
	// =========================================================================

	/**
	 * Gets the version of the PortNumberGenerator.
	 *
	 * @returns {string} Version string
	 *
	 * @example
	 * ```typescript
	 * console.log(gen.getVersion()); // "2.0.0-enterprise-max"
	 * ```
	 */
	getVersion(): string {
		return "2.0.0-enterprise-max";
	}

	/**
	 * Checks if the system is healthy.
	 *
	 * @returns {boolean} True if system is operational
	 *
	 * @example
	 * ```typescript
	 * if (!gen.isHealthy()) {
	 *   console.error('System health check failed!');
	 * }
	 * ```
	 */
	isHealthy(): boolean {
		return this.validatePorts() && this.getEventCount() >= 0;
	}

	/**
	 * Gets comprehensive diagnostic information.
	 *
	 * @returns {object} Diagnostic data
	 * @property {string} version - System version
	 * @property {boolean} healthy - Health status
	 * @property {object} ports - Port configuration
	 * @property {object} eventStore - Event store statistics
	 *
	 * @example
	 * ```typescript
	 * const diagnostics = gen.getDiagnostics();
	 * console.log('System Diagnostics:', diagnostics);
	 * ```
	 */
	getDiagnostics(): {
		version: string;
		healthy: boolean;
		ports: { frontend: number; backend: number };
		eventStore: { totalEvents: number; uniqueAggregates: number };
	} {
		return {
			version: this.getVersion(),
			healthy: this.isHealthy(),
			ports: this.getAllPorts(),
			eventStore: this.getEventStoreStats(),
		};
	}

	// =========================================================================
	// LEGACY STATIC COMPATIBILITY
	// =========================================================================

	/**
	 * Static method to get frontend port (legacy compatibility).
	 *
	 * @static
	 * @returns {6969} Frontend port
	 * @deprecated Use instance method `frontendDevPortGetter` instead
	 *
	 * @example
	 * ```typescript
	 * const port = PortNumberGenerator.frontendPortNumber(); // 6969
	 * ```
	 */
	static frontendPortNumber = PortNumbers.frontendPortNumber;

	/**
	 * Static method to get backend port (legacy compatibility).
	 *
	 * @static
	 * @returns {42069} Backend port
	 * @deprecated Use instance method `backendPortGetter` instead
	 *
	 * @example
	 * ```typescript
	 * const port = PortNumberGenerator.backendPortNumber(); // 42069
	 * ```
	 */
	static backendPortNumber = PortNumbers.backendPortNumber;

	/**
	 * Static factory method for custom port configuration (legacy compatibility).
	 *
	 * @static
	 * @template T
	 * @param {PortNumberConfig<T>} config - Port configuration
	 * @returns {() => T} Port generator function
	 * @deprecated Use modern factory system instead
	 *
	 * @example
	 * ```typescript
	 * const config = {
	 *   formula: () => 8080,
	 *   expected: 8080,
	 *   errorMessage: 'Invalid port'
	 * };
	 * const generator = PortNumberGenerator.createPortNumber(config);
	 * console.log(generator()); // 8080
	 * ```
	 */
	static createPortNumber = PortNumbers.createPortNumber;
}

/**
 * @module Metadata
 * @description Module metadata for tooling and documentation generation
 */
export const metadata = {
	module: "@portnumbergenerator/application/facades/PortNumberGenerator",
	version: "2.0.0",
	category: "Application Layer - Facades",
	pattern: "Facade",
	stability: "stable",
	exported: ["PortNumberGenerator"],
	dependencies: [
		"@portnumbergenerator/core/domain/context",
		"@portnumbergenerator/application/factories",
		"@portnumbergenerator/application/orchestration/sagas",
		"@portnumbergenerator/application/legacy",
		"@portnumbergenerator/infrastructure/event-sourcing",
		"@portnumbergenerator/core/domain/events",
	],
	description:
		"Main facade and entry point for the enterprise port number generation system",
};

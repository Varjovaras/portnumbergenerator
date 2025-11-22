/**
 * @fileoverview Legacy module - Barrel export for legacy port generation components
 * @module @portnumbergenerator/application/legacy
 * @category Application Layer - Legacy
 * @since 2.0.0
 * @deprecated Consider using the VM-based factory system for new implementations
 *
 * @description
 * Central export point for all legacy port generation components.
 * This module maintains backward compatibility with the original port number
 * generation system that predates the VM-based factory architecture.
 *
 * **Legacy Components:**
 * - PortNumbers: Comprehensive utility class with 200+ methods
 * - PortNumberConfig: Configuration interface for port generation
 *
 * **Migration Notice:**
 * New code should prefer the modern factory pattern with VM execution:
 * - {@link @portnumbergenerator/application/factories}
 * - {@link @portnumbergenerator/application/orchestration/sagas}
 *
 * @example
 * ```typescript
 * // Legacy usage (maintained for backward compatibility)
 * import { PortNumbers } from '@portnumbergenerator/application/legacy';
 *
 * const ports = new PortNumbers();
 * console.log(ports.frontendPortNumber()); // 6969
 * console.log(ports.backendPortNumber()); // 42069
 * ```
 *
 * @example
 * ```typescript
 * // Modern approach (recommended)
 * import { EnterpriseFactoryProvider } from '@portnumbergenerator/application/factories';
 * import { PortProvisioningSaga } from '@portnumbergenerator/application/orchestration/sagas';
 * import { PortContext } from '@portnumbergenerator/core/domain/context';
 *
 * const provider = EnterpriseFactoryProvider.getInstance();
 * const factory = provider.getFactory();
 * const service = factory.createService();
 * const saga = new PortProvisioningSaga(service);
 * const port = saga.execute(new PortContext('frontend')); // 6969
 * ```
 */

// ============================================================================
// Legacy Interfaces
// ============================================================================

export type { PortNumberConfig } from "./PortNumberConfig.interface.js";

// ============================================================================
// Legacy Implementations
// ============================================================================

export { PortNumbers } from "./PortNumbers.class.js";

// ============================================================================
// Module Metadata
// ============================================================================

/**
 * @const metadata
 * @description Module metadata for tooling and documentation generation
 */
export const metadata = {
	module: "@portnumbergenerator/application/legacy",
	version: "2.0.0",
	category: "Application Layer - Legacy",
	stability: "stable",
	deprecated: "Consider using VM-based factory system for new implementations",
	exports: ["PortNumberConfig", "PortNumbers"],
	description:
		"Legacy port generation components maintained for backward compatibility",
};

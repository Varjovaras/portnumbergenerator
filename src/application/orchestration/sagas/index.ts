/**
 * @fileoverview Sagas module - Barrel export for saga orchestration components
 * @module @portnumbergenerator/application/orchestration/sagas
 * @category Application Layer - Orchestration
 * @since 2.0.0
 *
 * @description
 * Central export point for all saga orchestration components in the application layer.
 * Provides simplified imports for saga classes used in distributed transaction coordination.
 *
 * @example
 * ```typescript
 * // Import saga
 * import { PortProvisioningSaga } from '@portnumbergenerator/application/orchestration/sagas';
 *
 * // Or import all
 * import * as Sagas from '@portnumbergenerator/application/orchestration/sagas';
 * ```
 */

// ============================================================================
// Saga Implementations
// ============================================================================

export { PortProvisioningSaga } from "./PortProvisioningSaga.class.js";

// ============================================================================
// Module Metadata
// ============================================================================

/**
 * @const metadata
 * @description Module metadata for tooling and documentation generation
 */
export const metadata = {
	module: "@portnumbergenerator/application/orchestration/sagas",
	version: "2.0.0",
	category: "Application Layer - Orchestration",
	exports: ["PortProvisioningSaga"],
	description: "Saga pattern implementations for distributed transaction orchestration",
};

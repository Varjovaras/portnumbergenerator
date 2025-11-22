/**
 * @fileoverview Facades module - Barrel export for application facade components
 * @module @portnumbergenerator/application/facades
 * @category Application Layer - Facades
 * @since 2.0.0
 *
 * @description
 * Central export point for all facade pattern implementations in the application layer.
 * Facades provide simplified, high-level interfaces to complex subsystems.
 *
 * **Facade Pattern:**
 * The facade pattern provides a unified interface to a set of interfaces in a subsystem.
 * It defines a higher-level interface that makes the subsystem easier to use.
 *
 * **Primary Facade:**
 * - PortNumberGenerator: Main entry point for the entire port generation system
 *
 * @example
 * ```typescript
 * // Import main facade
 * import { PortNumberGenerator } from '@portnumbergenerator/application/facades';
 *
 * const generator = new PortNumberGenerator();
 * console.log(generator.frontendDevPortGetter); // 6969
 * console.log(generator.backendPortGetter); // 42069
 * ```
 *
 * @example
 * ```typescript
 * // Advanced usage with diagnostics
 * import { PortNumberGenerator } from '@portnumbergenerator/application/facades';
 *
 * const gen = new PortNumberGenerator();
 * const diagnostics = gen.getDiagnostics();
 * console.log('System Status:', diagnostics);
 * ```
 */

// ============================================================================
// Facade Implementations
// ============================================================================

export { PortNumberGenerator } from "./PortNumberGenerator.class.js";

// ============================================================================
// Module Metadata
// ============================================================================

/**
 * @const metadata
 * @description Module metadata for tooling and documentation generation
 */
export const metadata = {
	module: "@portnumbergenerator/application/facades",
	version: "2.0.0",
	category: "Application Layer - Facades",
	pattern: "Facade",
	exports: ["PortNumberGenerator"],
	description:
		"Facade pattern implementations providing simplified interfaces to complex subsystems",
};

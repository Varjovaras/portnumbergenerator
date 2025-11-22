/**
 * @fileoverview PortNumberConfig - Configuration interface for legacy port number generation
 * @module @portnumbergenerator/application/legacy
 * @category Application Layer - Legacy
 * @since 2.0.0
 *
 * @description
 * Defines the configuration structure for legacy port number generation.
 * Used by the PortNumbers class to configure port formulas, expected values,
 * and validation error messages.
 *
 * This interface is part of the legacy subsystem that predates the VM-based
 * approach but is maintained for backward compatibility.
 *
 * @example
 * ```typescript
 * import type { PortNumberConfig } from '@portnumbergenerator/application/legacy';
 *
 * const frontendConfig: PortNumberConfig<6969> = {
 *   formula: () => 6969,
 *   expected: 6969,
 *   errorMessage: 'Frontend port validation failed'
 * };
 * ```
 */

/**
 * @interface PortNumberConfig
 * @template T - The expected port number type (must be a number literal type)
 *
 * @description
 * Configuration object for defining how a port number should be generated
 * and validated in the legacy system.
 *
 * **Type Parameter:**
 * - `T extends number` - A literal number type representing the expected port value
 *
 * **Properties:**
 * - `formula` - Function that computes the port number
 * - `expected` - The expected result (used for validation)
 * - `errorMessage` - Custom error message for validation failures
 *
 * **Validation Flow:**
 * 1. Execute the formula function
 * 2. Compare result to expected value
 * 3. If mismatch, throw error with errorMessage
 * 4. If match, return as type T
 *
 * @example
 * ```typescript
 * // Frontend configuration
 * const config: PortNumberConfig<6969> = {
 *   formula: () => Number(`${69}${69}`),
 *   expected: 6969,
 *   errorMessage: 'LÄÄLÄÄ HEI - Frontend port validation failed!'
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Backend configuration
 * const config: PortNumberConfig<42069> = {
 *   formula: () => 42069,
 *   expected: 42069,
 *   errorMessage: 'Backend port validation failed!'
 * };
 * ```
 *
 * @public
 * @since 2.0.0
 */
export interface PortNumberConfig<T extends number> {
	/**
	 * Formula function that computes the port number.
	 *
	 * @description
	 * A zero-argument function that returns a number. This function is executed
	 * to generate the port number value. The result is then validated against
	 * the `expected` property.
	 *
	 * @returns {number} The computed port number
	 *
	 * @example
	 * ```typescript
	 * formula: () => 6969
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Using constants
	 * const SEX_NUMBER = 69;
	 * formula: () => Number(`${SEX_NUMBER}${SEX_NUMBER}`)
	 * ```
	 */
	formula: () => number;

	/**
	 * Expected port number value (used for validation).
	 *
	 * @description
	 * The expected result of the formula execution. If the formula returns
	 * a value that doesn't match this expected value, an error is thrown
	 * using the configured errorMessage.
	 *
	 * This enables compile-time and runtime type safety for port numbers.
	 *
	 * @type {T}
	 *
	 * @example
	 * ```typescript
	 * expected: 6969
	 * ```
	 */
	expected: T;

	/**
	 * Custom error message for validation failures.
	 *
	 * @description
	 * The error message that will be thrown if the formula result doesn't
	 * match the expected value. This allows for descriptive, context-specific
	 * error messages.
	 *
	 * @type {string}
	 *
	 * @example
	 * ```typescript
	 * errorMessage: 'LÄÄLÄÄ HEI - Frontend port validation failed!'
	 * ```
	 */
	errorMessage: string;
}

/**
 * @module Metadata
 * @description Module metadata for tooling and documentation generation
 */
export const metadata = {
	module: "@portnumbergenerator/application/legacy/PortNumberConfig",
	version: "2.0.0",
	category: "Application Layer - Legacy",
	type: "interface",
	stability: "stable",
	exported: ["PortNumberConfig"],
	description: "Configuration interface for legacy port number generation",
};

/**
 * @fileoverview Legacy Port Number Utilities - Barrel Export
 * @module @portnumbergenerator/legacy/utilities
 * @category Legacy Layer - Utilities
 * @since 1.0.0
 *
 * @description
 * Central export point for all legacy port number utility modules.
 * These utilities were extracted from the monolithic PortNumbers class
 * to improve maintainability and enable tree-shaking.
 *
 * **Available Utilities:**
 * - `FormatConverter`: Number format conversions (hex, binary, roman, morse, emoji)
 * - `MathUtility`: Mathematical operations and number theory
 * - `StringUtility`: String operations and conversions
 *
 * @example
 * ```typescript
 * // Import specific utilities
 * import { FormatConverter, MathUtility, StringUtility } from '@portnumbergenerator/legacy/utilities';
 *
 * const hex = FormatConverter.toHex(6969);
 * const isPrime = MathUtility.isPrime(6969);
 * const words = StringUtility.numberToWords(42069);
 * ```
 *
 * @example
 * ```typescript
 * // Import everything
 * import * as Utilities from '@portnumbergenerator/legacy/utilities';
 *
 * const formats = Utilities.FormatConverter.toAllFormats(6969);
 * const factors = Utilities.MathUtility.primeFactors(42069);
 * ```
 */

// =========================================================================
// FORMAT CONVERSION UTILITIES
// =========================================================================

export {
	FormatConverter,
	type FormatConversionResult,
} from "./FormatConverter.utility.js";

// =========================================================================
// MATHEMATICAL UTILITIES
// =========================================================================

export { MathUtility } from "./MathUtility.utility.js";

// =========================================================================
// STRING UTILITIES
// =========================================================================

export { StringUtility } from "./StringUtility.utility.js";

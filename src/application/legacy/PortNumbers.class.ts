/**
 * @fileoverview PortNumbers - Legacy comprehensive port number utility class
 * @module @portnumbergenerator/application/legacy
 * @category Application Layer - Legacy
 * @since 1.0.0
 * @deprecated Consider using the VM-based factory system for new implementations
 *
 * @description
 * The PortNumbers class provides a comprehensive suite of port number utilities,
 * calculations, transformations, and mathematical operations. Originally developed
 * as the primary port generation system, it now serves as a legacy compatibility
 * layer and utility library.
 *
 * **Features:**
 * - Deterministic port generation (frontend: 6969, backend: 42069)
 * - 200+ utility methods for port manipulation
 * - Mathematical operations, number theory functions
 * - Format conversions (hex, binary, octal, roman, morse, emoji)
 * - Statistical analysis and metadata extraction
 *
 * **Port Values:**
 * - Frontend: 6969 (SEX_NUMBER concatenated)
 * - Backend: 42069 (SNOOP_DOGG_NUMBER + SEX_NUMBER)
 *
 * @example
 * ```typescript
 * import { PortNumbers } from '@portnumbergenerator/application/legacy';
 *
 * const ports = new PortNumbers();
 * console.log(ports.frontendPortNumber()); // 6969
 * console.log(ports.backendPortNumber()); // 42069
 * ```
 */

import { SEX_NUMBER, SNOOP_DOGG_NUMBER } from "../../../types.js";
import type { PortNumberConfig } from "./PortNumberConfig.interface.js";

/**
 * @class PortNumbers
 * @classdesc Legacy port number utility class with 200+ methods for port manipulation
 *
 * @description
 * Comprehensive utility class for generating and manipulating port numbers.
 * Provides deterministic port values and extensive mathematical/statistical operations.
 *
 * **Core Functionality:**
 * - Port generation with validation
 * - Arithmetic operations (add, multiply, power, etc.)
 * - Number theory (prime, fibonacci, perfect numbers, etc.)
 * - Format conversions (binary, hex, roman numerals, morse code, emoji)
 * - Statistical analysis (entropy, distribution, digital roots)
 * - Bitwise operations (AND, OR, XOR, shifts)
 *
 * **Legacy Status:**
 * This class predates the VM-based factory system and is maintained for
 * backward compatibility. New code should prefer the factory pattern with
 * VM execution for enterprise-grade port provisioning.
 *
 * @example
 * ```typescript
 * const ports = new PortNumbers();
 * ports.frontendPortNumber(); // 6969
 * ports.backendPortNumber(); // 42069
 * ports.getSumOfPorts(); // 49038
 * ports.getPortGCD(); // 3
 * ```
 *
 * @public
 * @since 1.0.0
 */
export class PortNumbers {
	/**
	 * Configuration objects for frontend and backend ports.
	 * @private
	 * @readonly
	 */
	private readonly configs = {
		frontend: {
			formula: () => Number(`${SEX_NUMBER}${SEX_NUMBER}`),
			expected: 6969,
			errorMessage: "LÄÄLÄÄ HEI - Frontend port validation failed!",
		},
		backend: {
			formula: () => Number(`${SNOOP_DOGG_NUMBER}${SEX_NUMBER}`),
			expected: 42069,
			errorMessage: "LÄÄLÄÄ HEI - Backend port validation failed!",
		},
	} as const;

	/**
	 * Cached frontend port value.
	 * @private
	 * @type {number}
	 */
	private cachedFrontendPort: number;

	/**
	 * Cached backend port value.
	 * @private
	 * @type {number}
	 */
	private cachedBackendPort: number;

	/**
	 * Creates a new PortNumbers instance and initializes cached port values.
	 * @constructor
	 */
	constructor() {
		this.cachedFrontendPort = this.generatePort(this.configs.frontend);
		this.cachedBackendPort = this.generatePort(this.configs.backend);
	}

	/**
	 * Generates and validates a port number from a configuration.
	 * @private
	 * @template T
	 * @param {PortNumberConfig<T>} config - Port configuration
	 * @returns {T} The validated port number
	 * @throws {Error} If validation fails
	 */
	private generatePort<T extends number>(config: PortNumberConfig<T>): T {
		const port = config.formula();
		if (port !== config.expected) {
			throw new Error(config.errorMessage);
		}
		return port as T;
	}

	/**
	 * Gets the frontend port number.
	 * @returns {6969} The frontend development port
	 */
	frontendPortNumber(): 6969 {
		return this.cachedFrontendPort as 6969;
	}

	/**
	 * Gets the backend port number.
	 * @returns {42069} The backend API port
	 */
	backendPortNumber(): 42069 {
		return this.cachedBackendPort as 42069;
	}

	/**
	 * Static method to get the frontend port number.
	 * @static
	 * @returns {6969} The frontend development port
	 */
	static frontendPortNumber(): 6969 {
		return new PortNumbers().frontendPortNumber();
	}

	/**
	 * Static method to get the backend port number.
	 * @static
	 * @returns {42069} The backend API port
	 */
	static backendPortNumber(): 42069 {
		return new PortNumbers().backendPortNumber();
	}

	/**
	 * Creates a port number generator function from a configuration.
	 * @static
	 * @template T
	 * @param {PortNumberConfig<T>} config - Port configuration
	 * @returns {() => T} Generator function
	 */
	static createPortNumber<T extends number>(
		config: PortNumberConfig<T>
	): () => T {
		return () => new PortNumbers().generatePort(config);
	}

	// =========================================================================
	// ENTERPRISE UTILITY METHODS (RESTORED & ENHANCED)
	// =========================================================================

	getFrontendPortAsString(): string {
		return String(this.frontendPortNumber());
	}

	getBackendPortAsString(): string {
		return String(this.backendPortNumber());
	}

	getFrontendPortAsHex(): string {
		return this.frontendPortNumber().toString(16);
	}

	getBackendPortAsHex(): string {
		return this.backendPortNumber().toString(16);
	}

	getFrontendPortAsOctal(): string {
		return this.frontendPortNumber().toString(8);
	}

	getBackendPortAsOctal(): string {
		return this.backendPortNumber().toString(8);
	}

	getFrontendPortAsBinary(): string {
		return this.frontendPortNumber().toString(2);
	}

	getBackendPortAsBinary(): string {
		return this.backendPortNumber().toString(2);
	}

	/**
	 * Checks if frontend port is an even number.
	 *
	 * @returns {boolean} True if even, false if odd
	 *
	 * @description
	 * THE EVENNESS DETECTOR - Is it divisible by 2?
	 *
	 * Determines whether the frontend port number is even by checking
	 * if it's divisible by 2. Because sometimes you need to know if
	 * your port is even for... reasons.
	 *
	 * @example
	 * ```typescript
	 * ports.isFrontendPortEven(); // false (6969 is odd)
	 * ```
	 *
	 * @since 1.0.0
	 */
	isFrontendPortEven(): boolean {
		return this.frontendPortNumber() % 2 === 0;
	}

	/**
	 * Checks if backend port is an even number.
	 *
	 * @returns {boolean} True if even, false if odd
	 *
	 * @description
	 * Determines whether the backend port number is even.
	 *
	 * @example
	 * ```typescript
	 * ports.isBackendPortEven(); // false (42069 is odd)
	 * ```
	 *
	 * @since 1.0.0
	 */
	isBackendPortEven(): boolean {
		return this.backendPortNumber() % 2 === 0;
	}

	/**
	 * Checks if frontend port is an odd number.
	 *
	 * @returns {boolean} True if odd, false if even
	 *
	 * @description
	 * THE ODDNESS ORACLE - The inverse of evenness!
	 *
	 * Determines whether the frontend port number is odd by checking
	 * if it's NOT even. Revolutionary logic, we know.
	 *
	 * @example
	 * ```typescript
	 * ports.isFrontendPortOdd(); // true (6969 is odd)
	 * ```
	 *
	 * @since 1.0.0
	 */
	isFrontendPortOdd(): boolean {
		return !this.isFrontendPortEven();
	}

	/**
	 * Checks if backend port is an odd number.
	 *
	 * @returns {boolean} True if odd, false if even
	 *
	 * @description
	 * Determines whether the backend port number is odd.
	 *
	 * @example
	 * ```typescript
	 * ports.isBackendPortOdd(); // true (42069 is odd)
	 * ```
	 *
	 * @since 1.0.0
	 */
	isBackendPortOdd(): boolean {
		return !this.isBackendPortEven();
	}

	/**
	 * Calculates the square of the frontend port.
	 *
	 * @returns {number} Frontend port squared
	 *
	 * @description
	 * THE SQUARER - Multiplying by itself since forever!
	 *
	 * Raises the frontend port to the power of 2. Useful for calculating
	 * areas, comparing magnitudes, or just showing off mathematical prowess.
	 *
	 * @example
	 * ```typescript
	 * ports.getFrontendPortSquared(); // 48566961 (6969²)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getFrontendPortSquared(): number {
		return this.frontendPortNumber() ** 2;
	}

	/**
	 * Calculates the square of the backend port.
	 *
	 * @returns {number} Backend port squared
	 *
	 * @description
	 * Raises the backend port to the power of 2.
	 *
	 * @example
	 * ```typescript
	 * ports.getBackendPortSquared(); // 1769797761 (42069²)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getBackendPortSquared(): number {
		return this.backendPortNumber() ** 2;
	}

	/**
	 * Calculates the cube of the frontend port.
	 *
	 * @returns {number} Frontend port cubed
	 *
	 * @description
	 * THE CUBER - Taking it to the third dimension!
	 *
	 * Raises the frontend port to the power of 3. For when squared
	 * just isn't impressive enough.
	 *
	 * @example
	 * ```typescript
	 * ports.getFrontendPortCubed(); // 338368187409 (6969³)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getFrontendPortCubed(): number {
		return this.frontendPortNumber() ** 3;
	}

	/**
	 * Calculates the cube of the backend port.
	 *
	 * @returns {number} Backend port cubed
	 *
	 * @description
	 * Raises the backend port to the power of 3.
	 *
	 * @example
	 * ```typescript
	 * ports.getBackendPortCubed(); // 74454763005509 (42069³)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getBackendPortCubed(): number {
		return this.backendPortNumber() ** 3;
	}

	/**
	 * Calculates the square root of the frontend port.
	 *
	 * @returns {number} Square root of frontend port
	 *
	 * @description
	 * THE ROOT EXTRACTOR - Finding what was squared!
	 *
	 * Calculates the square root of the frontend port. Returns a decimal
	 * because perfect squares are for wimps.
	 *
	 * @example
	 * ```typescript
	 * ports.getFrontendPortSqrt(); // 83.4805... (√6969)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getFrontendPortSqrt(): number {
		return Math.sqrt(this.frontendPortNumber());
	}

	/**
	 * Calculates the square root of the backend port.
	 *
	 * @returns {number} Square root of backend port
	 *
	 * @description
	 * Calculates the square root of the backend port.
	 *
	 * @example
	 * ```typescript
	 * ports.getBackendPortSqrt(); // 205.1072... (√42069)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getBackendPortSqrt(): number {
		return Math.sqrt(this.backendPortNumber());
	}

	/**
	 * Gets the frontend port number with digits reversed.
	 *
	 * @returns {string} Port number with digits in reverse order
	 *
	 * @description
	 * THE REVERSER - Reading numbers backwards!
	 *
	 * Takes the frontend port number and reverses its digits. Useful for
	 * palindrome checking, mirror operations, or confusing people.
	 *
	 * @example
	 * ```typescript
	 * ports.getFrontendPortReversed(); // "9696" (reverse of 6969)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getFrontendPortReversed(): string {
		return this.getFrontendPortAsString().split("").reverse().join("");
	}

	/**
	 * Gets the backend port number with digits reversed.
	 *
	 * @returns {string} Port number with digits in reverse order
	 *
	 * @description
	 * Reverses the digits of the backend port number.
	 *
	 * @example
	 * ```typescript
	 * ports.getBackendPortReversed(); // "96024" (reverse of 42069)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getBackendPortReversed(): string {
		return this.getBackendPortAsString().split("").reverse().join("");
	}

	/**
	 * Calculates the sum of both ports.
	 *
	 * @returns {number} Sum of frontend and backend ports
	 *
	 * @description
	 * THE ADDER - Bringing ports together!
	 *
	 * Adds the frontend and backend ports together. Basic arithmetic,
	 * but wrapped in a method for that enterprise feel.
	 *
	 * @example
	 * ```typescript
	 * ports.getSumOfPorts(); // 49038 (6969 + 42069)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getSumOfPorts(): number {
		return this.frontendPortNumber() + this.backendPortNumber();
	}

	/**
	 * Calculates the difference between ports.
	 *
	 * @returns {number} Backend port minus frontend port
	 *
	 * @description
	 * THE SUBTRACTOR - How far apart are they?
	 *
	 * Subtracts frontend from backend port. Always positive because
	 * backend is always larger. That's just how we roll.
	 *
	 * @example
	 * ```typescript
	 * ports.getDifferenceOfPorts(); // 35100 (42069 - 6969)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getDifferenceOfPorts(): number {
		return this.backendPortNumber() - this.frontendPortNumber();
	}

	/**
	 * Calculates the product of both ports.
	 *
	 * @returns {number} Frontend port multiplied by backend port
	 *
	 * @description
	 * THE MULTIPLIER - Making big numbers bigger!
	 *
	 * Multiplies the two ports together. Results in a very large number
	 * that's probably not useful for anything practical.
	 *
	 * @example
	 * ```typescript
	 * ports.getProductOfPorts(); // 293186661 (6969 × 42069)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getProductOfPorts(): number {
		return this.frontendPortNumber() * this.backendPortNumber();
	}

	/**
	 * Calculates the quotient of ports.
	 *
	 * @returns {number} Backend port divided by frontend port
	 *
	 * @description
	 * THE DIVIDER - How many times bigger?
	 *
	 * Divides backend by frontend. Shows how many times larger the
	 * backend port is compared to frontend.
	 *
	 * @example
	 * ```typescript
	 * ports.getQuotientOfPorts(); // ~6.037 (42069 ÷ 6969)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getQuotientOfPorts(): number {
		return this.backendPortNumber() / this.frontendPortNumber();
	}

	/**
	 * Calculates the average of both ports.
	 *
	 * @returns {number} Mean of frontend and backend ports
	 *
	 * @description
	 * THE AVERAGER - Finding the middle ground!
	 *
	 * Calculates the arithmetic mean of the two ports. The perfect
	 * compromise between frontend and backend.
	 *
	 * @example
	 * ```typescript
	 * ports.getAverageOfPorts(); // 24519 ((6969 + 42069) ÷ 2)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getAverageOfPorts(): number {
		return this.getSumOfPorts() / 2;
	}

	/**
	 * Gets the minimum of the two ports.
	 *
	 * @returns {number} The smaller port number
	 *
	 * @description
	 * THE MINIMIZER - Always returns frontend!
	 *
	 * Returns the smaller of the two ports. Spoiler: it's always
	 * the frontend port (6969).
	 *
	 * @example
	 * ```typescript
	 * ports.getMinPort(); // 6969
	 * ```
	 *
	 * @since 1.0.0
	 */
	getMinPort(): number {
		return Math.min(this.frontendPortNumber(), this.backendPortNumber());
	}

	/**
	 * Gets the maximum of the two ports.
	 *
	 * @returns {number} The larger port number
	 *
	 * @description
	 * THE MAXIMIZER - Always returns backend!
	 *
	 * Returns the larger of the two ports. Spoiler: it's always
	 * the backend port (42069).
	 *
	 * @example
	 * ```typescript
	 * ports.getMaxPort(); // 42069
	 * ```
	 *
	 * @since 1.0.0
	 */
	getMaxPort(): number {
		return Math.max(this.frontendPortNumber(), this.backendPortNumber());
	}

	/**
	 * Calculates the sum of digits in the frontend port.
	 *
	 * @returns {number} Sum of all digits
	 *
	 * @description
	 * THE DIGIT SUMMER - Adding each digit!
	 *
	 * Sums up all the individual digits in the frontend port. Useful for
	 * digital root calculations and numerology enthusiasts.
	 *
	 * @example
	 * ```typescript
	 * ports.getFrontendPortDigitSum(); // 30 (6+9+6+9)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getFrontendPortDigitSum(): number {
		return this.getFrontendPortAsString()
			.split("")
			.reduce((sum, digit) => sum + Number.parseInt(digit), 0);
	}

	/**
	 * Calculates the sum of digits in the backend port.
	 *
	 * @returns {number} Sum of all digits
	 *
	 * @description
	 * Sums up all the individual digits in the backend port.
	 *
	 * @example
	 * ```typescript
	 * ports.getBackendPortDigitSum(); // 21 (4+2+0+6+9)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getBackendPortDigitSum(): number {
		return this.getBackendPortAsString()
			.split("")
			.reduce((sum, digit) => sum + Number.parseInt(digit), 0);
	}

	/**
	 * Calculates the product of digits in the frontend port.
	 *
	 * @returns {number} Product of all digits
	 *
	 * @description
	 * THE DIGIT MULTIPLIER - Multiplying each digit!
	 *
	 * Multiplies all the individual digits together. Watch out for zeros,
	 * they make everything zero!
	 *
	 * @example
	 * ```typescript
	 * ports.getFrontendPortDigitProduct(); // 2916 (6×9×6×9)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getFrontendPortDigitProduct(): number {
		return this.getFrontendPortAsString()
			.split("")
			.reduce((product, digit) => product * Number.parseInt(digit), 1);
	}

	/**
	 * Calculates the product of digits in the backend port.
	 *
	 * @returns {number} Product of all digits
	 *
	 * @description
	 * Multiplies all the individual digits together. Contains a zero,
	 * so the result is always 0. Whoops!
	 *
	 * @example
	 * ```typescript
	 * ports.getBackendPortDigitProduct(); // 0 (4×2×0×6×9 = 0)
	 * ```
	 *
	 * @since 1.0.0
	 */
	getBackendPortDigitProduct(): number {
		return this.getBackendPortAsString()
			.split("")
			.reduce((product, digit) => product * Number.parseInt(digit), 1);
	}

	/**
	 * Checks if both ports are positive numbers.
	 *
	 * @returns {boolean} True if both are positive
	 *
	 * @description
	 * THE POSITIVITY CHECKER - Are we optimistic?
	 *
	 * Verifies that both ports are positive numbers. Always returns true
	 * unless someone broke the system.
	 *
	 * @example
	 * ```typescript
	 * ports.areBothPortsPositive(); // true
	 * ```
	 *
	 * @since 1.0.0
	 */
	areBothPortsPositive(): boolean {
		return this.frontendPortNumber() > 0 && this.backendPortNumber() > 0;
	}

	/**
	 * Checks if both ports are negative numbers.
	 *
	 * @returns {boolean} True if both are negative
	 *
	 * @description
	 * THE NEGATIVITY CHECKER - Are we pessimistic?
	 *
	 * Verifies that both ports are negative numbers. Always returns false
	 * because our ports are inherently positive.
	 *
	 * @example
	 * ```typescript
	 * ports.areBothPortsNegative(); // false
	 * ```
	 *
	 * @since 1.0.0
	 */
	areBothPortsNegative(): boolean {
		return this.frontendPortNumber() < 0 && this.backendPortNumber() < 0;
	}

	/**
	 * Compares if frontend port is greater than backend port.
	 *
	 * @returns {boolean} True if frontend > backend
	 *
	 * @description
	 * THE COMPARATOR - Who's bigger?
	 *
	 * Performs a rigorous mathematical comparison to determine if the
	 * frontend port dares to be larger than the backend port. Spoiler:
	 * it never is (6969 < 42069).
	 *
	 * @example
	 * ```typescript
	 * ports.isFrontendPortGreaterThanBackend(); // false
	 * ```
	 *
	 * @since 1.0.0
	 */
	isFrontendPortGreaterThanBackend(): boolean {
		return this.frontendPortNumber() > this.backendPortNumber();
	}

	/**
	 * Compares if backend port is greater than frontend port.
	 *
	 * @returns {boolean} True if backend > frontend
	 *
	 * @description
	 * THE INVERSE COMPARATOR - The obvious answer!
	 *
	 * Checks if backend port is greater than frontend. Always returns
	 * true because 42069 > 6969. This method exists for symmetry.
	 *
	 * @example
	 * ```typescript
	 * ports.isBackendPortGreaterThanFrontend(); // true
	 * ```
	 *
	 * @since 1.0.0
	 */
	isBackendPortGreaterThanFrontend(): boolean {
		return this.backendPortNumber() > this.frontendPortNumber();
	}

	arePortsEqual(): boolean {
		return (
			(this.frontendPortNumber() as number) ===
			(this.backendPortNumber() as number)
		);
	}

	getFrontendPortModulo(n: number): number {
		return this.frontendPortNumber() % n;
	}

	getBackendPortModulo(n: number): number {
		return this.backendPortNumber() % n;
	}

	getFrontendPortPower(exponent: number): number {
		return this.frontendPortNumber() ** exponent;
	}

	getBackendPortPower(exponent: number): number {
		return this.backendPortNumber() ** exponent;
	}

	getPortsAsArray(): number[] {
		return [this.frontendPortNumber(), this.backendPortNumber()];
	}

	getPortsAsObject(): { frontend: number; backend: number } {
		return {
			frontend: this.frontendPortNumber(),
			backend: this.backendPortNumber(),
		};
	}

	getPortsAsJSON(): string {
		return JSON.stringify(this.getPortsAsObject());
	}

	getFrontendPortFactorial(): number {
		let result = 1;
		for (let i = 2; i <= this.frontendPortNumber(); i++) {
			result *= i;
		}
		return result;
	}

	getBackendPortFactorial(): number {
		let result = 1;
		for (let i = 2; i <= this.backendPortNumber(); i++) {
			result *= i;
		}
		return result;
	}

	isFrontendPortPrime(): boolean {
		const n = this.frontendPortNumber();
		if (n <= 1) return false;
		if (n <= 3) return true;
		if (n % 2 === 0 || n % 3 === 0) return false;
		for (let i = 5; i * i <= n; i += 6) {
			if (n % i === 0 || n % (i + 2) === 0) return false;
		}
		return true;
	}

	isBackendPortPrime(): boolean {
		const n = this.backendPortNumber();
		if (n <= 1) return false;
		if (n <= 3) return true;
		if (n % 2 === 0 || n % 3 === 0) return false;
		for (let i = 5; i * i <= n; i += 6) {
			if (n % i === 0 || n % (i + 2) === 0) return false;
		}
		return true;
	}

	getFrontendPortAbsoluteValue(): number {
		return Math.abs(this.frontendPortNumber());
	}

	getBackendPortAbsoluteValue(): number {
		return Math.abs(this.backendPortNumber());
	}

	getFrontendPortFloor(): number {
		return Math.floor(this.frontendPortNumber());
	}

	getBackendPortFloor(): number {
		return Math.floor(this.backendPortNumber());
	}

	getFrontendPortCeil(): number {
		return Math.ceil(this.frontendPortNumber());
	}

	getBackendPortCeil(): number {
		return Math.ceil(this.backendPortNumber());
	}

	getFrontendPortRound(): number {
		return Math.round(this.frontendPortNumber());
	}

	getBackendPortRound(): number {
		return Math.round(this.backendPortNumber());
	}

	getFrontendPortTrunc(): number {
		return Math.trunc(this.frontendPortNumber());
	}

	getBackendPortTrunc(): number {
		return Math.trunc(this.backendPortNumber());
	}

	getFrontendPortSign(): number {
		return Math.sign(this.frontendPortNumber());
	}

	getBackendPortSign(): number {
		return Math.sign(this.backendPortNumber());
	}

	getFrontendPortLog(): number {
		return Math.log(this.frontendPortNumber());
	}

	getBackendPortLog(): number {
		return Math.log(this.backendPortNumber());
	}

	getFrontendPortLog10(): number {
		return Math.log10(this.frontendPortNumber());
	}

	getBackendPortLog10(): number {
		return Math.log10(this.backendPortNumber());
	}

	getFrontendPortExp(): number {
		return Math.exp(this.frontendPortNumber());
	}

	getBackendPortExp(): number {
		return Math.exp(this.backendPortNumber());
	}

	getPortRatio(): number {
		return this.backendPortNumber() / this.frontendPortNumber();
	}

	getPortRatioInverted(): number {
		return this.frontendPortNumber() / this.backendPortNumber();
	}

	getPortRatioAsPercentage(): string {
		return `${(this.getPortRatio() * 100).toFixed(2)}%`;
	}

	getPortDifferenceAbsolute(): number {
		return Math.abs(this.getDifferenceOfPorts());
	}

	cloneFrontendPort(): number {
		return this.frontendPortNumber();
	}

	cloneBackendPort(): number {
		return this.backendPortNumber();
	}

	serializeFrontendPort(): string {
		return JSON.stringify({ port: this.frontendPortNumber() });
	}

	serializeBackendPort(): string {
		return JSON.stringify({ port: this.backendPortNumber() });
	}

	getFrontendPortLength(): number {
		return this.getFrontendPortAsString().length;
	}

	getBackendPortLength(): number {
		return this.getBackendPortAsString().length;
	}

	/**
	 * Checks if frontend port is divisible by a given number.
	 *
	 * @param {number} n - The divisor to check
	 * @returns {boolean} True if evenly divisible
	 *
	 * @description
	 * THE DIVISIBILITY TESTER - Does it divide evenly?
	 *
	 * Tests whether the frontend port is evenly divisible by the given
	 * number using the modulo operator. Mathematics at its finest!
	 *
	 * @example
	 * ```typescript
	 * ports.isFrontendPortDivisibleBy(3); // true (6969 ÷ 3 = 2323)
	 * ports.isFrontendPortDivisibleBy(7); // true (6969 ÷ 7 = 995.57...)
	 * ```
	 *
	 * @since 1.0.0
	 */
	isFrontendPortDivisibleBy(n: number): boolean {
		return this.frontendPortNumber() % n === 0;
	}

	/**
	 * Checks if backend port is divisible by a given number.
	 *
	 * @param {number} n - The divisor to check
	 * @returns {boolean} True if evenly divisible
	 *
	 * @description
	 * Tests whether the backend port is evenly divisible by the given number.
	 *
	 * @example
	 * ```typescript
	 * ports.isBackendPortDivisibleBy(3); // true (42069 ÷ 3 = 14023)
	 * ```
	 *
	 * @since 1.0.0
	 */
	isBackendPortDivisibleBy(n: number): boolean {
		return this.backendPortNumber() % n === 0;
	}

	getFrontendPortWithPrefix(prefix: string): string {
		return `${prefix}${this.frontendPortNumber()}`;
	}

	getBackendPortWithPrefix(prefix: string): string {
		return `${prefix}${this.backendPortNumber()}`;
	}

	getFrontendPortWithSuffix(suffix: string): string {
		return `${this.frontendPortNumber()}${suffix}`;
	}

	getBackendPortWithSuffix(suffix: string): string {
		return `${this.backendPortNumber()}${suffix}`;
	}

	getFrontendPortPadded(length: number, char = "0"): string {
		return this.getFrontendPortAsString().padStart(length, char);
	}

	getBackendPortPadded(length: number, char = "0"): string {
		return this.getBackendPortAsString().padStart(length, char);
	}

	comparePorts(): number {
		if (this.frontendPortNumber() < this.backendPortNumber()) return -1;
		if (this.frontendPortNumber() > this.backendPortNumber()) return 1;
		return 0;
	}

	swapPorts(): { frontend: number; backend: number } {
		return {
			frontend: this.backendPortNumber(),
			backend: this.frontendPortNumber(),
		};
	}

	getPortHash(): number {
		return this.frontendPortNumber() ^ this.backendPortNumber();
	}

	getPortXor(): number {
		return this.frontendPortNumber() ^ this.backendPortNumber();
	}

	getPortAnd(): number {
		return this.frontendPortNumber() & this.backendPortNumber();
	}

	getPortOr(): number {
		return this.frontendPortNumber() | this.backendPortNumber();
	}

	getFrontendPortNot(): number {
		return ~this.frontendPortNumber();
	}

	getBackendPortNot(): number {
		return ~this.backendPortNumber();
	}

	getFrontendPortLeftShift(bits: number): number {
		return this.frontendPortNumber() << bits;
	}

	getBackendPortLeftShift(bits: number): number {
		return this.backendPortNumber() << bits;
	}

	getFrontendPortRightShift(bits: number): number {
		return this.frontendPortNumber() >> bits;
	}

	getBackendPortRightShift(bits: number): number {
		return this.backendPortNumber() >> bits;
	}

	getPortGCD(): number {
		let a = this.frontendPortNumber() as number;
		let b = this.backendPortNumber() as number;
		while (b !== 0) {
			const temp = b;
			b = a % b;
			a = temp;
		}
		return a;
	}

	getPortLCM(): number {
		return (
			(this.frontendPortNumber() * this.backendPortNumber()) / this.getPortGCD()
		);
	}

	/**
	 * Checks if frontend port is a power of two.
	 *
	 * @returns {boolean} True if power of two
	 *
	 * @description
	 * THE POWER-OF-TWO DETECTOR - Bitwise wizardry!
	 *
	 * Uses the legendary bitwise trick `(n & (n - 1)) === 0` to determine
	 * if a number is a power of two. This works because powers of two have
	 * exactly one bit set in binary. Computer science magic!
	 *
	 * **Why This Matters:**
	 * - Powers of two are important for memory alignment
	 * - Common in computer systems (256, 512, 1024, etc.)
	 * - Makes you look smart at parties
	 *
	 * @example
	 * ```typescript
	 * ports.isFrontendPortPowerOfTwo(); // false (6969 is not 2^n)
	 * ```
	 *
	 * @since 1.0.0
	 */
	isFrontendPortPowerOfTwo(): boolean {
		const n = this.frontendPortNumber();
		return n > 0 && (n & (n - 1)) === 0;
	}

	/**
	 * Checks if backend port is a power of two.
	 *
	 * @returns {boolean} True if power of two
	 *
	 * @description
	 * Uses bitwise magic to check if backend port is a power of two.
	 *
	 * @example
	 * ```typescript
	 * ports.isBackendPortPowerOfTwo(); // false (42069 is not 2^n)
	 * ```
	 *
	 * @since 1.0.0
	 */
	isBackendPortPowerOfTwo(): boolean {
		const n = this.backendPortNumber();
		return n > 0 && (n & (n - 1)) === 0;
	}

	getFrontendPortNearestPowerOfTwo(): number {
		return Math.pow(2, Math.round(Math.log2(this.frontendPortNumber())));
	}

	getBackendPortNearestPowerOfTwo(): number {
		return Math.pow(2, Math.round(Math.log2(this.backendPortNumber())));
	}

	getPortsGeometricMean(): number {
		return Math.sqrt(this.getProductOfPorts());
	}

	getPortsHarmonicMean(): number {
		return 2 / (1 / this.frontendPortNumber() + 1 / this.backendPortNumber());
	}

	validateAllPorts(): boolean {
		return (
			this.frontendPortNumber() === 6969 && this.backendPortNumber() === 42069
		);
	}

	getPortMetadata(): Record<string, unknown> {
		return {
			frontend: this.frontendPortNumber(),
			backend: this.backendPortNumber(),
			sum: this.getSumOfPorts(),
			average: this.getAverageOfPorts(),
			min: this.getMinPort(),
			max: this.getMaxPort(),
			validated: this.validateAllPorts(),
		};
	}

	// =========================================================================
	// USELESS ENTERPRISE METHODS (LINGUISTIC & OBSCURE)
	// =========================================================================

	/**
	 * Converts the frontend port to a Roman Numeral.
	 * Useful for time-traveling debugging sessions in ancient Rome.
	 * @returns {string}
	 */
	getFrontendPortAsRomanNumeral(): string {
		return this.toRoman(this.frontendPortNumber());
	}

	/**
	 * Converts the backend port to a Roman Numeral.
	 * @returns {string}
	 */
	getBackendPortAsRomanNumeral(): string {
		return this.toRoman(this.backendPortNumber());
	}

	private toRoman(num: number): string {
		const lookup: Record<string, number> = {
			M: 1000,
			CM: 900,
			D: 500,
			CD: 400,
			C: 100,
			XC: 90,
			L: 50,
			XL: 40,
			X: 10,
			IX: 9,
			V: 5,
			IV: 4,
			I: 1,
		};
		let roman = "";
		for (const i in lookup) {
			while (num >= lookup[i]) {
				roman += i;
				num -= lookup[i];
			}
		}
		return roman;
	}

	/**
	 * Converts the frontend port to Morse Code.
	 * Essential for telegraph-based deployment pipelines.
	 * @returns {string}
	 */
	getFrontendPortAsMorseCode(): string {
		return this.toMorse(this.getFrontendPortAsString());
	}

	/**
	 * Converts the backend port to Morse Code.
	 * @returns {string}
	 */
	getBackendPortAsMorseCode(): string {
		return this.toMorse(this.getBackendPortAsString());
	}

	private toMorse(str: string): string {
		const morseCode: Record<string, string> = {
			"0": "-----",
			"1": ".----",
			"2": "..---",
			"3": "...--",
			"4": "....-",
			"5": ".....",
			"6": "-....",
			"7": "--...",
			"8": "---..",
			"9": "----.",
		};
		return str
			.split("")
			.map(char => morseCode[char] || "")
			.join(" ");
	}

	/**
	 * Converts the frontend port to a sequence of Emojis.
	 * Because developers love emojis.
	 * @returns {string}
	 */
	getFrontendPortAsEmoji(): string {
		return this.toEmoji(this.getFrontendPortAsString());
	}

	/**
	 * Converts the backend port to Emojis.
	 * @returns {string}
	 */
	getBackendPortAsEmoji(): string {
		return this.toEmoji(this.getBackendPortAsString());
	}

	private toEmoji(str: string): string {
		const emojiMap: Record<string, string> = {
			"0": "0️⃣",
			"1": "1️⃣",
			"2": "2️⃣",
			"3": "3️⃣",
			"4": "4️⃣",
			"5": "5️⃣",
			"6": "6️⃣",
			"7": "7️⃣",
			"8": "8️⃣",
			"9": "9️⃣",
		};
		return str
			.split("")
			.map(char => emojiMap[char] || char)
			.join("");
	}

	/**
	 * Checks if the frontend port is a Fibonacci number.
	 * Critical for golden ratio compliance.
	 * @returns {boolean}
	 */
	isFrontendPortFibonacci(): boolean {
		return this.isFibonacci(this.frontendPortNumber());
	}

	/**
	 * Checks if the backend port is a Fibonacci number.
	 * @returns {boolean}
	 */
	isBackendPortFibonacci(): boolean {
		return this.isFibonacci(this.backendPortNumber());
	}

	private isFibonacci(n: number): boolean {
		const isPerfectSquare = (x: number) => {
			const s = Math.sqrt(x);
			return s * s === x;
		};
		return isPerfectSquare(5 * n * n + 4) || isPerfectSquare(5 * n * n - 4);
	}

	/**
	 * Calculates the Shannon Entropy of the frontend port digits.
	 * Measures the information density of the port.
	 * @returns {number}
	 */
	getFrontendPortEntropy(): number {
		return this.calculateEntropy(this.getFrontendPortAsString());
	}

	/**
	 * Calculates the Shannon Entropy of the backend port digits.
	 * @returns {number}
	 */
	getBackendPortEntropy(): number {
		return this.calculateEntropy(this.getBackendPortAsString());
	}

	private calculateEntropy(str: string): number {
		const len = str.length;
		const frequencies: Record<string, number> = {};
		for (const char of str) {
			frequencies[char] = (frequencies[char] || 0) + 1;
		}
		return Object.values(frequencies).reduce((sum, count) => {
			const p = count / len;
			return sum - p * Math.log2(p);
		}, 0);
	}

	/**
	 * Encodes the frontend port in Base64.
	 * For when you need to smuggle the port through a text-only protocol.
	 * @returns {string}
	 */
	getFrontendPortAsBase64(): string {
		return btoa(this.getFrontendPortAsString());
	}

	/**
	 * Encodes the backend port in Base64.
	 * @returns {string}
	 */
	getBackendPortAsBase64(): string {
		return btoa(this.getBackendPortAsString());
	}

	/**
	 * Applies ROT13 cipher to the frontend port string.
	 * Security through obscurity at its finest.
	 * @returns {string}
	 */
	getFrontendPortAsRot13(): string {
		return this.rot13(this.getFrontendPortAsString());
	}

	private rot13(str: string): string {
		return str.replace(/[a-zA-Z]/g, (c: string) => {
			const base = c <= "Z" ? 65 : 97;
			return String.fromCharCode(base + ((c.charCodeAt(0) - base + 13) % 26));
		});
	}

	// =========================================================================
	// ADVANCED PORT ANALYSIS METHODS
	// =========================================================================

	/**
	 * Calculates the Collatz sequence length for the frontend port.
	 * @returns {number} The sequence length.
	 */
	getFrontendPortCollatzLength(): number {
		return this.collatzLength(this.frontendPortNumber());
	}

	/**
	 * Calculates the Collatz sequence length for the backend port.
	 * @returns {number} The sequence length.
	 */
	getBackendPortCollatzLength(): number {
		return this.collatzLength(this.backendPortNumber());
	}

	private collatzLength(n: number): number {
		let length = 0;
		while (n !== 1) {
			n = n % 2 === 0 ? n / 2 : 3 * n + 1;
			length++;
		}
		return length;
	}

	/**
	 * Converts frontend port to words.
	 * @returns {string} Port number in words.
	 */
	getFrontendPortAsWords(): string {
		return this.numberToWords(this.frontendPortNumber());
	}

	/**
	 * Converts backend port to words.
	 * @returns {string} Port number in words.
	 */
	getBackendPortAsWords(): string {
		return this.numberToWords(this.backendPortNumber());
	}

	private numberToWords(num: number): string {
		const ones = [
			"",
			"one",
			"two",
			"three",
			"four",
			"five",
			"six",
			"seven",
			"eight",
			"nine",
		];
		const tens = [
			"",
			"",
			"twenty",
			"thirty",
			"forty",
			"fifty",
			"sixty",
			"seventy",
			"eighty",
			"ninety",
		];
		const teens = [
			"ten",
			"eleven",
			"twelve",
			"thirteen",
			"fourteen",
			"fifteen",
			"sixteen",
			"seventeen",
			"eighteen",
			"nineteen",
		];

		if (num === 0) return "zero";
		if (num < 10) return ones[num];
		if (num < 20) return teens[num - 10];
		if (num < 100)
			return (
				tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
			);
		if (num < 1000)
			return (
				ones[Math.floor(num / 100)] +
				" hundred" +
				(num % 100 ? " " + this.numberToWords(num % 100) : "")
			);
		if (num < 10000)
			return (
				this.numberToWords(Math.floor(num / 1000)) +
				" thousand" +
				(num % 1000 ? " " + this.numberToWords(num % 1000) : "")
			);
		return num.toString();
	}

	/**
	 * Gets the prime factorization of the frontend port.
	 * @returns {number[]} Array of prime factors.
	 */
	getFrontendPortPrimeFactors(): number[] {
		return this.primeFactors(this.frontendPortNumber());
	}

	/**
	 * Gets the prime factorization of the backend port.
	 * @returns {number[]} Array of prime factors.
	 */
	getBackendPortPrimeFactors(): number[] {
		return this.primeFactors(this.backendPortNumber());
	}

	private primeFactors(n: number): number[] {
		const factors: number[] = [];
		let divisor = 2;
		while (n >= 2) {
			if (n % divisor === 0) {
				factors.push(divisor);
				n = n / divisor;
			} else {
				divisor++;
			}
		}
		return factors;
	}

	/**
	 * Checks if frontend port is a perfect square.
	 * @returns {boolean} True if perfect square.
	 */
	isFrontendPortPerfectSquare(): boolean {
		const sqrt = Math.sqrt(this.frontendPortNumber());
		return sqrt === Math.floor(sqrt);
	}

	/**
	 * Checks if backend port is a perfect square.
	 * @returns {boolean} True if perfect square.
	 */
	isBackendPortPerfectSquare(): boolean {
		const sqrt = Math.sqrt(this.backendPortNumber());
		return sqrt === Math.floor(sqrt);
	}

	/**
	 * Checks if frontend port is a perfect cube.
	 * @returns {boolean} True if perfect cube.
	 */
	isFrontendPortPerfectCube(): boolean {
		const cbrt = Math.cbrt(this.frontendPortNumber());
		return Math.abs(cbrt - Math.round(cbrt)) < 1e-10;
	}

	/**
	 * Checks if backend port is a perfect cube.
	 * @returns {boolean} True if perfect cube.
	 */
	isBackendPortPerfectCube(): boolean {
		const cbrt = Math.cbrt(this.backendPortNumber());
		return Math.abs(cbrt - Math.round(cbrt)) < 1e-10;
	}

	/**
	 * Gets the number of divisors for frontend port.
	 * @returns {number} Divisor count.
	 */
	getFrontendPortDivisorCount(): number {
		return this.getDivisorCount(this.frontendPortNumber());
	}

	/**
	 * Gets the number of divisors for backend port.
	 * @returns {number} Divisor count.
	 */
	getBackendPortDivisorCount(): number {
		return this.getDivisorCount(this.backendPortNumber());
	}

	private getDivisorCount(n: number): number {
		let count = 0;
		for (let i = 1; i <= Math.sqrt(n); i++) {
			if (n % i === 0) {
				count += i * i === n ? 1 : 2;
			}
		}
		return count;
	}

	/**
	 * Gets all divisors of the frontend port.
	 * @returns {number[]} Array of divisors.
	 */
	getFrontendPortDivisors(): number[] {
		return this.getDivisors(this.frontendPortNumber());
	}

	/**
	 * Gets all divisors of the backend port.
	 * @returns {number[]} Array of divisors.
	 */
	getBackendPortDivisors(): number[] {
		return this.getDivisors(this.backendPortNumber());
	}

	private getDivisors(n: number): number[] {
		const divisors: number[] = [];
		for (let i = 1; i <= Math.sqrt(n); i++) {
			if (n % i === 0) {
				divisors.push(i);
				if (i !== n / i) divisors.push(n / i);
			}
		}
		return divisors.sort((a, b) => a - b);
	}

	/**
	 * Checks if frontend port is an Armstrong number.
	 * @returns {boolean} True if Armstrong number.
	 */
	isFrontendPortArmstrong(): boolean {
		return this.isArmstrong(this.frontendPortNumber());
	}

	/**
	 * Checks if backend port is an Armstrong number.
	 * @returns {boolean} True if Armstrong number.
	 */
	isBackendPortArmstrong(): boolean {
		return this.isArmstrong(this.backendPortNumber());
	}

	private isArmstrong(n: number): boolean {
		const digits = n.toString().split("").map(Number);
		const power = digits.length;
		const sum = digits.reduce((acc, digit) => acc + Math.pow(digit, power), 0);
		return sum === n;
	}

	/**
	 * Checks if frontend port is a palindrome.
	 * @returns {boolean} True if palindrome.
	 */
	isFrontendPortPalindrome(): boolean {
		const str = this.getFrontendPortAsString();
		return str === str.split("").reverse().join("");
	}

	/**
	 * Checks if backend port is a palindrome.
	 * @returns {boolean} True if palindrome.
	 */
	isBackendPortPalindrome(): boolean {
		const str = this.getBackendPortAsString();
		return str === str.split("").reverse().join("");
	}

	/**
	 * Gets the digital root of the frontend port.
	 * @returns {number} The digital root.
	 */
	getFrontendPortDigitalRoot(): number {
		return this.digitalRoot(this.frontendPortNumber());
	}

	/**
	 * Gets the digital root of the backend port.
	 * @returns {number} The digital root.
	 */
	getBackendPortDigitalRoot(): number {
		return this.digitalRoot(this.backendPortNumber());
	}

	private digitalRoot(n: number): number {
		return n === 0 ? 0 : 1 + ((n - 1) % 9);
	}

	/**
	 * Converts frontend port to scientific notation.
	 * @returns {string} Scientific notation.
	 */
	getFrontendPortScientific(): string {
		return this.frontendPortNumber().toExponential();
	}

	/**
	 * Converts backend port to scientific notation.
	 * @returns {string} Scientific notation.
	 */
	getBackendPortScientific(): string {
		return this.backendPortNumber().toExponential();
	}

	/**
	 * Gets frontend port in different number bases.
	 * @returns {object} Port in various bases.
	 */
	getFrontendPortInBases(): {
		binary: string;
		octal: string;
		decimal: number;
		hex: string;
	} {
		const port = this.frontendPortNumber();
		return {
			binary: port.toString(2),
			octal: port.toString(8),
			decimal: port,
			hex: port.toString(16),
		};
	}

	/**
	 * Gets backend port in different number bases.
	 * @returns {object} Port in various bases.
	 */
	getBackendPortInBases(): {
		binary: string;
		octal: string;
		decimal: number;
		hex: string;
	} {
		const port = this.backendPortNumber();
		return {
			binary: port.toString(2),
			octal: port.toString(8),
			decimal: port,
			hex: port.toString(16),
		};
	}

	/**
	 * Calculates the persistence of the frontend port.
	 * @returns {number} Multiplicative persistence.
	 */
	getFrontendPortPersistence(): number {
		return this.multiplicativePersistence(this.frontendPortNumber());
	}

	/**
	 * Calculates the persistence of the backend port.
	 * @returns {number} Multiplicative persistence.
	 */
	getBackendPortPersistence(): number {
		return this.multiplicativePersistence(this.backendPortNumber());
	}

	private multiplicativePersistence(n: number): number {
		let steps = 0;
		while (n >= 10) {
			n = n
				.toString()
				.split("")
				.reduce((acc, digit) => acc * Number(digit), 1);
			steps++;
		}
		return steps;
	}

	/**
	 * Checks if ports are coprime.
	 * @returns {boolean} True if coprime.
	 */
	arePortsCoprime(): boolean {
		return this.getPortGCD() === 1;
	}

	/**
	 * Gets the Euler's totient function for frontend port.
	 * @returns {number} Totient value.
	 */
	getFrontendPortTotient(): number {
		return this.eulerTotient(this.frontendPortNumber());
	}

	/**
	 * Gets the Euler's totient function for backend port.
	 * @returns {number} Totient value.
	 */
	getBackendPortTotient(): number {
		return this.eulerTotient(this.backendPortNumber());
	}

	private eulerTotient(n: number): number {
		let result = n;
		for (let p = 2; p * p <= n; p++) {
			if (n % p === 0) {
				while (n % p === 0) n /= p;
				result -= result / p;
			}
		}
		if (n > 1) result -= result / n;
		return Math.floor(result);
	}

	/**
	 * Checks if frontend port is a triangular number.
	 * @returns {boolean} True if triangular.
	 */
	isFrontendPortTriangular(): boolean {
		const n = this.frontendPortNumber();
		const x = (Math.sqrt(8 * n + 1) - 1) / 2;
		return x === Math.floor(x);
	}

	/**
	 * Checks if backend port is a triangular number.
	 * @returns {boolean} True if triangular.
	 */
	isBackendPortTriangular(): boolean {
		const n = this.backendPortNumber();
		const x = (Math.sqrt(8 * n + 1) - 1) / 2;
		return x === Math.floor(x);
	}

	/**
	 * Checks if frontend port is a pentagonal number.
	 * @returns {boolean} True if pentagonal.
	 */
	isFrontendPortPentagonal(): boolean {
		const n = this.frontendPortNumber();
		const x = (Math.sqrt(24 * n + 1) + 1) / 6;
		return x === Math.floor(x);
	}

	/**
	 * Checks if backend port is a pentagonal number.
	 * @returns {boolean} True if pentagonal.
	 */
	isBackendPortPentagonal(): boolean {
		const n = this.backendPortNumber();
		const x = (Math.sqrt(24 * n + 1) + 1) / 6;
		return x === Math.floor(x);
	}

	/**
	 * Checks if frontend port is a hexagonal number.
	 * @returns {boolean} True if hexagonal.
	 */
	isFrontendPortHexagonal(): boolean {
		const n = this.frontendPortNumber();
		const x = (Math.sqrt(8 * n + 1) + 1) / 4;
		return x === Math.floor(x);
	}

	/**
	 * Checks if backend port is a hexagonal number.
	 * @returns {boolean} True if hexagonal.
	 */
	isBackendPortHexagonal(): boolean {
		const n = this.backendPortNumber();
		const x = (Math.sqrt(8 * n + 1) + 1) / 4;
		return x === Math.floor(x);
	}

	/**
	 * Gets the sum of proper divisors for frontend port.
	 * @returns {number} Sum of proper divisors.
	 */
	getFrontendPortProperDivisorSum(): number {
		const divisors = this.getDivisors(this.frontendPortNumber());
		return divisors.slice(0, -1).reduce((a, b) => a + b, 0);
	}

	/**
	 * Gets the sum of proper divisors for backend port.
	 * @returns {number} Sum of proper divisors.
	 */
	getBackendPortProperDivisorSum(): number {
		const divisors = this.getDivisors(this.backendPortNumber());
		return divisors.slice(0, -1).reduce((a, b) => a + b, 0);
	}

	/**
	 * Checks if frontend port is a perfect number.
	 * @returns {boolean} True if perfect.
	 */
	isFrontendPortPerfect(): boolean {
		return this.getFrontendPortProperDivisorSum() === this.frontendPortNumber();
	}

	/**
	 * Checks if backend port is a perfect number.
	 * @returns {boolean} True if perfect.
	 */
	isBackendPortPerfect(): boolean {
		return this.getBackendPortProperDivisorSum() === this.backendPortNumber();
	}

	/**
	 * Checks if frontend port is abundant.
	 * @returns {boolean} True if abundant.
	 */
	isFrontendPortAbundant(): boolean {
		return this.getFrontendPortProperDivisorSum() > this.frontendPortNumber();
	}

	/**
	 * Checks if backend port is abundant.
	 * @returns {boolean} True if abundant.
	 */
	isBackendPortAbundant(): boolean {
		return this.getBackendPortProperDivisorSum() > this.backendPortNumber();
	}

	/**
	 * Checks if frontend port is deficient.
	 * @returns {boolean} True if deficient.
	 */
	isFrontendPortDeficient(): boolean {
		return this.getFrontendPortProperDivisorSum() < this.frontendPortNumber();
	}

	/**
	 * Checks if backend port is deficient.
	 * @returns {boolean} True if deficient.
	 */
	isBackendPortDeficient(): boolean {
		return this.getBackendPortProperDivisorSum() < this.backendPortNumber();
	}

	/**
	 * Gets the nth Fibonacci number where n is the frontend port.
	 * @returns {number} The Fibonacci number (capped for performance).
	 */
	getFrontendPortFibonacciValue(): number {
		return this.fibonacci(Math.min(this.frontendPortNumber(), 50));
	}

	/**
	 * Gets the nth Fibonacci number where n is the backend port.
	 * @returns {number} The Fibonacci number (capped for performance).
	 */
	getBackendPortFibonacciValue(): number {
		return this.fibonacci(Math.min(this.backendPortNumber(), 50));
	}

	private fibonacci(n: number): number {
		if (n <= 1) return n;
		let a = 0,
			b = 1;
		for (let i = 2; i <= n; i++) {
			[a, b] = [b, a + b];
		}
		return b;
	}

	/**
	 * Converts frontend port to a QR-code-friendly format.
	 * @returns {string} QR-friendly string.
	 */
	getFrontendPortQRFormat(): string {
		return `PORT:${this.frontendPortNumber()}`;
	}

	/**
	 * Converts backend port to a QR-code-friendly format.
	 * @returns {string} QR-friendly string.
	 */
	getBackendPortQRFormat(): string {
		return `PORT:${this.backendPortNumber()}`;
	}

	/**
	 * Gets a URL-encoded version of the frontend port.
	 * @returns {string} URL-encoded port.
	 */
	getFrontendPortURLEncoded(): string {
		return encodeURIComponent(this.frontendPortNumber().toString());
	}

	/**
	 * Gets a URL-encoded version of the backend port.
	 * @returns {string} URL-encoded port.
	 */
	getBackendPortURLEncoded(): string {
		return encodeURIComponent(this.backendPortNumber().toString());
	}

	/**
	 * Creates a checksum for the frontend port.
	 * @returns {number} Simple checksum.
	 */
	getFrontendPortChecksum(): number {
		return this.getFrontendPortDigitSum() % 256;
	}

	/**
	 * Creates a checksum for the backend port.
	 * @returns {number} Simple checksum.
	 */
	getBackendPortChecksum(): number {
		return this.getBackendPortDigitSum() % 256;
	}

	/**
	 * Generates a hash code for the frontend port.
	 * @returns {number} Hash code.
	 */
	getFrontendPortHashCode(): number {
		const str = this.getFrontendPortAsString();
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = (hash << 5) - hash + str.charCodeAt(i);
			hash |= 0;
		}
		return hash;
	}

	/**
	 * Generates a hash code for the backend port.
	 * @returns {number} Hash code.
	 */
	getBackendPortHashCode(): number {
		const str = this.getBackendPortAsString();
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = (hash << 5) - hash + str.charCodeAt(i);
			hash |= 0;
		}
		return hash;
	}

	/**
	 * Compares ports using various metrics.
	 * @returns {object} Comparison results.
	 */
	comparePortsAdvanced(): {
		difference: number;
		ratio: number;
		gcd: number;
		lcm: number;
		coprime: boolean;
	} {
		return {
			difference: this.getDifferenceOfPorts(),
			ratio: this.getPortRatio(),
			gcd: this.getPortGCD(),
			lcm: this.getPortLCM(),
			coprime: this.arePortsCoprime(),
		};
	}

	/**
	 * Gets comprehensive port statistics.
	 * @returns {object} Statistics object.
	 */
	getComprehensiveStats(): Record<string, unknown> {
		return {
			frontend: {
				value: this.frontendPortNumber(),
				isPrime: this.isFrontendPortPrime(),
				isPerfectSquare: this.isFrontendPortPerfectSquare(),
				digitSum: this.getFrontendPortDigitSum(),
				divisorCount: this.getFrontendPortDivisorCount(),
			},
			backend: {
				value: this.backendPortNumber(),
				isPrime: this.isBackendPortPrime(),
				isPerfectSquare: this.isBackendPortPerfectSquare(),
				digitSum: this.getBackendPortDigitSum(),
				divisorCount: this.getBackendPortDivisorCount(),
			},
			combined: {
				sum: this.getSumOfPorts(),
				average: this.getAverageOfPorts(),
				gcd: this.getPortGCD(),
				lcm: this.getPortLCM(),
			},
		};
	}
}

/**
 * @module Metadata
 * @description Module metadata for tooling and documentation generation
 */
export const metadata = {
	module: "@portnumbergenerator/application/legacy/PortNumbers",
	version: "2.0.0",
	category: "Application Layer - Legacy",
	stability: "stable",
	deprecated: "Consider using VM-based factory system for new implementations",
	exported: ["PortNumbers"],
	dependencies: ["@portnumbergenerator/types"],
	methodCount: 200,
	description: "Comprehensive legacy port number utility class with 200+ methods",
};

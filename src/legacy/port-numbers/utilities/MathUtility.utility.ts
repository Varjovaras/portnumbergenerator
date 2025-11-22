/**
 * @fileoverview MathUtility - Mathematical operations and number theory utilities
 * @module @portnumbergenerator/legacy/utilities
 * @category Legacy Layer - Utilities
 * @since 1.0.0
 *
 * @description
 * Provides comprehensive mathematical utilities including:
 * - Basic arithmetic operations (square, cube, power, sqrt)
 * - Number theory (prime factors, fibonacci, euler totient)
 * - Number properties (even/odd, perfect, armstrong, palindrome)
 * - Advanced operations (collatz, divisors, digital root)
 *
 * @example
 * ```typescript
 * import { MathUtility } from '@portnumbergenerator/legacy/utilities';
 *
 * const isPrime = MathUtility.isPrime(6969);
 * const factors = MathUtility.primeFactors(42069);
 * const fib = MathUtility.fibonacci(10);
 * ```
 */

/**
 * @class MathUtility
 * @classdesc Utility class for mathematical operations and number theory
 *
 * @description
 * Static utility class providing mathematical and number theory functions.
 * All methods are pure functions with no side effects.
 *
 * **Categories:**
 * - Basic Operations: square, cube, power, sqrt, factorial
 * - Number Theory: primes, fibonacci, euler totient, gcd, lcm
 * - Properties: perfect, armstrong, palindrome, harshad
 * - Analysis: divisors, factors, digital root, persistence
 */
export class MathUtility {
	/**
	 * Private constructor to prevent instantiation
	 * @private
	 */
	private constructor() {}

	// =========================================================================
	// BASIC ARITHMETIC OPERATIONS
	// =========================================================================

	/**
	 * Calculates the square of a number
	 * @static
	 * @param {number} num - Number to square
	 * @returns {number} Square of the number
	 *
	 * @example
	 * MathUtility.square(69);  // 4761
	 */
	static square(num: number): number {
		return num ** 2;
	}

	/**
	 * Calculates the cube of a number
	 * @static
	 * @param {number} num - Number to cube
	 * @returns {number} Cube of the number
	 *
	 * @example
	 * MathUtility.cube(10);  // 1000
	 */
	static cube(num: number): number {
		return num ** 3;
	}

	/**
	 * Calculates a number raised to a power
	 * @static
	 * @param {number} base - Base number
	 * @param {number} exponent - Exponent
	 * @returns {number} Result of base^exponent
	 *
	 * @example
	 * MathUtility.power(2, 10);  // 1024
	 */
	static power(base: number, exponent: number): number {
		return base ** exponent;
	}

	/**
	 * Calculates the square root of a number
	 * @static
	 * @param {number} num - Number to find square root of
	 * @returns {number} Square root
	 *
	 * @example
	 * MathUtility.sqrt(6969);  // 83.48053...
	 */
	static sqrt(num: number): number {
		return Math.sqrt(num);
	}

	/**
	 * Calculates the factorial of a number
	 * @static
	 * @param {number} n - Non-negative integer
	 * @returns {number} Factorial of n
	 * @throws {RangeError} If n is negative
	 *
	 * @example
	 * MathUtility.factorial(5);   // 120
	 * MathUtility.factorial(10);  // 3628800
	 */
	static factorial(n: number): number {
		if (n < 0) throw new RangeError("Factorial undefined for negative numbers");
		if (n === 0 || n === 1) return 1;
		let result = 1;
		for (let i = 2; i <= n; i++) {
			result *= i;
		}
		return result;
	}

	// =========================================================================
	// NUMBER THEORY - PRIMALITY
	// =========================================================================

	/**
	 * Checks if a number is prime
	 * @static
	 * @param {number} n - Number to check
	 * @returns {boolean} True if prime, false otherwise
	 *
	 * @example
	 * MathUtility.isPrime(2);     // true
	 * MathUtility.isPrime(69);    // false
	 * MathUtility.isPrime(6967);  // true
	 */
	static isPrime(n: number): boolean {
		if (n <= 1) return false;
		if (n <= 3) return true;
		if (n % 2 === 0 || n % 3 === 0) return false;

		for (let i = 5; i * i <= n; i += 6) {
			if (n % i === 0 || n % (i + 2) === 0) return false;
		}
		return true;
	}

	/**
	 * Calculates prime factorization of a number
	 * @static
	 * @param {number} n - Number to factorize
	 * @returns {number[]} Array of prime factors
	 *
	 * @example
	 * MathUtility.primeFactors(6969);  // [3, 7, 331]
	 * MathUtility.primeFactors(420);   // [2, 2, 3, 5, 7]
	 */
	static primeFactors(n: number): number[] {
		const factors: number[] = [];
		let divisor = 2;

		while (n >= 2) {
			if (n % divisor === 0) {
				factors.push(divisor);
				n /= divisor;
			} else {
				divisor++;
			}
		}
		return factors;
	}

	/**
	 * Gets the next prime number after n
	 * @static
	 * @param {number} n - Starting number
	 * @returns {number} Next prime number
	 *
	 * @example
	 * MathUtility.nextPrime(69);  // 71
	 */
	static nextPrime(n: number): number {
		let candidate = n + 1;
		while (!MathUtility.isPrime(candidate)) {
			candidate++;
		}
		return candidate;
	}

	// =========================================================================
	// NUMBER THEORY - FIBONACCI
	// =========================================================================

	/**
	 * Calculates the nth Fibonacci number
	 * @static
	 * @param {number} n - Position in Fibonacci sequence (0-based)
	 * @returns {number} Fibonacci number at position n
	 *
	 * @example
	 * MathUtility.fibonacci(10);  // 55
	 * MathUtility.fibonacci(20);  // 6765
	 */
	static fibonacci(n: number): number {
		if (n <= 1) return n;
		let a = 0,
			b = 1;
		for (let i = 2; i <= n; i++) {
			[a, b] = [b, a + b];
		}
		return b;
	}

	/**
	 * Checks if a number is a Fibonacci number
	 * @static
	 * @param {number} n - Number to check
	 * @returns {boolean} True if Fibonacci number, false otherwise
	 *
	 * @example
	 * MathUtility.isFibonacci(55);    // true
	 * MathUtility.isFibonacci(6969);  // false
	 */
	static isFibonacci(n: number): boolean {
		const isPerfectSquare = (x: number) => {
			const s = Math.sqrt(x);
			return s === Math.floor(s);
		};
		return (
			isPerfectSquare(5 * n * n + 4) || isPerfectSquare(5 * n * n - 4)
		);
	}

	// =========================================================================
	// NUMBER THEORY - GCD & LCM
	// =========================================================================

	/**
	 * Calculates the greatest common divisor using Euclidean algorithm
	 * @static
	 * @param {number} a - First number
	 * @param {number} b - Second number
	 * @returns {number} Greatest common divisor
	 *
	 * @example
	 * MathUtility.gcd(6969, 420);  // 3
	 */
	static gcd(a: number, b: number): number {
		while (b !== 0) {
			[a, b] = [b, a % b];
		}
		return Math.abs(a);
	}

	/**
	 * Calculates the least common multiple
	 * @static
	 * @param {number} a - First number
	 * @param {number} b - Second number
	 * @returns {number} Least common multiple
	 *
	 * @example
	 * MathUtility.lcm(69, 420);  // 9660
	 */
	static lcm(a: number, b: number): number {
		return Math.abs(a * b) / MathUtility.gcd(a, b);
	}

	// =========================================================================
	// NUMBER THEORY - EULER TOTIENT
	// =========================================================================

	/**
	 * Calculates Euler's totient function (phi)
	 * Counts integers up to n that are coprime to n
	 * @static
	 * @param {number} n - Number to calculate totient for
	 * @returns {number} Euler's totient of n
	 *
	 * @example
	 * MathUtility.eulerTotient(69);   // 44
	 * MathUtility.eulerTotient(420);  // 96
	 */
	static eulerTotient(n: number): number {
		let result = n;
		for (let p = 2; p * p <= n; p++) {
			if (n % p === 0) {
				while (n % p === 0) {
					n /= p;
				}
				result -= result / p;
			}
		}
		if (n > 1) {
			result -= result / n;
		}
		return Math.floor(result);
	}

	// =========================================================================
	// DIVISOR ANALYSIS
	// =========================================================================

	/**
	 * Counts the number of divisors of n
	 * @static
	 * @param {number} n - Number to analyze
	 * @returns {number} Count of divisors
	 *
	 * @example
	 * MathUtility.getDivisorCount(6969);  // 8
	 */
	static getDivisorCount(n: number): number {
		let count = 0;
		for (let i = 1; i <= Math.sqrt(n); i++) {
			if (n % i === 0) {
				count += i * i === n ? 1 : 2;
			}
		}
		return count;
	}

	/**
	 * Gets all divisors of n
	 * @static
	 * @param {number} n - Number to get divisors for
	 * @returns {number[]} Sorted array of divisors
	 *
	 * @example
	 * MathUtility.getDivisors(69);  // [1, 3, 23, 69]
	 */
	static getDivisors(n: number): number[] {
		const divisors: number[] = [];
		for (let i = 1; i <= Math.sqrt(n); i++) {
			if (n % i === 0) {
				divisors.push(i);
				if (i !== n / i) {
					divisors.push(n / i);
				}
			}
		}
		return divisors.sort((a, b) => a - b);
	}

	/**
	 * Calculates the sum of divisors of n (including n)
	 * @static
	 * @param {number} n - Number to analyze
	 * @returns {number} Sum of all divisors
	 *
	 * @example
	 * MathUtility.sumOfDivisors(69);  // 96
	 */
	static sumOfDivisors(n: number): number {
		return MathUtility.getDivisors(n).reduce((sum, d) => sum + d, 0);
	}

	// =========================================================================
	// NUMBER PROPERTIES
	// =========================================================================

	/**
	 * Checks if a number is perfect (equals sum of proper divisors)
	 * @static
	 * @param {number} n - Number to check
	 * @returns {boolean} True if perfect number, false otherwise
	 *
	 * @example
	 * MathUtility.isPerfect(6);   // true (1+2+3=6)
	 * MathUtility.isPerfect(28);  // true
	 * MathUtility.isPerfect(69);  // false
	 */
	static isPerfect(n: number): boolean {
		if (n <= 1) return false;
		const divisors = MathUtility.getDivisors(n);
		const sum = divisors.slice(0, -1).reduce((acc, d) => acc + d, 0);
		return sum === n;
	}

	/**
	 * Checks if a number is an Armstrong number (narcissistic number)
	 * @static
	 * @param {number} n - Number to check
	 * @returns {boolean} True if Armstrong number, false otherwise
	 *
	 * @example
	 * MathUtility.isArmstrong(153);  // true (1^3 + 5^3 + 3^3 = 153)
	 * MathUtility.isArmstrong(9474); // true
	 */
	static isArmstrong(n: number): boolean {
		const digits = n.toString().split("").map(Number);
		const power = digits.length;
		const sum = digits.reduce((acc, d) => acc + d ** power, 0);
		return sum === n;
	}

	/**
	 * Checks if a number is a palindrome
	 * @static
	 * @param {number} n - Number to check
	 * @returns {boolean} True if palindrome, false otherwise
	 *
	 * @example
	 * MathUtility.isPalindrome(6969);   // false
	 * MathUtility.isPalindrome(12321);  // true
	 */
	static isPalindrome(n: number): boolean {
		const str = n.toString();
		return str === str.split("").reverse().join("");
	}

	/**
	 * Checks if a number is a Harshad number (divisible by sum of digits)
	 * @static
	 * @param {number} n - Number to check
	 * @returns {boolean} True if Harshad number, false otherwise
	 *
	 * @example
	 * MathUtility.isHarshad(18);  // true (18 / (1+8) = 2)
	 * MathUtility.isHarshad(69);  // false
	 */
	static isHarshad(n: number): boolean {
		const digitSum = n
			.toString()
			.split("")
			.map(Number)
			.reduce((a, b) => a + b, 0);
		return n % digitSum === 0;
	}

	// =========================================================================
	// DIGITAL OPERATIONS
	// =========================================================================

	/**
	 * Calculates the digital root of a number
	 * @static
	 * @param {number} n - Number to analyze
	 * @returns {number} Digital root (1-9, or 0 for 0)
	 *
	 * @example
	 * MathUtility.digitalRoot(6969);  // 3 (6+9+6+9=30, 3+0=3)
	 */
	static digitalRoot(n: number): number {
		return n === 0 ? 0 : 1 + ((n - 1) % 9);
	}

	/**
	 * Calculates the sum of digits
	 * @static
	 * @param {number} n - Number to analyze
	 * @returns {number} Sum of all digits
	 *
	 * @example
	 * MathUtility.sumOfDigits(6969);  // 30
	 */
	static sumOfDigits(n: number): number {
		return Math.abs(n)
			.toString()
			.split("")
			.map(Number)
			.reduce((a, b) => a + b, 0);
	}

	/**
	 * Calculates multiplicative persistence
	 * @static
	 * @param {number} n - Number to analyze
	 * @returns {number} Number of steps until single digit
	 *
	 * @example
	 * MathUtility.multiplicativePersistence(69);  // 3
	 */
	static multiplicativePersistence(n: number): number {
		let steps = 0;
		while (n >= 10) {
			n = n
				.toString()
				.split("")
				.map(Number)
				.reduce((a, b) => a * b, 1);
			steps++;
		}
		return steps;
	}

	// =========================================================================
	// COLLATZ CONJECTURE
	// =========================================================================

	/**
	 * Calculates the Collatz sequence length
	 * @static
	 * @param {number} n - Starting number
	 * @returns {number} Length of Collatz sequence
	 *
	 * @example
	 * MathUtility.collatzLength(69);  // 15
	 */
	static collatzLength(n: number): number {
		let length = 0;
		while (n !== 1) {
			n = n % 2 === 0 ? n / 2 : 3 * n + 1;
			length++;
		}
		return length;
	}

	/**
	 * Generates the Collatz sequence
	 * @static
	 * @param {number} n - Starting number
	 * @returns {number[]} Full Collatz sequence
	 *
	 * @example
	 * MathUtility.collatzSequence(10);  // [10, 5, 16, 8, 4, 2, 1]
	 */
	static collatzSequence(n: number): number[] {
		const sequence: number[] = [n];
		while (n !== 1) {
			n = n % 2 === 0 ? n / 2 : 3 * n + 1;
			sequence.push(n);
		}
		return sequence;
	}

	// =========================================================================
	// UTILITY CHECKS
	// =========================================================================

	/**
	 * Checks if a number is even
	 * @static
	 * @param {number} n - Number to check
	 * @returns {boolean} True if even, false otherwise
	 */
	static isEven(n: number): boolean {
		return n % 2 === 0;
	}

	/**
	 * Checks if a number is odd
	 * @static
	 * @param {number} n - Number to check
	 * @returns {boolean} True if odd, false otherwise
	 */
	static isOdd(n: number): boolean {
		return n % 2 !== 0;
	}
}

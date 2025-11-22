/**
 * @fileoverview StringUtility - String operations and conversion utilities
 * @module @portnumbergenerator/legacy/utilities
 * @category Legacy Layer - Utilities
 * @since 1.0.0
 *
 * @description
 * Provides comprehensive string utilities including:
 * - Text transformations (ROT13, reverse, uppercase/lowercase)
 * - Number to word conversions
 * - String analysis (entropy, character frequency)
 * - Encoding and cipher operations
 *
 * @example
 * ```typescript
 * import { StringUtility } from '@portnumbergenerator/legacy/utilities';
 *
 * const words = StringUtility.numberToWords(6969);
 * const rot13 = StringUtility.rot13("HELLO");
 * const entropy = StringUtility.calculateEntropy("6969");
 * ```
 */

/**
 * @class StringUtility
 * @classdesc Utility class for string operations and transformations
 *
 * @description
 * Static utility class providing string manipulation and analysis methods.
 * All methods are pure functions with no side effects.
 *
 * **Categories:**
 * - Transformations: ROT13, reverse, case conversions
 * - Conversions: number to words, digit operations
 * - Analysis: entropy, frequency analysis
 * - Encoding: various cipher operations
 */
export class StringUtility {
	/**
	 * Private constructor to prevent instantiation
	 * @private
	 */
	private constructor() {}

	// =========================================================================
	// TEXT TRANSFORMATIONS
	// =========================================================================

	/**
	 * Applies ROT13 cipher to a string
	 * @static
	 * @param {string} str - String to transform
	 * @returns {string} ROT13 transformed string
	 *
	 * @example
	 * StringUtility.rot13("HELLO");  // "URYYB"
	 * StringUtility.rot13("6969");   // "6969" (numbers unchanged)
	 */
	static rot13(str: string): string {
		return str.replace(/[a-zA-Z]/g, (c: string) => {
			const base = c <= "Z" ? 65 : 97;
			return String.fromCharCode(
				((c.charCodeAt(0) - base + 13) % 26) + base
			);
		});
	}

	/**
	 * Reverses a string
	 * @static
	 * @param {string} str - String to reverse
	 * @returns {string} Reversed string
	 *
	 * @example
	 * StringUtility.reverse("6969");  // "9696"
	 * StringUtility.reverse("PORT");  // "TROP"
	 */
	static reverse(str: string): string {
		return str.split("").reverse().join("");
	}

	/**
	 * Converts string to uppercase
	 * @static
	 * @param {string} str - String to convert
	 * @returns {string} Uppercase string
	 */
	static toUpperCase(str: string): string {
		return str.toUpperCase();
	}

	/**
	 * Converts string to lowercase
	 * @static
	 * @param {string} str - String to convert
	 * @returns {string} Lowercase string
	 */
	static toLowerCase(str: string): string {
		return str.toLowerCase();
	}

	/**
	 * Capitalizes the first letter of each word
	 * @static
	 * @param {string} str - String to capitalize
	 * @returns {string} Title case string
	 *
	 * @example
	 * StringUtility.toTitleCase("port generator");  // "Port Generator"
	 */
	static toTitleCase(str: string): string {
		return str.replace(/\b\w/g, (char) => char.toUpperCase());
	}

	// =========================================================================
	// NUMBER TO WORDS CONVERSION
	// =========================================================================

	/**
	 * Converts a number to its English word representation
	 * @static
	 * @param {number} num - Number to convert (0-999999)
	 * @returns {string} English word representation
	 *
	 * @example
	 * StringUtility.numberToWords(69);     // "sixty-nine"
	 * StringUtility.numberToWords(420);    // "four hundred twenty"
	 * StringUtility.numberToWords(6969);   // "six thousand nine hundred sixty-nine"
	 * StringUtility.numberToWords(42069);  // "forty-two thousand sixty-nine"
	 */
	static numberToWords(num: number): string {
		if (num === 0) return "zero";

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

		const convertHundreds = (n: number): string => {
			let result = "";

			const hundred = Math.floor(n / 100);
			if (hundred > 0) {
				result += ones[hundred] + " hundred";
				n %= 100;
				if (n > 0) result += " ";
			}

			if (n >= 10 && n < 20) {
				result += teens[n - 10];
			} else {
				const ten = Math.floor(n / 10);
				const one = n % 10;
				if (ten > 0) {
					result += tens[ten];
					if (one > 0) result += "-";
				}
				if (one > 0) {
					result += ones[one];
				}
			}

			return result;
		};

		let result = "";

		// Millions
		const millions = Math.floor(num / 1000000);
		if (millions > 0) {
			result += convertHundreds(millions) + " million";
			num %= 1000000;
			if (num > 0) result += " ";
		}

		// Thousands
		const thousands = Math.floor(num / 1000);
		if (thousands > 0) {
			result += convertHundreds(thousands) + " thousand";
			num %= 1000;
			if (num > 0) result += " ";
		}

		// Hundreds, tens, and ones
		if (num > 0) {
			result += convertHundreds(num);
		}

		return result.trim();
	}

	/**
	 * Converts a number to ordinal words
	 * @static
	 * @param {number} num - Number to convert
	 * @returns {string} Ordinal word representation
	 *
	 * @example
	 * StringUtility.numberToOrdinalWords(1);   // "first"
	 * StringUtility.numberToOrdinalWords(69);  // "sixty-ninth"
	 */
	static numberToOrdinalWords(num: number): string {
		const ordinals: Record<string, string> = {
			one: "first",
			two: "second",
			three: "third",
			five: "fifth",
			eight: "eighth",
			nine: "ninth",
			twelve: "twelfth",
		};

		let words = StringUtility.numberToWords(num);

		// Handle special cases
		for (const [cardinal, ordinal] of Object.entries(ordinals)) {
			if (words.endsWith(cardinal)) {
				return words.slice(0, -cardinal.length) + ordinal;
			}
		}

		// Handle -ty endings (twenty, thirty, etc.)
		if (words.endsWith("y")) {
			return words.slice(0, -1) + "ieth";
		}

		// Default: add "th"
		return words + "th";
	}

	// =========================================================================
	// STRING ANALYSIS
	// =========================================================================

	/**
	 * Calculates Shannon entropy of a string
	 * @static
	 * @param {string} str - String to analyze
	 * @returns {number} Entropy value
	 *
	 * @example
	 * StringUtility.calculateEntropy("6969");     // ~1.5
	 * StringUtility.calculateEntropy("abcdefg");  // ~2.8
	 */
	static calculateEntropy(str: string): number {
		const len = str.length;
		const frequencies: Record<string, number> = {};

		// Count character frequencies
		for (const char of str) {
			frequencies[char] = (frequencies[char] || 0) + 1;
		}

		// Calculate entropy
		let entropy = 0;
		for (const count of Object.values(frequencies)) {
			const probability = count / len;
			entropy -= probability * Math.log2(probability);
		}

		return entropy;
	}

	/**
	 * Gets character frequency analysis
	 * @static
	 * @param {string} str - String to analyze
	 * @returns {Record<string, number>} Character frequency map
	 *
	 * @example
	 * StringUtility.getCharacterFrequency("6969");
	 * // { "6": 2, "9": 2 }
	 */
	static getCharacterFrequency(str: string): Record<string, number> {
		const frequencies: Record<string, number> = {};
		for (const char of str) {
			frequencies[char] = (frequencies[char] || 0) + 1;
		}
		return frequencies;
	}

	/**
	 * Counts occurrences of a substring
	 * @static
	 * @param {string} str - String to search in
	 * @param {string} substring - Substring to count
	 * @returns {number} Number of occurrences
	 *
	 * @example
	 * StringUtility.countOccurrences("6969", "69");  // 2
	 */
	static countOccurrences(str: string, substring: string): number {
		if (substring.length === 0) return 0;
		let count = 0;
		let pos = 0;
		while ((pos = str.indexOf(substring, pos)) !== -1) {
			count++;
			pos += substring.length;
		}
		return count;
	}

	/**
	 * Checks if a string is a palindrome
	 * @static
	 * @param {string} str - String to check
	 * @returns {boolean} True if palindrome, false otherwise
	 *
	 * @example
	 * StringUtility.isPalindrome("6969");   // false
	 * StringUtility.isPalindrome("12321");  // true
	 */
	static isPalindrome(str: string): boolean {
		const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");
		return cleaned === StringUtility.reverse(cleaned);
	}

	// =========================================================================
	// DIGIT OPERATIONS
	// =========================================================================

	/**
	 * Extracts all digits from a string
	 * @static
	 * @param {string} str - String to extract from
	 * @returns {string} String containing only digits
	 *
	 * @example
	 * StringUtility.extractDigits("Port 6969");  // "6969"
	 */
	static extractDigits(str: string): string {
		return str.replace(/\D/g, "");
	}

	/**
	 * Removes all digits from a string
	 * @static
	 * @param {string} str - String to process
	 * @returns {string} String with digits removed
	 *
	 * @example
	 * StringUtility.removeDigits("Port 6969");  // "Port "
	 */
	static removeDigits(str: string): string {
		return str.replace(/\d/g, "");
	}

	/**
	 * Counts digits in a string
	 * @static
	 * @param {string} str - String to count
	 * @returns {number} Number of digits
	 *
	 * @example
	 * StringUtility.countDigits("Port 6969");  // 4
	 */
	static countDigits(str: string): number {
		return (str.match(/\d/g) || []).length;
	}

	// =========================================================================
	// PADDING AND FORMATTING
	// =========================================================================

	/**
	 * Pads a string to specified length with a character
	 * @static
	 * @param {string} str - String to pad
	 * @param {number} length - Target length
	 * @param {string} char - Padding character
	 * @param {boolean} left - Pad on left if true, right if false
	 * @returns {string} Padded string
	 *
	 * @example
	 * StringUtility.pad("69", 4, "0", true);   // "0069"
	 * StringUtility.pad("69", 4, "0", false);  // "6900"
	 */
	static pad(
		str: string,
		length: number,
		char: string = " ",
		left: boolean = true
	): string {
		if (str.length >= length) return str;
		const padding = char.repeat(length - str.length);
		return left ? padding + str : str + padding;
	}

	/**
	 * Truncates a string to specified length with ellipsis
	 * @static
	 * @param {string} str - String to truncate
	 * @param {number} length - Maximum length
	 * @param {string} ellipsis - Ellipsis string
	 * @returns {string} Truncated string
	 *
	 * @example
	 * StringUtility.truncate("PortGenerator", 8);  // "PortGe..."
	 */
	static truncate(str: string, length: number, ellipsis: string = "..."): string {
		if (str.length <= length) return str;
		return str.slice(0, length - ellipsis.length) + ellipsis;
	}

	// =========================================================================
	// UTILITY METHODS
	// =========================================================================

	/**
	 * Repeats a string n times
	 * @static
	 * @param {string} str - String to repeat
	 * @param {number} times - Number of repetitions
	 * @returns {string} Repeated string
	 *
	 * @example
	 * StringUtility.repeat("69", 3);  // "696969"
	 */
	static repeat(str: string, times: number): string {
		return str.repeat(times);
	}

	/**
	 * Checks if string contains only digits
	 * @static
	 * @param {string} str - String to check
	 * @returns {boolean} True if only digits, false otherwise
	 *
	 * @example
	 * StringUtility.isNumeric("6969");   // true
	 * StringUtility.isNumeric("Port69"); // false
	 */
	static isNumeric(str: string): boolean {
		return /^\d+$/.test(str);
	}

	/**
	 * Checks if string contains only alphabetic characters
	 * @static
	 * @param {string} str - String to check
	 * @returns {boolean} True if only letters, false otherwise
	 *
	 * @example
	 * StringUtility.isAlpha("Port");   // true
	 * StringUtility.isAlpha("Port69"); // false
	 */
	static isAlpha(str: string): boolean {
		return /^[a-zA-Z]+$/.test(str);
	}

	/**
	 * Checks if string contains only alphanumeric characters
	 * @static
	 * @param {string} str - String to check
	 * @returns {boolean} True if only letters and digits, false otherwise
	 *
	 * @example
	 * StringUtility.isAlphanumeric("Port6969"); // true
	 * StringUtility.isAlphanumeric("Port-69");  // false
	 */
	static isAlphanumeric(str: string): boolean {
		return /^[a-zA-Z0-9]+$/.test(str);
	}
}

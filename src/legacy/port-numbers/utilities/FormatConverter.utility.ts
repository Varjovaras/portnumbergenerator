/**
 * @fileoverview FormatConverter - Number format conversion utilities
 * @module @portnumbergenerator/legacy/utilities
 * @category Legacy Layer - Utilities
 * @since 1.0.0
 *
 * @description
 * Provides comprehensive format conversion utilities for port numbers including:
 * - Hexadecimal conversion
 * - Binary conversion
 * - Octal conversion
 * - Roman numeral conversion
 * - Morse code conversion
 * - Emoji representation conversion
 *
 * @example
 * ```typescript
 * import { FormatConverter } from '@portnumbergenerator/legacy/utilities';
 *
 * const hex = FormatConverter.toHex(6969);        // "1b39"
 * const binary = FormatConverter.toBinary(6969);  // "1101100111001"
 * const roman = FormatConverter.toRoman(42069);   // "XLMMLXIX"
 * ```
 */

/**
 * @class FormatConverter
 * @classdesc Utility class for converting numbers between various formats
 *
 * @description
 * Static utility class providing format conversion methods for port numbers.
 * All methods are pure functions with no side effects.
 *
 * **Supported Formats:**
 * - Hexadecimal (base 16)
 * - Binary (base 2)
 * - Octal (base 8)
 * - Roman numerals
 * - Morse code
 * - Emoji representations
 */
export class FormatConverter {
	/**
	 * Private constructor to prevent instantiation
	 * @private
	 */
	private constructor() {}

	// =========================================================================
	// STANDARD BASE CONVERSIONS
	// =========================================================================

	/**
	 * Converts a number to hexadecimal string
	 * @static
	 * @param {number} num - Number to convert
	 * @returns {string} Hexadecimal representation
	 *
	 * @example
	 * FormatConverter.toHex(6969);  // "1b39"
	 * FormatConverter.toHex(42069); // "a455"
	 */
	static toHex(num: number): string {
		return num.toString(16);
	}

	/**
	 * Converts a number to binary string
	 * @static
	 * @param {number} num - Number to convert
	 * @returns {string} Binary representation
	 *
	 * @example
	 * FormatConverter.toBinary(6969);  // "1101100111001"
	 * FormatConverter.toBinary(42069); // "1010010001010101"
	 */
	static toBinary(num: number): string {
		return num.toString(2);
	}

	/**
	 * Converts a number to octal string
	 * @static
	 * @param {number} num - Number to convert
	 * @returns {string} Octal representation
	 *
	 * @example
	 * FormatConverter.toOctal(6969);  // "15471"
	 * FormatConverter.toOctal(42069); // "122125"
	 */
	static toOctal(num: number): string {
		return num.toString(8);
	}

	// =========================================================================
	// ROMAN NUMERAL CONVERSION
	// =========================================================================

	/**
	 * Converts a number to Roman numeral string
	 * @static
	 * @param {number} num - Number to convert (1-3999)
	 * @returns {string} Roman numeral representation
	 * @throws {RangeError} If number is out of valid range
	 *
	 * @example
	 * FormatConverter.toRoman(69);    // "LXIX"
	 * FormatConverter.toRoman(420);   // "CDXX"
	 * FormatConverter.toRoman(6969);  // Error: out of range
	 */
	static toRoman(num: number): string {
		if (num < 1 || num > 3999) {
			throw new RangeError(
				"Roman numerals only support numbers between 1 and 3999"
			);
		}

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

		let result = "";
		for (const [roman, value] of Object.entries(lookup)) {
			while (num >= value) {
				result += roman;
				num -= value;
			}
		}
		return result;
	}

	// =========================================================================
	// MORSE CODE CONVERSION
	// =========================================================================

	/**
	 * Converts a string to Morse code representation
	 * @static
	 * @param {string} str - String to convert
	 * @returns {string} Morse code representation (space-separated)
	 *
	 * @example
	 * FormatConverter.toMorse("6969");   // "-..... ----. -.... ----."
	 * FormatConverter.toMorse("SOS");    // "... --- ..."
	 */
	static toMorse(str: string): string {
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
			A: ".-",
			B: "-...",
			C: "-.-.",
			D: "-..",
			E: ".",
			F: "..-.",
			G: "--.",
			H: "....",
			I: "..",
			J: ".---",
			K: "-.-",
			L: ".-..",
			M: "--",
			N: "-.",
			O: "---",
			P: ".--.",
			Q: "--.-",
			R: ".-.",
			S: "...",
			T: "-",
			U: "..-",
			V: "...-",
			W: ".--",
			X: "-..-",
			Y: "-.--",
			Z: "--..",
			" ": "/",
		};

		return str
			.toUpperCase()
			.split("")
			.map((char) => morseCode[char] || "")
			.join(" ");
	}

	// =========================================================================
	// EMOJI CONVERSION
	// =========================================================================

	/**
	 * Converts a string to emoji representation
	 * @static
	 * @param {string} str - String to convert
	 * @returns {string} Emoji representation
	 *
	 * @example
	 * FormatConverter.toEmoji("6969");   // "6️⃣9️⃣6️⃣9️⃣"
	 * FormatConverter.toEmoji("42069");  // "4️⃣2️⃣0️⃣6️⃣9️⃣"
	 */
	static toEmoji(str: string): string {
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
			.map((char) => emojiMap[char] || char)
			.join("");
	}

	// =========================================================================
	// CONVENIENCE METHODS FOR PORT NUMBERS
	// =========================================================================

	/**
	 * Converts a number to all supported formats
	 * @static
	 * @param {number} num - Number to convert
	 * @returns {FormatConversionResult} Object containing all format representations
	 *
	 * @example
	 * const formats = FormatConverter.toAllFormats(6969);
	 * // {
	 * //   decimal: 6969,
	 * //   hex: "1b39",
	 * //   binary: "1101100111001",
	 * //   octal: "15471",
	 * //   emoji: "6️⃣9️⃣6️⃣9️⃣",
	 * //   morse: "-..... ----. -.... ----."
	 * // }
	 */
	static toAllFormats(num: number): FormatConversionResult {
		const str = num.toString();
		return {
			decimal: num,
			hex: FormatConverter.toHex(num),
			binary: FormatConverter.toBinary(num),
			octal: FormatConverter.toOctal(num),
			emoji: FormatConverter.toEmoji(str),
			morse: FormatConverter.toMorse(str),
		};
	}
}

// =========================================================================
// TYPE DEFINITIONS
// =========================================================================

/**
 * @interface FormatConversionResult
 * @description Result object containing all format representations of a number
 *
 * @property {number} decimal - Original decimal number
 * @property {string} hex - Hexadecimal representation
 * @property {string} binary - Binary representation
 * @property {string} octal - Octal representation
 * @property {string} emoji - Emoji representation
 * @property {string} morse - Morse code representation
 */
export interface FormatConversionResult {
	/** Original decimal number */
	decimal: number;
	/** Hexadecimal representation */
	hex: string;
	/** Binary representation */
	binary: string;
	/** Octal representation */
	octal: string;
	/** Emoji representation */
	emoji: string;
	/** Morse code representation */
	morse: string;
}

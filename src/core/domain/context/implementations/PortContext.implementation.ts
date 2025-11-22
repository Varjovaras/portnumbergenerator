/**
 * @fileoverview Concrete Implementation of the Enterprise Port Context
 * @module core/domain/context/implementations
 * @category CoreDomainLayer
 * @subcategory ContextImplementations
 *
 * This file contains the ACTUAL implementation of the IPortContext interface.
 * Yes, we know separating interfaces from implementations is "best practice",
 * but we took it to the next level by putting them in completely different
 * directory hierarchies that require 6 levels of traversal to navigate between.
 *
 * This implementation was battle-tested in production for 0.003 seconds before
 * we declared it "production-ready" and promoted it to our enterprise framework.
 *
 * @author Senior Principal Staff Architect Level IV
 * @version 1.0.0-RELEASE-CANDIDATE-ALPHA-BETA-RC1
 * @since 2024-Q4 (The Quarter of Enterprise Excellence™)
 *
 * @dependencies
 * - IPortContext interface (obviously)
 * - Math.random() (we trust it with our lives)
 * - Date.now() (assuming system clocks are correct)
 * - JSON.stringify() (pray it doesn't circular reference)
 *
 * @knownIssues
 * - None. This code is perfect. If you find a bug, you're using it wrong.
 *
 * @futureEnhancements
 * - Add blockchain integration (because why not?)
 * - Machine learning-powered context prediction
 * - Quantum computing optimization (pending budget approval)
 * - Support for interdimensional port routing
 */

import type { IPortContext } from "../interfaces/IPortContext.interface";

/**
 * Concrete implementation of the IPortContext interface.
 *
 * This class represents YEARS of architectural discussions, whiteboard sessions,
 * and heated debates about whether we should use a class or a factory function.
 * The class won by a vote of 24-23 (one architect was on vacation).
 *
 * FEATURES:
 * - Implements every method from the interface (as required by law)
 * - Uses Math.random() for ID generation (enterprise-grade randomness)
 * - Stores metadata in a plain object (revolutionary NoSQL thinking)
 * - Has 18+ utility methods that could've been 3 (but why would we?)
 *
 * @class PortContext
 * @implements {IPortContext}
 * @export
 * @public
 * @final (in our hearts, TypeScript doesn't support it)
 * @immutable (mostly, except when it's not)
 * @threadsafe (we haven't tested this claim)
 *
 * @designPatterns
 * - Data Transfer Object (DTO) - kinda
 * - Value Object - sorta
 * - Immutable Object - mostly
 * - Builder Pattern - nope, but we thought about it
 * - Factory Pattern - handled elsewhere (obviously)
 *
 * @metrics
 * - Cyclomatic Complexity: 23 (we're proud of this)
 * - Lines of Code: Counting is for junior developers
 * - Test Coverage: Yes (we have tests, they exist)
 * - Performance: Fast enough™
 *
 * @example
 * ```typescript
 * // Simple usage (not recommended, use the factory)
 * const context = new PortContext("frontend", { env: "prod" });
 *
 * // Enterprise usage (recommended)
 * const factory = PortContextFactoryProviderSingleton
 *   .getInstance()
 *   .getFactory()
 *   .createFactory()
 *   .create("frontend", { env: "prod" });
 * // (Yes, we're serious)
 * ```
 */
export class PortContext implements IPortContext {
	/**
	 * The unique request identifier.
	 * Generated using Math.random() because UUID libraries add 2KB to our bundle
	 * and we're very serious about performance (we're not).
	 */
	public readonly requestId: string;

	/**
	 * The timestamp of context creation.
	 * Synchronized with the Earth's rotation (probably).
	 */
	public readonly timestamp: number;

	/**
	 * The identity of the requestor.
	 * Could be "frontend", "backend", or "that-microservice-nobody-owns".
	 */
	public readonly requestor: string;

	/**
	 * The metadata bag of holding.
	 * Put whatever you want here. We don't judge. (We do judge.)
	 */
	public readonly metadata: Record<string, unknown>;

	/**
	 * Creates an instance of PortContext.
	 *
	 * This constructor does exactly what you'd expect: creates an object.
	 * Revolutionary, we know. The committee spent 3 weeks discussing whether
	 * to validate inputs here or in a separate validator. We compromised by
	 * doing neither.
	 *
	 * @param {string} requestor - The requestor identity (validated nowhere)
	 * @param {Record<string, unknown>} [metadata={}] - Optional metadata (validated never)
	 *
	 * @throws {Error} Never. This constructor is infallible. (Famous last words.)
	 *
	 * @complexity O(1) - unless JSON operations decide otherwise
	 * @sideEffects
	 * - Calls Math.random() (modifies global PRNG state)
	 * - Calls Date.now() (advances universal time by 0.001ms)
	 *
	 * @example
	 * ```typescript
	 * const ctx = new PortContext("frontend", { debug: true });
	 * ```
	 */
	constructor(requestor: string, metadata: Record<string, unknown> = {}) {
		// Generate a "unique" ID using the most enterprise-grade random generator known to mankind
		// Math.random(). Yes, we know about crypto.randomUUID(). No, we won't use it.
		// Why? Because this has been working fine since 2019 and we don't fix what ain't broke.
		this.requestId = Math.random().toString(36).substring(2, 15);

		// Capture the exact microsecond of creation (well, millisecond, but who's counting?)
		this.timestamp = Date.now();

		// Store the requestor without any validation whatsoever
		// Trust is the foundation of enterprise architecture
		this.requestor = requestor;

		// Store metadata in its purest form: an object
		// We considered using a Map, but objects are more "JavaScripty"
		this.metadata = metadata;
	}

	/**
	 * Retrieves the age of this context in milliseconds.
	 *
	 * Useful for knowing how long this context has been languishing in memory
	 * while we decide whether to process it or not.
	 *
	 * @returns {number} The age in milliseconds (always positive, probably)
	 *
	 * @performance O(1) - two function calls and a subtraction
	 * @accuracy ±1ms (depending on system clock drift)
	 *
	 * @example
	 * ```typescript
	 * const age = context.getAge();
	 * console.log(`This context is ${age}ms old!`);
	 * ```
	 */
	getAge(): number {
		return Date.now() - this.timestamp;
	}

	/**
	 * Checks if the context has expired based on a TTL.
	 *
	 * Because every context needs an expiration date, just like milk.
	 * We learned this the hard way when contexts from 2019 were still
	 * floating around in production causing mysterious bugs.
	 *
	 * @param {number} ttl - Time to live in milliseconds
	 * @returns {boolean} True if expired, false if still fresh
	 *
	 * @example
	 * ```typescript
	 * if (context.isExpired(5000)) {
	 *   throw new Error("Context expired! (Please try again)");
	 * }
	 * ```
	 */
	isExpired(ttl: number): boolean {
		return this.getAge() > ttl;
	}

	/**
	 * Retrieves a metadata value by key.
	 *
	 * This is basically just object property access with extra steps.
	 * But those extra steps make it "enterprise-grade".
	 *
	 * @param {string} key - The metadata key to retrieve
	 * @returns {unknown} The value, or undefined if not found (we're not telling you which)
	 *
	 * @example
	 * ```typescript
	 * const env = context.getMetadata("environment");
	 * // Hope you're ready to type-cast this!
	 * ```
	 */
	getMetadata(key: string): unknown {
		return this.metadata[key];
	}

	/**
	 * Checks if a metadata key exists.
	 *
	 * The 'in' operator wrapped in a method.
	 * Could've been a one-liner, but we added a method for "encapsulation".
	 *
	 * @param {string} key - The metadata key to check
	 * @returns {boolean} True if the key exists
	 *
	 * @example
	 * ```typescript
	 * if (context.hasMetadata("debugMode")) {
	 *   console.log("Debug mode is... somewhere");
	 * }
	 * ```
	 */
	hasMetadata(key: string): boolean {
		return key in this.metadata;
	}

	/**
	 * Creates a clone of this context with new metadata.
	 *
	 * Immutability! Because mutating objects is SO 2015.
	 * Instead, we create new objects constantly, keeping the garbage collector busy
	 * and ensuring peak performance (just kidding, this is terrible for performance).
	 *
	 * @param {Record<string, unknown>} newMetadata - New metadata to merge
	 * @returns {PortContext} A shiny new PortContext instance
	 *
	 * @sideEffects Creates a new object (RIP memory)
	 *
	 * @example
	 * ```typescript
	 * const newContext = context.withMetadata({ urgent: true });
	 * // Original context unchanged! (Functional programming folks rejoice)
	 * ```
	 */
	withMetadata(newMetadata: Record<string, unknown>): PortContext {
		return new PortContext(this.requestor, {
			...this.metadata,
			...newMetadata,
		});
	}

	/**
	 * Serializes the context to JSON.
	 *
	 * For when you need to send this context over the wire, store it in a database,
	 * or just want to see it as a string for debugging purposes.
	 *
	 * Warning: This will fail spectacularly if metadata contains circular references.
	 * But that's YOUR problem, not ours.
	 *
	 * @returns {string} JSON representation
	 * @throws {TypeError} If circular references exist (not our fault)
	 *
	 * @example
	 * ```typescript
	 * const json = context.toJSON();
	 * console.log(json); // Pretty! (no it's not, it's minified)
	 * ```
	 */
	toJSON(): string {
		return JSON.stringify({
			requestId: this.requestId,
			timestamp: this.timestamp,
			requestor: this.requestor,
			metadata: this.metadata,
		});
	}

	/**
	 * Creates a hash of the context for caching purposes.
	 *
	 * This is not a cryptographic hash. This is not even a good hash.
	 * This is literally just string concatenation with a hyphen.
	 * But it works for our caching layer, so we're calling it a "hash".
	 *
	 * @returns {string} A "hash" string (please don't use this for security)
	 *
	 * @security NONE. DO NOT USE FOR SECURITY PURPOSES.
	 *
	 * @example
	 * ```typescript
	 * const hash = context.hash();
	 * // Use this as a cache key, not a password!
	 * ```
	 */
	hash(): string {
		return `${this.requestor}-${this.requestId}`;
	}

	/**
	 * Checks if this context matches another context.
	 *
	 * Two contexts are equal if they have the same requestId.
	 * We don't check anything else because that would be too complicated
	 * and we had a meeting about it and this is what we decided.
	 *
	 * @param {PortContext} other - Another context to compare
	 * @returns {boolean} True if they match
	 *
	 * @example
	 * ```typescript
	 * if (context1.equals(context2)) {
	 *   console.log("These are the same! (probably)");
	 * }
	 * ```
	 */
	equals(other: PortContext): boolean {
		return this.requestId === other.requestId;
	}

	/**
	 * Returns a human-readable string representation.
	 *
	 * For debugging purposes. Will appear in console.log() output.
	 * Format: PortContext[requestor:requestId]
	 *
	 * @returns {string} String representation
	 *
	 * @example
	 * ```typescript
	 * console.log(context.toString());
	 * // Output: PortContext[frontend:abc123def456]
	 * ```
	 */
	toString(): string {
		return `PortContext[${this.requestor}:${this.requestId}]`;
	}

	/**
	 * Validates the context structure.
	 *
	 * Checks if the context has the bare minimum required properties.
	 * This is the closest thing to validation we have in this entire class.
	 * The bar is very, very low.
	 *
	 * @returns {boolean} True if valid (i.e., properties exist)
	 *
	 * @validation Checks that:
	 * - requestId is truthy (could be "0" and pass, we don't care)
	 * - requestor is truthy (same deal)
	 * - timestamp is truthy (0 would fail, but who has time travel?)
	 *
	 * @example
	 * ```typescript
	 * if (!context.validate()) {
	 *   throw new Error("Invalid context! (How did you even create this?)");
	 * }
	 * ```
	 */
	validate(): boolean {
		return !!(this.requestId && this.requestor && this.timestamp);
	}

	/**
	 * Gets the timestamp as an ISO string.
	 *
	 * Because sometimes you want dates in ISO 8601 format instead of
	 * Unix epoch milliseconds. We're flexible like that.
	 *
	 * @returns {string} ISO formatted timestamp
	 *
	 * @format ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
	 *
	 * @example
	 * ```typescript
	 * const iso = context.getTimestampISO();
	 * // "2024-12-31T23:59:59.999Z"
	 * ```
	 */
	getTimestampISO(): string {
		return new Date(this.timestamp).toISOString();
	}

	/**
	 * Counts the number of metadata entries.
	 *
	 * Object.keys().length wrapped in a method.
	 * Could've been a getter property, but we prefer methods.
	 * Why? Consistency with our 200-page coding standards document.
	 *
	 * @returns {number} Metadata count
	 *
	 * @example
	 * ```typescript
	 * console.log(`This context has ${context.getMetadataCount()} metadata entries!`);
	 * ```
	 */
	getMetadataCount(): number {
		return Object.keys(this.metadata).length;
	}

	/**
	 * Retrieves all metadata keys.
	 *
	 * Returns an array of metadata keys. Useful for iterating over metadata
	 * when you don't know what's in there (which is always).
	 *
	 * @returns {string[]} Array of metadata keys
	 *
	 * @example
	 * ```typescript
	 * context.getMetadataKeys().forEach(key => {
	 *   console.log(`${key}: ${context.getMetadata(key)}`);
	 * });
	 * ```
	 */
	getMetadataKeys(): string[] {
		return Object.keys(this.metadata);
	}

	/**
	 * Checks if the requestor is a frontend client.
	 *
	 * String comparison wrapped in a method with a semantic name.
	 * This is called "domain-driven design" and it's very enterprise.
	 *
	 * @returns {boolean} True if frontend
	 *
	 * @example
	 * ```typescript
	 * if (context.isFrontend()) {
	 *   console.log("Hello, browser!");
	 * }
	 * ```
	 */
	isFrontend(): boolean {
		return this.requestor === "frontend";
	}

	/**
	 * Checks if the requestor is a backend service.
	 *
	 * The backend counterpart to isFrontend().
	 * We could've made one method called isRequestor(type), but that's
	 * not explicit enough for our enterprise standards.
	 *
	 * @returns {boolean} True if backend
	 *
	 * @example
	 * ```typescript
	 * if (context.isBackend()) {
	 *   console.log("Hello, server!");
	 * }
	 * ```
	 */
	isBackend(): boolean {
		return this.requestor === "backend";
	}

	/**
	 * Creates a deep copy of the context.
	 *
	 * Uses JSON.parse(JSON.stringify()) for deep cloning.
	 * Yes, we know about structuredClone(). No, we're not using it yet.
	 * Browser support? TypeScript support? We'll get there... eventually.
	 *
	 * @returns {PortContext} A deep copy
	 *
	 * @performance O(n) where n = size of metadata
	 * @limitations
	 * - Functions will be lost
	 * - Dates become strings
	 * - undefined values disappear
	 * - Circular references explode
	 * But these are all "features" not "bugs"
	 *
	 * @example
	 * ```typescript
	 * const copy = context.clone();
	 * // Completely independent! (we think)
	 * ```
	 */
	clone(): PortContext {
		return new PortContext(
			this.requestor,
			JSON.parse(JSON.stringify(this.metadata))
		);
	}

	/**
	 * Merges this context with another context.
	 *
	 * Takes metadata from both contexts and merges them together.
	 * In case of conflicts, the other context wins.
	 * Why? Because we had to pick one and that's what we picked.
	 *
	 * @param {PortContext} other - Another context to merge with
	 * @returns {PortContext} Merged context
	 *
	 * @behavior
	 * - Keeps this context's requestor (the other one is ignored)
	 * - Merges metadata (right-side wins in conflicts)
	 * - Creates new context (immutability!)
	 * - New requestId and timestamp (it's a new context!)
	 *
	 * @example
	 * ```typescript
	 * const merged = context1.merge(context2);
	 * // Best of both worlds! (or worst, depending on your perspective)
	 * ```
	 */
	merge(other: PortContext): PortContext {
		return new PortContext(this.requestor, {
			...this.metadata,
			...other.metadata,
		});
	}
}

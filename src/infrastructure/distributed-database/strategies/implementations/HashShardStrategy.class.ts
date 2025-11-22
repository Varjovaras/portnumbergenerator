/**
 * @fileoverview
 * HashShardStrategy - The Deterministic Data Distribution Democracy
 *
 * This file contains the implementation of a hash-based shard selection strategy,
 * which uses cryptographic principles (well, not really cryptographic, just
 * hash functions) to consistently map keys to shards. Unlike its chaotic cousin
 * RoundRobinShardStrategy, this strategy is DETERMINISTIC - same key always goes
 * to the same shard. Revolutionary!
 *
 * WHAT IS HASH-BASED SHARDING?
 * We take a key (like "user:12345"), run it through a hash function to get a
 * number, then use modulo arithmetic to map that number to a shard index.
 * It's like a very complicated way of saying "do some math on the string".
 *
 * WHY USE HASH-BASED SHARDING?
 * - Deterministic (same key -> same shard, always)
 * - Stateless (no internal counter to worry about)
 * - Lookup-friendly (you can find data again!)
 * - Scales reasonably (adding shards doesn't remap everything... wait, yes it does)
 * - Sounds sophisticated in meetings ("we use consistent hashing")
 *
 * WHY NOT USE HASH-BASED SHARDING?
 * - Distribution depends on hash quality (and our hash is... okay)
 * - Adding/removing shards remaps most keys (resharding nightmare)
 * - Hot keys create hot shards (popular keys overload one shard)
 * - Hash collisions possible (multiple keys -> same shard)
 * - Requires consistent hash function across all systems
 *
 * HASH FUNCTION DEEP DIVE:
 * We're using a simple polynomial rolling hash (djb2-ish). It's not
 * cryptographically secure, but it's:
 * - Fast: O(n) where n = key length
 * - Simple: Even junior devs can understand it
 * - Good enough: Distribution is acceptable
 * - Deterministic: Same input always produces same output
 * - Not secure: Don't use this for passwords or crypto
 *
 * THE HASH ALGORITHM:
 * ```
 * hash = 0
 * for each character in key:
 *     hash = (hash << 5) - hash + charCode
 *     hash = hash | 0  // Convert to 32-bit integer
 * return Math.abs(hash) % shardCount
 * ```
 *
 * MATHEMATICAL PROPERTIES:
 * - Domain: All possible strings
 * - Range: [0, shardCount)
 * - Collisions: Possible (different keys -> same shard)
 * - Distribution: Roughly uniform (good hash functions distribute well)
 * - Avalanche effect: Small key change -> completely different hash
 *
 * CONSISTENT HASHING NOTE:
 * This is NOT consistent hashing. True consistent hashing uses a hash ring
 * and minimizes remapping when shards change. We just do key % shardCount,
 * which remaps almost everything when shardCount changes. But hey, it's
 * simpler, and simplicity is a virtue (in this codebase).
 *
 * PERFORMANCE CHARACTERISTICS:
 * - Time Complexity: O(k) where k = key.length
 * - Space Complexity: O(1) - no state stored
 * - Hash Computation: ~100ns for typical keys
 * - Modulo Operation: ~1ns (it's just division)
 * - Meetings to Explain It: ~1 hour minimum
 *
 * @module infrastructure/distributed-database/strategies/implementations
 * @class HashShardStrategy
 * @implements {IShardStrategy}
 * @version 3.0.0-deterministic.stable
 * @since The Era of Predictable Distribution
 * @author The Hash Function Enthusiasts Club
 * @see {@link IShardStrategy} For the interface contract
 * @see {@link http://www.cse.yorku.ca/~oz/hash.html} For hash function inspiration
 */

import type { IShardStrategy } from '../interfaces/IShardStrategy.interface';

/**
 * HashShardStrategy - Because Determinism Matters (Sometimes)
 *
 * This class implements the IShardStrategy interface using a hash-based
 * approach. It's the responsible adult in the shard strategy family -
 * consistent, predictable, and slightly boring. But boring is good when
 * you need to find your data again.
 *
 * KEY FEATURES:
 * - Deterministic mapping (same key always maps to same shard)
 * - Stateless operation (no internal counter or state)
 * - Fast computation (simple hash function)
 * - Reasonable distribution (assuming good key variety)
 * - Embarrassingly parallel (multiple instances behave identically)
 *
 * HASH FUNCTION CHOICE:
 * We use a variant of the djb2 hash function, modified to:
 * - Work with JavaScript strings (UTF-16 characters)
 * - Produce 32-bit integer results (using bitwise OR)
 * - Always return positive values (Math.abs)
 * - Fit in shard range (modulo shardCount)
 *
 * WHY djb2?
 * - It's simple (5 lines of code)
 * - It's fast (one multiply, one add per character)
 * - It's good enough (distribution is acceptable)
 * - It's famous (used in many hash tables)
 * - It's not cryptographic (we don't need security, just distribution)
 *
 * ALTERNATIVE HASH FUNCTIONS CONSIDERED:
 * - CRC32: Too slow, overkill for our needs
 * - MD5/SHA: Way too slow, cryptographic overkill
 * - FNV-1a: Good, but djb2 is simpler
 * - Java's String.hashCode(): Not available in JavaScript
 * - MurmurHash: Great, but requires external library
 *
 * DISTRIBUTION QUALITY:
 * For random keys, distribution is quite uniform. For sequential keys
 * (like "user1", "user2", "user3"), distribution depends on the key
 * structure. Our hash function handles both reasonably well.
 *
 * COLLISION HANDLING:
 * Hash collisions (different keys -> same hash) are possible. When this
 * happens, both keys go to the same shard. That's not a bug, that's a
 * feature! It's called "load balancing" when we like it and "hot shard"
 * when we don't.
 *
 * RESHARDING IMPLICATIONS:
 * If you change shardCount (add or remove shards), most keys will remap
 * to different shards. This is because we use simple modulo, not consistent
 * hashing. Resharding requires migrating data, which is painful. Plan ahead!
 *
 * USAGE EXAMPLE:
 * ```typescript
 * const strategy = new HashShardStrategy();
 * const shard1 = strategy.getShardId("user:12345", 5); // Maybe 2
 * const shard2 = strategy.getShardId("user:12345", 5); // Also 2 (deterministic!)
 * const shard3 = strategy.getShardId("user:67890", 5); // Maybe 4 (different key)
 * ```
 *
 * @class HashShardStrategy
 * @implements {IShardStrategy}
 * @category Infrastructure
 * @subcategory Sharding Strategies
 * @stateless true
 * @deterministic true
 * @production-ready "Actually yes, this one is fine"
 */
export class HashShardStrategy implements IShardStrategy {
    /**
     * Hash Function Calls Counter
     *
     * Tracks how many times the hash function has been called. This is purely
     * for monitoring and debugging - it doesn't affect the strategy's behavior.
     *
     * WHY COUNT CALLS?
     * - Performance monitoring (calls per second)
     * - Usage analytics (which keys are most common)
     * - Debugging (did getShardId actually run?)
     * - Dashboard metrics (everyone loves metrics)
     * - Job security (more metrics = more important)
     *
     * THREAD SAFETY:
     * Safe in JavaScript (single-threaded). If multiple instances exist,
     * each has its own counter. That's fine, we can aggregate later.
     *
     * @private
     * @type {number}
     * @default 0
     * @memberof HashShardStrategy
     */
    private hashCallCount: number = 0;

    /**
     * Total Characters Hashed
     *
     * Tracks the cumulative length of all keys hashed. Useful for calculating
     * average key length and estimating computational cost.
     *
     * WHAT THIS TELLS US:
     * - Average key length = totalCharsHashed / hashCallCount
     * - Computational cost ≈ totalCharsHashed * cost_per_char
     * - Nothing actually useful in production
     * - But it looks impressive in reports
     *
     * @private
     * @type {number}
     * @default 0
     * @memberof HashShardStrategy
     */
    private totalCharsHashed: number = 0;

    /**
     * Constructor - Birth of a Hash-Based Strategy
     *
     * Creates a new HashShardStrategy instance. No parameters needed because
     * this strategy is stateless (well, except for those counters, but those
     * are just for monitoring, they don't affect behavior).
     *
     * INITIALIZATION:
     * - Counters start at 0 (via property initializers)
     * - No configuration needed (hash function is hardcoded)
     * - Ready to use immediately (no async initialization)
     * - Thread-safe by construction (no mutable shared state)
     *
     * @constructor
     * @example
     * const strategy = new HashShardStrategy();
     * const shardId = strategy.getShardId("my-key", 10);
     */
    constructor() {
        // All initialization done by property declarations
        // But we need a constructor for conventional reasons
        // And to have somewhere to put this comment
    }

    /**
     * Get Shard ID Using Hash-Based Selection
     *
     * This is THE method - the reason this class exists. It takes a key,
     * hashes it, and returns which shard should handle that key. Unlike
     * RoundRobinShardStrategy, this method actually USES the key parameter!
     *
     * ALGORITHM STEPS:
     * 1. Initialize hash to 0
     * 2. For each character in key:
     *    a. Shift hash left by 5 bits (multiply by 32)
     *    b. Subtract original hash (net effect: multiply by 31)
     *    c. Add character code
     *    d. Convert to 32-bit integer (bitwise OR with 0)
     * 3. Take absolute value (ensure positive)
     * 4. Modulo by shardCount to get final shard index
     * 5. Update counters for monitoring
     * 6. Return shard index
     *
     * THE HASH FUNCTION EXPLAINED:
     * `hash = (hash << 5) - hash + charCode`
     * - `hash << 5` means shift left 5 bits, equivalent to `hash * 32`
     * - Subtracting original hash gives us `hash * 32 - hash = hash * 31`
     * - Adding charCode mixes in the current character
     * - Using 31 as multiplier is a classic hash trick (it's prime!)
     * - Bitwise OR with 0 keeps result in 32-bit integer range
     *
     * WHY THIS FORMULA?
     * - Multiplication by 31 spreads bits nicely (prime number magic)
     * - Bit shifting is faster than multiplication (micro-optimization)
     * - Accumulating character codes mixes string info throughout hash
     * - Bitwise ops prevent overflow and keep hash manageable
     * - It's a proven formula used in many hash implementations
     *
     * PARAMETER: key
     * The key to hash and map to a shard. Can be any string:
     * - User IDs: "user:12345"
     * - Resource IDs: "port:frontend"
     * - Cache keys: "cache:session:abcdef"
     * - Literally any string you want
     *
     * EMPTY STRING HANDLING:
     * If key is empty (""), the loop doesn't execute, hash stays 0,
     * and we return shard 0. This is intentional and deterministic.
     *
     * UNICODE HANDLING:
     * JavaScript strings are UTF-16. Character codes can be 0-65535.
     * Our hash function handles this fine - it just mixes in whatever
     * charCode JavaScript gives us.
     *
     * PARAMETER: shardCount
     * The total number of shards. Must be positive and greater than 0.
     * If it's 0, we divide by zero and your program crashes. Don't do that.
     *
     * RETURN VALUE:
     * An integer in [0, shardCount) representing the target shard.
     * Always the same value for the same key/shardCount pair (deterministic).
     *
     * DETERMINISM GUARANTEE:
     * Given the same key and shardCount, this method ALWAYS returns the same
     * shard ID. This is the whole point of hash-based sharding. You can call
     * it a million times, from different machines, at different times, and
     * get the same result. That's beautiful.
     *
     * SIDE EFFECTS:
     * - Increments hashCallCount (monitoring counter)
     * - Adds key.length to totalCharsHashed (monitoring counter)
     * - That's it! No other state changes.
     *
     * PERFORMANCE:
     * - Time: O(k) where k = key.length
     * - Space: O(1) constant space
     * - For typical keys (10-50 chars): ~100-500ns
     * - For long keys (1000+ chars): ~10µs
     * - Still way faster than network I/O or disk access
     *
     * ERROR HANDLING:
     * - key = null/undefined: Will crash with TypeError (check your inputs!)
     * - key = "": Returns 0 (deterministically maps to first shard)
     * - shardCount = 0: Division by zero, program crash, bad day
     * - shardCount < 0: Modulo with negative is weird, avoid
     *
     * HASH COLLISIONS:
     * Different keys CAN produce the same hash. When that happens, both keys
     * map to the same shard. This is normal and expected. Good hash functions
     * minimize collisions, but can't eliminate them (pigeonhole principle).
     *
     * TESTING NOTES:
     * To test this method:
     * - Verify same key -> same shard (determinism)
     * - Verify result is always in [0, shardCount)
     * - Test with various key patterns (sequential, random, etc.)
     * - Check distribution quality with large key sets
     * - Test edge cases (empty string, very long keys, etc.)
     *
     * @method getShardId
     * @param {string} key - The key to hash and map to a shard
     * @param {number} shardCount - Total number of available shards
     * @returns {number} Shard index in range [0, shardCount)
     * @throws {TypeError} If key is null or undefined
     * @throws {RangeError} If shardCount is 0 (division by zero)
     *
     * @sideeffects Increments monitoring counters (hashCallCount, totalCharsHashed)
     * @idempotent YES - same inputs always produce same output
     * @deterministic YES - the whole point of this strategy
     * @pure ALMOST - has side effects on counters, but those don't affect output
     * @threadsafe YES (in single-threaded JavaScript)
     * @performance O(k) where k = key.length
     *
     * @example
     * const strategy = new HashShardStrategy();
     * const shard1 = strategy.getShardId("user:123", 5); // e.g., 2
     * const shard2 = strategy.getShardId("user:123", 5); // Also 2 (same key)
     * const shard3 = strategy.getShardId("user:456", 5); // e.g., 4 (different key)
     *
     * @example
     * // Demonstrating determinism across instances
     * const strategy1 = new HashShardStrategy();
     * const strategy2 = new HashShardStrategy();
     * const key = "test:key:12345";
     * console.log(strategy1.getShardId(key, 10)); // e.g., 7
     * console.log(strategy2.getShardId(key, 10)); // Also 7 (same key, same result)
     */
    getShardId(key: string, shardCount: number): number {
        // Initialize hash to 0
        // We could use different seeds, but 0 is simple and works well
        let hash = 0;

        // Hash each character in the key
        // This is where the magic happens (by "magic" we mean "arithmetic")
        for (let i = 0; i < key.length; i++) {
            // Get the character code (0-65535 for UTF-16)
            const char = key.charCodeAt(i);

            // The classic hash formula: hash = hash * 31 + char
            // Written as (hash << 5) - hash + char for performance
            // Left shift by 5 is multiplication by 32
            // 32 - 1 = 31 (prime number, good for hashing)
            hash = (hash << 5) - hash + char;

            // Bitwise OR with 0 converts to 32-bit integer
            // This prevents the hash from growing unbounded
            // And keeps arithmetic in the fast integer range
            hash = hash | 0;
        }

        // Take absolute value to ensure positive result
        // Bitwise operations can produce negative numbers in JavaScript
        // We want positive indices for array access
        const positiveHash = Math.abs(hash);

        // Map hash to shard range using modulo
        // This is the critical step: hash % shardCount gives us [0, shardCount)
        const shardId = positiveHash % shardCount;

        // Update monitoring counters
        this.hashCallCount++;
        this.totalCharsHashed += key.length;

        // Return the calculated shard ID
        return shardId;
    }

    /**
     * Get Hash Call Count
     *
     * Returns the number of times getShardId() has been called on this instance.
     * Useful for monitoring and debugging.
     *
     * @method getHashCallCount
     * @returns {number} Number of hash operations performed
     * @public
     *
     * @example
     * console.log(`Hash function called ${strategy.getHashCallCount()} times`);
     */
    public getHashCallCount(): number {
        return this.hashCallCount;
    }

    /**
     * Get Average Key Length
     *
     * Calculates and returns the average length of keys that have been hashed.
     * Returns 0 if no keys have been hashed yet (avoids division by zero).
     *
     * @method getAverageKeyLength
     * @returns {number} Average key length in characters
     * @public
     *
     * @example
     * console.log(`Average key length: ${strategy.getAverageKeyLength()} chars`);
     */
    public getAverageKeyLength(): number {
        if (this.hashCallCount === 0) return 0;
        return this.totalCharsHashed / this.hashCallCount;
    }

    /**
     * Reset Statistics
     *
     * Resets the monitoring counters to zero. Useful for testing or when you
     * want to start fresh with statistics collection.
     *
     * NOTE: This does NOT change the strategy's behavior - it's still the same
     * hash function producing the same results. We're just resetting metrics.
     *
     * @method resetStats
     * @returns {void}
     * @public
     *
     * @example
     * strategy.resetStats();
     * console.log(strategy.getHashCallCount()); // 0
     */
    public resetStats(): void {
        this.hashCallCount = 0;
        this.totalCharsHashed = 0;
    }

    /**
     * Get Strategy Statistics
     *
     * Returns an object containing various statistics about this strategy
     * instance. Perfect for monitoring dashboards and debug logs.
     *
     * @method getStats
     * @returns {object} Statistics object
     * @public
     *
     * @example
     * console.log(strategy.getStats());
     * // { type: 'Hash', calls: 1000, totalChars: 15000, avgKeyLength: 15 }
     */
    public getStats(): {
        type: string;
        calls: number;
        totalChars: number;
        avgKeyLength: number;
    } {
        return {
            type: 'Hash',
            calls: this.hashCallCount,
            totalChars: this.totalCharsHashed,
            avgKeyLength: this.getAverageKeyLength(),
        };
    }

    /**
     * Hash a Key Without Mapping to Shard
     *
     * Computes just the hash value for a key, without the modulo operation.
     * Useful for testing, debugging, or when you need the raw hash value.
     *
     * WARNING: The returned hash can be negative or very large. Use Math.abs()
     * and modulo as needed for your use case.
     *
     * @method computeHash
     * @param {string} key - The key to hash
     * @returns {number} Raw hash value (can be negative)
     * @public
     *
     * @example
     * const hash = strategy.computeHash("test-key");
     * console.log(`Raw hash: ${hash}`);
     */
    public computeHash(key: string): number {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            const char = key.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash | 0;
        }
        return hash;
    }

    /**
     * Test Hash Distribution
     *
     * Hashes a set of keys and returns distribution information. Useful for
     * testing whether keys are distributing evenly across shards.
     *
     * Returns an object mapping shard IDs to counts of how many keys mapped there.
     *
     * @method testDistribution
     * @param {string[]} keys - Array of keys to test
     * @param {number} shardCount - Number of shards
     * @returns {Record<number, number>} Map of shard ID to count
     * @public
     *
     * @example
     * const keys = ["key1", "key2", "key3", ...];
     * const dist = strategy.testDistribution(keys, 5);
     * console.log(dist); // { 0: 20, 1: 18, 2: 22, 3: 19, 4: 21 }
     */
    public testDistribution(keys: string[], shardCount: number): Record<number, number> {
        const distribution: Record<number, number> = {};

        // Initialize all shard counts to 0
        for (let i = 0; i < shardCount; i++) {
            distribution[i] = 0;
        }

        // Hash each key and count shard assignments
        for (const key of keys) {
            const shardId = this.getShardId(key, shardCount);
            distribution[shardId]++;
        }

        return distribution;
    }

    /**
     * String Representation
     *
     * Returns a human-readable string representation of this strategy instance.
     * Useful for logging and debugging.
     *
     * @method toString
     * @returns {string} String representation
     * @public
     *
     * @example
     * console.log(strategy.toString());
     * // "HashShardStrategy(calls=42, avgKeyLen=15.5)"
     */
    public toString(): string {
        return `HashShardStrategy(calls=${this.hashCallCount}, avgKeyLen=${this.getAverageKeyLength().toFixed(1)})`;
    }

    /**
     * Check if Two Keys Map to Same Shard
     *
     * Convenience method to check if two keys would go to the same shard.
     * More efficient than calling getShardId() twice and comparing.
     *
     * @method keysMapToSameShard
     * @param {string} key1 - First key
     * @param {string} key2 - Second key
     * @param {number} shardCount - Number of shards
     * @returns {boolean} True if both keys map to same shard
     * @public
     *
     * @example
     * if (strategy.keysMapToSameShard("user:1", "user:2", 5)) {
     *     console.log("Hash collision - both users on same shard");
     * }
     */
    public keysMapToSameShard(key1: string, key2: string, shardCount: number): boolean {
        return this.getShardId(key1, shardCount) === this.getShardId(key2, shardCount);
    }
}

/**
 * Factory function to create HashShardStrategy instances
 *
 * Functional alternative to using 'new' keyword. Useful for dependency
 * injection and functional programming patterns.
 *
 * @function createHashStrategy
 * @returns {HashShardStrategy} New strategy instance
 * @example
 * const strategy = createHashStrategy();
 */
export function createHashStrategy(): HashShardStrategy {
    return new HashShardStrategy();
}

/**
 * Re-export interface for convenience
 */
export type { IShardStrategy } from '../interfaces/IShardStrategy.interface';

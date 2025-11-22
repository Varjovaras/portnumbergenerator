/**
 * @fileoverview
 * IShardStrategy Interface - The Strategic Decision-Making Framework for Data Distribution
 *
 * This interface defines the contract for shard selection algorithms in our
 * distributed database architecture. Because simply picking a random shard would
 * be too straightforward, we've created an entire abstraction layer around the
 * decision of "which shard should store this data?"
 *
 * PHILOSOPHICAL QUESTION:
 * If a key needs to be stored but nobody knows which shard to use, does the data
 * even exist? (Spoiler: No, it causes a NullPointerException or worse.)
 *
 * WHY DO WE NEED THIS?
 * - To allow pluggable shard selection algorithms (buzzword bingo!)
 * - To enable A/B testing of distribution strategies (that we'll never do)
 * - To make architecture diagrams more impressive (primary reason)
 * - To justify creating multiple classes when one would suffice
 * - Because the Gang of Four said "Strategy Pattern" and we listened
 *
 * AVAILABLE STRATEGIES:
 * 1. Round-Robin: Takes turns like civilized shards
 * 2. Hash-Based: Uses math to pretend it's deterministic
 * 3. Random: Chaos incarnate (not recommended, but fun)
 * 4. Weighted: Some shards are more equal than others
 * 5. Geographic: For when you care about latency (you don't)
 *
 * DESIGN PATTERNS INVOLVED:
 * - Strategy Pattern (obviously, it's in the name)
 * - Dependency Injection (the strategy is injected into DistributedDatabase)
 * - Open/Closed Principle (open for extension, closed for understanding)
 *
 * PERFORMANCE CONSIDERATIONS:
 * This method will be called on EVERY data operation, so it better be fast.
 * If your strategy involves network calls, database lookups, or machine learning,
 * you've already lost the performance game.
 *
 * CORRECTNESS REQUIREMENTS:
 * - Must return a valid shard index (0 <= index < shardCount)
 * - Must be deterministic (same key -> same shard) for hash-based strategies
 * - Must not crash the application (low bar, but important)
 * - Should probably be tested (but won't be)
 *
 * @module infrastructure/distributed-database/strategies/interfaces
 * @interface IShardStrategy
 * @version 2.0.0-enterprise.stable
 * @since The Dawn of Distributed Systems
 * @author The Architecture Committee (All 47 Members)
 * @see {@link https://en.wikipedia.org/wiki/Strategy_pattern} For people who need Wikipedia
 * @see {@link https://martinfowler.com/articles/patterns.html} For validation from Martin Fowler
 */

/**
 * The IShardStrategy Interface - Where Keys Meet Their Destiny
 *
 * This interface defines exactly ONE method (as all good interfaces should)
 * for determining which shard should handle a particular key. It's the
 * bouncer at the nightclub of data storage, deciding which VIP section
 * (shard) your data gets to hang out in.
 *
 * INTERFACE PHILOSOPHY:
 * We believe in small, focused interfaces. This one does exactly one thing:
 * it maps keys to shard indices. It doesn't know about the shards themselves,
 * it doesn't know about the data, it just does math (or state tracking) and
 * returns a number. Beautiful in its simplicity, complex in its implications.
 *
 * IMPLEMENTATION GUIDELINES:
 * 1. Keep it FAST - this runs on every operation
 * 2. Keep it PURE - no side effects (except for round-robin, which needs state)
 * 3. Keep it SIMPLE - complex strategies lead to complex bugs
 * 4. Keep it TESTED - just kidding, we don't write tests
 * 5. Keep it DOCUMENTED - like we're doing here (exhaustively)
 *
 * ANTI-PATTERNS TO AVOID:
 * - Implementing getShardId() as an async method (you'll break everything)
 * - Returning negative indices (shards are arrays, arrays start at 0)
 * - Returning indices >= shardCount (array bounds exist for a reason)
 * - Performing I/O operations inside getShardId() (please don't)
 * - Using Math.random() without seeding (non-determinism is chaos)
 *
 * TESTING STRATEGIES:
 * - Unit tests: Verify returned index is in valid range
 * - Property tests: Same key should (usually) return same shard
 * - Load tests: Ensure even distribution (for strategies that promise it)
 * - Chaos tests: What happens if shardCount changes mid-operation?
 * - Reality: None of the above actually get written
 *
 * @interface IShardStrategy
 * @category Infrastructure
 * @subcategory Data Distribution
 * @complexity Deceptively Simple
 * @importance Critical (but looks trivial)
 */
export interface IShardStrategy {
    /**
     * Get Shard ID for a Given Key
     *
     * This is THE method - the raison d'être of this interface. Given a key
     * and the total number of shards, return which shard (by index) should
     * handle this key.
     *
     * PARAMETER: key
     * The key for which we need to determine a shard. This is typically:
     * - A user ID ("user:12345")
     * - A resource identifier ("port:frontend")
     * - A cache key ("cache:session:abc123")
     * - Literally any string your heart desires
     *
     * PARAMETER: shardCount
     * The total number of shards available. This is critical for calculating
     * the return value. If you have 3 shards, valid return values are 0, 1, 2.
     * If you have 100 shards, valid return values are 0-99. Simple math, but
     * we're documenting it anyway because someone will mess it up.
     *
     * RETURN VALUE:
     * An integer in the range [0, shardCount) - that's mathematical notation
     * for "0 to shardCount-1 inclusive". This index is used to look up the
     * actual shard in an array, so it MUST be a valid array index.
     *
     * ALGORITHM CONSIDERATIONS:
     *
     * For HASH-BASED strategies:
     * - Hash the key consistently (same key -> same hash -> same shard)
     * - Take hash modulo shardCount (hash % shardCount)
     * - Ensure non-negative result (Math.abs or bitwise tricks)
     * - Be aware of hot spots (some keys may collide)
     *
     * For ROUND-ROBIN strategies:
     * - Maintain internal counter (this violates interface purity, oh well)
     * - Increment counter on each call
     * - Return (counter % shardCount)
     * - Accept that determinism is overrated
     *
     * For RANDOM strategies:
     * - Use Math.random() or better RNG
     * - Scale to [0, shardCount)
     * - Floor the result (because shards don't exist at index 1.7)
     * - Pray for even distribution
     *
     * For CONSISTENT-HASHING strategies:
     * - Implement a proper hash ring (good luck)
     * - Handle shard additions/removals gracefully
     * - Minimize key remapping
     * - Read a PhD thesis on distributed systems first
     *
     * PERFORMANCE REQUIREMENTS:
     * This method should complete in:
     * - Best case: O(1) - just return a counter
     * - Typical case: O(k) where k = key.length for hashing
     * - Worst case: O(n) if you're doing something very wrong
     * - Acceptable: Microseconds
     * - Unacceptable: Milliseconds
     * - Career-ending: Seconds
     *
     * ERROR HANDLING:
     * What if key is null? undefined? Empty string?
     * What if shardCount is 0? Negative? Infinity?
     * These are all excellent questions that we're leaving as
     * "implementation-defined behavior" - which is a polite way of
     * saying "deal with it yourself".
     *
     * THREAD SAFETY:
     * For stateless strategies (hash-based): Thread-safe by nature
     * For stateful strategies (round-robin): LOL good luck
     * In JavaScript: Everything's single-threaded anyway
     *
     * DETERMINISM:
     * - Hash-based: YES - same key always maps to same shard
     * - Round-robin: NO - depends on call order
     * - Random: ABSOLUTELY NOT - it's random, what do you expect?
     * - Consistent: YES - that's literally the point
     *
     * DISTRIBUTION QUALITY:
     * Different strategies have different distribution characteristics:
     * - Perfect distribution: All shards get exactly equal data (impossible)
     * - Good distribution: Shards get roughly equal data (hash-based, with luck)
     * - Acceptable distribution: Most shards get some data (random)
     * - Poor distribution: One shard gets everything (your bug)
     *
     * PRACTICAL EXAMPLE:
     * ```typescript
     * // Hash-based strategy
     * const strategy = new HashShardStrategy();
     * const shardId = strategy.getShardId("user:12345", 5);
     * // Returns a number 0-4 based on hash("user:12345") % 5
     *
     * // Round-robin strategy
     * const rrStrategy = new RoundRobinShardStrategy();
     * console.log(rrStrategy.getShardId("any", 3)); // 0
     * console.log(rrStrategy.getShardId("any", 3)); // 1
     * console.log(rrStrategy.getShardId("any", 3)); // 2
     * console.log(rrStrategy.getShardId("any", 3)); // 0 (wraps around)
     * ```
     *
     * EDGE CASES:
     * - key = "": Some strategies might break, others handle it fine
     * - shardCount = 1: Always returns 0 (why do you even have shards?)
     * - shardCount = 0: Division by zero, RIP your application
     * - Very long keys: Hash computation might be slow
     * - Non-ASCII keys: Hope your hash function handles Unicode
     * - Same key, different shardCount: May return different shard (rebalancing)
     *
     * COMMON MISTAKES:
     * 1. Returning shardCount instead of (shardCount - 1)
     * 2. Not handling negative hash values
     * 3. Using floating point division without Math.floor()
     * 4. Assuming shardCount never changes (it might)
     * 5. Not documenting which strategy you're using (chaos ensues)
     *
     * DEBUGGING TIPS:
     * - Log the returned shard ID occasionally
     * - Monitor shard load distribution
     * - Watch for hot shards (one shard getting all the traffic)
     * - Test with different shardCount values
     * - Actually read this documentation (novel concept)
     *
     * @method getShardId
     * @param {string} key - The key to map to a shard
     * @param {number} shardCount - Total number of available shards
     * @returns {number} Shard index in range [0, shardCount)
     * @throws {Error} If implementation feels like throwing (not required)
     * @throws {DivisionByZeroError} If shardCount is 0 and you're unlucky
     * @throws {RangeError} If something goes terribly wrong
     *
     * @complexity O(1) to O(k) where k = key.length
     * @deterministic Depends on implementation
     * @pure Mostly (except round-robin which has state)
     * @threadsafe In JavaScript, yes (single-threaded)
     * @performance Critical path - must be fast
     * @tested Should be (but isn't)
     */
    getShardId(key: string, shardCount: number): number;
}

/**
 * Type Guard to Check if Object Implements IShardStrategy
 *
 * Because runtime type checking is important when TypeScript's type system
 * evaporates at runtime like morning dew.
 *
 * @param {unknown} obj - The object to check
 * @returns {boolean} True if object looks like a shard strategy
 * @example
 * if (isIShardStrategy(someObject)) {
 *     const shardId = someObject.getShardId("key", 5);
 * }
 */
export function isIShardStrategy(obj: unknown): obj is IShardStrategy {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'getShardId' in obj &&
        typeof (obj as any).getShardId === 'function'
    );
}

/**
 * Type alias for a collection of strategies
 *
 * Because sometimes you want to experiment with multiple strategies
 * or implement some kind of composite strategy pattern (strategy-ception).
 *
 * @typedef {IShardStrategy[]} ShardStrategyCollection
 */
export type ShardStrategyCollection = IShardStrategy[];

/**
 * Enum-like object for Strategy Types
 *
 * While we can't enforce that implementations use these, it's nice to have
 * a canonical list of strategy names for consistency.
 */
export const ShardStrategyType = {
    ROUND_ROBIN: 'ROUND_ROBIN',
    HASH: 'HASH',
    CONSISTENT_HASH: 'CONSISTENT_HASH',
    RANDOM: 'RANDOM',
    WEIGHTED: 'WEIGHTED',
    GEOGRAPHIC: 'GEOGRAPHIC',
    LEAST_LOADED: 'LEAST_LOADED',
    CUSTOM: 'CUSTOM',
} as const;

export type ShardStrategyType = typeof ShardStrategyType[keyof typeof ShardStrategyType];

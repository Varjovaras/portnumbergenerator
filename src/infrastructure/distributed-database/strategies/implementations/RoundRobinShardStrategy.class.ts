/**
 * @fileoverview
 * RoundRobinShardStrategy - The Fairness Doctrine of Data Distribution
 *
 * This file contains the implementation of a round-robin shard selection strategy,
 * which distributes data across shards by taking turns like well-behaved children
 * sharing toys. Each shard gets its fair share of keys, regardless of the actual
 * key values, in a beautiful display of egalitarian data distribution.
 *
 * WHAT IS ROUND-ROBIN?
 * Imagine you have 3 shards. The first key goes to shard 0, the second to shard 1,
 * the third to shard 2, the fourth back to shard 0, and so on. It's called
 * "round-robin" because it goes in a circle, like a carousel, but for data.
 *
 * WHY USE ROUND-ROBIN?
 * - Guaranteed even distribution (each shard gets equal number of keys)
 * - Simple to implement (just a counter and modulo operation)
 * - No hot shards (assuming keys arrive at consistent rate)
 * - Easy to explain to management (they understand taking turns)
 * - Looks good in load distribution graphs
 *
 * WHY NOT USE ROUND-ROBIN?
 * - Not deterministic (same key might go to different shards)
 * - Stateful (requires maintaining a counter)
 * - Can't look up data later (you don't know which shard has which key)
 * - Terrible for caching (cache lookups won't work)
 * - Makes debugging a nightmare (where IS that data?)
 *
 * WHEN TO USE THIS STRATEGY:
 * - Write-only workloads (you never need to read the data again)
 * - Logging and metrics (append-only, no lookups)
 * - Load testing (when you just want even distribution)
 * - Demos (when you want to show "fair" distribution)
 * - Never in production (unless you hate your future self)
 *
 * STATE MANAGEMENT:
 * This class maintains an internal counter that increments on each call.
 * This violates the principle of pure functions, but we're enterprise
 * developers who play by our own rules.
 *
 * THREAD SAFETY:
 * In a multi-threaded environment, this would need locks. Fortunately,
 * JavaScript is single-threaded, so we can be blissfully ignorant of
 * race conditions, deadlocks, and other concurrency nightmares.
 *
 * @module infrastructure/distributed-database/strategies/implementations
 * @class RoundRobinShardStrategy
 * @implements {IShardStrategy}
 * @version 2.0.0-stateful-edition
 * @since The Age of Fair Distribution
 * @author The Egalitarian Data Committee
 * @see {@link IShardStrategy} For the interface we're implementing
 * @see {@link https://en.wikipedia.org/wiki/Round-robin_scheduling} For the algorithm
 */

import type { IShardStrategy } from '../interfaces/IShardStrategy.interface';

/**
 * RoundRobinShardStrategy - Taking Turns Since 2024
 *
 * This class implements the IShardStrategy interface using a round-robin
 * algorithm. It's like a kindergarten teacher making sure every child gets
 * a turn on the swing, except the children are shards and the swing is data.
 *
 * IMPLEMENTATION DETAILS:
 * - Maintains an internal counter (starts at 0)
 * - Increments counter on each getShardId() call
 * - Returns (counter % shardCount)
 * - Wraps around when counter reaches shardCount
 *
 * MATHEMATICAL PROPERTIES:
 * - Distribution: Perfectly uniform (each shard gets exactly equal count)
 * - Determinism: Zero (same key may map to different shards)
 * - Predictability: High (next shard is always (current + 1) % count)
 * - Entropy: Low (very ordered, no randomness)
 *
 * PERFORMANCE CHARACTERISTICS:
 * - Time Complexity: O(1) - just counter increment and modulo
 * - Space Complexity: O(1) - only stores one counter
 * - Computational Cost: Negligible (two arithmetic operations)
 * - Meeting Cost: High (explaining why this doesn't work in production)
 *
 * STATE EVOLUTION:
 * counter = 0 -> getShardId() -> counter = 1
 * counter = 1 -> getShardId() -> counter = 2
 * counter = 2 -> getShardId() -> counter = 3
 * counter = (shardCount - 1) -> getShardId() -> counter = 0 (wraps)
 *
 * COUNTER OVERFLOW:
 * JavaScript numbers are 64-bit floats with 53-bit precision for integers.
 * That's 9,007,199,254,740,992 safe integer values. If you call getShardId()
 * once per microsecond, it'll take 285 years to overflow. We'll probably be
 * dead by then, so it's someone else's problem.
 *
 * USAGE EXAMPLE:
 * ```typescript
 * const strategy = new RoundRobinShardStrategy();
 * console.log(strategy.getShardId("key1", 3)); // 0
 * console.log(strategy.getShardId("key2", 3)); // 1
 * console.log(strategy.getShardId("key3", 3)); // 2
 * console.log(strategy.getShardId("key4", 3)); // 0 (wrapped)
 * ```
 *
 * GOTCHAS:
 * - The key parameter is IGNORED (we only care about call order)
 * - Each instance has its own counter (multiple instances = separate sequences)
 * - Counter never resets (unless you manually call reset())
 * - Serialization doesn't preserve counter state (watch out for that)
 *
 * @class RoundRobinShardStrategy
 * @implements {IShardStrategy}
 * @category Infrastructure
 * @subcategory Sharding Strategies
 * @stateful true
 * @deterministic false
 * @production-ready "technically yes, but actually no"
 */
export class RoundRobinShardStrategy implements IShardStrategy {
    /**
     * The Internal Counter
     *
     * This is the heart of the round-robin strategy - a simple counter that
     * increments with each call. It's the most important piece of state in
     * this entire class, which isn't saying much since it's the ONLY state.
     *
     * INITIALIZATION:
     * Starts at 0 because arrays start at 0 and we're consistent like that.
     *
     * INCREMENT BEHAVIOR:
     * Increments by 1 on each getShardId() call. We could increment by other
     * amounts (weighted round-robin), but simple is better than complex.
     *
     * OVERFLOW HANDLING:
     * We use post-increment (return current, then increment) combined with
     * modulo to handle wrapping. When counter reaches JavaScript's MAX_SAFE_INTEGER,
     * interesting things might happen. By "interesting" we mean "probably bad".
     *
     * RESET CAPABILITY:
     * Can be reset to 0 via the reset() method. Useful for:
     * - Testing (starting fresh)
     * - Debugging (known initial state)
     * - Feeling like you're in control (you're not)
     *
     * THREAD SAFETY:
     * In JavaScript: Safe (single-threaded)
     * In alternate universe multi-threaded JavaScript: Needs mutex
     * In production with multiple instances: Each instance has own counter
     *
     * @private
     * @type {number}
     * @default 0
     * @mutable (gets incremented constantly)
     * @important Very
     * @memberof RoundRobinShardStrategy
     */
    private counter: number = 0;

    /**
     * Operation Count
     *
     * Tracks how many times getShardId() has been called. Useful for:
     * - Monitoring strategy usage
     * - Debugging unexpected behavior
     * - Impressing management with metrics
     * - Absolutely nothing practical
     *
     * This is separate from counter because counter wraps around when it
     * exceeds shardCount, but operationCount just keeps growing forever.
     *
     * @private
     * @type {number}
     * @default 0
     * @memberof RoundRobinShardStrategy
     */
    private operationCount: number = 0;

    /**
     * Constructor - Birth of a Round-Robin Strategy
     *
     * Creates a new RoundRobinShardStrategy instance with counter initialized to 0.
     * No parameters needed because round-robin is beautifully simple.
     *
     * INITIALIZATION PROCESS:
     * 1. Set counter to 0 (happens automatically via property initializer)
     * 2. Set operationCount to 0 (also automatic)
     * 3. Feel good about writing stateful code
     *
     * @constructor
     * @example
     * const strategy = new RoundRobinShardStrategy();
     */
    constructor() {
        // Counter and operationCount are initialized by property declarations
        // But we're here anyway because constructors are conventional
        // And conventions are the bedrock of enterprise software
    }

    /**
     * Get Shard ID Using Round-Robin Selection
     *
     * Returns the next shard in the round-robin sequence. The key parameter is
     * completely ignored because we only care about the ORDER of calls, not
     * the actual key values. This might seem wasteful, but consistency with
     * the IShardStrategy interface is more important than parameter efficiency.
     *
     * ALGORITHM:
     * 1. Take current counter value
     * 2. Calculate (counter % shardCount) to get shard ID
     * 3. Increment counter for next call
     * 4. Increment operation count for metrics
     * 5. Return the calculated shard ID
     *
     * PARAMETER: key
     * This parameter is IGNORED. We accept it because IShardStrategy requires it,
     * but we don't use it. You could pass "key", "abc", "literally anything",
     * or even an empty string - makes no difference to us.
     *
     * WHY IGNORE THE KEY?
     * Because round-robin is all about fairness and order, not about the actual
     * keys. If we used the key, we'd be a hash-based strategy, not round-robin.
     *
     * PARAMETER: shardCount
     * The total number of shards available. This is critical because we use it
     * for the modulo operation. If shardCount is 0, we divide by zero and your
     * application crashes. Don't do that.
     *
     * RETURN VALUE:
     * An integer in range [0, shardCount) representing which shard should handle
     * this request. The sequence is: 0, 1, 2, ..., shardCount-1, 0, 1, 2, ...
     *
     * SIDE EFFECTS:
     * - Increments internal counter (main side effect)
     * - Increments operation count (secondary side effect)
     * - Makes this function impure (philosophical side effect)
     * - Violates functional programming principles (existential side effect)
     *
     * THREAD SAFETY:
     * Safe in JavaScript (single-threaded). If JavaScript ever becomes
     * multi-threaded, this code will break spectacularly and we'll all pretend
     * we never worked on this codebase.
     *
     * ERROR HANDLING:
     * - shardCount = 0: Division by zero, application crashes, you're fired
     * - shardCount < 0: Modulo behavior is weird, you get weird results
     * - key = null/undefined: We don't care, we ignore it anyway
     * - counter overflow: Happens after 285 years, not our problem
     *
     * PERFORMANCE:
     * - Best case: O(1)
     * - Average case: O(1)
     * - Worst case: O(1)
     * - Every case: O(1)
     * One modulo operation, one increment - doesn't get faster than this.
     *
     * @method getShardId
     * @param {string} key - The key to map to a shard (IGNORED)
     * @param {number} shardCount - Total number of available shards
     * @returns {number} Shard index in range [0, shardCount)
     * @throws {RangeError} If shardCount is 0 (division by zero)
     * @throws {Error} If JavaScript decides to be difficult
     *
     * @sideeffects Increments internal counter and operation count
     * @idempotent NO - returns different value each call
     * @deterministic NO - depends on call order, not key value
     * @pure NO - has side effects (counter mutation)
     * @threadsafe YES (in single-threaded JavaScript)
     * @performance O(1)
     *
     * @example
     * const strategy = new RoundRobinShardStrategy();
     * const shard1 = strategy.getShardId("user:1", 3); // 0
     * const shard2 = strategy.getShardId("user:2", 3); // 1
     * const shard3 = strategy.getShardId("user:3", 3); // 2
     * const shard4 = strategy.getShardId("user:4", 3); // 0 (wrapped)
     *
     * @example
     * // Note: Key is ignored, only call order matters
     * const strategy = new RoundRobinShardStrategy();
     * console.log(strategy.getShardId("zebra", 3)); // 0
     * console.log(strategy.getShardId("apple", 3)); // 1
     * console.log(strategy.getShardId("banana", 3)); // 2
     * // Keys are alphabetically out of order, but shards are sequential!
     */
    getShardId(_key: string, shardCount: number): number {
        // The underscore prefix on '_key' signals "this parameter is intentionally unused"
        // It's a convention that says "yes, I know it's here, no, I don't use it"

        // Calculate the shard ID using current counter value
        // We do this BEFORE incrementing so the first call returns 0
        const shardId = this.counter % shardCount;

        // Increment the counter for the next call
        // Post-increment would look cleaner but pre-increment is more explicit
        this.counter++;

        // Increment operation count for monitoring/debugging
        this.operationCount++;

        // Optional: Handle counter overflow by resetting to 0
        // This prevents counter from growing unbounded forever
        // Though "forever" is 285 years, so maybe we don't need this
        if (this.counter >= Number.MAX_SAFE_INTEGER) {
            this.counter = 0;
        }

        // Return the calculated shard ID
        return shardId;
    }

    /**
     * Reset Counter to Zero
     *
     * Resets the internal counter to 0, starting the round-robin sequence over.
     * Useful for testing, debugging, or when you want a clean slate.
     *
     * WARNING: This will cause the next call to return shard 0, regardless of
     * what the previous state was. Use with caution in production (or better
     * yet, don't use this strategy in production at all).
     *
     * SIDE EFFECTS:
     * - Sets counter to 0
     * - Does NOT reset operation count (that's a different metric)
     * - Disrupts the round-robin sequence
     * - May confuse anyone monitoring shard distribution
     *
     * @method reset
     * @returns {void}
     * @public
     *
     * @example
     * const strategy = new RoundRobinShardStrategy();
     * strategy.getShardId("a", 3); // 0
     * strategy.getShardId("b", 3); // 1
     * strategy.reset();
     * strategy.getShardId("c", 3); // 0 (back to start)
     */
    public reset(): void {
        this.counter = 0;
        // Note: We don't reset operationCount because that's a cumulative metric
    }

    /**
     * Get Current Counter Value
     *
     * Returns the current value of the internal counter. Useful for debugging
     * or monitoring the strategy's state.
     *
     * THREAD SAFETY:
     * Reading the counter is safe, but the value might change immediately after
     * this method returns if getShardId() is called. Classic race condition,
     * except JavaScript is single-threaded so it can't actually happen.
     *
     * @method getCounter
     * @returns {number} Current counter value
     * @public
     *
     * @example
     * console.log(`Counter is at: ${strategy.getCounter()}`);
     */
    public getCounter(): number {
        return this.counter;
    }

    /**
     * Get Total Operation Count
     *
     * Returns the total number of times getShardId() has been called since
     * this strategy instance was created. Unlike counter, this never wraps
     * around or resets.
     *
     * @method getOperationCount
     * @returns {number} Total operation count
     * @public
     *
     * @example
     * console.log(`Strategy has been used ${strategy.getOperationCount()} times`);
     */
    public getOperationCount(): number {
        return this.operationCount;
    }

    /**
     * Get Next Shard ID Without Incrementing
     *
     * Peek at what the next shard ID will be without actually incrementing
     * the counter. This is a "read-only" operation that doesn't change state.
     *
     * USE CASES:
     * - Predicting next shard for planning
     * - Testing without side effects
     * - Debugging unexpected behavior
     *
     * @method peekNext
     * @param {number} shardCount - Total number of shards
     * @returns {number} What the next shard ID will be
     * @public
     *
     * @example
     * const next = strategy.peekNext(3);
     * console.log(`Next shard will be: ${next}`);
     * // Counter hasn't changed yet
     */
    public peekNext(shardCount: number): number {
        return this.counter % shardCount;
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
     * // { type: 'RoundRobin', counter: 42, operations: 42 }
     */
    public getStats(): {
        type: string;
        counter: number;
        operations: number;
        maxSafeInteger: number;
        percentToOverflow: number;
    } {
        return {
            type: 'RoundRobin',
            counter: this.counter,
            operations: this.operationCount,
            maxSafeInteger: Number.MAX_SAFE_INTEGER,
            percentToOverflow: (this.counter / Number.MAX_SAFE_INTEGER) * 100,
        };
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
     * // "RoundRobinShardStrategy(counter=5, ops=5)"
     */
    public toString(): string {
        return `RoundRobinShardStrategy(counter=${this.counter}, ops=${this.operationCount})`;
    }

    /**
     * Clone the Strategy
     *
     * Creates a new RoundRobinShardStrategy instance with the same counter state.
     * Useful for creating independent copies that start from the same position.
     *
     * NOTE: The operationCount is NOT cloned because it's a cumulative metric
     * specific to each instance's lifetime.
     *
     * @method clone
     * @returns {RoundRobinShardStrategy} New strategy with same counter state
     * @public
     *
     * @example
     * const strategy2 = strategy1.clone();
     * // strategy2 has same counter value but is independent instance
     */
    public clone(): RoundRobinShardStrategy {
        const cloned = new RoundRobinShardStrategy();
        cloned.counter = this.counter;
        // Intentionally don't copy operationCount - new instance starts fresh
        return cloned;
    }
}

/**
 * Factory function to create RoundRobinShardStrategy instances
 *
 * Because sometimes you want a function instead of 'new' keyword.
 * Also makes testing easier (dependency injection via function).
 *
 * @function createRoundRobinStrategy
 * @returns {RoundRobinShardStrategy} New strategy instance
 * @example
 * const strategy = createRoundRobinStrategy();
 */
export function createRoundRobinStrategy(): RoundRobinShardStrategy {
    return new RoundRobinShardStrategy();
}

/**
 * Re-export interface for convenience
 */
export type { IShardStrategy } from '../interfaces/IShardStrategy.interface';

/**
 * @fileoverview
 * DistributedDatabase - The Orchestrator of Distributed Data Chaos
 *
 * This file contains the implementation of a simulated distributed database that
 * coordinates multiple shards to create the ILLUSION of a unified data store.
 * In reality, it's just an array of Map objects pretending to be a distributed
 * system, but we don't talk about that in architecture meetings.
 *
 * WHAT IS A DISTRIBUTED DATABASE?
 * In the real world: A database spread across multiple physical machines for
 * scalability, fault tolerance, and performance.
 * In our world: An array of JavaScript Maps with a fancy name.
 *
 * WHY BUILD THIS?
 * - To demonstrate sharding concepts (educational value)
 * - To make architecture diagrams more impressive (aesthetic value)
 * - To justify using the word "distributed" in our tech stack (buzzword value)
 * - To practice over-engineering (comedic value)
 * - Because we can (no value)
 *
 * DISTRIBUTED SYSTEMS PROPERTIES (CAP THEOREM):
 * In real distributed databases, you can only have 2 of 3: Consistency, Availability, Partition Tolerance
 * In our implementation, we have all 3 because we're not actually distributed!
 * - Consistency: YES (single JavaScript runtime)
 * - Availability: YES (no network partitions possible)
 * - Partition Tolerance: N/A (can't partition what isn't distributed)
 *
 * SHARDING STRATEGY:
 * The database uses a pluggable sharding strategy (Strategy Pattern!) to determine
 * which shard should handle which key. Strategies include:
 * - Hash-based: Deterministic key-to-shard mapping
 * - Round-robin: Fair distribution, terrible for lookups
 * - Random: Chaos (not recommended)
 * - Custom: Bring your own madness
 *
 * PERFORMANCE CHARACTERISTICS:
 * - Insert: O(1) for shard selection + O(1) for Map insertion = O(1) total
 * - Query: O(1) for shard selection + O(1) for Map lookup = O(1) total
 * - Query All: O(n) where n = total records (scans ALL shards)
 * - Rebalancing: O(expensive) and we don't support it anyway
 *
 * SCALABILITY:
 * - Horizontal: Add more shards (requires resharding, good luck)
 * - Vertical: Add more RAM (JavaScript heap size limit says hi)
 * - Emotional: Add more developers (definitely doesn't scale)
 *
 * FAULT TOLERANCE:
 * None. If any shard "fails" (which can't happen since they're all in-memory),
 * you lose that data. There's no replication, no backups, no safety net.
 * YOLO database design.
 *
 * CONSISTENCY MODEL:
 * Strong consistency because everything is in the same process. We achieve
 * this not through clever algorithms but through the inability to be inconsistent.
 *
 * @module infrastructure/distributed-database/database
 * @class DistributedDatabase
 * @version 4.0.0-enterprise.blockchain-ready
 * @since The Dawn of Simulated Distribution
 * @author The Distributed Systems Cosplay Team
 * @see {@link IShard} For individual shard interface
 * @see {@link IShardStrategy} For sharding strategy interface
 * @see {@link https://en.wikipedia.org/wiki/CAP_theorem} To learn what we're ignoring
 */

import type { IShard } from '../shards/interfaces/IShard.interface';
import type { IShardStrategy } from '../strategies/interfaces/IShardStrategy.interface';
import { VirtualDiskShard } from '../shards/implementations/VirtualDiskShard.class';
import { HashShardStrategy } from '../strategies/implementations/HashShardStrategy.class';

/**
 * DistributedDatabase - Coordinating Chaos Since 2024
 *
 * This class manages a collection of shards and uses a sharding strategy to
 * distribute data across them. It presents a unified interface while internally
 * scattering your data like confetti at a very boring enterprise conference.
 *
 * ARCHITECTURAL OVERVIEW:
 * ```
 * ┌─────────────────────────────────────┐
 * │     DistributedDatabase             │
 * │  (Coordination Layer)               │
 * └──────────────┬──────────────────────┘
 *                │
 *    ┌───────────┼───────────┐
 *    ▼           ▼           ▼
 * ┌──────┐   ┌──────┐   ┌──────┐
 * │Shard0│   │Shard1│   │Shard2│
 * │(Map) │   │(Map) │   │(Map) │
 * └──────┘   └──────┘   └──────┘
 * ```
 *
 * RESPONSIBILITIES:
 * - Maintain collection of shards (array of IShard objects)
 * - Delegate to sharding strategy for key distribution
 * - Coordinate operations across multiple shards
 * - Aggregate results from shard queries
 * - Provide unified interface for data operations
 * - Generate impressive statistics for dashboards
 *
 * KEY OPERATIONS:
 * - insert(key, data): Store data in appropriate shard
 * - query(key): Retrieve data from appropriate shard
 * - queryAll(): Aggregate data from ALL shards (expensive!)
 * - getStats(): Get distribution statistics (for bragging rights)
 *
 * DESIGN PATTERNS EMPLOYED:
 * - Strategy Pattern: Pluggable sharding strategies
 * - Facade Pattern: Simple interface hiding shard complexity
 * - Composite Pattern: Treating multiple shards as single database
 * - Wrapper Pattern: Wrapping Map objects in enterprise terminology
 *
 * THREAD SAFETY:
 * Safe in JavaScript's single-threaded environment. In a multi-threaded
 * environment, you'd need locks, mutexes, and probably therapy.
 *
 * ERROR HANDLING:
 * Minimal. We assume you'll use valid inputs because we're optimists.
 * Invalid inputs may cause crashes, but that's a feature for finding bugs!
 *
 * @class DistributedDatabase
 * @category Infrastructure
 * @subcategory Data Storage
 * @complexity High (in documentation, not implementation)
 * @production-ready "Define 'ready'"
 */
export class DistributedDatabase {
    /**
     * Collection of Shards
     *
     * An array of IShard instances that comprise our "distributed" database.
     * Each shard is an independent storage unit (Map object) responsible for
     * a subset of the total data.
     *
     * ARRAY STRUCTURE:
     * - Index 0: Shard 0 (VirtualDiskShard with id "shard-0")
     * - Index 1: Shard 1 (VirtualDiskShard with id "shard-1")
     * - ...and so on
     *
     * SHARD LIFECYCLE:
     * - Created during DistributedDatabase construction
     * - Persists for lifetime of DistributedDatabase instance
     * - Destroyed when DistributedDatabase is garbage collected
     *
     * IMMUTABILITY:
     * The array itself is private and not directly modifiable from outside.
     * However, the shards within can be queried and modified through
     * database operations.
     *
     * @private
     * @type {IShard[]}
     * @memberof DistributedDatabase
     */
    private shards: IShard[] = [];

    /**
     * Sharding Strategy
     *
     * The algorithm used to determine which shard handles which key.
     * This is the brain of the distribution system (small brain, but still).
     *
     * STRATEGY TYPES:
     * - HashShardStrategy: Deterministic, good for lookups
     * - RoundRobinShardStrategy: Fair, terrible for lookups
     * - Custom strategies: Your problem now
     *
     * MUTABILITY:
     * Can be changed via switchToHashStrategy() or switchToRoundRobin() methods.
     * Changing strategy mid-operation is technically possible but existentially
     * terrifying (data won't move, strategy changes, chaos ensues).
     *
     * @private
     * @type {IShardStrategy}
     * @memberof DistributedDatabase
     */
    private strategy: IShardStrategy;

    /**
     * Total Operation Count
     *
     * Tracks the cumulative number of operations performed on this database.
     * Useful for metrics, monitoring, and impressing management with big numbers.
     *
     * @private
     * @type {number}
     * @default 0
     * @memberof DistributedDatabase
     */
    private operationCount: number = 0;

    /**
     * Database Creation Timestamp
     *
     * Records when this database instance was created. Useful for uptime
     * calculations and age-based debugging ("it worked yesterday!").
     *
     * @private
     * @type {number}
     * @memberof DistributedDatabase
     */
    private readonly createdAt: number = Date.now();

    /**
     * Constructor - Birth of a Distributed Database
     *
     * Creates a new DistributedDatabase instance with the specified number of
     * shards and sharding strategy. This is where the magic begins (by "magic"
     * we mean "array initialization").
     *
     * INITIALIZATION PROCESS:
     * 1. Accept shardCount and strategy parameters
     * 2. Store strategy for later use
     * 3. Create shardCount number of VirtualDiskShard instances
     * 4. Add each shard to the shards array
     * 5. Feel accomplished
     *
     * PARAMETER: shardCount
     * The number of shards to create. Defaults to 3 because:
     * - 1 is not distributed
     * - 2 is barely distributed
     * - 3 is the minimum for "distributed" credibility
     * - Higher numbers are supported but rarely needed
     *
     * SHARD NAMING:
     * Shards are named "shard-0", "shard-1", "shard-2", etc.
     * Very creative, we know.
     *
     * PARAMETER: strategy
     * The sharding strategy to use. Must implement IShardStrategy interface.
     * If not provided, defaults to HashShardStrategy because it's sensible.
     *
     * WHY ALLOW CUSTOM STRATEGY?
     * - Flexibility (good engineering practice)
     * - Testing (can inject mock strategies)
     * - Over-engineering (the real reason)
     *
     * PERFORMANCE:
     * Construction is O(n) where n = shardCount. For typical values (3-10),
     * this is negligible. For crazy values (1000+), you might notice a delay,
     * but you have bigger problems if you're creating 1000 shards.
     *
     * @constructor
     * @param {number} [shardCount=3] - Number of shards to create
     * @param {IShardStrategy} [strategy] - Sharding strategy (defaults to HashShardStrategy)
     * @throws {Error} If shardCount is 0 or negative (technically doesn't throw, just breaks)
     *
     * @example
     * // Create database with default settings (3 shards, hash strategy)
     * const db = new DistributedDatabase();
     *
     * @example
     * // Create database with 5 shards and hash strategy
     * const db = new DistributedDatabase(5, new HashShardStrategy());
     *
     * @example
     * // Create database with custom strategy
     * const db = new DistributedDatabase(3, new MyCustomStrategy());
     */
    constructor(shardCount: number = 3, strategy?: IShardStrategy) {
        // Store the strategy, defaulting to HashShardStrategy if not provided
        // HashShardStrategy is the sensible default because it's deterministic
        this.strategy = strategy || new HashShardStrategy();

        // Create the specified number of shards
        // Each shard is a VirtualDiskShard with a unique ID
        for (let i = 0; i < shardCount; i++) {
            const shard = new VirtualDiskShard(`shard-${i}`);
            this.shards.push(shard);
        }

        // At this point, we have a fully initialized distributed database!
        // Well, "distributed" in the loosest sense of the word.
    }

    /**
     * Insert Data into Database
     *
     * Stores a key-value pair in the appropriate shard. The sharding strategy
     * determines which shard gets the honor of storing this data.
     *
     * OPERATION FLOW:
     * 1. Ask strategy: which shard for this key?
     * 2. Get that shard from our array
     * 3. Tell shard to store the data
     * 4. Increment operation counter
     * 5. Done!
     *
     * PARAMETER: key
     * The key under which to store the data. Must be a string.
     * Examples: "user:123", "port:frontend", "session:abc123"
     *
     * PARAMETER: data
     * The data to store. Can be anything: object, string, number, array, etc.
     * We use 'unknown' type because we genuinely don't care what you store.
     *
     * SHARD SELECTION:
     * The strategy determines shard index. We trust it blindly because
     * that's what dependency injection taught us.
     *
     * OVERWRITE BEHAVIOR:
     * If the key already exists in that shard, the old value is overwritten.
     * No questions asked, no warnings given, no backups made. YOLO.
     *
     * RETURN VALUE:
     * None (void). We don't believe in acknowledgments. The operation either
     * succeeds silently or crashes loudly. No middle ground.
     *
     * @method insert
     * @param {string} key - Key to store data under
     * @param {unknown} data - Data to store
     * @returns {void}
     *
     * @sideeffects
     * - Modifies appropriate shard's storage
     * - Increments operation counter
     *
     * @performance O(1) assuming strategy is O(1)
     * @threadsafe Yes (JavaScript is single-threaded)
     *
     * @example
     * db.insert("user:123", { name: "Alice", role: "Admin" });
     * db.insert("port:frontend", 6969);
     * db.insert("config", { debug: true, timeout: 5000 });
     */
    insert(key: string, data: unknown): void {
        // Ask the strategy which shard should handle this key
        const shardIndex = this.strategy.getShardId(key, this.shards.length);

        // Get the designated shard
        const shard = this.shards[shardIndex];

        // Store the data in that shard
        shard.store(key, data);

        // Increment operation counter for metrics
        this.operationCount++;
    }

    /**
     * Query Data by Key
     *
     * Retrieves the value associated with a key. Uses the sharding strategy
     * to find which shard has (or should have) this key.
     *
     * OPERATION FLOW:
     * 1. Ask strategy: which shard for this key?
     * 2. Get that shard from our array
     * 3. Ask shard to retrieve the data
     * 4. Increment operation counter
     * 5. Return whatever the shard gave us
     *
     * PARAMETER: key
     * The key to look up. Should be the same key used in insert().
     *
     * RETURN VALUE:
     * - If key exists: returns the stored data
     * - If key doesn't exist: returns undefined
     * - If you used wrong strategy: returns undefined (oops!)
     *
     * STRATEGY CONSISTENCY:
     * This MUST use the same strategy that was used during insert, or you'll
     * look in the wrong shard and find nothing. Changing strategies mid-operation
     * is like changing the filing system while files are still in the cabinet.
     *
     * @method query
     * @param {string} key - Key to retrieve
     * @returns {unknown} Stored data or undefined
     *
     * @performance O(1) assuming strategy is O(1)
     *
     * @example
     * const user = db.query("user:123");
     * if (user) {
     *     console.log("Found user:", user);
     * }
     */
    query(key: string): unknown {
        // Determine which shard has (or should have) this key
        const shardIndex = this.strategy.getShardId(key, this.shards.length);

        // Retrieve from that shard
        const shard = this.shards[shardIndex];
        const result = shard.retrieve(key);

        // Update metrics
        this.operationCount++;

        return result;
    }

    /**
     * Query All Data
     *
     * Retrieves ALL data from ALL shards and combines it into a single array.
     * This is the nuclear option - it touches every shard and returns everything.
     *
     * OPERATION FLOW:
     * 1. Ask each shard for all its data
     * 2. Combine all arrays using flatMap
     * 3. Increment operation counter
     * 4. Return the combined array
     *
     * PERFORMANCE WARNING:
     * This is O(n) where n = total number of records across all shards.
     * With large datasets, this is SLOW and MEMORY-INTENSIVE.
     * Use sparingly, ideally never in production hot paths.
     *
     * RETURN VALUE:
     * Array containing all values from all shards. Order is shard-0 values,
     * then shard-1 values, etc. Within each shard, order is insertion order.
     *
     * USE CASES:
     * - Debugging (see what's in the database)
     * - Testing (verify data was stored)
     * - Export (get all data for backup)
     * - Reports (aggregate statistics)
     * - Mistakes (calling this in production loop)
     *
     * @method queryAll
     * @returns {unknown[]} Array of all stored values
     *
     * @performance O(n) where n = total records
     * @memoryintensive Yes - creates new array with all data
     *
     * @example
     * const allData = db.queryAll();
     * console.log(`Total records: ${allData.length}`);
     */
    queryAll(): unknown[] {
        // Use flatMap to get all data from all shards and flatten into one array
        const allData = this.shards.flatMap(shard => shard.getAll());

        // Update metrics
        this.operationCount++;

        return allData;
    }

    /**
     * Query Specific Shard
     *
     * Retrieves all data from a specific shard by index. Useful for debugging
     * distribution or when you know exactly which shard you want.
     *
     * @method queryShard
     * @param {number} index - Shard index (0-based)
     * @returns {unknown[]} All data from that shard, or empty array if invalid index
     *
     * @example
     * const shard0Data = db.queryShard(0);
     */
    queryShard(index: number): unknown[] {
        const shard = this.shards[index];
        if (!shard) return [];

        this.operationCount++;
        return shard.getAll();
    }

    /**
     * Get Shard Count
     *
     * Returns the total number of shards in this database.
     *
     * @method getShardCount
     * @returns {number} Number of shards
     *
     * @example
     * console.log(`Database has ${db.getShardCount()} shards`);
     */
    getShardCount(): number {
        return this.shards.length;
    }

    /**
     * Get Shard for Key
     *
     * Returns which shard index would handle a given key, without actually
     * querying that shard. Useful for debugging distribution.
     *
     * @method getShardForKey
     * @param {string} key - Key to check
     * @returns {number} Shard index that would handle this key
     *
     * @example
     * const shardId = db.getShardForKey("user:123");
     * console.log(`user:123 would go to shard ${shardId}`);
     */
    getShardForKey(key: string): number {
        return this.strategy.getShardId(key, this.shards.length);
    }

    /**
     * Get Total Record Count
     *
     * Counts total number of records across all shards. This requires
     * querying all shards, so it's O(n) where n = number of shards.
     *
     * @method getTotalRecords
     * @returns {number} Total number of records
     *
     * @example
     * console.log(`Total records: ${db.getTotalRecords()}`);
     */
    getTotalRecords(): number {
        return this.queryAll().length;
    }

    /**
     * Get Shard Distribution
     *
     * Returns an array showing how many records each shard contains.
     * Useful for analyzing distribution quality.
     *
     * @method getShardDistribution
     * @returns {number[]} Array of record counts per shard
     *
     * @example
     * const dist = db.getShardDistribution();
     * console.log(`Distribution: ${dist}`); // [10, 12, 11]
     */
    getShardDistribution(): number[] {
        return this.shards.map(shard => shard.getAll().length);
    }

    /**
     * Check if Database is Balanced
     *
     * Returns true if all shards have roughly equal number of records
     * (within 1 record difference). Useful for validating distribution.
     *
     * @method isBalanced
     * @returns {boolean} True if balanced
     *
     * @example
     * if (!db.isBalanced()) {
     *     console.warn("Database is unbalanced!");
     * }
     */
    isBalanced(): boolean {
        const dist = this.getShardDistribution();
        if (dist.length === 0) return true;

        const avg = dist.reduce((a, b) => a + b, 0) / dist.length;
        return dist.every(count => Math.abs(count - avg) <= 1);
    }

    /**
     * Get Database Statistics
     *
     * Returns comprehensive statistics about the database. Perfect for
     * monitoring dashboards and impressing stakeholders.
     *
     * @method getStats
     * @returns {object} Statistics object
     *
     * @example
     * console.log(JSON.stringify(db.getStats(), null, 2));
     */
    getStats(): {
        shardCount: number;
        totalRecords: number;
        distribution: number[];
        balanced: boolean;
        operations: number;
        strategyName: string;
        uptimeMs: number;
    } {
        return {
            shardCount: this.shards.length,
            totalRecords: this.getTotalRecords(),
            distribution: this.getShardDistribution(),
            balanced: this.isBalanced(),
            operations: this.operationCount,
            strategyName: this.strategy.constructor.name,
            uptimeMs: Date.now() - this.createdAt,
        };
    }

    /**
     * Clear All Data
     *
     * Removes all data from all shards. Nuclear option. Use with caution.
     * Or don't use caution, we're not your supervisor.
     *
     * @method clear
     * @returns {void}
     *
     * @example
     * db.clear(); // Goodbye, data!
     */
    clear(): void {
        this.shards.forEach(shard => {
            if ('clear' in shard && typeof shard.clear === 'function') {
                (shard as any).clear();
            }
        });
        this.operationCount++;
    }

    /**
     * Export All Data as JSON
     *
     * Serializes all data to JSON string. Useful for backups or migration.
     *
     * @method export
     * @returns {string} JSON representation of all data
     *
     * @example
     * const backup = db.export();
     * fs.writeFileSync('backup.json', backup);
     */
    export(): string {
        return JSON.stringify(this.queryAll());
    }

    /**
     * Get Strategy Name
     *
     * Returns the name of the current sharding strategy.
     *
     * @method getStrategyName
     * @returns {string} Strategy class name
     */
    getStrategyName(): string {
        return this.strategy.constructor.name;
    }

    /**
     * Switch to Hash Strategy
     *
     * Changes the sharding strategy to HashShardStrategy. WARNING: Existing
     * data won't move, so queries might return undefined until rebalanced.
     *
     * @method switchToHashStrategy
     * @returns {void}
     */
    switchToHashStrategy(): void {
        this.strategy = new HashShardStrategy();
    }

    /**
     * String Representation
     *
     * @method toString
     * @returns {string} String representation
     */
    toString(): string {
        return `DistributedDatabase(shards=${this.shards.length}, strategy=${this.getStrategyName()}, records=${this.getTotalRecords()})`;
    }
}

/**
 * Factory function to create DistributedDatabase instances
 */
export function createDistributedDatabase(
    shardCount?: number,
    strategy?: IShardStrategy
): DistributedDatabase {
    return new DistributedDatabase(shardCount, strategy);
}

/**
 * Re-export types for convenience
 */
export type { IShard } from '../shards/interfaces/IShard.interface';
export type { IShardStrategy } from '../strategies/interfaces/IShardStrategy.interface';

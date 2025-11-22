/**
 * @fileoverview
 * VirtualDiskShard Implementation - The Crown Jewel of Simulated Persistence
 *
 * This file contains the concrete implementation of the IShard interface using
 * what we grandiosely call a "Virtual Disk". In reality, it's a JavaScript Map
 * pretending to be a disk, but in the enterprise world, we don't let facts
 * get in the way of impressive terminology.
 *
 * WHAT IS A VIRTUAL DISK?
 * It's a Map. That's it. That's the secret. But we simulate I/O delays to make
 * it seem like we're actually writing to disk, because without artificial latency,
 * how would we justify all those performance optimization meetings?
 *
 * WHY SIMULATE I/O?
 * - Makes our code look more realistic (read: slower)
 * - Gives us something to "optimize" in sprint retrospectives
 * - Justifies the existence of caching layers
 * - Makes load testing results look more interesting
 * - Because we can, and that's reason enough
 *
 * ARCHITECTURAL DECISIONS:
 * 1. Use Map instead of Object (because we read MDN once)
 * 2. Simulate async I/O with setTimeout (for that authentic disk experience)
 * 3. Actually implement it synchronously (because async is hard)
 * 4. Add verbose logging (so we can debug in production)
 * 5. Over-comment everything (you're reading this, so it worked)
 *
 * PERFORMANCE CHARACTERISTICS:
 * - Read: O(1) + O(pretend_disk_latency)
 * - Write: O(1) + O(simulated_io_overhead)
 * - Memory: O(n) where n = items stored
 * - Maintenance Cost: O(n²) where n = number of engineers confused by this
 *
 * @module infrastructure/distributed-database/shards/implementations
 * @class VirtualDiskShard
 * @implements {IShard}
 * @version 3.0.0-enterprise.production-ready.alpha
 * @since The Age of Over-Engineering
 * @author The Distributed Systems Dream Team
 * @see {@link IShard} For the contract we're implementing
 */

import type { IShard } from '../interfaces/IShard.interface';

/**
 * VirtualDiskShard - A Map Dressed Up as Enterprise Infrastructure
 *
 * This class provides a concrete implementation of the IShard interface, backed
 * by what we call a "Virtual Disk" but what JavaScript calls a "Map". The
 * virtualization here refers to the fact that we're pretending this is more
 * sophisticated than it actually is.
 *
 * KEY FEATURES:
 * - In-memory storage (because real disks are hard)
 * - Simulated I/O latency (for authenticity)
 * - Type-safe operations (thanks TypeScript!)
 * - Zero actual persistence (it's all in RAM, baby)
 * - 100% data loss on process restart (feature, not bug)
 *
 * DESIGN PATTERNS:
 * - Adapter Pattern (adapting Map to IShard interface)
 * - Façade Pattern (hiding the simplicity of Map behind complexity)
 * - Singleton Pattern (just kidding, we make many instances)
 * - Pretension Pattern (our own invention)
 *
 * THREAD SAFETY:
 * Completely thread-safe due to JavaScript's single-threaded nature.
 * This is like saying a bicycle is safe from car accidents because it's not a car.
 *
 * ACID COMPLIANCE:
 * - Atomicity: Yes (because JavaScript is single-threaded)
 * - Consistency: Sure (Map guarantees it)
 * - Isolation: Absolutely (no concurrent transactions possible)
 * - Durability: LOL NO (everything's in memory)
 *
 * USAGE EXAMPLE:
 * ```typescript
 * const shard = new VirtualDiskShard('shard-0');
 * shard.store('user:123', { name: 'Enterprise Developer' });
 * const user = shard.retrieve('user:123');
 * const allData = shard.getAll();
 * ```
 *
 * @class VirtualDiskShard
 * @implements {IShard}
 * @category Infrastructure
 * @subcategory Distributed Storage
 * @production-ready false
 * @production-deployed true
 * @regrets many
 */
export class VirtualDiskShard implements IShard {
    /**
     * The Shard Identifier
     *
     * This readonly property uniquely identifies this shard within the
     * distributed database system. It's set once during construction and
     * never changes, much like our commitment to over-engineering.
     *
     * IMMUTABILITY RATIONALE:
     * Changing a shard's ID after creation would be like renaming a file
     * while it's being read. Technically possible in some systems, but
     * definitely a bad idea in ours.
     *
     * @type {string}
     * @readonly
     * @public
     * @example "shard-0", "shard-42", "shard-production-us-east-1"
     */
    public readonly id: string;

    /**
     * The Internal Storage Mechanism (a.k.a. The Virtual Disk)
     *
     * This is where the magic happens. By "magic" we mean "a Map object".
     * We call it "storage" instead of "map" because that sounds more
     * enterprise-appropriate.
     *
     * WHY MAP INSTEAD OF OBJECT?
     * - Maps maintain insertion order (sometimes useful)
     * - Maps can use any type as keys (we only use strings, but still)
     * - Maps have a size property (convenient)
     * - Maps make us look like we know what we're doing
     * - Objects are so 2015
     *
     * TYPE SIGNATURE:
     * Map<string, unknown> means:
     * - Keys are strings (the only sensible choice)
     * - Values are unknown (because we have no idea what you'll store)
     *
     * CAPACITY:
     * Unlimited (until you run out of RAM, then it's very limited)
     *
     * PERSISTENCE:
     * None whatsoever. Process restart = data apocalypse.
     *
     * @private
     * @type {Map<string, unknown>}
     * @memberof VirtualDiskShard
     */
    private storage: Map<string, unknown> = new Map<string, unknown>();

    /**
     * I/O Operation Counter
     *
     * Tracks the total number of I/O operations performed by this shard.
     * Useful for:
     * - Performance metrics (that nobody looks at)
     * - Debugging (when things go wrong)
     * - Looking impressive in dashboards
     * - Justifying our existence to management
     *
     * "I/O Operations" is a generous term here since we're not actually
     * doing any I/O, but let's not split hairs.
     *
     * @private
     * @type {number}
     * @default 0
     * @memberof VirtualDiskShard
     */
    private ioOperationCount: number = 0;

    /**
     * Last Access Timestamp
     *
     * Records the timestamp of the last operation performed on this shard.
     * Could be useful for:
     * - Implementing LRU eviction policies (that we'll never implement)
     * - Monitoring shard usage patterns (that nobody monitors)
     * - Tracking idle shards (so we can... keep tracking them)
     *
     * @private
     * @type {number}
     * @default 0
     * @memberof VirtualDiskShard
     */
    private lastAccessTime: number = 0;

    /**
     * Constructor - Birth of a Virtual Disk
     *
     * Creates a new VirtualDiskShard instance with the specified ID.
     * This is where the shard comes into existence, like a digital phoenix
     * rising from the ashes of sensible software design.
     *
     * INITIALIZATION PROCESS:
     * 1. Accept the shard ID from the caller
     * 2. Store it in the readonly id property
     * 3. Initialize the storage Map (automatically done by property initializer)
     * 4. Set operation counters to zero
     * 5. Feel proud of our enterprise architecture
     *
     * PARAMETER VALIDATION:
     * None! We trust that callers will provide valid IDs. This is enterprise
     * software where trust is more important than validation.
     *
     * ERROR HANDLING:
     * Also none! If construction fails, that's a JavaScript problem, not ours.
     *
     * @constructor
     * @param {string} id - The unique identifier for this shard
     * @throws {TypeError} If id is not a string (but we don't check)
     * @throws {ValidationError} If id is empty (but we don't validate)
     * @throws {ExistentialCrisisError} If you think too hard about this
     *
     * @example
     * const shard = new VirtualDiskShard('shard-0');
     * const anotherShard = new VirtualDiskShard('shard-prod-001');
     */
    constructor(id: string) {
        this.id = id;
        // Storage Map is already initialized by the property declaration
        // But we could initialize it here if we wanted to be explicit
        // However, being explicit is less enterprise-y than being implicit
        // So we'll just let the property initializer handle it
    }

    /**
     * Store Data in the Virtual Disk
     *
     * Persists a key-value pair to the shard's storage. "Persists" is a strong
     * word here since nothing survives a process restart, but we'll use it
     * anyway because it sounds more professional than "temporarily remembers".
     *
     * OPERATION FLOW:
     * 1. Simulate I/O latency (by doing nothing)
     * 2. Store the data in the Map
     * 3. Increment operation counter (very important)
     * 4. Update last access timestamp
     * 5. Return nothing (because acknowledgment is for the weak)
     *
     * SIMULATED I/O LATENCY:
     * The original code had a comment about simulating I/O latency but didn't
     * actually do it. We maintain this proud tradition of aspirational comments.
     *
     * DATA DURABILITY:
     * Your data is as durable as a house of cards in a wind tunnel. Which is to
     * say: not durable at all. But it's FAST!
     *
     * OVERWRITE BEHAVIOR:
     * If the key already exists, the old value is replaced without ceremony,
     * notification, or backup. Gone. Poof. Like it never existed.
     *
     * @method store
     * @param {string} key - The key under which to store the data
     * @param {unknown} data - The data to store (can be literally anything)
     * @returns {void} Nothing, because we don't believe in feedback
     *
     * @example
     * shard.store('user:1', { name: 'Alice' });
     * shard.store('port:frontend', 6969);
     * shard.store('config', { setting: 'value' });
     *
     * @sideeffects
     * - Modifies internal storage Map
     * - Increments operation counter
     * - Updates last access timestamp
     * - Makes the JavaScript heap slightly larger
     *
     * @performance O(1) average case (Map.set complexity)
     * @threadsafe Yes (single-threaded JavaScript)
     * @transactional No
     * @idempotent No (overwrites existing values)
     */
    store(key: string, data: unknown): void {
        // Simulate I/O latency
        // (Just kidding, we're synchronous. But the comment stays for tradition!)

        // Perform the actual storage operation
        this.storage.set(key, data);

        // Update operational metrics because metrics are IMPORTANT
        this.ioOperationCount++;
        this.lastAccessTime = Date.now();

        // Optional: Log the operation for debugging purposes
        // (Commented out because logging in a library is antisocial)
        // console.log(`[VirtualDiskShard:${this.id}] Stored key: ${key}`);
    }

    /**
     * Retrieve Data from the Virtual Disk
     *
     * Fetches the value associated with the given key from storage. This is
     * the "read" operation in our CRUD suite (we have Create and Read, the
     * U and D are left as an exercise for the reader).
     *
     * OPERATION FLOW:
     * 1. Increment operation counter (because metrics)
     * 2. Update last access timestamp (because monitoring)
     * 3. Look up the key in the Map
     * 4. Return whatever we find, or undefined
     * 5. Hope the caller handles undefined properly
     *
     * RETURN VALUE SEMANTICS:
     * - If key exists: returns the stored value (by reference!)
     * - If key doesn't exist: returns undefined
     * - We return references, not copies, because:
     *   a) It's faster
     *   b) It's more memory efficient
     *   c) It allows for surprising mutation bugs that keep developers employed
     *
     * UNDEFINED AMBIGUITY:
     * There's a subtle issue here: if someone stores undefined as a value,
     * we can't distinguish between "key exists with undefined value" and
     * "key doesn't exist". This is called a "design decision" in polite company
     * and a "bug" everywhere else.
     *
     * SIDE EFFECTS:
     * Despite being a read operation, it has side effects (incrementing counters).
     * This violates functional programming principles, but we're enterprise
     * developers, not functional programming purists.
     *
     * @method retrieve
     * @param {string} key - The key whose value to retrieve
     * @returns {unknown} The stored value, or undefined if not found
     *
     * @example
     * const user = shard.retrieve('user:1'); // Returns stored user object
     * const missing = shard.retrieve('nonexistent'); // Returns undefined
     *
     * @sideeffects
     * - Increments operation counter
     * - Updates last access timestamp
     * - Does NOT modify stored data (it's a read, after all)
     *
     * @performance O(1) average case (Map.get complexity)
     * @threadsafe Yes (JavaScript is single-threaded)
     * @cacheable Yes (but we don't cache)
     * @idempotent Yes (reading doesn't change the data)
     */
    retrieve(key: string): unknown {
        // Update operational metrics first
        // (Because we bill by the operation, not by the result)
        this.ioOperationCount++;
        this.lastAccessTime = Date.now();

        // Perform the actual retrieval
        const value = this.storage.get(key);

        // Optional: Log the operation
        // (Commented out because console.log in production is frowned upon)
        // console.log(`[VirtualDiskShard:${this.id}] Retrieved key: ${key}, found: ${value !== undefined}`);

        return value;
    }

    /**
     * Get All Stored Values
     *
     * Returns an array containing ALL values stored in this shard. Not the keys,
     * not key-value pairs, just the values. Why? Because that's what the
     * interface specifies, and we're nothing if not compliant.
     *
     * IMPLEMENTATION NOTES:
     * We use Array.from(this.storage.values()) to convert the Map's value
     * iterator into an array. We could also use [...this.storage.values()]
     * but Array.from looks more enterprise-y.
     *
     * PERFORMANCE IMPLICATIONS:
     * - Time Complexity: O(n) where n = number of entries
     * - Space Complexity: O(n) for the new array
     * - Manager Complexity: O(1) because they won't read this
     *
     * WHEN TO USE:
     * - Debugging (looking at shard contents)
     * - Testing (verifying data was stored)
     * - Data export (before the inevitable migration)
     * - Demos (showing off our data)
     *
     * WHEN NOT TO USE:
     * - Production with large datasets (RIP memory)
     * - Hot code paths (this allocates a new array every time)
     * - When you care about performance (see above)
     * - When you want keys too (tough luck)
     *
     * RETURN VALUE:
     * A brand new array containing all values. Modifying this array does NOT
     * affect the shard's storage. However, modifying the objects IN the array
     * WILL affect the stored objects (because we return references).
     *
     * ORDER GUARANTEE:
     * Values are returned in Map iteration order, which is insertion order.
     * But we don't promise this in the interface, so technically we could
     * return them in any order. We won't, but we COULD.
     *
     * @method getAll
     * @returns {unknown[]} Array of all stored values
     *
     * @example
     * shard.store('a', 1);
     * shard.store('b', 2);
     * shard.store('c', 3);
     * const values = shard.getAll(); // Returns [1, 2, 3]
     *
     * @sideeffects
     * - Increments operation counter
     * - Updates last access timestamp
     * - Allocates new array (garbage collector's problem now)
     *
     * @performance O(n) where n = number of stored items
     * @threadsafe Yes (but don't modify storage during iteration)
     * @scalability Poor (don't call this on huge shards)
     * @memoryintensive Very (creates a new array every call)
     */
    getAll(): unknown[] {
        // Update metrics because we're professionals
        this.ioOperationCount++;
        this.lastAccessTime = Date.now();

        // Convert the Map's values iterator to an array
        // Using Array.from instead of spread operator because it's more explicit
        // (And because we like typing more characters)
        const allValues = Array.from(this.storage.values());

        // Optional: Log for debugging
        // console.log(`[VirtualDiskShard:${this.id}] Retrieved all values, count: ${allValues.length}`);

        return allValues;
    }

    /**
     * Get the Current Size of the Shard
     *
     * Returns the number of key-value pairs stored in this shard.
     * This is a bonus method not required by IShard interface, but we're
     * overachievers who can't help adding extra methods.
     *
     * USE CASES:
     * - Monitoring shard capacity
     * - Rebalancing decisions (that we'll never implement)
     * - Debugging memory issues
     * - Filling slides for architecture presentations
     *
     * @method size
     * @returns {number} Number of stored key-value pairs
     * @public
     *
     * @example
     * console.log(`Shard ${shard.id} contains ${shard.size()} items`);
     */
    public size(): number {
        return this.storage.size;
    }

    /**
     * Get Total I/O Operation Count
     *
     * Returns the total number of I/O operations (store, retrieve, getAll)
     * performed on this shard since creation. Useful for performance monitoring
     * and justifying our salaries.
     *
     * @method getIOOperationCount
     * @returns {number} Total I/O operation count
     * @public
     *
     * @example
     * console.log(`Shard has performed ${shard.getIOOperationCount()} operations`);
     */
    public getIOOperationCount(): number {
        return this.ioOperationCount;
    }

    /**
     * Get Last Access Time
     *
     * Returns the timestamp (in milliseconds since epoch) of the last operation
     * performed on this shard. Useful for identifying cold shards that could
     * be candidates for... well, for continuing to sit there unused.
     *
     * @method getLastAccessTime
     * @returns {number} Timestamp of last access
     * @public
     *
     * @example
     * const idleTime = Date.now() - shard.getLastAccessTime();
     * console.log(`Shard has been idle for ${idleTime}ms`);
     */
    public getLastAccessTime(): number {
        return this.lastAccessTime;
    }

    /**
     * Clear All Data from the Shard
     *
     * Removes all key-value pairs from the shard's storage. This is the nuclear
     * option. Use with caution, or don't, we're not your supervisor.
     *
     * WARNING: This operation is IRREVERSIBLE (unless you have backups, which you don't)
     *
     * @method clear
     * @returns {void}
     * @public
     * @dangerous
     *
     * @example
     * shard.clear(); // Goodbye, data!
     */
    public clear(): void {
        this.storage.clear();
        this.ioOperationCount++;
        this.lastAccessTime = Date.now();
    }

    /**
     * Check if a Key Exists
     *
     * Returns true if the key exists in storage, false otherwise.
     * More reliable than checking if retrieve() returns undefined, because
     * someone might have actually stored undefined as a value (weird, but possible).
     *
     * @method has
     * @param {string} key - The key to check
     * @returns {boolean} True if key exists
     * @public
     *
     * @example
     * if (shard.has('user:123')) {
     *     console.log('User exists!');
     * }
     */
    public has(key: string): boolean {
        this.ioOperationCount++;
        this.lastAccessTime = Date.now();
        return this.storage.has(key);
    }

    /**
     * Delete a Key-Value Pair
     *
     * Removes the specified key and its associated value from storage.
     * Returns true if the key existed and was deleted, false if it didn't exist.
     *
     * @method delete
     * @param {string} key - The key to delete
     * @returns {boolean} True if deleted, false if key didn't exist
     * @public
     *
     * @example
     * const deleted = shard.delete('user:123');
     * if (deleted) console.log('User deleted');
     */
    public delete(key: string): boolean {
        this.ioOperationCount++;
        this.lastAccessTime = Date.now();
        return this.storage.delete(key);
    }

    /**
     * Get Shard Statistics
     *
     * Returns an object containing various statistics about this shard.
     * Perfect for dashboards that nobody looks at.
     *
     * @method getStats
     * @returns {object} Statistics object
     * @public
     */
    public getStats(): {
        id: string;
        size: number;
        ioOperations: number;
        lastAccess: number;
        lastAccessISO: string;
    } {
        return {
            id: this.id,
            size: this.storage.size,
            ioOperations: this.ioOperationCount,
            lastAccess: this.lastAccessTime,
            lastAccessISO: new Date(this.lastAccessTime).toISOString(),
        };
    }

    /**
     * String Representation
     *
     * Returns a human-readable string representation of this shard.
     * Useful for logging and debugging.
     *
     * @method toString
     * @returns {string} String representation
     * @public
     */
    public toString(): string {
        return `VirtualDiskShard[${this.id}](size=${this.storage.size}, ops=${this.ioOperationCount})`;
    }
}

/**
 * Export type for convenience
 */
export type { IShard } from '../interfaces/IShard.interface';

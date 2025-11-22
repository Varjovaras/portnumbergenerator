/**
 * @fileoverview
 * IShard Interface Definition - Enterprise Data Partitioning Contract
 *
 * This interface represents the sacred contract that all data shards must uphold
 * in our glorious distributed database architecture. Each shard is a sovereign
 * territory in the vast empire of our data storage system, responsible for
 * managing its own subset of the total data kingdom.
 *
 * WHY DO WE NEED THIS?
 * Because storing everything in one place is for amateurs. We're professionals
 * who believe that data should be scattered across multiple virtual disks like
 * confetti at a very boring enterprise party.
 *
 * ARCHITECTURAL SIGNIFICANCE:
 * - Provides horizontal scalability (buzzword alert!)
 * - Enables fault isolation (so when one shard dies, we only lose SOME data)
 * - Facilitates parallel operations (because sequential is so 1990s)
 * - Looks impressive in architecture diagrams (the real reason)
 *
 * DESIGN PATTERNS EMPLOYED:
 * - Strategy Pattern (for shard selection algorithms)
 * - Repository Pattern (because we read about it once)
 * - CAP Theorem Ignorance Pattern (we choose all three: Consistency, Availability, Partition Tolerance)
 *
 * PERFORMANCE CHARACTERISTICS:
 * - Time Complexity: O(1) for operations (assuming hash maps don't lie)
 * - Space Complexity: O(n) where n is the amount of data you dare to store
 * - Bureaucracy Overhead: O(log(enterprise_size))
 *
 * @module infrastructure/distributed-database/shards/interfaces
 * @interface IShard
 * @version 2.0.0-enterprise.alpha
 * @since The Dawn of Over-Engineering
 * @author The Architecture Astronauts
 * @see {@link https://en.wikipedia.org/wiki/Shard_(database_architecture)} For people who need Wikipedia
 * @see {@link https://martinfowler.com/} For people who need validation from Martin Fowler
 */

/**
 * The IShard Interface - A Contract Written in TypeScript and Sealed with Enterprise Buzzwords
 *
 * This interface defines the core operations that any self-respecting shard must implement
 * to participate in our distributed database ecosystem. Think of it as the constitution
 * for our data republic, except unlike real constitutions, this one actually gets followed.
 *
 * IMPLEMENTATION REQUIREMENTS:
 * 1. Thread-safety (just kidding, JavaScript is single-threaded, but it sounds professional)
 * 2. ACID compliance (Atomicity, Consistency, Isolation, Durability - or at least 2 out of 4)
 * 3. Enterprise-grade error handling (try-catch blocks everywhere!)
 * 4. Logging capabilities (so we know what broke and when)
 * 5. Metrics collection (for dashboards nobody looks at)
 *
 * ANTI-PATTERNS TO AVOID:
 * - Implementing this interface without proper ceremony and fanfare
 * - Using simple Map objects when you could use a "Virtual Disk Shard"
 * - Not adding enough layers of abstraction
 * - Writing code that's easy to understand
 *
 * @interface IShard
 * @category Core Infrastructure
 * @subcategory Distributed Systems
 * @classification Mission-Critical
 * @clearance-level Enterprise-Architect-Only
 */
export interface IShard {
    /**
     * The Unique Identifier for this Shard
     *
     * This is not just any ID - this is THE ID that distinguishes this particular
     * shard from all the other shards in the distributed system. It's like a
     * social security number, but for data partitions.
     *
     * NAMING CONVENTION:
     * - Format: "shard-{index}" or "shard-{region}-{index}" for geo-distributed systems
     * - Examples: "shard-0", "shard-42", "shard-us-east-1a-007"
     * - Bad Examples: "bob", "my-shard", "¯\_(ツ)_/¯"
     *
     * UNIQUENESS GUARANTEE:
     * Within a single DistributedDatabase instance, all shard IDs MUST be unique.
     * We're not savages who allow duplicate IDs. That would be chaos.
     *
     * IMMUTABILITY:
     * This property is readonly because changing a shard's ID after creation
     * would be like changing someone's name mid-conversation. Confusing and rude.
     *
     * @type {string}
     * @readonly
     * @required
     * @immutable
     * @example
     * const shard: IShard = new VirtualDiskShard("shard-0");
     * console.log(shard.id); // Outputs: "shard-0"
     */
    readonly id: string;

    /**
     * Store Data in the Shard
     *
     * This method persists a key-value pair into the shard's internal storage mechanism.
     * "Internal storage mechanism" is enterprise-speak for "a Map object", but saying
     * it this way makes it sound like we're doing something sophisticated.
     *
     * OPERATION SEMANTICS:
     * - If the key already exists, the old value is MERCILESSLY OVERWRITTEN
     * - If the key is new, a new entry is created with appropriate ceremony
     * - The operation is idempotent (calling it twice with same params does nothing extra)
     * - No return value because we're too cool to acknowledge success
     *
     * PERFORMANCE GUARANTEES:
     * - Average Case: O(1) - as fast as a Map.set()
     * - Worst Case: O(1) - still as fast as a Map.set()
     * - Enterprise Case: O(n) where n = number of meetings about this operation
     *
     * CONSISTENCY MODEL:
     * - Write operations are immediately visible (strong consistency)
     * - Because we're in-memory and single-threaded
     * - Which makes "strong consistency" a fancy way of saying "it works"
     *
     * ERROR HANDLING:
     * - Invalid keys (null, undefined) should probably throw errors
     * - But we'll leave that as an "implementation detail"
     * - Translation: good luck, implementer!
     *
     * SIDE EFFECTS:
     * - Modifies internal state (duh)
     * - May trigger rebalancing in advanced implementations (it won't)
     * - Could invalidate caches (if we had any)
     * - Increases the company's cloud storage bills (eventually)
     *
     * @method store
     * @param {string} key - The key under which to store the data. Must be unique within shard.
     * @param {unknown} data - The data to store. Can be anything because TypeScript says so.
     * @returns {void} Nothing. We don't believe in acknowledgments.
     * @throws {ShardStorageException} Theoretically. In practice, it probably just crashes.
     *
     * @example
     * shard.store("user:1234", { name: "Enterprise User", role: "Buzzword Generator" });
     * shard.store("port:frontend", 6969); // The sacred numbers
     * shard.store("meaning-of-life", 42); // Douglas Adams approved
     *
     * @sideeffects Modifies shard state
     * @idempotent No - overwrites on duplicate keys
     * @threadsafe Yes (because JavaScript)
     */
    store(key: string, data: unknown): void;

    /**
     * Retrieve Data from the Shard
     *
     * This method fetches the value associated with a given key from the shard's
     * storage. It's like asking a librarian for a book, except the librarian is
     * a Map object and the book is arbitrary JSON data.
     *
     * OPERATION SEMANTICS:
     * - If the key exists, returns the associated value
     * - If the key doesn't exist, returns undefined (JavaScript's way of saying "¯\_(ツ)_/¯")
     * - Does not modify shard state (it's a pure read operation, supposedly)
     * - Thread-safe because we're single-threaded (see the pattern here?)
     *
     * PERFORMANCE CHARACTERISTICS:
     * - Average Case: O(1) - hash table lookup
     * - Worst Case: O(1) - still hash table lookup
     * - Marketing Case: O(log n) - sounds more impressive
     * - Reality: As fast as Map.get(), which is pretty darn fast
     *
     * RETURN VALUE SEMANTICS:
     * - Returns the EXACT same reference stored (no deep copying here, we're not made of CPU cycles)
     * - This means mutations to returned objects affect stored data (feature or bug? You decide!)
     * - undefined means "not found" (not "the value is undefined", because we're sloppy)
     *
     * CACHE INTERACTION:
     * - In a perfect world, this would check L1/L2/L3 caches
     * - In our world, it checks a Map
     * - The Map might be in CPU cache, so technically we're not lying?
     *
     * ERROR HANDLING:
     * - Invalid keys might return undefined or throw
     * - We'll leave that decision to the implementer
     * - Along with the responsibility for any production incidents
     *
     * CONSISTENCY GUARANTEES:
     * - Reads are strongly consistent (because we have no choice)
     * - You always get the latest value (because there's only one value)
     * - No stale reads (unless you count "undefined" as stale)
     *
     * @method retrieve
     * @param {string} key - The key whose value we want to retrieve
     * @returns {unknown} The stored value, or undefined if key doesn't exist
     * @throws {ShardReadException} In theory. In practice, probably never.
     *
     * @example
     * const user = shard.retrieve("user:1234");
     * const port = shard.retrieve("port:frontend"); // Should return 6969
     * const missing = shard.retrieve("nonexistent"); // Returns undefined
     *
     * @sideeffects None (it's a read operation, for crying out loud)
     * @idempotent Yes - calling it repeatedly returns same value
     * @threadsafe Yes (single-threaded environment)
     * @cacheable Yes (if we had a caching layer, which we don't)
     */
    retrieve(key: string): unknown;

    /**
     * Get All Stored Values
     *
     * This method returns an array containing ALL values stored in this shard.
     * Notice it returns ONLY values, not keys. Why? Because that's what the
     * original implementation did, and changing it now would require actually
     * thinking about our API design.
     *
     * USE CASES:
     * - Debugging (looking at what's in the shard)
     * - Testing (verifying data was stored correctly)
     * - Data migration (moving to a new, even more over-engineered system)
     * - Backup operations (before the inevitable disaster)
     * - Showing off in demos ("Look at all this data!")
     *
     * PERFORMANCE WARNING:
     * - Time Complexity: O(n) where n = number of items in shard
     * - Memory Complexity: O(n) because we're creating a new array
     * - Career Complexity: O(1) if used in production, could be O(infinity) if it causes an outage
     *
     * RETURN VALUE:
     * - Returns a NEW array (not a reference to internal storage)
     * - Values are in arbitrary order (because Map iteration order is "insertion order"
     *   but we won't document that because it's an implementation detail)
     * - Empty shard returns empty array (not null, not undefined, an actual [])
     *
     * ENTERPRISE CONSIDERATIONS:
     * - This operation doesn't scale (but neither do most things we build)
     * - Could cause memory pressure with large datasets (define "large")
     * - No pagination support (that's what v3 is for)
     * - No filtering or projection (use Array methods afterwards like a commoner)
     *
     * SECURITY IMPLICATIONS:
     * - Exposes ALL data in the shard (hope there's no PII!)
     * - No access control checks (that's someone else's problem)
     * - Could leak sensitive information (see: every data breach ever)
     *
     * ALTERNATIVE APPROACHES CONSIDERED AND REJECTED:
     * - Returning both keys and values (too useful)
     * - Returning an iterator (too modern)
     * - Returning a stream (too functional)
     * - Not implementing this method (too sensible)
     *
     * @method getAll
     * @returns {unknown[]} Array of all stored values (not keys, just values)
     * @throws {OutOfMemoryError} If you have too much data (good luck)
     *
     * @example
     * shard.store("key1", "value1");
     * shard.store("key2", "value2");
     * const allValues = shard.getAll(); // Returns ["value1", "value2"] (maybe)
     *
     * @sideeffects None (read-only operation)
     * @idempotent Yes
     * @threadsafe Yes (but don't call it in a loop)
     * @scalability Terrible
     * @bestpractice Don't use this in production
     * @actualuse Everywhere in production
     */
    getAll(): unknown[];
}

/**
 * Type alias for Shard Collections
 *
 * Because typing IShard[] everywhere is too mainstream. We need a semantic
 * type that screams "I'm a collection of shards!" to anyone reading the code.
 *
 * @typedef {IShard[]} ShardCollection
 */
export type ShardCollection = IShard[];

/**
 * Type guard to check if an object implements IShard
 *
 * This is a runtime check because TypeScript's type system disappears at runtime
 * like our hopes and dreams during a production incident.
 *
 * @param {unknown} obj - The object to check
 * @returns {boolean} True if object looks like a shard, false otherwise
 */
export function isIShard(obj: unknown): obj is IShard {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        typeof (obj as any).id === 'string' &&
        'store' in obj &&
        typeof (obj as any).store === 'function' &&
        'retrieve' in obj &&
        typeof (obj as any).retrieve === 'function' &&
        'getAll' in obj &&
        typeof (obj as any).getAll === 'function'
    );
}

/**
 * @fileoverview
 * Distributed Database Module - Central Export Hub for All Things Sharded
 *
 * This barrel file exports all the distributed database components in one convenient
 * location, because nobody wants to import from 47 different deeply nested paths.
 * We're over-engineers, not sadists.
 *
 * WHAT'S A BARREL FILE?
 * It's a file that re-exports stuff from other files. That's it. It's called
 * "barrel" because you dump everything in and pull it back out, like a barrel
 * of... imports? The metaphor breaks down quickly, but the pattern is solid.
 *
 * WHY USE BARREL FILES?
 * - Clean imports: `from '@/infrastructure/distributed-database'` instead of
 *   `from '@/infrastructure/distributed-database/shards/implementations/VirtualDiskShard.class'`
 * - Single source of truth for what's public API vs internal implementation
 * - Easy refactoring: move files around, update one barrel, consumers unaffected
 * - Makes us look professional (appearances matter in enterprise)
 *
 * WHAT'S EXPORTED:
 * - IShard interface and VirtualDiskShard implementation
 * - IShardStrategy interface and strategy implementations (Hash, RoundRobin)
 * - DistributedDatabase class (the star of the show)
 * - Helper functions and type guards
 * - Constants and enums
 *
 * USAGE EXAMPLES:
 * ```typescript
 * // Import everything you need from one place
 * import {
 *     DistributedDatabase,
 *     HashShardStrategy,
 *     RoundRobinShardStrategy,
 *     VirtualDiskShard
 * } from '@/infrastructure/distributed-database';
 *
 * // Create a database with hash-based sharding
 * const db = new DistributedDatabase(5, new HashShardStrategy());
 * ```
 *
 * ARCHITECTURAL NOTE:
 * This module represents the "Infrastructure Layer" of our clean architecture.
 * It provides data persistence and distribution capabilities without knowing
 * about business logic. That separation is what lets us sleep at night.
 *
 * @module infrastructure/distributed-database
 * @version 1.0.0-barrel.export
 * @since The Age of Consolidated Exports
 * @author The Import/Export Committee
 */

// =============================================================================
// SHARD INTERFACES & IMPLEMENTATIONS
// =============================================================================

/**
 * Export the IShard interface - the contract all shards must fulfill
 */
export type { IShard, ShardCollection } from './shards/interfaces/IShard.interface';

/**
 * Export the type guard for runtime IShard checking
 */
export { isIShard } from './shards/interfaces/IShard.interface';

/**
 * Export the VirtualDiskShard implementation - our Map-based "virtual disk"
 */
export { VirtualDiskShard } from './shards/implementations/VirtualDiskShard.class';

// =============================================================================
// SHARDING STRATEGY INTERFACES & IMPLEMENTATIONS
// =============================================================================

/**
 * Export the IShardStrategy interface - the contract for shard selection algorithms
 */
export type {
    IShardStrategy,
    ShardStrategyCollection,
    ShardStrategyType
} from './strategies/interfaces/IShardStrategy.interface';

/**
 * Export the strategy type constants object and type guard
 */
export {
    ShardStrategyType as ShardStrategyTypes,
    isIShardStrategy
} from './strategies/interfaces/IShardStrategy.interface';

/**
 * Export the HashShardStrategy - deterministic key-to-shard mapping
 */
export {
    HashShardStrategy,
    createHashStrategy
} from './strategies/implementations/HashShardStrategy.class';

/**
 * Export the RoundRobinShardStrategy - fair distribution, terrible lookups
 */
export {
    RoundRobinShardStrategy,
    createRoundRobinStrategy
} from './strategies/implementations/RoundRobinShardStrategy.class';

// =============================================================================
// DISTRIBUTED DATABASE
// =============================================================================

/**
 * Export the DistributedDatabase class - the main coordination layer
 */
export {
    DistributedDatabase,
    createDistributedDatabase
} from './database/DistributedDatabase.class';

// =============================================================================
// CONVENIENCE RE-EXPORTS
// =============================================================================

/**
 * Re-export commonly used types for convenience
 * This allows consumers to import both classes and their types from one place
 */
export type {
    IShard as IShardInterface,
    IShardStrategy as IShardStrategyInterface
} from './database/DistributedDatabase.class';

// =============================================================================
// MODULE METADATA
// =============================================================================

/**
 * Module metadata for introspection and debugging
 */
export const DISTRIBUTED_DATABASE_MODULE_INFO = {
    name: 'distributed-database',
    version: '1.0.0',
    description: 'Enterprise-grade distributed database simulation layer',
    components: {
        shards: ['IShard', 'VirtualDiskShard'],
        strategies: ['IShardStrategy', 'HashShardStrategy', 'RoundRobinShardStrategy'],
        database: ['DistributedDatabase']
    },
    features: [
        'Pluggable sharding strategies',
        'Virtual disk simulation',
        'In-memory distributed storage',
        'Real-time distribution analytics',
        'Zero actual distribution (it\'s all in one process)'
    ],
    limitations: [
        'Not actually distributed across machines',
        'No persistence (all in-memory)',
        'No replication or fault tolerance',
        'Resharding not supported',
        'Perfect for demos, terrible for production'
    ],
    authors: ['The Distributed Systems Dream Team'],
    madeWith: '❤️ and excessive documentation'
} as const;

/**
 * Helper function to log module info (for debugging)
 */
export function logDistributedDatabaseInfo(): void {
    console.log('='.repeat(80));
    console.log('DISTRIBUTED DATABASE MODULE');
    console.log('='.repeat(80));
    console.log(`Name: ${DISTRIBUTED_DATABASE_MODULE_INFO.name}`);
    console.log(`Version: ${DISTRIBUTED_DATABASE_MODULE_INFO.version}`);
    console.log(`Description: ${DISTRIBUTED_DATABASE_MODULE_INFO.description}`);
    console.log(`\nComponents:`);
    console.log(`  Shards: ${DISTRIBUTED_DATABASE_MODULE_INFO.components.shards.join(', ')}`);
    console.log(`  Strategies: ${DISTRIBUTED_DATABASE_MODULE_INFO.components.strategies.join(', ')}`);
    console.log(`  Database: ${DISTRIBUTED_DATABASE_MODULE_INFO.components.database.join(', ')}`);
    console.log(`\nFeatures:`);
    DISTRIBUTED_DATABASE_MODULE_INFO.features.forEach(f => console.log(`  - ${f}`));
    console.log(`\nLimitations:`);
    DISTRIBUTED_DATABASE_MODULE_INFO.limitations.forEach(l => console.log(`  - ${l}`));
    console.log('='.repeat(80));
}

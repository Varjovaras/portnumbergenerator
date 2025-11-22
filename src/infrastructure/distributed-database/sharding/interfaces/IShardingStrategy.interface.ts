export interface IShardingStrategy {
  /**
   * Determine which shard a port should be stored in
   */
  getShardForPort(port: number): string;

  /**
   * Determine which shard a key should be stored in
   */
  getShardForKey(key: string): string;

  /**
   * Get all available shard identifiers
   */
  getShards(): string[];

  /**
   * Add a new shard to the strategy
   */
  addShard(shardId: string): void;

  /**
   * Remove a shard from the strategy
   */
  removeShard(shardId: string): void;

  /**
   * Get the number of shards
   */
  getShardCount(): number;

  /**
   * Rebalance shards after adding or removing shards
   */
  rebalance(): Map<string, string[]>;

  /**
   * Get distribution statistics
   */
  getDistributionStats(ports: number[]): ShardDistribution;
}

export interface ShardDistribution {
  shards: Map<string, number>;
  totalPorts: number;
  averagePerShard: number;
  standardDeviation: number;
  balance: number; // 0-1, where 1 is perfectly balanced
}

export interface ShardConfig {
  shardId: string;
  weight?: number;
  capacity?: number;
  metadata?: Record<string, any>;
}

export enum ShardingAlgorithm {
  MODULO = 'modulo',
  CONSISTENT_HASH = 'consistent_hash',
  RANGE = 'range',
  HASH_SLOT = 'hash_slot',
  VIRTUAL_NODE = 'virtual_node'
}

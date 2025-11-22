import { IShardingStrategy, ShardDistribution } from '../interfaces/IShardingStrategy.interface.js';

/**
 * Consistent Hashing Strategy
 *
 * Uses consistent hashing with virtual nodes to distribute ports across shards.
 * This strategy minimizes redistribution when shards are added or removed.
 */
export class ConsistentHashingStrategy implements IShardingStrategy {
  private shards: Set<string> = new Set();
  private hashRing: Map<number, string> = new Map();
  private readonly virtualNodesPerShard: number;
  private sortedHashes: number[] = [];

  constructor(shards: string[] = [], virtualNodesPerShard: number = 150) {
    this.virtualNodesPerShard = virtualNodesPerShard;
    shards.forEach(shard => this.addShard(shard));
  }

  getShardForPort(port: number): string {
    if (this.shards.size === 0) {
      throw new Error('No shards available');
    }

    const hash = this.hash(port.toString());
    return this.getShardFromHash(hash);
  }

  getShardForKey(key: string): string {
    if (this.shards.size === 0) {
      throw new Error('No shards available');
    }

    const hash = this.hash(key);
    return this.getShardFromHash(hash);
  }

  private getShardFromHash(hash: number): string {
    // Find the first hash value >= the input hash
    let index = this.binarySearch(hash);

    if (index >= this.sortedHashes.length) {
      index = 0; // Wrap around
    }

    const ringHash = this.sortedHashes[index];
    return this.hashRing.get(ringHash)!;
  }

  private binarySearch(target: number): number {
    let left = 0;
    let right = this.sortedHashes.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midValue = this.sortedHashes[mid];

      if (midValue === target) {
        return mid;
      } else if (midValue < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return left;
  }

  getShards(): string[] {
    return Array.from(this.shards);
  }

  addShard(shardId: string): void {
    if (this.shards.has(shardId)) {
      return;
    }

    this.shards.add(shardId);

    // Add virtual nodes
    for (let i = 0; i < this.virtualNodesPerShard; i++) {
      const virtualNodeKey = `${shardId}:${i}`;
      const hash = this.hash(virtualNodeKey);
      this.hashRing.set(hash, shardId);
    }

    // Update sorted hashes
    this.sortedHashes = Array.from(this.hashRing.keys()).sort((a, b) => a - b);
  }

  removeShard(shardId: string): void {
    if (!this.shards.has(shardId)) {
      return;
    }

    this.shards.delete(shardId);

    // Remove virtual nodes
    const hashesToRemove: number[] = [];
    for (const [hash, shard] of this.hashRing.entries()) {
      if (shard === shardId) {
        hashesToRemove.push(hash);
      }
    }

    hashesToRemove.forEach(hash => this.hashRing.delete(hash));

    // Update sorted hashes
    this.sortedHashes = Array.from(this.hashRing.keys()).sort((a, b) => a - b);
  }

  getShardCount(): number {
    return this.shards.size;
  }

  rebalance(): Map<string, string[]> {
    const migration = new Map<string, string[]>();

    // In consistent hashing, rebalancing happens automatically
    // when shards are added or removed through virtual nodes
    // This method returns an empty migration map as no manual
    // rebalancing is needed

    for (const shard of this.shards) {
      migration.set(shard, []);
    }

    return migration;
  }

  getDistributionStats(ports: number[]): ShardDistribution {
    const shardCounts = new Map<string, number>();

    // Initialize counts
    for (const shard of this.shards) {
      shardCounts.set(shard, 0);
    }

    // Count ports per shard
    for (const port of ports) {
      const shard = this.getShardForPort(port);
      shardCounts.set(shard, (shardCounts.get(shard) || 0) + 1);
    }

    const totalPorts = ports.length;
    const averagePerShard = totalPorts / this.shards.size;

    // Calculate standard deviation
    const counts = Array.from(shardCounts.values());
    const variance = counts.reduce((sum, count) => {
      return sum + Math.pow(count - averagePerShard, 2);
    }, 0) / counts.length;
    const standardDeviation = Math.sqrt(variance);

    // Calculate balance (0-1, where 1 is perfectly balanced)
    const maxDeviation = averagePerShard;
    const balance = maxDeviation > 0
      ? Math.max(0, 1 - (standardDeviation / maxDeviation))
      : 1;

    return {
      shards: shardCounts,
      totalPorts,
      averagePerShard,
      standardDeviation,
      balance
    };
  }

  /**
   * FNV-1a hash function
   * Fast and provides good distribution
   */
  private hash(key: string): number {
    let hash = 2166136261; // FNV offset basis

    for (let i = 0; i < key.length; i++) {
      hash ^= key.charCodeAt(i);
      hash = this.multiplyFNV(hash, 16777619); // FNV prime
    }

    return hash >>> 0; // Convert to unsigned 32-bit integer
  }

  private multiplyFNV(a: number, b: number): number {
    // Handle 32-bit multiplication with overflow
    const ah = (a >>> 16) & 0xffff;
    const al = a & 0xffff;
    const bh = (b >>> 16) & 0xffff;
    const bl = b & 0xffff;

    const high = ((ah * bl) + (al * bh)) & 0xffff;
    const low = al * bl;

    return ((high << 16) | (low & 0xffff)) >>> 0;
  }

  /**
   * Get the position of a port on the hash ring (for debugging/visualization)
   */
  getHashRingPosition(port: number): number {
    return this.hash(port.toString());
  }

  /**
   * Get hash ring statistics
   */
  getHashRingStats(): {
    totalVirtualNodes: number;
    virtualNodesPerShard: number;
    averageVirtualNodesPerShard: number;
  } {
    return {
      totalVirtualNodes: this.hashRing.size,
      virtualNodesPerShard: this.virtualNodesPerShard,
      averageVirtualNodesPerShard: this.hashRing.size / this.shards.size
    };
  }
}

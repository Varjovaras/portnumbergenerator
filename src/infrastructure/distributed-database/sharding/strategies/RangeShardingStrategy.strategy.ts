import { IShardingStrategy, ShardDistribution } from '../interfaces/IShardingStrategy.interface.js';

/**
 * Range-Based Sharding Strategy
 *
 * Divides the port space into contiguous ranges assigned to different shards.
 * Simple and predictable, but can lead to hotspots if certain ranges are accessed more frequently.
 */
export class RangeShardingStrategy implements IShardingStrategy {
  private shards: string[] = [];
  private ranges: Map<string, PortRange> = new Map();
  private readonly minPort: number = 0;
  private readonly maxPort: number = 65535;

  constructor(shards: string[] = []) {
    shards.forEach(shard => this.addShard(shard));
  }

  getShardForPort(port: number): string {
    if (this.shards.length === 0) {
      throw new Error('No shards available');
    }

    this.validatePort(port);

    for (const [shardId, range] of this.ranges.entries()) {
      if (port >= range.start && port <= range.end) {
        return shardId;
      }
    }

    throw new Error(`No shard found for port ${port}`);
  }

  getShardForKey(key: string): string {
    // For key-based sharding, hash the key to a port number
    const hash = this.hashKey(key);
    const port = this.minPort + (hash % (this.maxPort - this.minPort + 1));
    return this.getShardForPort(port);
  }

  getShards(): string[] {
    return [...this.shards];
  }

  addShard(shardId: string): void {
    if (this.shards.includes(shardId)) {
      return;
    }

    this.shards.push(shardId);
    this.recalculateRanges();
  }

  removeShard(shardId: string): void {
    const index = this.shards.indexOf(shardId);
    if (index === -1) {
      return;
    }

    this.shards.splice(index, 1);
    this.ranges.delete(shardId);
    this.recalculateRanges();
  }

  getShardCount(): number {
    return this.shards.length;
  }

  rebalance(): Map<string, string[]> {
    const oldRanges = new Map(this.ranges);
    this.recalculateRanges();

    const migration = new Map<string, string[]>();

    // Determine which ranges moved between shards
    for (const [newShardId, newRange] of this.ranges.entries()) {
      const moves: string[] = [];

      for (const [oldShardId, oldRange] of oldRanges.entries()) {
        if (oldShardId === newShardId) {
          continue;
        }

        // Check for overlap
        const overlapStart = Math.max(newRange.start, oldRange.start);
        const overlapEnd = Math.min(newRange.end, oldRange.end);

        if (overlapStart <= overlapEnd) {
          moves.push(`${overlapStart}-${overlapEnd} from ${oldShardId}`);
        }
      }

      migration.set(newShardId, moves);
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
      try {
        const shard = this.getShardForPort(port);
        shardCounts.set(shard, (shardCounts.get(shard) || 0) + 1);
      } catch {
        // Port not in any range, skip it
      }
    }

    const totalPorts = ports.length;
    const averagePerShard = totalPorts / this.shards.length;

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
   * Recalculate port ranges for all shards
   * Divides the port space evenly among shards
   */
  private recalculateRanges(): void {
    this.ranges.clear();

    if (this.shards.length === 0) {
      return;
    }

    const totalPorts = this.maxPort - this.minPort + 1;
    const portsPerShard = Math.floor(totalPorts / this.shards.length);
    const remainder = totalPorts % this.shards.length;

    let currentStart = this.minPort;

    for (let i = 0; i < this.shards.length; i++) {
      const shardId = this.shards[i];
      const extraPort = i < remainder ? 1 : 0;
      const rangeSize = portsPerShard + extraPort;
      const currentEnd = currentStart + rangeSize - 1;

      this.ranges.set(shardId, {
        start: currentStart,
        end: currentEnd,
        size: rangeSize
      });

      currentStart = currentEnd + 1;
    }
  }

  /**
   * Get the range assigned to a specific shard
   */
  getShardRange(shardId: string): PortRange | undefined {
    return this.ranges.get(shardId);
  }

  /**
   * Get all shard ranges
   */
  getAllRanges(): Map<string, PortRange> {
    return new Map(this.ranges);
  }

  /**
   * Set custom ranges for shards (advanced usage)
   */
  setCustomRanges(ranges: Map<string, PortRange>): void {
    this.ranges.clear();
    this.shards = [];

    for (const [shardId, range] of ranges.entries()) {
      this.validatePort(range.start);
      this.validatePort(range.end);

      if (range.start > range.end) {
        throw new Error(`Invalid range for shard ${shardId}: start > end`);
      }

      this.shards.push(shardId);
      this.ranges.set(shardId, range);
    }

    // Validate no overlaps
    this.validateNoOverlaps();
  }

  /**
   * Validate that port ranges don't overlap
   */
  private validateNoOverlaps(): void {
    const rangeArray = Array.from(this.ranges.entries());

    for (let i = 0; i < rangeArray.length; i++) {
      const [shardId1, range1] = rangeArray[i];

      for (let j = i + 1; j < rangeArray.length; j++) {
        const [shardId2, range2] = rangeArray[j];

        const overlaps = !(range1.end < range2.start || range2.end < range1.start);

        if (overlaps) {
          throw new Error(
            `Overlapping ranges detected: ${shardId1} [${range1.start}-${range1.end}] ` +
            `and ${shardId2} [${range2.start}-${range2.end}]`
          );
        }
      }
    }
  }

  /**
   * Get statistics about range distribution
   */
  getRangeStats(): {
    totalRangeSize: number;
    averageRangeSize: number;
    minRangeSize: number;
    maxRangeSize: number;
    rangeImbalance: number;
  } {
    if (this.ranges.size === 0) {
      return {
        totalRangeSize: 0,
        averageRangeSize: 0,
        minRangeSize: 0,
        maxRangeSize: 0,
        rangeImbalance: 0
      };
    }

    const sizes = Array.from(this.ranges.values()).map(r => r.size);
    const totalSize = sizes.reduce((sum, size) => sum + size, 0);
    const avgSize = totalSize / sizes.length;
    const minSize = Math.min(...sizes);
    const maxSize = Math.max(...sizes);
    const imbalance = avgSize > 0 ? (maxSize - minSize) / avgSize : 0;

    return {
      totalRangeSize: totalSize,
      averageRangeSize: avgSize,
      minRangeSize: minSize,
      maxRangeSize: maxSize,
      rangeImbalance: imbalance
    };
  }

  private validatePort(port: number): void {
    if (!Number.isInteger(port) || port < this.minPort || port > this.maxPort) {
      throw new Error(
        `Invalid port number: ${port}. Must be between ${this.minPort} and ${this.maxPort}.`
      );
    }
  }

  private hashKey(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

interface PortRange {
  start: number;
  end: number;
  size: number;
}

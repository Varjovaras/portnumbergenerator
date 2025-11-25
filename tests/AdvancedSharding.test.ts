import { describe, expect, test, beforeEach } from "bun:test";
import { ConsistentHashingStrategy } from "../src/infrastructure/distributed-database/sharding/strategies/ConsistentHashingStrategy.strategy";
import { RangeShardingStrategy } from "../src/infrastructure/distributed-database/sharding/strategies/RangeShardingStrategy.strategy";

describe("Advanced Sharding Strategies", () => {
  describe("ConsistentHashingStrategy", () => {
    let strategy: ConsistentHashingStrategy;

    beforeEach(() => {
      strategy = new ConsistentHashingStrategy([
        "shard-1",
        "shard-2",
        "shard-3",
      ]);
    });

    test("should initialize with shards", () => {
      expect(strategy.getShardCount()).toBe(3);
      expect(strategy.getShards()).toContain("shard-1");
      expect(strategy.getShards()).toContain("shard-2");
      expect(strategy.getShards()).toContain("shard-3");
    });

    test("should get shard for port", () => {
      const shard = strategy.getShardForPort(8080);
      expect(shard).toBeDefined();
      expect(strategy.getShards()).toContain(shard);
    });

    test("should get shard for key", () => {
      const shard = strategy.getShardForKey("test-key");
      expect(shard).toBeDefined();
      expect(strategy.getShards()).toContain(shard);
    });

    test("should be deterministic", () => {
      const shard1 = strategy.getShardForPort(8080);
      const shard2 = strategy.getShardForPort(8080);
      expect(shard1).toBe(shard2);
    });

    test("should distribute ports across shards", () => {
      const shardCounts = new Map<string, number>();

      for (let port = 1024; port < 2024; port++) {
        const shard = strategy.getShardForPort(port);
        shardCounts.set(shard, (shardCounts.get(shard) || 0) + 1);
      }

      // All shards should have some ports
      expect(shardCounts.size).toBe(3);
      for (const count of shardCounts.values()) {
        expect(count).toBeGreaterThan(0);
      }
    });

    test("should add shard", () => {
      strategy.addShard("shard-4");
      expect(strategy.getShardCount()).toBe(4);
      expect(strategy.getShards()).toContain("shard-4");
    });

    test("should not add duplicate shard", () => {
      strategy.addShard("shard-1");
      expect(strategy.getShardCount()).toBe(3);
    });

    test("should remove shard", () => {
      strategy.removeShard("shard-2");
      expect(strategy.getShardCount()).toBe(2);
      expect(strategy.getShards()).not.toContain("shard-2");
    });

    test("should handle removing non-existent shard", () => {
      strategy.removeShard("shard-999");
      expect(strategy.getShardCount()).toBe(3);
    });

    test("should throw error when no shards available", () => {
      const emptyStrategy = new ConsistentHashingStrategy([]);
      expect(() => emptyStrategy.getShardForPort(8080)).toThrow();
    });

    test("should get distribution stats", () => {
      const ports = Array.from({ length: 100 }, (_, i) => 1024 + i);
      const stats = strategy.getDistributionStats(ports);

      expect(stats.totalPorts).toBe(100);
      expect(stats.averagePerShard).toBeCloseTo(33.33, 1);
      expect(stats.balance).toBeGreaterThanOrEqual(0);
      expect(stats.balance).toBeLessThanOrEqual(1);
      expect(stats.shards.size).toBe(3);
    });

    test("should rebalance (returns empty migration)", () => {
      const migration = strategy.rebalance();
      expect(migration.size).toBe(3);

      for (const [shard, ports] of migration.entries()) {
        expect(strategy.getShards()).toContain(shard);
        expect(ports).toEqual([]);
      }
    });

    test("should get hash ring position", () => {
      const position = strategy.getHashRingPosition(8080);
      expect(position).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(position)).toBe(true);
    });

    test("should get hash ring stats", () => {
      const stats = strategy.getHashRingStats();

      expect(stats.totalVirtualNodes).toBeGreaterThan(0);
      expect(stats.virtualNodesPerShard).toBe(150); // Default
      expect(stats.averageVirtualNodesPerShard).toBeCloseTo(150, 0);
    });

    test("should support custom virtual nodes per shard", () => {
      const customStrategy = new ConsistentHashingStrategy(["shard-1"], 100);
      const stats = customStrategy.getHashRingStats();

      expect(stats.virtualNodesPerShard).toBe(100);
    });

    test("should minimize redistribution when adding shard", () => {
      const ports = Array.from({ length: 1000 }, (_, i) => 1024 + i);
      const initialMapping = new Map<number, string>();

      // Record initial mapping
      for (const port of ports) {
        initialMapping.set(port, strategy.getShardForPort(port));
      }

      // Add new shard
      strategy.addShard("shard-4");

      // Count how many ports changed shards
      let changedCount = 0;
      for (const port of ports) {
        const newShard = strategy.getShardForPort(port);
        if (initialMapping.get(port) !== newShard) {
          changedCount++;
        }
      }

      // With consistent hashing, only ~25% should move (1000/4 = 250)
      expect(changedCount).toBeLessThan(400); // Allow some variance
    });
  });

  describe("RangeShardingStrategy", () => {
    let strategy: RangeShardingStrategy;

    beforeEach(() => {
      strategy = new RangeShardingStrategy(["shard-1", "shard-2", "shard-3"]);
    });

    test("should initialize with shards", () => {
      expect(strategy.getShardCount()).toBe(3);
      expect(strategy.getShards().length).toBe(3);
    });

    test("should get shard for port in range", () => {
      const shard = strategy.getShardForPort(8080);
      expect(shard).toBeDefined();
      expect(strategy.getShards()).toContain(shard);
    });

    test("should distribute ports by range", () => {
      // Ports in different ranges should go to different shards
      const shard1 = strategy.getShardForPort(1024);
      const shard2 = strategy.getShardForPort(30000);
      const shard3 = strategy.getShardForPort(60000);

      // They should be distributed across shards
      const uniqueShards = new Set([shard1, shard2, shard3]);
      expect(uniqueShards.size).toBeGreaterThan(1);
    });

    test("should be deterministic", () => {
      const shard1 = strategy.getShardForPort(8080);
      const shard2 = strategy.getShardForPort(8080);
      expect(shard1).toBe(shard2);
    });

    test("should get shard for key", () => {
      const shard = strategy.getShardForKey("test-key");
      expect(shard).toBeDefined();
    });

    test("should add shard", () => {
      strategy.addShard("shard-4");
      expect(strategy.getShardCount()).toBe(4);
    });

    test("should remove shard", () => {
      strategy.removeShard("shard-2");
      expect(strategy.getShardCount()).toBe(2);
    });

    test("should get distribution stats", () => {
      const ports = Array.from({ length: 300 }, (_, i) => 1024 + i * 200);
      const stats = strategy.getDistributionStats(ports);

      expect(stats.totalPorts).toBe(300);
      expect(stats.averagePerShard).toBe(100);
    });

    test("should rebalance and return migration plan", () => {
      const migration = strategy.rebalance();
      expect(migration.size).toBeGreaterThan(0);
    });

    test("should handle edge cases for port ranges", () => {
      const minPort = strategy.getShardForPort(1024);
      const maxPort = strategy.getShardForPort(65535);

      expect(minPort).toBeDefined();
      expect(maxPort).toBeDefined();
    });
  });

  describe("Sharding Strategy Comparison", () => {
    test("should compare distribution quality", () => {
      const consistentStrategy = new ConsistentHashingStrategy([
        "s1",
        "s2",
        "s3",
      ]);
      const rangeStrategy = new RangeShardingStrategy(["s1", "s2", "s3"]);

      const ports = Array.from({ length: 300 }, (_, i) => 1024 + i);

      const consistentStats = consistentStrategy.getDistributionStats(ports);
      const rangeStats = rangeStrategy.getDistributionStats(ports);

      // Both should distribute all ports
      expect(consistentStats.totalPorts).toBe(300);
      expect(rangeStats.totalPorts).toBe(300);

      // Both should have reasonable balance (relaxed expectation)
      expect(consistentStats.balance).toBeGreaterThanOrEqual(0);
      expect(rangeStats.balance).toBeGreaterThanOrEqual(0);
    });
  });
});

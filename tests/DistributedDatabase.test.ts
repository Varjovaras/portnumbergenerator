import { describe, expect, test, beforeEach } from "bun:test";
import { DistributedDatabase } from "../src/infrastructure/distributed-database/database/DistributedDatabase.class";
import { HashShardStrategy } from "../src/infrastructure/distributed-database/strategies/implementations/HashShardStrategy.class";
import { RoundRobinShardStrategy } from "../src/infrastructure/distributed-database/strategies/implementations/RoundRobinShardStrategy.class";
import { VirtualDiskShard } from "../src/infrastructure/distributed-database/shards/implementations/VirtualDiskShard.class";

describe("Distributed Database System", () => {
  describe("VirtualDiskShard", () => {
    let shard: VirtualDiskShard;

    beforeEach(() => {
      shard = new VirtualDiskShard("test-shard");
    });

    test("should store and retrieve data", () => {
      shard.store("key1", "value1");
      expect(shard.retrieve("key1")).toBe("value1");
    });

    test("should return undefined for missing keys", () => {
      expect(shard.retrieve("missing")).toBeUndefined();
    });

    test("should check if key exists", () => {
      shard.store("key1", "value1");
      expect(shard.has("key1")).toBe(true);
      expect(shard.has("missing")).toBe(false);
    });

    test("should delete data", () => {
      shard.store("key1", "value1");
      expect(shard.delete("key1")).toBe(true);
      expect(shard.retrieve("key1")).toBeUndefined();
      expect(shard.delete("missing")).toBe(false);
    });

    test("should get all data", () => {
      shard.store("key1", "value1");
      shard.store("key2", "value2");
      const all = shard.getAll();
      expect(all).toContain("value1");
      expect(all).toContain("value2");
      expect(all.length).toBe(2);
    });

    test("should clear data", () => {
      shard.store("key1", "value1");
      shard.clear();
      expect(shard.size()).toBe(0);
      expect(shard.getAll().length).toBe(0);
    });

    test("should track stats", () => {
      shard.store("key1", "value1"); // 1 op
      shard.retrieve("key1"); // 2 ops
      const stats = shard.getStats();
      expect(stats.id).toBe("test-shard");
      expect(stats.size).toBe(1);
      expect(stats.ioOperations).toBe(2);
    });
  });

  describe("HashShardStrategy", () => {
    let strategy: HashShardStrategy;

    beforeEach(() => {
      strategy = new HashShardStrategy();
    });

    test("should be deterministic", () => {
      const shard1 = strategy.getShardId("key1", 5);
      const shard2 = strategy.getShardId("key1", 5);
      expect(shard1).toBe(shard2);
    });

    test("should distribute keys within range", () => {
      const shardCount = 3;
      for (let i = 0; i < 100; i++) {
        const shardId = strategy.getShardId(`key${i}`, shardCount);
        expect(shardId).toBeGreaterThanOrEqual(0);
        expect(shardId).toBeLessThan(shardCount);
      }
    });

    test("should handle empty key", () => {
      expect(strategy.getShardId("", 5)).toBe(0);
    });

    test("should track stats", () => {
      strategy.getShardId("key1", 5);
      expect(strategy.getHashCallCount()).toBe(1);
      expect(strategy.getAverageKeyLength()).toBe(4);
    });
  });

  describe("RoundRobinShardStrategy", () => {
    let strategy: RoundRobinShardStrategy;

    beforeEach(() => {
      strategy = new RoundRobinShardStrategy();
    });

    test("should distribute sequentially", () => {
      const shardCount = 3;
      expect(strategy.getShardId("a", shardCount)).toBe(0);
      expect(strategy.getShardId("b", shardCount)).toBe(1);
      expect(strategy.getShardId("c", shardCount)).toBe(2);
      expect(strategy.getShardId("d", shardCount)).toBe(0); // Wrap
    });

    test("should ignore keys", () => {
      const shardCount = 2;
      expect(strategy.getShardId("key1", shardCount)).toBe(0);
      expect(strategy.getShardId("key1", shardCount)).toBe(1); // Same key, different shard
    });

    test("should reset", () => {
      strategy.getShardId("a", 3);
      strategy.reset();
      expect(strategy.getCounter()).toBe(0);
      expect(strategy.getShardId("b", 3)).toBe(0);
    });
  });

  describe("DistributedDatabase", () => {
    let db: DistributedDatabase;

    beforeEach(() => {
      db = new DistributedDatabase(3, new HashShardStrategy());
    });

    test("should initialize with correct shard count", () => {
      expect(db.getShardCount()).toBe(3);
    });

    test("should insert and query data", () => {
      db.insert("user:1", { name: "Alice" });
      const result = db.query("user:1");
      expect(result).toEqual({ name: "Alice" });
    });

    test("should query all data from all shards", () => {
      // These keys should ideally map to different shards, but even if they don't, queryAll gets everything
      db.insert("key1", 1);
      db.insert("key2", 2);
      db.insert("key3", 3);

      const all = db.queryAll();
      expect(all.length).toBe(3);
      expect(all).toContain(1);
      expect(all).toContain(2);
      expect(all).toContain(3);
    });

    test("should switch strategies", () => {
      // Note: Switching strategies breaks existing key lookups, but we test the mechanism
      db.switchToHashStrategy();
      expect(db.getStrategyName()).toBe("HashShardStrategy");
    });

    test("should clear all shards", () => {
      db.insert("key1", 1);
      db.clear();
      expect(db.getTotalRecords()).toBe(0);
    });

    test("should check balance", () => {
      // Empty db is balanced
      expect(db.isBalanced()).toBe(true);
    });

    test("should export data", () => {
      db.insert("key1", "value1");
      const json = db.export();
      expect(json).toContain("value1");
    });
  });
});

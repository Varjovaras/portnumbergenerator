import { describe, expect, test, beforeEach } from "bun:test";
import { MemoryStorageAdapter } from "../src/infrastructure/data-persistence/adapters/MemoryStorageAdapter.adapter";

describe("Data Persistence Layer", () => {
  describe("MemoryStorageAdapter", () => {
    let adapter: MemoryStorageAdapter;

    beforeEach(async () => {
      adapter = new MemoryStorageAdapter();
      await adapter.connect();
    });

    test("should connect successfully", async () => {
      const newAdapter = new MemoryStorageAdapter();
      await newAdapter.connect();
      expect(newAdapter.isConnected()).toBe(true);
    });

    test("should disconnect successfully", async () => {
      await adapter.disconnect();
      expect(adapter.isConnected()).toBe(false);
    });

    test("should reserve a port", async () => {
      const result = await adapter.reservePort(8080);
      expect(result).toBe(true);

      const isReserved = await adapter.isPortReserved(8080);
      expect(isReserved).toBe(true);
    });

    test("should not reserve already reserved port", async () => {
      await adapter.reservePort(8080);
      const result = await adapter.reservePort(8080);
      expect(result).toBe(false);
    });

    test("should reserve port with metadata", async () => {
      const metadata = { service: "web", environment: "production" };
      await adapter.reservePort(3000, metadata);

      const retrievedMetadata = await adapter.getPortMetadata(3000);
      expect(retrievedMetadata).toEqual(metadata);
    });

    test("should release a reserved port", async () => {
      await adapter.reservePort(8080);
      const result = await adapter.releasePort(8080);

      expect(result).toBe(true);
      expect(await adapter.isPortReserved(8080)).toBe(false);
    });

    test("should not release unreserved port", async () => {
      const result = await adapter.releasePort(9999);
      expect(result).toBe(false);
    });

    test("should get all reserved ports", async () => {
      await adapter.reservePort(8080);
      await adapter.reservePort(3000);
      await adapter.reservePort(5000);

      const ports = await adapter.getReservedPorts();
      expect(ports).toEqual([3000, 5000, 8080]); // Sorted
    });

    test("should get reservation count", async () => {
      expect(await adapter.getReservationCount()).toBe(0);

      await adapter.reservePort(8080);
      await adapter.reservePort(3000);

      expect(await adapter.getReservationCount()).toBe(2);
    });

    test("should clear all reservations", async () => {
      await adapter.reservePort(8080);
      await adapter.reservePort(3000);

      await adapter.clearAllReservations();

      expect(await adapter.getReservationCount()).toBe(0);
    });

    test("should validate port numbers", async () => {
      // Port 0 is valid in the range 0-65535
      await expect(adapter.reservePort(70000)).rejects.toThrow();
      await expect(adapter.reservePort(-1)).rejects.toThrow();
      await expect(adapter.reservePort(999999)).rejects.toThrow();
    });

    test("should get storage stats", async () => {
      await adapter.reservePort(8080);
      await adapter.reservePort(3000);

      const stats = await adapter.getStorageStats();

      expect(stats.totalReservations).toBe(2);
      expect(stats.connectionStatus).toBe("connected");
      expect(stats.memoryUsage).toBeGreaterThan(0);
    });

    test("should get reservation details", async () => {
      const metadata = { service: "api" };
      await adapter.reservePort(8080, metadata);

      const details = adapter.getReservationDetails(8080);

      expect(details).toBeDefined();
      expect(details?.port).toBe(8080);
      expect(details?.metadata).toEqual(metadata);
      expect(details?.reservedAt).toBeGreaterThan(0);
    });

    test("should get all reservations", async () => {
      await adapter.reservePort(8080, { service: "web" });
      await adapter.reservePort(3000, { service: "api" });

      const reservations = adapter.getAllReservations();

      expect(reservations.length).toBe(2);
      expect(reservations.some((r) => r.port === 8080)).toBe(true);
      expect(reservations.some((r) => r.port === 3000)).toBe(true);
    });

    test("should set reservation expiry", async () => {
      await adapter.reservePort(8080);
      const expiryTime = Date.now() + 3600000;

      const result = adapter.setReservationExpiry(8080, expiryTime);
      expect(result).toBe(true);

      const details = adapter.getReservationDetails(8080);
      expect(details?.expiresAt).toBe(expiryTime);
    });

    test("should not set expiry for non-existent reservation", async () => {
      const result = adapter.setReservationExpiry(9999, Date.now());
      expect(result).toBe(false);
    });

    test("should update metadata", async () => {
      await adapter.reservePort(8080, { service: "web" });

      const result = adapter.updateMetadata(8080, { version: "1.0" });
      expect(result).toBe(true);

      const metadata = await adapter.getPortMetadata(8080);
      expect(metadata).toEqual({ service: "web", version: "1.0" });
    });

    test("should clear expired reservations", async () => {
      // Reserve ports with different expiry times
      await adapter.reservePort(8080);
      await adapter.reservePort(3000);

      // Set one to expire in the past
      const pastTime = Date.now() - 1000;
      adapter.setReservationExpiry(8080, pastTime);

      const clearedCount = await adapter.clearExpiredReservations(3600000);

      expect(clearedCount).toBe(1);
      expect(await adapter.isPortReserved(8080)).toBe(false);
      expect(await adapter.isPortReserved(3000)).toBe(true);
    });

    test("should handle multiple operations", async () => {
      // Complex scenario
      await adapter.reservePort(8080, { service: "web" });
      await adapter.reservePort(3000, { service: "api" });
      await adapter.reservePort(5000, { service: "db" });

      expect(await adapter.getReservationCount()).toBe(3);

      await adapter.releasePort(3000);
      expect(await adapter.getReservationCount()).toBe(2);

      adapter.updateMetadata(8080, { version: "2.0" });
      const metadata = await adapter.getPortMetadata(8080);
      expect(metadata?.version).toBe("2.0");

      await adapter.clearAllReservations();
      expect(await adapter.getReservationCount()).toBe(0);
    });

    test("should return null for metadata of unreserved port", async () => {
      const metadata = await adapter.getPortMetadata(9999);
      expect(metadata).toBeNull();
    });

    test("should track last operation", async () => {
      await adapter.reservePort(8080);
      const stats1 = await adapter.getStorageStats();
      // getStorageStats calls getReservationCount internally
      expect(stats1.lastOperation).toBe("getReservationCount");
    });
  });
});

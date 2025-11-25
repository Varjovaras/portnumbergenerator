import { describe, expect, test, beforeEach } from "bun:test";
import { PortRequestedEvent } from "../src/infrastructure/event-sourcing/events/implementations/PortRequestedEvent.class";
import { PortCalculatedEvent } from "../src/infrastructure/event-sourcing/events/implementations/PortCalculatedEvent.class";
import { PortValidatedEvent } from "../src/infrastructure/event-sourcing/events/implementations/PortValidatedEvent.class";
import { PortDeliveredEvent } from "../src/infrastructure/event-sourcing/events/implementations/PortDeliveredEvent.class";
import { PortContext } from "../src/core/domain/context/implementations/PortContext.implementation";

describe("Event Sourcing Events", () => {
  describe("PortRequestedEvent", () => {
    let context: PortContext;

    beforeEach(() => {
      context = new PortContext("test-requestor");
    });

    test("should create event with aggregate ID and context", () => {
      const event = new PortRequestedEvent("agg-123", context);

      expect(event.aggregateId).toBe("agg-123");
      expect(event.context).toBe(context);
      expect(event.eventId).toBeDefined();
      expect(event.timestamp).toBeGreaterThan(0);
    });

    test("should have correct event type", () => {
      const event = new PortRequestedEvent("agg-123", context);
      expect(event.getEventType()).toBe("PortRequestedEvent");
    });

    test("should serialize to JSON", () => {
      const event = new PortRequestedEvent("agg-123", context);
      const json = event.toJSON();

      expect(json).toContain("aggregateId");
      expect(json).toContain("agg-123");
    });

    test("should have age that increases over time", async () => {
      const event = new PortRequestedEvent("agg-123", context);
      const age1 = event.getAge();

      await new Promise((resolve) => setTimeout(resolve, 10));

      const age2 = event.getAge();
      expect(age2).toBeGreaterThan(age1);
    });

    test("should compare events by timestamp", () => {
      const event1 = new PortRequestedEvent("agg-1", context);
      const event2 = new PortRequestedEvent("agg-2", context);

      expect(event1.compareTo(event2)).toBeLessThanOrEqual(0);
    });

    test("should check if belongs to aggregate", () => {
      const event = new PortRequestedEvent("agg-123", context);

      expect(event.belongsToAggregate("agg-123")).toBe(true);
      expect(event.belongsToAggregate("agg-456")).toBe(false);
    });

    test("should get metadata", () => {
      const event = new PortRequestedEvent("agg-123", context);
      const metadata = event.getMetadata();

      expect(metadata.aggregateId).toBe("agg-123");
      expect(metadata.eventId).toBeDefined();
      expect(metadata.timestamp).toBeGreaterThan(0);
    });
  });

  describe("PortCalculatedEvent", () => {
    test("should create event with port number", () => {
      const event = new PortCalculatedEvent("agg-123", 6969);

      expect(event.aggregateId).toBe("agg-123");
      expect(event.port).toBe(6969);
      expect(event.getEventType()).toBe("PortCalculatedEvent");
    });

    test("should handle different port values", () => {
      const event1 = new PortCalculatedEvent("agg-1", 1024);
      const event2 = new PortCalculatedEvent("agg-2", 65535);
      const event3 = new PortCalculatedEvent("agg-3", 42069);

      expect(event1.port).toBe(1024);
      expect(event2.port).toBe(65535);
      expect(event3.port).toBe(42069);
    });

    test("should serialize with port number", () => {
      const event = new PortCalculatedEvent("agg-123", 8080);
      const json = event.toJSON();

      expect(json).toContain("8080");
      expect(json).toContain("agg-123");
    });
  });

  describe("PortValidatedEvent", () => {
    test("should create event with validation result", () => {
      const event = new PortValidatedEvent("agg-123", true);

      expect(event.aggregateId).toBe("agg-123");
      expect(event.isValid).toBe(true);
      expect(event.getEventType()).toBe("PortValidatedEvent");
    });

    test("should handle invalid validation", () => {
      const event = new PortValidatedEvent("agg-123", false);
      expect(event.isValid).toBe(false);
    });

    test("should serialize with validation status", () => {
      const event = new PortValidatedEvent("agg-123", true);
      const json = event.toJSON();

      expect(json).toContain("agg-123");
    });
  });

  describe("PortDeliveredEvent", () => {
    test("should create event with delivered port", () => {
      const event = new PortDeliveredEvent("agg-123", 3000);

      expect(event.aggregateId).toBe("agg-123");
      expect(event.port).toBe(3000);
      expect(event.getEventType()).toBe("PortDeliveredEvent");
    });

    test("should handle various port numbers", () => {
      const ports = [1024, 8080, 3000, 6969, 42069];

      for (const port of ports) {
        const event = new PortDeliveredEvent("agg-test", port);
        expect(event.port).toBe(port);
      }
    });
  });

  describe("Event Base Class Features", () => {
    test("should support ISO string conversion", () => {
      const event = new PortCalculatedEvent("agg-123", 8080);
      const isoString = event.toISOString();

      expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test("should calculate age in seconds", () => {
      const event = new PortCalculatedEvent("agg-123", 8080);
      const ageInSeconds = event.getAgeInSeconds();

      expect(ageInSeconds).toBeGreaterThanOrEqual(0);
      expect(ageInSeconds).toBeLessThan(1); // Should be very recent
    });

    test("should check expiration", async () => {
      const event = new PortCalculatedEvent("agg-123", 8080);

      // Should not be expired with a long TTL
      expect(event.isExpired(10000)).toBe(false);

      // Wait a bit and check with very short TTL
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(event.isExpired(1)).toBe(true); // 1ms TTL, should be expired
    });

    test("should compare events with isBefore", async () => {
      const event1 = new PortCalculatedEvent("agg-1", 1000);
      await new Promise((resolve) => setTimeout(resolve, 5));
      const event2 = new PortCalculatedEvent("agg-2", 2000);

      expect(event1.isBefore(event2)).toBe(true);
      expect(event2.isBefore(event1)).toBe(false);
    });

    test("should compare events with isAfter", async () => {
      const event1 = new PortCalculatedEvent("agg-1", 1000);
      await new Promise((resolve) => setTimeout(resolve, 5));
      const event2 = new PortCalculatedEvent("agg-2", 2000);

      expect(event2.isAfter(event1)).toBe(true);
      expect(event1.isAfter(event2)).toBe(false);
    });

    test("should have string representation", () => {
      const event = new PortCalculatedEvent("agg-123", 8080);
      const str = event.toString();

      expect(str).toContain("PortCalculatedEvent");
      expect(str).toContain("agg-123");
    });
  });
});

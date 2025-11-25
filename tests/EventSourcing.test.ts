import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { EventStore } from "../src/infrastructure/event-sourcing/store/EventStore.class";
import { PortAggregate } from "../src/infrastructure/event-sourcing/aggregates/PortAggregate.class";
import {
  PortRequestedEvent,
  PortCalculatedEvent,
  PortValidatedEvent,
  PortDeliveredEvent,
} from "../src/infrastructure/event-sourcing/events";
import { PortContext } from "../src/core/domain/context/implementations/PortContext.implementation";

describe("Event Sourcing System", () => {
  // Helper to create a dummy context
  const createContext = () => new PortContext("test-requestor");

  describe("EventStore", () => {
    beforeEach(() => {
      EventStore.resetInstance();
    });

    test("should be a singleton", () => {
      const store1 = EventStore.getInstance();
      const store2 = EventStore.getInstance();
      expect(store1).toBe(store2);
    });

    test("should append and retrieve events", () => {
      const store = EventStore.getInstance();
      const aggId = "agg-1";
      const event = new PortRequestedEvent(aggId, createContext());

      store.append(event);

      const events = store.getAllEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toEqual(event);
    });

    test("should retrieve events for specific aggregate", () => {
      const store = EventStore.getInstance();
      const agg1 = "agg-1";
      const agg2 = "agg-2";

      store.append(new PortRequestedEvent(agg1, createContext()));
      store.append(new PortRequestedEvent(agg2, createContext()));

      const agg1Events = store.getEventsForAggregate(agg1);
      expect(agg1Events.length).toBe(1);
      expect(agg1Events[0].aggregateId).toBe(agg1);

      const agg2Events = store.getEventsForAggregate(agg2);
      expect(agg2Events.length).toBe(1);
      expect(agg2Events[0].aggregateId).toBe(agg2);
    });

    test("should check if aggregate has events", () => {
      const store = EventStore.getInstance();
      const aggId = "agg-1";

      expect(store.hasEventsForAggregate(aggId)).toBe(false);

      store.append(new PortRequestedEvent(aggId, createContext()));
      expect(store.hasEventsForAggregate(aggId)).toBe(true);
    });

    test("should get total event count", () => {
      const store = EventStore.getInstance();
      expect(store.getEventCount()).toBe(0);

      store.append(new PortRequestedEvent("agg-1", createContext()));
      store.append(new PortRequestedEvent("agg-2", createContext()));

      expect(store.getEventCount()).toBe(2);
    });
  });

  describe("PortAggregate", () => {
    beforeEach(() => {
      EventStore.resetInstance();
    });

    test("should initialize with default state", () => {
      const agg = new PortAggregate("agg-1");
      expect(agg.getId()).toBe("agg-1");
      expect(agg.isRequested()).toBe(false);
      expect(agg.getCalculatedPort()).toBeNull();
      expect(agg.isValidated()).toBe(false);
      expect(agg.isDelivered()).toBe(false);
      expect(agg.isComplete()).toBe(false);
    });

    test("should apply PortRequestedEvent", () => {
      const agg = new PortAggregate("agg-1");
      const event = new PortRequestedEvent("agg-1", createContext());

      agg.apply(event);
      expect(agg.isRequested()).toBe(true);
    });

    test("should apply PortCalculatedEvent", () => {
      const agg = new PortAggregate("agg-1");
      const event = new PortCalculatedEvent("agg-1", 8080);

      agg.apply(event);
      expect(agg.getCalculatedPort()).toBe(8080);
    });

    test("should apply PortValidatedEvent", () => {
      const agg = new PortAggregate("agg-1");
      const event = new PortValidatedEvent("agg-1", true);

      agg.apply(event);
      expect(agg.isValidated()).toBe(true);
    });

    test("should apply PortDeliveredEvent", () => {
      const agg = new PortAggregate("agg-1");
      const event = new PortDeliveredEvent("agg-1", 8080);

      agg.apply(event);
      expect(agg.isDelivered()).toBe(true);
      expect(agg.isComplete()).toBe(true);
    });

    test("should hydrate from EventStore", () => {
      const aggId = "agg-1";
      const store = EventStore.getInstance();

      // Append events to store
      store.append(new PortRequestedEvent(aggId, createContext()));
      store.append(new PortCalculatedEvent(aggId, 8080));
      store.append(new PortValidatedEvent(aggId, true));
      store.append(new PortDeliveredEvent(aggId, 8080));

      // Create fresh aggregate and hydrate
      const agg = new PortAggregate(aggId);
      agg.hydrate();

      expect(agg.isRequested()).toBe(true);
      expect(agg.getCalculatedPort()).toBe(8080);
      expect(agg.isValidated()).toBe(true);
      expect(agg.isDelivered()).toBe(true);
    });
  });
});

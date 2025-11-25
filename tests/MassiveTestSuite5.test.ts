import { describe, expect, test } from "bun:test";
import { EventStore } from "../src/infrastructure/event-sourcing/store/EventStore.class";
import { PortRequestedEvent } from "../src/infrastructure/event-sourcing/events/implementations/PortRequestedEvent.class";
import { PortContext } from "../src/core/domain/context/implementations/PortContext.implementation";

describe("Massive Test Suite 5 - EventStore Exhaustive", () => {
  // Generate 100 tests for EventStore
  for (let i = 0; i < 100; i++) {
    test(`should store and retrieve event - iteration ${i}`, () => {
      EventStore.resetInstance();
      const store = EventStore.getInstance();
      const ctx = new PortContext(`test-${i}`);
      const event = new PortRequestedEvent(`agg-${i}`, ctx);

      store.append(event);
      const events = store.getEventsForAggregate(`agg-${i}`);

      expect(events.length).toBe(1);
    });

    test(`should count events - iteration ${i}`, () => {
      EventStore.resetInstance();
      const store = EventStore.getInstance();
      const ctx = new PortContext("test");

      for (let j = 0; j < (i % 10) + 1; j++) {
        const event = new PortRequestedEvent(`agg-${j}`, ctx);
        store.append(event);
      }

      expect(store.getEventCount()).toBe((i % 10) + 1);
    });
  }
});

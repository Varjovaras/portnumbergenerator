import { describe, expect, test, beforeEach, afterEach, mock } from "bun:test";
import { PortProvisioningSaga } from "../src/application/orchestration/sagas/PortProvisioningSaga.class";
import { PortNumbers } from "../src/application/legacy/PortNumbers.class";
import { PortNumberGenerator } from "../src/application/facades/PortNumberGenerator.class";
import { EventStore } from "../src/infrastructure/event-sourcing/store/EventStore.class";
import { PortContext } from "../src/core/domain/context/implementations/PortContext.implementation";
import type { IPortService } from "../src/application/factories/interfaces/IPortService.interface";

// Mock IPortService
class MockPortService implements IPortService {
  getPort(context: PortContext): number {
    return context.requestor === "frontend" ? 6969 : 42069;
  }
}

describe("Application Layer", () => {
  describe("PortProvisioningSaga", () => {
    let saga: PortProvisioningSaga;
    let mockService: MockPortService;

    beforeEach(() => {
      EventStore.resetInstance();
      mockService = new MockPortService();
      saga = new PortProvisioningSaga(mockService);
    });

    test("should execute successful saga for frontend", () => {
      const context = new PortContext("frontend");
      const port = saga.execute(context);

      expect(port).toBe(6969);

      const events = EventStore.getInstance().getEventsForAggregate(
        context.requestId
      );
      expect(events.length).toBe(4);
      const eventTypes = events.map((e) => e.constructor.name);
      expect(eventTypes).toContain("PortRequestedEvent");
      expect(eventTypes).toContain("PortCalculatedEvent");
      expect(eventTypes).toContain("PortValidatedEvent");
      expect(eventTypes).toContain("PortDeliveredEvent");
    });

    test("should execute successful saga for backend", () => {
      const context = new PortContext("backend");
      const port = saga.execute(context);

      expect(port).toBe(42069);
    });

    test("should fail if validation fails", () => {
      const badService = {
        getPort: () => 99999, // Invalid port > 65535
      } as unknown as IPortService;

      const badSaga = new PortProvisioningSaga(badService);
      const context = new PortContext("test");

      expect(() => badSaga.execute(context)).toThrow();
    });
  });

  describe("PortNumbers (Legacy)", () => {
    let ports: PortNumbers;

    beforeEach(() => {
      ports = new PortNumbers();
    });

    test("should return correct static ports", () => {
      expect(PortNumbers.frontendPortNumber()).toBe(6969);
      expect(PortNumbers.backendPortNumber()).toBe(42069);
    });

    test("should check even/odd correctly", () => {
      expect(ports.isFrontendPortEven()).toBe(false);
      expect(ports.isFrontendPortOdd()).toBe(true);
      expect(ports.isBackendPortEven()).toBe(false);
      expect(ports.isBackendPortOdd()).toBe(true);
    });

    test("should perform math operations", () => {
      expect(ports.getSumOfPorts()).toBe(6969 + 42069);
      expect(ports.getDifferenceOfPorts()).toBe(42069 - 6969);
      expect(ports.getProductOfPorts()).toBe(6969 * 42069);
      expect(ports.getMinPort()).toBe(6969);
      expect(ports.getMaxPort()).toBe(42069);
    });

    test("should convert formats", () => {
      expect(ports.getFrontendPortAsHex()).toBe((6969).toString(16));
      expect(ports.getBackendPortAsBinary()).toBe((42069).toString(2));
    });

    test("should reverse digits", () => {
      expect(ports.getFrontendPortReversed()).toBe("9696");
    });

    test("should calculate digit sums", () => {
      // 6+9+6+9 = 30
      expect(ports.getFrontendPortDigitSum()).toBe(30);
    });
  });

  describe("PortNumberGenerator (Facade)", () => {
    let generator: PortNumberGenerator;

    beforeEach(() => {
      EventStore.resetInstance();
      generator = new PortNumberGenerator();
    });

    test("should get frontend port via getter", () => {
      const port = generator.frontendDevPortGetter;
      expect(port).toBeGreaterThanOrEqual(1024); // Since it uses real VM service
    });

    test("should get backend port via getter", () => {
      const port = generator.backendPortGetter;
      expect(port).toBeGreaterThanOrEqual(1024);
    });

    test("should track events", () => {
      generator.frontendDevPortGetter;
      const count = generator.getEventCount();
      expect(count).toBeGreaterThan(0);
    });

    test("should provide diagnostics", () => {
      const diagnostics = generator.getDiagnostics();
      expect(diagnostics.version).toBeDefined();
      expect(diagnostics.healthy).toBe(true);
    });

    test("should support legacy static methods", () => {
      expect(PortNumberGenerator.frontendPortNumber()).toBe(6969);
    });
  });
});

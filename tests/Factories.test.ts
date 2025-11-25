import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { EnterpriseFactoryProvider } from "../src/application/factories/providers/EnterpriseFactoryProvider.class";
import { EnterpriseFactoryFactory } from "../src/application/factories/implementations/EnterpriseFactoryFactory.class";
import { EnterprisePortServiceFactory } from "../src/application/factories/implementations/EnterprisePortServiceFactory.class";
import { VMPortServiceImpl } from "../src/application/factories/implementations/VMPortServiceImpl.class";
import { PortContext } from "../src/core/domain/context/implementations/PortContext.implementation";

describe("Factory System", () => {
  describe("EnterpriseFactoryProvider", () => {
    beforeEach(() => {
      EnterpriseFactoryProvider.resetInstance();
    });

    test("should be a singleton", () => {
      const provider1 = EnterpriseFactoryProvider.getInstance();
      const provider2 = EnterpriseFactoryProvider.getInstance();
      expect(provider1).toBe(provider2);
    });

    test("should provide a factory", () => {
      const provider = EnterpriseFactoryProvider.getInstance();
      const factory = provider.getFactory();
      expect(factory).toBeInstanceOf(EnterprisePortServiceFactory);
    });

    test("should reset instance", () => {
      const provider1 = EnterpriseFactoryProvider.getInstance();
      EnterpriseFactoryProvider.resetInstance();
      const provider2 = EnterpriseFactoryProvider.getInstance();
      expect(provider1).not.toBe(provider2);
    });

    test("should inspect correctly", () => {
      const provider = EnterpriseFactoryProvider.getInstance();
      const inspection = provider.inspect() as any;
      expect(inspection.type).toBe("EnterpriseFactoryProvider");
      expect(inspection.singleton).toBe(true);
    });
  });

  describe("EnterpriseFactoryFactory", () => {
    test("should create EnterprisePortServiceFactory", () => {
      const factoryFactory = new EnterpriseFactoryFactory();
      const factory = factoryFactory.createFactory();
      expect(factory).toBeInstanceOf(EnterprisePortServiceFactory);
    });

    test("should inspect correctly", () => {
      const factoryFactory = new EnterpriseFactoryFactory();
      const inspection = factoryFactory.inspect() as any;
      expect(inspection.type).toBe("EnterpriseFactoryFactory");
      expect(inspection.produces).toBe("EnterprisePortServiceFactory");
    });
  });

  describe("EnterprisePortServiceFactory", () => {
    test("should create VMPortServiceImpl", () => {
      const factory = new EnterprisePortServiceFactory();
      const service = factory.createService();
      expect(service).toBeInstanceOf(VMPortServiceImpl);
    });

    test("should inspect correctly", () => {
      const factory = new EnterprisePortServiceFactory();
      const inspection = factory.inspect() as any;
      expect(inspection.type).toBe("EnterprisePortServiceFactory");
      expect(inspection.produces).toBe("VMPortServiceImpl");
    });
  });

  describe("VMPortServiceImpl", () => {
    test("should generate a port", () => {
      const service = new VMPortServiceImpl();
      const context = new PortContext("test-requestor");
      const port = service.getPort(context);
      expect(port).toBeGreaterThanOrEqual(1024);
      expect(port).toBeLessThanOrEqual(65535);
    });

    test("should be deterministic", () => {
      const service = new VMPortServiceImpl();
      const context1 = new PortContext("test-requestor");
      const context2 = new PortContext("test-requestor");

      const port1 = service.getPort(context1);
      const port2 = service.getPort(context2);

      expect(port1).toBe(port2);
    });

    test("should track compiler stats", () => {
      const service = new VMPortServiceImpl();
      const context = new PortContext("test-requestor");

      service.getPort(context);
      const stats = service.getCompilerStats();

      expect(stats.count).toBeGreaterThan(0);
    });

    test("should inspect correctly", () => {
      const service = new VMPortServiceImpl();
      const inspection = service.inspect() as any;
      expect(inspection.type).toBe("VMPortServiceImpl");
      expect(inspection.compilerStats).toBeDefined();
    });
  });
});

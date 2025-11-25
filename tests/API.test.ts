import {
  describe,
  expect,
  test,
  beforeEach,
  afterEach,
  spyOn,
  mock,
} from "bun:test";
import { PortNumberCLI } from "../src/api/cli/PortNumberCLI";
import { GraphQLPortGenerator } from "../src/api/generators/GraphQLPortGenerator.api";
import { RESTPortGenerator } from "../src/api/generators/RESTPortGenerator.api";
import {
  PortNumberGrpcService,
  type GrpcPortRequest,
} from "../src/api/grpc/PortNumberService.grpc";
import {
  PortNumberWebSocketServer,
  MessageType,
} from "../src/api/websocket/PortNumberWebSocket.ts";

describe("API Layer", () => {
  describe("PortNumberCLI", () => {
    let cli: PortNumberCLI;
    let logSpy: any;
    let errorSpy: any;
    let exitSpy: any;

    beforeEach(() => {
      cli = new PortNumberCLI();
      logSpy = spyOn(console, "log").mockImplementation(() => {});
      errorSpy = spyOn(console, "error").mockImplementation(() => {});
      // @ts-ignore
      exitSpy = spyOn(process, "exit").mockImplementation(() => {});
    });

    afterEach(() => {
      logSpy.mockRestore();
      errorSpy.mockRestore();
      exitSpy.mockRestore();
    });

    test("should show usage when no args provided", async () => {
      await cli.run([]);
      // Usage usually logs to console
      expect(logSpy).toHaveBeenCalled();
    });

    test("should handle unknown command", async () => {
      await cli.run(["unknown"]);
      expect(errorSpy).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    test("should execute generate command", async () => {
      await cli.run(["generate", "--count", "1"]);
      expect(logSpy).toHaveBeenCalled();
    });

    test("should execute check command", async () => {
      await cli.run(["check", "--port", "8080"]);
      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe("GraphQLPortGenerator", () => {
    let generator: GraphQLPortGenerator;

    beforeEach(() => {
      generator = new GraphQLPortGenerator();
    });

    test("should return schema", () => {
      const schema = generator.getSchema();
      expect(schema).toContain("type Query");
      expect(schema).toContain("type Mutation");
    });

    test("should resolve frontend port", () => {
      const result = generator.resolveFrontendPort();
      expect(result.number).toBeDefined();
      expect(result.type).toBe("FRONTEND");
    });

    test("should resolve backend port", () => {
      const result = generator.resolveBackendPort();
      expect(result.number).toBeDefined();
      expect(result.type).toBe("BACKEND");
    });

    test("should execute query", () => {
      const result = generator.executeQuery("{ frontendPort { number } }");
      expect(result.data).toBeDefined();
      expect(result.data?.frontendPort).toBeDefined();
    });
  });

  describe("RESTPortGenerator", () => {
    let generator: RESTPortGenerator;

    beforeEach(() => {
      generator = new RESTPortGenerator();
    });

    test("should get frontend port", () => {
      const response = generator.getFrontendPort();
      expect(response.status).toBe(200);
      expect(response.data.type).toBe("frontend");
    });

    test("should get backend port", () => {
      const response = generator.getBackendPort();
      expect(response.status).toBe(200);
      expect(response.data.type).toBe("backend");
    });

    test("should get all ports", () => {
      const response = generator.getAllPorts();
      expect(response.status).toBe(200);
      expect(response.data.ports.length).toBe(2);
    });

    test("should validate port", () => {
      const response = generator.validatePort(8080);
      expect(response.status).toBe(200);
      expect(response.data.valid).toBe(false); // 8080 is likely not the frontend/backend port
    });
  });

  describe("PortNumberGrpcService", () => {
    let service: PortNumberGrpcService;

    beforeEach(() => {
      service = new PortNumberGrpcService();
    });

    test("should generate port", async () => {
      const request: GrpcPortRequest = {
        strategy: "random",
        min: 1000,
        max: 2000,
      };
      const response = await service.generatePort(request);
      expect(response.port).toBeGreaterThanOrEqual(1000);
      expect(response.port).toBeLessThanOrEqual(2000);
    });

    test("should check availability", async () => {
      const response = await service.checkAvailability({ port: 8080 });
      expect(response.available).toBe(true);
    });

    test("should reserve and release port", async () => {
      const reserveRes = await service.reservePort({ port: 8080 });
      expect(reserveRes.success).toBe(true);

      const checkRes = await service.checkAvailability({ port: 8080 });
      expect(checkRes.available).toBe(false);

      const releaseRes = await service.releasePort({ port: 8080 });
      expect(releaseRes.success).toBe(true);
    });
  });

  describe("PortNumberWebSocketServer", () => {
    let server: PortNumberWebSocketServer;

    beforeEach(() => {
      server = new PortNumberWebSocketServer(8080);
    });

    test("should start", async () => {
      await server.start();
      // Since it's a mock, we just check if it doesn't throw
      expect(true).toBe(true);
    });

    // Since the server implementation is mostly mocked/commented out in the source,
    // we can't easily test connection handling without mocking the WebSocket library it uses (or doesn't use yet).
    // However, we can verify it instantiates and starts without error.
  });
});

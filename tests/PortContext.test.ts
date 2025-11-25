import { describe, expect, test } from "bun:test";
import { PortContext } from "../src/core/domain/context/implementations/PortContext.implementation";

describe("PortContext", () => {
  test("should create an instance with requestor and metadata", () => {
    const metadata = { env: "test" };
    const context = new PortContext("test-requestor", metadata);

    expect(context.requestor).toBe("test-requestor");
    expect(context.metadata).toEqual(metadata);
    expect(context.requestId).toBeDefined();
    expect(context.timestamp).toBeDefined();
  });

  test("should calculate age correctly", async () => {
    const context = new PortContext("test");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(context.getAge()).toBeGreaterThanOrEqual(10);
  });

  test("should check expiration", async () => {
    const context = new PortContext("test");
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(context.isExpired(10)).toBe(true);
    expect(context.isExpired(100)).toBe(false);
  });

  test("should retrieve metadata", () => {
    const context = new PortContext("test", { key: "value" });
    expect(context.getMetadata("key")).toBe("value");
    expect(context.getMetadata("missing")).toBeUndefined();
  });

  test("should check if metadata exists", () => {
    const context = new PortContext("test", { key: "value" });
    expect(context.hasMetadata("key")).toBe(true);
    expect(context.hasMetadata("missing")).toBe(false);
  });

  test("should create a new context with updated metadata", () => {
    const context = new PortContext("test", { key: "value" });
    const newContext = context.withMetadata({ newKey: "newValue" });

    expect(newContext.metadata).toEqual({ key: "value", newKey: "newValue" });
    expect(newContext.requestor).toBe(context.requestor);
    expect(newContext).not.toBe(context);
  });

  test("should serialize to JSON", () => {
    const context = new PortContext("test", { key: "value" });
    const json = context.toJSON();
    const parsed = JSON.parse(json);

    expect(parsed.requestor).toBe("test");
    expect(parsed.metadata).toEqual({ key: "value" });
    expect(parsed.requestId).toBe(context.requestId);
  });

  test("should generate a hash", () => {
    const context = new PortContext("test");
    expect(context.hash()).toBe(`${context.requestor}-${context.requestId}`);
  });

  test("should check equality based on requestId", () => {
    const context1 = new PortContext("test");
    const context2 = new PortContext("test");

    // By default they should be different (different IDs)
    expect(context1.equals(context2)).toBe(false);

    // Hack to make them equal for testing
    // @ts-ignore
    context2.requestId = context1.requestId;
    expect(context1.equals(context2)).toBe(true);
  });

  test("should validate context", () => {
    const context = new PortContext("test");
    expect(context.validate()).toBe(true);
  });

  test("should return ISO timestamp", () => {
    const context = new PortContext("test");
    expect(context.getTimestampISO()).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
    );
  });

  test("should count metadata", () => {
    const context = new PortContext("test", { a: 1, b: 2 });
    expect(context.getMetadataCount()).toBe(2);
  });

  test("should get metadata keys", () => {
    const context = new PortContext("test", { a: 1, b: 2 });
    expect(context.getMetadataKeys()).toEqual(["a", "b"]);
  });

  test("should check requestor type", () => {
    const frontend = new PortContext("frontend");
    expect(frontend.isFrontend()).toBe(true);
    expect(frontend.isBackend()).toBe(false);

    const backend = new PortContext("backend");
    expect(backend.isBackend()).toBe(true);
    expect(backend.isFrontend()).toBe(false);
  });

  test("should clone context", () => {
    const context = new PortContext("test", { a: 1 });
    const clone = context.clone();

    expect(clone.metadata).toEqual(context.metadata);
    expect(clone.requestor).toBe(context.requestor);
    expect(clone).not.toBe(context);
  });

  test("should merge contexts", () => {
    const context1 = new PortContext("test", { a: 1 });
    const context2 = new PortContext("other", { b: 2 });
    const merged = context1.merge(context2);

    expect(merged.metadata).toEqual({ a: 1, b: 2 });
    expect(merged.requestor).toBe("test");
  });
});

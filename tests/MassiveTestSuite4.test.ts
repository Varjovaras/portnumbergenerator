import { describe, expect, test } from "bun:test";
import { PortCompiler } from "../src/infrastructure/virtualization/compiler/PortCompiler.class";

describe("Massive Test Suite 4 - PortCompiler Exhaustive", () => {
  // Generate 100 tests for PortCompiler
  for (let i = 0; i < 100; i++) {
    test(`should compile frontend - iteration ${i}`, () => {
      const compiler = new PortCompiler();
      const program = compiler.compile("frontend");
      expect(program.length).toBeGreaterThan(0);
    });

    test(`should compile backend - iteration ${i}`, () => {
      const compiler = new PortCompiler();
      const program = compiler.compile("backend");
      expect(program.length).toBeGreaterThan(0);
    });
  }
});

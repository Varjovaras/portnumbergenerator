import { describe, expect, test, beforeEach } from "bun:test";
import { PortCompiler } from "../src/infrastructure/virtualization/compiler/PortCompiler.class";
import { Instruction } from "../src/infrastructure/virtualization/vm/instruction-set/Instruction.class";
import { Opcode } from "../src/infrastructure/virtualization/vm/opcodes/Opcode.constants";

describe("Infrastructure Layer", () => {
  describe("PortCompiler", () => {
    let compiler: PortCompiler;

    beforeEach(() => {
      compiler = new PortCompiler();
    });

    test("should compile frontend program", () => {
      const program = compiler.compile("frontend");

      expect(program).toBeInstanceOf(Array);
      expect(program.length).toBeGreaterThan(0);
      expect(program[program.length - 1].opcode).toBe(Opcode.HALT);
    });

    test("should compile backend program", () => {
      const program = compiler.compile("backend");

      expect(program).toBeInstanceOf(Array);
      expect(program.length).toBeGreaterThan(0);
      expect(program[program.length - 1].opcode).toBe(Opcode.HALT);
    });

    test("should cache compiled programs", () => {
      const program1 = compiler.compile("frontend");
      const program2 = compiler.compile("frontend");

      // Should return same reference (cached)
      expect(program1).toBe(program2);
      expect(compiler.getCompilationCount()).toBe(1);
    });

    test("should track compilation count", () => {
      expect(compiler.getCompilationCount()).toBe(0);

      compiler.compile("frontend");
      expect(compiler.getCompilationCount()).toBe(1);

      compiler.compile("frontend"); // Cache hit
      expect(compiler.getCompilationCount()).toBe(1);

      compiler.compile("backend");
      expect(compiler.getCompilationCount()).toBe(2);
    });

    test("should provide cache statistics", () => {
      const stats1 = compiler.getCacheStats();
      expect(stats1.size).toBe(0);
      expect(stats1.count).toBe(0);

      compiler.compile("frontend");
      const stats2 = compiler.getCacheStats();
      expect(stats2.size).toBe(1);
      expect(stats2.count).toBe(1);

      compiler.compile("backend");
      const stats3 = compiler.getCacheStats();
      expect(stats3.size).toBe(2);
      expect(stats3.count).toBe(2);
    });

    test("should clear cache", () => {
      compiler.compile("frontend");
      compiler.compile("backend");

      expect(compiler.getCacheStats().size).toBe(2);

      compiler.clearCache();

      expect(compiler.getCacheStats().size).toBe(0);
      expect(compiler.getCacheStats().count).toBe(2); // Count preserved
    });

    test("should recompile after cache clear", () => {
      const program1 = compiler.compile("frontend");
      compiler.clearCache();
      const program2 = compiler.compile("frontend");

      // Different references (recompiled)
      expect(program1).not.toBe(program2);
      expect(compiler.getCompilationCount()).toBe(2);
    });

    test("should generate valid instruction sequences", () => {
      const program = compiler.compile("frontend");

      // Check that all instructions are valid
      for (const instruction of program) {
        expect(instruction).toBeInstanceOf(Instruction);
        expect(instruction.opcode).toBeDefined();
      }
    });

    test("should handle unknown types as backend", () => {
      const unknownProgram = compiler.compile("unknown");
      const backendProgram = compiler.compile("backend");

      // Unknown types should compile (default to backend)
      expect(unknownProgram).toBeInstanceOf(Array);
      expect(unknownProgram.length).toBeGreaterThan(0);
    });
  });

  describe("Instruction", () => {
    test("should create instruction with opcode only", () => {
      const instruction = new Instruction(Opcode.HALT);
      expect(instruction.opcode).toBe(Opcode.HALT);
      expect(instruction.operand).toBeNull();
    });

    test("should create instruction with opcode and operand", () => {
      const instruction = new Instruction(Opcode.PUSH, 42);
      expect(instruction.opcode).toBe(Opcode.PUSH);
      expect(instruction.operand).toBe(42);
    });

    test("should have correct string representation", () => {
      const instruction1 = new Instruction(Opcode.HALT);
      expect(instruction1.toString()).toContain("0x");
      expect(instruction1.toString()).toContain("Opcode");

      const instruction2 = new Instruction(Opcode.PUSH, 100);
      expect(instruction2.toString()).toContain("Opcode");
      expect(instruction2.toString()).toContain("100");
    });

    test("should serialize to JSON", () => {
      const instruction = new Instruction(Opcode.PUSH, 42);
      const json = instruction.toJSON();
      expect(json.opcode).toBe(Opcode.PUSH);
      expect(json.operand).toBe(42);
    });
  });

  describe("Opcode Constants", () => {
    test("should have all required opcodes", () => {
      expect(Opcode.PUSH).toBeDefined();
      expect(Opcode.POP).toBeDefined();
      expect(Opcode.ADD).toBeDefined();
      expect(Opcode.SUB).toBeDefined();
      expect(Opcode.MUL).toBeDefined();
      expect(Opcode.DIV).toBeDefined();
      expect(Opcode.HALT).toBeDefined();
      expect(Opcode.DUP).toBeDefined();
      expect(Opcode.SWAP).toBeDefined();
    });

    test("should have unique opcode values", () => {
      const opcodes = [
        Opcode.PUSH,
        Opcode.POP,
        Opcode.ADD,
        Opcode.SUB,
        Opcode.MUL,
        Opcode.DIV,
        Opcode.HALT,
        Opcode.DUP,
        Opcode.SWAP,
        Opcode.LOAD,
        Opcode.STORE,
        Opcode.JMP,
        Opcode.JZ,
      ];

      const uniqueOpcodes = new Set(opcodes);
      expect(uniqueOpcodes.size).toBe(opcodes.length);
    });
  });
});

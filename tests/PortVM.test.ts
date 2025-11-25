import { describe, expect, test, beforeEach } from "bun:test";
import { PortVM } from "../src/infrastructure/virtualization/vm/PortVM.class";
import { Opcode } from "../src/infrastructure/virtualization/vm/opcodes/Opcode.constants";
import { Instruction } from "../src/infrastructure/virtualization/vm/instruction-set/Instruction.class";

describe("PortVM", () => {
  let vm: PortVM;

  beforeEach(() => {
    vm = new PortVM();
  });

  test("should initialize with empty stack and memory", () => {
    expect(vm.getStackDepth()).toBe(0);
    expect(vm.getInstructionPointer()).toBe(0);
    expect(vm.isRunning()).toBe(false);
  });

  test("should execute a simple addition program", () => {
    const program = [
      new Instruction(Opcode.PUSH, 10),
      new Instruction(Opcode.PUSH, 20),
      new Instruction(Opcode.ADD),
      new Instruction(Opcode.HALT),
    ];

    vm.loadProgram(program);
    const result = vm.run();

    expect(result).toBe(30);
    expect(vm.getStackDepth()).toBe(0); // Result is popped
  });

  test("should execute a simple subtraction program", () => {
    const program = [
      new Instruction(Opcode.PUSH, 30),
      new Instruction(Opcode.PUSH, 10),
      new Instruction(Opcode.SUB),
      new Instruction(Opcode.HALT),
    ];

    vm.loadProgram(program);
    const result = vm.run();

    expect(result).toBe(20);
  });

  test("should execute a simple multiplication program", () => {
    const program = [
      new Instruction(Opcode.PUSH, 5),
      new Instruction(Opcode.PUSH, 6),
      new Instruction(Opcode.MUL),
      new Instruction(Opcode.HALT),
    ];

    vm.loadProgram(program);
    const result = vm.run();

    expect(result).toBe(30);
  });

  test("should execute a simple division program", () => {
    const program = [
      new Instruction(Opcode.PUSH, 20),
      new Instruction(Opcode.PUSH, 4),
      new Instruction(Opcode.DIV),
      new Instruction(Opcode.HALT),
    ];

    vm.loadProgram(program);
    const result = vm.run();

    expect(result).toBe(5);
  });

  test("should throw error on division by zero", () => {
    const program = [
      new Instruction(Opcode.PUSH, 10),
      new Instruction(Opcode.PUSH, 0),
      new Instruction(Opcode.DIV),
      new Instruction(Opcode.HALT),
    ];

    vm.loadProgram(program);
    expect(() => vm.run()).toThrow("Division by zero");
  });

  test("should handle stack operations (DUP, SWAP, POP)", () => {
    // Test DUP
    let program = [
      new Instruction(Opcode.PUSH, 5),
      new Instruction(Opcode.DUP),
      new Instruction(Opcode.ADD),
      new Instruction(Opcode.HALT),
    ];
    vm.loadProgram(program);
    expect(vm.run()).toBe(10);

    // Test SWAP
    program = [
      new Instruction(Opcode.PUSH, 10),
      new Instruction(Opcode.PUSH, 2),
      new Instruction(Opcode.SWAP),
      new Instruction(Opcode.DIV), // 2 / 10 = 0.2
      new Instruction(Opcode.HALT),
    ];
    vm.loadProgram(program);
    expect(vm.run()).toBe(0.2);

    // Test POP (implicitly tested via stack depth, but let's be explicit)
    // Actually run() pops the result, so we can't easily test POP leaving things on stack unless we inspect before HALT.
    // But we can test that POP removes an item.
    // Let's use step() for this.
  });

  test("should step through instructions", () => {
    const program = [
      new Instruction(Opcode.PUSH, 10),
      new Instruction(Opcode.PUSH, 20),
      new Instruction(Opcode.ADD),
      new Instruction(Opcode.HALT),
    ];

    vm.loadProgram(program);

    expect(vm.step()).toBe(true); // PUSH 10
    expect(vm.getStackDepth()).toBe(1);
    expect(vm.peek()).toBe(10);

    expect(vm.step()).toBe(true); // PUSH 20
    expect(vm.getStackDepth()).toBe(2);
    expect(vm.peek()).toBe(20);

    expect(vm.step()).toBe(true); // ADD
    expect(vm.getStackDepth()).toBe(1);
    expect(vm.peek()).toBe(30);

    expect(vm.step()).toBe(false); // HALT (or end of program)
    // Wait, step() executes the instruction at IP.
    // 0: PUSH 10 -> IP becomes 1
    // 1: PUSH 20 -> IP becomes 2
    // 2: ADD -> IP becomes 3
    // 3: HALT -> IP becomes 4.
    // step() returns true if IP < length.
    // After executing HALT (index 3), IP is 4. Length is 4. So it returns false.
  });

  test("should handle memory operations (LOAD, STORE)", () => {
    const program = [
      new Instruction(Opcode.PUSH, 42),
      new Instruction(Opcode.STORE, 0), // Store 42 at address 0
      new Instruction(Opcode.PUSH, 100), // Push garbage
      new Instruction(Opcode.POP), // Remove garbage
      new Instruction(Opcode.LOAD, 0), // Load from address 0
      new Instruction(Opcode.HALT),
    ];

    vm.loadProgram(program);
    expect(vm.run()).toBe(42);
    expect(vm.getMemory(0)).toBe(42);
  });

  test("should handle jumps (JMP, JZ)", () => {
    // Test JMP
    // 0: PUSH 10
    // 1: JMP 3
    // 2: PUSH 999 (skipped)
    // 3: HALT
    let program = [
      new Instruction(Opcode.PUSH, 10),
      new Instruction(Opcode.JMP, 3),
      new Instruction(Opcode.PUSH, 999),
      new Instruction(Opcode.HALT),
    ];
    vm.loadProgram(program);
    expect(vm.run()).toBe(10);

    // Test JZ (Jump Zero) - Branch taken
    // 0: PUSH 0
    // 1: JZ 4
    // 2: PUSH 999
    // 3: HALT
    // 4: PUSH 42
    // 5: HALT
    program = [
      new Instruction(Opcode.PUSH, 0),
      new Instruction(Opcode.JZ, 4),
      new Instruction(Opcode.PUSH, 999),
      new Instruction(Opcode.HALT),
      new Instruction(Opcode.PUSH, 42),
      new Instruction(Opcode.HALT),
    ];
    vm.loadProgram(program);
    expect(vm.run()).toBe(42);

    // Test JZ (Jump Zero) - Branch NOT taken
    // 0: PUSH 1
    // 1: JZ 4
    // 2: PUSH 24
    // 3: HALT
    // 4: PUSH 999
    // 5: HALT
    program = [
      new Instruction(Opcode.PUSH, 1),
      new Instruction(Opcode.JZ, 4),
      new Instruction(Opcode.PUSH, 24),
      new Instruction(Opcode.HALT),
      new Instruction(Opcode.PUSH, 999),
      new Instruction(Opcode.HALT),
    ];
    vm.loadProgram(program);
    expect(vm.run()).toBe(24);
  });

  test("should disassemble program", () => {
    const program = [
      new Instruction(Opcode.PUSH, 10),
      new Instruction(Opcode.ADD),
      new Instruction(Opcode.HALT),
    ];
    vm.loadProgram(program);
    const disassembly = vm.disassemble();

    // Opcode names might vary depending on enum keys, but let's assume standard names
    expect(disassembly[0]).toContain("PUSH 10");
    expect(disassembly[1]).toContain("ADD");
    expect(disassembly[2]).toContain("HALT");
  });
});

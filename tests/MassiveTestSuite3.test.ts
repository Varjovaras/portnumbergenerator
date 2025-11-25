import { describe, expect, test } from "bun:test";
import { PortVM } from "../src/infrastructure/virtualization/vm/PortVM.class";
import { Instruction } from "../src/infrastructure/virtualization/vm/instruction-set/Instruction.class";
import { Opcode } from "../src/infrastructure/virtualization/vm/opcodes/Opcode.constants";

describe("Massive Test Suite 3 - PortVM Exhaustive", () => {
  // Generate 200 tests for PortVM
  for (let i = 1; i <= 50; i++) {
    test(`should execute PUSH ${i}`, () => {
      const vm = new PortVM();
      const program = [
        new Instruction(Opcode.PUSH, i),
        new Instruction(Opcode.HALT),
      ];
      vm.loadProgram(program);
      const result = vm.run();
      expect(result).toBe(i);
    });

    test(`should add ${i} + ${i}`, () => {
      const vm = new PortVM();
      const program = [
        new Instruction(Opcode.PUSH, i),
        new Instruction(Opcode.PUSH, i),
        new Instruction(Opcode.ADD),
        new Instruction(Opcode.HALT),
      ];
      vm.loadProgram(program);
      const result = vm.run();
      expect(result).toBe(i + i);
    });

    test(`should multiply ${i} * 2`, () => {
      const vm = new PortVM();
      const program = [
        new Instruction(Opcode.PUSH, i),
        new Instruction(Opcode.PUSH, 2),
        new Instruction(Opcode.MUL),
        new Instruction(Opcode.HALT),
      ];
      vm.loadProgram(program);
      const result = vm.run();
      expect(result).toBe(i * 2);
    });

    test(`should subtract ${i} - 1`, () => {
      const vm = new PortVM();
      const program = [
        new Instruction(Opcode.PUSH, i),
        new Instruction(Opcode.PUSH, 1),
        new Instruction(Opcode.SUB),
        new Instruction(Opcode.HALT),
      ];
      vm.loadProgram(program);
      const result = vm.run();
      expect(result).toBe(i - 1);
    });
  }
});

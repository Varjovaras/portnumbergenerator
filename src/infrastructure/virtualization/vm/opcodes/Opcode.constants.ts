/**
 * @fileoverview Military-Grade Virtual Machine Opcode Definitions
 * @module infrastructure/virtualization/vm/opcodes
 * @category InfrastructureLayer
 * @subcategory VirtualizationEngine
 *
 * This file contains the OFFICIAL opcode definitions for the PortVM™,
 * our revolutionary stack-based virtual machine designed specifically
 * for the mission-critical task of calculating port numbers.
 *
 * These opcodes were carefully selected after 8 months of research,
 * including a thorough analysis of x86, ARM, MIPS, RISC-V, JVM bytecode,
 * and that one assembly language nobody's heard of but Dave really likes.
 *
 * SECURITY NOTICE: These opcodes are considered TRADE SECRETS and are
 * protected by 47 different patents (pending). Unauthorized use may result
 * in strongly worded emails from our legal department.
 *
 * @author The Virtual Machine Architecture Council (VMAC)
 * @version 2.0.0-ENTERPRISE-ULTIMATE-EDITION
 * @since 2024-Q4 (The Quarter We Discovered VMs Exist)
 *
 * @standards
 * - Complies with: ISO/IEC 9899 (we think)
 * - Inspired by: Every VM ever created
 * - Incompatible with: Actual hardware
 *
 * @performance
 * - Opcode lookup time: O(1) (it's an enum, duh)
 * - Memory footprint: 15 numbers (60 bytes, absolutely massive)
 * - Cache efficiency: Probably good?
 *
 * @changelog
 * - v1.0.0: Initial opcodes (we had 3)
 * - v1.5.0: Added more opcodes (we had 7)
 * - v2.0.0: Added ALL the opcodes (we have 15 now, it's getting out of control)
 */

/**
 * Enum representing the Opcodes for the Port Virtual Machine.
 *
 * Each opcode represents a single, atomic, indivisible operation that can be
 * performed by our virtual machine. These are the building blocks of port
 * number computation, the assembly language of port provisioning, the
 * machine code of... okay, you get the idea.
 *
 * FUN FACT: We spent 3 weeks debating whether to use hexadecimal or decimal
 * for these values. Hexadecimal won because it "looks more professional".
 *
 * DESIGN DECISION: We use a const object instead of a TypeScript enum because:
 * 1. Someone read that enums are "not idiomatic TypeScript"
 * 2. We like typing "as const" everywhere
 * 3. It makes the bundle 0.001% smaller
 * 4. We can say we use "modern TypeScript practices"
 *
 * @const {Object} Opcode
 * @readonly
 * @immutable
 * @frozen (spiritually, not technically)
 *
 * @opcodeRange 0x00 - 0x0E (we reserved 0x0F - 0xFF for future expansion)
 * @encoding Single byte per opcode (we're not wasteful)
 *
 * @example
 * ```typescript
 * import { Opcode } from './Opcode.constants';
 *
 * const instruction = Opcode.PUSH; // 0x01
 * console.log(`Executing opcode: ${instruction}`);
 * ```
 */
export const Opcode = {
	/**
	 * HALT - Stop execution immediately
	 *
	 * When the VM encounters this opcode, it stops. Just stops. No questions asked.
	 * This is the "emergency brake" of our virtual machine.
	 *
	 * Opcode: 0x00 (we made it zero because zero means "nothing" and halt means "do nothing")
	 *
	 * Stack Effect: none (execution stops, stack becomes irrelevant)
	 * Operands: none (what would you even pass to HALT?)
	 * Cycles: 1 (well, we don't actually count cycles, but if we did...)
	 *
	 * @type {0x00}
	 * @category ControlFlow
	 * @criticality MISSION_CRITICAL
	 *
	 * @throws Never (it just stops)
	 * @sideEffects Sets VM running flag to false
	 *
	 * @example
	 * ```typescript
	 * program.push(new Instruction(Opcode.HALT));
	 * // VM will stop here (hopefully gracefully)
	 * ```
	 */
	HALT: 0x00,

	/**
	 * PUSH - Push a value onto the stack
	 *
	 * The bread and butter of stack operations. Takes a value from the operand
	 * and yeets it onto the top of the stack. Simple. Elegant. Beautiful.
	 *
	 * Opcode: 0x01
	 *
	 * Stack Effect: [] -> [value]
	 * Operands: 1 (the value to push, must be provided or we throw)
	 * Cycles: 1
	 *
	 * @type {0x01}
	 * @category StackOperation
	 * @criticality HIGH
	 *
	 * @throws {Error} If operand is null (we need something to push!)
	 * @sideEffects Increases stack depth by 1
	 *
	 * @example
	 * ```typescript
	 * program.push(new Instruction(Opcode.PUSH, 42));
	 * // Stack: [42]
	 * ```
	 */
	PUSH: 0x01,

	/**
	 * POP - Remove top value from stack
	 *
	 * Takes the top value off the stack and discards it into the void.
	 * Useful for cleaning up after yourself (which we highly encourage).
	 *
	 * Opcode: 0x02
	 *
	 * Stack Effect: [value] -> []
	 * Operands: none (POP is self-sufficient)
	 * Cycles: 1
	 *
	 * @type {0x02}
	 * @category StackOperation
	 * @criticality MEDIUM
	 *
	 * @throws {Error} If stack is empty (can't pop from nothing!)
	 * @sideEffects Decreases stack depth by 1
	 *
	 * @example
	 * ```typescript
	 * program.push(new Instruction(Opcode.POP));
	 * // Whatever was on top is now gone (farewell, sweet value)
	 * ```
	 */
	POP: 0x02,

	/**
	 * ADD - Add top two stack values
	 *
	 * Pops two values, adds them together (using actual mathematics),
	 * then pushes the result back. It's like a calculator, but worse.
	 *
	 * Opcode: 0x03
	 *
	 * Stack Effect: [a, b] -> [a + b]
	 * Operands: none (uses stack values)
	 * Cycles: 3 (pop, add, push)
	 *
	 * @type {0x03}
	 * @category ArithmeticOperation
	 * @criticality CRITICAL (port calculations depend on this)
	 *
	 * @throws {Error} If stack has fewer than 2 values
	 * @sideEffects Decreases stack depth by 1
	 *
	 * @mathematicalProperties
	 * - Commutative: Yes (a + b = b + a)
	 * - Associative: Yes ((a + b) + c = a + (b + c))
	 * - Identity element: 0
	 *
	 * @example
	 * ```typescript
	 * // Stack: [3, 4]
	 * program.push(new Instruction(Opcode.ADD));
	 * // Stack: [7]
	 * ```
	 */
	ADD: 0x03,

	/**
	 * SUB - Subtract top two stack values
	 *
	 * Pops two values, subtracts the second from the first (order matters!),
	 * then pushes the result. Math is hard.
	 *
	 * Opcode: 0x04
	 *
	 * Stack Effect: [a, b] -> [a - b]
	 * Operands: none
	 * Cycles: 3
	 *
	 * @type {0x04}
	 * @category ArithmeticOperation
	 * @criticality MEDIUM (we don't use this much)
	 *
	 * @throws {Error} If stack has fewer than 2 values
	 * @sideEffects Decreases stack depth by 1
	 *
	 * @mathematicalProperties
	 * - Commutative: No (a - b ≠ b - a)
	 * - Associative: No ((a - b) - c ≠ a - (b - c))
	 * - Identity element: 0
	 *
	 * @example
	 * ```typescript
	 * // Stack: [10, 3]
	 * program.push(new Instruction(Opcode.SUB));
	 * // Stack: [7]
	 * ```
	 */
	SUB: 0x04,

	/**
	 * MUL - Multiply top two stack values
	 *
	 * Pops two values, multiplies them together (using the power of mathematics),
	 * then pushes the result. We don't use this for port calculation,
	 * but it's here for "completeness".
	 *
	 * Opcode: 0x05
	 *
	 * Stack Effect: [a, b] -> [a * b]
	 * Operands: none
	 * Cycles: 3
	 *
	 * @type {0x05}
	 * @category ArithmeticOperation
	 * @criticality LOW (unused in production)
	 *
	 * @throws {Error} If stack has fewer than 2 values
	 * @sideEffects Decreases stack depth by 1
	 *
	 * @mathematicalProperties
	 * - Commutative: Yes (a * b = b * a)
	 * - Associative: Yes ((a * b) * c = a * (b * c))
	 * - Identity element: 1
	 *
	 * @performance May overflow for large numbers (use responsibly)
	 *
	 * @example
	 * ```typescript
	 * // Stack: [6, 7]
	 * program.push(new Instruction(Opcode.MUL));
	 * // Stack: [42]
	 * ```
	 */
	MUL: 0x05,

	/**
	 * DIV - Divide top two stack values
	 *
	 * Pops two values, divides the first by the second (don't divide by zero!),
	 * then pushes the result. We check for division by zero because we learned
	 * from that production incident in 2023.
	 *
	 * Opcode: 0x06
	 *
	 * Stack Effect: [a, b] -> [a / b]
	 * Operands: none
	 * Cycles: 3
	 *
	 * @type {0x06}
	 * @category ArithmeticOperation
	 * @criticality MEDIUM (dangerous but useful)
	 *
	 * @throws {Error} If stack has fewer than 2 values
	 * @throws {Error} If divisor is zero (THE INCIDENT)
	 * @sideEffects Decreases stack depth by 1
	 *
	 * @mathematicalProperties
	 * - Commutative: No (a / b ≠ b / a)
	 * - Associative: No ((a / b) / c ≠ a / (b / c))
	 * - Identity element: 1
	 *
	 * @dangerZone Division by zero will crash the VM (we throw an error)
	 *
	 * @example
	 * ```typescript
	 * // Stack: [20, 4]
	 * program.push(new Instruction(Opcode.DIV));
	 * // Stack: [5]
	 * ```
	 */
	DIV: 0x06,

	/**
	 * LOAD - Load value from memory onto stack
	 *
	 * Takes a memory address from the operand, reads the value at that address,
	 * and pushes it onto the stack. We have 1024 memory slots because that's
	 * a nice round binary number (2^10).
	 *
	 * Opcode: 0x07
	 *
	 * Stack Effect: [] -> [memory[address]]
	 * Operands: 1 (memory address, 0-1023)
	 * Cycles: 2 (memory read + push)
	 *
	 * @type {0x07}
	 * @category MemoryOperation
	 * @criticality LOW (we don't really use memory)
	 *
	 * @throws {Error} If operand is null
	 * @sideEffects
	 * - Increases stack depth by 1
	 * - Reads from memory (but reading is safe, right?)
	 *
	 * @memoryModel
	 * - Address space: 0-1023 (1024 slots)
	 * - Default value: 0
	 * - Out of bounds: Returns 0 (we're forgiving)
	 *
	 * @example
	 * ```typescript
	 * program.push(new Instruction(Opcode.LOAD, 42));
	 * // Loads value from memory address 42 onto stack
	 * ```
	 */
	LOAD: 0x07,

	/**
	 * STORE - Store top stack value into memory
	 *
	 * Takes a memory address from the operand, pops the top stack value,
	 * and stores it at that address. Persistent storage! (well, until the VM resets)
	 *
	 * Opcode: 0x08
	 *
	 * Stack Effect: [value] -> []
	 * Operands: 1 (memory address, 0-1023)
	 * Cycles: 2 (pop + memory write)
	 *
	 * @type {0x08}
	 * @category MemoryOperation
	 * @criticality LOW (unused in production)
	 *
	 * @throws {Error} If operand is null
	 * @throws {Error} If stack is empty
	 * @sideEffects
	 * - Decreases stack depth by 1
	 * - MUTATES MEMORY (gasp!)
	 *
	 * @example
	 * ```typescript
	 * // Stack: [123]
	 * program.push(new Instruction(Opcode.STORE, 42));
	 * // Stack: [], memory[42] = 123
	 * ```
	 */
	STORE: 0x08,

	/**
	 * JMP - Unconditional jump to instruction
	 *
	 * Changes the instruction pointer to the specified address.
	 * Useful for loops! (which we don't use)
	 * And conditional logic! (which we also don't use)
	 * But it's here for "completeness"!
	 *
	 * Opcode: 0x09
	 *
	 * Stack Effect: none (doesn't touch the stack)
	 * Operands: 1 (target instruction index)
	 * Cycles: 1
	 *
	 * @type {0x09}
	 * @category ControlFlow
	 * @criticality MEDIUM (powerful but dangerous)
	 *
	 * @throws {Error} If operand is null
	 * @sideEffects Modifies instruction pointer (DANGER ZONE)
	 *
	 * @dangerZone Can create infinite loops (we don't validate this)
	 *
	 * @example
	 * ```typescript
	 * program.push(new Instruction(Opcode.JMP, 0));
	 * // Jump back to start (infinite loop, good luck!)
	 * ```
	 */
	JMP: 0x09,

	/**
	 * JZ - Jump if top stack value is zero
	 *
	 * Conditional jump! Pops the top value. If it's zero, jumps to the
	 * specified instruction. Otherwise, continues to next instruction.
	 * This is how you do IF statements in assembly.
	 *
	 * Opcode: 0x0A
	 *
	 * Stack Effect: [value] -> []
	 * Operands: 1 (target instruction index)
	 * Cycles: 2 (pop + conditional jump)
	 *
	 * @type {0x0A}
	 * @category ControlFlow
	 * @criticality MEDIUM (unused but cool)
	 *
	 * @throws {Error} If operand is null
	 * @throws {Error} If stack is empty
	 * @sideEffects
	 * - Decreases stack depth by 1
	 * - May modify instruction pointer
	 *
	 * @example
	 * ```typescript
	 * // Stack: [0]
	 * program.push(new Instruction(Opcode.JZ, 10));
	 * // Jumps to instruction 10 (because top was zero)
	 * ```
	 */
	JZ: 0x0a,

	/**
	 * JNZ - Jump if top stack value is NOT zero
	 *
	 * The opposite of JZ. Pops the top value. If it's NOT zero, jumps.
	 * Otherwise, continues. We have both JZ and JNZ because having only
	 * one would be "inefficient" (we needed to justify that conference trip).
	 *
	 * Opcode: 0x0B
	 *
	 * Stack Effect: [value] -> []
	 * Operands: 1 (target instruction index)
	 * Cycles: 2 (pop + conditional jump)
	 *
	 * @type {0x0B}
	 * @category ControlFlow
	 * @criticality MEDIUM (JZ's cooler sibling)
	 *
	 * @throws {Error} If operand is null
	 * @throws {Error} If stack is empty
	 * @sideEffects
	 * - Decreases stack depth by 1
	 * - May modify instruction pointer
	 *
	 * @example
	 * ```typescript
	 * // Stack: [1]
	 * program.push(new Instruction(Opcode.JNZ, 10));
	 * // Jumps to instruction 10 (because top was NOT zero)
	 * ```
	 */
	JNZ: 0x0b,

	/**
	 * DUP - Duplicate top stack value
	 *
	 * Copies the top stack value and pushes the copy onto the stack.
	 * Now you have two! It's like mitosis, but for numbers.
	 *
	 * Opcode: 0x0C
	 *
	 * Stack Effect: [value] -> [value, value]
	 * Operands: none
	 * Cycles: 2 (peek + push)
	 *
	 * @type {0x0C}
	 * @category StackOperation
	 * @criticality MEDIUM (useful for operations that consume values)
	 *
	 * @throws Never (well, if stack is empty we push undefined, oops)
	 * @sideEffects Increases stack depth by 1
	 *
	 * @useCase When you need to keep a value but also use it
	 *
	 * @example
	 * ```typescript
	 * // Stack: [5]
	 * program.push(new Instruction(Opcode.DUP));
	 * // Stack: [5, 5]
	 * ```
	 */
	DUP: 0x0c,

	/**
	 * SWAP - Swap top two stack values
	 *
	 * Takes the top two values and swaps their positions.
	 * Useful when values are in the wrong order (happens more often than you'd think).
	 *
	 * Opcode: 0x0D
	 *
	 * Stack Effect: [a, b] -> [b, a]
	 * Operands: none
	 * Cycles: 3 (pop, pop, push, push... wait that's 4)
	 *
	 * @type {0x0D}
	 * @category StackOperation
	 * @criticality LOW (rarely needed)
	 *
	 * @throws {Error} If stack has fewer than 2 values
	 * @sideEffects None (stack depth unchanged)
	 *
	 * @example
	 * ```typescript
	 * // Stack: [1, 2]
	 * program.push(new Instruction(Opcode.SWAP));
	 * // Stack: [2, 1]
	 * ```
	 */
	SWAP: 0x0d,

	/**
	 * PRINT - Print top stack value to console
	 *
	 * This opcode exists solely because Dave wanted to debug his programs
	 * and didn't want to learn how to use an actual debugger.
	 * It's not implemented. It never will be. But Dave insisted it be in the spec.
	 *
	 * Opcode: 0x0E
	 *
	 * Stack Effect: none (doesn't modify stack)
	 * Operands: none
	 * Cycles: ∞ (I/O is slow)
	 *
	 * @type {0x0E}
	 * @category DebugOperation
	 * @criticality NONE (literally useless)
	 * @deprecated Since forever
	 * @implemented false
	 *
	 * @throws {Error} "Unknown Opcode" (because it's not implemented)
	 * @sideEffects Would print to console if implemented (it's not)
	 *
	 * @tribute This opcode is dedicated to Dave. We miss you, Dave.
	 *          (He left the company. He's fine. He just works somewhere else now.)
	 *
	 * @example
	 * ```typescript
	 * program.push(new Instruction(Opcode.PRINT));
	 * // Does nothing (falls through to default case and throws)
	 * ```
	 */
	PRINT: 0x0e,
} as const;

/**
 * Type definition for Opcode values.
 *
 * This ensures type safety when working with opcodes. You can't accidentally
 * pass 0x42 as an opcode because that's not a valid opcode (we only go up to 0x0E).
 *
 * TypeScript will yell at you. We like it when TypeScript yells at you.
 * It means our types are working.
 *
 * @type {Opcode}
 * @example
 * ```typescript
 * const op: Opcode = 0x01; // OK
 * const invalid: Opcode = 0xFF; // ERROR! (good)
 * ```
 */
export type Opcode = (typeof Opcode)[keyof typeof Opcode];

/**
 * Human-readable names for opcodes.
 *
 * Because sometimes you want to know what 0x03 means without
 * memorizing our entire opcode table like some kind of assembly wizard.
 *
 * @const {Record<Opcode, string>}
 * @readonly
 *
 * @example
 * ```typescript
 * import { OpcodeNames } from './Opcode.constants';
 * console.log(OpcodeNames[0x03]); // "ADD"
 * ```
 */
export const OpcodeNames: Record<Opcode, string> = {
	[Opcode.HALT]: "HALT",
	[Opcode.PUSH]: "PUSH",
	[Opcode.POP]: "POP",
	[Opcode.ADD]: "ADD",
	[Opcode.SUB]: "SUB",
	[Opcode.MUL]: "MUL",
	[Opcode.DIV]: "DIV",
	[Opcode.LOAD]: "LOAD",
	[Opcode.STORE]: "STORE",
	[Opcode.JMP]: "JMP",
	[Opcode.JZ]: "JZ",
	[Opcode.JNZ]: "JNZ",
	[Opcode.DUP]: "DUP",
	[Opcode.SWAP]: "SWAP",
	[Opcode.PRINT]: "PRINT",
} as const;

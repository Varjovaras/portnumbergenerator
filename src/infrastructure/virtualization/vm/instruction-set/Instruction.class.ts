/**
 * @fileoverview Enterprise Instruction Class Definition
 * @module infrastructure/virtualization/vm/instruction-set
 * @category InfrastructureLayer
 * @subcategory VirtualMachineInstructionSet
 *
 * This file defines the Instruction class, which represents a single, atomic,
 * indivisible unit of execution within the PortVM™ ecosystem.
 *
 * Each instruction is a beautiful marriage of an opcode (what to do) and an
 * operand (what to do it with). It's like a haiku, but for virtual machines.
 *
 * ARCHITECTURAL DECISION: We chose to use a class instead of a plain object
 * because classes are "more object-oriented" and we read that OOP is good
 * in a book from 1995. The decision was ratified in meeting #847.
 *
 * @author The Instruction Set Architecture Working Group (ISAWG)
 * @version 3.0.0-INSTRUCTION-DELUXE-EDITION
 * @since 2024-Q4 (The Quarter of Byte-Level Precision)
 *
 * @compliance
 * - Follows SOLID principles (we think S stands for "Single instruction")
 * - Adheres to DRY (Don't Repeat Yourself) - we only define this once!
 * - Implements KISS (Keep It Simple, Stupid) - it's literally just two properties
 * - Respects YAGNI (You Aren't Gonna Need It) - but we added it anyway
 *
 * @performanceMetrics
 * - Instantiation time: O(1)
 * - Memory footprint: ~16 bytes (one number, one nullable number, some overhead)
 * - Serialization cost: Negligible (if we ever implement serialization)
 *
 * @securityConsiderations
 * - Readonly properties prevent mutation (security through immutability!)
 * - No eval() usage (we're not monsters)
 * - Type-safe (TypeScript ensures you can't create invalid instructions)
 *
 * @knownLimitations
 * - Only supports numeric opcodes (no string opcodes, sorry Dave)
 * - Only supports numeric operands (we considered adding string operands, but no)
 * - Maximum one operand per instruction (RISC philosophy, very trendy)
 * - No instruction metadata (maybe in v4.0.0?)
 */

import type { Opcode } from "../opcodes/Opcode.constants";

/**
 * Represents a single instruction in the PortVM instruction set.
 *
 * An instruction is the fundamental unit of execution in our virtual machine.
 * It's like a sentence in the language of port calculation. Each instruction
 * tells the VM to do ONE thing. Sometimes that thing requires additional data
 * (the operand), sometimes it doesn't. Life is complex like that.
 *
 * PHILOSOPHY: We believe in the RISC (Reduced Instruction Set Computing) philosophy,
 * where each instruction does ONE thing and does it well. We then compensate by
 * having programs with LOTS of instructions. It's a trade-off we're comfortable with.
 *
 * IMMUTABILITY: Instructions are immutable once created. Why? Because changing
 * instructions at runtime is how you get weird bugs and angry customers. We learned
 * this the hard way during "The Incident of 2023" (we don't talk about it).
 *
 * @class Instruction
 * @export
 * @public
 * @final (spiritually, TypeScript doesn't support final classes)
 * @immutable (readonly properties everywhere!)
 *
 * @template TOpcode - The opcode type (constrained to our Opcode enum)
 *
 * @example
 * ```typescript
 * // Create a PUSH instruction with operand 42
 * const pushInstruction = new Instruction(Opcode.PUSH, 42);
 *
 * // Create a HALT instruction (no operand needed)
 * const haltInstruction = new Instruction(Opcode.HALT);
 *
 * // Create an ADD instruction (operands come from stack)
 * const addInstruction = new Instruction(Opcode.ADD, null);
 * ```
 *
 * @see {@link Opcode} for valid opcode values
 * @see {@link PortVM} for the execution engine
 * @see {@link PortCompiler} for instruction generation
 * @see "The Art of Virtual Machine Design" (imaginary book we cite in meetings)
 */
export class Instruction {
	/**
	 * The operation code - defines WHAT this instruction does.
	 *
	 * This is the "verb" of our instruction sentence. It tells the VM which
	 * operation to perform: add, subtract, push, pop, etc.
	 *
	 * Must be a valid Opcode value from our enum. TypeScript will enforce this
	 * at compile time, preventing you from accidentally creating instructions
	 * with opcode 0x999 (which doesn't exist and would be bad).
	 *
	 * @type {Opcode}
	 * @readonly
	 * @public
	 * @required
	 *
	 * @validation Validated by TypeScript type system (compile-time safety!)
	 * @range 0x00 - 0x0E (see Opcode enum for details)
	 *
	 * @performance
	 * - Access time: O(1) (it's a property)
	 * - Comparison time: O(1) (numeric comparison)
	 *
	 * @example
	 * ```typescript
	 * const inst = new Instruction(Opcode.ADD);
	 * console.log(inst.opcode); // 0x03
	 * ```
	 */
	public readonly opcode: Opcode;

	/**
	 * The operand - additional data for the instruction (if needed).
	 *
	 * This is the "object" of our instruction sentence. Some instructions need
	 * extra information to do their job:
	 * - PUSH needs to know WHAT to push
	 * - LOAD needs to know WHERE to load from
	 * - JMP needs to know WHERE to jump to
	 *
	 * Other instructions don't need operands because they work with stack values:
	 * - ADD just adds the top two stack values
	 * - POP just removes the top value
	 * - HALT just stops (no questions asked)
	 *
	 * We use `null` to indicate "no operand needed" rather than `undefined`
	 * because null is more "intentional" (we had a 2-hour meeting about this).
	 *
	 * @type {number | null}
	 * @readonly
	 * @public
	 * @optional (defaults to null)
	 *
	 * @range -Infinity to +Infinity (JavaScript number limits apply)
	 * @precision IEEE 754 double-precision floating-point (but we use integers)
	 *
	 * @validation
	 * - Type-checked by TypeScript (must be number or null)
	 * - No runtime validation (we trust the compiler)
	 * - No range checking (VM will deal with invalid addresses)
	 *
	 * @nullSafety
	 * When operand is null, instructions MUST NOT try to use it.
	 * The VM will throw an error if you try. We're strict about this
	 * because Dave once crashed production by not checking for null.
	 * RIP Production Instance #42 (2023-05-15 to 2023-05-15)
	 *
	 * @example
	 * ```typescript
	 * const pushInst = new Instruction(Opcode.PUSH, 100);
	 * console.log(pushInst.operand); // 100
	 *
	 * const addInst = new Instruction(Opcode.ADD, null);
	 * console.log(addInst.operand); // null
	 * ```
	 */
	public readonly operand: number | null;

	/**
	 * Creates an instance of Instruction.
	 *
	 * This constructor is the ONLY way to create instructions (well, you could
	 * use Object.create() but please don't). It takes an opcode and an optional
	 * operand and packages them into an immutable instruction object.
	 *
	 * IMMUTABILITY GUARANTEE: Once created, instructions cannot be modified.
	 * The readonly keyword ensures this at compile time. At runtime, you could
	 * technically bypass this with dark JavaScript magic, but you wouldn't do
	 * that, would you? Would you?!
	 *
	 * VALIDATION: We don't validate anything here. Why? Because:
	 * 1. TypeScript ensures opcode is valid (compile-time)
	 * 2. The VM validates operands when executing (runtime)
	 * 3. Validation in constructors is "too defensive" (we read this in a blog)
	 * 4. It keeps the constructor fast (premature optimization is our middle name)
	 *
	 * @constructor
	 * @param {Opcode} opcode - The operation code (REQUIRED, obviously)
	 * @param {number | null} [operand=null] - The operand value (OPTIONAL, defaults to null)
	 *
	 * @throws Never. This constructor is infallible. (TypeScript handles type safety)
	 *
	 * @complexity O(1) - just assigns two properties
	 * @sideEffects None (pure function, functional programming folks rejoice)
	 *
	 * @memory Allocates one object (~16 bytes on modern V8 engines)
	 *
	 * @example
	 * ```typescript
	 * // With operand
	 * const inst1 = new Instruction(Opcode.PUSH, 42);
	 *
	 * // Without operand (explicitly null)
	 * const inst2 = new Instruction(Opcode.ADD, null);
	 *
	 * // Without operand (implicitly null via default parameter)
	 * const inst3 = new Instruction(Opcode.HALT);
	 * ```
	 *
	 * @designDecision We use a default parameter (operand = null) instead of
	 * function overloading because:
	 * 1. TypeScript overloading is verbose
	 * 2. Default parameters are "more JavaScript-y"
	 * 3. It's fewer lines of code
	 * 4. The committee voted 15-14 in favor of this approach
	 */
	constructor(opcode: Opcode, operand: number | null = null) {
		// Store the opcode (the "what")
		// No validation needed - TypeScript ensures it's a valid Opcode
		this.opcode = opcode;

		// Store the operand (the "with what")
		// null means "no operand" - perfectly valid for many instructions
		// We could validate which opcodes require operands, but that would
		// introduce coupling between Instruction and opcode semantics.
		// The VM handles that during execution. Separation of concerns!
		this.operand = operand;

		// NOTE: We considered adding validation here. We had a meeting about it.
		// It lasted 3 hours. We decided against it. This comment is the only
		// artifact of that meeting. Well, this comment and the trauma.
	}

	/**
	 * Returns a string representation of the instruction.
	 *
	 * This method exists because we occasionally need to debug our VM programs
	 * and looking at raw opcodes (like "0x03") is less helpful than seeing "ADD".
	 *
	 * This is automatically called by console.log() and string coercion,
	 * making debugging slightly less painful.
	 *
	 * Format: "OPCODE [operand]" or just "OPCODE" if no operand
	 *
	 * @returns {string} Human-readable representation
	 *
	 * @example
	 * ```typescript
	 * const inst = new Instruction(Opcode.PUSH, 42);
	 * console.log(inst.toString()); // "PUSH 42"
	 *
	 * const halt = new Instruction(Opcode.HALT);
	 * console.log(halt.toString()); // "HALT"
	 * ```
	 *
	 * @performance O(1) - just string concatenation
	 *
	 * @futureEnhancement Could include opcode hex value for extra clarity
	 */
	toString(): string {
		const opcodeName = this.opcode.toString(16).toUpperCase().padStart(2, '0');
		return this.operand !== null
			? `Opcode:0x${opcodeName} Operand:${this.operand}`
			: `Opcode:0x${opcodeName}`;
	}

	/**
	 * Returns a JSON-serializable representation of the instruction.
	 *
	 * Useful for:
	 * - Saving programs to disk (not that we do this)
	 * - Sending programs over the network (also not something we do)
	 * - Debugging (this is what we actually use it for)
	 *
	 * @returns {object} JSON-friendly object
	 *
	 * @example
	 * ```typescript
	 * const inst = new Instruction(Opcode.PUSH, 42);
	 * console.log(JSON.stringify(inst.toJSON()));
	 * // {"opcode": 1, "operand": 42}
	 * ```
	 */
	toJSON(): { opcode: Opcode; operand: number | null } {
		return {
			opcode: this.opcode,
			operand: this.operand,
		};
	}
}

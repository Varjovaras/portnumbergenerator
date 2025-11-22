/**
 * @fileoverview The Port Virtual Machine - Enterprise Stack-Based Execution Engine
 * @module infrastructure/virtualization/vm
 * @category InfrastructureLayer
 * @subcategory VirtualizationEngine
 *
 * This file contains the crown jewel of our architecture: a fully functional,
 * stack-based virtual machine designed EXCLUSIVELY for calculating two port numbers.
 *
 * Yes, you read that correctly. We built an entire virtual machine with its own
 * instruction set, memory model, and execution engine to compute 6969 and 42069.
 *
 * WHY? Because someone suggested using addition, and we took that VERY seriously.
 * So seriously, in fact, that we created a Turing-complete execution environment.
 *
 * FEATURES:
 * - Stack-based architecture (like the JVM, but worse)
 * - 1024 bytes of simulated memory (more than enough for our needs)
 * - 15 opcodes (we considered 16 but that felt excessive)
 * - Instruction pointer (because we're professional)
 * - Error handling (learned from The Incident)
 * - Debug methods (20+ of them, because why not?)
 *
 * INSPIRATIONS:
 * - Java Virtual Machine (JVM) - for the stack-based approach
 * - .NET CLR - for making us feel inadequate
 * - Python VM - for being written in C (we used TypeScript)
 * - Ethereum VM - for showing us what "gas fees" could mean
 * - That CS course we half-remember from university
 *
 * PERFORMANCE:
 * - Executes ~7 instructions per port calculation
 * - Takes approximately 0.001ms (blazingly slow!)
 * - Could be replaced by a single addition, but where's the fun?
 * - Scales horizontally (if you run it multiple times)
 *
 * @author The Virtual Machine Architecture Council (VMAC)
 * @version 4.0.0-TURING-COMPLETE-EDITION
 * @since 2024-Q4 (The Quarter We Discovered Computer Science)
 *
 * @compliance
 * - Violates: KISS principle, YAGNI principle, common sense
 * - Adheres to: Over-engineering best practices, enterprise standards
 * - Compatible with: Any JavaScript runtime (probably)
 *
 * @dedication
 * This VM is dedicated to every CS student who learned about stack machines
 * and thought "I'll never actually build one of these." We did. For port numbers.
 */

import type { Opcode } from "./opcodes/Opcode.constants";
import { Opcode as OpcodeEnum } from "./opcodes/Opcode.constants";
import type { Instruction } from "./instruction-set/Instruction.class";

/**
 * The Port Virtual Machine - A stack-based execution engine for port calculation.
 *
 * This VM implements a complete stack-based architecture with:
 * - Dynamic stack (grows as needed, because memory is cheap)
 * - Fixed memory (1024 slots, because 2^10 is a nice number)
 * - Instruction pointer (for keeping track of where we are)
 * - Running flag (so we know when to stop)
 *
 * ARCHITECTURE DECISION: Why stack-based?
 *
 * We had a 4-hour meeting about this. Options considered:
 * 1. Register-based (like x86) - Too mainstream
 * 2. Accumulator-based (like 8080) - Too retro
 * 3. Stack-based (like JVM) - Just right (Goldilocks approved)
 * 4. Quantum-based - Technology not ready yet (Q3 2025)
 *
 * Stack-based won because:
 * - It's "simpler" (committee's words, not ours)
 * - We can use JavaScript arrays (lazy, but efficient)
 * - It makes us sound smart at conferences
 * - The intern who built the first version knew stacks
 *
 * MEMORY MODEL:
 *
 * We have 1024 memory slots because:
 * - 2^10 is a power of 2 (very computer science)
 * - 1024 is easy to remember
 * - We'll never use more than 0 of them
 * - But they're there, just in case
 * - Future-proofing is important (the committee insists)
 *
 * @class PortVM
 * @export
 * @public
 *
 * @example
 * ```typescript
 * // Create a VM (easy!)
 * const vm = new PortVM();
 *
 * // Load a program (compiled bytecode)
 * vm.loadProgram([
 *   new Instruction(Opcode.PUSH, 6969),
 *   new Instruction(Opcode.HALT)
 * ]);
 *
 * // Execute (the magic happens here)
 * const result = vm.run(); // 6969
 *
 * // Marvel at our engineering prowess
 * console.log(`We used a VM to calculate: ${result}`);
 * ```
 *
 * @see {@link Opcode} for available operations
 * @see {@link Instruction} for instruction format
 * @see {@link PortCompiler} for bytecode generation
 * @see "The Art of Virtual Machine Design" (we made this up)
 */
export class PortVM {
	/**
	 * The execution stack (LIFO - Last In, First Out)
	 *
	 * This is where all the magic happens. Values get pushed on, popped off,
	 * and occasionally forgotten about when we forget to pop them (memory leak!).
	 *
	 * We use a JavaScript array because:
	 * - Array.push() is literally PUSH
	 * - Array.pop() is literally POP
	 * - It's dynamic (grows as needed)
	 * - It's fast enough™
	 *
	 * Maximum stack depth: Unlimited (until you run out of RAM)
	 * Typical stack depth: 2-3 values
	 * Our stack depth: 7 (we counted)
	 */
	private stack: number[] = [];

	/**
	 * Simulated memory (1024 slots of pure potential)
	 *
	 * This is our "RAM". 1024 slots, each can hold a number.
	 * We use exactly 0 of these slots in production.
	 * But they're here, ready, waiting, hoping to be useful someday.
	 *
	 * Fun fact: We had a debate about whether to use a Map or Array.
	 * Array won because "it's more like real memory" (quote from meeting #83).
	 *
	 * Memory access time: O(1)
	 * Memory we actually use: 0 bytes
	 * Memory we allocated: 8KB (8 bytes per number × 1024)
	 * Efficiency: 0%
	 */
	private memory: number[] = new Array(1024).fill(0);

	/**
	 * Instruction Pointer (IP)
	 *
	 * Points to the current instruction being executed.
	 * Increments after each instruction (usually).
	 * Can be modified by JMP, JZ, JNZ instructions (scary!).
	 *
	 * Also known as:
	 * - Program Counter (PC) in some architectures
	 * - "that thing that keeps track of stuff" in meetings
	 * - The index variable we could've just used in a loop
	 *
	 * Range: 0 to program.length - 1
	 * Typical value: 0-7 (our programs are short)
	 */
	private ip = 0;

	/**
	 * The loaded program (array of instructions)
	 *
	 * This is our "software". An array of Instruction objects that tell
	 * the VM what to do. It's like machine code, but in JavaScript objects.
	 *
	 * Loaded via loadProgram() method.
	 * Executed via run() method.
	 * Debugged via... good luck.
	 */
	private program: Instruction[] = [];

	/**
	 * Running flag (are we executing or just chillin'?)
	 *
	 * true: VM is executing instructions
	 * false: VM is idle (or hit HALT instruction)
	 *
	 * This is how we stop execution. When HALT is encountered,
	 * this gets set to false and the execution loop exits.
	 *
	 * Alternative names considered:
	 * - isExecuting
	 * - shouldContinue
	 * - pleaseStop (rejected for being too polite)
	 * - running (winner! shortest name!)
	 */
	private running = false;

	/**
	 * Loads a program into the VM.
	 *
	 * This method takes an array of Instructions and loads them into the VM.
	 * It also resets the VM state (IP, stack, running flag) because starting
	 * fresh is important for deterministic execution.
	 *
	 * IMPORTANT: This doesn't execute anything! It just loads. Like putting
	 * a cartridge in a game console. You still need to press start (call run()).
	 *
	 * @param {Instruction[]} program - The program to load (array of instructions)
	 *
	 * @sideEffects
	 * - Stores program in memory (or simulated memory, technically)
	 * - Resets instruction pointer to 0
	 * - Clears the stack (bye bye old values)
	 * - Sets running flag to false
	 *
	 * @example
	 * ```typescript
	 * const vm = new PortVM();
	 * const program = compiler.compile("frontend");
	 * vm.loadProgram(program);
	 * // VM is now loaded but not running
	 * ```
	 */
	loadProgram(program: Instruction[]): void {
		// Store the program (copy reference, we trust you not to mutate it)
		this.program = program;

		// Reset instruction pointer to start
		// (because 0 is where programs begin, this is not controversial)
		this.ip = 0;

		// Clear any old stack values
		// (prevents values from previous runs leaking into new execution)
		// (we learned this the hard way during The Incident)
		this.stack = [];

		// Ensure we're not running
		// (defensive programming, the committee loves this)
		this.running = false;
	}

	/**
	 * Executes the loaded program.
	 *
	 * This is the big one. The main execution loop. The heart of the VM.
	 * It runs through the loaded program instruction by instruction until:
	 * 1. HALT instruction is encountered (normal termination)
	 * 2. End of program reached (also works)
	 * 3. An error is thrown (abnormal termination, someone call DevOps)
	 *
	 * EXECUTION MODEL:
	 * while (running && more instructions) {
	 *   execute current instruction
	 *   move to next instruction
	 * }
	 *
	 * After execution, we pop the final result from the stack.
	 * If the stack is empty, something went wrong (probably our fault).
	 * If the stack has multiple values, we take the top one (and ignore the rest).
	 *
	 * @returns {number} The final result (top of stack after execution)
	 *
	 * @throws {Error} If stack is empty after execution (bad program!)
	 * @throws {Error} If result is undefined (should never happen, but here we are)
	 * @throws {Error} If instruction execution fails (could be many reasons)
	 *
	 * @performance O(n) where n = number of instructions (usually 7 for us)
	 *
	 * @example
	 * ```typescript
	 * const vm = new PortVM();
	 * vm.loadProgram(program);
	 * const port = vm.run(); // Execute!
	 * console.log(`Port calculated: ${port}`);
	 * ```
	 */
	run(): number {
		// Set running flag to true (we're starting execution!)
		this.running = true;

		// Main execution loop
		// Continue while: running flag is true AND we have more instructions
		while (this.running && this.ip < this.program.length) {
			// Fetch current instruction
			const instruction = this.program[this.ip];

			// Execute it (this is where the magic happens)
			// executeInstruction() is private and handles all the opcodes
			this.executeInstruction(instruction);

			// Move to next instruction
			// (unless it was a jump, in which case IP was already modified)
			this.ip++;
		}

		// Execution complete! Check if we have a result on the stack
		if (this.stack.length === 0) {
			// No result on stack = something went wrong
			// This should never happen if program ends with HALT and pushed a value
			throw new Error("PortVM Error: Stack empty after execution");
		}

		// Pop the final result from stack
		const result = this.stack.pop();

		// Paranoid check: ensure result isn't undefined
		// (TypeScript says pop() can return undefined, we don't trust it)
		if (result === undefined) {
			// This really, truly, absolutely should never happen
			// But we check anyway because The Incident taught us to be paranoid
			throw new Error("PortVM Error: Unexpected undefined value");
		}

		// Return the calculated port number!
		// (after all that, it's just a number)
		return result;
	}

	/**
	 * Executes a single instruction.
	 *
	 * This is the "fetch-decode-execute" cycle, but we already fetched,
	 * so this is just "decode-execute". We look at the opcode, figure out
	 * what to do, and do it.
	 *
	 * Big switch statement ahead. We know switch statements are "bad" but:
	 * 1. They're fast
	 * 2. They're readable
	 * 3. They're traditional for VM instruction dispatch
	 * 4. The committee approved it (after 2 meetings)
	 *
	 * Each case handles one opcode. Some are simple (HALT: stop running).
	 * Some are complex (DIV: check for division by zero, pop, divide, push).
	 *
	 * ERROR HANDLING:
	 * We throw errors liberally. Stack underflow? Error. Division by zero? Error.
	 * Missing operand? Believe it or not, also error. We learned from The Incident
	 * that failing fast is better than silent corruption.
	 *
	 * @param {Instruction} instruction - The instruction to execute
	 *
	 * @private
	 * @throws {Error} For any instruction execution failure
	 *
	 * @performance O(1) per instruction (mostly, except maybe DUP and SWAP)
	 */
	private executeInstruction(instruction: Instruction): void {
		// The big switch statement of destiny
		switch (instruction.opcode) {

			// ═══════════════════════════════════════════════════════════
			// CONTROL FLOW INSTRUCTIONS
			// ═══════════════════════════════════════════════════════════

			case OpcodeEnum.HALT:
				// Stop execution immediately
				// No operand needed, no stack operations, just stop
				// This is the instruction equivalent of "I'm done, goodbye"
				this.running = false;
				break;

			// ═══════════════════════════════════════════════════════════
			// STACK MANIPULATION INSTRUCTIONS
			// ═══════════════════════════════════════════════════════════

			case OpcodeEnum.PUSH:
				// Push operand onto stack
				// Requires: operand (the value to push)
				// Stack effect: [] -> [operand]
				if (instruction.operand === null)
					throw new Error("PUSH requires operand");
				this.stack.push(instruction.operand);
				break;

			case OpcodeEnum.POP:
				// Remove top value from stack (and discard it)
				// No operand needed
				// Stack effect: [value] -> []
				// Note: We don't check if stack is empty because pop() returns undefined
				// and we don't care about the returned value (we're discarding it)
				this.stack.pop();
				break;

			case OpcodeEnum.DUP: {
				// Duplicate top stack value
				// Stack effect: [value] -> [value, value]
				// Useful when you need to keep a value but also use it
				const val = this.stack[this.stack.length - 1];
				this.stack.push(val);
				break;
			}

			case OpcodeEnum.SWAP: {
				// Swap top two stack values
				// Stack effect: [a, b] -> [b, a]
				// Useful when values are in wrong order (happens more than you'd think)
				const b = this.stack.pop();
				const a = this.stack.pop();
				if (a === undefined || b === undefined)
					throw new Error("Stack underflow");
				this.stack.push(b); // b goes first (was on top)
				this.stack.push(a); // a goes second (was second)
				break;
			}

			// ═══════════════════════════════════════════════════════════
			// ARITHMETIC INSTRUCTIONS
			// ═══════════════════════════════════════════════════════════

			case OpcodeEnum.ADD: {
				// Add top two stack values
				// Stack effect: [a, b] -> [a + b]
				// This is literally the whole reason we built a VM
				// To do addition. We could've just used +. But no.
				const b = this.stack.pop();
				const a = this.stack.pop();
				if (a === undefined || b === undefined)
					throw new Error("Stack underflow");
				this.stack.push(a + b); // Math! In a VM! Amazing!
				break;
			}

			case OpcodeEnum.SUB: {
				// Subtract top two stack values
				// Stack effect: [a, b] -> [a - b]
				// Order matters! a - b, not b - a
				const b = this.stack.pop();
				const a = this.stack.pop();
				if (a === undefined || b === undefined)
					throw new Error("Stack underflow");
				this.stack.push(a - b);
				break;
			}

			case OpcodeEnum.MUL: {
				// Multiply top two stack values
				// Stack effect: [a, b] -> [a * b]
				// We don't use this for port calculation, but it's here for completeness
				// (and to justify building a "real" VM)
				const b = this.stack.pop();
				const a = this.stack.pop();
				if (a === undefined || b === undefined)
					throw new Error("Stack underflow");
				this.stack.push(a * b);
				break;
			}

			case OpcodeEnum.DIV: {
				// Divide top two stack values
				// Stack effect: [a, b] -> [a / b]
				// DANGER ZONE: Division by zero check required
				// We learned this during The Incident (production went down for 3 hours)
				const b = this.stack.pop();
				const a = this.stack.pop();
				if (a === undefined || b === undefined)
					throw new Error("Stack underflow");
				if (b === 0)
					throw new Error("Division by zero"); // THE INCIDENT
				this.stack.push(a / b);
				break;
			}

			// ═══════════════════════════════════════════════════════════
			// MEMORY INSTRUCTIONS
			// ═══════════════════════════════════════════════════════════

			case OpcodeEnum.LOAD:
				// Load value from memory onto stack
				// Requires: operand (memory address)
				// Stack effect: [] -> [memory[address]]
				// We have 1024 memory slots. We use 0 of them. But they're here!
				if (instruction.operand === null)
					throw new Error("LOAD requires operand");
				this.stack.push(this.memory[instruction.operand]);
				break;

			case OpcodeEnum.STORE: {
				// Store top stack value into memory
				// Requires: operand (memory address)
				// Stack effect: [value] -> []
				// This mutates memory! Gasp! Side effects! The functional programmers are crying!
				if (instruction.operand === null)
					throw new Error("STORE requires operand");
				const val = this.stack.pop();
				if (val === undefined)
					throw new Error("Stack underflow");
				this.memory[instruction.operand] = val;
				break;
			}

			// ═══════════════════════════════════════════════════════════
			// JUMP INSTRUCTIONS (CONTROL FLOW)
			// ═══════════════════════════════════════════════════════════

			case OpcodeEnum.JMP:
				// Unconditional jump to instruction
				// Requires: operand (target instruction index)
				// Modifies IP directly (scary!)
				// We subtract 1 because the main loop will increment IP after this
				if (instruction.operand === null)
					throw new Error("JMP requires operand");
				this.ip = instruction.operand - 1;
				break;

			case OpcodeEnum.JZ: {
				// Jump if top stack value is zero
				// Requires: operand (target instruction index)
				// Stack effect: [value] -> []
				// Conditional jump! This is how you do IF statements in assembly!
				if (instruction.operand === null)
					throw new Error("JZ requires operand");
				const val = this.stack.pop();
				if (val === undefined)
					throw new Error("Stack underflow");
				if (val === 0)
					this.ip = instruction.operand - 1;
				break;
			}

			// Note: JNZ (Jump if Not Zero) is defined in opcodes but not implemented
			// because we don't use it. It would go here if we did. Maybe in v5.0.

			// ═══════════════════════════════════════════════════════════
			// DEFAULT: UNKNOWN OPCODE
			// ═══════════════════════════════════════════════════════════

			default:
				// Unknown opcode! This should never happen if Instruction class
				// is used correctly and opcodes are validated. But we check anyway.
				// Trust no one, not even yourself.
				throw new Error(`Unknown Opcode: ${instruction.opcode}`);
		}
	}

	// ═════════════════════════════════════════════════════════════════════
	// DEBUG & INTROSPECTION METHODS
	// (Because debugging a VM is hard, so we added 20+ helper methods)
	// ═════════════════════════════════════════════════════════════════════

	/**
	 * Gets the current stack depth (number of values on stack).
	 * Useful for debugging, testing, and satisfying curiosity.
	 */
	getStackDepth(): number {
		return this.stack.length;
	}

	/**
	 * Peeks at the top stack value without popping it.
	 * Returns undefined if stack is empty (we could throw, but we're nice here).
	 */
	peek(): number | undefined {
		return this.stack[this.stack.length - 1];
	}

	/**
	 * Clears the entire stack.
	 * Nuclear option. Use with caution. Or reckless abandon. We don't judge.
	 */
	clearStack(): void {
		this.stack = [];
	}

	/**
	 * Resets the VM to initial state.
	 * Like turning it off and on again, but programmatically.
	 * Clears stack, memory, resets IP, stops execution.
	 */
	reset(): void {
		this.stack = [];
		this.memory = new Array(1024).fill(0);
		this.ip = 0;
		this.running = false;
	}

	/**
	 * Gets the current instruction pointer value.
	 * Tells you which instruction is currently being executed (or about to be).
	 */
	getInstructionPointer(): number {
		return this.ip;
	}

	/**
	 * Checks if the VM is currently running.
	 * Useful for... actually, we're not sure. But it's here!
	 */
	isRunning(): boolean {
		return this.running;
	}

	/**
	 * Gets the total program length (number of instructions).
	 * For our use case: always 7 instructions. But we check anyway.
	 */
	getProgramLength(): number {
		return this.program.length;
	}

	/**
	 * Retrieves a value from memory at a specific address.
	 * Returns 0 if address is out of bounds (because we're forgiving).
	 */
	getMemory(address: number): number {
		return this.memory[address] || 0;
	}

	/**
	 * Sets a value in memory at a specific address.
	 * Mutates memory! The horror! But sometimes you need side effects.
	 */
	setMemory(address: number, value: number): void {
		this.memory[address] = value;
	}

	/**
	 * Dumps the current stack state (returns a copy).
	 * Useful for debugging, testing, and showing off to your friends.
	 */
	dumpStack(): number[] {
		return [...this.stack];
	}

	/**
	 * Dumps the current memory state (returns a copy).
	 * Warning: This is 1024 numbers. That's a lot of numbers.
	 * Most will be 0. But they're all there. Waiting.
	 */
	dumpMemory(): number[] {
		return [...this.memory];
	}

	/**
	 * Gets execution statistics.
	 * Returns an object with useful metrics about the current VM state.
	 * Perfect for dashboards that monitor VM health (we don't have one, but we could!).
	 */
	getStats(): {
		stackDepth: number;
		memoryUsed: number;
		programLength: number;
	} {
		return {
			stackDepth: this.stack.length,
			memoryUsed: this.memory.filter(v => v !== 0).length,
			programLength: this.program.length,
		};
	}

	/**
	 * Validates the current loaded program.
	 * Checks if program exists and ends with HALT instruction.
	 * Returns true if valid, false if not.
	 *
	 * NOTE: This is basic validation. A real VM would check way more:
	 * - Jump targets are valid
	 * - Stack operations won't underflow
	 * - Memory accesses are in bounds
	 * - No infinite loops
	 * But we trust our compiler. Dangerous? Maybe. Easy? Definitely.
	 */
	validateProgram(): boolean {
		return (
			this.program.length > 0 &&
			this.program[this.program.length - 1].opcode === OpcodeEnum.HALT
		);
	}

	/**
	 * Steps through one instruction without running the full program.
	 * Like a debugger's "step" command. Execute one instruction, then stop.
	 * Returns true if more instructions remain, false if we're at the end.
	 *
	 * Useful for:
	 * - Debugging
	 * - Education (watch the VM execute step by step!)
	 * - Making yourself feel like you're using GDB
	 */
	step(): boolean {
		// Check if we've reached the end
		if (this.ip >= this.program.length) return false;

		// Execute current instruction
		const instruction = this.program[this.ip];
		this.executeInstruction(instruction);

		// Move to next instruction
		this.ip++;

		// Return true if more instructions remain
		return this.ip < this.program.length;
	}

	/**
	 * Disassembles the loaded program to human-readable format.
	 * Converts bytecode back to assembly-like strings.
	 * Returns an array of strings like: "0: PUSH 6000"
	 *
	 * This is what you'd see in a debugger's disassembly view.
	 * Useful for understanding what the program actually does
	 * without executing it.
	 *
	 * NOTE: We reverse-lookup opcode names from the enum.
	 * This is inefficient but we don't care because:
	 * 1. It's only for debugging
	 * 2. Programs are short (7 instructions)
	 * 3. Performance doesn't matter here
	 * 4. It works and we're not changing it
	 */
	disassemble(): string[] {
		return this.program.map((inst, idx) => {
			// Find the name of this opcode (reverse lookup in enum)
			const opName = Object.keys(OpcodeEnum).find(
				k => OpcodeEnum[k as keyof typeof OpcodeEnum] === inst.opcode
			);

			// Format: "index: OPCODE operand" or "index: OPCODE"
			return `${idx}: ${opName}${inst.operand !== null ? ` ${inst.operand}` : ""}`;
		});
	}
}

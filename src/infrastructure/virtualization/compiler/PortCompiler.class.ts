/**
 * @fileoverview Enterprise Port Number Bytecode Compiler with Aggressive Caching
 * @module infrastructure/virtualization/compiler
 * @category InfrastructureLayer
 * @subcategory CompilerSubsystem
 *
 * This file contains the PortCompiler™, a sophisticated bytecode compiler that
 * transforms high-level port requests (like "frontend" or "backend") into
 * executable bytecode for the PortVM™.
 *
 * Yes, we built a COMPILER. For port numbers. Let that sink in.
 *
 * WHAT IT DOES:
 * - Takes a string ("frontend" or "backend")
 * - Generates a sequence of VM instructions
 * - Caches the result (because compiling is "expensive")
 * - Returns bytecode ready for execution
 *
 * WHY WE NEED A COMPILER:
 * We had a 3-hour meeting about this. Options were:
 * 1. Just return the number directly (too simple, rejected immediately)
 * 2. Use a lookup table (not enterprise enough)
 * 3. Build a compiler (perfect! buzzword compliant!)
 *
 * COMPILATION STRATEGY:
 * - Frontend: 6000 + 900 + 60 + 9 = 6969
 * - Backend: 40000 + 2000 + 60 + 9 = 42069
 *
 * We break the addition into multiple steps because:
 * 1. It demonstrates our VM can do multiple operations
 * 2. It looks more impressive in disassembly
 * 3. We could've just done PUSH 6969, but that's boring
 * 4. Job security through complexity
 *
 * CACHING:
 * We cache compiled programs because "compilation is expensive."
 * In reality, compilation takes 0.0001ms, but the cache makes us feel smart.
 * Plus, it's a best practice from that conference we went to.
 *
 * PERFORMANCE:
 * - First compilation: ~0.0003ms (with caching overhead)
 * - Cached compilation: ~0.00001ms (Map lookup)
 * - Speedup: 30x faster! (ignore that both are effectively instant)
 * - Cache hit rate: 99.99% (we compile the same two programs forever)
 *
 * @author The Compiler Construction Committee (Triple-C™)
 * @version 5.0.0-OPTIMIZING-COMPILER-EDITION
 * @since 2024-Q4 (The Quarter We Became Computer Scientists)
 *
 * @compliance
 * - Follows: Compiler design principles (sort of)
 * - Implements: Memoization pattern (fancy caching)
 * - Violates: Occam's Razor (the simplest solution is rarely the best)
 *
 * @inspirations
 * - GCC (we're nothing like GCC, but it sounds impressive)
 * - LLVM (also nothing like us, but another buzzword!)
 * - V8's JIT compiler (we're not JIT, we're AOT... kinda)
 * - That compiler course we audited in college
 *
 * @futureEnhancements
 * - Optimization passes (dead code elimination, constant folding)
 * - Register allocation (we don't have registers, but still)
 * - Inline expansion (we don't have functions, but hear me out)
 * - Profile-guided optimization (based on the two programs we run)
 * - JIT compilation (compile at runtime... wait, we already do that)
 */

import type { Instruction } from "../vm/instruction-set/Instruction.class";
import { Instruction as InstructionClass } from "../vm/instruction-set/Instruction.class";
import { Opcode } from "../vm/opcodes/Opcode.constants";

/**
 * PortCompiler - Transforms port requests into executable VM bytecode
 *
 * This class is responsible for the critical task of generating bytecode
 * that the PortVM can execute. It's called a "compiler" because that sounds
 * more impressive than "instruction generator."
 *
 * ARCHITECTURE:
 * - Input: String ("frontend" or "backend")
 * - Output: Array of Instruction objects (bytecode)
 * - Cache: Map<string, Instruction[]> (for performance!)
 *
 * COMPILATION PHASES:
 * 1. Cache lookup (check if we've compiled this before)
 * 2. Code generation (create instruction sequence)
 * 3. Cache storage (save for future use)
 * 4. Return bytecode (ready for execution!)
 *
 * Traditional compilers have phases like:
 * - Lexical analysis (tokenization)
 * - Syntax analysis (parsing)
 * - Semantic analysis (type checking)
 * - Intermediate representation (IR generation)
 * - Optimization (multiple passes)
 * - Code generation (target code emission)
 *
 * Our compiler has phases like:
 * - Check cache
 * - If-else statement
 * - Push instructions to array
 * - Update cache
 *
 * We're basically the same thing.
 *
 * OPTIMIZATION LEVEL: -O0 (no optimizations)
 * Why? Because we decided optimization is premature.
 * Also, we don't know how to optimize. But mostly the first reason.
 *
 * @class PortCompiler
 * @export
 * @public
 *
 * @example
 * ```typescript
 * const compiler = new PortCompiler();
 *
 * // Compile frontend port calculation
 * const frontendProgram = compiler.compile("frontend");
 * // Returns: [PUSH 6000, PUSH 900, ADD, PUSH 60, ADD, PUSH 9, ADD, HALT]
 *
 * // Compile again (cache hit!)
 * const cachedProgram = compiler.compile("frontend");
 * // Returns same reference (Map lookup, very fast!)
 *
 * // Check stats
 * console.log(compiler.getCacheStats());
 * // { size: 1, count: 1 } - one unique program, compiled once
 * ```
 *
 * @see {@link PortVM} for bytecode execution
 * @see {@link Instruction} for instruction format
 * @see "Compilers: Principles, Techniques, and Tools" (we didn't read it)
 */
export class PortCompiler {
	/**
	 * Compilation cache (Map of program type to compiled bytecode)
	 *
	 * This Map stores previously compiled programs to avoid recompilation.
	 * It's "memoization" - caching function results based on inputs.
	 *
	 * Key: Program type string ("frontend" or "backend")
	 * Value: Compiled bytecode (Instruction[])
	 *
	 * We use Map instead of plain object because:
	 * 1. Maps are "more modern" (said someone in a meeting)
	 * 2. They have .size property (convenient!)
	 * 3. They feel more "enterprise"
	 * 4. The intern who built this knew Maps
	 *
	 * Cache capacity: Unlimited (we only cache 2 programs, so...)
	 * Cache eviction policy: Never (YOLO memory management)
	 * Cache hit rate: 99.99% (after first compilation)
	 *
	 * Memory usage: ~2KB for both programs
	 * Memory saved by caching: ~0.001KB per compilation
	 * ROI: Priceless (in our hearts)
	 */
	private compilationCache = new Map<string, Instruction[]>();

	/**
	 * Total number of compilations performed
	 *
	 * Tracks how many times we've actually compiled a program (not cached).
	 * Useful for metrics, dashboards, and impressing management.
	 *
	 * Expected value: 2 (frontend + backend, first time only)
	 * Actual value: Usually 2, sometimes more if cache is cleared
	 *
	 * This number is reported to:
	 * - Performance monitoring dashboards (that don't exist)
	 * - Log aggregation systems (that we don't have)
	 * - The void (mostly this one)
	 */
	private compilationCount = 0;

	/**
	 * Compiles a high-level port request into executable bytecode.
	 *
	 * This is the main public API. You give it a string, it gives you bytecode.
	 * Simple from the outside, unnecessarily complex on the inside (enterprise!).
	 *
	 * COMPILATION PROCESS:
	 *
	 * Step 1: Check cache
	 * - Have we compiled this before?
	 * - If yes: return cached bytecode (Map lookup, O(1))
	 * - If no: continue to step 2
	 *
	 * Step 2: Generate bytecode
	 * - Create empty program array
	 * - Based on type, emit appropriate instruction sequence
	 * - Add HALT instruction (always terminate properly)
	 *
	 * Step 3: Update cache
	 * - Store compiled program in Map
	 * - Increment compilation counter (for metrics)
	 *
	 * Step 4: Return bytecode
	 * - Give caller the compiled program
	 * - VM can now execute it
	 *
	 * INSTRUCTION SEQUENCES:
	 *
	 * Frontend (6969):
	 * - PUSH 6000  // Start with 6000
	 * - PUSH 900   // Add 900
	 * - ADD        // 6900
	 * - PUSH 60    // Add 60
	 * - ADD        // 6960
	 * - PUSH 9     // Add 9
	 * - ADD        // 6969 ✨
	 * - HALT       // Stop
	 *
	 * Backend (42069):
	 * - PUSH 40000 // Start with 40000
	 * - PUSH 2000  // Add 2000
	 * - ADD        // 42000
	 * - PUSH 60    // Add 60
	 * - ADD        // 42060
	 * - PUSH 9     // Add 9
	 * - ADD        // 42069 ✨
	 * - HALT       // Stop
	 *
	 * Why not just PUSH 6969 / PUSH 42069?
	 * - Too obvious
	 * - Doesn't show off our VM's capabilities
	 * - Breaking it into steps makes it look complex (job security)
	 * - We can say we do "arithmetic operations" (technically true)
	 *
	 * @param {string} type - The port type ("frontend" or "backend")
	 * @returns {Instruction[]} Compiled bytecode ready for VM execution
	 *
	 * @throws Never. Invalid types just get backend bytecode (defensive programming!)
	 *
	 * @performance
	 * - Cache hit: O(1) - Map lookup (~0.00001ms)
	 * - Cache miss: O(n) where n = 7 instructions (~0.0003ms)
	 * - Both are effectively instant, but we track it anyway
	 *
	 * @example
	 * ```typescript
	 * const compiler = new PortCompiler();
	 *
	 * // First compilation (cache miss)
	 * const program1 = compiler.compile("frontend");
	 * console.log(compiler.getCompilationCount()); // 1
	 *
	 * // Second compilation (cache hit!)
	 * const program2 = compiler.compile("frontend");
	 * console.log(compiler.getCompilationCount()); // Still 1!
	 * console.log(program1 === program2); // true (same reference!)
	 * ```
	 */
	compile(type: string): Instruction[] {
		// ═══════════════════════════════════════════════════════════════
		// PHASE 1: CACHE LOOKUP (Optimization!)
		// ═══════════════════════════════════════════════════════════════

		// Check if we've already compiled this program
		// Map.get() is O(1) - very fast (usually)
		const cached = this.compilationCache.get(type);

		if (cached) {
			// Cache hit! Return cached program immediately
			// This saves us the expensive work of... creating 7 objects
			// (okay it's not that expensive, but cache hits feel good)
			return cached;
		}

		// Cache miss! We need to compile from scratch
		// This happens exactly once per program type (in theory)
		// After that, it's all cache hits all the time

		// ═══════════════════════════════════════════════════════════════
		// PHASE 2: CODE GENERATION (The actual "compiling")
		// ═══════════════════════════════════════════════════════════════

		// Create empty program (instruction array)
		const program: Instruction[] = [];

		// Generate instruction sequence based on port type
		// This is the "if-else" at the heart of our compiler
		// (Real compilers have symbol tables and ASTs, we have if-else)

		if (type === "frontend") {
			// ───────────────────────────────────────────────────────────
			// FRONTEND PORT COMPILATION (6969)
			// ───────────────────────────────────────────────────────────
			// Strategy: 6000 + 900 + 60 + 9 = 6969
			// Why this breakdown? Why not! It's arbitrary but it works!
			// ───────────────────────────────────────────────────────────

			program.push(new InstructionClass(Opcode.PUSH, 6000));
			// Stack: [6000]

			program.push(new InstructionClass(Opcode.PUSH, 900));
			// Stack: [6000, 900]

			program.push(new InstructionClass(Opcode.ADD));
			// Stack: [6900]
			// (6000 + 900 = 6900, look at us doing math!)

			program.push(new InstructionClass(Opcode.PUSH, 60));
			// Stack: [6900, 60]

			program.push(new InstructionClass(Opcode.ADD));
			// Stack: [6960]
			// (6900 + 60 = 6960, we're so close!)

			program.push(new InstructionClass(Opcode.PUSH, 9));
			// Stack: [6960, 9]

			program.push(new InstructionClass(Opcode.ADD));
			// Stack: [6969]
			// (6960 + 9 = 6969, we did it! ✨)

		} else {
			// ───────────────────────────────────────────────────────────
			// BACKEND PORT COMPILATION (42069)
			// ───────────────────────────────────────────────────────────
			// Strategy: 40000 + 2000 + 60 + 9 = 42069
			// Default case: any unknown type gets backend bytecode
			// (Defensive programming! Or lazy validation! You decide!)
			// ───────────────────────────────────────────────────────────

			program.push(new InstructionClass(Opcode.PUSH, 40000));
			// Stack: [40000]
			// (Big number! This is serious backend territory)

			program.push(new InstructionClass(Opcode.PUSH, 2000));
			// Stack: [40000, 2000]

			program.push(new InstructionClass(Opcode.ADD));
			// Stack: [42000]
			// (40000 + 2000 = 42000, getting closer to the answer to everything)

			program.push(new InstructionClass(Opcode.PUSH, 60));
			// Stack: [42000, 60]

			program.push(new InstructionClass(Opcode.ADD));
			// Stack: [42060]
			// (42000 + 60 = 42060, almost there!)

			program.push(new InstructionClass(Opcode.PUSH, 9));
			// Stack: [42060, 9]

			program.push(new InstructionClass(Opcode.ADD));
			// Stack: [42069]
			// (42060 + 9 = 42069, the answer to life, universe, and backends! ✨)
		}

		// ───────────────────────────────────────────────────────────────
		// ALWAYS ADD HALT INSTRUCTION
		// ───────────────────────────────────────────────────────────────
		// Every well-formed program MUST end with HALT
		// Otherwise the VM keeps executing and bad things happen
		// We learned this during The Incident (we don't talk about it)
		// ───────────────────────────────────────────────────────────────

		program.push(new InstructionClass(Opcode.HALT));
		// VM will stop here, preventing runaway execution
		// This is non-negotiable, mandatory, required, essential

		// ═══════════════════════════════════════════════════════════════
		// PHASE 3: CACHE STORAGE (For future performance!)
		// ═══════════════════════════════════════════════════════════════

		// Store compiled program in cache for next time
		// This makes subsequent compilations instant (Map lookup)
		this.compilationCache.set(type, program);

		// Increment compilation counter (for metrics and bragging rights)
		// This tracks actual compilations, not cache hits
		this.compilationCount++;

		// ═══════════════════════════════════════════════════════════════
		// PHASE 4: RETURN (Give caller the bytecode)
		// ═══════════════════════════════════════════════════════════════

		// Return the freshly compiled program
		// Next time this type is compiled, we'll return cached version
		return program;
	}

	/**
	 * Gets the total number of programs actually compiled (cache misses).
	 *
	 * This counts only actual compilations, not cache hits.
	 * Useful for:
	 * - Performance metrics (how much work are we avoiding?)
	 * - Debugging (did cache work as expected?)
	 * - Impressing people (look how few compilations we need!)
	 *
	 * Expected value: 2 (one for frontend, one for backend)
	 * If higher: either cache was cleared or someone's requesting weird types
	 *
	 * @returns {number} Total compilation count
	 *
	 * @example
	 * ```typescript
	 * const compiler = new PortCompiler();
	 * console.log(compiler.getCompilationCount()); // 0 (nothing compiled yet)
	 *
	 * compiler.compile("frontend");
	 * console.log(compiler.getCompilationCount()); // 1 (compiled frontend)
	 *
	 * compiler.compile("frontend");
	 * console.log(compiler.getCompilationCount()); // 1 (cache hit, no recompilation!)
	 *
	 * compiler.compile("backend");
	 * console.log(compiler.getCompilationCount()); // 2 (compiled backend)
	 * ```
	 */
	getCompilationCount(): number {
		return this.compilationCount;
	}

	/**
	 * Clears the compilation cache.
	 *
	 * Removes all cached programs, forcing recompilation on next request.
	 * Useful for:
	 * - Testing (verify compilation works, not just cache)
	 * - Memory management (if cache gets too big... it won't, but still)
	 * - Resetting state (starting fresh)
	 *
	 * WARNING: This doesn't reset compilationCount!
	 * We keep that counter forever because metrics are sacred.
	 *
	 * NOTE: You probably never need to call this in production.
	 * Our cache holds 2 programs totaling ~2KB. It's fine.
	 * But it's here if you need it!
	 *
	 * @example
	 * ```typescript
	 * const compiler = new PortCompiler();
	 *
	 * compiler.compile("frontend"); // Cache miss, compiles
	 * compiler.compile("frontend"); // Cache hit, instant
	 *
	 * compiler.clearCache(); // Nuke the cache!
	 *
	 * compiler.compile("frontend"); // Cache miss again, recompiles
	 * ```
	 */
	clearCache(): void {
		// Clear the Map (removes all cached programs)
		// Map.clear() is O(n) where n = number of entries (2 for us)
		// After this, all compilations will be cache misses
		this.compilationCache.clear();

		// Note: We deliberately don't reset compilationCount
		// That counter is cumulative across cache clears
		// It represents total work done, not just current cache state
	}

	/**
	 * Gets cache statistics.
	 *
	 * Returns an object with information about cache state:
	 * - size: Number of cached programs (0-2 typically)
	 * - count: Total compilations performed (cumulative)
	 *
	 * Useful for:
	 * - Monitoring cache effectiveness
	 * - Debugging cache behavior
	 * - Dashboard metrics (if we had dashboards)
	 * - Satisfying curiosity
	 *
	 * @returns {object} Cache statistics
	 * @returns {number} .size - Current cache size (cached programs)
	 * @returns {number} .count - Total compilations (since creation)
	 *
	 * @example
	 * ```typescript
	 * const compiler = new PortCompiler();
	 * console.log(compiler.getCacheStats());
	 * // { size: 0, count: 0 } - nothing compiled yet
	 *
	 * compiler.compile("frontend");
	 * console.log(compiler.getCacheStats());
	 * // { size: 1, count: 1 } - one program cached
	 *
	 * compiler.compile("frontend"); // Cache hit
	 * compiler.compile("backend");  // Cache miss
	 * console.log(compiler.getCacheStats());
	 * // { size: 2, count: 2 } - two programs cached, two compilations
	 *
	 * compiler.clearCache();
	 * console.log(compiler.getCacheStats());
	 * // { size: 0, count: 2 } - cache cleared, but count preserved!
	 * ```
	 */
	getCacheStats(): { size: number; count: number } {
		return {
			// Current number of cached programs
			// Map.size is O(1) - it's maintained internally
			size: this.compilationCache.size,

			// Total number of compilations performed
			// This is cumulative and never decreases
			count: this.compilationCount,
		};
	}
}

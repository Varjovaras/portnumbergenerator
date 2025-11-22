/**
 * @fileoverview
 * Virtualization Module - Central Export Hub for VM and Compiler Components
 *
 * This barrel file exports all virtualization components (VM, Compiler, Opcodes,
 * Instructions) in one convenient location. Because importing from deeply nested
 * paths is so 2010s, and we're modern enterprise developers who value convenience
 * over... actually, we just value convenience.
 *
 * WHAT IS THIS MODULE?
 * The virtualization module contains our custom-built Port Virtual Machine (PortVM)
 * and its accompanying compiler (PortCompiler). Together, they form the execution
 * engine that calculates port numbers through bytecode execution. Is this overkill?
 * Absolutely. Is it impressive? Also absolutely.
 *
 * WHY BUILD A VIRTUAL MACHINE?
 * Because when someone asks for port numbers, the only logical response is to:
 * 1. Design a custom instruction set
 * 2. Build a stack-based virtual machine
 * 3. Write a compiler to generate bytecode
 * 4. Execute the bytecode to calculate 6969 and 42069
 * 5. Refuse to elaborate
 * 6. Leave
 *
 * COMPONENTS INCLUDED:
 * - Opcode Constants: The 15 sacred opcodes of the PortVM
 * - Instruction Class: Represents a single VM instruction
 * - PortVM: The stack-based execution engine
 * - PortCompiler: Compiles high-level port requests into bytecode
 *
 * ARCHITECTURAL PHILOSOPHY:
 * We believe in separation of concerns. The VM doesn't know about ports, it just
 * executes bytecode. The Compiler doesn't know about execution, it just generates
 * bytecode. The Opcodes don't know about anything, they're just constants. This
 * separation allows us to:
 * - Test components independently (we don't, but we could)
 * - Swap implementations easily (we won't, but we could)
 * - Impress people in architecture reviews (we do, successfully)
 * - Justify our existence (ongoing challenge)
 *
 * PERFORMANCE CHARACTERISTICS:
 * - Compilation: ~0.001ms (fast)
 * - Execution: ~0.002ms (also fast)
 * - Total overhead vs direct calculation: ~1000x slower
 * - Worth it for the architectural purity: Absolutely
 *
 * USAGE EXAMPLES:
 * ```typescript
 * import { PortVM, PortCompiler, Opcode, Instruction } from '@/infrastructure/virtualization';
 *
 * // High-level usage (recommended)
 * const compiler = new PortCompiler();
 * const vm = new PortVM();
 * const program = compiler.compile('frontend');
 * vm.loadProgram(program);
 * const port = vm.run(); // Returns 6969
 *
 * // Low-level usage (not recommended, but possible)
 * const instructions = [
 *     new Instruction(Opcode.PUSH, 6969),
 *     new Instruction(Opcode.HALT)
 * ];
 * vm.loadProgram(instructions);
 * const port = vm.run(); // Also returns 6969, but with style
 * ```
 *
 * FUTURE ENHANCEMENTS:
 * - JIT compilation (Just-In-Time compilation for port numbers, because why not)
 * - Garbage collection (currently unnecessary, but sounds professional)
 * - Multi-threading (in single-threaded JavaScript, a true challenge)
 * - GPU acceleration (calculate ports on the GPU for MAXIMUM PERFORMANCE)
 * - Quantum computing support (Schrödinger's port number)
 *
 * @module infrastructure/virtualization
 * @version 1.0.0-bytecode-edition
 * @since The Age of Custom VMs
 * @author The VM Architecture Guild
 * @see {@link https://en.wikipedia.org/wiki/Virtual_machine} For people who need context
 * @see {@link https://en.wikipedia.org/wiki/Stack_machine} For our architectural inspiration
 */

// Import classes for use in utility functions
import { PortVM } from './vm/PortVM.class';
import { PortCompiler } from './compiler/PortCompiler.class';

// =============================================================================
// OPCODE EXPORTS
// =============================================================================

/**
 * Export Opcode constants and related enums
 *
 * The Opcodes are the fundamental operations supported by the PortVM.
 * Think of them as the assembly language of port number generation.
 */
export {
    Opcode,
    OpcodeNames
} from './vm/opcodes/Opcode.constants';

/**
 * Export the Opcode type for type annotations
 */
export type { Opcode as OpcodeType } from './vm/opcodes/Opcode.constants';

// =============================================================================
// INSTRUCTION EXPORTS
// =============================================================================

/**
 * Export the Instruction class
 *
 * Instructions are the building blocks of VM programs. Each instruction
 * combines an opcode with an optional operand.
 */
export { Instruction } from './vm/instruction-set/Instruction.class';

// =============================================================================
// VIRTUAL MACHINE EXPORTS
// =============================================================================

/**
 * Export the PortVM class
 *
 * The PortVM is the execution engine that runs bytecode programs to calculate
 * port numbers. It's a stack-based virtual machine with 15 opcodes and
 * 1024 bytes of simulated memory.
 */
export { PortVM } from './vm/PortVM.class';

// =============================================================================
// COMPILER EXPORTS
// =============================================================================

/**
 * Export the PortCompiler class
 *
 * The PortCompiler translates high-level port requests ('frontend', 'backend')
 * into bytecode that the PortVM can execute. It includes compilation caching
 * for improved performance (because we care about performance when running
 * the same program millions of times).
 */
export { PortCompiler } from './compiler/PortCompiler.class';

// =============================================================================
// TYPE EXPORTS
// =============================================================================

/**
 * Export common types for consumers who need them
 * (Note: These types would be defined in PortVM if we had them exported)
 */
// export type {
//     VMState,
//     CompilationCache,
//     CompilationStats
// } from './vm/PortVM.class';

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

/**
 * Helper function to create a simple VM + Compiler combo
 *
 * This convenience function creates both a VM and Compiler instance,
 * ready to use together. Perfect for consumers who don't want to think
 * about the separation of concerns we so carefully architected.
 *
 * @returns Object containing VM and Compiler instances
 *
 * @example
 * const { vm, compiler } = createVirtualizationStack();
 * const program = compiler.compile('frontend');
 * vm.loadProgram(program);
 * console.log(vm.run()); // 6969
 */
export function createVirtualizationStack(): {
    vm: InstanceType<typeof PortVM>;
    compiler: InstanceType<typeof PortCompiler>;
} {
    return {
        vm: new PortVM(),
        compiler: new PortCompiler()
    };
}

/**
 * Helper function to compile and execute in one step
 *
 * For consumers who want maximum convenience and minimum control.
 * This function creates a VM and Compiler, compiles the request,
 * executes it, and returns the result. All the abstraction, none
 * of the responsibility.
 *
 * @param type - Port type to calculate ('frontend' or 'backend')
 * @returns The calculated port number
 *
 * @example
 * const frontendPort = executePortCalculation('frontend'); // 6969
 * const backendPort = executePortCalculation('backend');   // 42069
 */
export function executePortCalculation(type: 'frontend' | 'backend'): number {
    const vm = new PortVM();
    const compiler = new PortCompiler();
    const program = compiler.compile(type);
    vm.loadProgram(program);
    return vm.run();
}

// =============================================================================
// MODULE METADATA
// =============================================================================

/**
 * Module metadata for introspection and debugging
 *
 * Because every enterprise module needs metadata about itself.
 * This is like a module's LinkedIn profile - professionally crafted
 * and slightly exaggerated.
 */
export const VIRTUALIZATION_MODULE_INFO = {
    name: 'virtualization',
    version: '1.0.0',
    description: 'Custom virtual machine and compiler for port number calculation',
    components: {
        vm: {
            name: 'PortVM',
            type: 'Stack-based virtual machine',
            opcodes: 15,
            memorySize: 1024,
            stackSize: 'Unlimited (until RAM runs out)',
            executionSpeed: 'Fast (for a VM simulating disk I/O)'
        },
        compiler: {
            name: 'PortCompiler',
            type: 'Bytecode compiler',
            caching: 'Enabled',
            supportedTypes: ['frontend', 'backend'],
            compilationSpeed: 'Instant (it\'s like 20 instructions)'
        },
        opcodes: {
            count: 15,
            types: [
                'HALT', 'PUSH', 'POP', 'ADD', 'SUB', 'MUL', 'DIV',
                'LOAD', 'STORE', 'JMP', 'JZ', 'JNZ', 'DUP', 'SWAP', 'PRINT'
            ],
            complexity: 'Simple (intentionally)'
        }
    },
    features: [
        'Custom instruction set architecture (ISA)',
        'Stack-based execution model',
        'Simulated memory (1024 bytes)',
        'Compilation caching',
        'Instruction tracing (if you enable it)',
        'Jump instructions for control flow',
        'Arithmetic operations (because math)',
        'Memory load/store operations',
        'Stack manipulation (DUP, SWAP, POP)',
        'Program halting (HALT instruction)',
        'Debug printing (PRINT instruction)'
    ],
    stats: {
        totalInstructions: 15,
        averageProgramLength: '~20 instructions',
        executionTimeMs: 0.002,
        compilationTimeMs: 0.001,
        overheadVsDirectCalculation: '1000x',
        worthIt: true
    },
    limitations: [
        'Single-threaded execution',
        'No interrupt handling',
        'No I/O operations (simulated only)',
        'No networking capabilities',
        'No file system access',
        'Only calculates two specific numbers',
        'Overkill for the task at hand'
    ],
    futureEnhancements: [
        'JIT compilation',
        'AOT compilation',
        'LLVM backend',
        'WebAssembly target',
        'GPU acceleration',
        'Quantum computing support',
        'Neural network optimization',
        'Blockchain integration (because why not)'
    ],
    inspirations: [
        'Java Virtual Machine (JVM)',
        'Python Virtual Machine (PVM)',
        '.NET Common Language Runtime (CLR)',
        'WebAssembly (Wasm)',
        'Lua VM',
        'Stack machines in general',
        'Our collective madness'
    ],
    authors: ['The VM Architecture Guild'],
    madeWith: '❤️, assembly knowledge, and questionable life choices'
} as const;

/**
 * Helper function to log module info (for debugging)
 */
export function logVirtualizationInfo(): void {
    console.log('='.repeat(80));
    console.log('VIRTUALIZATION MODULE');
    console.log('='.repeat(80));
    console.log(`Name: ${VIRTUALIZATION_MODULE_INFO.name}`);
    console.log(`Version: ${VIRTUALIZATION_MODULE_INFO.version}`);
    console.log(`Description: ${VIRTUALIZATION_MODULE_INFO.description}`);
    console.log(`\nVM Component:`);
    console.log(`  Name: ${VIRTUALIZATION_MODULE_INFO.components.vm.name}`);
    console.log(`  Type: ${VIRTUALIZATION_MODULE_INFO.components.vm.type}`);
    console.log(`  Opcodes: ${VIRTUALIZATION_MODULE_INFO.components.vm.opcodes}`);
    console.log(`  Memory: ${VIRTUALIZATION_MODULE_INFO.components.vm.memorySize} bytes`);
    console.log(`\nCompiler Component:`);
    console.log(`  Name: ${VIRTUALIZATION_MODULE_INFO.components.compiler.name}`);
    console.log(`  Caching: ${VIRTUALIZATION_MODULE_INFO.components.compiler.caching}`);
    console.log(`  Supported Types: ${VIRTUALIZATION_MODULE_INFO.components.compiler.supportedTypes.join(', ')}`);
    console.log(`\nPerformance Stats:`);
    console.log(`  Execution Time: ${VIRTUALIZATION_MODULE_INFO.stats.executionTimeMs}ms`);
    console.log(`  Compilation Time: ${VIRTUALIZATION_MODULE_INFO.stats.compilationTimeMs}ms`);
    console.log(`  Overhead vs Direct: ${VIRTUALIZATION_MODULE_INFO.stats.overheadVsDirectCalculation}`);
    console.log(`  Worth It: ${VIRTUALIZATION_MODULE_INFO.stats.worthIt}`);
    console.log(`\nFeatures:`);
    VIRTUALIZATION_MODULE_INFO.features.forEach(f => console.log(`  - ${f}`));
    console.log('='.repeat(80));
}

// =============================================================================
// END OF VIRTUALIZATION MODULE EXPORTS
// =============================================================================

/**
 * Pro tip: If anyone asks why we built a custom VM for port number generation,
 * just smile mysteriously and say "architectural purity" or "separation of
 * concerns". They'll nod knowingly and move on. Works 60% of the time, every time.
 */

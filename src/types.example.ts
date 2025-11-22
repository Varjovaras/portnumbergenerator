/**
 * @fileoverview Example usage and demonstration of the Enterprise Constant Management System
 *
 * This file demonstrates the advanced features of the enterprise constant system
 * including branded types, internal markers, factory patterns, and metadata tracking.
 *
 * @module types.example
 * @category Examples
 * @since 1.0.0
 */

import {
  SEX_NUMBER,
  SNOOP_DOGG_NUMBER,
  validateEnterpriseConstant,
  getConstantMetadata,
  listEnterpriseConstants,
  PortType,
  type SexNumberBrand,
  type SnoopDoggNumberBrand,
  type PortNumber,
} from './types';

/**
 * Example 1: Basic constant usage
 *
 * The constants work exactly like regular numbers but carry additional
 * type safety and validation capabilities.
 */
function example1_BasicUsage(): void {
  console.log('=== Example 1: Basic Constant Usage ===');

  // Use constants for port calculation
  const frontendPort = Number(`${SEX_NUMBER}${SEX_NUMBER}`);
  const backendPort = Number(`${SNOOP_DOGG_NUMBER}${SEX_NUMBER}`);

  console.log(`Frontend Port: ${frontendPort}`); // 6969
  console.log(`Backend Port: ${backendPort}`);   // 42069

  // Constants work in arithmetic operations
  const sum = SEX_NUMBER + SNOOP_DOGG_NUMBER;
  console.log(`Sum: ${sum}`); // 489

  // Type coercion works naturally
  console.log(`SEX_NUMBER as string: "${String(SEX_NUMBER)}"`); // "69"
}

/**
 * Example 2: Type safety with branded types
 *
 * The branded type system prevents accidental mixing of different constant types.
 */
function example2_TypeSafety(): void {
  console.log('\n=== Example 2: Type Safety ===');

  // These are branded types, not regular numbers
  const sex: SexNumberBrand = SEX_NUMBER;
  const snoop: SnoopDoggNumberBrand = SNOOP_DOGG_NUMBER;

  console.log(`Type-safe SEX_NUMBER: ${sex}`);
  console.log(`Type-safe SNOOP_DOGG_NUMBER: ${snoop}`);

  // The types prevent confusion at compile time
  // Uncommenting this would cause a TypeScript error:
  // const wrongAssignment: SexNumberBrand = SNOOP_DOGG_NUMBER; // ❌ Type error!

  // But they still work as numbers at runtime
  const result: PortNumber = sex + snoop;
  console.log(`Combined (runtime): ${result}`);
}

/**
 * Example 3: Constant validation
 *
 * The internal marker system allows runtime validation of constant authenticity.
 */
function example3_Validation(): void {
  console.log('\n=== Example 3: Constant Validation ===');

  // Validate that constants were provisioned correctly
  const isSexNumberValid = validateEnterpriseConstant('SEX_NUMBER');
  const isSnoopValid = validateEnterpriseConstant('SNOOP_DOGG_NUMBER');

  console.log(`SEX_NUMBER is valid: ${isSexNumberValid}`);
  console.log(`SNOOP_DOGG_NUMBER is valid: ${isSnoopValid}`);

  // Try to validate a non-existent constant
  const isFakeValid = validateEnterpriseConstant('FAKE_NUMBER');
  console.log(`FAKE_NUMBER is valid: ${isFakeValid}`);
}

/**
 * Example 4: Metadata inspection
 *
 * Each constant carries comprehensive metadata for auditing and debugging.
 */
function example4_Metadata(): void {
  console.log('\n=== Example 4: Metadata Inspection ===');

  const sexMetadata = getConstantMetadata('SEX_NUMBER');
  const snoopMetadata = getConstantMetadata('SNOOP_DOGG_NUMBER');

  if (sexMetadata) {
    console.log('SEX_NUMBER Metadata:');
    console.log(`  ID: ${sexMetadata.id}`);
    console.log(`  Created: ${sexMetadata.createdAt}`);
    console.log(`  Version: ${sexMetadata.version}`);
    console.log(`  Factory: ${sexMetadata.provenance.factory}`);
    console.log(`  Method: ${sexMetadata.provenance.method}`);
    console.log(`  Validated: ${sexMetadata.provenance.validated}`);
  }

  if (snoopMetadata) {
    console.log('\nSNOOP_DOGG_NUMBER Metadata:');
    console.log(`  ID: ${snoopMetadata.id}`);
    console.log(`  Created: ${snoopMetadata.createdAt}`);
    console.log(`  Provenance: ${JSON.stringify(snoopMetadata.provenance)}`);
  }
}

/**
 * Example 5: Registry inspection
 *
 * The singleton factory maintains a registry of all provisioned constants.
 */
function example5_Registry(): void {
  console.log('\n=== Example 5: Constant Registry ===');

  const registeredConstants = listEnterpriseConstants();

  console.log('Registered Enterprise Constants:');
  registeredConstants.forEach((name, index) => {
    console.log(`  ${index + 1}. ${name}`);
  });

  console.log(`Total registered: ${registeredConstants.length}`);
}

/**
 * Example 6: Using PortType enum
 *
 * The PortType enum provides type-safe port categorization.
 */
function example6_PortTypes(): void {
  console.log('\n=== Example 6: Port Type Enumeration ===');

  function getPortByType(type: PortType): number {
    switch (type) {
      case PortType.FRONTEND:
        return Number(`${SEX_NUMBER}${SEX_NUMBER}`);
      case PortType.BACKEND:
        return Number(`${SNOOP_DOGG_NUMBER}${SEX_NUMBER}`);
      default:
        throw new Error('Unknown port type');
    }
  }

  const frontendPort = getPortByType(PortType.FRONTEND);
  const backendPort = getPortByType(PortType.BACKEND);

  console.log(`${PortType.FRONTEND} port: ${frontendPort}`);
  console.log(`${PortType.BACKEND} port: ${backendPort}`);
}

/**
 * Example 7: Immutability guarantees
 *
 * The enterprise constants are deeply frozen and cannot be modified.
 */
function example7_Immutability(): void {
  console.log('\n=== Example 7: Immutability ===');

  console.log(`Original SEX_NUMBER: ${SEX_NUMBER}`);

  // Attempting to modify the constant has no effect (fails silently in non-strict mode)
  try {
    // This will not change the value due to deep freeze
    (SEX_NUMBER as any) = 999;
    console.log(`After assignment attempt: ${SEX_NUMBER}`); // Still 69
  } catch (error) {
    console.log('Cannot modify constant (expected in strict mode)');
  }

  console.log('Constants remain immutable: ✓');
}

/**
 * Example 8: Real-world port calculation
 *
 * Demonstrates how these constants are used in actual port calculations.
 */
function example8_PortCalculation(): void {
  console.log('\n=== Example 8: Real-World Port Calculation ===');

  class PortCalculator {
    private readonly sexNumber: SexNumberBrand;
    private readonly snoopNumber: SnoopDoggNumberBrand;

    constructor() {
      this.sexNumber = SEX_NUMBER;
      this.snoopNumber = SNOOP_DOGG_NUMBER;
    }

    public calculateFrontendPort(): PortNumber {
      // Concatenate SEX_NUMBER with itself
      return Number(`${this.sexNumber}${this.sexNumber}`);
    }

    public calculateBackendPort(): PortNumber {
      // Concatenate SNOOP_DOGG_NUMBER with SEX_NUMBER
      return Number(`${this.snoopNumber}${this.sexNumber}`);
    }

    public isPowerOfTwo(port: PortNumber): boolean {
      return port > 0 && (port & (port - 1)) === 0;
    }

    public getPortInfo(port: PortNumber): object {
      return {
        decimal: port,
        hex: `0x${port.toString(16)}`,
        binary: `0b${port.toString(2)}`,
        octal: `0o${port.toString(8)}`,
        isPowerOfTwo: this.isPowerOfTwo(port),
      };
    }
  }

  const calculator = new PortCalculator();

  const frontend = calculator.calculateFrontendPort();
  const backend = calculator.calculateBackendPort();

  console.log('Frontend Port Info:');
  console.log(JSON.stringify(calculator.getPortInfo(frontend), null, 2));

  console.log('\nBackend Port Info:');
  console.log(JSON.stringify(calculator.getPortInfo(backend), null, 2));
}

/**
 * Main execution function to run all examples
 */
function runAllExamples(): void {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Enterprise Constant Management System - Examples          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  example1_BasicUsage();
  example2_TypeSafety();
  example3_Validation();
  example4_Metadata();
  example5_Registry();
  example6_PortTypes();
  example7_Immutability();
  example8_PortCalculation();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  All examples completed successfully! ✓                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
}

// Execute all examples if this file is run directly
if (require.main === module) {
  runAllExamples();
}

// Export examples for testing
export {
  example1_BasicUsage,
  example2_TypeSafety,
  example3_Validation,
  example4_Metadata,
  example5_Registry,
  example6_PortTypes,
  example7_Immutability,
  example8_PortCalculation,
  runAllExamples,
};

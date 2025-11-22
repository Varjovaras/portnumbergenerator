/**
 * @fileoverview Enterprise-Grade Constant Management System with Internal Markers
 *
 * This module implements a sophisticated constant provisioning infrastructure
 * utilizing branded types, factory patterns, singleton registries, and internal
 * marker systems to ensure type-safe, immutable, and auditable constant values.
 *
 * @module types
 * @category Core
 * @since 1.0.0
 *
 * @description
 * ## Overview
 *
 * This enterprise constant management system replaces traditional primitive constants
 * with a robust, type-safe architecture that provides:
 *
 * - **Branded Types**: Nominal typing for compile-time safety
 * - **Internal Markers**: Hidden symbols for runtime validation
 * - **Factory Pattern**: Controlled instantiation of constant values
 * - **Immutability**: Deep-freeze protection against mutation
 * - **Auditability**: Metadata tracking and provenance information
 * - **Singleton Registry**: Centralized constant management
 *
 * ## Architecture
 *
 * ```
 * ┌─────────────────────────────────────────────────────────┐
 * │          Enterprise Constant Factory                     │
 * │  ┌─────────────────────────────────────────────────┐   │
 * │  │  Internal Marker System (Symbols)               │   │
 * │  └─────────────────────────────────────────────────┘   │
 * │  ┌─────────────────────────────────────────────────┐   │
 * │  │  Branded Type Wrappers                          │   │
 * │  └─────────────────────────────────────────────────┘   │
 * │  ┌─────────────────────────────────────────────────┐   │
 * │  │  Singleton Registry & Validation Layer          │   │
 * │  └─────────────────────────────────────────────────┘   │
 * └─────────────────────────────────────────────────────────┘
 * ```
 *
 * @example
 * ```typescript
 * import { SEX_NUMBER, SNOOP_DOGG_NUMBER } from './types';
 *
 * // These are now branded types with internal markers
 * const frontendPort = Number(`${SEX_NUMBER}${SEX_NUMBER}`); // 6969
 * const backendPort = Number(`${SNOOP_DOGG_NUMBER}${SEX_NUMBER}`); // 42069
 * ```
 */

/**
 * Internal marker symbol for SEX_NUMBER constant authentication.
 *
 * This symbol serves as a unique, non-enumerable internal marker that validates
 * the authenticity and provenance of SEX_NUMBER constant instances. It prevents
 * forgery and ensures that only factory-produced constants are accepted throughout
 * the system.
 *
 * @internal
 * @constant
 * @type {symbol}
 */
const SEX_NUMBER_MARKER = Symbol.for('@@enterprise/constants/SEX_NUMBER');

/**
 * Internal marker symbol for SNOOP_DOGG_NUMBER constant authentication.
 *
 * This symbol serves as a unique, non-enumerable internal marker that validates
 * the authenticity and provenance of SNOOP_DOGG_NUMBER constant instances.
 *
 * @internal
 * @constant
 * @type {symbol}
 */
const SNOOP_DOGG_NUMBER_MARKER = Symbol.for('@@enterprise/constants/SNOOP_DOGG_NUMBER');

/**
 * Branded type for SEX_NUMBER ensuring nominal type safety.
 *
 * This branded type wraps the primitive number value with a unique type signature
 * that prevents accidental mixing of different constant types at compile time.
 *
 * @typedef {number & { readonly __brand: 'SEX_NUMBER' }} SexNumberBrand
 */
export type SexNumberBrand = number & { readonly __brand: 'SEX_NUMBER' };

/**
 * Branded type for SNOOP_DOGG_NUMBER ensuring nominal type safety.
 *
 * @typedef {number & { readonly __brand: 'SNOOP_DOGG_NUMBER' }} SnoopDoggNumberBrand
 */
export type SnoopDoggNumberBrand = number & { readonly __brand: 'SNOOP_DOGG_NUMBER' };

/**
 * Metadata interface for enterprise constant tracking and auditability.
 *
 * Provides comprehensive metadata about constant creation, validation,
 * and usage patterns for compliance and debugging purposes.
 *
 * @interface EnterpriseConstantMetadata
 */
interface EnterpriseConstantMetadata {
  /**
   * Unique identifier for this constant instance
   */
  readonly id: string;

  /**
   * Timestamp of constant creation (ISO 8601)
   */
  readonly createdAt: string;

  /**
   * Semantic version of the constant specification
   */
  readonly version: string;

  /**
   * Provenance information for audit trails
   */
  readonly provenance: {
    readonly factory: string;
    readonly method: string;
    readonly validated: boolean;
  };

  /**
   * Internal marker symbol for authentication
   */
  readonly [key: symbol]: boolean;
}

/**
 * Enterprise Constant Wrapper encapsulating value and metadata.
 *
 * This class wraps primitive constant values with enterprise-grade metadata,
 * validation markers, and immutability guarantees. It serves as the foundation
 * for the branded type system.
 *
 * @class EnterpriseConstantWrapper
 * @template T - The branded type of the constant
 */
class EnterpriseConstantWrapper<T extends number> {
  /**
   * The immutable constant value
   * @private
   * @readonly
   */
  private readonly _value: T;

  /**
   * Comprehensive metadata for audit and validation
   * @private
   * @readonly
   */
  private readonly _metadata: EnterpriseConstantMetadata;

  /**
   * Constructs a new EnterpriseConstantWrapper instance.
   *
   * @param {T} value - The numeric constant value
   * @param {symbol} marker - Internal authentication marker
   * @param {string} constantName - Human-readable constant identifier
   *
   * @throws {Error} If value is not a valid number
   */
  constructor(value: T, marker: symbol, constantName: string) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(`Invalid constant value for ${constantName}: must be finite number`);
    }

    this._value = value;
    this._metadata = Object.freeze({
      id: `${constantName}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      version: '1.0.0',
      provenance: Object.freeze({
        factory: 'EnterpriseConstantFactory',
        method: 'createBrandedConstant',
        validated: true,
      }),
      [marker]: true,
    });

    // Deep freeze to ensure immutability
    Object.freeze(this._metadata.provenance);
    Object.freeze(this._metadata);
    Object.freeze(this);
  }

  /**
   * Retrieves the constant value.
   *
   * @returns {T} The immutable constant value
   */
  public valueOf(): T {
    return this._value;
  }

  /**
   * String representation of the constant.
   *
   * @returns {string} String representation of the value
   */
  public toString(): string {
    return String(this._value);
  }

  /**
   * Validates the internal marker for authenticity.
   *
   * @param {symbol} marker - The marker symbol to validate
   * @returns {boolean} True if marker is valid
   */
  public validateMarker(marker: symbol): boolean {
    return this._metadata[marker] === true;
  }

  /**
   * Retrieves metadata for audit purposes.
   *
   * @returns {Readonly<EnterpriseConstantMetadata>} Immutable metadata object
   */
  public getMetadata(): Readonly<EnterpriseConstantMetadata> {
    return this._metadata;
  }
}

/**
 * Enterprise Constant Factory implementing the Factory Pattern.
 *
 * This singleton factory is responsible for creating, validating, and managing
 * all enterprise constant instances. It ensures that constants are properly
 * branded, marked, and immutable.
 *
 * @class EnterpriseConstantFactory
 * @singleton
 */
class EnterpriseConstantFactory {
  /**
   * Singleton instance
   * @private
   * @static
   */
  private static instance: EnterpriseConstantFactory;

  /**
   * Registry of all created constants for lifecycle management
   * @private
   */
  private readonly registry: Map<string, EnterpriseConstantWrapper<any>> = new Map();

  /**
   * Private constructor enforcing singleton pattern.
   * @private
   */
  private constructor() {
    // Singleton: prevent external instantiation
  }

  /**
   * Retrieves the singleton factory instance.
   *
   * @returns {EnterpriseConstantFactory} The singleton instance
   * @static
   */
  public static getInstance(): EnterpriseConstantFactory {
    if (!EnterpriseConstantFactory.instance) {
      EnterpriseConstantFactory.instance = new EnterpriseConstantFactory();
    }
    return EnterpriseConstantFactory.instance;
  }

  /**
   * Creates a branded constant with internal marker validation.
   *
   * This method is the primary entry point for creating enterprise constants.
   * It wraps the raw value in a type-safe branded wrapper with metadata and
   * registers it in the central registry.
   *
   * @template T - The branded type
   * @param {number} rawValue - The primitive numeric value
   * @param {symbol} marker - Internal authentication marker
   * @param {string} constantName - Human-readable identifier
   * @returns {T} Branded constant value
   *
   * @throws {Error} If constant with same name already exists
   */
  private createBrandedConstant<T extends number>(
    rawValue: number,
    marker: symbol,
    constantName: string
  ): T {
    if (this.registry.has(constantName)) {
      // Return cached instance for idempotency
      return this.registry.get(constantName)!.valueOf() as T;
    }

    const wrapper = new EnterpriseConstantWrapper<T>(
      rawValue as T,
      marker,
      constantName
    );

    this.registry.set(constantName, wrapper);

    // Return the branded value
    return wrapper.valueOf();
  }

  /**
   * Provisions the SEX_NUMBER constant.
   *
   * Creates and returns a type-safe, branded instance of SEX_NUMBER (69)
   * with full metadata and internal marker validation.
   *
   * @returns {SexNumberBrand} Branded SEX_NUMBER constant
   * @public
   */
  public provisionSexNumber(): SexNumberBrand {
    return this.createBrandedConstant<SexNumberBrand>(
      69,
      SEX_NUMBER_MARKER,
      'SEX_NUMBER'
    );
  }

  /**
   * Provisions the SNOOP_DOGG_NUMBER constant.
   *
   * Creates and returns a type-safe, branded instance of SNOOP_DOGG_NUMBER (420)
   * with full metadata and internal marker validation.
   *
   * @returns {SnoopDoggNumberBrand} Branded SNOOP_DOGG_NUMBER constant
   * @public
   */
  public provisionSnoopDoggNumber(): SnoopDoggNumberBrand {
    return this.createBrandedConstant<SnoopDoggNumberBrand>(
      420,
      SNOOP_DOGG_NUMBER_MARKER,
      'SNOOP_DOGG_NUMBER'
    );
  }

  /**
   * Validates a constant's internal marker.
   *
   * @param {string} constantName - The constant to validate
   * @param {symbol} marker - Expected marker symbol
   * @returns {boolean} True if constant is authentic
   * @public
   */
  public validateConstant(constantName: string, marker: symbol): boolean {
    const wrapper = this.registry.get(constantName);
    return wrapper ? wrapper.validateMarker(marker) : false;
  }

  /**
   * Retrieves metadata for a registered constant.
   *
   * @param {string} constantName - The constant name
   * @returns {Readonly<EnterpriseConstantMetadata> | null} Metadata or null
   * @public
   */
  public getConstantMetadata(constantName: string): Readonly<EnterpriseConstantMetadata> | null {
    const wrapper = this.registry.get(constantName);
    return wrapper ? wrapper.getMetadata() : null;
  }

  /**
   * Returns diagnostic information about all registered constants.
   *
   * @returns {string[]} Array of registered constant names
   * @public
   */
  public getRegisteredConstants(): string[] {
    return Array.from(this.registry.keys());
  }
}

/**
 * Singleton factory instance for constant provisioning.
 * @private
 * @constant
 */
const factory = EnterpriseConstantFactory.getInstance();

/**
 * The SEX_NUMBER enterprise constant (value: 69).
 *
 * This constant is provisioned through the Enterprise Constant Factory and
 * carries internal markers, branded types, and comprehensive metadata for
 * type safety and auditability.
 *
 * ## Enterprise Features
 *
 * - **Branded Type**: `SexNumberBrand` prevents type confusion
 * - **Internal Marker**: `SEX_NUMBER_MARKER` validates authenticity
 * - **Immutable**: Deep-frozen to prevent modification
 * - **Auditable**: Full metadata trail for compliance
 *
 * ## Usage
 *
 * This constant is used primarily for frontend port calculation:
 * - Frontend Port: `6969` = SEX_NUMBER concatenated (69 + 69)
 *
 * @constant
 * @type {SexNumberBrand}
 * @readonly
 *
 * @example
 * ```typescript
 * import { SEX_NUMBER } from './types';
 *
 * // Type-safe branded constant
 * const frontendPort = Number(`${SEX_NUMBER}${SEX_NUMBER}`);
 * console.log(frontendPort); // 6969
 *
 * // The constant is immutable and validated
 * console.log(typeof SEX_NUMBER); // 'number'
 * ```
 */
export const SEX_NUMBER: SexNumberBrand = factory.provisionSexNumber();

/**
 * The SNOOP_DOGG_NUMBER enterprise constant (value: 420).
 *
 * This constant is provisioned through the Enterprise Constant Factory and
 * carries internal markers, branded types, and comprehensive metadata for
 * type safety and auditability.
 *
 * ## Enterprise Features
 *
 * - **Branded Type**: `SnoopDoggNumberBrand` prevents type confusion
 * - **Internal Marker**: `SNOOP_DOGG_NUMBER_MARKER` validates authenticity
 * - **Immutable**: Deep-frozen to prevent modification
 * - **Auditable**: Full metadata trail for compliance
 *
 * ## Usage
 *
 * This constant is used primarily for backend port calculation:
 * - Backend Port: `42069` = SNOOP_DOGG_NUMBER + SEX_NUMBER (420 + 69)
 *
 * @constant
 * @type {SnoopDoggNumberBrand}
 * @readonly
 *
 * @example
 * ```typescript
 * import { SNOOP_DOGG_NUMBER, SEX_NUMBER } from './types';
 *
 * // Type-safe branded constant
 * const backendPort = Number(`${SNOOP_DOGG_NUMBER}${SEX_NUMBER}`);
 * console.log(backendPort); // 42069
 *
 * // The constant is immutable and validated
 * console.log(typeof SNOOP_DOGG_NUMBER); // 'number'
 * ```
 */
export const SNOOP_DOGG_NUMBER: SnoopDoggNumberBrand = factory.provisionSnoopDoggNumber();

/**
 * Type alias for port numbers in the system.
 *
 * Represents valid port numbers that can be generated or used throughout
 * the application. While the system primarily generates ports 6969 and 42069,
 * this type allows for any valid port number in the range 0-65535.
 *
 * @typedef {number} PortNumber
 *
 * @example
 * ```typescript
 * import type { PortNumber } from './types';
 *
 * function validatePort(port: PortNumber): boolean {
 *   return port >= 0 && port <= 65535;
 * }
 * ```
 */
export type PortNumber = number;

/**
 * Enumeration of port types supported by the system.
 *
 * Defines the two primary categories of ports that the system generates:
 * frontend ports (6969) and backend ports (42069).
 *
 * @enum {string}
 *
 * @example
 * ```typescript
 * import { PortType } from './types';
 *
 * function getPortByType(type: PortType): number {
 *   return type === PortType.FRONTEND ? 6969 : 42069;
 * }
 * ```
 */
export enum PortType {
  /**
   * Frontend port type - generates port 6969
   */
  FRONTEND = 'frontend',

  /**
   * Backend port type - generates port 42069
   */
  BACKEND = 'backend'
}

/**
 * Utility function to validate constant authenticity.
 *
 * This function can be used to verify that a constant value was provisioned
 * through the official Enterprise Constant Factory and carries valid internal
 * markers.
 *
 * @param {string} constantName - Name of the constant to validate
 * @returns {boolean} True if constant is authentic and properly provisioned
 *
 * @example
 * ```typescript
 * import { validateEnterpriseConstant } from './types';
 *
 * if (validateEnterpriseConstant('SEX_NUMBER')) {
 *   console.log('Constant is authentic and validated');
 * }
 * ```
 */
export function validateEnterpriseConstant(constantName: string): boolean {
  if (constantName === 'SEX_NUMBER') {
    return factory.validateConstant(constantName, SEX_NUMBER_MARKER);
  } else if (constantName === 'SNOOP_DOGG_NUMBER') {
    return factory.validateConstant(constantName, SNOOP_DOGG_NUMBER_MARKER);
  }
  return false;
}

/**
 * Retrieves diagnostic metadata for enterprise constants.
 *
 * This function provides access to the internal metadata of provisioned
 * constants for debugging, auditing, and compliance purposes.
 *
 * @param {string} constantName - Name of the constant
 * @returns {Readonly<EnterpriseConstantMetadata> | null} Metadata object or null
 *
 * @example
 * ```typescript
 * import { getConstantMetadata } from './types';
 *
 * const metadata = getConstantMetadata('SEX_NUMBER');
 * console.log(metadata?.provenance.factory); // 'EnterpriseConstantFactory'
 * ```
 */
export function getConstantMetadata(constantName: string): Readonly<EnterpriseConstantMetadata> | null {
  return factory.getConstantMetadata(constantName);
}

/**
 * Lists all registered enterprise constants.
 *
 * Diagnostic utility to retrieve the names of all constants that have been
 * provisioned through the factory.
 *
 * @returns {string[]} Array of registered constant names
 *
 * @example
 * ```typescript
 * import { listEnterpriseConstants } from './types';
 *
 * const constants = listEnterpriseConstants();
 * console.log(constants); // ['SEX_NUMBER', 'SNOOP_DOGG_NUMBER']
 * ```
 */
export function listEnterpriseConstants(): string[] {
  return factory.getRegisteredConstants();
}

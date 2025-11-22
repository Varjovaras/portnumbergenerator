/**
 * @fileoverview Domain Context Barrel Export
 *
 * Centralized export point for all context-related interfaces and implementations
 * in the Port Number Generator enterprise application. This barrel module aggregates
 * context definitions that encapsulate request metadata and requestor identity.
 *
 * @module core/domain/context
 * @category Domain Layer - Context
 * @subcategory Barrel Exports
 *
 * @version 1.0.0
 * @since Phase 1 - Domain Context Extraction
 */

// Export interfaces
export type { IPortContext } from './interfaces/IPortContext.interface';

// Export implementations
export { PortContext } from './implementations/PortContext.implementation';

// Module metadata
export const CONTEXT_MODULE_METADATA = {
	name: 'Domain Context',
	version: '1.0.0',
	phase: 1,
	category: 'Core Domain - Context',
	description: 'Context interfaces and implementations for port generation requests',
	exports: ['IPortContext', 'PortContext'],
	stability: 'stable' as const,
} as const;

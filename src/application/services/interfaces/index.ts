/**
 * @fileoverview Service Interfaces Barrel Export
 * @module application/services/interfaces
 * @description
 * Central export point for all service interface definitions in the application layer.
 * Provides type-safe contracts for dependency injection and service implementations.
 *
 * @author PortNumberGenerator Engineering Team
 * @version 7.0.0
 * @since Phase 7
 */

export type {
  IPortService,
  IPortServiceFactory,
  PortConfiguration,
  PortValidationResult,
  PortMetadata,
} from './IPortService.interface.js';

export { isPortService } from './IPortService.interface.js';

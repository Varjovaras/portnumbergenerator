/**
 * @fileoverview API Generators - Barrel Export
 * @module @portnumbergenerator/api/generators
 * @category API Layer - Generators
 * @since 1.0.0
 *
 * @description
 * Central export point for all API generator implementations.
 * Provides various API interface implementations for port number generation
 * including REST, GraphQL, and other API patterns.
 *
 * **Available Generators:**
 * - `RESTPortGenerator`: RESTful API implementation with HTTP semantics
 * - `GraphQLPortGenerator`: GraphQL API implementation with schema-based queries
 *
 * **API Patterns:**
 * - REST: Resource-based URLs with HTTP methods
 * - GraphQL: Schema-based queries with strong typing
 *
 * @example
 * ```typescript
 * // REST API
 * import { RESTPortGenerator } from '@portnumbergenerator/api/generators';
 * const restApi = new RESTPortGenerator();
 * const response = restApi.getFrontendPort();
 * ```
 *
 * @example
 * ```typescript
 * // GraphQL API
 * import { GraphQLPortGenerator } from '@portnumbergenerator/api/generators';
 * const graphqlApi = new GraphQLPortGenerator();
 * const schema = graphqlApi.getSchema();
 * const result = graphqlApi.executeQuery('{ frontendPort { number } }');
 * ```
 *
 * @example
 * ```typescript
 * // Import all generators
 * import * as Generators from '@portnumbergenerator/api/generators';
 * const rest = new Generators.RESTPortGenerator();
 * const graphql = new Generators.GraphQLPortGenerator();
 * ```
 */

// =========================================================================
// REST API GENERATOR
// =========================================================================

export {
	RESTPortGenerator,
	type RESTResponse,
	type PortResource,
	type PortCollection,
	type ValidationResource,
	type GeneratePortRequest,
	type ProblemDetails,
} from "./RESTPortGenerator.api.js";

// =========================================================================
// GRAPHQL API GENERATOR
// =========================================================================

export {
	GraphQLPortGenerator,
	type GraphQLPortType,
	type GraphQLPort,
	type GraphQLPortMetadata,
	type GraphQLPortProperties,
	type GraphQLValidationResult,
	type GraphQLStatistics,
	type GraphQLResponse,
	type GraphQLResolvers,
} from "./GraphQLPortGenerator.api.js";

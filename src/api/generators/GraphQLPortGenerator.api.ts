/**
 * @fileoverview GraphQLPortGenerator - GraphQL API port number generator
 * @module @portnumbergenerator/api/generators
 * @category API Layer - Generators
 * @since 1.0.0
 *
 * @description
 * GraphQL API implementation for port number generation using schema-based queries.
 * Provides typed queries, mutations, and subscriptions for port number operations
 * with strong typing and introspection support.
 *
 * **Features:**
 * - Strongly typed schema definitions
 * - Query operations for port retrieval
 * - Mutation operations for port generation
 * - Subscription support for real-time updates
 * - Introspection and documentation
 * - Resolver pattern implementation
 *
 * **Schema:**
 * ```graphql
 * type Query {
 *   frontendPort: Port!
 *   backendPort: Port!
 *   allPorts: [Port!]!
 *   validatePort(number: Int!): ValidationResult!
 * }
 *
 * type Mutation {
 *   generatePort(type: PortType!): Port!
 * }
 *
 * type Port {
 *   number: Int!
 *   type: PortType!
 *   metadata: PortMetadata!
 * }
 * ```
 *
 * @example
 * ```typescript
 * import { GraphQLPortGenerator } from '@portnumbergenerator/api/generators';
 *
 * const generator = new GraphQLPortGenerator();
 * const schema = generator.getSchema();
 * const result = await generator.executeQuery('{ frontendPort { number } }');
 * ```
 */

import { PortNumbers } from "../../application/legacy/index.js";

/**
 * @class GraphQLPortGenerator
 * @classdesc GraphQL API implementation for port number generation
 *
 * @description
 * Provides a GraphQL interface to the port number generation system.
 * Implements the GraphQL specification with queries, mutations, and
 * a strongly-typed schema.
 *
 * **GraphQL Features:**
 * - Type-safe schema definitions
 * - Query resolvers for data fetching
 * - Mutation resolvers for data modification
 * - Field-level resolver composition
 * - Error handling with extensions
 */
export class GraphQLPortGenerator {
	private readonly schema: string;

	/**
	 * Creates a new GraphQL port generator
	 * @constructor
	 */
	constructor() {
		this.schema = this.buildSchema();
	}

	// =========================================================================
	// SCHEMA DEFINITION
	// =========================================================================

	/**
	 * Builds the GraphQL schema definition
	 * @private
	 * @returns {string} GraphQL SDL schema
	 */
	private buildSchema(): string {
		return `
			"""
			Port type enumeration
			"""
			enum PortType {
				FRONTEND
				BACKEND
			}

			"""
			Port metadata information
			"""
			type PortMetadata {
				"""Formula used to calculate the port"""
				formula: String!
				"""Whether the port is deterministic"""
				deterministic: Boolean!
				"""Timestamp when port was generated"""
				timestamp: String!
				"""Additional properties"""
				properties: PortProperties!
			}

			"""
			Port number properties
			"""
			type PortProperties {
				"""Hexadecimal representation"""
				hex: String!
				"""Binary representation"""
				binary: String!
				"""Octal representation"""
				octal: String!
				"""Whether the port is even"""
				isEven: Boolean!
				"""Whether the port is odd"""
				isOdd: Boolean!
			}

			"""
			Port resource
			"""
			type Port {
				"""Port number"""
				number: Int!
				"""Port type (frontend or backend)"""
				type: PortType!
				"""Port metadata"""
				metadata: PortMetadata!
			}

			"""
			Port validation result
			"""
			type ValidationResult {
				"""Port number validated"""
				port: Int!
				"""Whether the port is valid"""
				valid: Boolean!
				"""Port type if valid"""
				type: PortType
				"""Validation message"""
				message: String!
			}

			"""
			Port generation statistics
			"""
			type PortStatistics {
				"""Total number of port types"""
				totalTypes: Int!
				"""Frontend port number"""
				frontendPort: Int!
				"""Backend port number"""
				backendPort: Int!
				"""Sum of all ports"""
				sumOfPorts: Int!
			}

			"""
			Query operations
			"""
			type Query {
				"""Get the frontend port number"""
				frontendPort: Port!
				"""Get the backend port number"""
				backendPort: Port!
				"""Get all port numbers"""
				allPorts: [Port!]!
				"""Validate a port number"""
				validatePort(number: Int!): ValidationResult!
				"""Get port generation statistics"""
				statistics: PortStatistics!
			}

			"""
			Mutation operations
			"""
			type Mutation {
				"""Generate a port number"""
				generatePort(type: PortType!): Port!
			}

			"""
			Root schema
			"""
			schema {
				query: Query
				mutation: Mutation
			}
		`;
	}

	/**
	 * Gets the GraphQL schema definition (SDL)
	 * @returns {string} Schema definition language string
	 */
	getSchema(): string {
		return this.schema;
	}

	// =========================================================================
	// QUERY RESOLVERS
	// =========================================================================

	/**
	 * Resolves frontendPort query
	 * @returns {GraphQLPort} Frontend port resource
	 *
	 * @example
	 * // GraphQL Query:
	 * // { frontendPort { number type metadata { formula } } }
	 * const result = generator.resolveFrontendPort();
	 */
	resolveFrontendPort(): GraphQLPort {
		const port = PortNumbers.frontendPortNumber();
		return this.createPortResource(port, "FRONTEND");
	}

	/**
	 * Resolves backendPort query
	 * @returns {GraphQLPort} Backend port resource
	 *
	 * @example
	 * // GraphQL Query:
	 * // { backendPort { number type metadata { formula } } }
	 * const result = generator.resolveBackendPort();
	 */
	resolveBackendPort(): GraphQLPort {
		const port = PortNumbers.backendPortNumber();
		return this.createPortResource(port, "BACKEND");
	}

	/**
	 * Resolves allPorts query
	 * @returns {GraphQLPort[]} Array of all port resources
	 *
	 * @example
	 * // GraphQL Query:
	 * // { allPorts { number type } }
	 * const result = generator.resolveAllPorts();
	 */
	resolveAllPorts(): GraphQLPort[] {
		return [this.resolveFrontendPort(), this.resolveBackendPort()];
	}

	/**
	 * Resolves validatePort query
	 * @param {number} number - Port number to validate
	 * @returns {GraphQLValidationResult} Validation result
	 *
	 * @example
	 * // GraphQL Query:
	 * // { validatePort(number: 6969) { valid type message } }
	 * const result = generator.resolveValidatePort(6969);
	 */
	resolveValidatePort(number: number): GraphQLValidationResult {
		const frontend = PortNumbers.frontendPortNumber();
		const backend = PortNumbers.backendPortNumber();

		if (number === frontend) {
			return {
				port: number,
				valid: true,
				type: "FRONTEND",
				message: "Port is a valid frontend port",
			};
		} else if (number === backend) {
			return {
				port: number,
				valid: true,
				type: "BACKEND",
				message: "Port is a valid backend port",
			};
		} else {
			return {
				port: number,
				valid: false,
				type: null,
				message: "Port is not a recognized port number",
			};
		}
	}

	/**
	 * Resolves statistics query
	 * @returns {GraphQLStatistics} Port generation statistics
	 *
	 * @example
	 * // GraphQL Query:
	 * // { statistics { totalTypes frontendPort backendPort sumOfPorts } }
	 * const result = generator.resolveStatistics();
	 */
	resolveStatistics(): GraphQLStatistics {
		const frontend = PortNumbers.frontendPortNumber();
		const backend = PortNumbers.backendPortNumber();

		return {
			totalTypes: 2,
			frontendPort: frontend,
			backendPort: backend,
			sumOfPorts: frontend + backend,
		};
	}

	// =========================================================================
	// MUTATION RESOLVERS
	// =========================================================================

	/**
	 * Resolves generatePort mutation
	 * @param {GraphQLPortType} type - Port type to generate
	 * @returns {GraphQLPort} Generated port resource
	 *
	 * @example
	 * // GraphQL Mutation:
	 * // mutation { generatePort(type: FRONTEND) { number type } }
	 * const result = generator.resolveGeneratePort('FRONTEND');
	 */
	resolveGeneratePort(type: GraphQLPortType): GraphQLPort {
		const port =
			type === "BACKEND"
				? PortNumbers.backendPortNumber()
				: PortNumbers.frontendPortNumber();

		return this.createPortResource(port, type);
	}

	// =========================================================================
	// QUERY EXECUTION
	// =========================================================================

	/**
	 * Executes a GraphQL query string
	 * @param {string} query - GraphQL query string
	 * @param {Record<string, unknown>} variables - Query variables
	 * @returns {GraphQLResponse} Execution result
	 *
	 * @example
	 * const result = generator.executeQuery('{ frontendPort { number } }');
	 */
	executeQuery(
		query: string,
		variables?: Record<string, unknown>
	): GraphQLResponse {
		try {
			// Simple query parser (in production, use a proper GraphQL executor)
			if (query.includes("frontendPort")) {
				return {
					data: { frontendPort: this.resolveFrontendPort() },
				};
			} else if (query.includes("backendPort")) {
				return {
					data: { backendPort: this.resolveBackendPort() },
				};
			} else if (query.includes("allPorts")) {
				return {
					data: { allPorts: this.resolveAllPorts() },
				};
			} else if (query.includes("validatePort")) {
				const numberMatch = query.match(/number:\s*(\d+)/);
				const number = numberMatch ? parseInt(numberMatch[1], 10) : 0;
				return {
					data: { validatePort: this.resolveValidatePort(number) },
				};
			} else if (query.includes("statistics")) {
				return {
					data: { statistics: this.resolveStatistics() },
				};
			} else if (query.includes("generatePort")) {
				const typeMatch = query.match(/type:\s*(\w+)/);
				const type = (typeMatch?.[1] || "FRONTEND") as GraphQLPortType;
				return {
					data: { generatePort: this.resolveGeneratePort(type) },
				};
			}

			return {
				errors: [
					{
						message: "Unknown query",
						extensions: { code: "GRAPHQL_VALIDATION_FAILED" },
					},
				],
			};
		} catch (error) {
			return {
				errors: [
					{
						message: error instanceof Error ? error.message : "Unknown error",
						extensions: { code: "INTERNAL_SERVER_ERROR" },
					},
				],
			};
		}
	}

	// =========================================================================
	// HELPER METHODS
	// =========================================================================

	/**
	 * Creates a GraphQL port resource
	 * @private
	 * @param {number} port - Port number
	 * @param {GraphQLPortType} type - Port type
	 * @returns {GraphQLPort} Port resource
	 */
	private createPortResource(port: number, type: GraphQLPortType): GraphQLPort {
		return {
			number: port,
			type,
			metadata: {
				formula:
					type === "BACKEND"
						? "SNOOP_DOGG_NUMBER + SEX_NUMBER (420 + 69)"
						: "SEX_NUMBER concatenated (69 + 69)",
				deterministic: true,
				timestamp: new Date().toISOString(),
				properties: {
					hex: port.toString(16),
					binary: port.toString(2),
					octal: port.toString(8),
					isEven: port % 2 === 0,
					isOdd: port % 2 !== 0,
				},
			},
		};
	}

	/**
	 * Gets all available resolvers
	 * @returns {GraphQLResolvers} Resolver map
	 */
	getResolvers(): GraphQLResolvers {
		return {
			Query: {
				frontendPort: () => this.resolveFrontendPort(),
				backendPort: () => this.resolveBackendPort(),
				allPorts: () => this.resolveAllPorts(),
				validatePort: (...args: unknown[]) =>
					this.resolveValidatePort((args[1] as { number: number }).number),
				statistics: () => this.resolveStatistics(),
			},
			Mutation: {
				generatePort: (...args: unknown[]) =>
					this.resolveGeneratePort((args[1] as { type: GraphQLPortType }).type),
			},
		};
	}
}

// =========================================================================
// TYPE DEFINITIONS
// =========================================================================

/**
 * @type GraphQLPortType
 * @description Port type enumeration for GraphQL
 */
export type GraphQLPortType = "FRONTEND" | "BACKEND";

/**
 * @interface GraphQLPort
 * @description GraphQL port resource
 */
export interface GraphQLPort {
	/** Port number */
	number: number;
	/** Port type */
	type: GraphQLPortType;
	/** Port metadata */
	metadata: GraphQLPortMetadata;
}

/**
 * @interface GraphQLPortMetadata
 * @description Port metadata for GraphQL
 */
export interface GraphQLPortMetadata {
	/** Formula used to calculate the port */
	formula: string;
	/** Whether the port is deterministic */
	deterministic: boolean;
	/** Timestamp when port was generated */
	timestamp: string;
	/** Port properties */
	properties: GraphQLPortProperties;
}

/**
 * @interface GraphQLPortProperties
 * @description Port number properties
 */
export interface GraphQLPortProperties {
	/** Hexadecimal representation */
	hex: string;
	/** Binary representation */
	binary: string;
	/** Octal representation */
	octal: string;
	/** Whether the port is even */
	isEven: boolean;
	/** Whether the port is odd */
	isOdd: boolean;
}

/**
 * @interface GraphQLValidationResult
 * @description Port validation result
 */
export interface GraphQLValidationResult {
	/** Port number validated */
	port: number;
	/** Whether the port is valid */
	valid: boolean;
	/** Port type if valid */
	type: GraphQLPortType | null;
	/** Validation message */
	message: string;
}

/**
 * @interface GraphQLStatistics
 * @description Port generation statistics
 */
export interface GraphQLStatistics {
	/** Total number of port types */
	totalTypes: number;
	/** Frontend port number */
	frontendPort: number;
	/** Backend port number */
	backendPort: number;
	/** Sum of all ports */
	sumOfPorts: number;
}

/**
 * @interface GraphQLResponse
 * @description GraphQL execution response
 */
export interface GraphQLResponse {
	/** Response data */
	data?: Record<string, unknown>;
	/** Errors if any */
	errors?: Array<{
		message: string;
		locations?: Array<{ line: number; column: number }>;
		path?: string[];
		extensions?: Record<string, unknown>;
	}>;
}

/**
 * @interface GraphQLResolvers
 * @description GraphQL resolver map
 */
export interface GraphQLResolvers {
	/** Query resolvers */
	Query: Record<string, (...args: unknown[]) => unknown>;
	/** Mutation resolvers */
	Mutation: Record<string, (...args: unknown[]) => unknown>;
}

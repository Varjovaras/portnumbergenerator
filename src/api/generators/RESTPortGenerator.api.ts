/**
 * @fileoverview RESTPortGenerator - RESTful API port number generator
 * @module @portnumbergenerator/api/generators
 * @category API Layer - Generators
 * @since 1.0.0
 *
 * @description
 * RESTful API implementation for port number generation using HTTP semantics.
 * Provides standard REST endpoints for generating, validating, and managing
 * port numbers with proper status codes and response formats.
 *
 * **Features:**
 * - RESTful resource-based endpoints
 * - Standard HTTP status codes
 * - JSON response format
 * - Error handling with RFC 7807 Problem Details
 * - HATEOAS (Hypermedia as the Engine of Application State)
 *
 * **Endpoints:**
 * - `GET /api/ports/frontend` - Get frontend port
 * - `GET /api/ports/backend` - Get backend port
 * - `POST /api/ports/generate` - Generate custom port
 * - `GET /api/ports/:port/validate` - Validate a port number
 *
 * @example
 * ```typescript
 * import { RESTPortGenerator } from '@portnumbergenerator/api/generators';
 *
 * const generator = new RESTPortGenerator();
 * const response = generator.getFrontendPort();
 * // {
 * //   status: 200,
 * //   data: { port: 6969, type: "frontend" },
 * //   links: { self: "/api/ports/frontend", ... }
 * // }
 * ```
 */

import { PortNumbers } from "../../application/legacy/index.js";

/**
 * @class RESTPortGenerator
 * @classdesc RESTful API implementation for port number generation
 *
 * @description
 * Provides a RESTful interface to the port number generation system.
 * Implements standard REST principles including resource-based URLs,
 * proper HTTP methods, status codes, and hypermedia links.
 *
 * **REST Principles Applied:**
 * - Resource identification through URIs
 * - Manipulation through representations
 * - Self-descriptive messages
 * - Hypermedia as the engine of application state (HATEOAS)
 */
export class RESTPortGenerator {
	private readonly baseUrl: string;

	/**
	 * Creates a new REST port generator
	 * @constructor
	 * @param {string} baseUrl - Base URL for API endpoints (default: "/api")
	 */
	constructor(baseUrl: string = "/api") {
		this.baseUrl = baseUrl;
	}

	// =========================================================================
	// REST ENDPOINTS - GET OPERATIONS
	// =========================================================================

	/**
	 * GET /api/ports/frontend - Retrieves frontend port
	 * @returns {RESTResponse<PortResource>} REST response with frontend port
	 *
	 * @example
	 * const response = generator.getFrontendPort();
	 * // {
	 * //   status: 200,
	 * //   data: { port: 6969, type: "frontend", timestamp: "..." },
	 * //   links: { self: "/api/ports/frontend", backend: "/api/ports/backend" }
	 * // }
	 */
	getFrontendPort(): RESTResponse<PortResource> {
		const port = PortNumbers.frontendPortNumber();
		return {
			status: 200,
			statusText: "OK",
			data: {
				port,
				type: "frontend",
				timestamp: new Date().toISOString(),
				metadata: {
					formula: "SEX_NUMBER concatenated (69 + 69)",
					deterministic: true,
				},
			},
			links: this.generateLinks("frontend"),
		};
	}

	/**
	 * GET /api/ports/backend - Retrieves backend port
	 * @returns {RESTResponse<PortResource>} REST response with backend port
	 *
	 * @example
	 * const response = generator.getBackendPort();
	 * // {
	 * //   status: 200,
	 * //   data: { port: 42069, type: "backend", timestamp: "..." },
	 * //   links: { self: "/api/ports/backend", frontend: "/api/ports/frontend" }
	 * // }
	 */
	getBackendPort(): RESTResponse<PortResource> {
		const port = PortNumbers.backendPortNumber();
		return {
			status: 200,
			statusText: "OK",
			data: {
				port,
				type: "backend",
				timestamp: new Date().toISOString(),
				metadata: {
					formula: "SNOOP_DOGG_NUMBER + SEX_NUMBER (420 + 69)",
					deterministic: true,
				},
			},
			links: this.generateLinks("backend"),
		};
	}

	/**
	 * GET /api/ports - Retrieves all port numbers
	 * @returns {RESTResponse<PortCollection>} REST response with all ports
	 *
	 * @example
	 * const response = generator.getAllPorts();
	 * // {
	 * //   status: 200,
	 * //   data: {
	 * //     ports: [
	 * //       { port: 6969, type: "frontend" },
	 * //       { port: 42069, type: "backend" }
	 * //     ],
	 * //     count: 2
	 * //   }
	 * // }
	 */
	getAllPorts(): RESTResponse<PortCollection> {
		const frontend = PortNumbers.frontendPortNumber();
		const backend = PortNumbers.backendPortNumber();

		return {
			status: 200,
			statusText: "OK",
			data: {
				ports: [
					{ port: frontend, type: "frontend" },
					{ port: backend, type: "backend" },
				],
				count: 2,
				timestamp: new Date().toISOString(),
			},
			links: {
				self: `${this.baseUrl}/ports`,
				frontend: `${this.baseUrl}/ports/frontend`,
				backend: `${this.baseUrl}/ports/backend`,
			},
		};
	}

	/**
	 * GET /api/ports/:port/validate - Validates a port number
	 * @param {number} port - Port number to validate
	 * @returns {RESTResponse<ValidationResource>} Validation result
	 *
	 * @example
	 * const response = generator.validatePort(6969);
	 * // {
	 * //   status: 200,
	 * //   data: { port: 6969, valid: true, type: "frontend" }
	 * // }
	 */
	validatePort(port: number): RESTResponse<ValidationResource> {
		const frontend = PortNumbers.frontendPortNumber();
		const backend = PortNumbers.backendPortNumber();

		const isValid = port === frontend || port === backend;
		const type = port === frontend ? "frontend" : port === backend ? "backend" : null;

		return {
			status: 200,
			statusText: "OK",
			data: {
				port,
				valid: isValid,
				type,
				timestamp: new Date().toISOString(),
			},
			links: {
				self: `${this.baseUrl}/ports/${port}/validate`,
				ports: `${this.baseUrl}/ports`,
			},
		};
	}

	// =========================================================================
	// REST ENDPOINTS - POST OPERATIONS
	// =========================================================================

	/**
	 * POST /api/ports/generate - Generates port numbers
	 * @param {GeneratePortRequest} request - Generation request
	 * @returns {RESTResponse<PortResource>} Generated port resource
	 *
	 * @example
	 * const response = generator.generatePort({ type: "frontend" });
	 * // {
	 * //   status: 201,
	 * //   data: { port: 6969, type: "frontend", ... }
	 * // }
	 */
	generatePort(request: GeneratePortRequest): RESTResponse<PortResource> {
		const { type = "frontend" } = request;

		const port =
			type === "backend"
				? PortNumbers.backendPortNumber()
				: PortNumbers.frontendPortNumber();

		return {
			status: 201,
			statusText: "Created",
			data: {
				port,
				type,
				timestamp: new Date().toISOString(),
				metadata: {
					formula:
						type === "backend"
							? "SNOOP_DOGG_NUMBER + SEX_NUMBER"
							: "SEX_NUMBER concatenated",
					deterministic: true,
				},
			},
			links: this.generateLinks(type),
		};
	}

	// =========================================================================
	// ERROR HANDLING (RFC 7807 PROBLEM DETAILS)
	// =========================================================================

	/**
	 * Creates an RFC 7807 Problem Details error response
	 * @param {number} status - HTTP status code
	 * @param {string} title - Error title
	 * @param {string} detail - Error detail
	 * @returns {RESTResponse<ProblemDetails>} Error response
	 *
	 * @example
	 * const error = generator.createError(404, "Not Found", "Port not found");
	 */
	createError(
		status: number,
		title: string,
		detail: string
	): RESTResponse<ProblemDetails> {
		return {
			status,
			statusText: title,
			data: {
				type: "about:blank",
				title,
				status,
				detail,
				instance: `${this.baseUrl}/errors/${Date.now()}`,
			},
			links: {
				self: `${this.baseUrl}/ports`,
			},
		};
	}

	/**
	 * Handles 404 Not Found errors
	 * @param {string} resource - Resource that was not found
	 * @returns {RESTResponse<ProblemDetails>} 404 error response
	 */
	notFound(resource: string): RESTResponse<ProblemDetails> {
		return this.createError(
			404,
			"Not Found",
			`The requested resource '${resource}' was not found`
		);
	}

	/**
	 * Handles 400 Bad Request errors
	 * @param {string} message - Error message
	 * @returns {RESTResponse<ProblemDetails>} 400 error response
	 */
	badRequest(message: string): RESTResponse<ProblemDetails> {
		return this.createError(400, "Bad Request", message);
	}

	// =========================================================================
	// HYPERMEDIA (HATEOAS)
	// =========================================================================

	/**
	 * Generates HATEOAS links for a port resource
	 * @private
	 * @param {string} type - Port type (frontend/backend)
	 * @returns {Record<string, string>} Hypermedia links
	 */
	private generateLinks(type: string): Record<string, string> {
		return {
			self: `${this.baseUrl}/ports/${type}`,
			collection: `${this.baseUrl}/ports`,
			frontend: `${this.baseUrl}/ports/frontend`,
			backend: `${this.baseUrl}/ports/backend`,
			validate: `${this.baseUrl}/ports/{port}/validate`,
		};
	}
}

// =========================================================================
// TYPE DEFINITIONS
// =========================================================================

/**
 * @interface RESTResponse
 * @description Standard REST response envelope
 * @template T - Data type
 */
export interface RESTResponse<T> {
	/** HTTP status code */
	status: number;
	/** HTTP status text */
	statusText: string;
	/** Response data */
	data: T;
	/** HATEOAS links */
	links?: Record<string, string>;
}

/**
 * @interface PortResource
 * @description Port resource representation
 */
export interface PortResource {
	/** Port number */
	port: number;
	/** Port type (frontend/backend) */
	type: string;
	/** Timestamp of generation */
	timestamp: string;
	/** Additional metadata */
	metadata?: {
		formula?: string;
		deterministic?: boolean;
		[key: string]: unknown;
	};
}

/**
 * @interface PortCollection
 * @description Collection of port resources
 */
export interface PortCollection {
	/** Array of port resources */
	ports: Array<{ port: number; type: string }>;
	/** Total count */
	count: number;
	/** Timestamp */
	timestamp: string;
}

/**
 * @interface ValidationResource
 * @description Port validation result
 */
export interface ValidationResource {
	/** Port number validated */
	port: number;
	/** Whether port is valid */
	valid: boolean;
	/** Port type if valid */
	type: string | null;
	/** Timestamp */
	timestamp: string;
}

/**
 * @interface GeneratePortRequest
 * @description Request body for port generation
 */
export interface GeneratePortRequest {
	/** Port type to generate */
	type?: "frontend" | "backend";
}

/**
 * @interface ProblemDetails
 * @description RFC 7807 Problem Details for HTTP APIs
 */
export interface ProblemDetails {
	/** Problem type URI */
	type: string;
	/** Short summary */
	title: string;
	/** HTTP status code */
	status: number;
	/** Detailed explanation */
	detail: string;
	/** URI reference identifying the problem occurrence */
	instance: string;
}

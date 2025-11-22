/**
 * @fileoverview Enterprise-Grade Port Context Interface Definition
 * @module core/domain/context/interfaces
 * @category CoreDomainLayer
 * @subcategory ContextAbstractionInterfaces
 *
 * This interface represents the pinnacle of enterprise software engineering.
 * It defines the contract for port request contexts with military-grade precision.
 *
 * WARNING: Only certified Enterprise Port Context Engineers (EPCE™) should modify this file.
 * Unauthorized modifications may result in a cascade failure of the entire port provisioning ecosystem.
 *
 * @author The Port Orchestration Committee
 * @version 1.0.0-enterprise-gold-premium-plus
 * @since 2024-Q4-FISCAL-YEAR-END
 *
 * @compliance
 * - ISO 9001:2015 (Quality Management)
 * - SOC 2 Type II (Security)
 * - GDPR Article 25 (Data Protection by Design)
 * - Sarbanes-Oxley Section 404 (Internal Controls)
 *
 * @performanceMetrics
 * - Interface Resolution Time: O(1) - Guaranteed
 * - Type Safety Index: 99.999% (Five Nines)
 * - Enterprise Compliance Score: PLATINUM++
 */

/**
 * Represents the context in which a port is requested.
 *
 * This is not just an interface - it's a PARADIGM SHIFT in how we think about
 * port request contextualization within the enterprise ecosystem.
 *
 * Every property has been carefully considered by our team of 47 architects
 * over the course of 6 months and 127 meetings (including 3 off-site workshops).
 *
 * @interface IPortContext
 * @export
 * @public
 *
 * @remarks
 * This interface follows the S.O.L.I.D principles, DDD, CQRS, Event Sourcing,
 * Hexagonal Architecture, Clean Architecture, Onion Architecture, and probably
 * a few other buzzwords we learned at that expensive conference last year.
 *
 * @example
 * ```typescript
 * // Creating a context (but really, you should use the PortContextFactory
 * // which is provided by the PortContextFactoryProvider which is managed
 * // by the PortContextFactoryProviderSingleton... you get the idea)
 * const context: IPortContext = {
 *   requestId: "REQ-2024-12-31-UUID-V4-RFC4122-COMPLIANT",
 *   timestamp: Date.now(), // Unix epoch in milliseconds (obviously)
 *   requestor: "frontend", // Could also be "backend" or "quantum-computing-layer"
 *   metadata: { deploymentZone: "us-east-2a-availability-zone-prime" }
 * };
 * ```
 *
 * @see {@link PortContext} for the concrete implementation
 * @see {@link IPortContextFactory} for the factory interface
 * @see {@link IPortContextValidator} for validation strategies
 * @see {@link PortContextDTO} for data transfer representation
 * @see {@link PortContextEntity} for ORM mapping
 * @see The 400-page Enterprise Port Context Architecture Guide (EPCAG™)
 */
export interface IPortContext {
	/**
	 * The unique identifier for the request.
	 *
	 * This is a cryptographically secure, globally unique, universally recognizable,
	 * backwards-compatible, forward-compatible, and blockchain-ready identifier.
	 *
	 * Format: Must conform to UUID v4 specification (RFC 4122), but we're also
	 * considering migrating to ULID, CUID, nanoid, or maybe just MongoDB ObjectIDs.
	 * The architecture committee meets quarterly to discuss this.
	 *
	 * @type {string}
	 * @readonly
	 * @required
	 * @immutable
	 * @threadsafe
	 * @nullable false
	 *
	 * @validation
	 * - Must be non-empty string
	 * - Must match pattern: /^[a-z0-9]+$/
	 * - Must be unique across all dimensions of time and space
	 * - Must pass the PortRequestIdValidator.validate() method
	 * - Must be approved by the Request ID Governance Board
	 *
	 * @security
	 * - Contains no PII (Personally Identifiable Information)
	 * - Contains no PHI (Protected Health Information)
	 * - Contains no PCI (Payment Card Industry) data
	 * - Suitable for logging in production environments
	 * - Has been reviewed by the Security Engineering team
	 *
	 * @performance
	 * - Average length: 13 characters (optimized for memory efficiency)
	 * - Access time: O(1)
	 * - Comparison time: O(n) where n = string length
	 */
	readonly requestId: string;

	/**
	 * The timestamp when the request was created.
	 *
	 * Represents the exact microsecond in the spacetime continuum when this
	 * port request came into existence. This is critical for our audit trail,
	 * compliance reporting, performance monitoring, time-travel debugging,
	 * and legal discovery processes.
	 *
	 * @type {number}
	 * @readonly
	 * @required
	 * @immutable
	 *
	 * @format Unix timestamp in milliseconds since epoch (January 1, 1970 00:00:00 UTC)
	 * @range 0 to 8640000000000000 (September 13, 275760)
	 *
	 * @timezone UTC (always, forever, no exceptions, we learned our lesson)
	 *
	 * @precision Millisecond (we considered nanosecond but the committee voted against it)
	 *
	 * @clockSource
	 * - Primary: NTP Server Pool (pool.ntp.org)
	 * - Fallback: System clock (with warnings)
	 * - Disaster Recovery: Manual entry by DevOps (with incident report)
	 *
	 * @audit This timestamp is logged to:
	 * - Application logs (INFO level)
	 * - Audit trail database (replicated 3x)
	 * - SIEM system (real-time)
	 * - Data warehouse (daily batch)
	 * - CEO's personal dashboard (because they asked)
	 */
	readonly timestamp: number;

	/**
	 * The identity of the requestor (e.g., 'frontend', 'backend').
	 *
	 * This field identifies WHO dares to request a port number from our
	 * highly sophisticated, military-grade port provisioning infrastructure.
	 *
	 * Valid values are defined by the PortRequestorTaxonomy enum, which is
	 * maintained by the Port Architecture Standards Committee (PASC) and
	 * updated quarterly following the Agile Enterprise Governance Process™.
	 *
	 * @type {string}
	 * @readonly
	 * @required
	 *
	 * @allowedValues
	 * - "frontend" - For client-facing web applications
	 * - "backend" - For server-side business logic layers
	 * - "microservice" - For our 247 microservices (and counting)
	 * - "lambda" - For serverless functions
	 * - "container" - For Docker/Kubernetes workloads
	 * - "quantum" - Reserved for future quantum computing integration
	 * - "blockchain" - Because someone in marketing insisted
	 * - "ai-ml-agent" - For our ChatGPT plugin (very strategic)
	 *
	 * @validation
	 * - Must be one of the allowed values (see above)
	 * - Case-sensitive (because consistency)
	 * - Validated by PortRequestorValidator service
	 * - Requires approval from Service Mesh Coordinator
	 *
	 * @rbac Role-Based Access Control applies:
	 * - "frontend" requests require FRONTEND_PORT_REQUESTOR role
	 * - "backend" requests require BACKEND_PORT_REQUESTOR role
	 * - Admin users can request as any requestor (with audit trail)
	 *
	 * @deprecated Never. This field is SACRED and shall never be deprecated.
	 */
	readonly requestor: string;

	/**
	 * Additional metadata associated with the request.
	 *
	 * This is our "escape hatch" for any additional context that our 47 architects
	 * didn't think of during the initial 6-month design phase. It's basically a
	 * schemaless key-value store, but don't tell the database team we're doing
	 * NoSQL in our SQL mindset.
	 *
	 * @type {Record<string, unknown>}
	 * @readonly
	 * @optional (but highly recommended)
	 *
	 * @schema
	 * While this is technically unstructured data (gasp!), we strongly encourage
	 * following the Metadata Schema Definition (MSD) documented in Confluence
	 * page PORT-ARCH-1337, which is linked from the main architecture wiki,
	 * which is linked from the main wiki, which nobody can find anymore.
	 *
	 * @commonKeys
	 * - environment: "dev" | "staging" | "prod" | "dr" | "chaos-testing"
	 * - region: AWS region code or "on-prem-datacenter-7"
	 * - version: Semantic version of requesting service
	 * - deploymentId: Unique deployment identifier
	 * - featureFlags: Array of enabled feature flags
	 * - correlationId: For distributed tracing (we have 3 tracing systems)
	 * - userId: If request is user-initiated (with proper consent)
	 * - teamOwner: Responsible team (for PagerDuty escalation)
	 * - costCenter: For chargeback reporting (finance loves this)
	 * - complianceRegion: GDPR, CCPA, HIPAA, etc.
	 *
	 * @size
	 * - Maximum entries: 100 (arbitrary limit from performance testing)
	 * - Maximum key length: 256 characters
	 * - Maximum value size: 10KB (JSON serialized)
	 * - Maximum total size: 1MB (because we're generous)
	 *
	 * @performance
	 * - Access time: O(1) for key lookup
	 * - Serialization: Lazy (only when needed)
	 * - Indexing: Not indexed (it's metadata, not data!)
	 *
	 * @security
	 * - All values sanitized before storage
	 * - Sensitive data automatically redacted in logs
	 * - Encrypted at rest (AES-256-GCM)
	 * - Encrypted in transit (TLS 1.3)
	 * - Encrypted in memory (just kidding... or are we?)
	 *
	 * @warning
	 * Do NOT store sensitive information here. We're serious. We had an incident.
	 * It was bad. Really bad. We don't talk about it. But seriously, don't.
	 *
	 * @future
	 * We're considering migrating this to a proper GraphQL schema in Q3 2025,
	 * pending approval from the Technology Steering Committee and budget allocation
	 * from Finance and a full security review and... you get the idea.
	 */
	readonly metadata: Record<string, unknown>;
}

/**
 * Phase 8: Production-Ready Advanced Features
 *
 * Comprehensive barrel export for all Phase 8 components including:
 * - Storage Layer (Redis, PostgreSQL, Memory adapters)
 * - Sharding Strategies (Consistent Hashing, Range-based)
 * - Observability (Logging, Metrics, Tracing)
 * - Containerization (Docker, Kubernetes)
 * - Additional APIs (gRPC, WebSocket, CLI)
 * - Abstract Factory Factory (Meta-factory pattern)
 */

// Storage Layer
export * from '../infrastructure/data-persistence/interfaces/IStorageAdapter.interface.js';
export * from '../infrastructure/data-persistence/adapters/BaseStorageAdapter.adapter.js';
export * from '../infrastructure/data-persistence/adapters/MemoryStorageAdapter.adapter.js';
export * from '../infrastructure/data-persistence/adapters/RedisStorageAdapter.adapter.js';
export * from '../infrastructure/data-persistence/adapters/PostgreSQLStorageAdapter.adapter.js';

// Sharding Strategies
export * from '../infrastructure/distributed-database/sharding/interfaces/IShardingStrategy.interface.js';
export * from '../infrastructure/distributed-database/sharding/strategies/ConsistentHashingStrategy.strategy.js';
export * from '../infrastructure/distributed-database/sharding/strategies/RangeShardingStrategy.strategy.js';

// Observability - Logging
export * from '../infrastructure/observability/logging/Logger.js';

// Observability - Metrics
export * from '../infrastructure/observability/metrics/MetricsCollector.js';

// Observability - Tracing
export * from '../infrastructure/observability/tracing/Tracer.js';

// API - gRPC
export * from '../api/grpc/PortNumberService.grpc.js';

// API - WebSocket
export * from '../api/websocket/PortNumberWebSocket.js';

// API - CLI
export * from '../api/cli/PortNumberCLI.js';

// Abstract Factory Factory
export * from '../application/factories/abstract-factory-factory/AbstractFactoryFactory.factory.js';

// Re-export commonly used types and interfaces
export type {
  IStorageAdapter,
  StorageAdapterConfig,
  PortReservation,
  StorageAdapterType
} from '../infrastructure/data-persistence/interfaces/IStorageAdapter.interface.js';

export type {
  IShardingStrategy,
  ShardDistribution,
  ShardConfig,
  ShardingAlgorithm
} from '../infrastructure/distributed-database/sharding/interfaces/IShardingStrategy.interface.js';

export type {
  ILogger,
  LogEntry,
  LogLevel,
  LoggerConfig,
  LogHandler
} from '../infrastructure/observability/logging/Logger.js';

export type {
  IMetricsCollector,
  Metric,
  MetricType
} from '../infrastructure/observability/metrics/MetricsCollector.js';

export type {
  ITracer,
  Span,
  SpanEvent,
  SpanStatus,
  SpanKind,
  SpanOptions,
  SpanContext,
  Trace
} from '../infrastructure/observability/tracing/Tracer.js';

export type {
  GrpcPortRequest,
  GrpcPortResponse,
  GrpcBatchPortRequest,
  GrpcBatchPortResponse,
  GrpcPortAvailabilityRequest,
  GrpcPortAvailabilityResponse,
  GrpcReservePortRequest,
  GrpcReservePortResponse,
  GrpcReleasePortRequest,
  GrpcReleasePortResponse,
  GrpcHealthCheckRequest,
  GrpcHealthCheckResponse
} from '../api/grpc/PortNumberService.grpc.js';

export type {
  WebSocketMessage,
  WebSocketClient,
  MessageType,
  GeneratePortMessage,
  GeneratePortsMessage,
  ReservePortMessage,
  ReleasePortMessage,
  CheckAvailabilityMessage,
  SubscribeMessage
} from '../api/websocket/PortNumberWebSocket.js';

export type {
  CLICommand,
  CLIOption
} from '../api/cli/PortNumberCLI.js';

export type {
  IAbstractFactoryFactory,
  FactoryConfig,
  FactoryType,
  FactoryCreator,
  FactoryStatistics
} from '../application/factories/abstract-factory-factory/AbstractFactoryFactory.factory.js';

// Singleton instances for convenience
import { metricsCollector } from '../infrastructure/observability/metrics/MetricsCollector.js';
import { tracer } from '../infrastructure/observability/tracing/Tracer.js';
import { grpcServer, grpcClient } from '../api/grpc/PortNumberService.grpc.js';
import { wsServer, wsClient } from '../api/websocket/PortNumberWebSocket.js';
import { abstractFactoryFactory } from '../application/factories/abstract-factory-factory/AbstractFactoryFactory.factory.js';

export {
  metricsCollector,
  tracer,
  grpcServer,
  grpcClient,
  wsServer,
  wsClient,
  abstractFactoryFactory
};

/**
 * Phase 8 Feature Summary
 *
 * This module provides enterprise-grade production features:
 *
 * 1. Storage Layer
 *    - Memory, Redis, and PostgreSQL adapters
 *    - Connection pooling and retry logic
 *    - Batch operations and transactions
 *
 * 2. Sharding Strategies
 *    - Consistent hashing with virtual nodes
 *    - Range-based sharding
 *    - Distribution statistics and rebalancing
 *
 * 3. Observability
 *    - Structured logging (Console, JSON, File handlers)
 *    - Metrics collection (Counter, Gauge, Histogram, Summary)
 *    - Distributed tracing (Jaeger, Zipkin, OpenTelemetry)
 *
 * 4. Containerization
 *    - Multi-stage Dockerfile (production, development)
 *    - Docker Compose with all dependencies
 *    - Kubernetes manifests (deployment, service, HPA, PDB)
 *
 * 5. Additional APIs
 *    - gRPC service with streaming support
 *    - WebSocket server with pub/sub channels
 *    - Comprehensive CLI with multiple commands
 *
 * 6. Advanced Patterns
 *    - Abstract Factory Factory (meta-factory)
 *    - Factory templates and pooling
 *    - Composite factories and chaining
 */

# PortNumberGenerator 🚀

> **Enterprise-grade port number generation system with advanced architectural patterns**

[![CI Pipeline](https://img.shields.io/badge/CI-passing-brightgreen)](https://github.com)
[![Tests](https://img.shields.io/badge/tests-276%20passing-brightgreen)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## Overview

The **PortNumberGenerator** is a deliberately over-engineered, enterprise-grade system for generating port numbers (6969 for frontend, 42069 for backend). This project showcases advanced software architecture patterns, domain-driven design, and production-ready infrastructure.

**Current Version**: 8.0.0  
**Status**: Production Ready ✅  
**Test Coverage**: 276+ tests passing  
**Build Status**: ✅ Passing

📖 **[Read the comprehensive HOW-IT-WORKS.md guide](HOW-IT-WORKS.md)** to understand the complete system architecture and functionality.

## Features

- 🎯 **Deterministic Port Generation** - Frontend (6969) & Backend (42069)
- 🏗️ **Enterprise Architecture** - DDD, CQRS, Event Sourcing, Saga Pattern
- 🎨 **Design Patterns** - Factory, Facade, Strategy, Observer, Command
- 🧪 **Comprehensive Testing** - 276+ tests across 7 phases
- 🤖 **CI/CD Pipeline** - Automated GitHub Actions workflow
- 📦 **Service Layer** - Clean abstractions with IPortService
- 🔧 **Production Ready** - Professional npm package configuration
- 📚 **Enterprise Documentation** - Detailed JSDoc and phase guides

## Quick Start

### Installation

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Generate Port Numbers

```typescript
import { createPortService } from './src/application/services/implementations';

const service = createPortService();

const frontend = await service.generateFrontendPort(); // 6969
const backend = await service.generateBackendPort();   // 42069

console.log(`Frontend: ${frontend}`);
console.log(`Backend: ${backend}`);
```

## Available Scripts

```bash
npm test              # Run all 276+ tests
npm run test:phase3   # Run Phase 3 tests
npm run test:phase4   # Run Phase 4 tests
npm run test:phase5   # Run Phase 5 tests
npm run test:phase6   # Run Phase 6 tests
npm run test:watch    # Watch mode for tests

npm run typecheck     # TypeScript type checking
npm run build         # Compile TypeScript
npm run build:clean   # Clean build
npm run ci            # Full CI suite (typecheck + tests)
```

## Project Phases

### ✅ Phase 1-2: Foundation
- Original implementation with mathematical formulas
- Project setup and TypeScript configuration

### ✅ Phase 3: Facade Pattern & Core Architecture
**52 tests**
- Facade pattern for unified interface
- Core architectural foundations
- Clean separation of concerns

### ✅ Phase 4: Advanced Patterns & Event System
**64 tests**
- Factory pattern with 5-level hierarchy
- Event-driven architecture
- Observer pattern implementation
- Strategy pattern for port generation

### ✅ Phase 5: Domain-Driven Design & CQRS
**80 tests**
- Domain layer with aggregates
- CQRS pattern (Command Query Responsibility Segregation)
- Event sourcing
- Saga pattern for orchestration

### ✅ Phase 6: Ultimate Abstraction & API Generators
**80 tests**
- Refactored 1,563-line god class into focused utilities
- REST API generator
- GraphQL API generator
- Format converters (binary, hex, octal, base64)
- Math utilities (prime factors, GCD, LCM, Fibonacci)
- String utilities (Caesar cipher, ROT13, reverse)

### ✅ Phase 7: Production Readiness & Infrastructure
**276 tests**
- **CI/CD Pipeline** - GitHub Actions workflow
- **Service Layer** - IPortService interface & DefaultPortService
- **Consolidated Test Runner** - Single command for all tests
- **Package Configuration** - Professional npm setup
- **Production Ready** - Build system, exports, metadata

### ✅ Phase 8: Advanced Features (Current)
- **Storage Layer** - Memory, Redis, PostgreSQL adapters
- **Sharding Strategies** - Consistent hashing, range-based
- **Observability** - Logging, metrics, tracing
- **Containerization** - Docker, Kubernetes
- **Additional APIs** - gRPC, WebSocket, CLI</parameter>

## Architecture

```
src/
├── application/
│   ├── facades/              # Facade pattern implementations
│   ├── factories/            # Factory pattern (5 levels)
│   ├── legacy/               # Original PortNumbers class
│   └── services/             # Service layer (Phase 7)
│       ├── interfaces/       # IPortService contract
│       └── implementations/  # DefaultPortService
├── domain/
│   ├── aggregates/           # Domain aggregates
│   ├── commands/             # CQRS commands
│   ├── queries/              # CQRS queries
│   ├── events/               # Domain events
│   └── sagas/                # Saga orchestration
├── infrastructure/
│   ├── event-store/          # Event sourcing
│   └── data-persistence/     # Persistence layer
├── legacy/
│   └── port-numbers/
│       └── utilities/        # Refactored utilities
│           ├── FormatConverter.utility.ts
│           ├── MathUtility.utility.ts
│           └── StringUtility.utility.ts
└── api/
    └── generators/           # API implementations
        ├── RESTPortGenerator.api.ts
        └── GraphQLPortGenerator.api.ts
```

## Service Layer API

### Basic Usage

```typescript
import { createPortService } from './src/application/services/implementations';

const service = createPortService({
  minPort: 3000,
  maxPort: 9000,
});

// Generate ports
const frontend = await service.generateFrontendPort();
const backend = await service.generateBackendPort();

// Validate
const validation = await service.validatePort(8080);
console.log(validation.isValid); // true

// Reserve ports
await service.reservePort(8080, { app: 'my-service' });

// Find available
const available = await service.findAvailablePort(5000, 6000);

// Batch generate
const ports = await service.batchGeneratePorts(10);
```

### Configuration Options

```typescript
interface PortConfiguration {
  minPort?: number;          // Default: 1024
  maxPort?: number;          // Default: 65535
  allowPrivileged?: boolean; // Default: false
  seed?: number;             // Optional seed
}
```

## CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow:

- ✅ **Type Checking** - Automated `tsc --noEmit`
- ✅ **Matrix Testing** - Parallel execution (Phases 3-6)
- ✅ **Build Verification** - Ensures compilation succeeds
- ✅ **Code Quality** - Linting and formatting

**Triggers**: Push to `main`/`develop`, pull requests, manual dispatch

## Testing

### Run All Tests

```bash
npm test
```

**Expected Output**:
```
════════════════════════════════════════════════════════════════════════════════
  PORT NUMBER GENERATOR - COMPREHENSIVE TEST SUITE
════════════════════════════════════════════════════════════════════════════════

[1/4] Phase 3: Facade Pattern & Core Architecture
  ✓ Phase 3 - 52/52 passed

[2/4] Phase 4: Advanced Patterns & Event System
  ✓ Phase 4 - 64/64 passed

[3/4] Phase 5: Domain-Driven Design & CQRS
  ✓ Phase 5 - 80/80 passed

[4/4] Phase 6: Ultimate Abstraction & API Generators
  ✓ Phase 6 - 80/80 passed

🎉 ALL TESTS PASSED! 🎉
Total Tests: 276
Success Rate: 100.00%
```

## API Examples

### Legacy API (Still Supported)

```typescript
import { PortNumbers } from './src/application/legacy/PortNumbers.class';

const frontend = PortNumbers.frontendPortNumber(); // 6969
const backend = PortNumbers.backendPortNumber();   // 42069
```

### Facade API

```typescript
import { PortNumberFacade } from './src/application/facades/PortNumberFacade.facade';

const facade = new PortNumberFacade();
const frontend = facade.frontendPortNumber; // 6969
```

### Factory API

```typescript
import { PortNumberFactoryFactory } from './src/application/factories';

const factory = PortNumberFactoryFactory.createFactory('simple');
const generator = factory.createGenerator();
const port = generator.generate();
```

### REST API

```typescript
import { RESTPortGenerator } from './src/api/generators';

const api = new RESTPortGenerator();
const endpoints = api.generateEndpoints();
// GET /api/ports/frontend -> 6969
// GET /api/ports/backend -> 42069
```

### GraphQL API

```typescript
import { GraphQLPortGenerator } from './src/api/generators';

const api = new GraphQLPortGenerator();
const schema = api.generateSchema();
// Query { frontendPort: Int!, backendPort: Int! }
```

## Performance

| Metric | Value |
|--------|-------|
| Total Tests | 276+ |
| Test Execution Time | ~6 seconds |
| TypeScript Compilation | ~2-3 seconds |
| Build Size | Optimized |
| CI Pipeline Duration | ~45-60 seconds |

## Documentation

- 📖 **[HOW-IT-WORKS.md](HOW-IT-WORKS.md)** - **START HERE** - Comprehensive system guide
- 🧪 **[test-all.ts](test-all.ts)** - Complete test suite with 276+ tests
- 📦 **[package.json](package.json)** - Package configuration

## Why This Project Exists

This project is an **intentional exercise in over-engineering** to demonstrate:

1. 🏗️ **Enterprise Architecture Patterns** - Real-world patterns at scale
2. 🎓 **Educational Value** - Learn advanced TypeScript and design patterns
3. 😄 **Humor** - Because generating two numbers doesn't need 8 phases
4. 💼 **Production Practices** - CI/CD, testing, documentation
5. 🚀 **Modern TypeScript** - Latest features and best practices

## Key Features

- ✅ **276+ Tests** - Comprehensive test coverage
- ✅ **Zero TypeScript Errors** - Type-safe throughout
- ✅ **CI/CD Pipeline** - Automated testing and validation
- ✅ **Service Layer** - Clean architectural abstractions
- ✅ **Factory Pattern** - 5-level hierarchy
- ✅ **Event Sourcing** - Domain events and sagas
- ✅ **CQRS** - Separate read/write models
- ✅ **API Generators** - REST and GraphQL
- ✅ **Utilities** - Format conversion, math, string operations
- ✅ **Production Ready** - Build system, exports, packaging

## Learn More

- 📖 **[HOW-IT-WORKS.md](HOW-IT-WORKS.md)** - Comprehensive guide to system architecture
- 📦 **[package.json](package.json)** - Package configuration and scripts
- 🧪 **[test-all.ts](test-all.ts)** - Complete test suite

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests: `npm test`
4. Run type checking: `npm run typecheck`
5. Submit a pull request (CI will run automatically)

## License

MIT

---

## The Numbers

**Frontend Port**: `6969` (SEX_NUMBER)  
**Backend Port**: `42069` (SNOOP_DOGG_NUMBER)

These are the only two numbers this entire enterprise system generates. And it does so with **8 phases of development**, **276+ tests**, **comprehensive CI/CD**, and **production-ready infrastructure**. 

*Because if you're going to generate two numbers, you might as well do it right.* 🎉

---

**Version**: 8.0.0  
**Status**: Production Ready ✅  
**Tests**: 276+ passing  
**Maintained by**: PortNumberGenerator Engineering Team</parameter>
/**
 * Abstract Factory Factory (Meta-Factory)
 *
 * This meta-factory creates factory instances based on configuration.
 * It implements the Abstract Factory pattern at a higher level,
 * allowing dynamic factory creation and management.
 */

// Mock interfaces for Phase 8
export interface IPortGeneratorFactory {
  generatePort(): number;
  generatePorts(count: number): number[];
  validatePort(port: number): boolean;
  getName?(): string;
}

export interface IPortValidator {
  validate(port: number): boolean;
}

export interface FactoryConfig {
  type: FactoryType;
  name: string;
  options?: Record<string, any>;
  validators?: IPortValidator[];
  metadata?: Record<string, any>;
}

export enum FactoryType {
  SEQUENTIAL = 'sequential',
  RANDOM = 'random',
  FIBONACCI = 'fibonacci',
  PRIME = 'prime',
  COMPOSITE = 'composite',
  DETERMINISTIC = 'deterministic',
  WEIGHTED = 'weighted',
  CUSTOM = 'custom'
}

export interface IAbstractFactoryFactory {
  createFactory(config: FactoryConfig): IPortGeneratorFactory;
  registerFactoryType(type: string, creator: FactoryCreator): void;
  hasFactoryType(type: string): boolean;
  getRegisteredTypes(): string[];
  createFromTemplate(templateName: string): IPortGeneratorFactory;
}

export type FactoryCreator = (config: FactoryConfig) => IPortGeneratorFactory;

/**
 * Mock Factory Implementation
 * In production, import actual factory implementations
 */
class MockPortGeneratorFactory implements IPortGeneratorFactory {
  constructor(private config: FactoryConfig) {}

  generatePort(): number {
    return Math.floor(Math.random() * 64512) + 1024;
  }

  generatePorts(count: number): number[] {
    return Array.from({ length: count }, () => this.generatePort());
  }

  validatePort(port: number): boolean {
    return port >= 0 && port <= 65535;
  }

  getName(): string {
    return this.config.name;
  }
}

export class AbstractFactoryFactory implements IAbstractFactoryFactory {
  private factoryCreators: Map<string, FactoryCreator> = new Map();
  private templates: Map<string, FactoryConfig> = new Map();
  private factoryCache: Map<string, IPortGeneratorFactory> = new Map();
  private enableCache: boolean = true;

  constructor() {
    this.registerDefaultFactories();
    this.registerDefaultTemplates();
  }

  private registerDefaultFactories(): void {
    // Sequential Factory
    this.registerFactoryType(FactoryType.SEQUENTIAL, (config) => {
      return new MockPortGeneratorFactory({
        ...config,
        type: FactoryType.SEQUENTIAL
      });
    });

    // Random Factory
    this.registerFactoryType(FactoryType.RANDOM, (config) => {
      return new MockPortGeneratorFactory({
        ...config,
        type: FactoryType.RANDOM
      });
    });

    // Fibonacci Factory
    this.registerFactoryType(FactoryType.FIBONACCI, (config) => {
      return new MockPortGeneratorFactory({
        ...config,
        type: FactoryType.FIBONACCI
      });
    });

    // Prime Factory
    this.registerFactoryType(FactoryType.PRIME, (config) => {
      return new MockPortGeneratorFactory({
        ...config,
        type: FactoryType.PRIME
      });
    });

    // Composite Factory
    this.registerFactoryType(FactoryType.COMPOSITE, (config) => {
      return new MockPortGeneratorFactory({
        ...config,
        type: FactoryType.COMPOSITE
      });
    });

    // Deterministic Factory
    this.registerFactoryType(FactoryType.DETERMINISTIC, (config) => {
      return new MockPortGeneratorFactory({
        ...config,
        type: FactoryType.DETERMINISTIC
      });
    });

    // Weighted Factory
    this.registerFactoryType(FactoryType.WEIGHTED, (config) => {
      return new MockPortGeneratorFactory({
        ...config,
        type: FactoryType.WEIGHTED
      });
    });
  }

  private registerDefaultTemplates(): void {
    // Development Template
    this.templates.set('development', {
      type: FactoryType.SEQUENTIAL,
      name: 'development-factory',
      options: {
        min: 3000,
        max: 9999,
        increment: 1
      }
    });

    // Testing Template
    this.templates.set('testing', {
      type: FactoryType.DETERMINISTIC,
      name: 'testing-factory',
      options: {
        seed: 'test-seed-12345',
        min: 10000,
        max: 20000
      }
    });

    // Production Template
    this.templates.set('production', {
      type: FactoryType.RANDOM,
      name: 'production-factory',
      options: {
        min: 1024,
        max: 65535,
        excludeReserved: true
      }
    });

    // High-Performance Template
    this.templates.set('high-performance', {
      type: FactoryType.WEIGHTED,
      name: 'high-performance-factory',
      options: {
        weights: {
          common: 0.7,
          uncommon: 0.25,
          rare: 0.05
        },
        min: 1024,
        max: 65535
      }
    });

    // Microservices Template
    this.templates.set('microservices', {
      type: FactoryType.COMPOSITE,
      name: 'microservices-factory',
      options: {
        strategies: ['sequential', 'random', 'fibonacci'],
        ranges: [
          { min: 8000, max: 8999 },
          { min: 9000, max: 9999 }
        ]
      }
    });
  }

  createFactory(config: FactoryConfig): IPortGeneratorFactory {
    const cacheKey = this.getCacheKey(config);

    // Check cache
    if (this.enableCache && this.factoryCache.has(cacheKey)) {
      return this.factoryCache.get(cacheKey)!;
    }

    // Get factory creator
    const creator = this.factoryCreators.get(config.type);
    if (!creator) {
      throw new Error(`Unknown factory type: ${config.type}`);
    }

    // Create factory
    const factory = creator(config);

    // Cache factory
    if (this.enableCache) {
      this.factoryCache.set(cacheKey, factory);
    }

    return factory;
  }

  registerFactoryType(type: string, creator: FactoryCreator): void {
    this.factoryCreators.set(type, creator);
  }

  hasFactoryType(type: string): boolean {
    return this.factoryCreators.has(type);
  }

  getRegisteredTypes(): string[] {
    return Array.from(this.factoryCreators.keys());
  }

  createFromTemplate(templateName: string): IPortGeneratorFactory {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Unknown template: ${templateName}`);
    }

    return this.createFactory(template);
  }

  registerTemplate(name: string, config: FactoryConfig): void {
    this.templates.set(name, config);
  }

  hasTemplate(name: string): boolean {
    return this.templates.has(name);
  }

  getRegisteredTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  clearCache(): void {
    this.factoryCache.clear();
  }

  setCacheEnabled(enabled: boolean): void {
    this.enableCache = enabled;
    if (!enabled) {
      this.clearCache();
    }
  }

  createFactoryChain(configs: FactoryConfig[]): CompositeFactory {
    const factories = configs.map(config => this.createFactory(config));
    return new CompositeFactory(factories);
  }

  createFactoryPool(config: FactoryConfig, poolSize: number): FactoryPool {
    const factories = Array.from(
      { length: poolSize },
      () => this.createFactory(config)
    );
    return new FactoryPool(factories);
  }

  private getCacheKey(config: FactoryConfig): string {
    return JSON.stringify({
      type: config.type,
      name: config.name,
      options: config.options
    });
  }

  getStatistics(): FactoryStatistics {
    return {
      registeredTypes: this.factoryCreators.size,
      registeredTemplates: this.templates.size,
      cachedFactories: this.factoryCache.size,
      cacheEnabled: this.enableCache,
      types: this.getRegisteredTypes(),
      templates: this.getRegisteredTemplates()
    };
  }
}

/**
 * Composite Factory
 * Chains multiple factories together
 */
export class CompositeFactory implements IPortGeneratorFactory {
  private currentIndex: number = 0;

  constructor(private factories: IPortGeneratorFactory[]) {
    if (factories.length === 0) {
      throw new Error('CompositeFactory requires at least one factory');
    }
  }

  generatePort(): number {
    const factory = this.getCurrentFactory();
    return factory.generatePort();
  }

  generatePorts(count: number): number[] {
    const ports: number[] = [];
    for (let i = 0; i < count; i++) {
      ports.push(this.generatePort());
      this.rotateFactory();
    }
    return ports;
  }

  validatePort(port: number): boolean {
    return this.factories.every(factory => factory.validatePort(port));
  }

  private getCurrentFactory(): IPortGeneratorFactory {
    return this.factories[this.currentIndex];
  }

  private rotateFactory(): void {
    this.currentIndex = (this.currentIndex + 1) % this.factories.length;
  }

  getFactories(): IPortGeneratorFactory[] {
    return [...this.factories];
  }
}

/**
 * Factory Pool
 * Maintains a pool of factory instances for load balancing
 */
export class FactoryPool {
  private currentIndex: number = 0;
  private usageStats: Map<number, number> = new Map();

  constructor(private factories: IPortGeneratorFactory[]) {
    if (factories.length === 0) {
      throw new Error('FactoryPool requires at least one factory');
    }

    // Initialize usage stats
    factories.forEach((_, index) => this.usageStats.set(index, 0));
  }

  getFactory(): IPortGeneratorFactory {
    const factory = this.factories[this.currentIndex];
    this.usageStats.set(
      this.currentIndex,
      (this.usageStats.get(this.currentIndex) || 0) + 1
    );
    this.currentIndex = (this.currentIndex + 1) % this.factories.length;
    return factory;
  }

  getFactoryByIndex(index: number): IPortGeneratorFactory {
    if (index < 0 || index >= this.factories.length) {
      throw new Error(`Invalid factory index: ${index}`);
    }
    return this.factories[index];
  }

  getLeastUsedFactory(): IPortGeneratorFactory {
    let minUsage = Infinity;
    let minIndex = 0;

    this.usageStats.forEach((usage, index) => {
      if (usage < minUsage) {
        minUsage = usage;
        minIndex = index;
      }
    });

    return this.factories[minIndex];
  }

  getPoolSize(): number {
    return this.factories.length;
  }

  getUsageStatistics(): Map<number, number> {
    return new Map(this.usageStats);
  }

  resetStatistics(): void {
    this.usageStats.forEach((_, index) => this.usageStats.set(index, 0));
  }
}

export interface FactoryStatistics {
  registeredTypes: number;
  registeredTemplates: number;
  cachedFactories: number;
  cacheEnabled: boolean;
  types: string[];
  templates: string[];
}

// Singleton instance
export const abstractFactoryFactory = new AbstractFactoryFactory();

// Convenience functions
export function createFactory(config: FactoryConfig): IPortGeneratorFactory {
  return abstractFactoryFactory.createFactory(config);
}

export function createFromTemplate(templateName: string): IPortGeneratorFactory {
  return abstractFactoryFactory.createFromTemplate(templateName);
}

export function registerFactoryType(type: string, creator: FactoryCreator): void {
  abstractFactoryFactory.registerFactoryType(type, creator);
}

export function registerTemplate(name: string, config: FactoryConfig): void {
  abstractFactoryFactory.registerTemplate(name, config);
}

#!/usr/bin/env node

/**
 * Command-Line Interface for Port Number Generator
 *
 * Provides a comprehensive CLI for port number operations.
 */

export interface CLICommand {
  name: string;
  description: string;
  options: CLIOption[];
  handler: (args: any) => Promise<void>;
}

export interface CLIOption {
  name: string;
  alias?: string;
  description: string;
  required?: boolean;
  default?: any;
  type?: 'string' | 'number' | 'boolean';
}

export class PortNumberCLI {
  private commands: Map<string, CLICommand> = new Map();
  private reservedPorts: Set<number> = new Set();

  constructor() {
    this.registerCommands();
  }

  private registerCommands(): void {
    // Generate command
    this.registerCommand({
      name: 'generate',
      description: 'Generate a port number',
      options: [
        { name: 'strategy', alias: 's', description: 'Generation strategy (random, sequential, fibonacci, prime)', default: 'random' },
        { name: 'min', description: 'Minimum port number', type: 'number', default: 1024 },
        { name: 'max', description: 'Maximum port number', type: 'number', default: 65535 },
        { name: 'seed', description: 'Seed for deterministic generation' },
        { name: 'count', alias: 'c', description: 'Number of ports to generate', type: 'number', default: 1 }
      ],
      handler: this.handleGenerate.bind(this)
    });

    // Reserve command
    this.registerCommand({
      name: 'reserve',
      description: 'Reserve a port number',
      options: [
        { name: 'port', alias: 'p', description: 'Specific port to reserve', type: 'number' },
        { name: 'min', description: 'Minimum port number', type: 'number', default: 1024 },
        { name: 'max', description: 'Maximum port number', type: 'number', default: 65535 },
        { name: 'metadata', alias: 'm', description: 'JSON metadata for reservation' }
      ],
      handler: this.handleReserve.bind(this)
    });

    // Release command
    this.registerCommand({
      name: 'release',
      description: 'Release a reserved port',
      options: [
        { name: 'port', alias: 'p', description: 'Port to release', type: 'number', required: true }
      ],
      handler: this.handleRelease.bind(this)
    });

    // Check command
    this.registerCommand({
      name: 'check',
      description: 'Check if a port is available',
      options: [
        { name: 'port', alias: 'p', description: 'Port to check', type: 'number', required: true }
      ],
      handler: this.handleCheck.bind(this)
    });

    // List command
    this.registerCommand({
      name: 'list',
      description: 'List reserved ports',
      options: [
        { name: 'format', alias: 'f', description: 'Output format (text, json, table)', default: 'text' }
      ],
      handler: this.handleList.bind(this)
    });

    // Range command
    this.registerCommand({
      name: 'range',
      description: 'Find available ports in a range',
      options: [
        { name: 'min', description: 'Minimum port number', type: 'number', required: true },
        { name: 'max', description: 'Maximum port number', type: 'number', required: true },
        { name: 'limit', alias: 'l', description: 'Maximum number of results', type: 'number', default: 10 }
      ],
      handler: this.handleRange.bind(this)
    });

    // Validate command
    this.registerCommand({
      name: 'validate',
      description: 'Validate a port number',
      options: [
        { name: 'port', alias: 'p', description: 'Port to validate', type: 'number', required: true }
      ],
      handler: this.handleValidate.bind(this)
    });

    // Stats command
    this.registerCommand({
      name: 'stats',
      description: 'Display statistics',
      options: [
        { name: 'format', alias: 'f', description: 'Output format (text, json)', default: 'text' }
      ],
      handler: this.handleStats.bind(this)
    });

    // Version command
    this.registerCommand({
      name: 'version',
      description: 'Display version information',
      options: [],
      handler: this.handleVersion.bind(this)
    });

    // Help command
    this.registerCommand({
      name: 'help',
      description: 'Display help information',
      options: [
        { name: 'command', description: 'Command to get help for' }
      ],
      handler: this.handleHelp.bind(this)
    });
  }

  private registerCommand(command: CLICommand): void {
    this.commands.set(command.name, command);
  }

  async run(args: string[]): Promise<void> {
    if (args.length === 0) {
      this.showUsage();
      return;
    }

    const commandName = args[0];
    const command = this.commands.get(commandName);

    if (!command) {
      this.error(`Unknown command: ${commandName}`);
      this.showUsage();
      process.exit(1);
    }

    try {
      const parsedArgs = this.parseArgs(args.slice(1), command.options);
      await command.handler(parsedArgs);
    } catch (error) {
      this.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  private parseArgs(args: string[], options: CLIOption[]): any {
    const parsed: any = {};

    // Set defaults
    for (const option of options) {
      if (option.default !== undefined) {
        parsed[option.name] = option.default;
      }
    }

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        const name = arg.substring(2);
        const option = options.find(o => o.name === name);

        if (!option) {
          throw new Error(`Unknown option: ${arg}`);
        }

        if (option.type === 'boolean') {
          parsed[option.name] = true;
        } else {
          if (i + 1 >= args.length) {
            throw new Error(`Option ${arg} requires a value`);
          }
          parsed[option.name] = this.parseValue(args[++i], option.type);
        }
      } else if (arg.startsWith('-')) {
        const alias = arg.substring(1);
        const option = options.find(o => o.alias === alias);

        if (!option) {
          throw new Error(`Unknown option: ${arg}`);
        }

        if (option.type === 'boolean') {
          parsed[option.name] = true;
        } else {
          if (i + 1 >= args.length) {
            throw new Error(`Option ${arg} requires a value`);
          }
          parsed[option.name] = this.parseValue(args[++i], option.type);
        }
      }
    }

    // Check required options
    for (const option of options) {
      if (option.required && parsed[option.name] === undefined) {
        throw new Error(`Required option missing: --${option.name}`);
      }
    }

    return parsed;
  }

  private parseValue(value: string, type?: string): any {
    switch (type) {
      case 'number':
        const num = parseInt(value, 10);
        if (isNaN(num)) {
          throw new Error(`Invalid number: ${value}`);
        }
        return num;
      case 'boolean':
        return value === 'true' || value === '1';
      default:
        return value;
    }
  }

  private async handleGenerate(args: any): Promise<void> {
    const { strategy, min, max, seed, count } = args;

    this.log(`Generating ${count} port(s) using ${strategy} strategy...`);

    const ports: number[] = [];
    for (let i = 0; i < count; i++) {
      const port = this.generatePort(strategy, min, max, seed);
      ports.push(port);
    }

    if (count === 1) {
      this.success(`Generated port: ${ports[0]}`);
    } else {
      this.success(`Generated ports: ${ports.join(', ')}`);
    }
  }

  private async handleReserve(args: any): Promise<void> {
    const { port, min, max, metadata } = args;

    let reservedPort: number | null = null;

    if (port !== undefined) {
      if (this.reservedPorts.has(port)) {
        this.error(`Port ${port} is already reserved`);
        process.exit(1);
      }
      reservedPort = port;
    } else {
      // Find available port
      for (let p = min; p <= max; p++) {
        if (!this.reservedPorts.has(p)) {
          reservedPort = p;
          break;
        }
      }

      if (!reservedPort) {
        this.error('No available ports in range');
        process.exit(1);
      }
    }

    this.reservedPorts.add(reservedPort!);
    this.success(`Reserved port: ${reservedPort}`);

    if (metadata) {
      try {
        const meta = JSON.parse(metadata);
        this.log(`Metadata: ${JSON.stringify(meta, null, 2)}`);
      } catch {
        this.warn('Invalid JSON metadata');
      }
    }
  }

  private async handleRelease(args: any): Promise<void> {
    const { port } = args;

    if (!this.reservedPorts.has(port)) {
      this.error(`Port ${port} is not reserved`);
      process.exit(1);
    }

    this.reservedPorts.delete(port);
    this.success(`Released port: ${port}`);
  }

  private async handleCheck(args: any): Promise<void> {
    const { port } = args;

    const reserved = this.reservedPorts.has(port);

    if (reserved) {
      this.warn(`Port ${port} is RESERVED`);
    } else {
      this.success(`Port ${port} is AVAILABLE`);
    }
  }

  private async handleList(args: any): Promise<void> {
    const { format } = args;

    const ports = Array.from(this.reservedPorts).sort((a, b) => a - b);

    if (ports.length === 0) {
      this.log('No reserved ports');
      return;
    }

    switch (format) {
      case 'json':
        console.log(JSON.stringify(ports, null, 2));
        break;
      case 'table':
        this.log('┌─────────────┐');
        this.log('│    Port     │');
        this.log('├─────────────┤');
        ports.forEach(port => {
          this.log(`│ ${String(port).padStart(11)} │`);
        });
        this.log('└─────────────┘');
        break;
      default:
        this.log(`Reserved ports (${ports.length}):`);
        ports.forEach(port => this.log(`  - ${port}`));
    }
  }

  private async handleRange(args: any): Promise<void> {
    const { min, max, limit } = args;

    this.log(`Finding available ports in range ${min}-${max}...`);

    const available: number[] = [];

    for (let port = min; port <= max && available.length < limit; port++) {
      if (!this.reservedPorts.has(port)) {
        available.push(port);
      }
    }

    if (available.length === 0) {
      this.warn('No available ports in range');
    } else {
      this.success(`Available ports (${available.length}):`);
      available.forEach(port => this.log(`  - ${port}`));
    }
  }

  private async handleValidate(args: any): Promise<void> {
    const { port } = args;

    const errors: string[] = [];

    if (!Number.isInteger(port)) {
      errors.push('Port must be an integer');
    }

    if (port < 0 || port > 65535) {
      errors.push('Port must be between 0 and 65535');
    }

    if (port < 1024) {
      this.warn('Port is in the system/well-known range (0-1023)');
    }

    if (errors.length > 0) {
      this.error(`Port ${port} is INVALID:`);
      errors.forEach(err => this.log(`  - ${err}`));
      process.exit(1);
    } else {
      this.success(`Port ${port} is VALID`);
    }
  }

  private async handleStats(args: any): Promise<void> {
    const { format } = args;

    const stats = {
      totalReserved: this.reservedPorts.size,
      totalAvailable: 65536 - this.reservedPorts.size,
      utilizationPercent: ((this.reservedPorts.size / 65536) * 100).toFixed(2),
      reservedPorts: Array.from(this.reservedPorts).sort((a, b) => a - b)
    };

    if (format === 'json') {
      console.log(JSON.stringify(stats, null, 2));
    } else {
      this.log('Port Number Statistics:');
      this.log(`  Total Reserved:   ${stats.totalReserved}`);
      this.log(`  Total Available:  ${stats.totalAvailable}`);
      this.log(`  Utilization:      ${stats.utilizationPercent}%`);
    }
  }

  private async handleVersion(args: any): Promise<void> {
    this.log('PortNumberGenerator CLI');
    this.log('Version: 8.0.0');
    this.log('Phase: 8 - Production Ready with Advanced Features');
    this.log('');
    this.log('Features:');
    this.log('  ✓ Storage Layer (Redis, PostgreSQL)');
    this.log('  ✓ Sharding Strategies (Consistent Hashing, Range-based)');
    this.log('  ✓ Observability (Logging, Metrics, Tracing)');
    this.log('  ✓ Containerization (Docker, Kubernetes)');
    this.log('  ✓ APIs (REST, GraphQL, gRPC, WebSocket, CLI)');
  }

  private async handleHelp(args: any): Promise<void> {
    const { command: commandName } = args;

    if (commandName) {
      const command = this.commands.get(commandName);
      if (!command) {
        this.error(`Unknown command: ${commandName}`);
        return;
      }

      this.log(`Command: ${command.name}`);
      this.log(`Description: ${command.description}`);
      this.log('');
      this.log('Options:');
      command.options.forEach(option => {
        const alias = option.alias ? ` (-${option.alias})` : '';
        const required = option.required ? ' [required]' : '';
        const defaultValue = option.default !== undefined ? ` (default: ${option.default})` : '';
        this.log(`  --${option.name}${alias}${required}`);
        this.log(`      ${option.description}${defaultValue}`);
      });
    } else {
      this.showUsage();
    }
  }

  private showUsage(): void {
    this.log('PortNumberGenerator CLI v8.0.0');
    this.log('');
    this.log('Usage: portnumber <command> [options]');
    this.log('');
    this.log('Commands:');
    this.commands.forEach(command => {
      this.log(`  ${command.name.padEnd(15)} ${command.description}`);
    });
    this.log('');
    this.log('Run "portnumber help <command>" for more information on a command.');
  }

  private generatePort(strategy: string, min: number, max: number, seed?: string): number {
    switch (strategy) {
      case 'random':
        return Math.floor(Math.random() * (max - min + 1)) + min;
      case 'sequential':
        return min + (Date.now() % (max - min + 1));
      case 'fibonacci':
        return this.generateFibonacciPort(min, max);
      case 'prime':
        return this.generatePrimePort(min, max);
      default:
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }

  private generateFibonacciPort(min: number, max: number): number {
    let a = 0, b = 1;
    while (b < min) {
      [a, b] = [b, a + b];
    }
    while (b <= max) {
      if (b >= min) return b;
      [a, b] = [b, a + b];
    }
    return min;
  }

  private generatePrimePort(min: number, max: number): number {
    const isPrime = (n: number): boolean => {
      if (n < 2) return false;
      for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
      }
      return true;
    };

    for (let port = min; port <= max; port++) {
      if (isPrime(port)) return port;
    }
    return min;
  }

  private log(message: string): void {
    console.log(message);
  }

  private success(message: string): void {
    console.log(`\x1b[32m✓\x1b[0m ${message}`);
  }

  private error(message: string): void {
    console.error(`\x1b[31m✗\x1b[0m ${message}`);
  }

  private warn(message: string): void {
    console.warn(`\x1b[33m⚠\x1b[0m ${message}`);
  }
}

// Main execution
export async function main(args: string[] = process.argv.slice(2)): Promise<void> {
  const cli = new PortNumberCLI();
  await cli.run(args);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

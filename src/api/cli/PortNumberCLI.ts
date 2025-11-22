#!/usr/bin/env node

/**
 * @fileoverview Enterprise Command-Line Interface for Port Number Generation
 *
 * This file contains the revolutionary command-line interface (CLI) for the
 * Port Number Generator™ enterprise application. Because sometimes you need
 * to generate port numbers from the command line instead of through our
 * REST API, GraphQL endpoint, gRPC service, WebSocket connection, or the
 * 47 other ways we've provided to access the same two numbers.
 *
 * @module api/cli
 * @category API Layer
 * @subcategory Command-Line Interface
 * @since 1.0.0
 * @version 4.2.0-CLI-ULTIMATE-EDITION
 *
 * @remarks
 * This CLI implements the Command Pattern combined with the Strategy Pattern
 * to provide a flexible, extensible, and hilariously over-engineered interface
 * for port number operations. Each command is encapsulated as a first-class
 * object with its own handler, options, and validation logic.
 *
 * **Architectural Highlights:**
 *
 * - **Command Pattern**: Each CLI command is a discrete, testable object
 * - **Async/Await**: All operations are asynchronous (even the ones that don't need to be)
 * - **Type Safety**: Full TypeScript coverage with strict type checking
 * - **Extensibility**: New commands can be added without modifying existing code
 * - **Validation**: Comprehensive input validation and error handling
 * - **User Experience**: Helpful error messages and detailed help system
 *
 * **Available Commands:**
 *
 * - `generate`: Generate port numbers using various strategies
 * - `reserve`: Reserve specific ports for later use
 * - `release`: Release previously reserved ports
 * - `check`: Check port availability
 * - `list`: List all reserved ports
 * - `range`: Find available ports in a range
 * - `validate`: Validate port numbers
 * - `stats`: Display system statistics
 * - `version`: Display version information
 * - `help`: Display help for commands
 *
 * **Generation Strategies:**
 *
 * - **random**: Random port generation within constraints
 * - **sequential**: Sequential port allocation
 * - **fibonacci**: Port numbers from the Fibonacci sequence
 * - **prime**: Port numbers that are prime numbers
 *
 * **Design Philosophy:**
 *
 * We believe that generating port numbers should be as complicated as possible,
 * and that includes the CLI. Why have a simple script when you can have a
 * full-featured command-line application with subcommands, options, validation,
 * error handling, and enterprise-grade abstractions?
 *
 * @example
 * ```bash
 * # Generate a random port
 * $ port-gen generate
 *
 * # Generate multiple ports
 * $ port-gen generate --count 5 --strategy fibonacci
 *
 * # Reserve a specific port
 * $ port-gen reserve --port 8080 --metadata '{"service": "web-server"}'
 *
 * # Check port availability
 * $ port-gen check --port 3000
 *
 * # List reserved ports
 * $ port-gen list --format json
 * ```
 *
 * @example
 * ```typescript
 * // Programmatic CLI usage
 * const cli = new PortNumberCLI();
 * await cli.run(['generate', '--strategy', 'prime', '--count', '3']);
 * ```
 *
 * @see {@link CLICommand} for command structure
 * @see {@link CLIOption} for option configuration
 * @see {@link PortNumberGenerator} for the underlying port generation logic
 *
 * @author CLI Architecture Team
 * @copyright 2024 PortNumberGenerator™ Corporation
 * @license MIT (but with enterprise flair)
 *
 * @standards
 * - POSIX CLI Standards (mostly compliant)
 * - GNU Command-Line Conventions (when convenient)
 * - The Twelve-Factor App Methodology (we think)
 *
 * @performance
 * - Startup Time: < 100ms (acceptable for a CLI)
 * - Memory Footprint: ~50MB (reasonable for Node.js)
 * - Response Time: < 10ms for most operations
 *
 * @security
 * - Input Validation: All user input is validated
 * - No Shell Injection: Safe command parsing
 * - No Eval: We don't use eval() (we're not monsters)
 * - Error Messages: No sensitive information leaked
 */

/**
 * Interface representing a CLI command.
 *
 * Defines the structure of a command in our CLI system. Each command has a
 * unique name, description, configurable options, and an async handler function
 * that executes the command logic.
 *
 * This interface enables the Command Pattern, where each command is a
 * first-class object that can be registered, discovered, validated, and
 * executed independently.
 *
 * @interface CLICommand
 * @category CLI Infrastructure
 *
 * @remarks
 * Commands are the primary abstraction in our CLI architecture. They encapsulate
 * all the metadata and behavior needed to expose functionality through the
 * command line, including:
 *
 * - User-facing documentation (name, description)
 * - Configuration schema (options with types and defaults)
 * - Business logic (async handler function)
 * - Validation rules (via option definitions)
 *
 * **Design Considerations:**
 *
 * - Commands MUST have unique names (enforced at registration)
 * - Handlers MUST be async (consistency, even when not needed)
 * - Options SHOULD provide clear descriptions
 * - Commands SHOULD be stateless (state in CLI class)
 *
 * **Lifecycle:**
 *
 * 1. Command Registration: Defined and registered during CLI construction
 * 2. Command Discovery: User invokes command by name
 * 3. Argument Parsing: CLI parses arguments against option schema
 * 4. Validation: Required options checked, types validated
 * 5. Handler Execution: Async handler called with parsed arguments
 * 6. Result Display: Handler output shown to user
 *
 * @example
 * ```typescript
 * const pingCommand: CLICommand = {
 *   name: 'ping',
 *   description: 'Check system availability',
 *   options: [
 *     {
 *       name: 'host',
 *       description: 'Host to ping',
 *       required: true,
 *       type: 'string'
 *     }
 *   ],
 *   handler: async (args) => {
 *     console.log(`Pinging ${args.host}...`);
 *     // Ping logic here
 *   }
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 */
export interface CLICommand {
  /**
   * The unique identifier for this command.
   *
   * Used to invoke the command from the command line and for command
   * registration/lookup. MUST be unique across all commands in the CLI.
   *
   * @type {string}
   * @example 'generate', 'reserve', 'validate'
   */
  name: string;

  /**
   * Human-readable description of what this command does.
   *
   * Displayed in help output and command listings. SHOULD be concise
   * but informative, ideally one sentence.
   *
   * @type {string}
   * @example 'Generate a port number using specified strategy'
   */
  description: string;

  /**
   * Array of options that can be passed to this command.
   *
   * Defines the command's configuration schema, including option names,
   * types, defaults, and validation rules.
   *
   * @type {CLIOption[]}
   * @see {@link CLIOption}
   */
  options: CLIOption[];

  /**
   * Async function that executes the command logic.
   *
   * Receives parsed and validated arguments and performs the command's
   * business logic. MUST be async for consistency, even if the operation
   * is synchronous.
   *
   * @param {any} args - Parsed command-line arguments
   * @returns {Promise<void>} Resolves when command completes
   * @throws {Error} If command execution fails
   *
   * @remarks
   * Handler Contract:
   * - MUST be async
   * - SHOULD handle errors gracefully
   * - SHOULD provide user-friendly output
   * - SHOULD log errors to stderr
   * - MAY exit process with non-zero code on failure
   */
  handler: (args: any) => Promise<void>;
}

/**
 * Interface representing a CLI option (flag/argument).
 *
 * Defines the structure of a command-line option that can be passed to a
 * command. Options can be required or optional, have type constraints,
 * default values, and short aliases for convenience.
 *
 * @interface CLIOption
 * @category CLI Infrastructure
 *
 * @remarks
 * Options provide the configuration schema for commands. They enable:
 *
 * - **Type Safety**: Runtime type validation of user input
 * - **Defaults**: Sensible default values when options omitted
 * - **Validation**: Required option enforcement
 * - **Convenience**: Short aliases for common options (e.g., -p for --port)
 * - **Documentation**: Self-documenting CLI through descriptions
 *
 * **Naming Conventions:**
 *
 * - Long names: lowercase, dash-separated (e.g., 'max-port')
 * - Aliases: single letter, lowercase (e.g., 'p', 'm', 'v')
 * - Boolean flags: positive form (e.g., 'verbose', not 'no-quiet')
 *
 * **Type System:**
 *
 * - **string**: Text values (default if type not specified)
 * - **number**: Integer or floating-point numbers
 * - **boolean**: Flags (presence = true, absence = false)
 *
 * @example
 * ```typescript
 * const portOption: CLIOption = {
 *   name: 'port',
 *   alias: 'p',
 *   description: 'Port number to check',
 *   required: true,
 *   type: 'number'
 * };
 * ```
 *
 * @example
 * ```typescript
 * const verboseOption: CLIOption = {
 *   name: 'verbose',
 *   alias: 'v',
 *   description: 'Enable verbose output',
 *   type: 'boolean',
 *   default: false
 * };
 * ```
 *
 * @since 1.0.0
 * @public
 */
export interface CLIOption {
  /**
   * The full name of the option.
   *
   * Used as the long-form flag (e.g., --name). SHOULD be descriptive
   * and use dash-separated lowercase for multi-word names.
   *
   * @type {string}
   * @example 'port', 'max-value', 'output-format'
   */
  name: string;

  /**
   * Optional short alias for the option.
   *
   * Single-character shorthand for convenience (e.g., -p for --port).
   * SHOULD be a single lowercase letter.
   *
   * @type {string | undefined}
   * @optional
   * @example 'p', 'm', 'v'
   */
  alias?: string;

  /**
   * Human-readable description of what this option does.
   *
   * Displayed in help output. SHOULD be concise and explain the option's
   * purpose and expected format.
   *
   * @type {string}
   * @example 'Port number to validate (1-65535)'
   */
  description: string;

  /**
   * Whether this option must be provided by the user.
   *
   * If true, the CLI will error if the option is not provided.
   * If false or undefined, the option is optional.
   *
   * @type {boolean | undefined}
   * @optional
   * @default false
   */
  required?: boolean;

  /**
   * Default value used when option is not provided.
   *
   * Only applies to optional options. Type SHOULD match the option's
   * declared type.
   *
   * @type {any}
   * @optional
   */
  default?: any;

  /**
   * The expected type of the option value.
   *
   * Used for runtime validation and type coercion. If not specified,
   * defaults to 'string'.
   *
   * @type {'string' | 'number' | 'boolean' | undefined}
   * @optional
   * @default 'string'
   */
  type?: 'string' | 'number' | 'boolean';
}

/**
 * Enterprise Command-Line Interface for Port Number Generation.
 *
 * The main CLI class that orchestrates command registration, argument parsing,
 * validation, and command execution. Implements the Command Pattern with
 * support for subcommands, options, validation, and comprehensive error handling.
 *
 * @class PortNumberCLI
 * @category CLI Infrastructure
 *
 * @remarks
 * This class serves as the entry point for all CLI operations. It manages:
 *
 * - **Command Registry**: Map of available commands
 * - **Port Reservations**: In-memory tracking of reserved ports
 * - **Argument Parsing**: Converting argv into structured arguments
 * - **Validation**: Ensuring required options and valid types
 * - **Execution**: Invoking command handlers
 * - **Error Handling**: User-friendly error messages
 *
 * **Architecture:**
 *
 * ```
 * ┌─────────────────────┐
 * │  PortNumberCLI      │
 * ├─────────────────────┤
 * │ - commands: Map     │
 * │ - reservedPorts: Set│
 * ├─────────────────────┤
 * │ + run(args)         │
 * │ + registerCommand() │
 * │ - parseArgs()       │
 * │ - validateArgs()    │
 * │ - executeCommand()  │
 * └─────────────────────┘
 *         │
 *         ├── CLICommand (generate)
 *         ├── CLICommand (reserve)
 *         ├── CLICommand (release)
 *         ├── CLICommand (check)
 *         └── ... (more commands)
 * ```
 *
 * **State Management:**
 *
 * - Commands are registered once during construction
 * - Port reservations are tracked in-memory (not persisted)
 * - CLI instances are typically short-lived (one per invocation)
 *
 * **Extension Points:**
 *
 * - New commands can be added via registerCommand()
 * - Custom strategies can be implemented
 * - Output formatters can be customized
 *
 * @example
 * ```typescript
 * // Typical CLI usage
 * const cli = new PortNumberCLI();
 * await cli.run(process.argv.slice(2));
 * ```
 *
 * @example
 * ```typescript
 * // Programmatic usage
 * const cli = new PortNumberCLI();
 * await cli.run(['generate', '--strategy', 'prime', '--count', '5']);
 * await cli.run(['reserve', '--port', '8080']);
 * await cli.run(['list', '--format', 'json']);
 * ```
 *
 * @example
 * ```typescript
 * // Custom command registration
 * const cli = new PortNumberCLI();
 * cli.registerCommand({
 *   name: 'custom',
 *   description: 'My custom command',
 *   options: [],
 *   handler: async (args) => {
 *     console.log('Custom command executed!');
 *   }
 * });
 * ```
 *
 * @since 1.0.0
 * @public
 */
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

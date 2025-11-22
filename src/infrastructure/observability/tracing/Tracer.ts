export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  attributes: Record<string, any>;
  events: SpanEvent[];
  status: SpanStatus;
  kind: SpanKind;
}

export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, any>;
}

export enum SpanStatus {
  UNSET = 'unset',
  OK = 'ok',
  ERROR = 'error'
}

export enum SpanKind {
  INTERNAL = 'internal',
  SERVER = 'server',
  CLIENT = 'client',
  PRODUCER = 'producer',
  CONSUMER = 'consumer'
}

export interface ITracer {
  startSpan(name: string, options?: SpanOptions): ActiveSpan;
  startSpanWithContext(name: string, context: SpanContext, options?: SpanOptions): ActiveSpan;
  getCurrentSpan(): ActiveSpan | null;
  getTraces(): Trace[];
  exportJaeger(): object;
  exportZipkin(): object;
}

export interface SpanOptions {
  kind?: SpanKind;
  attributes?: Record<string, any>;
  parentSpan?: ActiveSpan;
}

export interface SpanContext {
  traceId: string;
  spanId: string;
}

export interface Trace {
  traceId: string;
  spans: Span[];
  startTime: number;
  endTime?: number;
  duration?: number;
}

export class ActiveSpan {
  private span: Span;
  private ended: boolean = false;

  constructor(
    span: Span,
    private readonly tracer: Tracer
  ) {
    this.span = span;
  }

  setAttribute(key: string, value: any): this {
    if (this.ended) {
      console.warn('Cannot set attribute on ended span');
      return this;
    }
    this.span.attributes[key] = value;
    return this;
  }

  setAttributes(attributes: Record<string, any>): this {
    if (this.ended) {
      console.warn('Cannot set attributes on ended span');
      return this;
    }
    Object.assign(this.span.attributes, attributes);
    return this;
  }

  addEvent(name: string, attributes?: Record<string, any>): this {
    if (this.ended) {
      console.warn('Cannot add event to ended span');
      return this;
    }
    this.span.events.push({
      name,
      timestamp: Date.now(),
      attributes
    });
    return this;
  }

  setStatus(status: SpanStatus): this {
    if (this.ended) {
      console.warn('Cannot set status on ended span');
      return this;
    }
    this.span.status = status;
    return this;
  }

  recordException(error: Error): this {
    if (this.ended) {
      console.warn('Cannot record exception on ended span');
      return this;
    }
    this.span.status = SpanStatus.ERROR;
    this.addEvent('exception', {
      'exception.type': error.name,
      'exception.message': error.message,
      'exception.stacktrace': error.stack
    });
    return this;
  }

  end(): void {
    if (this.ended) {
      return;
    }
    this.span.endTime = Date.now();
    this.span.duration = this.span.endTime - this.span.startTime;
    this.ended = true;
    this.tracer.endSpan(this);
  }

  getSpan(): Span {
    return { ...this.span };
  }

  getTraceId(): string {
    return this.span.traceId;
  }

  getSpanId(): string {
    return this.span.spanId;
  }

  getContext(): SpanContext {
    return {
      traceId: this.span.traceId,
      spanId: this.span.spanId
    };
  }

  isRecording(): boolean {
    return !this.ended;
  }
}

export class Tracer implements ITracer {
  private traces: Map<string, Trace> = new Map();
  private activeSpans: Map<string, ActiveSpan> = new Map();
  private currentSpan: ActiveSpan | null = null;
  private readonly maxTraces: number = 1000;

  startSpan(name: string, options: SpanOptions = {}): ActiveSpan {
    const traceId = this.generateTraceId();
    const spanId = this.generateSpanId();
    const parentSpan = options.parentSpan || this.currentSpan;

    const span: Span = {
      traceId: parentSpan ? parentSpan.getTraceId() : traceId,
      spanId,
      parentSpanId: parentSpan?.getSpanId(),
      name,
      startTime: Date.now(),
      attributes: options.attributes || {},
      events: [],
      status: SpanStatus.UNSET,
      kind: options.kind || SpanKind.INTERNAL
    };

    const activeSpan = new ActiveSpan(span, this);
    this.activeSpans.set(spanId, activeSpan);
    this.currentSpan = activeSpan;

    // Create or update trace
    if (!this.traces.has(span.traceId)) {
      this.traces.set(span.traceId, {
        traceId: span.traceId,
        spans: [],
        startTime: span.startTime
      });
    }

    // Cleanup old traces
    if (this.traces.size > this.maxTraces) {
      const oldestTraceId = this.traces.keys().next().value;
      if (oldestTraceId !== undefined) {
        this.traces.delete(oldestTraceId);
      }
    }

    return activeSpan;
  }

  startSpanWithContext(name: string, context: SpanContext, options: SpanOptions = {}): ActiveSpan {
    const spanId = this.generateSpanId();

    const span: Span = {
      traceId: context.traceId,
      spanId,
      parentSpanId: context.spanId,
      name,
      startTime: Date.now(),
      attributes: options.attributes || {},
      events: [],
      status: SpanStatus.UNSET,
      kind: options.kind || SpanKind.INTERNAL
    };

    const activeSpan = new ActiveSpan(span, this);
    this.activeSpans.set(spanId, activeSpan);
    this.currentSpan = activeSpan;

    // Create or update trace
    if (!this.traces.has(span.traceId)) {
      this.traces.set(span.traceId, {
        traceId: span.traceId,
        spans: [],
        startTime: span.startTime
      });
    }

    return activeSpan;
  }

  getCurrentSpan(): ActiveSpan | null {
    return this.currentSpan;
  }

  endSpan(activeSpan: ActiveSpan): void {
    const span = activeSpan.getSpan();
    const trace = this.traces.get(span.traceId);

    if (trace) {
      trace.spans.push(span);

      // Update trace end time and duration
      if (!trace.endTime || span.endTime! > trace.endTime) {
        trace.endTime = span.endTime;
        trace.duration = trace.endTime! - trace.startTime;
      }
    }

    this.activeSpans.delete(span.spanId);

    // Reset current span if this was it
    if (this.currentSpan === activeSpan) {
      this.currentSpan = span.parentSpanId
        ? this.activeSpans.get(span.parentSpanId) || null
        : null;
    }
  }

  getTraces(): Trace[] {
    return Array.from(this.traces.values());
  }

  getTrace(traceId: string): Trace | undefined {
    return this.traces.get(traceId);
  }

  exportJaeger(): { data: any[] } {
    const jaegerTraces = [];

    for (const trace of this.traces.values()) {
      const jaegerSpans = trace.spans.map(span => ({
        traceID: span.traceId,
        spanID: span.spanId,
        operationName: span.name,
        references: span.parentSpanId
          ? [{
              refType: 'CHILD_OF',
              traceID: span.traceId,
              spanID: span.parentSpanId
            }]
          : [],
        startTime: span.startTime * 1000, // Jaeger uses microseconds
        duration: (span.duration || 0) * 1000,
        tags: Object.entries(span.attributes).map(([key, value]) => ({
          key,
          type: typeof value === 'string' ? 'string' : typeof value === 'number' ? 'float64' : 'bool',
          value
        })),
        logs: span.events.map(event => ({
          timestamp: event.timestamp * 1000,
          fields: [
            { key: 'event', type: 'string', value: event.name },
            ...Object.entries(event.attributes || {}).map(([key, value]) => ({
              key,
              type: typeof value === 'string' ? 'string' : 'string',
              value: String(value)
            }))
          ]
        }))
      }));

      jaegerTraces.push({
        traceID: trace.traceId,
        spans: jaegerSpans,
        processes: {
          p1: {
            serviceName: 'portnumbergenerator',
            tags: []
          }
        }
      });
    }

    return {
      data: jaegerTraces
    };
  }

  exportZipkin(): object {
    const zipkinSpans = [];

    for (const trace of this.traces.values()) {
      for (const span of trace.spans) {
        zipkinSpans.push({
          traceId: span.traceId,
          id: span.spanId,
          parentId: span.parentSpanId,
          name: span.name,
          timestamp: span.startTime * 1000, // Zipkin uses microseconds
          duration: (span.duration || 0) * 1000,
          kind: span.kind.toUpperCase(),
          localEndpoint: {
            serviceName: 'portnumbergenerator'
          },
          tags: span.attributes,
          annotations: span.events.map(event => ({
            timestamp: event.timestamp * 1000,
            value: event.name
          }))
        });
      }
    }

    return zipkinSpans;
  }

  exportOpenTelemetry(): object {
    return {
      resourceSpans: [{
        resource: {
          attributes: [{
            key: 'service.name',
            value: { stringValue: 'portnumbergenerator' }
          }]
        },
        scopeSpans: [{
          scope: {
            name: 'portnumbergenerator-tracer',
            version: '1.0.0'
          },
          spans: Array.from(this.traces.values()).flatMap(trace =>
            trace.spans.map(span => ({
              traceId: span.traceId,
              spanId: span.spanId,
              parentSpanId: span.parentSpanId,
              name: span.name,
              kind: this.mapSpanKindToOtel(span.kind),
              startTimeUnixNano: span.startTime * 1000000,
              endTimeUnixNano: span.endTime ? span.endTime * 1000000 : undefined,
              attributes: Object.entries(span.attributes).map(([key, value]) => ({
                key,
                value: this.mapValueToOtel(value)
              })),
              events: span.events.map(event => ({
                name: event.name,
                timeUnixNano: event.timestamp * 1000000,
                attributes: event.attributes
                  ? Object.entries(event.attributes).map(([key, value]) => ({
                      key,
                      value: this.mapValueToOtel(value)
                    }))
                  : []
              })),
              status: {
                code: span.status === SpanStatus.ERROR ? 2 : span.status === SpanStatus.OK ? 1 : 0
              }
            }))
          )
        }]
      }]
    };
  }

  clear(): void {
    this.traces.clear();
    this.activeSpans.clear();
    this.currentSpan = null;
  }

  private generateTraceId(): string {
    return this.generateHexId(32);
  }

  private generateSpanId(): string {
    return this.generateHexId(16);
  }

  private generateHexId(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 16).toString(16);
    }
    return result;
  }

  private mapSpanKindToOtel(kind: SpanKind): number {
    switch (kind) {
      case SpanKind.INTERNAL: return 1;
      case SpanKind.SERVER: return 2;
      case SpanKind.CLIENT: return 3;
      case SpanKind.PRODUCER: return 4;
      case SpanKind.CONSUMER: return 5;
      default: return 0;
    }
  }

  private mapValueToOtel(value: any): object {
    if (typeof value === 'string') {
      return { stringValue: value };
    } else if (typeof value === 'number') {
      return Number.isInteger(value) ? { intValue: value } : { doubleValue: value };
    } else if (typeof value === 'boolean') {
      return { boolValue: value };
    } else {
      return { stringValue: String(value) };
    }
  }
}

// Singleton instance
export const tracer = new Tracer();

// Convenience functions
export function startSpan(name: string, options?: SpanOptions): ActiveSpan {
  return tracer.startSpan(name, options);
}

export function getCurrentSpan(): ActiveSpan | null {
  return tracer.getCurrentSpan();
}

// Decorator for automatic span creation
export function traced(spanName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const name = spanName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const span = tracer.startSpan(name, {
        kind: SpanKind.INTERNAL,
        attributes: {
          'function.name': propertyKey,
          'function.args.length': args.length
        }
      });

      try {
        const result = await originalMethod.apply(this, args);
        span.setStatus(SpanStatus.OK);
        return result;
      } catch (error) {
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    };

    return descriptor;
  };
}

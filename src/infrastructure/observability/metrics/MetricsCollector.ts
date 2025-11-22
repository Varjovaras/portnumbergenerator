/**
 * @fileoverview Enterprise Metrics Collection and Observability Infrastructure
 * @module @portnumbergenerator/infrastructure/observability/metrics
 * @category Infrastructure Layer - Observability
 * @since 3.0.0
 *
 * @description
 * THE ULTIMATE METRICS COLLECTION SYSTEM - Measuring what matters!
 *
 * This module provides production-grade metrics collection infrastructure for
 * monitoring, alerting, and observing port number generation operations. Because
 * if you can't measure it, you can't manage it (or so the consultants told us).
 *
 * **Why Metrics for Port Numbers?**
 * - To justify our existence to management
 * - Because Prometheus is cool and we want to be cool
 * - To make impressive Grafana dashboards
 * - To know when things break (hopefully before users do)
 * - To look professional in incident post-mortems
 *
 * **Supported Metric Types:**
 * - Counter: Monotonically increasing values (generations, requests)
 * - Gauge: Values that go up and down (active connections, queue size)
 * - Histogram: Distribution of values (response times, port ranges)
 * - Summary: Statistical summaries (percentiles, quantiles)
 *
 * **Integration:**
 * - Prometheus format export (industry standard!)
 * - Custom label support (for that multi-dimensional feel)
 * - Automatic timestamp tracking (because time matters)
 * - In-memory storage (until restart, then it's gone!)
 *
 * **Use Cases:**
 * - Monitor port generation rate
 * - Track error rates and types
 * - Measure response latencies
 * - Count active WebSocket connections
 * - Detect anomalies (if we build that)
 * - Create pretty graphs for demos
 *
 * @example
 * ```typescript
 * const metrics = new MetricsCollector();
 * const counter = metrics.counter('port_generations_total');
 * counter.inc(); // Increment by 1
 * ```
 *
 * @author The Observability Evangelization Team (OET)
 * @copyright 2024 Port Number Generator Corp.
 * @license MIT
 */

/**
 * Metric Type Enumeration
 *
 * @enum {string} MetricType
 * @description
 * Defines all supported metric types following Prometheus conventions.
 *
 * **Metric Types:**
 * - COUNTER: Cumulative metric that only increases (resets on restart)
 * - GAUGE: Metric that can go up or down (current value)
 * - HISTOGRAM: Samples observations and counts them in buckets
 * - SUMMARY: Samples observations and calculates quantiles
 *
 * @since 3.0.0
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary'
}

/**
 * Metric Data Structure
 *
 * @interface Metric
 * @description
 * Represents a single metric observation with metadata.
 *
 * @property {string} name - Metric name (should follow naming conventions)
 * @property {MetricType} type - Type of metric
 * @property {number} value - Current metric value
 * @property {Record<string, string>} [labels] - Optional labels for dimensions
 * @property {number} timestamp - Unix timestamp in milliseconds
 *
 * @since 3.0.0
 */
export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

/**
 * Metrics Collector Interface
 *
 * @interface IMetricsCollector
 * @description
 * Contract for metrics collection implementations.
 * Defines methods for creating and managing different metric types.
 *
 * @since 3.0.0
 */
export interface IMetricsCollector {
  counter(name: string, labels?: Record<string, string>): Counter;
  gauge(name: string, labels?: Record<string, string>): Gauge;
  histogram(name: string, buckets?: number[], labels?: Record<string, string>): Histogram;
  summary(name: string, percentiles?: number[], labels?: Record<string, string>): Summary;

  getMetrics(): Metric[];
  reset(): void;
  exportPrometheus(): string;
}

/**
 * Counter Metric Implementation
 *
 * @class Counter
 * @description
 * THE COUNTER - Going up since initialization!
 *
 * Represents a cumulative metric that can only increase (except when reset).
 * Perfect for counting events like requests, errors, or generated ports.
 *
 * **Characteristics:**
 * - Starts at 0
 * - Can only increment (no decrement)
 * - Resets to 0 on restart
 * - Thread-safe (thanks JavaScript!)
 *
 * **Use Cases:**
 * - Total port generations
 * - Total HTTP requests
 * - Total errors
 * - Total bytes transferred
 *
 * @example
 * ```typescript
 * const counter = metrics.counter('requests_total', { method: 'POST' });
 * counter.inc();     // Increment by 1
 * counter.inc(5);    // Increment by 5
 * console.log(counter.getValue()); // Get current value
 * ```
 *
 * @since 3.0.0
 */
export class Counter {
  private value: number = 0;

  constructor(
    private readonly name: string,
    private readonly labels: Record<string, string> = {},
    private readonly collector: MetricsCollector
  ) {}

  inc(amount: number = 1): void {
    if (amount < 0) {
      throw new Error('Counter can only be incremented by positive values');
    }
    this.value += amount;
    this.collector.recordMetric({
      name: this.name,
      type: MetricType.COUNTER,
      value: this.value,
      labels: this.labels,
      timestamp: Date.now()
    });
  }

  getValue(): number {
    return this.value;
  }

  reset(): void {
    this.value = 0;
  }
}

/**
 * Gauge Metric Implementation
 *
 * @class Gauge
 * @description
 * THE GAUGE - Going up and down like a rollercoaster!
 *
 * Represents a metric that can increase or decrease. Perfect for tracking
 * current values like active connections, queue sizes, or memory usage.
 *
 * **Characteristics:**
 * - Starts at 0
 * - Can increase or decrease
 * - Represents current state
 * - No historical accumulation
 *
 * **Use Cases:**
 * - Active WebSocket connections
 * - Queue depth
 * - Memory usage
 * - CPU usage
 * - Current temperature
 *
 * @example
 * ```typescript
 * const gauge = metrics.gauge('active_connections');
 * gauge.set(10);   // Set to specific value
 * gauge.inc();     // Increment by 1
 * gauge.dec(2);    // Decrement by 2
 * ```
 *
 * @since 3.0.0
 */
export class Gauge {
  private value: number = 0;

  constructor(
    private readonly name: string,
    private readonly labels: Record<string, string> = {},
    private readonly collector: MetricsCollector
  ) {}

  set(value: number): void {
    this.value = value;
    this.collector.recordMetric({
      name: this.name,
      type: MetricType.GAUGE,
      value: this.value,
      labels: this.labels,
      timestamp: Date.now()
    });
  }

  inc(amount: number = 1): void {
    this.value += amount;
    this.collector.recordMetric({
      name: this.name,
      type: MetricType.GAUGE,
      value: this.value,
      labels: this.labels,
      timestamp: Date.now()
    });
  }

  dec(amount: number = 1): void {
    this.value -= amount;
    this.collector.recordMetric({
      name: this.name,
      type: MetricType.GAUGE,
      value: this.value,
      labels: this.labels,
      timestamp: Date.now()
    });
  }

  getValue(): number {
    return this.value;
  }

  reset(): void {
    this.value = 0;
  }
}

/**
 * Histogram Metric Implementation
 *
 * @class Histogram
 * @description
 * THE HISTOGRAM - Bucketing your observations!
 *
 * Tracks distribution of values by counting observations in configurable buckets.
 * Perfect for measuring request durations, response sizes, or any value distribution.
 *
 * **Characteristics:**
 * - Configurable bucket boundaries
 * - Cumulative bucket counts
 * - Tracks sum and count
 * - Can calculate average
 *
 * **Use Cases:**
 * - Response time distribution
 * - Request size distribution
 * - Port number distribution
 * - Latency percentiles
 *
 * @example
 * ```typescript
 * const histogram = metrics.histogram('request_duration_seconds',
 *   [0.1, 0.5, 1, 5, 10]);
 * histogram.observe(0.234); // Record 234ms request
 * ```
 *
 * @since 3.0.0
 */
export class Histogram {
  private buckets: Map<number, number> = new Map();
  private sum: number = 0;
  private count: number = 0;

  /**
   * Creates a new Histogram instance.
   *
   * @param {string} name - Metric name
   * @param {number[]} buckets - Bucket boundaries (default: standard latency buckets)
   * @param {Record<string, string>} labels - Optional labels
   * @param {MetricsCollector} collector - Parent collector
   */
  constructor(
    private readonly name: string,
    buckets: number[] = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    private readonly labels: Record<string, string> = {},
    private readonly collector: MetricsCollector
  ) {
    buckets.forEach(bucket => this.buckets.set(bucket, 0));
  }

  /**
   * Records an observation in the histogram.
   *
   * @param {number} value - Value to observe
   * @returns {void}
   */
  observe(value: number): void {
    this.sum += value;
    this.count++;

    // Update buckets
    for (const [bucket, count] of this.buckets.entries()) {
      if (value <= bucket) {
        this.buckets.set(bucket, count + 1);
      }
    }

    this.collector.recordMetric({
      name: this.name,
      type: MetricType.HISTOGRAM,
      value: value,
      labels: this.labels,
      timestamp: Date.now()
    });
  }

  getBuckets(): Map<number, number> {
    return new Map(this.buckets);
  }

  /**
   * Gets the sum of all observed values.
   *
   * @returns {number} Sum of observations
   */
  getSum(): number {
    return this.sum;
  }

  /**
   * Gets the count of observations.
   *
   * @returns {number} Number of observations
   */
  getCount(): number {
    return this.count;
  }

  /**
   * Gets the average of all observed values.
   *
   * @returns {number} Average value
   */
  getAverage(): number {
    return this.count > 0 ? this.sum / this.count : 0;
  }

  /**
   * Resets all histogram data.
   *
   * @returns {void}
   */
  reset(): void {
    this.buckets.forEach((_, key) => this.buckets.set(key, 0));
    this.sum = 0;
    this.count = 0;
  }
}

/**
 * Summary Metric Implementation
 *
 * @class Summary
 * @description
 * THE SUMMARY - Statistical excellence!
 *
 * Tracks observations and calculates quantiles (percentiles).
 * Perfect for measuring latencies where you need precise percentiles
 * without the overhead of a full histogram.
 *
 * **Characteristics:**
 * - Stores individual observations (bounded by maxSize)
 * - Calculates exact quantiles
 * - Tracks sum and count
 * - More accurate than histogram for percentiles
 *
 * **Use Cases:**
 * - Response time percentiles (p50, p95, p99)
 * - Request size percentiles
 * - Custom quantile calculations
 *
 * @example
 * ```typescript
 * const summary = metrics.summary('request_duration_seconds', [0.5, 0.95, 0.99]);
 * summary.observe(0.123);
 * const p95 = summary.getPercentile(0.95);
 * ```
 *
 * @since 3.0.0
 */
export class Summary {
  private observations: number[] = [];
  private readonly maxSize: number = 1000;
  private sum: number = 0;
  private count: number = 0;

  /**
   * Creates a new Summary instance.
   *
   * @param {string} name - Metric name
   * @param {number[]} percentiles - Quantiles to calculate (0-1 range)
   * @param {Record<string, string>} labels - Optional labels
   * @param {MetricsCollector} collector - Parent collector
   */
  constructor(
    private readonly name: string,
    private readonly percentiles: number[] = [0.5, 0.9, 0.95, 0.99],
    private readonly labels: Record<string, string> = {},
    private readonly collector: MetricsCollector
  ) {}

  /**
   * Records an observation in the summary.
   *
   * @param {number} value - Value to observe
   * @returns {void}
   */
  observe(value: number): void {
    this.observations.push(value);
    this.sum += value;
    this.count++;

    // Keep only most recent observations
    if (this.observations.length > this.maxSize) {
      const removed = this.observations.shift()!;
      this.sum -= removed;
      this.count--;
    }

    this.collector.recordMetric({
      name: this.name,
      type: MetricType.SUMMARY,
      value: value,
      labels: this.labels,
      timestamp: Date.now()
    });
  }

  getPercentile(p: number): number {
    if (this.observations.length === 0) {
      return 0;
    }

    const sorted = [...this.observations].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  getPercentiles(): Map<number, number> {
    const result = new Map<number, number>();
    for (const p of this.percentiles) {
      result.set(p, this.getPercentile(p * 100));
    }
    return result;
  }

  getSum(): number {
    return this.sum;
  }

  getCount(): number {
    return this.count;
  }

  getAverage(): number {
    return this.count > 0 ? this.sum / this.count : 0;
  }

  /**
   * Resets all summary data.
   *
   * @returns {void}
   */
  reset(): void {
    this.observations = [];
    this.sum = 0;
    this.count = 0;
  }
}

/**
 * Main Metrics Collector Implementation
 *
 * @class MetricsCollector
 * @implements {IMetricsCollector}
 * @description
 * THE METRICS ORCHESTRATOR - Bringing it all together!
 *
 * Central coordinator for all metrics collection. Creates and manages
 * Counter, Gauge, Histogram, and Summary metrics. Stores observations
 * and exports them in Prometheus format.
 *
 * **Core Responsibilities:**
 * - Metric creation and registration
 * - Observation storage
 * - Prometheus format export
 * - Reset functionality
 *
 * **Features:**
 * - In-memory metric storage
 * - Label support for dimensions
 * - Prometheus-compatible export
 * - Thread-safe (single-threaded JS)
 *
 * @example
 * ```typescript
 * const collector = new MetricsCollector();
 * const requests = collector.counter('http_requests_total', { method: 'GET' });
 * requests.inc();
 * console.log(collector.exportPrometheus());
 * ```
 *
 * @since 3.0.0
 * @public
 */
export class MetricsCollector implements IMetricsCollector {
  private counters: Map<string, Counter> = new Map();
  private gauges: Map<string, Gauge> = new Map();
  private histograms: Map<string, Histogram> = new Map();
  private summaries: Map<string, Summary> = new Map();
  private metrics: Metric[] = [];
  private readonly maxMetricsHistory = 10000;

  /**
   * Creates or retrieves a Counter metric.
   *
   * @param {string} name - Metric name (should follow naming conventions)
   * @param {Record<string, string>} [labels] - Optional labels for dimensions
   * @returns {Counter} Counter instance
   *
   * @description
   * Creates a new counter or returns existing counter with same name and labels.
   * Counters are cached to ensure consistent metric instances across calls.
   *
   * @example
   * ```typescript
   * const counter = collector.counter('requests_total', { method: 'GET' });
   * counter.inc();
   * ```
   *
   * @since 3.0.0
   */
  counter(name: string, labels?: Record<string, string>): Counter {
    const key = this.getMetricKey(name, labels);

    if (!this.counters.has(key)) {
      this.counters.set(key, new Counter(name, labels, this));
    }

    return this.counters.get(key)!;
  }

  /**
   * Creates or retrieves a Gauge metric.
   *
   * @param {string} name - Metric name
   * @param {Record<string, string>} [labels] - Optional labels
   * @returns {Gauge} Gauge instance
   *
   * @description
   * Creates a new gauge or returns existing gauge with same name and labels.
   *
   * @example
   * ```typescript
   * const gauge = collector.gauge('active_connections');
   * gauge.set(42);
   * ```
   *
   * @since 3.0.0
   */
  gauge(name: string, labels?: Record<string, string>): Gauge {
    const key = this.getMetricKey(name, labels);

    if (!this.gauges.has(key)) {
      this.gauges.set(key, new Gauge(name, labels, this));
    }

    return this.gauges.get(key)!;
  }

  /**
   * Creates or retrieves a Histogram metric.
   *
   * @param {string} name - Metric name
   * @param {number[]} [buckets] - Bucket boundaries
   * @param {Record<string, string>} [labels] - Optional labels
   * @returns {Histogram} Histogram instance
   *
   * @description
   * Creates a new histogram or returns existing histogram with same name and labels.
   *
   * @example
   * ```typescript
   * const histogram = collector.histogram('request_duration_seconds', [0.1, 0.5, 1]);
   * histogram.observe(0.234);
   * ```
   *
   * @since 3.0.0
   */
  histogram(name: string, buckets?: number[], labels?: Record<string, string>): Histogram {
    const key = this.getMetricKey(name, labels);

    if (!this.histograms.has(key)) {
      this.histograms.set(key, new Histogram(name, buckets, labels, this));
    }

    return this.histograms.get(key)!;
  }

  /**
   * Creates or retrieves a Summary metric.
   *
   * @param {string} name - Metric name
   * @param {number[]} [percentiles] - Percentiles to calculate
   * @param {Record<string, string>} [labels] - Optional labels
   * @returns {Summary} Summary instance
   *
   * @description
   * Creates a new summary or returns existing summary with same name and labels.
   *
   * @example
   * ```typescript
   * const summary = collector.summary('response_time', [0.5, 0.95, 0.99]);
   * summary.observe(0.123);
   * ```
   *
   * @since 3.0.0
   */
  summary(name: string, percentiles?: number[], labels?: Record<string, string>): Summary {
    const key = this.getMetricKey(name, labels);

    if (!this.summaries.has(key)) {
      this.summaries.set(key, new Summary(name, percentiles, labels, this));
    }

    return this.summaries.get(key)!;
  }

  /**
   * Records a metric observation.
   *
   * @param {Metric} metric - Metric observation to record
   * @returns {void}
   *
   * @description
   * Internal method called by metric instances to record observations.
   * Maintains bounded history of metric observations (last 10,000).
   *
   * @since 3.0.0
   * @internal
   */
  recordMetric(metric: Metric): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  /**
   * Gets all recorded metrics.
   *
   * @returns {Metric[]} Array of all metric observations
   *
   * @description
   * Returns copy of all recorded metric observations.
   *
   * @since 3.0.0
   */
  getMetrics(): Metric[] {
    return [...this.metrics];
  }

  /**
   * Resets all metrics to initial state.
   *
   * @returns {void}
   *
   * @description
   * Resets all counters, gauges, histograms, and summaries to zero/empty.
   * Clears all metric history. Use cautiously in production.
   *
   * @since 3.0.0
   */
  reset(): void {
    this.counters.forEach(counter => counter.reset());
    this.gauges.forEach(gauge => gauge.reset());
    this.histograms.forEach(histogram => histogram.reset());
    this.summaries.forEach(summary => summary.reset());
    this.metrics = [];
  }

  /**
   * Exports all metrics in Prometheus text format.
   *
   * @returns {string} Prometheus-formatted metrics
   *
   * @description
   * THE PROMETHEUS EXPORTER - Making Grafana happy!
   *
   * Exports all metrics in Prometheus text exposition format, ready
   * to be scraped by Prometheus server.
   *
   * **Format:**
   * ```
   * # HELP metric_name Description
   * # TYPE metric_name counter
   * metric_name{label="value"} 42 timestamp
   * ```
   *
   * @example
   * ```typescript
   * const output = collector.exportPrometheus();
   * console.log(output);
   * // # HELP requests_total Total HTTP requests
   * // # TYPE requests_total counter
   * // requests_total{method="GET"} 42
   * ```
   *
   * @since 3.0.0
   */
  exportPrometheus(): string {
    const lines: string[] = [];

    // Export counters
    for (const [key, counter] of this.counters.entries()) {
      const metric = this.counters.get(key)!;
      lines.push(`# TYPE ${metric['name']} counter`);
      lines.push(this.formatPrometheusMetric(metric['name'], counter.getValue(), metric['labels']));
    }

    // Export gauges
    for (const [key, gauge] of this.gauges.entries()) {
      const metric = this.gauges.get(key)!;
      lines.push(`# TYPE ${metric['name']} gauge`);
      lines.push(this.formatPrometheusMetric(metric['name'], gauge.getValue(), metric['labels']));
    }

    // Export histograms
    for (const [key, histogram] of this.histograms.entries()) {
      const metric = this.histograms.get(key)!;
      lines.push(`# TYPE ${metric['name']} histogram`);

      for (const [bucket, count] of histogram.getBuckets().entries()) {
        const bucketLabels = { ...metric['labels'], le: bucket.toString() };
        lines.push(this.formatPrometheusMetric(`${metric['name']}_bucket`, count, bucketLabels));
      }

      lines.push(this.formatPrometheusMetric(`${metric['name']}_sum`, histogram.getSum(), metric['labels']));
      lines.push(this.formatPrometheusMetric(`${metric['name']}_count`, histogram.getCount(), metric['labels']));
    }

    // Export summaries
    for (const [key, summary] of this.summaries.entries()) {
      const metric = this.summaries.get(key)!;
      lines.push(`# TYPE ${metric['name']} summary`);

      for (const [percentile, value] of summary.getPercentiles().entries()) {
        const quantileLabels = { ...metric['labels'], quantile: percentile.toString() };
        lines.push(this.formatPrometheusMetric(metric['name'], value, quantileLabels));
      }

      lines.push(this.formatPrometheusMetric(`${metric['name']}_sum`, summary.getSum(), metric['labels']));
      lines.push(this.formatPrometheusMetric(`${metric['name']}_count`, summary.getCount(), metric['labels']));
    }

    return lines.join('\n') + '\n';
  }

  /**
   * Exports all metrics in JSON format.
   *
   * @returns {object} JSON object containing all metrics
   *
   * @description
   * THE JSON EXPORTER - For when Prometheus is too mainstream!
   *
   * Exports all metrics in structured JSON format, useful for
   * custom dashboards, APIs, or debugging.
   *
   * @example
   * ```typescript
   * const json = collector.exportJson();
   * console.log(JSON.stringify(json, null, 2));
   * ```
   *
   * @since 3.0.0
   */
  exportJson(): object {
    return {
      counters: Array.from(this.counters.entries()).map(([key, counter]) => ({
        name: counter['name'],
        labels: counter['labels'],
        value: counter.getValue()
      })),
      gauges: Array.from(this.gauges.entries()).map(([key, gauge]) => ({
        name: gauge['name'],
        labels: gauge['labels'],
        value: gauge.getValue()
      })),
      histograms: Array.from(this.histograms.entries()).map(([key, histogram]) => ({
        name: histogram['name'],
        labels: histogram['labels'],
        buckets: Array.from(histogram.getBuckets().entries()),
        sum: histogram.getSum(),
        count: histogram.getCount(),
        average: histogram.getAverage()
      })),
      summaries: Array.from(this.summaries.entries()).map(([key, summary]) => ({
        name: summary['name'],
        labels: summary['labels'],
        percentiles: Array.from(summary.getPercentiles().entries()),
        sum: summary.getSum(),
        count: summary.getCount(),
        average: summary.getAverage()
      }))
    };
  }

  /**
   * Generates a unique key for a metric based on name and labels.
   *
   * @private
   * @param {string} name - Metric name
   * @param {Record<string, string>} [labels] - Optional labels
   * @returns {string} Unique metric key
   *
   * @description
   * THE KEY GENERATOR - Uniquely identifying metrics!
   *
   * Creates a unique identifier for a metric by combining name and labels.
   * Used for caching metric instances to ensure consistency.
   *
   * **Key Format:**
   * - Without labels: `metric_name`
   * - With labels: `metric_name{label1=value1,label2=value2}`
   *
   * **Why Cache Metrics?**
   * - Ensures same metric instance for same name+labels
   * - Prevents duplicate metric registration
   * - Maintains consistent state
   * - Reduces memory overhead
   *
   * @example
   * ```typescript
   * getMetricKey('requests', { method: 'GET' });
   * // Returns: 'requests{method=GET}'
   * ```
   *
   * @since 3.0.0
   */
  private getMetricKey(name: string, labels?: Record<string, string>): string {
    const labelStr = labels
      ? Object.entries(labels)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}="${v}"`)
          .join(',')
      : '';
    return `${name}{${labelStr}}`;
  }

  /**
   * Formats a single metric in Prometheus text format.
   *
   * @private
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   * @param {Record<string, string>} [labels] - Optional labels
   * @returns {string} Formatted Prometheus metric line
   *
   * @description
   * THE PROMETHEUS FORMATTER - Making metrics pretty!
   *
   * Formats a single metric observation in Prometheus exposition format.
   * Handles label formatting and escaping.
   *
   * **Format:**
   * - With labels: `metric_name{label1="value1",label2="value2"} 42`
   * - Without labels: `metric_name 42`
   *
   * @example
   * ```typescript
   * formatPrometheusMetric('requests_total', 42, { method: 'GET' });
   * // Returns: 'requests_total{method="GET"} 42'
   * ```
   *
   * @since 3.0.0
   */
  private formatPrometheusMetric(name: string, value: number, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return `${name} ${value}`;
    }

    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');

    return `${name}{${labelStr}} ${value}`;
  }
}

// Singleton instance
export const metricsCollector = new MetricsCollector();

// Convenience functions
export function getCounter(name: string, labels?: Record<string, string>): Counter {
  return metricsCollector.counter(name, labels);
}

export function getGauge(name: string, labels?: Record<string, string>): Gauge {
  return metricsCollector.gauge(name, labels);
}

export function getHistogram(name: string, buckets?: number[], labels?: Record<string, string>): Histogram {
  return metricsCollector.histogram(name, buckets, labels);
}

export function getSummary(name: string, percentiles?: number[], labels?: Record<string, string>): Summary {
  return metricsCollector.summary(name, percentiles, labels);
}

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary'
}

export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

export interface IMetricsCollector {
  counter(name: string, labels?: Record<string, string>): Counter;
  gauge(name: string, labels?: Record<string, string>): Gauge;
  histogram(name: string, buckets?: number[], labels?: Record<string, string>): Histogram;
  summary(name: string, percentiles?: number[], labels?: Record<string, string>): Summary;

  getMetrics(): Metric[];
  reset(): void;
  exportPrometheus(): string;
}

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

export class Histogram {
  private buckets: Map<number, number> = new Map();
  private sum: number = 0;
  private count: number = 0;

  constructor(
    private readonly name: string,
    buckets: number[] = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    private readonly labels: Record<string, string> = {},
    private readonly collector: MetricsCollector
  ) {
    buckets.forEach(bucket => this.buckets.set(bucket, 0));
  }

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

  getSum(): number {
    return this.sum;
  }

  getCount(): number {
    return this.count;
  }

  getAverage(): number {
    return this.count > 0 ? this.sum / this.count : 0;
  }

  reset(): void {
    this.buckets.forEach((_, key) => this.buckets.set(key, 0));
    this.sum = 0;
    this.count = 0;
  }
}

export class Summary {
  private observations: number[] = [];
  private readonly maxSize: number = 1000;
  private sum: number = 0;
  private count: number = 0;

  constructor(
    private readonly name: string,
    private readonly percentiles: number[] = [0.5, 0.9, 0.95, 0.99],
    private readonly labels: Record<string, string> = {},
    private readonly collector: MetricsCollector
  ) {}

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

  reset(): void {
    this.observations = [];
    this.sum = 0;
    this.count = 0;
  }
}

export class MetricsCollector implements IMetricsCollector {
  private counters: Map<string, Counter> = new Map();
  private gauges: Map<string, Gauge> = new Map();
  private histograms: Map<string, Histogram> = new Map();
  private summaries: Map<string, Summary> = new Map();
  private metrics: Metric[] = [];
  private readonly maxMetricsHistory = 10000;

  counter(name: string, labels?: Record<string, string>): Counter {
    const key = this.getMetricKey(name, labels);

    if (!this.counters.has(key)) {
      this.counters.set(key, new Counter(name, labels, this));
    }

    return this.counters.get(key)!;
  }

  gauge(name: string, labels?: Record<string, string>): Gauge {
    const key = this.getMetricKey(name, labels);

    if (!this.gauges.has(key)) {
      this.gauges.set(key, new Gauge(name, labels, this));
    }

    return this.gauges.get(key)!;
  }

  histogram(name: string, buckets?: number[], labels?: Record<string, string>): Histogram {
    const key = this.getMetricKey(name, labels);

    if (!this.histograms.has(key)) {
      this.histograms.set(key, new Histogram(name, buckets, labels, this));
    }

    return this.histograms.get(key)!;
  }

  summary(name: string, percentiles?: number[], labels?: Record<string, string>): Summary {
    const key = this.getMetricKey(name, labels);

    if (!this.summaries.has(key)) {
      this.summaries.set(key, new Summary(name, percentiles, labels, this));
    }

    return this.summaries.get(key)!;
  }

  recordMetric(metric: Metric): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  getMetrics(): Metric[] {
    return [...this.metrics];
  }

  reset(): void {
    this.counters.forEach(counter => counter.reset());
    this.gauges.forEach(gauge => gauge.reset());
    this.histograms.forEach(histogram => histogram.reset());
    this.summaries.forEach(summary => summary.reset());
    this.metrics = [];
  }

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

  private getMetricKey(name: string, labels?: Record<string, string>): string {
    const labelStr = labels
      ? Object.entries(labels)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}="${v}"`)
          .join(',')
      : '';
    return `${name}{${labelStr}}`;
  }

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

// Performance monitoring service for production
class PerformanceMonitor {
    constructor() {
        this.metrics = [];
        this.isEnabled = import.meta.env.VITE_ENVIRONMENT === 'production';
        this.batchSize = 10;
        this.flushInterval = 30000; // 30 seconds

        if (this.isEnabled) {
            this.startBatchReporting();
            this.monitorWebVitals();
        }
    }

    // Measure component render time
    measureRender(componentName, renderFn) {
        if (!this.isEnabled) return renderFn();

        const startTime = performance.now();
        const result = renderFn();
        const duration = performance.now() - startTime;

        this.recordMetric({
            type: 'render',
            component: componentName,
            duration,
            timestamp: new Date().toISOString()
        });

        return result;
    }

    // Measure API call performance
    measureApiCall(endpoint, method, promise) {
        if (!this.isEnabled) return promise;

        const startTime = performance.now();

        return promise
            .then(result => {
                const duration = performance.now() - startTime;
                this.recordMetric({
                    type: 'api_call',
                    endpoint,
                    method,
                    duration,
                    status: 'success',
                    timestamp: new Date().toISOString()
                });
                return result;
            })
            .catch(error => {
                const duration = performance.now() - startTime;
                this.recordMetric({
                    type: 'api_call',
                    endpoint,
                    method,
                    duration,
                    status: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                throw error;
            });
    }

    // Measure page load time
    measurePageLoad(pageName) {
        if (!this.isEnabled) return;

        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;

        this.recordMetric({
            type: 'page_load',
            page: pageName,
            duration: loadTime,
            timestamp: new Date().toISOString()
        });
    }

    // Measure user interaction
    measureInteraction(actionName, element) {
        if (!this.isEnabled) return;

        this.recordMetric({
            type: 'user_interaction',
            action: actionName,
            element: element?.tagName || 'unknown',
            timestamp: new Date().toISOString()
        });
    }

    // Record custom metric
    recordMetric(metric) {
        this.metrics.push(metric);

        // Flush if batch is full
        if (this.metrics.length >= this.batchSize) {
            this.flushMetrics();
        }
    }

    // Monitor Core Web Vitals
    monitorWebVitals() {
        // Largest Contentful Paint (LCP)
        this.observeMetric('largest-contentful-paint', (entry) => {
            this.recordMetric({
                type: 'web_vital',
                metric: 'LCP',
                value: entry.value,
                rating: entry.value > 4000 ? 'poor' : entry.value > 2500 ? 'needs-improvement' : 'good',
                timestamp: new Date().toISOString()
            });
        });

        // First Input Delay (FID)
        this.observeMetric('first-input', (entry) => {
            this.recordMetric({
                type: 'web_vital',
                metric: 'FID',
                value: entry.processingStart - entry.startTime,
                rating: entry.value > 300 ? 'poor' : entry.value > 100 ? 'needs-improvement' : 'good',
                timestamp: new Date().toISOString()
            });
        });

        // Cumulative Layout Shift (CLS)
        this.observeMetric('layout-shift', (entry) => {
            if (!entry.hadRecentInput) {
                this.recordMetric({
                    type: 'web_vital',
                    metric: 'CLS',
                    value: entry.value,
                    rating: entry.value > 0.25 ? 'poor' : entry.value > 0.1 ? 'needs-improvement' : 'good',
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    // Observe performance metrics
    observeMetric(entryType, callback) {
        try {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(callback);
            });
            observer.observe({ entryTypes: [entryType] });
        } catch (error) {
            console.warn(`Could not observe ${entryType}:`, error);
        }
    }

    // Start batch reporting
    startBatchReporting() {
        setInterval(() => {
            if (this.metrics.length > 0) {
                this.flushMetrics();
            }
        }, this.flushInterval);
    }

    // Flush metrics to server (implement based on your analytics service)
    flushMetrics() {
        const metricsToSend = [...this.metrics];
        this.metrics = [];

        // In production, send to your analytics service
        // For now, we'll just log to console in development
        if (import.meta.env.VITE_ENVIRONMENT === 'development') {
            console.group('Performance Metrics');
            metricsToSend.forEach(metric => {
                const color = this.getMetricColor(metric);
                console.log(`%c${metric.type}: ${JSON.stringify(metric)}`, `color: ${color}`);
            });
            console.groupEnd();
        }

        // Example: Send to analytics service
        // fetch('/api/analytics/performance', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ metrics: metricsToSend })
        // }).catch(console.error);
    }

    // Get color for metric type (for console logging)
    getMetricColor(metric) {
        switch (metric.type) {
            case 'render': return '#4CAF50';
            case 'api_call': return metric.status === 'success' ? '#2196F3' : '#F44336';
            case 'page_load': return '#FF9800';
            case 'user_interaction': return '#9C27B0';
            case 'web_vital': return metric.rating === 'good' ? '#4CAF50' :
                metric.rating === 'needs-improvement' ? '#FF9800' : '#F44336';
            default: return '#757575';
        }
    }

    // Get performance summary
    getPerformanceSummary() {
        const summary = {
            totalMetrics: this.metrics.length,
            byType: {},
            averages: {}
        };

        this.metrics.forEach(metric => {
            // Count by type
            summary.byType[metric.type] = (summary.byType[metric.type] || 0) + 1;

            // Calculate averages for duration-based metrics
            if (metric.duration) {
                if (!summary.averages[metric.type]) {
                    summary.averages[metric.type] = { total: 0, count: 0 };
                }
                summary.averages[metric.type].total += metric.duration;
                summary.averages[metric.type].count += 1;
            }
        });

        // Calculate final averages
        Object.keys(summary.averages).forEach(type => {
            const avg = summary.averages[type];
            summary.averages[type] = Math.round(avg.total / avg.count * 100) / 100;
        });

        return summary;
    }

    // Manual flush (useful for debugging)
    flush() {
        this.flushMetrics();
    }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
    const measureRender = (componentName, renderFn) =>
        performanceMonitor.measureRender(componentName, renderFn);

    const measureApiCall = (endpoint, method, promise) =>
        performanceMonitor.measureApiCall(endpoint, method, promise);

    const measureInteraction = (actionName, element) =>
        performanceMonitor.measureInteraction(actionName, element);

    const recordCustomMetric = (metric) =>
        performanceMonitor.recordMetric(metric);

    const getPerformanceSummary = () =>
        performanceMonitor.getPerformanceSummary();

    return {
        measureRender,
        measureApiCall,
        measureInteraction,
        recordCustomMetric,
        getPerformanceSummary
    };
};

// HOC for automatic component performance monitoring
export const withPerformanceMonitoring = (WrappedComponent) => {
    return (props) => {
        const { measureRender } = usePerformanceMonitor();

        return measureRender(WrappedComponent.name || 'Component', () => (
            <WrappedComponent {...props} />
        ));
    };
};

export default performanceMonitor;

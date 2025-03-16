/**
 * neuralAnalytics.js
 * Advanced analytics dashboard for ORGANIX neural interface
 */

class NeuralAnalytics {
    constructor(container, eventBus) {
        this.container = container;
        this.eventBus = eventBus;
        
        // Analytics state
        this.state = {
            activeNeurons: 0,
            connectionStrength: 0,
            processingCycles: 0,
            activityLog: [],
            networkTopology: {
                nodes: [],
                edges: []
            },
            performanceMetrics: {
                responseTime: [],
                accuracyScores: [],
                memoryUsage: []
            },
            activationPatterns: {},
            timeseriesData: []
        };
        
        // Chart configuration
        this.charts = {};
        
        // Initialize components
        this.init();
    }
    
    /**
     * Initialize analytics dashboard
     */
    init() {
        this.createDashboard();
        this.setupEventListeners();
    }
    
    /**
     * Create dashboard UI elements
     */
    createDashboard() {
        // Create dashboard container
        this.dashboardElement = document.createElement('div');
        this.dashboardElement.className = 'neural-analytics-dashboard';
        this.container.appendChild(this.dashboardElement);
        
        // Create dashboard sections
        this.createOverviewSection();
        this.createTopologySection();
        this.createPerformanceSection();
        this.createActivationSection();
        this.createTimeseriesSection();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for neural data updates
        this.eventBus.subscribe('mcp:neuralData', (data) => {
            this.updateAnalytics(data);
        });
        
        // Listen for UI events
        this.eventBus.subscribe('ui:toggleAnalytics', (visible) => {
            this.dashboardElement.style.display = visible ? 'grid' : 'none';
        });
        
        // Listen for window resize
        window.addEventListener('resize', this.resizeCharts.bind(this));
    }
    
    /**
     * Create overview section
     */
    createOverviewSection() {
        const section = document.createElement('div');
        section.className = 'analytics-section overview-section';
        
        // Title
        const title = document.createElement('h2');
        title.textContent = 'Neural Network Overview';
        section.appendChild(title);
        
        // Create metrics containers
        const metricsContainer = document.createElement('div');
        metricsContainer.className = 'metrics-container';
        
        // Active neurons metric
        const neuronsMetric = this.createMetricElement('Active Neurons', '0', 'neurons-metric');
        metricsContainer.appendChild(neuronsMetric);
        
        // Connection strength metric
        const strengthMetric = this.createMetricElement('Connection Strength', '0%', 'strength-metric');
        metricsContainer.appendChild(strengthMetric);
        
        // Processing cycles metric
        const cyclesMetric = this.createMetricElement('Processing Cycles', '0', 'cycles-metric');
        metricsContainer.appendChild(cyclesMetric);
        
        // Uncertainty metric
        const uncertaintyMetric = this.createMetricElement('Uncertainty', '0%', 'uncertainty-metric');
        metricsContainer.appendChild(uncertaintyMetric);
        
        section.appendChild(metricsContainer);
        
        // Create status chart
        const statusChartContainer = document.createElement('div');
        statusChartContainer.className = 'chart-container';
        statusChartContainer.id = 'status-chart-container';
        section.appendChild(statusChartContainer);
        
        // Add to dashboard
        this.dashboardElement.appendChild(section);
        
        // Initialize chart after adding to DOM
        this.initStatusChart();
    }
    
    /**
     * Create topology section
     */
    createTopologySection() {
        const section = document.createElement('div');
        section.className = 'analytics-section topology-section';
        
        // Title
        const title = document.createElement('h2');
        title.textContent = 'Network Topology';
        section.appendChild(title);
        
        // Network graph container
        const graphContainer = document.createElement('div');
        graphContainer.className = 'graph-container';
        graphContainer.id = 'topology-graph-container';
        section.appendChild(graphContainer);
        
        // Add to dashboard
        this.dashboardElement.appendChild(section);
        
        // Initialize graph after adding to DOM
        this.initTopologyGraph();
    }
    
    /**
     * Create performance section
     */
    createPerformanceSection() {
        const section = document.createElement('div');
        section.className = 'analytics-section performance-section';
        
        // Title
        const title = document.createElement('h2');
        title.textContent = 'Performance Metrics';
        section.appendChild(title);
        
        // Performance chart container
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.id = 'performance-chart-container';
        section.appendChild(chartContainer);
        
        // Add to dashboard
        this.dashboardElement.appendChild(section);
        
        // Initialize chart after adding to DOM
        this.initPerformanceChart();
    }
    
    /**
     * Create activation section
     */
    createActivationSection() {
        const section = document.createElement('div');
        section.className = 'analytics-section activation-section';
        
        // Title
        const title = document.createElement('h2');
        title.textContent = 'Activation Patterns';
        section.appendChild(title);
        
        // Activation heatmap container
        const heatmapContainer = document.createElement('div');
        heatmapContainer.className = 'heatmap-container';
        heatmapContainer.id = 'activation-heatmap-container';
        section.appendChild(heatmapContainer);
        
        // Add to dashboard
        this.dashboardElement.appendChild(section);
        
        // Initialize heatmap after adding to DOM
        this.initActivationHeatmap();
    }
    
    /**
     * Create timeseries section
     */
    createTimeseriesSection() {
        const section = document.createElement('div');
        section.className = 'analytics-section timeseries-section';
        
        // Title
        const title = document.createElement('h2');
        title.textContent = 'Neural Activity Timeline';
        section.appendChild(title);
        
        // Timeseries chart container
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.id = 'timeseries-chart-container';
        section.appendChild(chartContainer);
        
        // Add to dashboard
        this.dashboardElement.appendChild(section);
        
        // Initialize chart after adding to DOM
        this.initTimeseriesChart();
    }
    
    /**
     * Create a metric element
     * @param {string} label - Metric label
     * @param {string} value - Initial value
     * @param {string} id - Element ID
     * @returns {HTMLElement} - Metric element
     */
    createMetricElement(label, value, id) {
        const metricElement = document.createElement('div');
        metricElement.className = 'metric-card';
        metricElement.id = id;
        
        const labelElement = document.createElement('div');
        labelElement.className = 'metric-label';
        labelElement.textContent = label;
        
        const valueElement = document.createElement('div');
        valueElement.className = 'metric-value';
        valueElement.textContent = value;
        
        metricElement.appendChild(labelElement);
        metricElement.appendChild(valueElement);
        
        return metricElement;
    }
    
    /**
     * Initialize status chart
     */
    initStatusChart() {
        const ctx = document.createElement('canvas');
        document.getElementById('status-chart-container').appendChild(ctx);
        
        this.charts.status = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Inactive', 'Processing', 'Error'],
                datasets: [{
                    data: [25, 40, 30, 5],
                    backgroundColor: [
                        '#4cd137',
                        '#487eb0',
                        '#00a8ff',
                        '#e84118'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#f5f6fa',
                            font: {
                                family: 'Arial',
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Neural Status Distribution',
                        color: '#f5f6fa',
                        font: {
                            family: 'Arial',
                            size: 14,
                            weight: 'normal'
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Initialize network topology graph
     */
    initTopologyGraph() {
        // Set up a simple initial graph
        const nodes = [];
        const edges = [];
        
        // Create some nodes
        for (let i = 0; i < 30; i++) {
            nodes.push({
                id: i,
                label: `N${i}`,
                group: i % 4,
                size: 5 + Math.random() * 10
            });
        }
        
        // Create some edges
        for (let i = 0; i < 50; i++) {
            const source = Math.floor(Math.random() * 30);
            let target = Math.floor(Math.random() * 30);
            
            // Avoid self-loops
            while (target === source) {
                target = Math.floor(Math.random() * 30);
            }
            
            edges.push({
                from: source,
                to: target,
                value: Math.random()
            });
        }
        
        // Store in state
        this.state.networkTopology.nodes = nodes;
        this.state.networkTopology.edges = edges;
        
        // Initialize network graph
        const container = document.getElementById('topology-graph-container');
        
        // Create network data
        const data = {
            nodes: new vis.DataSet(nodes),
            edges: new vis.DataSet(edges)
        };
        
        // Network options
        const options = {
            nodes: {
                shape: 'dot',
                size: 16,
                font: {
                    size: 12,
                    color: '#ffffff'
                },
                borderWidth: 2,
                shadow: true
            },
            edges: {
                width: 2,
                color: {
                    color: 'rgba(255, 255, 255, 0.5)',
                    highlight: '#00a8ff',
                    hover: '#00a8ff'
                },
                smooth: {
                    type: 'continuous'
                }
            },
            physics: {
                stabilization: false,
                barnesHut: {
                    gravitationalConstant: -80000,
                    springConstant: 0.001,
                    springLength: 200
                }
            },
            interaction: {
                navigationButtons: true,
                keyboard: true
            }
        };
        
        // Create network
        this.charts.network = new vis.Network(container, data, options);
    }
    
    /**
     * Initialize performance chart
     */
    initPerformanceChart() {
        const ctx = document.createElement('canvas');
        document.getElementById('performance-chart-container').appendChild(ctx);
        
        // Generate initial data
        const labels = Array.from({ length: 20 }, (_, i) => i);
        const responseTimeData = Array.from({ length: 20 }, () => Math.random() * 100);
        const accuracyData = Array.from({ length: 20 }, () => Math.random() * 100);
        const memoryData = Array.from({ length: 20 }, () => Math.random() * 100);
        
        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Response Time (ms)',
                        data: responseTimeData,
                        borderColor: '#00a8ff',
                        backgroundColor: 'rgba(0, 168, 255, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Accuracy (%)',
                        data: accuracyData,
                        borderColor: '#4cd137',
                        backgroundColor: 'rgba(76, 209, 55, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Memory Usage (%)',
                        data: memoryData,
                        borderColor: '#e1b12c',
                        backgroundColor: 'rgba(225, 177, 44, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#f5f6fa'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#f5f6fa'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#f5f6fa',
                            font: {
                                family: 'Arial'
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Performance Over Time',
                        color: '#f5f6fa',
                        font: {
                            family: 'Arial',
                            size: 14,
                            weight: 'normal'
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Initialize activation heatmap
     */
    initActivationHeatmap() {
        const container = document.getElementById('activation-heatmap-container');
        
        // Create canvas element
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);
        
        // Generate random data for heatmap
        const rows = 10;
        const cols = 10;
        const data = [];
        
        for (let i = 0; i < rows; i++) {
            data[i] = [];
            for (let j = 0; j < cols; j++) {
                data[i][j] = Math.random();
            }
        }
        
        // Set up labels
        const rowLabels = Array.from({ length: rows }, (_, i) => `Layer ${i+1}`);
        const colLabels = Array.from({ length: cols }, (_, i) => `N${i+1}`);
        
        this.charts.heatmap = new Chart(canvas, {
            type: 'matrix',
            data: {
                datasets: [{
                    label: 'Activation Levels',
                    data: data,
                    borderWidth: 1,
                    borderColor: '#222',
                    backgroundColor: (context) => {
                        const value = context.dataset.data[context.dataIndex];
                        return this.getHeatmapColor(value);
                    },
                    width: ({ chart }) => (chart.chartArea.width / cols) - 2,
                    height: ({ chart }) => (chart.chartArea.height / rows) - 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'category',
                        labels: colLabels,
                        ticks: {
                            color: '#f5f6fa'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        type: 'category',
                        labels: rowLabels,
                        ticks: {
                            color: '#f5f6fa'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const index = context[0].dataIndex;
                                const i = Math.floor(index / cols);
                                const j = index % cols;
                                return `${rowLabels[i]} / ${colLabels[j]}`;
                            },
                            label: (context) => {
                                const value = context.dataset.data[context.dataIndex];
                                return `Activation: ${(value * 100).toFixed(1)}%`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Get color for heatmap based on value
     * @param {number} value - Value between 0 and 1
     * @returns {string} - Color in rgba format
     */
    getHeatmapColor(value) {
        // Color gradient from blue (low) to green (medium) to red (high)
        if (value < 0.3) {
            // Blue to cyan
            const intensity = (value / 0.3);
            return `rgba(0, ${Math.floor(255 * intensity)}, 255, 0.7)`;
        } else if (value < 0.7) {
            // Cyan to yellow
            const intensity = (value - 0.3) / 0.4;
            return `rgba(${Math.floor(255 * intensity)}, 255, ${Math.floor(255 * (1-intensity))}, 0.7)`;
        } else {
            // Yellow to red
            const intensity = (value - 0.7) / 0.3;
            return `rgba(255, ${Math.floor(255 * (1-intensity))}, 0, 0.7)`;
        }
    }
    
    /**
     * Initialize timeseries chart
     */
    initTimeseriesChart() {
        const ctx = document.createElement('canvas');
        document.getElementById('timeseries-chart-container').appendChild(ctx);
        
        // Generate initial data
        const maxDataPoints = 100;
        const timestamps = Array.from({ length: maxDataPoints }, (_, i) => i);
        const activityData = Array.from({ length: maxDataPoints }, () => Math.random() * 100);
        
        this.charts.timeseries = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timestamps,
                datasets: [{
                    label: 'Neural Activity',
                    data: activityData,
                    borderColor: '#9c88ff',
                    backgroundColor: 'rgba(156, 136, 255, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 0,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#f5f6fa',
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#f5f6fa'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#f5f6fa',
                            font: {
                                family: 'Arial'
                            }
                        }
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });
        
        // Store max data points
        this.maxTimeseriesPoints = maxDataPoints;
    }
    
    /**
     * Update analytics dashboard with new data
     * @param {Object} data - Neural data
     */
    updateAnalytics(data) {
        // Update state
        this.updateState(data);
        
        // Update metrics
        this.updateMetrics();
        
        // Update charts
        this.updateCharts();
    }
    
    /**
     * Update internal state with new data
     * @param {Object} data - Neural data
     */
    updateState(data) {
        // Update basic metrics
        if (data.neuronActivity) {
            this.state.activeNeurons = data.neuronActivity.filter(n => n.activity > 0.5).length;
        }
        
        if (data.connections) {
            this.state.connectionStrength = data.connections.reduce((sum, c) => sum + c.strength, 0) / 
                (data.connections.length || 1);
        }
        
        if (data.processingCycles) {
            this.state.processingCycles = data.processingCycles;
        }
        
        // Update timeseries data
        const timestamp = Date.now();
        this.state.timeseriesData.push({
            timestamp,
            activity: data.globalActivity || Math.random() * 100
        });
        
        // Keep only the last N points
        if (this.state.timeseriesData.length > this.maxTimeseriesPoints) {
            this.state.timeseriesData.shift();
        }
        
        // Update performance metrics if available
        if (data.performance) {
            if (data.performance.responseTime) {
                this.state.performanceMetrics.responseTime.push(data.performance.responseTime);
                if (this.state.performanceMetrics.responseTime.length > 20) {
                    this.state.performanceMetrics.responseTime.shift();
                }
            }
            
            if (data.performance.accuracy) {
                this.state.performanceMetrics.accuracyScores.push(data.performance.accuracy);
                if (this.state.performanceMetrics.accuracyScores.length > 20) {
                    this.state.performanceMetrics.accuracyScores.shift();
                }
            }
            
            if (data.performance.memoryUsage) {
                this.state.performanceMetrics.memoryUsage.push(data.performance.memoryUsage);
                if (this.state.performanceMetrics.memoryUsage.length > 20) {
                    this.state.performanceMetrics.memoryUsage.shift();
                }
            }
        }
        
        // Update activation patterns if available
        if (data.activationPatterns) {
            this.state.activationPatterns = data.activationPatterns;
        }
    }
    
    /**
     * Update metrics display
     */
    updateMetrics() {
        // Update active neurons
        const neuronsMetric = document.querySelector('#neurons-metric .metric-value');
        if (neuronsMetric) {
            neuronsMetric.textContent = this.state.activeNeurons;
        }
        
        // Update connection strength
        const strengthMetric = document.querySelector('#strength-metric .metric-value');
        if (strengthMetric) {
            strengthMetric.textContent = `${(this.state.connectionStrength * 100).toFixed(1)}%`;
        }
        
        // Update processing cycles
        const cyclesMetric = document.querySelector('#cycles-metric .metric-value');
        if (cyclesMetric) {
            cyclesMetric.textContent = this.state.processingCycles;
        }
        
        // Update uncertainty (random for demo)
        const uncertaintyMetric = document.querySelector('#uncertainty-metric .metric-value');
        if (uncertaintyMetric) {
            const uncertainty = Math.random() * 30; // Random uncertainty value
            uncertaintyMetric.textContent = `${uncertainty.toFixed(1)}%`;
        }
    }
    
    /**
     * Update all charts
     */
    updateCharts() {
        this.updateStatusChart();
        this.updateTopologyGraph();
        this.updatePerformanceChart();
        this.updateActivationHeatmap();
        this.updateTimeseriesChart();
    }
    
    /**
     * Update status chart
     */
    updateStatusChart() {
        if (!this.charts.status) return;
        
        // Random values for demo
        const active = 20 + Math.random() * 20;
        const inactive = 30 + Math.random() * 20;
        const processing = 20 + Math.random() * 20;
        const error = 5 + Math.random() * 5;
        
        this.charts.status.data.datasets[0].data = [active, inactive, processing, error];
        this.charts.status.update();
    }
    
    /**
     * Update topology graph
     */
    updateTopologyGraph() {
        if (!this.charts.network) return;
        
        // In a real implementation, we would update the network nodes and edges
        // based on new data. For the demo, we'll just randomly highlight nodes.
        
        // Randomly highlight some nodes
        const nodes = this.charts.network.body.data.nodes;
        const updatedNodes = [];
        
        for (let i = 0; i < nodes.length; i++) {
            if (Math.random() > 0.7) {
                updatedNodes.push({
                    id: i,
                    color: {
                        background: '#00a8ff',
                        border: '#ffffff',
                        highlight: {
                            background: '#00a8ff',
                            border: '#ffffff'
                        }
                    }
                });
            } else {
                updatedNodes.push({
                    id: i,
                    color: undefined // Reset to default
                });
            }
        }
        
        // Update nodes
        nodes.update(updatedNodes);
    }
    
    /**
     * Update performance chart
     */
    updatePerformanceChart() {
        if (!this.charts.performance) return;
        
        // Generate random performance data for demo
        const responseTime = 50 + Math.random() * 50;
        const accuracy = 70 + Math.random() * 30;
        const memory = 40 + Math.random() * 20;
        
        // Add data to datasets
        this.charts.performance.data.datasets[0].data.push(responseTime);
        this.charts.performance.data.datasets[1].data.push(accuracy);
        this.charts.performance.data.datasets[2].data.push(memory);
        
        // Remove old data points
        if (this.charts.performance.data.datasets[0].data.length > 20) {
            this.charts.performance.data.datasets[0].data.shift();
            this.charts.performance.data.datasets[1].data.shift();
            this.charts.performance.data.datasets[2].data.shift();
        }
        
        // Update chart
        this.charts.performance.update();
    }
    
    /**
     * Update activation heatmap
     */
    updateActivationHeatmap() {
        if (!this.charts.heatmap) return;
        
        // Generate new random data for demo
        const rows = 10;
        const cols = 10;
        const newData = [];
        
        for (let i = 0; i < rows; i++) {
            newData[i] = [];
            for (let j = 0; j < cols; j++) {
                // Generate some patterns - higher values in the middle
                const distFromCenter = Math.sqrt(
                    Math.pow((i - rows/2) / rows, 2) + 
                    Math.pow((j - cols/2) / cols, 2)
                );
                newData[i][j] = Math.max(0, Math.min(1, 1 - distFromCenter + Math.random() * 0.3));
            }
        }
        
        // Update chart data
        this.charts.heatmap.data.datasets[0].data = newData;
        this.charts.heatmap.update();
    }
    
    /**
     * Update timeseries chart
     */
    updateTimeseriesChart() {
        if (!this.charts.timeseries) return;
        
        // Get the latest timeseries data
        const timeseriesData = this.state.timeseriesData;
        
        // Update chart data
        this.charts.timeseries.data.labels = timeseriesData.map((d, i) => i);
        this.charts.timeseries.data.datasets[0].data = timeseriesData.map(d => d.activity);
        
        // Update chart
        this.charts.timeseries.update();
    }
    
    /**
     * Resize charts when window is resized
     */
    resizeCharts() {
        // Resize all charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }
    
    /**
     * Show a section of the dashboard
     * @param {string} sectionId - Section ID
     */
    showSection(sectionId) {
        // Hide all sections
        const sections = this.dashboardElement.querySelectorAll('.analytics-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show requested section
        const section = this.dashboardElement.querySelector(`.${sectionId}`);
        if (section) {
            section.style.display = 'block';
        }
    }
    
    /**
     * Show all dashboard sections
     */
    showAllSections() {
        const sections = this.dashboardElement.querySelectorAll('.analytics-section');
        sections.forEach(section => {
            section.style.display = 'block';
        });
    }
}

// Export the class
export { NeuralAnalytics };

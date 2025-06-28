export class ChartManager {
    constructor() {
        this.charts = {};
        this.loadChartJS();
    }

    async loadChartJS() {
        if (typeof window !== 'undefined' && !window.Chart) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
            document.head.appendChild(script);
            
            await new Promise((resolve) => {
                script.onload = resolve;
            });
        }
    }

    async renderPieChart(canvasId, data, title) {
        await this.loadChartJS();
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const colors = this.generateColors(data.length);
        
        const config = {
            type: 'pie',
            data: {
                labels: data.map(item => item.Color),
                datasets: [{
                    data: data.map(item => item.Quantity),
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: this.getTextColor(),
                        padding: 20
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            },
                            color: this.getTextColor()
                        }
                    },
                    tooltip: {
                        backgroundColor: this.getTooltipBackground(),
                        titleColor: this.getTextColor(),
                        bodyColor: this.getTextColor(),
                        borderColor: this.getBorderColor(),
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value.toLocaleString()} kg (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, config);
    }

    generateColors(count) {
        const baseColors = [
            '#3B82F6', // Blue
            '#10B981', // Green
            '#F59E0B', // Yellow
            '#EF4444', // Red
            '#8B5CF6', // Purple
            '#06B6D4', // Cyan
            '#F97316', // Orange
            '#84CC16', // Lime
            '#EC4899', // Pink
            '#6B7280'  // Gray
        ];

        const background = [];
        const border = [];

        for (let i = 0; i < count; i++) {
            const color = baseColors[i % baseColors.length];
            background.push(color + '80'); // Add transparency
            border.push(color);
        }

        return { background, border };
    }

    getTextColor() {
        return document.documentElement.getAttribute('data-theme') === 'dark' 
            ? '#F8FAFC' 
            : '#1E293B';
    }

    getTooltipBackground() {
        return document.documentElement.getAttribute('data-theme') === 'dark' 
            ? '#334155' 
            : '#FFFFFF';
    }

    getBorderColor() {
        return document.documentElement.getAttribute('data-theme') === 'dark' 
            ? '#475569' 
            : '#E2E8F0';
    }

    updateChartTheme() {
        Object.keys(this.charts).forEach(chartId => {
            const chart = this.charts[chartId];
            if (chart) {
                // Update colors for theme change
                chart.options.plugins.title.color = this.getTextColor();
                chart.options.plugins.legend.labels.color = this.getTextColor();
                chart.options.plugins.tooltip.backgroundColor = this.getTooltipBackground();
                chart.options.plugins.tooltip.titleColor = this.getTextColor();
                chart.options.plugins.tooltip.bodyColor = this.getTextColor();
                chart.options.plugins.tooltip.borderColor = this.getBorderColor();
                chart.update();
            }
        });
    }

    destroyChart(canvasId) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
            delete this.charts[canvasId];
        }
    }

    destroyAllCharts() {
        Object.keys(this.charts).forEach(chartId => {
            this.destroyChart(chartId);
        });
    }
}
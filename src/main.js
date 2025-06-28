import { PDFAnalyzer } from './utils/pdfAnalyzer.js';
import { ChartManager } from './utils/chartManager.js';
import { ThemeManager } from './utils/themeManager.js';
import { ToastManager } from './utils/toastManager.js';
import { ModalManager } from './utils/modalManager.js';

class ProductionAnalyzerApp {
    constructor() {
        this.pdfAnalyzer = new PDFAnalyzer();
        this.chartManager = new ChartManager();
        this.themeManager = new ThemeManager();
        this.toastManager = new ToastManager();
        this.modalManager = new ModalManager();
        
        this.currentData = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFileUpload();
        this.setupTabs();
        this.setupModals();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.themeManager.toggleTheme();
        });

        // Help button
        document.getElementById('helpBtn').addEventListener('click', () => {
            this.modalManager.openModal('helpModal');
        });

        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Browse button
        document.getElementById('browseBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        // Table toggles
        document.getElementById('toggleLantaburTable').addEventListener('click', () => {
            this.toggleTable('lantaburTable');
        });

        document.getElementById('toggleTaqwaTable').addEventListener('click', () => {
            this.toggleTable('taqwaTable');
        });

        // Copy data buttons
        document.getElementById('copyLantaburData').addEventListener('click', () => {
            this.copyDataToClipboard('lantabur');
        });

        document.getElementById('copyTaqwaData').addEventListener('click', () => {
            this.copyDataToClipboard('taqwa');
        });

        // Download chart buttons
        document.getElementById('downloadLantaburChart').addEventListener('click', () => {
            this.downloadChart('lantaburChart', 'Lantabur_Production_Chart.png');
        });

        document.getElementById('downloadTaqwaChart').addEventListener('click', () => {
            this.downloadChart('taqwaChart', 'Taqwa_Production_Chart.png');
        });
    }

    setupFileUpload() {
        const dropZone = document.getElementById('fileDropZone');
        
        // Drag and drop events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        // Click to upload
        dropZone.addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    setupModals() {
        // Close modal when clicking overlay
        document.getElementById('modalOverlay').addEventListener('click', () => {
            this.modalManager.closeModal('helpModal');
        });

        // Close modal button
        document.getElementById('modalClose').addEventListener('click', () => {
            this.modalManager.closeModal('helpModal');
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.modalManager.closeModal('helpModal');
            }
        });
    }

    async handleFileSelect(file) {
        if (!file) return;

        if (file.type !== 'application/pdf') {
            this.toastManager.showToast('Please select a PDF file', 'error');
            return;
        }

        this.showProgress();
        this.toastManager.showToast('Analyzing PDF file... This may take a moment.', 'info');
        
        try {
            console.log('=== STARTING PDF ANALYSIS ===');
            console.log('File name:', file.name);
            console.log('File size:', file.size, 'bytes');
            console.log('File type:', file.type);
            
            const data = await this.pdfAnalyzer.extractDataFromPDF(file);
            
            if (data && data.lantaburTotal > 0 && data.taqwaTotal > 0) {
                this.currentData = data;
                this.displayResults(data);
                
                // Check if we got real data or sample data
                if (data.lantaburTotal === 18353 && data.taqwaTotal === 22040) {
                    this.toastManager.showToast('Could not extract data from PDF. Showing sample data for demonstration.', 'warning');
                } else {
                    this.toastManager.showToast('PDF data extracted successfully!', 'success');
                }
                
                console.log('=== FINAL EXTRACTED DATA ===');
                console.log('Lantabur Total:', data.lantaburTotal);
                console.log('Taqwa Total:', data.taqwaTotal);
                console.log('Lantabur Data:', data.lantaburData);
                console.log('Taqwa Data:', data.taqwaData);
            } else {
                throw new Error('No valid data extracted');
            }
        } catch (error) {
            console.error('=== PDF ANALYSIS FAILED ===');
            console.error('Error details:', error);
            
            this.toastManager.showToast('Error analyzing PDF. Showing sample data for demonstration.', 'error');
            
            // Show sample data as fallback
            const sampleData = this.pdfAnalyzer.getSampleData();
            this.currentData = sampleData;
            this.displayResults(sampleData);
        } finally {
            this.hideProgress();
        }
    }

    showProgress() {
        document.getElementById('uploadProgress').classList.remove('hidden');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 90) progress = 90;
            
            document.getElementById('progressFill').style.width = `${progress}%`;
            
            if (progress >= 90) {
                clearInterval(interval);
            }
        }, 300);

        this.progressInterval = interval;
    }

    hideProgress() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        
        document.getElementById('progressFill').style.width = '100%';
        
        setTimeout(() => {
            document.getElementById('uploadProgress').classList.add('hidden');
            document.getElementById('progressFill').style.width = '0%';
        }, 500);
    }

    displayResults(data) {
        // Show results section
        document.getElementById('resultsSection').classList.remove('hidden');

        // Update totals with animation
        this.animateValue('lantaburTotal', 0, data.lantaburTotal, 1000, ' kg');
        this.animateValue('taqwaTotal', 0, data.taqwaTotal, 1000, ' kg');

        // Render charts
        this.chartManager.renderPieChart('lantaburChart', data.lantaburData, 'Lantabur Production');
        this.chartManager.renderPieChart('taqwaChart', data.taqwaData, 'Taqwa Production');

        // Render tables
        this.renderTable('lantaburTableBody', data.lantaburData);
        this.renderTable('taqwaTableBody', data.taqwaData);
    }

    animateValue(elementId, start, end, duration, suffix = '') {
        const element = document.getElementById(elementId);
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString() + suffix;
        }, 16);
    }

    renderTable(tableBodyId, data) {
        const tbody = document.getElementById(tableBodyId);
        tbody.innerHTML = data.map(row => `
            <tr>
                <td>${row.Color}</td>
                <td>${row.Quantity.toLocaleString()} kg</td>
                <td>${row.Percentage.toFixed(2)}%</td>
            </tr>
        `).join('');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Content`).classList.add('active');
    }

    toggleTable(tableId) {
        const table = document.getElementById(tableId);
        table.classList.toggle('hidden');
    }

    copyDataToClipboard(industry) {
        if (!this.currentData) return;

        const data = industry === 'lantabur' ? this.currentData.lantaburData : this.currentData.taqwaData;
        const total = industry === 'lantabur' ? this.currentData.lantaburTotal : this.currentData.taqwaTotal;
        
        const date = new Date().toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });

        let clipboardData = `Date: ${date}\n`;
        clipboardData += `${industry.charAt(0).toUpperCase() + industry.slice(1)} total production = ${total.toLocaleString()}kg\n`;
        clipboardData += `╰─>${industry.charAt(0).toUpperCase() + industry.slice(1)} Data:\nLoading cap:\n`;

        data.forEach(row => {
            clipboardData += `${row.Color}: ${row.Quantity.toLocaleString()}kg (${row.Percentage.toFixed(2)}%)\n`;
        });

        clipboardData += `\nLAB RFT: \nTotal this month: \nAvg/day:\n`;

        navigator.clipboard.writeText(clipboardData).then(() => {
            this.toastManager.showToast('Data copied to clipboard!', 'success');
        }).catch(() => {
            this.toastManager.showToast('Failed to copy data', 'error');
        });
    }

    downloadChart(chartId, filename) {
        const canvas = document.getElementById(chartId);
        if (canvas) {
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
            this.toastManager.showToast('Chart downloaded successfully!', 'success');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductionAnalyzerApp();
});
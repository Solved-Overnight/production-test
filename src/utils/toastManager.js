export class ToastManager {
    constructor() {
        this.toastContainer = document.getElementById('toastContainer');
        this.toasts = [];
    }

    showToast(message, type = 'info', duration = 4000) {
        const toast = this.createToast(message, type);
        this.toastContainer.appendChild(toast);
        this.toasts.push(toast);

        // Trigger animation
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);

        // Auto remove
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);

        // Manual close on click
        toast.addEventListener('click', () => {
            this.removeToast(toast);
        });
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        toast.style.transition = 'all 0.3s ease';

        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
        `;

        return toast;
    }

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    removeToast(toast) {
        if (!toast || !toast.parentNode) return;

        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    clearAllToasts() {
        this.toasts.forEach(toast => {
            this.removeToast(toast);
        });
    }
}
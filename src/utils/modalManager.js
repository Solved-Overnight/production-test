export class ModalManager {
    constructor() {
        this.activeModals = new Set();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.size > 0) {
                const lastModal = Array.from(this.activeModals).pop();
                this.closeModal(lastModal);
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('hidden');
        this.activeModals.add(modalId);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus trap
        this.trapFocus(modal);
        
        // Animation
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.style.opacity = '0';
        
        setTimeout(() => {
            modal.classList.add('hidden');
            this.activeModals.delete(modalId);
            
            // Restore body scroll if no modals are open
            if (this.activeModals.size === 0) {
                document.body.style.overflow = '';
            }
        }, 300);
    }

    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        modal.addEventListener('keydown', handleTabKey);
        
        // Focus first element
        if (firstElement) {
            firstElement.focus();
        }
    }

    isModalOpen(modalId) {
        return this.activeModals.has(modalId);
    }

    closeAllModals() {
        this.activeModals.forEach(modalId => {
            this.closeModal(modalId);
        });
    }
}
/**
 * @file src/js/components/modals/ModalManager.js
 * Manages modal dialogs for the application
 */

/**
 * @typedef {import('../../types/Types').ModalConfig} ModalConfig
 */

export class ModalManager {
    constructor() {
        this.initialize();
    }

    /**
     * Initialize modal manager
     * @private
     */
    initialize() {
        // Create modal container if it doesn't exist
        if (!document.getElementById('modalContainer')) {
            const container = document.createElement('div');
            container.id = 'modalContainer';
            document.body.appendChild(container);
        }
    }

    /**
     * Show a success modal
     * @param {ModalConfig} config
     */
    showSuccess({ sTitle, sContent }) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div class="flex items-center mb-4">
                    <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <span class="text-green-500 text-xl">✓</span>
                    </div>
                    <h2 class="text-xl font-bold text-green-700">${sTitle}</h2>
                </div>
                <div class="mb-6 text-gray-600">${sContent}</div>
                <div class="flex justify-end">
                    <button class="close px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded transition-colors">
                        OK
                    </button>
                </div>
            </div>
        `;

        const handleClose = () => modal.remove();
        modal.querySelector('.close').addEventListener('click', handleClose);

        document.getElementById('modalContainer').appendChild(modal);
        
        // Auto close after 3 seconds
        setTimeout(handleClose, 3000);
    }

    /**
     * Show an error modal
     * @param {ModalConfig} config
     */
    showError({ sTitle, sContent }) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div class="flex items-center mb-4">
                    <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                        <span class="text-red-500 text-xl">!</span>
                    </div>
                    <h2 class="text-xl font-bold text-red-700">${sTitle}</h2>
                </div>
                <div class="mb-6 text-gray-600">${sContent}</div>
                <div class="flex justify-end">
                    <button class="close px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded transition-colors">
                        Close
                    </button>
                </div>
            </div>
        `;

        const handleClose = () => modal.remove();
        modal.querySelector('.close').addEventListener('click', handleClose);

        document.getElementById('modalContainer').appendChild(modal);
    }

    /**
     * Show a confirmation modal
     * @param {ModalConfig} config 
     * @returns {Promise<boolean>}
     */
    async showConfirmation({ sTitle, sContent }) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h2 class="text-xl font-bold mb-4">${sTitle}</h2>
                    <div class="mb-6">${sContent}</div>
                    <div class="flex justify-end gap-4">
                        <button class="cancel px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                            Cancel
                        </button>
                        <button class="confirm px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors">
                            Confirm
                        </button>
                    </div>
                </div>
            `;

            const handleConfirm = () => {
                modal.remove();
                resolve(true);
            };

            const handleCancel = () => {
                modal.remove();
                resolve(false);
            };

            modal.querySelector('.confirm').addEventListener('click', handleConfirm);
            modal.querySelector('.cancel').addEventListener('click', handleCancel);

            document.getElementById('modalContainer').appendChild(modal);
        });
    }

    /**
     * Show an information modal
     * @param {ModalConfig} config
     */
    showInfo({ sTitle, sContent }) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h2 class="text-xl font-bold mb-4">${sTitle}</h2>
                <div class="mb-6">${sContent}</div>
                <div class="flex justify-end">
                    <button class="close px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors">
                        Close
                    </button>
                </div>
            </div>
        `;

        const handleClose = () => modal.remove();
        modal.querySelector('.close').addEventListener('click', handleClose);

        document.getElementById('modalContainer').appendChild(modal);
    }
}
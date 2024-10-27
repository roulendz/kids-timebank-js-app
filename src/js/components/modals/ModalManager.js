/**
 * @file src/js/components/modals/ModalManager.js
 * Manages modal dialogs for the application
 */

import { ModalConfig } from '../../types/Types.js';

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
                        <button class="cancel px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                            Cancel
                        </button>
                        <button class="confirm px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded">
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
                    <button class="close px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded">
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
import { Constants } from '../utils/Constants.js';

/**
 * Wallet button component for each user
 */
export class WalletButton {
    /**
     * @param {User} obUser - User data
     * @param {Function} fnOnClick - Callback function to handle navigation
     */
    constructor(obUser, fnOnClick) {
        this.obUser = obUser;
        this.walletUrl = `${Constants.ROUTES.CHILDREN_WALLET}/${obUser.sId}`;
        this.fnOnClick = fnOnClick;
        this.element = this.createButton();
    }

    /**
     * Create button element
     * @private
     * @returns {HTMLElement}
     */
    createButton() {
        // Use a `div` instead of `button` to avoid form submission behavior
        const elButton = document.createElement('div');
        elButton.className = `
            w-64 h-64 
            rounded-full 
            flex flex-col items-center justify-center 
            text-center p-6 
            transform transition-transform hover:scale-105
            shadow-lg
            bg-purple-100 hover:bg-purple-200
            m-4
            cursor-pointer
        `;

        const elTitle = document.createElement('div');
        elTitle.className = 'text-2xl font-bold mb-2';
        elTitle.textContent = 'My Time Wallet';

        const elName = document.createElement('div');
        elName.className = 'text-xl';
        elName.textContent = this.obUser.sNickname || this.obUser.sName;

        const elBalance = document.createElement('div');
        elBalance.className = 'text-lg mt-2';
        elBalance.textContent = this.formatTime(this.obUser.nTimeBalance);

        elButton.appendChild(elTitle);
        elButton.appendChild(elName);
        elButton.appendChild(elBalance);

        // Use callback to handle click and navigation in `app.js`
        elButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.fnOnClick) {
                this.fnOnClick(this.obUser.sId);
            }
        });

        return elButton;
    }

    /**
     * Format time in seconds to readable string
     * @private
     * @param {number} nSeconds
     * @returns {string}
     */
    formatTime(nSeconds) {
        const nHours = Math.floor(nSeconds / 3600);
        const nMinutes = Math.floor((nSeconds % 3600) / 60);
        return `${nHours}h ${nMinutes}m`;
    }
}

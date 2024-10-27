/**
 * Creates a time wallet button for a user
 */
export class WalletButton {
    /**
     * @param {User} obUser - User data
     * @param {Function} fnOnClick - Click handler
     */
    constructor(obUser, fnOnClick) {
        this.obUser = obUser;
        this.fnOnClick = fnOnClick;
        this.element = this.createButton();
    }

    /**
     * Create button element
     * @private
     * @returns {HTMLElement}
     */
    createButton() {
        const elButton = document.createElement('button');
        elButton.className = `
            w-64 h-64 
            rounded-full 
            flex flex-col items-center justify-center 
            text-center p-6 
            transform transition-transform hover:scale-105
            shadow-lg
            bg-purple-100 hover:bg-purple-200
            m-4
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

        elButton.addEventListener('click', () => this.fnOnClick(this.obUser.sId));

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
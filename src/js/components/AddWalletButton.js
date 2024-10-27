/**
 * Creates an "Add Wallet" button
 */
export class AddWalletButton {
    /**
     * @param {Function} fnOnClick - Click handler
     */
    constructor(fnOnClick) {
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
            flex items-center justify-center 
            text-6xl font-light
            transform transition-transform hover:scale-105
            shadow-lg
            bg-green-100 hover:bg-green-200
            m-4
        `;
        
        elButton.textContent = '+';
        elButton.addEventListener('click', this.fnOnClick);
        
        return elButton;
    }
}
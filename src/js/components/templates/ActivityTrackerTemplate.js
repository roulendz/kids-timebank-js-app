/**
 * @file ActivityTrackerTemplate.js
 * Defines the layout template for the activity tracking page
 */

export class ActivityTrackerTemplate {
    /**
     * Creates the activity tracker page layout
     * @returns {HTMLElement} The main container element
     */
    createLayout() {
        const container = document.createElement('div');
        container.className = 'grid grid-cols-2 grid-rows-2 gap-4 h-screen p-4';

        // Left column content - Today's Activity Tracking
        const leftColumn = this._createLeftColumn();
        container.appendChild(leftColumn);

        // Right column content - Wallets Overview
        const rightColumn = this._createRightColumn();
        container.appendChild(rightColumn);

        return container;
    }

    /**
     * Creates the left column with activity tracking
     * @returns {HTMLElement}
     * @private
     */
    _createLeftColumn() {
        const leftColumn = document.createElement('div');
        leftColumn.className = 'col-span-1 row-span-2 flex flex-col gap-4';

        // Activity Tracker Section
        const trackerSection = document.createElement('div');
        trackerSection.className = 'flex-1 bg-white rounded-lg shadow-lg p-6';
        trackerSection.innerHTML = `
            <div id="activityTracker" class="h-full flex flex-col gap-4">
                <div id="startButtonContainer" class="flex-1 flex items-center justify-center">
                    <button id="startTracking" class="w-64 h-64 bg-green-500 hover:bg-green-600 text-white rounded-3xl shadow-lg transform transition-all duration-300 flex flex-col items-center justify-center">
                        <span class="text-4xl font-bold mb-2">START</span>
                        <span class="text-sm">DEPOSITING ACTIVITY TIME</span>
                    </button>
                </div>
                <div id="timerContainer" class="flex-1 hidden flex-col items-center justify-center">
                    <div id="timer" class="text-6xl font-bold mb-4">00:00:00</div>
                    <button id="stopTracking" class="w-48 h-48 bg-red-500 hover:bg-red-600 text-white rounded-3xl shadow-lg flex flex-col items-center justify-center">
                        <span class="text-2xl font-bold mb-2">STOP</span>
                        <span class="text-sm text-center">ACTIVITY AND<br>DEPOSIT TO MY BANK</span>
                    </button>
                </div>
            </div>
        `;

        // Activities List Section
        const activitiesSection = document.createElement('div');
        activitiesSection.className = 'flex-1 bg-white rounded-lg shadow-lg p-6';
        activitiesSection.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Today's Activities</h2>
            </div>
            <div id="activitiesList" class="h-[calc(100%-2rem)] overflow-y-auto">
                <!-- Activities will be inserted here dynamically -->
            </div>
        `;

        leftColumn.appendChild(trackerSection);
        leftColumn.appendChild(activitiesSection);
        return leftColumn;
    }

    /**
     * Creates the right column with wallet information
     * @returns {HTMLElement}
     * @private
     */
    _createRightColumn() {
        const rightColumn = document.createElement('div');
        rightColumn.className = 'col-span-1 row-span-2 flex flex-col gap-4';

        // Today's Wallet Section
        const todayWallet = document.createElement('div');
        todayWallet.className = 'flex-1 bg-white rounded-lg shadow-lg p-6';
        todayWallet.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Today's Wallet</h2>
                <div id="todayTotal" class="text-2xl font-bold">00:00:00</div>
            </div>
            <div id="todayWalletContent" class="h-[calc(100%-3rem)] overflow-y-auto">
                <!-- Today's wallet content will be inserted here -->
            </div>
        `;

        // Holiday Wallet Section
        const holidayWallet = document.createElement('div');
        holidayWallet.className = 'flex-1 bg-white rounded-lg shadow-lg p-6';
        holidayWallet.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Holiday Wallet</h2>
                <div class="flex items-center gap-2">
                    <span id="holidayTotal" class="text-2xl font-bold">00:00:00</span>
                    <button id="holidayInfo" class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        i
                    </button>
                </div>
            </div>
            <div id="holidayWalletContent" class="h-[calc(100%-3rem)] overflow-y-auto">
                <!-- Holiday wallet content will be inserted here -->
            </div>
        `;

        rightColumn.appendChild(todayWallet);
        rightColumn.appendChild(holidayWallet);
        return rightColumn;
    }
}
/**
 * @file src/js/services/StateManager.js
 * Service for managing application state
 */

import { Constants, INITIAL_STATE } from '../utils/Constants.js';
import { generateId } from '../utils/IdUtils.js';

/**
 * @typedef {import('../types/Types').User} User
 * @typedef {import('../types/Types').Schedule} Schedule
 * @typedef {import('../types/Types').ID} ID
 */

/**
 * Manages application state and persistence
 */
export class StateManager {  // Keep uppercase S here as it's the class definition
    /**
     * Initialize state manager
     * @private
     */
    constructor() {
        if (StateManager.instance) {  // Keep uppercase S for class reference
            return StateManager.instance;  // Keep uppercase S for class reference
        }
        
        this.loadState();
        this.ensureDefaultUser();
        
        StateManager.instance = this;  // Keep uppercase S for class reference
    }

    /**
     * Load state from localStorage
     * @private
     */
    loadState() {
        const sStoredState = localStorage.getItem(Constants.LOCAL_STORAGE_KEY);
        this.obState = sStoredState ? JSON.parse(sStoredState) : INITIAL_STATE;
    }

    /**
     * Ensure default user exists
     * @private
     */
    ensureDefaultUser() {
        if (!this.obState.arUsers.length || 
            !this.obState.arUsers.some(user => user.sId === Constants.DEFAULT_USER.sId)) {
            this.obState.arUsers = [Constants.DEFAULT_USER, ...this.obState.arUsers];
            this.saveState();
        }
    }

    /**
     * Save current state to localStorage
     * @private
     */
    saveState() {
        localStorage.setItem(Constants.LOCAL_STORAGE_KEY, JSON.stringify(this.obState));
    }

    /**
     * Get all users
     * @returns {User[]}
     */
    getUsers() {
        return this.obState.arUsers;
    }

    /**
     * Get user by ID
     * @param {ID} sId - User ID
     * @returns {User|undefined}
     */
    getUser(sId) {
        return this.obState.arUsers.find(user => user.sId === sId);
    }

    /**
     * Add new user
     * @param {string} sName - User's name
     * @param {string} sNickname - User's nickname
     * @param {Schedule[]} arSchedule - Weekly schedule
     * @returns {ID} New user's ID
     */
    addUser(sName, sNickname, arSchedule = []) {
        const obNewUser = {
            sId: generateId(),
            sName,
            sNickname,
            nTimeBalance: 0,
            arSchedule
        };
        
        this.obState.arUsers.push(obNewUser);
        this.saveState();
        return obNewUser.sId;
    }

    /**
     * Update existing user
     * @param {User} obUserData - Updated user data
     * @returns {boolean} Success status
     */
    updateUser(obUserData) {
        const iIndex = this.obState.arUsers.findIndex(user => user.sId === obUserData.sId);
        if (iIndex !== -1) {
            // Preserve the time balance when updating
            const nCurrentBalance = this.obState.arUsers[iIndex].nTimeBalance;
            this.obState.arUsers[iIndex] = {
                ...obUserData,
                nTimeBalance: nCurrentBalance
            };
            this.saveState();
            return true;
        }
        return false;
    }

    /**
     * Delete user
     * @param {ID} sId - User ID to delete
     * @returns {boolean} Success status
     */
    deleteUser(sId) {
        // Prevent deletion of default user
        if (sId === Constants.DEFAULT_USER.sId) {
            return false;
        }

        const iInitialLength = this.obState.arUsers.length;
        this.obState.arUsers = this.obState.arUsers.filter(user => user.sId !== sId);
        
        if (this.obState.arUsers.length !== iInitialLength) {
            this.saveState();
            return true;
        }
        return false;
    }
}

export const stateManager = new StateManager();
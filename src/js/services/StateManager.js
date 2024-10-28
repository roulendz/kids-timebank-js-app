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
export class StateManager {
    constructor() {
        if (StateManager.instance) {
            return StateManager.instance;
        }

        this.obState = null; // Initialize state as null until loaded
        StateManager.instance = this;
        this.init();
    }

    async init() {
        await this.loadState();
        this.ensureDefaultUser();
    }

    async loadState() {
        const sStoredState = localStorage.getItem(Constants.LOCAL_STORAGE_KEY);
        this.obState = sStoredState ? JSON.parse(sStoredState) : INITIAL_STATE;
    }

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
     * Add a new activity for the current user
     * @param {Activity} activity - Activity data to add
     */
    async addActivity(activity) {
        const user = this.getUser(activity.sUserId);
        if (user) {
            if (!user.arActivityLog) {
                user.arActivityLog = [];
            }
            user.arActivityLog.push(activity);
            this.saveState();
        } else {
            throw new Error(`User with ID ${activity.sUserId} not found`);
        }
    }

    /**
     * Add a new deposit for the current user
     * @param {TimeDeposit} deposit - Deposit data to add
     */
    async addDeposit(deposit) {
        const user = this.getUser(deposit.sUserId);
        if (user) {
            if (!user.arDeposits) {
                user.arDeposits = [];
            }
            user.arDeposits.push(deposit);
            this.saveState();
        } else {
            throw new Error(`User with ID ${deposit.sUserId} not found`);
        }
    }

    /**
     * Get activities for a given user
     * @param {string} userId - ID of the user
     * @returns {Promise<Activity[]>} - Array of activities
     */
    async getActivities(userId) {
        const user = this.getUser(userId);
        return user && user.arActivityLog ? user.arActivityLog : [];
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
     * Set the current user ID
     * @param {string} sUserId - User ID to set as the current user
     */
    setCurrentUserId(sUserId) {
        this.obState.sCurrentUserId = sUserId;
        this.saveState();
    }

    /**
     * Get the current user ID
     * @returns {string|null} - Current user ID or null if not set
     */
    getCurrentUserId() {
        return this.obState.sCurrentUserId || null;
    }

    /**
     * Get user settings by user ID
     * @param {string} userId - The user ID to get settings for
     * @returns {Promise<UserSettings|null>} - User settings object or null if not found
     */
    async getUserSettings(userId) {
        const user = this.getUser(userId);
        return user ? user : null;
    }

    /**
     * Get deposits for a given user
     * @param {string} userId - ID of the user
     * @returns {Promise<TimeDeposit[]>} - Array of time deposits
     */
    async getDeposits(userId) {
        const user = this.getUser(userId);
        if (user && user.arDeposits) {
            return user.arDeposits;
        }
        return [];
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

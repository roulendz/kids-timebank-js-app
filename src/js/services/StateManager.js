/**
 * @file src/js/services/StateManager.js
 * Service for managing application state
 */

import { Constants, INITIAL_STATE, DEFAULT_USER_SETTINGS } from '../utils/Constants.js';
import { generateId } from '../utils/IdUtils.js';
/**
 * @typedef {import('../types/Types').User} User
 * @typedef {import('../types/Types').Schedule} Schedule
 * @typedef {import('../types/Types').ID} ID
 * @typedef {import('../types/Types').TimeTrackingState} TimeTrackingState
 * @typedef {import('../types/Types').Activity} Activity
 * @typedef {import('../types/Types').TimeDeposit} TimeDeposit
 * @typedef {import('../types/Types').UserSettings} UserSettings
 * @typedef {Object} State
 * @property {User[]} arUsers
 * @property {string|null} sCurrentUserId
 * @property {TimeTrackingState|null} obTrackingState
 */

/**
 * Manages application state and persistence
 * @class
 */
export class StateManager {
    /** @type {StateManager|null} */
    static #instance = null;

    /** @type {State|null} */
    #obState = null;

    constructor() {
        if (StateManager.#instance) {
            return StateManager.#instance;
        }

        StateManager.#instance = this;
        this.init();
    }

    async init() {
        await this.loadState();
        this.ensureDefaultUser();
        this.ensureUsersState();
    }

    /**
     * Gets the singleton instance of StateManager
     * @returns {StateManager}
     */
    static getInstance() {
        if (!StateManager.#instance) {
            StateManager.#instance = new StateManager();
        }
        return StateManager.#instance;
    }

    async loadState() {
        const sStoredState = localStorage.getItem(Constants.LOCAL_STORAGE_KEY);
        this.obState = sStoredState ? JSON.parse(sStoredState) : {
            ...INITIAL_STATE,
            obTrackingState: null
        };
    }

    /**
     * Get the current tracking state
     * @returns {Promise<TimeTrackingState|null>}
     */
    async getTrackingState() {
        return this.obState.obTrackingState || null;
    }

    /**
     * Save the current tracking state
     * @param {TimeTrackingState} state
     * @returns {Promise<void>}
     */
    async saveTrackingState(state) {
        this.obState.obTrackingState = state;
        this.saveState();
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
     * Update an existing activity, e.g., mark as deposited
     * @param {Activity} obActivity - Updated activity data
     * @returns {Promise<void>}
     */
    async updateActivity(obActivity) {
        const obUser = this.getUser(obActivity.sUserId);
        if (obUser) {
            const iIndex = obUser.arActivityLog.findIndex(a => a.sId === obActivity.sId);
            if (iIndex !== -1) {
                obUser.arActivityLog[iIndex] = obActivity;
                this.saveState();
            }
        } else {
            throw new Error(`User with ID ${obActivity.sUserId} not found`);
        }
    }

    /**
     * Check if an activity is eligible for deposit
     * @param {string} sUserId - User ID
     * @param {string} sActivityId - Activity ID to check
     * @returns {boolean} True if eligible, false otherwise
     */
    isEligibleForDeposit(sUserId, sActivityId) {
        const obUser = this.getUser(sUserId);
        if (!obUser) return false;

        // Locate the specific activity by ID
        const obActivity = obUser.arActivityLog.find(a => a.sId === sActivityId);
        
        // Check if activity exists and has time left for deposit
        if (obActivity) {
            const nRemainingTime = obActivity.nDuration - (obActivity.nUsedDuration || 0);
            return nRemainingTime > 0;
        }

        return false;  // Activity not found or no time left for deposit
    }



    /**
     * Add a new deposit for the current user if eligible
     * @param {TimeDeposit} obDeposit - Deposit data to add
     */
    async addDeposit(obDeposit) {
        const obUser = this.getUser(obDeposit.sUserId);
        if (!obUser) {
            throw new Error(`User with ID ${obDeposit.sUserId} not found`);
        }

        if (!obUser.arDeposits) {
            obUser.arDeposits = [];
        }
        
        obUser.arDeposits.push(obDeposit);
        this.saveState();
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
     * @param {string} sUserId - The user ID to get settings for
     * @returns {Promise<UserSettings>} - User settings object
     */
    async getUserSettings(sUserId) {
        const obUser = this.getUser(sUserId);
        if (!obUser) {
            throw new Error(`User with ID ${sUserId} not found`);
        }

        this.ensureUserSettings(obUser);
        return obUser.obSettings;
    }

    /**
     * Update user settings
     * @param {string} sUserId - User ID
     * @param {Partial<UserSettings>} obNewSettings - Settings to update
     * @returns {Promise<void>}
     */
    async updateUserSettings(sUserId, obNewSettings) {
        const obUser = this.getUser(sUserId);
        if (!obUser) {
            throw new Error(`User with ID ${sUserId} not found`);
        }

        this.ensureUserSettings(obUser);
        obUser.obSettings = {
            ...obUser.obSettings,
            ...obNewSettings
        };
        
        this.saveState();
    }

    /**
     * Initialize default state for user if missing
     * @param {User} obUser - User to initialize
     * @private
     */
    initializeUserState(obUser) {
        if (!obUser.arActivityLog) obUser.arActivityLog = [];
        if (!obUser.arDeposits) obUser.arDeposits = [];
        if (!obUser.obSettings) obUser.obSettings = { ...DEFAULT_USER_SETTINGS };
    }

    /**
     * Ensure all users have required state
     * @private
     */
    ensureUsersState() {
        this.obState.arUsers.forEach(user => {
            this.initializeUserState(user);
        });
        this.saveState();
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
            arSchedule,
            arActivityLog: [],
            arDeposits: [],
            obSettings: { ...DEFAULT_USER_SETTINGS } // Clone default settings
        };
        
        this.obState.arUsers.push(obNewUser);
        this.saveState();
        return obNewUser.sId;
    }

    /**
     * Ensure user has default settings
     * @param {User} obUser - User to check
     * @private
     */
    ensureUserSettings(obUser) {
        if (!obUser.obSettings) {
            obUser.obSettings = { ...DEFAULT_USER_SETTINGS };
            this.saveState();
        }
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

// Export a singleton instance
export const stateManager = StateManager.getInstance();

import { Constants, INITIAL_STATE } from '../utils/Constants.js';

/**
 * Manages application state and persistence
 */
class StateManager {
    constructor() {
        this.loadState();
        this.ensureDefaultUser();
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
     * Add new user
     * @param {string} sName - User's name
     * @param {string} sNickname - User's nickname
     * @returns {string} New user's ID
     */
    addUser(sName, sNickname) {
        const obNewUser = {
            sId: crypto.randomUUID(),
            sName,
            sNickname,
            nTimeBalance: 0,
            arSchedule: []
        };
        
        this.obState.arUsers.push(obNewUser);
        this.saveState();
        return obNewUser.sId;
    }
}

export const stateManager = new StateManager();
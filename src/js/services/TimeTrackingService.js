/**
 * @typedef {import('../types/Types').TimeTrackingState} TimeTrackingState
 * @typedef {import('../types/Types').Activity} Activity
 */

import { generateId } from '../utils/IdUtils.js';
import { stateManager } from './StateManager.js';

/**
 * Service for handling time tracking functionality
 */
export class TimeTrackingService {
    /**
     * @param {string} sUserId - Current user ID
     */
    constructor(sUserId) {
        /** @type {TimeTrackingState} */
        this.obState = {
            bIsTracking: false,
            nStartTime: null,
            sCurrentActivityDescription: ''
        };
        
        this.sUserId = sUserId;
    }

    /**
     * Start tracking time for new activity
     * @returns {void}
     */
    startTracking() {
        this.obState = {
            ...this.obState,
            bIsTracking: true,
            nStartTime: Date.now(),
            sCurrentActivityDescription: ''
        };
    }

    /**
     * Stop tracking and save activity
     * @param {string} sDescription - Activity description
     * @returns {Activity}
     */
    stopTracking(sDescription) {
        const nEndTime = Date.now();
        
        /** @type {Activity} */
        const obActivity = {
            sId: generateId(),
            sType: 'work',
            sDescription,
            nStartTime: this.obState.nStartTime,
            nEndTime,
            nDuration: nEndTime - this.obState.nStartTime,
            sUserId: this.sUserId
        };

        this.obState = {
            bIsTracking: false,
            nStartTime: null,
            sCurrentActivityDescription: ''
        };

        return obActivity;
    }

    /**
     * Get current tracking duration
     * @returns {number} Duration in milliseconds
     */
    getCurrentDuration() {
        if (!this.obState.bIsTracking || !this.obState.nStartTime) {
            return 0;
        }
        return Date.now() - this.obState.nStartTime;
    }

    /**
     * Check if currently tracking
     * @returns {boolean}
     */
    isTracking() {
        return this.obState.bIsTracking;
    }
}
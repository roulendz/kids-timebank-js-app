/**
 * @file src/js/services/TimeTrackingService.js
 * Service for handling time tracking and usage functionality
 */

/**
 * @typedef {import('../types/Types').TimeTrackingState} TimeTrackingState
 * @typedef {import('../types/Types').Activity} Activity
 */

import { generateId } from '../utils/IdUtils.js';
import { stateManager } from './StateManager.js';

/**
 * Service for handling time tracking and usage functionality
 */
export class TimeTrackingService {
    /**
     * @param {string} sUserId - Current user ID
     */
    constructor(sUserId) {
        /** @type {TimeTrackingState} */
        this.obState = {
            bIsTracking: false,
            bIsUsingTime: false,
            nStartTime: null,
            nUsageStartTime: null,
            sCurrentActivityDescription: '',
            sCurrentUsageActivityId: null
        };
        
        this.sUserId = sUserId;
    }

    /**
     * Start tracking time for new activity
     * @returns {void}
     */
    startTracking() {
        if (this.obState.bIsUsingTime) return; // Prevent tracking while using time

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
            sUserId: this.sUserId,
            nUsedDuration: 0,
            bIsAvailableForDeposit: true
        };

        this.obState = {
            ...this.obState,
            bIsTracking: false,
            nStartTime: null,
            sCurrentActivityDescription: ''
        };

        return obActivity;
    }

    /**
     * Start using time from available activities
     * @param {Activity[]} arAvailableActivities - List of activities available for usage
     * @returns {string|null} ID of activity being used, or null if no activities available
     */
    startTimeUsage(arAvailableActivities) {
        if (this.obState.bIsTracking) return null; // Prevent usage while tracking

        const obActivityToUse = arAvailableActivities.find(activity => 
            activity.bIsAvailableForDeposit && 
            activity.nUsedDuration < activity.nDuration
        );

        if (!obActivityToUse) return null;

        this.obState = {
            ...this.obState,
            bIsUsingTime: true,
            nUsageStartTime: Date.now(),
            sCurrentUsageActivityId: obActivityToUse.sId
        };

        return obActivityToUse.sId;
    }

    /**
     * Stop using time and update activity records
     * @param {Activity[]} arActivities - All activities
     * @returns {Activity[]} Updated activities
     */
    stopTimeUsage(arActivities) {
        if (!this.obState.bIsUsingTime || !this.obState.nUsageStartTime) {
            return arActivities;
        }

        const nUsageDuration = Date.now() - this.obState.nUsageStartTime;
        let nRemainingUsage = nUsageDuration;

        const arUpdatedActivities = arActivities.map(activity => {
            if (!nRemainingUsage || !activity.bIsAvailableForDeposit) {
                return activity;
            }

            const nAvailableTime = activity.nDuration - activity.nUsedDuration;
            if (nAvailableTime <= 0) {
                return {
                    ...activity,
                    bIsAvailableForDeposit: false
                };
            }

            const nTimeToUse = Math.min(nRemainingUsage, nAvailableTime);
            nRemainingUsage -= nTimeToUse;

            const nNewUsedDuration = activity.nUsedDuration + nTimeToUse;
            const bIsNowFullyUsed = nNewUsedDuration >= activity.nDuration;

            return {
                ...activity,
                nUsedDuration: nNewUsedDuration,
                bIsAvailableForDeposit: !bIsNowFullyUsed
            };
        });

        this.obState = {
            ...this.obState,
            bIsUsingTime: false,
            nUsageStartTime: null,
            sCurrentUsageActivityId: null
        };

        return arUpdatedActivities;
    }

    /**
     * Get current tracking or usage duration
     * @returns {number} Duration in milliseconds
     */
    getCurrentDuration() {
        if (this.obState.bIsTracking && this.obState.nStartTime) {
            return Date.now() - this.obState.nStartTime;
        }
        if (this.obState.bIsUsingTime && this.obState.nUsageStartTime) {
            return Date.now() - this.obState.nUsageStartTime;
        }
        return 0;
    }

    /**
     * Get ID of activity currently being used
     * @returns {string|null}
     */
    getCurrentUsageActivityId() {
        return this.obState.sCurrentUsageActivityId;
    }

    /**
     * Check if currently tracking
     * @returns {boolean}
     */
    isTracking() {
        return this.obState.bIsTracking;
    }

    /**
     * Check if currently using time
     * @returns {boolean}
     */
    isUsingTime() {
        return this.obState.bIsUsingTime;
    }

    /**
     * Calculate total available time from activities
     * @param {Activity[]} arActivities - List of activities
     * @returns {number} Total available time in milliseconds
     */
    calculateTotalAvailableTime(arActivities) {
        return arActivities
            .filter(activity => activity.bIsAvailableForDeposit)
            .reduce((total, activity) => 
                total + (activity.nDuration - activity.nUsedDuration), 0);
    }
}
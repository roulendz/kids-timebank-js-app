/**
 * @file src/js/services/WalletCalculationService.js
 * @typedef {import('../types/Types').TimeDeposit} TimeDeposit
* @typedef {import('../types/Types').Activity} Activity
 */

/**
 * @typedef {Object} DepositDisplay
 * @property {TimeDeposit} deposit - The time deposit
 * @property {number} nTimeLeft - Time remaining from deposit in milliseconds
 * @property {string} sFormattedTime - Formatted time string
 * @property {string} sFormattedTimeLeft - Formatted time left string
 * @property {string} sFormattedDepositTime - Formatted deposit timestamp string
 */

import { TimeCalculationService } from './TimeCalculationService.js';
import { generateId } from '../utils/IdUtils.js';
import { DateTimeUtils } from '../utils/DateTimeUtils.js';

/**

 */

export class WalletCalculationService {
    constructor() {
        this.timeCalculationService = new TimeCalculationService();
    }

    /**
     * Calculate total available play time from today's activities
     * @param {Activity[]} arActivities - Array of all activities
     * @returns {number} Total available time in milliseconds
     */
    calculateTotalLeftPlayTimeToday(arActivities) {
        if (!Array.isArray(arActivities)) {
            console.warn('Activities is not an array:', arActivities);
            return 0;
        }

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const total = arActivities
            .filter(activity => 
                activity.nStartTime >= todayStart.getTime() && 
                activity.bIsAvailableForDeposit &&
                !isNaN(activity.nDuration) && 
                !isNaN(activity.nUsedDuration)
            )
            .reduce((total, activity) => {
                const availableTime = activity.nDuration - (activity.nUsedDuration || 0);
                return total + availableTime;
            }, 0);

        return total;
    }

    /**
     * Calculate total acumulated activity duration for today.
     * @param {Activity[]} arActivities - Array of all activities
     * @returns {number} Total duration in milliseconds
     */
    calculateTotalActivityAcumulatedDurationToday(arActivities) {
        if (!Array.isArray(arActivities)) {
            console.warn('Activities is not an array:', arActivities);
            return 0;
        }

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const total = arActivities
            .filter(activity => 
                activity.nStartTime >= todayStart.getTime() &&
                !isNaN(activity.nDuration)
            )
            .reduce((total, activity) => {
                return total + activity.nDuration;
            }, 0);

        return total;
    }

    /**
     * Get today's activities with their usage status
     * @param {Activity[]} arActivities - Array of all activities
     * @returns {Activity[]} Today's activities
     */
    getTodayActivities(arActivities) {
        const todayStart = new Date().setHours(0, 0, 0, 0);
        
        return arActivities
            .filter(activity => activity.nStartTime >= todayStart)
            .sort((a, b) => b.nStartTime - a.nStartTime);
    }

    /**
     * Find next available activity for time usage
     * @param {Activity[]} arActivities - Array of activities
     * @returns {Activity|null} Next available activity or null if none found
     */
    findNextAvailableActivity(arActivities) {
        return arActivities.find(activity => 
            activity.bIsAvailableForDeposit && 
            activity.nUsedDuration < activity.nDuration
        ) || null;
    }

    /**
     * Calculate remaining time for an activity
     * @param {Activity} activity - Activity to check
     * @returns {number} Remaining time in milliseconds
     */
    calculateRemainingTime(activity) {
        return Math.max(0, activity.nDuration - activity.nUsedDuration);
    }

    /**
     * Calculate total time in holiday wallet
     * @param {TimeDeposit[]} deposits - Array of all deposits
     * @returns {number} Total holiday time in milliseconds
     */
    calculateHolidayWalletBalance(deposits) {
        return deposits
            .reduce((total, deposit) => 
                total + deposit.nDepositedDuration + deposit.nAccumulatedBonus, 0);
    }

    /**
     * Get today's deposits with their usage details
     * @param {TimeDeposit[]} arDeposits - Array of all deposits
     * @returns {DepositDisplay[]} Today's deposits with formatted display information
     */
    getTodayDeposits(arDeposits) {
        const nTodayStart = new Date().setHours(0, 0, 0, 0);
        
        return arDeposits
            .filter(obDeposit => 
                obDeposit.nDepositTimestamp >= nTodayStart
            )
            .map(obDeposit => {
                // Calculate time left from deposit
                const nTimeLeft = Math.max(
                    obDeposit.nDepositedDuration + obDeposit.nAccumulatedBonus,
                    0
                );

                return {
                    deposit: obDeposit,
                    nTimeLeft,
                    sFormattedTime: DateTimeUtils.formatDuration(obDeposit.nDepositedDuration + obDeposit.nAccumulatedBonus),
                    sFormattedTimeLeft: DateTimeUtils.formatDuration(nTimeLeft),
                    sFormattedDepositTime: DateTimeUtils.formatDuration(obDeposit.nDepositTimestamp)
                };
            })
            .sort((a, b) => b.deposit.nDepositTimestamp - a.deposit.nDepositTimestamp);
    }

    /**
     * Calculate bonus time for a deposit based on settings
     * @param {TimeDeposit} deposit - The deposit to calculate bonus for
     * @param {number} bonusPercentage - Bonus percentage to apply
     * @returns {number} Bonus time in milliseconds
     */
    calculateDepositBonus(deposit, bonusPercentage) {
        return this.timeCalculationService.calculateBonus(
            deposit.nDepositedDuration,
            bonusPercentage
        );
    }

    /**
     * Check if a deposit can be transferred to holiday wallet
     * @param {TimeDeposit} deposit - Deposit to check
     * @returns {boolean}
     */
    canTransferToHoliday(deposit) {
        return deposit.bIsAvailableForDeposit === true;
    }
}
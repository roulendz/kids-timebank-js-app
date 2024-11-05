/**
 * @file src/js/services/WalletCalculationService.js
 * Service for handling wallet-specific calculations and operations
 */

import { WalletType, DepositStatus } from '../types/Types.js';
import { TimeCalculationService } from './TimeCalculationService.js';
import { generateId } from '../utils/IdUtils.js';

/**
 * @typedef {import('../types/Types').TimeDeposit} TimeDeposit
 * @typedef {import('../types/Types').Activity} Activity
 */

export class WalletCalculationService {
    constructor() {
        this.timeCalculationService = new TimeCalculationService();
    }

    /**
     * Calculate total available time from today's activities
     * @param {Activity[]} arActivities - Array of all activities
     * @returns {number} Total available time in milliseconds
     */
    calculateTotalAvailableTime(arActivities) {
        const todayStart = new Date().setHours(0, 0, 0, 0);
        
        return arActivities
            .filter(activity => 
                activity.nStartTime >= todayStart && 
                activity.bIsAvailableForDeposit
            )
            .reduce((total, activity) => 
                total + (activity.nDuration - activity.nUsedDuration), 0);
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
     * Calculate total available time in today's wallet
     * @param {TimeDeposit[]} deposits - Array of all deposits
     * @returns {number} Total available time in milliseconds
     */
    calculateTodayWalletBalance(deposits) {
        const todayStart = new Date().setHours(0, 0, 0, 0);
        
        return deposits
            .filter(deposit => 
                deposit.nDepositTimestamp >= todayStart &&
                deposit.sWalletType === WalletType.TODAY &&
                deposit.sStatus === DepositStatus.PENDING
            )
            .reduce((total, deposit) => 
                total + deposit.nDepositedTime + deposit.nBonusTime, 0);
    }

    /**
     * Calculate total time in holiday wallet
     * @param {TimeDeposit[]} deposits - Array of all deposits
     * @returns {number} Total holiday time in milliseconds
     */
    calculateHolidayWalletBalance(deposits) {
        return deposits
            .filter(deposit => 
                deposit.sWalletType === WalletType.HOLIDAY &&
                deposit.sStatus === DepositStatus.PENDING
            )
            .reduce((total, deposit) => 
                total + deposit.nDepositedTime + deposit.nBonusTime, 0);
    }

    /**
     * Get today's deposits with their details
     * @param {TimeDeposit[]} deposits - Array of all deposits
     * @param {Activity[]} activities - Array of all activities
     * @returns {Array<{deposit: TimeDeposit, activity: Activity}>} Today's deposits with activity details
     */
    getTodayDeposits(deposits, activities) {
        const todayStart = new Date().setHours(0, 0, 0, 0);
        const activitiesMap = new Map(activities.map(activity => [activity.sId, activity]));

        return deposits
            .filter(deposit => 
                deposit.nDepositTimestamp >= todayStart &&
                deposit.sWalletType === WalletType.TODAY
            )
            .map(deposit => ({
                deposit,
                activity: activitiesMap.get(deposit.sActivityId)
            }))
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
            deposit.nDepositedTime,
            bonusPercentage
        );
    }

    /**
     * Check if a deposit can be transferred to holiday wallet
     * @param {TimeDeposit} deposit - Deposit to check
     * @returns {boolean}
     */
    canTransferToHoliday(deposit) {
        return deposit.sWalletType === WalletType.TODAY && 
               deposit.sStatus === DepositStatus.PENDING;
    }

    /**
     * Prepare deposit for holiday wallet transfer
     * @param {TimeDeposit} deposit - Original deposit
     * @param {number} holidayBonusPercentage - Holiday wallet bonus percentage
     * @returns {TimeDeposit} New holiday deposit
     */
    prepareHolidayTransfer(deposit, holidayBonusPercentage) {
        const holidayBonus = this.calculateDepositBonus(deposit, holidayBonusPercentage);
        
        return {
            ...deposit,
            sId: generateId(), // You'll need to import generateId
            sWalletType: WalletType.HOLIDAY,
            nDepositTimestamp: Date.now(),
            nBonusTime: holidayBonus,
            sStatus: DepositStatus.PENDING
        };
    }
}
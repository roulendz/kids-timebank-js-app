/**
 * @file src/js/services/TimeCalculationService.js
 * Service for handling time calculations, week numbers, and bonus calculations
 */

/**
 * @typedef {import('../types/Types').TimeDeposit} TimeDeposit
 */

import { WalletType } from '../types/Types.js';

export class TimeCalculationService {
    /**
     * Calculate ISO week number for a given date
     * @param {Date} dDate - Date to calculate week number for
     * @returns {number} Week number (1-53)
     */
    calculateWeekNumber(dDate) {
        const date = new Date(dDate);
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const week1 = new Date(date.getFullYear(), 0, 4);
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    }

    /**
     * Calculate bonus time based on deposit amount and percentage
     * @param {number} nTime - Time in milliseconds
     * @param {number} nPercentage - Bonus percentage
     * @returns {number} Bonus time in milliseconds
     */
    calculateBonus(nTime, nPercentage) {
        return Math.floor(nTime * (nPercentage / 100));
    }

    /**
     * Calculate total weekend bonus for deposits
     * @param {TimeDeposit[]} arDeposits - Array of deposits
     * @param {number} nBonusPercentage - Weekly bonus percentage
     * @returns {number} Total weekend bonus in milliseconds
     */
    calculateWeekendBonus(arDeposits, nBonusPercentage) {
        const weekendDeposits = arDeposits.filter(deposit => {
            const depositDate = new Date(deposit.nDepositTimestamp);
            return this.isWeekend(depositDate);
        });

        return weekendDeposits.reduce((total, deposit) => {
            return total + this.calculateBonus(deposit.nDepositedTime, nBonusPercentage);
        }, 0);
    }

    /**
     * Check if date is on weekend
     * @param {Date} dDate - Date to check
     * @returns {boolean}
     */
    isWeekend(dDate) {
        const day = dDate.getDay();
        return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
    }

    /**
     * Format duration in milliseconds to HH:MM:SS
     * @param {number} nMilliseconds - Duration in milliseconds
     * @returns {string} Formatted duration
     */
    formatDuration(nMilliseconds) {
        const nSeconds = Math.floor(nMilliseconds / 1000);
        const nHours = Math.floor(nSeconds / 3600);
        const nMinutes = Math.floor((nSeconds % 3600) / 60);
        const nRemainingSeconds = nSeconds % 60;

        return [nHours, nMinutes, nRemainingSeconds]
            .map(n => n.toString().padStart(2, '0'))
            .join(':');
    }

    /**
     * Calculate expiration date for a deposit
     * @param {TimeDeposit} deposit - Time deposit
     * @param {boolean} bWeekendTimeToNextWeek - Whether weekend time moves to next week
     * @returns {Date} Expiration date
     */
    calculateExpirationDate(deposit, bWeekendTimeToNextWeek) {
        const depositDate = new Date(deposit.nDepositTimestamp);
        
        if (this.isWeekend(depositDate) && bWeekendTimeToNextWeek) {
            // If it's weekend and setting is enabled, expire next weekend
            const nextWeek = new Date(depositDate);
            nextWeek.setDate(depositDate.getDate() + 7);
            return this.getWeekendEnd(nextWeek);
        } else {
            // Regular deposits expire at the end of the current weekend
            return this.getWeekendEnd(depositDate);
        }
    }

    /**
     * Get end of weekend (Sunday 23:59:59) for a given date
     * @param {Date} dDate - Date within the week
     * @returns {Date} End of weekend
     * @private
     */
    getWeekendEnd(dDate) {
        const sundayDate = new Date(dDate);
        sundayDate.setDate(dDate.getDate() + (7 - dDate.getDay()));
        sundayDate.setHours(23, 59, 59, 999);
        return sundayDate;
    }

    /**
     * Calculate potential loss if holiday deposit is cancelled
     * @param {TimeDeposit} deposit - Time deposit to calculate
     * @returns {number} Potential loss in milliseconds
     */
    calculatePotentialLoss(deposit) {
        if (deposit.sWalletType !== WalletType.HOLIDAY) {
            return 0;
        }
        
        // Return current bonus plus potential future bonus
        return deposit.nBonusTime;
    }

    /**
     * Check if a deposit is eligible for weekly bonus
     * @param {TimeDeposit[]} arWeekDeposits - All deposits for the week
     * @returns {boolean}
     */
    isEligibleForWeeklyBonus(arWeekDeposits) {
        // Get unique days with deposits
        const uniqueDays = new Set(
            arWeekDeposits.map(deposit => 
                new Date(deposit.nDepositTimestamp).getDay()
            )
        );

        // Require deposits on at least 5 different days
        return uniqueDays.size >= 5;
    }
}
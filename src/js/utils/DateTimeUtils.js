/**
 * @file src/js/utils/DateTimeUtils.js
 * Utility functions for date and time operations
 */

import { WalletType, DepositStatus, DayOfWeek } from '../types/Types.js';

/**
 * @typedef {import('../types/Types.js').TimeDeposit} TimeDeposit
 * @typedef {import('../types/Types.js').Activity} Activity
 */

export class DateTimeUtils {
    /**
     * Format duration from milliseconds to HH:mm:ss
     * @param {number} nMilliseconds - Duration in milliseconds
     * @returns {string} Formatted time string
     */
    static formatDuration(nMilliseconds) {
        const nTotalSeconds = Math.floor(nMilliseconds / 1000);
        const nHours = Math.floor(nTotalSeconds / 3600);
        const nMinutes = Math.floor((nTotalSeconds % 3600) / 60);
        const nSeconds = nTotalSeconds % 60;

        return [nHours, nMinutes, nSeconds]
            .map(n => n.toString().padStart(2, '0'))
            .join(':');
    }

    /**
     * Format date to YYYY-MM-DD
     * @param {Date} dDate - Date to format
     * @returns {string} Formatted date string
     */
    static formatDate(dDate) {
        return dDate.toISOString().split('T')[0];
    }

    /**
     * Format time to HH:mm
     * @param {Date} dDate - Date to format
     * @returns {string} Formatted time string in HH:MM format
     */
    static formatTime(dDate) {
        return dDate.toTimeString().slice(0, 5);
    }

    /**
     * Get start of day
     * @param {Date} dDate - Input date
     * @returns {Date} Start of day
     */
    static getStartOfDay(dDate) {
        const dResult = new Date(dDate);
        dResult.setHours(0, 0, 0, 0);
        return dResult;
    }

    /**
     * Get end of day
     * @param {Date} dDate - Input date
     * @returns {Date} End of day
     */
    static getEndOfDay(dDate) {
        const dResult = new Date(dDate);
        dResult.setHours(23, 59, 59, 999);
        return dResult;
    }

    /**
     * Check if two dates are the same day
     * @param {Date} dDate1 - First date
     * @param {Date} dDate2 - Second date
     * @returns {boolean}
     */
    static isSameDay(dDate1, dDate2) {
        return dDate1.toISOString().split('T')[0] === dDate2.toISOString().split('T')[0];
    }

    /**
     * Get ISO week number for a specific date
     * @param {Date} dDate - Input date
     * @returns {number} Week number (1-53)
     */
    static getWeekNumber(dDate) {
        const dTarget = new Date(dDate.valueOf());
        const dayNumber = (dDate.getDay() + 6) % 7;
        dTarget.setDate(dTarget.getDate() - dayNumber + 3);
        const firstThursday = dTarget.valueOf();
        dTarget.setMonth(0, 1);
        if (dTarget.getDay() !== 4) {
            dTarget.setMonth(0, 1 + ((4 - dTarget.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - dTarget) / 604800000);
    }

    /**
     * Format time difference between timestamps
     * @param {number} nStartTime - Start timestamp
     * @param {number} nEndTime - End timestamp
     * @returns {string} Formatted duration string in HH:mm:ss format
     */
    static getReadableTimeDiff(nStartTime, nEndTime) {
        const nDiff = Math.abs(nEndTime - nStartTime);
        return this.formatDuration(nDiff);
    }

    /**
     * Get day of week from date
     * @param {Date} dDate - Input date
     * @returns {DayOfWeek} Day of week
     */
    static getDayOfWeek(dDate) {
        const days = [
            DayOfWeek.SUNDAY,
            DayOfWeek.MONDAY,
            DayOfWeek.TUESDAY,
            DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY,
            DayOfWeek.FRIDAY,
            DayOfWeek.SATURDAY
        ];
        return days[dDate.getDay()];
    }

    /**
     * Format deposit time info
     * @param {TimeDeposit} deposit - Time deposit
     * @returns {string} Formatted deposit time info
     */
    static formatDepositTimeInfo(deposit) {
        const totalTime = deposit.nDepositedTime + deposit.nBonusTime;
        return {
            depositedTime: this.formatDuration(deposit.nDepositedTime),
            bonusTime: this.formatDuration(deposit.nBonusTime),
            totalTime: this.formatDuration(totalTime)
        };
    }
}
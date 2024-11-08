/**
 * Represents a time period schedule
 * @typedef {Object} Schedule
 * @property {string} sDay - Day of the week (Monday, Tuesday, etc.)
 * @property {string} sStartTime - Start time in HH:MM format
 * @property {string} sEndTime - End time in HH:MM format
 * @property {boolean} bEnabled - Whether this schedule is active
 */

/**
 * @typedef {Object} Activity
 * @property {string} sId - Unique identifier
 * @property {string} sDescription - Activity description
 * @property {number} nStartTime - Activity start timestamp
 * @property {number} nEndTime - Activity end timestamp
 * @property {number} nDuration - Total activity duration in milliseconds
 * @property {number} nUsedDuration - Amount of time already used/redeemed
 * @property {boolean} bIsAvailableForDeposit - Whether activity can be deposited
 * @property {string} sUserId - User ID who owns this activity
 * @property {number} nWeekNumber - Week number of the activity
 * @property {number} nYear - Year of the activity
 */

/**
 * @typedef {Object} TimeDeposit
 * @property {string} sId - Same ID as original activity
 * @property {string} sDescription - Activity description
 * @property {number} nStartTime - Original activity start time
 * @property {number} nEndTime - Original activity end time
 * @property {number} nDuration - Original activity duration
 * @property {number} nUsedDuration - Amount of deposited time used
 * @property {number} nDepositedDuration - Duration available at deposit time (nDuration - nUsedDuration)
 * @property {number} nAccumulatedBonus - Total bonus time earned (daily +10%, holidays etc.)
 * @property {number} nDepositTimestamp - When deposit was made
 * @property {string} sUserId - User ID who owns this deposit
 * @property {number} nWeekNumber - Week number of deposit
 * @property {number} nYear - Year of deposit
 * @property {boolean} bIsAvailableForDeposit - Whether deposit can still be used
 */

/**
 * Unique identifier string
 * @typedef {string} ID
 * 
 */

/**
 * User with required ID
 * @typedef {Object} User
 * @property {ID} sId - Unique identifier
 * @property {string} sName - User's full name
 * @property {string} sNickname - User's preferred nickname
 * @property {number} nTimeBalance - Available time balance in seconds
 * @property {Schedule[]} arSchedule - Weekly schedule for using time
 * @property {Activity[]} [arActivityLog] - Optional array of activity logs
 * @property {TimeDeposit[]} [arDeposits] - Optional array of time deposits
 * @property {UserSettings} obSettings - User settings
 */

/**
 * Days of week enumeration
 * @readonly
 * @enum {string}
 */
export const DayOfWeek = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    SUNDAY: 'Sunday'
};

/**
 * User settings
 * @typedef {Object} UserSettings
 * @property {boolean} bAutoDepositToHoliday - Auto deposit unused time to holiday wallet
 * @property {boolean} bWeekendTimeToNextWeek - Move weekend time to next week
 * @property {number} nHolidayBonusPercentage - Bonus percentage for holiday wallet
 * @property {number} nWeeklyBonusPercentage - Bonus percentage for full week deposits
 */

/**
 * Time tracking state
 * @typedef {Object} TimeTrackingState
 * @property {boolean} bIsTracking - Whether time tracking is active
 * @property {boolean} bIsUsingTime - Whether time usage is active
 * @property {number|null} nStartTime - Tracking start timestamp
 * @property {number|null} nUsageStartTime - Time usage start timestamp
 * @property {string} sCurrentActivityDescription - Current activity description
 * @property {string|null} sCurrentUsageActivityId - ID of activity currently being used
 */

/**
 * Modal configuration
 * @typedef {Object} ModalConfig
 * @property {string} sTitle - Modal title
 * @property {string} sContent - Modal content
 * @property {Function} fnOnConfirm - Confirmation handler
 * @property {Function} fnOnCancel - Cancel handler
 */

/**
 * Represents the application's state
 * @typedef {Object} AppState
 * @property {User[]} arUsers - Array of all users
 * @property {string|null} sCurrentUserId - ID of currently selected user
 * @property {TimeTrackingState|null} obTrackingState - Current tracking state
 */



/**
 * Custom event for activity actions
 * @typedef {CustomEvent<ActivityEventDetail>} ActivityEvent
 */

/**
 * Activity event detail
 * @typedef {Object} ActivityEventDetail
 * @property {'start' | 'stop'} action - The action to perform
 */

/**
 * Activity event options
 * @typedef {Object} ActivityEventOptions
 * @property {ActivityEventDetail} detail - The event detail object
 */

/**
 * Extended HTMLElement interface with data attributes
 * @typedef {Object} DataAttributes
 * @property {string} [depositId] - Optional deposit ID
 * @property {string} [activityId] - Optional activity ID
 * @property {string} [action] - Optional action type
 */

/**
 * @typedef {HTMLElement & {
*   dataset: DataAttributes;
*   closest<K extends keyof HTMLElementTagNameMap>(selector: string): HTMLElementTagNameMap[K] | null;
*   closest<K extends keyof SVGElementTagNameMap>(selector: string): SVGElementTagNameMap[K] | null;
*   closest<E extends Element = Element>(selector: string): E | null;
* }} HTMLElementWithData
*/

/**
* @typedef {MouseEvent & {
*   target: HTMLElementWithData;
* }} MouseEventWithData
*/

// Export type definitions for use in other files
export {};
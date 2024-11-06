/**
 * Represents a time period schedule
 * @typedef {Object} Schedule
 * @property {string} sDay - Day of the week (Monday, Tuesday, etc.)
 * @property {string} sStartTime - Start time in HH:MM format
 * @property {string} sEndTime - End time in HH:MM format
 * @property {boolean} bEnabled - Whether this schedule is active
 */

/**
 * Represents an activity log entry
 * @typedef {Object} Activity
 * @property {string} sId - Unique identifier
 * @property {string} sType - Activity type (work/recreational)
 * @property {string} sDescription - Description of the activity
 * @property {number} nStartTime - Timestamp when activity started
 * @property {number} nEndTime - Timestamp when activity ended
 * @property {number} nDuration - Duration in milliseconds
 * @property {string} sUserId - ID of user who performed the activity
 * @property {number} nUsedDuration - Duration of time used from this activity (default: 0)
 * @property {boolean} bIsAvailableForDeposit - Whether activity can be deposited (default: true)
 * @property {boolean} bIsUsed - Whether activity time is fully used (default: false)
 */

/**
 * Unique identifier string
 * @typedef {string} ID
 */

/**
 * ID generation options
 * @typedef {Object} IdOptions
 * @property {string} [sPrefix] - Optional prefix for the ID
 * @property {boolean} [bSequential] - Whether to generate sequential ID
 * 
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


// Add these to your existing Types.js file

/**
 * Form submission data for creating/updating a user
 * @typedef {Object} UserFormData
 * @property {string} sName - User's full name
 * @property {string} sNickname - User's nickname
 * @property {Schedule[]} arSchedule - User's weekly schedule
 * @property {string} [sId] - User's ID (present only for updates)
 */

/**
 * Child form component props
 * @typedef {Object} ChildFormProps
 * @property {(data: UserFormData) => void} fnOnSubmit - Form submission handler
 * @property {User|null} [obUser] - Existing user data for editing
 */

/**
 * Wallet types enumeration
 * @readonly
 * @enum {string}
 */
export const WalletType = {
    TODAY: 'today',
    HOLIDAY: 'holiday'
};

/**
 * Activity deposit status
 * @readonly
 * @enum {string}
 */
export const DepositStatus = {
    PENDING: 'pending',
    HOLIDAY_DEPOSITED: 'holiday_deposited',
    USED: 'used',
    EXPIRED: 'expired'
};

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
 /**
 * @typedef {Object} TimeDeposit
 * @property {string} sId - Unique identifier
 * @property {string} sUserId - User ID
 * @property {string} sActivityId - Related activity ID
 * @property {WalletType} sWalletType - Wallet type
 * @property {DepositStatus} sStatus - Deposit status
 * @property {number} nDepositedTime - Original deposited time in milliseconds
 * @property {number} nUsedDepositedTime - How mutch time was used
 * @property {number} nBonusTime - Bonus time earned in milliseconds
 * @property {number} nDepositTimestamp - When the deposit was made
 * @property {number} nWeekNumber - ISO week number
 * @property {number} nYear - Year of deposit

/**
 * User settings
 * @typedef {Object} UserSettings
 * @property {boolean} bAutoDepositToHoliday - Auto deposit unused time to holiday wallet
 * @property {boolean} bWeekendTimeToNextWeek - Move weekend time to next week
 * @property {number} nHolidayBonusPercentage - Bonus percentage for holiday wallet
 * @property {number} nWeeklyBonusPercentage - Bonus percentage for full week deposits
 */

/**
 * Extended user type with settin
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
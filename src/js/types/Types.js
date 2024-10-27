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
 * @property {number} nDuration - Duration in seconds
 * @property {string} sUserId - ID of user who performed the activity
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
 */

/**
 * Represents the application's state
 * @typedef {Object} AppState
 * @property {User[]} arUsers - Array of all users
 * @property {string|null} sCurrentUserId - ID of currently selected user
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
    /** Today's activities wallet */
    TODAY: 'today',
    /** Holiday savings wallet */
    HOLIDAY: 'holiday'
};

/**
 * Activity deposit status
 * @readonly
 * @enum {string}
 */
export const DepositStatus = {
    /** Activity time pending in today's wallet */
    PENDING: 'pending',
    /** Time deposited to holiday wallet */
    HOLIDAY_DEPOSITED: 'holiday_deposited',
    /** Time used today */
    USED: 'used',
    /** Time expired */
    EXPIRED: 'expired'
};

/**
 * Activity time deposit
 * @typedef {Object} TimeDeposit
 * @property {ID} sId - Unique identifier
 * @property {ID} sUserId - User ID
 * @property {ID} sActivityId - Related activity ID
 * @property {WalletType} sWalletType - Wallet type
 * @property {DepositStatus} sStatus - Deposit status
 * @property {number} nDepositedTime - Original deposited time in milliseconds
 * @property {number} nBonusTime - Bonus time earned in milliseconds
 * @property {number} nDepositTimestamp - When the deposit was made
 * @property {number} nWeekNumber - ISO week number
 * @property {number} nYear - Year of deposit
 */

/**
 * User settings
 * @typedef {Object} UserSettings
 * @property {boolean} bAutoDepositToHoliday - Auto deposit unused time to holiday wallet
 * @property {boolean} bWeekendTimeToNextWeek - Move weekend time to next week
 * @property {number} nHolidayBonusPercentage - Bonus percentage for holiday wallet
 * @property {number} nWeeklyBonusPercentage - Bonus percentage for full week deposits
 */

/**
 * Extended user type with settings
 * @typedef {Object} UserExtended
 * @property {ID} sId - Unique identifier
 * @property {string} sName - User's full name
 * @property {string} sNickname - User's preferred nickname
 * @property {UserSettings} obSettings - User settings
 * @property {Schedule[]} arSchedule - Weekly schedule for using time
 * @property {Activity[]} [arActivityLog] - Optional array of activity logs
 * @property {TimeDeposit[]} [arDeposits] - Array of time deposits
 */

/**
 * Time tracking state
 * @typedef {Object} TimeTrackingState
 * @property {boolean} bIsTracking - Whether time tracking is active
 * @property {number|null} nStartTime - Tracking start timestamp
 * @property {string} sCurrentActivityDescription - Current activity description
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

// Export type definitions for use in other files
export {};
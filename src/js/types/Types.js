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
 * Activity types enumeration
 * @readonly
 * @enum {string}
 */


export const ActivityType = {
    /** Work or study activity that earns time */
    WORK: 'work',
    /** Recreational activity that spends time */
    RECREATIONAL: 'recreational'
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

// Export type definitions for use in other files
export {};
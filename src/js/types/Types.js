/**
 * @typedef {Object} User
 * @property {string} sId - Unique identifier
 * @property {string} sName - User's full name
 * @property {string} sNickname - User's nickname
 * @property {number} nTimeBalance - Available time balance in seconds
 * @property {Schedule[]} arSchedule - Weekly schedule for using time
 */

/**
 * @typedef {Object} Schedule
 * @property {string} sDay - Day of week
 * @property {string} sStartTime - Start time (HH:MM)
 * @property {string} sEndTime - End time (HH:MM)
 */

/**
 * @typedef {Object} AppState
 * @property {User[]} arUsers - Array of users
 * @property {string|null} sCurrentUserId - Currently selected user ID
 */

export {};
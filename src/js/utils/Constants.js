/**
 * @file src/js/utils/Constants.js
 * Application constants
 * @const
 */

/** @typedef {import('../types/Types').UserSettings} UserSettings */

/**
 * @type {UserSettings}
 */
const DEFAULT_USER_SETTINGS = {
    bAutoDepositToHoliday: false,
    bWeekendTimeToNextWeek: true,
    nHolidayBonusPercentage: 10, // 10% bonus for holiday deposits
    nWeeklyBonusPercentage: 5    // 5% bonus for full week deposits
};

export const Constants = {
    COLORS: {
        BACKGROUND: '#ADD8E6',
        ACCENT: '#E6E6FA',
        DEPOSIT: '#98FF98',
        USE: '#FFFACD'
    },
    ROUTES: {
        INDEX: '/',
        CHILDREN: '/children',
        CHILDREN_CREATE: '/children/create',
        CHILDREN_EDIT: '/children/edit',
        CHILDREN_WALLET: '/children/wallet',
        DEPOSIT: '/deposit',
        USE: '/use'
    },
    LOCAL_STORAGE_KEY: 'timebankKidsState',
    DEFAULT_USER: {
        sId: '1',
        sName: 'Kid 1',
        sNickname: 'Kid 1',
        nTimeBalance: 0,
        arSchedule: [],
        arActivityLog: [],
        arDeposits: [],
        obSettings: DEFAULT_USER_SETTINGS
    }
};

/**
 * Initial application state
 * @const
 */
export const INITIAL_STATE = {
    arUsers: [Constants.DEFAULT_USER],
    sCurrentUserId: null
};

export { DEFAULT_USER_SETTINGS };
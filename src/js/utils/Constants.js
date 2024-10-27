/**
 * Application constants
 * @const
 */
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
        DEPOSIT: '/deposit',
        USE: '/use'
    },
    LOCAL_STORAGE_KEY: 'timebankKidsState',
    DEFAULT_USER: {
        sId: '1',
        sName: 'Kid 1',
        sNickname: 'Kid 1',
        nTimeBalance: 0,
        arSchedule: []
    }
};

/**
 * Initial application state
 * @const
 */
export const INITIAL_STATE = {
    arUsers: [Constants.DEFAULT_USER], // Include default user
    sCurrentUserId: null
};
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
    LOCAL_STORAGE_KEY: 'timebankKidsState'
};

/**
 * Initial application state
 * @const
 */
export const INITIAL_STATE = {
    arUsers: [],
    sCurrentUserId: null
};
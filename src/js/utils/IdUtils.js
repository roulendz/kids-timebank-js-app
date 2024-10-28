/**
 * @file src/js/utils/IdUtils.js
 * Utility functions for ID generation
 * @module IdUtils
 */

/**
 * Generates a simple UUID v4-like identifier
 * @returns {string} Generated unique identifier
 */
export function generateId() {
    const sTimestamp = Date.now().toString(36);
    const sRandomPart = Math.random().toString(36).substring(2, 15);
    return `${sTimestamp}-${sRandomPart}`;
}

/**
 * Generates a timestamp-based sequential ID with a given prefix
 * @param {string} sPrefix - Prefix for the ID
 * @returns {string} Generated sequential identifier
 */
export function generateSequentialId(sPrefix) {
    return `${sPrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
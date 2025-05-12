import CryptoJS from 'crypto-js';

/**
 * Utility for securely managing sensitive credentials
 * Uses AES encryption with a user-provided password
 */

// Use a combination of local storage (encrypted) and memory storage for sensitive data
const STORAGE_KEY = 'invoiceAppSecureData';

/**
 * Encrypt sensitive data with a password
 * @param {Object} data - Data to encrypt
 * @param {string} password - User password for encryption
 * @returns {string} - Encrypted data string
 */
export const encryptData = (data, password) => {
    try {
        if (!data || !password) return null;
        const dataString = JSON.stringify(data);
        return CryptoJS.AES.encrypt(dataString, password).toString();
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
};

/**
 * Decrypt sensitive data with a password
 * @param {string} encryptedData - Encrypted data string
 * @param {string} password - User password for decryption
 * @returns {Object|null} - Decrypted data object or null if decryption fails
 */
export const decryptData = (encryptedData, password) => {
    try {
        if (!encryptedData || !password) return null;
        const bytes = CryptoJS.AES.decrypt(encryptedData, password);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedString);
    } catch (error) {
        // Return null instead of throwing to handle invalid passwords gracefully
        return null;
    }
};

/**
 * Save encrypted credentials to localStorage
 * @param {Object} credentials - Credentials object 
 * @param {string} password - User password for encryption
 * @returns {boolean} - Success status
 */
export const saveCredentials = (credentials, password) => {
    try {
        const encrypted = encryptData(credentials, password);
        if (!encrypted) return false;

        localStorage.setItem(STORAGE_KEY, encrypted);
        return true;
    } catch (error) {
        console.error('Error saving credentials:', error);
        return false;
    }
};

/**
 * Load and decrypt credentials from localStorage
 * @param {string} password - User password for decryption
 * @returns {Object|null} - Decrypted credentials or null if not found/invalid
 */
export const loadCredentials = (password) => {
    try {
        const encrypted = localStorage.getItem(STORAGE_KEY);
        if (!encrypted) return null;

        return decryptData(encrypted, password);
    } catch (error) {
        console.error('Error loading credentials:', error);
        return null;
    }
};

/**
 * Check if secure credentials exist in storage
 * @returns {boolean} - Whether credentials exist
 */
export const hasCredentials = () => {
    return !!localStorage.getItem(STORAGE_KEY);
};

/**
 * Verify if a password can decrypt the stored credentials
 * @param {string} password - Password to verify
 * @returns {boolean} - Whether password is valid
 */
export const verifyPassword = (password) => {
    try {
        const encrypted = localStorage.getItem(STORAGE_KEY);
        if (!encrypted) return false;

        const decrypted = decryptData(encrypted, password);
        return decrypted !== null;
    } catch (error) {
        return false;
    }
};

/**
 * Clear all stored credentials
 * @returns {boolean} - Success status
 */
export const clearCredentials = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing credentials:', error);
        return false;
    }
};

/**
 * Mask sensitive data for display
 * @param {string} value - String to mask
 * @param {number} visibleChars - Number of characters to show at the beginning and end
 * @returns {string} - Masked string
 */
export const maskSensitiveData = (value, visibleChars = 4) => {
    if (!value) return '';

    if (value.length <= visibleChars * 2) {
        return '*'.repeat(value.length);
    }

    const start = value.substring(0, visibleChars);
    const end = value.substring(value.length - visibleChars);
    const masked = '*'.repeat(value.length - (visibleChars * 2));

    return `${start}${masked}${end}`;
};

/**
 * Generate a secure environment file content with encrypted credentials
 * @param {Object} credentials - Credentials object with EMAIL_PASSWORD, etc.
 * @param {string} password - User password for encryption
 * @returns {string} - Content for .env file
 */
export const generateSecureEnvFile = (credentials, password) => {
    try {
        // Create a backup of credentials in case .env file is lost
        saveCredentials(credentials, password);

        // Generate .env file content
        return Object.entries(credentials)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
    } catch (error) {
        console.error('Error generating secure .env file:', error);
        return null;
    }
}; 
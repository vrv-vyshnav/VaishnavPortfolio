import { CONFIG } from '../config/constants.js';

/**
 * Centralized error handling and logging utility
 * Provides consistent error handling across the application
 */
export class ErrorHandler {
    constructor() {
        this.errorCount = 0;
        this.maxErrors = 10; // Prevent infinite error loops
    }

    /**
     * Handles errors with proper logging and user feedback
     * @param {Error} error - The error object
     * @param {string} context - The context where the error occurred
     * @param {Object} options - Additional options
     */
    handleError(error, context = 'Unknown', options = {}) {
        this.errorCount++;
        
        // Prevent infinite error loops
        if (this.errorCount > this.maxErrors) {
            console.error('Too many errors, stopping error handling');
            return;
        }

        const errorInfo = {
            message: error.message || 'Unknown error',
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Log error for debugging
        this.logError(errorInfo);

        // Show user-friendly error message
        this.showUserError(error, context, options);

        // Report error if configured
        if (options.report !== false) {
            this.reportError(errorInfo);
        }
    }

    /**
     * Logs error information for debugging
     * @param {Object} errorInfo - Error information object
     */
    logError(errorInfo) {
        console.group(`Error in ${errorInfo.context}`);
        console.error('Message:', errorInfo.message);
        console.error('Stack:', errorInfo.stack);
        console.error('Timestamp:', errorInfo.timestamp);
        console.error('URL:', errorInfo.url);
        console.groupEnd();
    }

    /**
     * Shows user-friendly error message
     * @param {Error} error - The error object
     * @param {string} context - The context where the error occurred
     * @param {Object} options - Additional options
     */
    showUserError(error, context, options = {}) {
        const userMessage = this.getUserFriendlyMessage(error, context);
        
        // Try to show error in terminal if available
        const terminalContent = document.getElementById('terminal-content');
        if (terminalContent && !options.silent) {
            const errorElement = document.createElement('div');
            errorElement.className = 'output error';
            errorElement.innerHTML = `<span class="error">Error: ${userMessage}</span>`;
            
            // Insert error before the current prompt
            const currentPrompt = terminalContent.querySelector('.command-line');
            if (currentPrompt) {
                terminalContent.insertBefore(errorElement, currentPrompt);
            } else {
                terminalContent.appendChild(errorElement);
            }
            
            // Scroll to show error
            terminalContent.scrollTop = terminalContent.scrollHeight;
        }
    }

    /**
     * Gets user-friendly error message
     * @param {Error} error - The error object
     * @param {string} context - The context where the error occurred
     * @returns {string} - User-friendly error message
     */
    getUserFriendlyMessage(error, context) {
        const errorMessages = {
            'Command not found': CONFIG.ERROR_MESSAGES.COMMAND_NOT_FOUND,
            'File not found': CONFIG.ERROR_MESSAGES.FILE_NOT_FOUND,
            'Permission denied': CONFIG.ERROR_MESSAGES.PERMISSION_DENIED,
            'Invalid path': CONFIG.ERROR_MESSAGES.INVALID_PATH,
            'Failed to load portfolio data': CONFIG.ERROR_MESSAGES.LOAD_ERROR,
            'NetworkError': 'Network error. Please check your connection.',
            'TypeError': 'Invalid operation. Please try again.',
            'ReferenceError': 'System error. Please refresh the page.',
            'SyntaxError': 'Invalid command syntax. Please check your input.'
        };

        // Try to match error message
        for (const [key, message] of Object.entries(errorMessages)) {
            if (error.message.includes(key)) {
                return message;
            }
        }

        // Default error messages based on context
        const contextMessages = {
            'command_execution': 'Command execution failed. Please try again.',
            'file_system': 'File system error. Please refresh the page.',
            'network': 'Network error. Please check your connection.',
            'initialization': 'Failed to initialize. Please refresh the page.',
            'validation': 'Invalid input. Please check your command.',
            'security': 'Security violation. Command blocked.'
        };

        return contextMessages[context] || CONFIG.ERROR_MESSAGES.EXECUTION_ERROR;
    }

    /**
     * Reports error to external service (if configured)
     * @param {Object} errorInfo - Error information object
     */
    reportError(errorInfo) {
        // In a production environment, you might want to send this to a logging service
        // For now, we'll just store it in localStorage for debugging
        try {
            const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');
            errorLog.push(errorInfo);
            
            // Keep only last 50 errors
            if (errorLog.length > 50) {
                errorLog.splice(0, errorLog.length - 50);
            }
            
            localStorage.setItem('errorLog', JSON.stringify(errorLog));
        } catch (e) {
            console.warn('Failed to save error log:', e);
        }
    }

    /**
     * Validates input and throws appropriate errors
     * @param {*} value - The value to validate
     * @param {string} type - The expected type
     * @param {string} name - The parameter name
     */
    validateInput(value, type, name) {
        switch (type) {
            case 'string':
                if (typeof value !== 'string') {
                    throw new TypeError(`${name} must be a string`);
                }
                break;
            case 'number':
                if (typeof value !== 'number' || isNaN(value)) {
                    throw new TypeError(`${name} must be a valid number`);
                }
                break;
            case 'function':
                if (typeof value !== 'function') {
                    throw new TypeError(`${name} must be a function`);
                }
                break;
            case 'object':
                if (typeof value !== 'object' || value === null) {
                    throw new TypeError(`${name} must be an object`);
                }
                break;
            case 'array':
                if (!Array.isArray(value)) {
                    throw new TypeError(`${name} must be an array`);
                }
                break;
            default:
                throw new Error(`Unknown validation type: ${type}`);
        }
    }

    /**
     * Creates a custom error with context
     * @param {string} message - Error message
     * @param {string} context - Error context
     * @param {string} type - Error type
     * @returns {Error} - Custom error object
     */
    createError(message, context = 'Unknown', type = 'Error') {
        const error = new Error(message);
        error.name = type;
        error.context = context;
        error.timestamp = new Date().toISOString();
        return error;
    }

    /**
     * Resets error count (useful for testing)
     */
    reset() {
        this.errorCount = 0;
    }

    /**
     * Gets error statistics
     * @returns {Object} - Error statistics
     */
    getStats() {
        try {
            const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');
            return {
                totalErrors: errorLog.length,
                recentErrors: this.errorCount,
                lastError: errorLog[errorLog.length - 1] || null
            };
        } catch (e) {
            return {
                totalErrors: 0,
                recentErrors: this.errorCount,
                lastError: null
            };
        }
    }
} 
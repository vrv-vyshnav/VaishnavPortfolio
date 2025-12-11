export const CONFIG = {
    // Timing configurations
    TYPING_SPEED: 10,
    BOOT_DELAY: 1000,
    INIT_DELAY: 4000,
    
    // System information
    SYSTEM_INFO: {
        OS: 'Portfolio Linux 2.0',
        UPTIME: '2+ years in software engineering',
        MEMORY: 'Full-stack development skills loaded',
        SHELL: '/bin/vaishnav',
        STATUS: 'Ready for new opportunities',
        LOCATION: 'Kerala, India'
    },
    
    // Terminal configuration
    TERMINAL: {
        PROMPT_COLOR: '#0f0',
        ERROR_COLOR: '#ff7b72',
        SUCCESS_COLOR: '#0f0',
        INFO_COLOR: '#0ff',
        WARNING_COLOR: '#ffa657'
    },
    
    // File system configuration
    FILE_SYSTEM: {
        DEFAULT_PATH: '/home/vaishnav/portfolio',
        DATA_FILE: 'portfolio-data.json'
    },

    // Demo configuration
    DEMO: {
        TYPING_SPEED_EXPLANATION: 15,    // ms per character for explanations
        TYPING_SPEED_COMMAND: 30,         // ms per character for commands
        PAUSE_AFTER_EXPLANATION: 500,    // ms pause after explanation
        PAUSE_AFTER_TYPING: 500           // ms pause after typing command
    },

    // Security configuration
    SECURITY: {
        ALLOWED_HTML_TAGS: ['span', 'div', 'a', 'br', 'p', 'pre', 'section'],
        ALLOWED_HTML_ATTR: ['class', 'href', 'target', 'id', 'style']
    },
    
    // Error messages
    ERROR_MESSAGES: {
        COMMAND_NOT_FOUND: 'Command not found',
        FILE_NOT_FOUND: 'File not found',
        PERMISSION_DENIED: 'Permission denied',
        INVALID_PATH: 'Invalid path',
        LOAD_ERROR: 'Error loading portfolio data. Please refresh the page.',
        EXECUTION_ERROR: 'Error executing command'
    },
    
    // Success messages
    SUCCESS_MESSAGES: {
        TERMINAL_READY: 'Terminal initialized. Type \'help\' for available commands or \'demo\' for interactive demo.',
        COMMAND_EXECUTED: 'Command executed successfully'
    }
}; 
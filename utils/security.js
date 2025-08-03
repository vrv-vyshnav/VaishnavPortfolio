import { CONFIG } from '../config/constants.js';

/**
 * Enhanced HTML sanitization utility
 * Provides protection against XSS attacks
 */
export class SecurityManager {
    /**
     * Sanitizes HTML content to prevent XSS attacks
     * @param {string} content - The HTML content to sanitize
     * @returns {string} - Sanitized HTML content
     */
    static sanitizeHTML(content) {
        if (typeof content !== 'string') {
            return '';
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const body = doc.body || document.createElement('body');

        // Remove potentially dangerous elements
        this.removeDangerousElements(body);
        
        // Clean attributes
        this.cleanAttributes(body);
        
        // Remove event handlers and dangerous protocols
        this.removeEventHandlers(body);

        return body.innerHTML;
    }

    /**
     * Removes dangerous HTML elements
     * @param {Element} element - The element to clean
     */
    static removeDangerousElements(element) {
        const dangerousTags = [
            'script', 'object', 'embed', 'applet', 'form', 
            'input', 'textarea', 'select', 'button', 'iframe',
            'frame', 'frameset', 'noframes', 'noscript'
        ];

        dangerousTags.forEach(tag => {
            element.querySelectorAll(tag).forEach(el => el.remove());
        });
    }

    /**
     * Cleans HTML attributes to remove potentially dangerous ones
     * @param {Element} element - The element to clean
     */
    static cleanAttributes(element) {
        const allowedAttrs = new Set(CONFIG.SECURITY.ALLOWED_HTML_ATTR);
        
        function cleanNode(node) {
            if (node.attributes) {
                const attrsToRemove = [];
                
                for (let attr of node.attributes) {
                    const { name, value } = attr;
                    const val = value.trim().toLowerCase();
                    
                    // Remove event handlers
                    if (name.startsWith('on')) {
                        attrsToRemove.push(name);
                        continue;
                    }
                    
                    // Remove dangerous protocols
                    if (['src', 'href', 'xlink:href'].includes(name) &&
                        (val.startsWith('javascript:') || 
                         val.startsWith('data:') || 
                         val.startsWith('vbscript:'))) {
                        attrsToRemove.push(name);
                        continue;
                    }
                    
                    // Remove non-allowed attributes
                    if (!allowedAttrs.has(name)) {
                        attrsToRemove.push(name);
                    }
                }
                
                attrsToRemove.forEach(attr => node.removeAttribute(attr));
            }
            
            // Recursively clean child nodes
            Array.from(node.childNodes).forEach(child => {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    cleanNode(child);
                }
            });
        }
        
        cleanNode(element);
    }

    /**
     * Removes event handlers from elements
     * @param {Element} element - The element to clean
     */
    static removeEventHandlers(element) {
        const eventAttributes = [
            'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
            'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
            'onselect', 'onunload', 'onresize', 'onscroll', 'onkeydown',
            'onkeyup', 'onkeypress', 'onmousedown', 'onmouseup', 'onmousemove'
        ];

        eventAttributes.forEach(attr => {
            element.querySelectorAll(`[${attr}]`).forEach(el => {
                el.removeAttribute(attr);
            });
        });
    }

    /**
     * Validates command input to prevent injection attacks
     * @param {string} command - The command to validate
     * @returns {boolean} - True if command is valid
     */
    static validateCommand(command) {
        if (typeof command !== 'string') {
            return false;
        }

        // Check for potentially dangerous patterns
        const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /data:/i,
            /vbscript:/i,
            /on\w+\s*=/i,
            /eval\s*\(/i,
            /document\./i,
            /window\./i
        ];

        return !dangerousPatterns.some(pattern => pattern.test(command));
    }

    /**
     * Validates file path to prevent directory traversal attacks
     * @param {string} path - The path to validate
     * @returns {boolean} - True if path is valid
     */
    static validatePath(path) {
        if (typeof path !== 'string') {
            return false;
        }

        // Check for directory traversal attempts
        const dangerousPatterns = [
            /\.\.\//,
            /\.\.\\/,
            /\/etc\//,
            /\/proc\//,
            /\/sys\//,
            /\/dev\//,
            /\/root\//,
            /\/home\/[^\/]+\/\.\./
        ];

        return !dangerousPatterns.some(pattern => pattern.test(path));
    }
} 
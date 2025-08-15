/**
 * Event Manager for efficient event handling
 * Prevents memory leaks and provides centralized event management
 */
export class EventManager {
    constructor() {
        this.listeners = new Map();
        this.bound = new Map();
    }

    /**
     * Adds an event listener with proper cleanup tracking
     * @param {Element} element - The element to attach the listener to
     * @param {string} event - The event type
     * @param {Function} handler - The event handler function
     * @param {Object} options - Event listener options
     */
    addListener(element, event, handler, options = {}) {
        if (!element || !event || typeof handler !== 'function') {
            console.warn('Invalid parameters for addListener');
            return;
        }

        // Create a unique key for this element
        const elementKey = this.getElementKey(element);
        
        if (!this.listeners.has(elementKey)) {
            this.listeners.set(elementKey, new Map());
        }

        const eventMap = this.listeners.get(elementKey);
        
        // Store the handler and options
        eventMap.set(event, { handler, options });
        
        // Add the event listener
        element.addEventListener(event, handler, options);
    }

    /**
     * Removes a specific event listener
     * @param {Element} element - The element to remove the listener from
     * @param {string} event - The event type
     */
    removeListener(element, event) {
        const elementKey = this.getElementKey(element);
        const eventMap = this.listeners.get(elementKey);
        
        if (eventMap && eventMap.has(event)) {
            const { handler, options } = eventMap.get(event);
            element.removeEventListener(event, handler, options);
            eventMap.delete(event);
        }
    }

    /**
     * Removes all listeners for a specific element
     * @param {Element} element - The element to clean up
     */
    removeAllListeners(element) {
        const elementKey = this.getElementKey(element);
        const eventMap = this.listeners.get(elementKey);
        
        if (eventMap) {
            eventMap.forEach(({ handler, options }, event) => {
                element.removeEventListener(event, handler, options);
            });
            this.listeners.delete(elementKey);
        }
    }

    /**
     * Cleans up all event listeners
     */
    cleanup() {
        this.listeners.forEach((eventMap, elementKey) => {
            const element = this.getElementFromKey(elementKey);
            if (element) {
                eventMap.forEach(({ handler, options }, event) => {
                    element.removeEventListener(event, handler, options);
                });
            }
        });
        
        this.listeners.clear();
        this.bound.clear();
    }

    /**
     * Creates a unique key for an element
     * @param {Element} element - The element
     * @returns {string} - Unique key
     */
    getElementKey(element) {
        if (!element._eventManagerKey) {
            element._eventManagerKey = `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.bound.set(element._eventManagerKey, element);
        }
        return element._eventManagerKey;
    }

    /**
     * Gets element from its unique key
     * @param {string} key - The element key
     * @returns {Element|null} - The element or null if not found
     */
    getElementFromKey(key) {
        return this.bound.get(key) || null;
    }

    /**
     * Binds a method to an object context
     * @param {Object} context - The object context
     * @param {string} methodName - The method name
     * @returns {Function} - Bound function
     */
    bind(context, methodName) {
        const key = `${context.constructor.name}_${methodName}`;
        
        if (!this.bound.has(key)) {
            this.bound.set(key, context[methodName].bind(context));
        }
        
        return this.bound.get(key);
    }

    /**
     * Debounces a function to prevent excessive calls
     * @param {Function} func - The function to debounce
     * @param {number} wait - The debounce delay in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttles a function to limit execution frequency
     * @param {Function} func - The function to throttle
     * @param {number} limit - The throttle limit in milliseconds
     * @returns {Function} - Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
} 
/**
 * ORGANIX Neural Interface - Event Bus
 * 
 * Implements a publish/subscribe (pub/sub) event bus for decoupled
 * communication between components in the ORGANIX application.
 */

export class EventBus {
    constructor() {
        // Map of event names to arrays of subscriber callbacks
        this.subscribers = new Map();
        
        // Event history for debugging
        this.eventHistory = [];
        this.maxHistoryLength = 100;
        this.debugMode = false;
        
        console.log('Event Bus initialized');
    }
    
    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event to subscribe to
     * @param {Function} callback - Callback function to be called when the event is published
     * @returns {Function} Unsubscribe function
     */
    subscribe(eventName, callback) {
        if (!this.subscribers.has(eventName)) {
            this.subscribers.set(eventName, []);
        }
        
        const subscribers = this.subscribers.get(eventName);
        subscribers.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = subscribers.indexOf(callback);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
        };
    }
    
    /**
     * Publish an event
     * @param {string} eventName - Name of the event to publish
     * @param {...any} args - Arguments to pass to subscribers
     */
    publish(eventName, ...args) {
        // Log event in history
        if (this.debugMode) {
            this.logEvent(eventName, args);
        }
        
        // If no subscribers, return
        if (!this.subscribers.has(eventName)) {
            return;
        }
        
        // Call all subscribers
        const subscribers = this.subscribers.get(eventName);
        for (const callback of subscribers) {
            try {
                callback(...args);
            } catch (error) {
                console.error(`Error in event handler for ${eventName}:`, error);
            }
        }
    }
    
    /**
     * Unsubscribe all callbacks for an event
     * @param {string} eventName - Name of the event to unsubscribe from
     */
    unsubscribeAll(eventName) {
        if (this.subscribers.has(eventName)) {
            this.subscribers.delete(eventName);
        }
    }
    
    /**
     * Check if an event has subscribers
     * @param {string} eventName - Name of the event to check
     * @returns {boolean} True if the event has subscribers
     */
    hasSubscribers(eventName) {
        return this.subscribers.has(eventName) && this.subscribers.get(eventName).length > 0;
    }
    
    /**
     * Get the number of subscribers for an event
     * @param {string} eventName - Name of the event to check
     * @returns {number} Number of subscribers
     */
    subscriberCount(eventName) {
        if (!this.subscribers.has(eventName)) {
            return 0;
        }
        
        return this.subscribers.get(eventName).length;
    }
    
    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Whether to enable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
    
    /**
     * Log an event to the history
     * @param {string} eventName - Name of the event
     * @param {Array} args - Event arguments
     */
    logEvent(eventName, args) {
        // Add event to history
        this.eventHistory.push({
            eventName,
            args,
            timestamp: new Date()
        });
        
        // Trim history if it exceeds max length
        if (this.eventHistory.length > this.maxHistoryLength) {
            this.eventHistory.shift();
        }
        
        // Log to console in debug mode
        console.log(`[EventBus] ${eventName}:`, ...args);
    }
    
    /**
     * Get the event history
     * @returns {Array} Event history
     */
    getEventHistory() {
        return [...this.eventHistory];
    }
    
    /**
     * Clear the event history
     */
    clearEventHistory() {
        this.eventHistory = [];
    }
}

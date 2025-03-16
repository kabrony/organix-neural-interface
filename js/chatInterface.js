/**
 * ORGANIX Neural Interface - Enhanced Chat Interface
 * 
 * Manages the neural chat interface, handling message display, formatting,
 * animations, and user interactions with a cyberpunk aesthetic.
 */

export class ChatInterface {
    constructor(eventBus) {
        this.eventBus = eventBus;
        
        // Element references
        this.messagesContainer = document.getElementById('messages-container');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-btn');
        this.clearButton = document.getElementById('clear-chat');
        
        // State management
        this.messageHistory = [];
        this.typingIndicator = null;
        this.typingTimeout = null;
        this.maxMessages = 100; // Prevent excessive message buildup
        
        // Auto-scroll management
        this.isScrolledToBottom = true;
        this.lastScrollTop = 0;
        
        // Initialize
        this.initialize();
    }
    
    /**
     * Initialize the chat interface
     */
    initialize() {
        // Setup event listeners
        this.setupEventListeners();
        
        // Subscribe to external events
        this.subscribeToEvents();
        
        console.log('Neural Chat Interface initialized');
    }
    
    /**
     * Setup DOM event listeners
     */
    setupEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key (without shift)
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Adjust textarea height based on content
        this.userInput.addEventListener('input', () => this.autoResizeTextarea());
        
        // Clear chat history
        this.clearButton.addEventListener('click', () => this.clearChat());
        
        // Track scroll position to manage auto-scrolling
        this.messagesContainer.addEventListener('scroll', () => {
            // Check if scrolled to bottom (with small tolerance)
            const scrollTop = this.messagesContainer.scrollTop;
            const scrollHeight = this.messagesContainer.scrollHeight;
            const clientHeight = this.messagesContainer.clientHeight;
            
            this.isScrolledToBottom = Math.abs((scrollTop + clientHeight) - scrollHeight) < 10;
            this.lastScrollTop = scrollTop;
        });
    }
    
    /**
     * Subscribe to external events via event bus
     */
    subscribeToEvents() {
        // Subscribe to MCP message events
        this.eventBus.subscribe('mcp:message', (message) => this.addMessage(message));
        
        // Subscribe to typing indicator events
        this.eventBus.subscribe('mcp:typingStart', () => this.showTypingIndicator());
        this.eventBus.subscribe('mcp:typingEnd', () => this.hideTypingIndicator());
        
        // Subscribe to object query events (when user clicks an object)
        this.eventBus.subscribe('mcp:objectQuery', (data) => {
            // Add an automatic message about the object
            this.addMessage({
                role: 'user',
                content: data.query,
                timestamp: new Date().toISOString(),
                isAutomatic: true
            });
        });
    }
    
    /**
     * Resize textarea based on content
     */
    autoResizeTextarea() {
        const textarea = this.userInput;
        
        // Reset height to auto to get correct scrollHeight
        textarea.style.height = 'auto';
        
        // Set height based on scrollHeight (with max height)
        const newHeight = Math.min(textarea.scrollHeight, 200);
        textarea.style.height = `${newHeight}px`;
    }
    
    /**
     * Send a message from the user
     */
    sendMessage() {
        const content = this.userInput.value.trim();
        
        if (!content) return;
        
        // Create message object
        const message = {
            role: 'user',
            content,
            timestamp: new Date().toISOString()
        };
        
        // Add to UI
        this.addMessage(message);
        
        // Clear input
        this.userInput.value = '';
        this.autoResizeTextarea();
        
        // Publish event
        this.eventBus.publish('ui:sendMessage', content);
    }
    
    /**
     * Add a message to the chat interface
     * @param {Object} message - Message object
     */
    addMessage(message) {
        // Add to history
        this.messageHistory.push(message);
        
        // Trim history if needed
        if (this.messageHistory.length > this.maxMessages) {
            this.messageHistory.shift();
            
            // Remove oldest message from DOM if it exists
            if (this.messagesContainer.children.length > this.maxMessages) {
                this.messagesContainer.removeChild(this.messagesContainer.children[0]);
            }
        }
        
        // Create message container
        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${message.role}-message-container`;
        
        // Add header with avatar and info
        let headerContent = '';
        if (message.role === 'user') {
            headerContent = `
                <span>You</span>
                <span class="message-timestamp">${this.formatTimestamp(message.timestamp)}</span>
                <div class="message-avatar">
                    <iconify-icon icon="ph:user" width="16"></iconify-icon>
                </div>
            `;
        } else if (message.role === 'assistant') {
            headerContent = `
                <div class="message-avatar">
                    <iconify-icon icon="ph:robot" width="16"></iconify-icon>
                </div>
                <span>Claude</span>
                <span class="message-timestamp">${this.formatTimestamp(message.timestamp)}</span>
            `;
        }
        
        // Create header if not a system message
        if (message.role !== 'system') {
            const messageHeader = document.createElement('div');
            messageHeader.className = 'message-header';
            messageHeader.innerHTML = headerContent;
            messageContainer.appendChild(messageHeader);
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role}-message`;
        
        // Format and apply content
        messageElement.innerHTML = this.formatMessageContent(message.content);
        
        // Add to container
        messageContainer.appendChild(messageElement);
        
        // Add action buttons for non-system messages
        if (message.role !== 'system') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            // Different actions based on message role
            if (message.role === 'assistant') {
                actionsDiv.innerHTML = `
                    <button class="action-button" data-action="copy" title="Copy to clipboard">
                        <iconify-icon icon="ph:copy" width="16"></iconify-icon>
                    </button>
                    <button class="action-button" data-action="visualize" title="Visualize this concept">
                        <iconify-icon icon="ph:chart-scatter" width="16"></iconify-icon>
                    </button>
                `;
            } else if (message.role === 'user') {
                actionsDiv.innerHTML = `
                    <button class="action-button" data-action="edit" title="Edit message">
                        <iconify-icon icon="ph:pencil-simple" width="16"></iconify-icon>
                    </button>
                `;
            }
            
            // Add action listeners
            actionsDiv.querySelectorAll('.action-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const action = button.getAttribute('data-action');
                    this.handleMessageAction(action, message, messageElement);
                });
            });
            
            messageContainer.appendChild(actionsDiv);
        }
        
        // Add to DOM
        this.messagesContainer.appendChild(messageContainer);
        
        // Scroll to bottom if already at bottom or if it's a user message
        if (this.isScrolledToBottom || message.role === 'user') {
            this.scrollToBottom();
        }
    }
    
    /**
     * Format message timestamp
     * @param {string} timestamp - ISO timestamp
     * @returns {string} Formatted time
     */
    formatTimestamp(timestamp) {
        if (!timestamp) return '';
        
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting timestamp:', error);
            return '';
        }
    }
    
    /**
     * Format message content with Markdown-like syntax
     * @param {string} content - Message content
     * @returns {string} Formatted HTML
     */
    formatMessageContent(content) {
        if (!content) return '';
        
        // Convert code blocks
        content = content.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Convert inline code
        content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert line breaks
        content = content.replace(/\n/g, '<br>');
        
        return content;
    }
    
    /**
     * Handle message actions (copy, visualize, edit)
     * @param {string} action - Action type
     * @param {Object} message - Message object
     * @param {HTMLElement} element - Message element
     */
    handleMessageAction(action, message, element) {
        switch (action) {
            case 'copy':
                // Copy message content to clipboard
                navigator.clipboard.writeText(message.content)
                    .then(() => {
                        // Show brief confirmation
                        this.showNotification('info', 'Message copied to clipboard');
                    })
                    .catch(err => {
                        console.error('Failed to copy:', err);
                        this.showNotification('error', 'Could not copy text');
                    });
                break;
                
            case 'visualize':
                // Trigger visualization event
                this.eventBus.publish('ui:visualizeConcept', message.content);
                break;
                
            case 'edit':
                // Put message content into input field
                this.userInput.value = message.content;
                this.userInput.focus();
                this.autoResizeTextarea();
                break;
        }
    }
    
    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        // Remove existing typing indicator if present
        this.hideTypingIndicator();
        
        // Create typing indicator container
        const container = document.createElement('div');
        container.className = 'message-container assistant-message-container';
        container.id = 'typing-indicator-container';
        
        // Create header with avatar
        const header = document.createElement('div');
        header.className = 'message-header';
        header.innerHTML = `
            <div class="message-avatar">
                <iconify-icon icon="ph:robot" width="16"></iconify-icon>
            </div>
            <span>Claude</span>
        `;
        
        // Create typing indicator message
        const indicator = document.createElement('div');
        indicator.className = 'message assistant-message typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            Claude is typing
            <span class="typing-dots">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </span>
        `;
        
        // Add to container
        container.appendChild(header);
        container.appendChild(indicator);
        
        // Add to DOM
        this.messagesContainer.appendChild(container);
        
        // Store reference
        this.typingIndicator = container;
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Set a maximum timeout for typing indicator (in case it gets stuck)
        this.typingTimeout = setTimeout(() => {
            this.hideTypingIndicator();
        }, 30000);
    }
    
    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        if (this.typingIndicator) {
            this.messagesContainer.removeChild(this.typingIndicator);
            this.typingIndicator = null;
        }
        
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }
    }
    
    /**
     * Clear chat history
     */
    clearChat() {
        // Ask for confirmation
        if (confirm('Are you sure you want to clear the chat history?')) {
            // Clear message history
            this.messageHistory = [];
            
            // Clear DOM elements (except welcome message)
            while (this.messagesContainer.children.length > 1) {
                this.messagesContainer.removeChild(this.messagesContainer.lastChild);
            }
            
            // Show system message
            this.addMessage({
                role: 'system',
                content: 'Chat history has been cleared.',
                timestamp: new Date().toISOString()
            });
            
            // Publish event
            this.eventBus.publish('ui:chatCleared');
        }
    }
    
    /**
     * Scroll to bottom of messages container
     */
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    /**
     * Show a notification
     * @param {string} type - Notification type
     * @param {string} message - Notification message
     */
    showNotification(type, message) {
        this.eventBus.publish('ui:notification', {
            type,
            message,
            duration: 3000
        });
    }
}

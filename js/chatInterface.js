/**
 * ORGANIX Neural Interface - Advanced Chat Interface
 * Handles all UI interactions with the Claude chat interface
 */

export class ChatInterface {
    constructor(eventBus) {
        this.eventBus = eventBus;
        
        // Cache DOM elements
        this.elements = {
            messagesContainer: document.getElementById('messages-container'),
            userInput: document.getElementById('user-input'),
            sendButton: document.getElementById('send-btn'),
            clearChat: document.getElementById('clear-chat')
        };
        
        // Message history
        this.messageHistory = [];
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Subscribe to MCP events
        this.initEventSubscriptions();
        
        console.log('Chat Interface initialized');
    }
    
    /**
     * Initialize UI event listeners
     */
    initEventListeners() {
        // Send button click
        this.elements.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter key press in input field
        this.elements.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea as user types
        this.elements.userInput.addEventListener('input', () => this.autoResizeTextarea());
        
        // Clear chat button
        this.elements.clearChat.addEventListener('click', () => this.clearChat());
    }
    
    /**
     * Initialize event bus subscriptions
     */
    initEventSubscriptions() {
        // Listen for incoming messages from MCP
        this.eventBus.subscribe('mcp:message', (message) => this.displayMessage(message));
        
        // Listen for typing indicators
        this.eventBus.subscribe('mcp:typingStart', () => this.showTypingIndicator());
        this.eventBus.subscribe('mcp:typingEnd', () => this.hideTypingIndicator());
    }
    
    /**
     * Send a message from the user
     */
    sendMessage() {
        const messageContent = this.elements.userInput.value.trim();
        
        if (!messageContent) return;
        
        // Create user message object
        const message = {
            role: 'user',
            content: messageContent,
            timestamp: new Date().toISOString()
        };
        
        // Add to UI
        this.displayMessage(message);
        
        // Clear input
        this.elements.userInput.value = '';
        this.elements.userInput.style.height = 'auto';
        
        // Send to event bus for MCP handling
        this.eventBus.publish('ui:sendMessage', messageContent);
        
        // Add to history
        this.messageHistory.push(message);
    }
    
    /**
     * Display a message in the chat interface
     * @param {Object} message - Message object with role, content and timestamp
     */
    displayMessage(message) {
        // Create message container
        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${message.role}-message-container`;
        
        // Create message header with avatar and role
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        // Add avatar
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        // Add different icons based on role
        let iconName = 'user';
        if (message.role === 'assistant') {
            iconName = 'robot';
        } else if (message.role === 'system') {
            iconName = 'info';
        }
        
        avatar.innerHTML = `<iconify-icon icon="ph:${iconName}" width="16"></iconify-icon>`;
        messageHeader.appendChild(avatar);
        
        // Add name
        const name = document.createElement('span');
        name.textContent = message.role === 'assistant' ? 'Claude' : 
                          message.role === 'user' ? 'You' : 'System';
        messageHeader.appendChild(name);
        
        // Add timestamp if available
        if (message.timestamp) {
            const timestamp = document.createElement('span');
            timestamp.className = 'message-timestamp';
            timestamp.textContent = this.formatTimestamp(message.timestamp);
            messageHeader.appendChild(timestamp);
        }
        
        messageContainer.appendChild(messageHeader);
        
        // Create message content
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role}-message`;
        
        // Process message content (handle markdown, code blocks, etc.)
        messageElement.innerHTML = this.processMessageContent(message.content);
        
        messageContainer.appendChild(messageElement);
        
        // Add action buttons if not system message
        if (message.role !== 'system') {
            const actionsElement = document.createElement('div');
            actionsElement.className = 'message-actions';
            
            // Copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'action-button';
            copyButton.innerHTML = '<iconify-icon icon="ph:copy" width="14"></iconify-icon> Copy';
            copyButton.addEventListener('click', () => this.copyToClipboard(message.content));
            
            actionsElement.appendChild(copyButton);
            
            messageContainer.appendChild(actionsElement);
        }
        
        // Add to messages container
        this.elements.messagesContainer.appendChild(messageContainer);
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    /**
     * Process message content to handle special formatting
     * @param {string} content - Raw message content
     * @returns {string} - Processed HTML content
     */
    processMessageContent(content) {
        // Simple MD-like processing
        let processed = content;
        
        // Convert code blocks with ```
        processed = processed.replace(/```(\w*)([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
        
        // Convert inline code with `
        processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert bold with **
        processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Convert italic with *
        processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Convert URLs to links
        processed = processed.replace(
            /(https?:\/\/[^\s]+)/g, 
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        return processed;
    }
    
    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        // Remove existing indicator if any
        this.hideTypingIndicator();
        
        // Create typing container
        const typingContainer = document.createElement('div');
        typingContainer.className = 'message-container assistant-message-container';
        typingContainer.id = 'typing-indicator-container';
        
        // Add header with avatar
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<iconify-icon icon="ph:robot" width="16"></iconify-icon>';
        messageHeader.appendChild(avatar);
        
        const name = document.createElement('span');
        name.textContent = 'Claude';
        messageHeader.appendChild(name);
        
        typingContainer.appendChild(messageHeader);
        
        // Create typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message assistant-message typing-indicator';
        typingIndicator.textContent = 'Thinking...';
        
        // Add animated dots
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'typing-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            dotsContainer.appendChild(dot);
        }
        
        typingIndicator.appendChild(dotsContainer);
        typingContainer.appendChild(typingIndicator);
        
        // Add to messages container
        this.elements.messagesContainer.appendChild(typingContainer);
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator-container');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    /**
     * Format timestamp into a human-readable format
     * @param {string} timestamp - ISO timestamp
     * @returns {string} - Formatted time
     */
    formatTimestamp(timestamp) {
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '';
        }
    }
    
    /**
     * Scroll messages container to bottom
     */
    scrollToBottom() {
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }
    
    /**
     * Auto-resize textarea based on content
     */
    autoResizeTextarea() {
        const textarea = this.elements.userInput;
        
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        
        // Set height based on scrollHeight (with max-height limit applied via CSS)
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     */
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            // Show temporary success notification
            this.eventBus.publish('ui:notification', {
                type: 'success',
                message: 'Copied to clipboard',
                duration: 2000
            });
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            this.eventBus.publish('ui:notification', {
                type: 'error',
                message: 'Failed to copy to clipboard',
                duration: 3000
            });
        });
    }
    
    /**
     * Clear chat history
     */
    clearChat() {
        // Ask for confirmation
        if (confirm('Are you sure you want to clear the chat history?')) {
            // Remove all messages except the welcome message
            while (this.elements.messagesContainer.childNodes.length > 1) {
                this.elements.messagesContainer.removeChild(
                    this.elements.messagesContainer.lastChild
                );
            }
            
            // Clear message history array
            this.messageHistory = [];
            
            // Notify about cleared chat
            this.eventBus.publish('ui:notification', {
                type: 'info',
                message: 'Chat history cleared',
                duration: 2000
            });
        }
    }
}

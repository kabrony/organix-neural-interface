/**
 * ORGANIX Neural Interface - Enhanced Chat Interface
 * 
 * Provides advanced chat functionality for the ORGANIX dashboard,
 * with modern UI features and integration with the 3D visualization.
 */

export class ChatInterface {
    constructor(eventBus, mcpConnector) {
        this.eventBus = eventBus;
        this.mcpConnector = mcpConnector;
        
        // DOM elements
        this.elements = {
            messagesContainer: document.getElementById('messages-container'),
            userInput: document.getElementById('user-input'),
            sendButton: document.getElementById('send-btn'),
            clearButton: document.querySelector('#clear-chat') || null,
            claudePanel: document.getElementById('claude-panel')
        };
        
        // Chat state
        this.messageHistory = [];
        this.isTyping = false;
        this.typingTimeout = null;
        
        // Initialize
        this.initialize();
        
        console.log('Chat Interface initialized');
    }
    
    /**
     * Initialize the chat interface
     */
    initialize() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Subscribe to event bus events
        this.setupEventBusListeners();
    }
    
    /**
     * Set up DOM event listeners
     */
    setupEventListeners() {
        // Send message on button click
        if (this.elements.sendButton) {
            this.elements.sendButton.addEventListener('click', () => this.sendMessage());
        }
        
        // Send message on Enter key (but not with Shift+Enter)
        if (this.elements.userInput) {
            this.elements.userInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    this.sendMessage();
                }
                
                // Auto-resize textarea
                this.autoResizeTextarea();
            });
            
            // Input change event for auto-resize
            this.elements.userInput.addEventListener('input', () => this.autoResizeTextarea());
        }
        
        // Clear chat history
        if (this.elements.clearButton) {
            this.elements.clearButton.addEventListener('click', () => this.clearChat());
        }
    }
    
    /**
     * Auto-resize the textarea based on content
     */
    autoResizeTextarea() {
        const textarea = this.elements.userInput;
        if (!textarea) return;
        
        // Reset height to measure the scrollHeight correctly
        textarea.style.height = 'auto';
        
        // Set new height (with min and max constraints handled in CSS)
        const newHeight = Math.min(Math.max(60, textarea.scrollHeight), 200);
        textarea.style.height = newHeight + 'px';
    }
    
    /**
     * Set up event bus listeners
     */
    setupEventBusListeners() {
        // Listen for incoming messages from MCP
        this.eventBus.subscribe('mcp:message', (message) => this.displayMessage(message));
        
        // Listen for typing indicator events
        this.eventBus.subscribe('mcp:typingStart', () => this.showTypingIndicator());
        this.eventBus.subscribe('mcp:typingEnd', () => this.hideTypingIndicator());
        
        // Listen for object query events
        this.eventBus.subscribe('mcp:objectQuery', (data) => {
            // When user clicks "Ask Claude About This" on an object
            this.elements.userInput.value = data.query;
            this.autoResizeTextarea();
        });
    }
    
    /**
     * Send a message from the user input
     */
    sendMessage() {
        const message = this.elements.userInput.value.trim();
        
        if (!message) return;
        
        // Display the user message immediately
        this.displayMessage({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });
        
        // Clear the input
        this.elements.userInput.value = '';
        this.autoResizeTextarea();
        
        // Send to MCPConnector (which will handle the response)
        this.eventBus.publish('ui:sendMessage', message);
    }
    
    /**
     * Display a message in the chat
     * @param {Object} message - Message object with role, content, timestamp
     */
    displayMessage(message) {
        // Create message container
        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${message.role}-message-container`;
        
        // Create message header with avatar and role
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        // Avatar with icon
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        // Different icons based on role
        let iconName = 'user';
        if (message.role === 'assistant') iconName = 'robot';
        else if (message.role === 'system') iconName = 'info';
        
        avatar.innerHTML = `<iconify-icon icon="ph:${iconName}" width="16"></iconify-icon>`;
        
        // Role name
        const roleName = document.createElement('span');
        roleName.textContent = message.role === 'user' ? 'You' : 
                               message.role === 'assistant' ? 'Claude' : 'System';
        
        // Timestamp if available
        if (message.timestamp) {
            const timestamp = document.createElement('span');
            timestamp.className = 'message-timestamp';
            const date = new Date(message.timestamp);
            timestamp.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            messageHeader.appendChild(timestamp);
        }
        
        // Assemble header based on role
        if (message.role === 'user') {
            messageHeader.appendChild(roleName);
            messageHeader.appendChild(avatar);
        } else {
            messageHeader.appendChild(avatar);
            messageHeader.appendChild(roleName);
        }
        
        // Create message content
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role}-message`;
        
        // Process message content - handle markdown-style code blocks
        const formattedContent = this.formatMessageContent(message.content);
        messageElement.innerHTML = formattedContent;
        
        // Add message actions for non-system messages
        if (message.role !== 'system') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            // Copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'action-button';
            copyButton.innerHTML = '<iconify-icon icon="ph:copy" width="14"></iconify-icon> Copy';
            copyButton.addEventListener('click', () => this.copyMessageToClipboard(message.content));
            
            actionsDiv.appendChild(copyButton);
            messageContainer.appendChild(actionsDiv);
        }
        
        // Assemble and add to chat
        messageContainer.appendChild(messageHeader);
        messageContainer.appendChild(messageElement);
        
        this.elements.messagesContainer.appendChild(messageContainer);
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Store in message history
        this.messageHistory.push(message);
    }
    
    /**
     * Format message content with markdown-style parsing
     * @param {string} content - Raw message content
     * @returns {string} Formatted HTML
     */
    formatMessageContent(content) {
        // Handle code blocks with ```
        content = content.replace(/```([a-z]*)\n([\s\S]*?)```/g, (match, language, code) => {
            return `<pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>`;
        });
        
        // Handle inline code with `code`
        content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Handle paragraphs
        content = content.split('\n\n').map(para => `<p>${para}</p>`).join('');
        
        // Replace newlines with <br> for line breaks within paragraphs
        content = content.replace(/\n/g, '<br>');
        
        return content;
    }
    
    /**
     * Escape HTML special characters
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    /**
     * Copy message content to clipboard
     * @param {string} content - Message content to copy
     */
    copyMessageToClipboard(content) {
        navigator.clipboard.writeText(content).then(
            () => {
                this.showNotification('Copied to clipboard', 'success');
            },
            (err) => {
                console.error('Could not copy text: ', err);
                this.showNotification('Failed to copy', 'error');
            }
        );
    }
    
    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        // Remove existing typing indicator if any
        this.hideTypingIndicator();
        
        // Create typing indicator container
        const messageContainer = document.createElement('div');
        messageContainer.className = 'message-container assistant-message-container';
        messageContainer.id = 'typing-indicator-container';
        
        // Create message header with avatar and role
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<iconify-icon icon="ph:robot" width="16"></iconify-icon>';
        
        const roleName = document.createElement('span');
        roleName.textContent = 'Claude';
        
        messageHeader.appendChild(avatar);
        messageHeader.appendChild(roleName);
        
        // Create typing indicator element
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message assistant-message typing-indicator';
        typingIndicator.textContent = 'Claude is typing';
        
        // Add animated dots
        const typingDots = document.createElement('div');
        typingDots.className = 'typing-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingDots.appendChild(dot);
        }
        
        typingIndicator.appendChild(typingDots);
        
        // Assemble and add to chat
        messageContainer.appendChild(messageHeader);
        messageContainer.appendChild(typingIndicator);
        
        this.elements.messagesContainer.appendChild(messageContainer);
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Set state
        this.isTyping = true;
    }
    
    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator-container');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        this.isTyping = false;
    }
    
    /**
     * Clear chat history
     */
    clearChat() {
        // Ask for confirmation
        if (confirm('Are you sure you want to clear the chat history?')) {
            // Keep only the first welcome message
            const firstChild = this.elements.messagesContainer.firstChild;
            this.elements.messagesContainer.innerHTML = '';
            
            if (firstChild) {
                this.elements.messagesContainer.appendChild(firstChild);
            }
            
            // Clear message history (but keep the welcome message if exists)
            this.messageHistory = this.messageHistory.length > 0 ? 
                [this.messageHistory[0]] : [];
            
            // Show notification
            this.showNotification('Chat history cleared', 'info');
        }
    }
    
    /**
     * Show a notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (info, success, warning, error)
     */
    showNotification(message, type = 'info') {
        this.eventBus.publish('ui:notification', {
            message,
            type,
            duration: 3000
        });
    }
    
    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        if (this.elements.messagesContainer) {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }
    }
}

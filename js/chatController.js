/**
 * ORGANIX Neural Interface - Chat Controller
 * 
 * Manages the enhanced AI chat interface, providing improved message
 * rendering, animations, and interaction with the neural visualization.
 */

export class ChatController {
    constructor(eventBus, mcpConnector) {
        this.eventBus = eventBus;
        this.mcpConnector = mcpConnector;
        
        // Chat elements
        this.elements = {
            messagesContainer: document.getElementById('messages-container'),
            userInput: document.getElementById('user-input'),
            sendButton: document.getElementById('send-btn'),
            clearButton: document.getElementById('clear-chat')
        };
        
        // Message history
        this.messageHistory = [];
        
        // Initialize
        this.initialize();
        
        console.log('Chat Controller initialized');
    }
    
    /**
     * Initialize the chat controller
     */
    initialize() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up event bus subscriptions
        this.setupEventBusSubscriptions();
        
        // Load chat history if available
        this.loadChatHistory();
        
        // Auto-focus input field
        setTimeout(() => {
            this.elements.userInput.focus();
        }, 1000);
    }
    
    /**
     * Set up DOM event listeners
     */
    setupEventListeners() {
        // Send button click
        this.elements.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key in input field
        this.elements.userInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize input field
        this.elements.userInput.addEventListener('input', () => {
            this.autoResizeInput();
        });
        
        // Clear chat history
        this.elements.clearButton.addEventListener('click', () => {
            this.clearChatHistory();
        });
    }
    
    /**
     * Set up event bus subscriptions
     */
    setupEventBusSubscriptions() {
        // Subscribe to MCP messages
        this.eventBus.subscribe('mcp:message', (message) => {
            this.addMessage(message);
        });
        
        // Subscribe to typing indicators
        this.eventBus.subscribe('mcp:typingStart', () => {
            this.showTypingIndicator();
        });
        
        this.eventBus.subscribe('mcp:typingEnd', () => {
            this.hideTypingIndicator();
        });
        
        // Subscribe to connection status changes
        this.eventBus.subscribe('mcp:statusChange', (data) => {
            if (data.status === 'connected') {
                this.addSystemMessage('Connected to Claude via MCP');
            } else if (data.status === 'disconnected') {
                this.addSystemMessage('Disconnected from Claude');
            }
        });
        
        // Subscribe to object query events
        this.eventBus.subscribe('mcp:objectQuery', (data) => {
            this.addUserMessage(data.query);
        });
    }
    
    /**
     * Send a message from the user
     */
    sendMessage() {
        const message = this.elements.userInput.value.trim();
        
        if (message === '') return;
        
        // Add message to UI
        this.addUserMessage(message);
        
        // Clear input
        this.elements.userInput.value = '';
        this.autoResizeInput();
        
        // Send to MCP
        this.eventBus.publish('ui:sendMessage', message);
        
        // Focus input field
        this.elements.userInput.focus();
    }
    
    /**
     * Add a user message to the chat
     * @param {string} text - Message text
     */
    addUserMessage(text) {
        const message = {
            role: 'user',
            content: text,
            timestamp: new Date().toISOString()
        };
        
        // Add to history
        this.messageHistory.push(message);
        
        // Add to UI
        this.renderMessage(message);
        
        // Save history
        this.saveChatHistory();
    }
    
    /**
     * Add a message to the chat
     * @param {object} message - Message object
     */
    addMessage(message) {
        // Add to history if not a typing indicator
        if (!message.isTyping) {
            this.messageHistory.push(message);
            this.saveChatHistory();
        }
        
        // Add to UI
        this.renderMessage(message);
    }
    
    /**
     * Add a system message to the chat
     * @param {string} text - Message text
     * @param {string} type - Message type (info, warning, error, success)
     */
    addSystemMessage(text, type = 'info') {
        const message = {
            role: 'system',
            content: text,
            type: type,
            timestamp: new Date().toISOString()
        };
        
        // Add to history
        this.messageHistory.push(message);
        
        // Add to UI
        this.renderMessage(message);
        
        // Save history
        this.saveChatHistory();
    }
    
    /**
     * Render a message in the chat
     * @param {object} message - Message object
     */
    renderMessage(message) {
        const container = document.createElement('div');
        
        if (message.isTyping) {
            // Render typing indicator
            container.className = 'message-container assistant-message-container';
            container.innerHTML = `
                <div class="message-header">
                    <div class="message-avatar">
                        <iconify-icon icon="ph:robot" width="16"></iconify-icon>
                    </div>
                    <span>Claude</span>
                </div>
                <div class="message assistant-message typing-indicator">
                    Claude is thinking...
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            `;
            container.id = 'typing-indicator';
        } else if (message.role === 'user') {
            // Render user message
            container.className = 'message-container user-message-container';
            
            // Format message content with markdown
            const formattedContent = this.formatMessageContent(message.content);
            
            container.innerHTML = `
                <div class="message-header">
                    <span>You</span>
                    <div class="message-avatar">
                        <iconify-icon icon="ph:user" width="16"></iconify-icon>
                    </div>
                </div>
                <div class="message user-message">
                    ${formattedContent}
                </div>
                <div class="message-actions">
                    <button class="action-button edit-message" title="Edit message">
                        <iconify-icon icon="ph:pencil-simple" width="14"></iconify-icon>
                    </button>
                </div>
            `;
            
            // Add event listener to edit button
            const editButton = container.querySelector('.edit-message');
            if (editButton) {
                editButton.addEventListener('click', () => {
                    this.editMessage(message);
                });
            }
        } else if (message.role === 'assistant') {
            // Render assistant message
            container.className = 'message-container assistant-message-container';
            
            // Format message content with markdown
            const formattedContent = this.formatMessageContent(message.content);
            
            container.innerHTML = `
                <div class="message-header">
                    <div class="message-avatar">
                        <iconify-icon icon="ph:robot" width="16"></iconify-icon>
                    </div>
                    <span>Claude</span>
                </div>
                <div class="message assistant-message">
                    ${formattedContent}
                </div>
                <div class="message-actions">
                    <button class="action-button copy-message" title="Copy to clipboard">
                        <iconify-icon icon="ph:copy" width="14"></iconify-icon>
                    </button>
                </div>
            `;
            
            // Add event listener to copy button
            const copyButton = container.querySelector('.copy-message');
            if (copyButton) {
                copyButton.addEventListener('click', () => {
                    this.copyToClipboard(message.content);
                });
            }
        } else if (message.role === 'system') {
            // Render system message
            container.className = 'message-container system-message-container';
            container.innerHTML = `
                <div class="message system-message ${message.type || ''}">
                    ${message.content}
                </div>
            `;
        }
        
        // Add to messages container
        this.elements.messagesContainer.appendChild(container);
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    /**
     * Format message content with simple markdown-like formatting
     * @param {string} content - Raw message content
     * @returns {string} Formatted HTML
     */
    formatMessageContent(content) {
        if (!content) return '';
        
        // Escape HTML
        let formatted = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Format code blocks (```code```)
        formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
            return `<pre><code>${code.trim()}</code></pre>`;
        });
        
        // Format inline code (`code`)
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Format bold (**text**)
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Format italic (*text*)
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Convert line breaks to <br>
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }
    
    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        // Check if typing indicator already exists
        const existingIndicator = document.getElementById('typing-indicator');
        if (existingIndicator) return;
        
        // Create typing indicator
        const typingMessage = {
            role: 'assistant',
            isTyping: true
        };
        
        this.renderMessage(typingMessage);
    }
    
    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    /**
     * Auto-resize input field based on content
     */
    autoResizeInput() {
        const input = this.elements.userInput;
        
        // Reset height to calculate proper scrollHeight
        input.style.height = 'auto';
        
        // Calculate new height (with a max height)
        const newHeight = Math.min(input.scrollHeight, 200);
        
        // Set new height
        input.style.height = `${newHeight}px`;
    }
    
    /**
     * Scroll messages container to bottom
     */
    scrollToBottom() {
        const container = this.elements.messagesContainer;
        container.scrollTop = container.scrollHeight;
    }
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     */
    copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                // Show copy success notification
                this.eventBus.publish('ui:notification', {
                    type: 'success',
                    message: 'Copied to clipboard',
                    duration: 2000
                });
            })
            .catch(error => {
                console.error('Failed to copy text:', error);
                
                // Show copy error notification
                this.eventBus.publish('ui:notification', {
                    type: 'error',
                    message: 'Failed to copy to clipboard',
                    duration: 3000
                });
            });
    }
    
    /**
     * Edit a user message
     * @param {object} message - Message to edit
     */
    editMessage(message) {
        // Set message text in input field
        this.elements.userInput.value = message.content;
        
        // Focus input
        this.elements.userInput.focus();
        
        // Auto-resize input
        this.autoResizeInput();
        
        // Scroll input into view
        this.elements.userInput.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * Save chat history to local storage
     */
    saveChatHistory() {
        try {
            // Limit history to last 50 messages
            const historyToSave = this.messageHistory.slice(-50);
            
            // Save to local storage
            localStorage.setItem('organix-chat-history', JSON.stringify(historyToSave));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }
    
    /**
     * Load chat history from local storage
     */
    loadChatHistory() {
        try {
            // Get history from local storage
            const savedHistory = localStorage.getItem('organix-chat-history');
            
            if (!savedHistory) return;
            
            // Parse history
            const history = JSON.parse(savedHistory);
            
            // Clear existing messages
            this.elements.messagesContainer.innerHTML = '';
            
            // Add each message to the UI
            history.forEach(message => {
                this.messageHistory.push(message);
                this.renderMessage(message);
            });
            
            // Add space after history
            if (history.length > 0) {
                const spacer = document.createElement('div');
                spacer.style.height = '20px';
                this.elements.messagesContainer.appendChild(spacer);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }
    
    /**
     * Clear chat history
     */
    clearChatHistory() {
        // Ask for confirmation
        if (!confirm('Are you sure you want to clear the chat history?')) {
            return;
        }
        
        // Clear history array
        this.messageHistory = [];
        
        // Clear UI
        this.elements.messagesContainer.innerHTML = '';
        
        // Clear local storage
        localStorage.removeItem('organix-chat-history');
        
        // Add welcome message
        this.addMessage({
            role: 'assistant',
            content: 'Welcome to ORGANIX Neural Interface. I\'m connected to this interactive visualization environment that represents my cognitive architecture. Feel free to ask me questions about the different neural components or interact with the 3D elements.',
            timestamp: new Date().toISOString()
        });
        
        // Show notification
        this.eventBus.publish('ui:notification', {
            type: 'info',
            message: 'Chat history cleared',
            duration: 3000
        });
    }
}

/**
 * ORGANIX Neural Interface - Enhanced Chat Interface
 * Handles all chat-related functionality with modern, cyberpunk-inspired features
 */

export class ChatInterface {
    constructor(eventBus, mcpConnector) {
        this.eventBus = eventBus;
        this.mcpConnector = mcpConnector;
        
        // Cache DOM elements
        this.elements = {
            messagesContainer: document.getElementById('messages-container'),
            userInput: document.getElementById('user-input'),
            sendButton: document.getElementById('send-btn'),
            clearChatButton: document.getElementById('clear-chat')
        };
        
        // Chat state
        this.messageHistory = [];
        this.typing = false;
        this.lastMessageTime = Date.now();
        
        // Configuration
        this.config = {
            typingIndicatorDelay: 300,  // ms before showing typing indicator
            maxMessagesDisplayed: 100,  // prevent excessive DOM nodes
            autoScrollThreshold: 100,   // px from bottom to trigger auto-scroll
            messageIdleThreshold: 3000, // ms of inactivity to show pulse hint
            showTimestamps: true,       // display message timestamps
            enableMarkdown: true,       // enable markdown parsing
            enableCodeHighlighting: true, // enable syntax highlighting for code
            messageSounds: true,        // enable sound effects for messages
            messageAnimations: true     // enable animation effects
        };
        
        // Initialize
        this.initialize();
        console.log('Chat Interface initialized');
    }
    
    /**
     * Initialize chat interface
     */
    initialize() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Subscribe to event bus events
        this.setupEventBusSubscriptions();
        
        // Adjust textarea height on input
        this.makeTextareaAutoResize();
        
        // Focus input field
        setTimeout(() => this.elements.userInput.focus(), 1000);
    }
    
    /**
     * Set up DOM event listeners
     */
    setupEventListeners() {
        // Send message on button click
        this.elements.sendButton.addEventListener('click', this.handleSendMessage.bind(this));
        
        // Send message on Enter key (not Shift+Enter)
        this.elements.userInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.handleSendMessage();
            }
        });
        
        // Clear chat history
        this.elements.clearChatButton.addEventListener('click', this.clearChatHistory.bind(this));
        
        // Input activity tracking
        this.elements.userInput.addEventListener('input', this.handleInputChange.bind(this));
        
        // Scroll container tracking for auto-scroll
        this.elements.messagesContainer.addEventListener('scroll', this.handleMessagesScroll.bind(this));
    }
    
    /**
     * Set up event bus subscriptions
     */
    setupEventBusSubscriptions() {
        // Messages from MCP
        this.eventBus.subscribe('mcp:message', this.handleIncomingMessage.bind(this));
        
        // Typing indicators
        this.eventBus.subscribe('mcp:typingStart', this.showTypingIndicator.bind(this));
        this.eventBus.subscribe('mcp:typingEnd', this.hideTypingIndicator.bind(this));
        
        // Object selection events
        this.eventBus.subscribe('scene:objectSelected', this.handleObjectSelected.bind(this));
        
        // Connection status changes
        this.eventBus.subscribe('mcp:statusChange', this.handleMcpStatusChange.bind(this));
    }
    
    /**
     * Make textarea auto-resize based on content
     */
    makeTextareaAutoResize() {
        const textarea = this.elements.userInput;
        
        const adjustHeight = () => {
            // Reset height to auto to get scrollHeight correctly
            textarea.style.height = 'auto';
            
            // Set new height based on scrollHeight (with min/max limits)
            const newHeight = Math.max(60, Math.min(200, textarea.scrollHeight));
            textarea.style.height = `${newHeight}px`;
        };
        
        // Adjust on input
        textarea.addEventListener('input', adjustHeight);
        
        // Initial adjustment
        setTimeout(adjustHeight, 10);
    }
    
    /**
     * Handle user sending a message
     */
    handleSendMessage() {
        const message = this.elements.userInput.value.trim();
        
        if (!message) return;
        
        // Add message to UI first (for responsiveness)
        this.addMessageToUI('user', message);
        
        // Clear input field and reset height
        this.elements.userInput.value = '';
        this.elements.userInput.style.height = '60px';
        
        // Focus back on input
        this.elements.userInput.focus();
        
        // Send message through MCP
        this.eventBus.publish('ui:sendMessage', message);
        
        // Save to message history
        this.messageHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });
        
        // Play send sound
        if (this.config.messageSounds) {
            this.playSound('send');
        }
    }
    
    /**
     * Handle incoming message from MCP
     * @param {Object} message - Message object
     */
    handleIncomingMessage(message) {
        // Add message to UI
        this.addMessageToUI(message.role, message.content, message.timestamp);
        
        // Save to message history if not already there
        const existingMessage = this.messageHistory.find(m => 
            m.role === message.role && 
            m.content === message.content &&
            m.timestamp === message.timestamp
        );
        
        if (!existingMessage) {
            this.messageHistory.push(message);
        }
        
        // Play receive sound
        if (this.config.messageSounds && message.role === 'assistant') {
            this.playSound('receive');
        }
        
        // Track last message time
        this.lastMessageTime = Date.now();
    }
    
    /**
     * Handle input change events
     */
    handleInputChange() {
        // Notify that user is typing (for real-time features)
        this.eventBus.publish('ui:userTyping', {
            active: this.elements.userInput.value.trim().length > 0
        });
    }
    
    /**
     * Handle messages container scroll
     */
    handleMessagesScroll() {
        // If we implement dynamic loading or special scroll behaviors
    }
    
    /**
     * Add a message to the UI
     * @param {string} role - Message role ('user', 'assistant', 'system')
     * @param {string} content - Message content
     * @param {string} [timestamp] - Optional ISO timestamp
     */
    addMessageToUI(role, content, timestamp) {
        // Create container with proper classes
        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${role}-message-container`;
        
        // Create header with role info and timestamp
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        // Add avatar
        const messageAvatar = document.createElement('div');
        messageAvatar.className = 'message-avatar';
        
        // Different icon based on role
        let avatarIcon = '';
        let roleName = '';
        
        switch (role) {
            case 'user':
                avatarIcon = 'ph:user';
                roleName = 'You';
                break;
            case 'assistant':
                avatarIcon = 'ph:robot';
                roleName = 'Claude';
                break;
            case 'system':
                avatarIcon = 'ph:gear';
                roleName = 'System';
                break;
            default:
                avatarIcon = 'ph:chat';
                roleName = 'Message';
        }
        
        messageAvatar.innerHTML = `<iconify-icon icon="${avatarIcon}" width="16"></iconify-icon>`;
        messageHeader.appendChild(messageAvatar);
        
        // Add role name
        const roleElement = document.createElement('span');
        roleElement.textContent = roleName;
        messageHeader.appendChild(roleElement);
        
        // Add timestamp if available and enabled
        if (timestamp && this.config.showTimestamps) {
            const timeElement = document.createElement('span');
            timeElement.className = 'message-timestamp';
            
            // Format timestamp
            const messageDate = new Date(timestamp);
            const timeFormatted = messageDate.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            timeElement.textContent = timeFormatted;
            messageHeader.appendChild(timeElement);
        }
        
        messageContainer.appendChild(messageHeader);
        
        // Create message bubble
        const messageBubble = document.createElement('div');
        messageBubble.className = `message ${role}-message`;
        
        // Process content based on configuration
        let processedContent = content;
        
        if (this.config.enableMarkdown) {
            processedContent = this.processMarkdown(processedContent);
        }
        
        messageBubble.innerHTML = processedContent;
        messageContainer.appendChild(messageBubble);
        
        // Create message actions (only for relevant message types)
        if (role === 'assistant' || role === 'user') {
            const messageActions = document.createElement('div');
            messageActions.className = 'message-actions';
            
            if (role === 'assistant') {
                // Add copy button for assistant messages
                const copyButton = document.createElement('button');
                copyButton.className = 'action-button';
                copyButton.title = 'Copy to clipboard';
                copyButton.innerHTML = '<iconify-icon icon="ph:copy" width="14"></iconify-icon> Copy';
                copyButton.addEventListener('click', () => this.copyMessageToClipboard(content));
                messageActions.appendChild(copyButton);
                
                // Add visualize button for certain keywords
                if (content.toLowerCase().includes('visualization') || 
                    content.toLowerCase().includes('neural') ||
                    content.toLowerCase().includes('network') ||
                    content.toLowerCase().includes('node')) {
                    
                    const visualizeButton = document.createElement('button');
                    visualizeButton.className = 'action-button';
                    visualizeButton.title = 'Highlight in visualization';
                    visualizeButton.innerHTML = '<iconify-icon icon="ph:brain" width="14"></iconify-icon> Visualize';
                    visualizeButton.addEventListener('click', () => this.triggerVisualization(content));
                    messageActions.appendChild(visualizeButton);
                }
            }
            
            messageContainer.appendChild(messageActions);
        }
        
        // Add to messages container with animation
        this.elements.messagesContainer.appendChild(messageContainer);
        
        // Apply entrance animation if enabled
        if (this.config.messageAnimations) {
            setTimeout(() => {
                messageContainer.style.opacity = '1';
                messageContainer.style.transform = 'translateY(0)';
            }, 10);
        }
        
        // Limit number of messages to prevent performance issues
        this.pruneExcessMessages();
        
        // Scroll to the bottom
        this.scrollToBottom();
    }
    
    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        // Remove existing indicator if any
        this.hideTypingIndicator();
        
        // Create typing indicator
        const indicatorContainer = document.createElement('div');
        indicatorContainer.className = 'message-container assistant-message-container';
        indicatorContainer.id = 'typing-indicator-container';
        
        // Create header with avatar
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        const messageAvatar = document.createElement('div');
        messageAvatar.className = 'message-avatar';
        messageAvatar.innerHTML = `<iconify-icon icon="ph:robot" width="16"></iconify-icon>`;
        messageHeader.appendChild(messageAvatar);
        
        const roleElement = document.createElement('span');
        roleElement.textContent = 'Claude';
        messageHeader.appendChild(roleElement);
        
        indicatorContainer.appendChild(messageHeader);
        
        // Create typing indicator message
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message assistant-message typing-indicator';
        typingIndicator.textContent = 'Thinking...';
        
        // Add animated dots
        const typingDots = document.createElement('div');
        typingDots.className = 'typing-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingDots.appendChild(dot);
        }
        
        typingIndicator.appendChild(typingDots);
        indicatorContainer.appendChild(typingIndicator);
        
        // Add to container
        this.elements.messagesContainer.appendChild(indicatorContainer);
        
        // Mark typing state
        this.typing = true;
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const existingIndicator = document.getElementById('typing-indicator-container');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Update typing state
        this.typing = false;
    }
    
    /**
     * Handle object selected from the scene
     * @param {Object} data - Selected object data
     */
    handleObjectSelected(data) {
        // Add system message about selection
        const message = `You selected the <strong>${data.name}</strong> node.`;
        
        this.addMessageToUI('system', message);
    }
    
    /**
     * Handle MCP status change
     * @param {Object} data - Status data
     */
    handleMcpStatusChange(data) {
        // Add system message for connection changes
        let message = '';
        
        switch (data.status) {
            case 'connected':
                message = '<span style="color: var(--neon-green);">Connected to Claude via MCP.</span>';
                break;
            case 'connecting':
                message = '<span style="color: var(--neon-orange);">Connecting to Claude...</span>';
                break;
            case 'disconnected':
                message = '<span style="color: var(--light-blue);">Disconnected from Claude.</span>';
                break;
        }
        
        if (message) {
            this.addMessageToUI('system', message);
        }
    }
    
    /**
     * Clear chat history
     */
    clearChatHistory() {
        // Confirm before clearing
        if (confirm('Are you sure you want to clear the chat history?')) {
            // Clear UI
            this.elements.messagesContainer.innerHTML = '';
            
            // Clear history array
            this.messageHistory = [];
            
            // Add system message
            this.addMessageToUI('system', 'Chat history cleared.');
            
            // Add welcome message again
            this.addMessageToUI('assistant', 'Welcome to ORGANIX Neural Interface. I\'m connected to this interactive visualization environment that represents my cognitive architecture. Feel free to ask me questions about the different neural components or interact with the 3D elements.');
        }
    }
    
    /**
     * Copy message content to clipboard
     * @param {string} content - Message content to copy
     */
    copyMessageToClipboard(content) {
        // Create temporary element to handle HTML content properly
        const tempElement = document.createElement('div');
        tempElement.innerHTML = content;
        const textContent = tempElement.textContent;
        
        // Use clipboard API
        navigator.clipboard.writeText(textContent)
            .then(() => {
                // Show brief notification
                this.showCopyNotification();
            })
            .catch(err => {
                console.error('Failed to copy text:', err);
            });
    }
    
    /**
     * Show a brief notification that text was copied
     */
    showCopyNotification() {
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = 'Copied to clipboard!';
        
        // Add to body
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            
            // Remove from DOM after animation
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }
    
    /**
     * Trigger visualization based on message content
     * @param {string} content - Message content to analyze
     */
    triggerVisualization(content) {
        // Extract potential visualization targets from message
        const targets = this.extractVisualizationTargets(content);
        
        if (targets.length > 0) {
            // Dispatch highlight events for each target
            targets.forEach(target => {
                this.eventBus.publish('scene:highlightObject', {
                    objectId: target.id,
                    duration: 2000,
                    color: target.color
                });
            });
            
            // Add system message
            this.addMessageToUI('system', `Highlighting ${targets.length} neural component${targets.length > 1 ? 's' : ''} in the visualization.`);
        } else {
            // Generic visualization if no specific targets found
            this.eventBus.publish('scene:overviewMode');
            
            // Add system message
            this.addMessageToUI('system', 'Showing overview visualization.');
        }
    }
    
    /**
     * Extract visualization targets from message content
     * @param {string} content - Message content to analyze
     * @returns {Array} Array of target objects with id and color
     */
    extractVisualizationTargets(content) {
        const targets = [];
        const contentLower = content.toLowerCase();
        
        // Map of keywords to target IDs
        const keywordMap = {
            'memory': { id: 'memory', color: 0x4a86e8 },
            'perception': { id: 'perception', color: 0xf06292 },
            'reasoning': { id: 'reasoning', color: 0x26a69a },
            'knowledge': { id: 'knowledge', color: 0xffb74d },
            'core': { id: 'neuralCore', color: 0x4a66ff },
            'central': { id: 'neuralCore', color: 0x4a66ff },
            'brain': { id: 'neuralCore', color: 0x4a66ff }
        };
        
        // Check for each keyword
        Object.keys(keywordMap).forEach(keyword => {
            if (contentLower.includes(keyword)) {
                targets.push(keywordMap[keyword]);
            }
        });
        
        return targets;
    }
    
    /**
     * Process markdown in message content
     * @param {string} content - Raw message content
     * @returns {string} Processed HTML content
     */
    processMarkdown(content) {
        // This is a simple implementation - could be replaced with a full markdown parser
        let processed = content;
        
        // Code blocks
        processed = processed.replace(/```([a-z]*)\n([\s\S]*?)\n```/g, '<pre><code class="language-$1">$2</code></pre>');
        
        // Inline code
        processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Bold
        processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Line breaks
        processed = processed.replace(/\n/g, '<br>');
        
        return processed;
    }
    
    /**
     * Prune excess messages to maintain performance
     */
    pruneExcessMessages() {
        const messages = this.elements.messagesContainer.querySelectorAll('.message-container');
        const maxMessages = this.config.maxMessagesDisplayed;
        
        if (messages.length > maxMessages) {
            const excessCount = messages.length - maxMessages;
            
            // Remove oldest messages (at the top)
            for (let i = 0; i < excessCount; i++) {
                if (messages[i]) {
                    messages[i].remove();
                }
            }
        }
    }
    
    /**
     * Scroll messages container to bottom
     */
    scrollToBottom() {
        const container = this.elements.messagesContainer;
        container.scrollTop = container.scrollHeight;
    }
    
    /**
     * Play sound effect
     * @param {string} type - Sound type ('send', 'receive', etc.)
     */
    playSound(type) {
        // Implementation could be added if needed
        // AudioContext could be used for more sophisticated sound effects
    }
}

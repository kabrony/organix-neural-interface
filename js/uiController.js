/**
 * ORGANIX Neural Interface - UI Controller
 * 
 * Manages the user interface of the ORGANIX application, handling
 * user interactions, displaying information, and coordinating between
 * the 3D visualization and the Claude MCP integration.
 */

export class UIController {
    constructor(eventBus, neuralScene, mcpConnector) {
        this.eventBus = eventBus;
        this.neuralScene = neuralScene;
        this.mcpConnector = mcpConnector;
        
        // Panel states
        this.panelStates = {
            claudePanel: true,
            controlPanel: false,
            contextPanel: false,
            settingsPanel: false,
            helpPanel: false
        };
        
        // UI elements
        this.elements = {};
        
        // Initialize the UI
        this.initialize();
        
        console.log('UI Controller initialized');
    }
    
    /**
     * Initialize the UI controller
     */
    initialize() {
        // Cache DOM elements
        this.cacheElements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup event bus listeners
        this.setupEventBusListeners();
        
        // Initial UI update
        this.updateUI();
    }
    
    /**
     * Cache DOM elements for faster access
     */
    cacheElements() {
        // Panels
        this.elements.claudePanel = document.getElementById('claude-panel');
        this.elements.controlPanel = document.getElementById('control-panel');
        this.elements.contextPanel = document.getElementById('context-panel');
        this.elements.settingsPanel = document.getElementById('settings-panel');
        this.elements.helpPanel = document.getElementById('help-panel');
        
        // Input elements
        this.elements.userInput = document.getElementById('user-input');
        this.elements.sendButton = document.getElementById('send-btn');
        this.elements.messagesContainer = document.getElementById('messages-container');
        
        // Controls
        this.elements.ambientIntensity = document.getElementById('ambient-intensity');
        this.elements.activityLevel = document.getElementById('activity-level');
        this.elements.connectionVisibility = document.getElementById('connection-visibility');
        this.elements.visualPresetButtons = document.querySelectorAll('.preset-button');
        this.elements.resetViewButton = document.getElementById('reset-view');
        this.elements.overviewModeButton = document.getElementById('overview-mode');
        
        // Settings
        this.elements.qualityPreset = document.getElementById('quality-preset');
        this.elements.postProcessing = document.getElementById('post-processing');
        this.elements.cameraInertia = document.getElementById('camera-inertia');
        this.elements.autoRotate = document.getElementById('auto-rotate');
        this.elements.mcpEndpoint = document.getElementById('mcp-endpoint');
        this.elements.apiKey = document.getElementById('api-key');
        this.elements.connectMcpButton = document.getElementById('connect-mcp');
        
        // Status indicators
        this.elements.mcpStatus = document.getElementById('mcp-status');
        this.elements.notificationArea = document.getElementById('notification-area');
        
        // Panel toggles
        this.elements.claudePanelToggle = document.getElementById('claude-panel-toggle');
        this.elements.controlPanelToggle = document.getElementById('control-panel-toggle');
        this.elements.settingsToggle = document.getElementById('settings-toggle');
        this.elements.helpToggle = document.getElementById('help-toggle');
        this.elements.settingsClose = document.getElementById('settings-close');
        this.elements.helpClose = document.getElementById('help-close');
        this.elements.contextClose = document.getElementById('context-close');
    }
    
    /**
     * Setup event listeners for DOM elements
     */
    setupEventListeners() {
        // Message input
        this.elements.sendButton.addEventListener('click', this.handleSendMessage.bind(this));
        this.elements.userInput.addEventListener('keydown', this.handleInputKeyDown.bind(this));
        
        // Panel toggles
        this.elements.claudePanelToggle.addEventListener('click', () => this.togglePanel('claudePanel'));
        this.elements.controlPanelToggle.addEventListener('click', () => this.togglePanel('controlPanel'));
        this.elements.settingsToggle.addEventListener('click', () => this.togglePanel('settingsPanel'));
        this.elements.helpToggle.addEventListener('click', () => this.togglePanel('helpPanel'));
        this.elements.settingsClose.addEventListener('click', () => this.togglePanel('settingsPanel', false));
        this.elements.helpClose.addEventListener('click', () => this.togglePanel('helpPanel', false));
        this.elements.contextClose.addEventListener('click', () => this.togglePanel('contextPanel', false));
        
        // Control sliders
        this.elements.ambientIntensity.addEventListener('input', this.handleAmbientIntensityChange.bind(this));
        this.elements.activityLevel.addEventListener('input', this.handleActivityLevelChange.bind(this));
        this.elements.connectionVisibility.addEventListener('input', this.handleConnectionVisibilityChange.bind(this));
        
        // Control buttons
        this.elements.resetViewButton.addEventListener('click', this.handleResetView.bind(this));
        this.elements.overviewModeButton.addEventListener('click', this.handleOverviewMode.bind(this));
        
        // Visual preset buttons
        this.elements.visualPresetButtons.forEach(button => {
            button.addEventListener('click', this.handleVisualPresetChange.bind(this));
        });
        
        // Setting controls
        this.elements.qualityPreset.addEventListener('change', this.handleQualityChange.bind(this));
        this.elements.postProcessing.addEventListener('change', this.handlePostProcessingChange.bind(this));
        this.elements.cameraInertia.addEventListener('input', this.handleCameraInertiaChange.bind(this));
        this.elements.autoRotate.addEventListener('change', this.handleAutoRotateChange.bind(this));
        this.elements.connectMcpButton.addEventListener('click', this.handleConnectMcp.bind(this));
        
        // Context panel
        document.getElementById('query-object').addEventListener('click', this.handleQuerySelectedObject.bind(this));
    }
    
    /**
     * Setup listeners for event bus events
     */
    setupEventBusListeners() {
        // MCP events
        this.eventBus.subscribe('mcp:statusChange', this.handleMcpStatusChange.bind(this));
        this.eventBus.subscribe('mcp:message', this.handleMcpMessage.bind(this));
        this.eventBus.subscribe('mcp:typingStart', this.showTypingIndicator.bind(this));
        this.eventBus.subscribe('mcp:typingEnd', this.hideTypingIndicator.bind(this));
        this.eventBus.subscribe('mcp:error', this.handleMcpError.bind(this));
        
        // Scene events
        this.eventBus.subscribe('scene:objectSelected', this.handleObjectSelected.bind(this));
        
        // UI events (mostly for notifications)
        this.eventBus.subscribe('ui:notification', this.showNotification.bind(this));
    }
    
    /**
     * Update the UI based on current state
     */
    updateUI() {
        // Update panel visibility
        Object.entries(this.panelStates).forEach(([panel, isVisible]) => {
            const element = this.elements[panel];
            if (element) {
                if (panel === 'claudePanel' || panel === 'controlPanel') {
                    element.classList.toggle('active', isVisible);
                } else {
                    element.classList.toggle('hidden', !isVisible);
                }
            }
        });
    }
    
    /**
     * Toggle a panel's visibility
     * @param {string} panelName - Name of the panel to toggle
     * @param {boolean} [forcedState] - Force a specific state (optional)
     */
    togglePanel(panelName, forcedState) {
        // Special handling for modal panels
        if (panelName === 'settingsPanel' || panelName === 'helpPanel') {
            // Close all other modal panels
            if (forcedState !== false) {
                this.panelStates.settingsPanel = false;
                this.panelStates.helpPanel = false;
            }
        }
        
        // Set the panel state
        this.panelStates[panelName] = forcedState !== undefined ? forcedState : !this.panelStates[panelName];
        
        // Update the UI
        this.updateUI();
    }
    
    /**
     * Close all panels
     */
    closeAllPanels() {
        this.panelStates.settingsPanel = false;
        this.panelStates.helpPanel = false;
        this.panelStates.contextPanel = false;
        this.updateUI();
    }
    
    /**
     * Toggle help panel
     */
    toggleHelpPanel() {
        this.togglePanel('helpPanel');
    }
    
    /**
     * Handle send message button click
     */
    handleSendMessage() {
        const message = this.elements.userInput.value.trim();
        
        if (message) {
            // Add message to UI
            this.addMessageToUI('user', message);
            
            // Clear input
            this.elements.userInput.value = '';
            
            // Publish send message event
            this.eventBus.publish('ui:sendMessage', message);
        }
    }
    
    /**
     * Handle keydown event in the input field
     * @param {Event} event - Keydown event
     */
    handleInputKeyDown(event) {
        // Enter key without shift to send
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.handleSendMessage();
        }
    }
    
    /**
     * Handle ambient intensity slider change
     */
    handleAmbientIntensityChange() {
        const value = parseInt(this.elements.ambientIntensity.value);
        this.eventBus.publish('control:ambientIntensity', value);
    }
    
    /**
     * Handle activity level slider change
     */
    handleActivityLevelChange() {
        const value = parseInt(this.elements.activityLevel.value);
        this.eventBus.publish('control:activityLevel', value);
    }
    
    /**
     * Handle connection visibility slider change
     */
    handleConnectionVisibilityChange() {
        const value = parseInt(this.elements.connectionVisibility.value);
        this.eventBus.publish('control:connectionVisibility', value);
    }
    
    /**
     * Handle reset view button click
     */
    handleResetView() {
        this.eventBus.publish('action:resetView');
    }
    
    /**
     * Handle overview mode button click
     */
    handleOverviewMode() {
        this.eventBus.publish('action:overviewMode');
    }
    
    /**
     * Handle visual preset button click
     * @param {Event} event - Click event
     */
    handleVisualPresetChange(event) {
        const presetButton = event.currentTarget;
        const preset = presetButton.dataset.preset;
        
        // Update active button
        this.elements.visualPresetButtons.forEach(button => {
            button.classList.toggle('active', button === presetButton);
        });
        
        // Publish preset change event
        this.eventBus.publish('control:visualPreset', preset);
    }
    
    /**
     * Handle quality preset change
     */
    handleQualityChange() {
        const quality = this.elements.qualityPreset.value;
        this.eventBus.publish('settings:quality', quality);
    }
    
    /**
     * Handle post-processing toggle
     */
    handlePostProcessingChange() {
        const enabled = this.elements.postProcessing.checked;
        this.eventBus.publish('settings:postProcessing', enabled);
    }
    
    /**
     * Handle camera inertia slider change
     */
    handleCameraInertiaChange() {
        const value = parseInt(this.elements.cameraInertia.value) / 100;
        this.eventBus.publish('settings:cameraInertia', value);
    }
    
    /**
     * Handle auto-rotate toggle
     */
    handleAutoRotateChange() {
        const enabled = this.elements.autoRotate.checked;
        this.eventBus.publish('settings:autoRotate', enabled);
    }
    
    /**
     * Handle connect MCP button click
     */
    handleConnectMcp() {
        const endpoint = this.elements.mcpEndpoint.value.trim();
        const apiKey = this.elements.apiKey.value.trim();
        
        if (endpoint) {
            this.eventBus.publish('ui:connectMCP', endpoint, apiKey);
        } else {
            this.showNotification({
                type: 'error',
                message: 'Please enter a valid MCP endpoint URL',
                duration: 5000
            });
        }
    }
    
    /**
     * Handle query selected object button click
     */
    handleQuerySelectedObject() {
        if (this.selectedObject) {
            const query = `Tell me about the ${this.selectedObject.name} component.`;
            
            // Add message to UI
            this.addMessageToUI('user', query);
            
            // Publish send message event
            this.eventBus.publish('ui:sendMessage', query);
            
            // Close context panel
            this.togglePanel('contextPanel', false);
        }
    }
    
    /**
     * Handle MCP status change
     * @param {object} data - Status data
     */
    handleMcpStatusChange(data) {
        const { status } = data;
        
        // Update status indicator
        this.elements.mcpStatus.dataset.status = status;
        
        switch (status) {
            case 'connected':
                this.elements.mcpStatus.querySelector('.status-text').textContent = 'MCP: Connected';
                break;
                
            case 'connecting':
                this.elements.mcpStatus.querySelector('.status-text').textContent = 'MCP: Connecting...';
                break;
                
            case 'disconnected':
            default:
                this.elements.mcpStatus.querySelector('.status-text').textContent = 'MCP: Disconnected';
                break;
        }
    }
    
    /**
     * Handle MCP message
     * @param {object} message - Message data
     */
    handleMcpMessage(message) {
        this.addMessageToUI(message.role, message.content);
    }
    
    /**
     * Handle MCP error
     * @param {object} error - Error data
     */
    handleMcpError(error) {
        this.showNotification({
            type: 'error',
            message: error.message,
            duration: 5000
        });
    }
    
    /**
     * Handle object selected event
     * @param {object} data - Selected object data
     */
    handleObjectSelected(data) {
        // Store selected object
        this.selectedObject = data;
        
        // Update context panel
        document.getElementById('context-title').textContent = data.name;
        
        const contextDetails = document.getElementById('context-details');
        contextDetails.innerHTML = `
            <p>${data.description || 'No description available.'}</p>
            <div class="context-item">
                <span class="context-label">Type:</span>
                <span class="context-value">${data.type}</span>
            </div>
        `;
        
        // Show context panel
        this.togglePanel('contextPanel', true);
        
        // Position context panel near the object
        // This would require projecting 3D coordinates to 2D screen coordinates
        // For simplicity, we'll just show it at a fixed position for now
    }
    
    /**
     * Add a message to the UI
     * @param {string} role - Message role ('user', 'assistant', or 'system')
     * @param {string} content - Message content
     */
    addMessageToUI(role, content) {
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}-message`;
        
        // Set content
        messageElement.textContent = content;
        
        // Add to messages container
        this.elements.messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        this.scrollMessagesToBottom();
    }
    
    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        // Remove existing typing indicator
        this.hideTypingIndicator();
        
        // Create typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typing-indicator';
        typingIndicator.className = 'message assistant-message typing-indicator';
        typingIndicator.textContent = 'Claude is typing...';
        
        // Add to messages container
        this.elements.messagesContainer.appendChild(typingIndicator);
        
        // Scroll to bottom
        this.scrollMessagesToBottom();
    }
    
    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const existingIndicator = document.getElementById('typing-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
    }
    
    /**
     * Scroll messages container to bottom
     */
    scrollMessagesToBottom() {
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }
    
    /**
     * Show a notification
     * @param {object} options - Notification options
     * @param {string} options.type - Notification type ('info', 'success', 'warning', 'error')
     * @param {string} options.message - Notification message
     * @param {number} options.duration - Duration in milliseconds
     */
    showNotification(options) {
        const { type = 'info', message, duration = 5000 } = options;
        
        // Create notification element
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification ${type}`;
        notificationElement.textContent = message;
        
        // Add to notification area
        this.elements.notificationArea.appendChild(notificationElement);
        
        // Remove after duration
        setTimeout(() => {
            // Add fade-out class
            notificationElement.classList.add('fade-out');
            
            // Remove after animation
            setTimeout(() => {
                notificationElement.remove();
            }, 300);
        }, duration);
    }
}

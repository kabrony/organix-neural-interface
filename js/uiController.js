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
        
        // Load saved settings
        this.loadSavedSettings();
        
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
        this.elements.clearChatButton = document.getElementById('clear-chat');
        
        // Controls
        this.elements.ambientIntensity = document.getElementById('ambient-intensity');
        this.elements.activityLevel = document.getElementById('activity-level');
        this.elements.connectionVisibility = document.getElementById('connection-visibility');
        this.elements.visualPresetButtons = document.querySelectorAll('.preset-button');
        this.elements.resetViewButton = document.getElementById('reset-view');
        this.elements.overviewModeButton = document.getElementById('overview-mode');
        
        // Effect toggles
        this.elements.enableGlow = document.getElementById('enable-glow');
        this.elements.enableParticles = document.getElementById('enable-particles');
        this.elements.enablePulses = document.getElementById('enable-pulses');
        this.elements.enableEnvironment = document.getElementById('enable-environment');
        this.elements.enableVolumetric = document.getElementById('enable-volumetric');
        this.elements.enableScanlines = document.getElementById('enable-scanlines');
        
        // Settings
        this.elements.qualityPreset = document.getElementById('quality-preset');
        this.elements.postProcessing = document.getElementById('post-processing');
        this.elements.cameraInertia = document.getElementById('camera-inertia');
        this.elements.autoRotate = document.getElementById('auto-rotate');
        this.elements.mcpMode = document.getElementById('mcp-mode');
        this.elements.mcpEndpoint = document.getElementById('mcp-endpoint');
        this.elements.apiKey = document.getElementById('api-key');
        this.elements.connectMcpButton = document.getElementById('connect-mcp');
        this.elements.disconnectMcpButton = document.getElementById('disconnect-mcp');
        this.elements.debugMode = document.getElementById('debug-mode');
        this.elements.mcpLogLevel = document.getElementById('mcp-log-level');
        this.elements.clearStorageButton = document.getElementById('clear-storage');
        
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
        if (this.elements.clearChatButton) {
            this.elements.clearChatButton.addEventListener('click', this.handleClearChat.bind(this));
        }
        
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
        
        // Effect toggles
        this.elements.enableGlow.addEventListener('change', this.handleEffectToggle.bind(this));
        this.elements.enableParticles.addEventListener('change', this.handleEffectToggle.bind(this));
        this.elements.enablePulses.addEventListener('change', this.handleEffectToggle.bind(this));
        this.elements.enableEnvironment.addEventListener('change', this.handleEffectToggle.bind(this));
        if (this.elements.enableVolumetric) {
            this.elements.enableVolumetric.addEventListener('change', this.handleEffectToggle.bind(this));
        }
        if (this.elements.enableScanlines) {
            this.elements.enableScanlines.addEventListener('change', this.handleEffectToggle.bind(this));
        }
        
        // Control buttons
        this.elements.resetViewButton.addEventListener('click', this.handleResetView.bind(this));
        this.elements.overviewModeButton.addEventListener('click', this.handleOverviewMode.bind(this));
        
        // Visual preset buttons
        this.elements.visualPresetButtons.forEach(button => {
            button.addEventListener('click', this.handleVisualPresetChange.bind(this));
        });
        
        // Settings controls
        this.elements.qualityPreset.addEventListener('change', this.handleQualityChange.bind(this));
        this.elements.postProcessing.addEventListener('change', this.handlePostProcessingChange.bind(this));
        this.elements.cameraInertia.addEventListener('input', this.handleCameraInertiaChange.bind(this));
        this.elements.autoRotate.addEventListener('change', this.handleAutoRotateChange.bind(this));
        this.elements.mcpMode.addEventListener('change', this.handleMcpModeChange.bind(this));
        this.elements.connectMcpButton.addEventListener('click', this.handleConnectMcp.bind(this));
        this.elements.disconnectMcpButton.addEventListener('click', this.handleDisconnectMcp.bind(this));
        this.elements.debugMode.addEventListener('change', this.handleDebugModeChange.bind(this));
        this.elements.mcpLogLevel.addEventListener('change', this.handleMcpLogLevelChange.bind(this));
        this.elements.clearStorageButton.addEventListener('click', this.handleClearStorage.bind(this));
        
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
        this.eventBus.subscribe('mcp:configLoaded', this.handleMcpConfigLoaded.bind(this));
        
        // Scene events
        this.eventBus.subscribe('scene:objectSelected', this.handleObjectSelected.bind(this));
        
        // UI events (mostly for notifications)
        this.eventBus.subscribe('ui:notification', this.showNotification.bind(this));
        this.eventBus.subscribe('ui:toggleConnectionPanel', () => this.togglePanel('settingsPanel'));
    }
    
    /**
     * Load saved settings from localStorage
     */
    loadSavedSettings() {
        try {
            // Load quality preset
            const savedQuality = localStorage.getItem('organix-quality-preset');
            if (savedQuality) {
                this.elements.qualityPreset.value = savedQuality;
                this.handleQualityChange({ target: this.elements.qualityPreset });
            }
            
            // Load post-processing setting
            const savedPostProcessing = localStorage.getItem('organix-post-processing');
            if (savedPostProcessing !== null) {
                this.elements.postProcessing.checked = savedPostProcessing === 'true';
                this.handlePostProcessingChange({ target: this.elements.postProcessing });
            }
            
            // Load MCP mode
            const savedMcpMode = localStorage.getItem('organix-mcp-mode');
            if (savedMcpMode) {
                this.elements.mcpMode.value = savedMcpMode;
            }
            
            // Load MCP endpoint
            const savedMcpEndpoint = localStorage.getItem('organix-mcp-endpoint');
            if (savedMcpEndpoint) {
                this.elements.mcpEndpoint.value = savedMcpEndpoint;
            }
            
            // Load debug mode
            const savedDebugMode = localStorage.getItem('organix-debug-mode');
            if (savedDebugMode !== null) {
                this.elements.debugMode.checked = savedDebugMode === 'true';
                this.handleDebugModeChange({ target: this.elements.debugMode });
            }
            
            // Load MCP log level
            const savedMcpLogLevel = localStorage.getItem('organix-mcp-log-level');
            if (savedMcpLogLevel) {
                this.elements.mcpLogLevel.value = savedMcpLogLevel;
            }
            
            console.log('Loaded saved settings from localStorage');
        } catch (error) {
            console.error('Error loading saved settings:', error);
        }
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
     * Handle clear chat button click
     */
    handleClearChat() {
        // Clear the messages container
        this.elements.messagesContainer.innerHTML = '';
        
        // Add a welcome message
        this.addMessageToUI('assistant', 'Chat history has been cleared. How can I help you?');
        
        // Show notification
        this.showNotification({
            type: 'info',
            message: 'Chat history cleared',
            duration: 3000
        });
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
        
        // Auto-resize the textarea
        setTimeout(() => {
            event.target.style.height = 'auto';
            event.target.style.height = Math.min(200, event.target.scrollHeight) + 'px';
        }, 0);
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
     * Handle effect toggle change
     * @param {Event} event - Change event
     */
    handleEffectToggle(event) {
        const effectId = event.target.id;
        const enabled = event.target.checked;
        
        // Map effect ID to effect name
        const effectMap = {
            'enable-glow': 'glow',
            'enable-particles': 'particles',
            'enable-pulses': 'pulses',
            'enable-environment': 'environment',
            'enable-volumetric': 'volumetricLights',
            'enable-scanlines': 'scanlines'
        };
        
        const effectName = effectMap[effectId];
        if (effectName) {
            this.eventBus.publish('control:effectToggle', {
                effect: effectName,
                enabled: enabled
            });
        }
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
    handleQualityChange(event) {
        const quality = event.target.value || this.elements.qualityPreset.value;
        this.eventBus.publish('settings:quality', quality);
        
        // Save setting
        localStorage.setItem('organix-quality-preset', quality);
    }
    
    /**
     * Handle post-processing toggle
     */
    handlePostProcessingChange(event) {
        const enabled = event.target.checked || this.elements.postProcessing.checked;
        this.eventBus.publish('settings:postProcessing', enabled);
        
        // Save setting
        localStorage.setItem('organix-post-processing', enabled.toString());
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
     * Handle MCP mode change
     */
    handleMcpModeChange() {
        const mode = this.elements.mcpMode.value;
        this.eventBus.publish('settings:mcpMode', mode);
        
        // Save setting
        localStorage.setItem('organix-mcp-mode', mode);
        
        // Update UI based on selected mode
        this.updateMcpModeUI(mode);
    }
    
    /**
     * Update UI elements based on MCP mode
     * @param {string} mode - MCP mode ('real' or 'simulation')
     */
    updateMcpModeUI(mode) {
        if (mode === 'real') {
            // Show real MCP connection fields
            this.elements.mcpEndpoint.parentElement.style.display = 'flex';
            this.elements.apiKey.parentElement.style.display = 'flex';
            this.elements.connectMcpButton.textContent = 'Connect to Claude MCP';
            this.elements.disconnectMcpButton.style.display = 'inline-block';
        } else {
            // Hide real MCP connection fields
            this.elements.mcpEndpoint.parentElement.style.display = 'none';
            this.elements.apiKey.parentElement.style.display = 'none';
            this.elements.connectMcpButton.textContent = 'Enable Simulation Mode';
            this.elements.disconnectMcpButton.style.display = 'none';
        }
    }
    
    /**
     * Handle connect MCP button click
     */
    handleConnectMcp() {
        const mode = this.elements.mcpMode.value;
        
        if (mode === 'real') {
            const endpoint = this.elements.mcpEndpoint.value.trim();
            const apiKey = this.elements.apiKey.value.trim();
            
            if (endpoint) {
                // Save MCP endpoint for future use
                localStorage.setItem('organix-mcp-endpoint', endpoint);
                
                // Publish connect event
                this.eventBus.publish('mcp:connect', {
                    endpoint,
                    apiKey
                });
            } else {
                this.showNotification({
                    type: 'error',
                    message: 'Please enter a valid MCP endpoint URL',
                    duration: 5000
                });
            }
        } else {
            // Enable simulation mode
            this.eventBus.publish('settings:mcpMode', 'simulation');
        }
    }
    
    /**
     * Handle disconnect MCP button click
     */
    handleDisconnectMcp() {
        this.eventBus.publish('mcp:disconnect');
    }
    
    /**
     * Handle debug mode toggle
     */
    handleDebugModeChange() {
        const enabled = this.elements.debugMode.checked;
        this.eventBus.publish('settings:debugMode', enabled);
        
        // Enable/disable EventBus debug mode
        if (window.organixEvents) {
            window.organixEvents.setDebugMode(enabled);
        }
        
        // Save setting
        localStorage.setItem('organix-debug-mode', enabled.toString());
    }
    
    /**
     * Handle MCP log level change
     */
    handleMcpLogLevelChange() {
        const level = this.elements.mcpLogLevel.value;
        this.eventBus.publish('settings:mcpLogLevel', level);
        
        // Save setting
        localStorage.setItem('organix-mcp-log-level', level);
    }
    
    /**
     * Handle clear storage button click
     */
    handleClearStorage() {
        // Show confirmation dialog
        if (confirm('Are you sure you want to clear all saved settings? This will reset preferences, connection settings, and visualization options.')) {
            // Clear all ORGANIX-related localStorage items
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('organix-')) {
                    keysToRemove.push(key);
                }
            }
            
            // Remove keys
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // Show notification
            this.showNotification({
                type: 'success',
                message: 'All saved settings have been cleared',
                duration: 3000
            });
            
            // Reload the page to apply default settings
            setTimeout(() => window.location.reload(), 1000);
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
                // Update connect button
                this.elements.connectMcpButton.disabled = true;
                this.elements.disconnectMcpButton.disabled = false;
                break;
                
            case 'connecting':
                this.elements.mcpStatus.querySelector('.status-text').textContent = 'MCP: Connecting...';
                // Update connect button
                this.elements.connectMcpButton.disabled = true;
                this.elements.disconnectMcpButton.disabled = true;
                break;
                
            case 'disconnected':
            default:
                this.elements.mcpStatus.querySelector('.status-text').textContent = 'MCP: Disconnected';
                // Update connect button
                this.elements.connectMcpButton.disabled = false;
                this.elements.disconnectMcpButton.disabled = true;
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
            message: error.message || 'An error occurred with MCP',
            duration: 5000
        });
    }
    
    /**
     * Handle MCP config loaded
     * @param {object} config - MCP configuration
     */
    handleMcpConfigLoaded(config) {
        // Update endpoint input field
        if (config.endpoint) {
            this.elements.mcpEndpoint.value = config.endpoint;
        }
        
        // Update API key placeholder if previously set
        if (config.apiKeyWasSet) {
            this.elements.apiKey.placeholder = '******** (previously set)';
        }
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
    }
    
    /**
     * Add a message to the UI
     * @param {string} role - Message role ('user', 'assistant', or 'system')
     * @param {string} content - Message content
     */
    addMessageToUI(role, content) {
        // Create container
        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${role}-message-container`;
        
        // Create header with avatar
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        // Add icon based on role
        const iconElement = document.createElement('iconify-icon');
        iconElement.setAttribute('width', '16');
        
        if (role === 'user') {
            iconElement.setAttribute('icon', 'ph:user');
            messageHeader.appendChild(document.createTextNode('You'));
            messageHeader.appendChild(avatar);
        } else if (role === 'assistant') {
            iconElement.setAttribute('icon', 'ph:brain-circuit');
            avatar.appendChild(iconElement);
            messageHeader.appendChild(avatar);
            messageHeader.appendChild(document.createTextNode('Claude'));
        } else {
            iconElement.setAttribute('icon', 'ph:info');
            avatar.appendChild(iconElement);
            messageHeader.appendChild(avatar);
            messageHeader.appendChild(document.createTextNode('System'));
        }
        
        avatar.appendChild(iconElement);
        
        // Add timestamp
        const timestamp = document.createElement('span');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messageHeader.appendChild(timestamp);
        
        messageContainer.appendChild(messageHeader);
        
        // Create message
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}-message`;
        messageElement.textContent = content;
        
        messageContainer.appendChild(messageElement);
        
        // Add action buttons for assistant messages
        if (role === 'assistant') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            const copyButton = document.createElement('button');
            copyButton.className = 'action-button';
            copyButton.innerHTML = '<iconify-icon icon="ph:copy" width="14"></iconify-icon> Copy';
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(content).then(() => {
                    this.showNotification({
                        type: 'success',
                        message: 'Copied to clipboard',
                        duration: 2000
                    });
                });
            });
            
            actionsDiv.appendChild(copyButton);
            messageContainer.appendChild(actionsDiv);
        }
        
        // Add to messages container
        this.elements.messagesContainer.appendChild(messageContainer);
        
        // Scroll to bottom
        this.scrollMessagesToBottom();
    }
    
    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        // Remove existing typing indicator
        this.hideTypingIndicator();
        
        // Create container
        const messageContainer = document.createElement('div');
        messageContainer.className = 'message-container assistant-message-container';
        messageContainer.id = 'typing-container';
        
        // Create header with avatar
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        const iconElement = document.createElement('iconify-icon');
        iconElement.setAttribute('icon', 'ph:brain-circuit');
        iconElement.setAttribute('width', '16');
        avatar.appendChild(iconElement);
        
        messageHeader.appendChild(avatar);
        messageHeader.appendChild(document.createTextNode('Claude'));
        
        messageContainer.appendChild(messageHeader);
        
        // Create typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message assistant-message typing-indicator';
        typingIndicator.textContent = 'Thinking...';
        
        // Add dots animation
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'typing-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            dotsContainer.appendChild(dot);
        }
        
        typingIndicator.appendChild(dotsContainer);
        messageContainer.appendChild(typingIndicator);
        
        // Add to messages container
        this.elements.messagesContainer.appendChild(messageContainer);
        
        // Scroll to bottom
        this.scrollMessagesToBottom();
    }
    
    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const existingIndicator = document.getElementById('typing-container');
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
        
        // Add icon based on type
        const iconElement = document.createElement('iconify-icon');
        iconElement.setAttribute('width', '18');
        iconElement.style.marginRight = '8px';
        
        switch (type) {
            case 'success':
                iconElement.setAttribute('icon', 'ph:check-circle');
                break;
            case 'warning':
                iconElement.setAttribute('icon', 'ph:warning');
                break;
            case 'error':
                iconElement.setAttribute('icon', 'ph:x-circle');
                break;
            default:
                iconElement.setAttribute('icon', 'ph:info');
                break;
        }
        
        notificationElement.appendChild(iconElement);
        
        // Add message
        const messageText = document.createTextNode(message);
        notificationElement.appendChild(messageText);
        
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

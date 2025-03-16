/**
 * ORGANIX Neural Interface - UI Controller
 * 
 * Manages the user interface of the ORGANIX application, handling
 * user interactions, displaying information, and coordinating between
 * the 3D visualization and the Claude MCP integration.
 * 
 * Enhanced with modern UI features and cyberpunk aesthetic.
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
        
        // Chat history
        this.chatHistory = [];
        
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
        
        // Initialize message typing animation handler
        this.initTypingHandler();
        
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
        this.elements.clearChat = document.getElementById('clear-chat');
        this.elements.messagesContainer = document.getElementById('messages-container');
        
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
        this.elements.clearChat.addEventListener('click', this.handleClearChat.bind(this));
        
        // Auto-resize textarea when typing
        this.elements.userInput.addEventListener('input', this.autoResizeTextarea.bind(this));
        
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
        this.elements.enableVolumetric.addEventListener('change', this.handleEffectToggle.bind(this));
        this.elements.enableScanlines.addEventListener('change', this.handleEffectToggle.bind(this));
        
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
        
        // Window resize
        window.addEventListener('resize', this.handleWindowResize.bind(this));
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
        
        // Effect events
        this.eventBus.subscribe('effects:update', this.handleEffectsUpdate.bind(this));
    }
    
    /**
     * Initialize typing animation handler
     */
    initTypingHandler() {
        // Initialize typing state
        this.typingState = {
            active: false,
            element: null,
            text: '',
            index: 0,
            speed: { min: 10, max: 30 }
        };
    }
    
    /**
     * Handle window resize
     */
    handleWindowResize() {
        // Adjust UI elements based on window size
        this.updateScrollPosition();
        
        // Notify other components
        this.eventBus.publish('ui:windowResized', {
            width: window.innerWidth,
            height: window.innerHeight
        });
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
            
            // Load chat history (limited to last 50 messages)
            const savedChatHistory = localStorage.getItem('organix-chat-history');
            if (savedChatHistory) {
                try {
                    this.chatHistory = JSON.parse(savedChatHistory).slice(-50);
                    // Restore chat history to UI
                    this.restoreChatHistory();
                } catch (e) {
                    console.error('Failed to parse chat history', e);
                }
            }
            
            console.log('Loaded saved settings from localStorage');
        } catch (error) {
            console.error('Error loading saved settings:', error);
        }
    }
    
    /**
     * Restore chat history to UI
     */
    restoreChatHistory() {
        // Clear existing messages first
        while (this.elements.messagesContainer.firstChild) {
            this.elements.messagesContainer.removeChild(this.elements.messagesContainer.firstChild);
        }
        
        // Add each message from history
        this.chatHistory.forEach(message => {
            this.addMessageToUI(message.role, message.content, message.timestamp);
        });
        
        // Scroll to bottom
        this.scrollMessagesToBottom();
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
     * Auto-resize textarea when typing
     * @param {Event} event - Input event
     */
    autoResizeTextarea(event) {
        const textarea = event.target;
        
        // Reset height to auto to get the real scrollHeight
        textarea.style.height = 'auto';
        
        // Calculate required height (with limit)
        const newHeight = Math.min(textarea.scrollHeight, 200);
        
        // Set the new height
        textarea.style.height = `${newHeight}px`;
    }
    
    /**
     * Handle send message button click
     */
    handleSendMessage() {
        const message = this.elements.userInput.value.trim();
        
        if (message) {
            // Add message to UI
            this.addMessageToUI('user', message);
            
            // Add to chat history
            this.addToChatHistory('user', message);
            
            // Clear input
            this.elements.userInput.value = '';
            this.elements.userInput.style.height = 'auto';
            
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
     * Handle clear chat button click
     */
    handleClearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            // Clear chat UI
            while (this.elements.messagesContainer.childNodes.length > 0) {
                this.elements.messagesContainer.removeChild(this.elements.messagesContainer.firstChild);
            }
            
            // Clear chat history array
            this.chatHistory = [];
            
            // Clear from localStorage
            localStorage.removeItem('organix-chat-history');
            
            // Display welcome message again
            const welcomeMessage = {
                role: 'assistant',
                content: "Welcome to ORGANIX Neural Interface. I'm connected to this interactive visualization environment that represents my cognitive architecture. Feel free to ask me questions about the different neural components or interact with the 3D elements.",
                timestamp: new Date().toISOString()
            };
            
            this.addMessageToUI(welcomeMessage.role, welcomeMessage.content, welcomeMessage.timestamp);
            this.addToChatHistory(welcomeMessage.role, welcomeMessage.content, welcomeMessage.timestamp);
            
            // Show notification
            this.showNotification({
                type: 'info',
                message: 'Chat history cleared',
                duration: 3000
            });
        }
    }
    
    /**
     * Add message to chat history
     * @param {string} role - Message role ('user', 'assistant', or 'system')
     * @param {string} content - Message content
     * @param {string} [timestamp] - Optional timestamp
     */
    addToChatHistory(role, content, timestamp = new Date().toISOString()) {
        // Add to chat history array
        const message = { role, content, timestamp };
        this.chatHistory.push(message);
        
        // Limit history size (keep last 100 messages)
        if (this.chatHistory.length > 100) {
            this.chatHistory.shift();
        }
        
        // Save to localStorage
        try {
            localStorage.setItem('organix-chat-history', JSON.stringify(this.chatHistory));
        } catch (error) {
            console.error('Failed to save chat history:', error);
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
     * Handle effect toggle changes
     * @param {Event} event - Change event
     */
    handleEffectToggle(event) {
        const checkbox = event.target;
        const effectType = checkbox.id.replace('enable-', '');
        const enabled = checkbox.checked;
        
        this.eventBus.publish(`effects:toggle${effectType.charAt(0).toUpperCase() + effectType.slice(1)}`, enabled);
    }
    
    /**
     * Handle effects update from other components
     * @param {Object} data - Effect state data
     */
    handleEffectsUpdate(data) {
        if (data.glow !== undefined && this.elements.enableGlow) {
            this.elements.enableGlow.checked = data.glow;
        }
        
        if (data.particles !== undefined && this.elements.enableParticles) {
            this.elements.enableParticles.checked = data.particles;
        }
        
        if (data.pulses !== undefined && this.elements.enablePulses) {
            this.elements.enablePulses.checked = data.pulses;
        }
        
        if (data.environment !== undefined && this.elements.enableEnvironment) {
            this.elements.enableEnvironment.checked = data.environment;
        }
        
        if (data.volumetricLights !== undefined && this.elements.enableVolumetric) {
            this.elements.enableVolumetric.checked = data.volumetricLights;
        }
        
        if (data.scanlines !== undefined && this.elements.enableScanlines) {
            this.elements.enableScanlines.checked = data.scanlines;
        }
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
            
            // Add to chat history
            this.addToChatHistory('user', query);
            
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
        this.addMessageToUI(message.role, message.content, message.timestamp);
        
        // Add to chat history for non-system messages
        if (message.role !== 'system') {
            this.addToChatHistory(message.role, message.content, message.timestamp);
        }
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
     * Format message content with Markdown-like processing
     * @param {string} content - Message content
     * @returns {string} Formatted HTML content
     */
    formatMessageContent(content) {
        if (!content) return '';
        
        // Process code blocks
        content = content.replace(/```([\s\S]*?)```/g, (match, code) => {
            return `<pre><code>${this.escapeHtml(code.trim())}</code></pre>`;
        });
        
        // Process inline code
        content = content.replace(/`([^`]+)`/g, (match, code) => {
            return `<code>${this.escapeHtml(code)}</code>`;
        });
        
        // Process paragraphs
        const paragraphs = content.split('\n\n');
        return paragraphs.map(p => {
            // Skip already processed code blocks
            if (p.startsWith('<pre>')) return p;
            
            // Process line breaks
            const lines = p.split('\n').map(line => {
                // Skip already processed inline code
                if (line.includes('<code>')) return line;
                return this.escapeHtml(line);
            });
            
            return `<p>${lines.join('<br>')}</p>`;
        }).join('');
    }
    
    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Add a message to the UI
     * @param {string} role - Message role ('user', 'assistant', or 'system')
     * @param {string} content - Message content
     * @param {string} [timestamp] - Optional timestamp (ISO string)
     */
    addMessageToUI(role, content, timestamp = new Date().toISOString()) {
        // Create container
        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${role}-message-container`;
        
        // Create header
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        // Create avatar
        const messageAvatar = document.createElement('div');
        messageAvatar.className = 'message-avatar';
        
        // Set avatar icon based on role
        let iconName = 'user';
        if (role === 'assistant') {
            iconName = 'robot';
        } else if (role === 'system') {
            iconName = 'info';
        }
        
        messageAvatar.innerHTML = `<iconify-icon icon="ph:${iconName}" width="16"></iconify-icon>`;
        
        // Create name
        const messageName = document.createElement('span');
        messageName.textContent = role === 'user' ? 'You' : role === 'assistant' ? 'Claude' : 'System';
        
        // Create timestamp if provided
        if (timestamp) {
            const messageTime = document.createElement('span');
            messageTime.className = 'message-timestamp';
            
            // Format timestamp
            const date = new Date(timestamp);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            
            messageTime.textContent = `${hours}:${minutes}`;
            messageHeader.appendChild(messageTime);
        }
        
        // Assemble header based on role
        if (role === 'user') {
            messageHeader.appendChild(messageName);
            messageHeader.appendChild(messageAvatar);
        } else {
            messageHeader.appendChild(messageAvatar);
            messageHeader.appendChild(messageName);
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}-message`;
        
        // Format and set content
        if (role === 'system') {
            messageElement.textContent = content;
        } else {
            // For typing animation in assistant messages
            if (role === 'assistant') {
                messageElement.innerHTML = '';
                
                // Start typing animation after a tiny delay
                setTimeout(() => {
                    this.animateTyping(messageElement, content);
                }, 100);
            } else {
                const formattedContent = this.formatMessageContent(content);
                messageElement.innerHTML = formattedContent;
            }
        }
        
        // Add message actions if not system message
        if (role !== 'system') {
            const messageActions = document.createElement('div');
            messageActions.className = 'message-actions';
            
            // Copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'action-button';
            copyButton.innerHTML = '<iconify-icon icon="ph:copy" width="14"></iconify-icon> Copy';
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(content)
                    .then(() => {
                        // Temporarily change button text
                        const originalText = copyButton.innerHTML;
                        copyButton.innerHTML = '<iconify-icon icon="ph:check" width="14"></iconify-icon> Copied!';
                        
                        setTimeout(() => {
                            copyButton.innerHTML = originalText;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy message: ', err);
                    });
            });
            
            messageActions.appendChild(copyButton);
            messageContainer.appendChild(messageActions);
        }
        
        // Assemble message
        messageContainer.appendChild(messageHeader);
        messageContainer.appendChild(messageElement);
        
        // Add to messages container
        this.elements.messagesContainer.appendChild(messageContainer);
        
        // Scroll to bottom
        this.scrollMessagesToBottom();
        
        return messageElement;
    }
    
    /**
     * Animate typing effect for messages
     * @param {HTMLElement} element - Target element
     * @param {string} text - Text to animate
     */
    animateTyping(element, text) {
        // If we need to handle Markdown, pre-format the content
        const formattedContent = this.formatMessageContent(text);
        
        // For HTML content, we need to extract the plain text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formattedContent;
        
        // Set the formatted HTML directly
        element.innerHTML = formattedContent;
        
        // Scroll to keep up with typing
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
        messageContainer.id = 'typing-indicator-container';
        
        // Create header
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        // Create avatar
        const messageAvatar = document.createElement('div');
        messageAvatar.className = 'message-avatar';
        messageAvatar.innerHTML = '<iconify-icon icon="ph:robot" width="16"></iconify-icon>';
        
        // Create name
        const messageName = document.createElement('span');
        messageName.textContent = 'Claude';
        
        // Assemble header
        messageHeader.appendChild(messageAvatar);
        messageHeader.appendChild(messageName);
        
        // Create typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message assistant-message typing-indicator';
        typingIndicator.textContent = 'Claude is thinking...';
        
        // Create typing dots
        const typingDots = document.createElement('div');
        typingDots.className = 'typing-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingDots.appendChild(dot);
        }
        
        typingIndicator.appendChild(typingDots);
        
        // Assemble typing indicator
        messageContainer.appendChild(messageHeader);
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
        const existingIndicator = document.getElementById('typing-indicator-container');
        if (existingIndicator) {
            existingIndicator.remove();
        }
    }
    
    /**
     * Scroll messages container to bottom
     */
    scrollMessagesToBottom() {
        if (this.elements.messagesContainer) {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }
    }
    
    /**
     * Update scroll position for automatic following
     */
    updateScrollPosition() {
        // Only scroll if already near bottom (within 100px)
        const { scrollTop, scrollHeight, clientHeight } = this.elements.messagesContainer;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        
        if (distanceFromBottom < 100) {
            this.scrollMessagesToBottom();
        }
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
        
        // Add appropriate icon based on type
        let iconName = 'info';
        if (type === 'success') iconName = 'check-circle';
        if (type === 'warning') iconName = 'warning';
        if (type === 'error') iconName = 'x-circle';
        
        notificationElement.innerHTML = `
            <iconify-icon icon="ph:${iconName}" width="18"></iconify-icon>
            <span>${message}</span>
        `;
        
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

/**
 * ORGANIX Neural Interface - Enhanced UI Controller
 * 
 * Manages the user interface with an enhanced cyberpunk aesthetic,
 * handling user interactions, displaying information, and coordinating
 * between the 3D visualization and the Claude MCP integration.
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
        
        // Message history
        this.messageHistory = [];
        
        // Cyberpunk theme colors
        this.cyberpunkColors = {
            neonGreen: '#00ff8e',
            acidGreen: '#39ff14',
            neonOrange: '#ff8a00',
            lightBlue: '#3ad6ff',
            electricBlue: '#0cffe1',
            warningRed: '#ff3c3c'
        };
        
        // Initialize the UI
        this.initialize();
        
        console.log('Enhanced UI Controller initialized with cyberpunk theme');
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
        
        // Initialize typing animation
        this.initializeTypingAnimation();
        
        // Add cyberpunk visual effects to UI
        this.applyCyberpunkEffects();
        
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
        this.elements.clearChat = document.getElementById('clear-chat');
        
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
        
        // Loading screen
        this.elements.loadingScreen = document.getElementById('loading-screen');
        this.elements.progressFill = document.querySelector('.progress-fill');
        this.elements.progressText = document.querySelector('.progress-text');
    }
    
    /**
     * Setup event listeners for DOM elements
     */
    setupEventListeners() {
        // Message input
        this.elements.sendButton.addEventListener('click', this.handleSendMessage.bind(this));
        this.elements.userInput.addEventListener('keydown', this.handleInputKeyDown.bind(this));
        this.elements.clearChat.addEventListener('click', this.handleClearChat.bind(this));
        
        // Make textarea auto-resize
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
        window.addEventListener('resize', this.handleResize.bind(this));
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
        this.eventBus.subscribe('scene:loadingProgress', this.updateLoadingProgress.bind(this));
        this.eventBus.subscribe('scene:loadingComplete', this.hideLoadingScreen.bind(this));
        
        // UI events (mostly for notifications)
        this.eventBus.subscribe('ui:notification', this.showNotification.bind(this));
        this.eventBus.subscribe('ui:toggleConnectionPanel', () => this.togglePanel('settingsPanel'));
    }
    
    /**
     * Auto-resize the textarea based on content
     */
    autoResizeTextarea() {
        const textarea = this.elements.userInput;
        
        // Reset height to auto to get correct scrollHeight
        textarea.style.height = 'auto';
        
        // Set to scrollHeight but cap between 60px and 200px
        const newHeight = Math.min(Math.max(textarea.scrollHeight, 60), 200);
        textarea.style.height = newHeight + 'px';
    }
    
    /**
     * Initialize cyberpunk typing animation for messages
     */
    initializeTypingAnimation() {
        // Define CSS for the animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes cyberpunk-typing {
                from { width: 0; }
                to { width: 100%; }
            }
            
            .typing-animation {
                display: inline-block;
                overflow: hidden;
                border-right: 3px solid ${this.cyberpunkColors.electricBlue};
                white-space: nowrap;
                animation: 
                    cyberpunk-typing 1.5s steps(40, end),
                    cursor-blink 0.75s step-end infinite;
            }
            
            @keyframes cursor-blink {
                from, to { border-color: transparent; }
                50% { border-color: ${this.cyberpunkColors.electricBlue}; }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Apply cyberpunk visual effects to UI elements
     */
    applyCyberpunkEffects() {
        // Add glowing border effects
        document.documentElement.style.setProperty('--neon-green', this.cyberpunkColors.neonGreen);
        document.documentElement.style.setProperty('--acid-green', this.cyberpunkColors.acidGreen);
        document.documentElement.style.setProperty('--neon-orange', this.cyberpunkColors.neonOrange);
        document.documentElement.style.setProperty('--light-blue', this.cyberpunkColors.lightBlue);
        document.documentElement.style.setProperty('--electric-blue', this.cyberpunkColors.electricBlue);
        
        // Create data flow animation on loading screen
        const loadingLogo = document.querySelector('.logo-large');
        if (loadingLogo) {
            loadingLogo.style.background = `linear-gradient(90deg, 
                ${this.cyberpunkColors.neonGreen}, 
                ${this.cyberpunkColors.electricBlue}, 
                ${this.cyberpunkColors.neonOrange},
                ${this.cyberpunkColors.acidGreen})`;
            loadingLogo.style.webkitBackgroundClip = 'text';
            loadingLogo.style.backgroundClip = 'text';
            loadingLogo.style.color = 'transparent';
            loadingLogo.style.backgroundSize = '300% 100%';
            loadingLogo.style.animation = 'data-flow 4s linear infinite';
        }
        
        // Add pulse effect to buttons
        const buttons = document.querySelectorAll('.primary-button');
        buttons.forEach(button => {
            button.style.animation = 'pulse-glow 2s infinite';
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
            
            // Load effect settings
            const savedEffects = localStorage.getItem('organix-effects');
            if (savedEffects) {
                const effects = JSON.parse(savedEffects);
                if (effects.glow !== undefined) this.elements.enableGlow.checked = effects.glow;
                if (effects.particles !== undefined) this.elements.enableParticles.checked = effects.particles;
                if (effects.pulses !== undefined) this.elements.enablePulses.checked = effects.pulses;
                if (effects.environment !== undefined) this.elements.enableEnvironment.checked = effects.environment;
                if (effects.volumetric !== undefined && this.elements.enableVolumetric) {
                    this.elements.enableVolumetric.checked = effects.volumetric;
                }
                if (effects.scanlines !== undefined && this.elements.enableScanlines) {
                    this.elements.enableScanlines.checked = effects.scanlines;
                }
                
                // Update visual effects based on loaded settings
                this.updateEffectSettings();
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
        
        // Update MCP mode UI
        this.updateMcpModeUI(this.elements.mcpMode.value);
    }
    
    /**
     * Update effect settings
     */
    updateEffectSettings() {
        // Collect settings from UI
        const effectSettings = {
            glow: this.elements.enableGlow.checked,
            particles: this.elements.enableParticles.checked,
            pulses: this.elements.enablePulses.checked,
            environment: this.elements.enableEnvironment.checked,
            volumetric: this.elements.enableVolumetric ? this.elements.enableVolumetric.checked : true,
            scanlines: this.elements.enableScanlines ? this.elements.enableScanlines.checked : true
        };
        
        // Save to localStorage
        localStorage.setItem('organix-effects', JSON.stringify(effectSettings));
        
        // Publish effect settings to the event bus
        this.eventBus.publish('control:effectSettings', effectSettings);
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
     * Handle send message button click
     */
    handleSendMessage() {
        const message = this.elements.userInput.value.trim();
        
        if (message) {
            // Add message to UI
            this.addMessageToUI('user', message);
            
            // Add message to history
            this.messageHistory.push({
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            });
            
            // Clear input
            this.elements.userInput.value = '';
            this.autoResizeTextarea();
            
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
        // Confirm before clearing
        if (confirm('Are you sure you want to clear the chat history?')) {
            // Clear UI
            this.elements.messagesContainer.innerHTML = '';
            
            // Clear history
            this.messageHistory = [];
            
            // Add system message
            this.addMessageToUI('system', 'Chat history cleared');
            
            // Add welcome message
            setTimeout(() => {
                this.addMessageToUI('assistant', 'The chat history has been cleared. How can I assist you with the neural visualization?');
            }, 500);
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
     * Handle toggle of visual effects
     */
    handleEffectToggle(event) {
        // Update effect settings
        this.updateEffectSettings();
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
            
            // Add to message history
            this.messageHistory.push({
                role: 'user',
                content: query,
                timestamp: new Date().toISOString()
            });
            
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
        // Add message to history
        this.messageHistory.push(message);
        
        // Add message to UI
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
        
        // Position context panel near the object
        // This would require projecting 3D coordinates to 2D screen coordinates
        // For simplicity, we'll just show it at a fixed position for now
    }
    
    /**
     * Update loading progress
     * @param {object} data - Progress data
     */
    updateLoadingProgress(data) {
        const { progress, message } = data;
        
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${progress * 100}%`;
        }
        
        if (this.elements.progressText && message) {
            this.elements.progressText.textContent = message;
        }
    }
    
    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                this.elements.loadingScreen.style.display = 'none';
            }, 500);
        }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Update panels and UI elements as needed
        if (this.elements.messagesContainer) {
            this.scrollMessagesToBottom();
        }
    }
    
    /**
     * Add a message to the UI with enhanced styling
     * @param {string} role - Message role ('user', 'assistant', or 'system')
     * @param {string} content - Message content
     */
    addMessageToUI(role, content) {
        // Create message container
        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${role}-message-container`;
        
        // Create message header
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        // Create avatar
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        // Set avatar icon based on role
        let avatarIcon;
        switch (role) {
            case 'user':
                avatarIcon = 'ph:user';
                break;
            case 'assistant':
                avatarIcon = 'ph:robot';
                break;
            case 'system':
                avatarIcon = 'ph:info';
                break;
            default:
                avatarIcon = 'ph:chat';
        }
        
        // Add icon to avatar
        avatar.innerHTML = `<iconify-icon icon="${avatarIcon}" width="16"></iconify-icon>`;
        
        // Add avatar and role name to header
        messageHeader.appendChild(avatar);
        
        // Add sender name
        const sender = document.createElement('span');
        switch (role) {
            case 'user':
                sender.textContent = 'You';
                break;
            case 'assistant':
                sender.textContent = 'Claude';
                break;
            case 'system':
                sender.textContent = 'System';
                break;
            default:
                sender.textContent = role;
        }
        messageHeader.appendChild(sender);
        
        // Add timestamp for non-system messages
        if (role !== 'system') {
            const timestamp = document.createElement('span');
            timestamp.className = 'message-timestamp';
            timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            messageHeader.appendChild(timestamp);
        }
        
        // For user messages, append the avatar at the end
        if (role === 'user') {
            messageHeader.appendChild(avatar);
            messageHeader.insertBefore(sender, messageHeader.firstChild);
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}-message`;
        
        // Format content (handle markdown, code blocks, etc.)
        const formattedContent = this.formatMessageContent(content);
        messageElement.innerHTML = formattedContent;
        
        // Add components to message container
        messageContainer.appendChild(messageHeader);
        messageContainer.appendChild(messageElement);
        
        // Add message actions for non-system messages
        if (role !== 'system') {
            const messageActions = document.createElement('div');
            messageActions.className = 'message-actions';
            
            // Only add copy button for now
            if (role === 'assistant') {
                const copyButton = document.createElement('button');
                copyButton.className = 'action-button';
                copyButton.innerHTML = '<iconify-icon icon="ph:copy" width="14"></iconify-icon> Copy';
                copyButton.addEventListener('click', () => this.copyMessageToClipboard(content));
                messageActions.appendChild(copyButton);
            }
            
            messageContainer.appendChild(messageActions);
        }
        
        // Add to messages container
        this.elements.messagesContainer.appendChild(messageContainer);
        
        // Apply typing animation for assistant messages (optional)
        if (role === 'assistant' && content.length < 500) {
            const textElement = messageElement.querySelector('p') || messageElement;
            if (textElement && !textElement.classList.contains('typing-animation')) {
                const originalContent = textElement.innerHTML;
                textElement.innerHTML = '';
                textElement.classList.add('typing-animation');
                
                // Reset after animation completes
                setTimeout(() => {
                    textElement.innerHTML = originalContent;
                    textElement.classList.remove('typing-animation');
                }, 1500);
            }
        }
        
        // Scroll to bottom
        this.scrollMessagesToBottom();
    }
    
    /**
     * Format message content with markdown-like features
     * @param {string} content - Raw message content
     * @returns {string} Formatted HTML content
     */
    formatMessageContent(content) {
        // Simple converter for basic markdown-like syntax
        let formatted = content
            // Handle paragraphs
            .split('\n\n').map(para => `<p>${para}</p>`).join('')
            // Handle code blocks
            .replace(/```([a-z]*)\n([\s\S]*?)\n```/g, (_, lang, code) => {
                return `<pre><code class="language-${lang}">${this.escapeHTML(code.trim())}</code></pre>`;
            })
            // Handle inline code
            .replace(/`([^`]+)`/g, (_, code) => {
                return `<code>${this.escapeHTML(code)}</code>`;
            });
        
        // If no paragraphs were created (no double newlines), wrap in a single paragraph
        if (!formatted.includes('<p>')) {
            formatted = `<p>${formatted}</p>`;
        }
        
        return formatted;
    }
    
    /**
     * Escape HTML special characters
     * @param {string} html - Raw HTML
     * @returns {string} Escaped HTML
     */
    escapeHTML(html) {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    /**
     * Copy message content to clipboard
     * @param {string} content - Message content to copy
     */
    copyMessageToClipboard(content) {
        navigator.clipboard.writeText(content).then(() => {
            this.showNotification({
                type: 'success',
                message: 'Copied to clipboard',
                duration: 2000
            });
        }).catch(err => {
            console.error('Failed to copy text:', err);
            this.showNotification({
                type: 'error',
                message: 'Failed to copy to clipboard',
                duration: 3000
            });
        });
    }
    
    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        // Remove existing typing indicator
        this.hideTypingIndicator();
        
        // Create typing indicator container
        const messageContainer = document.createElement('div');
        messageContainer.className = 'message-container assistant-message-container';
        messageContainer.id = 'typing-indicator-container';
        
        // Create message header
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        // Create avatar
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<iconify-icon icon="ph:robot" width="16"></iconify-icon>';
        
        // Add avatar and role name to header
        messageHeader.appendChild(avatar);
        messageHeader.appendChild(document.createTextNode('Claude'));
        
        // Create typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typing-indicator';
        typingIndicator.className = 'message assistant-message typing-indicator';
        typingIndicator.textContent = 'Claude is thinking';
        
        // Add typing dots
        const typingDots = document.createElement('div');
        typingDots.className = 'typing-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingDots.appendChild(dot);
        }
        
        typingIndicator.appendChild(typingDots);
        
        // Add components to message container
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
        let iconName;
        switch (type) {
            case 'success':
                iconName = 'ph:check-circle';
                break;
            case 'warning':
                iconName = 'ph:warning';
                break;
            case 'error':
                iconName = 'ph:x-circle';
                break;
            case 'info':
            default:
                iconName = 'ph:info';
        }
        
        notificationElement.innerHTML = `
            <iconify-icon icon="${iconName}" width="16"></iconify-icon>
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

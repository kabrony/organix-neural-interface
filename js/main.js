/**
 * ORGANIX Neural Interface - Main Application
 * 
 * This is the entry point for the ORGANIX application that coordinates
 * the 3D visualization environment and Claude AI integration via MCP.
 */

import { NeuralScene } from './neuralScene.js';
import { MCPConnector } from './mcpConnector.js';
import { UIController } from './uiController.js';
import { EventBus } from './utils/eventBus.js';
import { LoadingManager } from './utils/loadingManager.js';
import OrganixMcpClient from './organixMcpClient.js';

class OrganixApp {
    constructor() {
        console.log('Initializing ORGANIX Neural Interface...');
        
        // Create global event bus
        this.eventBus = new EventBus();
        window.organixEvents = this.eventBus;
        
        // Create loading manager
        this.loadingManager = new LoadingManager('#loading-screen');
        
        // Setup core components
        this.initializeComponents();
    }
    
    async initializeComponents() {
        try {
            // Start loading sequence
            this.loadingManager.show('Initializing core systems...');
            
            // Initialize neural scene (3D environment)
            this.loadingManager.updateProgress(10, 'Initializing neural scene...');
            this.neuralScene = new NeuralScene('#visualization-container', this.eventBus);
            await this.neuralScene.initialize();
            
            // Initialize MCP components
            this.loadingManager.updateProgress(30, 'Initializing MCP components...');
            
            // Initialize real MCP client for direct Claude integration
            this.mcpClient = new OrganixMcpClient(this.eventBus);
            await this.mcpClient.initialize();
            
            // Initialize the simulation MCP connector (fallback for demo purposes)
            this.mcpConnector = new MCPConnector(this.eventBus);
            
            // Initialize UI controller
            this.loadingManager.updateProgress(70, 'Initializing user interface...');
            this.uiController = new UIController(this.eventBus, this.neuralScene, this.mcpConnector);
            
            // Register global event handlers
            this.setupEventHandlers();
            
            // Complete initialization
            this.loadingManager.updateProgress(100, 'Neural interface ready');
            setTimeout(() => {
                this.loadingManager.hide();
                this.onAppReady();
            }, 500);
            
            console.log('ORGANIX Neural Interface initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ORGANIX Neural Interface:', error);
            this.loadingManager.showError(`Initialization failed: ${error.message}`);
        }
    }
    
    setupEventHandlers() {
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Handle keyboard shortcuts
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Setup MCP-specific event handlers
        this.setupMcpEventHandlers();
    }
    
    setupMcpEventHandlers() {
        // Handle MCP communication mode changes
        this.eventBus.subscribe('settings:mcpMode', this.handleMcpModeChange.bind(this));
        
        // Handle scene state updates to sync with Claude
        this.eventBus.subscribe('scene:stateUpdate', this.handleSceneStateUpdate.bind(this));
        
        // Handle object interactions to notify Claude
        this.eventBus.subscribe('scene:objectInteraction', this.handleObjectInteraction.bind(this));
    }
    
    handleMcpModeChange(mode) {
        console.log(`Switching MCP mode to: ${mode}`);
        
        // Valid modes are 'real' (actual Claude connection) or 'simulation' (demo mode)
        switch (mode) {
            case 'real':
                // Disconnect simulated MCP if connected
                if (this.mcpConnector.connected) {
                    this.mcpConnector.disconnect();
                }
                
                // Use the real MCP client for messaging
                this.activeMcpHandler = this.mcpClient;
                
                // Show notification about real MCP mode
                this.eventBus.publish('ui:notification', {
                    type: 'info',
                    message: 'Using real Claude MCP connection mode',
                    duration: 3000
                });
                break;
                
            case 'simulation':
            default:
                // Disconnect real MCP if connected
                if (this.mcpClient.isConnected) {
                    this.mcpClient.disconnect();
                }
                
                // Use the simulation MCP connector for messaging
                this.activeMcpHandler = this.mcpConnector;
                
                // Show notification about simulation mode
                this.eventBus.publish('ui:notification', {
                    type: 'info',
                    message: 'Using simulated Claude responses (demo mode)',
                    duration: 3000
                });
                break;
        }
    }
    
    handleSceneStateUpdate(state) {
        // Only forward to real MCP client when in real mode
        if (this.activeMcpHandler === this.mcpClient && this.mcpClient.isConnected) {
            this.mcpClient.updateSceneState(state);
        }
    }
    
    handleObjectInteraction(interactionData) {
        // Only forward to real MCP client when in real mode
        if (this.activeMcpHandler === this.mcpClient && this.mcpClient.isConnected) {
            this.mcpClient.notifyObjectInteraction(interactionData);
        }
    }
    
    handleResize() {
        this.neuralScene.resize();
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause intensive operations when tab is not visible
            this.neuralScene.pause();
        } else {
            // Resume operations when tab becomes visible again
            this.neuralScene.resume();
        }
    }
    
    handleKeyDown(event) {
        // ESC key to close any open panels
        if (event.key === 'Escape') {
            this.uiController.closeAllPanels();
        }
        
        // Ctrl+/ to toggle help panel
        if (event.key === '/' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            this.uiController.toggleHelpPanel();
        }
        
        // Shift+C to toggle MCP connection panel
        if (event.key === 'C' && event.shiftKey) {
            event.preventDefault();
            this.eventBus.publish('ui:toggleConnectionPanel');
        }
    }
    
    onAppReady() {
        // Determine initial MCP mode based on previous setting
        const savedMcpMode = localStorage.getItem('organix-mcp-mode') || 'simulation';
        this.handleMcpModeChange(savedMcpMode);
        
        // Show welcome message
        this.uiController.showNotification({
            type: 'info',
            message: 'Welcome to ORGANIX Neural Interface',
            duration: 5000
        });
        
        // Try to automatically connect to MCP if previously connected
        if (savedMcpMode === 'real') {
            this.tryAutoConnectToMcp();
        }
        
        // Start the render loop
        this.neuralScene.startRenderLoop();
    }
    
    async tryAutoConnectToMcp() {
        // Check for stored MCP connection settings
        const mcpConfig = localStorage.getItem('organix-mcp-config');
        
        if (mcpConfig) {
            try {
                const config = JSON.parse(mcpConfig);
                
                if (config.endpoint) {
                    this.uiController.showNotification({
                        type: 'info',
                        message: 'Attempting to connect to Claude via MCP...',
                        duration: 3000
                    });
                    
                    this.eventBus.publish('mcp:connect', {
                        endpoint: config.endpoint
                    });
                }
            } catch (error) {
                console.error('Failed to auto-connect to MCP:', error);
                
                this.uiController.showNotification({
                    type: 'error',
                    message: 'Failed to automatically connect to MCP',
                    duration: 5000
                });
            }
        }
    }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create the application
    window.organixApp = new OrganixApp();
});

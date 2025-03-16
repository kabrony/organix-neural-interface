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
            
            // Initialize MCP connector
            this.loadingManager.updateProgress(40, 'Establishing MCP connection...');
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
    }
    
    onAppReady() {
        // Show welcome message
        this.uiController.showNotification({
            type: 'info',
            message: 'Welcome to ORGANIX Neural Interface',
            duration: 5000
        });
        
        // Try to automatically connect to MCP
        this.tryAutoConnect();
        
        // Start the render loop
        this.neuralScene.startRenderLoop();
    }
    
    async tryAutoConnect() {
        // Check for stored MCP connection settings
        const mcpSettings = localStorage.getItem('organix-mcp-settings');
        
        if (mcpSettings) {
            try {
                const settings = JSON.parse(mcpSettings);
                
                if (settings.autoConnect && settings.endpoint) {
                    this.uiController.showNotification({
                        type: 'info',
                        message: 'Attempting to connect to Claude via MCP...',
                        duration: 3000
                    });
                    
                    await this.mcpConnector.connect(settings.endpoint, settings.apiKey);
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

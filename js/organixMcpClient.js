/**
 * ORGANIX Neural Interface - MCP Client
 * 
 * A real MCP client that connects the ORGANIX neural interface with Claude
 * using the Model Context Protocol. This enables direct bidirectional 
 * communication between the 3D visualization and Claude.
 */

class OrganixMcpClient {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.isConnected = false;
        this.isInitialized = false;
        this.messageQueue = [];
        this.websocket = null;
        this.sessionId = '';
        this.apiKey = '';
        this.clientId = `organix-${Date.now()}`;
        this.pendingRequests = new Map();
        this.messageHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000; // Start with 2 seconds
        
        // Register handlers for various message types
        this.registerMessageHandlers();
        
        console.log('ORGANIX MCP Client created');
    }
    
    /**
     * Initialize the MCP client
     */
    async initialize() {
        if (this.isInitialized) {
            return true;
        }
        
        try {
            // Load configuration from localStorage if available
            this.loadConfiguration();
            
            // Register event handlers
            this.eventBus.subscribe('mcp:connect', this.connect.bind(this));
            this.eventBus.subscribe('mcp:disconnect', this.disconnect.bind(this));
            this.eventBus.subscribe('mcp:sendMessage', this.sendMessage.bind(this));
            this.eventBus.subscribe('mcp:executeCommand', this.executeCommand.bind(this));
            
            this.isInitialized = true;
            console.log('ORGANIX MCP Client initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize ORGANIX MCP Client:', error);
            return false;
        }
    }
    
    /**
     * Load MCP configuration
     */
    loadConfiguration() {
        // Try to load saved configuration from localStorage
        try {
            const savedConfig = localStorage.getItem('organix-mcp-config');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                if (config.endpoint) {
                    this.endpoint = config.endpoint;
                    // Never store the actual API key in localStorage for security reasons
                    // Just store if it was previously set
                    this.apiKeyWasSet = !!config.apiKeyWasSet;
                    
                    console.log('Loaded MCP configuration from localStorage');
                    this.eventBus.publish('mcp:configLoaded', {
                        endpoint: this.endpoint,
                        apiKeyWasSet: this.apiKeyWasSet
                    });
                }
            }
        } catch (error) {
            console.error('Error loading MCP configuration:', error);
        }
    }
    
    /**
     * Save MCP configuration
     */
    saveConfiguration() {
        try {
            const config = {
                endpoint: this.endpoint,
                apiKeyWasSet: !!this.apiKey
            };
            
            localStorage.setItem('organix-mcp-config', JSON.stringify(config));
            console.log('Saved MCP configuration to localStorage');
        } catch (error) {
            console.error('Error saving MCP configuration:', error);
        }
    }
    
    /**
     * Connect to Claude via MCP
     * @param {object} options - Connection options
     * @param {string} options.endpoint - MCP endpoint URL
     * @param {string} options.apiKey - API key for authentication
     */
    async connect(options = {}) {
        if (this.isConnected || this.websocket) {
            console.log('Already connected or connecting to MCP');
            return;
        }
        
        try {
            // Update status to connecting
            this.eventBus.publish('mcp:statusChange', { status: 'connecting' });
            
            // Store connection information
            this.endpoint = options.endpoint || this.endpoint;
            if (options.apiKey) {
                this.apiKey = options.apiKey;
            }
            
            if (!this.endpoint) {
                throw new Error('No MCP endpoint specified');
            }
            
            console.log(`Connecting to MCP at ${this.endpoint}...`);
            
            // Create a WebSocket connection to the MCP endpoint
            this.websocket = new WebSocket(this.endpoint);
            
            // Setup WebSocket event handlers
            this.websocket.onopen = this.handleWebSocketOpen.bind(this);
            this.websocket.onmessage = this.handleWebSocketMessage.bind(this);
            this.websocket.onclose = this.handleWebSocketClose.bind(this);
            this.websocket.onerror = this.handleWebSocketError.bind(this);
            
            // Save configuration for future use
            this.saveConfiguration();
            
            return true;
        } catch (error) {
            console.error('Failed to connect to MCP:', error);
            this.eventBus.publish('mcp:statusChange', { status: 'disconnected' });
            this.eventBus.publish('mcp:error', {
                type: 'connection',
                message: `Failed to connect to MCP: ${error.message}`
            });
            
            return false;
        }
    }
    
    /**
     * Disconnect from MCP
     */
    disconnect() {
        if (!this.isConnected && !this.websocket) {
            return;
        }
        
        try {
            // Close the WebSocket connection
            if (this.websocket) {
                this.websocket.close(1000, 'Client disconnected');
                this.websocket = null;
            }
            
            // Update status
            this.isConnected = false;
            this.eventBus.publish('mcp:statusChange', { status: 'disconnected' });
            console.log('Disconnected from MCP');
            
            return true;
        } catch (error) {
            console.error('Error disconnecting from MCP:', error);
            
            // Force disconnect state
            this.websocket = null;
            this.isConnected = false;
            this.eventBus.publish('mcp:statusChange', { status: 'disconnected' });
            
            return false;
        }
    }
    
    /**
     * Handle WebSocket open event
     * @param {Event} event - WebSocket open event
     */
    handleWebSocketOpen(event) {
        console.log('WebSocket connection established');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Send authentication message if we have an API key
        if (this.apiKey) {
            this.sendAuthenticationRequest();
        } else {
            // Notify that we're connected but not authenticated
            this.eventBus.publish('mcp:statusChange', { status: 'connected', authenticated: false });
        }
    }
    
    /**
     * Send authentication request
     */
    sendAuthenticationRequest() {
        const authRequest = {
            jsonrpc: '2.0',
            id: this.generateRequestId(),
            method: 'auth',
            params: {
                apiKey: this.apiKey,
                clientId: this.clientId
            }
        };
        
        // Store the pending request
        this.pendingRequests.set(authRequest.id, {
            method: 'auth',
            timestamp: Date.now(),
            resolve: (result) => {
                this.sessionId = result.sessionId;
                this.eventBus.publish('mcp:statusChange', { 
                    status: 'connected', 
                    authenticated: true,
                    sessionId: this.sessionId
                });
                console.log('Successfully authenticated with MCP');
                
                // Process any queued messages
                this.processMessageQueue();
            },
            reject: (error) => {
                console.error('Authentication failed:', error);
                this.eventBus.publish('mcp:statusChange', { status: 'connected', authenticated: false });
                this.eventBus.publish('mcp:error', {
                    type: 'authentication',
                    message: `Authentication failed: ${error.message}`
                });
            }
        });
        
        // Send the request
        this.websocket.send(JSON.stringify(authRequest));
    }
    
    /**
     * Handle WebSocket message event
     * @param {MessageEvent} event - WebSocket message event
     */
    handleWebSocketMessage(event) {
        try {
            const message = JSON.parse(event.data);
            
            // Log the received message
            console.log('Received MCP message:', message);
            
            // Check if it's a response to a request
            if (message.id && this.pendingRequests.has(message.id)) {
                const pendingRequest = this.pendingRequests.get(message.id);
                this.pendingRequests.delete(message.id);
                
                if (message.error) {
                    pendingRequest.reject(message.error);
                } else {
                    pendingRequest.resolve(message.result);
                }
                
                return;
            }
            
            // Check if it's a notification
            if (!message.id && message.method) {
                // Process the notification
                this.processNotification(message);
                return;
            }
            
            // Unknown message format
            console.warn('Unknown message format:', message);
        } catch (error) {
            console.error('Error processing WebSocket message:', error);
        }
    }
    
    /**
     * Process an MCP notification
     * @param {object} notification - MCP notification
     */
    processNotification(notification) {
        // Check if we have a handler for this method
        if (this.messageHandlers.has(notification.method)) {
            const handler = this.messageHandlers.get(notification.method);
            handler(notification.params);
        } else {
            console.warn(`No handler registered for notification method: ${notification.method}`);
        }
    }
    
    /**
     * Register handlers for different message types
     */
    registerMessageHandlers() {
        // Handle agent messages
        this.messageHandlers.set('agent/message', (params) => {
            this.eventBus.publish('mcp:message', {
                role: 'assistant',
                content: params.content,
                timestamp: new Date().toISOString()
            });
        });
        
        // Handle scene commands
        this.messageHandlers.set('scene/command', (params) => {
            this.eventBus.publish('mcp:command', params);
        });
        
        // Handle typing indicator
        this.messageHandlers.set('agent/typing', (params) => {
            if (params.typing) {
                this.eventBus.publish('mcp:typingStart');
            } else {
                this.eventBus.publish('mcp:typingEnd');
            }
        });
        
        // Handle status updates
        this.messageHandlers.set('status/update', (params) => {
            this.eventBus.publish('mcp:status', params);
        });
    }
    
    /**
     * Handle WebSocket close event
     * @param {CloseEvent} event - WebSocket close event
     */
    handleWebSocketClose(event) {
        console.log(`WebSocket connection closed: ${event.code} - ${event.reason}`);
        this.isConnected = false;
        this.websocket = null;
        
        // Update status
        this.eventBus.publish('mcp:statusChange', { status: 'disconnected' });
        
        // Attempt to reconnect if the close was unexpected
        if (event.code !== 1000 && event.code !== 1001) {
            this.attemptReconnect();
        }
    }
    
    /**
     * Handle WebSocket error event
     * @param {Event} event - WebSocket error event
     */
    handleWebSocketError(event) {
        console.error('WebSocket error:', event);
        
        this.eventBus.publish('mcp:error', {
            type: 'websocket',
            message: 'WebSocket error'
        });
    }
    
    /**
     * Attempt to reconnect to MCP
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error(`Maximum reconnection attempts (${this.maxReconnectAttempts}) reached`);
            return;
        }
        
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
        
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts} of ${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            if (!this.isConnected) {
                this.connect({
                    endpoint: this.endpoint,
                    apiKey: this.apiKey
                });
            }
        }, delay);
    }
    
    /**
     * Process the message queue
     */
    processMessageQueue() {
        if (this.messageQueue.length === 0) {
            return;
        }
        
        console.log(`Processing ${this.messageQueue.length} queued messages`);
        
        // Process each message in the queue
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.sendMessage(message);
        }
    }
    
    /**
     * Send a message to Claude
     * @param {object} message - Message to send
     * @param {string} message.content - Message content
     */
    async sendMessage(message) {
        if (!this.isInitialized) {
            throw new Error('MCP client not initialized');
        }
        
        // If not connected, queue the message for later
        if (!this.isConnected || !this.websocket) {
            this.messageQueue.push(message);
            
            this.eventBus.publish('mcp:error', {
                type: 'message',
                message: 'Not connected to MCP. Message queued for later delivery.'
            });
            
            return false;
        }
        
        try {
            console.log('Sending message to Claude:', message);
            
            // Create the request
            const request = {
                jsonrpc: '2.0',
                id: this.generateRequestId(),
                method: 'agent/message',
                params: {
                    sessionId: this.sessionId,
                    content: message.content,
                    // Include any visualization context relevant to the message
                    context: {
                        visualizationState: message.visualizationState || {}
                    }
                }
            };
            
            // Create a promise for the response
            const responsePromise = new Promise((resolve, reject) => {
                this.pendingRequests.set(request.id, {
                    method: 'agent/message',
                    timestamp: Date.now(),
                    resolve,
                    reject
                });
            });
            
            // Send the request
            this.websocket.send(JSON.stringify(request));
            
            // Wait for a response
            await responsePromise;
            
            return true;
        } catch (error) {
            console.error('Error sending message to Claude:', error);
            
            this.eventBus.publish('mcp:error', {
                type: 'message',
                message: `Error sending message: ${error.message}`
            });
            
            return false;
        }
    }
    
    /**
     * Execute a command on the MCP server
     * @param {object} command - Command to execute
     * @param {string} command.method - Command method
     * @param {object} command.params - Command parameters
     * @returns {Promise<object>} Command result
     */
    async executeCommand(command) {
        if (!this.isInitialized) {
            throw new Error('MCP client not initialized');
        }
        
        if (!this.isConnected || !this.websocket) {
            throw new Error('Not connected to MCP');
        }
        
        try {
            console.log('Executing MCP command:', command);
            
            // Create the request
            const request = {
                jsonrpc: '2.0',
                id: this.generateRequestId(),
                method: command.method,
                params: {
                    sessionId: this.sessionId,
                    ...command.params
                }
            };
            
            // Create a promise for the response
            const responsePromise = new Promise((resolve, reject) => {
                this.pendingRequests.set(request.id, {
                    method: command.method,
                    timestamp: Date.now(),
                    resolve,
                    reject
                });
            });
            
            // Send the request
            this.websocket.send(JSON.stringify(request));
            
            // Wait for a response
            const result = await responsePromise;
            
            return result;
        } catch (error) {
            console.error('Error executing MCP command:', error);
            throw error;
        }
    }
    
    /**
     * Generate a unique request ID
     * @returns {string} Request ID
     */
    generateRequestId() {
        return `organix-req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Notify the MCP server about scene state changes
     * @param {object} state - Scene state
     */
    updateSceneState(state) {
        if (!this.isConnected || !this.sessionId) {
            return;
        }
        
        try {
            const notification = {
                jsonrpc: '2.0',
                method: 'scene/state',
                params: {
                    sessionId: this.sessionId,
                    state
                }
            };
            
            this.websocket.send(JSON.stringify(notification));
        } catch (error) {
            console.error('Error updating scene state:', error);
        }
    }
    
    /**
     * Notify the MCP server about user interaction with an object
     * @param {object} interactionData - Interaction data
     */
    notifyObjectInteraction(interactionData) {
        if (!this.isConnected || !this.sessionId) {
            return;
        }
        
        try {
            const notification = {
                jsonrpc: '2.0',
                method: 'scene/interaction',
                params: {
                    sessionId: this.sessionId,
                    interaction: interactionData
                }
            };
            
            this.websocket.send(JSON.stringify(notification));
        } catch (error) {
            console.error('Error notifying object interaction:', error);
        }
    }
}

export default OrganixMcpClient;

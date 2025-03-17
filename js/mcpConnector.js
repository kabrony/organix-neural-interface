/**
 * ORGANIX Neural Interface - MCP Connector
 * 
 * Handles real-time communication with Claude AI via the Model Context Protocol (MCP).
 * This component manages bidirectional data flow between the 3D visualization
 * and Claude, enabling each to influence and respond to the other.
 */

export class MCPConnector {
    constructor(eventBus) {
        this.eventBus = eventBus;
        
        // Connection state
        this.connected = false;
        this.connecting = false;
        this.socket = null;
        this.endpoint = '';
        this.apiKey = '';
        
        // Session data
        this.sessionId = null;
        this.messageHistory = [];
        this.conversationId = null;
        
        // Command queue for processing sequential actions
        this.commandQueue = [];
        this.processingCommands = false;
        
        // Reconnection parameters
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        
        // Register for events
        this.registerEvents();
        
        console.log('MCP Connector initialized');
    }
    
    /**
     * Register for events from the event bus
     */
    registerEvents() {
        this.eventBus.subscribe('ui:sendMessage', this.sendMessage.bind(this));
        this.eventBus.subscribe('mcp:connect', this.connect.bind(this));
        this.eventBus.subscribe('mcp:disconnect', this.disconnect.bind(this));
        this.eventBus.subscribe('scene:objectInteraction', this.handleObjectInteraction.bind(this));
    }
    
    /**
     * Connect to Claude via MCP WebSocket
     * @param {object} config - Connection configuration
     * @param {string} config.endpoint - MCP endpoint URL
     * @param {string} config.apiKey - API key for authentication
     */
    async connect(config) {
        if (this.connected || this.connecting) {
            return;
        }
        
        this.connecting = true;
        this.endpoint = config.endpoint;
        this.apiKey = config.apiKey;
        
        try {
            this.eventBus.publish('mcp:statusChange', { status: 'connecting' });
            
            console.log(`Connecting to MCP at ${this.endpoint}...`);
            
            // Create WebSocket connection
            this.socket = new WebSocket(this.endpoint);
            
            // Setup socket event handlers
            this.socket.onopen = this.handleSocketOpen.bind(this);
            this.socket.onmessage = this.handleSocketMessage.bind(this);
            this.socket.onclose = this.handleSocketClose.bind(this);
            this.socket.onerror = this.handleSocketError.bind(this);
            
            return true;
        } catch (error) {
            console.error('Failed to connect to MCP:', error);
            
            // Reset connection state
            this.connected = false;
            this.connecting = false;
            
            // Notify of connection failure
            this.eventBus.publish('mcp:statusChange', { status: 'disconnected' });
            this.eventBus.publish('mcp:error', {
                type: 'connection',
                message: `Failed to connect to MCP: ${error.message}`
            });
            
            return false;
        }
    }
    
    /**
     * Handle WebSocket open event
     */
    handleSocketOpen(event) {
        console.log('MCP WebSocket connection established');
        
        // Send authentication message
        this.sendAuthMessage();
    }
    
    /**
     * Send authentication message to the MCP server
     */
    sendAuthMessage() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            return;
        }
        
        // Create authentication message
        const authMessage = {
            type: 'authentication',
            api_key: this.apiKey,
            client_info: {
                type: 'organix_neural_interface',
                version: '1.2.0'
            }
        };
        
        // Send authentication message
        this.socket.send(JSON.stringify(authMessage));
    }
    
    /**
     * Handle WebSocket message event
     */
    handleSocketMessage(event) {
        try {
            const message = JSON.parse(event.data);
            console.log('Received MCP message:', message);
            
            switch (message.type) {
                case 'authentication_success':
                    this.handleAuthSuccess(message);
                    break;
                    
                case 'authentication_failure':
                    this.handleAuthFailure(message);
                    break;
                    
                case 'message':
                    this.handleIncomingMessage(message);
                    break;
                    
                case 'command':
                    this.handleCommand(message);
                    break;
                    
                case 'error':
                    this.handleError(message);
                    break;
                    
                case 'ping':
                    this.handlePing(message);
                    break;
                    
                default:
                    console.warn(`Unknown message type: ${message.type}`);
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    }
    
    /**
     * Handle successful authentication
     */
    handleAuthSuccess(message) {
        this.connected = true;
        this.connecting = false;
        this.reconnectAttempts = 0;
        
        // Save session ID
        this.sessionId = message.session_id;
        this.conversationId = message.conversation_id || null;
        
        // Save connection settings
        this.saveConnectionSettings(this.endpoint, this.apiKey);
        
        // Notify of successful connection
        this.eventBus.publish('mcp:statusChange', { status: 'connected' });
        this.eventBus.publish('mcp:connected', { 
            sessionId: this.sessionId,
            conversationId: this.conversationId
        });
        
        // Add system message to UI
        this.eventBus.publish('mcp:message', {
            role: 'system',
            content: 'Connected to Claude via MCP.',
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Handle authentication failure
     */
    handleAuthFailure(message) {
        this.connected = false;
        this.connecting = false;
        
        // Notify of authentication failure
        this.eventBus.publish('mcp:statusChange', { status: 'disconnected' });
        this.eventBus.publish('mcp:error', {
            type: 'authentication',
            message: message.error || 'Authentication failed'
        });
        
        // Close socket
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
    
    /**
     * Handle incoming message from Claude
     */
    handleIncomingMessage(message) {
        // End typing indicator if active
        this.eventBus.publish('mcp:typingEnd');
        
        // Create message object
        const responseMessage = {
            role: 'assistant',
            content: message.content,
            timestamp: new Date().toISOString()
        };
        
        // Add to message history
        this.messageHistory.push(responseMessage);
        
        // Publish the response
        this.eventBus.publish('mcp:message', responseMessage);
        
        // Process any commands in the response
        if (message.commands && message.commands.length > 0) {
            this.processCommands(message.commands);
        }
    }
    
    /**
     * Handle command message
     */
    handleCommand(message) {
        if (message.command) {
            this.processCommands([message.command]);
        }
    }
    
    /**
     * Handle error message
     */
    handleError(message) {
        console.error('MCP error:', message.error);
        
        this.eventBus.publish('mcp:error', {
            type: message.error_type || 'unknown',
            message: message.error || 'Unknown error'
        });
    }
    
    /**
     * Handle ping message (send pong response)
     */
    handlePing(message) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            return;
        }
        
        const pongMessage = {
            type: 'pong',
            id: message.id
        };
        
        this.socket.send(JSON.stringify(pongMessage));
    }
    
    /**
     * Handle WebSocket close event
     */
    handleSocketClose(event) {
        const wasConnected = this.connected;
        
        // Reset connection state
        this.connected = false;
        this.connecting = false;
        
        // Notify of disconnection
        this.eventBus.publish('mcp:statusChange', { status: 'disconnected' });
        
        // Attempt to reconnect if connection was established before
        if (wasConnected && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
        } else if (wasConnected) {
            this.eventBus.publish('mcp:disconnected');
            this.eventBus.publish('mcp:message', {
                role: 'system',
                content: 'Disconnected from Claude. Reconnection attempts exhausted.',
                timestamp: new Date().toISOString()
            });
        }
    }
    
    /**
     * Handle WebSocket error event
     */
    handleSocketError(event) {
        console.error('WebSocket error:', event);
        
        this.eventBus.publish('mcp:error', {
            type: 'websocket',
            message: 'WebSocket connection error'
        });
    }
    
    /**
     * Attempt to reconnect with exponential backoff
     */
    attemptReconnect() {
        this.reconnectAttempts++;
        const delay = Math.min(30000, this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1));
        
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
        
        this.eventBus.publish('mcp:message', {
            role: 'system',
            content: `Connection lost. Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
            timestamp: new Date().toISOString()
        });
        
        setTimeout(() => {
            if (!this.connected && !this.connecting) {
                this.connect({
                    endpoint: this.endpoint,
                    apiKey: this.apiKey
                });
            }
        }, delay);
    }
    
    /**
     * Disconnect from MCP
     */
    async disconnect() {
        if (!this.connected && !this.connecting) {
            return;
        }
        
        try {
            console.log('Disconnecting from MCP...');
            
            // Send close message if socket is open
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                const closeMessage = {
                    type: 'close',
                    session_id: this.sessionId
                };
                
                this.socket.send(JSON.stringify(closeMessage));
                
                // Give the server a moment to process the close message
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Close the socket
            if (this.socket) {
                this.socket.close();
                this.socket = null;
            }
            
            // Reset connection state
            this.connected = false;
            this.connecting = false;
            this.sessionId = null;
            this.reconnectAttempts = 0;
            
            // Notify of disconnection
            this.eventBus.publish('mcp:statusChange', { status: 'disconnected' });
            this.eventBus.publish('mcp:disconnected');
            this.eventBus.publish('mcp:message', {
                role: 'system',
                content: 'Disconnected from Claude.',
                timestamp: new Date().toISOString()
            });
            
            return true;
        } catch (error) {
            console.error('Error during MCP disconnection:', error);
            
            // Force disconnect in case of error
            this.connected = false;
            this.connecting = false;
            this.sessionId = null;
            this.socket = null;
            
            // Notify of disconnection
            this.eventBus.publish('mcp:statusChange', { status: 'disconnected' });
            this.eventBus.publish('mcp:disconnected');
            
            return false;
        }
    }
    
    /**
     * Send a message to Claude via MCP
     * @param {string} content - Message content
     */
    async sendMessage(content) {
        if (!this.connected || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.eventBus.publish('mcp:error', {
                type: 'message',
                message: 'Cannot send message: Not connected to MCP'
            });
            return false;
        }
        
        try {
            console.log('Sending message to Claude:', content);
            
            // Create message object for UI
            const uiMessage = {
                role: 'user',
                content: content,
                timestamp: new Date().toISOString()
            };
            
            // Add to message history
            this.messageHistory.push(uiMessage);
            
            // Start typing indicator
            this.eventBus.publish('mcp:typingStart');
            
            // Create message object for MCP
            const mcpMessage = {
                type: 'message',
                session_id: this.sessionId,
                conversation_id: this.conversationId,
                message: {
                    role: 'user',
                    content: content
                }
            };
            
            // Send message
            this.socket.send(JSON.stringify(mcpMessage));
            
            return true;
        } catch (error) {
            console.error('Error sending message to Claude:', error);
            
            // End typing indicator
            this.eventBus.publish('mcp:typingEnd');
            
            // Notify of error
            this.eventBus.publish('mcp:error', {
                type: 'message',
                message: `Error sending message: ${error.message}`
            });
            
            return false;
        }
    }
    
    /**
     * Handle interaction with an object in the 3D scene
     * @param {object} data - Interaction data
     */
    handleObjectInteraction(data) {
        if (!this.connected) {
            return;
        }
        
        console.log('Object interaction:', data);
        
        // Send a query about the object
        const messageContent = `Tell me about the ${data.name} component in the neural interface.`;
        
        // Publish event for UI
        this.eventBus.publish('mcp:objectQuery', {
            object: data,
            query: messageContent
        });
        
        // Send the message
        this.sendMessage(messageContent);
    }
    
    /**
     * Process commands from Claude
     * @param {Array} commands - Array of commands to process
     */
    processCommands(commands) {
        // Add commands to queue
        this.commandQueue.push(...commands);
        
        // Start processing if not already in progress
        if (!this.processingCommands) {
            this.processNextCommand();
        }
    }
    
    /**
     * Process the next command in the queue
     */
    async processNextCommand() {
        if (this.commandQueue.length === 0) {
            this.processingCommands = false;
            return;
        }
        
        this.processingCommands = true;
        const command = this.commandQueue.shift();
        
        try {
            console.log('Processing command:', command);
            
            switch (command.type) {
                case 'highlight':
                    await this.executeHighlightCommand(command);
                    break;
                    
                case 'pulse':
                    await this.executePulseCommand(command);
                    break;
                    
                case 'camera':
                    await this.executeCameraCommand(command);
                    break;
                    
                case 'create':
                    await this.executeCreateCommand(command);
                    break;
                    
                default:
                    console.warn(`Unknown command type: ${command.type}`);
                    break;
            }
            
            // Process next command with a small delay
            setTimeout(() => this.processNextCommand(), 300);
        } catch (error) {
            console.error('Error processing command:', error);
            
            // Continue with next command despite error
            setTimeout(() => this.processNextCommand(), 300);
        }
    }
    
    /**
     * Execute a highlight command
     * @param {object} command - Highlight command
     */
    async executeHighlightCommand(command) {
        this.eventBus.publish('scene:highlightObject', {
            objectId: command.target,
            duration: command.params?.duration || 2000,
            color: command.params?.color
        });
        
        // Allow time for animation
        await new Promise(resolve => setTimeout(resolve, command.params?.duration || 2000));
    }
    
    /**
     * Execute a pulse command
     * @param {object} command - Pulse command
     */
    async executePulseCommand(command) {
        this.eventBus.publish('scene:pulseObject', {
            objectId: command.target,
            color: command.params?.color,
            intensity: command.params?.intensity || 1.0
        });
        
        // Allow time for animation
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    /**
     * Execute a camera command
     * @param {object} command - Camera command
     */
    async executeCameraCommand(command) {
        switch (command.action) {
            case 'moveTo':
                this.eventBus.publish('scene:moveCameraTo', {
                    target: command.params?.target,
                    position: command.params?.position,
                    duration: command.params?.duration || 2000
                });
                break;
                
            case 'lookAt':
                this.eventBus.publish('scene:lookAt', {
                    target: command.params?.target,
                    duration: command.params?.duration || 1000
                });
                break;
                
            case 'orbit':
                this.eventBus.publish('scene:orbitAround', {
                    target: command.params?.target,
                    duration: command.params?.duration || 5000
                });
                break;
                
            case 'reset':
                this.eventBus.publish('scene:resetCamera');
                break;
                
            default:
                console.warn(`Unknown camera action: ${command.action}`);
                break;
        }
        
        // Allow time for camera movement
        await new Promise(resolve => setTimeout(resolve, 
            command.params?.duration || 2000));
    }
    
    /**
     * Execute a create command
     * @param {object} command - Create command
     */
    async executeCreateCommand(command) {
        this.eventBus.publish('scene:createObject', {
            type: command.objectType,
            params: command.params
        });
        
        // Allow time for creation and any animations
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    /**
     * Save connection settings to localStorage
     * @param {string} endpoint - MCP endpoint URL
     * @param {string} apiKey - API key
     */
    saveConnectionSettings(endpoint, apiKey) {
        try {
            const settings = {
                endpoint,
                apiKeySet: apiKey ? true : false, // Never store actual API key
                lastConnected: new Date().toISOString()
            };
            
            localStorage.setItem('organix-mcp-settings', JSON.stringify(settings));
        } catch (error) {
            console.error('Failed to save connection settings:', error);
        }
    }
}

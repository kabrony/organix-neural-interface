/**
 * ORGANIX Neural Interface - MCP Connector
 * 
 * Handles communication with Claude AI via the Model Context Protocol (MCP).
 * This component manages bidirectional data flow between the 3D visualization
 * and Claude, enabling each to influence and respond to the other.
 */

export class MCPConnector {
    constructor(eventBus) {
        this.eventBus = eventBus;
        
        // Connection state
        this.connected = false;
        this.connecting = false;
        this.endpoint = '';
        this.apiKey = '';
        
        // Session data
        this.sessionId = null;
        this.messageHistory = [];
        
        // Command queue for processing sequential actions
        this.commandQueue = [];
        this.processingCommands = false;
        
        // Register for events
        this.registerEvents();
        
        console.log('MCP Connector initialized');
    }
    
    /**
     * Register for events from the event bus
     */
    registerEvents() {
        this.eventBus.subscribe('ui:sendMessage', this.sendMessage.bind(this));
        this.eventBus.subscribe('ui:connectMCP', this.connect.bind(this));
        this.eventBus.subscribe('ui:disconnectMCP', this.disconnect.bind(this));
        this.eventBus.subscribe('scene:objectInteraction', this.handleObjectInteraction.bind(this));
    }
    
    /**
     * Connect to Claude via MCP
     * @param {string} endpoint - MCP endpoint URL
     * @param {string} apiKey - API key for authentication
     */
    async connect(endpoint, apiKey) {
        if (this.connected || this.connecting) {
            return;
        }
        
        this.connecting = true;
        this.endpoint = endpoint;
        this.apiKey = apiKey;
        
        try {
            this.eventBus.publish('mcp:statusChange', { status: 'connecting' });
            
            // In a real implementation, this would establish a connection
            // to the MCP server using the provided endpoint and API key.
            // For this prototype, we'll simulate the connection.
            
            console.log(`Connecting to MCP at ${endpoint}...`);
            
            // Simulate connection delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generate a unique session ID
            this.sessionId = 'session_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
            
            // Connection established
            this.connected = true;
            this.connecting = false;
            
            // Save connection settings to localStorage for auto-connect
            this.saveConnectionSettings(endpoint, apiKey);
            
            // Notify of successful connection
            this.eventBus.publish('mcp:statusChange', { status: 'connected' });
            this.eventBus.publish('mcp:connected', { sessionId: this.sessionId });
            
            // Send initial system message to the UI
            this.eventBus.publish('mcp:message', {
                role: 'system',
                content: 'Connected to Claude via MCP.',
                timestamp: new Date().toISOString()
            });
            
            // Send welcome message from Claude
            setTimeout(() => {
                this.eventBus.publish('mcp:message', {
                    role: 'assistant',
                    content: "Hello! I'm Claude, connected to the ORGANIX 3D neural interface. You can ask me questions, and I can interact with the visualization. Try clicking on one of the neural nodes, or ask me about the different components you see.",
                    timestamp: new Date().toISOString()
                });
            }, 500);
            
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
     * Disconnect from MCP
     */
    async disconnect() {
        if (!this.connected) {
            return;
        }
        
        try {
            console.log('Disconnecting from MCP...');
            
            // In a real implementation, this would properly close the connection
            // to the MCP server and handle any cleanup required.
            
            // Simulate disconnection delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Reset connection state
            this.connected = false;
            this.sessionId = null;
            
            // Notify of disconnection
            this.eventBus.publish('mcp:statusChange', { status: 'disconnected' });
            this.eventBus.publish('mcp:disconnected');
            
            return true;
        } catch (error) {
            console.error('Error during MCP disconnection:', error);
            
            // Force disconnect in case of error
            this.connected = false;
            this.sessionId = null;
            
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
        if (!this.connected) {
            this.eventBus.publish('mcp:error', {
                type: 'message',
                message: 'Cannot send message: Not connected to MCP'
            });
            return false;
        }
        
        try {
            console.log('Sending message to Claude:', content);
            
            // Create message object
            const message = {
                role: 'user',
                content: content,
                timestamp: new Date().toISOString()
            };
            
            // Add to message history
            this.messageHistory.push(message);
            
            // In a real implementation, this would send the message to Claude
            // via the MCP protocol and await a response.
            // For this prototype, we'll simulate Claude's response.
            
            // Start typing indicator
            this.eventBus.publish('mcp:typingStart');
            
            // Simulate processing delay (proportional to message length)
            const responseDelay = Math.min(700 + content.length * 5, 3000);
            await new Promise(resolve => setTimeout(resolve, responseDelay));
            
            // Generate a simulated response
            const response = await this.generateSimulatedResponse(content);
            
            // Add response to message history
            this.messageHistory.push(response);
            
            // End typing indicator
            this.eventBus.publish('mcp:typingEnd');
            
            // Publish the response
            this.eventBus.publish('mcp:message', response);
            
            // Process any commands in the response
            if (response.commands && response.commands.length > 0) {
                this.processCommands(response.commands);
            }
            
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
        
        // Send an automatic message about the object
        const messageContent = `Tell me about the ${data.name} component in the neural interface.`;
        
        // Publish message to UI but don't include in actual message history
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
    async executeExecutePulseCommand(command) {
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
     * Generate a simulated response from Claude
     * This is only used for the prototype to simulate Claude's behavior
     * @param {string} message - User message
     * @returns {object} Simulated response
     */
    async generateSimulatedResponse(message) {
        // Parse the message to determine an appropriate response
        const lowerMessage = message.toLowerCase();
        
        // Define some response patterns based on keywords
        const responses = [
            {
                keywords: ['hello', 'hi', 'hey', 'greetings'],
                response: "Hello! I'm Claude, connected to the ORGANIX neural interface. How can I assist you today?",
                commands: []
            },
            {
                keywords: ['what', 'organix', 'interface', 'this'],
                response: "ORGANIX is an advanced neural interface that creates a visual representation of AI cognition. It allows us to interact in a 3D environment that represents different aspects of my cognitive processes. The central neural core represents my main processing center, while the surrounding nodes represent specialized functions like memory, perception, reasoning, and knowledge processing. You can interact with these elements to explore different aspects of how I process information.",
                commands: [
                    {
                        type: 'camera',
                        action: 'orbit',
                        params: {
                            target: 'neuralCore',
                            duration: 5000
                        }
                    }
                ]
            },
            {
                keywords: ['memory', 'remember', 'memories', 'store'],
                response: "The memory component is responsible for storing and retrieving information from past interactions. It allows me to maintain context throughout our conversation and recall relevant details when needed. When new information is processed, it flows through neural pathways to the memory node, where it's encoded and stored for future reference. The strength of connections between memory and other nodes represents how well that information is integrated into my overall understanding.",
                commands: [
                    {
                        type: 'highlight',
                        target: 'memory',
                        params: {
                            duration: 3000
                        }
                    }
                ]
            },
            {
                keywords: ['perception', 'perceive', 'input', 'interpret'],
                response: "The perception component handles the processing of input information. It's responsible for parsing and interpreting the text you send, recognizing patterns, and extracting meaning. When you send a message, it first flows through the perception node, which analyzes the language, identifies key concepts, and prepares the information for deeper processing by other components like reasoning and knowledge.",
                commands: [
                    {
                        type: 'highlight',
                        target: 'perception',
                        params: {
                            duration: 3000
                        }
                    }
                ]
            },
            {
                keywords: ['reasoning', 'logic', 'think', 'problem', 'solve'],
                response: "The reasoning component is where logical processing and problem-solving occur. It analyzes relationships between concepts, draws inferences, and forms conclusions based on available information. When faced with complex questions or scenarios, the reasoning node works closely with the knowledge and memory nodes to evaluate different possibilities and determine the most appropriate response. The connections you see between reasoning and other nodes represent the flow of information during this analytical process.",
                commands: [
                    {
                        type: 'highlight',
                        target: 'reasoning',
                        params: {
                            duration: 3000
                        }
                    }
                ]
            },
            {
                keywords: ['knowledge', 'know', 'facts', 'information'],
                response: "The knowledge component contains factual information and conceptual understanding that I can access. Unlike memory, which is specific to our conversation, the knowledge node represents broader understanding about the world. When you ask me about a topic, the knowledge node is activated to retrieve relevant information. The connections between knowledge and other nodes represent how this information is integrated with reasoning and perception to generate comprehensive responses.",
                commands: [
                    {
                        type: 'highlight',
                        target: 'knowledge',
                        params: {
                            duration: 3000
                        }
                    }
                ]
            },
            {
                keywords: ['neural', 'core', 'center', 'central', 'brain'],
                response: "The neural core at the center of the visualization represents my primary processing unit. It coordinates activities across all specialized components and integrates information from the different nodes. The glowing energy you see emanating from the core represents the constant flow of processing power as I analyze information and generate responses. The rotating rings around the core represent the dynamic allocation of resources to different cognitive functions as needed during our conversation.",
                commands: [
                    {
                        type: 'camera',
                        action: 'lookAt',
                        params: {
                            target: 'neuralCore',
                            duration: 2000
                        }
                    }
                ]
            },
            {
                keywords: ['connection', 'pathway', 'link', 'network'],
                response: "The connections you see between different components represent neural pathways along which information flows. The brightness and thickness of these connections indicate the strength of association between different cognitive functions. When concepts are strongly related, you'll notice more active pathways between the corresponding nodes. These connections are dynamic and adapt based on the context of our conversation, reflecting how different aspects of cognition work together to process information and generate responses.",
                commands: []
            },
            {
                keywords: ['interact', 'click', 'select', 'touch'],
                response: "You can interact with the ORGANIX interface by clicking on different components. When you click on a node like Memory, Perception, Reasoning, or Knowledge, I'll explain that aspect of my cognitive architecture in more detail. You can also use the control panel to adjust visualization parameters like ambient intensity and neural activity level. Try clicking on different nodes to explore the system, or ask me specific questions about how these components work together.",
                commands: []
            },
            {
                keywords: ['visualize', 'animation', 'show', 'demonstrate'],
                response: "Let me demonstrate how information flows through the neural network. When you send a message, it first activates the Perception node, which then routes information to Reasoning and Knowledge. These components work together, drawing on Memory as needed, and send their processed results to the Neural Core. Finally, the Core integrates everything to generate a response. Watch the visualization to see this process in action.",
                commands: [
                    {
                        type: 'highlight',
                        target: 'perception',
                        params: { duration: 1500 }
                    },
                    {
                        type: 'highlight',
                        target: 'reasoning',
                        params: { duration: 1500 }
                    },
                    {
                        type: 'highlight',
                        target: 'knowledge',
                        params: { duration: 1500 }
                    },
                    {
                        type: 'highlight',
                        target: 'memory',
                        params: { duration: 1500 }
                    }
                ]
            }
        ];
        
        // Find matching response patterns
        const matchingResponses = responses.filter(item => 
            item.keywords.some(keyword => lowerMessage.includes(keyword))
        );
        
        // Select best response or use default
        if (matchingResponses.length > 0) {
            const bestMatch = matchingResponses[0];
            
            return {
                role: 'assistant',
                content: bestMatch.response,
                commands: bestMatch.commands,
                timestamp: new Date().toISOString()
            };
        }
        
        // Default response if no patterns match
        return {
            role: 'assistant',
            content: "I'm processing your message through my neural network. You can see the active components in the visualization. If you'd like to explore specific aspects of the neural interface, try asking about the Memory, Perception, Reasoning, or Knowledge nodes, or about how information flows through the system.",
            commands: [],
            timestamp: new Date().toISOString()
        };
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
                apiKey: apiKey ? '********' : '', // Never store actual API key
                autoConnect: true,
                lastConnected: new Date().toISOString()
            };
            
            localStorage.setItem('organix-mcp-settings', JSON.stringify(settings));
        } catch (error) {
            console.error('Failed to save connection settings:', error);
        }
    }
}

# ORGANIX Neural Interface

![ORGANIX Neural Interface](https://via.placeholder.com/1200x300/1a2635/4a86e8?text=ORGANIX+Neural+Interface)

## Next-Generation AI Visualization with Claude MCP Integration

ORGANIX Neural Interface is a cutting-edge web application that creates an interactive 3D visualization environment for AI cognition, connected directly to Claude through the Model Context Protocol (MCP). It transforms abstract AI concepts into tangible, manipulable objects within a visually stunning digital space.

## Features

### 🧠 Advanced Neural Visualization

- **Interactive Neural Network**: Dynamic 3D representation of AI cognitive architecture
- **Real-time Data Flow**: Visualize information moving through neural pathways
- **Adaptive Environment**: Environment responds to both user and AI inputs
- **High-fidelity Graphics**: WebGL-powered visuals with post-processing effects

### 🎨 New Visual Effects

- **Neural Glow**: Neurons emit dynamic glow based on activity levels
- **Ambient Particles**: Floating particles create a sense of depth and movement
- **Connection Pulses**: Visualize information flow with animated pulses along connections
- **Dynamic Environment**: Immersive neural space background with subtle motion

### 📊 Advanced Analytics Dashboard

- **Activity Metrics**: Real-time monitoring of neural activity and system performance
- **Network Topology**: Interactive graph visualization of neural connections
- **Activation Heatmaps**: Visualize neuron activation patterns with color-coded matrices
- **Performance Tracking**: Track response time, accuracy, and resource usage over time
- **Customizable Views**: Multiple visualization methods with customizable parameters

### 🤝 Bidirectional Claude Integration

- **Seamless MCP Communication**: Direct connection to Claude via Model Context Protocol
- **Contextual Awareness**: Claude understands and can manipulate the 3D environment
- **Event-Driven Architecture**: React to changes across the system in real-time
- **Interactive Learning**: Visualize how Claude processes information

### 👁️ Immersive Experience

- **Intuitive Controls**: Natural camera movement and object interaction
- **Dynamic UI**: Contextual interfaces that adapt to user actions
- **Visual Feedback**: Neural pulses, glowing pathways, and particle effects
- **Explorable Components**: Discover how different cognitive functions work together

## Live Demo Mode vs. Real MCP Connection

ORGANIX supports two modes of operation:

### Simulation Mode

- **Pre-programmed Responses**: Simulates Claude's behavior without requiring API access
- **Full Visual Experience**: All visual features work in this mode
- **Great for Exploration**: Explore the UI and visualization capabilities
- **No API Key Required**: Works right out of the box

### Real MCP Connection Mode

- **Live Claude Integration**: Connect directly to Claude for real AI interaction
- **Bidirectional Communication**: Claude can observe and manipulate the 3D environment
- **Persistent Memory**: Claude remembers the state of the visualization between messages
- **Requires MCP Endpoint & API Key**: Need valid Claude API credentials

To switch between modes, use the "MCP Mode" dropdown in the Settings panel.

## Architecture

ORGANIX is built on a modular architecture designed for extensibility:

```
ORGANIX
├── Core Engine (main.js)
│   ├── Initialization and coordination
│   ├── Component lifecycle management
│   └── Global state handling
│
├── Neural Scene (neuralScene.js)
│   ├── 3D environment rendering
│   ├── Visual effects and animations
│   ├── Object interaction
│   └── Camera controls
│
├── MCP Integration
│   ├── MCPConnector (mcpConnector.js) - Simulation mode
│   ├── OrganixMcpClient (organixMcpClient.js) - Real MCP connection
│   ├── Message handling and command processing
│   └── Context persistence
│
├── Visual Effects (effects/neuralEffects.js)
│   ├── Glow effects and post-processing
│   ├── Particle systems
│   ├── Connection pulses
│   └── Environment effects
│
├── Analytics Dashboard (analytics/neuralAnalytics.js)
│   ├── Real-time metrics and charts
│   ├── Network topology visualization
│   ├── Performance monitoring
│   └── Activity heatmaps
│
├── UI Controller (uiController.js)
│   ├── User interface management
│   ├── Panel toggling and positioning
│   ├── Messaging interface
│   └── Notification system
│
└── Utilities
    ├── Event Bus (eventBus.js)
    ├── Loading Manager (loadingManager.js)
    └── Other helpers
```

## Technologies

- **Three.js**: Advanced 3D visualization
- **Model Context Protocol (MCP)**: Communication protocol for Claude
- **Modern JavaScript**: ES6+ modules and features
- **WebGL**: Hardware-accelerated graphics
- **GLSL Shaders**: Custom visual effects
- **Chart.js**: Data visualization for analytics
- **vis.js**: Network graph visualization

## Getting Started

### Prerequisites

- Modern web browser with WebGL support
- Local development server (recommended)
- Claude API key and MCP endpoint URL (for real connection mode)

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/kabrony/organix-neural-interface.git
   cd organix-neural-interface
   ```

2. Start a local server
   
   Using Python:
   ```bash
   python -m http.server
   ```
   
   Using Node.js:
   ```bash
   npx serve
   ```

3. Open in your browser:
   ```
   http://localhost:8000
   ```

4. Use "Simulation Mode" to explore the interface without an API key, or enter your MCP credentials in the Settings panel to enable real Claude connection.

## Setting Up Real MCP Connection

To use ORGANIX with a real Claude connection:

1. Obtain a Claude API key from [Claude API platform](https://console.anthropic.com/)
2. Set up an MCP bridge or endpoint that can handle WebSocket connections
3. In the ORGANIX Settings panel:
   - Select "Real Claude Connection" in the MCP Mode dropdown
   - Enter the WebSocket endpoint URL (e.g., `ws://localhost:8080/mcp`)
   - Enter your API key
   - Click "Connect"

The MCP status indicator in the top bar will show when you're successfully connected.

## Usage Guide

### Navigation Controls

- **Left Mouse + Drag**: Rotate the camera
- **Right Mouse + Drag**: Pan the camera
- **Mouse Wheel**: Zoom in/out
- **Double-click on Object**: Focus on that object

### Interface Panels

- **Claude Panel**: Chat with Claude about the visualization
- **Control Panel**: Adjust visualization parameters
- **Context Panel**: Shows details about selected objects
- **Settings Panel**: Configure application settings
- **Analytics Panel**: View detailed metrics and visualizations

### Using the Analytics Dashboard

1. Click the 📊 icon in the top navigation bar to open the analytics dashboard
2. Navigate between different visualization tabs to explore different aspects of the neural network
3. Customize refresh rates and visualization parameters in the Settings panel
4. Use keyboard shortcut Shift+A to quickly toggle the analytics dashboard

### Customizing Visual Effects

In the Control Panel, you can toggle and adjust various visual effects:

- **Neuron Glow**: Toggle the glow effect around active neurons
- **Particles**: Enable/disable ambient particle effects
- **Connection Pulses**: Visualize data flow between neurons
- **Environment**: Toggle the neural space background effect

### Interacting with Claude

Claude can provide information about the visualization and manipulate the environment. Try asking:

- "What does the Memory node do?"
- "Explain how information flows through the system"
- "Show me the relationship between Perception and Reasoning"
- "Give me an overview of the neural architecture"

Claude can respond both textually and by highlighting or animating elements in the 3D environment.

## MCP Integration Details

### Communication Flow

1. **User to Claude**: Messages sent through the chat interface
2. **Claude to Visualization**: Commands to manipulate the 3D environment
3. **Visualization to Claude**: Events from user interactions with objects
4. **Claude to User**: Responses incorporating knowledge of the visual state

### Command Types

Claude can send various commands to the visualization:

- **Highlight**: Draw attention to specific components
- **Pulse**: Create energy flow animations between nodes
- **Camera**: Move the viewpoint to focus on different areas
- **Create**: Generate new visualization elements

## Development Guide

### Project Structure

```
/
├── index.html           # Main HTML entry point
├── css/
│   ├── style.css        # Main application styles
│   └── analytics.css    # Analytics dashboard styles
├── js/
│   ├── main.js          # Application entry point
│   ├── neuralScene.js   # 3D visualization engine
│   ├── mcpConnector.js  # Simulation mode integration
│   ├── organixMcpClient.js # Real Claude MCP integration
│   ├── uiController.js  # UI management
│   ├── effects/
│   │   └── neuralEffects.js # Visual effects system
│   ├── analytics/
│   │   └── neuralAnalytics.js # Analytics dashboard
│   └── utils/           # Utility classes
│       ├── eventBus.js  # Event pub/sub system
│       └── loadingManager.js  # Loading screen handler
└── assets/
    └── textures/        # Textures for visualization
        ├── particle.svg # Particle texture
        ├── pulse.svg    # Connection pulse texture
        └── environment.svg # Environment background
```

### Core Components

1. **OrganixApp (main.js)**
   - Initializes all components
   - Sets up event handling
   - Manages application lifecycle

2. **NeuralScene (neuralScene.js)**
   - Creates and manages the 3D environment
   - Handles rendering and animation
   - Processes user interactions with 3D objects

3. **MCPConnector (mcpConnector.js)**
   - Simulation mode communication
   - Processes commands for the demo experience
   - No external connections required

4. **OrganixMcpClient (organixMcpClient.js)**
   - Real MCP communication with Claude
   - WebSocket-based bidirectional data flow
   - Authentication and session management

5. **NeuralEffects (effects/neuralEffects.js)**
   - Advanced visual effects system
   - Post-processing and glow effects
   - Particle systems and dynamic animations

6. **NeuralAnalytics (analytics/neuralAnalytics.js)**
   - Analytics dashboard component
   - Real-time data visualization
   - Performance metrics and neural activity visualization

7. **UIController (uiController.js)**
   - Manages DOM elements and user interface
   - Handles UI events and user input
   - Updates UI based on application state

### Extending the Application

To add new features:

1. Add event types to the event bus for new interactions
2. Create visualization components in neuralScene.js
3. Add command handling in organixMcpClient.js and mcpConnector.js
4. Update UI elements in uiController.js

#### Adding New Visual Effects

1. Extend the NeuralEffects class in neuralEffects.js
2. Add settings for your effect in the constructor's settings object
3. Create an initialization method for your effect
4. Add update logic in the main update method
5. Register UI controls in the main.js setupEffectsEventHandlers method

#### Adding New Analytics Visualizations

1. Extend the NeuralAnalytics class in neuralAnalytics.js
2. Create a new section method (like createCustomSection())
3. Initialize your visualization in a matching method
4. Add update logic in the updateCharts method
5. Ensure data is provided via the eventBus in main.js

## Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines

- Use ES6+ features and modules
- Follow the existing architecture pattern
- Document all public methods and components
- Add comments for complex operations
- Use meaningful variable and function names

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Three.js community for their excellent 3D library
- Anthropic for Claude and the Model Context Protocol
- WebGL and modern browsers for making advanced visualization possible
- Chart.js and vis.js for data visualization capabilities

---

*ORGANIX Neural Interface: Where AI cognition becomes visible, tangible, and interactive.*

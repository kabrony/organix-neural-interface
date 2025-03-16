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
├── MCP Integration (mcpConnector.js)
│   ├── Claude communication 
│   ├── Message handling
│   ├── Command processing
│   └── Context persistence
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

## Getting Started

### Prerequisites

- Modern web browser with WebGL support
- Local development server (recommended)

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
│   └── style.css        # Application styles
├── js/
│   ├── main.js          # Application entry point
│   ├── neuralScene.js   # 3D visualization engine
│   ├── mcpConnector.js  # Claude MCP integration
│   ├── uiController.js  # UI management
│   └── utils/           # Utility classes
│       ├── eventBus.js  # Event pub/sub system
│       └── loadingManager.js  # Loading screen handler
└── assets/
    └── ...              # Images and other assets
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
   - Manages communication with Claude via MCP
   - Processes commands from Claude
   - Formats and sends information to Claude

4. **UIController (uiController.js)**
   - Manages DOM elements and user interface
   - Handles UI events and user input
   - Updates UI based on application state

### Extending the Application

To add new features:

1. Add event types to the event bus for new interactions
2. Create visualization components in neuralScene.js
3. Add command handling in mcpConnector.js
4. Update UI elements in uiController.js

## Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Three.js community for their excellent 3D library
- Anthropic for Claude and the Model Context Protocol
- WebGL and modern browsers for making advanced visualization possible

---

*ORGANIX Neural Interface: Where AI cognition becomes visible, tangible, and interactive.*

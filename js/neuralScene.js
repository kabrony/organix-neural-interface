/**
 * ORGANIX Neural Interface - Neural Scene
 * 
 * Advanced Three.js scene for neural network visualization with
 * interactive nodes, dynamic connections, and visual effects.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export class NeuralScene {
    constructor(containerSelector, eventBus) {
        this.container = document.querySelector(containerSelector);
        this.eventBus = eventBus;
        
        // Scene state
        this.initialized = false;
        this.paused = false;
        this.activePreset = 'default';
        this.quality = 'balanced';
        this.postProcessingEnabled = true;
        
        // Performance monitoring
        this.fpsCounter = document.getElementById('fps-counter');
        this.frameCount = 0;
        this.lastFpsUpdateTime = 0;
        
        // Interactive objects
        this.interactiveObjects = [];
        this.hoveredObject = null;
        this.selectedObject = null;
        
        // Neural network elements
        this.neuralNodes = [];
        this.connections = [];
        this.neuralCore = null;
        
        // Animation properties
        this.time = 0;
        this.deltaTime = 0;
        this.clock = new THREE.Clock();
        this.animationObjects = [];
        
        // Mouse interaction
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
    }
    
    /**
     * Initialize the 3D scene and all components
     */
    async initialize() {
        // Setup scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a14);
        this.scene.fog = new THREE.FogExp2(0x0a0a14, 0.035);
        
        // Setup camera
        this.setupCamera();
        
        // Setup renderer
        this.setupRenderer();
        
        // Setup controls
        this.setupControls();
        
        // Setup lighting
        this.setupLighting();
        
        // Setup post-processing
        this.setupPostProcessing();
        
        // Create neural network visualization
        await this.createNeuralNetwork();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Mark as initialized
        this.initialized = true;
        
        return true;
    }
    
    /**
     * Setup the camera
     */
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, // FOV
            this.container.clientWidth / this.container.clientHeight, // Aspect ratio
            0.1, // Near plane
            1000 // Far plane
        );
        
        this.camera.position.set(0, 8, 12);
        this.camera.lookAt(0, 0, 0);
    }
    
    /**
     * Setup the renderer
     */
    setupRenderer() {
        // Main WebGL renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        this.container.appendChild(this.renderer.domElement);
        
        // CSS 2D renderer for labels
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        this.container.appendChild(this.labelRenderer.domElement);
    }
    
    /**
     * Setup camera controls
     */
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.rotateSpeed = 0.7;
        this.controls.panSpeed = 0.7;
        this.controls.zoomSpeed = 1.0;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 30;
        this.controls.maxPolarAngle = Math.PI * 0.85;
        this.controls.target.set(0, 0, 0);
    }
    
    /**
     * Setup scene lighting
     */
    setupLighting() {
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0x444466, 0.8);
        this.scene.add(this.ambientLight);
        
        // Directional light (sun)
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        this.directionalLight.position.set(5, 10, 7);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.camera.near = 0.1;
        this.directionalLight.shadow.camera.far = 50;
        this.directionalLight.shadow.camera.right = 15;
        this.directionalLight.shadow.camera.left = -15;
        this.directionalLight.shadow.camera.top = 15;
        this.directionalLight.shadow.camera.bottom = -15;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.bias = -0.0005;
        this.scene.add(this.directionalLight);
        
        // Core light
        this.coreLight = new THREE.PointLight(0x4a66ff, 3, 15);
        this.coreLight.position.set(0, 0, 0);
        this.coreLight.castShadow = true;
        this.coreLight.shadow.bias = -0.001;
        this.scene.add(this.coreLight);
    }
    
    /**
     * Setup post-processing effects
     */
    setupPostProcessing() {
        // Main render pass
        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);
        
        // FXAA anti-aliasing pass
        this.fxaaPass = new ShaderPass(FXAAShader);
        this.fxaaPass.uniforms['resolution'].value.set(
            1 / (this.container.clientWidth * window.devicePixelRatio),
            1 / (this.container.clientHeight * window.devicePixelRatio)
        );
        this.composer.addPass(this.fxaaPass);
        
        // Bloom pass for glow effect
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
            0.8,  // Strength
            0.3,  // Radius
            0.7   // Threshold
        );
        this.composer.addPass(this.bloomPass);
    }
    
    /**
     * Create the neural network visualization
     */
    async createNeuralNetwork() {
        // Create floor grid
        this.createFloorGrid();
        
        // Create the neural core
        await this.createNeuralCore();
        
        // Create primary neural nodes
        await this.createPrimaryNodes();
        
        // Create connections between nodes
        this.createConnections();
        
        // Create secondary nodes
        await this.createSecondaryNodes();
    }
    
    /**
     * Create floor grid
     */
    createFloorGrid() {
        // Create circular platform
        const platformGeometry = new THREE.CircleGeometry(20, 64);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0x202040,
            roughness: 0.7,
            metalness: 0.2,
            side: THREE.DoubleSide
        });
        
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.rotation.x = -Math.PI / 2;
        platform.position.y = -0.2;
        platform.receiveShadow = true;
        this.scene.add(platform);
        
        // Create grid lines
        const gridHelper = new THREE.GridHelper(40, 40, 0x1a1a2a, 0x1a1a2a);
        gridHelper.position.y = -0.18;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.3;
        this.scene.add(gridHelper);
        
        // Create concentric circles
        for (let i = 1; i <= 4; i++) {
            const radius = i * 4;
            const segments = 64;
            const circleGeometry = new THREE.BufferGeometry();
            const vertices = [];
            
            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                vertices.push(
                    Math.cos(angle) * radius, -0.15, Math.sin(angle) * radius
                );
            }
            
            circleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            
            const circleMaterial = new THREE.LineBasicMaterial({
                color: 0x4a66ff,
                transparent: true,
                opacity: 0.2 + (i * 0.05)
            });
            
            const circle = new THREE.Line(circleGeometry, circleMaterial);
            this.scene.add(circle);
        }
    }
    
    /**
     * Create the central neural core
     */
    async createNeuralCore() {
        // Create core sphere
        const coreGeometry = new THREE.SphereGeometry(1.5, 32, 32);
        const coreMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a66ff,
            emissive: 0x1a3366,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
        });
        
        this.neuralCore = new THREE.Mesh(coreGeometry, coreMaterial);
        this.neuralCore.castShadow = true;
        this.neuralCore.position.set(0, 0, 0);
        this.scene.add(this.neuralCore);
        
        // Create rotating ring
        const ringGeometry = new THREE.TorusGeometry(2.2, 0.1, 16, 100);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a86e8,
            emissive: 0x1a3366,
            metalness: 0.8,
            roughness: 0.2
        });
        
        this.coreRing1 = new THREE.Mesh(ringGeometry, ringMaterial);
        this.coreRing1.castShadow = true;
        this.scene.add(this.coreRing1);
        
        this.coreRing2 = new THREE.Mesh(ringGeometry, ringMaterial);
        this.coreRing2.rotation.x = Math.PI / 2;
        this.coreRing2.castShadow = true;
        this.scene.add(this.coreRing2);
        
        // Add to animation objects
        this.animationObjects.push({
            object: this.neuralCore,
            update: (time, deltaTime) => {
                this.neuralCore.rotation.y = time * 0.1;
                this.neuralCore.rotation.z = time * 0.05;
                
                // Pulse the core
                const pulseStrength = Math.sin(time * 2) * 0.1 + 0.9;
                this.neuralCore.scale.set(pulseStrength, pulseStrength, pulseStrength);
                
                // Update core light intensity
                this.coreLight.intensity = 2 + Math.sin(time * 2) * 1;
            }
        });
        
        this.animationObjects.push({
            object: this.coreRing1,
            update: (time, deltaTime) => {
                this.coreRing1.rotation.z = time * 0.2;
            }
        });
        
        this.animationObjects.push({
            object: this.coreRing2,
            update: (time, deltaTime) => {
                this.coreRing2.rotation.y = time * 0.3;
            }
        });
    }
    
    /**
     * Create primary neural nodes
     */
    async createPrimaryNodes() {
        // Define node types and positions
        const primaryNodes = [
            { 
                id: 'memory', 
                name: 'Memory',
                position: new THREE.Vector3(8, 0, 0),
                color: 0x4a86e8,
                description: 'Stores and retrieves past interactions and knowledge'
            },
            { 
                id: 'perception', 
                name: 'Perception',
                position: new THREE.Vector3(-8, 0, 0),
                color: 0xf06292,
                description: 'Processes and interprets input information'
            },
            { 
                id: 'reasoning', 
                name: 'Reasoning',
                position: new THREE.Vector3(0, 0, 8),
                color: 0x26a69a,
                description: 'Analyzes information and makes logical deductions'
            },
            { 
                id: 'knowledge', 
                name: 'Knowledge',
                position: new THREE.Vector3(0, 0, -8),
                color: 0xffb74d,
                description: 'Represents factual information and concepts'
            }
        ];
        
        // Create each node
        for (const nodeData of primaryNodes) {
            const node = await this.createNeuralNode(nodeData);
            this.neuralNodes.push(node);
        }
    }
    
    /**
     * Create a neural node
     */
    async createNeuralNode(nodeData) {
        // Create node geometry and material
        const nodeGeometry = new THREE.SphereGeometry(1, 32, 32);
        const nodeMaterial = new THREE.MeshStandardMaterial({
            color: nodeData.color,
            emissive: nodeData.color,
            emissiveIntensity: 0.3,
            metalness: 0.7,
            roughness: 0.3
        });
        
        // Create node mesh
        const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
        nodeMesh.position.copy(nodeData.position);
        nodeMesh.castShadow = true;
        
        // Set user data
        nodeMesh.userData = {
            id: nodeData.id,
            name: nodeData.name,
            type: 'neuralNode',
            description: nodeData.description,
            color: nodeData.color,
            isInteractive: true
        };
        
        // Add to scene
        this.scene.add(nodeMesh);
        
        // Create label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'interaction-label';
        labelDiv.textContent = nodeData.name;
        labelDiv.style.color = '#ffffff';
        labelDiv.style.padding = '5px 12px';
        labelDiv.style.background = 'rgba(0, 0, 0, 0.7)';
        labelDiv.style.borderRadius = '4px';
        labelDiv.style.fontSize = '14px';
        labelDiv.style.opacity = '0';
        labelDiv.style.transition = 'opacity 0.3s ease';
        
        const label = new CSS2DObject(labelDiv);
        label.position.set(0, 1.5, 0);
        nodeMesh.add(label);
        
        // Add to interactive objects
        this.interactiveObjects.push(nodeMesh);
        
        // Add node animation
        this.animationObjects.push({
            object: nodeMesh,
            update: (time, deltaTime) => {
                // Orbit around the core
                const orbitSpeed = 0.1 + (nodeData.id === 'memory' ? 0.02 : 0) +
                                         (nodeData.id === 'perception' ? 0.04 : 0) +
                                         (nodeData.id === 'reasoning' ? 0.01 : 0) +
                                         (nodeData.id === 'knowledge' ? 0.03 : 0);
                
                const orbitRadius = nodeMesh.position.length();
                const angle = time * orbitSpeed;
                
                // Get the original node position (start position)
                const originalX = nodeData.position.x;
                const originalZ = nodeData.position.z;
                
                // Calculate orbit position
                nodeMesh.position.x = Math.cos(angle) * originalX - Math.sin(angle) * originalZ;
                nodeMesh.position.z = Math.sin(angle) * originalX + Math.cos(angle) * originalZ;
                
                // Small vertical bobbing
                nodeMesh.position.y = Math.sin(time * 0.5 + (nodeData.id === 'memory' ? 0 : Math.PI/2)) * 0.5;
                
                // Rotate the node
                nodeMesh.rotation.y = time * 0.5;
            }
        });
        
        return nodeMesh;
    }
    
    /**
     * Create connections between nodes
     */
    createConnections() {
        // Connect neural core to all primary nodes
        for (const node of this.neuralNodes) {
            const connection = this.createConnection(
                this.neuralCore.position,
                node.position,
                new THREE.Color(node.userData.color)
            );
            this.connections.push(connection);
            
            // Add connection to animation objects
            this.animationObjects.push({
                object: connection,
                update: (time, deltaTime) => {
                    // Update start position
                    connection.geometry.attributes.position.array[0] = this.neuralCore.position.x;
                    connection.geometry.attributes.position.array[1] = this.neuralCore.position.y;
                    connection.geometry.attributes.position.array[2] = this.neuralCore.position.z;
                    
                    // Update end position
                    connection.geometry.attributes.position.array[3] = node.position.x;
                    connection.geometry.attributes.position.array[4] = node.position.y;
                    connection.geometry.attributes.position.array[5] = node.position.z;
                    
                    // Mark attributes as needing update
                    connection.geometry.attributes.position.needsUpdate = true;
                    
                    // Animate opacity
                    connection.material.opacity = 0.3 + Math.sin(time * 3 + (node.userData.id === 'memory' ? 0 : Math.PI/4)) * 0.2;
                }
            });
        }
        
        // Connect some primary nodes to each other
        const nodePairs = [
            ['memory', 'knowledge'],
            ['memory', 'reasoning'],
            ['perception', 'reasoning'],
            ['perception', 'knowledge']
        ];
        
        for (const [nodeId1, nodeId2] of nodePairs) {
            const node1 = this.neuralNodes.find(node => node.userData.id === nodeId1);
            const node2 = this.neuralNodes.find(node => node.userData.id === nodeId2);
            
            if (node1 && node2) {
                const connection = this.createConnection(
                    node1.position,
                    node2.position,
                    new THREE.Color(0xaaaaff)
                );
                this.connections.push(connection);
                
                // Add connection to animation objects
                this.animationObjects.push({
                    object: connection,
                    update: (time, deltaTime) => {
                        // Update start position
                        connection.geometry.attributes.position.array[0] = node1.position.x;
                        connection.geometry.attributes.position.array[1] = node1.position.y;
                        connection.geometry.attributes.position.array[2] = node1.position.z;
                        
                        // Update end position
                        connection.geometry.attributes.position.array[3] = node2.position.x;
                        connection.geometry.attributes.position.array[4] = node2.position.y;
                        connection.geometry.attributes.position.array[5] = node2.position.z;
                        
                        // Mark attributes as needing update
                        connection.geometry.attributes.position.needsUpdate = true;
                        
                        // Animate opacity
                        connection.material.opacity = 0.15 + Math.sin(time * 2 + Math.PI/3) * 0.1;
                    }
                });
            }
        }
    }
    
    /**
     * Create a connection between two points
     */
    createConnection(startPoint, endPoint, color) {
        // Create geometry
        const connectionGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            startPoint.x, startPoint.y, startPoint.z,
            endPoint.x, endPoint.y, endPoint.z
        ]);
        connectionGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Create material
        const connectionMaterial = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            linewidth: 1
        });
        
        // Create line
        const connection = new THREE.Line(connectionGeometry, connectionMaterial);
        
        // Add to scene
        this.scene.add(connection);
        
        return connection;
    }
    
    /**
     * Create secondary neural nodes (smaller nodes)
     */
    async createSecondaryNodes() {
        const numSecondaryNodes = 30;
        const maxDistance = 15;
        const minDistance = 5;
        
        for (let i = 0; i < numSecondaryNodes; i++) {
            // Generate random position
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 2;
            const radius = minDistance + Math.random() * (maxDistance - minDistance);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = (Math.random() * 4) - 2; // Between -2 and 2
            const z = radius * Math.sin(phi) * Math.sin(theta);
            
            // Create small node
            const nodeGeometry = new THREE.SphereGeometry(0.2 + Math.random() * 0.2, 16, 16);
            
            // Choose a color based on proximity to primary nodes
            let closestDistance = Infinity;
            let closestNode = null;
            
            for (const node of this.neuralNodes) {
                const distance = Math.sqrt(
                    Math.pow(x - node.position.x, 2) +
                    Math.pow(y - node.position.y, 2) +
                    Math.pow(z - node.position.z, 2)
                );
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestNode = node;
                }
            }
            
            const color = closestNode ? closestNode.userData.color : 0xaaaaff;
            
            const nodeMaterial = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.2,
                metalness: 0.6,
                roughness: 0.4,
                transparent: true,
                opacity: 0.7 + Math.random() * 0.3
            });
            
            const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
            nodeMesh.position.set(x, y, z);
            nodeMesh.castShadow = true;
            this.scene.add(nodeMesh);
            
            // Add to animation objects
            this.animationObjects.push({
                object: nodeMesh,
                update: (time, deltaTime) => {
                    // Small movement
                    nodeMesh.position.x += Math.sin(time * 0.5 + i) * 0.002;
                    nodeMesh.position.y += Math.sin(time * 0.7 + i * 2) * 0.002;
                    nodeMesh.position.z += Math.sin(time * 0.6 + i * 3) * 0.002;
                    
                    // Pulse size
                    const size = 1 + Math.sin(time * 0.8 + i * 4) * 0.1;
                    nodeMesh.scale.set(size, size, size);
                }
            });
            
            // Occasionally create connections to primary nodes
            if (Math.random() < 0.3 && closestNode) {
                const connection = this.createConnection(
                    nodeMesh.position,
                    closestNode.position,
                    new THREE.Color(color)
                );
                connection.material.opacity = 0.1 + Math.random() * 0.1;
                this.connections.push(connection);
                
                // Add connection to animation objects
                this.animationObjects.push({
                    object: connection,
                    update: (time, deltaTime) => {
                        // Update start position
                        connection.geometry.attributes.position.array[0] = nodeMesh.position.x;
                        connection.geometry.attributes.position.array[1] = nodeMesh.position.y;
                        connection.geometry.attributes.position.array[2] = nodeMesh.position.z;
                        
                        // Update end position
                        connection.geometry.attributes.position.array[3] = closestNode.position.x;
                        connection.geometry.attributes.position.array[4] = closestNode.position.y;
                        connection.geometry.attributes.position.array[5] = closestNode.position.z;
                        
                        // Mark attributes as needing update
                        connection.geometry.attributes.position.needsUpdate = true;
                        
                        // Pulse opacity
                        connection.material.opacity = 0.05 + Math.sin(time + i) * 0.05;
                    }
                });
            }
        }
    }
    
    /**
     * Setup event listeners for user interaction
     */
    setupEventListeners() {
        // Mouse move for hover effects
        this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Click for selection
        this.container.addEventListener('click', this.onClick.bind(this));
        
        // Subscribe to event bus events
        this.eventBus.subscribe('control:ambientIntensity', this.setAmbientIntensity.bind(this));
        this.eventBus.subscribe('control:activityLevel', this.setActivityLevel.bind(this));
        this.eventBus.subscribe('control:visualPreset', this.setVisualPreset.bind(this));
        this.eventBus.subscribe('settings:quality', this.setQuality.bind(this));
        this.eventBus.subscribe('settings:postProcessing', this.setPostProcessing.bind(this));
        this.eventBus.subscribe('action:resetView', this.resetView.bind(this));
        this.eventBus.subscribe('action:overviewMode', this.overviewMode.bind(this));
    }
    
    /**
     * Handle mouse movement
     */
    onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Find intersections with interactive objects
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
        
        // Reset all previously hovered objects
        if (this.hoveredObject && (!intersects.length || intersects[0].object !== this.hoveredObject)) {
            if (this.hoveredObject !== this.selectedObject) {
                this.resetObjectHighlight(this.hoveredObject);
            }
            this.hoveredObject = null;
        }
        
        // Set cursor and highlight intersected object
        if (intersects.length > 0) {
            const object = intersects[0].object;
            
            if (object !== this.hoveredObject && object !== this.selectedObject) {
                this.hoveredObject = object;
                this.highlightObject(object);
                this.container.style.cursor = 'pointer';
            }
        } else {
            this.container.style.cursor = 'default';
        }
    }
    
    /**
     * Handle mouse click
     */
    onClick(event) {
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Find intersections with interactive objects
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
        
        // Deselect previously selected object
        if (this.selectedObject) {
            this.resetObjectHighlight(this.selectedObject);
            this.selectedObject = null;
        }
        
        // Select clicked object
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.selectedObject = object;
            this.selectObject(object);
        }
    }
    
    /**
     * Highlight an object on hover
     */
    highlightObject(object) {
        if (!object.userData.isInteractive) return;
        
        // Scale the object slightly
        object.scale.set(1.1, 1.1, 1.1);
        
        // Increase emissive intensity
        if (object.material) {
            object.material.emissiveIntensity = 0.7;
        }
        
        // Show label if it exists
        if (object.children.length > 0) {
            const label = object.children[0];
            if (label instanceof CSS2DObject) {
                label.element.style.opacity = '1';
            }
        }
    }
    
    /**
     * Reset object highlight
     */
    resetObjectHighlight(object) {
        if (!object) return;
        
        // Reset scale
        object.scale.set(1, 1, 1);
        
        // Reset emissive intensity
        if (object.material) {
            object.material.emissiveIntensity = 0.3;
        }
        
        // Hide label if it exists
        if (object.children.length > 0) {
            const label = object.children[0];
            if (label instanceof CSS2DObject) {
                label.element.style.opacity = '0';
            }
        }
    }
    
    /**
     * Select an object (on click)
     */
    selectObject(object) {
        if (!object.userData.isInteractive) return;
        
        // Scale the object
        object.scale.set(1.2, 1.2, 1.2);
        
        // Increase emissive intensity
        if (object.material) {
            object.material.emissiveIntensity = 1.0;
        }
        
        // Show label if it exists
        if (object.children.length > 0) {
            const label = object.children[0];
            if (label instanceof CSS2DObject) {
                label.element.style.opacity = '1';
            }
        }
        
        // Create a pulse effect
        this.createPulseEffect(object.position, object.userData.color);
        
        // Publish selection event
        this.eventBus.publish('object:selected', {
            id: object.userData.id,
            name: object.userData.name,
            type: object.userData.type,
            description: object.userData.description,
            color: object.userData.color
        });
    }
    
    /**
     * Create a pulse effect at position
     */
    createPulseEffect(position, color) {
        // Create a sphere geometry for the pulse
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        
        // Create a material with the specified color
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.7
        });
        
        // Create the pulse mesh
        const pulse = new THREE.Mesh(geometry, material);
        pulse.position.copy(position);
        this.scene.add(pulse);
        
        // Animation parameters
        const startTime = this.time;
        const duration = 1.5;
        
        // Add to animation objects
        this.animationObjects.push({
            object: pulse,
            update: (currentTime, deltaTime) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                
                // Scale the pulse outward
                const scale = 1 + progress * 4;
                pulse.scale.set(scale, scale, scale);
                
                // Fade out the pulse
                material.opacity = 0.7 * (1 - progress);
                
                // Remove when animation is complete
                if (progress >= 1) {
                    this.scene.remove(pulse);
                    this.animationObjects = this.animationObjects.filter(
                        item => item.object !== pulse
                    );
                    
                    // Dispose of geometry and material
                    geometry.dispose();
                    material.dispose();
                }
            }
        });
    }
    
    /**
     * Set the ambient light intensity
     */
    setAmbientIntensity(value) {
        // Value is in range 0-100
        const intensity = value / 100 * 1.5; // Scale to 0-1.5
        this.ambientLight.intensity = intensity;
    }
    
    /**
     * Set the neural activity level
     */
    setActivityLevel(value) {
        // Value is in range 0-100
        const activityLevel = value / 100;
        
        // Scale animation speeds
        this.animationObjects.forEach(item => {
            if (item.originalSpeed === undefined) {
                item.originalSpeed = 1;
            }
            
            item.currentSpeed = item.originalSpeed * (0.3 + activityLevel * 1.4);
        });
        
        // Adjust bloom strength based on activity
        if (this.bloomPass) {
            this.bloomPass.strength = 0.4 + activityLevel * 0.8;
        }
    }
    
    /**
     * Set the visual preset
     */
    setVisualPreset(preset) {
        this.activePreset = preset;
        
        switch (preset) {
            case 'default':
                this.scene.background = new THREE.Color(0x0a0a14);
                this.scene.fog.color = new THREE.Color(0x0a0a14);
                this.ambientLight.color.set(0x444466);
                this.directionalLight.color.set(0xffffff);
                this.bloomPass.strength = 0.8;
                break;
                
            case 'neural':
                this.scene.background = new THREE.Color(0x050510);
                this.scene.fog.color = new THREE.Color(0x050510);
                this.ambientLight.color.set(0x4444aa);
                this.directionalLight.color.set(0xaaaaff);
                this.bloomPass.strength = 1.2;
                break;
                
            case 'abstract':
                this.scene.background = new THREE.Color(0x101010);
                this.scene.fog.color = new THREE.Color(0x101010);
                this.ambientLight.color.set(0x666666);
                this.directionalLight.color.set(0xffffff);
                this.bloomPass.strength = 0.5;
                break;
                
            case 'data':
                this.scene.background = new THREE.Color(0x001020);
                this.scene.fog.color = new THREE.Color(0x001020);
                this.ambientLight.color.set(0x226688);
                this.directionalLight.color.set(0xaaccff);
                this.bloomPass.strength = 1.0;
                break;
        }
    }
    
    /**
     * Set rendering quality
     */
    setQuality(quality) {
        this.quality = quality;
        
        switch (quality) {
            case 'performance':
                this.renderer.setPixelRatio(1);
                this.fxaaPass.enabled = false;
                this.bloomPass.radius = 0.2;
                break;
                
            case 'balanced':
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                this.fxaaPass.enabled = true;
                this.bloomPass.radius = 0.3;
                break;
                
            case 'quality':
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.fxaaPass.enabled = true;
                this.bloomPass.radius = 0.4;
                break;
                
            case 'ultra':
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.fxaaPass.enabled = true;
                this.bloomPass.radius = 0.5;
                break;
        }
    }
    
    /**
     * Enable/disable post-processing
     */
    setPostProcessing(enabled) {
        this.postProcessingEnabled = enabled;
    }
    
    /**
     * Reset camera view
     */
    resetView() {
        // Animate camera position
        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const endPosition = new THREE.Vector3(0, 8, 12);
        const endTarget = new THREE.Vector3(0, 0, 0);
        const duration = 1.5;
        const startTime = this.time;
        
        // Create animation
        const cameraAnimation = {
            object: this.camera,
            update: (currentTime, deltaTime) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                
                // Easing function
                const easedProgress = this.easeOutCubic(progress);
                
                // Update camera position
                this.camera.position.lerpVectors(
                    startPosition,
                    endPosition,
                    easedProgress
                );
                
                // Update target
                this.controls.target.lerpVectors(
                    startTarget,
                    endTarget,
                    easedProgress
                );
                
                // Remove animation when complete
                if (progress >= 1) {
                    this.animationObjects = this.animationObjects.filter(
                        item => item !== cameraAnimation
                    );
                }
            }
        };
        
        // Add animation
        this.animationObjects.push(cameraAnimation);
    }
    
    /**
     * Set overview camera mode
     */
    overviewMode() {
        // Animate camera position
        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const endPosition = new THREE.Vector3(15, 15, 15);
        const endTarget = new THREE.Vector3(0, 0, 0);
        const duration = 2;
        const startTime = this.time;
        
        // Create animation
        const cameraAnimation = {
            object: this.camera,
            update: (currentTime, deltaTime) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                
                // Easing function
                const easedProgress = this.easeOutCubic(progress);
                
                // Update camera position
                this.camera.position.lerpVectors(
                    startPosition,
                    endPosition,
                    easedProgress
                );
                
                // Update target
                this.controls.target.lerpVectors(
                    startTarget,
                    endTarget,
                    easedProgress
                );
                
                // Remove animation when complete
                if (progress >= 1) {
                    this.animationObjects = this.animationObjects.filter(
                        item => item !== cameraAnimation
                    );
                }
            }
        };
        
        // Add animation
        this.animationObjects.push(cameraAnimation);
    }
    
    /**
     * Easing function
     */
    easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }
    
    /**
     * Start the render loop
     */
    startRenderLoop() {
        this.animate();
    }
    
    /**
     * Animation loop
     */
    animate() {
        if (!this.initialized) return;
        
        // Request next frame
        requestAnimationFrame(this.animate.bind(this));
        
        // Skip if paused
        if (this.paused) return;
        
        // Update time
        this.deltaTime = this.clock.getDelta();
        this.time += this.deltaTime;
        
        // Update FPS counter
        this.updateFPSCounter();
        
        // Update controls
        this.controls.update();
        
        // Update animation objects
        this.updateAnimations();
        
        // Render scene
        this.render();
    }
    
    /**
     * Update FPS counter
     */
    updateFPSCounter() {
        this.frameCount++;
        
        const now = performance.now();
        const elapsed = now - this.lastFpsUpdateTime;
        
        if (elapsed >= 1000) { // Update every second
            const fps = Math.round((this.frameCount * 1000) / elapsed);
            
            if (this.fpsCounter) {
                this.fpsCounter.textContent = `FPS: ${fps}`;
            }
            
            this.frameCount = 0;
            this.lastFpsUpdateTime = now;
        }
    }
    
    /**
     * Update animations
     */
    updateAnimations() {
        for (const item of this.animationObjects) {
            if (item.update) {
                item.update(this.time, this.deltaTime);
            }
        }
    }
    
    /**
     * Render the scene
     */
    render() {
        if (this.postProcessingEnabled) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
        
        // Render labels
        this.labelRenderer.render(this.scene, this.camera);
    }
    
    /**
     * Handle window resize
     */
    resize() {
        if (!this.initialized) return;
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        // Update camera
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        // Update renderers
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
        this.labelRenderer.setSize(width, height);
        
        // Update FXAA pass
        this.fxaaPass.uniforms['resolution'].value.set(
            1 / (width * this.renderer.getPixelRatio()),
            1 / (height * this.renderer.getPixelRatio())
        );
    }
    
    /**
     * Pause animations
     */
    pause() {
        this.paused = true;
    }
    
    /**
     * Resume animations
     */
    resume() {
        this.paused = false;
        this.clock.getDelta(); // Reset delta time
    }
}

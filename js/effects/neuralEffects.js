/**
 * neuralEffects.js
 * Advanced visualization effects for ORGANIX neural interface
 * Cyberpunk dystopian aesthetic with retro-futuristic digital elements
 */

class NeuralEffects {
    constructor(scene, renderer, camera) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        
        // Cyberpunk color palette - heavy on greens, oranges, and light blues
        this.cyberpunkPalette = {
            neonGreen: new THREE.Color(0x00ff8e),   // Vibrant green
            acidGreen: new THREE.Color(0x39ff14),   // Acid/toxic green
            neonOrange: new THREE.Color(0xff8a00),  // Bright orange
            deepOrange: new THREE.Color(0xff5500),  // Deep orange
            lightBlue: new THREE.Color(0x3ad6ff),   // Light cyan blue
            electricBlue: new THREE.Color(0x0cffe1), // Electric teal blue
            dataGreen: new THREE.Color(0x00ff3c),   // Digital green (like old terminals)
            warningRed: new THREE.Color(0xff3c3c)   // Warning red (used sparingly)
        };
        
        // Effect settings with updated cyberpunk color scheme
        this.settings = {
            glow: {
                enabled: true,
                strength: 1.6,        // Increased for more intense neon effect
                radius: 0.7,          // Wide glow
                threshold: 0.15,      // Lower threshold for more visible glow
                bloomQuality: 'ultra' // Maximum quality
            },
            particles: {
                enabled: true,
                count: 3000,          // More particles for dense effect
                size: 0.04,           // Slightly larger
                speed: 0.25,          // Moderate speed for deliberate movement
                colorScheme: 'cyber', // New option specific to our cyberpunk theme
                sizeVariance: 0.7,    // High variance for more organic feel
                dataStreamEffect: true // Visual effect like data flowing through system
            },
            connections: {
                enabled: true,
                width: 0.4,           // Thicker connections
                glowIntensity: 1.2,   // Brighter glow
                pulseSpeed: 0.8,      // Speed of pulse effects
                dataFlowVisible: true // Show data packets flowing along connections
            },
            environment: {
                enabled: true,
                gridEnabled: true,    // Retro grid effect
                gridColor: this.cyberpunkPalette.neonGreen,
                skyboxColor: new THREE.Color(0x080c14), // Dark bluish background
                fogDensity: 0.04,     // Moderate fog for depth
                scanlineEffect: true  // Classic CRT scanline effect
            },
            volumetricLights: {
                enabled: true,
                intensity: 0.7,
                count: 4,             // More light sources
                colors: [             // Array of colors to use
                    this.cyberpunkPalette.neonGreen,
                    this.cyberpunkPalette.lightBlue,
                    this.cyberpunkPalette.neonOrange,
                    this.cyberpunkPalette.electricBlue
                ]
            },
            dataEffects: {            // Visual effects that resemble data flow
                enabled: true,
                density: 0.8,         // How dense the effects are
                speed: 1.3,           // How fast data appears to move
                glitchIntensity: 0.3  // Occasional digital glitches
            },
            neuronEffects: {
                enabled: true,
                pulseFrequency: 0.4,  // How often neurons pulse
                connectionVisibility: 0.9, // How visible connections are
                activationEffect: 'ripple' // Visual effect when neurons activate
            },
            postProcessing: {
                chromaticAberration: 0.002, // Subtle color shifting at edges
                scanlines: 0.15,      // CRT-style scanlines
                vignette: 0.3,        // Darkened corners
                noise: 0.03           // Film grain/digital noise
            }
        };
        
        // Cache for generated materials and meshes
        this.materials = {};
        this.meshes = {};
        
        // Initialize effects
        this.initEffects();
    }
    
    /**
     * Initialize all visual effects
     */
    initEffects() {
        this.initGlowEffect();
        this.initParticleSystem();
        this.initGridEnvironment();
        this.initVolumetricLights();
        this.initPostProcessing();
        this.initDataFlowEffects();
        
        // Load any required textures
        this.loadTextures();
        
        console.log('Neural effects initialized with cyberpunk aesthetic');
    }
    
    /**
     * Load necessary textures
     */
    loadTextures() {
        const textureLoader = new THREE.TextureLoader();
        
        // Load particle texture with callback to ensure it's ready
        this.textures = {};
        this.textures.particle = textureLoader.load('assets/textures/particle.png');
        this.textures.dataGlow = textureLoader.load('assets/textures/data_glow.png');
        this.textures.noise = textureLoader.load('assets/textures/noise.png');
        
        // Make noise texture repeatable
        if (this.textures.noise) {
            this.textures.noise.wrapS = THREE.RepeatWrapping;
            this.textures.noise.wrapT = THREE.RepeatWrapping;
        }
    }
    
    /**
     * Initialize the bloom/glow effect for neurons
     */
    initGlowEffect() {
        if (!this.settings.glow.enabled) return;
        
        const { UnrealBloomPass, EffectComposer, RenderPass, ShaderPass } = THREE;
        
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Add bloom pass with enhanced settings
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            this.settings.glow.strength,
            this.settings.glow.radius,
            this.settings.glow.threshold
        );
        
        // Higher quality settings for bloom
        if (this.settings.glow.bloomQuality === 'ultra') {
            this.bloomPass.kernelSize = 7; // Highest quality blur (more expensive)
        }
        
        this.composer.addPass(this.bloomPass);
        
        // Add custom chromatic aberration pass for retro-tech effect
        const chromaticAberrationPass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                amount: { value: this.settings.postProcessing.chromaticAberration },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float amount;
                uniform float time;
                varying vec2 vUv;
                
                void main() {
                    // Dynamic aberration that increases toward the edges
                    float distFromCenter = length(vUv - 0.5);
                    float aberrationAmount = amount * (1.0 + distFromCenter * 2.0);
                    
                    // Add subtle pulsing
                    aberrationAmount *= (0.95 + 0.05 * sin(time * 0.5));
                    
                    // Create RGB channel separation
                    vec2 offset = aberrationAmount * (vUv - 0.5);
                    
                    vec4 cr = texture2D(tDiffuse, vUv + offset);
                    vec4 cg = texture2D(tDiffuse, vUv);
                    vec4 cb = texture2D(tDiffuse, vUv - offset);
                    
                    gl_FragColor = vec4(cr.r, cg.g, cb.b, cg.a);
                }
            `
        });
        
        this.chromaticAberrationPass = chromaticAberrationPass;
        this.composer.addPass(chromaticAberrationPass);
        
        // Add scanline effect for retro CRT feel
        if (this.settings.postProcessing.scanlines > 0) {
            const scanlinePass = new ShaderPass({
                uniforms: {
                    tDiffuse: { value: null },
                    amount: { value: this.settings.postProcessing.scanlines },
                    time: { value: 0 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D tDiffuse;
                    uniform float amount;
                    uniform float time;
                    varying vec2 vUv;
                    
                    void main() {
                        vec4 color = texture2D(tDiffuse, vUv);
                        
                        // Scanline effect - adjustable intensity
                        float scanline = sin(vUv.y * 200.0) * 0.5 + 0.5;
                        scanline = mix(1.0, scanline, amount);
                        
                        // Add subtle movement to scanlines
                        float scanlineShift = sin(time * 0.2) * 0.001;
                        float scanline2 = sin((vUv.y + scanlineShift) * 200.0) * 0.5 + 0.5;
                        scanline2 = mix(1.0, scanline2, amount * 0.7);
                        
                        // Combine scanlines
                        scanline = min(scanline, scanline2);
                        
                        // Apply to color
                        color.rgb *= 0.9 + 0.1 * scanline;
                        
                        gl_FragColor = color;
                    }
                `
            });
            
            this.scanlinePass = scanlinePass;
            this.composer.addPass(scanlinePass);
        }
        
        // Add vignette effect for dramatic corners
        if (this.settings.postProcessing.vignette > 0) {
            const vignettePass = new ShaderPass({
                uniforms: {
                    tDiffuse: { value: null },
                    amount: { value: this.settings.postProcessing.vignette },
                    time: { value: 0 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D tDiffuse;
                    uniform float amount;
                    uniform float time;
                    varying vec2 vUv;
                    
                    void main() {
                        vec4 color = texture2D(tDiffuse, vUv);
                        
                        // Calculate distance from center
                        vec2 uv = vUv - 0.5;
                        float dist = length(uv);
                        
                        // Create dynamic vignette that pulses subtly
                        float vignette = 1.0 - dist * (amount * 2.0);
                        vignette = smoothstep(0.0, 1.0, vignette);
                        vignette = pow(vignette, 1.5);
                        
                        // Add subtle pulse
                        vignette *= 0.95 + 0.05 * sin(time * 0.3);
                        
                        // Apply vignette
                        color.rgb *= vignette;
                        
                        gl_FragColor = color;
                    }
                `
            });
            
            this.vignettePass = vignettePass;
            this.composer.addPass(vignettePass);
        }
    }
    
    /**
     * Initialize enhanced particle system with data stream effects
     */
    initParticleSystem() {
        if (!this.settings.particles.enabled) return;
        
        // Create particle geometry
        const particleCount = this.settings.particles.count;
        const particleSize = this.settings.particles.size;
        
        // Create particle geometry
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const alphas = new Float32Array(particleCount);
        const speeds = new Float32Array(particleCount);
        const velocities = [];
        
        // Get palette colors as array for easier access
        const paletteColors = [
            this.cyberpunkPalette.neonGreen, 
            this.cyberpunkPalette.acidGreen,
            this.cyberpunkPalette.lightBlue, 
            this.cyberpunkPalette.electricBlue,
            this.cyberpunkPalette.neonOrange
        ];
        
        // Special distribution patterns for particles
        const patterns = {
            dataStream: 0.4,      // Particles flowing in streams
            neuralCloud: 0.35,    // Particles forming clouds around neurons
            ambient: 0.25         // Ambient background particles
        };
        
        for (let i = 0; i < particleCount; i++) {
            // Determine which pattern this particle belongs to
            const patternRoll = Math.random();
            let radius, theta, phi, colorChoice, sizeMultiplier, alphaValue, speedMultiplier;
            
            if (patternRoll < patterns.dataStream) {
                // Data stream particles - arranged in visible flows
                const streamIndex = Math.floor(Math.random() * 8); // 8 different data streams
                const streamAngle = (streamIndex / 8) * Math.PI * 2;
                const streamRadius = 2 + Math.random() * 10;
                const streamHeight = (Math.random() * 2 - 1) * 10;
                
                // Position in a tube-like structure
                radius = streamRadius;
                theta = streamAngle + (Math.random() * 0.2 - 0.1); // Small random variation
                phi = Math.PI/2 + (Math.random() * 0.3 - 0.15); // Near horizontal plane
                
                // Adjust actual position
                positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = streamHeight;
                positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
                
                // Data streams use primary neon colors
                colorChoice = paletteColors[streamIndex % paletteColors.length];
                sizeMultiplier = 0.8 + Math.random() * 0.4;
                alphaValue = 0.7 + Math.random() * 0.3;
                speedMultiplier = 1.5 + Math.random() * 1.0; // Faster
            } 
            else if (patternRoll < patterns.dataStream + patterns.neuralCloud) {
                // Neural cloud particles - clustered around key neural positions
                radius = 2 + Math.random() * 4;
                theta = Math.random() * Math.PI * 2;
                phi = Math.random() * Math.PI;
                
                positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = radius * Math.cos(phi);
                positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
                
                // Clouds use varied but softer colors
                colorChoice = paletteColors[Math.floor(Math.random() * paletteColors.length)];
                sizeMultiplier = 0.6 + Math.random() * 0.8;
                alphaValue = 0.5 + Math.random() * 0.4;
                speedMultiplier = 0.4 + Math.random() * 0.3; // Slower, more ambient
            } 
            else {
                // Ambient background particles
                radius = 5 + Math.random() * 15;
                theta = Math.random() * Math.PI * 2;
                phi = Math.random() * Math.PI;
                
                positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = radius * Math.cos(phi);
                positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
                
                // Background uses all colors but more transparent
                colorChoice = paletteColors[Math.floor(Math.random() * paletteColors.length)];
                sizeMultiplier = 0.4 + Math.random() * 0.4;
                alphaValue = 0.2 + Math.random() * 0.3;
                speedMultiplier = 0.2 + Math.random() * 0.2; // Very slow
            }
            
            // Apply color with slight variations for organic feel
            colors[i * 3] = colorChoice.r * (0.9 + Math.random() * 0.2);
            colors[i * 3 + 1] = colorChoice.g * (0.9 + Math.random() * 0.2);
            colors[i * 3 + 2] = colorChoice.b * (0.9 + Math.random() * 0.2);
            
            // Apply size
            sizes[i] = particleSize * sizeMultiplier;
            
            // Apply alpha
            alphas[i] = alphaValue;
            
            // Apply speed
            speeds[i] = speedMultiplier;
            
            // Generate velocity vector - direction depends on pattern
            if (patternRoll < patterns.dataStream) {
                // Data streams follow their direction
                const streamDir = new THREE.Vector3(
                    Math.cos(theta + Math.PI/2), // Perpendicular to radius
                    (Math.random() * 0.4 - 0.2), // Slight vertical drift
                    Math.sin(theta + Math.PI/2)  // Perpendicular to radius
                ).normalize();
                
                velocities.push({
                    x: streamDir.x * 0.03 * speedMultiplier,
                    y: streamDir.y * 0.03 * speedMultiplier,
                    z: streamDir.z * 0.03 * speedMultiplier
                });
            } else {
                // Other particles have more random movement
                velocities.push({
                    x: (Math.random() * 2 - 1) * 0.01 * speedMultiplier,
                    y: (Math.random() * 2 - 1) * 0.01 * speedMultiplier,
                    z: (Math.random() * 2 - 1) * 0.01 * speedMultiplier
                });
            }
        }
        
        // Set buffer attributes
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        particlesGeometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
        particlesGeometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
        
        // Create enhanced shader material for particles
        const particlesMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pointTexture: { value: this.textures.particle || new THREE.TextureLoader().load('assets/textures/particle.png') },
                dataStreamEffect: { value: this.settings.particles.dataStreamEffect ? 1.0 : 0.0 }
            },
            vertexShader: `
                attribute float size;
                attribute float alpha;
                attribute float speed;
                
                varying vec3 vColor;
                varying float vAlpha;
                
                uniform float time;
                uniform float dataStreamEffect;
                
                void main() {
                    vColor = color;
                    vAlpha = alpha;
                    
                    // Calculate position with time-based animation
                    vec3 pos = position;
                    
                    // Data stream effect - flowing motion
                    if (dataStreamEffect > 0.5) {
                        // Create unique particle animation based on position
                        float uniqueOffset = dot(position, vec3(13.7, 7.3, 5.1));
                        
                        // For data stream particles (typically those with higher speed values)
                        if (speed > 0.7) {
                            // Directional flow animation
                            float flowDirection = sign(position.x); // Flow direction based on position
                            float flowSpeed = time * speed * 2.0;
                            float flowPhase = mod(flowSpeed + uniqueOffset, 6.28318);
                            
                            // Subtle sine wave effect along the stream
                            pos.y += sin(flowPhase) * 0.1;
                            pos.x += cos(flowPhase) * 0.05 * flowDirection;
                        } else {
                            // More subtle ambient movement for non-stream particles
                            pos.x += sin(time * 0.2 + uniqueOffset) * 0.1 * speed;
                            pos.y += cos(time * 0.3 + uniqueOffset * 1.3) * 0.1 * speed;
                            pos.z += sin(time * 0.4 + uniqueOffset * 0.7) * 0.1 * speed;
                        }
                    }
                    
                    // Calculate size with distance-based scaling and pulsing
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    
                    // Dynamic size based on speed (data stream particles pulse more)
                    float sizeFactor = speed > 0.7 ? 
                        (1.0 + 0.3 * sin(time * 2.0 + uniqueOffset)) : 
                        (1.0 + 0.1 * sin(time * 0.5 + uniqueOffset));
                    
                    gl_PointSize = size * sizeFactor * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                uniform float time;
                uniform float dataStreamEffect;
                
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    // Sample base texture
                    vec4 texColor = texture2D(pointTexture, gl_PointCoord);
                    
                    // Create dynamic color shift for cyberpunk feel
                    vec3 color = vColor;
                    
                    // Data stream particles (high alpha values) get more color modulation
                    if (vAlpha > 0.6 && dataStreamEffect > 0.5) {
                        // Enhanced color shift for data stream particles
                        float colorShift = sin(time * 3.0) * 0.2;
                        float colorPhase = time * 0.5;
                        
                        // Cyberpunk-style color cycling
                        color.r += sin(colorPhase) * 0.1;
                        color.g += sin(colorPhase + 2.1) * 0.1;
                        color.b += sin(colorPhase + 4.2) * 0.1;
                    } else {
                        // Subtle shift for ambient particles
                        color.r += sin(time * 0.3) * 0.05;
                        color.g += sin(time * 0.4) * 0.05;
                        color.b += sin(time * 0.5) * 0.05;
                    }
                    
                    // Apply texture alpha and particle alpha
                    float alpha = texColor.a * vAlpha;
                    
                    // Output the final color
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        });
        
        // Create the particle system
        this.particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        this.particleSystem.userData.velocities = velocities;
        this.scene.add(this.particleSystem);
        
        // Store for later updates
        this.materials.particles = particlesMaterial;
    }
    
    /**
     * Initialize grid environment with retro-tech aesthetic
     */
    initGridEnvironment() {
        if (!this.settings.environment.enabled) return;
        
        // Set scene background and fog for cyberpunk feel
        this.scene.background = this.settings.environment.skyboxColor;
        this.scene.fog = new THREE.FogExp2(
            this.settings.environment.skyboxColor, 
            this.settings.environment.fogDensity
        );
        
        // Create infinite grid floor
        if (this.settings.environment.gridEnabled) {
            const gridSize = 100;
            const gridDivisions = 100;
            const gridColor = this.cyberpunkPalette.neonGreen;
            const gridMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    gridColor: { value: new THREE.Color(gridColor) },
                    fogColor: { value: this.settings.environment.skyboxColor },
                    fogDensity: { value: this.settings.environment.fogDensity * 1.5 }
                },
                vertexShader: `
                    varying vec3 vPosition;
                    
                    void main() {
                        vPosition = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform vec3 gridColor;
                    uniform vec3 fogColor;
                    uniform float fogDensity;
                    
                    varying vec3 vPosition;
                    
                    // Fog calculation
                    float calculateFog(float depth) {
                        return 1.0 - exp(-fogDensity * depth * depth);
                    }
                    
                    void main() {
                        // Calculate grid lines
                        float smallGrid = 1.0;
                        float largeGrid = 1.0;
                        
                        // Small grid (thin lines)
                        smallGrid = 1.0 - smoothstep(0.95, 0.98, abs(sin(vPosition.x * 1.0)));
                        smallGrid *= 1.0 - smoothstep(0.95, 0.98, abs(sin(vPosition.z * 1.0)));
                        
                        // Large grid (thicker lines)
                        largeGrid = 1.0 - smoothstep(0.75, 0.85, abs(sin(vPosition.x * 0.1)));
                        largeGrid *= 1.0 - smoothstep(0.75, 0.85, abs(sin(vPosition.z * 0.1)));
                        
                        // Combine grids with different intensities
                        float grid = smallGrid * 0.4 + largeGrid * 0.6;
                        
                        // Circular distance falloff
                        float dist = length(vPosition.xz);
                        float falloff = 1.0 - smoothstep(30.0, 80.0, dist);
                        
                        // Pulse effect emanating from center
                        float pulse = sin(time * 0.5 - dist * 0.05) * 0.5 + 0.5;
                        pulse = smoothstep(0.2, 0.8, pulse) * 0.3;
                        
                        // Calculate base visibility
                        float visibility = min(grid + pulse, 1.0) * falloff;
                        
                        // Apply fog
                        float fogAmount = calculateFog(length(vPosition) * 0.1);
                        
                        // Final color with fog
                        vec3 finalColor = mix(gridColor * visibility, fogColor, fogAmount);
                        
                        gl_FragColor = vec4(finalColor, max(0.01, visibility));
                    }
                `,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            });
            
            const gridGeometry = new THREE.PlaneGeometry(gridSize, gridSize, gridDivisions, gridDivisions);
            this.gridFloor = new THREE.Mesh(gridGeometry, gridMaterial);
            this.gridFloor.rotation.x = -Math.PI / 2;
            this.gridFloor.position.y = -10;
            this.scene.add(this.gridFloor);
            
            // Store material for updates
            this.materials.grid = gridMaterial;
        }
        
        // Add atmospheric volumetric "digital fog" effect
        this.addAtmosphericFog();
    }
    
    /**
     * Add atmospheric volumetric fog for cyberpunk environment
     */
    addAtmosphericFog() {
        // Create several fog planes at different heights with shader effects
        const fogGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
        const fogMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                fogColor1: { value: this.cyberpunkPalette.neonGreen.clone().multiplyScalar(0.2) },
                fogColor2: { value: this.cyberpunkPalette.electricBlue.clone().multiplyScalar(0.2) },
                noiseTexture: { value: this.textures.noise }
            },
            vertexShader: `
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 fogColor1;
                uniform vec3 fogColor2;
                uniform sampler2D noiseTexture;
                
                varying vec2 vUv;
                
                void main() {
                    // Sample noise texture with time-based offset
                    vec2 noiseUv = vUv * 3.0;
                    noiseUv.x += time * 0.01;
                    noiseUv.y += time * 0.02;
                    
                    float noise = texture2D(noiseTexture, noiseUv).r;
                    
                    // Add second layer of noise
                    vec2 noiseUv2 = vUv * 2.0 - vec2(time * 0.02, time * 0.01);
                    float noise2 = texture2D(noiseTexture, noiseUv2).r;
                    
                    // Combine noises
                    noise = mix(noise, noise2, 0.5);
                    
                    // Create fog effect with noise
                    float fogStrength = smoothstep(0.3, 0.7, noise) * 0.15;
                    
                    // Mix between two fog colors based on noise
                    vec3 fogColor = mix(fogColor1, fogColor2, noise);
                    
                    // Radial falloff from center
                    float dist = length(vUv - 0.5);
                    float falloff = smoothstep(0.5, 0.2, dist);
                    
                    // Final alpha is fog strength with falloff
                    float alpha = fogStrength * falloff;
                    
                    gl_FragColor = vec4(fogColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        
        // Create fog planes at different heights
        this.fogPlanes = [];
        const fogHeights = [-5, -3, 0, 3, 5];
        
        for (let i = 0; i < fogHeights.length; i++) {
            const fogPlane = new THREE.Mesh(fogGeometry, fogMaterial.clone());
            fogPlane.rotation.x = Math.PI / 2; // Horizontal plane
            fogPlane.position.y = fogHeights[i];
            this.scene.add(fogPlane);
            
            // Store for animation
            this.fogPlanes.push({
                mesh: fogPlane,
                baseHeight: fogHeights[i],
                speed: 0.1 + Math.random() * 0.1
            });
        }
        
        // Store material for updates
        this.materials.fog = fogMaterial;
    }
    
    /**
     * Initialize volumetric light effects with cyberpunk colors
     */
    initVolumetricLights() {
        if (!this.settings.volumetricLights.enabled) return;
        
        this.volumetricLights = [];
        const settings = this.settings.volumetricLights;
        
        // Create light positions in a circle around the scene
        const positions = [];
        for (let i = 0; i < settings.count; i++) {
            const angle = (i / settings.count) * Math.PI * 2;
            const radius = 15 + Math.random() * 5;
            positions.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                5 + Math.random() * 10,
                Math.sin(angle) * radius
            ));
        }
        
        // Use colors from settings
        const colors = settings.colors;
        
        for (let i = 0; i < Math.min(settings.count, positions.length); i++) {
            // Create volumetric light cone with improved shader
            const coneHeight = 15 + Math.random() * 10;
            const coneRadius = 2 + Math.random() * 2;
            const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 32, 1, true);
            
            const volumetricMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    baseColor: { value: colors[i % colors.length] },
                    intensity: { value: settings.intensity * (0.7 + Math.random() * 0.6) },
                    noiseTexture: { value: this.textures.noise }
                },
                vertexShader: `
                    varying vec3 vPosition;
                    varying vec2 vUv;
                    
                    void main() {
                        vPosition = position;
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform vec3 baseColor;
                    uniform float intensity;
                    uniform sampler2D noiseTexture;
                    
                    varying vec3 vPosition;
                    varying vec2 vUv;
                    
                    void main() {
                        // Calculate axial and radial coordinates
                        float yPos = vPosition.y;
                        float height = 15.0; // Approximate cone height
                        float heightFactor = 1.0 - (yPos / height);
                        
                        // Calculate distance from central axis
                        vec3 axisPos = vec3(0.0, vPosition.y, 0.0);
                        float axisDistance = length(vPosition - axisPos) / 3.0;
                        
                        // Sample noise texture for volumetric effect
                        vec2 noiseUv = vUv * 3.0;
                        noiseUv.x += time * 0.1;
                        noiseUv.y += time * 0.2;
                        float noise = texture2D(noiseTexture, noiseUv).r;
                        
                        // Second noise sample for more detail
                        vec2 noiseUv2 = vUv * 5.0 - vec2(time * 0.15, 0.0);
                        float noise2 = texture2D(noiseTexture, noiseUv2).r;
                        
                        // Combine noises
                        noise = mix(noise, noise2, 0.5);
                        
                        // Calculate light beam intensity
                        float beamEdge = smoothstep(1.0, 0.7, axisDistance);
                        float beamFade = pow(heightFactor, 1.5);
                        float beam = beamEdge * beamFade;
                        
                        // Apply noise for volumetric effect
                        beam *= 0.5 + noise * 0.5;
                        
                        // Add animated energy pulses flowing down the beam
                        float pulse = sin(time * 2.0 - heightFactor * 10.0) * 0.5 + 0.5;
                        pulse = smoothstep(0.3, 0.7, pulse) * 0.3;
                        
                        // Calculate final alpha
                        float alpha = beam * intensity * (1.0 + pulse);
                        
                        // Apply easing to make edges softer
                        alpha = smoothstep(0.0, 0.1, alpha) * min(alpha, 1.0);
                        
                        // Mix in some noise-based color variation
                        vec3 color = baseColor * (0.9 + noise * 0.2);
                        
                        // Add subtle flicker
                        float flicker = 0.9 + 0.1 * sin(time * 10.0 + vPosition.y);
                        
                        gl_FragColor = vec4(color * flicker, alpha);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            
            const volumetricLight = new THREE.Mesh(coneGeometry, volumetricMaterial);
            volumetricLight.position.copy(positions[i]);
            
            // Point toward center with slight random variation
            volumetricLight.lookAt(new THREE.Vector3(
                Math.random() * 4 - 2,
                Math.random() * 4 - 7,
                Math.random() * 4 - 2
            ));
            
            this.scene.add(volumetricLight);
            this.volumetricLights.push(volumetricLight);
        }
    }
    
    /**
     * Initialize post-processing effects
     */
    initPostProcessing() {
        // Already partially implemented in initGlowEffect
        // Additional effects can be added here
    }
    
    /**
     * Initialize data flow effect lines
     */
    initDataFlowEffects() {
        if (!this.settings.dataEffects.enabled) return;
        
        // Container for all data flow effects
        this.dataFlowEffects = {
            glitches: [],
            dataPackets: [],
            activeFlows: []
        };
        
        // Setup glitch effect
        this.setupGlitchEffect();
    }
    
    /**
     * Setup glitch effect
     */
    setupGlitchEffect() {
        // Will be triggered randomly during update
    }
    
    /**
     * Create an active data flow between two points
     */
    createDataFlow(start, end, options = {}) {
        const defaultOptions = {
            color: this.cyberpunkPalette.neonGreen,
            duration: 2 + Math.random() * 3,
            width: 0.05 + Math.random() * 0.1,
            speed: 0.5 + Math.random() * 1.5,
            packetSize: 0.2 + Math.random() * 0.3,
            packetCount: 1 + Math.floor(Math.random() * 5)
        };
        
        const flowOptions = {...defaultOptions, ...options};
        
        // Create a curved path for the data to follow
        const points = [];
        const segmentCount = 8;
        
        for (let i = 0; i <= segmentCount; i++) {
            const t = i / segmentCount;
            
            // Create a curved path with a slight arc
            const midPoint = new THREE.Vector3()
                .addVectors(start, end)
                .divideScalar(2);
            
            // Add some random displacement to the midpoint
            midPoint.x += (Math.random() - 0.5) * 2;
            midPoint.y += (Math.random() - 0.5) * 2;
            midPoint.z += (Math.random() - 0.5) * 2;
            
            // Quadratic bezier curve
            const point = new THREE.Vector3();
            
            // Interpolate from start to midpoint to end
            if (t < 0.5) {
                // First half: start to midpoint
                const t2 = t * 2; // Rescale t from [0, 0.5] to [0, 1]
                point.lerpVectors(start, midPoint, t2);
            } else {
                // Second half: midpoint to end
                const t2 = (t - 0.5) * 2; // Rescale t from [0.5, 1] to [0, 1]
                point.lerpVectors(midPoint, end, t2);
            }
            
            points.push(point);
        }
        
        // Create a catmull-rom curve from the points
        const curve = new THREE.CatmullRomCurve3(points);
        curve.tension = 0.5; // Adjust curve tension
        
        // Create tube geometry for the data flow path
        const pathGeometry = new THREE.TubeGeometry(
            curve,
            20,           // Tube segments
            flowOptions.width, // Tube radius
            8,           // Radial segments
            false        // Closed
        );
        
        // Create material for the path
        const pathMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: flowOptions.color },
                speed: { value: flowOptions.speed },
                progress: { value: 0 },
                noiseTexture: { value: this.textures.noise }
            },
            vertexShader: `
                uniform float time;
                
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                uniform float speed;
                uniform float progress;
                uniform sampler2D noiseTexture;
                
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    // Data flow effect - packets of energy flowing along the tube
                    
                    // The v coordinate tells us position along the tube (0 = start, 1 = end)
                    float v = vUv.y;
                    
                    // Base path with low opacity
                    float basePath = 0.1;
                    
                    // Flowing packets
                    float packet = 0.0;
                    float packetWidth = 0.1;
                    
                    // Create multiple packets along the tube
                    for (int i = 0; i < 5; i++) {
                        float packetPos = mod(time * speed * 0.5 + float(i) * 0.2, 1.0);
                        
                        // Only render packets up to the current progress
                        if (packetPos <= progress) {
                            // Packet intensity is highest at center and fades at edges
                            float packetIntensity = smoothstep(0.0, packetWidth, abs(v - packetPos));
                            packetIntensity = 1.0 - smoothstep(0.0, packetWidth, packetIntensity);
                            
                            // Add to total packet effect
                            packet = max(packet, packetIntensity);
                        }
                    }
                    
                    // Apply noise to make it more organic
                    vec2 noiseCoord = vUv * 5.0;
                    noiseCoord.x += time * 0.1;
                    float noise = texture2D(noiseTexture, noiseCoord).r;
                    
                    // Adjust noise influence
                    packet = mix(packet, packet * noise, 0.3);
                    
                    // Only show the path up to the current progress
                    float pathVisibility = v <= progress ? basePath : 0.0;
                    
                    // Combine path and packets
                    float visibility = max(pathVisibility, packet);
                    
                    // Add edge glow effect for tube
                    float u = vUv.x; // Around the tube
                    float edgeGlow = 1.0 - abs(u - 0.5) * 2.0; // 1 at center, 0 at edges
                    edgeGlow = pow(edgeGlow, 2.0); // Sharpen the edge effect
                    
                    // Apply the edge glow to the visibility
                    visibility *= edgeGlow;
                    
                    // Adjust alpha - highest at data packets, lower for base path
                    float alpha = visibility;
                    
                    // Output color with calculated alpha
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // Create the mesh
        const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
        this.scene.add(pathMesh);
        
        // Store flow data for animation
        const flow = {
            mesh: pathMesh,
            material: pathMaterial,
            curve: curve,
            options: flowOptions,
            startTime: Date.now(),
            progress: 0,
            completed: false
        };
        
        this.dataFlowEffects.activeFlows.push(flow);
        
        return flow;
    }
    
    /**
     * Create a pulse effect between points
     */
    createPulse(start, end, options = {}) {
        const color = options.color || this.cyberpunkPalette.neonGreen;
        const duration = options.duration || 2.0;
        
        // Create data flow
        return this.createDataFlow(start, end, {
            color: color,
            duration: duration,
            speed: options.speed || 0.8,
            width: options.width || 0.1
        });
    }
    
    /**
     * Update effects - call this in animation loop
     */
    update(deltaTime) {
        // Current time in seconds
        const currentTime = performance.now() / 1000;
        
        // Update uniform times
        this.updateMaterialTimes(currentTime);
        
        // Update particle system
        this.updateParticles(deltaTime);
        
        // Update volumetric lights
        this.updateVolumetricLights(deltaTime, currentTime);
        
        // Update fog planes
        this.updateFogPlanes(deltaTime, currentTime);
        
        // Update data flow effects
        this.updateDataFlows(deltaTime, currentTime);
        
        // Randomly trigger new data flow effects
        this.triggerRandomEffects(currentTime);
        
        // Use composer for rendering
        if (this.settings.glow.enabled && this.composer) {
            this.composer.render();
        }
    }
    
    /**
     * Update all material time uniforms
     */
    updateMaterialTimes(currentTime) {
        // Update shader time uniforms
        const updateUniform = (material, uniform) => {
            if (material && material.uniforms && material.uniforms[uniform]) {
                material.uniforms[uniform].value = currentTime;
            }
        };
        
        // Update material collections
        Object.values(this.materials).forEach(material => {
            updateUniform(material, 'time');
        });
        
        // Update specific passes
        if (this.chromaticAberrationPass) {
            updateUniform(this.chromaticAberrationPass, 'time');
        }
        
        if (this.scanlinePass) {
            updateUniform(this.scanlinePass, 'time');
        }
        
        if (this.vignettePass) {
            updateUniform(this.vignettePass, 'time');
        }
    }
    
    /**
     * Update particle system
     */
    updateParticles(deltaTime) {
        if (!this.particleSystem || !this.settings.particles.enabled) return;
        
        const positions = this.particleSystem.geometry.attributes.position.array;
        const velocities = this.particleSystem.userData.velocities;
        
        for (let i = 0; i < positions.length / 3; i++) {
            // Update positions based on velocities
            positions[i * 3] += velocities[i].x * this.settings.particles.speed;
            positions[i * 3 + 1] += velocities[i].y * this.settings.particles.speed;
            positions[i * 3 + 2] += velocities[i].z * this.settings.particles.speed;
            
            // Keep particles within bounds
            const distance = Math.sqrt(
                positions[i * 3] ** 2 +
                positions[i * 3 + 1] ** 2 +
                positions[i * 3 + 2] ** 2
            );
            
            if (distance > 20) {
                // Reset to a new starting position
                const resetType = Math.random();
                
                if (resetType < 0.4) {
                    // Data stream particle
                    const streamIndex = Math.floor(Math.random() * 8);
                    const streamAngle = (streamIndex / 8) * Math.PI * 2;
                    const streamRadius = 2 + Math.random() * 3;
                    const streamHeight = (Math.random() * 2 - 1) * 10;
                    
                    positions[i * 3] = streamRadius * Math.cos(streamAngle);
                    positions[i * 3 + 1] = streamHeight;
                    positions[i * 3 + 2] = streamRadius * Math.sin(streamAngle);
                    
                    // Data stream velocity
                    const streamDir = new THREE.Vector3(
                        Math.cos(streamAngle + Math.PI/2),
                        (Math.random() * 0.4 - 0.2),
                        Math.sin(streamAngle + Math.PI/2)
                    ).normalize();
                    
                    velocities[i] = {
                        x: streamDir.x * 0.03 * (1.5 + Math.random()),
                        y: streamDir.y * 0.03 * (1.5 + Math.random()),
                        z: streamDir.z * 0.03 * (1.5 + Math.random())
                    };
                } else {
                    // Ambient particle
                    const radius = 5 + Math.random() * 5; // Smaller reset radius
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.random() * Math.PI;
                    
                    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
                    positions[i * 3 + 1] = radius * Math.cos(phi);
                    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
                    
                    // Random velocity
                    velocities[i] = {
                        x: (Math.random() * 2 - 1) * 0.01,
                        y: (Math.random() * 2 - 1) * 0.01,
                        z: (Math.random() * 2 - 1) * 0.01
                    };
                }
            }
        }
        
        // Mark positions as needing update
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    /**
     * Update volumetric lights
     */
    updateVolumetricLights(deltaTime, currentTime) {
        // Volumetric lights are already updated via their shader time uniform
        
        // Add some subtle movement to the lights
        if (this.volumetricLights && this.volumetricLights.length > 0) {
            this.volumetricLights.forEach((light, index) => {
                // Subtle rotation
                light.rotation.z = Math.sin(currentTime * 0.2 + index) * 0.1;
                
                // Subtle position shift
                light.position.y += Math.sin(currentTime * 0.3 + index * 2) * 0.01;
                
                // Ensure not too far from original
                if (light.position.y > 15) light.position.y = 15;
                if (light.position.y < 5) light.position.y = 5;
            });
        }
    }
    
    /**
     * Update fog planes
     */
    updateFogPlanes(deltaTime, currentTime) {
        if (this.fogPlanes && this.fogPlanes.length > 0) {
            this.fogPlanes.forEach(plane => {
                // Subtle height oscillation
                plane.mesh.position.y = plane.baseHeight + Math.sin(currentTime * plane.speed) * 0.5;
                
                // Subtle rotation for more organic movement
                plane.mesh.rotation.z = Math.sin(currentTime * plane.speed * 0.5) * 0.02;
            });
        }
    }
    
    /**
     * Update data flow effects
     */
    updateDataFlows(deltaTime, currentTime) {
        if (!this.dataFlowEffects) return;
        
        // Update active flows
        for (let i = this.dataFlowEffects.activeFlows.length - 1; i >= 0; i--) {
            const flow = this.dataFlowEffects.activeFlows[i];
            
            // Calculate progress
            const elapsed = (Date.now() - flow.startTime) / 1000;
            
            // Update progress uniform - clamped to 1.0
            flow.progress = Math.min(elapsed / flow.options.duration, 1.0);
            flow.material.uniforms.progress.value = flow.progress;
            
            // Remove completed flows
            if (elapsed > flow.options.duration + 1.0) { // Extra second for fade out
                this.scene.remove(flow.mesh);
                flow.mesh.geometry.dispose();
                flow.mesh.material.dispose();
                this.dataFlowEffects.activeFlows.splice(i, 1);
            }
        }
    }
    
    /**
     * Trigger random visual effects periodically
     */
    triggerRandomEffects(currentTime) {
        // Random data flow between neural nodes
        if (this.settings.dataEffects.enabled && Math.random() < 0.02) {
            // Get random positions to simulate flows between neurons
            const startPoint = new THREE.Vector3(
                (Math.random() * 2 - 1) * 10,
                (Math.random() * 2 - 1) * 10,
                (Math.random() * 2 - 1) * 10
            );
            
            const endPoint = new THREE.Vector3(
                (Math.random() * 2 - 1) * 10,
                (Math.random() * 2 - 1) * 10,
                (Math.random() * 2 - 1) * 10
            );
            
            // Random color from palette
            const colors = [
                this.cyberpunkPalette.neonGreen,
                this.cyberpunkPalette.lightBlue,
                this.cyberpunkPalette.neonOrange,
                this.cyberpunkPalette.electricBlue
            ];
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Create the flow
            this.createDataFlow(startPoint, endPoint, {
                color: color,
                duration: 2 + Math.random() * 3
            });
        }
    }
    
    /**
     * Create a highlight effect on a neuron
     */
    highlightNeuron(neuron, options = {}) {
        const duration = options.duration || 2000;
        const intensity = options.intensity || 1.5;
        const color = options.color || this.cyberpunkPalette.neonGreen;
        
        // Store original material
        const originalMaterial = neuron.material;
        const originalEmissive = originalMaterial.emissive.clone();
        const originalEmissiveIntensity = originalMaterial.emissiveIntensity;
        
        // Create glow material
        neuron.material = originalMaterial.clone();
        neuron.material.emissive.set(color);
        neuron.material.emissiveIntensity = intensity;
        
        // Create timeline for animation
        const startTime = Date.now();
        
        // Animation function
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                // Continue animation
                requestAnimationFrame(animate);
                
                // Pulsing effect
                const pulseIntensity = intensity * (0.7 + 0.3 * Math.sin(progress * Math.PI * 8));
                neuron.material.emissiveIntensity = pulseIntensity;
            } else {
                // Restore original material
                neuron.material.dispose();
                neuron.material = originalMaterial;
                neuron.material.emissive.copy(originalEmissive);
                neuron.material.emissiveIntensity = originalEmissiveIntensity;
            }
        };
        
        // Start animation
        animate();
    }
    
    /**
     * Resize handler for effects
     */
    resize(width, height) {
        if (this.composer) {
            this.composer.setSize(width, height);
        }
        
        // Update uniforms that depend on screen size
        if (this.chromaticAberrationPass && this.chromaticAberrationPass.uniforms) {
            this.chromaticAberrationPass.uniforms.resolution = {
                value: new THREE.Vector2(1/width, 1/height)
            };
        }
    }
}

// Export the class
export { NeuralEffects };

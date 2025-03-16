/**
 * neuralEffects.js
 * Advanced visualization effects for ORGANIX neural interface
 */

class NeuralEffects {
    constructor(scene, renderer, camera) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        
        // Effect settings
        this.settings = {
            glow: {
                enabled: true,
                strength: 0.8,
                radius: 0.5,
                threshold: 0.3
            },
            particles: {
                enabled: true,
                count: 1000,
                size: 0.03,
                speed: 0.2
            },
            pulses: {
                enabled: true,
                speed: 0.7,
                width: 0.5,
                color: 0x00a8ff
            },
            environment: {
                enabled: true,
                intensity: 0.7,
                rotation: 0.0002
            }
        };
        
        // Initialize effects
        this.initEffects();
    }
    
    /**
     * Initialize all visual effects
     */
    initEffects() {
        this.initGlowEffect();
        this.initParticleSystem();
        this.initPulseEffects();
        this.initEnvironment();
    }
    
    /**
     * Initialize the glow effect for neurons
     */
    initGlowEffect() {
        if (!this.settings.glow.enabled) return;
        
        // Set up bloom effect with Three.js postprocessing
        const { UnrealBloomPass, EffectComposer, RenderPass } = THREE;
        
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Add bloom pass
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            this.settings.glow.strength,
            this.settings.glow.radius,
            this.settings.glow.threshold
        );
        this.composer.addPass(this.bloomPass);
    }
    
    /**
     * Initialize ambient particle system
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
        const velocities = [];
        
        // Fill particle arrays with random positions and colors
        for (let i = 0; i < particleCount; i++) {
            // Random positions in a sphere
            const radius = 15 * Math.random();
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Random colors (blue shades)
            colors[i * 3] = 0.5 * Math.random();      // R
            colors[i * 3 + 1] = 0.5 * Math.random() + 0.5; // G
            colors[i * 3 + 2] = Math.random();      // B
            
            // Random sizes
            sizes[i] = particleSize * (0.5 + Math.random() * 0.5);
            
            // Random velocities
            velocities.push({
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            });
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Create particle material
        const particlesMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pointTexture: { value: new THREE.TextureLoader().load('assets/textures/particle.png') }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                
                void main() {
                    gl_FragColor = vec4(vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
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
    }
    
    /**
     * Initialize pulse effects for connections
     */
    initPulseEffects() {
        if (!this.settings.pulses.enabled) return;
        
        // Will be created dynamically when neurons are connected
        this.pulses = [];
    }
    
    /**
     * Initialize environment effects
     */
    initEnvironment() {
        if (!this.settings.environment.enabled) return;
        
        // Create environment sphere (skybox)
        const sphereGeometry = new THREE.SphereGeometry(50, 32, 32);
        const sphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec2 vUv;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec3 vNormal;
                varying vec2 vUv;
                
                float noise(vec3 p) {
                    vec3 i = floor(p);
                    vec3 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    
                    vec2 uv = (i.xy + vec2(37.0, 17.0) * i.z) + f.xy;
                    vec2 rg = textureLod( vUv, (uv + 0.5) / 256.0, 0.0 ).yx;
                    return mix(rg.x, rg.y, f.z);
                }
                
                void main() {
                    vec3 color1 = vec3(0.1, 0.1, 0.3);
                    vec3 color2 = vec3(0.0, 0.2, 0.4);
                    
                    float n = 0.5 + 0.5 * noise(vNormal * 3.0 + time * 0.2);
                    
                    vec3 color = mix(color1, color2, n);
                    
                    // Add subtle gradient
                    color += vec3(0.1, 0.2, 0.3) * (1.0 - vUv.y);
                    
                    // Add subtle noise pattern
                    float noiseVal = noise(vNormal * 10.0 + time * 0.1);
                    color += vec3(noiseVal * 0.1);
                    
                    gl_FragColor = vec4(color, 0.8);
                }
            `,
            side: THREE.BackSide,
            transparent: true,
            depthWrite: false
        });
        
        this.environmentSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.scene.add(this.environmentSphere);
    }
    
    /**
     * Create a pulse effect between two neurons
     * @param {THREE.Vector3} start - Start position
     * @param {THREE.Vector3} end - End position
     * @param {Object} options - Pulse options
     */
    createPulse(start, end, options = {}) {
        if (!this.settings.pulses.enabled) return null;
        
        const color = options.color || this.settings.pulses.color;
        const speed = options.speed || this.settings.pulses.speed;
        const width = options.width || this.settings.pulses.width;
        
        // Create a curve between nodes
        const curve = new THREE.CatmullRomCurve3([
            start,
            new THREE.Vector3(
                (start.x + end.x) / 2 + (Math.random() - 0.5) * 2,
                (start.y + end.y) / 2 + (Math.random() - 0.5) * 2,
                (start.z + end.z) / 2 + (Math.random() - 0.5) * 2
            ),
            end
        ]);
        
        // Create tube geometry along the curve
        const tubeGeometry = new THREE.TubeGeometry(
            curve,
            20,    // tubularSegments
            width * 0.05, // radius
            8,     // radiusSegments
            false  // closed
        );
        
        // Create shader material for the pulse
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(color) },
                speed: { value: speed }
            },
            vertexShader: `
                uniform float time;
                varying float vU;
                
                void main() {
                    vU = uv.x;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                uniform float speed;
                varying float vU;
                
                void main() {
                    float pulse = mod(vU - time * speed, 1.0);
                    float alpha = smoothstep(0.0, 0.1, pulse) * smoothstep(0.3, 0.1, pulse);
                    alpha = alpha * 0.6;
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        const pulse = new THREE.Mesh(tubeGeometry, material);
        this.scene.add(pulse);
        
        // Store in pulses array
        const pulseObj = {
            mesh: pulse,
            startTime: Date.now(),
            duration: options.duration || 3000, // Default 3 seconds
            curve: curve
        };
        
        this.pulses.push(pulseObj);
        
        return pulseObj;
    }
    
    /**
     * Update effects - call this in animation loop
     */
    update(deltaTime) {
        // Update time uniform for all shader materials
        if (this.particleSystem) {
            this.particleSystem.material.uniforms.time.value += deltaTime;
        }
        
        if (this.environmentSphere) {
            this.environmentSphere.material.uniforms.time.value += deltaTime;
            this.environmentSphere.rotation.y += this.settings.environment.rotation;
        }
        
        // Update particles
        if (this.particleSystem && this.settings.particles.enabled) {
            const positions = this.particleSystem.geometry.attributes.position.array;
            const velocities = this.particleSystem.userData.velocities;
            
            for (let i = 0; i < positions.length / 3; i++) {
                // Update positions based on velocities
                positions[i * 3] += velocities[i].x * this.settings.particles.speed;
                positions[i * 3 + 1] += velocities[i].y * this.settings.particles.speed;
                positions[i * 3 + 2] += velocities[i].z * this.settings.particles.speed;
                
                // Keep particles within bounds (sphere)
                const distance = Math.sqrt(
                    positions[i * 3] ** 2 +
                    positions[i * 3 + 1] ** 2 +
                    positions[i * 3 + 2] ** 2
                );
                
                if (distance > 15) {
                    // Reset to random position within a smaller sphere
                    const radius = 5 * Math.random();
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.random() * Math.PI;
                    
                    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
                    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                    positions[i * 3 + 2] = radius * Math.cos(phi);
                }
            }
            
            this.particleSystem.geometry.attributes.position.needsUpdate = true;
        }
        
        // Update pulses
        if (this.settings.pulses.enabled) {
            const now = Date.now();
            
            for (let i = this.pulses.length - 1; i >= 0; i--) {
                const pulse = this.pulses[i];
                
                // Update time uniform
                pulse.mesh.material.uniforms.time.value = (now - pulse.startTime) / 1000;
                
                // Remove expired pulses
                if (now - pulse.startTime > pulse.duration) {
                    this.scene.remove(pulse.mesh);
                    pulse.mesh.geometry.dispose();
                    pulse.mesh.material.dispose();
                    this.pulses.splice(i, 1);
                }
            }
        }
        
        // Use composer for rendering if glow is enabled
        if (this.settings.glow.enabled && this.composer) {
            this.composer.render();
        }
    }
    
    /**
     * Update effect settings
     * @param {Object} settings - New settings
     */
    updateSettings(settings) {
        // Update settings
        if (settings.glow) {
            Object.assign(this.settings.glow, settings.glow);
            
            // Update bloom pass
            if (this.bloomPass) {
                this.bloomPass.strength = this.settings.glow.strength;
                this.bloomPass.radius = this.settings.glow.radius;
                this.bloomPass.threshold = this.settings.glow.threshold;
            }
        }
        
        if (settings.particles) {
            Object.assign(this.settings.particles, settings.particles);
        }
        
        if (settings.pulses) {
            Object.assign(this.settings.pulses, settings.pulses);
        }
        
        if (settings.environment) {
            Object.assign(this.settings.environment, settings.environment);
        }
    }
    
    /**
     * Resize handler for effects
     */
    resize(width, height) {
        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }
    
    /**
     * Create a highlight effect on a neuron
     * @param {THREE.Mesh} neuron - Neuron to highlight
     * @param {Object} options - Highlight options
     */
    highlightNeuron(neuron, options = {}) {
        const duration = options.duration || 2000;
        const intensity = options.intensity || 1.5;
        const color = options.color || 0x00ffff;
        
        // Store original material
        const originalMaterial = neuron.material;
        const originalEmissive = originalMaterial.emissive.clone();
        const originalEmissiveIntensity = originalMaterial.emissiveIntensity;
        
        // Create glow material
        neuron.material = originalMaterial.clone();
        neuron.material.emissive.set(new THREE.Color(color));
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
}

// Export the class
export { NeuralEffects };

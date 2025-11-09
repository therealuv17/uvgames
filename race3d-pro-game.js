// Game variables
let scene, camera, renderer, car, road;
let gameState = 'start';
let speed = 0;
let maxSpeed = 200; // Increased max speed
let acceleration = 0;
let steering = 0;
let carRotation = 0;
let carX = 0;
let roadOffset = 0;
let distance = 0;
let startTime = 0;
let boost = 100;
let isBoosting = false;
let topSpeed = 0;
let particles = [];
let obstacles = [];
let stage = 1;
let isDrifting = false;
let driftAngle = 0;
let driftScore = 0;
let trackCurve = 0; // Current track curvature
let trackSegments = []; // Road segments for curves

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// UI elements
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const speedElement = document.getElementById('speed');
const distanceElement = document.getElementById('distance');
const boostElement = document.getElementById('boost');
const finalDistanceElement = document.getElementById('finalDistance');
const finalTimeElement = document.getElementById('finalTime');
const topSpeedElement = document.getElementById('topSpeed');
const stageElement = document.getElementById('stage');
const driftIndicator = document.getElementById('driftIndicator');
const backgroundMusic = document.getElementById('backgroundMusic');
const musicToggle = document.getElementById('musicToggle');

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Music controls
let musicEnabled = true;
if (backgroundMusic) {
    backgroundMusic.volume = 0.6; // Set volume to 60%
    
    // Music toggle button
    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            musicEnabled = !musicEnabled;
            if (musicEnabled) {
                backgroundMusic.play().catch(e => console.log('Music play prevented:', e));
                musicToggle.textContent = '🔊 Music: ON';
            } else {
                backgroundMusic.pause();
                musicToggle.textContent = '🔇 Music: OFF';
            }
        });
    }
    
    // Try to play music when user interacts (browser autoplay policy)
    document.addEventListener('click', () => {
        if (backgroundMusic.paused && gameState === 'playing' && musicEnabled) {
            backgroundMusic.play().catch(e => console.log('Music autoplay prevented:', e));
        }
    }, { once: true });
}

function init() {
    // Scene setup - Enhanced cyberpunk background
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510); // Even darker
    
    // Camera setup - Better angle
    camera = new THREE.PerspectiveCamera(70, 1000 / 600, 0.1, 1000);
    camera.position.set(0, 6, 12);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    const container = document.getElementById('gameCanvas');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1000, 600);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Enhanced cyberpunk lighting
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.2);
    scene.add(ambientLight);
    
    // Multiple neon lights for better atmosphere
    const neonPink = new THREE.PointLight(0xff00ff, 1.5, 60);
    neonPink.position.set(0, 12, 0);
    neonPink.castShadow = true;
    scene.add(neonPink);
    
    const neonCyan = new THREE.PointLight(0x00ffff, 1.2, 60);
    neonCyan.position.set(-8, 8, 0);
    scene.add(neonCyan);
    
    const neonPurple = new THREE.PointLight(0x9d00ff, 1.2, 60);
    neonPurple.position.set(8, 8, 0);
    scene.add(neonPurple);
    
    // Create enhanced road
    createRoad();
    
    // Create improved futuristic car
    car = createCar(0xff00ff);
    car.position.set(0, 0.5, 0);
    scene.add(car);
    
    // Create enhanced environment
    createEnvironment();
    
    // Create initial obstacles
    createObstacles();
}

function getTrackCurve(distance) {
    // Create smoother, more gradual curves
    const curve1 = Math.sin(distance / 150) * 2; // Large sweeping curves
    const curve2 = Math.sin(distance / 80) * 1; // Medium curves
    return curve1 + curve2 * 0.5; // Combined smooth curve
}

function getTrackRotation(distance) {
    // Calculate smooth rotation based on curve derivative
    const delta = 0.5;
    const curve1 = getTrackCurve(distance);
    const curve2 = getTrackCurve(distance + delta);
    return (curve2 - curve1) / delta * 0.05; // Reduced rotation intensity
}

function createRoad() {
    const roadGroup = new THREE.Group();
    road = roadGroup;
    scene.add(road);
    
    // Create road segments dynamically
    updateRoadSegments();
}

function updateRoadSegments() {
    if (!road) return;
    
    // Clear existing road children
    while (road.children.length > 0) {
        road.remove(road.children[0]);
    }
    
    // Create road segments along the curve - smoother and longer segments
    const segmentLength = 8;
    const numSegments = 50;
    
    for (let i = 0; i < numSegments; i++) {
        const z = -i * segmentLength;
        const curve = getTrackCurve(distance - z);
        
        // Road surface segment
        const roadGeometry = new THREE.PlaneGeometry(10, segmentLength);
        const roadMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x0f0f1f,
            emissive: 0x050510,
            emissiveIntensity: 0.3,
            roughness: 0.8,
            metalness: 0.1
        });
        const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
        roadMesh.rotation.x = -Math.PI / 2;
        roadMesh.position.set(curve, 0, z);
        roadMesh.receiveShadow = true;
        road.add(roadMesh);
        
        // Center line - more frequent
        const lineGeometry = new THREE.PlaneGeometry(0.2, segmentLength);
        const lineMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 1.5
        });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.rotation.x = -Math.PI / 2;
        line.position.set(curve, 0.02, z);
        road.add(line);
        
        // Road edges
        const edgeGeometry = new THREE.PlaneGeometry(0.4, segmentLength);
        const edgeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff00ff,
            emissive: 0xff00ff,
            emissiveIntensity: 3
        });
        
        const leftEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        leftEdge.rotation.x = -Math.PI / 2;
        leftEdge.position.set(curve - 5, 0.03, z);
        road.add(leftEdge);
        
        const rightEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        rightEdge.rotation.x = -Math.PI / 2;
        rightEdge.position.set(curve + 5, 0.03, z);
        road.add(rightEdge);
        
        // Side barriers
        const barrierGeometry = new THREE.BoxGeometry(0.2, 0.5, segmentLength);
        const barrierMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a2e,
            emissive: 0xff00ff,
            emissiveIntensity: 0.5
        });
        
        const leftBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        leftBarrier.position.set(curve - 5.2, 0.25, z);
        road.add(leftBarrier);
        
        const rightBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        rightBarrier.position.set(curve + 5.2, 0.25, z);
        road.add(rightBarrier);
    }
}

function createCar(color = 0xff00ff) {
    const carGroup = new THREE.Group();
    
    // Enhanced futuristic car body
    const bodyGeometry = new THREE.BoxGeometry(2, 0.6, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: color,
        emissive: color,
        emissiveIntensity: 0.6,
        metalness: 0.9,
        roughness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    body.castShadow = true;
    carGroup.add(body);
    
    // Enhanced roof
    const roofGeometry = new THREE.BoxGeometry(1.6, 0.4, 2);
    const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: color * 0.6,
        emissive: color * 0.4,
        emissiveIntensity: 0.4,
        metalness: 0.95,
        roughness: 0.05
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 1.2, -0.5);
    roof.castShadow = true;
    carGroup.add(roof);
    
    // Enhanced neon windows
    const windowGeometry = new THREE.PlaneGeometry(1.4, 1);
    const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.7
    });
    
    const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    frontWindow.position.set(0, 1.2, 0.4);
    frontWindow.rotation.x = Math.PI / 2;
    carGroup.add(frontWindow);
    
    const backWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    backWindow.position.set(0, 1.2, -1);
    backWindow.rotation.x = Math.PI / 2;
    carGroup.add(backWindow);
    
    // Multiple neon accent strips
    for (let i = 0; i < 3; i++) {
        const accentGeometry = new THREE.BoxGeometry(2.1, 0.08, 4.2);
        const accentMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 2.5
        });
        const accent = new THREE.Mesh(accentGeometry, accentMaterial);
        accent.position.set(0, 0.4 + i * 0.2, 0);
        carGroup.add(accent);
    }
    
    // Enhanced wheels with better rims
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 20);
    const wheelMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x111111,
        emissive: 0x333333,
        emissiveIntensity: 0.4
    });
    
    const rimGeometry = new THREE.CylinderGeometry(0.28, 0.28, 0.31, 20);
    const rimMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 1.5
    });
    
    const positions = [
        [-1.2, 0.4, 1.5], [1.2, 0.4, 1.5],
        [-1.2, 0.4, -1.5], [1.2, 0.4, -1.5]
    ];
    
    positions.forEach((pos) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        wheel.rotation.z = Math.PI / 2;
        rim.rotation.z = Math.PI / 2;
        wheel.position.set(pos[0], pos[1], pos[2]);
        rim.position.set(pos[0], pos[1], pos[2]);
        wheel.castShadow = true;
        carGroup.add(wheel);
        carGroup.add(rim);
    });
    
    // Exhaust pipes
    const exhaustGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
    const exhaustMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        emissive: 0xff00ff,
        emissiveIntensity: 0.5
    });
    
    const leftExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    leftExhaust.position.set(-0.8, 0.3, -2.2);
    carGroup.add(leftExhaust);
    
    const rightExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    rightExhaust.position.set(0.8, 0.3, -2.2);
    carGroup.add(rightExhaust);
    
    return carGroup;
}

function createEnvironment() {
    // Enhanced cyberpunk ground
    const groundGeometry = new THREE.PlaneGeometry(300, 300);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x050510,
        emissive: 0x0a0a1a,
        emissiveIntensity: 0.15
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Enhanced neon grid
    for (let i = -75; i < 75; i += 4) {
        const gridLineX = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(i, 0.02, -75),
                new THREE.Vector3(i, 0.02, 75)
            ]),
            new THREE.LineBasicMaterial({ color: 0x00ffff, opacity: 0.3, transparent: true })
        );
        scene.add(gridLineX);
        
        const gridLineZ = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-75, 0.02, i),
                new THREE.Vector3(75, 0.02, i)
            ]),
            new THREE.LineBasicMaterial({ color: 0x00ffff, opacity: 0.3, transparent: true })
        );
        scene.add(gridLineZ);
    }
    
    // Enhanced neon buildings
    for (let i = -75; i < 75; i += 6) {
        if (Math.random() > 0.25) {
            const buildingGroup = new THREE.Group();
            const height = 4 + Math.random() * 4;
            
            // Building structure
            const buildingGeometry = new THREE.BoxGeometry(1.5, height, 1.5);
            const buildingMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x0f0f1f,
                emissive: 0x2a2a3e,
                emissiveIntensity: 0.3
            });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            building.position.y = height / 2;
            building.castShadow = true;
            buildingGroup.add(building);
            
            // Multiple neon signs
            for (let j = 0; j < Math.floor(height / 2); j++) {
                const signGeometry = new THREE.PlaneGeometry(1.2, 0.5);
                const signColor = Math.random() > 0.5 ? 0xff00ff : 0x00ffff;
                const signMaterial = new THREE.MeshStandardMaterial({ 
                    color: signColor,
                    emissive: signColor,
                    emissiveIntensity: 2.5
                });
                const sign = new THREE.Mesh(signGeometry, signMaterial);
                sign.position.set(0, j * 2 + 1, 0.76);
                buildingGroup.add(sign);
            }
            
            buildingGroup.position.set(
                (Math.random() > 0.5 ? 1 : -1) * (7 + Math.random() * 3),
                0,
                i
            );
            scene.add(buildingGroup);
        }
    }
}

function createObstacles() {
    obstacles = [];
    // Create obstacles at various positions
    for (let i = 20; i < 200; i += 15) {
        if (Math.random() > 0.4) {
            const obstacleType = Math.floor(Math.random() * 3);
            let obstacle;
            
            if (obstacleType === 0) {
                // Neon barrier
                const geometry = new THREE.BoxGeometry(1, 1, 0.5);
                const material = new THREE.MeshStandardMaterial({ 
                    color: 0xff0000,
                    emissive: 0xff0000,
                    emissiveIntensity: 2
                });
                obstacle = new THREE.Mesh(geometry, material);
            } else if (obstacleType === 1) {
                // Energy sphere
                const geometry = new THREE.SphereGeometry(0.6, 16, 16);
                const material = new THREE.MeshStandardMaterial({ 
                    color: 0xffff00,
                    emissive: 0xffff00,
                    emissiveIntensity: 3,
                    transparent: true,
                    opacity: 0.8
                });
                obstacle = new THREE.Mesh(geometry, material);
            } else {
                // Cyber crate
                const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
                const material = new THREE.MeshStandardMaterial({ 
                    color: 0x00ffff,
                    emissive: 0x00ffff,
                    emissiveIntensity: 1.5
                });
                obstacle = new THREE.Mesh(geometry, material);
            }
            
            obstacle.position.set(
                (Math.random() - 0.5) * 6, // Random X position
                0.6,
                -i // Z position ahead
            );
            obstacle.userData = {
                z: -i,
                type: obstacleType,
                offsetX: (Math.random() - 0.5) * 6
            };
            obstacle.castShadow = true;
            scene.add(obstacle);
            obstacles.push(obstacle);
        }
    }
}

function updateObstacles() {
    if (gameState !== 'playing') return;
    
    obstacles.forEach((obstacle, index) => {
        // Move obstacles toward player
        obstacle.userData.z += speed * 0.012;
        
        // Get curve at obstacle position
        const curve = getTrackCurve(distance - obstacle.userData.z);
        obstacle.position.z = obstacle.userData.z;
        obstacle.position.x = curve + obstacle.userData.offsetX;
        
        // Rotate obstacles for visual effect
        if (obstacle.userData.type === 1) {
            obstacle.rotation.y += 0.05;
            obstacle.rotation.x += 0.03;
        } else if (obstacle.userData.type === 2) {
            obstacle.rotation.y += 0.02;
        }
        
        // Reset obstacle when it passes
        if (obstacle.position.z > 20) {
            obstacle.userData.z = -200 - Math.random() * 50;
            obstacle.position.z = obstacle.userData.z;
            const newCurve = getTrackCurve(distance - obstacle.userData.z);
            obstacle.userData.offsetX = (Math.random() - 0.5) * 6;
            obstacle.position.x = newCurve + obstacle.userData.offsetX;
        }
        
        // Check collision
        const dx = car.position.x - obstacle.position.x;
        const dz = car.position.z - obstacle.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 1.5) {
            // Collision!
            speed *= 0.3;
            boost = Math.max(0, boost - 20);
            obstacle.position.y = 0.6;
        }
    });
}

function updateCar() {
    if (gameState !== 'playing') return;
    
    // Enhanced acceleration
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        acceleration = 1.2;
    } else if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        acceleration = -0.6;
    } else {
        acceleration = -0.2;
    }
    
    // Boost system
    if ((keys[' '] || keys['Space']) && boost > 0 && speed > 10) {
        isBoosting = true;
        acceleration *= 1.8;
        boost -= 0.5;
        boost = Math.max(0, boost);
    } else {
        isBoosting = false;
        if (boost < 100) {
            boost += 0.1;
            boost = Math.min(100, boost);
        }
    }
    
    // Update speed
    speed += acceleration;
    speed = Math.max(0, Math.min(maxSpeed, speed));
    
    // Track top speed
    if (speed > topSpeed) {
        topSpeed = speed;
    }
    
    // Enhanced steering with drifting mechanics
    steering = 0;
    const turnSpeed = 0.04 * (speed / maxSpeed);
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        steering = -turnSpeed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        steering = turnSpeed;
    }
    
    // Drifting mechanics - activate at high speed
    const driftThreshold = 80; // Speed threshold for drifting
    isDrifting = speed > driftThreshold && Math.abs(steering) > 0;
    
    if (isDrifting) {
        // Increase drift angle
        driftAngle += steering * 1.5;
        driftAngle = Math.max(-0.8, Math.min(0.8, driftAngle));
        
        // Car rotates more during drift
        carRotation += steering * 1.3;
        carRotation = Math.max(-0.7, Math.min(0.7, carRotation));
        
        // Lateral movement is more pronounced during drift
        carX += Math.sin(carRotation) * speed * 0.018;
        carX += Math.sin(driftAngle) * speed * 0.008;
        
        // Visual drift effect - car tilts
        car.rotation.z = driftAngle * 0.3;
        
        // Update drift score
        driftScore += speed * 0.01;
        
        // Show drift indicator
        driftIndicator.style.display = 'block';
        driftIndicator.style.color = '#ff00ff';
        driftIndicator.style.textShadow = '0 0 20px #ff00ff';
    } else {
        // Normal steering
        carRotation += steering;
        carRotation = Math.max(-0.5, Math.min(0.5, carRotation));
        car.rotation.z *= 0.9; // Return to normal
        
        // Normal lateral movement
        if (speed > 0) {
            carX += Math.sin(carRotation) * speed * 0.012;
        }
        
        // Hide drift indicator
        driftIndicator.style.display = 'none';
        driftAngle *= 0.95; // Decay drift angle
    }
    
    // Get current track curve - smoother interpolation
    trackCurve = getTrackCurve(distance);
    const trackRotation = getTrackRotation(distance);
    
    // Apply rotation - combine steering with track curve (smoother)
    car.rotation.y = carRotation + trackRotation * 0.5;
    
    // Keep car on road (relative to curve) - smoother movement
    carX = Math.max(-4.5, Math.min(4.5, carX));
    car.position.x = trackCurve + carX;
    
    // Enhanced camera follow with curve - smoother camera movement
    camera.position.x = (trackCurve + car.position.x) * 0.5;
    camera.position.z = car.position.z + 12;
    camera.position.y = 6;
    camera.lookAt(car.position.x, car.position.y + 1, car.position.z);
    
    // Update UI
    speedElement.textContent = Math.floor(speed);
    boostElement.textContent = Math.floor(boost);
    
    // Visual boost effect
    if (isBoosting) {
        car.children.forEach((child) => {
            if (child.material && child.material.emissive) {
                child.material.emissiveIntensity *= 1.1;
            }
        });
    }
}

function updateDistance() {
    if (gameState === 'playing' && speed > 0) {
        distance += speed * 0.012;
        distanceElement.textContent = Math.floor(distance);
        
        // Update stage based on distance
        const newStage = Math.floor(distance / 500) + 1;
        if (newStage > stage) {
            stage = newStage;
            stageElement.textContent = stage;
            // Increase difficulty with each stage
            maxSpeed = 200 + (stage - 1) * 20;
        }
        
        // Update road segments less frequently for better performance
        if (Math.floor(distance) % 10 === 0) {
            updateRoadSegments();
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    if (gameState === 'playing') {
        updateCar();
        updateDistance();
        updateObstacles();
        
        // Enhanced wheel rotation
        car.children.forEach((child) => {
            if (child.geometry && child.geometry.type === 'CylinderGeometry') {
                child.rotation.x += speed * 0.015;
            }
        });
        
        // Create drift particles
        if (isDrifting) {
            createDriftParticle();
        }
    }
    
    renderer.render(scene, camera);
}

function createDriftParticle() {
    if (Math.random() > 0.7) {
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const particleMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff00ff,
            emissive: 0xff00ff,
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(
            car.position.x + (Math.random() - 0.5) * 2,
            0.2,
            car.position.z - 1
        );
        particle.userData = {
            life: 30,
            velocity: Math.random() * 0.1
        };
        scene.add(particle);
        particles.push(particle);
    }
    
    // Update existing particles
    particles.forEach((particle, index) => {
        particle.userData.life--;
        particle.position.z += particle.userData.velocity;
        particle.material.opacity = particle.userData.life / 30;
        
        if (particle.userData.life <= 0) {
            scene.remove(particle);
            particles.splice(index, 1);
        }
    });
}

function startGame() {
    gameState = 'playing';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    // Start background music
    if (backgroundMusic && musicEnabled) {
        backgroundMusic.play().catch(e => {
            console.log('Music play prevented:', e);
            // Music will play on user interaction
        });
    }
    
    // Reset game variables
    speed = 0;
    acceleration = 0;
    steering = 0;
    carRotation = 0;
    carX = 0;
    roadOffset = 0;
    distance = 0;
    boost = 100;
    topSpeed = 0;
    stage = 1;
    isDrifting = false;
    driftAngle = 0;
    driftScore = 0;
    maxSpeed = 200;
    startTime = Date.now();
    
    // Reset car position and rotation
    car.position.set(0, 0.5, 0);
    car.rotation.set(0, 0, 0);
    
    // Reset road position
    road.position.z = 0;
    
    // Clear obstacles and recreate
    obstacles.forEach(obs => scene.remove(obs));
    obstacles = [];
    createObstacles();
    
    // Clear particles
    particles.forEach(p => scene.remove(p));
    particles = [];
    
    distanceElement.textContent = '0';
    boostElement.textContent = '100';
    stageElement.textContent = '1';
    driftIndicator.style.display = 'none';
}

function gameOver() {
    gameState = 'gameOver';
    
    // Pause music on game over
    if (backgroundMusic) {
        backgroundMusic.pause();
    }
    
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    finalTimeElement.textContent = elapsedTime;
    finalDistanceElement.textContent = Math.floor(distance);
    topSpeedElement.textContent = Math.floor(topSpeed);
    gameOverScreen.classList.remove('hidden');
}

// Initialize game
init();
animate();


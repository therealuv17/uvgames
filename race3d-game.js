// Game variables
let scene, camera, renderer, car, road;
let gameState = 'start';
let speed = 0;
let maxSpeed = 150;
let acceleration = 0;
let steering = 0;
let carRotation = 0;
let carX = 0; // Car's X position for lateral movement
let roadOffset = 0;
let distance = 0;
let startTime = 0;
let neonParticles = [];

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
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
const lapElement = document.getElementById('lap');
const finalTimeElement = document.getElementById('finalTime');
const finalPositionElement = document.getElementById('finalPosition');

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

function init() {
    // Scene setup - Cyberpunk dark background
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a); // Dark purple/black
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, 1000 / 600, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    const container = document.getElementById('gameCanvas');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1000, 600);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Cyberpunk lighting - neon colors
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3);
    scene.add(ambientLight);
    
    // Neon pink light
    const neonPink = new THREE.PointLight(0xff00ff, 1, 50);
    neonPink.position.set(0, 10, 0);
    scene.add(neonPink);
    
    // Neon cyan light
    const neonCyan = new THREE.PointLight(0x00ffff, 0.8, 50);
    neonCyan.position.set(-5, 5, 0);
    scene.add(neonCyan);
    
    // Neon purple light
    const neonPurple = new THREE.PointLight(0x9d00ff, 0.8, 50);
    neonPurple.position.set(5, 5, 0);
    scene.add(neonPurple);
    
    // Create cyberpunk road
    createRoad();
    
    // Create futuristic car
    car = createCar(0xff00ff); // Neon pink/magenta car
    car.position.set(0, 0.5, 0);
    scene.add(car);
    
    // Create cyberpunk environment
    createEnvironment();
}

function createRoad() {
    const roadGroup = new THREE.Group();
    
    // Road surface - dark with grid pattern
    const roadGeometry = new THREE.PlaneGeometry(8, 200);
    const roadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a2e,
        emissive: 0x0a0a1a,
        emissiveIntensity: 0.2
    });
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.receiveShadow = true;
    roadGroup.add(roadMesh);
    
    // Neon grid lines on road
    for (let i = -100; i < 100; i += 2) {
        const lineGeometry = new THREE.PlaneGeometry(0.15, 1.5);
        const lineMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 1
        });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.rotation.x = -Math.PI / 2;
        line.position.set(0, 0.01, i);
        roadGroup.add(line);
    }
    
    // Neon road edges - glowing pink
    const edgeGeometry = new THREE.PlaneGeometry(0.3, 200);
    const edgeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff00ff,
        emissive: 0xff00ff,
        emissiveIntensity: 2
    });
    
    const leftEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    leftEdge.rotation.x = -Math.PI / 2;
    leftEdge.position.set(-4, 0.02, 0);
    roadGroup.add(leftEdge);
    
    const rightEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    rightEdge.rotation.x = -Math.PI / 2;
    rightEdge.position.set(4, 0.02, 0);
    roadGroup.add(rightEdge);
    
    road = roadGroup;
    scene.add(road);
}


function createCar(color = 0xff00ff) {
    const carGroup = new THREE.Group();
    
    // Futuristic car body - sleek and angular
    const bodyGeometry = new THREE.BoxGeometry(1.8, 0.5, 3.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    carGroup.add(body);
    
    // Futuristic car roof - low profile
    const roofGeometry = new THREE.BoxGeometry(1.4, 0.3, 1.8);
    const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: color * 0.7,
        emissive: color * 0.5,
        emissiveIntensity: 0.3,
        metalness: 0.9,
        roughness: 0.1
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 1, -0.4);
    roof.castShadow = true;
    carGroup.add(roof);
    
    // Neon windows - glowing cyan
    const windowGeometry = new THREE.PlaneGeometry(1.2, 0.9);
    const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.6
    });
    
    const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    frontWindow.position.set(0, 1, 0.3);
    frontWindow.rotation.x = Math.PI / 2;
    carGroup.add(frontWindow);
    
    const backWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    backWindow.position.set(0, 1, -0.9);
    backWindow.rotation.x = Math.PI / 2;
    carGroup.add(backWindow);
    
    // Neon accent strips
    const accentGeometry = new THREE.BoxGeometry(1.9, 0.05, 3.6);
    const accentMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 2
    });
    const accent = new THREE.Mesh(accentGeometry, accentMaterial);
    accent.position.set(0, 0.3, 0);
    carGroup.add(accent);
    
    // Futuristic wheels - glowing rims
    const wheelGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x222222,
        emissive: 0x444444,
        emissiveIntensity: 0.3
    });
    
    const rimGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.26, 16);
    const rimMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 1
    });
    
    const positions = [
        [-1, 0.3, 1.2], [1, 0.3, 1.2],
        [-1, 0.3, -1.2], [1, 0.3, -1.2]
    ];
    
    positions.forEach((pos, i) => {
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
    
    return carGroup;
}

function createEnvironment() {
    // Cyberpunk ground - dark with grid
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0a0a1a,
        emissive: 0x1a1a2e,
        emissiveIntensity: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Neon grid on ground
    for (let i = -50; i < 50; i += 5) {
        const gridLineX = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(i, 0.01, -50),
                new THREE.Vector3(i, 0.01, 50)
            ]),
            new THREE.LineBasicMaterial({ color: 0x00ffff, opacity: 0.2, transparent: true })
        );
        scene.add(gridLineX);
        
        const gridLineZ = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-50, 0.01, i),
                new THREE.Vector3(50, 0.01, i)
            ]),
            new THREE.LineBasicMaterial({ color: 0x00ffff, opacity: 0.2, transparent: true })
        );
        scene.add(gridLineZ);
    }
    
    // Neon buildings/signs along the road
    for (let i = -50; i < 50; i += 8) {
        if (Math.random() > 0.3) {
            const buildingGroup = new THREE.Group();
            
            // Building structure
            const buildingGeometry = new THREE.BoxGeometry(1, 3 + Math.random() * 2, 1);
            const buildingMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x1a1a2e,
                emissive: 0x2a2a3e,
                emissiveIntensity: 0.2
            });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            building.position.y = 1.5;
            building.castShadow = true;
            buildingGroup.add(building);
            
            // Neon sign on building
            const signGeometry = new THREE.PlaneGeometry(0.8, 0.4);
            const signMaterial = new THREE.MeshStandardMaterial({ 
                color: Math.random() > 0.5 ? 0xff00ff : 0x00ffff,
                emissive: Math.random() > 0.5 ? 0xff00ff : 0x00ffff,
                emissiveIntensity: 2
            });
            const sign = new THREE.Mesh(signGeometry, signMaterial);
            sign.position.set(0, 2, 0.51);
            buildingGroup.add(sign);
            
            buildingGroup.position.set(
                (Math.random() > 0.5 ? 1 : -1) * (6 + Math.random() * 2),
                0,
                i
            );
            scene.add(buildingGroup);
        }
    }
}

function updateCar() {
    if (gameState !== 'playing') return;
    
    // Handle acceleration
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        acceleration = 0.8;
    } else if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        acceleration = -0.5;
    } else {
        acceleration = -0.15; // Natural deceleration
    }
    
    // Update speed
    speed += acceleration;
    speed = Math.max(0, Math.min(maxSpeed, speed));
    
    // Handle steering - improved turning
    steering = 0;
    const turnSpeed = 0.03 * (speed / maxSpeed);
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        steering = -turnSpeed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        steering = turnSpeed;
    }
    
    // Apply steering to car rotation and lateral movement
    carRotation += steering;
    carRotation = Math.max(-0.4, Math.min(0.4, carRotation));
    car.rotation.y = carRotation;
    
    // Move car laterally based on rotation and speed
    if (speed > 0) {
        carX += Math.sin(carRotation) * speed * 0.01;
        carX = Math.max(-3.5, Math.min(3.5, carX)); // Keep on road
        car.position.x = carX;
    }
    
    // Move road backward (simulating forward movement)
    if (speed > 0) {
        roadOffset += speed * 0.01;
        road.position.z = roadOffset % 4;
    }
    
    // Update camera to follow car
    camera.position.x = car.position.x * 0.5;
    camera.position.z = car.position.z + 10;
    camera.lookAt(car.position.x, car.position.y + 1, car.position.z);
    
    // Update UI
    speedElement.textContent = Math.floor(speed);
}

function updateDistance() {
    if (gameState === 'playing' && speed > 0) {
        distance += speed * 0.01;
        lapElement.textContent = `Distance: ${Math.floor(distance)}m`;
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    if (gameState === 'playing') {
        updateCar();
        updateDistance();
        
        // Rotate player car wheels
        car.children.forEach((child) => {
            if (child.geometry && (child.geometry.type === 'CylinderGeometry')) {
                child.rotation.x += speed * 0.01;
            }
        });
    }
    
    renderer.render(scene, camera);
}

function startGame() {
    gameState = 'playing';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    // Reset game variables
    speed = 0;
    acceleration = 0;
    steering = 0;
    carRotation = 0;
    carX = 0;
    roadOffset = 0;
    distance = 0;
    startTime = Date.now();
    
    // Reset player car position
    car.position.set(0, 0.5, 0);
    car.rotation.y = 0;
    
    // Reset road position
    road.position.z = 0;
    
    lapElement.textContent = `Distance: 0m`;
}

function gameOver() {
    gameState = 'gameOver';
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    finalTimeElement.textContent = elapsedTime;
    finalPositionElement.textContent = Math.floor(distance);
    gameOverScreen.classList.remove('hidden');
}

// Initialize game
init();
animate();


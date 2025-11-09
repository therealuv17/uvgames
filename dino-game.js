// Game canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 400;

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let highScore = localStorage.getItem('dinoHighScore') || 0;

// Ground properties
const groundY = canvas.height - 50;
const groundHeight = 50;

// Dinosaur properties
const dino = {
    x: 100,
    y: groundY - 60,
    width: 50,
    height: 60,
    groundY: groundY - 60,
    velocityY: 0,
    jumpPower: -30,
    gravity: 0.8,
    isJumping: false,
    color: '#2ecc71' // Green dinosaur color
};

// Cactuses array
let cactuses = [];
let cactusSpawnRate = 0.005;
let gameSpeed = 3;

// Cloud array for background
let clouds = [];

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if ((e.key === ' ' || e.key === 'ArrowUp') && gameState === 'playing' && !dino.isJumping) {
        jump();
    }
    e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// UI elements
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Initialize clouds
function initClouds() {
    clouds = [];
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 150 + 20,
            width: 60 + Math.random() * 40,
            height: 30 + Math.random() * 20,
            speed: 0.5 + Math.random() * 0.5
        });
    }
}

function startGame() {
    gameState = 'playing';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    // Reset game variables
    score = 0;
    cactuses = [];
    gameSpeed = 3;
    cactusSpawnRate = 0.005;
    
    // Reset dinosaur position
    dino.y = dino.groundY;
    dino.velocityY = 0;
    dino.isJumping = false;
    
    // Initialize clouds
    initClouds();
    
    gameLoop();
}

function jump() {
    if (!dino.isJumping) {
        dino.velocityY = dino.jumpPower;
        dino.isJumping = true;
    }
}

function drawGround() {
    // Ground color
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(0, groundY, canvas.width, groundHeight);
    
    // Ground line
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();
    
    // Ground texture (small lines)
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, groundY);
        ctx.lineTo(i + 10, groundY + 5);
        ctx.stroke();
    }
}

function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let cloud of clouds) {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.width / 3, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 3, cloud.y, cloud.width / 2.5, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 1.5, cloud.y, cloud.width / 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function updateClouds() {
    for (let cloud of clouds) {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
            cloud.x = canvas.width + cloud.width;
            cloud.y = Math.random() * 150 + 20;
        }
    }
}

function drawDino() {
    // Walking animation timing
    const walkCycle = Date.now() / 80; // Controls walking speed
    const legPhase = Math.sin(walkCycle);
    const bodyBounce = Math.abs(Math.sin(walkCycle)) * 2; // Body bounces slightly
    
    // Dinosaur body (with slight bounce when running)
    ctx.fillStyle = dino.color;
    const bodyY = dino.y - (dino.isJumping ? 0 : bodyBounce);
    ctx.fillRect(dino.x, bodyY, dino.width, dino.height);
    
    // Dinosaur head
    ctx.fillRect(dino.x + 30, bodyY - 20, 20, 20);
    
    // Dinosaur eye
    ctx.fillStyle = '#fff';
    ctx.fillRect(dino.x + 35, bodyY - 15, 5, 5);
    ctx.fillStyle = '#000';
    ctx.fillRect(dino.x + 37, bodyY - 13, 3, 3);
    
    // Dinosaur hands/arms (animated when running)
    ctx.fillStyle = dino.color;
    const armSway = dino.isJumping ? 0 : Math.sin(walkCycle * 1.2) * 3;
    // Left arm
    ctx.fillRect(dino.x + 5, bodyY + 10, 8, 15);
    ctx.fillRect(dino.x + 3 + armSway, bodyY + 23, 6, 8);
    // Right arm
    ctx.fillRect(dino.x + dino.width - 13, bodyY + 10, 8, 15);
    ctx.fillRect(dino.x + dino.width - 9 - armSway, bodyY + 23, 6, 8);
    
    // Dinosaur legs with walking animation
    ctx.fillStyle = dino.color;
    if (!dino.isJumping) {
        // Animated walking legs
        const leftLegForward = legPhase > 0;
        const rightLegForward = legPhase < 0;
        
        // Left leg
        if (leftLegForward) {
            // Forward position
            ctx.fillRect(dino.x + 8, bodyY + dino.height, 10, 18);
            ctx.fillRect(dino.x + 6, bodyY + dino.height + 15, 6, 8);
        } else {
            // Back position
            ctx.fillRect(dino.x + 12, bodyY + dino.height, 10, 18);
            ctx.fillRect(dino.x + 16, bodyY + dino.height + 15, 6, 8);
        }
        
        // Right leg
        if (rightLegForward) {
            // Forward position
            ctx.fillRect(dino.x + 30, bodyY + dino.height, 10, 18);
            ctx.fillRect(dino.x + 28, bodyY + dino.height + 15, 6, 8);
        } else {
            // Back position
            ctx.fillRect(dino.x + 34, bodyY + dino.height, 10, 18);
            ctx.fillRect(dino.x + 38, bodyY + dino.height + 15, 6, 8);
        }
    } else {
        // Legs tucked when jumping
        ctx.fillRect(dino.x + 15, dino.y + dino.height - 5, 8, 10);
        ctx.fillRect(dino.x + 27, dino.y + dino.height - 5, 8, 10);
    }
    
    // Dinosaur tail (sways slightly when running)
    const tailOffset = dino.isJumping ? 0 : Math.sin(walkCycle * 0.7) * 3;
    ctx.fillRect(dino.x - 10 + tailOffset, bodyY + 20, 15, 8);
}

function createCactus() {
    const heights = [60, 80, 100, 120];
    const height = heights[Math.floor(Math.random() * heights.length)];
    
    cactuses.push({
        x: canvas.width,
        y: groundY - height,
        width: 30,
        height: height,
        color: '#27ae60'
    });
}

function drawCactus(cactus) {
    // Main cactus body
    ctx.fillStyle = cactus.color;
    ctx.fillRect(cactus.x, cactus.y, cactus.width, cactus.height);
    
    // Cactus arms/branches
    if (cactus.height > 80) {
        // Left arm
        ctx.fillRect(cactus.x - 15, cactus.y + 20, 15, 20);
        ctx.fillRect(cactus.x - 15, cactus.y + 20, 20, 15);
        
        // Right arm
        ctx.fillRect(cactus.x + cactus.width, cactus.y + 40, 15, 20);
        ctx.fillRect(cactus.x + cactus.width - 5, cactus.y + 40, 20, 15);
    }
    
    // Cactus details (spikes)
    ctx.strokeStyle = '#1e8449';
    ctx.lineWidth = 2;
    for (let i = 0; i < cactus.height; i += 15) {
        ctx.beginPath();
        ctx.moveTo(cactus.x - 3, cactus.y + i);
        ctx.lineTo(cactus.x + cactus.width + 3, cactus.y + i);
        ctx.stroke();
    }
}

function updateCactuses() {
    // Spawn new cactuses
    if (Math.random() < cactusSpawnRate) {
        createCactus();
    }
    
    // Update cactus positions
    for (let i = cactuses.length - 1; i >= 0; i--) {
        cactuses[i].x -= gameSpeed;
        
        // Remove cactuses that are off screen
        if (cactuses[i].x + cactuses[i].width < 0) {
            cactuses.splice(i, 1);
            score += 1;
        }
    }
}

function updateDino() {
    // Apply gravity
    if (dino.isJumping) {
        dino.velocityY += dino.gravity;
        dino.y += dino.velocityY;
        
        // Land on ground
        if (dino.y >= dino.groundY) {
            dino.y = dino.groundY;
            dino.velocityY = 0;
            dino.isJumping = false;
        }
    }
}

function checkCollisions() {
    for (let cactus of cactuses) {
        if (
            dino.x < cactus.x + cactus.width &&
            dino.x + dino.width > cactus.x &&
            dino.y < cactus.y + cactus.height &&
            dino.y + dino.height > cactus.y
        ) {
            return true;
        }
    }
    return false;
}

function updateGame() {
    if (gameState !== 'playing') return;
    
    // Update dinosaur
    updateDino();
    
    // Update cactuses
    updateCactuses();
    
    // Update clouds
    updateClouds();
    
    // Increase difficulty
    gameSpeed += 0.001;
    cactusSpawnRate = Math.min(0.005 + score / 5000, 0.02);
    
    // Update UI
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
    
    // Check collisions
    if (checkCollisions()) {
        gameOver();
    }
}

function drawGame() {
    // Clear canvas with sky color
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw clouds
    drawClouds();
    
    // Draw ground
    drawGround();
    
    // Draw cactuses
    for (let cactus of cactuses) {
        drawCactus(cactus);
    }
    
    // Draw dinosaur
    drawDino();
}

function gameOver() {
    gameState = 'gameOver';
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('dinoHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
    
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function gameLoop() {
    if (gameState === 'playing') {
        updateGame();
        drawGame();
        requestAnimationFrame(gameLoop);
    }
}

// Initialize
highScoreElement.textContent = highScore;
initClouds();
drawGame();


// Game canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let speed = 0;
let roadOffset = 0;

// Player car
const playerCar = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 120,
    width: 50,
    height: 100,
    speed: 5,
    color: '#e74c3c'
};

// Obstacles array
let obstacles = [];
let obstacleSpeed = 3;
let obstacleSpawnRate = 0.02;

// Road properties
const roadWidth = 400;
const laneWidth = roadWidth / 3;
const roadX = (canvas.width - roadWidth) / 2;

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
const scoreElement = document.getElementById('score');
const speedElement = document.getElementById('speed');
const finalScoreElement = document.getElementById('finalScore');

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

function startGame() {
    gameState = 'playing';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    // Reset game variables
    score = 0;
    speed = 0;
    roadOffset = 0;
    obstacles = [];
    obstacleSpeed = 3;
    
    // Reset player position
    playerCar.x = canvas.width / 2 - 25;
    playerCar.y = canvas.height - 120;
    
    gameLoop();
}

function drawRoad() {
    // Road background
    ctx.fillStyle = '#34495e';
    ctx.fillRect(roadX, 0, roadWidth, canvas.height);
    
    // Road markings
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    
    // Center line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, roadOffset % 40);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    // Side lines
    ctx.beginPath();
    ctx.moveTo(roadX, roadOffset % 40);
    ctx.lineTo(roadX, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(roadX + roadWidth, roadOffset % 40);
    ctx.lineTo(roadX + roadWidth, canvas.height);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Road edges
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(roadX, 0);
    ctx.lineTo(roadX, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(roadX + roadWidth, 0);
    ctx.lineTo(roadX + roadWidth, canvas.height);
    ctx.stroke();
}

function drawCar(car) {
    // Car body
    ctx.fillStyle = car.color;
    ctx.fillRect(car.x, car.y, car.width, car.height);
    
    // Car windows
    ctx.fillStyle = '#3498db';
    ctx.fillRect(car.x + 10, car.y + 15, 30, 25);
    ctx.fillRect(car.x + 10, car.y + 50, 30, 25);
    
    // Car wheels
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(car.x - 5, car.y + 20, 10, 20);
    ctx.fillRect(car.x + car.width - 5, car.y + 20, 10, 20);
    ctx.fillRect(car.x - 5, car.y + 60, 10, 20);
    ctx.fillRect(car.x + car.width - 5, car.y + 60, 10, 20);
    
    // Car details
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.strokeRect(car.x, car.y, car.width, car.height);
}

function createObstacle() {
    const lanes = [roadX + laneWidth / 2 - 25, roadX + laneWidth + laneWidth / 2 - 25, roadX + 2 * laneWidth + laneWidth / 2 - 25];
    const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
    
    obstacles.push({
        x: randomLane,
        y: -100,
        width: 50,
        height: 100,
        color: '#9b59b6'
    });
}

function updateObstacles() {
    // Spawn new obstacles
    if (Math.random() < obstacleSpawnRate) {
        createObstacle();
    }
    
    // Update obstacle positions
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += obstacleSpeed;
        
        // Remove obstacles that are off screen
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            score += 10;
        }
    }
}

function checkCollisions() {
    for (let obstacle of obstacles) {
        if (
            playerCar.x < obstacle.x + obstacle.width &&
            playerCar.x + playerCar.width > obstacle.x &&
            playerCar.y < obstacle.y + obstacle.height &&
            playerCar.y + playerCar.height > obstacle.y
        ) {
            return true;
        }
    }
    return false;
}

function updatePlayer() {
    // Handle input
    if ((keys['ArrowLeft'] || keys['a'] || keys['A']) && playerCar.x > roadX) {
        playerCar.x -= playerCar.speed;
    }
    if ((keys['ArrowRight'] || keys['d'] || keys['D']) && playerCar.x + playerCar.width < roadX + roadWidth) {
        playerCar.x += playerCar.speed;
    }
    if ((keys['ArrowUp'] || keys['w'] || keys['W']) && playerCar.y > 0) {
        playerCar.y -= playerCar.speed;
    }
    if ((keys['ArrowDown'] || keys['s'] || keys['S']) && playerCar.y + playerCar.height < canvas.height) {
        playerCar.y += playerCar.speed;
    }
    
    // Keep player on road
    if (playerCar.x < roadX) {
        playerCar.x = roadX;
    }
    if (playerCar.x + playerCar.width > roadX + roadWidth) {
        playerCar.x = roadX + roadWidth - playerCar.width;
    }
}

function updateGame() {
    if (gameState !== 'playing') return;
    
    // Update road animation
    roadOffset += obstacleSpeed * 2;
    
    // Update player
    updatePlayer();
    
    // Update obstacles
    updateObstacles();
    
    // Update speed and difficulty
    speed = Math.floor(obstacleSpeed * 20);
    obstacleSpeed += 0.001;
    obstacleSpawnRate = Math.min(0.02 + score / 10000, 0.05);
    
    // Update UI
    scoreElement.textContent = score;
    speedElement.textContent = speed;
    
    // Check collisions
    if (checkCollisions()) {
        gameOver();
    }
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw road
    drawRoad();
    
    // Draw obstacles
    for (let obstacle of obstacles) {
        drawCar(obstacle);
    }
    
    // Draw player car
    drawCar(playerCar);
}

function gameOver() {
    gameState = 'gameOver';
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

// Initial draw
drawGame();



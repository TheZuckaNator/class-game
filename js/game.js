// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
});// Game variables
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const selectionScreen = document.getElementById('selection-screen');
const jetpackOptions = document.getElementById('jetpack-options');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const highScoreText = document.getElementById('high-score-text');
const restartButton = document.getElementById('restart-button');
const scoreDisplay = document.getElementById('score-display');
const highScoreDisplay = document.getElementById('high-score-display');

// Sound elements
const jumpSound = document.getElementById('jump-sound');
const scoreSound = document.getElementById('score-sound');
const gameOverSound = document.getElementById('game-over-sound');

// Set canvas size to match container
canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;

// Game state
let gameActive = false;
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let selectedJetpack = '';
let playerImage = null;
let jetpackImage = null;
let gravity = 0.5;
let jumpForce = -10;

// Update high score display
highScoreDisplay.textContent = `High Score: ${highScore}`;
highScoreText.textContent = `High Score: ${highScore}`;

const player = {
    x: 100,
    y: canvas.height / 2,
    width: 50,
    height: 50,
    velocity: 0
};

let pipes = [];
const pipeWidth = 80;
const pipeGap = 200;
const pipeSpawnRate = 90; // Frames between pipe spawns
let frameCount = 0;

// Load assets
const backgroundImage = new Image();
backgroundImage.src = './assets/bg-fun.png';

const pipeTopImage = new Image();
pipeTopImage.src = './assets/Pipe-Top.png';

const pipeBottomImage = new Image();
pipeBottomImage.src = './assets/Pipe-bottom.png';

const basePlayerImage = new Image();
basePlayerImage.src = './assets/Mike-Base.png';

// Create jetpack selection options
for (let i = 1; i <= 6; i++) {
    const jetpackOption = document.createElement('div');
    jetpackOption.className = 'jetpack-option';
    
    const jetpackImg = document.createElement('img');
    jetpackImg.src = `./assets/Jetpack-${i}.png`;
    jetpackImg.alt = `Jetpack ${i}`;
    
    jetpackOption.appendChild(jetpackImg);
    jetpackOption.addEventListener('click', () => selectJetpack(i));
    
    jetpackOptions.appendChild(jetpackOption);
}

// Handle jetpack selection
function selectJetpack(number) {
    selectedJetpack = `./assets/Jetpack-${number}.png`;
    
    // Load player image with selected jetpack
    playerImage = basePlayerImage;
    
    // Load jetpack image
    jetpackImage = new Image();
    jetpackImage.src = selectedJetpack;
    
    // Hide selection screen and start game
    selectionScreen.style.display = 'none';
    startGame();
}

// Start the game
function startGame() {
    gameActive = true;
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    highScoreDisplay.textContent = `High Score: ${highScore}`;
    player.y = canvas.height / 2;
    player.velocity = 0;
    pipes = [];
    frameCount = 0;
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop() {
    if (!gameActive) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    
    // Update player
    player.velocity += gravity;
    player.y += player.velocity;
    
    // Draw player first
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    
    // Draw jetpack with perfect positioning
    if (jetpackImage) {
        // Position jetpack precisely in the center of the player
        const jetpackX = player.x + (player.width / 2) - 30; // Center horizontally with offset
        const jetpackY = player.y + (player.height / 2) - 30; // Center vertically with offset
        ctx.drawImage(jetpackImage, jetpackX, jetpackY, 60, 60);
    }
    
    // Check for player hitting the ground or ceiling
    if (player.y + player.height > canvas.height || player.y < 0) {
        gameOver();
        return;
    }
    
    // Spawn new pipes
    if (frameCount % pipeSpawnRate === 0) {
        const pipeY = Math.floor(Math.random() * (canvas.height - pipeGap - 200)) + 100;
        
        pipes.push({
            x: canvas.width,
            topY: pipeY - 320, // Top pipe position (adjusted based on image height)
            bottomY: pipeY + pipeGap,
            scored: false
        });
    }
    
    // Update and draw pipes
    for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        pipe.x -= 3; // Pipe movement speed
        
        // Draw top pipe
        ctx.drawImage(pipeTopImage, pipe.x, pipe.topY, pipeWidth, 320);
        
        // Draw bottom pipe
        ctx.drawImage(pipeBottomImage, pipe.x, pipe.bottomY, pipeWidth, 320);
        
        // Check for collision
        if (
            player.x + player.width > pipe.x &&
            player.x < pipe.x + pipeWidth &&
            (player.y < pipe.topY + 320 || player.y + player.height > pipe.bottomY)
        ) {
            gameOver();
            return;
        }
        
        // Check for score
        if (!pipe.scored && player.x > pipe.x + pipeWidth) {
            pipe.scored = true;
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
        }
        
        // Remove pipes that have moved off screen
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(i, 1);
            i--;
        }
    }
    
    frameCount++;
    requestAnimationFrame(gameLoop);
}

// Handle game over
function gameOver() {
    gameActive = false;
    finalScoreDisplay.textContent = `Score: ${score}`;
    
    // Play game over sound
    playSound(gameOverSound);
    
    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
        highScoreText.textContent = `New High Score: ${highScore}!`;
        highScoreDisplay.textContent = `High Score: ${highScore}`;
    } else {
        highScoreText.textContent = `High Score: ${highScore}`;
    }
    
    gameOverScreen.style.display = 'flex';
}

// Handle jump on click or tap
canvas.addEventListener('click', () => {
    if (gameActive) {
        player.velocity = jumpForce;
        // Play jump sound
        playSound(jumpSound);
    }
});

// Handle jump on spacebar
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && gameActive) {
        player.velocity = jumpForce;
        // Play jump sound
        playSound(jumpSound);
    }
});

// Handle restart button
restartButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    startGame();
});

// Play sound function with error handling
function playSound(sound) {
    try {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Error playing sound:", e));
    } catch (e) {
        console.log("Error playing sound:", e);
    }
}

// Set up sounds with button activation
const enableAudioButton = document.getElementById('enable-audio');
enableAudioButton.addEventListener('click', () => {
    // Play and immediately pause all sounds to unlock audio
    jumpSound.play().then(() => jumpSound.pause()).catch(e => console.log("Error:", e));
    scoreSound.play().then(() => scoreSound.pause()).catch(e => console.log("Error:", e));
    gameOverSound.play().then(() => gameOverSound.pause()).catch(e => console.log("Error:", e));
    
    // Hide the button after enabling audio
    enableAudioButton.style.display = 'none';
    
    alert("Sounds enabled! You should now hear game sounds.");
});
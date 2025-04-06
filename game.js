const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const levelElement = document.getElementById('level');
const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let direction = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let level = 1;
let gameLoop = null;
let gameSpeed = 100;
let isPaused = false;

// Tambahkan variabel untuk animasi
let foodPulseSize = 0;
let snakeGlowIntensity = 0;
let snakeGlowIncreasing = true;
let gameOverAnimation = false;

// Tambahkan variabel untuk daftar pemain
let players = JSON.parse(localStorage.getItem('snakePlayers')) || [];
let currentPlayer = null;

// Tambahkan elemen DOM baru
const playerList = document.getElementById('playerList');
const gameArea = document.getElementById('gameArea');
const playerNameInput = document.getElementById('playerNameInput');
const addPlayerButton = document.getElementById('addPlayer');
const playersList = document.getElementById('playersList');
const startGameButton = document.getElementById('startGameButton');

// Tampilkan high score saat memulai
highScoreElement.textContent = highScore;

function initGame() {
    snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];
    direction = 'right';
    score = 0;
    level = 1;
    gameSpeed = 100;
    isPaused = false;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    generateFood();
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Pastikan makanan tidak muncul di tubuh ular
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            break;
        }
    }
}

function drawGame() {
    // Bersihkan canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gambar grid dengan efek fade
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Update animasi
    if (!isPaused) {
        // Animasi pulse untuk makanan
        foodPulseSize = Math.sin(Date.now() / 200) * 2;
        
        // Animasi glow untuk ular
        if (snakeGlowIncreasing) {
            snakeGlowIntensity += 0.02;
            if (snakeGlowIntensity >= 0.5) snakeGlowIncreasing = false;
        } else {
            snakeGlowIntensity -= 0.02;
            if (snakeGlowIntensity <= 0) snakeGlowIncreasing = true;
        }
    }

    // Gambar ular dengan efek glow
    snake.forEach((segment, index) => {
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        const size = gridSize - 2;

        if (index === 0) {
            // Kepala ular dengan efek glow
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 15 + snakeGlowIntensity * 10;
            
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(x + gridSize/2, y + gridSize/2, size/2, 0, Math.PI * 2);
            ctx.fill();

            // Mata ular dengan efek glow
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'black';
            const eyeSize = size/6;
            const eyeOffset = size/4;
            
            // Posisi mata berdasarkan arah
            let eyeX1, eyeX2, eyeY1, eyeY2;
            switch(direction) {
                case 'right':
                    eyeX1 = eyeX2 = x + gridSize - eyeOffset;
                    eyeY1 = y + eyeOffset;
                    eyeY2 = y + gridSize - eyeOffset;
                    break;
                case 'left':
                    eyeX1 = eyeX2 = x + eyeOffset;
                    eyeY1 = y + eyeOffset;
                    eyeY2 = y + gridSize - eyeOffset;
                    break;
                case 'up':
                    eyeX1 = x + eyeOffset;
                    eyeX2 = x + gridSize - eyeOffset;
                    eyeY1 = eyeY2 = y + eyeOffset;
                    break;
                case 'down':
                    eyeX1 = x + eyeOffset;
                    eyeX2 = x + gridSize - eyeOffset;
                    eyeY1 = eyeY2 = y + gridSize - eyeOffset;
                    break;
            }

            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
            ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Badan ular dengan efek glow dan gradien
            ctx.shadowColor = '#00cc00';
            ctx.shadowBlur = 10 + snakeGlowIntensity * 5;
            
            const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
            gradient.addColorStop(0, '#00cc00');
            gradient.addColorStop(1, '#009900');
            ctx.fillStyle = gradient;

            // Badan ular dengan efek bulat
            ctx.beginPath();
            ctx.roundRect(x, y, size, size, 5);
            ctx.fill();

            // Efek kilau pada badan ular
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.roundRect(x + 2, y + 2, size/3, size/3, 3);
            ctx.fill();
        }
    });

    // Reset shadow
    ctx.shadowBlur = 0;

    // Gambar makanan dengan efek pulse dan glow
    const foodX = food.x * gridSize;
    const foodY = food.y * gridSize;
    const foodSize = gridSize - 2 + foodPulseSize;

    // Efek glow pada makanan
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 15 + Math.abs(foodPulseSize) * 5;
    
    // Makanan dengan gradien dan efek pulse
    const foodGradient = ctx.createRadialGradient(
        foodX + gridSize/2, foodY + gridSize/2, 0,
        foodX + gridSize/2, foodY + gridSize/2, foodSize/2
    );
    foodGradient.addColorStop(0, '#ff6666');
    foodGradient.addColorStop(1, '#ff0000');
    ctx.fillStyle = foodGradient;
    
    ctx.beginPath();
    ctx.arc(
        foodX + gridSize/2,
        foodY + gridSize/2,
        foodSize/2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;
}

function moveSnake() {
    if (isPaused) return;

    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // Cek tabrakan dengan dinding
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Cek tabrakan dengan tubuh ular
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Cek apakah ular memakan makanan
    if (head.x === food.x && head.y === food.y) {
        eatSound.play();
        score += 10;
        scoreElement.textContent = score;
        
        // Update high score
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }

        // Level up setiap 50 poin
        if (score % 50 === 0) {
            level++;
            levelElement.textContent = level;
        }

        generateFood();
        // Tingkatkan kecepatan game
        if (gameSpeed > 50) {
            gameSpeed -= 2;
            clearInterval(gameLoop);
            gameLoop = setInterval(gameStep, gameSpeed);
        }
    } else {
        snake.pop();
    }
}

function gameStep() {
    moveSnake();
    drawGame();
}

function showGameOverScreen() {
    // Buat overlay untuk layar game over
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    // Buat container untuk konten game over
    const content = document.createElement('div');
    content.style.cssText = `
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        padding: 2rem;
        border-radius: 20px;
        text-align: center;
        color: white;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        animation: fadeIn 0.5s ease;
    `;

    // Tambahkan style untuk animasi
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce {
            0% { transform: scale(0.8); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);

    // Buat konten game over
    content.innerHTML = `
        <h2 style="font-size: 2rem; margin-bottom: 1.5rem; animation: bounce 0.5s ease;">Game Over!</h2>
        <div style="margin-bottom: 1.5rem;">
            <p style="font-size: 1.2rem; margin: 0.5rem 0; animation: slideIn 0.5s ease 0.2s both;">Pemain: <span style="color: #4CAF50; font-weight: bold;">${currentPlayer.name}</span></p>
            <p style="font-size: 1.2rem; margin: 0.5rem 0; animation: slideIn 0.5s ease 0.4s both;">Skor Anda: <span style="color: #4CAF50; font-weight: bold;">${score}</span></p>
            <p style="font-size: 1.2rem; margin: 0.5rem 0; animation: slideIn 0.5s ease 0.6s both;">Skor Tertinggi: <span style="color: #FFD700; font-weight: bold;">${currentPlayer.highScore}</span></p>
            <p style="font-size: 1.2rem; margin: 0.5rem 0; animation: slideIn 0.5s ease 0.8s both;">Level: <span style="color: #00ff00; font-weight: bold;">${level}</span></p>
        </div>
        <button id="restartButton" style="
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 25px;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 1rem;
            transition: all 0.3s ease;
            animation: fadeIn 0.5s ease 1s both;
        ">Mainkan Lagi</button>
    `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Tambahkan event listener untuk tombol restart
    const restartButton = document.getElementById('restartButton');
    restartButton.addEventListener('click', () => {
        overlay.remove();
        startGame();
    });

    // Tambahkan event listener untuk menutup overlay dengan klik di luar
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

function gameOver() {
    gameOverSound.play();
    clearInterval(gameLoop);
    
    // Update skor pemain jika lebih tinggi
    if (currentPlayer && score > currentPlayer.highScore) {
        currentPlayer.highScore = score;
        localStorage.setItem('snakePlayers', JSON.stringify(players));
    }
    
    showGameOverScreen();
    startButton.disabled = false;
    pauseButton.disabled = true;
}

function startGame() {
    if (players.length > 0) {
        currentPlayer = players[0]; // Gunakan pemain pertama
        initGame();
        startButton.disabled = true;
        pauseButton.disabled = false;
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(gameStep, gameSpeed);
    }
}

function togglePause() {
    if (!startButton.disabled) return;
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
}

// Fungsi untuk menampilkan daftar pemain
function displayPlayers() {
    playersList.innerHTML = '';
    players.forEach((player, index) => {
        const playerElement = document.createElement('div');
        playerElement.className = 'player-item';
        playerElement.innerHTML = `
            <span>${player.name}</span>
            <div>
                <span style="margin-right: 1rem; color: #FFD700;">Skor: ${player.highScore}</span>
                <button onclick="removePlayer(${index})">×</button>
            </div>
        `;
        playersList.appendChild(playerElement);
    });
    updateStartButton();
}

// Fungsi untuk menambah pemain
function addPlayer() {
    const nameInput = document.getElementById('playerNameInput');
    const name = nameInput.value.trim();
    
    if (name && name.length > 0) {
        // Cek apakah nama sudah ada
        if (players.some(player => player.name.toLowerCase() === name.toLowerCase())) {
            alert('Nama pemain sudah ada!');
            return;
        }

        // Tambahkan pemain baru
        players.push({
            name: name,
            highScore: 0
        });

        // Simpan ke localStorage
        localStorage.setItem('snakePlayers', JSON.stringify(players));
        
        // Reset input dan update tampilan
        nameInput.value = '';
        displayPlayers();
        updateStartButton();
        
        // Fokus kembali ke input
        nameInput.focus();
    } else {
        alert('Silakan masukkan nama pemain!');
    }
}

// Fungsi untuk menghapus pemain
function removePlayer(index) {
    players.splice(index, 1);
    localStorage.setItem('snakePlayers', JSON.stringify(players));
    displayPlayers();
}

// Fungsi untuk mengupdate tombol mulai game
function updateStartButton() {
    startGameButton.disabled = players.length === 0;
    startGameButton.textContent = players.length === 0 ? 'Tambahkan Pemain' : 'Mulai Game';
}

// Event listeners
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') direction = 'right';
            break;
        case ' ':
            togglePause();
            break;
    }
});

// Tampilkan daftar pemain saat memulai
displayPlayers(); 
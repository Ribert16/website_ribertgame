// Fungsi untuk menambah pemain dan mulai game
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
    } else {
        alert('Silakan masukkan nama pemain!');
    }
}

// Fungsi untuk memulai game
function startGameWithPlayers() {
    if (players.length === 0) {
        alert('Silakan tambahkan pemain terlebih dahulu!');
        return;
    }

    // Sembunyikan daftar pemain dan tampilkan area game
    document.getElementById('playerList').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
    
    // Set pemain aktif
    currentPlayer = players[0];
    
    // Reset dan mulai game
    initGame();
    document.getElementById('startButton').disabled = true;
    document.getElementById('pauseButton').disabled = false;
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, gameSpeed);
}

// Fungsi untuk menampilkan daftar pemain
function displayPlayers() {
    const playersList = document.getElementById('playersList');
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

// Fungsi untuk menghapus pemain
function removePlayer(index) {
    players.splice(index, 1);
    localStorage.setItem('snakePlayers', JSON.stringify(players));
    displayPlayers();
}

// Fungsi untuk mengupdate tombol mulai game
function updateStartButton() {
    const startGameButton = document.getElementById('startGameButton');
    startGameButton.disabled = players.length === 0;
    startGameButton.textContent = players.length === 0 ? 'Tambahkan Pemain' : 'Mulai Game';
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Ambil data pemain dari localStorage
    players = JSON.parse(localStorage.getItem('snakePlayers')) || [];
    
    // Tambahkan event listener untuk input nama dan tombol
    const playerNameInput = document.getElementById('playerNameInput');
    const addPlayerButton = document.getElementById('addPlayer');
    const startGameButton = document.getElementById('startGameButton');
    
    if (playerNameInput && addPlayerButton && startGameButton) {
        // Event listener untuk tombol tambah pemain
        addPlayerButton.addEventListener('click', addPlayer);
        
        // Event listener untuk input nama (Enter key)
        playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addPlayer();
            }
        });
        
        // Event listener untuk tombol mulai game
        startGameButton.addEventListener('click', startGameWithPlayers);
        
        // Event listener untuk validasi input
        playerNameInput.addEventListener('input', (e) => {
            // Batasi panjang nama
            if (e.target.value.length > 20) {
                e.target.value = e.target.value.slice(0, 20);
            }
        });
    }
    
    // Tampilkan daftar pemain
    displayPlayers();
}); 
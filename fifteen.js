const puzzleBoard = document.getElementById("puzzle-board");
const shuffleBtn = document.getElementById("shuffle-btn");
const resetBtn = document.getElementById("reset-btn");
const gameStatus = document.getElementById("game-status");
const gameTimeDisplay = document.getElementById("game-time");
const moveCountDisplay = document.getElementById("move-count");
const backgroundSelector = document.getElementById("backgrounds");
const musicToggleBtn = document.getElementById("music-toggle-btn");
const backgroundMusic = document.getElementById("background-music");

let gridSize = 4; // Default grid size
let board = createBoard(gridSize); // Initialize board with default grid size
let backgroundImages = ["images/background1.png", "images/background2.png", "images/background3.png", "images/background4.png"];
let currentBackground = backgroundImages[0]; // Default background
let gameInterval; // Holds the interval for the timer
let elapsedTime = 0; // Tracks elapsed time in seconds
let moveCount = 0; // Tracks number of moves
let bestTime = localStorage.getItem("bestTime") || "N/A";
let bestMoves = localStorage.getItem("bestMoves") || "N/A";

// Function to create a new board based on grid size
function createBoard(size) {
    let board = [];
    let num = 1;
    for (let i = 0; i < size; i++) {
        board[i] = [];
        for (let j = 0; j < size; j++) {
            if (num === size * size) {
                board[i][j] = 0; // Empty space
            } else {
                board[i][j] = num;
            }
            num++;
        }
    }
    return board;
}

// Render board with pieces based on grid size
function renderBoard() {
    puzzleBoard.innerHTML = '';
    puzzleBoard.style.gridTemplateColumns = `repeat(${gridSize}, 100px)`; // Adjust column size based on grid size
    puzzleBoard.style.width = `${gridSize * 100}px`; // Adjust width based on grid size
    puzzleBoard.style.height = `${gridSize * 100}px`; // Adjust height based on grid size

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const num = board[row][col];
            const piece = document.createElement("div");
            piece.classList.add("puzzle-piece");

            // Set the background image and position based on the current tile's position
            piece.style.backgroundImage = `url(${currentBackground})`;
            piece.style.backgroundPosition = `-${col * 100}px -${row * 100}px`; // Adjust for each tile

            if (num !== 0) {
                piece.textContent = num;
                piece.addEventListener("click", () => movePiece(row, col));
                piece.classList.add("movablepiece");
            } else {
                piece.classList.add("empty");
            }
            puzzleBoard.appendChild(piece);
        }
    }
}

// Find empty space
function findEmptySpace() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] === 0) {
                return [row, col];
            }
        }
    }
    return [-1, -1];
}

// Check if the puzzle is solved
function isSolved() {
    let correctOrder = 1;
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] !== correctOrder % (gridSize * gridSize)) {
                return false;
            }
            correctOrder++;
        }
    }
    return true;
}

// Move a tile
function movePiece(row, col) {
    const [emptyRow, emptyCol] = findEmptySpace();
    const validMoves = [
        [emptyRow - 1, emptyCol], // Up
        [emptyRow + 1, emptyCol], // Down
        [emptyRow, emptyCol - 1], // Left
        [emptyRow, emptyCol + 1], // Right
    ];

    for (const [r, c] of validMoves) {
        if (r === row && c === col) {
            board[emptyRow][emptyCol] = board[row][col];
            board[row][col] = 0;
            moveCount++;
            moveCountDisplay.textContent = moveCount;
            renderBoard();
            if (isSolved()) {
                clearInterval(gameInterval); // Stop the timer when puzzle is solved
                gameStatus.textContent = `You win! Puzzle solved in ${elapsedTime} seconds and ${moveCount} moves.`;
                updateBestTime();
            }
            return;
        }
    }
}

// Shuffle the board randomly but keep it solvable
function shuffleBoard() {
    for (let i = 0; i < 1000; i++) {
        const [emptyRow, emptyCol] = findEmptySpace();
        const validMoves = [
            [emptyRow - 1, emptyCol], // Up
            [emptyRow + 1, emptyCol], // Down
            [emptyRow, emptyCol - 1], // Left
            [emptyRow, emptyCol + 1], // Right
        ];

        const validMovesInBounds = validMoves.filter(
            ([r, c]) => r >= 0 && r < gridSize && c >= 0 && c < gridSize
        );

        const [row, col] = validMovesInBounds[Math.floor(Math.random() * validMovesInBounds.length)];
        board[emptyRow][emptyCol] = board[row][col];
        board[row][col] = 0;
    }
    renderBoard();
}

// Reset the board to solved state
function resetBoard() {
    clearInterval(gameInterval); // Stop the timer
    elapsedTime = 0;  // Reset time
    moveCount = 0;    // Reset moves
    gameTimeDisplay.textContent = elapsedTime; // Update the time display
    moveCountDisplay.textContent = moveCount; // Update the move display
    gameStatus.textContent = ""; // Clear the game status
    board = createBoard(gridSize); // Create a new solved board
    renderBoard(); // Render the board
    startTimer(); // Start the timer again after reset
}

// Start the game timer
function startTimer() {
    if (gameInterval) clearInterval(gameInterval); // Make sure no multiple intervals are running
    gameInterval = setInterval(() => {
        elapsedTime++;
        gameTimeDisplay.textContent = elapsedTime;
    }, 1000);
}

// Update best time and moves if needed
function updateBestTime() {
    if (bestTime === "N/A" || elapsedTime < bestTime) {
        bestTime = elapsedTime;
        bestMoves = moveCount;
        localStorage.setItem("bestTime", bestTime);
        localStorage.setItem("bestMoves", bestMoves);
        document.getElementById("best-time").textContent = bestTime;
        document.getElementById("best-moves").textContent = bestMoves;
    }
}

// Change background image
backgroundSelector.addEventListener("change", (e) => {
    currentBackground = e.target.value;
    renderBoard();
});

// Toggle background music
let isMusicPlaying = false;
musicToggleBtn.addEventListener("click", () => {
    if (isMusicPlaying) {
        backgroundMusic.pause();
        musicToggleBtn.textContent = "Play Music";
    } else {
        backgroundMusic.play();
        musicToggleBtn.textContent = "Pause Music";
    }
    isMusicPlaying = !isMusicPlaying;
});

// Event listeners for buttons
shuffleBtn.addEventListener("click", () => {
    shuffleBoard();
    startTimer(); // Start the timer after shuffle
});

resetBtn.addEventListener("click", resetBoard);

// Change grid size
document.getElementById("grid-size-selector").addEventListener("change", (e) => {
    gridSize = parseInt(e.target.value);
    board = createBoard(gridSize); // Create a new board with the selected grid size
    renderBoard();
});

// Initialize game
renderBoard();
document.getElementById("best-time").textContent = bestTime;
document.getElementById("best-moves").textContent = bestMoves;

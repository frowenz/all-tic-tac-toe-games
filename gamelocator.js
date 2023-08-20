const locateButton = document.getElementById('locate-button');

function updateLocateButton() {
    if (gameState.slice(-3)[0] === '9' || gameState.length == 9) { 
        locateButton.classList.remove('inactive');
    } else {
        locateButton.classList.add('inactive');
    }
}

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const undoButton = document.getElementById('undo-button');
const cellSize = 64;
let currentPlayer = 'X';
const board = Array(9).fill('');
let gameState = '';

canvas.addEventListener('click', handleCellClick);
undoButton.addEventListener('click', handleUndo);

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.beginPath();
    for (let i = 1; i < 3; i++) {
        const x = i * cellSize;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        const y = i * cellSize;
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Draw X or O based on the board state
    const font = '40px Arial';
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < board.length; i++) {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2 + 5;
        const cellContent = board[i];
        ctx.fillStyle = 'black';
        ctx.fillText(cellContent, x, y);
    }

    // Draw winning line if winningCells provided
    if (typeof winningCells !== 'undefined') {
        const x1 = winningCells[0] % 3 * cellSize + cellSize / 2;
        const y1 = Math.floor(winningCells[0] / 3) * cellSize + cellSize / 2;
        const x2 = winningCells[2] % 3 * cellSize + cellSize / 2;
        const y2 = Math.floor(winningCells[2] / 3) * cellSize + cellSize / 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.lineWidth = 1;
    }
}


function handleUndo() {
    if (gameState.length > 0) {
        if (gameState.slice(-3)[0] === '9') {
            gameState = gameState.slice(0, -3);
            winningCells = undefined; 
        }
        const lastMoveIndex = Number(gameState.slice(-1));
        gameState = gameState.slice(0, -1);
        board[lastMoveIndex] = '';

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

        updateLocateButton();
        drawBoard();
    }
}

function handleCellClick(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const clickedRow = Math.floor(mouseY / cellSize);
    const clickedCol = Math.floor(mouseX / cellSize);
    const clickedIndex = clickedRow * 3 + clickedCol;

    if (board[clickedIndex] === '' && gameState.slice(-3)[0] != '9') {
        gameState += clickedIndex.toString();
        board[clickedIndex] = currentPlayer;
        if (checkWin()) {
            gameState += '9' + winningCells[0] + winningCells[2];
        }
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        drawBoard();
    }
    updateLocateButton();
}

const findGameText = document.querySelector('.find-game-text');
findGameText.addEventListener('click', toggleGameLocatorWhenClosed);

drawBoard();

function checkWin() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            winningCells = pattern;
            return true;
        }
    }

    return false;
}

const gameLocator = document.querySelector('.game-locator');
const closeButton = document.getElementById('close-button');

closeButton.addEventListener('click', toggleGameLocator);
gameLocator.addEventListener('click', toggleGameLocatorWhenClosed);

function toggleGameLocator() {
    console.log("here2")
    if (gameLocator.classList.contains('opened-container')) {
        gameLocator.classList.remove('opened-container');
        gameLocator.classList.add('closed-container');
    } else {
        gameLocator.classList.remove('closed-container');
        gameLocator.classList.add('opened-container');
    }
}

function toggleGameLocatorWhenClosed(e) {
    if (e.target.classList.contains('find-game-text') && gameLocator.classList.contains('closed-container')) {
        toggleGameLocator();
    }
}

function locateGame() {
    if (!locateButton.classList.contains('inactive')) {
        const event = new CustomEvent('locate-game', { detail: gameState });
        document.dispatchEvent(event);
    }
}
locateButton.addEventListener('click', locateGame);
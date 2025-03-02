const WebSocket = require('ws');

// Use the port from environment variables or default to 8080
const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port });

// Store game state
let gameState = {
    board: Array(5).fill(null).map(() => Array(5).fill(null)),
    players: {},
    currentTurn: 'A', // Player A starts
    gameEnded: false
};

// Define character movement logic
const movements = {
    'P1': { F: [-1, 0], B: [1, 0] },
    'P2': { F: [-1, 0], B: [1, 0] },
    'P3': { F: [-1, 0], B: [1, 0] },
    'H1': { L: [0, -2], R: [0, 2], F: [-2, 0], B: [2, 0] },
    'H2': { FL: [-2, -2], FR: [-2, 2], BL: [2, -2], BR: [2, 2] },
};

// Initialize characters for each player
function initializeCharacters(player) {
    const row = player === 'A' ? 0 : 4; // Player A starts at row 0, Player B at row 4
    const pawns = ['P1', 'P2', 'P3'];
    const heroes = ['H1', 'H2'];

    // Place all pawns and heroes in a single row
    gameState.board[row] = [
        { player, charName: pawns[0] },
        { player, charName: pawns[1] },
        { player, charName: pawns[2] },
        { player, charName: heroes[0] },
        { player, charName: heroes[1] }
    ];
}

// Handle websocket connections
wss.on('connection', ws => {
    ws.on('message', message => {
        const data = JSON.parse(message);

        if (data.type === 'join') {
            handleJoin(ws, data.player);
        } else if (data.type === 'move') {
            handleMove(ws, data.player, data.move);
        } else if (data.type === 'rematch') {
            handleRematch();
        }
    });

    ws.send(JSON.stringify({ type: 'init', state: gameState }));
});

// Handle player joining
function handleJoin(ws, player) {
    if (!gameState.players[player]) {
        gameState.players[player] = ws;
        initializeCharacters(player); // Initialize characters when player joins
        ws.send(JSON.stringify({ type: 'message', message: `Player ${player} joined` }));
        broadcastGameState();
    }
}

// Handle player moves
function handleMove(ws, player, move) {
    console.log(`Player ${player} attempting to move ${move}`);

    if (gameState.gameEnded) {
        ws.send(JSON.stringify({ type: 'message', message: 'Game has ended. Please start a new game.' }));
        return;
    }

    if (gameState.currentTurn !== player) {
        ws.send(JSON.stringify({ type: 'invalid', message: 'Not your turn' }));
        return;
    }

    const [charName, direction] = move.split(':');
    const charPos = findCharacterPosition(player, charName);

    if (!charPos) {
        ws.send(JSON.stringify({ type: 'invalid', message: 'Invalid character' }));
        return;
    }

    // Check if the character and direction are valid
    const characterMovements = movements[charName];
    if (!characterMovements || !characterMovements[direction]) {
        ws.send(JSON.stringify({ type: 'invalid', message: 'Invalid move' }));
        return;
    }

    const [dx, dy] = characterMovements[direction];
    const [x, y] = charPos;
    const newX = x + dx;
    const newY = y + dy;

    if (newX < 0 || newX >= 5 || newY < 0 || newY >= 5 || gameState.board[newX][newY]?.player === player) {
        ws.send(JSON.stringify({ type: 'invalid', message: 'Invalid move' }));
        return;
    }

    // Handle movement
    const opponent = gameState.board[newX][newY];
    if (opponent && opponent.player !== player) {
        gameState.board[newX][newY] = null;
        console.log(`Player ${player} captured opponent's piece at position (${newX}, ${newY})`);
    }
    gameState.board[x][y] = null;
    gameState.board[newX][newY] = { player, charName };

    // Change turn
    gameState.currentTurn = gameState.currentTurn === 'A' ? 'B' : 'A';

    // Check for game over or draw
    const { gameEnded, winner } = checkGameOver();
    if (gameEnded) {
        gameState.gameEnded = true;
        if (winner === null) {
            broadcast({ type: 'game_over', winner: 'draw' });
        } else {
            broadcast({ type: 'game_over', winner });
        }
    } else {
        broadcastGameState();
    }
}

function findCharacterPosition(player, charName) {
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (gameState.board[i][j]?.player === player && gameState.board[i][j].charName === charName) {
                return [i, j];
            }
        }
    }
    return null;
}

function checkGameOver() {
    const remainingA = gameState.board.flat().filter(cell => cell?.player === 'A').length;
    const remainingB = gameState.board.flat().filter(cell => cell?.player === 'B').length;
    
    // Check for win condition
    if (remainingA === 0 || remainingB === 0) {
        return { gameEnded: true, winner: remainingA === 0 ? 'B' : 'A' };
    }

    // Check for draw condition
    const isBoardFull = gameState.board.flat().every(cell => cell !== null);
    if (isBoardFull) {
        return { gameEnded: true, winner: null };
    }

    return { gameEnded: false, winner: null };
}

function broadcastGameState() {
    broadcast({ type: 'update', state: gameState });
}

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

function handleRematch() {
    if (!gameState.gameEnded) return;

    // Reset game state
    gameState.board = Array(5).fill(null).map(() => Array(5).fill(null));
    gameState.currentTurn = 'A';
    gameState.gameEnded = false;

    // Reinitialize characters for both players
    initializeCharacters('A');
    initializeCharacters('B');

    broadcastGameState();
    console.log('Game reset for a rematch');
}

console.log(`Server started on port ${port}`);

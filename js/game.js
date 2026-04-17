let game, ai, selected = null, validMoves = [], player = 'w', character = '';

function selectCharacter(char) {
    character = char;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('difficulty-screen').classList.add('active');
    document.getElementById('diff-title').textContent = 'Contra ' + (char === 'agnes' ? 'Agnes' : 'Rick');
    
    const diffs = char === 'agnes' 
        ? [['easy','Fácil'], ['medium','Normal'], ['hard','Difícil'], ['extreme','Extremo'], ['mega','Mega']]
        : [['easy','Fácil'], ['medium','Normal'], ['hard','Difícil'], ['extreme','Extremo']];
    
    const container = document.getElementById('diff-buttons');
    container.innerHTML = '';
    diffs.forEach(([diff, name]) => {
        const btn = document.createElement('button');
        btn.textContent = name;
        btn.style.background = '#27ae60'; btn.style.color = 'white';
        btn.onclick = () => startGame(diff);
        container.appendChild(btn);
    });
}

function startGame(difficulty) {
    game = new ChessEngine(); // Asegúrate que el archivo se llame chess-engine.js
    ai = new ChessAI(difficulty, character);
    document.getElementById('difficulty-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    drawBoard();
}

function drawBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    for(let r=0; r<8; r++) {
        for(let c=0; c<8; c++) {
            const div = document.createElement('div');
            div.className = `square ${(r+c)%2===0 ? 'light' : 'dark'}`;
            const piece = game.getPiece(r, c);
            if(piece) {
                const syms = {w:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}};
                div.textContent = syms[piece.color][piece.type];
            }
            if(selected && selected.row===r && selected.col===c) div.classList.add('selected');
            if(validMoves.some(m => m.row===r && m.col===c)) div.classList.add('valid-move');
            div.onclick = () => clickSquare(r, c);
            board.appendChild(div);
        }
    }
}

function clickSquare(r, c) {
    if(game.turn !== player) return;
    const piece = game.getPiece(r, c);
    if(selected) {
        const move = validMoves.find(m => m.row===r && m.col===c);
        if(move) {
            // Promoción automática
            if (game.getPiece(selected.row, selected.col).type === 'p' && (r === 0 || r === 7)) {
                move.promotion = 'q';
            }
            executeMove(selected, move);
            return;
        }
    }
    if(piece && piece.color === player) {
        selected = {row: r, col: c};
        validMoves = game.getValidMoves(r, c);
        drawBoard();
    }
}

function executeMove(from, to) {
    game.makeMove({from, to});
    selected = null; validMoves = [];
    drawBoard();
    if(!checkEnd()) {
        document.getElementById('status').textContent = "Pensando...";
        setTimeout(() => {
            const aiMove = ai.makeMove(game);
            if(aiMove) game.makeMove(aiMove);
            drawBoard();
            document.getElementById('status').textContent = "Tu turno";
            checkEnd();
        }, 600);
    }
}

function checkEnd() {
    const state = game.getGameState();
    if(state.status !== 'ongoing') {
        alert(state.status === 'checkmate' ? "¡Jaque Mate!" : "Tablas");
        return true;
    }
    return false;
}

function resetGame() { location.reload(); }
function goBack() { location.reload(); }

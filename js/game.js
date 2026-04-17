let game, ai, selected = null, validMoves = [], player = 'w', character = '';

function selectCharacter(char) {
    character = char;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('difficulty-screen').classList.add('active');
    document.getElementById('diff-title').textContent = 'Jugar contra ' + (char === 'agnes' ? 'Agnes' : 'Rick');
    
    const diffs = char === 'agnes' 
        ? [['easy','Fácil'], ['medium','Normal'], ['hard','Difícil'], ['extreme','Extremo'], ['mega','Mega Extremo']]
        : [['easy','Fácil'], ['medium','Normal'], ['hard','Difícil'], ['extreme','Extremo']];
    
    const container = document.getElementById('diff-buttons');
    container.innerHTML = '';
    
    diffs.forEach(([diff, name]) => {
        const btn = document.createElement('button');
        btn.textContent = name;
        btn.style.cssText = 'padding:15px 25px; font-size:1.2rem; cursor:pointer; border-radius:10px; border:none; background:#27ae60; color:white;';
        btn.onclick = function() { startGame(diff); };
        container.appendChild(btn);
    });
}

function startGame(difficulty) {
    game = new ChessEngine();
    ai = new ChessAI(difficulty, character);
    player = 'w';
    
    document.getElementById('difficulty-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    drawBoard();
    updateStatus();
}

function drawBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    
    for(let row=0; row<8; row++) {
        for(let col=0; col<8; col++) {
            const div = document.createElement('div');
            div.className = 'square ' + ((row+col)%2===0 ? 'light' : 'dark');
            div.dataset.r = row;
            div.dataset.c = col;
            
            const piece = game.getPiece(row, col);
            if(piece) {
                const symbols = {w:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}};
                div.textContent = symbols[piece.color][piece.type];
            }
            
            if(selected && selected.row===row && selected.col===col) div.classList.add('selected');
            if(validMoves.some(m => m.row===row && m.col===col)) div.classList.add('valid-move');
            
            div.onclick = () => clickSquare(row, col);
            board.appendChild(div);
        }
    }
}

function clickSquare(row, col) {
    if(game.turn !== player) return;
    
    const piece = game.getPiece(row, col);
    
    if(selected) {
        const move = validMoves.find(m => m.row===row && m.col===col);
        if(move) {
            doMove(selected, move);
            return;
        }
    }
    
    if(piece && piece.color===player) {
        selected = {row, col};
        validMoves = game.getValidMoves(row, col);
        drawBoard();
    } else {
        selected = null;
        validMoves = [];
        drawBoard();
    }
}

function doMove(from, to) {
    game.makeMove({from, to});
    selected = null;
    validMoves = [];
    drawBoard();
    
    const state = game.getGameState();
    if(state.status !== 'ongoing') {
        setTimeout(() => alert(state.status === 'checkmate' ? (state.winner===player ? '¡Ganaste!' : 'Perdiste') : 'Tablas'), 100);
        return;
    }
    
    updateStatus();
    
    if(game.turn !== player) {
        setTimeout(aiMove, 500);
    }
}

function aiMove() {
    const move = ai.makeMove(game);
    if(move) {
        game.makeMove(move);
        drawBoard();
        updateStatus();
        const state = game.getGameState();
        if(state.status !== 'ongoing') {
            setTimeout(() => alert(state.status === 'checkmate' ? (state.winner===player ? '¡Ganaste!' : 'Perdiste') : 'Tablas'), 100);
        }
    }
}

function updateStatus() {
    document.getElementById('status').textContent = game.turn===player ? 'Tu turno' : (character==='agnes'?'Agnes piensa...':'Rick piensa...');
}

function resetGame() {
    if(confirm('¿Nueva partida?')) {
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('start-screen').classList.add('active');
    }
}

function goBack() {
    document.getElementById('difficulty-screen').classList.remove('active');
    document.getElementById('start-screen').classList.add('active');
}

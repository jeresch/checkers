import { constants } from "./constants";

const getCleanBoard = () => {
    let boardState = {};
    let i = 1;
    for (; i < 4 * 3 + 1; i++) {
        boardState[i] = {
            gameState: 'b',
            selectionState: false,
        };
    }
    for (; i < 4 * 3 + 4 * 2 + 1; i++) {
        boardState[i] = {
            gameState: ' ',
            selectionState: false,
        };
    }
    for (; i < 4 * 8 + 1; i++) {
        boardState[i] = {
            gameState: 'w',
            selectionState: false,
        };
    }
    return boardState;
};

const boardRowColToTileIdx = (boardRow, boardCol) => {
    const tileRow = boardRow;
    const evenRow = tileRow % 2 === 0;
    if ((evenRow && (boardCol % 2 !== 0)) || (!evenRow && (boardCol % 2 === 0))) {
        return undefined;
    }
    const tileCol = evenRow ? boardCol / 2 : (boardCol - 1) / 2;
    const stateIdx = 4 * tileRow + tileCol + 1;
    return stateIdx;
};

const drawBoard = (ctx, state) => {
    const tileWidth = constants.boardWidth / constants.boardDimension;
    const tileHeight = constants.boardHeight / constants.boardDimension;
    for (let row = 0; row < constants.boardDimension; row++) {
        for (let col = 0; col < constants.boardDimension; col++) {
            ctx.beginPath();
            ctx.lineWidth = 0;
            ctx.fillStyle = ((row + col) % 2 == 0) ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";
            ctx.fillRect(col * tileWidth, row * tileHeight, tileWidth, tileHeight);
            if ((row + col) % 2 === 0) {
                const stateIdx = boardRowColToTileIdx(row, col);
                const tileState = state[stateIdx].gameState;

                ctx.beginPath();
                if (state[stateIdx].selectionState === true) {
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 5;
                } else {
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 1
                }
                if (tileState === 'w' || tileState === 'wk') {
                    ctx.fillStyle = 'white';
                } else if (tileState === 'b' || tileState === 'bk') {
                    ctx.fillStyle = 'gray';
                }
                if (tileState === 'w' || tileState === 'wk' || tileState === 'b' || tileState ==='bk') {
                    const tileCenterX = col * tileWidth + tileWidth / 2;
                    const tileCenterY = row * tileHeight + tileHeight / 2;
                    const pieceRadiusX = tileWidth * 0.4;
                    const pieceRadiusY = tileHeight * 0.4;
                    ctx.ellipse(tileCenterX, tileCenterY, pieceRadiusX, pieceRadiusY, 0, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }
    }
};

const clearBoardSelections = (state) => {
    for (const idx in state) {
        state[idx].selectionState = false;
    }
}

const moveIsValid = (state, fromIdx, toIdx) => {
    const fromTile = state[fromIdx].gameState;
    const fromRowIdx = Math.floor((fromIdx - 1) / 4);
    const fromColIdx = (fromIdx - 1) % 4;
    const fromEdge = (fromRowIdx % 2 === 0) ? (fromColIdx === 3) : (fromColIdx === 0);
    let validTargetOffsets = [];
    if (fromTile === 'w' || fromTile === 'wk' || fromTile === 'bk') {
        const rowShift = (fromRowIdx % 2 === 0) ? -1 : 1;
        validTargetOffsets.push(-4);
        if (!fromEdge) {
            validTargetOffsets.push(-4 + rowShift);
        }
    }
    if (fromTile === 'b' || fromTile === 'bk' || fromTile === 'wk') {
        const rowShift = (fromRowIdx % 2 === 0) ? -1 : 1;
        validTargetOffsets.push(4);
        if (!fromEdge) {
            validTargetOffsets.push(4 + rowShift);
        }
    }

    // TODO jump moves
    console.log(validTargetOffsets, fromIdx, toIdx);

    return validTargetOffsets.map((offset) => offset + fromIdx).includes(toIdx);
};

const doMove = (state, fromIdx, toIdx) => {
    const stateType = state[fromIdx].gameState;
    state[fromIdx].gameState = ' ';
    state[fromIdx].selectionState = false;
    state[toIdx].gameState = stateType;
};

const makeOnBoardClick = (ctx, state) => {
    return (event) => {
        const tileWidth = constants.boardWidth / constants.boardDimension;
        const tileHeight = constants.boardHeight / constants.boardDimension;
        const boardX = event.offsetX;
        const boardY = event.offsetY;
        const tileCol = Math.floor(boardX / tileWidth);
        const tileRow = Math.floor(boardY / tileHeight);
        const stateIdx = boardRowColToTileIdx(tileRow, tileCol);

        let alreadySelectedIdxs = Object.keys(state)
            .filter((key) => { return state[key].selectionState === true; })
            .map(Number.parseInt);

        // Non-game tile
        if (!stateIdx) {
            clearBoardSelections(state);
        }
        // Error condition
        else if (alreadySelectedIdxs.length > 1) {
            alert('Somehow selecting more than one');
        } 
        // One existing selection
        else if (alreadySelectedIdxs.length === 1) {
            const alreadySelectedIdx = alreadySelectedIdxs[0];
            // If target has piece, clear selections and select target
            if (state[stateIdx].gameState !== ' ') {
                clearBoardSelections(state);
                state[stateIdx].selectionState = true;
            }
            // If valid move, do move
            else if (state[stateIdx].gameState === ' ' && moveIsValid(state, alreadySelectedIdx, stateIdx)) {
                clearBoardSelections(state);
                doMove(state, alreadySelectedIdx, stateIdx);
            }
            // If invalid move, clear selections
            else if (state[stateIdx].gameState === ' ' && !moveIsValid(state, alreadySelectedIdx, stateIdx)) {
                clearBoardSelections(state);
            }
        }
        // New selection
        else if (alreadySelectedIdxs.length === 0) {
            state[stateIdx].selectionState = true;
        }

        drawBoard(ctx, state);
    };
};

let canvas = document.getElementById("game-board");
canvas.setAttribute("width", `${constants.boardWidth}`);
canvas.setAttribute("height", `${constants.boardHeight}`);
let ctx = canvas.getContext("2d");
let boardState = getCleanBoard();
canvas.addEventListener('click', makeOnBoardClick(ctx, boardState));
drawBoard(ctx, boardState);

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
                ctx.lineWidth = 5;
                if (state[stateIdx].selectionState === true) {
                    ctx.strokeStyle = 'red';
                } else {
                    ctx.strokeStyle = 'green';
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

const makeOnBoardClick = (ctx, state) => {
    return (event) => {
        const tileWidth = constants.boardWidth / constants.boardDimension;
        const tileHeight = constants.boardHeight / constants.boardDimension;
        const boardX = event.offsetX;
        const boardY = event.offsetY;
        const tileCol = Math.floor(boardX / tileWidth);
        const tileRow = Math.floor(boardY / tileHeight);
        const stateIdx = boardRowColToTileIdx(tileRow, tileCol);
        console.log(stateIdx);

        let alreadySelectedIdxs = Object.keys(state)
            .filter((key) => { return state[key].selectionState === true; });

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
            // TODO if target has piece, clear all selections and replace selection with target
            // TODO if target empty and valid move, do move
            // TODO if target empty and invalid move, clear all selections
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

import constants from './constants';
import { GameControlServiceClient } from './generated/game_control_grpc_web_pb';
import { GameplayServiceClient } from './generated/game_grpc_web_pb';

function panic(message) {
  document.body.childNodes.forEach((c) => document.body.removeChild(c));
  document.body.innerText = `FATAL ERROR: ${message}`;
}

function getCleanBoard() {
  const boardState = {};
  let i = 1;
  for (; i < 4 * 3 + 1; i += 1) {
    boardState[i] = {
      tileGameState: 'b',
      selectionState: false,
    };
  }
  for (; i < 4 * 3 + 4 * 2 + 1; i += 1) {
    boardState[i] = {
      tileGameState: ' ',
      selectionState: false,
    };
  }
  for (; i < 4 * 8 + 1; i += 1) {
    boardState[i] = {
      tileGameState: 'w',
      selectionState: false,
    };
  }
  return boardState;
}

function boardRowColToTileIdx(boardRow, boardCol) {
  const tileRow = boardRow;
  const evenRow = tileRow % 2 === 0;
  if ((evenRow && (boardCol % 2 !== 0)) || (!evenRow && (boardCol % 2 === 0))) {
    return undefined;
  }
  const tileCol = evenRow ? boardCol / 2 : (boardCol - 1) / 2;
  const stateIdx = 4 * tileRow + tileCol + 1;
  return stateIdx;
}

function drawBoard(ctx, boardState) {
  const tileWidth = constants.boardWidth / constants.boardDimension;
  const tileHeight = constants.boardHeight / constants.boardDimension;
  for (let row = 0; row < constants.boardDimension; row += 1) {
    for (let col = 0; col < constants.boardDimension; col += 1) {
      ctx.beginPath();
      ctx.lineWidth = 0;
      ctx.fillStyle = ((row + col) % 2 === 0) ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
      ctx.fillRect(col * tileWidth, row * tileHeight, tileWidth, tileHeight);
      if ((row + col) % 2 === 0) {
        const stateIdx = boardRowColToTileIdx(row, col);
        const tileState = boardState[stateIdx].tileGameState;

        ctx.beginPath();
        if (boardState[stateIdx].selectionState === true) {
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 5;
        } else {
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 1;
        }
        if (tileState === 'w' || tileState === 'wk') {
          ctx.fillStyle = 'white';
        } else if (tileState === 'b' || tileState === 'bk') {
          ctx.fillStyle = 'gray';
        }
        if (tileState === 'w' || tileState === 'wk' || tileState === 'b' || tileState === 'bk') {
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
}

function clearBoardSelections(boardState) {
  const boardStateObj = boardState;
  Object.keys(boardState).forEach((idx) => {
    boardStateObj[idx].selectionState = false;
  });
}

function moveIsValid(boardState, fromIdx, toIdx) {
  const fromTile = boardState[fromIdx].tileGameState;
  const toTile = boardState[toIdx].tileGameState;
  if (toTile !== ' ') {
    return false;
  }
  const fromRowIdx = Math.floor((fromIdx - 1) / 4);
  const fromColIdx = (fromIdx - 1) % 4;
  const fromEdge = (fromRowIdx % 2 === 0) ? (fromColIdx === 3) : (fromColIdx === 0);
  const validTargetOffsets = [];
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

  return validTargetOffsets.map((offset) => offset + fromIdx).includes(toIdx);
}

const doMove = (gameState, fromIdx, toIdx) => {
  const { boardState } = gameState;
  const stateType = boardState[fromIdx].tileGameState;
  boardState[fromIdx].tileGameState = ' ';
  boardState[fromIdx].selectionState = false;
  boardState[toIdx].tileGameState = stateType;
};

const makeOnBoardClick = (ctx, gameState) => (event) => {
  if (!gameState.controlState.activeGame) {
    panic('Game not yet started');
    return;
  }
  const { boardState } = gameState;
  const tileWidth = constants.boardWidth / constants.boardDimension;
  const tileHeight = constants.boardHeight / constants.boardDimension;
  const boardX = event.offsetX;
  const boardY = event.offsetY;
  const tileCol = Math.floor(boardX / tileWidth);
  const tileRow = Math.floor(boardY / tileHeight);
  const stateIdx = boardRowColToTileIdx(tileRow, tileCol);

  const alreadySelectedIdxs = Object.keys(boardState)
    .filter((key) => boardState[key].selectionState === true)
    .map(Number.parseInt);

  if (!stateIdx) {
    clearBoardSelections(boardState);
  } else if (alreadySelectedIdxs.length > 1) {
    panic('Somehow selecting more than one');
  } else if (alreadySelectedIdxs.length === 1) {
    const alreadySelectedIdx = alreadySelectedIdxs[0];
    if (boardState[stateIdx].tileGameState !== ' ') {
      clearBoardSelections(boardState);
      boardState[stateIdx].selectionState = true;
    } else if (boardState[stateIdx].tileGameState === ' ' && moveIsValid(boardState, alreadySelectedIdx, stateIdx)) {
      clearBoardSelections(boardState);
      doMove(gameState, alreadySelectedIdx, stateIdx);
    } else if (boardState[stateIdx].tileGameState === ' ' && !moveIsValid(boardState, alreadySelectedIdx, stateIdx)) {
      clearBoardSelections(boardState);
    }
  } else if (alreadySelectedIdxs.length === 0) {
    boardState[stateIdx].selectionState = true;
  }

  drawBoard(ctx, boardState);
};

const makeOnCreateGameClick = (gameState) => () => {
  if (gameState.controlState.activeGame) {
    panic('game already in progress');
    return;
  }
  panic('TODO unimplemented');
};

const makeOnJoinGameClick = (gameState) => () => {
  if (gameState.controlState.activeGame) {
    panic('game already in progress');
    return;
  }
  panic('TODO unimplemented');
};

const canvas = document.getElementById('game-board');
canvas.setAttribute('width', `${constants.boardWidth}`);
canvas.setAttribute('height', `${constants.boardHeight}`);
const ctx = canvas.getContext('2d');
const gameState = {
  boardState: getCleanBoard(),
  controlState: {
    activeGame: false,
    playerRole: ' ',
  },
  controlClient: GameControlServiceClient('http://localhost:8080'),
  gameplayClient: GameplayServiceClient('http://localhost:8080'),
};
drawBoard(ctx, gameState.boardState);
canvas.addEventListener('click', makeOnBoardClick(ctx, gameState));
document.getElementById('create-game-button').addEventListener('click', makeOnCreateGameClick(gameState));
document.getElementById('join-game-button').addEventListener('click', makeOnJoinGameClick(gameState));

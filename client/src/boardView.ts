import constants from './constants';
import BoardModel, { TileStatus } from './boardModel';

function boardRowColToTileIdx(boardRow: number, boardCol: number): number {
  const tileRow = boardRow;
  const evenRow = tileRow % 2 === 0;
  if ((evenRow && (boardCol % 2 === 0)) || (!evenRow && (boardCol % 2 !== 0))) {
    return null;
  }
  const tileCol = evenRow ? (boardCol - 1) / 2 : boardCol / 2;
  const stateIdx = 4 * tileRow + tileCol + 1;
  return stateIdx;
}

export interface BoardViewEventListener {
  onSelectTile(tileIdx: number): void;
}

export default class BoardView {
  canvas: HTMLCanvasElement;

  ctx: CanvasRenderingContext2D;

  selections: Record<number, boolean> = {};

  eventListeners: Array<BoardViewEventListener> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.addEventListener('click', this.onClick);
    this.ctx = canvas.getContext('2d');
    for (let i = 1; i < 32 + 1; i += 1) {
      this.selections[i] = false;
    }
  }

  draw(boardModel: BoardModel) {
    const tileWidth = constants.boardWidth / constants.boardDimension;
    const tileHeight = constants.boardHeight / constants.boardDimension;
    for (let row = 0; row < constants.boardDimension; row += 1) {
      for (let col = 0; col < constants.boardDimension; col += 1) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 0;
        this.ctx.fillStyle = ((row + col) % 2 === 0) ? 'white' : 'black';
        this.ctx.fillRect(col * tileWidth, row * tileHeight, tileWidth, tileHeight);
        if ((row + col) % 2 === 1) {
          const stateIdx = boardRowColToTileIdx(row, col);
          const tileState = boardModel.getTile(stateIdx);

          this.ctx.beginPath();
          if (this.selections[stateIdx] === true) {
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = 5;
          } else {
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 1;
          }
          if (tileState === TileStatus.White || tileState === TileStatus.WhiteKing) {
            this.ctx.fillStyle = 'white';
          } else if (tileState === TileStatus.Black || tileState === TileStatus.BlackKing) {
            this.ctx.fillStyle = 'gray';
          }
          if (tileState !== TileStatus.Empty) {
            const tileCenterX = col * tileWidth + tileWidth / 2;
            const tileCenterY = row * tileHeight + tileHeight / 2;
            const pieceRadiusX = tileWidth * 0.4;
            const pieceRadiusY = tileHeight * 0.4;
            this.ctx.ellipse(
              tileCenterX, tileCenterY, pieceRadiusX, pieceRadiusY, 0, 0, 2 * Math.PI,
            );
            this.ctx.fill();
            this.ctx.stroke();
          }
        }
      }
    }
  }

  selectTile(tileIdx: number) {
    this.selections[tileIdx] = true;
  }

  currentlySelectedTiles(): Array<number> {
    return Object.keys(this.selections)
      .filter((key) => this.selections[key])
      .map(Number.parseInt);
  }

  clearBoardSelections() {
    Object.keys(this.selections).forEach((idx) => {
      this.selections[idx] = false;
    });
  }

  addListener(listener: BoardViewEventListener) {
    this.eventListeners.push(listener);
  }

  onClick = (event: MouseEvent) => {
    const tileWidth = constants.boardWidth / constants.boardDimension;
    const tileHeight = constants.boardHeight / constants.boardDimension;
    const boardX = event.offsetX;
    const boardY = event.offsetY;
    const tileCol = Math.floor(boardX / tileWidth);
    const tileRow = Math.floor(boardY / tileHeight);
    const tileIdx = boardRowColToTileIdx(tileRow, tileCol);
    this.eventListeners.forEach((l) => l.onSelectTile(tileIdx));
  };
}

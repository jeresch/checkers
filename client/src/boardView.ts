import constants from './constants';
import BoardModel, { TileStatus } from './boardModel';
import { BoardUpdate } from './gameService';

/**
 * Consumers of BoardView events must implement this interface and then
 * register themselves with `BoardView.addListener`
 */
export interface BoardViewEventCallbacks {
  onSelectTile?(tileIdx: number): void;
  onBoardUpdate?(boardUpdate: BoardUpdate): void;
}

/**
 * Corresponds 1-1 with an HTMLCanvasElement, responsible for drawing to it and for consuming and
 * re-raising its relevant events.
 */
export default class BoardView {
  private canvas: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D;

  private selections: Set<number> = new Set();

  private onSelectTileCallbacks: Array<Function> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.addEventListener('click', this.onClick);
    this.ctx = canvas.getContext('2d');
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
          const stateIdx = BoardView.boardRowColToTileIdx(row, col);
          const tileState = boardModel.getTile(stateIdx);

          this.ctx.beginPath();
          if (this.selections.has(stateIdx)) {
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
    this.selections.add(tileIdx);
  }

  currentlySelectedTiles(): Set<number> {
    return this.selections;
  }

  clearBoardSelections() {
    this.selections.clear();
  }

  registerCallbacks(callbacks: BoardViewEventCallbacks) {
    if (callbacks.onSelectTile) {
      this.onSelectTileCallbacks.push(callbacks.onSelectTile);
    }
  }

  private onClick = (event: MouseEvent) => {
    const tileWidth = constants.boardWidth / constants.boardDimension;
    const tileHeight = constants.boardHeight / constants.boardDimension;
    const boardX = event.offsetX;
    const boardY = event.offsetY;
    const tileCol = Math.floor(boardX / tileWidth);
    const tileRow = Math.floor(boardY / tileHeight);
    const tileIdx = BoardView.boardRowColToTileIdx(tileRow, tileCol);
    this.onSelectTileCallbacks.forEach((cb) => cb(tileIdx));
  };

  private static boardRowColToTileIdx(boardRow: number, boardCol: number): number {
    const tileRow = boardRow;
    const evenRow = tileRow % 2 === 0;
    if ((evenRow && (boardCol % 2 === 0)) || (!evenRow && (boardCol % 2 !== 0))) {
      return null;
    }
    const tileCol = evenRow ? (boardCol - 1) / 2 : boardCol / 2;
    const stateIdx = 4 * tileRow + tileCol + 1;
    return stateIdx;
  }
}

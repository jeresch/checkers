import panic from './util';
import BoardModel, { TileStatus } from './boardModel';
import BoardView, { BoardViewEventListener } from './boardView';
import GameControlModel from './gameControlModel';
import { BoardService, BoardUpdate } from './boardService';

export default class BoardController implements BoardViewEventListener {
  boardService: BoardService;

  boardModel: BoardModel;

  boardView: BoardView;

  gameControlModel: GameControlModel;

  constructor(
    boardService: BoardService,
    boardModel: BoardModel,
    boardView: BoardView,
    gameControlModel: GameControlModel,
  ) {
    this.boardService = boardService;
    this.boardModel = boardModel;
    this.boardView = boardView;
    this.gameControlModel = gameControlModel;

    this.boardView.addListener(this);
    this.boardView.draw(this.boardModel);
  }

  onSelectTile(selectedTileIdx: number) {
    if (!this.gameControlModel.gameActive) {
      panic('Game not yet started');
      return;
    }

    const currentSelections = this.boardView.currentlySelectedTiles();
    if (!selectedTileIdx) {
      this.boardView.clearBoardSelections();
    } else if (currentSelections.length > 1) {
      panic('Somehow selecting more than one');
    } else if (currentSelections.length === 1) {
      const alreadySelectedIdx = currentSelections[0];
      const tileEmpty = this.boardModel.getTile(selectedTileIdx) === TileStatus.Empty;
      if (!tileEmpty) {
        this.boardView.clearBoardSelections();
        this.boardView.selectTile(selectedTileIdx);
      } else if (tileEmpty && this.boardModel.moveIsValid(alreadySelectedIdx, selectedTileIdx)) {
        this.boardView.clearBoardSelections();
        this.boardModel.movePiece(alreadySelectedIdx, selectedTileIdx);
      } else if (tileEmpty && !this.boardModel.moveIsValid(alreadySelectedIdx, selectedTileIdx)) {
        this.boardView.clearBoardSelections();
      }
    } else if (currentSelections.length === 0) {
      this.boardView.selectTile(selectedTileIdx);
    }

    this.boardView.draw(this.boardModel);
  }

  onNewGame() {
    // TODO new board model
    panic('unimplementd');
    this.boardService.boardUpdateSubscription(
      { gameId: this.gameControlModel.gameId },
      (u) => this.onBoardUpdate(u),
    );
    this.boardView.draw(this.boardModel);
  }

  onBoardUpdate(boardUpdate: BoardUpdate) {
    // TODO
    panic(`${boardUpdate} ${this} unimplemented`);
  }
}

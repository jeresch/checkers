import panic from './util';

export default class BoardController {
  constructor(gameplayGrpcServiceClient, boardModel, boardView, gameControlModel) {
    this.gameplayGrpcServiceClient = gameplayGrpcServiceClient;
    this.boardModel = boardModel;
    this.boardView = boardView;
    this.gameControlModel = gameControlModel;

    this.boardView.addListener(this);
    this.boardView.draw(this.boardModel);
  }

  onSelectTile(selectedTileIdx) {
    if (!this.gameControlModel.gameActive) {
      panic('Game not yet started');
      return;
    }

    const currentSelections = this.boardView.currentSelections();
    if (!selectedTileIdx) {
      this.boardView.clearBoardSelections();
    } else if (currentSelections.length > 1) {
      panic('Somehow selecting more than one');
    } else if (currentSelections.length === 1) {
      const alreadySelectedIdx = currentSelections[0];
      if (this.boardModel.getTile(selectedTileIdx) !== ' ') {
        this.boardView.clearBoardSelections();
        this.boardView.select(selectedTileIdx);
      } else if (this.boardModel.getTile(selectedTileIdx) === ' ' && this.boardModel.moveIsValid(alreadySelectedIdx, selectedTileIdx)) {
        this.boardView.clearBoardSelections();
        this.boardModel.movePiece(alreadySelectedIdx, selectedTileIdx);
      } else if (this.boardModel.getTile(selectedTileIdx) === ' ' && !this.boardModel.moveIsValid(alreadySelectedIdx, selectedTileIdx)) {
        this.boardView.clearBoardSelections();
      }
    } else if (currentSelections.length === 0) {
      this.boardView.select(selectedTileIdx);
    }

    this.boardView.draw(this.boardModel);
  }
}

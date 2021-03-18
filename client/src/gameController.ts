import panic from './util';
import BoardModel, { TileStatus } from './boardModel';
import BoardView from './boardView';
import GameControlModel from './gameControlModel';
import {
  GameService,
  BoardUpdate,
  Move,
  MoveResponse,
} from './gameService';
import GameServiceGrpc from './gameServiceGrpc';
import { GameRole } from './gameControlService';

export default class GameController {
  private serverAddress: string;

  private gameService: GameService;

  private boardModel: BoardModel;

  private boardView: BoardView;

  private gameControlModel: GameControlModel;

  constructor(
    serverAddress: string,
    boardView: BoardView,
  ) {
    this.serverAddress = serverAddress;
    this.boardView = boardView;

    // Init bogus empty board
    const size = 32;
    const emptyTiles = [];
    for (let i = 0; i < size; i += 1) {
      emptyTiles[size] = TileStatus.Empty;
    }
    this.boardModel = new BoardModel(emptyTiles);

    this.boardView.registerCallbacks({
      onSelectTile: this.onSelectTile.bind(this),
    });
    this.boardView.draw(this.boardModel);
  }

  onNewGame(gameControlModel: GameControlModel, remoteGame: boolean) {
    this.gameControlModel = gameControlModel;
    this.boardModel = new BoardModel();

    if (remoteGame && !this.gameService) {
      this.gameService = new GameServiceGrpc(this.serverAddress);
    }
    if (this.gameService) {
      this.gameService.boardUpdateSubscription(
        { gameId: this.gameControlModel.gameId },
        (u) => this.onBoardUpdate(u),
      );
    }
    this.boardView.draw(this.boardModel);
  }

  private onSelectTile(selectedTileIdx: number) {
    const roleAllowedToSelect = GameController.tileToRole(this.boardModel.getTile(selectedTileIdx));
    if (
      roleAllowedToSelect !== null
      && !this.gameControlModel.awaitingLocalMoveForColor(roleAllowedToSelect)
    ) {
      return;
    }
    const currentSelections = this.boardView.currentlySelectedTiles();
    if (!selectedTileIdx) {
      this.boardView.clearBoardSelections();
    } else if (currentSelections.size > 1) {
      // TODO allow selecting more than one
      panic('Somehow selecting more than one');
    } else if (currentSelections.size === 1) {
      const alreadySelectedIdx = currentSelections.values().next().value;
      const tileEmpty = this.boardModel.getTile(selectedTileIdx) === TileStatus.Empty;
      if (!tileEmpty) {
        this.boardView.clearBoardSelections();
        this.boardView.selectTile(selectedTileIdx);
      } else if (tileEmpty && this.boardModel.moveIsValid(alreadySelectedIdx, selectedTileIdx)) {
        this.doMoveSequence([alreadySelectedIdx, selectedTileIdx]);
      } else if (tileEmpty && !this.boardModel.moveIsValid(alreadySelectedIdx, selectedTileIdx)) {
        this.boardView.clearBoardSelections();
      }
    } else if (currentSelections.size === 0) {
      this.boardView.selectTile(selectedTileIdx);
    }

    this.boardView.draw(this.boardModel);
  }

  private onBoardUpdate(boardUpdate: BoardUpdate) {
    const moveSequence = [boardUpdate.prevMoveSetList[0].indexFrom];
    boardUpdate.prevMoveSetList.forEach((move: Move) => moveSequence.push(move.indexTo));
    this.doMoveSequence(moveSequence);
    // TODO
    panic(`${boardUpdate} ${this} unimplemented`);
  }

  private static tileToRole(tile: TileStatus): GameRole {
    switch (tile) {
      case TileStatus.Black:
      case TileStatus.BlackKing:
        return GameRole.PLAYER_BLACK;
      case TileStatus.White:
      case TileStatus.WhiteKing:
        return GameRole.PLAYER_WHITE;
      case TileStatus.Empty:
      default:
        return null;
    }
  }

  private doMoveSequence(moveSequence: Array<number>) {
    const movedRole = GameController.tileToRole(this.boardModel.getTile(moveSequence[0]));
    if (this.gameService && this.gameControlModel.awaitingLocalMoveForColor(movedRole)) {
      const moveSetList: Array<Move> = [];
      for (let i = 0; i < moveSequence.length - 1; i += 1) {
        moveSetList.push({
          indexFrom: moveSequence[i],
          indexTo: moveSequence[i + 1],
        });
      }

      this.gameService.makeMoves({ moveSetList }).then((response: MoveResponse) => {
        if (!response.moveSuccess) {
          panic(`move request failed with error message: ${response.message}`);
        }
      });
    }
    this.boardModel.doMoveSequence(moveSequence);
    this.gameControlModel.handleSuccessfulMove(movedRole);
    this.boardView.clearBoardSelections();
    this.boardView.draw(this.boardModel);
  }
}

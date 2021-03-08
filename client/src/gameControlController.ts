import panic from './util';
import { GameControlService, GameStartRequest, GameStartResponse } from './gameControlService';
import GameControlModel from './gameControlModel';
import GameControlView from './gameControlView';
import BoardController from './boardController';

export default class GameControlController {
  gameControlServiceClient: GameControlService;

  gameControlModel: GameControlModel;

  gameControlView: GameControlView;

  boardController: BoardController;

  constructor(
    gameControlServiceClient: GameControlService,
    gameControlModel: GameControlModel,
    gameControlView: GameControlView,
    boardController: BoardController,
  ) {
    this.gameControlServiceClient = gameControlServiceClient;
    this.gameControlModel = gameControlModel;
    this.gameControlView = gameControlView;
    this.gameControlView.registerListener(this);
    this.boardController = boardController;
  }

  onCreateGameRequest() {
    if (this.gameControlModel.gameActive) {
      panic('game already in progress');
      return;
    }
    const gameStartRequest: GameStartRequest = {};
    this.gameControlServiceClient.startGame(gameStartRequest)
      .then((gameStartResponse: GameStartResponse) => {
        const gameId = gameStartResponse.gameData?.gameId;
        const gameRole = gameStartResponse.gameData?.playerRole;
        this.gameControlModel.newGame(gameId, gameRole);
        this.boardController.onNewGame();
      }, () => panic('request rejected'));
  }

  onJoinGameRequest() {
    if (this.gameControlModel.gameActive) {
      panic('game already in progress');
      return;
    }
    panic('TODO unimplemented');
  }
}

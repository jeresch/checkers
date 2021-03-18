import panic from './util';
import { GameControlService, GameStartRequest, GameStartResponse } from './gameControlService';
import GameControlModel from './gameControlModel';
import GameControlView from './gameControlView';
import GameControlModelLocal from './gameControlModelLocal';
import GameController from './gameController';
import GameControlModelRemote from './gameControlModelRemote';

export default class GameControlController {
  private gameControlServiceClient: GameControlService;

  private gameControlModel: GameControlModel;

  private gameControlView: GameControlView;

  private gameController: GameController;

  constructor(
    gameControlView: GameControlView,
    gameController: GameController,
  ) {
    this.gameControlView = gameControlView;
    this.gameControlView.registerCallbacks({
      onCreateRemoteGame: this.onCreateRemoteGameRequest.bind(this),
      onJoinRemoteGame: this.onJoinRemoteGameRequest.bind(this),
      onCreateLocalGame: this.onCreateLocalGameRequest.bind(this),
    });
    this.gameController = gameController;
  }

  private onCreateRemoteGameRequest() {
    const gameStartRequest: GameStartRequest = {};
    this.gameControlServiceClient.startGame(gameStartRequest)
      .then((gameStartResponse: GameStartResponse) => {
        const gameId = gameStartResponse.gameData?.gameId;
        const gameRole = gameStartResponse.gameData?.playerRole;
        this.gameControlModel = new GameControlModelRemote(gameId, gameRole);

        this.gameController.onNewGame(this.gameControlModel, true);
      }, () => panic('request rejected'));
  }

  private onJoinRemoteGameRequest(gameId: string) {
    const gameJoinRequest: GameStartRequest = { gameId };
    this.gameControlServiceClient.startGame(gameJoinRequest)
      .then((gameStartResponse: GameStartResponse) => {
        const responseGameId = gameStartResponse.gameData?.gameId;
        const gameRole = gameStartResponse.gameData?.playerRole;
        this.gameControlModel = new GameControlModelRemote(responseGameId, gameRole);

        this.gameController.onNewGame(this.gameControlModel, true);
      });
  }

  private onCreateLocalGameRequest() {
    this.gameControlView.hideInterface();
    this.gameControlModel = new GameControlModelLocal('LOCAL');
    this.gameController.onNewGame(this.gameControlModel, false);
  }
}

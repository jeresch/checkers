import panic from './util';
import { RemoteGameControlService, RemoteGameStartRequest, RemoteGameStartResponse } from './remoteGameControlService';
import GameControlModel from './gameControlModel';
import GameControlView from './gameControlView';
import GameControlModelLocal from './gameControlModelLocal';
import GameController from './gameController';
import GameControlModelRemote from './gameControlModelRemote';

export default class GameControlController {
  private gameControlServiceClient: RemoteGameControlService;

  private gameControlModel: GameControlModel;

  private gameControlView: GameControlView;

  private gameController: GameController;

  constructor(
    gameControlView: GameControlView,
    gameController: GameController,
  ) {
    this.gameControlView = gameControlView;
    this.gameControlView.registerCallbacks({
      onCreateRemoteGame: () => this.onCreateRemoteGameRequest(),
      onJoinRemoteGame: (gameId) => this.onJoinRemoteGameRequest(gameId),
      onCreateLocalGame: () => this.onCreateLocalGameRequest(),
    });
    this.gameController = gameController;
  }

  private onCreateRemoteGameRequest() {
    const gameStartRequest: RemoteGameStartRequest = {};
    this.gameControlServiceClient.startGame(gameStartRequest)
      .then((gameStartResponse: RemoteGameStartResponse) => {
        const gameId = gameStartResponse.gameData?.gameId;
        const gameRole = gameStartResponse.gameData?.playerRole;
        this.gameControlModel = new GameControlModelRemote(gameId, gameRole);

        this.gameController.onNewGame(this.gameControlModel, true);
      }, () => panic('request rejected'));
  }

  private onJoinRemoteGameRequest(gameId: string) {
    const gameJoinRequest: RemoteGameStartRequest = { gameId };
    this.gameControlServiceClient.startGame(gameJoinRequest)
      .then((gameStartResponse: RemoteGameStartResponse) => {
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

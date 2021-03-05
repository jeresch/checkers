import panic from './util';
import { GameControlServiceClient as GameControlGrpcServiceClient } from './generated/Game_controlServiceClientPb';
import GameControlModel from './gameControlModel';
import GameControlView from './gameControlView';

export default class GameControlController {
  gameControlGrpcServiceClient: GameControlGrpcServiceClient;

  gameControlModel: GameControlModel;

  gameControlView: GameControlView;

  constructor(
    gameControlGrpcServiceClient: GameControlGrpcServiceClient,
    gameControlModel: GameControlModel,
    gameControlView: GameControlView,
  ) {
    this.gameControlGrpcServiceClient = gameControlGrpcServiceClient;
    this.gameControlModel = gameControlModel;
    this.gameControlView = gameControlView;
    this.gameControlView.registerListener(this);
  }

  onCreateGameRequest() {
    if (this.gameControlModel.gameActive) {
      panic('game already in progress');
      return;
    }
    panic('TODO unimplemented');
  }

  onJoinGameRequest() {
    if (this.gameControlModel.gameActive) {
      panic('game already in progress');
      return;
    }
    panic('TODO unimplemented');
  }
}

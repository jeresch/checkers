import panic from './util';

export default class GameControlController {
  constructor(gameControlGrpcServiceClient, gameControlModel, gameControlView) {
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

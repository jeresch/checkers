import { GameControlService, GameStartRequest, GameStartResponse } from './gameControlService';
import { GameControlServiceClient as GrpcClient } from './generated/Game_controlServiceClientPb';
import { GameStartRequest as GrpcStartRequest, GameStartResponse as GrpcStartResponse } from './generated/game_control_pb';

export default class GameControlServiceGrpc implements GameControlService {
  grpcClient: GrpcClient;

  constructor(hostport: string) {
    this.grpcClient = new GrpcClient(hostport);
  }

  async startGame(request: GameStartRequest): Promise<GameStartResponse> {
    const grpcRequest = new GrpcStartRequest();
    grpcRequest.setGameId(request.gameId);
    const grpcResponse: GrpcStartResponse = await this.grpcClient.startGame(grpcRequest, null);
    return {
      gameData: {
        playerRole: grpcResponse.getGameData().getPlayerRole(),
        gameId: grpcResponse.getGameData().getGameId(),
      },
      message: grpcResponse.getMessage(),
    };
  }
}

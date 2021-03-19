import {
  GameService, RemoteMoveRequest, MoveResponse, BoardUpdate, BoardSubscriptionRequest,
} from './remoteGameService';
import { GameplayServiceClient as GrpcServiceClient } from './generated/GameServiceClientPb';
import {
  Move as GrpcMove,
  MoveRequest as GrpcMoveRequest,
  MoveResponse as GrpcMoveResponse,
  BoardSubscriptionRequest as GrpcBoardSubscriptionRequest,
  BoardUpdate as GrpcBoardUpdate,
} from './generated/game_pb';

export default class GameServiceGrpc implements GameService {
  grpcServiceClient: GrpcServiceClient;

  constructor(hostport: string) {
    this.grpcServiceClient = new GrpcServiceClient(hostport);
  }

  async makeMoves(request: RemoteMoveRequest): Promise<MoveResponse> {
    const grpcRequest = new GrpcMoveRequest();
    request.moveSetList.forEach((move, idx) => {
      const grpcMove = new GrpcMove();
      grpcMove.setIndexFrom(move.indexFrom);
      grpcMove.setIndexTo(move.indexTo);
      grpcRequest.addMoveSet(grpcMove, idx);
    });
    const response: GrpcMoveResponse = await this.grpcServiceClient.makeMoves(grpcRequest, null);
    return {
      moveSuccess: response.getMoveSuccess(),
      message: response.getMessage(),
    };
  }

  boardUpdateSubscription(
    request: BoardSubscriptionRequest,
    onUpdate: (update: BoardUpdate) => void,
  ): void {
    const grpcRequest = new GrpcBoardSubscriptionRequest();
    grpcRequest.setGameId(request.gameId);
    const stream = this.grpcServiceClient.boardUpdateSubscription(grpcRequest);
    stream.on('data', (grpcBoardUpdate: GrpcBoardUpdate) => {
      const update: BoardUpdate = {
        prevMoveSetList: grpcBoardUpdate.getPrevMoveSetList().map((grpcMove) => ({
          indexFrom: grpcMove.getIndexFrom(),
          indexTo: grpcMove.getIndexTo(),
        })),
        boardState: {
          boardList: (
            grpcBoardUpdate.hasBoardState()
              ? grpcBoardUpdate.getBoardState().getBoardList()
              : undefined
          ),
        },
      };
      onUpdate(update);
    });
  }
}

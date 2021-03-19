export interface Move {
  indexFrom: number;
  indexTo: number;
}

export enum Tile {
  NO_PIECE = 0,
  WHITE = 1,
  BLACK = 2,
  WHITE_PROMOTED = 3,
  BLACK_PROMOTED = 4,
}

export interface BoardState {
  boardList: Array<Tile>;
}

export interface RemoteBoardSubscriptionRequest {
  gameId?: string;
}

export interface RemoteMoveRequest {
  moveSetList: Array<Move>;
}

export interface RemoteMoveResponse {
  moveSuccess: boolean;
  message?: string;
}

export interface RemoteBoardUpdate {
  boardState?: BoardState;
  prevMoveSetList: Array<Move>;
}

export interface RemoteGameService {
  makeMoves(request: RemoteMoveRequest): Promise<RemoteMoveResponse>;
  boardUpdateSubscription(
    request: RemoteBoardSubscriptionRequest, onUpdate: (update: RemoteBoardUpdate) => void): void;
}

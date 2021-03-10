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

export interface BoardSubscriptionRequest {
  gameId?: string;
}

export interface MoveRequest {
  moveSetList: Array<Move>;
}

export interface MoveResponse {
  moveSuccess: boolean;
  message?: string;
}

export interface BoardUpdate {
  boardState?: BoardState;
  prevMoveSetList: Array<Move>;
}

export interface GameService {
  makeMoves(request: MoveRequest): Promise<MoveResponse>;
  boardUpdateSubscription(
    request: BoardSubscriptionRequest, onUpdate: (update: BoardUpdate) => void): void;
}

export interface RemoteGameStartRequest {
  gameId?: string;
}

export enum GameRole {
  PLAYER_WHITE = 0,
  PLAYER_BLACK = 1,
  SPECTATOR = 2,
}

export interface RemoteGameStartRole {
  playerRole: GameRole;
  gameId: string;
}

export interface RemoteGameStartResponse {
  gameData?: RemoteGameStartRole;
  message: string;
}

export interface RemoteGameControlService {
  startGame(request: RemoteGameStartRequest): Promise<RemoteGameStartResponse>;
}

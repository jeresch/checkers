export interface GameStartRequest {
  gameId?: string;
}

export enum GameRole {
  PLAYER_WHITE = 0,
  PLAYER_BLACK = 1,
  SPECTATOR = 2,
}

export interface GameStartRole {
  playerRole: GameRole;
  gameId: string;
}

export interface GameStartResponse {
  gameData?: GameStartRole;
  message: string;
}

export interface GameControlService {
  startGame(request: GameStartRequest): Promise<GameStartResponse>;
}

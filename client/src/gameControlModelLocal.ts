import GameControlModel from './gameControlModel';

import { GameRole } from './generated/game_control_pb';
import panic from './util';

export default class GameControlModelLocal implements GameControlModel {
  gameId: string;

  private gameInProgress: boolean = true;

  private colorMove: GameRole = GameRole.PLAYER_WHITE;

  constructor(gameId: string) {
    this.gameId = gameId;
  }

  awaitingLocalMoveForColor(role: GameRole): boolean {
    return this.gameInProgress && this.colorMove === role;
  }

  handleSuccessfulMove(role: GameRole) {
    if (!this.gameInProgress) {
      panic('Got move while not playing');
    } else if (role !== this.colorMove) {
      panic('Inactive user moved');
    }
    switch (role) {
      case GameRole.SPECTATOR:
        panic('Spectators cannot move');
        break;
      case GameRole.PLAYER_WHITE:
        this.colorMove = GameRole.PLAYER_BLACK;
        break;
      case GameRole.PLAYER_BLACK:
        this.colorMove = GameRole.PLAYER_WHITE;
        break;
      default:
        panic('unknown enum value');
    }
  }

  handleCompletedGame() {
    this.gameInProgress = false;
  }
}

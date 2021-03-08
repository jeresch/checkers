import { GameRole } from './generated/game_control_pb';
import panic from './util';

export default class GameControlModel {
  gameActive: boolean = false;

  gameId: string;

  gameRole: GameRole;

  newGame(gameId: string, gameRole: GameRole) {
    if (this.gameActive) {
      panic('Should not create new game with game in progress');
    }
    this.gameId = gameId;
    this.gameRole = gameRole;
    this.gameActive = true;
  }
}

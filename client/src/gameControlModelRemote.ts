import GameControlModel from './gameControlModel';
import { GameRole } from './remoteGameControlService';

export default class GameControlModelRemote implements GameControlModel {
  gameId: string;

  private gameInProgress: boolean = true;

  private awaitingRemoteMove: boolean;

  private localRole: GameRole;

  constructor(gameId: string, localRole: GameRole) {
    this.gameId = gameId;
    this.localRole = localRole;
    this.awaitingRemoteMove = this.localRole === GameRole.PLAYER_BLACK;
  }

  awaitingLocalMoveForColor(role: GameRole): boolean {
    return this.gameInProgress && role === this.localRole && this.awaitingRemoteMove;
  }

  handleSuccessfulMove() {
    this.awaitingRemoteMove = !this.awaitingRemoteMove;
  }

  handleCompletedGame() {
    this.gameInProgress = false;
  }
}

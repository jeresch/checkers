import { GameRole } from './remoteGameControlService';

export default interface GameControlModel {
  gameId: string;
  awaitingLocalMoveForColor(role: GameRole): boolean;
  handleSuccessfulMove(role: GameRole): void;
  handleCompletedGame(): void;
}

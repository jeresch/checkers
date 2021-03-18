import { GameRole } from './gameControlService';

export default interface GameControlModel {
  gameId: string;
  awaitingLocalMoveForColor(role: GameRole): boolean;
  handleSuccessfulMove(role: GameRole): void;
  handleCompletedGame(): void;
}

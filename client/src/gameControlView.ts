export interface GameControlViewEventListener {
  onCreateGameRequest(): void;
  onJoinGameRequest(): void;
}

export default class GameControlView {
  eventListeners: Array<GameControlViewEventListener> = [];

  constructor(createGameButton: HTMLButtonElement, joinGameButton: HTMLButtonElement) {
    createGameButton.addEventListener('click', this.onClickCreateGame);
    joinGameButton.addEventListener('click', this.onClickJoinGame);
  }

  onClickCreateGame = () => {
    this.eventListeners.forEach((l) => l.onCreateGameRequest());
  };

  onClickJoinGame = () => {
    this.eventListeners.forEach((l) => l.onJoinGameRequest());
  };

  registerListener(listener: GameControlViewEventListener) {
    this.eventListeners.push(listener);
  }
}

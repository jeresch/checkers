export interface GameControlViewEventListener {
  onCreateGameRequest(): void;
  onJoinGameRequest(): void;
}

export default class GameControlView {
  eventListeners: Array<GameControlViewEventListener> = [];

  createGameButton: HTMLButtonElement;

  joinGameButton: HTMLButtonElement;

  constructor(createGameButton: HTMLButtonElement, joinGameButton: HTMLButtonElement) {
    this.createGameButton = createGameButton;
    this.joinGameButton = joinGameButton;
    this.createGameButton.addEventListener('click', this.onClickCreateGame);
    this.joinGameButton.addEventListener('click', this.onClickJoinGame);
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

  showInterface() {
    this.createGameButton.removeAttribute('style');
    this.joinGameButton.removeAttribute('style');
  }

  hideInterface() {
    this.createGameButton.setAttribute('style', 'display:none');
    this.joinGameButton.setAttribute('style', 'display:none');
  }
}

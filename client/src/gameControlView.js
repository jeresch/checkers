export default class GameControlView {
  constructor(createGameButton, joinGameButton) {
    this.eventListeners = [];
    createGameButton.addEventListener('click', this.onClickCreateGame);
    joinGameButton.addEventListener('click', this.onClickJoinGame);
  }

  onClickCreateGame() {
    this.eventListeners.forEach((l) => l.onCreateGameRequest());
  }

  onClickJoinGame() {
    this.eventListeners.forEach((l) => l.onJoinGameRequest());
  }

  registerListener(listener) {
    this.eventListeners.push(listener);
  }
}

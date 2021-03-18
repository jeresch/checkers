export interface GameControlViewCallbacks {
  onCreateRemoteGame?(): void;
  onJoinRemoteGame?(gameId: string): void;
  onCreateLocalGame?(): void;
}

export default class GameControlView {
  private createRemoteGameCallbacks: Array<Function> = [];

  private joinRemoteGameCallbacks: Array<Function> = [];

  private createLocalGameCallbacks: Array<Function> = [];

  private domViewContainer: HTMLDivElement;

  private joinRemoteGameIdTextField:HTMLInputElement;

  constructor(
    domViewContainer: HTMLDivElement,
    createRemoteGameButton: HTMLButtonElement,
    joinRemoteGameButton: HTMLButtonElement,
    joinRemoteGameIdTextField: HTMLInputElement,
    createLocalGameButton: HTMLButtonElement,
  ) {
    this.domViewContainer = domViewContainer;
    this.joinRemoteGameIdTextField = joinRemoteGameIdTextField;
    createRemoteGameButton.addEventListener('click', this.onClickCreateRemoteGame.bind(this));
    joinRemoteGameButton.addEventListener('click', this.onClickJoinRemoteGame.bind(this));
    createLocalGameButton.addEventListener('click', this.onClickCreateLocalGame.bind(this));
  }

  registerCallbacks(callbacks: GameControlViewCallbacks) {
    if (callbacks.onCreateRemoteGame) {
      this.createRemoteGameCallbacks.push(callbacks.onCreateRemoteGame);
    }
    if (callbacks.onJoinRemoteGame) {
      this.joinRemoteGameCallbacks.push(callbacks.onJoinRemoteGame);
    }
    if (callbacks.onCreateLocalGame) {
      this.createLocalGameCallbacks.push(callbacks.onCreateLocalGame);
    }
  }

  showInterface() {
    this.domViewContainer.style.display = 'block';
  }

  hideInterface() {
    this.domViewContainer.style.display = 'none';
  }

  private onClickCreateRemoteGame() {
    this.createRemoteGameCallbacks.forEach((c) => c());
  }

  private onClickJoinRemoteGame() {
    this.joinRemoteGameCallbacks.forEach((c) => c(this.joinRemoteGameIdTextField.textContent));
  }

  private onClickCreateLocalGame() {
    this.createLocalGameCallbacks.forEach((c) => c());
  }
}

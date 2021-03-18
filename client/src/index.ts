import constants from './constants';
import BoardView from './boardView';
import GameController from './gameController';
import GameControlView from './gameControlView';
import GameControlController from './gameControlController';

const canvas = <HTMLCanvasElement>document.getElementById('game-board');
canvas.setAttribute('width', `${constants.boardWidth}`);
canvas.setAttribute('height', `${constants.boardHeight}`);
const boardView = new BoardView(canvas);

const gameControlContainerDiv = <HTMLDivElement>document.getElementById('game-control-container');
const createRemoteGameButton = <HTMLButtonElement>document.getElementById('create-remote-game-btn');
const joinRemoteGameButton = <HTMLButtonElement>document.getElementById('join-remote-game-btn');
const joinRemoteGameIdTextField = <HTMLInputElement>document.getElementById('join-remote-game-id-field');
const createLocalGameButton = <HTMLButtonElement>document.getElementById('create-local-game-btn');
const gameControlView = new GameControlView(
  gameControlContainerDiv,
  createRemoteGameButton,
  joinRemoteGameButton,
  joinRemoteGameIdTextField,
  createLocalGameButton,
);

const serverAddress = 'http://localhost:8080';

const gameController = new GameController(serverAddress, boardView);
const gameControlController = new GameControlController(
  gameControlView, gameController,
);

export { gameController, gameControlController };

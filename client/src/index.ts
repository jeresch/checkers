import { GameControlServiceClient } from './generated/Game_controlServiceClientPb';
import { GameplayServiceClient } from './generated/GameServiceClientPb';
import constants from './constants';
import BoardModel from './boardModel';
import BoardView from './boardView';
import BoardController from './boardController';
import GameControlModel from './gameControlModel';
import GameControlView from './gameControlView';
import GameControlController from './gameControlController';

const canvas = <HTMLCanvasElement>document.getElementById('game-board');
canvas.setAttribute('width', `${constants.boardWidth}`);
canvas.setAttribute('height', `${constants.boardHeight}`);
const boardView = new BoardView(canvas);
const boardModel = new BoardModel();

const createGameButton = <HTMLButtonElement>document.getElementById('create-game-button');
const joinGameButton = <HTMLButtonElement>document.getElementById('join-game-button');
const gameControlView = new GameControlView(createGameButton, joinGameButton);
const gameControlModel = new GameControlModel();

const gameplayServiceClient = new GameplayServiceClient('http://localhost:8080');
const gameControlServiceClient = new GameControlServiceClient('http://localhost:8080');

const boardController = new BoardController(
  gameplayServiceClient, boardModel, boardView, gameControlModel,
);
const gameControlController = new GameControlController(
  gameControlServiceClient, gameControlModel, gameControlView,
);

export { boardController, gameControlController };

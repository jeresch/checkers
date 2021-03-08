import constants from './constants';
import BoardModel from './boardModel';
import BoardView from './boardView';
import BoardController from './boardController';
import BoardServiceGrpc from './boardServiceGrpc';
import GameControlModel from './gameControlModel';
import GameControlView from './gameControlView';
import GameControlController from './gameControlController';
import GameControlServiceGrpc from './gameControlServiceGrpc';

const canvas = <HTMLCanvasElement>document.getElementById('game-board');
canvas.setAttribute('width', `${constants.boardWidth}`);
canvas.setAttribute('height', `${constants.boardHeight}`);
const boardView = new BoardView(canvas);
const boardModel = new BoardModel();

const createGameButton = <HTMLButtonElement>document.getElementById('create-game-button');
const joinGameButton = <HTMLButtonElement>document.getElementById('join-game-button');
const gameControlView = new GameControlView(createGameButton, joinGameButton);
const gameControlModel = new GameControlModel();

const boardService = new BoardServiceGrpc('http://localhost:8080');
const gameControlService = new GameControlServiceGrpc('http://localhost:8080');

const boardController = new BoardController(
  boardService, boardModel, boardView, gameControlModel,
);
const gameControlController = new GameControlController(
  gameControlService, gameControlModel, gameControlView, boardController,
);

export { boardController, gameControlController };

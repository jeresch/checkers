import { GameControlServiceClient } from './generated/game_control_grpc_web_pb';
import { GameplayServiceClient } from './generated/game_grpc_web_pb';
import constants from './constants';
import BoardModel from './boardModel';
import BoardView from './boardView';
import BoardController from './boardController';
import GameControlModel from './gameControlModel';
import GameControlView from './gameControlView';
import GameControlController from './gameControlController';

const canvas = document.getElementById('game-board');
canvas.setAttribute('width', `${constants.boardWidth}`);
canvas.setAttribute('height', `${constants.boardHeight}`);
const boardView = new BoardView(canvas);
const boardModel = new BoardModel();

const createGameButton = document.getElementById('create-game-button');
const joinGameButton = document.getElementById('join-game-button');
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

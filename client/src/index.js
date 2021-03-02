import { constants } from "./constants";

const drawBoard = (ctx, state) => {
    const tileWidth = constants.boardWidth / constants.boardDimension;
    const tileHeight = constants.boardHeight / constants.boardDimension;
    for (let row = 0; row < constants.boardDimension; row++) {
        for (let col = 0; col < constants.boardDimension; col++) {
            ctx.fillStyle = ((row + col) % 2 == 0) ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";
            ctx.fillRect(col * tileWidth, row * tileHeight, tileWidth, tileHeight);
            console.log(col * tileWidth, row * tileHeight);
        }
    }
};

let canvas = document.getElementById("game-board");
canvas.setAttribute("width", `${constants.boardWidth}`);
canvas.setAttribute("height", `${constants.boardHeight}`);
let ctx = canvas.getContext("2d");
drawBoard(ctx);

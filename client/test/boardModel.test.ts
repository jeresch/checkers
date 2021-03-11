/* eslint-disable prefer-arrow-callback, func-names */
import { suite, test } from 'mocha';
import { assert } from 'chai';

import BoardModel, { TileStatus } from '../src/boardModel';

// ..01..02..03..04
// 05..06..07..08..
// ..09..10..11..12
// 13..14..15..16..
// ..17..18..19..20
// 21..22..23..24..
// ..25..26..27..28
// 29..30..31..32..

function boardFromPicture(picture: string): BoardModel {
  const tiles: Array<TileStatus> = [];
  const nonWhiteSpaceChars = Array.from(picture)
    .filter((c: string) => c !== '\n' && c !== ' ');
  for (let i = 0; i < nonWhiteSpaceChars.length; i += 2) {
    const c = nonWhiteSpaceChars[i];
    switch (c) {
      case 'b':
        tiles.push(TileStatus.Black);
        break;
      case 'B':
        tiles.push(TileStatus.BlackKing);
        break;
      case 'w':
        tiles.push(TileStatus.White);
        break;
      case 'W':
        tiles.push(TileStatus.WhiteKing);
        break;
      case '.':
        break;
      case 'e':
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9':
        tiles.push(TileStatus.Empty);
        break;
      default:
        assert(false, 'bad board construction');
        break;
    }
  }
  return new BoardModel(tiles);
}

function boardsMatch(board1: BoardModel, board2: BoardModel): boolean {
  if (board1.tiles.length !== board2.tiles.length) {
    return false;
  }
  for (let i = 1; i <= 32; i += 1) {
    if (board1.getTile(i) !== board2.getTile(i)) {
      return false;
    }
  }
  return true;
}

suite('BoardModel', function () {
  suite('adjacent move validation', function () {
    test('allow black pieces to move forward when forward is open in both directions from inner positions', function () {
      const board: BoardModel = boardFromPicture(`
        ..bb..02..03..04
        05..06..07..bb..
        ..09..10..11..12
        13..14..bb..16..
        ..17..18..19..20
        21..22..23..24..
        ..25..26..27..28
        29..30..31..32..
      `);
      assert.isTrue(board.moveIsValid(1, 5));
      assert.isTrue(board.moveIsValid(1, 6));
      assert.isFalse(board.moveIsValid(1, 4));
      assert.isFalse(board.moveIsValid(1, 7));
      assert.isTrue(board.moveIsValid(8, 11));
      assert.isTrue(board.moveIsValid(8, 12));
      assert.isTrue(board.moveIsValid(15, 18));
      assert.isTrue(board.moveIsValid(15, 19));
    });
    test('only allow moving inwards when on edge', function () {
      const board: BoardModel = boardFromPicture(`
        ..01..02..03..bb
        bb..06..07..08..
        ..09..10..11..ww
        BB..14..15..16..
        ..17..18..19..WW
        WW..22..23..24..
        ..25..26..27..28
        29..30..31..32..
      `);
      assert.isTrue(board.moveIsValid(4, 8));
      assert.isFalse(board.moveIsValid(4, 5));
      assert.isFalse(board.moveIsValid(4, 9));

      assert.isTrue(board.moveIsValid(5, 9));
      assert.isFalse(board.moveIsValid(5, 8));
      assert.isFalse(board.moveIsValid(5, 12));

      assert.isTrue(board.moveIsValid(12, 8));
      assert.isFalse(board.moveIsValid(12, 9));
      assert.isFalse(board.moveIsValid(12, 5));

      assert.isTrue(board.moveIsValid(13, 9));
      assert.isTrue(board.moveIsValid(13, 17));

      assert.isTrue(board.moveIsValid(20, 16));
      assert.isTrue(board.moveIsValid(20, 24));

      assert.isTrue(board.moveIsValid(21, 17));
      assert.isTrue(board.moveIsValid(21, 25));
    });
    test('disallow moving past ends of the board', function () {
      const board: BoardModel = boardFromPicture(`
        ..ww..02..BB..04
        05..06..07..08..
        ..09..10..11..12
        13..14..15..16..
        ..17..18..19..20
        21..22..23..24..
        ..25..26..27..28
        WW..30..bb..32..
      `);
      assert.isFalse(board.moveIsValid(1, -2));
      assert.isFalse(board.moveIsValid(1, -3));

      assert.isFalse(board.moveIsValid(3, 0));
      assert.isFalse(board.moveIsValid(3, -1));

      assert.isFalse(board.moveIsValid(31, 34));
      assert.isFalse(board.moveIsValid(31, 35));

      assert.isFalse(board.moveIsValid(29, 32));
      assert.isFalse(board.moveIsValid(29, 33));
    });
    test('disallow moving into occupied space', function () {
      const board: BoardModel = boardFromPicture(`
        ..01..02..03..04
        05..06..07..08..
        ..09..10..11..12
        13..14..WW..16..
        ..17..WW..19..20
        21..22..23..24..
        ..25..26..27..28
        29..30..31..32..
      `);
      assert.isFalse(board.moveIsValid(15, 15));
      assert.isFalse(board.moveIsValid(15, 18));
      assert.isFalse(board.moveIsValid(18, 15));
    });
    test('disallow backward moves unless promoted', function () {
      const board: BoardModel = boardFromPicture(`
        ..01..02..03..04
        05..06..07..08..
        ..09..10..11..12
        13..ww..bb..16..
        ..17..18..19..20
        21..BB..WW..24..
        ..25..26..27..28
        29..30..31..32..
      `);
      assert.isFalse(board.moveIsValid(14, 17));
      assert.isFalse(board.moveIsValid(14, 18));
      assert.isFalse(board.moveIsValid(15, 10));
      assert.isFalse(board.moveIsValid(15, 11));

      assert.isTrue(board.moveIsValid(22, 17));
      assert.isTrue(board.moveIsValid(22, 18));
      assert.isTrue(board.moveIsValid(23, 26));
      assert.isTrue(board.moveIsValid(23, 27));
    });
  });
  suite('jump move validation', function () {
    test('can capture piece of other color forwards', function () {
      const board: BoardModel = boardFromPicture(`
        ..01..02..03..04
        05..06..07..08..
        ..09..10..11..12
        13..bb..bb..16..
        ..17..ww..ww..20
        21..22..23..24..
        ..25..26..27..28
        29..30..31..32..
      `);

      assert.isTrue(board.moveIsValid(15, 22));
      assert.isTrue(board.moveIsValid(15, 24));
      assert.isTrue(board.moveIsValid(18, 9));
      assert.isTrue(board.moveIsValid(18, 11));
    });
    test('kings can capture piece of other color backwards', function () {
      const board: BoardModel = boardFromPicture(`
        ..01..02..03..04
        05..06..07..08..
        ..09..10..11..12
        13..WW..WW..16..
        ..17..BB..BB..20
        21..22..23..24..
        ..25..26..27..28
        29..30..31..32..
      `);

      assert.isTrue(board.moveIsValid(15, 22));
      assert.isTrue(board.moveIsValid(15, 24));
      assert.isTrue(board.moveIsValid(18, 9));
      assert.isTrue(board.moveIsValid(18, 11));
    });
    test('disallow jumping into occupied space', function () {
      const board: BoardModel = boardFromPicture(`
        ..01..02..03..04
        05..06..07..08..
        ..09..10..11..12
        13..bb..bb..16..
        ..17..ww..ww..20
        21..22..bb..ww..
        ..25..26..27..28
        29..30..31..32..
      `);

      assert.isFalse(board.moveIsValid(14, 23));
      assert.isFalse(board.moveIsValid(15, 24));
    });
    test('disallow taking own color', function () {
      const board: BoardModel = boardFromPicture(`
        ..01..02..03..04
        05..06..07..08..
        ..09..10..11..12
        13..14..bb..16..
        ..17..bb..bb..20
        21..22..23..24..
        ..25..26..27..28
        29..30..31..32..
      `);

      assert.isFalse(board.moveIsValid(15, 22));
      assert.isFalse(board.moveIsValid(15, 24));
    });
  });
  suite('piece promotion', function () {
    test('base pieces get promoted when reaching far row', function () {
      const beforeBoard = boardFromPicture(`
        ..01..02..03..04
        05..ww..07..08..
        ..09..10..11..12
        13..14..15..16..
        ..17..18..19..20
        21..22..23..24..
        ..25..bb..27..28
        29..30..31..32..
      `);
      const afterBoard = boardFromPicture(`
        ..WW..02..03..04
        05..06..07..08..
        ..09..10..11..12
        13..14..15..16..
        ..17..18..19..20
        21..22..23..24..
        ..25..26..27..28
        29..30..BB..32..
      `);
      assert.isTrue(beforeBoard.moveIsValid(6, 1));
      assert.isTrue(beforeBoard.moveIsValid(26, 31));
      beforeBoard.doMoveSequence([6, 1]);
      beforeBoard.doMoveSequence([26, 31]);
      assert.isTrue(boardsMatch(beforeBoard, afterBoard));
    });
    test('king pieces remain kings when moving to far row', function () {
      const beforeBoard = boardFromPicture(`
        ..01..02..03..04
        05..WW..07..08..
        ..09..10..11..12
        13..14..15..16..
        ..17..18..19..20
        21..22..23..24..
        ..25..BB..27..28
        29..30..31..32..
      `);
      const afterBoard = boardFromPicture(`
        ..WW..02..03..04
        05..06..07..08..
        ..09..10..11..12
        13..14..15..16..
        ..17..18..19..20
        21..22..23..24..
        ..25..26..27..28
        29..30..BB..32..
      `);
      beforeBoard.doMoveSequence([6, 1]);
      beforeBoard.doMoveSequence([26, 31]);
      assert.isTrue(boardsMatch(beforeBoard, afterBoard));
    });
    test('nothing happens when reaching near row', function () {
      const beforeBoard = boardFromPicture(`
        ..01..02..03..04
        05..BB..07..08..
        ..09..10..11..12
        13..14..15..16..
        ..17..18..19..20
        21..22..23..24..
        ..25..WW..27..28
        29..30..31..32..
      `);
      const afterBoard = boardFromPicture(`
        ..BB..02..03..04
        05..06..07..08..
        ..09..10..11..12
        13..14..15..16..
        ..17..18..19..20
        21..22..23..24..
        ..25..26..27..28
        29..30..WW..32..
      `);
      beforeBoard.doMoveSequence([6, 1]);
      beforeBoard.doMoveSequence([26, 31]);
      assert.isTrue(boardsMatch(beforeBoard, afterBoard));
    });
  });
  suite('multiple jump capture moves', function () {
    test('unpromoted pieces can jump multiple times forwards', function () {
      const beforeBoard = boardFromPicture(`
        ..01..02..03..bb
        05..06..07..ww..
        ..bb..10..11..12
        13..14..15..ww..
        ..bb..18..19..20
        21..22..23..ww..
        ..bb..26..27..28
        ww..30..31..32..
      `);
      const afterBoard = boardFromPicture(`
        ..01..02..03..04
        05..ww..07..08..
        ..09..10..11..12
        13..14..15..16..
        ..17..18..19..20
        21..22..23..24..
        ..25..26..bb..28
        29..30..31..32..
      `);

      const blackMoves = [4, 11, 20, 27];
      const whiteMoves = [29, 22, 13, 6];
      assert.isTrue(beforeBoard.moveSequenceIsValid(blackMoves));
      assert.isTrue(beforeBoard.moveSequenceIsValid(whiteMoves));

      beforeBoard.doMoveSequence(blackMoves);
      beforeBoard.doMoveSequence(whiteMoves);
      assert.isTrue(boardsMatch(beforeBoard, afterBoard));
    });
    test('kings can jump forwards and backwards', function () {
      const beforeBoard = boardFromPicture(`
        ..01..02..03..WW
        05..bb..bb..bb..
        ..09..10..11..12
        13..14..15..16..
        ..17..18..19..20
        21..22..23..24..
        ..ww..ww..ww..28
        BB..30..31..32..
      `);
      const afterBoard = boardFromPicture(`
        ..01..02..03..04
        05..06..07..08..
        ..WW..10..11..12
        13..14..15..16..
        ..17..18..19..20
        21..22..23..BB..
        ..25..26..27..28
        29..30..31..32..
      `);
      const whiteMoves = [4, 11, 2, 9];
      const blackMoves = [29, 22, 31, 24];
      assert.isTrue(beforeBoard.moveSequenceIsValid(whiteMoves));
      assert.isTrue(beforeBoard.moveSequenceIsValid(blackMoves));

      beforeBoard.doMoveSequence(whiteMoves);
      beforeBoard.doMoveSequence(blackMoves);
      assert.isTrue(boardsMatch(beforeBoard, afterBoard));
    });
    test('promotion can happen mid-move', function () {
      const beforeBoard = boardFromPicture(`
        ..01..02..03..04
        05..06..bb..bb..
        ..09..10..11..ww
        13..14..15..16..
        ..17..18..19..20
        bb..22..23..24..
        ..ww..ww..27..28
        29..30..31..32..
      `);
      const afterBoard = boardFromPicture(`
        ..01..02..03..04
        05..06..07..08..
        ..09..WW..11..12
        13..14..15..16..
        ..17..18..19..20
        21..22..BB..24..
        ..25..26..27..28
        29..30..31..32..
      `);
      const whiteMoves = [12, 3, 10];
      const blackMoves = [21, 30, 23];
      assert.isTrue(beforeBoard.moveSequenceIsValid(whiteMoves));
      assert.isTrue(beforeBoard.moveSequenceIsValid(blackMoves));

      beforeBoard.doMoveSequence(whiteMoves);
      beforeBoard.doMoveSequence(blackMoves);
      assert.isTrue(boardsMatch(beforeBoard, afterBoard));
    });
  });
});

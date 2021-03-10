import panic from './util';
import {
  TileStatus, MoveDirection,
  moveDirectionOfOffset, pieceCanMoveInDirection, moveDirectionIsJump,
  jumpDirectionToShiftDirection, canCapture, offsetFromMoveDirection,
} from './boardUtil';

export { TileStatus };

// ..01..02..03..04
// 05..06..07..08..
// ..09..10..11..12
// 13..14..15..16..
// ..17..18..19..20
// 21..22..23..24..
// ..25..26..27..28
// 29..30..31..32..
export default class BoardModel {
  tiles: Array<TileStatus>;

  constructor(tiles?: Array<TileStatus>) {
    if (tiles) {
      this.tiles = tiles;
      return;
    }
    this.tiles = [];

    let i = 1;
    for (; i < 4 * 3 + 1; i += 1) {
      this.setTile(i, TileStatus.Black);
    }
    for (; i < 4 * 3 + 4 * 2 + 1; i += 1) {
      this.setTile(i, TileStatus.Empty);
    }
    for (; i < 4 * 8 + 1; i += 1) {
      this.setTile(i, TileStatus.White);
    }
  }

  getTile(idx: number): TileStatus {
    return this.tiles[idx - 1];
  }

  setTile(idx: number, tile: TileStatus) {
    this.tiles[idx - 1] = tile;
  }

  doMoveSequence(moves: Array<number>) {
    if (!this.moveSequenceIsValid(moves)) {
      panic('Expected valid move sequence');
      return;
    }

    for (let i = 0; i < moves.length - 1; i += 1) {
      const fromIdx = moves[i];
      const toIdx = moves[i + 1];
      const moveDirection = moveDirectionOfOffset(fromIdx, toIdx);

      if (moveDirectionIsJump(moveDirection)) {
        const jumpedIdx = offsetFromMoveDirection(
          fromIdx, jumpDirectionToShiftDirection(moveDirection),
        );
        this.setTile(jumpedIdx, TileStatus.Empty);
      }
      this.setTile(toIdx, this.getTile(fromIdx));
      this.setTile(fromIdx, TileStatus.Empty);
    }
  }

  moveIsValid(fromIdx: number, toIdx: number, providedFromTile?: TileStatus): boolean {
    const direction: MoveDirection = moveDirectionOfOffset(fromIdx, toIdx);
    const fromTile = providedFromTile ?? this.getTile(fromIdx);
    const toTile = this.getTile(toIdx);

    if (toTile !== TileStatus.Empty) {
      return false;
    }

    if (MoveDirection.NoMove === direction) {
      return false;
    }

    if (!pieceCanMoveInDirection(fromTile, direction)) {
      return false;
    }

    if (moveDirectionIsJump(direction)) {
      const jumpedTileIdx = (
        fromIdx + offsetFromMoveDirection(fromIdx, jumpDirectionToShiftDirection(direction))
      );
      if (!canCapture(fromTile, this.getTile(jumpedTileIdx))) {
        return false;
      }
    }

    return true;
  }

  moveSequenceIsValid(moves: Array<number>): boolean {
    for (let i = 0; i < moves.length - 1; i += 1) {
      if (!this.moveIsValid(moves[i], moves[i + 1], this.getTile(moves[0]))) {
        return false;
      }
    }
    return true;
  }
}

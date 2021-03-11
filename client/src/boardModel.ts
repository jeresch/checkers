import panic from './util';

/** The different states a tile can be in */
export enum TileStatus {
  Empty,
  White,
  WhiteKing,
  Black,
  BlackKing,
}

/**
 * Convenience enum for describing the different possible moves making up a move sequence
 */
enum MoveDirection {
  UpLeft,
  UpRight,
  DownLeft,
  DownRight,
  JumpUpLeft,
  JumpUpRight,
  JumpDownLeft,
  JumpDownRight,
  NoMove,
}

/**
 * Represents the logical model for a board, with a limited interface.
 * Uses the following 1-indexed board layout:
 * ```
 * ..01..02..03..04
 * 05..06..07..08..
 * ..09..10..11..12
 * 13..14..15..16..
 * ..17..18..19..20
 * 21..22..23..24..
 * ..25..26..27..28
 * 29..30..31..32..
 * ```
 */
export default class BoardModel {
  /** Should not be modified directly, 0-indexed */
  private tiles: Array<TileStatus>;

  /** Optionally pass an initial state array of length 32 */
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

  /** Get a tile status, param is 1-indexed */
  getTile(idx: number): TileStatus {
    return this.tiles[idx - 1];
  }

  /** Manually set a tile status (discouraged), param idx is 1-indexed */
  setTile(idx: number, tile: TileStatus) {
    this.tiles[idx - 1] = tile;
  }

  /**
   * Perform a move sequence with a piece starting at moves[0].  moves.length should only be >2 if
   * there are multiple jump moves in the sequence.
   * @param moves  Array of 1-indexes
   */
  doMoveSequence(moves: Array<number>) {
    if (!this.moveSequenceIsValid(moves)) {
      panic('Expected valid move sequence');
      return;
    }

    for (let i = 0; i < moves.length - 1; i += 1) {
      const fromIdx = moves[i];
      const toIdx = moves[i + 1];
      const moveDirection = BoardModel.moveDirectionOfOffset(fromIdx, toIdx);

      if (BoardModel.moveDirectionIsJump(moveDirection)) {
        const jumpedIdx = fromIdx + BoardModel.offsetFromMoveDirection(
          fromIdx, BoardModel.jumpDirectionToShiftDirection(moveDirection),
        );
        this.setTile(jumpedIdx, TileStatus.Empty);
      }

      this.setTile(toIdx, this.getTile(fromIdx));
      this.setTile(fromIdx, TileStatus.Empty);

      // Handle promotions
      if (BoardModel.pieceNeedsPromotion(toIdx, this.getTile(toIdx))) {
        this.setTile(toIdx, BoardModel.promotedVersion(this.getTile(toIdx)));
      }
    }
  }

  /**
   * Validate a single move, optionally overriding the TileStatus of the "from" tile.
   * @param fromIdx  1-indexed
   * @param toIdx  1-indexed
   * @param providedFromTile  Optional TileStatus of moved piece, defaults to this.getState(fromIdx)
   * @returns  true iff move is valid
   */
  moveIsValid(fromIdx: number, toIdx: number, providedFromTile?: TileStatus): boolean {
    const direction: MoveDirection = BoardModel.moveDirectionOfOffset(fromIdx, toIdx);
    const fromTile = providedFromTile ?? this.getTile(fromIdx);
    const toTile = this.getTile(toIdx);

    if (toTile !== TileStatus.Empty) {
      return false;
    }

    if (MoveDirection.NoMove === direction) {
      return false;
    }

    if (!BoardModel.pieceCanMoveInDirection(fromTile, direction)) {
      return false;
    }

    if (BoardModel.moveDirectionIsJump(direction)) {
      const jumpedTileIdx = fromIdx + BoardModel.offsetFromMoveDirection(
        fromIdx, BoardModel.jumpDirectionToShiftDirection(direction),
      );
      if (!BoardModel.canCapture(fromTile, this.getTile(jumpedTileIdx))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate a move sequence, possibly of multiple consecutive jumps
   * @param moves  Array of 1-indexes, with moves[0] being the starting tile
   * @returns  true iff the sequence is valid
   */
  moveSequenceIsValid(moves: Array<number>): boolean {
    let pieceColor = this.getTile(moves[0]);
    const movesAreChained = moves.length > 2;
    for (let i = 0; i < moves.length - 1; i += 1) {
      if (BoardModel.pieceNeedsPromotion(moves[i], pieceColor)) {
        pieceColor = BoardModel.promotedVersion(pieceColor);
      }
      const validMove = this.moveIsValid(moves[i], moves[i + 1], pieceColor);
      const jumpMove = BoardModel.moveDirectionIsJump(
        BoardModel.moveDirectionOfOffset(moves[i], moves[i + 1]),
      );
      if (!validMove || (movesAreChained && !jumpMove)) {
        return false;
      }
    }
    return true;
  }

  /** Converts from tile 1-index to row 0-index (0-7) */
  private static tile1IdxToRow0Idx(tileIdx: number): number {
    return Math.floor((tileIdx - 1) / 4);
  }

  /** Converts from tile 1-index to column 0-index (0-3) */
  private static tile1IdxToCol0Idx(tileIdx: number): number {
    return (tileIdx - 1) % 4;
  }

  /** true iff the 0-indexed row corresponding to 1-indexed tileIdx is even */
  private static inEvenRow(tileIdx: number): boolean {
    return BoardModel.tile1IdxToRow0Idx(tileIdx) % 2 === 0;
  }

  /**
   * true iff an unpromoted white or black piece in tileIdx is on the edge of the board
   * and cannot move outward, and can only move inward.
   */
  private static tileOnEdge(tileIdx: number): boolean {
    const fromRowIdx = BoardModel.tile1IdxToRow0Idx(tileIdx);
    const fromColIdx = BoardModel.tile1IdxToCol0Idx(tileIdx);
    return (fromRowIdx % 2 === 0) ? (fromColIdx === 3) : (fromColIdx === 0);
  }

  /**
   * Get the single shift MoveDirection corresponding to the input jump direction.
   * Expects `direction` to be a "jump" MoveDirection.
   */
  private static jumpDirectionToShiftDirection(direction: MoveDirection): MoveDirection {
    switch (direction) {
      case MoveDirection.JumpUpLeft:
        return MoveDirection.UpLeft;
      case MoveDirection.JumpUpRight:
        return MoveDirection.UpRight;
      case MoveDirection.JumpDownLeft:
        return MoveDirection.DownLeft;
      case MoveDirection.JumpDownRight:
        return MoveDirection.DownRight;
      default:
        panic('expected jump move');
        return null;
    }
  }

  /**
   * Returns the offset that would need to be applied to `fromIdx` in order to apply the
   * input `moveDirection`, using the 1-indexed board
   * @param fromIdx  1-indexed
   * @returns  {number} Offset between 1-indexes
   */
  private static offsetFromMoveDirection(
    fromIdx: number, moveDirection: MoveDirection,
  ): number | null {
    const fromEdge = BoardModel.tileOnEdge(fromIdx);
    const fromRowIsEven = BoardModel.inEvenRow(fromIdx);
    switch (moveDirection) {
      case MoveDirection.NoMove:
        return 0;
      case MoveDirection.UpLeft:
        if (fromRowIsEven) {
          return -4;
        }
        if (fromEdge) {
          return null;
        }
        return -5;
      case MoveDirection.UpRight:
        if (fromRowIsEven) {
          if (fromEdge) {
            return null;
          }
          return -3;
        }
        return -4;
      case MoveDirection.DownLeft:
        if (fromRowIsEven) {
          return 4;
        }
        if (fromEdge) {
          return null;
        }
        return 3;
      case MoveDirection.DownRight:
        if (fromRowIsEven) {
          if (fromEdge) {
            return null;
          }
          return 5;
        }
        return 4;
      case MoveDirection.JumpUpLeft:
      case MoveDirection.JumpUpRight:
      case MoveDirection.JumpDownLeft:
      case MoveDirection.JumpDownRight: {
        const shiftDirection = BoardModel.jumpDirectionToShiftDirection(moveDirection);
        const firstShiftOffset = BoardModel.offsetFromMoveDirection(fromIdx, shiftDirection);
        if (firstShiftOffset === null) {
          return null;
        }
        const idxAfterFirstShift = fromIdx + firstShiftOffset;
        const secondShiftOffset = BoardModel.offsetFromMoveDirection(
          idxAfterFirstShift, shiftDirection,
        );
        if (secondShiftOffset === null) {
          return null;
        }
        return firstShiftOffset + secondShiftOffset;
      }
      default:
        return null; // unreachable
    }
  }

  /**
   * Determines the MoveDirection of the move from `fromIdx` to `toIdx`, if such a move is valid.
   * @param fromIdx  1-indexed
   * @param toIdx  1-indexed
   * @returns  The MoveDirection or else `null`
   */
  private static moveDirectionOfOffset(fromIdx: number, toIdx: number): MoveDirection | null {
    const allDirections = [
      MoveDirection.UpLeft, MoveDirection.UpRight, MoveDirection.DownLeft, MoveDirection.DownRight,
      MoveDirection.JumpUpLeft, MoveDirection.JumpUpRight, MoveDirection.JumpDownLeft,
      MoveDirection.JumpDownRight, MoveDirection.NoMove,
    ];

    return allDirections.find((dir) => (
      BoardModel.offsetFromMoveDirection(fromIdx, dir) + fromIdx === toIdx
    )) ?? null;
  }

  /** Simple check of whether the `capturer` is of a correct type to capture the `capturee`. */
  private static canCapture(capturer: TileStatus, capturee: TileStatus): boolean {
    switch (capturer) {
      case TileStatus.Empty:
        return false;
      case TileStatus.Black:
      case TileStatus.BlackKing:
        return capturee === TileStatus.White || capturee === TileStatus.WhiteKing;
      case TileStatus.White:
      case TileStatus.WhiteKing:
        return capturee === TileStatus.Black || capturee === TileStatus.BlackKing;
      default:
        return false; // unreachable
    }
  }

  /** Simple check returning true unless an unpromoted piece attempts to move backwards */
  private static pieceCanMoveInDirection(piece: TileStatus, direction: MoveDirection): boolean {
    if ([
      MoveDirection.UpLeft, MoveDirection.UpRight,
      MoveDirection.JumpUpLeft, MoveDirection.JumpUpRight,
    ].includes(direction)) {
      return [TileStatus.White, TileStatus.WhiteKing, TileStatus.BlackKing].includes(piece);
    }

    if ([
      MoveDirection.DownLeft, MoveDirection.DownRight,
      MoveDirection.JumpDownLeft, MoveDirection.JumpDownRight,
    ].includes(direction)) {
      return [TileStatus.Black, TileStatus.BlackKing, TileStatus.WhiteKing].includes(piece);
    }

    return false;
  }

  /** Simple check returning true iff the `direction` is a "Jump" move */
  private static moveDirectionIsJump(direction: MoveDirection): boolean {
    return [
      MoveDirection.JumpUpLeft,
      MoveDirection.JumpUpRight,
      MoveDirection.JumpDownLeft,
      MoveDirection.JumpDownRight,
    ].includes(direction);
  }

  /**
   * Given a position (1-indexed) and a `pieceStatus`, returns true if the piece earned a promotion.
   */
  private static pieceNeedsPromotion(pieceIdx: number, pieceStatus: TileStatus): boolean {
    const blackPromotion = pieceStatus === TileStatus.Black && pieceIdx > 32 - 4;
    const whitePromotion = pieceStatus === TileStatus.White && pieceIdx <= 4;
    return blackPromotion || whitePromotion;
  }

  /** Returns the promoted version of an unpromoted piece status, or else `undefined` */
  private static promotedVersion(unpromoted: TileStatus): TileStatus {
    switch (unpromoted) {
      case TileStatus.Black:
        return TileStatus.BlackKing;
      case TileStatus.White:
        return TileStatus.WhiteKing;
      default:
        return undefined;
    }
  }
}

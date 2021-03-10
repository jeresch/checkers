import panic from './util';

export enum MoveDirection {
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

export enum TileStatus {
  Empty,
  White,
  WhiteKing,
  Black,
  BlackKing,
}

function tile1IdxToRow0Idx(tileIdx: number): number {
  return Math.floor((tileIdx - 1) / 4);
}

function tile1IdxToCol0Idx(tileIdx: number): number {
  return (tileIdx - 1) % 4;
}

function inEvenRow(tileIdx: number): boolean {
  return tile1IdxToRow0Idx(tileIdx) % 2 === 0;
}

function tileOnEdge(tileIdx: number): boolean {
  const fromRowIdx = tile1IdxToRow0Idx(tileIdx);
  const fromColIdx = tile1IdxToCol0Idx(tileIdx);
  return (fromRowIdx % 2 === 0) ? (fromColIdx === 3) : (fromColIdx === 0);
}

export function jumpDirectionToShiftDirection(direction: MoveDirection): MoveDirection {
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

// ..01..02..03..04
// 05..06..07..08..
// ..09..10..11..12
// 13..14..15..16..
// ..17..18..19..20
// 21..22..23..24..
// ..25..26..27..28
// 29..30..31..32..
export function offsetFromMoveDirection(
  fromIdx: number, moveDirection: MoveDirection,
): number | null {
  const fromEdge = tileOnEdge(fromIdx);
  const fromRowIsEven = inEvenRow(fromIdx);
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
      const shiftDirection = jumpDirectionToShiftDirection(moveDirection);
      const firstShiftOffset = offsetFromMoveDirection(fromIdx, shiftDirection);
      if (firstShiftOffset === null) {
        return null;
      }
      const idxAfterFirstShift = fromIdx + firstShiftOffset;
      const secondShiftOffset = offsetFromMoveDirection(idxAfterFirstShift, shiftDirection);
      if (secondShiftOffset === null) {
        return null;
      }
      return firstShiftOffset + secondShiftOffset;
    }
    default:
      return null; // unreachable
  }
}

export function moveDirectionOfOffset(fromIdx: number, toIdx: number): MoveDirection {
  const allDirections = [
    MoveDirection.UpLeft, MoveDirection.UpRight, MoveDirection.DownLeft, MoveDirection.DownRight,
    MoveDirection.JumpUpLeft, MoveDirection.JumpUpRight, MoveDirection.JumpDownLeft,
    MoveDirection.JumpDownRight, MoveDirection.NoMove,
  ];

  return allDirections.find((dir) => offsetFromMoveDirection(fromIdx, dir) + fromIdx === toIdx)
    ?? null;
}

export function canCapture(capturer: TileStatus, capturee: TileStatus): boolean {
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

export function pieceCanMoveInDirection(piece: TileStatus, direction: MoveDirection): boolean {
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

export function moveDirectionIsJump(direction: MoveDirection): boolean {
  return [
    MoveDirection.JumpUpLeft,
    MoveDirection.JumpUpRight,
    MoveDirection.JumpDownLeft,
    MoveDirection.JumpDownRight,
  ].includes(direction);
}

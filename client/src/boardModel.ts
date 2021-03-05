export enum TileStatus {
  Empty,
  White,
  WhiteKing,
  Black,
  BlackKing,
}

export default class BoardModel {
  tiles: Record<number, TileStatus> = {};

  constructor() {
    let i = 1;
    for (; i < 4 * 3 + 1; i += 1) {
      this.tiles[i] = TileStatus.Black;
    }
    for (; i < 4 * 3 + 4 * 2 + 1; i += 1) {
      this.tiles[i] = TileStatus.Empty;
    }
    for (; i < 4 * 8 + 1; i += 1) {
      this.tiles[i] = TileStatus.White;
    }
  }

  getTile(idx: number): TileStatus {
    return this.tiles[idx];
  }

  movePiece(fromIdx: number, toIdx: number) {
    const stateType = this.tiles[fromIdx];
    this.tiles[fromIdx] = TileStatus.Empty;
    this.tiles[toIdx] = stateType;
  }

  moveIsValid(fromIdx: number, toIdx: number): boolean {
    const fromTile = this.tiles[fromIdx];
    const toTile = this.tiles[toIdx];
    if (toTile !== TileStatus.Empty) {
      return false;
    }
    const fromRowIdx = Math.floor((fromIdx - 1) / 4);
    const fromColIdx = (fromIdx - 1) % 4;
    const fromEdge = (fromRowIdx % 2 === 0) ? (fromColIdx === 3) : (fromColIdx === 0);
    const validTargetOffsets = [];
    if (fromTile === TileStatus.White
      || fromTile === TileStatus.WhiteKing
      || fromTile === TileStatus.BlackKing) {
      const rowShift = (fromRowIdx % 2 === 0) ? -1 : 1;
      validTargetOffsets.push(-4);
      if (!fromEdge) {
        validTargetOffsets.push(-4 + rowShift);
      }
    }
    if (fromTile === TileStatus.Black
      || fromTile === TileStatus.BlackKing
      || fromTile === TileStatus.WhiteKing) {
      const rowShift = (fromRowIdx % 2 === 0) ? -1 : 1;
      validTargetOffsets.push(4);
      if (!fromEdge) {
        validTargetOffsets.push(4 + rowShift);
      }
    }

    // TODO jump moves

    return validTargetOffsets.map((offset) => offset + fromIdx).includes(toIdx);
  }
}

export default class BoardModel {
  constructor() {
    this.tiles = {};
    let i = 1;
    for (; i < 4 * 3 + 1; i += 1) {
      this.tiles[i] = 'b';
    }
    for (; i < 4 * 3 + 4 * 2 + 1; i += 1) {
      this.tiles[i] = ' ';
    }
    for (; i < 4 * 8 + 1; i += 1) {
      this.tiles[i] = 'w';
    }
  }

  getTile(idx) {
    return this.tiles[idx];
  }

  movePiece(fromIdx, toIdx) {
    const stateType = this.tiles[fromIdx];
    this.tiles[fromIdx] = ' ';
    this.tiles[toIdx] = stateType;
  }

  moveIsValid(fromIdx, toIdx) {
    const fromTile = this.tiles[fromIdx];
    const toTile = this.tiles[toIdx];
    if (toTile !== ' ') {
      return false;
    }
    const fromRowIdx = Math.floor((fromIdx - 1) / 4);
    const fromColIdx = (fromIdx - 1) % 4;
    const fromEdge = (fromRowIdx % 2 === 0) ? (fromColIdx === 3) : (fromColIdx === 0);
    const validTargetOffsets = [];
    if (fromTile === 'w' || fromTile === 'wk' || fromTile === 'bk') {
      const rowShift = (fromRowIdx % 2 === 0) ? -1 : 1;
      validTargetOffsets.push(-4);
      if (!fromEdge) {
        validTargetOffsets.push(-4 + rowShift);
      }
    }
    if (fromTile === 'b' || fromTile === 'bk' || fromTile === 'wk') {
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

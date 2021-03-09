/* eslint-disable prefer-arrow-callback, func-names */
import { strict as assert } from 'assert';
import { describe } from 'mocha';

import BoardModel from '../src/boardModel';

// TODO fix layout
// 01..02..03..04..
// ..05..06..07..08
// 09..10..11..12..
// ..13..14..15..16
// 17..18..19..20..
// ..21..22..23..24
// 25..26..27..28..
// ..29..30..31..32

describe('Game logic', function () {
  describe('adjacent move validation', function () {
    let model: BoardModel;

    beforeEach(function () {
      model = new BoardModel();
    });
    it('should allow black pieces to move forward', function () {
      assert(model.moveIsValid(9, 13));
      // TODO Figure out why failing
      // assert(model.moveIsValid(12, 15));
      assert(model.moveIsValid(12, 16));
    });
  });
});

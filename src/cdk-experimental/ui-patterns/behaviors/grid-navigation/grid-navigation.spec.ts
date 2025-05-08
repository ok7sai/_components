import {WritableSignal, signal} from '@angular/core';
import {GridNavigation, GridNavigationInputs} from './grid-navigation';
import {WritableSignalLike} from '../signal-like/signal-like';

describe('GridNavigation Behavior', () => {
  let inputs: GridNavigationInputs;
  let navigation: GridNavigation;
  let activeRow: WritableSignalLike<number>;
  let activeCol: WritableSignalLike<number>;

  function setup(
    rows: number,
    cols: number,
    initialRow = 0,
    initialCol = 0,
    disabledCells: {row: number; col: number}[] = [],
    wrapR = true,
    wrapC = true,
  ) {
    activeRow = signal(initialRow);
    activeCol = signal(initialCol);
    inputs = {
      activeRowIndex: activeRow,
      activeColIndex: activeCol,
      rowCount: signal(rows),
      colCount: signal(cols),
      isCellDisabled: (r, c) => disabledCells.some(dc => dc.row === r && dc.col === c),
      wrapRows: signal(wrapR),
      wrapCols: signal(wrapC),
    };
    navigation = new GridNavigation(inputs);
  }

  describe('Column Navigation', () => {
    beforeEach(() => setup(3, 3));

    it('should move to next column', () => {
      navigation.moveCol(1);
      expect(activeCol()).toBe(1);
    });

    it('should move to previous column', () => {
      activeCol.set(1);
      navigation.moveCol(-1);
      expect(activeCol()).toBe(0);
    });

    it('should wrap to first column when moving next from last if wrapCols is true', () => {
      activeCol.set(2);
      navigation.moveCol(1);
      expect(activeCol()).toBe(0);
    });

    it('should wrap to last column when moving prev from first if wrapCols is true', () => {
      navigation.moveCol(-1);
      expect(activeCol()).toBe(2);
    });

    it('should not wrap if wrapCols is false', () => {
      (inputs.wrapCols as WritableSignal<boolean>).set(false);
      activeCol.set(2);
      navigation.moveCol(1);
      expect(activeCol()).toBe(2); // Stays at last

      activeCol.set(0);
      navigation.moveCol(-1);
      expect(activeCol()).toBe(0); // Stays at first
    });

    it('should skip disabled cells when moving next', () => {
      setup(3, 4, 0, 0, [{row: 0, col: 1}]); // Cell (0,1) is disabled
      navigation.moveCol(1);
      expect(activeCol()).toBe(2);
    });

    it('should skip disabled cells when moving prev', () => {
      setup(3, 4, 0, 2, [{row: 0, col: 1}]); // Cell (0,1) is disabled
      navigation.moveCol(-1);
      expect(activeCol()).toBe(0);
    });

    it('should not move if all subsequent cells in row are disabled and no wrap', () => {
      setup(
        3,
        3,
        0,
        0,
        [
          {row: 0, col: 1},
          {row: 0, col: 2},
        ],
        true,
        false,
      );
      const moved = navigation.moveCol(1);
      expect(activeCol()).toBe(0);
      expect(moved).toBeFalse();
    });
  });

  describe('Row Navigation', () => {
    beforeEach(() => setup(3, 3));

    it('should move to next row', () => {
      navigation.moveRow(1);
      expect(activeRow()).toBe(1);
    });

    it('should move to previous row', () => {
      activeRow.set(1);
      navigation.moveRow(-1);
      expect(activeRow()).toBe(0);
    });

    it('should wrap to first row when moving next from last if wrapRows is true', () => {
      activeRow.set(2);
      navigation.moveRow(1);
      expect(activeRow()).toBe(0);
    });

    it('should wrap to last row when moving prev from first if wrapRows is true', () => {
      navigation.moveRow(-1);
      expect(activeRow()).toBe(2);
    });

    it('should not wrap if wrapRows is false', () => {
      (inputs.wrapRows as WritableSignal<boolean>).set(false);
      activeRow.set(2);
      navigation.moveRow(1);
      expect(activeRow()).toBe(2); // Stays at last

      activeRow.set(0);
      navigation.moveRow(-1);
      expect(activeRow()).toBe(0); // Stays at first
    });

    it('should skip disabled cells when moving next row', () => {
      setup(4, 3, 0, 0, [{row: 1, col: 0}]); // Cell (1,0) is disabled
      navigation.moveRow(1);
      expect(activeRow()).toBe(2);
    });

    it('should skip disabled cells when moving prev row', () => {
      setup(4, 3, 2, 0, [{row: 1, col: 0}]); // Cell (1,0) is disabled
      navigation.moveRow(-1);
      expect(activeRow()).toBe(0);
    });
  });

  describe('Home/End Navigation', () => {
    it('firstInRow: should move to first enabled col in current row', () => {
      setup(3, 4, 0, 2, [{row: 0, col: 0}]); // (0,0) disabled
      navigation.firstInRow();
      expect(activeCol()).toBe(1);
      expect(activeRow()).toBe(0);
    });

    it('lastInRow: should move to last enabled col in current row', () => {
      setup(3, 4, 0, 0, [{row: 0, col: 3}]); // (0,3) disabled
      navigation.lastInRow();
      expect(activeCol()).toBe(2);
      expect(activeRow()).toBe(0);
    });

    it('firstInGrid: should move to first enabled cell in grid', () => {
      setup(3, 3, 1, 1, [
        {row: 0, col: 0},
        {row: 0, col: 1},
      ]); // (0,0), (0,1) disabled
      navigation.firstInGrid();
      expect(activeRow()).toBe(0);
      expect(activeCol()).toBe(2);
    });

    it('lastInGrid: should move to last enabled cell in grid', () => {
      setup(3, 3, 0, 0, [
        {row: 2, col: 2},
        {row: 2, col: 1},
      ]); // (2,2), (2,1) disabled
      navigation.lastInGrid();
      expect(activeRow()).toBe(2);
      expect(activeCol()).toBe(0);
    });

    it('firstInRow: should not move if already at first enabled cell', () => {
      setup(3, 3, 0, 0);
      const moved = navigation.firstInRow();
      expect(activeCol()).toBe(0);
      expect(moved).toBeFalse();
    });

    it('lastInRow: should not move if already at last enabled cell', () => {
      setup(3, 3, 0, 2);
      const moved = navigation.lastInRow();
      expect(activeCol()).toBe(2);
      expect(moved).toBeFalse();
    });
  });

  describe('Goto Navigation', () => {
    beforeEach(() => setup(3, 3));

    it('should move to specified cell if enabled', () => {
      navigation.goto(1, 1);
      expect(activeRow()).toBe(1);
      expect(activeCol()).toBe(1);
    });

    it('should not move to specified cell if disabled', () => {
      setup(3, 3, 0, 0, [{row: 1, col: 1}]);
      const moved = navigation.goto(1, 1);
      expect(activeRow()).toBe(0);
      expect(activeCol()).toBe(0);
      expect(moved).toBeFalse();
    });

    it('should clamp to boundaries', () => {
      navigation.goto(5, 5);
      expect(activeRow()).toBe(2);
      expect(activeCol()).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should not move in a 1x1 grid if cell is disabled', () => {
      setup(1, 1, 0, 0, [{row: 0, col: 0}]);
      expect(navigation.moveCol(1)).toBeFalse();
      expect(navigation.moveRow(1)).toBeFalse();
      expect(navigation.firstInGrid()).toBeFalse();
    });

    it('should handle empty grid gracefully', () => {
      setup(0, 0);
      expect(navigation.moveCol(1)).toBeFalse();
      expect(navigation.moveRow(1)).toBeFalse();
      expect(navigation.firstInGrid()).toBeFalse();
      expect(navigation.lastInGrid()).toBeFalse();
      expect(navigation.goto(0, 0)).toBeFalse();
    });
  });
});

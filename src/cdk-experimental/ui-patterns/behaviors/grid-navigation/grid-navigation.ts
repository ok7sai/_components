/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SignalLike, WritableSignalLike} from '../signal-like/signal-like';

/** Inputs required for the GridNavigation behavior. */
export interface GridNavigationInputs {
  /** The currently active row index. */
  activeRowIndex: WritableSignalLike<number>;
  /** The currently active column index. */
  activeColIndex: WritableSignalLike<number>;
  /** The total number of rows in the grid. */
  rowCount: SignalLike<number>;
  /** The total number of columns in the grid. */
  colCount: SignalLike<number>;
  /**
   * A function to check if a cell at given coordinates is disabled.
   * If not provided, all cells are considered navigable.
   */
  isCellDisabled?: (rowIndex: number, colIndex: number) => boolean;
  /** Whether navigation should wrap around rows. */
  wrapRows: SignalLike<boolean>;
  /** Whether navigation should wrap around columns. */
  wrapCols: SignalLike<boolean>;
}

/**
 * Manages 2D navigation logic for a grid-like structure.
 * It updates active row and column indices based on navigation actions.
 */
export class GridNavigation {
  constructor(readonly inputs: GridNavigationInputs) {}

  /**
   * Moves the active position to the next valid cell in the specified column direction.
   * @param colDelta -1 for previous column, 1 for next column.
   * @returns True if the active position changed, false otherwise.
   */
  moveCol(colDelta: -1 | 1): boolean {
    const {activeRowIndex, activeColIndex, colCount, wrapCols, isCellDisabled} = this.inputs;
    let currentRow = activeRowIndex();
    let currentCol = activeColIndex();
    const initialCol = currentCol;
    const numCols = colCount();

    if (numCols <= 0) return false;

    let attempts = 0;
    const maxAttempts = numCols; // Prevent infinite loop if all cells in row are disabled

    do {
      currentCol += colDelta;

      if (currentCol < 0) {
        if (wrapCols()) {
          currentCol = numCols - 1;
        } else {
          currentCol = 0;
          if (initialCol === 0) return false; // Already at the boundary
        }
      } else if (currentCol >= numCols) {
        if (wrapCols()) {
          currentCol = 0;
        } else {
          currentCol = numCols - 1;
          if (initialCol === numCols - 1) return false; // Already at the boundary
        }
      }
      attempts++;
    } while (
      isCellDisabled?.(currentRow, currentCol) &&
      attempts < maxAttempts &&
      (wrapCols() ||
        (currentCol !== initialCol && (colDelta === 1 ? currentCol < numCols - 1 : currentCol > 0)))
    );

    if (!isCellDisabled?.(currentRow, currentCol) && currentCol !== activeColIndex()) {
      activeColIndex.set(currentCol);
      return true;
    }
    // If we wrapped and landed on the initial column and it's disabled, or couldn't find a valid cell
    if (currentCol === initialCol && isCellDisabled?.(currentRow, currentCol)) {
      return false;
    }
    // If we didn't move because we hit a boundary and didn't wrap
    if (
      currentCol === activeColIndex() &&
      !wrapCols() &&
      (currentCol === 0 || currentCol === numCols - 1) &&
      currentCol === initialCol
    ) {
      // If the only cell is disabled, we shouldn't move.
      if (numCols === 1 && isCellDisabled?.(currentRow, currentCol)) return false;
      // If we are at a boundary and the cell is not disabled, but it's the same cell, we didn't move.
      // However, if the initial cell was different, it means we moved to the boundary.
      // This case is tricky. The loop condition should ideally handle it.
      // Let's assume if currentCol didn't change from activeColIndex(), no "successful" move happened to a *new* cell.
      // But if it did change from initialCol, a move to boundary occurred.
      // The final check `currentCol !== activeColIndex()` handles this.
    }

    if (currentCol !== activeColIndex()) {
      activeColIndex.set(currentCol);
      return true;
    }

    return false;
  }

  /**
   * Moves the active position to the next valid cell in the specified row direction.
   * @param rowDelta -1 for previous row, 1 for next row.
   * @returns True if the active position changed, false otherwise.
   */
  moveRow(rowDelta: -1 | 1): boolean {
    const {activeRowIndex, activeColIndex, rowCount, wrapRows, isCellDisabled} = this.inputs;
    let currentRow = activeRowIndex();
    let currentCol = activeColIndex();
    const initialRow = currentRow;
    const numRows = rowCount();

    if (numRows <= 0) return false;

    let attempts = 0;
    const maxAttempts = numRows;

    do {
      currentRow += rowDelta;

      if (currentRow < 0) {
        if (wrapRows()) {
          currentRow = numRows - 1;
        } else {
          currentRow = 0;
          if (initialRow === 0) return false;
        }
      } else if (currentRow >= numRows) {
        if (wrapRows()) {
          currentRow = 0;
        } else {
          currentRow = numRows - 1;
          if (initialRow === numRows - 1) return false;
        }
      }
      attempts++;
    } while (
      isCellDisabled?.(currentRow, currentCol) &&
      attempts < maxAttempts &&
      (wrapRows() ||
        (currentRow !== initialRow && (rowDelta === 1 ? currentRow < numRows - 1 : currentRow > 0)))
    );

    if (!isCellDisabled?.(currentRow, currentCol) && currentRow !== activeRowIndex()) {
      activeRowIndex.set(currentRow);
      return true;
    }
    if (currentRow === initialRow && isCellDisabled?.(currentRow, currentCol)) {
      return false;
    }

    if (currentRow !== activeRowIndex()) {
      activeRowIndex.set(currentRow);
      return true;
    }
    return false;
  }

  /**
   * Moves to the first non-disabled cell in the current row.
   * @returns True if the active position changed, false otherwise.
   */
  firstInRow(): boolean {
    const {activeRowIndex, activeColIndex, colCount, isCellDisabled} = this.inputs;
    const currentRow = activeRowIndex();
    const numCols = colCount();
    if (numCols <= 0) return false;

    for (let c = 0; c < numCols; c++) {
      if (!isCellDisabled?.(currentRow, c)) {
        if (c !== activeColIndex()) {
          activeColIndex.set(c);
          return true;
        }
        return false; // Already at the first valid cell
      }
    }
    return false; // No enabled cell in row
  }

  /**
   * Moves to the last non-disabled cell in the current row.
   * @returns True if the active position changed, false otherwise.
   */
  lastInRow(): boolean {
    const {activeRowIndex, activeColIndex, colCount, isCellDisabled} = this.inputs;
    const currentRow = activeRowIndex();
    const numCols = colCount();
    if (numCols <= 0) return false;

    for (let c = numCols - 1; c >= 0; c--) {
      if (!isCellDisabled?.(currentRow, c)) {
        if (c !== activeColIndex()) {
          activeColIndex.set(c);
          return true;
        }
        return false; // Already at the last valid cell
      }
    }
    return false; // No enabled cell in row
  }

  /**
   * Moves to the first non-disabled cell in the first row.
   * @returns True if the active position changed, false otherwise.
   */
  firstInGrid(): boolean {
    const {activeRowIndex, activeColIndex, rowCount, colCount, isCellDisabled} = this.inputs;
    const numRows = rowCount();
    const numCols = colCount();
    if (numRows <= 0 || numCols <= 0) return false;

    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        if (!isCellDisabled?.(r, c)) {
          if (r !== activeRowIndex() || c !== activeColIndex()) {
            activeRowIndex.set(r);
            activeColIndex.set(c);
            return true;
          }
          return false; // Already at the first valid cell in grid
        }
      }
    }
    return false; // No enabled cell in grid
  }

  /**
   * Moves to the last non-disabled cell in the last row.
   * @returns True if the active position changed, false otherwise.
   */
  lastInGrid(): boolean {
    const {activeRowIndex, activeColIndex, rowCount, colCount, isCellDisabled} = this.inputs;
    const numRows = rowCount();
    const numCols = colCount();
    if (numRows <= 0 || numCols <= 0) return false;

    for (let r = numRows - 1; r >= 0; r--) {
      for (let c = numCols - 1; c >= 0; c--) {
        if (!isCellDisabled?.(r, c)) {
          if (r !== activeRowIndex() || c !== activeColIndex()) {
            activeRowIndex.set(r);
            activeColIndex.set(c);
            return true;
          }
          return false; // Already at the last valid cell in grid
        }
      }
    }
    return false; // No enabled cell in grid
  }

  /**
   * Attempts to move to the specified cell coordinates.
   * Does not move if the target cell is disabled.
   * @param rowIndex The target row index.
   * @param colIndex The target column index.
   * @returns True if the active position changed, false otherwise.
   */
  goto(rowIndex: number, colIndex: number): boolean {
    const {activeRowIndex, activeColIndex, rowCount, colCount, isCellDisabled} = this.inputs;

    const r = Math.max(0, Math.min(rowIndex, rowCount() - 1));
    const c = Math.max(0, Math.min(colIndex, colCount() - 1));

    if (isCellDisabled?.(r, c)) {
      return false;
    }

    if (r !== activeRowIndex() || c !== activeColIndex()) {
      activeRowIndex.set(r);
      activeColIndex.set(c);
      return true;
    }
    return false;
  }
}

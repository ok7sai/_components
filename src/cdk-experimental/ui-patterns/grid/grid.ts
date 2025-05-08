/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {SignalLike, WritableSignalLike} from '../behaviors/signal-like/signal-like';
import {GridNavigation, GridNavigationInputs} from '../behaviors/grid-navigation/grid-navigation';
import {GridRowPattern} from './grid-row';
import {ModifierKey} from '../behaviors/event-manager/event-manager';
import {KeyboardEventManager} from '../behaviors/event-manager/keyboard-event-manager';

/** Inputs for the main GridPattern. */
export interface GridPatternInputs {
  /** A global unique identifier for the grid element. */
  id: SignalLike<string>;
  /** The HTML element that represents the grid container. */
  element: SignalLike<HTMLElement | undefined>;
  /** The rows contained within this grid. */
  rows: SignalLike<GridRowPattern[]>;
  /** Whether the entire grid is disabled. */
  disabled: SignalLike<boolean>;
  /** Whether the grid is read-only (no editing capabilities). */
  readonly: SignalLike<boolean>; // For now, assumed true
  /** Whether navigation should wrap around rows. */
  wrapRows?: SignalLike<boolean>;
  /** Whether navigation should wrap around columns. */
  wrapCols?: SignalLike<boolean>;
  /** Initial active row index. Defaults to 0. */
  initialActiveRowIndex?: number;
  /** Initial active column index. Defaults to 0. */
  initialActiveColIndex?: number;
}

/**
 * UI Pattern for an ARIA Grid.
 * Manages a collection of rows and cells, handles keyboard navigation using GridNavigation,
 * and orchestrates ARIA attributes for the grid and its descendants.
 *
 * @ARIA Grid Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
export class GridPattern {
  readonly id: SignalLike<string>;
  readonly element: SignalLike<HTMLElement | undefined>;
  readonly rows: SignalLike<GridRowPattern[]>;
  readonly disabled: SignalLike<boolean>;
  readonly readonly: SignalLike<boolean>;

  /** The 0-based index of the currently active row. */
  readonly activeRowIndex: WritableSignalLike<number>;
  /** The 0-based index of the currently active column. */
  readonly activeColIndex: WritableSignalLike<number>;

  /** The navigation behavior instance. */
  readonly navigation: GridNavigation;

  constructor(readonly inputs: GridPatternInputs) {
    this.id = inputs.id;
    this.element = inputs.element;
    this.rows = inputs.rows;
    this.disabled = inputs.disabled;
    this.readonly = inputs.readonly;

    this.activeRowIndex = signal(inputs.initialActiveRowIndex ?? 0);
    this.activeColIndex = signal(inputs.initialActiveColIndex ?? 0);

    const navigationInputs: GridNavigationInputs = {
      activeRowIndex: this.activeRowIndex,
      activeColIndex: this.activeColIndex,
      rowCount: computed(() => this.rows().length),
      colCount: computed(() => this.rows()[0]?.cells().length ?? 0),
      isCellDisabled: (r, c) => this.rows()[r]?.cells()[c]?.disabled() ?? true,
      wrapRows: inputs.wrapRows ?? signal(true),
      wrapCols: inputs.wrapCols ?? signal(true),
    };
    this.navigation = new GridNavigation(navigationInputs);
  }

  /** Total number of rows in the grid. */
  rowCount = computed(() => this.rows().length);
  /** Total number of columns in the grid (assumes all rows have same number of columns). */
  colCount = computed(() => this.rows()[0]?.cells().length ?? 0);

  /** The currently active cell pattern, if one exists. */
  activeCell = computed(() => {
    const rows = this.rows();
    const r = this.activeRowIndex();
    const c = this.activeColIndex();
    return rows[r]?.cells()[c];
  });

  /**
   * Checks if the cell at the given coordinates is the currently active one.
   * @param rowIndex The row index to check.
   * @param colIndex The column index to check.
   * @returns True if the cell at (rowIndex, colIndex) is active.
   */
  isActive(rowIndex: number, colIndex: number): boolean {
    return this.activeRowIndex() === rowIndex && this.activeColIndex() === colIndex;
  }

  /** Manages keydown events for the grid. */
  readonly keydownManager = computed(() => {
    const manager = new KeyboardEventManager();
    if (this.disabled()) return manager;

    manager
      .on('ArrowUp', () => this.navigation.moveRow(-1))
      .on('ArrowDown', () => this.navigation.moveRow(1))
      .on('ArrowLeft', () => this.navigation.moveCol(-1))
      .on('ArrowRight', () => this.navigation.moveCol(1))
      .on('Home', () => this.navigation.firstInRow())
      .on('End', () => this.navigation.lastInRow())
      .on(ModifierKey.Ctrl, 'Home', () => this.navigation.firstInGrid())
      .on(ModifierKey.Ctrl, 'End', () => this.navigation.lastInGrid());
    // Add PageUp/PageDown, Enter/Space for selection/activation later if needed.
    return manager;
  });

  /** Handles keydown events on the grid container. */
  onKeydown(event: KeyboardEvent): void {
    if (!this.disabled()) {
      this.keydownManager().handle(event);
      // Ensure the active cell is focused after navigation if it's not already.
      // This might be better handled by an effect in the directive that calls element.focus()
      // when the active cell's tabindex changes to 0.
      // For now, we assume the directive will handle focusing the cell with tabindex=0.
    }
  }

  /**
   * Sets the grid to its default initial state.
   * Typically, this means activating the first non-disabled cell.
   * Call this after the grid and its cells are initialized.
   */
  setDefaultState(): void {
    if (this.rowCount() > 0 && this.colCount() > 0) {
      if (this.rows()[this.activeRowIndex()]?.cells()[this.activeColIndex()]?.disabled()) {
        // If initial active cell is disabled, find the first enabled one.
        this.navigation.firstInGrid();
      }
      // Ensure the active cell is valid. If firstInGrid didn't move,
      // and current is disabled, there might be no enabled cells.
      // The navigation methods already try to land on enabled cells.
    }
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {GridPattern} from './grid'; // Forward declaration

/** Inputs for a GridCellPattern. */
export interface GridCellInputs {
  /** A global unique identifier for the cell element. */
  id: SignalLike<string>;
  /** The HTML element that represents the cell. */
  element: SignalLike<HTMLElement | undefined>;
  /** The 0-based index of the row this cell belongs to. */
  rowIndex: SignalLike<number>;
  /** The 0-based index of the column this cell belongs to. */
  colIndex: SignalLike<number>;
  /** Whether this cell is disabled. Disabled cells cannot be navigated to. */
  disabled: SignalLike<boolean>;
  /** A reference to the parent GridPattern. */
  gridPattern: SignalLike<GridPattern>;
  /** The type of cell, influencing its ARIA role. */
  cellType?: SignalLike<'gridcell' | 'columnheader' | 'rowheader'>;
}

/**
 * Represents a single cell within a GridPattern.
 * Manages its own state, such as whether it's active (for roving tabindex)
 * and its ARIA attributes.
 */
export class GridCellPattern {
  readonly id: SignalLike<string>;
  readonly element: SignalLike<HTMLElement | undefined>;
  readonly rowIndex: SignalLike<number>;
  readonly colIndex: SignalLike<number>;
  readonly disabled: SignalLike<boolean>;
  readonly gridPattern: SignalLike<GridPattern>;
  readonly cellType: SignalLike<'gridcell' | 'columnheader' | 'rowheader'>;

  constructor(readonly inputs: GridCellInputs) {
    this.id = inputs.id;
    this.element = inputs.element;
    this.rowIndex = inputs.rowIndex;
    this.colIndex = inputs.colIndex;
    this.disabled = inputs.disabled;
    this.gridPattern = inputs.gridPattern;
    this.cellType = inputs.cellType ?? computed(() => 'gridcell' as const);
  }

  /** Whether this cell is the currently active cell in the grid (for roving tabindex). */
  isActive = computed(() => {
    const grid = this.gridPattern();
    return grid.activeRowIndex() === this.rowIndex() && grid.activeColIndex() === this.colIndex();
  });

  /** The tabindex for the cell, enabling roving tabindex. */
  tabindex = computed(() => (this.isActive() ? 0 : -1));

  /** The ARIA role for the cell. */
  role = computed(() => this.cellType());

  /** ARIA column index (1-based). */
  ariaColIndex = computed(() => this.colIndex() + 1);

  // onClick(): void {
  //   if (!this.disabled()) {
  //     this.gridPattern().navigation.goto(this.rowIndex(), this.colIndex());
  //     // Potentially add selection logic here if the grid supports cell selection by click
  //   }
  // }
}

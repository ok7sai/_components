/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {GridCellPattern} from './grid-cell';
import {GridPattern} from './grid'; // Forward declaration

/** Inputs for a GridRowPattern. */
export interface GridRowInputs {
  /** A global unique identifier for the row element. */
  id: SignalLike<string>;
  /** The HTML element that represents the row. */
  element: SignalLike<HTMLElement | undefined>;
  /** The 0-based index of this row within the grid. */
  rowIndex: SignalLike<number>;
  /** The cells contained within this row. */
  cells: SignalLike<GridCellPattern[]>;
  /** A reference to the parent GridPattern. */
  gridPattern: SignalLike<GridPattern>;
}

/**
 * Represents a single row within a GridPattern.
 * Primarily acts as a container for GridCellPatterns and manages row-specific ARIA attributes.
 */
export class GridRowPattern {
  readonly id: SignalLike<string>;
  readonly element: SignalLike<HTMLElement | undefined>;
  readonly rowIndex: SignalLike<number>;
  readonly cells: SignalLike<GridCellPattern[]>;
  readonly gridPattern: SignalLike<GridPattern>;

  constructor(readonly inputs: GridRowInputs) {
    this.id = inputs.id;
    this.element = inputs.element;
    this.rowIndex = inputs.rowIndex;
    this.cells = inputs.cells;
    this.gridPattern = inputs.gridPattern;
  }

  /** ARIA row index (1-based). */
  ariaRowIndex = computed(() => this.rowIndex() + 1);

  /** ARIA colcount for the row, derived from its cells. */
  ariaColCount = computed(() => this.cells().length);
}

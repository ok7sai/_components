/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  ElementRef,
  inject,
  input,
  computed,
  OnInit,
  AfterContentInit,
  contentChildren,
  signal,
  effect,
  untracked,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {GridPattern} from '../ui-patterns/grid/grid';
import {GridRowPattern} from '../ui-patterns/grid/grid-row';
import {GridCellPattern} from '../ui-patterns/grid/grid-cell';

/**
 * Main directive for an ARIA Grid.
 * It orchestrates the grid behavior, manages rows and cells,
 * and applies top-level ARIA attributes.
 */
@Directive({
  selector: '[cdkGrid]',
  exportAs: 'cdkGrid',
  host: {
    '[attr.id]': 'pattern.id()',
    'role': 'grid',
    '[attr.aria-readonly]': 'pattern.readonly() || null',
    '[attr.aria-disabled]': 'pattern.disabled() || null',
    '[attr.aria-rowcount]': 'pattern.rowCount() > 0 ? pattern.rowCount() : null',
    '[attr.aria-colcount]': 'pattern.colCount() > 0 ? pattern.colCount() : null',
    '(keydown)': 'pattern.onKeydown($event)',
    // '[attr.aria-multiselectable]': 'pattern.multiSelectable() || null', // For selection later
    // No tabindex on grid itself if cells are focusable (roving tabindex)
    // If using aria-activedescendant, grid would have tabindex="0"
    // and '[attr.aria-activedescendant]': 'pattern.activeDescendant() || null',
  },
})
export class CdkGridDirective implements OnInit, AfterContentInit {
  private readonly _elementRef = inject(ElementRef<HTMLElement>);
  private readonly _idGenerator = inject(_IdGenerator);

  /** Whether the entire grid is disabled. */
  readonly disabled = input(false, {
    transform: (v: boolean | string) => (typeof v === 'string' ? v === '' || v === 'true' : v),
  });
  /** Whether the grid is read-only. Defaults to true for this version. */
  readonly readonly = input(true, {
    transform: (v: boolean | string) => (typeof v === 'string' ? v === '' || v === 'true' : v),
  });
  /** Whether navigation should wrap around rows. Defaults to true. */
  readonly wrapRows = input(true, {
    transform: (v: boolean | string) => (typeof v === 'string' ? v === '' || v === 'true' : v),
  });
  /** Whether navigation should wrap around columns. Defaults to true. */
  readonly wrapCols = input(true, {
    transform: (v: boolean | string) => (typeof v === 'string' ? v === '' || v === 'true' : v),
  });

  /** Rows within this grid. */
  protected readonly _rows = contentChildren(CdkGridRowDirective);
  protected readonly _rowPatterns = computed(() => this._rows().map(r => r.pattern));

  protected readonly _id = signal(
    this._elementRef.nativeElement.id || this._idGenerator.getId('aria-grid'),
  );

  /** The underlying GridPattern instance. */
  readonly pattern: GridPattern = new GridPattern({
    id: this._id,
    element: signal(this._elementRef.nativeElement),
    rows: this._rowPatterns,
    disabled: this.disabled,
    readonly: this.readonly,
    wrapRows: this.wrapRows,
    wrapCols: this.wrapCols,
    // Initial active indices default to 0,0 in GridPattern if not provided
  });

  ngOnInit(): void {
    if (!this._elementRef.nativeElement.id) {
      this._elementRef.nativeElement.id = this._id();
    }
  }

  ngAfterContentInit(): void {
    // Set initial state, e.g., focus the first navigable cell
    this.pattern.setDefaultState();
  }

  // Optional: Handle click on grid for focus management if needed,
  // though cell clicks are often handled by cells themselves if they are interactive.
  // For a purely navigable grid, clicking a cell might also move active state.
  // The `CdkGridCellDirective`'s `onFocus` handles this by updating the grid's active coords.
}

/**
 * Directive for a row within an CdkGrid.
 * It applies ARIA attributes and acts as a container for CdkGridCellDirectives.
 */
@Directive({
  selector: '[cdkGridRow]',
  exportAs: 'cdkGridRow',
  host: {
    '[attr.id]': 'pattern.id()',
    'role': 'row',
    '[attr.aria-rowindex]': 'pattern.ariaRowIndex()',
    // '[attr.aria-colcount]': 'pattern.ariaColCount()', // APG says colcount can be on grid or row
  },
})
export class CdkGridRowDirective implements OnInit {
  private readonly _elementRef = inject(ElementRef<HTMLElement>);
  private readonly _idGenerator = inject(_IdGenerator);

  /** The parent CdkGridDirective. Expected to be present. */
  protected readonly _parentGrid = inject(CdkGridDirective, {skipSelf: true});

  /** The 0-based index of this row within the grid. */
  readonly rowIndex = input.required<number>({alias: 'ariaRowIndex'});

  /** Cells within this row. */
  protected readonly _cells = contentChildren(CdkGridCellDirective);
  protected readonly _cellPatterns = computed(() => this._cells().map(c => c.pattern));

  protected readonly _id = signal(
    this._elementRef.nativeElement.id || this._idGenerator.getId('aria-grid-row'),
  );

  /** The underlying GridRowPattern instance. */
  readonly pattern: GridRowPattern = new GridRowPattern({
    id: this._id,
    element: signal(this._elementRef.nativeElement),
    rowIndex: this.rowIndex,
    cells: this._cellPatterns,
    gridPattern: computed(() => this._parentGrid.pattern),
  });

  ngOnInit(): void {
    if (!this._elementRef.nativeElement.id) {
      this._elementRef.nativeElement.id = this._id();
    }
  }
}

/**
 * Directive for an individual cell within an CdkGrid.
 * It applies ARIA attributes and manages cell-specific interactions.
 */
@Directive({
  selector: '[cdkGridCell]',
  exportAs: 'cdkGridCell',
  host: {
    '[attr.id]': 'pattern.id()',
    '[attr.role]': 'pattern.role()',
    '[attr.tabindex]': 'pattern.tabindex()',
    '[attr.aria-colindex]': 'pattern.ariaColIndex()',
    '[attr.aria-disabled]': 'pattern.disabled() || null',
    // '[attr.aria-selected]': 'pattern.selected() || null', // For selection later
    '(focus)': 'onFocus()',
  },
})
export class CdkGridCellDirective implements OnInit {
  private readonly _elementRef = inject(ElementRef<HTMLElement>);
  private readonly _idGenerator = inject(_IdGenerator);

  /** The parent CdkGridRowDirective. Expected to be present. */
  protected readonly _parentRow = inject(CdkGridRowDirective, {
    skipSelf: true,
  });
  /** The main CdkGridDirective. Expected to be present. */
  protected readonly _parentGrid = inject(CdkGridDirective, {
    skipSelf: true,
    // If rows are optional, then parentGrid might be found without skipping row
  });

  /** The 0-based column index of this cell within its row. */
  readonly colIndex = input.required<number>({alias: 'ariaColIndex'});
  /** Whether this cell is disabled. */
  readonly disabled = input(false, {
    transform: (v: boolean | string) => (typeof v === 'string' ? v === '' || v === 'true' : v),
  });
  /** The type of cell, influencing its ARIA role. Defaults to 'gridcell'. */
  readonly cellType = input<'gridcell' | 'columnheader' | 'rowheader'>('gridcell', {
    alias: 'ariaCellType',
  });

  protected readonly _id = signal(
    this._elementRef.nativeElement.id || this._idGenerator.getId('aria-grid-cell'),
  );

  /** The underlying GridCellPattern instance. */
  readonly pattern: GridCellPattern = new GridCellPattern({
    id: this._id,
    element: signal(this._elementRef.nativeElement),
    rowIndex: computed(() => this._parentRow.rowIndex()), // Get from parent row directive
    colIndex: this.colIndex,
    disabled: this.disabled,
    gridPattern: computed(() => this._parentGrid.pattern),
    cellType: this.cellType,
  });

  constructor() {
    // Effect to focus the element when it becomes the active one (tabindex changes to 0)
    effect(() => {
      const isActive = this.pattern.isActive();
      const element = this._elementRef.nativeElement;
      untracked(() => {
        // Read grid's disabled state untracked to avoid circularity if focus causes state change
        if (
          isActive &&
          !this._parentGrid.pattern.disabled() &&
          document.activeElement !== element
        ) {
          element.focus();
        }
      });
    });
  }

  ngOnInit(): void {
    if (!this._elementRef.nativeElement.id) {
      this._elementRef.nativeElement.id = this._id();
    }
  }

  /**
   * When a cell receives focus (e.g., through click or programmatically),
   * update the grid's active coordinates to this cell.
   */
  onFocus(): void {
    if (!this.pattern.disabled() && !this._parentGrid.pattern.disabled()) {
      // Only update if this cell is not already the active one
      // This prevents redundant updates if focus is set due to being active
      if (!this.pattern.isActive()) {
        this._parentGrid.pattern.navigation.goto(this.pattern.rowIndex(), this.pattern.colIndex());
      }
    }
  }
}

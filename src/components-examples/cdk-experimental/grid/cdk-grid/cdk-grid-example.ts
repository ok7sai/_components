import {Component} from '@angular/core';
import {
  CdkGridDirective,
  CdkGridRowDirective,
  CdkGridCellDirective,
} from '@angular/cdk-experimental/grid/grid';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

interface CellCoords {
  row: number;
  col: number;
}

/** @title Basic CDK Grid Example */
@Component({
  selector: 'cdk-grid-example',
  exportAs: 'cdkGridExample',
  templateUrl: 'cdk-grid-example.html',
  styleUrl: 'cdk-grid-example.css',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CdkGridDirective,
    CdkGridRowDirective,
    CdkGridCellDirective,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
})
export class CdkGridExample {
  gridDisabled = new FormControl(false, {nonNullable: true});
  gridReadonly = new FormControl(true, {nonNullable: true}); // Matches CdkGridDirective default
  wrapRows = new FormControl(true, {nonNullable: true});
  wrapCols = new FormControl(true, {nonNullable: true});

  gridData: (string | number)[][] = [
    ['Name', 'Age', 'City', 'Country'],
    ['Alice', 30, 'New York', 'USA'],
    ['Bob', 24, 'London', 'UK'],
    ['Charlie', 35, 'Paris', 'France'],
    ['Diana', 28, 'Berlin', 'Germany'],
  ];

  allCellsFlat: {label: string; value: CellCoords}[] = [];
  // Example: Disable cell (Alice, City) which is (1,2) and (Charlie, Age) which is (3,1)
  initialDisabledCells: CellCoords[] = [
    {row: 1, col: 2},
    {row: 3, col: 1},
  ];
  disabledCellsControl = new FormControl<CellCoords[]>(this.initialDisabledCells);

  constructor() {
    this.gridData.forEach((row, rIndex) => {
      row.forEach((_cell, cIndex) => {
        this.allCellsFlat.push({
          label: `R${rIndex}C${cIndex} (${this.gridData[rIndex][cIndex]})`,
          value: {row: rIndex, col: cIndex},
        });
      });
    });
  }

  isCellDisabled(rowIndex: number, colIndex: number): boolean {
    return !!this.disabledCellsControl.value?.some(
      cell => cell.row === rowIndex && cell.col === colIndex,
    );
  }

  getCellType(rowIndex: number, colIndex: number): 'gridcell' | 'columnheader' | 'rowheader' {
    if (rowIndex === 0) {
      return 'columnheader';
    }
    // Example: Make first column cells (excluding the column header) as row headers
    // if (colIndex === 0) {
    //   return 'rowheader';
    // }
    return 'gridcell';
  }

  compareCellCoords(c1: CellCoords, c2: CellCoords): boolean {
    return c1 && c2 ? c1.row === c2.row && c1.col === c2.col : c1 === c2;
  }
}

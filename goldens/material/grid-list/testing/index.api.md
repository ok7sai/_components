## API Report File for "@angular/material_grid-list_testing"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness } from '@angular/cdk/testing';
import { ContentContainerComponentHarness } from '@angular/cdk/testing';
import { HarnessPredicate } from '@angular/cdk/testing';

// @public
export interface GridListHarnessFilters extends BaseHarnessFilters {
}

// @public
export interface GridTileHarnessFilters extends BaseHarnessFilters {
    footerText?: string | RegExp;
    headerText?: string | RegExp;
}

// @public
export class MatGridListHarness extends ComponentHarness {
    getColumns(): Promise<number>;
    getTileAtPosition({ row, column, }: {
        row: number;
        column: number;
    }): Promise<MatGridTileHarness>;
    getTiles(filters?: GridTileHarnessFilters): Promise<MatGridTileHarness[]>;
    static hostSelector: string;
    static with(options?: GridListHarnessFilters): HarnessPredicate<MatGridListHarness>;
}

// @public
export class MatGridTileHarness extends ContentContainerComponentHarness<MatGridTileSection> {
    getColspan(): Promise<number>;
    getFooterText(): Promise<string | null>;
    getHeaderText(): Promise<string | null>;
    getRowspan(): Promise<number>;
    hasAvatar(): Promise<boolean>;
    hasFooter(): Promise<boolean>;
    hasHeader(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: GridTileHarnessFilters): HarnessPredicate<MatGridTileHarness>;
}

// @public
export enum MatGridTileSection {
    // (undocumented)
    FOOTER = ".mat-grid-tile-footer",
    // (undocumented)
    HEADER = ".mat-grid-tile-header"
}

// (No @packageDocumentation comment for this package)

```

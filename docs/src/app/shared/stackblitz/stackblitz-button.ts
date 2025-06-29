/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Input, NgZone, inject} from '@angular/core';
import {ExampleData} from '@angular/components-examples';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {StackBlitzWriter} from './stackblitz-writer';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'stackblitz-button',
  templateUrl: './stackblitz-button.html',
  imports: [MatIconButton, MatTooltip, MatIcon],
})
export class StackblitzButton {
  private _stackBlitzWriter = inject(StackBlitzWriter);
  private _ngZone = inject(NgZone);
  private _snackBar = inject(MatSnackBar);

  exampleData: ExampleData | undefined;

  /**
   * Function that can be invoked to open the StackBlitz window synchronously.
   *
   * **Note**: All files for the StackBlitz need to be loaded and prepared ahead-of-time,
   * because doing so on-demand will cause Firefox to block the submit as a popup as the
   * form submission (used internally to create the StackBlitz) didn't happen within the
   * same tick as the user interaction.
   */
  private _openStackBlitzFn: (() => void) | null = null;

  @Input()
  set example(exampleId: string | undefined) {
    if (exampleId) {
      this.exampleData = new ExampleData(exampleId);
      this._prepareStackBlitzForExample(exampleId, this.exampleData);
    } else {
      this.exampleData = undefined;
      this._openStackBlitzFn = null;
    }
  }

  openStackBlitz(): void {
    if (this._openStackBlitzFn) {
      this._openStackBlitzFn();
    } else {
      this._snackBar.open(
        'StackBlitz is not ready yet. Please try again in a few seconds.',
        undefined,
        {duration: 5000},
      );
    }
  }

  private _prepareStackBlitzForExample(exampleId: string, data: ExampleData): void {
    this._ngZone.runOutsideAngular(async () => {
      const isTest = exampleId.includes('harness');
      this._openStackBlitzFn = await this._stackBlitzWriter.createStackBlitzForExample(
        exampleId,
        data,
        isTest,
      );
    });
  }
}

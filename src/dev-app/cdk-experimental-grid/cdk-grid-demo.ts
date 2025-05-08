/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CdkGridExample} from '@angular/components-examples/cdk-experimental/grid';

@Component({
  templateUrl: 'cdk-grid-demo.html',
  imports: [CdkGridExample],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkExperimentalGridDemo {}

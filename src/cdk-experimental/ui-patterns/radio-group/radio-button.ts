/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {ListSelectionItem} from '../behaviors/list-selection/list-selection';
import {ListNavigationItem} from '../behaviors/list-navigation/list-navigation';
import {ListFocusItem} from '../behaviors/list-focus/list-focus';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import type {RadioGroupPatternType} from './radio-group';

/** Represents the required inputs for a radio button in a radio group. */
export interface RadioButtonInputs<V>
  extends ListNavigationItem,
    ListSelectionItem<V>,
    ListFocusItem {
  /** A reference to the parent radio group. */
  group: SignalLike<RadioGroupPatternType<V> | undefined>;
}

/** Represents a radio button within a radio group. */
export class RadioButtonPattern<V> {
  /** A unique identifier for the radio button. */
  id: SignalLike<string>;

  /** The value associated with the radio button. */
  value: SignalLike<V>;

  /** The position of the radio button within the group. */
  index = computed(
    () =>
      this.group()
        ?.navigation.inputs.items()
        .findIndex(i => i.id() === this.id()) ?? -1,
  );

  /** Whether the radio button is currently the active one (focused). */
  active = computed(() => this.group()?.focusManager.activeItem() === this);

  /** Whether the radio button is selected. */
  selected: SignalLike<boolean> = computed(
    () => !!this.group()?.selection.inputs.value().includes(this.value()),
  );

  /** Whether the radio button is disabled. */
  disabled: SignalLike<boolean>;

  /** A reference to the parent radio group. */
  group: SignalLike<RadioGroupPatternType<V> | undefined>;

  /** The tabindex of the radio button. */
  tabindex = computed(() => this.group()?.focusManager.getItemTabindex(this));

  /** The HTML element associated with the radio button. */
  element: SignalLike<HTMLElement>;

  constructor(readonly inputs: RadioButtonInputs<V>) {
    this.id = inputs.id;
    this.value = inputs.value;
    this.group = inputs.group;
    this.element = inputs.element;
    this.disabled = inputs.disabled;
  }
}

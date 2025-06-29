/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="google.maps" preserve="true" />

import {Marker} from '../marker-utilities';

// This file duplicates the necessary types from the `@googlemaps/markerclusterer`
// package which isn't available for use internally.

// tslint:disable

export interface ClusterOptions {
  position?: google.maps.LatLng | google.maps.LatLngLiteral;
  markers?: Marker[];
}

export interface Cluster {
  marker?: Marker;
  readonly markers?: Marker[];
  bounds?: google.maps.LatLngBounds;
  position: google.maps.LatLng;
  count: number;
  push(marker: Marker): void;
  delete(): void;
  new (options: ClusterOptions): Cluster;
}

export declare class MarkerClusterer extends google.maps.OverlayView {
  onClusterClick: onClusterClickHandler;
  protected algorithm: Algorithm;
  protected clusters: Cluster[];
  protected markers: Marker[];
  protected renderer: Renderer;
  protected map: google.maps.Map | null;
  protected idleListener: google.maps.MapsEventListener;
  constructor({
    map,
    markers,
    algorithmOptions,
    algorithm,
    renderer,
    onClusterClick,
  }: MarkerClustererOptions);
  addMarker(marker: Marker, noDraw?: boolean): void;
  addMarkers(markers: Marker[], noDraw?: boolean): void;
  removeMarker(marker: Marker, noDraw?: boolean): boolean;
  removeMarkers(markers: Marker[], noDraw?: boolean): boolean;
  clearMarkers(noDraw?: boolean): void;
  render(): void;
  onAdd(): void;
  onRemove(): void;
  protected reset(): void;
  protected renderClusters(): void;
}

export type onClusterClickHandler = (
  event: google.maps.MapMouseEvent,
  cluster: Cluster,
  map: google.maps.Map,
) => void;

export interface MarkerClustererOptions {
  markers?: Marker[];
  /**
   * An algorithm to cluster markers. Default is `SuperClusterAlgorithm`. Must
   * provide a `calculate` method accepting `AlgorithmInput` and returning
   * an array of `Cluster`.
   */
  algorithm?: Algorithm;
  algorithmOptions?: AlgorithmOptions;
  map?: google.maps.Map | null;
  /**
   * An object that converts a `Cluster` into a `google.maps.Marker`.
   * Default is `DefaultRenderer`.
   */
  renderer?: Renderer;
  onClusterClick?: onClusterClickHandler;
}

export declare enum MarkerClustererEvents {
  CLUSTERING_BEGIN = 'clusteringbegin',
  CLUSTERING_END = 'clusteringend',
  CLUSTER_CLICK = 'click',
}

export declare const defaultOnClusterClickHandler: onClusterClickHandler;

export interface Renderer {
  /**
   * Turn a `Cluster` into a `Marker`.
   *
   * Below is a simple example to create a marker with the number of markers in the cluster as a label.
   *
   * ```typescript
   * return new google.maps.Marker({
   *   position,
   *   label: String(markers.length),
   * });
   * ```
   */
  render(cluster: Cluster, stats: ClusterStats, map: google.maps.Map): Marker;
}

export interface ClusterStats {
  markers: {
    sum: number;
  };
  clusters: {
    count: number;
    markers: {
      mean: number;
      sum: number;
      min: number;
      max: number;
    };
  };
  new (markers: Marker[], clusters: Cluster[]): ClusterStats;
}

export interface Algorithm {
  /**
   * Calculates an array of `Cluster`.
   */
  calculate: ({markers, map}: AlgorithmInput) => AlgorithmOutput;
}

export interface AlgorithmOptions {
  maxZoom?: number;
}

export interface AlgorithmInput {
  /**
   * The map containing the markers and clusters.
   */
  map: google.maps.Map;
  /**
   * An array of markers to be clustered.
   *
   * There are some specific edge cases to be aware of including the following:
   * * Markers that are not visible.
   */
  markers: Marker[];
  /**
   * The `mapCanvasProjection` enables easy conversion from lat/lng to pixel.
   *
   * @see [MapCanvasProjection](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#MapCanvasProjection)
   */
  mapCanvasProjection: google.maps.MapCanvasProjection;
}

export interface AlgorithmOutput {
  /**
   * The clusters returned based upon the `AlgorithmInput`.
   */
  clusters: Cluster[];
  /**
   * A boolean flag indicating that the clusters have not changed.
   */
  changed?: boolean;
}

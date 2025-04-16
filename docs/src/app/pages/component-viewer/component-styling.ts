import {Component, inject, Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';
import {AsyncPipe} from '@angular/common';
import {Observable, of} from 'rxjs';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {ComponentViewer} from './component-viewer';
import {DocItem} from '../../shared/documentation-items/documentation-items';
import {Token, TokenTable} from './token-table';

interface StyleOverridesData {
  example: string | null;
  themes: {
    name: string;
    overridesMixin: string;
    tokens: Token[];
  }[];
}

@Injectable({providedIn: 'root'})
class TokenService {
  private _http = inject(HttpClient);

  private _cache: Record<string, Observable<StyleOverridesData>> = {};

  getTokenData(item: DocItem): Observable<StyleOverridesData> {
    if (item.packageName !== 'material') {
      console.error('Requested styling token data for package without token data.');
      return of({example: null, themes: []});
    }
    const url = `/assets/tokens/tokens/${item.id}/${item.id}.json`;

    if (this._cache[url]) {
      return this._cache[url];
    }

    const stream = this._http.get<StyleOverridesData>(url).pipe(shareReplay(1));
    this._cache[url] = stream;
    return stream;
  }
}

@Component({
  selector: 'component-styling',
  templateUrl: './component-styling.html',
  imports: [AsyncPipe, TokenTable],
})
export class ComponentStyling {
  private componentViewer = inject(ComponentViewer);
  private tokenService = inject(TokenService);
  private domSanitizer = inject(DomSanitizer);
  protected docItem = this.componentViewer.componentDocItem;
  protected dataStream = this.docItem.pipe(switchMap(item => this.tokenService.getTokenData(item)));
  protected hasDataStream = this.dataStream.pipe(
    map(data => data.themes.length > 0 && data.themes.some(d => d.tokens.length > 0)),
  );

  protected exampleStream = this.dataStream.pipe(
    map(data => (data.example ? this.domSanitizer.bypassSecurityTrustHtml(data.example) : null)),
  );
}

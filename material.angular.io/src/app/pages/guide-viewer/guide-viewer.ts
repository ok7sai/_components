import {Component, NgModule, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterModule, Routes} from '@angular/router';
import {GuideItem, GuideItems} from '../../shared/guide-items/guide-items';
import {Footer} from '../../shared/footer/footer';

import {ComponentPageTitle} from '../page-title/page-title';
import {NavigationFocus} from '../../shared/navigation-focus/navigation-focus';
import {TableOfContents} from '../../shared/table-of-contents/table-of-contents';
import {DocViewer} from '../../shared/doc-viewer/doc-viewer';

@Component({
  selector: 'guide-viewer',
  templateUrl: './guide-viewer.html',
  styleUrls: ['./guide-viewer.scss'],
  standalone: true,
  imports: [DocViewer, NavigationFocus, TableOfContents, Footer],
  host: {
    'class': 'main-content',
  },
})
export class GuideViewer implements OnInit {
  guide: GuideItem | undefined;

  constructor(
    _route: ActivatedRoute,
    private _componentPageTitle: ComponentPageTitle,
    private _router: Router,
    public guideItems: GuideItems,
  ) {
    _route.params.subscribe(p => {
      const guideItem = guideItems.getItemById(p['id']);
      if (guideItem) {
        this.guide = guideItem;
      }

      if (!this.guide) {
        this._router.navigate(['/guides']);
      }
    });
  }

  ngOnInit(): void {
    if (this.guide !== undefined) {
      this._componentPageTitle.title = this.guide.name;
    }
  }
}

const routes: Routes = [{path: '', component: GuideViewer}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class GuideViewerModule {}

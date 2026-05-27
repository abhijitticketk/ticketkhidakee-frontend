import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiService } from './Services/api.service';
import { SeoService } from './Services/seo.service';

@Injectable({
  providedIn: 'root'
})
export class MetasetResolver implements Resolve<boolean> {
  ImageURL: any = this.apiService.retriveimgUrl;
  constructor(private apiService: ApiService, private seoService: SeoService) { }
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const playId = route.paramMap.get('id');
    const cityId = route.queryParamMap.get('cityId') ?? '0';

    if (!playId) {
      return of(null);
    }

    // SSR DEFAULTS (no localStorage here)
    const memberId = '0';
    const isGuest = 1;

    return this.apiService.getPlayDetailsPage(
      playId,
      cityId,
      memberId,
      isGuest
    ).pipe(
      map(res => {

        // res?.data?.[0] ?? null
        this.setMetaTags(res?.data?.[0]);
      }),
      catchError(() => of(null))
    );
  }
  setMetaTags(event: any) {

    if (event.eventMetaInfo != undefined) {
      var data = event.eventMetaInfo[0];
      var metadata: any = {
        META_TITLE: data.META_NAME != undefined && data.META_NAME != '' && data.META_NAME != 'undefined' ? data.META_NAME : event.EVENT_NAME,
        URL: window.location.href,
        META_DESCRIPTION: data.META_DESCRIPTION != undefined && data.META_DESCRIPTION != '' && data.META_DESCRIPTION != 'undefined'
          ? data.META_DESCRIPTION
          : event.EVENT_NAME,
        META_KEYWORD: data.META_KEYWORDS != undefined && data.META_KEYWORDS != '' && data.META_KEYWORDS != 'undefined' ? data.META_KEYWORDS : event.EVENT_NAME + ',' + event.CATEGORY_NAME + ',' + event.TAGS_NAMES,
        ROBOTS_META_TAG: data.ROBOTS_META_TAG != undefined && data.ROBOTS_META_TAG != '' && data.ROBOTS_META_TAG != 'undefined' ? data.ROBOTS_META_TAG
          : 'index, follow',
        OG_TAG_TITLE: data.OG_TAG_TITLE != undefined && data.OG_TAG_TITLE != '' && data.OG_TAG_TITLE != 'undefined' ? data.OG_TAG_TITLE : event.EVENT_NAME,
        OG_TAG_DESCRIPTION: data.OG_TAG_DESCRIPTION != undefined && data.OG_TAG_DESCRIPTION != '' && data.OG_TAG_DESCRIPTION != 'undefined' ? data.OG_TAG_DESCRIPTION
          : event.EVENT_NAME,
        OG_TAG_IMAGE: data.OG_TAG_IMAGE != undefined && data.OG_TAG_IMAGE != '' && data.OG_TAG_IMAGE != 'undefined' ? data.OG_TAG_IMAGE
          : this.ImageURL + 'eventImages/' + event.EVENT_IMAGE,
        TWITTER_CARD_TYPE: data.TWITTER_CARD_TYPE != undefined && data.TWITTER_CARD_TYPE != '' && data.TWITTER_CARD_TYPE != 'undefined' ? data.TWITTER_CARD_TYPE
          : 'summary_large_image',
      };

      this.seoService.updateMetaTags(metadata);
    }
  }
}

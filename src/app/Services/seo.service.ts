import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { Meta, Title } from "@angular/platform-browser";

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(private meta: Meta, private title: Title, public api: ApiService) { }
  ImageURL: any = this.api.retriveimgUrl


  updateMetaTags(metadata: any) {
    this.title.setTitle(metadata.META_TITLE);
    this.meta.updateTag({ name: 'viewport', content: 'width=device-width, initial-scale=1' });
    this.meta.updateTag({ name: 'robots', content: metadata.ROBOTS_META_TAG });
    this.meta.updateTag({ name: 'description', content: metadata.META_DESCRIPTION });
    this.meta.updateTag({ name: 'keywords', content: metadata.META_KEYWORD });
    this.meta.updateTag({ name: 'twitter:card', content: metadata.TWITTER_CARD_TYPE });
    this.meta.updateTag({ name: 'twitter:title', content: metadata.OG_TAG_TITLE });
    this.meta.updateTag({ name: 'twitter:description', content: metadata.OG_TAG_DESCRIPTION });
    this.meta.updateTag({ name: 'twitter:image', content: metadata.OG_TAG_IMAGE });
    this.meta.updateTag({ name: 'image', content: metadata.IMAGE });
    this.meta.updateTag({ property: 'og:title', content: metadata.OG_TAG_TITLE + ' | Ticket Khidakee' });
    this.meta.updateTag({ property: 'og:description', content: metadata.OG_TAG_DESCRIPTION });
    this.meta.updateTag({ property: 'og:image', content: metadata.OG_TAG_IMAGE });
    this.meta.updateTag({ property: 'og:url', content: metadata.URL });
    this.meta.updateTag({ property: 'og:type', content: 'website' });



    // this.meta.updateTag({ name: 'canonical', content: canonicalUrl });

    // Canonical Tag
    let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    document.head.appendChild(link);
  }
}

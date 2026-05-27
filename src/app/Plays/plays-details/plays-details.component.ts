import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  DomSanitizer,
  SafeHtml
} from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Services/api.service';
import { CommonFunctionService } from 'src/app/Services/CommonFunctionService';
import { LocationService } from 'src/app/Services/location.service';
import { SeoService } from 'src/app/Services/seo.service';
declare var bootstrap: any;
declare var Tugoz: any;
@Component({
  selector: 'app-plays-details',
  templateUrl: './plays-details.component.html',
  styleUrls: ['./plays-details.component.scss'],
})
export class PlaysDetailsComponent {
  @ViewChildren('tooltipRef') tooltipElements!: QueryList<ElementRef>;
  @ViewChild('desc') descEl!: ElementRef<HTMLElement>;
  Loading: boolean = false;
  playName: string;
  playId: string;
  playtype: any;
  PlaysData: any = [];
  averageRating: any;
  interested: any;
  retriveimgUrl = this.apiService.retriveimgUrl;
  @ViewChild('closelogin') closelogin!: ElementRef;
  @ViewChild('closereview') closereview!: ElementRef;
  @ViewChild('carousel', { static: false }) carouselRef!: ElementRef;
  pageIndex = 1;
  pageSize = 4;
  displayedReviews: any[] = [];
  displayedReviews1: any[] = [];
  showMoreButton: boolean[] = [];
  expandedReviews: boolean[] = [];
  allReviewsLoaded: boolean = false;
  isLoading = false;
  reviewscount: any = 0;
  selectedCity: any = this.cookie.get('cityName');

  memberId: any = Number(localStorage.getItem('memberId'));
  expanded = false;
  layoutExpanded = true;
  showToggle: boolean = false;
  dataCount: number = 2;
  mainShowDates: any;
  mainShowTime: any;
  mainShowVenues: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private locationService: LocationService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    private apiService: ApiService,
    private router: Router,
    public userService: CommonFunctionService,
    public cookie: CookieService,
    public seoService: SeoService,
  ) {
    this.playName = this.route.snapshot.paramMap.get('playname') || '';
    this.playId = this.route.snapshot.paramMap.get('id') || '';
  }
  isMobile: any = false;
  isGuest: boolean = false;
  tugozvisible = false;
  tugozcount = 0;
  ismultidate = 0;
  ngOnInit() {
    this.searchLoading = true;
    sessionStorage.setItem('cleanedTerms', '');
    sessionStorage.removeItem('preload');
    this.isMobile = this.apiService.isMobileDevice();
    this.memberId = localStorage.getItem('memberId');
    this.locationService.selectedCity$.subscribe((cityName: any) => {
      if (cityName) {
        this.selectedCityId = cityName.ID;
      }
    });
    this.selectedCityId = Number(this.cookie.get('cityId'));

    this.route.params.subscribe((params) => {
      this.playId = params['id']; // Adjust as per your routing
      // this.playtype = params['playtype'];
      var segments = this.router.url.split('/');
      var dynamicSegment = segments[2];

      this.playName = dynamicSegment;
      // this.getPlayDetails();
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Your method to fetch data
    });

    this.route.queryParams.subscribe(params => {
      this.isGuest = params['guest'] === 'true';

      if (this.isGuest == true) {
        localStorage.setItem('IS_GUEST', 'true');
      } else {
        localStorage.setItem('IS_GUEST', 'false');
      }
    });
    this.getinterests();
    this.getreviewa();
    this.getPlayDetails();
  }

  @ViewChildren('textElement') textElements!: QueryList<ElementRef>;

  ngAfterViewInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // / Initialize tooltips for each element
    this.tooltipElements.forEach((elRef: ElementRef, index: number) => {
      const reviewText = this.playRating[index].REVIEW_TEXT;
      const tooltipHtml = this.generateTooltip(reviewText);

      // Create tooltip for each element
      const tooltip = new bootstrap.Tooltip(elRef.nativeElement, {
        title: tooltipHtml,
        html: true,
        placement: 'top',
        trigger: 'hover',
      });
    });

    // const script = this.renderer.createElement('script');
    // script.src = 'https://www.tugoz.com/js/tugoz.js';
    // script.onload = () => {
    //   const tugozInstance = new (window as any).Tugoz(125, false, 'c100914');
    //   tugozInstance.embed(100914);
    // };
    // this.renderer.appendChild(document.body, script);
    this.checkArrowVisibility();
    window.addEventListener('resize', this.checkArrowVisibility.bind(this));
    // this.tugozInstance = new Tugoz(125, false, 'tugoz-container');

  }

  toggle() {
    this.expanded = !this.expanded;
  }

  getFirstGenre(genreString: string): string {
    if (!genreString) return ''; // handles null, undefined, or empty string
    const genres = genreString.split(',').map((g) => g.trim());
    return genres.length > 1 ? `${genres[0]}` : genres[0];
  }
  getFirstGenre2(genreString: string): string {
    if (!genreString) return ''; // handles null, undefined, or empty string
    const genres = genreString.split(',').map((g) => g.trim()).reverse();
    return genres.length > 1 ? `${genres[0]}` : genres[0];
  }
  hasMoreGenres(genreString: string): boolean {
    if (!genreString) return false;
    return genreString.split(',').map((g) => g.trim()).length > 1;
  }

  BannerImage: string = '';
  PosterImage: string = '';
  decodeHtmlEntities(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }
  showVideos = true;

  pauseVideos() {
    this.showVideos = false;
    setTimeout(() => this.showVideos = true, 100); // small delay to re-render
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const element = document.querySelector('.event-img');
    if (element) {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;

      if (!isVisible) {
        this.pauseVideos();
      }
    }
  }


  searchLoading: boolean = false;
  genreList: any[] = [];
  TAGS_NAMESList: string[] = [];

  languageList: string[] = [];
  cleanedTerms: any[] = [];
  ExtraInfo: any[] = [];

  castData: any = [];
  crewData: any = [];
  isSingleDate = false;
  singleDate: any = '';
  singletime: any = '';
  minShowDate: any = '';
  maxShowDate: any = '';
  Artistdata: any = [];
  videourls: any = [];
  galleryData: any = [];
  firstImage: any = '';
  socialFeedData: any = [];
  isearlyaccess: any = 0;
  userType: any = 'normal';
  uniqueEvents: any = [];
  showbutton = false;
  private tugozInstance: any;


  getPlayDetails() {
    if (
      localStorage.getItem('memberId') === null ||
      localStorage.getItem('memberId') === undefined ||
      localStorage.getItem('memberId') === '0' ||
      localStorage.getItem('memberId') === ''
    ) {

      this.showbutton = false;
      this.PosterImage = '';
      this.BannerImage = '';
      this.Loading = true;

      this.searchLoading = true;
      this.apiService
        .getPlayDetailsPage(this.playId, this.selectedCityId, this.memberId, this.isGuest)
        .subscribe(
          (data: any) => {
            if (data['code'] === 200 && data['data'][0]) {
              this.dataCount = 1;
              // const play = data['data'][0]; // old structure
              var eventDetails = data['data'][0];
              this.PlaysData = data['data'][0];
              if (this.PlaysData.eventScheduleData && this.PlaysData.eventScheduleData.length > 0) {
                if (this.PlaysData.eventScheduleData[0]['MAIN_EVENT_ID'] != undefined && this.PlaysData.eventScheduleData[0]['MAIN_EVENT_ID'] != null)
                  var MAIN_EVENT_ID = this.PlaysData.eventScheduleData[0]['MAIN_EVENT_ID'];

                this.apiService
                  .getMappedEventTermsConditions(MAIN_EVENT_ID)
                  .subscribe(
                    (data: any) => {
                      if (data['code'] === 200 && data['data'][0]) {
                        //console.log('Terms and Conditions Data:', data['data'][0]['TERMS_CONDITIONS']);
                        sessionStorage.setItem('cleanedTerms', JSON.stringify(data['data'][0]['TERMS_CONDITIONS']));
                      }
                    },
                    (error: any) => {

                    }
                  );

                this.uniqueEvents = this.PlaysData.eventScheduleData.filter(
                  (event: any, index: any, self: any) =>
                    index === self.findIndex((e: any) => e.VENUE_ID === event.VENUE_ID)
                );
                //console.log('Unique Events:', this.uniqueEvents);
                var tugozevents = this.PlaysData.eventScheduleData.filter(
                  (event: any) =>
                    event.LOAD_FROM_TUGOZ == true
                );
                this.tugozcount = 0;
                this.ismultidate = this.PlaysData.eventScheduleData.length == 1 ? 1 : 0;
                sessionStorage.removeItem('preload');
                if (tugozevents != undefined && tugozevents != null && tugozevents.length > 0) {
                  var tugozID = tugozevents[0]['TUGOZ_LAYOUT_ID'];
                  sessionStorage.setItem('preload', tugozID);

                  this.tugozcount = this.PlaysData.eventScheduleData.length == 1 ? 1 : 0;
                }
              }
              if (this.getPlainTextFromHTML(this.PlaysData.DESCRIPTION).length > 140)
                this.showbutton = true;
              localStorage.setItem('IS_MEMBER', 'N');

              this.IS_BOOKING_COMPLETED =
                eventDetails?.IS_BOOKING_COMPLETED ?? 0;



              this.evaluateBookingButton();
              var parsedGallery: any = [];
              if (this.PlaysData?.PHOTO_GALLERY !== null && this.PlaysData?.PHOTO_GALLERY !== '' && this.PlaysData?.PHOTO_GALLERY !== 'null' && this.PlaysData?.PHOTO_GALLERY !== undefined) {
                parsedGallery = JSON.parse(this.PlaysData.PHOTO_GALLERY);
              }

              try {
                const feedRaw = this.PlaysData?.SOCIAL_FEED;

                // Only parse if it's a valid non-empty string
                if (
                  feedRaw &&
                  typeof feedRaw === 'string' &&
                  feedRaw.trim() !== 'undefined'
                ) {
                  const feed = JSON.parse(feedRaw);
                  this.socialFeedData = Array.isArray(feed) ? feed : [];
                } else {
                  this.socialFeedData = [];
                }
              } catch (err) {
                this.socialFeedData = []; // fallback to empty list
              }


              this.firstImage = '';
              if (parsedGallery !== null && parsedGallery !== '' && parsedGallery !== 'null' && parsedGallery !== undefined) {
                this.galleryData = parsedGallery.map((img: any) => ({
                  ...img,
                  fullUrl: this.retriveimgUrl + 'PhotoGallary/' + img.URL,
                }));

                // const [firstImage, ...rest] = this.galleryData;
                this.firstImage = this.galleryData.filter((img: any) => img.TYPE == "EL");
                this.galleryData = this.galleryData.filter((img: any) => img.TYPE != 'EL');
              }


              this.interested = data['data'][0]['interested'];
              this.averageRating = data['data'][0]['averageRating'];
              if (
                localStorage.getItem('selectedCategory') === null ||
                localStorage.getItem('selectedCategory') === undefined ||
                localStorage.getItem('selectedCategory') === '0' ||
                localStorage.getItem('selectedCategory') === ''
              )
                localStorage.setItem(
                  'selectedCategory',
                  data['data'][0]['CATEGORY_ID']
                );
              localStorage.setItem(
                'selectedCategory11',
                data['data'][0]['CATEGORY_ID']
              );
              this.setMetaTags(this.PlaysData);

              if (
                this.PlaysData.EVENT_IMAGE !== null &&
                this.PlaysData.EVENT_IMAGE !== undefined &&
                this.PlaysData.EVENT_IMAGE !== ''
              ) {
                this.PosterImage =
                  this.retriveimgUrl +
                  'eventImages/' +
                  this.PlaysData.EVENT_IMAGE;
              } else {
                this.PosterImage = 'assets/movie_skel.jpg';
              }
              var results = this.getMinMaxShowDates(
                eventDetails.eventScheduleData
              );

              if (
                this.PlaysData.TERMS_CONDITIONS !== null &&
                this.PlaysData.TERMS_CONDITIONS !== undefined &&
                this.PlaysData.TERMS_CONDITIONS !== ''
              ) {
                // this.stripHtml(this.PlaysData.TERMS_CONDITIONS)
                this.cleanedTerms = this.PlaysData.TERMS_CONDITIONS.map(
                  (item: any) => this.stripHtml(item)
                );
              } else {
                this.cleanedTerms = [];
              }

              if (
                this.PlaysData.eventExtraInfo !== null &&
                this.PlaysData.eventExtraInfo !== undefined &&
                this.PlaysData.eventExtraInfo !== '' && this.PlaysData.eventExtraInfo !== 'null' && this.PlaysData.eventExtraInfo !== '[]'
              ) {
                this.ExtraInfo = this.PlaysData.eventExtraInfo
              } else {
                this.ExtraInfo = [];
              }

              this.isSingleDate = results.isSingle;
              this.singleDate = results.date;
              this.singletime = results.time;
              this.minShowDate = results.minDate;
              this.maxShowDate = results.maxDate;
              this.processDatesAndCheckReviewVisibility(
                eventDetails.eventScheduleData
              ); // call this after data arrives

              if (
                this.PlaysData.eventCastData !== null &&
                this.PlaysData.eventCastData !== undefined &&
                this.PlaysData.eventCastData !== '' &&
                this.PlaysData.eventCastData.length > 0
              ) {
                this.castData = this.PlaysData.eventCastData.filter(
                  (person: any) => person.TYPE_ID?.toLowerCase() === 'cast'
                );
                this.crewData = this.PlaysData.eventCastData.filter(
                  (person: any) => person.TYPE_ID?.toLowerCase() === 'crew'
                );

                this.Artistdata = this.PlaysData.eventCastData.filter(
                  (person: any) => person.TYPE_ID?.toLowerCase() === 'artist'
                );
              } else {
                this.castData = [];
                this.crewData = [];
              }

              if (
                this.PlaysData.BANNER_IMAGE !== null &&
                this.PlaysData.BANNER_IMAGE !== undefined &&
                this.PlaysData.BANNER_IMAGE !== ''
              ) {
                this.BannerImage =
                  this.retriveimgUrl +
                  'eventImages/' +
                  this.PlaysData.BANNER_IMAGE;
              } else {
                this.BannerImage = 'assets/movie_skel.jpg';
              }

              if (
                this.PlaysData.TRAILER_URL !== null &&
                this.PlaysData.TRAILER_URL !== undefined &&
                this.PlaysData.TRAILER_URL !== '' && this.PlaysData.TRAILER_URL !== 'null'
              ) {
                const parsedUrls = JSON.parse(this.PlaysData.TRAILER_URL);
                this.videourls = parsedUrls.map((item: any) => {
                  const match = item.URL.match(
                    /(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/
                  );
                  const videoId = match ? match[1] : '';
                  const embedUrl = 'https://www.youtube.com/embed/' + videoId;
                  return {
                    ...item,
                    embedUrlSanitized:
                      this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl),
                  };
                });



              } else {
                this.videourls = [];
              }


              // this.genreList = this.PlaysData?.GENRE_NAMES;
              this.genreList = this.PlaysData?.GENRE_NAMES?.replace(/,/g, ', ');
              // this.TAGS_NAMESList = this.PlaysData?.TAGS_NAMES;
              this.TAGS_NAMESList = this.PlaysData?.TAGS_NAMES?.replace(/,/g, ', ');
              // this.languageList = this.PlaysData?.LANGUAGE_NAMES;
              this.languageList = this.PlaysData?.LANGUAGE_NAMES?.replace(/,/g, ', ');
              this.getPlayData(
                this.PlaysData?.LANGUAGE_NAMES,
                this.PlaysData?.GENRE_NAMES
              );
              this.Loading = false;

              this.searchLoading = false;
              this.changeDetectorRef.detectChanges();
            } else {
              if (data['code'] === 200 && data['data'].length == 0) {
                this.dataCount = 0;
                this.searchLoading = false;
                this.PlaysData = [];
              } else {
                this.dataCount = 2;
                this.PlaysData = [];
              }
            }
          },
          (error: any) => { }
        );
    } else {

      this.apiService.getcheckEarlyAccess(this.memberId)
        .subscribe(
          (data: any) => {
            if (data['code'] === 200) {
              this.isearlyaccess = data['IS_EARLY_ACCESS'];

              if (data['IS_EARLY_ACCESS'] === 1) {


                this.userType = 'member';
                this.PosterImage = '';
                this.BannerImage = '';
                this.Loading = true;

                this.searchLoading = true;
                this.apiService
                  .getPlayDetailsPage(this.playId, this.selectedCityId, this.memberId, this.isGuest)
                  .subscribe(
                    (data: any) => {
                      if (data['code'] === 200 && data['data'][0]) {
                        this.dataCount = 1;
                        var eventDetails = data['data'][0];
                        this.PlaysData = data['data'][0];
                        if (this.PlaysData.eventScheduleData && this.PlaysData.eventScheduleData.length > 0) {
                          if (this.PlaysData.eventScheduleData[0]['MAIN_EVENT_ID'] != undefined && this.PlaysData.eventScheduleData[0]['MAIN_EVENT_ID'] != null)
                            var MAIN_EVENT_ID = this.PlaysData.eventScheduleData[0]['MAIN_EVENT_ID'];

                          this.apiService
                            .getMappedEventTermsConditions(MAIN_EVENT_ID)
                            .subscribe(
                              (data: any) => {
                                if (data['code'] === 200 && data['data'][0]) {
                                  //console.log('Terms and Conditions Data:', data['data'][0]['TERMS_CONDITIONS']);
                                  sessionStorage.setItem('cleanedTerms', JSON.stringify(data['data'][0]['TERMS_CONDITIONS']));
                                }
                              },
                              (error: any) => {

                              }
                            );


                          this.uniqueEvents = this.PlaysData.eventScheduleData.filter(
                            (event: any, index: any, self: any) =>
                              index === self.findIndex((e: any) => e.VENUE_ID === event.VENUE_ID)
                          );
                          //console.log('Unique Events:', this.uniqueEvents);
                          var tugozevents = this.PlaysData.eventScheduleData.filter(
                            (event: any) =>
                              event.LOAD_FROM_TUGOZ == true
                          );
                          this.tugozcount = 0;
                          this.ismultidate = this.PlaysData.eventScheduleData.length == 1 ? 1 : 0;
                          sessionStorage.removeItem('preload');
                          if (tugozevents != undefined && tugozevents != null && tugozevents.length > 0) {
                            var tugozID = tugozevents[0]['TUGOZ_LAYOUT_ID'];
                            sessionStorage.setItem('preload', tugozID);

                            this.tugozcount = this.PlaysData.eventScheduleData.length == 1 ? 1 : 0;
                          }
                        }

                        if (this.getPlainTextFromHTML(this.PlaysData.DESCRIPTION).length > 140 || this.countLines(this.PlaysData.DESCRIPTION) > 5)
                          this.showbutton = true;
                        localStorage.setItem('IS_MEMBER', 'M');

                        this.evaluateBookingButton();


                        var parsedGallery: any = [];
                        if (this.PlaysData?.PHOTO_GALLERY !== null && this.PlaysData?.PHOTO_GALLERY !== '' && this.PlaysData?.PHOTO_GALLERY !== 'null' && this.PlaysData?.PHOTO_GALLERY !== undefined) {

                          parsedGallery = JSON.parse(this.PlaysData.PHOTO_GALLERY);
                        }



                        try {
                          const feedRaw = this.PlaysData?.SOCIAL_FEED;

                          // Only parse if it's a valid non-empty string
                          if (
                            feedRaw &&
                            typeof feedRaw === 'string' &&
                            feedRaw.trim() !== 'undefined'
                          ) {
                            const feed = JSON.parse(feedRaw);
                            this.socialFeedData = Array.isArray(feed) ? feed : [];
                          } else {
                            this.socialFeedData = [];
                          }
                        } catch (err) {
                          this.socialFeedData = []; // fallback to empty list
                        }



                        this.firstImage = '';
                        if (parsedGallery !== null && parsedGallery !== '' && parsedGallery !== 'null' && parsedGallery !== undefined) {

                          this.galleryData = parsedGallery.map((img: any) => ({
                            ...img,
                            fullUrl: this.retriveimgUrl + 'PhotoGallary/' + img.URL,
                          }));

                          this.firstImage = this.galleryData.filter((img: any) => img.TYPE == "EL");
                          this.galleryData = this.galleryData.filter((img: any) => img.TYPE != 'EL');

                        }


                        this.interested = data['data'][0]['interested'];
                        this.averageRating = data['data'][0]['averageRating'];
                        if (
                          localStorage.getItem('selectedCategory') === null ||
                          localStorage.getItem('selectedCategory') === undefined ||
                          localStorage.getItem('selectedCategory') === '0' ||
                          localStorage.getItem('selectedCategory') === ''
                        )
                          localStorage.setItem(
                            'selectedCategory',
                            data['data'][0]['CATEGORY_ID']
                          );
                        localStorage.setItem(
                          'selectedCategory11',
                          data['data'][0]['CATEGORY_ID']
                        );
                        this.setMetaTags(this.PlaysData);

                        if (
                          this.PlaysData.EVENT_IMAGE !== null &&
                          this.PlaysData.EVENT_IMAGE !== undefined &&
                          this.PlaysData.EVENT_IMAGE !== ''
                        ) {
                          this.PosterImage =
                            this.retriveimgUrl +
                            'eventImages/' +
                            this.PlaysData.EVENT_IMAGE;
                        } else {
                          this.PosterImage = 'assets/movie_skel.jpg';
                        }
                        var results = this.getMinMaxShowDates(
                          eventDetails.eventScheduleData
                        );

                        if (
                          this.PlaysData.TERMS_CONDITIONS !== null &&
                          this.PlaysData.TERMS_CONDITIONS !== undefined &&
                          this.PlaysData.TERMS_CONDITIONS !== ''
                        ) {
                          // this.stripHtml(this.PlaysData.TERMS_CONDITIONS)
                          this.cleanedTerms = this.PlaysData.TERMS_CONDITIONS.map(
                            (item: any) => this.stripHtml(item)
                          );
                        } else {
                          this.cleanedTerms = [];
                        }

                        if (
                          this.PlaysData.eventExtraInfo !== null &&
                          this.PlaysData.eventExtraInfo !== undefined &&
                          this.PlaysData.eventExtraInfo !== '' && this.PlaysData.eventExtraInfo !== 'null' && this.PlaysData.eventExtraInfo !== '[]'
                        ) {
                          this.ExtraInfo = this.PlaysData.eventExtraInfo
                        } else {
                          this.ExtraInfo = [];
                        }

                        this.isSingleDate = results.isSingle;
                        this.singleDate = results.date;
                        this.singletime = results.time;
                        this.minShowDate = results.minDate;
                        this.maxShowDate = results.maxDate;
                        this.processDatesAndCheckReviewVisibility(
                          eventDetails.eventScheduleData
                        ); // call this after data arrives

                        if (
                          this.PlaysData.eventCastData !== null &&
                          this.PlaysData.eventCastData !== undefined &&
                          this.PlaysData.eventCastData !== '' &&
                          this.PlaysData.eventCastData.length > 0
                        ) {
                          this.castData = this.PlaysData.eventCastData.filter(
                            (person: any) => person.TYPE_ID?.toLowerCase() === 'cast'
                          );
                          this.crewData = this.PlaysData.eventCastData.filter(
                            (person: any) => person.TYPE_ID?.toLowerCase() === 'crew'
                          );

                          this.Artistdata = this.PlaysData.eventCastData.filter(
                            (person: any) => person.TYPE_ID?.toLowerCase() === 'artist'
                          );
                        } else {
                          this.castData = [];
                          this.crewData = [];
                        }

                        if (
                          this.PlaysData.BANNER_IMAGE !== null &&
                          this.PlaysData.BANNER_IMAGE !== undefined &&
                          this.PlaysData.BANNER_IMAGE !== ''
                        ) {
                          this.BannerImage =
                            this.retriveimgUrl +
                            'eventImages/' +
                            this.PlaysData.BANNER_IMAGE;
                        } else {
                          this.BannerImage = 'assets/movie_skel.jpg';
                        }

                        if (
                          this.PlaysData.TRAILER_URL !== null &&
                          this.PlaysData.TRAILER_URL !== undefined &&
                          this.PlaysData.TRAILER_URL !== '' && this.PlaysData.TRAILER_URL !== 'null'
                        ) {
                          const parsedUrls = JSON.parse(this.PlaysData.TRAILER_URL);
                          this.videourls = parsedUrls.map((item: any) => {
                            const match = item.URL.match(
                              /(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/
                            );
                            const videoId = match ? match[1] : '';
                            const embedUrl = 'https://www.youtube.com/embed/' + videoId;
                            return {
                              ...item,
                              embedUrlSanitized:
                                this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl),
                            };
                          });
                        } else {
                          this.videourls = [];
                        }


                        // this.genreList = this.PlaysData?.GENRE_NAMES;
                        this.genreList = this.PlaysData?.GENRE_NAMES?.replace(/,/g, ', ');
                        // this.TAGS_NAMESList = this.PlaysData?.TAGS_NAMES;
                        this.TAGS_NAMESList = this.PlaysData?.TAGS_NAMES?.replace(/,/g, ', ');
                        // this.languageList = this.PlaysData?.LANGUAGE_NAMES;
                        this.languageList = this.PlaysData?.LANGUAGE_NAMES?.replace(/,/g, ', ');
                        this.getPlayData(
                          this.PlaysData?.LANGUAGE_NAMES,
                          this.PlaysData?.GENRE_NAMES
                        );
                        this.Loading = false;

                        this.searchLoading = false;
                        this.changeDetectorRef.detectChanges();
                      } else {
                        if (data['code'] === 200 && data['data'].length == 0) {
                          this.dataCount = 0;
                          this.searchLoading = false;
                          this.PlaysData = [];
                        } else {
                          this.dataCount = 2;
                          this.PlaysData = [];
                        }
                      }
                    },
                    (error: any) => { }
                  );
              } else {

                this.userType = 'normal';
                this.PosterImage = '';
                this.BannerImage = '';
                this.Loading = true;

                this.searchLoading = true;
                this.apiService
                  .getPlayDetailsPage(this.playId, this.selectedCityId, this.memberId, this.isGuest)
                  .subscribe(
                    (data: any) => {
                      if (data['code'] === 200 && data['data'][0]) {
                        this.dataCount = 1;
                        var eventDetails = data['data'][0];
                        localStorage.setItem('IS_MEMBER', 'N');

                        this.PlaysData = data['data'][0];
                        if (this.PlaysData.eventScheduleData && this.PlaysData.eventScheduleData.length > 0) {
                          if (this.PlaysData.eventScheduleData[0]['MAIN_EVENT_ID'] != undefined && this.PlaysData.eventScheduleData[0]['MAIN_EVENT_ID'] != null)
                            var MAIN_EVENT_ID = this.PlaysData.eventScheduleData[0]['MAIN_EVENT_ID'];
                          this.apiService
                            .getMappedEventTermsConditions(MAIN_EVENT_ID)
                            .subscribe(
                              (data: any) => {
                                if (data['code'] === 200 && data['data'][0]) {
                                  //console.log('Terms and Conditions Data:', data['data'][0]['TERMS_CONDITIONS']);
                                  sessionStorage.setItem('cleanedTerms', JSON.stringify(data['data'][0]['TERMS_CONDITIONS']));
                                }
                              },
                              (error: any) => {
                              }
                            );

                          this.uniqueEvents = this.PlaysData.eventScheduleData.filter(
                            (event: any, index: any, self: any) =>
                              index === self.findIndex((e: any) => e.VENUE_ID === event.VENUE_ID)
                          );
                          //console.log('Unique Events:', this.uniqueEvents);
                          var tugozevents = this.PlaysData.eventScheduleData.filter(
                            (event: any) =>
                              event.LOAD_FROM_TUGOZ == true
                          );

                          if (tugozevents != undefined && tugozevents != null && tugozevents.length > 0) {
                            var tugozID = tugozevents[0]['TUGOZ_LAYOUT_ID'];
                            sessionStorage.setItem('preload', tugozID);
                            this.tugozcount = this.PlaysData.eventScheduleData.length == 1 ? 1 : 0;
                          }
                        }


                        if (this.getPlainTextFromHTML(this.PlaysData.DESCRIPTION).length > 140 || this.countLines(this.PlaysData.DESCRIPTION) > 3)
                          this.showbutton = true;


                        this.tugozcount = 0;
                        this.ismultidate = this.PlaysData.eventScheduleData.length == 1 ? 1 : 0;
                        sessionStorage.removeItem('preload');

                        this.evaluateBookingButton();
                        var parsedGallery: any = [];
                        if (this.PlaysData?.PHOTO_GALLERY !== null && this.PlaysData?.PHOTO_GALLERY !== '' && this.PlaysData?.PHOTO_GALLERY !== 'null' && this.PlaysData?.PHOTO_GALLERY !== undefined) {

                          parsedGallery = JSON.parse(this.PlaysData.PHOTO_GALLERY);
                        }

                        try {
                          const feedRaw = this.PlaysData?.SOCIAL_FEED;

                          // Only parse if it's a valid non-empty string
                          if (
                            feedRaw &&
                            typeof feedRaw === 'string' &&
                            feedRaw.trim() !== 'undefined'
                          ) {
                            const feed = JSON.parse(feedRaw);
                            this.socialFeedData = Array.isArray(feed) ? feed : [];
                          } else {
                            this.socialFeedData = [];
                          }
                        } catch (err) {
                          this.socialFeedData = []; // fallback to empty list
                        }



                        this.firstImage = '';
                        if (parsedGallery !== null && parsedGallery !== '' && parsedGallery !== 'null' && parsedGallery !== undefined) {

                          this.galleryData = parsedGallery.map((img: any) => ({
                            ...img,
                            fullUrl: this.retriveimgUrl + 'PhotoGallary/' + img.URL,
                          }));


                          this.firstImage = this.galleryData.filter((img: any) => img.TYPE == "EL");
                          this.galleryData = this.galleryData.filter((img: any) => img.TYPE != 'EL');
                        }
                        this.interested = data['data'][0]['interested'];
                        this.averageRating = data['data'][0]['averageRating'];
                        if (
                          localStorage.getItem('selectedCategory') === null ||
                          localStorage.getItem('selectedCategory') === undefined ||
                          localStorage.getItem('selectedCategory') === '0' ||
                          localStorage.getItem('selectedCategory') === ''
                        )
                          localStorage.setItem(
                            'selectedCategory',
                            data['data'][0]['CATEGORY_ID']
                          );
                        localStorage.setItem(
                          'selectedCategory11',
                          data['data'][0]['CATEGORY_ID']
                        );

                        this.setMetaTags(this.PlaysData);

                        if (
                          this.PlaysData.EVENT_IMAGE !== null &&
                          this.PlaysData.EVENT_IMAGE !== undefined &&
                          this.PlaysData.EVENT_IMAGE !== ''
                        ) {
                          this.PosterImage =
                            this.retriveimgUrl +
                            'eventImages/' +
                            this.PlaysData.EVENT_IMAGE;
                        } else {
                          this.PosterImage = 'assets/movie_skel.jpg';
                        }
                        var results = this.getMinMaxShowDates(
                          eventDetails.eventScheduleData
                        );

                        if (
                          this.PlaysData.TERMS_CONDITIONS !== null &&
                          this.PlaysData.TERMS_CONDITIONS !== undefined &&
                          this.PlaysData.TERMS_CONDITIONS !== ''
                        ) {
                          // this.stripHtml(this.PlaysData.TERMS_CONDITIONS)
                          this.cleanedTerms = this.PlaysData.TERMS_CONDITIONS.map(
                            (item: any) => this.stripHtml(item)
                          );
                        } else {
                          this.cleanedTerms = [];
                        }

                        if (
                          this.PlaysData.eventExtraInfo !== null &&
                          this.PlaysData.eventExtraInfo !== undefined &&
                          this.PlaysData.eventExtraInfo !== '' && this.PlaysData.eventExtraInfo !== 'null' && this.PlaysData.eventExtraInfo !== '[]'
                        ) {
                          this.ExtraInfo = this.PlaysData.eventExtraInfo
                        } else {
                          this.ExtraInfo = [];
                        }

                        this.isSingleDate = results.isSingle;
                        this.singleDate = results.date;
                        this.singletime = results.time;
                        this.minShowDate = results.minDate;
                        this.maxShowDate = results.maxDate;
                        this.processDatesAndCheckReviewVisibility(
                          eventDetails.eventScheduleData
                        ); // call this after data arrives

                        if (
                          this.PlaysData.eventCastData !== null &&
                          this.PlaysData.eventCastData !== undefined &&
                          this.PlaysData.eventCastData !== '' &&
                          this.PlaysData.eventCastData.length > 0
                        ) {
                          this.castData = this.PlaysData.eventCastData.filter(
                            (person: any) => person.TYPE_ID?.toLowerCase() === 'cast'
                          );
                          this.crewData = this.PlaysData.eventCastData.filter(
                            (person: any) => person.TYPE_ID?.toLowerCase() === 'crew'
                          );

                          this.Artistdata = this.PlaysData.eventCastData.filter(
                            (person: any) => person.TYPE_ID?.toLowerCase() === 'artist'
                          );
                        } else {
                          this.castData = [];
                          this.crewData = [];
                        }

                        if (
                          this.PlaysData.BANNER_IMAGE !== null &&
                          this.PlaysData.BANNER_IMAGE !== undefined &&
                          this.PlaysData.BANNER_IMAGE !== ''
                        ) {
                          this.BannerImage =
                            this.retriveimgUrl +
                            'eventImages/' +
                            this.PlaysData.BANNER_IMAGE;
                        } else {
                          this.BannerImage = 'assets/movie_skel.jpg';
                        }

                        if (
                          this.PlaysData.TRAILER_URL !== null &&
                          this.PlaysData.TRAILER_URL !== undefined &&
                          this.PlaysData.TRAILER_URL !== '' && this.PlaysData.TRAILER_URL !== 'null'
                        ) {
                          const parsedUrls = JSON.parse(this.PlaysData.TRAILER_URL);
                          this.videourls = parsedUrls.map((item: any) => {
                            const match = item.URL.match(
                              /(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/
                            );
                            const videoId = match ? match[1] : '';
                            const embedUrl = 'https://www.youtube.com/embed/' + videoId;
                            return {
                              ...item,
                              embedUrlSanitized:
                                this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl),
                            };
                          });
                        } else {
                          this.videourls = [];
                        }


                        // this.genreList = this.PlaysData?.GENRE_NAMES;
                        this.genreList = this.PlaysData?.GENRE_NAMES?.replace(/,/g, ', ');
                        // this.TAGS_NAMESList = this.PlaysData?.TAGS_NAMES;
                        this.TAGS_NAMESList = this.PlaysData?.TAGS_NAMES?.replace(/,/g, ', ');
                        // this.languageList = this.PlaysData?.LANGUAGE_NAMES;
                        this.languageList = this.PlaysData?.LANGUAGE_NAMES?.replace(/,/g, ', ');
                        this.getPlayData(
                          this.PlaysData?.LANGUAGE_NAMES,
                          this.PlaysData?.GENRE_NAMES
                        );
                        this.Loading = false;

                        this.searchLoading = false;
                        this.changeDetectorRef.detectChanges();
                      } else {
                        if (data['code'] === 200 && data['data'].length == 0) {
                          this.dataCount = 0;
                          this.searchLoading = false;
                          this.PlaysData = [];
                        } else {
                          this.dataCount = 2;
                          this.PlaysData = [];
                        }
                      }
                    },
                    (error: any) => { }
                  );
              }
            } else if (
              data['code'] === 303 ||
              data.message == 'Invalid token'
            ) {
              this.interestLoader = false;
              this.signOut();
            } else { }
          },
          (error) => { }
        );

    }

  }

  gotoHome() {
    this.router.navigate(['/']);
  }

  showBookingButton: boolean = false;
  parseCustomDate(dateStr: string): Date {
    const [datePart, hour, min, ampm] = dateStr.split(/[\s:]+/); // e.g., ['2025-07-07', '12', '04', 'PM']
    const [year, month, day] = datePart.split('-').map(Number);
    var hours = Number(hour);
    const minute = Number(min);

    // Convert 12-hour to 24-hour
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return new Date(year, month - 1, day, hours, minute);
  }
  isShowStopped = false;
  isCommingSoon = false;
  evaluateBookingButton(): void {
    this.isShowStopped = false;
    this.isCommingSoon = false;
    this.showBookingButton = false;

    const schedules = this.PlaysData?.eventScheduleData || [];
    const stoppedschedules = this.PlaysData?.latestStoppedSchedule || {};
    const currentTime = new Date();

    if (schedules && schedules.length > 0) {
      let bookingOpen = false;
      let hasFutureSchedule = false;

      for (const schedule of schedules) {
        const earlyAccessDate = schedule?.EARLY_ACCESS_DATE != null
          ? this.parseCustomDate(schedule.EARLY_ACCESS_DATE)
          : null;
        const showStartDate = this.parseCustomDate(schedule.BOOKING_DATE_START);
        const showEndDate = this.parseCustomDate(schedule.BOOKING_DATE_END);

        // 1. Normal booking window is open
        if (currentTime >= showStartDate && currentTime <= showEndDate) {
          bookingOpen = true;
          break;
        }

        // 2. Early access window is open (subscribed users only)
        if (this.isearlyaccess && earlyAccessDate && currentTime >= earlyAccessDate && currentTime <= showEndDate) {
          bookingOpen = true;
          break;
        }

        // 3. Booking hasn't started yet — check if any future window exists
        const effectiveStartDate = (this.isearlyaccess && earlyAccessDate) ? earlyAccessDate : showStartDate;
        if (currentTime < effectiveStartDate) {
          hasFutureSchedule = true;
        }
      }

      if (bookingOpen) {
        this.showBookingButton = true;
      } else if (hasFutureSchedule) {
        // At least one schedule hasn't started yet
        this.isCommingSoon = true;
      }

      //console.log('Schedules:', schedules, '=', this.showBookingButton, '=', this.isCommingSoon);
    } else if (stoppedschedules && stoppedschedules.BOOKING_DATE_END) {
      // No active schedules, but a stopped schedule exists
      this.isShowStopped = true;
    }
  }

  ImageURL: any = this.apiService.retriveimgUrl;

  setMetaTags(event: any) {
    if (event.eventMetaInfo != undefined && event.eventMetaInfo.length > 0) {
      var data = event.eventMetaInfo[0];
      var metadata: any = {
        META_TITLE: data.META_NAME != undefined && data.META_NAME != '' && data.META_NAME != 'undefined' ? data.META_NAME : event.EVENT_NAME,
        URL: window.location.href,
        META_DESCRIPTION: data.META_DESCRIPTION != undefined && data.META_DESCRIPTION != '' && data.META_DESCRIPTION != 'undefined'
          ? data.META_DESCRIPTION
          : event.EVENT_NAME + ',' + event.CATEGORY_NAME + ',' + event.TAGS_NAMES,
        META_KEYWORD: data.META_KEYWORDS != undefined && data.META_KEYWORDS != '' && data.META_KEYWORDS != 'undefined' ? data.META_KEYWORDS : event.EVENT_NAME,
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

  gotoroute(event: any) {
    var name: any = event.CATEGORY_NAME.toLowerCase()
      .replace(/[\/\\,]+/g, '') // Remove /, \, ,
      .replace(/[^a-z0-9\s-]/g, '') // Remove other special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single one
      .trim(); // Trim leading/trailing spaces
    this.router.navigate([
      'explore/',
      this.selectedCity,
      name,
      event.EVENT_SLUG,
      event._id,
    ]);
  }
  onEventClick(event: any) {
    // console.error('Event de',event)

    if (event.HAS_SUB_EVENTS) {
      const schedules = event.schedules || [];

      this.mainShowDates = [
        ...new Set(schedules.map((s: any) => s.SHOW_DATE))
      ];

      this.mainShowTime = [
        ...new Set(schedules.map((s: any) => s.SHOW_TIME))
      ];
      this.mainShowVenues = [
        ...new Set(schedules.map((s: any) => s.VENUE_NAME))
      ];

      //Event Date time
      localStorage.setItem('Date', JSON.stringify(this.mainShowDates));
      localStorage.setItem('Time', JSON.stringify(this.mainShowTime));
      localStorage.setItem('Venues', JSON.stringify(this.mainShowVenues));
      this.router.navigate(['/explore/subEvent', event._id],
        { queryParams: { catId: Number(event.CATEGORY_ID) } }
      );
    } else {
      this.router.navigate(['/explore', this.selectedCity, event.CATEGORY_NAME, event.EVENT_SLUG, event._id]);
    }
  }
  stripHtml(html: any) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent?.trim() || '';
  }

  getMinMaxShowDates(scheduleList: any[]): {
    isSingle: boolean;
    date: string;
    time: string;
    minDate: string;
    maxDate: string;
  } {
    if (!scheduleList || scheduleList.length === 0) {
      return { isSingle: false, date: '', time: '', minDate: '', maxDate: '' };
    }

    const dates: any = scheduleList.map((item) => new Date(item.SHOW_DATE));

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    if (dates.length === 1) {
      return {
        isSingle: true,
        date: formatDate(dates[0]),
        time: scheduleList[0].SHOW_TIME,
        minDate: '',
        maxDate: '',
      };
    }

    const minDate: any = new Date(Math.min(...dates));
    const maxDate: any = new Date(Math.max(...dates));

    return {
      isSingle: false,
      date: '',
      time: '',
      minDate: formatDate(minDate),
      maxDate: formatDate(maxDate),
    };
  }

  isReviewButtonVisible: boolean = false;

  processDatesAndCheckReviewVisibility(showList: any[]) {
    if (!showList || showList.length === 0) return;

    const showDates = showList.map((item) => {
      const [year, month, day] = item.SHOW_DATE.split('-');
      return new Date(+year, +month - 1, +day); // Local date, no timezone shift
    });

    showDates.sort((a, b) => a.getTime() - b.getTime());

    if (showDates.length === 1) {
      this.isSingleDate = true;
      this.singleDate = showDates[0];
      this.isReviewButtonVisible = this.singleDate <= new Date();
    } else {
      this.isSingleDate = false;
      this.minShowDate = showDates[0];
      this.isReviewButtonVisible = this.minShowDate <= new Date();
    }
  }

  generateTooltip(text: string): string {
    return `
      <div class='custom-tooltip'>
        <strong>Full Review:</strong>
        <div style="margin-top: 5px;">${text}</div>
      </div>
    `;
  }
  playRating: any[] = [];
  userImage: string = 'assets/images/profile-imgs/usernoimage.jpg';
  chunkedRatings: any = [];
  reviewsPerPage = 4; // Show 4 at a time
  currentIndex = 0;

  parseImageUrl(jsonString: string): string {
    try {
      const images = JSON.parse(jsonString);
      return images?.find((img: any) => img.ISDEFAULT)?.URL || '';
    } catch {
      return '';
    }
  }

  parseJson(jsonString: string): any[] {
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  }

  splitString(str: string): string[] {
    return str ? str.split(',').map((s) => s.trim()) : [];
  }

  loglink(url: string) {
    window.open(url, '_blank');
  }
  goToCastProfile(data: any) {
    var name: any = data.CAST_NAME.toLowerCase()
      .replace(/[\/\\,]+/g, '') // Remove /, \, ,
      .replace(/[^a-z0-9\s-]/g, '') // Remove other special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single one
      .trim();
    this.router.navigate(['/cast-and-crew', name, data.CAST_ID]);
  }
  getStars(rating: number): number[] {
    return [1, 2, 3, 4, 5];
  }

  feedback = {
    serviceRating: 0,
    technicianRating: 0,
    comment: '',
    EVENT_NAME: '',
    CATEGORY_NAME: '',
    SUB_CATEGORY_NAME: '',
  };

  rating = 0;
  techRating = 0;

  openFeedbackModal() {
    let modalElement = document.getElementById('rateNowModal');
    if (modalElement) {
      let modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  closeFeedbackModal() {
    const modalElement = document.getElementById('rateNowModal');
    if (modalElement && bootstrap.Modal.getInstance(modalElement)) {
      bootstrap.Modal.getInstance(modalElement)?.hide();
    }
  }

  setRating(star: number) {
    this.feedback.serviceRating = star;
    this.rating = star;
    this.rating = star;
    this.selectedTags = []; // Reset tags when rating changes
    this.feedback.comment = ''; // Reset comment
  }
  selectedTags: string[] = [];

  toggleTag(tag: string): void {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter((t) => t !== tag);
    } else {
      this.selectedTags.push(tag);
    }
    this.feedback.comment = this.selectedTags.join(', ');
  }

  getTags(): string[] {
    if (this.rating === 1 || this.rating === 2 || this.rating === 3) {
      return [
        '#Entertaining',
        '#Interesting',
        '#NiceStory',
        '#Timepass',
        '#OneTimeWatch',
        '#Fun',
        '#QuiteNice',
        '#GoodActing',
      ];
    } else if (this.rating === 4 || this.rating === 5 || this.rating === 6) {
      return [
        '#NiceStory',
        '#HitPlay',
        '#LovelyMusic',
        '#FunWatch',
        '#SuperDirection',
        '#GreatActing',
        '#Blockbuster',
        '#Rocking',
        '#Inspiring',
        '#Wellmade',
      ];
    }
    return [];
  }
  getFormattedDuration(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hrPart = hrs > 0 ? `${hrs} hr` : '';
    const minPart = mins > 0 ? `${mins} min` : '';
    return `${hrPart} ${minPart}`.trim();
  }
  public showTerms: boolean = false;

  toggleTerms(): void {
    this.showTerms = !this.showTerms;
  }

  public showextra: boolean = false;

  toggleshowextra(): void {
    this.showextra = !this.showextra;
  }

  filteredPlaysData: any[] = [];
  RecomendedPlaysData: any[] = [];
  selectedCityId: any;
  spinnerArray = Array(12);

  getPlayData(languages: any, genres: any) {
    this.Loading = true;

    var filter = { LANGUAGE_NAMES: languages, GENRE_NAMES: genres };
    var excludeEventIds = this.playId;
    const sortKey = "IS_PROMOTED"
    const sortValue = "DESC"
    this.apiService
      .getRecommendedDataList(
        1,
        5,
        filter,
        this.selectedCityId,
        Number(this.PlaysData.CATEGORY_ID),
        excludeEventIds,
        sortKey,
        sortValue
      )
      .subscribe(
        (data: any) => {
          if (data['code'] === 200) {
            this.RecomendedPlaysData = data['data'].slice(0, 10);
            this.filteredPlaysData = this.RecomendedPlaysData.sort((a: any, b: any) => {
              const dateA: any = new Date(a.schedules[0].SHOW_DATE);
              const dateB: any = new Date(b.schedules[0].SHOW_DATE);
              return dateA - dateB;
            });


            // this.filteredPlaysData = this.RecomendedPlaysData;
            this.checkArrowVisibility();
            window.addEventListener('resize', this.checkArrowVisibility.bind(this));
          } else {
            this.RecomendedPlaysData = [];
          }
        },
        () => { }
      );
  }
  onImageError(event: any) {
    event.target.src = '/assets/movie_skel.jpg';
  }

  bookNow(PlaysData: any) {
    this.router.navigate([
      '/buy-ticket',
      PlaysData.ID,
      encodeURIComponent(PlaysData.NAME),
      encodeURIComponent(this.selectedCityId),
    ]);
  }
  formatTimeWithAMPM(time: string): string {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(+hours, +minutes);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  currentUrl: string = window.location.href;

  // currentUrl: string | null = null;
  private apiCalled = false;

  onOpenShareModal() {
    if (!this.playId) return;

    if (!this.apiCalled) {
      this.apiCalled = true;
      this.apiService.getShareHtml(this.playId).subscribe({
        next: (htmlString: string) => {
          const match = htmlString.match(/window\.location\.href\s*=\s*"(.*?)"/);
          if (match && match[1]) {
            this.currentUrl = match[1];
          } else {
            this.toastr.error('Unable to extract share URL from backend HTML.');
          }
        },
        error: (err: any) => {
          console.error(err);
          this.toastr.error('Failed to fetch share link.');
        }
      });
    }
  }

  copyToClipboard() {
    if (!this.currentUrl) return;
    navigator.clipboard.writeText(this.currentUrl).then(() => {
      this.toastr.success('Link copied to clipboard!');
    });
  }

  interestLoader: boolean = false;
  interstdata: any = 1;
  InterestData: any;
  ImInterested() {
    if (
      localStorage.getItem('memberId') === null ||
      localStorage.getItem('memberId') === undefined ||
      localStorage.getItem('memberId') === '0' ||
      localStorage.getItem('memberId') === ''
    ) {
      this.showLoginModal();
    } else {
      this.interestLoader = true;
      if (this.interstdata > 0) {
        var interestdata: any = {
          EVENT_ID: this.playId,
          MEMBER_ID: Number(localStorage.getItem('memberId')),
          STATUS: this.InterestData['STATUS'] === 1 ? 0 : 1,
          ID: this.InterestData['ID'],
        };

        this.apiService.eventInterestMappingUpdate(interestdata).subscribe(
          (data: any) => {
            if (data['code'] === 200) {
              this.interestLoader = false;
              var message: any = 'Bookmark added successfully';
              if (this.InterestData['STATUS'] === 1) {
                message = 'Bookmark removed successfully';
              } else {
                message = 'Bookmark added successfully';
              }
              // this.toastr.success(message);

              this.getinterests();
            } else if (
              data['code'] === 303 ||
              data.message == 'Invalid token'
            ) {
              this.interestLoader = false;
              this.signOut();
            } else {
              this.interestLoader = false;
              this.toastr.error(
                'Something went wrong, please try again later.'
              );
            }
          },
          (err) => {
            this.interestLoader = false;
            this.toastr.error('Something went wrong, please try again later.');
          }
        );
      } else {
        var interestdata1: any = {
          EVENT_ID: this.playId,
          MEMBER_ID: Number(localStorage.getItem('memberId')),
          STATUS: 1,
        };
        this.apiService.eventInterestMappingCreate(interestdata1).subscribe(
          (data: any) => {
            if (data['code'] === 200) {
              this.interestLoader = false;
              this.getinterests();
              // this.toastr.success('Bookmark added successfully');
            } else if (
              data['code'] === 303 ||
              data.message == 'Invalid token'
            ) {
              this.interestLoader = false;
              this.signOut();
            } else {
              this.interestLoader = false;
              this.toastr.error(
                'Something went wrong, please try again later.'
              );
            }
          },
          (err) => {
            this.interestLoader = false;
            this.toastr.error('Something went wrong, please try again later.');
          }
        );
        // }
        // })
      }
    }
  }

  getinterests() {
    // this.apiService
    //   .eventInterestMappingget(
    //     0,
    //     0,
    //     '',
    //     '',
    //     " AND EVENT_ID='" +
    //     this.playId +
    //     "'" +
    //     ' AND MEMBER_ID=' +
    //     Number(localStorage.getItem('memberId'))
    //   )
    //   .subscribe(
    //     (data: any) => {
    //       if (data['code'] === 200 && data.count > 0) {
    //         this.InterestData = data['data'][0];
    //         this.interstdata = 1;
    //       } else {
    //         this.interstdata = 0;
    //       }
    //     },
    //     (err) => {
    //       this.interstdata = 0;
    //       this.InterestData = [];
    //     }
    //   );
  }

  chunkArray(arr: any[], chunkSize: number): any[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }

  getreviewa() {
    if (this.isLoading || this.allReviewsLoaded) return;

    this.isLoading = true;

    this.apiService
      .eventRatingReviewMappingget(
        this.pageIndex,
        this.pageSize,
        'CREATED_AT',
        'desc',
        " AND STATUS=1 AND EVENT_ID='" + this.playId + "'"
      )
      .subscribe(
        (data: any) => {
          if (data['code'] === 200) {
            this.reviewscount = data['count'];
          } else {
            this.reviewscount = 0;
          }
          if (data['code'] === 200 && data['data'].length > 0) {
            this.displayedReviews = [...this.displayedReviews, ...data['data']];
            if (this.displayedReviews.length < this.reviewscount) {
              this.allReviewsLoaded = false;
            } else {
              this.allReviewsLoaded = true;
            }
          } else {
            this.reviewscount = 0;
            this.allReviewsLoaded = true;
          }
          this.isLoading = false;
        },
        (error: any) => {
          this.reviewscount = 0;
          this.allReviewsLoaded = true;
          this.isLoading = false;
        }
      );
  }

  onScrolls(event: any) {
    const element = event.target;
    const threshold = 100; // pixels from bottom before triggering load

    if (
      element.scrollHeight - element.scrollTop - element.clientHeight <
      threshold &&
      !this.isLoading &&
      !this.allReviewsLoaded
    ) {
      this.pageIndex++;
      this.getreviewa();
    }
  }

  showLoginModal() {
    var d = document.getElementById('loginmodaltrack') as HTMLElement;
    d.click();
  }

  openlogin() {
    this.closelogin.nativeElement.click();
    this.router.navigate(['/sign-in']);
  }

  ratenowws: boolean = false;
  ratenoww(PlaysDatadddd: any) {
    if (
      localStorage.getItem('memberId') === null ||
      localStorage.getItem('memberId') === undefined ||
      localStorage.getItem('memberId') === '0' ||
      localStorage.getItem('memberId') === ''
    ) {
      this.showLoginModal();
    } else {

      this.rating = 0;
      this.feedback.comment = '';
      this.feedback['EVENT_NAME'] = PlaysDatadddd.EVENT_NAME;
      this.feedback['CATEGORY_NAME'] = PlaysDatadddd.CATEGORY_NAME;
      this.feedback['SUB_CATEGORY_NAME'] = PlaysDatadddd.SUB_CATEGORY_NAME;

      var d = document.getElementById('ratenowmodaltrackss') as HTMLElement;
      d.click();
    }
  }

  submitFeedback() {
    if (this.rating <= 0) {
      this.toastr.error('Select atleast one star');
    }

    else {
      const body = {
        MEMBER_ID: Number(localStorage.getItem('memberId')),
        EVENT_ID: this.playId,
        RATING: this.rating,
        REVIEW_TEXT: this.feedback.comment,
        STATUS: true,
        EVENT_NAME: this.feedback.EVENT_NAME,
        CATEGORY_NAME: this.feedback.CATEGORY_NAME,
        SUB_CATEGORY_NAME: this.feedback.SUB_CATEGORY_NAME,
      };
      this.ratenowws = true;
      this.apiService.eventRatingReviewMappingCreate(body).subscribe(
        (response) => {
          if (response.code === 200) {
            this.ratenowws = false;
            this.toastr.success('Your response has been submitted successfully and is awaiting admin review before being displayed on the website', '');
            this.displayedReviews = [];
            this.pageIndex = 1;
            this.pageSize = 4;
            this.allReviewsLoaded = false;
            this.averageRating = response['avgRating'];
            this.getreviewa();
            this.closereview.nativeElement.click();
          } else if (
            response['code'] === 303 ||
            response.message == 'Invalid token'
          ) {
            this.ratenowws = false;
            this.signOut();
          } else {
            this.ratenowws = false;
            this.toastr.error('Failed to submit review', '');
          }
        },
        (error) => {
          this.ratenowws = false;
          this.toastr.error('Something went wrong. Please try again.');
        }
      );
    }
  }

  // reviewload:boolean=false;
  // reviewload1:boolean=false;
  reviewload: boolean[] = [];
  reviewload1: boolean[] = [];
  ReviewLikes(reviewdata: any, indexx: any) {
    if (
      localStorage.getItem('memberId') === null ||
      localStorage.getItem('memberId') === undefined ||
      localStorage.getItem('memberId') === '0' ||
      localStorage.getItem('memberId') === ''
    ) {
      this.showLoginModal();
    } else {
      this.reviewload[indexx] = true;
      if (this.interstdata > 0) {
        var interestdata: any = {
          RATING_REVIEW_ID: reviewdata.ID,
          MEMBER_ID: Number(localStorage.getItem('memberId')),
          STATUS: 1,
          // ID: this.InterestData['ID']
        };

        this.apiService.eventRatingReviewLikesCreate(interestdata).subscribe(
          (data: any) => {
            if (data['code'] === 200) {
              this.reviewload[indexx] = false;

              this.toastr.success('You liked to this review');
              this.displayedReviews = [];
              this.pageIndex = 1;
              this.pageSize = 4;
              this.allReviewsLoaded = false;
              this.getreviewa();
            } else if (
              data['code'] === 303 ||
              data.message == 'Invalid token'
            ) {
              this.reviewload[indexx] = false;
              this.signOut();
            } else {
              this.reviewload[indexx] = false;
              this.toastr.error(
                'Something went wrong, please try again later.'
              );
            }
          },
          (err) => {
            this.reviewload[indexx] = false;
            this.toastr.error('Something went wrong, please try again later.');
          }
        );
      } else {
        var interestdata1: any = {
          RATING_REVIEW_ID: reviewdata.ID,
          MEMBER_ID: Number(localStorage.getItem('memberId')),
          STATUS: 1,
        };
        this.apiService.eventRatingReviewLikesCreate(interestdata1).subscribe(
          (data: any) => {
            if (data['code'] === 200) {
              this.reviewload[indexx] = false;
              this.displayedReviews = [];
              this.pageIndex = 1;
              this.pageSize = 4;
              this.allReviewsLoaded = false;
              this.getreviewa();
              this.toastr.success('You liked to this review');
            } else if (
              data['code'] === 303 ||
              data.message == 'Invalid token'
            ) {
              this.reviewload[indexx] = false;
              this.signOut();
            } else {
              this.reviewload[indexx] = false;
              this.toastr.error(
                'Something went wrong, please try again later.'
              );
            }
          },
          (err) => {
            this.reviewload[indexx] = false;
            this.toastr.error('Something went wrong, please try again later.');
          }
        );
        // }
        // })
      }
    }
  }

  ReviewDisLikes(reviewdata: any, indexx: any) {
    if (
      localStorage.getItem('memberId') === null ||
      localStorage.getItem('memberId') === undefined ||
      localStorage.getItem('memberId') === '0' ||
      localStorage.getItem('memberId') === ''
    ) {
      this.showLoginModal();
    } else {
      this.reviewload1[indexx] = true;
      if (this.interstdata > 0) {
        var interestdata: any = {
          RATING_REVIEW_ID: reviewdata.ID,
          MEMBER_ID: Number(localStorage.getItem('memberId')),
          STATUS: 0,
          // ID: this.InterestData['ID']
        };

        this.apiService.eventRatingReviewLikesCreate(interestdata).subscribe(
          (data: any) => {
            if (data['code'] === 200) {
              this.reviewload1[indexx] = false;

              this.toastr.success('You disliked to this review');
              this.displayedReviews = [];
              this.pageIndex = 1;
              this.pageSize = 4;
              this.allReviewsLoaded = false;
              this.getreviewa();
            } else if (
              data['code'] === 303 ||
              data.message == 'Invalid token'
            ) {
              this.reviewload1[indexx] = false;
              this.signOut();
            } else {
              this.reviewload1[indexx] = false;
              this.toastr.error(
                'Something went wrong, please try again later.'
              );
            }
          },
          (err) => {
            this.reviewload1[indexx] = false;
            this.toastr.error('Something went wrong, please try again later.');
          }
        );
      } else {
        var interestdata1: any = {
          RATING_REVIEW_ID: reviewdata.ID,
          MEMBER_ID: Number(localStorage.getItem('memberId')),
          STATUS: 0,
        };
        this.apiService.eventRatingReviewLikesCreate(interestdata1).subscribe(
          (data: any) => {
            if (data['code'] === 200) {
              this.reviewload1[indexx] = false;
              this.displayedReviews = [];
              this.pageIndex = 1;
              this.pageSize = 4;
              this.allReviewsLoaded = false;
              this.getreviewa();
              this.toastr.success('You disliked to this review');
            } else if (
              data['code'] === 303 ||
              data.message == 'Invalid token'
            ) {
              this.reviewload1[indexx] = false;
              this.signOut();
            } else {
              this.reviewload1[indexx] = false;
              this.toastr.error(
                'Something went wrong, please try again later.'
              );
            }
          },
          (err) => {
            this.reviewload1[indexx] = false;
            this.toastr.error('Something went wrong, please try again later.');
          }
        );
        // }
        // })
      }
    }
  }

  formatRating(rating: number): string {
    if (Number.isInteger(rating)) {
      return rating.toString();
    } else {
      return Math.floor(rating * 10) / 10 + '';
    }
  }

  formatLikesCount(count: number): string {
    if (count < 1000) return count.toString();

    const suffixes = ['K', 'M', 'B', 'T'];
    const i = Math.floor(Math.log10(count) / 3);
    const shortValue = (count / Math.pow(1000, i)).toFixed(1);

    return `${shortValue}${suffixes[i - 1]}`;
  }

  signOut() {
    const userId =
      this.userService.getUserEmail() || this.userService.getUserMobileNumber();
    const clearAllData = () => {
      // Clear specific cookies
      this.cookie.delete('cityName', '/');
      this.cookie.delete('cityId', '/');
      this.cookie.delete('cities', '/');
      this.cookie.delete('token', '/'); // Add others as needed
      this.cookie.delete('userId', '/'); // Add others as needed
      this.cookie.delete('locationname', '/'); // Add others as needed

      // Clear storage
      this.cookie.deleteAll();

      sessionStorage.clear();
      localStorage.clear();
      window.location.reload();
    };

    if (userId != null && userId != undefined) {
      this.apiService.userLogout(userId).subscribe({
        next: (successCode: any) => {
          clearAllData();

          // this.toastr.success('You have successfully logged out!', 'Success');

          this.router.navigate(['/home']).then(() => {
            window.location.reload();
          });
        },
        error: (errorResponse) => {
          clearAllData();

          // this.toastr.success('You have successfully logged out!', 'Success');

          this.router.navigate(['/home']).then(() => {
            window.location.reload();
          });
        },
      });
    } else {
      clearAllData();
      this.router.navigate(['/home']).then(() => {
        window.location.reload();
      });
    }
  }

  getStarsMark(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    if (hasHalfStar) {
      stars.push('half');
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push('empty');
    }

    return stars;
  }

  toggleReviewExpand(index: number) {
    this.expandedReviews[index] = !this.expandedReviews[index];
  }

  checkOverflow(el: any, index: number) {
    if (!el) return;

    setTimeout(() => {
      el.classList.remove('clamp-text'); // temporarily remove clamp

      const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
      const maxHeight = 2 * lineHeight;

      const isOverflowing = el.scrollHeight > maxHeight;

      this.showMoreButton[index] = isOverflowing;

      if (!this.expandedReviews[index]) {
        el.classList.add('clamp-text'); // reapply if needed
      }
    }, 0); // short delay to allow DOM to stabilize
  }



  formatReviewText(text: string): SafeHtml {
    const maxLength = 120;
    let slicedText =
      text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

    // Replace #tags with <strong> versions
    const formatted = slicedText.replace(/#(\w+)/g, '<strong>#$1</strong>');

    // Sanitize the HTML before returning
    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }
  getPlainTextFromHTML(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent?.trim() || '';
  }

  countLines(html: string): number {
    //console.log('here');

    if (!html) return 0;

    // Convert <br> to newline
    let formatted = html.replace(/<br\s*\/?>/gi, '\n');

    // Convert block tags to newline
    formatted = formatted.replace(/<\/?(div|p|li|ul|ol|span)[^>]*>/gi, '\n');

    // Remove other tags
    formatted = formatted.replace(/<[^>]+>/g, '');

    // Split and count non-empty lines
    //console.log(formatted)
    return formatted
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0).length;
  }
  divId = 'c101922';
  embedId = 101922;
  projectId = 125;
  // @ViewChild('owlCarousel', { static: false }) owlCarousel!: CarouselComponent;
  // @ViewChild('owlCarousel', { static: false }) owlCarousel!: CarouselComponent;


  // trackByFn(index: number, item: any): any {
  //   return item?.id || index;
  // }

  // pauseCarousel(): void {
  //   if (this.owlCarousel && this.owlCarousel['carouselService']) {
  //     this.owlCarousel['carouselService'].autoplayStop();
  //   }
  // }

  // resumeCarousel(): void {
  //   if (this.owlCarousel && this.owlCarousel['carouselService']) {
  //     this.owlCarousel['carouselService'].autoplayStart();
  //   }
  // }



  customOptions = {
    loop: true,
    margin: 10,
    nav: false,
    dots: true,
    center: true,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    autoHeight: true,
    navText: ['<span><i class="fa-solid fa-caret-left"></i></span>', '<span><i class="fa-solid fa-caret-right"></i></span>'],
    responsive: {
      0: { items: 1 },
      768: { items: 1 },
      1000: { items: 1 },
    },
  };

  // src/app/gallery-data.ts
  GALLERY_IMAGES = [
    {
      url: 'https://i.imgur.com/E7Cz6WQ.jpg',
      alt: 'Image 1',
    },
    {
      url: 'https://i.imgur.com/z5X1y4p.jpg',
      alt: 'Image 2',
    },
    {
      url: 'https://i.imgur.com/xW0jRlw.jpg',
      alt: 'Image 3',
    },
    {
      url: 'https://i.imgur.com/UYiroysl.jpg',
      alt: 'Image 4',
    },
    {
      url: 'https://i.imgur.com/5tj6S7Ol.jpg',
      alt: 'Image 5',
    },
  ];

  images = this.GALLERY_IMAGES;
  selectedIndex = 0;

  openLayoutModal() {
    const modal = new bootstrap.Modal(document.getElementById('layoutModal'));
    modal.show();
  }

  openModal(index: number) {
    this.selectedIndex = index;
    const modal = new bootstrap.Modal(document.getElementById('galleryModal'));
    modal.show();
  }

  nextImage() {
    this.selectedIndex = (this.selectedIndex + 1) % this.images.length;
  }

  prevImage() {
    this.selectedIndex =
      (this.selectedIndex - 1 + this.images.length) % this.images.length;
  }

  canShowNext(): boolean {
    return this.selectedIndex < this.images.length - 1;
  }

  canShowPrev(): boolean {
    return this.selectedIndex > 0;
  }

  openLogin() {
    if (
      localStorage.getItem('memberId') === null ||
      localStorage.getItem('memberId') === undefined ||
      localStorage.getItem('memberId') === '0' ||
      localStorage.getItem('memberId') === ''
    ) {
      this.showLoginModal();
    } else {
      this.like();
    }
  }
  like() {
    this.apiService.LikeEvent(true, this.playId, this.memberId).subscribe({
      next: (response: any) => {


        if (response?.code === 200) {
          this.toastr.success('Interest registered successfully!', 'Success');
          // Optionally update UI
          this.getPlayDetails();
        } else {
          this.toastr.error(
            'Unable to register interest. Please try again.',
            'Error'
          );
        }
      },
      error: (err) => {
        this.toastr.error(
          'Something went wrong while registering your interest.',
          'Error'
        );
      },
    });
  }
  openLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  // 01-07-2025
  loadBookingFlag2 = false;
  gotoBookNow() {
    // if (this.tugozcount == 1) {
    //   // if (sessionStorage.getItem('preload') != undefined && sessionStorage.getItem('preload') != null) {
    //   //   this.tugozInstance.embed(sessionStorage.getItem('preload'));
    //   //   const el = document.querySelector('.overlay') as HTMLElement;
    //   //   if (el) el.style.display = 'none';
    //   // }
    //   this.tugozvisible = true;
    //   this.loadBookingFlag2 = true;
    //   // //console.log(this.tugozvisible)
    //   const target = document.getElementById('tugoz-container') as HTMLElement;
    //   if (target) {
    //     target.style.display = 'block';
    //   }
    //   const target2 = document.getElementById('tugoz-container2') as HTMLElement;
    //   if (target2) {
    //     target2.style.display = 'block';
    //   }
    //   // this.changeDetectorRef.detectChanges();

    //   setTimeout(() => {
    //     const loader1 = document.querySelector('#loadingDiv') as HTMLElement | null;
    //     if (loader1) {
    //       loader1.remove();
    //     }
    //     this.loadBookingFlag2 = false;
    //   }, 3000);
    // } else 
    // this.captchaToken = null;
    // //console.log('captchaRef2', this.captchaRef2);
    // if (this.captchaRef2) {
    //   this.captchaRef2.resetCaptcha();
    // }

    if (this.PlaysData.eventScheduleData.length == 1) {
      sessionStorage.setItem('hostingType', this.PlaysData.eventScheduleData[0]['VENUE_HOSTING_TYPE']);

    } else {
      sessionStorage.setItem('hostingType', 'N');
    }

    sessionStorage.setItem('eventname', this.PlaysData.EVENT_NAME);
    sessionStorage.setItem('eventimage', this.PlaysData.EVENT_IMAGE);
    sessionStorage.removeItem('sessionid');
    sessionStorage.setItem('maineventid', this.PlaysData.eventScheduleData[0]['MAIN_EVENT_ID']);
    sessionStorage.setItem('maineventname', this.PlaysData.eventScheduleData[0]['MAIN_EVENT_NAME']);

    if (this.PlaysData.eventScheduleData.length == 1) {
      const modalEl = document.getElementById('eventinfo22');
      if (modalEl) {
        const modal = new bootstrap.Modal(document.getElementById('eventinfo22')!);
        modal.show();
      }
    } else {
      var name: any = this.PlaysData.CATEGORY_NAME.toLowerCase()
        .replace(/[\/\\,]+/g, '') // Remove /, \, ,
        .replace(/[^a-z0-9\s-]/g, '') // Remove other special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with a single one
        .trim(); // Trim leading/trailing spaces
      this.router.navigate([
        'explore/',
        this.selectedCity,
        name,
        this.PlaysData.EVENT_SLUG,
        'buy-tickets',
        this.PlaysData._id,
      ]);
    }
  }

  proceed() {
    // if (!this.captchaToken) {
    //   this.toastr.error(
    //     'Please complete the CAPTCHA before proceed.',
    //     'Error'
    //   );

    //   return;
    // }
    sessionStorage.setItem('eventname', this.PlaysData.EVENT_NAME);
    sessionStorage.setItem('eventimage', this.PlaysData.EVENT_IMAGE);
    sessionStorage.removeItem('sessionid');
    {
      var name: any = this.PlaysData.CATEGORY_NAME.toLowerCase()
        .replace(/[\/\\,]+/g, '') // Remove /, \, ,
        .replace(/[^a-z0-9\s-]/g, '') // Remove other special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with a single one
        .trim(); // Trim leading/trailing spaces
      this.router.navigate([
        'explore/',
        this.selectedCity,
        name,
        this.PlaysData.EVENT_SLUG,
        'buy-tickets',
        this.PlaysData._id,
      ]);
    }
  }

  IS_BOOKING_COMPLETED: any;
  showLeftRightArrows = false;

  checkArrowVisibility() {

    const screenWidth = window.innerWidth;
    const totalItems = this.filteredPlaysData?.length || 0;

    if ((screenWidth >= 768 && totalItems > 3) || (screenWidth < 768 && totalItems > 2)) {
      this.showLeftRightArrows = true;
    } else {
      this.showLeftRightArrows = false;
    }
    this.changeDetectorRef.detectChanges();
  }


  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  scrollAmount = 300;

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({
      left: -this.scrollAmount,
      behavior: 'smooth'
    });
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({
      left: this.scrollAmount,
      behavior: 'smooth'
    });
  }

  selectedLat: number | null = null;
  selectedLng: number | null = null;
  name: string | null = null;

  // Called when user clicks "Open Pune/Mumbai Map"
  setLocation(name: any, lat: number, lng: number) {
    // prevent modal if not allowed
    if (name === 'Multiple Venue' || name === 'Multiple Venues' || name === 'To Be Decided') {
      return; // do nothing
    }
    this.selectedLat = lat;
    this.selectedLng = lng;
    this.name = name;
    const modalEl = document.getElementById('mapModal');
    const modal = new bootstrap.Modal(modalEl!);
    modal.show();
  }

  // Opens Google Maps in new tab
  openMap() {
    if (this.selectedLat && this.selectedLng) {

      // const url = `https://www.google.com/maps?q=${this.selectedLat},${this.selectedLng}`;
      const url = `https://www.google.com/maps/search/?api=1&query=${this.selectedLat},${this.selectedLng}&zoom=17`;
      // const url = `https://www.google.com/maps/place/${this.selectedLat},${this.selectedLng}/@${this.selectedLat},${this.selectedLng},17z`;
      window.open(url, "_blank");
    }
  }

  goBacks() {
    this.tugozvisible = false;
    const target = document.getElementById('tugoz-container') as HTMLElement;
    if (target) {
      target.style.display = 'none';
    }
    const target2 = document.getElementById('tugoz-container2') as HTMLElement;
    if (target2) {
      target2.style.display = 'none';
    }
  }

  activeVideoIndex: number | null = null;
  private playingIframeIndex: number | null = null;

  videoId(url: string): string {
    const match = url.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  }

  playVideo(index: number, video: any) {
    this.stopVideo();

    const match = video.URL.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/);
    const videoId = match ? match[1] : '';

    video.embedUrlSanitized = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&mute=1`
    );

    this.activeVideoIndex = index;
    this.playingIframeIndex = index;
    //console.log('aaa');

  }


  stopVideo() {
    if (this.playingIframeIndex !== null) {
      const iframe = document.getElementById(`video-iframe-${this.playingIframeIndex}`) as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        iframe.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
        iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
      }
    }

    this.activeVideoIndex = null;
    this.playingIframeIndex = null;

    //console.log('sdsd');

  }
  trackByVideo(index: number, video: any) {
    return video.URL;
  }

  cancelproceed() {
    // this.captchaToken = null;
    // //console.log('captchaRef2', this.captchaRef2);
    // if (this.captchaRef2) {
    //   this.captchaRef2.resetCaptcha();
    // }
    this.loadBookingFlag2 = false;
  }

  // // Add these properties to your component class
  // @ViewChild('captchaRef2') captchaRef2!: ReCaptcha2Component;

  // captchaToken: string | null = null;

  // // ================= CAPTCHA Event Handlers =================
  // handleCaptchaSuccess(token: string) {
  //   this.captchaToken = token;
  //   // //console.log('Captcha token:', token);
  // }

  // handleCaptchaExpire() {
  //   this.captchaToken = null;
  //   // //console.log('Captcha expired');
  // }

  // handleCaptchaError(error: any) {
  //   console.error('Captcha error', error);
  //   console.error('captchaRef2', this.captchaRef2);
  //   if (this.captchaRef2) {
  //     this.captchaRef2.resetCaptcha();
  //   }
  //   this.captchaToken = null;
  // }


}
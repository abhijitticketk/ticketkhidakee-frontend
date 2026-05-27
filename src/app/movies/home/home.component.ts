import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Services/api.service';
import { LocationService } from 'src/app/Services/location.service';

export interface Banner {
  NAME: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  IMG_URL: string;
}
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],

})
export class HomeComponent {
  // @HostListener('window:resize', [])
  // onResize() {
  //   this.updateArrows();
  // }
  @ViewChildren('scrollContainer') scrollContainers!: QueryList<ElementRef>;
  // scrollButtonVisibility: { [key: number]: { left: boolean; right: boolean } } = {};
  scrollButtonVisibility: { left: boolean; right: boolean }[] = [];
  sectionLoadState: { [index: number]: { page: number; hasMore: boolean; loading: boolean } } = {};

  scrollAmount = 1000;
  canScrollLeft = false;
  canScrollRight = true;
  showArrows = false;
  banners: Banner[] = [];
  MovieData: any[] = [];
  EventData: any[] = [];
  sectionData: any[] = [];
  scheduleActivityDetails: any[] = [];
  selectedCity = this.cookie.get('cityName');
  selectedCityId: any;
  mainShowDates: any;
  mainShowTime: any;
  mainShowVenues: any;


  constructor(
    private apiService: ApiService,
    private router: Router,
    private cookie: CookieService,
    private meta: Meta, private title: Title
  ) { this.isLoading = true; }
  cityname: any
  retriveimgUrl = this.apiService.retriveimgUrl;
  isLoading: boolean = true;

  memberId: any;
  isMobile: Boolean = false;
  ngOnInit(): void {
    localStorage.setItem('islogiiing', 'true');
    this.isLoading = true;
    // this.getBanners();
    // this.fetchAllWishlistData();
    this.updateMetaTags()
    localStorage.setItem('selectedCategory', '');

    this.isMobile = this.apiService.isMobileDevice();

    if (this.isMobile) {
      this.scrollAmount = 400;
      this.pageindexforsize = 6
    } else {
      this.scrollAmount = 1000;
      this.pageindexforsize = 12
    }
    this.memberId = localStorage.getItem('memberId');

    this.selectedCityId = Number(this.cookie.get('cityId'))
    this.cityname = this.cookie.get('cityName')
    this.getdyanamicsessiondata();

    // if (this.memberId) {
    //   this.fetchAllWishlistData();
    // }

    // this.router.events.subscribe((event: any) => {
    //     if (event instanceof NavigationStart) {

    //     }
    //     if (event instanceof NavigationEnd) {
    //       const currentUrl = event.urlAfterRedirects;
    //       console.log(currentUrl);
    //       if()
    //       this.router.navigate(['/explore', this.cityname, event.CATEGORY_NAME, event.EVENT_SLUG ? event.EVENT_SLUG : event.TITLE, event.EVENT_TYPE_ID]);
    //     }
    //   });


    window.moveTo(0, 0);
  }


  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.startCustomAutoplay();
    // }, 0);
    // Run after the view initializes and get scroll containers ready
    setTimeout(() => {

      this.scrollContainers.forEach((container, i) => {
        this.updateScrollButtons(i, container.nativeElement);
      });
    }, 1000);


  }

  // Called on scroll and on init


  updateScrollButtons(index: number, container: HTMLElement) {
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    this.scrollButtonVisibility[index] = {
      left: scrollLeft > 0,
      right: scrollLeft + clientWidth < scrollWidth - 1
    };
  }


  categories = [];
  getCategories() {
    this.categories = [];
    this.apiService
      .getAllCategories(0, 0, 'id', 'asc', ' AND STATUS = 1')
      .subscribe(
        (data: any) => {
          if (data?.code === 200 && data?.data?.length > 0) {
            this.categories = data.data;
          }
        },
        (error: any) => { }
      );
  }
  wishlistItems: any[] = [];
  filteredWishlistItems: any[] = [];
  isWishlistLoading: boolean = false;

  fetchAllWishlistData() {
    // this.isWishlistLoading = true;

    // this.apiService
    //   .getallwishlist(0, 0, 'id', 'desc', 'AND MEMBER_ID = ' + this.memberId)
    //   .subscribe(
    //     (response: any) => {
    //       const isSuccessful = response?.code == 200;
    //       const hasData = response?.data?.length > 0;

    //       if (isSuccessful && hasData) {
    //         this.wishlistItems = response.data;
    //         this.filteredWishlistItems = [...this.wishlistItems];


    //       }

    //       this.isWishlistLoading = false;
    //       this.addbookmarkspin = false;
    //     },
    //     (error: any) => {
    //       console.error('Error fetching wishlist data:', error);
    //       this.isWishlistLoading = false;
    //     }
    //   );
  }


  eventsSections: any;
  loading: boolean = false;
  dynamicSections: any;


  encodeUrl(imageUrl: string): string {
    // Encode the image file name only, and hardcode 'Play Photos' as 'Play%20Photos'
    return `url(assets/Play%20Photos/${encodeURIComponent(imageUrl)})`;
  }


  addbookmarkspin: any = true;
  toggleBookmark(event: any, eventdata: any) {
    eventdata.isBookmarked = true


    const isLiking = !event.bookmarked;

    var newwwdata = this.filteredWishlistItems.find(
      (item: any) => item.EVENT_ID == event
    );

    var statussss = true;

    if (newwwdata?.STATUS) {
      statussss = false;
    } else {
      statussss = true;
    }

    const likePayload = {
      MEMBER_ID: Number(this.memberId),
      EVENT_ID: event,
      STATUS: statussss,
      ID: newwwdata?.ID,
    };



    if (newwwdata?.ID) {
      this.apiService.updateBookmark(likePayload).subscribe({
        next: (res: any) => {
          if (res.code == '200') {
            // event.bookmarked = !event.bookmarked;
            const actionMessage = event.bookmarked ? 'added' : 'removed';
            // this.toastr.success(
            //   `Bookmark ${actionMessage} successfully.`,
            //   'Success'
            // );
          } else {
            // this.toastr.warning('Could not update the bookmark.', 'Warning');
          }
          eventdata.isBookmarked = false
          this.fetchAllWishlistDatanewwww(eventdata);
        },

        error: () => {
          eventdata.isBookmarked = false
          // this.toastr.error('Error updating bookmark.', 'Error');
        },
      });
    } else {
      this.apiService.createBookmark(likePayload).subscribe({
        next: (res: any) => {
          if (res.code == '200') {
            // this.toastr.success('Bookmark added successfully.', 'Success');
          } else {
            // this.toastr.warning('Could not add the bookmark.', 'Warning');
          }
          this.fetchAllWishlistDatanewwww(eventdata);
        },
        error: () => {
          this.addbookmarkspin = false;
          // this.toastr.error('Error adding bookmark.', 'Error');
        },
      });
    }
  }




  get isNoData(): boolean {
    return (
      !this.dynamicSections?.length ||
      this.dynamicSections.every((section: any) => !section.EVENTS?.length)
    );
  }
  getEventRouterLink(section: any, event: any): any[] {
    return ['/explore', this.cityname, event.CATEGORY_NAME, event.EVENT_SLUG, event._id];
    // { path: ':city/:categorytype/:slug/:id/:playtype', component: PlaysDetailsComponent },
  }

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

  onImageError(event: any) {
    event.target.src = '/assets/movie_skel.jpg';
  }

  navigateToMovies() {
    const citySlug = this.selectedCity.toLowerCase().replace(/\s+/g, '-');
    this.router.navigate([`/movies/${citySlug}`]);
  }

  // @ViewChildren('scrollContainer') scrollContainers!: QueryList<ElementRef>;




  // scrollLeft(index: number): void {
  //   const container = this.scrollContainers.toArray()[index];
  //   container.nativeElement.scrollBy({
  //     left: -this.scrollAmount,
  //     behavior: 'smooth',
  //   });
  // }

  // scrollRight(index: number): void {
  //   const container = this.scrollContainers.toArray()[index];
  //   container.nativeElement.scrollBy({
  //     left: this.scrollAmount,
  //     behavior: 'smooth',
  //   });


  // }
  scrollLeft(index: number) {
    const container = this.scrollContainers.toArray()[index].nativeElement;
    container.scrollBy({ left: -this.scrollAmount, behavior: 'smooth' });
    setTimeout(() => this.onScroll(index), 400); // allow smooth scroll to finish
  }

  scrollRight(index: number, section: any) {
    const container = this.scrollContainers.toArray()[index].nativeElement;
    container.scrollBy({ left: this.scrollAmount, behavior: 'smooth' });
    setTimeout(() => this.onScroll(index), 400);
    if (section) this.loadMoreSectionEvents(index, section);
  }

  // onScroll(index: number): void {
  //   // Optional: handle scroll tracking per section if needed
  //   const container = this.scrollContainers.toArray()[index];

  // }

  // onScroll(index: number) {
  //   const el = this.scrollContainers.toArray()[index].nativeElement;
  //   const atStart = el.scrollLeft === 0;
  //   const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;

  //   this.scrollButtonVisibility[index] = {
  //     left: !atStart,
  //     right: !atEnd,
  //   };
  // }
  sessiondatadyanamicmainnnnn: any = []
  onScroll(index: number, section?: any) {
    const container = this.scrollContainers.toArray()[index].nativeElement;
    this.updateScrollButtons(index, container);
    const nearEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 150;
    if (nearEnd && section) this.loadMoreSectionEvents(index, section);
  }

  getSectionByIndex(i: number): any {
    const onTopLen = this.sessiondatadyanamicOnTop?.length || 0;
    if (i < onTopLen) return this.sessiondatadyanamicOnTop[i];
    return this.sessiondatadyanamicBelow?.[i - onTopLen];
  }

  loadMoreSectionEvents(sectionIndex: number, section: any) {
    if (!this.sectionLoadState[sectionIndex]) {
      const totalAvailable = section.SECTION_DATA_COUNT;
      const alreadyLoaded = section.SECTION_DATA?.length || 0;
      this.sectionLoadState[sectionIndex] = {
        page: 1,
        hasMore: totalAvailable != null ? alreadyLoaded < totalAvailable : true,
        loading: false
      };
    }
    const state = this.sectionLoadState[sectionIndex];
    if (state.loading || !state.hasMore) return;

    state.loading = true;
    const nextPage = state.page + 1;
    const sectionId = section.SECTION_ID;
    // console.log(section);

    this.apiService.getMoreEventsForSection(nextPage, 8, sectionId)
      .subscribe({
        next: (data: any) => {
          if (data?.code === 200 && Array.isArray(data.data) && data.data.length > 0) {
            const newEvents = data.data.map((e: any) => ({ ...e, imageLoaded: false }));
            section.SECTION_DATA = [...section.SECTION_DATA, ...newEvents];
            state.page = nextPage;
            const total = section.SECTION_DATA_COUNT;
            state.hasMore = total != null ? section.SECTION_DATA.length < total : newEvents.length >= 8;
          } else {
            state.hasMore = false;
          }
          state.loading = false;
          setTimeout(() => {
            const el = this.scrollContainers.toArray()[sectionIndex]?.nativeElement;
            if (el) this.updateScrollButtons(sectionIndex, el);
          }, 100);
        },
        error: () => {
          state.loading = false;
        }
      });
  }
  // shubham code
  mainbannersessiondatadyanamicforcheck1: any = [];
  sessiondatadyanamic: any = [];
  sessiondatadyanamicOnTop: any = [];
  sessiondatadyanamicBelow: any = [];
  belowSectionsLoaded: boolean = false;
  mainbannersessiondatadyanamic: any = [];
  pageindex = 1
  count = 0

  private processSections(data: any[]): any[] {
    return data
      .filter((item: any) =>
        !item.IS_MAIN_BANNER &&
        Array.isArray(item.SECTION_DATA) &&
        item.SECTION_DATA.length > 0
      )
      .sort((a: any, b: any) => a.SEQUENCE_NUMBER - b.SEQUENCE_NUMBER)
      .map((item: any) => {
        item.SECTION_DATA = item.SECTION_DATA.sort((a: any, b: any) => a.SEQUENCE - b.SEQUENCE);
        item.SECTION_DATA.forEach((sectionItem: any, j: number) => {
          sectionItem.isBookmarked = !!this.addbookmarkspin?.[item.SEQUENCE_NUMBER]?.[j];
          sectionItem.imageLoaded = false;
        });
        return item;
      });
  }

  getdyanamicsessiondata() {
    this.isLoading = true;
    this.belowSectionsLoaded = false;
    localStorage.setItem('islogiiing', 'false');
    this.apiService
      .getsessionmaappingdata(0, 0, '', '', 'sm.IS_ON_TOP = 1 OR sm.IS_MAIN_BANNER = 1', this.selectedCityId)
      .subscribe((data) => {
        if (data['code'] == 200) {
          this.sessiondatadyanamic = data['data'];
          this.sessiondatadyanamicmainnnnn = data['data'];
          this.count = data['count'];

          this.mainbannersessiondatadyanamic = data['data']
            .filter((item: any) => item.IS_MAIN_BANNER)
            .map((item: any) => {
              if (item.SECTION_DATA && Array.isArray(item.SECTION_DATA)) {
                item.SECTION_DATA = item.SECTION_DATA.sort(() => Math.random() - 0.5);
              }
              return item;
            });

          this.currentIndex = 0;
          this.mainbannersessiondatadyanamicforcheck1 = this.mainbannersessiondatadyanamic;
          this.mainbannersessiondatadyanamic = this.mainbannersessiondatadyanamic[0];

          this.sessiondatadyanamicOnTop = this.processSections(data['data']);
          this.sessiondatadyanamicBelow = [];
          this.geteventlistdataall();
        } else {
          this.sessiondatadyanamic = [];
          this.sessiondatadyanamicOnTop = [];
          this.sessiondatadyanamicBelow = [];
          this.isLoading = false;
        }
      });
  }

  getdyanamicsessiondatabelow() {
    this.apiService
      .getsessionmaappingdata(0, 0, '', '', 'sm.IS_ON_TOP = 0', this.selectedCityId)
      .subscribe((data) => {
        if (data['code'] == 200) {
          this.sessiondatadyanamicBelow = this.processSections(data['data']);
        }
      });
  }

  gotoroutube(event: any) {

    if (event.REDIRECT_TYPE == 'U') {
      this.router.navigate(['/explore', this.cityname, event.CATEGORY_NAME, event.EVENT_SLUG ? event.EVENT_SLUG : event.TITLE, event.EVENT_TYPE_ID]);
      // return ['/explore', this.cityname, event.CATEGORY_NAME, event.EVENT_SLUG, event._id];
    } else if (event.REDIRECT_TYPE == 'E') {
      const url = `/explore/shows/${this.selectedCity}/${encodeURIComponent(
        event.TITLE
      )}/${event.BANNER_ID}`;

      this.router.navigateByUrl(url);
    } else if (event.REDIRECT_TYPE == 'ME') {
      const url = `/explore/subEvent/${event.EVENT_TYPE_ID}`;

      this.router.navigateByUrl(url);
    }
  }
  onEventClick(event: any) {
    const catID1 = Number(event.CATEGORY_ID);
    //  console.error('Event de',event)
    if (event.HAS_SUB_EVENTS) {
      const schedules = event.schedules || [];

      this.mainShowDates = [
        ...new Set(schedules.map((s: any) => s.SHOW_DATE))
      ];

      this.mainShowTime = [
        ...new Set(schedules.map((s: any) => s.SHOW_TIME))
      ];




      //Event Date time
      localStorage.setItem('Date', JSON.stringify(this.mainShowDates));
      localStorage.setItem('Time', JSON.stringify(this.mainShowTime));
      localStorage.setItem('Venues', (event.VENUE_NAME));

      this.router.navigate(['/explore/subEvent', event._id]);
    } else {
      this.router.navigate(['/explore', this.cityname, event.CATEGORY_NAME, event.EVENT_SLUG, event._id]);
      this.mainShowDates = [];
      this.mainShowTime = [];
    }
  }
  getbookmarked(iddd: any) {
    if (iddd) {
      var newwwdata = this.filteredWishlistItems.find(
        (item: any) => item.EVENT_ID == iddd
      );

      if (newwwdata) {
        if (newwwdata.STATUS) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getFirstGenre2(genreString: string): string {
    if (!genreString) return ''; // handles null, undefined, or empty string
    const genres = genreString.split(',').map((g) => g.trim()).reverse();
    // console.log(genreString, genres);
    return genres.length > 1 ? `${genres[0]}` : genres[0];
  }
  getFirstGenre(genreString: string): string {
    if (!genreString) return ''; // handles null, undefined, or empty string
    const genres = genreString.split(',').map((g) => g.trim()).reverse();

    return genres.length > 1 ? `${genres[0]}` : genres[0];
  }
  hasMoreGenres(genreString: string): boolean {
    if (!genreString) return false;
    return genreString.split(',').map((g) => g.trim()).length > 1;
  }

  formatShowDates(dateRange: string, time: any, sectionID: any): string {

    if (!dateRange || !dateRange.includes('TO')) return '';

    const dates = dateRange.split(' TO ');
    const firstRaw = dates[0]?.trim();
    const secondRaw = dates[1]?.trim();

    const parseDDMMYYYY = (dateStr: string): Date => {
      const [day, month, year] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    const parseYYYYMMDD = (dateStr: string): Date => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };


    if (sectionID == '1') {
      var firstDate = parseYYYYMMDD(firstRaw);
      var secondDate = parseYYYYMMDD(secondRaw);
    } else {
      var firstDate = parseDDMMYYYY(firstRaw);
      var secondDate = parseDDMMYYYY(secondRaw);
    }

    if (isNaN(firstDate.getTime()) || isNaN(secondDate.getTime())) {
      // console.error('Invalid date(s):', firstRaw, secondRaw);
      return '';
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const formatDate = (date: Date): string => {
      const day = date.getDate(); // no leading zero
      const month = monthNames[date.getMonth()];
      return `${month} ${day}`;
    };

    const firstFormatted = formatDate(firstDate);
    const secondFormatted = formatDate(secondDate);

    if (firstFormatted === secondFormatted) {
      return `${firstFormatted}, ${time}`;
    } else {
      return `${firstFormatted}, onwards`;
    }
  }


  // customOptions = {
  //   loop: true,
  //   margin: 10,
  //   nav: true,
  //   dots: true,
  //   center: true,
  //   autoplay: false, // disable autoplay here

  //   responsive: {
  //     0: { items: 1 },
  //     768: { items: 2 },
  //     1000: { items: 2 },
  //   },
  // };

  customOptions = {
    loop: true,
    margin: 10,
    nav: true,
    dots: false,
    center: true,
    autoplay: false,
    navText: ['<span><i class="fa-solid fa-caret-left"></i></span>', '<span><i class="fa-solid fa-caret-right"></i></span>'],
    responsive: {
      0: { items: 1 },
      768: { items: 2 },
      1000: { items: 2 },
    },
  };


  customOptions222 = {
    loop: true,
    margin: 5,
    nav: true,
    dots: false,

    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    responsive: {
      0: { items: 1 },
      768: { items: 2 },
      1000: { items: 2 },
    },
    navText: [
      '<i class="fa-solid fa-caret-left"></i>',
      '<i class="fa-solid fa-caret-right"></i>'
    ]
  };
  slideTimer: any;
  currentIndex = 0;

  @ViewChild('owlCarousel', { static: false }) owlCarousel: any;
  // startCustomAutoplay() {
  //   if (!this.mainbannersessiondatadyanamic?.SECTION_DATA?.length) return;

  //   const banner = this.mainbannersessiondatadyanamic.SECTION_DATA[this.currentIndex];
  //   const duration = banner?.DISPLAY_TIME || 3000; // fallback if TIMER not found

  //   this.slideTimer = setTimeout(() => {
  //     this.owlCarousel.next();
  //   }, duration);
  // }

  // startCustomAutoplay() {
  //   if (
  //     !this.mainbannersessiondatadyanamic?.SECTION_DATA?.length ||
  //     !this.owlCarousel
  //   )
  //     return;

  //   const banner = this.mainbannersessiondatadyanamic.SECTION_DATA[this.currentIndex];
  //   const durationInSeconds = parseInt(banner?.TIMER || '3', 10); // default to 3 seconds if TIMER is missing
  //   const duration = durationInSeconds * 1000; // convert to milliseconds

  //   this.slideTimer = setTimeout(() => {
  //     if (this.owlCarousel) {
  //       this.owlCarousel.next();
  //     }
  //   }, duration);
  // }
  onSlideTranslated(event: any) {

    clearTimeout(this.slideTimer);

    // Get actual index ignoring clones
    const realIndex = event.item.index % this.mainbannersessiondatadyanamic.SECTION_DATA.length;

    this.currentIndex = realIndex;
    this.startCustomAutoplay();
  }


  onCarouselInitialized(event: any) {
    // Start autoplay after carousel is ready
    this.startCustomAutoplay();
  }

  onSlideChanged(event: any) {
    clearTimeout(this.slideTimer);

    const total = this.mainbannersessiondatadyanamic.SECTION_DATA.length;
    const rawIndex = event?.startPosition;

    if (typeof rawIndex !== 'number' || isNaN(rawIndex)) {
      // console.warn('Invalid slide index:', rawIndex);
      return;
    }

    const realIndex = rawIndex % total;
    this.currentIndex = realIndex;

    this.startCustomAutoplay();
  }
  startCustomAutoplay() {
    const data = this.mainbannersessiondatadyanamic.SECTION_DATA;
    if (!data || data.length === 0 || this.currentIndex >= data.length) return;

    const banner = data[this.currentIndex];
    const durationInSec = parseInt(banner?.DISPLAY_TIME || '3', 10);
    const duration = isNaN(durationInSec) ? 3000 : durationInSec * 1000;

    this.slideTimer = setTimeout(() => {
      if (this.owlCarousel) {
        this.owlCarousel.next();
      }
    }, duration);
  }



  fetchAllWishlistDatanewwww(event: any) {
    this.isWishlistLoading = true;

    this.apiService
      .getallwishlist(0, 0, 'id', 'desc', 'AND MEMBER_ID = ' + this.memberId)
      .subscribe(
        (response: any) => {
          const isSuccessful = response?.code == 200;
          const hasData = response?.data?.length > 0;
          event.isBookmarked = false
          if (isSuccessful && hasData) {
            this.wishlistItems = response.data;
            this.filteredWishlistItems = [...this.wishlistItems];
            event.isBookmarked = false
            // After fetching wishlist data, update MovieData with bookmark status
            // this.updateBookmarkStatus();
          }

          this.isWishlistLoading = false;
          event.isBookmarked = false
        },
        (error: any) => {
          // console.error('Error fetching wishlist data:', error);
          this.isWishlistLoading = false;
          event.isBookmarked = false
        }
      );
  }

  loadingnewww: boolean = false

  @HostListener('window:scroll', ['$event'])
  onScrollhome() {
    if (this.loadingnewww || this.loading) return;

    const scrollPosition = window.scrollY + window.innerHeight;

    const isMobile = window.innerWidth <= 1000;
    const threshold = document.body.offsetHeight - (isMobile ? 500 : 400);
    if (scrollPosition >= threshold && this.count > this.sessiondatadyanamicmainnnnn.length) {
      this.loadingnewww = true;
      this.pageindex++;
      this.getdyanamicsessiondatatttt();
    }
  }


  getdyanamicsessiondatatttt() {
    this.loadingnewww = true;
    this.apiService
      .getsessionmaappingdata(0, 0, '', '', '', this.selectedCityId)
      .subscribe((data) => {
        if (data['code'] == 200) {
          var newdataaa = data['data'];
          this.sessiondatadyanamicmainnnnn = [
            ...(this.sessiondatadyanamicmainnnnn || []),
            ...(newdataaa || [])
          ];
          // alert(this.sessiondatadyanamicmainnnnn.length)
          // this.count = data['count'];

          // this.mainbannersessiondatadyanamic = data['data']
          //   .filter((item: any) => item.IS_MAIN_BANNER)
          //   .map((item: any) => {
          //     if (item.SECTION_DATA && Array.isArray(item.SECTION_DATA)) {
          //       item.SECTION_DATA = item.SECTION_DATA.sort(
          //         (a: any, b: any) => a.SEQUENCE - b.SEQUENCE
          //       );
          //     }
          //     return item;
          //   });



          // newdataaa = data['data']
          //   .filter(
          //     (item: any) =>
          //       !item.IS_MAIN_BANNER &&
          //       Array.isArray(item.SECTION_DATA) &&
          //       item.SECTION_DATA.length > 0
          //   )
          //   .sort((a: any, b: any) => a.SEQUENCE_NUMBER - b.SEQUENCE_NUMBER)
          //   .map((item: any, i: number) => {
          //     item.SECTION_DATA = item.SECTION_DATA
          //       .sort((a: any, b: any) => a.SEQUENCE - b.SEQUENCE)
          //       .map((sectionItem: any, j: number) => {
          //         // Add boolean value from addbookmarkspin
          //         sectionItem.isBookmarked = !!this.addbookmarkspin?.[i]?.[j];
          //         sectionItem.imageLoaded = !!this.addbookmarkspin?.[i]?.[j];
          //         return sectionItem;
          //       });
          //     return item;
          //   });


          newdataaa = data['data']
            .filter(
              (item: any) =>
                !item.IS_MAIN_BANNER &&
                Array.isArray(item.SECTION_DATA) &&
                item.SECTION_DATA.length > 0
            )
            .sort((a: any, b: any) => a.SEQUENCE_NUMBER - b.SEQUENCE_NUMBER)
            .map((item: any) => {
              item.SECTION_DATA = item.SECTION_DATA.sort((a: any, b: any) => a.SEQUENCE - b.SEQUENCE);
              item.SECTION_DATA.forEach((sectionItem: any, j: number) => {
                // Add boolean value from addbookmarkspin
                sectionItem.isBookmarked = !!this.addbookmarkspin?.[item.SEQUENCE_NUMBER]?.[j];
                sectionItem.imageLoaded = false;
              });
              return item;
            });


          if (newdataaa.length > 0) {
            this.sessiondatadyanamicOnTop = [...this.sessiondatadyanamicOnTop, ...newdataaa.filter((i: any) => Number(i.IS_ON_TOP) === 1)];
            this.sessiondatadyanamicBelow = [...this.sessiondatadyanamicBelow, ...newdataaa.filter((i: any) => Number(i.IS_ON_TOP) !== 1)];
          }
          this.loadingnewww = false;
        } else {
          this.loadingnewww = false;
        }
      });
  }


  onImageLoad(event: any) {
    event.imageLoaded = true;
  }


  // updateMetaTags() {
  //   this.title.setTitle('Ticket Khidakee - Home');
  //   this.meta.updateTag({ property: 'og:title', content: "Ticket Khidakee - Home" });
  //   this.meta.updateTag({ name: 'keywords', content: "ticket booking, event tickets, show tickets, online ticket booking, Ticket Khidakee, ticket khidki, Online ticket booking" });
  //   // Canonical Tag
  //   let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
  //   link.setAttribute('rel', 'canonical');
  //   link.setAttribute('href', window.location.href);
  //   document.head.appendChild(link);
  // }


  updateMetaTags() {


    this.title.setTitle('Book Tickets Online for Events & Shows | Ticket Khidakee');

    this.meta.updateTag({
      name: 'description',
      content: 'Ticket Khidakee offers easy online ticket booking for entertainment shows, events, and activities. Book concert, play, and event tickets all in one place!'
    });
    this.meta.updateTag({
      name: 'keywords',
      content: 'activities, entertainment events, ticket booking, Ticket Khidakee, ticket khidki, online events, concert tickets, online ticket booking, book tickets online, event tickets, Branded Keywords: Globillete Entertainment, Ticket Khidakee, entertainment events, show tickets, event booking, concerts, plays, activities, movie screenings'
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.meta.updateTag({
      property: 'og:title',
      content: 'Ticket Khidakee - Book Event Tickets Online'
    });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Book tickets for concerts, movies, plays & more on Ticket Khidakee. Easy online booking with secure payments.'
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: window.location.href });
    this.meta.updateTag({
      property: 'og:image',
      content: 'https://static.readdy.ai/image/afcc47cb1dc09e4f18793aaad07a3df7/296c6bbc31613159efddba4235006534.png'
    });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: 'Ticket Khidakee - Home' });
    this.meta.updateTag({
      name: 'twitter:description',
      content: 'Book event tickets online with Ticket Khidakee. Fast, easy, and secure ticket booking for concerts, shows, and live events near you.'
    });
    this.meta.updateTag({
      name: 'twitter:image',
      content: 'https://static.readdy.ai/image/afcc47cb1dc09e4f18793aaad07a3df7/296c6bbc31613159efddba4235006534.png'
    });

    let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    if (!document.head.contains(link)) {
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Ticket Khidakee",
      "url": window.location.href,
      "potentialAction": {
        "@type": "SearchAction",
        "target": window.location.href + "/search?query={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    });
    const existingScript = document.querySelector("script[type='application/ld+json']");
    if (existingScript) {
      existingScript.remove();
    }
    document.head.appendChild(script);
  }
  listofallcategorydataDUMMY: any
  pageindexforlist = 1

  listofallcategorydata: any = []
  listcount = 0


  page: number = 1;
  pageSize: number = 12;

  geteventlistdataall(page: number = 1) {
    const filterParams: any = { BOOKING_STATUS: 'S' };

    this.apiService
      .getalleventlist(
        page,
        this.pageSize,
        'IS_PROMOTED',
        'DESC',
        filterParams,
        0,
        0
      )
      .subscribe(
        (data: any) => {
          this.isLoading = false;
          if (data?.code === 200 && data?.data?.length > 0) {
            this.listcount = data.count;

            const filteredEvents = data.data.filter((event: any) => {
              const schedules = event.schedules || [];
              return !(schedules.length === 1 && schedules[0].PUBLISH_FOR_GUEST === true);
            });

            const events = filteredEvents.map((item: any) => ({
              ...item,
              imageLoaded: false,
            }));

            if (page === 1) {
              this.listofallcategorydata = events;
            } else {
              this.listofallcategorydata = [...this.listofallcategorydata, ...events];
            }

            this.hasMoreData = this.listofallcategorydata.length < data.count;
          } else {
            if (page === 1) {
              this.listofallcategorydata = [];
            }
            this.hasMoreData = false;
          }
          if (!this.hasMoreData && !this.belowSectionsLoaded) {
            this.belowSectionsLoaded = true;
            this.getdyanamicsessiondatabelow();
          }
          this.isLoadingforcrollll = false;
        },
        () => {
          this.isLoading = false;
          this.isLoadingforcrollll = false;
        }
      );
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.isLoadingforcrollll || !this.hasMoreData) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;
    if (this.isMobile) {
      if (scrollPosition >= pageHeight - 1200) {
        this.loadMoreEvents();
      }
    } else
      if (scrollPosition >= pageHeight - 900) {
        this.loadMoreEvents();
      }
  }

  loadMoreEvents(): void {
    if (!this.hasMoreData) return;

    this.isLoadingforcrollll = true;
    this.page++;
    this.geteventlistdataall(this.page);
  }

  hasMoreData: boolean = true;
  showallevent = false

  viewallevents() {

    this.geteventlistdataallforload()
  }

  pageindexforsize = 12

  geteventlistdataallforload() {
    if (this.isLoading) return;
    this.isLoadingforcrollll = true;
    this.pageindexforlist++
    const filterParams: any = {
      BOOKING_STATUS: 'S',
    };
    this.apiService
      .getalleventlist(this.pageindexforlist, this.pageindexforsize, 'IS_PROMOTED', 'DESC', filterParams
        , 0, 0)
      .subscribe(
        (data: any) => {
          if (data?.code === 200 && data?.data?.length > 0) {

            this.isLoadingforcrollll = false
            this.listcount = data.count
            // var newdata = data.data.map((item: any) => {
            //   item.imageLoaded = false
            //   return item
            // })

            this.listofallcategorydataDUMMY = [...this.listofallcategorydataDUMMY, ...data.data]


            const filteredEvents = data.data.filter((event: { schedules: any }) => {
              const schedules = event.schedules || [];
              if (schedules.length === 1 && schedules[0].PUBLISH_FOR_GUEST === true) {
                return false;
              }
              return true;
            });
            // this.listofallcategorydata = filteredEvents;
            var newdata = filteredEvents.map((item: any) => {
              item.imageLoaded = false
              return item
            })


            this.listofallcategorydata = [...this.listofallcategorydata, ...newdata]
            this.listcount = data.count;
            if (this.listcount === this.listofallcategorydataDUMMY.length) {
              this.showallevent = true;
            } else {
              this.showallevent = false;
            }
          } else {
            this.showallevent = false;
            this.isLoadingforcrollll = false;
          }
        },
        (error: any) => { this.isLoadingforcrollll = false; this.showallevent = false; }
      );
  }

  isLoadingforcrollll = false
  onScrolllllll(div: HTMLElement): void {
    const scrollTop = div.scrollTop;
    const scrollHeight = div.scrollHeight;
    const clientHeight = div.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight) {
      if (this.listcount === this.listofallcategorydataDUMMY.length) {
        // All data loaded
        // this.message.info('All Employee Load');
      } else {
        this.geteventlistdataallforload();
      }
    }
  }
}





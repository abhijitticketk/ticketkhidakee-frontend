import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
// import Konva from 'konva';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Services/api.service';
import { CategoryService } from 'src/app/Services/category.service';
import { LocationService } from 'src/app/Services/location.service';

interface Filter {
  name: string;
  id: string;
  key: string;
  visibleCount: number;
  searchTerm: string;
  [key: string]: any; // <- add this line
}
type FilterKey = 'subcategory' | 'LangaugeData' | 'GenresData' | 'tagsData';

@Component({
  selector: 'app-plays-list',
  templateUrl: './plays-list.component.html',
  styleUrls: ['./plays-list.component.scss'],
})
export class PlaysListComponent {
  // expandedSections: { [key: string]: boolean } = {};
  @ViewChild('stageContainer', { static: true }) stageContainer!: ElementRef;



  ngAfterViewInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      this.showArrows = this.PlaysData.length > 5;
      this.canScrollRight = true;

      if (this.scrollContainer) {
        this.updateArrows();
      }
    }, 0);

    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      // Now safe to use
    }
  }

  memberId = localStorage.getItem('memberId');

  selectedsc: string[] = [];
  selectedGenre: string[] = [];
  selectedScreenType: string[] = [];

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private cookie: CookieService,
    private apiService: ApiService,
    private locationService: LocationService,
    private router: Router,
    private datePipe: DatePipe,
    private meta: Meta, private title: Title
  ) {
    const today = new Date();
    this.currentMonth = today.getMonth(); // This should be 0-11
    this.currentYear = today.getFullYear();
  }
  showMobileFilters = false;
  expandedSections: { [key: string]: boolean } = {};

  get isMobileView(): boolean {
    return window.innerWidth < 768;
  }

  // Called when user clicks on filter title
  toggleSection(filterId: string) {
    this.expandedSections[filterId] = !this.expandedSections[filterId];
  }

  retriveimgUrl = this.apiService.retriveimgUrl;
  isLoading: boolean = true;
  selectedCity = this.cookie.get('cityName');

  banners: any[] = [];
  LangaugeData: any[] = [];
  SubCategoryData: any[] = [];
  mainShowDates: any;
  mainShowTime: any;
  mainShowVenues:any;
  City: string = '';
  selectedcategoryId: any;
  selectedCategory: any;
  catergoryname = '';
  categoryName1 = '';
  isMobile: boolean = false;
  customOptions = {
    loop: true,
    margin: 10,
    nav: false,
    dots: false,
    center: true,
    autoplay: true, // disable autoplay here
    navText: ['<span><i class="fa-solid fa-caret-left"></i></span>', '<span><i class="fa-solid fa-caret-right"></i></span>'],
    responsive: {
      0: { items: 1 },
      768: { items: 2 },
      1000: { items: 2 },
    },
  };
  ngOnInit() {
    // alert('hiii')
    // Konva.Node.create(this.jsonData, this.stageContainer.nativeElement);
    this.isMobile = this.apiService.isMobileDevice();
    this.renderCalendar();
    const cachedCategory = localStorage.getItem('selectedCategory');

    if (cachedCategory) {
      // this.selectedcategoryId = cachedCategory;
      if (cachedCategory?.toString().trim() !== '' && !isNaN(Number(cachedCategory))) {
        this.selectedcategoryId = Number(cachedCategory);
      } else {
        this.selectedcategoryId = cachedCategory;
      }
    }

    // this.categoryService.selectedCategory$.subscribe((category) => {
    //   if (category) {

    //     if (category?.toString().trim() !== '' && !isNaN(Number(category))) {
    //       this.selectedcategoryId = Number(category);
    //     } else {
    //       this.selectedcategoryId = category;
    //     }
    //   }
    // });
    this.route.params.subscribe((params) => {
      var segments = this.router.url.split('/');
      var dynamicSegment = segments[3];

      this.catergoryname = dynamicSegment;
      this.categoryName1 = this.catergoryname.replace(/%20/g, ' ');
    });

    // this.route.paramMap.subscribe(params => {
    //   const city = params.get('city');
    //   if (city) {
    //     this.City = city;
    //   }
    // });
    // this.locationService.selectedCity$.subscribe((cityName: any) => {
    //   if (cityName) {
    //     this.selectedCityId = cityName.ID;

    //     this.City = cityName?.NAME;


    //   }
    // });

    this.City = this.cookie.get('cityName');
    this.selectedCityId = Number(this.cookie.get('cityId'));
    this.getBanners();
    this.getDistinct()

    this.updateMetaTags(this.catergoryname, this.City);
    this.loadPlaysData('nowShowing');
  }

  @HostListener('window:resize', [])
  onResize() {
    if (!this.isMobileView) {
      this.showMobileFilters = true;
    }
  }

  gotoroutube(event: any) {

    if (event.REDIRECT_TYPE == 'U') {
      this.router.navigate(['/explore', this.City, event.CATEGORY_NAME, event.PAGE_URL, event.EVENT_TYPE_ID]);

    } else if (event.REDIRECT_TYPE == 'E') {
      const url = `/explore/shows/${this.selectedCity}/${encodeURIComponent(
        event.TITLE
      )}/${event.BANNER_ID}`;

      this.router.navigateByUrl(url);
    } else {
    }
  }

  @HostListener('window:scroll', [])
  onScroll() {
    if (this.isFetchingData) return;
    if (this.searchLoading) return;
    const scrollPosition = window.scrollY + window.innerHeight;

    // Responsive threshold based on screen width
    const isMobile = window.innerWidth <= 768; // or use your mobile breakpoint
    const threshold = document.body.offsetHeight - (isMobile ? 500 : 400);


    if (scrollPosition >= threshold) {
      if (this.activeTab === 'nowShowing' && this.hasMoreNowShowing == true) {
        this.loadPlaysData('nowShowing');
      } else if (this.activeTab === 'upcoming' && this.hasMoreUpcoming) {
        this.loadPlaysData('upcoming');
      }
    }
  }
  onScroll2(event: Event): void {

    if (this.isFetchingData) return;
    if (this.searchLoading) return;
    const element = event.target as HTMLElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;


    // Detect bottom
    if (scrollTop + clientHeight >= scrollHeight) {

      if (this.activeTab === 'nowShowing' && this.hasMoreNowShowing) {
        this.loadPlaysData('nowShowing');
      } else if (this.activeTab === 'upcoming' && this.hasMoreUpcoming) {
        this.loadPlaysData('upcoming');
      }
    }

    // You can also track scrollTop or perform other logic
  }

  isFetchingData = false;

  viewMode: 'grid' | 'list' = 'grid';


  selectedLanguages: string[] = [];

  matchFilters(event: any): boolean {
    const matchLanguage =
      this.selectedLanguages.length === 0 ||
      this.selectedLanguages.some((lang) => event.LANGUAGES?.includes(lang));

    const matchSubcategory =
      this.selectedsc.length === 0 ||
      this.selectedsc.some((sc) =>
        event['eventDetails'].SUB_CATEGORY_NAME?.includes(sc)
      );

    const matchGenre =
      this.selectedGenre.length === 0 ||
      this.selectedGenre.some((g) => event.GENRES?.includes(g));

    const matchTags =
      this.selectedTags.length === 0 ||
      this.selectedTags.some((tag) =>
        event['eventDetails'].EXTRA_OPTIONS?.includes(tag)
      );

    return matchLanguage && matchSubcategory && matchGenre && matchTags;
  }

  selectedTags: string[] = [];

  toggleTags(tag: string) {
    const index = this.selectedTags.indexOf(tag);
    if (index === -1) {
      this.selectedTags.push(tag);
    } else {
      this.selectedTags.splice(index, 1);
    }
    this.applyFilters();
  }

  clearTags() {
    this.selectedTags = [];
    this.applyFilters();
  }
  clearLanguages() {
    this.selectedLanguages = [];
    this.applyFilters();
  }
  toggleSubcategory(sc: string) {
    const i = this.selectedsc.indexOf(sc);
    i > -1 ? this.selectedsc.splice(i, 1) : this.selectedsc.push(sc);
    this.applyFilters();
  }
  clearSubcategories() {
    this.selectedsc = [];
    this.applyFilters();
  }

  toggleGenre(genre: string) {
    const i = this.selectedGenre.indexOf(genre);
    i > -1 ? this.selectedGenre.splice(i, 1) : this.selectedGenre.push(genre);
    this.applyFilters();
  }
  clearGenres() {
    this.selectedGenre = [];
    this.applyFilters();
  }

  setActive(event: any) {
    const buttons = document.querySelectorAll('.controls .control');
    buttons.forEach((btn) => btn.classList.remove('active'));
    event.target.classList.add('active');
  }

  getBanners() {
    this.isLoading = true;
    let query = ' AND CATEGORY_ID = ' + this.selectedcategoryId;

    if (this.selectedCityId !== null && this.selectedCityId !== undefined && this.selectedCityId !== '' && this.selectedCityId !== 0) {
      query += ' AND CITY_ID = ' + this.selectedCityId;
    }
    this.apiService.getBannersForEvents(0, 0, '', '',
      query, this.selectedCityId ? this.selectedCityId : 0).subscribe((data) => {
        if (data['code'] == 200) {
          this.banners = data['data'];

          if (this.banners.length > 0) {
            this.banners = Array.from(
              new Map(this.banners.map(item => [item.BANNER_ID, item])).values()
            );
          }

          this.isLoading = false;
        } else {
          this.banners = [];
        }
      });
  }
  Distinct: any
  getDistinct() {
    this.isLoading = true;
    this.apiService.getDistinctValues(0, 0, '', '', '', this.selectedcategoryId, this.selectedCityId).subscribe((data) => {
      if (data['code'] == 200) {
        this.Distinct = data['distinctValues'];
        const newFilters = [
          {
            name: 'Categories',
            id: 'brandCollapse',
            key: 'subcategory',
            subcategory: this.Distinct.SUB_CATEGORY_NAME.map((name: any) => ({ NAME: name })),
            visibleCount: 5,
            searchTerm: '',
          },
          {
            name: 'Language',
            id: 'typeCollapse',
            key: 'LangaugeData',
            LangaugeData: this.Distinct.LANGUAGE_NAMES.filter((name: any) => name !== '').map((name: any) => ({ NAME: name })),
            visibleCount: 5,
            searchTerm: '',
          },
          {
            name: 'Genres',
            id: 'themeCollapse',
            key: 'GenresData',
            GenresData: this.Distinct.GENRE_NAMES.filter((g: any) => g.trim() !== "").map((type: any) => ({ TYPE: type })),
            visibleCount: 5,
            searchTerm: '',
          },
          {
            name: 'Tags',
            id: 'colorCollapse',
            key: 'tagsData',
            tagsData: this.Distinct.TAGS_NAMES.map((name: any) => ({ NAME: name })),
            visibleCount: 5,
            searchTerm: '',
          },
        ];

        this.selectedFilter = newFilters[0]; // default selected on mobile

        this.filters = this.preserveVisibleCounts(newFilters);


      } else {
        this.banners = [];
      }
    });
  }
  hasOptions(filter: any): boolean {
    const key = filter.key;
    return Array.isArray(filter[key]) && filter[key].length > 0;
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

  clearAllSelected(): void {
    for (const key in this.selectedFilters) {
      if (this.selectedFilters[key as FilterKey]) {
        this.selectedFilters[key as FilterKey].clear();
      }
    }
    this.selectedDateFilter = null;
    this.filteredPlaysData = []
    this.filteredPlaysDataUpcoming = [];
    this.fromDate = null;
    this.toDate = null;
    this.pageNowShowing = 1;
    this.pageUpcoming = 1;
    // this.hasMoreNowShowing = true
    // this.hasMoreUpcoming = true

    this.loadPlaysData(this.activeTab);
  }

  cleardatefilter(): void {

    this.selectedDateFilter = null;
    this.filteredPlaysData = []
    this.filteredPlaysDataUpcoming = [];
    this.fromDate = null;
    this.toDate = null;
    this.pageNowShowing = 1;
    this.pageUpcoming = 1;
    this.selectedRange = { from: null, to: null };
    // this.hasMoreNowShowing = true
    // this.hasMoreUpcoming = true
    this.updateCalendarSelection();

    this.loadPlaysData(this.activeTab);
  }
  isOptionSelected(filter: Filter, option: any): boolean {
    const key = filter.key as FilterKey;
    const selectedSet = this.selectedFilters[key];
    const value =
      key === 'GenresData' ? option.TYPE : option.NAME;

    return selectedSet.has(value);
  }
  activeTab: 'nowShowing' | 'upcoming' = 'nowShowing';

  selectTab(tab: 'nowShowing' | 'upcoming'): void {
    this.activeTab = tab;
    this.pageNowShowing = 1;
    this.pageUpcoming = 1;
    this.filteredPlaysData = []
    this.filteredPlaysDataUpcoming = [];
    this.hasMoreNowShowing = (tab === 'nowShowing' ? true : false);
    this.hasMoreUpcoming = (tab === 'upcoming' ? true : false);
    this.loadPlaysData(tab === 'nowShowing' ? 'nowShowing' : 'upcoming');
  }
  getFilteredOptions(filter: Filter): any[] {
    const key = filter.key as FilterKey;
    const items = filter[key] || [];

    if (!filter.searchTerm) return items;

    const lowerTerm = filter.searchTerm.toLowerCase();
    return items.filter((option: any) => {
      const label =
        key === 'GenresData'
          ? option.TYPE
          : option.NAME;

      return label?.toLowerCase().includes(lowerTerm);
    });
  }

  showMore(filter: Filter, event: Event): void {
    event.preventDefault();
    filter.visibleCount += 5;
  }
  PlaysData: any[] = [];
  GenresData: any[] = [];
  tagsData: any[] = [];
  PlaysDataUpcoming: any[] = [];
  getPlaysForCity(city: string) {
    this.apiService.getPlayData(0, 0, '', 'asc', '').subscribe(
      (data: any) => {
        if (data['code'] === 200) {
          this.PlaysData = data['data'].slice(0, 10).map((play: any) => {
            return {
              ...play,
              play_IMAGES: this.parseImageUrl(play.PLAY_IMAGES),
              play_VIDEOS: this.parseJson(play.PLAY_VIDEOS),
              GENRES: this.splitString(play.GENRES),
              SCREEN_TYPES: this.splitString(play.SCREEN_TYPES),
              LANGUAGES: this.splitString(play.LANGUAGES),
              TERMS_CONDITIONS: this.parseJson(play.TERMS_CONDITIONS),
            };
          });
        } else {
          this.PlaysData = [];
        }
      },
      () => { }
    );
  }

  selectedCityId: any;
  searchLoading: boolean = false;
  pageNowShowing = 1;
  pageUpcoming = 1;
  pageSize = 12;
  hasMoreNowShowing = true;
  hasMoreUpcoming = true;
  apiFailed = false;
  allGenresList: string[] = [];
  allLanguagesList: string[] = [];
  allSubcategoriesList: string[] = [];
  allTagsList: string[] = [];

  loadPlaysData(type: 'nowShowing' | 'upcoming') {

    if (this.searchLoading) return;

    if (this.isFetchingData) return;
    this.isFetchingData = true; // Lock scroll
    this.searchLoading = true;


    const page =
      type === 'nowShowing' ? this.pageNowShowing : this.pageUpcoming;

    const status = type === 'nowShowing' ? 'S' : 'NS';
    const filter = { BOOKING_STATUS: status };
    const filterParams: any = {
      BOOKING_STATUS: status,
      // CATEGORY_ID: this.selectedcategoryId,
    };

    if (this.selectedDateFilter) {
      const { startDate, endDate } = this.getDateRangeForFilter(this.selectedDateFilter);
      if (startDate && endDate) {
        filterParams.SHOW_DATE_FROM = startDate;
        filterParams.SHOW_DATE_TO = endDate;
      }
    }


    if (this.fromDate && this.toDate) {
      if (this.selectedDateFilter === 'custom') {
        filterParams.SHOW_DATE_FROM = this.datePipe.transform(this.fromDate, 'yyyy-MM-dd');
        filterParams.SHOW_DATE_TO = this.datePipe.transform(this.toDate, 'yyyy-MM-dd');
      }
    }




    if (this.selectedFilters.subcategory.size > 0) {
      filterParams.SUB_CATEGORY_NAME = Array.from(
        this.selectedFilters.subcategory
      ).join(',');
    }
    if (this.selectedFilters.GenresData.size > 0) {
      filterParams.GENRE_NAMES = Array.from(
        this.selectedFilters.GenresData
      ).join(',');
    }
    if (this.selectedFilters.LangaugeData.size > 0) {
      filterParams.LANGUAGE_NAMES = Array.from(
        this.selectedFilters.LangaugeData
      ).join(',');
    }
    if (this.selectedFilters.tagsData.size > 0) {
      filterParams.TAGS_NAMES = Array.from(this.selectedFilters.tagsData).join(
        ','
      );
    }
    this.hasMoreNowShowing = true;
    this.apiService
      .getCityWiseALLData(
        page,
        this.pageSize,
        'IS_PROMOTED',
        'DESC',
        filterParams,
        this.selectedCityId,
        this.selectedcategoryId
      )
      .subscribe({
        next: (data: any) => {
          this.isLoading = false;

          if (data['code'] !== 200) {
            this.apiFailed = true;
            return;
          }

          const newData = data['data'] || [];
          const totalCount = data['count'] || 0;

          const distinctValues = data['distinctValues'] || {};

          // Populate filter dropdown lists
          this.allGenresList = distinctValues.GENRE_NAMES?.filter((item: any) => item.trim() !== '') || [];
          this.allLanguagesList = distinctValues.LANGUAGE_NAMES || [];
          this.allSubcategoriesList = distinctValues.SUB_CATEGORY_NAME || [];
          this.allTagsList = distinctValues.TAGS_NAMES || [];
          // // 1️⃣ Filter events where HAS_SUB_EVENTS is true
          // const subEvents = newData.filter(
          //   (event: any) => event.HAS_SUB_EVENTS === true
          // );

          // // 2️⃣ Flatten all schedules from those events
          // const allSchedules = subEvents.flatMap(
          //   (event: any) => event.schedules || []
          // );

          // // 3️⃣ Get unique dates
          // this.mainShowDates = [
          //   ...new Set(allSchedules.map((s: any) => s.SHOW_DATE))
          // ];

          // // 4️⃣ Get unique times
          // this.mainShowTime = [
          //   ...new Set(allSchedules.map((s: any) => s.SHOW_TIME))
          // ];



          // if (newData.length === 0) {
          //   if (type === 'nowShowing') this.hasMoreNowShowing = false;
          //   else this.hasMoreUpcoming = false;
          //   return;
          // }

          if (page == 1 && newData.length === 0) {
            if (type === 'nowShowing') {
              this.PlaysData = [];
              this.filteredPlaysData = [];
              this.hasMoreNowShowing = false;
            } else {
              this.PlaysDataUpcoming = [];
              this.filteredPlaysDataUpcoming = [];
              this.hasMoreUpcoming = false;
              this.hasMoreNowShowing = false;
            }
            this.isFetchingData = false;
            this.searchLoading = false;
            return;
          } else if (newData.length === 0) {
            this.isFetchingData = false;
            this.searchLoading = false;
            this.hasMoreNowShowing = false;
            return;
          }

          const parsedData = newData.flatMap((play: any) => {
            const schedules = play.schedules || [];


            return schedules.map((schedule: any) => ({
              NAME: play.EVENT_NAME || '',
              CATEGORY_ID: play.CATEGORY_ID || '',
              PLAY_IMAGES: play.EVENT_IMAGE || '',
              GENRE_NAMES: play.GENRE_NAMES,
              LANGUAGES: this.splitString(play.LANGUAGE_NAMES).slice(0, 2),
              RELEASE_DATE: schedule.SHOW_DATE || '',
              SHOW_TIME: schedule.SHOW_TIME || '',
              CENSOR_BOARD_RATING: play.CERTIFICATES || '',
              HAS_SUB_EVENTS: play.HAS_SUB_EVENTS,
              EXTRA_OPTIONS: this.splitString(play.TAGS_NAMES),
              SUB_CATEGORY_NAME: play.SUB_CATEGORY_NAME || '', // Replace with VENUE_NAME if available later
              bookmarked: false,
              EVENT_ID: play._id,
              PLAY_ID: play._id,
              EVENT_SLUG: play.EVENT_SLUG,
              CATEGORY_NAME: play.CATEGORY_NAME,
              VENUE_NAME: play.VENUE_NAME,
              showOnwards: play.startDate !== play.endDate,
              IS_PROMOTED: play.IS_PROMOTED || false
            }));
          });


          if (type === 'nowShowing') {
            this.PlaysData = [...this.PlaysData, ...parsedData];
            // parsedData.forEach((item: any) => this.PlaysData.push(item));

            this.filteredPlaysData = [...this.filteredPlaysData, ...parsedData];
            this.pageNowShowing++;
            if (this.PlaysData.length == totalCount) this.hasMoreNowShowing = false;
          } else {
            this.PlaysDataUpcoming = [...this.PlaysDataUpcoming, ...parsedData];
            // parsedData.forEach((item: any) => this.PlaysData.push(item));

            this.filteredPlaysDataUpcoming = [...this.filteredPlaysDataUpcoming, ...parsedData];
            this.pageUpcoming++;
            if (this.PlaysDataUpcoming.length == totalCount) this.hasMoreUpcoming = false;
          }
          this.updateschema()

          //   this.filteredPlaysDataUpcoming,
          //   'filteredPlaysDataUpcoming'
          // );

          this.isFetchingData = false;
          this.searchLoading = false;

          if (this.memberId)
            this.fetchAllWishlistData();
        },
        error: () => {
          this.isLoading = false;
          this.apiFailed = true;
          this.searchLoading = false;

        },
      });
  }

  getDateRangeForFilter(filter: string): { startDate: string, endDate: string } {
    const today = new Date();

    let start: Date = new Date();
    let end: Date = new Date();

    switch (filter) {
      case 'today':
        // today
        break;
      case 'tomorrow':
        start.setDate(today.getDate() + 1);
        end = new Date(start);
        break;
      case 'weekend': {
        const day = today.getDay();
        const daysUntilSaturday = (6 - day + 7) % 7;
        const daysUntilSunday = (7 - day + 7) % 7;
        start.setDate(today.getDate() + daysUntilSaturday);
        end.setDate(today.getDate() + daysUntilSunday);
        break;
      }
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      default:
        return { startDate: '', endDate: '' };
    }

    const format = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return { startDate: format(start), endDate: format(end) };
  }

  filteredPlaysData: any[] = [];
  filteredPlaysDataUpcoming: any[] = [];

  parseImageUrl(jsonString: string): string {
    try {
      const images = JSON.parse(jsonString);
      return images?.find((img: any) => img.ISDEFAULT)?.URL || '';
    } catch {
      return '';
    }
  }
  selectedFilter: any // default selected on mobile

  getSelectedCount(filter: any): number {
    const options = this.getFilteredOptions(filter);
    return options.filter(option => this.isOptionSelected(filter, option)).length;
  }

  isMobileFilterOpen = false;

  openMobileFilters() {
    this.isMobileFilterOpen = true;
    this.selectedFilter = 5; // default selected
  }
  removeSelectedOption(filter: any, option: any) {
    filter.selectedOptions = filter.selectedOptions.filter((o: any) =>
      (filter.key === 'GenresData' ? o.TYPE : o.ID) !== (filter.key === 'GenresData' ? option.TYPE : option.ID)
    );
  }

  closeMobileFilters() {
    this.isMobileFilterOpen = false;
  }


  // getEventRouterLink(section: any, event: any): any[] {
  //   const title = section?.TITLE?.toLowerCase() || '';

  //   return ['/menu/plays', event._id, 'upcoming'];
  // }
  getEventRouterLink(event: any) {
    this.router.navigate(['/explore', this.selectedCityId, event.CATEGORY_NAME, event.EVENT_SLUG, event.EVENT_ID]);
  }
  onEventClick(event: any) {
    // console.log("event",event)
    if (event.HAS_SUB_EVENTS) {
      // console.log(event)
       const schedules = event.schedules || [];

    this.mainShowDates = [event.RELEASE_DATE];

    this.mainShowTime = [event.SHOW_TIME];
    this.mainShowVenues = [
        ...new Set(schedules.map((s: any) => s.VENUE_NAME))
      ];

      //Event Date time
      localStorage.setItem('Date', JSON.stringify(this.mainShowDates));
      localStorage.setItem('Time', JSON.stringify(this.mainShowTime));
     localStorage.setItem('Venues', JSON.stringify(this.mainShowVenues));

      this.router.navigate(['explore/subEvent', event.EVENT_ID],
        { queryParams: { catId: Number(event.CATEGORY_ID) } }
      );
    } else {
      this.router.navigate(['/explore', this.City, event.CATEGORY_NAME, event.EVENT_SLUG, event.EVENT_ID]);
    }
  }
  getVenuerouterLink() {
    // return ['/explore', this.City, 'venues'];
    this.router.navigate([`/explore/venues/${this.City}`]);
  }

  parseJson(jsonString: string): any[] {
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  }

  trackById(index: number, item: any) {
    return item.PLAY_ID || item.EVENT_ID;
  }

  splitString(str: string): string[] {
    return str ? str.split(',').map((s) => s.trim()) : [];
  }


  onImageError(event: any) {
    event.target.src = '/assets/movie_skel.jpg';
  }

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  canScrollLeft = false;
  canScrollRight = true;
  showArrows = false;

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({
      left: -this.getScrollAmount(),
      behavior: 'smooth',
    });
    setTimeout(() => this.updateArrows(), 400);
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({
      left: this.getScrollAmount(),
      behavior: 'smooth',
    });
    setTimeout(() => this.updateArrows(), 400);
  }

  // onScroll() {
  //   this.updateArrows();
  // }

  private updateArrows() {
    if (!this.scrollContainer) return;
    const el = this.scrollContainer.nativeElement;
    this.canScrollLeft = el.scrollLeft > 0;
    this.canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 10;
  }

  private getScrollAmount(): number {
    const card = this.scrollContainer.nativeElement.querySelector(
      '.event-card-wrapper'
    );
    const cardWidth = card?.offsetWidth || 250;
    return cardWidth * 5; // Scrolls 5 items at once
  }
  isSubcategoryCollapsed = false;
  isLanguageCollapsed = true;
  isGenreCollapsed = true;
  isTagsCollapsed = true;

  filters: Filter[] = [
    {
      name: 'Categories',
      id: 'brandCollapse',
      key: 'subcategory',
      subcategory: [],
      visibleCount: 5,
      searchTerm: '',
    },
    {
      name: 'Language',
      id: 'typeCollapse',
      key: 'LangaugeData',
      LangaugeData: [],
      visibleCount: 5,
      searchTerm: '',
    },
    {
      name: 'Genres',
      id: 'themeCollapse',
      key: 'GenresData',
      GenresData: [],
      visibleCount: 5,
      searchTerm: '',
    },
    {
      name: 'Tags',
      id: 'colorCollapse',
      key: 'tagsData',
      tagsData: [],
      visibleCount: 5,
      searchTerm: '',
    },
  ];

  loadMore(filter: any): void {
    filter.visibleCount += 6;
  }

  // Step 2: Define the selectedFilters using the above type
  selectedFilters = {
    subcategory: new Set<string>(),
    LangaugeData: new Set<string>(),
    GenresData: new Set<string>(),
    tagsData: new Set<string>()
  };

  clearSelectedOptions(filter: Filter): void {
    const key = filter.key as FilterKey;
    const selectedSet = this.selectedFilters[key];


    if (selectedSet && selectedSet.size > 0) {
      selectedSet.clear(); // Clear only this filter's selections
      filter.searchTerm = ''; // Optional: Reset the search field for that filter
      this.filteredPlaysData = []
      this.filteredPlaysDataUpcoming = [];
      this.pageNowShowing = 1;
      this.pageUpcoming = 1;
      // Call the new filtered data loader
      this.loadPlaysData(this.activeTab);
    }
  }
  generateOptionId(option: any, filter: Filter): string {
    const key = filter.key;

    if (key === 'GenresData') {
      return `genre-${option.TYPE}`;
    } else if (key === 'LangaugeData' || key === 'tagsData') {
      return `${key}-${option.NAME}`;
    } else if (key === 'subcategory') {
      return `subcategory-${option.NAME.trim().replace(/\s+/g, '-')}`;
    } else {
      return `${key}-unknown`;
    }
  }
  toggleLanguage(option: any, filter: Filter) {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const key = filter.key as FilterKey;
    const selectedSet = this.selectedFilters[key];
    this.pageNowShowing = 1;
    this.pageUpcoming = 1;
    if (!selectedSet) {
      // console.warn(`Invalid filter key: ${key}`);
      return;
    }

    let optionId: any;

    if (key === 'GenresData') {
      optionId = option.TYPE;
    } else if (key === 'LangaugeData' || key === 'tagsData') {
      optionId = option.NAME;
    } else if (key === 'subcategory') {
      optionId = option.NAME.trim();
    } else {
      return;
    }

    if (selectedSet.has(optionId)) {
      selectedSet.delete(optionId);
    } else {
      selectedSet.add(optionId);
    }
    this.filteredPlaysData = []
    this.filteredPlaysDataUpcoming = [];
    // this.hasMoreNowShowing = true
    // this.hasMoreUpcoming = true
    // Call the new filtered data loader
    this.loadPlaysData(this.activeTab);
  }

  preserveVisibleCounts(newFilters: any[]): any[] {
    const visibleCountMap = new Map<string, number>();

    // Save current visibleCounts
    for (const f of this.filters) {
      visibleCountMap.set(f.key, f.visibleCount);
    }

    // Apply saved visibleCounts to new filters
    return newFilters.map((f) => ({
      ...f,
      visibleCount: visibleCountMap.get(f.key) ?? f.visibleCount,
    }));
  }

  applyFilters() {




    // If no filters are selected, reset to the original data
    if (
      this.selectedFilters.subcategory.size === 0 &&
      this.selectedFilters.LangaugeData.size === 0 &&
      this.selectedFilters.GenresData.size === 0 &&
      this.selectedFilters.tagsData.size === 0
    ) {

      this.filteredPlaysData = [...this.PlaysData];
      this.filteredPlaysDataUpcoming = [...this.PlaysDataUpcoming];
      return;
    }

    // Apply filters to the now showing data
    this.filteredPlaysData = this.PlaysData.filter((event: any) => {
      const matchesSubcategory =
        this.selectedFilters.subcategory.size === 0 ||
        (event.eventDetails?.SUB_CATEGORY_NAME || '')
          .split(',')
          .some((category: any) =>
            this.selectedFilters.subcategory.has(category.trim())
          );

      const matchesLanguage =
        this.selectedFilters.LangaugeData.size === 0 ||
        (event.LANGUAGES || []).some((lang: any) =>
          this.selectedFilters.LangaugeData.has(lang.trim()) && lang !== ''
        );

      const matchesGenres =
        this.selectedFilters.GenresData.size === 0 ||
        (event.GENRES || []).some((genre: any) =>
          this.selectedFilters.GenresData.has(genre.trim())
        );

      const matchesTags =
        this.selectedFilters.tagsData.size === 0 ||
        (event.EXTRA_OPTIONS || []).some((tag: any) =>
          this.selectedFilters.tagsData.has(tag.trim())
        );

      return (
        matchesSubcategory && matchesLanguage && matchesGenres && matchesTags
      );
    });

    this.filteredPlaysDataUpcoming = this.PlaysDataUpcoming.filter(
      (event: any) => {
        const matchesSubcategory =
          this.selectedFilters.subcategory.size === 0 ||
          (event.eventDetails.SUB_CATEGORY_NAME &&
            event.eventDetails.SUB_CATEGORY_NAME.split(',').some(
              (category: any) => {
                return this.selectedFilters.subcategory.has(category.trim());
              }
            ));

        const matchesLanguage =
          this.selectedFilters.LangaugeData.size === 0 ||
          (event.LANGUAGES || []).some((lang: any) =>
            this.selectedFilters.LangaugeData.has(lang) && lang !== ''
          );

        const matchesGenres =
          this.selectedFilters.GenresData.size === 0 ||
          (event.GENRES || []).some((genre: any) =>
            this.selectedFilters.GenresData.has(genre)
          );

        const matchesTags =
          this.selectedFilters.tagsData.size === 0 ||
          (event.EXTRA_OPTIONS || []).some((tag: any) =>
            this.selectedFilters.tagsData.has(tag.trim())
          );

        return (
          matchesSubcategory && matchesLanguage && matchesGenres && matchesTags
        );
      }
    );



    //   'Filtered Plays Data Upcoming:',
    //   this.filteredPlaysDataUpcoming
    // );
  }

  toggleBookmark(event: any) {


    const isLiking = !event.bookmarked;


    const likePayload = {
      MEMBER_ID: Number(this.memberId),
      EVENT_ID: event.MOVIE_ID || event.EVENT_ID || event.PLAY_ID,
      STATUS: isLiking ? 1 : 0,
      ID: event.wishlistId,
    };



    if (isLiking && event.wishlistId == null) {
      this.apiService.createBookmark(likePayload).subscribe({
        next: (res: any) => {
          if (res.code == '200') {
            event.bookmarked = true;
            // this.toastr.success('Bookmark added successfully.', 'Success');
          } else {
            // this.toastr.warning('Could not add the bookmark.', 'Warning');
          }
          this.fetchAllWishlistData();
        },
        error: () => {
          // this.toastr.error('Error adding bookmark.', 'Error');
        },
      });
    } else {
      this.apiService.updateBookmark(likePayload).subscribe({
        next: (res: any) => {
          if (res.code == '200') {
            event.bookmarked = !event.bookmarked; // Toggle the bookmark state
            const actionMessage = event.bookmarked ? 'added' : 'removed';
            // this.toastr.success(
            //   `Bookmark ${actionMessage} successfully.`,
            //   'Success'
            // );
          } else {
            // this.toastr.warning('Could not update the bookmark.', 'Warning');
          }
          this.fetchAllWishlistData();
        },
        error: () => {
          // this.toastr.error('Error updating bookmark.', 'Error');
        },
      });
    }
  }

  isWishlistLoading: boolean = false;
  wishlistItems: any[] = [];
  filteredWishlistItems: any[] = [];

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


    //         this.updateBookmarkStatus();
    //       }

    //       this.isWishlistLoading = false;
    //     },
    //     (error: any) => {
    //       console.error('Error fetching wishlist data:', error);
    //       this.isWishlistLoading = false;
    //     }
    //   );
  }
  updateBookmarkStatus() {
    const wishlistMap = new Map(
      this.filteredWishlistItems.map((item: any) => [item.EVENT_ID, item])
    );


    //   this.filteredPlaysData,
    //   'Wishlist Map:',
    //   this.filteredWishlistItems
    // );



    this.filteredPlaysData.forEach((play: any) => {
      // const matchedWishlist = this.filteredWishlistItems.find(
      //   (item: any) => item.EVENT_ID == play.EVENT_ID && item.STATUS == 1
      // );

      const matchedWishlist = this.filteredWishlistItems.find(
        (item: any) => item.EVENT_ID == play.EVENT_ID
      );



      if (matchedWishlist) {
        play.bookmarked = matchedWishlist.STATUS === 1;
        play.wishlistId = matchedWishlist.ID;
      } else {
        play.bookmarked = false;
        play.wishlistId = null;
      }
    });
    this.filteredPlaysDataUpcoming.forEach((play: any) => {
      // const matchedWishlist1 = this.filteredWishlistItems.find(
      //   (item: any) => item.EVENT_ID == play.EVENT_ID && item.STATUS == 1
      // );

      const matchedWishlist1 = this.filteredWishlistItems.find(
        (item: any) => item.EVENT_ID == play.EVENT_ID
      );



      if (matchedWishlist1) {
        play.bookmarked1 = matchedWishlist1.STATUS === 1;
        play.wishlistId = matchedWishlist1.ID;
      } else {
        play.bookmarked1 = false;
        play.wishlistId = null;
      }
    });


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



  // static calender start

  weekdays: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  currentMonth: any;
  currentYear: any;
  currentMonthName: string = '';
  calendarDays: any = []; // Array to hold all day objects, including null for empty cells
  // selectedDate: Date | null = null;


  private dateStatuses: { [key: string]: 'available' | 'fast-filling' | 'sold-out' } = {
    // '2025-06-05': 'fast-filling',
    // '2025-06-10': 'sold-out',
    // '2025-06-15': 'fast-filling',
    // '2025-06-20': 'available',
    // '2025-06-25': 'sold-out'
  };

  // renderCalendar(): void {
  //   this.calendarDays = []; // Clear previous days
  //   const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1).getDay(); // 0 = Sunday, 6 = Saturday
  //   const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate(); // Last day of the month

  //   const monthNames = ["January", "February", "March", "April", "May", "June",
  //     "July", "August", "September", "October", "November", "December"
  //   ];
  //   this.currentMonthName = monthNames[this.currentMonth].toUpperCase();

  //   // Add empty cells for the days before the 1st of the month
  //   for (let i = 0; i < firstDayOfMonth; i++) {
  //     this.calendarDays.push(null); // Use null for empty placeholder
  //   }

  //   const today = new Date();
  //   const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  //   // Add date cells
  //   for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
  //     const date = new Date(this.currentYear, this.currentMonth, dayNum);
  //     const fullDateKey = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
  //     const status = this.dateStatuses[fullDateKey] || 'available';

  //     let cssClasses = [`status-${status}`];
  //     let isClickable = true;

  //     // Check if date is in the past
  //     if (date < todayDateOnly) {
  //       cssClasses.push('inactive');
  //       isClickable = false;
  //     }

  //     // Check if sold out
  //     if (status === 'sold-out') {
  //       cssClasses.push('unavailable');
  //       isClickable = false;
  //     }

  //     const isToday = date.toDateString() === today.toDateString();
  //     const isSelected = this.selectedDate ? date.toDateString() === this.selectedDate.toDateString() : false;

  //     this.calendarDays.push({
  //       date: date,
  //       dayOfMonth: dayNum,
  //       isCurrentMonth: true, // For now, all rendered days are current month
  //       isToday: isToday,
  //       isSelected: isSelected,
  //       status: status,
  //       cssClass: cssClasses.join(' '),
  //       isClickable: isClickable
  //     });
  //   }
  // }
  renderCalendar(): void {
    this.calendarDays = [];

    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDay = firstDay.getDay(); // 0 = Sunday

    const daysInMonth = lastDay.getDate();

    const totalCells = startDay + daysInMonth;
    for (let i = 0; i < totalCells; i++) {
      if (i < startDay) {
        this.calendarDays.push(null); // Empty cell
      } else {
        const date = new Date(this.currentYear, this.currentMonth, i - startDay + 1);
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        this.currentMonthName = monthNames[this.currentMonth].toUpperCase();
        const day: any = {
          date: date,
          dayOfMonth: date.getDate(),
          isClickable: true, // you can customize this
          status: '',         // optional: can set availability status
          isSelected: false,
          isInRange: false,
          cssClass: ''
        };

        this.calendarDays.push(day);
      }
    }

    // ✅ Reapply selection logic
    this.updateCalendarSelection();
  }
  times: string[] = [];
  selectedDate: Date | null = null;
  selectedTime: string | null = null;
  private availableShowTimes: { [key: string]: string[] } = {
    '2025-05-29': ['10:00 AM', '03:00 PM', '07:00 PM'],
    '2025-05-30': ['11:00 AM', '04:00 PM', '08:00 PM'],
    '2025-05-31': ['10:30 AM', '02:30 PM', '06:30 PM'],
    '2025-06-01': ['01:00 PM', '05:00 PM'],
    '2025-06-02': ['10:00 AM', '03:00 PM', '07:00 PM'],
    '2025-06-03': ['11:00 AM', '04:00 PM'],
    '2025-06-04': ['10:00 AM', '02:00 PM', '06:00 PM'],
  };

  selectDate1(day: any | null): void {
    if (!day || !day.isClickable) return;

    const selectedDate = day.date;

    if (this.selectedRange.from == null) {
      this.selectedRange.from = selectedDate;
      if (this.selectedRange.to == null)
        this.selectedRange.to = this.selectedRange.from;
    } else if (this.selectedRange.from != null && this.selectedRange.to != null) {

      if (this.selectedRange.from == this.selectedRange.to)
        this.selectedRange.to = selectedDate;
      else if (selectedDate < this.selectedRange.from || selectedDate < this.selectedRange.to) {
        this.selectedRange.from = selectedDate;
        this.selectedRange.to = null;
      } else if (selectedDate > this.selectedRange.to) {
        this.selectedRange.from = selectedDate;
        this.selectedRange.to = null;
      }


    } else if (selectedDate < this.selectedRange.from) {
      this.selectedRange.to = this.selectedRange.from;
      this.selectedRange.from = selectedDate;
    } else {
      this.selectedRange.to = selectedDate;
    }




    this.updateCalendarSelection();
  }

  updateCalendarSelection(): void {
    this.calendarDays.forEach((day: any) => {
      if (!day) return;

      day.isSelected = false;
      day.isInRange = false;

      const time = new Date(day.date).setHours(0, 0, 0, 0);
      const fromTime = this.selectedRange.from
        ? new Date(this.selectedRange.from).setHours(0, 0, 0, 0)
        : null;
      const toTime = this.selectedRange.to
        ? new Date(this.selectedRange.to).setHours(0, 0, 0, 0)
        : null;

      if (fromTime && toTime) {
        if (time === fromTime || time === toTime) {
          day.isSelected = true;
        } else if (time > fromTime && time < toTime) {
          day.isInRange = true;
        }
      } else if (fromTime && time === fromTime) {
        day.isSelected = true;
      }

      //
      // Update classes
      let baseClass = `status-${day.status}`;
      if (!day.isClickable) baseClass += ' inactive';
      if (day.isSelected) baseClass += ' selected';
      if (day.isInRange) baseClass += ' in-range';

      day.cssClass = baseClass;
    });
  }
  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  }



  // Optional: Navigation for previous/next month
  changeMonth(delta: number): void {
    this.currentMonth += delta;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.renderCalendar();
    this.updateCalendarSelection();
  }
  // static calender end

  selectedRange = {
    from: null as Date | null,
    to: null as Date | null,
  };

  selectedDateFilter: 'today' | 'tomorrow' | 'weekend' | 'month' | 'custom' | null = null;

  customDateRange = {
    from: '',
    to: ''
  };

  selectDateFilter(type: 'today' | 'tomorrow' | 'weekend' | 'month') {
    this.selectedDateFilter = type;
    this.fromDate = null;
    this.toDate = null;

    const today = new Date();
    let fromDate: Date = new Date();
    let toDate: Date = new Date();

    switch (type) {
      case 'today':
        break; // already today
      case 'tomorrow':
        fromDate.setDate(today.getDate() + 1);
        toDate = new Date(fromDate);
        break;
      case 'weekend':
        // Get next Saturday and Sunday
        const nextSaturday = new Date(today);
        nextSaturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7));
        const nextSunday = new Date(nextSaturday);
        nextSunday.setDate(nextSaturday.getDate() + 1);
        fromDate = nextSaturday;
        toDate = nextSunday;
        break;
      case 'month':
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
    }

    this.pageNowShowing = 1;
    this.pageUpcoming = 1;
    this.filteredPlaysData = [];
    this.filteredPlaysDataUpcoming = [];
    this.loadPlaysData(this.activeTab);
  }

  clearDateRange(): void {
    this.selectedRange = { from: null, to: null };
    this.fromDate = null;
    this.toDate = null;
    this.updateCalendarSelection();
    this.showInlineCalendar = false;
    this.pageNowShowing = 1;
    this.pageUpcoming = 1;
    this.filteredPlaysData = [];
    this.filteredPlaysDataUpcoming = [];
    this.hasMoreNowShowing = true;
    this.hasMoreUpcoming = true;
    this.loadPlaysData(this.activeTab);

  }
  fromDate: Date | null = null;
  toDate: Date | null = null;
  applyDateRange() {
    this.selectedDateFilter = 'custom';

    if (this.selectedRange.from && this.selectedRange.to) {
      this.fromDate = this.selectedRange.from;
      this.toDate = this.selectedRange.to;

      this.pageNowShowing = 1;
      this.pageUpcoming = 1;
      this.filteredPlaysData = [];
      this.filteredPlaysDataUpcoming = [];
      this.loadPlaysData(this.activeTab);
    }
  }
  applyDateRange1() {
    this.selectedDateFilter = 'custom';

    if (this.selectedRange.from && this.selectedRange.to) {
      this.fromDate = this.selectedRange.from;
      this.toDate = this.selectedRange.to;

      this.pageNowShowing = 1;
      this.pageUpcoming = 1;
      this.filteredPlaysData = [];
      this.filteredPlaysDataUpcoming = [];
      this.loadPlaysData(this.activeTab);
    }
  }
  showInlineCalendar = false;
  isSelectingFrom = true;

  toggleInlineCalendar(): void {
    this.showInlineCalendar = !this.showInlineCalendar;
    if (this.showInlineCalendar) {
      // this.renderCalendar();
      this.updateCalendarSelection();
    }
    // this.selectedRange = { from: null, to: null };
  }

  getPlaceholderText(filterName: string): string {
    return `Search ${filterName}${this.checkinlasts(filterName)}`;
  }
  checkinlasts(name: string): string {
    if (!name) return 's'; // default if name is empty/null

    const lastChar = name.trim().slice(-1).toLowerCase();
    return lastChar === 's' ? '' : 's';

  }


  checks(filterName: string): string {
    return `${filterName}${this.checkinlasts(filterName)}`;
  }


  titleeeeeee: any;
  updateMetaTags(category: any, city: any) {
    this.apiService.getAllCategories(0, 0, "", "", " AND ID = " + this.selectedcategoryId).subscribe((res: any) => {
      let isSeoProcessed = false;

      if (res && res.code === 200 && res.data && res.data.length > 0) {
        let seoData = res.data[0].SEO_DATA;
        if (seoData) {
          try {
            let metadata = typeof seoData === 'string' ? JSON.parse(seoData) : seoData;
            
            metadata.URL = window.location.href;
            this.titleeeeeee = metadata.META_NAME || ('Ticket Khidakee - ' + category + ' in ' + city);
            this.title.setTitle(this.titleeeeeee);

            this.meta.updateTag({ name: 'viewport', content: 'width=device-width, initial-scale=1' });
            this.meta.updateTag({ name: 'robots', content: metadata.ROBOTS_META_TAG });
            this.meta.updateTag({ name: 'description', content: metadata.META_DESCRIPTION });
            this.meta.updateTag({ name: 'keywords', content: metadata.META_KEYWORDS });
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

            isSeoProcessed = true;
          } catch (e) {
            console.error(e);
          }
        }
      }

      if (!isSeoProcessed) {
        this.titleeeeeee = 'Ticket Khidakee - ' + category + ' in ' + city;
        this.title.setTitle(this.titleeeeeee);
        let defaultDesc = 'Book tickets for ' + category + ' events in ' + city + ' online at Ticket Khidakee. Catch the best entertainment near you.';

        this.meta.updateTag({ name: 'viewport', content: 'width=device-width, initial-scale=1' });
        this.meta.updateTag({ name: 'description', content: defaultDesc });
        this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.meta.updateTag({ name: 'twitter:title', content: this.titleeeeeee });
        this.meta.updateTag({ name: 'twitter:description', content: defaultDesc });
        this.meta.updateTag({ property: 'og:title', content: this.titleeeeeee });
        this.meta.updateTag({ property: 'og:description', content: defaultDesc });
        this.meta.updateTag({ property: 'og:url', content: window.location.href });
        this.meta.updateTag({ property: 'og:type', content: 'website' });
      }

      let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', window.location.href);
      if (!document.head.contains(link)) {
        document.head.appendChild(link);
      }
    });
  }
  // updateMetaTags(category: any, city: any) {
  //   this.titleeeeeee = 'Ticket Khidakee - ' + category + ' in ' + city
  //   this.title.setTitle('Ticket Khidakee - ' + category + ' in ' + city);

  //   let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
  //   link.setAttribute('rel', 'canonical');
  //   link.setAttribute('href', window.location.href);
  //   if (!document.head.contains(link)) {
  //     document.head.appendChild(link);
  //   }
  //   // const existingScript = document.querySelector("script[type='application/ld+json']");
  //   // if (existingScript) {
  //   //   existingScript.remove();
  //   // }

  //   // const itemList = {
  //   //   "@context": "https://schema.org",
  //   //   "@type": "ItemList",
  //   //   "name": "Upcoming Events - Ticket Khidakee",
  //   //   "url": window.location.href,
  //   //   "itemListElement": this.filteredPlaysData.map((event, index) => {
  //   //     // const eventUrl = this.router.serializeUrl(
  //   //     //   this.router.createUrlTree(['/event', event.slug || event.id])
  //   //     // );
  //   //     // const fullUrl = `${window.location.origin}${eventUrl}`;
  //   //     return {
  //   //       "@type": "ListItem",
  //   //       "position": index + 1,
  //   //       "url": window.location.href,
  //   //       "name": event.NAME,
  //   //       "description": event.description,
  //   //       "image": this.retriveimgUrl +
  //   //         'eventImages/' +
  //   //         event.PLAY_IMAGES || 'https://yourdomain.com/assets/images/default-event.jpg',
  //   //       "startDate": event.startDate,
  //   //       "location": {
  //   //         "@type": "Place",
  //   //         "name": event.location?.name || "Online",
  //   //         "address": event.location?.address || ""
  //   //       }
  //   //     };
  //   //   })
  //   // };

  //   // const script = document.createElement('script');
  //   // script.type = 'application/ld+json';
  //   // script.text = JSON.stringify(itemList);
  //   // document.head.appendChild(script);
  // }


  updateschema() {
    const existingScript = document.querySelector("script[type='application/ld+json']");
    if (existingScript) {
      existingScript.remove();
    }

    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": this.titleeeeeee,
      "url": window.location.href,
      "itemListElement": this.filteredPlaysData.map((event, index) => {
        const eventUrl = this.router.serializeUrl(
          this.router.createUrlTree(['/explore', this.City, event.CATEGORY_NAME, event.EVENT_SLUG, event.EVENT_ID])
        );
        const fullUrl = `${window.location.origin}${eventUrl}`;
        return {
          "@type": "ListItem",
          "position": index + 1,
          "url": fullUrl,
          "name": event.NAME,

          "image": this.retriveimgUrl +
            'eventImages/' +
            event.PLAY_IMAGES || 'https://yourdomain.com/assets/images/default-event.jpg',
          "startDate": event.startDate,
          "location": {
            "@type": "Place",
            "name": this.City || "Online",
            "address": this.City || ""
          }
        };
      })
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(itemList);
    document.head.appendChild(script);
  }




  @ViewChild('owlCarousel', { static: false }) owlCarousel: any;



  onCarouselInitialized(event: any) {
    // Start autoplay after carousel is ready
    this.startCustomAutoplay();
  }
  slideTimer: any;
  currentIndex = 0;
  onSlideChanged(event: any) {
    clearTimeout(this.slideTimer);

    const total = this.banners.length;
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
    const data = this.banners;
    if (!data || data.length === 0 || this.currentIndex >= data.length) return;

    const banner = data[this.currentIndex];
    const durationInSec = parseInt(banner?.DISPLAY_TIME || '3', 10);
    const duration = isNaN(durationInSec) ? 3000 : durationInSec * 1000;
    //
    //
    this.slideTimer = setTimeout(() => {
      if (this.owlCarousel) {
        this.owlCarousel.next();
      }
    }, duration);
  }






}

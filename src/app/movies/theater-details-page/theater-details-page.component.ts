import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/Services/api.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common'; // Import the DatePipe
import { CookieService } from 'ngx-cookie-service';
import { addDays, format } from 'date-fns';

@Component({
  selector: 'app-theater-details-page',
  templateUrl: './theater-details-page.component.html',
  styleUrls: ['./theater-details-page.component.scss'],
})
export class TheaterDetailsPageComponent {
  dates: any[] = [];
  selectedDateIndex: number = 0;
  selectedDate: Date = new Date();

  loadingRecords = false;
  totalRecords = 1;
  pageIndex = 1;
  pageSize = 5;
  sortValue: string = 'desc';
  sortKey: string = 'id';
  searchText: string = '';
  filterQuery: string = '';
  nextFiveDates: { month: string; day: string; label: string; date: Date }[] =
    [];
  selectedIndex: number = 0;
  dataCount: number = 0;
  theatreId: any;
  MovieDataMain: any = [];
  select_Date: any = new Date();
  MovieData: any = [];
    selectedLanguage: string = 'All';
  selectedScreenType: string = 'All';



  columns: string[][] = [
    ['NAME', '  Name'],
    // ['ID', ' ID'],
    // ['LANGUAGES', 'Languages'],
    // ['SHORT_CODE  ', ' Short Code '],
    // ['GENRES', 'Genres'],
    // ['CATEGORY_NAMES', 'Sequence No'],
    // ['DESCRIPTION', 'Sequence No'],
    // ['STATUS', 'status'],
  ];
  imgUrl: any;
  SCREEN_ID: any;
  MOVIE_ID: any;
  START_TIME: any;
  retriveimgUrl = this.api.retriveimgUrl;
  spinnerArray = Array(12);

  // imgUrl = appkeys.retriveimgUrl;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private DatePipe: DatePipe,
    private message: ToastrService,
    private cookie: CookieService
  ) {
    this.generateNextFiveDates();
    this.selectedDateIndex = 0;
    this.selectedDate = this.dates[0].fullDate;
  }
  selectedCityID = this.cookie.get('cityId');

  generateNextFiveDates() {
    const today = new Date();
    this.dates = []; // reset the array

    for (let i = 0; i < 5; i++) {
      const futureDate = addDays(today, i);
      const label =
        i === 0
          ? 'Today'
          : futureDate.toLocaleDateString('en-US', { weekday: 'short' });

      this.dates.push({
        day: futureDate.getDate().toString().padStart(2, '0'),
        month: futureDate.toLocaleDateString('en-US', { month: 'short' }),
        label: label,
        fullDate: futureDate,
      });
    }

    this.selectedDate = this.dates[0].fullDate; // Set default selection
  }

  selectDate(index: number, date: any): void {
    this.selectedDateIndex = index; // ✅ match the variable used in HTML
    this.select_Date = this.DatePipe.transform(date, 'yyyy-MM-dd');
    this.search(true, false);
    this.loadingRecords = true;

  }

  SearchBY() {
    if (this.searchText.length > 3) {
      this.search(false, false);
      this.loadingRecords = true;

      
    } else if (this.searchText.length == 0) {
      this.search(false, false);
      this.loadingRecords = true;

    }
  }
 
  focusSearchInput() {
    const input = document.getElementById('search-input') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  }

  movieName: string = '';
  movieAddress: string = '';
  theaterLongitude: any = '';
  theaterLatitude: any = '';
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const theaterId = params.get('id');
      if (theaterId) {
        
        // this.getCast(theaterId);
        this.theatreId = theaterId;
        this.search();
        this.loadingRecords = true;

      }
    });
    this.getLangauages();
    this.movieName = sessionStorage.getItem('theaterName') || 'Default Theater Name';
    this.movieAddress = sessionStorage.getItem('theaterAddress') || 'Default Address';

    this.theaterLatitude = sessionStorage.getItem('theaterLatitude');
    this.theaterLongitude = sessionStorage.getItem('theaterLongitude');


    // this.getNextFiveDate();
  }
  

  LangaugeData: any;

  getLangauages() {
    this.api.getLangaugeData(0, 0, '', 'asc', '').subscribe((data) => {
      if (data['code'] == 200) {
        this.LangaugeData = data['data'];
      } else {
        this.LangaugeData = [];
      }
    });
  }

  // When clicking language
  selectLanguage(language: string) {
    this.selectedLanguage = language;
    this.loadingRecords = true;

    this.triggerFilter();
  }


  // When clicking screen type
  selectScreenType(screenType: string) {
    this.selectedScreenType = screenType;
    this.loadingRecords = true;

    this.triggerFilter();
  }



  searchLoading : boolean  = false
  onSearchInputChange(): void {
    if (this.searchText.length >= 3 || this.searchText.length === 0) {
      this.loadingRecords = false
      this.searchLoading = true
      this.triggerFilter();
    }
  }

  triggerFilter() {
    this.search(true);
  }

  search(reset: boolean = false, loadMore: boolean = false) {
    if (reset) {
      this.pageIndex = 1;
      this.sortKey = 'id';
      this.sortValue = 'desc';
    }

    
    var sort: string;
    try {
      sort = this.sortValue.startsWith('a') ? 'asc' : 'desc';
    } catch (error) {
      sort = '';
    }

    var likeQuery = '';

    if (this.searchText != '') {
      likeQuery = ' AND(';
      this.columns.forEach((column) => {
        likeQuery += ' ' + column[0] + " like '%" + this.searchText + "%' OR";
      });
      likeQuery = likeQuery.substring(0, likeQuery.length - 2) + ')';
    }
    // this.filterQuery = " AND THEATER_ID=" + this.theatreId;
    var MOVIE_DATE = this.DatePipe.transform(this.select_Date, 'yyyy-MM-dd');
    var MOVIEDATE = {
      MOVIE_DATE: MOVIE_DATE,
      THEATER_ID: this.theatreId,
      MOVIE_ID: '',
      MOVIE_LANGUAGE:
        this.selectedLanguage !== 'All' ? this.selectedLanguage : '',
      MOVIE_SCREEN_TYPE:
        this.selectedScreenType !== 'All' ? this.selectedScreenType : '',
      NAME:
        this.searchText !== ' ' ? this.searchText : '',
    };

    this.api
      .getScheduledShows(
        this.pageIndex,
        this.pageSize,
        this.sortKey,
        sort,
        MOVIEDATE,
       this.filterQuery
      )
      .subscribe(
        (data) => {
          if (data.length != 0) {
            this.dataCount = data.totalRecords;
            if (
              loadMore &&
              this.MovieData != undefined &&
              this.MovieData != null
            ) {
              this.MovieData = [...this.MovieData, ...data['data']];
            } else {
              this.MovieData = [...[], ...data['data']];
            }
            this.loadingRecords = false;
            this.searchLoading = false;
          } else {
            // this.MovieData = [];
            this.loadingRecords = false;
            this.searchLoading = false;

          }

          
        },
        (err) => {
          
          this.message.error('Server not found', '');
          this.loadingRecords = false;
        }
      );
  }

  formatDuration(duration: string | number): string {
    const mins = parseInt(duration as string, 10);
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs} hr ${remainingMins} min`;
  }

  isPastTime(startTime: string): boolean {
    const now = new Date();
    const today = new Date();
    const [hours, minutes] = startTime.split(':').map(Number);
    const showTime = new Date(today.setHours(hours, minutes, 0, 0));
    return showTime < now;
  }

  
  selectTiming(dataShows: any, dataMOVIES: any): void {
    this.START_TIME = dataMOVIES;
    this.SCREEN_ID = dataShows.SCREEN_ID;
    this.MOVIE_ID = dataShows.MOVIE_ID;

    const data = {
      // MovieData: JSON.stringify(this.MovieDataMain),
      MOVIE_ID: dataMOVIES.MOVIE_ID,
      MOVIE_DATA: JSON.stringify(dataMOVIES),
      START_TIME: dataShows.START_TIME,
      MOVIE_SCREEN_TYPE: dataShows.MOVIE_SCREEN_TYPE,
      MOVIE_LANGUAGE: dataShows.MOVIE_LANGUAGE,
      THEATER_ID: dataShows.THEATER_ID,
      SCREEN_ID: dataShows.SCREEN_ID,
      THEATER_NAME: dataShows.THEATER_NAME,
      TOTAL_REVENUE: dataShows.TOTAL_REVENUE,
      SELECTED_DATE: this.DatePipe.transform(this.select_Date, 'yyyy-MM-dd'),
    };
    // this.drawerData = Object.assign({}, data);
    // this.drawerVisible = true;
  }

  getTime(startTime: string): string {
    const date = new Date(`1970-01-01T${startTime}`);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}

import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Services/api.service';
import { LocationService } from 'src/app/Services/location.service';
declare var bootstrap: any;

@Component({
  selector: 'app-bookeventticket',
  templateUrl: './bookeventticket.component.html',
  styleUrls: ['./bookeventticket.component.scss']
})
export class bookeventticketComponent {

  constructor(private route: ActivatedRoute, private toastr: ToastrService, private cdr: ChangeDetectorRef,
    private datePipe: DatePipe, private locationService: LocationService, private apiService: ApiService) { }
  theatreIcons = [
    { class: 'bi-cup-straw', label: 'Food Court' },
    { class: 'bi-car-front', label: 'Parking' },
    { class: 'bi-snow', label: 'AC' },
    { class: 'bi-wifi', label: 'WiFi' },
    { class: 'bi-lightning-charge', label: 'Charging Point' },
    { class: 'bi-person-wheelchair', label: 'Wheelchair' }
  ];
  ngAfterViewInit(): void {
    const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipElements.forEach((element) => {
      new bootstrap.Tooltip(element); // Initialize tooltips for each element
    });
  }
  selectedCityId: any;
  movieID: any;

  ngOnInit() {
    const movieId = this.route.snapshot.paramMap.get('movieId');
    this.memberId = localStorage.getItem('memberId');

    this.movieID = movieId
    const movieName = decodeURIComponent(this.route.snapshot.paramMap.get('movieName') || '');
    const cityId = decodeURIComponent(this.route.snapshot.paramMap.get('cityId') || '');
    this.getLangauages()
    this.generateNextSevenDates();
    this.selectedDateIndex = 0;
    this.selectedDate = this.dates[0].fullDate;

    this.locationService.selectedCity$.subscribe((cityName: any) => {
      if (cityName) {
        this.selectedCityId = cityName;
        // Trigger your logic here (e.g., fetch movies/events for the new city)
        this.getMovieDetails(movieId)
        // this.getScheduledShowsByTheater(movieId);
        this.triggerFilter();
      }
    });
  }

  MoviesData: any = {
    NAME: '',
    MOVIE_IMAGES: [],
    MOVIE_VIDEOS: [],
    SCREEN_TYPES: [],
    LANGUAGES: [],
    DURATION: 0,
    GENRES: [],
    CENSOR_BOARD_RATING: '',
    RELEASE_DATE: '',
    DESCRIPTION: '',
    SHORT_CODE: '',
    TERMS_CONDITIONS: [],
    CAST: [],
    CREW: [],
    AVERAGE_RATING: 0,
    RATING_COUNT: 0,
  };
  movieImage: string = '';
  PosterImage: string = '';
  parseJson(jsonString: string): any[] {
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  }
  getMovieDetails(movieId: any) {
    this.PosterImage = '';
    this.movieImage = '';
    this.apiService.getMovieDetails(0, 0, '', 'asc', ' AND ID = ' + movieId).subscribe(
      (data: any) => {
        if (data['code'] === 200 && data['data'].length > 0) {
          const movie = data['data'][0];
          this.MoviesData = {
            ...movie,
            GENRES: this.splitString(movie.GENRES),
            SCREEN_TYPES: this.splitString(movie.SCREEN_TYPES),
            LANGUAGES: this.splitString(movie.LANGUAGES),
            MOVIE_IMAGES: this.parseJson(movie.MOVIE_IMAGES),
          };

          if (this.MoviesData.MOVIE_IMAGES.length > 0) {
            this.MoviesData.MOVIE_IMAGES.forEach((img: any) => {
              if (img['IS_DEFAULT']) {
                this.PosterImage = img['URL'];
              } else {
                this.movieImage = img['URL'];
              }
            });

            // Fallback if IS_DEFAULT wasn't found
            if (!this.PosterImage) {
              this.PosterImage = this.MoviesData.MOVIE_IMAGES[0]['URL'];
            }
          }

        } else {
          this.MoviesData = {
            NAME: '',
            MOVIE_IMAGES: [],
            MOVIE_VIDEOS: [],
            SCREEN_TYPES: [],
            LANGUAGES: [],
            DURATION: 0,
            GENRES: [],
            CENSOR_BOARD_RATING: '',
            RELEASE_DATE: '',
            DESCRIPTION: '',
            SHORT_CODE: '',
            TERMS_CONDITIONS: [],
            CAST: [],
            CREW: [],
            AVERAGE_RATING: 0,
            RATING_COUNT: 0,
          };
        }
      },
      (error) => {
        console.error('Error fetching movie details', error);
      }
    );

  }

  splitString(str: string): string[] {
    return str ? str.split(',').map(s => s.trim()) : [];
  }
  filteredMoviesData: any[] = [];
  RecomendedMoviesData: any[] = [];


  theatres: any[] = [];
  toggleExpand(theatre: any): void {
    theatre.expanded = !theatre.expanded;
  }
  getScheduledShowsByTheater(movieId: any) {

    this.theatres = [{
      NAME: 'Vishnudas Bhave Natyagruha',
      facilitiesSet: 'M-Ticket,AC,Parking,Ticket Cancellation',
      address: 'Harbhat Rd, near City Municipal Corporation, Gaon Bhag, Sangli, Sangli Miraj Kupwad, Maharashtra 416416',
      LATITUDE: '16.8600393',
      LONGITUDE: '74.5609017',
      DATETIME: '2025-05-22 11:30:03',
    }];

  }

  // Helper to format 24-hour time to 12-hour format (e.g., 15:00:00 → 3:00 PM)
  formatTime(timeStr: string): string {
    const [hour, minute] = timeStr.split(':').map(Number);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${suffix}`;
  }
  searchVisible = false;

  toggleSearch() {
    this.searchVisible = !this.searchVisible;
  }
  dates: { day: string; date: string; fullDate: Date }[] = [];

  generateNextSevenDates() {
    const daysShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    this.dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return {
        day: daysShort[date.getDay()],
        date: this.formatDateDisplay(date), // e.g., "06 MAY"
        fullDate: date                      // actual Date object
      };
    });
  }

  formatDateDisplay(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    return `${day} ${month}`;
  }

  selectedDateIndex = 0;

  selectDate(index: number) {
    this.selectedDateIndex = index;
    this.selectedDate = this.dates[index].fullDate; // 🟢 use full Date object
    this.triggerFilter();
  }

  selectedLanguage: string = 'All';
  selectedScreenType: string = 'All';
  LangaugeData: any;
  screenTypesSet: any;


  // When clicking language
  selectLanguage(language: string) {
    this.selectedLanguage = language;
    this.triggerFilter();
  }


  // When clicking screen type
  selectScreenType(screenType: string) {
    this.selectedScreenType = screenType;
    this.triggerFilter();
  }

  selectedDate: Date = new Date();
  retriveimgUrl = this.apiService.retriveimgUrl;

  Facilities: any[] = [];

  triggerFilter() {
    const lang = this.selectedLanguage === 'All' ? '' : this.selectedLanguage;
    const screen = this.selectedScreenType === 'All' ? '' : this.selectedScreenType;
    // const date = '2025-05-06'
    const date = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd') || '';
    const searchText = this.searchText || '';
    this.theatres = [{
      NAME: 'Vishnudas Bhave Natyagruha',
      facilitiesSet: 'M-Ticket,AC,Parking,Ticket Cancellation',
      address: 'Harbhat Rd, near City Municipal Corporation, Gaon Bhag, Sangli, Sangli Miraj Kupwad, Maharashtra 416416',
      LATITUDE: '16.8600393',
      LONGITUDE: '74.5609017',
      DATETIME: '2025-05-22 11:30:03'
    }];
    // this.apiService.getScheduledShowsByTheaternew(this.movieID, this.selectedCityId, lang, screen, date, searchText)
    //   .subscribe((data: any) => {
    //     if (data.status === 200) {
    //       this.theatres = data.data;
    //       this.theatres = this.theatres.map(theatre => {
    //         const facilities = theatre.AVAILABLE_FACILITIES_JSON?.split(',').map((f: any) => f.trim()) || [];
    //         return { ...theatre, facilitiesSet: new Set(facilities) };
    //       });
    //       this.fetchAllTheaterLikes();
    //     } else {
    //       this.theatres = [];
    //     }
    //   }, () => {
    //     this.theatres = [];
    //   });
  }
  getLangauages() {
    this.apiService.getLangaugeData(0, 0, "", "asc", "").subscribe((data) => {
      if (data['code'] == 200) {
        this.LangaugeData = data['data']
      } else {
        this.LangaugeData = [];
      }

    });
  }
  searchText: string = '';
  onSearchInputChange(): void {
    if (this.searchText.length >= 3 || this.searchText.length === 0) {
      this.triggerFilter();
    }
  }
  selectedFacilities: string[] = [];

  toggleFacility(facility: string) {
    const index = this.selectedFacilities.indexOf(facility);
    if (index > -1) {
      this.selectedFacilities.splice(index, 1);
    } else {
      this.selectedFacilities.push(facility);
    }
  }

  isFacilitySelected(facility: string): boolean {
    return this.selectedFacilities.includes(facility);
  }
  loglink(url: string) {
    window.open(url, '_blank');
  }
  memberId: any;

  toggleLike(theater: any) {
    const isLiking = !theater.isLiked;

    const likePayload = {
      THEATER_ID: theater.THEATER_ID,
      MEMBER_ID: this.memberId,
      STATUS: isLiking ? 1 : 0,
      ID: theater.wishlistId,
    };

    if (isLiking && theater.wishlistId == null) {
      this.apiService.createLike(likePayload).subscribe({
        next: (res: any) => {
          if (res.code == '200') {
            theater.isLiked = true;
            // this.toastr.success('Liked successfully.', 'Success');
          } else {
            // this.toastr.warning('Could not like the theater.', 'Warning');
          }
          this.fetchAllTheaterLikes();
        },
        error: () => {
          // this.toastr.error('Error liking the theater.', 'Error');
        },
      });
    } else {
      this.apiService.updateLike(likePayload).subscribe({
        next: (res: any) => {
          if (res.code == '200') {
            theater.isLiked = false;
            // this.toastr.success('Like removed.', 'Success');
          } else {
            // this.toastr.warning('Could not remove like.', 'Warning');
          }
          this.fetchAllTheaterLikes();
        },
        error: () => {
          // this.toastr.error('Error updating like.', 'Error');
        },
      });
    }
  }
  isWishlistLoading: boolean = false;
  likeItems: any[] = [];
  filteredLikeItems: any[] = [];
  fetchAllTheaterLikes() {
    this.isWishlistLoading = true;

    this.apiService
      .getAllLikes(0, 0, 'id', 'desc', '') // You can modify the filter as needed
      .subscribe(
        (response: any) => {
          const isSuccessful = response?.code === 200;
          const hasData = response?.data?.length > 0;

          if (isSuccessful && hasData) {
            this.likeItems = response.data;
            this.filteredLikeItems = [...this.likeItems];

            // After fetching like data, update theaters with like status
            this.updateLikeStatus();
          }

          this.isWishlistLoading = false;
        },
        (error: any) => {
          console.error('Error fetching like data:', error);
          this.isWishlistLoading = false;
        }
      );
  }
  updateLikeStatus() {
    this.theatres.forEach((theater: any) => {
      const matchedWishlist = this.filteredLikeItems.find(
        (wishlistItem: any) => wishlistItem.THEATER_ID === theater.THEATER_ID
      );

      if (matchedWishlist) {
        theater.isLiked = matchedWishlist.STATUS;
        theater.wishlistId = matchedWishlist.ID;
      } else {
        theater.isLiked = false;
        theater.wishlistId = null;
      }
    });


    this.cdr.detectChanges();
  }
}

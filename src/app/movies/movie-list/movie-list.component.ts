import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/Services/api.service';
import { LocationService } from 'src/app/Services/location.service';
@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss']
})
export class MovieListComponent {


  ngAfterViewInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      this.showArrows = this.MoviesData.length > 5;
      this.canScrollRight = true;
      this.updateArrows();
    }, 0);
  }

  selectedLanguage: string = 'All';
  selectedGenre: string = 'All';
  selectedScreenType: string = 'All';


  constructor(private route: ActivatedRoute,private cookie:CookieService, private apiService: ApiService, private locationService: LocationService,
  ) { }


  retriveimgUrl = this.apiService.retriveimgUrl;
  isLoading: boolean = true;
  banners: any[] = [];
  LangaugeData: any[] = [];
  City: string = '';


  ngOnInit() {
    this.getBanners();
    this.getLangauages();
    this.getGenresData();
    this.route.paramMap.subscribe(params => {
      const city = params.get('city');
      if (city) {
        // this.getMovieData();
        this.City = city;
      }
    });
    this.locationService.selectedCity$.subscribe((cityName:any) => {
      if (cityName) {
        this.selectedCityId = cityName;
        // Trigger your logic here (e.g., fetch movies/events for the new city)
        this.getMovieData();
      }
    });
    this.selectedCityId = this.cookie.get('cityId');
  }

  applyFilters() {
    this.filteredMoviesData = this.MoviesData.filter(event => {
      return this.matchFilters(event);
    });
    
    this.filteredMoviesDataUpcoming = this.MoviesDataUpcoming.filter(event => {
      return this.matchFilters(event);
    });
  }
  
  matchFilters(event: any): boolean {
    const matchLanguage = this.selectedLanguage === 'All' || event.LANGUAGES?.includes(this.selectedLanguage);
    const matchGenre = this.selectedGenre === 'All' || event.GENRES?.includes(this.selectedGenre);
    const matchScreenType = this.selectedScreenType === 'All' || event.SCREEN_TYPES?.includes(this.selectedScreenType);
  
    return matchLanguage && matchGenre && matchScreenType;
  }
  
  // When clicking language
  selectLanguage(language: string) {
    this.selectedLanguage = language;
    this.applyFilters();
  }
  
  // When clicking genre
  selectGenre(genre: string) {
    this.selectedGenre = genre;
    this.applyFilters();
  }
  
  // When clicking screen type
  selectScreenType(screenType: string) {
    this.selectedScreenType = screenType;
    this.applyFilters();
  }
  


  setActive(event: any) {
    const buttons = document.querySelectorAll('.controls .control');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
  }

  getBanners() {
    this.isLoading = true;
    this.apiService.getBanners(0, 0, "", "", "").subscribe((data) => {
      if (data['code'] == 200) {
        this.banners = data['data']
        this.isLoading = false;
      } else {
        this.banners = [];
      }

    });
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
  getGenresData() {
    this.apiService.getGenresData(0, 0, "", "asc", " AND STATUS = 1").subscribe((data) => {
      if (data['code'] == 200) {
        this.GenresData = data['data']
      } else {
        this.GenresData = [];
      }

    });
  }
  MoviesData: any[] = [];
  GenresData: any[] = [];
  MoviesDataUpcoming: any[] = [];
  getMoviesForCity(city: string) {
    this.apiService.getMovieData(0, 0, '', 'asc', '').subscribe(
      (data: any) => {
        if (data['code'] === 200) {
          this.MoviesData = data['data'].slice(0,10).map((movie: any) => {
            return {
              ...movie,
              MOVIE_IMAGES: this.parseImageUrl(movie.MOVIE_IMAGES),
              MOVIE_VIDEOS: this.parseJson(movie.MOVIE_VIDEOS),
              GENRES: this.splitString(movie.GENRES),
              SCREEN_TYPES: this.splitString(movie.SCREEN_TYPES),
              LANGUAGES: this.splitString(movie.LANGUAGES),
              TERMS_CONDITIONS: this.parseJson(movie.TERMS_CONDITIONS)
            };
          });
        } else {
          this.MoviesData = [];
        }
      },
      () => { }
    );
  }

  selectedCityId: any;
  searchLoading:boolean  = false

  getMovieData() {
    this.searchLoading = true;
    this.apiService.getCityWiseMoviesData(0, 0, '', 'asc', '', this.selectedCityId).subscribe(
      (data: any) => {
        if (data['code'] === 200) {
          this.MoviesData = data['data'].nowShowing.slice(0,10).map((movie: any) => {
            const movieDetails = movie.MOVIE_DETAILS || {};
          return {
            ...movie,
            NAME: movieDetails.NAME || '',
            MOVIE_IMAGES: this.parseImageUrl(movieDetails.MOVIE_IMAGES),
            GENRES: this.splitString(movieDetails.GENRES),
            SCREEN_TYPES: this.splitString(movieDetails.SCREEN_TYPES),
            LANGUAGES: this.splitString(movieDetails.LANGUAGES),
            CENSOR_BOARD_RATING: movieDetails.CENSOR_BOARD_RATING || '',
            RELEASE_DATE: movieDetails.RELEASE_DATE || '',
            TERMS_CONDITIONS: this.parseJson(movieDetails.TERMS_CONDITIONS),
            AVERAGE_RATING: movieDetails.AVERAGE_RATING || 0,
          };
          });
          this.MoviesDataUpcoming = data['data'].upcoming.slice(0,10).map((movie: any) => {
            const movieDetails = movie.MOVIE_DETAILS || {};
          return {
            ...movie,
            NAME: movieDetails.NAME || '',
            MOVIE_IMAGES: this.parseImageUrl(movieDetails.MOVIE_IMAGES),
            GENRES: this.splitString(movieDetails.GENRES),
            SCREEN_TYPES: this.splitString(movieDetails.SCREEN_TYPES),
            LANGUAGES: this.splitString(movieDetails.LANGUAGES),
            CENSOR_BOARD_RATING: movieDetails.CENSOR_BOARD_RATING || '',
            RELEASE_DATE: movieDetails.RELEASE_DATE || '',
            TERMS_CONDITIONS: this.parseJson(movieDetails.TERMS_CONDITIONS),
            AVERAGE_RATING: movieDetails.AVERAGE_RATING || 0,
          };
          });

          this.filteredMoviesData = this.MoviesData;
          this.filteredMoviesDataUpcoming = this.MoviesDataUpcoming;
          this.searchLoading = false;

        } else {
          this.MoviesData = [];
        }
      },
      () => { }
    );
  }
  filteredMoviesData: any[] = [];
  filteredMoviesDataUpcoming: any[] = [];
  
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
    return str ? str.split(',').map(s => s.trim()) : [];
  }
  
  toggleBookmark(event: any) {
    event.bookmarked = !event.bookmarked;
  }

  onImageError(event: any) {
    event.target.src = '/assets/movie_skel.jpg';
  }

    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    canScrollLeft = false;
    canScrollRight = true;
    showArrows = false;

    scrollLeft() {
      this.scrollContainer.nativeElement.scrollBy({ left: -this.getScrollAmount(), behavior: 'smooth' });
      setTimeout(() => this.updateArrows(), 400);
    }
  
    scrollRight() {
      this.scrollContainer.nativeElement.scrollBy({ left: this.getScrollAmount(), behavior: 'smooth' });
      setTimeout(() => this.updateArrows(), 400);
    }
  
    onScroll() {
      this.updateArrows();
    }
  
    private updateArrows() {
      const el = this.scrollContainer.nativeElement;
      this.canScrollLeft = el.scrollLeft > 0;
      this.canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 10;
    }
  
    private getScrollAmount(): number {
      const card = this.scrollContainer.nativeElement.querySelector('.event-card-wrapper');
      const cardWidth = card?.offsetWidth || 250;
      return cardWidth * 5; // Scrolls 5 items at once
    }
}

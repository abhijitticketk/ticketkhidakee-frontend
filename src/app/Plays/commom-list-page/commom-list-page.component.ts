import {

  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/Services/api.service';
export interface Banner {
  NAME: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  IMG_URL: string;
}

interface GroupedCategory {
  CATEGORY_ID: string;
  CATEGORY_NAME: string;
  EVENTS: any;
}

interface Filter {
  name: string;
  id: string;
  key: string;
  visibleCount: number;
  searchTerm: string;
  [key: string]: any; // <- add this line
}


@Component({
  selector: 'app-commom-list-page',
  templateUrl: './commom-list-page.component.html',
  styleUrls: ['./commom-list-page.component.scss'],
})
export class CommomListPageComponent {
  @HostListener('window:resize', [])
  // onResize() {
  //   this.updateArrows();
  // }
  banners: Banner[] = [];
  MovieData: any[] = [];
  EventData: any[] = [];
  sectionData: any[] = [];
  scheduleActivityDetails: any[] = [];
  selectedCity = this.cookie.get('cityName');
  selectedCityId: any;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cookie: CookieService, private title: Title
  ) { }

  retriveimgUrl = this.apiService.retriveimgUrl;
  isLoading: boolean = true;

  memberId: any;
  sectionDataIDDD: any;
  isMobile: Boolean = false;
  cityname: any
  ngOnInit(): void {
    this.isMobile = this.apiService.isMobileDevice();
    this.route.params.subscribe((params) => {
      this.sectionDataIDDD = params['id'];

      var citynameeeee = params['city']
      var banner = params['banner']
      this.updateMetaTags(banner, citynameeeee)

      if (this.sectionDataIDDD) {
        // this.locationService.selectedCity$.subscribe((cityName: any) => {
        //   if (cityName) {
        //     this.selectedCityId = cityName.ID;
        //     this.cityname = cityName.NAME
        //
        //
        // alert(this.cookie.get('changedfrommainroute'))
        // if (this.cookie.get('changedfrommainroute') == 'false') {
        // if (citynameeeee.toLowerCase() == this.cityname.toLowerCase()) {

        // } else {
        //   this.getCities(citynameeeee)
        //   // this.router.navigate([`/page-not-found`]);
        // }
        // } else {
        //   this.cookie.delete('changedfrommainroute')
        //   this.cookie.set('changedfrommainroute', 'false', 365, '/', '')
        //   this.router.navigateByUrl(`/explore/shows/${this.cityname}/${banner}/${this.sectionDataIDDD}`, {
        //     replaceUrl: true // this avoids adding history entry
        //   });
        //   this.getdyanamicsessiondata(this.sectionDataIDDD);
        // }

        //     }
        //   });
        this.getdyanamicsessiondata(this.sectionDataIDDD);
      }


      window.scrollTo({ top: 0, behavior: 'smooth' }); // Your method to fetch data
    });

    this.memberId = localStorage.getItem('memberId');

    // if (this.memberId) {
    //   this.fetchAllWishlistData();
    // }

    window.screenTop = 0;
  }
  // formatShowDates(dateRange: string, time: any): string {
  //     const dates = dateRange.split(' TO ');
  //     const firstDate = dates[0].trim();
  //     const secondDate = dates[1].trim();

  //     if (firstDate === secondDate) {
  //       return firstDate + ' ' + time;
  //     } else {
  //       return `${firstDate} & onwards`;
  //     }
  //   }
  wishlistItems: any[] = [];
  filteredWishlistItems: any[] = [];
  isWishlistLoading: boolean = false;

  fetchAllWishlistData() {
    this.isWishlistLoading = true;

    this.apiService
      .getallwishlist(0, 0, 'id', 'desc', 'AND MEMBER_ID = ' + this.memberId)
      .subscribe(
        (response: any) => {
          const isSuccessful = response?.code == 200;
          const hasData = response?.data?.length > 0;

          if (isSuccessful && hasData) {
            this.wishlistItems = response.data;



            this.filteredWishlistItems = [...this.wishlistItems];

            // After fetching wishlist data, update MovieData with bookmark status
            // this.updateBookmarkStatus();
          }

          this.isWishlistLoading = false;
          this.addbookmarkspin = false;
        },
        (error: any) => {
          console.error('Error fetching wishlist data:', error);
          this.isWishlistLoading = false;
        }
      );
  }

  getBanners() {
    this.isLoading = true;
    this.apiService.getBanners(0, 0, '', '', '').subscribe((data) => {
      if (data['code'] == 200) {
        this.banners = data['data'];
        this.isLoading = false;
      } else {
        this.banners = [];
      }
    });
  }

  eventsSections: any;
  loading: boolean = false;
  dynamicSections: any;

  encodeUrl(imageUrl: string): string {
    // Encode the image file name only, and hardcode 'Play Photos' as 'Play%20Photos'
    return `url(assets/Play%20Photos/${encodeURIComponent(imageUrl)})`;
  }

  addbookmarkspin: boolean = true;
  toggleBookmark(event: any) {
    this.addbookmarkspin = true;


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
          // this.fetchAllWishlistData();
        },
        error: () => {
          this.addbookmarkspin = false;
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
          // this.fetchAllWishlistData();
        },
        error: () => {
          this.addbookmarkspin = false;
          // this.toastr.error('Error adding bookmark.', 'Error');
        },
      });
    }
  }

  updateBookmarkStatus() {
    const wishlistMap = new Map(
      this.wishlistItems.map((item: any) => [item.EVENT_ID, item])
    );

    if (this.sessiondatadyanamic?.length) {
      this.sessiondatadyanamic.forEach((section: any) => {
        if (section.SECTION_DATA?.length) {
          section.SECTION_DATA.forEach((event: any) => {
            const matchedWishlist = wishlistMap.get(event.EVENT_ID);

            if (matchedWishlist) {
              event.bookmarked = matchedWishlist.STATUS === 1;
              event.wishlistId = matchedWishlist.ID;
            } else {
              event.bookmarked = false;
              event.wishlistId = null;
            }
          });
        }
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
    //

    const title = section?.TITLE?.toLowerCase() || '';
    return ['/explore', this.cityname, event.CATEGORY_NAME, event.EVENT_SLUG, event._id];
    // if (section == 'Upcoming Events') {

    // } else {
    //   return ['/menu/plays', event.EVENT_ID, 'nowshowing'];
    // }
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

  @ViewChildren('scrollContainer') scrollContainers!: QueryList<ElementRef>;

  scrollAmount = 300;
  canScrollLeft = false;
  canScrollRight = true;
  showArrows = false;

  scrollLeft(index: number): void {
    const container = this.scrollContainers.toArray()[index];
    container.nativeElement.scrollBy({
      left: -this.scrollAmount,
      behavior: 'smooth',
    });
  }

  scrollRight(index: number): void {
    const container = this.scrollContainers.toArray()[index];
    container.nativeElement.scrollBy({
      left: this.scrollAmount,
      behavior: 'smooth',
    });
  }

  onScroll(index: number): void {
    // Optional: handle scroll tracking per section if needed
    const container = this.scrollContainers.toArray()[index];

  }

  convertTo12Hour(time: string): string {
    if (!time) return '';
    const [hour, minute] = time.split(':').map(Number);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = ((hour + 11) % 12) + 1;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${suffix}`;
  }

  // shubham code
  mainbannersessiondatadyanamicforcheck1: any = [];
  sessiondatadyanamic: any = [];
  mainbannersessiondatadyanamic: any = [];
  groupedData: any;
  getdyanamicsessiondata(iddddd: any) {
    this.isLoading = true;
    var filter = " AND IS_ACTIVE=1 AND STATUS='M' AND BANNER_ID=" + iddddd;

    this.apiService

      .getSectionMappting(
        0,
        0,
        'ID',
        'asc',
        filter,
        iddddd,
        this.selectedCityId
      )
      .subscribe((data) => {
        if (data['code'] == 200) {
          this.mainbannersessiondatadyanamic = data['bannerData'];
          this.sessiondatadyanamic = data['data'];

          this.groupedData = this.groupEventsByCategory(
            this.sessiondatadyanamic
          );
          this.sessiondatadyanamic = this.groupedData;


          this.isLoading = false;
        } else {
          this.sessiondatadyanamic = [];
          this.isLoading = false;
        }
      });
  }

  gotoroutube(event: any) {
    if (event.REDIRECT_TYPE == 'U') {
    } else if (event.REDIRECT_TYPE == 'E') {
      this.router.navigate([`/menu/plays/${event.EVENT_ID}/upcoming`]);
    } else {
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

  groupEventsByCategory(events: any[]): any[] {
    const grouped: { [key: string]: GroupedCategory } = {};

    events.forEach((event) => {
      const { CATEGORY_ID, CATEGORY_NAME, ...eventData } = event;

      if (!grouped[CATEGORY_ID]) {
        grouped[CATEGORY_ID] = {
          CATEGORY_ID,
          CATEGORY_NAME,
          EVENTS: [],
        };
      }

      grouped[CATEGORY_ID].EVENTS.push(eventData);
    });

    return Object.values(grouped);
  }

  getFirstGenre(genreString: string): string {
    if (!genreString) return ''; // handles null, undefined, or empty string
    const genres = genreString.split(',').map((g) => g.trim());
    return genres.length > 1 ? `${genres[0]}` : genres[0];
  }
  hasMoreGenres(genreString: string): boolean {
    if (!genreString) return false;
    return genreString.split(',').map((g) => g.trim()).length > 1;
  }
  formatShowDates(dateRange2: string, time: any): string {
    if (!dateRange2)
      return '';

    if (!dateRange2.includes('TO'))
      var dateRange = dateRange2 + " TO " + dateRange2;
    else 
      var dateRange = dateRange2;

    const dates = dateRange.split(' TO ');
    const firstRaw = dates[0]?.trim();
    const secondRaw = dates[1]?.trim();

    const parseDDMMYYYY = (dateStr: string): Date => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    const firstDate = parseDDMMYYYY(firstRaw);
    const secondDate = parseDDMMYYYY(secondRaw);

    if (isNaN(firstDate.getTime()) || isNaN(secondDate.getTime())) {
      console.error('Invalid date(s):', firstRaw, secondRaw);
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

  customOptions = {
    loop: false,
    margin: 10,
    nav: false,
    dots: false,
    center: true,
    autoplay: false,
    navText: ['<span><i style="display: none !important;" class="fa-solid fa-caret-left"></i></span>', '<span><i style="display: none !important;" class="fa-solid fa-caret-right"></i></span>'],
    autoplayTimeout: 3000,
    autoplayHoverPause: false,
    responsive: {
      0: { items: 1 },
      768: { items: 1 },
      1000: { items: 1 },
    },
  };








  allcities: any
  cities: any
  getCities(search: string = '') {
    // this.loadData()

    // this.loaderService.show();

    const filter = search ? `AND NAME LIKE '%${search}%'` : `AND NAME LIKE '%${this.cityname}'`;
    this.apiService
      .getAllCities(0, 0, 'id', 'desc', filter + 'AND STATUS = 1')
      .subscribe(
        (data: any) => {
          if (data?.code == 200 && data?.data?.length > 0) {
            this.allcities = data.data;
            this.cities = data.data[0];
            // this.cookie.delete('citieslist')
            // this.cookie.set('citieslist', JSON.stringify(this.cities), 365, '/', '', false, 'Strict');
            const locationName = this.cookie.get('locationname');
            const isLocationNameValid =
              locationName &&
              locationName !== 'null' &&
              locationName.trim() !== '';


            this.cookie.delete('cities');
            this.cookie.delete('cityName');
            this.cookie.delete('cityId');
            var now = new Date();
            var expiryDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(), // move to next day
              23, 59, 59          // set to 00:00:00
            );
            this.cookie.set('cityId', this.cities.ID, expiryDate, '/', '', false, 'Strict');
            this.cookie.set('cities', 'true', expiryDate, '/', '', false, 'Strict');
            this.cookie.set('cityName', this.cities.NAME, expiryDate, '/', '', false, 'Strict');
            // this.locationService.setSelectedCity(this.cities);
            this.getdyanamicsessiondata(this.cities.ID);
            // this.stopLoader()
          } else {

          }
          // this.loaderService.hide();
        },
        (error: any) => {
          console.error('Error fetching cities:', error);
          // this.stopLoader()
        }
      );
  }


  updateMetaTags(category: any, city: any) {
    this.title.setTitle('Ticket Khidakee - ' + category);

    // Canonical Tag
    let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    document.head.appendChild(link);
  }

}



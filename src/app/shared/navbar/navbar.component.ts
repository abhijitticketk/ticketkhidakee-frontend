import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CommonFunctionService } from 'src/app/Services/CommonFunctionService';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Services/api.service';
import { LocationService } from 'src/app/Services/location.service';
import { LoaderService } from 'src/app/Services/loader.service';
import { ImageService } from 'src/app/Services/image.service';
import { CategoryService } from 'src/app/Services/category.service';
declare const bootstrap: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})

export class NavbarComponent {
  isSearchActive: boolean = false;
  searchQuery: any;
  filteredItems: any = [];
  // categories1: any[] = ['Movies', 'Stream', 'Events', 'Plays', 'Sports', 'Activities', 'Concerts', 'Exhibitions', 'Workshops', 'Comedy', 'Kids', 'Music', 'Theatre', 'Dance']; // More categories for demonstration of scrolling
  categories1: any[] = [];
  selectedDate: string = '';
  showDateDropdown: boolean = false;

  cities1 = ['New York', 'San Francisco', 'Chicago', 'Los Angeles', 'Houston'];
  dateOptions = ['Today', 'This Weekend', 'Next 7 Days', 'This Month'];
  isMobile: boolean = false;
  showCityDropdown = false;

  toggleCityDropdown() {
    this.showCityDropdown = !this.showCityDropdown;
    this.showDateDropdown = false;
    this.getAllCities();
  }

  toggleDateDropdown() {
    this.showDateDropdown = !this.showDateDropdown;
    this.showCityDropdown = false;
  }

  // selectCity(city: string) {
  //   // Your logic here
  //
  //   this.showCityDropdown = false;
  // }

  selectDate(date: string) {
    this.showDateDropdown = false;
  }

  toggleSearch() {
    this.isSearchActive = !this.isSearchActive;

    if (this.isSearchActive) {
      setTimeout(() => {
        const inputEl = document.querySelector(
          '.search-focus'
        ) as HTMLInputElement;
        inputEl?.focus();
      });
    } else {
      this.searchQuery = '';
      this.filteredItems = [];
    }
  }

  selectedCategory1: string = '';
  // selectCategory1(category: any): void {
  //   // this.isSearchVisible = false;

  //   if ('' === category.TYPE) {
  //     // Unselect if already selected
  //     this.selectedCategory1 = '';
  //     this.filteredItems = [];
  //   } else {
  //     // Select new category
  //     this.selectedCategory1 = category.TYPE;
  //     //

  //     if (this.searchQuery?.length >= 3) {
  //       this.getGlobalSearchResults(this.searchQuery, '');
  //     } else {
  //       this.filteredItems = [];
  //     }
  //   }
  // }

  //   selectCategory1(category: any): void {
  //   if ('' === category.TYPE) {
  //     // Unselect if already selected
  //     this.selectedCategory1 = '';
  //     this.filteredItems = [];
  //     localStorage.removeItem('selectedCategory'); // remove selection
  //   } else {
  //     // Select new category
  //     this.selectedCategory1 = category.TYPE;
  //     localStorage.setItem('selectedCategory', this.selectedCategory1); // save selection

  //     if (this.searchQuery?.length >= 3) {
  //       this.getGlobalSearchResults(this.searchQuery, '');
  //     } else {
  //       this.filteredItems = [];
  //     }
  //   }
  // }

  scrollChips(el: HTMLElement, amount: number): void {
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }

  selectCategory1(category: any): void {
    if ('' === category.TYPE) {
      // Unselect if already selected
      this.selectedCategory1 = '';
      this.filteredItems = [];
      localStorage.removeItem('selectedCategory');
    } else {
      // Special handling for blog/membership
      if (category.TYPE === 'blog' || category.TYPE === 'member') {
        this.selectedCategory1 = category.TYPE;
      } else {
        this.selectedCategory1 = category.TYPE;
      }

      // Save selection
      localStorage.setItem('selectedCategory', this.selectedCategory1);

      // Call search if query exists
      if (this.searchQuery?.length >= 3) {
        this.getGlobalSearchResults(this.searchQuery, '');
      } else {
        this.filteredItems = [];
      }
    }
  }


  onSearchChange(query: string) {
    this.searchQuery = query;
    if (query.length >= 3) {
      this.getGlobalSearchResults(query, '');
    } else {
      this.filteredItems = [];
    }
  }
  onSearchChange1(event: any) {
    if (this.searchQuery.length >= 3 && event.key === 'Enter') {
      this.getGlobalSearchResults(this.searchQuery, '');
    }
    else if (this.searchQuery.length === 0 && event.key === 'Backspace') {
      this.getGlobalSearchResults(this.searchQuery, '');
    }
  }
  globalResults: any = [];
  getGlobalSearchResults(search: string = '', cityID: any) {
    const hasSearch = search && search.length >= 3;
    const hasCity = !!cityID;

    // If neither search nor cityID is present, exit early
    if (!hasSearch && !hasCity) {
      this.filteredItems = [];
      return;
    }

    // Build dynamic filter
    let filter = '';

    // if (hasSearch) {
    //   filter += ` AND (GLOBAL_SEARCH LIKE '%${search}%') `;
    // }

    // Add global type filter
    if (this.selectedCategory1) {
      filter += ` AND (GLOBAL_TYPE = '${this.selectedCategory1}') `;
    }
    this.filteredItems = [];
    this.globalResults = [];
    this.apiservice.getAllGlobalData(0, 0, 'ID', 'desc', filter,search).subscribe(
      (data: any) => {
        if (data?.code === 200 && data?.data?.length > 0) {
          this.globalResults = data.data;
          this.filteredItems = this.globalResults.map((item: any) => {
            const parsed = JSON.parse(item.GLOBAL_SEARCH || '{}');
            return {
              ...item,
              parsed: parsed,
              // PLAY_IMAGES: playImages, // safely parsed array or empty
              GLOBAL_ID: item.GLOBAL_ID,
              GLOBAL_TYPE: item.GLOBAL_TYPE,
              IS_SUB_EVENT: parsed.IS_SUB_EVENT
            };
          });


        } else {
          this.filteredItems = [];
        }


      },
      (error: any) => {
        // console.error('Error fetching global search results:', error);
        this.filteredItems = [];
      }
    );
  }

  onBlurSearchBox() {
    setTimeout(() => {
      this.isSearchActive = false;
    }, 200); // delay to allow click events on dropdown to register
  }

  // onSelectResult(item: any) {
  //   //

  //   this.isSearchActive = false;
  //   this.searchQuery = '';
  //   this.filteredItems = [];

  //   if (item.GLOBAL_TYPE === 'PLAY') {
  //     this.router.navigate([`/menu/plays/${item.GLOBAL_ID}/upcoming`]);
  //   } else if (item.GLOBAL_TYPE === 'CAST') {
  //     this.router.navigate([`/cast/details/${item.GLOBAL_ID}`]); // Redirect to cast details page
  //   } else {
  //     // console.warn('Unhandled type:', item.GLOBAL_TYPE);
  //   }
  // }

  onSelectResult(item: any) {
    this.isSearchActive = false;
    this.searchQuery = '';
    this.filteredItems = [];



    const cityName = this.cookie.get('cityName');
    const type = item.GLOBAL_TYPE?.trim().toLowerCase();
    const globalId = item.GLOBAL_ID;

    let parsedData: any;
    try {
      parsedData = JSON.parse(item.GLOBAL_SEARCH);
    } catch (e) {
      // console.error('Error parsing GLOBAL_SEARCH:', e);
      return;
    }
    if (parsedData.HAS_SUB_EVENTS == true || parsedData.HAS_SUB_EVENTS == 'true') {
      // console.log(parsedData);
      this.router.navigate(['explore/subEvent', globalId]);
    }

    if (
      (type != 'casts' && type != 'cast') && (type != 'venues' && type != 'venue') && (parsedData.HAS_SUB_EVENTS == undefined || parsedData.HAS_SUB_EVENTS == false || parsedData.HAS_SUB_EVENTS == 'false') 
    ) {
      const slug = parsedData?.EVENT_SLUG;
      this.router.navigate([`/explore/${this.cities?.NAME ? this.cities?.NAME : 'all'}/${type}/${slug}/${globalId}`]);
    }

    if (type == 'casts' || type == 'cast') {
      const name = parsedData.NAME;
      const castSlug = name?.toLowerCase().replace(/\s+/g, '-');
      this.router.navigate([`/cast-and-crew/${name}/${globalId}`]);
    }

    // Handle VENUE
    if (type == 'venues' || type == 'venue') {
      const slug = parsedData.VENUE_SLUG;
      this.router.navigate([`explore/venues/${this.cities?.NAME ? this.cities?.NAME : 'all'}/${parsedData.VENUE_SLUG}/${globalId}`]);

    }

    this.isSearchVisible = false;

  }

  isLargeScreen = true;
  showMobileSearch = false;
  toggleMobileSearch() {
    this.showMobileSearch = !this.showMobileSearch;
  }
  isSearchVisible: boolean = false;
  // searchQuery: string = '';

  toggleSearch1() {
    this.showCityDropdown = false;
    // if (this.cities2.length == 0) {
    //   this.getAllCities();
    // }
    this.selectedCategory = '';

    this.isSearchVisible = !this.isSearchVisible;
    setTimeout(() => {
      if (this.isSearchVisible) {
        document.getElementById('search_input')?.focus();
      }
    }, 100);
    if (this.isSearchVisible == false) {
      this.filteredItems = [];
      this.searchQuery = '';
    }
  }

  closeSearch() {
    this.isSearchVisible = false;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    //
  }

  onSearchBlur() {
    // Add debounce or small delay if needed
    setTimeout(() => {
      this.isSearchActive = false;
    }, 200);
  }

  onItemSelected(item: any) {
    //
    // Implement navigation or assignment here
  }

  isLoggedIn: any;
  userName: string = '';
  userEmail: string = '';
  userID: any = this.userService.getUserId();
  userData: any = [];
  IMAGEuRL: any;
  imagePreview: any = null;
  userImage: any = 'assets/images/profile-imgs/usernoimage.jpg';
  userCity: string = '';
  isCityLoading: boolean = false;
  Cities: any[] = [];
  locationPermissionAsked: boolean = false;
  filteredCities: any;
  cities2: any = [];

  popularCities: any = [
    // // { name: 'Mumbai', icon: 'assets/images/mumbai.avif' },
    // // { name: 'Delhi-NCR', icon: 'assets/images/ncr.avif' },
    // // { name: 'Bengaluru', icon: 'assets/images/bang.avif' },
    // { NAME: 'Hyderabad', icon: 'assets/images/hyd.png' },
  ];
  constructor(
    private apiservice: ApiService,
    private userService: CommonFunctionService,
    private cookie: CookieService,
    private toastr: ToastrService,
    private router: Router,
    private locationService: LocationService,
    private loaderService: LoaderService,
    private imageService: ImageService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private categoryService: CategoryService
  ) {
    //
    const cityName = this.cookie.get('cityName');

    if (cityName == null || cityName == undefined || cityName.trim() == '') {
      // Set 'cities' to false at the start if location is invalid
      this.cookie.delete('cities');

      this.cookie.set('cities', 'false', 365, '/', '', false, 'Strict');
      // this.cookie.set('cityName', this.cities.NAME, 365, '/', '', false, 'Strict');
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // You can use this to trigger any necessary updates, if needed
      }
    });
  }

  retriveimgUrl = this.apiservice.retriveimgUrl;

  isLoggingOut: boolean = false;
  memberId: any;
  private initDone = false;
  private cityFetched = false;

  // ngOnInit() {
  //   this.isLoggedIn = this.cookie.get('token');
  //   this.IMAGEuRL = this.apiservice.retriveimgUrl;

  //   if (this.isLoggedIn) {
  //     this.userName = this.userService.getUserName() || 'Guest';
  //     this.userEmail = this.userService.getUserEmail() || 'guest@example.com';
  //   }

  //   if( !this.cookie.get('locationname'))
  //   {

  //   // this.getCities();
  //   if (!this.cookie.check('cities')) {
  //     this.requestUserLocation();
  //   } else {
  //     const cityName = this.cookie.get('cityName');

  //

  //     if (cityName) {
  //       this.getCities(cityName);
  //     } else {
  //       // fallback: in case cityName is missing somehow
  //       this.requestUserLocation();
  //     }
  //   }
  // }else{
  //   this.getCities(this.cookie.get('locationname'));

  // }
  //   // if (!this.cities?.NAME) {
  //   //   this.openLocationModal(); // Automatically open modal if no city is selected
  //   // }
  // }
  versionNumber: any
  taglabel: any;
  hidenav = false;
  ngOnInit() {

    // if (this.cityFetched) return;
    // this.cityFetched = true;


    // if (this.initDone) return;
    // this.initDone = true;
    this.versionNumber = this.apiservice.versionNumber
    this.taglabel = this.apiservice.taglabel.trim();
    this.isMobile = this.apiservice.isMobileDevice();
    this.imageService.image$.subscribe((newImageBase64) => {
      if (newImageBase64) {
        this.imagePreview = newImageBase64;

        this.cdr.detectChanges(); // 👈 Force Angular to update the view
      }
    });
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        this.loaderService.show(); // Loader immediately on navigation start
      }
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;
        // console.log(currentUrl);
        const dynamicPattern = 'buy-tickets';
        // const exactHiddenRoutes1 = 'book-common-page';
        // console.log(exactHiddenRoutes1.includes(currentUrl))
        // console.log(dynamicPattern.includes(currentUrl))
        this.hidenav = (
          currentUrl.includes(dynamicPattern)
        );
      }
    });
    this.isLoggedIn = this.cookie.get('token');
    this.IMAGEuRL = this.apiservice.retriveimgUrl;
    // const locationName = this.cookie.get('locationname');
    const cityName = this.cookie.get('cityName');
    const cities = this.cookie.check('cities');
    const EMAIL_ID = localStorage.getItem('EMAIL-ID')
    const NAME = localStorage.getItem('EMAIL-ID')

    if (this.isLoggedIn) {
      this.userName = EMAIL_ID || 'Guest';
      this.userEmail = NAME || 'guest@example.com';
    }



    if (cities && cityName) {
      this.getCities(cityName);
    } else {

      this.cookie.set('cityName', 'all', 365, '/', '', false, 'Strict');
    }



    // const isLocationNameValid =
    //   locationName && locationName !== 'null' && locationName.trim() !== '';
    // const isCityNameValid =
    //   cityName && cityName !== 'null' && cityName.trim() !== '';

    // if (!isLocationNameValid) {
    //   if (!cities) {

    //     this.getCities('Pune');
    //   } else if (isCityNameValid) {

    //     this.getCities(cityName);
    //   } else {

    //     this.getCities('Pune');
    //   }
    // } else {

    //   this.getCities(locationName);
    // }


    const userID = this.userService.getUserId();

    if (userID) {
      this.getUserList();
    }

    this.getCategories();

    const cachedCategory = localStorage.getItem('selectedCategory');
    if (cachedCategory) {
      // this.selectedCategory = cachedCategory;
      if (cachedCategory?.toString().trim() !== '' && !isNaN(Number(cachedCategory))) {
        this.selectedCategory = Number(cachedCategory);
      } else {
        this.selectedCategory = cachedCategory;
      }


    }

  }
  @ViewChild('accountClick', { static: false }) accountClick!: ElementRef;

  ngAfterViewInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeDropdown();
      }
    });
  }
  selectedCategory: any = '';

  // selectCategory(type: any) {
  //   this.isSearchVisible = false;
  //   this.selectedCategory = type.ID;
  //   localStorage.setItem('selectedCategory', type.ID);
  //   this.categoryService.setSelectedCategory(type.ID);
  //   if (type.ID != 'Member' && type.ID != 'blog' && type.ID != '') {
  //     localStorage.setItem('selectedCategory11', type.ID);
  //   }
  // }

  selectCategory(type: any) {
    this.isSearchVisible = false;
    this.selectedCategory = type.ID || type; // for blog/membership, type can be 'blog'/'membership'
    localStorage.setItem('selectedCategory', this.selectedCategory);
    this.categoryService.setSelectedCategory(this.selectedCategory);

    if (type.ID && type.ID !== 'Member' && type.ID !== 'blog') {
      localStorage.setItem('selectedCategory11', type.ID);
    }

    if (this.isMobile) {
      setTimeout(() => {
        const el = document.querySelector<HTMLElement>(
          `a.nav-icon-text[data-id="${this.selectedCategory}"]`
        );
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        }
      }, 100); // <-- small delay for DOM render
    }

  }


  formatCategory(type: string): string {
    return type.toLowerCase().replace(/\s+/g, '-'); // e.g., "Live Show" => "live-show"
  }

  categories: any = [];
  isCategoriesLoading: boolean = false;


  // Detect mobile on load
  isMobile2: boolean = window.innerWidth <= 768; // adjust breakpoint as needed

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {

    // console.log(event,localStorage.getItem('selectedCategory11'),localStorage.getItem('selectedCategory'));

    const width = event.target.innerWidth;
    const isNowMobile = width < 768;

    if (isNowMobile && !this.isMobile) {
      setTimeout(() => this.scrollSelectedCategory(), 0);
    }

    this.isMobile = isNowMobile;
  }

  getCategories() {
    this.isCategoriesLoading = true;
    this.apiservice
      .getAllCategories(0, 0, 'id', 'asc', ' AND STATUS = 1')
      .subscribe(
        (data: any) => {
          if (data?.code === 200 && data?.data?.length > 0) {
            this.categories = data.data;
            this.categories1 = data.data;
            var catName = window.location.href.split('/')[5];

            if (catName != undefined && catName != null)
              var catId = this.categories.filter((data: any) => data.TYPE == decodeURIComponent(catName || ''));


            if (localStorage.getItem('selectedCategory') == undefined || localStorage.getItem('selectedCategory') == null || localStorage.getItem('selectedCategory') == '') {
              if (catId != undefined && catId != null && catId.length > 0) {
                localStorage.setItem('selectedCategory', catId[0]['ID']);
                localStorage.setItem('selectedCategory11', catId[0]['ID']);

              }
            }
            else if (catId != undefined && catId != null && catId.length > 0 && localStorage.getItem('selectedCategory') != catId[0]['ID']) {
              localStorage.setItem('selectedCategory', catId[0]['ID']);
              localStorage.setItem('selectedCategory11', catId[0]['ID']);

            }
          }

          if (this.isMobile) {
            setTimeout(() => this.scrollSelectedCategory(), 0);
          }

          this.isCategoriesLoading = false;
        },
        (error: any) => {
          this.isCategoriesLoading = false;
        }
      );
  }

  selectSpecialCategory(type: string) {
    this.selectedCategory = type;
    localStorage.setItem('selectedCategory', type);
    localStorage.setItem('selectedCategory11', type);

    setTimeout(() => this.scrollSelectedCategory(), 0);
  }

  scrollSelectedCategory() {
    const selectedCategoryId =
      localStorage.getItem('selectedCategory') ||
      localStorage.getItem('selectedCategory11');

    if (selectedCategoryId) {
      let el = document.querySelector<HTMLElement>(
        `a.nav-icon-text[data-id="${selectedCategoryId}"]`
      );

      if (!el) {
        el = document.querySelector<HTMLElement>(
          `a.nav-icon-text[data-type="${selectedCategoryId}"]`
        );
      }

      if (el) {
        el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      }
    }
  }



  requestUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          //
          //
          this.getCityFromCoordinates(lat, lon);
        },
        (error) => {
          // console.error('Error getting location:', error);
        }
      );
    } else {
      // console.error('Geolocation is not supported by this browser.');
    }
  }

  getCityFromCoordinates(lat: number, lon: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        //
        const address = data.address;
        const city = address.city || address.town || address.village || '';
        const state = address.state || '';
        const country = address.country || '';

        //
        //
        // if (city) {
        //   this.getCities(city);
        // }else
        // {
        //   this.getCities('pune');

        // }
        if (city && city.trim() !== '') {
          this.getCities(city);
        } else {
          // console.warn('City not found, falling back to Pune.');
          // this.cookie.set('cityName', 'Pune');
          // this.cookie.set('locationname', 'Pune');
          this.getCities('Pune');
        }
      })
      .catch((error) => {
        // console.error('Error fetching city data:', error);
      });
  }

  private minDisplayTime = 300; // in ms
  private timeoutId: any;
  allcities: any;

  getCities(search: string = '') {
    // this.loadData()

    // this.loaderService.show();

    const filter = search ? `AND NAME LIKE '%${search}%'` : '';
    this.apiservice
      .getAllCities(0, 0, 'id', 'desc', filter + 'AND STATUS = 1')
      .subscribe(
        (data: any) => {
          if (data?.code == 200 && data?.data?.length > 0) {
            this.allcities = data.data;
            this.cities = data.data[0];
            // this.cookie.delete('citieslist')
            // this.cookie.set('citieslist', JSON.stringify(this.cities), 365, '/', '', false, 'Strict');
            // const locationName = this.cookie.get('locationname');

            // const isLocationNameValid =
            //   locationName &&
            //   locationName !== 'null' &&
            //   locationName.trim() !== '';

            const userID = this.userService.getUserId();


            // if (userID) {

            //   this.getUserList();

            // }

            this.selectCity(this.cities);

            this.isLocationModalOpen = false;

            // Clear previous city-related cookies
            this.cookie.delete('cities');
            this.cookie.delete('cityName');
            this.cookie.delete('cityId');

            // Set new city-related cookies
            const now = new Date();
            var expiryDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(), // move to next day
              23, 59, 59          // set to 00:00:00
            );


            // Set cookies with 24-hour expiry
            this.cookie.set('cityId', this.cities.ID, expiryDate, '/');
            this.cookie.set('cities', 'true', expiryDate, '/');
            this.cookie.set('cityName', this.cities.NAME, expiryDate, '/');






            // this.stopLoader()
          } else {

          }
          // this.loaderService.hide();
        },
        (error: any) => {
          // console.error('Error fetching cities:', error);
          // this.stopLoader()
        }
      );
  }

  getUserList() {
    this.apiservice
      .getUserData(0, 0, '', '', ' AND ID =' + this.userID)
      .subscribe({
        next: (data: any) => {
          if (data?.code == 200 && data?.data?.length > 0) {
            this.userData = data.data;
            this.imagePreview = this.userData[0]?.['PROFILE_IMAGE']
              ? `${this.IMAGEuRL}profilePic/${this.userData[0]['PROFILE_IMAGE']}`
              : this.userImage;

            localStorage.setItem('EMAIL_ID', this.userData[0]?.['EMAIL_ID']);
            localStorage.setItem('NAME', this.userData[0]?.['NAME']);
            localStorage.setItem('MOBILE_NO', this.userData[0]?.['MOBILE_NO']);
            this.userEmail =
              this.userData[0]?.['EMAIL_ID'] ||
              this.userService.getUserEmail() ||
              'guest@example.com';

            this.userName =
              this.userData[0]?.['NAME'] ||
              this.userService.getUserName() ||
              'Hi Guest';
            // this.updateCities(this.cities);
          } else {
            this.userData = [];

            this.userName = this.userService.getUserName() || 'Hi Guest';
            this.userEmail =
              this.userService.getUserEmail() || 'guest@example.com';
          }
        },
        error: (err) => {
          if (err.error?.code == '300') {
            this.signOut();
          } else {
            // console.error('Error fetching user data', err);
            // Fallback in case of error
            this.userName = this.userService.getUserName() || 'Hi Guest';
            this.userEmail =
              this.userService.getUserEmail() || 'guest@example.com';
          }
        },
      });
  }

  selectCity(city: any) {
    this.searchText = city.NAME;
    this.filteredCities = [];
    this.cities = city;

    // this.loaderService.show()

    // const locationName = this.cookie.get('locationname');

    // if (!locationName) {
    //   this.updateCities(this.cities);
    // }

    // const locationName = this.cookie.get('locationname');updateCities
    // const isLocationNameValid =
    //   locationName && locationName !== 'null' && locationName.trim() !== '';

    const userID = this.userService.getUserId();

    //

    // if (userID && this.userData && this.userData.length > 0) {
    //   // if (isLocationNameValid) {
    //   this.(this.cities);
    //   // } else {

    //   // }
    // }

    this.cookie.delete('cities');
    this.cookie.delete('cityName');

    // this.cookie.set('cities', 'true');
    // this.cookie.set('cityName', this.cities.NAME);
    const now = new Date();
    var expiryDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(), // move to next day
      23, 59, 59        // set to 00:00:00
    );

    this.cookie.set('cities', 'true', expiryDate, '/', '', false, 'Strict');
    this.cookie.set('cityName', this.cities.NAME, expiryDate, '/', '', false, 'Strict');


    this.locationService.setSelectedCity(city);

    // this.loaderService.hide()
  }

  updateCities(data: any) {


    this.userData[0]['LAST_LOCATION'] = data.ID;
    // this.cookie.set('locationname', data.NAME);

    this.apiservice.UpdateUser(this.userData[0]).subscribe(
      (successCode) => {
        if (successCode.code == '200') {
        } else {
        }
      },
      (err) => { }
    );
  }

  cities: any = [];
  searchText: string = '';
  isLocationModalOpen: boolean = false;
  selectedCity = this.cookie.get('cityName'); // Open Modal

  citiesDropdownOpen = false;
  showOtherCities = false;
  otherCities: any[] = [];

  openLocationModal(event: MouseEvent) {
    this.showOtherCities = false;
    this.searchText = '';
    this.isSearchVisible = false;

    const dropdown = document.querySelector('.custom-dropdown') as HTMLElement;
    if (dropdown) {
      dropdown.style.display = 'block';
    }
    const backdrop = document.querySelector('.custom-backdrop');
    if (backdrop instanceof HTMLElement) {
      backdrop.style.display = 'block';
    }

    event.stopPropagation(); // Prevents document click from closing it immediately
    // this.citiesDropdownOpen = !this.citiesDropdownOpen;
    // this.getAllCities(); // Only if you want to reload city data every time
    if (this.cities2.length == 0) {
      this.getAllCities();
    }
  }

  selectedcity: any;
  getAllCities() {
    this.isCityLoading = true;
    this.apiservice
      .getAllCities(0, 0, 'id', 'desc', 'AND STATUS = 1 AND NAME not in ("Multiple Cities","To Be Decided")')
      .subscribe(
        (data: any) => {
          if (data?.code === 200 && data?.data?.length > 0) {
            this.cities2 = data.data;

            this.filteredCities1 = [...this.cities2]; // start with full list
            if (this.cities?.NAME) {
              const matchedCity = this.filteredCities1.find(
                (data) => data.NAME === this.cities.NAME
              );
              this.selectedcity = matchedCity ? matchedCity.NAME : null;
              this.citySearchText = matchedCity.NAME;
            }

            this.filteredCities = [...this.cities2];

            // this.filteredCities = [...this.cities2];
            this.popularCities = this.cities2.filter(
              (c: any) => c.IS_POPULAR == 1
            );
            this.otherCities = this.cities2.filter(
              (c: any) => c.IS_POPULAR == 0
            );

            //

            this.filteredCities = [...this.cities2];
          }
          this.isCityLoading = false;
        },
        (error: any) => {
          // console.error('Error fetching cities:', error);
          this.isCityLoading = false;
        }
      );
  }

  selectfilterCity(city: any) {
    // Your logic here

    this.selectCity = city.NAME;
    // this.showCityDropdown = false;
    this.getGlobalSearchResults('', city.ID);
    this.showCityDropdown = !this.showCityDropdown;
  }

  citySearchText: string = '';
  filteredCities1: any[] = [];
  // Filter function
  filterCities(searchValue: string) {
    if (!Array.isArray(this.cities2)) {
      this.filteredCities1 = [];
      return;
    }

    if (searchValue && searchValue.trim() !== '') {
      const lowerVal = searchValue.toLowerCase();
      this.filteredCities1 = this.cities2.filter((city) =>
        city.NAME?.toLowerCase().includes(lowerVal)
      );
    } else {
      this.filteredCities1 = [...this.cities2];
    }
  }

  // selectModalCity(city: any) {
  //   this.cities = city;
  //   this.citiesDropdownOpen = false;
  //   this.showOtherCities = false;
  // }

  toggleOtherCities(event: MouseEvent) {
    event.stopPropagation(); // prevent dropdown close
    this.showOtherCities = !this.showOtherCities;
  }

  getCities2(searchValue: any) {

    if (!Array.isArray(this.cities2)) {
      // console.error('cities2 is not an array:', this.cities2);
      this.filteredCities = [];
      return;
    }

    if (searchValue) {
      this.popularCities = this.cities2.filter(
        (c: any) =>
          c.IS_POPULAR == 1 &&
          c.NAME?.toLowerCase().includes(searchValue.toLowerCase())
      );
      this.otherCities = this.cities2.filter(
        (c: any) =>
          c.IS_POPULAR == 0 &&
          c.NAME?.toLowerCase().includes(searchValue.toLowerCase())
      );
    } else {
      this.popularCities = this.cities2.filter((c: any) => c.IS_POPULAR == 1);
      this.otherCities = this.cities2.filter((c: any) => c.IS_POPULAR == 0);
    }
  }

  selectModalCity(city: any) {
    // this.cookie.delete('changedfrommainroute')
    // this.cookie.set('changedfrommainroute', 'true', 365, '/', '')
    this.searchText = city.NAME;
    this.isSearchVisible = false;
    this.filteredCities = [];
    this.cities = city;
    // const locationName = this.cookie.get('locationname');
    // const isLocationNameValid =
    //   locationName && locationName !== 'null' && locationName.trim() !== '';
    const userID = this.userService.getUserId();

    // Delete old cookies
    this.cookie.delete('cities');
    this.cookie.delete('cityName');

    // Set cookies for 1 day (24 hours)

    const now = new Date();
    var expiryDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(), // move to next day
      23, 59, 59           // set to 00:00:00
    );

    this.cookie.set('cities', 'true', expiryDate, '/');
    this.cookie.set('cityName', this.cities.NAME, expiryDate, '/');
    this.cookie.set('locationname', this.cities.NAME);
    this.locationService.setSelectedCity(city);
    this.searchText = '';
    // alert(userID);
    // if (userID) {
    //   this.updateCitieseeeeeee(this.cities);

    // } else {

    // this.closeDropdown2()
    this.router.navigate(['/home']).then(() => {
      window.location.reload();
    });
    // }
  }



  closeLocationModal() {
    this.isLocationModalOpen = false;
  }

  // selectCity(city: any) {
  //   this.cities = { NAME: city.name };
  //   this.closeLocationModal();
  // }

  detectLocation() {
    // You can use geolocation API here
    alert('Detecting your location...');
  }

  viewAllCities() {
    alert('Redirect to view all cities');
  }

  // Example method to extract city name from API response
  extractCityFromResponse(results: any[]): string {
    for (let result of results) {
      for (let component of result.address_components) {
        if (component.types.includes('locality')) {
          return component.long_name;
        }
      }
    }
    return 'Unknown City';
  }

  signOut() {
    const userId =
      this.userService.getUserEmail() || this.userService.getUserMobileNumber();

    //

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
      // window.location.reload();
    };

    if (userId != null && userId != undefined) {
      this.isLoggingOut = true;

      this.apiservice.userLogout(userId).subscribe({
        next: (successCode: any) => {
          clearAllData();

          this.toastr.success('You have successfully logged out!', 'Success');

          this.router.navigate(['/home']).then(() => {
            window.location.reload();
          });

          this.isLoggingOut = false;
        },
        error: (errorResponse) => {
          clearAllData();

          this.toastr.success('You have successfully logged out!', 'Success');

          this.router.navigate(['/home']).then(() => {
            window.location.reload();
          });

          this.isLoggingOut = false;
        },
      });
    } else {
      clearAllData();

      this.router.navigate(['/home']).then(() => {
        window.location.reload();
      });
    }
  }

  navigateToMovies() {
    const citySlug = this.selectedCity.toLowerCase().replace(/\s+/g, '-');
    this.router.navigate([`/movies/${citySlug}`]);
  }
  navigateToPlays() {
    const citySlug = this.selectedCity.toLowerCase().replace(/\s+/g, '-');
    this.router.navigate([`menu/plays/${citySlug}`]);
  }

  closeDropdown() {

    if (this.accountClick?.nativeElement) {
      const dropdown = bootstrap.Dropdown.getInstance(
        this.accountClick.nativeElement
      );
      dropdown?.hide();
    }
    this.isAccountDropdownOpen = false;


    this.isSearchVisible = false;
    this.isSearchActive = false;
    this.searchQuery = '';
    this.filteredItems = [];
  }

  ngOnDestroy() {
    //
  }

  closeDropdown2() {
    this.showOtherCities = false;
    this.searchText = '';
    this.isSearchVisible = false;

    const dropdown = document.querySelector('.custom-dropdown') as HTMLElement;
    if (dropdown) {
      dropdown.style.display = 'none';
    }
    const backdrop = document.querySelector('.custom-backdrop');
    if (backdrop instanceof HTMLElement) {
      backdrop.style.display = 'none';
    }
  }

  getFirstGenre(genreString: string): string {
    if (genreString != undefined && genreString != null && genreString == '') return ''; // handles null, undefined, or empty string
    let genres: any = []
    if (Array.isArray(genreString)) {
      genres = genreString.toString().split(',').map((g) => g.trim());
    } else if (typeof genreString === "string")
      genres = genreString.split(',').map((g) => g.trim());

    return genres.length > 1 ? `${genres[0]}` : genres[0];
  }

  hasMoreGenres(genreString: string): boolean {
    if (genreString != undefined && genreString != null && genreString == '') return false;
    let genres: any = []
    if (Array.isArray(genreString)) {
      genres = genreString.toString().split(',').map((g) => g.trim());
    } else if (typeof genreString === "string")
      genres = genreString.split(',').map((g) => g.trim());

    return genres.length > 1;
  }

  updateCitieseeeeeee(data: any) {
    //

    this.userData[0]['LAST_LOCATION'] = data.ID;
    this.cookie.set('locationname', data.NAME);

    this.apiservice.UpdateUser(this.userData[0]).subscribe(
      (successCode) => {
        if (successCode.code == '200') {
          this.router.navigate(['/home']).then(() => {
            window.location.reload();
          });

          // this.closeDropdown2()
        } else {
        }
      },
      (err) => { }
    );
  }


  // getcityyyy() {
  //   this.cities = this.cookie.get('citieslist') ? JSON.parse(this.cookie.get('citieslist')) : this.cities
  // }
  getSelectedCategory() {
    return localStorage.getItem('selectedCategory');
  }


  clearCity() {
    this.cookie.delete('cityName', '/');
    this.cookie.delete('cityId', '/');
    this.cookie.delete('cities', '/');
    this.cookie.delete('locationname', '/');
    this.router.navigate(['/home']).then(() => {
      window.location.reload();
    });

  }


  // Add this property to your component class
  public isAccountDropdownOpen: boolean = false;

  // Add this function to your component methods
  openAccountDropdown(): void {
    this.isAccountDropdownOpen = !this.isAccountDropdownOpen;
  }

  // // Update your existing closeDropdown() method to close the new dropdown
  // closeDropdown(): void {
  //   this.isAccountDropdownOpen = false;
  //   // You might need to add logic here to close the Bootstrap dropdown as well if it's still being used
  // }
  onAccountClick() {
    this.isAccountDropdownOpen = !this.isAccountDropdownOpen;

    const name = localStorage.getItem('NAME');
    const email = localStorage.getItem('EMAIL_ID');

    this.userName = (name && name !== 'null') ? name : (this.userData[0]?.["NAME"] || "Guest");
    this.userEmail = (email && email !== 'null') ? email : (this.userData[0]?.["EMAIL_ID"] || "guest@example.com");
  }


  showMoreDropdown = false;

  @ViewChild('moreDropdown', { static: false }) moreDropdownRef!: ElementRef;

  toggleMoreDropdown() {
    this.showMoreDropdown = !this.showMoreDropdown;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInside = this.moreDropdownRef?.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showMoreDropdown = false;
    }
  }

}

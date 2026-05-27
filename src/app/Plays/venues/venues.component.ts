import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
  HostListener,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Services/api.service';
import { CommonFunctionService } from 'src/app/Services/CommonFunctionService';
import { LocationService } from 'src/app/Services/location.service';

@Component({
  selector: 'app-venues',
  templateUrl: './venues.component.html',
  styleUrls: ['./venues.component.scss'],
})
export class VenuesComponent {
  memberId: any;
  @ViewChild('closelogin') closelogin!: ElementRef;

  constructor(
    private apiservice: ApiService,
    private cookie: CookieService,
    private toastr: ToastrService, public userService: CommonFunctionService,
    private router: Router,
    private locationService: LocationService,
    private meta: Meta, private title: Title

  ) { }

  selectedCityID = Number(this.cookie.get('cityId'))
  addbookmarkspin: boolean = false;
  theaters: any[] = [];
  retriveimgUrl = this.apiservice.retriveimgUrl;
  page = 1;
  pageSize = 8;
  hasMoreData = true;
  likeItems: any[] = [];
  filteredLikeItems: any[] = [];
  isWishlistLoading: boolean = false;
  isMobile: Boolean = false;
  cityname: any
  ngOnInit(): void {
    this.isMobile = this.apiservice.isMobileDevice();
    this.memberId = localStorage.getItem('memberId');

    this.getAllTheaters();
    this.getAmenities();

    // this.locationService.selectedCity$.subscribe((cityName: any) => {
    //   if (cityName) {

    this.cityname = this.cookie.get('cityName');



    // }
    // this.getCategories();
    // });
  }

  filteredAmenities: any;
  amenities: any;
  isAmenitiesLoading: boolean = false;

  getAmenities() {
    this.isAmenitiesLoading = true;
    this.apiservice.getAllAmenities(0, 0, 'id', 'desc', '').subscribe(
      (data: any) => {
        if (data?.code === 200 && data?.data?.length > 0) {
          this.amenities = data.data;
          this.filteredAmenities = [...this.amenities];
        }
        this.isAmenitiesLoading = false;
      },
      (error: any) => {
        this.isAmenitiesLoading = false;
      }
    );
  }

  // un used scroll code for future

  @ViewChildren('featuredScrollContainer') scrollContainers!: QueryList<
    ElementRef<HTMLDivElement>
  >;

  canScrollLeft: boolean[] = [];
  canScrollRight: boolean[] = [];

  ngAfterViewInit() {
    this.updateAllArrows();
  }

  scrollLeft(index: number) {
    const container = this.scrollContainers.toArray()[index].nativeElement;
    container.scrollBy({ left: -this.getScrollAmount(), behavior: 'smooth' });
    setTimeout(() => this.updateArrows(index), 400);
  }

  scrollRight(index: number) {
    const container = this.scrollContainers.toArray()[index].nativeElement;
    container.scrollBy({ left: this.getScrollAmount(), behavior: 'smooth' });
    setTimeout(() => this.updateArrows(index), 400);
  }

  getScrollAmount(): number {
    return 250 * 5; // Adjust as needed
  }

  updateAllArrows() {
    this.scrollContainers.forEach((_, index) => this.updateArrows(index));
  }

  updateArrows(index: number) {
    const el = this.scrollContainers.toArray()[index].nativeElement;
    this.canScrollLeft[index] = el.scrollLeft > 0;
    this.canScrollRight[index] =
      el.scrollLeft + el.clientWidth < el.scrollWidth - 10;
  }

  // ------------------------------------------ get Venues ------------------------------------------

  searchTerm: string = '';
  selectedFacilities: string[] = [];
  searchLoading: boolean = false;
  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.searchLoading || !this.hasMoreData) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.body.offsetHeight;

    // Adjust threshold for mobile/desktop
    const isMobile = window.innerWidth <= 768;
    const threshold = pageHeight - (isMobile ? 500 : 300);

    if (scrollPosition >= threshold) {
      this.page++;
      this.getAllTheaters(true); // loadMore = true
    }
  }

  //  onScroll(): void {
  //   if (this.searchLoading) return;

  //   if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
  //     this.page++;
  //     this.getAllTheaters(true);
  //   }
  // }


  getFullStars(rating: number): number[] {
    const fullStars = Math.floor(rating);
    return Array(fullStars);
  }

  hasHalfStar(rating: number): boolean {
    return rating % 1 >= 0.5;
  }

  getEmptyStars(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const halfStar = this.hasHalfStar(rating) ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return Array(emptyStars);
  }

  onSearchChange() {
    if (this.searchTerm && this.searchTerm.trim().length >= 3) {
      this.page = 1;
      this.getAllTheaters(false);
    } else if (!this.searchTerm || this.searchTerm.trim().length === 0) {
      this.page = 1;
      this.getAllTheaters(false);
    }
  }

  toggleFacility(facility: string) {
    const index = this.selectedFacilities.indexOf(facility);
    if (index > -1) {
      this.selectedFacilities.splice(index, 1); // remove if already selected
    } else {
      this.selectedFacilities.push(facility);
    }

    // Trigger search with updated filters
    this.page = 1;
    this.getAllTheaters(false);
  }

  isFacilitySelected(facility: string): boolean {
    return this.selectedFacilities.includes(facility);
  }

  trackByTheater(index: number, theater: any) {
  return theater.ID || index; // unique identifier
}

  noData:boolean = false;
 getAllTheaters(loadMore = false) {
  let searchCondition: any = {
    CITY_ID: this.selectedCityID,
    DISPLAY_NAME: { $nin: ["To Be Decided", "Multiple Venues"] }
  };
  const andConditions: any[] = [];

  // Name search
  if (this.searchTerm?.trim().length >= 3) {
    andConditions.push({
      DISPLAY_NAME: { $regex: this.searchTerm.trim(), $options: 'i' },
    });
  }

  // Facilities filter
  if (this.selectedFacilities.length > 0) {
    for (let facility of this.selectedFacilities) {
      andConditions.push({
        AMENITY_NAMES: { $regex: facility, $options: 'i' },
      });
    }
  }

  // Final search condition
  if (andConditions.length > 0) {
    searchCondition = {
      $and: [{ CITY_ID: this.selectedCityID }, ...andConditions],
    };
  }

  this.searchLoading = true;

  this.apiservice
    .getAllVenueByCity(
      this.page,
      this.pageSize,
      'ID',
      'desc',
      searchCondition
    )
    .subscribe(
      (data: any) => {
        if (data?.code === 200 && data?.data?.length > 0) {
          const formattedTheaters = data.data.map((theater: any) => ({
            ...theater,
            liked: false,
            NAME: theater.DISPLAY_NAME,
            ADDRESS: theater.ADDRESS_DETAILS,
            THEATER_IMAGE: theater.BANNER_IMAGE
              ? this.retriveimgUrl + 'venueImages/' + theater.BANNER_IMAGE
              : 'assets/movie_skel.jpg',
            amenities:
              theater.AMENITY_NAMES?.[0]
                ?.split(',')
                .map((a: string) => a.trim())
                .sort((a: string, b: string) => a.length - b.length) || [],
            latitude: theater.LATITUDE,
            longitude: theater.LONGITUDE,
            RATING: parseFloat(theater.RATING || '0'),
          }));

          // if (loadMore) {
          //   this.theaters.push(...formattedTheaters);
          // } else {
          //   this.theaters = formattedTheaters;
          // }

          if (loadMore) {
  const existingIds:any = new Set(this.theaters.map(t => t._id));
  const newItems:any = formattedTheaters.filter((t:any) => !existingIds.has(t._id));
  this.theaters.push(...newItems);
} else {
  this.theaters = formattedTheaters;
}


          this.hasMoreData = data.data.length === this.pageSize;
          this.noData = this.theaters.length === 0;
  
        } else {
          if (!loadMore) {
            this.theaters = [];
          }
          this.hasMoreData = false;
        }

        this.fetchAllWishlistData();
        this.searchLoading = false;
      },
      (error: any) => {
        this.hasMoreData = false;
        this.noData = this.theaters.length === 0;
        this.searchLoading = false;
      }
    );
}

  clearAllFilters() {
    this.selectedFacilities = [];
    this.searchTerm = ''; // optionally clear search text too
    this.page = 1;
    this.getAllTheaters(false);
  }

  openGoogleMap(lat: number, lng: number) {
    if (lat && lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      alert('Location coordinates not available.');
    }
  }

  loadMore() {
    this.page++;
    this.getAllTheaters(true);
  }

  filteredWishlistItems: any[] = [];
  loadingLikeId: string | null = null;

  // Fetch liked theaters (wishlist)
  fetchAllWishlistData() {
    if (this.memberId != undefined && this.memberId != null && this.memberId != 0) {
      this.isWishlistLoading = true;

      this.apiservice
        .gettheaterAllLikes(
          0,
          0,
          'id',
          'desc',
          'AND MEMBER_ID = ' + this.memberId
        )
        .subscribe({
          next: (response: any) => {
            if (response.code == 200) {
              this.filteredWishlistItems = response.data;
            } else {
              this.filteredWishlistItems = [];
            }
            this.isWishlistLoading = false;
          },
          error: (error: any) => {
            this.isWishlistLoading = false;
          },
        });
    }
  }

  // Check if the current theater is liked
  getliked(theater: any): boolean {
    const venueId = theater._id || theater.id;
    const item = this.filteredWishlistItems.find(
      (item: any) => item.VENUE_ID === venueId
    );

    return !!(item && item.STATUS);
  }
  // Toggle like/unlike theater
  toggleLike(theater: any, event: MouseEvent) {
    event.stopPropagation();

    if (
      localStorage.getItem('memberId') === null ||
      localStorage.getItem('memberId') === undefined ||
      localStorage.getItem('memberId') === '0' ||
      localStorage.getItem('memberId') === ''
    ) {
      this.showLoginModal();
    } else {


      this.loadingLikeId = theater._id;
      this.addbookmarkspin = true;

      // Check if the theater is already in the wishlist
      const existing = this.filteredWishlistItems.find(
        (item: any) => item.VENUE_ID === theater._id
      );

      let newStatus = true;
      if (existing && existing.STATUS) {
        newStatus = false;
      }

      const payload: any = {
        MEMBER_ID: Number(this.memberId),
        VENUE_ID: theater._id,
        STATUS: newStatus,
        ID: existing ? existing.ID : undefined,
      };

      if (existing && existing.ID) {
        // payload.ID = existing.ID;

        // Update existing like
        this.apiservice.updatetheaterLike(payload).subscribe({
          next: (res: any) => {
            if (res.code == '200') {
              if (newStatus) {
                // this.toastr.success('Liked successfully.', 'Success');
              } else {
                // this.toastr.success('Unliked successfully.', 'Success');
              }
              theater.liked = newStatus;
            } else if (res['code'] === 303 || res.message == 'Invalid token') {

              this.signOut()
            } else {
              // this.toastr.warning('Could not update like.', 'Warning');
            }
            this.fetchAllWishlistData();
          },
          error: () => {
            // this.toastr.error('Error updating like.', 'Error');
          },
          complete: () => {
            this.loadingLikeId = null;
            this.addbookmarkspin = false;
          },
        });
      } else {
        // Create new like
        this.apiservice.createtheaterLike(payload).subscribe({
          next: (res: any) => {
            if (res.code == '200') {
              // this.toastr.success('Liked successfully.', 'Success');
              theater.liked = true;
            } else if (res['code'] === 303 || res.message == 'Invalid token') {

              this.signOut()
            } else {
              // this.toastr.warning('Could not add like.', 'Warning');
            }
            if (this.memberId)
              this.fetchAllWishlistData();
          },
          error: () => {
            // this.toastr.error('Error adding like.', 'Error');
          },
          complete: () => {
            this.loadingLikeId = null;
            this.addbookmarkspin = false;
          },
        });
      }
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
      this.apiservice.userLogout(userId).subscribe({
        next: (successCode: any) => {
          clearAllData();

          this.toastr.success('You have successfully logged out!', 'Success');

          this.router.navigate(['/home']).then(() => {
            window.location.reload();
          });
        },
        error: (errorResponse) => {
          clearAllData();

          this.toastr.success('You have successfully logged out!', 'Success');

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
  maxVisibleTags = 4;

  getVisibleAmenities(theater: any): string[] {
    return theater.amenities?.slice(0, this.maxVisibleTags) || [];
  }

  isAmenitiesTruncated(theater: any): boolean {
    return theater.amenities?.length > this.maxVisibleTags;
  }

  openroutesvenue(venuedata: any) {
    this.router.navigate(['/explore/venues', this.cityname, venuedata.VENUE_SLUG, venuedata._id]);
  }



  updateMetaTags() {
    this.title.setTitle('Ticket Khidakee - Venues');

    // Canonical Tag
    let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    document.head.appendChild(link);
  }


}

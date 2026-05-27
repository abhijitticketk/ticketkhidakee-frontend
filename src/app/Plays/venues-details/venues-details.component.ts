import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { DomSanitizer, Meta, SafeHtml, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Services/api.service';
import { CommonFunctionService } from 'src/app/Services/CommonFunctionService';
declare var bootstrap: any;

@Component({
  selector: 'app-venues-details',
  templateUrl: './venues-details.component.html',
  styleUrls: ['./venues-details.component.scss'],
})
export class VenuesDetailsComponent {
  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private api: ApiService,
    private router: Router, private cookie: CookieService, private toastr: ToastrService, public userService: CommonFunctionService, private meta: Meta, private title: Title
  ) { }

  theaterId: any;
  retriveimgUrl = this.api.retriveimgUrl;
  memberId = localStorage.getItem('memberId');
  selectedCity: any = this.cookie.get('cityName');

  @ViewChild('closelogin') closelogin!: ElementRef;
  @ViewChild('closelogin1') closelogin1!: ElementRef;

  nowShowing: any[] = [];
  page = 1;
  pageSize = 10;
  loading = false;
  allDataLoaded = false;

  ngOnInit() {
    this.route.paramMap.subscribe((data) => {
      this.theaterId = data.get('id') || '';
      if (this.theaterId) {
        this.getTheaterByID(this.theaterId);
        this.getvenueRatingReviewDetails(this.theaterId);

        this.getRecommendedData(this.theaterId, 1);
        // this.getreviewa();
      }
    });
  }

  // Get Theaters

  theaterDetails: any;
  getTheaterByID(id: string) {
    if (!id) return;

    const filter = {
      $and: [{ _id: id }],
    };

    this.api.getAllVenueByCity(0, 0, 'ID', 'desc', filter).subscribe(
      (data: any) => {
        if (data?.code === 200 && data?.data?.length > 0) {
          const theater = data.data[0];
          this.updateMetaTags(theater.VENUE_NAME);
          this.theaterDetails = {
            VENUE_NAME: theater.VENUE_NAME,
            MAX_CAPACITY: theater.MAX_CAPACITY || 950,
            VENUE_SLUG: theater.VENUE_SLUG,
            DESCRIPTION: theater.DESCRIPTION,
            LONGITUDE: parseFloat(theater.LONGITUDE),
            LATITUDE: parseFloat(theater.LATITUDE),
            ADDRESS_DETAILS: theater.ADDRESS_DETAILS,
            AMENITY_NAMES: theater.AMENITY_NAMES,
            AMENITY_ID: theater.AMENITY_ID,
            BANNER_IMAGE: theater.BANNER_IMAGE
              ? this.retriveimgUrl + 'venueImages/' + theater.BANNER_IMAGE
              : 'assets/movie_skel.jpg',
            STATUS: theater.STATUS,
            CITY_NAME: theater.CITY_NAME,
            rating: parseFloat(theater.RATING || '0'),
          };

          if (this.theaterDetails.AMENITY_ID?.length > 0) {
            const ids = this.theaterDetails.AMENITY_ID.join(',');

            this.api
              .getAllAmenities(0, 0, 'id', 'desc', ` AND ID IN(${ids})`)
              .subscribe(
                (res: any) => {
                  if (res?.code === 200 && res?.data?.length > 0) {
                    // Assign to theaterDetails
                    this.theaterDetails.amenities = res.data.map(
                      (item: any) => ({
                        name: item.NAME,
                        icon: item.ICON || 'bi bi-star', // fallback icon
                      })
                    );
                  }
                },
                () => { }
              );
          }
        } else {
          console.error('No theater data found for ID:', id);
          this.theaterDetails = null;
        }
      },
      (error) => {
        console.error('Error fetching theater by ID:', error);
        this.theaterDetails = null;
      }
    );
  }

  // Get Review

  reviews: any;

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

  getvenueRatingReviewDetails(id: any) {
    this.api
      .getVenueRatingReviewDetails(
        1,
        this.pageSizee,
        'id',
        'desc',
        ` AND VENUE_ID = '${this.theaterId}'`
      )
      .subscribe(
        (res: any) => {
          if (res['code'] === 200) {
            this.reviewscount = res['count'];
          } else {
            this.reviewscount = 0;
          }
          if (res?.code === 200 && res?.data?.length > 0) {
            this.reviews = res.data
            // this.reviews = this.reviews.slice(0,2)
          } else {
            this.reviews = [];
          }
        },
        (error) => {
          console.error('Error fetching venue rating and reviews', error);
          this.reviews = [];
        }
      );
  }
  ratenowws = false;

  submitFeedback() {
    if (this.rating <= 0) {
      // this.toastr.error('Select at least one star');
    } else if (!this.reviewText || this.reviewText.trim() === '') {
      // this.toastr.error('Please add some comments');
    } else {
      const body = {
        MEMBER_ID: Number(localStorage.getItem('memberId')),
        VENUE_ID: this.theaterId,
        RATING: this.rating,
        REVIEW_TEXT: this.reviewText.trim(),
        VENUE_NAME: this.theaterDetails?.VENUE_NAME,
        ADDRESS: this.theaterDetails?.ADDRESS,
        CITY_NAME: this.theaterDetails?.CITY_NAME,
        FACILITIES: this.theaterDetails?.amenities?.map((item: any) => item.name).join(','),
        STATUS: this.theaterDetails?.STATUS,



        // Assuming CREATED_AT is generated by backend; if needed, send current timestamp:
        // CREATED_AT: new Date().toISOString()
      };

      this.ratenowws = true;

      this.api.VenueRatingReviewDetailsCreate(body).subscribe(
        (response) => {
          if (response.code === 200) {
            this.rating = 0;
            this.reviewText = '';
            this.theaterDetails.rating = response.avgRating
            this.closeFeedbackModal();
            this.getvenueRatingReviewDetails(this.theaterId);

            this.ratenowws = false; // reset spinner/status
          } else {
            this.ratenowws = false;
            // this.toastr.error('Failed to submit review');
          }
        },
        (error) => {
          this.ratenowws = false;
          // this.toastr.error('Something went wrong. Please try again.');
        }
      );
    }
  }

  closeFeedbackModal() {
    const modalElement = document.getElementById('rateNowModal');
    if (modalElement) {
      // Bootstrap 5 way to hide modal via JS
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }
  }

  openlogin() {
    this.closelogin.nativeElement.click();
    this.router.navigate(['/sign-in']);
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.loading || this.allDataLoaded) return;

    const scrollPosition = window.innerHeight + window.scrollY;

    // Responsive threshold based on screen width
    const isMobile = window.innerWidth <= 768; // mobile breakpoint
    const threshold = document.body.offsetHeight - (isMobile ? 500 : 300);

    if (scrollPosition >= threshold) {
      this.page++;
      this.getRecommendedData(this.theaterId, this.page);
    }
  }

  // carouselOptions = {
  //   loop: false,
  //   margin: 15,
  //   nav: true,
  //   dots: false,
  //   navText: [
  //     '<i class="bi bi-chevron-left fs-4"></i>',
  //     '<i class="bi bi-chevron-right fs-4"></i>',
  //   ],
  //   responsive: {
  //     0: { items: 1 },
  //     768: { items: 2 },
  //     992: { items: 3 },
  //   },
  // };


  carouselOptions = {
    loop: false,
    margin: 15,
    nav: true,
    dots: false,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplayHoverPause: true,
    navText: [
      '<i class="bi bi-chevron-left fs-4"></i>',
      '<i class="bi bi-chevron-right fs-4"></i>',
    ],
    responsive: {
      0: { items: 1 },
      768: { items: 2 },
      992: { items: 3 },
    },
  };


  getRecommendedData(id: string, page: number = 1) {
    if (!id || this.loading || this.allDataLoaded) return;

    this.loading = true;

    let filter: any = { VENUE_ID: id };

    this.api
      .getALLVenueRecommended(page, this.pageSize, 'ID', 'desc', filter)
      .subscribe((data: any) => {
        this.loading = false;

        if (data?.code === 200 && data.data?.length > 0) {
          // Map new data
          const newShows = data.data.map((show: any) => ({
            id: show._id,
            image: show.EVENT_IMAGE ? this.retriveimgUrl + 'eventImages/' + show.EVENT_IMAGE : 'assets/default-event.jpg',
            title: show.EVENT_NAME,
            date: show.SHOW_DATE,
            category: show.CATEGORY_NAME,
            EVENT_SLUG: show.EVENT_SLUG,
            VENUE_ID: show.VENUE_ID,
            EVENT_ID: show.EVENT_ID,
            time: show.SHOW_TIME,
            genre: show.EVENT_GENRE?.trim() || null,
            languages: show.EVENT_LANGUAGE,
            TAGS_NAMES: show.TAGS_NAMES,
            CATEGORY_ID: typeof show.CATEGORY_ID === 'string' ? parseInt(show.CATEGORY_ID) : show.CATEGORY_ID, // normalize to number
            bookmarked: false,
            IS_PROMOTED: show.IS_PROMOTED
          }));


          if (page === 1) {
            this.nowShowing = newShows;
          } else {
            this.nowShowing = [...this.nowShowing, ...newShows];
             this.checkArrowVisibility();
          window.addEventListener('resize', this.checkArrowVisibility.bind(this));
          }

          // If returned data less than pageSize, no more data
          if (newShows.length < this.pageSize) {
            this.allDataLoaded = true;
          }
          if (localStorage.getItem('memberId')) {
            this.fetchAllWishlistData();
          }

        } else {
          // No data or error
          if (page === 1) this.nowShowing = [];
          this.allDataLoaded = true;
        }
      });
  }
showLeftRightArrows = false;

  ngAfterViewInit(): void {
    this.checkArrowVisibility();
    window.addEventListener('resize', this.checkArrowVisibility.bind(this));
  }
    checkArrowVisibility() {
  
      const screenWidth = window.innerWidth;
      const totalItems = this.nowShowing?.length || 0;
  
      if ((screenWidth >= 768 && totalItems > 5) || (screenWidth < 768 && totalItems > 2)) {
        this.showLeftRightArrows = true;
      } else {
        this.showLeftRightArrows = false;
      }
      // this.changeDetectorRef.detectChanges();
    }
  
    @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
    scrollAmount = 300;
  
    scrollLeft() {
      this.scrollContainer.nativeElement.scrollBy({ left: -this.scrollAmount, behavior: 'smooth'});
    }
  
    scrollRight() {
      this.scrollContainer.nativeElement.scrollBy({ left: this.scrollAmount,behavior: 'smooth'});
    }
  // @HostListener('window:scroll', [])
  // onScroll(): void {
  //   if (this.loading || this.allDataLoaded) return;

  //   const scrollPosition = window.innerHeight + window.scrollY;
  //   const threshold = document.body.offsetHeight - 100; // 100px from bottom

  //   if (scrollPosition >= threshold) {
  //     this.page++;
  //     this.getRecommendedData(this.theaterId, this.page);
  //   }
  // }

  // Get BookMarks

  wishlistItems: any[] = [];
  filteredWishlistItems: any[] = [];
  isWishlistLoading: boolean = false;

  fetchAllWishlistData() {
    this.isWishlistLoading = true;

    this.api
      .getallwishlist(0, 0, 'id', 'desc', 'AND MEMBER_ID = ' + this.memberId)
      .subscribe(
        (response: any) => {
          if (response.code == 200) {
            this.filteredWishlistItems = response.data;
          } else {
            this.filteredWishlistItems = [];
          }
          this.isWishlistLoading = true;
        },
        (error: any) => {
          console.error('Error fetching wishlist data:', error);
          this.isWishlistLoading = false;
        }
      );
  }
  addbookmarkspin: boolean = false;
  loadingBookmarkId: number | null = null;

  toggleBookmark(show: any, event: MouseEvent) {

    event.stopPropagation();

    if (
      localStorage.getItem('memberId') === null ||
      localStorage.getItem('memberId') === undefined ||
      localStorage.getItem('memberId') === '0' ||
      localStorage.getItem('memberId') === ''
    ) {
      this.showLoginModal();
    } else {
      this.loadingBookmarkId = show.id;
      this.addbookmarkspin = true;

      // Use consistent id property (_id or id)
      const eventId = show._id || show.id;

      const existing = this.filteredWishlistItems.find(
        (item: any) => item.EVENT_ID === eventId
      );

      let status = true;
      if (existing && existing.STATUS) {
        status = false;
      }

      const payload = {
        MEMBER_ID: Number(this.memberId),
        EVENT_ID: eventId,
        STATUS: status,
        ID: existing ? existing.ID : undefined,
      };

      if (existing && existing.ID) {
        this.api.updateBookmark(payload).subscribe({
          next: (res: any) => {
            if (res.code == '200') {
              // this.toastr.success(
              //   status
              //     ? 'Bookmark added successfully.'
              //     : 'Bookmark removed successfully.',
              //   'Success'
              // );
            } else if (res['code'] === 303 || res.message == 'Invalid token') {

              this.signOut()
            } else {
              // this.toastr.warning('Could not update the bookmark.', 'Warning');
            }
            if (localStorage.getItem('memberId'))
              this.fetchAllWishlistData();
          },
          error: () => {
            // this.toastr.error('Error updating bookmark.', 'Error');
          },
          complete: () => {
            this.loadingBookmarkId = null;
            this.addbookmarkspin = false;
          },
        });
      } else {
        this.api.createBookmark(payload).subscribe({
          next: (res: any) => {
            if (res.code == '200') {
              // this.toastr.success('Bookmark added successfully.', 'Success');
            } else if (res['code'] === 303 || res.message == 'Invalid token') {

              this.signOut()
            } else {
              // this.toastr.warning('Could not add the bookmark.', 'Warning');
            }
            if (localStorage.getItem('memberId'))
              this.fetchAllWishlistData();
          },
          error: () => {
            // this.toastr.error('Error adding bookmark.', 'Error');
          },
          complete: () => {
            this.loadingBookmarkId = null;
            this.addbookmarkspin = false;
          },
        });
      }
    }
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
      this.api.userLogout(userId).subscribe({
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
  showLoginModal() {
    var d = document.getElementById('loginmodaltrack1') as HTMLElement;
    d.click();
  }

  openlogin1() {
    this.closelogin1.nativeElement.click();
    this.router.navigate(['/sign-in']);
  }
  getBookmarked(show: any): boolean {
    const eventId = show._id || show.id;

    const item = this.filteredWishlistItems.find(
      (item: any) => item.EVENT_ID === eventId
    );
    return !!(item && item.STATUS);
  }

  activeTab: 'now-showing' | 'upcoming' = 'now-showing';

  upcomingShows: any[] = [
    {
      title: "The Phantom's Encore",
      image:
        'https://readdy.ai/api/search-image?query=Broadway%20musical%20scene%20with%20performers%20in%20colorful%20costumes%20on%20stage%2C%20dramatic%20lighting%2C%20professional%20theater%20production%2C%20high%20quality%20stage%20performance%20with%20dancers%20and%20singers%2C%20elegant%20theatrical%20setting&width=400&height=380&seq=show1&orientation=portrait',
      ratingCount: 492,
      fullStars: Array(5),
      halfStar: false,
      emptyStars: [],
      genre: 'Musical',
      languages: 'English, Hindi',
      date: 'Sep 10',
      time: '7:30 PM',
    },
  ];

  onImageError(event: any) {
    event.target.src = '/assets/movie_skel.jpg';
  }

  rating = 0;
  reviewText = '';

  setRating(star: number) {
    this.rating = star;
  }

  openWriteReviewModal() {
    // Logic to open modal (if using Bootstrap modal or any component)
    alert('Open write review modal');
  }

  selectTab(tab: 'now-showing' | 'upcoming'): void {
    this.activeTab = tab;
  }

  toggleFavorite(data: any) { }

  openGoogleMap(lat: number, lng: number) {
    if (lat && lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      alert('Location coordinates not available.');
    }
  }
  openroutesvenue(venuedata: any, event: MouseEvent) {
    event.stopPropagation();
    this.router.navigate(['/explore', this.selectedCity, venuedata.category, venuedata.EVENT_SLUG, venuedata.EVENT_ID]);
  }

  getFirstGenre(genre: string): string {
    return genre?.split(',')[0] || '';
  }

  hasMoreGenres(genre: string): boolean {
    return genre?.split(',').length > 1;
  }

  gotoBookNow(show: any, event: MouseEvent) {
    event.stopPropagation();

    var name: any = show.category.toLowerCase()
      .replace(/[\/\\,]+/g, '') // Remove /, \, ,
      .replace(/[^a-z0-9\s-]/g, '') // Remove other special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single one
      .trim(); // Trim leading/trailing spaces
    this.router.navigate(['explore/', this.selectedCity, name, show.EVENT_SLUG, 'buy-tickets', show.id]);
  }


  formatReviewText(text: string): SafeHtml {
    const maxLength = 120;
    let slicedText = text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

    // Replace #tags with <strong> versions
    const formatted = slicedText.replace(/#(\w+)/g, '<strong>#$1</strong>');

    // Sanitize the HTML before returning
    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }


  customOptions = {
    loop: true,
    margin: 10,
    nav: false,
    dots: true,
    center: true,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplayHoverPause: true,
    responsive: {
      0: { items: 1 },
      768: { items: 2 },
      1000: { items: 3 },
    },
  };
  getStars(rating: number): number[] {
    return [1, 2, 3, 4, 5];
  }
  userImage: string = 'assets/images/profile-imgs/usernoimage.jpg';

  expandedReviews: boolean[] = [];


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


  showMoreButton: boolean[] = [];



  getreviewa() {
    if (this.isLoading || this.allReviewsLoaded) return;

    this.isLoading = true;

    this.api
      .getVenueRatingReviewDetails(
        this.pageIndex,
        this.pageSizee,
        'id',
        'desc',
        ` AND VENUE_ID = '${this.theaterId}'`
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

  displayedReviews: any = []
  reviewscount: number = 0
  isLoading: boolean = false
  allReviewsLoaded: boolean = false

  pageIndex = 1;
  pageSizee = 4

  onScrolllll(event: any) {
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

  showrattingmodel() {
    this.displayedReviews = this.reviews
    if (this.displayedReviews.length < this.reviewscount) {
      this.allReviewsLoaded = false;
    } else {
      this.allReviewsLoaded = true;
    }
  }



  updateMetaTags(venuename: any) {
    this.title.setTitle('Venue -' + venuename);

    // Canonical Tag
    let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    document.head.appendChild(link);
  }
}

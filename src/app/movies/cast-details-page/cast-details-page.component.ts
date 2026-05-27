import {
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-cast-details-page',
  templateUrl: './cast-details-page.component.html',
  styleUrls: ['./cast-details-page.component.scss'],
})
export class CastDetailsPageComponent {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiservice: ApiService,
    private toastr: ToastrService
  ) { }
  memberId: any;
  ngOnInit() {
    // this.memberId = localStorage.getItem('memberId');
    // if (this.memberId) {
    //   this.fetchAllWishlistData();
    // }
    const serviceId = this.route.snapshot.paramMap.get('id');
    if (serviceId) {
      this.getCast(serviceId);
    }
  }
  isMobile: boolean = false;

  spinnerArray = Array(12);

  onImageError(event: any) {
    event.target.src = '/assets/movie_skel.jpg';
  }
  selectedCity = 'bengaluru';
  retriveimgUrl = this.apiservice.retriveimgUrl;
  castdetails: any;

  // getCast(search: any) {
  //   this.apiservice
  //     .getCastDetails(0, 0, 'id', 'desc', `AND CAST_ID = '${search}'`)
  //     .subscribe(
  //       (data: any) => {
  //         if (data?.code === 200 && data?.data?.length > 0) {
  //           this.castdetails = data.data[0];

  //           // Using spread operator to simulate 10 movie entries
  //           const additionalMovies = [...Array(10).keys()].map(i => ({
  //             MOVIE_NAME: `Movie ${i + 1}`,
  //             MOVIE_IMAGES: JSON.stringify([
  //               { ISDEFAULT: i === 0, URL: `movie${i + 1}-image1.jpg` },
  //               { ISDEFAULT: false, URL: `movie${i + 1}-image2.jpg` }
  //             ])
  //           }));

  //           // Adding the generated movies to the castdetails
  //           this.castdetails.MOVIES = [...this.castdetails.MOVIES, ...additionalMovies];

  //           // Parsing the MOVIE_IMAGES for each movie and setting the default image
  //           this.castdetails.MOVIES.forEach((movie: any) => {
  //             const movieImages = JSON.parse(movie.MOVIE_IMAGES);
  //             const EVENT_IMAGES=this.parseImageUrl(movie.MOVIE_IMAGES)
  //             const defaultImage = movieImages.find((image: any) => image.ISDEFAULT);
  //             movie.DEFAULT_IMAGE = defaultImage ? defaultImage.URL : movieImages[0]?.URL; // Fallback to the first image
  //           });

  //
  //         }
  //       },
  //       (error: any) => {
  //
  //       }
  //     );
  // }

  parseImageUrl(jsonString: string): string {
    try {
      const images = JSON.parse(jsonString);
      return images?.find((img: any) => img.ISDEFAULT)?.URL || '';
    } catch {
      return '';
    }
  }

  loading: boolean = false;
  getCast(search: any) {
    this.loading = true;
    this.apiservice
      .getCastDetails(0, 0, 'id', 'desc', `AND ID = '${search}'`)
      .subscribe(
        (data: any) => {
          if (data?.code == 200 && data?.data?.length > 0) {
            this.castdetails = data.data[0];

            // Parse FAMILY_DETAILS if it's a string
            if (this.castdetails.FAMILY_DETAILS) {
              this.castdetails.FAMILY_DETAILS = JSON.parse(
                this.castdetails.FAMILY_DETAILS
              );
            }

            // Parsing the MOVIE_IMAGES for each movie and setting the default image
            if (this.castdetails.MOVIES != undefined) {
              this.castdetails.MOVIES.forEach((movie: any) => {
                const movieImages = JSON.parse(movie.MOVIE_IMAGES);
                const defaultImage = movieImages.find(
                  (image: any) => image.ISDEFAULT
                );
                movie.DEFAULT_IMAGE = defaultImage
                  ? defaultImage.URL
                  : movieImages[0]?.URL; // Fallback to the first image
              });
            }
          }
          this.loading = false;
        },
        (error: any) => {
          this.loading = false;
        }
      );
  }

  carouselOptions = {
    loop: true,
    margin: 10,
    nav: true,
    dots: false,
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      1000: { items: 6 },
    },
  };

  relatedPosts = [
    {
      id: 1,
      image: 'assets/images/blog-imgs/img-2.jpg',
      title: 'How to Live Stream Successfully: Complete Guide for Event Hosts',
      date: '5 May, 2022',
      readTime: '10 mins read',
    },
    {
      id: 2,
      image: 'assets/images/blog-imgs/img-3.jpg',
      title: 'Virtual Event Sponsorship Ideas for Your Next Event',
      date: '5 May, 2022',
      readTime: '10 mins read',
    },
    // Add more posts here...
  ];
  navigateToMovies() {
    const citySlug = this.selectedCity.toLowerCase().replace(/\s+/g, '-');
    this.router.navigate([`/movies/${citySlug}`]);
  }
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  canScrollLeft = false;
  canScrollRight = true;
  showArrows = false;

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.castdetails != undefined) {
        this.showArrows = this.castdetails.MOVIES.length > 5;
        this.canScrollRight = true;
        this.updateArrows();
      }
    }, 0);
  }

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

  onScroll() {
    this.updateArrows();
  }

  private updateArrows() {
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

  currentUrl: string = window.location.href;

  copyToClipboard() {
    navigator.clipboard.writeText(this.currentUrl).then(() => {
      alert('Link copied to clipboard!');
    });
  }

  goToCastProfile(data: any) {
    if (data.CAST_ID) this.router.navigate(['/cast/details', data.CAST_ID]);
  }
  scrollAmount: any = 1000;
  addbookmarkspin: boolean = false;
  @ViewChildren('scrollContainer') scrollContainers!: QueryList<ElementRef>;
  scrollLeftttt(index: number): void {
    const container = this.scrollContainers.toArray()[index];
    container.nativeElement.scrollBy({
      left: -this.scrollAmount,
      behavior: 'smooth',
    });
  }

  scrollRightttt(index: number): void {
    const container = this.scrollContainers.toArray()[index];
    container.nativeElement.scrollBy({
      left: this.scrollAmount,
      behavior: 'smooth',
    });
  }

  onScrollllll(index: number): void {
    // Optional: handle scroll tracking per section if needed
    const container = this.scrollContainers.toArray()[index];
    
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

  getFirstGenre(genreString: string): string {
    if (!genreString) return ''; // handles null, undefined, or empty string
    const genres = genreString.split(',').map((g) => g.trim());
    return genres.length > 1 ? `${genres[0]}` : genres[0];
  }
  hasMoreGenres(genreString: string): boolean {
    if (!genreString) return false;
    return genreString.split(',').map((g) => g.trim()).length > 1;
  }

  formatShowDates(dateRange: string, time: any): string {
    const dates = dateRange.split(' TO ');
    const firstDate = dates[0].trim();
    const secondDate = dates[1].trim();

    if (firstDate === secondDate) {
      return firstDate + ' ' + time;
    } else {
      return `${firstDate} & onwards`;
    }
  }
  isWishlistLoading: boolean = false;
  wishlistItems: any;
  filteredWishlistItems: any = [];
  fetchAllWishlistData() {
    this.isWishlistLoading = true;

    this.apiservice
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
      this.apiservice.updateBookmark(likePayload).subscribe({
        next: (res: any) => {
          if (res.code == '200') {
            // event.bookmarked = !event.bookmarked;
            const actionMessage = event.bookmarked ? 'added' : 'removed';
            this.toastr.success(
              `Bookmark ${actionMessage} successfully.`,
              'Success'
            );
          } else {
            // this.toastr.warning('Could not update the bookmark.', 'Warning');
          }
          this.fetchAllWishlistData();
        },
        error: () => {
          this.addbookmarkspin = false;
          // this.toastr.error('Error updating bookmark.', 'Error');
        },
      });
    } else {
      this.apiservice.createBookmark(likePayload).subscribe({
        next: (res: any) => {
          if (res.code == '200') {
            this.toastr.success('Bookmark added successfully.', 'Success');
          } else {
            this.toastr.warning('Could not add the bookmark.', 'Warning');
          }
          this.fetchAllWishlistData();
        },
        error: () => {
          this.addbookmarkspin = false;
          // this.toastr.error('Error adding bookmark.', 'Error');
        },
      });
    }
  }

  section: any = [];
}

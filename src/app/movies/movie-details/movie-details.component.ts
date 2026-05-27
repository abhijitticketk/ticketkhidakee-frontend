import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Services/api.service';
import { CategoryService } from 'src/app/Services/category.service';
import { LocationService } from 'src/app/Services/location.service';
declare var bootstrap: any;

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss'],
})
export class MovieDetailsComponent {
  movieId: any;
  Loading: boolean = false;
  activeTab: string = 'about';
  showModal: boolean = false;
  currentRating: number = 0;
  reviewText: string = '';
  charCount: number = 0;
  playId: any;
  movieRating: any[] = [];
  userImage: string = 'assets/images/profile-imgs/usernoimage.jpg';
  chunkedRatings: any[][] = [];
  filteredMoviesData: any[] = [];
  RecomendedMoviesData: any[] = [];
  selectedCityId: any;
  spinnerArray = Array(12);
  MOVIE: any = [];
  castMembers: any = [];
  crewMembers: any = [];
  MOVIE_FORMATS = {
    AVAILABLE_IN: ['2D', '3D', 'IMAX', '4DX'],
  };

  REVIEWS: any;

  postReply(REVIEW: any) {
    if (REVIEW.REPLY_TEXT?.trim()) {
      REVIEW.REPLIES.push({
        AUTHOR: 'You',
        DATE: new Date().toDateString(),
        CONTENT: REVIEW.REPLY_TEXT,
        HELPFUL: 0,
        NOT_HELPFUL: 0,
      });
      REVIEW.REPLY_TEXT = '';
      REVIEW.SHOW_REPLY = false;
    }
  }

  Math = Math;
  section: any;

  retriveimgUrl = this.apiService.retriveimgUrl;

  movieName!: string;
  movietype!: string;
  selectedcategoryId: any;
  likeItems: any[] = [];
  isWishlistLoading: boolean = false;

  constructor(
    private toastr: ToastrService,
    private apiService: ApiService,
    private router: Router,
    private locationService: LocationService,
    private route: ActivatedRoute,
    private categoryService: CategoryService
  ) {
    // this.movieName = this.route.snapshot.paramMap.get('moviename') || '';
    // this.movieId = this.route.snapshot.paramMap.get('id') || '';
    // this.movietype = this.route.snapshot.paramMap.get('movietype') || '';
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.movieId = params['id'];
      this.movieName = params['moviename'];
      this.movietype = params['movietype'];
      this.getMovieRating();
    });

    

    this.locationService.selectedCity$.subscribe((cityName: any) => {
      if (cityName) {
        this.selectedCityId = cityName.ID;
        
        // Trigger your logic here (e.g., fetch movies/events for the new city)
        this.getMovieDetails();
      }
    });

    this.categoryService.selectedCategory$.subscribe((category) => {
      if (category) {
        this.selectedcategoryId = category;
        
        this.getRecommended();
      }
    });
  }

  getMovieDetails() {
    this.Loading = true;
    this.apiService
      .getEventDetails(0, 0, '', 'asc', ' ', this.movieId, this.selectedCityId)
      .subscribe(
        (data: any) => {
          this.Loading = false;
          if (data['code'] === 200 && data['data'] && data['data'].length > 0) {
            // const eventData = data['data'][0].eventMasterData;
            const eventData = data['data'][0];

            this.MOVIE = {
              TITLE: eventData.EVENT_NAME,

              EVENT_IMAGE: eventData.EVENT_IMAGE,
              BANNER_IMAGE: eventData.BANNER_IMAGE,
              RATING: null, // No rating in data, you can add if available
              VOTES: null, // No votes info
              RECOMMENDATION: null, // No recommendation
              LANGUAGES: eventData.LANGUAGE_NAMES, // "Hindi"
              DIRECTOR:
                eventData.eventCastData.find((c: any) =>
                  c.ROLE_ID.toLowerCase().includes('director')
                )?.CAST_NAME || 'N/A',
              RELEASE_DATE: new Date(eventData.RELEASE_DATE).toLocaleDateString(
                'en-US',
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }
              ),
              DURATION: this.formatDuration(eventData.DURATION), // Convert minutes to "2h 49m" format
              CERTIFICATION: eventData.CERTIFICATES,
              GENRES: eventData.GENRE_NAMES
                ? eventData.GENRE_NAMES.split(',')
                : [],
              POSTER: `https://yourdomain.com/images/${eventData.EVENT_IMAGE}`, // Replace with correct base URL
              ABOUT: this.stripHtml(eventData.DESCRIPTION),
              TERMS_CONDITIONS: eventData.TERMS_CONDITIONS,
              liked: false,
              wishlistId: null,
            };

            // Filter CAST
            this.castMembers = eventData.eventCastData.filter(
              (member: any) => member.TYPE_ID === 'CAST'
            );

            // Filter CREW
            this.crewMembers = eventData.eventCastData.filter(
              (member: any) => member.TYPE_ID === 'CREW'
            );

            

            this.fetchAllTheaterLikes();
            this.fetchAllReviewLikes();
          } else {
            console.warn('No event details found.');
            this.MOVIE = null;
            this.castMembers = [];
          }
        },
        (error: any) => {
          this.Loading = false;
          console.error('Error fetching play details', error);
        }
      );
  }
  fetchAllTheaterLikes() {
    this.isWishlistLoading = true;

    // this.apiService.getalleventlikes(0, 0, 'id', 'desc', ' AND MEMBER_ID = ' +  localStorage.getItem('memberId')).subscribe({
    this.apiService.getalleventlikes(0, 0, 'id', 'desc', ' ').subscribe({
      next: (response: any) => {
        if (response?.code === 200 && response?.data?.length > 0) {
          this.likeItems = response.data;
          

          this.updateLikeStatus(); // map like to movie
        }
        this.isWishlistLoading = false;
      },
      error: () => {
        console.error('Error fetching like data');
        this.isWishlistLoading = false;
      },
    });
  }

  updateLikeStatus() {
    

    const match = this.likeItems.find(
      (like: any) => like.EVENT_ID === this.movieId
    );

    

    if (match) {
      this.MOVIE.liked = match.STATUS;
      this.MOVIE.wishlistId = match.ID;
    }
  }

  movieslike: any;
  toggleLike(movie: any) {
    const isLiking = !movie.liked;

    const likePayload = {
      EVENT_ID: this.movieId,
      MEMBER_ID: localStorage.getItem('memberId'),
      STATUS: isLiking ? 1 : 0,
      ID: movie.wishlistId,
    };

    if (isLiking && !movie.wishlistId) {
      this.apiService.createeventLike(likePayload).subscribe({
        next: (res: any) => {
          if (res.code == '200') {
            movie.liked = true;
            movie.wishlistId = res.data?.ID;
            this.toastr.success('Added to wishlist.', 'Success');
          } else {
            this.toastr.warning('Could not add to wishlist.', 'Warning');
          }
          this.fetchAllTheaterLikes();
        },
        error: () => this.toastr.error('Error liking the movie.', 'Error'),
      });
    } else {
      this.apiService.updateeventLike(likePayload).subscribe({
        next: (res: any) => {
          if (res.code == '200') {
            movie.liked = false;
            movie.wishlistId = null;
            this.toastr.success('Removed from wishlist.', 'Success');
          } else {
            this.toastr.warning('Could not remove from wishlist.', 'Warning');
          }
          this.fetchAllTheaterLikes();
        },
        error: () => this.toastr.error('Error updating like.', 'Error'),
      });
    }
  }

  // event like dislike

  eventLikeDislike(review: any, status: number) {
    const memberId = localStorage.getItem('memberId');
    const isSameStatus = review.LIKE_STATUS === status;

    const payload = {
      MEMBER_ID: memberId,
      STATUS: isSameStatus ? null : status,
      REVIEW_ID: review.ID,
      ID: review.LIKE_ID || null,
    };

    if (!review.LIKE_ID) {
      this.apiService.createeventLike(payload).subscribe({
        next: (res: any) => {
          if (res.code == '200') {
            this.toastr.success('Action recorded.', 'Success');
            this.fetchAllReviewLikes();
          } else {
            this.toastr.warning('Could not perform action.', 'Warning');
          }
        },
        error: () => this.toastr.error('Error liking/disliking.', 'Error'),
      });
    } else {
      this.apiService.updateeventLike(payload).subscribe({
        next: (res: any) => {
          if (res.code == '200') {
            this.toastr.success('Updated.', 'Success');

            this.fetchAllReviewLikes();
          } else {
            this.toastr.warning('Could not update action.', 'Warning');
          }
        },
        error: () => this.toastr.error('Error updating.', 'Error'),
      });
    }
  }

  fetchAllReviewLikes() {
    this.apiService
      .getalleventRatingReviewLikes(0, 0, 'id', 'desc', ``)
      .subscribe({
        next: (response: any) => {
          if (response?.code == 200 && response?.data?.length > 0) {
            const likeMap = new Map();
            for (let like of response.data) {
              likeMap.set(like.RATING_REVIEW_ID, like);
            }

            // Update REVIEWS with new references
            this.REVIEWS = this.REVIEWS.map((review: any) => {
              const reviewLike = likeMap.get(review.ID);
              return {
                ...review,
                LIKE_ID: reviewLike ? reviewLike.ID : null,
                LIKE_STATUS: reviewLike ? reviewLike.STATUS : null,
              };
            });
          }

          
        },
        error: () => console.error('Error fetching review likes'),
      });
  }

  getRecommended() {
    const status = 'S';
    const filter = { BOOKING_STATUS: status };
    this.apiService
      .getCityWiseALLData1(
        1,
        10,
        'SHOW_DATE',
        'DESC',
        filter,
        this.selectedCityId,
        this.selectedcategoryId
      )
      .subscribe(
        (data: any) => {
          if (
            data['code'] === 200 &&
            data['data'] &&
            Array.isArray(data['data'])
          ) {
            const events = data['data'];

            const matchedEvent = events.find(
              (ev: any) => ev._id === this.movieId
            );

            if (matchedEvent) {
              const matchedGenres = matchedEvent.GENRE_NAMES.split(',').map(
                (g: string) => g.trim().toLowerCase()
              );
              const matchedLanguages = matchedEvent.LANGUAGE_NAMES.split(
                ','
              ).map((l: string) => l.trim().toLowerCase());

              const filteredEvents = events.filter((ev: any) => {
                if (ev._id === matchedEvent._id) return false; // exclude matched event itself
                const evGenres = ev.GENRE_NAMES.split(',').map((g: string) =>
                  g.trim().toLowerCase()
                );
                const evLanguages = ev.LANGUAGE_NAMES.split(',').map(
                  (l: string) => l.trim().toLowerCase()
                );

                const genreMatch = evGenres.some((g: string) =>
                  matchedGenres.includes(g)
                );
                const languageMatch = evLanguages.some((l: string) =>
                  matchedLanguages.includes(l)
                );

                return genreMatch || languageMatch;
              });

              this.section = {
                TITLE: 'Upcoming Events',
                SECTION_DATA: filteredEvents.map((ev: any) => ({
                  EVENT_MASTER: {
                    EVENT_NAME: ev.EVENT_NAME,
                    EVENT_IMAGE: ev.EVENT_IMAGE,
                    LANGUAGE_NAMES: ev.LANGUAGE_NAMES,
                    GENRE_NAMES: ev.GENRE_NAMES,
                  },
                  // Pick first show date/time from schedules if available
                  SHOW_DATE:
                    ev.schedules && ev.schedules.length > 0
                      ? new Date(ev.schedules[0].SHOW_DATE)
                      : null,
                  SHOW_TIME:
                    ev.schedules && ev.schedules.length > 0
                      ? ev.schedules[0].SHOW_TIME
                      : null,
                  likedislike: false, // default, set as needed
                })),
              };

              
            } else {
              console.warn('No event found matching selectedcategoryId');
              this.section = { TITLE: 'Upcoming Events', SECTION_DATA: [] };
            }
          } else {
            console.error('Invalid data received');
          }
        },
        (error) => {
          console.error('API error', error);
        }
      );
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  toggleReviewModal() {
    this.rating = 0;
    this.selectedTags = [];
    this.feedback.comment = '';
  }

  updateCharCount() {
    this.charCount = this.reviewText.length;
  }

  submitReview() {
    if (!this.currentRating) {
      alert('Please select a rating');
      return;
    }
    if (this.charCount > 500) {
      alert('Review text is too long');
      return;
    }

    // Submit logic here
    
    

    // After submission
    this.toggleReviewModal();
  }

  // Helper to convert duration in minutes (string or number) to "Xh Ym" format
  formatDuration(duration: string | number): string {
    const mins = Number(duration);
    if (isNaN(mins)) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  // Helper to strip HTML tags from description string (to keep plain text)
  stripHtml(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  REVIEW_LIMIT = 3; // initial limit
  allReviews = [];
  ratingData: any;
  getMovieRating() {
    this.apiService.getMovieRating(0, 0, '', 'asc', '').subscribe(
      (response: any) => {
        if (response.code === 200 && response.data.length > 0) {
          this.allReviews = response.data.map((review: any) => ({
            ID: review.ID,
            EVENT_ID: review.EVENT_ID,
            RATING: review.RATING,
            TITLE: review.MEMBER_NAME || 'Anonymous',
            DESCRIPTION: review.REVIEW_TEXT,
            DATE: this.formatDate(review.CREATED_AT),
            HELPFUL: review.HELPFUL || 0,
            NOT_HELPFUL: review.NOT_HELPFUL || 0,
            REPLIES: review.REPLIES || [],
            SHOW_REPLY: false,
            REPLY_TEXT: '',
          }));

          // Rating calculation
          const totalRatings = this.allReviews.length;
          const ratingCounts = [0, 0, 0, 0, 0]; // Index 0 = 1-star, ..., 4 = 5-star

          this.allReviews.forEach((review: any) => {
            const starIndex = Math.max(1, Math.min(5, review.RATING)) - 1;
            ratingCounts[starIndex]++;
          });

          const sumRatings = this.allReviews.reduce(
            (sum, r: any) => sum + r.RATING,
            0
          );
          const averageRating =
            totalRatings > 0 ? sumRatings / totalRatings : 0;

          const colors = [
            'bg-red-500',
            'bg-orange-400',
            'bg-yellow-400',
            'bg-green-400',
            'bg-green-500',
          ];

          const breakdown = ratingCounts
            .map((count, index) => ({
              STAR: index + 1,
              PERCENTAGE:
                totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0,
              COLOR: colors[index],
            }))
            .reverse(); // Highest stars first (5 to 1)

          this.ratingData = {
            AVERAGE_RATING: parseFloat(averageRating.toFixed(1)),
            TOTAL_RATINGS: totalRatings,
            RATING_BREAKDOWN: breakdown,
          };

          this.REVIEWS = this.allReviews.slice(0, this.REVIEW_LIMIT);
        } else {
          this.allReviews = [];
          this.REVIEWS = [];
          this.ratingData = {
            AVERAGE_RATING: 0,
            TOTAL_RATINGS: 0,
            RATING_BREAKDOWN: [],
          };
        }
      },
      (error) => {
        console.error('Error fetching movie rating', error);
      }
    );
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    return new Date(dateString).toLocaleString('en-US', options);
  }

  loadMoreReviews() {
    this.REVIEW_LIMIT += 3;
    this.REVIEWS = this.allReviews.slice(0, this.REVIEW_LIMIT);
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

  submitFeedback() {
    if (this.rating > 0) {
      const body = {
        MEMBER_ID: localStorage.getItem('memberId'),
        EVENT_ID: this.movieId,
        RATING: this.rating,
        REVIEW_TEXT: this.feedback.comment,
      };
      

      this.apiService.RateUS(body).subscribe(
        (response: any) => {
          if (response?.code === 200) {
            this.toastr.success('Review submitted successfully', '');

            this.closeFeedbackModal(); // ✅ Close modal after success
          } else {
            this.toastr.error('Failed to submit review', '');
          }
        },
        (error) => {
          this.toastr.error('Something went wrong. Please try again.');
        }
      );
    } else {
      this.toastr.error('Job not found. Please try again.');
    }
  }

  feedback = {
    serviceRating: 0,
    technicianRating: 0,
    comment: '',
  };

  rating = 0;
  techRating = 0;

  openFeedbackModal() {
    let modalElement = document.getElementById('rateNowModal');
    if (modalElement) {
      let modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  closeFeedbackModal() {
    const modalElement = document.getElementById('rateNowModal');
    if (modalElement && bootstrap.Modal.getInstance(modalElement)) {
      bootstrap.Modal.getInstance(modalElement)?.hide();
    }
    this.getMovieRating();
  }

  getTags(): string[] {
    if (this.rating === 1 || this.rating === 2 || this.rating === 3) {
      return [
        '#DirectionWorks',
        '#Entertaining',
        '#Interesting',
        '#NiceStory',
        '#Timepass',
        '#CoolMusic',
        '#OneTimeWatch',
        '#Fun',
        '#QuiteNice',
      ];
    } else if (this.rating === 4 || this.rating === 5 || this.rating === 6) {
      return [
        '#OkDirection',
        '#GoodActing',
        '#GoodMusic',
        '#NiceStory',
        '#HitPlay',
        '#OneTimeWatch',
        '#Enjoyable',
        '#LovelyMusic',
        '#FunWatch',
      ];
    } else if (
      this.rating === 7 ||
      this.rating === 8 ||
      this.rating === 9 ||
      this.rating === 10
    ) {
      return [
        '#SuperDirection',
        '#GreatActing',
        '#WowMusic',
        '#AwesomeStory',
        '#Blockbuster',
        '#Rocking',
        '#Inspiring',
        '#Wellmade',
        '#Unbelievable',
      ];
    }
    return [];
  }

  setRating(star: number) {
    this.feedback.serviceRating = star;
    this.rating = star;
    this.rating = star;
    this.selectedTags = []; // Reset tags when rating changes
    this.feedback.comment = ''; // Reset comment
  }
  selectedTags: string[] = [];

  toggleTag(tag: string): void {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter((t) => t !== tag);
    } else {
      this.selectedTags.push(tag);
    }
    this.feedback.comment = this.selectedTags.join(', ');
  }

  getFormattedDuration(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hrPart = hrs > 0 ? `${hrs} hr` : '';
    const minPart = mins > 0 ? `${mins} min` : '';
    return `${hrPart} ${minPart}`.trim();
  }
  public showTerms: boolean = false;

  toggleTerms(): void {
    this.showTerms = !this.showTerms;
  }

  onImageError(event: any) {
    event.target.src = '/assets/movie_skel.jpg';
  }

  selectedMember: any | null = null;

  openModal(member: any) {
    this.selectedMember = member;
  }

  closeModal() {
    this.selectedMember = null;
  }

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  canScrollLeft = false;
  canScrollRight = true;
  onScroll() {
    this.updateArrows();
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

  private getScrollAmount(): number {
    const card = this.scrollContainer.nativeElement.querySelector(
      '.event-card-wrapper'
    );
    const cardWidth = card?.offsetWidth || 250;
    return cardWidth * 5; // Scrolls 5 items at once
  }

  private updateArrows() {
    const el = this.scrollContainer.nativeElement;
    this.canScrollLeft = el.scrollLeft > 0;
    this.canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 10;
  }
}

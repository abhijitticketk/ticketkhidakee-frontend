import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Services/api.service';
import { CommonFunctionService } from 'src/app/Services/CommonFunctionService';
import { SeoService } from 'src/app/Services/seo.service';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-blogdetailedpage',
  templateUrl: './blogdetailedpage.component.html',
  styleUrls: ['./blogdetailedpage.component.scss'],
})
export class BlogdetailedpageComponent {
  blogId: string = '';

  retriveimgUrl = this.apiservice.retriveimgUrl;
  blogDetails: any = [];
  blogs: any = [];
  recentPosts: any = [];
  isLoading: boolean = false;
  isLoading1: boolean = false;

  blogscount: any = 0;
  movieRating: any[] = [];
  ratenowws: boolean = false;
  displayedReviews: any = [];
  comment: any;
  @ViewChild('closelogin') closelogin!: ElementRef;
  @ViewChild('closereview') closereview!: ElementRef;
  pageIndex = 1;
  pageSize = 5;
  selectedCity = this.cookie.get('cityName');

  displayedReviews1: any[] = [];
  allReviewsLoaded: boolean = false;
  reviewscount: any = 0;
  userImage: string = 'assets/images/profile-imgs/usernoimage.jpg';
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private apiservice: ApiService, public userService: CommonFunctionService,
    public cookie: CookieService, public seoService: SeoService,
    private sanitizer: DomSanitizer
  ) { }
  isMobile: Boolean = false;
  ngOnInit(): void {
    this.isMobile = this.apiservice.isMobileDevice();
    this.route.queryParams.subscribe((params) => {
      this.blogId = params['id'];
      this.getBlogList(this.blogId);
      this.recentposts();
      this.getreviewa();
      if (localStorage.getItem('memberId')) {
        this.apiservice
          .addviewwforblogapi(this.blogId)
          .subscribe(
            (data: any) => {

            },
            (error: any) => {

            }
          );

      } else {
        this.apiservice
          .addviewwforblogopen(this.blogId)
          .subscribe(
            (data: any) => {

            },
            (error: any) => {

            }
          );

      }




    });
    this.route.params.subscribe((params) => {
      // this.blogId = params['id']; // Adjust as per your routing
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Your method to fetch data
    });
  }

  loadblogs: boolean = false;
  getBlogList(blogid: any) {
    var memberfilter: any = 0;
    if (Number(localStorage.getItem('memberId')) > 0) {
      memberfilter = Number(localStorage.getItem('memberId'));
    } else {
      memberfilter = 0;
    }
    this.loadblogs = true;
    this.apiservice
      .getBlogData2(0, 0, '', '', ' AND BM.ID=' + blogid, null, null, memberfilter)
      .subscribe(
        (data) => {
          if (data?.code == 200 && data?.data?.length > 0) {
            this.loadblogs = false;

            this.blogDetails = data.data[0];

            this.setMetaTags(this.blogDetails);
            if (this.blogDetails) {
              if (this.blogDetails.DESCRIPTION) {
                const cleanedDescription = this.cleanImageStyles(this.blogDetails.DESCRIPTION);
                this.blogDetails.DESCRIPTION = this.sanitizer.bypassSecurityTrustHtml(cleanedDescription);
              }
              if (this.blogDetails.QUOTE) {
                const cleanedQuote = this.cleanImageStyles(this.blogDetails.QUOTE);
                this.blogDetails.QUOTE = this.sanitizer.bypassSecurityTrustHtml(cleanedQuote);
              }
              // IMAGE is already a string
              this.blogDetails.DEFAULT_IMAGE = this.blogDetails.IMAGE
                ? this.retriveimgUrl + 'blog/' + this.blogDetails.IMAGE
                : 'assets/default.jpg';

              this.blogDetails.CATEGORY_NAME = this.blogDetails?.CATEGORY_NAME;
              // TAGS already parsed in data — double-check and use as-is
              // if (typeof this.blogDetails.TAGS === 'string') {
              //   this.blogDetails.TAGS = this.blogDetails.TAGS
              //     ? JSON.parse(this.blogDetails.TAGS)
              //     : [];
              // }
            }
          } else {
            this.loadblogs = false;
            this.blogDetails = [];
          }
        },
        (err) => {
          this.loadblogs = false;
          this.blogDetails = [];
        }
      );
  }

  cleanImageStyles(htmlString: string): string {
    return htmlString;
  }

  ImageURL: any = this.apiservice.retriveimgUrl

  setMetaTags(data: any) {
    var metadata: any = {
      META_TITLE: data.META_TITLE ? data.META_TITLE : data.TITLE,
      META_DESCRIPTION: data.META_DESCRIPTION ? data.META_DESCRIPTION : data.TITLE,
      META_KEYWORD: data.META_KEYWORD ? data.META_KEYWORD : data.TITLE,
      ROBOTS_META_TAG: data.ROBOTS_META_TAG ? data.ROBOTS_META_TAG : 'index, follow',
      OG_TAG_TITLE: data.OG_TAG_TITLE ? data.OG_TAG_TITLE : data.TITLE,
      OG_TAG_DESCRIPTION: data.OG_TAG_DESCRIPTION ? data.OG_TAG_DESCRIPTION : data.TITLE,
      OG_TAG_IMAGE: data.OG_TAG_IMAGE ? data.OG_TAG_IMAGE : this.ImageURL + 'blog/' + data.IMAGE,
      TWITTER_CARD_TYPE: data.TWITTER_CARD_TYPE ? data.TWITTER_CARD_TYPE : 'summary_large_image'
    }

    this.seoService.updateMetaTags(metadata);
  }

  recentposts() {
    this.isLoading = true;
    this.apiservice
      .getBlogData2(1, 8, 'ID', 'desc', ' AND BM.ID !=' + this.blogId, null, null, 0)
      .subscribe(
        (data: any) => {
          if (data['code'] === 200) {
            this.blogscount = data['count'];
          } else {
            this.blogscount = 0;
          }
          if (data['code'] === 200 && data['data'].length > 0) {
            this.recentPosts = data['data'];
          } else {
            this.recentPosts = [];
            this.blogscount = 0;
          }
          this.isLoading = false;
        },
        (error: any) => {
          this.recentPosts = [];
          this.blogscount = 0;
          this.isLoading = false;
        }
      );
  }



  chunkedRatings: any[] = [
    {
      COMMENT_TEXT:
        'This article was really insightful! I learned a lot from it and it opened up new perspectives.',
      USER_PROFILE_IMAGE: 'user1.jpg',
      USER_NAME: 'John Doe',
      RATING: 5,
      BLOG_ID: 1,
    },
    {
      COMMENT_TEXT:
        'Great read, but I feel there could have been more depth in the analysis. Overall, still worth reading.',
      USER_PROFILE_IMAGE: 'user2.jpg',
      USER_NAME: 'Jane Smith',
      RATING: 4,
      BLOG_ID: 1,
    },
    {
      COMMENT_TEXT:
        'I disagree with some of the points mentioned. The author missed a few key aspects of the topic.',
      USER_PROFILE_IMAGE: 'user3.jpg',
      USER_NAME: 'Robert Brown',
      RATING: 3,
      BLOG_ID: 1,
    },
    {
      COMMENT_TEXT:
        'Not the best article I’ve read. The points were valid, but the writing felt rushed.',
      USER_PROFILE_IMAGE: 'user4.jpg',
      USER_NAME: 'Alice Johnson',
      RATING: 2,
      BLOG_ID: 1,
    },
    {
      COMMENT_TEXT:
        'This post was a fantastic read. The examples used really helped me understand the topic better.',
      USER_PROFILE_IMAGE: 'user5.jpg',
      USER_NAME: 'Emily Davis',
      RATING: 5,
      BLOG_ID: 1,
    },
  ];

  chunkArray(arr: any[], size: number): any[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }
  getStars(rating: number): number[] {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
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

  blogClick(blog: any) {
    var name: any = blog.TITLE.toLowerCase()
      .replace(/[\/\\,]+/g, '') // Remove /, \, ,
      .replace(/[^a-z0-9\s-]/g, '') // Remove other special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single one
      .trim(); // Trim leading/trailing spaces

    if (
      blog.SLUG !== undefined &&
      blog.SLUG.trim() !== '' &&
      blog.SLUG !== null
    ) {
      this.router.navigate(['blog-details/', blog.SLUG.toLowerCase()], {
        queryParams: { id: blog.ID },
      });
    } else {
      this.router.navigate(['blog-details/', name], {
        queryParams: { id: blog.ID },
      });
    }
  }
  blogClick1(blog: any) {
    var name: any = blog.TITLE.toLowerCase()
      .replace(/[\/\\,]+/g, '') // Remove /, \, ,
      .replace(/[^a-z0-9\s-]/g, '') // Remove other special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single one
      .trim(); // Trim leading/trailing spaces

    return name;
  }
  currentUrl: string = window.location.href;

  copyToClipboard() {
    navigator.clipboard.writeText(this.currentUrl).then(() => {
      this.toastr.success('Link copied to clipboard!');
    });
  }

  ratenoww() {
    if (
      localStorage.getItem('memberId') === null ||
      localStorage.getItem('memberId') === undefined ||
      localStorage.getItem('memberId') === '0' ||
      localStorage.getItem('memberId') === ''
    ) {
      this.showLoginModal();
    } else {
      this.comment = '';
      var d = document.getElementById('ratenowmodaltrackss') as HTMLElement;
      d.click();
    }
  }

  showLoginModal() {
    var d: any = document.getElementById('loginmodaltrack') as HTMLElement;
    d.click();
  }

  openlogin() {
    this.closelogin.nativeElement.click();
    this.router.navigate(['/sign-in']);
  }

  getEventRouterLink(event: any) {


    this.router.navigate(['/explore', this.selectedCity, event.CATEGORY_NAME, event.EVENT_SLUG, event._id]);
    // { path: ':city/:categorytype/:slug/:id/:playtype', component: PlaysDetailsComponent },
  }


  getreviewa() {
    if (this.isLoading1 || this.allReviewsLoaded) return;

    this.isLoading1 = true;
    this.apiservice
      .getblogCommentMapping(
        this.pageIndex,
        this.pageSize,
        '',
        'desc',
        " AND STATUS=1 AND IS_VISIBLE=1 AND BLOG_ID='" + this.blogId + "'"
      )
      .subscribe(
        (data: any) => {
          if (data['code'] === 200) {
            this.reviewscount = data['count'];

          } else {
            this.reviewscount = 0;
          }
          if (data['code'] === 200 && data['data'].length > 0) {
            this.isLoading1 = false;
            this.blogDetails.COMMENT_COUNT = this.reviewscount;
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
          this.isLoading1 = false;
        },
        (error: any) => {
          this.reviewscount = 0;
          this.allReviewsLoaded = true;
          this.isLoading1 = false;
        }
      );
  }

  onScroll(event: any) {
    const element = event.target;
    const threshold = 100; // pixels from bottom before triggering load

    if (
      element.scrollHeight - element.scrollTop - element.clientHeight <
      threshold &&
      !this.isLoading1 &&
      !this.allReviewsLoaded
    ) {
      this.pageIndex++;
      this.getreviewa();
    }
  }
  formatComment(comment: string): string {
    if (!comment) return '';
    return comment.replace(/(#\w+)/g, '<strong>$1</strong>');
  }

  submitFeedback() {
    if (
      this.comment === null ||
      this.comment === undefined ||
      this.comment.trim() === ''
    ) {
      this.toastr.error('Please add some comments');
    } else {
      const body = {
        MEMBER_ID: Number(localStorage.getItem('memberId')),
        BLOG_ID: Number(this.blogId),
        COMMENT_TEXT: this.comment,
        STATUS: true,
      };
      this.ratenowws = true;
      this.apiservice.blogCommentMappingcreate(body).subscribe(
        (response) => {
          if (response.code === 200) {
            this.ratenowws = false;
            // this.toastr.success('Comment added successfully', '');
            this.displayedReviews = [];
            this.pageIndex = 1;
            this.pageSize = 4;
            this.allReviewsLoaded = false;
            this.getreviewa();
            this.closereview.nativeElement.click();
          } else if (response['code'] === 303 || response.message == 'Invalid token') {
            this.allReviewsLoaded = false;
            this.signOut()
          } else {
            this.ratenowws = false;
            this.toastr.error('Failed to submit comment', '');
          }
        },
        (error) => {
          this.ratenowws = false;
          this.toastr.error('Something went wrong. Please try again.');
        }
      );
    }
  }

  eventredirection(blogData: any) {
    if (
      blogData.EVENT_ID !== null &&
      blogData.EVENT_ID !== undefined &&
      blogData.EVENT_ID !== ''
    ) {
      this.router.navigate(['explore/', this.selectedCity, blogData.EVENT_DETAILS.CATEGORY_NAME, blogData.EVENT_DETAILS.SLUG, blogData.EVENT_ID]);
    }
  }

  reviewload: boolean = false;
  reviewload1: boolean = false;

  ReviewLikes() {
    if (
      localStorage.getItem('memberId') === null ||
      localStorage.getItem('memberId') === undefined ||
      localStorage.getItem('memberId') === '0' ||
      localStorage.getItem('memberId') === ''
    ) {
      this.showLoginModal();
    } else {
      this.reviewload = true;
      var interestdata: any = {
        MEMBER_ID: Number(localStorage.getItem('memberId')),
        BLOG_ID: this.blogId,
        STATUS: this.blogDetails['LIKE_STATUS'] === 1 ? 0 : 1,
        CLIENT_ID: 1,
      };

      this.apiservice.blogLikeMappingCreate(interestdata).subscribe(
        (data: any) => {
          if (data['code'] === 200) {
            this.reviewload = false;
            var messagess = 'You liked to this blog';
            if (this.blogDetails['LIKE_STATUS'] == 1) {
              messagess = 'You disliked this blog';
            } else {
              messagess = 'You liked this blog';
            }
            this.toastr.success(messagess);
            this.getBlogList(this.blogId);
          } else if (data['code'] === 303 || data.message == 'Invalid token') {
            this.reviewload = false;
            this.signOut()
          } else {
            this.reviewload = false;
            this.toastr.error('Something went wrong, please try again later.');
          }
        },
        (err) => {
          this.reviewload = false;
          this.toastr.error('Something went wrong, please try again later.');
        }
      );
    }
  }

  formatLikesCount(count: number): string {
    if (!count || count === 0) return '0';
    if (count < 1000) return count.toString();

    const suffixes = ['K', 'M', 'B', 'T'];
    const i = Math.floor(Math.log10(count) / 3);
    const shortValue = (count / Math.pow(1000, i)).toFixed(1);

    return `${shortValue}${suffixes[i - 1]}`;
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


  /**
   * Handles dynamic CTA button click.
   * Uses Angular Router for internal links, window.open() for external links.
   */
  onButtonClick(url: string): void {
    if (!url) return;

    const trimmedUrl = url.trim();

    // External URL (starts with http:// or https://)
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      window.open(trimmedUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Internal route — use Angular Router
      this.router.navigateByUrl(trimmedUrl);
    }
  }

}

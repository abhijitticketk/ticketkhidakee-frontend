import { Component, HostListener, OnInit } from '@angular/core';
import { LoaderService } from './Services/loader.service';
import { ActivatedRoute, NavigationEnd, Router, Event, NavigationStart } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from './Services/api.service';
import { DatePipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
declare const bootstrap: any;
declare let gtag: Function;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Ticket khidkee';
  isLoading$ = this.loaderService.isLoading$;
  showFooter = true;
  hideFooter: boolean = false;


  constructor(
    private loaderService: LoaderService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private datePipe: DatePipe,
    private cookie: CookieService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);

        // const currentUrl = event.urlAfterRedirects;
        // const isBuyTicketsPresent = currentUrl.includes('buy-tickets');
        // if (!isBuyTicketsPresent) {
        //   const modal = new bootstrap.Modal(document.getElementById('openad')!);
        //   modal.show();
        // }

      }
    });
  }


  // Scroll to anchor or top
  // ngOnInit() {
  //   this.router.events
  //     .pipe(
  //       filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
  //     )
  //     .subscribe((event: NavigationEnd) => {
  //       // Hide footer for specific routes
  //       const hiddenRoutes = ['/sign-in'];
  //       this.showFooter = !hiddenRoutes.includes(event.urlAfterRedirects);

  //       // Scroll logic
  //       const fragment = this.activatedRoute.snapshot.fragment;
  //       if (fragment) {
  //         const element = document.getElementById(fragment);
  //         if (element) {
  //           element.scrollIntoView({ behavior: 'smooth' });
  //         }
  //       } else {
  //         window.scrollTo(0, 0);
  //       }
  //     });

  //     // this.loaderService.show(); // Show loader


  //     // setTimeout(() => {
  //     //   this.loaderService.hide(); // Hide loader on error


  //     // }, 2000);
  // }

  // ngOnInit() {
  //   this.router.events.subscribe((event: Event) => {
  //     if (event instanceof NavigationEnd) {
  //       // Hide footer for specific routes
  //       const hiddenRoutes = ['/sign-in'];
  //       this.showFooter = !hiddenRoutes.includes(event.urlAfterRedirects);

  //       // Scroll to top or anchor
  //       const fragment = this.activatedRoute.snapshot.fragment;
  //       if (fragment) {
  //         const element = document.getElementById(fragment);
  //         if (element) {
  //           element.scrollIntoView({ behavior: 'smooth' });
  //         }
  //       } else {
  //         window.scrollTo(0, 0);
  //       }

  //       // Hide loader after navigation
  //       this.loaderService.hide();
  //     } else if (event instanceof NavigationEnd) {
  //       this.loaderService.hide();
  //     } else if (event instanceof NavigationStart) {
  //       this.loaderService.show();
  //     }
  //   });
  // }
  isOnline = true;
  showReconnected = false;
  hidefooteronly = true;
  IsMobile = false
  isFirstNavigationDone = false;
  hidefooterforbooking = false
  cityname: any
  ngOnInit() {
    // Initialize user data for local development (match production guest structure)
    if (!localStorage.getItem('deviceId')) {
      localStorage.setItem('deviceId', this.generateDeviceId());
    }
    if (!localStorage.getItem('IS_GUEST')) {
      localStorage.setItem('IS_GUEST', 'false');
    }
    if (!localStorage.getItem('IS_MEMBER')) {
      localStorage.setItem('IS_MEMBER', 'N');
    }

    // if (!isBuyTicketsPresent || !exactHiddenRoutes2.includes(currentUrl1)) {

    // } 
    // this.detectDevToolsOverlay();

    this.IsMobile = this.apiService.isMobileDevice();

    this.isOnline = navigator.onLine;

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showReconnected = false;
    });

    window.addEventListener('online', () => {
      this.showReconnected = true;
      setTimeout(() => {
        location.reload();
      }, 2000);
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        gtag('config', 'G-P23GHYM37N', {
          page_path: event.urlAfterRedirects
        });
      }
    });



    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.loaderService.show(); // Loader immediately on navigation start
      }

      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;
        const currentUrl1 = event.urlAfterRedirects.split('?')[0];

        // Footer visibility
        const exactHiddenRoutes = ['/sign-in'];
        const exactHiddenRoutes1 = ['book-common-page'];
        // const exactHiddenRoutes4 = ['buy-tickets'];
        const exactHiddenRoutes2 = ['/myticket'];
        const exactHiddenRoutes3 = ['/planreceipt'];
        const dynamicPattern = /^\/explore\/[^\/]+\/plays\/[^\/]+\/buy-tickets\/[^\/]+$/;
        // const isBuyTicketsPresent = currentUrl.includes('buy-tickets');
        // Footer logic
        this.showFooter = !(
          exactHiddenRoutes.includes(currentUrl) || exactHiddenRoutes2.includes(currentUrl1) || exactHiddenRoutes3.includes(currentUrl1)
        );
        if (!this.isFirstNavigationDone) {
          // const isBuyTicketsOnPageLoad = currentUrl.includes('buy-tickets');
          // const isBuyTicketsOnPageLoad1 = currentUrl.includes('myticket');
          if (currentUrl === '/' || currentUrl === '/home') {
            this.getsubcriptiondata1()
          }
          // if (!isBuyTicketsOnPageLoad && !isBuyTicketsOnPageLoad1) {
          //   this.getsubcriptiondata1()
          // }

          this.isFirstNavigationDone = true;
        }

        this.hideFooter = !(
          exactHiddenRoutes1.includes(currentUrl) || dynamicPattern.test(currentUrl)
        );

        this.hidefooteronly = !(
          exactHiddenRoutes2.includes(currentUrl1) || currentUrl.includes('buy-tickets') || currentUrl.includes('planreceipt')
        );

        // Scroll to anchor or top
        const fragment = this.activatedRoute.snapshot.fragment;
        if (fragment) {
          const element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          window.scrollTo(0, 0);
        }

        // Hide loader after content is ready
        this.loaderService.hide();
      }
    });
    this.cityname = this.cookie.get('cityName')
  }

  routeeee() {

    this.modal.hide();

    this.router.navigate(['/explore', this.cityname, this.bannerdata.CATEGORY_NAME, this.bannerdata.EVENT_SLUG, this.bannerdata.EVENT_ID]);
  }

  bannerdata: any
  addimgURL: any

  TITLE: any;
  modal: any;
  getsubcriptiondata1() {
    const now = new Date();
    const CURRENT_TIME = this.datePipe.transform(now, 'HH:mm:ss')
    var TODAY_DATE = this.datePipe.transform(now, 'yyyy-MM-dd');

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownValue = undefined;
    }

    this.route.queryParams.subscribe(params => {
      var isGuest = params['guest'] === 'true';
      if (isGuest == true) {

      } else {
        this.apiService
          .getAdBannerMaster(
            1,
            1,
            'SEQ_NO',
            'asc',
            TODAY_DATE,
            CURRENT_TIME


          )
          .subscribe(
            (data: any) => {
              if (data['code'] === 200 && data['data'] != null) {
                // this.TITLE = data['data'][0].TITLE;
                if (this.IsMobile) {
                  this.addimgURL = this.apiService.retriveimgUrl + 'advertiseBannerImages/' + data['data'].IMAGE_FOR_MOBILE
                } else {
                  this.addimgURL = this.apiService.retriveimgUrl + 'advertiseBannerImages/' + data['data'].IMAGE_FOR_DESKTOP
                }

                this.bannerdata = data['data'];
                //console.log(this.bannerdata)
                this.modal = new bootstrap.Modal(document.getElementById('openad')!);
                this.modal.show();

                // if (this.bannerdata?.CLOSING_SECONDS > 0) {
                //   setTimeout(() => {
                //     this.modal.hide();
                //   }, this.bannerdata.CLOSING_SECONDS * 1000);
                // } else {
                //   setTimeout(() => {
                //     this.modal.hide();
                //   }, 5000);
                // }

                let closingSeconds = this.bannerdata?.CLOSING_SECONDS > 0 ? this.bannerdata.CLOSING_SECONDS : 5;

                // ORIGINAL MODAL CLOSURE LOGIC (SetTimeout)
                setTimeout(() => {
                  this.modal.hide();
                }, closingSeconds * 1000);

                // VISUAL COUNTDOWN LOGIC (SetInterval for view updates)
                this.countdownValue = closingSeconds;
                this.countdownTimer = setInterval(() => {
                  if (this.countdownValue !== undefined && this.countdownValue > 0) {
                    this.countdownValue--;
                    if (this.countdownValue <= 0) {
                      clearInterval(this.countdownTimer);
                      this.countdownValue = undefined;
                    }
                  }
                }, 1000);

              } else {
              }
            });
      }
    });

  }

  countdownValue: number | undefined;
  private countdownTimer: any;
  getTimerBackgroundColor(): string {
    if (this.countdownValue === undefined) {
      return 'rgba(0, 0, 0, 0.6)';
    } else if (this.countdownValue <= 3) {
      return '#dc3545';
    } else if (this.countdownValue <= 6) {
      return '#ffc107';
    } else {
      return 'rgba(0, 0, 0, 0.6)';
    }
  }


  // // 1️⃣ Disable right-click
  // @HostListener('document:contextmenu', ['$event'])
  // onRightClick(event: MouseEvent) {
  //   console.log(event);
  //   event.preventDefault();
  //   // alert('Right-click is disabled.');
  // }

  // // 2️⃣ Disable keyboard shortcuts
  // @HostListener('document:keydown', ['$event'])
  // onKeyDown(event: KeyboardEvent) {
  //   console.log(event.key);
  //   if (
  //     event.key === 'F12' ||
  //     (event.ctrlKey && event.shiftKey && (event.key.toLowerCase() === 'i' || event.key.toLowerCase() === 'j')) ||
  //     (event.ctrlKey && event.key.toLowerCase() === 'u')
  //   ) {
  //     event.preventDefault();
  //     // alert('This action is disabled.');
  //   }
  // }
  devToolsOpen: any=false;
  // 3️⃣ Detect DevTools and lock page
  detectDevToolsOverlay() {
    const threshold = 160; // width/height diff for detection
    setInterval(() => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      if (widthDiff > threshold || heightDiff > threshold) {
        if (!this.devToolsOpen) {
          this.devToolsOpen = true;
          this.showOverlay();
          // location.reload();
        }
      } else {
        if (this.devToolsOpen) {
          this.devToolsOpen = false;
          this.hideOverlay();
        }
      }
    }, 500); // check every 0.5s
  }

   showOverlay() {
    let overlay = document.getElementById('devtools-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'devtools-overlay';
      Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        zIndex: '999999',
        pointerEvents: 'all', // block clicks
        userSelect: 'none', // block text selection
      });
      overlay.innerText = 'DevTools detected. Close DevTools to continue.';
      document.body.appendChild(overlay);

      // Prevent scrolling
      document.body.style.overflow = 'hidden';

      // Prevent tab/focus on underlying elements
      overlay.tabIndex = -1;
      overlay.focus();
    }
    overlay.style.display = 'flex';
  }

  hideOverlay() {
    const overlay = document.getElementById('devtools-overlay');
    if (overlay) {
      overlay.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  generateDeviceId(): string {
    // Generate a unique device ID for development
    return 'dev-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  }
}

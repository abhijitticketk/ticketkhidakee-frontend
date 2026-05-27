import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonFunctionService } from 'src/app/Services/CommonFunctionService';
import { CookieService } from 'ngx-cookie-service';
import { NgForm } from '@angular/forms';
import { ApiService } from 'src/app/Services/api.service';
import { ToastrService } from 'ngx-toastr';
declare const bootstrap: any; // Declare bootstrap variable

declare const google: any;
import { DatePipe } from '@angular/common'; // Import the DatePipe
import { HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from 'src/app/Services/user.service';
import { LoaderService } from 'src/app/Services/loader.service';
import { DomSanitizer, Meta, SafeUrl, Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { ImageService } from 'src/app/Services/image.service';
import { BehaviorSubject } from 'rxjs';
import { ReCaptcha2Component } from 'ngx-captcha';

export class UserData {
  NAME: string = 'John';
  EMAIL_ID: string = 'Johndoe@example.com';
  MOBILE_NO: string = '';
  PASSWORD: string = '';
  BIRTH_DATE: string = '';
  GENDER: string = ''; // Set to an empty string to show placeholder initially
  MARITAL_STATUS: string = '';
  PROFILE_IMAGE: string = '';
  PREFERED_LANGUAGES: any[] = [];
  LOCATION: string = '';
  profileImage: string = '';  // This will come from API
  defaultImage: string = '/assets/images/Back-1.jpg'; // Your fallback image

  STATUS: number = 1;
  IS_MOBILE_VERIFIED: number = 0;
  IS_EMAIL_VERIFIED: number = 0;
  SOCIAL_LOGIN_TYPE: string = '';
  SOCIAL_LOGIN_ID: string = '';
  LONGITUDE: string = '';
  LATITUDE: string = '';
  ADDRESS_LINE_1: string = '';
  ADDRESS_LINE_2: string = '';
  CITY: string = '';
  CITY_ID: any;
  PINCODE: string = '';
  PREFERED_GENRES: any[] = [];
  PREFERED_CATEGORIES: any[] = [];
}

export class MemberEmailPreferences {
  MEMBER_ID!: number;
  BOOKING_CONFIRMATION: any = 1;
  EVENT_REMINDERS: any = 1;
  ORGANIZER_COMMUNICATION: any = 1;
  ORGANIZER_INVITATION: any = 1;
  EVENT_CANCELLATION_POSTPONE: any = 1;
  TICKET_DOWNLOAD_LINK: any = 1;
  PAYMENT_FAILURE_FOLLOWUP: any = 1;
  NEWSLETTER_OPTION: any = 1;
  OFFER_DISCOUNT: any = 1;
  UPCOMING_EVENT: any = 1;
  FEEDBACK_REQUEST: any = 1;
  LAST_UPDATED_DATETIME: any;
}
export class MemberPushPreferences {
  MEMBER_ID!: number;
  BOOKING_CONFIRMATION: boolean = true;
  EVENT_REMINDER: boolean = true;
  PAYMENT_FAILURE_ALERT: boolean = true;
  EVENT_CHANGE_NOTIFICATION: boolean = true;
  PROMOTION_OFFERS: boolean = true;
  // LAST_UPDATED_DATETIME
}
export class MemberInAppPreferences {
  MEMBER_ID!: number;
  BOOKING_STATUS: boolean = true;
  EVENT_REMINDER: boolean = true;
  PAYMENT_FOLLOWUP: boolean = true;
  EVENT_ANNOUNCEMENT_CHANGES: boolean = true;
  PROMO_ALERTS: boolean = true;
  FEEDBACK_REQUEST: boolean = true;
  INVITE_FROM_ORGANIZER: boolean = true;
  // LAST_UPDATED_DATETIME
}

@Component({
  selector: 'app-myprofilepage',
  templateUrl: './myprofilepage.component.html',
  styleUrls: ['./myprofilepage.component.scss'],
})
export class MyprofilepageComponent {
  cities = ['Mumbai', 'Pune', 'Nagpur', 'Nashik'];
  preferredLanguages: any = '';
  preferredGenres: any = '';
  preferredCategories: any = '';
  mapDraweVisible: boolean = false;
  user: any = new UserData();
  isLoggedIn: boolean = false;
  userName: string = '';
  userEmail: string = '';
  userImage: string = 'assets/images/profile-imgs/usernoimage.jpg';
  isVerified: boolean = false;
  userBio: string = '';
  userAddress: string = '';
  mapOptions: any;
  maps: any;
  marker: any;
  mapss: any;
  markers: any;
  map2: any;
  selectedLocation: any;
  maxBirthDate: string;
  IMAGEuRL = this.api.retriveimgUrl;
  emailPreferenceData: any = [];
  pushPreferenceData: any = [];
  inAppPreferencesData: any = [];
  isUploading: boolean = false;
  progressPercent: number = 0;
  imagePreview: any = null;

  activeTab: string = 'feed';
  isMobile: boolean = false;
  backToMenu() {
    this.showcontent = false
    this.activeTab = ''
  }
  activateTab(tabId: string) {
    this.activeTab = tabId;
    if (this.activeTab != 'log_out') {
      this.showcontent = true
    }

    if (this.activeTab == 'about') {
      this.editdetails();
    }
    if (this.activeTab == 'feed') {
      // this.editdetails();
      // this.fetchAllWishlistData();
      this.getupcomingBookings(true);
    }
    if (this.activeTab == 'orders') {
      // this.editdetails();
      // this.fetchAllWishlistData();
      this.getpastOrders(true);
    }
    if (this.activeTab == 'membership') {
      this.getsubcriptiondata();

    }

    if (this.activeTab == 'wishlist') {
      // this.editdetails();
      this.fetchAllWishlistData(true);
    }
    if (this.activeTab == 'setting') {
      // this.editdetails();

      this.SettingTab();
    }
    if (this.activeTab == 'terms&condn') {
      // this.editdetails();

      this.getTermsConditions();
    }
    if (this.activeTab == 'log_out') {
      this.activeTab = 'log_out';
    }
    if (this.activeTab == 'view') {
      this.activeTab = 'view';

    }

  }

  currentDate = new Date();
  formattedDate = this.currentDate.toISOString().split('T')[0];


  menuItems: any = [
    { label: 'My Orders', key: 'feed', icon: 'fa-solid fa-house' },
    { label: 'Profile', key: 'about', icon: 'fa-solid fa-circle-user' },
    { label: 'Notification', key: 'setting', icon: 'fa-solid fa-gear' },
    { label: 'My Membership', key: 'membership', icon: 'fa-solid fa-box' },
    { label: 'Privacy Policy', key: 'privacy', icon: 'fa-solid fa-user-shield' },
    { label: 'Terms & Conditions', key: 'terms&condn', icon: 'fa-solid fa-file-contract' },
    { label: 'About Ticket', key: 'ticket', icon: 'fa-solid fa-ticket' },
    { label: 'Need Help', key: 'faq', icon: 'fa-solid fa-circle-info' },
    { label: 'Sign Out', key: 'log_out', icon: 'fa-solid fa-sign-out-alt' }
  ];

  bottomMenuItems: any[] = []; // first 4
  moreItems: any[] = [];       // rest
  isMoreOpen = false;
  pageIndex = 1;
  pageSize = 10;
  filter: any;
  feedData: any = [];
  pastOrderData: any = [];
  feedDatacount: any = 0
  getupcomingBookings(condition: boolean = false) {
    // this.filter = { USER_ID: this.userID } ;
    // this.filter = {USER_ID: this.userID};
    if (condition) {
      this.pageIndex = 1;
      this.pageSize = 10;
      this.feedData = []; // ✅ Clear old data on fresh load
      this.searchLoading = true;
      this.allTagsLoaded = false;
    } else {

    }
    // this.filter = {
    //   USER_ID: this.userID,
    //   SHOW_DATE: { $gt: this.formattedDate }
    // };

    // this.filter = ' AND SHOW_DATE >= "' + this.formattedDate + '" AND USER_ID = "' + this.userID + '"';
    this.filter = " AND USER_ID = " + this.userID;


    // ✅ Start loader

    // this.isLoading1 = true;
    this.api
      .getupcomingBookings(
        this.pageIndex,
        this.pageSize,
        this.filter

      )
      .subscribe(
        (data: any) => {
          // this.searchLoading = true;
          if (data['code'] === 200) {
            this.searchLoading = false;
            this.searchLoadingformore = false;
            this.feedDatacount = data['count'];
            const newData = data['data'];
            this.feedData = [...this.feedData, ...newData];
            if (newData.length < this.pageSize) {
              this.allTagsLoaded = true;
            }
            this.searchLoading = false;

          } else if (data['code'] === 303 || data.message == 'Invalid token'
          ) {
            this.signOut();
          } else {
            // this.reviewscount = 0;
            // this.allReviewsLoaded = true;
          }
          // this.isLoading1 = false;
        },

      );
  }

  isUpcoming(event: any): boolean {
    const dateStr: any = event.SHOW_DATE;
    const timeStr: any = event.SHOW_TIME;
    const dateTimeStr: any = `${dateStr} ${timeStr}`;

    const eventDate: any = new Date(dateTimeStr);
    const now: any = new Date();

    return eventDate > now;
  }

  pageIndex11 = 1
  pageSize22 = 20
  getpastOrders(condition: boolean = false) {

    if (condition) {
      this.pageIndex11 = 1
      this.pageSize22 = 20
      this.pastOrderData = []
      this.searchLoading = true
    }


    // this.filter = {
    //   USER_ID: this.userID,
    //   SHOW_DATE: { $lt: this.formattedDate }
    // };

    this.filter = ' AND SHOW_DATE <= "' + this.formattedDate + '" AND USER_ID = "' + this.userID + '"';

    // this.isLoading1 = true;
    this.api
      .getpastOrders(
        this.pageIndex11,
        this.pageSize22,

        // " AND USER_ID = " + this.userID
        this.filter

      )
      .subscribe(
        (data: any) => {

          if (data['code'] === 200) {
            this.searchLoading = false;
            this.searchLoadingformore = false;
            this.pastOrderDatacount = data['count'];
            const newData = data['data'];
            this.pastOrderData = [...this.pastOrderData, ...newData];
          } else {

          }

        },

      );
  }

  pastOrderDatacount: any = 0

  Cities: any[] = [];
  genres: any[] = [];
  languages: any[] = [];
  categories: any[] = [];
  userData: any = [];
  isGenresLoading: boolean = false;
  isLanguagesLoading: boolean = false;
  isCategoriesLoading: boolean = false;
  isCityLoading: boolean = false;
  userID: any = this.userService.getUserId();
  constructor(
    private datePipe: DatePipe,
    private cookie: CookieService,
    private userService: CommonFunctionService,
    private api: ApiService,
    private message: ToastrService,
    private router: Router,
    private loaderService: LoaderService,
    private sanitizer: DomSanitizer,
    private imageService: ImageService,
    private title: Title
  ) {
    const today = new Date();
    const year = today.getFullYear() - 14;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.maxBirthDate = `${year}-${month}-${day}`;
  }
  retriveimgUrl = this.api.retriveimgUrl;

  countryCodes = this.userService.countryCodes;
  memberId: any;
  // ngOnInit(): void {
  //   this.isLoggedIn = this.cookie.get('token') !== '';
  //   this.memberId = localStorage.getItem('memberId');
  //   if (!this.memberId) {
  //     this.router.navigate(['/home']);
  //     // this.otp = ['', '', '', '', '', ''];
  //   } else {
  //     this.getUserList();
  //     // this.getallwishlistdata()
  //     this.IMAGEuRL = this.api.retriveimgUrl;
  //   }

  //   if (this.isLoggedIn) {
  //     this.isVerified = sessionStorage.getItem('isVerified') === 'true';
  //   }
  // }
  formattedBirthDate: string = '';
  ngOnInit(): void {
    const token = this.cookie.get('token');
    this.isLoggedIn = token !== '';
    this.isMobile = this.api.isMobileDevice();
    this.memberId = localStorage.getItem('memberId');
    this.bottomMenuItems = this.menuItems.slice(0, 4);
    this.moreItems = this.menuItems.slice(4);
    if (this.isLoggedIn) {
      this.userName = this.userService.getUserName() || 'Guest';
      this.userEmail = this.userService.getUserEmail() || 'guest@example.com';
      this.getupcomingBookings(true)
    }

    if (!this.isLoggedIn) {
      // Clear all storage and cookies
      this.cookie.deleteAll();
      sessionStorage.clear();
      localStorage.clear();

      // Show success message and redirect
      this.message.success('You have successfully logged out!', 'Success');

      this.router.navigate(['/home']).then(() => {
        window.location.reload();
      });
      return; // Prevent further execution
    }

    if (!this.memberId) {
      this.router.navigate(['/home']);
    } else {
      this.getUserList();
      // this.activateTab('feed')
      // this.getallwishlistdata()
      this.IMAGEuRL = this.api.retriveimgUrl;
    }

    this.isVerified = sessionStorage.getItem('isVerified') === 'true';
    const today = new Date();
    this.maxBirthDate = today.toISOString().split('T')[0]; // Set max date to today

    if (this.user.BIRTH_DATE) {
      this.formatDate(this.user.BIRTH_DATE);
    }

    this.updateMetaTags()
    // this.getplans();
  }


  plansData: any = [];



  subcribedata: any = []
  planwithsubdata: any = []
  subscribedPlans: any = []
  getplans() {
    this.searchLoading = true; // Start loader
    this.api.getplans1(this.pageIndex, this.pageSize, 'SEQ_NO',
      'asc', '')
      .subscribe(
        (data: any) => {
          if (data['code'] === 200) {
            if (this.userID) {
              this.plansData = data["data"];
              // this.getsubcriptiondata(); // Fetch subscriptions if logged in
            } else {
              this.planwithsubdata = data["data"];
              // For logged out users, ensure isSubscribed is false by default
              this.planwithsubdata = this.planwithsubdata.map((plan: any) => ({ ...plan, isSubscribed: false }));
            }
          } else {
            // Handle error or empty data
            this.planwithsubdata = []; // Clear plans on error
          }
          this.searchLoading = false; // End loader
        },
        (error) => {
          this.searchLoading = false; // End loader on error
          this.planwithsubdata = []; // Clear plans on error
        }
      );
  }

  openLogin(plan: any) {
    if (!this.userID) {
      this.openLoginModal()
    } else {
    }
  }

  getsubcriptiondata() {
    // No need for a separate loader here if getplans already handles it for the whole section
    this.api.getMembershipSummary({ USER_ID: this.userID })
      .subscribe(
        (data: any) => {
          if (data['code'] === 200 && this.userID) {
            this.subcribedata = data["data"];

            // this.subscribedPlans = this.plansData.filter((plan: any) =>
            //   this.subcribedata.some((sub: any) => sub.PLAN_ID === plan.ID)
            // );

            // this.planwithsubdata = this.plansData
            //   .filter((plan: any) =>
            //     this.subcribedata.some((sub: any) => sub.PLAN_ID === plan.ID)
            //   )
            //   .map((plan: any) => ({
            //     ...plan,
            //     isSubscribed: true
            //   }));
          } else {
            // Handle error or no subscriptions found
            console.warn('No subscriptions found or error fetching subscriptions.');
            // Ensure plans still show, but none are marked subscribed if there's an issue with subs data
            // this.planwithsubdata = this.plansData.map((plan: any) => ({ ...plan, isSubscribed: false }));
          }
        },
        (error) => {
          console.error('Error fetching subscriptions:', error);
          // Fallback: show plans as if no subscriptions are found
          // this.planwithsubdata = this.plansData.map((plan: any) => ({ ...plan, isSubscribed: false }));
        }
      );
  }

  formatDate(dateStr: string) {
    const date = new Date(dateStr);
    this.formattedBirthDate = formatDate(date, 'dd / MMM / yyyy', 'en-US');
  }

  SettingTab() {
    this.getEmailPreferencesById(this.memberId);
    // this.getPushPreferencesById(this.memberId);
    // this.getSmsPreferencesById(this.memberId);
    // this.getWhatsappPreferencesById(this.memberId);

    // this.getInAppPreferencesById(this.memberId);
  }
  Email() {
    this.getEmailPreferencesById(this.memberId);
  }

  WhatsApp() {
    this.getWhatsappPreferencesById(this.memberId);
  }
  sms() {
    this.getSmsPreferencesById(this.memberId);
  }
  pushnotification() {
    this.getPushPreferencesById(this.memberId);
  }


  isLoading1: boolean = false;
  allTagsLoaded: boolean = false;



  searchLoadingformore: boolean = false
  onbookingScroll(event: any): void {
    if (this.searchLoading || this.searchLoadingformore) return;

    const element = event.target;
    const threshold = 100;

    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    if (this.activeTab == 'feed') {
      if ((distanceFromBottom < threshold) && (this.feedData.length < this.feedDatacount)) {
        this.searchLoadingformore = true
        this.isLoading1 = true;
        this.pageIndex++;
        this.getupcomingBookings();
      }
    } else if (this.activeTab == 'orders') {




      if ((distanceFromBottom < threshold) && (this.pastOrderData.length < this.pastOrderDatacount)) {
        this.searchLoadingformore = true
        this.isLoading1 = true;
        this.pageIndex11++;
        this.getpastOrders();
      }
    } else if (this.activeTab == 'view') {
      if ((distanceFromBottom < threshold) && (this.PlanDetails.length < this.planDatacount)) {
        this.searchLoadingformore = true
        this.isLoading1 = true;
        this.pageindexforlist++;
        this.getmembershipdetails(false, this.plandataaaaa);
      }
    }

  }


  onwishlistScroll(event: any): void {
    if (this.filteredWishlistItems.length <= 10) return;

    const element = event.target;
    const threshold = 100;

    if (
      element.scrollHeight - element.scrollTop - element.clientHeight < threshold &&
      !this.isLoading1 &&
      !this.allTagsLoaded
    ) {
      this.isLoading1 = true;
      this.wishlistPageIndex++;

      this.fetchAllWishlistData(false); // 📥 Will handle appending and setting flags
    }
  }









  // ---------------------------------------------- File Upload Code  ------------------------------------------------
  imageChangedEvent: any = '';
  croppedImageBlob: Blob | null | any = null; // This will hold the cropped image
  croppedImageUrl: any; // To hold the sanitized URL
  showCropper: boolean = false;
  selectedFileName: string = '';
  modalInstance: any;
  isModalInitialized: boolean = false; // Flag to track modal initialization
  safeCroppedImageUrl: SafeUrl | null = null;
  croppedImageBase64: string = '';

  // croppedImageUrl: any; // To hold the sanitized URL
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.selectedFileName = file.name;
    this.imageChangedEvent = event;

    setTimeout(() => {
      const modalEl = document.getElementById('croppermodalopen');
      if (modalEl) {
        this.modalInstance = new bootstrap.Modal(modalEl);
        this.modalInstance.show();
      }
    }, 100);
  }

  triggerFileInput(): void {
    const input: HTMLElement | null =
      document.querySelector('input[type="file"]');
    if (input) input.click();
  }

  openCropperModal(): void {
    const modalEl = document.getElementById('croppermodalopen');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }
  onImageCropped(event: any): void {
    if (event.base64) {
      this.croppedImageBase64 = event.base64; // ✅ Set this
      this.safeCroppedImageUrl = this.sanitizer.bypassSecurityTrustUrl(
        event.base64
      );
      this.croppedImageBlob = event.base64;
    } else {
      this.safeCroppedImageUrl = null;
      this.croppedImageBlob = null;
      this.croppedImageBase64 = '';
    }
  }

  setSafeImageUrl(): void {
    if (this.croppedImageBlob) {
      const objectUrl = URL.createObjectURL(this.croppedImageBlob);
      this.safeCroppedImageUrl =
        this.sanitizer.bypassSecurityTrustUrl(objectUrl);
    }
  }

  confirmCrop(): void {
    if (!this.croppedImageBase64) {
      this.message.error('No image cropped.', '');
      return;
    }

    const fileName = this.generateUniqueFilename('cropped.png'); // or from original name if needed
    const file = this.base64ToFile(this.croppedImageBase64, fileName);

    this.uploadFileToServer(file, fileName);
  }

  base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  cancelCrop() {
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;
    this.showCropper = false;
    if (this.modalInstance) {
      this.modalInstance.hide(); // Hide modal cleanly
    }
  }

  //
  uploadeFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      this.message.error('Only JPG, JPEG, PNG files are allowed.', '');
      return;
    }

    if (file.size > maxSize) {
      this.message.error('File size should not exceed 5MB.', '');
      return;
    }

    const fileName = this.generateUniqueFilename(file.name);
    // this.previewImage(file);
    this.uploadFileToServer(file, fileName);
  }
oldname='';
  generateUniqueFilename(originalName: string): string {
    this.oldname = this.userData[0]['PROFILE_IMAGE']!=undefined && this.userData[0]['PROFILE_IMAGE']!=null?this.userData[0]['PROFILE_IMAGE']:'';
    const ext = originalName.split('.').pop();
    const random = Math.floor(100000 + Math.random() * 900000);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `${date}_${random}.${ext}`;
  }

  uploadFileToServer(file: File, filename: string) {
    this.isUploading = true;
    this.progressPercent = 0;

    this.api.onUpload('profilePic', file, filename,this.oldname).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progressPercent = Math.round((event.loaded / event.total) * 100);
        }
        if (event.type === HttpEventType.Response) {
          if (event.body?.code === 200) {
            this.message.success('Image Uploaded Successfully.', '');
            this.userData[0]['PROFILE_IMAGE'] = filename;

            this.api.UpdateUser(this.userData[0]).subscribe(
              (successCode) => {
                if (successCode.code == '200') {
                  // this.message.success(
                  //   'Information Updated successfully!',
                  //   'Success'
                  // );
                  this.getUserList();
                  // window.location.reload
                } else {
                  this.message.error('Failed To Update Information...', '');
                }
              },
              (err) => { }
            );

            this.imagePreview = `${this.IMAGEuRL}profilePic/${filename}`;
            this.imageService.updateImage(this.imagePreview);

            // ✅ Close the modal after success
            if (this.modalInstance) {
              this.modalInstance.hide();
            }
          } else {
            this.message.error('Failed to Upload Image.', '');
          }
          this.isUploading = false;
        }
      },
      error: () => {
        this.isUploading = false;
        this.message.error('Upload error.', '');
      },
    });
  }
  usermobile: string = '';
  getUserList() {

    this.IMAGEuRL = this.api.retriveimgUrl;

    this.api.getUserData(0, 0, '', '', ` AND ID =${this.memberId}`).subscribe({
      next: (res: any) => {
        if (res?.code === 200 && res?.data?.length > 0) {


          const data = res.data[0];


          this.userData = [data];
          this.userName = data.NAME || 'Hi Guest';


          this.userEmail = data.EMAIL_ID || data.MOBILE_NO;
          this.usermobile = data.MOBILE_NO;

          this.imagePreview = data.PROFILE_IMAGE
            ? `${this.IMAGEuRL}profilePic/${data.PROFILE_IMAGE}`
            : this.userImage;
        } else {
          console.warn('No user data found');
        }
      },
      error: (err) => {
        console.error('Failed to fetch user data', err);
      },
    });


  }

  eventBookingData: any = [
    {
      EVENT_ID: '21',
      EVENT_NAME: 'Sakharam Binder',
      BOOKING_ID: 'PLAYMH-987654321',
      START_DATE: '2025-06-01',
      TOTAL_TICKETS: 23,
      PAID_AMOUNT: 750.0,
      INVOICE_URL: 'invoice.html',
      VENUE_NAME: 'Rangashankara Theatre',
      POSTER_IMAGE: 'assets/images/event-imgs/img-7.jpg',
      EVENT_TYPE: 'M',
      LATITUDE: 12.9279,
      LONGITUDE: 77.6271,
    },
    {
      EVENT_ID: '3',
      EVENT_NAME: 'Court Martial',
      BOOKING_ID: 'PLAYDL-123456789',
      START_DATE: '2025-06-10',
      TOTAL_TICKETS: 13,
      PAID_AMOUNT: 500.0,
      INVOICE_URL: 'invoice.html',
      VENUE_NAME: 'Kamani Auditorium, Delhi',
      POSTER_IMAGE: 'assets/images/event-imgs/img-8.jpg',
      EVENT_TYPE: 'P',
      LATITUDE: 28.6271,
      LONGITUDE: 77.2167,
    },
    {
      EVENT_ID: '4',
      EVENT_NAME: 'The Vagina',
      BOOKING_ID: 'PLAYBL-112233445',
      START_DATE: '2025-06-15',
      TOTAL_TICKETS: 4,
      PAID_AMOUNT: 1000.0,
      INVOICE_URL: 'invoice.html',
      VENUE_NAME: 'Ranga Shankara, Bengaluru',
      POSTER_IMAGE: 'assets/images/event-imgs/img-7.jpg',
      EVENT_TYPE: 'A',
      LATITUDE: 12.9352,
      LONGITUDE: 77.6146,
    },
  ];

  selectedCity = this.cookie.get('cityName');

  getEventRouterLink1(event: any) {
    const url = `/explore/${this.selectedCity}/${event.CATEGORY_ID}/${event.EVENT_NAME}/${event.EVENT_ID}`;
    this.router.navigateByUrl(url);
  }

  getEventRouterLink(event: any) {
    const url = `/explore/${this.selectedCity}/${event.CATEGORY_NAME}/${event.EVENT_SLUG}/${event.EVENT_ID}`;
    this.router.navigateByUrl(url);
  }

  selectedTicketData: any = null;
  userid: any = localStorage.getItem('userId')
  // openTicketPage(event: any) {

  //   const BookingCode = this.userService.encryptdata(event.BOOKING_CODE);

  //   this.router.navigate(['/myticket'], {
  //     queryParams: {
  //       bookingcode: BookingCode,
  //       userid: this.userid
  //     }
  //   });

  // }
  openTicketPage(event: any) {
    const BookingCode = this.userService.encryptdata(event.BOOKING_CODE);

    const queryParams = new URLSearchParams({
      bookingcode: BookingCode,
      userid: this.userid
    });

    const url = `${window.location.origin}/myticket?${queryParams.toString()}`;

    // Open in a real window (NOT a tab)
    const features = `
    width=1000,
    height=700,
    top=100,
    left=100,
    scrollbars=yes,
    resizable=yes,
    toolbar=no,
    menubar=no,
    location=no,
    status=no
  `.replace(/\s+/g, '');

    window.open(url, '_blank', features);
  }


  getFirstGenre(genreString: string): string {
    if (!genreString) return ''; // handles null, undefined, or empty string
    const genres = genreString.split(',').map((g) => g.trim());
    return genres.length > 1 ? `${genres[0]}` : genres[0];
  }
  hasMoreGenres(genre: string): boolean {
    return genre?.split(',').length > 1;
  }

  getEmailPreferencesById(memberId: any) {
    this.api
      .getMemberEmailPreferences(0, 0, '', '', ' AND MEMBER_ID=' + memberId)
      .subscribe((data) => {
        if (data['code'] == 200 && data['data'] && data['data'].length > 0) {
          this.emailPreferenceData = data['data'][0];
        }
      });
  }

  getPushPreferencesById(memberId: any) {
    this.api
      .getPushPreferences(0, 0, '', '', ' AND MEMBER_ID=' + memberId)
      .subscribe((data) => {
        if (data['code'] == 200 && data['data'] && data['data'].length > 0) {
          this.pushPreferenceData = data['data'][0];
        }
      });
  }

  getInAppPreferencesById(memberId: any) {
    this.api
      .getinAppPreferences(0, 0, '', '', ' AND MEMBER_ID=' + memberId)
      .subscribe((data) => {
        if (data['code'] == 200 && data['data'] && data['data'].length > 0) {
          // this.inAppPreferencesData.push(data['data'][0]);

          this.inAppPreferencesData = data['data'][0];
        }
      });
  }

  getCitys() {
    this.isCityLoading = true;
    this.api.getAllCities(0, 0, 'id', 'desc', ` AND STATUS = 1 `).subscribe(
      (data: any) => {
        if (data?.code === 200 && data?.data?.length > 0) {
          this.Cities = data.data;
        }
        this.isCityLoading = false;
      },
      (error: any) => {
        this.isCityLoading = false;
      }
    );
  }

  filteredGenres: any;
  filteredCategories: any; // Filtered list of categories for search

  getGenres() {
    this.isGenresLoading = true;
    this.api.getAllGenres(0, 0, 'id', 'desc', '').subscribe(
      (data: any) => {
        if (data?.code === 200 && data?.data?.length > 0) {
          this.genres = data.data;
          this.filteredGenres = [...this.genres];
        }
        this.isGenresLoading = false;
      },
      (error: any) => {
        this.isGenresLoading = false;
      }
    );
  }

  filteredTermsConditions: any;
  termsConditions: any = [];
  isTermsConditionsLoading = false;

  getTermsConditions() {
    this.isTermsConditionsLoading = true;
    this.termsConditions = [];
    this.api
      .getAllTermsConditions(0, 0, 'id', 'asc', ' AND STATUS = 1')
      .subscribe(
        (data: any) => {
          if (data?.code === 200 && data?.data?.length > 0) {
            this.termsConditions = data.data.map((term: any) => ({
              ...term,
              VALUE: this.sanitizer.bypassSecurityTrustHtml(term.VALUE),
            }));
          }
          this.isTermsConditionsLoading = false;
        },
        (error: any) => {
          this.isTermsConditionsLoading = false;
        }
      );
  }

  wishlistItems: any = [];
  filteredWishlistItems: any = [];
  isWishlistLoading: boolean = false;
  formatDuration(duration: string | number): string {
    const mins = parseInt(duration as string, 10);
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs} hr ${remainingMins} min`;
  }

  searchLoading: boolean = false;
  wishListCount: any;
  // wishlistPageIndex=
  wishlistPageIndex: any = 1;
  wishlistpageSize = 10;
  fetchAllWishlistData(reset: boolean = false) {
    if (reset) {
      this.wishlistPageIndex = 1;
      this.filteredWishlistItems = [];
    }

    this.isWishlistLoading = true;
    this.searchLoading = true;

    this.api
      .getallwishlist2(
        this.wishlistPageIndex,
        this.wishlistpageSize,
        'id',
        'desc',
        ' AND STATUS = 1 AND MEMBER_ID = ' + this.memberId
      )
      .subscribe(
        (response: any) => {
          const isSuccessful = response?.code === 200;
          // const hasData = response?.data?.length > 0;

          if (isSuccessful) {
            // this.filteredWishlistItems = [];
            this.wishListCount = response.count;
            // this.filteredWishlistItems = response.data;
            this.filteredWishlistItems = [
              ...this.filteredWishlistItems,
              ...response.data,
            ];
          }
          this.searchLoading = false;

          this.isWishlistLoading = false;
        },
        (error: any) => {
          console.error('Error fetching wishlist data:', error);
          this.searchLoading = false;

          this.isWishlistLoading = false;
        }
      );
  }

  upcomingListCount: any;
  // wishlistPageIndex=
  upcomingPageIndex: any = 1;
  upcomingpageSize = 10;
  fetchAllUpcomingData(reset: boolean = false) {
    if (reset) {
      this.upcomingPageIndex = 1;
      this.feedData = [];
    }

    this.searchLoading = true;

    this.api
      .getallwishlist2(
        this.upcomingPageIndex,
        this.upcomingpageSize,
        'id',
        'desc',
        ' AND STATUS = 1 AND MEMBER_ID = ' + this.memberId
      )
      .subscribe(
        (response: any) => {
          const isSuccessful = response?.code === 200;
          // const hasData = response?.data?.length > 0;

          if (isSuccessful) {
            // this.filteredWishlistItems = [];
            this.upcomingListCount = response.count;
            // this.filteredWishlistItems = response.data;
            this.feedData = [...this.feedData, ...response.data];
          }
          this.searchLoading = false;
        },
        (error: any) => {
          console.error('Error fetching Upcoming data:', error);
          this.searchLoading = false;

          this.isWishlistLoading = false;
        }
      );
  }

  // feedData: any = [
  //   {
  //   EVENT_ID: '683a93729816cbeea4575cd4',
  //   PLAY_ID: '683a93729816cbeea4575cd4',
  //   BANNER_IMAGE: 'avengers.jpg',
  //   EVENT_TYPE: 'M',
  //   SHOW_DATE: '2025-06-15T00:00:00',
  //   SHOW_TIME: '07:30 PM',
  //   EVENT_NAME: 'Avengers: Endgame',
  //   CATEGORY_ID: 2,
  //   LANGUAGE_NAMES: 'English,Hindi,Tamil',
  //   GENRE_NAMES: 'Action,Adventure,Sci-Fi',
  //   TAGS_NAMES: 'Marvel,Blockbuster,Superhero',
  //   SUB_CATEGORY_NAME: 'Cinematic,Blockbuster',
  //   DOCUMENT_URL: 'https://example.com/documents/avengers-ticket.pdf',
  // },
  //   {
  //     EVENT_ID: '683a93729816cbeea4575cd4',
  //     PLAY_ID: '683a93729816cbeea4575cd4',
  //     BANNER_IMAGE: 'hamlet.jpg',
  //     EVENT_TYPE: 'P',
  //     SHOW_DATE: '2025-06-16T00:00:00',
  //     SHOW_TIME: '06:00 PM',
  //     EVENT_NAME: 'Hamlet - The Stage Play',
  //     CATEGORY_ID: 3,
  //     LANGUAGE_NAMES: 'English,Marathi,Bengali',
  //     GENRE_NAMES: 'Tragedy,Classic,Drama',
  //     TAGS_NAMES: 'Shakespeare,Live,Theatre',
  //     SUB_CATEGORY_NAME: 'Drama,Classic,Tragedy',
  //     DOCUMENT_URL: 'https://example.com/documents/hamlet-ticket.pdf',
  //   },
  //   {
  //     EVENT_ID: '683a93729816cbeea4575cd4',
  //     PLAY_ID: '683a93729816cbeea4575cd4',
  //     BANNER_IMAGE: 'music_fest.jpg',
  //     EVENT_TYPE: 'E',
  //     SHOW_DATE: '2025-06-20T00:00:00',
  //     SHOW_TIME: '05:00 PM',
  //     EVENT_NAME: 'Monsoon Music Fest',
  //     CATEGORY_ID: 4,
  //     LANGUAGE_NAMES: 'Hindi,English,Punjabi',
  //     GENRE_NAMES: 'Music,Festival,Live',
  //     TAGS_NAMES: 'Live,Music,Outdoor',
  //     SUB_CATEGORY_NAME: 'Festival,Concert,Party',
  //     DOCUMENT_URL: 'https://example.com/documents/musicfest-ticket.pdf',
  //   },
  //   {
  //     EVENT_ID: '683a93729816cbeea4575cd4',
  //     PLAY_ID: '683a93729816cbeea4575cd4',
  //     BANNER_IMAGE: 'yoga_day.jpg',
  //     EVENT_TYPE: 'A',
  //     SHOW_DATE: '2025-06-21T00:00:00',
  //     SHOW_TIME: '06:00 AM',
  //     EVENT_NAME: 'International Yoga Day',
  //     CATEGORY_ID: 4,
  //     LANGUAGE_NAMES: 'English,Hindi,Gujarati',
  //     GENRE_NAMES: 'Health,Fitness,Spiritual',
  //     TAGS_NAMES: 'Wellness,Health,Fitness',
  //     SUB_CATEGORY_NAME: 'Wellness,Outdoor,Morning',
  //     DOCUMENT_URL: 'https://example.com/documents/yogaday-pass.pdf',
  //   },
  // ];

  get allWishlistItems(): any[] {
    return (this.filteredWishlistItems?.movies || []).concat(
      this.filteredWishlistItems?.plays || []
    );
  }

  removeFromWishlist(data: any) {
    data.STATUS = 0;

    //  this.filteredWishlistItems = this.filteredWishlistItems.filter(
    //   (item:any) => item.EVENT_ID !== data.EVENT_ID
    // );

    this.api.removeFromWishlist(data).subscribe(
      (successCode: any) => {
        // this.loaderService.hide(); // Hide loader

        if (successCode.code == '200') {
          this.message.success('Removed From WishList', 'Success');

          this.fetchAllWishlistData(true);
        } else {
          this.message.error('Failed To Update Information...', '');
        }
      },
      (err: any) => {
        // this.loaderService.hide(); // Hide loader on error
        // this.message.error('An error occurred. Please try again.', '');
      }
    );
  }

  onImageError(event: any) {
    event.target.src = '/assets/movie_skel.jpg';
  }
  viewDetails(item: any) {
    // e.g., navigate to another route with item ID
    this.router.navigate(['/movie-detail', item.ID]);
  }
  parseImageUrl(imageData: string): string[] {
    try {
      const images = imageData ? JSON.parse(imageData) : [];
      // Find the default image
      const defaultImage = images.find((img: any) => img.ISDEFAULT === true);
      return defaultImage ? [defaultImage.URL] : [];
    } catch {
      return [];
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

  filteredLanguages: any;
  getLanguages() {
    this.isLanguagesLoading = true;
    this.api.getAllLanguages(0, 0, 'id', 'desc', '').subscribe(
      (data: any) => {
        if (data?.code === 200 && data?.data?.length > 0) {
          this.languages = data.data;
          this.filteredLanguages = [...this.languages];
        }
        this.isLanguagesLoading = false;
      },
      (error: any) => {
        this.isLanguagesLoading = false;
      }
    );
  }

  getCategories() {
    this.isCategoriesLoading = true;
    this.api.getAllCategories(0, 0, 'id', 'desc', '').subscribe(
      (data: any) => {
        if (data?.code === 200 && data?.data?.length > 0) {
          this.categories = data.data;
          this.filteredCategories = [...this.categories];
        }
        this.isCategoriesLoading = false;
      },
      (error: any) => {
        this.isCategoriesLoading = false;
      }
    );
  }

  // ---------------------------------------------- Get Datas --  ------------------------------------------------

  // ---------------------------------------------- Custom multiselect dropdown --  ------------------------------------------------

  isDropdownOpen = false;
  searchTerm = '';
  selectedLanguages: string[] = [];
  isGenresDropdownOpen = false;
  isCategoriesDropdownOpen = false;
  searchTermGenres = '';
  searchTermCategories = '';
  selectedGenres: string[] = [];
  selectedCategories: string[] = [];

  // Toggle dropdown visibility
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Filter languages based on search input
  filterItems() {
    const filterValue = this.user.PREFERED_LANGUAGES.toUpperCase();
    this.filteredLanguages = this.languages.filter((language: any) =>
      language.NAME.toUpperCase().includes(filterValue)
    );
  }

  // Check if a language is already selected
  isSelected(language: string): boolean {
    return this.selectedLanguages.includes(language);
  }

  // Handle language selection
  selectLanguage(language: string) {
    if (this.isSelected(language)) {
      this.selectedLanguages = this.selectedLanguages.filter(
        (l) => l !== language
      ); // Deselect if already selected
    } else {
      this.selectedLanguages.push(language); // Add to selected if not already selected
    }
  }
  // Toggle genres dropdown visibility
  toggleGenresDropdown() {
    this.isGenresDropdownOpen = !this.isGenresDropdownOpen;
  }

  // Toggle categories dropdown visibility
  toggleCategoriesDropdown() {
    this.isCategoriesDropdownOpen = !this.isCategoriesDropdownOpen;
  }

  // Filter genres based on search input
  filterGenres() {
    const filterValue = this.user.PREFERED_GENRES.toUpperCase();
    this.filteredGenres = this.genres.filter((genre) =>
      genre.TYPE.toUpperCase().includes(filterValue)
    );
  }

  // Filter categories based on search input
  filterCategories() {
    const filterValue = this.user.PREFERED_CATEGORIES.toUpperCase();
    this.filteredCategories = this.categories.filter((category) =>
      category.NAME.toUpperCase().includes(filterValue)
    );
  }

  // Check if a genre is already selected
  isGenreSelected(genre: string): boolean {
    return this.selectedGenres.includes(genre);
  }

  // Handle genre selection
  selectGenre(genre: string) {
    if (this.isGenreSelected(genre)) {
      this.selectedGenres = this.selectedGenres.filter((g) => g !== genre); // Deselect if already selected
    } else {
      this.selectedGenres.push(genre); // Add to selected if not already selected
    }
  }

  // Check if a category is already selected
  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  // Handle category selection
  selectCategory(category: string) {
    if (this.isCategorySelected(category)) {
      this.selectedCategories = this.selectedCategories.filter(
        (c) => c !== category
      ); // Deselect if already selected
    } else {
      this.selectedCategories.push(category); // Add to selected if not already selected
    }
  }

  // ---------------------------------------------- Custom multiselect dropdown --  ------------------------------------------------

  // ----------------------------------------------  Update Profile code  --  ------------------------------------------------
  isOk = true;
  isSpinning: boolean = false;
  editdetails() {
    this.user = Object.assign({}, this.userData[0]);

    if (this.user.BIRTH_DATE) {
      this.user.BIRTH_DATE = this.datePipe.transform(
        this.user.BIRTH_DATE,
        'yyyy-MM-dd'
      );
    }

    this.getCitys();
    // this.getCategories();
    // this.getLanguages();
    // this.getGenres();
  }

  updateData(userForm: NgForm, user: any) {
    this.isOk = true;



    if (user.NAME == undefined || user.NAME.trim() == '') {
      this.isOk = false;
      this.message.error('Please Enter Name', '');
    } else if (
      user.ADDRESS_LINE_1 == undefined ||
      user.ADDRESS_LINE_1.trim() == ''
    ) {
      this.isOk = false;
      this.message.error('Please Enter Address Line 1', '');
    } else if (user.CITY_ID == undefined || user.CITY_ID.trim() == '') {
      this.isOk = false;
      this.message.error('Please Select City', '');
    }

    if (this.isOk) {
      this.isSpinning = true;
      let data = { ...user };
      data.PREFERED_CATEGORIES = this.selectedCategories.join(', ');
      data.PREFERED_GENRES = this.selectedGenres.join(', ');
      data.PREFERED_LANGUAGES = this.selectedLanguages.join(', ');
      data.IS_EMAIL_VERIFIED = this.userData[0]['IS_EMAIL_VERIFIED'];
      data.IS_MOBILE_VERIFIED = this.userData[0]['IS_MOBILE_VERIFIED'];
      data.EMAIL_ID = this.userData[0]['EMAIL_ID']

      this.loaderService.show(); // Show loader

      this.api.UpdateUser(data).subscribe(
        (successCode) => {
          this.loaderService.hide(); // Hide loader

          if (successCode.code == '200') {
            this.message.success(
              'Information Updated successfully!',
              'Success'
            );
            localStorage.setItem('NAME', data.NAME)

            const aboutModalElement = document.getElementById('aboutModal');
            if (aboutModalElement) {
              aboutModalElement.classList.remove('show');
              aboutModalElement.setAttribute('aria-hidden', 'true');
              aboutModalElement.style.display = 'none';

              document.body.classList.remove('modal-open');
              document.body.style.overflow = 'auto';

              const modalBackdrop = document.querySelector('.modal-backdrop');
              if (modalBackdrop) {
                modalBackdrop.remove();
              }
            }

            userForm.form.markAsPristine();
            userForm.form.markAsUntouched();
            this.getUserList();
          } else {
            this.message.error('Failed To Update Information...', '');
          }
        },
        (err) => {
          this.loaderService.hide(); // Hide loader on error
          this.message.error('An error occurred. Please try again.', '');
        }
      );
    }
  }

  // ----------------------------------------------  Update Profile code  --  ------------------------------------------------

  // ---------------------------------------------- Open Map --  ------------------------------------------------

  openMapModal(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const mapModalElement = document.getElementById('mapModal');
    if (mapModalElement) {
      const modal = new bootstrap.Modal(mapModalElement);
      modal.show();
    }
    this.user.LATITUDE = Number(this.user.LATITUDE);
    this.user.LONGITUDE = Number(this.user.LONGITUDE);

    this.mapDraweVisible = true;

    this.mapDraweVisible = true;
    setTimeout(() => {
      this.loadMap();
    }, 5);
  }
  handleSearch(event: any) {
    const query = event.target.value;
  }

  loadMap() {
    const map2Element = document.getElementById('map');
    if (!map2Element) return;

    const lat = Number(this.user.LATITUDE) || 20.5937;
    const lng = Number(this.user.LONGITUDE) || 78.9629;

    this.map2 = new google.maps.Map(map2Element, {
      center: { lat, lng },
      zoom: this.user.LATITUDE && this.user.LONGITUDE ? 14 : 5,
    });

    if (!isNaN(lat) && !isNaN(lng)) {
      this.marker = new google.maps.Marker({
        position: { lat, lng },
        map: this.map2,
      });

      this.getAddress(lat, lng);
    }

    setTimeout(() => {
      // Inject z-index fix for autocomplete dropdown
      const style = document.createElement('style');
      style.innerHTML = `
        .pac-container {
          z-index: 2000 !important;
          position: absolute !important;
        }
      `;
      document.head.appendChild(style);

      // Create and inject search box if it doesn't exist
      let searchInput = document.getElementById(
        'searchBox'
      ) as HTMLInputElement;
      if (!searchInput) {
        const searchBoxContainer = document.createElement('div');
        searchBoxContainer.style.cssText = `
          position: absolute;
          top: 10px;
          left: 10%;
          z-index: 2000;
        `;

        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'searchBox';
        searchInput.placeholder = 'Search location...';
        searchInput.style.cssText = `
          width: 250px;
          padding: 10px;
          font-size: 14px;
          border-radius: 5px;
          border: 1px solid #ccc;
          background-color: white;
          box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.3);
          z-index: 2000;
          position: relative;
        `;

        searchBoxContainer.appendChild(searchInput);
        this.map2.controls[google.maps.ControlPosition.LEFT_TOP].push(
          searchBoxContainer
        );
      }

      const searchBox = new google.maps.places.SearchBox(searchInput);

      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (!places || places.length === 0) return;

        const place = places[0];
        const lat = place.geometry?.location?.lat() || 0;
        const lng = place.geometry?.location?.lng() || 0;

        this.selectedLocation = {
          lat,
          lng,
          address: place.formatted_address || '',
        };

        this.map2.setCenter({ lat, lng });
        this.map2.setZoom(14);

        if (this.marker) this.marker.setMap(null);
        this.marker = new google.maps.Marker({
          position: { lat, lng },
          map: this.map2,
        });

        this.getAddress(lat, lng);
      });
    }, 300);

    this.map2.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      if (this.marker) this.marker.setMap(null);
      this.marker = new google.maps.Marker({
        position: { lat, lng },
        map: this.map2,
      });

      this.selectedLocation = { lat, lng, address: '' };
      this.getAddress(lat, lng);
    });
  }

  getAddress(lat: number, lng: number) {
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (!data || !data.display_name) return;

        this.user.LATITUDE = Number(data.lat) || lat;
        this.user.LONGITUDE = Number(data.lon) || lng;

        const address = data.address || {};
        const addressParts = data.display_name.split(',');

        let landmark = '';
        let area = '';

        if (address.road) {
          landmark = address.road;
          area = [address.county, address.state_district]
            .filter(Boolean)
            .join(', ');
        } else {
          landmark =
            addressParts.length > 4
              ? addressParts.slice(0, -4).join(', ')
              : data.display_name;
        }

        this.user.ADDRESS_LINE_1 = addressParts.slice(0, -4).join(', ') || '';
        this.user.PINCODE = address.postcode || '';

        this.selectedLocation = this.selectedLocation || {};
        this.selectedLocation.address = landmark;
      })
      .catch(() => {
        this.user.LATITUDE = lat;
        this.user.LONGITUDE = lng;

        this.user.PINCODE = '';
        if (!this.selectedLocation) {
          this.selectedLocation = {};
        }
        this.selectedLocation.address = '';
      });
  }

  clearSearchBox() {
    this.mapDraweVisible = false;

    const modalElement = document.getElementById('mapModal');
    if (modalElement) {
      const modal =
        bootstrap.Modal.getInstance(modalElement) ||
        new bootstrap.Modal(modalElement);
      modal.hide();
    }
  }

  // ---------------------------------------------- Open Map --  ------------------------------------------------

  // ------------------------------------------------ Verification Code  ------------------------------------------------

  otp: string[] = ['', '', '', '', '', ''];
  otpInvalid = false;
  otpTouched = false;
  verifyType: 'Email' | 'Mobile' = 'Email';
  verifyValue: string = '';
  isExisting = false;
  typeValueField: any;
  countryCode: any = '+91';
  typeValue: any;
  responseId: any;
  step: 'enter' | 'otp' | 'password' = 'enter';
  otpSent: boolean = false;
  isSendingOtp: boolean = false;
  remainingTime = 60;
  isverifyOTP: boolean = false;

  openModal(
    type: 'Email' | 'Mobile',
    currentValue: string,
    isVerified: boolean
  ) {
    this.verifyType = type;
    this.verifyValue = currentValue;
    this.isVerified = isVerified;
    this.isExisting = !isVerified;

    this.step = 'enter';
    this.typeValue = currentValue;
    this.otp = ['', '', '', '', '', ''];
    this.otpInvalid = false;
    this.otpTouched = false;
    this.remainingTime = 0;
    this.isSendingOtp = false;
    this.otpSent = false;
    const modalElement = document.getElementById('verifyModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  onTypeValueChange(value: string) {
    this.typeValue = value;
  }

  
  @ViewChild('captchaRef') captchaRef!: ReCaptcha2Component;
  captchaToken: string | null = null;
  
  // ================= CAPTCHA Event Handlers =================
  handleCaptchaSuccess(token: string) {
    this.captchaToken = token;
  }
  
  handleCaptchaExpire() {
    this.captchaToken = null;
  }
  
  handleCaptchaError(error: any) {
    console.error('Captcha error', error);
    this.captchaToken = null;
  }
  
IS_RESEND: boolean = false; 

sendOTP(form: any = '') {
  let isOk = true;
  const trimmedValue = this.typeValue?.trim();

  // ✅ Validate value
  if (!trimmedValue) {
    isOk = false;
    this.message.error('Please enter a value.', '');
    return;
  }

  if (this.verifyType === 'Email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedValue)) {
      this.message.error('Please enter a valid email address.', '');
      return;
    }
  } else if (this.verifyType === 'Mobile') {
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(trimmedValue)) {
      this.message.error('Please enter a valid mobile number.', '');
      return;
    }
  }

  if (!this.IS_RESEND && !this.captchaToken) {
    this.message.error('Please complete the CAPTCHA before sending OTP.', 'Error');
    return;
  }

  this.isSendingOtp = true;

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue);
  const payload: any = {
    TYPE: isEmail ? 'E' : 'M',
    TYPE_VALUE: trimmedValue,
    LOGGED_IN: 1,
    IS_RESEND: this.IS_RESEND
  };

  if (!this.IS_RESEND) {
    payload.CAPTCHA_RESPONSE = this.captchaToken;
  }

  this.api.sendOTPwithapi(payload).subscribe({
    next: (successCode: any) => {
      if (successCode.code == '200') {
        this.responseId = successCode.responseId;
        this.step = 'otp';

        const successMsg =
          payload.TYPE === 'M'
            ? 'OTP has been sent to you via WhatsApp. Please check your WhatsApp.'
            : 'OTP sent successfully. Please check your email.';

        this.message.success(successMsg, 'Success');
        this.otpSent = true;
        this.startTimer();
      } else if (successCode.code == 301) {
        this.message.error(
          payload.TYPE === 'E'
            ? 'Email ID already exists in the system'
            : 'Mobile number already exists in the system',
          'Error'
        );
        this.step = 'enter';
      } else if (successCode.code == 300) {
        this.message.warning(successCode.message || 'Too many OTP requests. Please try again later.', 'Warning');
      } else if (successCode.code == 400) {
        this.message.error(successCode.message || 'Invalid CAPTCHA. Please try again.', 'Error');
      } else {
        this.step = 'enter';
        this.message.error('Failed to send OTP. Please try again.', 'Error');
      }

      this.isSendingOtp = false;

      if (!this.IS_RESEND) {
        this.captchaRef.resetCaptcha();
        this.captchaToken = null;
      }

      this.IS_RESEND = false; 
    },
    error: () => {
      this.step = 'enter';
      this.isSendingOtp = false;
      this.message.error('Error in sending OTP. Please try again later.', 'Error');

      if (!this.IS_RESEND) {
        this.captchaRef.resetCaptcha();
        this.captchaToken = null;
      }

      this.IS_RESEND = false;
    },
    complete: () => {
      this.isSendingOtp = false;
      if (!this.IS_RESEND) {
        this.captchaRef.resetCaptcha();
        this.captchaToken = null;
      }
      this.IS_RESEND = false;
    }
  });
}

resendOtp() {
  this.otp = ['', '', '', ''];
  this.startTimer();

  this.IS_RESEND = true;

  // this.message.info('OTP has been resent. Please check your phone.', 'Info');
  this.sendOTP();
}



  closeModal() {
    const modalElement = document.getElementById('verifyModal');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      const modalBackdrop = document.querySelector('.modal-backdrop');
      if (modalBackdrop) {
        modalBackdrop.remove();
      }
    }
  }

  openLoginModal() {
    this.otp = ['', '', '', '', '', ''];
    this.otp[0] = '';
    this.otp[1] = '';
    this.otp[2] = '';
    this.otp[3] = '';
    this.otp[4] = '';
    this.otp[5] = '';
    this.isverifyOTP = false;
    (this.otpSent = false),
      (this.isSendingOtp = false),
      (this.otpTouched = false);

    this.step = 'enter';
  }


 
  VerifyOTP() {
    this.otpTouched = true;

    if (this.otpInvalid) {
      this.message.warning('Please enter a valid OTP.', 'Warning');
      return;
    }

    this.isverifyOTP = true;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.typeValue.trim());

    const data = {
      TYPE_VALUE: this.typeValue,
      MEMBER_ID: this.memberId,
      TYPE: isEmail ? 'E' : 'M',
      OTP: this.otp.join(''),
      ID: this.responseId,
    };

    this.api.verifyInOTP(data).subscribe({
      next: (successCode: any) => {
        this.isverifyOTP = false;

        if (successCode.code == 200) {
          this.message.success('OTP verified successfully.', 'Success');

          const modalElement = document.getElementById(
            'verifyModal'
          ) as HTMLElement;

          if (modalElement) {
            modalElement.classList.remove('show');
            modalElement.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            document.body.style.overflow = 'auto'; // Or 'scroll'
            const modalBackdrop = document.querySelector('.modal-backdrop');
            if (modalBackdrop) {
              modalBackdrop.remove();
            }
          }

          // if (this.isVerified == true) {
          if (this.verifyType == 'Email') {
            this.userData[0]['EMAIL_ID'] = this.typeValue;
            this.userData[0]['IS_EMAIL_VERIFIED'] = 1;
          } else {
            this.userData[0]['MOBILE_NO'] = this.typeValue;
            this.userData[0]['IS_MOBILE_VERIFIED'] = 1;
          }

          this.api.UpdateUser(this.userData[0]).subscribe(
            (successCode) => {
              if (successCode.code == '200') {
                // Optional: success message or logic
                this.getUserList();
                localStorage.setItem('EMAIL_ID', this.userData[0]['EMAIL_ID'])
                localStorage.setItem('MOBILE_NO', this.userData[0]['MOBILE_NO'])
              } else {
                this.message.error('Failed To Update Information...', '');
              }
            },
            (err) => {
              console.error('UpdateUser API Error:', err);
            }
          );
          // }
        } else if (successCode.code == 404) {
          this.message.error(
            successCode.message || 'Invalid OTP .',
            'Error'
          );
        }
        else {
          this.message.error(
            'An unexpected error occurred. Please try again.',
            'Error'
          );
        }
      },
      error: (errorResponse) => {
        this.isverifyOTP = false;
        const errorCode = errorResponse?.error?.code;
        console.error('verifyOTP API failed:', errorResponse);
      },
    });
  }

  startTimer() {
    this.remainingTime = 60;
    const interval = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }

  moveToNext(event: KeyboardEvent, index: number) {
    const inputs = document.getElementsByClassName(
      'otp-input'
    ) as HTMLCollectionOf<HTMLInputElement>;

    if (event.key === 'Backspace') {
      if (!this.otp[index] && index > 0) {
        setTimeout(() => inputs[index - 1]?.focus(), 50);
      }
    } else if (/^[0-9]$/.test(event.key)) {
      if (index < 5) {
        setTimeout(() => inputs[index + 1]?.focus(), 50);
      }
    }
  }

  onChange(_val: string, _index: number) {
    this.otpTouched = true;
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text')?.trim();

    if (pastedData && /^\d{6}$/.test(pastedData)) {
      for (let i = 0; i < 6; i++) {
        this.otp[i] = pastedData[i];
      }

      // Focus next field after paste
      const inputs = document.getElementsByClassName(
        'otp-input'
      ) as HTMLCollectionOf<HTMLInputElement>;

      setTimeout(() => {
        inputs[5]?.focus(); // Move to last box
      }, 50);
    }
  }

  // ---------------------------------------------- Next Tab Setting ------------------------------------------------

  emailLoader = false;
  pushLoader = false;
  inAppLoader = false;

  onChangePreferences(value: any, key: any) {
    if (!key || value === undefined || value === null) {
      this.message.error('Network error. Please try again.', '');
      return;
    }

    this.emailLoader = true;
    this.emailPreferenceData[key] = value ? 1 : 0;
    // let val: any = {};
    // val[key] = value ? 1 : 0;
    // this.emailPreferenceData = Object.assign({}, this.emailPreferenceData, val);
    // console.log('Email Preference Data:', this.emailPreferenceData);
    // console.log('Member ID:', this.memberId);
    if (this.emailPreferenceData.ID) {
      this.emailPreferenceData.ID = this.emailPreferenceData.ID;
      this.updateemailMemberPreferences(Number(this.memberId), this.emailPreferenceData);
    } else {
      let val: any = {};
      val[key] = value ? 1 : 0;
      val['MEMBER_ID'] = Number(this.memberId);
      // this.emailPreferenceData.MEMBER_ID = Number(this.memberId);
      // this.emailPreferenceData[key] = value ? 1 : 0;
      // this.emailPreferenceData=[]
      this.api.createMemberEmailPreferences(val).subscribe(
        (data) => {
          this.emailLoader = false;
          if (data['code'] == 200) {
            this.message.success('Preference updated successfully');
            this.getEmailPreferencesById(this.memberId)
          } else {
            this.message.error('Failed to update preference', '');
          }
        },
        () => {
          this.emailLoader = false;
          this.message.error(
            'Network error while updating notification settings',
            ''
          );
        }
      );
    }
  }

  onChangewhatsappPreferences(value: any, key: any) {
    if (!key || value === undefined || value === null) {
      this.message.error('Network error. Please try again.', '');
      return;
    }

    this.whatsappLoader = true;
    if (this.whatsappPreferenceData.ID) {
      this.whatsappPreferenceData.ID = this.whatsappPreferenceData.ID;
      this.updateWhatsappMemberPreferences(Number(this.memberId), this.whatsappPreferenceData);
    } else {
      // this.whatsappPreferenceData.MEMBER_ID = Number(this.memberId);
      // this.whatsappPreferenceData=[]
      let val: any = {};
      val[key] = value ? 1 : 0;
      val['MEMBER_ID'] = Number(this.memberId);

      this.api.createMemberWhatsappPreferences(val).subscribe(
        (data) => {
          this.whatsappLoader = false;
          if (data['code'] == 200) {
            this.message.success('WhatsApp Preference updated successfully');
            this.getWhatsappPreferencesById(this.memberId);
          } else {
            this.message.error('Failed to update WhatsApp preference', '');
          }
        },
        () => {
          this.whatsappLoader = false;
          this.message.error(
            'Network error while updating WhatsApp notification settings',
            ''
          );
        }
      );
    }
  }
  onChangePushPreferences(value: any, key: any) {
    if (!key || value === undefined || value === null) {
      this.message.error('Network error. Please try again.', '');
      return;
    }

    this.pushLoader = true;
    this.pushPreferenceData[key] = value ? 1 : 0;
    this.updatepushPreferences(Number(this.memberId), this.pushPreferenceData);
  }

  onChangeInAppPreferences(value: any, key: any) {
    if (!key || value === undefined || value === null) {
      this.message.error('Network error. Please try again.', '');
      return;
    }

    this.inAppLoader = true;
    this.inAppPreferencesData[key] = value ? 1 : 0;
    this.updateInApppreferances(
      Number(this.memberId),
      this.inAppPreferencesData
    );
  }

  // API update methods
  updateemailMemberPreferences(memberId: any, emailPreferenceData: any) {
    emailPreferenceData.MEMBER_ID = memberId;
    this.api.UpdateMemberEmailPreferences(emailPreferenceData).subscribe(
      (data) => {
        this.emailLoader = false;
        if (data['code'] == 200) {
          this.message.success('Preference updated successfully');
        } else {
          this.message.error('Failed to update preference', '');
        }
      },
      () => {
        this.emailLoader = false;
        this.message.error('Network error while updating notification settings', '');
      }
    );
  }

  updatepushPreferences(memberId: any, pushPreferenceData: any) {
    pushPreferenceData.MEMBER_ID = memberId;
    this.api.UpdatePushPreferences(pushPreferenceData).subscribe(
      (data) => {
        this.pushLoader = false;
        if (data['code'] == 200) {
          this.message.success('Preference updated successfully');
        } else {
          this.message.error('Failed to update preference', '');
        }
      },
      () => {
        this.pushLoader = false;
        this.message.error('Network error while updating notification settings', '');
      }
    );
  }

  updateInApppreferances(memberId: any, inAppPreferencesData: any) {
    inAppPreferencesData.MEMBER_ID = memberId;
    this.api.UpdateinAppPreferences(inAppPreferencesData).subscribe(
      (data) => {
        this.inAppLoader = false;
        if (data['code'] == 200) {
          this.message.success('Preference updated successfully');
        } else {
          this.message.error('Failed to update preference', '');
        }
      },
      () => {
        this.inAppLoader = false;
        this.message.error('Network error while updating notification settings', '');
      }
    );
  }

  whatsappPreferenceData: any = [];
  smsPreferenceData: any = [];
  whatsappLoader: boolean = false;
  smsLoader: boolean = false;

  // Fetch WhatsApp Preferences
  getWhatsappPreferencesById(memberId: any) {
    this.api
      .getMemberWhatsappPreferences(0, 0, '', '', ' AND MEMBER_ID=' + memberId)
      .subscribe((data) => {
        if (data['code'] == 200 && data['data'] && data['data'].length > 0) {
          this.whatsappPreferenceData = data['data'][0];
        }
      });
  }

  // Fetch SMS Preferences
  getSmsPreferencesById(memberId: any) {
    this.api
      .getMemberSmsPreferences(0, 0, '', '', ' AND MEMBER_ID=' + memberId)
      .subscribe((data) => {
        if (data['code'] == 200 && data['data'] && data['data'].length > 0) {
          this.smsPreferenceData = data['data'][0];
        }
      });
  }

  // Handle Preferences Change for WhatsApp and SMS
  // onChangewhatsappPreferences(value: any, key: any, type: string) {
  //   if (!key || value === undefined || value === null) {
  //     this.message.error('Network error. Please try again.', '');
  //     return;
  //   }

  //   if (type === 'whatsapp') {
  //     this.whatsappLoader = true;
  //     this.whatsappPreferenceData[key] = value ? 1 : 0;
  //     this.updateWhatsappMemberPreferences(Number(this.memberId), this.whatsappPreferenceData);
  //   } else if (type === 'sms') {
  //     this.smsLoader = true;
  //     this.smsPreferenceData[key] = value ? 1 : 0;
  //     this.updateSmsMemberPreferences(Number(this.memberId), this.smsPreferenceData);
  //   }
  // }


  onChangeSMSPreferences(value: any, key: any) {
    if (!key || value === undefined || value === null) {
      this.message.error('Network error. Please try again.', '');
      return;
    }

    this.smsLoader = true;
    this.smsPreferenceData[key] = value ? 1 : 0;
    this.updateSmsMemberPreferences(
      Number(this.memberId),
      this.smsPreferenceData
    );
  }

  // API update methods for WhatsApp and SMS preferences
  updateWhatsappMemberPreferences(memberId: any, whatsappPreferenceData: any) {
    whatsappPreferenceData.MEMBER_ID = memberId;
    this.api.UpdateMemberWhatsappPreferences(whatsappPreferenceData).subscribe(
      (data) => {
        this.whatsappLoader = false;
        if (data['code'] == 200) {
          this.message.success('WhatsApp Preference updated successfully');
        } else {
          this.message.error('Failed to update WhatsApp preference', '');
        }
      },
      () => {
        this.whatsappLoader = false;
        this.message.error(
          'Network error while updating WhatsApp notification settings',
          ''
        );
      }
    );
  }

  updateSmsMemberPreferences(memberId: any, smsPreferenceData: any) {
    smsPreferenceData.MEMBER_ID = memberId;
    this.api.UpdateMemberSmsPreferences(smsPreferenceData).subscribe(
      (data: any) => {
        this.smsLoader = false;
        if (data['code'] == 200) {
          this.message.success('SMS Preference updated successfully');
        } else {
          this.message.error('Failed to update SMS preference', '');
        }
      },
      () => {
        this.smsLoader = false;
        this.message.error('Network error while updating SMS notification settings', '');
      }
    );
  }

  //   emailpreferenceload:boolean = false
  //   onChangePreferences(value: any, key: any) {
  //     this.emailPreferenceData = true

  //     this.emailPreferenceData[key] = value ? 1 : 0;
  //     this.updateemailMemberPreferences(
  //       Number(this.memberId),
  //       this.emailPreferenceData
  //     );
  //   }
  //   onChangePushPreferences(value: any, key: any) {
  //     this.pushPreferenceData[key] = value ? 1 : 0;
  //     this.updatepushPreferences(Number(this.memberId), this.pushPreferenceData);
  //   }
  //   onChangeInAppPreferences(value: any, key: any) {
  //     this.inAppPreferencesData[key] = value ? 1 : 0;
  //     this.updateInApppreferances(
  //       Number(this.memberId),
  //       this.inAppPreferencesData
  //     );
  //   }

  // updateemailMemberPreferences(memberId: any, emailPreferenceData: any) {
  //   emailPreferenceData.MEMBER_ID = memberId;
  //   this.emailPreferenceData = true
  //   this.api
  //     .UpdateMemberEmailPreferences(emailPreferenceData)
  //     .subscribe((data) => {
  //       if (data['code'] == 200) {
  //         this.message.success('Preferance updated successfully');
  //       } else {
  //         this.message.error('Failed to update preferance', '');
  //       }
  //       this.emailPreferenceData = false

  //     });
  // }
  // updatepushPreferences(memberId: any, pushPreferenceData: any) {
  //   pushPreferenceData.MEMBER_ID = memberId;
  //   this.api.UpdatePushPreferences(pushPreferenceData).subscribe((data) => {
  //     if (data['code'] == 200) {
  //       this.message.success('Preferance updated successfully');
  //     } else {
  //       this.message.error('Failed to update preferance', '');
  //     }
  //   });
  // }
  // updateInApppreferances(memberId: any, inAppPreferencesData: any) {
  //   inAppPreferencesData.MEMBER_ID = memberId;
  //   this.api.UpdateinAppPreferences(inAppPreferencesData).subscribe((data) => {
  //     if (data['code'] == 200) {
  //       this.message.success('Preferance updated successfully');
  //     } else {
  //       this.message.error('Failed to update preferance', '');
  //     }
  //   });
  // }

  // ---------------------------------------------- Next Tab Setting ------------------------------------------------
  isLoggingOut: boolean = false;
  signOut() {
    const userId =
      this.userService.getUserEmail() || this.userService.getUserMobileNumber();

    const clearAllData = () => {
      // Clear specific cookies
      this.cookie.delete('cityName', '/');
      this.cookie.delete('cityId', '/');
      this.cookie.delete('cities', '/');
      this.cookie.delete('token', '/'); // Add others as needed

      this.cookie.deleteAll();

      // Clear storage
      sessionStorage.clear();
      localStorage.clear();
      window.location.reload();
    };

    if (userId != null && userId != undefined) {
      this.isLoggingOut = true;

      this.api.userLogout(userId).subscribe({
        next: (successCode: any) => {
          clearAllData();

          this.message.success('You have successfully logged out!', 'Success');
          this.activeTab = 'feed';
          this.router.navigate(['/home']).then(() => {
            window.location.reload();
          });

          this.isLoggingOut = false;
        },
        error: (errorResponse) => {
          clearAllData();

          this.message.success('You have successfully logged out!', 'Success');

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

  features = [
    {
      title: 'Easy hosting',
      image: 'images/about/img-1.jpg',
      description:
        'You can focus on your show, rest we will provide you with all the facilities.',
      modalTarget: 'communitieModal1',
    },
    {
      title: 'One-stop solution for hosting online events',
      image: 'images/about/img-2.jpg',
      description:
        'You Demand & We Supply - Live Streaming and Video on Demand, both options on your finger tips. Ticket Khidakee is your answer for Hosting any kind of Online events.',
      modalTarget: 'communitieModal2',
    },
    {
      title: 'New Age Ticket Booking Platform',
      image: 'images/about/img-3.jpg',
      description:
        'We use latest technology to deliver a high-quality and user-friendly ticket booking experience.',
      modalTarget: 'communitieModal3',
    },
    {
      title: 'Easy & Fast Payments',
      image: 'images/about/img-4.jpg',
      description:
        'Integrated Payment Gateway supporting country-specific currency payments globally.',
      modalTarget: 'communitieModal4',
    },
    {
      title: 'Global Platform',
      image: 'images/about/img-5.jpg',
      description: 'Market your event to the Global Audience with us.',
      modalTarget: 'communitieModal5',
    },
  ];

  ngAfterViewInit() {
    document.querySelectorAll('.menu--link').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        (el as HTMLElement).style.backgroundColor = '#af0404';
        (el as HTMLElement).style.color = '#ffffff';
      });
      el.addEventListener('mouseleave', () => {
        (el as HTMLElement).style.backgroundColor = '';
        (el as HTMLElement).style.color = '';
      });
    });
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((tooltipTriggerEl: any) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
  @ViewChild('receiptContent', { static: false }) receiptContent!: ElementRef;
  // View in New Window
  // viewReceipt() {
  //   const content = this.receiptContent.nativeElement.innerHTML;
  //   const newWindow = window.open('', '_blank');
  //   if (newWindow) {
  //     newWindow.document.write(
  //       `<html><head><title>Receipt</title></head><body>${content}</body></html>`
  //     );
  //     newWindow.document.close();
  //   }
  // }

  cancelLogout() {
    // Reset the active component or handle modal closing
    this.activeTab = 'feed'; // or whatever default view you want
  }

  showReceiptModal: boolean = false;
  receiptHtml: string = '';

  viewReceipt() {
    // const content = this.receiptContent.nativeElement.innerHTML;
    // this.receiptHtml = content;
    this.showReceiptModal = true;
  }

  receiptUrl: string = ''; // Store full receipt path

  //   viewReceipt1(documentUrl: string) {
  //     // this.receiptUrl = this.retriveimgUrl + 'tickets/' + documentUrl;
  //         const folderName = 'tickets';
  // //  const apiUrl = this.retriveimgUrl.split('static/')[0];

  //     const fileUrl = `${this.api.retriveimgUrl}/${folderName}/${documentUrl}`;
  //

  //

  //     // this.showReceiptModal = true;
  //   }




  viewReceipt1(documentUrl: string): void {
    if (!documentUrl) {
      console.error('Invalid document URL');
      return;
    }

    const folderName = 'tickets';
    const fileUrl = `${this.api.retriveimgUrl}/${folderName}/${documentUrl}`;
    // Open in a new browser tab
    window.open(fileUrl, '_blank');
  }




  closeReceiptModal() {
    this.showReceiptModal = false;
  }

  // showTooltip(event: MouseEvent) {
  //   const target = event.target as HTMLElement;
  //   // Destroy any existing tooltip instance
  //   bootstrap.Tooltip.getInstance(target)?.dispose();
  //   // Create a new tooltip instance
  //   const tooltip = new bootstrap.Tooltip(target);
  //   tooltip.show();

  //   // Optional: auto-hide after 2 seconds
  //   setTimeout(() => tooltip.hide(), 2000);ks
  // }

  showTooltip(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map((tooltipTriggerEl) => {
      return new bootstrap.Tooltip(tooltipTriggerEl); // @ts-ignore if needed
    });
  }

  // downloadDocument(link: string): void {
  //   // const link1 = document.createElement('a');
  //   // link1.href = 'assets/movie-ticket-receipt.pdf';
  //   // link1.download =`/movie-ticket-receipt.pdf`;
  //   // link1.click();




  //   // Uncomment later

  //   if (!link) {
  //     console.error('Invalid file link provided');
  //     return;
  //   }

  //   const folderName = 'tickets';
  //   const fileUrl = `${this.api.retriveimgUrl}${folderName}/${link}`;
  //   const a = document.createElement('a');
  //   a.href = fileUrl;
  //   a.download = link; // Browser will try to download
  //   a.target = '_blank'; // Optional: open in new tab if supported
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  // }



  downloadDocument(link: string): void {
    if (!link) {
      console.error('Invalid file link provided');
      return;
    }

    const folderName = 'tickets';
    const apiUrl = this.api.retriveimgUrl.split('static/')[0];

    const fileUrl = `${apiUrl}api/getFile/${folderName}/${link}`;

    // fetch(fileUrl)
    //   .then(response => {
    //     if (!response.ok) throw new Error('Network response was not ok');
    //     return response.blob();
    //   })
    //   .then(blob => {
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = link;
    //     document.body.appendChild(a);
    //     a.click();
    //     a.remove();
    //     window.URL.revokeObjectURL(url);
    //   })
    //   .catch(error => console.error('Download failed:', error));


    fetch(fileUrl)
      .then(response => {
        // if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = link;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Download failed:', error));
  }








  // openDatePicker(input: HTMLInputElement): void {
  //   if (input?.showPicker) {
  //     input.showPicker(); // Only works if browser supports it
  //   }
  // }

  emitted = false;
  private categoriesSubject = new BehaviorSubject<Array<string>>([]);
  categories$ = this.categoriesSubject.asObservable();
  @HostListener('document:touchmove', ['$event'])
  @HostListener('document:wheel', ['$event'])
  onScroll() {
    const activityItem = document.getElementById('activityItem');

    if (activityItem) {
      const scrollTop = activityItem.scrollTop;
      const offsetHeight = activityItem.offsetHeight;
      const scrollHeight = activityItem.scrollHeight;
      if (scrollTop + offsetHeight + 1 >= scrollHeight && !this.emitted) {
        this.emitted = true;
        this.onScrollingFinished();
      } else if (scrollTop + offsetHeight + 1 < scrollHeight) {
        this.emitted = false;
      }
    }
  }

  onScrollingFinished() {
    this.loadMoreP();
  }
  loadMoreP(): void {
    if (this.getNextItems()) {
      this.categoriesSubject.next(this.filteredWishlistItems);
    }
  }
  getNextItems(): boolean {
    if (this.filteredWishlistItems.length >= this.wishListCount) {
      return false;
    }
    this.wishlistPageIndex = this.wishlistPageIndex + 1;
    this.fetchAllWishlistData(false);
    return true;
  }

  upcommingEmitted = false;
  private upcomingSub = new BehaviorSubject<Array<string>>([]);
  upcomingMovieCat$ = this.upcomingSub.asObservable();
  @HostListener('document:touchmove', ['$event'])
  @HostListener('document:wheel', ['$event'])
  onupcomingScroll() {
    const upcomingItem = document.getElementById('upcomingItem');

    if (upcomingItem) {
      const scrollTop = upcomingItem.scrollTop;
      const offsetHeight = upcomingItem.offsetHeight;
      const scrollHeight = upcomingItem.scrollHeight;
      if (
        scrollTop + offsetHeight + 1 >= scrollHeight &&
        !this.upcommingEmitted
      ) {
        this.upcommingEmitted = true;
        this.onScrollingUpcomming();
      } else if (scrollTop + offsetHeight + 1 < scrollHeight) {
        this.upcommingEmitted = false;
      }
    }
  }

  onScrollingUpcomming() {
    this.loadMoreUpcoming();
  }
  loadMoreUpcoming(): void {
    if (this.getNextUpcomings()) {
      this.upcomingSub.next(this.feedData);
    }
  }
  getNextUpcomings(): boolean {
    if (this.feedData.length >= this.upcomingListCount) {
      return false;
    }
    this.upcomingPageIndex = this.upcomingPageIndex + 1;
    this.fetchAllUpcomingData(false);
    return true;
  }

  onDateChange(event: any) {
    const selectedDate = event.target.value;
    this.user.BIRTH_DATE = selectedDate;
  }

  getEventType(type: string): string {
    switch (type) {
      case 'M':
        return 'Movie';
      case 'E':
        return 'Event';
      case 'P':
        return 'Play';
      case 'A':
        return 'Activity';
      default:
        return 'Other';
    }
  }

  openMap(latitude: number, longitude: number): void {
    const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(mapUrl, '_blank');
  }


  updateMetaTags() {
    this.title.setTitle('Ticket Khidakee - My Profile');

    // Canonical Tag
    let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    document.head.appendChild(link);
  }

  openDatePicker(input: HTMLInputElement): void {
    if (input) {
      const today = new Date();
      const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());

      // Format the date as yyyy-mm-dd
      const formatted = tenYearsAgo.toISOString().split('T')[0];
      input.value = formatted;

      // Open the date picker (if supported)
      if (input.showPicker) {
        input.showPicker();
      }
    }
  }

  PlanDetails: any = []
  pageindexforlist = 1;
  pageindexforsize = 10;
  plandataaaaa: any
  planDatacount: any = 0
  getmembershipdetails(consition: boolean = false, plan: any) {
    this.activeTab = 'view';
    if (consition) {
      this.PlanDetails = []
      this.searchLoading = true
      this.pageindexforlist = 1
      this.pageindexforsize = 10
      this.plandataaaaa = plan
    }
    var filterParams = " AND PLAN_ID=" + plan.PLAN_ID + " AND USER_ID=" + this.userID;
    this.api.getusedEventwithPlan(this.pageindexforlist, this.pageindexforsize, 'PLAN_USED_DATETIME', 'DESC', filterParams).subscribe(
      (data: any) => {
        this.searchLoading = false;
        if (data['code'] == 200) {

          this.searchLoadingformore = false;
          this.planDatacount = data['count'];
          const newData = data['data'].map((item: any) => {
            const [year, month, day] = item.SHOW_DATE.split('-');
            const dateStr = `${year}-${month}-${day} ${item.SHOW_TIME}`;
            const dateTime = new Date(dateStr);
           
            return {
              ...item,
              SHOW_DATETIME: dateTime
            };
          });
          this.PlanDetails = [...this.PlanDetails, ...newData];
        } else {

        }
      },
      () => {
        this.searchLoading = false;

      }
    );
  }

  isExpired(endDate: string | Date, usage: number, max: number): boolean {
    const end = new Date(endDate);
    const now = new Date();
    return end < now || (end > now && usage === max);
  }

  isExhausted(endDate: string | Date, usage: number, max: number): boolean {
    const end = new Date(endDate);
    const now = new Date();
    return usage === max && end >= now;
  }

  isActive(endDate: string | Date, usage: number, max: number): boolean {
    const end = new Date(endDate);
    const now = new Date();
    return usage < max && end >= now;
  }

  alphaOnly(event: any) {
    event = event ? event : window.event;
    var charCode = event.which ? event.which : event.keyCode;
    if (
      charCode > 32 &&
      (charCode < 65 || charCode > 90) &&
      (charCode < 97 || charCode > 122)
    ) {
      return false;
    }
    return true;
  }


  onlynum(event: any) {
    event = event ? event : window.event;
    var charCode = event.which ? event.which : event.keyCode;
    // Allowing digits (0-9)
    if (charCode >= 48 && charCode <= 57) {
      return true;
    }
    return false; // Disallowing other characters
  }














  // full menu (keep in sync with your existing tabs)


  @ViewChild('moreContainer', { static: false }) moreContainer!: ElementRef;
  @ViewChild('mobileNav', { static: false }) mobileNav!: ElementRef;

  toggleMore(event?: Event) {
    event?.stopPropagation();
    this.isMoreOpen = !this.isMoreOpen;
  }

  onMobileNavClick(item: any, event?: Event) {
    event?.stopPropagation();
    // call your existing tab activation logic
    this.activateTab(item.key);

    // typical: if it's log_out, call logout handler
    if (item.key === 'log_out') {
      // handle logout flow or call existing function
      // this.logout();
    }

    // close popup if open
    this.isMoreOpen = false;
  }

  // Click outside -> close popup
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    try {
      const target = event.target as HTMLElement;
      if (this.isMoreOpen) {
        if (this.moreContainer && !this.moreContainer.nativeElement.contains(target)) {
          this.isMoreOpen = false;
        }
      }
    } catch (e) { /* ignore */ }
  }

  // Optional: close on Escape
  @HostListener('document:keydown.escape', ['$event'])
  onEscape() {
    this.isMoreOpen = false;
  }

  openplanreceiptPage(event: any) {

    const planid = this.userService.encryptdata(event.PLAN_ID);

    const queryParams = new URLSearchParams({
      planid: planid,
      userid: this.userid
    });

    const url = `${window.location.origin}/planreceipt?${queryParams.toString()}`;

    const features = `
    width=1000,
    height=700,
    top=100,
    left=100,
    scrollbars=yes,
    resizable=yes,
    toolbar=no,
    menubar=no,
    location=no,
    status=no
  `.replace(/\s+/g, '');

    const newWindow: any = window.open(url, '_blank', features);

    if (newWindow) {
      newWindow.planReceiptData = event;
    }

  }

  showcontent: boolean = false
}

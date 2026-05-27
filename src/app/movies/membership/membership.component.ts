import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { timeout } from 'rxjs';
import { environment } from 'src/app/environment';
import { ApiService } from 'src/app/Services/api.service';
import { CommonFunctionService } from 'src/app/Services/CommonFunctionService';
declare var Razorpay: any;
@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.scss']
})
export class MembershipComponent implements OnInit {
  @ViewChild('closelogin') closelogin!: ElementRef;
  mainlist: boolean = true
  isloading: boolean = false

  plandataaaa: any
  original_convience_fee = 0;
  loadsubscribe: { [key: number]: boolean } = {};
  loadCoponPlan: { [key: number]: boolean } = {};

  showLoginModal() {
    var d: any = document.getElementById('loginmodaltrack') as HTMLElement;
    d.click();
  }
  openlogin() {
    this.closelogin.nativeElement.click();
    this.router.navigate(['/sign-in']);
  }
  public commonFunction = new CommonFunctionService();

  constructor(private api: ApiService, public cookie: CookieService, private userService: CommonFunctionService, private router: Router, private datepipe: DatePipe,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer) { }

  userID = this.userService.getUserId();
  pageIndex = 1;
  pageSize = 100;
  plansData: any = [];
  plansData1: any = [];
  isLoggedIn: boolean = false;
  isLoading1: boolean = false;
  searchLoading: boolean = false;
  subcribedata: any = []
  planwithsubdata: any = []
  subscribedPlans: any = []

  loadBookingFlag: boolean = false;
  selectedPaymentMethod: string = 'CODD'; // Default Payment Mode
  RAZOR_PAY_KEY = environment.RAZOR_PAY_KEY
  Hoisting_Type: any;
  tickets: any[] = [];
  selectedSeat: any[] = [];
  selectedSeats1: any[] = [];

  orderSummary: any = {
    items: [],
  };
  PlanDataForCoupon: any;
  PlanDataForPayment: any;
  ClickedPlanData: any;

  bookingMeta: any;
  eventID: any;
  selectedVenue: any = {};
  eventname: any;
  EVENT_SCHEDULE_ID: any;
  eventShortCode: any;
  QR_CODE: any;
  USER_ID: any;
  PLAN_ID: any;
  PAYMENT_MODE: any = 'O';
  TRANSACTION_DATE: any;
  TRANSACTION_ID: any;
  TRANSACTION_STATUS: any = 'Success';
  PAYLOAD: any;
  RESPONSE_DATA: any;
  RESPONSE_CODE: any = 200;
  MERCHENT_ORDER_ID: any;
  MERCHENT_ID: any = this.RAZOR_PAY_KEY;
  RESPONSE_MESSAGE: any = 'Payment Success';
  BOOKING_CODE: any;
  activeStep: number = 1;

  loadBookingFlag1: boolean = false;
  cancelled: any;
  SESSION_ID = ''
  ngOnInit() {
    this.getplans();
    this.applycode = '';
    const id = this.generateTabSessionId();
    this.SESSION_ID = id;
  }
  generateTabSessionId(prefix = 'KEY', keyLength = 6): string {
    const TAB_KEY = 'sessionid2';
    const WINDOW_FLAG = 'tab_initialized1';
    const TAB_UUID_KEY = 'all_open_tabs1';

    // 1️⃣ Reload → return same session
    if (window.name == WINDOW_FLAG && sessionStorage.getItem(TAB_KEY)) {
      return sessionStorage.getItem(TAB_KEY)!;
    }

    // 2️⃣ Generate per-tab UUID (cloned in duplicate tabs)
    let myUUID = sessionStorage.getItem('TAB_UUID2');
    if (!myUUID) {
      myUUID = Math.random().toString(36).substring(2);
      sessionStorage.setItem('TAB_UUID2', myUUID);
    }

    // 3️⃣ Read global UUID list from localStorage
    let list = JSON.parse(localStorage.getItem(TAB_UUID_KEY) || '[]');

    // 4️⃣ Check if UUID already present → **duplicate tab**
    const isDuplicateTab = list.includes(myUUID);

    // 5️⃣ If not present → add to list (real tab)
    if (!isDuplicateTab) {
      list.push(myUUID);
      localStorage.setItem(TAB_UUID_KEY, JSON.stringify(list));
    }

    // 6️⃣ Generate sessionId
    let sessionId = '';
    if (!sessionStorage.getItem(TAB_KEY) || isDuplicateTab) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let rand = '';
      for (let i = 0; i < keyLength; i++) {
        rand += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
      sessionId = `${prefix}-${ts}-${rand}`;
      sessionStorage.setItem(TAB_KEY, sessionId);
    } else {
      sessionId = sessionStorage.getItem(TAB_KEY)!;
    }

    window.name = WINDOW_FLAG;
    return sessionId;
  }

  getplans() {
    this.isloading = true;

    var filter = " NOW() BETWEEN STR_TO_DATE(CONCAT(PLAN_VISIBLITY_START_DATE, ' 00:00:00'), '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE(CONCAT(PLAN_VISIBLITY_END_DATE, ' 23:59:59'), '%Y-%m-%d %H:%i:%s')"
    this.api.getplans1(
      this.pageIndex,
      this.pageSize,
      'SEQ_NO',
      'asc',
      ' AND STATUS = 1  AND ' + filter
    )
      .subscribe(
        (data: any) => {
          if (data['code'] === 200) {
            const today = new Date().toISOString().split('T')[0];
            const currentDate = new Date(today);

            if (this.userID) {
              this.plansData = data["data"];

              // this.plansData = this.plansData.filter((plan: any) => {
              //   const planStartDate = new Date(this.formatToDDMMYYYY111(plan.PLAN_VISIBLITY_START_DATE));
              //   const planEndDate = new Date(this.formatToDDMMYYYY111(plan.PLAN_VISIBLITY_END_DATE));
              //   return planStartDate <= currentDate && planEndDate >= currentDate;
              // });
              this.isloading = false;
              this.getsubcriptiondata();
            } else {
              this.planwithsubdata = data["data"];

              // this.planwithsubdata = this.planwithsubdata.filter((plan: any) => {
              //   const planStartDate = new Date(this.formatToDDMMYYYY111(plan.PLAN_VISIBLITY_START_DATE));
              //   const planEndDate = new Date(this.formatToDDMMYYYY111(plan.PLAN_VISIBLITY_END_DATE));
              //   return planStartDate <= currentDate && planEndDate >= currentDate;
              // });
              this.isloading = false;
            }
          } else {
            this.isloading = false;
          }
        },
        () => {
          this.isloading = false;
        }
      );
  }

  getsubcriptiondata() {
    this.isloading = true;
    this.api
      .getuserSubscriptions(
        0,
        0,
        'SEQ_NO',
        'asc',
        " AND USER_ID = " + this.userID
      )
      .subscribe(
        (data: any) => {
          this.isloading = false;
          if (data['code'] === 200 && this.userID) {
            this.subcribedata = data["data"];
            this.subscribedPlans = this.plansData.filter((plan: { ID: any; }) =>
              this.subcribedata.some((sub: { PLAN_ID: any; }) => sub.PLAN_ID === plan.ID)
            );
            this.loadBookingFlag = false;
            this.paymentdata = []
            this.plandataaaa = []
            this.mainlist = true;
            this.spincuponopen = false;
            this.coupanapplies = false;
            this.planwithsubdata = [];
            this.planwithsubdata = this.plansData.map((plan: { ID: any; }) => {
              const isSubscribed = this.subcribedata.some((sub: { PLAN_ID: any; }) => sub.PLAN_ID === plan.ID);
              return {
                ...plan,
                isSubscribed: isSubscribed
              };
            });
          } else if (data['code'] === 303 ||
            data.message == 'Invalid token') {
            this.isloading = false;
            this.loadBookingFlag = false;
            this.signOut();
          } else {
            this.isloading = false;
            this.loadBookingFlag = false;
          }
        },
      );
  }

  getsubcriptiondata1() {
    this.isloading = true;
    this.api
      .getuserSubscriptions(
        0,
        0,
        'SEQ_NO',
        'asc',
        " AND USER_ID = " + this.userID
      )
      .subscribe(
        (data: any) => {
          this.isloading = false;
          this.loadBookingFlag1 = false;
          if (data['code'] === 200 && this.userID) {
            this.subcribedata = data["data"];
            this.cancelled = '';
            this.subscribedPlans = this.plansData.filter((plan: { ID: any; }) =>
              this.subcribedata.some((sub: { PLAN_ID: any; }) => sub.PLAN_ID === plan.ID)
            );
            this.paymentdata = []
            this.plandataaaa = []
            this.mainlist = true
            this.spincuponopen = false;
            this.coupanapplies = false
            this.planwithsubdata = []
            this.planwithsubdata = this.plansData.map((plan: { ID: any; }) => {
              const isSubscribed = this.subcribedata.some((sub: { PLAN_ID: any; }) => sub.PLAN_ID === plan.ID);
              return {
                ...plan,
                isSubscribed: isSubscribed
              };
            });
            this.loadBookingFlag1 = false;

          } else if (
            data['code'] === 303 ||
            data.message == 'Invalid token'
          ) {
            this.isloading = false;
            this.loadBookingFlag1 = false;
            this.signOut();
          } else {
            this.isloading = false;
            this.loadBookingFlag1 = false;
          }
        }, err => {
          this.isloading = false;
          this.loadBookingFlag1 = false;
        });
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

          // this.toastr.success('You have successfully logged out!', 'Success');

          this.router.navigate(['/home']).then(() => {
            window.location.reload();
          });
        },
        error: (errorResponse) => {
          clearAllData();

          // this.toastr.success('You have successfully logged out!', 'Success');

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
  // formatToDDMMYYYY111(inputDate: any): string {
  //   let date: Date;

  //   if (/^\d{2}-\d{2}-\d{4}$/.test(inputDate)) {
  //     const [day, month, year] = inputDate.split('-');
  //     date = new Date(+year, +month - 1, +day);
  //   } else if (/^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
  //     const [year, month, day] = inputDate.split('-');
  //     date = new Date(+year, +month - 1, +day);
  //   } else {
  //     date = new Date(inputDate);
  //   }

  //   if (isNaN(date.getTime())) {
  //     return 'Invalid date';
  //   }

  //   const dd = String(date.getDate()).padStart(2, '0');
  //   const mm = String(date.getMonth() + 1).padStart(2, '0');
  //   const yyyy = date.getFullYear();

  //   return `${yyyy}-${mm}-${dd}`;
  // }
  formatToDDMMYYYY111(inputDate: any): string {
    let date: Date;

    if (inputDate instanceof Date) {
      date = new Date(
        inputDate.getFullYear(),
        inputDate.getMonth(),
        inputDate.getDate()
      );
    }
    else if (/^\d{2}-\d{2}-\d{4}$/.test(inputDate)) {
      // dd-MM-yyyy
      const [day, month, year] = inputDate.split('-').map(Number);
      date = new Date(year, month - 1, day);
    }
    else if (/^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
      // yyyy-MM-dd
      const [year, month, day] = inputDate.split('-').map(Number);
      date = new Date(year, month - 1, day);
    }
    else {
      return 'Invalid date';
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }


  proceedToPay() {
    if (
      localStorage.getItem('memberId') === null ||
      localStorage.getItem('memberId') === undefined ||
      localStorage.getItem('memberId') === '0' ||
      localStorage.getItem('memberId') === ''
    ) {
      this.showLoginModal();
    } else {
      if (this.applycode.length > 0 && !this.coupanapplies) {
        this.toastr.error('Please apply coupon first', 'Error', { timeOut: 4000 });
        return;
      }
      if (!this.isAgreed) {
        this.toastr.error('Please agree to the Terms & Conditions before proceeding', 'Error', { timeOut: 4000 });
        return;
      }
      this.clearTimer();
      this.api.getplans1(0, 0, '', '', ' AND ID=' + this.plandataaaa.ID)
        .subscribe(
          (data: any) => {
            if (data['code'] === 200 && data['count'] > 0) {
              this.isloading = false;
              this.PlanDataForPayment = data["data"][0];
              if (data["data"][0]['STATUS']) {
                // let startDate: any;
                // const planStartStr = this.formatToDDMMYYYY111(this.PlanDataForPayment.PLAN_START_DATE);
                //   const now = new Date();
                // const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
                // const todayStr = this.formatToDDMMYYYY111(today);
                // const d1 = new Date(planStartStr);
                // const d2 = new Date(todayStr);
                // if (d1 > d2) {
                //   startDate = this.datepipe.transform(d1, 'yyyy-MM-dd HH:mm:ss');
                // } else {
                //   startDate = this.datepipe.transform(d2, 'yyyy-MM-dd HH:mm:ss');
                // }

                // let endDate: any;
                // if (this.PlanDataForPayment.VALIDITY_ON_DAYS == 0) {
                //   const planEndStr = this.formatToDDMMYYYY111(this.PlanDataForPayment.PLAN_END_DATE);
                //   var endDate3 = new Date(planEndStr);
                //   endDate = this.datepipe.transform(endDate3, 'yyyy-MM-dd HH:mm:ss');
                // } else {
                //   var endDate2: any = new Date(startDate);
                //   endDate2.setDate(endDate2.getDate() + (this.PlanDataForPayment.VALIDITY_DAYS_FROM_PURCHASE - 1));
                //   endDate = this.datepipe.transform(endDate2, 'yyyy-MM-dd HH:mm:ss');
                // }
                // 1️⃣ TODAY in UTC
                const now = new Date();
                const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

                // 2️⃣ PLAN START DATE in UTC
                let planStartUTC: Date | null = null;
                if (this.PlanDataForPayment.PLAN_START_DATE) {
                  const [y, m, d] = this.PlanDataForPayment.PLAN_START_DATE.split('-').map(Number);
                  planStartUTC = new Date(Date.UTC(y, m - 1, d));
                }

                // 3️⃣ Decide start date
                let startDateUTC: Date = planStartUTC && planStartUTC > todayUTC ? planStartUTC : todayUTC;

                // 4️⃣ PLAN END DATE in UTC
                let endDateUTC: Date;
                if (this.PlanDataForPayment.VALIDITY_ON_DAYS === 0) {
                  const [y, m, d] = this.PlanDataForPayment.PLAN_END_DATE.split('-').map(Number);
                  endDateUTC = new Date(Date.UTC(y, m - 1, d));
                } else {
                  endDateUTC = new Date(startDateUTC);
                  endDateUTC.setUTCDate(endDateUTC.getUTCDate() + (this.PlanDataForPayment.VALIDITY_DAYS_FROM_PURCHASE - 1));
                }

                // 5️⃣ Convert to string in UTC (no offset)
                const startDate = this.datepipe.transform(startDateUTC, 'yyyy-MM-dd HH:mm:ss', 'UTC');
                const todaysDate = this.datepipe.transform(todayUTC, 'yyyy-MM-dd HH:mm:ss', 'UTC');
                const endDate = this.datepipe.transform(endDateUTC, 'yyyy-MM-dd HH:mm:ss', 'UTC');



                this.mainlist = true
                this.loadBookingFlag1 = true;
                const membershipCartData: any = {
                  PLAN_ID: this.PlanDataForPayment.ID,
                  COUPON_CODE: this.applycode,
                  MEMBER_ID: Number(this.userID),
                  CLIENT_ID: 1,
                  START_DATE: startDate,
                  END_DATE: endDate,
                  IS_AGREE_TERMS_CONDITIONS: this.isAgreed ? 1 : 0,
                  SESSION_ID: this.SESSION_ID
                }

                this.api.AddToCartMembershipPlan(membershipCartData).subscribe({
                  next: (response: any) => {
                    if (response?.code == '200') {
                      if (response.PAYABLE_AMOUNT <= 0) {
                        // let endDate: Date;
                        // if (this.PlanDataForPayment.VALIDITY_ON_DAYS == 0) {
                        //   endDate = new Date(this.formatToDDMMYYYY111(this.PlanDataForPayment.PLAN_END_DATE));
                        // } else {
                        //   // endDate = new Date(startDate);
                        //   endDate.setDate(endDate.getDate() + (this.PlanDataForPayment.VALIDITY_DAYS_FROM_PURCHASE - 1));
                        // }


                        const body = {
                          MEMBER_ID: Number(this.userID),
                          CART_ID: response.data,
                          PAYMENT_MODE: 'N',
                          TRANSACTION_ID: '',
                          TRANSACTION_STATUS: 'Success',
                          PAYLOAD: '',
                          RESPONSE_DATA: '',
                          RESPONSE_CODE: 200,
                          RESPONSE_MESSAGE: 'Transaction success',
                          CLIENT_ID: 1,
                          RAZ_ORDER_ID: response.RAZ_ORDER_ID ? response.RAZ_ORDER_ID : null,
                          START_DATE: startDate,
                          PLAN_ID: this.PlanDataForPayment.ID,
                          END_DATE: endDate,
                          SESSION_ID: this.SESSION_ID
                        };
                        this.api.membershipPaymentTransactions(body).subscribe({
                          next: (response: any) => {
                            if (response?.code == '200') {
                              var payload1 = {
                                USER_ID: Number(this.userID),
                                PLAN_ID: this.PlanDataForPayment.ID,
                                CART_ID: body.CART_ID,
                                PAYMENT_MODE: this.PAYMENT_MODE,
                                COUPON_CODE: this.applycode,
                                TRANSACTION_ID: '',
                                TRANSACTION_STATUS: this.TRANSACTION_STATUS,
                                IS_COUPON_APPLIED: this.coupanapplies ? 1 : 0,
                                PAYLOAD: '',
                                RESPONSE_DATA: this.RESPONSE_DATA,
                                RESPONSE_CODE: this.RESPONSE_CODE,
                                MERCHENT_ORDER_ID: this.MERCHENT_ORDER_ID,
                                RESPONSE_MESSAGE: this.RESPONSE_MESSAGE,
                                STATUS: 1,
                                COUPON_ID: this.coupanapplies ? this.plandataaaa.COUPON_ID : 0,
                                START_DATE: startDate,
                                END_DATE: endDate,
                                SESSION_ID: this.SESSION_ID,
                                RAZ_ORDER_ID: ''
                              };


                              this.api.purchaseplns(payload1).subscribe({
                                next: (response: any) => {
                                  if (response?.code == '200') {
                                    this.toastr.success('Payment successful', 'Success');
                                    this.getsubcriptiondata1();
                                  } else if (response?.code === 300) {
                                    this.loadBookingFlag1 = false;
                                    this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 12000 });
                                    this.loadBookingFlag1 = false;
                                  }
                                  else if (response?.code === 404) {
                                    this.loadBookingFlag1 = false;
                                    this.toastr.error(response?.message, 'Error', { timeOut: 12000 });
                                    this.loadBookingFlag1 = false;
                                  } else {
                                    this.loadBookingFlag1 = false;
                                    this.toastr.error('Payment failed', 'Error', { timeOut: 4000 });
                                    this.loadBookingFlag1 = false;
                                  }
                                },
                                error: (err) => {
                                  if (err?.status == 500) {
                                    this.loadBookingFlag1 = false;
                                    this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 12000 });
                                    this.loadBookingFlag1 = false;
                                    setTimeout(() => {
                                      window.location.reload()
                                    }, 500);
                                  }
                                  else if (err?.status == 404) {
                                    this.loadBookingFlag1 = false;
                                    this.toastr.error(err?.error?.message, 'Error', { timeOut: 12000 });
                                    setTimeout(() => {
                                      window.location.reload()
                                    }, 500);
                                  } else {
                                    this.loadBookingFlag1 = false;
                                    this.toastr.error('Something went wrong, please try again later', 'Error', { timeOut: 4000 });
                                    setTimeout(() => {
                                      window.location.reload()
                                    }, 500);
                                  }
                                },
                              });
                            } else if (response?.code == '201') {
                              this.toastr.success('Plan purchased successfully', 'Success');
                              this.getsubcriptiondata1();
                            } else if (response?.code === 300) {
                              this.loadBookingFlag1 = false;
                              this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 4000 });
                              this.loadBookingFlag1 = false;
                            }
                            else if (response?.code === 400) {
                              this.loadBookingFlag1 = false;
                              this.toastr.error(response?.message, 'Error', { timeOut: 4000 });
                              this.loadBookingFlag1 = false;
                            } else if (response?.code === 404) {
                              this.loadBookingFlag1 = false;
                              this.toastr.error(response?.message, 'Error', { timeOut: 4000 });
                              this.loadBookingFlag1 = false;
                            } else {
                              this.loadBookingFlag1 = false;
                              this.toastr.error('Something failed', 'Error', { timeOut: 4000 });
                              this.loadBookingFlag1 = false;
                            }
                          },
                          error: (err) => {

                            if (err?.status == 300) {
                              this.loadBookingFlag1 = false;
                              this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 4000 });
                              this.loadBookingFlag1 = false;
                            }
                            else if (err?.status == 400) {
                              this.loadBookingFlag1 = false;
                              this.toastr.error(err?.error?.message, 'Error', { timeOut: 4000 });
                              this.loadBookingFlag1 = false;
                            } else if (err?.status === 404) {
                              this.loadBookingFlag1 = false;
                              this.toastr.error(err?.error?.message, 'Error', { timeOut: 4000 });
                              this.loadBookingFlag1 = false;

                            } else {
                              this.loadBookingFlag1 = false;
                              this.toastr.error('Error sending Payment.', 'Error', { timeOut: 4000 });
                              this.loadBookingFlag1 = false;
                            }

                          },
                        });
                      } else {
                        const options1 = {

                          key: this.RAZOR_PAY_KEY,
                          amount: response.PAYABLE_AMOUNT * 100,
                          order_id: response.RAZ_ORDER_ID ? response.RAZ_ORDER_ID : null,
                          currency: 'INR',
                          timeout: 600,
                          name: 'Ticket Khidakee',
                          description: 'Membership Payment',
                          handler: async (data: any) => {
                            const body = {
                              MEMBER_ID: Number(this.userID),
                              CART_ID: response.data,
                              PAYMENT_MODE: 'O',
                              TRANSACTION_ID: data.razorpay_payment_id,
                              TRANSACTION_STATUS: 'Success',
                              PAYLOAD: options1,
                              RESPONSE_DATA: data,
                              RESPONSE_CODE: 200,
                              RESPONSE_MESSAGE: 'Transaction success',
                              CLIENT_ID: 1,
                              RAZ_ORDER_ID: response.RAZ_ORDER_ID,
                              PLAN_ID: this.PlanDataForPayment.ID,
                              SESSION_ID: this.SESSION_ID
                            };
                            this.api.membershipPaymentTransactions(body).subscribe({
                              next: (response2: any) => {
                                if (response2?.code == '200') {
                                  var payload1 = {
                                    USER_ID: this.userID,
                                    PLAN_ID: this.PlanDataForPayment.ID,
                                    CART_ID: body.CART_ID,
                                    PAYMENT_MODE: this.PAYMENT_MODE,
                                    COUPON_CODE: this.applycode,
                                    TRANSACTION_ID: data.razorpay_payment_id,
                                    TRANSACTION_STATUS: this.TRANSACTION_STATUS,
                                    IS_COUPON_APPLIED: this.coupanapplies ? 1 : 0,
                                    PAYLOAD: options1,
                                    RESPONSE_DATA: this.RESPONSE_DATA,
                                    RESPONSE_CODE: this.RESPONSE_CODE,
                                    MERCHENT_ORDER_ID: this.MERCHENT_ORDER_ID,
                                    RESPONSE_MESSAGE: this.RESPONSE_MESSAGE,
                                    STATUS: 1,
                                    COUPON_ID: this.coupanapplies ? this.plandataaaa.COUPON_ID : 0,
                                    START_DATE: startDate,
                                    END_DATE: endDate,
                                    SESSION_ID: this.SESSION_ID,
                                    RAZ_ORDER_ID: response.RAZ_ORDER_ID,
                                  };
                                  // console.log(payload1,"payload1")
                                  this.api.purchaseplns(payload1).subscribe({
                                    next: (response: any) => {
                                      if (response?.code == '200') {
                                        this.toastr.success('Payment successful', 'Success');
                                        this.getsubcriptiondata1();
                                      } else if (response?.code === 300) {
                                        this.loadBookingFlag1 = false;
                                        this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 12000 });
                                      }
                                      else if (response?.code === 404) {
                                        this.loadBookingFlag1 = false;
                                        this.toastr.error(response?.message, 'Error', { timeOut: 12000 });
                                      } else {
                                        this.loadBookingFlag1 = false;
                                        this.toastr.error('Payment failed', 'Error', { timeOut: 4000 });
                                      }
                                    },
                                    error: (err) => {
                                      if (err?.status == 500) {
                                        this.loadBookingFlag1 = false;
                                        this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 15000 });
                                        setTimeout(() => {
                                          window.location.reload()
                                        }, 500);
                                      }
                                      else if (err?.status == 404) {
                                        this.loadBookingFlag1 = false;
                                        this.toastr.error(err?.error?.message, 'Error', { timeOut: 15000 });
                                        setTimeout(() => {
                                          window.location.reload()
                                        }, 500);
                                      } else {
                                        this.loadBookingFlag1 = false;
                                        this.toastr.error('Something went wrong, please try again later', 'Error', { timeOut: 4000 });
                                        setTimeout(() => {
                                          window.location.reload()
                                        }, 500);
                                      }
                                    },
                                  });
                                } else if (response2?.code == '201') {
                                  this.toastr.success('Plan purchased successfully', 'Success');
                                  this.getsubcriptiondata1();
                                } else if (response2?.code === 300) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 12000 });
                                  setTimeout(() => {
                                    window.location.reload()
                                  }, 500);
                                }
                                else if (response2?.code === 400 || response2?.code === 404) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error(response2?.message, 'Error', { timeOut: 12000 });
                                  setTimeout(() => {
                                    window.location.reload()
                                  }, 500);
                                }
                                // else if (response?.code === 404) {
                                //   this.loadBookingFlag1 = false;
                                //   this.toastr.error(response?.message, 'Error', { timeOut: 12000 });
                                //   setTimeout(() => {
                                //     window.location.reload()
                                //   }, 500);
                                // } 
                                else {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error('Something failed', 'Error', { timeOut: 4000 });
                                }
                              },
                              error: (err) => {
                                if (err?.status == 500) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 12000 });
                                  setTimeout(() => {
                                    window.location.reload()
                                  }, 500);
                                }
                                else if (err?.status == 400) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error(err?.error?.message, 'Error', { timeOut: 12000 });
                                  setTimeout(() => {
                                    window.location.reload()
                                  }, 500);
                                } else if (err?.status === 404) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error(err?.error?.message, 'Error', { timeOut: 12000 });
                                  setTimeout(() => {
                                    window.location.reload()
                                  }, 500);
                                } else {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error('Error sending Payment.', 'Error', { timeOut: 4000 });
                                  setTimeout(() => {
                                    window.location.reload()
                                  }, 500);
                                }
                              },
                            });
                          },
                          modal: {
                            ondismiss: (res: any) => {
                              this.loadBookingFlag1 = false;
                              this.cancelled = 'Cancelled';
                              const PayloadBody = {
                                MEMBER_ID: Number(this.userID),
                                CART_ID: response.data,
                                PAYMENT_MODE: 'O',
                                TRANSACTION_ID: 0,
                                TRANSACTION_STATUS: 'Cancel',
                                PAYLOAD: options1,
                                RESPONSE_DATA: res == 'timeout' ? "Payment session timed out" : 'Transaction cancelled by user',
                                RESPONSE_CODE: '',
                                RESPONSE_MESSAGE: res == 'timeout' ? "Payment session timed out" : 'Transaction cancelled by user',
                                CLIENT_ID: 1,
                                PLAN_ID: this.PlanDataForPayment.ID,
                                RAZ_ORDER_ID: response.RAZ_ORDER_ID,
                                SESSION_ID: this.SESSION_ID

                              };
                              this.api.membershipPaymentTransactions(PayloadBody).subscribe({
                                next: (response: any) => {
                                  // if (response?.code == '200') {
                                  this.releaseMembership();
                                  if (this.coupanapplies) {
                                    this.clearcuponnewwww()
                                  }
                                  this.toastr.error(res == 'timeout' ? "Payment session timed out" : 'Transaction cancelled by user', 'Error', { timeOut: 4000 });
                                  setTimeout(() => {
                                    window.location.reload()
                                  }, 1000);
                                  // } 
                                  // else if (response?.code === 301) {
                                  //   this.loadBookingFlag1 = false;
                                  //   this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 4000 });
                                  //   this.loadBookingFlag1 = false;
                                  // } else if (response?.code === 300) {
                                  //   this.loadBookingFlag1 = false;
                                  //   this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 4000 });
                                  //   this.loadBookingFlag1 = false;
                                  // }
                                  // else if (response?.code === 400) {
                                  //   this.loadBookingFlag1 = false;
                                  //   this.toastr.error(response?.message, 'Error', { timeOut: 4000 });
                                  //   this.loadBookingFlag1 = false;
                                  // } else if (response?.code === 404) {
                                  //   this.loadBookingFlag1 = false;
                                  //   this.toastr.error(response?.message, 'Error', { timeOut: 4000 });
                                  //   this.loadBookingFlag1 = false;
                                  // } else {
                                  //   this.loadBookingFlag1 = false;
                                  //   this.toastr.error('Something failed', 'Error', { timeOut: 4000 });
                                  //   this.loadBookingFlag1 = false;
                                  // }
                                },
                                error: (err) => {
                                  if (err?.status == 500) {
                                    this.loadBookingFlag1 = false;
                                    this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 12000 });
                                    setTimeout(() => {
                                      window.location.reload()
                                    }, 500);
                                  }
                                  else if (err?.status == 400) {
                                    this.loadBookingFlag1 = false;
                                    this.toastr.error(err?.error?.message, 'Error', { timeOut: 12000 });
                                    setTimeout(() => {
                                      window.location.reload()
                                    }, 500);
                                  } else if (err?.status === 404) {
                                    this.loadBookingFlag1 = false;
                                    this.toastr.error(err?.error?.message, 'Error', { timeOut: 12000 });
                                    setTimeout(() => {
                                      window.location.reload()
                                    }, 500);
                                  } else {
                                    this.loadBookingFlag1 = false;
                                    this.toastr.error('Error sending Payment.', 'Error', { timeOut: 4000 });
                                    setTimeout(() => {
                                      window.location.reload()
                                    }, 500);
                                  }
                                },
                              });


                            }
                          },
                          notes: {
                            Date: todaysDate,
                            CouponCode: this.applycode ? this.applycode : '',
                            CouponDiscount: this.discount ? this.discount : 0,
                            MembershipName: this.PlanDataForPayment?.NAME || ''
                          },
                          prefill: {
                            contact: localStorage.getItem('MOBILE_NO'),
                            email: localStorage.getItem('EMAIL_ID'),
                            name: localStorage.getItem('NAME'),

                          },
                          theme: {
                            color: '#3399cc',
                          },
                        };
                        const razorpay = new Razorpay(options1);
                        razorpay.open();
                        razorpay.on('payment.failed', (response3: any) => {
                          // console.log(response3);
                          // const body = {
                          //   MEMBER_ID: Number(this.userID),
                          //   CART_ID: response3.data,
                          //   PAYMENT_MODE: 'O',
                          //   TRANSACTION_ID: response3.error.metadata.payment_id,
                          //   PAYLOAD: options1,
                          //   TRANSACTION_STATUS: 'Failed',
                          //   TRANSACTION_AMOUNT: response.PAYABLE_AMOUNT,
                          //   RESPONSE_DATA: response3,
                          //   RESPONSE_CODE: response3.error.code,
                          //   MERCHENT_ID: this.RAZOR_PAY_KEY,
                          //   RESPONSE_MESSAGE: 'Transaction Failed',
                          //   CLIENT_ID: 1,
                          //   RAZ_ORDER_ID: response3.RAZ_ORDER_ID,
                          //   PLAN_ID: this.PlanDataForPayment.ID,
                          //   SESSION_ID: this.SESSION_ID
                          // };
                          // this.api.membershipPaymentTransactions(body).subscribe({
                          //   next: (response2: any) => {
                          //     if (response2?.code == '200') {


                          //     } else if (response2?.code === 300) {
                          //       this.loadBookingFlag1 = false;
                          //       this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 12000 });
                          //       setTimeout(() => {
                          //         window.location.reload()
                          //       }, 500);
                          //     }
                          //     else if (response2?.code === 400 || response2?.code === 404) {
                          //       this.loadBookingFlag1 = false;
                          //       this.toastr.error(response2?.message, 'Error', { timeOut: 12000 });
                          //       setTimeout(() => {
                          //         window.location.reload()
                          //       }, 500);
                          //     }

                          //     else {
                          //       this.loadBookingFlag1 = false;
                          //       this.toastr.error('Something failed', 'Error', { timeOut: 4000 });
                          //     }
                          //   },
                          //   error: (err) => {
                          //     if (err?.status == 500) {
                          //       this.loadBookingFlag1 = false;
                          //       this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 12000 });
                          //       setTimeout(() => {
                          //         window.location.reload()
                          //       }, 500);
                          //     }
                          //     else if (err?.status == 400) {
                          //       this.loadBookingFlag1 = false;
                          //       this.toastr.error(err?.error?.message, 'Error', { timeOut: 12000 });
                          //       setTimeout(() => {
                          //         window.location.reload()
                          //       }, 500);
                          //     } else if (err?.status === 404) {
                          //       this.loadBookingFlag1 = false;
                          //       this.toastr.error(err?.error?.message, 'Error', { timeOut: 12000 });
                          //       setTimeout(() => {
                          //         window.location.reload()
                          //       }, 500);
                          //     } else {
                          //       this.loadBookingFlag1 = false;
                          //       this.toastr.error('Error sending Payment.', 'Error', { timeOut: 4000 });
                          //       setTimeout(() => {
                          //         window.location.reload()
                          //       }, 500);
                          //     }
                          //   },
                          // });
                        });
                      }

                    } else if (response?.code === 300) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
                    }
                    else if (response?.code === 404) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error(response?.message, 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
                    } else if (response?.code === 400) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error(response?.message, 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
                    }
                    else {
                      this.loadBookingFlag1 = false;
                      this.toastr.error('An d error occurred while processing your transaction.', 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
                    }
                  },
                  error: (err) => {

                    if (err?.status == 404 || err?.status == 500) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error(err?.error?.message, 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
                      setTimeout(() => {
                        window.location.reload()
                      }, 500);
                    }

                    else {
                      this.loadBookingFlag1 = false;
                      this.toastr.error('An error occurred while processing your transaction.', 'Error', { timeOut: 4000 });
                      setTimeout(() => {
                        window.location.reload()
                      }, 500);
                    }

                  },
                });
              } else {
                this.toastr.error('The selected plan does not exist. Kindly verify and try again.', 'Error', { timeOut: 4000 });
                setTimeout(() => {
                  window.location.reload()
                }, 500);
              }

            } else {
              this.isloading = false;
              this.spincuponopen = false;
              this.toastr.error('Something went wrong, please try again later', 'Error', { timeOut: 4000 });

              setTimeout(() => {
                window.location.reload()
              }, 500);
            }
          },
          () => {
            this.isloading = false;
            this.spincuponopen = false;
          }
        );
    }
  }

  proceedToPaywith0() {
    if (
      localStorage.getItem('memberId') === null ||
      localStorage.getItem('memberId') === undefined ||
      localStorage.getItem('memberId') === '0' ||
      localStorage.getItem('memberId') === ''
    ) {
      this.showLoginModal();
    } else {
      if (this.applycode.length > 0 && !this.coupanapplies) {
        this.toastr.error('Please apply coupon first', 'Error', { timeOut: 4000 });
        return;
      }
      if (!this.isAgreed) {
        this.toastr.error('Please agree to the Terms & Conditions before proceeding', 'Error', { timeOut: 4000 });
        return;
      }
      this.clearTimer();
      this.api.getplans1(0, 0, '', '', ' AND STATUS = 1 AND ID=' + this.plandataaaa.ID)
        .subscribe(
          (data: any) => {
            if (data['code'] === 200 && data['count'] > 0) {
              this.isloading = false;
              this.PlanDataForPayment = data["data"][0];


              if (data["data"][0]['STATUS']) {

                // let startDate: any;

                // const now = new Date();
                // const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
                // const planStart = new Date(this.formatToDDMMYYYY111(this.PlanDataForPayment.START_DATE));

                // if (this.PlanDataForPayment.START_DATE && planStart > today) {
                //   startDate = this.datepipe.transform(planStart, 'yyyy-MM-dd HH:mm:ss');
                // } else {
                //   startDate = this.datepipe.transform(today, 'yyyy-MM-dd HH:mm:ss');
                // }

                // let endDate: Date;
                // if (this.PlanDataForPayment.VALIDITY_ON_DAYS == 0) {
                //   endDate = new Date(this.formatToDDMMYYYY111(this.PlanDataForPayment.PLAN_END_DATE));
                // } else {
                //   endDate = new Date(startDate);
                //   endDate.setDate(endDate.getDate() + (this.PlanDataForPayment.VALIDITY_DAYS_FROM_PURCHASE - 1));
                // }
                let startDate: string;
                let endDate: string;

                // --------------------
                // TODAY (UTC midnight)
                // --------------------
                const now = new Date();
                const todayUTC = new Date(Date.UTC(
                  now.getUTCFullYear(),
                  now.getUTCMonth(),
                  now.getUTCDate()
                ));

                // --------------------
                // PLAN START DATE (UTC safe)
                // --------------------
                let planStartUTC: Date | null = null;

                if (this.PlanDataForPayment.START_DATE) {
                  const [y, m, d] = this.PlanDataForPayment.START_DATE.split('-').map(Number);
                  planStartUTC = new Date(Date.UTC(y, m - 1, d));
                }

                // --------------------
                // Decide START DATE
                // --------------------
                const startDateObj =
                  planStartUTC && planStartUTC > todayUTC
                    ? planStartUTC
                    : todayUTC;

                // --------------------
                // END DATE
                // --------------------
                let endDateObj: Date;

                if (this.PlanDataForPayment.VALIDITY_ON_DAYS === 0) {

                  const [y, m, d] = this.PlanDataForPayment.PLAN_END_DATE.split('-').map(Number);
                  endDateObj = new Date(Date.UTC(y, m - 1, d));

                } else {

                  endDateObj = new Date(startDateObj);
                  endDateObj.setUTCDate(
                    endDateObj.getUTCDate() +
                    (this.PlanDataForPayment.VALIDITY_DAYS_FROM_PURCHASE - 1)
                  );
                }

                // --------------------
                // FORMAT FOR BACKEND (UTC)
                // --------------------
                startDate = this.datepipe.transform(
                  startDateObj,
                  'yyyy-MM-dd HH:mm:ss',
                  'UTC'
                )!;

                endDate = this.datepipe.transform(
                  endDateObj,
                  'yyyy-MM-dd HH:mm:ss',
                  'UTC'
                )!;


                this.mainlist = true
                this.loadBookingFlag1 = true;
                const membershipCartData: any = {
                  PLAN_ID: this.PlanDataForPayment.ID,
                  COUPON_CODE: this.applycode,
                  MEMBER_ID: Number(this.userID),
                  IS_AGREE_TERMS_CONDITIONS: this.isAgreed ? 1 : 0,
                  START_DATE: startDate,
                  END_DATE: endDate,
                  SESSION_ID: this.SESSION_ID

                }
                this.api.AddToCartMembershipPlan(membershipCartData).subscribe({
                  next: (response: any) => {
                    if (response?.code == '200') {
                      const body = {
                        MEMBER_ID: Number(this.userID),
                        CART_ID: response.data,
                        PAYMENT_MODE: 'N',
                        TRANSACTION_ID: '',
                        TRANSACTION_STATUS: 'Success',
                        PAYLOAD: '',
                        RESPONSE_DATA: '',
                        RESPONSE_CODE: 200,
                        RESPONSE_MESSAGE: 'Transaction success',
                        CLIENT_ID: 1,
                        PLAN_ID: this.PlanDataForPayment.ID,
                        RAZ_ORDER_ID: response.RAZ_ORDER_ID ? response.RAZ_ORDER_ID : null,
                        SESSION_ID: this.SESSION_ID
                      };
                      this.api.membershipPaymentTransactions(body).subscribe({
                        next: (response2: any) => {
                          if (response2?.code == '200') {
                            var payload1 = {
                              USER_ID: Number(this.userID),
                              PLAN_ID: this.PlanDataForPayment.ID,
                              CART_ID: body.CART_ID,
                              PAYMENT_MODE: this.PAYMENT_MODE,
                              COUPON_CODE: this.applycode,
                              TRANSACTION_ID: '',
                              TRANSACTION_STATUS: this.TRANSACTION_STATUS,
                              IS_COUPON_APPLIED: this.coupanapplies ? 1 : 0,
                              PAYLOAD: '',
                              RESPONSE_DATA: this.RESPONSE_DATA,
                              RESPONSE_CODE: this.RESPONSE_CODE,
                              MERCHENT_ORDER_ID: this.MERCHENT_ORDER_ID,
                              RESPONSE_MESSAGE: this.RESPONSE_MESSAGE,
                              STATUS: 1,
                              START_DATE: startDate,
                              END_DATE: endDate,
                              COUPON_ID: this.coupanapplies ? this.plandataaaa.COUPON_ID : 0,
                              SESSION_ID: this.SESSION_ID,
                              RAZ_ORDER_ID: response.RAZ_ORDER_ID ? response.RAZ_ORDER_ID : null,
                            };


                            this.api.purchaseplns(payload1).subscribe({
                              next: (response: any) => {
                                if (response?.code == '200') {
                                  this.toastr.success('Plan purchased successfully', 'Success');
                                  this.getsubcriptiondata1();
                                } else if (response?.code === 300) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 12000 });
                                  this.loadBookingFlag1 = false;
                                }
                                else if (response?.code === 404) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error(response?.message, 'Error', { timeOut: 12000 });
                                  this.loadBookingFlag1 = false;
                                } else {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error('Failed to purchase plan', 'Error', { timeOut: 4000 });
                                  this.loadBookingFlag1 = false;
                                }
                              },
                              error: (err) => {
                                if (err?.status == 500) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 12000 });

                                  setTimeout(() => {
                                    window.location.reload()
                                  }, 500);
                                }
                                else if (err?.status == 404) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error(err?.error?.message, 'Error', { timeOut: 12000 });

                                  setTimeout(() => {
                                    window.location.reload()
                                  }, 500);
                                } else {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error('Something went wrong, please try again later', 'Error', { timeOut: 4000 });
                                  setTimeout(() => {
                                    window.location.reload()
                                  }, 500);
                                }

                              },
                            });
                          } else if (response2?.code == '201') {
                            this.toastr.success('Plan purchased successfully', 'Success');
                            this.getsubcriptiondata1();
                          }
                          else if (response2?.code === 300) {
                            this.loadBookingFlag1 = false;
                            this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 4000 });
                            this.loadBookingFlag1 = false;
                          }
                          else if (response2?.code === 400) {
                            this.loadBookingFlag1 = false;
                            this.toastr.error(response2?.message, 'Error', { timeOut: 4000 });
                            this.loadBookingFlag1 = false;
                          } else if (response2?.code === 404) {
                            this.loadBookingFlag1 = false;
                            this.toastr.error(response2?.message, 'Error', { timeOut: 4000 });
                            this.loadBookingFlag1 = false;
                          } else {
                            this.loadBookingFlag1 = false;
                            this.toastr.error('Something failed', 'Error', { timeOut: 4000 });
                            this.loadBookingFlag1 = false;
                          }
                        },
                        error: (err) => {
                          if (err?.status == 500) {
                            this.loadBookingFlag1 = false;
                            this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 12000 });
                            setTimeout(() => {
                              window.location.reload()
                            }, 500);
                          }
                          else if (err?.status == 400) {
                            this.loadBookingFlag1 = false;
                            this.toastr.error(err?.error?.message, 'Error', { timeOut: 12000 });
                            setTimeout(() => {
                              window.location.reload()
                            }, 500);
                          } else if (err?.status === 404) {
                            this.loadBookingFlag1 = false;
                            this.toastr.error(err?.error?.message, 'Error', { timeOut: 12000 });
                            setTimeout(() => {
                              window.location.reload()
                            }, 500);
                          } else {
                            this.loadBookingFlag1 = false;
                            this.toastr.error('Error sending Payment.', 'Error', { timeOut: 4000 });
                            setTimeout(() => {
                              window.location.reload()
                            }, 500);
                          }
                        },
                      });

                    } else if (response?.code === 300) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 4000 });

                    }
                    else if (response?.code === 404) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error(response?.message, 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
                    } else if (response?.code === 400) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error("Applied coupon is invalid", 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
                    } else {
                      this.loadBookingFlag1 = false;
                      this.toastr.error('An error occurred while processing your transaction.', 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
                    }
                  },
                  error: (err) => {
                    if (err?.status == 300) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
                      setTimeout(() => {
                        window.location.reload()
                      }, 500);
                    }
                    else if (err?.status == 404) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error(err?.error?.message, 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
                      setTimeout(() => {
                        window.location.reload()
                      }, 500);
                    } else if (err?.status == 400) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error("Applied coupon is invalid ", 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
                      setTimeout(() => {
                        window.location.reload()
                      }, 500);
                    } else {
                      this.loadBookingFlag1 = false;
                      this.toastr.error('An error occurred while processing your transaction.', 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
                    }
                  },
                });
              } else {
                this.toastr.error('The selected plan does not exist. Kindly verify and try again.', 'Error', { timeOut: 4000 });
                setTimeout(() => {
                  window.location.reload()
                }, 500);
              }
            } else {
              this.toastr.error('Something went wrong, please try again later', 'Error', { timeOut: 4000 });
              this.isloading = false;
              this.spincuponopen = false;
              setTimeout(() => {
                window.location.reload()
              }, 500);

            }
          },
          () => {
            this.isloading = false;
            this.spincuponopen = false;
          })
    }

  }

  openLogin(plandd: any) {
    if (
      localStorage.getItem('memberId') === null ||
      localStorage.getItem('memberId') === undefined ||
      localStorage.getItem('memberId') === '0' ||
      localStorage.getItem('memberId') === ''
    ) {
      this.showLoginModal();
    }
    else {
      this.getClickedPlanDetails(plandd);

    }
  }

  proceedaftercoupandata(plandd: any) {
    this.isloading = true;
  }

  paymentdata: any
  spincuponopen: boolean = false
  coupanapplies: boolean = false
  applycode: any = ''
  clearcupon() {
    const payload = {
      "COUPON_CODE": this.applycode,
      "MEMBER_ID": Number(this.userID),
      "PLAN_ID": this.plandataaaa.ID,
      SESSION_ID: this.SESSION_ID
    }

    this.api.removeCouponforplan(payload).subscribe({
      next: (successCode: any) => {
        if (successCode.code == '200') {
          this.toastr.success(
            'Coupon removed successfully.',
            'Success'
          );
          this.applycode = '';
          this.baseAmount = successCode.data["baseAmount"];
          this.discount = 0;
          this.cgstAmount = successCode.data["cgstAmount"];
          this.convenienceFee = successCode.data["convenienceFee"];
          this.sgstAmount = successCode.data["sgstAmount"];
          this.totalAmount = successCode.data["totalAmount"];
          this.plandataaaa.COUPON_ID = successCode.data.COUPON_ID
          this.plandataaaa.COUPON_DISCOUNT = 0;
          this.plandataaaa.CONVIENCE_FEE = successCode.data["convenienceFee"];

          this.plandataaaa.SGSTPrice = Number(successCode.data["sgstAmount"]).toFixed(2);
          this.plandataaaa.CGSTPrice = Number(successCode.data["cgstAmount"]).toFixed(2);
          this.plandataaaa.TOTAL_AMOUNT = successCode.data["totalAmount"];
          this.spincuponopen = false;
          this.coupanapplies = false;
          this.applycode = '';
        } else if (successCode.code == 300 || successCode.code == 302 || successCode.code == 311 || successCode.code == 310 || successCode.code == 404) {
          this.toastr.info(
            successCode.message,
            'Info'
          );
          this.spincuponopen = false;
          this.coupanapplies = false;
        } else if (successCode.status == 301) {
          this.toastr.error('Something went wrong.Please try later.', 'Error', { timeOut: 4000 });
          this.spincuponopen = false;
          this.coupanapplies = false;
          this.goBack();
        }
        else {
          this.spincuponopen = false;
          this.coupanapplies = false;
          this.toastr.error('Failed to removed Coupon. Please try again.', 'Error', { timeOut: 4000 });
        }
      },
      error: (err) => {
        // this.spincuponopen = false;
        // this.toastr.error(
        //   'Error in removed Coupon. Please try again later.',
        //   'Error'
        // );
        if (err?.status == 500) {
          this.spincuponopen = false;
          this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 4000 });

          setTimeout(() => {
            window.location.reload()
          }, 500);
        }
        else if (err?.status == 404) {
          this.spincuponopen = false;
          this.toastr.error(err?.error?.message, 'Error', { timeOut: 4000 });

          setTimeout(() => {
            window.location.reload()
          }, 500);
        } else if (err?.status == 400) {
          this.spincuponopen = false;
          this.toastr.error("Applied coupon is invalid ", 'Error', { timeOut: 4000 });

          setTimeout(() => {
            window.location.reload()
          }, 500);
        } else {
          this.spincuponopen = false;
          this.toastr.error('An error occurred while processing your transaction.', 'Error', { timeOut: 4000 });
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      },
      complete: () => {
        this.spincuponopen = false;
      },
    });
  }

  releaseMembership() {
    const body = {
      "MEMBER_ID": Number(this.userID),
      "PLAN_ID": this.plandataaaa.ID,
      SESSION_ID: this.SESSION_ID
    }

    this.api.releaseMembership(body).subscribe({
      next: (successCode: any) => {
      },
      error: (err) => {
      },
      complete: () => {
        this.spincuponopen = false;
      },
    });
  }

  goBack() {
    this.releaseMembership();
    this.clearTimer();
    if (this.coupanapplies) {
      this.clearcuponnewwww()
    }
    this.paymentdata = [];
    this.plandataaaa = [];
    this.mainlist = true;
    this.spincuponopen = false;
    this.coupanapplies = false;
    this.applycode = '';
    this.plandataaaa.COUPON_DISCOUNT = 0;
    this.discount = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  clearcuponnewwww() {
    const payload = {
      "COUPON_CODE": this.applycode,
      "MEMBER_ID": this.userID,
      "PLAN_ID": this.plandataaaa.ID,
      SESSION_ID: this.SESSION_ID
    }

    this.api.removeCouponforplan(payload).subscribe({
      next: (successCode: any) => {
        this.applycode = '';
        this.coupanapplies = false;
        this.paymentdata = [];
        this.plandataaaa = [];
        this.mainlist = true;
        this.spincuponopen = false;
        // window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  }

  stripHtmlTags(value: string): string {
    return value
      ? value
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      : '';
  }

  isAgreed: boolean = false;

  getSanitizedHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getTextLength(html: string): number {
    if (!html) return 0;
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.length;
  }

  baseAmount = 0;
  cgstAmount = 0;
  convenienceFee = 0;
  sgstAmount = 0;
  totalAmount = 0;

  getClickedPlanDetails(plandata: any) {
    this.loadsubscribe[plandata.ID] = true;
    this.api.calculatePlanDetails(plandata.ID, this.userID, this.SESSION_ID)
      .subscribe(
        (data: any) => {
          if (data['code'] === 200) {
            this.isloading = false;
            this.loadsubscribe[plandata.ID] = false;
            this.ClickedPlanData = data["data"][0];
            this.isAgreed = false;
            if (data["data"][0]['STATUS']) {
              this.spincuponopen = false;
              this.coupanapplies = false
              this.plandataaaa = []
              this.applycode = '';
              this.baseAmount = data["baseAmount"];
              this.cgstAmount = data["cgstAmount"];
              this.convenienceFee = data["convenienceFee"];
              this.sgstAmount = data["sgstAmount"];
              this.totalAmount = data["totalAmount"];
              this.plandataaaa = this.ClickedPlanData;
              this.original_convience_fee = this.ClickedPlanData.CONVIENCE_FEE ? this.ClickedPlanData.CONVIENCE_FEE : 0;

              this.mainlist = false;
              this.startTimerIfStep4();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              this.toastr.error('The selected plan does not exist. Kindly verify and try again.', 'Error', { timeOut: 4000 });
              setTimeout(() => {
                window.location.reload()
              }, 500);
            }
          } else {
            this.loadsubscribe[plandata.ID] = false;
            this.isloading = false;
            this.toastr.error('The selected plan does not exist. Kindly verify and try again.', 'Error', { timeOut: 4000 });
            // setTimeout(() => {
            //   window.location.reload()
            // }, 500);
          }
        },
        (error) => {
          if (error.status == 500 || error.status == 400) {
            this.isloading = false;
            this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 4000 });
          }
          else if (error.status == 404) {
            this.isloading = false;
            this.toastr.error(error.error?.message, 'Error', { timeOut: 4000 });

          } else {
            this.isloading = false;
            this.toastr.error('An error occurred while processing your transaction.', 'Error', { timeOut: 4000 });
          }
          this.loadsubscribe[plandata.ID] = false;
          this.isloading = false;
        }
      );
  }
  discount = 0;
  applyforcupon() {
    this.spincuponopen = true
    this.coupanapplies = false;
    this.discount = 0;
    if (this.applycode == undefined || this.applycode == null || this.applycode == "") {
      this.spincuponopen = false
      this.toastr.error('Please enter a coupon code.', 'Error', { timeOut: 4000 });
    } else {

      this.api.getplans1(
        0,
        0,
        '',
        '',
        ' AND ID=' + this.plandataaaa.ID
      )
        .subscribe(
          (data: any) => {
            if (data['code'] === 200 && data['count'] > 0) {
              this.isloading = false;
              this.PlanDataForCoupon = data["data"][0];
              if (data["data"][0]['STATUS']) {
                const payload = {
                  COUPON_CODE: this.applycode,
                  PLAN_ID: this.PlanDataForCoupon.ID,
                  MEMBER_ID: this.userID,
                  SESSION_ID: this.SESSION_ID
                }

                this.api.applyCouponforplan(payload).subscribe({
                  next: (successCode: any) => {
                    if (successCode.code == '200') {
                      this.toastr.success(
                        'Coupon applied successfully.',
                        'Success'
                      );
                      this.baseAmount = successCode.data["baseAmount"];
                      this.discount = successCode.data["discount"];
                      this.cgstAmount = successCode.data["cgstAmount"];
                      this.convenienceFee = successCode.data["convenienceFee"];
                      this.sgstAmount = successCode.data["sgstAmount"];
                      this.totalAmount = successCode.data["totalAmount"];
                      this.plandataaaa.COUPON_ID = successCode.data.COUPON_ID
                      this.spincuponopen = false;
                      this.coupanapplies = true
                    } else
                      if (
                        successCode.code == 300
                        || successCode.code == 302
                        || successCode.code == 311
                        || successCode.code == 310) {
                        this.toastr.info(
                          successCode.message,
                          'Info'
                        );
                        this.spincuponopen = false;
                        this.coupanapplies = false;
                      } else if (successCode.code == 404 || successCode.code == 403 || successCode.code == 405) {
                        this.toastr.info(
                          successCode.message,
                          'Info'
                        );
                        this.spincuponopen = false;
                        this.coupanapplies = false;
                      } else if (successCode.code == 301) {
                        this.toastr.info(
                          successCode.message,
                          'Info'
                        );
                        this.spincuponopen = false;
                        this.coupanapplies = false;
                        this.goBack();
                      }
                      else {
                        this.spincuponopen = false;
                        this.coupanapplies = false
                        this.toastr.error('Invalid Coupon Code. Please try again.', 'Error', { timeOut: 4000 });
                      }
                  },
                  error: (err) => {
                    this.spincuponopen = false;

                    //'planid not valid' || 'memberid not valid'
                    if (err?.status == 301) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 4000 });
                      setTimeout(() => {
                        window.location.reload()
                      }, 500);
                    }
                    else if (err?.status == 404) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error(err?.error?.message, 'Error', { timeOut: 4000 });

                    } else if (err?.status == 400 || err?.status == 500) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 4000 });
                      setTimeout(() => {
                        window.location.reload()
                      }, 500);
                    } else {
                      this.loadBookingFlag1 = false;
                      this.toastr.error('An error occurred while processing your transaction.', 'Error', { timeOut: 4000 });

                    }
                  },
                  complete: () => {
                    this.spincuponopen = false;
                  },
                });
              } else {
                this.toastr.error('The selected plan does not exist. Kindly verify and try again.', 'Error', { timeOut: 4000 });
                setTimeout(() => {
                  window.location.reload()
                }, 500);
              }

            } else {
              this.isloading = false;
              this.spincuponopen = false;
              this.toastr.error('Something went wrong, please try again later', 'Error', { timeOut: 4000 });

              setTimeout(() => {
                window.location.reload()
              }, 500);
            }
          },
          () => {
            this.isloading = false;
            this.spincuponopen = false;
          }
        );
    }
  }
  countdown: number = 240;
  intervalId: any;

  getFormattedCountdown(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  timer: any
  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    } else {
      this.timer = null
    }
  }
  startTimerIfStep4() {
    if (this.mainlist == false) {
      this.clearTimer(); // Clear any previous timer
      this.countdown = 240; // Reset timer to 4 minutes

      const duration = this.countdown * 1000; // milliseconds
      const startTime = performance.now();

      this.timer = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const remaining = Math.max(0, Math.floor((duration - elapsed) / 1000));
        this.countdown = remaining;

        if (remaining == 0) {
          this.releaseMembership();
          if (this.coupanapplies) {
            this.clearcuponnewwww()
          }

          this.clearTimer();
        }
      }, 1000);
    } else {
      this.clearTimer();
    }
  }

  ngOnDestroy(): void {
    if (this.mainlist == false) {
      this.releaseMembership();
    }
    if (this.coupanapplies) {
      this.clearcuponnewwww()
    }
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    } else {
      this.timer = null
    }
  }
}
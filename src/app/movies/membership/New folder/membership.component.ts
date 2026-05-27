import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
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
  ngOnInit() {
    this.getplans();
    this.applycode = ''
  }
  getplans() {
    this.isloading = true;

    this.api.getplans1(
      this.pageIndex,
      this.pageSize,
      'SEQ_NO',
      'asc',
      ' AND STATUS = 1'
    )
      .subscribe(
        (data: any) => {
          if (data['code'] === 200) {
            const today = new Date().toISOString().split('T')[0];
            const currentDate = new Date(today);

            if (this.userID) {
              this.plansData = data["data"];

              this.plansData = this.plansData.filter((plan: any) => {
                const planStartDate = new Date(this.formatToDDMMYYYY111(plan.PLAN_VISIBLITY_START_DATE));
                const planEndDate = new Date(this.formatToDDMMYYYY111(plan.PLAN_VISIBLITY_END_DATE));
                return planStartDate <= currentDate && planEndDate >= currentDate;
              });
              this.isloading = false;
              this.getsubcriptiondata();
            } else {
              this.planwithsubdata = data["data"];

              this.planwithsubdata = this.planwithsubdata.filter((plan: any) => {
                const planStartDate = new Date(this.formatToDDMMYYYY111(plan.PLAN_VISIBLITY_START_DATE));
                const planEndDate = new Date(this.formatToDDMMYYYY111(plan.PLAN_VISIBLITY_END_DATE));
                return planStartDate <= currentDate && planEndDate >= currentDate;
              });
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
  formatToDDMMYYYY111(inputDate: any): string {
    let date: Date;

    if (/^\d{2}-\d{2}-\d{4}$/.test(inputDate)) {
      const [day, month, year] = inputDate.split('-');
      date = new Date(+year, +month - 1, +day);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
      const [year, month, day] = inputDate.split('-');
      date = new Date(+year, +month - 1, +day);
    } else {
      date = new Date(inputDate);
    }

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

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
      this.api.getplans1(0, 0, '', '', ' AND ID=' + this.plandataaaa.ID)
        .subscribe(
          (data: any) => {
            if (data['code'] === 200 && data['count'] > 0) {
              this.isloading = false;
              this.PlanDataForPayment = data["data"][0];
              if (data["data"][0]['STATUS']) {
                let startDate: any;
                const planStartStr = this.formatToDDMMYYYY111(this.PlanDataForPayment.PLAN_START_DATE);
                const todayStr = this.formatToDDMMYYYY111(new Date());
                const d1 = new Date(planStartStr);
                const d2 = new Date(todayStr);
                if (d1 > d2) {
                  startDate = this.datepipe.transform(d1, 'yyyy-MM-dd HH:mm:ss');
                } else {
                  startDate = this.datepipe.transform(d2, 'yyyy-MM-dd HH:mm:ss');
                }

                let endDate: Date;
                if (this.PlanDataForPayment.VALIDITY_ON_DAYS == 0) {
                  const planEndStr = this.formatToDDMMYYYY111(this.PlanDataForPayment.PLAN_END_DATE);
                  endDate = new Date(planEndStr);
                } else {
                  endDate = new Date(startDate);
                  endDate.setDate(endDate.getDate() + (this.PlanDataForPayment.VALIDITY_DAYS_FROM_PURCHASE - 1));
                }
                this.mainlist = true
                this.loadBookingFlag1 = true;
                const membershipCartData: any = {
                  PLAN_ID: this.PlanDataForPayment.ID,
                  COUPON_CODE: this.applycode,
                  MEMBER_ID: Number(this.userID),
                  CLIENT_ID: 1,
                  IS_AGREE_TERMS_CONDITIONS: this.isAgreed ? 1 : 0
                }
                // console.log("123456", membershipCartData)
                this.api.AddToCartMembershipPlan(membershipCartData).subscribe({
                  next: (response: any) => {
                    if (response?.code == '200') {
                      if (response.PAYABLE_AMOUNT <= 0) {
                        let endDate: Date;
                        if (this.PlanDataForPayment.VALIDITY_ON_DAYS == 0) {
                          endDate = new Date(this.formatToDDMMYYYY111(this.PlanDataForPayment.PLAN_END_DATE));
                        } else {
                          endDate = new Date(startDate);
                          endDate.setDate(endDate.getDate() + (this.PlanDataForPayment.VALIDITY_DAYS_FROM_PURCHASE - 1));
                        }
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
                          RAZ_ORDER_ID: response.RAZ_ORDER_ID ? response.RAZ_ORDER_ID : null
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
                                COUPON_ID: this.coupanapplies ? this.plandataaaa.COUPON_ID : 0
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
                                  if (err?.status == 300) {
                                    this.loadBookingFlag1 = false;
                                    this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 12000 });
                                    this.loadBookingFlag1 = false;
                                  }
                                  else if (err?.status == 404) {
                                    this.loadBookingFlag1 = false;
                                    this.toastr.error(err?.error?.message, 'Error', { timeOut: 12000 });
                                  } else {
                                    this.loadBookingFlag1 = false;
                                    this.toastr.error('Something went wrong, please try again later', 'Error', { timeOut: 4000 });
                                    this.loadBookingFlag1 = false;
                                  }
                                },
                              });
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
                              RAZ_ORDER_ID: response.RAZ_ORDER_ID
                            };
                            this.api.membershipPaymentTransactions(body).subscribe({
                              next: (response: any) => {
                                if (response?.code == '200') {
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
                                    COUPON_ID: this.coupanapplies ? this.plandataaaa.COUPON_ID : 0
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
                                      if (err?.status == 300) {
                                        this.loadBookingFlag1 = false;
                                        this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 15000 });
                                      }
                                      else if (err?.status == 404) {
                                        this.loadBookingFlag1 = false;
                                        this.toastr.error(err?.error?.message, 'Error', { timeOut: 15000 });
                                      } else {
                                        this.loadBookingFlag1 = false;
                                        this.toastr.error('Something went wrong, please try again later', 'Error', { timeOut: 4000 });
                                      }
                                    },
                                  });
                                } else if (response?.code === 300) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 12000 });
                                }
                                else if (response?.code === 400) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error(response?.message, 'Error', { timeOut: 12000 });
                                } else if (response?.code === 404) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error(response?.message, 'Error', { timeOut: 12000 });
                                } else {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error('Something failed', 'Error', { timeOut: 4000 });
                                }
                              },
                              error: (err) => {
                                if (err?.status == 300) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 12000 });
                                }
                                else if (err?.status == 400) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error(err?.error?.message, 'Error', { timeOut: 12000 });
                                } else if (err?.status === 404) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error(err?.error?.message, 'Error', { timeOut: 12000 });
                                } else {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error('Error sending Payment.', 'Error', { timeOut: 4000 });
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
                                RAZ_ORDER_ID: response.RAZ_ORDER_ID

                              };
                              this.api.membershipPaymentTransactions(PayloadBody).subscribe({
                                next: (response: any) => {
                                  if (response?.code == '200') {
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
                              if (this.coupanapplies) {
                                this.clearcuponnewwww()
                              }
                              this.getsubcriptiondata1();
                            }
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
                    if (err?.status == 300) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
                    }
                    else if (err?.status == 404) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error(err?.error?.message, 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
                    } else if (err?.status == 400) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error("Applied coupon is invalid ", 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
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

      this.api.getplans1(0, 0, '', '', ' AND STATUS = 1 AND ID=' + this.plandataaaa.ID)
        .subscribe(
          (data: any) => {
            if (data['code'] === 200 && data['count'] > 0) {
              this.isloading = false;
              this.PlanDataForPayment = data["data"][0];


              if (data["data"][0]['STATUS']) {
                let startDate: any;
                const today = new Date();
                const planStart = new Date(this.formatToDDMMYYYY111(this.PlanDataForPayment.START_DATE));

                if (this.PlanDataForPayment.START_DATE && planStart > today) {
                  startDate = this.datepipe.transform(planStart, 'yyyy-MM-dd HH:mm:ss');
                } else {
                  startDate = this.datepipe.transform(today, 'yyyy-MM-dd HH:mm:ss');
                }

                let endDate: Date;
                if (this.PlanDataForPayment.VALIDITY_ON_DAYS == 0) {
                  endDate = new Date(this.formatToDDMMYYYY111(this.PlanDataForPayment.PLAN_END_DATE));
                } else {
                  endDate = new Date(startDate);
                  endDate.setDate(endDate.getDate() + (this.PlanDataForPayment.VALIDITY_DAYS_FROM_PURCHASE - 1));
                }
                this.mainlist = true
                this.loadBookingFlag1 = true;
                const membershipCartData: any = {
                  PLAN_ID: this.PlanDataForPayment.ID,
                  COUPON_CODE: this.applycode,
                  MEMBER_ID: Number(this.userID),
                  IS_AGREE_TERMS_CONDITIONS: this.isAgreed ? 1 : 0

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
                        RAZ_ORDER_ID: response.RAZ_ORDER_ID ? response.RAZ_ORDER_ID : null
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
                              COUPON_ID: this.coupanapplies ? this.plandataaaa.COUPON_ID : 0
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
                                if (err?.status == 300) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error("Something went wrong, please try again later", 'Error', { timeOut: 12000 });
                                  this.loadBookingFlag1 = false;
                                }
                                else if (err?.status == 404) {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error(err?.error?.message, 'Error', { timeOut: 12000 });
                                  this.loadBookingFlag1 = false;
                                } else {
                                  this.loadBookingFlag1 = false;
                                  this.toastr.error('Something went wrong, please try again later', 'Error', { timeOut: 4000 });
                                  this.loadBookingFlag1 = false;
                                }

                              },
                            });
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
                    }
                    else if (err?.status == 404) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error(err?.error?.message, 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
                    } else if (err?.status == 400) {
                      this.loadBookingFlag1 = false;
                      this.toastr.error("Applied coupon is invalid ", 'Error', { timeOut: 4000 });
                      this.loadBookingFlag1 = false;
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
    }

    this.api.removeCouponforplan(payload).subscribe({
      next: (successCode: any) => {
        if (successCode.code == '200') {
          this.toastr.success(
            'Coupon removed successfully.',
            'Success'
          );
          this.applycode = ''
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
          this.coupanapplies = false
          this.applycode = ''
        } else if (successCode.code == 300 || successCode.code == 301 || successCode.code == 302 || successCode.code == 311 || successCode.code == 310 || successCode.code == 404) {
          this.toastr.info(
            successCode.message,
            'Info'
          );
          this.spincuponopen = false;
          this.coupanapplies = false
        }
        else {
          this.spincuponopen = false;
          this.coupanapplies = false
          this.toastr.error('Failed to removed Coupon. Please try again.', 'Error', { timeOut: 4000 });
        }
      },
      error: () => {
        this.spincuponopen = false;
        this.toastr.error(
          'Error in removed Coupon. Please try again later.',
          'Error'
        );
      },
      complete: () => {
        this.spincuponopen = false;
      },
    });
  }

  goBack() {
    if (this.coupanapplies) {
      this.clearcuponnewwww()
    }
    this.paymentdata = []
    this.plandataaaa = []
    this.mainlist = true
    this.spincuponopen = false;
    this.coupanapplies = false
    this.applycode = ''
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }



  clearcuponnewwww() {
    const payload = {
      "COUPON_CODE": this.applycode,
      "MEMBER_ID": this.userID
    }

    this.api.removeCouponforplan(payload).subscribe({
      next: (successCode: any) => {
        this.applycode = ''
        this.coupanapplies = false
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
    this.api.calculatePlanDetails(plandata.ID, this.userID)
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

              this.mainlist = false
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
            setTimeout(() => {
              window.location.reload()
            }, 500);
          }
        },
        () => {
          this.loadsubscribe[plandata.ID] = false;
          this.isloading = false;
        }
      );
  }
  discount = 0;
  applyforcupon() {
    this.spincuponopen = true
    this.coupanapplies = false
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
                  MEMBER_ID: this.userID
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
                    } else if (successCode.code == 300 || successCode.code == 301 || successCode.code == 302 || successCode.code == 311 || successCode.code == 310 || successCode.code == 404) {
                      this.toastr.info(
                        successCode.message,
                        'Info'
                      );
                      this.spincuponopen = false;
                      this.coupanapplies = false
                    }
                    else {
                      this.spincuponopen = false;
                      this.coupanapplies = false
                      this.toastr.error('Invalid Coupon Code. Please try again.', 'Error', { timeOut: 4000 });

                    }
                  },
                  error: () => {
                    this.spincuponopen = false;
                    this.toastr.error(
                      'Invalid Coupon Code. Please try again later.',
                      'Error'
                    );
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
}
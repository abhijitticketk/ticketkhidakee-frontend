import {
    AfterViewChecked,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    NgZone,
    ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Services/api.service';
import { CommonFunctionService } from 'src/app/Services/CommonFunctionService';
declare const bootstrap: any; // Declare bootstrap variable
declare var Razorpay: any;
import Konva from 'konva';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import * as QRCode from 'qrcode';
import { Location } from '@angular/common';
import { environment } from 'src/app/environment';
import { ReCaptcha2Component } from 'ngx-captcha';
import { ThemeService } from 'src/app/Services/theme.service';



declare var Tugoz: any;

@Component({
    selector: 'app-booking-common-page',
    templateUrl: './booking-common-page.component.html',
    styleUrls: ['./booking-common-page.component.scss']
})
export class BookingCommonPageComponent implements AfterViewChecked {

    seatJsonData: any;
    @ViewChild('closelogin') closelogin!: ElementRef;

    @ViewChild('seatLayoutContainer', { static: false }) seatLayoutContainerRef!: ElementRef;
    @ViewChild('konvaSeatContainer', { static: false }) konvaSeatContainerRef!: ElementRef;
    konvaStageInstance!: Konva.Stage;
    konvaLayoutData: any;
    public commonFunction = new CommonFunctionService();
    availability: { [section: string]: number } = {};
    isFailureProcessing = false;
    private subs: Subscription[] = [];

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private el: ElementRef,
        public location: Location,
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private apiService: ApiService,
        private router: Router,
        private userService: CommonFunctionService,
        private datepipe: DatePipe,
        private zone: NgZone,
        private themeService: ThemeService
    ) {
        this.playName = this.route.snapshot.paramMap.get('playname') || '';
        this.playId = this.route.snapshot.paramMap.get('id') || '';
        this.playtype = this.route.snapshot.paramMap.get('playtype') || '';
        const today = new Date();
        this.currentMonth = today.getMonth(); // This should be 0-11
        this.currentYear = today.getFullYear();
    }
    isDark = false;
    IS_EXTRA_INFO_REQUIRED = false;

    private pendingKonvaRender = false;

    ngAfterViewChecked(): void {
        if (this.pendingKonvaRender) {
            const container = document.getElementById('konva-seat-container');
            if (container && container.clientWidth > 0) {
                this.pendingKonvaRender = false;
                // Run outside Angular to avoid triggering more change detection
                this.zone.runOutsideAngular(() => {
                    setTimeout(() => this.renderKonvaSeatChart(), 0);
                });
            }
        }
    }
    bookingFlagDetails: any = [];
    loadBookingFlag: boolean = false;
    selectedcategoryId: any;
    countdown1: number = 15;
    intervalId: any;
    eventID: any;
    memberId: any;
    userID: any = this.userService.getUserId();
    sectionUpdateSub!: Subscription;
    ticketReleaseSub!: Subscription;
    BOOKING_DATE_START: any;
    BOOKING_DATE_END: any;
    CHECK_DATE_START: any;
    EARLY_ACCESS_DATE: any;
    SESSION_ID = ''
    disabledfor5sec = 10;
    groupedSeats2: any[] = [];

    private clearSessionId(): void {
        this.SESSION_ID = '';
        sessionStorage.removeItem('sessionid');
    }
    private cleanupTabUuid(): void {
        const tabUuid = sessionStorage.getItem('TAB_UUID');
        if (!tabUuid) return;
        const TAB_UUID_KEY = 'all_open_tabs';
        try {
            const list = JSON.parse(localStorage.getItem(TAB_UUID_KEY) || '[]');
            if (Array.isArray(list)) {
                const next = list.filter((id: string) => id !== tabUuid);
                if (next.length > 0) {
                    localStorage.setItem(TAB_UUID_KEY, JSON.stringify(next));
                } else {
                    localStorage.removeItem(TAB_UUID_KEY);
                }
            }
        } catch {
            // If storage is corrupted, just reset it.
            localStorage.removeItem(TAB_UUID_KEY);
        }
    }
    private isPageUnloading = false;
    private clearSessionIdOnUnload = false;
    private stopAllTimers(): void {
        this.clearTimer();
        this.stopTimer();
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.interval2) {
            clearInterval(this.interval2);
            this.interval2 = null;
        }
    }
    ngAfterViewInit(): void {

        this.tugozInstance = new Tugoz(125, false, 'tugoz-container');



        this.themeService.isDarkMode$().subscribe((dark) => {
            this.isDark = dark;

        });

    }

    isMobileScreens: Boolean = false;
    @HostListener('window:beforeunload', ['$event'])
    onBeforeUnload(event: BeforeUnloadEvent) {
        this.isPageUnloading = true;
        let sessionId = sessionStorage.getItem('sessionid') || this.SESSION_ID;
        if (!sessionId) {
            sessionId = this.generateTabSessionId();
            this.SESSION_ID = sessionId;
        }
        if (this.activeStep === 4) {

            const data = JSON.stringify({

                SEAT_NUMBERS: this.allpayyload?.SEAT_NUMBERS,
                HOSTING_TYPE: this.Hoisting_Type,
                RESERVATION_MODE: this.selectedVenue.RESERVATION_MODE,
                EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                TEMP_UNIQUE_ID: localStorage.getItem('deviceId'),
                SESSION_ID: sessionId,
                BENEFIT_APPLY: this.BENEFIT_APPLY,
                TEMP_HOLD_ID: this.TEMP_HOLD_ID,
                IS_PLAN_USED: !!this.selectedmembership?.ID,
                PLAN_ID:
                    this.selectedmembership?.ID != undefined &&
                        this.selectedmembership?.ID != ''
                        ? this.selectedmembership.ID
                        : null,
                MEMBER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                ...this.allpayyload,

            });

            sessionStorage.setItem('relase', data);
            sessionStorage.setItem('active', '4');


            if (this.coupanapplies == true) {
                var payload =
                    JSON.stringify({
                        "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                        "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
                        SESSION_ID: sessionId,
                        COUPON_CODE: this.applycode,
                        MEMBER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                        EVENT_DETAIL_ID: this.bookingMeta?.ID,
                        VENUE_ID: this.selectedVenue.id,
                        EVENT_ID: this.eventID,
                        CATEGORY_ID: this.selectedcategoryId,
                        CITY_ID: this.selectedVenue.CITY_ID
                    });
                sessionStorage.setItem('relasecoupon', payload);
            } else {
                sessionStorage.setItem('relasecoupon', '');
            }
        }
        if (this.activeStep === 3) {

            const data = JSON.stringify({

                EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                TEMP_UNIQUE_ID: localStorage.getItem('deviceId'),
                SESSION_ID: sessionId,
                IS_PLAN_USED: !!this.selectedmembership?.ID,
                PLAN_ID:
                    this.selectedmembership?.ID != undefined &&
                        this.selectedmembership?.ID != ''
                        ? this.selectedmembership.ID
                        : null,


            });

            sessionStorage.setItem('release2', data);
            sessionStorage.setItem('active2', '3');
        }

        if (this.clearSessionIdOnUnload) {
            this.clearSessionId();
            this.cleanupTabUuid();
        }
    }
    ngOnInit() {
        let deviceId = localStorage.getItem('deviceId');

        if (deviceId == undefined || deviceId == null || deviceId == '' || deviceId == ' ') {
            deviceId = this.apiService.generateUUID();
            if (deviceId != undefined && deviceId != null && deviceId != '' && deviceId != ' ')
                localStorage.setItem('deviceId', deviceId);
        }

        this.memberId = localStorage.getItem('memberId');
        this.userID = this.memberId;

        var cachedCategory = localStorage.getItem('selectedCategory');
        if (cachedCategory == 'Member' || cachedCategory == 'blog' || cachedCategory == '') {
            cachedCategory = localStorage.getItem('selectedCategory11');
            localStorage.setItem(
                'selectedCategory',
                cachedCategory || ''
            );
        }
        if (cachedCategory) {
            if (cachedCategory?.toString().trim() != '' && !isNaN(Number(cachedCategory))) {
                this.selectedcategoryId = Number(cachedCategory);
            } else {
                this.selectedcategoryId = cachedCategory;
            }
            // this.selectedcategoryId = cachedCategory;
        }

        this.route.params.subscribe((params) => {
            this.eventID = params['id'];
            window.scrollTo({ top: 0, behavior: 'smooth' });




            if (this.selectedcategoryId && this.eventID && sessionStorage.getItem('hostingType') != undefined && sessionStorage.getItem('hostingType') != null) {
                const id = this.generateTabSessionId();
                this.SESSION_ID = id;
                var wrongdata = sessionStorage.getItem('wrongdata') != undefined && sessionStorage.getItem('wrongdata') != null ? sessionStorage.getItem('wrongdata') : 'n';
                if (sessionStorage.getItem('active') == '4' && wrongdata != 'y') {
                    var dataaa: any = sessionStorage.getItem('relase') != undefined && sessionStorage.getItem('relase') != null ? JSON.parse(sessionStorage.getItem('relase')!) : '';
                    var coupondataaa: any = sessionStorage.getItem('relasecoupon') != undefined && sessionStorage.getItem('relasecoupon') != null && sessionStorage.getItem('relasecoupon') != '' ? JSON.parse(sessionStorage.getItem('relasecoupon')!) : '';
                    if (coupondataaa != undefined && coupondataaa != null && coupondataaa != '') {
                        this.apiService.removeCouponDATAwithoutcalulation(coupondataaa).subscribe({
                            next: (successCode: any) => {
                                sessionStorage.removeItem('relasecoupon');
                            }, error: (err) => {
                                sessionStorage.removeItem('relasecoupon');
                            }
                        });
                    }
                    if (dataaa != undefined && dataaa != null && dataaa != '') {
                        this.apiService.seatReleaseWithoutJson(dataaa).subscribe({
                            next: (successCode: any) => {
                                sessionStorage.removeItem('relase');
                                sessionStorage.removeItem('active');
                                this.getBookingFlagList(this.eventID, this.selectedcategoryId);
                            }, error: (err) => {
                                sessionStorage.removeItem('relase');
                                sessionStorage.removeItem('active');
                                this.getBookingFlagList(this.eventID, this.selectedcategoryId);
                            }
                        });

                        if (dataaa.IS_PLAN_USED == true)
                            this.apiService
                                .removeSelectedPlan(
                                    dataaa.EVENT_TICKET_BOOKING_ID, this.userID, dataaa.PLAN_ID, localStorage.getItem('deviceId'), dataaa.SESSION_ID
                                )
                                .subscribe((data) => {
                                    if (data['code'] == 200) {
                                    }
                                })
                    } else {
                        sessionStorage.removeItem('relase');
                        sessionStorage.removeItem('active');
                        this.getBookingFlagList(this.eventID, this.selectedcategoryId);
                    }
                } else if (sessionStorage.getItem('active2') == '3') {
                    var dataaa2: any = sessionStorage.getItem('release2') != undefined && sessionStorage.getItem('release2') != null ? JSON.parse(sessionStorage.getItem('release2')!) : '';

                    if (dataaa2 != undefined && dataaa2 != null && dataaa2 != '' && dataaa2.PLAN_ID != null && dataaa2.IS_PLAN_USED == true) {

                        this.apiService
                            .removeSelectedPlan(
                                dataaa2.EVENT_TICKET_BOOKING_ID, this.userID, dataaa2.PLAN_ID, localStorage.getItem('deviceId'), dataaa2.SESSION_ID
                            )
                            .subscribe((data) => {
                                sessionStorage.removeItem('relase');
                                sessionStorage.removeItem('active');
                                sessionStorage.removeItem('release2');
                                sessionStorage.removeItem('active2');
                                this.getBookingFlagList(this.eventID, this.selectedcategoryId);
                            })
                    } else {
                        sessionStorage.removeItem('relase');
                        sessionStorage.removeItem('active');
                        sessionStorage.removeItem('release2');
                        sessionStorage.removeItem('active2');
                        this.getBookingFlagList(this.eventID, this.selectedcategoryId);
                    }
                } else {
                    sessionStorage.removeItem('relase');
                    sessionStorage.removeItem('active');
                    sessionStorage.removeItem('release2');
                    sessionStorage.removeItem('active2');
                    this.getBookingFlagList(this.eventID, this.selectedcategoryId);
                }


            } else {

                const locationState: any = this.location.getState();
                if (locationState?.navigationId > 1) {
                    this.location.back();
                } else {

                    this.router.navigate(['/home'], { replaceUrl: true });
                }

            }
        });


        this.isMobile = this.apiService.isMobileDevice();
        this.isMobileScreens = this.apiService.isMobileDevice2();
        this.el.nativeElement.style.touchAction = 'none';


        this.theatreId = 1;
        this.getLayoutNames();




        this.clearTimer();


    }





    selectedSeats = new Set<string>(); // store seat names or IDs

    currentStepTitle = 'Venue'; // initial title
    stepTitles: any = {
        1: 'Select Venue',
        2: 'Select Date & Time',
        3: 'Choose Ticket',
        4: 'Review & Proceed to Pay',
        5: 'Ticket',
    };
    dates: { display: string; fullDate: Date }[] = [];
    times: any[] = [];
    selectedDate: Date | null = null;
    selectedTime: any | null = null;
    private availableShowTimes: { [key: string]: string[] } = {};

    generateDates() {
        this.dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const displayOptions: Intl.DateTimeFormatOptions = {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
            };
            const displayDateString = new Intl.DateTimeFormat(
                'en-US',
                displayOptions
            ).format(date);

            this.dates.push({
                display: displayDateString,
                fullDate: date,
            });
        }
    }

    //------------------------------------- step 1 ------------------------------------- //

    activeStep: number = 1; // Start at step 1
    selectedCity = 'Pune';
    selectedVenue: any = {};
    cities: string[] = []; // Populated from API response
    cityExpanded: { [key: string]: boolean } = {};

    venues: any = [];

    isMultipleVenues: boolean = false;
    isMultipleDates: boolean = false;
    isMultipleTime: boolean = false;
    eventname: any;
    EVENT_SCHEDULE_ID: any
    eventShortCode: any
    eventImage: any

    selectedshowdate: any
    selectecshowtime: any
    USER_RESERVED_TICKET_COUNT: any
    VENUE_STATE_ID_new: any
    dummylayoutforcharted: any
    EVENT_AGE_GROUP: any
    TERMS_CONDITIONS: any;
    CHARTED_AVAILABLE_FOR_BOOKING = 0;
    is_event_heavy = false;
    position = 0;
    BOOKING_PERCENTAGE = '';
    LAST_WAITING_POSITION = 0;
    QUEUE_ID: any = '';
    referesh() {
        if (this.activeStep >= 2) {
            this.getDataForBooking(this.eventscheduleid);
        } else {
            this.getBookingFlagList(this.eventID, this.selectedcategoryId);
        }
    }
    getBookingFlagList(eventId: any, categoryId: any) {
        this.loadBookingFlag = true;
        const filter = '';
        var PUBLISH_FOR_GUEST1: any = localStorage.getItem('IS_GUEST');
        var PUBLISH_FOR_GUEST: boolean = false;
        if (PUBLISH_FOR_GUEST1 == true || PUBLISH_FOR_GUEST1 == 'true') {
            PUBLISH_FOR_GUEST = true;
        } else {
            PUBLISH_FOR_GUEST = false;
        }
        var HOISTING_TYPE: any = '';
        if (sessionStorage.getItem('hostingType') == 'N') {

        } else {
            HOISTING_TYPE = sessionStorage.getItem('hostingType');
        }
        this.IS_QUEUE_ENABLED = false;
        this.QUEUE_ID = sessionStorage.getItem('queuenumber') && sessionStorage.getItem('queuenumber') !== '' ? sessionStorage.getItem('queuenumber') : null;
        this.apiService
            .getBookingFlagDetails(0, 0, '', '', filter, eventId, categoryId, PUBLISH_FOR_GUEST, this.SESSION_ID, HOISTING_TYPE, this.QUEUE_ID && this.QUEUE_ID !== '' ? this.QUEUE_ID : null)
            .subscribe(
                (data) => {
                    this.is_event_heavy = false;
                    clearInterval(this.interval2);
                    if (data?.code == 200 && data?.data) {
                        const bookingData = data.data;
                        this.IS_QUEUE_ENABLED = data.data.IS_QUEUE_ENABLED;
                        if (this.IS_QUEUE_ENABLED) {
                            this.QUEUE_ID = data.data.RECORD_ID ?? '';
                            // console.log('QUEUE_ID set to:', this.QUEUE_ID);
                            sessionStorage.setItem('queuenumber', this.QUEUE_ID ? this.QUEUE_ID.toString() : '');
                        }
                        if (this.memberId && bookingData?.IS_MEMBER == 1) {
                            localStorage.setItem('IS_MEMBER', 'M');
                        } else {
                            localStorage.setItem('IS_MEMBER', 'N');
                        }
                        this.Hoisting_Type = data.data.HOSTING_TYPE;
                        this.IS_EXTRA_INFO_REQUIRED = data.data.IS_EXTRA_INFO;
                        if (this.IS_EXTRA_INFO_REQUIRED) {
                            this.getextraInfo(data.data.EXTRA_INFORMATION)

                        }
                        const isMultipleVenues = bookingData?.IS_MULTIPLE_VENUES;
                        const isMultipleDates = bookingData?.IS_MULTIPLE_DATES;
                        const isMultipleTime = bookingData?.IS_MULTIPLE_TIME;
                        this.isMultipleVenues = isMultipleVenues;
                        this.isMultipleDates = isMultipleDates;
                        this.isMultipleTime = isMultipleTime;

                        this.eventname = bookingData?.EVENT_NAME;
                        this.eventID = bookingData?.EVENT_ID;
                        this.eventImage = bookingData?.EVENT_IMAGE;
                        this.eventShortCode = bookingData?.EVENT_SHORT_CODE;
                        this.EVENT_AGE_GROUP = bookingData?.EVENT_AGE_GROUP;
                        this.TERMS_CONDITIONS = bookingData?.EVENT_TERMS_CONDITIONS;
                        var mainEventsTerms = sessionStorage.getItem('cleanedTerms');
                        if (mainEventsTerms != undefined && mainEventsTerms != null && mainEventsTerms != '' && mainEventsTerms != 'null') {
                            // Merge both, keeping mainEventsTerms first and removing duplicates
                            const termsArray = [
                                ...(mainEventsTerms ? JSON.parse(mainEventsTerms) : []),
                                ...(this.TERMS_CONDITIONS ? this.TERMS_CONDITIONS : [])
                            ];

                            this.TERMS_CONDITIONS = [...new Set(termsArray)];

                        }
                        // Reset all data
                        this.venues = [];
                        this.cities = [];
                        this.cityExpanded = {};
                        this.dates = [];
                        this.availableShowTimes = {};
                        this.selectedDate = null;
                        this.selectedTime = null;

                        // Condition 1: Multiple Venues + Dates + Time
                        if (isMultipleVenues) {
                            this.activeStep = 1;



                            // Sort cities by their earliest venue show
                            const sortedCities = [...bookingData.VENUE_CITIES].sort((a: any, b: any) => {
                                const aDt = getEarliestDt(a.VENUES);
                                const bDt = getEarliestDt(b.VENUES);
                                return aDt < bDt ? -1 : aDt > bDt ? 1 : 0;
                            });
                            sortedCities.forEach((cityBlock: any, index: number) => {
                                const cityName = cityBlock.CITY_NAME;
                                this.cities.push(cityName);
                                this.cityExpanded[cityName] = bookingData.VENUE_CITIES.length == 1 ? true : false;
                                // Sort venues within the city by earliest show
                                const sortedVenues = [...cityBlock.VENUES].sort((a: any, b: any) => {
                                    const aDt = `${a.EARLIEST_SHOW_DATE} ${to24Hour(a.EARLIEST_SHOW_TIME)}`;
                                    const bDt = `${b.EARLIEST_SHOW_DATE} ${to24Hour(b.EARLIEST_SHOW_TIME)}`;
                                    return aDt < bDt ? -1 : aDt > bDt ? 1 : 0;
                                });
                                sortedVenues.forEach((venue: any) => {
                                    this.venues.push({
                                        id: venue.VENUE_ID,
                                        name: venue.DISPLAY_NAME,
                                        HOSTING_TYPE: venue.HOSTING_TYPE,
                                        address: venue.ADDRESS_DETAILS,
                                        city: cityName,
                                        venueShortCode: venue.VENUE_SHORT_CODE,
                                        SCREEN_TYPE: venue.SCREEN_TYPE,
                                        date: venue.EARLIEST_SHOW_DATE,
                                        time: venue.EARLIEST_SHOW_TIME,
                                        latitude: parseFloat(venue.LATITUDE),
                                        longitude: parseFloat(venue.LONGITUDE),
                                        mapLink: `https://www.google.com/maps?q=${venue.LATITUDE},${venue.LONGITUDE}`,
                                        VENUE_STATE_ID: venue.VENUE_STATE_ID,
                                        CITY_ID: venue.CITY_ID,
                                        LOAD_FROM_TUGOZ: venue.LOAD_FROM_TUGOZ,
                                        TUGOZ_LAYOUT_ID: venue.TUGOZ_LAYOUT_ID,
                                        IS_MULTIPLE_DATE_VENUE: venue.IS_MULTIPLE_DATE_VENUE
                                    });
                                });
                            });
                            if (this.cities.length > 0) {
                                this.selectedCity = this.cities[0];
                            }
                            //
                            this.loadBookingFlag = false;

                        }

                        //Condition 2: Only Dates || Time (no venues)
                        else if (isMultipleDates || isMultipleTime) {
                            this.activeStep = 2;
                            //


                            const venuName = bookingData.DISPLAY_NAME;
                            const venuID = bookingData.VENUE_ID;

                            const venueShortCode = bookingData.VENUE_SHORT_CODE;
                            //

                            if (venuName) {
                                this.selectedVenue['name'] = venuName;
                                this.selectedVenue['id'] = venuID;
                                this.selectedVenue['venueShortCode'] = venueShortCode;
                                this.selectedVenue['VENUE_STATE_ID'] = bookingData.VENUE_STATE_ID;
                                this.selectedVenue['CITY_ID'] = bookingData.CITY_ID;
                                this.selectedVenue['CITY_NAME'] = bookingData?.CITY_NAME;
                                this.selectedVenue['SCREEN_TYPE'] = bookingData?.SCREEN_TYPE;
                                this.SCREEN_TYPE = bookingData?.SCREEN_TYPE;
                            }


                            const scheduleArray = bookingData.SCHEDULE_BY_DATE;
                            this.commonShowDataTimeLogic(scheduleArray);
                            this.loadBookingFlag = false;

                        } else {
                            this.bookingMeta = bookingData;
                            this.bookingMeta['ID'] = bookingData.ID;
                            this.selectedTime = this.to12HourFormat(bookingData?.SHOW_TIME);
                            this.selectedVenue['name'] = bookingData?.DISPLAY_NAME;
                            this.selectedVenue['id'] = bookingData?.VENUE_ID;
                            this.selectedVenue['venueShortCode'] = bookingData?.VENUE_SHORT_CODE;
                            this.selectedVenue['VENUE_STATE_ID'] = bookingData?.VENUE_STATE_ID;
                            this.selectedVenue['SCREEN_TYPE'] = bookingData?.SCREEN_TYPE;
                            this.selectedVenue['RESERVATION_MODE'] = bookingData?.RESERVATION_MODE;
                            this.selectedVenue['VENUE_RESERVED_SEATS'] = Number(bookingData?.VENUE_RESERVED_SEATS) || 0;
                            this.BOOKING_DATE_START = bookingData?.BOOKING_DATE_START;
                            this.BOOKING_DATE_END = bookingData?.BOOKING_DATE_END;
                            this.CHECK_DATE_START = bookingData?.CHECK_DATE_START;
                            this.EARLY_ACCESS_DATE = bookingData?.EARLY_ACCESS_DATE;
                            this.SCREEN_TYPE = bookingData?.SCREEN_TYPE;
                            this.USER_RESERVED_TICKET_COUNT = bookingData?.USER_RESERVED_TICKET_COUNT || 0;
                            this.selectedVenue['CITY_ID'] = bookingData?.CITY_ID;
                            this.selectedVenue['CITY_NAME'] = bookingData?.CITY_NAME;
                            this.selectedDate = bookingData?.SHOW_DATE;
                            this.EVENT_SCHEDULE_ID = bookingData?.EVENT_SCHEDULE_ID;







                            if (this.bookingMeta?.LOAD_FROM_TUGOZ == true) {
                                this.tugozid = this.bookingMeta?.TUGOZ_LAYOUT_ID == null ? 0 : Number(this.bookingMeta?.TUGOZ_LAYOUT_ID);

                                this.tugozInstance.embed(this.tugozid);

                                this.istugoz = true;

                                this.loadBookingFlag = false;
                                this.loadBookingFlag2 = true;
                                this.activeStep = 3;
                                setTimeout(() => {
                                    if (this.istugoz) {
                                        this.openTugoz();
                                    } else {
                                        this.closeTugoz();
                                    }



                                }, 100);



                            } else {
                                if (this.Hoisting_Type == 'U') {
                                    if (bookingData?.AVAILABLE_FOR_BOOKING == 0) {
                                        const modal = new bootstrap.Modal(document.getElementById('selectSeatCountModalformodelll')!);
                                        modal.show();
                                    }
                                    const venuName = bookingData.DISPLAY_NAME;
                                    const venuID = bookingData.VENUE_ID;
                                    const venueShortCode = bookingData.VENUE_SHORT_CODE;

                                    if (venuName) {
                                        this.selectedVenue['name'] = venuName;
                                        this.selectedVenue['id'] = venuID;
                                        this.selectedVenue['venueShortCode'] = venueShortCode;
                                        this.selectedVenue['VENUE_STATE_ID'] = bookingData.VENUE_STATE_ID;
                                        this.selectedVenue['CITY_ID'] = bookingData.CITY_ID;
                                        this.selectedVenue['CITY_NAME'] = bookingData?.CITY_NAME;
                                        this.selectedVenue['SCREEN_TYPE'] = bookingData?.SCREEN_TYPE;

                                    }


                                    const filteredSeats = JSON.parse(
                                        bookingData?.SEAT_LAYOUT_JSON || '[]'
                                    );
                                    const seatData = filteredSeats.filter((item: any) =>
                                        (item.IS_DELETE == 1 || item.IS_DELETE == true) ||
                                            (item.IS_WEB_HIDE == 1 || item.IS_WEB_HIDE == true)
                                            ? false
                                            : true
                                    );
                                    seatData.sort((a: any, b: any) => Number(a.SEAT_PRICE) - Number(b.SEAT_PRICE));

                                    this.activeStep = 3;

                                    this.tickets = seatData.map((seat: any) => ({
                                        id: seat._id,
                                        NAME: seat.SEAT_TYPE_NAME,
                                        PRICE: Number(seat.SEAT_PRICE),
                                        QTY: 0,
                                        CAPACITY: Number(seat.CAPACITY || 0),
                                        BOOKED: 0,
                                        AVAILABLE: Number(seat.AVAILABLE_SEATS || 0) - Number(seat.TOTAL_BOOKED || 0),
                                        PLAN_SEATS: Number(seat.PLAN_SEATS || 0) - Number(seat.PLAN_BOOKED || 0),
                                        REGULAR_SEATS: Number(seat.REGULAR_SEATS || 0) - Number(seat.REGULAR_BOOKED || 0),
                                        MAX_TICKETS: Number(seat.MAX_TICKETS || 0),
                                        BOOKING_FEE: Number(seat.BOOKING_FEE || 0),
                                        BOOKING_FEE_TYPE: seat.BOOKING_FEE_TYPE,
                                        TOTAL_BOOKED: Number(seat.TOTAL_BOOKED || 0),
                                        REGULAR_BOOKED: Number(seat.REGULAR_BOOKED || 0),
                                        PLAN_BOOKED: Number(seat.PLAN_BOOKED || 0),
                                        PERCENT_SOLD: (Number(seat.AVAILABLE_SEATS || 0) > 0
                                            ? ((Number(seat.TOTAL_BOOKED || 0) / Number(seat.AVAILABLE_SEATS || 0)) * 100).toFixed(2)
                                            : "0.00"),
                                        PLAN_SEATSss: Number(seat.PLAN_SEATS || 0) - Number(seat.PLAN_BOOKED || 0),
                                        REGULAR_SEATSss: Number(seat.REGULAR_SEATS || 0) - Number(seat.REGULAR_BOOKED || 0),
                                        AVAILABLE_SEATS: Number(seat.AVAILABLE_SEATS || 0),
                                        reveredselectedseat: 0
                                    }));

                                    this.dummytickets = JSON.parse(JSON.stringify(this.tickets));

                                } else if (this.Hoisting_Type == 'S') {
                                    if (bookingData?.AVAILABLE_FOR_BOOKING == 0) {
                                        const modal = new bootstrap.Modal(document.getElementById('selectSeatCountModalformodelll')!);
                                        modal.show();
                                    }
                                    const seatJson = JSON.parse(this.bookingMeta?.SEAT_LAYOUT_JSON || '[]');
                                    this.seatJsonData = seatJson
                                    this.activeStep = 3;
                                    this.changeDetectorRef.detectChanges();


                                }
                                else if (this.Hoisting_Type == 'C') {
                                    this.max_limit = this.bookingMeta?.MAX_LIMIT != undefined && this.bookingMeta?.MAX_LIMIT != null && this.bookingMeta?.MAX_LIMIT != '' ? Number(this.bookingMeta?.MAX_LIMIT) : 10;
                                    this.selectedSeats1 = this.selectedSeats1.map(
                                        (seat: any) => ({
                                            id: seat._id,
                                            NAME: seat.SN,
                                            SUB_SECTION_NAME: seat.SG,
                                            PRICE: Number(seat.SEAT_PRICE),
                                            QTY: 0,
                                            BOOKED: 0, // initialize
                                        })
                                    );
                                    this.activeStep = 3;


                                    if (bookingData?.AVAILABLE_FOR_BOOKING == 0) {
                                        const modal = new bootstrap.Modal(
                                            document.getElementById('selectSeatCountModalformodelll')!
                                        );
                                        modal.show();
                                    } else {
                                        this.CHARTED_AVAILABLE_FOR_BOOKING = bookingData?.AVAILABLE_FOR_BOOKING < this.max_limit ? bookingData?.AVAILABLE_FOR_BOOKING : this.max_limit;
                                        if (!this.selectedSeatModalOpened) {
                                            const modal = new bootstrap.Modal(
                                                document.getElementById('selectSeatCountModal')!
                                            );
                                            modal.show();
                                            this.selectedSeatModalOpened = true;
                                        }


                                        const rawRows = bookingData?.SEAT_LAYOUT_JSON || '[]';
                                        this.SCREEN_MASTER.LAYOUT_JSON = bookingData?.SEAT_LAYOUT_JSON || [];

                                        this.dummylayoutforcharted = this.SCREEN_MASTER.LAYOUT_JSON;
                                        this.getSectionData();




                                    }
                                }

                                if (this.IS_QUEUE_ENABLED == true) {
                                    this.startTimer3();
                                }
                            }
                            // this.startTimerIfStep4();
                            this.loadBookingFlag = false;


                        }
                        this.updateStepTitle();
                        //
                    } else if (data?.code == 202 || data?.code == 300) {
                        this.is_event_heavy = true;
                        this.loadBookingFlag = false;
                        this.position = Number(data.position)
                        this.BOOKING_PERCENTAGE = data.BOOKING_PERCENTAGE;
                        this.N_EVENT_SCHEDULE_ID = data.EVENT_SCHEDULE_ID;
                        this.N_EVENT_ID = data.EVENT_ID;
                        this.QUEUE_ID = data.RECORD_ID ?? '';
                        sessionStorage.setItem('queuenumber', this.QUEUE_ID ? this.QUEUE_ID.toString() : '');
                        this.SESSION_ID = data.SESSION_KEY;
                        sessionStorage.setItem('sessionid', this.SESSION_ID);
                        this.eventname = sessionStorage.getItem('eventname');
                        this.eventImage = sessionStorage.getItem('eventimage');
                        this.startTimer2();
                    }
                    else {
                        // On failure
                        this.venues = [];
                        this.cities = [];
                        this.cityExpanded = {};
                        this.dates = [];
                        this.availableShowTimes = {};
                        this.selectedDate = null;
                        this.selectedTime = null;
                    }
                },
                (err) => {
                    this.loadBookingFlag = false;
                    this.venues = [];
                    this.cities = [];
                    this.cityExpanded = {};
                    this.dates = [];
                    this.availableShowTimes = {};
                    this.selectedDate = null;
                    this.selectedTime = null;
                    this.iscancelled = false;
                    if (err.error.code == 303 || err.error.code == 404) {
                        if (err.error.code == 404) {
                            this.iscancelled = true;
                        }
                        const modal = new bootstrap.Modal(document.getElementById('selectSeatCountModalformodelll')!);
                        modal.show();
                    }


                }
            );
    }






    getDateTimeScheduleDetails(eventId: any, venueid: any) {
        this.loadBookingFlag = true;
        const filter = '';
        var PUBLISH_FOR_GUEST1: any = localStorage.getItem('IS_GUEST');
        var PUBLISH_FOR_GUEST: boolean = false;
        if (PUBLISH_FOR_GUEST1 == true || PUBLISH_FOR_GUEST1 == 'true') {
            PUBLISH_FOR_GUEST = true;
        } else {
            PUBLISH_FOR_GUEST = false;
        }

        //

        this.apiService
            .getDateTimeScheduleDetails(0, 0, '', '', filter, eventId, venueid.id, PUBLISH_FOR_GUEST1)
            .subscribe(
                (data) => {
                    this.loadBookingFlag = false;

                    if (data?.code == 200 && Array.isArray(data.data)) {
                        const scheduleArray = data.data;

                        this.commonShowDataTimeLogic(scheduleArray);
                        // this.activeStep = 2;
                        this.proceed();

                        // ✅ Set venue name from the passed object
                        if (venueid?.name) {
                            this.selectedVenue = { name: venueid.name, CITY_NAME: venueid.city, id: venueid.id, venueShortCode: venueid.venueShortCode, VENUE_STATE_ID: venueid.VENUE_STATE_ID, CITY_ID: venueid.CITY_ID, SCREEN_TYPE: venueid.SCREEN_TYPE };
                        }
                    } else {
                        // On failure
                        this.venues = [];
                        this.availableShowTimes = {};
                        this.selectedDate = null;
                        this.selectedTime = null;
                    }
                },
                (err) => {
                    this.loadBookingFlag = false;
                    this.dates = [];
                    this.availableShowTimes = {};
                    this.selectedDate = null;
                    this.selectedTime = null;
                }
            );
    }

    commonShowDataTimeLogic(data: any) {
        //

        const scheduleArray = data;
        this.dates = [];
        this.availableShowTimes = {};

        scheduleArray.forEach((schedule: any) => {
            const [year, month, day] = schedule.SHOW_DATE.split('-');
            const date = new Date(+year, +month - 1, +day); // 🔒 SAFE

            const displayOptions: Intl.DateTimeFormatOptions = {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
            };

            const displayDateString = new Intl.DateTimeFormat(
                'en-US',
                displayOptions
            ).format(date);

            this.dates.push({
                display: displayDateString,
                fullDate: date,
            });

            const dateKey = this.formatDateToKey(date);

            this.availableShowTimes[dateKey] = schedule.TIMES.map((time: any) => {
                // console.log(time);
                return {
                    ...time,
                    isDisabled: time.AVAILABLE_FOR_BOOKING == 0 && time.LOAD_FROM_TUGOZ != true,
                    PERCENT_SOLD: (Number(time.TOTAL_SEATS || 0) > 0 && time.LOAD_FROM_TUGOZ != true
                        ? ((Number(time.BOOKED_SEATS || 0) / (Number(time.BOOKED_SEATS || 0) + Number(time.AVAILABLE_FOR_BOOKING || 0))) * 100).toFixed(2)
                        : "0.00"),
                };
            });
        });

        if (this.dates.length > 0) {
            this.selectDate(this.dates[0].fullDate);

            if (!this.isMultipleTime) {
                const dateKey = this.formatDateToKey(this.dates[0].fullDate);
                const times: any = this.availableShowTimes[dateKey];
                if (times && times.length > 0) {
                    this.eventscheduleid = times[0];
                }
            }
        }
    }

    showPreviousButton(): boolean {
        if (this.activeStep == 1 && this.isMultipleVenues) {
            return false;
        }

        if (this.activeStep == 2 && !this.isMultipleVenues) {
            return false;
        }


        if (
            this.activeStep == 3 &&
            !this.isMultipleVenues &&
            !this.isMultipleDates &&
            !this.isMultipleTime
        ) {
            return false;
        }


        return this.activeStep > 1;
    }


    selectDate(date: Date) {
        this.selectedDate = date;
        const dateKey = this.formatDateToKey(date);
        this.times = this.availableShowTimes[dateKey] || [];

        if (!this.isMultipleTime && this.times.length > 0) {
            const firstAvailable = this.times.find(t => !t.isDisabled);
            if (firstAvailable) {
                this.eventscheduleid = firstAvailable;
                this.EVENT_SCHEDULE_ID = firstAvailable.EVENT_SCHEDULE_ID;
                this.selectTime(firstAvailable)
            } else {
                this.selectedTime = null;
                this.eventscheduleid = null;
            }
        } else {
            this.selectedTime = null;
            this.eventscheduleid = null;
        }
    }

    eventscheduleid: any;
    storetime: any;
    parseCustomDate(dateStr: string): Date {
        const [datePart, hour, min, ampm] = dateStr.split(/[\s:]+/); // e.g., ['2025-07-07', '12', '04', 'PM']
        const [year, month, day] = datePart.split('-').map(Number);
        var hours = Number(hour);
        const minute = Number(min);
        // Convert 12-hour to 24-hour
        if (ampm == 'PM' && hours != 12) hours += 12;
        if (ampm == 'AM' && hours == 12) hours = 0;

        return new Date(year, month - 1, day, hours, minute);
    }
    selectTime(time: any) {
        this.storetime = null;
        this.selectedTime = null;
        this.storetime = time;
        const isEarlyAccess = time?.IS_EARLY_ACCESS_REQUIRED;
        const now = new Date();

        var earlyAccessDate: any = null
        if (time?.EARLY_ACCESS_DATE != null)
            earlyAccessDate = this.parseCustomDate(time?.EARLY_ACCESS_DATE);
        const bookingStart = this.parseCustomDate(time?.BOOKING_DATE_START);
        const bookingEnd = this.parseCustomDate(time?.BOOKING_DATE_END);

        // If early access is required
        var IS_MEMBER = localStorage.getItem('IS_MEMBER');


        if (now > bookingEnd) {
            this.toastr.info("Booking is closed now for this show.");
            return;
        }
        if (isEarlyAccess && IS_MEMBER == 'M') {
            if (now < earlyAccessDate) {
                this.toastr.info("Booking is not started for this show.");
                return;
            }
        } else {

            if (now < bookingStart) {
                this.toastr.info("Booking is not started for this show.");
                return;
            }
        }
        this.selectedTime = time?.SHOW_TIME;
        this.EVENT_SCHEDULE_ID = time?.EVENT_SCHEDULE_ID
        this.eventscheduleid = time;
        if (time.LOAD_FROM_TUGOZ == true) {
            this.tugozid = time.TUGOZ_LAYOUT_ID == null ? 0 : Number(time.TUGOZ_LAYOUT_ID);
            this.istugoz = true;
        } else {
            this.istugoz = false;
        }
    }




    loadBookingFlag2 = false;
    selectTime1(time: any) {
        this.storetime = null;
        this.storetime = time;
        const isEarlyAccess = time?.IS_EARLY_ACCESS_REQUIRED;
        const now = new Date();

        var earlyAccessDate: any = null
        if (time?.EARLY_ACCESS_DATE != null)
            earlyAccessDate = this.parseCustomDate(time?.EARLY_ACCESS_DATE);
        const bookingStart = this.parseCustomDate(time?.BOOKING_DATE_START);
        const bookingEnd = this.parseCustomDate(time?.BOOKING_DATE_END);

        // If early access is required
        var IS_MEMBER = localStorage.getItem('IS_MEMBER');

        this.IS_QUEUE_ENABLED = time.IS_QUEUE_ENABLED
        if (now > bookingEnd) {
            this.toastr.info("Booking is closed now for this show.");
            return;
        }
        if (isEarlyAccess && IS_MEMBER == 'M') {
            if (now < earlyAccessDate) {
                this.toastr.info("Booking is not started for this show.");
                return;
            }
        } else {

            if (now < bookingStart) {
                this.toastr.info("Booking is not started for this show.");
                return;
            }
        }
        this.selectedTime = time?.SHOW_TIME;
        this.EVENT_SCHEDULE_ID = time?.EVENT_SCHEDULE_ID
        this.eventscheduleid = time;

        const modalEl = document.getElementById('eventinfo');
        if (modalEl) {
            // Move focus away before aria-hidden is set on close to avoid accessibility warning
            modalEl.addEventListener('hide.bs.modal', () => {
                (document.activeElement as HTMLElement)?.blur();
            }, { once: true });
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }


    }
    cancelproceed() {
        this.loadBookingFlag = false;
        this.loadBookingFlag2 = false;
    }
    proceedToSeatSelection() {

        {
            if (this.istugoz == false)
                this.getDataForBooking(this.eventscheduleid);
            else {
                this.loadBookingFlag = false;
                this.loadBookingFlag2 = true;
                this.tugozInstance.embed(this.tugozid);
                this.activeStep = 3;


                setTimeout(() => {

                    if (this.istugoz) {
                        this.openTugoz();
                    } else {
                        this.closeTugoz();
                    }

                }, 100);

            }
        }
    }



    isBookingLoading: boolean = false; // Loading flag for booking data

    tickets: any[] = [];


    bookingMeta: any;

    // Tushar code

    tickets1: any[] = [];
    stage!: Konva.Stage;
    layer!: Konva.Layer;
    scaleBy = 1.05;

    selectedSeat: any[] = [];

    getTotalTickets1(): number {
        return this.selectedSeat.reduce((sum, t) => sum + t.QTY, 0);
    }

    getTotalAmount1(): number {
        return this.selectedSeat.reduce((sum, t) => sum + t.QTY * t.PRICE, 0);
    }

    selectSeat(seat: any) {
        const exists = this.selectedSeat.find((s: any) => s.NAME == seat.NAME);
        if (!exists) {
            this.selectedSeat.push(seat);
        }
    }

    returnData(): any {

        // this.getTotalTickets() != 0);

        if (this.activeStep == 2 && !this.selectedTime) {
            return true;
        } else if (
            this.activeStep == 3 &&
            this.getTotalTickets1() == 0 &&
            this.Hoisting_Type == 'S'
        ) {
            return true;
        } else if (
            this.activeStep == 3 &&
            this.getTotalTickets() == 0 &&
            this.Hoisting_Type == 'U'
        ) {
            return true;
        } else if (
            this.activeStep == 3 &&
            this.selectedSeats1.length != this.selectedSeatCount &&
            this.Hoisting_Type == 'C'
        ) {
            return true;
        } else {
            return false;
        }
    }



    addTicket1(ticket: any, i: number) {


        const maxTickets = ticket.MAX_TICKETS;
        const currentQty = ticket.QTY;
        const totalAvailable = ticket.AVAILABLE;

        if (totalAvailable <= 0) {
            this.toastr.warning('No seats available for this section.');
            return;
        }

        if (currentQty >= totalAvailable) {
            this.toastr.warning(`Only ${totalAvailable} seats are available for ${ticket.NAME}.`);
            return;
        }

        if (currentQty >= maxTickets) {
            this.toastr.warning(`You can select a maximum of ${maxTickets} tickets in ${ticket.NAME}.`);
            return;
        }

        // ✅ All good – add ticket
        ticket.QTY++;
        ticket.BOOKED++;
    }

    removeTicket1(i: number) {
        if (this.selectedSeat[i] && this.selectedSeat[i].QTY > 0) {
            this.selectedSeat[i].QTY -= 1;
            this.selectedSeat[i].BOOKED -= 1;
        }
    }


    sectionList: any;
    finalSectionList: any;
    SCREEN_TYPE: any;
    maxWidth: any;
    maxHeight: any;
    N_EVENT_SCHEDULE_ID: any;
    N_EVENT_ID: any;
    IS_QUEUE_ENABLED = false
    max_limit = 10;
    getDataForBooking(data: any) {
        // const filter = {
        // $and: [{ EVENT_DETAILS_ID: data.EVENT_SCHEDULE_ID }],
        // };
        const filter = " AND EVENT_DETAILS_ID='" + data.EVENT_SCHEDULE_ID + "' AND HOSTING_TYPE='" + this.Hoisting_Type + "'";
        this.QUEUE_ID = sessionStorage.getItem('queuenumber') && sessionStorage.getItem('queuenumber') !== '' ? sessionStorage.getItem('queuenumber') : '';
        //);
        this.IS_QUEUE_ENABLED = false;
        this.apiService.getDataForBooking(0, 0, 'ID', 'desc', filter, data.EVENT_SCHEDULE_ID,
            this.eventID,
            localStorage.getItem('deviceId'), this.Hoisting_Type, this.SESSION_ID, this.QUEUE_ID && this.QUEUE_ID !== '' ? this.QUEUE_ID : null).subscribe(
                (res: any) => {
                    this.is_event_heavy = false;
                    clearInterval(this.interval2);
                    if (res?.code == 200 && res?.data?.length) {
                        this.bookingMeta = res.data[0]; // Save original booking metadata
                        this.IS_QUEUE_ENABLED = res.data[0].IS_QUEUE_ENABLED;


                        if (this.IS_QUEUE_ENABLED) {
                            this.QUEUE_ID = res.data[0].RECORD_ID ?? '';
                            sessionStorage.setItem('queuenumber', this.QUEUE_ID ? this.QUEUE_ID.toString() : '');
                        }



                        this.BOOKING_DATE_START = this.bookingMeta?.BOOKING_DATE_START;
                        this.BOOKING_DATE_END = this.bookingMeta?.BOOKING_DATE_END;
                        this.CHECK_DATE_START = this.bookingMeta?.CHECK_DATE_START;
                        this.EARLY_ACCESS_DATE = this.bookingMeta?.EARLY_ACCESS_DATE;
                        this.USER_RESERVED_TICKET_COUNT = this.bookingMeta?.USER_RESERVED_TICKET_COUNT || 0;
                        this.selectedVenue['RESERVATION_MODE'] = this.bookingMeta?.RESERVATION_MODE;
                        this.selectedVenue['VENUE_RESERVED_SEATS'] = Number(this.bookingMeta?.VENUE_RESERVED_SEATS) || 0;
                        if (this.Hoisting_Type == 'U') {
                            if (this.bookingMeta?.AVAILABLE_FOR_BOOKING == 0) {
                                const modal = new bootstrap.Modal(document.getElementById('selectSeatCountModalformodelll')!);
                                modal.show();
                            }
                            const filteredSeats = JSON.parse(
                                this.bookingMeta?.SEAT_LAYOUT_JSON || '[]'
                            );
                            const seatData = filteredSeats.filter((item: any) =>
                                (item.IS_DELETE == 1 || item.IS_DELETE == true) ||
                                    (item.IS_WEB_HIDE == 1 || item.IS_WEB_HIDE == true)
                                    ? false
                                    : true
                            );
                            // seatData.sort((a: any, b: any) => Number(a.SEAT_PRICE) - Number(b.SEAT_PRICE));
                            this.activeStep = 3;
                            this.loadBookingFlag = true;

                            seatData.sort((a: any, b: any) => Number(a.SEAT_PRICE) - Number(b.SEAT_PRICE));

                            this.tickets = seatData.map((seat: any) => ({
                                id: seat._id,
                                NAME: seat.SEAT_TYPE_NAME,
                                PRICE: Number(seat.SEAT_PRICE),
                                QTY: 0,
                                CAPACITY: Number(seat.CAPACITY || 0),
                                BOOKED: 0,
                                AVAILABLE: Number(seat.AVAILABLE_SEATS || 0) - Number(seat.TOTAL_BOOKED || 0),
                                PLAN_SEATS: Number(seat.PLAN_SEATS || 0) - Number(seat.PLAN_BOOKED || 0),
                                REGULAR_SEATS: Number(seat.REGULAR_SEATS || 0) - Number(seat.REGULAR_BOOKED || 0),
                                MAX_TICKETS: Number(seat.MAX_TICKETS || 0),
                                BOOKING_FEE: Number(seat.BOOKING_FEE || 0),
                                BOOKING_FEE_TYPE: seat.BOOKING_FEE_TYPE,
                                TOTAL_BOOKED: Number(seat.TOTAL_BOOKED || 0),
                                REGULAR_BOOKED: Number(seat.REGULAR_BOOKED || 0),
                                PLAN_BOOKED: Number(seat.PLAN_BOOKED || 0),
                                PERCENT_SOLD: (Number(seat.AVAILABLE_SEATS || 0) > 0
                                    ? ((Number(seat.TOTAL_BOOKED || 0) / Number(seat.AVAILABLE_SEATS || 0)) * 100).toFixed(2)
                                    : "0.00"),
                                AVAILABLE_SEATS: Number(seat.AVAILABLE_SEATS || 0),
                                PLAN_SEATSss: Number(seat.PLAN_SEATS || 0) - Number(seat.PLAN_BOOKED || 0),
                                REGULAR_SEATSss: Number(seat.REGULAR_SEATS || 0) - Number(seat.REGULAR_BOOKED || 0),

                                reveredselectedseat: 0
                            }));

                            this.loadBookingFlag = false;
                            this.dummytickets = JSON.parse(JSON.stringify(this.tickets));
                        } else if (this.Hoisting_Type == 'S') {
                            if (this.bookingMeta?.AVAILABLE_FOR_BOOKING == 0) {
                                const modal = new bootstrap.Modal(document.getElementById('selectSeatCountModalformodelll')!);
                                modal.show();
                            }

                            this.seatJsonData = JSON.parse(this.bookingMeta?.SEAT_LAYOUT_JSON || '[]');

                            this.loadBookingFlag = false;
                            this.activeStep = 3;

                            this.loadBookingFlag = false;
                        }
                        else if (this.Hoisting_Type == 'C') {
                            this.max_limit = this.bookingMeta?.MAX_LIMIT != undefined && this.bookingMeta?.MAX_LIMIT != null && this.bookingMeta?.MAX_LIMIT != '' ? Number(this.bookingMeta?.MAX_LIMIT) : 10;
                            if (this.bookingMeta?.AVAILABLE_FOR_BOOKING == 0) {
                                const modal = new bootstrap.Modal(
                                    document.getElementById('selectSeatCountModalformodelll')!
                                );
                                modal.show();
                            } else {
                                this.CHARTED_AVAILABLE_FOR_BOOKING = this.bookingMeta?.AVAILABLE_FOR_BOOKING < this.max_limit ? this.bookingMeta?.AVAILABLE_FOR_BOOKING : this.max_limit;
                                const modal = new bootstrap.Modal(
                                    document.getElementById('selectSeatCountModal')!
                                );

                                if (!this.selectedSeatModalOpened) {
                                    const modal = new bootstrap.Modal(
                                        document.getElementById('selectSeatCountModal')!
                                    );
                                    modal.show();
                                    this.selectedSeatModalOpened = true;
                                }


                                this.activeStep = 3;
                                this.loadBookingFlag = false;


                                const rawRows = this.bookingMeta?.SEAT_LAYOUT_JSON || [];

                                this.SCREEN_MASTER.LAYOUT_JSON = rawRows

                                this.dummylayoutforcharted = [...this.SCREEN_MASTER.LAYOUT_JSON];
                                this.getSectionData();



                            }

                        }
                        if (this.IS_QUEUE_ENABLED == true) {
                            this.startTimer3();
                        }
                        this.updateStepTitle();
                    }
                    else if (res?.code == 202 || res?.code == 300) {

                        // console.log('called .');

                        this.is_event_heavy = true;
                        this.loadBookingFlag = false;
                        this.position = Number(res.position)
                        this.QUEUE_ID = res.RECORD_ID ?? '';
                        sessionStorage.setItem('queuenumber', this.QUEUE_ID ? this.QUEUE_ID.toString() : '');
                        this.SESSION_ID = res.SESSION_KEY;
                        sessionStorage.setItem('sessionid', this.SESSION_ID);
                        this.BOOKING_PERCENTAGE = res.BOOKING_PERCENTAGE;
                        this.startTimer2();
                    } else {
                        this.tickets = [];
                    }


                },
                (error) => {
                    // //console.error('Booking API Error:', error);
                    this.tickets = [];
                    this.loadBookingFlag = false;
                    this.iscancelled = false;
                    if (error.error.code == 303 || error.error.code == 404) {
                        if (error.error.code == 404) {
                            this.iscancelled = true;
                        }
                        const modal = new bootstrap.Modal(document.getElementById('selectSeatCountModalformodelll')!);
                        modal.show();
                    }
                }
            );
    }
    iscancelled = false;

    formatDateToKey(date: Date): string {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return 'Invalid date';
        }
        // console.log(date);

        // 🔒 Normalize time to prevent date rollback
        const localDate = new Date(date);
        localDate.setHours(12, 0, 0, 0);

        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        // console.log(day);

        return `${year}-${month}-${day}`;
    }


    toggleCity(city: string) {
        this.cityExpanded[city] = !this.cityExpanded[city];
    }

    Hoisting_Type: any;


    selectVenue(venue: any) {
        this.Hoisting_Type = venue.HOSTING_TYPE;
        this.selectedVenue = venue;


        if (this.selectedVenue.LOAD_FROM_TUGOZ == true) {
            this.tugozid = this.selectedVenue.TUGOZ_LAYOUT_ID == null ? 0 : Number(this.selectedVenue.TUGOZ_LAYOUT_ID);
            this.istugoz = true;
        } else {
            this.tugozid = 0;
            this.istugoz = false;
        }

        this.SCREEN_TYPE = this.selectedVenue.SCREEN_TYPE
        this.getDateTimeScheduleDetails(this.eventID, this.selectedVenue);
    }

    filteredVenuesByCity(city: string): any[] {


        const filtered = this.venues.filter((venue: any) => venue.city == city);
        return filtered || []; // **Ensures an empty array is returned if filter results in null/undefined (though filter usually returns [] already)**
    }


    ticketQuantity: number = 0;
    ticketQuantityy: number = 0;
    selectedCityId: any;


    hover: any;

    addTicket(ticket: any, i: number): void {
        const maxTickets = ticket.MAX_TICKETS;
        const currentQty = ticket.QTY;
        var totalAvailable = 0;


        if (!this.memberId || !this.selectedmembership?.ID || this.selectedVenue.RESERVATION_MODE == 'V') {
            totalAvailable = ticket.REGULAR_SEATS;
        } else {
            totalAvailable = ticket.AVAILABLE;
        }

        if (this.selectedmembership?.ID && this.getTotalTickets() >= 2) {
            this.toastr.warning('You can choose up to 2 tickets with your membership.');
            return;
        }

        if (totalAvailable <= 0) {
            this.toastr.warning('No seats available for this section.');
            return;
        }

        if (currentQty >= totalAvailable) {
            this.toastr.warning(`Only ${totalAvailable} seats are available for ${ticket.NAME}.`);
            return;
        }

        if (currentQty >= maxTickets) {
            this.toastr.warning(`You can select a maximum of ${maxTickets} tickets in ${ticket.NAME}.`);
            return;
        }


        if (this.selectedmembership?.ID && this.selectedVenue.RESERVATION_MODE != 'V') {

            let remainingseats = this.ALREADY_USED_COUNT == 0 ?
                this.planselecteduseddata.NO_OF_RESERVED_SEATS -
                this.planselecteduseddata.USED_QUOTA :
                this.ALREADY_USED_COUNT == 1 && (this.planselecteduseddata.NO_OF_RESERVED_SEATS -
                    this.planselecteduseddata.USED_QUOTA >= 1) ? 1 : this.ALREADY_USED_COUNT == 2 ? 0 : 0;




            var remainingseats1 = 0;

            if (remainingseats >= 2) {
                remainingseats1 = 2
            } else {
                remainingseats1 = remainingseats
            }

            if (remainingseats1 > 0) {
                var totalplanseats = this.tickets.reduce((sum, t) => sum + t.reveredselectedseat, 0);

                if (ticket.REGULAR_SEATS == 0 && ticket.PLAN_SEATSss > 0) {

                    if (totalplanseats >= remainingseats1) {
                        this.toastr.warning(`You can select only ${remainingseats1} reserved tickets.`);
                        return;
                    }
                    else {
                        ticket.reveredselectedseat++
                        ticket.PLAN_SEATSss--
                    }

                } else {

                    if (totalplanseats >= remainingseats1 || ticket.PLAN_SEATSss == 0) {
                        if (currentQty - ticket.reveredselectedseat >= ticket.REGULAR_SEATS && ticket.PLAN_SEATSss > 0) {
                            this.toastr.warning(`Only ${ticket.REGULAR_SEATS} General seats are available for ${ticket.NAME}.`);
                            return;
                        } else {

                        }
                    } else {
                        ticket.reveredselectedseat++
                        ticket.PLAN_SEATSss--
                    }
                }
            } else {

                if (this.USED_COUNT != undefined && this.USED_COUNT <= 0 && ticket.REGULAR_SEATS == 0) {
                    this.toastr.warning(
                        'Your membership quota has been fully used.Please select regular seats.'
                    );
                    return;
                }
                if (remainingseats <= 0 && ticket.REGULAR_SEATS == 0) {
                    this.toastr.warning(
                        'Your membership’s reserved seat quota for this event has been completely used.Please select regular seats.'
                    );
                    return;
                }

                if (currentQty >= ticket.REGULAR_SEATS) {

                    this.toastr.warning(`Only ${ticket.REGULAR_SEATS} General seats are available for ${ticket.NAME}.`);
                    return;
                } else {

                }
            }

        }
        ticket.QTY++;
        ticket.BOOKED++;
    }

    removeTicket(ticket: any, i: number): void {
        if (ticket.QTY > 0) {
            ticket.QTY--;
            ticket.BOOKED--;
            if (ticket.reveredselectedseat > 0) {
                ticket.reveredselectedseat--
                ticket.PLAN_SEATSss++
            }


        }
    }

    getTotalTickets(): number {
        return this.tickets.reduce((sum, t) => sum + t.QTY, 0);
    }

    getTotalAmount(): any {
        // //

        if (this.Hoisting_Type == 'U') {
            return this.tickets.reduce((sum, t) => sum + t.QTY * t.PRICE, 0);
        } else if (this.Hoisting_Type == 'S') {
            return this.selectedSeat.reduce((sum, t) => sum + t.QTY * t.PRICE, 0);
        } else {
            return 0;
        }
    }

    //------------------------------------- step 3 ------------------------------------- //

    //------------------------------------- step 4 ------------------------------------- //

    activeTab: 'orderSummary' | 'billingDetails' = 'orderSummary';

    setActiveTab(tab: 'orderSummary' | 'billingDetails') {
        this.activeTab = tab;
    }
    billingDetails = {
        fullName: '',
        email: '',
        phone: '',
        address: '',
    };




    selectedOffer: any = null;
    searchOfferQuery = '';

    isMobile: Boolean = false;
    timer: any;
    countdown: any; // 1 minute 20 seconds

    orderSummary: any = {
        items: [],
    };

    bookingFee = 0;
    get totalAmount(): number {
        // //

        return this.orderSummary.items.reduce(
            (acc: number, item: any) => acc + item.price,
            0
        );
    }



    showOfferModal() {
        const modalElement = document.getElementById('offerModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }

    selectOffer(offer: any) {
        this.selectedOffer = offer;
    }

    applySelectedOffer() {
        if (!this.selectedOffer) return;
        // Optionally do something when offer applied
        const modalElement = document.getElementById('offerModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
        }
    }



    startTimerIfStep4() {
        if (this.activeStep == 4) {
            this.clearTimer(); // Clear any previous timer
            this.countdown = 240; // Reset timer to 4 minutes

            const duration = this.countdown * 1000; // milliseconds
            const startTime = performance.now();

            this.timer = setInterval(() => {
                const elapsed = performance.now() - startTime;
                const remaining = Math.max(0, Math.floor((duration - elapsed) / 1000));
                this.countdown = remaining;

                if (remaining == 0) {
                    this.goBackToPreviousStep();
                    this.clearTimer();
                }
            }, 1000);
        } else {
            this.clearTimer();
        }
    }



    backFromQueue() {

        try {
            this.location.back();
        } catch (error) {
            this.router.navigate(['/home'], { replaceUrl: true }); // fallback
        }

    }

    removefromQueue() {

        const tempid = localStorage.getItem('deviceId');

        if (this.N_EVENT_SCHEDULE_ID != undefined && this.N_EVENT_ID != undefined && this.N_EVENT_SCHEDULE_ID != null && this.N_EVENT_ID != null) {
            var repayload: any = {
                SESSION_KEY: this.SESSION_ID,
                TEMP_UNIQUE_ID: tempid,
                EVENT_SCHEDULE_ID: this.N_EVENT_SCHEDULE_ID,
                EVENT_ID: this.N_EVENT_ID
            }

            this.apiService.removequeue(repayload).subscribe({
                next: (successCode: any) => {
                    sessionStorage.removeItem('queuenumber');
                }
            });
        }
        else {
            if (this.eventID != undefined && this.eventID != null && this.EVENT_SCHEDULE_ID != undefined && this.EVENT_SCHEDULE_ID != null)
                var repayload2: any = {
                    TEMP_UNIQUE_ID: tempid,
                    SESSION_KEY: this.SESSION_ID,
                    "EVENT_ID": this.eventID,
                    "EVENT_SCHEDULE_ID": this.EVENT_SCHEDULE_ID
                }

            this.apiService.removequeue(repayload2).subscribe({
                next: (successCodes: any) => {
                    sessionStorage.removeItem('queuenumber');
                }
            });
        }

    }

    goBackToPreviousStep() {
        this.stopAllTimers();
        this.loadBookingFlag = true;

        const modal1 = document.getElementById('offerModallllll');
        if (modal1) {
            const bootstrapModal1 = bootstrap.Modal.getInstance(modal1) || new bootstrap.Modal(modal1);
            bootstrapModal1.hide();
        }
        // this.router.navigate(['/home']).then(() =>
        // window.location.reload()
        if (this.is_event_heavy || this.IS_QUEUE_ENABLED == true) {
            this.removefromQueue();
        }

        this.handleAllRemovalAndRelease()
        // );

        // this.activeStep = 3;
        // this.previous();
    }

    clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        } else {
            this.timer = null
        }
    }

    selectedPaymentMethod: string = 'CODD'; // Default Payment Mode
    RAZOR_PAY_KEY = environment.RAZOR_PAY_KEY; // Razorpay API Key

    onSubmitBillingForm(form: NgForm) {
        if (form.valid && this.activeTab == 'billingDetails') {
            const billing = this.billingDetails;

            const finalAmount = this.totalAmount + this.bookingFee;
            // const cartId = this.cartId; // Ensure this is set properly

            const options: any = {
                key: this.RAZOR_PAY_KEY,
                amount: finalAmount * 100, // Amount in paise
                currency: 'INR',
                name: billing.fullName,
                phone: billing.phone,
                description: 'Order Payment',
                notes: {
                    Time: this.toMySQLTime(this.selectedTime),
                    Date: this.formatToDDMMYYYY111(this.selectedDate),
                    Venue: this.selectedVenue.name,
                    City: this.selectedVenue.CITY_NAME,
                    ShowName: this.eventname,
                    CouponCode: this.paymentdata?.coupon_details ? this.paymentdata?.coupon_details['CODE'] : null,
                    CouponDiscount: this.paymentdata?.coupon_details ? this.paymentdata?.coupon_details['COUPON_DISCOUNT'] : 0,
                    MembershipName: this.selectedmembership?.NAME || null,
                    DiscountType: this.selectedmembership?.DISCOUNT_TYPE || null,
                    MebershipDiscount: this.selectedmembership?.DISCOUNT_VALUE || 0,

                },
                handler: async (data: any) => {
                    const paymentPayload = {
                        // CART_ID: cartId,
                        ORDER_ID: null,
                        // CUSTOMER_ID: this.user?.ID,
                        MOBILE_NUMBER: billing.phone,
                        PAYMENT_FOR: 'O',
                        PAYMENT_MODE: 'O',
                        PAYMENT_TYPE: 'O',
                        // TRANSACTION_DATE: moment().format('YYYY-MM-DD'),
                        TRANSACTION_ID: data.razorpay_payment_id,
                        TRANSACTION_STATUS: 'Success',
                        TRANSACTION_AMOUNT: finalAmount,
                        PAYLOAD: options,
                        RESPONSE_DATA: data,
                        RESPONSE_CODE: 200,
                        MERCHENT_ID: this.RAZOR_PAY_KEY,
                        RESPONSE_MESSAGE: 'Transaction success',
                        CLIENT_ID: 1,
                        BILLING_DETAILS: {
                            FULL_NAME: billing.fullName,
                            EMAIL: billing.email,
                            PHONE: billing.phone,
                            ADDRESS: billing.address,
                        },
                    };

                    // Call backend API to save payment details
                    // this.apiservice.addPaymentTransactions(paymentPayload).subscribe({
                    // next: (response: any) => {
                    // if (response?.code == 200) {
                    // this.message.success('Payment successful. Your order has been placed!', '');
                    // } else {
                    // this.message.error('Payment successful, but order processing failed.', '');
                    // }
                    // },
                    // error: () => {
                    // this.message.error('Something went wrong while processing the payment.', '');
                    // }
                    // });
                },
                modal: {
                    ondismiss: function () {
                        // enable scroll again if needed
                        document.body.style.overflow = 'auto';
                    },
                    escape: true, // allow ESC key to close
                    backdropclose: true, // allow clicking outside to close
                },
                prefill: {
                    name: billing.fullName,
                    email: billing.email,
                    contact: billing.phone,
                },
                theme: {
                    color: '#3399cc',
                },
            };

            const razorpay3 = new Razorpay(options);
            razorpay3.open();
        } else {
            form.control.markAllAsTouched();
        }
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
    //------------------------------------- step 4 ------------------------------------- //

    //------------------------------------- footer ------------------------------------- //
    allpayyload: any
    isStepOneValid(): boolean {
        return this.selectedDate != null && this.selectedTime != null;
    }

    // --- NEW VALIDATION FOR STEP 2 ---
    isStepTwoValid(): boolean {
        return this.ticketQuantity > 0; // At least one ticket must be selected
    }
    inprocessseats: any = []
    BENEFIT_APPLY = false;
    TEMP_HOLD_ID: any = 0;
    proceed() {
        this.loadBookingFlag = true;
        if (this.activeStep == 1) {
            this.activeStep = 2;
            this.clearTimer();
            this.loadBookingFlag = false;
            this.selectedSeats1 = [];

        } else if (this.activeStep == 2) {
            // this.activeStep = 3;
            // console.log('here', this.selectedTime, this.storetime)
            if (this.selectedTime) {

                this.selectTime1(this.storetime)
                // this.getDataForBooking(this.eventscheduleid);
                this.clearTimer();
            }

            this.selectedSeats1 = [];
        } else if (this.activeStep == 3) {
            this.coupanapplies = false;
            this.applycode = '';
            this.selectedcupon = [];

            // ── Charted venue: build TICKETS from selectedSeats1 and call getPayableCharted ──
            if (this.Hoisting_Type === 'C') {
                const seatGroups = new Map<string, any>();
                for (const seat of this.selectedSeats1) {
                    const key = `${seat.SN}_${seat.SP}`;
                    if (!seatGroups.has(key)) {
                        seatGroups.set(key, {
                            TYPE: seat.SN,
                            sectionprice: Number(seat.SP),
                            PRICE: Number(seat.SP),
                            QUANTITY: 1,
                            BOOKING_FEE: Number(seat.BF || 0),
                            BOOKING_FEE_TYPE: seat.BT || 'P',
                        });
                    } else {
                        const g = seatGroups.get(key);
                        g.QUANTITY += 1;
                        g.PRICE += Number(seat.SP);
                    }
                }
                const chartedTickets = Array.from(seatGroups.values());
                this.orderSummary.items = chartedTickets.map((t: any) => ({
                    event: t.TYPE, quantity: t.QUANTITY, price: t.PRICE,
                    sectionprice: t.sectionprice, BOOKING_FEE: t.BOOKING_FEE, BOOKING_FEE_TYPE: t.BOOKING_FEE_TYPE
                }));
                this.iscancelled = true;

                this.allpayyload = {
                    VENUE_STATE_ID: this.selectedVenue.VENUE_STATE_ID,
                    EVENT_DETAIL_ID: this.EVENT_SCHEDULE_ID,
                    HOISTING_TYPE: this.Hoisting_Type,
                    TICKETS: chartedTickets,
                    EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                    NO_OF_SEATS: this.selectedSeats1.length,
                    SEAT_NUMBERS: JSON.stringify(this.selectedSeats1.map((s: any) => ({
                        seat: `${s.RN}-${s.N}`, id: s.id, price: Number(s.SP)
                    }))),
                    TEMP_UNIQUE_ID: localStorage.getItem('deviceId'),
                    SESSION_ID: this.SESSION_ID,
                    IS_PLAN_USED: false,
                    PLAN_ID: null,
                    USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                    VENUE_ID: this.selectedVenue?.id,
                    EVENT_ID: this.eventID,
                    SHOW_TIME: this.toMySQLTime(this.selectedTime),
                    SHOW_DATE: this.formatToDDMMYYYY111(this.selectedDate),
                    VENUE_NAME: this.selectedVenue.name,
                    EXTRA_INFORMATION_DATA: this.EXTRA_INFORMATION_DATA ? JSON.stringify(this.EXTRA_INFORMATION_DATA) : '',
                };

                this.apiService.getpaymentdataCharted(this.allpayyload).subscribe({
                    next: (response: any) => {
                        if (response.TEMP_UNIQUE_ID) localStorage.setItem('deviceId', response.TEMP_UNIQUE_ID);
                        if (response?.code == 200) {
                            this.stopTimer();
                            this.paymentdata = response;
                            this.paymentdata.finalAmountwords = this.commonFunction.amountInWords(this.paymentdata.finalAmount);
                            this.activeStep = 4;
                            this.loadBookingFlag = false;
                            this.startTimerIfStep4();
                            this.BENEFIT_APPLY = response.BENEFIT_APPLY;
                            this.TEMP_HOLD_ID = response.TEMP_HOLD_ID;
                        } else {
                            this.toastr.error(response?.message || 'Something went wrong', 'Error');
                            this.loadBookingFlag = false;
                        }
                    },
                    error: (err: any) => {
                        console.error('getPayableCharted error:', err);
                        this.toastr.error('Something went wrong', 'Error');
                        this.loadBookingFlag = false;
                    }
                });
                return;
            }

            {
                const selectedTickets = this.tickets.filter((t) => t.QTY > 0);
                this.orderSummary.items = selectedTickets.map((ticket) => ({
                    event: ticket.NAME,
                    quantity: ticket.QTY,
                    price: ticket.PRICE * ticket.QTY,
                    id: ticket.id,
                    sectionprice: ticket.PRICE,
                    booked: ticket.BOOKED,
                    available: ticket.AVAILABLE,
                    capacity: ticket.CAPACITY,
                    BOOKING_FEE: Number(ticket.BOOKING_FEE || 0),
                    BOOKING_FEE_TYPE: ticket.BOOKING_FEE_TYPE,
                    TOTAL_BOOKED: Number(ticket.TOTAL_BOOKED || 0),
                    REGULAR_BOOKED: Number(ticket.REGULAR_BOOKED || 0),
                    PLAN_BOOKED: Number(ticket.PLAN_BOOKED || 0),
                    PERCENT_SOLD: (Number(ticket.AVAILABLE_SEATS || 0) > 0
                        ? ((Number(ticket.TOTAL_BOOKED || 0) / Number(ticket.AVAILABLE_SEATS || 0)) * 100).toFixed(2)
                        : "0.00")
                }));
            }
            this.iscancelled = true;
            {

                const MAIN_EVENT_NAME = sessionStorage.getItem('maineventname') == undefined || sessionStorage.getItem('maineventname') == 'undefined' || sessionStorage.getItem('maineventname') == 'null' || sessionStorage.getItem('maineventname') == '' ? null : sessionStorage.getItem('maineventname');
                const MAIN_EVENT_ID = sessionStorage.getItem('maineventid') == undefined || sessionStorage.getItem('maineventid') == 'undefined' || sessionStorage.getItem('maineventid') == 'null' || sessionStorage.getItem('maineventid') == '' ? null : sessionStorage.getItem('maineventid');

                this.allpayyload = {
                    "VENUE_STATE_ID": this.selectedVenue.VENUE_STATE_ID,
                    "EVENT_DETAIL_ID": this.EVENT_SCHEDULE_ID,
                    HOISTING_TYPE: this.Hoisting_Type,
                    "TICKETS": this.orderSummary.items.map((item: any) => ({
                        TYPE: item.event,// or item.type if that's the correct key
                        PRICE: item.price,
                        sectionprice: item.sectionprice,
                        QUANTITY: item.quantity,
                        BOOKING_FEE_TYPE: item.BOOKING_FEE_TYPE,
                        BOOKING_FEE: item.BOOKING_FEE
                    })),

                    MAIN_EVENT_NAME,
                    MAIN_EVENT_ID,
                    "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                    "NO_OF_SEATS": this.Hoisting_Type == 'S' ? this.selectedSeat.reduce((sum, t) => sum + t.QTY, 0) : this.tickets.reduce((sum, t) => sum + t.QTY, 0),
                    "SEAT_NUMBERS": JSON.stringify(
                        this.orderSummary.items.map((item: { event: any; price: any; quantity: any }) => ({
                            TYPE: item.event,
                            QUANTITY: item.quantity
                        }))
                    ),
                    "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
                    SESSION_ID: this.SESSION_ID,
                    IS_PLAN_USED: !!this.selectedmembership?.ID,
                    "PLAN_ID": this.selectedmembership?.ID != undefined && this.selectedmembership?.ID != '' ? this.selectedmembership.ID : null,
                    USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                    VENUE_ID: this.selectedVenue?.id,
                    EVENT_ID: this.eventID,
                    SHOW_TIME: this.toMySQLTime(this.selectedTime),
                    SHOW_DATE: this.formatToDDMMYYYY111(this.selectedDate),
                    USER_RESERVED_TICKET_COUNT: this.USER_RESERVED_TICKET_COUNT,
                    PLAN_NAME: this.selectedmembership?.ID != undefined && this.selectedmembership?.ID != '' ? this.selectedmembership?.NAME : '',
                    VENUE_NAME: this.selectedVenue.name,
                    EXTRA_INFORMATION_DATA: this.EXTRA_INFORMATION_DATA ? JSON.stringify(this.EXTRA_INFORMATION_DATA) : '',
                }


                this.apiService.getpaymentdataUncharted(this.allpayyload).subscribe({
                    next: (response: any) => {
                        var res = Object.assign({}, response)
                        if (response.hasOwnProperty('data')) {
                            delete res.data;
                        }
                        if (response.TEMP_UNIQUE_ID != undefined && response.TEMP_UNIQUE_ID != null && response.TEMP_UNIQUE_ID != '' && response.TEMP_UNIQUE_ID != ' ')
                            localStorage.setItem('deviceId', response.TEMP_UNIQUE_ID);

                        var obj = {
                            "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
                            "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                            "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                            "LOG_TYPE": "INFO",
                            "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                            "LOG_TEXT": "User got seat seletion response",
                            "USER_DATA": JSON.stringify({
                                'request': this.allpayyload,
                                'response': res
                            })
                        }

                        this.apiService.actionLogsAdd(obj).subscribe({
                            next: (data: any) => {
                            }
                        });
                        // let deviceId = localStorage.getItem('deviceId');
                        // if (deviceId == undefined || deviceId == null || deviceId == '' || deviceId == ' ') {
                        // localStorage.setItem('deviceId', response.TEMP_UNIQUE_ID);
                        // }
                        if (response?.code == 200) {
                            //
                            this.stopTimer();
                            this.paymentdata = response;
                            this.paymentdata.finalAmountwords = this.commonFunction.amountInWords(this.paymentdata.finalAmount);
                            this.activeStep = 4;
                            this.loadBookingFlag = false;
                            this.startTimerIfStep4()
                            this.BENEFIT_APPLY = response.BENEFIT_APPLY;
                            this.TEMP_HOLD_ID = response.TEMP_HOLD_ID;
                        } else if (response?.code == 300 || response?.code == 404) {
                            this.toastr.info(response.message, 'Info');

                            this.loadBookingFlag = false;
                            if (this.Hoisting_Type == 'U') {

                                const filteredSeats = JSON.parse(
                                    response.data
                                );
                                const seatData = filteredSeats.filter((item: any) =>
                                    (item.IS_DELETE == 1 || item.IS_DELETE == true) ||
                                        (item.IS_WEB_HIDE == 1 || item.IS_WEB_HIDE == true)
                                        ? false
                                        : true
                                );
                                seatData.sort((a: any, b: any) => Number(a.SEAT_PRICE) - Number(b.SEAT_PRICE));
                                this.tickets = []
                                // const seatData = response.data

                                // );
                                this.tickets = seatData.map((seat: any) => ({
                                    id: seat._id,
                                    NAME: seat.SEAT_TYPE_NAME,
                                    PRICE: Number(seat.SEAT_PRICE),
                                    QTY: 0,
                                    CAPACITY: Number(seat.CAPACITY || 0),
                                    BOOKED: 0,
                                    AVAILABLE: Number(seat.AVAILABLE_SEATS || 0) - Number(seat.TOTAL_BOOKED || 0),
                                    PLAN_SEATS: Number(seat.PLAN_SEATS || 0) - Number(seat.PLAN_BOOKED || 0),
                                    REGULAR_SEATS: Number(seat.REGULAR_SEATS || 0) - Number(seat.REGULAR_BOOKED || 0),
                                    MAX_TICKETS: Number(seat.MAX_TICKETS || 0),
                                    BOOKING_FEE: Number(seat.BOOKING_FEE || 0),
                                    BOOKING_FEE_TYPE: seat.BOOKING_FEE_TYPE,
                                    TOTAL_BOOKED: Number(seat.TOTAL_BOOKED || 0),
                                    REGULAR_BOOKED: Number(seat.REGULAR_BOOKED || 0),
                                    PLAN_BOOKED: Number(seat.PLAN_BOOKED || 0),
                                    PERCENT_SOLD: (Number(seat.AVAILABLE_SEATS || 0) > 0
                                        ? ((Number(seat.TOTAL_BOOKED || 0) / Number(seat.AVAILABLE_SEATS || 0)) * 100).toFixed(2)
                                        : "0.00"),

                                    AVAILABLE_SEATS: Number(seat.AVAILABLE_SEATS || 0),
                                    PLAN_SEATSss: Number(seat.PLAN_SEATS || 0) - Number(seat.PLAN_BOOKED || 0),
                                    REGULAR_SEATSss: Number(seat.REGULAR_SEATS || 0) - Number(seat.REGULAR_BOOKED || 0),

                                    reveredselectedseat: 0
                                }));
                                if (this.selectedmembership?.ID != undefined && this.selectedmembership?.ID != null && this.selectedmembership?.ID != '') {
                                    this.clearmembershipnew();
                                } else {
                                    this.dummytickets = JSON.parse(JSON.stringify(this.tickets));
                                    this.selectedmembership = [];
                                    this.draftselectedmember = [];
                                }

                            }

                        } else if (response?.code == 409) {
                            this.toastr.info('Something went wrong!', 'Info');

                            this.loadBookingFlag = false;
                            if (this.Hoisting_Type == 'U') {

                                const filteredSeats = JSON.parse(
                                    response.data
                                );
                                const seatData = filteredSeats.filter((item: any) =>
                                    (item.IS_DELETE == 1 || item.IS_DELETE == true) ||
                                        (item.IS_WEB_HIDE == 1 || item.IS_WEB_HIDE == true)
                                        ? false
                                        : true
                                );
                                seatData.sort((a: any, b: any) => Number(a.SEAT_PRICE) - Number(b.SEAT_PRICE));
                                this.tickets = []
                                this.clearSessionId();
                                this.SESSION_ID = this.generateTabSessionId();
                                this.tickets = seatData.map((seat: any) => ({
                                    id: seat._id,
                                    NAME: seat.SEAT_TYPE_NAME,
                                    PRICE: Number(seat.SEAT_PRICE),
                                    QTY: 0,
                                    CAPACITY: Number(seat.CAPACITY || 0),
                                    BOOKED: 0,
                                    AVAILABLE: Number(seat.AVAILABLE_SEATS || 0) - Number(seat.TOTAL_BOOKED || 0),
                                    PLAN_SEATS: Number(seat.PLAN_SEATS || 0) - Number(seat.PLAN_BOOKED || 0),
                                    REGULAR_SEATS: Number(seat.REGULAR_SEATS || 0) - Number(seat.REGULAR_BOOKED || 0),
                                    MAX_TICKETS: Number(seat.MAX_TICKETS || 0),
                                    BOOKING_FEE: Number(seat.BOOKING_FEE || 0),
                                    BOOKING_FEE_TYPE: seat.BOOKING_FEE_TYPE,
                                    TOTAL_BOOKED: Number(seat.TOTAL_BOOKED || 0),
                                    REGULAR_BOOKED: Number(seat.REGULAR_BOOKED || 0),
                                    PLAN_BOOKED: Number(seat.PLAN_BOOKED || 0),
                                    PERCENT_SOLD: (Number(seat.AVAILABLE_SEATS || 0) > 0
                                        ? ((Number(seat.TOTAL_BOOKED || 0) / Number(seat.AVAILABLE_SEATS || 0)) * 100).toFixed(2)
                                        : "0.00"),

                                    AVAILABLE_SEATS: Number(seat.AVAILABLE_SEATS || 0),
                                    PLAN_SEATSss: Number(seat.PLAN_SEATS || 0) - Number(seat.PLAN_BOOKED || 0),
                                    REGULAR_SEATSss: Number(seat.REGULAR_SEATS || 0) - Number(seat.REGULAR_BOOKED || 0),

                                    reveredselectedseat: 0
                                }));

                                this.dummytickets = JSON.parse(JSON.stringify(this.tickets));
                                this.selectedmembership = [];
                                this.draftselectedmember = [];


                            }

                        }
                        else if (response?.code == 405) {
                            this.iscancelled = true;
                            const modal = new bootstrap.Modal(document.getElementById('selectSeatCountModalformodelll')!);
                            modal.show();
                        }
                        else {
                            this.selectedmembership = []
                            this.draftselectedmember = []
                            this.toastr.info(response.message, 'Info');
                            this.loadBookingFlag = false;
                        }
                    },
                    error: () => {
                        this.selectedmembership = []
                        this.draftselectedmember = []
                        this.loadBookingFlag = false;
                    }
                });

                   }

            this.clearTimer();
        } else if (this.activeStep == 4) {
            this.clearTimer(); // Optional: stop the timer if user proceeds
            this.loadBookingFlag = false;
        }
        this.updateStepTitle();
        // }
    }

    showLoginModal() {
        var d = document.getElementById('loginmodaltrack') as HTMLElement;
        d.click();
    }

    openlogin() {
        this.closelogin.nativeElement.click();
        this.router.navigate(['/sign-in']);
    }
    paymentdata: any;

   

    QR_CODE: any;
    BOOKING_CODE: any;

    proceedToPay() {
        this.iscancelled = false;
        if (this.applycode.length > 0 && !this.coupanapplies) {
            this.toastr.error('Please apply coupon first', 'Error');
            return;
        }
        if (this.checkforadd && !this.addinaldataaded) {
            this.toastr.error('Please add additional details first', 'Error');
            return;
        }


        this.clearTimer()
        this.loadBookingFlag = true;
        //
        const TEMP_UNIQUE_ID = localStorage.getItem('deviceId');
        const bookingPayload = this.orderSummary.items.map(
            (item: any, index: number) => ({

                TICKET_BOOKING_EVENT_ID: this.bookingMeta?.ID,
                USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                USER_TYPE: 'C',
                SEAT_NUMBERS: item.seats,
                SEAT_IDS: this.selectedSeatsIDs.toString(),
                AMOUNT: item.price,
                SECTION_NAME: item.event,
                EVENT_ID: this.eventID,
                NO_OF_TICKETS: item.booked,
                BOOKING_FEE: item.BOOKING_FEE,
                BOOKING_FEE_TYPE: item.BOOKING_FEE_TYPE
            })
        );


        const totalSeats = bookingPayload.reduce((sum: any, item: any) => sum + item.NO_OF_TICKETS, 0);

        const HOSTING_TYPE = this.Hoisting_Type;
        const VENUE_NAME = this.selectedVenue.name
        const VENUE_ID = this.selectedVenue.id
        const VENUE_SHORT_CODE = this.selectedVenue.venueShortCode
        const EVENT_NAME = this.eventname
        const EVENT_ID = this.eventID
        const EVENT_SHORT_CODE = this.eventShortCode
        const EVENT_SCHEDULE_ID = this.EVENT_SCHEDULE_ID
        const TRANSACTION_ID = ''
        const SHOW_TIME = this.toMySQLTime(this.selectedTime);
        const SHOW_DATE = this.formatToDDMMYYYY(this.selectedDate)

        const bodyyyyy = {
            BENEFIT_APPLY: this.BENEFIT_APPLY,
            TEMP_HOLD_ID: this.TEMP_HOLD_ID,
            IS_PLAN_USED: !!this.selectedmembership?.ID,
            HOSTING_TYPE,
            "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
            BOOKING_DETAILS: bookingPayload,
            SEATIDS: this.selectedSeatsIDs.toString(),

            EXTRA_INFORMATION_DATA: this.EXTRA_INFORMATION_DATA ? JSON.stringify(this.EXTRA_INFORMATION_DATA) : '',
            RAZ_ORDER_ID: '',
            ADDITIONAL_EMAIL_ID: this.addional.EMAIL,
            ADDITIONAL_USER_NAME: this.addional.NAME,
            ADDITIONAL_MOBILE_NO: this.addional.MOBILE,

            EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
            SESSION_ID: this.SESSION_ID,
            TEMP_UNIQUE_ID: TEMP_UNIQUE_ID,
            EVENT_IMAGE: this.eventImage,
            seatIds: this.selectedSeatsIndex,
            AGE_GROUP: this.EVENT_AGE_GROUP,
            RAZ_SIGNATURE: '',
            EVENT_SHORT_CODE,
            VENUE_SHORT_CODE,
            TRANSACTION_ID,
            EVENT_DETAILS_ID: EVENT_SCHEDULE_ID,
            TERMS_CONDITIONS: this.TERMS_CONDITIONS,
        }


        this.apiService.addCartDetailsdd(bodyyyyy).subscribe({
            next: (responseeeeeee: any) => {
                var obj = {
                    "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                    "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                    "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                    "LOG_TYPE": "INFO",
                    "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                    "LOG_TEXT": "User cart creation response",
                    "USER_DATA": JSON.stringify({
                        'request': bodyyyyy,
                        'response': responseeeeeee
                    })
                }

                this.apiService.actionLogsAdd(obj).subscribe({
                    next: (data: any) => {
                    }
                });
                if (responseeeeeee?.code == '200') {
                    var BOOKING_CART_ID = responseeeeeee.BOOKING_CART_ID;
                    this.paymentdata.finalAmount = responseeeeeee.finalAmount;
                    if (responseeeeeee.totalAmount > 0) {

                        const options2 = {
                            key: this.RAZOR_PAY_KEY,
                            amount: responseeeeeee.totalAmount * 100, // Razorpay expects amount in paisa
                            currency: 'INR',
                            name: 'Ticket Khidakee',
                            description: 'Order Payment',
                            order_id: responseeeeeee.RAZ_ORDER_ID,
                            prefill: {
                                contact: this.memberId ? localStorage.getItem('MOBILE_NO') : this.user.MOBILE,
                                email: this.memberId ? localStorage.getItem('EMAIL_ID') : this.user.EMAIL,
                                name: this.memberId ? localStorage.getItem('NAME') : this.user.NAME,

                            },
                            notes: {
                                Time: this.toMySQLTime(this.selectedTime),
                                Date: this.formatToDDMMYYYY111(this.selectedDate),
                                Venue: this.selectedVenue.name,
                                City: this.selectedVenue.CITY_NAME,
                                ShowName: this.eventname,
                                CouponCode: this.paymentdata?.coupon_details ? this.paymentdata?.coupon_details['CODE'] : null,
                                CouponDiscount: this.paymentdata?.coupon_details ? this.paymentdata?.coupon_details['COUPON_DISCOUNT'] : 0,
                                MembershipName: this.selectedmembership?.NAME || null,
                                DiscountType: this.selectedmembership?.DISCOUNT_TYPE || null,
                                MebershipDiscount: this.selectedmembership?.DISCOUNT_VALUE || 0,

                            },
                            timeout: 600,
                            handler: async (data: any) => {


                                const body = {
                                    // CART_ID: cartId,
                                    // ORDER_ID: null,
                                    USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                                    // MOBILE_NUMBER: this.user?.MOBILE_NO,
                                    PAYMENT_FOR: 'O',
                                    PAYMENT_MODE: 'O',
                                    PAYMENT_TYPE: 'O',
                                    TRANSACTION_DATE: this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
                                    TRANSACTION_ID: data.razorpay_payment_id,
                                    TRANSACTION_STATUS: 'Success',
                                    TRANSACTION_AMOUNT: this.paymentdata?.finalAmount,
                                    PAYLOAD: options2,
                                    RESPONSE_DATA: data,
                                    RESPONSE_CODE: 200,
                                    MERCHENT_ID: this.RAZOR_PAY_KEY,
                                    RESPONSE_MESSAGE: 'Transaction success',
                                    CLIENT_ID: 1,
                                    SHOW_TIME: this.toMySQLTime(this.selectedTime),
                                    SHOW_DATE: this.formatToDDMMYYYY111(this.selectedDate),
                                    VENUE_NAME: this.selectedVenue.name,
                                    VENUE_CITY: this.selectedVenue.CITY_NAME,
                                    EVENT_NAME: this.eventname,
                                    RAZ_ORDER_ID: responseeeeeee.RAZ_ORDER_ID,
                                    SESSION_ID: this.SESSION_ID,
                                    EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                                    MEMBERSHIP_PURCHASE: 0,
                                    EVENT_SCHEDULE_ID: this.EVENT_SCHEDULE_ID,
                                    EVENT_ID: this.eventID,
                                    TEMP_UNIQUE_ID: TEMP_UNIQUE_ID,
                                    BOOKING_DETAILS: bookingPayload,
                                    SEATIDS: this.selectedSeatsIDs.toString(),
                                    HOSTING_TYPE: this.Hoisting_Type
                                };


                                setTimeout(() => {
                                    this.apiService.addPaymentTransactions(body).subscribe({
                                        next: (response: any) => {
                                            var obj = {
                                                "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                                "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                "LOG_TYPE": "INFO",
                                                "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                                "LOG_TEXT": "Payment Entry Response",
                                                "USER_DATA": JSON.stringify({
                                                    'request': body,
                                                    'response': response
                                                })
                                            }

                                            this.apiService.actionLogsAdd(obj).subscribe({
                                                next: (data: any) => {
                                                }
                                            });

                                            if (response?.code == '200' || response?.code == '201') {



                                                const TRANSACTION_ID = body.TRANSACTION_ID


                                                const payload = {

                                                    razOrderID: data?.razorpay_order_id,
                                                    TEMP_HOLD_ID: this.TEMP_HOLD_ID,
                                                    EXTRA_INFORMATION_DATA: this.EXTRA_INFORMATION_DATA ? JSON.stringify(this.EXTRA_INFORMATION_DATA) : '',

                                                    ADDITIONAL_EMAIL_ID: this.addional.EMAIL,
                                                    ADDITIONAL_USER_NAME: this.addional.NAME,
                                                    ADDITIONAL_MOBILE_NO: this.addional.MOBILE,


                                                    SESSION_ID: this.SESSION_ID,
                                                    EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                                                    TEMP_UNIQUE_ID: TEMP_UNIQUE_ID,
                                                    HOSTING_TYPE,
                                                    RESERVE_TICKET_NOS: this.paymentdata?.reservedTickets,
                                                    TRANSACTION_ID,
                                                    RAZ_SIGNATURE: data?.razorpay_signature,
                                                    DISCOUNT_TYPE: this.selectedmembership?.DISCOUNT_TYPE || null,
                                                    BOOKING_FEE: this.paymentdata?.bookingFeeRate,
                                                    BOOKING_FEE_TYPE: this.paymentdata?.bookingFeeType,
                                                    TERMS_CONDITIONS: this.TERMS_CONDITIONS,
                                                };

                                                if (response?.code == '201') {
                                                    this.BOOKING_CODE = response.BOOKING_CODE;
                                                    this.toastr.success('Booking successful', 'Success');
                                                    let qrText = "{'Booking_Code':'" + this.BOOKING_CODE + "'}";
                                                    this.clearSessionId();
                                                    this.generateQRWithLogo(
                                                        qrText,
                                                        'assets/logo.png'
                                                    ).then(finalQr => {
                                                        this.qrCodeDataURL = finalQr;
                                                        this.loadBookingFlag = false;
                                                        this.ticketData = {
                                                            qrCodeDataURL: this.qrCodeDataURL,
                                                            TERMS_CONDITIONS: this.TERMS_CONDITIONS,
                                                            PLAN_ID: response.data.PLAN_ID || null,
                                                            PLAN_NAME: response.data.PLAN_ID != undefined && response.data.PLAN_ID != '' ? response.data.PLAN_NAME : '',
                                                            EVENT_AGE_GROUP: response.data.AGE_GROUP,
                                                            CITY_NAME: response.data.VENUE_CITY_NAME,
                                                            mobileno: this.memberId ? this.addional?.MOBILE ? this.addional.MOBILE : localStorage.getItem('MOBILE_NO') : this.user.MOBILE,
                                                            mobileno1: this.memberId ? localStorage.getItem('MOBILE_NO') : this.user.MOBILE,
                                                            email: this.memberId ? this.addional?.EMAIL ? this.addional.EMAIL : localStorage.getItem('EMAIL_ID') : this.user.EMAIL,
                                                            ADDITIONAL_EMAIL_ID: this.addional.EMAIL,
                                                            ADDITIONAL_USER_NAME: this.addional.NAME,
                                                            ADDITIONAL_MOBILE_NO: this.addional.MOBILE,
                                                            eventTitle: response.data.EVENT_NAME,
                                                            eventImage: response.data.EVENT_IMAGE,
                                                            eventDate: this.formatToDDMMYYYY(response.data.SHOW_DATE),
                                                            eventTime: response.data.SHOW_TIME,
                                                            eventVenue: response.data.VENUE_NAME,
                                                            customerName: response.data.USER_NAME,
                                                            ticketCount: response.data.NUMBERS_OF_SEATS,
                                                            seatInfo: JSON.parse(response.data.BOOKING_DATA),
                                                            hostingType: response.data.HOSTING_TYPE,
                                                            bookingId: this.BOOKING_CODE,
                                                            finalAmount: Number(response.data.finalAmount) || 0,
                                                            totalPrice: Number(response.data.totalPrice) || 0,
                                                            payMode: 'O',
                                                            taxFee: response.data.totalTaxPrice,
                                                            bookingFee: response.data.TOTAL_BOOKING_FEE,
                                                            // discount: this.paymentdata?.discount || this.paymentdata?.membertotalDiscount || 0,
                                                            discount: response.data.DISCOUNT_AMOUNT || 0,
                                                            reference: TRANSACTION_ID,
                                                            // convenienceFee: this.paymentdata?.totalBookingFee + this.paymentdata?.totalTaxPrice,
                                                            convenienceFee: Number(response.data.TOTAL_BOOKING_FEE) + Number(response.data.totalTaxPrice),
                                                            // coupandiscount: Number(this.paymentdata?.discount) || 0,
                                                            coupandiscount: Number(response.data.COUPON_DETAILS.COUPON_DISCOUNT) || 0,
                                                            memberdiscount: Number(this.paymentdata?.membertotalDiscount) || 0,
                                                            IS_COUPON_USED: response.data.IS_COUPON_USED,
                                                            IS_PLAN_USED: response.data.IS_PLAN_USED,
                                                            MAIN_EVENT_NAME: response.data.MAIN_EVENT_NAME || '',

                                                        }

                                                        this.activeStep = 5;
                                                        setTimeout(() => {
                                                            this.changeDetectorRef.detectChanges();
                                                        }, 500)
                                                    })
                                                        .catch((err: any) => {

                                                            this.qrCodeDataURL = '';
                                                            this.loadBookingFlag = false;
                                                            this.activeStep = 5;
                                                        });
                                                    setTimeout(() => {
                                                        this.changeDetectorRef.detectChanges();
                                                    }, 500)
                                                } else {

                                                    this.apiService.sendBookingData(payload).subscribe({
                                                        next: (response: any) => {
                                                            this.clearSessionId();
                                                            var obj = {
                                                                "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                                                "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                                "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                                "LOG_TYPE": "INFO",
                                                                "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                                                "LOG_TEXT": "Booking Data send",
                                                                "USER_DATA": JSON.stringify({
                                                                    'request': payload,
                                                                    'response': response
                                                                })
                                                            }

                                                            this.apiService.actionLogsAdd(obj).subscribe({
                                                                next: (data: any) => {
                                                                }
                                                            });
                                                            if (response?.code == '200' || response?.code == '409') {
                                                                this.clearSessionId();
                                                                this.toastr.success('Booking successful', 'Success');
                                                                // this.QR_CODE = response.QR_CODE
                                                                this.BOOKING_CODE = response.BOOKING_CODE

                                                                // this.BOOKING_PDF = response.BOOKING_PDF
                                                                let qrText = "{'Booking_Code':'" + this.BOOKING_CODE + "'}";

                                                                this.generateQRWithLogo(
                                                                    qrText,
                                                                    'assets/logo.png'
                                                                ).then(finalQr => {
                                                                    this.qrCodeDataURL = finalQr;
                                                                    this.loadBookingFlag = false;
                                                                    this.ticketData = {
                                                                        qrCodeDataURL: this.qrCodeDataURL,
                                                                        TERMS_CONDITIONS: this.TERMS_CONDITIONS,
                                                                        PLAN_ID: response.data.PLAN_ID || null,
                                                                        PLAN_NAME: response.data.PLAN_ID != undefined && response.data.PLAN_ID != '' ? response.data.PLAN_NAME : '',
                                                                        EVENT_AGE_GROUP: response.data.AGE_GROUP,
                                                                        CITY_NAME: response.data.VENUE_CITY_NAME,
                                                                        mobileno: this.memberId ? this.addional?.MOBILE ? this.addional.MOBILE : localStorage.getItem('MOBILE_NO') : this.user.MOBILE,
                                                                        mobileno1: this.memberId ? localStorage.getItem('MOBILE_NO') : this.user.MOBILE,
                                                                        email: this.memberId ? this.addional?.EMAIL ? this.addional.EMAIL : localStorage.getItem('EMAIL_ID') : this.user.EMAIL,
                                                                        ADDITIONAL_EMAIL_ID: this.addional.EMAIL,
                                                                        ADDITIONAL_USER_NAME: this.addional.NAME,
                                                                        ADDITIONAL_MOBILE_NO: this.addional.MOBILE,
                                                                        eventTitle: response.data.EVENT_NAME,
                                                                        eventImage: response.data.EVENT_IMAGE,
                                                                        eventDate: this.formatToDDMMYYYY(response.data.SHOW_DATE),
                                                                        eventTime: response.data.SHOW_TIME,
                                                                        eventVenue: response.data.VENUE_NAME,
                                                                        customerName: response.data.USER_NAME,
                                                                        ticketCount: response.data.NUMBERS_OF_SEATS,
                                                                        seatInfo: JSON.parse(response.data.BOOKING_DATA),
                                                                        hostingType: response.data.HOSTING_TYPE,
                                                                        bookingId: this.BOOKING_CODE,
                                                                        payMode: response.data.PAYMENT_METHOD || 'O',
                                                                        taxFee: response.data.totalTaxPrice,
                                                                        bookingFee: response.data.TOTAL_BOOKING_FEE,
                                                                        discount: response.data.DISCOUNT_AMOUNT || response.data.DISCOUNT_VALUE || 0,
                                                                        reference: TRANSACTION_ID,
                                                                        finalAmount: response.data.finalAmount || 0,
                                                                        totalPrice: response.data.totalPrice || 0,
                                                                        // convenienceFee: this.paymentdata?.totalBookingFee + this.paymentdata?.totalTaxPrice,
                                                                        convenienceFee: Number(response.data.TOTAL_BOOKING_FEE) + Number(response.data.totalTaxPrice),
                                                                        // coupandiscount: Number(this.paymentdata?.discount) || 0,
                                                                        coupandiscount: Number(response.data.COUPON_DETAILS.COUPON_DISCOUNT) || 0,
                                                                        memberdiscount: Number(this.paymentdata?.membertotalDiscount) || 0,
                                                                        IS_COUPON_USED: response.data.IS_COUPON_USED,
                                                                        IS_PLAN_USED: response.data.IS_PLAN_USED,
                                                                        MAIN_EVENT_NAME: response.data.MAIN_EVENT_NAME || '',

                                                                    }

                                                                    this.activeStep = 5;
                                                                    setTimeout(() => {
                                                                        this.changeDetectorRef.detectChanges();
                                                                    }, 500);
                                                                    this.clearSessionId();
                                                                })
                                                                    .catch((err: any) => {

                                                                        this.qrCodeDataURL = '';
                                                                        this.loadBookingFlag = false;
                                                                        this.activeStep = 5;
                                                                    });
                                                                setTimeout(() => {
                                                                    this.changeDetectorRef.detectChanges();
                                                                }, 500)



                                                            } else if (response?.code == '400') {
                                                                this.toastr.error(
                                                                    'If money was debited, it will be refunded in 5–7 days.',
                                                                    'Failed To Book Ticket',
                                                                    {
                                                                        timeOut: 5000, // auto-hide in 5s
                                                                        closeButton: true,
                                                                        progressBar: true,
                                                                    }
                                                                );
                                                                this.clearSessionId();
                                                                setTimeout(() => {
                                                                    this.router.navigate(['/home']).then(() =>
                                                                        window.location.reload()
                                                                    );
                                                                }, 2000);
                                                            } else {
                                                                this.loadBookingFlag = false;
                                                                this.toastr.error('Booking failed', 'Error');
                                                            }
                                                        },
                                                        error: (err) => {
                                                            this.loadBookingFlag = false;
                                                            this.toastr.error('Error sending booking data.', 'Error');
                                                            var obj = {
                                                                "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                                                "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                                "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                                "LOG_TYPE": "INFO",
                                                                "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                                                "LOG_TEXT": "Booking Data",
                                                                "USER_DATA": JSON.stringify({
                                                                    'request': payload,
                                                                    'response': err
                                                                })
                                                            }


                                                            this.apiService.actionLogsAdd(obj).subscribe({
                                                                next: (data: any) => {
                                                                }
                                                            });
                                                        },
                                                    });
                                                }

                                            } else if (response?.code == '400') {
                                                this.toastr.error(
                                                    'If money was debited, it will be refunded in 5–7 days.',
                                                    'Failed To Book Ticket',
                                                    {
                                                        timeOut: 5000, // auto-hide in 5s
                                                        closeButton: true,
                                                        progressBar: true,
                                                    }
                                                );
                                                this.clearSessionId();
                                                setTimeout(() => {
                                                    this.router.navigate(['/home']).then(() =>
                                                        window.location.reload()
                                                    );
                                                }, 2000);
                                            }
                                            else {
                                                this.toastr.error('Something failed', 'Error');
                                                this.loadBookingFlag = false;
                                            }
                                        },
                                        error: (err) => {
                                            var obj = {
                                                "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                                "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                "LOG_TYPE": "INFO",
                                                "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                                "LOG_TEXT": "Payment Entry Response",
                                                "USER_DATA": JSON.stringify({
                                                    'request': body,
                                                    'response': err
                                                })
                                            }

                                            this.apiService.actionLogsAdd(obj).subscribe({
                                                next: (data: any) => {
                                                }
                                            });
                                            this.toastr.error('Error sending booking data.', 'Error');
                                            this.loadBookingFlag = false;
                                        },
                                    });
                                }, 5000);
                            },
                            modal: {
                                ondismiss: (res: any) => {
                                    if (this.isFailureProcessing) {
                                        this.loadBookingFlag = false;
                                        return;
                                    }
                                    this.loadBookingFlag = true;
                                    // setTimeout(() => {
                                    // window.location.reload();
                                    // }, 2000);

                                    // );
                                    const body = {
                                        USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                                        PAYMENT_FOR: 'O',
                                        PAYMENT_MODE: 'O',
                                        PAYMENT_TYPE: 'O',
                                        TRANSACTION_DATE: this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
                                        EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                                        RAZ_ORDER_ID: responseeeeeee.RAZ_ORDER_ID,
                                        TRANSACTION_STATUS: 'Cancel',
                                        TRANSACTION_ID: 0,
                                        TRANSACTION_AMOUNT: this.paymentdata?.finalAmount,
                                        PAYLOAD: options2,
                                        RESPONSE_DATA: res == 'timeout' ? "Payment session timed out" : 'Transaction cancelled by user',
                                        RESPONSE_CODE: '',
                                        MERCHENT_ID: this.RAZOR_PAY_KEY,
                                        RESPONSE_MESSAGE: res == 'timeout' ? "Payment session timed out" : 'Transaction cancelled by user',
                                        CLIENT_ID: 1,
                                        SHOW_TIME: this.toMySQLTime(this.selectedTime),
                                        SHOW_DATE: this.formatToDDMMYYYY111(this.selectedDate),
                                        VENUE_NAME: this.selectedVenue.name,
                                        VENUE_CITY: this.selectedVenue.CITY_NAME,
                                        EVENT_NAME: this.eventname,
                                        MEMBERSHIP_PURCHASE: 0,
                                        EVENT_SCHEDULE_ID: this.EVENT_SCHEDULE_ID,
                                        EVENT_ID: this.eventID,
                                        TEMP_UNIQUE_ID: TEMP_UNIQUE_ID,
                                        SESSION_ID: this.SESSION_ID,
                                        BOOKING_DETAILS: bookingPayload,
                                        SEATIDS: this.selectedSeatsIDs.toString(),
                                        HOSTING_TYPE: this.Hoisting_Type
                                    };
                                    // var obj = {
                                    //     "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                    //     "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                    //     "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                    //     "LOG_TYPE": "INFO",
                                    //     "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                    //     "LOG_TEXT": "Payment Entry",
                                    //     "USER_DATA": JSON.stringify(body)
                                    // }

                                    // this.apiService.actionLogsAdd(obj).subscribe({
                                    //     next: (data: any) => {
                                    //     }
                                    // });
                                    setTimeout(() => {
                                        this.apiService.addPaymentTransactions(body).subscribe({
                                            next: (response: any) => {
                                                var obj = {
                                                    "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                                    "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                    "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                    "LOG_TYPE": "INFO",
                                                    "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                                    "LOG_TEXT": "Payment Entry Response",
                                                    "USER_DATA": JSON.stringify({
                                                        'request': body,
                                                        'response': response
                                                    })
                                                }

                                                this.apiService.actionLogsAdd(obj).subscribe({
                                                    next: (data: any) => {
                                                    }
                                                });

                                                if (response?.code == '200' || response?.code == '201') {
                                                    this.removeCouponDATAwithoutcalulation();

                                                    this.seatReleaseWithoutJson();

                                                    // if (response?.code == '201') {
                                                    //     this.BOOKING_CODE = response.BOOKING_CODE;
                                                    //     this.toastr.success('Booking successful', 'Success');
                                                    //     this.clearSessionId();
                                                    //     let qrText = "{'Booking_Code':'" + this.BOOKING_CODE + "'}";
                                                    //     QRCode.toDataURL(qrText)
                                                    //         .then((url: string) => {
                                                    //             this.qrCodeDataURL = url;
                                                    //             this.loadBookingFlag = false;
                                                    //             this.ticketData = {
                                                    //                 qrCodeDataURL: this.qrCodeDataURL,
                                                    //                 TERMS_CONDITIONS: this.TERMS_CONDITIONS,
                                                    //                 PLAN_ID: this.selectedmembership?.ID || null,
                                                    //                 EVENT_AGE_GROUP: this.EVENT_AGE_GROUP,
                                                    //                 CITY_NAME: this.selectedVenue.CITY_NAME,
                                                    //                 mobileno: this.memberId ? this.addional?.MOBILE ? this.addional.MOBILE : localStorage.getItem('MOBILE_NO') : this.user.MOBILE,
                                                    //                 email: this.memberId ? this.addional?.EMAIL ? this.addional.EMAIL : localStorage.getItem('EMAIL_ID') : this.user.EMAIL,
                                                    //                 eventTitle: this.eventname,
                                                    //                 eventImage: this.eventImage,
                                                    //                 eventDate: this.formatToDDMMYYYY(this.selectedDate),
                                                    //                 eventTime: this.selectedTime,
                                                    //                 eventVenue: this.selectedVenue.name,
                                                    //                 customerName: this.memberId ? localStorage.getItem('NAME') : this.user.NAME,
                                                    //                 ADDITIONAL_USER_NAME: this.addional?.NAME,
                                                    //                 ticketCount: totalSeats,
                                                    //                 seatInfo: bookingPayload,
                                                    //                 hostingType: this.Hoisting_Type,
                                                    //                 bookingId: this.BOOKING_CODE,
                                                    //                 finalAmount: Number(this.paymentdata?.finalAmount) || 0,
                                                    //                 totalPrice: Number(this.paymentdata?.totalPrice) || 0,
                                                    //                 // convenienceFee: this.paymentdata?.totalBookingFee + this.paymentdata?.totalTaxPrice,
                                                    //                 convenienceFee: Number(this.paymentdata?.totalBookingFee) + Number(this.paymentdata?.totalTaxPrice),
                                                    //                 coupandiscount: Number(this.paymentdata?.discount) || 0,
                                                    //                 memberdiscount: Number(this.paymentdata?.membertotalDiscount) || 0,

                                                    //             }

                                                    //             this.activeStep = 5;
                                                    //             setTimeout(() => {
                                                    //                 this.changeDetectorRef.detectChanges();
                                                    //             }, 500)
                                                    //         })
                                                    //         .catch((err: any) => {

                                                    //             this.qrCodeDataURL = '';
                                                    //             this.loadBookingFlag = false;
                                                    //             this.activeStep = 5;
                                                    //         });
                                                    //     setTimeout(() => {
                                                    //         this.changeDetectorRef.detectChanges();
                                                    //     }, 500)
                                                    // } else {

                                                    if (res == 'timeout')
                                                        this.toastr.error('Payment session timed out', 'Timeout', {
                                                            timeOut: 5000, // auto-hide in 5s
                                                            closeButton: true,
                                                            progressBar: true,
                                                        });
                                                    else
                                                        this.toastr.error('Payment was not completed or cancelled by user.', 'Payment Cancelled', {
                                                            timeOut: 5000, // auto-hide in 5s
                                                            closeButton: true,
                                                            progressBar: true,
                                                        });
                                                    this.clearSessionId();
                                                    setTimeout(() => {
                                                        this.router.navigate(['/home']).then(() =>
                                                            window.location.reload()
                                                        );
                                                    }, 2000);
                                                    // }
                                                    // this.updateSeatLayoutWithBookingStatus();
                                                }
                                            },
                                            error: (err) => {
                                                var obj = {
                                                    "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                                    "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                    "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                    "LOG_TYPE": "INFO",
                                                    "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                                    "LOG_TEXT": "Payment Entry Response",
                                                    "USER_DATA": JSON.stringify({
                                                        'request': body,
                                                        'response': err
                                                    })
                                                }

                                                this.apiService.actionLogsAdd(obj).subscribe({
                                                    next: (data: any) => {
                                                    }
                                                });
                                                this.toastr.error('Error sending booking data.', 'Error');
                                                this.loadBookingFlag = false;
                                            }
                                        });
                                    }, 5000);
                                }
                            },

                            theme: {
                                color: '#3399cc',
                            },
                        };

                        const razorpay = new Razorpay(options2);

                        // Add payment failed handler
                        razorpay.on('payment.failed', (response: any) => {
                            // const existing = document.querySelector('.razorpay-container') as HTMLElement;
                            // if (existing) existing.style.display = 'none';
                            // console.log('Payment failed:', response);
                            if (this.isFailureProcessing) {
                                return;
                            }
                            this.isFailureProcessing = true;
                            this.loadBookingFlag = true;
                            const reason = (response?.error?.reason || '').toString().toLowerCase();
                            const description = (response?.error?.description || '').toString().toLowerCase();
                            const source = (response?.error?.source || '').toString().toLowerCase();
                            const step = (response?.error?.step || '').toString().toLowerCase();
                            const isRetryableFailure =
                                description.includes('pin') ||
                                description.includes('otp') ||
                                description.includes('password') ||
                                description.includes('incorrect') ||
                                step.includes('otp') ||
                                step.includes('authentication');
                            const isBankDecline =
                                source.includes('bank') ||
                                description.includes('declined') ||
                                description.includes('bank');
                            if (isRetryableFailure) {
                                this.toastr.error('Payment failed. Please retry.', 'Payment Failed', {
                                    timeOut: 5000,
                                    closeButton: true,
                                    progressBar: true,
                                });
                                this.isFailureProcessing = false;
                                this.loadBookingFlag = false;
                                return;
                            }
                            if (isBankDecline) {
                                this.toastr.error(
                                    'Your bank declined the payment. Please try another payment method or contact your bank.',
                                    'Payment Failed',
                                    {
                                        timeOut: 5000,
                                        closeButton: true,
                                        progressBar: true,
                                    }
                                );
                                this.isFailureProcessing = false;
                                this.loadBookingFlag = false;
                                return;
                            }

                            const body = {
                                USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                                PAYMENT_FOR: 'O',
                                PAYMENT_MODE: 'O',
                                PAYMENT_TYPE: 'O',
                                TRANSACTION_DATE: this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
                                EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                                RAZ_ORDER_ID: responseeeeeee.RAZ_ORDER_ID,
                                TRANSACTION_STATUS: 'Failed',
                                TRANSACTION_ID: response.error.metadata.payment_id,
                                TRANSACTION_AMOUNT: this.paymentdata?.finalAmount,
                                PAYLOAD: options2,
                                RESPONSE_DATA: response,
                                RESPONSE_CODE: response.error.code,
                                MERCHENT_ID: this.RAZOR_PAY_KEY,
                                RESPONSE_MESSAGE: 'Transaction Failed',
                                CLIENT_ID: 1,
                                SHOW_TIME: this.toMySQLTime(this.selectedTime),
                                SHOW_DATE: this.formatToDDMMYYYY111(this.selectedDate),
                                VENUE_NAME: this.selectedVenue.name,
                                VENUE_CITY: this.selectedVenue.CITY_NAME,
                                EVENT_NAME: this.eventname,
                                MEMBERSHIP_PURCHASE: 0,
                                EVENT_SCHEDULE_ID: this.EVENT_SCHEDULE_ID,
                                EVENT_ID: this.eventID,
                                TEMP_UNIQUE_ID: TEMP_UNIQUE_ID
                            };
                            var obj = {
                                "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                "LOG_TYPE": "INFO",
                                "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                "LOG_TEXT": "Failed Response from Razorpay",
                                "USER_DATA": JSON.stringify(response)
                            }

                            this.apiService.actionLogsAdd(obj).subscribe({
                                next: (data: any) => {
                                }
                            });
                            this.apiService.addPaymentTransactions(body).subscribe({
                                next: (responseTx: any) => {
                                    var objTx = {
                                        "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                        "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                        "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                        "LOG_TYPE": "INFO",
                                        "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                        "LOG_TEXT": "Payment Entry Response",
                                        "USER_DATA": JSON.stringify(responseTx)
                                    }

                                    this.apiService.actionLogsAdd(objTx).subscribe({
                                        next: (data: any) => {
                                        }
                                    });
                                    this.removeCouponDATAwithoutcalulation();
                                    this.seatReleaseWithoutJson();
                                    this.toastr.error(
                                        'The transaction could not be completed. Please try again or use a different payment method.',
                                        'Payment Failed',
                                        {
                                            timeOut: 5000,
                                            closeButton: true,
                                            progressBar: true,
                                        }
                                    );
                                    this.clearSessionId();
                                    setTimeout(() => {
                                        this.router.navigate(['/home']).then(() =>
                                            window.location.reload()
                                        );
                                    }, 2000);
                                },
                                error: () => {
                                    this.removeCouponDATAwithoutcalulation();
                                    this.seatReleaseWithoutJson();
                                    this.toastr.error(
                                        'The transaction could not be completed. Please try again or use a different payment method.',
                                        'Payment Failed',
                                        {
                                            timeOut: 5000,
                                            closeButton: true,
                                            progressBar: true,
                                        }
                                    );
                                    this.clearSessionId();
                                    setTimeout(() => {
                                        this.router.navigate(['/home']).then(() =>
                                            window.location.reload()
                                        );
                                    }, 2000);
                                }
                            }).add(() => {
                                this.isFailureProcessing = false;
                                this.loadBookingFlag = false;
                            });
                            // this.apiService.addPaymentTransactions(body).subscribe({
                            //     next: (response: any) => {
                            //         var obj = {
                            //             "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                            //             "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                            //             "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                            //             "LOG_TYPE": "INFO",
                            //             "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                            //             "LOG_TEXT": "Payment Entry Response",
                            //             "USER_DATA": JSON.stringify(response)
                            //         }

                            //         this.apiService.actionLogsAdd(obj).subscribe({
                            //             next: (data: any) => {
                            //             }
                            //         });
                            //         this.loadBookingFlag = false;
                            //         this.toastr.error(
                            //             // 'If money was debited, it will be refunded in 5–7 days.',
                            //             'The transaction could not be completed. Please try again or use a different payment method.',
                            //             'Payment Failed',
                            //             {
                            //                 timeOut: 5000, // auto-hide in 5s
                            //                 closeButton: true,
                            //                 progressBar: true,
                            //             }
                            //         );

                            //         if (response?.code == '200') {
                            //             // setTimeout(() => {
                            //             //     this.router.navigate(['/home']).then(() =>
                            //             //         window.location.reload()
                            //             //     );
                            //             // }, 2000);
                            //             // this.updateSeatLayoutWithBookingStatus();
                            //             this.isFailureProcessing = false;
                            //         }
                            //     }
                            // });

                        });

                        // Open Razorpay modal
                        razorpay.open();
                    } else {
                        const body = {
                            USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                            PAYMENT_FOR: 'O',
                            PAYMENT_MODE: '',
                            PAYMENT_TYPE: '',
                            TRANSACTION_DATE: this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
                            TRANSACTION_ID: 0,
                            TRANSACTION_STATUS: 'Success',
                            TRANSACTION_AMOUNT: this.paymentdata?.finalAmount,
                            PAYLOAD: '',
                            RESPONSE_DATA: '',
                            RESPONSE_CODE: '',
                            MERCHENT_ID: '',
                            RESPONSE_MESSAGE: '',
                            CLIENT_ID: 1,
                            SHOW_TIME: this.toMySQLTime(this.selectedTime),
                            SHOW_DATE: this.formatToDDMMYYYY111(this.selectedDate),
                            VENUE_NAME: this.selectedVenue.name,
                            VENUE_CITY: this.selectedVenue.CITY_NAME,
                            EVENT_NAME: this.eventname,
                            RAZ_ORDER_ID: responseeeeeee.RAZ_ORDER_ID,
                            SESSION_ID: this.SESSION_ID,
                            EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                            MEMBERSHIP_PURCHASE: 0,
                            EVENT_SCHEDULE_ID: this.EVENT_SCHEDULE_ID,
                            EVENT_ID: this.eventID,
                            TEMP_UNIQUE_ID: TEMP_UNIQUE_ID,
                            BOOKING_DETAILS: bookingPayload,
                            SEATIDS: this.selectedSeatsIDs.toString(),
                            HOSTING_TYPE: this.Hoisting_Type
                        };

                        // var obj = {
                        //     "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                        //     "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                        //     "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                        //     "LOG_TYPE": "INFO",
                        //     "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                        //     "LOG_TEXT": "Payment Entry",
                        //     "USER_DATA": JSON.stringify(body)
                        // }

                        // this.apiService.actionLogsAdd(obj).subscribe({
                        //     next: (data: any) => {
                        //     }
                        // });
                        setTimeout(() => {
                            this.apiService.addPaymentTransactions(body).subscribe({
                                next: (response7: any) => {
                                    var obj = {
                                        "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                        "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                        "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                        "LOG_TYPE": "INFO",
                                        "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                        "LOG_TEXT": "Payment Entry Response",
                                        "USER_DATA": JSON.stringify({
                                            'request': body,
                                            'response': response7
                                        })
                                    }

                                    this.apiService.actionLogsAdd(obj).subscribe({
                                        next: (data: any) => {
                                        }
                                    });
                                    if (response7?.code == '200' || response7?.code == '201') {


                                        const HOSTING_TYPE = this.Hoisting_Type;

                                        const TRANSACTION_ID = 0;


                                        const payload = {

                                            razOrderID: responseeeeeee.RAZ_ORDER_ID,

                                            ADDITIONAL_EMAIL_ID: this.addional.EMAIL,
                                            ADDITIONAL_USER_NAME: this.addional.NAME,
                                            ADDITIONAL_MOBILE_NO: this.addional.MOBILE,

                                            EXTRA_INFORMATION_DATA: this.EXTRA_INFORMATION_DATA ? JSON.stringify(this.EXTRA_INFORMATION_DATA) : '',
                                            TEMP_HOLD_ID: this.TEMP_HOLD_ID,
                                            SESSION_ID: this.SESSION_ID,
                                            EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                                            TEMP_UNIQUE_ID: TEMP_UNIQUE_ID,
                                            HOSTING_TYPE,
                                            RESERVE_TICKET_NOS: this.paymentdata?.reservedTickets,
                                            TRANSACTION_ID,
                                            RAZ_SIGNATURE: '',
                                            DISCOUNT_TYPE: this.selectedmembership?.DISCOUNT_TYPE || null,
                                            BOOKING_FEE: this.paymentdata?.bookingFeeRate,
                                            BOOKING_FEE_TYPE: this.paymentdata?.bookingFeeType,
                                            TERMS_CONDITIONS: this.TERMS_CONDITIONS,
                                        };


                                        this.apiService.sendBookingData(payload).subscribe({
                                            next: (response5: any) => {
                                                this.clearSessionId();
                                                var obj = {
                                                    "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                                    "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                    "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                    "LOG_TYPE": "INFO",
                                                    "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                                    "LOG_TEXT": "Booking Data send",
                                                    "USER_DATA": JSON.stringify({
                                                        'request': payload,
                                                        'response': response5
                                                    })
                                                }

                                                this.apiService.actionLogsAdd(obj).subscribe({
                                                    next: (data: any) => {
                                                    }
                                                });
                                                if (response5?.code == '200' || response5?.code == '409') {
                                                    this.clearSessionId();
                                                    this.toastr.success('Booking successfull', 'Success');
                                                    this.clearSessionId();
                                                    this.BOOKING_CODE = response5.BOOKING_CODE;
                                                    let qrText = "{'Booking_Code':'" + this.BOOKING_CODE + "'}";
                                                    this.generateQRWithLogo(
                                                        qrText,
                                                        'assets/logo.png'
                                                    ).then(finalQr => {
                                                        this.qrCodeDataURL = finalQr;


                                                        this.loadBookingFlag = false;
                                                        this.ticketData = {
                                                            qrCodeDataURL: this.qrCodeDataURL,
                                                            TERMS_CONDITIONS: this.TERMS_CONDITIONS,
                                                            PLAN_ID: response5.data.PLAN_ID || null,
                                                            PLAN_NAME: response5.data.PLAN_ID != undefined && response5.data.PLAN_ID != '' ? response5.data.PLAN_NAME : '',
                                                            EVENT_AGE_GROUP: response5.data.AGE_GROUP,
                                                            CITY_NAME: response5.data.VENUE_CITY_NAME,
                                                            mobileno: this.memberId ? this.addional?.MOBILE ? this.addional.MOBILE : localStorage.getItem('MOBILE_NO') : this.user.MOBILE,
                                                            mobileno1: this.memberId ? localStorage.getItem('MOBILE_NO') : this.user.MOBILE,
                                                            email: this.memberId ? this.addional?.EMAIL ? this.addional.EMAIL : localStorage.getItem('EMAIL_ID') : this.user.EMAIL,
                                                            ADDITIONAL_EMAIL_ID: this.addional.EMAIL,
                                                            ADDITIONAL_USER_NAME: this.addional.NAME,
                                                            ADDITIONAL_MOBILE_NO: this.addional.MOBILE,
                                                            eventTitle: response5.data.EVENT_NAME,
                                                            eventImage: response5.data.EVENT_IMAGE,
                                                            eventDate: this.formatToDDMMYYYY(response5.data.SHOW_DATE),
                                                            eventTime: response5.data.SHOW_TIME,
                                                            eventVenue: response5.data.VENUE_NAME,
                                                            customerName: response5.data.USER_NAME,
                                                            ticketCount: response5.data.NUMBERS_OF_SEATS,
                                                            seatInfo: JSON.parse(response5.data.BOOKING_DATA),
                                                            hostingType: response5.data.HOSTING_TYPE,
                                                            bookingId: this.BOOKING_CODE,
                                                            payMode: response5.data.PAYMENT_METHOD || 'O',
                                                            taxFee: response5.data.totalTaxPrice,
                                                            bookingFee: response5.data.TOTAL_BOOKING_FEE,
                                                            discount: response5.data.DISCOUNT_AMOUNT || response5.data.DISCOUNT_VALUE || 0,
                                                            reference: 0,
                                                            finalAmount: Number(response5.data.finalAmount) || 0,
                                                            totalPrice: Number(response5.data.totalPrice) || 0,
                                                            // convenienceFee: this.paymentdata?.totalBookingFee + this.paymentdata?.totalTaxPrice,
                                                            convenienceFee: Number(response5.data.TOTAL_BOOKING_FEE) + Number(response5.data.totalTaxPrice),
                                                            // coupandiscount: Number(this.paymentdata?.discount) || 0,
                                                            coupandiscount: Number(response5.data.COUPON_DETAILS.COUPON_DISCOUNT) || 0,
                                                            memberdiscount: Number(this.paymentdata?.membertotalDiscount) || 0,
                                                            IS_COUPON_USED: response5.data.IS_COUPON_USED,
                                                            IS_PLAN_USED: response5.data.IS_PLAN_USED,
                                                            MAIN_EVENT_NAME: response5.data.MAIN_EVENT_NAME || '',

                                                        }
                                                        this.activeStep = 5;
                                                        setTimeout(() => {
                                                            this.changeDetectorRef.detectChanges();
                                                        }, 500);

                                                    })
                                                        .catch((err: any) => {
                                                            this.clearSessionId();
                                                            this.qrCodeDataURL = '';
                                                            this.loadBookingFlag = false;
                                                            this.activeStep = 5;
                                                        });




                                                } else if (response5?.code == '400') {
                                                    this.toastr.error(
                                                        'If money was debited, it will be refunded in 5–7 days.',
                                                        'Failed To Book Ticket',
                                                        {
                                                            timeOut: 5000, // auto-hide in 5s
                                                            closeButton: true,
                                                            progressBar: true,
                                                        }
                                                    );
                                                    this.clearSessionId();
                                                    setTimeout(() => {
                                                        this.router.navigate(['/home']).then(() =>
                                                            window.location.reload()
                                                        );
                                                    }, 2000);
                                                } else {
                                                    this.loadBookingFlag = false;
                                                    this.toastr.error('Booking failed', 'Error');
                                                }
                                            },
                                            error: (err) => {
                                                this.loadBookingFlag = false;
                                                this.toastr.error('Error sending booking data.', 'Error');
                                                var obj = {
                                                    "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                                    "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                    "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                    "LOG_TYPE": "INFO",
                                                    "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                                    "LOG_TEXT": "Booking Data",
                                                    "USER_DATA": JSON.stringify({
                                                        'request': payload,
                                                        'response': err
                                                    })
                                                }


                                                this.apiService.actionLogsAdd(obj).subscribe({
                                                    next: (data: any) => {
                                                    }
                                                });
                                            },
                                        });




                                    } else if (response7?.code == '400') {
                                        this.toastr.error(
                                            'If money was debited, it will be refunded in 5–7 days.',
                                            'Failed To Book Ticket',
                                            {
                                                timeOut: 5000, // auto-hide in 5s
                                                closeButton: true,
                                                progressBar: true,
                                            }
                                        );
                                        this.clearSessionId();
                                        setTimeout(() => {
                                            this.router.navigate(['/home']).then(() =>
                                                window.location.reload()
                                            );
                                        }, 2000);
                                    } else {
                                        this.toastr.error('Something failed', 'Error');
                                        this.loadBookingFlag = false;
                                    }
                                },
                                error: (err) => {
                                    var obj = {
                                        "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                        "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                        "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                        "LOG_TYPE": "INFO",
                                        "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                        "LOG_TEXT": "Payment Entry Response",
                                        "USER_DATA": JSON.stringify({
                                            'request': body,
                                            'response': err
                                        })
                                    }

                                    this.apiService.actionLogsAdd(obj).subscribe({
                                        next: (data: any) => {
                                        }
                                    });
                                    this.toastr.error('Error sending booking data.', 'Error');
                                    this.loadBookingFlag = false;
                                }
                            });
                        }, 5000);
                    }

                } else if (responseeeeeee?.code == 405) {
                    this.iscancelled = true;
                    const modal = new bootstrap.Modal(document.getElementById('selectSeatCountModalformodelll')!);
                    modal.show();
                    this.loadBookingFlag = false;
                } else if (responseeeeeee?.code == 400) {
                    this.toastr.error('Something went wrong while booking.', 'Error');
                    sessionStorage.setItem('wrongdata', 'y');
                    this.clearSessionId();
                    this.loadBookingFlag = false;
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    this.loadBookingFlag = false;
                    this.toastr.error('Booking failed', 'Error');
                }
            },
            error: () => {
                this.toastr.error('Error while booking', 'Error');
                this.loadBookingFlag = false;
            },
        });
        // }
    }
    startCountdown() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.intervalId = setInterval(() => {
            this.countdown1--;

            if (this.countdown1 == 0) {
                clearInterval(this.intervalId);
                this.router.navigate(['/home'], { replaceUrl: true }); // replace with your actual home route
            }

        }, 1000);
    }

    ngOnDestroy(): void {
        if (this.is_event_heavy || this.IS_QUEUE_ENABLED == true) {
            this.removefromQueue();
        }
        if (this.activeStep > 3 && this.activeStep != 5) {
            this.releasetticket();
            this.removeCouponDATAwithoutcalulation();
            // this.removemembership();
        }
        if (this.selectedmembership.ID != null && this.bookingMeta?.ID)
            this.apiService
                .removeSelectedPlan(
                    this.bookingMeta?.ID, this.userID, this.selectedmembership.ID, localStorage.getItem('deviceId'), this.SESSION_ID
                )
                .subscribe((data) => {
                })

        clearInterval(this.intervalId);

        const modal1 = document.getElementById('selectSeatCountModal');
        const modal2 = document.getElementById('selectSeatCountModalformodelll');
        const modal3 = document.getElementById('offerModallllll');
        const modal4 = document.getElementById('forverifyotp');

        if (modal1) {
            const bootstrapModal1 = bootstrap.Modal.getInstance(modal1) || new bootstrap.Modal(modal1);
            bootstrapModal1.hide();
        }

        if (modal2) {
            const bootstrapModal2 = bootstrap.Modal.getInstance(modal2) || new bootstrap.Modal(modal2);
            bootstrapModal2.hide();
        }
        if (modal3) {
            const bootstrapModal3 = bootstrap.Modal.getInstance(modal3) || new bootstrap.Modal(modal3);
            bootstrapModal3.hide();
        }
        if (modal4) {
            const bootstrapModal4 = bootstrap.Modal.getInstance(modal4) || new bootstrap.Modal(modal4);
            bootstrapModal4.hide();
        }

        this.subs.forEach((s: any) => s.unsubscribe());

        this.closeTugoz();
        clearInterval(this.interval2);
        this.stopTimer();
        // Keep the same session id on browser refresh; clear only on SPA route-leave.
        if (!this.isPageUnloading) {
            this.clearSessionId();
        }
        // clearInterval(this.timer);
    }

    updateSeatLayoutWithBookingStatus(): void {
        for (const selected of this.selectedSeats1) {
            for (const section of this.SCREEN_MASTER.LAYOUT_JSON) {
                for (const row of section.R) {
                    for (const seat of row.ST) {
                        // Match the seat by number, row name, and section name
                        if (seat.N == selected.N && selected.RN == row.RN && selected.SN == section.SN) {
                            // Only update IB to true; don't reset if already true
                            seat.IB = 'B';
                        }
                    }
                }
            }
        }
    }

    proceedToPay1() {
        if (this.applycode.length > 0 && !this.coupanapplies) {
            this.toastr.error('Please apply coupon first', 'Error');
            return
        }
        if (this.checkforadd && !this.addinaldataaded) {
            this.toastr.error('Please add additional details first', 'Error');
            return;
        }

        this.clearTimer()
        this.loadBookingFlag = true;
        this.iscancelled = false;
        const seatGroups = new Map<string, any>();
        const TEMP_UNIQUE_ID = localStorage.getItem('deviceId');
        this.selectedSeats1.forEach(seat => {
            const key = `${seat.SN}_${seat.SP}`;

            const seatEntry = { seat: `${seat.RN}-${seat.N}`, price: Number(seat.SP), booking_fee: Number(this.paymentdata.bookingFeeRate || 0), is_reserved: seat.PR };
            if (!seatGroups.has(key)) {
                seatGroups.set(key, {
                    event: seat.SN,
                    price: Number(seat.SP),
                    booked: 1,
                    seats: [seatEntry],
                });
            } else {
                const group = seatGroups.get(key);
                group.booked += 1;
                group.seats.push(seatEntry);
            }
        });

        this.orderSummary.items = Array.from(seatGroups.values());

        const bookingPayload = this.orderSummary.items.map(
            (item: any) => {
                const totalAmount = item.seats.reduce((sum: number, seat: any) => sum + seat.price, 0);

                return {
                    TICKET_BOOKING_EVENT_ID: this.bookingMeta?.ID,
                    USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                    USER_TYPE: 'C',
                    SEAT_NUMBERS: item.seats,// Array of {seat, price}
                    AMOUNT: totalAmount,
                    BASE_AMOUNT: totalAmount,
                    SECTION_NAME: item.event,
                    EVENT_ID: this.eventID,
                    // NO_OF_TICKETS: item.booked,
                    NO_OF_TICKETS: item.booked,
                    BOOKING_FEE: item.BOOKING_FEE,
                    BOOKING_FEE_TYPE: item.BOOKING_FEE_TYPE
                };
            }
        );

        // console.log(bookingPayload, 'bookingPayload');
        const bookingPayload2 = this.selectedSeats1.map((seat: any) => ({
            TICKET_BOOKING_EVENT_ID: this.bookingMeta?.ID,
            USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
            USER_TYPE: 'C',
            SEAT_NUMBERS: [`${seat.RN}-${seat.N}`],
            SEAT_IDS: seat.id.toString(),
            AMOUNT: Number(seat.SP),
            SECTION_NAME: seat.SN,
            BOOKING_FEE: seat.BF,
            BOOKING_FEE_TYPE: seat.BT,
            EVENT_ID: this.eventID,
            NO_OF_TICKETS: 1,
            SHOW_TIME: this.toMySQLTime(this.selectedTime),
            SHOW_DATE: this.formatToDDMMYYYY111(this.selectedDate),
            VENUE_NAME: this.selectedVenue.name,
            VENUE_CITY: this.selectedVenue.CITY_NAME,
            EVENT_NAME: this.eventname,
            RAZ_ORDER_ID: '',
            SESSION_ID: this.SESSION_ID,
            EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
        }));

        const totalSeats = bookingPayload.reduce((sum: any, item: any) => sum + item.NO_OF_TICKETS, 0);
        const HOSTING_TYPE = this.Hoisting_Type;
        const VENUE_NAME = this.selectedVenue.name
        const VENUE_ID = this.selectedVenue.id
        const VENUE_SHORT_CODE = this.selectedVenue.venueShortCode
        const EVENT_NAME = this.eventname
        const EVENT_ID = this.eventID
        const EVENT_SHORT_CODE = this.eventShortCode
        const EVENT_SCHEDULE_ID = this.EVENT_SCHEDULE_ID
        const TRANSACTION_ID = ''
        const SHOW_TIME = this.toMySQLTime(this.selectedTime);
        const SHOW_DATE = this.formatToDDMMYYYY(this.selectedDate)
        const bodyyyyy = {
            // NO_OF_SEATS: this.selectedSeatCount,
            // SEAT_NUMBERS: this.selectedSeatsIndex.join(','),
            // SEAT_IDS: this.selectedSeatsIDs.toString(),
            IS_PLAN_USED: !!this.selectedmembership?.ID,
            HOSTING_TYPE,
            BENEFIT_APPLY: this.BENEFIT_APPLY,
            TEMP_HOLD_ID: this.TEMP_HOLD_ID,
            "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
            BOOKING_DETAILS: '',
            SEATIDS: this.selectedSeatsIDs.toString(),
            EXTRA_INFORMATION_DATA: this.EXTRA_INFORMATION_DATA ? JSON.stringify(this.EXTRA_INFORMATION_DATA) : '',

            ADDITIONAL_EMAIL_ID: this.addional.EMAIL,
            ADDITIONAL_USER_NAME: this.addional.NAME,
            ADDITIONAL_MOBILE_NO: this.addional.MOBILE,

            EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
            SESSION_ID: this.SESSION_ID,
            TEMP_UNIQUE_ID: TEMP_UNIQUE_ID,
            EVENT_IMAGE: this.eventImage,
            AGE_GROUP: this.EVENT_AGE_GROUP,
            RAZ_SIGNATURE: '',
            EVENT_SHORT_CODE,
            seatIds: this.selectedSeatsIndex,
            VENUE_SHORT_CODE,
            TRANSACTION_ID,
            EVENT_DETAILS_ID: EVENT_SCHEDULE_ID,
            TERMS_CONDITIONS: this.TERMS_CONDITIONS,
        }


        this.apiService.addCartDetailsdd(bodyyyyy).subscribe({
            next: (responseeeeeee: any) => {
                var obj = {
                    "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                    "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                    "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                    "LOG_TYPE": "INFO",
                    "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                    "LOG_TEXT": "User cart creation response",
                    "USER_DATA": JSON.stringify({
                        'request': bodyyyyy,
                        'response': responseeeeeee
                    })
                }

                this.apiService.actionLogsAdd(obj).subscribe({
                    next: (data: any) => {
                    }
                });
                if (responseeeeeee?.code == '200') {

                    var BOOKING_CART_ID = responseeeeeee.BOOKING_CART_ID;
                    this.paymentdata.finalAmount = responseeeeeee.finalAmount;
                    if (responseeeeeee.totalAmount > 0) {

                        const options = {
                            key: this.RAZOR_PAY_KEY,
                            amount: responseeeeeee.totalAmount * 100,
                            currency: 'INR',
                            name: 'Ticket Khidakee',
                            description: 'Order Payment',
                            order_id: responseeeeeee.RAZ_ORDER_ID,
                            timeout: 600,
                            notes: {
                                Time: this.toMySQLTime(this.selectedTime),
                                Date: this.formatToDDMMYYYY111(this.selectedDate),
                                Venue: this.selectedVenue.name,
                                City: this.selectedVenue.CITY_NAME,
                                ShowName: this.eventname,
                                CouponCode: this.paymentdata?.coupon_details ? this.paymentdata?.coupon_details['CODE'] : null,
                                CouponDiscount: this.paymentdata?.coupon_details ? this.paymentdata?.coupon_details['COUPON_DISCOUNT'] : 0,
                                MembershipName: this.selectedmembership?.NAME || null,
                                DiscountType: this.selectedmembership?.DISCOUNT_TYPE || null,
                                MebershipDiscount: this.selectedmembership?.DISCOUNT_VALUE || 0,

                            },
                            handler: async (data: any) => {

                                const body = {
                                    PAYMENT_FOR: 'O',
                                    PAYMENT_MODE: 'O',
                                    PAYMENT_TYPE: 'O',
                                    TRANSACTION_DATE: this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
                                    TRANSACTION_ID: data.razorpay_payment_id,
                                    TRANSACTION_STATUS: 'Success',
                                    TRANSACTION_AMOUNT: this.paymentdata?.finalAmount,
                                    PAYLOAD: options,
                                    RESPONSE_DATA: data,
                                    RESPONSE_CODE: 200,
                                    MERCHENT_ID: this.RAZOR_PAY_KEY,
                                    RESPONSE_MESSAGE: 'Transaction success',
                                    CLIENT_ID: 1,
                                    MEMBERSHIP_PURCHASE: 0,
                                    EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                                    RAZ_ORDER_ID: responseeeeeee.RAZ_ORDER_ID,
                                    USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                                    SHOW_TIME: this.toMySQLTime(this.selectedTime),
                                    SHOW_DATE: this.formatToDDMMYYYY111(this.selectedDate),
                                    VENUE_NAME: this.selectedVenue.name,
                                    VENUE_CITY: this.selectedVenue.CITY_NAME,
                                    EVENT_NAME: this.eventname,
                                    SESSION_ID: this.SESSION_ID,
                                    EVENT_SCHEDULE_ID: this.EVENT_SCHEDULE_ID,
                                    EVENT_ID: this.eventID,
                                    TEMP_UNIQUE_ID: TEMP_UNIQUE_ID,
                                    BOOKING_DETAILS: '',
                                    SEATIDS: this.selectedSeatsIDs.toString(),
                                    HOSTING_TYPE: this.Hoisting_Type
                                };
                                this.orderSummary = {
                                    items: []
                                };

                                const bookingPayload3 = this.selectedSeats1.map((seat: any) => ({
                                    TICKET_BOOKING_EVENT_ID: this.bookingMeta?.ID,
                                    USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                                    USER_TYPE: 'C',
                                    SEAT_NUMBERS: [`${seat.RN}-${seat.N}`],
                                    SEAT_IDS: seat.id.toString(),
                                    AMOUNT: Number(seat.SP),
                                    SECTION_NAME: seat.SN,
                                    BOOKING_FEE: seat.BF,
                                    BOOKING_FEE_TYPE: seat.BT,
                                    EVENT_ID: this.eventID,
                                    NO_OF_TICKETS: 1,
                                    SHOW_TIME: this.toMySQLTime(this.selectedTime),
                                    SHOW_DATE: this.formatToDDMMYYYY111(this.selectedDate),
                                    VENUE_NAME: this.selectedVenue.name,
                                    VENUE_CITY: this.selectedVenue.CITY_NAME,
                                    EVENT_NAME: this.eventname,
                                    RAZ_ORDER_ID: responseeeeeee.RAZ_ORDER_ID,
                                    SESSION_ID: this.SESSION_ID,
                                    TEMP_UNIQUE_ID: TEMP_UNIQUE_ID,
                                    EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,

                                }));


                                setTimeout(() => {
                                    this.apiService.addPaymentTransactions(body).subscribe({
                                        next: (response9: any) => {
                                            var obj = {
                                                "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                                "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                "LOG_TYPE": "INFO",
                                                "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                                "LOG_TEXT": "Payment Entry Response",
                                                "USER_DATA": JSON.stringify({
                                                    'request': body,
                                                    'response': response9
                                                })
                                            }

                                            this.apiService.actionLogsAdd(obj).subscribe({
                                                next: (data: any) => {
                                                }
                                            });
                                            if (response9?.code == '200' || response9?.code == '201') {
                                                this.updateSeatLayoutWithBookingStatus();

                                                const HOSTING_TYPE = this.Hoisting_Type;

                                                const TRANSACTION_ID = body.TRANSACTION_ID

                                                const payload = {

                                                    TEMP_HOLD_ID: this.TEMP_HOLD_ID,

                                                    ADDITIONAL_EMAIL_ID: this.addional.EMAIL,
                                                    ADDITIONAL_USER_NAME: this.addional.NAME,
                                                    ADDITIONAL_MOBILE_NO: this.addional.MOBILE,

                                                    razOrderID: data?.razorpay_order_id,

                                                    EXTRA_INFORMATION_DATA: this.EXTRA_INFORMATION_DATA ? JSON.stringify(this.EXTRA_INFORMATION_DATA) : '',



                                                    SESSION_ID: this.SESSION_ID,
                                                    EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                                                    TEMP_UNIQUE_ID: TEMP_UNIQUE_ID,
                                                    HOSTING_TYPE,
                                                    RESERVE_TICKET_NOS: this.paymentdata?.reservedTickets,
                                                    TRANSACTION_ID,
                                                    RAZ_SIGNATURE: data?.razorpay_signature,
                                                    DISCOUNT_TYPE: this.selectedmembership?.DISCOUNT_TYPE || null,
                                                    BOOKING_FEE: this.paymentdata?.bookingFeeRate,
                                                    BOOKING_FEE_TYPE: this.paymentdata?.bookingFeeType,
                                                    TERMS_CONDITIONS: this.TERMS_CONDITIONS,
                                                };


                                                if (response9?.code == '201') {
                                                    this.toastr.success('Booking successful', 'Success');
                                                    this.BOOKING_CODE = response9.BOOKING_CODE
                                                    this.clearSessionId();

                                                    let qrText = "{'Booking_Code':'" + this.BOOKING_CODE + "'}";
                                                    this.generateQRWithLogo(
                                                        qrText,
                                                        'assets/logo.png'
                                                    ).then(finalQr => {
                                                        this.qrCodeDataURL = finalQr;
                                                        this.loadBookingFlag = false;
                                                        this.ticketData = {
                                                            qrCodeDataURL: this.qrCodeDataURL,
                                                            TERMS_CONDITIONS: this.TERMS_CONDITIONS,
                                                            PLAN_ID: response9.data.PLAN_ID || null,
                                                            PLAN_NAME: response9.data.PLAN_ID != undefined && response9.data.PLAN_ID != '' ? response9.data.PLAN_NAME : '',
                                                            mobileno: this.memberId ? this.addional?.MOBILE ? this.addional.MOBILE : localStorage.getItem('MOBILE_NO') : this.user.MOBILE,
                                                            mobileno1: this.memberId ? localStorage.getItem('MOBILE_NO') : this.user.MOBILE,
                                                            email: this.memberId ? this.addional?.EMAIL ? this.addional.EMAIL : localStorage.getItem('EMAIL_ID') : this.user.EMAIL,
                                                            ADDITIONAL_EMAIL_ID: this.addional.EMAIL,
                                                            ADDITIONAL_USER_NAME: this.addional.NAME,
                                                            ADDITIONAL_MOBILE_NO: this.addional.MOBILE,
                                                            EVENT_AGE_GROUP: response9.data.AGE_GROUP,
                                                            CITY_NAME: response9.data.CITY_NAME,
                                                            eventTitle: response9.data.EVENT_NAME,
                                                            eventImage: response9.data.EVENT_IMAGE,
                                                            eventDate: this.formatToDDMMYYYY(response9.data.SHOW_DATE),
                                                            eventTime: response9.data.SHOW_TIME,
                                                            eventVenue: response9.data.VENUE_NAME,
                                                            customerName: response9.data.USER_NAME,
                                                            ticketCount: response9.data.NUMBERS_OF_SEATS,
                                                            payMode: 'O',
                                                            reference: TRANSACTION_ID,
                                                            taxFee: response9.data.totalTaxPrice,
                                                            bookingFee: response9.data.TOTAL_BOOKING_FEE,
                                                            discount: response9.data.DISCOUNT_AMOUNT || 0,
                                                            // seatInfo: bodyyyyy.CART_DETAILS,
                                                            // seatInfo: bookingPayload,
                                                            seatInfo: JSON.parse(response9.data.BOOKING_DATA),
                                                            hostingType: response9.data.HOSTING_TYPE,
                                                            bookingId: this.BOOKING_CODE,
                                                            finalAmount: Number(response9.data.finalAmount) || 0,
                                                            totalPrice: Number(response9.data.totalPrice) || 0,
                                                            convenienceFee: Number(response9.data.TOTAL_BOOKING_FEE) + Number(response9.data.totalTaxPrice),
                                                            // convenienceFee: this.paymentdata?.totalBookingFee + this.paymentdata?.totalTaxPrice,
                                                            // coupandiscount: Number(this.paymentdata?.discount) || 0,
                                                            coupandiscount: Number(response9.data.COUPON_DETAILS.COUPON_DISCOUNT) || 0,
                                                            memberdiscount: Number(this.paymentdata?.membertotalDiscount) || 0,
                                                            IS_COUPON_USED: response9.data.IS_COUPON_USED,
                                                            IS_PLAN_USED: response9.data.IS_PLAN_USED,
                                                            MAIN_EVENT_NAME: response9.data.MAIN_EVENT_NAME || '',
                                                        }


                                                        this.activeStep = 5;
                                                    })
                                                        .catch((err: any) => {

                                                            this.qrCodeDataURL = '';
                                                            this.loadBookingFlag = false;
                                                            this.activeStep = 5;
                                                        });
                                                    setTimeout(() => {
                                                        this.changeDetectorRef.detectChanges();
                                                    }, 500)
                                                } else {


                                                    this.apiService.sendBookingData(payload).subscribe({
                                                        next: (response10: any) => {
                                                            this.clearSessionId();
                                                            var obj = {
                                                                "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                                                "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                                "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                                "LOG_TYPE": "INFO",
                                                                "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                                                "LOG_TEXT": "Booking Data send",
                                                                "USER_DATA": JSON.stringify({
                                                                    'request': payload,
                                                                    'response': response10
                                                                })
                                                            }

                                                            this.apiService.actionLogsAdd(obj).subscribe({
                                                                next: (data: any) => {
                                                                }
                                                            });
                                                            if (response10?.code == '200' || response10?.code == '409') {
                                                                this.toastr.success('Booking successful', 'Success');

                                                                this.BOOKING_CODE = response10.BOOKING_CODE


                                                                let qrText = "{'Booking_Code':'" + this.BOOKING_CODE + "'}";

                                                                this.generateQRWithLogo(
                                                                    qrText,
                                                                    'assets/logo.png'
                                                                ).then(finalQr => {
                                                                    this.qrCodeDataURL = finalQr;
                                                                    this.loadBookingFlag = false;
                                                                    this.ticketData = {
                                                                        qrCodeDataURL: this.qrCodeDataURL,
                                                                        PLAN_ID: response10.data.PLAN_ID || null,
                                                                        PLAN_NAME: response10.data.PLAN_ID != undefined && response10.data.PLAN_ID != '' ? response10.data.PLAN_NAME : '',
                                                                        EVENT_AGE_GROUP: response10.data.AGE_GROUP,
                                                                        CITY_NAME: response10.data.VENUE_CITY_NAME,
                                                                        mobileno: this.memberId ? this.addional?.MOBILE ? this.addional.MOBILE : localStorage.getItem('MOBILE_NO') : this.user.MOBILE,
                                                                        mobileno1: this.memberId ? localStorage.getItem('MOBILE_NO') : this.user.MOBILE,
                                                                        email: this.memberId ? this.addional?.EMAIL ? this.addional.EMAIL : localStorage.getItem('EMAIL_ID') : this.user.EMAIL,
                                                                        ADDITIONAL_EMAIL_ID: this.addional.EMAIL,
                                                                        ADDITIONAL_USER_NAME: this.addional.NAME,
                                                                        ADDITIONAL_MOBILE_NO: this.addional.MOBILE,
                                                                        eventTitle: response10.data.EVENT_NAME,
                                                                        eventImage: response10.data.EVENT_IMAGE,
                                                                        eventDate: this.formatToDDMMYYYY(response10.data.SHOW_DATE),
                                                                        eventTime: response10.data.SHOW_TIME,
                                                                        eventVenue: response10.data.VENUE_NAME,
                                                                        customerName: response10.data.USER_NAME,
                                                                        ticketCount: response10.data.NUMBERS_OF_SEATS,
                                                                        payMode: response10.data.PAYMENT_METHOD || 'O',
                                                                        taxFee: response10.data.totalTaxPrice,
                                                                        bookingFee: response10.data.TOTAL_BOOKING_FEE,
                                                                        discount: response10.data.DISCOUNT_AMOUNT || response10.data.DISCOUNT_VALUE || 0,
                                                                        finalAmount: Number(response10.data.finalAmount) || 0,
                                                                        totalPrice: Number(response10.data.totalPrice) || 0,
                                                                        reference: TRANSACTION_ID,
                                                                        // seatInfo: bodyyyyy.CART_DETAILS,
                                                                        seatInfo: JSON.parse(response10.data.BOOKING_DATA),
                                                                        hostingType: response10.data.HOSTING_TYPE,
                                                                        bookingId: this.BOOKING_CODE,
                                                                        convenienceFee: Number(response10.data.TOTAL_BOOKING_FEE) + Number(response10.data.totalTaxPrice),

                                                                        coupandiscount: Number(response10.data.COUPON_DETAILS.COUPON_DISCOUNT) || 0,
                                                                        memberdiscount: Number(this.paymentdata?.membertotalDiscount) || 0,
                                                                        TERMS_CONDITIONS: this.TERMS_CONDITIONS,
                                                                        IS_COUPON_USED: response10.data.IS_COUPON_USED,
                                                                        IS_PLAN_USED: response10.data.IS_PLAN_USED,
                                                                        MAIN_EVENT_NAME: response10.data.MAIN_EVENT_NAME || '',
                                                                    }


                                                                    this.activeStep = 5;
                                                                })
                                                                    .catch((err: any) => {

                                                                        this.qrCodeDataURL = '';
                                                                        this.loadBookingFlag = false;
                                                                        this.activeStep = 5;
                                                                    });



                                                                // this.startCountdown();
                                                            } else if (response10?.code == '400') {
                                                                this.toastr.error(
                                                                    'If money was debited, it will be refunded in 5–7 days.',
                                                                    'Failed To Book Ticket',
                                                                    {
                                                                        timeOut: 5000, // auto-hide in 5s
                                                                        closeButton: true,
                                                                        progressBar: true,
                                                                    }
                                                                );
                                                                setTimeout(() => {
                                                                    this.router.navigate(['/home']).then(() =>
                                                                        window.location.reload()
                                                                    );
                                                                }, 2000);
                                                            } else {
                                                                this.toastr.error('Booking failed', 'Error');
                                                            }
                                                        },
                                                        error: (err) => {
                                                            this.toastr.error('Error sending booking data.', 'Error');
                                                            var obj = {
                                                                "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                                                "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                                "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                                "LOG_TYPE": "INFO",
                                                                "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                                                "LOG_TEXT": "Booking Data",
                                                                "USER_DATA": JSON.stringify({
                                                                    'request': payload,
                                                                    'response': err
                                                                })
                                                            }


                                                            this.apiService.actionLogsAdd(obj).subscribe({
                                                                next: (data: any) => {
                                                                }
                                                            });
                                                        },
                                                    });


                                                }

                                            } else if (response9?.code == '400') {
                                                this.toastr.error(
                                                    'If money was debited, it will be refunded in 5–7 days.',
                                                    'Failed To Book Ticket',
                                                    {
                                                        timeOut: 5000, // auto-hide in 5s
                                                        closeButton: true,
                                                        progressBar: true,
                                                    }
                                                );
                                                setTimeout(() => {
                                                    this.router.navigate(['/home']).then(() =>
                                                        window.location.reload()
                                                    );
                                                }, 2000);
                                            } else {
                                                this.toastr.error('Something failed', 'Error');
                                            }
                                        },
                                        error: (err) => {
                                            var obj = {
                                                "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                                "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                "LOG_TYPE": "INFO",
                                                "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                                "LOG_TEXT": "Payment Entry Response",
                                                "USER_DATA": JSON.stringify({
                                                    'request': body,
                                                    'response': err
                                                })
                                            }

                                            this.apiService.actionLogsAdd(obj).subscribe({
                                                next: (data: any) => {
                                                }
                                            });
                                            this.toastr.error('Error sending booking data.', 'Error');
                                            this.loadBookingFlag = false;
                                        }
                                    });
                                }, 5000);

                            },
                            modal: {
                                ondismiss: (res: any) => {
                                    if (this.isFailureProcessing) {
                                        this.loadBookingFlag = false;
                                        return;
                                    }
                                    this.loadBookingFlag = true;

                                    const body = {
                                        USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                                        PAYMENT_FOR: 'O',
                                        PAYMENT_MODE: 'O',
                                        PAYMENT_TYPE: 'O',
                                        TRANSACTION_DATE: this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
                                        EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                                        RAZ_ORDER_ID: responseeeeeee.RAZ_ORDER_ID,
                                        TRANSACTION_STATUS: 'Cancel',
                                        TRANSACTION_ID: 0,
                                        TRANSACTION_AMOUNT: this.paymentdata?.finalAmount,
                                        PAYLOAD: options,
                                        RESPONSE_DATA: res == 'timeout' ? "Payment session timed out" : 'Transaction cancelled by user',
                                        RESPONSE_CODE: '',
                                        MERCHENT_ID: this.RAZOR_PAY_KEY,
                                        RESPONSE_MESSAGE: res == 'timeout' ? "Payment session timed out" : 'Transaction cancelled by user',
                                        CLIENT_ID: 1,
                                        TICKET_BOOKING_EVENT_ID: this.bookingMeta?.ID,
                                        MEMBERSHIP_PURCHASE: 0,
                                        EVENT_SCHEDULE_ID: this.EVENT_SCHEDULE_ID,
                                        EVENT_ID: this.eventID,
                                        TEMP_UNIQUE_ID: TEMP_UNIQUE_ID,
                                        SESSION_ID: this.SESSION_ID,
                                        BOOKING_DETAILS: '',
                                        SEATIDS: this.selectedSeatsIDs.toString(),
                                        HOSTING_TYPE: this.Hoisting_Type

                                    };

                                    setTimeout(() => {
                                        this.apiService.addPaymentTransactions(body).subscribe({
                                            next: (response: any) => {
                                                var obj = {
                                                    "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                                    "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                    "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                    "LOG_TYPE": "INFO",
                                                    "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                                    "LOG_TEXT": "Payment Entry Response",
                                                    "USER_DATA": JSON.stringify({
                                                        'request': body,
                                                        'response': response
                                                    })
                                                }

                                                this.apiService.actionLogsAdd(obj).subscribe({
                                                    next: (data: any) => {
                                                    }
                                                });

                                                if (response?.code == '200' || response?.code == '201') {
                                                    this.removeCouponDATAwithoutcalulation();

                                                    this.seatReleaseWithoutJson();

                                                    if (res == 'timeout')
                                                        this.toastr.error('Payment session timed out', 'Timeout', {
                                                            timeOut: 5000, // auto-hide in 5s
                                                            closeButton: true,
                                                            progressBar: true,
                                                        });
                                                    else
                                                        this.toastr.error('Payment was not completed or cancelled by user.', 'Payment Cancelled', {
                                                            timeOut: 5000, // auto-hide in 5s
                                                            closeButton: true,
                                                            progressBar: true,
                                                        });
                                                    this.clearSessionId();
                                                    setTimeout(() => {
                                                        this.router.navigate(['/home']).then(() =>
                                                            window.location.reload()
                                                        );
                                                    }, 2000);

                                                }
                                            }, error: (err) => {
                                                var obj = {
                                                    "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                                    "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                    "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                    "LOG_TYPE": "INFO",
                                                    "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                                    "LOG_TEXT": "Payment Entry Response",
                                                    "USER_DATA": JSON.stringify({
                                                        'request': body,
                                                        'response': err
                                                    })
                                                }

                                                this.apiService.actionLogsAdd(obj).subscribe({
                                                    next: (data: any) => {
                                                    }
                                                });
                                                this.toastr.error('Error sending booking data.', 'Error');
                                                this.loadBookingFlag = false;
                                            }
                                        });
                                    }, 5000);
                                }
                            },
                            prefill: {
                                contact: this.memberId ? localStorage.getItem('MOBILE_NO') : this.user.MOBILE,
                                email: this.memberId ? localStorage.getItem('EMAIL_ID') : this.user.EMAIL,
                                name: this.memberId ? localStorage.getItem('NAME') : this.user.NAME,

                            },
                            theme: {
                                color: '#3399cc',
                            },
                        };

                        const razorpay2 = new Razorpay(options);

                        // Add payment failed handler
                        razorpay2.on('payment.failed', (response: any) => {


                            if (this.isFailureProcessing) {
                                return;
                            }
                            this.isFailureProcessing = true;
                            this.loadBookingFlag = true;
                            const reason = (response?.error?.reason || '').toString().toLowerCase();
                            const description = (response?.error?.description || '').toString().toLowerCase();
                            const source = (response?.error?.source || '').toString().toLowerCase();
                            const step = (response?.error?.step || '').toString().toLowerCase();
                            const isRetryableFailure =
                                description.includes('pin') ||
                                description.includes('otp') ||
                                description.includes('password') ||
                                description.includes('incorrect') ||
                                step.includes('otp') ||
                                step.includes('authentication');
                            const isBankDecline =
                                source.includes('bank') ||
                                description.includes('declined') ||
                                description.includes('bank');
                            if (isRetryableFailure) {
                                this.toastr.error('Payment failed. Please retry.', 'Payment Failed', {
                                    timeOut: 5000,
                                    closeButton: true,
                                    progressBar: true,
                                });
                                this.isFailureProcessing = false;
                                this.loadBookingFlag = false;
                                return;
                            }
                            if (isBankDecline) {
                                this.toastr.error(
                                    'Your bank declined the payment. Please try another payment method or contact your bank.',
                                    'Payment Failed',
                                    {
                                        timeOut: 5000,
                                        closeButton: true,
                                        progressBar: true,
                                    }
                                );
                                this.isFailureProcessing = false;
                                this.loadBookingFlag = false;
                                return;
                            }
                            const body = {
                                USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                                PAYMENT_FOR: 'O',
                                PAYMENT_MODE: 'O',
                                PAYMENT_TYPE: 'O',
                                TRANSACTION_DATE: this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
                                EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                                RAZ_ORDER_ID: responseeeeeee.RAZ_ORDER_ID,
                                TRANSACTION_STATUS: 'Failed',
                                TRANSACTION_ID: response.error.metadata.payment_id,
                                TRANSACTION_AMOUNT: this.paymentdata?.finalAmount,
                                PAYLOAD: options,
                                RESPONSE_DATA: response,
                                RESPONSE_CODE: response.error.code,
                                MERCHENT_ID: this.RAZOR_PAY_KEY,
                                RESPONSE_MESSAGE: 'Transaction Failed',
                                CLIENT_ID: 1,
                                MEMBERSHIP_PURCHASE: 0,
                                EVENT_SCHEDULE_ID: this.EVENT_SCHEDULE_ID,
                                EVENT_ID: this.eventID,
                                TEMP_UNIQUE_ID: TEMP_UNIQUE_ID
                            };
                            var obj = {
                                "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                "LOG_TYPE": "INFO",
                                "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                "LOG_TEXT": "Payment Failed",
                                "USER_DATA": JSON.stringify(body)
                            }

                            this.apiService.actionLogsAdd(obj).subscribe({
                                next: (data: any) => {
                                }
                            });
                            this.apiService.addPaymentTransactions(body).subscribe({
                                next: (responseTx: any) => {
                                    var objTx = {
                                        "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
                                        "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                        "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                        "LOG_TYPE": "INFO",
                                        "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                        "LOG_TEXT": "Payment Entry Response",
                                        "USER_DATA": JSON.stringify(responseTx)
                                    }

                                    this.apiService.actionLogsAdd(objTx).subscribe({
                                        next: (data: any) => {
                                        }
                                    });
                                    this.removeCouponDATAwithoutcalulation();
                                    this.seatReleaseWithoutJson();
                                    this.toastr.error(
                                        'The transaction could not be completed. Please try again or use a different payment method.',
                                        'Payment Failed',
                                        {
                                            timeOut: 5000,
                                            closeButton: true,
                                            progressBar: true,
                                        }
                                    );
                                    this.clearSessionId();
                                    setTimeout(() => {
                                        this.router.navigate(['/home']).then(() =>
                                            window.location.reload()
                                        );
                                    }, 2000);
                                },
                                error: () => {
                                    this.removeCouponDATAwithoutcalulation();
                                    this.seatReleaseWithoutJson();
                                    this.toastr.error(
                                        'The transaction could not be completed. Please try again or use a different payment method.',
                                        'Payment Failed',
                                        {
                                            timeOut: 5000,
                                            closeButton: true,
                                            progressBar: true,
                                        }
                                    );
                                    this.clearSessionId();
                                    setTimeout(() => {
                                        this.router.navigate(['/home']).then(() =>
                                            window.location.reload()
                                        );
                                    }, 2000);
                                }
                            }).add(() => {
                                this.isFailureProcessing = false;
                                this.loadBookingFlag = false;
                            });

                        });

                        // Open Razorpay modal
                        razorpay2.open();
                    } else {
                        const body = {
                            USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                            PAYMENT_FOR: 'O',
                            PAYMENT_MODE: '',
                            PAYMENT_TYPE: '',
                            TRANSACTION_DATE: this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
                            TRANSACTION_ID: 0,
                            TRANSACTION_STATUS: 'Success',
                            TRANSACTION_AMOUNT: this.paymentdata?.finalAmount,
                            PAYLOAD: '',
                            RESPONSE_DATA: '',
                            RESPONSE_CODE: '',
                            MERCHENT_ID: '',
                            RESPONSE_MESSAGE: '',
                            CLIENT_ID: 1,
                            MEMBERSHIP_PURCHASE: 0,
                            EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                            RAZ_ORDER_ID: responseeeeeee.RAZ_ORDER_ID,
                            EVENT_SCHEDULE_ID: this.EVENT_SCHEDULE_ID,
                            EVENT_ID: this.eventID,
                            SESSION_ID: this.SESSION_ID,
                            TEMP_UNIQUE_ID: TEMP_UNIQUE_ID,
                            BOOKING_DETAILS: '',
                            SEATIDS: this.selectedSeatsIDs.toString(),
                            HOSTING_TYPE: this.Hoisting_Type
                        };
                        this.orderSummary = {
                            items: []
                        };

                        const bookingPayload = this.selectedSeats1.map((seat: any) => ({
                            TICKET_BOOKING_EVENT_ID: this.bookingMeta?.ID,
                            USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                            USER_TYPE: 'C',
                            SEAT_NUMBERS: [`${seat.RN}-${seat.N}`],
                            AMOUNT: Number(seat.SP),
                            SECTION_NAME: seat.SN,
                            BOOKING_FEE: seat.BF,
                            BOOKING_FEE_TYPE: seat.BT,
                            EVENT_ID: this.eventID,
                            NO_OF_TICKETS: totalSeats,
                            SHOW_TIME: this.toMySQLTime(this.selectedTime),
                            SHOW_DATE: this.formatToDDMMYYYY111(this.selectedDate),
                            VENUE_NAME: this.selectedVenue.name,
                            VENUE_CITY: this.selectedVenue.CITY_NAME,
                            EVENT_NAME: this.eventname,
                            RAZ_ORDER_ID: responseeeeeee.RAZ_ORDER_ID,
                            SESSION_ID: this.SESSION_ID,
                            EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                            TEMP_UNIQUE_ID: TEMP_UNIQUE_ID,
                            BOOKING_DETAILS: '',
                            SEATIDS: this.selectedSeatsIDs.toString(),
                            HOSTING_TYPE: this.Hoisting_Type
                        }));

                        setTimeout(() => {
                            this.apiService.addPaymentTransactions(body).subscribe({
                                next: (response: any) => {
                                    var obj = {
                                        "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                        "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                        "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                        "LOG_TYPE": "INFO",
                                        "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                        "LOG_TEXT": "Payment Entry Response",
                                        "USER_DATA": JSON.stringify({
                                            'request': body,
                                            'response': response
                                        })
                                    }

                                    this.apiService.actionLogsAdd(obj).subscribe({
                                        next: (data: any) => {
                                        }
                                    });
                                    if (response?.code == '200' || response?.code == '201') {
                                        this.updateSeatLayoutWithBookingStatus();
                                        const HOSTING_TYPE = this.Hoisting_Type;
                                        const TRANSACTION_ID = 0
                                            ;
                                        const payload = {

                                            TEMP_HOLD_ID: this.TEMP_HOLD_ID,
                                            ADDITIONAL_EMAIL_ID: this.addional.EMAIL,
                                            ADDITIONAL_USER_NAME: this.addional.NAME,
                                            ADDITIONAL_MOBILE_NO: this.addional.MOBILE,


                                            razOrderID: responseeeeeee.RAZ_ORDER_ID,

                                            EXTRA_INFORMATION_DATA: this.EXTRA_INFORMATION_DATA ? JSON.stringify(this.EXTRA_INFORMATION_DATA) : '',

                                            SESSION_ID: this.SESSION_ID,
                                            EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                                            TEMP_UNIQUE_ID: TEMP_UNIQUE_ID,
                                            HOSTING_TYPE,
                                            RESERVE_TICKET_NOS: this.paymentdata?.reservedTickets,
                                            TRANSACTION_ID,
                                            RAZ_SIGNATURE: '',
                                            DISCOUNT_TYPE: this.selectedmembership?.DISCOUNT_TYPE || null,
                                            BOOKING_FEE: this.paymentdata?.bookingFeeRate,
                                            BOOKING_FEE_TYPE: this.paymentdata?.bookingFeeType,
                                            TERMS_CONDITIONS: this.TERMS_CONDITIONS,

                                        };



                                        this.apiService.sendBookingData(payload).subscribe({
                                            next: (response: any) => {
                                                this.clearSessionId();
                                                var obj = {
                                                    "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                                    "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                    "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                    "LOG_TYPE": "INFO",
                                                    "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                                    "LOG_TEXT": "Booking Data",
                                                    "USER_DATA": JSON.stringify({
                                                        'request': payload,
                                                        'response': response
                                                    })
                                                }


                                                this.apiService.actionLogsAdd(obj).subscribe({
                                                    next: (data: any) => {
                                                    }
                                                });
                                                if (response?.code == '200' || response?.code == '409') {
                                                    this.toastr.success('Booking successful', 'Success');
                                                    // this.QR_CODE = response.QR_CODE
                                                    this.BOOKING_CODE = response.BOOKING_CODE;
                                                    // this.BOOKING_PDF = response.BOOKING_PDF
                                                    let qrText = "{'Booking_Code':'" + this.BOOKING_CODE + "'}";
                                                    this.generateQRWithLogo(
                                                        qrText,
                                                        'assets/logo.png'
                                                    ).then(finalQr => {
                                                        this.qrCodeDataURL = finalQr;
                                                        this.loadBookingFlag = false;
                                                        this.ticketData = {
                                                            qrCodeDataURL: this.qrCodeDataURL,
                                                            TERMS_CONDITIONS: this.TERMS_CONDITIONS,
                                                            PLAN_ID: response.data.PLAN_ID || null,
                                                            PLAN_NAME: response.data.PLAN_ID != undefined && response.data.PLAN_ID != '' ? response.data.PLAN_NAME : '',
                                                            mobileno: this.memberId ? this.addional?.MOBILE ? this.addional.MOBILE : localStorage.getItem('MOBILE_NO') : this.user.MOBILE,
                                                            mobileno1: this.memberId ? localStorage.getItem('MOBILE_NO') : this.user.MOBILE,
                                                            email: this.memberId ? this.addional?.EMAIL ? this.addional.EMAIL : localStorage.getItem('EMAIL_ID') : this.user.EMAIL,
                                                            ADDITIONAL_EMAIL_ID: this.addional.EMAIL,
                                                            ADDITIONAL_USER_NAME: this.addional.NAME,
                                                            ADDITIONAL_MOBILE_NO: this.addional.MOBILE,
                                                            EVENT_AGE_GROUP: response.data.AGE_GROUP,
                                                            CITY_NAME: response.data.VENUE_CITY_NAME,
                                                            eventTitle: response.data.EVENT_NAME,
                                                            eventImage: response.data.EVENT_IMAGE,
                                                            eventDate: this.formatToDDMMYYYY(response.data.SHOW_DATE),
                                                            eventTime: response.data.SHOW_TIME,
                                                            eventVenue: response.data.VENUE_NAME,
                                                            customerName: response.data.USER_NAME,
                                                            ticketCount: response.data.NUMBERS_OF_SEATS,
                                                            payMode: response.data.PAYMENT_METHOD || 'C',
                                                            taxFee: response.data.totalTaxPrice,
                                                            bookingFee: response.data.TOTAL_BOOKING_FEE,
                                                            discount: response.data.DISCOUNT_AMOUNT || response.data.DISCOUNT_VALUE || 0,
                                                            // seatInfo: bodyyyyy.CART_DETAILS,
                                                            seatInfo: JSON.parse(response.data.BOOKING_DATA),
                                                            hostingType: response.data.HOSTING_TYPE,
                                                            bookingId: this.BOOKING_CODE,
                                                            finalAmount: Number(response.data.finalAmount) || 0,
                                                            totalPrice: Number(response.data.totalPrice) || 0,
                                                            // convenienceFee: this.paymentdata?.totalBookingFee + this.paymentdata?.totalTaxPrice,
                                                            convenienceFee: Number(response.data.TOTAL_BOOKING_FEE) + Number(response.data.totalTaxPrice),
                                                            coupandiscount: Number(response.data.COUPON_DETAILS.COUPON_DISCOUNT) || 0,
                                                            memberdiscount: Number(this.paymentdata?.membertotalDiscount) || 0,
                                                            IS_COUPON_USED: response.data.IS_COUPON_USED,
                                                            IS_PLAN_USED: response.data.IS_PLAN_USED,
                                                            MAIN_EVENT_NAME: response.data.MAIN_EVENT_NAME || '',
                                                        }


                                                        this.activeStep = 5;
                                                    })
                                                        .catch((err: any) => {

                                                            this.qrCodeDataURL = '';
                                                            this.loadBookingFlag = false;
                                                            this.activeStep = 5;
                                                        });



                                                } else if (response?.code == '400') {
                                                    this.toastr.error(
                                                        'If money was debited, it will be refunded in 5–7 days.',
                                                        'Failed To Book Ticket',
                                                        {
                                                            timeOut: 5000, // auto-hide in 5s
                                                            closeButton: true,
                                                            progressBar: true,
                                                        }
                                                    );
                                                    this.clearSessionId();
                                                    setTimeout(() => {
                                                        this.router.navigate(['/home']).then(() =>
                                                            window.location.reload()
                                                        );
                                                    }, 2000);
                                                } else {
                                                    this.toastr.error('Booking failed', 'Error');
                                                }
                                            },
                                            error: (err) => {
                                                this.toastr.error('Error sending booking data.', 'Error');
                                                var obj = {
                                                    "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                                    "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                    "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                                    "LOG_TYPE": "INFO",
                                                    "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                                    "LOG_TEXT": "Booking Data",
                                                    "USER_DATA": JSON.stringify({
                                                        'request': payload,
                                                        'response': err
                                                    })
                                                }


                                                this.apiService.actionLogsAdd(obj).subscribe({
                                                    next: (data: any) => {
                                                    }
                                                });
                                            },
                                        });




                                    } else if (response?.code == '400') {
                                        this.toastr.error(
                                            'If money was debited, it will be refunded in 5–7 days.',
                                            'Failed To Book Ticket',
                                            {
                                                timeOut: 5000, // auto-hide in 5s
                                                closeButton: true,
                                                progressBar: true,
                                            }
                                        );
                                        this.clearSessionId();
                                        setTimeout(() => {
                                            this.router.navigate(['/home']).then(() =>
                                                window.location.reload()
                                            );
                                        }, 2000);
                                    } else {
                                        this.toastr.error('Something failed', 'Error');
                                    }
                                },
                                error: (err) => {
                                    var obj = {
                                        "TEMP_UNIQUE_ID": TEMP_UNIQUE_ID,
                                        "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                        "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                                        "LOG_TYPE": "INFO",
                                        "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                                        "LOG_TEXT": "Payment Entry Response",
                                        "USER_DATA": JSON.stringify({
                                            'request': body,
                                            'response': err
                                        })
                                    }

                                    this.apiService.actionLogsAdd(obj).subscribe({
                                        next: (data: any) => {
                                        }
                                    });
                                    this.toastr.error('Error sending booking data.', 'Error');
                                    this.loadBookingFlag = false;
                                }
                            });
                        }, 5000);
                    }

                } else if (responseeeeeee?.code == 405) {
                    this.iscancelled = true;
                    const modal = new bootstrap.Modal(document.getElementById('selectSeatCountModalformodelll')!);
                    modal.show();
                    this.loadBookingFlag = false;
                } else if (responseeeeeee?.code == 400) {
                    this.toastr.error('Something went wrong while booking.', 'Error');
                    sessionStorage.setItem('wrongdata', 'y');
                    this.clearSessionId();
                    this.loadBookingFlag = false;
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    this.loadBookingFlag = false;
                    this.toastr.error('Booking failed', 'Error');
                }
            },
            error: () => {
                this.toastr.error('Error while booking', 'Error');
                this.loadBookingFlag = false;
            },
        });
        // }
    }

    BOOKING_PDF: any

    continue() {
        const bookingPayload = this.orderSummary.items.map(
            (item: any, index: number) => ({
                TICKET_BOOKING_EVENT_ID: this.bookingMeta?.ID,
                USER_ID: this.userID,
                USER_TYPE: 'C',
                SEAT_NUMBERS: null,
                AMOUNT: item.price,
                SECTION_NAME: item.event,
                EVENT_ID: this.eventID,
                NO_OF_TICKETS: item.booked,
                BOOKING_FEE: item.BOOKING_FEE,
                BOOKING_FEE_TYPE: item.BOOKING_FEE_TYPE
            })
        );

        //
        let bookings = bookingPayload;
        const HOSTING_TYPE = this.Hoisting_Type;
        const deviceId2 = localStorage.getItem('deviceId');
        const payload = {
            bookings, HOSTING_TYPE,
            seatIds: this.selectedSeatsIndex,
            SEAT_IDS: this.selectedSeatsIDs.toString(),
            userId: deviceId2,
            BOOKING_DATE_START: this.BOOKING_DATE_START,
            BOOKING_DATE_END: this.BOOKING_DATE_END,
            CHECK_DATE_START: this.CHECK_DATE_START,
            EARLY_ACCESS_DATE: this.EARLY_ACCESS_DATE,
        };

        this.apiService.sendBookingData(payload).subscribe({
            next: (response: any) => {
                if (response?.code == '200') {
                    this.toastr.success('Booking successful', 'Success');
                } else {
                    this.toastr.error('Booking failed', 'Error');
                }
            },
            error: () => {
                this.toastr.error('Error sending booking data.', 'Error');
            },
        });
    }

    previous() {
        this.stopAllTimers();
        const target = document.getElementById('tugoz-container') as HTMLElement;
        if (target) {
            target.style.display = 'none';
        }
        if (this.activeStep == 2) {
            this.selectedTime = null;

        }
        if (this.activeStep > 1) {
            if (this.activeStep == 4) {
                //
                this.removeCouponDATAwithoutcalulation();

                this.releasetticket();
            }
            this.activeStep--;

            this.clearmembershipnew();
            this.updateStepTitle();
        }


    }
    goToStep(stepNumber: number) {
        if (stepNumber < this.activeStep) {
            this.activeStep = stepNumber;
        } else if (stepNumber == this.activeStep) {
            return;
        }
    }

    updateStepTitle() {
        this.currentStepTitle = this.stepTitles[this.activeStep] || 'Event';
        this.hideTitle = this.Hoisting_Type == 'C' && this.activeStep == 3;
    }


    //------------------------------------- code for calender logic ------------------------------------- //

    weekdays: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    currentMonth: any;
    currentYear: any;
    currentMonthName: string = '';
    calendarDays: any = []; // Array to hold all day objects, including null for empty cells
    // selectedDate: Date | null = null;

    private dateStatuses: {
        [key: string]: 'available' | 'fast-filling' | 'sold-out';
    } = {
        };

    renderCalendar(): void {
        this.calendarDays = []; // Clear previous days
        const firstDayOfMonth = new Date(
            this.currentYear,
            this.currentMonth,
            1
        ).getDay(); // 0 = Sunday, 6 = Saturday
        const daysInMonth = new Date(
            this.currentYear,
            this.currentMonth + 1,
            0
        ).getDate(); // Last day of the month

        const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        this.currentMonthName = monthNames[this.currentMonth].toUpperCase();

        // Add empty cells for the days before the 1st of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            this.calendarDays.push(null); // Use null for empty placeholder
        }

        const today = new Date();
        const todayDateOnly = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

        // Add date cells
        for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
            const date = new Date(this.currentYear, this.currentMonth, dayNum);
            const fullDateKey = `${this.currentYear}-${String(
                this.currentMonth + 1
            ).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const status = this.dateStatuses[fullDateKey] || 'available';

            let cssClasses = [`status-${status}`];
            let isClickable = true;

            if (date < todayDateOnly) {
                cssClasses.push('inactive');
                isClickable = false;
            }

            // Check if sold out
            if (status == 'sold-out') {
                cssClasses.push('unavailable');
                isClickable = false;
            }

            const isToday = date.toDateString() == today.toDateString();
            const isSelected = this.selectedDate
                ? date.toDateString() == this.selectedDate.toDateString()
                : false;

            this.calendarDays.push({
                date: date,
                dayOfMonth: dayNum,
                isCurrentMonth: true, // For now, all rendered days are current month
                isToday: isToday,
                isSelected: isSelected,
                status: status,
                cssClass: cssClasses.join(' '),
                isClickable: isClickable,
            });
        }
    }

    selectDate1(day: any | null): void {
        if (day && day.isClickable) {
            // Deselect previous
            if (this.selectedDate) {
                const prevSelectedDay = this.calendarDays.find(
                    (d: any) =>
                        d?.date.toDateString() == this.selectedDate?.toDateString()
                );
                if (prevSelectedDay) {
                    prevSelectedDay.isSelected = false;
                    prevSelectedDay.cssClass = prevSelectedDay.cssClass.replace(
                        ' selected',
                        ''
                    );
                }
            }

            // Select new
            day.isSelected = true;
            day.cssClass += ' selected';
            this.selectedDate = day.date;
            // console.log('1', this.selectedDate)
            const dateKey = this.formatDateKey(day.date);
            this.times = this.availableShowTimes[dateKey] || [];
        }
    }

    private formatDateKey(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayStr = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${dayStr}`;
    }


    changeMonth(delta: number): void {
        this.currentMonth += delta;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.renderCalendar();
    }

    playName: string = '';
    playId: string = '';
    playtype: string = '';
    retriveimgUrl = this.apiService.retriveimgUrl;


    pdfurl = ''
    isOk = true;
    namepatt = /[a-zA-Z][a-zA-Z ]+/;
    city: any[] = [];
    E_ID: any = null;

    theatreId: any;
    cityId: any = [];
    isSpinning: boolean = false;
    SN: string = "";
    SP: any;
    LAYOUT_NAME_LIST: any[] = [];
    ROWS_IN_SECTION: any = "";
    SEATS_IN_ONE_ROW_OF_SECTION: any = "";
    SECTIONS: any[] = [];
    LAYOUT_JSON: any = [];
    Edit_ID: any = null;
    isVisible = false;
    IA: boolean = false;
    AR: any = 0;
    ID = false;
    CS = 'LTR';
    RS = 'TTB';
    SectionDemo: any[] = [];
    Step = 0;
    nzLoading: boolean = false;
    oldi: any;
    oldj: any;
    oldk: any;
    multicheck: boolean = false;
    isLayoutNameSpinning: boolean = false;
    ISSWN: boolean = false;
    SCREEN_ID: any = 0;
    THEATER_SCREEN_DETAILS_ID: any;
    isVisibleAdd: boolean = false;
    theater: any = [];
    image: any = '';
    fileURL: any;
    ACTUAL_LAYOUT_IMAGE: any;
    SCREEN_MASTER: any = [
        {
            VENUE_ID: '',
            LAYOUT_JSON: []
        }
    ];

    SCREENNAME: any = '';
    SCREENDATA: any[] = [];
    totalRecords = 10;
    pageIndex = 1;
    loadingRecordsScreen = false;
    pageSize = 10;
    drawerVisible: boolean = false;
    drawerTitle = "Add New Screen";
    drawerData: any;
    SCREEN_NAME: any = '';
    SHORT_CODE: any = '';
    ACTUALLAYOUTIMAGE: any = '';
    height = '86vh';
    paddingValue: any = '10px';

    isVisibleSofa = false;
    isOkLoading = false;










    getLayoutNames(): void {
        this.isLayoutNameSpinning = true;
    }





    openPopConfirm: boolean = false;





    selectedSeatsIndex: any = [];
    selectedSeatsIDs: any = [];







    selectedSeatDetails: any = null;
    selectedSeats1: any[] = [];

    getTotalPrice(): number {
        return this.selectedSeats1.reduce((acc, seat) => acc + Number(seat.SP), 0);
    }

    getTaxAndFees(): number {
        return Math.round(this.getTotalPrice() * 0.118); // example: 11.8% tax
    }

    getGrandTotal(): number {
        return this.getTotalPrice() + this.getTaxAndFees();
    }

    openSeatCountModal() {
        const modal = new bootstrap.Modal(document.getElementById('selectSeatCountModal')!);
        modal.show();
    }
    taxesAndFees: number = 0;




    hideTitle: boolean = false;
    gettitle() {
        if (this.Hoisting_Type == 'C' && this.activeStep == 3) {
            return '';
        }
        return this.currentStepTitle = this.stepTitles[this.activeStep] || 'Event';
    }

    gettax() {
        return +(this.getTotalAmount() * 0.18).toFixed(2);
    }

    selectedSeatCount: any = 0;
    PRSelectedSeatCount: any = 0;
    selectedCount: number | null = 2;
    pendingSeatClickData: any = null;

    selectSeatCount(count: number): void {
        if (count > this.CHARTED_AVAILABLE_FOR_BOOKING || (this.selectedmembership?.ID && count > 2)) {

        } else
            this.selectedCount = count;

    }
    selectedSeatModalOpened: boolean = false;



    confirmSeatCount(): void {
        this.selectedSeatCount = this.selectedCount;
        const modalEl = document.getElementById('selectSeatCountModal')!;
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();

        this.selectedSeats1 = [];
        this.selectedSeatsIDs = [];
        this.selectedSeatsIndex = [];

    }



    formatToDDMMYYYY(inputDate: any): string {
        let date: Date;

        // If input is DD-MM-YYYY
        if (/^\d{2}-\d{2}-\d{4}$/.test(inputDate)) {
            const [day, month, year] = inputDate.split('-');
            date = new Date(+year, +month - 1, +day); // local date
        }
        // If input is YYYY-MM-DD
        else if (/^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
            const [year, month, day] = inputDate.split('-');
            date = new Date(+year, +month - 1, +day); // local date
        }
        // Fallback (Date can parse many other formats but may cause issues)
        else {
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

    getPriceRange(sectionList: any[]): string {
        if (!sectionList || sectionList.length == 0) return 'No price data';

        const prices = sectionList
            .map(item => +item.price)
            .filter(price => !isNaN(price));

        if (prices.length == 0) return 'No valid prices';

        const min = Math.min(...prices);
        const max = Math.max(...prices);

        return min == max
            ? `Price: ₹${min}`
            : `Price starts from ₹${min} to ₹${max}`;
    }

    hoveredSeat: any = null;


    user = {
        NAME: '',
        EMAIL: '',
        MOBILE: ''
    };
    addional = {
        NAME: '',
        EMAIL: '',
        MOBILE: ''
    };

    showTaxDetails: boolean = false;
    @ViewChild('captchaRef') captchaRef!: ReCaptcha2Component;
    captchaToken: string | null = null;

    // ============ CAPTCHA Event Handlers ============
    handleCaptchaSuccess(token: string) {
        this.captchaToken = token;
        // console.log('Captcha token:', token);
    }

    handleCaptchaExpire() {
        this.captchaToken = null;
        // console.log('Captcha expired');
    }

    handleCaptchaError(error: any) {
        // console.error('Captcha error', error);
        this.captchaToken = null;
    }

    IS_RESEND: boolean = false;

    onSubmit(form: any) {
        this.isSendingOtp = true;
        this.getotpandverify = true;

        if (!this.IS_RESEND && !this.captchaToken) {
            this.toastr.error(
                'Please complete the CAPTCHA before sending OTP.',
                'Error'
            );
            this.isSendingOtp = false;
            this.getotpandverify = false;
            return;
        }
        const payload: any = {
            TYPE: 'M',
            VALUE: this.user.MOBILE,
            IS_RESEND: this.IS_RESEND,
        };

        if (!this.IS_RESEND) {
            payload.CAPTCHA_RESPONSE = this.captchaToken;
        }

        this.apiService.sendOTPwhilebooking(payload).subscribe({
            next: (successCode: any) => {
                if (successCode.code == '200') {
                    this.toastr.success(
                        'OTP has been sent to you via WhatsApp. Please check your WhatsApp.',
                        'Success'
                    );
                    const modal = new bootstrap.Modal(
                        document.getElementById('forverifyotp')!
                    );
                    modal.show();
                    this.getotpandverify = false;
                    this.startTimer();
                    if (!this.IS_RESEND) {
                        // console.log('captchaRef1', this.captchaRef);
                        if (this.captchaRef) {
                            this.captchaRef.resetCaptcha();
                        }
                        this.captchaToken = null;
                    }
                } else if (successCode.code == '300') {
                    this.toastr.warning(
                        successCode.message ||
                        'Too many OTP requests. Please try again after some time.',
                        'Warning'
                    );

                    this.getotpandverify = false;
                    if (!this.IS_RESEND) {
                        // console.log('captchaRef1', this.captchaRef);
                        if (this.captchaRef) {
                            this.captchaRef.resetCaptcha();
                        }
                        this.captchaToken = null;
                    }
                } else if (successCode.code == '400') {
                    this.toastr.error(
                        successCode.message || 'Invalid CAPTCHA. Please try again.',
                        'Error'
                    );

                    this.getotpandverify = false;
                    if (!this.IS_RESEND) {
                        // console.log('captchaRef1', this.captchaRef);
                        if (this.captchaRef) {
                            this.captchaRef.resetCaptcha();
                        }
                        this.captchaToken = null;
                    }
                } else {
                    this.toastr.error('Failed to send OTP. Please try again.', 'Error');

                    this.getotpandverify = false;
                    if (!this.IS_RESEND) {
                        // console.log('captchaRef1', this.captchaRef);
                        if (this.captchaRef) {
                            this.captchaRef.resetCaptcha();
                        }
                        this.captchaToken = null;
                    }
                }
            },
            error: () => {
                this.toastr.error(
                    'Error in sending OTP. Please try again later.',
                    'Error'
                );
                this.getotpandverify = false;
                if (!this.IS_RESEND) {
                    // console.log('captchaRef1', this.captchaRef);
                    if (this.captchaRef) {
                        this.captchaRef.resetCaptcha();
                    }

                    this.captchaToken = null;
                }
            },
            complete: () => {
                this.isSendingOtp = false;
                this.IS_RESEND = false;
            },
        });
    }

    planisnotforreserve: Boolean = false
    IS_MEMBERR = localStorage.getItem('IS_MEMBER') == "M" ? true : false
    getwithoutloginandlogin() {
        var IS_MEMBER = localStorage.getItem('IS_MEMBER') == "M" ? true : false


        if (this.otpverifed) {
            return true;
        } else {
            return false;
        }

    }

    isSendingOtp: boolean = false

    sendOTP(form: NgForm) {
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

    interval2: any;
    startTimer2() {
        if (this.interval2) {
            clearInterval(this.interval2);
            this.interval2 = null;
        }
        if (Number(this.position) > 0 && Number(this.position) <= 20) {
            this.disabledfor5sec = 10;
        } else if (Number(this.position) > 20 && Number(this.position) <= 40) {
            this.disabledfor5sec = 30;
        } else if (Number(this.position) > 40) {
            this.disabledfor5sec = 60;
        }

        this.interval2 = setInterval(() => {
            if (this.disabledfor5sec > 0) {
                this.disabledfor5sec--;
            } else {
                this.referesh();
                clearInterval(this.interval2);
            }
        }, 1000);
    }

    isverifyOTP: boolean = false
    remainingTime: any = 0
    otp: string[] = ['', '', '', '', '', ''];
    otpTouched = false;
    otpSent: boolean = false;

    allowOnlyNumbers(event: KeyboardEvent) {
        const charCode = event.which ? event.which : event.keyCode;
        if (charCode < 48 || charCode > 57) {
            event.preventDefault();
        }
    }

    moveToNext(event: KeyboardEvent, index: number) {
        const inputs = document.getElementsByClassName(
            'otp-input'
        ) as HTMLCollectionOf<HTMLInputElement>;

        if (event.key == 'Backspace') {
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

    handlePaste(event: ClipboardEvent) {
        event.preventDefault();
        const pastedData = event.clipboardData?.getData('text')?.trim();

        if (pastedData && /^\d{6}$/.test(pastedData)) {
            for (let i = 0; i < 6; i++) {
                this.otp[i] = pastedData[i];
            }

            const inputs = document.getElementsByClassName(
                'otp-input'
            ) as HTMLCollectionOf<HTMLInputElement>;

            setTimeout(() => {
                inputs[5]?.focus();
            }, 50);
        }
    }

    get otpInvalid(): boolean {
        return this.otp.some((d) => d == '') || this.otp.join('').length != 6;
    }



    loadingRecords: boolean = false
    otpverifed: boolean = false
    withoutloginmemberid: any = ''
    checkforadd: boolean = false
    addinaldataaded: boolean = false
    onSubmit222(form: any) {
        this.getotpandverify = true;
        const payload = {
            ADDITIONAL_MEMBER_MOBILE: this.addional.MOBILE,
            ADDITIONAL_MEMBER_EMAIL: this.addional.EMAIL,
            IS_ADDITIONAL_INFO: true,
            ADDITIONAL_MEMBER_NAME: this.addional.NAME,
            MEMBER_ID: this.memberId,
            CLIENT_ID: 1
        };

        this.apiService.addionalcreate(payload).subscribe({
            next: (successCode: any) => {
                if (successCode.code == '200') {
                    this.addinaldataaded = true

                    this.toastr.success(
                        'Additional Details added successfully.',
                        'Success'
                    );

                    this.getotpandverify = false;

                } else {

                    this.toastr.error('Failed to Additional Details', 'Error');
                }
                this.isSendingOtp = false;
                this.getotpandverify = false;
            },
            error: () => {
                this.getotpandverify = false;
                this.toastr.error(
                    'Error in adding Additional Details. Please try again later.',
                    'Error'
                );
            },
            complete: () => {
                this.isSendingOtp = false;
                this.getotpandverify = false;
            },
        });
    }

    getotpandverify: boolean = false
    selectedcupon: any = [];
    spincuponopen: boolean = false

    showcuponModal() {

        const userID = this.memberId || this.withoutloginmemberid;

        if (!userID) {
            this.toastr.info('Kindly log in or provide your contact details to continue.');
            return;
        } else {
            this.spincuponopen = true
            var dataaa = {
                CATEGORY_ID: this.selectedcategoryId.toString(),

            }

            this.apiService
                .getApplicableCouponsDATA(dataaa).subscribe(
                    (data: any) => {
                        if (data?.code == 200) {
                            this.cuponslist = data?.data
                            const modalElement = document.getElementById('offerModallllll');
                            if (modalElement) {
                                const modal = new bootstrap.Modal(modalElement);
                                modal.show();
                            }
                            this.spincuponopen = false
                        } else {
                        }
                    },
                    (error: any) => {
                    }
                );
        }
    }


    cuponslist: any = []
    applycode: any = ''
    cuponloading: boolean = false

    applyforcupon() {
        const userID = this.memberId || this.withoutloginmemberid;
        if (!userID) {
            this.toastr.info('Kindly log in or provide your contact details to continue.');
            return;
        }
        var payload: any
        var payloadddddd: any
        this.spincuponopen = true;
        payload =
        {
            // ...this.allpayyload,
            "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
            "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
            SESSION_ID: this.SESSION_ID,
            // "COUPON_ID": this.draftselectedcupon.ID,
            COUPON_CODE: this.applycode,
            MEMBER_ID: this.userID ? this.userID : this.withoutloginmemberid,
            EVENT_DETAIL_ID: this.bookingMeta?.ID,
            VENUE_ID: this.selectedVenue.id,
            EVENT_ID: this.eventID,
            CATEGORY_ID: this.selectedcategoryId,
            CITY_ID: this.selectedVenue.CITY_ID,
            BOOKING_DETAILS: this.allpayyload.TICKETS,
            SEATIDS: this.selectedSeatsIDs.toString(),
            HOSTING_TYPE: this.Hoisting_Type,
        }

        payloadddddd =
        {
            // "COUPON_ID": this.selectedcupon.ID,
            COUPON_CODE: this.applycode,
            MEMBER_ID: this.userID ? this.userID : this.withoutloginmemberid,
            BOOKING_DETAILS: this.allpayyload.TICKETS,
            SEATIDS: this.selectedSeatsIDs.toString(),
            HOSTING_TYPE: this.Hoisting_Type,
        }
        this.onemorecallafterapply(payload)


    }

    removeCouponDATAwithoutcalulation() {

        if (this.coupanapplies) {
            var payload =
            {
                "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
                SESSION_ID: this.SESSION_ID,
                COUPON_CODE: this.applycode,
                MEMBER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                EVENT_DETAIL_ID: this.bookingMeta?.ID,
                VENUE_ID: this.selectedVenue.id,
                EVENT_ID: this.eventID,
                CATEGORY_ID: this.selectedcategoryId,
                CITY_ID: this.selectedVenue.CITY_ID,
                BOOKING_DETAILS: this.allpayyload.TICKETS,
                SEATIDS: this.selectedSeatsIDs.toString(),
                HOSTING_TYPE: this.Hoisting_Type,
            }

            this.apiService.removeCouponDATAwithoutcalulation(payload).subscribe({
                next: (successCode: any) => {

                }
            });
            this.coupanapplies = false
            this.applycode = ''
            this.selectedcupon = []
        }
    }

    coupanapplies: boolean = false
    onemorecallafterapply(payload: any) {
        // var obj = {
        //     "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
        //     "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
        //     "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
        //     "LOG_TYPE": "INFO",
        //     "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
        //     "LOG_TEXT": "User Applied Coupon",
        //     "USER_DATA": JSON.stringify(payload)
        // }

        // this.apiService.actionLogsAdd(obj).subscribe({
        //     next: (data: any) => {
        //     }
        // });
        this.apiService.applyCouponDATA(payload).subscribe({
            next: (successCode: any) => {
                var obj = {
                    "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
                    "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                    "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                    "LOG_TYPE": "INFO",
                    "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                    "LOG_TEXT": "Coupon Application Response",
                    "USER_DATA": JSON.stringify({
                        'request': payload,
                        'response': successCode
                    })
                }

                this.apiService.actionLogsAdd(obj).subscribe({
                    next: (data: any) => {
                    }
                });
                if (successCode.code == '200') {
                    // this.selectedcupon = this.draftselectedcupon
                    this.toastr.success(
                        'Coupon applied successfully.',
                        'Success'
                    );
                    // const modal1 = document.getElementById('offerModallllll');
                    // if (modal1) {
                    // const bootstrapModal1 = bootstrap.Modal.getInstance(modal1) || new bootstrap.Modal(modal1);
                    // bootstrapModal1.hide();
                    // }
                    this.paymentdata = successCode;
                    this.paymentdata.finalAmountwords = this.commonFunction.amountInWords(this.paymentdata.finalAmount);
                    this.spincuponopen = false;
                    this.coupanapplies = true
                    // this.applycode = ''
                } else if (successCode.code == 300 || successCode.code == 301 || successCode.code == 302 || successCode.code == 311 || successCode.code == 310 || successCode.code == 404) {
                    this.toastr.info(
                        successCode.message,
                        'Info'
                    );
                    this.spincuponopen = false;
                    this.coupanapplies = false

                }
                else if (successCode?.code == 405) {
                    this.iscancelled = true;
                    const modal = new bootstrap.Modal(document.getElementById('selectSeatCountModalformodelll')!);
                    modal.show();
                    this.spincuponopen = false;
                    this.coupanapplies = false
                }
                else {
                    this.spincuponopen = false;
                    this.coupanapplies = false
                    this.toastr.error('Failed to Apply Coupon. Please try again.', 'Error');
                    // const modal1 = document.getElementById('offerModallllll');
                    // if (modal1) {
                    // const bootstrapModal1 = bootstrap.Modal.getInstance(modal1) || new bootstrap.Modal(modal1);
                    // bootstrapModal1.hide();
                    // }
                }

            },
            error: (err) => {
                this.spincuponopen = false;
                this.coupanapplies = false
                // console.log(err)
                if (err.error.code == 300 || err.error.code == 301 || err.error.code == 302 || err.error.code == 311 || err.error.code == 310 || err.error.code == 404) {
                    this.toastr.info(
                        err.error.message,
                        ''
                    );
                } else
                    this.toastr.error(
                        'Something went wrong. Please try again later.',
                        'Error'
                    );
            },
            complete: () => {
                this.isSendingOtp = false;
            },
        });
    }


    invertTransform(transform: string): string {
        // Match 'rotate(12.5deg)' or 'rotate(-12.5deg)'
        const rotateMatch = transform.match(/rotate\((-?\d+(\.\d+)?)deg\)/);
        let rotatePart = '';
        let offsetPx = 0;

        if (rotateMatch && rotateMatch[1]) {
            const angle = parseFloat(rotateMatch[1]);
            const inverse = -angle;
            rotatePart = `rotate(${inverse}deg)`;

            // Calculate offset based on angle sign
            // You can tweak this logic/scale for better accuracy
            const maxOffset = 8; // max offset in px
            offsetPx = angle > 0 ? -maxOffset : (angle < 0 ? maxOffset : 0);
        }
        // Adjust translateX using calc with px offset
        var v = -50 - offsetPx
        const translatePart = `translateX(${v}%)`;
        return `${translatePart} ${rotatePart}`.trim();
    }

    removeapplycupon(dataaaa: any) {
    }

    // getSeatTooltip(Section: any, row: any, seat: any): string {
    // return seat.PR == 1 ? `
    // <div class='tooltip-content'>
    // <div><strong> ${Section} </strong></div>
    // <div><strong>${row}${seat.N}</strong></div>
    // <div><strong> ₹${seat.SP} </strong></div>
    // <div >Members-Only</div>
    // </div>`: `<div class='tooltip-content'>
    // <div><strong> ${Section} </strong></div>
    // <div><strong>${row}${seat.N}</strong></div>
    // <div><strong> ₹${seat.SP} </strong></div>
    // </div>`;
    // }

    getSeatTooltip(section: any, row: any, seat: any): string {
        let status = '';
        let iconClass = '';
        let colorClass = '';

        switch (seat.IB) {
            // case 'B':
            //     // status = 'Booked';
            //     status = 'Not Available';
            //     iconClass = 'bi-x-circle-fill';
            //     colorClass = 'text-danger';
            //     break;
            case 'P':
                status = 'In Progress';
                iconClass = 'bi-exclamation-circle-fill';
                colorClass = 'text-warning';
                break;
            case 'A':
                status = 'Available';
                iconClass = 'bi-check-circle-fill';
                colorClass = 'text-success';
                break;
            default:
                status = 'Unknown';
                iconClass = 'bi-question-circle-fill';
                colorClass = 'text-secondary';
        }
        const icon = seat.SNA == 1 || seat.IB == 'B' ? `<i class="bi bi-x-circle"></i>` : `<i class="bi ${iconClass} ${colorClass}"></i>`;
        return `
<div class='seat-tooltip'>
<div class='tooltip-seat-number'>${row}-${seat.N}</div>
${seat.SV > 1 ? `<div class='tooltip-seat-number'>${seat.SV} persons</div>` : ''}
<div class="border-bottom border-light"></div>
<div class='tooltip-section'>${section}</div>
<div class="border-bottom border-light"></div>
<div class='tooltip-section'></div>
<div class='tooltip-price'>${seat.SG != 'null' && seat.SG != null && seat.SG != 'undefined' && seat.SG != undefined ? seat.SG + ' -' : ''} ${seat.SNA == 1 || seat.IB == 'B' ? '' : ' ₹' + seat.SP}</div>
${seat.PR == 1
                ? '<div class="tooltip-members-only">Members-Only</div>'
                : ''
            }
<div class='tooltip-status-line'>
${icon}
<span>${seat.SNA == 1 || seat.IB == 'B' ? 'Not Available' : status}</span>
</div>
</div>`;
    }

    getFormattedCountdown(): string {
        const minutes = Math.floor(this.countdown / 60);
        const seconds = this.countdown % 60;
        return `${this.pad(minutes)}:${this.pad(seconds)}`;
    }

    pad(num: number): string {
        return num < 10 ? '0' + num : num.toString();
    }

    clearcupon(event: any) {
        var payload: any
        if (this.coupanapplies) {
            this.spincuponopen = true
            payload =
            {
                // ...this.allpayyload,
                // "COUPON_ID": this.selectedcupon.ID,
                COUPON_CODE: this.applycode,
                MEMBER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                EVENT_DETAIL_ID: this.bookingMeta?.ID,
                // VENUE_ID: this.selectedVenue.id,
                // EVENT_ID: this.eventID,
                SESSION_ID: this.SESSION_ID,
                "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
                // CATEGORY_ID: this.selectedcategoryId,
                // CITY_ID: this.selectedVenue.CITY_ID
                CART_ID: null,
                "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                BOOKING_DETAILS: this.allpayyload.TICKETS,
                SEATIDS: this.selectedSeatsIDs.toString(),
                HOSTING_TYPE: this.Hoisting_Type,
            }
            // payload =
            // {
            //     // ...this.allpayyload,
            //     "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
            //     "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
            //     SESSION_ID: this.SESSION_ID,
            //     // "COUPON_ID": this.draftselectedcupon.ID,
            //     COUPON_CODE: this.applycode,
            //     MEMBER_ID: this.userID ? this.userID : this.withoutloginmemberid,
            //     EVENT_DETAIL_ID: this.bookingMeta?.ID,
            //     VENUE_ID: this.selectedVenue.id,
            //     EVENT_ID: this.eventID,
            //     CATEGORY_ID: this.selectedcategoryId,
            //     CITY_ID: this.selectedVenue.CITY_ID
            // }

            if (event) {
                this.spincuponopen = true;
            } else {
                this.cuponloading = true;
            }
            // var obj = {
            //     "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
            //     "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
            //     "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
            //     "LOG_TYPE": "INFO",
            //     "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
            //     "LOG_TEXT": "User Remove Coupon",
            //     "USER_DATA": JSON.stringify(payload)
            // }

            // this.apiService.actionLogsAdd(obj).subscribe({
            //     next: (data: any) => {
            //     }
            // });
            this.apiService.removeCouponDATA(payload).subscribe({
                next: (successCode: any) => {
                    var obj = {
                        "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
                        "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                        "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                        "LOG_TYPE": "INFO",
                        "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                        "LOG_TEXT": "Remove Coupon Response",
                        "USER_DATA": JSON.stringify({
                            'request': payload,
                            'response': successCode
                        })
                    }

                    this.apiService.actionLogsAdd(obj).subscribe({
                        next: (data: any) => {
                        }
                    });
                    if (successCode.code == '200') {

                        this.applycode = ''
                        this.toastr.success(
                            'Coupon removed successfully.',
                            'Success'
                        );
                        const modal1 = document.getElementById('offerModallllll');
                        this.paymentdata = successCode;
                        this.paymentdata.finalAmountwords = this.commonFunction.amountInWords(this.paymentdata.finalAmount);
                        this.cuponloading = false;
                        this.coupanapplies = false;
                        this.spincuponopen = false;

                    } else {
                        this.cuponloading = false;
                        this.spincuponopen = false;
                        this.toastr.error('Failed to remove coupon. Please try again.', 'Error');

                    }

                },
                error: () => {
                    this.cuponloading = false;
                    this.spincuponopen = false;
                    this.toastr.error(
                        'Error in remove coupon. Please try again later.',
                        'Error'
                    );
                },
                complete: () => {
                    this.cuponloading = false;
                    this.spincuponopen = false;
                },
            });
        }
    }

    removecutponnn() {
        var payload: any
        if (this.coupanapplies) {
            // payload =
            // {
            //     // "COUPON_ID": this.selectedcupon.ID,
            //     COUPON_CODE: this.applycode,
            //     MEMBER_ID: this.userID ? this.userID : this.withoutloginmemberid,
            // }
            payload =
            {
                // ...this.allpayyload,
                // "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                // "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
                // SESSION_ID: this.SESSION_ID,
                // "COUPON_ID": this.draftselectedcupon.ID,
                COUPON_CODE: this.applycode,
                MEMBER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                EVENT_DETAIL_ID: this.bookingMeta?.ID,
                // VENUE_ID: this.selectedVenue.id,
                // EVENT_ID: this.eventID,
                // CATEGORY_ID: this.selectedcategoryId,
                // CITY_ID: this.selectedVenue.CITY_ID,


                SESSION_ID: this.SESSION_ID,
                "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
                CART_ID: null,
                "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                BOOKING_DETAILS: this.allpayyload.TICKETS,
                SEATIDS: this.selectedSeatsIDs.toString(),
                HOSTING_TYPE: this.Hoisting_Type,
            }
            // var obj = {
            //     "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
            //     "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
            //     "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
            //     "LOG_TYPE": "INFO",
            //     "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
            //     "LOG_TEXT": "Auto Remove Coupon",
            //     "USER_DATA": JSON.stringify(payload)
            // }

            // this.apiService.actionLogsAdd(obj).subscribe({
            //     next: (data: any) => {
            //     }
            // });
            this.apiService.removeCouponDATA(payload).subscribe({
                next: (successCode: any) => {
                    var obj = {
                        "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
                        "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                        "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                        "LOG_TYPE": "INFO",
                        "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                        "LOG_TEXT": "Auto Remove Coupon Response",
                        "USER_DATA": JSON.stringify({
                            'request': payload,
                            'response': successCode
                        })
                    }

                    this.apiService.actionLogsAdd(obj).subscribe({
                        next: (data: any) => {
                        }
                    });
                    this.coupanapplies = false
                    this.applycode = ''
                    if (successCode.code == '200') {
                        this.selectedcupon = []
                        this.coupanapplies = false
                        const modal1 = document.getElementById('offerModallllll');
                        if (modal1) {
                            const bootstrapModal1 = bootstrap.Modal.getInstance(modal1) || new bootstrap.Modal(modal1);
                            bootstrapModal1.hide();
                        }
                    }
                },

            });
        } else {
            this.coupanapplies = false
            this.applycode = ''
            this.selectedcupon = []
        }
    }

    membershiploading = false
    draftselectedcupon: any = []
    selctdraftcuponselect(dataaaa: any) {
        this.draftselectedcupon = dataaaa
    }

    searchmembersearch: any = ''
    draftselectedmember: any = []
    selctdraftmembershipselect(dataaaa: any) {
        this.draftselectedmember = dataaaa
    }

    selectedmembership: any = []
    removemembership() {
        var payload: any
        var memberrrrrrid = this.userID ? this.userID : this.withoutloginmemberid
        if ((this.Hoisting_Type == 'U' || this.Hoisting_Type == 'S') && memberrrrrrid) {
            this.loadBookingFlag = true

            payload =
            {
                ...this.allpayyload,
                IS_PLAN_USED: !!this.selectedmembership?.ID,
                "PLAN_ID": this.selectedmembership.ID != undefined && this.selectedmembership.ID != '' ? this.selectedmembership.ID : null,
                USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                EVENT_DETAIL_ID: this.bookingMeta?.ID,
                VENUE_ID: this.selectedVenue?.id,
                EVENT_ID: this.eventID,
                CATEGORY_ID: this.selectedcategoryId,
                CITY_ID: this.selectedVenue?.CITY_ID,
                USER_RESERVED_TICKET_COUNT: this.USER_RESERVED_TICKET_COUNT,
                IS_RESERVED_TICKETS: this.draftselectedmember?.IS_RESERVED_TICKETS,
                PLAN_NAME: this.selectedmembership?.ID != undefined && this.selectedmembership?.ID != '' ? this.selectedmembership?.NAME : '',

            }

            // var obj = {
            //     "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
            //     "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
            //     "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
            //     "LOG_TYPE": "INFO",
            //     "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
            //     "LOG_TEXT": "Remove Membership",
            //     "USER_DATA": JSON.stringify(payload)
            // }

            // this.apiService.actionLogsAdd(obj).subscribe({
            //     next: (data: any) => {
            //     }
            // });
            this.apiService.removememberDATAwithoutcalulationopenapi(payload).subscribe({
                next: (successCode: any) => {
                    var obj = {
                        "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
                        "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                        "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                        "LOG_TYPE": "INFO",
                        "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                        "LOG_TEXT": "Remove Membership Response",
                        "USER_DATA": JSON.stringify({
                            'request': payload,
                            'response': successCode
                        })
                    }

                    this.apiService.actionLogsAdd(obj).subscribe({
                        next: (data: any) => {
                        }
                    });
                    if (successCode.code == '200') {
                        this.loadBookingFlag = false
                        this.selectedmembership = []
                        this.draftselectedmember = []

                        if (this.Hoisting_Type == 'U') {
                            const filteredSeats = JSON.parse(
                                successCode.data?.SEAT_LAYOUT_JSON || this.bookingMeta?.SEAT_LAYOUT_JSON
                            );
                            const seatData = filteredSeats.filter((item: any) =>
                                (item.IS_DELETE == 1 || item.IS_DELETE == true) ||
                                    (item.IS_WEB_HIDE == 1 || item.IS_WEB_HIDE == true)
                                    ? false
                                    : true
                            );
                            seatData.sort((a: any, b: any) => Number(a.SEAT_PRICE) - Number(b.SEAT_PRICE));
                            this.tickets = seatData.map((seat: any) => ({
                                id: seat._id,
                                NAME: seat.SEAT_TYPE_NAME,
                                PRICE: Number(seat.SEAT_PRICE),
                                QTY: 0,
                                CAPACITY: Number(seat.CAPACITY || 0),
                                BOOKED: 0,
                                AVAILABLE: Number(seat.AVAILABLE_SEATS || 0) - Number(seat.TOTAL_BOOKED || 0),
                                PLAN_SEATS: Number(seat.PLAN_SEATS || 0) - Number(seat.PLAN_BOOKED || 0),
                                REGULAR_SEATS: Number(seat.REGULAR_SEATS || 0) - Number(seat.REGULAR_BOOKED || 0),
                                MAX_TICKETS: Number(seat.MAX_TICKETS || 0),
                                BOOKING_FEE: Number(seat.BOOKING_FEE || 0),
                                BOOKING_FEE_TYPE: seat.BOOKING_FEE_TYPE,
                                TOTAL_BOOKED: Number(seat.TOTAL_BOOKED || 0),
                                REGULAR_BOOKED: Number(seat.REGULAR_BOOKED || 0),
                                PLAN_BOOKED: Number(seat.PLAN_BOOKED || 0),
                                PERCENT_SOLD: (Number(seat.AVAILABLE_SEATS || 0) > 0
                                    ? ((Number(seat.TOTAL_BOOKED || 0) / Number(seat.AVAILABLE_SEATS || 0)) * 100).toFixed(2)
                                    : "0.00"),

                                AVAILABLE_SEATS: Number(seat.AVAILABLE_SEATS || 0),
                            }));
                        } else if (this.Hoisting_Type == 'S') {
                            const seatJson = JSON.parse(successCode.data?.SEAT_LAYOUT_JSON || this.seatJsonData);
                            this.seatJsonData = seatJson

                            this.changeDetectorRef.detectChanges();
                            // Wait for the browser to render DOM before accessing native element
                            setTimeout(() => {
                                requestAnimationFrame(() => {
                                    this.commonseatdata(seatJson);
                                });
                            });
                        }
                    }
                },
                error: () => {
                    this.loadBookingFlag = false
                    if (this.seatJsonData) {
                        setTimeout(() => {
                            requestAnimationFrame(() => {
                                this.commonseatdata(this.seatJsonData);
                            });
                        });
                    }
                }

            });
        } else {
            this.selectedmembership = []
            this.draftselectedmember = []
        }
    }
    clearmembership(event: any) {


        var payload: any
        if (this.selectedmembership?.ID) {
            payload =
            {
                ...this.allpayyload,
                "PLAN_ID": this.selectedmembership?.ID != undefined && this.selectedmembership?.ID != '' ? this.selectedmembership.ID : null,
                USER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                EVENT_DETAIL_ID: this.bookingMeta?.ID,
                VENUE_ID: this.selectedVenue.id,
                EVENT_ID: this.eventID,
                CATEGORY_ID: this.selectedcategoryId,
                CITY_ID: this.selectedVenue.CITY_ID,
                USER_RESERVED_TICKET_COUNT: this.USER_RESERVED_TICKET_COUNT,
                IS_RESERVED_TICKETS: this.draftselectedmember?.IS_RESERVED_TICKETS,
                PLAN_NAME: this.selectedmembership?.ID != undefined && this.selectedmembership?.ID != '' ? this.selectedmembership?.NAME : '',
            }
            if (event) {
                this.spinmembership = true;
            } else {
                this.cuponloading = true;

            }

            // var obj = {
            //     "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
            //     "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
            //     "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
            //     "LOG_TYPE": "INFO",
            //     "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
            //     "LOG_TEXT": "Remove Membership",
            //     "USER_DATA": JSON.stringify(payload)
            // }

            // this.apiService.actionLogsAdd(obj).subscribe({
            //     next: (data: any) => {
            //     }
            // });


            this.apiService.removemembershipDATA(payload).subscribe({
                next: (successCode: any) => {
                    var obj = {
                        "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
                        "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                        "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                        "LOG_TYPE": "INFO",
                        "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                        "LOG_TEXT": "Remove Membership Response",
                        "USER_DATA": JSON.stringify({
                            'request': payload,
                            'response': successCode
                        })
                    }

                    this.apiService.actionLogsAdd(obj).subscribe({
                        next: (data: any) => {
                        }
                    });
                    if (successCode.code == '200') {

                        this.selectedmembership = []
                        this.draftselectedmember = []
                        this.toastr.success(
                            'Membership removed successfully.',
                            'Success'
                        );
                        // const modal1 = document.getElementById('offerModal');
                        this.paymentdata = successCode;
                        this.paymentdata.finalAmountwords = this.commonFunction.amountInWords(this.paymentdata.finalAmount);
                        this.spinmembership = false;
                        this.cuponloading = false;

                    } else {
                        this.membershiploading = false;
                        this.cuponloading = false;
                        this.toastr.error('Failed to Apply Membership. Please try again.', 'Error');

                    }

                },
                error: () => {
                    this.spinmembership = false;
                    this.cuponloading = false;
                    this.toastr.error(
                        'Error in Apply Membership. Please try again later.',
                        'Error'
                    );
                },
                complete: () => {
                    this.spinmembership = false;
                    this.cuponloading = false;
                },
            });


        }
    }

    spinmembership: boolean = false
    membershiplist: any = []
    showmembershipModal() {

        const userID = this.memberId;

        if (!userID) {
            this.toastr.info('Please Login First ');
            return;
        } else {
            this.spinmembership = true
            var dataaa = {
                CATEGORY_ID: this.selectedcategoryId.toString(),
                EVENT_ID: this.EVENT_SCHEDULE_ID,
                VENUE_ID: this.selectedVenue.id ? this.selectedVenue.id : 0,
                CITY_ID: this.selectedVenue.CITY_ID ? this.selectedVenue.CITY_ID : 0,
                USER_ID: this.memberId,
            }

            this.apiService
                .getApplicableMembershipDATA(dataaa

                )
                .subscribe(
                    (data: any) => {
                        if (data?.code == 200) {
                            this.membershiplist = data?.data
                            //
                            const modalElement = document.getElementById('offerModal');
                            if (modalElement) {
                                const modal = new bootstrap.Modal(modalElement);
                                modal.show();

                            }

                            this.spinmembership = false

                        } else {

                        }

                    },
                    (error: any) => {
                        //console.error('Error fetching theaters:', error);

                    }
                );

        }


    }

    // Add this method to component:
    trackBySection(index: number, item: any) {
        return item.SN || index;
    }

    trackByRow(index: number, item: any) {
        return item.RN || index;
    }

    trackBySeat(index: number, item: any) {
        return item.id || item.N || index;
    }


    seatsLoaded = false;
    parseLayoutInWorker(seatLayoutString: string) {
        if (typeof Worker != 'undefined') {

            const worker = new Worker(new URL('../../seat-parser.worker', import.meta.url), { type: 'module' });


            worker.onmessage = ({ data }) => {
                if (data.error) {
                    //
                    return;
                }

                this.SCREEN_MASTER.LAYOUT_JSON = data.layout;
                this.seatsLoaded = true; // signal to render
            };

            worker.onerror = (err) => {

                //
            };


            this.seatsLoaded = false; // show loader
            worker.postMessage(seatLayoutString); // send stringified layout
        } else {
            // fallback (older browsers)

            this.SCREEN_MASTER.LAYOUT_JSON = JSON.parse(seatLayoutString);
            this.seatsLoaded = true;
        }
    }
    goback() {
        this.router.navigate(['/home']).then(() =>
            window.location.reload()
        );

    }

    loadingforprint: boolean = false

    printTicket(filenameee: any) {
        this.loadingforprint = true
        setTimeout(() => {
            this.loadingforprint = false
            window.open(this.apiService.retriveimgUrl + 'tickets/' + this.BOOKING_PDF, '_blank');

        }, 3000)
    }

    releasetticket() {
        var payload: any;
        const tempid = localStorage.getItem('deviceId');
        if (
            (this.selectedSeats1 && this.Hoisting_Type == 'U')) {
            this.loadBookingFlag = true;

            payload = {
                SEAT_NUMBERS: this.allpayyload?.SEAT_NUMBERS,
                HOSTING_TYPE: this.Hoisting_Type,
                RESERVATION_MODE: this.selectedVenue.RESERVATION_MODE,
                EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                TEMP_UNIQUE_ID: tempid,
                SESSION_ID: this.SESSION_ID,
                IS_PLAN_USED: !!this.selectedmembership?.ID,
                BENEFIT_APPLY: this.BENEFIT_APPLY,
                TEMP_HOLD_ID: this.TEMP_HOLD_ID,
                PLAN_ID:
                    this.selectedmembership?.ID != undefined &&
                        this.selectedmembership?.ID != ''
                        ? this.selectedmembership.ID
                        : null,
                MEMBER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                ...this.allpayyload,
            };



            this.apiService.releaseSeat(payload).subscribe({
                next: (successCode: any) => {
                    var res = Object.assign({}, successCode);
                    if (this.Hoisting_Type == 'C') {
                        res.data = {}
                    }
                    var obj = {
                        "TEMP_UNIQUE_ID": tempid,
                        "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                        "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                        "LOG_TYPE": "INFO",
                        "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                        "LOG_TEXT": "Seat Release Response",
                        "USER_DATA": JSON.stringify({
                            'request': payload,
                            'response': res
                        })
                    }

                    this.apiService.actionLogsAdd(obj).subscribe({
                        next: (data: any) => {
                        }
                    });
                    this.loadBookingFlag = false;
                    if (successCode.code == '200') {
                        this.selectedSeatsIndex = [];
                        this.selectedSeatsIDs = [];
                        this.selectedSeats1 = [];
                        this.selectedmembership = [];
                        this.draftselectedmember = [];
                        if (this.Hoisting_Type == 'U') {
                            const filteredSeats = JSON.parse(
                                successCode.data ||
                                this.bookingMeta?.SEAT_LAYOUT_JSON
                            );
                            const seatData = filteredSeats.filter((item: any) =>
                                (item.IS_DELETE == 1 || item.IS_DELETE == true) ||
                                    (item.IS_WEB_HIDE == 1 || item.IS_WEB_HIDE == true)
                                    ? false
                                    : true
                            );
                            seatData.sort((a: any, b: any) => Number(a.SEAT_PRICE) - Number(b.SEAT_PRICE));
                            this.tickets = seatData.map((seat: any) => ({
                                id: seat._id,
                                NAME: seat.SEAT_TYPE_NAME,
                                PRICE: Number(seat.SEAT_PRICE),
                                QTY: 0,
                                CAPACITY: Number(seat.CAPACITY || 0),
                                BOOKED: 0,
                                AVAILABLE:
                                    Number(seat.AVAILABLE_SEATS || 0) -
                                    Number(seat.TOTAL_BOOKED || 0),
                                PLAN_SEATS:
                                    Number(seat.PLAN_SEATS || 0) - Number(seat.PLAN_BOOKED || 0),
                                REGULAR_SEATS:
                                    Number(seat.REGULAR_SEATS || 0) -
                                    Number(seat.REGULAR_BOOKED || 0),
                                MAX_TICKETS: Number(seat.MAX_TICKETS || 0),
                                BOOKING_FEE: Number(seat.BOOKING_FEE || 0),
                                BOOKING_FEE_TYPE: seat.BOOKING_FEE_TYPE,
                                TOTAL_BOOKED: Number(seat.TOTAL_BOOKED || 0),
                                REGULAR_BOOKED: Number(seat.REGULAR_BOOKED || 0),
                                PLAN_BOOKED: Number(seat.PLAN_BOOKED || 0),
                                PERCENT_SOLD:
                                    Number(seat.AVAILABLE_SEATS || 0) > 0
                                        ? (
                                            (Number(seat.TOTAL_BOOKED || 0) /
                                                Number(seat.AVAILABLE_SEATS || 0)) *
                                            100
                                        ).toFixed(2)
                                        : '0.00',

                                AVAILABLE_SEATS: Number(seat.AVAILABLE_SEATS || 0),
                                PLAN_SEATSss:
                                    Number(seat.PLAN_SEATS || 0) - Number(seat.PLAN_BOOKED || 0),
                                REGULAR_SEATSss:
                                    Number(seat.REGULAR_SEATS || 0) -
                                    Number(seat.REGULAR_BOOKED || 0),
                                reveredselectedseat: 0,
                            }));
                            this.dummytickets = JSON.parse(JSON.stringify(this.tickets));
                        } else if (this.Hoisting_Type == 'C') {
                            this.SCREEN_MASTER.LAYOUT_JSON = successCode.dataF ||
                                this.dummylayoutforcharted;


                            this.dummylayoutforcharted = [...this.SCREEN_MASTER.LAYOUT_JSON];

                        } else {
                            this.SCREEN_MASTER.LAYOUT_JSON = successCode.data
                                ? JSON.parse(successCode.data)
                                : this.dummylayoutforcharted;
                        }
                        this.loadBookingFlag = false;
                    }
                },
                error: () => {
                    this.loadBookingFlag = false;
                    this.selectedSeatsIndex = [];
                    this.selectedSeatsIDs = [];
                    this.selectedSeats1 = [];
                    this.selectedmembership = [];
                    this.draftselectedmember = [];
                    this.SCREEN_MASTER.LAYOUT_JSON = this.dummylayoutforcharted;
                },
            });
        }
    }
    seatReleaseWithoutJson() {
        const tempid = localStorage.getItem('deviceId');
        var payload: any;
        if (
            (this.selectedSeats1 && this.Hoisting_Type == 'U') ||
            (this.Hoisting_Type == 'C' && this.selectedSeatsIndex.length > 0)
        ) {
            this.loadBookingFlag = true;

            payload = {
                SEAT_NUMBERS: this.allpayyload?.SEAT_NUMBERS,
                HOSTING_TYPE: this.Hoisting_Type,
                RESERVATION_MODE: this.selectedVenue.RESERVATION_MODE,
                EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                TEMP_UNIQUE_ID: tempid,
                SESSION_ID: this.SESSION_ID,
                IS_PLAN_USED: !!this.selectedmembership?.ID,
                BENEFIT_APPLY: this.BENEFIT_APPLY,
                TEMP_HOLD_ID: this.TEMP_HOLD_ID,
                PLAN_ID:
                    this.selectedmembership?.ID != undefined &&
                        this.selectedmembership?.ID != ''
                        ? this.selectedmembership.ID
                        : null,
                MEMBER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                ...this.allpayyload,
            };

            // var obj = {
            //     "TEMP_UNIQUE_ID": tempid,
            //     "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
            //     "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
            //     "LOG_TYPE": "INFO",
            //     "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
            //     "LOG_TEXT": "Seat Release on cancelled",
            //     "USER_DATA": JSON.stringify(payload)
            // }

            // this.apiService.actionLogsAdd(obj).subscribe({
            //     next: (data: any) => {
            //     }
            // });

            this.apiService.seatReleaseWithoutJson(payload).subscribe({
                next: (successCode: any) => {
                    var res = Object.assign({}, successCode);
                    if (this.Hoisting_Type == 'C') {
                        res.data = {}
                    }
                    var obj = {
                        "TEMP_UNIQUE_ID": tempid,
                        "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                        "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                        "LOG_TYPE": "INFO",
                        "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                        "LOG_TEXT": "Seat Release Response On cancelled",
                        "USER_DATA": JSON.stringify({
                            'request': payload,
                            'response': res
                        })
                    }

                    this.apiService.actionLogsAdd(obj).subscribe({
                        next: (data: any) => {
                        }
                    });
                    this.loadBookingFlag = false;
                    if (successCode.code == '200') {
                        this.selectedSeatsIndex = [];
                        this.selectedSeatsIDs = [];
                        this.selectedSeats1 = [];
                        this.selectedmembership = [];
                        this.draftselectedmember = [];

                        this.loadBookingFlag = false;
                    }
                },
                error: () => {
                    this.loadBookingFlag = false;
                    this.selectedSeatsIndex = [];
                    this.selectedSeatsIDs = [];
                    this.selectedSeats1 = [];
                    this.selectedmembership = [];
                    this.draftselectedmember = [];

                },
            });
        }
    }

    goBacks() {
        const target = document.getElementById('tugoz-container') as HTMLElement;
        if (target) {
            target.style.display = 'none';
        }
        try {

            this.location.back();
        } catch (error) {
            this.router.navigate(['/home'], { replaceUrl: true }); // fallback
        }
        if (this.istugoz == true)
            this.closeTugoz();


    }
    tugozid: any = 0;
    istugoz = false;

    handleAllRemovalAndRelease() {
        this.loadBookingFlag = true;
        const tempid = localStorage.getItem('deviceId');
        // const memberrrrrrid = this.userID ? this.userID : this.withoutloginmemberid;


        let couponCall = of(null);
        let releaseCall = of(null);
        if (this.coupanapplies) {
            // const couponPayload = {
            //     COUPON_CODE: this.applycode,
            //     MEMBER_ID: memberrrrrrid,
            // };
            const couponPayload =
            {
                // ...this.allpayyload,
                // "COUPON_ID": this.selectedcupon.ID,
                COUPON_CODE: this.applycode,
                MEMBER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                EVENT_DETAIL_ID: this.bookingMeta?.ID,
                // VENUE_ID: this.selectedVenue.id,
                // EVENT_ID: this.eventID,
                // CATEGORY_ID: this.selectedcategoryId,
                // CITY_ID: this.selectedVenue.CITY_ID,

                SESSION_ID: this.SESSION_ID,
                "TEMP_UNIQUE_ID": tempid,
                CART_ID: null,
                "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
            }

            // const couponPayload =
            // {

            //     "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
            //     "TEMP_UNIQUE_ID": tempid,
            //     SESSION_ID: this.SESSION_ID,
            //     COUPON_CODE: this.applycode,
            //     MEMBER_ID: this.userID ? this.userID : this.withoutloginmemberid,
            //     EVENT_DETAIL_ID: this.bookingMeta?.ID,
            //     VENUE_ID: this.selectedVenue.id,
            //     EVENT_ID: this.eventID,
            //     CATEGORY_ID: this.selectedcategoryId,
            //     CITY_ID: this.selectedVenue.CITY_ID
            // }

            // var obj = {
            //     "TEMP_UNIQUE_ID": tempid,
            //     "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
            //     "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
            //     "LOG_TYPE": "INFO",
            //     "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
            //     "LOG_TEXT": "Coupon Remove Combine",
            //     "USER_DATA": JSON.stringify(couponPayload)
            // }

            // this.apiService.actionLogsAdd(obj).subscribe({
            //     next: (data: any) => {
            //     }
            // });

            couponCall = this.apiService.removeCouponDATA(couponPayload).pipe(
                catchError(() => of(null))
            );
        } else {
            this.coupanapplies = false;
            this.applycode = '';
            this.selectedcupon = [];
        }
        if ((this.selectedSeats1 && this.Hoisting_Type == 'U') || (this.Hoisting_Type == 'C' && this.selectedSeatsIndex.length > 0)) {
            const releasePayload = {
                // SEAT_NUMBERS: this.allpayyload?.SEAT_NUMBERS,
                // HOSTING_TYPE: this.Hoisting_Type,
                // EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                // TEMP_UNIQUE_ID: tempid,
                // RESERVATION_MODE: this.selectedVenue.RESERVATION_MODE,
                // ...this.allpayyload


                SEAT_NUMBERS: this.allpayyload?.SEAT_NUMBERS,
                HOSTING_TYPE: this.Hoisting_Type,
                RESERVATION_MODE: this.selectedVenue.RESERVATION_MODE,
                EVENT_TICKET_BOOKING_ID: this.bookingMeta?.ID,
                TEMP_UNIQUE_ID: tempid,
                SESSION_ID: this.SESSION_ID,
                IS_PLAN_USED: !!this.selectedmembership?.ID,
                PLAN_ID:
                    this.selectedmembership?.ID != undefined &&
                        this.selectedmembership?.ID != ''
                        ? this.selectedmembership.ID
                        : null,
                MEMBER_ID: this.userID ? this.userID : this.withoutloginmemberid,
                ...this.allpayyload,
            };
            // var obj = {
            //     "TEMP_UNIQUE_ID": tempid,
            //     "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
            //     "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
            //     "LOG_TYPE": "INFO",
            //     "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
            //     "LOG_TEXT": "Seat Release Combine",
            //     "USER_DATA": JSON.stringify(releasePayload)
            // }

            // this.apiService.actionLogsAdd(obj).subscribe({
            //     next: (data: any) => {
            //     }
            // });
            releaseCall = this.apiService.releaseSeat(releasePayload).pipe(
                catchError(() => of(null))
            );


        }
        forkJoin([couponCall, releaseCall]).subscribe({
            next: () => {
                var obj = {
                    "TEMP_UNIQUE_ID": tempid,
                    "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                    "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                    "LOG_TYPE": "INFO",
                    "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                    "LOG_TEXT": "Seat Release Combine Success",
                    "USER_DATA": JSON.stringify({ releaseCall, couponCall })
                }

                this.apiService.actionLogsAdd(obj).subscribe({
                    next: (data: any) => {
                    }
                });
                this.loadBookingFlag = false;
                this.coupanapplies = false;
                this.applycode = '';
                this.selectedcupon = [];
                setTimeout(() => {
                    this.clearSessionIdOnUnload = this.activeStep !== 3;
                    location.reload();
                }, 1000);

            },
            error: () => {
                var obj = {
                    "TEMP_UNIQUE_ID": tempid,
                    "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                    "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                    "LOG_TYPE": "INFO",
                    "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                    "LOG_TEXT": "Seat Release Combine Error",
                    "USER_DATA": JSON.stringify({ releaseCall, couponCall })
                }

                this.apiService.actionLogsAdd(obj).subscribe({
                    next: (data: any) => {
                    }
                });
                this.loadBookingFlag = false;
                setTimeout(() => {
                    this.clearSessionIdOnUnload = this.activeStep !== 3;
                    location.reload();
                }, 1000);

            }
        });
    }
    generateQRCode(): any {
        let qrText = "{'Booking_Code':'" + this.BOOKING_CODE + "'}";
        try {
            const qrCodeDataURL = QRCode.toDataURL(qrText);
            qrCodeDataURL;
        } catch (err) {
            // console.error('QR code generation failed', err);
        }
    }

    qrCodeDataURL: any = ''
    ticketData: any;
    formatToDDMMYYYY111(inputDate: any): string {
        let date: Date;

        if (!inputDate) return 'Invalid date';

        // DD-MM-YYYY (SAFE)
        if (/^\d{2}-\d{2}-\d{4}$/.test(inputDate)) {
            const [day, month, year] = inputDate.split('-');
            date = new Date(+year, +month - 1, +day);
        }

        // YYYY-MM-DD (SAFE)
        else if (/^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
            const [year, month, day] = inputDate.split('-');
            date = new Date(+year, +month - 1, +day);
        }

        // Date object (SAFE)
        else if (inputDate instanceof Date) {
            date = inputDate;
        }

        // ❌ Block everything else (prevents timezone bugs)
        else {
            return 'Invalid date';
        }

        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }

        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();

        return `${yyyy}-${mm}-${dd}`; // or `${dd}-${mm}-${yyyy}`
    }

    // formatToDDMMYYYY111(inputDate: any): string {
    // let date: Date;

    // // Handle DD-MM-YYYY input
    // if (/^\d{2}-\d{2}-\d{4}$/.test(inputDate)) {
    // const [day, month, year] = inputDate.split('-');
    // date = new Date(`${year}-${month}-${day}`);
    // } else {
    // date = new Date(inputDate);
    // }

    // if (isNaN(date.getTime())) {
    // return 'Invalid date';
    // }

    // const day = String(date.getDate()).padStart(2, '0');
    // const month = String(date.getMonth() + 1).padStart(2, '0');
    // const year = date.getFullYear();

    // // return `${day}-${month}-${year}`;
    // return `${year}-${month}-${day}`;

    // }
    // generateUniqueKey(prefix = 'KEY', keyLength = 6): string {
    //     const WINDOW_NAME_FLAG = 'is_not_duplicate';
    //     if ((sessionStorage.getItem('sessionid') == undefined || sessionStorage.getItem('sessionid') == null) || window.name != WINDOW_NAME_FLAG) {
    //         const now = new Date();
    //         const dateTime = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    //         const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    //         let randomKey = '';
    //         for (let i = 0; i < keyLength; i++) {
    //             randomKey += chars.charAt(Math.floor(Math.random() * chars.length));
    //         }
    //         window.name = WINDOW_NAME_FLAG;
    //         sessionStorage.setItem('sessionid', `${prefix}-${dateTime}-${randomKey}`);
    //         return `${prefix}-${dateTime}-${randomKey}`;
    //     } else {

    //         return sessionStorage.getItem('sessionid')!;
    //     }
    // }

    generateTabSessionId(prefix = 'KEY', keyLength = 6): string {
        const TAB_KEY = 'sessionid';
        const WINDOW_FLAG = 'tab_initialized';
        const TAB_UUID_KEY = 'all_open_tabs';

        // 1️⃣ Reload → return same session
        if (window.name == WINDOW_FLAG && sessionStorage.getItem(TAB_KEY)) {
            return sessionStorage.getItem(TAB_KEY)!;
        }

        // 2️⃣ Generate per-tab UUID (cloned in duplicate tabs)
        let myUUID = sessionStorage.getItem('TAB_UUID');
        if (!myUUID) {
            myUUID = Math.random().toString(36).substring(2);
            sessionStorage.setItem('TAB_UUID', myUUID);
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
            // console.log('sessionId=>', sessionId);
            sessionStorage.setItem(TAB_KEY, sessionId);
        } else {
            sessionId = sessionStorage.getItem(TAB_KEY)!;
        }

        window.name = WINDOW_FLAG;
        return sessionId;
    }





    dummytickets = []
    planselecteduseddata: any;
    ALREADY_USED_COUNT = 0;
    USED_COUNT = 0;
    applyformembershipnew() {
        this.selectedmembership = this.draftselectedmember;
        this.draftselectedmember = []
        this.planselecteduseddata = []
        this.tickets = [];
        this.selectedCount = 2;
        this.selectedSeats1 = [];
        this.selectedSeatsIDs = [];
        this.selectedSeatsIndex = [];
        this.PRSelectedSeatCount = 0;
        this.tickets = JSON.parse(JSON.stringify(this.dummytickets));
        this.ALREADY_USED_COUNT = 0
        var filter = { SUBSCRIPTION_PLAN_ID: this.selectedmembership.ID, EVENT_SCHEDULE_DETAILS_ID: this.EVENT_SCHEDULE_ID }
        this.apiService
            .selectPlan(
                filter, this.bookingMeta?.ID, this.userID, this.selectedmembership.ID, localStorage.getItem('deviceId'), this.SESSION_ID
            )
            .subscribe((data) => {
                if (data['code'] == 200) {
                    this.planselecteduseddata = data['data'][0];

                    // if (data.TEMP_UNIQUE_ID != undefined && data.TEMP_UNIQUE_ID != null && data.TEMP_UNIQUE_ID != '' && data.TEMP_UNIQUE_ID != ' ')
                    //     localStorage.setItem('deviceId', data.TEMP_UNIQUE_ID);

                    this.ALREADY_USED_COUNT = data.ALREADY_USED_COUNT;
                    this.USED_COUNT = Number(this.selectedmembership.MAX_OCCURENCES) - Number(data.USED_COUNT);

                    this.selectedSeatCount = 2;
                    const modal1 = document.getElementById('offerModal');
                    if (modal1) {
                        const bootstrapModal1 = bootstrap.Modal.getInstance(modal1) || new bootstrap.Modal(modal1);
                        bootstrapModal1.hide();
                    }
                    this.cuponloading = false;
                } else if (data['code'] == 409) {
                    this.toastr.error('Something went wrong, try again.', 'Error');
                    this.planselecteduseddata = [];
                    this.ALREADY_USED_COUNT = 0;
                    this.USED_COUNT = 0;
                    this.selectedSeatCount = 0;
                    this.draftselectedmember = [];
                    this.selectedmembership = [];
                    this.cuponloading = false;
                    this.clearSessionId();
                    this.SESSION_ID = this.generateTabSessionId();
                } else {
                }
            }, err => {
                this.toastr.error('Something went wrong, try again.', 'Error');
                this.planselecteduseddata = [];
                this.ALREADY_USED_COUNT = 0;
                this.USED_COUNT = 0;
                this.draftselectedmember = [];
                this.selectedmembership = [];
                this.selectedSeatCount = 0;
                this.cuponloading = false;
                this.clearSessionId();
                this.SESSION_ID = this.generateTabSessionId();
            });
    }

    clearmembershipnew() {
        var id = this.selectedmembership.ID
        this.selectedmembership = []
        this.planselecteduseddata = []
        this.draftselectedmember = []

        this.spinmembership = false;
        this.cuponloading = false;
        if (this.Hoisting_Type == 'U') {
            this.tickets = []
            this.tickets = JSON.parse(JSON.stringify(this.dummytickets));
        }
        if (id != undefined && id != null && id != '') {
            this.apiService
                .removeSelectedPlan(
                    this.bookingMeta?.ID, this.userID, id, localStorage.getItem('deviceId'), this.SESSION_ID
                )
                .subscribe((data) => {
                    if (data['code'] == 200) {
                    }
                })
        }

    }


    changemobile() {
        this.otp = ['', '', '', '', '', ''];
        const modal2 = document.getElementById('forverifyotp');
        const bootstrapModal2 = bootstrap.Modal.getInstance(modal2) || new bootstrap.Modal(modal2);
        bootstrapModal2.hide();
    }

    isAddDisabled(ticket: any): boolean {
        const maxTickets = ticket.MAX_TICKETS;
        const currentQty = ticket.QTY;
        var totalAvailable = 0
        if (!this.memberId || !this.selectedmembership?.ID || this.selectedVenue.RESERVATION_MODE == 'V') {
            totalAvailable = ticket.REGULAR_SEATS;
        } else {
            totalAvailable = ticket.AVAILABLE;
        }




        return (
            totalAvailable <= 0 ||
            currentQty >= totalAvailable ||
            currentQty >= maxTickets
        );
    }

    toMySQLTime(time12h: string): string {
        const [time, modifier] = time12h.split(' '); // ["12:25", "AM"]
        let [hours, minutes] = time.split(':').map(Number);

        if (modifier == 'AM' && hours == 12) {
            hours = 0; // 12 AM -> 00
        }
        if (modifier == 'PM' && hours != 12) {
            hours += 12; // add 12 for PM (except 12 PM)
        }

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    }

    getTicketStatusLabel(percent: number): string {

        if (percent == 100) return 'Sold Out';
        if (percent >= 90) return 'Almost Sold Out';
        if (percent >= 70) return 'Filling Fast';
        return '';
    }
    formFields: any = []

    userExtraInfo: any = {};


    formData: any = {};
    EXTRA_INFORMATION_DATA: any
    onSubmit2(form: NgForm) {
        if (!form.valid) {
            this.toastr.error('Please fill all the required fields ', '');
            return;
        }

        for (let field of this.formFields) {
            let value = this.userExtraInfo[field.model];

            if (field.type == 'date-range') {
                const start = this.userExtraInfo[field.model + '_start'];
                const end = this.userExtraInfo[field.model + '_end'];

                if (field.required && (!start || !end)) {
                    this.toastr.error(`Please select both start and end dates for "${field.label}".`);
                    return;
                }
                continue;
            }

            if (field.required) {
                if (!value || value.toString().trim() == '') {
                    this.toastr.error(`"${field.label}" is required. Please provide a valid value.`);
                    return;
                }

                if (field.pattern && value) {
                    try {
                        let sanitized = field.pattern.replace(/^\/|\/$/g, '');
                        sanitized = sanitized.replace(/(\W|^)d(\{[0-9,]+\}|[+*?])/g, '$1\\d$2');
                        const regex = new RegExp(sanitized);
                        if (!regex.test(value)) {
                            this.toastr.error(`"${field.label}" does not match the required format.`);
                            return;
                        }
                    } catch (e) {
                        // console.warn(`Invalid regex for ${field.label}: ${field.pattern}`);
                    }
                }

                if ((field.type == 'mobile' || field.label.toLowerCase().includes("mobile")) && value) {
                    if (!/^[6-9]\d{9}$/.test(value)) {
                        this.toastr.error(`Please enter a valid 10-digit mobile number for "${field.label}".`);
                        return;
                    }
                }

                if ((field.type == 'email' || field.label.toLowerCase().includes("email")) && value) {
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        this.toastr.error(`Please enter a valid email address for "${field.label}".`);
                        return;
                    }
                }
            }
        }

        if (form.valid) {
            const labelValueData: any = {};
            this.formFields.forEach((field: any) => {
                if (field.type == 'Range Picker' || field.DATE_PICKER_TYPE == 'Range Picker') {
                    labelValueData[field.label] = [this.userExtraInfo[field.model + '_start'], this.userExtraInfo[field.model + '_end']];
                } else {
                    labelValueData[field.label] = this.userExtraInfo[field.model];
                }
            });

            this.EXTRA_INFORMATION_DATA = labelValueData;
            this.closeModal();
            this.proceed();
            // this.toastr.success('Extra Information Saved Successfully.');
        }

    }
    handleInput(event: any, field: any) {
        const value = event.target.value;
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

        if (field.VALIDATION_PATTERN == "/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/") {
            event.target.value = value.toUpperCase();
            this.userExtraInfo[field.model] = event.target.value;
        }

        if (this.userExtraInfo?.controls[field.name]) {
            this.userExtraInfo.controls[field.name].markAsUntouched();
        }
    }

    onCancel(form: NgForm) {
        form.resetForm();
        this.userExtraInfo = {};
    }



    formSubmitted = false


    closeModal() {
        const modal = document.getElementById('dynamicFormModal');
        if (modal) {
            const bootstrapModal1 = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
            bootstrapModal1.hide();
        }
    }

    onMultiCheckboxChange(event: any, model: string) {
        if (!this.userExtraInfo[model]) {
            this.userExtraInfo[model] = [];
        }

        const selectedOptions = this.userExtraInfo[model];
        const value = event.target.value;

        if (event.target.checked) {
            selectedOptions.push(value);
        } else {
            const index = selectedOptions.indexOf(value);
            if (index > -1) selectedOptions.splice(index, 1);
        }
    }
    onMultiSelectChange(event: any, model: string) {
        const selected: string[] = Array.from(event.target.selectedOptions).map((o: any) => o.value);
        this.userExtraInfo[model] = selected;
    }



    getextraInfo(apiFields: any) {
        this.formFields = apiFields.map((field: any) => {
            let type = '';
            let options = [];

            switch (field.INPUT_TYPE.toLowerCase()) {
                case 'email':
                    type = 'email';
                    break;
                case 'mobile number':
                    type = 'mobile';
                    break;
                case 'text':
                    type = 'text';
                    break;
                case 'number':
                    type = 'number';
                    break;
                case 'input':
                    type = 'text';
                    break;
                case 'input number':
                    type = 'number';
                    break;
                case 'text area':
                    type = 'textarea';
                    break;
                case 'radio button':
                    type = 'radio';
                    break;
                case 'checkbox':
                    type = 'multi-checkbox';
                    break;
                case 'select':
                    type = field.DROPDOWN_TYPE?.toLowerCase() == 'multi select'
                        ? 'multi-select'
                        : 'select';
                    break;
                case 'date picker':
                    type = field.DATE_PICKER_TYPE?.toLowerCase() == 'range picker' ? 'date-range' : 'date';
                    break;
                case 'time picker':
                    type = 'time';
                    break;
                case 'switch':
                    type = 'switch';
                    break;

                case 'range':
                    type = 'range';
                    break;
            }

            try {
                options = JSON.parse(field.OPTIONS || '[]').map((opt: any) => ({
                    label: opt.OPTION_LABEL || '',
                    value: opt.OPTION_VALUE || ''
                }));
            } catch {
                options = [];
            }

            return {
                ...field,
                type,
                name: field.NG_MODEL,
                model: field.NG_MODEL,
                label: field.LABEL_NAME,
                placeholder: field.PLACEHOLDER,
                required: !!field.IS_REQUIRED,
                pattern: field.VALIDATION_PATTERN && field.VALIDATION_PATTERN.toLowerCase() != 'none'
                    ? field.VALIDATION_PATTERN
                    : null,
                options
            };
        });


    }
    // @ViewChild('ctrl', { static: false }) ctrl!: NgModel;


    emailpattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
    mobilepattern = /^[6-9]\d{9}$/;


    getSanitizedPattern(rawPattern: string | null): string {
        if (!rawPattern || rawPattern == 'None') return '';
        let sanitized = rawPattern.replace(/^\/|\/$/g, '');
        sanitized = sanitized.replace(/(\W|^)d(\{[0-9,]+\})/g, '$1\\d$2');

        return sanitized;
    }


    to12HourFormat(time: string | undefined | null): string {
        if (!time) return "";

        let hours: number, minutes: number;

        // Case 1: 24-hour format like 18:04 or 18:04:00
        if (/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(time)) {
            const parts = time.split(":");
            hours = parseInt(parts[0], 10);
            minutes = parseInt(parts[1], 10);
        }
        // Case 2: Already in 12-hour format (just return normalized)
        else if (/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(time)) {
            return time.toUpperCase().replace(/\s+/, " ");
        }
        else {
            return time; // Unknown format, return as is
        }

        // Convert to 12-hour
        const suffix = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; // Convert "0" to "12"
        const formatted = `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")} ${suffix}`;

        return formatted;
    }

    private tugozInstance: any;

    private openTugoz() {
        if (!this.tugozid) return;
        const target = document.getElementById('tugoz-container') as HTMLElement;
        if (target) {
            target.style.display = 'block';
        }


        setTimeout(() => {
            const el = document.querySelector('.overlay') as HTMLElement;
            if (el) el.style.display = 'none';
            const loader1 = document.querySelector('#loadingDiv') as HTMLElement | null;
            if (loader1) {
                loader1.style.display = 'none';
            }
        }, 100);
        let loadingDivRemoveCount = 0;

        const observer = new MutationObserver(() => {
            const loader1 = document.querySelector('#loadingDiv') as HTMLElement | null;
            // console.log('here1');
            // Handle #loadingDiv (allow removing twice)
            if (loader1) {
                setTimeout(() => {
                    loader1.style.display = 'none';
                    this.loadBookingFlag2 = false;
                }, 4000);
                loadingDivRemoveCount++;

            } else {
                setTimeout(() => {
                    this.loadBookingFlag2 = false;
                }, 4000);

            }

            // Disconnect observer only if both conditions satisfied
            if (loadingDivRemoveCount >= 1) {
                observer.disconnect();
                // console.log('Stopped observing (all loaders handled)');
            }
        });


        if (target) {
            observer.observe(target, { childList: true, subtree: true });
            // console.log('here2');
            setTimeout(() => {
                this.loadBookingFlag2 = false;
            }, 4000);

        } else {
            this.loadBookingFlag2 = false;
            // console.log('here3');
            setTimeout(() => {
                this.loadBookingFlag2 = false;
            }, 4000);
        }
    }

    private closeTugoz() {
        if (this.tugozInstance) {
            try {
                // Tugoz doesn’t expose destroy API, so manually clean container
                const container = document.getElementById("tugoz-container");
                if (container) container.innerHTML = "";
                this.tugozInstance = null;
            } catch (e) {
                console.warn("Error while closing Tugoz:", e);
            }
        }
    }

    resendOtp() {
        this.otp = ['', '', '', '', '', ''];
        this.IS_RESEND = true;
        this.onSubmit({});
    }

    // resendOtp() {
    // this.otp = ['', '', '', '', '', '']
    // // this.startTimer();
    // // this.toastr.info('OTP has been resent. Please check your whats app.', 'Info');
    // this.IS_RESEND = true;
    // this.isSendingOtp = true;
    // this.getotpandverify = true;

    // const payload = {

    // "TYPE": "M",
    // "VALUE": this.user.MOBILE
    // };

    // this.apiService.sendOTPwhilebooking(payload).subscribe({
    // next: (successCode: any) => {
    // if (successCode.code == '200') {

    // this.toastr.success(
    // 'OTP has been resent. Please check your whats app.',
    // 'Success'
    // );
    // const modal = new bootstrap.Modal(document.getElementById('forverifyotp')!);
    // modal.show();
    // this.getotpandverify = false;
    // this.startTimer();
    // } else {
    // this.getotpandverify = false;
    // this.toastr.error('Failed to resend OTP. Please try again.', 'Error');
    // }

    // },
    // error: () => {

    // this.toastr.error(
    // 'Error in resending OTP. Please try again later.',
    // 'Error'
    // );
    // },
    // complete: () => {
    // this.isSendingOtp = false;
    // },
    // });
    // }

    VerifyOTP() {
        this.otpTouched = true;

        if (this.otpInvalid) {
            this.toastr.warning('Please enter a valid OTP.', 'Warning');
            return;
        }

        this.isverifyOTP = true;

        const data = {
            NAME: this.user.NAME,
            MOBILE_NO: this.user.MOBILE,
            EMAIL_ID: this.user.EMAIL,
            OTP: this.otp.join(''),
            "TYPE": "M",
            STATUS: true,
            IS_MOBILE_VERIFIED: true,
            IS_REGISTERED: true,
            CLIENT_ID: 1
        };

        this.loadingRecords = true;

        // var obj = {
        //     "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
        //     "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
        //     "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
        //     "LOG_TYPE": "INFO",
        //     "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
        //     "LOG_TEXT": "Verify OTP while booking",
        //     "USER_DATA": JSON.stringify(data)
        // }

        // this.apiService.actionLogsAdd(obj).subscribe({
        //     next: (data: any) => {
        //     }
        // });
        this.apiService.verifyOTPwhilebooking(data).subscribe({
            next: (successCode: any) => {
                var obj = {
                    "TEMP_UNIQUE_ID": localStorage.getItem('deviceId'),
                    "MEMBER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                    "USER_ID": this.userID ? this.userID : this.withoutloginmemberid,
                    "LOG_TYPE": "INFO",
                    "EVENT_TICKET_BOOKING_ID": this.bookingMeta?.ID,
                    "LOG_TEXT": "Verify OTP while booking Response",
                    "USER_DATA": JSON.stringify({
                        'request': data,
                        'response': successCode
                    })
                }

                this.apiService.actionLogsAdd(obj).subscribe({
                    next: (data: any) => {
                    }
                });
                if (successCode.code == 200) {
                    this.toastr.success('Otp Verified', 'Success');
                    this.isverifyOTP = false;
                    this.otp = ['', '', '', '', '', ''];
                    this.loadingRecords = false;
                    this.withoutloginmemberid = successCode.memberId
                    this.otpverifed = true
                    const modal2 = document.getElementById('forverifyotp');
                    const bootstrapModal2 = bootstrap.Modal.getInstance(modal2) || new bootstrap.Modal(modal2);
                    bootstrapModal2.hide();
                }
                else if (successCode.code == 301) {
                    this.toastr.success('Otp Verified', 'Success');

                    this.isverifyOTP = false;
                    this.otp = ['', '', '', '', '', ''];
                    this.loadingRecords = false;
                    this.withoutloginmemberid = successCode.memberId
                    this.otpverifed = true
                    const modal2 = document.getElementById('forverifyotp');
                    const bootstrapModal2 = bootstrap.Modal.getInstance(modal2) || new bootstrap.Modal(modal2);

                    bootstrapModal2.hide();
                    setTimeout(() => {
                        const backdrop = document.querySelector('.modal-backdrop');
                        if (backdrop) {
                            backdrop.remove();
                        }
                        document.body.classList.remove('modal-open');
                    }, 200);
                    // const modal2 = document.getElementById('forverifyotp');
                    // const bootstrapModal2 = bootstrap.Modal.getInstance(modal2) || new bootstrap.Modal(modal2);
                    bootstrapModal2.hide();
                }
                else if (successCode.code == 404) {
                    this.isverifyOTP = false;
                    this.toastr.error(
                        successCode.message || 'Invalid OTP for Mobile Number.',
                        'Error'
                    );
                } else {
                    this.isverifyOTP = false;
                    this.toastr.error(
                        'An unexpected error occurred. Please try again.',
                        'Error'
                    );
                }
            },
            error: (errorResponse: any) => {
                this.isverifyOTP = false;
                this.loadingRecords = false;
                const errorCode = errorResponse?.error?.code;
                // //console.error('verifyOTP API failed:', errorResponse);

                if (errorCode == 300) {

                    this.toastr.error(
                        'Invalid request. Please check the entered details.'
                    );
                } else {
                    this.toastr.error('Something went wrong. Please try again.');
                }
                this.loadingRecords = false;
            },
        });
    }


    @ViewChild('zoomWrapper', { static: true }) wrapper!: ElementRef<HTMLDivElement>;
    @ViewChild('zoomContent', { static: true }) content!: ElementRef<HTMLDivElement>;

    // getSectionData() {
    // const finalSectionList = [];
    // let maxWidth = 0;



    // for (const section of this.SCREEN_MASTER.LAYOUT_JSON) {
    // // Flatten all seats ignoring naming rows (N=0 && SNA=0)
    // const realSeats =
    // section.R?.flatMap(
    // (row: any) =>
    // row.ST?.filter((seat: any) => !(seat.N == 0 && seat.SNA == 0)) ||
    // []
    // ) || [];
    // // Skip section if all real seats are SNA=1
    // if (
    // realSeats.length > 0 &&
    // realSeats.every((seat: any) => seat.SNA == 1)
    // ) {
    // continue;
    // }
    // section.isEditable = false;
    // const firstRowSeats = section.R?.[0]?.ST?.length || 0;
    // const currentWidth = (firstRowSeats + 1) * 24;
    // if (currentWidth > maxWidth) {
    // maxWidth = currentWidth;
    // }
    // const seatTypeMap = new Map();
    // let totalSeats = 0;
    // let bookedSeats = 0;

    // for (const row of section.R || []) {
    // for (const seat of row.ST || []) {
    // if (seat.SNA == 1) continue;

    // totalSeats += 1;
    // if (seat.IB == 'B' || seat.IB == 'P') bookedSeats += 1;

    // const price = Number(seat.SP);
    // const color = seat.CB;
    // const key = `${price}-${color}`;
    // const bordercolor = section.CB;

    // const seatType = seatTypeMap.get(key) || {
    // price,
    // color,
    // totalSeats: 0,
    // bordercolor: 'black',
    // };
    // seatType.totalSeats += 1;
    // seatTypeMap.set(key, seatType);
    // }
    // }

    // let availability = 'Available';
    // if (bookedSeats >= totalSeats) {
    // availability = 'Sold Out';
    // } else if (bookedSeats / totalSeats >= 0.7) {
    // availability = 'Almost Full';
    // } else if (bookedSeats / totalSeats >= 0.5) {
    // availability = 'Filling Fast';
    // }

    // finalSectionList.push({
    // sectionName: section.SN,
    // seatTypes: Array.from(seatTypeMap.values()),
    // availability,
    // });
    // }

    // this.finalSectionList = finalSectionList;
    // this.sectionList = finalSectionList;
    // this.maxWidth = maxWidth;

    // this.translateY = 0;
    // this.translateX = 330;
    // this.zoomLevel = 0.3;
    // setTimeout(() => {
    // var wrapper = document.getElementById('zoom-wrapper');
    // var content = document.getElementById('zoom-content');
    // if (wrapper && content) {
    // const wrapperWidth = wrapper.offsetWidth;
    // const wrapperHeight = wrapper.offsetHeight;

    // const contentWidth = content.scrollWidth;
    // const contentHeight = content.scrollHeight;
    // const widthScale = wrapperWidth > contentWidth ? 1 : wrapperWidth / contentWidth;
    // const heightScale = wrapperHeight > contentHeight ? 1 : wrapperHeight / contentHeight;
    // // Pick the smaller scale so content fits in both dimensions
    // this.zoomLevel = Math.min(widthScale, heightScale);
    // if (this.zoomLevel > 0.3)
    // this.zoomLevel = this.zoomLevel - 0.1;
    // }

    // if (wrapper && content) {
    // this.centerContent();
    // this.clampTranslate();
    // }
    // }, 1000);
    // }
    /**
     * Expands the raw flat SEAT_LAYOUT_JSON config (as returned by /web/getVenueJson)
     * into sections with R[] rows and ST[] seats, matching the structure expected by
     * the seat chart renderer and updateSeatLayoutWithBookingStatus().
     */
    generateLayoutFromConfig(rawRows: any[]): any[] {
        // ─── Production data format ────────────────────────────────────────────
        // Each element in rawRows is ONE SEAT (from charted_seat_layout MySQL table).
        // Key fields per seat:
        //   id, EVENT_TICKET_BOOKING_ID
        //   SN  = Section Name            SRN = Section Row Name
        //   ML  = section margin-left     W / H = section canvas width/height
        //   MW  = max row width           MH = margin header height
        //   IT  = section top offset (string, can be negative e.g. "-988")
        //   AR  = arc radius (string)     D = section shape ('C')
        //   ISSWN = show section name (0/1)
        //   C / CT / CB = section colors  SP = section price
        //   BF / BT = booking fee / type  CS / RS = column/row sort direction
        //   R_RN = row name               R_AV = row availability ('O'=open)
        //   R_T  = row vertical tilt (string, e.g. "-7.923")
        //   R_IRG = row is curved (0/1)   R_IRSP / R_IRST = reserved seat price/type
        //   S_N  = seat number within row S_GN = global seat number
        //   S_IB = is bookable ('A'=available, 'B'=booked, 'P'=in-process)
        //   S_W / S_H = seat width/height S_ML / S_MR = seat left/right margin
        //   S_TOP = seat top absolute     S_AT = additional top offset
        //   S_MT = seat margin-top CSS string (e.g. "-44.15px 0 0") — curved row offset
        //   S_T  = seat CSS transform     (e.g. "rotate(10.76deg)") — seat tilt
        //   S_SP = seat price             S_ST = seat type
        //   S_C / S_CT / S_CB = seat colors
        //   S_U  = seat booking code (null if not booked)
        //   SL   = seat absolute left     SW = section/row width
        //   T    = seat top (absolute)    ST = seat section top offset
        //   isEditable = 0/1
        // ────────────────────────────────────────────────────────────────────────

        // Group by section name, preserving ALL positional fields
        const sectionMap = new Map<string, any>();

        for (const seat of rawRows) {
            const sectionName = seat.SN || 'Unknown';
            const rowName     = seat.R_RN || seat.SRN || 'A';

            if (!sectionMap.has(sectionName)) {
                sectionMap.set(sectionName, {
                    SN:     sectionName,
                    C:      seat.C     || seat.S_C  || '#ccc',
                    CT:     seat.CT    || seat.S_CT || '#000',
                    CB:     seat.CB    || seat.S_CB || seat.C || '#ccc',
                    D:      seat.D     || seat.S_D  || 'C',
                    SP:     seat.SP    || seat.S_SP || '0',
                    BF:     seat.BF    || '0',
                    BT:     seat.BT    || 'P',
                    // ── Absolute layout fields ──
                    ML:     seat.ML    || 0,       // section left offset
                    W:      seat.W     || 1100,    // section canvas width
                    H:      seat.H     || 600,     // section canvas height
                    IT:     seat.IT    || '0',     // section top offset (can be negative)
                    MW:     seat.MW    || 250,
                    MH:     seat.MH    || 80,
                    AR:     seat.AR    || '0',     // arc radius
                    CS:     seat.CS    || 'RTL',
                    RS:     seat.RS    || 'TTB',
                    ISSWN:  seat.ISSWN || 0,
                    S_W:    seat.S_W   || 20,
                    S_H:    seat.S_H   || 20,
                    S_ML:   seat.S_ML  || 2,
                    S_MR:   seat.S_MR  || 2,
                    rowMap: new Map<string, any>(),  // keyed by rowName
                });
            }

            const section = sectionMap.get(sectionName)!;

            // Build row entry if not seen
            if (!section.rowMap.has(rowName)) {
                section.rowMap.set(rowName, {
                    RN:     rowName,
                    R_T:    seat.R_T    || '0',    // row tilt (degrees, string)
                    R_IRG:  seat.R_IRG  || 0,      // is row curved
                    R_IRH:  seat.R_IRH  || 0,
                    R_IRHS: seat.R_IRHS || 0,
                    R_IRSP: seat.R_IRSP || seat.SP || '0',
                    R_IRST: seat.R_IRST || 'S',
                    R_AV:   seat.R_AV   || 'O',
                    R_M:    seat.R_M    || '0',
                    R_AR:   seat.R_AR   || '0',
                    R_RM:   seat.R_RM   || '0',
                    R_BF:   seat.R_BF   || '0',
                    R_IVIP: seat.R_IVIP || '0',
                    SW:     seat.SW     || null,   // row/section width reference
                    SL:     seat.SL     || null,   // row left reference
                    ST:     [] as any[],
                });
            }

            // Add seat with ALL positional fields preserved
            section.rowMap.get(rowName)!.ST.push({
                id:     seat.id,
                N:      seat.S_N   || seat.S_GN || '0',  // seat number label
                GN:     seat.S_GN  || seat.S_N  || '0',  // global seat number
                SNA:    Number(seat.S_SNA ?? seat.S_IAB ?? 0),
                IB:     seat.S_IB  || 'A',   // 'A'=available, 'B'=booked, 'P'=in-process
                ICG:    seat.S_ICG || 0,      // is in curved group
                SP:     seat.S_SP  || seat.SP || '0',
                S_W:    Number(seat.S_W  || 20),
                S_H:    Number(seat.S_H  || 20),
                S_ML:   Number(seat.S_ML || 2),
                S_MR:   Number(seat.S_MR || 2),
                S_D:    seat.S_D   || seat.D || 'C',
                S_C:    seat.S_C   || seat.C || '#ccc',
                S_CT:   seat.S_CT  || seat.CT || '#000',
                S_CB:   seat.S_CB  || seat.CB || seat.C || '#ccc',
                S_VIP:  seat.S_VIP || '0',
                S_PR:   seat.S_PR  || 0,
                S_ST:   seat.S_ST  || 'S',
                S_SV:   seat.S_SV  || '0',
                S_AR:   seat.S_AR  || '0',
                S_U:    seat.S_U   || null,   // booking code if booked
                SG:     seat.R_SG  || seat.S_SG || null,
                BF:     seat.BF    || '0',
                BT:     seat.BT    || 'P',
                // ── Absolute position fields — the ones production uses ──
                // S_MT: CSS margin-top like "-44.15px 0 0" → vertical offset within row
                S_MT:   seat.S_MT  || '0px 0 0',
                // S_T: CSS transform like "rotate(10.76deg)" → seat rotation
                S_T:    seat.S_T   || 'rotate(0deg)',
                // S_L: additional left offset within the row (rarely set)
                S_L:    Number(seat.S_L  || 0),
                // S_TOP: absolute top override
                S_TOP:  seat.S_TOP || '0',
                // S_AT: additional top offset
                S_AT:   seat.S_AT  || '0',
                // SL: absolute left of the seat within the stage (from production)
                SL:     seat.SL    != null ? Number(seat.SL) : null,
                // T: absolute top of the seat within the stage (from production)
                T:      seat.T     != null ? Number(seat.T)  : null,
                // SW: reference width of the row strip
                SW:     seat.SW    != null ? Number(seat.SW) : null,
                // ST: section-top reference
                ST:     seat.ST    || null,
            });
        }

        // Convert to final array with R[] rows
        const sections: any[] = [];
        for (const [, section] of sectionMap) {
            // Sort rows by their natural order (R_RN is usually a letter A,B,C...)
            const rows = Array.from(section.rowMap.values());
            rows.sort((a: any, b: any) => {
                return String(a.RN).localeCompare(String(b.RN));
            });
            section.R = rows;
            delete section.rowMap;
            sections.push(section);
        }

        return sections;
    }

    getSectionData() {
        // If sections don't have R[] rows yet, generate them from raw config
        if (this.SCREEN_MASTER.LAYOUT_JSON?.length &&
            !this.SCREEN_MASTER.LAYOUT_JSON[0]?.R) {
            console.log('[Konva] Raw seat sample:', JSON.stringify(this.SCREEN_MASTER.LAYOUT_JSON[0]));
            this.SCREEN_MASTER.LAYOUT_JSON = this.generateLayoutFromConfig(
                this.SCREEN_MASTER.LAYOUT_JSON
            );
            console.log('[Konva] After grouping, sections:', this.SCREEN_MASTER.LAYOUT_JSON.map((s: any) => ({
                SN: s.SN, rows: s.R?.length, firstRow: s.R?.[0]?.RN, seatsInFirstRow: s.R?.[0]?.ST?.length
            })));
        }
        // Precompute display colors for all seats (avoids function calls in template)
        this.refreshSeatColors();

        const finalSectionList: any[] = [];
        let maxWidth = 0;

        for (const section of this.SCREEN_MASTER.LAYOUT_JSON) {
            const realSeats = section.R?.flatMap(
                (row: any) => row.ST?.filter((seat: any) => !(seat.N == 0 && seat.SNA == 0)) || []
            ) || [];

            if (realSeats.length > 0 && realSeats.every((seat: any) => seat.SNA == 1)) {
                continue;
            }

            section.isEditable = false;
            const firstRowSeats = section.R?.[0]?.ST?.length || 0;
            const currentWidth = (firstRowSeats + 1) * 24;
            if (currentWidth > maxWidth) {
                maxWidth = currentWidth;
            }

            const seatTypeMap = new Map();
            let totalSeats = 0;
            let bookedSeats = 0;

            for (const row of section.R || []) {
                for (const seat of row.ST || []) {
                    if (seat.SNA == 1) continue;
                    totalSeats += 1;
                    if (seat.IB == 'B' || seat.IB == 'P') bookedSeats += 1;

                    const price = Number(seat.SP || seat.S_SP || section.SP);
                    const color = seat.S_C || section.C || '#ccc';
                    const key = `${price}-${color}`;
                    const seatType = seatTypeMap.get(key) || {
                        price,
                        color,
                        subname: seat.SGN || null,
                        totalSeats: 0,
                        bordercolor: section.C || 'black',
                    };
                    seatType.totalSeats += 1;
                    seatTypeMap.set(key, seatType);
                }
            }

            let availability = 'Available';
            if (bookedSeats >= totalSeats) {
                availability = 'Sold Out';
            } else if (totalSeats > 0 && bookedSeats / totalSeats >= 0.9) {
                availability = 'Almost Sold Out';
            } else if (totalSeats > 0 && bookedSeats / totalSeats >= 0.7) {
                availability = 'Filling Fast';
            }

            finalSectionList.push({
                sectionName: section.SN,
                seatTypes: Array.from(seatTypeMap.values()),
                availability,
            });
        }

        this.finalSectionList = finalSectionList;
        this.sectionList = finalSectionList;
        this.maxWidth = maxWidth;

        // Signal ngAfterViewChecked to render once the DOM is ready
        this.pendingKonvaRender = true;
        console.log('[Konva] getSectionData complete, pendingKonvaRender=true, layout length:', this.SCREEN_MASTER?.LAYOUT_JSON?.length);
    }

    // ─── Konva seat chart ────────────────────────────────────────────────────────

    private konvaStage: Konva.Stage | null = null;
    private konvaLayer: Konva.Layer | null = null;
    // Map from seatKey → Konva shape for fast colour updates
    private konvaSeatShapes = new Map<string, Konva.Shape>();

    private readonly SEAT_SELECTED_COLOR_LIGHT = '#53db78';
    private readonly SEAT_SELECTED_COLOR_DARK  = '#f7e002';
    private readonly SEAT_BOOKED_COLOR          = 'rgb(227,227,227)';
    private readonly SEAT_INPROCESS_COLOR       = '#F39C12';

    // ── Helper: parse CSS "Npx 0 0" or "Npx" → number ─────────────────────────
    private parsePxValue(css: string | null | undefined): number {
        if (!css) return 0;
        const match = String(css).match(/^(-?[\d.]+)/);
        return match ? parseFloat(match[1]) : 0;
    }

    // ── Helper: parse "rotate(Ndeg)" → number ───────────────────────────────
    private parseDeg(css: string | null | undefined): number {
        if (!css) return 0;
        const match = String(css).match(/rotate\((-?[\d.]+)deg\)/);
        return match ? parseFloat(match[1]) : 0;
    }

    renderKonvaSeatChart(): void {
        const container = document.getElementById('konva-seat-container');
        if (!container || !this.SCREEN_MASTER?.LAYOUT_JSON?.length) return;

        // Destroy previous stage if any
        if (this.konvaStage) {
            this.konvaStage.destroy();
            this.konvaStage = null;
            this.konvaLayer = null;
            this.konvaSeatShapes.clear();
        }

        const sections = this.SCREEN_MASTER.LAYOUT_JSON;

        // ── Determine whether data has absolute positions ────────────────────
        // Production data: every seat has a numeric SL (absolute left) and T (absolute top).
        // Check first seat of first row.
        const firstSeat = sections[0]?.R?.[0]?.ST?.[0];
        const secondSeat = sections[0]?.R?.[0]?.ST?.[1] ?? sections[0]?.R?.[1]?.ST?.[0];

        // Positions are truly absolute only if seats have DIFFERENT SL/T values.
        // If all seats share the same SL/T (corrupt/placeholder data), fall back to GRID.
        // Also treat as absolute if S_T contains real rotation values (curved rows).
        const firstSeatHasRotation = firstSeat?.S_T &&
            firstSeat.S_T !== '0' &&
            firstSeat.S_T !== 'rotate(0deg)' &&
            String(firstSeat.S_T).includes('rotate(');

        const hasAbsolutePos = firstSeat != null &&
            firstSeat.SL != null && firstSeat.T != null &&
            !isNaN(Number(firstSeat.SL)) && !isNaN(Number(firstSeat.T)) &&
            // Either seats differ in SL/T (true absolute coords), or S_T has rotation (curved layout)
            (firstSeatHasRotation ||
             secondSeat == null ||
             Number(firstSeat.SL) !== Number(secondSeat.SL) ||
             Number(firstSeat.T)  !== Number(secondSeat.T));

        console.log('[Konva] render mode:', hasAbsolutePos ? 'ABSOLUTE' : 'GRID',
            'firstSeat sample:', JSON.stringify(firstSeat));

        if (hasAbsolutePos) {
            this.renderKonvaAbsolute(container, sections);
        } else {
            this.renderKonvaGrid(container, sections);
        }
    }

    // ── ABSOLUTE renderer — uses SL/T/S_MT/S_T from production data ─────────
    private renderKonvaAbsolute(container: HTMLElement, sections: any[]): void {
        // ── 1. Measure canvas bounds across all sections ─────────────────────
        // Each section has W (canvas width), H (canvas height), ML (left offset),
        // IT (top offset — can be negative for overlapping sections like Balcony).
        // We want to find the bounding box that fits everything.

        const STAGE_LABEL_H = 44;   // height reserved for the "Stage" bar at top
        const STAGE_LABEL_MARGIN = 8;

        let canvasMaxX = 0;
        let canvasMinY = Infinity;
        let canvasMaxY = 0;

        for (const section of sections) {
            const ml  = Number(section.ML  || 0);
            const w   = Number(section.W   || 1100);
            const h   = Number(section.H   || 600);
            const it  = this.parsePxValue(section.IT);   // section top offset
            const mh  = Number(section.MH  || 80);       // margin header height

            const sectionLeft = ml;
            const sectionTop  = STAGE_LABEL_H + STAGE_LABEL_MARGIN + it + mh;

            canvasMaxX = Math.max(canvasMaxX, sectionLeft + w);
            canvasMinY = Math.min(canvasMinY, sectionTop);
            canvasMaxY = Math.max(canvasMaxY, sectionTop + h);
        }

        // Pad negative-top sections: shift everything down so min Y ≥ STAGE_LABEL_H
        const yShift = canvasMinY < STAGE_LABEL_H ? (STAGE_LABEL_H - canvasMinY) : 0;

        const totalW = Math.max(canvasMaxX, 400);
        const totalH = canvasMaxY + yShift + 20;

        const containerW = container.clientWidth || totalW;

        this.konvaStage = new Konva.Stage({
            container: 'konva-seat-container',
            width:  containerW,
            height: totalH,
            draggable: true,
        });

        this.konvaLayer = new Konva.Layer();
        this.konvaStage.add(this.konvaLayer);

        // ── 2. Stage label bar ───────────────────────────────────────────────
        // Position it centered within the first section's width
        const firstML = Number(sections[0]?.ML || 0);
        const firstW  = Number(sections[0]?.W  || containerW);
        const stageCenterX = firstML + firstW / 2;

        this.konvaLayer.add(new Konva.Rect({
            x: stageCenterX - 60, y: STAGE_LABEL_MARGIN,
            width: 120, height: 26,
            fill: '#cccccc', cornerRadius: 5,
        }));
        this.konvaLayer.add(new Konva.Text({
            x: stageCenterX - 60, y: STAGE_LABEL_MARGIN + 6,
            width: 120, text: 'Stage',
            fontSize: 12, fontFamily: 'Poppins, sans-serif',
            fill: '#333', align: 'center',
        }));

        // ── 3. Draw each section ─────────────────────────────────────────────
        for (const section of sections) {
            const sectionML  = Number(section.ML || 0);
            const sectionIT  = this.parsePxValue(section.IT);
            const sectionMH  = Number(section.MH || 80);
            const sectionShape = (section.D || 'C') as string;

            // Origin of this section's coordinate system on the Konva canvas
            const originX = sectionML;
            const originY = STAGE_LABEL_H + STAGE_LABEL_MARGIN + sectionIT + sectionMH + yShift;

            // Section name header
            if (section.ISSWN == 1) {
                this.konvaLayer.add(new Konva.Text({
                    x: originX,
                    y: originY - 14,
                    width: Number(section.W || 1100),
                    text: section.SN,
                    fontSize: 11, fontFamily: 'Poppins, sans-serif',
                    fontStyle: 'bold', fill: '#333', align: 'center',
                }));
            }

            // ── 4. Draw each seat in this section ────────────────────────────
            for (const row of section.R || []) {
                for (const seat of row.ST || []) {
                    if (Number(seat.SNA) === 1) continue;   // not available / hidden

                    const sw = Number(seat.S_W || 20);
                    const sh = Number(seat.S_H || 20);

                    // ── Absolute position from production data ──
                    // SL = absolute left of seat within the section's canvas
                    // T  = absolute top of seat within the section's canvas
                    // S_MT = additional margin-top CSS (curved row adjustment)
                    // S_T  = CSS rotation e.g. "rotate(10.76deg)"

                    const seatAbsLeft = Number(seat.SL ?? 0);
                    const seatAbsTop  = Number(seat.T  ?? 0);
                    const seatMT      = this.parsePxValue(seat.S_MT);  // curved row offset
                    const seatRot     = this.parseDeg(seat.S_T);       // seat rotation

                    // Final canvas coordinates
                    const cx = originX + seatAbsLeft + sw / 2;
                    const cy = originY + seatAbsTop  + seatMT + sh / 2;

                    const seatKey  = this.getSeatKey(seat, row, section);
                    const fillColor = this.getSeatFillColor(seat, section, seatKey);

                    let seatShape: Konva.Shape;

                    if (sectionShape === 'C') {
                        seatShape = new Konva.Circle({
                            x: cx, y: cy,
                            radius: sw / 2,
                            fill: fillColor,
                            rotation: seatRot,
                        });
                    } else if (sectionShape === 'S') {
                        seatShape = new Konva.Rect({
                            x: cx - sw / 2, y: cy - sh / 2,
                            width: sw, height: sh,
                            fill: fillColor,
                            rotation: seatRot,
                            offsetX: sw / 2, offsetY: sh / 2,
                        });
                    } else {
                        seatShape = new Konva.Rect({
                            x: cx - sw / 2, y: cy - sh / 2,
                            width: sw, height: sh,
                            fill: fillColor,
                            cornerRadius: [4, 4, 0, 0],
                            rotation: seatRot,
                            offsetX: sw / 2, offsetY: sh / 2,
                        });
                    }

                    this.konvaSeatShapes.set(seatKey, seatShape);

                    if (seat.IB !== 'B') {
                        seatShape.on('click tap', () => {
                            this.zone.run(() => this.onKonvaSeatClick(seat, row, section));
                        });
                        seatShape.on('mouseenter', () => {
                            this.konvaStage!.container().style.cursor = 'pointer';
                        });
                        seatShape.on('mouseleave', () => {
                            this.konvaStage!.container().style.cursor = 'default';
                        });
                    }

                    this.konvaLayer!.add(seatShape);

                    // Row number label: draw once at start of each row
                    // Only draw if this is the first seat in the row (seat.SL closest to 0)
                    if (Number(seat.SL ?? 0) < 30 && row.ST?.[0] === seat) {
                        this.konvaLayer!.add(new Konva.Text({
                            x: originX,
                            y: originY + seatAbsTop + seatMT,
                            width: Math.max(0, seatAbsLeft - 2),
                            text: String(row.RN),
                            fontSize: 9, fontFamily: 'Poppins, sans-serif',
                            fill: '#666', align: 'right',
                        }));
                    }
                }
            }
        }

        // ── 5. Fit stage to container ────────────────────────────────────────
        const fitScale = Math.min(containerW / totalW, 1);
        this.konvaStage.scale({ x: fitScale, y: fitScale });
        this.konvaStage.position({ x: 0, y: 0 });
        this.konvaStage.height(totalH * fitScale);

        // ── 6. Wheel zoom ────────────────────────────────────────────────────
        this.konvaStage.on('wheel', (e: any) => {
            e.evt.preventDefault();
            const scaleBy = 1.08;
            const stage = this.konvaStage!;
            const oldScale = stage.scaleX();
            const pointer = stage.getPointerPosition()!;
            const mpTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            };
            const newScale = e.evt.deltaY < 0
                ? Math.min(oldScale * scaleBy, 4)
                : Math.max(oldScale / scaleBy, 0.15);
            stage.scale({ x: newScale, y: newScale });
            stage.position({
                x: pointer.x - mpTo.x * newScale,
                y: pointer.y - mpTo.y * newScale,
            });
        });

        this.konvaLayer!.draw();
    }

    // ── GRID renderer — fallback when SL/T are absent ────────────────────────
    private renderKonvaGrid(container: HTMLElement, sections: any[]): void {
        const SEAT_W    = Number(sections[0]?.S_W || 20);
        const SEAT_H    = Number(sections[0]?.S_H || 20);
        const SEAT_ML   = Number(sections[0]?.S_ML || 2);
        const SEAT_MR   = Number(sections[0]?.S_MR || 2);
        const ROW_LABEL_W    = 22;
        const ROW_GAP        = 2;
        const SECTION_GAP    = 20;
        const STAGE_LABEL_H  = 36;
        const SECTION_HDR_H  = 18;

        let totalW = 0;
        let totalH = STAGE_LABEL_H + 10;
        for (const section of sections) {
            const rows = section.R || [];
            const maxSeats = Math.max(...rows.map((r: any) => r.ST?.length || 0), 0);
            const sw = ROW_LABEL_W * 2 + maxSeats * (SEAT_W + SEAT_ML + SEAT_MR);
            const sh = (section.ISSWN == 1 ? SECTION_HDR_H : 0)
                     + rows.length * (SEAT_H + ROW_GAP);
            totalW = Math.max(totalW, sw + Number(section.ML || 0));
            totalH += sh + SECTION_GAP;
        }
        totalW = Math.max(totalW, 400);

        const containerW = container.clientWidth || totalW;

        this.konvaStage = new Konva.Stage({
            container: 'konva-seat-container',
            width: containerW, height: totalH, draggable: true,
        });
        this.konvaLayer = new Konva.Layer();
        this.konvaStage.add(this.konvaLayer);

        this.konvaLayer.add(new Konva.Rect({
            x: containerW / 2 - 60, y: 8, width: 120, height: 22,
            fill: '#cccccc', cornerRadius: 5,
        }));
        this.konvaLayer.add(new Konva.Text({
            x: containerW / 2 - 60, y: 13, width: 120,
            text: 'Stage', fontSize: 12, fontFamily: 'Poppins, sans-serif',
            fill: '#333', align: 'center',
        }));

        let currentY = STAGE_LABEL_H + 10;

        for (const section of sections) {
            const rows: any[]  = section.R || [];
            const sectionX     = Number(section.ML || 0);
            const shape        = (section.D || 'C') as string;

            if (section.ISSWN == 1) {
                this.konvaLayer.add(new Konva.Text({
                    x: sectionX, y: currentY, width: totalW,
                    text: section.SN, fontSize: 11,
                    fontFamily: 'Poppins, sans-serif', fontStyle: 'bold',
                    fill: '#333', align: 'center',
                }));
                currentY += SECTION_HDR_H;
            }

            for (const row of rows) {
                const seats: any[] = row.ST || [];
                let seatX = sectionX + ROW_LABEL_W;

                this.konvaLayer.add(new Konva.Text({
                    x: sectionX, y: currentY + SEAT_H / 2 - 5,
                    width: ROW_LABEL_W - 2, text: row.RN,
                    fontSize: 9, fontFamily: 'Poppins, sans-serif',
                    fill: '#555', align: 'right',
                }));

                for (const seat of seats) {
                    const sw = Number(seat.S_W || SEAT_W);
                    const sh = Number(seat.S_H || SEAT_H);
                    const ml = Number(seat.S_ML || SEAT_ML);
                    const mr = Number(seat.S_MR || SEAT_MR);
                    seatX += ml;

                    if (seat.SNA != 1) {
                        const seatKey  = this.getSeatKey(seat, row, section);
                        const fillColor = this.getSeatFillColor(seat, section, seatKey);
                        let seatShape: Konva.Shape;

                        if (shape === 'C') {
                            seatShape = new Konva.Circle({
                                x: seatX + sw / 2,
                                y: currentY + sh / 2,
                                radius: sw / 2,
                                fill: fillColor,
                            });
                        } else if (shape === 'S') {
                            seatShape = new Konva.Rect({
                                x: seatX,
                                y: currentY,
                                width: sw,
                                height: sh,
                                fill: fillColor,
                            });
                        } else {
                            seatShape = new Konva.Rect({
                                x: seatX,
                                y: currentY,
                                width: sw,
                                height: sh,
                                fill: fillColor,
                                cornerRadius: [5, 5, 0, 0],
                            });
                        }

                        this.konvaSeatShapes.set(seatKey, seatShape);

                        if (seat.IB !== 'B') {
                            seatShape.on('click tap', () => {
                                this.zone.run(() => this.onKonvaSeatClick(seat, row, section));
                            });
                            seatShape.on('mouseenter', () => {
                                this.konvaStage!.container().style.cursor = 'pointer';
                            });
                            seatShape.on('mouseleave', () => {
                                this.konvaStage!.container().style.cursor = 'default';
                            });
                        }

                        this.konvaLayer!.add(seatShape);
                    }

                    seatX += sw + mr;
                }

                this.konvaLayer!.add(new Konva.Text({
                    x: seatX + 2,
                    y: currentY + SEAT_H / 2 - 5,
                    text: row.RN,
                    fontSize: 9, fontFamily: 'Poppins, sans-serif', fill: '#555',
                }));

                currentY += SEAT_H + ROW_GAP;
            }

            currentY += SECTION_GAP;
        }

        this.konvaStage.on('wheel', (e: any) => {
            e.evt.preventDefault();
            const scaleBy = 1.08;
            const stage = this.konvaStage!;
            const oldScale = stage.scaleX();
            const pointer = stage.getPointerPosition()!;
            const mpTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            };
            const newScale = e.evt.deltaY < 0
                ? Math.min(oldScale * scaleBy, 4)
                : Math.max(oldScale / scaleBy, 0.15);
            stage.scale({ x: newScale, y: newScale });
            stage.position({
                x: pointer.x - mpTo.x * newScale,
                y: pointer.y - mpTo.y * newScale,
            });
        });

        const fitScale = Math.min(containerW / totalW, 1);
        this.konvaStage.scale({ x: fitScale, y: fitScale });
        this.konvaStage.position({ x: 0, y: 0 });

        this.konvaLayer!.draw();
    }

    private getSeatFillColor(seat: any, section: any, seatKey: string): string {
        if (this.selectedSeatKeySet.has(seatKey)) {
            return this.isDark ? this.SEAT_SELECTED_COLOR_DARK : this.SEAT_SELECTED_COLOR_LIGHT;
        }
        if (seat.IB === 'B') return this.SEAT_BOOKED_COLOR;
        if (seat.IB === 'P') return this.SEAT_INPROCESS_COLOR;
        return seat.S_C || section.C || '#ccc';
    }

    onKonvaSeatClick(seat: any, row: any, section: any): void {
        if (seat.IB === 'B') return;

        const key = this.getSeatKey(seat, row, section);

        if (this.selectedSeatKeySet.has(key)) {
            this.selectedSeatKeySet.delete(key);
            const idx = this.selectedSeats1.findIndex(
                (s: any) => s.N == seat.N && s.RN == row.RN && s.SN == section.SN
            );
            if (idx >= 0) this.selectedSeats1.splice(idx, 1);
        } else {
            if (this.selectedSeats1.length >= this.selectedSeatCount) {
                this.toastr.warning(`You can only select ${this.selectedSeatCount} seat(s).`, '');
                return;
            }
            this.selectedSeatKeySet.add(key);
            this.selectedSeats1.push({
                id: seat.id || `${section.SN}-${row.RN}-${seat.N}`,
                N: seat.N,
                RN: row.RN,
                SN: section.SN,
                SG: seat.SG || section.SG || null,
                SP: seat.S_SP || section.SP,
                BF: section.BF,
                BT: section.BT,
                PR: seat.S_PR || 0,
                capacity: seat.SV || 1,
                ST: seat.S_ST || 'S',
            });
        }

        this.selectedSeatsIDs = this.selectedSeats1.map((s: any) => s.id);
        this.selectedSeatsIndex = this.selectedSeats1.map((s: any) => `${s.RN}-${s.N}`);

        // Update only the clicked seat's colour — no full redraw
        const shape = this.konvaSeatShapes.get(key);
        if (shape) {
            shape.fill(this.getSeatFillColor(seat, section, key));
            this.konvaLayer?.batchDraw();
        }

        this.updateGroupedSeats2();
        this.changeDetectorRef.detectChanges();
    }

    // Override zoomIn/zoomOut to control Konva stage scale
    zoomIn(): void {
        if (this.konvaStage) {
            const s = Math.min(this.konvaStage.scaleX() * 1.15, 3);
            this.konvaStage.scale({ x: s, y: s });
            this.konvaLayer?.batchDraw();
        } else {
            this.zoomInByButton();
        }
    }

    zoomOut(): void {
        if (this.konvaStage) {
            const s = Math.max(this.konvaStage.scaleX() / 1.15, 0.2);
            this.konvaStage.scale({ x: s, y: s });
            this.konvaLayer?.batchDraw();
        } else {
            this.zoomOutByButton();
        }
    }

    // Set of selected seat keys for O(1) lookup — avoids per-seat Array.find() in template
    selectedSeatKeySet = new Set<string>();

    private getSeatKey(seat: any, row: any, section: any): string {
        return `${section.SN}__${row.RN}__${seat.N}`;
    }

    isSelectedSeat(seat: any, row: any, section: any): boolean {
        return this.selectedSeatKeySet.has(this.getSeatKey(seat, row, section));
    }

    // Precompute _displayColor on every seat so the template reads a plain property
    private refreshSeatColors(): void {
        if (!this.SCREEN_MASTER?.LAYOUT_JSON) return;
        const selectedColor = this.isDark ? '#f7e002' : '#53db78';
        for (const section of this.SCREEN_MASTER.LAYOUT_JSON) {
            for (const row of section.R || []) {
                for (const seat of row.ST || []) {
                    if (this.selectedSeatKeySet.has(this.getSeatKey(seat, row, section))) {
                        seat._displayColor = selectedColor;
                    } else if (seat.IB == 'B') {
                        seat._displayColor = 'rgb(227,227,227)';
                    } else if (seat.IB == 'P') {
                        seat._displayColor = '#F39C12';
                    } else {
                        seat._displayColor = seat.S_C || section.C || '#ccc';
                    }
                }
            }
        }
    }

    onSeatClick(seat: any, row: any, section: any): void {
        if (seat.IB == 'B') return;

        const key = this.getSeatKey(seat, row, section);

        if (this.selectedSeatKeySet.has(key)) {
            // Deselect
            this.selectedSeatKeySet.delete(key);
            const idx = this.selectedSeats1.findIndex(
                (s: any) => s.N == seat.N && s.RN == row.RN && s.SN == section.SN
            );
            if (idx >= 0) this.selectedSeats1.splice(idx, 1);
        } else {
            if (this.selectedSeats1.length >= this.selectedSeatCount) {
                this.toastr.warning(`You can only select ${this.selectedSeatCount} seat(s).`, '');
                return;
            }
            this.selectedSeatKeySet.add(key);
            this.selectedSeats1.push({
                id: seat.id || `${section.SN}-${row.RN}-${seat.N}`,
                N: seat.N,
                RN: row.RN,
                SN: section.SN,
                SG: seat.SG || section.SG || null,
                SP: seat.S_SP || section.SP,
                BF: section.BF,
                BT: section.BT,
                PR: seat.S_PR || 0,
                capacity: seat.SV || 1,
                ST: seat.S_ST || 'S',
            });
        }

        this.selectedSeatsIDs = this.selectedSeats1.map((s: any) => s.id);
        this.selectedSeatsIndex = this.selectedSeats1.map((s: any) => `${s.RN}-${s.N}`);
        this.refreshSeatColors();
        this.updateGroupedSeats2();
        this.changeDetectorRef.detectChanges();
    }

    updateGroupedSeats2(): void {
        const grouped: any = {};
        for (const seat of this.selectedSeats1) {
            if (!grouped[seat.SN]) {
                grouped[seat.SN] = { SN: seat.SN, levels: [] };
            }
            const sgKey = seat.SG || '__none__';
            let level = grouped[seat.SN].levels.find((l: any) => l.SG === sgKey);
            if (!level) {
                level = { SG: seat.SG || null, seats: [] };
                grouped[seat.SN].levels.push(level);
            }
            level.seats.push(seat);
        }
        this.groupedSeats2 = Object.values(grouped);
    }

    zoomLevel = 0.7;
    minZoom = 0.3;
    maxZoom = 1.13;
    zoomStep = 0.1;
    translateX = 0;
    translateY = 0;

    initialDistance = 0;
    initialZoom: any = 1;

    private isDragging = false;
    private startX = 0;
    private startY = 0;
    private origX = 0;
    private origY = 0;




    private lastX = 0;
    private lastY = 0;
    zoomInByButton(): void {
        // Zoom in uses the full zoom sensitivity step
        const zoomFactor = this.zoomSensitivity;
        let newScale = this.currentScale * zoomFactor;

        // Clamp the scale: Stops the zoom-in process after maxScale
        newScale = Math.min(newScale, this.maxScale);

        if (newScale == this.currentScale) return; // Stop if already at max scale

        // --- 1. Determine Pivot Point ---
        // For button clicks, the pivot should be the center of the container
        const pivotX = this.containerWidth / 2;
        const pivotY = this.containerHeight / 2;

        // --- 2. Adjust Translation ---
        this.adjustTranslationToPivot(pivotX, pivotY, newScale);

        this.currentScale = newScale;
        this.lastX = this.currentX;
        this.lastY = this.currentY;

        this.applyTransform();
    }

    zoomOutByButton(): void {
        // Zoom out uses the inverse zoom sensitivity step
        const zoomFactor = 1 / this.zoomSensitivity;
        let newScale = this.currentScale * zoomFactor;

        // Clamp the scale: Stops the zoom-out process after initialFitScale
        newScale = Math.max(newScale, this.initialFitScale);

        if (newScale == this.currentScale) return; // Stop if already at min scale

        // --- 1. Determine Pivot Point ---
        // For button clicks, the pivot should be the center of the container
        const pivotX = this.containerWidth / 2;
        const pivotY = this.containerHeight / 2;

        // --- 2. Adjust Translation ---
        this.adjustTranslationToPivot(pivotX, pivotY, newScale);

        this.currentScale = newScale;
        this.lastX = this.currentX;
        this.lastY = this.currentY;

        // Manual check and fit for smooth snap-back to initial fit
        if (this.currentScale <= this.initialFitScale) {
            this.fitContentInContainer(true);
        }

        this.applyTransform();
    }

    // Aliases used by the HTML template buttons — now handled by Konva overrides above
    // zoomIn() and zoomOut() are defined in the Konva section of getSectionData

    // Processes seat JSON data for the 'S' (SVG/section) hosting type
    commonseatdata(seatJson: any): void {
        if (!seatJson) return;
        this.seatJsonData = Array.isArray(seatJson) ? seatJson : JSON.parse(seatJson);
        this.changeDetectorRef.detectChanges();
    }

    private zoomSensitivity = 1.1;
    private containerWidth = 0;
    private containerHeight = 0;
    private contentWidth = 0;
    private contentHeight = 0;
    private currentX = 0;
    private currentY = 0;
    private currentScale = 1;
    private targetScale = 1;
    private initialFitScale = 1;
    private maxScale = 1.6;
    transform = 'translate3d(0, 0, 0) scale(0.5)';

    // --- INTERACTION & ANIMATION STATE ---
    private evCache: PointerEvent[] = [];
    private draggingPointerId: number | null = null;
    private isRightDragActive = false;
    private isInteracting = false; // Flag for active drag/pinch

    private startPanX = 0;
    private startPanY = 0;
    private startTranslateX = 0;
    private startTranslateY = 0;
    private lastPivotX = 0;
    private lastPivotY = 0;
    private prevDiff = -1;

    // --- MOMENTUM STATE ---
    private lastMoveTime = 0;
    private lastMoveX = 0;
    private lastMoveY = 0;
    private velocityX = 0;
    private velocityY = 0;
    private bounceStrength = 0.35; // Renamed from 0.35, was 0.35

    // --- ANIMATION FRAME IDs ---
    private zoomFrame: number | null = null;
    private momentumFrame: number | null = null;
    private bounceFrame: number | null = null;
    private rAF: number | null = null; // Main interaction loop



    // --------------------------------------------------------------------------------
    // --- HOST LISTENERS (EVENT HANDLERS) ---
    // --------------------------------------------------------------------------------

    @HostListener('document:contextmenu', ['$event'])
    onContextMenu(event: MouseEvent) {
        if (this.activeStep == 3 && this.Hoisting_Type == 'C' && this.istugoz == false) {
            if (this.isRightDragActive) {
                event.preventDefault();
            }
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        this.updateContainerDimensions();
        this.fitContentInContainer();
    }

    @HostListener('wheel', ['$event'])
    onWheel(event: WheelEvent) {
        const wrapper = document.getElementById('zoom-wrapper');
        if (!wrapper || !wrapper.contains(event.target as Node)) {
            return;
        }
        event.preventDefault();

        if (this.activeStep == 3 && this.Hoisting_Type == 'C' && this.istugoz == false) {
            const zoomFactor = event.deltaY < 0 ? this.zoomSensitivity : 1 / this.zoomSensitivity;
            let newScale = this.targetScale * zoomFactor;
            newScale = Math.max(this.initialFitScale, Math.min(newScale, this.maxScale));

            if (Math.abs(newScale - this.targetScale) < 0.001) return;
            this.targetScale = newScale;

            const rect = wrapper.getBoundingClientRect();
            this.lastPivotX = event.clientX - rect.left;
            this.lastPivotY = event.clientY - rect.top;

            // Stop other animations
            this.cancelAllAnimations();

            // Start smooth zoom
            this.startZoomAnimation();
        }
    }


    pointerDown(event: PointerEvent) {
        this.zone.runOutsideAngular(() => {
            const wrapper = document.getElementById('zoom-wrapper');
            if (!wrapper || !wrapper.contains(event.target as Node)) {
                return;
            }

            if (this.activeStep == 3 && this.Hoisting_Type == 'C' && this.istugoz == false) {
                event.preventDefault();
                this.evCache.push(event);
                (event.target as Element).setPointerCapture?.(event.pointerId);

                // Stop any running animations
                this.cancelAllAnimations();
                this.targetScale = this.currentScale;

                if (this.draggingPointerId == null) {
                    this.draggingPointerId = event.pointerId;
                    this.isRightDragActive = event.button == 2;

                    this.startPanX = event.clientX;
                    this.startPanY = event.clientY;
                    this.startTranslateX = this.currentX;
                    this.startTranslateY = this.currentY;

                    // Reset velocity
                    this.velocityX = 0;
                    this.velocityY = 0;
                    this.lastMoveTime = performance.now();
                    this.lastMoveX = event.clientX;
                    this.lastMoveY = event.clientY;
                }

                // Multi-touch setup
                if (this.evCache.length == 2) {
                    // *** MODIFICATION 1: Reset dragging state when pinch starts ***
                    this.draggingPointerId = null;

                    this.prevDiff = this.getDistance(this.evCache[0], this.evCache[1]);
                    const avgX = (this.evCache[0].clientX + this.evCache[1].clientX) / 2;
                    const avgY = (this.evCache[0].clientY + this.evCache[1].clientY) / 2;
                    const rect = wrapper!.getBoundingClientRect();
                    this.lastPivotX = avgX - rect.left;
                    this.lastPivotY = avgY - rect.top;
                    this.targetScale = this.currentScale;
                }

                // **PERF: Start the rAF loop**
                if (!this.isInteracting) {
                    this.isInteracting = true;
                    this.rAF = requestAnimationFrame(this.animationLoop);
                }
            }
        });
    }

    // Refactored pointerMove method
    pointerMove(event: PointerEvent) {
        event.preventDefault();

        const index = this.evCache.findIndex(c => c.pointerId == event.pointerId);
        if (index == -1) return; // Not an active pointer
        this.evCache[index] = event;

        const now = performance.now();

        // --- Pinch zoom (Priority) ---
        if (this.evCache.length == 2) {
            const curDiff = this.getDistance(this.evCache[0], this.evCache[1]);

            if (this.prevDiff > 0) {
                let zoomFactor = curDiff / this.prevDiff;
                const pinchDamping = 0.5;

                zoomFactor = zoomFactor > 1
                    ? 1 + (zoomFactor - 1) * this.zoomSensitivity * pinchDamping
                    : 1 - (1 - zoomFactor) * this.zoomSensitivity * pinchDamping;

                let newScale = this.currentScale * zoomFactor;
                newScale = Math.max(this.initialFitScale, Math.min(newScale, this.maxScale));

                if (newScale != this.currentScale) {
                    this.adjustTranslationToPivot(this.lastPivotX, this.lastPivotY, newScale);
                    this.currentScale = newScale;
                    this.targetScale = newScale;
                }
                this.prevDiff = curDiff;
            }
        }
        // --- Single pointer drag ---
        else if (
            // *** MODIFICATION 2: Check strictly for evCache.length == 1 ***
            this.evCache.length == 1 &&
            this.draggingPointerId == event.pointerId &&
            this.currentScale > this.initialFitScale + 0.001
        ) {
            // ... (rest of the drag logic remains the same, calculating position and velocity) ...

            const rawOffsetX = event.clientX - this.startPanX;
            const rawOffsetY = event.clientY - this.startPanY;

            const adjustedOffsetX = rawOffsetX / this.currentScale;
            const adjustedOffsetY = rawOffsetY / this.currentScale;

            const idealX = this.startTranslateX + adjustedOffsetX;
            const idealY = this.startTranslateY + adjustedOffsetY;

            const bounds = this.getClampedPosition(idealX, idealY);

            // ... (removed bounce calculation for brevity, assuming hard clamping or no-bounce logic is used) ...

            // Set the final position (state only)
            this.currentX = bounds.x; // Use hard-clamped position
            this.currentY = bounds.y;

            // Velocity tracking
            const deltaTime = now - this.lastMoveTime;
            if (deltaTime > 0) {
                this.velocityX = (event.clientX - this.lastMoveX) / deltaTime;
                this.velocityY = (event.clientY - this.lastMoveY) / deltaTime;
            }
            this.lastMoveTime = now;
            this.lastMoveX = event.clientX;
            this.lastMoveY = event.clientY;
        }
    }

    pointerUp(event: PointerEvent) {
        (event.target as Element).releasePointerCapture?.(event.pointerId);
        const index = this.evCache.findIndex(c => c.pointerId == event.pointerId);
        if (index > -1) this.evCache.splice(index, 1);
        if (this.evCache.length < 2) this.prevDiff = -1;

        if (this.draggingPointerId == event.pointerId) {
            this.draggingPointerId = null;
            this.isRightDragActive = false;
        }

        // **PERF: Stop the rAF loop if no pointers are left**
        if (this.evCache.length == 0) {
            this.isInteracting = false;
            // The loop will see this flag and stop itself
        }

        this.targetScale = this.currentScale;

        // Start momentum or bounce back
        if (Math.abs(this.velocityX) > 0.01 || Math.abs(this.velocityY) > 0.01) {
            this.startMomentum();
        } else {
            this.startBounceBack();
        }

        if (this.currentScale < this.initialFitScale) {
            this.fitContentInContainer(true);
        }
    }

    // --------------------------------------------------------------------------------
    // --- ANIMATION AND TRANSFORM UTILITIES ---
    // --------------------------------------------------------------------------------

    /**
     * **NEW:** Main rAF loop for active dragging and pinching.
     * Reads state from pointerMove and applies transform.
     */
    private animationLoop = () => {
        if (!this.isInteracting) {
            this.rAF = null;
            return; // Stop the loop
        }

        this.applyTransform();
        this.rAF = requestAnimationFrame(this.animationLoop);
    };

    /**
     * **NEW:** Stops all running animations.
     */
    private cancelAllAnimations() {
        if (this.momentumFrame) cancelAnimationFrame(this.momentumFrame);
        if (this.bounceFrame) cancelAnimationFrame(this.bounceFrame);
        if (this.zoomFrame) cancelAnimationFrame(this.zoomFrame);
        if (this.rAF) cancelAnimationFrame(this.rAF);

        this.momentumFrame = null;
        this.bounceFrame = null;
        this.zoomFrame = null;
        this.rAF = null;
        this.isInteracting = false;
    }

    private startZoomAnimation() {
        if (this.zoomFrame) cancelAnimationFrame(this.zoomFrame);

        const step = () => {
            const easingFactor = 0.3;
            const newScale = this.currentScale + (this.targetScale - this.currentScale) * easingFactor;

            if (Math.abs(this.targetScale - newScale) < 0.005) {
                this.currentScale = this.targetScale;
                this.adjustTranslationToPivot(this.lastPivotX, this.lastPivotY, this.currentScale);
                this.applyTransform();
                this.zoomFrame = null;
                this.startBounceBack(); // Snap to edges after zoom
                return;
            }

            this.adjustTranslationToPivot(this.lastPivotX, this.lastPivotY, newScale);
            this.currentScale = newScale;
            this.applyTransform();

            this.zoomFrame = requestAnimationFrame(step);
        };
        this.zoomFrame = requestAnimationFrame(step);
    }

    private startMomentum() {
        if (this.momentumFrame) cancelAnimationFrame(this.momentumFrame);
        const friction = 0.95;
        const minVelocity = 0.02;

        const step = () => {
            this.currentX += (this.velocityX * 16) / this.currentScale;
            this.currentY += (this.velocityY * 16) / this.currentScale;

            // **PERF: Use new clamping function**
            const bounds = this.getClampedPosition(this.currentX, this.currentY);
            const outsideX = this.currentX != bounds.x;
            const outsideY = this.currentY != bounds.y;

            if (outsideX) this.velocityX *= -0.4; // Bounce
            if (outsideY) this.velocityY *= -0.4; // Bounce

            this.applyTransform();

            this.velocityX *= friction;
            this.velocityY *= friction;

            if (
                Math.abs(this.velocityX) > minVelocity ||
                Math.abs(this.velocityY) > minVelocity
            ) {
                this.momentumFrame = requestAnimationFrame(step);
            } else {
                this.momentumFrame = null;
                this.startBounceBack();
            }
        };
        this.momentumFrame = requestAnimationFrame(step);
    }

    private startBounceBack() {
        if (this.bounceFrame) cancelAnimationFrame(this.bounceFrame);

        // **PERF: Use new clamping function**
        const bounds = this.getClampedPosition(this.currentX, this.currentY);
        const dx = bounds.x - this.currentX;
        const dy = bounds.y - this.currentY;

        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
            // Already in bounds, just apply to be safe
            this.currentX = bounds.x;
            this.currentY = bounds.y;
            this.applyTransform();
            return;
        }

        const duration = 500;
        const startTime = performance.now();
        const startX = this.currentX;
        const startY = this.currentY;

        const animate = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

            this.currentX = startX + dx * ease;
            this.currentY = startY + dy * ease;
            this.applyTransform();

            if (progress < 1) {
                this.bounceFrame = requestAnimationFrame(animate);
            } else {
                this.bounceFrame = null;
                this.currentX = bounds.x;
                this.currentY = bounds.y;
                this.applyTransform();
            }
        };
        this.bounceFrame = requestAnimationFrame(animate);
    }

    /**
     * **PERF: Simplified**
     * Applies the current state to the DOM.
     * This function no longer performs any calculations.
     */
    private applyTransform(): void {
        this.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0) scale(${this.currentScale})`;
    }

    // --------------------------------------------------------------------------------
    // --- DIMENSION AND CLAMP UTILITIES ---
    // --------------------------------------------------------------------------------

    private updateContainerDimensions(): void {
        const wrapper = document.getElementById('zoom-wrapper');
        const content = document.getElementById('zoom-content');
        if (!wrapper || !content) return;

        this.containerWidth = wrapper.offsetWidth;
        this.containerHeight = wrapper.offsetHeight;
        this.contentWidth = content.scrollWidth;
        this.contentHeight = content.scrollHeight;
    }

    private fitContentInContainer(forceReset = false): void {
        if (!this.contentWidth || !this.containerWidth) return;
        const scaleX = this.containerWidth / this.contentWidth;
        const scaleY = this.containerHeight / this.contentHeight;
        this.initialFitScale = Math.min(scaleX, scaleY);

        if (forceReset || this.currentScale <= this.initialFitScale + 0.0001) {
            this.currentScale = this.initialFitScale;
            this.targetScale = this.initialFitScale;
            const scaledW = this.contentWidth * this.currentScale;
            const scaledH = this.contentHeight * this.currentScale;
            this.currentX = (this.containerWidth - scaledW) / 2;
            this.currentY = (this.containerHeight - scaledH) / 2;
        }

        // Ensure final position is valid
        this.startBounceBack();
    }

    /**
     * **NEW: Replaces getBoundedPosition and clampPosition**
     * Calculates the "hard" boundaries for the content.
     * If content is smaller than the container, the boundary is the center.
     * If content is larger, the boundary is the container edge.
     */
    private getClampedPosition(x: number, y: number): { x: number; y: number } {
        const scaledW = this.contentWidth * this.currentScale;
        const scaledH = this.contentHeight * this.currentScale;

        const minX = Math.min(0, this.containerWidth - scaledW);
        const minY = Math.min(0, this.containerHeight - scaledH);
        const maxX = Math.max(0, this.containerWidth - scaledW);
        const maxY = Math.max(0, this.containerHeight - scaledH);

        const centerX = (this.containerWidth - scaledW) / 2;
        const centerY = (this.containerHeight - scaledH) / 2;

        return {
            x: scaledW <= this.containerWidth ? centerX : Math.min(Math.max(x, minX), maxX),
            y: scaledH <= this.containerHeight ? centerY : Math.min(Math.max(y, minY), maxY)
        };
    }

    private adjustTranslationToPivot(pivotX: number, pivotY: number, newScale: number): void {
        const relX = (pivotX - this.currentX) / this.currentScale;
        const relY = (pivotY - this.currentY) / this.currentScale;
        let nextX = pivotX - relX * newScale;
        let nextY = pivotY - relY * newScale;

        // 1. Set the scale temporarily to calculate the new bounds
        const originalScale = this.currentScale;
        this.currentScale = newScale;

        // 2. Clamp the proposed new position
        const clampedPos = this.getClampedPosition(nextX, nextY);

        // 3. Restore the scale and set the clamped position
        this.currentScale = originalScale; // Restore to currentScale (if still mid-zoom) or keep newScale (if final)

        // For simplicity in the animation loop, let's just update the state here:
        this.currentX = clampedPos.x;
        this.currentY = clampedPos.y;

    }

    private getDistance(p1: PointerEvent, p2: PointerEvent): number {
        return Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
    }


    totalTime = 10 * 60; // 10 minutes in seconds
    remainingTime2 = this.totalTime;
    timerInterval: any;
    displayTime = '10:00';


    startTimer3(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.updateDisplayTime();
        this.timerInterval = setInterval(() => {
            if (this.remainingTime2 > 0) {
                this.remainingTime2--;
                this.updateDisplayTime();
            } else {
                this.stopTimer();
                window.location.reload();
            }
        }, 1000);
    }

    updateDisplayTime(): void {
        const minutes = Math.floor(this.remainingTime2 / 60);
        const seconds = this.remainingTime2 % 60;
        this.displayTime = `${this.pad2(minutes)} : ${this.pad2(seconds)}`;
    }

    pad2(num: number): string {
        return num < 10 ? '0' + num : num.toString();
    }

    stopTimer(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    generateQRWithLogo(qrText: string, logoUrl: string): Promise<string> {
        return new Promise((resolve, reject) => {

            const size = 300;
            const dpr = window.devicePixelRatio || 1;

            QRCode.toDataURL(qrText, {
                errorCorrectionLevel: 'H',
                margin: 2,
                width: size * dpr
            }).then(qrUrl => {

                const qrImg = new Image();
                const logoImg = new Image();

                qrImg.src = qrUrl;
                logoImg.src = logoUrl;
                // console.log('qrUrl', qrUrl)
                qrImg.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d')!;

                    canvas.width = size * dpr;
                    canvas.height = size * dpr;
                    canvas.style.width = `${size}px`;
                    canvas.style.height = `${size}px`;

                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                    ctx.imageSmoothingEnabled = false;

                    // Draw QR (crisp)
                    ctx.drawImage(qrImg, 0, 0, size, size);

                    logoImg.onload = () => {
                        const logoSize = size * 0.22; // 22%
                        const x = (size - logoSize) / 2;
                        const y = (size - logoSize) / 2;

                        // White background (important)
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(x - 6, y - 6, logoSize + 12, logoSize + 12);

                        // Enable smoothing only for logo
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';

                        ctx.drawImage(logoImg, x, y, logoSize, logoSize);

                        resolve(canvas.toDataURL('image/png'));
                    };

                    logoImg.onerror = reject;
                };

                qrImg.onerror = reject;
            }).catch(reject);
        });
    }


}
// Global listener (must be outside the component class)
const GLOBAL_TAB_CHANNEL = new BroadcastChannel("TAB_SESSION_CHANNEL_V1");

// Respond to PING messages from new/duplicate tabs
GLOBAL_TAB_CHANNEL.onmessage = (event: any) => {
    if (event?.data?.type == "PING") {
        GLOBAL_TAB_CHANNEL.postMessage({ type: "PONG" });
    }
};
// Helper to convert "06:00 PM" → "18:00" for correct sorting
function to24Hour(time: string): string {
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (period === 'AM' && hours === 12) hours = 0;
    else if (period === 'PM' && hours !== 12) hours += 12;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
function getEarliestDt(venues: any[]): string {
    return venues.reduce((min: string, v: any) => {
        const dt = `${v.EARLIEST_SHOW_DATE} ${to24Hour(v.EARLIEST_SHOW_TIME)}`;
        return !min || dt < min ? dt : min;
    }, '');
}

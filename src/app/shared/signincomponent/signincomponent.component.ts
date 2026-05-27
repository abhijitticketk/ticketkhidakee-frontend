import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Services/api.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { CommonFunctionService } from 'src/app/Services/CommonFunctionService';
import { Location } from '@angular/common';
import {  ReCaptcha2Component } from 'ngx-captcha';

declare global {
  interface Window {
    google: any;
  }
}

@Component({
  selector: 'app-signincomponent',
  templateUrl: './signincomponent.component.html',
  styleUrls: ['./signincomponent.component.scss'],
})
export class SignincomponentComponent {
  // declarations

  spinnerArray = Array(12);
  loadingRecords: boolean = false;
  currentYear: number = new Date().getFullYear();
  showCountryDropdown: boolean = false;
  searchQuery: string = '';
  filteredCountryCodes: any[] = [];
  step: 'enter' | 'otp' | 'password' = 'enter';
  countryCode: string = '+91';
  typeValue: any;
  type: 'M' | 'E' = 'M';
  password: string = '';
  userDetails: any = {};
  otp: string[] = ['', '', '', '', '', ''];
  remainingTime = 60;
  isverifyOTP = false;
  otpTouched = false;
  otpSent: boolean = false;

  isEmail(input: string): boolean {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(input);
  }
  isPhone: boolean = false;
  responseId: any;

  constructor(
    private api: ApiService,
    private router: Router,
    private toastr: ToastrService,
    private cookie: CookieService,
    private commonfunction: CommonFunctionService,
    private location: Location
  ) { }
  countryCodes = this.commonfunction.countryCodes;
  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/home']); // fallback
    }
  }
  isPhoneNumber(): boolean {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(this.typeValue);
  }

  onTypeValueChange(value: string) {
    this.typeValue = value;
    this.isPhone = /^[0-9]{10}$/.test(value);
  }

  toggleCountryDropdown() {
    this.showCountryDropdown = !this.showCountryDropdown;

    if (this.showCountryDropdown) {
      this.filteredCountryCodes = [...this.commonfunction.countryCodes];
      this.searchQuery = '';
    }
  }

  auth2: any;
  @ViewChild('loginButton', { static: true }) loginButton!: ElementRef;

  ngOnInit(): void {
    //
    //
  }

  // ---------------------------------------------- Sign  In With Google ------------------------------------------------

  ngAfterViewInit() {
    if (this.step === 'enter') {
      // this.initializeGoogleSignIn();
    }
  }

  initializeGoogleSignIn() {
    window.google.accounts.id.initialize({
      client_id:
        '481485469481-8j25h2n9i2hha0t8k8ibe8eile4qgk4v.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this),
    });

    window.google.accounts.id.renderButton(this.loginButton.nativeElement, {
      theme: 'outline',
      size: 'large',
    });
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

  decodeJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  isSendingOtp: boolean = false;

  restrictInput(event: KeyboardEvent) {
    if (this.isPhone) {
      const inputChar = String.fromCharCode(event.charCode);
      if (!/^[0-9]*$/.test(inputChar)) {
        event.preventDefault();
      }
    }
  }

  handleCredentialResponse(response: any) {
    const user = this.decodeJwt(response.credential);

    if (user && user.email) {
      const data = {
        TYPE_VALUE: 'E',
        VALUE: user.email,
        SIGNIN_WITH: 'Google',
      };

      this.api.googleverifyOTP(data).subscribe({
        next: (successCode: any) => {
          if (successCode.code === 200) {
            this.toastr.success('OTP verified successfully.', 'Success');

            const token = successCode.data[0]?.token;
            const memberData = successCode.data[0]?.memberData[0];

            if (token) {
              this.cookie.set('token', token, 365, '/', '', false, 'Strict');

              // this.cookie.set('locationname', memberData.LAST_LOCATION_NAME);
              sessionStorage.setItem('token', token);
            }

            if (memberData) {
              localStorage.setItem('memberId', memberData.ID.toString());
              if (
                user.ACTIVE_SUBSCRIPTION != undefined &&
                user.ACTIVE_SUBSCRIPTION != null
              )
                localStorage.setItem(
                  'ACTIVE_SUBSCRIPTION',
                  memberData.ACTIVE_SUBSCRIPTION.toString()
                );

              this.cookie.set(
                'userId',
                memberData.ID.toString(),
                365,
                '/',
                '',
                true,
                'None'
              ); // SameSite=None

              localStorage.setItem('isLogged', 'true');

              const encrypted = (key: unknown) =>
                this.commonfunction.encryptdata(key);
              const userFields: any = {};

              if (memberData.ID)
                userFields.userId = encrypted(memberData.ID.toString());
              if (memberData.NAME)
                userFields.userName = encrypted(memberData.NAME);
              if (memberData.MOBILE_NO)
                userFields.mobileNumber = encrypted(memberData.MOBILE_NO);
              if (memberData.EMAIL_ID)
                userFields.emailId = encrypted(memberData.EMAIL_ID);

              Object.entries(userFields).forEach(([key, value]) => {
                sessionStorage.setItem(key, String(value));
                localStorage.setItem(key, String(value));
              });
            }

            setTimeout(() => {
              this.router.navigate(['/home']).then(() => {
                window.location.reload();
              });
            }, 10);
          } else if (successCode.code === 404) {
            this.toastr.error(
              successCode.message || 'Invalid OTP for Mobile Number.',
              'Error'
            );
          } else {
            this.toastr.error(
              'An unexpected error occurred. Please try again.',
              'Error'
            );
          }
        },
        error: (errorResponse) => {
          this.isverifyOTP = false;
          const errorCode = errorResponse?.error?.code;
          // console.error('verifyOTP API failed:', errorResponse);

          if (errorCode === 300) {
            this.toastr.error(
              'Invalid request. Please check the entered details.'
            );
          } else {
            this.toastr.error('Something went wrong. Please try again.');
          }
        },
      });
    } else {
      // console.error('User email not found. Skipping API call.');
      this.toastr.error('Failed to get user information from Google.', 'Error');
    }
  }
  IS_NEW_MEMBER: any = false;
  // ---------------------------------------------- Sign  In With Google ------------------------------------------------

  // ---------------------------------------------- Send OTP ---------------------------------------------------------
  // sendOTP(form: NgForm) {
  //   if (
  //     form.invalid ||
  //     form.value.typeValue11 === undefined ||
  //     form.value.typeValue11 === null ||
  //     form.value.typeValue11 === ''
  //   ) {
  //     this.toastr.error('Please fill in all required fields.', 'Error');
  //     return;
  //   }

  //   this.isSendingOtp = true;
  //   const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.typeValue.trim());
  //   const payload = {
  //     TYPE: isEmail ? 'E' : 'M',
  //     TYPE_VALUE: this.typeValue.trim(),
  //   };

  //   this.api.sendOTP(payload).subscribe({
  //     next: (successCode: any) => {
  //       if (successCode.code == '200') {
  //         this.responseId = successCode.responseId;
  //         this.IS_NEW_MEMBER = successCode.IS_NEW_MEMBER
  //         if (payload.TYPE === 'M') {
  //           this.step = 'otp';
  //           this.toastr.success(
  //             'OTP sent successfully. Please check your mobile.',
  //             'Success'
  //           );
  //         } else {
  //           this.step = 'otp';
  //           this.toastr.success(
  //             'OTP sent successfully. Please check your email.',
  //             'Success'
  //           );
  //         }
  //         // this.otpSent = true;
  //         this.startTimer();
  //       } else {
  //         this.step = 'enter';
  //         this.toastr.error('Failed to send OTP. Please try again.', 'Error');
  //       }
  //       this.isSendingOtp = false;
  //  this.captchaRef.resetCaptcha();
  // ;
  //         this.captchaToken = null;
  //     },
  //     error: () => {
  //       this.step = 'enter';
  //       this.isSendingOtp = false;
  //       this.toastr.error(
  //         'Error in sending OTP. Please try again later.',
  //         'Error'
  //       );
  //    this.captchaRef.resetCaptcha();
  // ;
  //         this.captchaToken = null;
  //     },
  //     complete: () => {
  //       this.isSendingOtp = false;
  //     },
  //   });
  // }

  @ViewChild('captchaRef') captchaRef!: ReCaptcha2Component;
  captchaToken: string | null = null;

  // ================= CAPTCHA Event Handlers =================
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

  // ================= Send OTP =================
  IS_RESEND: boolean = false;
  IS_MULTIPLE_EMAIL: boolean = false;
  sendOTP(form: NgForm) {
    // Check required fields
    if (form.invalid || !this.typeValue) {
      this.toastr.error('Please fill in all required fields.', 'Error');
      return;
    }

    // Check if CAPTCHA is completed
    if (!this.IS_RESEND && !this.captchaToken) {
      this.toastr.error(
        'Please complete the CAPTCHA before sending OTP.',
        'Error'
      );
      return;
    }

    this.isSendingOtp = true;
    this.IS_MULTIPLE_EMAIL = false;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.typeValue.trim());
    const payload: any = {
      TYPE: isEmail ? 'E' : 'M',
      TYPE_VALUE: this.typeValue.trim(),
      IS_RESEND: this.IS_RESEND
    };

    if (!this.IS_RESEND) {
      payload.CAPTCHA_RESPONSE = this.captchaToken;
    }

    this.api.sendOTP(payload).subscribe({
      next: (res: any) => {
        if (res.code == '200') {
          this.responseId = res.responseId;
          this.IS_NEW_MEMBER = res.IS_NEW_MEMBER;
          this.IS_MULTIPLE_EMAIL = res.IS_MULTIPLE_EMAIL;
          this.step = 'otp';
          const msg =
            payload.TYPE == 'M'
              ? 'OTP has been sent to you via WhatsApp. Please check your WhatsApp.'
              : 'OTP sent successfully. Please check your email.';
          this.toastr.success(msg, 'Success');
          this.startTimer();
        } else if (res.code == '300') {
          this.toastr.warning(
            res.message || 'Too many OTP requests. Please try again after some time.',
            'Warning'
          );
        } else if (res.code == '400') {
          this.toastr.error(
            res.message || 'Invalid CAPTCHA. Please try again.',
            'Error'
          );
        } else {
          this.toastr.error(
            res.message || 'Failed to send OTP. Please try again.',
            'Error'
          );
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
        this.toastr.error(
          'Error sending OTP. Please try again later.',
          'Error'
        );

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
        }
        this.IS_RESEND = false;
      },
    });
  }

  resendOtp() {
    this.otp = ['', '', '', ''];

    if (
      this.typeValue === undefined ||
      this.typeValue === null ||
      this.typeValue === ''
    ) {
      this.toastr.error('Please fill in all required fields.', 'Error');
      return;
    }

    this.IS_RESEND = true;

    this.isSendingOtp = true;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.typeValue.trim());
    const payload = {
      TYPE: isEmail ? 'E' : 'M',
      TYPE_VALUE: this.typeValue.trim(),
      IS_RESEND: true
    };

    this.api.sendOTP(payload).subscribe({
      next: (successCode: any) => {
        if (successCode.code == '200') {
          this.responseId = successCode.responseId;
          this.IS_NEW_MEMBER = successCode.IS_NEW_MEMBER;
          if (payload.TYPE === 'M') {
            this.step = 'otp';
            this.toastr.success(
              'OTP has been sent to you via WhatsApp. Please check your WhatsApp.',
              'Success'
            );
          } else {
            this.step = 'otp';
            this.toastr.success(
              'OTP sent successfully. Please check your email.',
              'Success'
            );
          }
          // this.otpSent = true;
          this.startTimer();
        } else {
          this.step = 'otp';
          this.toastr.error('Failed to send OTP. Please try again.', 'Error');
        }
        this.isSendingOtp = false;
        this.IS_RESEND = false;

      },
      error: () => {
        this.step = 'otp';
        this.isSendingOtp = false;
        this.IS_RESEND = false;

        this.toastr.error(
          'Error in sending OTP. Please try again later.',
          'Error'
        );
      },
      complete: () => {
        this.isSendingOtp = false;
        this.IS_RESEND = false;

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

  // ---------------------------------------------- Send OTP ---------------------------------------------------------

  // ---------------------------------------------- Edit Number Email ---------------------------------------------------------

  openLoginModal() {
    this.otp = ['', '', '', '', '', ''];
    this.otp[0] = '';
    this.otp[1] = '';
    this.otp[2] = '';
    this.otp[3] = '';
    this.otp[4] = '';
    this.otp[5] = '';
    (this.responseId = ''), (this.isSendingOtp = false), (this.typeValue = '');
    this.otpTouched = false;
    this.step = 'enter';
  }

  // ---------------------------------------------- Edit Number Email ---------------------------------------------------------

  // ---------------------------------------------- OTP & Verify OTP ---------------------------------------------------------

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
    return this.otp.some((d) => d === '') || this.otp.join('').length !== 6;
  }

  userName: string = '';
  mobile: string = '';
  VerifyOTP() {
    this.otpTouched = true;

    if (this.otpInvalid) {
      this.toastr.warning('Please enter a valid OTP.', 'Warning');
      return;
    } else if (this.userName.trim() === '' && this.IS_NEW_MEMBER) {
      this.toastr.warning('Please enter a Name.', 'Warning');
      return;
    } else if (this.mobile.trim() == '' && this.IS_MULTIPLE_EMAIL) {
      this.toastr.warning('Please enter a mobile no.', 'Warning');
      return;
    } else if (this.mobile.trim() != '' && this.IS_MULTIPLE_EMAIL && /^[6-9][0-9]{9}$/.test(this?.mobile.trim()) == false) {
      this.toastr.warning('Please enter valid mobile no.', 'Warning');
      return;
    }

    this.isverifyOTP = true;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this?.typeValue.trim());
    const data = {
      TYPE_VALUE: this.typeValue,
      TYPE: isEmail ? 'E' : 'M',
      OTP: this.otp.join(''),
      ID: this.responseId,
      NAME: this.userName.trim(),
      IS_MULTIPLE_EMAIL: this.IS_MULTIPLE_EMAIL,
      MOBILE: this.mobile.trim(),
    };

    this.loadingRecords = true;
    this.api.verifyOTP(data).subscribe({
      next: (successCode: any) => {

        this.loadingRecords = true;
        if (successCode.code == 200) {
          this.toastr.success('Logged in successfully', 'Success');

          const token = successCode.data[0]?.token;
          const user = successCode.data[0]?.memberData[0];

          if (token) {
            this.cookie.set('token', token, 365, '/', '', false, 'Strict');

            // this.cookie.set('locationname', user.LAST_LOCATION_NAME );
            sessionStorage.setItem('token', token);
          }
          if (user) {
            localStorage.setItem('memberId', user.ID.toString());
            if (
              user.ACTIVE_SUBSCRIPTION != undefined &&
              user.ACTIVE_SUBSCRIPTION != null
            )
              localStorage.setItem(
                'ACTIVE_SUBSCRIPTION',
                user.ACTIVE_SUBSCRIPTION.toString()
              );
            this.cookie.set(
              'userId',
              user.ID.toString(),
              365,
              '/',
              '',
              true,
              'None'
            ); // SameSite=None

            localStorage.setItem('isLogged', 'true');

            const encrypted = (key: unknown) =>
              this.commonfunction.encryptdata(key);

            const userFields: any = {};

            if (user.ID) {
              userFields.userId = encrypted(user.ID.toString());
            }
            if (user.NAME) {
              userFields.userName = encrypted(user.NAME);
            }
            if (user.MOBILE_NO) {
              userFields.mobileNumber = encrypted(user.MOBILE_NO);
            }
            if (user.EMAIL_ID) {
              userFields.emailId = encrypted(user.EMAIL_ID);
            }

            // Store encrypted fields in sessionStorage and localStorage
            Object.entries(userFields).forEach(([key, value]) => {
              sessionStorage.setItem(key, String(value));
              localStorage.setItem(key, String(value));
            });
          }

          this.isverifyOTP = false;

          // setTimeout(() => {
          //   this.router.navigate(['/home']).then(() => {
          //     window.location.reload();
          //   });
          //   this.otp = ['', '', '', '', '', ''];
          //   this.loadingRecords = false;
          // }, 100);

          setTimeout(() => {
            if (window.history.length > 1) {
              this.location.back(); // This is synchronous, but back navigation may take time to render
              setTimeout(() => {
                window.location.reload();
              }, 100); // Wait briefly for navigation to complete
            } else {
              this.router.navigate(['/home']).then(() => {
                window.location.reload();
              });
            }

            this.otp = ['', '', '', '', '', ''];
            this.loadingRecords = false;
          }, 100);

          // setTimeout(() => {
          //   this.router.navigate(['/home']);

          // }, 2000);
        } else if (successCode.code == 404) {
          this.isverifyOTP = false;
          this.toastr.error(
            successCode.message || 'Invalid OTP.',
            'Error'
          );
        } else if (successCode.code == '400') {

          this.isverifyOTP = false;
          this.toastr.error(
            successCode.message || 'Failed to Verify Otp.',
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
      error: (errorResponse) => {
        this.isverifyOTP = false;

        const errorCode = errorResponse?.error?.code;
        // console.error('verifyOTP API failed:', errorResponse);

        if (errorCode === 300) {
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

  // ---------------------------------------------- OTP & Verify OTP ---------------------------------------------------------

  loginWithPassword() {
    this.toastr.success('Logged in successfully!', 'Success');
    this.router.navigate(['/home']);
  }

  // socialLogin(provider: string) {
  //   // Placeholder: integrate social login SDK
  //
  //   this.toastr.success(`Logged in via ${provider} successfully!`, 'Success');
  // }

  // socialLogin(provider: string) {
  //   if (provider === 'google') {
  //     this.googleLogin();
  //   } else if (provider === 'facebook') {
  //     // Later you can implement Facebook login
  //     this.toastr.info('Facebook login coming soon!', 'Info');
  //   }
  // }

  // googleLogin() {
  //   this.googleAuthService.initializeGoogleSignIn((response: any) => {
  //     if (!response || !response.credential) {
  //
  //       this.redirectToGoogleLogin(); // Redirect if not already signed in
  //       return;
  //     }

  //

  //     const idToken = response.credential;
  //

  //     const base64Url = idToken.split('.')[1];
  //     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  //     const jsonPayload = decodeURIComponent(
  //       atob(base64)
  //         .split('')
  //         .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
  //         .join('')
  //     );

  //     const payload = JSON.parse(jsonPayload);

  //     const socialLoginId = payload.sub;
  //

  //     this.toastr.success('Logged in via Google successfully!', 'Success');

  //     // TODO: Save user info to backend or localstorage if needed
  //   });

  //   this.googleAuthService.promptGoogleLogin();
  // }

  // This will handle the redirection if prompt fails
  // redirectToGoogleLogin() {
  //   const clientId = this.googleAuthService.getClientId();
  //   const redirectUri = window.location.origin; // Update if you have a specific callback page
  //   const scope = 'openid email profile';

  //   const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;

  //   window.location.href = googleLoginUrl;
  // }

  // @ViewChild('someElement') someElementRef!: ElementRef;
}

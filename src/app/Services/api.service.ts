import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { CommonFunctionService } from './CommonFunctionService';
import { environment } from '../environment';


export interface Banner {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {



  commonimgUrl = environment.commonimgUrl;
  private apiUrl = environment.apiUrl;

  commonapikey = environment.commonapikey;
  commonapplicationkey = environment.commonapplicationkey;
  versionNumber = environment.versionNumber;
  taglabel = environment.taglabel;
  retriveimgUrl = environment.retriveimgUrl;

  token = this.cookie.get('token') || ' ';

  constructor(private http: HttpClient, private cookie: CookieService) {
    this.getOrCreateDeviceId();
  }

  public commonFunction = new CommonFunctionService();


  httpHeaders = new HttpHeaders();
  options = {
    headers: this.httpHeaders,
  };

  httpHeaders1 = new HttpHeaders();
  options1 = {
    headers: this.httpHeaders1,
  };
  isMobileDevice(): boolean {
    return window.innerWidth <= 900; // or whatever breakpoint you prefer
  }
  isMobileDevice2(): boolean {
    return window.innerWidth < 768; // or whatever breakpoint you prefer
  }
  getLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        reject(new Error('Geolocation not supported'));
      }
    });
  }

  getOrCreateDeviceId(): string {
    // Try to get the existing ID
    let deviceId = localStorage.getItem('deviceId');

    // If not found, generate one
    if (deviceId == undefined || deviceId == null || deviceId == '' || deviceId == ' ') {
      deviceId = this.generateUUID();
      localStorage.setItem('deviceId', deviceId);
    }

    return deviceId;
  }

  // UUID generator (no package needed)
  generateUUID(): string {
    return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  getAllGlobalData(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string,
    search:string
    // CITY_ID:any
  ): Observable<any> {
    const data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
      search:search
      // CITY_ID:CITY_ID
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}search/globalSearch`, data, {
      headers,
    });
  }

  // getBanners(
  //   pageIndex: number,
  //   pageSize: number,
  //   sortKey: string = '',
  //   sortValue: string = '',
  //   filter: string = ''
  // ): Observable<any> {
  //   const requestData = {
  //     pageIndex,
  //     pageSize,
  //     sortKey,
  //     sortValue,
  //     filter,
  //   };

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
  //     apikey: this.commonFunction.encryptdata(this.commonapikey),
  //     token: this.cookie.get('token'),
  //     deviceid: this.commonFunction.encryptdata(this.cookie.get('deviceId')),
  //     supportkey: this.commonFunction.encryptdata(this.cookie.get('supportKey')),
  //   });

  //   return this.http.post<any>(`${this.apiUrl}banner/get `, requestData, {
  //     headers,
  //   });
  // }

  //  Login

  sendOTP(data: any): Observable<any> {
    const requestData = {
      VALUE: data.TYPE_VALUE,
      TYPE: data.TYPE,
      LOGGED_IN: data.LOGGED_IN,
      CAPTCHA_RESPONSE: data.CAPTCHA_RESPONSE,
      IS_RESEND: data.IS_RESEND,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}member/sendOTP
 `,
      requestData,
      { headers }
    );
  }
  sendOTPNoShoot(data: any): Observable<any> {
    const requestData = {
      VALUE: data.TYPE_VALUE,
      TYPE: data.TYPE,
      LOGGED_IN: data.LOGGED_IN,
      CAPTCHA_RESPONSE: data.CAPTCHA_RESPONSE,
      IS_RESEND: data.IS_RESEND,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}member/sendOTPNoShoot
 `,
      requestData,
      { headers }
    );
  }
  sendOTPwithapi(data: any): Observable<any> {
    const requestData = {
      VALUE: data.TYPE_VALUE,
      TYPE: data.TYPE,
      LOGGED_IN: data.LOGGED_IN,
      CAPTCHA_RESPONSE: data.CAPTCHA_RESPONSE,
      IS_RESEND: data.IS_RESEND,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/member/profileOTP
 `,
      requestData,
      { headers }
    );
  }

  submitContactDetails(data: any): Observable<any> {
    // data.CLIENT_ID = this.clientId;

    const requestData = {
      NAME: data.NAME,
      // LAST_NAME: data.LAST_NAME,
      EMAIL_ID: data.EMAIL_ID,
      CONTACT_NO: data.CONTACT_NO,
      MESSAGE: data.MESSAGE,
      CLIENT_ID: 1,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}contactus/create`, requestData, {
      headers,
    });
  }

  verifyOTPold(data: any): Observable<any> {
    const requestData = {
      VALUE: data.TYPE_VALUE,
      TYPE: data.TYPE,
      OTP: data.OTP,
      ID: data.ID,
      NAME: data.NAME
    };

    // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}member/verifyOTP`, requestData, {
      headers,
    });
  }
  googleverifyOTP(data: any): Observable<any> {
    const requestData = {
      TYPE: data.TYPE_VALUE,
      VALUE: data.VALUE,
      SIGNIN_WITH: data.SIGNIN_WITH,
    };

    // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
    });

    return this.http.post<any>(`${this.apiUrl}member/verifyOTP`, requestData, {
      headers,
    });
  }
  verifyInOTP(data: any): Observable<any> {
    const requestData = {
      VALUE: data.TYPE_VALUE,
      TYPE: data.TYPE,
      OTP: data.OTP,
      ID: data.ID,
      MEMBER_ID: data.MEMBER_ID,
    };

    // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token'),
    });

    return this.http.post<any>(
      `${this.apiUrl}api/member/profileVerifyOTP`,
      requestData,
      {
        headers,
      }
    );
  }

  userLogout(USER_ID: any): Observable<any> {
    // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    var requestData = {
      VALUE: USER_ID,
    };

    return this.http.post<any>(`${this.apiUrl}api/member/logout`, requestData, {
      headers,
    });
  }

  // city master

  getAllCities(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(`${this.apiUrl}city/get`, data, { headers });
  }
  getAllGenres(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    const data = { pageIndex, pageSize, sortKey, sortValue, filter };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(`${this.apiUrl}api/genres/get`, data, {
      headers,
    });
  }

  getAllTermsConditions(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    const data = { pageIndex, pageSize, sortKey, sortValue, filter };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(`${this.apiUrl}api/termsConditions/get`, data, {
      headers,
    });
  }

  getAllLanguages(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    const data = { pageIndex, pageSize, sortKey, sortValue, filter };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(`${this.apiUrl}api/language/get`, data, {
      headers,
    });
  }

  getAllCategories(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    const data = { pageIndex, pageSize, sortKey, sortValue, filter };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(`${this.apiUrl}category/get`, data, {
      headers,
    });
  }

  getUserData(
    pageIndex: number = 0,
    pageSize: number = 0,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}api/member/get`, requestData, {
      headers,
    });
  }

  getBlogData(
    pageIndex: number = 0,
    pageSize: number = 0,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}api/blog/get`, requestData, {
      headers,
    });
  }
  // getBlogData2(
  //   pageIndex: number = 0,
  //   pageSize: number = 0,
  //   sortKey: string = '',
  //   sortValue: string = '',
  //   filter: any = ''
  // ): Observable<any> {
  //   const requestData = {
  //     pageIndex,
  //     pageSize,
  //     sortKey,
  //     sortValue,
  //     filter,
  //   };

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
  //     apikey: this.commonFunction.encryptdata(this.commonapikey),
  //     token: this.cookie.get('token') || ' ',
  //   });

  //   return this.http.post<any>(`${this.apiUrl}web/getBlog`, requestData, {
  //     headers,
  //   });
  // }

  getCityMaster(
    pageIndex: number = 0,
    pageSize: number = 0,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}api/city/get`, requestData, {
      headers,
    });
  }

  clientId = 1;

  UpdateUser(user: any): Observable<any> {
    //

    user.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.put<any>(`${this.apiUrl}api/member/update`, user, {
      headers,
    });
  }
  // For setting upload headers
  onuploadheader() {
    this.httpHeaders1 = new HttpHeaders({
      Accept: 'application/json',
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      supportkey: this.commonFunction.encryptdata(this.cookie.get('supportKey')) || '',
      token: this.cookie.get('token') || ' ',

    });

    this.options1 = {
      headers: this.httpHeaders1,
    };
  }

  // For uploading image
  onUpload(
    folderName: string,
    selectedFile: File,
    filename: string,
    oldname: string
  ): Observable<any> {
    this.onuploadheader();

    const formData = new FormData();

    formData.append('Image', selectedFile, filename);

    const meta = { 'OLD_FILE_NAME': oldname };
    formData.append('meta', JSON.stringify(meta));
    const req = new HttpRequest(
      'POST',
      `${this.commonimgUrl}${folderName}`,
      formData,
      {
        headers: this.httpHeaders1,
        reportProgress: true,
      }
    );

    return this.http.request(req);
  }

  getMemberEmailPreferences(
    pageIndex: number = 0,
    pageSize: number = 0,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/memberEmailPreferences/get`,
      requestData,
      {
        headers,
      }
    );
  }

  // clientId = 1;

  UpdateMemberEmailPreferences(user: any): Observable<any> {
    //

    user.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.put<any>(
      `${this.apiUrl}api/memberEmailPreferences/update`,
      user,
      {
        headers,
      }
    );
  }
  getPushPreferences(
    pageIndex: number = 0,
    pageSize: number = 0,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/memberPushPreferences/get`,
      requestData,
      {
        headers,
      }
    );
  }

  // clientId = 1;

  UpdatePushPreferences(user: any): Observable<any> {
    //

    user.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.put<any>(
      `${this.apiUrl}api/memberPushPreferences/update`,
      user,
      {
        headers,
      }
    );
  }
  getinAppPreferences(
    pageIndex: number = 0,
    pageSize: number = 0,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/memberInAppPreferences/get`,
      requestData,
      {
        headers,
      }
    );
  }

  getMemberWhatsappPreferences(
    pageIndex: number = 0,
    pageSize: number = 0,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/memberWhatsappPreferences/get`,
      requestData,
      {
        headers,
      }
    );
  }
  getMemberSmsPreferences(
    pageIndex: number = 0,
    pageSize: number = 0,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/memberSmsPreferences/get`,
      requestData,
      {
        headers,
      }
    );
  }

  // clientId = 1;

  UpdateMemberWhatsappPreferences(user: any): Observable<any> {
    //

    user.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.put<any>(
      `${this.apiUrl}api/memberWhatsappPreferences/update`,
      user,
      {
        headers,
      }
    );
  }

  // UpdateMemberSmsPreferences(user: any): Observable<any> {
  //   //
  //

  //   user.CLIENT_ID = this.clientId;
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
  //     apikey: this.commonFunction.encryptdata(this.commonapikey),
  //     token: this.cookie.get('token') || ' ',
  //   });

  //   return this.http.put<any>(
  //     `${this.apiUrl}api/memberSmsPreferences/update`,
  //     user,
  //     {
  //       headers,
  //     }
  //   );
  // }

  UpdateMemberSmsPreferences(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token'),
    });
    return this.http.put<any>(
      `${this.apiUrl}api/memberSmsPreferences/update`,
      data,
      { headers }
    );
  }

  UpdateinAppPreferences(user: any): Observable<any> {
    user.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.put<any>(
      `${this.apiUrl}api/memberInAppPreferences/update`,
      user,
      {
        headers,
      }
    );
  }

  getCastDetails(
    pageIndex: number = 0,
    pageSize: number = 0,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    // return this.http.post<any>(`${this.apiUrl}movie/getCastDetails`, requestData, {
    //   headers,
    // });
    return this.http.post<any>(`${this.apiUrl}cast/get`, requestData, {
      headers,
    });
  }

  // < ----------------------------------------- Home  -----------------------------------------  >

  getBanners(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token'),
      deviceid: this.commonFunction.encryptdata(this.cookie.get('deviceId')),
      supportkey: this.commonFunction.encryptdata(this.cookie.get('supportKey')),
    });

    return this.http.post<any>(`${this.apiUrl}banner/get`, requestData, {
      headers,
    });
  }
  getHomeData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = '',
    cityId: number
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      CITY_ID: cityId,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token'),
      deviceid: this.commonFunction.encryptdata(this.cookie.get('deviceId')),
      supportkey: this.commonFunction.encryptdata(this.cookie.get('supportKey')),
    });

    return this.http.post<any>(
      // `${this.apiUrl}websiteSectionMapping/getSectionsWithEvents`,
      `${this.apiUrl}websiteSectionMapping/getSectionsWithEvents`,
      // `${this.apiUrl}websiteSectionManagement/getMappingData`,
      requestData,
      {
        headers,
      }
    );
  }
  getLangaugeData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token'),
      deviceid: this.commonFunction.encryptdata(this.cookie.get('deviceId')),
      supportkey: this.commonFunction.encryptdata(this.cookie.get('supportKey')),
    });

    return this.http.post<any>(`${this.apiUrl}language/get`, requestData, {
      headers,
    });
  }
  getGenresData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token'),
      deviceid: this.commonFunction.encryptdata(this.cookie.get('deviceId')),
      supportkey: this.commonFunction.encryptdata(this.cookie.get('supportKey')),
    });

    return this.http.post<any>(`${this.apiUrl}genres/get`, requestData, {
      headers,
    });
  }
  getMovieData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}movie/get`, requestData, {
      headers,
    });
  }
  getMovieDetails(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}movie/getMovieDetails`,
      requestData,
      {
        headers,
      }
    );
  }
  getCityWiseMoviesData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = '',
    cityId: number
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      CITY_ID: cityId,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}scheduleMovieDetails/getCityWiseMovies`,
      requestData,
      {
        headers,
      }
    );
  }
  getEventData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}event/get`, requestData, {
      headers,
    });
  }
  getScheduleActivityDetails(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}scheduleActivityDetails/get`,
      requestData,
      {
        headers,
      }
    );
  }
  RateUS(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(
      this.apiUrl + 'api/movieRatingReviewMapping/create',
      JSON.stringify(data),
      { headers }
    );
  }

  getMovieRating(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/movieRatingReviewMapping/get`,
      requestData,
      {
        headers,
      }
    );
  }

  getAllTheatersByCity(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
    // cityid:any
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
      // CITY_ID: cityid
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(`${this.apiUrl}theatre/get`, data, { headers });
  }

  getAllLikes(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    const data = { pageIndex, pageSize, sortKey, sortValue, filter };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(
      `${this.apiUrl}api/theatreInterestMapping/get`,
      data,
      {
        headers,
      }
    );
  }

  createLike(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/theatreInterestMapping/create`,
      data,
      { headers }
    );
  }

  updateLike(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.put<any>(
      `${this.apiUrl}api/theatreInterestMapping/update`,
      data,
      { headers }
    );
  }

  getScheduledShows(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    MOVIE_DATE: any,
    filter: string
  ): Observable<any> {
    var data: any = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
      MOVIE_DATE: MOVIE_DATE.MOVIE_DATE,
      THEATER_ID: MOVIE_DATE.THEATER_ID,
      MOVIE_ID: MOVIE_DATE.MOVIE_ID,
    };
    // Add conditionally if values exist
    if (MOVIE_DATE.MOVIE_LANGUAGE) {
      data.MOVIE_LANGUAGE = MOVIE_DATE.MOVIE_LANGUAGE;
    }

    if (MOVIE_DATE.MOVIE_SCREEN_TYPE) {
      data.MOVIE_SCREEN_TYPE = MOVIE_DATE.MOVIE_SCREEN_TYPE;
    }
    if (MOVIE_DATE.NAME) {
      data.NAME = MOVIE_DATE.NAME;
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      this.apiUrl + 'scheduleMovieDetails/getScheduledShowsInTheater',
      JSON.stringify(data),
      { headers }
    );
  }

  getScheduledShowsByTheater(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = '',
    movieId: number,
    cityId: number
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      MOVIE_ID: movieId,
      CITY_ID: cityId,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token'),
    });

    return this.http.post<any>(
      `${this.apiUrl}scheduleMovieDetails/getScheduledShowsByTheater`,
      requestData,
      {
        headers,
      }
    );
  }

  getScheduledShowsByTheaternew(
    movieId: number,
    cityId: number,
    language: string = '',
    screenType: string = '',
    date: string = '',
    searchText: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex: 0,
      pageSize: 0,
      sortKey: '',
      sortValue: '',
      filter: '',
      MOVIE_ID: movieId,
      THEATER_CITY_ID: cityId,
      MOVIE_LANGUAGE: language,
      MOVIE_SCREEN_TYPE: screenType,
      MOVIE_DATE: date,
      THEATER_NAME: searchText,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token'),
    });

    return this.http.post<any>(
      `${this.apiUrl}scheduleMovieDetails/getScheduledShowsByTheater`,
      requestData,
      { headers }
    );
  }

  // Plays

  // getCityWiseALLData(
  //   pageIndex: number,
  //   pageSize: number,
  //   sortKey: string = '',
  //   sortValue: string = '',
  //   filter: any,
  //   cityId: number,
  //   categoryId: string
  // ): Observable<any> {
  //   const requestData = {
  //     pageIndex,
  //     pageSize,
  //     sortKey,
  //     sortValue,
  //     filter,
  //     cityId,
  //     categoryId: categoryId.toString(),
  //   };

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
  //     apikey: this.commonFunction.encryptdata(this.commonapikey),
  //     token: this.cookie.get('token') || ' ',
  //   });

  //   return this.http.post<any>(
  //     // `${this.apiUrl}schedulePlayDetails/getCityWisePlays`,
  //     // `${this.apiUrl}web/getWebNowShowingAndUpcomingEvents`,
  //     `${this.apiUrl}web/getEventList`,
  //     requestData,
  //     {
  //       headers,
  //     }
  //   );
  // }

  getCityWisePlaysData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = '',
    CITY_ID: number
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      CITY_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      // `${this.apiUrl}schedulePlayDetails/getCityWisePlays`,
      `${this.apiUrl}schedulePlayDetails/getCityWisePlays`,
      //     `${this.apiUrl}web/getWebNowShowingAndUpcomingEvents
      //  `,
      requestData,
      {
        headers,
      }
    );
  }
  getPlayDetails(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = '',
    eventId: any,
    cityId: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      eventId: eventId,
      cityId: cityId,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      // `${this.apiUrl}play/getPlayDetails`,
      `${this.apiUrl}web/getWebEventDetailsWithSchedules`,
      requestData,
      {
        headers,
      }
    );
  }

  getPlayData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}play/get`, requestData, {
      headers,
    });
  }

  RateOurPlay(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(
      this.apiUrl + 'api/playRatingReviewMapping/create',
      JSON.stringify(data),
      { headers }
    );
  }

  getPlayRating(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/playRatingReviewMapping/get`,
      requestData,
      {
        headers,
      }
    );
  }

  getSubCategory(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token'),
      deviceid: this.commonFunction.encryptdata(this.cookie.get('deviceId')),
      supportkey: this.commonFunction.encryptdata(this.cookie.get('supportKey')),
    });

    return this.http.post<any>(`${this.apiUrl}subCategory/get`, requestData, {
      headers,
    });
  }
  getTagsData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token'),
      deviceid: this.commonFunction.encryptdata(this.cookie.get('deviceId')),
      supportkey: this.commonFunction.encryptdata(this.cookie.get('supportKey')),
    });

    return this.http.post<any>(`${this.apiUrl}tags/get`, requestData, {
      headers,
    });
  }

  getsessionmaappingdata(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = '',
    CITY_ID: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      CITY_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token'),
      deviceid: this.commonFunction.encryptdata(this.cookie.get('deviceId')),
      supportkey: this.commonFunction.encryptdata(this.cookie.get('supportKey')),
    });

    return this.http.post<any>(
      `${this.apiUrl}web/getHomeSectionsWithEvents`,
      requestData,
      {
        headers,
      }
    );
  }

  getMoreEventsForSection(
    pageIndex: number,
    pageSize: number,
    SECTION_ID: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      SECTION_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token'),
      deviceid: this.commonFunction.encryptdata(this.cookie.get('deviceId')),
      supportkey: this.commonFunction.encryptdata(this.cookie.get('supportKey')),
    });

    return this.http.post<any>(
      `${this.apiUrl}web/getSectionItems`,
      requestData,
      { headers }
    );
  }

  getallwishlist(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    const data = { pageIndex, pageSize, sortKey, sortValue, filter };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(
      `${this.apiUrl}api/eventInterestMapping/get`,
      data,
      {
        headers,
      }
    );
  }
  getallwishlist2(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    const data = { pageIndex, pageSize, sortKey, sortValue, filter };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(
      `${this.apiUrl}api/eventInterestMapping/getWishlistData`,
      data,
      {
        headers,
      }
    );
  }

  createBookmark(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/eventInterestMapping/create`,
      data,
      { headers }
    );
  }
  updateBookmark(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.put<any>(
      `${this.apiUrl}api/eventInterestMapping/update`,
      data,
      { headers }
    );
  }

  getCityWiseALLData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: any,
    cityId: number,
    CATEGORY_ID: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      cityId,
      CATEGORY_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      // `${this.apiUrl}schedulePlayDetails/getCityWisePlays`,
      // `${this.apiUrl}web/getWebNowShowingAndUpcomingEvents`,
      `${this.apiUrl}web/getEventList`,
      requestData,
      {
        headers,
      }
    );
  }
  getEventListNew(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: any,
    cityId: number,
    CATEGORY_ID: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      cityId,
      CATEGORY_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      // `${this.apiUrl}schedulePlayDetails/getCityWisePlays`,
      // `${this.apiUrl}web/getWebNowShowingAndUpcomingEvents`,
      `${this.apiUrl}web/getEventListNew`,
      requestData,
      {
        headers,
      }
    );
  }
  // 
  getCityWiseALLData1(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: any,
    cityId: number,
    categoryId: string
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      cityId,
      categoryId: categoryId.toString(),
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      // `${this.apiUrl}schedulePlayDetails/getCityWisePlays`,
      // `${this.apiUrl}web/getWebNowShowingAndUpcomingEvents`,
      `${this.apiUrl}web/getEventList`,
      requestData,
      {
        headers,
      }
    );
  }

  getBannerEventsData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = '',
    CITY_ID: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      CITY_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token'),
      deviceid: this.commonFunction.encryptdata(this.cookie.get('deviceId')),
      supportkey: this.commonFunction.encryptdata(this.cookie.get('supportKey')),
    });

    return this.http.post<any>(
      `${this.apiUrl}web/getHomeSectionsWithEvents`,
      requestData,
      {
        headers,
      }
    );
  }

  getSectionMappting(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string,
    BANNER_ID: any,
    CITY_ID: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      BANNER_ID,
      CITY_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token'),
      deviceid: this.commonFunction.encryptdata(this.cookie.get('deviceId')),
      supportkey: this.commonFunction.encryptdata(this.cookie.get('supportKey')),
    });

    return this.http.post<any>(
      `${this.apiUrl}bannerEventMapping/getBannerEvents`,
      requestData,
      {
        headers,
      }
    );
  }

  getalleventlikes(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    const data = { pageIndex, pageSize, sortKey, sortValue, filter };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(
      `${this.apiUrl}api/eventInterestMapping/get`,
      data,
      {
        headers,
      }
    );
  }

  createeventLike(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/eventInterestMapping/create`,
      data,
      { headers }
    );
  }

  updateeventLike(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.put<any>(
      `${this.apiUrl}api/eventInterestMapping/update`,
      data,
      { headers }
    );
  }

  // event like dislike

  getalleventRatingReviewLikes(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    const data = { pageIndex, pageSize, sortKey, sortValue, filter };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(
      `${this.apiUrl}api/eventRatingReviewLikes/get`,
      data,
      {
        headers,
      }
    );
  }

  createeventRatingReviewLikes(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/eventRatingReviewLikes/create`,
      data,
      { headers }
    );
  }

  updateeventRatingReviewLikes(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.put<any>(
      `${this.apiUrl}api/eventRatingReviewLikes/update`,
      data,
      { headers }
    );
  }

  getEventDetails(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = '',
    eventId: any,
    cityId: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      EVENT_ID: eventId,
      CITY_ID: cityId,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      // `${this.apiUrl}play/getPlayDetails`,
      `${this.apiUrl}web/getEventDetails`,
      requestData,
      {
        headers,
      }
    );
  }

  getMappedEventTermsConditions(

    eventId: any
  ): Observable<any> {
    const requestData = {

     filter: { _id: eventId }

    };


    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      // `${this.apiUrl}play/getPlayDetails`,
      `${this.apiUrl}web/getMappedEventTermsConditions`,
      requestData,
      {
        headers,
      }
    );
  }

  // Shreya 24-05-2025
  getPlayDetailsPage(eventId: any, cityId: any, member_id: any, IS_GUEST: any): Observable<any> {
    const requestData = {
      EVENT_ID: eventId,
      CITY_ID: cityId,
      MEMBER_ID: member_id
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(
        this.commonapplicationkey
      ),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      // `${this.apiUrl}play/getPlayDetails`,
      `${this.apiUrl}web/getEventDetails`,
      requestData,
      {
        headers,
      }
    );
  }

  getMainPlayDetailsPage(eventId: any, cityId: any, member_id: any, IS_GUEST: any): Observable<any> {
    const requestData = {
      EVENT_ID: eventId,
      CITY_ID: cityId,
      MEMBER_ID: member_id
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(
        this.commonapplicationkey
      ),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      // `${this.apiUrl}play/getPlayDetails`,
      `${this.apiUrl}web/getMainEventDetails`,
      requestData,
      {
        headers,
      }
    );
  }

  showInterest(EVENT_ID: any, MEMBER_ID: any, STATUS: any): Observable<any> {
    const requestData = {
      EVENT_ID: EVENT_ID,
      MEMBER_ID: MEMBER_ID,
      STATUS: STATUS,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      // `${this.apiUrl}play/getPlayDetails`,
      `${this.apiUrl}web/getEventDetails`,
      requestData,
      {
        headers,
      }
    );
  }

  getRecommendedDataList(
    pageIndex: number,
    pageSize: number,
    filter: any,
    cityId: number,
    categoryId: any,
    excludeEventIds: any,
    sortKey: any,
    sortValue: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      filter,
      cityId,
      categoryId: categoryId,
      excludeEventIds: [excludeEventIds.toString()],
      sortKey: sortKey,
      sortValue: sortValue
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      // `${this.apiUrl}schedulePlayDetails/getCityWisePlays`,
      // `${this.apiUrl}web/getWebNowShowingAndUpcomingEvents`,
      `${this.apiUrl}web/getEventList`,
      requestData,
      {
        headers,
      }
    );
  }

  eventRatingReviewMappingCreate(user: any): Observable<any> {
    user.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/eventRatingReviewMapping/create`,
      user,
      {
        headers,
      }
    );
  }
  eventRatingReviewMappingUpdate(user: any): Observable<any> {
    user.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.put<any>(
      `${this.apiUrl}api/eventRatingReviewMapping/update`,
      user,
      {
        headers,
      }
    );
  }
  eventRatingReviewMappingget(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}web/getEventReviewRatings`,
      requestData,
      {
        headers,
      }
    );
  }

  eventInterestMappingCreate(user: any): Observable<any> {
    user.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/eventInterestMapping/create`,
      user,
      {
        headers,
      }
    );
  }
  eventInterestMappingUpdate(user: any): Observable<any> {
    user.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.put<any>(
      `${this.apiUrl}api/eventInterestMapping/update`,
      user,
      {
        headers,
      }
    );
  }
  eventInterestMappingget(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}web/getEventInterest`,
      requestData,
      {
        headers,
      }
    );
  }

  eventRatingReviewLikesCreate(user: any): Observable<any> {
    user.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/eventRatingReviewLikes/create`,
      user,
      {
        headers,
      }
    );
  }
  eventRatingReviewLikesUpdate(user: any): Observable<any> {
    user.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.put<any>(
      `${this.apiUrl}api/eventRatingReviewLikes/update`,
      user,
      {
        headers,
      }
    );
  }

  getAllVenueByCity(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: any
    // cityid:any
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
      // CITY_ID: cityid
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(`${this.apiUrl}web/getVenue`, data, { headers });
  }

  getALLVenueRecommended(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: any
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(
      `${this.apiUrl}web/getVenueWiseUpcommingEvents`,
      data,
      { headers }
    );
  }
  getAllAmenities(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    const data = { pageIndex, pageSize, sortKey, sortValue, filter };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(
      `${this.apiUrl}web/getAmenity
`,
      data,
      {
        headers,
      }
    );
  }

  getVenueRatingReviewDetails(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    const data = { pageIndex, pageSize, sortKey, sortValue, filter };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}web/venueRatingReviewDetails`,
      data,
      { headers }
    );
  }

  VenueRatingReviewDetailsCreate(user: any): Observable<any> {
    user.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/venueRatingReviewDetails/create`,
      user,
      {
        headers,
      }
    );
  }

  gettheaterAllLikes(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    const data = { pageIndex, pageSize, sortKey, sortValue, filter };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(
      `${this.apiUrl}api/venueInterestMapping/get`,
      data,
      { headers }
    );
  }

  createtheaterLike(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/venueInterestMapping/create`,
      data,
      { headers }
    );
  }

  updatetheaterLike(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.put<any>(
      `${this.apiUrl}api/venueInterestMapping/update`,
      data,
      { headers }
    );
  }
  getBannersForEvents(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = '',
    CITY_ID: number
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      CITY_ID
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token'),
      deviceid: this.commonFunction.encryptdata(this.cookie.get('deviceId')),
      supportkey: this.commonFunction.encryptdata(this.cookie.get('supportKey')),
    });

    return this.http.post<any>(
      `${this.apiUrl}web/getCityBanners
 `,
      requestData,
      {
        headers,
      }
    );
  }
  removeFromWishlist(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.put<any>(
      `${this.apiUrl}api/eventInterestMapping/update`,
      data,
      { headers }
    );
  }

  // getTagsDataForBlogs(): Observable<any> {
  //   const requestData = {};

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
  //     apikey: this.commonFunction.encryptdata(this.commonapikey),
  //     token: this.cookie.get('token') || ' ',
  //   });

  //   return this.http.post<any>(`${this.apiUrl}web/getTags`, requestData, {
  //     headers,
  //   });
  // }

  blogLikeMappingCreate(user: any): Observable<any> {
    user.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}api/blogLikeMapping/like`, user, {
      headers,
    });
  }

  blogCommentMappingcreate(user: any): Observable<any> {
    user.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/blogCommentMapping/comment `,
      user,
      {
        headers,
      }
    );
  }

  getblogCommentMapping(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    const data = { pageIndex, pageSize, sortKey, sortValue, filter };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(`${this.apiUrl}blogCommentMapping/get`, data, {
      headers,
    });
  }

  // getBlogData2(
  //   pageIndex: number = 0,
  //   pageSize: number = 0,
  //   sortKey: string = '',
  //   sortValue: string = '',
  //   filter: any = '',
  //   TAGS: any,
  //   MEMBER_ID: any
  // ): Observable<any> {
  //   const requestData = {
  //     pageIndex,
  //     pageSize,
  //     sortKey,
  //     sortValue,
  //     filter,
  //     TAGS,
  //     MEMBER_ID,
  //   };

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
  //     apikey: this.commonFunction.encryptdata(this.commonapikey),
  //     token: this.cookie.get('token') || ' ',
  //   });

  //   return this.http.post<any>(`${this.apiUrl}web/getBlog`, requestData, {
  //     headers,
  //   });
  // }

  getDistinctValues(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = '',
    CATEGORY_ID: any,
    CITY_ID: any,
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      CATEGORY_ID,
      CITY_ID
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token'),
      deviceid: this.commonFunction.encryptdata(this.cookie.get('deviceId')),
      supportkey: this.commonFunction.encryptdata(this.cookie.get('supportKey')),
    });

    return this.http.post<any>(
      `${this.apiUrl}web/getDistinct
 `,
      requestData,
      {
        headers,
      }
    );
  }


  // reportBug(data: any): Observable<any> {
  //   data.CLIENT_ID = this.clientId;
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
  //     apikey: this.commonFunction.encryptdata(this.commonapikey),
  //     token: this.cookie.get('token') || ' ',
  //   });
  //   return this.http.post<any>(
  //     this.apiUrl + 'api/complaint/create',
  //     JSON.stringify(data),
  //     { headers }
  //   );
  // }


  // Shreya 04-06-2025
  getCategoriesDataForBlogs(): Observable<any> {
    const requestData = {};

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}web/getDistinctEventTypesWithCount`, requestData, {
      headers,
    });
  }

  getBlogData2(
    pageIndex: number = 0,
    pageSize: number = 0,
    sortKey: string = '',
    sortValue: string = '',
    filter: any = '',
    TAGS: any, eventType: any,
    MEMBER_ID: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      TAGS,
      eventType,
      MEMBER_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}web/getBlog`, requestData, {
      headers,
    });
  }


  reportBug(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(
      this.apiUrl + 'web/complaint/create',
      JSON.stringify(data),
      { headers }
    );
  }

  getTagsDataForBlogs(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}web/getTags`, requestData, {
      headers,
    });
  }
  sendBookingData(payload: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}web/addTicketBookingDetails`,
      payload,
      { headers }
    );
  }

  sendBookingData2(payload: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}web/addTicketBookingDetailsNoShoot`,
      payload,
      { headers }
    );
  }

  addPaymentTransactions(payload: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}web/addPaymentTransactions
 `,
      payload,
      { headers }
    );
  }
  getBookingFlagDetails(
    pageIndex: number = 0,
    pageSize: number = 0,
    sortKey: string = '',
    sortValue: string = '',
    filter: any = '',
    EVENT_ID: any,
    CATEGORY_ID: any,
    PUBLISH_FOR_GUEST: boolean,
    SESSION_KEY: any,
    HOISTING_TYPE: any,
    QUE_ID: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      EVENT_ID,
      CATEGORY_ID,
      PUBLISH_FOR_GUEST,
      SESSION_KEY,
      HOISTING_TYPE,
      RECORD_ID: QUE_ID,
      HOSTING_TYPE: HOISTING_TYPE,
      USER_ID: localStorage.getItem('memberId') ? Number(localStorage.getItem('memberId')) : 0,
      TEMP_UNIQUE_ID: localStorage.getItem('deviceId'),
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}web/getBooking
 `, requestData, {
      headers,
    });
  }

  getDataForBooking(
    pageIndex: number = 0,
    pageSize: number = 0,
    sortKey: string = '',
    sortValue: string = '',
    filter: any = '',
    EVENT_SCHEDULE_ID: any,
    EVENT_ID: any,
    TEMP_UNIQUE_ID: any,
    HOSTING_TYPE: any,
    SESSION_KEY: any,
    QUE_ID: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      USER_ID: localStorage.getItem('memberId') ? Number(localStorage.getItem('memberId')) : 0,
      EVENT_SCHEDULE_ID: EVENT_SCHEDULE_ID,
      EVENT_ID: EVENT_ID,
      TEMP_UNIQUE_ID: TEMP_UNIQUE_ID,
      HOSTING_TYPE: HOSTING_TYPE,
      HOISTING_TYPE: HOSTING_TYPE,
      SESSION_KEY: SESSION_KEY,
      RECORD_ID: QUE_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}web/getVenueJson


 `, requestData, {
      headers,
    });
  }



  getDateTimeScheduleDetails(
    pageIndex: number = 0,
    pageSize: number = 0,
    sortKey: string = '',
    sortValue: string = '',
    filter: any = '',
    EVENT_ID: any,
    VENUE_ID: any,
    PUBLISH_FOR_GUEST: boolean
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      EVENT_ID,
      VENUE_ID,
      PUBLISH_FOR_GUEST
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}web/getDateTime

 `, requestData, {
      headers,
    });
  }


  getupcomingBookings(
    pageIndex: number,
    pageSize: number,
    filter: any,
    // cityId: number,
    // categoryId: any,
    // excludeEventIds: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      filter,
      // cityId,
      // categoryId: categoryId,
      // excludeEventIds: [excludeEventIds.toString()],
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      // `${this.apiUrl}schedulePlayDetails/getCityWisePlays`,
      // `${this.apiUrl}web/getWebNowShowingAndUpcomingEvents`,
      `${this.apiUrl}api/userTicketBooking/memberGetBookings`,
      requestData,
      {
        headers,
      }
    );
  }


  getpastOrders(
    pageIndex: number,
    pageSize: number,
    filter: any,
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      // `${this.apiUrl}schedulePlayDetails/getCityWisePlays`,
      // `${this.apiUrl}web/getWebNowShowingAndUpcomingEvents`,
      `${this.apiUrl}api/userTicketBooking/memberGetBookings`,
      requestData,
      {
        headers,
      }
    );
  }





  // getuserSubscriptions(
  //   pageIndex: number,
  //   pageSize: number,
  //   filter: any
  // ): Observable<any> {
  //   const requestData = {
  //     pageIndex,
  //     pageSize,
  //     filter
  //   };

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
  //     apikey: this.commonFunction.encryptdata(this.commonapikey),
  //     token: this.cookie.get('token') || ' ',
  //   });

  //   return this.http.post<any>(

  //     `${this.apiUrl}api/userSubscriptions/get`,
  //     requestData,
  //     {
  //       headers,
  //     }
  //   );
  // }



  // If not login
  // getplans1(
  //   pageIndex: number,
  //   pageSize: number,
  //   filter: any,
  //   // cityId: number,
  //   // categoryId: any,
  //   // excludeEventIds: any
  // ): Observable<any> {
  //   const requestData = {
  //     pageIndex,
  //     pageSize,
  //     filter,
  //     // cityId,
  //     // categoryId: categoryId,
  //     // excludeEventIds: [excludeEventIds.toString()],
  //   };

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
  //     apikey: this.commonFunction.encryptdata(this.commonapikey),

  //   });

  //   return this.http.post<any>(
  //     // `${this.apiUrl}schedulePlayDetails/getCityWisePlays`,
  //     // `${this.apiUrl}web/getWebNowShowingAndUpcomingEvents`,
  //     `${this.apiUrl}web/getPlans`,
  //     requestData,
  //     {
  //       headers,
  //     }
  //   );
  // }

  // purchaseplns(data: any): Observable<any> {
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
  //     apikey: this.commonFunction.encryptdata(this.commonapikey),
  //     token: this.cookie.get('token') || ' ',
  //   });
  //   data.CLIENT_ID = this.clientId
  //   return this.http.post<any>(
  //     `${this.apiUrl}api/userSubscriptions/subscribePlan`,

  //     JSON.stringify(data),
  //     { headers }
  //   );
  // }





  getalleventlist(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: any,
    cityId: number,
    CATEGORY_ID: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      cityId,
      CATEGORY_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(

      `${this.apiUrl}web/getAllEventList`,
      requestData,
      {
        headers,
      }
    );
  }

  getalleventlistNew(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: any,
    cityId: number,
    CATEGORY_ID: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      cityId,
      CATEGORY_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(

      `${this.apiUrl}web/getAllEventListNew`,
      requestData,
      {
        headers,
      }
    );
  }

  addviewwforblogopen(data: any): Observable<any> {
    const requestData = {

      BLOG_ID: data,
      DEVICE_ID: localStorage.getItem('deviceId') || '',
      CLIENT_ID: 1,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      deviceid: localStorage.getItem('deviceId') || '',
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}web/addViews`, requestData, {
      headers,
    });
  }


  addviewwforblogapi(data: any): Observable<any> {
    const requestData = {
      MEMBER_ID: Number(localStorage.getItem('memberId')),
      BLOG_ID: data,
      DEVICE_ID: localStorage.getItem('deviceId'),
      CLIENT_ID: 1,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      deviceid: localStorage.getItem('deviceId') || '',
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}api/blogViewsDetails/addViews`, requestData, {
      headers,
    });
  }

  LikeEvent(STATUS: any, EVENT_ID: any, MEMBER_ID: any): Observable<any> {
    const data = {
      STATUS,
      EVENT_ID,
      MEMBER_ID,
      CLIENT_ID: 1,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(
        this.commonapplicationkey
      ),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/eventLikeMapping/likeEvent`,
      data,
      { headers }
    );
  }


  getpaymentdataCharted(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    data.CLIENT_ID = this.clientId
    // var body = {
    //   data :this.commonFunction.encryptdata2(data)
    // }
    return this.http.post<any>(
      `${this.apiUrl}web/getPayableCharted`,

      JSON.stringify(data),
      { headers }
    );
  }
  getpaymentdataUncharted(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    data.CLIENT_ID = this.clientId
    // var newbody = {
    //   data: this.commonFunction.encryptdata2(data)
    // }
    return this.http.post<any>(
      `${this.apiUrl}web/getPayable`,
      JSON.stringify(data),
      { headers }
    );
  }


  verifyOTPwhilebooking(data: any): Observable<any> {


    // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}web/createOrGetMember `, data, {
      headers,
    });
  }


  sendOTPwhilebooking(data: any): Observable<any> {


    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}web/sendOTPWA
 `,
      data,
      { headers }
    );
  }


  addionalcreate(data: any): Observable<any> {


    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/member/createAdditionalMember
 `,
      data,
      { headers }
    );
  }


  addCartDetailsdd(payload: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}web/addCartDetails`,
      payload,
      { headers }
    );
  }


  getApplicableCouponsDATA(data: any): Observable<any> {


    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}web/getApplicableCoupons

 `,
      data,
      { headers }
    );
  }
  applyCouponDATA(data: any): Observable<any> {


    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}web/getPayableWithCoupon

 `,
      data,
      { headers }
    );
  }

  gettempraredata(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    data.CLIENT_ID = this.clientId
    return this.http.post<any>(
      `${this.apiUrl}web/getTemporarySeats`,

      JSON.stringify(data),
      { headers }
    );
  }


  getcheckEarlyAccess(
    USER_ID: number
  ): Observable<any> {
    const requestData = {
      USER_ID
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(

      `${this.apiUrl}api/userSubscriptions/checkEarlyAccess`,
      requestData,
      {
        headers,
      }
    );
  }


  removeCouponDATA(data: any): Observable<any> {


    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}web/clearAppliedCoupon

 `,
      data,
      { headers }
    );
  }

  removeCouponDATAwithoutcalulation(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}web/clearAppliedCouponWithoutCalculation

 `,
      data,
      { headers }
    );
  }



  removemembershipDATA(data: any): Observable<any> {


    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/userSubscriptions/calculateUserSubscriptionUsageWithoutBenefits

 `,
      data,
      { headers }
    );
  }
  removememberDATAwithoutcalulation(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/userSubscriptions/removeBefits

 `,
      data,
      { headers }
    );
  }

  applymembershipDATA(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/userSubscriptions/calculateUserSubscriptionUsage

 `,
      data,
      { headers }
    );
  }


  getApplicableMembershipDATA(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/userSubscriptions/getUserSubscriptionsDetails`,
      data,
      { headers }
    );
  }


  lockseat(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    data.CLIENT_ID = this.clientId
    return this.http.post<any>(
      `${this.apiUrl}web/lock-seat`,

      JSON.stringify(data),
      { headers }
    );
  }

  // releaseOnUnload(payload: any) {
  //   const headers = {
  //     'type': 'application/json',
  //     applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
  //     apikey: this.commonFunction.encryptdata(this.commonapikey),
  //     token: this.cookie.get('token') || ' ',
  //   };
  //   try {
  //     const blob = new Blob([payload], headers);
  //     navigator.sendBeacon(`${this.apiUrl}web/seatRelease`, payload);
  //     console.log("Seat release beacon sent before unload");
  //   } catch (err) {
  //     console.error("Beacon send failed", err);
  //   }
  // }


  releaseSeat(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}web/seatRelease`,
      data,
      { headers }
    );
  }
  seatReleaseWithoutJson(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}web/seatReleaseWithoutJson`,
      data,
      { headers }
    );
  }

  getMembershipSummary(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    data.CLIENT_ID = this.clientId;

    return this.http.post<any>(
      `${this.apiUrl}api/userSubscriptions/getMembershipSummary`,

      JSON.stringify(data),
      { headers }
    );
  }

  removememberDATAwithoutcalulationopenapi(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}web/removeBenifits

 `,
      data,
      { headers }
    );
  }

  getBookingData(data: any): Observable<any> {
    var data: any = {
      BOOKING_CODE: data
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}web/getUserBookingData`,
      data,
      { headers }
    );
  }

  getusedEventwithPlan(pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: any): Observable<any> {

    const data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/userSubscriptions/getusedEventwithPlan`,
      JSON.stringify(data),
      { headers }
    );
  }

  ///api/userSubscriptions/getusedEventwithPlan


  getplans1(
    pageIndex: number,
    pageSize: number,
    sortkey: string,
    sortValue: string,
    filter: any,
    // cityId: number,
    // categoryId: any,
    // excludeEventIds: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortkey,
      sortValue,
      filter,
      // cityId,
      // categoryId: categoryId,
      // excludeEventIds: [excludeEventIds.toString()],
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),

    });

    return this.http.post<any>(
      // `${this.apiUrl}schedulePlayDetails/getCityWisePlays`,
      // `${this.apiUrl}web/getWebNowShowingAndUpcomingEvents`,
      `${this.apiUrl}web/getPlans`,
      requestData,
      {
        headers,
      }
    );
  }

  getuserSubscriptions(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(

      `${this.apiUrl}api/userSubscriptions/get`,
      requestData,
      {
        headers,
      }
    );
  }


  // applyCouponforplan(data: any): Observable<any> {


  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
  //     apikey: this.commonFunction.encryptdata(this.commonapikey),
  //     token: this.cookie.get('token') || ' ',
  //   });

  //   return this.http.post<any>(
  //     `${this.apiUrl}api/coupon/getMembershipWithCoupon`,
  //     data,
  //     { headers }
  //   );
  // }
  removeCouponforplan(data: any): Observable<any> {


    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/coupon/clearMembershipCoupon


 `,
      data,
      { headers }
    );
  }


  getEventImageBase64(folder: string, filename: string): Observable<any> {
    const data = {
      folderName: folder,
      filename: filename
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}downloadFile`, JSON.stringify(data), { headers });
  }

  getAdBannerMaster(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    TODAY_DATE: any,
    CURRENT_TIME: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      TODAY_DATE: TODAY_DATE,
      CURRENT_TIME: CURRENT_TIME
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(

      `${this.apiUrl}web/getCurrentBanner`,
      requestData,
      {
        headers,
      }
    );
  }

  getmembershipplandata(data: any, EVENT_TICKET_BOOKING_ID: any,
    USER_ID: any,
    PLAN_ID: any,
    TEMP_UNIQUE_ID: any,
    SESSION_ID: any,
  ): Observable<any> {
    var dataaa = {
      filter: data,
      EVENT_TICKET_BOOKING_ID,
      USER_ID,
      PLAN_ID,
      TEMP_UNIQUE_ID,
      SESSION_ID
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/scheduledEventSubscriptionPlan/get`,
      dataaa,
      { headers }
    );
  }
  selectPlan(data: any, EVENT_TICKET_BOOKING_ID: any,
    USER_ID: any,
    PLAN_ID: any,
    TEMP_UNIQUE_ID: any,
    SESSION_ID: any,
  ): Observable<any> {
    var dataaa = {
      filter: data,
      EVENT_TICKET_BOOKING_ID,
      USER_ID,
      PLAN_ID,
      TEMP_UNIQUE_ID,
      SESSION_ID
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/scheduledEventSubscriptionPlan/selectPlan`,
      dataaa,
      { headers }
    );
  }


  removeSelectedPlan(EVENT_TICKET_BOOKING_ID: any,
    USER_ID: any,
    PLAN_ID: any,
    TEMP_UNIQUE_ID: any,
    SESSION_ID: any,
  ): Observable<any> {
    var dataaa = {

      EVENT_TICKET_BOOKING_ID,
      USER_ID,
      PLAN_ID,
      TEMP_UNIQUE_ID,
      SESSION_ID
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/scheduledEventSubscriptionPlan/removeSelectedPlan`,
      dataaa,
      { headers }
    );
  }



  getSubscriptionDetails(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    return this.http.post<any>(
      `${this.apiUrl}web/getSubscriptionDetails`,
      requestData,
      {
        headers,
      }
    );

  }
  getPlanTransactionsdata(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(

      `${this.apiUrl}api/userSubscriptions/getPlanTransactionsdata`,
      requestData,
      {
        headers,
      }
    );
  }

  createMemberEmailPreferences(user: any): Observable<any> {
    //

    user.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/memberEmailPreferences/create`,
      user,
      {
        headers,
      }
    );
  }
  createMemberWhatsappPreferences(user: any): Observable<any> {
    //

    user.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      `${this.apiUrl}api/memberWhatsappPreferences/create`,
      user,
      {
        headers,
      }
    );
  }

  getShareHtml(eventId: string): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.get(
      `${this.apiUrl}share/${eventId}`,
      {
        headers,
        responseType: 'text'
      }
    );
  }

  actionLogsAdd(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    data.CLIENT_ID = this.clientId
    return this.http.post<any>(
      `${this.apiUrl}logs/add`,

      JSON.stringify(data),
      { headers }
    );
  }

  applyCouponforplan(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    // var newbody = {
    //   data: this.commonFunction.encryptdata2(data)
    // }
    return this.http.post<any>(
      `${this.apiUrl}api/coupon/getMembershipWithCoupon`,
      data,
      { headers }
    );
  }

  AddToCartMembershipPlan(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    data.CLIENT_ID = this.clientId
    return this.http.post<any>(
      `${this.apiUrl}api/userSubscriptions/membershipCartMaster`,

      JSON.stringify(data),
      { headers }
    );
  }


  membershipPaymentTransactions(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    data.CLIENT_ID = this.clientId
    return this.http.post<any>(
      `${this.apiUrl}api/userSubscriptions/membershipPaymentTransactions`,

      JSON.stringify(data),
      { headers }
    );
  }
  purchaseplns(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    data.CLIENT_ID = this.clientId
    // var newbody = {
    //   data: this.commonFunction.encryptdata2(data)
    // }
    return this.http.post<any>(
      `${this.apiUrl}api/userSubscriptions/subscribePlan`,
      data,
      { headers }
    );
  }
  removequeue(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    // var newbody =s {
    //   data: this.commonFunction.encryptdata2(data)
    // }
    return this.http.post<any>(
      `${this.apiUrl}web/releaseQue`,
      JSON.stringify(data),
      { headers }
    );
  }

  calculatePlanDetails(
    PLAN_ID: any, MEMBER_ID: any, SESSION_ID: any
  ): Observable<any> {
    const requestData = {
      PLAN_ID: PLAN_ID,
      MEMBER_ID: MEMBER_ID,
      SESSION_ID: SESSION_ID
    };

    // var body = {
    //   data: this.commonFunction.encryptdata2(requestData)
    // }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(
      // `${this.apiUrl}schedulePlayDetails/getCityWisePlays`,
      // `${this.apiUrl}web/getWebNowShowingAndUpcomingEvents`,
      `${this.apiUrl}api/subscriptionPlans/calculatePlanDetails`,
      requestData,
      {
        headers,
      }
    );
  }
  releaseMembership(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });
    // var newbody =s {
    //   data: this.commonFunction.encryptdata2(data)
    // }
    return this.http.post<any>(
      `${this.apiUrl}api/userSubscriptions/releaseMembership`,
      JSON.stringify(data),
      { headers }
    );
  }


  verifyOTP(data: any): Observable<any> {
    const requestData = {
      VALUE: data.TYPE_VALUE,
      TYPE: data.TYPE,
      OTP: data.OTP,
      ID: data.ID,
      NAME: data.NAME,
      IS_MULTIPLE_EMAIL: data.IS_MULTIPLE_EMAIL,
      MOBILE: data.MOBILE,
    };

    // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonFunction.encryptdata(this.commonapplicationkey),
      apikey: this.commonFunction.encryptdata(this.commonapikey),
      token: this.cookie.get('token') || ' ',
    });

    return this.http.post<any>(`${this.apiUrl}member/verifyOTP`, requestData, {
      headers,
    });
  }
}



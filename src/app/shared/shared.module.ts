import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
// import { NavbarComponent } from './navbar/navbar.component';
import { MovieCardComponent } from './movie-card/movie-card.component';
import { SignincomponentComponent } from './signincomponent/signincomponent.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { MyprofilepageComponent } from './myprofilepage/myprofilepage.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlastscreenComponent } from './flastscreen/flastscreen.component';
import { CommonLoaderComponent } from './common-loader/common-loader.component';
import { OnlineShowPageComponent } from './StaticPages/online-show-page/online-show-page.component';
import { AboutUsPageComponent } from './StaticPages/about-us-page/about-us-page.component';
import { PrivacyPoliciesComponent } from './StaticPages/privacy-policies/privacy-policies.component';
import { TermsConditionsComponent } from './StaticPages/terms-conditions/terms-conditions.component';
import { DeliveryShippingComponent } from './StaticPages/delivery-shipping/delivery-shipping.component';
import { RazorpaypoliciesComponent } from './StaticPages/razorpaypolicies/razorpaypolicies.component';
import { TicketcancelationpoliciesComponent } from './StaticPages/ticketcancelationpolicies/ticketcancelationpolicies.component';
import { ContactuspageComponent } from './StaticPages/contactuspage/contactuspage.component';
import { ReportabugComponent } from './StaticPages/reportabug/reportabug.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { BlogpageComponent } from './blogpage/blogpage.component';
import { BlogdetailedpageComponent } from './blogdetailedpage/blogdetailedpage.component';
import { OfferdetailspageComponent } from './offerdetailspage/offerdetailspage.component';
import { TicketpageComponent } from './ticketpage/ticketpage.component';
import { CarouselModule } from "ngx-owl-carousel-o";
import { PlanReceiptComponent } from './plan-receipt/plan-receipt.component';
// import { BookticketpageComponent } from './bookticketpage/bookticketpage.component';
import { NgxCaptchaModule } from 'ngx-captcha';
@NgModule({
  declarations: [
    // NavbarComponent,
    MovieCardComponent,
    SignincomponentComponent,
    MyprofilepageComponent,
    FlastscreenComponent,
    CommonLoaderComponent,
    OnlineShowPageComponent,
    AboutUsPageComponent,
    PrivacyPoliciesComponent,
    TermsConditionsComponent,
    DeliveryShippingComponent,
    RazorpaypoliciesComponent,
    TicketcancelationpoliciesComponent,
    ContactuspageComponent,
    ReportabugComponent,
    BlogpageComponent,
    BlogdetailedpageComponent,
    OfferdetailspageComponent,
    TicketpageComponent,
    PlanReceiptComponent
    // BookticketpageComponent

  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    NgSelectModule,
    ImageCropperModule,
    CarouselModule,
    NgxCaptchaModule
  ],
  exports: [
    // NavbarComponent,
    MovieCardComponent,
    SignincomponentComponent,
    FlastscreenComponent,
    CommonLoaderComponent,
    TicketpageComponent
  ],
  providers: [DatePipe],

})
export class SharedModule { }

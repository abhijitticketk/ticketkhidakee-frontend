import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MovieListComponent } from './movie-list/movie-list.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { MyprofilepageComponent } from '../shared/myprofilepage/myprofilepage.component';
import { SignincomponentComponent } from '../shared/signincomponent/signincomponent.component';
import { CastDetailsPageComponent } from './cast-details-page/cast-details-page.component';
import { OnlineShowPageComponent } from '../shared/StaticPages/online-show-page/online-show-page.component';
import { AboutUsPageComponent } from '../shared/StaticPages/about-us-page/about-us-page.component';
import { PrivacyPoliciesComponent } from '../shared/StaticPages/privacy-policies/privacy-policies.component';
import { TermsConditionsComponent } from '../shared/StaticPages/terms-conditions/terms-conditions.component';
import { DeliveryShippingComponent } from '../shared/StaticPages/delivery-shipping/delivery-shipping.component';
import { TicketcancelationpoliciesComponent } from '../shared/StaticPages/ticketcancelationpolicies/ticketcancelationpolicies.component';
import { RazorpaypoliciesComponent } from '../shared/StaticPages/razorpaypolicies/razorpaypolicies.component';
import { ContactuspageComponent } from '../shared/StaticPages/contactuspage/contactuspage.component';
import { ReportabugComponent } from '../shared/StaticPages/reportabug/reportabug.component';
import { TheaterListComponentComponent } from './theater-list-component/theater-list-component.component';
import { TheaterDetailsPageComponent } from './theater-details-page/theater-details-page.component';
import { BuyticketComponent } from './buyticket/buyticket.component';
import { BlogpageComponent } from '../shared/blogpage/blogpage.component';
import { BlogdetailedpageComponent } from '../shared/blogdetailedpage/blogdetailedpage.component';
import { OfferdetailspageComponent } from '../shared/offerdetailspage/offerdetailspage.component';
import { PageNotFoundComponent } from '../shared/StaticPages/page-not-found/page-not-found.component';
import { MembershipComponent } from './membership/membership.component';

const routes: Routes = [



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MoviesRoutingModule { }


// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuyticketComponent } from './movies/buyticket/buyticket.component';
import { CastDetailsPageComponent } from './movies/cast-details-page/cast-details-page.component';
import { HomeComponent } from './movies/home/home.component';
import { MembershipComponent } from './movies/membership/membership.component';
import { MovieDetailsComponent } from './movies/movie-details/movie-details.component';
import { MovieListComponent } from './movies/movie-list/movie-list.component';
import { TheaterDetailsPageComponent } from './movies/theater-details-page/theater-details-page.component';
import { TheaterListComponentComponent } from './movies/theater-list-component/theater-list-component.component';
import { BlogdetailedpageComponent } from './shared/blogdetailedpage/blogdetailedpage.component';
import { BlogpageComponent } from './shared/blogpage/blogpage.component';
import { MyprofilepageComponent } from './shared/myprofilepage/myprofilepage.component';
import { OfferdetailspageComponent } from './shared/offerdetailspage/offerdetailspage.component';
import { SignincomponentComponent } from './shared/signincomponent/signincomponent.component';
import { AboutUsPageComponent } from './shared/StaticPages/about-us-page/about-us-page.component';
import { ContactuspageComponent } from './shared/StaticPages/contactuspage/contactuspage.component';
import { DeliveryShippingComponent } from './shared/StaticPages/delivery-shipping/delivery-shipping.component';
import { OnlineShowPageComponent } from './shared/StaticPages/online-show-page/online-show-page.component';
import { PageNotFoundComponent } from './shared/StaticPages/page-not-found/page-not-found.component';
import { PrivacyPoliciesComponent } from './shared/StaticPages/privacy-policies/privacy-policies.component';
import { RazorpaypoliciesComponent } from './shared/StaticPages/razorpaypolicies/razorpaypolicies.component';
import { ReportabugComponent } from './shared/StaticPages/reportabug/reportabug.component';
import { TermsConditionsComponent } from './shared/StaticPages/terms-conditions/terms-conditions.component';
import { TicketcancelationpoliciesComponent } from './shared/StaticPages/ticketcancelationpolicies/ticketcancelationpolicies.component';
import { TicketpageComponent } from './shared/ticketpage/ticketpage.component';
import { CommonTicketPageComponent } from './shared/common-ticket-page/common-ticket-page.component';
import { PlanReceiptComponent } from './shared/plan-receipt/plan-receipt.component';
import { EventListPageComponent } from './movies/event-list-page/event-list-page.component';

const routes: Routes = [


  { path: '', component: HomeComponent },
  { path: 'movies/:city', component: MovieListComponent },


  { path: 'movie/:moviename/:id/:movietype', component: MovieDetailsComponent },
  { path: 'buy-ticket/:movieId/:movieName/:cityId', component: BuyticketComponent },


  { path: 'blogs', component: BlogpageComponent },
  { path: 'home', component: HomeComponent },
  // { path: 'blog', component: BlogpageComponent },
  { path: 'offer', component: OfferdetailspageComponent },
  { path: 'blog-details/:title/:slug', component: BlogdetailedpageComponent },
  { path: 'blog-details/:title', component: BlogdetailedpageComponent },
  { path: 'myprofile', component: MyprofilepageComponent },
  { path: 'sign-in', component: SignincomponentComponent },
  { path: 'theater', component: TheaterListComponentComponent },
  { path: 'theater/details/:id', component: TheaterDetailsPageComponent },
  // { path: ':castname/:personname/:id', component: CastDetailsPageComponent },
  { path: 'cast-and-crew/:personname/:id', component: CastDetailsPageComponent },
  { path: 'planreceipt', component: PlanReceiptComponent },


  { path: 'online-shows', component: OnlineShowPageComponent },
  { path: 'about-us', component: AboutUsPageComponent },
  { path: 'privacypolicies', component: PrivacyPoliciesComponent },
  { path: 'terms&conditions', component: TermsConditionsComponent },
  { path: 'delivery&shippingpolicies', component: DeliveryShippingComponent },
  { path: 'razorpaypolicies', component: RazorpaypoliciesComponent },
  { path: 'ticketcancelationpolicies', component: TicketcancelationpoliciesComponent },
  { path: 'contact-us', component: ContactuspageComponent },
  { path: 'report-bug', component: ReportabugComponent },
  { path: 'page-not-found', component: PageNotFoundComponent },
  { path: 'membership', component: MembershipComponent },
  { path: 'ticket', component: TicketpageComponent },
  { path: 'myticket', component: CommonTicketPageComponent },
  
  // { path: '', loadChildren: () => import('./movies/movies.module').then(m => m.MoviesModule) },
{
    path: 'explore/subEvent/:id',
    component: EventListPageComponent
  },
  { path: 'explore', loadChildren: () => import('./Plays/plays.module').then(m => m.PlayModule) },
  //static urls
  {
    path: 'sobatichakarar_22aug',   // old shared URL
    redirectTo: '/explore/all/live%20show/sobatichakarar_10aug/68a31bc2f7f87afc75f6bf94', // your actual details page
    pathMatch: 'full'
  },

  {
    path: 'thefolkaakhyan_sakal',   // old shared URL
    redirectTo: '/explore/all/Live%20Show/sakalpresentsthefolkaakhyan/68a3157bf7f87afc75f6bccb', // your actual details page
    pathMatch: 'full'
  },
  {
    path: 'mahapur_12sep',   // old shared URL
    redirectTo: '/explore/all/Live%20Show/mahapur_12sep/68a41e16b84ffe41edfcc5e2', // your actual details page
    pathMatch: 'full'
  },

  {
    path: 'thefolkaakhyan_thane',   // old shared URL
    redirectTo: '/explore/all/Live%20Show/thefolkaakhyanthane/68a2d48737459e1b21648b52', // your actual details page
    pathMatch: 'full'
  },
  {
    path: 'bhoomionamsadhya_2025',   // old shared URL
    redirectTo: '/explore/all/activities/bhoomionamsadhya/68a300daf7f87afc75f6b578', // your actual details page
    pathMatch: 'full'
  },
  {
    path: 'rutubarva_sangli',   // old shared URL
    redirectTo: '/explore/all/live%20show/rutubarva_sangli/688b1ac0e37ddea70bab7290', // your actual details page
    pathMatch: 'full'
  },
  {
    path: 'rutubarva_7sep',   // old shared URL
    redirectTo: '/explore/all/live%20show/rutubarva_7sep/688b0b57e37ddea70bab5ef5', // your actual details page
    pathMatch: 'full'
  },

  {
    path: 'jijaunchebalkadu_24august',   // old shared URL
    redirectTo: '/explore/all/workshop/jijaunchebalkadumatunga/68a4270afd0ef3a2d0926aed', // your actual details page
    pathMatch: 'full'
  },
  {
    path: 'folklavnirocks_23aug',   // old shared URL
    redirectTo: '/explore/all/Live%20Show/folklavnirocks_23aug/68a426f2fd0ef3a2d0926a86', // your actual details page
    pathMatch: 'full'
  },
  {
    path: 'lavanyavati_12sept',   // old shared URL
    redirectTo: '/explore/all/mcc/lavanyavati_12sept/688b0261e37ddea70bab5449', // your actual details page
    pathMatch: 'full'
  },
  {
    path: 'excessestrogenladiesonly',   // old shared URL
    redirectTo: '/explore/all/mcc/excessestrogenladiesonly/68a2f8bef7f87afc75f6afd7', // your actual details page
    pathMatch: 'full'
  },
  {
    path: '305gallimantola',   // old shared URL
    redirectTo: '/explore/all/mcc/305gallimantola/68a2fd41f7f87afc75f6b407', // your actual details page
    pathMatch: 'full'
  },
  {
    path: 'jaudevachiyagava',   // old shared URL
    redirectTo: '/explore/all/mcc/jaudevachiyagava/68a41a3fb84ffe41edfcc159', // your actual details page
    pathMatch: 'full'
  },

  {
    path: 'swayamtalkspune',
    redirectTo: '/explore/all/live%20podcast/swayamtalkspune/68a2fb40f7f87afc75f6b285',
    pathMatch: 'full'
  },

    {
    path: 'abhangarepost27sept',
    redirectTo: '/explore/all/live%20show/abhangarepostlive27sept/68a2e7ba37459e1b21649455',
    pathMatch: 'full'
  },
    {
    path: 'ziyarat_24august',
    redirectTo: '/explore/all/Live%20Show/ziyarat_24august/68a419e1b84ffe41edfcc126',
    pathMatch: 'full'
  },
    {
    path: 'nd_pthridaynathmangeshkar',
    redirectTo: '/explore/all/Live%20Show/nakshatranchedenepthridaynathmangeshkar/688b1612e37ddea70bab6b5e',
    pathMatch: 'full'
  },

    {
    path: 'sakalcricketcrorepatidirectentry',
    redirectTo: '/explore/all/activities/sakalcricketcrorepatidirectentryfranchiseplayers/68a2dd3c37459e1b21648fb0',
    pathMatch: 'full'
  },

    {
    path: 'sakalcricketcrorepatiindividual',
    redirectTo: '/explore/all/sports/sakalcricketcrorepatiindividualregistration/68a2e46037459e1b21649247',
    pathMatch: 'full'
  },

    {
    path: 'sakalcricketcrorepatiteam',
    redirectTo: '/explore/all/Sports/sakalcricketcrorepatiteamownership%20/68a2e63837459e1b21649367',
    pathMatch: 'full'
  },
    {
    path: 'krushnaiwaterworld',
    redirectTo: '/explore/all/activities/krushnai-water-world/688afbc4e37ddea70bab514d',
    pathMatch: 'full'
  },
    {
    path: 'srdr_23aug',
    redirectTo: '/explore/all/live%20show/shwasaatrajadhyasaatraja23august/68a32161f7f87afc75f6c5ec',
    pathMatch: 'full'
  },
   {
    path: 'popcorn-23aug',
    redirectTo: '/explore/all/mcc/popcorn23aug/68a32788f7f87afc75f6cba6',
    pathMatch: 'full'
  },
   {
    path: 'popcorn24aug',
    redirectTo: '/explore/all/mcc/popcorn-24aug/68a424f4fd0ef3a2d0926435',
    pathMatch: 'full'
  },
   {
    path: 'sakalmicrogoldganeshaexhibition',
    redirectTo: '/explore/all/activities/sakal-micro-gold-ganesha-exhibition/68a6f1bb74b617a52b0c2c63',
    pathMatch: 'full'
  },



  {
    path: 'krakenhabitatdailypass',
    redirectTo: '/explore/all/Activities/krakenhabitatdailypass/688b06ffe37ddea70bab5938',
    pathMatch: 'full'
  },
  {
    path: 'krushnaiwaterworld',
    redirectTo: '/explore/all/Activities/krushnai-water-world/688afbc4e37ddea70bab514d',
    pathMatch: 'full'
  },
  {
    path: 'rklaxmanmuseum',
    redirectTo: '/explore/all/Activities/rklaxmanmuseum/688b0b1ae37ddea70bab5eb0',
    pathMatch: 'full'
  },
  {
    path: 'pawnalakecampingbramhnoli',
    redirectTo: '/explore/all/Activities/pawnalakecampingbramhnoli/688b0d8ee37ddea70bab61ab',
    pathMatch: 'full'
  },
  {
    path: 'pranaadventuredaypass',
    redirectTo: '/explore/all/Activities/pranaadventuredaypass/688b01f4e37ddea70bab5418',
    pathMatch: 'full'
  },
  {
    path: 'shreeparshurambhoomi',
    redirectTo: '/explore/all/Activities/shreeparshurambhoomi/688b0fa7e37ddea70bab64d2s',
    pathMatch: 'full'
  },
  

  //static urlss
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
// { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
// { path: 'booking', loadChildren: () => import('./booking/booking.module').then(m => m.BookingModule) },
// { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule) },
// { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },

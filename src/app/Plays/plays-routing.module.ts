import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlaysListComponent } from './plays-list/plays-list.component';
import { PlaysDetailsComponent } from './plays-details/plays-details.component';
import { VenuesComponent } from './venues/venues.component';
import { VenuesDetailsComponent } from './venues-details/venues-details.component';
import { BookticketpageComponent } from './bookticketpage/bookticketpage.component'; 
import { CommomListPageComponent } from './commom-list-page/commom-list-page.component';
import { BookingCommonPageComponent } from './booking-common-page/booking-common-page.component';

const routes: Routes = [

  { path: 'venues/:city', component: VenuesComponent },
  { path: 'venues/:city/:venuename/:id', component: VenuesDetailsComponent },
  { path: 'shows/:city/:banner/:id', component: CommomListPageComponent },
  { path: ':city/:categorytype', component: PlaysListComponent },
  // { path: 'plays', component: PlaysListComponent },
  { path: ':city/:categorytype/:slug/:id', component: PlaysDetailsComponent },


  // { path: 'venues-details', component: VenuesDetailsComponent },
  { path: 'book-page', component: BookticketpageComponent },
  // { path: 'event-details', component: EventDetailesComponent },
  // { path: 'movie-play-details', component: MovieEventDetailesComponent },
  { path: ':city/:category/:eventname/buy-tickets/:id', component: BookingCommonPageComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlaysRoutingModule { }

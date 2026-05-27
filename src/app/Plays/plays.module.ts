import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
// import { ReplaceSpacesPipe } from '../Services/replace-spaces.pipe';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlaysRoutingModule } from './plays-routing.module';
import { PlaysListComponent } from './plays-list/plays-list.component';
import { PlaysDetailsComponent } from './plays-details/plays-details.component';
import { VenuesComponent } from './venues/venues.component';
import { VenuesDetailsComponent } from './venues-details/venues-details.component';
import { BookticketpageComponent } from './bookticketpage/bookticketpage.component';
import { EventDetailesComponent } from './event-detailes/event-detailes.component';
import { MovieEventDetailesComponent } from './movie-event-detailes/movie-event-detailes.component';
import { CommomListPageComponent } from './commom-list-page/commom-list-page.component';
import { BookingCommonPageComponent } from './booking-common-page/booking-common-page.component';
import { TooltipHtmlDirective } from '../Services/tooltips.directive';
import { NgxCaptchaModule } from 'ngx-captcha';

@NgModule({
  declarations: [
    PlaysListComponent,
    PlaysDetailsComponent,
    VenuesComponent,
    VenuesDetailsComponent,
    BookticketpageComponent,
    EventDetailesComponent,
    MovieEventDetailesComponent,
    CommomListPageComponent,
    BookingCommonPageComponent,
    TooltipHtmlDirective
  ],
  imports: [
    CommonModule,
    CarouselModule,
    FormsModule,
    PlaysRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    NgxCaptchaModule

  ],
  providers: [DatePipe,],
})
export class PlayModule { }

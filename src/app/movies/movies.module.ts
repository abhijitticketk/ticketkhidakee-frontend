import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { MovieListComponent } from './movie-list/movie-list.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { SharedModule } from '../shared/shared.module';
import { MoviesRoutingModule } from './movies-routing.module';
import { ReplaceSpacesPipe } from '../Services/replace-spaces.pipe';
import { CastDetailsPageComponent } from './cast-details-page/cast-details-page.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { FormsModule } from '@angular/forms';
// import { TheaterListComponentComponent } from './theater-list-component/theater-list-component.component';
// import { TheaterDetailsPageComponent } from './theater-details-page/theater-details-page.component';
// import { BuyticketComponent } from './buyticket/buyticket.component';
// import { PageNotFoundComponent } from '../shared/StaticPages/page-not-found/page-not-found.component';
// import { MembershipComponent } from './membership/membership.component';



@NgModule({
  declarations: [
    // HomeComponent,
    // MovieListComponent,
    // MovieDetailsComponent,
    // ReplaceSpacesPipe,
    // CastDetailsPageComponent,
    // TheaterListComponentComponent,
    // TheaterDetailsPageComponent,
    // BuyticketComponent,
    // PageNotFoundComponent,
    // MembershipComponent
  ],
  imports: [
    CommonModule,
    MoviesRoutingModule,
    // SharedModule,
    CarouselModule,
    FormsModule


  ],
  providers: [DatePipe],

})
export class MoviesModule { }

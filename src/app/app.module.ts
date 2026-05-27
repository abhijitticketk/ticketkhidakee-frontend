import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ApiService } from './Services/api.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonFunctionService } from './Services/CommonFunctionService';
import { NgSelectModule } from '@ng-select/ng-select'; // Add this import
import { FooterComponent } from './shared/footer/footer.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { BuyticketComponent } from './movies/buyticket/buyticket.component';
import { CastDetailsPageComponent } from './movies/cast-details-page/cast-details-page.component';
import { HomeComponent } from './movies/home/home.component';
import { MembershipComponent } from './movies/membership/membership.component';
import { MovieDetailsComponent } from './movies/movie-details/movie-details.component';
import { MovieListComponent } from './movies/movie-list/movie-list.component';
import { TheaterDetailsPageComponent } from './movies/theater-details-page/theater-details-page.component';
import { TheaterListComponentComponent } from './movies/theater-list-component/theater-list-component.component';
import { ReplaceSpacesPipe } from './Services/replace-spaces.pipe';
import { PageNotFoundComponent } from './shared/StaticPages/page-not-found/page-not-found.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { CommonTicketPageComponent } from './shared/common-ticket-page/common-ticket-page.component';
import { EventListPageComponent } from './movies/event-list-page/event-list-page.component';

// import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';

// const config: SocketIoConfig = {
//   url: 'https://jbw959tr-4444.inc1.devtunnels.ms/', options: {
//     transports: ['websocket'],
//     withCredentials: false
//   }
// };

@NgModule({
  declarations: [AppComponent, FooterComponent, NavbarComponent,
    EventListPageComponent,
    HomeComponent,
    MovieListComponent,
    MovieDetailsComponent,
    ReplaceSpacesPipe,
    CastDetailsPageComponent,
    TheaterListComponentComponent,
    TheaterDetailsPageComponent,
    BuyticketComponent,
    PageNotFoundComponent,
    MembershipComponent,
    CommonTicketPageComponent
  ],
  imports: [ToastrModule.forRoot({ preventDuplicates: true, resetTimeoutOnDuplicate: true, maxOpened: 1 }), NgSelectModule, CommonModule, BrowserModule, BrowserAnimationsModule, AppRoutingModule,
    SharedModule, RouterModule, FormsModule, HttpClientModule,
    ImageCropperModule,
    CarouselModule,
    ReactiveFormsModule
    // SocketIoModule.forRoot(config)

  ],
  providers: [ApiService, CommonFunctionService],
  bootstrap: [AppComponent],
})
export class AppModule { }



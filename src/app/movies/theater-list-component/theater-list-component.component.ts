import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Services/api.service';
import { CommonFunctionService } from 'src/app/Services/CommonFunctionService';
import { LoaderService } from 'src/app/Services/loader.service';
import { LocationService } from 'src/app/Services/location.service';

@Component({
  selector: 'app-theater-list-component',
  templateUrl: './theater-list-component.component.html',
  styleUrls: ['./theater-list-component.component.scss'],
})
export class TheaterListComponentComponent {
  memberId: any;

  constructor(
    private apiservice: ApiService,
    private userService: CommonFunctionService,
    private cookie: CookieService,
    private toastr: ToastrService,
    private router: Router,
    private locationService: LocationService,
    private loaderService: LoaderService,
    private cdr: ChangeDetectorRef
  ) {}

  selectedCityID = this.cookie.get('cityId');

  theaters: any[] = [];
  retriveimgUrl = this.apiservice.retriveimgUrl;
  page = 1;
  pageSize = 10;
  hasMoreData = true;
  likeItems: any[] = [];
  filteredLikeItems: any[] = [];
  isWishlistLoading: boolean = false;

  ngOnInit() {
    this.getAllTheaters();
    this.memberId = localStorage.getItem('memberId');
  }

  searchTerm: string = '';

  onSearchChange() {
    

    if (this.searchTerm && this.searchTerm.trim().length >= 3) {
      this.page = 1;
      this.getAllTheaters(false);
    } else if (!this.searchTerm || this.searchTerm.trim().length === 0) {
      this.page = 1;
      this.getAllTheaters(false);
    }
  }

  selectedFacilities: string[] = [];

  toggleFacility(facility: string) {
    const index = this.selectedFacilities.indexOf(facility);
    if (index > -1) {
      this.selectedFacilities.splice(index, 1); // remove if already selected
    } else {
      this.selectedFacilities.push(facility);
    }

    // Trigger search with updated filters
    this.page = 1;
    this.getAllTheaters(false);
  }

  clearAllFilters() {
    this.selectedFacilities = [];
    this.page = 1;
    this.getAllTheaters(false);
  }

  isFacilitySelected(facility: string): boolean {
    return this.selectedFacilities.includes(facility);
  }

  
  searchLoading:boolean  = false

  getAllTheaters(loadMore = false) {
    // const cityId = 1;

    let searchCondition = ` AND CITY_ID = ${this.selectedCityID}`;

    if (this.searchTerm?.trim().length >= 3) {
      searchCondition += ` AND NAME LIKE '%${this.searchTerm.trim()}%'`;
    }

    if (this.selectedFacilities.length > 0) {
      const likeConditions = this.selectedFacilities
        .map((facility) => `AVAILABLE_FACILITIES_JSON LIKE '%${facility}%'`)
        .join(' AND ');
      searchCondition += ` AND ${likeConditions}`;
    }

    this.searchLoading = true;

    this.apiservice
      .getAllTheatersByCity(this.page, this.pageSize, '', '', searchCondition)
      .subscribe(
        (data: any) => {
          if (data?.code == 200 && data?.data?.length > 0) {
            if (loadMore) {
              this.theaters = [
                ...this.theaters,
                ...data.data.map((theater: any) => ({
                  ...theater,
                  liked: false,
                })),
              ];
            } else {
              this.theaters = data.data.map((theater: any) => ({
                ...theater,
                liked: false,
              }));
            }


            // if returned data is less than page size, no more data
            this.hasMoreData = data.data.length === this.pageSize;
            this.fetchAllTheaterLikes();
          } else {
            if (!loadMore) this.theaters = [];
            this.hasMoreData = false;
          }

          this.searchLoading = false;

        },

        (error: any) => {
          console.error('Error fetching theaters:', error);
          this.hasMoreData = false;

          this.searchLoading = false;

        }
      );
  }

  fetchAllTheaterLikes() {
    this.isWishlistLoading = true;

    this.apiservice
      .getAllLikes(0, 0, 'id', 'desc', '') // You can modify the filter as needed
      .subscribe(
        (response: any) => {
          const isSuccessful = response?.code === 200;
          const hasData = response?.data?.length > 0;

          if (isSuccessful && hasData) {
            this.likeItems = response.data;
            

            this.filteredLikeItems = [...this.likeItems];

            // After fetching like data, update theaters with like status
            this.updateLikeStatus();
          }

          this.isWishlistLoading = false;
        },
        (error: any) => {
          console.error('Error fetching like data:', error);
          this.isWishlistLoading = false;
        }
      );
  }

  updateLikeStatus() {
    // 

    this.theaters.forEach((theater: any) => {
      const matchedWishlist = this.filteredLikeItems.find(
        (wishlistItem: any) => wishlistItem.THEATER_ID === theater.ID
      );

      if (matchedWishlist) {
        theater.liked = matchedWishlist.STATUS;
        theater.wishlistId = matchedWishlist.ID;
      } else {
        theater.liked = false;
        theater.wishlistId = null;
      }
    });

    

    this.cdr.detectChanges();
  }

  loadMore() {
    this.page++;
    this.getAllTheaters(true);
  }
  toggleLike(theater: any) {
    const isLiking = !theater.liked;

    const likePayload = {
      THEATER_ID: theater.ID,
      MEMBER_ID: this.memberId,
      STATUS: isLiking ? 1 : 0,
      ID: theater.wishlistId,
    };

    if (isLiking && theater.wishlistId == null) {
      this.apiservice.createLike(likePayload).subscribe({
        next: (res: any) => {
          if (res.code == '200') {
            theater.liked = true;
            this.toastr.success('Liked successfully.', 'Success');
          } else {
            this.toastr.warning('Could not like the theater.', 'Warning');
          }
          this.fetchAllTheaterLikes();
        },
        error: () => {
          this.toastr.error('Error liking the theater.', 'Error');
        },
      });
    } else {
      this.apiservice.updateLike(likePayload).subscribe({
        next: (res: any) => {
          if (res.code == '200') {
            theater.liked = false;
            this.toastr.success('Like removed.', 'Success');
          } else {
            this.toastr.warning('Could not remove like.', 'Warning');
          }
          this.fetchAllTheaterLikes();
        },
        error: () => {
          this.toastr.error('Error updating like.', 'Error');
        },
      });
    }
  }

  goToTheaterDetails(data: any) {
    
  
    // Set movie name and address in sessionStorage
    sessionStorage.setItem('theaterName', data.NAME);
    sessionStorage.setItem('theaterAddress', data.ADDRESS);

    sessionStorage.setItem('theaterLatitude', data.LATITUDE);
    sessionStorage.setItem('theaterLongitude', data.LONGITUDE);
  
    // Navigate to theater dvenues-detailsetails
    this.router.navigate(['/venues-details', data.ID]);
  }
  
}

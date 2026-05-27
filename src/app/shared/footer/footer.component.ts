import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  constructor(
    private toastr: ToastrService,
    private apiService: ApiService,
  ) {
  }
  versionNumber: any
  currentYear: any;
  ngOnInit() {
    this.currentYear = new Date().getFullYear();
    this.versionNumber = this.apiService.versionNumber
  }
}

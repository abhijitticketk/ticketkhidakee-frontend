import { HttpClient } from '@angular/common/http';
import { Component, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Services/api.service';
import { CommonFunctionService } from 'src/app/Services/CommonFunctionService';

@Component({
  selector: 'app-contactuspage',
  templateUrl: './contactuspage.component.html',
  styleUrls: ['./contactuspage.component.scss'],
})
export class ContactuspageComponent {
  constructor(
    private api: ApiService,
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private cookie: CookieService,
    public commonfunction: CommonFunctionService,
    private ngZone: NgZone,
    private meta: Meta, private title: Title
  ) {
    this.updateMetaTags()
  }
  emailpattern =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  contact = {
    NAME: '',
    LAST_NAME: '',
    EMAIL_ID: '',
    CONTACT_NO: '',
    MESSAGE: '',
  };
  address =
    'Shriniketan Apartments, First Floor, Shilavihar Colony, Erandwane, Pune - 411038, Maharashtra, India.';
  isSubmitting = false;

  submitContactDetails(form: NgForm) {
    // if (form.invalid) {
    //   this.toastr.error(
    //     'Please fill in all required fields with valid values.',
    //     'Error'
    //   );
    //   return;
    // }


    if (!this.contact.NAME) {
      this.toastr.error(
        'Please Enter Name',
        'Error'
      );
    } else if (!this.contact.EMAIL_ID) {
      this.toastr.error(
        'Please Enter Email',
        'Error'
      );
    }
    else if (!this.emailpattern.test(this.contact.EMAIL_ID)) {
      this.toastr.error(
        'Please Enter Valid Email',
        'Error'
      );
    }

    else if (!this.contact.CONTACT_NO) {
      this.toastr.error(
        'Please Enter Mobile Number',
        'Error'
      );
    } else if (!this.contact.MESSAGE) {
      this.toastr.error(
        'Please Enter Message',
        'Error'
      );
    } else {
      this.isSubmitting = true;

      const payload = {
        NAME: this.contact.NAME.trim(),
        // LAST_NAME: this.contact.LAST_NAME.trim(),
        EMAIL_ID: this.contact.EMAIL_ID.trim(),
        CONTACT_NO: this.contact.CONTACT_NO.trim(),
        MESSAGE: this.contact.MESSAGE.trim(),
      };

      this.api.submitContactDetails(payload).subscribe({
        next: (res: any) => {
          if (res.code == '200') {
            this.toastr.success(
              'Contact details submitted successfully!',
              'Success'
            );
            form.resetForm(); // Clear the form
          } else {
            this.toastr.error('Submission failed. Please try again.', 'Error');
          }
          this.isSubmitting = false;
        },
        error: () => {
          // this.toastr.error('An error occurred while submitting the form. Please try again later.', 'Error');
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
    }


  }

  openGmailCompose() {
    const email = 'contact@tickethkidakhee.com';
    // Open Gmail compose in a new tab with the recipient email filled
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`,
      '_blank'
    );
  }

  openWebsite() {
    const url = 'https://ticketkhidakee.com/';
    window.open(url, '_blank');
  }

  ngAfterViewInit() {


    if (!(window as any).google) {

      const script = document.createElement('script');
      script.src =
        'https://maps.googleapis.com/maps/api/js?key=AIzaSyBj3CrHi01nPEkc3Nw5Zc-4bDarvstKCUI&libraries=places';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.initMap();
      };
      script.onerror = () => {
        this.errorMsg = 'Failed to load Google Maps script.';

      };
      document.head.appendChild(script);
    } else {


      this.initMap();
    }
  }
  errorMsg = '';
  initMap() {
    const location = { lat: 18.491197, lng: 73.826537 };
 
    const map = new (window as any).google.maps.Map(
      document.getElementById('map'),
      {
        zoom: 16,
        center: location,
      }
    );

    new (window as any).google.maps.Marker({
      position: location,
      map: map,
      title: 'Shriniketan Apartments, Pune',
    });
  }


  alphaOnly(event: any) {
    event = event ? event : window.event;
    var charCode = event.which ? event.which : event.keyCode;
    if (
      charCode > 32 &&
      (charCode < 65 || charCode > 90) &&
      (charCode < 97 || charCode > 122)
    ) {
      return false;
    }
    return true;
  }


  openWideWingsLocation(): void {
    const address = encodeURIComponent(
      'Shriniketan Apartments, First Floor, Sheelavihar Colony, Erandwane, Pune - 411038, Maharashtra, India.'
    );
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${address}`,
      '_blank',
      'noopener,noreferrer'
    );
  }


  updateMetaTags() {
    this.title.setTitle('Ticket Khidakee - Contact Us');

    // Canonical Tag
    let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    document.head.appendChild(link);
  }
}

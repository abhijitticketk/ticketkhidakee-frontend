import { DatePipe, DOCUMENT } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Services/api.service';
import { CommonFunctionService } from 'src/app/Services/CommonFunctionService';

@Component({
  selector: 'app-reportabug',
  templateUrl: './reportabug.component.html',
  styleUrls: ['./reportabug.component.scss'],
})
export class ReportabugComponent {
  constructor(
    private api: ApiService,
    private http: HttpClient,
    private toastr: ToastrService,
    public commonfunction: CommonFunctionService,
    private datePipe: DatePipe,
    private sanitizer: DomSanitizer, private meta: Meta, private title: Title
  ) {
    this.updateMetaTags()
  }

  memberId: any;
  ngOnInit(): void {
    this.memberId = localStorage.getItem('memberId');
    if (this.memberId != null && this.memberId != undefined) {
      this.getUserList();
    }
  }
  userdata: any
  getUserList() {
    this.api.getUserData(0, 0, '', '', ` AND ID =${this.memberId}`).subscribe({
      next: (res: any) => {
        if (res?.code === 200 && res?.data?.length > 0) {
          const data = res.data[0];
          this.userdata = data;
          // this.userData = [data];
          this.formData.NAME = data.NAME;

          this.formData.EMAIL_ID = data.EMAIL_ID;
          this.formData.PHONE = data.MOBILE_NO;
        } else {
          console.warn('No user data found');
        }
      },
      error: (err) => {
        console.error('Failed to fetch user data', err);
      },
    });
  }

  formData = {
    NAME: '',
    EMAIL_ID: '',
    PHONE: '',
    ENVIRONMENT: '',
    STEPS: '',
    DESCRIPTION: '',
    DOCUMENT: '',
  };
  isSubmitting = false;
  isOk = true;
  public commonFunction = new CommonFunctionService();
  onSubmit(form: NgForm) {
    // this.toastr.success('Please Fill All The Required Fields ', '');
    this.isOk = true;
    if (
      (this.formData.STEPS == '' ||
        this.formData.STEPS == null ||
        this.formData.STEPS == undefined) &&
      (this.formData.DESCRIPTION == undefined ||
        this.formData.DESCRIPTION == null ||
        this.formData.DESCRIPTION == '') &&
      (this.formData.PHONE == undefined ||
        this.formData.PHONE == null ||
        this.formData.PHONE == '') &&
      (this.formData.ENVIRONMENT == undefined ||
        this.formData.ENVIRONMENT == null ||
        this.formData.ENVIRONMENT == '')
    ) {
      this.isOk = false;
      this.toastr.error('Please fill all the required fields ', '');
    } else if (
      this.formData.PHONE == null ||
      this.formData.PHONE == undefined ||
      this.formData.PHONE == ''
    ) {
      this.isOk = false;
      this.toastr.error(' Please enter phone no.', '');
    } else if (
      this.formData.PHONE != null &&
      this.formData.PHONE != undefined &&
      !this.commonFunction.mobpattern.test(this.formData.PHONE.toString())
    ) {
      this.isOk = false;
      this.toastr.error('Please enter valid phone no.', '');
    } else if (
      this.formData.ENVIRONMENT == null ||
      this.formData.ENVIRONMENT == undefined ||
      this.formData.ENVIRONMENT == ''
    ) {
      this.isOk = false;
      this.toastr.error(' Please Enter environment details.', '');
    } else if (
      this.formData.STEPS == null ||
      this.formData.STEPS == undefined ||
      this.formData.STEPS == ''
    ) {
      this.isOk = false;
      this.toastr.error(' Please enter steps to reproduce.', '');
    } else if (
      this.formData.DESCRIPTION == null ||
      this.formData.DESCRIPTION == undefined ||
      this.formData.DESCRIPTION == ''
    ) {
      this.isOk = false;
      this.toastr.error(' Please enter the description about bug.', '');
    }

    if (this.isOk) {
      this.isSubmitting = true;
      const now = new Date();
      const payload = {
        NAME: this.formData.NAME,
        // LAST_NAME: this.formData.LAST_NAME.trim(),
        EMAIL_ID: this.formData.EMAIL_ID,
        CONTACT_NO: this.formData.PHONE,
        ENVIRONMENT: this.formData.ENVIRONMENT,
        STEPS_TO_REPRODUCE: this.formData.STEPS,
        DESCRIPTION: this.formData.DESCRIPTION,
        DOCUMENT: this.formData.DOCUMENT,
        COMPLAINT_DATETIME: this.datePipe.transform(now, 'yyyy-MM-dd HH:mm:ss'),
        COMPLAINT_ATTACHMENT: this.formData.DOCUMENT,
        STATUS: true,
      };

      this.api.reportBug(payload).subscribe({
        next: (res: any) => {
          if (res.code == '200') {
            this.toastr.success(
              "Your bug report has been successfully submitted! We appreciate you taking the time to help us improve. We'll look into it shortly.",
              'Success'
            );
            form.resetForm(); // Clear the form
            this.formData.DOCUMENT = '';


            if (this.memberId != null && this.memberId != undefined) {
              this.formData.NAME = this.userdata.NAME;

              this.formData.EMAIL_ID = this.userdata.EMAIL_ID;
              this.formData.PHONE = this.userdata.MOBILE_NO;
            }
          } else {
            this.toastr.error(
              'Failed to submit the bug report. Please try again later.',
              'Error'
            );
          }
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
    }
  }

  imageshow: any;
  imagePreview: any;
  selectedFile: any;
  fileURL: any = '';
  isSpinning = false;
  uploadedImage: any = '';
  UrlImageOne: any;
  timer: any;
  percentImageOne = 0;
  progressBarImageOne: boolean = false;
  onFileSelected(event: any) {
    const maxFileSize = 1 * 1024 * 1024; // 1MB

    // File validation
    if (
      event.target.files[0]?.type === 'image/jpeg' ||
      event.target.files[0]?.type === 'image/jpg' ||
      event.target.files[0]?.type === 'image/png' ||
      event.target.files[0]?.type === 'application/pdf'
    ) {
      this.fileURL = <File>event.target.files[0];

      // File size validation
      if (this.fileURL.size > maxFileSize) {
        this.toastr.error('File size should not exceed 1MB.', '');
        this.fileURL = null;
        return;
      }

      // Proceed with file upload
      var number = Math.floor(100000 + Math.random() * 900000);
      var fileExt = this.fileURL.name.split('.').pop();

      var d = this.datePipe.transform(new Date(), 'yyyyMMdd');
      var url = d == null ? '' : d + number + '.' + fileExt;

      if (this.formData.DOCUMENT != undefined && this.formData.DOCUMENT != '') {
        var arr = this.formData.DOCUMENT.split('/');
        if (arr.length > 1) {
          url = arr[5];
        }
      }

      const uploadedfileExt = this.uploadedImage.split('.').pop();

      if (this.UrlImageOne) {
        if (uploadedfileExt == fileExt) {
          this.UrlImageOne = this.uploadedImage;
        } else {
          this.UrlImageOne = url;
        }
      } else {
        this.UrlImageOne = url;
      }
      this.isSpinning = true;

      // this.timer = this.api
      //   .onUpload('complaintAttachments', this.fileURL, this.UrlImageOne)
      //   .subscribe((res) => {
      //     this.formData.DOCUMENT = this.UrlImageOne;

      //     this.uploadedImage = this.formData.DOCUMENT;
      //     if (res.type === HttpEventType.Response) {
      //       // Handle upload success
      //     }
      //     if (res.type === HttpEventType.UploadProgress) {
      //       const percentDone = Math.round((100 * res.loaded) / res.total);
      //       this.percentImageOne = percentDone;
      //       if (this.percentImageOne === 100) {
      //         this.isSpinning = false;
      //         setTimeout(() => {
      //           this.progressBarImageOne = false;
      //         }, 2000);
      //       }
      //     } else if (res.type == 2 && res.status != 200) {
      //       this.toastr.error('Failed To Upload Document.', '');
      //       this.isSpinning = false;
      //       this.progressBarImageOne = false;
      //       this.percentImageOne = 0;
      //       this.formData.DOCUMENT = '';
      //     } else if (res.type == 4 && res.body?.code === 200) {
      //       if (res.body?.code === 200) {
      //         this.toastr.error('Document Uploaded Successfully...', '');
      //         this.isSpinning = false;
      //         this.formData.DOCUMENT = this.UrlImageOne;
      //         this.uploadedImage = this.formData.DOCUMENT;
      //       } else {
      //         this.isSpinning = false;
      //         this.progressBarImageOne = false;
      //         this.percentImageOne = 0;
      //         this.formData.DOCUMENT = '';
      //       }
      //     }

      //   });
      this.timer = this.api
        .onUpload('complaintAttachments', this.fileURL, this.UrlImageOne,'')
        .subscribe((res) => {
          // Set uploaded image URL early so we can use it later if needed
          this.uploadedImage = this.UrlImageOne;

          // Handle upload progress
          if (res.type === HttpEventType.UploadProgress) {
            const percentDone = Math.round(
              (100 * res.loaded) / (res.total || 1)
            );
            this.percentImageOne = percentDone;
            if (percentDone === 100) {
              this.isSpinning = false;
              setTimeout(() => {
                this.progressBarImageOne = false;
              }, 2000);
            }
          }

          // Handle HTTP header response with failure (type 2)
          else if (
            res.type === HttpEventType.ResponseHeader &&
            res.status !== 200
          ) {
            this.toastr.error('Failed to upload document.', '');
            this.isSpinning = false;
            this.progressBarImageOne = false;
            this.percentImageOne = 0;
            this.formData.DOCUMENT = '';
          }

          // Handle final response (type 4) - success or failure
          else if (res.type === HttpEventType.Response) {
            if (res.body?.code === 200) {
              this.toastr.success('Document uploaded successfully.', '');
              this.formData.DOCUMENT = this.UrlImageOne;
              this.uploadedImage = this.formData.DOCUMENT;
              this.isSpinning = false;
            } else {
              this.toastr.error('Upload failed. Please try again.', '');
              this.isSpinning = false;
              this.progressBarImageOne = false;
              this.percentImageOne = 0;
              this.formData.DOCUMENT = '';
            }
          }
        });
    } else {
      this.toastr.error(
        'Only images (jpeg, jpg, png) and PDF files are allowed.',
        ''
      );
      this.fileURL = null;
      this.isSpinning = false;
      this.progressBarImageOne = false;
      this.percentImageOne = 0;
      this.formData.DOCUMENT = '';
    }
  }

  confirmDelete() {
    this.formData.DOCUMENT = ' ';
    this.fileURL = null;
    this.isSpinning = false;
    this.progressBarImageOne = false;
    this.percentImageOne = 0;
    this.formData.DOCUMENT = ' ';
    this.showConfirmModal = false;
  }
  showConfirmModal = false;
  ondelete() {
    this.showConfirmModal = true;
  }

  onDeleteCancelled(): void {
    this.showConfirmModal = false;
  }

  ViewImage: any;
  ImageModalVisible = false;

  viewImage(imageURL: string): void {
    this.ViewImage = 1;
    this.GetImage(imageURL);
  }
  sanitizedLink: any = '';

  GetImage(link: string) {
    let imagePath = this.api.retriveimgUrl + 'complaintAttachments/' + link;
    this.sanitizedLink =
      this.sanitizer.bypassSecurityTrustResourceUrl(imagePath);
    this.imageshow = this.sanitizedLink;

    // Display the modal only after setting the image URL
    this.ImageModalVisible = true;
  }
  openWebsite(): void {
    window.open(
      'https://ticketkhidakee.com/',
      '_blank',
      'noopener,noreferrer'
    );
  }

  openEmail(): void {
    window.location.href = 'mailto:contact@ticketkhidakee.com';
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

  openGlobilleteLocation(): void {
    const address = encodeURIComponent(
      'Plot No. 57, Flat No. 6, United Western Society, Karvenagar, Pune - 411052, Maharashtra, India.'
    );
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${address}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  showTooltip = false;

  toggleTooltip() {
    this.showTooltip = !this.showTooltip;
  }

  ImageModalCancel() {
    this.ImageModalVisible = false;
  }

  updateMetaTags() {
    this.title.setTitle('Ticket Khidakee - Report a Bug');

    // Canonical Tag
    let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    document.head.appendChild(link);
  }
}

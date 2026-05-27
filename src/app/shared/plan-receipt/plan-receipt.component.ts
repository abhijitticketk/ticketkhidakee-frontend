import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/Services/api.service';
import { CommonFunctionService } from 'src/app/Services/CommonFunctionService';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-plan-receipt',
  templateUrl: './plan-receipt.component.html',
  styleUrls: ['./plan-receipt.component.scss']
})
export class PlanReceiptComponent {

  loadingg: boolean = false;
  planId!: any;
  userId!: any;
  decryptedUserId: any;
  decryptedPlanId: any;
  datalist: any;
  subcribedata: any;
  userName: any;
  loadingforprint: boolean = false;
  subcribedetailsdata: any;

  public commonFunction = new CommonFunctionService();

  constructor(
    private apiService: ApiService,
    private route: Router,
    public userService: CommonFunctionService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.userName = this.userService.getUserName() || 'Guest';

    const url: any = this.route.url;
    const fixedUrl = url.replace(/&amp;/g, '&');
    const queryString = fixedUrl.split('?')[1];
    const params = new URLSearchParams(queryString);

    this.userId = params.get('userid');
    this.planId = params.get('planid');
    


    // this.route.queryParamMap.subscribe((params) => {

    //   this.planId = params.get('planid') || '';
    //   this.userId = params.get('userid') || '';


      let decodedBookingCode = decodeURIComponent(this.planId);
      let decodedUserId = decodeURIComponent(this.userId);

      var decryptedPlanId = decodedBookingCode.replace(/ /g, '+');
      this.decryptedPlanId = this.userService.decryptData(decryptedPlanId);

      var decryptedUserId = decodedUserId.replace(/ /g, '+');
      this.decryptedUserId = this.userService.decryptData(decryptedUserId);



      if (this.planId && this.userId) {
        // this.getPlanTransactionsdata()
        this.getSubscriptionDetails()
      }
    // });
  }


  getPlanTransactionsdata() {
    this.loadingg = true;
    this.apiService.getPlanTransactionsdata(1,
      1,
      '',
      'asc',
      ` AND USER_ID = ${this.decryptedUserId} AND PLAN_ID = ${this.decryptedPlanId}`)

      .subscribe(
        (data: any) => {
          if (data['code'] === 200 && this.decryptedUserId) {
            this.datalist = data.data[0];
            this.loadingg = false;
            this.getsubcriptiondata()
          } else {
            console.warn('No subscriptions found or error fetching subscriptions.');
            this.loadingg = false;
          }
        },
        (error) => {
          console.error('Error fetching subscriptions:', error);
          this.loadingg = false;
        }
      );
  }


  getsubcriptiondata() {
    this.loadingg = true;
    this.apiService.getMembershipSummary({ USER_ID: this.decryptedUserId })
      .subscribe(
        (data: any) => {
          if (data['code'] === 200 && this.decryptedUserId) {
            this.subcribedata = data["data"][0];
            this.loadingg = false;
          } else {
            console.warn('No subscriptions found or error fetching subscriptions.');
            this.loadingg = false;
          }
        },
        (error) => {
          console.error('Error fetching subscriptions:', error);
          this.loadingg = false;
        }
      );
  }

  getSubscriptionDetails() {
    this.loadingg = true;
    this.apiService.getSubscriptionDetails(1,
      1,
      '',
      'asc',
      ` AND USER_ID = ${this.decryptedUserId} AND PLAN_ID = ${this.decryptedPlanId}`)
      .subscribe(
        (data: any) => {
          if (data['code'] === 200 && this.decryptedUserId) {
            this.subcribedetailsdata = data["data"][0];
            this.loadingg = false;
          } else {
            console.warn('No subscriptions found or error fetching subscriptions.');
            this.loadingg = false;
          }
        },
        (error) => {
          console.error('Error fetching subscriptions:', error);
          this.loadingg = false;
        }
      );
  }

  share() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.toastr.success('URL copied to clipboard!.', 'Success');
    });
  }
  printTicket(): void {
    window.print();
  }

  // downloadTicket(): void {
  //   const receiptElement = document.querySelector('.receipt-container') as HTMLElement;

  //   if (!receiptElement) {
  //     console.error('Receipt container not found!');
  //     return;
  //   }

  //   html2canvas(receiptElement, {
  //     scale: 2,
  //     useCORS: true,
  //     allowTaint: false
  //   }).then(canvas => {
  //     const imgData = canvas.toDataURL('image/png');
  //     const pdf = new jspdf('p', 'mm', 'a4');

  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = pdf.internal.pageSize.getHeight();

  //     const padding = 10;

  //     const imgWidth = pdfWidth - padding * 2;
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //     const yPos = (pdfHeight - imgHeight) / 2;

  //     pdf.addImage(
  //       imgData,
  //       'PNG',
  //       padding,
  //       yPos < padding ? padding : yPos,
  //       imgWidth,
  //       imgHeight
  //     );

  //     pdf.save('receipt.pdf');
  //   });
  // }
  downloadTicket(): void {
    const element = document.getElementById('print-section');
    if (!element) return;

    this.loadingforprint = true;

    const images = element.getElementsByTagName('img');
    const promises = Array.from(images).map((img) => {
      return new Promise<void>((resolve) => {
        if (img.complete) return resolve();
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    });

    Promise.all(promises).then(() => {
      const isMobile = this.apiService.isMobileDevice();

      html2canvas(element, { useCORS: true, scale: isMobile ? 3 : 2 })
        .then((canvas) => {
          const pdf = new jspdf('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          const marginTop = 5;
          const marginBottom = 5;
          const usableHeight = pdfHeight - marginTop - marginBottom;

          const pageHeightPx = (usableHeight * canvas.width) / pdfWidth;

          let startY = 0;
          let pageIndex = 0;

          while (startY < canvas.height) {
            let sliceHeight = Math.min(pageHeightPx, canvas.height - startY);

            if (sliceHeight <= 15) break;

            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = sliceHeight;

            const ctx = pageCanvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#fff';
              ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
              ctx.drawImage(
                canvas,
                0,
                startY,
                canvas.width,
                sliceHeight,
                0,
                0,
                canvas.width,
                sliceHeight
              );
            }

            const imageData = ctx?.getImageData(
              0,
              0,
              pageCanvas.width,
              pageCanvas.height
            ).data;
            const hasContent = imageData
              ? Array.from(imageData).some((pixel) => pixel !== 255)
              : false;

            if (!hasContent) break;

            const pageData = pageCanvas.toDataURL('image/jpeg', 1);
            const isLastPage = startY + sliceHeight >= canvas.height;

            if (pageIndex > 0) pdf.addPage();

            const heightToUse = isLastPage
              ? (sliceHeight * pdfWidth) / canvas.width
              : usableHeight;

            pdf.addImage(pageData, 'JPEG', 0, marginTop, pdfWidth, heightToUse);

            startY += sliceHeight;
            pageIndex++;
          }

          pdf.save('receipt.pdf');
          this.loadingforprint = false;
        })
        .catch(() => (this.loadingforprint = false));
    });
  }
  getSanitizedHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

}

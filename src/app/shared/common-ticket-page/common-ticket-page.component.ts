import { Component, Input } from '@angular/core';
import { ApiService } from 'src/app/Services/api.service';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { ActivatedRoute, } from '@angular/router';
import { CommonFunctionService } from 'src/app/Services/CommonFunctionService';
import * as QRCode from 'qrcode';
import { ToastrService } from 'ngx-toastr';


interface SectionSummary {
  section: string;
  seats: string;
  count: number;
}
@Component({
  selector: 'app-common-ticket-page',
  templateUrl: './common-ticket-page.component.html',
  styleUrls: ['./common-ticket-page.component.scss'],
})
export class CommonTicketPageComponent {
  loadingg: boolean = false;
  @Input() ticketData: any;

  Bookingcode: any;
  userid: any;
  memberId: any;
  encryptedUserId =
    sessionStorage.getItem('userId') || localStorage.getItem('userId');
  qrCodeDataURL: any = '';
  downloadfile = false;
  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    public userService: CommonFunctionService,
    private toastr: ToastrService
  ) { }
  retriveimgUrl = this.apiService.retriveimgUrl;
  sanitizedTerms: any;
  loading: boolean = false;
  isMobile = false;
  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      let encBookingCode: any = params.get('bookingcode');
      let encUserId: any = params.get('userid');
      let decodedBookingCode = decodeURIComponent(encBookingCode);
      let decodedUserId = decodeURIComponent(encUserId);
      decodedBookingCode = decodedBookingCode.replace(/ /g, '+');
      decodedUserId = decodedUserId.replace(/ /g, '+');
      const decryptedBookingCode =
        this.userService.decryptData(decodedBookingCode);
      const decryptedUserId = this.userService.decryptData(decodedUserId);
      this.Bookingcode = decryptedBookingCode;
      this.userid = decryptedUserId;
    });
    this.isMobile = this.apiService.isMobileDevice();
    // let qrText = "{'Booking_Code':'" + this.Bookingcode + "'}";
    let qrText = JSON.stringify({ Booking_Code: this.Bookingcode });
    this.generateQRWithLogo(
      qrText,
      'assets/logo.png'
    ).then(finalQr => {
      this.qrCodeDataURL = finalQr;
    });
    // QRCode.toDataURL(qrText, { margin: 2 }).then((url: string) => {
    //   this.qrCodeDataURL = url;
    // });
    if (this.Bookingcode) {
      this.loading = true;
      this.getBookingData();
    } else {
      // this.toastr.error('Error Booking Code Invalid.', 'Error');
    }
  }


  groupSeats(sections: string[], seats: string[]) {
    const grouped: any[] = [];
    sections.forEach((section, i) => {
      const existing = grouped.find((g) => g.section === section);
      if (existing) {
        existing.seats.push(seats[i]);
      } else {
        grouped.push({ section, seats: [seats[i]] });
      }
    });
    return grouped;
  }
  groupedSeatData: any;

  getBookingData() {
    this.loadingg = true;
    this.apiService.getBookingData(this.Bookingcode).subscribe(
      (response: any) => {
        const data = response.data[0];
        const BOOKING_DATA = JSON.parse(data.BOOKING_DATA);
        const BOOKING_CART_DETAILS = JSON.parse(data.BOOKING_CART_DETAILS);

        const showDate = data.SHOW_DATE;
        const showTime = data.SHOW_TIME;
        const datePart = new Date(showDate).toISOString().split('T')[0];

        this.ticketData = {
          eventImage: data.EVENT_IMAGE,
          eventTitle: data.EVENT_NAME,
          eventDate: `${datePart}T${showTime}`,
          eventVenue: data.VENUE_NAME,
          city: data.CITY_NAME,
          customerName: data.MEMBER_NAME,
          ticketCount: data.NUMBERS_OF_SEATS,
          hostingType: data.HOSTING_TYPE,
          seatInfo: BOOKING_DATA.map((section: any) => ({
            SECTION_NAME: section.SECTION_NAME,
            SUB_SECTION_NAME: section.SUB_SECTION_NAME,
            NO_OF_TICKETS: section.NO_OF_TICKETS || section.NO_OF_SEATS,
            SEAT_NUMBERS: section.SEAT_NUMBERS,
            IS_SEAT_SOFA: section.IS_SEAT_SOFA,
            SEAT_PRICE: section.AMOUNT || 0
          })),
          seatAmount: data.AMOUNT,
          TERMS_CONDITIONS: data.TERMS_CONDITIONS.map((t: string) => ({
            TERMS_CONDITIONS: t,
          })),
          sanitizedTerms: data.TERMS_CONDITIONS?.map((term: string) =>
            this.stripHtmlTags(term)
          ),
          totalPrice: data.AMOUNT,
          finalAmount: data.TOTAL_AMOUNT,
          convenienceFee:
            Math.ceil(
              (Number(data.TOTAL_BOOKING_FEE) + (data.TAX_AMOUNT || 0)) * 100
            ) / 100,
          bookingId: data.BOOKING_CODE,
          coupandiscount: data.DISCOUNT || 0,
          memberdiscount: data.DISCOUNT_AMOUNT || 0,
          age: data.AGE_GROUP,
          planid: data.PLAN_ID || 0,
          PLAN_NAME: data.PLAN_NAME || '',
          MAIN_EVENT_NAME: data.MAIN_EVENT_NAME || '',
          bookingFee: data.TOTAL_BOOKING_FEE,
          payMethod: data.PAYMENT_METHOD,
          COUPON_CODE: data.COUPON_CODE || '',
          discount: data.DISCOUNT || data.DISCOUNT_AMOUNT || 0,
          reference: data.RAZ_ORDER_ID,
          taxFee: data.TAX_AMOUNT
        };;

        // && data.SEAT_NUMBERS

        if (this.ticketData.hostingType == 'C') {

          const seatMap = new Map<string, {
            isSofa: boolean;
            count: number;
            price: number;
            section: string;
            subSection: string;
          }>();

          let totalTickets = 0;

          BOOKING_DATA.forEach((item: any) => {

            const seats: string[] = Array.isArray(item.SEAT_NUMBERS)
              ? item.SEAT_NUMBERS
              : JSON.parse(item.SEAT_NUMBERS || '[]');

            seats.forEach((seatName: string) => {

              totalTickets++;

              if (!seatMap.has(seatName)) {
                seatMap.set(seatName, {
                  isSofa: item.SEAT_TYPE == 'F' ? true : false,
                  count: 1,
                  price: Number(item.AMOUNT) || 0,
                  section: item.SECTION_NAME,
                  subSection: item.SUB_SECTION_NAME
                });
              } else {
                seatMap.get(seatName)!.count += 1;
              }

            });

          });
          const summaryArray: any[] = [];

          seatMap.forEach((value, seatName) => {

            summaryArray.push({
              seatName: seatName,
              isSofa: value.isSofa,
              count: value.count
            });

          });
          this.groupedSeatData = {
            seats: summaryArray,
            count: totalTickets
          };

          this.ticketData.seatInfo = [];

          seatMap.forEach((value, seatName) => {

            if (value.isSofa) {

              const persons = value.count;

              this.ticketData.seatInfo.push({
                seat: `${seatName}`,
                sofaCount: persons,
                section: value.section,
                subSection: value.subSection,
                price: value.price * value.count,
                seat_type: value.isSofa
              });

            } else {

              for (let i = 0; i < value.count; i++) {
                this.ticketData.seatInfo.push({
                  seat: seatName,
                  section: value.section,
                  subSection: value.subSection,
                  price: value.price
                });
              }

            }

          });

        } else {
          // fallback for normal tickets

          this.ticketData.seatInfo = BOOKING_CART_DETAILS.map((section: any) => ({
            SECTION_NAME: section.SECTION_NAME,
            NO_OF_TICKETS: section.NO_OF_SEATS,
            SEAT_PRICE: section.BASE_AMOUNT || 0
          }));
        }

        this.loadingg = false;
        this.loading = false;
        // ✅ Load image
        this.getImageBase64('eventImages', this.ticketData.eventImage);

        // setTimeout(() => {

        // }, 4000);
      },
      (error: any) => {
        this.loadingg = false;

      }
    );
  }

  stripHtmlTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  copyBookingId(): void {
    const bookingIdText = `BOOKING ID - ${this.ticketData.bookingId}`;
    navigator.clipboard.writeText(this.ticketData.bookingId).then(() => {
      const bookingIdElement = document.querySelector('.booking-id');
      if (bookingIdElement) {
        const originalText = bookingIdElement.textContent;
        bookingIdElement.textContent = 'Booking ID Copied!';
        (bookingIdElement as HTMLElement).style.color = '#4CAF50';
        setTimeout(() => {
          bookingIdElement.textContent = originalText!;
          (bookingIdElement as HTMLElement).style.color = '#000';
        }, 2000);
      }
    });
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
  //
  // }
  loadingforprint = false;
  avatarUrl: any = '';

  // downloadTicket(): void {
  //   const element = document.getElementById('print-section');
  //   if (!element) return;

  //   this.loadingforprint = true;

  //   const images = element.getElementsByTagName('img');
  //   const promises = Array.from(images).map(img => {
  //     return new Promise<void>((resolve) => {
  //       if (img.complete) return resolve();
  //       img.onload = () => resolve();
  //       img.onerror = () => resolve();
  //     });
  //   });

  //   Promise.all(promises).then(() => {
  //     const isMobile = this.apiService.isMobileDevice();

  //     html2canvas(element, { useCORS: true, scale: isMobile ? 3 : 2 }).then(canvas => {
  //       const pdf = new jspdf('p', 'mm', 'a4');
  //       const pdfWidth = pdf.internal.pageSize.getWidth();
  //       const pdfHeight = pdf.internal.pageSize.getHeight();

  //       const marginTop = 5;
  //       const marginBottom = 5;
  //       const usableHeight = pdfHeight - marginTop - marginBottom;

  //       const pageHeightPx = (usableHeight * canvas.width) / pdfWidth;

  //       let startY = 0;
  //       let pageIndex = 0;

  //       while (startY < canvas.height) {
  //         let sliceHeight = Math.min(pageHeightPx, canvas.height - startY);

  //         const pageCanvas = document.createElement("canvas");
  //         pageCanvas.width = canvas.width;
  //         pageCanvas.height = sliceHeight;

  //         const ctx = pageCanvas.getContext("2d");
  //         if (ctx) {
  //           ctx.fillStyle = "#fff";
  //           ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
  //           ctx.drawImage(
  //             canvas,
  //             0,
  //             startY,
  //             canvas.width,
  //             sliceHeight,
  //             0,
  //             0,
  //             canvas.width,
  //             sliceHeight
  //           );
  //         }

  //         const pageData = pageCanvas.toDataURL("image/jpeg", 1);
  //         if (pageIndex > 0) pdf.addPage();

  //         const isLastPage = startY + sliceHeight >= canvas.height;

  //         if (isLastPage) {
  //           const finalHeight = (sliceHeight * pdfWidth) / canvas.width;
  //           pdf.addImage(pageData, "JPEG", 0, marginTop, pdfWidth, finalHeight);
  //         } else {
  //           pdf.addImage(pageData, "JPEG", 0, marginTop, pdfWidth, usableHeight);
  //         }

  //         startY += sliceHeight;
  //         pageIndex++;
  //       }

  //       pdf.save(this.Bookingcode + "_ticket.pdf");
  //       this.loadingforprint = false;
  //     }).catch(() => this.loadingforprint = false);
  //   });
  // }
  downloadTicket(): void {
    const element = document.getElementById('print-section');
    if (!element) return;

    this.loadingforprint = true;

    const images = element.getElementsByTagName('img');
    const promises = Array.from(images).map(img => {
      return new Promise<void>(resolve => {
        if (img.complete) resolve();
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    });

    Promise.all(promises).then(() => {
      const rows = Array.from(
        element.querySelectorAll('.pdf-row')
      ) as HTMLElement[];

      const rowRects = rows.map(row => {
        const r = row.getBoundingClientRect();
        const parent = element.getBoundingClientRect();
        return {
          top: r.top - parent.top,
          height: r.height
        };
      });

      const isMobile = this.apiService.isMobileDevice();

      html2canvas(element, {
        scale: isMobile ? 3 : 1.5,
        useCORS: true,
        backgroundColor: '#ffffff'
      }).then(canvas => {

        const pdf = new jspdf('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const marginTop = 10;
        const marginBottom = 10;
        const usableHeight = pdfHeight - marginTop - marginBottom;

        const pageHeightPx = (usableHeight * canvas.width) / pdfWidth;
        const scaleFactor = canvas.width / element.offsetWidth;

        const canvasRows = rowRects.map(r => ({
          top: r.top * scaleFactor,
          height: r.height * scaleFactor
        }));

        let startY = 0;
        let pageIndex = 0;
        while (startY < canvas.height) {

          let sliceHeight = Math.min(
            pageHeightPx,
            canvas.height - startY
          );

          for (const row of canvasRows) {
            const rowBottom = row.top + row.height;

            if (
              row.top < startY + sliceHeight &&
              rowBottom > startY + sliceHeight
            ) {
              sliceHeight = row.top - startY;
              break;
            }
          }

          if (sliceHeight <= 0) {
            sliceHeight = pageHeightPx;
          }

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeight;

          const ctx = pageCanvas.getContext('2d')!;
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

          if (pageIndex > 0) pdf.addPage();

          const imgHeight = (sliceHeight * pdfWidth) / canvas.width;
          pdf.addImage(
            pageCanvas.toDataURL('image/jpeg', 1),
            'PNG',
            0,
            marginTop,
            pdfWidth,
            imgHeight,
            undefined,
            'FAST' // important
          );

          startY += sliceHeight;
          pageIndex++;
        }

        pdf.save(this.Bookingcode + '_ticket.pdf');
        this.loadingforprint = false;

      }).catch(() => this.loadingforprint = false);
    });
  }
  getImageBase64(folder: string, filename: string) {
    this.apiService.getEventImageBase64(folder, filename).subscribe({
      next: (res: any) => {
        this.avatarUrl = `data:${res.MIMETYPE};base64,${res.data}`;
        // this.loading = false;
        this.downloadfile = true;
      },
      error: (err) => {
        console.error('API Error', err);
      },
    });
  }


  generateQRWithLogo(qrText: string, logoUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {

      const size = 300;
      const dpr = window.devicePixelRatio || 1;

      QRCode.toDataURL(qrText, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: size * dpr
      }).then((qrUrl: string) => {

        const qrImg = new Image();
        const logoImg = new Image();

        qrImg.src = qrUrl;
        logoImg.src = logoUrl;

        qrImg.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;

          canvas.width = size * dpr;
          canvas.height = size * dpr;
          canvas.style.width = `${size}px`;
          canvas.style.height = `${size}px`;

          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.imageSmoothingEnabled = false;

          // Draw QR (crisp)
          ctx.drawImage(qrImg, 0, 0, size, size);

          logoImg.onload = () => {
            const logoSize = size * 0.22; // 22%
            const x = (size - logoSize) / 2;
            const y = (size - logoSize) / 2;

            // White background (important)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x - 6, y - 6, logoSize + 12, logoSize + 12);

            // Enable smoothing only for logo
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            ctx.drawImage(logoImg, x, y, logoSize, logoSize);

            resolve(canvas.toDataURL('image/png'));
          };

          logoImg.onerror = reject;
        };

        qrImg.onerror = reject;
      }).catch(reject);
    });
  }

  scale = 0.5;

  zoomin() {
    if (this.scale < 2.5) {
      this.scale += 0.5;

      this.applyZoom();
      const element2 = document.getElementsByClassName('print-outer');
      if (!element2) return;
      const printouter = element2[0] as HTMLElement;
      printouter.style.justifyContent = 'left';
    }
  }

  zoomout() {
    if (this.scale > 0.5) {
      this.scale = Math.max(0.5, this.scale - 0.5);
      this.applyZoom();
      if (this.scale == 0.5) {
        const element2 = document.getElementsByClassName('print-outer');
        if (!element2) return;
        const printouter = element2[0] as HTMLElement;
        printouter.style.justifyContent = 'center';
        printouter.style.overflow = 'none';
      }
    }
  }

  applyZoom() {
    const element = document.getElementById('print-section');
    if (!element) return;
    if (this.scale == 0.5) {
      element.style.transform = `scale(${this.scale})`;
      element.style.transformOrigin = 'center top';
    } else {
      element.style.transform = `scale(${this.scale})`;
      element.style.transformOrigin = 'left top';
    }
  }
}


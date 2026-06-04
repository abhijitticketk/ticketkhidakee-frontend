import { ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { ApiService } from 'src/app/Services/api.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DomSanitizer } from '@angular/platform-browser';
import jspdf from 'jspdf';
import { CommonFunctionService } from 'src/app/Services/CommonFunctionService';
// import printJS from 'print-js';

@Component({
  selector: 'app-ticketpage',
  templateUrl: './ticketpage.component.html',
  styleUrls: ['./ticketpage.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TicketpageComponent {


  @Input() ticketData: any


  @Input() enableMobileZoom: boolean = true;
  public commonFunction = new CommonFunctionService();
  seatDotData: any;

  constructor(private apiService: ApiService, private sanitizer: DomSanitizer, private cd: ChangeDetectorRef) { }
  retriveimgUrl = this.apiService.retriveimgUrl
  sanitizedTerms: any
  groupedSeatData: any
  loadingticket: boolean = false;
  seatsWithSection: any;
  map = new Map<string, any[]>();
  sectionMap = new Map<string, any>();
  seatDisplayData:any;

  ngOnInit(): void {
    if (this.ticketData.eventImage) {
      this.loadingticket = true;

      this.getImageBase64('eventImages', this.ticketData.eventImage);
    }

    if (this.ticketData.TERMS_CONDITIONS) {
      this.sanitizedTerms = this.ticketData.TERMS_CONDITIONS.map((term: any) =>
        this.stripHtmlTags(term)
      );
    }
    // console.log('this.ticketData', this.ticketData);


    const [year, month, day] = this.ticketData.eventDate.split('-');
    const dateStr = `${year}-${month}-${day} ${this.ticketData.eventTime}`;
    const dateTime = new Date(dateStr);
    this.ticketData.eventDate = new Date(dateTime);
    // if(this.ticketData.convenienceFee)
    // this.ticketData.convenienceFee = (Math.ceil(this.ticketData.convenienceFee) * 100) / 100;
    // if (this.ticketData.convenienceFee)
    //   this.ticketData.convenienceFee = (Math.ceil(this.ticketData.convenienceFee) * 100) / 100;

    // if (this.ticketData.hostingType == 'C') {
    //   const map = new Map<string, { seat: string; price: number }[]>();
    const sectionMap = new Map<string, any>();

    this.ticketData.seatInfo.forEach((item: any) => {
      const ticketCount = item.NO_OF_TICKETS || 1;

      if (!sectionMap.has(item.SECTION_NAME)) {
        sectionMap.set(item.SECTION_NAME, {
          section: item.SECTION_NAME,
          count: 0,
          price: 0   // total price for that section
        });
      }

      const sectionRow = sectionMap.get(item.SECTION_NAME);

      sectionRow.count += ticketCount;
      sectionRow.price += item.AMOUNT * ticketCount;
    });

    this.seatsWithSection = Array.from(sectionMap.values());

    // hostingType == C
    const seatMap = new Map<string, any>();
    let totalCount = 0;

    this.ticketData.seatInfo.forEach((item: any) => {

      let seats: string[] = [];

      try {
        const raw = Array.isArray(item.SEAT_NUMBERS)
          ? item.SEAT_NUMBERS
          : JSON.parse(item.SEAT_NUMBERS || '[]');

        // SEAT_NUMBERS can be an array of strings ("A-1") or objects ({seat, id, price})
        seats = raw.map((s: any) => {
          if (typeof s === 'string') return s;
          if (s && typeof s === 'object') return s.seat || String(s);
          return String(s);
        });
      } catch {
        seats = [];
      }

      seats.forEach((seatNo: string) => {

        totalCount++;

        if (!seatMap.has(seatNo)) {
          seatMap.set(seatNo, {
            seatNumber: seatNo,
            sectionNAME: item.SECTION_NAME,
            sub_section: item.SUB_SECTION_NAME,
            isSofa: item.SEAT_TYPE == 'F'?true : false,
            count: 0,
            totalAmount: 0
          });
        }

        const seatRow = seatMap.get(seatNo);

        seatRow.count += 1;
        seatRow.totalAmount += Number(item.AMOUNT) || 0;

      });

    });
    const summaryArray: any[] = [];


    seatMap.forEach((value, seatNumber) => {

      summaryArray.push({
        seatName: seatNumber,
        isSofa: value.isSofa,
        count: value.count
      });

    });

    this.seatDisplayData = {
      seatsN: summaryArray,
      count: totalCount
    };

    this.seatDotData = Array.from(seatMap.values()).map(row => {

      if (row.isSofa) {
        return {
          ...row,
          count: row.count
        };
      }

      return row;

    });
    setTimeout(() => {
      this.cd.detectChanges();
    }, 500);


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

  printTicket(): void {
    window.print();
  }

  loadingforprint = false



  downloadTicket2(): void {

    const element = document.getElementById('print-section');
    if (!element) return;

    this.loadingforprint = true;

    // Ensure images are loaded
    const images = element.getElementsByTagName('img');
    const promises = Array.from(images).map(img => {
      return new Promise<void>((resolve) => {
        if (img.complete) return resolve();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // still resolve even if broken
      });
    });


    Promise.all(promises).then(() => {
      html2canvas(element, { useCORS: true, scale: 1.5 }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 1);
        const pdf = new jspdf('p', 'mm', 'a4');

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(this.ticketData.bookingId + '_ticket.pdf');

        this.loadingforprint = false;
      }).catch(() => this.loadingforprint = false);
    });
  }

  // downloadTicket(): void {

  //   const element = document.getElementById('print-section');
  //   if (!element) return;

  //   this.loadingforprint = true;
  //   this.applyMargin = true;

  //   // Ensure images are loaded
  //   const images = element.getElementsByTagName('img');
  //   const promises = Array.from(images).map(img => {
  //     return new Promise<void>((resolve) => {
  //       if (img.complete) return resolve();
  //       img.onload = () => resolve();
  //       img.onerror = () => resolve(); // still resolve even if broken
  //     });
  //   });

  //   Promise.all(promises).then(() => {
  //     html2canvas(element, { useCORS: true, scale: 1.5 }).then(canvas => {
  //       const imgData = canvas.toDataURL('image/jpeg', 1);
  //       const pdf = new jspdf('p', 'mm', 'a4');

  //       const imgProps = pdf.getImageProperties(imgData);
  //       const pdfWidth = pdf.internal.pageSize.getWidth();
  //       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  //       pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  //       pdf.save(this.ticketData.bookingId + '_ticket.pdf');
  //       this.loadingforprint = false;
  //       this.applyMargin = false;
  //     }).catch(() => this.loadingforprint = false);
  //   });
  // }
  parseSeats(seatNumbers: any): string[] {
    if (Array.isArray(seatNumbers)) {
      return seatNumbers;
    }

    if (typeof seatNumbers === 'string') {
      try {
        return JSON.parse(seatNumbers);
      } catch {
        return [];
      }
    }

    return [];
  }

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
        scale: isMobile ? 4 : 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      }).then(canvas => {

        const pdf = new jspdf('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const marginTop = 10;
        const marginBottom = 10;
        const usableHeight = pdfHeight;

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
            'JPEG',
            0,
            marginTop,
            pdfWidth,
            imgHeight
          );

          startY += sliceHeight;
          pageIndex++;
        }

        pdf.save(this.ticketData.bookingId + '_ticket.pdf');
        this.loadingforprint = false;

      }).catch(() => this.loadingforprint = false);
    });
  }
  applyMargin: boolean = false;

  //   downloadTicket(): void {

  //     const element = document.getElementById('print-section');
  //     if (!element) return;

  //     this.loadingforprint = true;
  // this.applyMargin = true;
  //     // Ensure images are loaded
  //     const images = element.getElementsByTagName('img');
  //     const promises = Array.from(images).map(img => {
  //       return new Promise<void>((resolve) => {
  //         if (img.complete) return resolve();
  //         img.onload = () => resolve();
  //         img.onerror = () => resolve(); // still resolve even if broken
  //       });
  //     });

  //     Promise.all(promises).then(() => {
  //       html2canvas(element, { useCORS: true, scale: 1.5 }).then(canvas => {
  //         const imgData = canvas.toDataURL('image/jpeg', 1);
  //         const pdf = new jspdf('p', 'mm', 'a4');

  //         const imgProps = pdf.getImageProperties(imgData);
  //         const pdfWidth = pdf.internal.pageSize.getWidth();
  //         const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  //         pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  //         pdf.save(this.ticketData.bookingId + '_ticket.pdf');

  //         this.loadingforprint = false;
  //         this.applyMargin = false;
  //       }).catch(() => this.loadingforprint = false);
  //     });
  //   }

  // printSection() {
  //   printJS({
  //     printable: 'print-section', // ID of the div
  //     type: 'html',
  //     targetStyles: ['*'], // Copy all styles
  //     scanStyles: true     // Ensures styles inside <style> tags are included
  //   });
  // }

  formatSeatData(bookings: any[]): string {
    const sectionMap: { [section: string]: string[] } = {};

    for (const booking of bookings) {
      const section = booking.SECTION_NAME;
      if (!sectionMap[section]) {
        sectionMap[section] = [];
      }
      for (const seat of booking.SEAT_NUMBERS) {
        sectionMap[section].push(seat.seat);
      }
    }

    // Format the output
    const result: string[] = [];
    for (const section in sectionMap) {
      result.push(`${section} - ${sectionMap[section].join(', ')}`);
    }

    return result.join('\n');
  }

  avatarUrl: any
  getImageBase64(folder: string, filename: string) {

    this.apiService.getEventImageBase64(folder, filename).subscribe({
      next: (res: any) => {
        this.avatarUrl = `data:${res.MIMETYPE};base64,${res.data}`;
        this.loadingticket = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('API Error', err);
      }
    });
  }

}
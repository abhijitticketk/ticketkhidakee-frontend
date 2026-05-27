import { Component } from '@angular/core';

@Component({
  selector: 'app-bookticketpage',
  templateUrl: './bookticketpage.component.html',
  styleUrls: ['./bookticketpage.component.scss']
})
export class BookticketpageComponent {


   selectedDate: string = '2025-05-21';
  selectedTime: string = '1400';
  ticketCount: number = 2;
  seatSection: string = 'orchestra';
  seatAvailability: number = 78;

  additionalOptions = {
    program: false,
    parking: false,
    donation: false
  };

  timeSlots = [
    { value: '1400', label: '2:00 PM' },
    { value: '1900', label: '7:00 PM' },
    { value: '2000', label: '8:00 PM' }
  ];

  seatSections = ['orchestra', 'mezzanine', 'balcony'];

  incrementTicket() {
    if (this.ticketCount < 10) this.ticketCount++;
  }

  decrementTicket() {
    if (this.ticketCount > 1) this.ticketCount--;
  }

  priceSummaryItems = [
  { label: 'Chartered Seats (2)', amount: 179.98 },
  { label: 'Digital Program', amount: 4.99 },
  { label: 'Service Fee', amount: 9.99 },
  { label: 'Facility Fee', amount: 4.5 }
];

getTotal(): number {
  return this.priceSummaryItems.reduce((sum, item) => sum + item.amount, 0);
}

}

import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-delivery-shipping',
  templateUrl: './delivery-shipping.component.html',
  styleUrls: ['./delivery-shipping.component.scss']
})
export class DeliveryShippingComponent {
  constructor(
    private meta: Meta, private title: Title
  ) {
    this.updateMetaTags()
  }


  updateMetaTags() {
    this.title.setTitle('Ticket Khidakee - Delivery & Shipping');

    // Canonical Tag
    let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    document.head.appendChild(link);
  }
}

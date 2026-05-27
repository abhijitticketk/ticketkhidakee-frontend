import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-about-us-page',
  templateUrl: './about-us-page.component.html',
  styleUrls: ['./about-us-page.component.scss']
})
export class AboutUsPageComponent {

  constructor(

    private meta: Meta, private title: Title
  ) {
    this.updateMetaTags()
  }
  features = [
    {
      title: 'Easy hosting',
      image: 'images/about/img-1.jpg',
      description: 'You can focus on your show, rest we will provide you with all the facilities.',
      modalTarget: 'communitieModal1'
    },
    {
      title: 'One-stop solution for hosting online events',
      image: 'images/about/img-2.jpg',
      description: 'You Demand & We Supply - Live Streaming and Video on Demand, both options on your finger tips. Ticket Khidakee is your answer for Hosting any kind of Online events.',
      modalTarget: 'communitieModal2'
    },
    {
      title: 'New Age Ticket Booking Platform',
      image: 'images/about/img-3.jpg',
      description: 'We use latest technology to deliver a high-quality and user-friendly ticket booking experience.',
      modalTarget: 'communitieModal3'
    },
    {
      title: 'Easy & Fast Payments',
      image: 'images/about/img-4.jpg',
      description: 'Integrated Payment Gateway supporting country-specific currency payments globally.',
      modalTarget: 'communitieModal4'
    },
    {
      title: 'Global Platform',
      image: 'images/about/img-5.jpg',
      description: 'Market your event to the Global Audience with us.',
      modalTarget: 'communitieModal5'
    }
  ];



  updateMetaTags() {
    this.title.setTitle('Ticket Khidakee - About Us');

    // Canonical Tag
    let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    document.head.appendChild(link);
  }



}

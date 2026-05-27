import { Component } from '@angular/core';

@Component({
  selector: 'app-offerdetailspage',
  templateUrl: './offerdetailspage.component.html',
  styleUrls: ['./offerdetailspage.component.scss'],
})
export class OfferdetailspageComponent {
  offers: any = [
    // Early Bird Offers
    {
      id: 'offer1',
      category: 'early-bird',
      badge: '25% OFF',
      image: {
        src: 'https://readdy.ai/api/search-image?query=Broadway%2520theater%2520stage%2520with%2520dramatic%2520lighting%252C%2520elegant%2520red%2520curtains%252C%2520and%2520empty%2520seats%2520in%2520foreground.%2520Professional%2520theater%2520atmosphere%2520with%2520warm%2520golden%2520lights%2520highlighting%2520the%2520stage.%2520High-quality%2520theatrical%2520setting%2520with%2520ornate%2520details%2520and%2520premium%2520ambiance&width=400&height=200&seq=offer1&orientation=landscape',
        alt: 'Early Bird Special',
        className: 'offer-image',
      },
      title: "Early Bird Special: The Phantom's Encore",
      description:
        'Book at least 30 days in advance and save 25% on premium seats for this spectacular musical performance.',
      validity: 'Valid until June 10, 2025',
      termsId: 'terms1',
      termsText:
        'Valid for bookings made at least 30 days before the show date. Discount applies to premium and standard seats only. Cannot be combined with other offers. Subject to availability.',
      button: {
        className: 'offer-button !rounded-button whitespace-nowrap',
        icon: 'ri-ticket-2-line',
        text: 'Book Now',
      },
    },
    {
      id: 'offer2',
      category: 'early-bird',
      badge: '20% OFF',
      image: {
        src: 'https://readdy.ai/api/search-image?query=Shakespeare%2520play%2520performance%2520on%2520stage%2520with%2520actors%2520in%2520period%2520costumes.%2520Dramatic%2520lighting%2520highlighting%2520performers%2520against%2520dark%2520background.%2520Professional%2520theater%2520production%2520with%2520detailed%2520set%2520design.%2520High-quality%2520theatrical%2520moment%2520with%2520emotional%2520expression&width=400&height=200&seq=offer2&orientation=landscape',
        alt: 'Hamlet Early Booking',
        className: 'offer-image',
      },
      title: 'Early Bird: Hamlet Reimagined',
      description:
        'Reserve your seats 3 weeks in advance for this critically acclaimed adaptation and enjoy 20% off all ticket categories.',
      validity: 'Valid until June 1, 2025',
      termsId: 'terms2',
      termsText:
        'Booking must be made at least 21 days in advance. Valid for all seating categories. Limited availability for weekend performances. No refunds or exchanges.',
      button: {
        className: 'offer-button !rounded-button whitespace-nowrap',
        icon: 'ri-ticket-2-line',
        text: 'Book Now',
      },
    },

    // Group Booking Offers
    {
      id: 'offer3',
      category: 'group',
      badge: '30% OFF',
      image: {
        src: 'https://readdy.ai/api/search-image?query=Group%2520of%2520diverse%2520people%2520enjoying%2520a%2520theater%2520performance%252C%2520sitting%2520together%2520in%2520elegant%2520theater%2520seats.%2520View%2520from%2520behind%2520showing%2520stage%2520in%2520distance.%2520Warm%2520lighting%2520atmosphere%2520in%2520luxurious%2520theater%2520interior.%2520Professional%2520theatrical%2520setting&width=400&height=200&seq=offer3&orientation=landscape',
        alt: 'Group Booking Special',
        className: 'offer-image',
      },
      title: 'Group Booking Special',
      description:
        'Bring a group of 10 or more and receive 30% off ticket prices plus complimentary program booklets.',
      validity: 'Valid for all 2025 performances',
      termsId: 'terms3',
      termsText:
        'Minimum 10 tickets required. Booking must be made under one name with single payment. Subject to availability. 14-day advance booking required. Valid for all shows except premieres and special events.',
      button: {
        className: 'offer-button !rounded-button whitespace-nowrap',
        icon: 'ri-team-line',
        text: 'Book Group Tickets',
      },
    },
    {
      id: 'offer4',
      category: 'group',
      badge: '25% OFF',
      image: {
        src: 'https://readdy.ai/api/search-image?query=School%2520group%2520of%2520students%2520with%2520teachers%2520in%2520theater%2520lobby%252C%2520excited%2520expressions%252C%2520holding%2520tickets.%2520Elegant%2520theater%2520interior%2520with%2520grand%2520staircase%2520and%2520ornate%2520decorations.%2520Educational%2520field%2520trip%2520atmosphere.%2520Professional%2520theatrical%2520setting&width=400&height=200&seq=offer4&orientation=landscape',
        alt: 'School Groups',
        className: 'offer-image',
      },
      title: 'School & Educational Groups',
      description:
        'Special 25% discount for school groups with 15+ students. Includes educational materials and optional post-show Q&A.',
      validity: 'Valid for weekday matinees',
      termsId: 'terms4',
      termsText:
        'Valid for educational institutions only. Minimum 15 students plus 2 chaperones (free). Requires school ID or letter. Available for weekday matinees only. Booking required 21 days in advance.',
      button: {
        className: 'offer-button !rounded-button whitespace-nowrap',
        icon: 'ri-school-line',
        text: 'Book School Group',
      },
    },

    // Seasonal Offers
    {
      id: 'offer5',
      category: 'seasonal',
      badge: 'BOGO',
      image: {
        src: 'https://readdy.ai/api/search-image?query=Summer%2520themed%2520theater%2520promotion%2520with%2520bright%2520lighting%2520and%2520festive%2520decorations.%2520Theater%2520marquee%2520with%2520summer%2520festival%2520announcement.%2520Vibrant%2520colors%2520and%2520theatrical%2520atmosphere.%2520Professional%2520Broadway%2520style%2520promotional%2520setting%2520with%2520seasonal%2520elements&width=400&height=200&seq=offer5&orientation=landscape',
        alt: 'Summer Festival',
        className: 'offer-image',
      },
      title: 'Summer Festival: Buy One Get One',
      description:
        'Buy one ticket at regular price and get a second ticket free during our Summer Theater Festival.',
      validity: 'June 15 - August 31, 2025',
      termsId: 'terms5',
      termsText:
        'Valid for Tuesday and Wednesday performances only. Free ticket must be of equal or lesser value. Subject to availability. Cannot be combined with other offers. Blackout dates may apply.',
      button: {
        className: 'offer-button !rounded-button whitespace-nowrap',
        icon: 'ri-coupon-3-line',
        text: 'Redeem Offer',
      },
    },
    {
      id: 'offer6',
      category: 'seasonal',
      badge: '40% OFF',
      image: {
        src: 'https://readdy.ai/api/search-image?query=Holiday%2520season%2520theater%2520decoration%2520with%2520Christmas%2520lights%2520and%2520festive%2520elements.%2520Theater%2520entrance%2520with%2520holiday%2520garlands%2520and%2520ornaments.%2520Warm%2520inviting%2520atmosphere%2520with%2520red%2520and%2520gold%2520decor.%2520Professional%2520theatrical%2520holiday%2520setting&width=400&height=200&seq=offer6&orientation=landscape',
        alt: 'Holiday Special',
        className: 'offer-image',
      },
      title: 'Holiday Season Special',
      description:
        'Celebrate the holidays with 40% off all shows during December. Perfect for family outings and special celebrations.',
      validity: 'December 1-30, 2025',
      termsId: 'terms6',
      termsText:
        'Not valid on December 24-26 and 31. Discount applies to standard and economy seats only. Limited availability. Advance booking recommended. Cannot be combined with other offers.',
      button: {
        className: 'offer-button !rounded-button whitespace-nowrap',
        icon: 'ri-gift-line',
        text: 'Book Holiday Tickets',
      },
    },
  ];

  filteredOffers: any[] = [];

  constructor() {
    // Initialize filteredOffers with all offers
    this.filteredOffers = this.offers;
  }
  selectedCategory: string = 'all'; // default selected

  filterOffers(category: string) {
    this.selectedCategory = category;

    if (category === 'all') {
      this.filteredOffers = this.offers;
    } else {
      this.filteredOffers = this.offers.filter(
        (offer: any) => offer.category === category
      );
    }
  }

  testClick() {
    alert('Clicked!');
  }
}

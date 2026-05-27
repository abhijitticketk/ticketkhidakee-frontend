import { Directive, ElementRef, Input, OnInit } from '@angular/core';

declare var bootstrap: any;

@Directive({
  selector: '[appTooltipHtml]'
})
export class TooltipHtmlDirective implements OnInit {
  @Input('appTooltipHtml') tooltipHtmlContent!: string;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const nativeEl = this.el.nativeElement;
    nativeEl.setAttribute('data-bs-toggle', 'tooltip');
    nativeEl.setAttribute('data-bs-html', 'true');
    nativeEl.setAttribute('data-bs-placement', 'top');
    nativeEl.setAttribute('title', this.tooltipHtmlContent);

    new bootstrap.Tooltip(nativeEl);
  }
}

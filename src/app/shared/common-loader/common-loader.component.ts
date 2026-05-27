import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-common-loader',
  templateUrl: './common-loader.component.html',
  styleUrls: ['./common-loader.component.scss']
})
export class CommonLoaderComponent {
  @Input() isVisible = true;
  visible = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible']) {
      if (this.isVisible) {
        this.visible = true;
      } else {
        // wait till fade-out animation completes (CSS: 0.3s)
        setTimeout(() => {
          this.visible = false;
        }, 300);
      }
    }
  }
}
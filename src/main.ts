import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { enableProdMode } from '@angular/core';
import { environment } from './app/environment';
 


if (environment.production) {
  enableProdMode();
}


platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(() => {
    // Remove loader after Angular is fully bootstrapped
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.remove(); // or loader.style.display = 'none';
    }
  })
  .catch(err => console.error(err));
// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.error(err));

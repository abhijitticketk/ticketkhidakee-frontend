import { Injectable } from '@angular/core';
declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  private clientId = '481485469481-8j25h2n9i2hha0t8k8ibe8eile4qgk4v.apps.googleusercontent.com';

  constructor() {}

  initializeGoogleSignIn(callback: (response: any) => void) {
    google.accounts.id.initialize({
      client_id: this.clientId,
      callback: callback,
    });
  }

  promptGoogleLogin() {
    google.accounts.id.prompt();
  }

  signOut() {
    google.accounts.id.disableAutoSelect();
  }

  getClientId() {
    return this.clientId;
  }
}

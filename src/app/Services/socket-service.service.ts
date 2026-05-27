import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({ providedIn: 'root' })
export class SocketService {
  constructor(private socket: Socket) {}

  sendPing(message: string) {
    this.socket.emit('ping', message);
  }

  getPong() {
    return this.socket.fromEvent<string>('seat-updated');
  }
}

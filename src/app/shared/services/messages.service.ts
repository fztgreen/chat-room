import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  constructor() { }

  postMessage(user: string, message: string): Observable<void> {
    throw new Error('Method not implemented.');
  }
}

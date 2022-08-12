import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { KafkaSendMessage } from '../models/kafka-send-message';
import { SendMessage } from '../models/send-message';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  constructor(private http: HttpClient) { }

  postMessage(user: string, message: string): Observable<void> {
    let expectedRequest = {
      records: [
        {
          key: "",
          value: {
            user: user,
            message: message
          } as SendMessage
        }
      ]
    } as KafkaSendMessage

    let headers = new HttpHeaders();
    headers = headers.append("Content-Type", "application/vnd.kafka.json.v2+json")
    headers = headers.append("Accept", "application/vnd.kafka.v2+json");
    
    return this.http.post("http://localhost:8082/topics/chat1", expectedRequest, {headers: headers}).pipe(
      map(() => {
        return void 0;
      })
    );
  }
}

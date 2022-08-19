import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Random } from 'random-test-values';
import { map, Observable, of } from 'rxjs';
import { KafkaCreateConsumerRequest } from '../models/kafka-create-consumer-request';
import { KafkaSendMessage } from '../models/kafka-send-message';
import { SendMessage } from '../models/send-message';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  constructor(private http: HttpClient) { }

  postMessage(user: string | null, message: string | null): Observable<void> {
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
    headers = headers.append("Content-Type", "application/vnd.kafka.json.v2+json");
    headers = headers.append("Accept", "application/vnd.kafka.v2+json");
    
    console.log(expectedRequest)

    return this.http.post("http://localhost:4200/api/topics/chat1", expectedRequest, {headers: headers}).pipe(
      map(() => {
        return void 0;
      })
    );
  }

  setupConsumer(consumerName: string): Observable<string>
  {
    let request = {
      name: "",
      format: "",
      "auto.offset.reset": "",
    } as KafkaCreateConsumerRequest

    let headers = new HttpHeaders();
    headers = headers.append("Content-Type", "application/vnd.kafka.v2+json");

    return this.http.post(`http://localhost:4200/api/consumers/${consumerName}`, request, {headers: headers}).pipe(
      map(() => {
        return Random.String();
      })
    )
  }

  getNewestMessages()
  {

  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Random } from 'random-test-values';
import { firstValueFrom, map, Observable, switchMap, tap } from 'rxjs';
import { KafkaCreateConsumerRequest } from '../models/kafka-create-consumer-request';
import { KafkaEstablishTopicRequest } from '../models/kafka-establish-topic-request';
import { KafkaKeyValue } from '../models/kafka-key-value';
import { KafkaRetrieveMessage } from '../models/kafka-retrieve-message';
import { KafkaSendMessage } from '../models/kafka-send-message';
import { Message } from '../models/message';
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
        } as KafkaKeyValue
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

  async setupConsumer(): Promise<string>
  {
    var consumerName = Random.String();
    let request = {
      name: consumerName,
      format: "json",
      "auto.offset.reset": "earliest",
    } as KafkaCreateConsumerRequest

    let establishTopicRequest = {
      topics: ["chat1"]
    } as KafkaEstablishTopicRequest;

    let headers = new HttpHeaders();
    headers = headers.append("Content-Type", "application/vnd.kafka.v2+json");

    let createConsumerResponse = this.http.post(`http://localhost:4200/api/consumers/${consumerName}`, request, {headers: headers});
    let establishTopicResponse = this.http.post(`http://localhost:4200/api/consumers/${consumerName}/instances/${consumerName}/subscription`, establishTopicRequest, {headers: headers});
    
    await firstValueFrom(createConsumerResponse.pipe(
      switchMap(() => establishTopicResponse)
    ))

    return consumerName;
  }

  getNewestMessages(consumerInstance: string): Observable<Message[]>
  {
    let requestHeaders = new HttpHeaders().append("Accept", "application/vnd.kafka.json.v2+json");
    let requestUrl = `http://localhost:4200/api/consumers/${consumerInstance}/instances/${consumerInstance}/records`
    var request = this.http.get(requestUrl, {headers: requestHeaders});

    return request.pipe(tap(result => console.log(result)),
     map(result => (result as [KafkaRetrieveMessage])
      .map<Message>(message => ({
          user: (message.value).user,
          message: (message.value).message
        }) as Message)
      )
    );
  }
}

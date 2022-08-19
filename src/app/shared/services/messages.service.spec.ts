import { HttpHeaders } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Random } from 'random-test-values';
import { KafkaCreateConsumerRequest } from '../models/kafka-create-consumer-request';
import { KafkaSendMessage } from '../models/kafka-send-message';
import { SendMessage } from '../models/send-message';
import { map } from 'rxjs';

import { MessagesService } from './messages.service';

describe('MessagesService', () => {
  let service: MessagesService;
  let httpTestController: HttpTestingController;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MessagesService
      ]
    });

    service = TestBed.inject(MessagesService);
    httpTestController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when postMessage is called', () => {
    it('calls http client with expected format', () => {
      let user = Random.String();
      let message = Random.String();
      let response = service.postMessage(user, message).subscribe();

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
      } as KafkaSendMessage;

      let expectedHeaders = new HttpHeaders();
      expectedHeaders = expectedHeaders.append("Content-Type", "application/vnd.kafka.json.v2+json")
      expectedHeaders = expectedHeaders.append("Accept", "application/vnd.kafka.v2+json");

      const req = httpTestController.expectOne("http://localhost:4200/api/topics/chat1");

      expect(req.request.headers).toEqual(expectedHeaders);
      expect(req.request.body).toEqual(expectedRequest);
      expect(req.request.method).toEqual("POST");
      httpTestController.verify();
    });
  });

  describe('when setupConsumer is called', () => {
    it('calls http client to create a kafka consumer on the proxy server', () => {
      let expectedRequest = {
        name: "",
        format: "json",
        "auto.offset.reset": "earliest",
      } as KafkaCreateConsumerRequest

      let expectedHeaders = new HttpHeaders();
      expectedHeaders = expectedHeaders.append("Content-Type", "application/vnd.kafka.v2+json");

      let response = service.setupConsumer().subscribe();
      var requestUrl = "http://localhost:4200/api/consumers/kafka_chat_consumer";
      const req = httpTestController.expectOne(requestUrl);

      expect(req.request.headers).toEqual(expectedHeaders);
      expect((req.request.body as KafkaCreateConsumerRequest).name).toBeTruthy();
      expect((req.request.body as KafkaCreateConsumerRequest).format).toEqual(expectedRequest.format);
      expect((req.request.body as KafkaCreateConsumerRequest)["auto.offset.reset"]).toEqual(expectedRequest["auto.offset.reset"]);
      expect(req.request.method).toEqual("POST");
      httpTestController.verify();
    });

    it('returns the name of the created consumer', () => {
      let a = "";
      let response = service.setupConsumer().subscribe({
        next: p => {
          expect(p).toBe(a);
        }
      });

      const req = httpTestController.expectOne(() => true);
      
      a = (req.request.body as KafkaCreateConsumerRequest).name;
      req.flush(a);
      httpTestController.verify();
    })
  });
});

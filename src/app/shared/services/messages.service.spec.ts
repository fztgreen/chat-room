import { HttpHeaders } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Random } from 'random-test-values';
import { KafkaCreateConsumerRequest } from '../models/kafka-create-consumer-request';
import { KafkaEstablishTopicRequest } from '../models/kafka-establish-topic-request';
import { KafkaRetrieveMessage } from '../models/kafka-retrieve-message';
import { KafkaSendMessage } from '../models/kafka-send-message';
import { Message } from '../models/message';
import { SendMessage } from '../models/send-message';
import { MessagesService } from './messages.service';
import { KafkaKeyValue } from '../models/kafka-key-value';

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

      let response = service.setupConsumer();
      const req = httpTestController.match(() => true)[0];

      expect(req.request.headers).toEqual(expectedHeaders);
      expect((req.request.body as KafkaCreateConsumerRequest).name).toBeTruthy();
      expect((req.request.body as KafkaCreateConsumerRequest).format).toEqual(expectedRequest.format);
      expect((req.request.body as KafkaCreateConsumerRequest)["auto.offset.reset"]).toEqual(expectedRequest["auto.offset.reset"]);
      expect(req.request.method).toEqual("POST");

      httpTestController.match(x => x.url != "").forEach(r => r.flush("any"));
      httpTestController.verify();
    });

    it('returns the name of the created consumer', () => {
      let a = "";
      let response = service.setupConsumer();

      const req = httpTestController.match(() => true)[0];
      
      a = (req.request.body as KafkaCreateConsumerRequest).name;
      req.flush(a);

      httpTestController.match(x => x.url != "").forEach(r => r.flush("any"));

      httpTestController.verify();

      response.then((value) => {
        expect(value).toBe(a);
        expect(req.request.url).toEqual(`http://localhost:4200/api/consumers/${value}`);
      });
    })  

    it('should establish a connection to the given topic', async () => {
      let expectedRequest = {
        topics: ["chat1"]
      } as KafkaEstablishTopicRequest;

      let response = service.setupConsumer();

      const req1 = httpTestController.match(() => true)[0];
      req1.flush("random");

      let expectedConsumerName = (req1.request.body as KafkaCreateConsumerRequest).name;
      let expectedRequestUrl = `http://localhost:4200/api/consumers/${expectedConsumerName}/instances/${expectedConsumerName}/subscription`;
      const req2 = httpTestController.match(expectedRequestUrl)[0];
      req2.flush("random");

      await response;

      expect(req2.request.body).toEqual(expectedRequest);

      httpTestController.verify();
    })
  });

  describe('When getNewestMessages is called', () => {
    it('Retrieves the newest messages from kafka', async () => {
      // curl -X GET -H "Accept: application/vnd.kafka.json.v2+json" 
      //http://localhost:8082/consumers/my_json_consumer/instances/my_consumer_instance/records
      let consumerInstance = Random.String();
      let expectedRequestUrl = `http://localhost:4200/api/consumers/${consumerInstance}/instances/${consumerInstance}/records`
      
      var expectedMessages = [
        {
          key: "key",
          value: {user: "steve", message: "message1"} as SendMessage,
          partition: 0,
          offset: 0,
          topic: "chat1"
        } as KafkaRetrieveMessage,
        {
          key: "key",
          value: {user: "shelby", message: "message2"} as SendMessage,
          partition: 0,
          offset: 0,
          topic: "chat1"
        } as KafkaRetrieveMessage
      ] as KafkaRetrieveMessage[];

      var expectedFriendlyMessages = [
        {
          user: (expectedMessages[0].value).user,
          message: (expectedMessages[0].value).message
        } as Message,
        {
          user: (expectedMessages[1].value).user,
          message: (expectedMessages[1].value).message
        } as Message
      ] as Message[];

      var actualMessages = service.getNewestMessages(consumerInstance).subscribe({
        next: p => expect(p).toEqual(expectedFriendlyMessages)
      });

      let expectedHeaders = new HttpHeaders();
      expectedHeaders = expectedHeaders.append("Accept", "application/vnd.kafka.json.v2+json");

      let actualRequest = httpTestController.match(() => true)[0];
      expect(actualRequest?.request?.method).toBe('GET');
      expect(actualRequest?.request?.headers).toEqual(expectedHeaders);
      expect(actualRequest?.request?.url).toBe(expectedRequestUrl);
      actualRequest.flush(expectedMessages);

      httpTestController.verify();
    });
  });
});

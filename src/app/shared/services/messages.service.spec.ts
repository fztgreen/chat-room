import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Random } from 'random-test-values';
import { KafkaSendMessage } from '../models/kafka-send-message';
import { SendMessage } from '../models/send-message';

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
      } as KafkaSendMessage


      const req = httpTestController.expectOne("http://localhost:8082/topics/chat1");
      expect(req.request.body).toEqual(expectedRequest);
      expect(req.request.method).toEqual("POST");
      httpTestController.verify();
    })
  })
});

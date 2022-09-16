import { ComponentFixture, discardPeriodicTasks, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { Random } from 'random-test-values';
import { MessagesService } from '../shared/services/messages.service';
import { ChatWindowComponent } from './chat-window.component';
import { firstValueFrom, interval, of, tap } from 'rxjs'
import { SendMessage } from '../shared/models/send-message';
import { KafkaKeyValue } from '../shared/models/kafka-key-value';
import { KafkaRetrieveMessage } from '../shared/models/kafka-retrieve-message';

describe('ChatWindowComponent', () => {
  let component: ChatWindowComponent;
  let fixture: ComponentFixture<ChatWindowComponent>;
  let messagesServiceSpy: jasmine.SpyObj<MessagesService>;

  beforeEach(async () => {
    messagesServiceSpy = jasmine.createSpyObj(MessagesService.name, ["postMessage", "setupConsumer", "getNewestMessages"]);
    messagesServiceSpy.postMessage.and.returnValue(of(void 0));
    
    await TestBed.configureTestingModule({
      declarations: [ ChatWindowComponent ],
      providers: [
        { provide: MessagesService, useValue: messagesServiceSpy}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.messageLog).toEqual([]);
  });

  describe("ngOnInit", () => {
    it('should setup the kafka consumer', async () => {
      let expectedConsumerInstance = Random.String();
      messagesServiceSpy.setupConsumer.and.returnValue(firstValueFrom(of(expectedConsumerInstance)));

      await component.ngOnInit();

      expect(component.consumerInstance).toBe(expectedConsumerInstance);
    });

    it('should set up a repeated call to getNewestMessages', fakeAsync(async () => {
      messagesServiceSpy.getNewestMessages.and.returnValue(of([]))
      await component.ngOnInit();

      let offset = Random.Number({max: 4999})
      tick(5000 - offset);

      expect(messagesServiceSpy.getNewestMessages).not.toHaveBeenCalled();

      tick(offset);

      expect(messagesServiceSpy.getNewestMessages).toHaveBeenCalled();

      discardPeriodicTasks()
    }));
  });

  describe("sendText", () => {
    it('should send a message', () => {
      component.textMessageFormControl.setValue(Random.String());
      component.nameFormControl.setValue(Random.String());
      let result = component.sendText();

      expect(messagesServiceSpy.postMessage).toHaveBeenCalledOnceWith(component.nameFormControl.value, component.textMessageFormControl.value);
    });
  });

  describe("getNewestMessages", () => {
    it('should populate new messages on the form', () => {
      var expectedMessages = [
        {
          key: "key",
          value: {key: "key", value: {user: "steve", message: "message1"} as SendMessage} as KafkaKeyValue,
          partition: 0,
          offset: 0,
          topic: "chat1"
        } as KafkaRetrieveMessage,
        {
          key: "key",
          value: {key: "key", value: {user: "shelby", message: "message2"} as SendMessage} as KafkaKeyValue,
          partition: 0,
          offset: 0,
          topic: "chat1"
        } as KafkaRetrieveMessage
      ]

      component.consumerInstance = Random.String();

      messagesServiceSpy.getNewestMessages.and.returnValue(of(expectedMessages));

      component.getNewestMessages();

      expect(messagesServiceSpy.getNewestMessages).toHaveBeenCalledOnceWith(component.consumerInstance);
      expect(component.messageLog).toEqual(expectedMessages);
    });

    it('should append new messages on the form', () => {
      var existingMessages = [
        {
          key: "key",
          value: {key: "key", value: {user: "steve", message: "message1"} as SendMessage} as KafkaKeyValue,
          partition: 0,
          offset: 0,
          topic: "chat1"
        } as KafkaRetrieveMessage
      ]

      var expectedMessages = [
        {
          key: "key",
          value: {key: "key", value: {user: "shelby", message: "message2"} as SendMessage} as KafkaKeyValue,
          partition: 0,
          offset: 0,
          topic: "chat1"
        } as KafkaRetrieveMessage
      ]

      component.consumerInstance = Random.String();
      component.messageLog = existingMessages;

      messagesServiceSpy.getNewestMessages.and.returnValue(of(expectedMessages));

      component.getNewestMessages();

      expect(messagesServiceSpy.getNewestMessages).toHaveBeenCalledOnceWith(component.consumerInstance);
      expect(component.messageLog).toEqual(existingMessages.concat(expectedMessages));
    });
  });
});

import { ComponentFixture, discardPeriodicTasks, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { Random } from 'random-test-values';
import { MessagesService } from '../shared/services/messages.service';
import { ChatWindowComponent } from './chat-window.component';
import { firstValueFrom, interval, of, tap } from 'rxjs'
import { Message } from '../shared/models/message';

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

  it('should create', async () => {
    await component.ngOnInit();
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

      expect(component.chatMessageSubscription.closed).toBeFalse();

      let offset = Random.Number({max: 4999})
      tick(5000 - offset);

      expect(messagesServiceSpy.getNewestMessages).not.toHaveBeenCalled();

      tick(offset);

      expect(messagesServiceSpy.getNewestMessages).toHaveBeenCalled();

      discardPeriodicTasks()
    }));
  });

  describe("ngOnDestroy", () => {
    it('should remove the subscription to the getNewestMessages', async () => {
      await component.ngOnInit();

      expect(component.chatMessageSubscription.closed).toBeFalse();
      component.ngOnDestroy();

      expect(component.chatMessageSubscription.closed).toBeTrue();
    });
  })

  describe("methods on the chat window", () => {
    beforeEach(async () => {
      await component.ngOnInit();
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
          {user: "steve", message: "message1"} as Message,
          {user: "shelby", message: "message2"} as Message
        ];
  
        component.consumerInstance = Random.String();
  
        messagesServiceSpy.getNewestMessages.and.returnValue(of(expectedMessages));
  
        component.getNewestMessages();
  
        expect(messagesServiceSpy.getNewestMessages).toHaveBeenCalledOnceWith(component.consumerInstance);
        expect(component.messageLog).toEqual(expectedMessages);
      });
  
      it('should append new messages on the form', () => {
        var existingMessages = [
          {user: "steve", message: "message1"} as Message
        ];
  
        var expectedMessages = [
          {user: "shelby", message: "message2"} as Message
        ];
  
        component.consumerInstance = Random.String();
        component.messageLog = existingMessages;
  
        messagesServiceSpy.getNewestMessages.and.returnValue(of(expectedMessages));
  
        component.getNewestMessages();
  
        expect(messagesServiceSpy.getNewestMessages).toHaveBeenCalledOnceWith(component.consumerInstance);
        expect(component.messageLog).toEqual(existingMessages.concat(expectedMessages));
      });
    });

    describe("getMessages", () => {
      it('should return a user friendly view of the chat history', () => {
        component.messageLog = [
          {user: "steve", message: "message1"} as Message,
          {user: "shelby", message: "message2"} as Message
        ];

        expect(component.getMessages()).toEqual(JSON.stringify(component.messageLog));
      })
    });
  })
});

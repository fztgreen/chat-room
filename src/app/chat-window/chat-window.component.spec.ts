import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Random } from 'random-test-values';
import { MessagesService } from '../shared/services/messages.service';
import { ChatWindowComponent } from './chat-window.component';
import { firstValueFrom, of } from 'rxjs'

describe('ChatWindowComponent', () => {
  let component: ChatWindowComponent;
  let fixture: ComponentFixture<ChatWindowComponent>;
  let messagesServiceSpy: jasmine.SpyObj<MessagesService>;

  beforeEach(async () => {
    messagesServiceSpy = jasmine.createSpyObj(MessagesService.name, ["postMessage", "setupConsumer"]);
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
  });

  describe("ngOnInit", () => {
    it('should setup the kafka consumer', async () => {
      let expectedConsumerInstance = Random.String();
      messagesServiceSpy.setupConsumer.and.returnValue(firstValueFrom(of(expectedConsumerInstance)));

      await component.ngOnInit();

      expect(component.consumerInstance).toBe(expectedConsumerInstance);
    });
  });

  describe("sendText", () => {
    it('should send a message', () => {
      component.textMessageFormControl.setValue(Random.String());
      component.nameFormControl.setValue(Random.String());
      let result = component.sendText();

      expect(messagesServiceSpy.postMessage).toHaveBeenCalledOnceWith(component.nameFormControl.value, component.textMessageFormControl.value);
    });
  });
});

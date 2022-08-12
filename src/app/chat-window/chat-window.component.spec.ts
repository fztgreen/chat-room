import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Random } from 'random-test-values';
import { MessagesService } from '../shared/services/messages.service';
import { ChatWindowComponent } from './chat-window.component';
import { of } from 'rxjs'

describe('ChatWindowComponent', () => {
  let component: ChatWindowComponent;
  let fixture: ComponentFixture<ChatWindowComponent>;
  let messagesServiceSpy: jasmine.SpyObj<MessagesService>;

  beforeEach(async () => {
    messagesServiceSpy = jasmine.createSpyObj(MessagesService.name, ["postMessage"]);
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

  describe("sendText", () => {
    it('should send a message', () => {
      component.textMessageFormControl.setValue(Random.String());
      component.userFormControl.setValue(Random.String());
      let result = component.sendText();

      expect(messagesServiceSpy.postMessage).toHaveBeenCalledOnceWith(component.userFormControl.value, component.textMessageFormControl.value);
    });
  });
});

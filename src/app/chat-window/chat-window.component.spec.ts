import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Random } from 'random-test-values';
import { MessagesService } from '../shared/services/messages.service';

import { ChatWindowComponent } from './chat-window.component';

describe('ChatWindowComponent', () => {
  let component: ChatWindowComponent;
  let fixture: ComponentFixture<ChatWindowComponent>;
  let messagesServiceSpy: jasmine.SpyObj<MessagesService>;

  beforeEach(async () => {
    messagesServiceSpy = jasmine.createSpyObj(MessagesService.name, ["postMessage"]);

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
      let text = Random.String();
      component.user = Random.String();
      let result = component.sendText(text);

      expect(messagesServiceSpy.postMessage).toHaveBeenCalledOnceWith(component.user, text);
    });
  });
});

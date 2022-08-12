import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MessagesService } from '../shared/services/messages.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {
  
  userFormControl = new UntypedFormControl('');
  textMessageFormControl = new UntypedFormControl('');

  constructor(private messagesService: MessagesService) { }

  ngOnInit(): void {
  }

  sendText(): void {
    this.messagesService.postMessage(this.userFormControl.value, this.textMessageFormControl.value).subscribe();
  }  
}

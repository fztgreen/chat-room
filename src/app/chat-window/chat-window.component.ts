import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MessagesService } from '../shared/services/messages.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {
  
  nameFormControl = new FormControl('');
  textMessageFormControl = new FormControl('');

  constructor(private messagesService: MessagesService) { }

  ngOnInit(): void {
  }

  sendText(): void {
    debugger;

    this.messagesService.postMessage(this.nameFormControl.value, this.textMessageFormControl.value).subscribe();
  }  
}

import { Component, OnInit } from '@angular/core';
import { MessagesService } from '../shared/services/messages.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {
  User!: string;
  
  constructor(private messagesService: MessagesService) { }

  ngOnInit(): void {
  }

  sendText(text: string) {
    this.messagesService.postMessage("", text);
  }  
}

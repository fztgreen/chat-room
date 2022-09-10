import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MessagesService } from '../shared/services/messages.service';
import { tap } from 'rxjs';
import { KafkaRetrieveMessage } from '../shared/models/kafka-retrieve-message';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {
  
  consumerInstance!: string;
  messageLog: KafkaRetrieveMessage[] = [];
  nameFormControl = new FormControl('');
  textMessageFormControl = new FormControl('');
  
  constructor(private messagesService: MessagesService) { }

  async ngOnInit(): Promise<void> {
    this.consumerInstance = await this.messagesService.setupConsumer();
  }

  sendText(): void {
    this.messagesService.postMessage(this.nameFormControl.value, this.textMessageFormControl.value).subscribe();
  }

  getNewestMessages(): void {
    this.messagesService.getNewestMessages(this.consumerInstance).subscribe(
      {
        next: result => this.messageLog = this.messageLog.concat(result) 
      }
    );
  }

  getMessages(): string {
    return JSON.stringify(this.messageLog);
  }
}

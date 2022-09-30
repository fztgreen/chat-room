import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MessagesService } from '../shared/services/messages.service';
import { interval, Observable, Subscription, tap, catchError } from 'rxjs';
import { Message } from '../shared/models/message';
import { Random } from 'random-test-values';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  
  consumerInstance!: string;
  messageLog: Message[] = [];
  nameFormControl = new FormControl("User-" + Random.String({minLength: 8, maxLength: 8}));
  textMessageFormControl = new FormControl('');
  chatMessageSubscription!: Subscription;
  
  constructor(private messagesService: MessagesService) { }
  
  async ngOnInit(): Promise<void> {
    this.consumerInstance = await this.messagesService.setupConsumer();
    this.chatMessageSubscription = interval(5000).pipe(tap(() => this.getNewestMessages())).subscribe();
  }

  ngOnDestroy(): void {
    this.chatMessageSubscription.unsubscribe();
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

  getMessages(): Message[] {
    return this.messageLog;
  }
}

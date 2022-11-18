import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { AnonymousSubject, Subject } from "rxjs/internal/Subject";
import { Observer } from "rxjs/internal/types";
import { map } from 'rxjs/operators';
import { Message } from "../models/message";

const CHAT_URL = "wss://localhost:7284/ws";

@Injectable({
    providedIn: 'root'
  })
export class WebsocketService {
    private subject: AnonymousSubject<MessageEvent> | undefined;
    public messages: Subject<Message>;

    constructor() {
        this.messages = <Subject<Message>>this.connect(CHAT_URL).pipe(
            map(
                (response: MessageEvent): Message => {
                    console.log("yo");
                    console.log(response.data);
                    let data = JSON.parse(response.data)
                    return data;
                }
            )
        );
    }

    public connect(url: string): AnonymousSubject<MessageEvent> {
        if (!this.subject) {
            this.subject = this.create(url);
            console.log("Successfully connected: " + url);
        }
        return this.subject;
    }

    private create(url: string): AnonymousSubject<MessageEvent> {
        let ws = new WebSocket(url);


        
        let observable = new Observable((obs: Observer<MessageEvent>) => {
            ws.onmessage = obs.next.bind(obs);
            ws.onerror = obs.error.bind(obs);
            ws.onclose = obs.complete.bind(obs);
            return ws.close.bind(ws);
        });
        let observer: Observer<MessageEvent<any>> = {
            next: (data: Object) => {
                console.log('Message sent to websocket: ', data);
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(data));
                }
            },
            error: function (err: any): void {
            },
            complete: function (): void {
            }
        };
        return new AnonymousSubject<MessageEvent>(observer, observable);
    }
}
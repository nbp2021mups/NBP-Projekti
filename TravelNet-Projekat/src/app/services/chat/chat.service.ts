import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { SocketService } from '../socket/socket.service';
import {map} from "rxjs/operators";
import { Message } from 'src/app/models/message-model/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  messages: Subject<Message>;

  constructor(private socketService:SocketService) 
  {
    this.messages = <Subject<Message>>this.socketService
    .connect()
    .pipe(map((response: any): Message =>{return response;}));
  }

  sendMsg(msg: Message){
    this.messages.next(msg);
  }
}

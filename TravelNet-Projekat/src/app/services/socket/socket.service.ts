import { Injectable } from '@angular/core';
import * as io from "socket.io/client-dist/socket.io";
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket;
  private readonly url : String = "ws://localhost:5050";

  constructor() { }

  connect(): Subject<MessageEvent>{
    this.socket = io(this.url);

    let observable = new Observable(observer=>{
      this.socket.on("message", data =>{
        console.log("Received a message!");
        observer.next(data);
      });

      return ()=>{
        this.socket.disconnect();
      };

    });

    let observer = {
      next: (data:Object)=>{
        this.socket.emit("message", JSON.stringify(data));
      }
    }

    return Subject.create(observer, observable);
  }
}

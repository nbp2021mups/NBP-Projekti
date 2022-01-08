import { Message } from '../message-model/message.model';

export class Conversation {
  public id: number;
  public user1: String;
  public user2: String;
  public topMessage: Message;
  public messages: Array<Message>;

  public constructor(id: number, user1: string, user2: string) {
    this.id = id;
    this.user1 = user1;
    this.user2 = user2;
    this.topMessage = new Message(
      0,
      '',
      '',
      'Text',
      'New conversation',
      new Date(),
      null
    );
    this.messages = new Array<Message>();
    this.messages = [this.topMessage, ...this.messages];
  }
}

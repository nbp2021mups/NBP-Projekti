import { Message } from '../message-model/message.model';

export class Conversation {
  public id: number;
  public user1: string;
  public user2: string;
  public topMessage: Message;
  public messages: Array<Message>;

  public constructor(id: number, user1: string, user2: string) {
    this.id = id;
    this.user1 = user1;
    this.user2 = user2;
    this.messages = new Array<Message>();
    this.messages = [
      new Message(1, user1, user2, 'Eeeeej ćao', new Date(), new Date()),
      ...this.messages,
    ];
    this.messages = [
      new Message(2, user2, user1, 'Ćaos ćaos', new Date(), new Date()),
      ...this.messages,
    ];
    this.messages = [
      new Message(3, user2, user1, 'Šta ima?', new Date(), new Date()),
      ...this.messages,
    ];
    this.messages = [
      new Message(4, user1, user2, 'Evo jebavam se', new Date(), null),
      ...this.messages,
    ];
    this.topMessage = this.messages[0];
  }
}

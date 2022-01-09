import { Message } from '../message-model/message.model';

export class Conversation {
  public id: number;
  public messages: Array<Message>;
  public topMessage: Message;
  public myUnread: number;
  public friend: string;
  public friendImage: string;

  public constructor(
    id: number,
    friend: string,
    friendImage: string,
    myUnread: number,
    messages: Array<Message> = new Array<Message>()
  ) {
    this.id = id;
    this.friend = friend;
    this.friendImage = friendImage;
    this.messages = messages;
    this.myUnread = myUnread;
    this.topMessage = this.messages.length > 0 ? this.messages[0] : null;
  }
}

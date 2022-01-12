export interface MessageReadReceipt {
  chatId: number;
  from: string;
  unreadCount: number;
}

export class Message {
  public id!: number;
  public from: string;
  public to: string;
  public chatId: number;
  public content: string;
  public timeSent: Date;
  public read: boolean;

  constructor(
    id: number,
    from: string,
    to: string,
    chatId: number,
    content: string,
    timeSent: Date,
    read: boolean = false
  ) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.chatId = chatId;
    this.content = content;
    this.timeSent = timeSent;
    this.read = read;
  }
}

export class Message {
  public id!: number;
  public from: string;
  public to: string;
  public content: string;
  public timeSent: Date;
  public timeRead: Date;

  constructor(
    id: number,
    from: string,
    to: string,
    content: string,
    timeSent: Date,
    timeRead: Date
  ) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.content = content;
    this.timeSent = timeSent;
    this.timeRead = timeRead;
  }
}

export class Notification {
  public id!: number;
  public to: string;
  public from: string;
  public type: string;
  public content: string;
  public timeSent: Date;
  public read: boolean;

  constructor(
    id: number,
    to: string,
    from: string,
    type: string,
    content: string,
    timeSent: Date,
    read: boolean
  ) {
    this.id = id;
    this.to = to;
    this.from = from;
    this.type = type;
    this.content = content;
    this.timeSent = timeSent;
    this.read = read;
  }
}

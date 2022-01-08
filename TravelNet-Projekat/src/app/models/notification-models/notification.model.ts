export class Notification {
  public id!: Number;
  public to: String;
  public type: String;
  public content: String;
  public timeSent: Date;
  public read: boolean;

  constructor(
    id: Number,
    to: String,
    type: String,
    content: String,
    timeSent: Date,
    read: boolean
  ) {
    this.id = id;
    this.to = to;
    this.type = type;
    this.content = content;
    this.timeSent = timeSent;
    this.read = read;
  }
}

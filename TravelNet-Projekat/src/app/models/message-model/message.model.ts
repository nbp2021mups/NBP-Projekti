export class Message {
  public id!: Number;
  public from: String;
  public to: String;
  public contentType: String;
  public content: String;
  public timeSent: Date;
  public timeRead: Date;

  constructor(
    id: Number,
    from: String,
    to: String,
    contentType: String,
    content: String,
    timeSent: Date,
    timeRead: Date
  ) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.contentType = contentType;
    this.content = content;
    this.timeSent = timeSent;
    this.timeRead = timeRead;
  }
}

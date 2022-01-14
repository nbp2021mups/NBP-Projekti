export class Comment {
  public id: number;
  public from: string;
  public comment: string;
  public time: Date;

  public constructor(
    id: number,
    fromUser: string,
    comment: string,
    time: Date
  ) {
    this.id = id;
    this.from = fromUser;
    this.comment = comment;
    this.time = time;
  }
}

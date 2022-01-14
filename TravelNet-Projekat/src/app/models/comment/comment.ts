export class Comment {
  public id: number;
  public from: string;
  public time: Date;
  public comment: string;

  public constructor(id: number, from: string, comment: string, time: Date) {
    this.id = id;
    this.from = from;
    this.comment = comment;
    this.time = time;
  }
}

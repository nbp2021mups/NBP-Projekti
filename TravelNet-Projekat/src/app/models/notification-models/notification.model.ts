export const NOTIFICATION_TRANSLATION = {
  'post-like': 'se sviđa Vaša objava!',
  'post-comment': 'komentariše Vašu objavu!',
  'sent-friend-request': 'šalje zahtev za prijateljstvo!',
  'accepted-friend-request': 'i Vi ste postali prijatelji!',
  'new-post-on-location': 'ima novu objavu!'
};

export enum NOTIFICATION_TRIGGERS {
  LIKE = 'post-like',
  COMMENT = 'post-comment',
  SEND_FRIEND_REQUEST = 'send-friend-request',
  SENT_FRIEND_REQUEST = 'sent-friend-request',
  ACCEPT_FRIEND_REQUEST = 'accept-friend-request',
  ACCEPTED_FRIEND_REQUEST = 'accepted-friend-request',
}

export class Notification {
  public id!: number;
  public to: string;
  public from: string;
  public type: NOTIFICATION_TRIGGERS;
  public content: string;
  public timeSent: Date;
  public read: boolean;

  constructor(
    id: number,
    to: string,
    from: string,
    type: NOTIFICATION_TRIGGERS,
    content: string,
    timeSent: Date = new Date(),
    read: boolean = false
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

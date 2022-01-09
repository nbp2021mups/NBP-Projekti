export class FullUser {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public image!: string;
  public bio!: string;
  public joined!: Date;
  public friendsNo!: number;
  public followedLocationsNo!: number;
  public postsNo!: number;

  constructor(
    id: number = null,
    username: string = null,
    firstName: string = null,
    lastName: string = null,
    image: string = null,
    bio: string = null,
    joined: Date = null,
    friendsNo: number = null,
    followedLocationsNo: number = null,
    postsNo: number = null
  ) {
    this.id = id;
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
    this.image = image;
    this.bio = bio;
    this.joined = joined;
    this.friendsNo = friendsNo;
    this.followedLocationsNo = followedLocationsNo;
    this.postsNo = postsNo;
  }
}

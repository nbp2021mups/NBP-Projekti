import { PersonBasic } from './person-basic.model';

export enum ProfileType {
  personal = 1,
  friend = 2,
  non_friend = 3,
  sent_req = 4,
  rec_req = 5,
}

export class PersonExplore extends PersonBasic {
  public status: ProfileType;
  public friendsNo: number;
  public postsNo: number;
  public followedLocationsNo: number;

  constructor(
    id: number,
    firstName: string,
    lastName: string,
    img: string,
    username: string,
    friendsNo: number,
    postsNo: number,
    followedLocationsNo: number,
    status: ProfileType
  ) {
    super(id, firstName, lastName, img, username);
    this.status = status;
    this.friendsNo = friendsNo;
    this.postsNo = postsNo;
    this.followedLocationsNo = followedLocationsNo;
  }
}

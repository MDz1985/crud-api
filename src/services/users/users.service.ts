import { v4 } from 'uuid';

export class UsersService {
  static instance: UsersService;
  private readonly _uuid = v4;
  constructor() {
    return UsersService.instance ?? (UsersService.instance = this);
  }
  public getUsersRequest(id?: string) {
    id ? this.getUserById(id) : this.getAllUsers()
  }

  public createUserRequest() {
    console.log('user created with id ' + this.genetateId())
  }

  public updateUserRequest(id: string) {
    console.log('update user: ' + id)
  }

  public deleteUserRequest(id: string) {
    console.log('delete user: ' + id)
  }

  private getUserById(id:string) {
    console.log('information about user: ' + id)
  }
  private getAllUsers() {
    console.log('information about all users')
  }

  private genetateId() {
    return this._uuid()
  }
}

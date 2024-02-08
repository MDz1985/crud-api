import { v4 } from 'uuid';
import { IUser } from '../../../src/models/users/user';
import path from 'node:path';
import { writeFile } from 'node:fs/promises';

const UsersDataPath = path.join('src', 'server', 'data', 'users.json');

export class UsersService {
  static instance: UsersService;
  private readonly _uuid = v4;

  constructor() {
    return UsersService.instance ?? (UsersService.instance = this);
  }

  public getUsersRequest(id?: string) {
    return id ? this.getUserById(id) : this.getAllUsers();
  }

  public async createUserRequest(user: IUser) {
    if (!this.checkUser(user)) throw new Error('user was not created1');
    user.id = this.genetateId();
    const users = await this.getUsersFromServer();
    users.push(user);
    try {
      await writeFile(UsersDataPath, JSON.stringify(users));
    } catch (err) {
      throw new Error('user was not created');
    }
    return JSON.stringify(user);
  }

  public async updateUserRequest(id: string) {
    console.log('update user: ' + id);
  }

  public async deleteUserRequest(userId: string) {
    const users: IUser[] = await this.getUsersFromServer();
    const user: IUser | undefined = users.find(({ id }) => userId === id);
    const result: IUser[] = users.filter(({id}) => id !== userId);
    if (!user) throw new Error('user was not removed1');
    try {
      await writeFile(UsersDataPath, JSON.stringify(result));
    } catch {
      throw new Error('user was not deleted');
    }
    return JSON.stringify(user);
  }

  private async getUserById(userId: string) {
    const users: IUser[] = await this.getUsersFromServer();
    const user = users.find(({ id }) => userId === id);
    // todo: create enum for errors
    if (!user) throw new Error('there is no user with this id');
    return JSON.stringify(user);
  }

  private async getAllUsers(): Promise<string> {
    const users: IUser[] = await this.getUsersFromServer();
    return JSON.stringify(users);
  }

  private genetateId() {
    return this._uuid();
  }

  private async getUsersFromServer(): Promise<IUser[]> {
    return (await import('../../server/data/users.json')).default;
  }

  checkUser(user: IUser) {
    let result = typeof user.username === 'string' && Array.isArray(user.hobbies) && typeof user.age === 'number';
    if (result && user.hobbies.length) {
      result = user.hobbies.every((el) => typeof el === 'string');
    }
    return result;
  }
}

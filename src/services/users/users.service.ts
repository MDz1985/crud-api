import { v4, validate } from 'uuid';
import { IUser } from '../../../src/models/users/user.ts';
import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { ERRORS } from '../../models/server/enums/errors.ts';

const UsersDataPath = path.join('src', 'server', 'data', 'users.json');

export class UsersService {
  static instance: UsersService;
  private readonly _uuid = v4;
  private readonly _validateUuid = validate;

  constructor() {
    return UsersService.instance ?? (UsersService.instance = this);
  }

  public getUsersRequest(id?: string) {
    return id ? this.getUserById(id) : this.getAllUsers();
  }

  public async createUserRequest(user: IUser) {
    try {
      if (!this.checkUser(user)) throw new Error(ERRORS.INCOMPLETE_OR_WRONG_TYPE);
      user.id = this.generateId();
      const users = await this.getUsersFromServer();
      users.push(user);
      await writeFile(UsersDataPath, JSON.stringify(users));
      return JSON.stringify(user);
    } catch (e) {
      throw new Error(this.getErrorMessage(e));
    }
  }

  public async updateUserRequest(user: IUser) {
    try {
      this.validateId(user.id);
      const users: IUser[] = await this.getUsersFromServer();
      const result: IUser[] = users.filter(({ id }) => id !== user.id);
      if (users.length === result.length) throw new Error(ERRORS.NOT_EXIST);
      result.push(user);
      await writeFile(UsersDataPath, JSON.stringify(result));
      return JSON.stringify(user);
    } catch (e) {
      throw new Error(this.getErrorMessage(e));
    }
  }

  public async deleteUserRequest(userId: string) {
    try {
      this.validateId(userId);
      const users: IUser[] = await this.getUsersFromServer();
      const user: IUser | undefined = users.find(({ id }) => userId === id);
      const result: IUser[] = users.filter(({ id }) => id !== userId);
      if (!user) throw new Error(ERRORS.NOT_EXIST);
      await writeFile(UsersDataPath, JSON.stringify(result));
      return JSON.stringify(user);
    } catch (e) {
      throw new Error(this.getErrorMessage(e));
    }
  }

  private async getUserById(userId: string) {
    try {
      this.validateId(userId);
      const users: IUser[] = await this.getUsersFromServer();
      const user = users.find(({ id }) => userId === id);
      if (!user) throw new Error(ERRORS.NOT_EXIST);
      return JSON.stringify(user);
    } catch (e) {
      throw new Error(this.getErrorMessage(e));
    }
  }

  private async getAllUsers(): Promise<string> {
    const users: IUser[] = await this.getUsersFromServer();
    return JSON.stringify(users);
  }

  private getErrorMessage(e: unknown) {
    const message = (<Error>e)?.message;
    return Object.values(ERRORS).includes(message as ERRORS) ? message : ERRORS.INTERNAL_ERROR;
  }

  private validateId(id: string) {
    if (!this._validateUuid(id)) throw new Error(ERRORS.INVALID_USER_ID);
  }

  private generateId() {
    return this._uuid();
  }

  private async getUsersFromServer(): Promise<IUser[]> {
    return (await import('../../server/data/users.json', { assert: { type: "json" }})).default;
  }

  private checkUser(user: IUser) {
    let result = typeof user.username === 'string' && Array.isArray(user.hobbies) && typeof user.age === 'number';
    if (result && user.hobbies.length) {
      result = user.hobbies.every((el) => typeof el === 'string');
    }
    return result;
  }
}

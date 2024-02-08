import { IncomingMessage, ServerResponse } from 'http';
import { PATH } from '../../models/server/enums/path';
import { METHODS } from '../../models/server/enums/methods';
import { UsersService } from '../users/users.service';
import { IUser } from '../../models/users/user';

const newUserMock = {
  id: '',
  username: 'uuuuuuu',
  age: 37,
  hobbies: ['sds','sfs']
}
export class RequestsService {
  static instance: RequestsService;
  private _usersService = new UsersService();
  constructor() {
    return RequestsService.instance ?? (RequestsService.instance = this);
  }

  public HttpHandler = async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const body = await this.requestSeparator(req);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(body);
    } catch (e) {
      console.log(e);
      res.writeHead(500, 'Error');
      res.end('error');
    }
  }

  public async requestSeparator(req: IncomingMessage) {
    const url = req.url?.split('/');
    if (!url || !url[1] || !url[2] || url[2] !== PATH.USER || url.length > 4) {
      this.handleErrors()
    } else {
      const [,,, id] = url;
      const data = this.getRequestData();
      switch (req.method) {
        case METHODS.GET:
          return this._usersService.getUsersRequest(id);
        case METHODS.POST:
          return id ? this.handleErrors() : this._usersService.createUserRequest(data)
        case METHODS.PUT:
          return id ? this._usersService.updateUserRequest({...newUserMock, id}) : this.handleErrors()
        case METHODS.DELETE:
          return id ? this._usersService.deleteUserRequest(id) : this.handleErrors()
        default:
          this.handleErrors()
      }
    }
  }

  getRequestData():IUser{
    return {
      id: '',
      username: 'fdgd',
      age: 17,
      hobbies: []
    }
  }


  public handleErrors() {
    console.log('ERROR');
  }
}

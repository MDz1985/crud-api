import { IncomingMessage, ServerResponse } from 'http';
import { PATH } from '../../models/server/enums/path';
import { METHODS } from '../../models/server/enums/methods';
import { UsersService } from '../users/users.service';
import { IUser } from '../../models/users/user';
import { once } from 'node:events';

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
  };

  public async requestSeparator(req: IncomingMessage) {
    const url = req.url?.split('/');
    if (!url || !url[1] || !url[2] || url[2] !== PATH.USER || url.length > 4) {
      this.handleErrors();
    } else {
      const [, , , id] = url;
      let data;
      switch (req.method) {
        case METHODS.GET:
          return this._usersService.getUsersRequest(id);
        case METHODS.POST:
          data = await this.getRequestData(req);
          return id ? this.handleErrors() : this._usersService.createUserRequest(data);
        case METHODS.PUT:
          data = await this.getRequestData(req);
          return id ? this._usersService.updateUserRequest({ ...data, id }) : this.handleErrors();
        case METHODS.DELETE:
          return id ? this._usersService.deleteUserRequest(id) : this.handleErrors();
        default:
          this.handleErrors();
      }
    }
  }

  public handleErrors() {
    console.log('ERROR');
  }

  private async getRequestData(req: IncomingMessage): Promise<IUser> {
    let result = '';
    req.on('data', (chunk) => result += chunk);
    req.on('end', () => result);
    await once(req, 'end')
    console.log(result);
    return JSON.parse(result)
  }
}

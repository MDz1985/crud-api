import { IncomingMessage, ServerResponse } from 'http';
import { PATH } from '../../models/server/enums/path';
import { METHODS } from '../../models/server/enums/methods';
import { UsersService } from '../users/users.service';

export class RequestsService {
  static instance: RequestsService;
  private _usersService = new UsersService();
  constructor() {
    return RequestsService.instance ?? (RequestsService.instance = this);
  }

  public HttpHandler = async (req: IncomingMessage, res: ServerResponse) => {
    try {
      this.requestSeparator(req);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ url: req.url, message: 'Hello word!' }));
    } catch (e) {
      res.writeHead(500, 'Error');
      res.end('error');
    }
  }

  public requestSeparator(req: IncomingMessage) {
    const url = req.url?.split('/');
    if (!url || !url[1] || !url[2] || url[2] !== PATH.USER || url.length > 4) {
      this.handleErrors()
    } else {
      const [,,, id] = url;
      switch (req.method) {
        case METHODS.GET:
          this._usersService.getUsersRequest(id);
          break;
        case METHODS.POST:
          id ? this.handleErrors() : this._usersService.createUserRequest()
          break;
        case METHODS.PUT:
          id ? this._usersService.updateUserRequest(id) : this.handleErrors()
          break;
        case METHODS.DELETE:
          id ? this._usersService.deleteUserRequest(id) : this.handleErrors()
          break;
        default:
          this.handleErrors()
      }
    }
  }

  public handleErrors() {
    console.log('ERROR');
  }
}

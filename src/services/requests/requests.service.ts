import { IncomingMessage, ServerResponse } from 'http';
import { PATH } from '../../models/server/enums/path.ts';
import { METHODS } from '../../models/server/enums/methods.ts';
import { UsersService } from '../users/users.service.ts';
import { IUser } from '../../models/users/user.ts';
import { once } from 'node:events';
import { REQUEST_CODES } from '../../models/server/enums/request-codes.ts';
import { ERRORS } from '../../models/server/enums/errors.ts';

export class RequestsService {
  static instance: RequestsService;
  private _usersService = new UsersService();

  constructor() {
    return RequestsService.instance ?? (RequestsService.instance = this);
  }

  public HttpHandler = async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const body = await this.requestSeparator(req);
      res.statusCode = this.getSuccessRequestCode(req);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(body);
    } catch (e) {
      res.writeHead(this.getFailedRequestCode(<Error>e));
      res.end((<Error>e)?.message ?? ERRORS.INTERNAL_ERROR);
    }
  };

  public async requestSeparator(req: IncomingMessage) {
    try {
      const url = req.url?.split('/');
      if (!url || !url[1] || !url[2] || url[1] !== PATH.API || url[2] !== PATH.USER || url.length > 4) {
        this.handleEndpointError();
      } else {
        const [, , , id] = url;
        let data;
        switch (req.method) {
          case METHODS.GET:
            return this._usersService.getUsersRequest(id);
          case METHODS.POST:
            data = await this.getRequestData(req);
            return id ? this.handleEndpointError() : this._usersService.createUserRequest(data);
          case METHODS.PUT:
            data = await this.getRequestData(req);
            return id ? this._usersService.updateUserRequest({ ...data, id }) : this.handleEndpointError();
          case METHODS.DELETE:
            return id ? this._usersService.deleteUserRequest(id) : this.handleEndpointError();
          default:
            this.handleEndpointError();
        }
      }
    } catch (e) {
      throw e;
    }
  }

  public handleEndpointError() {
    throw new Error(ERRORS.INVALID_ENDPOINT)
  }

  getFailedRequestCode(e: Error): REQUEST_CODES {
    switch (e?.message) {
      case ERRORS.INVALID_USER_ID:
      case ERRORS.INCOMPLETE_OR_WRONG_TYPE:
        return REQUEST_CODES.INVALID
      case ERRORS.NOT_EXIST:
      case ERRORS.INVALID_ENDPOINT:
        return REQUEST_CODES.NOT_EXIST
      default:
        return REQUEST_CODES.SERVER_ERROR
    }
  }

  public getSuccessRequestCode(req: IncomingMessage): REQUEST_CODES {
    switch (req.method) {
      case METHODS.POST:
        return REQUEST_CODES.SUCCESS_POST;
      case METHODS.DELETE:
        return REQUEST_CODES.SUCCESS_DELETE;
      default:
        return REQUEST_CODES.SUCCESS_GET_PUT
    }
  }

  public async getRequestData(req: IncomingMessage): Promise<IUser> {
    let result = '';
    req.on('data', (chunk) => result += chunk);
    req.on('end', () => result);
    await once(req, 'end');
    return JSON.parse(result);
  }
}

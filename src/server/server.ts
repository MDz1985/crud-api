import { createServer } from 'node:http';
import { IncomingMessage, ServerResponse } from 'http';
import 'dotenv/config';
import { env } from 'process';
import { PATH } from '../models/server/enums/path';
import { METHODS } from '../models/server/enums/methods';

const hostname = 'localhost';
const port = env.PORT as string;

async function HttpHandler(req: IncomingMessage, res: ServerResponse) {
  try {
    requestSeparator(req);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ url: req.url, message: 'Hello word!' }));
  } catch (e) {
    res.writeHead(500, 'Error');
    res.end('error');
  }
}



function requestSeparator(req: IncomingMessage) {
  const url = req.url?.split('/');
  if (!url || !url[1] || !url[2] || url[2] !== PATH.USER || url.length > 4) {
    handleErrors()
  } else {
    const [, api, type, id] = url;
    console.log(api, type, id);
    switch (req.method) {
      case METHODS.GET:
        getUsersRequest(id);
        break;
      case METHODS.POST:
        id ? handleErrors() : createUserRequest()
        break;
      case METHODS.PUT:
        id ? updateUserRequest(id) : handleErrors()
        break;
      case METHODS.DELETE:
        id ? deleteUserRequest(id) : handleErrors()
        break;
      default:
        handleErrors()
    }

  }
}
function handleErrors() {
  console.log('ERROR');
}



// todo: move to users controller/service
function getUsersRequest(id?: string) {
  id ? getUserById(id) : getAllUsers()
}
function getUserById(id:string) {
  console.log('information about user: ' + id)
}
function getAllUsers() {
  console.log('information about all users')
}

function createUserRequest() {
  console.log('create user')
}

function updateUserRequest(id: string) {
  console.log('update user: ' + id)
}

function deleteUserRequest(id: string) {
  console.log('delete user: ' + id)
}



createServer(HttpHandler)
  .listen(port)
  .on('listening', () => console.log(`Server running at http://${ hostname }:${ port }/`));


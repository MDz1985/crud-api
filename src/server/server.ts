import { createServer } from 'node:http';
// import { once } from 'node:events';
import { IncomingMessage, ServerResponse } from 'http';

const hostname = 'localhost';
const port = 4000;

async function HttpHandler(request: IncomingMessage, response: ServerResponse) {
  try {
    console.log(request.url)
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.writeHead(200, 'fine');
    response.end(JSON.stringify({url: request.url,message: 'Hello word!'}))
  } catch (e) {
    response.writeHead(500, 'Error');
    response.end('error')
  }
}

createServer(HttpHandler)
  .listen(port, hostname)
  .on('listening', () => console.log(`Server running at http://${ hostname }:${ port }/`));


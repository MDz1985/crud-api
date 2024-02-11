import { workerData, parentPort } from 'worker_threads';
import { createServer, request, ServerResponse } from 'node:http';
import { METHODS } from '../models/server/enums/methods.ts';
import { RequestsService } from '../services/requests/requests.service.ts';
import { IncomingMessage } from 'http';
import { ERRORS } from '../models/server/enums/errors.ts';

const PORT = workerData.port ?? 4001;
const requestService = new RequestsService();

const MultiHttpHandler = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const body = await requestService.requestSeparator(req);
    res.statusCode = requestService.getSuccessRequestCode(req);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    send(body, null);
    res.end(body);
  } catch (e) {
    const error = (<Error>e)?.message ?? ERRORS.INTERNAL_ERROR;
    res.writeHead(requestService.getFailedRequestCode(<Error>e));
    send(null, error);
    res.end(error);
  }
};

function send(response: unknown = null, error: string | null = null) {
  console.log('response from port:' + PORT);
  sendResult({ response, error });
}

createServer(MultiHttpHandler)
  .listen(PORT)
  .on('listening', () => {console.log('worker starts at port ' + PORT);});


parentPort?.on('message', (message) => {
  console.log(message);
  createRequest(message);
});

interface IPostMessage {
  response: unknown;
  error: unknown;
}

interface IRequestOptions {
  path: 'string',
  method: METHODS,
  data: unknown
}

const sendResult = (message: IPostMessage) => {
  parentPort?.postMessage(message);
};


function createRequest({ path, method, data }: IRequestOptions) {

  console.log(path, method,  '!PATH');

  const options = {
    port: PORT,
    path,
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = request(options, (res) => {
    let body = '';
    console.log(`STATUS: ${ res.statusCode }`);
    console.log(`HEADERS: ${ JSON.stringify(res.headers) }`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      body+=chunk
      console.log(`BODY: ${ chunk }`);
    });
    res.on('end', () => {
      console.log('No more data in response.');
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${ e.message }`);
  });

  req.write(data);
  req.end();
}

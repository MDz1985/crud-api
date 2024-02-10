import { workerData, parentPort } from 'worker_threads';
import { createServer, request } from 'node:http';
import { METHODS } from '../models/server/enums/methods';
import { RequestsService } from '../services/requests/requests.service';

const PORT = workerData.port;
const requestService = new RequestsService();

createServer(requestService.HttpHandler)
  .listen(PORT)
  .on('request', (_, res) => {
    console.log(res);
    sendResult({ response:res, error: null})
  })


parentPort?.on('message', (message) => {
  console.log(workerData)
  createRequest(message);
})

interface IPostMessage {
  response: unknown;
  error: unknown;
}

interface IRequestOptions {
  path: 'string',
  method: METHODS
}
const sendResult = (message: IPostMessage ) => {
  parentPort?.postMessage(message);
};


function createRequest({path, method}: IRequestOptions) {


  const postData = JSON.stringify({
    'msg': 'Hello World!',
  });

  const options = {
    // hostname: 'localhost',
    port: PORT,
    path,
    method,
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
      console.log('No more data in response.');
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

// Write data to request body
  req.write(postData);
  req.end();
}

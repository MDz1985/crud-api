import http from 'node:http';
import { Worker } from 'worker_threads';
import path from 'node:path';
import url from 'url';
import { RequestsService } from '../services/requests/requests.service.ts';
// import { ERRORS } from 'src/models/server/enums/errors';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const requestService = new RequestsService()

const PORT = process.env.PORT || 4000;
const THREADS_COUNT = 4;
const START_PORT_NUMBER = Number(process.env.PORT ?? 4000) + 1;

class WorkerManager {
  private currentWorkerIndex = 0;
  private readonly _workers: Worker[] = Array.from(Array(THREADS_COUNT), (_, i) =>
    new Worker(path.resolve(__dirname, 'worker.ts'), { workerData: { port: START_PORT_NUMBER + i } }));

  public getNextWorker(): Worker {
    const worker: Worker = this._workers[this.currentWorkerIndex] as Worker;
    this.currentWorkerIndex = (this.currentWorkerIndex + 1) % this._workers.length;
    return worker;
  }
}

const workerManager = new WorkerManager();

const server = http.createServer(async (req, res) => {
  const response = await new Promise((resolve) => {
    // const requestData = requestService.getRequestData(req);
    // todo: add data to the request
    const requestData = '{}';
    const worker = workerManager.getNextWorker();
    worker.postMessage({ path: req.url, method: req.method, data: requestData });
    worker.on('message', (data) => resolve({ status: 'resolved', data }));
    worker.on('error', ({ message }) => resolve({ status: 'error', data: message }));
  });
  console.log(response, 'resp-BALANCE');
  // @ts-ignore
  if (!response.data || response.data.error) {
    // @ts-ignore
    res.writeHead(requestService.getFailedRequestCode(response.data.error));
    // @ts-ignore
    res.end(response?.data.error || 'Internal Error');
  } else {
    res.statusCode = requestService.getSuccessRequestCode(req);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    // @ts-ignore
    res.end(response.data.response);
  }
  // res.statusCode = this.getSuccessRequestCode(req);
  // res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // res.end('body');
  // res.writeHead(this.getFailedRequestCode(<Error>e));
  // res.end((<Error>e)?.message ?? ERRORS.INTERNAL_ERROR);
});



server.listen(PORT, () => {
  console.log(`Load balancer listening on port ${ PORT }, please wait for workers....`);
});




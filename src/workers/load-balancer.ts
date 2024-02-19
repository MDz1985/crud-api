import http from 'node:http';
import { Worker } from 'worker_threads';
import path from 'node:path';
import url from 'url';
import { RequestsService } from '../services/requests/requests.service.ts';
import { IUser } from '../models/users/user.ts';
import os from 'node:os';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const requestService = new RequestsService()

const PORT = process.env.PORT || 4000;
const THREADS_COUNT = os.cpus().length - 1;

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
  const requestData = await requestService.getRequestData(req);
  const response = await new Promise<IWorkerResponse>((resolve) => {
    const worker = workerManager.getNextWorker();
    worker.postMessage({ path: req.url, method: req.method, data: JSON.stringify(requestData) });
    worker.on('message', (data) => {
      resolve({ status: 'resolved', data: data.response, error: data.error })
    });
    worker.on('error', ({ message }) => resolve({ status: 'error', error: new Error(message)} ));
  });


  if (response.error) {
    res.writeHead(requestService.getFailedRequestCode(response.error));
    res.end(response.error || 'Internal Error');
  } else {
    res.statusCode = requestService.getSuccessRequestCode(req);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(response?.data);
  }
});



server.listen(PORT, () => {
  console.log(`Load balancer listening on port ${ PORT }, please wait for workers....`);
});


interface IWorkerResponse {
  status: string;
  data?: IUser;
  error?: Error;

}

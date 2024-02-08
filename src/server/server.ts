import { createServer } from 'node:http';
import 'dotenv/config';
import { env } from 'process';
import { RequestsService } from '../services/requests/requests.service';


const hostname = 'localhost';
const port = env.PORT as string;
const requestsService = new RequestsService();

createServer(requestsService.HttpHandler)
  .listen(port)
  .on('listening', () => console.log(`Server running at http://${ hostname }:${ port }/`));


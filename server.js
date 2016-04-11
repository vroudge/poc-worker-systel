import http from 'http';
import Job from './job';
import Worker from './worker';
import cluster from 'cluster';

let currentRunningWorkers = 0;
let numReqs = 0;

if (cluster.isMaster) {

    setInterval(() => {
        console.log('num reqs/s =', numReqs);
        numReqs=0;
    }, 1000);

    var work = Worker.createWorker(new Job('getGoogle', 'http://www.google.com/'));

    console.log(work);

    cluster.on('exit', (worker, code, signal) => {
        currentRunningWorkers--;
        console.log(`worker ${worker.process.pid} died`);
    });

    Object.keys(cluster.workers).forEach((id) => {
        cluster.workers[id].on('message', messageHandler);
    });

    // Count requests
    function messageHandler(msg) {
        if (msg.cmd && msg.cmd == 'notifyRequest') {
            numReqs += 1;
        }
    }
} else {
    process.on('message', (msg) => {
        msg();
    });
    // Worker processes have a http server.
    http.Server((req, res) => {
        res.writeHead(200);
        numReqs++;
        // notify master about the request
        process.send({ cmd: 'notifyRequest' });
    }).listen(8000);
}
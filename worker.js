import cluster from 'cluster';
import request from 'request';

const cpus = require('os').cpus().length;
let currentRunningWorkers = 0;

class Worker {

    constructor(job){
        this.id = (new Date).getTime();
        this.job = job;
    }

    static createWorker(job){
        if(!job)
            throw new Error('No job provided to worker!');

        if(currentRunningWorkers<cpus){
            cluster.fork();
            currentRunningWorkers++;
        } else {
            throw new Error('Too many workers');
        }

        return new Worker(job);
    }
}

export default Worker;
const R = require("ramda");
const { Worker } = require("bullmq");
const redisConnection = require("../lib/redis-connection");
const queue = require("../lib/queue");
const createBot = require("./create-bot");
const unfurl = require("./unfurl");

const jobIs = R.propEq("name");

const workerFn = R.cond([
  [jobIs("create-bot"), createBot],
  [jobIs("unfurl"), unfurl],
  [R.T, console.log],
]);

const worker = new Worker(queue.name, workerFn, {
  connection: redisConnection,
});

module.exports = worker;

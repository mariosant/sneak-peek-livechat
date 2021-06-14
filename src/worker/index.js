const R = require("ramda");
const { Worker } = require("bullmq");
const queue = require("../lib/queue");
const createBot = require("./create-bot");
const unfurl = require("./unfurl");

const { REDIS_URL } = process.env;

const jobIs = R.propEq("name");

const workerFn = R.cond([
  [jobIs("create-bot"), createBot],
  [jobIs("unfurl"), unfurl],
  [R.T, console.log],
]);

const worker = new Worker(queue.name, workerFn, { connection: REDIS_URL });

module.exports = worker;

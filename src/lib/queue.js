const { Queue, QueueScheduler } = require("bullmq");

const { REDIS_URL } = process.env;

const queueScheduler = new QueueScheduler("queue");

const queue = new Queue("queue", {
  connection: REDIS_URL,
});

module.exports = queue;

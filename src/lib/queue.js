const { Queue, QueueScheduler } = require("bullmq");
const redisConnection = require("./redis-connection");

const queueScheduler = new QueueScheduler("queue", {
  connection: redisConnection,
});

const queue = new Queue("queue", {
  connection: redisConnection,
});

module.exports = queue;

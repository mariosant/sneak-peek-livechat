const queue = require("./queue");
const { db, collections } = require("./db");

const middleware = async (ctx, next) => {
  ctx.db = db;
  ctx.collections = collections;
  ctx.queue = queue;

  await next();
};

module.exports = middleware;

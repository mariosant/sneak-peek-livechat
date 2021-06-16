const compose = require("koa-compose");
const bodyParser = require("koa-bodyparser");

const { LC_WEBHOOKS_SECRET } = process.env;

const secureWebhooks = async (ctx, next) => {
  const { body } = ctx.request;

  if (body.secret_key === LC_WEBHOOKS_SECRET) {
    await next();
  }
};

const handler = async (ctx) => {
  const { queue } = ctx;
  const { body } = ctx.request;

  if (body?.action === "incoming_event") {
    await queue.add("unfurl", body, {
      attempts: 5,
      type: "fixed",
    });
  }

  ctx.status = 200;
};

module.exports = compose([
  bodyParser({ enableTypes: ["json"] }),
  secureWebhooks,
  handler,
]);

const axios = require("axios");
const qs = require("qs");
const compose = require("koa-compose");
const envMiddlware = require("../lib/env-middleware");

const { LC_CLIENT_ID, LC_CLIENT_SECRET, LC_REDIRECT_URI } = process.env;

const handler = async (ctx) => {
  const { code } = ctx.query;
  const { accounts } = ctx.collections;
  const queue = ctx.queue;

  const body = qs.stringify({
    code,
    grant_type: "authorization_code",
    client_id: LC_CLIENT_ID,
    client_secret: LC_CLIENT_SECRET,
    redirect_uri: LC_REDIRECT_URI,
  });

  const { data: authResponse } = await axios({
    method: "post",
    url: "https://accounts.livechat.com/token",
    data: body,
  });

  ctx.status = 200;
  ctx.body = "ok";

  const account = await accounts.findOneAndUpdate(
    {
      license_id: authResponse.license_id,
      account_id: authResponse.account_id,
    },
    {
      $set: {
        ...authResponse,
        access_token_created_at: new Date(),
      },
    },
    { upsert: true }
  );

  await queue.add(
    "create-bot",
    {
      license_id: account.license_id,
    },
    {
      jobId: `create-bot-${account.license_id}`,
      attempts: 10,
      backoff: {
        type: "fixed",
        delay: 5000,
      },
    }
  );
};

module.exports = compose([envMiddlware, handler]);

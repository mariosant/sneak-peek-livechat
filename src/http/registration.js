const axios = require("axios");
const qs = require("qs");

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
      jobId: `create-bot-${account.refresh_token}`,
      attempts: 60,
      backoff: {
        type: "fixed",
        delay: 2000,
      },
    }
  );

  await queue.add(
    "create-chat-webhooks",
    {
      license_id: account.license_id,
    },
    {
      jobId: `create-chat-webhooks-${account.refresh_token}`,
      attempts: 60,
      backoff: {
        type: "fixed",
        delay: 2000,
      },
    }
  );

  ctx.redirect("https://sneakpeek-thank-you.carrd.co");
};

module.exports = handler;

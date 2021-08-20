const delay = require("delay");
const lcApi = require("../lib/lc-api");

const { LC_CLIENT_ID, LC_WEBHOOKS_URL, LC_WEBHOOKS_SECRET } = process.env;

const handler = async ({ data }) => {
  const api = await lcApi(data.license_id);

  const webhooks = await api.post("/configuration/action/list_webhooks", {
    owner_client_id: LC_CLIENT_ID,
  });

  await Promise.all(
    webhooks.map(({ id }) =>
      api.post("/configuration/action/unregister_webhook", {
        id,
        owner_client_id: LC_CLIENT_ID,
      })
    )
  );

  const sneakPeekWebhook = await api.post(
    "/configuration/action/register_webhook",
    {
      action: "incoming_event",
      type: "license",
      owner_client_id: LC_CLIENT_ID,
      url: LC_WEBHOOKS_URL,
      secret_key: LC_WEBHOOKS_SECRET,
    }
  );

  await api
    .post("/configuration/action/enable_license_webhooks", {
      id: sneakPeekWebhook.id,
    })
    .catch((err) => {
      console.log(err.response.data);

      throw err;
    });

  console.log(
    `[LC: ${data.license_id}] Webhook created and enabled 📢`,
    sneakPeekWebhook
  );
};

module.exports = handler;

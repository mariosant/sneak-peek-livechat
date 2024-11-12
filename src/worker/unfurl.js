const R = require("ramda");
const getUrls = require("get-urls");
const createMetascraper = require("metascraper");
const { collections } = require("../lib/db");
const lcApi = require("../lib/lc-api");
const { default: axios } = require("axios");

const metascraper = createMetascraper([
  require("metascraper-description")(),
  require("metascraper-image")(),
  require("metascraper-title")(),
]);

const getUrl = (text) => {
  const [url] = Array.from(
    getUrls(text, {
      forceHttps: true,
      removeTrailingSlash: false,
      removeSingleSlash: true,
    })
  );

  return url;
};

const handler = async ({ data }) => {
  const text = data.payload?.event?.text ?? "";
  const url = getUrl(text);

  if (text.includes("@") || R.isNil(url)) {
    return;
  }

  const response = await axios.get(url);
  const mqlData = await metascraper({ html: response.data, url });

  const lcEvent = {
    chat_id: data.payload.chat_id,
    event: {
      type: "rich_message",
      recipients: "all",
      template_id: "cards",
      elements: [
        {
          title: mqlData.title,
          subtitle: mqlData.description,
          buttons: [
            {
              text: "Open",
              type: "url",
              value: url,
              postback_id: "open_url",
              user_ids: [],
            },
          ],
          ...(mqlData.image && { image: { url: mqlData.image } }),
        },
      ],
    },
  };

  const api = await lcApi(data.license_id);

  const { bot_agent_id: botAgentId } = await collections.accounts.findOne({
    license_id: data.license_id,
  });

  await api
    .post("/agent/action/send_event", lcEvent, {
      headers: {
        "X-Author-Id": botAgentId,
      },
    })
    .then(() => {
      console.log(`[LC: ${data.license_id}] Url unfurled 😊`, { url, mqlData });
    })
    .catch((error) => {
      console.log(
        "Request failed",
        error.response.status,
        botAgentId,
        JSON.stringify(error.response.data),
        JSON.stringify(lcEvent)
      );
    });
};

module.exports = handler;

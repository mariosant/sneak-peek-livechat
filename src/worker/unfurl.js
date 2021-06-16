const R = require("ramda");
const getUrls = require("get-urls");
const mql = require("@microlink/mql");
const { collections } = require("../lib/db");
const lcApi = require("../lib/lc-api");

const notFoundImage = "https://www.belugacdn.com/images/cdn-images.png";

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

  const { data: mqlData } = await mql(url);

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
          image: { url: mqlData.image?.url ?? notFoundImage },
          buttons: [
            {
              text: "Open",
              type: "url",
              value: url,
              postback_id: "open_url",
              user_ids: [],
            },
          ],
        },
      ],
    },
  };

  const api = await lcApi(data.license_id);

  const { bot_agent_id: botAgentId } = await collections.accounts.findOne({
    license_id: data.license_id,
  });

  await api.post("/agent/action/send_event", lcEvent, {
    headers: {
      "X-Author-Id": botAgentId,
    },
  });
};

module.exports = handler;

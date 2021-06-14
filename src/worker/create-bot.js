const { collections } = require("../lib/db");
const lcApi = require("../lib/lc-api");

const { LC_CLIENT_ID } = process.env;

const hasSneakPeek = (bots) =>
  bots.reduce((_acc, bot) => {
    return bot.owner_client_id === LC_CLIENT_ID;
  }, false);

const getSneakPeek = (bots) =>
  bots.find((bot) => bot.owner_client_id === LC_CLIENT_ID);

const handler = async ({ data }) => {
  const api = await lcApi(data.license_id);

  const bots = await api.post("/configuration/action/list_bots", {
    all: true,
  });

  if (hasSneakPeek(bots)) {
    const oldbot = getSneakPeek(bots);

    await api.post("/configuration/action/delete_bot", {
      id: oldbot.id,
    });
  }

  const bot = await api.post("/configuration/action/create_bot", {
    name: "SneakPeek",
  });

  await collections.accounts.findOneAndUpdate(
    {
      license_id: data.license_id,
    },
    {
      $set: {
        bot_agent_id: bot.id,
      },
    }
  );

  console.log("bot created", bot);
};

module.exports = handler;

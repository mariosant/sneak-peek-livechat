const axios = require("axios");
const qs = require("qs");
const dayjs = require("dayjs");
const { collections } = require("./db");

const { LC_CLIENT_ID, LC_CLIENT_SECRET, LC_REDIRECT_URI } = process.env;

const getToken = async (account) => {
  const body = qs.stringify({
    grant_type: "refresh_token",
    refresh_token: account.refresh_token,
    client_id: LC_CLIENT_ID,
    client_secret: LC_CLIENT_SECRET,
  });

  const { data: authResponse } = await axios({
    method: "post",
    url: "https://accounts.livechat.com/token",
    data: body,
  });

  await collections.accounts.findOneAndUpdate(
    {
      license_id: authResponse.license_id,
      account_id: authResponse.account_id,
    },
    {
      $set: {
        access_token: authResponse.access_token,
        access_token_created_at: new Date(),
      },
    },
    { upsert: true }
  );

  return authResponse.access_token;
};

const lcApi = async (licenseId) => {
  const account = await collections.accounts.findOne({
    license_id: licenseId,
  });

  const tokenExpiration = dayjs(account.access_token_created_at).add(
    account.expires_in,
    "s"
  );

  const accessToken = tokenExpiration.isAfter(dayjs())
    ? account.access_token
    : await getToken(account);

  const client = axios.create({
    baseURL: "https://api.livechatinc.com/v3.3",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "X-Region": accessToken.substr(0, 3),
    },
  });

  client.interceptors.response.use(({ data }) => data);

  return client;
};

module.exports = lcApi;

const Koa = require("koa");
const Router = require("@koa/router");
const webhooks = require("./http/webhooks-livechat");
const registration = require("./http/registration");
const worker = require("./worker/index");

const port = process.env.PORT ?? 3000;

const app = new Koa();
const router = new Router();

router.get("/auth/callback", registration);
router.post("/webhooks", webhooks);
app.use(router.routes());

worker.on("failed", console.log);

app.listen(port, () => {
  console.log(`Sneak Peek listening port: ${port}`);
});

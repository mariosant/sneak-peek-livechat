const Koa = require("koa");
const Router = require("@koa/router");
const webhooks = require("./http/webhooks-livechat");
const registration = require("./http/registration");
const health = require("./http/health");
const worker = require("./worker/index");
const envMiddlware = require("./lib/env-middleware");


const port = process.env.PORT ?? 3000;

const app = new Koa();
app.use(envMiddlware)

const router = new Router();

router.get("/auth/callback", registration);
router.post("/webhooks", webhooks);
router.get("/health", health);
app.use(router.routes());

worker.on("failed", console.log);

app.listen(port, () => {
  console.log(`Sneak Peek listening port: ${port}`);
});

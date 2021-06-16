const worker = require("./worker/index");

worker.on("failed", console.log);

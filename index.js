let restify = require("restify");
let line = require("@line/bot-sdk"); // 追加

let server = restify.createServer();
server.listen(process.env.PORT || 3000, function() {
    console.log("Node is running...");
});

const LINE_CONFIG = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
}

server.use(line.middleware(LINE_CONFIG)); // 追加

server.post("/webhook", (req, res, next) => {
    res.send(200);
    console.log(req.body);
});

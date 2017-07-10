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

// APIコールのためのクライアントインスタンスを作成
let bot = new line.Client(LINE_CONFIG);

// -----------------------------------------------------------------------------
// ルーター設定
server.post('/webhook', (req, res, next) => {
    // 先行してLINE側にステータスコード200でレスポンスする。
    res.send(200);

    // すべてのイベント処理のプロミスを格納する配列。
    let events_processed = [];

    // イベントオブジェクトを順次処理。
    for (let event of req.body.events){
        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type == "message" || event.message.type == "text"){
            // ユーザーからのテキストメッセージが「こんにちは」だった場合のみ反応。
            if (event.message.text == "こんにちは"){
                // replyMessage()で返信し、そのプロミスをevents_processedに追加。
                bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "これはこれは"
                });
            }
        }
    };
});

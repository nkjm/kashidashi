"use strict";

// -----------------------------------------------------------------------------
// モジュールのインポート
let restify = require("restify");
let line = require("@line/bot-sdk");
let apiai = require("apiai-promisified"); // api.aiのSDKをインポート

// -----------------------------------------------------------------------------
// パラメータ設定
const LINE_CONFIG = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
};
const APIAI_CLIENT_ACCESS_TOKEN = process.env.APIAI_CLIENT_ACCESS_TOKEN; // api.aiのCLIENT ACCESS TOKENをセット

// -----------------------------------------------------------------------------
// Webサーバー設定
let server = restify.createServer();
server.listen(process.env.PORT || 3000, function() {
    console.log("Node is running.");
});


// -----------------------------------------------------------------------------
// ミドルウェア設定
server.use(line.middleware(LINE_CONFIG));


// 各種インスタンスを作成
let bot = new line.Client(LINE_CONFIG);
let nlp = new apiai(APIAI_CLIENT_ACCESS_TOKEN, {language: "ja"}); // api.aiのインスタンスを作成

// -----------------------------------------------------------------------------
// ルーター設定
server.post('/webhook', (req, res, next) => {
    // 先行してLINE側にステータスコード200でレスポンスする。
    res.send(200);

    // すべてのイベント処理のプロミスを格納する配列。
    let events_processed = [];

    // イベントオブジェクトを順次処理。
    req.body.events.map((event) => {
        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type == "message" || event.message.type == "text"){
            events_processed.push(
                // 受信したメッセージを自然言語解析にかける。
                nlp.textRequest(event.message.text, {sessionId: event.source.userId}).then(
                    (response) => {
                        console.log(`The action is ${response.result.action}.`);
                        let reply_message;

                        if (response.result.action == "handle-pizza-order"){
                            // もしactionがhandle-pizza-orderだった場合はピザ注文受付のメッセージをセット。
                            if (response.result.parameters.pizza === ""){
                                reply_message = `ありがとうございます。ご注文のピザはお決まりでしょうか？`;
                            } else {
                                if (response.result.parameters.size === ""){
                                    reply_message = `${response.result.parameters.pizza}ですね。`;
                                } else {
                                    reply_message = `${response.result.parameters.pizza}の${response.result.parameters.size}サイズですね。`;
                                }
                            }
                        } else if (response.result.action == "input.unknown"){
                            // もしactionがinput.unknownだった場合（意図が判定できなかった場合）はプリセットのメッセージをセット。
                            reply_message = response.result.fulfillment.speech;
                        }

                        // 返信。
                        return bot.replyMessage(event.replyToken, {
                            type: "text",
                            text: reply_message
                        });
                    }
                )
            );
        }
    });

    // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
    Promise.all(events_processed).then(
        (response) => {
            console.log(`${response.length} events processed.`);
        },
        (error) => {
            console.log(error);
        }
    );
});

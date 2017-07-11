"use strict";

module.exports = class SkillHandlePizzaOrder {
    constructor(bot, event){
        this.clear_context_on_finish = true;

        this.required_parameter = {
            pizza: { // ピザのタイプ
                message_to_confirm: {
                    type: "template",
                    altText: "ご注文のピザはお決まりでしょうか？（マルゲリータかマリナーラだぞ。それ以外は入れるなよ。絶対にだ。）",
                    template: {
                        type: "buttons",
                        text: "ご注文のピザはお決まりでしょうか？",
                        actions: [
                            { type: "message", label: "マルゲリータ", text: "マルゲリータ"},
                            { type: "message", label: "マリナーラ", text: "マリナーラ"}
                        ]
                    }
                },
                reaction: (error, value, context, resolve, reject) => {
                    if (error){
                        if (value != ""){
                            bot.change_message_to_confirm("pizza", {
                                type: "text",
                                text: "だからマルゲリータかマリナーラのどっちかだと言っとるだろ。"
                            })
                        }
                    } else {
                        bot.queue([{
                            type: "text",
                            text: `${value}ですね。OK牧場。`
                        },{
                            type: "text",
                            text: `ホーーーウ。`
                        }])
                    }
                    return resolve();
                }
            },
            size: { // ピザのサイズ
                message_to_confirm: {
                    type: "text",
                    text: "サイズはお決まりでしょうか？"
                }
            },
            address: { // お届け先
                message_to_confirm: {
                    type: "text",
                    text: "お届け先を教えてください。"
                }
            },
            name: { // お名前
                message_to_confirm: {
                    type: "text",
                    text: "お名前を教えてください。"
                }
            }
        }
    }

    parse_pizza(value, context, resolve, reject){
        if (value.match(/マルゲリータ/) || value.match(/マルガリータ/)){
            return resolve("マルゲリータ");
        }
        if (value.match(/マリナーラ/) || value.match(/まりなーら/)){
            return resolve("マリナーラ");
        }
        return reject();
    }

    finish(bot, event, context, resolve, reject){
        return bot.reply({
            type: "text",
            text: `${context.confirmed.name}様、承知しました。${context.confirmed.pizza}を30分以内にお届けします。`
        }).then(
            (response) => {
                return resolve();
            }
        );
    }
}

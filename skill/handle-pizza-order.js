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

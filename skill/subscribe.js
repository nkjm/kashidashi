"use strict";

let request = require("request");
Promise = require("bluebird");
let oracle = require("../service/oracle");

module.exports = class SkillKasidasi {
    constructor(bot, event){
        this.required_parameter = {
            product_serial: {
                message_to_confirm: {
                    type: "text",
                    text: "シリアルNo.を教えてください"
                }
            }
        }

        this.clear_context_on_finish = true;
    }

    finish(bot, event, context, resolve, reject){
        return oracle.subscribe(context.confirmed.product_serial, bot.extract_sender_id()).then(
            (response) => {
                return bot.reply({
                    type: "text",
                    text: "了解です。きっとお伝えしますね。"
                });
            }
        ).then(
            (response) => {
                return resolve();
            }
        );
    }
}

"use strict";

let request = require("request");
Promise = require("bluebird");
let oracle = require("../service/oracle");

module.exports = class SkillKasidasi {
    constructor(bot, event){
        this.optional_parameter = {
            product_id_or_name: {
                message_to_confirm: {
                    type: "text",
                    text: "品番または品名を教えてください"
                },
                reaction: (error, value, context, resolve, reject) => {
                    if (error){
                        bot.change_message_to_confirm("product_id_or_name", {
                            type: "text",
                            text: "お探しの機器はそもそも存在しないようです。品番または品名をお確かめの上再度教えてください。"
                        });
                    }
                    return resolve();
                }
            },
            product_id: {
                message_to_confirm: {

                }
            },
            product_name: {
                message_to_confirm: {

                }
            },
            lend: {
                message_to_confirm: {
                    type: "template",
                    altText: `こちらの機器を借りられますか？`,
                    template: {
                        type: "confirm",
                        text: `こちらの機器を借りられますか？`,
                        actions: [
                            {type:"message", label:"はい", text:"はい"},
                            {type:"message", label:"いいえ", text:"いいえ"}
                        ]
                    }
                },
                reaction: (error, value, context, resolve, reject) => {
                    if (!error){
                        if (value == "いいえ"){
                            bot.queue({
                                type: "text",
                                text: "だったら聞く必要ないがや。"
                            })
                        }
                    }
                    return resolve();
                }
            }
        }

        this.clear_context_on_finish = true;
    }

    parse_product_id_or_name(value, context, resolve, reject){
        if (value === ""){
            return reject();
        }
        return oracle.get_product_by_id(value).then(
            (response) => {
                if (response.length > 0){
                    return resolve(value);
                } else {
                    return oracle.get_product_by_name(value).then(
                        (response) => {
                            if (response.length > 0){
                                return resolve(value);
                            } else {
                                return reject();
                            }
                        }
                    );
                }
            }
        );
    }

    parse_product_id(value, context, resolve, reject){
        if (value === ""){
            return reject();
        }
        return oracle.get_product_by_id(value).then(
            (response) => {
                if (response.length > 0){
                    return resolve(value);
                } else {
                    return reject();
                }
            }
        );
    }

    parse_product_name(value, context, resolve, reject){
        if (value === ""){
            return reject();
        }
        return oracle.get_product_by_name(value).then(
            (response) => {
                if (response.length > 0){
                    return resolve(value);
                } else {
                    return reject();
                }
            }
        );
    }

    finish(bot, event, context, resolve, reject){
        // User already specified product and confirmed if he/she wants to get it.
        if (context.confirmed.lend){
            if (context.confirmed.lend == "はい"){
                return oracle.toggle_lend_flag(context.confirmed.product_serial).then(
                    (response) => {
                        return bot.reply({
                            type: "text",
                            text: "了解しました。貸出処理完了です。持ってってくださいー。"
                        });
                    },
                    (error) => {
                        return bot.reply({
                            type: "text",
                            text: "すみません貸出処理中にエラーが出ました。今日はちょっと無理そうです。"
                        });
                    }
                ).then(
                    (response) => {
                        return resolve();
                    }
                );
            } else {
                return bot.reply().then(
                    (response) => {
                        return resolve();
                    }
                )
            }
        }

        // User has not provided any product information.
        if (!context.confirmed.product_id_or_name && !context.confirmed.product_id && !context.confirmed.product_name){
            bot.collect("product_id_or_name");
            return resolve();
        }

        // User has provided product information so we search for it.
        return oracle.search_product(context.confirmed.product_id_or_name || context.confirmed.product_id || context.confirmed.product_name).then(
            (response) => {
                let is_available = false;
                for (let product of response){
                    if (product.t_lend_flg == 0){
                        is_available = true;
                        context.confirmed.product_serial = product.t_field1;
                        context.confirmed.product_id = product.t_field2;
                        context.confirmed.product_name = product.t_field3;
                    }
                }
                if (is_available){
                    // Available product FOUND.
                    let message_text = `${context.confirmed.product_name}のシリアルNo.${context.confirmed.product_serial}が貸し出し可能です。こちらの機器を借りますか？`;
                    this.optional_parameter.lend.message_to_confirm.altText = message_text;
                    this.optional_parameter.lend.message_to_confirm.template.text = message_text;
                    bot.collect("lend");
                    return resolve();
                } else {
                    // Available product NOT FOUND.
                    context.confirmed.product_serial = response[0].t_field1;
                    let message_text = "残念ながら今貸し出し可能な機器がありません。返却されたらご連絡しましょうか？";
                    return bot.reply({
                        type: "template",
                        altText: message_text,
                        template: {
                            type: "buttons",
                            text: message_text,
                            actions: [
                                {type:"postback", label:"連絡して欲しい", data: `${context.confirmed.product_serial}が返却されたら教えてください`},
                                {type:"postback", label:"別に必要ない", data: `通知は必要ありません。`}
                            ]
                        }
                    }).then(
                        (response) => {
                            return resolve();
                        }
                    );
                }
            }
        )
    }
}

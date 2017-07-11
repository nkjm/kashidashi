"use strict";

let mecab = require("mecabaas-client");
let is_email = require("isemail");

module.exports = class SkillSurvey {
    constructor(bot, event){
        this.required_parameter = {
            satisfaction: {
                message_to_confirm: {
                    type: "template",
                    altText: "今日の満足度は？",
                    template: {
                        type: "buttons",
                        text: "今日の満足度は？",
                        actions: [
                            {type: "message", label: "高い", text: "高い"},
                            {type: "message", label: "普通", text: "普通"},
                            {type: "message", label: "低い", text: "低い"}
                        ]
                    }
                }
            },
            apply: {
                message_to_confirm: {
                    type: "template",
                    altText: "応募されますか？",
                    template: {
                        type: "buttons",
                        text: "応募されますか？",
                        actions: [
                            {type: "message", label: "はい", text: "はい"},
                            {type: "message", label: "いいえ", text: "いいえ"},
                            {type: "uri", label: "詳しい情報を見る", uri: "https://www.heartis-sc.co.jp/recruit/"}
                        ]
                    }
                },
                reaction: (error, value, context, resolve, reject) => {
                    if (!error){
                        if (value == "はい"){
                            bot.collect("name");
                        }
                    }
                    return resolve();
                }
            },
            comment: {
                message_to_confirm: {
                    type: "text",
                    text: "ご意見・ご感想があれば是非お願いします！"
                }
            }
        }

        this.optional_parameter = {
            name: {
                message_to_confirm: {
                    type: "text",
                    text: "お名前教えてもらえますか？"
                },
                reaction: (error, value, context, resolve, reject) => {
                    if (!error){
                        bot.collect("email");
                    }
                    return resolve();
                }
            },
            email: {
                message_to_confirm: {
                    type: "text",
                    text: "Emailアドレスをお伺いしてもよいでしょうか？"
                }
            }
        }

        this.clear_context_on_finish = true;
    }

    parse_satisfaction(value, context, resolve, reject){
        if (value.match(/高い/) || value.match(/普通/) || value.match(/低い/)){
            return resolve(value);
        }
        return reject();
    }

    parse_name(value, context, resolve, reject){
        return mecab.parse(value).then(
            (response) => {
                let name = {};
                for (let elem of response){
                    if (elem[3] == "人名" && elem[4] == "姓"){
                        name.lastname = elem[0];
                    } else if (elem[3] == "人名" && elem[4] == "名"){
                        name.firstname = elem[0];
                    }
                }
                return resolve(name);
            },
            (response) => {
                return reject(response);
            }
        )
    }

    parse_email(value, context, resolve, reject){
        if (is_email.validate(value)){
            return resolve(value);
        } else {
            return reject();
        }
    }

    finish(bot, event, context, resolve, reject){
        return bot.reply({
            type: "text",
            text: "ありがとうございました！これでアンケートは完了です。"
        }).then(
            (response) => {
                return resolve();
            }
        )
    }
}

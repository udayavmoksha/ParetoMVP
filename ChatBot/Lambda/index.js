/**
Title:ChatBot
Author: uday
Date: 09-21-2017
Description:This is an subscriber to api-gateway in turn invoked by webhook set 
*/
// Include TelegramBot package
var TelegramBot = require('node-telegram-bot-api');

// Telegram bot token (given when you create a new bot using the BotFather);
var telegramBotToken = 'Telegram-Bot-Token';
// Telegram bot setup
var telegramBot = new TelegramBot(telegramBotToken, {
    polling: false
});
var projectkeys = ["Token", "Rank", "Balance", "Address", "ID"]
var greetingkeys = ["Hi", "Hello", "No", "Hey", "Thanks", "stop"]

exports.handler = function(event, context, lambdaCallback) {

    console.log(JSON.stringify(event))
    // Geting data from event
    let message = event.message
    let chatId = message.chat.id;
    let req_message = message.text.replace(/(^\s+|\s+$)/g, '');
    let key = req_message;

    greetingkeys.forEach(function(element) {
        if (req_message.includes(element) || req_message.includes(element.toLowerCase())) {
            key = "greetings"
        }
    });
    projectkeys.forEach(function(element) {
        if (req_message.includes(element) || req_message.includes(element.toLowerCase())) {
            key = "project_specific"
        }
    });
    console.log(key);

    // based on the case invoking specific function
    switch (key) {
        case "/start":
            Start(req_message)
            break;
        case "/help":
            Help(req_message)
            break;
        case "greetings":
            Greetings(req_message)
            break;
        case "project_specific":
            Project_specific(req_message)
            break;
        default:
            Default(req_message)
    }

    function uppercase(txt) {
        return txt.replace(/\b\w/g, function(l) {
            return l.toUpperCase()
        })
    }

    function trim(txt) {
        return txt.toString().replace(/(^\s+|\s+$)/g, '')
    }

    function matchtype(txt) {
        return txt.match(/^-?\d*\.?\d+$/) == null ? txt : parseInt(txt)
    }

    //pushing message based on the commands -starts

    function Project_specific(req_message) {
        console.log("=====Project_specific=====")
        try {
            let url = 'Database-Endpoint'
            let req = {}
            let obj_key = uppercase(trim(req_message.split('-')[0]))
            let obj_value = matchtype(trim(req_message.split('-')[1]) == undefined ? "" : trim(req_message.split('-')[1]))
            req[obj_key] = obj_value
            console.log(JSON.stringify(req))

            let request = require('request');
            request.post({
                headers: {
                    'content-type': 'application/json'
                },
                url: url,
                body: JSON.stringify(req)
            }, function(error, response, body) {
                console.log(body);
                let msg = "";
                if (JSON.parse(body).Success) {
                    let response_body = JSON.parse(body).Data.Items;
                    response_body.forEach(function(dta) {
                        for (x in dta) {
                            msg += x + " - " + trim(dta[x]) + "\n";
                        }
                        msg = msg + "\n"
                    })
                }
                if (msg == "") {
                    msg = "No Records Found."
                };
                sendmsg(msg)
            });

        } catch (err) {
            sendmsg("There is an issue with requested details.")
        }


    }


    function Start(req_message) {
        console.log("====start function===")
        sendmsg("Hi i'm a Etherscan Bot in Stg.")
    }

    function Default(req_message) {
        console.log("====default function===")
        sendmsg("Sorry i coudn't understand.\n To get help use /help ")
    }

    function Greetings(req_message) {
        console.log("====greetings function===")
        sendmsg(req_message)
    }

    function Help(req_message) {
        console.log("====Help function===")
        sendmsg("To get Rank,Balance and Token of a Address use the command \n Address-xxxxxxxxxxxxxx\n  eg:\nAddress-0x105e684de6d1fda4635a5e3cdfb40004f5d0468d\n")
    }
    //pushing message based on the commands -ends

    // base function to sen message
    function sendmsg(msg) {
        telegramBot.sendMessage(chatId, msg);
    }

}
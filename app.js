/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * Starter Project for Messenger Platform Webview Tutorial
 *
 * Use this project as the starting point for following the
 * Messenger Platform webview tutorial.
 *
 * https://blog.messengerdevelopers.com/using-the-webview-to-create-richer-bot-to-user-interactions-ed8a789523c6
 *
 */

'use strict';

// Imports dependencies and set up http server
const https = require('https');
const fs = require('fs');
const
    request = require('request'),
    express = require('express'),    
    body_parser = require('body-parser'),
    mongoose = require('mongoose'),
    dotenv = require('dotenv').config();

const pwd = process.env.pwd;
const dbn = process.env.dbn;
const usr = process.env.usr;


const uri = mongo_connection_url




/*======================================================================*/

var app = express();

app.set('port', process.env.PORT || 8080);
app.use(body_parser.json());/*
app.use(express.static(__dirname + '/static', { dotfiles: 'allow' }));*/
app.use(express.static('public'));


const httpsServer = https.createServer({
  key: fs.readFileSync('./privkey.pem'),
  cert: fs.readFileSync('./fullchain.pem'),
}, app);

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SERVER_URL = process.env.SERVER_URL;
const APP_SECRET = process.env.APP_SECRET;

app.listen(app.get('port'), () => {
    console.log('Node app is running on port', app.get('port'));
});

httpsServer.listen(8443, () => {
    console.log('HTTPS Server running on port 8443');
});

module.exports = app;

mongoose.connect(uri, { useNewUrlParser: true });

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
/*====================================================================*/



// Serve the options path and set required headers
app.get('/options', (req, res, next) => {

    let referer = req.get('Referer');
    if (referer) {
        if (referer.indexOf('www.messenger.com') >= 0) {
            res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
        } else if (referer.indexOf('www.facebook.com') >= 0) {
            res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
        }
        res.sendFile('public/options.html', {root: __dirname});
    }
});

// Serve the options path and set required headers
app.get('/privacy', (req, res, next) => {

    
        res.sendFile('public/privacy.html', {root: __dirname});
    
});

// Serve the options path and set required headers
app.get('/add', (req, res, next) => {

    let referer = req.get('Referer');
    if (referer) {
        if (referer.indexOf('www.messenger.com') >= 0) {
            res.setHeader('Content-Security-Policy', 'frame-ancestors https://www.messenger.com/');
        } else if (referer.indexOf('www.facebook.com') >= 0) {
            res.setHeader('Content-Security-Policy', 'frame-ancestors https://www.facebook.com/');
        }
        res.sendFile('public/add.html', {root: __dirname});
    }
});

// Serve the options path and set required headers
app.get('/ask', (req, res, next) => {

    let referer = req.get('Referer');
    if (referer) {
        if (referer.indexOf('www.messenger.com') >= 0) {
            res.setHeader('Content-Security-Policy', 'frame-ancestors https://www.messenger.com/');
        } else if (referer.indexOf('www.facebook.com') >= 0) {
            res.setHeader('Content-Security-Policy', 'frame-ancestors https://www.facebook.com/');
        }
        res.sendFile('public/ask.html', {root: __dirname});
    }
});


// Handle postback from webview
app.get('/askPostback', (req, res) => {
    let body = req.query;
    console.log(body);
    let slob = body.seats > 1 ? "слободни" : "слободно";
    var mesto = body.seats > 1 ? "места" : "место";
    let bagazh = body.bagage == 0 ? "" : "со багаж "; 
    let response = {
        "text": `Вашето барање за ${body.seats} ${slob} ${mesto} од ${body.from} до ${body.to} на ${body.date} во ${body.time} ${bagazh}е внесено во системот. При исполнување на условите за вашето барање ќе ви биде доставена порака за аплицирање за ${slob} ${mesto} кај возачот. Доколку не добиете потврден одговор вашето барање ќе биде сеуште важечко. Ви благодариме што ги користите нашите услуги. Имајте пријатен ден.`
    };

    let test = addRideData(body);
    console.log(test);

    res.status(200).send('Please close this window to return to the conversation thread.');
    callSendAPI(body.psid, response);
});

// Handle postback from webview
app.get('/addPostback', (req, res) => {
    let body = req.query;
    console.log(body);
    let slob = body.seats > 1 ? "слободни" : "слободно";
    var mesto = body.seats > 1 ? "места" : "место";
    let bagazh = body.bagage == 0 ? "" : "со багаж "; 
    let response = {
        "text": `Вашата објава за ${body.seats} ${slob} ${mesto} од ${body.from} до ${body.to} на ${body.date} во ${body.time} ${bagazh}е внесена во системот. Во моментот на совпаѓање на барања за превоз со вашата објава, барателите ќе можат да аплицираат за ${slob} ${mesto}. Исто така ќе добиете порака за внес на ваш контакт број на кој одобрените апликанти ќе можат да ве добијат за финализирање на договорот за превоз. Ви благодариме што ги користите нашите услуги. Имајте пријатен ден.`
    };

    let test = addRideData(body);
    console.log(test);
    res.status(200).send('Please close this window to return to the conversation thread.');
    callSendAPI(body.psid, response);
});

// Accepts POST requests at the /webhook endpoint
app.post('/webhook', (req, res) => {

    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        body.entry.forEach(entry => {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log(`Sender PSID: ${sender_psid}`);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }

        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {

    const VERIFY_TOKEN = process.env.TOKEN;

    // Parse params from the webhook verification request
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Check if a token and mode were sent
    if (mode && token) {

        // Check the mode and token sent are correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Respond with 200 OK and challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});


// Handles messages events
function handleMessage(sender_psid, received_message) {
    let response;

    // Checks if the message contains text
    if (received_message.text) {
        switch (received_message.text.replace(/[^\w\s]/gi, '').trim().toLowerCase()) {
            case "room preferences":
                response = setRoomPreferences(sender_psid);
                callSendAPI(sender_psid, response);
                break;

            case "user":
                get_user_data(sender_psid);
                
            break;

            case "reset":
                setupButtons();
                
            break;

            default:
                response = {
                    "text": `You sent the message: "${received_message.text}".`
                };
                callSendAPI(sender_psid, response);
                break;
        }
    } else {
        response = {
            "text": `Sorry, I don't understand what you mean.`
        }
    }

    // Send the response message
    
}




// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    };
    console.log(request_body);
    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v8.0/me/messages",
        "qs": {"access_token": PAGE_ACCESS_TOKEN},
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}


// Sends response messages via the Send API
function setupButtons() {
    // Construct the message body
    let request_body = {
        "persistent_menu": [
            {
                "locale": "default",
                "composer_input_disabled": false,
                "call_to_actions": [
                    {
                        "type": "web_url",
                        "title": "Нудам Превоз",
                        "url": "https://prevoz.ionitd.com/add",
                        "webview_height_ratio": "tall",
                        messenger_extensions: true
                    },
                    {
                        "type": "web_url",
                        "title": "Барам Превоз",
                        "url": "https://prevoz.ionitd.com/ask",
                        "webview_height_ratio": "tall",
                        messenger_extensions: true
                    },
                    {
                        "type": "web_url",
                        "title": "ION Development",
                        "url": "https://ionitd.com",
                        "webview_height_ratio": "tall",
                        messenger_extensions: true,
                    }
                ]
            }
        ]
    };
    console.log(JSON.stringify(request_body));
    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v8.0/me/messenger_profile",
        "qs": {"access_token": PAGE_ACCESS_TOKEN},
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('Buttons set!')
            console.log(body)
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}


// Sends response messages via the Send API
function personalizedMenu() {
    // Construct the message body
    let request_body = {
        "psid": sender_psid,
        "persistent_menu": [
            {
                "locale": "default",
                "composer_input_disabled": false,
                "call_to_actions": [
                    {
                        "type": "web_url",
                        "title": "Нудам Превоз",
                        "url": "https://prevoz.ionitd.com/add",
                        "webview_height_ratio": "tall",
                        messenger_extensions: true
                    },
                    {
                        "type": "web_url",
                        "title": "Барам Превоз",
                        "url": "https://prevoz.ionitd.com/ask",
                        "webview_height_ratio": "tall",
                        messenger_extensions: true
                    },
                    {
                        "type": "web_url",
                        "title": "Мој Профил",
                        "url": "https://prevoz.ionitd.com/profile",
                        "webview_height_ratio": "tall",
                        messenger_extensions: true
                    },
                    {
                        "type": "web_url",
                        "title": "ION Development",
                        "url": "https://ionitd.com",
                        "webview_height_ratio": "full",
                        messenger_extensions: true
                    }
                ]
            }
        ]
    };
    console.log(JSON.stringify(request_body));
    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v8.0/me/custom_user_settings",
        "qs": {"access_token": PAGE_ACCESS_TOKEN},
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('Buttons set!')
            console.log(body)
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}


// Sends response messages via the Send API
function get_user_data(sender_psid) {
    // Construct the message body
    console.log("Trying to fetch user data"+sender_psid);
    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/"+sender_psid,
        "qs": {"access_token": PAGE_ACCESS_TOKEN,"fields" : "first_name,last_name,profile_pic"},
        "method": "GET"
    }, (err, res, body) => {

        if (!err) {
            let user = JSON.parse(body);
            console.log("User data fetched");
            
            callSendAPI(sender_psid, {
                    "text": `Hello ${user.first_name}`
                });
            
        } else {
            console.error("Unable to get user data:" + err);
        }
    });
}


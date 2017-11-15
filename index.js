'use strict';

// Imports dependencies and set up http server
const
    express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express().use(bodyParser.json()); // creates express http server

const PAGE_ACCESS_TOKEN = 'EAABor9cCoj0BAHqXZCvwlcsSZC6S0r7ntz59EnN90rqpYLQhwYZCdU1s8j0RuP6rWEJWeNwYhUZB1wyczIESu0ZBiaEWs5AfZBkoOD1OFG2TpLWZCjCiS9ebQC288RI4aNyrfqdxQPgkuftDrARKLGZB6ZCZChDACcyEo02SD2ZByZAKNGaMpYIBlEuL';

app.get('/', function(req,res){
    res.send("Hello Bot!");
});

// Creates the endpoint for our webhook
app.post('/webhook/', function(req, res) {

    var body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Gets the message. entry.messaging is an array, but
            // will only ever contain one message, so we get index 0
            var webhookEvent = entry.messaging[0];
            var sender_psid = webhookEvent.sender.id;

            if (webhookEvent.message) {
                handleMessage(sender_psid, webhookEvent.message);
            } else if (webhookEvent.postback) {
                handlePostback(sender_psid, webhookEvent.postback);
            }
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

function handleMessage(sender_psid, received_message) {

    var response;

    // Check if the message contains text
    if (received_message.text) {

        // Create the payload for a basic text message
        response = {
            "text": 'You sent the message: "${received_message.text}". Now send me an image!'
        }
    }

    // Sends the response message
    callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
    var response;

    // Get the payload for the postback
    var payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
        response = { "text": "Thanks!" }
    } else if (payload === 'no') {
        response = { "text": "Oops, try sending another image." }
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
    // Construct the message body
    var request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    };

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, function(err, res, body) {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

// Adds support for GET requests to our webhook
app.get('/webhook/', function(req, res) {

    // Your verify token. Should be a random string.
    var VERIFY_TOKEN = "Gadgets bot";

    // Parse the query params
    var mode = req.query['hub.mode'];
    var token = req.query['hub.verify_token'];
    var challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});


// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, function (){
    console.log('webhook is listening on PORT 1337');
});
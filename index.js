'use strict';

// Imports dependencies and set up http server
const
    express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express().use(bodyParser.json()); // creates express http server

app.get('/', function(req,res){
    res.send("Hello Bot!");
});

// // Creates the endpoint for our webhook
// app.post('/webhook/', function(req, res) {
//
//     var body = req.body;
//
//     // Checks this is an event from a page subscription
//     if (body.object === 'page') {
//
//         // Iterates over each entry - there may be multiple if batched
//         body.entry.forEach(function(entry) {
//
//             // Gets the message. entry.messaging is an array, but
//             // will only ever contain one message, so we get index 0
//             var webhookEvent = entry.messaging[0];
//             console.log(webhookEvent);
//         });
//
//         // Returns a '200 OK' response to all requests
//         res.status(200).send('EVENT_RECEIVED');
//     } else {
//         // Returns a '404 Not Found' if event is not from a page subscription
//         res.sendStatus(404);
//     }
//
// });

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
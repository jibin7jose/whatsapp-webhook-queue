// Project: WhatsApp Webhook & Background Message Queue
// Filename: server.js
// Author: Jibin Jose

// Load Express.js
const express = require('express');

// Create Express application
const app = express();

// Parse incoming JSON requests
app.use(express.json());

// Webhook verification token
const VERIFY_TOKEN = 'abc123';

// Message queue
const queue = [];

// Store processed message IDs
const seen = new Set();


// ---------- 1. GET /webhook : Verification ----------

app.get('/webhook', (req, res) => {

    const token = req.query['hub.verify_token'];

    if (token === VERIFY_TOKEN) {

        return res.status(200).send(req.query['hub.challenge']);

    }

    return res.status(403).send('forbidden');

});


// ---------- 2. POST /webhook : Receive Messages ----------

app.post('/webhook', (req, res) => {

    // Respond immediately
    res.status(200).send('ok');

    // Extract messages from request body
    const messages =
        req.body?.entry?.[0]?.changes?.[0]?.value?.messages || [];

    // Process each incoming message
    for (const msg of messages) {

        // Check duplicate message ID
        if (seen.has(msg.id)) {

            console.log('duplicate skipped:', msg.id);

        } else {

            // Store message ID
            seen.add(msg.id);

            // Add message to queue
            queue.push(msg);

            console.log('message added to queue:', msg.id);

        }

    }

});


// ---------- 3. Background Worker ----------

// Check queue every second
setInterval(() => {

    // Remove first message from queue
    const msg = queue.shift();

    // Process message
    if (msg) {

        console.log(
            'processing message:',
            msg.id,
            msg.text?.body
        );

    }

}, 1000);


// ---------- 4. Start Express Server ----------

app.listen(3000, () => {

    console.log('server is running on port 3000');

});
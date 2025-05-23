const { TikTokLiveConnection } = require('tiktok-live-connector');
const WebSocket = require('ws');
const uuid = require('uuid');
const wss = new WebSocket.Server({ port: 80 });

let onoff = false;
let tikTokId = "tikTokId";
let connection = new TikTokLiveConnection(tikTokId);

connection.connect().then(() => {
    console.log(`connected to TikTok chat!`);
}).catch(() => {
    console.error(`Connection failed`);
    process.exit(1)
})

wss.on('connection', socket => {
    console.log(`websocket connected`);

    socket.on('message', packet => {
        const pc = JSON.parse(packet);
        pc = JSON.parse(packet);

        if (pc.body.type === 'chat') {
            const msg = pc.body.message;

            if (msg === 'onoff') {
                onoff = !onoff;

                if (onoff) {
                    console.log(`TikTok chat is on now`);
                } else {
                    console.log(`TikTok chat is off now`);
                }
            }
        }
    });

    socket.on('close', () => {
        console.log(`websocket connection lost`)
        process.exit(0)
    });

    connection.on('chat', data => {
        if (onoff) {
            console.log(`[ TikTok ] ${data.user.nickname} : ${data.comment}`);
            command(`me "[ TikTok ] ${data.user.nickname} : ${data.comment}"`)
        }
    });

    function command(cmd) {
        const msg = {
            "header": {
                "version": 1,
                "requestId": uuid.v4(),
                "messagePurpose": "commandRequest",
                "messageType": "commandRequest"
            },
            "body": {
                "version": 1,
                "commandLine": cmd,
                "origin": {
                    "type": "player"
                }
            }
        }
        socket.send(JSON.stringify(msg))
    }

    socket.send(JSON.stringify({
        "header": {
            "version": 1,
            "requestId": uuid.v4(),
            "messageType": "commandRequest",
            "messagePurpose": "subscribe"
        },
        "body": {
            "eventName": "PlayerMessage"
        },
    }))
});

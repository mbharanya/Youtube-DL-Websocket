const fs = require('fs');
const WebSocket = require('ws');
const { spawn } = require('child_process');

const bodyParser = require('body-parser');
const express = require('express');
const expressApp = express();

expressApp.use(
    express.static('public'),
    bodyParser.json()
)

const server = require('http').createServer();

const wss = new WebSocket.Server({
    server: server
});

server.on('request', expressApp);

const downloadPath = process.env.DOWNLOAD_PATH || '/output';

wss.on('connection', (ws) => {
    console.log("Received wss connection");
    ws.on('message', (downloadUrl) => {
        console.debug(`Received message: ${downloadUrl}`);

        const process = spawn('youtube-dl', [downloadUrl, '-o', downloadPath + '/%(title)s.%(ext)s']);

        process.stdout.on('data', (data) => {
            let dataStr = data.toString()
            if (dataStr.startsWith('[download]') > -1) {
                dataStr = `${downloadUrl} ${dataStr}`
            }
            ws.send(dataStr);
        });

        process.stderr.on('data', (data) => {
            ws.send(data.toString());
        });

        process.on('close', (code) => {
            ws.send("process closed with code " + code);
        });

    });
});

wss.on("close", () => {
    console.log("server closed");
});


server.listen(8081, function () {
    console.log(`http/ws server listening on 8081`);
});
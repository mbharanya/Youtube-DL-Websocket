const WebSocket = require('ws');
const { spawn } = require('child_process');

const wss = new WebSocket.Server({ port: 7071 });
const downloadPath = process.env.DOWNLOAD_PATH || '/output';

wss.on('connection', (ws) => {
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
  clients.delete(ws);
});

console.log("wss up");
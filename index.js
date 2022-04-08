const proxy = require('http2-proxy')
const http2 = require('http2');
const path = require('path');
const mime = require('mime-types');
const fs = require('fs');


const {
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_METHOD,
    HTTP_STATUS_NOT_FOUND,
    HTTP_STATUS_INTERNAL_SERVER_ERROR
} = http2.constants;
const options = {
    key: fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-cert.pem')
};

// Create a secure HTTP/2 server
const server = http2.createSecureServer(options);

server.listen(8081);

const serverRoot = "./app";

console.log('server up');


server.on('stream', (stream, headers) => {
    const reqPath = headers[HTTP2_HEADER_PATH];
    const reqMethod = headers[HTTP2_HEADER_METHOD];

    const fullPath = path.join(serverRoot, reqPath);
    const responseMimeType = mime.lookup(fullPath);

    if (reqPath === "/" && reqMethod === 'GET') {
        stream.respondWithFile(path.join(serverRoot, "index.html"), {
            'content-type': "text/html"
        }, {
            onError: (err) => respondToStreamError(err, stream)
        });
    } else {
        stream.respondWithFile(fullPath, {
            'content-type': responseMimeType
        }, {
            onError: (err) => respondToStreamError(err, stream)
        });
    }
});

function respondToStreamError(err, stream) {
    console.log(err);
    if (err.code === 'ENOENT') {
        stream.respond({ ":status": HTTP_STATUS_NOT_FOUND });
    } else {
        stream.respond({ ":status": HTTP_STATUS_INTERNAL_SERVER_ERROR });
    }
    stream.end();
}

const defaultWSHandler = (err, req, socket, head) => {
    if (err) {
        console.error('proxy error', err);
        socket.destroy();
    }
};

server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head, {
        hostname: 'localhost',
        port: 7071
    }, defaultWSHandler)
})
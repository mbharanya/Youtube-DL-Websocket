(async function () {

    const ws = await connectToServer();

    ws.onmessage = (webSocketMessage) => {
        const resultsElement = document.getElementById("results");
        if (webSocketMessage.data.indexOf("[download]") > -1) {
            document.getElementById("progress").textContent = webSocketMessage.data;
        } else {
            resultsElement.textContent += webSocketMessage.data + "\n";
        }
    };

    async function connectToServer() {
        let wsProtocol = "ws:"
        if (location.protocol === 'https:') {
            wsProtocol = "wss:"
        }

        const ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws`);
        return new Promise((resolve, reject) => {
            const timer = setInterval(() => {
                if (ws.readyState === 1) {
                    clearInterval(timer);
                    resolve(ws);
                }
            }, 10);
        });
    }

    const form = document.getElementById("download-form");

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const url = formData.get("url")

        ws.send(url);   
    });
})();

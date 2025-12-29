const TENANT = "pink-snakes";
const TOPIC = "socket";
const TOKEN = "KNvNBaUNRA2OQJG3xlseVkVR";
const BASE_URL = `wss://${TENANT}-blabber.staging-cloud.nussknacker.io/stream/${TOPIC}`;

let ws;
let reconnectTimer;

const connect = () => {
    if (document.visibilityState !== "visible") return;

    const storedId = localStorage.getItem("subscriptionId");
    const url = new URL(BASE_URL);
    if (TOKEN) url.searchParams.set("token", TOKEN);
    if (storedId) url.searchParams.set("subscriptionId", storedId);

    ws = new WebSocket(url.toString());

    ws.addEventListener("message", e => {
        try {
            const {data, subscriptionId, type} = JSON.parse(e.data);
            switch (type) {
                case "session": {
                    localStorage.setItem("subscriptionId", subscriptionId);
                    return;
                }
                case "message": {
                    document.getElementById("test").innerText = data;
                    return;
                }
            }
        } catch (e) {
        }
    });

    ws.addEventListener("close", scheduleReconnect);
    ws.addEventListener("error", () => ws.close());
};

const scheduleReconnect = () => {
    if (reconnectTimer) return;

    reconnectTimer = setInterval(() => {
        if (document.visibilityState === "visible") {
            clearInterval(reconnectTimer);
            reconnectTimer = null;
            connect();
        }
    }, 1000);
};

document.addEventListener("visibilitychange", () => {
    if (
        document.visibilityState === "visible" &&
        (!ws || ws.readyState === WebSocket.CLOSED)
    ) {
        connect();
    }
});

connect();

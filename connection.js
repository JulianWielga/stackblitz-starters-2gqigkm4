import {readDataMessage} from "./readDataMessage.js";
import {readSubscriptionId, storeSubscriptionId} from "./subscriptionIdStore.js";

import {BASE_URL, TOKEN} from "./env.js";

let ws;
let reconnectTimer;

const connect = () => {
    if (document.visibilityState !== "visible") return;

    const subscription = readSubscriptionId();
    const url = new URL(BASE_URL);
    if (TOKEN) url.searchParams.set("token", TOKEN);
    if (subscription) url.searchParams.set("subscriptionId", subscription);

    ws = new WebSocket(url.toString());

    ws.addEventListener("message", e => {
        try {
            const {data, subscriptionId, type} = JSON.parse(e.data);
            switch (type) {
                case "session": {
                    return storeSubscriptionId(subscriptionId);
                }
                case "message": {
                    return readDataMessage(data);
                }
            }
        } catch (e) {
            // Ignoring parse errors
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

export function initializeConnection() {
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && (!ws || ws.readyState === WebSocket.CLOSED)) {
            connect();
        }
    });

    connect();
}

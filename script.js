const tenant = "pink-snakes";
const topic = "socket";
const token = "KNvNBaUNRA2OQJG3xlseVkVR";
const storedId = localStorage.getItem("subscriptionId");
const url = new URL(
    `wss://${tenant}-blabber.staging-cloud.nussknacker.io/stream/${topic}`
);
if (token) url.searchParams.set("token", token);
if (storedId) url.searchParams.set("subscriptionId", storedId);
const ws = new WebSocket(url);

ws.onmessage = (e) => {
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
};

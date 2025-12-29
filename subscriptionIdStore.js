export function storeSubscriptionId(subscriptionId) {
    localStorage.setItem("subscriptionId", subscriptionId);
    localStorage.setItem("subscriptionId_ts", Date.now());
}

export function readSubscriptionId(maxAgeMs = 300000) {
    const raw = localStorage.getItem("subscriptionId");
    const ts = localStorage.getItem("subscriptionId_ts");
    if (!raw || !ts || Date.now() - Number(ts) > maxAgeMs) {
        localStorage.removeItem("subscriptionId");
        localStorage.removeItem("subscriptionId_ts");
        return null;
    }
    return raw;
}

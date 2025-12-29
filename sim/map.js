import { createRandomRoute } from "./route.js";
import { createCarMarker } from "./car.js";

export function initializeMap() {
    const map = L.map("map");

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
    }).addTo(map);

    const car = createCarMarker(map);
    createRandomRoute(map, car.marker);

    return { map, carId: car.id };
}

import { createRandomRoute } from "./route.js";
import { createCarMarker } from "./car.js";

export function initializeMap(getOnCarUpdate) {
    const map = L.map("map");

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
    }).addTo(map);

    const car = createCarMarker(map);
    const sim = { map, carId: car.id };

    createRandomRoute(map, car.marker, getOnCarUpdate(sim));

    return sim;
}

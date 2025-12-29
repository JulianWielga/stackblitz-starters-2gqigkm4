import { createRandomRoute } from "./route.js";
import { createCarMarker } from "./car.js";

export function initializeMap(getCarUpdate) {
    const map = L.map("map");

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
    }).addTo(map);

    const car = createCarMarker(map);
    createRandomRoute(map, car.marker, getCarUpdate(map, car.id));

    return { map, carId: car.id };
}

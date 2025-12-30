import { createRandomRoute } from "./route.js";
import { createCarMarker } from "./car.js";

export function initializeMap(getOnCarUpdate) {
    const map = L.map("map", {
        zoomControl: false,
        zoomSnap: 0,
        zoom: 20,
    });

    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    if (map.tap) map.tap.disable();
    document.getElementById("map").style.cursor = "default";

    L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_toner_dark/{z}/{x}/{y}{r}.{ext}", {
        minZoom: 0,
        maxZoom: 20,
        attribution:
            '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: "png",
    }).addTo(map);

    const car = createCarMarker(map);
    const sim = { map, carId: car.id };

    createRandomRoute(map, car.marker, getOnCarUpdate(sim));

    return sim;
}

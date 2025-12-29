import { animateCar } from "./car.js";
import { randomizePoint } from "./utils.js";

const MAP_FIT_BOUNDS_PADDING_VALUE = 50;

export function createRandomRoute(map, carMarker, onCarUpdate) {
    const routingControl = L.Routing.control({});

    function planNextTrip() {
        const startPoint = randomizePoint(carMarker.getLatLng());
        const endPoint = randomizePoint(startPoint);
        routingControl.setWaypoints([startPoint, endPoint]);
    }

    routingControl.on("routesfound", function (e) {
        const route = e.routes[0];
        animateCar(map, carMarker, e.routes[0], planNextTrip, onCarUpdate);
    });

    planNextTrip();
}

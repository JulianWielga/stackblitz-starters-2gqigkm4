import { animateCar } from "./car.js";
import { randomizePoint } from "./utils.js";

export function createRandomRoute(map, carMarker, onCarUpdate) {
    const routingControl = L.Routing.control({});

    function planNextTrip(first) {
        const startPoint = first ? randomizePoint(carMarker.getLatLng()) : carMarker.getLatLng();
        const endPoint = randomizePoint(startPoint);
        routingControl.setWaypoints([startPoint, endPoint]);
    }

    routingControl.on("routesfound", function (e) {
        animateCar(map, carMarker, e.routes[0], planNextTrip, onCarUpdate);
    });

    planNextTrip(true);
}

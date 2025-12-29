import { animateCar } from "./car.js";
import { RANDOM_DISTANCE_KM } from "../env.js";

// Helper function to convert degrees to radians
function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

// Helper function to convert radians to degrees
function toDegrees(radians) {
    return (radians * 180) / Math.PI;
}

// --- Configuration Constants ---
const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers
const MIN_RANDOM_DISTANCE_KM = RANDOM_DISTANCE_KM / 10; // Minimum random distance for a trip in kilometers
const RANDOM_DISTANCE_RANGE_KM = RANDOM_DISTANCE_KM * 1.5; // Range of random distance for a trip in kilometers (e.g., 0.5 + 1.5 = 2 km max)
const MAP_FIT_BOUNDS_PADDING_VALUE = 50; // Padding for map.fitBounds in pixels
// --- End Configuration Constants ---

/**
 * Calculates the destination point given a starting point, bearing, and distance.
 * @param {object} point - The starting point {lat, lng}.
 * @param {number} bearing - The bearing in degrees.
 * @param {number} distance - The distance in kilometers.
 * @returns {object} The destination point {lat, lng}.
 */
function calculateDestinationPoint(point, bearing, distance) {
    const R = EARTH_RADIUS_KM;
    const lat1 = toRadians(point.lat);
    const lon1 = toRadians(point.lng);
    const brng = toRadians(bearing);

    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / R) + Math.cos(lat1) * Math.sin(distance / R) * Math.cos(brng));

    const lon2 =
        lon1 +
        Math.atan2(Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat1), Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2));

    return {
        lat: toDegrees(lat2),
        lng: toDegrees(lon2),
    };
}

export function createRandomRoute(map, carMarker, onCarUpdate) {
    let destinationMarker;
    let routingControl;

    function planNextTrip() {
        const startPoint = carMarker.getLatLng();

        // 1. Calculate new end point
        const distance = Math.random() * RANDOM_DISTANCE_RANGE_KM + MIN_RANDOM_DISTANCE_KM;
        const bearing = Math.random() * 360;
        const endPointData = calculateDestinationPoint({ lat: startPoint.lat, lng: startPoint.lng }, bearing, distance);
        const endPoint = L.latLng(endPointData.lat, endPointData.lng);

        // 2. Update destination marker (this will be further corrected by routesfound event)
        if (destinationMarker) {
            destinationMarker.setLatLng(endPoint);
        } else {
            destinationMarker = L.marker(endPoint).addTo(map).bindPopup("Destination");
        }

        // 3. Update routing control
        routingControl.setWaypoints([startPoint, endPoint]);
    }

    routingControl = L.Routing.control({
        createMarker: () => null,
    }).addTo(map);

    routingControl.on("routesfound", function (e) {
        const route = e.routes[0];
        const bounds = L.latLngBounds(route.coordinates);
        map.fitBounds(bounds, {
            padding: [MAP_FIT_BOUNDS_PADDING_VALUE, MAP_FIT_BOUNDS_PADDING_VALUE],
        }); // Add padding

        // Correct the destination marker to the actual end of the found route
        const actualEndOfRoute = route.coordinates[route.coordinates.length - 1];
        if (destinationMarker) {
            destinationMarker.setLatLng(actualEndOfRoute);
        } else {
            // This case should ideally not happen if destinationMarker is always created in planNextTrip
            destinationMarker = L.marker(actualEndOfRoute).addTo(map).bindPopup("Destination");
        }

        animateCar(carMarker, e.routes[0], planNextTrip, onCarUpdate);
    });

    // Start the first trip
    planNextTrip();
}

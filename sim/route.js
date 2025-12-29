import { createCarMarker, animateCar } from './car.js';

// Helper function to convert degrees to radians
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

// Helper function to convert radians to degrees
function toDegrees(radians) {
    return radians * 180 / Math.PI;
}

/**
 * Calculates the destination point given a starting point, bearing, and distance.
 * @param {object} point - The starting point {lat, lng}.
 * @param {number} bearing - The bearing in degrees.
 * @param {number} distance - The distance in kilometers.
 * @returns {object} The destination point {lat, lng}.
 */
function calculateDestinationPoint(point, bearing, distance) {
    const R = 6371; // Earth's radius in kilometers
    const lat1 = toRadians(point.lat);
    const lon1 = toRadians(point.lng);
    const brng = toRadians(bearing);

    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / R) +
        Math.cos(lat1) * Math.sin(distance / R) * Math.cos(brng));

    const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat1),
        Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2));

    return {
        lat: toDegrees(lat2),
        lng: toDegrees(lon2)
    };
}


export function createRandomRoute(map) {
    let carMarker;
    let destinationMarker;
    let routingControl;

    const cities = [
        { name: "Warsaw", lat: 52.2297, lng: 21.0122 },
        { name: "Berlin", lat: 52.5200, lng: 13.4050 },
        { name: "Paris", lat: 48.8566, lng: 2.3522 },
        { name: "Madrid", lat: 40.4168, lng: -3.7038 },
        { name: "Rome", lat: 41.9028, lng: 12.4964 },
        { name: "London", lat: 51.5074, lng: -0.1278 },
        { name: "Prague", lat: 50.0755, lng: 14.4378 },
        { name: "Vienna", lat: 48.2082, lng: 16.3738 }
    ];

    function planNextTrip() {
        const startPoint = carMarker.getLatLng();

        // 1. Calculate new end point
        const distance = Math.random() * 1.5 + 0.5; // 0.5-2 km
        const bearing = Math.random() * 360;
        const endPointData = calculateDestinationPoint({ lat: startPoint.lat, lng: startPoint.lng }, bearing, distance);
        const endPoint = L.latLng(endPointData.lat, endPointData.lng);

        // 2. Update destination marker
        if (destinationMarker) {
            destinationMarker.setLatLng(endPoint);
        } else {
            destinationMarker = L.marker(endPoint).addTo(map).bindPopup("Destination");
        }

        // 3. Update routing control
        routingControl.setWaypoints([
            startPoint,
            endPoint
        ]);
    }

    // Pick a random city for the very first start point
    const initialStartPoint = cities[Math.floor(Math.random() * cities.length)];
    carMarker = createCarMarker(map, initialStartPoint);

    routingControl = L.Routing.control({
        createMarker: () => null
    }).addTo(map);

    routingControl.on('routesfound', function(e) {
        const route = e.routes[0];
        const bounds = L.latLngBounds(route.coordinates);
        map.fitBounds(bounds, { padding: [50, 50] }); // Add padding

        animateCar(map, carMarker, e.routes[0], planNextTrip);
    });

    // Start the first trip
    planNextTrip();
}

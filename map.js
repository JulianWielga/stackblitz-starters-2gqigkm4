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


export function initializeMap() {
    const map = L.map('map');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

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

    // Pick a random city from the list
    const startPoint = cities[Math.floor(Math.random() * cities.length)];

    // Random distance between 10 and 15 km
    const distance = Math.random() * 5 + 10;
    // Random bearing
    const bearing = Math.random() * 360;

    const endPoint = calculateDestinationPoint(startPoint, bearing, distance);

    const point1 = L.latLng(startPoint.lat, startPoint.lng);
    const point2 = L.latLng(endPoint.lat, endPoint.lng);

    L.marker(point1).addTo(map).bindPopup("Point 1");
    L.marker(point2).addTo(map).bindPopup("Point 2");

    const bounds = L.latLngBounds(point1, point2);
    map.fitBounds(bounds);
}
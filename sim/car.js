// Helper function to interpolate a point at a given distance on a polyline
function getPointAtDistance(coords, distance) {
    if (!coords || coords.length < 2) {
        return null;
    }

    let accumulatedDistance = 0;
    for (let i = 0; i < coords.length - 1; i++) {
        const from = coords[i];
        const to = coords[i + 1];
        const segmentDistance = from.distanceTo(to); // distance in meters

        if (accumulatedDistance + segmentDistance >= distance) {
            const ratio = (distance - accumulatedDistance) / segmentDistance;
            return L.latLng(
                from.lat + (to.lat - from.lat) * ratio,
                from.lng + (to.lng - from.lng) * ratio
            );
        }
        accumulatedDistance += segmentDistance;
    }

    // If distance is out of bounds, return the last point
    return coords[coords.length - 1];
}

export function createCarMarker(map, startPosition) {
    const carIcon = L.icon({
        iconUrl: 'https://icons.iconarchive.com/icons/fa-team/fontawesome/128/FontAwesome-Car-icon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    return L.marker(startPosition, {icon: carIcon}).addTo(map);
}

export function animateCar(carMarker, route, onComplete) {
    const coordinates = route.coordinates;
    const totalDistance = route.summary.totalDistance; // in meters
    const speed = 80 * 1000 / 3600; // 80 km/h in m/s
    const duration = totalDistance / speed * 1000; // in milliseconds

    let startTime = null;

    function animate(timestamp) {
        if (!startTime) {
            startTime = timestamp;
        }

        const elapsedTime = timestamp - startTime;
        const progress = elapsedTime / duration;

        if (progress < 1) {
            const distanceCovered = totalDistance * progress;
            const newPosition = getPointAtDistance(coordinates, distanceCovered);
            if (newPosition) {
                carMarker.setLatLng(newPosition);
            }
            requestAnimationFrame(animate);
        } else {
            // Animation finished, place car at the end
            carMarker.setLatLng(coordinates[coordinates.length - 1]);
            if (onComplete) {
                onComplete();
            }
        }
    }

    requestAnimationFrame(animate);
}
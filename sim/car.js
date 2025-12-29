import {performCarAction} from "./performCarAction.js";

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

export function animateCar(map, carMarker, route, onComplete) {
    const coordinates = route.coordinates;
    const totalRouteDistance = route.summary.totalDistance; // in meters

    let totalDistanceCovered = 0;
    let lastTimestamp = null;
    let actionInterval;
    let currentSpeed_kmh = 0;
    let tripStartTime = null;

    function getCurrentSpeed(time_s) {
        const baseSpeed_kmh = (50 + 120) / 2; // 85
        const amplitude_kmh = (120 - 50) / 2; // 35

        // Introduce multiple sine waves for more varied, yet smooth, fluctuation
        // Wave 1: Higher frequency for faster changes
        const frequency1 = 0.5;
        const speedComponent1 = amplitude_kmh * 0.7 * Math.sin(time_s * frequency1);

        // Wave 2: Lower frequency for longer, underlying trends (smoother randomness)
        const frequency2 = 0.2;
        const speedComponent2 = amplitude_kmh * 0.3 * Math.sin(time_s * frequency2 + Math.PI / 4);

        let combinedSpeed = baseSpeed_kmh + speedComponent1 + speedComponent2;

        // Ensure speed stays within bounds [50, 120] km/h
        combinedSpeed = Math.max(50, Math.min(120, combinedSpeed));

        return combinedSpeed;
    }

    function animate(timestamp) {
        if (!lastTimestamp) {
            lastTimestamp = timestamp;
            tripStartTime = timestamp;
            requestAnimationFrame(animate);
            return;
        }

        const deltaTime_s = (timestamp - lastTimestamp) / 1000;
        const tripTime_s = (timestamp - tripStartTime) / 1000;

        // Update current speed based on smooth fluctuation
        currentSpeed_kmh = getCurrentSpeed(tripTime_s);
        const currentSpeed_mps = currentSpeed_kmh * 1000 / 3600;

        const distanceIncrement = currentSpeed_mps * deltaTime_s;
        totalDistanceCovered += distanceIncrement;

        if (totalDistanceCovered < totalRouteDistance) {
            const newPosition = getPointAtDistance(coordinates, totalDistanceCovered);
            if (newPosition) {
                carMarker.setLatLng(newPosition);
            }
            lastTimestamp = timestamp;
            requestAnimationFrame(animate);
        } else {
            // Animation finished
            clearInterval(actionInterval);
            carMarker.setLatLng(coordinates[coordinates.length - 1]);

            performCarAction(map, carMarker.getLatLng(), 0);

            if (onComplete) {
                onComplete();
            }
        }
    }

    actionInterval = setInterval(() => {
        performCarAction(map, carMarker.getLatLng(), Math.round(currentSpeed_kmh));
    }, 2000);

    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 5000);
}

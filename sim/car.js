import {performCarAction} from "../performCarAction.js";

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

// Helper function to calculate the total distance of a polyline
function calculatePolylineDistance(coords) {
    let totalDistance = 0;
    if (!coords || coords.length < 2) {
        return totalDistance;
    }
    for (let i = 0; i < coords.length - 1; i++) {
        totalDistance += coords[i].distanceTo(coords[i + 1]);
    }
    return totalDistance;
}

export function createCarMarker(map, startPosition) {
    const carIcon = L.icon({
        iconUrl: 'https://icons.iconarchive.com/icons/fa-team/fontawesome/128/FontAwesome-Car-icon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    return L.marker(startPosition, {icon: carIcon}).addTo(map);
}

const MAX_SPEED_KMH = 130; // Maximum speed in km/h
const MAX_SPEED_MPS = MAX_SPEED_KMH * 1000 / 3600; // Maximum speed in m/s
const MIN_SPEED_KMH = 10; // Minimum speed in km/h
const MIN_SPEED_MPS = MIN_SPEED_KMH * 1000 / 3600; // Minimum speed in m/s
const ACCELERATION_MPS2 = 1.5; // Acceleration in m/s^2
const DECELERATION_MPS2 = 2.0; // Deceleration in m/s^2
const ACTION_INTERVAL_MS = 2000; // Interval for performCarAction in milliseconds

// New configurable constants
const STOPPING_BUFFER_METERS = 0.25; // Small buffer for precision when calculating stopping distance
const FLOATING_POINT_TOLERANCE_METERS = 0.01; // Tolerance for floating point comparisons at the end of the route
const FLUCTUATING_SPEED_THRESHOLD_MULTIPLIER = 1.5; // Multiplier for MIN_SPEED_MPS to determine when to start fluctuating speed

function getFluctuatingSpeed_kmh(tripTime_s) {
    const baseSpeed_kmh = (MIN_SPEED_KMH + MAX_SPEED_KMH) / 2;
    const amplitude_kmh = (MAX_SPEED_KMH - MIN_SPEED_KMH) / 2;

    // Introduce multiple sine waves for more varied, yet smooth, fluctuation
    const frequency1 = 0.5;
    const speedComponent1 = amplitude_kmh * 0.7 * Math.sin(tripTime_s * frequency1);

    const frequency2 = 0.2;
    const speedComponent2 = amplitude_kmh * 0.3 * Math.sin(tripTime_s * frequency2 + Math.PI / 4);

    let combinedSpeed = baseSpeed_kmh + speedComponent1 + speedComponent2;

    // Ensure speed stays within bounds [MIN_SPEED_KMH, MAX_SPEED_KMH]
    combinedSpeed = Math.max(MIN_SPEED_KMH, Math.min(MAX_SPEED_KMH, combinedSpeed));

    return combinedSpeed;
}

export function animateCar(map, carMarker, route, onComplete) {
    const coordinates = route.coordinates;
    const totalRouteDistance = calculatePolylineDistance(coordinates); // Calculate actual distance from coordinates

    let totalDistanceCovered = 0;
    let lastTimestamp = null;
    let currentSpeed_mps = 0;
    let lastActionTime = 0;
    let tripStartTime = null;

    function animate(timestamp) {
        // If animation already finished, just return
        if (totalDistanceCovered >= totalRouteDistance && currentSpeed_mps === 0) {
            return;
        }

        if (!lastTimestamp) {
            lastTimestamp = timestamp;
            tripStartTime = timestamp;
            requestAnimationFrame(animate);
            return;
        }

        const deltaTime_s = (timestamp - lastTimestamp) / 1000;
        const tripTime_s = (timestamp - tripStartTime) / 1000;
        lastTimestamp = timestamp;

        let remainingDistance = totalRouteDistance - totalDistanceCovered;

        // Calculate stopping distance: v^2 = u^2 + 2as => s = v^2 / (2a)
        const requiredStoppingDistance = (currentSpeed_mps * currentSpeed_mps) / (2 * DECELERATION_MPS2);

        let targetSpeed_mps;

        if (remainingDistance <= requiredStoppingDistance + STOPPING_BUFFER_METERS) { // Small buffer for precision
            // Phase 3: Decelerate to stop at the end
            targetSpeed_mps = 0;
        } else if (currentSpeed_mps < MIN_SPEED_MPS * FLUCTUATING_SPEED_THRESHOLD_MULTIPLIER) { // Threshold to get into fluctuating speed range
            // Phase 1: Accelerate initially towards MAX_SPEED
            targetSpeed_mps = MAX_SPEED_MPS;
        } else {
            // Phase 2: Fluctuating speed
            targetSpeed_mps = getFluctuatingSpeed_kmh(tripTime_s) * 1000 / 3600;
        }

        // Adjust current speed towards target speed
        if (currentSpeed_mps < targetSpeed_mps) {
            currentSpeed_mps += ACCELERATION_MPS2 * deltaTime_s;
            currentSpeed_mps = Math.min(currentSpeed_mps, targetSpeed_mps);
            // Ensure minimum speed when accelerating, unless target is 0 (for stopping)
            if (targetSpeed_mps !== 0) {
                currentSpeed_mps = Math.max(currentSpeed_mps, MIN_SPEED_MPS);
            }
        } else if (currentSpeed_mps > targetSpeed_mps) {
            currentSpeed_mps -= DECELERATION_MPS2 * deltaTime_s;
            currentSpeed_mps = Math.max(currentSpeed_mps, targetSpeed_mps);
        }

        // Ensure speed doesn't go below zero
        currentSpeed_mps = Math.max(0.2, currentSpeed_mps); // This line ensures a minimal speed of 1m/s, which should be removed or changed

        // Calculate distance increment based on current speed
        let distanceIncrement = currentSpeed_mps * deltaTime_s;

        // Robust End Condition Check: If the car is effectively at or past the end
        if (totalDistanceCovered + distanceIncrement >= totalRouteDistance - FLOATING_POINT_TOLERANCE_METERS) { // -0.01 for floating point tolerance
            totalDistanceCovered = totalRouteDistance; // Ensure it's exactly at the end
            currentSpeed_mps = 0; // Force speed to zero at destination
            carMarker.setLatLng(coordinates[coordinates.length - 1]);
            performCarAction(map, carMarker.getLatLng(), 0); // Car stopped

            if (onComplete) {
                onComplete();
            }
            return; // Stop animation
        }

        totalDistanceCovered += distanceIncrement;

        const newPosition = getPointAtDistance(coordinates, totalDistanceCovered);
        if (newPosition) {
            carMarker.setLatLng(newPosition);
        }

        // Call performCarAction at regular intervals
        if (timestamp - lastActionTime >= ACTION_INTERVAL_MS) {
            performCarAction(map, carMarker.getLatLng(), Math.round(currentSpeed_mps * 3.6)); // Convert m/s to km/h
            lastActionTime = timestamp;
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}


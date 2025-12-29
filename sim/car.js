import { ACTION_INTERVAL_MS, TIME_SCALE } from "../env.js";
import { CITIES } from "./CITIES.js";
import { generateHash } from "../utils.js";
import { calculatePolylineDistance, getPointAtDistance, getBearing, normalizeAngle } from "./utils.js";

export function createCarMarker(map, startPosition) {
    const id = generateHash();

    startPosition ||= CITIES[Math.floor(Math.random() * CITIES.length)];

    const w = 140 / 6;
    const h = 280 / 6;
    const carIcon = L.icon({
        iconUrl: "sim/cars/blue.png",
        iconSize: [w, h],
        iconAnchor: [w * 0.5, h * 0.5],
    });

    const marker = L.marker(startPosition, { icon: carIcon, interactive: false }).addTo(map);

    return { id, marker };
}

const MAX_SPEED_KMH = 130;
const MAX_SPEED_MPS = (MAX_SPEED_KMH * 1000) / 3600;
const MIN_SPEED_KMH = 10;
const MIN_SPEED_MPS = (MIN_SPEED_KMH * 1000) / 3600;
const ACCELERATION_MPS2 = 1.5;
const DECELERATION_MPS2 = 2.0;

const STOPPING_BUFFER_METERS = 0.25;
const FLOATING_POINT_TOLERANCE_METERS = 0.01;
const FLUCTUATING_SPEED_THRESHOLD_MULTIPLIER = 1.5;

function getFluctuatingSpeed_kmh(tripTime_s) {
    const baseSpeed_kmh = (MIN_SPEED_KMH + MAX_SPEED_KMH) / 2;
    const amplitude_kmh = (MAX_SPEED_KMH - MIN_SPEED_KMH) / 2;

    const frequency1 = 0.5;
    const speedComponent1 = amplitude_kmh * 0.7 * Math.sin(tripTime_s * frequency1);

    const frequency2 = 0.2;
    const speedComponent2 = amplitude_kmh * 0.3 * Math.sin(tripTime_s * frequency2 + Math.PI / 4);

    let combinedSpeed = baseSpeed_kmh + speedComponent1 + speedComponent2;

    combinedSpeed = Math.max(MIN_SPEED_KMH, Math.min(MAX_SPEED_KMH, combinedSpeed));

    return combinedSpeed;
}

export function animateCar(carMarker, route, onComplete, onCarUpdate) {
    const coordinates = route.coordinates;
    const totalRouteDistance = calculatePolylineDistance(coordinates);

    let totalDistanceCovered = 0;
    let lastTimestamp = null;
    let currentSpeed_mps = 0;
    let lastActionTime = 0;
    let tripStartTime = null;
    let previousPosition = carMarker.getLatLng();
    let smoothedBearing = 0; // Initialize smoothedBearing

    function animate(timestamp) {
        if (totalDistanceCovered >= totalRouteDistance && currentSpeed_mps === 0) {
            return;
        }

        if (!lastTimestamp) {
            lastTimestamp = timestamp;
            tripStartTime = timestamp;
            smoothedBearing = getBearing(coordinates[0], coordinates[1] || coordinates[0]); // Initialize with first actual bearing
            requestAnimationFrame(animate);
            return;
        }

        const rawDeltaTime_s = (timestamp - lastTimestamp) / 1000;
        const effectiveDeltaTime_s = rawDeltaTime_s * TIME_SCALE;
        const tripTime_s = (timestamp - tripStartTime) / 1000;
        lastTimestamp = timestamp;

        let remainingDistance = totalRouteDistance - totalDistanceCovered;

        const requiredStoppingDistance = (currentSpeed_mps * currentSpeed_mps) / (2 * DECELERATION_MPS2);

        let targetSpeed_mps;

        if (remainingDistance <= requiredStoppingDistance + STOPPING_BUFFER_METERS) {
            targetSpeed_mps = 0;
        } else if (currentSpeed_mps < MIN_SPEED_MPS * FLUCTUATING_SPEED_THRESHOLD_MULTIPLIER) {
            targetSpeed_mps = MAX_SPEED_MPS;
        } else {
            targetSpeed_mps = (getFluctuatingSpeed_kmh(tripTime_s) * 1000) / 3600;
        }

        // Adjust current speed towards target speed
        if (currentSpeed_mps < targetSpeed_mps) {
            currentSpeed_mps += ACCELERATION_MPS2 * effectiveDeltaTime_s;
            currentSpeed_mps = Math.min(currentSpeed_mps, targetSpeed_mps);
            if (targetSpeed_mps !== 0) {
                currentSpeed_mps = Math.max(currentSpeed_mps, MIN_SPEED_MPS);
            }
        } else if (currentSpeed_mps > targetSpeed_mps) {
            currentSpeed_mps -= DECELERATION_MPS2 * effectiveDeltaTime_s;
            currentSpeed_mps = Math.max(currentSpeed_mps, targetSpeed_mps);
        }

        currentSpeed_mps = Math.max(0.2, currentSpeed_mps);

        let distanceIncrement = currentSpeed_mps * effectiveDeltaTime_s;

        if (totalDistanceCovered + distanceIncrement >= totalRouteDistance - FLOATING_POINT_TOLERANCE_METERS) {
            totalDistanceCovered = totalRouteDistance;
            currentSpeed_mps = 0;
            carMarker.setLatLng(coordinates[coordinates.length - 1]);
            onCarUpdate(carMarker.getLatLng(), 0);

            if (onComplete) {
                onComplete();
            }
            return;
        }

        totalDistanceCovered += distanceIncrement;

        const newPosition = getPointAtDistance(coordinates, totalDistanceCovered);
        if (newPosition) {
            carMarker.setLatLng(newPosition);
            const targetBearing = getBearing(previousPosition, newPosition);

            const angleDiff = normalizeAngle(targetBearing - smoothedBearing);
            smoothedBearing += angleDiff * 0.1; // Smoothing factor

            carMarker.setRotationAngle(smoothedBearing);
            previousPosition = newPosition;
        }

        if (timestamp - lastActionTime >= ACTION_INTERVAL_MS) {
            onCarUpdate(carMarker.getLatLng(), Math.round(currentSpeed_mps * 3.6));
            lastActionTime = timestamp;
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

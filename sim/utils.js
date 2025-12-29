import { RANDOM_DISTANCE_KM } from "../env.js";

function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

function toDegrees(radians) {
    return (radians * 180) / Math.PI;
}

const EARTH_RADIUS_KM = 6371;
const MIN_RANDOM_DISTANCE_KM = RANDOM_DISTANCE_KM / 10;
const RANDOM_DISTANCE_RANGE_KM = RANDOM_DISTANCE_KM * 1.5;

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

export function randomizePoint(startPoint) {
    const distance = Math.random() * RANDOM_DISTANCE_RANGE_KM + MIN_RANDOM_DISTANCE_KM;
    const bearing = Math.random() * 360;
    const endPointData = calculateDestinationPoint({ lat: startPoint.lat, lng: startPoint.lng }, bearing, distance);
    return L.latLng(endPointData.lat, endPointData.lng);
}

export function getPointAtDistance(coords, distance) {
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
            return L.latLng(from.lat + (to.lat - from.lat) * ratio, from.lng + (to.lng - from.lng) * ratio);
        }
        accumulatedDistance += segmentDistance;
    }

    return coords[coords.length - 1];
}

export function calculatePolylineDistance(coords) {
    let totalDistance = 0;
    if (!coords || coords.length < 2) {
        return totalDistance;
    }
    for (let i = 0; i < coords.length - 1; i++) {
        totalDistance += coords[i].distanceTo(coords[i + 1]);
    }
    return totalDistance;
}

export function getBearing(latLng1, latLng2) {
    const lat1 = toRadians(latLng1.lat);
    const lon1 = toRadians(latLng1.lng);
    const lat2 = toRadians(latLng2.lat);
    const lon2 = toRadians(latLng2.lng);

    const deltaLon = lon2 - lon1;

    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

    let bearing = toDegrees(Math.atan2(y, x));
    if (bearing < 0) {
        bearing += 360;
    }
    return bearing;
}


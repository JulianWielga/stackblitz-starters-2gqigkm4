import { createRandomRoute } from './route.js';

export function initializeMap() {
    const map = L.map('map');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    createRandomRoute(map);
}
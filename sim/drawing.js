export function drawDot(map, position, color) {
    L.circleMarker(position, {
        radius: 4,
        fillColor: color,
        color: "#333333",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map);
}

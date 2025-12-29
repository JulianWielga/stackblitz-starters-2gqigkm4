import { drawDot } from "./sim/drawing.js";

export function readDataMessage(sim, data) {
    console.debug(data);
    console.log(sim);
    drawDot(sim.map, data, "rgb(0 0 255)");
}

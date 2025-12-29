import { postData } from "./postData.js";
import { drawDot } from "./sim/drawing.js";

export function getCarAction(map, carId) {
    return async (position, speed_kmh) => {
        try {
            await postData(carId, position, speed_kmh);
            drawDot(map, position, "rgb(0 255 0)");
        } catch (e) {
            console.debug({ ...position, kph: speed_kmh });
            drawDot(map, position, "rgb(255 0 0 / .5)");
        }
    };
}

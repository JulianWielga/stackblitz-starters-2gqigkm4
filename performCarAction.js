import {postData} from "./postData.js";
import {drawDot} from "./sim/drawing.js";
import {generateHash} from "./utils.js";

const carId = generateHash();
export async function performCarAction(map, position, speed_kmh) {
    try {
        await postData(carId, position, speed_kmh)
        drawDot(map, position, "#00ff00");
    } catch (e) {
        drawDot(map, position, "#ff0000");
    }
}

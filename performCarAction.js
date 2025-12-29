import {postData} from "./postData.js";
import {drawDot} from "./sim/drawing.js";
import {generateHash} from "./utils.js";

const carId = generateHash();
export async function performCarAction(map, position, speed_kmh) {
    try {
        await postData(carId, position, speed_kmh)
        drawDot(map, position, "rgb(0 255 0)");
    } catch (e) {
        console.debug(e, {...position}, speed_kmh);
        drawDot(map, position, "rgb(255 0 0 / .5)");
    }
}

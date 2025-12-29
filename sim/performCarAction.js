import {postData} from "./postData.js";
import {drawDot} from "./drawing.js";

export async function performCarAction(map, position, speed_kmh) {
    try {
        await postData(position, speed_kmh)
        drawDot(map, position, "#00ff00");
    } catch (e) {
        drawDot(map, position, "#ff0000");
    }
}

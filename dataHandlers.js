import { postData } from "./postData.js";
import { drawDot } from "./sim/drawing.js";

export const getCarUpdateHandler =
    ({ map, carId }) =>
    async (position, speed_kmh) => {
        try {
            await postData(carId, position, speed_kmh);
            drawDot(map, position, "rgb(0 255 0)");
        } catch (e) {
            console.debug({ ...position, kph: speed_kmh });
            drawDot(map, position, "rgb(255 0 0)");
        }
    };

export const getDataMessageHandler =
    ({ map, carId }) =>
    ({ id, lat, lng }) => {
        if (id === carId) {
            console.debug({ id, lat, lng });
            drawDot(map, { lat, lng }, "rgb(0 0 255)");
        }
    };

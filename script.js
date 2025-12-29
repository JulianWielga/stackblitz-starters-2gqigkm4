import { initializeMap } from "./sim/map.js";
import { initializeConnection } from "./connection.js";
import { getCarUpdateHandler, getDataMessageHandler } from "./dataHandlers.js";

const sim = initializeMap((sim) => getCarUpdateHandler(sim));
initializeConnection(getDataMessageHandler(sim));

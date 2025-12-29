import { initializeMap } from "./sim/map.js";
import { initializeConnection } from "./connection.js";
import { getCarAction } from "./getCarAction.js";

const sim = initializeMap(getCarAction);
initializeConnection(sim);
